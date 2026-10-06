import {canonical,freeze,json,sha256} from './value.js';
import {assertCodeIdentity} from './code-identity.js';
const owned=new WeakSet();
const types=new Set(['null','boolean','number','integer','string','array','object']);
function inspect(schema,depth=0){
 if(!schema||Object.getPrototypeOf(schema)!==Object.prototype||depth>24)throw Error('Invalid state schema');
 const allowed=new Set(['type','anyOf','const','enum','minimum','maximum','minLength','maxLength','minItems','maxItems','items','required','properties','additionalProperties']);
 if(Object.keys(schema).some(k=>!allowed.has(k)))throw Error('Unknown state schema keyword');
 if(schema.type!==undefined&&!types.has(schema.type))throw Error('Unknown state schema type');
 if(schema.type===undefined&&!schema.anyOf&&!Object.hasOwn(schema,'const')&&!schema.enum)throw Error('State schema requires explicit shape');
 if(schema.anyOf){if(!Array.isArray(schema.anyOf)||!schema.anyOf.length||schema.anyOf.length>64)throw Error('Invalid schema union');schema.anyOf.forEach(s=>inspect(s,depth+1));}
 for(const k of ['minimum','maximum','minLength','maxLength','minItems','maxItems'])if(schema[k]!==undefined&&(!Number.isFinite(schema[k])||!['minimum','maximum'].includes(k)&&(!Number.isSafeInteger(schema[k])||schema[k]<0)))throw Error('Invalid schema bound');
 if(schema.minimum!==undefined&&schema.maximum!==undefined&&schema.minimum>schema.maximum)throw Error('Reversed schema bounds');
 if(schema.type==='object'){if(!schema.properties||Object.getPrototypeOf(schema.properties)!==Object.prototype||schema.additionalProperties!==false||!Array.isArray(schema.required)||schema.required.some(k=>!Object.hasOwn(schema.properties,k)))throw Error('Object state schemas must be closed');Object.values(schema.properties).forEach(s=>inspect(s,depth+1));}
 if(schema.type==='array'){if(!schema.items||!Number.isSafeInteger(schema.maxItems)||schema.maxItems<0||schema.maxItems>4096)throw Error('Array schemas need a bounded item schema');inspect(schema.items,depth+1);}
}
function accepts(schema,value){
 if(schema.anyOf&&!schema.anyOf.some(s=>accepts(s,value)))return false;
 if(Object.hasOwn(schema,'const')&&canonical(schema.const)!==canonical(value))return false;
 if(schema.enum&&!schema.enum.some(v=>canonical(v)===canonical(value)))return false;
 if(schema.type==='null'&&value!==null||schema.type==='boolean'&&typeof value!=='boolean'||schema.type==='number'&&(typeof value!=='number'||!Number.isFinite(value))||schema.type==='integer'&&!Number.isSafeInteger(value)||schema.type==='string'&&typeof value!=='string'||schema.type==='array'&&!Array.isArray(value)||schema.type==='object'&&(!value||Object.getPrototypeOf(value)!==Object.prototype))return false;
 if(typeof value==='number'&&(schema.minimum!==undefined&&value<schema.minimum||schema.maximum!==undefined&&value>schema.maximum))return false;
 if(typeof value==='string'&&(schema.minLength!==undefined&&value.length<schema.minLength||schema.maxLength!==undefined&&value.length>schema.maxLength))return false;
 if(Array.isArray(value)){if(schema.minItems!==undefined&&value.length<schema.minItems||schema.maxItems!==undefined&&value.length>schema.maxItems)return false;if(schema.items&&!value.every(v=>accepts(schema.items,v)))return false;}
 if(schema.type==='object'){if(schema.required.some(k=>!Object.hasOwn(value,k))||Object.keys(value).some(k=>!Object.hasOwn(schema.properties,k)))return false;for(const [k,v] of Object.entries(value))if(!accepts(schema.properties[k],v))return false;}
 return true;
}
export function defineStateSchema({id,version='1.0.0',schema,refinement=null,parameters={}}){
 if(typeof id!=='string'||!/^[-a-zA-Z0-9/_.]{1,128}$/.test(id)||!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid canonical schema identity');
 const declaration=freeze(json(schema)),config=freeze(json(parameters));inspect(declaration);
 let refinementIdentity=null,refine=null;
 if(refinement){const code=assertCodeIdentity(refinement);if(typeof refinement.validate!=='function'||typeof refinement.id!=='string'||!refinement.id)throw Error('Invalid schema refinement');refinementIdentity=freeze({id:refinement.id,...code});refine=refinement.validate;}
 const identity={id,version,schema:declaration,parameters:config,refinement:refinementIdentity},schemaHash=sha256(canonical(identity));
 const result=Object.freeze({...identity,schemaHash,validate:value=>{try{const copy=json(value);return accepts(declaration,copy)&&(!refine||refine(copy,config)===true);}catch{return false;}}});owned.add(result);return result;
}
export const isStateSchema=value=>owned.has(value);
export const EMPTY_STATE_SCHEMA=defineStateSchema({id:'heros/empty-state',schema:{type:'null'}});
