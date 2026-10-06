// One bounded Node process, serial focused tests; no worker pool or game suites.
import {checkDocumentation} from '../test/documentation/check.mjs';
import {checkReleasedProfile} from '../test/release/profile.mjs';
import {balanceExample} from '../examples/balance-change.mjs';
import assert from 'node:assert/strict';
for(const name of ['terminal','right','parameters','restore','passive','boundaries','defaults'])checkDocumentation(name);
checkReleasedProfile();
const baseline=balanceExample(),changed=balanceExample(60);assert.notEqual(baseline.rulesHash,changed.rulesHash);console.log('PASS original public balance recorder requests240→60; no native-world claim');
