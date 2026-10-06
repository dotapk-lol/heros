# Quick start and exports

Node.js >=22 with ES modules is declared; current validation used25.8.1. The pure example needs no services or third-party runtime dependency. Browser/native-host compatibility needs its own integration evidence.

```sh
npm install github:dotapk-lol/heros#main
# Use a reviewed exact commit in place of main for reproducible installation.
```

| Export | Role |
| --- | --- |
| `@dotapk/heros` | Default22/88 assembly, released heroes/profile/selectors and shared session/schema APIs |
| `@dotapk/heros/sdk` | Unchanged low-level SDK,46 definitions and original three-default initializer |
| `@dotapk/heros/content` | Fixed46 definition catalog; not a playable roster |
| `@dotapk/heros/catalog` | Released/paused status for all127 known identities |
| `@dotapk/heros/contract` | types.ts contract shapes; `import type`, not a runtime command client |
| `@dotapk/heros/examples/blink-range` | Optional reviewed Blink range factory/installer |

No all184 candidate factory entry is exported. Rule source files are internal implementation dependencies, not a supported bypass to publish paused heroes.

```js
import { createHeroRegistry, createRuleSession, heroes } from '@dotapk/heros';
const sealed = createHeroRegistry().seal();
console.log(heroes.length, sealed.manifest.length); //22,88
const session = createRuleSession(sealed);
// host = {now(),actor(id),random(),ports}; see host-adapter.md for concrete contracts.
```

The root mutable registry can replace an already registered skill before sealing. To use an empty SDK registry for an original teaching plugin:

```js
import { createHeroRegistry } from '@dotapk/heros/sdk';
const empty = createHeroRegistry(undefined, { defaults: false });
```

The low-level SDK retains its fixed46 identity/recipe constraints. Do not pass only the22 filtered definitions into it; keep the whole fixed catalog when modifying numeric definitions.

From a checkout run `npm run build`, `npm test`, `npm run example`. The original Lantern Keeper example emits Spark15 magical damage, Echo3 pure damage, Mend12 healing plus two2-point pulses at.25/.5 seconds, then cleanse and debuff-immunity requests. Its constant-RNG recorder restores both its finite host state and the rules-only checkpoint and compares the exact continuation. It does not pay casts or simulate protection.

The training files are included as source files without a dedicated subpath export; execute `node examples/training-lantern/run.mjs` from the checkout. A new plugin must be integrated into the reviewed source manifest; arbitrary outside modules cannot invent codeIdentity.

The optional Blink installer expects the original revision1.0.0 and an unsealed registry. Use it explicitly; an installer does not move an actor until the host delivers activate. See the complete [example](adding-heroes.md) and [host interface](host-adapter.md).
