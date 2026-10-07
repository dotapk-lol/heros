[English](CONTRIBUTING.md) | [简体中文](CONTRIBUTING.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 贡献指南

贡献原创确定行为、文档或焦点测试，先读[开发指南](README.zh-CN.md)和[真实合约](contract/types.ts)。registry固定46英雄/四槽，新身份/共享能力是API提案，不是普通插件编辑。

## 修改规则

选既有stable ID/slot并记录预期revision，保留身份/准入族；静态factory捕获验证不可变参数，声明真实source、最小capability、命名hook和canonical state。用provider请求/actual回执，世界事务/时钟/接受引用认证归host，缺provider语义继续gated。

应用engine/adapter在独立前端，贡献保持包边界；不复制凭据/部署secret/媒体/版权描述。说明系数来源/竞技场适配，不保证当前官方平衡；MIT覆盖原创贡献，不覆盖第三方，保留LICENSE/NOTICE。

焦点测试真实变化请求/receipt、相关双方、invalid config/lifecycle/passive/identity mismatch/原子restore。在源checkout生成fingerprint并验证最终安装字节；生成digest不证明不可信closure或native一致。

纯文档验链接/路径/diff，不重建fingerprint；例子或规则边界变化按[焦点测试](docs/testing-replay.zh-CN.md)逐条测相关case，不要求以全套数量替代证据，也不把独立测试称浏览器/native集成。

## PR检查

- 说明问题与具体变化请求/例子。
- stable ID/四槽/active-passive-input-effect族有效。
- 参数、语义revision、source依赖/state schema真实。
- 仅必需port，尊重actual回执/accepted handle。
- 相关clock、中断/死亡、effective状态/终点顺序清楚。
- 焦点测试效果、拒绝/restore，记录精确命令/运行时。
- 审fingerprint/文件清单，无无关rule/schema/default变更。
- 区分definition/candidate/registered/host-accepted；仅22/88默认，不称184全接线。
- 不带私有路径、secret、Valve媒体/复制描述。
- README/guide/例子/打包链接正确，精确组合/版本清楚，不仅改状态解锁。

共享合约/新身份/default注册需独立设计和host兼容测试；patch小、说明缺口、保留旧artifact身份供review。

## 人工平衡快照

按[balance-data](balance-data/README.zh-CN.md)，内部从已有MySQL人工汇总并审阅；说明版本/窗口/cohort/分母/去标识策略。不加自动同步/导出工具、真实示例、原报告/可追踪记录。快照批准不授权改参数或启用暂停英雄。

## 双语维护

每篇维护Markdown配English name.md/中文name.zh-CN.md，首部语言链接和官网https://dotapk.lol；两份同时改，新打包guide更新package.json files白名单。不复制机器schema/数据，不把标准英文LICENSE译成法律授权。用 `python3 scripts/check-docs.py` 和 `git diff --check`，不提交本地报告/矩阵/凭据。应用源码独立公开，包边界和暂停状态不变。
