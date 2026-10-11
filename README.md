[English](README.md) | [简体中文](README.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# heros

MIT-licensed deterministic hero rules, editable balance parameters, state schemas and host contracts. The public default profile contains **28 heroes / 112 four-slot skills**. It matches the released game's selected rule implementations. The [frontend](https://github.com/dotapk-lol/frontend) and [backend](https://github.com/dotapk-lol/backend) are now public repositories with separate responsibilities and licensing boundaries.

Only28 heroes/112 slots are released. The other18 runtime and81 catalog-only identities remain unreleased, paused and grey in the game. This package contains no selector UI and does not unlock them.

This is a source release on GitHub, not an npm-registry publication. Node.js >=22 and ESM are required; the serial examples/tests were exercised on Node.js 25.8.1.

## Project architecture

[dotapk.lol](https://dotapk.lol) uses three repositories:

| Repository | Responsibility |
| --- | --- |
| **heros (this repository)** | Pure deterministic rules, parameters, state schemas and host contracts; Node examples/tests need no database or browser |
| [frontend](https://github.com/dotapk-lol/frontend) | Cloudflare static client, UI/input/rendering/AI, browser combat world, rule host adapters and WebRTC/BC clients |
| [backend](https://github.com/dotapk-lol/backend) | Go anonymous sessions, six-digit invitations, WebRTC signaling, result reconciliation and existing MySQL 8.4 statistics behind Nginx at api.dotapk.lol |

The backend already uses the dedicated `dota_duel` schema on the existing host; no database switch or new database is required. Players need no account login. Frontend language preferences stay in localStorage. Go does not execute the skills, and this library does not supply a combat world or networking.

Read each application's README for its local environment and [frontend integration](https://github.com/dotapk-lol/frontend/blob/main/docs/DEVELOPMENT.md) / [backend integration](https://github.com/dotapk-lol/backend/blob/main/docs/DEVELOPMENT.md) for exact CORS, registry and build bindings. The current game uses `arena-heros28-v1` / `duel-heroes-127-v1` and 28 released heroes; 127 catalog identities do not unlock other heroes. The frontend's pinned review archive and composition differ from this root public112 assembly. Do not replace that archive merely because these repositories are public.

[balance-data/README.md](balance-data/README.md) describes **internal manual** preparation of aggregate snapshots from existing MySQL and human review before commit. It contains no real statistics, export script, scheduled task or promised cadence. PVP `confirmed / peer_agreement` is separate from PVE/local/BC `recorded / client_reported`; aborted, disputed and abnormal games are excluded from win rates. These aggregate records do not automatically change rule parameters.

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
const registry = createHeroRegistry(); //28 released heroes,112 registered skills
const sealed = registry.seal();
console.log(heroes.length, sealed.manifest.length); //28,112
console.log(sealed.abiVersion, sealed.rulesHash);
console.log(isReleasedHero(1), isReleasedHero(0)); //true,false
const session = createRuleSession(sealed);
console.log(session.has(1, 0, 'activate')); //true
// Invoke with your authenticated synchronous host and events; no world is created here.
```

See [examples/balance-change.mjs](examples/balance-change.mjs) for a real source-parameter change: the detached damage request changes240→60 and rulesHash changes. Its recorder is original public test code, not a game engine or cast-payment proof.

The original SDK's initializer is preserved separately at `@dotapk/heros/sdk`: it retains the fixed46 definition roster and its original three default implementations. The root entry assembles only the released112. Its internal definitions/resources retain the same46 identities because the SDK validates that fixed catalog; definitions do not make an unreleased hero playable.

Public112 rulesHash: `16babcb1b13197104f59d33b39bdd412ace1b339157f23ab1b3559cd78609049`. This is a public assembly identity, distinct from the game's larger frontend composition. Publishing this repository does not replace the live game's pinned archive or change its runtime. See [compatibility](docs/release-compatibility.md).

## Released heroes

IDs: `1,3,4,5,7,8,9,15,17,18,28,31,32,36,50,55,57,58,62,71,81,82`.

Crystal Maiden, Axe, Sniper, Anti-Mage, Drow Ranger, Lina, Lion, Shadow Fiend, Queen of Pain, Witch Doctor, Vengeful Spirit, Slardar, Lich, Necrophos, Leshrac, Omniknight, Huskar, Night Stalker, Jakiro, Alchemist, Treant Protector and Ogre Magi.

The [release profile](docs/released-profile.md) lists exact IDs and four ability identities. [Unreleased status](docs/unreleased.md) lists every paused hero and its current gap. Existing shared source modules may contain helpers for other catalog identities; those are internal source dependencies, not released implementations or an acceptance promise. No184-slot candidate assembly is exported by this release.

## Complete developer guide

- [Architecture](docs/architecture.md)
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

## Repository layout

| Path | Contents |
| --- | --- |
| `release/` | Released28 allowlist, factory assembly and expected112 manifest |
| `content/` | Numeric definitions/resources; fixed46 SDK identities remain internal definition carriers |
| `contract/` | Registry, session, state/effect/schedule/value schemas and TypeScript contract |
| `rules/` | Reviewed static implementations, parameters and generated source fingerprints |
| `examples/` | Original finite host recorder, plugin wiring and balance-change example |
| `test/`, `scripts/` | Focused metadata/example checks and serial runners |
| `docs/`, `balance-data/` | Developer contracts, current limits and manual aggregate-data policy |

Change numeric definitions or captured factory parameters only through validated existing templates and stable IDs; register reviewed static factories, seal the registry, then deliver events/receipts through your synchronous host. See [parameters](docs/balance-identity.md), [plugins](docs/plugins.md), [host adapter](docs/host-adapter.md) and the runnable examples. Arbitrary custom IDs and external runtime plugins are not implemented, and paused heroes are not enabled by documentation edits. Use the [focused serial tests](docs/testing-replay.md) for relevant behavior; prose-only updates can use link/path checks and `git diff --check` without rebuilding fingerprints.

## Scope and license

Included: original SDK, pure rules, numeric definitions/parameters, canonical state schemas, original examples, focused public tests and developer documentation. Excluded from this package: application engine/host adapters, frontend/backend, UI, AI, physics loop, network, database, deployments, credentials, historical private working records, real world snapshots and all artwork/audio/music/fonts/logos. Application source lives in the separate public repositories, which now provide their own MIT LICENSE for project-owned code and documentation.

Original contributions are under [MIT](LICENSE); keep [NOTICE](NOTICE). MIT does not license Valve names, source material, trademarks, artwork or music. The frontend and backend now license their own code and documentation under [frontend MIT](https://github.com/dotapk-lol/frontend/blob/main/LICENSE) and [backend MIT](https://github.com/dotapk-lol/backend/blob/main/LICENSE). Third-party images, music and dependencies retain their respective licenses; none is relicensed by the project MIT grants. Numeric records are a project snapshot with arena adaptations, not a promise of current official Dota balance or complete Dota mechanics. No Valve descriptions or media are redistributed. See [SECURITY.md](SECURITY.md).
