import {BATTLE_ABI} from '../../contract/registry.js';
import {create as centaur} from './centaur.js';
import {create as skywrath} from './skywrath.js';
import {create as extra} from './extra.js';
import {IDS} from './common.js';
export function registerC(registry){for(const id of IDS)for(let slot=0;slot<4;slot++)registry.registerFactory(id,slot,{abiVersion:BATTLE_ABI,create:id===94?centaur:id===99?skywrath:extra});return registry;}
