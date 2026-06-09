
const ASSET_FILES = ["assets/ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/11_dungeon_left_over01.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/11_dungeon_left_over02.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/13_dungeon_right_over01.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/13_dungeon_right_over02.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front01.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front02.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front03.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front04.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front05.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front06.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front07.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front08.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front09.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front10.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side01.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side02.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side03.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side04.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side05.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side06.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side07.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side08.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side09.png", "assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side10.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_bread.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_cheese.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_chicken.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_potion_blue.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_potion_green.png", "assets/ruin_runners_shaia/sprites/item/item_food/item_potion_red.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure01.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure02.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure03.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure04.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure05.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_cure06.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire01.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire02.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire03.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire04.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire05.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_fire06.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice01.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice02.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice03.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice04.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice05.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_ice06.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison01.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison02.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison03.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison04.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison05.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_poison06.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder01.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder02.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder03.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder04.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder05.png", "assets/ruin_runners_shaia/sprites/item/item_orb/item_orb_thunder06.png", "assets/ruin_runners_shaia/sprites/prop/apple.png", "assets/ruin_runners_shaia/sprites/prop/baricade_export.png", "assets/ruin_runners_shaia/sprites/prop/barrel_001.png", "assets/ruin_runners_shaia/sprites/prop/barrel_002.png", "assets/ruin_runners_shaia/sprites/prop/barrel_break01.png", "assets/ruin_runners_shaia/sprites/prop/barrel_break02.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall01.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall02.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall03.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall04.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall05.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall06.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall07.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall08.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall09.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall10.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall11.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall12.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall13.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall14.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall15.png", "assets/ruin_runners_shaia/sprites/prop/barrel_fall16.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling01.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling02.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling03.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling04.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling05.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling06.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling07.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling08.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling09.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling10.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling11.png", "assets/ruin_runners_shaia/sprites/prop/barrel_rolling12.png", "assets/ruin_runners_shaia/sprites/prop/chest_open01.png", "assets/ruin_runners_shaia/sprites/prop/chest_open02.png", "assets/ruin_runners_shaia/sprites/prop/chest_open03.png", "assets/ruin_runners_shaia/sprites/prop/chest_open04.png", "assets/ruin_runners_shaia/sprites/prop/chest_open05.png", "assets/ruin_runners_shaia/sprites/prop/chest_open06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_append/common_12_guard_dash06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0102.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0103.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0104.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0105.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0106.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0201.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0202.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0203.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0204.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0205.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0206.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0301.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0302.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0303.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0304.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0305.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0306.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0307.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0401.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0402.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0403.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0404.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0405.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0406.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0407.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0408.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0409.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0410.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0411.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_begin01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_begin02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_end01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_end02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_end03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_end04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_end05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0101.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0102.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0103.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0104.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0105.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0106.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0201.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0202.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0203.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0204.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0205.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0206.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0207.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0208.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0209.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_attack/attack_21_jump_attack07.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A07.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A08.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B07.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B08.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_01_crouch_to_idle01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_01_crouch_to_idle02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_01_idle_crouch.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_01_idle_to_crouch01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_01_idle_to_crouch02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_crouch01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_crouch02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_stand_A01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_stand_A02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_stand_B01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_03_turn_stand_B02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_04_back01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk07.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk08.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk09.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk10.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk11.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk12.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run06.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_13_break01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_13_break02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_13_break03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_13_break04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_13_break05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump05.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_down01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_down02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_down03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_up01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_32_guard_crouch01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_32_guard_crouch02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_02_damage_body.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_03_damage_crouch.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_air01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_begin01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_begin02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_begin03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_landing_A01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_landing_A02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_landing_A03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_landing_A04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_lying_A01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_12_blow_landing_B04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_12_blow_lying_B01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_13_standup01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_13_standup02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_13_standup03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_13_standup04.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_21_stun.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_22_bind.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_23_electric01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_23_electric02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_24_blow_burn_begin01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_24_blow_burn_begin02.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_24_blow_burn_begin03.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_24_blowburn_air01.png", "assets/ruin_runners_shaia/sprites/shaia/sprites_damage/damage_24_blowburn_air02.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword01.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword02.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword03.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword04.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword05.png", "assets/ruin_runners_shaia/sprites/skeleton/attack_01_sword06.png", "assets/ruin_runners_shaia/sprites/skeleton/common_01_idle01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_03_turn_stand01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_03_turn_stand02.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk02.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk03.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk04.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk05.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk06.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk07.png", "assets/ruin_runners_shaia/sprites/skeleton/common_11_walk08.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump02.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump03.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump_begin01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump_down01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_21_jump_up01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_22_landing01.png", "assets/ruin_runners_shaia/sprites/skeleton/common_22_landing02.png", "assets/ruin_runners_shaia/sprites/skeleton/common_22_landing03.png", "assets/ruin_runners_shaia/sprites/skeleton/common_22_landing04.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_01_damage_head.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_02_damage_body.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_11_blow_air01.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_11_blow_begin01.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_11_blow_landing01.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_13_standup01.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_13_standup02.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_13_standup03.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_13_standup04.png", "assets/ruin_runners_shaia/sprites/skeleton/damage_13_standup05.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_bone008.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_chest008.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_shiield008.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_skul008.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_sword008.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist001.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist002.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist003.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist004.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist005.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist006.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist007.png", "assets/ruin_runners_shaia/sprites/skeleton/debris_waist008.png", "assets/ruin_runners_shaia/sprites/skeleton/misc_01_enter.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_coin/vfx_coin06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_debris_wood/vfx_debris_wood08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire09.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire10.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire11.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire12.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire13.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire14.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire15.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire/vfx_fire16.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_banish/vfx_fire_banish08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_fire_loop/vfx_fire_loop08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_ground_shock/vfx_ground_shock08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_guard/vfx_guard08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke09.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke10.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke11.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke12.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke13.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke14.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke15.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_smoke/vfx_smoke16.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun06.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun07.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_stun/vfx_stun08.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle01.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle02.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle03.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle04.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle05.png", "assets/ruin_runners_shaia/sprites/vfx/vfx_twinkle/vfx_twinkle06.png", "assets/ruin_runners_shaia/tree/shaia_attack.png", "assets/ruin_runners_shaia/tree/shaia_common01.png", "assets/ruin_runners_shaia/tree/shaia_common02.png", "assets/ruin_runners_shaia/tree/shaia_damage01.png", "assets/ruin_runners_shaia/tree/skelton_all.png"];

const STORAGE_KEY = 'shaia_sr_route_save_v1';
const CANVAS_W = 1280;
const CANVAS_H = 720;
const DEBUG = false;

let STATE = null;

function createDefaultState() {
    return {
        day: 1,
        hp: 100,
        maxHp: 100,
        sta: 100,
        maxSta: 100,
        wil: 100,
        maxWil: 100,
        pressure: 0,
        fatigue: 0,
        exp: 0,
        gold: 0,
        battleWins: 0,
        battleLosses: 0,
        roomsCleared: 0,
        touchControls: true,
        cameraShake: true,
        sound: true,
        room: 'BedroomScene',
        positions: {
            BedroomScene: { x: 240, y: 540 },
            CorridorScene: { x: 260, y: 540 },
            BattleScene: { x: 180, y: 520 }
        },
        sceneData: {}
    };
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return createDefaultState();
        const parsed = JSON.parse(raw);
        return mergeState(createDefaultState(), parsed || {});
    } catch {
        return createDefaultState();
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

function mergeState(base, incoming) {
    const out = { ...base, ...(incoming || {}) };
    out.positions = { ...base.positions, ...(incoming && incoming.positions ? incoming.positions : {}) };
    out.sceneData = { ...base.sceneData, ...(incoming && incoming.sceneData ? incoming.sceneData : {}) };
    return out;
}

function assetKey(rel) {
    return rel.replace(/^assets\//, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
}

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function selectAssets(fragmentOrFragments) {
    const fragments = Array.isArray(fragmentOrFragments) ? fragmentOrFragments : [fragmentOrFragments];
    return ASSET_FILES.filter(p => fragments.every(f => p.includes(f))).sort(naturalSort);
}

function keysFromAssets(list) {
    return list.map(assetKey);
}

function defineAnim(scene, key, frames, frameRate = 12, repeat = -1, yoyo = false) {
    if (!frames.length || scene.anims.exists(key)) return;
    scene.anims.create({
        key,
        frames: frames.map(frameKey => ({ key: frameKey })),
        frameRate,
        repeat,
        yoyo
    });
}

function makeText(scene, x, y, text, style = {}) {
    return scene.add.text(x, y, text, {
        fontFamily: '"Trebuchet MS", Arial, sans-serif',
        color: '#fff',
        fontSize: '18px',
        stroke: '#000000',
        strokeThickness: 4,
        ...style
    });
}

function buildGradientOverlay(scene, color = 0x120c1a, alpha = 0.25) {
    const overlay = scene.add.rectangle(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W, CANVAS_H, color, alpha);
    overlay.setScrollFactor(0);
    return overlay;
}

function buildButton(scene, x, y, w, h, label, onClick, fill = 0x3b235a) {
    const rect = scene.add.rectangle(x, y, w, h, fill, 0.92).setStrokeStyle(2, 0xffd6ff, 0.35).setOrigin(0.5).setScrollFactor(0);
    const txt = makeText(scene, x, y, label, {
        fontSize: '16px',
        fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerdown', () => onClick && onClick());
    txt.setInteractive({ useHandCursor: true });
    txt.on('pointerdown', () => onClick && onClick());
    return { rect, txt };
}

function createHudBar(scene, x, y, w, h, label, fill = 0xa94bff) {
    const title = makeText(scene, x, y - 18, label, { fontSize: '14px', fontStyle: 'bold', strokeThickness: 3 });
    const bg = scene.add.rectangle(x, y, w, h, 0x1a1324, 0.85).setOrigin(0, 0);
    const fg = scene.add.rectangle(x, y, w, h, fill, 1).setOrigin(0, 0);
    bg.setScrollFactor(0);
    fg.setScrollFactor(0);
    title.setScrollFactor(0);
    return { title, bg, fg, width: w, height: h };
}

function updateHudBar(bar, value01) {
    if (!bar) return;
    const w = Math.max(1, Math.floor(bar.width * clamp(value01, 0, 1)));
    bar.fg.displayWidth = w;
}

function assetPath(rel) {
    return rel;
}

function todayKey() {
    return `day_${STATE.day}`;
}

function deriveCaps(state = STATE) {
    state.capHp = Math.max(30, state.maxHp - Math.floor(state.pressure * 0.20) - Math.floor(state.fatigue * 0.15));
    state.capSta = Math.max(25, state.maxSta - Math.floor(state.pressure * 0.35) - Math.floor(state.fatigue * 0.25));
    state.capWil = Math.max(20, state.maxWil - Math.floor(state.pressure * 0.28) - Math.floor(state.fatigue * 0.20));
    state.hp = clamp(state.hp, 0, state.capHp);
    state.sta = clamp(state.sta, 0, state.capSta);
    state.wil = clamp(state.wil, 0, state.capWil);
}

function recoverInBed(amountPressure = 22) {
    deriveCaps();
    STATE.pressure = Math.max(0, STATE.pressure - amountPressure);
    STATE.fatigue = Math.max(0, STATE.fatigue - 12);
    STATE.hp = STATE.capHp;
    STATE.sta = STATE.capSta;
    STATE.wil = STATE.capWil;
    STATE.day += 1;
    saveState();
}

function applyBattleAftermath(result) {
    if (result === 'victory') {
        STATE.exp += 20;
        STATE.gold += 25;
        STATE.battleWins += 1;
        STATE.pressure = clamp(STATE.pressure + 6, 0, 999);
        STATE.fatigue = clamp(STATE.fatigue + 7, 0, 999);
    } else if (result === 'defeat') {
        STATE.battleLosses += 1;
        STATE.pressure = clamp(STATE.pressure + 14, 0, 999);
        STATE.fatigue = clamp(STATE.fatigue + 16, 0, 999);
        STATE.hp = 1;
        STATE.sta = Math.max(1, STATE.sta - 20);
        STATE.wil = Math.max(1, STATE.wil - 15);
    }
    deriveCaps();
    saveState();
}

function storeRoomPosition(scene, roomKey) {
    if (!scene || !scene.player) return;
    STATE.positions[roomKey] = {
        x: Math.round(scene.player.x),
        y: Math.round(scene.player.y)
    };
    STATE.room = roomKey;
    saveState();
}

function getRoomPosition(roomKey, fallback = { x: 240, y: 540 }) {
    return STATE.positions && STATE.positions[roomKey] ? STATE.positions[roomKey] : fallback;
}

function rememberSceneData(roomKey, data) {
    STATE.sceneData[roomKey] = { ...(STATE.sceneData[roomKey] || {}), ...(data || {}) };
}

function getSceneData(roomKey) {
    return STATE.sceneData[roomKey] || {};
}

function saveAndStart(scene, nextKey, data = {}) {
    scene.cameras.main.fadeOut(180, 0, 0, 0);
    scene.time.delayedCall(200, () => {
        storeRoomPosition(scene, scene.scene.key);
        scene.scene.start(nextKey, data);
    });
}

class AssetBootScene extends Phaser.Scene {
    constructor() {
        super('AssetBootScene');
    }

    preload() {
        const { width, height } = this.scale;
        const barBg = this.add.rectangle(width / 2, height / 2, 460, 18, 0x20112e, 1).setOrigin(0.5);
        const bar = this.add.rectangle(width / 2 - 230, height / 2, 0, 18, 0xb05dff, 1).setOrigin(0, 0.5);
        const txt = makeText(this, width / 2, height / 2 - 40, 'Loading Shaia route...', {
            fontSize: '24px',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const pct = makeText(this, width / 2, height / 2 + 28, '0%', {
            fontSize: '14px',
            color: '#d2b5ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.load.on('progress', v => {
            bar.displayWidth = Math.max(4, 460 * v);
            pct.setText(`${Math.floor(v * 100)}%`);
        });

        ASSET_FILES.forEach(rel => {
            this.load.image(assetKey(rel), assetPath(rel));
        });
    }

    create() {
        STATE = loadState();
        defineAnimations(this);
        this.scene.start('TitleScene');
    }
}

function defineAnimations(scene) {
    const groups = {
        shaiaIdle: selectAssets('sprites/shaia/sprites_common/common_00_idle_stand_B'),
        shaiaWalk: selectAssets('sprites/shaia/sprites_common/common_11_walk'),
        shaiaRun: selectAssets('sprites/shaia/sprites_common/common_12_run'),
        shaiaJump: selectAssets(['sprites/shaia/sprites_common/common_21_jump']),
        shaiaLand: selectAssets('sprites/shaia/sprites_common/common_22_landing'),
        shaiaCrouch: selectAssets('sprites/shaia/sprites_common/common_01_idle_crouch'),
        shaiaGuard: selectAssets('sprites/shaia/sprites_common/common_31_guard_stand'),
        shaiaGuardCrouch: selectAssets('sprites/shaia/sprites_common/common_32_guard_crouch'),
        shaiaGuardDash: selectAssets('sprites/shaia/sprites_append/common_12_guard_dash'),
        shaiaAttackLight: selectAssets('sprites/shaia/sprites_attack/attack_01_cobination01'),
        shaiaAttackKick: selectAssets('sprites/shaia/sprites_attack/attack_05_knee'),
        shaiaAttackDash: selectAssets('sprites/shaia/sprites_attack/attack_06_run_kick'),
        shaiaHurt: selectAssets('sprites/shaia/sprites_damage/damage_13_standup'),
        shaiaHit: selectAssets('sprites/shaia/sprites_damage/damage_11_blow'),
        skeletonIdle: selectAssets('sprites/skeleton/common_01_idle'),
        skeletonWalk: selectAssets('sprites/skeleton/common_11_walk'),
        skeletonJump: selectAssets('sprites/skeleton/common_21_jump'),
        skeletonLand: selectAssets('sprites/skeleton/common_22_landing'),
        skeletonAttack: selectAssets('sprites/skeleton/attack_01_sword'),
        skeletonHurt: selectAssets('sprites/skeleton/damage_13_standup'),
        vfxHit: selectAssets('sprites/vfx/vfx_hit'),
        vfxFire: selectAssets('sprites/vfx/vfx_fire'),
        vfxSmoke: selectAssets('sprites/vfx/vfx_smoke'),
        dungeonBg: selectAssets('sprites/background/sprites_dungeon'),
        props: selectAssets('sprites/prop'),
    };

    const animDefs = [
        ['shaia-idle', groups.shaiaIdle, 10, -1],
        ['shaia-walk', groups.shaiaWalk, 12, -1],
        ['shaia-run', groups.shaiaRun, 15, -1],
        ['shaia-jump', groups.shaiaJump, 13, 0],
        ['shaia-land', groups.shaiaLand, 14, 0],
        ['shaia-crouch', groups.shaiaCrouch, 10, 0],
        ['shaia-guard', groups.shaiaGuard, 8, -1],
        ['shaia-guard-crouch', groups.shaiaGuardCrouch, 8, -1],
        ['shaia-guard-dash', groups.shaiaGuardDash, 18, 0],
        ['shaia-attack-light', groups.shaiaAttackLight, 18, 0],
        ['shaia-attack-kick', groups.shaiaAttackKick, 16, 0],
        ['shaia-attack-dash', groups.shaiaAttackDash, 18, 0],
        ['shaia-hurt', groups.shaiaHurt, 12, 0],
        ['shaia-hit', groups.shaiaHit, 16, 0],

        ['skeleton-idle', groups.skeletonIdle, 8, -1],
        ['skeleton-walk', groups.skeletonWalk, 10, -1],
        ['skeleton-jump', groups.skeletonJump, 12, 0],
        ['skeleton-land', groups.skeletonLand, 10, 0],
        ['skeleton-attack', groups.skeletonAttack, 16, 0],
        ['skeleton-hurt', groups.skeletonHurt, 12, 0],

        ['vfx-hit', groups.vfxHit, 24, 0],
        ['vfx-fire', groups.vfxFire, 20, -1],
        ['vfx-smoke', groups.vfxSmoke, 18, -1],
    ];

    animDefs.forEach(([key, files, frameRate, repeat]) => defineAnim(scene, key, keysFromAssets(files), frameRate, repeat));
}

class BaseRoomScene extends Phaser.Scene {
    constructor(key, roomKey, bgStyle = 'bedroom') {
        super(key);
        this.roomKey = roomKey;
        this.bgStyle = bgStyle;
        this.touch = {};
        this.interactables = [];
        this.promptText = null;
    }

    createRoom(worldWidth, worldHeight = CANVAS_H) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBackgroundColor('#130c1a');
        this.controls = {
            left: false, right: false, up: false, down: false,
            attack: false, guard: false, interact: false, dash: false,
        };
        this._createBackground(worldWidth);
        this._createFloor();
        this._createPlayer();
        this._createHUD();
        this._createTouchControls();
        this._bindKeyboard();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => storeRoomPosition(this, this.roomKey));
        const pos = getRoomPosition(this.roomKey);
        this.player.setPosition(pos.x, pos.y);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    _createBackground(worldWidth) {
        const y = this.worldHeight / 2;
        const left = this.add.image(256, y, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png'));
        const center = this.add.tileSprite(768, y, Math.max(512, worldWidth - 1024), 384, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png'));
        const right = this.add.image(worldWidth - 256, y, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png'));
        left.setScale(2);
        center.setScale(2);
        right.setScale(2);

        const tint = this.bgStyle === 'battle' ? 0x2a0810 : this.bgStyle === 'corridor' ? 0x160f26 : 0x1a1024;
        const overlay = this.add.rectangle(worldWidth / 2, y, worldWidth, this.worldHeight, tint, this.bgStyle === 'battle' ? 0.34 : 0.22);
        overlay.setScrollFactor(1);

        if (this.bgStyle !== 'battle') {
            const fence1 = this.add.image(240, 478, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front01.png')).setScale(1.2).setAlpha(0.9);
            const fence2 = this.add.image(worldWidth - 240, 478, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front08.png')).setScale(1.2).setAlpha(0.9);
            fence1.setScrollFactor(1);
            fence2.setScrollFactor(1);
        }
    }

    _createFloor() {
        const floor = this.add.rectangle(this.worldWidth / 2, 650, this.worldWidth, 140, 0x000000, 0.001);
        this.physics.add.existing(floor, true);
        this.floor = floor;
        const ledges = [];
        if (this.bgStyle === 'bedroom') {
            ledges.push({ x: 480, y: 580, w: 220, h: 20 }, { x: 980, y: 520, w: 220, h: 20 }, { x: 1480, y: 580, w: 220, h: 20 });
        } else if (this.bgStyle === 'corridor') {
            ledges.push({ x: 600, y: 585, w: 200, h: 20 }, { x: 1500, y: 535, w: 240, h: 20 }, { x: 2380, y: 570, w: 220, h: 20 });
        } else {
            ledges.push({ x: 540, y: 575, w: 220, h: 20 }, { x: 980, y: 520, w: 220, h: 20 }, { x: 1320, y: 575, w: 220, h: 20 });
        }
        this.platforms = this.physics.add.staticGroup();
        this.platforms.add(floor);
        ledges.forEach(r => {
            const pl = this.add.rectangle(r.x, r.y, r.w, r.h, 0x000000, 0.001);
            this.physics.add.existing(pl, true);
            this.platforms.add(pl);
        });
    }

    _createPlayer() {
        this.player = this.physics.add.sprite(0, 0, assetKey('assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B01.png'));
        this.player.setScale(0.78);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setDragX(1000);
        this.player.setMaxVelocity(280, 800);
        this.player.body.setSize(92, 146, true);
        this.player.body.setOffset(82, 72);
        this.physics.add.collider(this.player, this.platforms);
    }

    _bindKeyboard() {
        this.keys = this.input.keyboard.addKeys('A,D,W,S,E,SPACE,SHIFT,J,K,L,X,Z,ESC,P');
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    _createHUD() {
        const bg = this.add.rectangle(0, 0, CANVAS_W, 94, 0x0e0a14, 0.75).setOrigin(0, 0).setScrollFactor(0);
        this.dayText = makeText(this, 20, 14, '', { fontSize: '18px', fontStyle: 'bold' }).setScrollFactor(0);
        this.promptText = makeText(this, 20, 46, '', { fontSize: '14px', color: '#d9c0ff' }).setScrollFactor(0);
        this.statusText = makeText(this, 20, 68, '', { fontSize: '13px', color: '#fff' }).setScrollFactor(0);

        this.hpBar = createHudBar(this, 960, 18, 280, 12, 'HP', 0xe35b83);
        this.staBar = createHudBar(this, 960, 40, 280, 12, 'STA', 0x69d2ff);
        this.wilBar = createHudBar(this, 960, 62, 280, 12, 'WIL', 0xb05dff);
        this.pressureBar = createHudBar(this, 960, 84, 280, 10, 'PRESSURE', 0xffc56b);

        this.hudObjects = [bg, this.dayText, this.promptText, this.statusText,
            this.hpBar.title, this.hpBar.bg, this.hpBar.fg,
            this.staBar.title, this.staBar.bg, this.staBar.fg,
            this.wilBar.title, this.wilBar.bg, this.wilBar.fg,
            this.pressureBar.title, this.pressureBar.bg, this.pressureBar.fg
        ];
    }

    _createTouchControls() {
        const touch = {};
        const baseX = 80;
        const baseY = CANVAS_H - 120;
        const b = (x, y, label, cb, fill) => buildButton(this, x, y, 72, 52, label, cb, fill);

        touch.left = b(baseX, baseY, '◀', () => this.controls.left = true, 0x31203f);
        touch.right = b(baseX + 86, baseY, '▶', () => this.controls.right = true, 0x31203f);
        touch.up = b(baseX + 43, baseY - 58, '▲', () => this.controls.up = true, 0x31203f);
        touch.down = b(baseX + 43, baseY + 58, '▼', () => this.controls.down = true, 0x31203f);
        touch.attack = b(CANVAS_W - 108, baseY - 34, 'ATK', () => this.controls.attack = true, 0x8f3757);
        touch.guard = b(CANVAS_W - 108, baseY + 34, 'GRD', () => this.controls.guard = true, 0x37578f);
        touch.interact = b(CANVAS_W - 200, baseY, 'E', () => this.controls.interact = true, 0x4d8657);
        touch.dash = b(CANVAS_W - 292, baseY, 'DASH', () => this.controls.dash = true, 0x6a518f);

        const release = (k) => () => this.controls[k] = false;
        ['left','right','up','down','attack','guard','interact','dash'].forEach(k => {
            [touch[k].rect, touch[k].txt].forEach(go => {
                go.on('pointerup', release(k));
                go.on('pointerout', release(k));
                go.on('pointerupoutside', release(k));
            });
        });

        this.touch = touch;
        this.touchObjects = Object.values(touch).flatMap(x => [x.rect, x.txt]);
        const visible = !!STATE.touchControls;
        this.touchObjects.forEach(go => { if (go.setVisible) go.setVisible(visible); });
    }

    makeInteractable(x, y, w, h, label, onUse, color = 0x2f7a4a) {
        const zone = this.add.rectangle(x, y, w, h, color, 0.18).setStrokeStyle(2, color, 0.65);
        zone.setOrigin(0.5, 1);
        zone.setInteractive({ useHandCursor: true });
        const txt = makeText(this, x, y - h - 8, label, { fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5);
        this.interactables.push({ zone, label, onUse, x, y, w, h, txt });
        zone.on('pointerdown', () => onUse && onUse());
        txt.setInteractive({ useHandCursor: true });
        txt.on('pointerdown', () => onUse && onUse());
        return zone;
    }

    playerInput() {
        return {
            left: this.controls.left || this.cursors.left.isDown || this.keys.A.isDown,
            right: this.controls.right || this.cursors.right.isDown || this.keys.D.isDown,
            up: this.controls.up || this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown,
            down: this.controls.down || this.cursors.down.isDown || this.keys.S.isDown,
            attack: this.controls.attack || Phaser.Input.Keyboard.JustDown(this.keys.J) || Phaser.Input.Keyboard.JustDown(this.keys.X),
            guard: this.controls.guard || this.keys.K.isDown || this.keys.SHIFT.isDown,
            dash: this.controls.dash || Phaser.Input.Keyboard.JustDown(this.keys.L),
            interact: this.controls.interact || Phaser.Input.Keyboard.JustDown(this.keys.E),
            menu: Phaser.Input.Keyboard.JustDown(this.keys.ESC) || Phaser.Input.Keyboard.JustDown(this.keys.P),
        };
    }

    updatePlayerMovement(inp) {
        const speed = inp.dash ? 310 : 220;
        let vx = 0;
        if (inp.left) vx -= speed;
        if (inp.right) vx += speed;
        this.player.setVelocityX(vx);

        const onGround = this.player.body.blocked.down || this.player.body.touching.down;
        if (inp.up && onGround) this.player.setVelocityY(-540);
        if (vx < 0) this.player.setFlipX(true);
        if (vx > 0) this.player.setFlipX(false);
        this.player.anims.play(vx ? (inp.dash ? 'shaia-run' : 'shaia-walk') : 'shaia-idle', true);

        if (!onGround) {
            this.player.anims.play('shaia-jump', true);
        }
    }

    refreshHUD() {
        this.dayText.setText(`Day ${STATE.day}  •  HP ${Math.ceil(STATE.hp)}/${Math.ceil(STATE.capHp)}  •  STA ${Math.ceil(STATE.sta)}/${Math.ceil(STATE.capSta)}  •  WIL ${Math.ceil(STATE.wil)}/${Math.ceil(STATE.capWil)}  •  EXP ${STATE.exp}  •  GOLD ${STATE.gold}`);
        this.statusText.setText(`Pressure ${Math.ceil(STATE.pressure)}  •  Fatigue ${Math.ceil(STATE.fatigue)}  •  Wins ${STATE.battleWins}  •  Losses ${STATE.battleLosses}`);
        updateHudBar(this.hpBar, STATE.hp / STATE.capHp);
        updateHudBar(this.staBar, STATE.sta / STATE.capSta);
        updateHudBar(this.wilBar, STATE.wil / STATE.capWil);
        updateHudBar(this.pressureBar, STATE.pressure / 100);
    }

    clearTouchFlags() {
        this.controls.left = this.controls.right = this.controls.up = this.controls.down = false;
        this.controls.attack = this.controls.guard = this.controls.interact = this.controls.dash = false;
    }
}

class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#090713');
        const bg = this.add.tileSprite(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W, CANVAS_H, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png')).setAlpha(0.45);
        bg.setScale(2.2);
        this.add.rectangle(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W, CANVAS_H, 0x090713, 0.55);
        makeText(this, 640, 130, 'SHAIA ROUTE', { fontSize: '48px', fontStyle: 'bold', strokeThickness: 6 }).setOrigin(0.5);
        makeText(this, 640, 188, 'Bedroom-first side-scroller with a real combat screen', { fontSize: '18px', color: '#e6d5ff' }).setOrigin(0.5);
        makeText(this, 640, 230, 'Shaia asset pack: picopico256 / Ruin Runners', { fontSize: '14px', color: '#bba7d6' }).setOrigin(0.5);

        const continueExists = !!localStorage.getItem(STORAGE_KEY);
        buildButton(this, 640, 330, 260, 54, 'NEW GAME', () => {
            STATE = createDefaultState();
            saveState();
            this.scene.start('BedroomScene');
        }, 0x7a4b95);
        buildButton(this, 640, 402, 260, 54, continueExists ? 'CONTINUE' : 'NO SAVE', () => {
            if (!continueExists) return;
            STATE = loadState();
            saveState();
            this.scene.start(STATE.room || 'BedroomScene');
        }, continueExists ? 0x4a8f74 : 0x444);
        buildButton(this, 640, 474, 260, 54, 'SETTINGS', () => this.scene.start('SettingsScene'), 0x4a5f8f);
        buildButton(this, 640, 546, 260, 54, 'CONTROLS', () => this.scene.start('StatusScene', { fromTitle: true, helpOnly: true }), 0x82596d);
        makeText(this, 640, 638, 'Arrows/WASD move • Space jump • J attack • K guard • L dash • E interact', { fontSize: '15px', color: '#e7dafc' }).setOrigin(0.5);
    }
}

class BedroomScene extends BaseRoomScene {
    constructor() { super('BedroomScene', 'BedroomScene', 'bedroom'); }
    create() {
        this.createRoom(2200, 720);
        this.add.image(640, 360, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png')).setScale(2).setAlpha(0.35);
        this.add.image(1100, 360, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png')).setScale(2).setAlpha(0.18);
        this.add.image(1760, 360, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png')).setScale(2).setAlpha(0.15);

        this.add.image(230, 518, assetKey('assets/ruin_runners_shaia/sprites/prop/chest_open01.png')).setScale(0.9);
        this.add.image(500, 532, assetKey('assets/ruin_runners_shaia/sprites/prop/barrel_001.png')).setScale(0.9);
        this.add.image(1520, 532, assetKey('assets/ruin_runners_shaia/sprites/prop/barrel_002.png')).setScale(0.9);

        this.makeInteractable(395, 632, 120, 150, 'REST BED', () => this.restOnBed(), 0x7a4b95);
        this.makeInteractable(1130, 632, 120, 150, 'TO CORRIDOR', () => saveAndStart(this, 'CorridorScene'), 0x4a8f74);
        this.makeInteractable(1780, 632, 120, 150, 'STATUS', () => saveAndStart(this, 'StatusScene', { fromRoom: 'BedroomScene' }), 0x4a5f8f);

        this.player.anims.play('shaia-idle');
        this.refreshHUD();
        this.showPrompt('Wake up, move to the door, or rest at the bed.');
        this.events.on('update', this.updateScene, this);
    }

    showPrompt(text) {
        this.promptText.setText(text);
    }

    restOnBed() {
        if (Math.abs(this.player.x - 395) > 120) return;
        deriveCaps();
        STATE.pressure = Math.max(0, STATE.pressure - 18);
        STATE.fatigue = Math.max(0, STATE.fatigue - 12);
        STATE.hp = STATE.capHp;
        STATE.sta = STATE.capSta;
        STATE.wil = STATE.capWil;
        STATE.day += 1;
        STATE.roomsCleared += 1;
        saveState();
        this.cameras.main.flash(180, 255, 255, 255);
        this.time.delayedCall(220, () => this.scene.restart());
    }

    updateScene() {
        const inp = this.playerInput();
        if (inp.menu) return this.scene.start('SettingsScene', { returnRoom: 'BedroomScene' });
        if (inp.interact) {
            const near = this.interactables.find(i => Math.abs(this.player.x - i.x) < 120);
            if (near && near.onUse) near.onUse();
        }
        this.updatePlayerMovement(inp);
        this.refreshHUD();
        this.clearTouchFlags();
        if (this.player.x > this.worldWidth - 100) this.player.setVelocityX(-180);
    }
}

class CorridorScene extends BaseRoomScene {
    constructor() { super('CorridorScene', 'CorridorScene', 'corridor'); }
    create() {
        this.createRoom(3200, 720);
        this.add.image(620, 356, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/11_dungeon_left_over01.png')).setScale(2).setAlpha(0.55);
        this.add.image(1380, 356, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png')).setScale(2).setAlpha(0.22);
        this.add.image(2320, 356, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/13_dungeon_right_over01.png')).setScale(2).setAlpha(0.40);

        this.add.image(620, 530, assetKey('assets/ruin_runners_shaia/sprites/prop/baricade_export.png')).setScale(0.9);
        this.add.image(1180, 542, assetKey('assets/ruin_runners_shaia/sprites/prop/barrel_fall01.png')).setScale(0.85);
        this.add.image(1880, 532, assetKey('assets/ruin_runners_shaia/sprites/prop/barrel_rolling01.png')).setScale(0.85);

        this.makeInteractable(350, 632, 120, 150, 'BACK BEDROOM', () => saveAndStart(this, 'BedroomScene'), 0x7a4b95);
        this.makeInteractable(1450, 632, 120, 150, 'BATTLE GATE', () => saveAndStart(this, 'BattleScene'), 0x8f3757);
        this.makeInteractable(2640, 632, 120, 150, 'STATUS', () => saveAndStart(this, 'StatusScene', { fromRoom: 'CorridorScene' }), 0x4a5f8f);

        this.player.anims.play('shaia-idle');
        this.showPrompt('The corridor is open. Head for the battle gate or return to the bedroom.');
        this.refreshHUD();
        this.events.on('update', this.updateScene, this);
    }

    showPrompt(text) { this.promptText.setText(text); }

    updateScene() {
        const inp = this.playerInput();
        if (inp.menu) return this.scene.start('SettingsScene', { returnRoom: 'CorridorScene' });
        if (inp.interact) {
            const near = this.interactables.find(i => Math.abs(this.player.x - i.x) < 120);
            if (near && near.onUse) near.onUse();
        }
        this.updatePlayerMovement(inp);
        this.refreshHUD();
        this.clearTouchFlags();
    }
}

class BattleScene extends Phaser.Scene {
    constructor() { super('BattleScene'); this.controls = {}; }
    create() {
        const width = 1600, height = 720;
        this.worldWidth = width; this.worldHeight = height;
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.setBackgroundColor('#12060d');

        const backdrop = this.add.tileSprite(width / 2, height / 2, width, height, assetKey('assets/ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png')).setAlpha(0.36);
        backdrop.setScale(2.1);
        this.add.rectangle(width / 2, height / 2, width, height, 0x2d0813, 0.25);
        this.add.rectangle(width / 2, 92, width, 184, 0x000000, 0.15);

        this.floor = this.add.rectangle(width / 2, 650, width, 140, 0x000000, 0.001);
        this.physics.add.existing(this.floor, true);

        const ledges = [
            { x: 540, y: 580, w: 240 },
            { x: 1020, y: 528, w: 220 },
            { x: 1320, y: 580, w: 240 }
        ];
        this.platforms = this.physics.add.staticGroup();
        this.platforms.add(this.floor);
        ledges.forEach(r => {
            const pl = this.add.rectangle(r.x, r.y, r.w, 20, 0x000000, 0.001);
            this.physics.add.existing(pl, true);
            this.platforms.add(pl);
        });

        this.player = this.physics.add.sprite(180, 500, assetKey('assets/ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B01.png'));
        this.player.setScale(0.82);
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(1100);
        this.player.setMaxVelocity(300, 820);
        this.player.body.setSize(92, 146, true);
        this.player.body.setOffset(82, 72);
        this.physics.add.collider(this.player, this.platforms);

        this.enemy = this.physics.add.sprite(1240, 500, assetKey('assets/ruin_runners_shaia/sprites/skeleton/common_01_idle01.png'));
        this.enemy.setScale(0.82);
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setDragX(500);
        this.enemy.setMaxVelocity(220, 820);
        this.enemy.body.setSize(92, 146, true);
        this.enemy.body.setOffset(82, 72);
        this.physics.add.collider(this.enemy, this.platforms);

        this.enemyMaxHp = 60 + (STATE.day - 1) * 10;
        this.enemyHp = this.enemyMaxHp;
        this.enemyState = { cooldown: 0, windup: 0, facing: -1, dead: false };

        this.keys = this.input.keyboard.addKeys('A,D,W,S,E,SPACE,SHIFT,J,K,L,X,Z,ESC');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.controls = { left: false, right: false, up: false, attack: false, guard: false, dash: false, interact: false };
        this._createBattleHUD();
        this._createBattleTouchControls();
        this._createBattleLog();
        this._bindBattleEvents();

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.player.anims.play('shaia-idle');
        this.enemy.anims.play('skeleton-idle');

        this.attackTimer = 0;
        this.playerFacing = 1;
        this.playerAttackActive = false;
        this.playerAttackWindow = 0;
        this.playerAttackDamage = 10;
        this.playerAttackType = 'light';
        this.playerInvulnerable = 0;
        this.guardHeld = false;
        this.sceneActive = true;
        this.showLog('Battle engaged.');
        this.refreshBattleHUD();
        this.events.on('update', this.updateBattle, this);
    }

    _createBattleHUD() {
        this.add.rectangle(0, 0, CANVAS_W, 100, 0x10040c, 0.72).setOrigin(0, 0).setScrollFactor(0);
        this.dayText = makeText(this, 20, 14, `Battle Day ${STATE.day}`, { fontSize: '20px', fontStyle: 'bold' }).setScrollFactor(0);
        this.logText = makeText(this, 20, 44, '', { fontSize: '14px', color: '#ffe3f0' }).setScrollFactor(0);
        this.hpBar = createHudBar(this, 900, 16, 320, 12, 'HP', 0xe35b83);
        this.staBar = createHudBar(this, 900, 38, 320, 12, 'STA', 0x69d2ff);
        this.wilBar = createHudBar(this, 900, 60, 320, 12, 'WIL', 0xb05dff);
        this.enemyBar = createHudBar(this, 900, 82, 320, 10, 'ENEMY', 0xffbf5b);
    }

    _createBattleLog() {
        this.bigText = makeText(this, CANVAS_W / 2, 150, 'BATTLE', { fontSize: '54px', fontStyle: 'bold', color: '#ffd7f0', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0);
        this.bigText.setAlpha(0.75);
    }

    _createBattleTouchControls() {
        const baseX = 80;
        const baseY = CANVAS_H - 120;
        const btn = (x, y, label, fn, fill) => buildButton(this, x, y, 72, 52, label, fn, fill);
        const touch = {};
        touch.left = btn(baseX, baseY, '◀', () => this.controls.left = true, 0x31203f);
        touch.right = btn(baseX + 86, baseY, '▶', () => this.controls.right = true, 0x31203f);
        touch.up = btn(baseX + 43, baseY - 58, '▲', () => this.controls.up = true, 0x31203f);
        touch.down = btn(baseX + 43, baseY + 58, '▼', () => this.controls.guard = true, 0x37578f);
        touch.attack = btn(CANVAS_W - 108, baseY - 34, 'ATK', () => this.controls.attack = true, 0x8f3757);
        touch.guard = btn(CANVAS_W - 108, baseY + 34, 'GRD', () => this.controls.guard = true, 0x37578f);
        touch.dash = btn(CANVAS_W - 200, baseY, 'DASH', () => this.controls.dash = true, 0x6a518f);

        const release = key => () => this.controls[key] = false;
        ['left','right','up','down','attack','guard','dash'].forEach(k => {
            [touch[k].rect, touch[k].txt].forEach(go => {
                go.on('pointerup', release(k));
                go.on('pointerout', release(k));
                go.on('pointerupoutside', release(k));
            });
        });
        this.touchObjects = Object.values(touch).flatMap(v => [v.rect, v.txt]);
        const visible = !!STATE.touchControls;
        this.touchObjects.forEach(go => go.setVisible(visible));
        this.touch = touch;
    }

    _bindBattleEvents() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('CorridorScene');
        });
    }

    showLog(text) { this.logText.setText(text); }

    refreshBattleHUD() {
        this.dayText.setText(`Battle Day ${STATE.day}  •  Enemy ${Math.max(0, Math.ceil(this.enemyHp))}/${this.enemyMaxHp}  •  WINS ${STATE.battleWins}  •  GOLD ${STATE.gold}`);
        this.logText.setText(this.lastLog || '');
        updateHudBar(this.hpBar, STATE.hp / STATE.capHp);
        updateHudBar(this.staBar, STATE.sta / STATE.capSta);
        updateHudBar(this.wilBar, STATE.wil / STATE.capWil);
        updateHudBar(this.enemyBar, this.enemyHp / this.enemyMaxHp);
    }

    inputState() {
        return {
            left: this.controls.left || this.cursors.left.isDown || this.keys.A.isDown,
            right: this.controls.right || this.cursors.right.isDown || this.keys.D.isDown,
            up: this.controls.up || this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown,
            attack: this.controls.attack || Phaser.Input.Keyboard.JustDown(this.keys.J) || Phaser.Input.Keyboard.JustDown(this.keys.X),
            guard: this.controls.guard || this.keys.K.isDown || this.keys.SHIFT.isDown,
            dash: this.controls.dash || Phaser.Input.Keyboard.JustDown(this.keys.L),
        };
    }

    updateBattle(_t, dt) {
        if (!this.sceneActive) return;
        const inp = this.inputState();
        this.guardHeld = !!inp.guard;

        this.updatePlayer(inp, dt);
        this.updateEnemy(inp, dt);

        if (inp.attack) this.tryPlayerAttack();
        if (inp.dash) this.tryDash();

        this.refreshBattleHUD();
        if (this.keys.ESC.isDown) {
            STATE.pressure = clamp(STATE.pressure + 2, 0, 999);
        }
        this.controls.left = this.controls.right = this.controls.up = this.controls.attack = this.controls.guard = this.controls.dash = false;
    }

    updatePlayer(inp, dt) {
        const speed = inp.dash ? 300 : 220;
        let vx = 0;
        if (inp.left) { vx -= speed; this.playerFacing = -1; }
        if (inp.right) { vx += speed; this.playerFacing = 1; }
        this.player.setVelocityX(vx);
        const onGround = this.player.body.blocked.down || this.player.body.touching.down;
        if (inp.up && onGround) this.player.setVelocityY(-540);

        if (!onGround) {
            this.player.anims.play('shaia-jump', true);
        } else if (Math.abs(vx) > 5) {
            this.player.anims.play(inp.dash ? 'shaia-run' : 'shaia-walk', true);
        } else if (this.guardHeld) {
            this.player.anims.play('shaia-guard', true);
        } else {
            this.player.anims.play('shaia-idle', true);
        }

        if (this.playerInvulnerable > 0) this.playerInvulnerable -= dt;
        if (this.attackTimer > 0) this.attackTimer -= dt;
        if (this.playerAttackWindow > 0) this.playerAttackWindow -= dt;

        this.player.setFlipX(this.playerFacing < 0);
    }

    updateEnemy(inp, dt) {
        if (this.enemyState.dead) return;
        this.enemyState.cooldown = Math.max(0, this.enemyState.cooldown - dt);
        this.enemyState.windup = Math.max(0, this.enemyState.windup - dt);

        const dist = this.player.x - this.enemy.x;
        const ad = Math.abs(dist);
        this.enemy.setFlipX(dist > 0);

        if (ad > 170) {
            const move = dist > 0 ? 120 : -120;
            this.enemy.setVelocityX(move);
            this.enemy.anims.play('skeleton-walk', true);
        } else {
            this.enemy.setVelocityX(0);
            if (this.enemyState.cooldown <= 0 && this.enemyState.windup <= 0) {
                this.enemyState.windup = 280;
                this.enemy.anims.play('skeleton-attack', true);
                this.time.delayedCall(230, () => this.resolveEnemyStrike());
                this.enemyState.cooldown = 950;
            } else {
                this.enemy.anims.play('skeleton-idle', true);
            }
        }
    }

    tryPlayerAttack() {
        if (this.attackTimer > 0) return;
        if (STATE.sta < 6) {
            this.showLog('Too exhausted to attack.');
            return;
        }
        this.attackTimer = 420;
        STATE.sta = clamp(STATE.sta - 6, 0, STATE.capSta);
        this.playerAttackWindow = 180;
        const anim = this.guardHeld ? 'shaia-attack-kick' : 'shaia-attack-light';
        this.player.anims.play(anim, true);
        this.player.setFlipX(this.playerFacing < 0);
        this.showLog('Attack!');
        this.time.delayedCall(120, () => this.applyPlayerHit());
    }

    tryDash() {
        if (STATE.sta < 12) return;
        STATE.sta = clamp(STATE.sta - 12, 0, STATE.capSta);
        this.player.setVelocityX(this.playerFacing < 0 ? -420 : 420);
        this.player.anims.play('shaia-guard-dash', true);
        this.showLog('Dash!');
    }

    applyPlayerHit() {
        if (this.enemyState.dead) return;
        const inRange = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y) < 110;
        if (!inRange) return;
        const dmg = this.guardHeld ? 14 : 18;
        this.enemyHp = Math.max(0, this.enemyHp - dmg);
        if (STATE.cameraShake) this.cameras.main.shake(60, 0.005);
        const spark = this.add.sprite(this.enemy.x, this.enemy.y - 24, assetKey('assets/ruin_runners_shaia/sprites/vfx/vfx_hit/vfx_hit01.png'));
        spark.setScale(1.1);
        spark.play('vfx-hit');
        spark.on('animationcomplete', () => spark.destroy());
        this.enemy.anims.play('skeleton-hurt', true);
        STATE.pressure = clamp(STATE.pressure + 1, 0, 999);
        STATE.exp += 3;
        if (this.enemyHp <= 0) {
            this.enemyState.dead = true;
            this.enemy.setVelocity(0, 0);
            this.enemy.anims.play('skeleton-hurt', true);
            this.time.delayedCall(250, () => {
                applyBattleAftermath('victory');
                this.lastLog = 'Victory. The corridor opens.';
                saveState();
                this.finishBattle('victory');
            });
        } else {
            this.lastLog = `Hit for ${dmg}.`;
        }
    }

    resolveEnemyStrike() {
        if (this.enemyState.dead) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (dist > 120) return;
        let dmg = 12;
        if (this.guardHeld) dmg = Math.max(3, Math.floor(dmg * 0.35));
        if (this.playerInvulnerable > 0) return;
        this.playerInvulnerable = 400;
        STATE.hp = clamp(STATE.hp - dmg, 0, STATE.capHp);
        STATE.pressure = clamp(STATE.pressure + 3, 0, 999);
        STATE.fatigue = clamp(STATE.fatigue + 2, 0, 999);
        this.player.anims.play('shaia-hurt', true);
        if (STATE.cameraShake) this.cameras.main.shake(75, 0.007);
        this.lastLog = `Shaia took ${dmg}.`;
        if (STATE.hp <= 0) {
            applyBattleAftermath('defeat');
            this.finishBattle('defeat');
        }
    }

    finishBattle(result) {
        this.sceneActive = false;
        saveState();
        const overlay = this.add.rectangle(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W, CANVAS_H, 0x000000, 0.62).setScrollFactor(0);
        const txt = makeText(this, CANVAS_W / 2, CANVAS_H / 2 - 20, result === 'victory' ? 'VICTORY' : 'DEFEAT', {
            fontSize: '58px',
            fontStyle: 'bold',
            color: result === 'victory' ? '#ffd7f0' : '#ff8080'
        }).setOrigin(0.5).setScrollFactor(0);
        const sub = makeText(this, CANVAS_W / 2, CANVAS_H / 2 + 40,
            result === 'victory' ? 'The route is clear.' : 'Retreating to the bedroom.',
            { fontSize: '18px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(1100, () => {
            this.scene.start(result === 'victory' ? 'CorridorScene' : 'BedroomScene');
        });
    }
}

class StatusScene extends Phaser.Scene {
    constructor() { super('StatusScene'); }
    create(data = {}) {
        this.cameras.main.setBackgroundColor('#0d0814');
        buildGradientOverlay(this, 0x0a0810, 0.74);
        const panel = this.add.rectangle(CANVAS_W / 2, CANVAS_H / 2, 820, 540, 0x1b1028, 0.94).setStrokeStyle(2, 0xffd7ff, 0.25);
        const title = makeText(this, CANVAS_W / 2, 98, 'STATUS / SAVE', { fontSize: '34px', fontStyle: 'bold' }).setOrigin(0.5);

        const rows = [
            ['Day', STATE.day],
            ['HP', `${Math.ceil(STATE.hp)} / ${Math.ceil(STATE.capHp)}`],
            ['STA', `${Math.ceil(STATE.sta)} / ${Math.ceil(STATE.capSta)}`],
            ['WIL', `${Math.ceil(STATE.wil)} / ${Math.ceil(STATE.capWil)}`],
            ['Pressure', Math.ceil(STATE.pressure)],
            ['Fatigue', Math.ceil(STATE.fatigue)],
            ['EXP', STATE.exp],
            ['Gold', STATE.gold],
            ['Battle Wins', STATE.battleWins],
            ['Battle Losses', STATE.battleLosses],
        ];
        rows.forEach((r, i) => {
            makeText(this, 430, 180 + i * 30, `${r[0]}:`, { fontSize: '18px', fontStyle: 'bold', color: '#d7c1ff' });
            makeText(this, 640, 180 + i * 30, String(r[1]), { fontSize: '18px', color: '#fff' });
        });

        buildButton(this, 430, 568, 180, 52, 'SAVE', () => { saveState(); this.scene.start(data.fromRoom || STATE.room || 'BedroomScene'); }, 0x4a8f74);
        buildButton(this, 640, 568, 180, 52, 'BACK', () => this.scene.start(data.fromRoom || STATE.room || 'BedroomScene'), 0x4a5f8f);
        buildButton(this, 850, 568, 180, 52, 'SETTINGS', () => this.scene.start('SettingsScene', { returnRoom: data.fromRoom || STATE.room || 'BedroomScene' }), 0x7a4b95);
        if (data.helpOnly) {
            makeText(this, CANVAS_W / 2, 528, 'Move with arrows/WASD, jump with Space, attack with J, guard with K, dash with L, interact with E.', { fontSize: '15px', color: '#e6d5ff' }).setOrigin(0.5);
        }
        this.input.keyboard.on('keydown-ESC', () => this.scene.start(data.fromRoom || STATE.room || 'BedroomScene'));
    }
}

class SettingsScene extends Phaser.Scene {
    constructor() { super('SettingsScene'); }
    create(data = {}) {
        this.cameras.main.setBackgroundColor('#0d0814');
        buildGradientOverlay(this, 0x0a0810, 0.74);
        const panel = this.add.rectangle(CANVAS_W / 2, CANVAS_H / 2, 800, 520, 0x1b1028, 0.94).setStrokeStyle(2, 0xffd7ff, 0.25);
        makeText(this, CANVAS_W / 2, 98, 'SETTINGS', { fontSize: '34px', fontStyle: 'bold' }).setOrigin(0.5);

        const opts = [
            ['Touch Controls', () => STATE.touchControls, v => STATE.touchControls = v],
            ['Camera Shake', () => STATE.cameraShake, v => STATE.cameraShake = v],
            ['Sound', () => STATE.sound, v => STATE.sound = v],
        ];

        opts.forEach((o, i) => {
            const y = 190 + i * 96;
            makeText(this, 360, y, o[0], { fontSize: '20px', fontStyle: 'bold', color: '#d7c1ff' });
            const stateText = makeText(this, 630, y, o[1]() ? 'ON' : 'OFF', { fontSize: '20px', color: o[1]() ? '#8affb6' : '#ff8a8a' }).setOrigin(0.5);
            buildButton(this, 820, y, 130, 46, 'TOGGLE', () => {
                o[2](!o[1]());
                stateText.setText(o[1]() ? 'ON' : 'OFF');
                stateText.setColor(o[1]() ? '#8affb6' : '#ff8a8a');
                saveState();
            }, 0x4a5f8f);
        });
        buildButton(this, 640, 558, 180, 52, 'BACK', () => this.scene.start(data.returnRoom || STATE.room || 'BedroomScene'), 0x4a8f74);
        this.input.keyboard.on('keydown-ESC', () => this.scene.start(data.returnRoom || STATE.room || 'BedroomScene'));
    }
}

window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        parent: 'game',
        backgroundColor: '#090713',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 1200 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: CANVAS_W,
            height: CANVAS_H
        },
        scene: [AssetBootScene, TitleScene, BedroomScene, CorridorScene, BattleScene, StatusScene, SettingsScene]
    };
    new Phaser.Game(config);
});
