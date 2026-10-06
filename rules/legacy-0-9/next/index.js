export {legacyStatusDraftFactory,registerLegacyStatusDrafts} from './status-skills.js';
export {legacyActiveDraftFactory,registerLegacyActiveDrafts} from './active-skills.js';
import {registerLegacyStatusDrafts} from './status-skills.js';
import {registerLegacyActiveDrafts} from './active-skills.js';
// Explicit draft registrar. Not imported by the frozen first-seven registrar.
export function registerLegacyNextDrafts(registry) {
  return registerLegacyActiveDrafts(registerLegacyStatusDrafts(registry));
}
