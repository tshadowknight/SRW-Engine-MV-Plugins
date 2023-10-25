$SRWConfig.mechAbilties = function(){
	this.addDefinition(
		0, 
		"Double Image", 
		"30% chance to evade any attack above 130 Will.", 
		false,
		false,
		function(actor, level){
			return [{type: "special_evade", subType: "all", activation: "random", name: "DOUBLE IMAGE", value: 0.3, dodgePattern: 1}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130 ? "on" : "off";
		}
	);
	this.addDefinition(
		1, 
		"HP Regen S", 
		"10% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"HP Regen M", 
		"20% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"HP Regen L", 
		"30% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"EN Regen S", 
		"10% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		5, 
		"EN Regen M", 
		"20% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"EN Regen L", 
		"30% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		7, 
		"Repair Kit", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"Resupply Kit", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"G-Wall", 
		"Cancels all damage if damage is below 800. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", subType: "all", value: 800, cost: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		10, 
		"G-Territory", 
		"Cancels all damage if damage is below 1800. 15 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", subType: "all", value: 1800, cost: 15}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		11, 
		"Barrier Field", 
		"Reduces all damage by 1000. 10 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "all", value: 1000, cost: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		12, 
		"Unarmed", 
		"Movement + 1, Mobility +20", 
		false,
		true,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1},{type: "mobility", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		13, 
		"N. Destroy", 
		"If the unit makes contact with a human opponent, both are destroyed after battle.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		14, 
		"N. Shift", 
		"The unit takes 1/8 damage.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", subType: "all", value: 1/8, cost: 0}];
		},
		function(actor, level){
			return !$statCalc.isStatModActiveOnAnyActor("noise_cancel", {14: true});
		},
		function(actor, level){
			return !$statCalc.isStatModActiveOnAnyActor("noise_cancel", {14: true}) ? "on" : "off";
		}
	);
	this.addDefinition(
		15, 
		"N. Cancel", 
		"Disables N.Shift on all units if deployed. Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1},{type: "noise_cancel", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		16, 
		"Spirit Barrier", 
		"Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		17, 
		"Spirit Barrier+", 
		"All units become immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune_all", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		18, 
		"Barrier Jacket", 
		"Reduces all ranged damage by 500. Effect increases with Magician Level. Unit is immune to N. Destroy.", 
		false,
		false,
		function(actor, level){
			var magicianLevel = $statCalc.getPilotAbilityLevel(actor, 9);
			var effectTable = [
				0, //1
				100, //2
				100, //3
				200, //4
				200, //5
				200, //6
				300, //7
				300, //8
				500, //9				
			];
			var boost = 0;
			if(typeof effectTable[magicianLevel-1] != "undefined"){
				boost = effectTable[magicianLevel-1];
			}
			return [{type: "reduction_barrier", statType: "melee", value: 500 + boost, cost: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		19, 
		"Warp Field", 
		"All damage received is halved. 20 EN per activation.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", subType: "all", value: 1/2, cost: 20}];
		},
		function(actor, level){
			return true;
		},
		null
	);
	this.addDefinition(
		20, 
		"Holo Boost", 
		"All weapons +500. Movement +1.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "movement", modType: "addFlat", value: 1},
				{type: "weapon_melee", modType: "addFlat", value: 500},
				{type: "weapon_ranged", modType: "addFlat", value: 500},
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	this.addDefinition(
		21, 
		"Heal", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		22, 
		"Resupply", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);	
	this.addDefinition(
		23, 
		"Jamming", 
		"The accuracy of a Missile type weapon used against this unit is halved.", 
		false,
		false,
		function(actor, level){
			return [{type: "special_evade", subType: "missile", activation: "random", name: "JAMMING", value: 0.5, dodgePattern: 3}];
		},
		function(actor, level){
			return true;
		}
	);	
	
	this.addDefinition(
		24, 
		"E Field", 
		"Reduces all damage by 1500. 15 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "all", value: 1500, cost: 15}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120;
		}
	);
	
	this.addDefinition(
		25, 
		"AB Field", 
		"Reduces beam damage by 1200. 10 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "beam", value: 1200, cost: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		26, 
		"Passive Bit", 
		"Reduces beam damage by 1100. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "beam", value: 1100, cost: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		27, 
		"Beam Coat", 
		"Reduces beam damage by 900. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "beam", value: 900, cost: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		28, 
		"Distortion Field", 
		"Reduces gravity and beam damage by 3000. Reduces other types of damage by 1000 damage. 10 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "all", value: 1000, cost: 10}, {type: "reduction_barrier", subType: "beam", value: 3000, cost: 10}, {type: "reduction_barrier", subType: "gravity", value: 3000, cost: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		29, 
		"GFUB Move", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "base_move", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		30, 
		"GFUB HP", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "maxHP", modType: "addPercent", value: 0.1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		31, 
		"GFUB EN", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "maxEN", modType: "addPercent", value: 0.1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		32, 
		"GFUB Armor", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "base_arm", modType: "addPercent", value: 0.1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		33, 
		"GFUB Mobility", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "base_mob", modType: "addPercent", value: 0.1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		34, 
		"GFUB Accuracy", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "base_acc", modType: "addPercent", value: 0.1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		35, 
		"GFUB Item Slots", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "item_slot", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	
			
	this.addDefinition(
		36, 
		"Phase Shift Armor", 
		"Reduces damage taken from all weapon types except Beam.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "reduction_barrier", subType: "gravity", value: 1000, cost: 10},
				{type: "reduction_barrier", subType: "missile", value: 1000, cost: 10},
				{type: "reduction_barrier", subType: "funnel", value: 1000, cost: 10},
				{type: "reduction_barrier", subType: "physical", value: 1000, cost: 10},
				{type: "reduction_barrier", subType: "typeless", value: 1000, cost: 10},			
			];
		},
		function(actor, level){
			return true;
		}
	);		
	
	this.addDefinition(
		37, 
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
			return $statCalc.isFUB(actor);
		}
	);	
	
	this.addDefinition(
		38, 
		"FUB 1", 
		"Weapons +200, Armor + 200.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "armor", modType: "addFlat", value: 200},
				{type: "weapon_melee", modType: "addFlat", value: 200},
				{type: "weapon_ranged", modType: "addFlat", value: 200},
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		39, 
		"FUB 2", 
		"Weapons +200, Mobility + 10.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "mobility", modType: "addFlat", value: 10},
				{type: "weapon_melee", modType: "addFlat", value: 200},
				{type: "weapon_ranged", modType: "addFlat", value: 200},
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		40, 
		"FUB 2", 
		"Movement +1, Mobility +20.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "mobility", modType: "addFlat", value: 20},
				{type: "movement", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		41, 
		"FUB 3", 
		"Final damage times 1.3 when battling a Virus type enemy.", 
		false,
		true,
		function(actor, level){			
			return [{type: "final_damage", modType: "mult", value: 1.3}];			
		},
		function(actor, level){
			var isValid = false;
			var combatInfo = $statCalc.getActiveCombatInfo(actor);
			if(combatInfo){				
				isValid = $statCalc.getAttributeInfo(combatInfo.other).attribute1 == "virus";
			} else {
				return false;
			}
			
			return isValid && $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		42, 
		"FUB 3", 
		"Movement + 1, Barrier Cost reduced by 10.", 
		false,
		true,
		function(actor, level){			
			return [{type: "movement", modType: "addFlat", value: 1},{type: "barrier_cost_reduction", modType: "addFlat", value: 10}];			
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		43, 
		"FUB 4", 
		"Weapons min range becomes 1, max range +1.", 
		false,
		true,
		function(actor, level){			
			return [{type: "range", modType: "addFlat", value: 1},{type: "min_range", modType: "addFlat", value: 10}];			
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		44, 
		"FUB 5", 
		"Mobility + 10, Double Image activation rate +20%", 
		false,
		true,
		function(actor, level){			
			return [{type: "mobility", modType: "addFlat", value: 10},{type: "special_evade", subType: "all", activation: "random", name: "DOUBLE IMAGE", value: 0.2, dodgePattern: 1}];			
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	
	this.addDefinition(
		45, 
		"FUB Upgrade Missile Weapons", 
		"Missile based weapons do 10% more damage.", 
		false,
		true,
		function(actor, level){			
			return [
				{type: "final_damage", modType: "mult", value: 1.1}
			];		
		},
		function(actor, level){
			if($statCalc.isFUB(actor)){
				var combatInfo = $statCalc.getActiveCombatInfo(actor);
				if(combatInfo){
					if(combatInfo.self_action.type == "attack" && combatInfo.self_action.attack){
						if(combatInfo.self_action.attack.particleType == "missile"){
							return true;
						}
					}
				} 
			}		
			return false;	
		}
	);
	
	this.addDefinition(
		46, 
		"Hover Turbine", 
		"Enables free movement over Water.", 
		false,
		false,
		function(actor, level){
			return [
				//{type: "water_enabled", modType: "addFlat", value: 2},
				{type: "hover_enabled", modType: "addFlat", value: 1},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		47, 
		"Mega Barrier", 
		"", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", subType: "all", value: 10000, cost: 0}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		48, 
		"Regen in reach", 
		"Provides 100% EN regen when in reach of the mech with the specified id", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 100}];
		},
		function(actor, level){
			const providerMechId = 3;//this is the mech id of the unit providing the regen field
			const activationDistance = 4;
			var targetActor = $statCalc.getCurrentPilot(providerMechId);
			if(targetActor){
				try {
					let providerEvent = $statCalc.getReferenceEvent(targetActor);
					let receptorEvent = $statCalc.getReferenceEvent(actor);
					if(providerEvent && receptorEvent){
						let deltaX = Math.abs(providerEvent.posX() - receptorEvent.posX());
						let deltaY = Math.abs(providerEvent.posY() - receptorEvent.posY());
						if(deltaX + deltaY <= activationDistance){
							return true;
						}
					}
				} catch(e){
					
				}				
			}
			return false;
		}
	);
	
	this.addDefinition(
		49, 
		"Drill", 
		"Enables underground movement.", 
		false,
		false,
		function(actor, level){
			return [
				//{type: "water_enabled", modType: "addFlat", value: 2},
				{type: "dig_enabled", modType: "addFlat", value: 1},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		50, 
		"Weapon Reenergize - Fire", 
		"Changes the attribute of the unit's weapons to Fire", 
		false,
		false,
		function(actor, level){
			return [
				{type: "weapon_attribute", modType: "addFlat", value: 1, attribute: "fire"},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		51, 
		"Reenergize - Air", 
		"Changes the attribute of the unit to Fire", 
		false,
		false,
		function(actor, level){
			return [
				{type: "attribute", modType: "addFlat", value: 1, attribute: "air"},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		52, 
		"Elemental Master", 
		"All damage inflicted becomes super effective", 
		false,
		false,
		function(actor, level){
			return [
				{type: "always_se", modType: "addFlat", value: 1},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		53, 
		"Nullify Elements", 
		"Ignore the penalties from elemental matchups", 
		false,
		false,
		function(actor, level){
			return [
				{type: "ignore_se", modType: "addFlat", value: 1},
			];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		54, 
		"HP Degen XXL", 
		"50% HP reduced at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: -50}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		55, 
		"Large Backpack", 
		"Carrying capacity +100.", 
		false,
		false,
		function(actor, level){
			return [{type: "carrying_capacity", modType: "addFlat", value: 100}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		56, 
		"Weapons unlocking Weapons example", 
		"Unlocks a fixed weapon for a unit if they are holding the right equipable weapons.", 
		false,
		false,
		function(actor, level){
			const requiredWeapons = [9,3];
			const availableWeapons = $statCalc.getActorMechEquipables(actor.SRWStats.mech.id)
			let weaponsLookup = {};
			for(let weapon of availableWeapons){
				if(weapon){
					weaponsLookup[weapon.weaponId] = true;
				}
			}
			const hasAllWeapons = requiredWeapons.filter(i => weaponsLookup[i]).length == requiredWeapons.length; 
			if(hasAllWeapons){
				return [{type: "unlock_weapon", modType: "addFlat", value: 7}];
			} else {
				return [];
			}
		},
		function(actor, level){
			return true;
		}
	);
	
	
	
	
	/*Insert new ability here*/
	

	
};