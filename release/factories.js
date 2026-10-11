import {sixFactory} from '../rules/six/index.js';
// Public composition of reviewed rule factories. No game host or private dispatcher.
import {BATTLE_ABI} from '../index.js';
import {legacyThreeFactories} from '../rules/legacy-three.js';
import {createRule} from '../rules/a/runtime.js';
import {extensionCanonicalFactory} from '../rules/a/extensions/proposal.js';
import {createBRule} from '../rules/b/programs.js';
import {createBash} from '../rules/core4/bash.js';
import {createSlardar} from '../rules/core4/slardar.js';
import {remainingLegacyFactory as zero} from '../rules/legacy-0-9/remaining.js';
import {remainingLegacyFactory as ten} from '../rules/legacy-10-19/remaining.js';
import {legacyFactory} from '../rules/legacy-10-19/index.js';
import {directHitFactory} from '../rules/legacy-0-9/direct-hit.js';
import {passiveProjectionFactory} from '../rules/legacy-0-9/projections.js';
import {legacyActiveDraftFactory} from '../rules/legacy-0-9/next/active-skills.js';
import {legacyStatusDraftFactory} from '../rules/legacy-0-9/next/status-skills.js';
export function releasedFactory(row) {
 const {heroId:h,slot:s,behaviorId:id,executionParameters:p}=row;
 if(id.startsWith('six-heroes/'))return sixFactory(h,s);
 if(id.startsWith('heros/a/extension-dispatch/')) return extensionCanonicalFactory;
 if(id.startsWith('heros/a/v8/')) return {abiVersion:BATTLE_ABI,parameters:p,create:createRule};
 if(id.startsWith('b-v6/')) return {abiVersion:BATTLE_ABI,parameters:p,create:createBRule};
 if(id==='core4/slardar-bash') return {abiVersion:BATTLE_ABI,create:createBash};
 if(id.startsWith('core4/slardar_')) return {abiVersion:BATTLE_ABI,parameters:p,create:createSlardar};
 if(id.startsWith('legacy-0-9/remaining/')) return zero(h,s,{hostSemantics:p.hostSemantics,hostCapabilities:p.hostCapabilities});
 if(id.startsWith('legacy-10-19/remaining/')) return ten(h,s,{hostSemantics:p.hostSemantics,hostCapabilities:p.hostCapabilities});
 if(id.startsWith('legacy-10-19/')) return legacyFactory(h,s,{damageMultiplier:p.damageMultiplier});
 if(id.startsWith('legacy-0-9-next/')) return Object.keys(p).length?legacyActiveDraftFactory(row.abilityId,p):legacyStatusDraftFactory();
 if(id.startsWith('legacy-0-9/')) return Object.keys(p).length?directHitFactory(p):passiveProjectionFactory();
 if(id.startsWith('legacy/')) {const found=legacyThreeFactories.find(x=>x.heroId===h&&x.slot===s);if(found)return {abiVersion:BATTLE_ABI,create:found.create};}
 throw Error('Unsupported released factory identity: '+id);
}
