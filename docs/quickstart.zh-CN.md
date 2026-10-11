[English](quickstart.md) | [简体中文](quickstart.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 快速开始与导出

声明环境为 Node.js >=22、ESM，已有验证使用25.8.1。纯示例不需要服务或第三方运行时依赖；浏览器/原生host兼容须另有集成证据。

```sh
npm install github:dotapk-lol/heros#main
# 可复现安装应把 main 换成已审核的精确 commit。
```

| 导出 | 用途 |
| --- | --- |
| `@dotapk/heros` | 默认28/112组合、已发英雄/profile/选择器及共享session/schema API |
| `@dotapk/heros/sdk` | 不变的底层SDK，46定义和原有三个默认实现初始化 |
| `@dotapk/heros/content` | 固定46定义目录，不是可玩名单 |
| `@dotapk/heros/catalog` | 全127身份的已发/暂停状态 |
| `@dotapk/heros/contract` | types.ts合约，用 import type，不是运行命令客户端 |
| `@dotapk/heros/examples/blink-range` | 可选已审核 Blink范围factory/installer |

没有全部184 candidate factory导出。规则源文件是内部实现依赖，不是绕过发布暂停英雄的入口。

```js
import { createHeroRegistry, createRuleSession, heroes } from '@dotapk/heros';
const sealed = createHeroRegistry().seal();
console.log(heroes.length, sealed.manifest.length); //28,112
const session = createRuleSession(sealed);
// host = {now(),actor(id),random(),ports}; 具体合约见 host-adapter.zh-CN.md。
```

根入口 mutable registry可在seal前替换已注册技能。原始教学插件可用空SDK registry：

```js
import { createHeroRegistry } from '@dotapk/heros/sdk';
const empty = createHeroRegistry(undefined, { defaults: false });
```

底层SDK仍固定46身份/recipe约束，修改数值定义须保留全目录，不能只传过滤出的28。

源码checkout运行 `npm run build`、`npm test`、`npm run example`。原始Lantern示例请求Spark15魔法伤害、Echo3纯伤、Mend12治疗及.25/.5秒各2治疗，再请求驱散/负面免疫。固定RNG recorder同时恢复有限host与规则checkpoint，比较完整继续轨迹，不支付施法或模拟保护。

training文件以源码打包，没有专门subpath导出；checkout执行 `node examples/training-lantern/run.mjs`。新插件要进入审核源码清单，任意外部模块不能伪造codeIdentity。

可选Blink installer要求原revision1.0.0和未seal registry，需显式调用；host投递activate前不会移动actor。完整[示例](adding-heroes.zh-CN.md)和[host](host-adapter.zh-CN.md)说明边界。
