import {createBRule} from './programs.js';
import {statusContractFor} from './state.js';
import {BATTLE_ABI} from '../../index.js';
export const B_HERO_IDS=Object.freeze([57,58,62,71,81,82]);
export function registerB(registry,{statusMode='legacy'}={}){for(const heroId of B_HERO_IDS)for(let slot=0;slot<4;slot++)registry.registerFactory(heroId,slot,{abiVersion:BATTLE_ABI,parameters:{damageScale:1,healScale:1,statusContract:statusContractFor(registry.definition(heroId).abilities[slot].id,statusMode)},create:createBRule});return registry;}
export {combineAttack,combineInterval,combineMovement} from './model.js';
