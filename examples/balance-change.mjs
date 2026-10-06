// Original finite request recorder; no Engine, native cast payment or real-world parity.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHeroRegistry,createRuleSession} from '../release/index.js';
export function balanceExample(damage=null) {
 const registry=createHeroRegistry(),definition=registry.definition(50).abilities[2];
 if(damage!==null)registry.replaceSkill(50,2,{definition:{...definition,mvp:{...definition.mvp,params:{...definition.mvp.params,damage}}}},{abilityId:definition.id,revision:'2.1.0'});
 const sealed=registry.seal(),session=createRuleSession(sealed),requests=[];let serial=0;
 const actors=[50,5].map((heroId,id)=>({id,heroId,hp:1000,maxHp:1000,mp:sealed.resources.maxMpByHero[heroId],maxMp:sealed.resources.maxMpByHero[heroId],x:id*20,y:0,dir:id===0?1:-1,alive:true,invulnerable:false,debuffImmune:false,passivesEnabled:true,guarding:false,rooted:false,silenced:false}));
 const host={now:()=>0,actor:id=>actors[id],random:()=>.25,ports:{
  target:{route:spec=>({accepted:true,reason:null,owner:spec.owner,target:spec.target,originalOwner:spec.owner,reflected:false,noReflect:false,noLifesteal:false})},
  damage(spec){requests.push(structuredClone(spec));return {accepted:true,landed:true,guarded:false,raw:spec.amount,actual:spec.amount,deferred:0,killedAtDebit:false};},
  cue(){},schedule:()=>`demo:job:${++serial}`,cancelJob:()=>true,
  status:{apply:()=>`demo:status:${++serial}`,remove:()=>true,query:()=>[],cleanse:()=>[]}
 }};
 session.invoke(50,2,'activate',host,{owner:0,target:1,abilityId:definition.id,slot:2,castId:'demo:cast:1',direction:1,aimX:20,heldSeconds:0,reflected:false});
 assert.equal(requests.length,1);assert.equal(requests[0].amount,damage??240);
 return {damageRequest:requests[0],rulesHash:sealed.rulesHash,nativeEvidence:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const baseline=balanceExample(),changed=balanceExample(60);assert.notEqual(baseline.rulesHash,changed.rulesHash);console.log(JSON.stringify({baseline,changed},null,2));
}
