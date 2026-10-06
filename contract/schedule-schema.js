// ABI2 optional typed scheduling. Binding controls original native lifetime;
// data stays opaque. Stable opaque handles include host generation/round identity.
import {freeze,json} from './value.js';
const exact=(v,keys)=>v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const actor=v=>v===0||v===1;
const ref=v=>typeof v==='string'&&/^[-a-zA-Z0-9_:/.]{1,160}$/.test(v);
const phases=Object.freeze({'source-job':['pack.job-due'],status:['actor.status-pre-advance','actor.status-advance'],'entity-area':['pack.entity'],'entity-link':['pack.entity'],channel:['pack.entity'],swarm:['actor.swarm'],passive:['actor.passive']});
export function bindingKind(binding){if(!binding||!Object.hasOwn(phases,binding.kind)&&binding.kind!=='entity')throw Error('Unknown schedule binding');if(binding.kind==='source-job'||binding.kind==='passive'){if(!exact(binding,['kind']))throw Error('Invalid unreferenced binding');return binding.kind;}if(binding.kind==='entity'){if(!exact(binding,['kind','mode','ref'])||!['area','link'].includes(binding.mode)||!ref(binding.ref))throw Error('Invalid entity binding');return 'entity-'+binding.mode;}if(!exact(binding,['kind','ref'])||!ref(binding.ref))throw Error('Invalid accepted host reference');return binding.kind;}
export function validateScheduledBindings(value,handlers){
 if(value===undefined)return null;
 if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).length>64)throw Error('Invalid scheduled binding manifest');
 for(const [name,pairs]of Object.entries(value)){if(!Object.hasOwn(handlers??{},name)||!Array.isArray(pairs)||!pairs.length||pairs.length>8)throw Error('Undeclared scheduled handler binding');const seen=new Set();for(const pair of pairs){if(!exact(pair,['binding','delivery'])||!Object.hasOwn(phases,pair.binding)||!phases[pair.binding].includes(pair.delivery))throw Error('Invalid binding/delivery pair');const key=pair.binding+':'+pair.delivery;if(seen.has(key))throw Error('Duplicate binding/delivery pair');seen.add(key);}}
 return freeze(json(value));
}
export function validateScheduleRequest(spec,manifest){
 if(!spec||!['target','binding','delivery'].some(k=>Object.hasOwn(spec,k)))return true;
 // target existed on legacy requests; only a valid legacy actor preserves that path.
 if(Object.hasOwn(spec,'target')&&actor(spec.target)&&!['binding','delivery'].some(k=>Object.hasOwn(spec,k)))return true;
 if(!['target','binding','delivery'].every(k=>Object.hasOwn(spec,k))||!actor(spec.owner)||spec.target!==null&&!actor(spec.target)||!Number.isFinite(spec.delay)||spec.delay<0||spec.delay>3600)throw Error('Incomplete typed schedule metadata');
 const kind=bindingKind(spec.binding);if(!phases[kind].includes(spec.delivery)||['status','entity-link','channel'].includes(kind)&&spec.target===null)throw Error('Invalid typed schedule target or phase');
 if(!manifest?.[spec.handler]?.some(pair=>pair.binding===kind&&pair.delivery===spec.delivery))throw Error('Handler did not declare this binding/delivery');
 return true;
}
