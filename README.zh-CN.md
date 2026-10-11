[English](README.md) | [简体中文](README.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# heros

MIT确定性英雄规则、可编辑平衡参数、state schema与host合约。公共默认**28英雄/112四槽技能**，匹配已发游戏选定规则。[前端](https://github.com/dotapk-lol/frontend)、[后端](https://github.com/dotapk-lol/backend)现为独立公共仓库，职责/许可边界分开。

仅发布28/112，其余18运行时+81目录身份未发、暂停、游戏灰禁。本包无选人UI，不自动解锁。

GitHub源码发布，不是npm registry发行；Node >=22、ESM，已有串行例子/测试使用25.8.1。

## 项目关系

[dotapk.lol](https://dotapk.lol) 使用三个仓库：

| 仓库 | 职责 |
| --- | --- |
| heros（本仓库） | 纯确定规则、参数、state schema/host合约，Node示例/测试无需DB/浏览器 |
| [frontend](https://github.com/dotapk-lol/frontend) | Cloudflare静态UI/输入/渲染/AI、浏览器世界/host和WebRTC/BC |
| [backend](https://github.com/dotapk-lol/backend) | Go匿名会话、六位邀请码/信令、结果核对、现有MySQL8.4统计，Nginx提供api.dotapk.lol |

后端已在现有主机用独立dota_duel，不换库/新建库；玩家无需登录，语言偏好localStorage。Go不执行技能，本库不提供世界/网络。

环境见各README，精确CORS/registry/build见[前端开发](https://github.com/dotapk-lol/frontend/blob/main/docs/DEVELOPMENT.zh-CN.md)/[后端开发](https://github.com/dotapk-lol/backend/blob/main/docs/DEVELOPMENT.zh-CN.md)。游戏 `arena-heros28-v1`/`duel-heroes-127-v1`，127目录不解锁；前端固定review archive/组合不同于root112，不因公开就替换。

[balance-data说明](balance-data/README.zh-CN.md)只描述**内部人工**从现有MySQL整理汇总、人工审阅后提交，无真实统计/导出脚本/任务/频率承诺。PVP confirmed/peer_agreement与PVE/local/BC recorded/client_reported分开，中止/争议/异常局排除，不自动改参数。

## 安装与启动

```sh
npm install github:dotapk-lol/heros#main
```

可复现消费者固定精确Git commit而非main。本地开发：

```sh
git clone https://github.com/dotapk-lol/heros.git
cd heros
npm run build
npm test
npm run example
```

这些命令无第三方runtime依赖或私有服务。

```js
import { heroes, createHeroRegistry, createRuleSession, isReleasedHero } from '@dotapk/heros';
const registry = createHeroRegistry(); //28,112
const sealed = registry.seal();
console.log(heroes.length, sealed.manifest.length); //28,112
console.log(sealed.abiVersion, sealed.rulesHash);
console.log(isReleasedHero(1), isReleasedHero(0)); //true,false
const session = createRuleSession(sealed);
console.log(session.has(1, 0, 'activate')); //true
// 传入已认证同步host/event；此处不创建世界。
```

[balance-change](examples/balance-change.mjs)演示真实源参数damage240→60、rulesHash改变，原始recorder不是engine或施法支付证明。

原SDK initializer在@dotapk/heros/sdk，固定46定义/原三默认；root仅112。内部definitions/resources仍46，因为SDK验证固定目录，定义不授予可玩。

public112 rulesHash `c2e180393dd9a639ee806c85df949b32aa427a8d018b77324f35cfb981b5e6e4`，不同于前端较大组合；发布不替换live archive/运行，见[兼容](docs/release-compatibility.zh-CN.md)。

## 已发英雄

ID：`1,3,4,5,7,8,9,15,17,18,28,31,32,36,50,55,57,58,62,71,81,82`。

Crystal Maiden、Axe、Sniper、Anti-Mage、Drow Ranger、Lina、Lion、Shadow Fiend、Queen of Pain、Witch Doctor、Vengeful Spirit、Slardar、Lich、Necrophos、Leshrac、Omniknight、Huskar、Night Stalker、Jakiro、Alchemist、Treant Protector、Ogre Magi。

[发布profile](docs/released-profile.zh-CN.md)列精确ID/四技能，[未发](docs/unreleased.zh-CN.md)列全部暂停/缺口。共享helper是内部依赖，不是发布实现/验收承诺；不导出184 candidate组合。

## 开发者指南

- [架构](docs/architecture.zh-CN.md)
- [快速开始/导出](docs/quickstart.zh-CN.md)
- [稳定ID/四槽/主动被动](docs/registry.zh-CN.md)
- [factory/lifecycle/typed命令](docs/plugins.zh-CN.md)
- [效果/盾限制/状态/驱散/免疫](docs/effects.zh-CN.md)
- [周期与时钟](docs/timing.zh-CN.md)
- [参数/revision/rulesHash](docs/balance-identity.zh-CN.md)
- [最小host](docs/host-adapter.zh-CN.md)
- [焦点测试/重放](docs/testing-replay.zh-CN.md)
- [完整原创四槽示例/贡献英雄](docs/adding-heroes.zh-CN.md)
- [发布兼容/限制/分发](docs/release-compatibility.zh-CN.md)
- [贡献](CONTRIBUTING.zh-CN.md)

examples/training-lantern为原创完整教学插件/有限recorder/精确重放，用真实SDK的既有稳定身份载体，不支持任意新ID，不执行原生英雄或生产对局，protect仅记录请求不模拟免疫。

## 目录

| 路径 | 内容 |
| --- | --- |
| release/ | released28、factory组合、expected112 |
| content/ | 数值定义/resources，内部固定46载体 |
| contract/ | registry/session/state/effect/schedule/value与TS |
| rules/ | 审核静态实现、参数和生成fingerprint |
| examples/ | 原创host/插件/参数例子 |
| test/、scripts/ | 焦点metadata/例子与串行runner |
| docs/、balance-data/ | 合约、限制、人工汇总说明 |

既有模板/ID内改定义或factory参数，注册审核factory、seal后通过同步host投递事件/回执。自定义ID/外置插件未实现，文档不启用暂停英雄；按相关焦点测试，纯文档只验配对/路径/链接/diff，不重建fingerprint。

## 范围与许可

包内：原创SDK、纯规则、数值定义/参数、canonical schema、原创例子/焦点测试/文档。不含：应用engine/host、前后端/UI/AI/物理/网络/DB/部署、凭据、旧私有工作记录、真实世界快照、图像/音频/音乐/字体/logo。应用源码在独立公共仓库，自有代码/文档各自MIT。

原创贡献采用[MIT](LICENSE)，保留[NOTICE](NOTICE)；MIT不授权Valve名称/来源/商标/图像/音乐。[前端MIT](https://github.com/dotapk-lol/frontend/blob/main/LICENSE)/[后端MIT](https://github.com/dotapk-lol/backend/blob/main/LICENSE)仅其自有内容，第三方媒体/依赖许可不变。数值是项目快照/竞技场适配，不保证当前官方平衡/完整机制；包不再分发Valve描述/媒体，见[信任](SECURITY.zh-CN.md)。
