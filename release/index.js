import {heroes as definitions,createHeroRegistry as createSDKRegistry} from '../index.js';
import {freezeTree} from '../content/index.js';
import expected from './expected-manifest.json' with {type:'json'};
import profileData from './profile.json' with {type:'json'};
import {releasedFactory} from './factories.js';
freezeTree(expected);
export const releaseProfile=freezeTree(profileData);
export const releasedHeroIds=Object.freeze([...releaseProfile.heroIds]);
export const heroes=Object.freeze(definitions.filter(hero=>releasedHeroIds.includes(hero.registryNumericId)));
export const isReleasedHero=id=>releasedHeroIds.includes(id);
export function createReleasedHeroRegistry(initial=definitions) {
 const registry=createSDKRegistry(initial,{defaults:false});
 for(const row of expected)registry.registerFactory(row.heroId,row.slot,releasedFactory(row));
 return registry;
}
export {createReleasedHeroRegistry as createHeroRegistry};
export {createRuleSession,BATTLE_ABI,CAPABILITIES,HOOKS,codeIdentity,defineStateSchema,EMPTY_STATE_SCHEMA} from '../index.js';
