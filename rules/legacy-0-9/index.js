export {directHitFactory, registerLegacyDirectHits} from './direct-hit.js';
export {passiveProjectionFactory, registerLegacyPassiveProjections} from './projections.js';
import {registerLegacyDirectHits} from './direct-hit.js';
import {registerLegacyPassiveProjections} from './projections.js';
export function registerLegacy0To9(registry) {
  return registerLegacyPassiveProjections(registerLegacyDirectHits(registry));
}
