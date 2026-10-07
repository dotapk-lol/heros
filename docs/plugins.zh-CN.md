[English](plugins.md) | [简体中文](plugins.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 技能factory、生命周期与typed命令

factory是静态审核模块，不是远程脚本/沙箱插件，仅有abiVersion、可选JSON parameters、create(config)。ABI为heros-effects-2；create收到冻结hero、所选definition、所有definitions、mana resources和捕获参数，prospective编译可能多次调用，保持纯函数、无注册副作用。

implementation声明behaviorId、三段数字revision、唯一requires能力、branded stateSchema、codeIdentity生成的真实codeHash/sourceFiles，至少一个命名hook。可选namespace、requiredCastFacts、statusDeclarations、scheduledHandlers、scheduledBindings，未知字段拒绝。外部closure不得编造/借用source digest，运行时不是敌对JS沙箱。

默认namespace为skill:<heroId>:<abilityId>，显式namespace需匹配heros/[a-z0-9/_-]及长度。共享namespace用同一canonical schema实例，文本一致不保证validator身份。defineStateSchema支持有限JSON、显式union、封闭有界object/array，不是任意JSON Schema；EMPTY_STATE_SCHEMA仅接受null。

## 生命周期投递

| hook | 投递边界 |
| --- | --- |
| planCast | host准入查询，返回accepted/reason/costs/windup/recovery/action，不自动支付 |
| onCastCommitted | host已认证且commit施法 |
| activate | host投递已接受主动执行 |
| onContact/onStage | host定义弹道/entity/stage事实 |
| onInterrupt/onDeath | host投递中断/死亡并协调清理 |
| projectAttack/projectDamage/projectHealing/projectInterval | 与host约定的纯projection，多数event/result是Json |
| onAttack/onDamage/onTargeted | 已认证事件通知，不是任意输入声明 |
| 命名scheduledHandlers | 经host job校验后session.scheduled投递 |

session.invoke(heroId,slot,hook,host,event)无hook返回handled:false，否则handled:true/value（undefined转null），未知hook抛错。session.has默认activate，被动需明确hook名。session.scheduled(heroId,slot,name,host,data)调用声明handler，不认证job引用或拥有队列，这属host。

库没有自动lifecycle流水线、周期clock、event bus或施法事务。许多hook故意用JSON，无统一projection merge；启用前与host约定事件schema/顺序。

## context与请求

ctx.now是冻结time fact，actor(id)分离冻结事实，random()校验host结果在[0,1)。state read/write/remove，write验证canonical namespace schema。target.distance(a,b)始终计算绝对x距离，target.route需target-route。

其他操作均声明能力port，如damage/heal/status/control/schedule/protection。请求是有限plain JSON，不支持function/Promise/undefined/NaN/class实例；可选undefined属性应省略。port同步，返回JSON分离冻结。

请求abilityId必须所选技能，actor0/1，带owner的event须匹配所选hero。session检查这些边界及status/schedule shape，不校验所有效果语义，provider认证请求/实际回执，见[host](host-adapter.zh-CN.md)、[效果](effects.zh-CN.md)。

requiredCastFacts:['effectiveCastRange']是opt-in并需planCast，只有该hook可收到有限非负effectiveCastRange，未声明或错hook拒绝。它是host认证的世界单位fact，不含接触margin，不是新factory参数。

完整原始factory见[plugin.mjs](../examples/training-lantern/plugin.mjs)：三主动一被动、不可变平衡参数、state清理、typed status节拍，不改变默认注册。
