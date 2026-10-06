import {BATTLE_ABI,codeIdentity,EMPTY_STATE_SCHEMA} from '../../index.js';
import {EVENT_VERSION,capabilities,admitted,gate,num,flag,validateCoefficients} from './remaining-common.js';
import {buildProjectile} from './remaining-projectiles.js';
import {buildEffect} from './remaining-effects.js';
import {buildPassive} from './remaining-passives.js';
export const REMAINING_SLOTS=Object.freeze([[10,0],[10,2],[11,0],[11,1],[11,2],[12,0],[12,1],[13,2],[14,0],[14,1],[15,0],[15,1],[15,2],[15,3],[16,0],[16,1],[16,2],[16,3],[17,0],[17,2],[17,3],[18,0],[18,1],[18,2],[18,3],[19,0],[19,1],[19,3]].map(Object.freeze));
const SOURCES=['rules/legacy-10-19/remaining.js','rules/legacy-10-19/remaining-common.js','rules/legacy-10-19/remaining-projectiles.js','rules/legacy-10-19/remaining-effects.js','rules/legacy-10-19/remaining-passives.js'];
export const CLEAVE_PARAMETER_SUPPORT=Object.freeze({wardForwardRangeWu:Object.freeze({role:'arena-ward-selection',default:330,min:0,max:1200,comparison:'distanceToTarget < wardForwardRangeWu'}),'mvp.damage':Object.freeze({role:'display-only',value:90,override:'rejected'}),'mvp.radius_wu':Object.freeze({role:'display-only',value:385.00000000000006,override:'rejected'}),'mvp.passive':Object.freeze({role:'fixed-admission',value:true,override:'rejected'})});
const isCleave=(heroId,slot)=>heroId===12&&slot===1;
function checkedOptions(options,allowWardRange){if(!options||typeof options!=='object'||Array.isArray(options)||![Object.prototype,null].includes(Object.getPrototypeOf(options)))throw Error('Invalid remaining factory options');const allowed=['hostSemantics','hostCapabilities',...(allowWardRange?['wardForwardRangeWu']:[])];if(Reflect.ownKeys(options).some(k=>!allowed.includes(k)))throw Error('Unsupported remaining factory option; wardForwardRangeWu is Cleave-only; mvp.damage/radius_wu overrides are unsupported');if(Object.hasOwn(options,'wardForwardRangeWu'))num(options.wardForwardRangeWu,'wardForwardRangeWu',0,1200);return options;}
export function remainingLegacyFactory(heroId,slot,options={}){if(!REMAINING_SLOTS.some(([h,s])=>h===heroId&&s===slot))throw Error('Unsupported remaining legacy identity');checkedOptions(options,isCleave(heroId,slot));const {hostSemantics=null,hostCapabilities=[]}=options;return {abiVersion:BATTLE_ABI,parameters:{heroId,slot,hostSemantics,hostCapabilities:capabilities(hostCapabilities),...(isCleave(heroId,slot)?{wardForwardRangeWu:options.wardForwardRangeWu??330}:{})},create(config){
 const {hero,definition,parameters}=config,{heroId,slot}=parameters,m=definition.mvp;
 if(Object.keys(parameters).sort().join(',')!==('heroId,hostCapabilities,hostSemantics,slot'+(isCleave(heroId,slot)?',wardForwardRangeWu':''))||hero.registryNumericId!==heroId||hero.abilities[slot].id!==definition.id)throw Error('Wrong remaining legacy factory identity/config');
 if(parameters.hostSemantics!==null&&parameters.hostSemantics!==EVENT_VERSION)throw Error('Unknown host event version');capabilities(parameters.hostCapabilities);validateCoefficients(m);
 const built=buildProjectile(config)||buildEffect(config)||buildPassive(config);if(!built)throw Error('No actual remaining handler');const {features,...implementation}=built;
 return {behaviorId:'legacy-10-19/remaining/'+definition.id,revision:isCleave(heroId,slot)?'1.1.0':'1.0.0',namespace:'heros/legacy-10-19/'+definition.id,...codeIdentity(SOURCES),stateSchema:EMPTY_STATE_SCHEMA,...implementation,
 planCast(ctx,facts){const plan={manaCost:m.mana,cooldownSeconds:m.cooldown_s,chargeCost:m.charges?1:0,windupSeconds:m.startup_frames/60,recoverySeconds:m.recovery_frames/60,action:'cast'};
  if(!admitted(config,facts,features))return {...plan,accepted:false,reason:'gated-native-legacy-capabilities'};gate(config,facts,features);
  if(m.passive)return {...plan,accepted:false,reason:'passive'};
  if(definition.id==='witch_doctor_restoration'&&flag(facts.toggleActive,'toggleActive'))return {...plan,accepted:true,manaCost:0,cooldownSeconds:0,chargeCost:0,windupSeconds:0,recoverySeconds:0,action:'toggle-off'};
  flag(facts.actionReady,'actionReady');num(facts.manaAvailable,'manaAvailable');num(facts.cooldownRemaining,'cooldownRemaining');num(facts.chargesAvailable,'chargesAvailable');const motion=['leap','leap_hit','dash_hit'].includes(m.effect),f=ctx.actor(facts.owner);
  return {...plan,accepted:facts.actionReady&&facts.manaAvailable>=m.mana&&facts.cooldownRemaining===0&&(!m.charges||facts.chargesAvailable>0)&&(!motion||!f.rooted&&f.y<=5)};
 }};
 }};}
export function registerRemainingLegacy10To19(registry,parameters={}){checkedOptions(parameters,true);const {wardForwardRangeWu,...shared}=parameters;const entries=REMAINING_SLOTS.map(([h,s])=>[h,s,remainingLegacyFactory(h,s,{...shared,...(isCleave(h,s)&&Object.hasOwn(parameters,'wardForwardRangeWu')?{wardForwardRangeWu}:{})})]);for(const [h,s,factory]of entries)registry.registerFactory(h,s,factory);return registry;}
export {EVENT_VERSION,FEATURE_NAMES} from './remaining-common.js';
