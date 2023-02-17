function APPSTRINGS(){
	
}


APPSTRINGS.testAllSections = function(){
	Object.keys(APPSTRINGS).forEach(function(section){
		if(typeof APPSTRINGS[section] == "object"){
			APPSTRINGS.testSection(section);
		}
	});
}

APPSTRINGS.testSection = function(section){
	if(APPSTRINGS[section]){
		var ctr = 0;
		Object.keys(APPSTRINGS[section]).forEach(function(key){
			APPSTRINGS[section][key] = ctr++;
		});
	}
}

APPSTRINGS.GENERAL = {
	label_kills: "Score",
	label_stats: "Stats",
	label_abilities: "Abilities",
	label_spirits: "Spirits",
	label_ace_bonus: "Ace Bonus", 
	label_abilities: "Abilities",
	label_parts: "Parts",
	label_victory_condition: "Victory Condition",
	label_defeat_condition: "Defeat  Condition",
	label_mastery_condition: "Mastery Condition",
	label_mastery_locked: "Unobtainable after Game Over on this stage.",
	label_mastery_completed: "Completed!",
	label_mastery_completed_message: "Mastery Condition completed!",
	label_enemy_phase: "Enemy Phase",
	label_ally_phase: "Ally Phase",
	label_yes: "YES",
	label_no: "NO",
	label_ask_end_turn_single: "unit can still take an action, end your turn?",
	label_ask_end_turn_multi: "units can still take an action, end your turn?",
	label_hit: "Hit",
	label_default_victory_condition: "Destroy all enemy units.",
	label_default_defeat_condition: "All ally units are defeated.",
	label_default_mastery_condition: "???",
	label_dash_pref: "Default Fast Cursor",
	label_combined_terrain: "Total Terrain",
	label_status: "Status",
	label_AIR: "AIR",
	label_LND: "LND",
	label_SEA: "SEA",
	label_SPC: "SPC",
}

APPSTRINGS.MAINMENU = {
	label_new_game: "New Game",
	label_load_game: "Load Game",
	label_continue: "Continue",
	label_exit: "Exit"
}

APPSTRINGS.SAVEMENU = {
	label_funds: "Funds",
	label_turn_count: "Turns",
	label_SR_count: "SR Points"
}

APPSTRINGS.MAPMENU = {
	cmd_wait: "Wait",
	cmd_move: "Move", 
	cmd_item: "Item",
	cmd_ability: "Ability",
	cmd_spirit: "Spirit",
	cmd_repair: "Repair",
	cmd_resupply: "Resupply", 
	cmd_land: "Land",
	cmd_fly: "Fly",
	cmd_persuade: "Persuade",
	cmd_combine: "Combine",
	cmd_split: "Separate",
	cmd_transform: "Transform",
	cmd_swap_pilot: "Pilot",
	cmd_attack: "Attack",
	cmd_end_turn: "End Turn",
	cmd_search: "Search",
	cmd_list: "Unit List",
	cmd_conditions: "Conditions",
	cmd_options: "Options",
	cmd_log: "Log",
	cmd_save: "Quick Save",
	cmd_game_end: "Exit",
	cmd_swap: "Swap",
	cmd_separate: "Disband",
	cmd_join: "Twin",
	cmd_transform_all: "Transform All",
	label_funds: "Funds",
	label_turn: "Turn",
	label_enemy: "Enemy",
	label_ally: "Ally",
	deploy: "Deploy",
	board: "Board",
	cmd_status: "Status"
}

APPSTRINGS.MECHSTATS = {
	move: "Move",
	armor: "Armor",
	mobility: "Mobility",
	accuracy: "Accuracy",
	repair: "Repair",
	resupply: "Resupply",
	shield: "Shield",
	barrier: "Barrier",
	weapon: "Weapon",
	size: "Size",
}	

APPSTRINGS.PILOTSTATS = {
	melee: "Melee",
	ranged: "Ranged",
	skill: "Skill", 
	defense: "Defense",
	evade: "Evade",
	hit: "Hit"
}

APPSTRINGS.INTERMISSION = {	
	title: "INTERMISSION",
	sr_points: "SR Points",
	funds: "Funds",
	top_ace: "Top Ace",
	mech_label: "Mech",
	list_label: "List",
	upgrade_label: "Upgrade",
	equip_parts: "Equip Parts",
	sell_parts: "Sell Parts",
	pilot_label: "Pilot",
	next_map: "Next Map",
	tool_tips: {
		"mech": "Manage Mechs",
		"mech_list": "Display detailed Mech information",
		"mech_upgrade": "Upgrade Mech performance and Weapons",
		"mech_parts": "Manage equipped Parts",
		"sell_parts": "Sell Parts from inventory",
		"mech_search": "Find Mechs with specific properties",
		"pilot": "Manage Pilots",
		"pilot_list": "Display detailed Pilot information",
		"upgrade_pilot": "Upgrade Pilot stats and learn skills",
		"pilot_search": "Find Pilots with specific properties",
		"next_map": "Continue to the next Map",
		"data": "Manage Save Data",
		"data_save": "Save your current progress",
		"data_load": "Load previous save data",
		"options": "Manage Game Settings",
		"deployment": "Manage Unit Deployment for the next stage",
		"reassign": "Manage Pilot assignments to Mechs"
	},
	data_label: "Data",
	data_save_label: "Save",
	data_load_label: "Load",
	stage_label: "Stage",
	next_map_units: "Units for next map",
	cleared_label: "Cleared",
	turns_label: "Turns",
	options: "Options",
	deployment: "Deployment",
	reassign: "Swap Pilots",
};

APPSTRINGS.MECHLIST = {	
	title: "Mech List",
	tab_pilot_level: "Pilot Level",
	tab_mech_stats: "Mech Stats",
	tab_mech_ability: "Mech Ability",
	tab_upgrade_level: "Upgrade Level",
	tab_mech: "Mech",
	tab_ability: "Ability",
	tab_special_skills: "Special Skill",
	
	column_mech: "Mech",
	column_team: "Team",
	column_pilot: "Pilot",
	column_upgrade_percent: "Upgrade Percent",
	column_weapon_level: "Weapon Level",
	column_kills: "Score",
	column_support_attack: "Support ATK",
	column_support_defend: "Support DEF",
	column_slots: "Slots"
}

APPSTRINGS.PILOTLIST = {
	title: "Pilot List",
	
}	



APPSTRINGS.DETAILPAGES = {
	label_pilot_ability: "Pilot Ability",
	label_mech_ability: "Mech Ability",
	label_weapon_info: "Weapon Info",
	label_FUB: "Full Upgrade Bonus",
	label_FUB_hint: "Upgrade all of this mech's stats to at least Level {LEVEL_NEEDED} to unlock this ability.",
	label_ace_hint: "Get at least {KILLS_NEEDED} kills with this unit to unlock this bonus.",
	label_pilot_spirits: "Pilot Spirits",
	label_pilot_stats: "Pilot Stats",
	label_ability: "Ability",
	label_cost: "Ability",
	label_attribute_1: "Attribute 1",
	label_attribute_2: "Attribute 2",
}	

APPSTRINGS.MECHUPGRADES = {
	title: "Mod Level",
	select_title: "Select Unit",
	label_weapons: "Weapons",
	label_current_funds: "Current Funds",
	label_cost: "Cost",
	label_remaining_funds: "Remaining Funds",
	label_generic_fub: "Full Upgrade Bonus",
	label_generic_fub_HP: "HP +10%",
	label_generic_fub_EN: "EN +10%",
	label_generic_fub_armor: "Armor +10%",
	label_generic_fub_mobility: "Mobility +10%",
	label_generic_fub_accuracy: "Accuracy +10%",
	label_generic_fub_movement: "Movement +1",
	label_generic_fub_item_slot: "Item Slot +1",
	label_apply: "OK"
}

APPSTRINGS.PILOTUPGRADES = {
	title: "Mod Level", 
	select_title: "Select Pilot",
	stats_title: "Upgrade Pilot",
	label_available_PP: "Available PP",
	label_required_PP: "Required PP",
	label_remaining_PP: "Remaining PP",
	label_ability: "Ability",
	label_points_added: "Points Added",
	tool_tip_start: "Select either Stats or Abilities to begin",
	tool_tip_melee: "Factors into damage output for Melee attacks",
	tool_tip_ranged: "Factors into damage output for Ranged attacks",
	tool_tip_offense: "Factors into damage output",
	tool_tip_skill: "Factors into how often Critical hits occur",
	tool_tip_defense: "Factors into damage taken from enemy attacks",
	tool_tip_evade: "Factors into how often the enemy's attacks will hit",
	tool_tip_hit: "Factors into how often the unit's attacks will hit",
	tool_tip_AIR: "Affects performance while in the Air",
	tool_tip_LND: "Affects performance while on Land",
	tool_tip_SEA: "Affects performance while in Water",
	tool_tip_SPC: "Affects performance while in Space",
	
}

APPSTRINGS.MECHEQUIPS = {
	select_title: "Select Unit",
	title: "Equip Items",
	label_balance: "Balance",
	label_price: "Worth",
	label_sell: "To Sell",
	label_total: "Total",
	label_available: "Available",
	label_transfer_hint: "Select a unit to take the item from.",
}

APPSTRINGS.SELLITEMS = {
	title: "Sell Items",
	label_current_funds: "Current Funds",
	label_funds_gained: "Funds gained",
	label_funds_result: "Result",
	label_sell: "Sell(Start)",
	label_sell_hint: "Select the amount to sell"
}

APPSTRINGS.ATTACKLIST = {
	label_attack_name: "Attack Name",
	label_attributes: "Attributes",
	label_power: "Power",
	label_upgraded: "Upgraded",
	label_range: "Range",
	label_hit: "Hit",
	label_crit: "Crit",
	
	label_ammo: "Ammo",
	label_EN_cost: "EN Cost",
	label_required_will: "Required Will",
	label_terrain_rating: "Terrain Rating",
	label_special_effect: "Special Effect",
	label_upgrades: "Upgrades",
	
	label_no_ammo: "Out of Ammo!",
	label_no_EN: "Out of EN!",
	label_no_will: "Not enough Will!",
	label_no_post_move: "Can't be used after moving!",
	label_no_target: "No target!",
	label_no_map_counter: "Can't counter with a map attack!",
	label_no_participants: "No valid partner in range!",
	label_no_terrain: "Can't hit the target terrain!",
	label_no_all: "An ALL attack is required!",
	label_no_regular: "A single target attack is required!",
	label_no_map_support: "Can't support with a map attack!",
	label_HP_gated: "Can only be used when below {HP_THRESHOLD} percent HP!",
	label_inner_combo: "The unit is participating in a combo attack!",
	label_sub_twin_combo: "A sub twin cannot initiate a combo attack!",
	label_no_combo_support: "Combo attack unavailable!",
	label_counter_only: "Can only be used to counter attack!",
}

APPSTRINGS.REWARDS = {
	label_funds_gained: "Funds gained",
	label_current_funds: "Current Funds",
	label_pilot: "Pilot",
	label_exp: "Exp",
	label_items: "Items"
}

APPSTRINGS.LEVELUP = {
	label_level_up: "LEVEL UP!",
	label_skills: "Skills",
	label_spirits: "Spirits"
}

APPSTRINGS.DEPLOYMENT = {
	title: "Deployment",
	order: "Order",
	available: "Available",
	label_selected: "selected",
	title_selection: "Deploy a unit",
	label_in_stage: "Deploy!(start)",
	label_will_deploy: "will be deployed."
}

APPSTRINGS.REASSIGN = {
	mech_title: "Select Mech",
	pilot_title: "Select Pilot",
	label_main: "Main",
	label_slot: "Sub"
}

APPSTRINGS.SEARCH = {
	title: "Search",
	label_spirit: "Spirit",
	label_pilot: "Pilot",
	label_mech: "Mech"
}

APPSTRINGS.OPTIONS = {
	title: "Options",
	label_game_options: "Game Options",
	label_sound_options: "Sound Options",
	label_display: "Display",
	label_fullscreen: "Fullscreen",
	label_grid: "Grid",
	label_will: "Show Will",
	label_default_support: "Default Support Defend",
	label_default_support_on: "Always",
	label_default_support_off: "Never",
	label_skip_move: "Skip Unit Move",
	label_battle_bgm: "Battle BGM",
	label_after_battle_bgm: "After Battle BGM",
	label_bgm_map: "Map",
	label_bgm_unit: "Unit",
	label_bgm_vol: "BGM Volume",
	label_sfx_vol: "SFX Volume",
	label_battle_speed: "Action Speed"
}

APPSTRINGS.MAP_BUTTONS = {
	label_deploy: "Deploy!(start)",
	
}

APPSTRINGS.STATUS = {
	disabled: {name: "Disabled", description: "The unit cannot take any actions"},
	spiritsSealed: {name: "Spirits Sealed", description: "The unit cannot use Spirit commands"},
	accuracyDown: {name: "Accuracy", description: "The unit's accuracy is reduced"},
	mobilityDown: {name: "Mobility", description: "The unit's mobility is reduced"},
	armorDown: {name: "Armor", description: "The unit's armor is reduced"},
	movementDown: {name: "Move", description: "The movement range of the unit is reduced"},
	attackDown: {name: "Weapon", description: "The power of the unit's weapons is reduced"},
	rangeDown: {name: "Range", description: "The range of the unit's weapons is reduced"},	
}

APPSTRINGS.STATUS_BY_INFLICTION_ID = {
	inflict_disable: {name: "Disabled", description: "The unit cannot take any actions"},
	inflict_spirit_seal: {name: "Spirits Sealed", description: "The unit cannot use Spirit commands"},
	inflict_accuracy_down: {name: "Accuracy Down", description: "The unit's accuracy is reduced"},
	inflict_mobility_down: {name: "Mobility Down", description: "The unit's mobility is reduced"},
	inflict_armor_down: {name: "Armor Down", description: "The unit's armor is reduced"},
	inflict_move_down: {name: "Move Down", description: "The movement range of the unit is reduced"},
	inflict_attack_down: {name: "Attack Down", description: "The power of the unit's weapons is reduced"},
	inflict_range_down: {name: "Range Down", description: "The range of the unit's weapons is reduced"},	
	inflict_SP_down: {name: "SP Down", description: "The range of the unit's weapons is reduced"},	
	inflict_will_down: {name: "Will Down", description: "The range of the unit's weapons is reduced"},	
}

APPSTRINGS.TEXT_CRAWLS = {
	test: "The year is 2022, and this is an Opening Crawl example.<br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vulputate egestas metus quis consequat. Donec vel diam sem. Sed quam mi, tincidunt eget pretium faucibus, mattis sed risus. Donec vehicula leo sapien, id dignissim enim consectetur non. Nunc at sem sed nibh condimentum dignissim nec eget ligula. Quisque ac sodales nunc. Nullam in consequat nulla. Fusce non tincidunt libero. Vivamus nec eros quis augue luctus porttitor in vitae risus. Fusce id ipsum lacus. Maecenas vel sapien eros. Suspendisse eget ultricies sapien. Vivamus quis diam finibus, feugiat diam vitae, fringilla sem. Aenean egestas efficitur odio a blandit. ",
}

APPSTRINGS.BASIC_BATTLE = {
	label_MISS: "MISS",
	label_COUNTER: "COUNTER",
	label_CRIT: "CRITICAL!",
	label_STATUS: "STATUS"
}

APPSTRINGS.BEFORE_BATTLE = {
	label_new_move: "NEW"
}

APPSTRINGS.ZONE_STATUS = {
	title: "Zone Effects",
	label_level: "L",
	label_player: "Player",
	label_enemy: "Enemy"
}