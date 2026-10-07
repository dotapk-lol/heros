[English](README.md) | [简体中文](README.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Balance data: internal manual aggregation and review

This directory documents how maintainers **manually prepare aggregate snapshots from existing MySQL**, review them and commit approved summaries for balance research. Backend already uses MySQL8.4 and dedicated `dota_duel` on existing services; no database switch or new database is needed.

There is currently no real-data snapshot, fabricated example statistics, export script, scheduled task or automatic sync. Internal maintainers decide when to prepare data; no cadence is promised. Players remain anonymous/no-login, and session identifiers are not public data. Snapshots are observations, not automatic parameter changes, package replacement or paused-hero activation; release remains **22 heroes/88 slots**.

Sources: [backend](https://github.com/dotapk-lol/backend), [frontend](https://github.com/dotapk-lol/frontend), [parameter/version identity](../docs/balance-identity.md). Existing `duel_hero_balance_v2/v3` and `duel_data_quality_v2/v3` views are internal starting points, not publishable SELECT* output. No unauthenticated public statistics/raw-record download API exists.

## Manual workflow

1. Use an existing authorized read-only MySQL analysis session to choose exact versions, time window and grain; do not modify production data/configuration.
2. Review completion/trust, duplicates, known tests/anomalies, identity mapping and quality; document exclusions and coarse counts.
3. Prepare sufficiently coarse hero/matchup aggregates, keeping the cohorts below separate. Reconcile matches, appearances, wins/losses and denominator; avoid join fanout or double-counting seats.
4. Review privacy/small samples. Suppress, combine or withhold traceable individual/single-game groups; avoid adjacent-window differences that expose only a few new games.
5. Another maintainer reviews definitions, calculations, identities/versions and public scope, then submits summaries through an ordinary data/docs PR. Review notes describe method/conclusion, never raw queries/credentials/player details.

## Suggested metadata for a future snapshot

These are suggested definitions, not actual statistics or a new database schema. An approved Markdown/CSV/JSON aggregate must include its own methodology; no real snapshot is present now.

| Item | Required explanation |
| --- | --- |
| Snapshot identity | Independent version, preparation/review date and method version; corrections explain reasons rather than silently overwriting |
| Window | UTC start/end, e.g. `[start, end)`; specify started_at vs ended_at and avoid overlapping/double-counted games |
| Game identity | Exact game_version/build, registry_version, roster_id; rulesHash/ABI/parameter revision verified from release provenance, never invented from SQL |
| Hero identity | Stable registryNumericId/readable name and optional Valve mapping, never array position |
| Cohort | mode, transport, status, trust; PVE adds AI difficulty/human seat; do not merge versions/historical rosters |
| Hero summary | Eligible appearances, wins/losses and win-rate denominator; explain unique-match counting separately |
| Matchup summary | Directed hero/opponent_hero, whether seats are combined, match/appearance count and denominator |
| Quality/limits | Coarse exclusion counts/rules, missing/unmapped rates, coverage/small-sample policy, manual review and bias |

Suggested win rate: eligible wins / eligible appearances within that cohort; undefined for denominator0. In v3, appearances are seat views: PVP can contribute two per match and mirror heroes can appear twice, so do not label them unique matches. PVE counts human seat0. A→B/B→A are directed; specify seat/mirror handling before combining. Round wins differ from full first-to2 match wins. View win_rate is rounded to four decimals; recompute aggregate rate from total wins/denominator, not an average of row percentages.

Do not publish unreviewed SELECT* output. Quality views expose indicators but do not automatically filter every anomaly; define windows/exclusions manually. Mark missing rulesHash, adequacy or comparability evidence unknown, not fabricated.

## Results and trust must remain separated

| Group | Eligible completion / trust | Boundary |
| --- | --- | --- |
| Network PVP / WebRTC | confirmed / peer_agreement | Two reports agree; not server simulation, anti-cheat proof or skill certification |
| PVE | recorded / client_reported | One client, human seat0; separate AI difficulty |
| Same-screen PVP / local | recorded / client_reported | One real reporter/two match-local seats; separate from WebRTC |
| BroadcastChannel PVP | recorded / client_reported | Same-browser tabs, host reports; not cross-device networking |

Exclude aborted, disputed, pending/incomplete, invalid time order, unmapped/out-of-roster participants, invalid winner/trust/missing confirmation, duplicates and known test/anomalous games from win rates. Exclusions may have coarse quality counts, never raw details. Unclassified/unknown-trust data needs separate review, never automatic peer_agreement promotion.

## Public scope and privacy

Publish only reviewed aggregates. **Do not publish** player/anonymous participant IDs, session/token, IP, invitation or room/match IDs, raw submissions/reports, SDP, per-game events, exact individual timestamps, traceable sequences, fine-grained linkable data, credentials or production backups. Anonymous is not de-identified; removing a name alone can still reidentify people.

Internally choose/document minimum sample/time/dimension coarsening policy; no invented universal safe threshold is given here. Tiny matchups, fine windows or differencing may expose a game even without an ID; combine/suppress/withhold as needed. PRs, commits and attachments obey the same scope.

Snapshots are not official Dota balance, full mechanisms, random samples or causal conclusions. Selection, participant mix, AI, versions and single-report bias affect rates; do not directly rank across cohorts. Code MIT does not license Valve names/trademarks/images/music or personal-data publication. This directory contains no third-party media.
