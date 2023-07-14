function TerrainTypeManager(){
	this._tileToTerrainType = {};
	//this.initDefinitions();	
}

TerrainTypeManager.prototype.initDefinitions = function(){
	$SRWConfig.terrainTypes.call(this);
}

TerrainTypeManager.prototype.addDefinition = function(tileAssociation, alias, abilityName, moveCost, hideBattleShadows, entryRules, entryForbiddenRules, superStateRules, opacityMod, displaysFlying, ignoresTerrainCost, ignoresTerrainCollision, moveCostMod, priority, supersedingPriority, canBeTargeted, canAttack, regionBlackList){
	this._tileToTerrainType[tileAssociation] = {
		tileAssociation: tileAssociation,
		alias: alias,
		abilityName: abilityName,
		moveCost: moveCost, 
		hideBattleShadows: hideBattleShadows,
		entryRules: entryRules,
		entryForbiddenRules: entryForbiddenRules, 
		superStateRules: superStateRules,
		opacityMod: opacityMod,
		displaysFlying: displaysFlying,
		ignoresTerrainCost: ignoresTerrainCost,
		ignoresTerrainCollision: ignoresTerrainCollision,
		moveCostMod: moveCostMod,
		priority: priority,
		supersedingPriority: supersedingPriority,
		canBeTargeted: canBeTargeted,
		canAttack: canAttack,
		regionBlackList: regionBlackList,
	};
}

TerrainTypeManager.prototype.getTerrainDefinition = function(terrain){
	return this._tileToTerrainType[terrain] || {
		tileAssociation: -1,
		alias: null,
		abilityName: "",
		moveCost: 0,
		hideBattleShadows: false,
		entryRules: [],
		entryForbiddenRules: [],
		superStateRules: [],
		opacityMod: 0,
		displaysFlying: false,
		ignoresTerrainCost: false,
		ignoresTerrainCollision: false,
		moveCostMod: 1,
		priority: 0,
		supersedingPriority: 0,
		canBeTargeted: true,
		canAttack: true,
		regionBlackList: [],
	};
}

TerrainTypeManager.prototype.getDefinitions = function(terrain){
	return this._tileToTerrainType;
}