// SPDX-License-Identifier: MIT
import {actor,begin,belongs,damage,exact,handle,live,machine,ordinal,parameters,result,status} from './common.mjs';
export function createRupture(definition){const id=definition.id,p=parameters(definition,['duration','hp_pct','movement_damage_pct','damage_cap_amount']);
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','statusHandle','lastX','lastObservation'])&&(s.statusHandle===null||typeof s.statusHandle==='string')&&Number.isFinite(s.lastX)&&s.lastX>=0&&s.lastX<=1200&&Number.isSafeInteger(s.lastObservation)&&s.lastObservation>=0;
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive||!e.target.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',statusHandle:null,lastX:e.target.x,lastObservation:0};
   return result(s,[damage(id,s,e.target.hp*p.hp_pct/100,'pure'),status(id,s,id,p.duration,{rupture:p.movement_damage_pct/100,damageCap:p.damage_cap_amount},{pierces:true,dispel:'none'})]);},
  statusReceipt(s,e){if(!live(s,e)||s.phase!=='waiting')return result(s);if(e.accepted){s.statusHandle=handle(e.handle);s.phase='active';}else s.phase='closed';return result(s);},
  movementObserved(s,e){if(!live(s,e)||s.phase!=='active'||e.handle!==s.statusHandle)return result(s);ordinal(e.ordinal);if(e.ordinal<=s.lastObservation)return result(s);const target=actor(e.target);if(target.id!==s.target)throw Error('Rupture target mismatch');
   const distance=Math.abs(target.x-s.lastX)/.55;s.lastX=target.x;s.lastObservation=e.ordinal;
   const amount=distance*(p.movement_damage_pct/100);
   // Native positive Rupture emits even a stationary zero packet (hit bookkeeping).
   return result(s,e.effective&&target.alive&&!target.invulnerable&&distance<=p.damage_cap_amount&&p.movement_damage_pct>0?[damage(id,s,amount,'pure')]:[]);},
  statusRemoved(s,e){if(!live(s,e)||e.handle!==s.statusHandle)return result(s);s.phase='closed';s.statusHandle=null;return result(s);},
  death(s,e){if(!s||e.actor!==s.target)return result(s);s.phase='closed';s.statusHandle=null;return result(s);}
 });
}
