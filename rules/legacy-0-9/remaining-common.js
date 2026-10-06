import {codeIdentity,defineStateSchema} from '../../index.js';
export const EVENT_VERSION='heros-host-events-1';
export const FEATURES=Object.freeze(['legacy-hit-v1','legacy-linear-v1','legacy-dot-v1','legacy-field-v1','legacy-channel-v1','legacy-job-v1','legacy-property-v1','legacy-passive-v1','legacy-status-v1','legacy-contact-v1']);
export function num(v,k,min=0,max=1e7){if(!Number.isFinite(v)||v<min||v>max)throw Error('Invalid finite '+k);return v;}
export function flag(v,k){if(typeof v!=='boolean')throw Error('Invalid boolean '+k);return v;}
export function actor(v){if(v!==0&&v!==1)throw Error('Invalid actor ID');return v;}
export function handle(v){if(typeof v!=='string'||!v.length||v.length>128)throw Error('Invalid stable handle');return v;}
export function closed(v,keys,name){if(!v||Object.getPrototypeOf(v)!==Object.prototype||Object.keys(v).sort().join(',')!==[...keys].sort().join(','))throw Error('Invalid closed '+name);}
export function caps(v){if(!Array.isArray(v)||new Set(v).size!==v.length||v.some(x=>!FEATURES.includes(x)))throw Error('Invalid host capabilities');return [...v].sort();}
export function admitted(config,e,features){return config.parameters.hostSemantics===EVENT_VERSION&&e.legacySemantics===EVENT_VERSION&&features.every(x=>config.parameters.hostCapabilities.includes(x)&&e.legacyCapabilities?.includes(x));}
const BASE=['owner','target','abilityId','slot','castId','legacySemantics','legacyCapabilities'];
export function event(config,e,features,keys=[]){if(!admitted(config,e,features))throw Error('GATED: legacy host capability unconfirmed');closed(e,[...BASE,...keys],'legacy event');caps(e.legacyCapabilities);actor(e.owner);actor(e.target);if((e.target===e.owner&&!keys.includes('source'))||e.slot!==config.parameters.slot||e.abilityId!==config.definition.id)throw Error('Wrong legacy identity');handle(e.castId);}
export function direction(v){if(v!==1&&v!==-1)throw Error('Invalid direction');return v;}
export function distance(ctx,e){return Math.abs(ctx.actor(e.owner).x-ctx.actor(e.target).x);}
export function near(ctx,e,r,ground=false){return distance(ctx,e)<=r+22&&(!ground||ctx.actor(e.target).y<45);}
export function cue(kind,actorId,target,x=0,y=0,size=0,directionValue=1){return {kind:'cue',cue:kind,actor:actorId,target,x,y,size,direction:directionValue};}
export function status(target,key,duration,values){return {kind:'status.apply',target,key,duration,values};}
export function log(actorId,eventName,values={}){return {kind:'log',actor:actorId,event:eventName,values};}
// Closed proposals, not new callable ABI ports. Host must freeze these profiles
// and preflight the whole program BEFORE ordinary MP/CD/action commitment.
const COMMAND_KEYS={
 'hit':['source','target','amount','type','blockable','stun','hitstun','slowPct','slowSeconds','silence','knockback','pullDistance','pullCap','dot','passive','basic','suppressFiery','reflected','projection'],
 'projectile.spawn':['source','direction','x','y','speed','range','radius','height','reflectable','contact'],
 'effect.spawn':['owner','profile','x','duration','interval','radius','followSpeed','replace','terminal','ownerDeath'],
 'effect.end':['owner','handle','scope','reason'], 'dot.apply':['source','target','duration','interval','replace','rootPolicy','rootSeconds','dispel'],
 'channel.begin':['owner','target','direction','duration','interval','profile','grabStun'], 'channel.end':['handle','target','reason','recovery','recoveryPolicy','cleanup'],
 'job.spawn':['owner','target','index','offset','profile'], 'motion':['target','x'], 'protect':['target','seconds'],
 'status.apply':['target','key','duration','values'], 'status.remove':['target','key','handle'], 'cleanse':['target','tier'],
 'mana.debit':['target','amount','attackHandle'], 'mana.transfer':['donor','beneficiary','amount'], 'heal':['target','amount','receipt'],
 'self.damage':['target','amount','nonlethal'], 'slow.replace':['target','percentage','seconds'],
 'counter.mirror':['target','count','receipt'], 'contribution':['target','property','value'],
 'cue':['cue','actor','target','x','y','size','direction'], 'log':['actor','event','values']
};
const STATUS_VALUES={aura:['magicReduction','debuffImmune','endDispel','blocksBasicAttack'],drow_ranger_frost:['attackBonus','onAttackSlow','onAttackSlowSeconds'],deadlyFocus:[],fiery:['stacks'],helix_cd:[]};
function finiteTree(v,depth=0){if(depth>6)throw Error('Command depth');if(typeof v==='number')num(v,'command number',-1e7);else if(typeof v==='string'){if(v.length>128)throw Error('Command string');}else if(typeof v==='boolean'||v===null){}else if(Array.isArray(v)){if(v.length>128)throw Error('Command array');v.forEach(x=>finiteTree(x,depth+1));}else if(v&&Object.getPrototypeOf(v)===Object.prototype){if(Object.keys(v).length>32)throw Error('Command object');Object.values(v).forEach(x=>finiteTree(x,depth+1));}else throw Error('Nonfinite command');}
export function program(config,commands,result={}){for(const c of commands){if(!COMMAND_KEYS[c.kind])throw Error('Unknown declarative command');closed(c,['kind',...COMMAND_KEYS[c.kind]],'command '+c.kind);finiteTree(c);for(const k of ['owner','source','target','actor','donor','beneficiary'])if(k in c)actor(c[k]);if(c.kind==='status.apply'){if(!STATUS_VALUES[c.key])throw Error('Unknown named status');closed(c.values,STATUS_VALUES[c.key],'status values');}if(c.kind==='hit'&&(!['physical','magical','pure'].includes(c.type)||c.reflected!==false))throw Error('Invalid legacy hit profile');}finiteTree(result);return {draft:true,profile:EVENT_VERSION,abilityId:config.definition.id,commands,result};}
export function hit(config,source,target,patch={}){const m=config.definition.mvp;return {kind:'hit',source,target,amount:m.damage,type:m.damage_type,blockable:m.blockable,stun:m.stun_s,hitstun:m.hitstun_s,slowPct:m.slow_pct,slowSeconds:m.slow_duration_s,silence:m.silence_s||0,knockback:m.knockback_wu,pullDistance:m.pull_to_distance||0,pullCap:m.pull_cap_s||0,dot:false,passive:false,basic:false,suppressFiery:false,reflected:false,projection:null,...patch};}
export function projectile(config,ctx,e,contact){const m=config.definition.mvp,f=ctx.actor(e.owner);return {kind:'projectile.spawn',source:e.owner,direction:direction(e.direction),x:f.x+f.dir*35,y:f.y+(m.height==='ground'?35:100),speed:m.projectile_speed_wu_s||800,range:m.range_wu,radius:Math.max(12,m.radius_wu||18),height:m.height,reflectable:m.reflectable,contact};}
export function coefficients(m){for(const [k,v]of Object.entries(m)){if(typeof v==='number')num(v,k);if(Array.isArray(v)&&v.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1e7))throw Error('Invalid vector '+k);}if(!['physical','magical','pure'].includes(m.damage_type))throw Error('Invalid type');for(const v of Object.values(m.officialSemantic||{}))if(typeof v==='number')num(v,'semantic',-1e7);}
export const FILES=['rules/legacy-0-9/remaining.js','rules/legacy-0-9/remaining-common.js','rules/legacy-0-9/remaining-projectiles.js','rules/legacy-0-9/remaining-effects.js','rules/legacy-0-9/remaining-channels.js','rules/legacy-0-9/remaining-passives.js'];
export const identity=()=>codeIdentity(FILES);
const caches=new WeakMap();
const int=(max)=>({type:'integer',minimum:0,maximum:max});
const obj=(properties)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export function ownedSchema(config,kind){let map=caches.get(config.definitions);if(!map)caches.set(config.definitions,map=new Map());if(map.has(kind))return map.get(kind);
 const maxMana=Math.max(...config.definitions.map(h=>h.combatMana??h.mana??1200)),str={type:'string',minLength:1,maxLength:128},id=int(1);
 const data=kind==='helix'?obj({actors:{type:'array',minItems:2,maxItems:2,items:obj({count:int(2147483647),receipt:{anyOf:[{type:'null'},str]}})}}):obj({pending:{type:'array',maxItems:64,items:obj({owner:id,target:id,handle:str,burn:{type:'number',minimum:0,maximum:maxMana}})}});
 const parameters=kind==='helix'?{maxCount:2147483647}:{maxMana,maxPending:64};
 const schema=defineStateSchema({id:'heros/legacy-0-9/'+kind+'-state',schema:{anyOf:[{type:'null'},data]},parameters,refinement:{id:kind+'-pairing-v1',...identity(),validate(v){if(v===null)return true;if(kind==='helix')return v.actors.every(x=>(x.count===0)===(x.receipt===null));return new Set(v.pending.map(x=>x.owner+':'+x.handle)).size===v.pending.length&&v.pending.every(x=>x.target===1-x.owner);}}});map.set(kind,schema);return schema;
}
