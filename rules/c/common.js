import {codeIdentity} from '../../contract/code-identity.js';
import {createCStateSchema,defaultOwner,JOB_OPS} from './state.js';
export {JOB_OPS} from './state.js';
// Owned rule metadata only. Actor facts and resource transactions stay in the host.
export const IDS=Object.freeze([94,99,104,106,117,121,124]);
export const EXTRA_IDS=Object.freeze([104,106,117,121,124]);
export const SCALE=.55,EPS=1e-8;
const caches=new WeakMap();
const baselines=new WeakMap();
const ops=Object.values(JOB_OPS).flat();
function group(definitions){let result=caches.get(definitions);if(!result){const coefficients=new Map(definitions.map(h=>[h.registryNumericId,h]));result=Object.freeze({coefficients,schema:createCStateSchema(),view:Object.freeze({get:id=>coefficients.get(id)})});caches.set(definitions,result);}return result;}
export const lookup=definitions=>group(definitions).view;
export function coefficient(definition,key){const value=definition.official?.params?.[key];if(!Number.isFinite(value))throw Error('Missing C coefficient '+definition.id+'.'+key);return value;}
const REQUIRED=Object.freeze({
 centaur_hoof_stomp:['radius','stomp_damage','stun_duration','windup_time'],centaur_double_edge:['edge_damage','strength_damage'],centaur_return:['return_damage','return_damage_str'],centaur_stampede:['duration','strength_damage','slow_duration','radius','slow_movement_speed'],
 skywrath_mage_arcane_bolt:['bolt_damage','int_multiplier','bolt_speed'],skywrath_mage_concussive_shot:['damage','speed','slow_duration','movement_speed_pct'],skywrath_mage_ancient_seal:['resist_debuff','seal_duration'],skywrath_mage_mystic_flare:['radius','duration','damage','damage_interval'],
 ember_spirit_searing_chains:['radius','duration','damage_per_second'],ember_spirit_sleight_of_fist:['attack_interval','radius','bonus_hero_damage'],ember_spirit_flame_guard:['duration','absorb_amount','damage_per_second','tick_interval','radius','shield_pct_absorb'],ember_spirit_fire_remnant:['damage','radius','AbilityCharges','AbilityChargeRestoreTime'],
 abyssal_underlord_firestorm:['radius','wave_damage','burn_damage','burn_duration','burn_interval','wave_interval','wave_count'],abyssal_underlord_pit_of_malice:['radius','pit_duration','pit_interval','pit_damage','ensnare_duration'],abyssal_underlord_atrophy_aura:['radius','damage_reduction_pct','bonus_damage_from_hero','bonus_damage_duration'],abyssal_underlord_dark_portal:['minimum_distance','warp_channel_duration','duration'],
 void_spirit_aether_remnant:['duration','activation_delay','remnant_watch_radius','remnant_watch_distance','pull_destination','impact_damage','pull_duration'],void_spirit_dissimilate:['phase_duration','first_ring_distance_offset','damage_radius','AbilityDamage'],void_spirit_resonant_pulse:['base_absorb_amount','radius','damage','absorb_per_hero_hit','buff_duration'],void_spirit_astral_step:['min_travel_distance','max_travel_distance','radius','movement_slow_pct','pop_damage_delay','pop_damage','AbilityCharges','AbilityChargeRestoreTime'],
 dawnbreaker_fire_wreath:['swipe_radius','swipe_damage','smash_stun_duration'],dawnbreaker_celestial_hammer:['hammer_damage','projectile_speed','burn_damage','move_slow','pause_duration'],dawnbreaker_luminosity:['bonus_damage','heal_pct'],dawnbreaker_solar_guardian:['base_heal','radius','base_damage','land_damage','land_stun_duration','max_offset_distance','airtime_duration','AbilityChannelTime','pulse_interval'],
 muerta_dead_shot:['damage','speed','impact_slow_duration','impact_slow_percent'],muerta_the_calling:['duration','aura_movespeed_slow','dead_zone_distance','hit_radius','damage','silence_duration'],muerta_gunslinger:['double_shot_chance'],muerta_pierce_the_veil:['duration','transform_duration','base_damage_percent']
});
export function validateConfig({hero,definition}){
 const signed=new Set(['resist_debuff','impact_slow_percent','aura_movespeed_slow','swipe_slow','rotation_direction']);
 const params=definition.official?.params;if(!params||typeof params!=='object'||!REQUIRED[definition.id])throw Error('Missing C coefficient schema');for(const key of REQUIRED[definition.id])if(!Number.isFinite(params[key]))throw Error('Missing C coefficient '+definition.id+'.'+key);
 for(const [key,value] of Object.entries(params))if(!Number.isFinite(value)||Math.abs(value)>1e6||(!signed.has(key)&&value<0))throw Error('Invalid C coefficient '+definition.id+'.'+key);
 for(const key of ['duration','damage_interval','tick_interval','wave_interval','burn_interval','AbilityChargeRestoreTime','attack_interval','phase_duration','projectile_speed','speed','bolt_speed','pulse_interval'])if(key in params&&params[key]<=0)throw Error('Invalid C positive interval '+definition.id+'.'+key);
 for(const key of ['shield_pct_absorb','double_shot_chance','movement_speed_pct','damage_reduction_pct','movement_slow_pct','move_slow','slow_movement_speed'])if(key in params&&(params[key]<0||params[key]>100))throw Error('Invalid C percentage '+definition.id+'.'+key);
 for(const key of ['impact_slow_percent','aura_movespeed_slow'])if(key in params&&(params[key]<-100||params[key]>0))throw Error('Invalid C signed slow '+definition.id+'.'+key);
 if('AbilityCharges'in params&&(!Number.isInteger(params.AbilityCharges)||params.AbilityCharges>16))throw Error('Invalid C charges');
 if(!hero.attributes18||['str','agi','int'].some(k=>!Number.isFinite(hero.attributes18[k])||hero.attributes18[k]<0||hero.attributes18[k]>1e6)||hero.move_speed<=0)throw Error('Invalid C hero attributes');
}
export const clamp=x=>Math.max(45,Math.min(1155,x));
export const near=(a,b,r)=>Math.abs(a.x-b.x)<=r*SCALE+22&&Math.abs(a.y-b.y)<130;
export const effective=(ctx,record)=>record.effective!==false&&(!record.pierces&&record.polarity==='negative'? !ctx.actor(record.target).debuffImmune:true);
export const statusRows=(ctx,target,key)=>ctx.status.query(target,key).filter(r=>effective(ctx,r));
export function sumStatus(ctx,target,name){let sum=0;for(const owner of [0,1])for(const row of statusRows(ctx,target,'x_atrophy_gain_'+owner))sum+=row.values[name]??0;return sum;}
export const hasVeil=(ctx,owner)=>[0,1].some(i=>statusRows(ctx,owner,'x_veil_'+i).some(r=>r.values.veil));
export function power(ctx,id,definitions,attackBonus){if(!Number.isFinite(attackBonus)||attackBonus<0)throw Error('Missing or invalid C host fact attackBonus');return lookup(definitions).get(ctx.actor(id).heroId).attack+attackBonus+sumStatus(ctx,id,'bonusDamage');}
function jsonToken(v,depth=0){return depth<6&&(v===null||typeof v==='boolean'||typeof v==='string'&&v.length<=160||Number.isFinite(v)||Array.isArray(v)&&v.length<=16&&v.every(x=>jsonToken(x,depth+1))||v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length<=16&&Object.entries(v).every(([k,x])=>k.length<=64&&jsonToken(x,depth+1)));}
export function read(ctx,definitions){const value=ctx.state.read()??{version:1,owners:[defaultOwner(),defaultOwner()]};const copy=structuredClone(value);baselines.set(copy,structuredClone(value));for(const i of [0,1]){const h=lookup(definitions).get(ctx.actor(i).heroId);if(!h||!EXTRA_IDS.includes(h.registryNumericId))continue;for(const a of h.abilities){const max=a.official?.params?.AbilityCharges;if(max>0&&!copy.owners[i].charges.some(c=>c.abilityId===a.id))copy.owners[i].charges.push({abilityId:a.id,count:max,max,restore:coefficient(a,'AbilityChargeRestoreTime'),pending:[]});}}return copy;}
export function write(ctx,state){
 const before=baselines.get(state);if(!before)throw Error('Unowned C state write');
 const next=structuredClone(ctx.state.read()??{version:1,owners:[defaultOwner(),defaultOwner()]});
 // Preserve nested resource callbacks. Only fields changed by this handler commit.
 for(const id of [0,1])for(const key of Object.keys(state.owners[id])){
  const old=before.owners[id][key],value=state.owners[id][key];if(JSON.stringify(old)===JSON.stringify(value))continue;
  if(['jobs','effects','statuses'].includes(key)){
   const removed=new Set(old.filter(x=>!value.some(y=>y.handle===x.handle)).map(x=>x.handle));
   let merged=next.owners[id][key].filter(x=>!removed.has(x.handle));
   for(const row of value){const previous=old.find(x=>x.handle===row.handle);if(!previous||JSON.stringify(previous)!==JSON.stringify(row)){merged=merged.filter(x=>x.handle!==row.handle);merged.push(row);}}
   next.owners[id][key]=merged;
  }else next.owners[id][key]=value;
 }
 ctx.state.write(next);baselines.set(state,structuredClone(state));
}
export function refreshCharges(ctx,state){for(const s of state.owners)for(const c of s.charges)while(c.pending.length&&c.pending[0]<=ctx.now+EPS){c.pending.shift();c.count=Math.min(c.max,c.count+1);}}
export function cancelChannel(s){if(s.channel?.kind==='solar'&&s.channel.flight)return;s.revision++;s.channel=null;}
export function channel(ctx,state,owner,kind,duration){const s=state.owners[owner];s.revision++;s.channel={kind,startX:ctx.actor(owner).x,until:ctx.now+duration,flight:false,revision:s.revision};return s.revision;}
export function job(ctx,state,definition,cast,op,delay,data={},revision=null,reasons=[]){
 if(state.owners[cast.owner].jobs.length>=128)throw Error('C own scheduled metadata limit');
 const token=reasons.length?ctx.action.token(cast.owner,reasons):null;
 const payload={owner:cast.owner,target:cast.target,castId:cast.castId,op,revision,token,...data};
 if(!jsonToken(token))throw Error('Invalid action token');
 const h=ctx.schedule({abilityId:definition.id,owner:cast.owner,handler:'dispatch',delay,token,data:payload});state.owners[cast.owner].jobs.push({handle:h,abilityId:definition.id,op});return h;
}
export function removeJobs(ctx,s,opsToRemove){s.jobs=s.jobs.filter(j=>{if(!opsToRemove.includes(j.op))return true;ctx.cancelJob(j.handle);return false;});}
export function field(ctx,state,definition,cast,mode,x,duration,from=x,profile={}){
 const s=state.owners[cast.owner],same=s.effects.filter(f=>f.mode===mode);while(same.length>=2){const old=same.shift();ctx.legacyEffect.end(old.handle,'cancelled');s.effects=s.effects.filter(f=>f.handle!==old.handle);}
 const h=ctx.legacyEffect.spawn({owner:cast.owner,abilityId:definition.id,castId:cast.castId,kind:'area',x,radius:profile.radius??0,duration,data:{profile:'c-v6-field',mode,callback:'onStage',...profile}});
 s.effects.push({handle:h,abilityId:definition.id,mode,x,from,face:ctx.actor(cast.owner).dir,startedAt:ctx.now});return h;
}
export function apply(ctx,state,definition,owner,target,key,duration,values,polarity='negative',interval=0,origin=owner){
 const fullKey=key==='seal'||key==='concussive_slow'||key==='stampede_slow'?key:key+'_'+origin;
 const spec={owner,target,abilityId:definition.id,key:fullKey,duration,polarity,dispel:'basic',pierces:false,values:{...values,...(interval?{$pulse:{handler:'pulse',interval,data:{owner,target,key:fullKey}}}:{}),$origin:origin}};
 const h=ctx.status.apply(spec);if(h!==null){for(const s of state.owners)s.statuses=s.statuses.filter(x=>x.target!==target||x.key!==fullKey);state.owners[origin].statuses.push({handle:h,key:fullKey,target,source:owner});}return h;
}
export function damage(ctx,definition,owner,target,amount,type=definition.official.damageType,flags={}){return ctx.damage({source:owner,target,abilityId:definition.id,amount,type,blockable:false,dot:true,reflected:!!flags.reflected,noReflect:!!(flags.noReflect||flags.reflected),noLifesteal:!!flags.reflected,...flags});}
export function control(ctx,definition,owner,target,type,duration,dispel='strong'){return ctx.control.apply({owner,target,abilityId:definition.id,key:'r91:'+definition.id,type,duration,pierces:false,dispel});}
export const teleport=(ctx,definition,cast,id,x)=>ctx.motion({actor:id,abilityId:definition.id,castId:cast.castId,kind:'blink',destinationX:clamp(x),speed:0,duration:0});
export function housekeeping(ctx,state,event){
 if(event.kind==='before-status'){refreshCharges(ctx,state);for(const s of state.owners)if(s.channel&&s.channel.until<ctx.now-1e-7)s.channel=null;}
 if(event.kind==='after-status'){for(const s of state.owners){s.barriers=s.barriers.filter(b=>b.until>ctx.now+EPS&&b.amount>EPS);if(s.windup&&s.windup.until<=ctx.now+EPS)s.windup=null;}}
 if(event.kind==='end-step')for(const id of [0,1]){const s=state.owners[id];if(ctx.actor(id).alive){s.dead=false;continue;}if(!s.dead){s.dead=true;s.barriers=[];s.windup=null;s.stampede=null;}s.channel=null;removeJobs(ctx,s,ops);for(const f of s.effects)ctx.legacyEffect.end(f.handle,'owner-dead');s.effects=[];for(const own of state.owners){own.statuses=own.statuses.filter(t=>{if(t.target!==id&&!(t.source===id&&t.key.startsWith('x_')))return true;ctx.status.remove(t.handle);return false;});}}
}
export const SOURCE_FILES=Object.freeze(['rules/c/index.js','rules/c/common.js','rules/c/state.js','rules/c/centaur.js','rules/c/skywrath.js','rules/c/extra.js','contract/registry.js','contract/code-identity.js','contract/state-schema.js','contract/value.js','contract/definition-schema.js','content/index.js','content/heroes.json','rules/legacy-three.js','index.js']);
export function base(config,extra){return {behaviorId:'c/v6/'+config.definition.id,revision:'1.0.0',...codeIdentity(SOURCE_FILES),namespace:'heros/c/v6',stateSchema:group(config.definitions).schema,requires:extra.requires,...extra};}
export function planning(config,ctx,facts){const a=config.definition,m=a.mvp,s=read(ctx,config.definitions);refreshCharges(ctx,s);const f=ctx.actor(facts.owner),t=ctx.actor(facts.target),owner=s.owners[facts.owner],charge=owner.charges.find(x=>x.abilityId===a.id);
 const result={accepted:true,manaCost:m.mana,cooldownSeconds:m.cooldown_s,chargeCost:charge?1:0,windupSeconds:m.startup_frames/60,recoverySeconds:a.id==='centaur_hoof_stomp'?0:m.recovery_frames/60,action:'cast'};
 const reject=reason=>({...result,accepted:false,reason});
 if(m.passive)return reject('passive');if(['ember_spirit_sleight_of_fist','void_spirit_astral_step','dawnbreaker_fire_wreath'].includes(a.id)&&(!Number.isFinite(facts.attackBonus)||facts.attackBonus<0))return reject('missing-host-attack-bonus');if(!f.alive)return reject('dead');if(!facts.actionReady||f.silenced)return reject('not-ready');if(facts.cooldownRemaining>EPS||facts.manaAvailable<m.mana)return reject('resources');if(charge&&!charge.count)return reject('charges');
 if(facts.selfTarget&&a.id!=='centaur_stampede')return reject('invalid-self');
 if(owner.channel?.kind==='solar'&&owner.channel.flight)return reject('solar-flight');if(owner.channel?.kind==='star'&&['dawnbreaker_celestial_hammer','dawnbreaker_solar_guardian'].includes(a.id))return reject('star-channel');if(a.id==='dawnbreaker_fire_wreath'&&owner.jobs.some(j=>j.op==='hammer_return'))return reject('hammer-return');
 if(f.rooted&&['ember_spirit_fire_remnant','void_spirit_dissimilate','void_spirit_astral_step','abyssal_underlord_dark_portal','dawnbreaker_solar_guardian'].includes(a.id))return reject('rooted');
 const targeted=['centaur_double_edge','skywrath_mage_arcane_bolt','skywrath_mage_concussive_shot','skywrath_mage_ancient_seal','muerta_dead_shot'];if(targeted.includes(a.id)&&(!t.alive||t.invulnerable||Math.abs(t.x-f.x)>m.range_wu+22))return reject('target');
 const point=['skywrath_mage_mystic_flare','ember_spirit_sleight_of_fist','ember_spirit_fire_remnant','abyssal_underlord_firestorm','abyssal_underlord_pit_of_malice','void_spirit_aether_remnant','void_spirit_astral_step','dawnbreaker_celestial_hammer','muerta_the_calling'];
 if(point.includes(a.id)&&(!Number.isFinite(facts.aimX)||facts.aimX<45||facts.aimX>1155||Math.abs(facts.aimX-f.x)>m.range_wu+22))return reject('aim');
 if(a.id==='abyssal_underlord_dark_portal'){const x=facts.explicitAim?facts.aimX:(f.x<600?1155:45);if(!Number.isFinite(x)||x<45||x>1155||Math.abs(x-f.x)<coefficient(a,'minimum_distance')*SCALE)return reject('gate-distance');}
 if(a.id==='dawnbreaker_solar_guardian'&&facts.explicitAim&&(!Number.isFinite(facts.aimX)||facts.aimX<45||facts.aimX>1155||Math.abs(facts.aimX-f.x)>coefficient(a,'max_offset_distance')*SCALE))return reject('solar-offset');
 if(a.id==='void_spirit_dissimilate'&&facts.explicitAim&&!Number.isFinite(facts.aimX))return reject('aim');return result;
}
export function committed(config,ctx,event){const state=read(ctx,config.definitions),s=state.owners[event.owner];refreshCharges(ctx,state);if(EXTRA_IDS.includes(config.hero.registryNumericId))cancelChannel(s);const charge=s.charges.find(x=>x.abilityId===config.definition.id);if(charge){if(!charge.count)throw Error('Host committed without admitted charge');charge.count--;charge.pending.push(Math.max(ctx.now,charge.pending.at(-1)??ctx.now)+charge.restore);}write(ctx,state);}
export function interrupted(config,ctx,event){const state=read(ctx,config.definitions),s=state.owners[event.owner];if(['control','input-cancel','action'].includes(event.reason)&&s.windup){s.windup=null;removeJobs(ctx,s,['stomp']);}if(EXTRA_IDS.includes(config.hero.registryNumericId)&&['control','input-cancel','movement','action','blocked','silence','manual-move','manual-attack'].includes(event.reason))cancelChannel(s);write(ctx,state);}
