var ENGINE_SETTINGS = {
	GAMEID: "SRWMV",
	CUSTOM_TITLE_SCREEN: "",
	PLACE_PARALLAX_ABOVE_MAP: true,
	ENABLE_HEALTH_BARS_ON_MAP: true,
	FONT_SCALE: 1,//used to scale the text in CSS menus.
	FONT_LINE_HEIGHT_SCALE: 0,//used to offset text in CSS menus.
	FONT_SIZE: 28,//font size in RPG Maker text boxes. Also affects the line height in the message window.
	LINE_HEIGHT: 36,//line height in RPG Maker text boxes.
	LINE_OFFSET: 0,//offsets all drawn text in RPG Maker text boxes on its line(in pixels)
	MSG_LINE_HEIGHT_SCALE: 1,//scaling factor for the line height of lines in the message window. Use this to adjust if you are not using the default FONT_SIZE
	DISABLE_TOUCH: false,
	PRELOAD_AUDIO: true,
	DEFAULT_BASIC_ANIM_RATE: 4,
	BASIC_BATTLE_ANIM_MODE: "normal", //normal = use anims set in editor, none = do not use, attribute = use animation linked to weapon attribute
	USE_CUSTOM_BASIC_BATTLE_BGS: true, //if true using the scrolling backgrounds from BasicBattleBgs.conf. If false default colors are used, additionally shadows are forced to enabled.
	GRADIENT_BATTLE_BG_COLORS: {//the colors used for the different factions if USE_CUSTOM_BASIC_BATTLE_BGS is set to false.
		ally: "linear-gradient(0deg, rgba(3,58,122,1) 0%, rgba(109,141,249,1) 100%)",
		enemy: "linear-gradient(0deg, rgba(122,3,3,1) 0%, rgba(249,109,109,1) 100%)",
		green:"linear-gradient(0deg, rgba(0,89,15,1) 0%, rgba(106,222,96,1) 100%)",
		yellow: "linear-gradient(0deg, rgba(83,89,0,1) 0%, rgba(210,222,96,1) 100%)",
	},
	RPG_MAKER_INV_LIMIT: 1,
	ENABLE_EQUIPABLES: true,
	ALLOW_DUPLICATE_EQUIPS: false,
	MAX_UNIT_EQUIPABLES: 5, //the number of equipable weapon slots a unit has by default
	DEFAULT_PILOT_ABI_COUNT: 6,
	DEFAULT_CARRYING_CAPACITY: 150,		
	LOCK_CAMERA_TO_CURSOR: false,
	BEFORE_BATTLE_SPIRITS: true,
	ENABLE_TWIN_SYSTEM: true,
	DISABLE_ALLY_TWINS: false,
	USE_STRICT_TWIN_SLOTS: false,
	ENABLE_TRANSFORM_ALL: false,
	TRANSFORM_ALL_EXCEPTIONS: [],
	USE_SRW_SUPPORT_ORDER: true,
	ALERT_CLEARS_ON_ATTACK: false,//if true alert clears after dodging one attack, otherwise it affects all attacks in one battle phase(support attacks, etc.)
	PERSIST_CLEARS_ON_HIT: false,//if true persist clears after taking one attack, otherwise it affects all attacks in one battle phase(support attacks, etc.)
	ALLOW_MAP_CHARGE: false, //if true the charge spirit effect also affects MAP attacks
	DISABLE_EVASION_DECAY: false,
	ALLOW_POST_TURN_DEPLOY: true,
	CURSOR_TINT_INFO: {//a blend color set for the cursor when hovering units of a certain faction
		enabled: false,
		colors: {
			"player": [38, 110, 172, 128],//players
			0: [172, 38, 38, 128],//enemy
			1: [38, 172, 83, 128],//green
			2: [172, 172, 38, 128],//yellow
		}
	},	
	TINT_CURSOR_PER_FACTION: true,
	HIDE_WAIT_COMMAND: true,
	CURSOR_OFFSET: 0,
	HP_BAR_COLORS: {
		full: {color: "#58b3ff", percent: 85},
		high: {color: "#49d38b", percent: 50},
		med: {color: "#f7ec05", percent: 30},
		low: {color: "#eda316", percent: 15},
		critical: {color: "#e11515", percent: 0}
	},
	USE_SINGLE_MAP_SPRITE: false,
	MAP_BUTTON_CONFIG: {
		SPRITE_SHEET: {
			PATH: "img/system/GlyphTiles.png", //the path of the sprite sheet file, CHANGE THIS IF YOU USE A CUSTOM ONE!
			TILE_SIZE: 16, //the size of one tile on the sprite sheet(pixels)
			WIDTH: 544, //the width of the sprite sheet file(pixels)
			HEIGHT: 384 //the height of the sprite sheet file(pixels)
		},
		BUTTON_SCALE: 1, // a multiplier for the displayed size of the icon
	},
	ATTR_LABEL_LENGTH: 2, //The length of the weapon attribute string shown in the attack list. It takes a substring of this length of the attribute string and capitalizes the first letter.
	USE_TILE_PASSAGE: true, //if true use RPG Maker tile passage setting to restrict movement
	ENABLE_QUICK_MOVE: true,
	LEVEL_CAP: 99,
	SP_CAP: -1,
	SHOW_NEW_MOVE_INDICATOR: true,
	ITEM_BOX_SPRITE: {
		characterName: "!Chest",
		characterIndex: 0
	},
	DEFAULT_AI_FLAGS: {
		terrain: 1,   //if 1 the unit will prefer to move onto tile that grant terrain bonuses
		formation: 1, //if 1 the unit will prefer to move adjacent to allies that provide support attack/defend
		reposition: 0, //if 1 the unit will move closer to hit enemies with stronger attacks even if they already can hit a target with a longer range attack
		preferTarget: 0,//if 2 the unit will prefer to move closer to its target unit or region even if they have other targets to attack. If 1 the unit will shoot its prefered target if in range but still attack other targets if not. Target units take priority over target regions.  
	},
	AI_USES_ITEMS: true,
	WEAP_TERRAIN_VALUES: {//weapon damage is multiplied with this value depending on its terrain rating and the current terrain of the target
		"S": 1.1,
		"A": 1.0,
		"B": 0.8,
		"C": 0.6,
		"D": 0.5,
	},
	MECH_TERRAIN_VALUES: {//damage received is multiplied with this value depending on the current terrain of the target
		"S": 1.1,
		"A": 1.0,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6,
	},	
	MECH_SIZES: ["S", "M", "1L", "2L", "XS"],
	MECH_SIZE_MODS: {
		DAMAGE: { // when calculating damage the size of the defender and attacker size are subtracted from each other and this value +1 is used as a multiplier for the defend value of the defender. 
			//ex.: 2L attacks S size unit -> 0.8 - 1.4 = -0.6 -> 1 + (-0.6) = 0.4 -> defenders final defend is multiplier with 0.4
			"XS": 0.6,
			"S": 0.8,
			"M": 1.0,
			"1L": 1.2,
			"2L": 1.4
		},
		EVADE: { //the accuracy of an attack targeting a unit is multiplied with this value
			"XS": 0.6,
			"S": 0.8,
			"M": 1.0,
			"1L": 1.2,
			"2L": 1.4
		}
	},	
	TERRAIN_PERFORMANCE: {
		"S": 1.1,
		"A": 1,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6
	},
	DISABLE_FULL_BATTLE_SCENE: false,// if true the option to show the battle DEMO will not be available
	BATTLE_SCENE: {
		FXAA_ON: false,
		SPRITE_WORLD_SIZE: 3,
		SPRITES_FILTER_MODE: "NEAREST", // set the filtering mode for textures in the battle scene: NEAREST or TRILINEAR
		DEFAULT_ANIM: {// defines default animations
			DESTROY: 2 // the default destroy animation
		},
		DEFAULT_CAMERA_POSITION: {x: 0,y: 1.15, z: -6.5},
		DEFAULT_ANIMATIONS: {
			ranged: 1,
			melee: 0
		},
		BLOCK_BREAK_THRESHOLD: 0.1,
		USE_RENDER_GROUPS: false,//If enabled unit shadow, units and spawned backgrounds will be assigned a render group. Likely only useful when working with 3D models for units, where it prevents planes clipping into the 3D models.
		/*DAMAGE_OFFSETS: {top: 20, left: 62},
		DAMAGE_TWIN_OFFSET: {top: 10, left: 40},*/
		RENDER_WIDTH: 1110,
		RENDER_HEIGHT: 624,
		SHOW_FADE_BELOW_TEXTBOX: false,
		DEFAULT_BARRIER_COLOR: "#7c00e6",
		FADE_BARRIER_DURING_NEXT_PHASE: true,//if true the barrier will only be shown briefly during the next phase command
		NOISE_PIXEL_SIZE: 1,
		//uncomment this block to enable default move sfx. Note, move_medium_0 and move_small_0 must be replaced with an existing sound effect
		/*
		DEFAULT_MOVE_SFX: "move_medium_0", //the default sound used
		DEFAULT_POSE_SFX: {in: "move_small_0", out: "move_small_0"}, //overrides for the sound used by sprite frame
		DEFAULT_MOVE_PITCH: 100, //the pitch used for the sound
		DEFAULT_MOVE_PITCH_VARIANCE: {main: 0, in: -10, out: -10, dodge: 10, block: -15},//adjustements to the pitch by sprite frame
		DEFAULT_SFX_POSES: ["main", "in", "out", "dodge", "block"],//which sprite frames get a default sfx even if useDefaultSfx is not set to 1 in the set_sprite_frame command
		*/
	},
	MASTERY_REWARDS: {
		PP: {AMOUNT: 5, SCOPE: "deployed"}, //scope is deployed, unlocked, or all
		FUNDS: 10000
	},
	ABILITY_SEARCH_LIST: {
		SPIRIT: [4, 26, 28, 5, 14, 7, 30, 23, 1, 18, 3, 9, 34, 31, 13, 16, 12, 36, 35, 32, 20, 0, 21, 33, 27, 8, 29, 11, 17, 19, 6, 25, 37, 15, 24, 38, 22, 2],
		PILOT: [41, 0, 19, 44, 16, 17, 23, 18, 20, 10, 7, 1, 3, 26, 25, 24, 2, 22, 13, 29, 39, 59, 4, 28, 27, 21, 40, 6, 14, 11, 12, 8, 15, 31, 33, 30, 32],
		MECH: [25, 11, 27, 28, 0, 24, 6, 5, 4, 10, 9, 21, 3, 2, 1, 23, 26, 36, 7, 22, 8, 19]
	},
	KEEP_ENEMY_SPRITE_ORIENTATION: false, // if true enemy sprites on the map will not be flipped
	ENEMY_TARGETING_FORMULA: "Math.min(hitrate + 0.01, 1) * (damage + (canDestroy * 5000))", // the formula used by enemy AI to score potential targets. A target with a higher score will be preferred. hitrate and damage are the projected hit rate and damage the unit will deal to a target. canDestroy is 1 if the unit can destroy the target if it hits, otherwise 0.
	//ENEMY_TARGETING_FORMULA: "50 - distance", //simple distance only preset
	//ENEMY_TARGETING_FORMULA: "50 - distance + (canDestroy * 100)", // distance + shootdown rate
	DEBUG_SAVING: false, // if enabled the save option on the pause menu during a stage will behave like the regular save function, rather than as a quick save.
	CURSOR_SPEED: 4, // the default cursor speed
	COMMANDER_AURA: {
		1: [10,8],
		2: [15,12,8],
		3: [20,16,12,8],
		4: [25,20,15,10,5]
	},
	SUPPORT_ATTACK_RATIO: 0.8,
	ALLOW_TURN_END_SUPPORT: false,
	VXT_SP: false,
	COST_TYPES: {
		NORMAL: {
			0: [2000, 4000, 6000, 8000, 10000, 10000, 15000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000],
			1: [2000, 3000, 5000, 5000, 5000, 10000, 10000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000]
		},
		WEAPON: {
			0: [12000, 17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 90000, 90000, 90000, 90000, 90000],
			1: [5000, 5000, 5000, 7000, 7000, 7000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
		}
	},
	WEAPON_UPGRADE_TYPES: {
		0: [100, 100, 100, 150, 150, 150, 200, 200, 200, 250, 200, 200, 200, 200, 200],
		1: [100, 150, 150, 150, 150, 200, 200, 200, 200, 250, 200, 200, 200, 200, 200]		
	},
	SCORE_GOES_TO_SUBS: false,
	ACE_REQUIREMENT: 50, //amount of kills required to unlocked the Ace Bonus
	DEFAULT_SP_REGEN: 0, //default SP regen in points of SP
	DEFAULT_HP_REGEN: 0, //default HP regen in percent of total(10,50,etc.)
	DEFAULT_EN_REGEN: 0, //default EN regen in percent of total(10,50,etc.)
	DEFAULT_MP_REGEN: 10, //default EN regen in percent of total(10,50,etc.)
	DODGE_PATTERNS: {//defines what animations should be used when performing special dodges in the basic and full battle scene
		1: {basic_anim: "double_image", full_anim: 3, full_anim_return: 4, se: "SRWDoubleImage"},
		2: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWParry"},
		3: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWJamming"},
		4: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWShootDown"},		
		5: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWShootDown", treat_as_block: true},//use the treat as block setting to force a hit animation to play instead of a miss animation
	},
	PURCHASABLE_ABILITIES: [
		11, //support attack
		12, //support defend
		4, //prevail	
		24, //ignore size
		21, //revenge
		13, //meditate
		14, //SP UP
		28, //resolve
		29, //morale
		30, //will+ evade
		31, //will+ damage
		32, //will+ hit
		33, //will+ destroy
		15, //will limit break
		17, //counter
		18, //E save
		19, //B save 
		20, //EXP UP
		25, //hit and away
		22, //instinct
		1, //guard
		23, //dash
		16, //continuous action		
	],
	STAT_GROWTH_FORMULA: "min + Math.floor((1 - rate) * Math.ceil((max-min) * (level-1)/98.0) + rate * Math.ceil((max-min) * ((level-1)/98.0)^2))",
	EXP_YIELD: {
		MIN: 10,
		MAX: 50000, //500 EXP per level, this is 100 levels so basically unlimited,
		LEVEL_SCALING_FORMULA: "defenderTotalYield * ((defenderLevel-attackerLevel) < 0 ? Math.pow((1/10), (Math.log10(attackerLevel-defenderLevel + 1))) : Math.log10(0.09*(defenderLevel-attackerLevel) + 1) * 20 + 1)"		
	},
	DEFAULT_PERSONALITY: {
		hit: 1,
		miss: 0,
		damage: 0,
		evade: 0,
		destroy: 3,		
		ally_down: 1
	},
	MAX_DEPLOY_SIZE: 36, //the number of slots shown in the deploy window if TWIN mode is not enabled
	MAX_DEPLOY_SIZE_TWIN: 40, //the number of slots shown in the deploy window if TWIN mode is enabled
	SINGLE_BATTLE_SPRITE_MODE: false,
	ENABLE_TWEAKS_MENU: true,
	ENABLE_TWEAKS_OPTION: false,
	MERGE_ATTACK_UPGRADES: false,
	ENABLE_ATTRIBUTE_SYSTEM: false,
	USE_WEAPON_ATTRIBUTE: false,
	DEFAULT_SE_MULTIPLIER: 1,//used for abilities that always grant super effective damage
	ATTRIBUTE_MODS: {
		"fire": [
			{type: "hit", modType: "addFlat", value: -30},
			{type: "weapon_melee", modType: "addFlat", value: 200},
			{type: "weapon_ranged", modType: "addFlat", value: 200},
		],
		"ice": [
			{type: "crit", modType: "addFlat", value: -20},
			{type: "armor", modType: "addFlat", value: -300},
			{type: "weapon_melee", modType: "addFlat", value: 300},
			{type: "weapon_ranged", modType: "addFlat", value: 300},
		],
		"water": [
			{type: "accuracy", modType: "addFlat", value: 30},
			{type: "evade", modType: "addFlat", value: 20},
			{type: "crit", modType: "addFlat", value: -20},
		],
		"electric": [
			{type: "crit", modType: "addFlat", value: 40},
			{type: "armor", modType: "addFlat", value: -200},
		],
		"air": [
			{type: "movement", modType: "addFlat", value: 2},
			{type: "weapon_melee", modType: "addFlat", value: -200},
			{type: "weapon_ranged", modType: "addFlat", value: -200},
		],
		"earth": [
			{type: "movement", modType: "addFlat", value: -1},
			{type: "armor", modType: "addFlat", value: 500},
		],
		"light": [
		
		],
		"dark": [
		
		]
	},
	ATTRIBUTE_DISPLAY_NAMES: {
		"fire": {name: "Fire", effects: ["Weapon Power +200", "Hit Rate -30"]},
		"ice":  {name: "Ice", effects: ["Weapon Power +300", "Crit Rate -20", "Armor -300"]},
		"water":  {name: "Water", effects: ["Accuracy +30", "Evade +20", "Crit -20"]},
		"electric":  {name: "Electric", effects: ["Crit +40", "Armor -200"]},
		"air":  {name: "Air", effects: ["Movement +2", "Weapon Power -200"]},
		"earth":  {name: "Earth", effects: ["Armor +500", "Movement -1"]},
		"light":  {name: "Light", effects: []},
		"dark":  {name: "Dark", effects: []},
	},
	EFFECTIVENESS: { //example tables
		attribute1: {	
			"fire": {
				"ice": {damage: 2, hit: 1.3},
				"water": {damage: 0.5, hit: 0.7},
			},
			"ice": {
				"air": {damage: 2, hit: 1.3},	
				"fire": {damage: 0.5, hit: 0.7},
			},
			"water": {
				"fire": {damage: 2,	 hit: 1.3},
				"electric": {damage: 0.5, hit: 0.7},
			},
			"electric": {					
				"water": {damage: 2, hit: 1.3},
				"earth": {damage: 0.5, hit: 0.7},
			},
			"air": {
				"earth": {damage: 2, hit: 1.3},	
				"ice": {damage: 0.5, hit: 0.7},
			},
			"earth": {
				"electric": {damage: 2,	 hit: 1.3},
				"air": {damage: 0.5, hit: 0.7},
			},
			"light": {
				"dark": {damage: 2}
			},
			"dark": {
				"light": {damage: 2}	
			},
		}
	},
	DISCLAIMER_TEXT: "",
	ALLY_ZONE_COUNT: 4,
	EXPIRE_ZONES_ON_DEATH: true,
	ENABLE_FAV_POINTS: true,
	FAV_POINT_ABILITIES: {
		//all ability ids are for pilot abilities
		//cost are in number of fav points
		//max 5 abilities may be defined
		"-1": [ //default if no specific abilities are defined for a pilot
			{
				id: 97,
				cost: 2
			},
			{
				id: 98,
				cost: 3
			},
			{
				id: 99,
				cost: 4
			},
			{
				id: 100,
				cost: 5
			},
			{
				id: 101,
				cost: 10
			},
		]
	},
	PRELOADER: function(){//function called on game boot, should be used to preload system assets
	
		AudioManager.loadStaticSe({name: "SRWAppear"});
		AudioManager.loadStaticSe({name: "SRWAttack"});
		AudioManager.loadStaticSe({name: "SRWDisappear"});
		AudioManager.loadStaticSe({name: "SRWDoubleImage"});
		AudioManager.loadStaticSe({name: "SRWExplosion"});
		AudioManager.loadStaticSe({name: "SRWFloat"});
		AudioManager.loadStaticSe({name: "SRWHit"});
		AudioManager.loadStaticSe({name: "SRWHit_Barrier"});
		AudioManager.loadStaticSe({name: "SRWHit_Barrier_Break"});
		AudioManager.loadStaticSe({name: "SRWHit_Crit"});
		AudioManager.loadStaticSe({name: "SRWJamming"});
		AudioManager.loadStaticSe({name: "SRWLand"});
		AudioManager.loadStaticSe({name: "SRWLevelUp"});
		AudioManager.loadStaticSe({name: "SRWMastery"});
		AudioManager.loadStaticSe({name: "SRWMiss"});
		AudioManager.loadStaticSe({name: "SRWParry"});
		AudioManager.loadStaticSe({name: "SRWPowerUp"});
		AudioManager.loadStaticSe({name: "SRWShield"});
		AudioManager.loadStaticSe({name: "SRWShootDown"});
		AudioManager.loadStaticSe({name: "SRWSubmerge"});
		AudioManager.loadStaticSe({name: "SRWTransform"});
		
		
		
		let spiritInfo = $spiritManager.getSpiritDefinitions();
		for(let spiritDef of spiritInfo){
			if(spiritDef && spiritDef.animInfo){
				AudioManager.loadStaticSe({name: spiritDef.animInfo.se});
			}
		}
		ImageManager.loadAnimation("spirits/Accel");
		ImageManager.loadAnimation("spirits/Alert");
		ImageManager.loadAnimation("spirits/Analyze");
		ImageManager.loadAnimation("spirits/Bravery");
		ImageManager.loadAnimation("spirits/Charge");
		ImageManager.loadAnimation("spirits/Daunt");
		ImageManager.loadAnimation("spirits/Drive");
		ImageManager.loadAnimation("spirits/Faith");
		ImageManager.loadAnimation("spirits/Focus");
		ImageManager.loadAnimation("spirits/Fortune");
		ImageManager.loadAnimation("spirits/Gain");
		ImageManager.loadAnimation("spirits/Guts");
		ImageManager.loadAnimation("spirits/Intuition");
		ImageManager.loadAnimation("spirits/Love");
		ImageManager.loadAnimation("spirits/Mercy");
		ImageManager.loadAnimation("spirits/Miracle");
		ImageManager.loadAnimation("spirits/Persist");
		ImageManager.loadAnimation("spirits/Prospect");
		ImageManager.loadAnimation("spirits/Resupply");
		ImageManager.loadAnimation("spirits/Snipe");
		ImageManager.loadAnimation("spirits/Soul");
		ImageManager.loadAnimation("spirits/Spirit");
		ImageManager.loadAnimation("spirits/StateUp1");
		ImageManager.loadAnimation("spirits/Strike");
		ImageManager.loadAnimation("spirits/Trust");
		ImageManager.loadAnimation("spirits/Valor");
		ImageManager.loadAnimation("spirits/Wall");
		ImageManager.loadAnimation("spirits/Zeal");
		
		ImageManager.loadAnimation("Explosion1");
		ImageManager.loadAnimation("SRWAppear");
		ImageManager.loadAnimation("SRWDisappear");
		
		ImageManager.loadBitmap("img/basic_battle/", "barrier");
		ImageManager.loadBitmap("img/basic_battle/", "damage");
		ImageManager.loadBitmap("img/basic_battle/", "destroyed");
		
		AudioManager.loadBgm({name: "SRW_Engine_1"});
	},
	GLOBAL_UNIT_MOD: function(actor){//a function that is applied to each unit when applying abilities, can return an array of stat mods like an ability effect handler
		//you can also use this function to perform hacky mods to the actor that was passed in
		
		//tip: to avoid additional overhead or to prevent a mod being applied twice use the actor's stageTemp cache to track whether a mod has been applied already
		//ex.:
		/*
		if(!$statCalc.getStageTemp(actor, "mod_applied")){
			$statCalc.setStageTemp(actor, "mod_applied", 1);
			actor.isModded = (actor.isModded || 0) + 1;
		}
		*/
		
		//example return value, optional. This example makes every unit in the game deal double the regular damage.
		//return [{type: "final_damage", modType: "mult", value: 2}];
	},
	DIFFICULTY_MODS: {
		enabled: 0,//0: off, 1: selectable, 2: enable automatic scaling with SR points, 3: enable both
		displayInMenus: true,
		autoLevelFunc: function(){
			const padding = 10; //the amount to pad the ref count to, to avoid putting the player on hard mode after doing one stage
			let awarded = 0;
			let missed = 0;
			let total = 0;
			for(let mapId in $gameSystem.awardedSRPoints){
				if($gameSystem.awardedSRPoints[mapId] != null){
					total++;
					if($gameSystem.awardedSRPoints[mapId]){
						awarded++;
					} else {
						missed++;
					}
				}
			}
			if(total < padding){
				total = padding;
			}
			const ratio = awarded / total;
			if(ratio >= 0.6){
				return 1;//hard
			}
			return 0;//normal
		},
		default: 1,//idx into levels
		levels: [
			{
				name: "Normal",
				description: "A difficulty recommended for beginner players.",
				color: "#FFFFFF",
				useOrigLevelForExp: true,
				mods: {				
					mech: {//only applied to enemy side mechs, this includes faction 3/4 units!
						"-1": {//global
							HP: -2000,
							EN: -60,
							weapon: -300,
							armor: -200,
							mobility: -20,
							accuracy: -20,
							move: -1	
						},
						"10": {
							HP: -500,
							EN: -20,
							weapon: -300,
							armor: -0,
							mobility: -20,
							accuracy: -20,
							move: -2	
						}
					},
					pilot: {//only applied to enemy side pilots
						"-1": {//global
							SP: -10,
							MP: -10,
							melee: -20,
							ranged: -20,
							skill: -10,
							defense: -30,
							evade: -30,
							hit: -20
						},
						"3": {
							SP: -15,
							MP: -15,
							melee: -25,
							ranged: -25,
							skill: -15,
							defense: -35,
							evade: -35,
							hit: -25,
							//level: 10
						}
					}
				}
			},
			{
				name: "Hard",
				description: "A difficulty recommended experienced players.",
				color: "#FF2222",
				useOrigLevelForExp: true,
				mods: {				
					mech: {//only applied to enemy side mechs, this includes faction 3/4 units!
						
					},
					pilot: {//only applied to enemy side pilots
						
					}
				}
			}
		]
	}
	/*
	//map a face file to another face file based on a deployed unit
	//used to automatically change portraits after mech transformation
	variableUnitPortraits: {
	"Original_face_name": [
		{deployedId: 56, filename: "Changed_face_name"},
	],
} */
}