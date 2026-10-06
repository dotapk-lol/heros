// SPDX-License-Identifier: MIT
import {actor,begin,belongs,clampX,exact,handle,live,machine,ordinal,parameters,result,status} from './common.mjs';
export function createGaze(definition){const id=definition.id,p=parameters(definition,['channel_duration','mana_drain']);
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','channelHandle','lastPulse'])&&(s.channelHandle===null||typeof s.channelHandle==='string')&&Number.isSafeInteger(s.lastPulse)&&s.lastPulse>=0&&s.lastPulse<=Math.floor(p.channel_duration/.25+1e-8);
 const end=(s,reason)=>{const handle=s.channelHandle;s.phase='closed';s.channelHandle=null;return result(s,[{kind:'end-channel-area',abilityId:id,castId:s.castId,channelHandle:handle,reason}]);};
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',channelHandle:null,lastPulse:0};return result(s,[{kind:'begin-channel-area',abilityId:id,castId:s.castId,owner:s.owner,target:s.target,duration:p.channel_duration,interval:.25,radius:600*.55,followOwner:true,lockMovement:true,lockAttacks:true,lockCasts:true,cancellation:['control','input-cancel','movement','action','silence'],handler:'gazePulse'}]);},
  channelReceipt(s,e){if(!live(s,e)||s.phase!=='waiting')return result(s);if(e.accepted){s.channelHandle=handle(e.handle);s.phase='active';}else s.phase='closed';return result(s);},
  gazePulse(s,e){if(!live(s,e)||s.phase!=='active'||e.handle!==s.channelHandle)return result(s);ordinal(e.ordinal);if(e.ordinal<=s.lastPulse)return result(s);const owner=actor(e.owner),target=actor(e.target);if(owner.id!==s.owner||target.id!==s.target)throw Error('Gaze actor mismatch');if(e.channelAliveBeforePulse===false)return end(s,'expired');if(!owner.alive||!e.tokenValid)return end(s,e.reason||'interrupted');
   if(e.ordinal>Math.floor(p.channel_duration/.25+1e-8))throw Error('Gaze pulse beyond duration');s.lastPulse=e.ordinal;
   if(!target.alive||target.invulnerable||target.debuffImmune||Math.abs(owner.x-target.x)>600*.55)return result(s);
   const destination=target.x+Math.sign(owner.x-target.x)*Math.min(Math.abs(owner.x-target.x),25);
   return result(s,[{kind:'transfer-mana',abilityId:id,source:s.target,target:s.owner,requested:target.mp*p.mana_drain/100*.25},status(id,s,id,.25,{stun:true},{dispel:'strong'}),{kind:'control',abilityId:id,owner:s.owner,target:s.target,type:'stun',duration:.25,pierces:false,dispel:'strong'},{kind:'bounded-pull',abilityId:id,castId:s.castId,actor:s.target,destinationX:clampX(destination),maxDistance:25,rootPolicy:'v8-forced-motion',collisionPolicy:'v8-move'}]);},
  interrupted(s,e){if(!live(s,e))return result(s);return end(s,e.reason||'interrupted');},
  expired(s,e){if(!live(s,e)||e.handle!==s.channelHandle)return result(s);return end(s,'expired');},
  death(s,e){if(!s||e.actor!==s.owner||s.phase==='closed')return result(s);return end(s,'owner-dead');}
 });
}
