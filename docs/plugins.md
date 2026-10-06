# Skill factories, lifecycle and typed commands

A factory is a static reviewed module, not a remote script or sandboxed plugin. Its only fields are `abiVersion`, optional JSON `parameters`, and `create(config)`. The ABI is `heros-effects-2`. `create` receives frozen `hero`, selected `definition`, all `definitions`, declared mana `resources`, and immutable captured `parameters`. It may run repeatedly during prospective compilation: keep it pure and avoid registration-time effects.

An implementation declares `behaviorId`, semantic `revision` (three numeric components), unique `requires` capabilities, a branded `stateSchema`, and actual `codeHash`/`sourceFiles` from `codeIdentity`. At least one named hook must exist. Optional fields are `namespace`, `requiredCastFacts`, `statusDeclarations`, `scheduledHandlers` and `scheduledBindings`. Unknown fields are rejected. Do not fabricate a source digest or reuse an unrelated file's identity for an external closure. The runtime is not a hostile-JavaScript sandbox.

Default state namespaces are `skill:<heroId>:<abilityId>`. An explicit namespace must match `heros/[a-z0-9/_-]` within the accepted length. Use one canonical schema instance when sharing a namespace; matching text alone does not establish validator identity. `defineStateSchema` supports finite JSON, explicit unions and closed bounded objects/arrays, not arbitrary JSON Schema. `EMPTY_STATE_SCHEMA` accepts null only.

## Lifecycle delivery

| Hook | Intended delivery boundary |
| --- | --- |
| `planCast` | Host admission query; return accepted/reason, costs, windup/recovery, action; no automatic payment |
| `onCastCommitted` | Host has authenticated and committed the cast |
| `activate` | Host delivers the accepted active skill execution |
| `onContact`, `onStage` | Host-defined projectile/entity/stage facts |
| `onInterrupt`, `onDeath` | Host delivers interruption/death and coordinates cleanup |
| `projectAttack`, `projectDamage`, `projectHealing`, `projectInterval` | Pure projection conventions agreed with the host; most event/result shapes are `Json` |
| `onAttack`, `onDamage`, `onTargeted` | Authenticated occurrence notifications, not invented input claims |
| named `scheduledHandlers` | Delivery through `session.scheduled` after host job validation |

`session.invoke(heroId,slot,hook,host,event)` returns `{handled:false}` when that hook is absent, otherwise `{handled:true,value}` (null for undefined). Unknown hook names throw. `session.has` defaults to checking `activate`, so use an explicit passive hook name for a passive skill. `session.scheduled(heroId,slot,name,host,data)` invokes a declared handler; it does not authenticate a job reference or own the queue. Those are host duties.

There is no automatic lifecycle pipeline, periodic clock, event bus or cast transaction in the library. For many hooks the contract deliberately uses JSON; there is no universal projection merge policy. Agree on event schemas and ordering in the host adapter before enabling an implementation.

## Context and typed requests

`ctx.now` is a frozen time fact; `actor(id)` supplies detached frozen fields; `random()` validates a host result in [0,1). Rule state has `read/write/remove`. A write validates against the canonical namespace schema. `target.distance(a,b)` is always available and computes absolute x distance; `target.route` requires `target-route`.

Every other action is a declared capability port, including `damage`, `heal`, `status`, `control`, `schedule` and protection. Requests are finite plain JSON; functions, promises, undefined properties, NaN and arbitrary class instances are unsupported. Do not serialize optional properties with an undefined value: omit them. Port methods are synchronous and their returned JSON is detached/frozen.

Requests with `abilityId` must use the selected skill ID; actor fields must be 0 or 1. An event carrying `owner` must match the selected hero. The session checks these boundaries plus declared status/schedule shapes; it does not validate all gameplay semantics of every request/receipt. The provider must authenticate and validate requests and actual receipts. See [host duties](host-adapter.md) and [effect reference](effects.md).

`requiredCastFacts: ['effectiveCastRange']` is opt-in and requires `planCast`. Only that hook can receive a finite nonnegative `effectiveCastRange`; an undeclared or misplaced value is rejected. It is a host-authenticated fact in world units, without contact margin, not a new factory argument.

The complete original factory lives in [plugin.mjs](../examples/training-lantern/plugin.mjs). It demonstrates three active slots, one passive hook, immutable balance parameters, state cleanup and typed status cadence without changing default registration.
