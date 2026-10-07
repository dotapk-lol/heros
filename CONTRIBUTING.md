[English](CONTRIBUTING.md) | [简体中文](CONTRIBUTING.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Contributing

Contribute original deterministic behavior, documentation or focused tests. Start with the [developer guide](README.md) and the actual [contract](contract/types.ts). The current registry is a fixed 46-hero/four-slot roster; a new hero identity or shared capability is an API proposal, not a routine plugin edit.

## Working on a rule

Select one existing stable ID/slot and record the expected revision. Preserve identity and admission family. Capture validated immutable parameters in a static factory, declare exact source identity, minimal capabilities, named hooks and canonical state. Use provider requests/actual receipts; keep world transactions, clocks and accepted reference authentication in the host. Unsupported provider semantics stay gated until separately accepted.

Keep contributions within the rule/package boundary; application Engine/game adapters belong in the separate frontend repository. Do not copy credentials, deployment secrets, media or copyrighted descriptions. Explain numeric coefficient provenance and arena adaptations without claiming current official balance. MIT covers your original contribution, not third-party material. Preserve LICENSE and NOTICE.

Add meaningful focused tests: actual changed requests/receipts, both participants when relevant, invalid configuration, lifecycle cleanup, disabled passive behavior, identity mismatch and atomic state restore. Generate fingerprints in the source checkout and verify the exact final installed files. A source-generated digest is not proof of untrusted closure behavior or native parity.

For prose-only documentation changes check links, paths and `git diff --check`; no fingerprint rebuild is needed. If an example or rule boundary changes, run the relevant serial commands in [testing-replay.md](docs/testing-replay.md). Test one changed case at a time; a blanket full-suite pass count is not required evidence for a prose/example edit. Do not treat these detached tests as browser or native-host integration results.

## PR checklist

- [ ] Problem and resulting behavior are stated with a concrete changed request/example.
- [ ] Stable IDs/four slots and active/passive/input/effect family remain valid.
- [ ] Factory parameters, semantic revision, exact source paths and state schema are declared honestly.
- [ ] Only required ports are used; actual receipts and accepted handles are respected.
- [ ] Clock, interruption/death, status effectiveness and terminal ordering are documented where affected.
- [ ] Focused tests cover the changed effect and meaningful rejection/restore cases; exact commands and runtime are recorded.
- [ ] Generated fingerprint and artifact file list are reviewed; no unrelated rule, schema or default registration changes.
- [ ] Definition/candidate/registered/host-accepted status is reported separately; only the released22/88 is default-enabled; no claim that all184 definitions are connected.
- [ ] No private implementation/path, secrets, Valve media or copied descriptive text is included.
- [ ] README/docs/example links and any public packaging changes are reviewed; version and exact assembly are recorded; paused heroes are not enabled by a status-only edit.

A PR adding a shared contract, a new identity policy or default registration needs a separate explicit design review and host compatibility tests. Keep the patch small, state unsupported cases and preserve old artifact fingerprints for reviewers.

## Manual balance snapshots

Follow [balance-data/README.md](balance-data/README.md). Internal maintainers manually prepare aggregates from existing MySQL and review them before commit; a contribution must state exact version/window/cohort/denominator and anonymization choices. Do not add automated synchronization, export tooling, real-data examples, raw reports or traceable participant records under this documentation task. Snapshot approval does not authorize parameter changes or paused-hero activation.

## Bilingual maintenance

Keep every retained Markdown guide paired: English name.md and Chinese name.zh-CN.md, with language links and https://dotapk.lol first. Update both versions and package.json's files whitelist when adding packaged guides. Do not duplicate machine schemas/data or translate the standard English LICENSE as a legal grant. Use `python3 scripts/check-docs.py` and `git diff --check`; exclude local reports, matrices and credentials from commits. Application source is public in separate repositories; package boundaries and paused status remain unchanged.
