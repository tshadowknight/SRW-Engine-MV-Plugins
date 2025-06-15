function SpiritManager(){
	this._spiritDefinitions = [];
	//this.initDefinitions();
	this._targetTypeStrings = {
		self: "Self",
		ally: "Ally",
		enemy: "Enemy",
		ally_all: "All allies",
		enemy_all: "All enemies",
		ally_adjacent: "Adjacent allies"	
	}
}

SpiritManager.prototype.addDefinition = function(idx, name, desc, handler, targetType, enabledHandler, singleTargetEnabledHandler, animInfo, affectsTwinInfo){
	var _this = this;
	
	this._spiritDefinitions[idx] = {
		name: name,
		desc: desc,
		handler: handler,
		targetType: targetType,
		animInfo: animInfo,
		affectsTwinInfo: affectsTwinInfo || false,
	};
	if(enabledHandler){
		this._spiritDefinitions[idx].enabledHandler = enabledHandler;
	} else {
		this._spiritDefinitions[idx].enabledHandler = function(){return true;}
	}
	if(singleTargetEnabledHandler){
		this._spiritDefinitions[idx].singleTargetEnabledHandler = singleTargetEnabledHandler;
	} else {
		this._spiritDefinitions[idx].singleTargetEnabledHandler = function(){return true;}
	}
}

SpiritManager.prototype.getSpiritDisplayInfo = function(idx){
	var spiritDef = this._spiritDefinitions[idx];
	var result = {
		name: "",
		desc: "",
		target: "",
		enabledHandler: function(){return false;},
		animInfo: ""
	};
	if(spiritDef){
		result.name = spiritDef.name;
		result.desc = spiritDef.desc;
		result.target = this._targetTypeStrings[spiritDef.targetType];
		result.enabledHandler = spiritDef.enabledHandler;
		result.animInfo = spiritDef.animInfo;
	}
	return result;
}

SpiritManager.prototype.getSpiritDefinitions = function(idx){
	return this._spiritDefinitions;
}

SpiritManager.prototype.getSpiritDef = function(idx){
	return this._spiritDefinitions[idx];
}

SpiritManager.prototype.initDefinitions = function(){
	$SRWConfig.spirits.call(this);
}

SpiritManager.prototype.performInitialTargeting = function(idx, target, position){
	var spiritDef = this._spiritDefinitions[idx];
	var targets = [];
	if(spiritDef){
		if(spiritDef.targetType == "self"){
			targets.push(target);
		}
		if(spiritDef.targetType == "enemy_all"){
			targets = $statCalc.getAllActors("enemy");
		}
		if(spiritDef.targetType == "ally_all"){
			targets = $statCalc.getAllActors("actor");
		}
		if(spiritDef.targetType == "ally_adjacent"){
			targets = $statCalc.getAdjacentActors("actor", position);
		}
		if(spiritDef.targetType == "enemy_adjacent"){
			targets = $statCalc.getAdjacentActors("enemy", position);
		}
	}
	return {
		type: spiritDef.targetType,
		targets: targets
	}	
}

SpiritManager.prototype.applyEffect = function(idx, caster, targets, cost, additionalCaster){
	var _this = this;
	var spiritDef = _this._spiritDefinitions[idx];
	if(spiritDef){
		$statCalc.applySPCost(caster, cost);	
		if(additionalCaster){
			$statCalc.applySPCost(additionalCaster, cost);
		}
		targets.forEach(function(target){			
			spiritDef.handler(target);			
		});
	}	
}

