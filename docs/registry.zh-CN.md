[English](registry.md) | [简体中文](registry.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 稳定ID与四槽注册

每个运行定义含字符串id、registryNumericId、独立valveHeroId及四个有序ability。index为0..3，S1是index0；数字英雄ID不是数组位置或actor ID，ActorId仍0/1。

根 `createHeroRegistry()` 返回22/88；`@dotapk/heros/sdk` 保留46定义/三个默认初始化、支持defaults:false。两者SDK校验不变，root heroes仅22，但sealed.definitions/resources保留固定46供稳定身份/资源上限。定义存在不等于注册或游戏准入。

```js
import { createHeroRegistry } from '@dotapk/heros';
const registry = createHeroRegistry();
const definition = registry.definition(50).abilities[2];
registry.replaceSkill(50,2,
  {definition:{...definition,mvp:{...definition.mvp,params:{...definition.mvp.params,damage:60}}}},
  {abilityId:definition.id,revision:'2.1.0'});
const sealed = registry.seal();
```

这在原模板族内改数值recipe，host仍要投递已接受事件；通用工具读取实际manifest revision，不硬填旧revision。

源码集成的原始插件：

```js
import { createHeroRegistry } from '@dotapk/heros/sdk';
const registry = createHeroRegistry(undefined,{defaults:false});
registry.registerFactory(heroNumericId,slotIndex,factory);
```

registerFactory拒绝重复/无效行；replaceSkill需预期abilityId/revision、稳定定义身份、合法prospective编译，显式factory替换必须改变声明身份或不可变参数。seal幂等且锁定后续修改；sealed提供abiVersion/rulesHash/rosterHash/definitions/resources/manifest及hero/implementation/namespaceSchema查找。

mvp.passive表示准入族，不可替换passive/input/effect。被动元数据不自行调度，host投递约定hook，规则遵守passivesEnabled。session.has默认activate，被动需显式查onAttack等hook。

没有registerHero/addHero/unregister/registerPluginUrl，构造器只接受既有46稳定身份和模板，任意原创ID拒绝。暂停现有英雄PR需四规则/测试及发布manifest/profile；全新ID需独立catalog/registry/schema兼容设计，见[贡献步骤](adding-heroes.zh-CN.md)。

## 已发布状态

根profile仅22 ID/88行，其余24运行时、81目录身份未发并暂停，没有公共184组合。底层源码、合法定义、factory或手改registry不证明host支持/授权启用。游戏独立实施选择器/CPU/网络/快照白名单，库不包含这些应用系统。
