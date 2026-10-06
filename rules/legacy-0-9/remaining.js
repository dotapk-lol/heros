import {BATTLE_ABI,EMPTY_STATE_SCHEMA} from '../../index.js';
import {EVENT_VERSION,FEATURES,caps,closed,coefficients,identity,admitted,event,num,flag,near} from './remaining-common.js';
import {buildProjectile} from './remaining-projectiles.js';
import {buildEffect} from './remaining-effects.js';
import {buildChannel} from './remaining-channels.js';
import {buildPassive} from './remaining-passives.js';
export const REMAINING_SLOTS=Object.freeze([[0,0],[0,1],[0,3],[1,0],[1,1],[1,3],[2,0],[2,1],[2,3],[3,1],[3,2],[4,0],[4,3],[5,0],[6,0],[6,3],[7,0],[7,1],[7,2],[8,0],[8,2],[9,0],[9,2]].map(Object.freeze));
export function remainingLegacyFactory(heroId,slot,{hostSemantics=null,hostCapabilities=[]}={}){if(!REMAINING_SLOTS.some(([h,s])=>h===heroId&&s===slot))throw Error('Out of owned remaining scope');return {abiVersion:BATTLE_ABI,parameters:{heroId,slot,hostSemantics,hostCapabilities:caps(hostCapabilities)},create(config){const {hero,definition,parameters:p}=config,m=definition.mvp;closed(p,['heroId','slot','hostSemantics','hostCapabilities'],'factory parameters');if(hero.registryNumericId!==p.heroId||hero.abilities[p.slot].id!==definition.id)throw Error('Wrong registered owner');if(p.hostSemantics!==null&&p.hostSemantics!==EVENT_VERSION)throw Error('Unknown event version');caps(p.hostCapabilities);coefficients(m);for(const k of ['focusChance','daggerFocusChance','mana_burn_pct','on_attack_slow','magic_reduction'])if(m[k]!==undefined)num(m[k],k,0,1);if(m.critMultiplier!==undefined)num(m.critMultiplier,'critMultiplier',1,100);for(const k of ['max_stacks','trigger_every_received_attacks'])if(m[k]!==undefined&&(!Number.isInteger(m[k])||m[k]<1||m[k]>64))throw Error('Invalid finite count '+k);if(m.effect==='multi'&&(!Number.isInteger(m.ticks)||m.ticks<1||m.ticks>128))throw Error('Invalid bounded jobs');
 const built=buildProjectile(config)||buildEffect(config)||buildChannel(config)||buildPassive(config);if(!built)throw Error('Missing actual handler');const {features,...impl}=built;
 return {behaviorId:'legacy-0-9/remaining/'+definition.id,revision:'1.0.0',namespace:'heros/legacy-0-9/'+definition.id,...identity(),stateSchema:EMPTY_STATE_SCHEMA,...impl,
 planCast(ctx,e){const plan={manaCost:m.mana,cooldownSeconds:m.cooldown_s,chargeCost:m.charges?1:0,windupSeconds:m.startup_frames/60,recoverySeconds:m.recovery_frames/60,action:'cast'};if(!admitted(config,e,features))return {...plan,accepted:false,reason:'gated-native-legacy-capabilities'};
  event(config,e,features,['actionReady','manaAvailable','cooldownRemaining','chargesAvailable','toggleActive']);for(const k of ['actionReady','toggleActive'])flag(e[k],k);for(const k of ['manaAvailable','cooldownRemaining','chargesAvailable'])num(e[k],k);
  if(m.passive)return {...plan,accepted:false,reason:'passive'};if(m.toggle&&e.toggleActive)return {...plan,accepted:true,manaCost:0,cooldownSeconds:0,chargeCost:0,windupSeconds:0,recoverySeconds:0,action:'toggle-off'};
  const t=ctx.actor(e.target),validDrain=m.effect!=='drain'||near(ctx,e,m.range_wu)&&t.alive&&!t.invulnerable&&!t.debuffImmune;
  return {...plan,accepted:e.actionReady&&e.manaAvailable>=m.mana&&e.cooldownRemaining===0&&(!m.charges||e.chargesAvailable>0)&&validDrain};}
 };}};}
export function registerRemainingLegacy0To9(registry,parameters={}){for(const [h,s]of REMAINING_SLOTS)registry.registerFactory(h,s,remainingLegacyFactory(h,s,parameters));return registry;}
export {EVENT_VERSION,FEATURES};
