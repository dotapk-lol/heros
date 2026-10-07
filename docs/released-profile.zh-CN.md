[English](released-profile.md) | [简体中文](released-profile.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# 已发布22 profile

source0.1.0恰22稳定ID、每位四槽注册。下表按index0..3列既有公共ability ID，参数留content/heroes.json，factory捕获校验不可变配置。

| ID | 英雄身份 | 四个ability ID |
| --- | --- | --- |
| 1 | crystal_maiden | `crystal_maiden_nova`<br>`crystal_maiden_frostbite`<br>`crystal_maiden_aura`<br>`crystal_maiden_freezing_field` |
| 3 | axe | `axe_call`<br>`axe_hunger`<br>`axe_helix`<br>`axe_culling` |
| 4 | sniper | `sniper_shrapnel`<br>`sniper_headshot`<br>`sniper_take_aim`<br>`sniper_assassinate` |
| 5 | anti_mage | `anti_mage_mana_break`<br>`anti_mage_blink`<br>`anti_mage_counterspell`<br>`anti_mage_mana_void` |
| 7 | drow_ranger | `drow_ranger_frost`<br>`drow_ranger_gust`<br>`drow_ranger_multishot`<br>`drow_ranger_marksmanship` |
| 8 | lina | `lina_slave`<br>`lina_array`<br>`lina_fiery`<br>`lina_laguna` |
| 9 | lion | `lion_spike`<br>`lion_hex`<br>`lion_drain`<br>`lion_finger` |
| 15 | shadow_fiend | `shadow_fiend_raze`<br>`shadow_fiend_feast`<br>`shadow_fiend_presence`<br>`shadow_fiend_requiem` |
| 17 | queen_of_pain | `queen_of_pain_shadow_strike`<br>`queen_of_pain_blink`<br>`queen_of_pain_scream`<br>`queen_of_pain_sonic` |
| 18 | witch_doctor | `witch_doctor_cask`<br>`witch_doctor_restoration`<br>`witch_doctor_maledict`<br>`witch_doctor_death_ward` |
| 28 | valve_20 | `vengefulspirit_magic_missile`<br>`vengefulspirit_wave_of_terror`<br>`vengefulspirit_command_aura`<br>`vengefulspirit_nether_swap` |
| 31 | valve_28 | `slardar_sprint`<br>`slardar_slithereen_crush`<br>`slardar_bash`<br>`slardar_amplify_damage` |
| 32 | valve_31 | `lich_frost_nova`<br>`lich_frost_shield`<br>`lich_sinister_gaze`<br>`lich_chain_frost` |
| 36 | valve_36 | `necrolyte_death_pulse`<br>`necrolyte_ghost_shroud`<br>`necrolyte_heartstopper_aura`<br>`necrolyte_reapers_scythe` |
| 50 | valve_52 | `leshrac_split_earth`<br>`leshrac_diabolic_edict`<br>`leshrac_lightning_storm`<br>`leshrac_pulse_nova` |
| 55 | valve_57 | `omniknight_purification`<br>`omniknight_martyr`<br>`omniknight_hammer_of_purity`<br>`omniknight_guardian_angel` |
| 57 | valve_59 | `huskar_inner_fire`<br>`huskar_burning_spear`<br>`huskar_berserkers_blood`<br>`huskar_life_break` |
| 58 | valve_60 | `night_stalker_void`<br>`night_stalker_crippling_fear`<br>`night_stalker_midnight_feast`<br>`night_stalker_darkness` |
| 62 | valve_64 | `jakiro_dual_breath`<br>`jakiro_ice_path`<br>`jakiro_liquid_fire`<br>`jakiro_macropyre` |
| 71 | valve_73 | `alchemist_acid_spray`<br>`alchemist_unstable_concoction`<br>`alchemist_corrosive_weaponry`<br>`alchemist_chemical_rage` |
| 81 | valve_83 | `treant_natures_grasp`<br>`treant_leech_seed`<br>`treant_living_armor`<br>`treant_overgrowth` |
| 82 | valve_84 | `ogre_magi_fireblast`<br>`ogre_magi_ignite`<br>`ogre_magi_bloodlust`<br>`ogre_magi_multicast` |


这是现有二维竞技场已发子集，不是完整官方Dota机制；默认注册不实现世界。legacy规则可发命名owned JSON意图、需要provider认证公共event/capability事实，host执行前实现/验证精确源约定。capability label不等于native验收，通用typed port与owned event/result程序共存，见[插件](plugins.zh-CN.md)/[host](host-adapter.zh-CN.md)。

Slardar31:2为已接受Bash，不自动升级Seaborn/水机制；未发helper/source option不是启用功能。暂停英雄见[未发布](unreleased.zh-CN.md)。
