import {BATTLE_ABI} from '../../contract/registry.js';
import {ADAPT,IDS} from './common.js';
import {createRazor} from './razor.js';
import {createSlardar} from './slardar.js';
import {createViper} from './viper.js';
import {createAbaddon} from './abaddon.js';
import {createBash} from './bash.js';
import {seaborn,INNATES} from './innates.js';
const createSlardarPassive=config=>seaborn(config,createBash(config));
export function core4Factory(heroId,slot){if(!IDS.includes(heroId)||!Number.isInteger(slot)||slot<0||slot>3)throw Error('Out of Core4 ownership');const create=heroId===31&&slot===2?createSlardarPassive:heroId===25?createRazor:heroId===31?createSlardar:heroId===45?createViper:createAbaddon;return {abiVersion:BATTLE_ABI,parameters:{...ADAPT,innates:INNATES},create};}
export function registerCore4(registry){for(const id of IDS)for(let slot=0;slot<4;slot++)registry.registerFactory(id,slot,core4Factory(id,slot));return registry;}
