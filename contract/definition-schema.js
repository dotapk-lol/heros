import {heroes} from '../content/index.js';
const templates=new Map(heroes.flatMap(h=>h.abilities.map(a=>[a.id,a.mvp])));
// All numerical recipe values are finite/bounded. Named timing/damage/resource
// fields have nonnegative ranges; negative armor/contributions stay legitimate.
const NONNEG=/^(damage|damage_cap|dot_damage|execute_damage|mana|cooldown_s|duration_s|range_wu|radius_wu|startup_frames|recovery_frames|active_frames|ticks|tick_interval_s|stun_s|stun_cap_s|root_s|silence_s|slow_pct|slow_duration_s|charges|charge_restore_s|charge_max_s|mana_burn|mana_burn_pct|mana_damage_ratio|projectile_speed_wu_s|missing_mana_multiplier|critChance|critMultiplier|evasion|hitstun_s|buff_duration_s|stack_damage|stack_duration_s|max_stacks|burst_cap|burstInterval|lost_hp_multiplier|travelDuration|tracking_break_wu|arming_s|internal_cooldown_s|wall_height_wu|wall_bind_distance_wu|wall_bind_stun_s|distance_damage_per_100|damageOverTime|mana_per_second|heal_total|self_damage_per_tick|mana_drain_per_tick|wave_speed_wu_s|walkSpeed|explosionMin|explosionMax|explosionRadius)$/;
function numbers(value,path=[]){if(typeof value==='number'){if(!Number.isFinite(value)||Math.abs(value)>1e7)throw Error('Out-of-range coefficient '+path.join('.'));const k=path.at(-1);if(NONNEG.test(k)&&value<0)throw Error('Negative coefficient '+path.join('.'));}else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))numbers(v,[...path,k]);}
export function validateRecipe(a,resources){
 const m=a.mvp,template=templates.get(a.id);numbers(m);
 function shape(expected,actual,path='mvp'){
  if(expected===null){if(actual!==null)throw Error('Invalid recipe shape '+path);return;}
  if(Array.isArray(expected)){if(!Array.isArray(actual)||actual.length!==expected.length)throw Error('Invalid coefficient array '+path);expected.forEach((v,i)=>shape(v,actual[i],path+'.'+i));return;}
  if(typeof expected==='object'){if(!actual||typeof actual!=='object'||Array.isArray(actual))throw Error('Invalid recipe shape '+path);for(const [k,v] of Object.entries(expected))shape(v,actual[k],path+'.'+k);return;}
  if(typeof expected!==typeof actual)throw Error('Invalid coefficient type '+path);
 }
 if(!template)throw Error('Unknown recipe identity');shape(template,m);
 if(m.effect!==template.effect||m.input!==template.input||m.passive!==template.passive)throw Error('Replacement cannot change host admission family');
 for(const k of Object.keys(m))if(NONNEG.test(k)&&typeof m[k]!=='number')throw Error('Invalid numerical coefficient '+k);
 for(const k of ['mana','cooldown_s','range_wu','startup_frames','recovery_frames'])if(!Number.isFinite(m[k])||m[k]<0)throw Error('Invalid skill coefficient '+k);
 for(const k of ['cooldown_s','startup_frames','recovery_frames'])if(m[k]>3600)throw Error('Timing coefficient exceeds host snapshot bounds');
 if(m.damage_type!==undefined&&!['physical','magical','pure'].includes(m.damage_type)&&!(m.damage_type==='none'&&(m.damage===undefined||m.damage===0)))throw Error('Invalid damage type');
 if(m.height!==undefined&&!['both','ground'].includes(m.height))throw Error('Invalid skill height');
 for(const k of ['passive','toggle','blockable','reflectable','interruptible','invulnerable_active','debuffImmune'])if(m[k]!==undefined&&typeof m[k]!=='boolean')throw Error('Invalid boolean coefficient '+k);
 for(const k of ['critChance','evasion','execute_threshold_pct','mana_burn_pct'])if(m[k]!==undefined&&(!Number.isFinite(m[k])||m[k]<0||m[k]>1))throw Error('Invalid probability/fraction '+k);
 if(m.tick_interval_s!==undefined&&m.tick_interval_s<0||m.charges>0&&!(m.charge_restore_s>0)||m.explosionMin!==undefined&&m.explosionMax!==undefined&&m.explosionMin>m.explosionMax)throw Error('Invalid dependent recipe fields');
 if(a.id==='anti_mage_mana_void'){
  for(const k of ['damage','damage_cap','missing_mana_multiplier','stun_s','hitstun_s'])if(!Number.isFinite(m[k])||m[k]<0)throw Error('Mana Void coefficient '+k);
  if(!['physical','magical','pure'].includes(m.damage_type)||m.stun_s>60||m.hitstun_s>60||!resources||!Number.isFinite(resources.maxMp)||resources.maxMp*m.missing_mana_multiplier>1e7)throw Error('Mana Void derived effect out of host bounds');
 }
 if(a.id==='lion_hex'&&(!Number.isFinite(m.duration_s)||m.duration_s<0||m.duration_s>60))throw Error('Hex duration out of range');
 // Private arena x is 45..1155 and the motion port accepts destinations <=10000.
 if(a.id==='anti_mage_blink'&&(!Number.isFinite(m.range_wu)||m.range_wu<0||m.range_wu>8845))throw Error('Blink displacement out of range');
 return true;
}
