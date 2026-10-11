[English](released-profile.md) | [简体中文](released-profile.zh-CN.md) | [Website / 官网](https://dotapk.lol)

# Released28 profile

Source version0.2.0-six28.1; exactly28 stable IDs with all four slots registered. Each row lists the existing public ability IDs in index0..3 order. Numeric parameters remain in content/heroes.json and factories capture validated immutable configuration.

| ID | Hero | Four ability IDs |
| --- | --- | --- |
| 0 | juggernaut | `juggernaut_blade_fury`<br>`juggernaut_healing_ward`<br>`juggernaut_blade_dance`<br>`juggernaut_omnislash` |
| 1 | crystal_maiden | `crystal_maiden_nova`<br>`crystal_maiden_frostbite`<br>`crystal_maiden_aura`<br>`crystal_maiden_freezing_field` |
| 2 | pudge | `pudge_hook`<br>`pudge_rot`<br>`pudge_meat_shield`<br>`pudge_dismember` |
| 3 | axe | `axe_call`<br>`axe_hunger`<br>`axe_helix`<br>`axe_culling` |
| 4 | sniper | `sniper_shrapnel`<br>`sniper_headshot`<br>`sniper_take_aim`<br>`sniper_assassinate` |
| 5 | anti_mage | `anti_mage_mana_break`<br>`anti_mage_blink`<br>`anti_mage_counterspell`<br>`anti_mage_mana_void` |
| 6 | phantom_assassin | `phantom_assassin_dagger`<br>`phantom_assassin_strike`<br>`phantom_assassin_immaterial`<br>`phantom_assassin_coup` |
| 7 | drow_ranger | `drow_ranger_frost`<br>`drow_ranger_gust`<br>`drow_ranger_multishot`<br>`drow_ranger_marksmanship` |
| 8 | lina | `lina_slave`<br>`lina_array`<br>`lina_fiery`<br>`lina_laguna` |
| 9 | lion | `lion_spike`<br>`lion_hex`<br>`lion_drain`<br>`lion_finger` |
| 10 | earthshaker | `earthshaker_fissure`<br>`earthshaker_totem`<br>`earthshaker_aftershock`<br>`earthshaker_echo` |
| 14 | windranger | `windranger_shackle`<br>`windranger_powershot`<br>`windranger_windrun`<br>`windranger_focus` |
| 15 | shadow_fiend | `shadow_fiend_raze`<br>`shadow_fiend_feast`<br>`shadow_fiend_presence`<br>`shadow_fiend_requiem` |
| 17 | queen_of_pain | `queen_of_pain_shadow_strike`<br>`queen_of_pain_blink`<br>`queen_of_pain_scream`<br>`queen_of_pain_sonic` |
| 18 | witch_doctor | `witch_doctor_cask`<br>`witch_doctor_restoration`<br>`witch_doctor_maledict`<br>`witch_doctor_death_ward` |
| 19 | tidehunter | `tidehunter_gush`<br>`tidehunter_shell`<br>`tidehunter_anchor`<br>`tidehunter_ravage` |
| 31 | valve_28 | `slardar_sprint`<br>`slardar_slithereen_crush`<br>`slardar_bash`<br>`slardar_amplify_damage` |
| 28 | valve_20 | `vengefulspirit_magic_missile`<br>`vengefulspirit_wave_of_terror`<br>`vengefulspirit_command_aura`<br>`vengefulspirit_nether_swap` |
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

This is the released subset of the existing two-dimensional arena adaptation, not complete official Dota mechanics. Default registration does not implement a game world. Legacy rules may emit named owned JSON intents and require provider-authenticated public event/capability facts; hosts must implement and validate the exact source conventions before execution. Setting a capability label is not native acceptance. Generic typed ports and owned event/result programs coexist; see plugins.md and host-adapter.md.

Slardar31:2 uses the accepted Bash rule, not an automatic Seaborn/water upgrade. Unpublished source helpers or source-profile options are not an enabled feature. All paused heroes are listed in unreleased.md.

## Six-hero release

The new IDs are 0, 2, 6, 10, 14 and 19. The public package has 28 heroes and 112 slots; the frontend composes 143 implementation metadata rows. The other 18 runtime identities stay disabled. Dismember heals from actual committed damage, including mitigation and overkill limits. New scheduled slashes, projectiles, walls, buffs and waves preserve deterministic snapshots and clear on rematch.
