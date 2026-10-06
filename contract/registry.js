import {heroes} from '../content/index.js';
import {legacyThreeFactories} from '../rules/legacy-three.js';
import {canonical,freeze,json,sha256} from './value.js';
import {validateRecipe} from './definition-schema.js';
import {assertCodeIdentity,coreCodeIdentity} from './code-identity.js';
import {isStateSchema} from './state-schema.js';
import {buildResourceSchema} from './resource-schema.js';
import {validateScheduledBindings} from './schedule-schema.js';
import {validateCastFactRequirements,validateStatusDeclarations} from './rule-declarations.js';
export const BATTLE_ABI='heros-effects-2';
export const CAPABILITIES=Object.freeze(['damage','heal','mana','transfer-mana','self-damage','protect','status','control','target-route','motion-request','projectile-request','legacy-effect','schedule','action-token','deferred-hp','cue']);
export const HOOKS=Object.freeze(['planCast','onCastCommitted','activate','onContact','onInterrupt','onDeath','projectAttack','projectDamage','projectHealing','projectInterval','onAttack','onDamage','onTargeted','onStage']);
const semver=v=>typeof v==='string'&&/^\d+\.\d+\.\d+$/.test(v);
function validateDefinition(hero,resources){
 const h=json(hero);if(!Number.isSafeInteger(h.registryNumericId)||!Number.isSafeInteger(h.valveHeroId)||typeof h.id!=='string'||!Array.isArray(h.abilities)||h.abilities.length!==4)throw Error('Invalid hero identity/schema');
 for(const k of ['hp','mana_regen','attack','move_speed','attack_range','attack_interval_s'])if(!Number.isFinite(h[k])||h[k]<0||h[k]>1e7)throw Error('Invalid hero coefficient: '+k);
 for(const k of ['mana','combatHp','combatMana'])if(h[k]!==undefined&&(!Number.isFinite(h[k])||h[k]<0||h[k]>1e7))throw Error('Invalid optional hero coefficient: '+k);
 const ids=new Set();for(const a of h.abilities){if(typeof a.id!=='string'||ids.has(a.id)||!a.mvp||typeof a.mvp.passive!=='boolean')throw Error('Invalid ability identity/schema');ids.add(a.id);validateRecipe(a,resources);}
 return freeze(h);
}
function validateImplementation(raw,executionParameters){
 if(!raw||typeof raw.behaviorId!=='string'||!raw.behaviorId||!semver(raw.revision)||!Array.isArray(raw.requires)||new Set(raw.requires).size!==raw.requires.length||raw.requires.some(c=>!CAPABILITIES.includes(c))||!isStateSchema(raw.stateSchema))throw Error('Invalid behavior metadata/capabilities/canonical schema');
 const identity=assertCodeIdentity(raw);
 if(raw.namespace!==undefined&&(typeof raw.namespace!=='string'||!/^heros\/[a-z0-9/_-]{1,96}$/.test(raw.namespace)))throw Error('Invalid owned rule namespace');
 const allowed=new Set(['behaviorId','revision','requires','stateSchema','scheduledHandlers','scheduledBindings','requiredCastFacts','statusDeclarations','namespace','codeHash','sourceFiles',...HOOKS]);
 for(const k of Object.keys(raw)){if(!allowed.has(k))throw Error('Unknown behavior field: '+k);if(HOOKS.includes(k)&&typeof raw[k]!=='function')throw Error('Invalid behavior hook');}
 if(!HOOKS.some(k=>typeof raw[k]==='function'))throw Error('Empty implementation');
 if(raw.scheduledHandlers!==undefined&&(!raw.scheduledHandlers||Object.getPrototypeOf(raw.scheduledHandlers)!==Object.prototype||Object.entries(raw.scheduledHandlers).some(([k,v])=>!/^[-\w]{1,64}$/.test(k)||typeof v!=='function')))throw Error('Invalid scheduled handlers');
 const scheduledBindings=validateScheduledBindings(raw.scheduledBindings,raw.scheduledHandlers);if(scheduledBindings&&!raw.requires.includes('schedule'))throw Error('Scheduled binding requires schedule capability');
 const requiredCastFacts=validateCastFactRequirements(raw.requiredCastFacts,raw),statusDeclarations=validateStatusDeclarations(raw.statusDeclarations,raw,scheduledBindings);
 return Object.freeze({...raw,...(requiredCastFacts?{requiredCastFacts}:{}),...(statusDeclarations?{statusDeclarations}:{}),scheduledBindings,...identity,executionParameters,requires:Object.freeze([...raw.requires]),scheduledHandlers:Object.freeze({...raw.scheduledHandlers}),validateState:raw.stateSchema.validate});
}
const key=(heroId,slot)=>heroId+':'+slot;
function behaviorManifest(impl){return {behaviorId:impl.behaviorId,revision:impl.revision,requires:impl.requires,namespace:impl.namespace??null,codeHash:impl.codeHash,sourceFiles:impl.sourceFiles,executionParameters:impl.executionParameters,stateSchema:{id:impl.stateSchema.id,version:impl.stateSchema.version,schemaHash:impl.stateSchema.schemaHash,schema:impl.stateSchema.schema,parameters:impl.stateSchema.parameters,refinement:impl.stateSchema.refinement},hooks:HOOKS.filter(k=>impl[k]),...(impl.requiredCastFacts?{requiredCastFacts:impl.requiredCastFacts}:{}),...(impl.statusDeclarations?{statusDeclarations:impl.statusDeclarations}:{}),scheduledHandlers:Object.keys(impl.scheduledHandlers).sort(),scheduledBindings:impl.scheduledBindings};}
export function createHeroRegistry(initial=heroes,{defaults=true}={}){
 if(!Array.isArray(initial)||initial.length!==heroes.length)throw Error('Expected frozen 46 roster');
 const initialResources=buildResourceSchema(initial);
 const identity=new Map(heroes.map(h=>[h.registryNumericId,h])),rows=new Map();let locked=false,cached,definitionCache,compiledCache;
 function checkIdentity(h){const expected=identity.get(h.registryNumericId);if(!expected||expected.id!==h.id||expected.valveHeroId!==h.valveHeroId||h.abilities.some((a,i)=>a.id!==expected.abilities[i].id))throw Error('Out-of-scope hero/ability identity');}
 for(const source of initial){const h=validateDefinition(source,initialResources);checkIdentity(h);if(rows.has(h.registryNumericId))throw Error('Duplicate hero');rows.set(h.registryNumericId,h);}
 let factories=new Map();const allDefinitions=()=>definitionCache??=freeze([...rows.values()]);
 function checkedFactory(factory){if(!factory||factory.abiVersion!==BATTLE_ABI||typeof factory.create!=='function'||Object.keys(factory).some(k=>!['abiVersion','create','parameters'].includes(k)))throw Error('Invalid factory/ABI');return Object.freeze({...factory,parameters:freeze(json(factory.parameters??{}))});}
 function compile(definitions,entries){
  const byId=new Map(definitions.map(h=>[h.registryNumericId,h])),implementations=new Map(),schemas=new Map();
  for(const [id,factory] of entries){const [heroId,slot]=id.split(':').map(Number),hero=byId.get(heroId),impl=validateImplementation(factory.create(Object.freeze({hero,definition:hero.abilities[slot],definitions,resources:buildResourceSchema(definitions),parameters:factory.parameters})),factory.parameters),namespace=impl.namespace??'skill:'+heroId+':'+hero.abilities[slot].id;
   const existing=schemas.get(namespace),next=impl.stateSchema;if(existing&&(existing.schemaHash!==next.schemaHash||existing.id!==next.id||existing.version!==next.version||existing.validate!==next.validate))throw Error('Conflicting canonical namespace schema');schemas.set(namespace,next);implementations.set(id,impl);
  }
  return {implementations,schemas};
 }
 function registerFactory(heroId,slot,source){
  if(locked)throw Error('Registry sealed');if(!rows.has(heroId)||!Number.isInteger(slot)||slot<0||slot>3)throw Error('Invalid hero/slot');const id=key(heroId,slot);if(factories.has(id))throw Error('Duplicate skill implementation');const factory=checkedFactory(source),prospective=new Map(factories);prospective.set(id,factory);const compiled=compile(allDefinitions(),prospective);factories=prospective;compiledCache=compiled;return api;
 }
 function replaceSkill(heroId,slot,replacement,expected){
  if(locked)throw Error('Registry sealed');const hero=rows.get(heroId),oldFactory=factories.get(key(heroId,slot));if(!hero||!oldFactory)throw Error('No registered skill');const before=compiledCache??compile(allDefinitions(),factories),old=hero.abilities[slot],oldImpl=before.implementations.get(key(heroId,slot));
  if(!expected||expected.abilityId!==old.id||expected.revision!==oldImpl.revision)throw Error('Stale expected ability/revision');if(!replacement?.definition||replacement.definition.id!==old.id)throw Error('Replacement must retain selected ability identity');
  const next=validateDefinition({...hero,abilities:hero.abilities.map((a,i)=>i===slot?replacement.definition:a)},buildResourceSchema(allDefinitions())),definitions=freeze(allDefinitions().map(h=>h.registryNumericId===heroId?next:h)),prospective=new Map(factories);if(replacement.factory)prospective.set(key(heroId,slot),checkedFactory(replacement.factory));const compiled=compile(definitions,prospective),nextImpl=compiled.implementations.get(key(heroId,slot));
  if(replacement.factory&&canonical(behaviorManifest(nextImpl))===canonical(behaviorManifest(oldImpl)))throw Error('Behavior replacement requires a changed declared identity or execution parameters');
  // All sharing schemas compile against the same prospective definitions and
  // finish validation before any registry row/cache/factory is changed.
  rows.set(heroId,next);factories=prospective;definitionCache=definitions;compiledCache=compiled;return api;
 }
 function seal(){
  if(cached)return cached;const definitions=allDefinitions(),compiled=compiledCache??compile(definitions,factories),manifest=[];for(const [id,impl] of compiled.implementations){const [heroId,slot]=id.split(':').map(Number);manifest.push({heroId,slot,abilityId:rows.get(heroId).abilities[slot].id,...behaviorManifest(impl)});}
  const rosterHash=sha256(canonical(definitions.map(h=>({heroId:h.registryNumericId,valveHeroId:h.valveHeroId,id:h.id,abilities:h.abilities.map(a=>a.id)})))),rulesHash=sha256(canonical({abi:BATTLE_ABI,coreCode:coreCodeIdentity(),definitions,resources:buildResourceSchema(definitions),manifest:manifest.sort((a,b)=>a.heroId-b.heroId||a.slot-b.slot)}));cached=Object.freeze({abiVersion:BATTLE_ABI,rulesHash,rosterHash,definitions,resources:buildResourceSchema(definitions),manifest:freeze(manifest),hero:heroId=>rows.get(heroId)??null,implementation:(heroId,slot)=>compiled.implementations.get(key(heroId,slot))??null,namespaceSchema:namespace=>compiled.schemas.get(namespace)??null});locked=true;return cached;
 }
 const api=Object.freeze({registerFactory,replaceSkill,seal,definition:heroId=>rows.get(heroId)??null});if(defaults)for(const row of legacyThreeFactories)registerFactory(row.heroId,row.slot,{abiVersion:BATTLE_ABI,create:row.create});return api;
}
