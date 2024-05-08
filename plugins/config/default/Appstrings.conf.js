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
	label_perks: "Perks",
	label_ace_bonus: "Ace Bonus", 
	label_abilities: "Abilities",
	label_parts: "Parts",
	label_victory_condition: "Victory Condition",
	label_defeat_condition: "Defeat  Condition",
	label_mastery_condition: "Mastery Condition",
	label_mastery_locked: "Unobtainable after Game Over on this stage.",
	label_mastery_completed: "Completed!",
	label_mastery_completed_message: "Mastery Condition completed!",
	label_box_pickup: "Collected: {ITEMS}!",
	label_box_pickup_scripted: "Collected all remaining boxes and obtained:\n{ITEMS}!",
	label_box_stolen: "The item box was taken!",
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
	label_MP: "MP",
	label_EN: "EN",
	label_will: "Will",
	label_level: "Lv",
	label_HP: "HP",
	label_EN: "EN"
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
	fav_points: "Fav. Points",
	funds: "Funds",
	top_ace: "Top Ace",
	mech_label: "Mech",
	list_label: "List",
	upgrade_label: "Upgrade",
	equip_parts: "Equip Parts",
	sell_parts: "Sell Parts",
	equip_weapons: "Equip Weapons",
	upgrade_equip_weapon: "Upgrade Equips",
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
	label_pilot_level: "Lv",
	label_pilot_next_level: "Next-Lv",
	label_pilot_will: "Will",
	label_pilot_PP: "PP",
	label_pilot_exp: "Exp",
	label_pilot_SP: "SP",
	label_pilot_MP: "MP",
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
	label_apply: "OK",
	label_no_upgrade: "This unit does not upgrade using funds."
}

APPSTRINGS.PILOTUPGRADES = {
	title: "Mod Level", 
	select_title: "Select Pilot",
	stats_title: "Upgrade Pilot",
	label_available_PP: "Available PP",	
	label_required_PP: "Required PP",
	label_remaining_PP: "Remaining PP",
	label_available_points: "Available",
	label_required_points: "Required",
	label_remaining_points: "Remaining",
	label_ability: "Ability",
	label_points_added: "Points Added",
	label_perk: "Perk",
	label_cost: "Cost",
	tool_tip_start: "Select a category to begin",
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
	weapon_title: "Equip Weapons",
	weapon_upgrade_title: "Upgrade Equips",
	label_balance: "Balance",
	label_price: "Worth",
	label_sell: "To Sell",
	label_total: "Total",
	label_available: "Available",
	label_transfer_hint: "Select a unit to take the item from.",
	label_weight: "Weight",
	label_upgrades: "Upgrades",
	label_holder: "Mech",
}

APPSTRINGS.SELLITEMS = {
	title: "Sell Items",
	label_current_funds: "Current Funds",
	label_funds_gained: "Funds gained",
	label_funds_result: "Result",
	label_sell: "Sell",
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
	label_MP_cost: "MP Cost",
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
	label_no_MP: "Out of MP!",
	label_invalid_tags: "This weapon doesn't work against this enemy!",
	
	label_target_both: "All",
	label_target_enemies: "Enemy",
	label_target_allies: "Ally",
	title: "Select Attack",
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
	label_in_stage: "Deploy!",
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
	label_battle_speed: "Action Speed",
	label_tweaks: "Game Tweaks",
	label_button_set: "Button Display",
	label_show_map_buttons: "Map Button Hints"
}

APPSTRINGS.GAME_MODES = {
	title: "Game Tweaks",
	label_on: "On",
	label_off: "Off",
	label_infinite_funds: "Infinite Funds",
	label_infinite_PP: "Infinite PP",
	resources: "Resources"
}

APPSTRINGS.MAP_BUTTONS = {
	label_deploy: "Deploy!",
	
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
	label_new_move: "NEW",
	label_support: "Support",
	label_defending: "Defending",
	label_attacking: "Attacking",
	label_attack: "Attack",
	label_defend: "Defend",
	label_evade: "Evade",
	
	label_start_battle: "Start Battle",
	label_demo_off: "DEMO: OFF",
	label_demo_on: "DEMO:  ON",
	label_select_assist: "Select Assist",
	label_select_action: "Select Action",
	label_sprits: "Spirits",
}

APPSTRINGS.ZONE_STATUS = {
	title: "Zone Effects",
	label_level: "L",
	label_player: "Player",
	label_enemy: "Enemy"
}

APPSTRINGS.BUTTON_HINTS = {
	test: {text: "This is a test action", action: 'menu'},
	test2: {text: "This is a test action2", action: 'ok'},
	test3: {text: "This is a test action3", action: 'escape'},
	abi_details: {text: "Show Ability Details", action: 'menu'},
	tab_nav: {text: "Navigate Tabs", action: "d:left_right"},
	previous_sub_pilot: {text: "Navigate Sub Pilot", action: "d:shoulder_triggers"},
	//next_sub_pilot: {text: "Next Sub Pilot", action: "right_trigger"},
	previous_twin_pilot: {text: "Navigate Twin Pilots", action: "d:shoulder_buttons"},
	//next_twin_pilot: {text: "Next Twin Pilot", action: "pagedown"},
	inspect_weap: {text: "View Weapon Info", action: "d:up_down"},
	
	//options
	select_option: {text: "Select an Option", action: "d:up_down"},
	toggle_option: {text: "Toggle Current Option", action: "d:left_right"},
	enter_sub_menu: {text: "Enter Sub-menu", action: "ok"},
	
	//lists
	select_mech: {text: "Select a Mech", action: "d:up_down"}, 
	page_nav: {text: "Navigate Pages", action: "d:left_right"}, 
	det_page_nav: {text: "Change Details", action: "d:shoulder_triggers"}, 
	det_page_sort: {text: "Change Sort Field", action: "d:shoulder_buttons"}, 
	det_sort_order: {text: "Change Sort Order", action: "L3"}, 
	
	select_pilot: {text: "Select a Pilot", action: "d:up_down"}, 
	
	//list_actions
	generic_list_mech:  {text: "Confirm Mech", action: "ok"},
	generic_list_pilot:  {text: "Confirm Pilot", action: "ok"},
	highlight_map: {text: "Show on Map", action: "ok"},
	upgrade_unit: {text: "Upgrade Unit", action: "ok"},
	upgrade_pilot: {text: "Upgrade Pilot", action: "ok"},
	
	//Search
	tab_selection: {text: "Select a Tab", action: "ok"},
	navigate_entries: {text: "Select an Entry", action: "up"},
	search_select_abi: {text: "Show Units with Ability", action: "ok"},
	search_select_spirit: {text: "Show Units with Spirit", action: "ok"},
	
	//upgrade mech
	select_mech_stat: {text: "Select a Stat", action: "d:up_down"}, 
	select_stat_upgrade: {text: "Select Upgrade Amount", action: "d:left_right"}, 
	confirm_upgrade: {text: "Confirm Upgrade", action: "ok"}, 
	select_generic_FUB: {text: "Select a Bonus", action: "d:up_down"}, 
	
	//equips
	change_equips:  {text: "Change Equipables", action: "ok"}, 
	select_slot: {text: "Select a Slot", action: "d:up_down"}, 
	confirm_slot: {text: "Confirm Slot", action: "ok"},
	select_item: {text: "Select an Equipable", action: "d:up_down"}, 	
	confirm_item: {text: "Confirm Item", action: "ok"},
	select_transfer_slot: {text: "Select a Unit", action: "up"}, 
	confirm_transfer: {text: "Confirm Transfer", action: "ok"}, 
	
	//sell items
	confirm_sale: {text: "Confirm Sale of All Selected", action: "menu"}, 
	select_sell_amount: {text: "Select Amount to Sell", action: "d:left_right"}, 
	confirm_item_select: {text: "Select Equipable", action: "ok"},
	
	//equipable Weapons
	upgrade_unit: {text: "Change Weapons", action: "ok"},
	confirm_weapon: {text: "Confirm Weapon", action: "ok"},
	select_weapon: {text: "Select Weapon", action: "ok"},
	
	select_weapon_upgrade: {text: "Select Upgrade Amount", action: "d:left_right"}, 
	
	//pilot Upgrades
	select_pilot_stat: {text: "Select a Stat", action: "d:up_down"}, 
	select_pilot_stat_upgrade: {text: "Select Upgrade Amount", action: "d:left_right"}, 
	confirm_pilot_upgrade: {text: "Confirm Upgrade", action: "ok"}, 
	select_ability: {text: "Select an Ability", action: "d:up_down"}, 
	confirm_ability_selection: {text: "Confirm Ability", action: "ok"},
	confirm_ability_purchase: {text: "Confirm Ability Purchase and Equip", action: "ok"},
	confirm_ability_equip: {text: "Confirm Ability Equip", action: "ok"},
	select_fav: {text: "Select an Ability", action: "d:up_down"}, 
	togle_fav: {text: "Toggle for Purchase", action: "d:left_right"},
	
	//deployment
	select_deploy_slot: {text: "Select a Unit", action: "up"}, 
	select_deploy_unit: {text: "Confirm Unit", action: "ok"}, 
	select_deploy_twin: {text: "Confirm Twin", action: "shift"}, 
	
	select_deploy_target_slot: {text: "Select a Slot", action: "up"}, 
	confirm_deploy_unit: {text: "Place Unit", action: "ok"}, 
	
	move_to_front:  {text: "Move to Front", action: "pageup"}, 
	move_to_back:  {text: "Move to Back", action: "pagedown"}, 
	
	deploy: {text: "Deploy", action: "menu"},  
	
	//spirits
	select_spirit: {text: "Select a Spirit/Switch Pilot", action: "up"}, 
	to_sub_pilot: {text: "Switch Pilot", action: "d:shoulder_buttons"}, 
	multi_select: {text: "Select Multiple", action: "shift"}, 
	confirm_spirits: {text: "Apply", action: "ok"}, 
	
	//Map
	move_cursor: {text: "Move Cursor", action: "up"},
	speed_up_cursor: {text: "Faster Cursor", action: "shift"}, 	
	toggle_detail_icons: {text: "Toggle Will Display", action: "menu"}, 	
	pause_menu: {text: "Map Menu", action: "ok"}, 
	show_enemy: {text: "Show Move", action: "ok"}, 
	navigate_units: {text: "Next/Prev. Unit", action: "d:shoulder_buttons"},
	show_actor: {text: "Show Status", action: "ok"},
	actor_menu: {text: "Actor Menu", action: "ok"},
	
	select_list_weapon: {text: "Select Weapon", action: "d:up_down"},
	
	select_space: {text: "Select Space", action: "ok"},
	quick_select_space: {text: "Quick Select", action: "shift"},
	
	select_action: {text: "Select Action", action: "d:up_down"},
	confirm_action: {text: "Confirm Action", action: "ok"},
	
	
	select_target: {text: "Select Target", action: "ok"},
	prev_target:  {text: "Previous Target", action: "pageup"}, 
	next_target:  {text: "Next Target", action: "pagedown"},
	
	confirm_recipient: {text: "Confirm Recipient", action: "ok"},
	
	choose_direction: {text: "Choose Direction", action: "up"},
	confirm_attack: {text: "Confirm Attack", action: "ok"},
	choose_position: {text: "Choose Position", action: "up"},
	confirm_boarding: {text: "Confirm Boarding", action: "ok"},
	
	scroll_list: {text: "Scroll List", action: "d:up_down"},
	show_zone_info: {text: "Show Zone Details", action: "menu"},
	show_status: {text: "Show Status", action: "menu"},
};



function EDITORSTRINGS(){
	
}

EDITORSTRINGS.testAllSections = function(){
	Object.keys(EDITORSTRINGS).forEach(function(section){
		if(typeof EDITORSTRINGS[section] == "object"){
			EDITORSTRINGS.testSection(section);
		}
	});
}

EDITORSTRINGS.testSection = function(section){
	if(EDITORSTRINGS[section]){
		var ctr = 0;
		Object.keys(EDITORSTRINGS[section]).forEach(function(key){
			EDITORSTRINGS[section][key] = ctr++;
		});
	}
}

EDITORSTRINGS.GENERAL = {
	title: "SRW Engine MV Editor v2.0",
	weapon_editor_label: "Weapon Editor Editor", 
	mech_editor_label: "Mech Editor", 
	enemy_pilot_editor_label: "Enemy Pilot Editor",
	ally_pilot_editor_label: "Ally Pilot Editor", 
	pattern_editor_label: "Pattern Editor", 
	attack_editor_label: "Attack Editor",
	environment_editor_label: "Environment Editor",
	battle_text_editor_label: "Battle Text", 
	label_no: "No",
	label_yes: "Yes",
	
	label_new: "New",
	label_copy: "Copy",
	label_delete: "Delete",
	label_export: "Export",
	label_import: "Import",	
	label_save: "Save",
	label_cancel: "Cancel",
	label_info: "Info",
	label_commands: "Commands",
	label_paste: "Paste",
	label_name: "Name",
	
	label_max_entries: "Max. Entries",
	label_search: "Search",
	hint_clear: "Clear the search",
	hint_paste: "Paste into this entry",
	hint_copy: "Copy this entry",
	hint_erase: "Erase this entry",
	
	hint_animating: "An animation is playing",
	
	confirm_remove_entries: "Reducing the entry count to this number will discard existing entries. This cannot be undone! Continue?",
	
	label_general: "General",
	label_editor_tag: "Editor Tag",
	label_terrain: "Terrain",
	
	hint_no_quote: "No quotes found for the current combination of Attack and Actor."
}

EDITORSTRINGS.ATTACKS = {
	label_command: "Command",
	label_target: "Target",
	label_parameters: "Parameters",
	
	label_copy_helper: "Copy from Helper",
	label_helper: "Helper",
	label_play: "Play BGM",
	label_play_until: "Play Until",
	label_enemy_side: "Enemy Side",
	label_hits: "Attack Hits",
	label_destroys: "Attack Destroys",
	label_toggle_pivots: "Show Pivots",
	label_show_barrier: "Show Barrier",
	label_break: "Break",
	label_environment: "Environment",
	hint_environment: "The environment that will be used for the preview.",
	
	label_attack: "Attack",
	hint_attack: "The attack for which to show quotes.",
	label_actor: "Actor",
	hint_actor: "The ally side pilot for the preview",
	label_actor_mech: "Actor Mech",
	hint_actor_mech: "The ally side mech for the preview",
	label_actor_twin: "Actor Twin",
	hint_actor_twin: "The ally side twin for the preview",
	label_actor_twin_mech: "Actor Twin Mech",
	hint_actor_twin_mech: "The ally side twin mech for the preview",
	
	label_enemy: "Enemy",
	hint_enemy: "The enemy side pilot for the preview",
	label_enemy_mech: "Enemy Mech",
	hint_enemy_mech: "The enemy side mech for the preview",
	label_enemy_twin: "Enemy Twin",
	hint_enemy_twin: "The enemy side twin for the preview",
	label_enemy_twin_mech: "Enemy Twin Mech",
	hint_enemy_twin_mech: "The enemy side twin mech for the preview",
	
	label_missing_object:" Couldn't find an object named '[NAME]'",
	
	label_new_tick: "New Tick",
	label_send_to: "Send to...",
	label_sequence: "Sequence",
	label_shift: "Shift",
	
	confirm_merge_tick: "The new tick is already in use, merge the command lists?",
	confirm_delete: "Delete this entire tick?",
	prompt_ticks_count: "Shift by how many ticks?",
	alert_tick_in_use: "Tick [TICK] is already in use!",
	
	confirm_discard_unchaged: "Discard all unsaved changes?",
	

}

EDITORSTRINGS.TEXT = {
	label_text_type: "Text Type",
	label_event: "Event",
	label_unit_type: "Unit Type",
	label_unit: "Unit",
	label_text_type: "Text Type",
	label_reference_id: "Reference ID",
	
	label_default: "Default",
	label_new: "New",
	label_target_mech: "Target Mech",
	label_mech: "Mech",
	label_actors: "Actors",
	label_enemies: "Enemies",
	label_target_pilots_tags: "Target Pilot Tags",
	label_target_mech_tags: "Target Mech Tags",
	label_add: "Add",
	label_name: "Name",
	label_duration: "Duration",
	label_ticks: "ticks",
	hint_duration: "The duration is expressed in animation ticks, each 1/60th of a second.",
	label_variable: "Variable",
	label_value: "Value",
	label_copy_face: "Copy Face",
	label_paste_face: "Paste Face",
	label_face_name: "Face Name",
	label_face_index: "Face Index",
	label_quote_id: "Quote ID",
	label_quote_group: "Quote Group",
	label_quote_percent: "Weight",
	label_quote_odds: "Configure Group Weights",
	label_other_unit: "Other Unit",
	label_tag: "Other Tag",
	label_quote: "Quote",
	label_line: "Line",
	
	hint_preview: "Preview this quote",
	hint_delete: "Delete this quote",
	
	confirm_delete_text: "Delete this line?",
	confirm_delete_entry: "Delete this weapon entry and all its quotes?",
	confirm_delete_event_entry: "Delete this event entry and all its quotes?",
}

EDITORSTRINGS.BG = {
	label_layers: "Layers",
	label_visible: "Visible",
	
	label_path: "Path",
	label_fixed: "Fixed",
	label_width: "Width",
	label_height: "Height",
	label_y_offset: "Y Offset",
	label_z_offset: "Z Offset",
	
	prompt_name: "Please enter a name",
	confirm_delete: "Delete the current definition?",
	confirm_delete_layer: "Delete this layer?",
}

EDITORSTRINGS.WEAPON = {
	label_attributes: "Attributes",
	hint_no_cost: "-1 means no cost or requirement",
	label_effects: "Effects",
	label_combo_attack: "Combo Attack",
	label_equipable: "Equipable Properties",
	label_cost_type: "Cost Type",
	label_upgrade_amount: "Upgrade Amount",
	label_weight: "Weight",
	
	label_banned_mechs: "Banned on ids",
	label_allowed_mechs: "Allowed on ids",
	
	label_type: "Type",
	
	label_melee: "Melee",
	label_ranged: "Ranged",
	label_post_move: "Post Move",
	
	label_power: "Power",
	label_min_range: "Min Range",	
	label_range: "Range",
	
	label_ammo: "Ammo",
	label_EN: "EN",
	label_MP: "MP",
	label_will: "Will",
	label_hit_mod: "Hit Modifier",
	label_crit_mod: "Crit Modifier",
	label_category: "Category",
	label_primary_attr: "Primary Attribute",
	label_secondary_attr: "Secondary Attribute",	
	label_upgrade_type: "Upgrade Type",
	label_always_counter: "Always Counter",
	label_only_counter: "Only as Counter",
	label_ALL: "ALL Weapon",
	label_animation: "Animation",
	label_animation_ally: "Animation(Ally)",
	label_basic_animation: "Basic Battle Anim.",
	label_basic_animation_ally: "Basic Battle Anim.(Ally)",
	label_invalid_target_tags: "Invalid Target Tags",
	label_basic_animation_scale: "Animation Scale",
	label_basic_animation_scale_ally: "Animation Scale",
	
	hint_effects: "Only the first two effects are shown in the UI",
	
	hint_is_map: "Is a Map Attack",
	hint_is_regular: "Is a Regular Attack",
	label_attack_id: "Attack ID",
	label_ignore_friendlies: "Hits Allies",
	label_allies_counter: "Allies Counter",
	label_allies_interaction: "Effects on Allies",
	label_hit_enemies: "Hits Enemies",
	label_enemies_counter: "Enemies Counter",
	label_enemies_interaction: "Effects on Enemies",
	
	label_damage_and_status: "Damage & Status",
	label_status_only: "Status",
	label_damage_only: "Damage",
	
	label_target_both: "Both",
	label_target_enemies: "Enemies",
	label_target_allies: "Allies",
	
	label_combo_type: "Type",
	label_adjacent: "Adjacent",
	label_on_map: "On Map",
	label_required_weapons: "Required Weapons",
	label_HP_treshold: "HP Threshold",
	
	label_map_attack: "Targeting",
	label_animation: "Animation",
	label_id: "ID",
	label_scale: "Scale",
	label_offsets: "Offsets",
	label_up: "Up",
	label_down: "Down",
	label_left: "Left",
	label_right: "Right",
	label_text_box: "Text Box",
	label_edit_secondary_pattern: "Edit secondary pattern",
	label_lock_rotation: "Lock Rotation",
	label_choose_center: "Choose Center",
	hint_choose_center: "Select a center tile",
	
	confirm_remove_MAP: "Remove this map attack?",
	label_affects: "Affects",
}

EDITORSTRINGS.MECH = {
	label_general_info: "General Info",
	label_stats: "Stats",
	label_terrain: "Terrain",
	label_abilities: "Abilities",
	label_weapons: "Weapons",
	label_transformation: "Transformation",
	label_auto_transformation: "Auto Transformation",
	label_auto_combination: "Combination",
	label_deployment: "Deployment",
	label_sprites: "Sprites",
	label_animations: "Animations",
	
	
	
	
	hint_fallback: "Falling back to Battle Scene sprite because no Menu Sprite is defined!",
	label_warn_fallback: "Using fallback!",
	label_stats_label: "Stats Label",
	label_is_ship: "Is Ship",
	label_can_equip: "Can Equip",
	label_can_hover: "Can Hover",
	label_sync_parts: "Sync Parts With",
	label_sync_equips: "Sync Equips With",
	label_sync_upgrades: "Sync Upgrades With",
	label_fub_transform: "FUB Transform",
	label_enabled: "Enabled",
	label_move_penalty: "With Movement Penalty",
	label_terrain_rank: "Rank",
	label_can_upgrade: "Can Upgrade",
	
	label_exp_yield: "Exp. Yield",
	label_pp_yield: "PP Yield",
	label_fund_yield:"Fund Yield",
	label_tags: "Tags",
	label_attribute1: "Attribute 1",
	label_attribute2: "Attribute 2",
	label_carrying_capacity: "Carrying Capacity",
	
	title_FUB: "Full Upgrade Bonus",
	label_FUB: "FUB",
	
	label_item_slots: "Item Slots",
	label_cost_type: "Cost Type",
	label_upgrade_amount: "Upgrade Amount",
	
	label_HP: "HP",
	label_EN: "EN",

	label_armor: "Armor",
	label_mobility: "Mobility",
	label_accuracy: "Accuracy",
	
	label_weapons: "Weapons",
	
	label_locked: "Locked",
	
	label_command_name: "Command Name",
	label_available: "Available",
	label_required_will: "Required Will",
	label_restores: "Restores",
	
	label_on_destruction: "On Destruction",
	label_mech: "Mech",
	label_pilot: "Pilot",
	label_if_other_unit_present: "If Other Unit Present",
	label_other_unit: "Other Unit",
	label_transform_into: "Tranform Into",
	label_if_other_unit_missing: "If Other Unit Missing",
	
	label_from: "From",
	label_into: "Into",
	
	label_can_deploy: "Can Deploy",
	hint_can_deploy: "If enabled the mech can be deployed directly",
	label_edit: "Edit",
	label_deploy_actions: "Deploy Actions",
	label_force_pilots: "Force Pilots",
	hint_force_pilots: "If enabled setting a pilot for this mech will immediately reconfigure other pilots if needed according to the deploy actions",
	label_quick_swap: "Quick Swap",
	hint_quick_swap: "If enabled a menu option to swap between the available pilots will be enabled on the unit's map menu",
	label_allowed_pilots: "Allowed Pilots",
	label_sub_pilots: "Sub Pilot Slots",
	label_slot: "Slot",
	label_default_pilot: "Default Pilot",
	label_allowed: "Allowed",
	
	label_basic_battle: "Basic Battle",
	label_overworld: "Overworld",
	label_battle_scene: "Battle Scene",
	label_folder: "Folder",
	label_sprite_type: "Sprite Type",
	label_blockbench_hack: "Blockbench Hack",
	hint_blockbench_hack: "If 1 the model will have its leaf geometry merged on load by the engine to reduce draw calls. Do not enable for models that use Armatures as they will break!",
	hint_dragonbones_width: "Determines the width for the canvas on which the DragonBones sprite is rendered",
	hint_dragonbones_height: "Determines the height for the canvas on which the DragonBones sprite is rendered",
	hint_default_size: "The width and height of the texture files for this sprite in pixels",
	hint_3D_scale: "A scaling factor for the 3D model",
	hint_3D_rotation: "The default rotation of the 3D model",
	hint_shadow: "Scale for the shadow of the unit",
	hint_world_size: "The size at which the sprite is displayed in World units(default 3)",
	
	label_armature_name: "Armature Name",
	label_dragonbones_world_size: "DragonBones World Size",
	label_canvas_width: "Internal Canvas Width",
	label_canvas_height: "Internal Canvas Height",
	label_source_size: "Source Size",
	label_scale: "Scale",
	label_rotation: "Rotation",
	label_y_offset: "Y Offset",
	label_x_offset: "X Offset",
	label_root_y_offset: "Root Y Offset",
	label_shadow_scale: "Shadow Scale",
	label_shadow_z_offset: "Shadow Z Offset",
	label_shadow_x_offset: "Shadow X Offset",
	label_world_size: "World Size",
	
	label_world_units: "world units",
				
	label_death_anim: "Death Animation",
	label_system_default: "System Default",
	label_default_attachments: "Default Attachments",
	
	label_spawn: "Spawn",
	label_animation: "Animation",
	label_frame_size: "Frame Size",
	label_frames: "Frames",
	label_sheet_width: "Sheet Width",
	label_anim_speed: "Animation Speed",
	label_change_on_frame: "Change on Frame",
	label_SE: "Sound Effect",	
	label_destroy: "Destroy",
	
	label_animation: "Animation",
	label_deploy_actions: "Deploy Actions",
	
	
}

EDITORSTRINGS.PILOT = {
	label_general_info: "General Info",
	label_stats: "Stats",
	label_spirits: "Spirits",
	label_abilities: "Ability Learn List",
	label_personality: "Will Gain(Personality)",
	label_rel_bonus: "Relationship Bonuses",
	label_assets: "Assets",
	
	label_overworld: "Overworld(Regular map only)",
	
	label_name: "Name",
	label_use_mech_name: "Use Mech Name",
	label_stats_label: "Stats Label",
	

	label_default_mech: "Default Mech",
	
	label_rate: "Rate",
	label_max: "Max",
	
	label_SP: "SP",	
	label_MP: "MP",	
	label_melee: "Melee",	
	label_ranged: "Ranged",		
	label_skill: "Skill",	
	label_defense: "Defense",
	label_evade: "Evade",
	label_hit: "Hit",
	
	label_exp_yield:"Exp. Yield",
	label_pp_yield: "PP Yield",
	label_tags: "Tags",
	label_target_formula: "Targeting Formula",	
	label_text_alias: "Battle Text Alias",
	
	label_level: "Level",
	label_cost: "Cost",
	label_twin: "Twin",
	
	label_ability_level: "Ability Level",
	label_learned_at: "Learned At",
	
	label_ace_ability: "Ace Ability",
	
	label_will_on_hit: "On Hitting a Target",
	label_will_on_miss: "On Missing a Target",
	label_will_on_damage: "On Taking Damage",
	label_will_on_evade: "On Evading",
	label_will_on_destroy: "On Destroying",
	label_will_on_ally_down: "On Ally Destroyed",
	
	label_cutin_path: "Cutin Path",
	
	label_receiving: "Receiving Pilot",
	label_effect: "Effect",
	label_rel_level: "Level"
}