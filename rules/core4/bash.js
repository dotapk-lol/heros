// Slardar Bash is a pure landed-attack rule; the host owns resource commits.
import {codeIdentity} from '../../contract/code-identity.js';
import {defineStateSchema} from '../../contract/state-schema.js';
export function createBash({definition,hero}){
 const p=definition.mvp.params,threshold=p.attack_count+1;
 if(!Number.isSafeInteger(threshold)||threshold<1||threshold>64||![p.bonus_damage,p.duration].every(n=>Number.isFinite(n)&&n>=0)||p.bonus_damage>1e7||p.duration>60)throw Error('Invalid Core4 Bash coefficients');
 const schema=defineStateSchema({id:'heros/core4/slardar-bash',schema:{anyOf:[{type:'null'},{type:'object',properties:{counts:{type:'object',properties:{'0':{type:'integer',minimum:0,maximum:threshold-1},'1':{type:'integer',minimum:0,maximum:threshold-1}},required:[],additionalProperties:false}},required:['counts'],additionalProperties:false}]}});
 return {behaviorId:'core4/slardar-bash',revision:'1.0.0',...codeIdentity(['rules/core4/bash.js']),requires:['damage','control','cue'],stateSchema:schema,
  onAttack(ctx,event){
   const f=ctx.actor(event.actor);if(f.heroId!==hero.registryNumericId||!event.landed)return;
   const counts={...(ctx.state.read()?.counts??{})},prior=counts[event.actor]??event.priorCount??0;
   if(!Number.isSafeInteger(prior)||prior<0||prior>=threshold)throw Error('Invalid private Bash counter fact');
   const next=f.passivesEnabled?prior+1:prior,proc=f.passivesEnabled&&next>=threshold;
   counts[event.actor]=proc?0:next;ctx.state.write({counts});
   if(proc){ctx.damage({source:event.actor,target:event.target,abilityId:definition.id,amount:p.bonus_damage,type:'physical',blockable:false,dot:true,passive:true});ctx.control.apply({owner:event.actor,target:event.target,abilityId:definition.id,key:definition.id,type:'stun',duration:p.duration,pierces:true,dispel:'strong'});ctx.cue({kind:'passive',abilityId:definition.id,actor:event.actor,target:event.target});}
   return {bashCount:counts[event.actor]};
  }
 };
}
export const core4Factories=Object.freeze([{heroId:31,slot:2,create:createBash}]);
