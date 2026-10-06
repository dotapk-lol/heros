# Effect requests and provider semantics

The contract describes requests and receipts, not a replacement engine. Refer to [types.ts](../contract/types.ts) for exact field types. Only ports declared in `requires` appear in a skill's context. All source/target/owner/actor references below are actor IDs 0 or 1.

| Capability | Context members | Result / important fields |
| --- | --- | --- |
| `damage` | `damage(spec)` | DamageReceipt: accepted, landed, guarded, raw, actual, deferred, killedAtDebit |
| `heal` | `heal({source,target,abilityId,amount})` | `{actual,deferred}` |
| `mana` | `mana({actor,abilityId,delta})` | number |
| `transfer-mana` | `transferMana({source,target,abilityId,requested})` | number |
| `self-damage` | `selfDamage({actor,abilityId,amount,nonlethal})` | DamageReceipt |
| `protect` | `protect({actor,abilityId,kind,duration})` | accepted handle or null; kind is invulnerability or debuff-immunity |
| `status` | `status.apply/remove/query/cleanse` | handle/null, boolean, views, removed handles respectively |
| `control` | `control.apply/release` | `{handle,duration}`/null, boolean |
| `target-route` | `target.route(spec)` | accepted/reason and effective owner/target/originalOwner/reflection flags |
| `motion-request` | `motion(spec)` | handle/null; blink, leap, dash, pull, ward-follow |
| `projectile-request` | `projectile(spec)` | accepted handle |
| `legacy-effect` | `legacyEffect.spawn/view/end` | handle, alive/x/y view or null, boolean |
| `schedule` | `schedule(spec)`, `cancelJob(handle)` | handle, boolean |
| `action-token` | `action.token(actor,reasons)`, `action.valid(token)` | JSON token, boolean |
| `deferred-hp` | `deferredHP.begin(spec)`, `settle(handle)` | handle, settlement status/actual damage/heal |
| `cue` | `cue(event)` | no value; cosmetic intent only |

## Damage and healing

Damage requests carry source, target, selected abilityId, amount and `type: 'physical'|'magical'|'pure'`. Optional fields include blockable, stunSeconds, hitstunSeconds, basic, dot, passive, reflected, noReflect, noLifesteal and attackId. The host decides mitigation, guarding, immunity, shield consumption, reflection and HP debit, returning actual results. Requested/raw/actual are different quantities; do not assume a damage request landed or killed. Healing returns actual and deferred amounts and has no invented `accepted` field. Resource ceilings come from sealed definitions, not a universal 1200-MP constant.

## Shields and projections: current limitation

There is **no general `shield` capability or `ctx.shield()` port** in the current SDK. `protect` means invulnerability or debuff-immunity, not an absorb pool. A shield can only be implemented through an explicitly reviewed host-owned status/projection convention that tracks the pool, applies ordering and returns truthful damage receipts. `projectDamage` has a JSON result shape and does not install such a convention by itself. Do not guess a `status.values` shield key or reinterpret `deferredHP` as a shield. A general shield protocol is a release gap if a consumer requires one.

## Statuses, dispel and effectiveness

A StatusSpec includes owner, target, abilityId, key, duration, polarity, dispel, pierces and values. Polarity is positive/negative; dispel is basic/strong/none. `status.cleanse(target,tier,abilityId)` returns actual removed handles. The provider decides which effective records and generations are eligible; control release and end-of-life cleanup are separately owned by the host. Typed `control.apply` has key, stun/root/hex/fear/taunt type, duration, pierces and dispel.

Legacy queries may return StatusSpec-only rows. `StatusView` adds optional handle/effective/remainingSeconds metadata, and `StatusRecordView` requires all three. Type presence is not authentication. A legacy `enabled` alias does not create an effective strict record. Delivery-time effectiveness and finite remaining life must come from the provider.

For an implementation declaring `statusDeclarations`, each source declaration includes explicit ID, recipient (self/enemy relative to the effective owner), duration, interval, programId, schedule, polarity/dispel/pierces and values. The current runtime checks an **exact** status.apply request shape, including statusDeclarationId; adding intervalSeconds to that declared request is rejected. Although StatusSpec has an optional intervalSeconds for compatible providers, this type does not install a timer or relax declared source validation. Follow the exact declaration and [schedule](timing.md) shape as the example does.

## Immunity, routing and reflection

Actor facts expose alive, invulnerable, debuffImmune and passivesEnabled independently. They do not authorize an effect. The host authenticates targeting and reflection and applies pierce/block semantics at the correct phase. A route request includes owner, target, abilityId, numeric range, reflectable and reflected; optional rangePolicy is admission-and-delivery (default when omitted) or admission-only. The latter needs an authenticated earlier admission receipt. It is not a bypass toggle based on user input. Keep returned effective owner/target and noReflect/noLifesteal flags.

The training recorder demonstrates the request interfaces, a simple capped HP debit/heal and a status queue. It does not implement armor/resistance, shields, reflection, immunity, action admission or native control. Its protection port only returns a logged handle. Treat its results as detached example evidence, not production effect validation.
