import {codeIdentity,defineStateSchema} from '../../../index.js';
import {createExtensionDraft} from './index.mjs';
export const EXTENSION_SOURCE_FILES=Object.freeze(['rules/a/extensions/canonical.js','rules/a/extensions/common.mjs','rules/a/extensions/index.mjs','rules/a/extensions/swap.mjs','rules/a/extensions/mark.mjs','rules/a/extensions/rupture.mjs','rules/a/extensions/gaze.mjs','rules/a/extensions/exorcism.mjs','rules/a/extensions/dragon.mjs']);
const closed=p=>({type:'object',additionalProperties:false,required:Object.keys(p),properties:p});
const h={anyOf:[{type:'null'},{type:'string',minLength:1,maxLength:128}]},n={type:'integer',minimum:0,maximum:Number.MAX_SAFE_INTEGER},actor={enum:[0,1]};
const groups=new WeakMap();
export function refineExtension(state,parameters){return createExtensionDraft(parameters.definition).validateState(state);}
/** Branded v2 schema for proposed six-skill reducers; no port or registrar installation. */
export function canonicalExtension(config){
 if(!Array.isArray(config.definitions))throw Error('A_EXTENSION_REQUIRES_DETACHED_DEFINITIONS');
 let group=groups.get(config.definitions);if(!group){group=new Map();groups.set(config.definitions,group);}if(group.has(config.definition.id))return group.get(config.definition.id);
 const definition=config.definition,rule=createExtensionDraft(definition),p=definition.mvp.params;
 const base={abilityId:{const:definition.id},castId:{type:'string',minLength:1,maxLength:128},owner:actor,target:actor,reflected:{type:'boolean'},phase:{enum:['waiting','active','closed']}};
 const tail={
  vengefulspirit_nether_swap:{statusHandle:h,remaining:{type:'number',minimum:0,maximum:p.damage},lastCommit:n},
  kunkka_x_marks_the_spot:{statusHandle:h,returnX:{type:'number',minimum:45,maximum:1155}},
  bloodseeker_rupture:{statusHandle:h,lastX:{type:'number',minimum:0,maximum:1200},lastObservation:n},
  lich_sinister_gaze:{channelHandle:h,lastPulse:{type:'integer',minimum:0,maximum:Math.floor(p.channel_duration/.25+1e-8)}},
  death_prophet_exorcism:{swarmHandle:h,lastContact:n,actual:{type:'number',minimum:0,maximum:1e6},pending:{type:'array',maxItems:64,items:{type:'integer',minimum:1,maximum:Number.MAX_SAFE_INTEGER}}},
  dragon_knight_elder_dragon_form:{formHandle:h,profileHandle:h,lastAttack:n,corrosion:{type:'array',maxItems:2,items:closed({target:actor,handle:{type:'string',minLength:1,maxLength:128},ordinal:{type:'integer',minimum:0,maximum:Math.floor(p.corrosive_duration+1e-8)}})}}
 }[definition.id];
 const stateSchema=defineStateSchema({id:'heros/a/extension/'+definition.id,version:'2.0.0',schema:{anyOf:[{type:'null'},closed({...base,...tail})]},parameters:{definition},refinement:{id:'heros/a/extension/source-constraints',...codeIdentity(EXTENSION_SOURCE_FILES),validate:refineExtension}});
 const entry=Object.freeze({rule,stateSchema,...codeIdentity(EXTENSION_SOURCE_FILES)});group.set(definition.id,entry);return entry;
}
