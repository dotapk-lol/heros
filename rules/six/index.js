// Six-hero 1v1 rules. All geometry and effect coefficients come from sealed definitions.
import {BATTLE_ABI,EMPTY_STATE_SCHEMA,codeIdentity} from '../../index.js';
export const SIX_SLOTS=[[0,3],[2,0],[6,0],[6,1],[10,0],[10,1],[10,3],[14,2],[14,3],[19,2],[19,3]];
const num=(v,lo=0,hi=1e7)=>{if(!Number.isFinite(v)||v<lo||v>hi)throw Error('Invalid six-hero coefficient');return v;};
export function sixFactory(heroId,slot){return {abiVersion:BATTLE_ABI,parameters:{heroId,slot},create(config){
 const {definition:a,hero,definitions}=config,m=a.mvp,id=a.id;
 if(hero.registryNumericId!==heroId||!SIX_SLOTS.some(([h,s])=>h===heroId&&s===slot)||hero.abilities[slot].id!==id)throw Error('Invalid six-hero slot');
 for(const [k,v]of Object.entries(m))if(typeof v==='number')num(v,k==='officialSemantic'?-1e7:0);
 if(heroId===0&&(!Number.isInteger(m.ticks)||m.ticks<1||m.ticks>64||m.tick_offsets_s.length!==m.ticks||m.tick_offsets_s.some((n,i)=>!Number.isFinite(n)||n<0||n>m.duration_s||i&&n<m.tick_offsets_s[i-1])))throw Error('Invalid Omnislash schedule');
 const hit=(source,target,extra={})=>({kind:'hit',source,target,amount:m.damage,recipe:{damage_type:m.damage_type,blockable:m.blockable,stun_s:m.stun_s,hitstun_s:m.hitstun_s,slow_pct:m.slow_pct,slow_duration_s:m.slow_duration_s,pull_to_distance:m.pull_to_distance||0,pull_cap_s:m.pull_cap_s||0,attack_damage_debuff:m.attack_damage_debuff||0,debuff_duration_s:m.debuff_duration_s||0},...extra});
 const buff=(owner,key,values,duration=m.duration_s)=>({kind:'buff',owner,key,values,duration});
 const event=e=>{if(e.abilityId!==id||e.slot!==slot||![0,1].includes(e.owner)||e.target!==1-e.owner||!Number.isSafeInteger(e.castId)||e.castId<1)throw Error('Invalid six-hero event');};
 const near=(ctx,e,r)=>Math.abs(ctx.actor(e.owner).x-ctx.actor(e.target).x)<=r+22;
 return {behaviorId:'six-heroes/'+id,revision:'1.0.0',...codeIdentity(['rules/six/index.js']),stateSchema:EMPTY_STATE_SCHEMA,requires:[],
 activate(ctx,e){event(e);const f=ctx.actor(e.owner),t=ctx.actor(e.target),out=[];
  if(id==='pudge_hook'||id==='phantom_assassin_dagger')out.push({kind:'projectile',x:f.x+e.direction*35,y:f.y+(m.projectile_height||100),direction:e.direction,speed:m.projectile_speed_wu_s,range:m.range_wu,radius:Math.max(12,m.radius_wu)});
  else if(id==='phantom_assassin_strike'){if(near(ctx,e,m.range_wu)&&t.alive){out.push({kind:'move',owner:e.owner,x:t.x-e.direction*70},hit(e.owner,e.target),buff(e.owner,id,{attack_interval_multiplier:m.attack_interval_multiplier},m.buff_duration_s));}}
  else if(id==='juggernaut_omnislash'){if(near(ctx,e,m.range_wu)&&t.alive){out.push({kind:'cleanse',owner:e.owner,tier:'basic'},{kind:'protect',owner:e.owner,duration:m.duration_s});for(let index=0;index<m.ticks;index++)out.push({kind:'job',index,offset:m.tick_offsets_s[index]});}}
  else if(id==='earthshaker_fissure'){out.push({kind:'wall',x:e.aim,duration:m.duration_s,height:m.wall_height_wu});if(Math.abs(t.x-e.aim)<=m.radius_wu+22&&t.y<45)out.push(hit(e.owner,e.target));}
  else if(id==='earthshaker_totem')out.push(buff(e.owner,id,{next_attack_override:m.next_attack_override,next_attack_range_bonus:m.next_attack_range_bonus}));
  else if(id==='windranger_windrun')out.push(buff(e.owner,id,{move_multiplier:m.move_multiplier,basic_attack_evasion:m.basic_attack_evasion}));
  else if(id==='windranger_focus'){if(near(ctx,e,m.range_wu)&&t.alive)out.push(buff(e.owner,id,{attack_interval_override_s:m.attack_interval_override_s,attack_damage_override:m.attack_damage_override,move_attack:true}));}
  else if(id==='tidehunter_ravage')out.push({kind:'wave',x:f.x,duration:m.radius_wu/m.wave_speed_wu_s+.1});
  else if(near(ctx,e,m.radius_wu)&&(m.height!=='ground'||t.y<45))out.push(hit(e.owner,e.target));
  return out;
 },onStage(ctx,e){event(e);const f=ctx.actor(e.owner),t=ctx.actor(e.target);
  if(id==='juggernaut_omnislash'){if(!Number.isInteger(e.index)||e.index<0||e.index>=m.ticks)throw Error('Invalid Omnislash pulse');if(!f.alive||!t.alive||e.blocked||!near(ctx,e,m.tracking_break_wu))return [];return [{kind:'move',owner:e.owner,x:t.x-f.dir*75},hit(e.owner,e.target,{amount:m.hit_damages?.[e.index]??m.damage,basic:true,bladeDance:true})];}
  if(id==='tidehunter_ravage')return !e.hit&&t.alive&&Math.abs(t.x-e.x)<=Math.min(m.radius_wu,num(e.age,0,3600)*m.wave_speed_wu_s)?[hit(e.owner,e.target)]:[];
  throw Error('Unsupported six-hero stage');
 },onContact(ctx,e){event(e);if(!['pudge_hook','phantom_assassin_dagger'].includes(id)||![0,1].includes(e.source))throw Error('Invalid six-hero contact');return [hit(e.source,1-e.source)];},
 onAttack(ctx,e){event(e);if(id!=='phantom_assassin_dagger'||typeof e.landed!=='boolean')throw Error('Invalid dagger receipt');const focus=definitions.find(h=>h.registryNumericId===6).abilities[3].mvp;return e.landed&&ctx.actor(e.source).passivesEnabled&&ctx.random()<focus.daggerFocusChance?[buff(e.source,'deadlyFocus',{},focus.slow_duration_s)]:[];}
 };
}};}
