[English](architecture.md) | [简体中文](architecture.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Package architecture and distribution

Definitions/resources → reviewed factories → mutable registry → sealed manifest/identity → rule session → synchronous host ports. The library validates finite data, state schemas, declaration and identity boundaries; the host owns combat world, admission/payment, effect semantics, clock/handles and atomic world/rule restoration.

Root exports released22/88. SDK remains fixed46 definitions with three default implementations;127 catalog identities are status metadata.24 runtime and81 catalog-only identities are paused. Shared source dependencies do not grant release admission.

See [README directory map](../README.md), [registry](registry.md), [plugins](plugins.md), [host](host-adapter.md), [tests](testing-replay.md), [compatibility/distribution](release-compatibility.md). Node build generates source fingerprints, not a game/server. GitHub source installation is supported; no npm registry publication, deployment service, auto balance export or new database is configured. package.json has an explicit files whitelist; new paired packaged docs must be listed and dry-run inventory checked. Keep standard [LICENSE](../LICENSE) and [NOTICE](../NOTICE), respecting third-party material.
