[English](balance-identity.md) | [简体中文](balance-identity.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 平衡参数、版本与兼容身份

支持两类参数：现有hero definition中校验的数值recipe，以及factory捕获执行参数；都不是全局可变系数表。

factory.parameters传JSON、create中校验、执行时用不可变parameters。training展示有限正amount和cadence/duration校验，damage15→21改变实际damage请求和sealed rulesHash，不改变hero/ability ID或声称原生平衡。

definition变化保留模板、effect/input/passive族和稳定ID；数值有界、timing另有限制。已有定义用replaceSkill及预期abilityId/revision。新配置clone完整46 shipped定义，经SDK createHeroRegistry(cloned,{defaults:...})或root released initializer传完整46，不只22。host资源fact不能超sealed resources.maxMpByHero，私有modifier提高上限不自动支持。

## 四类身份

| 身份 | 含义 |
| --- | --- |
| npm/package version | 发布者选的分发标识，单独不能证明行为兼容 |
| BATTLE_ABI | 当前host字符串heros-effects-2 |
| behavior revision/schema version | 三段数字实现/状态声明 |
| rosterHash/rulesHash | roster身份与精确sealed行为/配置 |

rulesHash包含ABI、core源身份、完整definitions/resources、排序实现manifest、执行参数、source digest、state schema身份；源码/参数/定义可改hash但不改package版本。rosterHash追稳定身份而非强度。不伪造/手复制hash保持旧checkpoint。

codeIdentity(sourceFiles)只接受生成rules/fingerprint.js中的已审核路径，不运行读取外部文件。源码集成扩展加真实模块/精确依赖、运行 `node scripts/fingerprint.mjs`、审diff和精确package。此示例只增加example身份，不改既有rule/core/default；fingerprint是派生数据不是新规则。

快照要求ABI、精确rulesHash、version1和已知验证namespace。新配置默认不能恢复旧快照；世界与规则candidate都通过再一起恢复。无内置迁移/兼容覆盖，迁移需明确审核工具。

host日志/checkpoint用发布者确认的version与精确组合hash；root88与底层SDK不同，仅0.1.0不够，见[兼容](release-compatibility.zh-CN.md)。

## 可运行已发技能参数示例

`node examples/balance-change.mjs` 经replaceSkill改Leshrac50:2的mvp.params.damage240→60，观察首次实际公共damage请求及rulesHash变化。顶层mvp.damage为0，不是其效果参数，使用recipe params。原始recorder给透明receipt但不支付施法、不推进完整调度链、不证明Native一致。
