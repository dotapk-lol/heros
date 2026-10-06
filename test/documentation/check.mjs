import {pathToFileURL} from 'node:url';
// One named documentation test per process. No catalog skill mechanism suite.
import assert from 'node:assert/strict';
import {heroes,createHeroRegistry,createRuleSession,BATTLE_ABI,codeIdentity,EMPTY_STATE_SCHEMA} from '../../index.js';
import {installTrainingLantern,trainingFactory,CARRIER_HERO_ID} from '../../examples/training-lantern/plugin.mjs';
import {createTrainingRecorder} from '../../examples/training-lantern/host.mjs';
import {runTrainingExample} from '../../examples/training-lantern/run.mjs';
const assemble=(parameters={})=>installTrainingLantern(createHeroRegistry(undefined,{defaults:false}),parameters).seal();
const tests={
 terminal() {
  const result=runTrainingExample();assert.equal(result.replayed,true);
  assert.deepEqual(result.trace.filter(row=>row.port==='heal').map(row=>row.time),[0,.25,.5]);
  assert.equal(result.actors[0].hp,96);assert.equal(result.actors[1].hp,62);
  assert.deepEqual(result.trace.filter(row=>row.port==='damage').map(row=>row.request.amount),[15,3]);
 },
 right() {
  const result=runTrainingExample({owner:1});assert.equal(result.replayed,true);
  assert.equal(result.actors[1].hp,96);assert.equal(result.actors[0].hp,62);
  for(const row of result.trace.filter(row=>row.port==='damage')) {assert.equal(row.request.source,1);assert.equal(row.request.target,0);}
 },
 parameters() {
  const baseline=assemble(),changed=assemble({damage:21});assert.notEqual(changed.rulesHash,baseline.rulesHash);
  const result=runTrainingExample({parameters:{damage:21}});assert.equal(result.trace[0].result.actual,21);assert.equal(result.actors[1].hp,56);
  const registry=createHeroRegistry(undefined,{defaults:false});assert.throws(()=>registry.registerFactory(1,0,trainingFactory(0,{damage:NaN})));assert.equal(registry.seal().manifest.length,0);
 },
 restore() {
  const sealed=assemble(),session=createRuleSession(sealed),fixture=createTrainingRecorder(sealed);
  const abilityId=sealed.hero(1).abilities[2].id;
  session.invoke(1,2,'onAttack',fixture.host,{owner:0,target:1,abilityId});const checkpoint=session.snapshot();
  const changed=createRuleSession(assemble({damage:21}));assert.equal(changed.validateSnapshot(checkpoint),false);assert.throws(()=>changed.restore(checkpoint));assert.deepEqual(changed.snapshot().namespaces,[]);
  const invalid=structuredClone(checkpoint);invalid.namespaces[0].state.attacks=-1;
  assert.equal(session.validateSnapshot(invalid),false);assert.throws(()=>session.restore(invalid));assert.deepEqual(session.snapshot(),checkpoint);
  const duplicate=structuredClone(checkpoint);duplicate.namespaces.push(duplicate.namespaces[0]);assert.throws(()=>session.restore(duplicate));assert.deepEqual(session.snapshot(),checkpoint);
 },
 passive() {
  const sealed=assemble(),session=createRuleSession(sealed),fixture=createTrainingRecorder(sealed);
  const event={owner:0,target:1,abilityId:sealed.hero(1).abilities[2].id};
  fixture.actors[0].passivesEnabled=false;session.invoke(1,2,'onAttack',fixture.host,event);assert.deepEqual(session.snapshot().namespaces,[]);assert.equal(fixture.trace.length,0);
  fixture.actors[0].passivesEnabled=true;session.invoke(1,2,'onAttack',fixture.host,event);assert.equal(session.snapshot().namespaces[0].state.attacks,1);assert.equal(fixture.trace[0].result.actual,3);
  session.invoke(1,2,'onDeath',fixture.host,event);assert.deepEqual(session.snapshot().namespaces,[]);
  assert.equal(session.has(1,2),false);assert.equal(session.has(1,2,'onAttack'),true);
 },
 boundaries() {
  assert.throws(()=>codeIdentity(['outside/unreviewed-plugin.mjs']),/Unknown reviewed/);
  const roster=structuredClone(heroes);roster[1].id='original-lantern-keeper';assert.throws(()=>createHeroRegistry(roster,{defaults:false}),/Out-of-scope/);
  const registry=createHeroRegistry(undefined,{defaults:false});let invoked=false;
  registry.registerFactory(CARRIER_HERO_ID,0,{abiVersion:BATTLE_ABI,create:()=>({behaviorId:'example/docs-boundary',revision:'1.0.0',...codeIdentity(['test/documentation/check.mjs']),requires:[],stateSchema:EMPTY_STATE_SCHEMA,activate(ctx,event) {invoked=true;assert.equal(ctx.damage,undefined);assert.equal(ctx.status,undefined);assert.equal(Object.isFrozen(event),true);assert.equal(Object.isFrozen(ctx.actor(0)),true);assert.throws(()=>{ctx.actor(0).hp=1;},TypeError);return {hp:ctx.actor(0).hp};}})});
  const sealed=registry.seal(),session=createRuleSession(sealed),fixture=createTrainingRecorder(sealed),event={owner:0,target:1,abilityId:sealed.hero(1).abilities[0].id};
  assert.equal(session.invoke(1,0,'activate',fixture.host,event).value.hp,80);assert.equal(fixture.actors[0].hp,80);invoked=false;
  assert.throws(()=>session.invoke(1,0,'activate',fixture.host,{...event,abilityId:'other-ability'}),/Mismatched ability/);assert.equal(invoked,false);assert.equal(fixture.trace.length,0);
 },
 defaults() {
  const sealed=createHeroRegistry().seal();
  assert.equal(sealed.rulesHash,'b94c2f30890a591e6a64dfa030e74d5c3477662f5042b61eb50d369062059e01');
  assert.deepEqual(sealed.manifest.map(row=>[row.heroId,row.slot,row.abilityId]),[[5,1,'anti_mage_blink'],[5,3,'anti_mage_mana_void'],[9,1,'lion_hex']]);
  assert.equal(heroes.length,46);assert.equal(heroes.every(hero=>hero.abilities.length===4),true);
 }
};
export function checkDocumentation(name) {if(!Object.hasOwn(tests,name)) throw Error('Choose exactly one: '+Object.keys(tests).join(', '));tests[name]();console.log('PASS documentation '+name);}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) checkDocumentation(process.argv[2]);
