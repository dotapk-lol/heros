// Small pure rule fixtures. There is no Engine, input loop, AI or world restore.
import * as defaultAPI from '../index.js';
export function probeFactory(kind,{amount=35,namespace,limit=100,schema,api=defaultAPI}={}){
 return {abiVersion:api.BATTLE_ABI,parameters:{amount,limit},create({definition,parameters}){
  const stateSchema=schema??(kind==='state'?countSchema(api,parameters.limit):api.EMPTY_STATE_SCHEMA);
  const requires=kind==='damage'?['damage']:kind==='heal'?['heal']:[];
  const activate=kind==='damage'?(ctx,c)=>ctx.damage({source:c.owner,target:c.target,abilityId:definition.id,amount:parameters.amount,type:'pure'}):kind==='heal'?(ctx,c)=>ctx.heal({source:c.owner,target:c.owner,abilityId:definition.id,amount:parameters.amount}):kind==='state'?(ctx)=>ctx.state.write({count:(ctx.state.read()?.count??0)+1}):kind==='shared'?(ctx)=>ctx.state.write((ctx.state.read()??0)+1):kind==='facts'?(ctx,c)=>{
   for(const key of ['engine','fighters','input','cast','move','damage'])if(ctx[key]!==undefined)throw Error('Unexpected host access '+key);
   try{ctx.actor(c.target).hp=0;throw Error('Actor was writable');}catch(error){if(!(error instanceof TypeError))throw error;}
  }:()=>{};
  return {behaviorId:'probe/'+kind,revision:'2.0.0',...api.codeIdentity(['test/probes.mjs']),...(namespace?{namespace}:{}),requires,stateSchema,activate};
 }};
}
export function countSchema(api=defaultAPI,limit=100){return api.defineStateSchema({id:'test/count',schema:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,required:['count'],properties:{count:{type:'integer',minimum:0,maximum:limit}}}]}});}
export function sharedSchema(api=defaultAPI){return api.defineStateSchema({id:'test/shared',schema:{anyOf:[{type:'null'},{type:'integer',minimum:0,maximum:100}]}});}
export function closureSchema(limit,api=defaultAPI){return api.defineStateSchema({id:'test/closure',schema:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,required:['n'],properties:{n:{type:'integer',minimum:0,maximum:100}}}]},refinement:{id:'bounded-n',...api.codeIdentity(['test/probes.mjs']),validate:s=>s===null||s.n<=limit}});}
