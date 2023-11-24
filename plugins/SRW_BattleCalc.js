function BattleCalc(){
	
}

BattleCalc.prototype.getWeaponTerrainValue = function(terrainRank){
	let values =  ENGINE_SETTINGS.WEAP_TERRAIN_VALUES.DAMAGE || {
		"S": 1.1,
		"A": 1.0,
		"B": 0.8,
		"C": 0.6,
		"D": 0.5,
	}
	return values[terrainRank];
}

BattleCalc.prototype.getMechTerrainValue = function(terrainRank){
	let values =  ENGINE_SETTINGS.MECH_TERRAIN_VALUES.DAMAGE || {
		"S": 1.1,
		"A": 1.0,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6,
	}
	return values[terrainRank];
}

BattleCalc.prototype.getMechSizeValue = function(size){
	let values =  ENGINE_SETTINGS.MECH_SIZE_MODS.DAMAGE || {
		"S": 0.8,
		"M": 1.0,
		"1L": 1.2,
		"2L": 1.4
	}
	return values[size];
}

BattleCalc.prototype.getMechEvadeMod = function(size){
	let values =  ENGINE_SETTINGS.MECH_SIZE_MODS.EVADE || {
		"S": 0.8,
		"M": 1.0,
		"1L": 1.2,
		"2L": 1.4
	}
	return values[size];
}



BattleCalc.prototype.isTargetInRange = function(originPos, targetPos, range, minRange){
	var deltaX = Math.abs(targetPos.x - originPos.x);
	var deltaY = Math.abs(targetPos.y - originPos.y);
	return deltaX + deltaY <= range && deltaX + deltaY >= minRange;
}

BattleCalc.prototype.performPPCalculation = function(attacker, defender){
	var attackerLevel = attacker.SRWStats.pilot.level;
	var defenderLevel = defender.SRWStats.pilot.level;
	var defenderTotalYield = defender.SRWStats.pilot.PPYield + defender.SRWStats.mech.PPYield ;
	var totalExp = defenderTotalYield * (defenderLevel/attackerLevel);
	if(totalExp < 1){
		totalExp = 1;
	}
	if(totalExp > 100){
		totalExp = 100;
	}
	return Math.floor(totalExp);
}

BattleCalc.prototype.performExpCalculation = function(attacker, defender){
	var attackerLevel = attacker.SRWStats.pilot.level;
	var defenderLevel = defender.SRWStats.pilot.level;
	var defenderTotalYield = defender.SRWStats.pilot.expYield + defender.SRWStats.mech.expYield ;
	
	var totalExp = eval(ENGINE_SETTINGS.EXP_YIELD.LEVEL_SCALING_FORMULA);
	if(totalExp < ENGINE_SETTINGS.EXP_YIELD.MIN){
		totalExp = ENGINE_SETTINGS.EXP_YIELD.MIN;
	}
	if(totalExp > ENGINE_SETTINGS.EXP_YIELD.MAX){
		totalExp = ENGINE_SETTINGS.EXP_YIELD.MAX;
	}
	
	return Math.floor(totalExp);
}

BattleCalc.prototype.performCritCalculation = function(attackerInfo, defenderInfo){
	var result = 0;
	var attackerAction = attackerInfo.action;
	var activeSpirits = $statCalc.getActiveSpirits(attackerInfo.actor);
	if(activeSpirits.valor || activeSpirits.soul){
		return -1;
	}
	if(attackerAction.type == "attack"){
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var weaponInfo = attackerAction.attack;			
		var attackerTerrainMod = $statCalc.getTerrainMod(attackerInfo.actor) || 0;
		
		var attackerSkill = attackerPilotStats.skill;
		attackerSkill = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerSkill, ["stat_skill"]);
		
		var baseCrit = (attackerSkill) * attackerTerrainMod + (weaponInfo.critMod);
		
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);
		var defenderTerrainMod = $statCalc.getTerrainMod(defenderInfo.actor) || 0;
		
		var defenderSkill = defenderPilotStats.skill;
		defenderSkill = $statCalc.applyStatModsToValue(attackerInfo.actor, defenderSkill, ["stat_skill"]);
		
		var baseCritEvade = (defenderSkill) * defenderTerrainMod + (SRW_CONSTANTS.CRIT_OFFSET || 0);
		
		var finalCrit = (baseCrit - baseCritEvade);
		
		finalCrit = $statCalc.applyStatModsToValue(attackerInfo.actor, finalCrit, ["crit"]);

		finalCrit = finalCrit/100;
		if(finalCrit < 0){
			finalCrit = 0;
		}
		result = Math.min(finalCrit, 1);
	}
	return result;
}

BattleCalc.prototype.getActorFinalCrit = function(){
	return this.performCritCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.getEnemyFinalCrit = function(){
	return this.performCritCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.doesActorCrit = function(){
	return Math.random() < this.getActorFinalCrit();
}

BattleCalc.prototype.doesEnemyCrit = function(){
	return Math.random() < this.getEnemyFinalCrit();
}	

BattleCalc.prototype.performHitCalculation = function(attackerInfo, defenderInfo, ignoreAlert){
	var result = 0;
	var attackerAction = attackerInfo.action;
	if(attackerAction.type == "attack"){
		if(!ignoreAlert && $statCalc.getActiveSpirits(defenderInfo.actor).alert){
			return 0;
		}
								
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var accuracy = attackerMechStats.accuracy;
		var accuracyDown = $statCalc.isAccuracyDown(attackerInfo.actor)
		if(accuracyDown){
			accuracy-=accuracyDown;
		}
		accuracy = $statCalc.applyStatModsToValue(attackerInfo.actor, accuracy, ["accuracy"]);
		var weaponInfo = attackerAction.attack;			
		var attackerTerrainMod = $statCalc.getTerrainMod(attackerInfo.actor) || 0;
		
		var attackerHit = attackerPilotStats.hit;
		
		attackerHit = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerHit, ["stat_hit"]);
		if(attackerInfo.isInitiator){
			attackerHit = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerHit, ["stat_hit_init"]);
		}
		
		
		var baseHit = (attackerHit/2 + accuracy) * attackerTerrainMod + weaponInfo.hitMod;
		
		
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);
		var mobility = defenderMechStats.mobility;
		var mobilityDown = $statCalc.isMobilityDown(defenderInfo.actor)
		if(mobilityDown){
			mobility-=mobilityDown;
		}
		mobility = $statCalc.applyStatModsToValue(defenderInfo.actor, mobility, ["mobility"]);
		
		if($statCalc.isDisabled(defenderInfo.actor)){
			mobility = 0;
		}
		
		var defenderTerrainMod = $statCalc.getTerrainMod(defenderInfo.actor) || 0;
		
		var defenderEvade = defenderPilotStats.evade;
		
		defenderEvade = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderEvade, ["stat_evade"]);
		if(defenderInfo.isInitiator){
			defenderEvade = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderEvade, ["stat_evade_init"]);
		}
		
		
		var baseEvade = (defenderEvade/2 + mobility) * defenderTerrainMod;
		
		var terrainEvadeFactor = $statCalc.getCurrentTerrainMods(defenderInfo.actor).evasion || 0;
		
		var finalHit = (baseHit - baseEvade) * this.getMechEvadeMod($statCalc.getCurrentSize(defenderInfo.actor)) * (1 - terrainEvadeFactor/100);
		
		//finalHit = finalHit + $statCalc.getCommanderBonus(attackerInfo.actor) - $statCalc.getCommanderBonus(defenderInfo.actor);
		
		finalHit = $statCalc.applyStatModsToValue(attackerInfo.actor, finalHit, ["hit"]);
		var evadeMod = 0;
		evadeMod = $statCalc.applyStatModsToValue(defenderInfo.actor, evadeMod, ["evade"]);
		finalHit-=evadeMod;
		
		if(!$statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["ignore_evasion_decay"]) && !ENGINE_SETTINGS.DISABLE_EVASION_DECAY){
			finalHit+=$statCalc.getEvadeCount(defenderInfo.actor) * 5;//evasion decay
		}
		
		
		if($statCalc.getActiveSpirits(attackerInfo.actor).focus) {
			finalHit+=30;
		}
		if($statCalc.getActiveSpirits(defenderInfo.actor).focus) {
			finalHit-=30;
		}
		
		if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){
			finalHit*=$statCalc.getEffectivenessMultiplier(attackerInfo.actor, weaponInfo, defenderInfo.actor, "hit");
		}
					
		
		if($statCalc.getActiveSpirits(attackerInfo.actor).disrupt) {
			finalHit/=2;
		}
		
		if(defenderInfo.action.type == "evade"){
			finalHit/=2;
		}
		
		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["causality_manip"])){
			if(finalHit >= 70){
				finalHit = 100;
			}
		}
		if($statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["causality_manip"])){
			if(finalHit <= 30){
				finalHit = 0;
			}
		}
		
		finalHit = finalHit/100;
		if(finalHit < 0){
			finalHit = 0;
		}
		
		if(!$statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["hit_cap_break"])){
			if(finalHit > 1){
				finalHit = 1;
			}
		}
		
		if($statCalc.getActiveSpirits(attackerInfo.actor).strike){
			if(finalHit < 1){
				return 1;
			}			
		}
		
		result = finalHit;
	}
	return result;
}

BattleCalc.prototype.getActorFinalHit = function(){
	return this.performHitCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.getEnemyFinalHit = function(){
	return this.performHitCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.getSupportFinalHit = function(){
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	return this.performHitCalculation(
		{actor: supporter.actor, action: {type: "attack", attack: supporter.weapon}},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.doesActorhit = function(){
	return Math.random() < this.getActorFinalHit();
}

BattleCalc.prototype.doesEnemyhit = function(){
	return Math.random() < this.getEnemyFinalHit();
}	

BattleCalc.prototype.doesSupportHit = function(){
	return Math.random() < this.getSupportFinalHit();
}	

BattleCalc.prototype.performDamageCalculation = function(attackerInfo, defenderInfo, noCrit, noBarrier, isSupportDefender, isSupportAttacker, isMismatchedTwin){
	var result = {
		damage: 0,
		isCritical: false,
		barrierCost: 0,
		hasThresholdBarrier: false,
		thresholdBarrierBroken: false,
		hasReductionBarrier: false,
		hasPercentBarrier: false
	};
	var attackerAction = attackerInfo.action;
	if(attackerAction.type == "attack"){			
		//initial attack
		var weaponInfo = attackerAction.attack;
		var weaponPower = $statCalc.getWeaponPower(attackerInfo.actor, weaponInfo)*1;
		var weaponTerrainRating = this.getWeaponTerrainValue($statCalc.getWeaponTerrainMod(defenderInfo.actor, weaponInfo)) || 0;
		
		var attackerPilotOffense;
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);

		var activeAttackerSpirits = $statCalc.getActiveSpirits(attackerInfo.actor);
			
		if(weaponInfo.type == "M"){ //melee
			attackerPilotOffense = attackerPilotStats.melee;
			attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_melee"]);
			if(attackerInfo.isInitiator){
				attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_melee_init"]);
			}
			weaponPower = $statCalc.applyStatModsToValue(attackerInfo.actor, weaponPower, ["weapon_melee"]);
		} else { //ranged
			attackerPilotOffense = attackerPilotStats.ranged;
			attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_ranged"]);
			if(attackerInfo.isInitiator){
				attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_ranged_init"]);
			}
			weaponPower = $statCalc.applyStatModsToValue(attackerInfo.actor, weaponPower, ["weapon_ranged"]);
		}
		
		
		var tagBoostInfo = $statCalc.getModDefinitions(attackerInfo.actor, ["weapon_type_boost"]);
		for(const modDef of tagBoostInfo){
			if(modDef.tag == weaponInfo.particleType){
				weaponPower+=modDef.value;
			}
		}
		
		
		/*var attackDown = $statCalc.isAttackDown(attackerInfo.actor)
		if(attackDown){
			weaponPower-=attackDown;
		}	*/	
		var attackerWill = $statCalc.getCurrentWill(attackerInfo.actor);
		var initialAttack = weaponPower * weaponTerrainRating * (attackerPilotOffense + attackerWill) / 200;
		//initial defense
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		
		var armor =  defenderMechStats.armor;
		var armorDown = $statCalc.isArmorDown(defenderInfo.actor);
		if(armorDown){
			armor-=armorDown;
		}
		armor = $statCalc.applyStatModsToValue(defenderInfo.actor, armor, ["armor"]);	

		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["ignore_armor"])){
			armor = 1;
		}	
		
		var defenderTerrainRating = this.getMechTerrainValue(defenderMechStats.terrain[$statCalc.getCurrentAliasedTerrain(defenderInfo.actor)]) || 0;
		
		//final damage
		var terrainDefenseFactor = $statCalc.getCurrentTerrainMods(defenderInfo.actor).defense || 0; 
		var sizeFactor = 1 + this.getMechSizeValue($statCalc.getCurrentSize(defenderInfo.actor)) - this.getMechSizeValue($statCalc.getCurrentSize(attackerInfo.actor));
		var attackerHasIgnoreSize = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["ignore_size"]) || activeAttackerSpirits.fury;
		if(attackerHasIgnoreSize && sizeFactor > 1){
			sizeFactor = 1;
		}
		
		var defenderDefense = defenderPilotStats.defense;
		
		defenderDefense = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderDefense, ["stat_defense"]);
		if(defenderInfo.isInitiator){
			defenderDefense = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderDefense, ["stat_defense_init"]);
		}
		
		var initialDefend = armor * defenderTerrainRating * (defenderDefense + $statCalc.getCurrentWill(defenderInfo.actor)) / 200 * sizeFactor;
		
		var finalDamage = (initialAttack - initialDefend) * (1 - terrainDefenseFactor/100);
		var isCritical = false;
		if(Math.random() < this.performCritCalculation(attackerInfo, defenderInfo)){
			isCritical = true;
		}				
		
		
		finalDamage = $statCalc.applyStatModsToValue(attackerInfo.actor, finalDamage, ["final_damage"]);	

		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["hit_cap_break"])){
			if($gameTemp.battleTargetInfo){			
				var targetInfo = $gameTemp.battleTargetInfo[attackerInfo.actor._cacheReference];
				if(!targetInfo){
					targetInfo = $gameTemp.battleTargetInfo[attackerInfo.actor._supportCacheReference];
				}
				if(targetInfo && targetInfo.hitRate > 1){
					finalDamage*=targetInfo.hitRate;
				}
			}
		}	
		
		finalDamage = $statCalc.applyStatModsToValue(defenderInfo.actor, finalDamage, ["final_defend"]);
		
		if(attackerInfo.isCounterAttack){
			finalDamage = $statCalc.applyStatModsToValue(attackerInfo.actor, finalDamage, ["revenge"]);	
		}
		
				
		if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){
			finalDamage*=$statCalc.getEffectivenessMultiplier(attackerInfo.actor, weaponInfo, defenderInfo.actor, "damage");
		}
		
		if(!isSupportAttacker){
			if(activeAttackerSpirits.soul){				
				finalDamage*=SRW_CONSTANTS.SOUL;
				noCrit = true;
			} else if(activeAttackerSpirits.valor){				
				finalDamage*=SRW_CONSTANTS.VALOR;
				noCrit = true;
			}
		}		
		
		if(activeAttackerSpirits.analyse){
			finalDamage*=SRW_CONSTANTS.ANALYSE_DEBUFF;
		}
		
		if(isCritical && !noCrit && !isSupportDefender){
			result.isCritical = isCritical;
			finalDamage*=SRW_CONSTANTS.CRIT_DMG;
		}
		
		if(defenderInfo.action.type == "defend"){
			finalDamage*=SRW_CONSTANTS.DEFEND_ACTION_DMG;
		}
		
		var activeDefenderSpirits = $statCalc.getActiveSpirits(defenderInfo.actor);
		if(activeDefenderSpirits.wall){
			finalDamage*=SRW_CONSTANTS.WALL;
		}
		
		if(activeDefenderSpirits.analyse){
			finalDamage*=SRW_CONSTANTS.ANALYSE_BUFF;
		}
		
		var vengeanceRatio = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["vengeance"]);
		if(vengeanceRatio){
			var missingHP = attackerMechStats.maxHP - attackerMechStats.currentHP;		
			finalDamage+=Math.floor(missingHP * vengeanceRatio);
		}		
		
		if(isSupportDefender){
			var supportDefendMod = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["support_defend_armor"]) || 0;		
			finalDamage = finalDamage - (finalDamage / 100 * supportDefendMod);
		}	
		
		if(isSupportAttacker){
			var supportAttackMod = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["support_attack_buff"]) || 0;		
			finalDamage = finalDamage + (finalDamage / 100 * supportAttackMod);
		}
		
		if(isMismatchedTwin){
			finalDamage*=SRW_CONSTANTS.TWIN_MISMATCH;
		}
		
		if(activeDefenderSpirits.persist){
			var persistInfo = SRW_CONSTANTS.PERSIST || {type: "fixed", value: 10};
			if(persistInfo.type == "fixed"){
				finalDamage = 10;
			} else {
				finalDamage*=persistInfo.value;
			}			
		}
		
		if(finalDamage < 10){
			finalDamage = 10;
		}
		
		if(activeAttackerSpirits.mercy){
			if(attackerPilotStats.skill > defenderPilotStats.skill){
				finalDamage = Math.min(finalDamage, defenderMechStats.currentHP - 10);
			}				
		}
		
		result.barrierNames = [];
		if(!noBarrier && !$statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["pierce_barrier"]) && !activeAttackerSpirits.fury){			
			var totalBarrierCost = 0;
			
			
			var percentBarrierAmount = 1;
			var percentBarrierCost = 0;
			var barrierName = "";
			
			var percentEffect = $statCalc.getModDefinitions(defenderInfo.actor, ["percent_barrier"]); 
			
			var type = weaponInfo.type == "M" ? "melee" : "ranged";	
			
			percentEffect.forEach(function(effect){
				if(effect.subType == type){
					if(effect.value < percentBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							percentBarrierAmount = effect.value;
							percentBarrierCost = effect.cost;
							barrierName = effect.name;
						}						
					}
				}
			});
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			percentEffect.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value < percentBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							percentBarrierAmount = effect.value;
							percentBarrierCost = effect.cost;
							barrierName = effect.name;
						}						
					}
				}
			});
			
			if(percentBarrierAmount < 1){				
				totalBarrierCost+=percentBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasPercentBarrier = true;
					finalDamage = Math.floor(finalDamage * percentBarrierAmount);
					result.barrierNames.push(barrierName);
				} 			
			}
			
			
			var reductionBarrierAmount = 0;
			var reductionBarrierCost = 0;
			var barrierName = "";
			
			var reductionEffects = $statCalc.getModDefinitions(defenderInfo.actor, ["reduction_barrier"]); 
			
			var type = weaponInfo.type == "M" ? "melee" : "ranged";			
			
			reductionEffects.forEach(function(effect){
				if(effect.statType == type){
					if(effect.value > reductionBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							reductionBarrierAmount = effect.value;
							reductionBarrierCost = effect.cost || 0;
							barrierName = effect.name;
						}
					}
				}
			});				
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			reductionEffects.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value > reductionBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							reductionBarrierAmount = effect.value;
							reductionBarrierCost = effect.cost;
							barrierName = effect.name;
						}
					}
				}
			});
			
			if(reductionBarrierAmount) {
				//totalBarrierCost+=$statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["reduction_barrier_cost"]);
				totalBarrierCost+=reductionBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasReductionBarrier = true;
					finalDamage-=reductionBarrierAmount;
					result.barrierNames.push(barrierName);
					if(finalDamage < 0){
						finalDamage = 0;
					}
				}
			}
			
			//var thresholdBarrierAmount = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["threshold_barrier"]);
			var thresholdBarrierAmount = 0;
			var thresholdBarrierCost = 0;
			var barrierName = "";
			
			var tresholdEffects = $statCalc.getModDefinitions(defenderInfo.actor, ["threshold_barrier"]); 
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			tresholdEffects.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value > thresholdBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							thresholdBarrierAmount = effect.value;
							thresholdBarrierCost = effect.cost;
							barrierName = effect.name;
						}
					}
				}
			});
			
			if(thresholdBarrierAmount) {				
				totalBarrierCost+=thresholdBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasThresholdBarrier = true;
					result.barrierNames.push(barrierName);
					if(finalDamage < thresholdBarrierAmount) {
						finalDamage = 0;
					} else {
						result.thresholdBarrierBroken = true;
					}
				} 			
			}
			result.barrierCost = totalBarrierCost;	
			var barrierCostReduction = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["barrier_cost_reduction"]);
			if(barrierCostReduction){
				result.barrierCost = Math.max(0, result.barrierCost - barrierCostReduction);
			}
		}
		
		if(Number.isNaN(finalDamage)){
			console.log("Calculated damage output is NaN!");
			finalDamage = 0;
		}
		
		
		result.damage = Math.floor(finalDamage);
	}
	return result;
}
BattleCalc.prototype.getActorDamageOutput = function(){
	return this.performDamageCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}
BattleCalc.prototype.getEnemyDamageOutput = function(){
	return this.performDamageCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.getSupportDamageOutput = function(){
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	return this.performDamageCalculation(
		{actor: supporter.actor, action: {type: "attack", attack: supporter.weapon}},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}			
	);
}

BattleCalc.prototype.getSupportDamageTaken = function(){
	var supporter = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];
	return this.performDamageCalculation(
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: supporter.actor, action: {type: "defend", attack: supporter.weapon}}
	);
}

BattleCalc.prototype.prepareBattleCache = function(actionObject, type){
	var actor = actionObject.actor;
	

	/*if(actor.isActor()){
		actor._cacheReference = "a_"+actor.actorId();
	} else {
		actor._cacheReference = "e_"+actor.enemyId();
	}*/
	var ref;
	if(type == "initiator" || type == "defender" || type == "twin attack" || type == "twin defend"){
		ref = $statCalc.getReferenceEventId(actor);
		actor._cacheReference = ref;		
	} else {
		ref = "support_"+$statCalc.getReferenceEventId(actor);
		actor._supportCacheReference = ref;		
	}	
	$gameTemp.battleEffectCache[ref] = {
		ref: actor,
		damageTaken: 0,
		isActor: actor.isActor(),
		type: type || "",
		action: actionObject.action,
		ownRef: actor._cacheReference,
		ENUsed: 0,
		ammoUsed: 0,
		hasActed: false,
		currentAnimHP: $statCalc.getCalculatedMechStats(actor).currentHP,
		currentAnimEN: $statCalc.getCalculatedMechStats(actor).currentEN,
	};
}

BattleCalc.prototype.generateBattleResult = function(isPrediction){
	var _this = this;
	$statCalc.invalidateAbilityCache($gameTemp.currentBattleEnemy);
	$statCalc.invalidateAbilityCache($gameTemp.currentBattleActor);
	
	$gameTemp.battleEffectCache = {};
	$gameTemp.sortedBattleActorCaches = [];
	var attacker;
	var attackerTwin;
	var defender;
	var defenderTwin;
	var supportAttacker; 
	if($gameTemp.supportAttackCandidates){
		supportAttacker = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	}
	var supportDefender; 
	if($gameTemp.supportDefendCandidates){
		supportDefender = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];
	}
	
	$gameVariables.setValue(_lastActorSupportAttackId, null);
	$gameVariables.setValue(_lastEnemySupportAttackId, null);
	
	var attackerSide;
	var defenderSide;
	if($gameTemp.isEnemyAttack){
		attackerSide = "enemy";
		defenderSide = "actor";
		attacker = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction, isInitiator: true};
		defender = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction};
		if(supportAttacker){			
			$gameVariables.setValue(_lastEnemySupportAttackId, supportAttacker.action.attack.id);
		}
		
	} else {
		attackerSide = "actor";
		defenderSide = "enemy";
		attacker = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction, isInitiator: true};
		defender = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction};
		if(supportAttacker){
			$gameVariables.setValue(_lastActorSupportAttackId, supportAttacker.action.attack.id);
		}
	}
	
	if($statCalc.isMainTwin(attacker.actor) && $gameTemp.attackingTwinAction){
		attackerTwin = {actor: attacker.actor.subTwin, action: $gameTemp.attackingTwinAction, isInitiator: true};
	}
	
	if($statCalc.isMainTwin(defender.actor) && $gameTemp.defendingTwinAction){
		defenderTwin = {actor: defender.actor.subTwin, action: $gameTemp.defendingTwinAction};
	}
	
	var attackerTarget;
	var attackerTwinTarget;
	var defenderTarget;
	var defenderTwinTarget;
	
	//TODO resolve targeting settings here
	/*
	$gameTemp.currentTargetingSettings = {
		actor: "enemyTwin",
		actorTwin: "enemyTwin",
		enemy: "actor",
		enemyTwin: "actor"
	};
	*/
	
	if(defenderTwin){
		if($gameTemp.currentTargetingSettings[attackerSide] == "twin"){
			attackerTarget = [defenderTwin];
		} else if($gameTemp.currentTargetingSettings[attackerSide] == "all"){
			attackerTarget = [defender, defenderTwin];
		} else {
			attackerTarget = [defender];
		} 
	} else {
		attackerTarget = [defender];
	}
	
	
	if(attackerTwin){
		if(defenderTwin){
			if($gameTemp.currentTargetingSettings[attackerSide+"Twin"] == "twin"){
				attackerTwinTarget = [defenderTwin];
			} else if($gameTemp.currentTargetingSettings[attackerSide+"Twin"] == "all"){
				attackerTwinTarget = [defender, defenderTwin];
			} else {
				attackerTwinTarget = [defender];
			} 
		} else {
			attackerTwinTarget = [defender];
		}
	}
	
	
	if(attackerTwin){
		if($gameTemp.currentTargetingSettings[defenderSide] == "twin"){
			defenderTarget = [attackerTwin];
		} else if($gameTemp.currentTargetingSettings[defenderSide] == "all"){
			defenderTarget = [attacker, attackerTwin];
		} else {
			defenderTarget = [attacker];
		} 
	} else {
		defenderTarget = [attacker];
	}	
	
	if(defenderTwin){
		if(attackerTwin){
			if($gameTemp.currentTargetingSettings[defenderSide+"Twin"] == "twin"){
				defenderTwinTarget = [attackerTwin];
			} else if($gameTemp.currentTargetingSettings[defenderSide+"Twin"] == "all"){
				defenderTwinTarget = [attacker, attackerTwin];
			} else {
				defenderTwinTarget = [attacker];
			} 
		} else {
			defenderTwinTarget = [attacker];
		}
	}
		
	if($gameTemp.actorAction && $gameTemp.actorAction.attack){
		$gameVariables.setValue(_lastActorAttackId, $gameTemp.actorAction.attack.id);
	} else {
		$gameVariables.setValue(_lastActorAttackId, -1);
	}
	if($gameTemp.enemyAction && $gameTemp.enemyAction.attack){
		$gameVariables.setValue(_lastEnemyAttackId, $gameTemp.enemyAction.attack.id);
	} else {
		$gameVariables.setValue(_lastEnemyAttackId, -1);
	}
	
	
	
	defender.isCounterAttack = true;
	this.prepareBattleCache(attacker, "initiator");
	this.prepareBattleCache(defender, "defender");
	if(supportAttacker){
		this.prepareBattleCache(supportAttacker, "support attack");
	}
	
	if(supportDefender){
		this.prepareBattleCache(supportDefender, "support defend");
	}

	if(attackerTwin){
		this.prepareBattleCache(attackerTwin, "twin attack");
	}

	if(defenderTwin){
		this.prepareBattleCache(defenderTwin, "twin defend");
	}	
	
	if($gameTemp.twinSupportAttack){
		this.prepareBattleCache($gameTemp.twinSupportAttack, "support attack");
	}
	
	function BattleAction(attacker, defender, supportDefender, side, isSupportAttack, allInfo){
		this._attacker = attacker;
		this._defender = defender;
		this._supportDefender = supportDefender;
		this._side = side;
		this._isSupportAttack = isSupportAttack;
		this._allInfo = allInfo;
	}
	
	BattleAction.prototype.execute = function(orderIdx){
		var mainAttackerCache = $gameTemp.battleEffectCache[attacker.actor._cacheReference];
		var aCache = $gameTemp.battleEffectCache[this._attacker.actor._cacheReference];
		
		//temp variable used to resolve weapon effects per target in StatCalc.prototype.getActiveStatMods
		$gameTemp.currentBattleTarget = this._defender.actor;
		
		const isBetweenFriendlies = $gameSystem.areUnitsFriendly(this._attacker.actor, this._defender.actor);
		let interactionType;
		if(this._attacker.action.attack){
			if(!isBetweenFriendlies){
				interactionType = this._attacker.action.attack.enemiesInteraction;
			} else {  
				interactionType = this._attacker.action.attack.alliesInteraction;
			}
		}
		
		
		var storedCacheRef = this._attacker.actor._cacheReference;
		if(this._isSupportAttack){
			this._attacker.actor._cacheReference = null; //remove the main attacker cache ref while calculating support results for this actor 
			//this is a hack to circumvent issues with determining ability activation when a unit has self supporting capabilites
			aCache = $gameTemp.battleEffectCache[this._attacker.actor._supportCacheReference];
		}
		
		const isBuffingAttack = isBetweenFriendlies && interactionType == Game_System.INTERACTION_STATUS;
		aCache.isBuffingAttack = isBuffingAttack;
		
		aCache.side = this._side;
		if(aCache.action.type != "attack"){
			return;
		}
		
		if(aCache.isDisabled){
			return;
		}
		
		
		aCache.allInfo = this._allInfo;
		if(aCache.type == "support attack"){
			if(mainAttackerCache.isDestroyed){
				return; //the support attacker does not get to attack if the main attacker is down
			}			
			aCache.mainAttacker = mainAttackerCache;
		}
		if(aCache.type == "defender"){
			aCache.counterActivated = $gameTemp.defenderCounterActivated;
		}
		
		var activeAttackerSpirits = $statCalc.getActiveSpirits(this._attacker.actor);
		if(activeAttackerSpirits.fury){
			aCache.hasFury = true;
		}
		
		var weaponref = this._attacker.action.attack;
		
		var defenders = [this._defender];
		if(this._allInfo){
			defenders.push(this._allInfo.otherTarget);
		}
		
		var hitInfoEntries = [];
		var tmp = [];
		for(var i = 0; i < defenders.length; i++){
			if(!$gameTemp.battleEffectCache[defenders[i].actor._cacheReference].isDestroyed){
				var hitInfo;
				if(this._isSupportAttack){
					hitInfo = $gameTemp.battleTargetInfo[this._attacker.actor._supportCacheReference];
				} else {
					hitInfo = $gameTemp.battleTargetInfo[this._attacker.actor._cacheReference];
				}			
				if(i == 1){
					hitInfo = hitInfo.otherTarget;
				}
				hitInfoEntries.push(hitInfo);
				tmp.push(defenders[i]);
			}
		}
		defenders = tmp;
		
		for(var i = 0; i < defenders.length; i++){		
			var attackedRef = "";
			if(i == 1){
				attackedRef = "_all_sub";
			}
			var dCache = $gameTemp.battleEffectCache[defenders[i].actor._cacheReference];
			var sCache;
			if(this._supportDefender && !(isBetweenFriendlies && interactionType == Game_System.INTERACTION_STATUS)) {
				sCache = $gameTemp.battleEffectCache[this._supportDefender.actor._supportCacheReference];
			}
			//when making a prediction also resolve attacks from units that were previously predicted to be destroyed to account for potential misses
			if(isPrediction || (!aCache.isDestroyed && !dCache.isDestroyed)) {
				aCache.actionOrder = orderIdx;
				aCache.hasActed = true;
				
				aCache["attacked"+attackedRef] = dCache;
				aCache.originalTarget = dCache;
				$gameTemp.sortedBattleActorCaches.push(aCache);
				
				/*var isHit = Math.random() < _this.performHitCalculation(
					this._attacker,
					this._defender		
				);*/
				
				var hitInfo = hitInfoEntries[i];
				var isHit = hitInfo.isHit;	
				dCache.specialEvasion = hitInfo.specialEvasion;
				
				var activeDefender = defenders[i];
				var activeDefenderCache = dCache;						
				
				var damageResult = {
					damage: 0,
					isCritical: false,
					barrierCost: 0,
					hasThresholdBarrier: false,
					thresholdBarrierBroken: false,
					hasReductionBarrier: false,
					hasPercentBarrier: false
				};
				var isSupportDefender = false;
				if(isHit){
					if(isHit && sCache && !sCache.hasActed){
						isHit = 1;
						activeDefender = this._supportDefender;
						activeDefenderCache = sCache;
						
						activeDefenderCache.defended = defenders[i].actor;
						isSupportDefender = true;
						aCache["attacked"+attackedRef] = sCache;
						
						sCache.hasActed = true;						
						/*if(Math.random() < $statCalc.applyStatModsToValue(this._supportDefender.actor, 0, ["double_image_rate"])){
							sCache.isDoubleImage = true;
							isHit = 0;
						}*/
						var specialEvasion = this.getSpecialEvasion(this._attacker, activeDefender);
						if(specialEvasion && !isBuffingAttack){
							sCache.specialEvasion = specialEvasion;
							isHit = false;
						}
					}
					var noCrit = false;
					if(_this.performCritCalculation(this._attacker, activeDefender) < 1 && isPrediction){
						noCrit = true;
					}
					
					if(isHit){
						if(interactionType == Game_System.INTERACTION_STATUS){
							damageResult.isStatusInteraction = true;
						} else {
							damageResult = _this.performDamageCalculation(
								this._attacker,
								activeDefender,
								noCrit,
								false,
								isSupportDefender,
								aCache.type == "support attack",
								hitInfo.isMismatchedTwin
							);	
						}						
					} 					
				} 
				
				if(isHit){
					if(this._attacker.action.attack && this._attacker.action.attack.type == "M"){
						aCache.madeContact = true;
						activeDefenderCache.madeContact = true;
						//activeDefenderCache.attacked = aCache;
					}
				
					if(this._isSupportAttack && !$statCalc.applyStatModsToValue(this._attacker.actor, 0, ["full_support_damage"])){
						damageResult.damage = Math.max(Math.floor(damageResult.damage * ENGINE_SETTINGS.SUPPORT_ATTACK_RATIO), 10);				
					}
				}
				
				
				
				
				aCache["hits"+attackedRef] = isHit;
				activeDefenderCache.isHit = isHit;
				activeDefenderCache.isAttacked = true;
				aCache.inflictedCritical = damageResult.isCritical;
				activeDefenderCache.tookCritical = damageResult.isCritical;
				activeDefenderCache.barrierCost = damageResult.barrierCost;
				activeDefenderCache.hasBarrier = damageResult.hasThresholdBarrier || damageResult.hasReductionBarrier || damageResult.hasPercentBarrier;
				activeDefenderCache.hasThresholdBarrier = damageResult.hasThresholdBarrier;
				activeDefenderCache.barrierBroken = damageResult.thresholdBarrierBroken;
				
				dCache.barrierNames = damageResult.barrierNames;
				
				if(isBetweenFriendlies && interactionType == "status"){
					dCache.receivedBuff = true;
				}
				
				if(this._side == "actor"){
					if(dCache){
						dCache.side = "enemy";
					}
					if(sCache){
						sCache.side = "enemy";
					}
				} else {
					if(dCache){
						dCache.side = "actor";
					}
					if(sCache){
						sCache.side = "actor";
					}
				}
				
				aCache["damageInflicted"+attackedRef] = damageResult.damage;
				
				var drainRatio = $statCalc.applyMaxStatModsToValue(this._attacker.actor, 0, ["hp_drain"]);
				if(drainRatio){
					if(!aCache.HPRestored){
						aCache.HPRestored = 0;
					}
					var amount = Math.floor(aCache["damageInflicted"+attackedRef] * drainRatio);
					aCache.HPRestored+=amount;
					//$statCalc.recoverHP(this._attacker.actor, amount);
					//aCache.currentAnimHP+=amount;
				}
				
				activeDefenderCache.damageTaken+=damageResult.damage;
				
				if(activeDefenderCache.damageTaken >= activeDefenderCache.currentAnimHP + (activeDefenderCache.HPRestored || 0)){
					if($statCalc.applyMaxStatModsToValue(defenders[i].actor, 0, ["one_time_miracle"])){
						if(!isPrediction && !isBuffingAttack){
							$statCalc.setAbilityUsed(defenders[i].actor, "one_time_miracle");
						}						
						activeDefenderCache.damageTaken = activeDefenderCache.currentAnimHP + (activeDefenderCache.HPRestored || 0) - 1;
						aCache["damageInflicted"+attackedRef] = activeDefenderCache.damageTaken;
					} else {
						activeDefenderCache.isDestroyed = true;
						activeDefenderCache.destroyer = aCache.ref;
						aCache.destroyedTarget = true;
					}				
				}				
				
				
				var extraActionInfo = $statCalc.getModDefinitions(defenders[i].actor, ["extra_action_on_damage"]);
				var minDamageRequired = -1;
				
				for(var j = 0; j < extraActionInfo.length; j++){
					if(minDamageRequired == -1 || extraActionInfo[j].value < extraActionInfo){
						minDamageRequired = extraActionInfo[j].value;
					}
				}
				
				if(minDamageRequired != -1 && minDamageRequired <= damageResult.damage){
					$statCalc.addAdditionalAction(defenders[i].actor);
				}
				
				if(interactionType == Game_System.INTERACTION_DAMAGE){
					aCache.statusEffects = {};
				} else {
					var statusEffects = {
						inflict_accuracy_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_accuracy_down"]),
						inflict_mobility_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_mobility_down"]),
						inflict_armor_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_armor_down"]),
						inflict_move_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_move_down"]),
						inflict_attack_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_attack_down"]),
						inflict_range_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_range_down"]),
						inflict_disable: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_disable"]),
						inflict_SP_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_SP_down"]),
						inflict_will_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_will_down"]),		
						inflict_spirit_seal: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_spirit_seal"]),	
					};		
					aCache.statusEffects = statusEffects;				
				
					if(aCache.statusEffects && aCache.statusEffects.inflict_disable && isHit && damageResult.damage > 0){
						var resistance = $statCalc.applyMaxStatModsToValue(activeDefenderCache.ref, 0, ["status_resistance"]);
						if(resistance < 1 || (aCache.hasFury && resistance == 1)){
							activeDefenderCache.isDisabled = true;
						}	
					}
				}
				
				if(!isPrediction && !isBuffingAttack){
					if(ENGINE_SETTINGS.ALERT_CLEARS_ON_ATTACK){
						if(activeDefenderCache.isAttacked){
							$statCalc.clearSpirit(activeDefenderCache.ref, "alert");
						}
					}
					if(ENGINE_SETTINGS.PERSIST_CLEARS_ON_HIT){
						if(activeDefenderCache.isHit){
							$statCalc.clearSpirit(activeDefenderCache.ref, "persist");
						}
					}
				}				
			}
		
		}
		
		if(aCache.action.attack && 
			(
				$statCalc.applyStatModsToValue(this._attacker.actor, 0, ["self_destruct"]) ||
				(aCache.hits && $statCalc.applyStatModsToValue(this._attacker.actor, 0, ["self_destruct_hit"]))
			)	
		){
			aCache.isDestroyed = true;
			aCache.selfDestructed = true;
		}
		
		
		var ENCost = weaponref.ENCost;
		if(ENCost != -1){
			aCache.ENUsed = ENCost;
		}
		let ENToPower = $statCalc.applyStatModsToValue(this._attacker.actor, 0, ["en_to_power"]);
		if(ENToPower){
			aCache.ENUsed = $statCalc.getCalculatedMechStats(this._attacker.actor).currentEN - ENToPower;
		}
		if(weaponref.totalAmmo != -1){
			aCache.ammoUsed = 1;
		}
		var MPCost = weaponref.MPCost;
		if(MPCost != -1){
			aCache.MPCost = MPCost;
		}
				
		if(!isPrediction && aCache.type != "support attack" && !isBuffingAttack){
			if(activeAttackerSpirits.soul){
				$statCalc.clearSpirit(this._attacker.actor, "soul");
			} else {
				$statCalc.clearSpirit(this._attacker.actor, "valor");
			}			
						
			$statCalc.clearSpirit(this._attacker.actor, "fury");
			$statCalc.clearSpirit(this._attacker.actor, "mercy");
			$statCalc.clearSpirit(this._attacker.actor, "snipe");	
			$statCalc.clearSpirit(this._attacker.actor, "charge");	
		}
					
		if(dCache && dCache.selfDestructed){
			aCache.targetSelfDestructed = true;
		}	
				
		this._attacker.actor._cacheReference = storedCacheRef;
	}
	
	BattleAction.prototype.getSpecialEvasion = function(attacker, defender){
		var specialEvasion = null;
		if(isPrediction){//do not factor in special evasion when predicting damage
			return specialEvasion;
		}
		var isHit = 1;
		var weaponref = attacker.action.attack; 
		var specialEvadeInfo = $statCalc.getModDefinitions(defender.actor, ["special_evade"]);
		var weaponType = weaponref.particleType;
		var aSkill = $statCalc.getPilotStat(attacker.actor, "skill");
		var dSkill = $statCalc.getPilotStat(defender.actor, "skill");		
		
		var ctr = 0;
		
		if(!$statCalc.getActiveSpirits(attacker.actor).strike && !$statCalc.getActiveSpirits(attacker.actor).fury){
			while(isHit && ctr < specialEvadeInfo.length){
				var evasionType = specialEvadeInfo[ctr].subType;
				if(evasionType == weaponType || evasionType == "all" || (evasionType == "ranged" && weaponref.type == "R") || (evasionType == "melee" && weaponref.type == "M")){
					if($SRWConfig.customSpecialEvasionActivationCheckers && $SRWConfig.customSpecialEvasionActivationCheckers[specialEvadeInfo[ctr].activation]){
						isHit = !$SRWConfig.customSpecialEvasionActivationCheckers[specialEvadeInfo[ctr].activation](specialEvadeInfo[ctr].originLevel, attacker, defender);
					} else if(specialEvadeInfo[ctr].activation == "skill"){
						isHit = dSkill < aSkill;
					} else if(specialEvadeInfo[ctr].activation == "random"){
						isHit = Math.random() > specialEvadeInfo[ctr].value;
					}
					if(!isHit){
						specialEvasion = specialEvadeInfo[ctr];
					}
				}
				ctr++;
			}
		}
		return specialEvasion;
	}
	
	BattleAction.prototype.determineTargetInfo = function(){		
		function getTargetInfo(attacker, defender){	
			const isBetweenFriendlies = $gameSystem.areUnitsFriendly(this._attacker.actor, this._defender.actor);
			let interactionType;
			if(this._attacker.action.attack){
				if(!isBetweenFriendlies){
					interactionType = this._attacker.action.attack.enemiesInteraction;
				} else {  
					interactionType = this._attacker.action.attack.alliesInteraction;
				}
			}
			const isBuffingAttack = isBetweenFriendlies && interactionType == Game_System.INTERACTION_STATUS; 
			var finalTarget = defender;
			var isMismatchedTwin = false;
			
			var hitRate = _this.performHitCalculation(
				attacker,
				defender		
			);
			if(hitRate > 0 && isPrediction){//assume the attack will hit unless it has 0% hit rate when making a prediction
				hitRate = 1;
			} 			
			if($gameTemp.demoMode){//debug and footage capture
				hitRate = 1;
			}	
			
			if(isBuffingAttack){//you can't dodge status effects by allies(assumed to be beneficial ones)
				hitRate = 1;
			}
			
			var isHit = Math.random() <= hitRate;
			var specialEvasion = null;
			if(isHit){		
				specialEvasion = this.getSpecialEvasion(attacker, defender);
				if(!isBuffingAttack && specialEvasion){
					isHit = false;
				}
			}
			if(isHit && this._supportDefender && !this._supportDefender.blockedHit){
				this._supportDefender.blockedHit = true;
				finalTarget = this._supportDefender;
				isMismatchedTwin = false;			
			} else if($statCalc.isTwinMismatch(attacker.actor, defender.actor)){
				isMismatchedTwin = true;
			}
				
			return 	{
				isHit: isHit,
				target: finalTarget,
				initiator: attacker,
				specialEvasion: specialEvasion,
				hitRate: hitRate,
				isMismatchedTwin: isMismatchedTwin
			}
		}	
		var cacheRef;
		if(this._isSupportAttack){
			cacheRef = this._attacker.actor._supportCacheReference;
		} else {
			cacheRef = this._attacker.actor._cacheReference;
		}			
		$gameTemp.battleTargetInfo[cacheRef] = getTargetInfo.call(this, this._attacker, this._defender);
		if(this._allInfo){
			$gameTemp.battleTargetInfo[cacheRef].otherTarget = getTargetInfo.call(this, this._attacker, this._allInfo.otherTarget);
		}
	}
	
	var actions = [];
	var defenderCounterActivates = Math.random() < $statCalc.applyStatModsToValue(defender.actor, 0, ["counter_rate"]);
	if(defender.action && defender.action.attack && defender.action.attack.isCounter){
		defenderCounterActivates = true;
	}
	
	function appendTargetingActions(attacker, targets, supportDefender, side, isSupportAttacker){
		var allInfo;
		if(targets.length > 1){
			supportDefender = null;
			allInfo = {
				otherTarget: targets[1]
			};
		} else if(targets[0].isSubTwin){
			supportDefender = null;
		}
		var otherTarget;
		var ctr = 0;
		/*targets.forEach(function(target){
			var allInfo;
			if(targets.length > 1){
				if(ctr == 0){
					allInfo = {
						skip: true
					};
					otherTarget = target;
				} else {
					allInfo = {
						skip: false,
						otherTarget: otherTarget
					};
				}
			}
			actions.push(new BattleAction(attacker, target, supportDefender, side, isSupportAttacker, allInfo));
			ctr++;
		});		*/
		actions.push(new BattleAction(attacker, targets[0], supportDefender, side, isSupportAttacker, allInfo));
	}
	
	//ensure the support defender shows up at the correct side of the battle field
	if(supportDefender && supportDefender.actor._supportCacheReference){
		 $gameTemp.battleEffectCache[supportDefender.actor._supportCacheReference].side = defenderSide;
	}
		
	
	if(defenderCounterActivates){
		$gameTemp.defenderCounterActivated = true;
	
		if(defenderTwin){
			appendTargetingActions(defenderTwin, defenderTwinTarget, null, attackerSide);
		}
		
		appendTargetingActions(defender, defenderTarget, null, defenderSide);	
		
		if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){	
			if($gameTemp.twinSupportAttack){
				appendTargetingActions($gameTemp.twinSupportAttack, attackerTarget, supportDefender, attackerSide, true);		
			}
			appendTargetingActions(supportAttacker, attackerTarget, supportDefender, attackerSide, true);								
		}

		if(attackerTwin){
			appendTargetingActions(attackerTwin, attackerTwinTarget, supportDefender, attackerSide);
		}	
		
		appendTargetingActions(attacker, attackerTarget, supportDefender, attackerSide);				

		if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){		
			if($gameTemp.twinSupportAttack){
				appendTargetingActions($gameTemp.twinSupportAttack, attackerTarget, supportDefender, attackerSide, true);		
			}
			appendTargetingActions(supportAttacker, attackerTarget, supportDefender, attackerSide, true);								
		}		
	} else {
		$gameTemp.defenderCounterActivated = false;
		if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){	
			if($gameTemp.twinSupportAttack){
				appendTargetingActions($gameTemp.twinSupportAttack, attackerTarget, supportDefender, attackerSide, true);		
			}
			appendTargetingActions(supportAttacker, attackerTarget, supportDefender, attackerSide, true);								
		}

		if(attackerTwin){
			appendTargetingActions(attackerTwin, attackerTwinTarget, supportDefender, attackerSide);
		}	
		
		appendTargetingActions(attacker, attackerTarget, supportDefender, attackerSide);	
		
		if(defenderTwin){
			appendTargetingActions(defenderTwin, defenderTwinTarget, null, defenderSide);
		}
		
		appendTargetingActions(defender, defenderTarget, null, defenderSide);		

		if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
			if($gameTemp.twinSupportAttack){
				appendTargetingActions($gameTemp.twinSupportAttack, attackerTarget, supportDefender, attackerSide, true);		
			}
			appendTargetingActions(supportAttacker, attackerTarget, supportDefender, attackerSide, true);								
		}	
		
	}
	$gameTemp.battleTargetInfo = {};	
	for(var i = 0; i < actions.length; i++){
		actions[i].determineTargetInfo();
	}
	
	
	
	for(var i = 0; i < actions.length; i++){
		$statCalc.invalidateAbilityCache($gameTemp.currentBattleEnemy);
		if($gameTemp.currentBattleEnemy.subTwin){
			$statCalc.invalidateAbilityCache($gameTemp.currentBattleEnemy.subTwin);
		}
		$statCalc.invalidateAbilityCache($gameTemp.currentBattleActor);
		if($gameTemp.currentBattleActor.subTwin){
			$statCalc.invalidateAbilityCache($gameTemp.currentBattleActor.subTwin);
		}
		actions[i].execute(i);
	}
	
	var gainRecipient = $gameTemp.currentBattleActor;	
	var aCache = $gameTemp.battleEffectCache[gainRecipient._cacheReference];
	aCache.expGain = 0;
	aCache.ppGain = 0;
	aCache.fundGain = 0;
	
	var gainDonors = [];
	gainDonors.push($gameTemp.currentBattleEnemy);
	if(supportDefender && !$gameSystem.isFriendly(supportDefender.actor, "player")){
		gainDonors.push(supportDefender.actor);
	}
	if($gameTemp.currentBattleEnemy.subTwin){
		gainDonors.push($gameTemp.currentBattleEnemy.subTwin);
	}
	aCache.gainDonors = [];
	gainDonors.forEach(function(gainDonor){		
		//var gainDonor = $gameTemp.currentBattleEnemy;
		var dCache = $gameTemp.battleEffectCache[gainDonor._cacheReference];			
		if(!dCache){
			dCache = $gameTemp.battleEffectCache[gainDonor._supportCacheReference];	
		}
		
		if(aCache && dCache){	
			aCache.gainDonors.push(dCache);
		
			var expGain = _this.performExpCalculation(gainRecipient, gainDonor);
			expGain = $statCalc.applyStatModsToValue(gainRecipient, expGain, ["exp"]);
			if($statCalc.getActiveSpirits(gainRecipient).gain && !aCache.isBuffingAttack){
				expGain*=2;
			}
			
			var ppGain = _this.performPPCalculation(gainRecipient, gainDonor);
			var fundGain = $statCalc.getAwardedFunds(gainDonor);
			if($statCalc.getActiveSpirits(gainRecipient).fortune){
				fundGain*=2;
			}
			if(!dCache.isDestroyed){
				if(aCache.isBuffingAttack){
					expGain = Math.floor(expGain / 4);
				} else {
					expGain = Math.floor(expGain / 10);
				}				
				ppGain = 0;
				fundGain = 0;
			} else {
				fundGain = $statCalc.applyStatModsToValue(gainRecipient, fundGain, ["fund_gain_destroy"]);
			}
			
			aCache.expGain+= expGain;
			aCache.ppGain+= ppGain;
			aCache.fundGain+= fundGain;
			
			
		}
	});
	if(!isPrediction && !aCache.isBuffingAttack){
		if($statCalc.getActiveSpirits(gainRecipient).gain){
			$statCalc.clearSpirit(gainRecipient, "gain");
		}
		if($statCalc.getActiveSpirits(gainRecipient).fortune){
			$statCalc.clearSpirit(gainRecipient, "fortune");
		}
	}
	
	
	$gameTemp.unitHitInfo = {
		actor: {
			
		},
		enemy: {
			
		},
		event: {
			
		}
	};
	
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		if(battleEffect && battleEffect.attacked && battleEffect.hits){
			var attackId = battleEffect.action.attack.id;
			if(battleEffect.attacked.ref.isActor()){
				var targetId = battleEffect.attacked.ref.actorId();
				if(!$gameTemp.unitHitInfo.actor[targetId]){
					$gameTemp.unitHitInfo.actor[targetId] = {};
				}
				$gameTemp.unitHitInfo.actor[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};		
			} else {
				var targetId = battleEffect.attacked.ref.enemyId();
				if(!$gameTemp.unitHitInfo.enemy[targetId]){
					$gameTemp.unitHitInfo.enemy[targetId] = {};
				}
				$gameTemp.unitHitInfo.enemy[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};		
			}
			if(battleEffect.attacked.ref.event){
				var targetId = battleEffect.attacked.ref.event.eventId();
				if(!$gameTemp.unitHitInfo.event[targetId]){
					$gameTemp.unitHitInfo.event[targetId] = {};
				}
				$gameTemp.unitHitInfo.event[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};
			}			
		}
	});	
}

BattleCalc.prototype.generateMapBattleResult = function(){
	var _this = this;
	
	
	$gameTemp.battleEffectCache = {};
	$gameTemp.sortedBattleActorCaches = [];
	var attacker;
	if($gameTemp.isEnemyAttack){
		attacker = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction};		
	} else {
		attacker = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction};
	}
	var gainRecipient = attacker.actor;
	
	_this.prepareBattleCache(attacker, "initiator");
	var aCache = $gameTemp.battleEffectCache[attacker.actor._cacheReference];	
	
	var weaponref = aCache.action.attack;
	var ENCost = weaponref.ENCost;
	if(ENCost != -1){
		aCache.ENUsed = ENCost;
	}
	if(weaponref.totalAmmo != -1){
		aCache.ammoUsed = 1;
	}
	
	var MPCost = weaponref.MPCost;
	if(MPCost != -1){
		aCache.MPCost = MPCost;
	}
	
	aCache.hasActed = true;

	aCache.expGain = 0;
	aCache.ppGain = 0;
	aCache.fundGain = 0;	
	aCache.gainDonors = [];

	let inflictedDamge = false;
	
	var targets = $gameTemp.currentMapTargets;
	targets.forEach(function(target){
		$statCalc.invalidateAbilityCache();
		//temp variable used to resolve weapon effects per target in StatCalc.prototype.getActiveStatMods
		$gameTemp.currentBattleTarget = target;
		
		var defender = {actor: target, action: {type: "none"}};
		if(target != attacker.actor){
			const isBetweenFriendlies = $gameSystem.areUnitsFriendly(attacker.actor, defender.actor);
			let interactionType;
			if(!isBetweenFriendlies){
				interactionType = attacker.action.attack.enemiesInteraction;
			} else {  
				interactionType = attacker.action.attack.alliesInteraction;
			}	
			const isBuffingAttack = isBetweenFriendlies && interactionType == Game_System.INTERACTION_STATUS;
			if(!isBuffingAttack){
				inflictedDamge = true;
			}
			
			_this.prepareBattleCache(defender, "defender");
			var dCache = $gameTemp.battleEffectCache[defender.actor._cacheReference];
			if(interactionType != Game_System.INTERACTION_DAMAGE){
				var statusEffects = {
					inflict_accuracy_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_accuracy_down"]),
					inflict_mobility_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_mobility_down"]),
					inflict_armor_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_armor_down"]),
					inflict_move_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_move_down"]),
					inflict_attack_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_attack_down"]),
					inflict_range_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_range_down"]),
					inflict_disable: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_disable"]),
					inflict_SP_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_SP_down"]),
					inflict_will_down: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_will_down"]),		
					inflict_spirit_seal: $statCalc.applyStatModsToValue(aCache.ref, 0, ["inflict_spirit_seal"]),	
				};				
				dCache.statusReceived = statusEffects;
			}
			
			dCache.isAttacked = true;
			dCache.attackedBy = aCache;
			var isHit = Math.random() < _this.performHitCalculation(
				attacker,
				defender		
			);
			if(isBetweenFriendlies && interactionType == Game_System.INTERACTION_STATUS){//you can't dodge status effects by allies(assumed to be beneficial ones)
				isHit = 1;
				dCache.receivedBuff = true;
			}
			if(isHit){
				if(Math.random() < $statCalc.applyStatModsToValue(defender.actor, 0, ["double_image_rate"])){
					dCache.isDoubleImage = true;
					isHit = 0;
				}
			}
			var damageResult = {
				damage: 0,
				isCritical: false,
				barrierCost: 0,
				hasThresholdBarrier: false,
				thresholdBarrierBroken: false,
				hasReductionBarrier: false,
				hasPercentBarrier: false
			};
			if(isHit){
				if(interactionType == Game_System.INTERACTION_STATUS){
					damageResult.isStatusInteraction = true;
				} else {
					damageResult = _this.performDamageCalculation(
						attacker,
						defender,
						false,
						false,
						false	
					);
				}				
			} 
			dCache.isHit = isHit;
			dCache.type = "defender";
			dCache.tookCritical = damageResult.isCritical;
			dCache.barrierCost = damageResult.barrierCost;
			dCache.hasBarrier = damageResult.hasThresholdBarrier || damageResult.hasReductionBarrier || damageResult.hasPercentBarrier;
			dCache.hasThresholdBarrier = damageResult.hasThresholdBarrier;
			dCache.barrierBroken = damageResult.thresholdBarrierBroken;
			
			dCache.damageTaken+=damageResult.damage;
			
			if(dCache.damageTaken >= dCache.currentAnimHP){
				dCache.isDestroyed = true;
			}	
			
			gainDonor = defender.actor;
					
			if(aCache && dCache){			
				var expGain = _this.performExpCalculation(gainRecipient, gainDonor);
				expGain = $statCalc.applyStatModsToValue(gainRecipient, expGain, ["exp"]);
				if($statCalc.getActiveSpirits(gainRecipient).gain){
					expGain*=2;
				}
				var ppGain = _this.performPPCalculation(gainRecipient, gainDonor);
				var fundGain = $statCalc.getAwardedFunds(gainDonor);
				if($statCalc.getActiveSpirits(gainRecipient).fortune){
					fundGain*=2;
				}
				if(!dCache.isDestroyed){
					expGain = Math.floor(expGain / 10);
					ppGain = 0;
					fundGain = 0;
				} else {
					fundGain = $statCalc.applyStatModsToValue(gainRecipient, fundGain, ["fund_gain_destroy"]);
				}
				
				aCache.expGain+= expGain;
				aCache.ppGain+= ppGain;
				aCache.fundGain+= fundGain;
				aCache.gainDonors.push(dCache);
			}		
		}
	});
	
	if(inflictedDamge){
		if($statCalc.getActiveSpirits(aCache).fortune){
			$statCalc.clearSpirit(attacker.actor, "fortune");
		}	
		
		if($statCalc.getActiveSpirits(gainRecipient).gain){
			$statCalc.clearSpirit(gainRecipient, "gain");
		}		
		
		var activeAttackerSpirits = $statCalc.getActiveSpirits(attacker.actor);
		if(activeAttackerSpirits.soul){
			$statCalc.clearSpirit(attacker.actor, "soul");
		} else {
			$statCalc.clearSpirit(attacker.actor, "valor");
		}
	}
	
	
	var mapRewardsScaling = 1 / (targets.length / 2);
	aCache.expGain = Math.floor(aCache.expGain * mapRewardsScaling);
	aCache.ppGain = Math.floor(aCache.ppGain * mapRewardsScaling);
	aCache.fundGain = Math.floor(aCache.fundGain * mapRewardsScaling);
	
}

BattleCalc.prototype.getBestWeapon = function(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly){
	var _this = this;
	var result = _this.getBestWeaponAndDamage(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly);
	return result.weapon;
}

BattleCalc.prototype.getBestWeaponAndDamage = function(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly, allRequired, considerBarrier){
	var _this = this;
	var allWeapons = $statCalc.getActorMechWeapons(attackerInfo.actor);
	var bestWeapon;
	var bestDamage = -1;
	var minENCost = -2;
	var maxTotalAmmo = -2;
	var defenderHP = defenderInfo.actor.hp;
	var canShootDown = false;
	allWeapons.forEach(function(weapon){
		if(!weapon.isMap && (!allRequired || (allRequired == 1 && weapon.isAll) || (allRequired == -1 && !weapon.isAll)) && $statCalc.canUseWeapon(attackerInfo.actor, weapon, postMoveEnabledOnly, defenderInfo.actor) && (ignoreRange || _this.isTargetInRange(attackerInfo.pos, defenderInfo.pos, $statCalc.getRealWeaponRange(attackerInfo.actor, weapon), $statCalc.getRealWeaponMinRange(attackerInfo.actor, weapon)))){
			var damageResult = _this.performDamageCalculation(
				{actor: attackerInfo.actor, action: {type: "attack", attack: weapon}},
				{actor: defenderInfo.actor, action: {type: "none"}},
				true,
				!considerBarrier
			);
			var isReachable;
			var range = $statCalc.getRealWeaponRange(attackerInfo.actor, weapon);
			isReachable = $statCalc.isReachable(defenderInfo.actor, attackerInfo.actor, range, $statCalc.getRealWeaponMinRange(attackerInfo.actor, weapon));
			
			if(isReachable){				
				if(optimizeCost){
					var currentWeaponCanShootDown = false;
					if(damageResult.damage >= defenderHP){
						canShootDown = true;
						currentWeaponCanShootDown = true;
					}
					if(canShootDown){
						if(currentWeaponCanShootDown){
							var currentENCost = weapon.ENCost;
							var currentTotalAmmo = weapon.totalAmmo;
							if(currentTotalAmmo != -1){//ammo using weapon
								if(maxTotalAmmo == -2 || currentTotalAmmo > maxTotalAmmo){
									if(minENCost == -2 || minENCost > 100/currentTotalAmmo){
										bestDamage = damageResult.damage;
										bestWeapon = weapon;
										currentTotalAmmo = maxTotalAmmo;
									}
								}
							} else {
								if(minENCost == -2 || minENCost > currentENCost){
									if(maxTotalAmmo == -2 || 100/currentTotalAmmo > currentENCost){
										bestDamage = damageResult.damage;
										bestWeapon = weapon;
										minENCost = currentENCost;
									}
								}
							}
						}
					} else if(damageResult.damage > bestDamage){
						bestDamage = damageResult.damage;
						bestWeapon = weapon;
					}
				} else {
					if(damageResult.damage > bestDamage){
						bestDamage = damageResult.damage;
						bestWeapon = weapon;
					}
				}
			}
		}
	});		
	return {weapon: bestWeapon, damage: bestDamage};
}

BattleCalc.prototype.updateTwinActions = function(){	
	if(!$gameTemp.currentTargetingSettings){
		$gameTemp.currentTargetingSettings = {
			actor: "main",
			actorTwin: "twin",
			enemy: "main",
			enemyTwin: "twin"
		};
	}
	
	var allAttackUsed = false;
	
	if($gameTemp.actorAction && $gameTemp.actorAction.attack){
		if($gameTemp.actorAction.attack.isAll){
			allAttackUsed  = true;
			$gameTemp.currentTargetingSettings.actor = "all";
		}
	}
	
	if($gameTemp.enemyAction && $gameTemp.enemyAction.attack){
		if($gameTemp.enemyAction.attack.isAll){
			allAttackUsed  = true;
			$gameTemp.currentTargetingSettings.enemy = "all";
		} else {
			if($gameTemp.currentBattleEnemy.targetUnitId != -1 && $gameTemp.currentBattleActor.subTwin){
				if($statCalc.getReferenceId($gameTemp.currentBattleActor.subTwin).id == $gameTemp.currentBattleEnemy.targetUnitId){
					$gameTemp.currentTargetingSettings.enemy = "twin";
				}
			}
			if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.currentBattleEnemy.subTwin.targetUnitId != -1){
				if($statCalc.getReferenceId($gameTemp.currentBattleActor).id == $gameTemp.currentBattleEnemy.subTwin.targetUnitId){
					$gameTemp.currentTargetingSettings.enemyTwin = "main";
				}
			}
		}
	}
	
	/*if(allAttackUsed){
		$gameTemp.supportAttackCandidates = [];
		$gameTemp.supportAttackSelected = -1;
		$gameTemp.supportDefendCandidates = [];
		$gameTemp.supportDefendSelected = -1;
	}*/
	
	$gameTemp.attackingTwinAction = null;
	$gameTemp.defendingTwinAction = null;
	
	var actorTwinAction;
	var enemyTwinAction;
	
	var isActorPostMove = !$gameTemp.isEnemyAttack && $gameTemp.isPostMove;
	var isEnemyPostMove = $gameTemp.isEnemyAttack && $gameTemp.isPostMove;	
	
	if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
		var twinInfo = {
			actor: $gameTemp.currentBattleActor.subTwin,
			pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}
		};
		
		var targetActor;
		if($gameTemp.currentTargetingSettings.actorTwin == "twin" && $statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
			targetActor = $gameTemp.currentBattleEnemy.subTwin;
		} else {
			$gameTemp.currentTargetingSettings.actorTwin = "main";
			targetActor = $gameTemp.currentBattleEnemy;
		}
		
		var targetInfo = {
			actor: targetActor,
			pos: {x: $gameTemp.currentBattleEnemy.event.posX(), y: $gameTemp.currentBattleEnemy.event.posY()}
		};
		var allRequired = $gameTemp.currentTargetingSettings.actor == "all" ? 1 : -1;
		
		var isInnerComboParticipant = $statCalc.isInnerComboParticipant($gameTemp.currentBattleActor.subTwin);	
		
		if(!isInnerComboParticipant && !$statCalc.isDisabled($gameTemp.currentBattleActor.subTwin)){
			var weaponResult = this.getBestWeaponAndDamage(twinInfo, targetInfo, false, false, isActorPostMove, allRequired);
			if(weaponResult.weapon){
				if(allRequired == 1){
					$gameTemp.currentTargetingSettings.actorTwin = "all";
				}
				actorTwinAction = {type: "attack", attack: weaponResult.weapon};												
			} else {
				actorTwinAction = {type: "defend"};				
			}
		} else {
			actorTwinAction = {type: "none"};	
		}		
	}
	
	if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
		var twinInfo = {
			actor: $gameTemp.currentBattleEnemy.subTwin,
			pos: {x: $gameTemp.currentBattleEnemy.event.posX(), y: $gameTemp.currentBattleEnemy.event.posY()}
		};
		
		var targetActor;
		if($gameTemp.currentTargetingSettings.enemyTwin == "twin" && $statCalc.isMainTwin($gameTemp.currentBattleActor)){
			targetActor = $gameTemp.currentBattleActor.subTwin;
		} else {
			$gameTemp.currentTargetingSettings.enemyTwin = "main";
			targetActor = $gameTemp.currentBattleActor;
		}
		
		var targetInfo = {
			actor: targetActor,
			pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}
		};
		var allRequired = $gameTemp.currentTargetingSettings.enemy == "all" ? 1 : -1;
		
		var weaponResult = this.getBestWeaponAndDamage(twinInfo, targetInfo, false, false, isEnemyPostMove, allRequired);
		if(weaponResult.weapon){
			if(allRequired == 1){
				$gameTemp.currentTargetingSettings.enemyTwin = "all";
			}
			enemyTwinAction = {type: "attack", attack: weaponResult.weapon};												
		} else {
			enemyTwinAction = {type: "defend"};				
		}
	}
	
	$gameTemp.actorTwinAction = actorTwinAction;
	$gameTemp.enemyTwinAction = enemyTwinAction;
	
	if($gameTemp.isEnemyAttack){
		$gameTemp.attackingTwinAction = enemyTwinAction;
		$gameTemp.defendingTwinAction = actorTwinAction;
	} else {
		$gameTemp.attackingTwinAction = actorTwinAction;
		$gameTemp.defendingTwinAction = enemyTwinAction;
	}
	
}

BattleCalc.prototype.updateTwinSupportAttack = function(){
	$gameTemp.twinSupportAttack = null;
	if($gameTemp.supportAttackSelected != -1 && $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected]){
		var supportAttacker = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected].actor;
		if(supportAttacker.subTwin){
			
				
			
			supportAttacker.subTwin.isSupport = true;
			var maxSupportAttacks = $statCalc.applyStatModsToValue(supportAttacker.subTwin, 0, ["support_attack"]);
			if(maxSupportAttacks > supportAttacker.subTwin.SRWStats.battleTemp.supportAttackCount && (!supportAttacker.subTwin.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT)){
				var twinInfo = {
					actor: supportAttacker.subTwin,
					pos: {x: supportAttacker.event.posX(), y: supportAttacker.event.posY()}
				};
				var currentTarget;
				var allRequired;
				if($gameTemp.isEnemyAttack){
					currentTarget = $gameTemp.currentBattleActor;
					allRequired = $gameTemp.currentTargetingSettings.enemy == "all" ? 1 : -1;
				} else {
					currentTarget = $gameTemp.currentBattleEnemy;
					allRequired = $gameTemp.currentTargetingSettings.actor == "all" ? 1 : -1;
				}
				var targetInfo = {
					actor: currentTarget,
					pos: {x: currentTarget.event.posX(), y: currentTarget.event.posY()}
				};
				var weaponResult = this.getBestWeaponAndDamage(twinInfo, targetInfo,false, false, false, allRequired);
				if(weaponResult.weapon){
					$gameTemp.twinSupportAttack = {actor: supportAttacker.subTwin, action: {type: "attack", attack: weaponResult.weapon}};
				}
			}
		}
	}
}