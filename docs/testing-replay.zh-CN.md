[English](testing-replay.md) | [简体中文](testing-replay.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 焦点测试与确定性重放

在真实公共session边界测改动，区分metadata、独立命令/receipt、native-host和浏览器证据，不互替。焦点测试只覆盖原创例子/公共组合，不重跑目录机制或认证184槽。

必要测试从checkout串行执行：

```sh
node scripts/fingerprint.mjs
node test/documentation/check.mjs terminal
node test/documentation/check.mjs right
node test/documentation/check.mjs parameters
node test/documentation/check.mjs restore
node test/documentation/check.mjs passive
node test/documentation/check.mjs boundaries
node test/documentation/check.mjs defaults
```

每条一个named test，无浏览器/worker pool，仅原创Lantern或metadata。完整历史game runner不属此文档验证；发布者按实际实现改动选择必要检查，不从数量推导验收。

## 证明范围

- 原始请求/回执轨迹在规则+recorder恢复后重复，.25/.5终点pulse按示例策略。
- 相同原创行为对actor1正确路由。
- 捕获参数改变实际damage及rulesHash，无效配置拒绝。
- changed identity/invalid state不部分修改session恢复。
- disabled passive不damage/state，enabled计攻击，death删owned state。
- actor/event冻结，未知source身份/新hero ID拒绝，跨ability执行前失败。
- 底层SDK原三默认及rulesHash不变，root恰88并匹配manifest。

## checkpoint边界

session.snapshot仅abiVersion/rulesHash/version/namespace state；validateSnapshot不变更、restore先校完整candidate再提交，不恢复actor/HP/MP/RNG/job/handle。公共快照合法不认证私有引用。

例子独立保存session.snapshot与recorder.checkpoint、恢复双方比较完整继续轨迹，常量RNG只是有限夹具不是生产设计。真实重放要记录sealed hash、模拟配置、input/event、accepted receipt、seeded RNG/world/resource/handle代际、队列顺序/终点策略，并按约定算术顺序精确比较，不靠容差/取整/备用adapter隐藏不一致。

## 产物检查

源码插件测试前重新生成fingerprint，冻结最终产物；核文件清单、无私有路径/资产/凭据、实际安装/重放字节。安装不证明npm files白名单带新doc/example。白名单要包含维护文档、原创例子/测试，见[兼容](release-compatibility.zh-CN.md)。

纯文档用 `python3 scripts/check-docs.py` 和 `git diff --check`；仅源码/包清单变化才需重新生成 fingerprint。
