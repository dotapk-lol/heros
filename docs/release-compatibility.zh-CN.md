[English](release-compatibility.md) | [简体中文](release-compatibility.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 发布兼容性与现有限制

公共source0.1.0目标ABI heros-effects-2，来自精确审核输入0.1.0-review.10-rupture-order.1，archive SHA256 `2885ade8d7eeb06a03045f41ac2907e17d5e753f0b881091515a3afc9005a391`。后续Siphon或暂停适配未集成。

## 不同组合与分发

根默认22/88，全部88 manifest/source/schema/parameters/revision/hook/capability匹配已接受子集，原SDK/core/owned字节保留。公共rulesHash `bfca4c893786d98da8cc18d8c560a88e76fb9e5e79c1e71920bf78705a918d31`。

前端组合含132 metadata行、独立发布gate和rulesHash `5747bdeffe9948c67882ea02858e7958a5ea15be090b08d9ac6d8561a57970a4`，132不是验收/发布数量；public88不能恢复frontend132快照。sdk subpath底层initializer、source index/core身份不变。

发布本仓库不替换live vendor、重建runtime或改变host dispatcher，不是未验证drop-in。未来包替换仍需精确字节/closure/identity/build/host验收，本源码发布不预批。

源码经GitHub，package metadata/files白名单包含docs/examples/tests；没有npm registry发布、账号/token配置或自动部署。

## 现有限制

| 主题 | 当前行为 |
| --- | --- |
| 任意新ID | 未实现，固定46身份/recipe模板，先PR设计、不编造registerHero |
| 外置runtime插件 | 未实现，要审核源码集成与fingerprint |
| 通用盾 | 无shield port，protect是无敌/负面免疫，特定status/projection归host |
| 未发英雄 |24运行时+81仅目录暂停，无默认注册/全部184组合，见[未发](unreleased.zh-CN.md) |
| TypeScript | contract子路径types.ts shapes，root JS无完整声明入口 |
| 游戏系统 | 事务/世界/AI/输入/渲染/网络/DB/UI不在包内，见独立前后端 |
| 浏览器/native证据 | Node例子/API/package测试不认证浏览器/独立原生世界 |

## 升级

固定commit和精确package/assembly hash，比较ABI/roster/resources/capability/rulesHash再加载checkpoint或启用行为。语义version不保证源码/配置/state兼容，没有静默迁移或restore绕过，保留MIT/NOTICE和第三方边界。

## 应用源码已公开

[前端](https://github.com/dotapk-lol/frontend)、[后端](https://github.com/dotapk-lol/backend)是独立公共仓库。旧“private composition”指当时应用/包边界，不同manifest/fingerprint/快照不兼容仍成立。公开不让88成为drop-in、不支持新ID/外置插件或恢复暂停英雄；前后端自有代码/文档各自采用[前端MIT](https://github.com/dotapk-lol/frontend/blob/main/LICENSE)/[后端MIT](https://github.com/dotapk-lol/backend/blob/main/LICENSE)，第三方图像/音乐/依赖许可不变，MIT不改授Valve素材。

当前前端 `arena-heros22-v1`、`duel-heroes-127-v1`、gameVersion `duel-851e67d77307f479f1fa`；后端保留22历史build `duel-27c78aa4cfc8facc8a23`、`duel-6b1d12f75aa4bbac4e12`，普通embed仍legacy20。重建可能生成新版，需要审核本地/发布绑定，不复用hash，见[后端本地](https://github.com/dotapk-lol/backend/blob/main/docs/DEVELOPMENT.zh-CN.md)。
