// SPDX-License-Identifier: MIT
import {actor,begin,belongs,clampX,damage,exact,handle,live,machine,nonnegative,ordinal,parameters,result,status} from './common.mjs';
export function createSwap(definition){const id=definition.id,p=parameters(definition,['damage','damage_reduction_duration']);
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','statusHandle','remaining','lastCommit'])&&(s.statusHandle===null||typeof s.statusHandle==='string')&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=p.damage&&Number.isSafeInteger(s.lastCommit)&&s.lastCommit>=0;
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',statusHandle:null,remaining:0,lastCommit:0};
   const commands=[];if(!e.target.invulnerable)commands.push({kind:'atomic-swap',abilityId:id,castId:c.castId,owner:c.owner,target:c.target,ownerDestinationX:clampX(e.target.x),targetDestinationX:clampX(e.owner.x),interruptTarget:true,collisionPolicy:'v8-move'});
   commands.push(damage(id,s,p.damage,'magical'));
   if(!e.owner.invulnerable)commands.push(status(id,s,id,p.damage_reduction_duration,{shield:p.damage},{to:s.owner,positive:true}));
   else s.phase='closed';
   return result(s,commands);
  },
  statusReceipt(s,e){if(!live(s,e)||s.phase!=='waiting')return result(s);if(e.accepted){s.statusHandle=handle(e.handle);s.remaining=p.damage;s.phase='active';}else{s.phase='closed';}return result(s);},
  projectPostMitigation(s,e){if(!live(s,e)||s.phase!=='active'||!e.effective||actor(e.target).id!==s.owner)return result(s);const debit=Math.min(nonnegative(e.amount),s.remaining);return result(s,[{kind:'damage-projection',abilityId:id,amount:e.amount-debit,shieldDebit:debit,statusHandle:s.statusHandle}]);},
  shieldCommitted(s,e){if(!live(s,e)||e.handle!==s.statusHandle)return result(s);ordinal(e.ordinal);if(e.ordinal<=s.lastCommit)return result(s);nonnegative(e.amount);if(e.amount>s.remaining)throw Error('Shield cannot grow/overdraw');s.remaining-=e.amount;s.lastCommit=e.ordinal;return result(s);},
  statusRemoved(s,e){if(!live(s,e)||e.handle!==s.statusHandle)return result(s);s.phase='closed';s.statusHandle=null;s.remaining=0;return result(s);},
  death(s,e){if(!s||e.actor!==s.owner)return result(s);s.phase='closed';s.statusHandle=null;s.remaining=0;return result(s);}
 });
}
