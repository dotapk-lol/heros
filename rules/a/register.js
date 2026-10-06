import {BATTLE_ABI} from '../../index.js';
import {A_PARAMETERS} from './parameters.js';
import {createRule} from './runtime.js';
export const A_HERO_IDS=Object.freeze([21,28,29,32,36,42,47,50,55]);
/** Static registrar. It neither imports default content nor changes shared registries. */
export function registerA(registry){
 for(const id of A_HERO_IDS)for(let slot=0;slot<4;slot++)
  registry.registerFactory(id,slot,{abiVersion:BATTLE_ABI,parameters:A_PARAMETERS,create:createRule});
 return registry;
}
