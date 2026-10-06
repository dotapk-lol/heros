import {BATTLE_ABI,CAPABILITIES,HOOKS} from './registry.js';
import {freeze,json} from './value.js';
import {validManaFact} from './resource-schema.js';
import {validateScheduleRequest} from './schedule-schema.js';
import {validateDeclaredCastFacts,validateDeclaredStatusRequest} from './rule-declarations.js';
const actorId=id=>{if(id!==0&&id!==1)throw Error('Invalid actor');return id;};
const actorKeys=['id','heroId','hp','maxHp','mp','maxMp','x','y','dir','alive','invulnerable','debuffImmune','passivesEnabled','guarding','rooted','silenced'];
const portNames=Object.freeze({damage:['damage'],heal:['heal'],mana:['mana'],'transfer-mana':['transferMana'],'self-damage':['selfDamage'],protect:['protect'],status:['status.apply','status.remove','status.query','status.cleanse'],control:['control.apply','control.release'],'target-route':['target.route'],'motion-request':['motion'],'projectile-request':['projectile'],'legacy-effect':['legacyEffect.spawn','legacyEffect.view','legacyEffect.end'],schedule:['schedule','cancelJob'],'action-token':['action.token','action.valid'],'deferred-hp':['deferredHP.begin','deferredHP.settle'],cue:['cue']});
function actorFact(host,id,resources){actorId(id);const source=host.actor(id),out={};for(const k of actorKeys)out[k]=source[k];if(out.id!==id||!Number.isSafeInteger(out.heroId)||![1,-1].includes(out.dir)||['hp','maxHp','mp','maxMp','x','y'].some(k=>!Number.isFinite(out[k]))||['alive','invulnerable','debuffImmune','passivesEnabled','guarding','rooted','silenced'].some(k=>typeof out[k]!=='boolean'))throw Error('Invalid read-only actor fact');if(!validManaFact(resources,out))throw Error('Actor mana exceeds declared resource schema');return freeze(out);}
export function createRuleSession(sealed){
 if(sealed?.abiVersion!==BATTLE_ABI)throw Error('Incompatible sealed registry');
 let namespaces=new Map();
 const namespace=(heroId,slot)=>sealed.implementation(heroId,slot).namespace??('skill:'+heroId+':'+sealed.hero(heroId).abilities[slot].id);
 function select(heroId,slot){const hero=sealed.hero(heroId),impl=sealed.implementation(heroId,slot);return hero&&impl?{hero,impl,ability:hero.abilities[slot],ns:namespace(heroId,slot)}:null;}
 function context(selected,host){
  if(!host||typeof host.now!=='function'||typeof host.actor!=='function'||typeof host.random!=='function'||!host.ports)throw Error('Invalid host facts/ports');
  const now=host.now();if(!Number.isFinite(now)||now<0)throw Error('Invalid host time');
  const {impl,ability,ns}=selected,schema=sealed.namespaceSchema(ns);
  function stateValue(){return namespaces.get(ns)??null;}
  const ctx={now,actor:id=>actorFact(host,id,sealed.resources),random:()=>{const v=host.random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('Invalid host random');return v;},state:Object.freeze({read:()=>freeze(json(stateValue())),write:value=>{const v=json(value);if(!schema.validate(v))throw Error('Invalid namespace state');namespaces.set(ns,freeze(v));},remove:()=>namespaces.delete(ns)}),target:{distance:(a,b)=>Math.abs(actorFact(host,a,sealed.resources).x-actorFact(host,b,sealed.resources).x)}};
  const call=(name,...args)=>{const [group,method]=name.split('.'),fn=method?host.ports[group]?.[method]:host.ports[group];if(typeof fn!=='function')throw Error('Missing declared port: '+name);const request=args.map(x=>json(x));if(name==='schedule')validateScheduleRequest(request[0],impl.scheduledBindings);validateDeclaredStatusRequest(name,request[0],impl);if(request[0]&&typeof request[0]==='object'&&!Array.isArray(request[0])){const spec=request[0];if('abilityId'in spec&&spec.abilityId!==ability.id)throw Error('Cross-namespace ability request');for(const k of ['owner','target','source','actor'])if(k in spec&&!(name==='schedule'&&k==='target'&&spec[k]===null))actorId(spec[k]);}const value=fn(...request);return value===undefined?undefined:freeze(json(value));};
  for(const cap of impl.requires){if(!CAPABILITIES.includes(cap))throw Error('Unsupported capability');for(const name of portNames[cap]){const [group,method]=name.split('.');if(method){ctx[group]??={};ctx[group][method]=(...args)=>call(name,...args);}else ctx[name]=(...args)=>call(name,...args);}}
  for(const [k,v] of Object.entries(ctx))if(v&&typeof v==='object')Object.freeze(v);return Object.freeze(ctx);
 }
 function invoke(heroId,slot,hook,host,event){
  if(!HOOKS.includes(hook))throw Error('Unknown rule hook');const selected=select(heroId,slot);if(!selected||typeof selected.impl[hook]!=='function')return Object.freeze({handled:false});
  const facts=freeze(json(event));validateDeclaredCastFacts(selected.impl,slot,hook,facts);if('abilityId'in facts&&facts.abilityId!==selected.ability.id)throw Error('Mismatched ability event');
  if('owner'in facts){const owner=actorFact(host,facts.owner,sealed.resources);if(owner.heroId!==heroId)throw Error('Mismatched owner hero');}
  const result=selected.impl[hook](context(selected,host),facts);
  return Object.freeze({handled:true,value:result===undefined?null:freeze(json(result))});
 }
 function scheduled(heroId,slot,name,host,data){const selected=select(heroId,slot),handler=selected?.impl.scheduledHandlers[name];if(!handler)throw Error('Unknown named scheduled handler');return handler(context(selected,host),freeze(json(data)));}
 function snapshot(){return freeze({abiVersion:BATTLE_ABI,rulesHash:sealed.rulesHash,version:1,namespaces:[...namespaces].sort(([a],[b])=>a.localeCompare(b)).map(([name,state])=>({namespace:name,state:json(state)}))});}
 function prepareRestore(value){
  const next=json(value);if(Object.keys(next).sort().join(',')!=='abiVersion,namespaces,rulesHash,version'||next.abiVersion!==BATTLE_ABI||next.rulesHash!==sealed.rulesHash||next.version!==1||!Array.isArray(next.namespaces))throw Error('Incompatible rules-only snapshot');
  const known=new Map(sealed.manifest.map(row=>[namespace(row.heroId,row.slot),sealed.namespaceSchema(namespace(row.heroId,row.slot))])),pending=new Map();
  for(const row of next.namespaces){if(Object.keys(row).sort().join(',')!=='namespace,state'||pending.has(row.namespace)||!known.get(row.namespace)?.validate(row.state))throw Error('Invalid namespace snapshot');pending.set(row.namespace,freeze(json(row.state)));}
  return pending;
 }
 function restore(value){namespaces=prepareRestore(value);}
 return Object.freeze({sealed,invoke,scheduled,snapshot,restore,validateSnapshot:value=>{try{prepareRestore(value);return true;}catch{return false;}},validateFacts:host=>{try{actorFact(host,0,sealed.resources);actorFact(host,1,sealed.resources);return true;}catch{return false;}},has:(heroId,slot,hook='activate')=>typeof select(heroId,slot)?.impl[hook]==='function'});
}
