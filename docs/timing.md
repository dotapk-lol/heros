[English](timing.md) | [简体中文](timing.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Periodic work and the host clock

Use host simulation seconds, stable event order and declared named handlers. The library creates neither timers nor a frame loop. Avoid Date.now, setTimeout, ambient randomness and hidden asynchronous work inside rules. A fixed-step host must state its seconds/frame conversion and inclusive/exclusive terminal policy; the package has no universal frame rate.

A schedule request carries abilityId, owner, handler, delay and JSON data, with an optional action token. Typed requests also carry target (actor or allowed null), binding and delivery. Declare permitted handler binding/delivery pairs in `scheduledBindings` and require the schedule capability. `scheduledHandlers` maps names to synchronous functions. Delay is validated as finite, nonnegative and <=3600 on the typed path.

| Binding | Delivery phase | Reference |
| --- | --- | --- |
| source-job | pack.job-due | no ref |
| passive | actor.passive | no ref |
| status | actor.status-pre-advance or actor.status-advance | accepted status ref |
| entity with mode area | pack.entity | accepted area ref |
| entity with mode link | pack.entity | accepted link ref |
| channel | pack.entity | accepted channel ref |
| swarm | actor.swarm | accepted swarm ref |

Status, entity-link and channel bindings require a non-null target. Opaque accepted handles include host generation/round identity. The package validates shape and a declared pair, not whether the reference exists. The provider must validate ownership, resource kind, life generation and delivery phase before scheduling and again on delivery.

Legacy requests with a valid actor target and without binding/delivery remain a distinct compatible path. Do not label them authenticated typed schedules. Source-only legacy requests also do not become typed automatically.

## Declared status cadence

A periodic `statusDeclaration` has a non-null programId, positive interval and a declared status handler/phase; interval zero and schedule null are required when programId is null. A status-bound request carries exactly the declared delay and statusDeclarationId. It cannot add source parameters hidden in data. Data remains JSON and has no universal schema; source/provider must check its own event contract.

The [Lantern plugin](../examples/training-lantern/plugin.mjs) declares a .25-second Mend cadence. After a status.apply receipt, it schedules with that returned handle. The handler queries the effective record, requests 2 healing, and reschedules while remainingSeconds >0. Its finite [recorder](../examples/training-lantern/host.mjs) uses due-time then insertion order and an inclusive terminal tick: delivery at .25 and .5 seconds for a .5-second status. This policy belongs to the example and is not a claim about all host/native status clocks.

On death, interruption, dispel or removal, the host must cancel/invalidate jobs as the specific rule requires. Some original status sources persist or end differently; do not apply one global death or terminal rule. `cancelJob` returns whether a pending job was actually removed. Rule-only state restore does not restore jobs, accepted status references or effect clocks.
