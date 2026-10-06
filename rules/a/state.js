import {codeIdentity,defineStateSchema} from '../../index.js';
const maximum=Number.MAX_SAFE_INTEGER;
const integer={type:'integer',minimum:1,maximum},time={type:'number',minimum:0,maximum:1e12};
const actor={enum:[0,1]},boolean={type:'boolean'},handle={type:'string',minLength:1,maxLength:160};
const closed=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const array=items=>({type:'array',maxItems:128,items});
const base={n:integer,owner:actor,target:actor,reflected:boolean};
const union=schemas=>schemas.length?{anyOf:schemas}:{type:'null'};
/** No closure configuration: all source schema variants come from schema.parameters. */
export function refineOwnState(state,parameters){
 if(state===null)return true;
 const used=new Set();for(const row of [...state.records,...state.jobs,...state.areas]){if(row.n>=state.next||used.has(row.n))return false;used.add(row.n);}
 for(const row of state.records)if(!parameters.statusSchemas.some(v=>row.key===v.key&&row.polarity===v.polarity&&row.program===v.program&&Math.abs(row.expires-row.startedAt-v.duration)<1e-7))return false;
 for(const row of state.areas)if(!parameters.areaSchemas.some(v=>row.kind===v.kind&&row.program===v.program&&row.interval===v.interval&&Math.abs(row.expires-row.startedAt-v.duration)<1e-7&&row.pulses*row.interval<=v.duration+1e-8))return false;
 for(const row of state.jobs)if(row.route!==(parameters.abilityId==='vengefulspirit_magic_missile'&&!row.reflected))return false;
 if(parameters.statusDeclarations){
  const handles=new Set();
  for(const row of state.records){
   const d=parameters.statusDeclarations.find(x=>x.id===row.statusDeclarationId);
   if(!d||row.key!==d.key||row.program!==d.programId||row.interval!==d.interval||row.polarity!==d.polarity||row.pierces!==d.pierces||row.target!==(d.recipient==='self'?row.owner:1-row.owner)||Math.abs(row.expires-row.startedAt-d.duration)>1e-7||handles.has(row.handle))return false;
   handles.add(row.handle);
  }
 }
 for(const row of state.records){
  const domain=parameters.programTargets?.find(x=>x.programId===row.program);
  if(domain&&(domain.statusRecipient!=='self'||domain.effectRecipient!=='enemy'||row.target!==row.owner||row.key!==domain.key||row.polarity!=='positive'||row.values.pulseToggle!==true))return false;
 }
 return true;
}
export function ownStateSchema(lookup,abilityId,statusSchemas,areaSchemas,delayPrograms,statusDeclarations=null,programTargets=[],areaDeliveryClock=null){
 lookup.schemas??=new Map();if(lookup.schemas.has(abilityId))return lookup.schemas.get(abilityId);
 const records=statusSchemas.map(v=>closed({...base,handle,key:{const:v.key},startedAt:time,expires:time,program:{const:v.program},interval:{const:v.interval},values:{const:v.values},remaining:{type:'number',minimum:0,maximum:Number(v.values.shield||0)},polarity:{const:v.polarity},pierces:{const:v.pierces},...(statusDeclarations?{statusDeclarationId:{const:v.statusDeclarationId}}:{})}));
 const areas=areaSchemas.map(v=>closed({...base,handle,startedAt:time,expires:time,interval:{const:v.interval},radius:{const:v.radius},follow:{const:v.follow},aimX:{type:'number',minimum:0,maximum:1200},program:{const:v.program},kind:{const:v.kind},pulses:{type:'integer',minimum:0,maximum}}));
 const jobs=[...delayPrograms].map(program=>closed({...base,handle,program:{const:program},aimX:{type:'number',minimum:0,maximum:1200},route:boolean}));
 const schema=defineStateSchema({id:'heros/a/'+abilityId,version:areaDeliveryClock?'2.3.0':statusDeclarations||programTargets.length?'2.2.0':'2.1.0',schema:{anyOf:[{type:'null'},closed({next:integer,records:array(union(records)),jobs:array(union(jobs)),areas:array(union(areas))})]},parameters:{abilityId,statusSchemas,areaSchemas,delayPrograms:[...delayPrograms],...(statusDeclarations?{statusDeclarations}:{}),...(programTargets.length?{programTargets}:{}),...(areaDeliveryClock?{areaDeliveryClock}:{})},refinement:{id:'heros/a/record-source-consistency',...codeIdentity(['rules/a/state.js']),validate:refineOwnState}});
 lookup.schemas.set(abilityId,schema);return schema;
}
