import assert from 'node:assert/strict';
import {createHeroRegistry,createRuleSession,heroes,isReleasedHero,releaseProfile} from '../../release/index.js';
import {heroes as definitions,createHeroRegistry as sdk} from '../../index.js';
import expected from '../../release/expected-manifest.json' with {type:'json'};
import {catalogStatus} from '../../release/catalog.js';
import {coreCodeIdentity} from '../../contract/code-identity.js';
export function checkReleasedProfile() {
 const sealed=createHeroRegistry().seal();assert.equal(heroes.length,28);assert.equal(sealed.manifest.length,112);assert.deepEqual(sealed.manifest,expected);assert.equal(sealed.rulesHash,releaseProfile.rulesHash);
 assert.equal(coreCodeIdentity().codeHash,'3314b572ee340d5b46fe9c1aef194f3354eec26bedc9738b18a4444e7f3f4858');
 assert.equal(sdk().seal().rulesHash,'b94c2f30890a591e6a64dfa030e74d5c3477662f5042b61eb50d369062059e01');
 for(const hero of definitions)for(let slot=0;slot<4;slot++)assert.equal(!!sealed.implementation(hero.registryNumericId,slot),isReleasedHero(hero.registryNumericId));
 assert.equal(catalogStatus.length,127);assert.equal(catalogStatus.filter(row=>row.selectable).length,28);assert.equal(catalogStatus.filter(row=>row.scope==='runtime'&&!row.selectable).length,18);assert.equal(catalogStatus.filter(row=>row.scope==='catalog-only').length,81);
 const session=createRuleSession(sealed),snapshot=session.snapshot();session.restore(snapshot);assert.deepEqual(session.snapshot(),snapshot);
 const wrong=structuredClone(snapshot);wrong.rulesHash='5747bdeffe9948c67882ea02858e7958a5ea15be090b08d9ac6d8561a57970a4';assert.throws(()=>session.restore(wrong));assert.deepEqual(session.snapshot(),snapshot);
 console.log('PASS released28/112 exact manifest, SDK/core identity,99 paused IDs and atomic snapshot mismatch');
}
