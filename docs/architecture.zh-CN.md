[English](architecture.md) | [简体中文](architecture.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 包架构与分发

definitions/resources → 审核factory → mutable registry → sealed manifest/identity → session → 同步host port。库校有限数据/state schema/声明与身份边界，host管理世界/准入支付/效果语义/时钟handle/世界规则原子恢复。

root28/112，SDK固定46定义/三默认，127目录仅状态；18运行时+81仅目录暂停，共享依赖不授予发布准入。

见[README目录](../README.zh-CN.md)、[registry](registry.zh-CN.md)、[插件](plugins.zh-CN.md)、[host](host-adapter.zh-CN.md)、[测试](testing-replay.zh-CN.md)、[兼容/分发](release-compatibility.zh-CN.md)。Node build生成fingerprint、不构建游戏/服务器；支持GitHub源码安装，没有npm registry发行/部署服务/自动平衡导出/新数据库配置。package.json有显式files白名单，新配对打包文档须列入并dry-run核清单，保留标准[LICENSE](../LICENSE)/[NOTICE](../NOTICE)和第三方边界。
