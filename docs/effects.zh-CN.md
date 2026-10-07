[English](effects.md) | [简体中文](effects.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 效果请求与provider语义

合约描述请求/回执，不替换engine。精确类型见[types.ts](../contract/types.ts)，context仅出现requires声明的port，source/target/owner/actor均actor ID0/1。

| capability | context成员 | 结果/重点 |
| --- | --- | --- |
| damage | damage(spec) | DamageReceipt: accepted/landed/guarded/raw/actual/deferred/killedAtDebit |
| heal | heal({source,target,abilityId,amount}) | {actual,deferred} |
| mana | mana({actor,abilityId,delta}) | number |
| transfer-mana | transferMana({source,target,abilityId,requested}) | number |
| self-damage | selfDamage({actor,abilityId,amount,nonlethal}) | DamageReceipt |
| protect | protect({actor,abilityId,kind,duration}) | handle或null，kind为invulnerability/debuff-immunity |
| status | status.apply/remove/query/cleanse | 分别handle/null、boolean、views、removed handles |
| control | control.apply/release | {handle,duration}/null、boolean |
| target-route | target.route(spec) | accepted/reason、effective owner/target/originalOwner/reflection flags |
| motion-request | motion(spec) | handle/null；blink/leap/dash/pull/ward-follow |
| projectile-request | projectile(spec) | accepted handle |
| legacy-effect | legacyEffect.spawn/view/end | handle、alive/x/y view或null、boolean |
| schedule | schedule(spec)、cancelJob(handle) | handle、boolean |
| action-token | action.token(actor,reasons)、action.valid(token) | JSON token、boolean |
| deferred-hp | deferredHP.begin(spec)、settle(handle) | handle、settlement状态/actual damage/heal |
| cue | cue(event) | 无值，仅视觉意图 |

## 伤害与治疗

damage含source/target/所选abilityId/amount、type physical/magical/pure；可选blockable/stunSeconds/hitstunSeconds/basic/dot/passive/reflected/noReflect/noLifesteal/attackId。host决定减伤、guard、免疫、盾消费、反射和HP debit，返回真实结果；requested/raw/actual不同，不能假设命中或击杀。heal返回actual/deferred，没有虚构accepted字段。资源上限来自sealed定义，不是统一1200MP常量。

## 盾与projection限制

当前SDK**没有通用shield capability或ctx.shield()**。protect是无敌/负面免疫，不是吸收池；盾只能经明确审核的host status/projection约定管理池、顺序并返回真实damage回执。projectDamage的JSON返回不自行安装约定，不猜status.values盾key或把deferredHP当盾。需要通用盾协议的消费者面临发布缺口。

## 状态、驱散与有效性

StatusSpec含owner/target/abilityId/key/duration/polarity/dispel/pierces/values；polarity positive/negative，dispel basic/strong/none。status.cleanse(target,tier,abilityId)返回实际移除handle；provider决定effective记录/代际是否合格，control release/结束清理另归host。typed control.apply含key、stun/root/hex/fear/taunt、duration/pierces/dispel。

旧query可返回仅StatusSpec；StatusView可选handle/effective/remainingSeconds，StatusRecordView三者必填。类型不认证，旧enabled别名不构成严格effective记录；投递有效性/有限剩余life由provider提供。

声明statusDeclarations时源声明含显式ID、recipient self/enemy（相对effective owner）、duration/interval/programId/schedule/polarity/dispel/pierces/values。运行时精确校验status.apply shape含statusDeclarationId；额外intervalSeconds拒绝。StatusSpec的兼容可选intervalSeconds不安装timer或放宽源校验，按精确声明和[调度](timing.zh-CN.md)shape。

## 免疫、路由与反射

actor facts独立表示alive/invulnerable/debuffImmune/passivesEnabled，不授权效果。host认证目标/反射并在正确phase应用pierce/block。route含owner/target/abilityId/numeric range/reflectable/reflected，可选rangePolicy默认admission-and-delivery或admission-only；后者需已认证前置准入回执，不是用户绕过开关。保留返回effective owner/target和noReflect/noLifesteal。

教学recorder演示接口、简单有界HP治疗和status队列，没有armor/resistance/盾/反射/免疫/action准入/原生control，protect只返回日志handle；结果是独立示例证据，不是生产效果验证。
