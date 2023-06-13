var ENGINE_SETTINGS = {
	GAMEID: "SRWMV",
	DISABLE_TOUCH: false,
	PRELOAD_AUDIO: true,
	RPG_MAKER_INV_LIMIT: 1,
	LOCK_CAMERA_TO_CURSOR: false,
	BEFORE_BATTLE_SPIRITS: false,
	ENABLE_TWIN_SYSTEM: true,
	DISABLE_ALLY_TWINS: false,
	USE_STRICT_TWIN_SLOTS: false,
	ENABLE_TRANSFORM_ALL: false,
	TRANSFORM_ALL_EXCEPTIONS: [],
	USE_SRW_SUPPORT_ORDER: true,
	ALERT_CLEARS_ON_ATTACK: false,//if true alert clears after dodging one attack, otherwise it affects all attacks in one battle phase(support attacks, etc.)
	PERSIST_CLEARS_ON_HIT: false,//if true persist clears after taking one attack, otherwise it affects all attacks in one battle phase(support attacks, etc.)
	DISABLE_EVASION_DECAY: false,
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
	USE_TILE_PASSAGE: true,
	ENABLE_QUICK_MOVE: true,
	LEVEL_CAP: 99,
	SP_CAP: -1,
	SHOW_NEW_MOVE_INDICATOR: true,
	DEFAULT_AI_FLAGS: {
		terrain: 1,   //if 1 the unit will prefer to move onto tile that grant terrain bonuses
		formation: 1, //if 1 the unit will prefer to move adjacent to allies that provide support attack/defend
		reposition: 0, //if 1 the unit will move closer to hit enemies with stronger attacks even if they already can hit a target with a longer range attack
		preferTarget: 0,//if 1 the unit will prefer to move closer to its target unit or region even if they have other targets to attack. Target units take priority over target regions.  
	},
	AI_USES_ITEMS: true,
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
		RENDER_HEIGHT: 624
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
			0: [12000, 17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 90000, 90000, 90000, 90000, 90000]
		}
	},
	WEAPON_UPGRADE_TYPES: {
		0: [100, 100, 100, 150, 150, 150, 200, 200, 200, 250, 200, 200, 200, 200, 200],
		1: [100, 150, 150, 150, 150, 200, 200, 200, 200, 250, 200, 200, 200, 200, 200]		
	},
	ACE_REQUIREMENT: 50, //amount of kills required to unlocked the Ace Bonus
	DEFAULT_SP_REGEN: 0, //default SP regen in points of SP
	DEFAULT_HP_REGEN: 0, //default HP regen in percent of total(10,50,etc.)
	DEFAULT_EN_REGEN: 0, //default EN regen in percent of total(10,50,etc.)
	DODGE_PATTERNS: {//defines what animations should be used when performing special dodges in the basic and full battle scene
		1: {basic_anim: "double_image", full_anim: 3, full_anim_return: 4, se: "SRWDoubleImage"},
		2: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWParry"},
		3: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWJamming"},
		4: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWShootDown"},		
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
	MERGE_ATTACK_UPGRADES: false,
	ENABLE_ATTRIBUTE_SYSTEM: false,
	USE_WEAPON_ATTRIBUTE: false,
	EFFECTIVENESS: { //example tables
		attribute1: {
			"vaccine": {
				"vaccine": 1,
				"virus": 1.5,
				"data": 0.75,			
			},
			"data": {
				"vaccine": 1.5,
				"virus": 0.75,
				"data": 1,
			},
			"virus": {
				"vaccine": 0.75,
				"virus": 1,
				"data": 1.5,
			},
			"free": {
				"vaccine": 1,
				"virus": 1,
				"data": 1,
			}
		},
		attribute2: {	
			"fire": {
				"plant": 1.1,
			},
			"plant": {
				"water": 1.1,
			},
			"water": {
				"fire": 1.1,
			},
			"electric": {
				"wind": 1.1,
			},
			"wind": {
				"earth": 1.1,
			},
			"earth": {
				"electric": 1.1,
			},
			"light": {
				"dark": 1.1,
			},
			"dark": {
				"light": 1.1,
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
	}
}