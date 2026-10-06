// SPDX-License-Identifier: MIT
import {actor,begin,belongs,damage,exact,handle,live,machine,nonnegative,ordinal,parameters,result} from './common.mjs';
export function createExorcism(definition){const id=definition.id,p=parameters(definition,['AbilityDuration','spirits','ghost_spawn_rate','spirit_speed','give_up_distance','average_damage','heal_percent']);if(!Number.isSafeInteger(p.spirits)||p.spirits>64||p.ghost_spawn_rate<=0)throw Error('Invalid spirit profile');
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','swarmHandle','lastContact','actual','pending'])&&(s.swarmHandle===null||typeof s.swarmHandle==='string')&&Number.isSafeInteger(s.lastContact)&&s.lastContact>=0&&Number.isFinite(s.actual)&&s.actual>=0&&s.actual<=1000000&&Array.isArray(s.pending)&&s.pending.length<=64&&s.pending.every(n=>Number.isSafeInteger(n)&&n>=1&&n<=s.lastContact)&&new Set(s.pending).size===s.pending.length;
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',swarmHandle:null,lastContact:0,actual:0,pending:[]},commands=[];
   if(old&&old.phase!=='closed')commands.push({kind:'end-returning-spirits',abilityId:id,castId:old.castId,handle:old.swarmHandle,reason:'replaced'});
   commands.push({kind:'begin-returning-spirits',abilityId:id,castId:s.castId,owner:s.owner,target:s.target,duration:p.AbilityDuration,maxSpirits:p.spirits,spawnInterval:p.ghost_spawn_rate,speed:p.spirit_speed*.55,giveUpDistance:p.give_up_distance*.55,returnOnTargetDead:true,contactHandler:'hostileArrival',expiryHandler:'expired'});
   return result(s,commands);},
  swarmReceipt(s,e){if(!live(s,e)||s.phase!=='waiting')return result(s);if(e.accepted){s.swarmHandle=handle(e.handle);s.phase='active';}else s.phase='closed';return result(s);},
  hostileArrival(s,e){if(!live(s,e)||s.phase!=='active'||e.handle!==s.swarmHandle)return result(s);ordinal(e.ordinal);if(e.ordinal<=s.lastContact)return result(s);const owner=actor(e.owner),target=actor(e.target);if(owner.id!==s.owner||target.id!==s.target)throw Error('Spirit actor mismatch');
   s.lastContact=e.ordinal;if(!owner.alive||!target.alive)return result(s);if(s.pending.length>=64)throw Error('Too many uncommitted contacts');s.pending.push(e.ordinal);
   return result(s,[{...damage(id,s,p.average_damage,'physical'),receiptHandler:'damageReceipt',receiptId:e.ordinal}]);},
  damageReceipt(s,e){if(!live(s,e)||!s.pending.includes(e.ordinal))return result(s);const actual=nonnegative(e.receipt.actual);if(!e.receipt.accepted&&actual>0)throw Error('Rejected damage cannot credit healing');s.actual+=actual;if(s.actual>1000000)throw Error('Actual total exceeds source snapshot bound');s.pending=s.pending.filter(n=>n!==e.ordinal);return result(s);},
  expired(s,e){if(!live(s,e)||e.handle!==s.swarmHandle)return result(s);if(s.pending.length)throw Error('Expiry must follow contact receipt commits');const owner=actor(e.owner);if(owner.id!==s.owner)throw Error('Spirit owner mismatch');const actual=s.actual;s.phase='closed';s.swarmHandle=null;s.actual=0;
   return result(s,owner.alive?[{kind:'heal',abilityId:id,source:s.owner,target:s.owner,amount:actual*p.heal_percent/100}]:[]);},
  death(s,e){if(!s||e.actor!==s.owner||s.phase==='closed')return result(s);const swarm=s.swarmHandle;s.phase='closed';s.swarmHandle=null;s.actual=0;s.pending=[];return result(s,[{kind:'end-returning-spirits',abilityId:id,castId:s.castId,handle:swarm,reason:'owner-dead'}]);}
 });
}
