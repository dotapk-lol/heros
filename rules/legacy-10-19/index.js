import {BATTLE_ABI,codeIdentity,EMPTY_STATE_SCHEMA} from '../../index.js';

// Only executable, complete slices are registered. Remaining slots are described
// in the handoff; there is no damage fallback for unsupported host semantics.
export const IMPLEMENTED_SLOTS=Object.freeze([[13,0],[13,1],[13,3],[17,1]].map(Object.freeze));
const SOURCES=['rules/legacy-10-19/index.js'];
function bounded(value,name,max=1e7){
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max)throw Error('Invalid legacy coefficient: '+name);
 return value;
}
export function legacyFactory(heroId,slot,{damageMultiplier=1}={}){
 if(!IMPLEMENTED_SLOTS.some(([h,s])=>h===heroId&&s===slot))throw Error('Unsupported legacy slice');
 return {abiVersion:BATTLE_ABI,parameters:{heroId,slot,damageMultiplier},create({hero,definition,parameters}){
  const {heroId,slot}=parameters;
  if(hero.registryNumericId!==heroId||hero.abilities[slot].id!==definition.id)throw Error('Wrong legacy identity');
  if(Object.keys(parameters).sort().join(',')!=='damageMultiplier,heroId,slot')throw Error('Unknown legacy execution parameter');
  const scale=bounded(parameters.damageMultiplier,'damageMultiplier');
  const m=definition.mvp;
  bounded(m.range_wu,'range_wu',heroId===17?8845:1e7);
  bounded(m.radius_wu,'radius_wu');
  const common={behaviorId:'legacy-10-19/'+definition.id,revision:'1.0.0',
   ...codeIdentity(SOURCES),stateSchema:EMPTY_STATE_SCHEMA};
  if(heroId===17){
   return {...common,requires:['motion-request','protect','cue'],activate(ctx,cast){
    const f=ctx.actor(cast.owner);
    ctx.cue({kind:'blink',abilityId:definition.id,actor:cast.owner});
    ctx.motion({actor:cast.owner,abilityId:definition.id,castId:cast.castId,kind:'blink',destinationX:f.x+cast.direction*m.range_wu,speed:0,duration:0});
    ctx.protect({actor:cast.owner,abilityId:definition.id,kind:'invulnerability',duration:4/60});
   }};
  }
  bounded(m.damage,'damage');bounded(m.damage*scale,'scaled damage');
  bounded(m.stun_s,'stun_s',60);bounded(m.hitstun_s,'hitstun_s',60);
  if(!['physical','magical','pure'].includes(m.damage_type))throw Error('Invalid legacy damage type');
  return {...common,requires:slot===1?['damage']:['damage','target-route','cue'],activate(ctx,cast){
   const f=ctx.actor(cast.owner),t=ctx.actor(cast.target);
   // Ground Bolt uses committed aim; Arc/Wrath use current source distance.
   const presentation=slot===1?{kind:'ground-pillar',aimX:cast.aimX,radius:m.radius_wu,lifeSeconds:.6}:null;
   const distance=Math.abs(t.x-(slot===1?cast.aimX:f.x));
   if(distance>(slot===1?m.radius_wu:(m.range_wu||m.radius_wu))+22||m.height==='ground'&&t.y>=45)return presentation?{presentation}:undefined;
   let owner=cast.owner,target=cast.target,reflected=false;
   if(slot!==1){
    // Production generic counter reflects hit-family spells even when the
    // recipe reflectable field is false. Preserve that arena behavior.
    const route=ctx.target.route({owner,target,abilityId:definition.id,range:m.range_wu||m.radius_wu,reflectable:true,reflected:cast.reflected});
    if(!route.accepted)return;
    ({owner,target,reflected}=route);
   }
   ctx.damage({source:owner,target,abilityId:definition.id,amount:m.damage*scale,type:m.damage_type,blockable:m.blockable,stunSeconds:m.stun_s,hitstunSeconds:m.hitstun_s,reflected});
   if(presentation)return {presentation};
   ctx.cue({kind:reflected?'reflect':'targeted-hit',abilityId:definition.id,actor:owner,target});
   if(reflected)return {reflected:true};
  }};
 }};
}
export function registerLegacy10To19(registry,parameters={}){
 for(const [heroId,slot] of IMPLEMENTED_SLOTS)registry.registerFactory(heroId,slot,legacyFactory(heroId,slot,parameters));
 return registry;
}
