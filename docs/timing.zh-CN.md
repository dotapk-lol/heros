[English](timing.md) | [简体中文](timing.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 周期工作与host时钟

规则用host模拟秒、稳定事件顺序和声明的命名handler；库不创建计时器/帧循环。避免Date.now、setTimeout、环境随机或隐藏异步。固定步长host明确秒/帧转换与终点包含策略，包无统一帧率。

schedule请求含abilityId、owner、handler、delay、JSON data和可选action token；typed请求还有target（actor或允许null）、binding/delivery。scheduledBindings声明合法handler组合并requires schedule；scheduledHandlers为同步函数。typed delay须有限、非负、<=3600。

| binding | delivery阶段 | 引用 |
| --- | --- | --- |
| source-job | pack.job-due | 无ref |
| passive | actor.passive | 无ref |
| status | actor.status-pre-advance或actor.status-advance | 已接受status ref |
| entity mode area | pack.entity | 已接受area ref |
| entity mode link | pack.entity | 已接受link ref |
| channel | pack.entity | 已接受channel ref |
| swarm | actor.swarm | 已接受swarm ref |

status/entity-link/channel要求非null target。opaque handle包含host代际/回合身份。库校验shape/声明pair，不校验引用存在；provider在排队和投递时验证owner、资源类型、life generation、phase。

旧请求有合法actor target但无binding/delivery是独立兼容路径，不应称已认证typed schedule，source-only旧请求也不自动变typed。

## 声明状态节拍

周期statusDeclaration含非null programId、正interval与声明status handler/phase；programId null时interval必须0、schedule null。status绑定请求带精确声明delay/statusDeclarationId，不通过data偷加源参数。data是JSON但无通用schema，源/provider检查自有event合约。

[Lantern插件](../examples/training-lantern/plugin.mjs)的Mend每.25秒：status.apply返回handle后才schedule，handler查询effective记录、请求2治疗，remainingSeconds>0继续。[有限recorder](../examples/training-lantern/host.mjs)按due-time再插入顺序，包含终点tick：.5秒状态在.25/.5投递。此策略只属示例，不代表所有host/native时钟。

死亡/中断/驱散/移除时host按具体规则取消或失效job，原始status不同的结束/持续不能统一套一个全局策略。cancelJob返回是否真删pending job；规则state恢复不恢复job、accepted status引用或效果时钟。
