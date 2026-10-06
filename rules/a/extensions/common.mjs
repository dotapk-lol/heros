// SPDX-License-Identifier: MIT
// PROPOSED event/intent vocabulary only. Not a host adapter or active registrar.
export const actorId=x=>{if(x!==0&&x!==1)throw Error('Invalid actor');return x;};
export const scalar=(x,label='number')=>{if(!Number.isFinite(x))throw Error('Invalid '+label);return x;};
export const nonnegative=x=>{scalar(x);if(x<0)throw Error('Negative amount');return x;};
export const ordinal=x=>{if(!Number.isSafeInteger(x)||x<1)throw Error('Invalid ordinal');return x;};
export const handle=x=>{if(typeof x!=='string'||!x.length||x.length>128)throw Error('Invalid handle');return x;};
export const clampX=x=>Math.max(45,Math.min(1155,scalar(x,'position')));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export function result(state,commands=[]){return freeze({state:structuredClone(state),commands:structuredClone(commands)});}
export function parameters(definition,names){const p=definition.mvp?.params;if(!p)throw Error('Missing params');for(const name of names){nonnegative(p[name]);if(p[name]>1e7||/(?:duration|Duration)$/.test(name)&&p[name]>3600)throw Error('Source parameter outside host bounds:'+name);}return structuredClone(p);}
export function actor(f){actorId(f?.id);scalar(f.x);scalar(f.hp);scalar(f.maxHp);scalar(f.mp);scalar(f.maxMp);for(const key of ['alive','invulnerable','debuffImmune','passivesEnabled'])if(typeof f[key]!=='boolean')throw Error('Missing actor fact '+key);return f;}
export function begin(event){handle(event.castId);const owner=actor(event.owner),target=actor(event.target);if(typeof event.accepted!=='boolean'||typeof event.reflected!=='boolean')throw Error('Missing routed cast facts');return {castId:event.castId,owner:owner.id,target:target.id,reflected:event.reflected};}
export function live(state,event){return !!state&&state.castId===event.castId&&state.phase!=='closed';}
export function damage(id,s,amount,type){return {kind:'damage',abilityId:id,source:s.owner,target:s.target,amount:nonnegative(amount),type,dot:true,blockable:false,reflected:s.reflected,noReflect:s.reflected,noLifesteal:s.reflected};}
export function status(id,s,key,duration,values,{to=s.target,positive=false,pierces=false,dispel='basic',interval=0}={}){return {kind:'apply-status',abilityId:id,requestId:handle(key),owner:s.owner,target:to,key,duration:nonnegative(duration),polarity:positive?'positive':'negative',pierces,dispel,interval,values};}
export function belongs(state,id){return state===null||state?.abilityId===id&&typeof state.castId==='string'&&state.castId.length>0&&state.castId.length<=128&&[0,1].includes(state.owner)&&[0,1].includes(state.target)&&typeof state.reflected==='boolean'&&['waiting','active','closed'].includes(state.phase);}
export function exact(x,keys){return !!x&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');}
export function machine(id,p,validator,handlers){return Object.freeze({abilityId:id,requiresHostContract:true,validateState:validator,handlers:Object.freeze(Object.fromEntries(Object.entries(handlers).map(([name,fn])=>[name,(state,event)=>{if(!validator(state))throw Error('Invalid own state');const next=fn(state===null?null:structuredClone(state),event);if(!validator(next.state))throw Error('Invalid resulting own state');return next;}])))});}
