[English](host-adapter.md) | [简体中文](host-adapter.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Minimal host adapter

The runtime host object is structural, synchronous and small:

```js
const host = {
  now: () => simulationTimeSeconds,
  actor: id => actorFacts[id],
  random: () => nextSeededRandomNumber(), // [0, 1)
  ports: {
    damage: request => validateAndDebitDamage(request),
    heal: request => validateAndCreditHealing(request)
  }
};
```

The named functions above describe provider responsibilities; they are not exported library functions. A concrete runnable provider is [the original finite recorder](../examples/training-lantern/host.mjs), which supplies only its declared example ports. No application engine is copied into it.

ActorView requires id, heroId, hp, maxHp, mp, maxMp, x, y, dir (-1/1), alive, invulnerable, debuffImmune, passivesEnabled, guarding, rooted and silenced. Values must be finite and required flags boolean. MP/maxMP must fit the selected hero's sealed resource ceiling. Facts are copied and frozen by the session; provider objects must not be exposed to rules. `session.validateFacts(host)` checks both actors' public facts, not a full host world.

Capabilities map to concrete port names; for example `schedule` exposes schedule and cancelJob, `status` exposes apply/remove/query/cleanse, and `target-route` adds target.route. Missing methods fail when invoked. Match the [effect table](effects.md) and TypeScript shapes; do not create imaginary `executeCommand`, `commitCast` or `addShield` library calls. Async promises are not valid port returns.

## Host responsibilities before and after delivery

1. Select the registered skill and authenticate actor, ability, cast/event identity and lifecycle generation. Absence of an implementation or hook is not a host acceptance grant.
2. Build detached cast facts. If the skill has planCast, obtain a plan, then validate readiness, resources, targeting and any extra fact requirements through the real admission path.
3. Commit payment, charges, cooldowns, action ownership and windup/recovery using host transactions. Notify onCastCommitted/activate at the accepted phase. The library does not pay or prevent duplicate cast IDs automatically.
4. Validate each port request's ability, actors, bounds, current life/resource/effect generation, mitigation/pierce policy and declared capabilities; return truthful actual receipts. No forged reference is accepted because its string matches a type.
5. Own physics, projectile/entity contact, control arbitration, reflection, shields, immunity, effect clocks and terminal ordering. Deliver projection/event hooks using your reviewed event/result conventions.
6. Own seeded RNG position, job queues, accepted handle generations and world checkpoint validation. Restore world and rule state atomically after both candidate states and all cross references pass.

A host adapter may support fewer capabilities than the public list. Enable only the factories it actually supports and has tested. Context types describe potential capabilities; an implementation's `requires` selects which are available. The library is not a security sandbox for untrusted factory JavaScript and source identities are not proof of arbitrary closure correctness.

The training recorder authenticates no external events, does not pay casts, and records protection without simulating immunity. Its simple HP/status/job bookkeeping exists only to demonstrate the request and replay boundary. Copy the integration structure, not its incomplete combat policies, into a production adapter.
