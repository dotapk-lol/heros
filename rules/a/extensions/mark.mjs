// SPDX-License-Identifier: MIT
import {actor,begin,belongs,clampX,exact,handle,live,machine,parameters,result,status} from './common.mjs';
export function createMark(definition){const id=definition.id,p=parameters(definition,['duration']);
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','statusHandle','returnX'])&&(s.statusHandle===null||typeof s.statusHandle==='string')&&Number.isFinite(s.returnX)&&s.returnX>=45&&s.returnX<=1155;
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive||e.target.invulnerable||e.target.debuffImmune||!e.target.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',statusHandle:null,returnX:clampX(e.target.x)};return result(s,[status(id,s,id,p.duration,{}, {dispel:'none'})]);},
  statusReceipt(s,e){if(!live(s,e)||s.phase!=='waiting')return result(s);if(e.accepted){s.statusHandle=handle(e.handle);s.phase='active';}else s.phase='closed';return result(s);},
  statusExpiring(s,e){if(!live(s,e)||e.handle!==s.statusHandle)return result(s);const target=actor(e.target);if(target.id!==s.target)throw Error('Mark target mismatch');const commands=e.effective&&target.alive&&!target.invulnerable?[{kind:'forced-return',abilityId:id,castId:s.castId,actor:s.target,destinationX:s.returnX,rootPolicy:'v8-forced-motion',collisionPolicy:'v8-move'}]:[];s.phase='closed';s.statusHandle=null;return result(s,commands);},
  statusRemoved(s,e){if(!live(s,e)||e.handle!==s.statusHandle)return result(s);s.phase='closed';s.statusHandle=null;return result(s);},
  death(s,e){if(!s||e.actor!==s.target)return result(s);s.phase='closed';s.statusHandle=null;return result(s);}
 });
}
