[English](SECURITY.md) | [简体中文](SECURITY.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 信任与报告边界

factory是审核静态JS模块，不是敌对插件沙箱；fingerprint标识shipped文件/声明不可变参数，不证明任意closure正确或不可信JS安全。

context提供分离冻结事实、namespace校验state、声明同步port。host负责准入/事务/handle代际/路由/tick顺序/资源边界/世界规则原子恢复，公共shape不认证引用，规则快照不恢复世界。应用adapter在独立前端、不属此包；贡献不带凭据、私有配置、真实快照、媒体和玩家/账号信息。有限教学recorder省略生产策略。

可复现边界/restore问题通过维护者确认的渠道报告。GitHub issue仅含**非敏感**最小原创复现和精确产物身份，不能发live凭据、私有世界/玩家数据或可追踪报告。此指南不编造邮箱/私有报告设施；发布/验收仍是独立所有者动作。

账户 ID、源码路径和产物哈希是标识，不是登录密钥；真实 API token、私钥、密码和 DSN 留在获授权操作者的私有配置。疑似泄露只报分类与文件/提交范围，不附值，也不向服务试用。普通清理提交不会抹除公开 Git 历史及旧作者元数据，也不会使泄露凭据失效；撤销和历史变更须另行协调所有者。
