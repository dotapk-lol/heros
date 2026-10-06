# Release compatibility and remaining limits

Public source version0.1.0 targets ABI heros-effects-2. It is derived from the exact reviewed public input0.1.0-review.10-rupture-order.1, archive SHA256 `2885ade8d7eeb06a03045f41ac2907e17d5e753f0b881091515a3afc9005a391`. Later Siphon or paused hero adaptations are not integrated.

## Separate assemblies and distributions

The root default registers22/88. All88 implementation manifests, source identities, schemas, parameters, revisions, hooks and capabilities match the already accepted released subset. Original SDK/core and owned rule bytes are preserved. The public assembly rulesHash is `bfca4c893786d98da8cc18d8c560a88e76fb9e5e79c1e71920bf78705a918d31`.

The game's frontend composition has132 metadata rows, separate release gates and rulesHash `5747bdeffe9948c67882ea02858e7958a5ea15be090b08d9ac6d8561a57970a4`.132 is not an acceptance count or public roster. The public88 assembly cannot load a frontend132 snapshot. The existing low-level SDK initializer remains unchanged through the sdk subpath; source entry/index and core identities are preserved.

Publishing this repository does not replace the live game's pinned vendor, rebuild its runtime or change its host dispatcher. This distribution is not an unverified drop-in binary replacement. Any future game package replacement still needs exact byte/closure/identity/build and host acceptance checks; this source release does not pre-approve that future operation.

The source is available through GitHub. Package metadata and an explicit files whitelist include the public docs/examples/tests. No npm-registry publication, npm account/token configuration or automatic deployment is part of this release.

## Current limits

| Topic | Current behavior |
| --- | --- |
| Arbitrary new hero IDs | Not implemented; fixed46 identities and recipe templates; contribute an explicit PR/design rather than inventing registerHero |
| Outside runtime plugins | Not implemented; reviewed source integration plus generated fingerprint required |
| General shields | No shield port; protect is invulnerability/debuff immunity; specific reviewed status/projection conventions remain host responsibilities |
| Unreleased heroes |24 runtime +81 catalog-only paused; no default registration or all184 candidate export; see unreleased.md |
| TypeScript | contract subpath ships types.ts shapes; root JS has no complete declaration entry |
| Host/game systems | Transactions, physical world, AI, input, rendering, network, database and UI are not shipped in this package; see the separate public frontend/backend repositories |
| Browser/native evidence | Focused Node example/API/package tests are not browser or independent-native-world certification |

## Upgrading

Pin a commit and exact package/assembly hash. Compare ABI, roster mapping, resources, capabilities and rulesHash before loading checkpoints or enabling behavior. A semantic version alone does not make source/configuration/state compatible. There is no silent snapshot migration or restore bypass. Preserve MIT/NOTICE and respect third-party names/material boundaries.

## Application source is public

The [frontend](https://github.com/dotapk-lol/frontend) and [backend](https://github.com/dotapk-lol/backend) are separate public repositories. Earlier “private composition” wording describes the historical application/package boundary; the distinct manifests, fingerprints and snapshot incompatibility remain unchanged. Source visibility does not turn the public88 assembly into a drop-in replacement, enable arbitrary IDs/outside plugins or restore paused heroes. Frontend/backend now provide their own [frontend MIT](https://github.com/dotapk-lol/frontend/blob/main/LICENSE) and [backend MIT](https://github.com/dotapk-lol/backend/blob/main/LICENSE) for project-owned code and documentation. Third-party images, music and dependencies retain their respective licenses; the project MIT grants do not relicense Valve artwork or music.

Current frontend source identifies `arena-heros22-v1`, `duel-heroes-127-v1`, and gameVersion `duel-851e67d77307f479f1fa`. Backend production profile also retains exact historical22 builds `duel-27c78aa4cfc8facc8a23` and `duel-6b1d12f75aa4bbac4e12`; its ordinary default embed remains legacy20. Rebuilding the frontend can produce a new version and requires reviewed local/release binding rather than hash reuse. See the [backend local guide](https://github.com/dotapk-lol/backend/blob/main/docs/DEVELOPMENT.md).
