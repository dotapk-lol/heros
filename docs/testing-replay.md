[English](testing-replay.md) | [简体中文](testing-replay.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Focused tests and deterministic replay

Test the changed rule or example at its actual public session boundary. Distinguish metadata checks, detached command/receipt checks, native-host integration and browser evidence. None substitutes for the others. The focused tests exercise the original example and public assembly/API boundaries; it does not rerun catalog mechanisms or certify all 184 slots.

Run each necessary documentation test serially from the source checkout:

```sh
node scripts/fingerprint.mjs
node test/documentation/check.mjs terminal
node test/documentation/check.mjs right
node test/documentation/check.mjs parameters
node test/documentation/check.mjs restore
node test/documentation/check.mjs passive
node test/documentation/check.mjs boundaries
node test/documentation/check.mjs defaults
```

Each command executes one named test, with no browser or worker pool. It uses only the original Lantern factories or public metadata. The full historical test runner is outside this documentation task's validation scope. A release owner should choose additional authorized focused checks for the actual implementation changes; do not infer acceptance from a broad count of tests.

## What these tests prove

- An original request/receipt trace repeats after restoring both rule state and the recorder; .25 and .5 terminal pulses obey the example's stated clock policy.
- The same original behavior routes correctly when actor 1 owns it.
- Captured balance changes affect actual requested damage and rulesHash; invalid configuration is rejected.
- Changed identities and invalid state do not partially mutate the rule session on restore.
- Disabled passive delivery produces no damage or state, enabled delivery counts attacks, and death removes owned rule state.
- Actor/event copies are frozen, unknown source identity and new hero IDs are rejected, and cross-ability invocation fails before effect delivery.
- The low-level SDK default three and rulesHash remain unchanged; the root profile registers exactly the released88 and matches its manifest.

## Checkpoint boundaries

`session.snapshot()` contains only abiVersion, rulesHash, version and namespace state. `validateSnapshot` is a nonmutating rules-only check; `restore` builds and validates the complete namespace candidate before committing it. It cannot restore an actor, HP/MP, RNG, job queue or accepted handle. A valid public snapshot does not authenticate private references in data.

The example checkpoints `session.snapshot()` and the recorder's `checkpoint()` separately, restores both and compares the entire continuation. Its constant RNG is a finite test fixture, not a production RNG design. For a real deterministic replay record the initial sealed hash, simulation configuration, input/event sequence, accepted command receipts, seeded RNG state, world/resource/handle generations, queue order and terminal policies. Compare exact values at the agreed arithmetic order; do not silently insert tolerances, rounding or fallback adapters to hide differences.

## Artifact checks

Regenerate source fingerprints before a source-integrated plugin test, then freeze the final artifact. Validate file inventory, no private paths/assets/credentials, actual installed bytes and replayed bytes. Installing a package alone does not prove npm's file whitelist included the new docs/examples. The explicit public file whitelist includes the docs, original examples and focused tests. See [compatibility](release-compatibility.md).

For prose-only edits use `python3 scripts/check-docs.py` and `git diff --check`; do not rebuild fingerprints unless source/package inventory changes.
