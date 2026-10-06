import {BATTLE_ABI,codeIdentity,EMPTY_STATE_SCHEMA} from '../index.js';
// Reviewed static plugin example: captures validated immutable parameters.
export function blinkRangeFactory({rangeScale=1}={}){
 return {abiVersion:BATTLE_ABI,parameters:{rangeScale},create({hero,definition,parameters}){
  if(hero.registryNumericId!==5||definition.id!=='anti_mage_blink')throw Error('Blink plugin identity mismatch');
  if(Object.keys(parameters).join(',')!=='rangeScale'||!Number.isFinite(parameters.rangeScale)||parameters.rangeScale<=0||parameters.rangeScale>2)throw Error('Invalid blink range scale');
  const range=definition.mvp.range_wu*parameters.rangeScale;
  if(!Number.isFinite(range)||range<0||range>8845)throw Error('Unsupported blink range');
  return {behaviorId:'example/blink-range',revision:'1.1.0',...codeIdentity(['examples/blink-range.js']),requires:['motion-request','protect','cue'],stateSchema:EMPTY_STATE_SCHEMA,
   activate(ctx,cast){const actor=ctx.actor(cast.owner);ctx.cue({kind:'blink',abilityId:definition.id,actor:cast.owner});ctx.motion({actor:cast.owner,abilityId:definition.id,castId:cast.castId,kind:'blink',destinationX:actor.x+cast.direction*range,speed:0,duration:0});ctx.protect({actor:cast.owner,abilityId:definition.id,kind:'invulnerability',duration:4/60});}
  };
 }};
}
export function installBlinkRange(registry,parameters){
 const definition=registry.definition(5).abilities[1];
 return registry.replaceSkill(5,1,{definition,factory:blinkRangeFactory(parameters)},{abilityId:definition.id,revision:'1.0.0'});
}
