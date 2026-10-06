# heros

MIT-licensed deterministic hero rules, editable balance parameters, state schemas and host contracts. The public default profile contains **22 heroes / 88 four-slot skills**. It matches the released game's selected rule implementations; the frontend, backend, game engine, networking and media remain private.

当前仅发布 22 英雄、88 技能槽。其余 24 个运行时英雄和 81 个目录英雄均未发布、暂停适配；游戏保持灰禁不可选。本仓库没有选人 UI，也不自动解锁未发布英雄。

This is a source release on GitHub, not an npm-registry publication. Node.js >=22 and ESM are required; the serial examples/tests were exercised on Node.js 25.8.1.

## Install and start

```sh
npm install github:dotapk-lol/heros#main
```

Pin an exact Git commit instead of main for reproducible consumers. For local development:

```sh
git clone https://github.com/dotapk-lol/heros.git
cd heros
npm run build
npm test
npm run example
```

There are no third-party runtime dependencies or private services needed for these commands.

```js
import { heroes, createHeroRegistry, createRuleSession, isReleasedHero } from '@dotapk/heros';
const registry = createHeroRegistry(); //22 released heroes,88 registered skills
const sealed = registry.seal();
console.log(heroes.length, sealed.manifest.length); //22,88
console.log(sealed.abiVersion, sealed.rulesHash);
console.log(isReleasedHero(1), isReleasedHero(0)); //true,false
const session = createRuleSession(sealed);
console.log(session.has(1, 0, 'activate')); //true
// Invoke with your authenticated synchronous host and events; no world is created here.
```

See [examples/balance-change.mjs](examples/balance-change.mjs) for a real source-parameter change: the detached damage request changes240→60 and rulesHash changes. Its recorder is original public test code, not a game engine or cast-payment proof.

The original SDK's initializer is preserved separately at `@dotapk/heros/sdk`: it retains the fixed46 definition roster and its original three default implementations. The root entry assembles only the released88. Its internal definitions/resources retain the same46 identities because the SDK validates that fixed catalog; definitions do not make an unreleased hero playable.

Public88 rulesHash: `bfca4c893786d98da8cc18d8c560a88e76fb9e5e79c1e71920bf78705a918d31`. This is a public assembly identity, distinct from the game's larger private composition. Publishing this repository does not replace the live game's pinned archive or change its runtime. See [compatibility](docs/release-compatibility.md).

## Released heroes

IDs: `1,3,4,5,7,8,9,15,17,18,28,31,32,36,50,55,57,58,62,71,81,82`.

Crystal Maiden, Axe, Sniper, Anti-Mage, Drow Ranger, Lina, Lion, Shadow Fiend, Queen of Pain, Witch Doctor, Vengeful Spirit, Slardar, Lich, Necrophos, Leshrac, Omniknight, Huskar, Night Stalker, Jakiro, Alchemist, Treant Protector and Ogre Magi.

The [release profile](docs/released-profile.md) lists exact IDs and four ability identities. [Unreleased status](docs/unreleased.md) lists every paused hero and its current gap. Existing shared source modules may contain helpers for other catalog identities; those are internal source dependencies, not released implementations or an acceptance promise. No184-slot candidate assembly is exported by this release.

## Complete developer guide

- [Quick start and package exports](docs/quickstart.md)
- [Stable IDs, four slots, active/passive registration](docs/registry.md)
- [Skill factories, lifecycle and typed commands](docs/plugins.md)
- [Damage, healing, shield limits, status, dispel and immunity](docs/effects.md)
- [Periodic work and host clock](docs/timing.md)
- [Balance parameters, revisions and rulesHash](docs/balance-identity.md)
- [Minimal host adapter](docs/host-adapter.md)
- [Focused testing and deterministic replay](docs/testing-replay.md)
- [Original four-slot example and contributing a hero](docs/adding-heroes.md)
- [Release compatibility and current limits](docs/release-compatibility.md)
- [Contributing and PR checklist](CONTRIBUTING.md)

`examples/training-lantern/` is a complete original teaching plugin with a finite recorder and exact replay. It uses the real SDK on an existing stable identity carrier; arbitrary new hero IDs are not implemented. It does not execute native hero mechanisms or model a production match. Its protection provider records a request without simulating immunity.

## Scope and license

Included: original SDK, pure rules, numeric definitions/parameters, canonical state schemas, original examples, focused public tests and developer documentation. Excluded: private engine/host adapters, frontend/backend, UI, AI, physics loop, network, database, deployments, credentials, private history, real world snapshots and all artwork/audio/music/fonts/logos.

Original contributions are under [MIT](LICENSE); keep [NOTICE](NOTICE). MIT does not license Valve names, source material or trademarks. Numeric records are a project snapshot with arena adaptations, not a promise of current official Dota balance or complete Dota mechanics. No Valve descriptions or media are redistributed. See [SECURITY.md](SECURITY.md).
