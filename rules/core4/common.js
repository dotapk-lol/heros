import {codeIdentity} from '../../contract/code-identity.js';
import {EMPTY_STATE_SCHEMA,defineStateSchema} from '../../contract/state-schema.js';
export const IDS=Object.freeze([25,31,45,100]);
export const ADAPT=Object.freeze({profile:'arena-level18-base-core4',worldScale:.55,worldDecimals:8,contactPadding:22,statusTick:.25,groundHeight:45,sprintTailFloor:1e-8,reflectOffset:40,poisonTickLimit:6,shieldEpsilon:1e-8});
export const EPS=1e-8;
export const actor=id=>{if(id!==0&&id!==1)throw Error('Invalid Core4 actor');return id;};
export const bounded=(v,min=0,max=1e7)=>{if(!Number.isFinite(v)||v<min||v>max)throw Error('Invalid Core4 numeric fact');return v;};
export const dt=e=>bounded(e.liveDt??e.dt,0,60);
export const scale=n=>Number((n*ADAPT.worldScale).toFixed(ADAPT.worldDecimals));
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const number=(max=1e7,min=0)=>({type:'number',minimum:min,maximum:max});
export const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const nullable=s=>({anyOf:[{type:'null'},s]});
export const handle={type:'string',minLength:1,maxLength:160};
export const ownerShape=s=>obj({'0':s,'1':s});
export const schema=(id,shape)=>defineStateSchema({id:'heros/core4/'+id,schema:nullable(shape)});
export const live=(ctx,id)=>ctx.actor(actor(id)).alive;
export function validate(config){const p=config.definition.mvp.params;if(!p||typeof p!=='object')throw Error('Missing Core4 parameters');for(const [key,value]of Object.entries(p)){if(!Number.isFinite(value)||Math.abs(value)>1e6)throw Error('Invalid Core4 coefficient '+key);if(value<0&&!['crush_extra_slow','crush_attack_slow_tooltip','armor_reduction'].includes(key))throw Error('Invalid Core4 negative coefficient '+key);}for(const [key,value]of Object.entries(p)){if((key.includes('duration')||key==='drain_length')&&(value<0||value>60))throw Error('Invalid Core4 duration '+key);}return p;}
export function positive(p,keys,max=3600){for(const key of keys)bounded(p[key],.001,max);}
export function percent(p,keys){for(const key of keys)bounded(p[key],0,100);}
export function base(config,file,requires,extra,stateSchema=EMPTY_STATE_SCHEMA){validate(config);return {behaviorId:'core4/'+config.definition.id,revision:'1.0.0',...codeIdentity(['rules/core4/common.js','rules/core4/innates.js','rules/core4/index.js',file]),requires,stateSchema,...extra};}
export function damage(ctx,c,source,target,amount,type='magical',flags={}){bounded(amount);if(!live(ctx,target)||amount<=0)return null;return ctx.damage({source:actor(source),target:actor(target),abilityId:c.definition.id,amount,type,blockable:false,dot:true,...flags});}
export function status(ctx,c,owner,target,key,duration,values,dispel='basic',pierces=false,polarity='negative'){bounded(duration,0,3600);return ctx.status.apply({owner:actor(owner),target:actor(target),abilityId:c.definition.id,key,duration,values,dispel,pierces,polarity});}
export const rows=(ctx,target,key)=>ctx.status.query(actor(target),key);
export const effective=(ctx,s)=>s.remaining>EPS&&(s.pierces||s.polarity==='positive'||!ctx.actor(s.target).debuffImmune);
export const enabledRows=(ctx,target,key)=>rows(ctx,target,key).filter(s=>effective(ctx,s));
export const outputCue=(kind,c,owner,target,extra={})=>({presentation:{kind,abilityId:c.definition.id,actor:actor(owner),...(target===undefined?{}:{target:actor(target)}),...extra}});
export function field(ctx,c,cast,profile,radius,duration,data={}){return ctx.legacyEffect.spawn({owner:actor(cast.owner),abilityId:c.definition.id,castId:cast.castId,kind:'area',x:ctx.actor(cast.owner).x,radius,duration,data:{profile,...data}});}
export function missile(ctx,c,cast,profile,speed,range,data={}){const f=ctx.actor(cast.owner),t=ctx.actor(cast.target);return ctx.projectile({owner:cast.owner,abilityId:c.definition.id,castId:cast.castId,direction:t.x>=f.x?1:-1,speed,range,height:'both',contactHandler:'onContact',data:{profile,originOffsetX:0,originOffsetY:100,hitRadius:18,reflectionOffset:ADAPT.reflectOffset,...data}});}
export function planning(c,ctx,facts,{targeted=false,toggle=false,borrowed=false}={}){const m=c.definition.mvp,f=ctx.actor(facts.owner),t=ctx.actor(facts.target),result={accepted:true,manaCost:m.mana,cooldownSeconds:m.cooldown_s,chargeCost:0,windupSeconds:m.startup_frames/60,recoverySeconds:m.recovery_frames/60,action:'cast'},reject=reason=>({...result,accepted:false,reason});if(m.passive)return reject('passive');if(!f.alive)return reject('dead');if(borrowed){if((facts.activeRemaining??0)>0||facts.cooldownRemaining>EPS||facts.automatic&&!f.passivesEnabled||!facts.automatic&&f.silenced)return reject('borrowed-admission');return {...result,manaCost:0,windupSeconds:0};}if(!facts.actionReady||f.silenced)return reject('not-ready');if(facts.cooldownRemaining>EPS)return reject('cooldown');if(toggle)return {...result,manaCost:0,cooldownSeconds:0};if(targeted&&(!t.alive||t.invulnerable||ctx.target.distance(facts.owner,facts.target)>m.range_wu+22))return reject('target');if(facts.manaAvailable<m.mana)return reject('mana');return result;}
