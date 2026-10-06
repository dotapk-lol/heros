# Adding hero behavior: complete original training example

The low-level SDK accepts only the frozen 46-hero/four-slot identity roster. It has no public addHero API. A truly new hero ID or ability ID is rejected even if it otherwise looks like HeroDefinition. This page gives the complete currently runnable extension path, then the separate steps required for a future identity expansion.

## Lantern Keeper: original logic on a fixed identity carrier

The original presentation name and four training skills are Lantern Keeper / Spark / Mend / Echo / Clear Sky. They are not catalog hero mechanics or new public stable IDs. The carrier is registryNumericId **1**, preserving its shipped hero ID, Valve ID and four ability IDs. The fixture runs no shipped catalog factory. The existing slot family is active/active/passive/active, which the example preserves.

| Slot | Original training behavior | Actual public boundary |
| --- | --- | --- |
| 0 | Spark: 15 magical damage | planCast, activate, damage receipt |
| 1 | Mend: 12 healing plus .25/.5-second 2-point pulses | heal, status declaration, typed status job |
| 2 | Echo: 3 pure passive damage and counted attacks | onAttack, canonical namespace state, onDeath cleanup |
| 3 | Clear Sky: cleanse then protection intent | status.cleanse, protect request; recorder does not implement protection |

Complete sources: [plugin.mjs](../examples/training-lantern/plugin.mjs), [host.mjs](../examples/training-lantern/host.mjs), [run.mjs](../examples/training-lantern/run.mjs). They contain only original example logic and the public API. No Valve artwork, descriptions, audio, private engine or network integration is used.

```js
import { createHeroRegistry, createRuleSession } from '../index.js';
import { installTrainingLantern } from './training-lantern/plugin.mjs';
const registry = createHeroRegistry(undefined, { defaults: false });
installTrainingLantern(registry, { damage: 21 });
const sealed = registry.seal();
const session = createRuleSession(sealed);
// Supply an accepted host/event to session.invoke before effects can occur.
```

The imports above show usage from another file in examples/. The shipped run.mjs uses its own correct relative paths and provides the finite recorder. Build the actual source fingerprint before registration. There is no package subpath export for this training module yet.

## Step-by-step extension in the existing roster

1. Select the stable hero and slots. Check passive/input/effect families; do not change the catalog's identity or pretend the presentation label is a registry ID.
2. Add a source-owned static module under examples/ for teaching or an approved rules module for actual behavior. Declare real source paths, revision, minimal requires, immutable parameters and a canonical state schema.
3. Capture selected definitions/parameters in create. Use only context ports, read actual receipts, and separate admission/commit/delivery responsibilities.
4. For periodic work declare status source parameters and named binding/delivery pairs. Use accepted handles, then consume authenticated effective record views.
5. Register into a fresh defaults:false assembly, or use replaceSkill with expected ID/revision for an existing registration. Seal only after validated edits.
6. Generate the source fingerprint; run focused actual-effect, configuration, lifecycle and replay checks. Freeze exact files and give the host the accepted capability and event requirements.
7. Leave the global default registry unchanged unless a separately reviewed default change is explicitly intended. A standalone example is not a private game integration.

## PR to release another existing hero

Unreleased adaptations are currently paused. A community contribution may propose one existing stable ID with all four owned implementations, explicit host requirements, coefficient provenance and focused actual-effect/lifecycle/replay tests. Regenerate source fingerprints, update release/expected-manifest.json only from the reviewed public implementation metadata, add the ID to release/profile.json, update released/paused status and docs, and rerun package/identity checks. Do not edit a status flag alone to claim a new release. Maintainers must accept the whole four-slot behavior and host consumer separately.

For an original numeric/string ID not already in the fixed46 catalog, submit a separate registry/definition/schema design PR first; no such API is available now. Do not borrow a Valve ID.

## To support a truly new hero later

A new identity requires an explicit product/API decision and separately reviewed implementation: extend stable catalog provenance, relax or replace the fixed roster identity policy, provide a recipe template for new ability identities, define mana ceilings and four-slot active/passive admission, and update identity/schema/checkpoint compatibility tests. Decide whether arbitrary user rosters or curated versioned expansions are supported; those are different APIs. No such change is included here.

Do not invent a Valve ID for an original hero, borrow an existing source digest, mutate the frozen roster, forge a sealed registry or bypass factory validation. The original presentation carrier is an honest current-API teaching workaround, not a promise that arbitrary custom heroes are already supported. See the [release-gap decision list](release-compatibility.md).
