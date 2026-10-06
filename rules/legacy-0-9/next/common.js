import {codeIdentity, EMPTY_STATE_SCHEMA} from '../../../index.js';

export function finite(value, name, max = 1e7, min = 0) {
  if (!Number.isFinite(value) || value < min || value > max) throw Error('Invalid draft coefficient/fact: ' + name);
  return value;
}
export function closed(value, keys, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) throw Error('Invalid closed draft ' + name);
}
export function recipeShape(m, extraKeys = []) {
  closed(m,['damage','damage_type','cooldown_s','mana','duration_s','range_wu','radius_wu','startup_frames','recovery_frames','active_frames','input','effect','ticks','tick_interval_s','stun_s','slow_pct','slow_duration_s','buff_value','knockback_wu','passive','height','blockable','reflectable','interruptible','projectile_speed_wu_s','hitstun_s','officialSemantic','charges','charge_restore_s','toggle',...extraKeys],'recipe');
  if(m.toggle||m.passive)throw Error('Draft does not admit toggle/passive cast family');
}
export function castFacts(event, definition, slot) {
  closed(event, ['owner','target','abilityId','slot','castId','direction','aimX','heldSeconds','reflected'], 'cast');
  if (![0,1].includes(event.owner) || event.target !== 1-event.owner || event.abilityId !== definition.id || event.slot !== slot || ![-1,1].includes(event.direction) || typeof event.castId !== 'string' || !event.castId.length || event.castId.length > 128 || typeof event.reflected !== 'boolean') throw Error('Invalid draft cast identity');
  finite(event.aimX, 'aimX', 10000, -10000); finite(event.heldSeconds, 'heldSeconds', 60);
}
export function metadata(definition, file, requires) {
  return {behaviorId:'legacy-0-9-next/'+definition.id, revision:'0.1.0', ...codeIdentity(['rules/legacy-0-9/next/common.js', 'rules/legacy-0-9/next/'+file]), stateSchema:EMPTY_STATE_SCHEMA, requires};
}
export function grant(ctx, owner, definition, key, values, duration) {
  return ctx.status.apply({owner,target:owner,abilityId:definition.id,key,duration,polarity:'positive',dispel:'none',pierces:false,values});
}
export function near(ctx, cast, radius, height, parameters) {
  const f=ctx.actor(cast.owner), t=ctx.actor(cast.target);
  return Math.abs(t.x-f.x)<=radius+parameters.bodyPadding && (height!=='ground'||t.y<parameters.groundCutoff);
}
export function geometry(parameters, extras = []) {
  closed(parameters, ['bodyPadding','groundCutoff',...extras], 'execution parameters');
  finite(parameters.bodyPadding,'bodyPadding',100);finite(parameters.groundCutoff,'groundCutoff',1000);
}
export function damageRecipe(m) {
  if (!['physical','magical','pure'].includes(m.damage_type)) throw Error('Unsupported draft damage enum');
  finite(m.damage,'damage');finite(m.range_wu,'range_wu');finite(m.radius_wu,'radius_wu');
  finite(m.stun_s,'stun_s',60);finite(m.hitstun_s,'hitstun_s',60);
  for (const key of ['root_s','silence_s','slow_pct','knockback_wu','pull_to_distance','vulnerability_physical','attack_damage_debuff','selfReflection','missing_mana_multiplier','execute_threshold_pct','chip']) if (m[key]) throw Error('Unimplemented draft dependent effect: '+key);
}
export function damage(ctx, definition, source, target, reflected = false) {
  const m=definition.mvp;
  return ctx.damage({source,target,abilityId:definition.id,amount:m.damage,type:m.damage_type,blockable:m.blockable,stunSeconds:m.stun_s,hitstunSeconds:m.hitstun_s,reflected});
}
export function route(ctx, cast, definition) {
  const m=definition.mvp;
  return ctx.target.route({owner:cast.owner,target:cast.target,abilityId:definition.id,range:m.range_wu||m.radius_wu,reflectable:true,reflected:cast.reflected});
}
export function reflectedHit(ctx, definition, routed) {
  damage(ctx,definition,routed.owner,routed.target,true);
  ctx.cue({kind:'reflect',abilityId:definition.id,actor:routed.owner,target:routed.target});
  return {reflected:true};
}
