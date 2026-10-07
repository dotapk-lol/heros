[English](host-adapter.md) | [简体中文](host-adapter.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 最小host适配器

运行host是结构化、同步的小对象：

```js
const host = {
  now: () => simulationTimeSeconds,
  actor: id => actorFacts[id],
  random: () => nextSeededRandomNumber(), // [0, 1)
  ports: {
    damage: request => validateAndDebitDamage(request),
    heal: request => validateAndCreditHealing(request)
  }
};
```

上面函数描述provider职责，不是库导出。可运行provider见[原始有限recorder](../examples/training-lantern/host.mjs)，仅实现示例声明port，没有复制应用engine。

ActorView必含id/heroId/hp/maxHp/mp/maxMp/x/y/dir(-1/1)、alive/invulnerable/debuffImmune/passivesEnabled/guarding/rooted/silenced。数值有限、标志boolean；MP/maxMP在所选英雄sealed资源上限内。session复制冻结事实，不暴露provider对象；session.validateFacts(host)校验双方公共事实，不是完整世界。

capability映射具体port：schedule提供schedule/cancelJob，status提供apply/remove/query/cleanse，target-route增加target.route；缺方法在调用时失败。按[效果表](effects.zh-CN.md)和TS shape，不编造executeCommand/commitCast/addShield库调用，port不返回async Promise。

## 投递前后host职责

1. 选择注册技能并认证actor/ability/cast-event/lifecycle代际；无implementation/hook不授予host接受。
2. 构造分离cast facts；有planCast先取计划，再经实际准入验证ready、资源、目标和额外fact要求。
3. host事务支付/充能/cooldown/action归属/windup/recovery，在接受phase投递onCastCommitted/activate，库不自动支付或防重复cast ID。
4. 校验port的ability/actor/边界、当前life/resource/effect代际、减伤/pierce和声明capability，返回真实actual回执；引用字符串符合类型不代表认证。
5. 管理物理、弹道/entity接触、control仲裁、反射/盾/免疫、时钟/终点顺序，按审核事件/返回约定投递hook。
6. 管理seeded RNG位置、队列/handle代际和世界checkpoint校验；世界/规则candidate及交叉引用全通过才原子恢复。

host可少于公共capability列表，只启用真正支持/测试的factory；context types是潜在能力，requires选择可用项。库不是不可信JS沙箱，源身份不证明任意closure正确。

教学recorder不认证外部事件、不支付施法、记录protect但不模拟免疫；简单HP/status/job记账只演示请求/重放边界。生产adapter借结构，不复制不完整战斗策略。
