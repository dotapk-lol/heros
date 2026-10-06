// Three real vertical slices. Definitions are captured per sealed registry;
// neither a global coefficient map nor a private Engine is accepted.
import {codeIdentity} from '../contract/code-identity.js';
import {EMPTY_STATE_SCHEMA} from '../contract/state-schema.js';
function near(ctx,cast,m){const f=ctx.actor(cast.owner),t=ctx.actor(cast.target);return Math.abs(t.x-f.x)<=(m.range_wu||m.radius_wu)+22&&(m.height!=='ground'||t.y<45);}
const metadata=(id,requires,activate)=>({behaviorId:id,revision:'1.0.0',...codeIdentity(['rules/legacy-three.js']),requires,activate,stateSchema:EMPTY_STATE_SCHEMA});
export const legacyThreeFactories=Object.freeze([
 {heroId:5,slot:3,create:({definition})=>{const m=definition.mvp;return metadata('legacy/anti_mage_mana_void',['damage','cue','target-route'],(ctx,cast)=>{
  if(!near(ctx,cast,m))return;
  const route=ctx.target.route({owner:cast.owner,target:cast.target,abilityId:definition.id,range:m.range_wu,reflectable:true,reflected:cast.reflected});
  if(!route.accepted)return;
  const t=ctx.actor(route.target),amount=route.reflected?(t.maxMp-t.mp)*m.missing_mana_multiplier:Math.min(m.damage_cap,m.damage+(t.maxMp-t.mp)*m.missing_mana_multiplier);
  ctx.damage({source:route.owner,target:route.target,abilityId:definition.id,amount,type:m.damage_type,blockable:m.blockable,stunSeconds:m.stun_s,hitstunSeconds:m.hitstun_s,reflected:route.reflected});
  ctx.cue({kind:route.reflected?'reflect':'targeted-hit',abilityId:definition.id,actor:route.owner,target:route.target});
  if(route.reflected)return {reflected:true};
 });}},
 {heroId:9,slot:1,create:({definition})=>{const m=definition.mvp;return metadata('legacy/lion_hex',['control','cue','target-route'],(ctx,cast)=>{
  if(!near(ctx,cast,m))return;
  const route=ctx.target.route({owner:cast.owner,target:cast.target,abilityId:definition.id,range:m.range_wu,reflectable:true,reflected:cast.reflected});
  if(!route.accepted)return;
  if(route.reflected||!ctx.actor(route.target).guarding)ctx.control.apply({owner:route.owner,target:route.target,abilityId:definition.id,key:'hex',type:'hex',duration:m.duration_s,pierces:false,dispel:'strong'});
  if(route.reflected){ctx.cue({kind:'reflect',abilityId:definition.id,actor:route.owner,target:route.target});return {reflected:true};}
 });}},
 {heroId:5,slot:1,create:({definition})=>{const m=definition.mvp;return metadata('legacy/anti_mage_blink',['motion-request','protect','cue'],(ctx,cast)=>{
  const f=ctx.actor(cast.owner);
  ctx.cue({kind:'blink',abilityId:definition.id,actor:cast.owner});
  ctx.motion({actor:cast.owner,abilityId:definition.id,castId:cast.castId,kind:'blink',destinationX:f.x+cast.direction*m.range_wu,speed:0,duration:0});
  ctx.protect({actor:cast.owner,abilityId:definition.id,kind:'invulnerability',duration:4/60});
 });}}
]);
