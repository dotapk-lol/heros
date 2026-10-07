[English](adding-heroes.md) | [简体中文](adding-heroes.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 增加英雄行为：完整原始教学示例

底层SDK只接受冻结46英雄/四槽身份，没有公共addHero；真正新hero/ability ID即使像HeroDefinition也拒绝。此页说明当前可运行扩展，再说明未来身份扩展的独立步骤。

## Lantern Keeper：固定身份载体的原创逻辑

原创显示名Lantern Keeper及Spark/Mend/Echo/Clear Sky，不是目录英雄机制或新stable ID。载体registryNumericId **1**，保留shipped hero/Valve/four ability ID，不运行目录factory，保持active/active/passive/active族。

| 槽 | 原创行为 | 真实公共边界 |
| --- | --- | --- |
| 0 | Spark15魔法伤 | planCast/activate/damage receipt |
| 1 | Mend12治疗+.25/.5各2点 | heal/status声明/typed status job |
| 2 | Echo3纯被动伤及攻击计数 | onAttack/canonical namespace/onDeath |
| 3 | Clear Sky先cleanse再保护意图 | status.cleanse/protect，recorder不模拟保护 |

完整源：[plugin.mjs](../examples/training-lantern/plugin.mjs)、[host.mjs](../examples/training-lantern/host.mjs)、[run.mjs](../examples/training-lantern/run.mjs)，仅原创例子/公共API，无Valve媒体/描述、应用engine或网络。

```js
import { createHeroRegistry, createRuleSession } from '../index.js';
import { installTrainingLantern } from './training-lantern/plugin.mjs';
const registry = createHeroRegistry(undefined, { defaults: false });
installTrainingLantern(registry, { damage: 21 });
const sealed = registry.seal();
const session = createRuleSession(sealed);
// 效果前给session.invoke提供已接受host/event。
```

以上imports用于examples/另一文件，shipped run.mjs有正确相对路径与有限recorder；注册前生成实际源码fingerprint，training暂无package subpath。

## 既有roster内扩展步骤

1. 选stable hero/slots，核passive/input/effect族，不改目录身份或把显示label当registry ID。
2. 教学加examples/静态模块或批准规则模块，声明真实source path/revision、最小requires、不可变参数、canonical schema。
3. create捕获definition/参数，只用context ports、读实际receipt、区分准入/commit/投递。
4. 周期工作声明status源参数/命名binding-delivery，用accepted handle和认证effective view。
5. defaults:false新组合register或已有行replaceSkill预期ID/revision，校验编辑后seal。
6. 生成fingerprint、跑实际effect/config/lifecycle/replay焦点测试，冻结精确文件，告知host能力/event要求。
7. 未独立审阅默认改动就不改全局registry，独立例子不是游戏集成。

## 发布另一现有英雄的PR

未发适配仍暂停；社区可提出一个现有ID四个原创实现、明确host要求、系数来源和实际effect/lifecycle/replay测试。重新生成fingerprint，只从审核公共metadata更新release/expected-manifest.json，在release/profile.json加ID，同步状态/文档并重验package/identity。不仅改status就宣称发布，维护者分别接受完整四槽和host消费者。

不在固定46里的原创numeric/string ID先提独立registry/definition/schema设计，目前无该API，不借Valve ID。

## 未来真正新英雄

需明确产品/API决定和独立审核：扩展稳定目录来源、调整固定roster策略、给新ability recipe模板、mana上限/四槽主动被动准入、身份/schema/checkpoint兼容测试。任意用户roster与 curated versioned扩展是不同API，目前都不新增。

不伪造Valve ID、不借source digest、不改冻结roster/伪造seal/绕factory校验。原创显示载体只是诚实的现有API教学方式，不承诺任意custom hero，见[缺口](release-compatibility.zh-CN.md)。
