function AbilityManager(){
	this._abilityDefinitions = [];
	//this.initDefinitions();	
}

AbilityManager.prototype.addDefinition = function(idx, name, desc, hasLevel, isUnique, statmodHandler, isActiveHandler, cost, maxLevel, isHighlightedHandler, rangeDef, canStack, refId){
	var _this = this;
	if(!rangeDef){
		rangeDef = function(){return {min: 0, max: 0, targets: "own"}};
	}
	if(canStack == null){
		canStack = true;
	}
	if(refId == null){
		refId = idx;
	}
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		hasLevel: hasLevel,
		isUnique: isUnique,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		cost: cost,
		maxLevel: maxLevel,
		rangeDef: rangeDef,
		canStack: canStack,
		refId: refId
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return {}}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}	
	if(isHighlightedHandler){
		this._abilityDefinitions[idx].isHighlightedHandler = isHighlightedHandler;
	} else {
		this._abilityDefinitions[idx].isHighlightedHandler = function(){return false;}
	}	
}

AbilityManager.prototype.setUpgrade = function(baseIdx, upgradeIdx){
	$gameSystem.setAbilityUpgrade(this.getIdPrefix(), baseIdx, upgradeIdx);
}

AbilityManager.prototype.getUpgradeIdx = function(idx){
	var result = idx;
	var upgrades = $gameSystem.getAbilityUpgrades(this.getIdPrefix());
	var sanityCtr = 10;
	while(upgrades[result] && sanityCtr-- > 0){
		result = upgrades[result];
	}
	return result;
}

AbilityManager.prototype.getDefinitions = function(){
	return this._abilityDefinitions;
}

AbilityManager.prototype.getDefinitionCount = function(){
	return this._abilityDefinitions.length;
}

AbilityManager.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[this.getUpgradeIdx(idx)];
	var result = {
		name: "",
		desc: "",
		hasLevel: false,
		isUnique: false,
		isActiveHandler: function(){return false;},
		cost: 0,
		maxLevel: 1
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.hasLevel = abilityDef.hasLevel;
		result.isUnique = abilityDef.isUnique;
		result.isActiveHandler = abilityDef.isActiveHandler;
		result.cost = abilityDef.cost;
		result.maxLevel = abilityDef.maxLevel;
		result.isHighlightedHandler = abilityDef.isHighlightedHandler;
	}
	return result;
}

AbilityManager.prototype.getAbilityDef = function(idx, contextActor){
	var orignalIdx = idx;
	if(!this._abilityDefinitions[this.getUpgradeIdx(idx)]){
		var msg = "An ability is assigned that does not exist:<br>ability type = '"+this.getIdPrefix()+"', ability original idx = '"+orignalIdx+"', ability upgraded idx = '"+this.getUpgradeIdx(idx)+"'";
		if(contextActor){
			msg+="<br>for unit: "
			if(contextActor.isActor()){
				msg+="actor pilot = '"+contextActor.actorId()+"',";
			} else {
				msg+="enemy pilot = '"+contextActor.enemyId()+"',"; 
			}
			msg+=" mech = '"+contextActor.SRWStats.mech.id+"'";
		}
		/*if(isNaN(idx)){
			msg+="<br><font color=red>You likely have an ability entry with a defined level or learn level without a selected ability!</font>"
		}*/
		throw msg;
	}
	return this._abilityDefinitions[this.getUpgradeIdx(idx)];
}

AbilityManager.prototype.isActive = function(actor, idx, level){
	return this.getAbilityDef(this.getUpgradeIdx(idx), actor).isActiveHandler(actor, level);
}

AbilityManager.prototype.getStatmod = function(actor, idx, level){
	return this.getAbilityDef(this.getUpgradeIdx(idx), actor).statmodHandler(actor, level);
}

AbilityManager.prototype.getRangeDef = function(actor, idx, level){
	return this.getAbilityDef(this.getUpgradeIdx(idx), actor).rangeDef(actor, level);
}

AbilityManager.prototype.canStack = function(idx){
	return this.getAbilityDef(this.getUpgradeIdx(idx)).canStack;
}

AbilityManager.prototype.getIdPrefix = function(idx){
	throw("Must be implemented by sub class!");
}

function PilotAbilityManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

PilotAbilityManager.prototype = Object.create(AbilityManager.prototype);
PilotAbilityManager.prototype.constructor = PilotAbilityManager;

PilotAbilityManager.prototype.initDefinitions = function(){
	$SRWConfig.pilotAbilties.call(this);
}

PilotAbilityManager.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[this.getUpgradeIdx(idx)];
	var result = {
		name: "",
		desc: "",
		hasLevel: false,
		isUnique: false,
		isActiveHandler: function(){return false;},
		cost: 0,
		maxLevel: 1
	};
	let isUnique = $gameSystem.getPilotAbilityUniqueOverrideValue(idx);
	if(isUnique == null){
		isUnique = abilityDef.isUnique;
	}
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.hasLevel = abilityDef.hasLevel;
		result.isUnique = isUnique;
		result.isActiveHandler = abilityDef.isActiveHandler;
		result.cost = abilityDef.cost;
		result.maxLevel = abilityDef.maxLevel;
		result.isHighlightedHandler = abilityDef.isHighlightedHandler;
	}
	return result;
}

PilotAbilityManager.prototype.getIdPrefix = function(idx){
	return "pilot";
}

function MechAbilityManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

MechAbilityManager.prototype = Object.create(AbilityManager.prototype);
MechAbilityManager.prototype.constructor = MechAbilityManager;

MechAbilityManager.prototype.getIdPrefix = function(idx){
	return "mech";
}

MechAbilityManager.prototype.addDefinition = function(idx, name, desc, hasLevel, isUnique, statmodHandler, isActiveHandler, isHighlightedHandler, rangeDef, canStack){
	var _this = this;
	if(!rangeDef){
		rangeDef = function(){return {min: 0, max: 0, targets: "own"}};
	}
	if(canStack == null){
		canStack = true;
	}
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		hasLevel: hasLevel,
		isUnique: isUnique,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		rangeDef: rangeDef,
		canStack: canStack
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return {}}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}	
	if(isHighlightedHandler){
		this._abilityDefinitions[idx].isHighlightedHandler = isHighlightedHandler;
	} else {
		this._abilityDefinitions[idx].isHighlightedHandler = function(){return false;}
	}	
}

MechAbilityManager.prototype.initDefinitions = function(){
	$SRWConfig.mechAbilties.call(this);
}

//isunique flag is used to indicate a consumable
function ItemEffectManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

ItemEffectManager.prototype = Object.create(AbilityManager.prototype);
ItemEffectManager.prototype.constructor = ItemEffectManager;

ItemEffectManager.prototype.addDefinition = function(idx, name, desc, hasLevel, isUnique, statmodHandler, isActiveHandler, consumableAnim, worth){
	var _this = this;

	var rangeDef = function(){return {min: 0, max: 0, targets: "own"}};
	
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		hasLevel: hasLevel,
		isUnique: isUnique,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		consumableAnim: consumableAnim,
		rangeDef: rangeDef,
		canStack: true,
		worth: worth || 500
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return {}}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}	
}

ItemEffectManager.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[this.getUpgradeIdx(idx)];
	var result = {
		name: "",
		desc: "",
		hasLevel: false,
		isUnique: false,
		isActiveHandler: function(){return false;},
		cost: 0,
		maxLevel: 1,
		worth: 500
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.hasLevel = abilityDef.hasLevel;
		result.isUnique = abilityDef.isUnique;
		result.isActiveHandler = abilityDef.isActiveHandler;
		result.cost = abilityDef.cost;
		result.maxLevel = abilityDef.maxLevel;
		result.isHighlightedHandler = abilityDef.isHighlightedHandler;
		result.worth = abilityDef.worth;
	}
	return result;
}

ItemEffectManager.prototype.getIdPrefix = function(idx){
	return "item";
}

ItemEffectManager.prototype.applyConsumable = function(actor, itemIdx, handler){
	
	
	var effectHandlers = {
		"HP_recover": function(value){
			var stats = $statCalc.getCalculatedMechStats(actor);
			var oldHP = stats.currentHP;
			$statCalc.recoverHPPercent(actor, value);
			return {startAmount: oldHP, endAmount: $statCalc.getCalculatedMechStats(actor).currentHP, maxAmount: stats.maxHP};
		},
		"MP_recover": function(value){
			var stats = $statCalc.getCalculatedPilotStats(actor);
			var oldVal = stats.currentMP;
			$statCalc.recoverMPPercent(actor, value);
			return {startAmount: oldVal, endAmount: $statCalc.getCalculatedPilotStats(actor).currentMP, maxAmount: stats.MP};
		},
		"EN_recover": function(value){
			var stats = $statCalc.getCalculatedMechStats(actor);
			var oldVal = stats.currentEN;
			$statCalc.recoverENPercent(actor, value);
			return {startAmount: oldVal, endAmount: $statCalc.getCalculatedMechStats(actor).currentEN, maxAmount: stats.maxEN};
		},
		"ammo_recover": function(value){
			$statCalc.recoverAmmoPercent(actor, value);
			return {};
		}
		,
		"SP_recover": function(value){
			var stats = $statCalc.getCalculatedPilotStats(actor);
			var oldVal = stats.currentSP;
			$statCalc.recoverSP(actor, value);
			return {startAmount: oldVal, endAmount: $statCalc.getCalculatedPilotStats(actor).currentSP, maxAmount: stats.SP};
		},
		"miracle": function(value){
			$statCalc.modifyWill(actor, 40);
			$statCalc.setSpirit(actor, "accel");
			$statCalc.setSpirit(actor, "strike");
			$statCalc.setSpirit(actor, "alert");
			$statCalc.setSpirit(actor, "valor");
			$statCalc.setSpirit(actor, "spirit");
			$statCalc.setSpirit(actor, "gain");
			$statCalc.setSpirit(actor, "fortune");
			$statCalc.setSpirit(actor, "soul");
			$statCalc.setSpirit(actor, "zeal");
			$statCalc.setSpirit(actor, "persist");
			$statCalc.setSpirit(actor, "wall");
			$statCalc.setSpirit(actor, "focus");
			$statCalc.setSpirit(actor, "snipe");
			$statCalc.setSpirit(actor, "charge");
			return {};
		},
		"victory_turn": function(value){
			$statCalc.setTempEffect(actor, [{type: "final_damage", modType: "mult", value: 1.3, phaseCount: 2}, {type: "final_defend", modType: "addFlat", value: 0.7, phaseCount: 2}]);
			return {};
		}
	};
	var effects = this.getAbilityDef(itemIdx).statmodHandler();	
	var animInfo;
	if(typeof effects == "function"){
		effects(actor);
		animInfo = {
			type: "generic"
		};
		
	} else {
		effects.forEach(function(effect){		
			if(effectHandlers[effect.type]){
				animInfo = effectHandlers[effect.type](effect.value);			
			}		
		});	
	}
	
	
	if(animInfo){
		var consumableAnim = this.getAbilityDef(itemIdx).consumableAnim;
		if(consumableAnim.type != "repair"){
			animInfo.startAmount = 0;
			animInfo.endAmount = 0;
			animInfo.maxAmount = 0;
		}
		
		var anim = {type: "repair", parameters: {animId: consumableAnim.animId, target: actor, startAmount: animInfo.startAmount || 0, endAmount: animInfo.endAmount || 0, total: animInfo.maxAmount || 0}};

		$gameTemp.queuedActorEffects = [anim];	
		$gameTemp.spiritTargetActor	= actor;
		$gameSystem.setSubBattlePhase('spirit_activation');	
		$gameTemp.pushMenu = "spirit_activation";	
		$gameTemp.spiritWindowDoneHandler = handler || function(){
			$gameTemp.spiritWindowDoneHandler = null;
			$gameTemp.popMenu = true;
			$gameSystem.setSubBattlePhase('normal');	
		}
	} 
}

ItemEffectManager.prototype.initDefinitions = function(){
	$SRWConfig.itemEffects.call(this);
}

function WeaponEffectManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

WeaponEffectManager.prototype = Object.create(AbilityManager.prototype);
WeaponEffectManager.prototype.constructor = WeaponEffectManager;

WeaponEffectManager.prototype.getIdPrefix = function(idx){
	return "weapon";
}

WeaponEffectManager.prototype.initDefinitions = function(){
	$SRWConfig.weaponEffects.call(this);
}

function AbilityCommandManger(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

AbilityCommandManger.prototype = Object.create(AbilityManager.prototype);
AbilityCommandManger.prototype.constructor = AbilityCommandManger;

AbilityCommandManger.prototype.initDefinitions = function(){
	$SRWConfig.abilityCommands.call(this);
}

AbilityCommandManger.prototype.getIdPrefix = function(idx){
	return "command";
}


AbilityCommandManger.prototype.getUseInfo = function(actor, idx){
	var def = this._abilityDefinitions[this.getUpgradeIdx(idx)];
	if(typeof def.useCount == "function"){
		return def.useCount(actor);
	} else {
		return def.useCount;
	}
}

AbilityCommandManger.prototype.addDefinition = function(idx, name, desc, useCount, statmodHandler, isActiveHandler, animId){
	var _this = this;
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		useCount: useCount,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		animId: animId,
		rangeDef: function(){return {min: 0, max: 0, targets: "own"}},
		canStack: false
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return []}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}
}

AbilityCommandManger.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[idx];
	var result = {
		name: "",
		desc: "",
		useCount: 0,
		isActiveHandler: function(){return false;},
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.useCount = abilityDef.useCount;
		result.isActiveHandler = abilityDef.isActiveHandler;
	}
	return result;
}

function RelationshipBonusManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

RelationshipBonusManager.prototype = Object.create(AbilityManager.prototype);
RelationshipBonusManager.prototype.constructor = RelationshipBonusManager;

RelationshipBonusManager.prototype.getIdPrefix = function(idx){
	return "relation";
}

RelationshipBonusManager.prototype.initDefinitions = function(){
	$SRWConfig.relationShipbonuses.call(this);
}

RelationshipBonusManager.prototype.addDefinition = function(idx, name, desc, statmodHandler){
	var _this = this;
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		statmodHandler: statmodHandler,
		isActiveHandler: function(){return true;},
		rangeDef: function(){return {min: 1, max: 1, targets: "own"}},
		canStack: true
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return []}
	}
}

function AbilityZoneManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}


AbilityZoneManager.prototype = Object.create(AbilityManager.prototype);
AbilityZoneManager.prototype.constructor = AbilityZoneManager;

AbilityZoneManager.prototype.getIdPrefix = function(idx){
	return "zone";
}

AbilityZoneManager.prototype.initDefinitions = function(){
	$SRWConfig.abilityZones.call(this);
}

AbilityZoneManager.prototype.addDefinition = function(idx, name, desc, upgradeCount, allyHandler, enemyHandler){
	var _this = this;
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		allyHandler: allyHandler || function(){return []}, 
		isActiveHandler: function(){return true;},
		rangeDef: function(){return {min: 1, max: 1, targets: "own"}},
		upgradeCount: upgradeCount || 1,
		enemyHandler: enemyHandler || function(){return []}, 
	};
}

AbilityZoneManager.prototype.getAllyMod = function(actor, idx, stackCount){
	return this.getAbilityDef(this.getUpgradeIdx(idx), actor).allyHandler(actor, stackCount);
}

AbilityZoneManager.prototype.getEnemyMod = function(actor, idx, stackCount){
	return this.getAbilityDef(this.getUpgradeIdx(idx), actor).enemyHandler(actor, stackCount);
}

AbilityZoneManager.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[this.getUpgradeIdx(idx)];
	var result = {
		name: "",
		desc: function(){return "";},
		upgradeCount: 1,
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.upgradeCount = abilityDef.upgradeCount;
	}
	return result;
}