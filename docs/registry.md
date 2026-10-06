# Stable IDs and four-slot registration

Each runtime definition has string id, registryNumericId, separate valveHeroId and exactly four ordered abilities. Indices are0..3; S1 means index0. Numeric hero IDs are not array positions or actor IDs. ActorId remains0 or1.

Root `createHeroRegistry()` returns the22/88 assembly. `@dotapk/heros/sdk` retains the original46-definition/three-default initializer and supports `{defaults:false}`. Both use the same unchanged SDK validation. Root `heroes` is the released22 list, while sealed.definitions and resources retain the fixed46 catalog for stable identity/resource bounds. Presence of a definition is not registration or game admission.

```js
import { createHeroRegistry } from '@dotapk/heros';
const registry = createHeroRegistry();
const definition = registry.definition(50).abilities[2];
registry.replaceSkill(50,2,
  {definition:{...definition,mvp:{...definition.mvp,params:{...definition.mvp.params,damage:60}}}},
  {abilityId:definition.id,revision:'2.1.0'});
const sealed = registry.seal();
```

This changes a numeric recipe within its existing template family; a host must still deliver accepted events. Use the actual manifest revision in general-purpose tools rather than hardcoding an old revision.

For source-integrated original plugins:

```js
import { createHeroRegistry } from '@dotapk/heros/sdk';
const registry = createHeroRegistry(undefined,{defaults:false});
registry.registerFactory(heroNumericId,slotIndex,factory);
```

registerFactory rejects duplicate/invalid rows. replaceSkill requires expected abilityId/revision, stable definition identity and valid prospective compilation; an explicit factory replacement requires changed declared identity or immutable parameters. seal is idempotent and locks further edits. The sealed registry exposes abiVersion/rulesHash/rosterHash/definitions/resources/manifest and hero/implementation/namespaceSchema lookups.

mvp.passive identifies admission family; replacements cannot alter passive/input/effect. Passive metadata does not schedule itself: the host delivers the agreed passive hooks and rules honor passivesEnabled. session.has defaults to activate, so check onAttack or other specific hooks for passive skills.

There is no registerHero/addHero/unregister/registerPluginUrl API. The constructor accepts exactly the known46 stable identities and existing ability templates. An arbitrary original ID is rejected. A PR for a previously paused existing hero must contribute/test all four rules and update the reviewed release manifest/profile; a truly new ID requires a separate explicit catalog/registry/schema compatibility design. See [contribution steps](adding-heroes.md).

## Published status

The root profile selects only the released22 IDs and88 manifest rows. The remaining24 runtime heroes and81 catalog-only entries are unreleased and paused. There is no public184 candidate assembly. Low-level source, a valid definition, a factory's existence or a manually changed registry is not proof of host support or authorization to enable a paused hero. The released game separately enforces its selector/CPU/network/snapshot whitelist; this library contains none of those private systems.
