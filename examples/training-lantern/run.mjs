import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHeroRegistry,createRuleSession} from '../../index.js';
import {installTrainingLantern,CARRIER_HERO_ID,trainingPresentation} from './plugin.mjs';
import {createTrainingRecorder} from './host.mjs';
export function runTrainingExample({owner=0,parameters={}}={}) {
 const registry=installTrainingLantern(createHeroRegistry(undefined,{defaults:false}),parameters),sealed=registry.seal(),session=createRuleSession(sealed),recorder=createTrainingRecorder(sealed,{owner});
 const target=1-owner;
 const cast=slot=>({owner,target,abilityId:sealed.hero(CARRIER_HERO_ID).abilities[slot].id,slot,castId:`training:cast:${slot}`,direction:owner===0?1:-1,aimX:20,heldSeconds:0,reflected:false});
 const event=cast(0);
 const plan=session.invoke(CARRIER_HERO_ID,0,'planCast',recorder.host,{owner,target,abilityId:event.abilityId,slot:0,direction:event.direction,aimX:event.aimX,heldSeconds:0,actionReady:true,manaAvailable:recorder.actors[owner].mp,cooldownRemaining:0,chargesAvailable:0});
 assert.equal(plan.value.accepted,true);
 // Test recorder has no cast payment, cooldowns or native commit. Host would do those first.
 const spark=session.invoke(CARRIER_HERO_ID,0,'activate',recorder.host,event);
 assert.equal(spark.value.actual,parameters.damage??15);
 session.invoke(CARRIER_HERO_ID,1,'activate',recorder.host,cast(1));
 session.invoke(CARRIER_HERO_ID,2,'onAttack',recorder.host,{owner,target,abilityId:cast(2).abilityId});
 const rulesCheckpoint=session.snapshot(),hostCheckpoint=recorder.checkpoint();
 recorder.advance(session,.5);
 session.invoke(CARRIER_HERO_ID,3,'activate',recorder.host,cast(3));
 const first={rules:session.snapshot(),host:recorder.checkpoint()};
 session.restore(rulesCheckpoint);recorder.restore(hostCheckpoint);
 recorder.advance(session,.5);
 session.invoke(CARRIER_HERO_ID,3,'activate',recorder.host,cast(3));
 assert.deepEqual({rules:session.snapshot(),host:recorder.checkpoint()},first);
 return {presentation:trainingPresentation.name,identityCarrier:CARRIER_HERO_ID,rulesHash:sealed.rulesHash,replayed:true,trace:recorder.trace,actors:recorder.actors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(runTrainingExample(),null,2));
