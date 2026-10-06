// SPDX-License-Identifier: MIT
import {actor,begin,belongs,damage,exact,handle,live,machine,ordinal,parameters,result,status} from './common.mjs';
export function createDragon(definition){const id=definition.id,p=parameters(definition,['duration','bonus_attack_range','bonus_ability_cast_range','bonus_movement_speed','corrosive_duration','corrosive_damage_per_second','frost_duration','frost_bonus_movement_speed','frost_bonus_attack_speed']);
 const valid=s=>s===null||belongs(s,id)&&exact(s,['abilityId','castId','owner','target','reflected','phase','formHandle','profileHandle','lastAttack','corrosion'])&&(s.formHandle===null||typeof s.formHandle==='string')&&(s.profileHandle===null||typeof s.profileHandle==='string')&&Number.isSafeInteger(s.lastAttack)&&s.lastAttack>=0&&Array.isArray(s.corrosion)&&s.corrosion.length<=2&&s.corrosion.every(x=>exact(x,['target','handle','ordinal'])&&[0,1].includes(x.target)&&typeof x.handle==='string'&&Number.isSafeInteger(x.ordinal)&&x.ordinal>=0&&x.ordinal<=Math.floor(p.corrosive_duration+1e-8))&&new Set(s.corrosion.map(x=>x.target)).size===s.corrosion.length;
 return machine(id,p,valid,{
  begin(old,e){const c=begin(e);if(!e.accepted||!e.owner.alive)return result(old);if(old?.castId===c.castId)return result(old);
   const s={...c,abilityId:id,phase:'waiting',formHandle:null,profileHandle:null,lastAttack:old?.lastAttack||0,corrosion:old?.corrosion||[]},commands=[];
   if(!e.owner.invulnerable)commands.push(status(id,s,id,p.duration,{attackRange:p.bonus_attack_range*.55,moveFlat:p.bonus_movement_speed},{to:s.owner,positive:true,dispel:'none'}));
   // V8 adds the native attack-range buff even when positive pack status is denied.
   commands.push({kind:'begin-attack-range-profile',abilityId:id,castId:s.castId,actor:s.owner,attackRangeBonus:p.bonus_attack_range*.55,duration:p.duration});return result(s,commands);},
  formReceipt(s,e){if(!live(s,e))return result(s);s.formHandle=e.accepted?handle(e.handle):null;s.phase='active';return result(s);},
  profileReceipt(s,e){if(!live(s,e))return result(s);s.profileHandle=e.accepted?handle(e.handle):null;s.phase='active';return result(s);},
  projectAbilityRange(s,e){if(!live(s,e)||!s.formHandle||!e.formEffective)return result(s);return result(s,[{kind:'cast-range-contribution',abilityId:id,actor:s.owner,flat:p.bonus_ability_cast_range*.55}]);},
  projectMovement(s,e){if(!live(s,e)||!s.formHandle||!e.formEffective)return result(s);return result(s,[{kind:'movement-contribution',abilityId:id,actor:s.owner,flat:p.bonus_movement_speed}]);},
  landedAttack(s,e){if(!s||!s.formHandle||!e.formPresent||!e.landed||e.secondary)return result(s);const owner=actor(e.owner),target=actor(e.target);if(owner.id!==s.owner)throw Error('Dragon owner mismatch');if(!owner.alive||!owner.passivesEnabled||!target.alive||target.invulnerable)return result(s);ordinal(e.ordinal);if(e.ordinal<=s.lastAttack)return result(s);s.lastAttack=e.ordinal;const c={...s,target:target.id},commands=[];
   if(!target.debuffImmune)commands.push({...status(id,c,id+'_corrosion',p.corrosive_duration,{}, {interval:1}),receiptHandler:'corrosionReceipt',receiptTarget:target.id});
   commands.push(status(id,c,id+'_frost',p.frost_duration,{moveSlow:p.frost_bonus_movement_speed/100,attackSlow:p.frost_bonus_attack_speed},{pierces:true}));return result(s,commands);},
  corrosionReceipt(s,e){if(!s||s.phase==='closed'&&e.accepted)return result(s);if(!e.accepted)return result(s);const h=handle(e.handle);if(![0,1].includes(e.target))throw Error('Invalid corrosion target');s.corrosion=s.corrosion.filter(x=>x.target!==e.target);s.corrosion.push({target:e.target,handle:h,ordinal:0});return result(s);},
  corrosionPulse(s,e){if(!s)return result(s);const record=s.corrosion.find(x=>x.handle===e.handle);if(!record)return result(s);ordinal(e.ordinal);if(e.ordinal<=record.ordinal)return result(s);if(e.ordinal>Math.floor(p.corrosive_duration+1e-8))throw Error('Corrosion pulse beyond source lifetime');record.ordinal=e.ordinal;
   const owner=actor(e.owner),target=actor(e.target);if(owner.id!==s.owner||target.id!==record.target)throw Error('Corrosion actor mismatch');return result(s,target.alive&&!target.invulnerable&&!target.debuffImmune&&e.effective?[damage(id,{...s,target:record.target},p.corrosive_damage_per_second,'magical')]:[]);},
  formExpired(s,e){if(!s||e.handle!==s.formHandle)return result(s);s.formHandle=null;return result(s);},
  profileExpired(s,e){if(!s||e.handle!==s.profileHandle)return result(s);s.profileHandle=null;return result(s);},
  statusRemoved(s,e){if(!s)return result(s);s.corrosion=s.corrosion.filter(x=>x.handle!==e.handle);if(e.handle===s.formHandle)s.formHandle=null;return result(s);},
  death(s,e){if(!s)return result(s);if(e.actor===s.owner){const h=s.profileHandle;s.phase='closed';s.formHandle=null;s.profileHandle=null;return result(s,h?[{kind:'end-attack-range-profile',abilityId:id,castId:s.castId,actor:s.owner,handle:h,reason:'owner-dead'}]:[]);}s.corrosion=s.corrosion.filter(x=>x.target!==e.actor);return result(s);}
 });
}
