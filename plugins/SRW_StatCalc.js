function StatCalc(){
	this._terrainStringLookup = {
		1: "air",
		2: "land",
		3: "water",
		4: "space"
	}
	this._terrainToNumeric =  {
		"S": 4,
		"A": 3,
		"B": 2,
		"C": 1,
		"D": 0
	};
	this._numericToTerrain =  {
		4: "S",
		3: "A",
		2: "B",
		1: "C",
		0: "D"
	};
	this._terrainSumToLevel = {
		0: "D",
		1: "C",
		2: "C",
		3: "B",
		4: "B",
		5: "A",
		6: "A",
		7: "A",
		8: "S"
	};
	this._terrainLevelPerformance = {
		"S": 1.1,
		"A": 1,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6
	};
	this.defaultSpawnAnim = {
		name: "SRWAppear",
		frameSize: 192,
		sheetWidth: 5,
		frames: 8,
		speed: 2,
		appearFrame: 3,
		se: "SRWAppear"
	};
	
	this.defaultDestroyAnim = {
		name: "Explosion1",
		frameSize: 192,
		sheetWidth: 5,
		frames: 11,
		speed: 2,
		disappearFrame: 3,
		se: "SRWExplosion"
	};
	this._invalidatedEventIds = {};
	
	this._abilityLookupDepth = 0;
	
	this._defaultTerrainPerformance = {
		"S": 1.1,
		"A": 1,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6
	};
}

StatCalc.prototype.isActorSRWInitialized = function(actor){
	return actor && actor.SRWInitialized;
}

StatCalc.prototype.getTerrainPerformance = function(terrainString){
	return (ENGINE_SETTINGS.TERRAIN_PERFORMANCE || this._defaultTerrainPerformance)[terrainString];
}

StatCalc.prototype.getReferenceId = function(actor, depth){
	if(actor.isActor()){
		return {
			type: "actor",
			id: actor.actorId()
		}
	} else {
		return {
			type: "enemy",
			id: actor.enemyId()
		}
	}
}

StatCalc.prototype.getReferenceEvent = function(actor, depth){
	var event;
	if(depth == null){
		depth = 0;
	} else if(depth > 10){
		//console.log("Recursion while getting reference event!");
		return null;
	}
	if(actor.isSubPilot && actor.mainPilot){		
		event = this.getReferenceEvent(actor.mainPilot, depth+1);
	} else if(actor.isSubTwin && !actor.isEventSubTwin){
		var mainTwin = this.getMainTwin(actor);
		if(mainTwin){
			event = mainTwin.event;
		}		
	} else {
		event = actor.event;
	}
	return event;
}

StatCalc.prototype.getReferenceEventId = function(actor){
	let id;
	try {
		if(actor.isSubPilot && actor.mainPilot){		
			id = "sub_"+actor.mainPilot.event.eventId();
		} else if(actor.isEventSubTwin){
			id = "twin_"+actor.event.eventId();
		} else if(actor.isSubTwin){
			id = "twin_"+this.getMainTwin(actor).event.eventId();
		} else if(actor.event){
			id = actor.event.eventId();
		}
	} catch(e){
		
	}	
	return id;
}

StatCalc.prototype.canStandOnTile = function(actor, position){
	if(this.isActorSRWInitialized(actor)){
		const currentTerrain = $gameMap.regionId(position.x, position.y) % 8;
		//if(!actor.SRWStats.stageTemp.validTerrainCache){
		//	actor.SRWStats.stageTemp.validTerrainCache = {};
		//}
		//if(actor.SRWStats.stageTemp.validTerrainCache[currentTerrain] == null){
		//	actor.SRWStats.stageTemp.validTerrainCache[currentTerrain] = this.canStandOnTileResolve(actor, position);
		//}
		//return actor.SRWStats.stageTemp.validTerrainCache[currentTerrain];
		return this.canStandOnTileResolve(actor, position);
	}
	return false;
}

StatCalc.prototype.canStandOnTileResolve = function(actor, position, noCheckTwin){
	if(this.isActorSRWInitialized(actor)){
		const currentTerrain = $gameMap.regionId(position.x, position.y) % 8;
		if(this.canBeOnTerrain(actor, currentTerrain, noCheckTwin)){ //base terrain OK
			return true;
		}
		if(this.getValidSuperStatesLookup(actor, position)[this.getSuperState(actor)]){ //current super state OK
			return true;
		}
		
		let hasTransitionToValidSuperState = false;
		
		let transitions = this.getValidSuperStates(actor, position);
		for(let transition of transitions){
			if((transition.startState == currentTerrain || transition.startState == -1) && this.canBeOnTerrain(actor, transition.endState, noCheckTwin)){
				hasTransitionToValidSuperState = true;
			}
		}
		
		return hasTransitionToValidSuperState;		
	} 
	return false;	
}

StatCalc.prototype.canStandOnTileAfterTransformation = function(actor, transformTarget){
	if(transformTarget){
		var testActor = this.createEmptyActor();
		testActor.SRWStats = JSON.parse(JSON.stringify(actor.SRWStats));
		testActor.SRWStats.mech = this.getMechDataById(transformTarget, true);
		testActor.SRWStats.mech.items = actor.SRWStats.mech.items;
		var event = this.getReferenceEvent(actor);
		testActor.event = event;
		this.invalidateAbilityCache(actor);
		return this.canStandOnTile(testActor, {x: event.posX(), y: event.posY()});
	} else {
		return false;
	}
}

StatCalc.prototype.getValidTerrainStates = function(actor, position){
	let result = {};
	if(this.isActorSRWInitialized(actor)){		
		let terrain = $gameMap.regionId(position.x, position.y) % 8;
		let availableStates = {};	
		if(this.canBeOnTerrain(actor, terrain)){
			availableStates[terrain] = true;
		}
		let availableSuperStateTransitions = this.getValidSuperStates(actor, position);	
		for(let transition of availableSuperStateTransitions){
			if(transition.endState != -1){
				availableStates[transition.endState] = true;
			}
		}
		result = availableStates;				
	} 	
	return result;
}

StatCalc.prototype.getBestSuperState = function(possibleStates, forEnemy){
	let result = {
		isSuperseding: false,
		id: -1
	};
	if(possibleStates.length){
		let terrainDef = $terrainTypeManager.getTerrainDefinition(possibleStates[0]);
		let currentPriority = terrainDef.priority;
		let currentSupersedingPriority = terrainDef.supersedingPriority;		
		let currentEnemyPreference = terrainDef.enemyPreference;
		result.id = possibleStates[0];
		result.isSuperseding = currentSupersedingPriority > 0;
		if(forEnemy && currentEnemyPreference){
			result.isSuperseding = true;
		}
		for(let i = 1; i < possibleStates.length; i++){
			terrainDef = $terrainTypeManager.getTerrainDefinition(possibleStates[i]);
			let newPriotity = terrainDef.priority;
			let newSupersedingPriority = terrainDef.supersedingPriority;
			let newEnemyPreference = terrainDef.enemyPreference;
			if(newSupersedingPriority > currentSupersedingPriority){
				result.id = possibleStates[i];
				result.isSuperseding = true;
				currentSupersedingPriority = newSupersedingPriority;
			}
			if(currentSupersedingPriority < 1){
				if(newPriotity > currentPriority){
					result.id = possibleStates[i];
					currentPriority = newPriotity;
				}
			}			
			if(forEnemy && currentEnemyPreference < newEnemyPreference){
				result.id = possibleStates[i];
				currentEnemyPreference = newEnemyPreference;
				result.isSuperseding = true;
			}
		}		
	}
	return result;
}

StatCalc.prototype.updateSuperState = function(actor, noSE, forceUpgrade){
	if(this.isActorSRWInitialized(actor)){
		const event = this.getReferenceEvent(actor);
		if(event){			
			const position = {x: event.posX(), y: event.posY()};			
			let validStates = this.getValidTerrainStates(actor, position);
			let bestStateInfo = this.getBestSuperState(Object.keys(validStates), actor.isEnemy());
			if(bestStateInfo.isSuperseding || !validStates[this.getCurrentTerrainIdx(actor)] || forceUpgrade){//preserve the current super state if it still valid				
				this.setSuperState(actor, bestStateInfo.id, noSE);
			}		
		}		
	} 	
}

StatCalc.prototype.getTileType = function(actor){
	if($dataMap && this.isActorSRWInitialized(actor) && actor.event && actor.event.posX){
		var position = {x: actor.event.posX(), y: actor.event.posY()};
		if($gameMap.regionId(position.x, position.y) % 8 == 1){//air
			return "air";		
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 2){//land
			return "land";	
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 3){//water
			return "water";	
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 4){//space
			return "space";	
		}
	}
}

StatCalc.prototype.terrainToNumeric = function(terrainString){
	if(terrainString == "-"){
		return -1;
	}
	if(this._terrainToNumeric[terrainString]){
		return this._terrainToNumeric[terrainString];
	} else {
		return -1;
	}
}

StatCalc.prototype.numericToTerrain = function(terrainNumber){
	if(terrainNumber == -1){
		return "-";
	}
	if(this._numericToTerrain[terrainNumber]){
		return this._numericToTerrain[terrainNumber];
	} else {
		return -1;
	}
}

StatCalc.prototype.setCurrentTerrainFromRegionIndex = function(actor, terrainIndex){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.currentTerrain = this._terrainStringLookup[terrainIndex % 8];
		if(this.isMainTwin(actor)){
			this.setCurrentTerrainFromRegionIndex(actor.subTwin, terrainIndex);
		}
	}		
}

StatCalc.prototype.setCurrentTerrainModsFromTilePropertyString = function(actor, propertyString){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.currentTerrainMods = {
			defense: 0,
			evasion: 0,
			hp_regen: 0,
			en_regen: 0
		}	
		if(this.applyStatModsToValue(actor, 0, ["terrain_ignore"]) || (actor.isActor() && $gameSystem.actorsIgnoreTerrain)){				
			return;
		}
			
		if(propertyString){
			var parts = propertyString.split(",");
			actor.SRWStats.mech.currentTerrainMods = {
				defense: String(parts[0]).trim()*1,
				evasion: String(parts[1]).trim()*1,
				hp_regen: String(parts[2]).trim()*1,
				en_regen: String(parts[3]).trim()*1
			};		
			
			if(this.applyStatModsToValue(actor, 0, ["terrain_adept"])){
				if(actor.SRWStats.mech.currentTerrainMods.defense < 0){
					actor.SRWStats.mech.currentTerrainMods.defense*=-1;
				}
				if(actor.SRWStats.mech.currentTerrainMods.evasion < 0){
					actor.SRWStats.mech.currentTerrainMods.evasion*=-1;
				}
				if(actor.SRWStats.mech.currentTerrainMods.hp_regen < 0){
					actor.SRWStats.mech.currentTerrainMods.hp_regen*=-1;
				}
				if(actor.SRWStats.mech.currentTerrainMods.en_regen < 0){
					actor.SRWStats.mech.currentTerrainMods.en_regen*=-1;
				}
			}
			
			if(this.applyStatModsToValue(actor, 0, ["terrain_master"])){				
				actor.SRWStats.mech.currentTerrainMods.defense*=2;				
				actor.SRWStats.mech.currentTerrainMods.evasion*=2;				
				actor.SRWStats.mech.currentTerrainMods.hp_regen*=2;				
				actor.SRWStats.mech.currentTerrainMods.en_regen*=2;				
			}		
		}
		
		if(this.isMainTwin(actor)){
			this.setCurrentTerrainModsFromTilePropertyString(actor.subTwin, propertyString);
		}
	}		
}

StatCalc.prototype.updateTerrainInfo = function(actor){
	//check data map as hacky fix for crash when running this function before a map has been loaded
	if($dataMap && this.isActorSRWInitialized(actor)){		
		let referenceEvent = this.getReferenceEvent(actor);
		if(referenceEvent && (!actor.SRWStats.mech.currentTerrainMods || !actor.SRWStats.mech.currentTerrain || !referenceEvent._lastModsPosition || referenceEvent._lastModsPosition.x != referenceEvent.posX() || referenceEvent._lastModsPosition.y != referenceEvent.posY())){
			referenceEvent._lastModsPosition = {
				x: referenceEvent.posX(),
				y: referenceEvent.posY()
			}
			var regionId = $gameMap.regionId(referenceEvent._x, referenceEvent._y);
			this.setCurrentTerrainFromRegionIndex(actor, regionId);
			$gameMap.initSRWTileProperties();
			if($gameSystem.regionAttributes && $gameSystem.regionAttributes[regionId]){
				var def = $gameSystem.regionAttributes[regionId];
				this.setCurrentTerrainModsFromTilePropertyString(actor, def.defense+","+def.evasion+","+def.hp_regen+","+def.en_regen+",");
			} else {
				this.setCurrentTerrainModsFromTilePropertyString(actor, $gameMap.getTileProperties({x: referenceEvent._x, y: referenceEvent._y}));
			}
		}
	}
}

StatCalc.prototype.getCurrentRawTerrainIdx = function(actor){
	if(this.isActorSRWInitialized(actor)){	
		let referenceEvent = this.getReferenceEvent(actor);	
		if(referenceEvent){
			return $gameMap.regionId(referenceEvent.posX(), referenceEvent.posY()) % 8;
		}					
	}		
	return 0;
}

StatCalc.prototype.getCurrentTerrainIdx = function(actor){
	let result = 0;
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.mech.enabledTerrainSuperState != -1){
			result = actor.SRWStats.mech.enabledTerrainSuperState;
		} else {
			let referenceEvent = this.getReferenceEvent(actor);	
			if(referenceEvent && $dataMap){//hacky fix for issue in attack editor preview where it crashes when trying to get the terrain info from a non-existant map
				result = $gameMap.regionId(referenceEvent.posX(), referenceEvent.posY()) % 8;
			}
		}				
	}		
	return result;
}

StatCalc.prototype.getCurrentAliasedTerrainIdx = function(actor){
	let result = this.getCurrentTerrainIdx(actor);
	let terrainDef = $terrainTypeManager.getTerrainDefinition(result);
	if(terrainDef.alias){
		result = terrainDef.alias;
	}
	return result;
}

StatCalc.prototype.getCurrentTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this._terrainStringLookup[this.getCurrentTerrainIdx(actor)];		
	}		
}

StatCalc.prototype.getCurrentAliasedTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this._terrainStringLookup[this.getCurrentAliasedTerrainIdx(actor)];		
	}		
}

StatCalc.prototype.getCurrentTerrainMods = function(actor){
	if(this.isActorSRWInitialized(actor)){		
		this.updateTerrainInfo(actor);			
		return actor.SRWStats.mech.currentTerrainMods || {};
	}		
}

StatCalc.prototype.getCurrentMoveCost = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var event = this.getReferenceEvent(actor);
		var moveCost = $terrainTypeManager.getTerrainDefinition(this.getCurrentTerrainIdx(actor)).moveCost;
		return moveCost * event.lastMoveCount; 
	} else {
		return 0;
	}	
}

StatCalc.prototype.applyMoveCost = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var cost = this.getCurrentMoveCost(actor) || 0;
		this.recoverEN(actor, cost * -1);
		if(!actor.isSubTwin && actor.subTwin){
			this.applyMoveCost(actor.subTwin);
		}
	}
}

StatCalc.prototype.revertMoveCost = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var cost = this.getCurrentMoveCost(actor) || 0;
		this.recoverEN(actor, cost);
		if(!actor.isSubTwin && actor.subTwin){
			this.revertMoveCost(actor.subTwin);
		}
	}
}

StatCalc.prototype.parseTerrainString = function(terrainString){
	if(!terrainString){
		return {
			air: "C",
			land: "C",
			water: "C",
			space: "C"
		}
	}
	var parts = terrainString.split("");
	return {
		air: parts[0],
		land: parts[1],
		water: parts[2],
		space: parts[3]
	}
}

StatCalc.prototype.getPilotStatInfo = function(actorProperties){
	function parseGrowthRate(raw){
		var result = {};
		if(raw){		
			var parts = raw.split(",");
			if(parts.length == 1){
				result.type = "flat";
				result.rate = parseFloat(parts[0]);
			} else {
				result.type = "curve";
				result.target = parseInt(parts[0]);
				result.rate = parseFloat(parts[1]);
			}
		} else {
			result.type = "flat";
			result.rate = 0;
		}
		return result;
	}
	
	return {
		base: {
			SP: parseInt(actorProperties.pilotBaseSP),
			MP: parseInt(actorProperties.pilotBaseMP || 0),
			melee: parseInt(actorProperties.pilotBaseMelee),
			ranged: parseInt(actorProperties.pilotBaseRanged),
			skill: parseInt(actorProperties.pilotBaseSkill),
			defense: parseInt(actorProperties.pilotBaseDefense),
			evade: parseInt(actorProperties.pilotBaseEvade),
			hit: parseInt(actorProperties.pilotBaseHit),
			terrain: this.parseTerrainString(actorProperties.pilotTerrain)
		},
		growthRates: {
			SP: parseGrowthRate(actorProperties.pilotSPGrowth),
			MP: parseGrowthRate(actorProperties.pilotMPGrowth),
			melee: parseGrowthRate(actorProperties.pilotMeleeGrowth),
			ranged: parseGrowthRate(actorProperties.pilotRangedGrowth),
			skill: parseGrowthRate(actorProperties.pilotSkillGrowth),
			defense: parseGrowthRate(actorProperties.pilotDefenseGrowth),
			evade: parseGrowthRate(actorProperties.pilotEvadeGrowth),
			hit: parseGrowthRate(actorProperties.pilotHitGrowth)
		}
	}
}

StatCalc.prototype.parseWeaponDef = function(actor, isLocked, weaponDefinition, weaponProperties, currentWeaponsLookup){
	var totalAmmo = parseInt(weaponProperties.weaponAmmo);
	if(actor){
		totalAmmo = Math.ceil(this.applyStatModsToValue(actor, totalAmmo, ["ammo"]));
	}
	
	var effects = [];
	for(var j = 0; j < 10; j++){
		if(weaponProperties["weaponEffect"+j]){
			effects[j] = {idx: String(weaponProperties["weaponEffect"+j]).trim() * 1, targeting: "all"};
			if(weaponProperties["weaponEffectTargeting"+j]){
				effects[j].targeting = weaponProperties["weaponEffectTargeting"+j];
			}
		}
		
	}
	var isMap = false;
	var mapId;
	
	if(weaponProperties.weaponMapId){
		isMap = true;
		mapId = JSON.parse(weaponProperties.weaponMapId);
	}
	var ignoresFriendlies = weaponProperties.weaponIgnoresFriendlies;
	if(ignoresFriendlies == null || ignoresFriendlies == ""){//hack to ensure backwards compatibility for old weapon definitions
		ignoresFriendlies = true;
	} else {
		ignoresFriendlies = ignoresFriendlies * 1;
	}	

	var enemiesCounter = weaponProperties.weaponEnemiesCounter;
	if(enemiesCounter == null || enemiesCounter == ""){//hack to ensure backwards compatibility for old weapon definitions
		enemiesCounter = true;
	} else {
		enemiesCounter = enemiesCounter * 1;
	}	

	var alliesCounter = weaponProperties.weaponAlliesCounter;
	if(alliesCounter == null || alliesCounter == ""){//hack to ensure backwards compatibility for old weapon definitions
		alliesCounter = true;
	} else {
		alliesCounter = alliesCounter * 1;
	}	
	
	var isCombination = false;
	var combinationWeapons = [];
	var combinationType = 0;
	if(weaponProperties.weaponComboWeapons){
		isCombination = true;
		combinationWeapons = JSON.parse(weaponProperties.weaponComboWeapons);
	}
	if(weaponProperties.weaponComboType){
		combinationType = weaponProperties.weaponComboType;
	}
	var currentAmmo;
	var currentWeapon;

	if(currentWeaponsLookup){
		currentWeapon = currentWeaponsLookup[parseInt(weaponDefinition.id)];
	}	
	if(currentWeapon){
		currentAmmo = currentWeapon.currentAmmo;
	} else {
		currentAmmo = totalAmmo;
	}
	
	var HPThreshold = -1;
	if(weaponProperties.weaponHPThreshold){
		HPThreshold = weaponProperties.weaponHPThreshold * 1;
	}
	let animId = parseInt(weaponProperties.weaponAnimId);
	if(isNaN(animId)){
		animId = -1;
	}
	let vsAllyAnimId = parseInt(weaponProperties.weaponVSAllyAnimId);
	if(isNaN(vsAllyAnimId)){
		vsAllyAnimId = -1;
	}
	
	let BBAnimId = parseInt(weaponProperties.weaponBBAnimId);
	if(isNaN(BBAnimId)){
		BBAnimId = -1;
	}
	let vsAllyBBAnimId = parseInt(weaponProperties.weaponBBVSAllyAnimId);
	if(isNaN(vsAllyBBAnimId)){
		vsAllyBBAnimId = -1;
	}
	
	let BBAnimIdScale = parseFloat(weaponProperties.weaponBBAnimId_scale);
	if(isNaN(BBAnimIdScale)){
		BBAnimIdScale = 1;
	}
	let vsAllyBBAnimIdScale = parseFloat(weaponProperties.weaponBBVSAllyAnimId_scale);
	if(isNaN(vsAllyBBAnimIdScale)){
		vsAllyBBAnimIdScale = 1;
	}
	
	let BBAnimIdRate = parseFloat(weaponProperties.weaponBBAnimId_rate);
	if(isNaN(BBAnimIdRate)){
		BBAnimIdRate = ENGINE_SETTINGS.DEFAULT_BASIC_ANIM_RATE || 4;
	}
	let vsAllyBBAnimIdRate = parseFloat(weaponProperties.weaponBBVSAllyAnimId_rate);
	if(isNaN(vsAllyBBAnimIdRate)){
		vsAllyBBAnimIdRate = ENGINE_SETTINGS.DEFAULT_BASIC_ANIM_RATE || 4;
	}
	
	let BBAnimIdXOff = parseFloat(weaponProperties.weaponBBAnimId_XOff);
	if(isNaN(BBAnimIdXOff)){
		BBAnimIdXOff = 0;
	}
	let vsAllyBBAnimIdXOff = parseFloat(weaponProperties.weaponBBVSAllyAnimId_XOff);
	if(isNaN(vsAllyBBAnimIdXOff)){
		vsAllyBBAnimIdXOff = 0;
	}
	
	let BBAnimIdYOff = parseFloat(weaponProperties.weaponBBAnimId_YOff);
	if(isNaN(BBAnimIdYOff)){
		BBAnimIdYOff = 0;
	}
	let vsAllyBBAnimIdYOff = parseFloat(weaponProperties.weaponBBVSAllyAnimId_YOff);
	if(isNaN(vsAllyBBAnimIdYOff)){
		vsAllyBBAnimIdYOff = 0;
	}
	
	let invalidTargetTags = {};
	if(weaponProperties.weaponInvalidTags){					
		var parts = weaponProperties.weaponInvalidTags.split(",");
		parts.forEach(function(tag){
			invalidTargetTags[String(tag).trim()] = true;
		});				
	}
	return {
		id: parseInt(weaponDefinition.id),
		name: weaponDefinition.name,
		type: weaponProperties.weaponType,
		attribute1: weaponProperties.weaponAttribute1,
		attribute2: weaponProperties.weaponAttribute2,
		postMoveEnabled: parseInt(weaponProperties.weaponPostMoveEnabled),
		power: parseInt(weaponProperties.weaponPower),
		minRange: parseInt(weaponProperties.weaponMinRange),
		range: parseInt(weaponProperties.weaponRange),
		hitMod: parseInt(weaponProperties.weaponHitMod),
		critMod: parseInt(weaponProperties.weaponCritMod),
		totalAmmo: totalAmmo,
		currentAmmo: currentAmmo,
		ENCost: parseInt(weaponProperties.weaponEN),
		MPCost: parseInt(weaponProperties.weaponMP || 0),
		willRequired: parseInt(weaponProperties.weaponWill),
		terrain: this.parseTerrainString(weaponProperties.weaponTerrain),
		effects: effects,
		particleType: (weaponProperties.weaponCategory || "").trim(), //missile, funnel, beam, gravity, physical or "".
		animId: animId,
		vsAllyAnimId: vsAllyAnimId,
		BBAnimId: BBAnimId,
		vsAllyBBAnimId: vsAllyBBAnimId,
		BBAnimIdScale: BBAnimIdScale,
		vsAllyBBAnimIdScale: vsAllyBBAnimIdScale,
		BBAnimIdRate: BBAnimIdRate,
		vsAllyBBAnimIdRate: vsAllyBBAnimIdRate,
		BBAnimIdXOff: BBAnimIdXOff,
		vsAllyBBAnimIdXOff: vsAllyBBAnimIdXOff,
		BBAnimIdYOff: BBAnimIdYOff,
		vsAllyBBAnimIdYOff: vsAllyBBAnimIdYOff,
		isMap: isMap, 
		mapId: mapId,
		ignoresFriendlies: ignoresFriendlies,
		ignoresEnemies: weaponProperties.weaponIgnoresEnemies*1 || 0,
		isCombination: isCombination,
		combinationWeapons: combinationWeapons,
		combinationType: combinationType,
		isLocked: isLocked,
		isCounter: parseInt(weaponProperties.weaponIsCounter),
		isCounterOnly: parseInt(weaponProperties.weaponIsCounterOnly),
		upgradeType: parseInt(weaponProperties.weaponUpgradeType) || 0,
		isSelfDestruct: parseInt(weaponProperties.weaponIsSelfDestruct),
		isAll: parseInt(weaponProperties.weaponIsAll),
		HPThreshold: HPThreshold,
		enemiesCounter: enemiesCounter,
		alliesCounter: alliesCounter,
		enemiesInteraction: weaponProperties.weaponEnemyInteraction || "damage_and_status",
		alliesInteraction: weaponProperties.weaponAllyInteraction || "damage_and_status",
		invalidTargetTags: invalidTargetTags,
		costType: parseInt(weaponProperties.weaponCostType)|| 0,
		weight: parseInt(weaponProperties.weaponWeight)|| 0,	
		textAlias: parseInt(weaponProperties.weaponTextAlias || -1)
	};
}

StatCalc.prototype.getMechWeapons = function(actor, mechProperties, previousWeapons){
	var result = [];
	var currentWeaponsLookup = {};
	if(previousWeapons){
		previousWeapons.forEach(function(weapon){
			currentWeaponsLookup[weapon.id] = weapon;
		});
	}
	for(var i = 0; i < 20; i++) {
		var weaponDef = mechProperties["mechAttack"+i];
		if(weaponDef !== undefined){		
			var parts = weaponDef.split(",");
			var weaponId = parts[0] * 1;
			var isLocked = parts[1] * 1;
			if(weaponId !== undefined && weaponId !== "" && weaponId != 0 && $dataWeapons[weaponId]){
				var weaponDefinition = $dataWeapons[weaponId];
				var weaponProperties = weaponDefinition.meta;
				
				result.push(this.parseWeaponDef(actor, isLocked, weaponDefinition, weaponProperties, currentWeaponsLookup));
			}
		}
	}
	return result;
}

StatCalc.prototype.getPersonalityDef = function(actorProperties){
	var defaults = ENGINE_SETTINGS.DEFAULT_PERSONALITY || {
		hit: 0,
		miss: 0,
		damage: 0,
		evade: 0,
		destroy: 3,	
		ally_down: 0	
	};
	var result = {
		hit: actorProperties.pilotOnHitWill * 1,
		miss: actorProperties.pilotOnMissWill * 1,
		damage: actorProperties.pilotOnDamageWill * 1,
		evade: actorProperties.pilotOnEvadeWill * 1,
		destroy: actorProperties.pilotOnDestroyWill * 1,
		ally_down: actorProperties.pilotOnAllyDownWill * 1,
	};
	
	if(actorProperties.pilotOnHitWill == null){
		result.hit = defaults.hit;
	}
	if(actorProperties.pilotOnMissWill == null){
		result.miss = defaults.miss;
	}
	if(actorProperties.pilotOnDamageWill == null){
		result.damage = defaults.damage;
	}
	if(actorProperties.pilotOnEvadeWill == null){
		result.evade = defaults.evade;
	}
	if(actorProperties.pilotOnDestroyWill == null){
		result.destroy = defaults.destroy;
	}
	if(actorProperties.pilotOnAllyDownWill == null){
		result.ally_down = defaults.ally_down;
	}
	
	return result;
}

StatCalc.prototype.getSpiritInfo = function(actor, actorProperties){
	var result = [];
	var spiritCostMods =  $statCalc.getModDefinitions(actor, ["spirit_cost"]);
	var spiritCostModLookup = {};
	if(spiritCostMods){
		spiritCostMods.forEach(function(entry){
			spiritCostModLookup[entry.spirit_id] = entry.cost;
		});
	}
	
	var spiritMods =  $statCalc.getModDefinitions(actor, ["spirit_upgrade"]);
	var spiritModLookup = {};
	if(spiritMods){
		spiritMods.forEach(function(entry){
			spiritModLookup[entry.spirit_id] = entry.new_id;
		});
	}
	for(var i = 1; i <= 6; i++){
		var spiritString = actorProperties["pilotSpirit"+i];
		if(spiritString){
			var parts = spiritString.split(",");
			var cost = String(parts[2]).trim()*1;					
			var idx = String(parts[0]).trim();
			if(spiritCostModLookup[idx]){
				cost = spiritCostModLookup[idx];
			}
			//cost = $statCalc.applyStatModsToValue(actor, cost, ["sp_cost"]);
			if(spiritModLookup[idx] != null){
				idx = spiritModLookup[idx];
			}
			result.push({
				idx: idx,
				level: String(parts[1]).trim(),
				cost: cost,
			});
		}
	}
	return result;
}

StatCalc.prototype.getPilotAbilityInfo = function(actorProperties, targetLevel){
	var result = {};
	var currentListIdx = 0;
	for(var i = 1; i <= 200; i++){
		var abilityString = actorProperties["pilotAbility"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			var idx = String(parts[0] || "").trim();
			var level = String(parts[1]).trim();
			var requiredLevel = String(parts[2]).trim();
			if(idx != "" && requiredLevel <= targetLevel){
				if(!result[idx]){
					result[idx] = {
						idx: idx,
						level: level,
						requiredLevel: requiredLevel,
						slot: currentListIdx++
					}
				} else if(result[idx].level <= level){
					result[idx] = {
						idx: idx,
						level: level,
						requiredLevel: requiredLevel,
						slot: result[idx].slot
					}
				}				
			}
		}
	}
	return result;
}

StatCalc.prototype.getPilotRelationshipInfo = function(actorProperties){
	var result = {};
	var currentListIdx = 0;
	for(var i = 1; i <= 50; i++){
		var abilityString = actorProperties["pilotRelationship"+i];
		if(abilityString){
			var parts = abilityString.split(",");	
			var actor = parseInt(parts[0]);
			var effectId  = parseInt(parts[1]);
			var level = parseInt(parts[2]);
			if(!isNaN(actor) && !isNaN(effectId) && !isNaN(level)){
				result[actor] = {
					actor: actor,
					effectId: effectId,
					level: level
				};
			}			
		}
	}
	return result;
}

StatCalc.prototype.getMechAbilityInfo = function(mechProperties){
	var result = [];
	for(var i = 1; i <= 6; i++){
		var abilityString = mechProperties["mechAbility"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			var idx = String(parts[0] || "").trim();
			if(idx != ""){
				result.push({
					idx: idx
				});
			}			
		}
	}
	return result;
}

StatCalc.prototype.getActorMechItemSlots = function(mechId){
	var result = [];	
	var mech = $dataClasses[mechId];
	if(mech.meta.mechInheritsPartsFrom != null && mech.meta.mechInheritsPartsFrom != ""){
		mechId = mech.meta.mechInheritsPartsFrom;
		mech = $dataClasses[mechId];
	}
	var targetActor = this.getCurrentPilot(mechId, true);
	var slots = mech.meta.mechItemSlots;
	if(targetActor){
		slots = this.getRealItemSlots(targetActor);
	}
	return slots;
}

StatCalc.prototype.getActorMechItems = function(mechId){
	var result = [];	
	var mech = $dataClasses[mechId];
	if(mech.meta.mechInheritsPartsFrom != null && mech.meta.mechInheritsPartsFrom != ""){
		mechId = mech.meta.mechInheritsPartsFrom;
		mech = $dataClasses[mechId];
	}
	var targetActor = this.getCurrentPilot(mechId, true);
	var slots = mech.meta.mechItemSlots;
	if(targetActor){
		slots = this.getRealItemSlots(targetActor);
	}
	var ids = $inventoryManager.getActorItemIds(mechId);
	for(var i = 0; i < slots; i++){
		if(ids[i]){
			result.push({
				idx: ids[i]
			});
		} else {
			result.push(null);
		}
	}	
	return result;
}


StatCalc.prototype.getActorMechEquipableSlots = function(mechId){
	return ENGINE_SETTINGS.MAX_UNIT_EQUIPABLES || 5;
}

StatCalc.prototype.getActorMechCarryingCapacity = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.applyStatModsToValue(actor, actor.SRWStats.mech.carryingCapacity, ["carrying_capacity"]);
	}
	return 0;
}

StatCalc.prototype.getActorMechEquipables = function(mechId){
	var result = [];	
	var mech = $dataClasses[mechId];
	if(mech.meta.mechInheritsEquipablesFrom != null && mech.meta.mechInheritsEquipablesFrom != ""){
		mechId = mech.meta.mechInheritsEquipablesFrom;
		mech = $dataClasses[mechId];
	}
	//var targetActor = this.getCurrentPilot(mechId, true);
	var slots = this.getActorMechEquipableSlots(mechId);

	var ids = $equipablesManager.getActorItems(mechId);
	for(var i = 0; i < slots; i++){
		if(ids[i] != null){
			result.push(ids[i]);
		} else {
			result.push(null);
		}
	}	
	return result;
}


StatCalc.prototype.getMechItemInfo = function(mechProperties){
	var result = [];
	for(var i = 1; i <= 6; i++){
		var abilityString = mechProperties["mechItem"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			result.push({
				idx: String(parts[0]).trim()
			});
		}
	}
	return result;
}

StatCalc.prototype.getPilotName = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.pilot.usesClassName){
			return actor.SRWStats.mech.classData.name;
		} 
		return actor.SRWStats.pilot.name;
	} 
	return actor._name;		
}

StatCalc.prototype.resetBattleTemp = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp = {
			supportAttackCount: 0,
			supportDefendCount: 0,
			actionCount: 0,
			hasFinishedTurn: 0,
			hasUsedContinuousAction: 0,
			evadeCount: 0,
			currentAttack: null
		};
	}
}

StatCalc.prototype.resetStageTemp = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp = {
			inventoryConsumed: {},
			abilityUsed: {},
			isRevealed: false,
			mapAttackCoolDown: 1,
			nonMapAttackCounter: 1,
			isBoarded: false,
			isAI: false,
			isEssential: false,
			additionalActions: 0,
			disabledTurn: -1,
			popUpAnimsPlayed: {}
		};
		this.resetStatus(actor);
	}
}

StatCalc.prototype.getStageTemp = function(actor, property){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.stageTemp){
		return actor.SRWStats.stageTemp[property];
	}
}

StatCalc.prototype.setStageTemp = function(actor, property, value){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.stageTemp){
		actor.SRWStats.stageTemp[property] = value;
	}
}

StatCalc.prototype.resetStatus = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status = {
			accuracyDown: 0,
			mobilityDown: 0,
			armorDown: 0,
			movementDown: 0,
			attackDown: 0,
			rangeDown: 0
		}
	}
}

StatCalc.prototype.resetAllStatus = function(type){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.resetStatus(actor);						
	});
}

StatCalc.prototype.getStatusSummary = function(actor){		
	var result = [];
	if(this.isActorSRWInitialized(actor)){
		if(this.isDisabled(actor)){
			result.push({id: "disabled"});			
		}		
		if(this.isSpiritsSealed(actor)){
			result.push({id: "spiritsSealed"});			
		}
		Object.keys(actor.SRWStats.stageTemp.status).forEach(function(status){
			if(actor.SRWStats.stageTemp.status[status]){
				result.push({id: status, amount: actor.SRWStats.stageTemp.status[status]});
			}
		});
	}
	return result;
}

StatCalc.prototype.setTurnStatus = function(actor, statusVar, canStack){
	if(this.isActorSRWInitialized(actor)){
		if(!this.hasTurnStatus(actor, statusVar) || canStack){
			actor.SRWStats.stageTemp[statusVar] = $gameVariables.value(_turnCountVariable) * 1;
		}		
	} else {
		return false;
	}
}

StatCalc.prototype.hasTurnStatus = function(actor, statusVar){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.stageTemp[statusVar] == -1){
			return false;
		}
		return $gameVariables.value(_turnCountVariable) - actor.SRWStats.stageTemp[statusVar] <= 1;
	} else {
		return false;
	}
}

StatCalc.prototype.setDisabled = function(actor){
	this.setTurnStatus(actor, "disabledTurn");
}

StatCalc.prototype.isDisabled = function(actor){
	return this.hasTurnStatus(actor, "disabledTurn") || actor._battleMode == "disabled";
}

StatCalc.prototype.setSpiritsSealed = function(actor){
	this.setTurnStatus(actor, "spiritsSealedTurn", true);
}

StatCalc.prototype.isSpiritsSealed = function(actor){
	return this.hasTurnStatus(actor, "spiritsSealedTurn")
}

StatCalc.prototype.isAccuracyDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.accuracyDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setAccuracyDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.accuracyDown = amount;				
	} 
}

StatCalc.prototype.isMobilityDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.mobilityDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setMobilityDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.mobilityDown = amount;		
	} 
}

StatCalc.prototype.isArmorDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.armorDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setArmorDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.armorDown = amount;		
	} 
}

StatCalc.prototype.isMovementDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.movementDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setMovementDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.movementDown = amount;		
	} 
}

StatCalc.prototype.isRangeDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.rangeDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setRangeDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.rangeDown = amount;		
	} 
}

StatCalc.prototype.isAttackDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.attackDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setAttackDown = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){		
		actor.SRWStats.stageTemp.status.attackDown = amount;		
	} 
}

StatCalc.prototype.isBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.isBoarded;
	} else {
		return true;
	}
}

StatCalc.prototype.setBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		this.recoverAmmoPercent(actor, 100);
		if(this.getCurrentWill(actor) > 100){
			this.modifyWill(actor, -5);
			if(this.getCurrentWill(actor) < 100){
				this.setWill(actor, 100);
			}
		}
		actor.SRWStats.stageTemp.isBoarded = true;
	}
}

StatCalc.prototype.clearBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isBoarded = false;
	}
}

StatCalc.prototype.isRevealed = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.isEmpty || actor.isActor() || actor.SRWStats.stageTemp.isRevealed;
	} else {
		return true;
	}
}

StatCalc.prototype.isConfused = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.isConfused;
	} else {
		return false;
	}
}

StatCalc.prototype.isAI = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return !actor.isActor() || actor.SRWStats.stageTemp.isAI || this.isConfused(actor);
	} else {
		return false;
	}
}

StatCalc.prototype.setIsAI = function(actor, state){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isAI = state;
	} 
}

StatCalc.prototype.isEssential = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.isEssential;
	} else {
		return false;
	}
}

StatCalc.prototype.setEssential = function(actor, state){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isEssential = state;
	} 
}

StatCalc.prototype.setMapAttackCooldown = function(actor, cooldown){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.mapAttackCoolDown = cooldown;
	} 
}


StatCalc.prototype.setRevealed = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isRevealed = true;
	} 
}

StatCalc.prototype.addAdditionalAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.additionalActions++;
	} 
}

StatCalc.prototype.consumeAdditionalAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.stageTemp.additionalActions){
			actor.SRWStats.stageTemp.additionalActions--;
			return true;
		}		
	} 	
	return false;	
}

StatCalc.prototype.getCurrentMaxHPDisplay = function(actor){
	var result = "?????";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).maxHP;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentHPDisplay = function(actor){
	var result = "?????";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).currentHP;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentMaxENDisplay = function(actor){
	var result = "???";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).maxEN;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentENDisplay = function(actor){
	var result = "???";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).currentEN;
		}		
	}
	return result;
}


StatCalc.prototype.applyBattleStartWill = function(actor){
	var _this = this;
	if(_this.isActorSRWInitialized(actor)){		
		var rankInfo = $gameSystem.actorRankLookup;		
		_this.setWill(actor, 100);	
		_this.modifyWill(actor, _this.applyStatModsToValue(actor, 0, ["start_will"]), true);			
		if(actor.isActor()){
			
			if(_this.isAce(actor)){
				_this.modifyWill(actor, 5, true);	
				
				if(rankInfo[actor.actorId()] < 3){
					_this.modifyWill(actor, 5, true);	
				}
			}			
		}
	}
	//this.invalidateAbilityCache(actor);
}

StatCalc.prototype.applyTurnStartWill = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){			
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.modifyWill(actor, _this.applyStatModsToValue(actor, 1, ["start_turn_will"]), true);	
		}		
	});
	//this.invalidateAbilityCache();
}

StatCalc.prototype.applyEnemyDestroyedWill = function(factionId){
	var _this = this;
	this.iterateAllActors(null, function(actor, event){	
		if($gameSystem.isFriendly(actor, factionId)){
			_this.modifyWill(actor, _this.applyStatModsToValue(actor, 1, ["destroy_will"]), true);
		} else {
			_this.modifyWill(actor, _this.getPersonalityInfo(actor).ally_down || 0, true);		 	
		}
	});
	//this.invalidateAbilityCache();
}

StatCalc.prototype.getAvailableSpiritStates = function(type){
	return [
		"accel",
		"alert",
		"analyse",
		"charge",
		"disrupt",
		"focus",
		"fortune",
		"fury",
		"gain",
		"mercy",
		"persist",
		"snipe",
		"soul",
		"strike",
		"taunt",
		"valor",
		"wall",
		"zeal"
	];
}

StatCalc.prototype.refreshAllSRWStats = function(type){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){			
		if(!actor.isEmpty){
			_this.initSRWStats(actor, _this.getCurrentLevel(actor));
		}						
	});
}

//resets actors to their default class assignments and recalculates
StatCalc.prototype.reloadSRWActors = function(type){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){			
			_this.initSRWStats(actor, _this.getCurrentLevel(actor));
		if(!actor.isEmpty){
		}						
	});
}

StatCalc.prototype.softRefreshUnits = function(){
	var _this = this;	
	//ensure that the isSubPilot state also gets refreshed
	this.iterateAllActors(null, function(actor, event){
		actor.isSubPilot = false;
	});
	
	this.iterateAllActors(null, function(actor, event){
		if(!_this.isBoarded(actor)){//workaround for issue with applying stat mods to boarded units on save load, the temp tracking workaround for live deploys is not applicable so the engine reverts to the behavior where it applies the ship's stat mods to the unit		
			var itemsIds = [];
			actor.SRWStats.mech.items.forEach(function(item){
				if(!item){
					itemsIds.push(null);
				} else {
					itemsIds.push(item.idx);
				}			
			});
			if(!actor.SRWStats.dropBoxItems){
				actor.SRWStats.dropBoxItems = [];
			}
			var dropBoxItems = [];
			actor.SRWStats.dropBoxItems.forEach(function(item){
				if(!item){
					dropBoxItems.push(null);
				} else {
					dropBoxItems.push(item);
				}			
			});
			actor.SRWStats.pilot.abilities = null;//ensure reload
			//ensure dummy events are expanded after loading an intermission save
			if(event._dummyId != null){
				_this.attachDummyEvent(actor, event._dummyId);
			}
			_this.initSRWStats(actor, _this.getCurrentLevel(actor), itemsIds, true, false, dropBoxItems);	
		}	
	});
	this.invalidateAbilityCache();
}

StatCalc.prototype.attachDummyEvent = function(actor, id){
	if($gameSystem.isIntermission()){//hacky solution to ensure dummy events are only assigned during the intermission
		actor.event = {
			posX: function(){
				return this._dummyId;
			},
			posY: function(){
				return 0;
			},
			isErased: function(){
				return false;
			},
			eventId: function(){
				return this._dummyId;
			}
		};
		actor.event._dummyId = id;
	}	
}

StatCalc.prototype.createEmptyActor = function(level){
	var _this = this;
	var result = {
		SRWStats: _this.createEmptySRWStats(),
		name: function(){
			return "";
		},
		actorId: function(){
			return -1;
		},
		isActor: function(){
			return true;
		},
		currentClass: function(){
			return -1;
		},
	}	
	
	result.isEmpty = true;
	result.SRWInitialized = true;
	_this.resetStageTemp(result);
	_this.resetBattleTemp(result);
	_this.resetSpiritsAndEffects(result);	
	
	return result;
}

StatCalc.prototype.createEmptySRWStats = function(level){
	level = level || 0;
	return {
		pilot: {
			race: "",
			id: -1,
			level: level,
			will: 100,
			PP: 0,
			exp: level * 500,
			kills: 0,	
			expYield: 0,	
			PPYield: 0,
			stats: {
				base: {},
				growthRates: {},
				calculated: {},
				upgrades: {
					melee: 0,
					ranged: 0,
					skill: 0,
					defense: 0,
					evade: 0,
					hit: 0,
					terrain: {
						air: 0,
						land: 0,
						water: 0,
						space: 0
					},
				}
			},
			spirits: [],
			abilities: null,
			aceAbility: -1
		}, mech: {}
		
	};
}

StatCalc.prototype.resetSpiritsAndEffects = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.pilot.activeSpirits = {
			"accel": false,
			"alert": false,
			"analyse": false,
			"charge": false,
			"disrupt": false,
			"focus": false,
			"fortune": false,
			"gain": false,
			"mercy": false,
			"persist": false,
			"snipe": false,
			"soul": false,
			"strike": false,
			"valor": false,
			"vigor": false,
			"wall": false,
			"zeal": false
		};

		actor.SRWStats.pilot.activeEffects = [];
	}
}

StatCalc.prototype.reloadSRWStats = function(actor, lockAbilityCache, reloadMech){
	if(lockAbilityCache){
		this.lockAbilityCache();
	}
	if(actor.SRWInitialized){
		var currentSP = actor.SRWStats.pilot.stats.calculated.currentSP;
		var currentMP = actor.SRWStats.pilot.stats.calculated.currentMP;
		var currentHP = actor.SRWStats.mech.stats.calculated.currentHP;
		var currentEN = actor.SRWStats.mech.stats.calculated.currentEN;
		var activeSpirits = this.getActiveSpirits(actor);
		var mech = actor.SRWStats.mech;
		this.initSRWStats(actor, null, null, false, true);
		actor.SRWStats.pilot.stats.calculated.currentSP = currentSP;
		actor.SRWStats.pilot.stats.calculated.currentMP = currentMP;
		actor.SRWStats.pilot.activeSpirits = activeSpirits;
		
		if(!reloadMech){
			actor.SRWStats.mech = mech;
			actor.SRWStats.mech.stats.calculated.currentHP = currentHP;
			actor.SRWStats.mech.stats.calculated.currentEN = currentEN;
		}		
	} else {
		this.initSRWStats(actor);
	}	
	if(lockAbilityCache){
		this.unlockAbilityCache();
	}
}

StatCalc.prototype.initSRWStatsIfUninitialized = function(actor){
	if(!actor?.SRWInitialized){
		this.initSRWStats(actor);
	}
}

StatCalc.prototype.initSRWStats = function(actor, level, itemIds, preserveVolatile, isReload, boxDropIds){
	var _this = this;
	if(!level){
		level = 1;
	}
	var items = [];
	if(itemIds){
		for(var i = 0; i < itemIds.length; i++){
			items.push({idx: itemIds[i]});
		}
	}
	
	const origLevel = level;
	if(!actor.isActor()){
		if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled > 0){
		const modSet = ENGINE_SETTINGS.DIFFICULTY_MODS.levels[$gameSystem.getCurrentDifficultyLevel()].mods.pilot;
			if(modSet){
				if(modSet[actor.enemyId()]){
					targetMods = modSet[actor.enemyId()];
				} else {
					targetMods = modSet[-1];
				}
				if(targetMods){
					level+=(targetMods.level || 0);
					if(level < 1){
						level = 1;
					}
				}
				
			}
		}
	}	
	
	if(!actor.SRWStats){
		//setting the originalLevel is only done the first time a unit is initialized, to avoid the modified level from propagating as the original level on save load
		actor.originalLevel = origLevel;
		actor.SRWStats = _this.createEmptySRWStats(level);
	}
	
	if(actor.originalLevel == null){//support for existing save files
		actor.originalLevel = origLevel;
	}
	
	actor.SRWInitialized = true;
	if(!preserveVolatile && !isReload){
		this.resetBattleTemp(actor);
		this.resetStageTemp(actor);	
	}
	
	var actorId;
	var actorProperties;
	if(actor.isActor()){
		actorId = parseInt(actor.actorId());
		actorProperties = $dataActors[actorId].meta;
		actor.SRWStats.pilot.name = $dataActors[actorId].name;
	} else {
		actorId = parseInt(actor.enemyId());
		actorProperties = $dataEnemies[actorId].meta;
		actor.SRWStats.pilot.name = actor.name();
	}
	
	
	
	actor.SRWStats.pilot.grantsGainsTo = null;//actorProperties.pilotGrantsGainsTo;
	
	actor.SRWStats.pilot.id = actorId;
	
	actor.SRWStats.pilot.statsLabel = actorProperties.pilotStatsLabel || "";
	actor.SRWStats.pilot.usesClassName = actorProperties.pilotUsesClassName * 1;
	actor.SRWStats.pilot.cutinPath = actorProperties.pilotCutinPath;	
	
	actor.SRWStats.pilot.expYield = parseInt(actorProperties.pilotExpYield || 0);
	actor.SRWStats.pilot.PPYield = parseInt(actorProperties.pilotPPYield || 0);
	
	actor.SRWStats.pilot.targetingFormula = actorProperties.pilotTargetingFormula;
	
	actor.SRWStats.pilot.textAlias = actorProperties.pilotTextAlias;
	if(actor.SRWStats.pilot.textAlias == null){
		actor.SRWStats.pilot.textAlias = -1;
	}
	
	actor.SRWStats.pilot.attribute1 = actorProperties.pilotAttribute1;
	actor.SRWStats.pilot.attribute2 = actorProperties.pilotAttribute2;
	
	var aceAbilityIdx = actorProperties.pilotAbilityAce;
	if(typeof aceAbilityIdx != "undefined" && aceAbilityIdx != ""){
		actor.SRWStats.pilot.aceAbility = {
			idx: parseInt(aceAbilityIdx),
			level: 0,
			requiredLevel: 0
		}
	}
	actor.SRWStats.pilot.species = actorProperties.pilotSpecies;
	
	actor.SRWStats.pilot.subTwinOnly = actorProperties.pilotSubTwinOnly || 0;
	actor.SRWStats.pilot.mainTwinOnly = actorProperties.pilotMainTwinOnly || 0;
	
	if(!preserveVolatile){
		_this.resetSpiritsAndEffects(actor);
	}
	
	var statInfo = _this.getPilotStatInfo(actorProperties);
	
	actor.SRWStats.pilot.stats.base = statInfo.base;	
	actor.SRWStats.pilot.stats.growthRates = statInfo.growthRates;
	
	actor.SRWStats.pilot.tags = {};
	if(actorProperties.pilotTags){
		var parts = actorProperties.pilotTags.split(",");
		parts.forEach(function(tag){
			actor.SRWStats.pilot.tags[String(tag).trim()] = true;
		});
	}	

	this.calculateSRWActorStats(actor, preserveVolatile);// calculate stats to ensure level is set before fetching abilities
	
	var dbAbilities = this.getPilotAbilityInfo(actorProperties, this.getCurrentLevel(actor));	
	var dbRelationships = this.getPilotRelationshipInfo(actorProperties);
	
	actor.SRWStats.pilot.spirits = this.getSpiritInfo(actor, actorProperties);	
	
	if(actor.isActor()){
		this.applyStoredActorData(actor, dbAbilities, dbRelationships);
	} else {
		actor.SRWStats.pilot.abilities = dbAbilities;
		actor.SRWStats.pilot.relationships = dbRelationships;
	}	
	this.invalidateAbilityCache(actor);
	this.calculateSRWActorStats(actor, preserveVolatile);// calculate stats again to ensure changes due to abilities are applied
	
	var mech;
	var isForActor;
	if(actor.isActor()){
		if(actor._mechClass){//should only be the case when the editor is used
			mech = $dataClasses[actor._mechClass];
		} else if(preserveVolatile && actor.SRWStats.mech){
			mech = $dataClasses[actor.SRWStats.mech.id];
		}
		if(!mech){// && !actor.isSubPilot sub pilots should not be linked to mechs
			mech = actor.currentClass();

		}		
		isForActor = true;
	} else {
		mech = $dataClasses[actor._mechClass];
		isForActor = false;	
	}	
	
	let mechInitialized = false;
	
	while(!mechInitialized){		
		if(mech){			
			var previousWeapons = [];
			var previousStats;
			var previousSuperState;
			var previousCombineInfo;
			var previousBoarded;
			var customStats;
			
			if(preserveVolatile){
				if(actor.SRWStats.mech && actor.SRWStats.mech.stats){
					var previousStats = actor.SRWStats.mech.stats.calculated;				
					if(preserveVolatile){
						previousWeapons = actor.SRWStats.mech.weapons;
					}
					previousSuperState = actor.SRWStats.mech.enabledTerrainSuperState;
					previousCombineInfo = actor.SRWStats.mech.combineInfo;
					previousBoarded = actor.SRWStats.mech.unitsOnBoard;
					customStats = actor.SRWStats.mech.stats.custom;
				}			
			}
			actor.SRWStats.mech = this.getMechData(mech, isForActor, items, previousWeapons, actor);
			actor.SRWStats.dropBoxItems = boxDropIds || [];
			const upgradeLevel = $gameSystem.getEnemyUpgradeLevel();
			if(!isForActor && upgradeLevel){
				var levels = actor.SRWStats.mech.stats.upgradeLevels;
				levels.maxHP = upgradeLevel;
				levels.maxEN = upgradeLevel;
				levels.armor = upgradeLevel;
				levels.mobility = upgradeLevel;			
				levels.accuracy = upgradeLevel;
				levels.weapons = upgradeLevel;			
			}		
			this.invalidateAbilityCache(actor);
			this.calculateSRWMechStats(actor.SRWStats.mech, preserveVolatile, actor);	
			if(preserveVolatile){
				if(previousStats){
					actor.SRWStats.mech.stats.calculated.currentHP = previousStats.currentHP;
					actor.SRWStats.mech.stats.calculated.currentEN = previousStats.currentEN;
				}
				if(customStats){
					Object.keys(customStats).forEach(function(stat){
						actor.SRWStats.mech.stats.calculated[stat] = customStats[stat];
					});
				}
				if(previousSuperState != null){
					actor.SRWStats.mech.enabledTerrainSuperState = previousSuperState;
				}
				if(previousCombineInfo){
					actor.SRWStats.mech.combineInfo = previousCombineInfo;
				}
				if(previousBoarded){
					actor.SRWStats.mech.unitsOnBoard = previousBoarded;
				}
			}
		} else {
			actor.SRWStats.mech = this.getMechData();
		}	
		if(this.isFUB(actor) && actor.SRWStats.mech.FUBTransform){
			mech = $dataClasses[actor.SRWStats.mech.FUBTransform];
		} else {
			mechInitialized = true;
		}
	}
	
	if(!preserveVolatile){		
		if(actor.event && $dataMap){ //hacky solution to the initializer being called in context where either no event has been assigned to the actor(initial load of map, intermission) or where $dataMap has not loaded yet(loading save)
			var validPosition = this.canStandOnTile(actor, {x: actor.event.posX(), y: actor.event.posY()});
			if(!validPosition){
				console.log("Unit initialized on invalid terrain!");
			}
		}
	}
	
	
	if(actorProperties.pilotTwinSpirit){
		var parts = actorProperties.pilotTwinSpirit.split(",");
		var cost = String(parts[1]).trim()*1;			
		//cost = $statCalc.applyStatModsToValue(actor, cost, ["sp_cost"]);
		actor.SRWStats.pilot.twinSpirit = {
			idx: String(parts[0]).trim(),
			cost: cost,
		};	
	}	
	
	actor.SRWStats.pilot.personalityInfo = this.getPersonalityDef(actorProperties);
	
	var subPilots = this.getSubPilots(actor);
	if(!actor.isSubPilot){
		var mainPilot = actor;
		var ctr = 0;
		subPilots.forEach(function(pilotId){
			var actor = $gameActors.actor(pilotId);
			if(actor){
				actor.isSubPilot = true;
				actor.subPilotSlot = ctr;
				actor.mainPilot = mainPilot;
				if(isReload){
					_this.reloadSRWStats(actor);
				} else {
					_this.initSRWStats(actor, 1, [], preserveVolatile);
				}				
			}			
		});	
	}		
	
	if(actor.isActor() && !actor.isSubTwin){
		var subTwinId = this.getSubTwinId(actor);
		var subTwinActor = $gameActors.actor(subTwinId);
		if(subTwinActor == actor){
			console.log("Attempted to make an actor its own subtwin!");
		}
		if(subTwinActor && subTwinActor != actor){
			subTwinActor.isSubTwin = true;		
			
			//_this.initSRWStats(subTwinActor, 1, [], preserveVolatile);
			//subTwinActor.mainTwin = actor;			
			actor.subTwin = subTwinActor;
			this.invalidateAbilityCache();			
			if(isReload){
				_this.reloadSRWStats(subTwinActor);
			} else {
				_this.initSRWStats(subTwinActor, 1, [], preserveVolatile);
			}	
		}		
	}
	
	this.updateTerrainInfo(actor);
}

StatCalc.prototype.cleanTwinState = function(actor){
	if(actor){
		actor.isSubTwin = false;
		actor.subTwinId = false;			
		actor.subTwin = null;	
	}			
}

StatCalc.prototype.resetTwinState = function(actor){
	actor.isSubTwin = false;
	actor.subTwinId = null;
	if(actor.subTwin){
		actor.subTwin.isSubTwin = false;
	}
	actor.subTwin = null;
}	

StatCalc.prototype.getSubTwinId = function(actor){
	return actor.subTwinId;
}	

StatCalc.prototype.isMainTwin = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.subTwin != null;
	} else {
		return false;
	}
}	

StatCalc.prototype.getMechDataById = function(id, forActor){
	var mech = $dataClasses[id];
	return this.getMechData(mech, forActor);
}	

StatCalc.prototype.getMechData = function(mech, forActor, items, previousWeapons, refActor){	
	var result = {
		id: -1,
		isShip: false,
		unitsOnBoard: [],
		currentTerrain: 0,
		currentTerrainMods: {
			defense: 0,
			evasion: 0,
			hp_regen: 0,
			en_regen: 0
		},
		expYield: 0,
		PPYield: 0,
		stats: {
			base: {},
			upgradeLevels: {
				maxHP: 0,
				maxEN: 0,
				armor: 0,
				mobility: 0,
				terrain: {						
					air: 0,
					land: 0,
					water: 0,
					space: 0
				},
				accuracy: 0,
				weapons: 0,
				move: 0
			},
			upgradeCostTypes: {
				maxHP: 0,
				maxEN: 0,
				armor: 0,
				mobility: 0,
				accuracy: 0,
				weapons: 0
			},
			upgradeAmounts: {},
			calculated: {}
		},
		weapons: [],
		equips:[],
		abilities: [],
		fullUpgradeAbility: -1,
		basicBattleSpriteName: "",
		allowedPilots: [],
		items: [],
		noEquips: false
	};
	if(mech && mech.name && mech.meta && Object.keys(mech.meta).length){		
		var mechProperties = mech.meta;
		result.classData = mech;
		result.statsLabel = mechProperties.mechStatsLabel || "";
		result.isShip = mechProperties.mechIsShip * 1;
		result.enabledTerrainTypes = {
			1: (mechProperties.mechAirEnabled || 0) * 1,
			2: (mechProperties.mechLandEnabled || 0) * 1,
			3: (mechProperties.mechWaterEnabled || 0) * 1,
			4: (mechProperties.mechSpaceEnabled || 0) * 1,
			5: (mechProperties.mechTerrain5Enabled || 0) * 1,
			6: (mechProperties.mechTerrain6Enabled || 0) * 1,
			7: (mechProperties.mechTerrain7Enabled || 0) * 1,
			
		};
		result.enabledTerrainSuperState = -1;
		result.id = mech.id;
		result.expYield = parseInt(mechProperties.mechExpYield || 0);
		result.PPYield = parseInt(mechProperties.mechPPYield || 0);
		result.fundYield = parseInt(mechProperties.mechFundYield || 0);		
		
		function parsePilotList(raw){
			if(raw){
				try {
					return JSON.parse(raw);
				} catch(e){
					return [];
				}				
			} else {
				return [];
			}
		}
		
		if(mechProperties.mechAllowedPilots){
			result.allowedPilots = parsePilotList(mechProperties.mechAllowedPilots);
		}

		if(mechProperties.mechSubPilots){
			result.subPilots = JSON.parse(mechProperties.mechSubPilots);
		} else {
			result.subPilots = [];
		}

		result.hasVariableSubPilots = false;
		result.allowedSubPilots = {};
		for(var i = 0; i < 10; i++){
			if(mechProperties["mechAllowedSubPilots"+(i+1)]){				
				result.allowedSubPilots[i] = parsePilotList(mechProperties["mechAllowedSubPilots"+(i+1)]);
				if(result.allowedSubPilots[i]?.length && i < result.subPilots.length){
					result.hasVariableSubPilots = true;
				}
			}
		}
		
		result.notDeployable = parseInt(mechProperties.mechNotDeployable || 0);
		
		result.deployConditions = JSON.parse(mechProperties.mechDeployConditions || "{}");
		
		result.forcePilots = parseInt(mechProperties.mechForcePilots || 0);
		
		result.canQuickSwap = parseInt(mechProperties.mechCanQuickSwap || 0)
		
		/*result.basicBattleSpriteName = mechProperties.mechBasicBattleSprite;
		result.battleSceneSpriteName = mechProperties.mechBattleSceneSprite;
		
		result.battleSceneSpriteSize = parseInt(mechProperties.mechBattleSceneSpriteSize);
		
		result.useSpriter = parseInt(mechProperties.mechBattleSceneUseSpriter);
		
		result.battleSceneShadowInfo = {
			size: 3,
			offsetZ: 0,
			offsetX: 0
		};

		
		if(mechProperties.mechBattleSceneShadowSize){
			result.battleSceneShadowInfo.size = mechProperties.mechBattleSceneShadowSize*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetZ){
			result.battleSceneShadowInfo.offsetZ = mechProperties.mechBattleSceneShadowOffsetZ*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetX){
			result.battleSceneShadowInfo.offsetX = mechProperties.mechBattleSceneShadowOffsetX*1;
		}*/
		
		result.stats.base.maxHP = parseInt(mechProperties.mechHP);
		//result.currentHP = mechProperties.mechHP;
		result.stats.base.maxEN = parseInt(mechProperties.mechEN);
		//result.currentEN = mechProperties.mechHP;
		result.stats.base.armor = parseInt(mechProperties.mechArmor);
		result.stats.base.mobility = parseInt(mechProperties.mechMobility);	
		result.stats.base.accuracy = parseInt(mechProperties.mechAccuracy);
		result.stats.base.terrain = this.parseTerrainString(mechProperties.mechTerrain);
		result.stats.base.move = parseInt(mechProperties.mechMove);
		var sizeString = mechProperties.mechSize || "S";	
		
		result.stats.base.size = sizeString;
		
		result.noUpgrade = mechProperties.mechNoUpgrade * 1;
		

		result.stats.upgradeCostTypes.maxHP = parseInt(mechProperties.mechUpgradeHPCost);
		//result.currentHP = mechProperties.mechHP;
		result.stats.upgradeCostTypes.maxEN = parseInt(mechProperties.mechUpgradeENCost);
		//result.currentEN = mechProperties.mechHP;
		result.stats.upgradeCostTypes.armor = parseInt(mechProperties.mechUpgradeArmorCost);
		result.stats.upgradeCostTypes.mobility = parseInt(mechProperties.mechUpgradeMobilityCost);	
		if(mechProperties.mechUpgradeAccuracyCost != null){
			result.stats.upgradeCostTypes.accuracy = parseInt(mechProperties.mechUpgradeAccuracyCost);	
		} else {
			result.stats.upgradeCostTypes.accuracy = parseInt(mechProperties.mechUpgradAccuracyCost);	
		}		
		
		result.stats.upgradeCostTypes.weapons = parseInt(mechProperties.mechUpgradeWeaponCost);
		
		result.stats.upgradeAmounts.maxHP = parseInt(mechProperties.mechUpgradeHPAmount) || 350;
		result.stats.upgradeAmounts.maxEN = parseInt(mechProperties.mechUpgradeENAmount) || 10;
		result.stats.upgradeAmounts.armor = parseInt(mechProperties.mechUpgradeArmorAmount) || 60;
		result.stats.upgradeAmounts.mobility = parseInt(mechProperties.mechUpgradeMobilityAmount) || 5;
		result.stats.upgradeAmounts.accuracy = parseInt(mechProperties.mechUpgradAccuracyAmount) || 6;
				

		var FUBAbilityIdx = mechProperties.mechFullUpgradeAbility;
		if(typeof FUBAbilityIdx != "undefined" && !isNaN(parseInt(FUBAbilityIdx))){
			result.fullUpgradeAbility = {
				idx: parseInt(FUBAbilityIdx),
				level: 0,
				requiredLevel: 0
			}
		}
		
		
		if(mechProperties.mechCombinesFrom){
			result.combinesFrom = JSON.parse(mechProperties.mechCombinesFrom);
		}
		result.combineWill = mechProperties.mechCombineWill;
		if(mechProperties.mechCombinesTo){
			result.combinesInto = JSON.parse(mechProperties.mechCombinesTo);
		}
		result.combinedActor = mechProperties.mechCombinedActor;	
		
		
		function compatParse(value){
			//this method avoids immediately using a try to see if the input is valid json because the debugger needs to run with pause on caught execeptions on
			var result;
			result = value * 1 || -1;	
			if(result == -1 && value != null){
				try {
					result = JSON.parse(value);
				} catch(e){
									
				}
			}
			
			if(result && result != -1){
				if(!Array.isArray(result)){
					result = [result];
				}			
			} else {
				result = [];
			}
			return result;
		}
		
		result.transformsInto = compatParse(mechProperties.mechTransformsInto);				
		result.transformWill = compatParse(mechProperties.mechTransformWill);		
		result.transformRestores;
		if(mechProperties.mechTransformRestores){
			var parts = mechProperties.mechTransformRestores.split(",");
			if(parts.length == 1){
				result.transformRestores = {
					HP: parts[0] * 1 ? true: false,
					EN: parts[0] * 1 ? true: false,
				}
			} else {
				result.transformRestores = {
					HP: parts[0] * 1 ? true: false,
					EN: parts[1] * 1 ? true: false,
				}
			}
		}
		
		
		result.destroyTransformInto = mechProperties.mechDestroyTransformInto * 1 || null;		
		result.destroyTransformedActor = mechProperties.mechDestroyTransformedActor * 1 || null;	

		if(mechProperties.mechAttribute1){
			result.attribute1 = mechProperties.mechAttribute1.trim();
		}
		
		if(mechProperties.mechAttribute2){
			result.attribute2 = mechProperties.mechAttribute2.trim();
		}
		
		if(mechProperties.mechNoTwin){
			result.noTwin = mechProperties.mechNoTwin * 1;
		}
		
		
		result.carryingCapacity = (mechProperties.mechCarryingCapacity || ENGINE_SETTINGS.DEFAULT_CARRYING_CAPACITY) * 1;
		
		
		//result.transformedActor = mechProperties.mechTransformedActor;

		/*var mechOnDeployMain;
		var mechOnDeployMainRaw = mechProperties.mechOnDeployMain;
		if(!isNaN(mechOnDeployMainRaw * 1)){
			mechOnDeployMain = {type: "direct", id: mechOnDeployMainRaw * 1};
		} else if(mechOnDeployMainRaw){
			try {
				mechOnDeployMain = JSON.parse(mechOnDeployMainRaw);
			} catch(e){
				
			}			
		}
		
		result.onDeployMain = mechOnDeployMain || {};*/
		
		result.deployActions = $deployActionsLoader.getData()[mech.id];
		
		result.inheritsUpgradesFrom = mechProperties.mechInheritsUpgradesFrom * 1 || null;	
		
		result.inheritsPartsFrom = mechProperties.mechInheritsPartsFrom * 1 || null;	
		
		result.inheritsEquipablesFrom = mechProperties.mechInheritsEquipablesFrom * 1 || null;	
		
		result.FUBTransform = mechProperties.mechFUBTransform * 1 || null;	
		
		
		result.abilities = this.getMechAbilityInfo(mechProperties);
		result.itemSlots = parseInt(mechProperties.mechItemSlots);		
		
		result.noEquips = !!(mechProperties.mechNoEquips * 1 || 0);
			
		if(forActor){
			if(result.inheritsUpgradesFrom){
				result.stats.upgradeLevels = this.getStoredMechData(result.inheritsUpgradesFrom).mechUpgrades;
				result.genericFUBAbilityIdx = this.getStoredMechData(result.inheritsUpgradesFrom).genericFUBAbilityIdx;	
				result.unlockedWeapons = this.getStoredMechData(result.inheritsUpgradesFrom).unlockedWeapons;					
			} else {
				result.stats.upgradeLevels = this.getStoredMechData(mech.id).mechUpgrades;
				result.genericFUBAbilityIdx = this.getStoredMechData(result.id).genericFUBAbilityIdx;
				result.unlockedWeapons = this.getStoredMechData(result.id).unlockedWeapons;	
			}			
			var storedSubPilots = this.getStoredMechData(result.id).subPilots;
			if(storedSubPilots){
				result.subPilots = storedSubPilots;
			}			
			result.items = this.getActorMechItems(mech.id);
		} else {
			result.items = items || [];
			result.unlockedWeapons = this.getStoredMechData(result.id).unlockedWeapons;				
		}
		
		if(typeof result.genericFUBAbilityIdx != "undefined"){
			result.genericFullUpgradeAbility = {
				idx: parseInt(result.genericFUBAbilityIdx),
				level: 0,
				requiredLevel: 0
			}
		}
		
		var spawnAnimInfo = JSON.parse(JSON.stringify(this.defaultSpawnAnim));
		
		if(mechProperties.mechSpawnAnimName){
			spawnAnimInfo.name = mechProperties.mechSpawnAnimName;
		}
		
		if(mechProperties.mechSpawnAnimFrameSize){
			spawnAnimInfo.frameSize = mechProperties.mechSpawnAnimFrameSize * 1;
		}
		
		if(mechProperties.mechSpawnAnimSheetWidth){
			spawnAnimInfo.sheetWidth = mechProperties.mechSpawnAnimSheetWidth * 1;
		}
		
		if(mechProperties.mechSpawnAnimFrames){
			spawnAnimInfo.frames = mechProperties.mechSpawnAnimFrames * 1;
		}
		
		if(mechProperties.mechSpawnAnimSpeed){
			spawnAnimInfo.speed = mechProperties.mechSpawnAnimSpeed * 1;
		}
		
		if(mechProperties.mechSpawnAnimAppearFrame){
			spawnAnimInfo.appearFrame = mechProperties.mechSpawnAnimAppearFrame * 1;
		}
		
		if(mechProperties.mechSpawnAnimSoundEffect){
			spawnAnimInfo.se = mechProperties.mechSpawnAnimSoundEffect;
		}
		
		result.spawnAnimInfo = spawnAnimInfo;
		
		
		var destroyAnimInfo = JSON.parse(JSON.stringify(this.defaultDestroyAnim));
		
		if(mechProperties.mechDestroyAnimName){
			destroyAnimInfo.name = mechProperties.mechDestroyAnimName;
		}
		
		if(mechProperties.mechDestroyAnimFrameSize){
			destroyAnimInfo.frameSize = mechProperties.mechDestroyAnimFrameSize * 1;
		}
		
		if(mechProperties.mechDestroyAnimSheetWidth){
			destroyAnimInfo.sheetWidth = mechProperties.mechDestroyAnimSheetWidth * 1;
		}
		
		if(mechProperties.mechDestroyAnimFrames){
			destroyAnimInfo.frames = mechProperties.mechDestroyAnimFrames * 1;
		}
		
		if(mechProperties.mechDestroyAnimSpeed){
			destroyAnimInfo.speed = mechProperties.mechDestroyAnimSpeed * 1;
		}
		
		if(mechProperties.mechDestroyAnimAppearFrame){
			destroyAnimInfo.appearFrame = mechProperties.mechDestroyAnimAppearFrame * 1;
		}
		
		if(mechProperties.mechDestroyAnimSoundEffect){
			destroyAnimInfo.se = mechProperties.mechDestroyAnimSoundEffect;
		}
		
		result.destroyAnimInfo = destroyAnimInfo;

		if(mechProperties.mechMoveSoundAssignments){
			const parts = String(mechProperties.mechMoveSoundAssignments || "").split(",");
			let assignments = {};
			for(let part of parts){
				const innerParts = part.split(":");
				const spriteFrame = String(innerParts[0]).trim();
				const seName = String(innerParts[1]).trim();
				assignments[spriteFrame] = seName;
			}
			result.moveSoundAssignments = assignments;
		}

		if(mechProperties.mechMoveSoundPitch){
			result.moveSoundPitch = mechProperties.mechMoveSoundPitch;
		}		
		
		var mechData = {
			SRWStats: {
				pilot: {
					abilities: [],
					level: 0,
					SRWInitialized: true
				},			
				mech: result			
			},
			SRWInitialized: true
		}		
		
		if(mechProperties.mechTransformsWhenTargetMissing){
			var parts = mechProperties.mechTransformsWhenTargetMissing.split(",");
			result.relativeTransform = {
				type: "missing",
				relativeTo: parts[0] * 1,
				tranformTarget: parts[1] * 1,
			};
		}
		
		if(mechProperties.mechTransformsWhenTargetPresent){
			var parts = mechProperties.mechTransformsWhenTargetPresent.split(",");
			result.relativeTransform = {
				type: "present",
				relativeTo: parts[0] * 1,
				tranformTarget: parts[1] * 1,
			};
		}
		
		if(refActor){
			//invalidate abi cache to apply mech abilities before resolving weapons
			//resolive weapons with access to the ref actor
			this.invalidateAbilityCache(refActor);
			result.weapons = this.getMechWeapons(refActor, mechProperties, previousWeapons);
		} else {
			result.weapons = this.getMechWeapons(mechData, mechProperties, previousWeapons);
		}
		
		
		result.tags = {};
		if(mechProperties.mechTags){
			var parts = mechProperties.mechTags.split(",");
			parts.forEach(function(tag){
				result.tags[String(tag).trim()] = true;
			});
		}
	}
	return result;
}

StatCalc.prototype.getMoveSoundInfo = function(actor){
	let result = {
		seAssignments: {},
		pitch: 100
	};
	if(this.isActorSRWInitialized(actor)){
		result.seAssignments = actor.SRWStats.mech.moveSoundAssignments || {};
		result.pitch = (actor.SRWStats.mech.moveSoundPitch || 100) * 1;
	}
	return result;
}

StatCalc.prototype.getMechTagsById = function(mechId){
	var result = {};
	if($dataClasses[mechId]){
		var mechProperties = $dataClasses[mechId].meta;	
		if(mechProperties.mechTags){
			var parts = mechProperties.mechTags.split(",");
			parts.forEach(function(tag){
				result[String(tag).trim()] = true;
			});
		}
	}
		
	return result;
}

StatCalc.prototype.getActorTags = function(actorId){
	var result = {};
	if($dataActors[actorId]){
		var actorProperties = $dataActors[actorId].meta;
		if(actorProperties.pilotTags){
			var parts = actorProperties.pilotTags.split(",");
			parts.forEach(function(tag){
				result[String(tag).trim()] = true;
			});
		}	
		return result;
	}
}

StatCalc.prototype.getEnemyTags = function(actorId){
	var result = {};
	if($dataEnemies[actorId]){
		var actorProperties = $dataEnemies[actorId].meta;	
		if(actorProperties.pilotTags){
			var parts = actorProperties.pilotTags.split(",");
			parts.forEach(function(tag){
				result[String(tag).trim()] = true;
			});
		}	
	}	
	return result;
}

StatCalc.prototype.getPilotTags = function(actor){
	var result = {};
	if(this.isActorSRWInitialized(actor)){
		result = actor.SRWStats.pilot.tags;
	}
	return result;
}

StatCalc.prototype.getMechTags = function(actor){
	var result = {};
	if(this.isActorSRWInitialized(actor)){
		result = actor.SRWStats.mech.tags;
	}
	return result;
}

StatCalc.prototype.getWeaponTags = function(weapon){
	var result = {};
	if(this.isActorSRWInitialized(actor)){
		result = weapon.tags;
	}
	return result;
}

StatCalc.prototype.getSpawnAnimInfo = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech && actor.SRWStats.mech.spawnAnimInfo){
		return actor.SRWStats.mech.spawnAnimInfo
	} else {
		return JSON.parse(JSON.stringify(this.defaultSpawnAnim));
	}
}

StatCalc.prototype.getDestroyAnimInfo = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech && actor.SRWStats.mech.destroyAnimInfo){
		return actor.SRWStats.mech.destroyAnimInfo
	} else {
		return JSON.parse(JSON.stringify(this.defaultDestroyAnim));
	}
}

StatCalc.prototype.getSubPilots = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech){
		return actor.SRWStats.mech.subPilots || [];
	} else {
		return [];
	}
}

StatCalc.prototype.swap = function(actor, force){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(this.isMainTwin(actor)){	
			
			var twin = actor.subTwin;
			
			if(this.canSwap(actor, twin) || force){		
				let targetSuperState = this.getSuperState(actor);
				actor.subTwin = null;
				actor.subTwinId = null;
				actor.isSubTwin = true;
				//actor.mainTwin = twin;
				
				twin.subTwin = actor;
				twin.subTwinId = actor.actorId(); 
				twin.isSubTwin = false;	
				//twin.mainTwin = null;	
				
				this.applyDeployActions(twin.SRWStats.pilot.id, twin.SRWStats.mech.id);			
				
				this.setSuperState(twin, targetSuperState);
				twin.event = actor.event;
				actor.event = null;
				$gameSystem.setEventToUnit(twin.event.eventId(), 'actor', twin.actorId());
										
				twin.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
				twin.event.refreshImage();		
				this.invalidateAbilityCache();
			}			
		}		
	}
}

StatCalc.prototype.swapEvent = function(event, force){
	var actor = $gameSystem.EventToUnit(event.eventId())[1];
	if(actor && this.isActorSRWInitialized(actor)){
		if(this.isMainTwin(actor)){
			var twin = actor.subTwin;
			actor.subTwin = null;
			//actor.subTwinId = null;
			actor.isSubTwin = true;
			//actor.mainTwin = twin;
			
			twin.subTwin = actor;
			//twin.subTwinId = actor.actorId();
			twin.isSubTwin = false;	
			//twin.mainTwin = null;	
			
			this.applyDeployActions(twin.SRWStats.pilot.id, twin.SRWStats.mech.id);			
			
			twin.event = actor.event;
			actor.event = null;
			$gameSystem.setEventToUnit(twin.event.eventId(), twin.isActor() ? 'actor' : 'enemy', twin.isActor() ? twin.actorId() : twin);
									
			//twin.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			twin.event.refreshImage();		
			this.invalidateAbilityCache();
		}		
	}
}

StatCalc.prototype.clearTwinPositionInfo = function(actor){
	actor.positionBeforeTwin = null;
	actor.positionBeforeCombine = null;
	if(actor.subTwin){
		actor.subTwin.positionBeforeTwin = null;
		actor.subTwin.positionBeforeCombine = null;
	}
	var subPilots = this.getSubPilots(actor);
	subPilots.forEach(function(pilotId){
		var actor = $gameActors.actor(pilotId);
		if(actor){
			actor.positionBeforeTwin = null;
			actor.positionBeforeCombine = null;
		}		
	});
}

StatCalc.prototype.separate = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(this.isMainTwin(actor)){		
			var twin = actor.subTwin;
			actor.subTwin = null;	
			actor.subTwinId = null;
			//twin.mainTwin = null;
			twin.isSubTwin = false;
			
			if(actor.positionBeforeTwin && this.isFreeSpace(actor.positionBeforeTwin)){
				actor.event.locate(actor.positionBeforeTwin.x, actor.positionBeforeTwin.y);
			}

			this.applyDeployActions(twin.SRWStats.pilot.id, twin.SRWStats.mech.id);
			
			var event = twin.event;
			if(!event){
				event = $gameMap.requestDynamicEvent();
				twin.event = event;
				event.setType("actor");
				$gameSystem.setEventToUnit(twin.event.eventId(), 'actor', twin.actorId());
			}
			if(event){				
				var space;
				if(twin.positionBeforeTwin && this.isFreeSpace(twin.positionBeforeTwin)){
					space = twin.positionBeforeTwin;
				} else {
					space = this.getAdjacentFreeStandableSpace(twin, {x: actor.event.posX(), y: actor.event.posY()});
				}		
					
				event.appear();
				event.locate(space.x, space.y);
				
				event.refreshImage();
				twin.initImages(twin.SRWStats.mech.classData.meta.srpgOverworld.split(","));
				twin.event.refreshImage();
			}			

			//this invalidation and reload ensures that the spawned unit has its stats calculated with abilities taken into account
			this.invalidateAbilityCache();
			this.reloadSRWStats(actor, true);
			this.reloadSRWStats(twin, true);
			this.invalidateAbilityCache();	

			this.updateSuperState(actor);
			this.updateSuperState(twin);
			
				
				//
				
		}	
	}
}

StatCalc.prototype.isSubTwinOnly = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.subTwinOnly;
	}
}

StatCalc.prototype.isMainTwinOnly = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.mainTwinOnly
	}
}

StatCalc.prototype.twin = function(actor, otherActor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(!this.isMainTwin(actor) && !this.isMainTwin(otherActor)){
			
			if(!this.isTwinSlotConflict(actor, otherActor) && (this.isSubTwinOnly(actor) || this.isMainTwinOnly(otherActor))){
				var tmp = otherActor;
				otherActor = actor;
				actor = tmp;
			}
			
			actor.subTwin = otherActor;
			actor.subTwinId = otherActor.actorId();
			actor.isSubTwin = false;
			//actor.mainTwin = null;
			actor.positionBeforeTwin = {x: actor.event.posX(), y: actor.event.posY()};
			
			otherActor.subTwin = null;
			otherActor.isSubTwin = true;	
			//otherActor.mainTwin = actor;	
					
			otherActor.positionBeforeTwin = {x: otherActor.event.posX(), y: otherActor.event.posY()};
			otherActor.event.erase();
			otherActor.event.isUnused = true;
			otherActor.event = null;	
			let actorSuperState = this.getSuperState(actor);
			this.setSuperState(otherActor, actorSuperState, true);

			//this invalidation and reload ensures that the spawned unit has its stats calculated with abilities taken into account
			this.invalidateAbilityCache();
			this.reloadSRWStats(actor, true);
			
			this.invalidateAbilityCache();
		}		
	}
}

StatCalc.prototype.validateTwinTarget = function(actor, noLiveChecks){
	if(actor){
		if(!actor.isActor()){
			return false;
		}
		if(this.isShip(actor)){
			return false;
		}
		if(this.isMainTwin(actor) && !noLiveChecks){
			return false;
		}
		if(this.getCurrentWill(actor) < 110 && !noLiveChecks){
			return false;
		}
		if(actor.SRWStats.battleTemp.hasFinishedTurn){
			return false;
		}
		if(actor.SRWStats.mech.noTwin){
			return false;
		}
	}	
	return true;
}

StatCalc.prototype.isTwinMismatch = function(actor, otherActor){
	return !!actor.isSubTwin != !!otherActor.isSubTwin;
}

StatCalc.prototype.isTwinSlotConflict = function(actor, otherActor){
	return (
		(this.isSubTwinOnly(actor) && this.isSubTwinOnly(otherActor)) || 
		(this.isMainTwinOnly(actor) && this.isMainTwinOnly(otherActor))
	);
}

StatCalc.prototype.canSwap = function(actor){
	return this.isMainTwin(actor) && 
	(
		this.isTwinSlotConflict(actor, actor.subTwin) || 
		(!$statCalc.isMainTwinOnly(actor) && !$statCalc.isSubTwinOnly(actor.subTwin))
	) && (!this.isDisabled(actor) && !this.isDisabled(actor.subTwin))
}

StatCalc.prototype.canDisband = function(actor){
	const referenceEvent = this.getReferenceEvent(actor);
	const position = {x: referenceEvent.posX(), y: referenceEvent.posY()};

	let hasValidDisbandPosition = this.canStandOnTileResolve(actor, {x: position.x , y: position.y}, true);

	const subTwin = actor.subTwin;
	let twinHasValidDisbandPosition = false;
	if(this.canStandOnTileResolve(subTwin, {x: position.x + 1, y: position.y}, true)){
		twinHasValidDisbandPosition = true;
	}
	if(this.canStandOnTileResolve(subTwin, {x: position.x - 1, y: position.y}, true)){
		twinHasValidDisbandPosition = true;
	}
	if(this.canStandOnTileResolve(subTwin, {x: position.x, y: position.y + 1}, true)){
		twinHasValidDisbandPosition = true;
	}
	if(this.canStandOnTileResolve(subTwin, {x: position.x, y: position.y - 1}, true)){
		twinHasValidDisbandPosition = true;
	}
	
	return this.isMainTwin(actor) && (!this.isDisabled(actor) && !this.isDisabled(actor.subTwin)) && hasValidDisbandPosition && twinHasValidDisbandPosition;
}

StatCalc.prototype.canTwin = function(actor, otherActor){
	var _this = this;
	var result = false;
	
	if(!this.validateTwinTarget(actor)){
		return false;
	}
	
	if(this.isActorSRWInitialized(actor)){
		var adjacent = _this.getAdjacentActorsWithDiagonal(actor.isActor() ? "actor" : "enemy", {x: actor.event.posX(), y: actor.event.posY()});
		
		var valid = [];
		adjacent.forEach(function(candidate){
			var isSlotConflict = ENGINE_SETTINGS.USE_STRICT_TWIN_SLOTS && _this.isTwinSlotConflict(actor, candidate);
					
			if((!otherActor || candidate == otherActor) && _this.validateTwinTarget(candidate) && !isSlotConflict){
				valid.push(candidate);
			}
		});		
		result = valid.length > 0;
	}
	return result;
}

StatCalc.prototype.getTransformationList = function(actor){
	var tmp = actor.SRWStats.mech.transformsInto || [];
	var result = [];
	for(var i = 0; i < tmp.length; i++){
		var willOK = (actor.SRWStats.mech.transformWill[i] || 0) <= this.getCurrentWill(actor);	
		var terrainOK = this.canStandOnTileAfterTransformation(actor, tmp[i]);
		if(terrainOK && willOK && !$gameSystem.isTransformationLocked(actor.SRWStats.mech.id, i)){
			result.push(tmp[i]);
		}
	}
	return result;
}

StatCalc.prototype.applyRelativeTransforms = function(){
	var _this = this;
	var deployed = {};
	_this.iterateAllActors("actor", function(actor, event){			
		if(!event.isErased()){
			deployed[actor.SRWStats.mech.id] = true;
		}						
	});
	
	_this.iterateAllActors("actor", function(actor){			
		var relativeTransform = actor.SRWStats.mech.relativeTransform;
		if(relativeTransform){
			if(relativeTransform.type == "missing" && !deployed[relativeTransform.relativeTo]){
				_this.transform(actor, -1, true, relativeTransform.tranformTarget);
			}
			if(relativeTransform.type == "present" && deployed[relativeTransform.relativeTo]){
				_this.transform(actor, -1, true, relativeTransform.tranformTarget);
			}
		}
	});
}

StatCalc.prototype.getTransformCmdName = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.classData.meta.mechTransformCmd;
	} 
	return "";
}

StatCalc.prototype.canTransform = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		return this.getTransformationList(actor).length;
	} 
	return false;
}

StatCalc.prototype.anyAllyCanTransform = function(actor){
	var result = false;
	$statCalc.iterateAllActors("actor", function(actor, event){
		if(actor && event && !event.isErased() && !actor.srpgTurnEnd()){
			if(ENGINE_SETTINGS.TRANSFORM_ALL_EXCEPTIONS.indexOf(actor.actorId()) == -1){
				var list = $statCalc.getTransformationList(actor);
				if(list.length){
					result = true;
				}
			}				
		}
	});
	return result;
}

StatCalc.prototype.transform = function(actor, idx, force, forcedId, noRestore){
	var _this = this;
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(idx == null){
			idx = 0;
		}
		//force must be evaluated first to avoid an infinte call chain with canStandOnTileAfterTransformation
		if(force || this.canTransform(actor)){	
			var calculatedStats = this.getCalculatedMechStats(actor);
			var previousHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
			var previousENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
			var unitsOnBoard = actor.SRWStats.mech.unitsOnBoard;
			var restoreInfo = actor.SRWStats.mech.transformRestores || {HP: false, EN: false};
			var transformIntoId = actor.SRWStats.mech.transformsInto[idx];
			if(forcedId){
				transformIntoId = forcedId;
			}			
						
			if(transformIntoId != null){			
				var targetMechData = this.getMechDataById(transformIntoId, true);
			
				actor.isSubPilot = false;
				actor.SRWStats.mech = this.getMechDataById(transformIntoId, true);
				
				this.calculateSRWMechStats(actor.SRWStats.mech, false, actor);
				
				
				var actionsResult = this.applyDeployActions(actor.SRWStats.pilot.id, actor.SRWStats.mech.id);

				

				//store the sub twin and unassign it from the current actor so that if the pilot changes the previous pilot does not retain an old reference
				//must be done after deploy actions as those reassign the sub twin otherwise
				var subTwin = actor.subTwin;
				this.resetTwinState(actor);
				
				//undeployed pilost must be checked to properly transform with a subpilot to main pilot transition
				var targetActor = this.getCurrentPilot(transformIntoId, true);
				if(targetActor && targetActor.actorId() != actor.actorId() && actor.event){
					this.syncStageTemp(targetActor, actor);
					targetActor.event = actor.event;
					actor.event = null;
					$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());
					const subPilots = this.getSubPilots(actor);
					actor = targetActor;
					actor.SRWStats.mech.subPilots = subPilots;//(hack) force the live copy of the new actor's mech data to have an up to date sub pilot list
				}		
				
				actor.SRWStats.mech.unitsOnBoard = unitsOnBoard;
							
				calculatedStats = this.getCalculatedMechStats(actor);
				if(!restoreInfo.HP || !noRestore){				
					calculatedStats.currentHP = Math.round(previousHPRatio * calculatedStats.maxHP);
				}	
				if(!restoreInfo.EN || !noRestore){	
					calculatedStats.currentEN = Math.round(previousENRatio * calculatedStats.maxEN);
				}
										
				actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
				if(actor.event){
					actor.event.refreshImage();
				}
				
				var subPilots = this.getSubPilots(actor);
				
				var mainPilot = actor;
				var ctr = 0;
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					if(actor){
						actor.isSubPilot = true;
						actor.subPilotSlot = ctr;
						actor.mainPilot = mainPilot;						
						_this.reloadSRWStats(actor);										
					}			
				});					
				if(subTwin){
					this.resetTwinState(subTwin);
					subTwin.isSubTwin = true;
					actor.subTwin = subTwin;					
				}				
				this.invalidateAbilityCache(actor);
				this.updateSuperState(actor);
			}			
		}		
	}
}

StatCalc.prototype.transformOnDestruction = function(actor, force){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){		
		var subTwin = actor.subTwin;
		var transformIntoId = actor.SRWStats.mech.destroyTransformInto;
		var targetActorId = actor.SRWStats.mech.destroyTransformedActor;
		
		actor.isSubPilot = false;
		actor.SRWStats.mech = this.getMechDataById(transformIntoId, true);
		this.calculateSRWMechStats(actor.SRWStats.mech, false, actor);
		let actionsResult = this.applyDeployActions(actor.SRWStats.pilot.id, actor.SRWStats.mech.id);
		
		if(targetActorId != null){
			var targetActor = $gameActors.actor(targetActorId);			
			if(targetActor.actorId() != actor.actorId()){
				this.syncStageTemp(targetActor, actor);
				if(this.isActorSRWInitialized(targetActor)){
					targetActor.event = actor.event;
					actor.event = null;
					actor.isSubPilot = true;
					//actor.SRWStats.mech = null;
					$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());
					actor = targetActor;
				}
			}
		}		
		
		if(subTwin){
			actor.subTwin = subTwin;
		}
		this.recoverHPPercent(actor, 100);			
		this.recoverENPercent(actor, 100);		
		this.recoverAmmoPercent(actor, 100);			
		actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
		actor.event.refreshImage();							
	}
}

StatCalc.prototype.getSwapOptions = function(actor){
	let result = [];
	let sourceEvent = this.getReferenceEvent(actor);
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(actor.SRWStats.mech.canQuickSwap){
			let candidates = actor.SRWStats.mech.allowedPilots;
			result = candidates.filter(entry => {
				let isValid = true;
				if(entry == actor.actorId()){
					isValid = false;
				}
				if($gameParty._actors.indexOf(entry * 1) == -1){
					isValid = false;
				}
				let targetEvent = this.getReferenceEvent($gameActors.actor(entry));
				if(targetEvent && sourceEvent != targetEvent){
					isValid = false;
				}
				return isValid;
			});
		}		
	}
	return result;
}

StatCalc.prototype.canSwapPilot = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		return this.getSwapOptions(actor).length > 0;		
	}
	return false;
}

StatCalc.prototype.swapPilot = function(actor, newActorId){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		const previousActorId = actor.actorId();
		let event = this.getReferenceEvent(actor)
		let currentMechId = actor.SRWStats.mech.id;
		let currentMechData = JSON.parse(JSON.stringify(actor.SRWStats.mech));
		
		let sourceSpirits = this.getActiveSpirits(actor);
		this.resetSpiritsAndEffects(actor);
		
		
		let targetPilot = $gameActors.actor(newActorId);
		//force reassigns for these deploy actions to allow swapping of pilots from units in locked slots
		var actionsResult = this.applyDeployActions(newActorId, currentMechId, null, true);
		if(!actionsResult){//if no deploy actions are assigned	
			actor._classId = 0;
			$statCalc.reloadSRWStats(actor, false, true);			
			targetPilot._classId = currentMechId;
			targetPilot.isSubPilot = false;
			$statCalc.reloadSRWStats(targetPilot, false, true);				
			this.invalidateAbilityCache();
				
		}	
		currentMechData.subPilots = targetPilot.SRWStats.mech.subPilots;
		
		
		for(let spirit in sourceSpirits){
			if(sourceSpirits[spirit]){
				this.setSpirit(targetPilot, spirit);
			}
		}
		targetPilot.isSubPilot = false;
		targetPilot.event = event;
		$gameSystem.setEventToUnit(event.eventId(), 'actor', targetPilot.actorId());
		this.invalidateAbilityCache();
		this.reloadSRWStats(targetPilot, false, true);
		targetPilot.SRWStats.mech = currentMechData;
		
		//abilities used tracking and items used tracking should be shared beween all pilots in a mech
		this.syncStageTemp(targetPilot, actor);
		
		event.refreshImage();	
		
		//workaround for issue where the deploy list loses track of the original pilot 
		const deployInfo = $gameSystem.getDeployInfo();
			
		Object.keys(deployInfo.assigned).forEach(function(slot){
			if(deployInfo.lockedSlots[slot]){
				if(deployInfo.assigned[slot] == previousActorId){
					deployInfo.assigned[slot] = newActorId;
				}
			}
		});
		$gameSystem.setDeployInfo(deployInfo);
	}
}

StatCalc.prototype.syncStageTemp = function(targetActor, sourceActor){
	targetActor.SRWStats.stageTemp.abilityUsed = sourceActor.SRWStats.stageTemp.abilityUsed;
	targetActor.SRWStats.stageTemp.inventoryConsumed = sourceActor.SRWStats.stageTemp.inventoryConsumed;
}

StatCalc.prototype.split = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		var combineInfo = actor.combineInfo;
		var targetActor = actor;
		var calculatedStats = this.getCalculatedMechStats(actor);
		var combinedHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
		var combinedENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
		
		var subPilots = JSON.parse(JSON.stringify(targetActor.SRWStats.mech.subPilots));
		
		const startFromMechId = actor.SRWStats.mech.id;
		/*targetActor.SRWStats.mech = this.getMechData(actor.currentClass(), true);
		this.calculateSRWMechStats(targetActor.SRWStats.mech);	*/	
		
		
		
		/*calculatedStats = this.getCalculatedMechStats(targetActor);
		calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
		calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);*/
		var combinesFrom = actor.SRWStats.mech.combinesFrom;
		if(!combineInfo || !combineInfo.participants){
			let tmp = [];
			let assignedPrimaryEvent = false;
			for(let mechId of combinesFrom){
				let newActor = this.getCurrentPilot(mechId, true, false, true);
				//hacky solution to let a precombined unit split 
				//this resolves the issue where for the main pilot of the combined unit the current mech is set to the combined unit and not to the split part Unit
				//note that this will cause issues if other pilots in the split also do not have a mech id set!
				if(!newActor){
					newActor = actor;
				}
				if(newActor){
					if(!assignedPrimaryEvent && newActor.actorId() == actor.actorId()){
						assignedPrimaryEvent = true;
						newActor.event = actor.event;
						newActor.positionBeforeCombine = {
							x: actor.event.posX(),
							y: actor.event.posY()
						}
					}
					
					
					if(!newActor.reversalInfo){
						newActor.reversalInfo = {};
					}
					newActor.reversalInfo[startFromMechId] = mechId;
					tmp.push(newActor.actorId());
				}
			}
			combineInfo = {
				participants: tmp
			};
			if(!assignedPrimaryEvent && tmp.length){
				const primaryActor = tmp[0];
				primaryActor.event = actor.event;
				primaryActor.positionBeforeCombine = {
					x: actor.event.posX(),
					y: actor.event.posY()
				}
			}
		}

		for(var i = 0; i < combineInfo.participants.length; i++){
			var actor;
			actor = $gameActors.actor(combineInfo.participants[i]);	
			if(actor && actor.reversalInfo[startFromMechId]){	
				if(!this.isActorSRWInitialized(actor)){
					this.initSRWStats(actor);
				}
				var actionsResult = this.applyDeployActions(combineInfo.participants[i], actor.reversalInfo[startFromMechId]);
				if(!actionsResult){//if no deploy actions are assigned to main split target
					actor.SRWStats.mech = this.getMechDataById(actor.reversalInfo[startFromMechId], true);
					this.calculateSRWMechStats(actor.SRWStats.mech);					
				}			
				actor.isSubPilot = false;
				
				var event = actor.event;
				if(!event){
					event = $gameMap.requestDynamicEvent(targetActor.event)
					actor.event = event;
					event.setType(targetActor.event.isType());
					$gameSystem.setEventToUnit(actor.event.eventId(), 'actor', actor.actorId());
					
					//SceneManager.reloadCharacters();
				}
				if(event){
					//if(actor.actorId() != targetActor.actorId()){
					var space;
					if(actor.positionBeforeCombine && (this.isFreeSpace(actor.positionBeforeCombine) || (targetActor.event.posX() == actor.positionBeforeCombine.x && targetActor.event.posY() == actor.positionBeforeCombine.y))){
						space = actor.positionBeforeCombine;
						actor.positionBeforeCombine = null;
					} else if(actor.actorId() != targetActor.actorId()){
						space = this.getAdjacentFreeSpace({x: targetActor.event.posX(), y: targetActor.event.posY()});
					}
					
					if(space){
						event.appear();
						event.locate(space.x, space.y);
					}
					$gameSystem.setEventToUnit(actor.event.eventId(), 'actor', actor.actorId());
					//}
					event.refreshImage();
					actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
					actor.event.refreshImage();
				}	
				
				//this invalidation and reload ensures that the spawned unit has its stats calculated with abilities taken into account
				this.invalidateAbilityCache();
				this.reloadSRWStats(actor, true);
				
				var calculatedStats = this.getCalculatedMechStats(actor);
				calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
				calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);	
				
				this.updateSuperState(actor);	
				//
			}
		}				
	}
}

StatCalc.prototype.combine = function(actor, forced){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		var combineResult = this.canCombine(actor, forced);
		let combineReversalInfo = [];
		if(combineResult.isValid){
			var HPRatioSum = 0;
			var HPRatioCount = 0;
			var ENRatioSum = 0;
			var ENRatioCount = 0;
			var combinesInto = combineResult.combinesInto;
			let potentialSuperStates = {}; 
			
			for(var i = 0; i < combineResult.participants.length; i++){
				var combineActor = $gameActors.actor(combineResult.participants[i]);
				if(!combineActor.reversalInfo){
					combineActor.reversalInfo = {};
				}
				combineActor.reversalInfo[combinesInto] = combineActor._classId;
				var combineEvent = this.getReferenceEvent(combineActor);
				combineActor.positionBeforeCombine = {x: combineEvent.posX(), y: combineEvent.posY()};
				var calculatedStats = this.getCalculatedMechStats(combineActor);
				HPRatioSum+=calculatedStats.currentHP / calculatedStats.maxHP;
				HPRatioCount++;
				ENRatioSum+=calculatedStats.currentEN / calculatedStats.maxEN;
				ENRatioCount++;	
				potentialSuperStates[this.getSuperState(combineActor)] = true;
			}
			
			var targetMechData = this.getMechDataById(combinesInto, true);
			
			let actionsResult = this.applyDeployActions(actor.SRWStats.pilot.id, combinesInto);
			
			var targetActor = this.getCurrentPilot(combinesInto);
			if(!targetActor){
				targetActor = actor;
				actor.SRWStats.mech = targetMechData;
			}
			targetActor.combineInfo = combineResult;
		
			
			this.calculateSRWMechStats(targetActor.SRWStats.mech);
			//$gameSystem.redeployActor(targetActor, targetActor.event);
			for(var i = 0; i < combineResult.participants.length; i++){
				if(combineResult.participants[i] != targetActor.actorId()){	
					var actor = $gameActors.actor(combineResult.participants[i]);
					if(actor.event)	{
						actor.event.erase();
						$gameSystem.clearEventToUnit(actor.event.eventId());
					}					
				}
			}
			
			//this invalidation and reload ensures that the spawned unit has its stats calculated with abilities taken into account
			this.invalidateAbilityCache();
			this.reloadSRWStats(actor, true);
			
			calculatedStats = this.getCalculatedMechStats(targetActor);
			calculatedStats.currentHP = Math.round(calculatedStats.maxHP * HPRatioSum / HPRatioCount);
			calculatedStats.currentEN = Math.round(calculatedStats.maxEN * ENRatioSum / ENRatioCount);
			//targetActor.event.locate(actor.event.posX(), actor.event.posY());
			targetActor.initImages(targetActor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			targetActor.event.refreshImage();
			
			$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());

			//this.setSuperState(targetActor, hasFlyer, true);
			let sortedStates = Object.keys(potentialSuperStates).sort((a,b) => {return $terrainTypeManager.getTerrainDefinition(b).priority - $terrainTypeManager.getTerrainDefinition(a).priority});
			let newState = -1;
			let ctr = 0;
			while(newState == -1 && ctr < sortedStates.length){
				if(this.canBeOnTerrain(targetActor, sortedStates[ctr])){
					newState = sortedStates[ctr];
				}
				ctr++;
			}
			this.setSuperState(targetActor, newState);
			this.updateSuperState(targetActor, false);
		}		
	}
}

StatCalc.prototype.isCombined = function(actor){
	if(this.isActorSRWInitialized(actor)){
		 return actor.SRWStats.mech.combinesFrom && actor.SRWStats.mech.combinesFrom.length;
	} else {
		return false;
	}
}

StatCalc.prototype.canCombine = function(actor, forced){
	var result = {
		isValid: false,
		participants: []
	};
	var _this = this;
	if(this.isActorSRWInitialized(actor) && (!$gameSystem.isCombineLocked(actor.SRWStats.mech.id) || forced)){
		var combinesInto = actor.SRWStats.mech.combinesInto;
		if(combinesInto != null){
			var mechData = this.getMechDataById(combinesInto)
			var required = mechData.combinesFrom;
			if(!required){
				return result; //early return if no combinesFrom info is defined
			}
			var requiredWill = actor.SRWStats.mech.combineWill || 0;
			var requiredLookup = {};
			for(var i = 0; i < required.length; i++){
				requiredLookup[required[i]] = true;
			}
			var stack = [actor];
			var candidates = [];
			var visited = {};
			while(candidates.length < required.length && stack.length){
				var current = stack.pop();
				if(current.event && !visited[current.event.eventId()] && ($statCalc.getCurrentWill(current) >= requiredWill || forced)){
					var currentMechId = current.SRWStats.mech.id;
					if(!current.event.isErased() && requiredLookup[currentMechId] && !current.isSubTwin && !_this.isMainTwin(current) && (!$gameSystem.isCombineLocked(currentMechId) || forced)){
						current.mechBeforeTransform = currentMechId;
						candidates.push(current.actorId());
					}
					var adjacent;
					if(!forced){
						adjacent = _this.getAdjacentActors(actor.isActor() ? "actor" : "enemy", {x: current.event.posX(), y: current.event.posY()});
					} else {
						adjacent = _this.getAllCandidateActors(actor.isActor() ? "actor" : "enemy");
					}
						
					for(var i = 0; i < adjacent.length; i++){
						if(adjacent[i].event && !visited[adjacent[i].event.eventId()]){							
							stack.push(adjacent[i]);
						}
					}
					visited[current.event.eventId()] = true;
				}				
			}
			if(candidates.length == required.length || forced){
				result = {
					isValid: true,
					participants: candidates,
					combinesInto: combinesInto
				};
			}
		}
	}
	return result;
}

StatCalc.prototype.applyStoredActorData = function(actor, dbAbilities, dbRelationships){
	if(actor.isActor()){
		var storedData = $SRWSaveManager.getActorData(actor.actorId());
		actor.SRWStats.pilot.PP = storedData.PP;
		actor.SRWStats.pilot.exp = storedData.exp;
		actor.SRWStats.pilot.kills = storedData.kills;
		actor.SRWStats.pilot.stats.upgrades = storedData.pilotUpgrades;	
		actor.SRWStats.pilot.customSpirits = storedData.customSpirits || {};	
		
		var storedAbilities = $SRWSaveManager.getActorData(actor.actorId()).abilities || {};
		var usedSlots = {};
		Object.keys(storedAbilities).forEach(function(abilityIdx){
			var slot = storedAbilities[abilityIdx].slot;
			if(slot != -1){
				usedSlots[slot] = true;
			}
		});
		function getSlot(){
			var slot = -1;
			var ctr = 0;
			while(slot == -1 && ctr < 6){
				if(!usedSlots[ctr]){
					slot = ctr;
				}
				ctr++;
			}
			return slot;
		}
		
		Object.keys(dbAbilities).forEach(function(abilityIdx){
			if(!storedAbilities[abilityIdx]){//newly added ability for the unit in the db
				var slot =  dbAbilities[abilityIdx].slot;
				if(slot == null || usedSlots[slot]){
					slot = getSlot();
				}				
				usedSlots[slot] = true;
				storedAbilities[abilityIdx] = {
					idx: abilityIdx,
					level: dbAbilities[abilityIdx].level,
					requiredLevel: dbAbilities[abilityIdx].requiredLevel,
					slot: slot
				}
			} else {
				if(storedAbilities[abilityIdx].level < dbAbilities[abilityIdx].level){
					storedAbilities[abilityIdx].level = dbAbilities[abilityIdx].level;
				}
			}
		});
		
		actor.SRWStats.pilot.abilities = storedAbilities;
		
		var storedRelationships = storedData.relationships || {};
		
		Object.keys(dbRelationships).forEach(function(targetActor){
			if(!storedRelationships[targetActor]){
				storedRelationships[targetActor] = dbRelationships[targetActor];
			}
		});
		
		actor.SRWStats.pilot.relationships = storedRelationships;
		
		if(storedData.customSpirits){
			for(let slot in storedData.customSpirits){
				actor.SRWStats.pilot.spirits[slot] = {
					idx: storedData.customSpirits[slot].idx * 1,
					level: storedData.customSpirits[slot].level * 1,
					cost: storedData.customSpirits[slot].cost * 1,
				};
			}
		}
	}
}

StatCalc.prototype.setCustomSpirit = function(actor, slot, spiritIdx, spiritCost, spiritIdxLevel){
	if(!this.isActorSRWInitialized(actor)){
		this.initSRWStats(actor);//convenience to allow custom spirits to be set on units before they've been deployed
	}
	if(!actor.SRWStats.pilot.customSpirits){
		actor.SRWStats.pilot.customSpirits = {};
	}
	actor.SRWStats.pilot.customSpirits[slot] = {
		idx: spiritIdx,
		level: spiritIdxLevel,
		cost: spiritCost
	};	
	this.storeActorData(actor);
}

StatCalc.prototype.clearCustomSpirit = function(actor, slot){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.pilot.customSpirits){
		delete actor.SRWStats.pilot.customSpirits[slot];
	}
	this.storeActorData(actor);
}

StatCalc.prototype.getStoredMechData = function(mechId){
	return $SRWSaveManager.getMechData(mechId);	
}

StatCalc.prototype.storeActorData = function(actor){
	if(actor.isActor()){		
		$SRWSaveManager.storeActorData(actor.actorId(), {
			pilotUpgrades: actor.SRWStats.pilot.stats.upgrades,			
			PP: actor.SRWStats.pilot.PP,
			exp: actor.SRWStats.pilot.exp,
			kills: actor.SRWStats.pilot.kills,
			abilities: actor.SRWStats.pilot.abilities,
			relationships: actor.SRWStats.pilot.relationships,
			favPoints: actor.SRWStats.pilot.favPoints,
			customSpirits: actor.SRWStats.pilot.customSpirits
		});
		this.storeMechData(actor.SRWStats.mech);
	}	
}

StatCalc.prototype.storeMechData = function(mech){
	if(mech.id != -1){
		var classId;
		if(mech.inheritsUpgradesFrom != null && mech.inheritsUpgradesFrom != ""){
			classId = mech.inheritsUpgradesFrom;
		} else {
			classId = mech.classData.id;
		}
		$SRWSaveManager.storeMechData(classId, {
			mechUpgrades: mech.stats.upgradeLevels,
			genericFUBAbilityIdx: mech.genericFUBAbilityIdx,
			unlockedWeapons: mech.unlockedWeapons
		});	
		
		$SRWSaveManager.storeMechData(mech.classData.id, {
			subPilots: mech.subPilots
		});
	}		
}

StatCalc.prototype.calculateSRWActorStats = function(actor, preserveVolatile){
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var level = Math.floor(actor.SRWStats.pilot.exp / 500);
		actor.SRWStats.pilot.level = level;
		var baseStats = actor.SRWStats.pilot.stats.base;
		var growthRates = actor.SRWStats.pilot.stats.growthRates;
		var calculatedStats = actor.SRWStats.pilot.stats.calculated;
		Object.keys(growthRates).forEach(function(baseStateName){
			var growthInfo = growthRates[baseStateName];
			if(growthInfo.type == "flat"){
				calculatedStats[baseStateName] = baseStats[baseStateName] + Math.floor(level * growthInfo.rate);	
			} else {				
				var min = baseStats[baseStateName];
				var max = growthInfo.target;
				var rate = growthInfo.rate;				
				calculatedStats[baseStateName] = eval(ENGINE_SETTINGS.STAT_GROWTH_FORMULA);
			}						
		});
		var upgrades = actor.SRWStats.pilot.stats.upgrades;
		Object.keys(upgrades).forEach(function(baseStateName){
			if(baseStateName == "terrain"){
				calculatedStats.terrain = {};
				Object.keys(baseStats.terrain).forEach(function(terrainType){
					calculatedStats.terrain[terrainType] = _this.incrementTerrain(baseStats.terrain[terrainType], upgrades.terrain[terrainType]);
				});
			} else {
				calculatedStats[baseStateName]+=upgrades[baseStateName];			
			}
		});
		
		if(!actor.isActor()){
			if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled > 0){
				let targetMods;
				const modSet = ENGINE_SETTINGS.DIFFICULTY_MODS.levels[$gameSystem.getCurrentDifficultyLevel()].mods.pilot;
				if(modSet){
					if(modSet[actor.SRWStats.pilot.id]){
						targetMods = modSet[actor.SRWStats.pilot.id];
					} else {
						targetMods = modSet[-1];
					}
					if(targetMods){
						calculatedStats.SP+=(targetMods.SP || 0);
						if(calculatedStats.MP && calculatedStats.MP > 0){
							calculatedStats.MP+=(targetMods.MP || 0);
						}					
						
						calculatedStats.melee+=(targetMods.melee || 0);
						calculatedStats.ranged+=(targetMods.ranged || 0);
						calculatedStats.skill+=(targetMods.skill || 0);
						calculatedStats.defense+=(targetMods.defense || 0);
						calculatedStats.evade+=(targetMods.evade || 0);
						calculatedStats.hit+=(targetMods.hit || 0);
					}
				}
				
			}
		}
		
		if(ENGINE_SETTINGS.SP_CAP != -1){
			if(calculatedStats.SP > ENGINE_SETTINGS.SP_CAP){
				calculatedStats.SP = ENGINE_SETTINGS.SP_CAP;
			}
		}
		calculatedStats.SP = this.applyStatModsToValue(actor, calculatedStats.SP, ["sp"]);	
		if(!preserveVolatile || calculatedStats.currentSP == null){
			calculatedStats.currentSP = calculatedStats.SP;		
			if(actor.isActor() && ENGINE_SETTINGS.VXT_SP){
				if(_this.isAce(actor)){
					calculatedStats.currentSP = Math.round(calculatedStats.currentSP * 0.75) ;
				} else {
					calculatedStats.currentSP = Math.round(calculatedStats.currentSP * 0.5);
				}				
			}
		}
		
		if(!preserveVolatile || calculatedStats.currentMP == null){
			calculatedStats.currentMP = calculatedStats.MP || 0;		
		}
	}
}

StatCalc.prototype.getPilotTerrainIncreaseCost = function(levels){
	var costTable = [50, 100, 200, 250];	
	var cost = 0;
	for(var i = 0; i < levels.length; i++){		
		cost+=costTable[levels[i]];						
	}
	return cost;
}

StatCalc.prototype.applyMechUpgradeDeltas = function(actor, deltas){
	var upgradeLevels = actor.SRWStats.mech.stats.upgradeLevels;
	Object.keys(deltas).forEach(function(upgradeStat){
		if(typeof upgradeLevels[upgradeStat] != "undefined"){
			upgradeLevels[upgradeStat]+=deltas[upgradeStat];
		}
	});
	this.calculateSRWMechStats(actor.SRWStats.mech);
}

StatCalc.prototype.applyInheritedMechUpgradeDeltas = function(actor, deltas){
	var upgradeLevels = actor.SRWStats.mech.stats.upgradeLevels;
	Object.keys(deltas).forEach(function(upgradeStat){
		if(typeof upgradeLevels[upgradeStat] != "undefined"){
			upgradeLevels[upgradeStat]+=deltas[upgradeStat];
		}
	});
	this.calculateSRWMechStats(actor.SRWStats.mech);
}

StatCalc.prototype.applyPilotUpgradeDeltas = function(actor, deltas){
	var upgradeLevels = actor.SRWStats.pilot.stats.upgrades;
	Object.keys(deltas).forEach(function(upgradeStat){
		if(typeof upgradeLevels[upgradeStat] != "undefined"){
			upgradeLevels[upgradeStat]+=deltas[upgradeStat];
		}
		if(upgradeStat == "air" || upgradeStat == "land" || upgradeStat == "water" || upgradeStat == "space"){
			upgradeLevels.terrain[upgradeStat]+=deltas[upgradeStat];
		}
	});
	this.calculateSRWActorStats(actor);
}

StatCalc.prototype.getGenericFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.genericFUBAbilityIdx
	}
}

StatCalc.prototype.applyGenericFUB = function(actor, skillId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.genericFUBAbilityIdx = skillId;
		this.calculateSRWMechStats(actor.SRWStats.mech);
	}
}

StatCalc.prototype.isShip = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.isShip;	
	} else {
		return false;
	}
}

StatCalc.prototype.getBoardedUnits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.unitsOnBoard;	
	} else {
		return [];
	}
}

StatCalc.prototype.hasBoardedUnits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.unitsOnBoard.length > 0;	
	} else {
		return false;
	}
}

StatCalc.prototype.hasBoardedUnit = function(actor, boardingCandidate){
	if(this.isActorSRWInitialized(actor)){
		let result = false;
		for(var i = 0; i < actor.SRWStats.mech.unitsOnBoard.length; i++){
			if(actor.SRWStats.mech.unitsOnBoard[i] == boardingCandidate){
				result = true;
			}
		}
		return result;
	} else {
		return false;
	}
}

StatCalc.prototype.removeBoardedUnit = function(actor, ship){
	if(this.isActorSRWInitialized(ship)){
		this.clearBoarded(actor);
		var tmp = [];
		for(var i = 0; i < ship.SRWStats.mech.unitsOnBoard.length; i++){
			if(ship.SRWStats.mech.unitsOnBoard[i] != actor){
				tmp.push(ship.SRWStats.mech.unitsOnBoard[i]);
			}
		}
		ship.SRWStats.mech.unitsOnBoard = tmp;
	} 
}

StatCalc.prototype.addBoardedUnit = function(actor, ship){
	if(this.isActorSRWInitialized(ship)){
		this.setBoarded(actor);
		ship.SRWStats.mech.unitsOnBoard.push(actor);	
	} 
}

StatCalc.prototype.getBattleSceneInfo = function(actor){
	var result = {};
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech.id != -1){
		var mechProperties = $dataClasses[actor.SRWStats.mech.id].meta;
		result.basicBattleSpriteName = mechProperties.mechBasicBattleSprite;
		result.battleSceneSpriteName = mechProperties.mechBattleSceneSprite;
		if(mechProperties.mechMenuSprite){
			result.menuSpritePath = "menu/"+mechProperties.mechMenuSprite+".png";
		} else {
			result.menuSpritePath = "SRWBattleScene/"+result.battleSceneSpriteName+"/main.png";
		}
		
		result.battleSceneSpriteSize = parseInt(mechProperties.mechBattleSceneSpriteSize);
		
		result.useSpriter = parseInt(mechProperties.mechBattleSceneUseSpriter);
		
		result.useDragonBones = parseInt(mechProperties.mechBattleSceneUseDragonBones);
		result.dragonbonesWorldSize = parseInt(mechProperties.mechBattleSceneDragonBonesSize || 5);
		var width = parseInt(mechProperties.mechBattleSceneCanvasWidth || 0);
		var height = parseInt(mechProperties.mechBattleSceneCanvasHeight || 0);
		if(width && height){
			result.canvasDims = {width: width, height: height};
		}
		result.armatureName = String(mechProperties.mechBattleSceneArmatureName || "").trim();
		
		result.useSpine = parseInt(mechProperties.mechBattleSceneUseSpine);
		result.use3D = parseInt(mechProperties.mechBattleSceneUse3D);
		
		
		result.battleSceneShadowInfo = {
			size: 1,
			offsetZ: 0,
			offsetX: 0
		};

		
		if(mechProperties.mechBattleSceneShadowSize){
			result.battleSceneShadowInfo.size = mechProperties.mechBattleSceneShadowSize*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetZ){
			result.battleSceneShadowInfo.offsetZ = mechProperties.mechBattleSceneShadowOffsetZ*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetX){
			result.battleSceneShadowInfo.offsetX = mechProperties.mechBattleSceneShadowOffsetX*1;
		}
		
		result.battleReferenceSize = parseFloat(mechProperties.mechBattleReferenceSize) || ENGINE_SETTINGS.BATTLE_SCENE.SPRITE_WORLD_SIZE || 3;
		
		result.deathAnimId = mechProperties.mechBattleSceneDeathAnim;
		
		result.yOffset = parseFloat(mechProperties.mechBattleYOffset) || 0;
		result.xOffset = parseFloat(mechProperties.mechBattleXOffset) || 0;
		
		result.centerYOffset =  parseFloat(mechProperties.mechBattleCenterYOffset) || 0;
		result.centerXOffset =  parseFloat(mechProperties.mechBattleCenterXOffset) || 0;
		
		result.scale = parseFloat(mechProperties.mechBattleSceneSpriteScale) || 0;
		
		result.BBHack = (mechProperties.mechBattleSceneBBHack || 0) * 1;
		
		result.shadowParent = String(mechProperties.mechShadowParent || "").trim();
		
		result.rotation = parseInt(mechProperties.mechBattleSceneSpriteRotation) || 0;
		
		result.animGroup = mechProperties.mechBattleSceneAnimGroup;

		result.barrierScale = mechProperties.mechBattleSceneBarrierScale;
		
		let defaultAttachments = [];
		let parts = (mechProperties.mechBattleSceneDefaultAttachments || "").split(",");
		for(let part of parts){
			if(part){
				defaultAttachments.push(String(part || "").trim());
			}			
		}
		result.defaultAttachments = defaultAttachments;
	} 
	return result;
}

StatCalc.prototype.getMenuImagePath = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).menuSpritePath;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneSpriteType = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(this.getBattleSceneInfo(actor).useSpriter){
			return "spriter";
		} else if(this.getBattleSceneInfo(actor).useDragonBones){
			return "dragonbones";
		} else if(this.getBattleSceneInfo(actor).useSpine){
			return "spine";
		} else if(this.getBattleSceneInfo(actor).use3D){
			return "3D";
		} else {
			return "default";
		}
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneImageSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteSize;	
	} else {
		return 0;
	}
}

StatCalc.prototype.getBattleSceneShadowInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return JSON.parse(JSON.stringify(this.getBattleSceneInfo(actor).battleSceneShadowInfo));	
	} else {
		return 0;
	}
}

StatCalc.prototype.getBasicBattleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).basicBattleSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleIdleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleReferenceSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleReferenceSize;	
	} else {
		return "";
	}
}

StatCalc.prototype.getWeaponDamageUpgradeAmount = function(attack, levels){
	var type = attack.upgradeType;
	var increasesTable = ENGINE_SETTINGS.WEAPON_UPGRADE_TYPES[type];
	var amount = 0;
	if(increasesTable){
		for(var i = 0; i < levels.length; i++){
			if(levels[i] < this.getMaxUpgradeLevel()){			
				amount+=increasesTable[levels[i]];			
			}				
		}
	}
	
	return amount;
}

StatCalc.prototype.getMechStatIncreaseCost = function(actor, type, levels){
	var costTables = ENGINE_SETTINGS.COST_TYPES.NORMAL;
	var weaponCostTables = ENGINE_SETTINGS.COST_TYPES.WEAPON;
	
	var cost = 0;
	var costType = actor.SRWStats.mech.stats.upgradeCostTypes[type];
	for(var i = 0; i < levels.length; i++){
		if(levels[i] < this.getMaxUpgradeLevel()){
			if(type == "weapons"){
				cost+=weaponCostTables[costType][levels[i]];
			} else {
				cost+=costTables[costType][levels[i]];
			}
		}				
	}
	return cost;
}

StatCalc.prototype.getWeaponUpgradeCost = function(weaponId, levels){
	var weaponCostTables = ENGINE_SETTINGS.COST_TYPES.WEAPON;
	var cost = 0;
	let costType = $dataWeapons[weaponId].meta.weaponCostType || 0;
	for(var i = 0; i < levels.length; i++){
		if(levels[i] < this.getMaxUpgradeLevel()){		
			cost+=weaponCostTables[costType][levels[i]];			
		}				
	}
	return cost;
}

StatCalc.prototype.mechCanEquip = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return !actor.SRWStats.mech.noEquips;	
	} else {
		return false;
	}
}

StatCalc.prototype.getWeaponValidHolders = function(weaponId){	
	function parseList(listString){
		listString = listString || "";
		let result = {};
		const parts = listString.split(",");
		for(let id of parts){
			if(id != ""){
				result[id * 1] = true;
			}			
		}
		return result;
	}
	
	const allowList = parseList($dataWeapons[weaponId].meta.weaponAllowedOn);
	const banList = parseList($dataWeapons[weaponId].meta.weaponBannedOn);
	
	if(Object.keys(allowList).length){
		return allowList;
	}
	
	let result = {};
	for(let i = 1; i < $dataActors.length; i++){
		if(!banList[i]){
			result[i] = true;
		}
	}
	return result;
}

StatCalc.prototype.getMechStatIncrease = function(actor, type, levels){
	var amountPerLevel = actor.SRWStats.mech.stats.upgradeAmounts;
	/*{
		maxHP: 350,
		maxEN: 10,
		armor: 60,
		mobility: 5,
		accuracy: 6
	};*/
	if(amountPerLevel[type]){
		return amountPerLevel[type] * levels;
	} else {
		return 0;
	}
}

StatCalc.prototype.calculateSRWMechStats = function(targetStats, preserveVolatile, actor){
	var _this = this;
					
	var mechStats = targetStats.stats.base;
	var mechUpgrades = targetStats.stats.upgradeLevels;
	var calculatedStats = targetStats.stats.calculated;
	var upgradeAmounts = targetStats.stats.upgradeAmounts;
	
	if(mechStats && mechUpgrades && calculatedStats && upgradeAmounts && mechStats.terrain){
		calculatedStats.size = mechStats.size;
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "maxEN"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "armor"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "mobility"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "accuracy"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "move"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + mechUpgrades[upgradedStat];
			}
			if(upgradedStat == "terrain"){
				calculatedStats[upgradedStat] = {};
				Object.keys(mechStats.terrain).forEach(function(terrainType){
					calculatedStats[upgradedStat][terrainType] = _this.incrementTerrain(mechStats.terrain[terrainType], mechUpgrades.terrain[terrainType]);
				});
			}
		});
		var mechData;
		if(actor){
			mechData = actor;
		} else {
			mechData = {
				SRWStats: {
					pilot: {
						abilities: [],
						level: 0,
						SRWInitialized: true
					},			
					mech: targetStats			
				},
				SRWInitialized: true,
				event: event,
				isActor: function(){return isActor;}
			}
		}
		
		
		calculatedStats.maxHP = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxHP, ["maxHP"]);
		calculatedStats.maxEN = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxEN, ["maxEN"]);
		
		calculatedStats.armor = $statCalc.applyStatModsToValue(mechData, calculatedStats.armor, ["base_arm"]);
		calculatedStats.mobility = $statCalc.applyStatModsToValue(mechData, calculatedStats.mobility, ["base_mob"]);
		calculatedStats.accuracy = $statCalc.applyStatModsToValue(mechData, calculatedStats.accuracy, ["base_acc"]);
		
		calculatedStats.move = $statCalc.applyStatModsToValue(mechData, calculatedStats.move, ["base_move"]);
		
		if(actor && !actor.isActor()){
			if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled > 0){
				let targetMods;
				const modSet = ENGINE_SETTINGS.DIFFICULTY_MODS.levels[$gameSystem.getCurrentDifficultyLevel()].mods.mech;
				if(modSet){
					if(modSet[actor.SRWStats.mech.id]){
						targetMods = modSet[actor.SRWStats.mech.id];
					} else {
						targetMods = modSet[-1];
					}
					if(targetMods){
						calculatedStats.maxHP+=(targetMods.HP || 0)
						calculatedStats.maxEN+=(targetMods.EN || 0)
						calculatedStats.currentHP+=(targetMods.HP || 0)
						calculatedStats.currentEN+=(targetMods.EN || 0)
						
						calculatedStats.armor+=(targetMods.armor || 0)
						calculatedStats.mobility+=(targetMods.mobility || 0)
						calculatedStats.accuracy+=(targetMods.accuracy || 0)
						
						calculatedStats.move+=(targetMods.move || 0)
					}
				}
				
			}
		}
		
		if(!preserveVolatile){
			calculatedStats.currentHP = calculatedStats.maxHP;
			calculatedStats.currentEN = calculatedStats.maxEN;
		}		
	} else {
		console.log("Attempted to calculate stats for an undefined mech, please check your unlocks!");
	}
}

StatCalc.prototype.setCustomMechStats = function(actor, stats){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.stats.custom = stats;
		Object.keys(stats).forEach(function(stat){
			actor.SRWStats.mech.stats.calculated[stat] = stats[stat];
			if(stat == "maxHP"){
				actor.SRWStats.mech.stats.calculated["currentHP"] = stats[stat];
			}
		});
	}
}

StatCalc.prototype.incrementTerrain = function(terrain, increment){
	if(terrain == "-"){
		return "-";
	}
	var result = this._terrainToNumeric[terrain] + increment;
	if(result > 4){
		result = 4;
	}
	if(result < 0){
		result = 0;
	}
	return this._numericToTerrain[result];
}

StatCalc.prototype.getEquipInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var result = [];
		for(var i = 0; i < actor.SRWStats.mech.items.length; i++){			
			result.push(actor.SRWStats.mech.items[i]);				
		}
		return result;	
	} else {
		return [];
	}	
}

StatCalc.prototype.setWeaponUnlocked = function(mechId, weaponId){
	var mechData = this.getMechDataById(mechId, true);
	mechData.unlockedWeapons[weaponId] = true;
	this.storeMechData(mechData);
	
	//ensure any live instances of the mech on the map also unlock the attack
	var currentPilot = this.getCurrentPilot(mechId, false, true);
	if(currentPilot){
		this.setWeaponUnlockedForActor(currentPilot, weaponId)
	}
}

StatCalc.prototype.setWeaponUnlockedForActor = function(actor, weaponId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.unlockedWeapons[weaponId] = true;
		this.storeMechData(actor.SRWStats.mech);
	} else {
		return false;
	}
}

StatCalc.prototype.setWeaponLocked = function(mechId, weaponId){
	var mechData = this.getMechDataById(mechId, true);
	mechData.unlockedWeapons[weaponId] = false;
	this.storeMechData(mechData);
	
	//ensure any live instances of the mech on the map also lock the attack
	var currentPilot = this.getCurrentPilot(mechId, false, true);
	if(currentPilot){
		this.setWeaponLockedForActor(currentPilot, weaponId)
	}
}

StatCalc.prototype.setWeaponLockedForActor = function(actor, weaponId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.unlockedWeapons[weaponId] = false;
		this.storeMechData(actor.SRWStats.mech);
	} else {
		return false;
	}
}

StatCalc.prototype.isWeaponUnlocked = function(actor, weapon){
	if(this.isActorSRWInitialized(actor)){
		var abilityUnlockedInfo = $statCalc.getModDefinitions(actor, ["unlock_weapon"]);
		var abilityUnlockedLookup = {};
		abilityUnlockedInfo.forEach(function(entry){
			abilityUnlockedLookup[entry.value] = true;
		});
		var abilityLockedInfo = $statCalc.getModDefinitions(actor, ["lock_weapon"]);
		var abilityLockedLookup = {};
		abilityLockedInfo.forEach(function(entry){
			abilityLockedLookup[entry.value] = true;
		});
		if(abilityLockedLookup[weapon.id]){
			return false;
		} else if(abilityUnlockedLookup[weapon.id]){
			return true;
		} else if(actor.SRWStats.mech.unlockedWeapons && actor.SRWStats.mech.unlockedWeapons[weapon.id] != null){			
			return actor.SRWStats.mech.unlockedWeapons[weapon.id];						
		} else {
			return !weapon.isLocked;
		}
	} else {
		return false;
	}
}



StatCalc.prototype.getCurrentWeapons = function(actor, noEquips){
	if(this.isActorSRWInitialized(actor)){
		let referenceMech;
		if(actor.isSubPilot){
			referenceMech = actor.mainPilot.SRWStats.mech;
		} else {
			referenceMech = actor.SRWStats.mech;
		}
		if(referenceMech.id == -1){
			return [];
		}
		var tmp = [];
		var allWeapons = referenceMech.weapons;	
		for(var i = 0; i < allWeapons.length; i++){
			if(this.isWeaponUnlocked(actor, allWeapons[i])){
				tmp.push(allWeapons[i]);
			}
		}
		
		if(!noEquips){
			const equipables = this.getActorMechEquipables(referenceMech.id);
			for(let weapon of equipables){
				if(weapon){
					if(this.getWeaponValidHolders(weapon.weaponId)[referenceMech.id]){				
						var weaponDefinition = $dataWeapons[weapon.weaponId];
						var weaponProperties = weaponDefinition.meta;
						
						let wep = this.parseWeaponDef(actor, false, weaponDefinition, weaponProperties);
						wep.isEquipable = true;
						//let levels = [];
						//for(let i = 0; i < weapon.upgrades; i++){
						//	levels.push(i)
						//}
						//wep.power+=this.getWeaponDamageUpgradeAmount(wep, levels);
						wep.upgrades = weapon.upgrades;
						wep.tempKey = "eWeap_"+weapon.weaponId+"_"+weapon.slot;
						tmp.push(wep);
					}
				}			
			}
		}		
		
		let addedWeaponMods =  $statCalc.getModDefinitions(actor, ["add_weapon"]);
		for(let mod of addedWeaponMods){			
			var weaponDefinition = $dataWeapons[mod.value];
			var weaponProperties = weaponDefinition.meta;
			let wep = this.parseWeaponDef(actor, false, weaponDefinition, weaponProperties);
			tmp.push(wep);
		}
		
		tmp = tmp.sort(function(a, b){
			return a.power - b.power;
		});
		return tmp;	
	} else {
		return [];
	}	
}

StatCalc.prototype.hasWeapons = function(actor){
	return this.getCurrentWeapons(actor).length > 0;
}

StatCalc.prototype.getActiveMapWeapons = function(actor, isPostMove){
	var _this = this;
	var mapWeapons = [];
	if(this.isActorSRWInitialized(actor)){
		var weapons =  actor.SRWStats.mech.weapons;	
		var mapWeapons = [];
		weapons.forEach(function(weapon){
			if(weapon.isMap && _this.isWeaponUnlocked(actor, weapon) && _this.canUseWeapon(actor, weapon, isPostMove)){
				mapWeapons.push(weapon);
			}
		});
	} 
	return mapWeapons;
}

StatCalc.prototype.getWeaponPowerStatState = function(actor, attack){
	var result = "";
	if(this.isActorSRWInitialized(actor)){
		var powerDelta = this.isAttackDown(actor) * -1;
		
		if(attack.type == "M"){ //melee		
			powerDelta += $statCalc.applyStatModsToValue(actor, 0, ["weapon_melee"]);
		} else { //ranged
			powerDelta += $statCalc.applyStatModsToValue(actor, 0, ["weapon_ranged"]);
		}
		
		var tagBoostInfo = $statCalc.getModDefinitions(actor, ["weapon_type_boost"]);
		for(const modDef of tagBoostInfo){
			if(modDef.tag == attack.particleType){
				powerDelta+=modDef.value;
			}
		}
		
		if(powerDelta > 0){
			result = "boosted";
		} else if(powerDelta < 0){
			result = "dropped";
		}
	}
	return result;
}

StatCalc.prototype.getWeaponPower = function(actor, weapon){
	//if(weapon.isEquipable){
	//	return weapon.power - this.isAttackDown(actor);
	//}
	if(this.isActorSRWInitialized(actor)){
		var levels = [];
		if(weapon.isEquipable){
			for(let i = 0; i < weapon.upgrades; i++){
				levels.push(i)
			}
		} else {
			for(var i = 0; i < actor.SRWStats.mech.stats.upgradeLevels.weapons; i++){
				levels.push(i);
			}
		}		
		
		let difficultyMod = 0;
		if(!actor.isActor()){
			if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled > 0){
				let targetMods;
				const modSet = ENGINE_SETTINGS.DIFFICULTY_MODS.levels[$gameSystem.getCurrentDifficultyLevel()].mods.mech;
				if(modSet){
					if(modSet[actor.SRWStats.mech.id]){
						targetMods = modSet[actor.SRWStats.mech.id];
					} else {
						targetMods = modSet[-1];
					}
					if(targetMods){
						difficultyMod = targetMods.weapon;
					}
				}
			}
		}
		
		return weapon.power + this.getWeaponDamageUpgradeAmount(weapon, levels) - this.isAttackDown(actor) + difficultyMod;
	} else {
		return 0;
	}
}

StatCalc.prototype.enableWeaponAbilityResolution = function(actor, weapon){
	//hacky method to get weapon abilities resolved while not before battle(like in the attack list)
	//set the currentAttack on the attacker
	
	const storedBattleTemp = actor.SRWStats.battleTemp.currentAttack;
	const storedBattleTarget = $gameTemp.currentBattleTarget;	
	
	actor.SRWStats.battleTemp.currentAttack = weapon;
	//set a dummy battle target
	$gameTemp.currentBattleTarget = {
		factionId: 0
	};
	//invalidate the ability cache for the attacker
	$statCalc.invalidateAbilityCache(actor);
	
	return {
		storedBattleTemp: storedBattleTemp, 
		storedBattleTarget: storedBattleTarget
	};
}

StatCalc.prototype.restoreBattleTemps = function(actor, battleTemps){
	actor.SRWStats.battleTemp.currentAttack = battleTemps.storedBattleTemp;
	$gameTemp.currentBattleTarget = battleTemps.storedBattleTarget;
	$statCalc.invalidateAbilityCache(actor);
}

StatCalc.prototype.getWeaponPowerWithMods = function(actor, weapon){
	let currentPower = this.getWeaponPower(actor, weapon);
	const battleTemps = this.enableWeaponAbilityResolution(actor, weapon);
	
	if(weapon.type == "M"){ //melee		
		currentPower = $statCalc.applyStatModsToValue(actor, currentPower, ["weapon_melee"]);
	} else { //ranged
		currentPower = $statCalc.applyStatModsToValue(actor, currentPower, ["weapon_ranged"]);
	}	
	this.restoreBattleTemps(actor, battleTemps);
	
	return currentPower;
}

StatCalc.prototype.getMaxPilotStat = function(){
	return $gameSystem.getMaxPilotStat();
}

StatCalc.prototype.getMaxTerrainLevelNumeric = function(){
	return 4;
}

StatCalc.prototype.getUnlockedUpgradeLevel = function(){
	if($gameSystem.unlockedUpgradeLevel != null){
		return $gameSystem.unlockedUpgradeLevel;
	} else {
		return this.getMaxUpgradeLevel();
	}
}

StatCalc.prototype.getMaxUpgradeLevel = function(){
	return $gameSystem.getMaxUpgradeLevel();
}

StatCalc.prototype.getMinModificationLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var minLevel = this.getMaxUpgradeLevel();
		var mechUpgrades = actor.SRWStats.mech.stats.upgradeLevels;	
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP" || upgradedStat == "maxEN" || upgradedStat == "armor" || upgradedStat == "mobility" || upgradedStat == "accuracy"){
				var level = mechUpgrades[upgradedStat] || 0;
				if(level < minLevel){
					minLevel = level;
				}				
			}
		});		
		return minLevel;
	} else {
		return 0;
	}
}

StatCalc.prototype.getOverallModificationLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var totalPercent = 0;
		var unitPercent = 100 / (this.getMaxUpgradeLevel() * 5);
		var mechUpgrades = actor.SRWStats.mech.stats.upgradeLevels;	
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP" || upgradedStat == "maxEN" || upgradedStat == "armor" || upgradedStat == "mobility" || upgradedStat == "accuracy"){
				totalPercent+=(mechUpgrades[upgradedStat] || 0) * unitPercent;
			}
		});		
		return Math.round(totalPercent);
	} else {
		return 0;
	}
}

StatCalc.prototype.getWeaponUpgradeLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.stats.upgradeLevels.weapons;
	} else {
		return "";
	}	
}

StatCalc.prototype.getPilotStat = function(actor, stat){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.pilot.stats.calculated[stat];
		if(typeof result != "undefined"){
			return result;
		} else {
			return 0;
		}
	} else {
		return 0;
	}
}

StatCalc.prototype.getPilotTerrain = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.pilot.stats.calculated.terrain[terrain];
		if(typeof result != "undefined"){
			return result;
		} else {
			return "-";
		}
	} else {
		return "-";
	}
}

StatCalc.prototype.getMechTerrain = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.mech.stats.calculated.terrain[terrain];
		if(typeof result != "undefined"){
			return result;
		} else {
			return "-";
		}
	} else {
		return "-";
	}
}

StatCalc.prototype.getCurrentPilot = function(mechId, includeUndeployed, includeEnemies, includeSubPilots, searchFallbackInfo){
	var result;
	
	if(searchFallbackInfo){
		const fallBackInfo = $gameSystem.getPilotFallbackInfoFull();
		for(let pilotId in fallBackInfo){
			const entry = fallBackInfo[pilotId];
			if(!entry.isSubPilot && entry.classId == mechId){
				result =  $gameActors.actor(pilotId);
			}
		}
	}
	
	if(!result){		
		if(includeUndeployed){
			for(var i = 0; i < $dataActors.length; i++){
				var actor = $gameActors.actor(i);
				if(actor && $dataActors[actor.actorId()].name && actor._classId == mechId && (includeSubPilots || !actor.isSubPilot)){
					result = $gameActors.actor(i);
				}
			}
		} else {
			var type = "actor";
			if(includeEnemies){
				type = null;
			}
			this.iterateAllActors(type, function(actor){
				if(actor.SRWStats.mech.id == mechId && actor.SRWStats.pilot.id != -1 && !actor.isSubPilot){//actor.currentClass() && actor.currentClass().id == mechId
					result = actor;
				}
			});
		
		}
	}
	return result;
}

StatCalc.prototype.getCurrentDeploySlot = function(actorId){
	const _this = this;
	var result = -1;
	var deployList = $gameSystem.getDeployList();
	function checkSubPilots(mainPilotId){
		let result = false;
		const subPilots = _this.getSubPilots($gameActors.actor(mainPilotId));
			if(subPilots?.length){
				for(let subPilotId of subPilots){
					if(subPilotId == actorId){
						result = true;
					}
				}	
			}
		return result;	
	}
	for(var i = 0; i < deployList.length; i++){		
		if(deployList[i]){
			if(deployList[i].main == actorId){
				result = i;
			}
			if(deployList[i].sub == actorId){
				result = i;
			}
			const mainSubResult = checkSubPilots(deployList[i].main);
			if(mainSubResult){
				result = i;
			}

			const subSubResult = checkSubPilots(deployList[i].sub);
			if(subSubResult){
				result = i;
			}
		}
	}
	return result;
}

StatCalc.prototype.getSpecies = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.species;
	} else {
		return "";
	}	
}

StatCalc.prototype.getAwardedFunds = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.fundYield;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getPilotStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats;
	} else {
		return {};
	}	
}

StatCalc.prototype.getCalculatedPilotStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated;
	} else {
		return {};
	}	
}

StatCalc.prototype.getCalculatedMechStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.mech && actor.SRWStats.mech.stats){
			return actor.SRWStats.mech.stats.calculated;
		} else {
			return {};
		}		
	} else {
		return {};
	}	
}	

StatCalc.prototype.getCurrentLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.level;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentSP = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated.currentSP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getMaxSP = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated.SP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentMP = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated.currentMP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentPP = function(actor){
	if($gameSystem.optionInfinitePP){
		return 9999;
	}
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.PP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var sizeMods = $statCalc.getModDefinitions(actor, ["size_mod"]);
		if(sizeMods.length){
			return sizeMods[0].value;
		}
		return actor.SRWStats.mech.stats.calculated.size;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getPersonalityInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.personalityInfo;
	} else {
		return {
			hit: 0,
			miss: 0,
			damage: 0,
			evade: 0,
			destroy: 3,
			ally_down: 0
		};
	}	
}	

StatCalc.prototype.getSpiritList = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let result = structuredClone(actor.SRWStats.pilot.spirits || []);
		for(let entry of result){
			entry.cost = $statCalc.applyStatModsToValue(actor, entry.cost, ["sp_cost"]);
		}
		return result;
	} else {
		return [];
	}	
}	

StatCalc.prototype.getTwinSpirit = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.twinSpirit;
	} else {
		return [];
	}
}

StatCalc.prototype.getActiveSpirits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.activeSpirits || {};
	} else {
		return {};
	}	
}	

StatCalc.prototype.getLearnedPilotAbilities = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.abilities || {};
	} else {
		return {};
	}
}

StatCalc.prototype.learnAbility = function(actor, abilityDef){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.pilot.abilities[abilityDef.idx] = abilityDef;
	} else {
		return {};
	}
}

StatCalc.prototype.getPilotAbilityList = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var learnedAbilities = actor.SRWStats.pilot.abilities;
		var result = [];
		if(learnedAbilities){
			Object.keys(learnedAbilities).forEach(function(abilityIdx){
				var ability = learnedAbilities[abilityIdx];
				if(ability.slot != -1 && ability.idx !== "" &&  ability.idx != null){
					result[ability.slot] = ability;
				}
			});	
		}		
		return result;
	} else {
		return [];
	}	
}	

StatCalc.prototype.getMechAbilityList = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.mech.abilities;
	} else {
		return [];
	}	
}	

StatCalc.prototype.getPilotRelationships = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.pilot.relationships || {};
	} else {
		return {};
	}
}

StatCalc.prototype.getActiveRelationshipBonuses = function(actor){
	var _this = this;
	var result = [];
	if(this.isActorSRWInitialized(actor) && actor.event){	
		var candidateLookup = this.getPilotRelationships(actor);
		
		Object.keys(candidateLookup).forEach(function(otherId){
			var def = candidateLookup[otherId];
			if(def){
				result.push({
					idx: def.effectId,
					level: def.level,
					appliesTo: otherId
				});
			}
			if(!actor.isSubPilot){
				var subPilots = _this.getSubPilots(actor);
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					var candidateLookup = _this.getPilotRelationships(actor);
					if(actor){
						var def = candidateLookup[otherId];
						if(def){
							result.push({
								idx: def.effectId,
								level: def.level,
								appliesTo: otherId
							});
						}
					}			
				});	
			}
		});		
	}
	return result;
}

StatCalc.prototype.getMechFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.mech.fullUpgradeAbility;
	} else {
		return null;
	}	
}	

StatCalc.prototype.getAceAbility = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.pilot.aceAbility;
	} else {
		return null;
	}	
}

StatCalc.prototype.getCurrentMaxPilotAbilitySlot = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var maxSlot = -1;
		var learnedAbilities = actor.SRWStats.pilot.abilities;	
		Object.keys(learnedAbilities).forEach(function(abilityIdx){
			var ability = learnedAbilities[abilityIdx];
			if(ability.slot > maxSlot){
				maxSlot = ability.slot;
			}
		});
		return maxSlot;
	} else {
		return 0;
	}	
}	

StatCalc.prototype.getActorMechWeapons = function(actor){
	return this.getCurrentWeapons(actor);
}

StatCalc.prototype.getActorMechWeapon = function(actor, weaponId){
	var result;
	if(this.isActorSRWInitialized(actor)){
		var weapons = this.getActorMechWeapons(actor);
		weapons.forEach(function(weapon){
			if(weapon.id == weaponId){
				result = weapon;
			}
		});
	} else {
		return {};
	}
	return result;	
}

StatCalc.prototype.getCurrentWill = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will;
	} else {
		return 100;
	}	
}

StatCalc.prototype.getMoveStatState = function(actor){
	var result = "";
	if(this.isActorSRWInitialized(actor)){
		var moveDelta = 0;
		if(this.getActiveSpirits(actor).accel){
			moveDelta+=3; 
		}
		var movementDown = this.isMovementDown(actor);
		if(movementDown){
			moveDelta-=movementDown;
		}
		if(moveDelta > 0){
			result = "boosted";
		} else if(moveDelta < 0){
			result = "dropped";
		}
	}
	return result;
}

StatCalc.prototype.getCurrentMoveRange = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var totalMove = actor.SRWStats.mech.stats.calculated.move;
	
		if(this.isMainTwin(actor)){
			totalMove+=this.getCurrentMoveRange(actor.subTwin);
			totalMove = Math.floor(totalMove/2);
		}
		if(this.getActiveSpirits(actor).accel){
			totalMove+=3; 
		}
		totalMove = this.applyStatModsToValue(actor, totalMove, ["movement"]);
		var movementDown = this.isMovementDown(actor);
		if(movementDown){
			totalMove-=movementDown;
		}
		
		if(totalMove < 1){
			totalMove = 1;
		}
		
		var moveCost = $terrainTypeManager.getTerrainDefinition(this.getCurrentAliasedTerrainIdx(actor)).moveCost;
		if(moveCost > 0){
			var currentEN = this.getCurrenEN(actor);
			var maxMove = Math.floor(currentEN / moveCost);
			if(totalMove > maxMove){
				totalMove = maxMove;
			}
		}
		
		if(totalMove < 1){
			totalMove = 1;
		}
		
		return totalMove;
	} else {
		return 1;
	}		
}

StatCalc.prototype.canBeOnTerrain = function(actor, terrain, noCheckTwin){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech.enabledTerrainTypes){
		let terrainDef = $terrainTypeManager.getTerrainDefinition(terrain);
		//var validTwin = true;
		//if(actor.subTwin && !(actor.subTwin.SRWStats.mech.enabledTerrainTypes[terrain] * 1 || this.applyStatModsToValue(actor.subTwin, 0, [terrainDef.abilityName]))){
		//	validTwin = false;
	//	}
		/*if(actor.isSubTwin){
			var mainTwin = this.getMainTwin(actor);
			if(mainTwin && this.isActorSRWInitialized(mainTwin) && !(mainTwin.SRWStats.mech.enabledTerrainTypes[terrain] * 1 || this.applyStatModsToValue(mainTwin, 0, [terrainDef.abilityName]))){
				validTwin = false;
			}
			return validTwin;
		}	*/	
		const selfValid = Math.max(actor.SRWStats.mech.enabledTerrainTypes[terrain] * 1, this.applyStatModsToValue(actor, 0, [terrainDef.abilityName]) * 1);	
		if(noCheckTwin || selfValid){
			return selfValid;
		}
		if(actor.subTwin && this.isActorSRWInitialized(actor.subTwin) && actor.subTwin.SRWStats.mech.enabledTerrainTypes){
			return actor.subTwin.SRWStats.mech.enabledTerrainTypes[terrain] * 1 || this.applyStatModsToValue(actor.subTwin, 0, [terrainDef.abilityName]);
		} else if(actor.isSubTwin){
			const mainTwin = this.getMainTwin(actor);
			return mainTwin && this.isActorSRWInitialized(mainTwin) && ((mainTwin.SRWStats.mech.enabledTerrainTypes && mainTwin.SRWStats.mech.enabledTerrainTypes[terrain] * 1) || this.applyStatModsToValue(mainTwin, 0, [terrainDef.abilityName]));
		} 
		return false;
	} else {
		return false;
	}
}

StatCalc.prototype.isTerrainSuperState = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.enabledTerrainSuperState == terrain;
	} else {
		return false;
	}
}

StatCalc.prototype.getValidSuperStates = function(actor, position){
	return this.getAvailableSuperStateTransitions(actor, position, true);
}

StatCalc.prototype.getValidSuperStatesLookup = function(actor, position){
	let result = {};
	const transitions =  this.getAvailableSuperStateTransitions(actor, position, true);
	for(let transition of transitions){
		result[transition.endState] = true;
	}
	return result;
}

StatCalc.prototype.getAvailableSuperStateTransitionsForCurrentPosition = function(actor){
	const referenceEvent = this.getReferenceEvent(actor);
	if(referenceEvent){
		const position = {x: referenceEvent.posX(), y: referenceEvent.posY()};
		return this.getAvailableSuperStateTransitions(actor, position);
	}
	return [];
}

StatCalc.prototype.getAvailableSuperStateTransitions = function(actor, position, fromBaseTerrain){
	let result = [];
	let supersedingResult = [];
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = $gameMap.regionId(position.x, position.y) % 8;
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		let currentSuperState = actor.SRWStats.mech.enabledTerrainSuperState;
		if(fromBaseTerrain){//for checking if a super state is valid for a unit on the current terrain, ignoring its current super state
			currentSuperState = -1;
		}
		if(currentTerrain == currentSuperState){
			currentSuperState = -1;
		}
		let rules = terrainDef.superStateRules || [];
		let currentSupersedingPriority = 0;
		for(let rule of rules){
			let currentTerrainValid = (rule.currentTerrain == null || currentTerrain == rule.currentTerrain);
			let currentSuperStateValue = (currentSuperState == rule.startState);
			if(currentTerrainValid && currentSuperStateValue && ((rule.endState == -1 && this.canBeOnTerrain(actor, currentTerrain)) || this.canBeOnTerrain(actor, rule.endState))){
				let candidateTerrainDef;
				if(rule.endState == -1){
					candidateTerrainDef = terrainDef;
				} else {
					candidateTerrainDef = $terrainTypeManager.getTerrainDefinition(rule.endState);	
				}
					
				if(candidateTerrainDef.supersedingPriority > 0){
					supersedingResult.push(rule);
				} else {
					result.push(rule);
				}
				
			}
		}
		if(supersedingResult.length){
			let tmp = [];
			let usedEndStates = {};
			for(let rule of supersedingResult){
				if(!usedEndStates[rule.endState]){
					usedEndStates[rule.endState] = true;
					tmp.push(rule);
				}
			}
			return tmp;
		} else {
			return result;
		}
		
	} else {
		return result;
	}
}

StatCalc.prototype.getAvailableSuperStateCommand = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentRawTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		let currentSuperState = actor.SRWStats.mech.enabledTerrainSuperState;
		let rules = terrainDef.superStateRules || [];
		let command;
		for(let rule of rules){
			let currentTerrainValid = (rule.currentTerrain == null || currentTerrain == rule.currentTerrain);
			let currentSuperStateValue = (currentSuperState == rule.startState);
			if(currentTerrainValid && currentSuperStateValue && ((rule.endState == -1 && this.canBeOnTerrain(actor, currentTerrain)) || this.canBeOnTerrain(actor, rule.endState))){
				command = rule;
			}
		}
		return command;
	} else {
		return null;
	}
}

StatCalc.prototype.resolveTerrainRules = function(actor, rules){
	let result = false;
	let ctr = 0;
	while(!result && ctr < rules.length){
		result = true;
		let innerCtr = 0;
		while(result && innerCtr < rules[ctr].length){
			let rule = rules[ctr][innerCtr];
			if(rule.type == "terrainEnabled"){
				result = this.canBeOnTerrain(actor, rule.value);
			} else if(rule.type == "superState"){
				result = this.isTerrainSuperState(actor, rule.value);
			} else if(rule.type == "state"){
				result = this.getCurrentTerrainIdx(actor) == rule.value;
			}
			innerCtr++;
		}
		
		ctr++;
	}
	return result;
}

StatCalc.prototype.canEnterTerrain = function(actor, terrain){
	if(terrain == 0){
		return false;
	}
	if(this.isActorSRWInitialized(actor)){
		let terrainDef = $terrainTypeManager.getTerrainDefinition(terrain);
		let entryRulesResult = this.resolveTerrainRules(actor, terrainDef.entryRules);
		let entryForbiddenRuleResult = this.resolveTerrainRules(actor, terrainDef.entryForbiddenRules);
		return entryRulesResult && !entryForbiddenRuleResult;
	} else {
		return false;
	}
}

StatCalc.prototype.isRegionBlocked = function(actor, region){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);
		return terrainDef.regionBlackList.indexOf(region) != -1;
	} else {
		return false;
	}
}

StatCalc.prototype.getFlyingAnimInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		//if(this.canBeOnTerrain(actor, currentTerrain)){
			let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
			return terrainDef.displaysFlying;
		//}		
	}
	return false;	
}


StatCalc.prototype.ignoresTerrainCollision = function(actor, regionIdx){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		if(Array.isArray(terrainDef.ignoresTerrainCollision)){
			return terrainDef.ignoresTerrainCollision.indexOf(regionIdx) != -1;
		} else {
			return terrainDef.ignoresTerrainCollision;
		}		
	} else {
		return false;
	}
}

StatCalc.prototype.ignoresTerrainCost = function(actor, regionIdx){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		if(Array.isArray(terrainDef.ignoresTerrainCost)){
			return terrainDef.ignoresTerrainCost.indexOf(regionIdx) != -1;
		} else {
			return terrainDef.ignoresTerrainCost;
		}		
	} else {
		return false;
	}		
}

StatCalc.prototype.canAttackOnCurrentTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		return terrainDef.canAttack;		
	} else {
		return true;
	}		
}

StatCalc.prototype.canBeTargetedOnCurrentTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		return terrainDef.canBeTargeted;		
	} else {
		return true;
	}		
}

StatCalc.prototype.isBattleShadowHiddenOnCurrentTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		let currentTerrain = this.getCurrentTerrainIdx(actor);
		let terrainDef = $terrainTypeManager.getTerrainDefinition(currentTerrain);		
		return terrainDef.hideBattleShadows;		
	} else {
		return true;
	}		
}

StatCalc.prototype.getSuperState = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.enabledTerrainSuperState;
	} else {
		return -1;
	}
}

StatCalc.prototype.canBeInSuperState = function(actor, state){
	return this.canBeOnTerrain(actor, state);
}

StatCalc.prototype.setSuperState = function(actor, newVal, noSE, seName){
	if(this.isActorSRWInitialized(actor)){
		if(this.canBeOnTerrain(actor, newVal) || newVal == -1){
			actor.SRWStats.mech.enabledTerrainSuperState = newVal || -1;//force false values to -1
			if(!noSE){
				if(seName){
					var se = {};
					se.name = seName;
					se.pan = 0;
					se.pitch = 100;
					se.volume = 80;
					AudioManager.playSe(se);
				}
			}	
		}				
	} 		
}	

StatCalc.prototype.getCombinationWeaponParticipants = function(actor, weapon){
	var _this = this;	
	var result = {
		isValid: false,
		participants: []
	};
	
	/*if(!actor || !actor.event){
		return result;
	}*/
	
	if(weapon.isCombination){
		var requiredWeaponsLookup = {};
		weapon.combinationWeapons.forEach(function(weapon){
			requiredWeaponsLookup[weapon] = true;
		});
		var targetCount = weapon.combinationWeapons.length;
		
		function validateParticipant(actor){
			var hasARequiredWeapon = false;
					
			var weapons = _this.getCurrentWeapons(actor);
			var ctr = 0;			
			while(!hasARequiredWeapon && ctr < weapons.length){					
				if(requiredWeaponsLookup[weapons[ctr].id]){
					var currentWeapon = weapons[ctr];
					var canUse = true;
					if(_this.getCurrentWill(actor) < currentWeapon.willRequired){
						canUse = false;
					}
					if(currentWeapon.requiredEN != -1 && _this.getCurrenEN(actor) < currentWeapon.ENCost){
						canUse = false;
					}						
					if(_this.getCurrentAmmo(actor, currentWeapon) == 0){
						canUse = false;
					}							
					if(canUse){
						hasARequiredWeapon = true;								
					}						
				}
				ctr++;
			}
			
			return hasARequiredWeapon;
		}
		var participants = [];
		if(weapon.combinationType == 0){//all participants must be adjacent			
			var candidates = [actor];
			var visited = {};
			var event = this.getReferenceEvent(actor);
			visited[event.eventId()] = true;
			while(participants.length < targetCount && candidates.length){
				var current = candidates.pop();
				var event = this.getReferenceEvent(current);
				var subTwin = current.subTwin;
				if(subTwin && validateParticipant(subTwin)){
					participants.push(subTwin);
				}	
				
				var adjacent = this.getAdjacentActorsWithDiagonal(actor.isActor() ? "actor" : "enemy", {x: event.posX(), y: event.posY()});
				for(var i = 0; i < adjacent.length; i++){
					var event = this.getReferenceEvent(adjacent[i]);
					if(!visited[event.eventId()] ){						
						if(validateParticipant(adjacent[i])){
							participants.push(adjacent[i]);
							candidates.push(adjacent[i]);
							visited[event.eventId()] = true;
						}
						var subTwin = adjacent[i].subTwin;
						if(subTwin && validateParticipant(subTwin)){
							participants.push(subTwin);
							candidates.push(subTwin);
						}						
					}					
				}			
			}			
		} else if(weapon.combinationType == 1){//all participants must be on the map
			this.iterateAllActors(actor.isActor() ? "actor" : "enemy", function(actor, event){			
				if(validateParticipant(actor)){
					participants.push(actor);
				}
			});
		}
		if(participants.length >= targetCount){
			result = {
				isValid: true,
				participants: participants
			};
		}
	}
	return result;
}

StatCalc.prototype.isInComboParticipants = function(sourceActor, sourceAttack, targetActor){
	let isInnerComboParticipant = false;
	if(sourceAttack){
		var comboParticipants = $statCalc.getCombinationWeaponParticipants(sourceActor, sourceAttack).participants || [];
		var ctr = 0;
		while(ctr < comboParticipants.length && !isInnerComboParticipant){
			isInnerComboParticipant = comboParticipants[ctr] == targetActor;
			ctr++;
		}
	}
	
	return isInnerComboParticipant;
}

// an inner combo participant is a unit performing a combo with either the main or sub twin of the allied unit
StatCalc.prototype.isInnerComboParticipant = function(actor){
	
	var isInnerComboParticipant = false;
	
	if(actor.isSubTwin){
		var mainActor = this.getMainTwin(actor);
		if($gameTemp.actorAction){		
			isInnerComboParticipant = this.isInComboParticipants(mainActor, $gameTemp.actorAction.attack, actor);
		} 
	} else if(actor.subTwin){
		if($gameTemp.actorTwinAction){		
			isInnerComboParticipant = this.isInComboParticipants(actor.subTwin, $gameTemp.actorTwinAction.attack, actor);
		} 
	} 

	if(!isInnerComboParticipant && actor.isSupport && $gameTemp.currentBattleActor){
		isInnerComboParticipant = this.isInComboParticipants($gameTemp.currentBattleActor, $gameTemp.actorAction.attack, actor);
		if(!isInnerComboParticipant && $gameTemp.currentBattleActor.subTwin && $gameTemp.actorTwinAction){
			isInnerComboParticipant = this.isInComboParticipants($gameTemp.currentBattleActor.subTwin, $gameTemp.actorTwinAction.attack, actor);
		}
	}
	
	return isInnerComboParticipant;
}

StatCalc.prototype.isComboAttackValidForSupport = function(actor, weapon){
	var isInnerComboParticipant = false;
	if($gameTemp.currentBattleActor){
		isInnerComboParticipant = this.isInComboParticipants($gameTemp.currentBattleActor, $gameTemp.actorAction.attack, actor);
		if(!isInnerComboParticipant && $gameTemp.currentBattleActor.subTwin && $gameTemp.actorTwinAction && $gameTemp.actorTwinAction.attack){
			isInnerComboParticipant = this.isInComboParticipants($gameTemp.currentBattleActor.subTwin,$gameTemp.actorTwinAction.attack, actor);
		}
	}
	
	
	if(!isInnerComboParticipant && actor != $gameTemp.currentBattleActor){
		 var participants = $statCalc.getCombinationWeaponParticipants(actor, weapon).participants || [];
		 if($gameTemp.currentBattleActor && (participants.indexOf($gameTemp.currentBattleActor) != -1 || participants.indexOf($gameTemp.currentBattleActor.subTwin) != -1)){
			 isInnerComboParticipant = true; //if the unit is attempting to do a combo attack with a main or sub twin but they're doing a different attack
		 }
	}	
	return !isInnerComboParticipant;
}

StatCalc.prototype.canUseWeaponDetail = function(actor, weapon, postMoveEnabledOnly, rangeTarget, allRequired){
	var canUse = true;
	var detail = {};
	if(this.isActorSRWInitialized(actor)){
		
		if(weapon.isCounterOnly){
			var counterWepOK = true;
			if(!$gameTemp.isEnemyTurn()){
				if(!$gameSystem.isEnemy(actor)){
					counterWepOK = false;
				}
			} else {
				if($gameSystem.isEnemy(actor)){
					counterWepOK = false;
				}
			}
			
			if(!counterWepOK){
				canUse = false;
				detail.isCounterOnly = true;
			}
		}		
		if(weapon.isCombination){			
			if(!this.getCombinationWeaponParticipants(actor, weapon).isValid){
				canUse = false;
				detail.noParticipants = true;
			} 	
			
			if(!this.isComboAttackValidForSupport(actor, weapon)){
				canUse = false;
				detail.noComboSupport = true;
			}
		}		
		if(this.getCurrentAmmo(actor, weapon) == 0){ //current ammo is -1 for attacks that don't consume any
			canUse = false;
			detail.ammo = true;
		}
		if(weapon.ENCost > actor.SRWStats.mech.stats.calculated.currentEN){
			canUse = false;
			detail.EN = true;
		}
		if(weapon.MPCost > actor.SRWStats.pilot.stats.calculated.currentMP){
			canUse = false;
			detail.MP = true;
		}
		if(weapon.willRequired > actor.SRWStats.pilot.will){
			canUse = false;
			detail.will = true;
		}
		if(postMoveEnabledOnly && !weapon.postMoveEnabled && (!this.getActiveSpirits(actor).charge || (weapon.isMap && !ENGINE_SETTINGS.ALLOW_MAP_CHARGE))){
			canUse = false;
			detail.postMove = true;
		}
		if(allRequired == 1 && !weapon.isAll){
			canUse = false;
			detail.isAll = true;
		}
		if(allRequired == -1 && weapon.isAll){
			canUse = false;
			detail.isRegular = true;
		}
		var pos = {
			x: this.getReferenceEvent(actor).posX(),
			y: this.getReferenceEvent(actor).posY()
		};
		if(!weapon.isMap){
			if(rangeTarget){
				var targetpos = {
					x: rangeTarget.event.posX(),
					y: rangeTarget.event.posY()
				};
				if(!$battleCalc.isTargetInRange(pos, targetpos, $statCalc.getRealWeaponRange(actor, weapon), $statCalc.getRealWeaponMinRange(actor, weapon))){
					canUse = false;
					detail.target = true;
				}
				var targetTerrain = this.getCurrentAliasedTerrain(rangeTarget);
				var terrainRank = weapon.terrain[targetTerrain];
				if(terrainRank == "-"){
					canUse = false;
					detail.terrain = true;
				}				
			
				if(weapon.invalidTargetTags){
					var targetTags = {...this.getPilotTags(rangeTarget), ...this.getActorTags(rangeTarget)};
					let isValid = true;
					for(let tag in weapon.invalidTargetTags){
						if(targetTags[tag]){
							isValid = false;
						}
					}
					if(!isValid){
						canUse = false;
						detail.tag = true;
					}
				}						
			} else {
				var rangeResult;
				
				if(!this.getAllInRangeOfWeapon(actor, weapon, false, false).length){
					canUse = false;
					detail.target = true;
				}
			}
		} else {
			if($gameTemp.isEnemyAttack){
				canUse = false;
				detail.isMap = true;
	
			}  else if(rangeTarget){
				canUse = false;
				detail.isMap2 = true;
			} else {
				//hack to avoid needing to move the map attack handling functions to another module
				const sceneManager = SceneManager._scene;		
				if(sceneManager && sceneManager.getBestMapAttackTargets){
					if(!sceneManager.actorMapWeaponHasTargets(actor, weapon)){
						canUse = false;
						detail.target = true;
					}

				}
			}			
		}				

		if(weapon.HPThreshold != -1){
			var stats = this.getCalculatedMechStats(actor);
			var ratio = stats.currentHP / stats.maxHP * 100;
			if(ratio > weapon.HPThreshold){
				canUse = false;
				detail.isHPGated = true;
			}				
		}	
		if(this.isInnerComboParticipant(actor)){
			canUse = false;
			detail.isInnerCombo = true;
		}
		
	} else {
		canUse = false;
	} 	
	return {
		canUse: canUse,
		detail: detail
	};
}

StatCalc.prototype.canUseWeapon = function(actor, weapon, postMoveEnabledOnly, defender){
	if(this.isActorSRWInitialized(actor)){		
		
		if(weapon.isCounterOnly){
			var counterWepOK = true;
			if(!$gameTemp.isEnemyTurn()){
				if(!$gameSystem.isEnemy(actor)){
					counterWepOK = false;
				}
			} else {
				if($gameSystem.isEnemy(actor)){
					counterWepOK = false;
				}
			}
			
			if(!counterWepOK){
				return false;
			}
		}
		
		if(weapon.isCombination){			
			if(!this.getCombinationWeaponParticipants(actor, weapon).isValid){
				return false;
			} 				
			if(!this.isComboAttackValidForSupport(actor, weapon)){
				return false;
			}	
		}
		if(this.getCurrentAmmo(actor, weapon) == 0){ //current ammo is -1 for attacks that don't consume any
			return false;
		}
		if(weapon.ENCost > actor.SRWStats.mech.stats.calculated.currentEN){
			return false;
		}
		if(weapon.MPCost > actor.SRWStats.pilot.stats.calculated.currentMP){
			return false;
		}
		if(weapon.willRequired > actor.SRWStats.pilot.will){
			return false;
		}
		if(postMoveEnabledOnly && !weapon.postMoveEnabled && (!this.getActiveSpirits(actor).charge || (weapon.isMap && !ENGINE_SETTINGS.ALLOW_MAP_CHARGE))){
			return false;
		}
		if(!actor.isActor() && weapon.isMap && actor.SRWStats.stageTemp.nonMapAttackCounter < actor.SRWStats.stageTemp.mapAttackCoolDown){
			return false;
		}
		
		if(defender){
			var targetTerrain = this.getCurrentAliasedTerrain(defender)
			var terrainRank = weapon.terrain[targetTerrain];
			if(terrainRank == "-"){
				return false;
			}
			if(weapon.invalidTargetTags){
				var targetTags = {...this.getPilotTags(defender), ...this.getActorTags(defender)};
				let isValid = true;
				for(let tag in weapon.invalidTargetTags){
					if(targetTags[tag]){
						isValid = false;
					}
				}
				if(!isValid){
					return false;
				}
			}			
		}	
		if(weapon.HPThreshold != -1){
			var stats = this.getCalculatedMechStats(actor);
			var ratio = stats.currentHP / stats.maxHP * 100;
			if(ratio > weapon.HPThreshold){
				return false;
			}				
		}	
		if(this.isInnerComboParticipant(actor)){
			return false;
		}
	} else {
		return false;
	} 	
	return true;
}	

StatCalc.prototype.hasMapWeapon = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var allWeapons = this.getActorMechWeapons(actor);
		var result = false;
		allWeapons.forEach(function(weapon){
			if(weapon.isMap){
				result = true;
			}
		});
		return result;
	} else {
		return false;
	}
}

StatCalc.prototype.hasMapWeaponWithTargets = function(actor){
	if(this.isActorSRWInitialized(actor)){
		//hack to avoid needing to move the map attack handling functions to another module
		const sceneManager = SceneManager._scene;
		let hasMapWeapon = false;
		if(sceneManager && sceneManager.getBestMapAttackTargets){
			var mapWeapons = $statCalc.getActiveMapWeapons(actor, false);	
			if(mapWeapons.length){
				mapWeapons.forEach(function(mapWeapon){
					if(sceneManager.actorMapWeaponHasTargets(actor, mapWeapon)){
						hasMapWeapon = true;
					}
				});
			}
		}		
		return hasMapWeapon;
	} else {
		return false;
	}
}

StatCalc.prototype.incrementNonMapAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.nonMapAttackCounter++;
	} 
}

StatCalc.prototype.clearNonMapAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.nonMapAttackCounter = 0;
	} 
}

StatCalc.prototype.getMaxWill = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var willOverFlow = this.getStageTemp(actor, "willOverflow");
		if(willOverFlow){
			return willOverFlow;
		}
		var maxWill = 150;
		maxWill = $statCalc.applyStatModsToValue(actor, maxWill, ["max_will"]);
		if($gameSystem.isFriendly(actor, "player")){
			if($gameSystem.allyWillCap != null){
				maxWill = $gameSystem.allyWillCap;
			}
		} else {
			if($gameSystem.enemyWillCap != null){
				maxWill = $gameSystem.enemyWillCap;
			}
		}
		return maxWill;			
	} 	
	return 100;
}

StatCalc.prototype.canWillIncrease = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will < this.getMaxWill(actor);		
	} 	
	return false;
}

StatCalc.prototype.canWillDecrease = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will > 50;		
	} 	
	return false;
}

StatCalc.prototype.iterateAllActors = function(type, func){
	var _this = this;
	var actorCollection;
	if($gameSystem._isIntermission){
		actorCollection = $gameSystem._availableUnits;
		actorCollection = actorCollection.concat($gameSystem._availableMechs);
		
		actorCollection.forEach(function(actor) {			
			if(actor && _this.isActorSRWInitialized(actor) && actor.event){
				if(!type || (type == "actor" && actor.isActor()) || (type == "enemy" && !actor.isActor())){
					func(actor, actor.event);
				}			
			}
		});
	} else {
		actorCollection = $gameMap.events();
		actorCollection.forEach(function(event) {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			if(battlerArray){
				var actor = battlerArray[1];
				if(actor && _this.isActorSRWInitialized(actor)){
					if(!type || (type == "actor" && actor.isActor()) || (type == "enemy" && !actor.isActor())){
						func(actor, event);
						if(actor.subTwin){
							func(actor.subTwin, event);
						}
					}
				}
			}
		});
	}
}

StatCalc.prototype.isMechDeployed = function(mechId){
	var result = false;
	this.iterateAllActors(null, function(actor, event){		
		if(actor.SRWStats.mech.id == mechId){
			result = true;
		}
	});
	return result;
}

StatCalc.prototype.getTopAce = function(){
	var _this = this;
	var maxKills = -1;
	var topAce;
	this.iterateAllActors("actor", function(actor, event){		
		var kills = _this.getKills(actor);
		if(kills > maxKills){
			maxKills = kills;
			topAce = actor;
		}		
	});
	return topAce;
}

StatCalc.prototype.getActorRankLookup = function(){
	var _this = this;
	var result = {};
	var rankInfo = [];
	$gameParty.allMembers().forEach(function(actor){
		rankInfo.push({id: actor.actorId(), score: _this.getKills(actor), name: actor.name()})
	});
	
	rankInfo = rankInfo.sort(function(a, b){
		var result;
		if(a.score != b.score){
			result = b.score - a.score;
		} else {
			result = a.name.localeCompare(b.name);
		}
		return result;
	});
	
	for(var i = 0; i < rankInfo.length; i++){
		result[rankInfo[i].id] = i;
	}
	return result;
}

StatCalc.prototype.getFullWeaponRange = function(actor, postMoveEnabledOnly){
	var _this = this;
	var allWeapons = _this.getActorMechWeapons(actor);
	var currentRange = 0;
	var currentMinRange = -1;
	allWeapons.forEach(function(weapon){
		if(_this.canUseWeapon(actor, weapon, postMoveEnabledOnly)){
			var range = _this.getRealWeaponRange(actor, weapon);
			var minRange = _this.getRealWeaponMinRange(actor, weapon);
			if(range > currentRange){
				currentRange = range;
			}
			if(currentMinRange == -1 || currentMinRange > minRange){
				currentMinRange = minRange;
			}
		}		
	});
	return {range: currentRange, minRange: currentMinRange};
}



StatCalc.prototype.isReachable = function(target, range, minRange){
	const _this = this;	
	let hasEmptyTiles = false;
	const event = this.getReferenceEvent(target);
	const offsetX = event.posX();
	const offsetY = event.posY();
	
	const occupiedSpaces = this.getAllOccupiedSpacesLookup();
	
	for(let i = 0; i < range * 2; i++){
		for(let j = 0; j < range * 2; j++){
			const x = offsetX - range + i;
			const y = offsetY - range + j;
			if(!occupiedSpaces[x] || !occupiedSpaces[x][y]){
				const deltaX = Math.abs(offsetX - x);
				const deltaY = Math.abs(offsetY - y);
				const totalDelta = deltaX + deltaY;
				if(totalDelta <= range && totalDelta >= minRange){				
					hasEmptyTiles = true;				
				}
			}
		}
	}
	return hasEmptyTiles;
}

StatCalc.prototype.isValidWeaponTarget = function(actor, target, weapon, includeMoveRange){
	const _this = this;
	let additionalRange = 0;
	if(includeMoveRange){
		additionalRange = _this.getCurrentMoveRange(actor);		
	}	
	
	const factionConfig = $gameSystem.getUnitFactionInfo(actor);
	var range = _this.getRealWeaponRange(actor, weapon) + additionalRange;
	var minRange = _this.getRealWeaponMinRange(actor, weapon);
	
	let actorRefEvent = _this.getReferenceEvent(actor);
	let targetRefEvent = _this.getReferenceEvent(target);
	var isInRange = $battleCalc.isTargetInRange({x: actorRefEvent.posX(), y: actorRefEvent.posY()}, {x: targetRefEvent.posX(), y: targetRefEvent.posY()}, range, minRange);
	var isValidTarget = false;

	if(!weapon.ignoresEnemies){		
		if(!$gameSystem.isFriendly(target, factionConfig.ownFaction)){
			isValidTarget = true;
		}
	}
	if(!weapon.ignoresFriendlies){
		if($gameSystem.isFriendly(target, factionConfig.ownFaction)){
			isValidTarget = true;
		}
	}
	return isValidTarget && isInRange;
}

StatCalc.prototype.getAllInRange = function(initiator, includeMoveRange, postMoveOnly, includeFriendlies){
	var _this = this;
	const factionId = $gameSystem.getFactionId(initiator);
	var result = [];	
	var allWeapons = _this.getActorMechWeapons(initiator);
	allWeapons.forEach(function(weapon){
		if(_this.canUseWeapon(initiator, weapon, postMoveOnly)){			
			_this.iterateAllActors(null, function(target, event){	
				if(!$gameSystem.isFriendly(target, factionId) || includeFriendlies){
					if(!event.isErased() && _this.isValidWeaponTarget(initiator, target, weapon, includeMoveRange)){
						result.push(event);
					}	
				}						
			});
		}		
	});
	return result;
}

StatCalc.prototype.getAllInRangeOfWeapon = function(initiator, weapon, includeMoveRange, postMoveOnly){
	var _this = this;
	const factionId = $gameSystem.getFactionId(initiator);
	var result = [];	
	
	if(_this.canUseWeapon(initiator, weapon, postMoveOnly)){			
		_this.iterateAllActors(null, function(target, event){
			let isValidFactionTarget = false;
			if($gameSystem.isFriendly(target, factionId)){
				isValidFactionTarget = !weapon.ignoresFriendlies;
			} else {
				isValidFactionTarget = !weapon.ignoresEnemies;
			}
			
			if(isValidFactionTarget){
				if(!event.isErased() && _this.isValidWeaponTarget(initiator, target, weapon, includeMoveRange)){
					result.push(event);
				}	
			}						
		});
	}		
	
	return result;
}

StatCalc.prototype.isActorBelowHP = function(id, hp){
	return this.isBelowHP("actor", id, hp);
}

StatCalc.prototype.isEnemyBelowHP = function(id, hp){
	return this.isBelowHP("enemy", id, hp);
}

StatCalc.prototype.isBelowHP = function(type, id, hp){
	var _this = this;
	var result = false;
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			var currentId;
			if(type == "actor"){
				currentId = actor.actorId();
			} else {
				currentId = actor.enemyId();
			}
			if((currentId == id || id == -1) && _this.getCalculatedMechStats(actor).currentHP < hp){
				result = true;
			}
		}				
	});
	return result;
}

StatCalc.prototype.isEventBelowHP = function(id, hp){
	var _this = this;
	var result = false;
	this.iterateAllActors(null, function(actor, event){	
		if(!event.isErased()){	
			if(actor.event.eventId() == id && _this.getCalculatedMechStats(actor).currentHP < hp){
				result = true;
			}	
		}	
	});
	return result;
}


StatCalc.prototype.isActorBelowHPPercent = function(id, percent){
	return this.isBelowHPPercent("actor", id, percent);
}

StatCalc.prototype.isEnemyBelowHPPercent = function(id, percent){
	return this.isBelowHPPercent("enemy", id, percent);
}

StatCalc.prototype.isBelowHPPercent = function(type, id, percent){
	var _this = this;
	var result = false;
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			var currentId;
			if(type == "actor"){
				currentId = actor.actorId();
			} else {
				currentId = actor.enemyId();
			}
			
			if(currentId == id || id == -1){
				var stats = _this.getCalculatedMechStats(actor);
				if(Math.floor((stats.currentHP / stats.maxHP) * 100) < percent){
					result = true;
				}				
			}
		}				
	});
	return result;
}

StatCalc.prototype.isEventBelowHPPercent = function(id, percent){
	var _this = this;
	var result = false;
	this.iterateAllActors(null, function(actor, event){	
		if(!event.isErased()){	
			if(actor.event.eventId() == id){
				var stats = _this.getCalculatedMechStats(actor);
				if(Math.floor((stats.currentHP / stats.maxHP) * 100) < percent){
					result = true;
				}	
			}	
		}	
	});
	return result;
}

StatCalc.prototype.getAllOccupiedSpaces = function(){
	var result = [];
	this.iterateAllActors(null, function(actor, event){			
		result.push({x: event.posX(), y: event.posY()});				
	});
	return result;
}

StatCalc.prototype.getAllOccupiedSpacesLookup = function(){
	var result = {};
	this.iterateAllActors(null, function(actor, event){		
		if(!event.isErased()){
			const x = event.posX();
			const y = event.posY();
			if(!result[x]){
				result[x] = {};
			}
			result[x][y] = true;
		}						
	});
	return result;
}

StatCalc.prototype.isActorInRegion = function(actorId, regionId){
	var result = false;
	this.iterateAllActors("actor", function(actor, event){	
		if(!event.isErased() && (actorId == -1 || actorId == actor.actorId()) && $gameMap.regionId(event.posX(), event.posY()) == regionId){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.isEnemyInRegion = function(enemyId, regionId){
	var result = false;
	this.iterateAllActors("enemy", function(actor, event){	
		if(!event.isErased() && (enemyId == -1 || enemyId == actor.enemyId()) && $gameMap.regionId(event.posX(), event.posY()) == regionId){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.isEventInRegion = function(eventId, regionId){
	var _this = this;
	var result = false;
	this.iterateAllActors("", function(actor, event){	
		var referenceEvent = _this.getReferenceEvent(actor);
		if(!event.isErased() && (eventId == -1 || eventId == referenceEvent.eventId()) && $gameMap.regionId(event.posX(), event.posY()) == regionId){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.isFreeSpace = function(position, type, factionConfig){
	var isFree = true;
	this.iterateAllActors(type, function(actor, event){		
		var isPassThrough = false;
		if(factionConfig){
			if(actor.isActor() && !factionConfig.attacksPlayers){
				isPassThrough = true;
			} 
			if(actor.isEnemy() && factionConfig.attacksFactions.indexOf(actor.factionId) == -1){
				isPassThrough = true;
			}
		}
		if(!isPassThrough && (event.posX() == position.x && event.posY() == position.y && !event.isErased())){
			isFree = false;
		}		
	});
	return isFree;
}

StatCalc.prototype.getBlockedSpacesLookup = function(type, factionConfig){	
	let result = {};
	this.iterateAllActors(type, function(actor, event){		
		var isPassThrough = false;
		if(factionConfig){
			if(actor.isActor() && !factionConfig.attacksPlayers){
				isPassThrough = true;
			} 
			if(actor.isEnemy() && factionConfig.attacksFactions.indexOf(actor.factionId) == -1){
				isPassThrough = true;
			}
		}
		if(!isPassThrough && !event.isErased()){
			if(!result[event.posX()]){
				result[event.posX()] = {};
			}
			result[event.posX()][event.posY()] = true;
		}		
	});
	return result;
}

StatCalc.prototype.isFreeSpace = function(position, type, factionConfig){
	var isFree = true;
	this.iterateAllActors(type, function(actor, event){		
		var isPassThrough = false;
		if(factionConfig){
			if(actor.isActor() && !factionConfig.attacksPlayers){
				isPassThrough = true;
			} 
			if(actor.isEnemy() && factionConfig.attacksFactions.indexOf(actor.factionId) == -1){
				isPassThrough = true;
			}
		}
		if(!isPassThrough && (event.posX() == position.x && event.posY() == position.y && !event.isErased())){
			isFree = false;
		}		
	});
	return isFree;
}

StatCalc.prototype.getAdjacentFreeStandableSpace = function(actor, position, type){
	return this.getAdjacentFreeSpace(position, type, null, null, null, null, true, actor);
}

StatCalc.prototype.getAdjacentFreeSpace = function(position, type, eventId, sourcePosition, hardBias, usedPositions, onlyStandable, refActor){
	var occupiedCoordLookup = {};
	this.iterateAllActors(type, function(actor, event){			
		if(!event.isErased() && event.eventId() != eventId){
			if(!occupiedCoordLookup[event.posX()]){
				occupiedCoordLookup[event.posX()] = {};
			}
			occupiedCoordLookup[event.posX()][event.posY()] = true;
		}		
	});
	
	if(usedPositions){
		Object.keys(usedPositions).forEach(function(x){
			Object.keys(usedPositions[x]).forEach(function(y){
				occupiedCoordLookup[x][y] = true;
			});
		});
	}
	
	var candidates = [];
	for(var i = 0; i < $gameMap.width(); i++){
		for(var j = 0; j < $gameMap.height(); j++){
			if(!occupiedCoordLookup[i] || !occupiedCoordLookup[i][j]){
				var sourceDistance;
				if(sourcePosition){
					sourceDistance = Math.hypot(sourcePosition.x-i, sourcePosition.y-j);
				}
				if(!onlyStandable || this.canStandOnTile(refActor, {x: i, y: j})){
					candidates.push({position: {x: i, y: j}, distance: Math.hypot(position.x-i, position.y-j), sourceDistance: sourceDistance});
				}				
			}
		}
	}
	if(!candidates.length){
		return null;
	}
	if(hardBias && sourcePosition){// place preference on hitting the bias position
		return candidates.sort(function(a, b){
			if(a.sourceDistance == b.sourceDistance){
				if(a.position != b.position){
					return a.position - b.position;
				} else {
					var aAngle = Math.atan2(a.position.y - position.y, a.position.x - position.x);
					var bAngle = Math.atan2(b.position.y - position.y, b.position.x - position.x);
					return aAngle - bAngle;
				}			
			} else {
				return a.sourceDistance - b.sourceDistance;
			}		
		})[0].position;
	} else {
		return candidates.sort(function(a, b){
			if(a.distance == b.distance){
				if(sourcePosition && a.sourceDistance != b.sourceDistance){
					return a.sourceDistance - b.sourceDistance;
				} else {
					var aAngle = Math.atan2(a.position.y - position.y, a.position.x - position.x);
					var bAngle = Math.atan2(b.position.y - position.y, b.position.x - position.x);
					return aAngle - bAngle;
				}			
			} else {
				return a.distance - b.distance;
			}		
		})[0].position;
	}
	
}

StatCalc.prototype.activeUnitAtPosition = function(position, type){
	var result;
	this.iterateAllActors(type, function(actor, event){			
		if(!event.isErased() && event.posX() == position.x && event.posY() == position.y && !event.isErased() && !actor.isSubTwin){
			result = actor;
		}		
	});
	return result;
}

StatCalc.prototype.activeUnitsInTileRange = function(tiles, type){
	var result = [];
	var lookup = {};
	for(var i = 0; i < tiles.length; i++){
		var coord = tiles[i];
		if(!lookup[coord[0]]){
			lookup[coord[0]] = {};
		}
		if(!lookup[coord[0]][coord[1]]){
			lookup[coord[0]][coord[1]] = true;
		}
	}
	this.iterateAllActors(null, function(actor, event){			
		if(!event.isErased() && lookup[event.posX()]  && lookup[event.posX()][event.posY()]){
			if(type == "enemy"){
				if($gameSystem.isEnemy(actor)){
					result.push(actor);
				}				
			} else if(type == "actor"){
				if(!$gameSystem.isEnemy(actor)){
					result.push(actor);
				}	
			} else {
				result.push(actor);
			}			
		}		
	});
	return result;
}

StatCalc.prototype.getAllActors = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor){			
		result.push(actor);				
	});
	return result;
}


StatCalc.prototype.getAllActorEvents = function(type, factionConfig){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){			
			var isValidTarget = true;
			if(factionConfig){
				isValidTarget = false;
				if(factionConfig.attacksPlayers && actor.isActor()){
					isValidTarget = true;
				}
				if(factionConfig.attacksFactions.indexOf(actor.factionId) != -1){
					isValidTarget = true;
				}							
			}	
			if(isValidTarget){
				result.push(event);
			}	
		}					
	});
	return result;
}

StatCalc.prototype.getSearchedActors = function(type, searchInfo){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(event && !event.isErased()){			
			var actors = [actor];
			
			if(!actor.isSubPilot){
				var subPilots = _this.getSubPilots(actor);
				var ctr = 0;
				subPilots.forEach(function(pilotId){
					actors.push($gameActors.actor(pilotId));
				});
			}

			actors.forEach(function(actor){
				var isValid = false;
				if(searchInfo.type == "spirit"){
					var currentLevel = _this.getCurrentLevel(actor);
					var regularSpirits = _this.getSpiritList(actor);
					regularSpirits.forEach(function(spirit){
						if(spirit.idx != "" && spirit.level <= currentLevel && spirit.idx == searchInfo.value){
							isValid = true;
						}
					});
					var twinSpirit = _this.getTwinSpirit(actor);
					if(twinSpirit && twinSpirit.idx != "" && twinSpirit.idx == searchInfo.value){
						isValid = true;
					}
				} else if(searchInfo.type == "pilot"){
					var abilties = _this.getPilotAbilityList(actor);
					abilties.forEach(function(ability){
						if(ability.idx == searchInfo.value){
							isValid = true;
						}
					});
				} else if(searchInfo.type == "mech"){
					var abilties = _this.getMechAbilityList(actor);
					abilties.forEach(function(ability){
						if(ability.idx == searchInfo.value){
							isValid = true;
						}
					});
				}
				if(isValid){
					result.push(actor);		
				}	
			
			});	
		}	
	});
	return result;
}


StatCalc.prototype.getOccupiedPositionsLookup = function(type, factionConfig){
	var result = {};
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			var x = event.posX();
			var y = event.posY(); 
			if(!result[x]){
				result[x] = {};
			}
			var isPassThrough = false;
			if(factionConfig){
				if(actor.isActor() && !factionConfig.attacksPlayers){
					isPassThrough = true;
				}
				if(actor.isEnemy() && factionConfig.attacksFactions.indexOf(actor.factionId) == -1){
					isPassThrough = true;
				}
			}
			if(!isPassThrough){
				result[x][y] = 1;
			}			
		}					
	});
	return result;
}

StatCalc.prototype.getAllCandidates = function(type, excludeTurnEnd){
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased() && (!excludeTurnEnd || !actor.srpgTurnEnd())){
			result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}, event: event});	
		}					
	});
	return result;
}

StatCalc.prototype.getAllCandidateActors = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			result.push(actor);	
		}					
	});
	return result;
}

StatCalc.prototype.isAdjacentTo = function(type, actor, targetId){
	var result = false
	var actorId;
	if(actor.isActor()){
		actorId = actor.actorId();
	} else {
		actorId = actor.enemyId();
	}
	var event = $gameMap.event($gameSystem.ActorToEvent(actorId));
	if(event){
		var position = {x: event.posX(), y: event.posY()};
		this.iterateAllActors(type, function(actor, event){	
			var actorId;
			if(actor.isActor()){
				actorId = actor.actorId();
			} else {
				actorId = actor.enemyId();
			}
			if(!event.isErased() && actorId == targetId && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){		
				result = true;
			}					
		});
	}
	return result;
}

StatCalc.prototype.getAdjacentEvents = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push(event);							
		}					
	});
	return result;
}

StatCalc.prototype.getAdjacentActors = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push(actor);							
		}					
	});
	return result;
}

StatCalc.prototype.getAdjacentActorsWithDiagonal = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		var isDirect = false;
		if((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			isDirect = true;
		}
		var isDiagonal = false;
		if((Math.abs(event.posX() - position.x) == 1 && Math.abs(event.posY() - position.y)) == 1){
			isDiagonal = true;
		}	
		if(!event.isErased() && (isDirect || isDiagonal)){				
			result.push(actor);							
		}					
	});
	return result;
}

StatCalc.prototype.getSupportRecipientCandidates = function(type, position, all){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}, event: event});							
		}					
	});
	return result;
}

StatCalc.prototype.hasSupportAttack = function(supportingActor){
	var maxSupportAttacks = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_attack"]);			
	return (maxSupportAttacks > supportingActor.SRWStats.battleTemp.supportAttackCount && (!supportingActor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT));
}

StatCalc.prototype.canSupportAttack = function(supportedActor, supportingActor){
	var _this = this;
	var result = false;
	var terrainIdx = this.getCurrentAliasedTerrainIdx(supportedActor);
	var maxSupportAttacks = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_attack"]);
	if(supportedActor != supportingActor && maxSupportAttacks > supportingActor.SRWStats.battleTemp.supportAttackCount && (!supportingActor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT) && !_this.isDisabled(supportingActor)){
		var validTerrain = this.canBeOnTerrain(supportingActor, terrainIdx);			
		if($gameSystem.isFriendly(supportingActor, $gameSystem.getFactionId(supportedActor)) && validTerrain){
			result = true;
		}				
	}
	return result;
}

StatCalc.prototype.getSupportAttackCandidates = function(factionId, position, terrainIdx, eventId, ignoreConditions){
	var _this = this;
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1 && (eventId == null || event.eventId() != eventId) && !actor.isSubTwin){
			var maxSupportAttacks = $statCalc.applyStatModsToValue(actor, 0, ["support_attack"]);
			if(ignoreConditions || (maxSupportAttacks > actor.SRWStats.battleTemp.supportAttackCount && (!actor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT) && !_this.isDisabled(actor))){
				var validTerrain = _this.canBeOnTerrain(actor, terrainIdx);							
				if($gameSystem.isFriendly(actor, factionId) && validTerrain){
					result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}});	
				}				
			}			
		}					
	});
	return result;
}

StatCalc.prototype.incrementSupportAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.supportAttackCount++;
	}
}

StatCalc.prototype.hasSupportDefend = function(supportingActor){
	var maxSupportDefends = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_defend"]);			
	return (maxSupportDefends > supportingActor.SRWStats.battleTemp.supportDefendCount);
}

StatCalc.prototype.canSupportDefend = function(supportedActor, supportingActor){
	var _this = this;
	var result = false;
	if(this.isActorSRWInitialized(supportingActor) && this.isActorSRWInitialized(supportedActor)){
		var terrainIdx = this.getCurrentAliasedTerrainIdx(supportedActor);
		var maxSupportDefends = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_defend"]);			
		if(supportedActor != supportingActor && maxSupportDefends > supportingActor.SRWStats.battleTemp.supportDefendCount && !_this.isDisabled(supportingActor)){
			var validTerrain = this.canBeOnTerrain(supportingActor, terrainIdx);	
			if($gameSystem.isFriendly(supportingActor, $gameSystem.getFactionId(supportedActor)) && validTerrain){
				result = true;
			}				
		}
	}
	return result;
}
	
StatCalc.prototype.getSupportDefendCandidates = function(factionId, position, terrainIdx, eventId){
	var _this = this;
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1 && (eventId == null || event.eventId() != eventId)){
			var maxSupportDefends = $statCalc.applyStatModsToValue(actor, 0, ["support_defend"]);			
			if(maxSupportDefends > actor.SRWStats.battleTemp.supportDefendCount && !_this.isDisabled(actor)){
				var validTerrain = _this.canBeOnTerrain(actor, terrainIdx);	;
				if($gameSystem.isFriendly(actor, factionId) && validTerrain){
					result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}});
				}				
			}
		}					
	});
	return result;
}

StatCalc.prototype.incrementSupportDefendCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.supportDefendCount++;
	}
}

StatCalc.prototype.getEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.battleTemp.evadeCount;
	}
}

StatCalc.prototype.incrementEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.evadeCount++;
	}
}

StatCalc.prototype.resetEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.evadeCount = 0;
	}
}

StatCalc.prototype.hasUsedContinuousAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.battleTemp.hasUsedContinuousAction;
	}
}

StatCalc.prototype.setHasUsedContinuousAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.hasUsedContinuousAction = 1;
	}
}

StatCalc.prototype.setCurrentAttack = function(actor, attack){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.currentAttack = attack;
	}
}

StatCalc.prototype.resetCurrentAttack = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.currentAttack = null;
	}
}

StatCalc.prototype.modifyAllWill = function(type, increment){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.modifyWill(actor, increment);						
	});
}

StatCalc.prototype.setWill = function(actor, amount, noSubPilots){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.pilot.will = amount;
		if(!noSubPilots && actor.isActor()){
			const subPilots = this.getSubPilots(actor);
			for(let pilotId of subPilots){
				this.setWill($gameActors.actor(pilotId), amount, true);
			}
		}
	}
}

StatCalc.prototype.modifyWill = function(actor, increment, preserveCache, noSubPilots){
	if(this.isActorSRWInitialized(actor)){
		var maxWill = this.getMaxWill(actor);
		actor.SRWStats.pilot.will+=increment;
		if(actor.SRWStats.pilot.will > maxWill){
			actor.SRWStats.pilot.will = maxWill;
		}
		if(actor.SRWStats.pilot.will < 50){
			actor.SRWStats.pilot.will = 50;
		}
		if(!noSubPilots && actor.isActor()){
			const subPilots = this.getSubPilots(actor);
			for(let pilotId of subPilots){
				if(pilotId){
					this.modifyWill($gameActors.actor(pilotId), increment, preserveCache, true);	
				}				
			}
		}
	} 	
	if(!preserveCache){
		if(actor){
			this.invalidateAbilityCache(actor);	
		}		
	}	
}

StatCalc.prototype.getMechTerrainString = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		var currentTerrain;
		if(terrain){
			currentTerrain = terrain;
		} else {
			currentTerrain = this.getCurrentAliasedTerrain(actor);
		}		
		var mechTerrainLevel = actor.SRWStats.mech.stats.calculated.terrain[currentTerrain]; 
		var mechTerrainNumeric = this._terrainToNumeric[mechTerrainLevel];
		var minMechTerrains = this.getMinTerrains(actor);
		if(mechTerrainNumeric < minMechTerrains[currentTerrain] || (mechTerrainNumeric == undefined && minMechTerrains[currentTerrain] != -1)){
			mechTerrainNumeric = minMechTerrains[currentTerrain];
		}		
		return this._terrainSumToLevel[mechTerrainNumeric + mechTerrainNumeric];
	} 	
	return 0;
}

StatCalc.prototype.getTerrainMod = function(actor, terrain){			
	return this.getTerrainPerformance(this.getFinalTerrainString(actor, terrain));	
}

StatCalc.prototype.getFinalTerrainString = function(actor, terrain){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech.id != -1){
		var currentTerrain;
		if(terrain){
			currentTerrain = terrain;
		} else {
			currentTerrain = this.getCurrentAliasedTerrain(actor);
		}		
		var pilotTerrainLevel = actor.SRWStats.pilot.stats.calculated.terrain[currentTerrain];
		var mechTerrainLevel = actor.SRWStats.mech.stats.calculated.terrain[currentTerrain]; 
		var mechTerrainNumeric = this._terrainToNumeric[mechTerrainLevel];
		var minMechTerrains = this.getMinTerrains(actor);	
		if(mechTerrainNumeric < minMechTerrains[currentTerrain] || (mechTerrainNumeric == undefined && minMechTerrains[currentTerrain] != -1)){
			mechTerrainNumeric = minMechTerrains[currentTerrain];
		}		
		return this._terrainSumToLevel[this._terrainToNumeric[pilotTerrainLevel] + mechTerrainNumeric];
	} 	
	return "-";
}

StatCalc.prototype.getWeaponTerrainMod = function(attackingActor, targetActor, weaponInfo){
	if(this.isActorSRWInitialized(targetActor) && this.isActorSRWInitialized(attackingActor)){
		var currentTerrain = this.getCurrentAliasedTerrain(targetActor);
		var weaponTerrainRanking = weaponInfo.terrain[currentTerrain];
		
		var weaponTerrainNumeric = this._terrainToNumeric[weaponTerrainRanking];
		var minTerrains = this.getMinTerrains(attackingActor);	
		if(weaponTerrainNumeric < minTerrains[currentTerrain] || (weaponTerrainNumeric == undefined && minTerrains[currentTerrain] != -1)){
			weaponTerrainNumeric = minTerrains[currentTerrain];
		}		
		return this._terrainSumToLevel[weaponTerrainNumeric + weaponTerrainNumeric];
	} 	
	return 0;
}

StatCalc.prototype.getMinTerrains = function(actor){
	let result;
	if(this.isActorSRWInitialized(actor)){
		result = {
			"land": this.applyMaxStatModsToValue(actor, 0, ["land_terrain_rating"]),
			"air": this.applyMaxStatModsToValue(actor, 0, ["air_terrain_rating"]),
			"water": this.applyMaxStatModsToValue(actor, 0, ["water_terrain_rating"]),
			"space": this.applyMaxStatModsToValue(actor, 0, ["space_terrain_rating"])
		};
	} else {
		result = {
			"land": 0,
			"air": 0,
			"water": 0,
			"space": 0
		};
	}
	for(let key in result){
		if(result[key] == 0){
			result[key] = -1;//indicate that the min terrain is unset if the result is 0, this is needed to avoid elevating - terrain to D terrain by default. Note: this means it's impossible to "raise" terrain to D rank using an ability.
		}
	}
	return result;
}

StatCalc.prototype.getRealWeaponTerrainStrings = function(actor, weaponInfo){
	var _this = this;
	if(this.isActorSRWInitialized(actor) && weaponInfo && weaponInfo.terrain){
		var minTerrains = this.getMinTerrains(actor);
		var result = {};
		Object.keys(weaponInfo.terrain).forEach(function(currentTerrain){
			var weaponTerrainRanking = weaponInfo.terrain[currentTerrain];
			var weaponTerrainNumeric = _this._terrainToNumeric[weaponTerrainRanking];
			if(weaponTerrainNumeric < minTerrains[currentTerrain] || (weaponTerrainNumeric == undefined && minTerrains[currentTerrain] != -1)){
				weaponTerrainNumeric = minTerrains[currentTerrain];
			}	
			result[currentTerrain] = _this._terrainSumToLevel[weaponTerrainNumeric + weaponTerrainNumeric];
		}); 
		return result;
	} else {
		return {air: "-", land: "-", water: "-", space: "-"};
	}
}

StatCalc.prototype.getRealMechTerrainStrings = function(actor){
	var _this = this;
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech.id != -1){
		var result = {};
		Object.keys(_this._terrainStringLookup).forEach(function(id){
			var currentTerrain = _this._terrainStringLookup[id];
			result[currentTerrain] = _this.getMechTerrainString(actor, currentTerrain);
		});
		return result;
	} else {
		return {air: "-", land: "-", water: "-", space: "-"};
	}
}

StatCalc.prototype.getFavPoints = function(actor){
	return actor.SRWStats.pilot.favPoints || 0;
}

StatCalc.prototype.addFavPoints = function(actor, amount){
	if(!actor.SRWStats.pilot.favPoints){
		actor.SRWStats.pilot.favPoints = 0;
	}
	actor.SRWStats.pilot.favPoints+=amount;
	if(actor.SRWStats.pilot.favPoints < 0){
		actor.SRWStats.pilot.favPoints = 0;
	}
	this.storeActorData(actor);
}

StatCalc.prototype.getExp = function(actor){
	return actor.SRWStats.pilot.exp;
}

StatCalc.prototype.addExp = function(actor, amount){	
	var _this = this;	
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
		var oldStats = JSON.parse(JSON.stringify(this.getCalculatedPilotStats(actor)));
		var oldLevel = this.getCurrentLevel(actor);
		actor.SRWStats.pilot.exp+=amount;
		if(actor.SRWStats.pilot.exp > ENGINE_SETTINGS.LEVEL_CAP * 500){
			actor.SRWStats.pilot.exp = ENGINE_SETTINGS.LEVEL_CAP * 500;
		}
		$statCalc.invalidateAbilityCache(actor);
		this.calculateSRWActorStats(actor);
		this.calculateSRWMechStats(actor.SRWStats.mech, true, actor);
		this.getCalculatedPilotStats(actor).currentSP = oldStats.currentSP;
		this.getCalculatedPilotStats(actor).currentMP = oldStats.currentMP;
		var newLevel = this.getCurrentLevel(actor);		
		var newStats;
		var currentAbilities;
		var oldAbilities;
		if(oldLevel != newLevel){
			newStats = JSON.parse(JSON.stringify(this.getCalculatedPilotStats(actor)));
			if(actor.isActor()){
				var actorId = parseInt(actor.actorId());
				var actorProperties = $dataActors[actor.actorId()].meta;	
				var updatedAbilities = this.getPilotAbilityInfo(actorProperties, newLevel);
				currentAbilities = actor.SRWStats.pilot.abilities;
				oldAbilities = JSON.parse(JSON.stringify(currentAbilities));
				Object.keys(updatedAbilities).forEach(function(ability){
					if(currentAbilities[ability]){
						if(currentAbilities[ability].level < updatedAbilities[ability].level){
							currentAbilities[ability].level = updatedAbilities[ability].level;
						}
					} else {
						var currentMaxSlot = _this.getCurrentMaxPilotAbilitySlot(actor);
						currentAbilities[ability] = updatedAbilities[ability];						
						if(currentMaxSlot < (6 - 1)){
							currentAbilities[ability].slot = currentMaxSlot + 1;
						}
					}
				});
				
			}			
		}
		this.storeActorData(actor);		
		return {
			hasLevelled: oldLevel != newLevel,
			oldLevel: oldLevel,
			newLevel: newLevel,
			oldStats: oldStats,
			newStats: newStats,
			oldAbilities: oldAbilities,
			newAbilities: currentAbilities
		};
	} else {
		return false;
	}		
}

StatCalc.prototype.setHP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.currentHP=amount;
		if(mechStats.currentHP > mechStats.maxHP){
			mechStats.currentHP = mechStats.maxHP;
		}
	} 	
}

StatCalc.prototype.recoverHP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.HPBeforeRecovery = mechStats.currentHP;
		mechStats.currentHP+=amount;
		if(mechStats.currentHP > mechStats.maxHP){
			mechStats.currentHP = mechStats.maxHP;
		}
		if(mechStats.currentHP < 1){
			mechStats.currentHP = 1;
		}
	} 	
}

StatCalc.prototype.recoverHPPercent = function(actor, percent){		
	if(this.isActorSRWInitialized(actor)){	
		var mechStats = this.getCalculatedMechStats(actor);
		this.recoverHP(actor, Math.floor(mechStats.maxHP * percent / 100));		
	} 	
}

StatCalc.prototype.applyHPRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			if(_this.isBoarded(actor)){
				_this.recoverHPPercent(actor, 20);	
			} else {
				_this.recoverHPPercent(actor, _this.applyStatModsToValue(actor, 0, ["HP_regen"]));	
				_this.recoverHP(actor, _this.applyStatModsToValue(actor, 0, ["HP_regen_flat"]));			
				_this.recoverHPPercent(actor, _this.getCurrentTerrainMods(actor).hp_regen);	
				_this.recoverHPPercent(actor, ENGINE_SETTINGS.DEFAULT_HP_REGEN || 0);	
			}
		}		
	});
}

StatCalc.prototype.setEN = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.currentEN=amount;
		if(mechStats.currentEN > mechStats.maxEN){
			mechStats.currentEN = mechStats.maxEN;
		}
	} 	
}

StatCalc.prototype.setAllWill = function(type, amount){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		_this.setWill(actor, amount);
	});
	return result;
}

StatCalc.prototype.setAllHPPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var mechStats = _this.getCalculatedMechStats(actor);
		mechStats.currentHP = Math.floor(mechStats.maxHP * percent / 100);	
	});
	return result;
}

StatCalc.prototype.canRecoverHP = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		return mechStats.currentHP < mechStats.maxHP;			
	}
}

StatCalc.prototype.canRecoverSP = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		return pilotStats.currentSP < pilotStats.SP;			
	}
}

StatCalc.prototype.canRecoverMP = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		return pilotStats.currentMP < pilotStats.MP;			
	}
}

StatCalc.prototype.addPP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){	
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
		actor.SRWStats.pilot.PP+=amount;		
		this.storeActorData(actor);
	} 	
}

StatCalc.prototype.subtractPP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor) && !$gameSystem.optionInfinitePP){			
		actor.SRWStats.pilot.PP-=amount;
	} 	
}

StatCalc.prototype.addKill = function(actor, depth){		
	const _this = this;
	if(!depth){
		depth = 0;
	}
	if(depth > 1){
		return;
	}
	if(this.isActorSRWInitialized(actor)){	
		
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
		var wasAce = this.isAce(actor);
		actor.SRWStats.pilot.kills++;
		this.storeActorData(actor);
		var isAce = this.isAce(actor);
		if(wasAce != isAce){
			this.reloadSRWStats(actor);
		}
		
		if(ENGINE_SETTINGS.SCORE_GOES_TO_SUBS){
			var subPilots = this.getSubPilots(actor);
			if(!actor.isSubPilot){
				subPilots.forEach(function(pilotId){
					var subActor = $gameActors.actor(pilotId);
					if(subActor){
						_this.addKill(subActor, depth + 1);		
					}			
				});	
			}
		}
	} 	
}

StatCalc.prototype.getKills = function(actor){		
	if(this.isActorSRWInitialized(actor)){		
		return actor.SRWStats.pilot.kills;
	} else {
		return 0;
	}
}

StatCalc.prototype.isAce = function(actor){
	if(this.isActorSRWInitialized(actor)){		
		return this.getKills(actor) >= (ENGINE_SETTINGS.ACE_REQUIREMENT || 50);
	} else {
		return false;
	}
}

StatCalc.prototype.isFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){	
		if($gameSystem.requiredFUBLevel != null){
			return this.getMinModificationLevel(actor) >= $gameSystem.requiredFUBLevel;
		} else {
			return this.getOverallModificationLevel(actor) >= 100;
		}		
	} else {
		return false;
	}
}

StatCalc.prototype.applySPCost = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentSP-=amount;
		if(pilotStats.currentSP < 0){
			console.log("SP Cost applied while actor had insufficient SP!");
			pilotStats.currentSP = 0;
		}
	} 	
}

StatCalc.prototype.setAllSPPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var pilotStats = _this.getCalculatedPilotStats(actor);
		pilotStats.currentSP = pilotStats.SP * percent / 100;	
	});
	return result;
}

StatCalc.prototype.recoverSP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentSP+=amount;
		if(pilotStats.currentSP > pilotStats.SP){
			pilotStats.currentSP = pilotStats.SP;
		}
	} 	
}

StatCalc.prototype.applyMPCost = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentMP-=amount;
		if(pilotStats.currentMP < 0){
			console.log("MP Cost applied while actor had insufficient MP!");
			pilotStats.currentMP = 0;
		}
	} 	
}

StatCalc.prototype.setAllMPPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var pilotStats = _this.getCalculatedPilotStats(actor);
		pilotStats.currentMP = pilotStats.MP * percent / 100;	
	});
	return result;
}

StatCalc.prototype.recoverMP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentMP+=amount;
		if(pilotStats.currentMP > pilotStats.MP){
			pilotStats.currentMP = pilotStats.MP;
		}
	} 	
}


StatCalc.prototype.recoverMPPercent = function(actor, percent){
	if(this.isActorSRWInitialized(actor)){
		var pilotStats = this.getCalculatedPilotStats(actor);
		this.recoverMP(actor, Math.floor(pilotStats.MP * percent / 100));
	}
}

StatCalc.prototype.applyMPRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){		
		if(actor.isActor() || actor.factionId == factionId || factionId == null){			
			_this.recoverMPPercent(actor, _this.applyStatModsToValue(actor, 0, ["MP_regen"]));	
			_this.recoverMPPercent(actor, ENGINE_SETTINGS.DEFAULT_MP_REGEN || 0);					
		}	
	});
}

StatCalc.prototype.getCurrenEN = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.stats.calculated.currentEN;
	} 		
}

StatCalc.prototype.recoverEN = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.currentEN+=amount;
		if(mechStats.currentEN > mechStats.maxEN){
			mechStats.currentEN = mechStats.maxEN;
		}
		if(mechStats.currentEN < 0){
			mechStats.currentEN = 0;
		}
	} 	
}

StatCalc.prototype.recoverENPercent = function(actor, percent){
	if(this.isActorSRWInitialized(actor)){
		var mechStats = this.getCalculatedMechStats(actor);
		this.recoverEN(actor, Math.floor(mechStats.maxEN * percent / 100));
	}
}

StatCalc.prototype.applyENRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){		
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			if(_this.isBoarded(actor)){
				_this.recoverENPercent(actor, 20);	
			} else {
				_this.recoverENPercent(actor, _this.applyStatModsToValue(actor, 0, ["EN_regen"]));	
				_this.recoverENPercent(actor, _this.getCurrentTerrainMods(actor).en_regen);	
				_this.recoverENPercent(actor, ENGINE_SETTINGS.DEFAULT_EN_REGEN || 0);			
				_this.recoverEN(actor, 5);	
			}	
		}	
	});
}

StatCalc.prototype.setAllENPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var mechStats = _this.getCalculatedMechStats(actor);
		mechStats.currentEN = Math.floor(mechStats.maxEN * percent / 100);	
	});
	return result;
}

StatCalc.prototype.canRecoverEN = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		return mechStats.currentEN < mechStats.maxEN;			
	}
}

StatCalc.prototype.getCurrentAmmo = function(actor, weapon){		
	if(weapon.isEquipable){
		return weapon.totalAmmo + (this.getStageTemp(actor, weapon.tempKey) || 0);
	} else {
		return weapon.currentAmmo;
	}
}

StatCalc.prototype.modifyCurrentAmmo = function(actor, weapon, amount){		
	if(weapon.isEquipable){
		let currentAmmoOffset = (this.getStageTemp(actor, weapon.tempKey) || 0);
		let newAmount = currentAmmoOffset + amount;
		this.setStageTemp(actor, weapon.tempKey, newAmount);	

		if(newAmount > 0){
			this.setStageTemp(actor, weapon.tempKey, 0);	
		}
		
	} else {
		weapon.currentAmmo+=amount;
		if(weapon.currentAmmo > weapon.totalAmmo){
			weapon.currentAmmo = weapon.totalAmmo;
		}
	}
}

StatCalc.prototype.recoverAmmoPercent = function(actor, percent){	
	const _this = this;
	if(this.isActorSRWInitialized(actor)){			
		var weapons = this.getActorMechWeapons(actor);
		weapons.forEach(function(weapon){
			if(weapon.totalAmmo != -1){
				_this.modifyCurrentAmmo(actor, weapon, Math.ceil(weapon.totalAmmo * percent / 100));
			}
		});
	} 	
}

StatCalc.prototype.canRecoverAmmo = function(actor, percent){		
	if(this.isActorSRWInitialized(actor)){			
		var weapons = this.getActorMechWeapons(actor);
		var ctr = 0;
		var hasUsedAmmo = false;
		while(!hasUsedAmmo && ctr < weapons.length){
			var weapon = weapons[ctr++];
			if(weapon.totalAmmo != -1){
				if(weapon.isEquipable){
					let currentAmmoOffset = (this.getStageTemp(actor, weapon.tempKey) || 0);
					hasUsedAmmo = currentAmmoOffset < 0;
				} else {
					hasUsedAmmo = weapon.currentAmmo < weapon.totalAmmo;
				}				
			}			
		}
		return hasUsedAmmo;
	} 	
}

StatCalc.prototype.getRemainingAmmoRatio = function(actor){		
	const _this = this;
	if(this.isActorSRWInitialized(actor)){			
		var weapons = this.getActorMechWeapons(actor);
		var ctr = 0;
		let totalAmmo = 0;
		let currentAmmo = 0;
		while(ctr < weapons.length){
			var weapon = weapons[ctr++];
			if(weapon.totalAmmo != -1){
				totalAmmo+=weapon.totalAmmo;
				currentAmmo+=_this.getCurrentAmmo(actor, weapon);
			}			
		}
		if(totalAmmo > 0){
			return currentAmmo / totalAmmo;
		}		
	} 	
	return 1;
}

StatCalc.prototype.hasHealTargets = function(actor, percent){
	var referenceEvent = this.getReferenceEvent(actor);
	var candidates = this.getAdjacentActors(null, {x: referenceEvent.posX(), y: referenceEvent.posY()});
	if(this.applyStatModsToValue(actor, 0, ["all_range_repair"])){	
		candidates = this.getAllActors();
	}
	var factionId = $gameSystem.getFactionId(actor);
	var result = false;
	var ctr = 0;
	while(ctr < candidates.length && !result){
		if($gameSystem.isFriendly(candidates[ctr], factionId) && this.canRecoverHP(candidates[ctr])){
			result = true;
		}
		ctr++;
	}
	return result;
}

StatCalc.prototype.hasResupplyTargets = function(actor, percent){
	var referenceEvent = this.getReferenceEvent(actor);
	var candidates = this.getAdjacentActors(null, {x: referenceEvent.posX(), y: referenceEvent.posY()});
	if(this.applyStatModsToValue(actor, 0, ["all_range_resupply"])){	
		candidates = this.getAllActors();
	}
	var factionId = $gameSystem.getFactionId(actor);
	var result = false;
	var ctr = 0;
	while(ctr < candidates.length && !result){
		if($gameSystem.isFriendly(candidates[ctr], factionId) && (this.canRecoverEN(candidates[ctr]) || this.canRecoverAmmo(candidates[ctr]))){
			result = true;
		}
		ctr++;
	}
	return result;
}

StatCalc.prototype.applyAmmoRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.recoverAmmoPercent(actor, _this.applyStatModsToValue(actor, 0, ["ammo_regen"]));				
		}	
	});
}

StatCalc.prototype.setSpirit = function(actor, spirit){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeSpirits[spirit] = true;
	} 	
}

StatCalc.prototype.clearSpirit = function(actor, spirit){	
	var _this = this;
	if(_this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeSpirits[spirit] = false;
		if(actor.SRWStats.mech){
			var subPilots = actor.SRWStats.mech.subPilots;
			if(subPilots){
				subPilots.forEach(function(subPilotId){
					var subActor = $gameActors.actor(subPilotId);
					if(_this.isActorSRWInitialized(subActor)){
						subActor.SRWStats.pilot.activeSpirits[spirit] = false;
					}				
				});
			}
		}		
	} 	
}

StatCalc.prototype.clearSpiritOnAll = function(type, spirit, factionId){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.clearSpirit(actor, spirit);
		}								
	});
}

StatCalc.prototype.hasTempEffect = function(actor, type){
	let result = false;
	if(this.isActorSRWInitialized(actor)){	
		var tmp = [];
		actor.SRWStats.pilot.activeEffects.forEach(function(effect){
			if(effect.type == type){
				result = true;
			}
		});
	}
	return result;
}

StatCalc.prototype.getActiveTempEffects = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.activeEffects;
	} else {
		return [];
	}	
}	

StatCalc.prototype.setTempEffect = function(actor, effects){		
	if(this.isActorSRWInitialized(actor)){		
		for(var i = 0; i < effects.length; i++){
			if(!effects[i].phaseCount){
				effects[i].phaseCount = 1;
			}
			actor.SRWStats.pilot.activeEffects.push(effects[i]);
		}
	} 	
}

StatCalc.prototype.clearTempEffects = function(actor){		
	if(this.isActorSRWInitialized(actor)){	
		var tmp = [];
		actor.SRWStats.pilot.activeEffects.forEach(function(effect){
			if(effect.phaseCount == -1){
				tmp.push(effect);
			} else {
				effect.phaseCount--;
				if(effect.phaseCount > 0){
					tmp.push(effect);
				}
			}			
		});
		actor.SRWStats.pilot.activeEffects = tmp;
	} 	
}

StatCalc.prototype.clearTempEffectsOnAll = function(type){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.clearTempEffects(actor, effect);						
	});
}

StatCalc.prototype.resetAllBattleTemp = function(type, factionId){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){
		if(actor.isActor() || actor.factionId == factionId || factionId == null){		
			_this.resetBattleTemp(actor);	
			var subPilots = _this.getSubPilots(actor);
			if(!actor.isSubPilot && actor.isActor()){				
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					if(actor){
						_this.resetBattleTemp(actor);	
					}	
				});	
			}
		}		
	});
}

StatCalc.prototype.hasEndedTurn = function(actor){		
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.battleTemp.hasFinishedTurn;
	} 	
}

StatCalc.prototype.setTurnEnd = function(actor){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.battleTemp.hasFinishedTurn = true;
	} 	
}

StatCalc.prototype.getRealENCost = function(actor, weapon){
	let cost = weapon.ENCost;
	if(this.isActorSRWInitialized(actor)){	
		if(cost != -1){
			cost = this.applyStatModsToValue(actor, cost, ["EN_cost"]);
		}
		const battleTemps = this.enableWeaponAbilityResolution(actor, weapon);
	
		if(this.applyStatModsToValue(actor, 0, ["en_to_power"])){
			cost = -2;
		}
		
		this.restoreBattleTemps(actor, battleTemps);
	} 
	return cost;
}	

StatCalc.prototype.getRealMPCost = function(actor, cost){
	if(this.isActorSRWInitialized(actor)){	
		if(cost != -1){
			cost = this.applyStatModsToValue(actor, cost, ["MP_cost"]);
		}		
	} 
	return cost;
}

StatCalc.prototype.getRealItemSlots = function(actor){	
	if(this.isActorSRWInitialized(actor)){
		var slots = actor.SRWStats.mech.itemSlots;
		slots = this.applyStatModsToValue(actor, slots, ["item_slot"]);
		return Math.min(slots, 4);
	}	
	return 0;
}


StatCalc.prototype.getWeaponRangeStatState = function(actor, attack){
	var result = "";
	if(this.isActorSRWInitialized(actor)){
		var delta = 0;
		if(actor.SRWStats.pilot.activeSpirits.snipe){
			delta+=2;
		}
		delta+=this.applyStatModsToValue(actor, 0, ["range"]);
		var rangeDown = this.isRangeDown(actor);
		if(rangeDown){
			delta-=rangeDown;
		}
		
		if(delta > 0){
			result = "boosted";
		} else if(delta < 0){
			result = "dropped";
		}
	}
	return result;
}

StatCalc.prototype.getRealWeaponRange = function(actor, weapon){		
	if(this.isActorSRWInitialized(actor)){			
		var result = weapon.range;
		if(result == 1){
			result = this.applyStatModsToValue(actor, result, ["rangeOne"]);
			return 1;
		}
		if(actor.SRWStats.pilot.activeSpirits.snipe){
			result+=2;
		}
		result = this.applyStatModsToValue(actor, result, ["range"]);
		var rangeDown = this.isRangeDown(actor);
		if(rangeDown){
			result-=rangeDown;
		}
		if(result < 1){
			result = 1;
		}
		if(weapon.type == "M"){
			if(this.applyStatModsToValue(actor, 0, ["infinite_melee_range"])){
				result = 99;
			}
		}
		if(weapon.type == "R"){
			if(this.applyStatModsToValue(actor, 0, ["infinite_ranged_range"])){
				result = 99;
			}
		}
		return result;
	} else {
		return 0;
	}
}

StatCalc.prototype.getRealWeaponMinRange = function(actor, weapon){		
	if(this.isActorSRWInitialized(actor)){			
		var result = weapon.minRange;
		if(result == 1){
			return 1;
		}		
		var minRangeImprovement =  this.applyStatModsToValue(actor, 0, ["min_range"]);
		result-= minRangeImprovement;
		
		if(result < 1){
			result = 1;
		}
		return result;
	} else {
		return 0;
	}
}

StatCalc.prototype.getPilotAbilityLevel = function(actor, abilityIdx){		
	var _this = this;
	var result = 0;
	if(_this.isActorSRWInitialized(actor)){			
		var abilities = actor.SRWStats.pilot.abilities;
		if(abilities){
			Object.keys(abilities).forEach(function(idx){
				var abilityDef = abilities[idx];
				if(abilityDef.idx == abilityIdx){
					result = abilityDef.level;
				}			
			});	
		}			
	}
	return result;
}

StatCalc.prototype.getActiveAbilityIds = function(actor){		
	var _this = this;
	var result = {};
	if(_this.isActorSRWInitialized(actor)){			
		var abilities = actor.SRWStats.pilot.abilities;		
		abilities.forEach(function(abilityDef){
			if(_this.getCurrentLevel(actor) >= abilityDef.requiredLevel && $pilotAbilityManager.isActive(actor, abilityDef.idx, abilityDef.level)){
				result[abilityDef.idx] = true;
			}			
		});	
	}
	return result;
}

StatCalc.prototype.getConsumables = function(actor){
	var _this = this;
	var result = [];
	if(_this.isActorSRWInitialized(actor)){	
		var items = actor.SRWStats.mech.items;		
		for(var i = 0; i < items.length; i++){
			if(items[i]){			
				if($itemEffectManager.getAbilityDef(items[i].idx).isUnique && !actor.SRWStats.stageTemp.inventoryConsumed[i]){
					result.push({itemIdx: items[i].idx, listIdx: i});
				}
			}
		}
	}	
	return result;
}

StatCalc.prototype.getAIConsumables = function(actor){
	var _this = this;
	var result = [];
	const recoverPriority = {
		HP_recover: 3,
		EN_recover: 2,
		ammo_recover: 1
	};
	const recoverValidators = {
		HP_recover: (actor) => {
			return actor.SRWStats.mech.stats.calculated.currentHP / actor.SRWStats.mech.stats.calculated.maxHP <= 0.5;
		},
		EN_recover: (actor) => {
			return actor.SRWStats.mech.stats.calculated.currentEN / actor.SRWStats.mech.stats.calculated.maxEN <= 0.5;
		},
		ammo_recover: (actor) => {
			return _this.getRemainingAmmoRatio(actor) <= 0.5;
		}
	};
	if(_this.isActorSRWInitialized(actor)){	
		var items = actor.SRWStats.mech.items;		
		for(var i = 0; i < items.length; i++){
			if(items[i]){			
				if($itemEffectManager.getAbilityDef(items[i].idx).isUnique && !actor.SRWStats.stageTemp.inventoryConsumed[i]){
					let recoveredStat;
					let mods = $itemEffectManager.getStatmod(actor, items[i].idx);
					for(let mod of mods){
						if(recoverPriority[mod.type] && (!recoveredStat || recoverPriority[mod.type] > recoverPriority[recoveredStat])){
							recoveredStat = mod.type;
						}
					}
					if(recoverValidators[recoveredStat] && recoverValidators[recoveredStat](actor)){
						result.push({itemIdx: items[i].idx, listIdx: i});
					}
					//
				}
			}
		}
	}	
	return result;
}

StatCalc.prototype.setConsumableUsed = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		actor.SRWStats.stageTemp.inventoryConsumed[idx] = true;
	}	
}

StatCalc.prototype.getAbilityCommands = function(actor){
	var _this = this;
	var result = [];
	if(_this.isActorSRWInitialized(actor)){	
		if(!actor.SRWStats.stageTemp.abilityUsed){
			actor.SRWStats.stageTemp.abilityUsed = {};
		}
		var commands = _this.getModDefinitions(actor, ["ability_command"]);
		commands.forEach(function(commandDef){
			//var abilityDefinition = $abilityCommandManger.getAbilityDef(commandDef.cmdId);
			//var timesUsed = actor.SRWStats.stageTemp.abilityUsed[commandDef.cmdId] || 0;
			//if(abilityDefinition && timesUsed <  $abilityCommandManger.getUseCount(actor, commandDef.cmdId)){
			result.push(commandDef.cmdId);
			//}			
		});
	}	
	return result;
}

StatCalc.prototype.setAbilityUsed = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		if(!actor.SRWStats.stageTemp.abilityUsed){
			actor.SRWStats.stageTemp.abilityUsed = {};
		}
		if(!actor.SRWStats.stageTemp.abilityUsed[idx]){
			actor.SRWStats.stageTemp.abilityUsed[idx] = 1;
		} else {
			actor.SRWStats.stageTemp.abilityUsed[idx]++;
		}
	}	
}

StatCalc.prototype.getUsedCount = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		return actor.SRWStats.stageTemp.abilityUsed[idx] || 0
	}	
	return 0;
}

StatCalc.prototype.isStatModActiveOnAnyActor = function(modType, excludedSkills){
	var _this = this;
	var result = false;
	this.iterateAllActors(null, function(actor, event){			
		if(_this.applyStatModsToValue(actor, 0, modType, excludedSkills)){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.getActiveStatMods = function(actor, actorKey, excludedSkills){
	var _this = this;
	if(!excludedSkills){
		excludedSkills = {};
	}
	var result = {
		mult: [],
		mult_ceil: [],
		addPercent: [],
		addFlat: [],
		list: []
	};
	
	if(!_this._currentActorBeingProcessed[actorKey]){
		_this._currentActorBeingProcessed[actorKey] = {
		
		};
	}
	
	
	
	function accumulateFromAbilityList(abilityList, abilityManager){
		if(abilityList && abilityManager){			
			let ctr = 0;
			abilityList.forEach(function(abilityDef){
				if(abilityDef){
					const sourceId = abilityManager.getIdPrefix()+"_"+abilityDef.idx + "_" + ctr;
					if(!_this._currentActorBeingProcessed[actorKey][sourceId]){						
						_this._currentActorBeingProcessed[actorKey][sourceId] = true;
						
						if((typeof abilityDef.requiredLevel == "undefined" || abilityDef.requiredLevel == 0 || _this.getCurrentLevel(actor) >= abilityDef.requiredLevel) && abilityManager.isActive(actor, abilityDef.idx, abilityDef.level)){
							var statMods = abilityManager.getStatmod(actor, abilityDef.idx, abilityDef.level);
							var targetList;	
							//hack to ensure direct function assignements for consumable items are skipped
							if(Array.isArray(statMods)){				
								statMods.forEach(function(statMod){
									if(statMod.modType == "mult"){
										targetList = result.mult;
									} else if(statMod.modType == "addPercent"){
										targetList = result.addPercent;
									} else if(statMod.modType == "addFlat"){
										targetList = result.addFlat;
									} else if(statMod.modType == "mult_ceil"){
										targetList = result.mult_ceil;
									}
									
									statMod.rangeInfo = abilityManager.getRangeDef(actor, abilityDef.idx, abilityDef.level) || {min: 0, max: 0, targets: "own"};
									
									statMod.stackId = abilityManager.getIdPrefix()+"_"+abilityDef.idx;
									statMod.canStack = abilityManager.canStack(abilityDef.idx);
									
									statMod.sourceId = sourceId;
									
									statMod.appliesTo = abilityDef.appliesTo;
									
									statMod.originType = actor.isActor() ? "actor" : "enemy";
									statMod.originId = actor.SRWStats.pilot.id;
									
									statMod.originLevel = abilityDef.level;
									
									if(targetList){
										targetList.push(statMod);
									}
									var listEntry = JSON.parse(JSON.stringify(statMod));
									if(!listEntry.name){
										listEntry.name = abilityManager.getAbilityDisplayInfo(abilityDef.idx).name;
									}
									
									result.list.push(listEntry);
								});	
							}	
						}							
					}
					ctr++;	
				}
			});	
		}
	}
	
	if(_this.isActorSRWInitialized(actor)){		
		var abilities  = this.getPilotAbilityList(actor);
		if(abilities){
			var tmp = [];
			for(var i = 0; i < abilities.length; i++){
				if(abilities[i] && !$gameSystem.isLockedActorAbility(actor, abilities[i].idx)){
					tmp.push(abilities[i]);
				}
			}
			abilities = tmp;
		}
		accumulateFromAbilityList(abilities, $pilotAbilityManager);
		
		var aceAbility = actor.SRWStats.pilot.aceAbility;	
		if(typeof aceAbility != "undefined" && aceAbility != -1){
			accumulateFromAbilityList([aceAbility], $pilotAbilityManager);	
		}		

		if(!actor.isSubPilot && actor.SRWStats.mech){			
			var abilities = actor.SRWStats.mech.abilities;	
			
			if(abilities){
				var tmp = [];
				for(var i = 0; i < abilities.length; i++){
					if(abilities[i] && !$gameSystem.isLockedMechAbility(actor, abilities[i].idx)){
						tmp.push(abilities[i]);
					}
				}
				abilities = tmp;
			}			
			
			accumulateFromAbilityList(abilities, $mechAbilityManager);
			
			if(ENGINE_SETTINGS.ENABLE_FAV_POINTS){
				if(actor.isActor()){				
					let abilityList = ENGINE_SETTINGS.FAV_POINT_ABILITIES[actor.actorId()] || ENGINE_SETTINGS.FAV_POINT_ABILITIES[-1];
					if(abilityList){
						let pointCount = this.getFavPoints(actor);
						let ctr = 0;
						let favAbilities = [];
						while(ctr < abilityList.length && pointCount >= abilityList[ctr].cost){
							favAbilities.push({
								idx: abilityList[ctr].id,
								level: 0,
								appliesTo: null
							})							
							pointCount-=abilityList[ctr].cost;
							ctr++;
						}
						accumulateFromAbilityList(favAbilities, $pilotAbilityManager);
					}	
				}	
			}
			
			var FUBAbility = actor.SRWStats.mech.fullUpgradeAbility;	
			if(typeof FUBAbility != "undefined" && FUBAbility != -1 && FUBAbility.idx != -1){
				accumulateFromAbilityList([FUBAbility], $mechAbilityManager);	
			}
			
			var genericFullUpgradeAbility = actor.SRWStats.mech.genericFullUpgradeAbility;	
			if(typeof genericFullUpgradeAbility != "undefined" && genericFullUpgradeAbility != -1 && genericFullUpgradeAbility.idx != -1){
				accumulateFromAbilityList([genericFullUpgradeAbility], $mechAbilityManager);	
			}		
			
			var items = actor.SRWStats.mech.items;		
			accumulateFromAbilityList(items, $itemEffectManager);		

			if(actor.SRWStats.battleTemp && actor.SRWStats.battleTemp.currentAttack){
				var effects = actor.SRWStats.battleTemp.currentAttack.effects;
				if(effects){					
					if($gameTemp.currentBattleTarget){
						const isFriendly = $gameSystem.isFriendly(actor, $gameTemp.currentBattleTarget.factionId);
						const tmp = effects.filter(effect => effect.targeting == "all" || (isFriendly && effect.targeting == "ally") || (!isFriendly && effect.targeting == "enemy"));
						accumulateFromAbilityList(tmp, $weaponEffectManager);
					}							
				}
			}	
			
			var relationshipBonuses = this.getActiveRelationshipBonuses(actor);
			if(relationshipBonuses){
				accumulateFromAbilityList(relationshipBonuses, $relationshipBonusManager);	
			}
			
			let directEffects = [];
			directEffects = directEffects.concat(actor.SRWStats.pilot.activeEffects || []);
			
				
			let ctr = 0;
			function processStatMod(statMod, sourceId){
				if(!_this._currentActorBeingProcessed[actorKey][sourceId]){						
					_this._currentActorBeingProcessed[actorKey][sourceId] = true;
					var targetList;	
					if(statMod.modType == "mult"){
						targetList = result.mult;
					} else if(statMod.modType == "addPercent"){
						targetList = result.addPercent;
					} else if(statMod.modType == "addFlat"){
						targetList = result.addFlat;
					} else if(statMod.modType == "mult_ceil"){
						targetList = result.mult_ceil;
					}
					
					statMod.rangeInfo = {min: 0, max: 0, targets: "own"};
					
					statMod.stackId = "active_effect";
					statMod.sourceId = "active_effect_"+(ctr++);
					statMod.canStack = true;
					
					statMod.appliesTo = null;
					
					statMod.originType = actor.isActor() ? "actor" : "enemy";
					statMod.originId = actor.SRWStats.pilot.id;
					
					if(targetList){
						targetList.push(statMod);
					}
					var listEntry = JSON.parse(JSON.stringify(statMod));
					if(!listEntry.name){
						listEntry.name = "Active Effect";
					}
					
					result.list.push(listEntry);	
				}
			}
			
			if(directEffects && directEffects.length){
				let ctr = 0;
				directEffects.forEach(function(statMod){
					processStatMod(statMod, "direct_effect_"+(ctr++));
				});
			}
			
			
			if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM && ENGINE_SETTINGS.ATTRIBUTE_MODS){
				let attributeMods = [];
				let attribute = this.getParticipantAttribute(actor, "attribute1");
				//hacky fix to ability given attribute changes not being available with the getParticipantAttribute call at this point of processing
				let statModAttributes = [];
				for(let statMod of result.list){
					if(statMod.type == "attribute"){
						statModAttributes.push(statMod.attribute);
					}
				}
				if(statModAttributes.length){
					attribute = statModAttributes[0];
				}
				if(ENGINE_SETTINGS.ATTRIBUTE_MODS[attribute]){
					attributeMods =JSON.parse(JSON.stringify(ENGINE_SETTINGS.ATTRIBUTE_MODS[attribute]));
				}
				
				if(attributeMods && attributeMods.length){
					let ctr = 0;
					attributeMods.forEach(function(statMod){
						processStatMod(statMod, "attr_effects_"+(ctr++))
					});
				}
			}

			if(ENGINE_SETTINGS.GLOBAL_UNIT_MOD){
				const statMods = ENGINE_SETTINGS.GLOBAL_UNIT_MOD(actor) || [];
				for(let statMod of statMods){
					processStatMod(statMod);
				}								
			}	
		}
	}
	return result;
}

StatCalc.prototype.externalLockUnitUpdates = function(){
	this._unitUpdatesExternalLocked = true;
}

//_unitUpdatesExternalLocked is a var that disables full ability cache invalidations and application of deploy actions, both operations that may introduce lag when done in bulk
//this is an optimization flag that should only be toggled on in specific cases where units are deployed and it is certain that those bulk operations are not required during that deployment
//currently this flag is set when confirming the manual deploy since all deploy actions were already applied when exiting the deploy menu
StatCalc.prototype.externalUnlockUnitUpdates = function(){
	this._unitUpdatesExternalLocked = false;
}

StatCalc.prototype.lockAbilityCache = function(){
	this._abilityCacheLocked = true;
}

StatCalc.prototype.unlockAbilityCache = function(){
	this._abilityCacheLocked = false;
}

StatCalc.prototype.invalidateAbilityCache = function(actor){
	this._abilityLookupDepth = 0;
	if(actor && actor.isSubPilot){
		return; //a sub pilot should not trigger a partial cache invalidation to prevent issue with reloading a unit
	}
	if(!this._abilityCacheLocked){
		if(actor){
			var event = this.getReferenceEvent(actor);
			if(event){
				this._invalidatedEventIds[event.eventId()] = {actor: actor, hasBeenInvalidated: false};
				event._lastModsPosition = null;
				//this._invalidatedActor = actor;
			}			
		} else if(!this._unitUpdatesExternalLocked){
			console.log("Full cache invalidation");
			this._abilityCacheBuilding = false;
			this._abilityCacheDirty = true;
		}	

		this.invalidateActorAbiTracking(actor);
		if(actor?.subTwin){
			this.invalidateActorAbiTracking(actor.subTwin);
		}
	}	
}

StatCalc.prototype.invalidateActorAbiTracking = function(actor){
	const _this = this;
	if(actor){
		delete _this._currentActorBeingProcessed[_this.createActorAbiCacheTrackingKey(actor)];
		var subPilots = this.getSubPilots(actor);
		if(!actor.isSubPilot && actor.isActor()){				
			var ctr = 0;
			subPilots.forEach(function(pilotId){
				var actor = $gameActors.actor(pilotId);
				if(actor){
					delete _this._currentActorBeingProcessed[_this.createActorAbiCacheTrackingKey(actor)];
				}			
			});	
		}	
	} else {
		this._currentActorBeingProcessed = {};
	}	
}

StatCalc.prototype.createActorAbiCacheTrackingKey = function(actor){
	let key = "";
	if(this.isActorSRWInitialized(actor)){
		
		if(actor.isActor()){
			key = "actor_" + actor.SRWStats.pilot.id;
		} else {
			key = "enemy_" + actor.SRWStats.pilot.id;
		}
		key+="_"+this.getReferenceEventId(actor);
		
		key+="_"+(actor.isSubTwin ? "sub_twin" : "main");
		
	}	
	return key;
}

StatCalc.prototype.createActiveAbilityLookup = function(){
	var _this = this;
	
	
	//_this._currentActorBeingProcessed tracks for each actor which ability source has already been processed during this cache reload
	//this tracking is used to prevent infinite recursion during recursive ability lookups(abilities checking abilities) and to avoid results being computed more than once for a give ability source
	if(!_this._currentActorBeingProcessed){
		_this._currentActorBeingProcessed = {};
	}
	
	if(!$gameTemp.abiLookupDebug){
		$gameTemp.abiLookupDebug = {};
	}
	
	function processActor(actor, eventId, isEnemy, sourceX, sourceY, type, slot){		
		let key = _this.createActorAbiCacheTrackingKey(actor);
			
		if(!$gameTemp.abiLookupDebug[key]){
			$gameTemp.abiLookupDebug[key] = 0;
		}
		
		$gameTemp.abiLookupDebug[key]++;
		
		if(!actor.SRWStats || (actor.SRWStats.stageTemp && actor.SRWStats.stageTemp.isBoarded)){
			return;
		}
		if(!_this._currentActorBeingProcessed[key]){
			_this._currentActorBeingProcessed[key] = {
			
			};
		}
			
		var accumulators = _this.getActiveStatMods(actor, key);
		Object.keys(accumulators).forEach(function(accType){
			var activeAbilities = accumulators[accType];
			activeAbilities.forEach(function(originalEffect){	 							
			
				var rangeInfo = originalEffect.rangeInfo || {min: 0, max: 0, targets: "own"};
				var target;
				if(isEnemy){
					if(rangeInfo.targets == "own"){
						target = "enemy";
					} else {
						target = "ally";
					}
				} else {
					if(rangeInfo.targets == "own"){
						target = "ally";
					} else {
						target = "enemy";
					}
				}
				
				if(rangeInfo.affectsMainPilot){
					if(type == "twin_sub"){
						type = "twin";
					} else {
						type = "main";
					}					
					slot = null;
				}
				
				var types = [];
				types.push(type);
				if(rangeInfo.targetsBothTwins){
					if(type == "main"){
						types.push("twin");
					} else {
						types.push("main");
					}
				}
				
				
				
				types.forEach(function(slotType){			
				
					effect = JSON.parse(JSON.stringify(originalEffect));
					effect.slotType = slotType;
					effect.slot = slot;
					effect.eventId = eventId;
					
					if(rangeInfo.affectsAll){
						rangeInfo.max = 0;
						rangeInfo.min = 0;						
					}
									
					for(var i = 0; i <= rangeInfo.max * 2; i++){
						var x = i - rangeInfo.max;
						for(var j = 0; j <= rangeInfo.max * 2; j++){
							var y = j - rangeInfo.max;
							var distance = Math.abs(x) + Math.abs(y);
							if(distance <= rangeInfo.max && distance >= rangeInfo.min){
								var realX = sourceX + x;
								var realY = sourceY + y;
								
								if(rangeInfo.affectsAll){
									realX = -1;
									realY = -1;
								}
								
								if(!result[realX]){
									result[realX] = {};
								}
								if(!result[realX][realY]){
									result[realX][realY] = {};
								}
								if(!result[realX][realY][target]){
									result[realX][realY][target] = {
										mult: [],
										mult_ceil: [],
										addPercent: [],
										addFlat: [],
										list: []
									};
								}
								/*if(!result[realX][realY][target][accType]){
									result[realX][realY][target][accType] = [];
								}*/
								if(effect.range == null || effect.range == distance){
									result[realX][realY][target][accType].push(effect);
										
									var stackInfo = {};
									var tmp = [];
									
									var effects = result[realX][realY][target][accType];
									effects.forEach(function(effect){
										if(effect.canStack){
											tmp.push(effect);
										} else {
											if(!stackInfo[effect.stackId]){
												stackInfo[effect.stackId] = {};
											}
											if(!stackInfo[effect.stackId][effect.slotType]){
												stackInfo[effect.stackId][effect.slotType] = {};
											}
											if(!stackInfo[effect.stackId][effect.slotType][effect.type]){
												stackInfo[effect.stackId][effect.slotType][effect.type] = effect;
											} else if(stackInfo[effect.stackId][effect.slotType][effect.type].value < effect.value){
												stackInfo[effect.stackId][effect.slotType][effect.type] = effect;
											}
										}	
										if(effect.type == "visible_range"){
											var isValid = false;
											//workaround for crash caused by abilities being refreshed before a unit is fully initialized
											if(isEnemy && actor.enemyId){
												isValid = effect.originId == actor.enemyId();
											} else if(actor.actorId){
												isValid = effect.originId == actor.actorId();
											}
											if(isValid){
												var entityKey = _this.getReferenceEvent(actor).eventId();
				
												if(!auraTiles[entityKey]){
													auraTiles[entityKey] = {};
												}
												if(!auraTiles[entityKey][realX]){
													auraTiles[entityKey][realX] = {};
												}
												if(!auraTiles[entityKey][realX][realY]){
													auraTiles[entityKey][realX][realY] = {};
												}
												auraTiles[entityKey][realX][realY][effect.color] = true;
											}											
										}	
									});
									Object.keys(stackInfo).forEach(function(stackId){
										var slotTypeInfo = stackInfo[stackId];
										Object.keys(slotTypeInfo).forEach(function(slotType){											
											var typeInfo = slotTypeInfo[slotType];
											Object.keys(typeInfo).forEach(function(type){
												tmp.push(stackInfo[stackId][slotType][type]);
											});												
										});																		
									});	

									
									
									result[realX][realY][target][accType] = tmp;
									
									
									
									if(!eventToAffectedTiles[eventId]){
										eventToAffectedTiles[eventId] = {};
									}
									var collectionKey = realX+"_"+realY+"_"+target+"_"+accType;
									if(!eventToAffectedTiles[eventId][collectionKey]){
										eventToAffectedTiles[eventId][collectionKey] = {realX: realX, realY: realY, target: target, accType: accType};//result[realX][realY][target][accType];			
									}								
								}
							}
						}	
					}
					
				});
			});	
		});	
		//delete _this._currentActorBeingProcessed[key];
	}
	
	if(_this._cachedAbilityLookup && !_this._abilityCacheDirty && !Object.keys(_this._invalidatedEventIds).length){
		return _this._cachedAbilityLookup;
	}
	if(this._abilityCacheDirty){
		console.log("recreate full ActiveAbilityLookup");
		
		//only change the ability cache reference the first time this is invoked per full cache invalidation(not when running this for nested ability checks)
		if(!_this._abilityCacheBuilding){
			_this._abilityCacheBuilding = true;
			_this._cachedAbilityLookup = {};
			_this._eventToAffectedTiles = {};
			_this._auraTiles = {};
			_this._globalEffects = {
				enemy: [],
				ally: []
			};
		}
	} else {
		console.log("update partial ActiveAbilityLookup");
	}
	
	if(_this._cachedAbilityLookup == null){
		_this._cachedAbilityLookup = {};
	}
	
	if(_this._eventToAffectedTiles == null){
		_this._eventToAffectedTiles = {};
	}
	
	if(_this._auraTiles == null){
		_this._auraTiles = {};
	}
	
	if(_this._globalEffects == null){
		_this._globalEffects = {
			enemy: [],
			ally: []
		};
	}
	
	
	var result = _this._cachedAbilityLookup;
	var eventToAffectedTiles = _this._eventToAffectedTiles;
	var globalEffects = _this._globalEffects;
	var auraTiles = _this._auraTiles;
	/*
	if(!_this._abilityCacheDirty){
		globalEffects = _this._globalEffects || {
			enemy: [],
			ally: []		
		};
		auraTiles = _this._auraTiles;
	} */
	
	function handleEventActors(actor, event){
		if(actor && event && event.isErased && (!event.isErased() || event.isPendingDeploy) && !actor.isSubPilot){
			var isEnemy = $gameSystem.isEnemy(actor);
			var sourceX = event.posX();
			var sourceY = event.posY();
			var eventId;
					
			var subId;
			if(actor.isSubTwin){
				subId = "twin_sub";
				processActor(actor, event.eventId(), isEnemy, sourceX, sourceY, "twin");		
			} else {
				subId = "main_sub";
				processActor(actor, event.eventId(), isEnemy, sourceX, sourceY, "main");		
			}
			
			var subPilots = _this.getSubPilots(actor);
			if(!actor.isSubPilot && actor.isActor()){				
				var ctr = 0;
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					if(actor){
						processActor(actor, event.eventId(), isEnemy, sourceX, sourceY, subId, ctr++);		
					}			
				});	
			}
		}
	}
	
	var invalidatedEventIds = _this._invalidatedEventIds;
	if(!_this._abilityCacheDirty && Object.keys(invalidatedEventIds).length){
		Object.keys(invalidatedEventIds).forEach(function(eventId){
			//each event id should only be invalidated once in case of recursive ability cache checks
			if(!invalidatedEventIds[eventId].hasBeenInvalidated){
				invalidatedEventIds[eventId].hasBeenInvalidated = true;	
				
				if(_this._eventToAffectedTiles[eventId]){
					var affectedAccumulators = _this._eventToAffectedTiles[eventId];			
					Object.keys(affectedAccumulators).forEach(function(accKey){
						var accumulatorContext = affectedAccumulators[accKey];				
						var tmp = [];
						var list = result[accumulatorContext.realX][accumulatorContext.realY][accumulatorContext.target][accumulatorContext.accType];
						while(list.length){
							var current = list.shift();
							if(current.eventId != eventId){
								tmp.push(current);
							}
						}
						result[accumulatorContext.realX][accumulatorContext.realY][accumulatorContext.target][accumulatorContext.accType] = tmp;
					});
					_this._eventToAffectedTiles[eventId] = null;
				}
				var eventActor = invalidatedEventIds[eventId].actor;
				
				var entityKey;
				const event = _this.getReferenceEvent(eventActor);
				if(event){
					var entityKey = event.eventId();
					delete auraTiles[entityKey];
				}			
							
				handleEventActors(eventActor, event);
				
				if(eventActor.subTwin){
					handleEventActors(eventActor.subTwin, event);
				}
			}			
					
		});		
		
		_this._invalidatedEventIds = {};
	} else {
		//console.log("Rebuilding full ability cache");
		_this.iterateAllActors(null, function(actor, event){			
			handleEventActors(actor, event);
		});
	}	
	
	_this._cachedAbilityLookup = result;
	_this._eventToAffectedTiles = eventToAffectedTiles;
	_this._auraTiles = auraTiles;
	_this._abilityCacheDirty = false;
	_this._abilityLookupDepth--;
	return result;
}

StatCalc.prototype.getMainTwin = function(actor){
	var result;
	var type = actor.isActor() ? "actor" : "enemy";
	var candidates = this.getAllActors(type);
	var ctr = 0;
	while(!result && ctr < candidates.length){
		if(candidates[ctr].subTwin == actor){
			result = candidates[ctr];
		}
		ctr++;
	}
	return result;
}

StatCalc.prototype.invalidateZoneCache = function(){
	this._zoneEffectCache = {};
}

StatCalc.prototype.getActorStatMods = function(actor, excludedSkills){
	const _this = this;
	var abilityLookup = this.createActiveAbilityLookup(excludedSkills);
	var statMods;// = this.getActiveStatMods(actor, excludedSkills);
	
	var event = this.getReferenceEvent(actor);
	/*if(actor.isSubPilot && actor.mainPilot){		
		event = actor.mainPilot.event;
	} else if(actor.isSubTwin){
		event = this.getMainTwin(actor).event;
	} else {
		event = actor.event;
	}*/
	try {
		if(event && abilityLookup && abilityLookup[event.posX()] && abilityLookup[event.posX()][event.posY()]){
			if($gameSystem.isEnemy(actor)){				
				statMods = abilityLookup[event.posX()][event.posY()].enemy;
			} else {
				statMods = abilityLookup[event.posX()][event.posY()].ally;
			}
		}		
	} catch(e){
		
	}
	
	if(!statMods){
		statMods = {
			mult: [],
			mult_ceil: [],
			addPercent: [],
			addFlat: [],
			list: []
		};
	}
	
	try {				
		
		
		var globalMods;
		if(event && abilityLookup && abilityLookup[-1] && abilityLookup[-1][-1]){
			if($gameSystem.isEnemy(actor)){				
				globalMods = abilityLookup[-1][-1].enemy;
			} else {
				globalMods = abilityLookup[-1][-1].ally;
			}
		}	
		if(globalMods){
			var tempMods = {};		
			if(statMods){
				Object.keys(statMods).forEach(function(modType){
					tempMods[modType] = [...statMods[modType]];
				});
			}
			
			Object.keys(globalMods).forEach(function(modType){
				if(!tempMods[modType]){
					tempMods[modType] = [];
				}
				var entries = globalMods[modType];
				entries.forEach(function(entry){
					tempMods[modType].push(entry);
				});
			});
			statMods = tempMods;
		}
		
	} catch(e){
		console.log("Error while processing global mods: "+e.message)
	}
	
	
	let zoneMods;
	
	try {
		if(event && !event.isErased() && $gameSystem.EventToUnit(event.eventId())){	
					
			if(!this._zoneEffectCache){
				this._zoneEffectCache = {};
			}
			
			if(!this._zoneEffectCache[event.posX()] || !this._zoneEffectCache[event.posX()][event.posY()]){	
				var tileMods = {
					mult: [],
					addPercent: [],
					addFlat: [],
					mult_ceil: [],
					list: [],
				};
			
				let activeAbilityZoneInfo = $gameSystem.getActiveAbilityZoneTiles();		
				if(activeAbilityZoneInfo && activeAbilityZoneInfo[event.posX()] && activeAbilityZoneInfo[event.posX()][event.posY()]){
					let unitZoneInfo = activeAbilityZoneInfo[event.posX()][event.posY()];
					if(unitZoneInfo){
						for(let zoneInfo of unitZoneInfo){
							var battlerArray = $gameSystem.EventToUnit(zoneInfo.ownerEventId);
							if(battlerArray){
								let zoneSetter =  battlerArray[1];
								let mods;
								if($gameSystem.isFriendly(actor, $gameSystem.getFactionId(zoneSetter))){
									mods = $abilityZoneManager.getAllyMod(actor, zoneInfo.abilityId, unitZoneInfo.length);
								} else {
									mods = $abilityZoneManager.getEnemyMod(actor, zoneInfo.abilityId, unitZoneInfo.length);
								}
								if(mods){
									for(let statMod of mods){
										var targetList;	
										if(statMod.modType == "mult"){
											targetList = tileMods.mult;
										} else if(statMod.modType == "addPercent"){
											targetList = tileMods.addPercent;
										} else if(statMod.modType == "addFlat"){
											targetList = tileMods.addFlat;
										} else if(statMod.modType == "mult_ceil"){
											targetList = tileMods.mult_ceil;
										}
										
										statMod.rangeInfo = {min: 0, max: 0, targets: "own"};
										
										statMod.stackId = "zone_ability";
										statMod.canStack = true;
										
										statMod.appliesTo = null;
										
										statMod.slotType = "main";
										
										statMod.originType = zoneSetter.isActor() ? "actor" : "enemy";
										statMod.originId = zoneSetter.SRWStats.pilot.id;
										
										if(targetList){
											targetList.push(statMod);
										}
										var listEntry = structuredClone(statMod);
										if(!listEntry.name){
											listEntry.name = "Zone Ability";
										}
										
										tileMods.list.push(listEntry);
									}
								}
														
							}					
						}
					}
				}	
				if(!this._zoneEffectCache[event.posX()]){
					this._zoneEffectCache[event.posX()] = {};
				}
				this._zoneEffectCache[event.posX()][event.posY()] = tileMods;
				
			}
			zoneMods = this._zoneEffectCache[event.posX()][event.posY()];	
		} 
	} catch(e){
		console.log("Error while processing zone mods: "+e.message)
	}

	return {statMods: statMods, zoneMods: zoneMods};
}

StatCalc.prototype.getActorSlotInfo = function(actor){
	var result = {};
	if(actor.isSubPilot){
		var slot;
		if(actor.isActor()){
			slot = this.getSubPilots(actor.mainPilot).indexOf(actor.actorId());
		} else {
			slot = this.getSubPilots(actor.mainPilot).indexOf(actor.enemyId());
		}
		
		if(actor.mainPilot && actor.mainPilot.isSubTwin) {
			result.type = "twin_sub";
		} else {
			result.type = "main_sub";
		}		
		result.slot = slot;
	} else if(actor.isSubTwin) {
		result.type = "twin";
	} else {
		result.type = "main";
	}
	return result;
}

StatCalc.prototype.validateEffectTarget = function(effect, actor){
	var slotInfo = this.getActorSlotInfo(actor);
	var validSlot = true;
	//workaround to prevent ship pilot effects from bleeding onto a unit being deployed from the ship
	if($gameTemp.activeShip && effect.eventId == $gameTemp.activeShip.event.eventId() && actor != $gameTemp.activeShip.actor){
		validSlot = false;
	}
	if(slotInfo.type == effect.slotType){
		if(slotInfo.type == "main_sub" || slotInfo.type == "twin_sub"){
			if(slotInfo.slot != effect.slot){
				validSlot = false;
			}
		}
	} else {
		validSlot = false;
	}
	return validSlot && (effect.appliesTo == null || effect.appliesTo == actor.SRWStats.pilot.id)
}

StatCalc.prototype.getModDefinitions = function(actor, types, excludedSkills){
	const _this = this;
	var result = [];
	
	let typesLookup = {};
	for(let type of types){
		typesLookup[type] = 1;
	}
	
	function appendResults(statMods){
		
		if(statMods){
			for(var i = 0; i < statMods.list.length; i++){
				if(_this.validateEffectTarget(statMods.list[i], actor) && typesLookup[statMods.list[i].type]){
					result.push(statMods.list[i]);
				}		
			}
		}
	}
	
	var statModInfo = this.getActorStatMods(actor, excludedSkills);
	appendResults(statModInfo.statMods);
	appendResults(statModInfo.zoneMods);
		
	return result;
}

StatCalc.prototype.checkInnerAbility = function(actor, value, types, excludedSkills){
	let result = this.applyStatModsToValue(actor, value, types, excludedSkills);
	this.invalidateAbilityCache(actor);
	return result;
}

StatCalc.prototype.applyStatModsToValue = function(actor, value, types, excludedSkills){
	const _this = this;
	
	let typesLookup = {};
	for(let type of types){
		typesLookup[type] = 1;
	}
	
	function appendResults(statMods){
		if(statMods){
			for(var i = 0; i < statMods.addFlat.length; i++){
				if(_this.validateEffectTarget(statMods.addFlat[i], actor) && typesLookup[statMods.addFlat[i].type]){
					value+=statMods.addFlat[i].value*1;
				}		
			}
			for(var i = 0; i < statMods.addPercent.length; i++){
				if(_this.validateEffectTarget(statMods.addPercent[i], actor) && typesLookup[statMods.addPercent[i].type]){
					value+=Math.floor(value * statMods.addPercent[i].value);
				}		
			}
			for(var i = 0; i < statMods.mult.length; i++){
				if(_this.validateEffectTarget(statMods.mult[i], actor) && typesLookup[statMods.mult[i].type]){
					value = Math.floor(value * statMods.mult[i].value);
				}		
			}
			for(var i = 0; i < statMods.mult_ceil.length; i++){
				if(_this.validateEffectTarget(statMods.mult_ceil[i], actor) && typesLookup[statMods.mult_ceil[i].type]){
					value = Math.ceil(value * statMods.mult_ceil[i].value);
				}		
			}
		}		
	}
	var statModInfo = this.getActorStatMods(actor, excludedSkills);
	appendResults(statModInfo.statMods);
	appendResults(statModInfo.zoneMods);
	
	return value;
}

StatCalc.prototype.applyMaxStatModsToValue = function(actor, value, types, excludedSkills){
	const _this = this;
	var max = value;
	
	let typesLookup = {};
	for(let type of types){
		typesLookup[type] = 1;
	}
	
	function appendResults(statMods){
		if(statMods){
			for(var i = 0; i < statMods.addFlat.length; i++){
				if(_this.validateEffectTarget(statMods.addFlat[i], actor) && typesLookup[statMods.addFlat[i].type]){
					if(value + statMods.addFlat[i].value*1 > max){
						max = value + statMods.addFlat[i].value*1;
					}
				}		
			}
			for(var i = 0; i < statMods.addPercent.length; i++){
				if(_this.validateEffectTarget(statMods.addPercent[i], actor) && typesLookup[statMods.addPercent[i].type]){
					if(value + Math.floor(value * statMods.addPercent[i].value) > max){
						max = value + Math.floor(value * statMods.addPercent[i].value);
					}
				}		
			}
			for(var i = 0; i < statMods.mult.length; i++){
				if(_this.validateEffectTarget(statMods.mult[i], actor) && typesLookup[statMods.mult[i].type]){
					if(Math.floor(value * statMods.mult[i].value) > max){
						max = Math.floor(value * statMods.mult[i].value);
					}
				}		
			}
			for(var i = 0; i < statMods.mult_ceil.length; i++){
				if(_this.validateEffectTarget(statMods.mult_ceil[i], actor) && typesLookup[statMods.mult_ceil[i].type]){
					if(Math.ceil(value * statMods.mult_ceil[i].value) > max){
						max = Math.ceil(value * statMods.mult_ceil[i].value);
					}
				}		
			}
		}
	}
	var statModInfo = this.getActorStatMods(actor, excludedSkills);
	appendResults(statModInfo.statMods);
	appendResults(statModInfo.zoneMods);
	
	return max;
}

StatCalc.prototype.getCommanderBonus = function(actor){
	var commanderLookup = this.getCommanderAuraLookup(actor);
	var result = 0;
	if(actor.event){
	    var x = actor.event.posX();
		var y = actor.event.posY();
		if(commanderLookup[x] && commanderLookup[x][y]){
			result = commanderLookup[x][y];
		}
	}
	result = parseInt(result);
	if(isNaN(result)){
		result = 0;
	}
	return result;
}


StatCalc.prototype.getAbilityAura = function(actor){
	var _this = this;
	var result = {};
	if(actor.isSubPilot){
		return result;
	}
	
	if(this._auraTiles){
		var entityKey = _this.getReferenceEvent(actor).eventId();
		
		var lookup = this._auraTiles[entityKey];
		if(lookup){
			Object.keys(lookup).forEach(function(realX){
				Object.keys(lookup[realX]).forEach(function(realY){
					var colors = [];
					Object.keys(lookup[realX][realY]).forEach(function(color){
						colors.push(color);
					});
					if(!result[realX]){
						result[realX] = {};
					}
					
					if(colors.length > 1){
						result[realX][realY] = "#FFFFFF";
					} else {
						result[realX][realY] = colors[0];
					}				
				});
			});			
		}
	}
	
	//var abilityLookup = this.createActiveAbilityLookup();	
	
	
	
	/*var commanderLevel = _this.getPilotAbilityLevel(actor, 44);
	if(commanderLevel > 0 && actor.event){
		var sourceX = actor.event.posX();
		var sourceY = actor.event.posY();
		for(var i = 0; i <= 10; i++){
			var x = i - 5;
			for(var j = 0; j <= 10; j++){
				var y = j - 5;
				var distance = Math.abs(x) + Math.abs(y);
				if(distance <= 5 && distance > 0){
					var realX = sourceX + x;
					var realY = sourceY + y;
					var auraLookup = ENGINE_SETTINGS.COMMANDER_AURA[commanderLevel];
					if(auraLookup){
						var amount = auraLookup[distance-1];
						if(amount){
							if(!result[realX]){
								result[realX] = {};
							}
							if(!result[realX][realY]){
								result[realX][realY] = 0;
							}
							if(amount > result[realX][realY]){
								result[realX][realY] = amount;
							}
						}
					}
				}
			}	
		}
	}*/
	return result;
}

StatCalc.prototype.getCommanderAuraLookup = function(actor){
	var _this = this;
	var result = {};
	var type = $gameSystem.isEnemy(actor);
	
	if(this.isActorSRWInitialized(actor)){
		this.iterateAllActors(null, function(actor, event){			
			if(!event.isErased() && $gameSystem.isEnemy(actor) == type){
				_this.getCommanderAura(actor, event, result);
			}		
		});
	} 
	return result;		
}

StatCalc.prototype.getCurrentVariableSubPilotMechs = function(actorId){
	var _this = this;
	var result = [];
	for(var i = 0; i < $dataClasses.length; i++){
		var mechData = _this.getMechDataById(i, true);
		if(mechData.id != -1 && !mechData.fixedSubPilots){
			if(mechData.subPilots && mechData.subPilots.indexOf(actorId  * 1) != -1){
				result.push(mechData.id);
			}
		}
	}
	return result;
}

StatCalc.prototype.isValidForDeploy = function(actor){
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var deployConditionsMet = true;
		
		var referenceMechId = $gameSystem.getPilotFallbackInfo(actor).classId;
		
		var deployActions = this.getDeployActions(actor.SRWStats.pilot.id, referenceMechId);
		
		if(deployActions && !deployActions.optional){
			Object.keys(deployActions).forEach(function(targetMechId){
				if(targetMechId != "optional"){					
					var actions = deployActions[targetMechId];
					actions.forEach(function(action){
						var targetDef = action.target;
						var sourceDef = action.source;
						if(sourceDef.type == "direct"){
							var sourceId = _this.getSourceId(sourceDef);
						
							if(targetDef.type == "main"){
								var currentPilot = _this.getCurrentPilot(targetMechId, true);
								if(!currentPilot || currentPilot.actorId() != sourceId){
									deployConditionsMet = false;
								}
							} else {
								var mechData = _this.getMechDataById(targetMechId, true);
								if(!mechData || mechData.subPilots[targetDef.slot] != sourceId){
									deployConditionsMet = false;
								}
							}
						} else {
							if(targetDef.type == "main"){
								var currentPilot = _this.getCurrentPilot(targetMechId, true);
								if(!currentPilot || currentPilot == -1){
									deployConditionsMet = false;
								}
							} else {
								var mechData = _this.getMechDataById(targetMechId, true);
								if(!mechData || mechData.subPilots[targetDef.slot] == 0 || mechData.subPilots[targetDef.slot] == -1){
									deployConditionsMet = false;
								}
							}
						}					
					});
				}
			});
		}
		let isUndeployable = referenceMechId < 1 || $dataClasses[referenceMechId].meta.mechNotDeployable * 1 || actor.isSubPilot;
		return deployConditionsMet && !actor.isEmpty && actor.SRWStats.pilot.id != -1 && referenceMechId != -1 && !isUndeployable;
	} else {
		return false;
	}
}

StatCalc.prototype.getDeployActions = function(actorId, mechId){
	var result;
	var mechData = this.getMechData($dataClasses[mechId], true);
	if(mechData && mechData.deployActions){
		result = mechData.deployActions[actorId];
		if(!result){
			result = mechData.deployActions[-1];
		}
	}	
	if(!result){
		return null;
	} else {
		return JSON.parse(JSON.stringify(result));
	}	
}

StatCalc.prototype.hasDeployActions = function(actorId, mechId){
	return this.getDeployActions(actorId, mechId) != null;
}

StatCalc.prototype.getSourceId = function(sourceDef){
	var sourceId = -1;
	if(sourceDef.type == "direct"){
		sourceId = sourceDef.id;
	} else if(sourceDef.type == "main"){
		var donorMech = this.getMechDataById(sourceDef.mech_id, true);
		if(donorMech){
			var pilot =  this.getCurrentPilot(donorMech.id);
			if(pilot){
				sourceId = pilot.SRWStats.pilot.id;
			}
		}
	} else if(sourceDef.type == "sub"){
		var donorMech = this.getMechDataById(sourceDef.mech_id, true);				
		if(donorMech){
			var subPilots = donorMech.subPilots;
			if(subPilots[sourceDef.slot]){
				sourceId = subPilots[sourceDef.slot];												
			}					
		}
	}
	sourceDef.realId = sourceId;
	return sourceId;
}

StatCalc.prototype.unbindLinkedDeploySlots = function(actorId, mechId, type, slot){
	var _this = this;
	this.lockAbilityCache();
	var deployActions = this.getDeployActions(actorId, mechId);
	
	if(deployActions){				
		Object.keys(deployActions).forEach(function(targetMechId){	
			if(targetMechId != "optional"){	
				var actions = deployActions[targetMechId];			
				
				actions.forEach(function(action){		
					_this.getSourceId(action.source);
				});
				
				actions.forEach(function(action){
					var targetDef = action.target;
					var sourceDef = action.source;
					
					var sourceId = sourceDef.realId;
					
					if(sourceId != -1 && targetDef.type == type){
						if(type != "sub" || targetDef.slot == slot){
							var targetPilot = $gameActors.actor(sourceId);	
							if(targetPilot){
								if(sourceDef.type == "main" || sourceDef.type == "direct"){
									targetPilot._classId = 0;
									targetPilot.isSubPilot = false;
									$statCalc.reloadSRWStats(targetPilot, false, true);
								} else if(sourceDef.type == "sub"){
									var previousMechs = $statCalc.getCurrentVariableSubPilotMechs(sourceId);
									previousMechs.forEach(function(previousMechId){		
										var previousMech = $statCalc.getMechData($dataClasses[previousMechId], true);
										if(previousMech && previousMech.id != -1){
											previousMech.subPilots[previousMech.subPilots.indexOf(sourceId * 1)] = 0;
											$statCalc.storeMechData(previousMech);
											
											//ensure the live copy of the unit is also updated
											var currentPilot = $statCalc.getCurrentPilot(previousMech.id);
											if(currentPilot){
												$statCalc.reloadSRWStats(currentPilot, false, true);
											}
										}			
									});	
								} 
							}
						}
						
					}
				});
			}
		});		
		this.reloadSRWStats($gameActors.actor(actorId), false, true);	
		
	}
	
	this.unlockAbilityCache();
	this.invalidateAbilityCache();
}

//if overwriteFallbackInfo is set the stored state for all affected units will be update to the state after the deploy actions are applied
StatCalc.prototype.applyDeployActions = function(actorId, mechId, overwriteFallbackInfo, force){
	var _this = this;
	if(this._unitUpdatesExternalLocked){
		return;
	}
	this.lockAbilityCache();
	var deployActions = this.getDeployActions(actorId, mechId);
	var affectedActors = [];
	
	var result = false;
	
	if(deployActions){
		result = true;
		var lockedPilots = {};
		if(!force){
			var deployInfo = $gameSystem.getDeployInfo();
			
			Object.keys(deployInfo.assigned).forEach(function(slot){
				if(deployInfo.lockedSlots[slot]){
					lockedPilots[$gameActors.actor(deployInfo.assigned[slot]).SRWStats.pilot.id] = true;
				}
			});
		}		
		
		Object.keys(deployActions).forEach(function(targetMechId){
			if(targetMechId != "optional"){			
				var reservedActors = {};
				var actions = deployActions[targetMechId];
				
				actions.forEach(function(action){		
					var sourceId = _this.getSourceId(action.source);
					if(sourceId != 0 && sourceId != -1 && !lockedPilots[sourceId]){
						reservedActors[sourceId] = true;
					}
				});
				
				Object.keys(reservedActors).forEach(function(actorId){
					var previousMechs = $statCalc.getCurrentVariableSubPilotMechs(actorId);
					previousMechs.forEach(function(previousMechId){		
						var previousMech = $statCalc.getMechData($dataClasses[previousMechId], true);
						if(previousMech && previousMech.id != -1){
							previousMech.subPilots[previousMech.subPilots.indexOf(actorId * 1)] = 0;					
							$statCalc.storeMechData(previousMech);
							
							
							//ensure the live copy of the unit is also updated
							var currentPilot = $statCalc.getCurrentPilot(previousMech.id);
							if(currentPilot){
								$statCalc.reloadSRWStats(currentPilot, false, true);
							}
						}	
					});
					
					var actor = $gameActors.actor(actorId);					
					$gameSystem.registerPilotFallbackInfo(actor);	
					
					
					actor._classId = 0;
					$statCalc.reloadSRWStats(actor, false, true);	
				});		
				var targetMech = $statCalc.getMechData($dataClasses[targetMechId], true);
				actions.forEach(function(action){
					var targetDef = action.target;
					var sourceDef = action.source;
					
					var sourceId = sourceDef.realId;
					
					if(sourceId != 0 && sourceId != -1){
						var targetPilot = $gameActors.actor(sourceId);	
						if(!lockedPilots[sourceId]){						
							$gameSystem.registerPilotFallbackInfo(targetPilot);								
							targetPilot._classId = targetMechId;
							
							
							if(targetDef.type == "main"){								
								targetPilot.isSubPilot = false;//set to false for unit reload
								$statCalc.reloadSRWStats(targetPilot, false, true);
								targetPilot.isSubPilot = false;//reaffirm in case the unit reload processed a previous main pilot and set the new main pilot back to sub pilot
							} else {								
								$gameSystem.registerMechFallbackInfo(targetMechId, JSON.parse(JSON.stringify(targetMech.subPilots)));	

								targetMech.subPilots[targetDef.slot] = targetPilot.actorId();							
								$statCalc.storeMechData(targetMech);
								targetPilot.isSubPilot = true;//set to false for unit reinit
								
								//ensure the live copy of the unit is also updated
								var currentPilot = $statCalc.getCurrentPilot(targetMechId);
								if(currentPilot){
									$statCalc.reloadSRWStats(currentPilot, false, true);
								}
								
							}	
							if(overwriteFallbackInfo){
								$gameSystem.overwritePilotFallbackInfo(targetPilot);								
							}	
						}					
					}
				});
				if(overwriteFallbackInfo){
					$gameSystem.overwriteMechFallbackInfo(targetMechId, JSON.parse(JSON.stringify(targetMech.subPilots)));		
				}
			}
		});	
					
		this.reloadSRWStats($gameActors.actor(actorId), false, true);
	} else {
		if(overwriteFallbackInfo){
			$gameSystem.overwritePilotFallbackInfo($gameActors.actor(actorId));	
		} else {
			$gameSystem.registerPilotFallbackInfo($gameActors.actor(actorId));	
		}
	}
	this.unlockAbilityCache();
	this.invalidateAbilityCache();
	return result;
}

StatCalc.prototype.isInCombat = function(actor){
	return $gameTemp.currentBattleActor == actor || $gameTemp.currentBattleEnemy == actor;
}

StatCalc.prototype.getActiveCombatInfo = function(actor){	
	try{
		var initiatorType;
		var target;
		var action;
		if(!$gameTemp.currentTargetingSettings){
			$gameTemp.currentTargetingSettings = {};
		}
		if(actor == $gameTemp.currentBattleActor){
			initiatorType = "actor";
			if($gameTemp.currentTargetingSettings[initiatorType] == "main"){
				target = $gameTemp.currentBattleEnemy;
			}
			if($gameTemp.currentTargetingSettings[initiatorType] == "twin"){
				target = $gameTemp.currentBattleEnemy.subTwin;
			}
			action = $gameTemp.actorAction;
		}
		
		if(actor == $gameTemp.currentBattleEnemy){
			initiatorType = "enemy";
			if($gameTemp.currentTargetingSettings[initiatorType] == "main"){
				target = $gameTemp.currentBattleActor;
			}
			if($gameTemp.currentTargetingSettings[initiatorType] == "twin"){
				target = $gameTemp.currentBattleActor.subTwin;
			}
			action = $gameTemp.enemyAction;
		}
		
		if($gameTemp.currentBattleActor && actor == $gameTemp.currentBattleActor.subTwin){
			initiatorType = "actorTwin";
			if($gameTemp.currentTargetingSettings[initiatorType] == "main"){
				target = $gameTemp.currentBattleEnemy;
			}
			if($gameTemp.currentTargetingSettings[initiatorType] == "twin"){
				target = $gameTemp.currentBattleEnemy.subTwin;
			}
			action = $gameTemp.actorTwinAction;
		}
		
		if($gameTemp.currentBattleEnemy && actor == $gameTemp.currentBattleEnemy.subTwin){
			initiatorType = "enemyTwin";
			if($gameTemp.currentTargetingSettings[initiatorType] == "main"){
				target = $gameTemp.currentBattleActor;
			}
			if($gameTemp.currentTargetingSettings[initiatorType] == "twin"){
				target = $gameTemp.currentBattleActor.subTwin;
			}
			action = $gameTemp.enemyTwinAction;
		}
		return {
			self: actor,
			other: target,
			self_action: action || {}
		}		
	} catch(e){
		console.log("Error while reading battle setup: "+e.message);
	}
	
	return null;
}


StatCalc.prototype.getParticipantAttribute = function(participant, attribute, weaponInfo){
	let result = "";
	if(weaponInfo && ENGINE_SETTINGS.USE_WEAPON_ATTRIBUTE){
		/*const weapAttributeOverrides = $statCalc.getModDefinitions(participant, ["weapon_attribute"]);
		if(weapAttributeOverrides.length){
			result = weapAttributeOverrides[0].attribute;
		} else {*/
			result = weaponInfo[attribute];
		//}	
	}
	
	/*if(!result && attribute == "attribute1"){
		const attributeOverrides = $statCalc.getModDefinitions(participant, ["attribute"]);
		if(attributeOverrides.length){
			result = attributeOverrides[0].attribute;
		}
	}*/
	
	if(!result){
		result = participant.SRWStats.stageTemp[attribute] || "";
	}
	
	if(!result){
		result = participant.SRWStats.pilot[attribute] || "";
	}
	
	if(!result){
		result = participant.SRWStats.mech[attribute] || "";
	}
	return result;
}

StatCalc.prototype.getAttributeInfo = function(actor){
	var result = {
		attribute1: "",
		attribute2: ""
	}
	if(this.isActorSRWInitialized(actor)){	
		result = {
			attribute1: this.getParticipantAttribute(actor, "attribute1").toLowerCase(),
			attribute2: this.getParticipantAttribute(actor, "attribute2").toLowerCase()
		}
	}	
	return result;
}

StatCalc.prototype.getEffectivenessMultiplier = function(attacker, weaponInfo, defender, type){
	function readLookup(lookup, attackerAttr, defenderAttr){
		var result = {damage: 1, hit: 1};
		if(lookup){
			if(lookup[attackerAttr] && lookup[attackerAttr][defenderAttr]){
				result = lookup[attackerAttr][defenderAttr];
							
			}
		}
		if(result.damage == null){
			result.damage = 1;
		}
		if(result.hit == null){
			result.hit = 1;
		}
		return result;
	}
	
	
	let attackerAttr1 = this.getParticipantAttribute(attacker, "attribute1", weaponInfo);
	let defenderAttr1 = this.getParticipantAttribute(defender, "attribute1");
	
	let attr1Mult = readLookup(ENGINE_SETTINGS.EFFECTIVENESS.attribute1, attackerAttr1, defenderAttr1);
	
	let attackerAttr2 = this.getParticipantAttribute(attacker, "attribute2", weaponInfo);
	let defenderAttr2 = this.getParticipantAttribute(defender, "attribute2");
	
	let attr2Mult = readLookup(ENGINE_SETTINGS.EFFECTIVENESS.attribute2, attackerAttr2, defenderAttr2);
	
	let result = attr1Mult[type] * attr2Mult[type];
	
	let forceSEMultiplier = this.applyStatModsToValue(attacker, 0, ["always_se"]);
	if(forceSEMultiplier){
		result = ENGINE_SETTINGS.DEFAULT_SE_MULTIPLIER * forceSEMultiplier;
	}
	
	if(this.applyStatModsToValue(defender, 0, ["ignore_se"])){
		result = 1;
	}
	
	return result;
}

StatCalc.prototype.setAIFlags = function(actor, flags){
	actor.AIFlags = flags;
}

StatCalc.prototype.getAIFlags = function(actor){
	return actor.AIFlags || JSON.parse(JSON.stringify(ENGINE_SETTINGS.DEFAULT_AI_FLAGS));
}

StatCalc.prototype.getTargetScoringFormula = function(actor){
	var result;
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.pilot.targetingFormula){
			return actor.SRWStats.pilot.targetingFormula;
		}
	}
	return result;
}

StatCalc.prototype.setPopUpAnimPlayed = function(actor, id){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.popUpAnimsPlayed[id] = true;
	}
}

StatCalc.prototype.getPopUpAnims = function(actor){
	const _this = this;
	let result = [];
	_this.iterateAllActors(null, function(actor){			
		let mods = _this.getModDefinitions(actor, ["activation_animation"]);
		if(!actor.SRWStats.stageTemp.popUpAnimsPlayed){
			actor.SRWStats.stageTemp.popUpAnimsPlayed = {};
		}	
		for(let animAbility of mods){
			if(!actor.SRWStats.stageTemp.popUpAnimsPlayed[animAbility.stackId]){
				result.push({actor: actor, animId: animAbility.animationId, trackingId: animAbility.stackId});
			}
		}
	});
	return result;
}

