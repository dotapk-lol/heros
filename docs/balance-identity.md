# Balance parameters, versions and compatibility identities

There are two supported balance surfaces: validated numeric recipe fields in an existing hero definition, and captured factory execution parameters. Neither is a global mutable coefficient map.

For factory configuration, pass JSON in `factory.parameters`, validate values in `create`, then use the immutable `parameters` argument at execution. The training factory demonstrates finite positive amounts and cadence/duration validation. Changing `damage` from 15 to 21 changes the actual requested damage and the sealed rulesHash. It does not change the hero/ability ID or assert a native balance change.

Definition changes preserve the existing template shape, fixed effect/input/passive family and all stable IDs. Numeric recipe fields are bounded; timing fields have extra limits. To update a registered definition use `replaceSkill` with its expected abilityId/revision. To configure a fresh roster, clone all shipped definitions and preserve the full 46 identities before the SDK `createHeroRegistry(cloned,{defaults:...})`, or pass the complete cloned46 definitions to the root released initializer. Host resource facts must remain inside the sealed `resources.maxMpByHero`; raising a private modifier above that ceiling is not implicitly supported.

## Four identities to track

| Identity | Meaning |
| --- | --- |
| npm/package version | Distribution identifier, chosen by release owner; does not alone prove behavior compatibility |
| `BATTLE_ABI` | Current host contract string `heros-effects-2` |
| behavior `revision`, schema `version` | Semantic implementation and state declarations, validated as three-number versions |
| `rosterHash`, `rulesHash` | Frozen identity of roster and exact sealed behavior/configuration |

rulesHash incorporates ABI, core source identity, full definitions/resources, sorted implementation manifest, declared execution parameters, source digests and state schema identity. Source code, registered parameters or definitions can change it without changing a distribution version. rosterHash tracks stable identities rather than current effect strength. Do not fake or manually copy a hash to keep old checkpoints loadable.

`codeIdentity(sourceFiles)` accepts only reviewed paths from the generated package `rules/fingerprint.js`; it does not read arbitrary external files at runtime. For a source-integrated extension: add the real module, declare the exact source dependencies, run `node scripts/fingerprint.mjs`, review the diff and check the exact package artifact. This example adds only a new example source identity; no pre-existing rule/core source file or default registration changes. The generated fingerprint is derived data, not a new rule.

Snapshots require ABI, exact rulesHash, snapshot version 1 and known validated namespaces. A new parameter/configuration cannot restore the old snapshot by default. Host world and rules must be restored together only after both candidates pass validation. There is no built-in migration or compatibility override; a migration needs explicit reviewed tooling.

Use the release owner's confirmed version and exact assembly hash in host logs/checkpoints. The root released88 and low-level SDK assemblies have different manifests; track the exact assembly rather than only version0.1.0. See [release compatibility](release-compatibility.md).

## Runnable released-skill balance example

Run `node examples/balance-change.mjs`. It replaces Leshrac50:2 `mvp.params.damage`240→60 through replaceSkill and observes one initial actual public damage request with the changed amount and a changed rulesHash. The top-level `mvp.damage` field for this ability is0 and is not its effect parameter; use the source recipe's params field. The original recorder returns a transparent receipt but does not pay casts, advance the scheduled chain or prove Native parity.
