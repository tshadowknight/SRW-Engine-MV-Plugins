$SRWConfig.customSpecialEvasionActivationCheckers = {
	"complex_shoot_down": function(level, attacker, defender){
		const activationChances = [
			0.10,
			0.20,
			0.30,
			0.40,
			0.50,
			0.60,
			0.70,
			0.80,
			0.90
		];
		
		let bounces = false;
		var aSkill = $statCalc.getPilotStat(attacker.actor, "skill");
		var dSkill = $statCalc.getPilotStat(defender.actor, "skill");	
		
		if(dSkill > aSkill){
			bounces = true;
		}		
		
		if(Math.random() > activationChances[level-1]){
			bounces = false;
		}
		
		return bounces;		
	}	
}


$SRWConfig.pilotAbilties = function(){
	this.addDefinition(
		0, 
		"Attacker", 
		"Final damage times 1.2 at 130 Will or higher.", 
		false,
		true,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		},
	);
	this.addDefinition(
		1, 
		"Guard", 
		"Reduces damage taken by 20% at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [{type: "final_defend", modType: "mult", value: 0.8}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[150],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		},
	);
	this.addDefinition(
		2, 
		"In-Fight", 
		"Melee Damage and Movement Range increase with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "weapon_melee", modType: "addFlat", value: 50}], //1
				[{type: "weapon_melee", modType: "addFlat", value: 100}], //2
				[{type: "weapon_melee", modType: "addFlat", value: 150}], //3
				[{type: "weapon_melee", modType: "addFlat", value: 150}, {type: "movement", modType: "addFlat", value: 1}], //4
				[{type: "weapon_melee", modType: "addFlat", value: 200}, {type: "movement", modType: "addFlat", value: 1}], //5
				[{type: "weapon_melee", modType: "addFlat", value: 250}, {type: "movement", modType: "addFlat", value: 1}], //6
				[{type: "weapon_melee", modType: "addFlat", value: 250}, {type: "movement", modType: "addFlat", value: 2}], //7
				[{type: "weapon_melee", modType: "addFlat", value: 300}, {type: "movement", modType: "addFlat", value: 2}], //8
				[{type: "weapon_melee", modType: "addFlat", value: 350}, {type: "movement", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		9
	);
	this.addDefinition(
		3, 
		"Gunfight", 
		"Ranged Damage and Range increase with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "weapon_ranged", modType: "addFlat", value: 50}], //1
				[{type: "weapon_ranged", modType: "addFlat", value: 100}], //2
				[{type: "weapon_ranged", modType: "addFlat", value: 150}], //3
				[{type: "weapon_ranged", modType: "addFlat", value: 150}, {type: "range", modType: "addFlat", value: 1}], //4
				[{type: "weapon_ranged", modType: "addFlat", value: 200}, {type: "range", modType: "addFlat", value: 1}], //5
				[{type: "weapon_ranged", modType: "addFlat", value: 250}, {type: "range", modType: "addFlat", value: 1}], //6
				[{type: "weapon_ranged", modType: "addFlat", value: 250}, {type: "range", modType: "addFlat", value: 2}], //7
				[{type: "weapon_ranged", modType: "addFlat", value: 300}, {type: "range", modType: "addFlat", value: 2}], //8
				[{type: "weapon_ranged", modType: "addFlat", value: 350}, {type: "range", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		9
	);
	this.addDefinition(
		4, 
		"Prevail", 
		"Hit, Evade, Armor and Critical go up as HP decreases.", 
		true,
		false,
		function(actor, level){
			var mechStats = $statCalc.getCalculatedMechStats(actor);		
			var targetSlice = Math.floor(mechStats.currentHP / mechStats.maxHP * 10);
			var hitEvadeMod = (level - targetSlice) * 0.05;
			if(hitEvadeMod < 0){
				hitEvadeMod = 0;
			}
			var armorMod = (level - targetSlice) * 0.1;
			if(armorMod < 0){
				armorMod = 0;
			}
			var critMod = (level - targetSlice) * 0.08;
			if(critMod < 0){
				critMod = 0;
			}
			var ownId = $pilotAbilityManager.getIdPrefix()+"_"+4;
			var excludedSkills = {};
			excludedSkills[ownId] = true;
			var prevailBoost = 1 + ($statCalc.applyStatModsToValue(actor, 0, ["prevail_boost"], excludedSkills) / 100);
			
			return [
				{type: "hit", modType: "addFlat", value: hitEvadeMod * prevailBoost * 100},
				{type: "evade", modType: "addFlat", value: hitEvadeMod * prevailBoost * 100},
				{type: "armor", modType: "addPercent", value: armorMod * prevailBoost},
				{type: "crit", modType: "addFlat", value: critMod * prevailBoost * 100},
			];
		},
		function(actor, level){
			var mechStats = $statCalc.getCalculatedMechStats(actor);	
			var targetSlice = Math.floor(mechStats.currentHP / mechStats.maxHP * 10);
			return (targetSlice + 1) <= level;
		},
		[20,30,40,50,60,70,80,90,100],
		9,
		function(actor, level){
			var mechStats = $statCalc.getCalculatedMechStats(actor);	
			var targetSlice = Math.floor(mechStats.currentHP / mechStats.maxHP * 10);
			return (targetSlice + 1) <= level ? "on" : "off";
		},
	);
	this.addDefinition(
		5, 
		"Attuned", 
		"Hit, Evade, Armor and Critical go up with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "hit", modType: "addFlat", value: 0},{type: "evade", modType: "addFlat", value: 0},{type: "armor", modType: "addFlat", value: 0},{type: "crit", modType: "addFlat", value: 0}], //1
				[{type: "hit", modType: "addFlat", value: 2},{type: "evade", modType: "addFlat", value: 2},{type: "armor", modType: "addFlat", value: 0},{type: "crit", modType: "addFlat", value: 1}], //2
				[{type: "hit", modType: "addFlat", value: 4},{type: "evade", modType: "addFlat", value: 4},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 3}], //3
				[{type: "hit", modType: "addFlat", value: 6},{type: "evade", modType: "addFlat", value: 6},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 5}], //4
				[{type: "hit", modType: "addFlat", value: 8},{type: "evade", modType: "addFlat", value: 8},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 7}], //5
				[{type: "hit", modType: "addFlat", value: 10},{type: "evade", modType: "addFlat", value: 10},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 9}], //6
				[{type: "hit", modType: "addFlat", value: 12},{type: "evade", modType: "addFlat", value: 12},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 11}], //7
				[{type: "hit", modType: "addFlat", value: 14},{type: "evade", modType: "addFlat", value: 14},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 13}], //8
				[{type: "hit", modType: "addFlat", value: 16},{type: "evade", modType: "addFlat", value: 16},{type: "armor", modType: "addFlat", value: 300},{type: "crit", modType: "addFlat", value: 15}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}	
		},
		function(actor, level){
			return level > 1;
		},
		[0],
		9
	);
	this.addDefinition(
		6, 
		"SP Regen", 
		"Recover 10 SP at the start of the turn.", 
		false,
		true,
		function(actor, level){
			return [{type: "SP_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		7, 
		"Genius", 
		"+20 to Hit/Evade/Critical.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 20},
				{type: "evade", modType: "addFlat", value: 20},
				{type: "crit", modType: "addFlat", value: 20},
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		8, 
		"Supreme", 
		"+30 to Hit/Evade/Critical.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 30},
				{type: "evade", modType: "addFlat", value: 30},
				{type: "crit", modType: "addFlat", value: 30},
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		9, 
		"Magician", 
		"Hit, Evade, and Range go up with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "hit", modType: "addFlat", value: 0},{type: "evade", modType: "addFlat", value: 0},{type: "range", modType: "addFlat", value: 0}], //1
				[{type: "hit", modType: "addFlat", value: 5},{type: "evade", modType: "addFlat", value: 5},{type: "range", modType: "addFlat", value: 0}], //2
				[{type: "hit", modType: "addFlat", value: 10},{type: "evade", modType: "addFlat", value: 10},{type: "range", modType: "addFlat", value: 0}], //3
				[{type: "hit", modType: "addFlat", value: 15},{type: "evade", modType: "addFlat", value: 15},{type: "range", modType: "addFlat", value: 0}], //4
				[{type: "hit", modType: "addFlat", value: 20},{type: "evade", modType: "addFlat", value: 20},{type: "range", modType: "addFlat", value: 0}], //5
				[{type: "hit", modType: "addFlat", value: 25},{type: "evade", modType: "addFlat", value: 25},{type: "range", modType: "addFlat", value: 0}], //6
				[{type: "hit", modType: "addFlat", value: 25},{type: "evade", modType: "addFlat", value: 25},{type: "range", modType: "addFlat", value: 1}], //7
				[{type: "hit", modType: "addFlat", value: 30},{type: "evade", modType: "addFlat", value: 30},{type: "range", modType: "addFlat", value: 1}], //8
				[{type: "hit", modType: "addFlat", value: 30},{type: "evade", modType: "addFlat", value: 30},{type: "range", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}	
		},
		function(actor, level){
			return level > 1;
		},
		[0],
		9
	);
	this.addDefinition(
		10, 
		"Fortune", 
		"Fund gain is increased by 20% when defeating an enemy.", 
		false,
		true,
		function(actor, level){
			return [{type: "fund_gain_destroy", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		11, 
		"Support Attack", 
		"Allows the unit to perform a support attack up to Level times per turn.", 
		true,
		false,
		function(actor, level){
			return [{type: "support_attack", modType: "addFlat", value: level}];
		},
		function(actor, level){
			return true;
		},
		[100,120,140,160],
		4
	);
	this.addDefinition(
		12, 
		"Support Defend", 
		"Allows the unit to provide defend support up to Level times per turn.", 
		true,
		false,
		function(actor, level){
			return [{type: "support_defend", modType: "addFlat", value: level}];
		},
		function(actor, level){
			return true;
		},
		[100,120,140,160],
		4
	);
	this.addDefinition(
		13, 
		"Meditate", 
		"Reduce SP costs by 20%.", 
		false,
		false,
		function(actor, level){
			return [{type: "sp_cost", modType: "mult", value: 0.8}];
		},
		function(actor, level){
			return true;
		},
		[350],
		1
	);
	this.addDefinition(
		14, 
		"SP Up", 
		"Increases max SP by 5 for each Level.", 
		true,
		false,
		function(actor, level){
			return [{type: "sp", modType: "addFlat", value: level * 5}];
		},
		function(actor, level){
			return true;
		},
		[60,70,80,90,100,110,120,130,140],
		9
	);
	this.addDefinition(
		15, 
		"Will Limit Break", 
		"Increases max Will by 20.", 
		false,
		false,
		function(actor, level){
			return [{type: "max_will", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		},
		[250],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) > 150 ? "on" : "";
		}
	);
	this.addDefinition(
		16, 
		"Continuous Action", 
		"If Will is above 120 the unit can move one additional time per turn if they destroyed a target.", 
		false,
		false,
		function(actor, level){
			return [{type: "continuous_action", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120;
		},
		[380],
		1
	);
	this.addDefinition(
		17, 
		"Counter", 
		"The unit may attack first during the enemy phase. Chance depends on level.", 
		true,
		false,
		function(actor, level){
			return [{type: "counter_rate", modType: "addFlat", value: level/10}];
		},
		function(actor, level){
			return true;
		},
		[20,30,40,50,60,70,80,90,100],
		9
	);
	this.addDefinition(
		18, 
		"E Save", 
		"EN Costs are reduced by 30%.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_cost", modType: "mult", value: 0.7}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		19, 
		"B Save", 
		"Ammo +50%.", 
		false,
		false,
		function(actor, level){
			return [{type: "ammo", modType: "mult_ceil", value: 1.5}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		20, 
		"EXP Up", 
		"EXP gain +20%.", 
		false,
		false,
		function(actor, level){
			return [{type: "exp", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[180],
		1
	);
	this.addDefinition(
		21, 
		"Revenge", 
		"Deal 1.2 times damage when counter attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "revenge", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[300],
		1
	);
	this.addDefinition(
		22, 
		"Instinct", 
		"+10% to Hit and Evasion at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [{type: "evade", modType: "addFlat", value: 10}, {type: "hit", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[150],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		},
	);
	this.addDefinition(
		23, 
		"Dash", 
		"Movement +1.", 
		false,
		false,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[250],
		1
	);
	this.addDefinition(
		24, 
		"Ignore Size", 
		"Ignore negative effects of the target's size when attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "ignore_size", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		25, 
		"Hit & Away", 
		"The unit can move after attacking if they did not move yet.", 
		false,
		false,
		function(actor, level){
			return [{type: "hit_and_away", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		26, 
		"Heal", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		27, 
		"Resupply", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		28, 
		"Resolve", 
		"+5 Will at the start of the map.", 
		false,
		false,
		function(actor, level){
			return [{type: "start_will", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1

	);
	this.addDefinition(
		29, 
		"Morale", 
		"+2 Will at the start of each turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "start_turn_will", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1
	);
	this.addDefinition(
		30, 
		"Will+ Evade", 
		"+1 Will after evading an enemy attack.", 
		false,
		false,
		function(actor, level){
			return [{type: "evade_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		31, 
		"Will+ Damage", 
		"+2 Will after taking damage.", 
		false,
		false,
		function(actor, level){
			return [{type: "damage_will", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		32, 
		"Will+ Hit", 
		"+1 Will after hitting an enemy.", 
		false,
		false,
		function(actor, level){
			return [{type: "hit_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		33, 
		"Will+ Destroy", 
		"+1 Will after an enemy is destroyed.", 
		false,
		false,
		function(actor, level){
			return [{type: "destroy_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1
	);
	this.addDefinition(
		34, 
		"Great Wall", 
		"When casting Wall, Drive is also cast.", 
		false,
		true,
		function(actor, level){
			return [{type: "great_wall", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
	this.addDefinition(
		35, 
		"Carrot Fling", 
		"This unit can use resupply on any ally regardless of distance. This unit can use resupply on themself.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "all_range_resupply", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
	this.addDefinition(
		36, 
		"Auto-Wall", 
		"Automatically cast Wall at the start of the turn when above 140 Will.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 22}
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && $statCalc.getCurrentWill(actor) >= 140;
		},
		[0],
		1
	);
	this.addDefinition(
		37, 
		"FBK FBK FBK", 
		"When adjacent to Fubuki: Evasion +30%, Crit Rate +30%.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "evade", modType: "addFlat", value: 30},
				{type: "crit", modType: "addFlat", value: 30},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && $statCalc.isAdjacentTo(actor.isActor() ? "actor" : "enemy", actor, 12);
		},
		[0],
		1
	);
	this.addDefinition(
		38, 
		"Caring Meme Queen", 
		"Take 20% less damage when support defending. +5 SP recovered at the start of the turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "support_defend_armor", modType: "addFlat", value: 20},
				{type: "SP_regen", modType: "addFlat", value: 5},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
	this.addDefinition(
		39, 
		"Parry", 
		"When triggered, negates damage from physical weapons. The chance to trigger increases with the skill's level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.05, dodgePattern: 2}], //1
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.10, dodgePattern: 2}], //2
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.15, dodgePattern: 2}], //3
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.20, dodgePattern: 2}], //4
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.25, dodgePattern: 2}], //5
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.30, dodgePattern: 2}], //6
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.35, dodgePattern: 2}], //7
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.40, dodgePattern: 2}], //8
				[{type: "special_evade", subType: "physical", activation: "random", name: "PARRY", value: 0.45, dodgePattern: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		40, 
		"Shoot Down", 
		"Allows the pilot to deflect funnel and missile attacks. Activation depends on Skill stat difference with the enemy.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "special_evade", subType: "missile", activation: "skill", name: "SHOOT DOWN", dodgePattern: 4},{type: "special_evade", subType: "funnel", activation: "skill", name: "SHOOT DOWN", dodgePattern: 4}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		41, 
		"Attack Again", 
		"Allows the pilot to provide a support attack for themself if their Skill stat is atleast 20 points higher than the opponent's.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "attack_again", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		42, 
		"Double Action", 
		"Allows the pilot an additional action each turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		43, 
		"Triple Action", 
		"Allows the pilot two additional actions each turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 2}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		44, 
		"Commander", 
		"Grants a boost to evasion and accuracy to adjacent allies. Range and effectiveness depend on the skill level.", 
		true,
		true,
		function(actor, level){
			var effects = [
				[//level 1
					{type: "hit", modType: "addFlat", value: 10, range: 1},{type: "evade", modType: "addFlat", value: 10, range: 1},
					{type: "hit", modType: "addFlat", value: 8, range: 2},{type: "evade", modType: "addFlat", value: 8, range: 2},
				],
				[//level 2
					{type: "hit", modType: "addFlat", value: 15, range: 1},{type: "evade", modType: "addFlat", value: 15, range: 1},
					{type: "hit", modType: "addFlat", value: 12, range: 2},{type: "evade", modType: "addFlat", value: 12, range: 2},
					{type: "hit", modType: "addFlat", value: 8, range: 3},{type: "evade", modType: "addFlat", value: 8, range: 3},
				],
				[//level 3
					{type: "hit", modType: "addFlat", value: 20, range: 1},{type: "evade", modType: "addFlat", value: 20, range: 1},
					{type: "hit", modType: "addFlat", value: 16, range: 2},{type: "evade", modType: "addFlat", value: 16, range: 2},
					{type: "hit", modType: "addFlat", value: 12, range: 3},{type: "evade", modType: "addFlat", value: 12, range: 3},
					{type: "hit", modType: "addFlat", value: 8, range: 4},{type: "evade", modType: "addFlat", value: 8, range: 4},
				],
				[//level 4
					{type: "hit", modType: "addFlat", value: 25, range: 1},{type: "evade", modType: "addFlat", value: 25, range: 1},
					{type: "hit", modType: "addFlat", value: 20, range: 2},{type: "evade", modType: "addFlat", value: 20, range: 2},
					{type: "hit", modType: "addFlat", value: 15, range: 3},{type: "evade", modType: "addFlat", value: 15, range: 3},
					{type: "hit", modType: "addFlat", value: 10, range: 4},{type: "evade", modType: "addFlat", value: 10, range: 4},
					{type: "hit", modType: "addFlat", value: 5, range: 5},{type: "evade", modType: "addFlat", value: 5, range: 5},
				],
			];
			
			return effects[level-1];
		},
		function(actor, level){
			return true;
		},
		[0],//cost
		4,//max level
		null,//ability highlighting function, unused for this ability
		function(actor, level){//function that determines the range of the ability depending on level
			return {min: 1, max: 5, targets: "own", targetsBothTwins: true} 
		},
		true //do not allow stacking
	);
	
	this.addDefinition(
		45, 
		"Pavise", 
		"At 130+ Will, 50% chance to reduce damage taken from Melee weapons by 50%.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "percent_barrier", subType: "melee", value: 0.5, cost: 0, success_rate: 0.5}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		46, 
		"Aegis", 
		"At 130+ Will, 50% chance to reduce damage taken from Ranged weapons by 50%.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "percent_barrier", subType: "ranged", value: 0.5, cost: 0, success_rate: 0.5}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		47, 
		"Wrath", 
		"At 130+ Will, +50 to Crit.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "crit", modType: "addFlat", value: 50}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		48, 
		"Melee Mastery", 
		"At 120+ Will, +500 damage for Melee weapons.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "weapon_melee", modType: "addFlat", value: 500}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		49, 
		"Ranged Mastery", 
		"At 120+ Will, +500 damage for Ranged weapons.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "weapon_ranged", modType: "addFlat", value: 500}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120 ? "on" : "off";
		}
	);
		
	this.addDefinition(
		50, 
		"Death blow", 
		"+15 to pilot's Melee/Ranged stat when attacking.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "stat_ranged_init", modType: "addFlat", value: 15},{type: "stat_melee_init", modType: "addFlat", value: 15}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4,
		null
	);
	
	this.addDefinition(
		51, 
		"Armored blow", 
		"+15 to pilot's Defense stat when attacking.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "stat_defense_init", modType: "addFlat", value: 15}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		52, 
		"Certain blow", 
		"+15 to pilot's Hit stat when attacking.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "stat_hit_init", modType: "addFlat", value: 15}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		53, 
		"Duelist's blow", 
		"+15 to pilot's Evade stat when attacking.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "stat_evade_init", modType: "addFlat", value: 15}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		54, 
		"Vengeance", 
		"Unit deals additional damage equal to 100% of unit's missing HP.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "vengeance", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		55, 
		"Luna", 
		"At 140+ Will, attacks ignore enemy Armor.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "ignore_armor", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 140;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 140 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		56, 
		"Sol", 
		"At 130+ Will, attacks recover 30% of damage dealt as HP.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hp_drain", modType: "addFlat", value: 0.3}
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		4,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		}
	);
	
	this.addDefinition(
		57, 
		"Wary Fighter", 
		"Unit and target cannot receive offensive/defensive support.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "disable_support", modType: "addFlat", value: 1}, {type: "disable_target_support", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		58, 
		"Auto Spirit Sample", 
		"An example ability for auto spirits.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 22}, //wall
				{type: "auto_spirit", modType: "addFlat", value: 36}, //fury
				{type: "auto_spirit", modType: "addFlat", value: 34}, //enable
				{type: "auto_spirit", modType: "addFlat", value: 15}, //trust
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
	
	this.addDefinition(
		59, 
		"Pressure", 
		"Increases damage dealt to and reduces damage taken from opponents within range whose SKL stats are lower. Effective range is twice the skill level. More effective at higher skill levels.", 
		true,
		true,
		function(actor, level){
			var effects = [
				[//level 1
					{type: "final_damage", modType: "mult", value: 0.95}, {type: "final_defend", modType: "mult", value: 0.95},				
				],
				[//level 2
					{type: "final_damage", modType: "mult", value: 0.90}, {type: "final_defend", modType: "mult", value: 0.90},		
				],
				[//level 3
					{type: "final_damage", modType: "mult", value: 0.85}, {type: "final_defend", modType: "mult", value: 0.85},
				],
				[//level 4
					{type: "final_damage", modType: "mult", value: 0.80}, {type: "final_defend", modType: "mult", value: 0.80},
				],
			];			
			return effects[level-1];		
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				var ownPilotStats = $statCalc.getCalculatedPilotStats(combatInfo.self);
				var otherPilotStats = $statCalc.getCalculatedPilotStats(combatInfo.other);
				return ownPilotStats.skill > otherPilotStats.skill;
			} else {
				return false;
			}
		},
		[0],
		4,
		null,
		function(actor, level){			
			return {min: 1, max: (level*1 + 1) * 2, targets: "other"}
		}	
	);
	
	this.addDefinition(
		60, 
		"Ace 1", 
		"Final damage times 1.2 at 130 Will or higher.", 
		false,
		true,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 && $statCalc.isAce(actor);
		},
		[0],
		1,
	);
	
	this.addDefinition(
		61, 
		"Ace 2", 
		"Automatically cast Persist at the start of the player turn at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 27}, //persist
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 && $statCalc.isAce(actor);
		},
		[0],
		4
	);
	
	this.addDefinition(
		62, 
		"Ace 3", 
		"Automatically cast Intuition at the start of the player turn at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 20}, //Intuition
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 && $statCalc.isAce(actor);
		},
		[0],
		4
	);
	
	this.addDefinition(
		63, 
		"Ace 4", 
		"Automatically cast Miracle at the start of the player turn at 150 Will or higher once per stage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 33}, //Miracle
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 150 && $statCalc.isAce(actor) && !$statCalc.getUsedCount(actor, "auto_spirit_pilot_63");
		},
		[0],
		4
	);
	
	this.addDefinition(
		64, 
		"Ace 5", 
		"20% less damage taken when support defending, 20% more damage dealt when support attacking.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "support_defend_armor", modType: "addFlat", value: 20},
				{type: "support_attack_buff", modType: "addFlat", value: 20},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		4
	);
	
	this.addDefinition(
		65, 
		"Ace 6", 
		"Survive a lethal hit up to once per stage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "one_time_miracle", modType: "addFlat", value: 1},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && !$statCalc.getUsedCount(actor, "one_time_miracle");
		},
		[0],
		4
	);
	
	this.addDefinition(
		66, 
		"Ace 7", 
		"Inflict 30% more damage to targets affected by analyse.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "final_damage", modType: "mult", value: 1.3},
			];
		},
		function(actor, level){
			var isValid = false;
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){				
				isValid = $statCalc.getActiveSpirits(combatInfo.other).analyse;
			} else {
				return false;
			}				
			return $statCalc.isAce(actor) && isValid;
		},
		[0],
		4
	);
	this.addDefinition(
		67, 
		"Ace 8", 
		"Automatically cast Charge and Fury at the start of the player turn at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "auto_spirit", modType: "addFlat", value: 23}, //charge
				{type: "auto_spirit", modType: "addFlat", value: 36}, //fury
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 && $statCalc.isAce(actor);
		},
		[0],
		4
	);
	
	this.addDefinition(
		68, 
		"Ace 9", 
		"All attacks inflict Will Down when damaging the target.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_will_down", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		4
	);	
	
	this.addDefinition(
		69, 
		"Ace 10", 
		"Final damage times 1.3 when Snipe is active.", 
		false,
		false,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.3}];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && $statCalc.getActiveSpirits(actor).snipe;
		},
		[0],
		4
	);	
	
	this.addDefinition(
		70, 
		"Dominance", 
		"Damage against enemies with less Will +10%.", 
		false,
		false,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.1}];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				return $statCalc.getCurrentWill(combatInfo.self) > $statCalc.getCurrentWill(combatInfo.other);
			} else {
				return false;
			}
		},
		[0],
		4
	);	
	
	this.addDefinition(
		71, 
		"Soul Absorption", 
		"Unit heals 100% of damage dealt.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hp_drain", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4,
	);
	
	this.addDefinition(
		72, 
		"Survival Instincts", 
		"Gain an extra action after taking 15000 or more damage in one hit.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "extra_action_on_damage", modType: "addFlat", value: 15000}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4,
	);
	
	this.addDefinition(
		73, 
		"Aim for the Heart", 
		"Ranged attacks against enemies not at full HP do 80% more damage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "final_damage", modType: "mult", value: 1.8}
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				if(combatInfo.self_action.type == "attack" && combatInfo.self_action.attack){
					if(combatInfo.self_action.attack.type == "R"){
						var mechStats = $statCalc.getCalculatedMechStats(combatInfo.other);
						if(mechStats.currentHP < mechStats.maxHP){
							return true;
						}
					}
				}
			} 
			return false;			
		},
		[0],
		4,
	);
	
	this.addDefinition(
		74, 
		"Guillotine", 
		"Melee attacks against enemies not at full HP do 80% more damage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "final_damage", modType: "mult", value: 1.8}
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				if(combatInfo.self_action.type == "attack" && combatInfo.self_action.attack){
					if(combatInfo.self_action.attack.type == "M"){
						var mechStats = $statCalc.getCalculatedMechStats(combatInfo.other);
						if(mechStats.currentHP < mechStats.maxHP){
							return true;
						}
					}
				}
			} 
			return false;			
		},
		[0],
		4,
	);
	
	this.addDefinition(
		75, 
		"Executioner", 
		"+50% Hit and Crit rate against enemies below 50% HP.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 50},
				{type: "crit", modType: "addFlat", value: 50},
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){									
				var mechStats = $statCalc.getCalculatedMechStats(combatInfo.other);
				if(mechStats.currentHP < mechStats.maxHP / 2){
					return true;
				}					
			} 
			return false;			
		},
		[0],
		4,
	);
	
	this.addDefinition(
		76, 
		"Brazen Spirit", 
		"Prevail bonuses 50% more effective. Unit takes 20% more damage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "final_defend", modType: "addFlat", value: 0.8},
				{type: "prevail_boost", modType: "addFlat", value: 50},
			];
		},
		function(actor, level){
			return true;		
		},
		[0],
		4,
	);
	
	this.addDefinition(
		77, 
		"Supreme Accuracy", 
		"Hit rate can exceed 100%. Excess hit rate increases damage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hit_cap_break", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;		
		},
		[0],
		4,
	);
	
	this.addDefinition(
		78, 
		"Summon Illusion",
		"Summon a ghostly copy of an enemy to fight on your side.",
		false,
		false,
		function(actor, level){
			return [
				{type: "ability_command", cmdId: 1},				
			];
		},
		function(actor, level){
			return true;		
		}
	);	
	
	this.addDefinition(
		79, 
		"Full Block",
		"Prevents all status conditions.", //not bypassed by Fury
		false,
		false,
		function(actor, level){
			return [
				{type: "status_resistance", modType: "addFlat", value: 2},				
			];
		},
		function(actor, level){
			return true;		
		}
	);

	this.addDefinition(
		80, 
		"Full Block",
		"Prevents all status conditions.<br>If Fury is active for the attacker, status conditions can be applied.", //bypassed by Fury
		false,
		false,
		function(actor, level){
			return [
				{type: "status_resistance", modType: "addFlat", value: 1},				
			];
		},
		function(actor, level){
			return true;		
		}
	);	
	
	this.addDefinition(
		81, 
		"Double Action+", 
		"Allows the pilot an additional action each turn. In effect even if the holder is a subpilot.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1,
		null,//ability highlighting function, unused for this ability
		function(actor, level){//function that determines the range of the ability depending on level
			return {min: 0, max: 0, targets: "own", affectsMainPilot: true} 
		},
		true //do not allow stacking
	);
	
	this.addDefinition(
		82, 
		"Heal+", 
		"The unit can heal an adjacent Unit. In effect even if the holder is a subpilot.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1,
		null,//ability highlighting function, unused for this ability
		function(actor, level){//function that determines the range of the ability depending on level
			return {min: 0, max: 0, targets: "own", affectsMainPilot: true} 
		},
		true //do not allow stacking
	);
	
	this.addDefinition(
		83, 
		"Surging Force", 
		"Pilot stats increase as Will goes up.", 
		false,
		true,
		function(actor, level){
			var increase = Math.floor(Math.max(0, ($statCalc.getCurrentWill(actor) - 100)) / 3);
			return [
				{type: "stat_melee", modType: "addFlat", value: increase},
				{type: "stat_ranged", modType: "addFlat", value: increase},
				{type: "stat_evade", modType: "addFlat", value: increase},
				{type: "stat_defense", modType: "addFlat", value: increase},
				{type: "stat_hit", modType: "addFlat", value: increase},
				{type: "stat_skill", modType: "addFlat", value: increase},
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) > 100 ? "on" : "off";
		},//ability highlighting function, unused for this ability
	);
	
	this.addDefinition(
		84, 
		"Missile Mastery", 
		"Missile based weapons do 10% more damage.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "final_damage", modType: "mult", value: 1.1}
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				if(combatInfo.self_action.type == "attack" && combatInfo.self_action.attack){
					if(combatInfo.self_action.attack.particleType == "test1"){
						return true;
					}
				}
			} 
			return false;			
		},
		[0],
		4,
	);
	
	this.addDefinition(
		85, 
		"Cheaper Spirit", 
		"This a sample ability that makes a spirit command cheaper for the pilot.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "spirit_cost", spirit_id: 22, cost: 15}//33 = Wall
			];
		},
		function(actor, level){
			return true;	
		},
		[0],
		4,
	);
	
	this.addDefinition(
		86, 
		"Spirit Upgrade", 
		"This a sample ability that replaces a spirit command for the pilot.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "spirit_upgrade", spirit_id: 22, new_id: 30}//33 = Wall, 30 = Bravery
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		4,
	);
	
	this.addDefinition(
		87, 
		"Tag Example Mech", 
		"This a sample ability that shows how to apply abilities based on tags of the target mech. It adds 20% hit rate when attacking a real type.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 20},
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				var tags = $statCalc.getMechTags(combatInfo.other);
				return !!tags["real"];
			} else {
				return false;
			}
		},
		[0],
		4,
	);
	
	this.addDefinition(
		88, 
		"Tag Example Pilot", 
		"This a sample ability that shows how to apply abilities based on tags of the target pilot. It adds 20% hit rate when attacking a newtype.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 20},
			];
		},
		function(actor, level){
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){
				var tags = $statCalc.getPilotTags(combatInfo.other);
				return !!tags["newtype"];
			} else {
				return false;
			}
		},
		[0],
		4,
	);
	
	this.addDefinition(
		89, 
		"Turn stacking example", 
		"This a sample ability that shows how to have an ability that grows stronger with passing turns.", 
		false,
		false,
		function(actor, level){
			var activationTurn = $statCalc.getStageTemp(actor, "Ability89StartTurn");
			var gameTurn = $gameVariables.value(_turnCountVariable);
			if(activationTurn == null){
				$statCalc.setStageTemp(actor, "Ability89StartTurn", gameTurn);
				activationTurn = gameTurn;
			}			
			
			var currentTurn = gameTurn - activationTurn;
			
			if(currentTurn == 0){
				return [
					{type: "hit", modType: "addFlat", value: 20},
				]; 
			} else if(currentTurn == 1){
				return [
					{type: "hit", modType: "addFlat", value: 30},
				];
			} else if(currentTurn >= 2){
				return [
					{type: "hit", modType: "addFlat", value: 40},
				];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		4,
	);
	
	this.addDefinition(
        90, 
        "Weapon Commander", 
        "Grants a boost to weapon power to adjacent allies. Range and effectiveness increase with skill level.", 
        true,
        true,
        function(actor, level){
            var effects = [
                [//level 1
                    {type: "weapon_melee", modType: "addFlat", value: 100, range: 1},{type: "weapon_ranged", modType: "addFlat", value: 100, range: 1},
                    {type: "weapon_melee", modType: "addFlat", value: 50, range: 2},{type: "weapon_ranged", modType: "addFlat", value: 50, range: 2},
					{type: "visible_range", modType: "addFlat", range: 1, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 2, color: "#00EE00"},
                ],
                [//level 2
                    {type: "weapon_melee", modType: "addFlat", value: 150, range: 1},{type: "weapon_ranged", modType: "addFlat", value: 150, range: 1},
                    {type: "weapon_melee", modType: "addFlat", value: 100, range: 2},{type: "weapon_ranged", modType: "addFlat", value: 100, range: 2},
                    {type: "weapon_melee", modType: "addFlat", value: 50, range: 3},{type: "weapon_ranged", modType: "addFlat", value: 50, range: 3},
					{type: "visible_range", modType: "addFlat", range: 1, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 2, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 3, color: "#00EE00"},
			
                ],
                [//level 3
                    {type: "weapon_melee", modType: "addFlat", value: 200, range: 1},{type: "weapon_ranged", modType: "addFlat", value: 200, range: 1},
                    {type: "weapon_melee", modType: "addFlat", value: 150, range: 2},{type: "weapon_ranged", modType: "addFlat", value: 150, range: 2},
                    {type: "weapon_melee", modType: "addFlat", value: 100, range: 3},{type: "weapon_ranged", modType: "addFlat", value: 100, range: 3},
                    {type: "weapon_melee", modType: "addFlat", value: 50, range: 4},{type: "weapon_ranged", modType: "addFlat", value: 50, range: 4},
					{type: "visible_range", modType: "addFlat", range: 1, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 2, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 3, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 4, color: "#00EE00"},
                ],
                [//level 4
                    {type: "weapon_melee", modType: "addFlat", value: 250, range: 1},{type: "weapon_ranged", modType: "addFlat", value: 250, range: 1},
                    {type: "weapon_melee", modType: "addFlat", value: 200, range: 2},{type: "weapon_ranged", modType: "addFlat", value: 200, range: 2},
                    {type: "weapon_melee", modType: "addFlat", value: 150, range: 3},{type: "weapon_ranged", modType: "addFlat", value: 150, range: 3},
                    {type: "weapon_melee", modType: "addFlat", value: 100, range: 4},{type: "weapon_ranged", modType: "addFlat", value: 100, range: 4},
                    {type: "weapon_melee", modType: "addFlat", value: 50, range: 5},{type: "weapon_ranged", modType: "addFlat", value: 50, range: 5},
					{type: "visible_range", modType: "addFlat", range: 1, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 2, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 3, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 4, color: "#00EE00"},
					{type: "visible_range", modType: "addFlat", range: 5, color: "#00EE00"},
                ],
            ];
            
            return effects[level-1];
        },
        function(actor, level){
            return true;
        },
        [0],//cost
        4,//max level
        null,//ability highlighting function, unused for this ability
        function(actor, level){//function that determines the range of the ability depending on level
            return {min: 1, max: 5, targets: "own", targetsBothTwins: true} 
        },
        true //do not allow stacking
    );
	
	this.addDefinition(
		91, 
		"Terrain Adept", 
		"Any negative terrain effects become positive instead.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "terrain_adept", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;	
		},
		[0],
		4,
	);
	
	this.addDefinition(
		92, 
		"Terrain Master", 
		"The effects of terrain are doubled.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "terrain_master", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;	
		},
		[0],
		4,
	);
	
	this.addDefinition(
		93, 
		"Test Zone Activation",
		"Test Zone Activation.",
		false,
		false,
		function(actor, level){
			return [
				{type: "ability_command", cmdId: 3},				
			];
		},
		function(actor, level){
			return true;		
		}
	);	
	
	this.addDefinition(
		94, 
		"Test Activation Animation",
		"This ability does nothing but play an animation when it becomes active.",
		false,
		false,
		function(actor, level){
			return [
				{type: "activation_animation", animationId: 48},				
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		},
	);
	
	this.addDefinition(
		95, 
		"Test Activation Animation 2",
		"This ability does nothing but play an animation when it becomes active.",
		false,
		false,
		function(actor, level){
			return [
				{type: "activation_animation", animationId: 51},				
			];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		1,
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		},
	);
	
	this.addDefinition(
		96, 
		"Chalice",
		"Recover HP and EN to full up to twice per stage.",
		false,
		false,
		function(actor, level){
			return [
				{type: "ability_command", cmdId: 0},				
			];
		},
		function(actor, level){
			return true;		
		}
	);	
	
	this.addDefinition(
		97, 
		"Funds gained x1.5", 
		"Receive more funds when shooting down enemies.", 
		false,
		true,
		function(actor, level){
			return [{type: "fund_gain_destroy", modType: "mult", value: 1.5}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		98, 
		"Exp. gained x1.5", 
		"Receive more exp. when shooting down enemies.", 
		false,
		true,
		function(actor, level){
			return [{type: "exp", modType: "mult", value: 1.5}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		99, 
		"Movement +2", 
		"Gain additional movement.", 
		false,
		true,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		100, 
		"Final Damage x1.2", 
		"Deal more damage to enemies.", 
		false,
		true,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true
		},
		[0],
		1,
	);
	
	this.addDefinition(
		101, 
		"+1 Action", 
		"Gain an extra action per turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		102, 
		"Shoot Down", 
		"Allows the pilot to deflect funnel and missile attacks. Activation depends on Skill stat difference with the enemy.", 
		false,
		true,
		function(actor, level){
			
			return [
				{type: "special_evade", subType: "missile", activation: "complex_shoot_down", name: "SHOOT DOWN", dodgePattern: 4},{type: "special_evade", subType: "funnel", activation: "complex_shoot_down", name: "SHOOT DOWN", dodgePattern: 4}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
}
