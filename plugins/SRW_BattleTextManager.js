function SRWBattleTextManager(){
	this.initDefinitions();
}


SRWBattleTextManager.prototype.initDefinitions = function(){
	var _this = this;
	_this._textBuilder = new BattleTextBuilder();
	_this._textBuilder.isLoaded().then(function(){
		_this._definitions = _this._textBuilder.getDefinitions().default;	
		_this._eventDefinitions = _this._textBuilder.getDefinitions().event;
	});			
}

SRWBattleTextManager.prototype.getTextBuilder = function(){
	return this._textBuilder;
}

//clearAttackGroupId must be called at the start of an animation by the animation handler
SRWBattleTextManager.prototype.clearAttackGroupId = function(ref, attackId){
	this._currentAttackGroupId = null;
}

//the first time an attack quote is determined after calling clearAttackGroupId a group will be picked that will be used for the remaining attack quotes until clearAttackGroupId is called again
//this is hacky but required since the battle text engine doesn't know which subType of text it is on until it has selected it
SRWBattleTextManager.prototype.selectAttackGroupId = function(options, groupWeights){
	function weighted_random(options) {
		var i;

		var weights = [options[0].weight];

		for (i = 1; i < options.length; i++)
			weights[i] = options[i].weight + weights[i - 1];
		
		var random = Math.random() * weights[weights.length - 1];
		
		for (i = 0; i < weights.length; i++)
			if (weights[i] > random)
				break;
		
		return options[i];
	}
	
	if(this._currentAttackGroupId == null){
		if(options.length){
			let availableGroups = {};
			for(let quote of options){
				const groupId = quote[0].quoteGroup || 0;
				availableGroups[groupId] = true;
			}
			let groups = Object.keys(availableGroups);
			let groupWeightsLookup = {};
			for(let entry of groupWeights){
				groupWeightsLookup[entry.groupId] = entry.weight;
			}
			let weightedOptions = [];
			for(let group of groups){
				if(groupWeightsLookup[group] == null){
					weightedOptions.push({
						item: group,
						weight: 1
					});
				} else {
					weightedOptions.push({
						item: group,
						weight: groupWeightsLookup[group]
					});
				}
			}			
			this._currentAttackGroupId = weighted_random(weightedOptions).item;
		}
	}
	
}

SRWBattleTextManager.prototype.getText = function(target, ref, type, subType, targetInfo, targetIdx, attackId, supportedInfo, noAlias){
	var _this = this;
	var definitions;
	/*if($gameTemp.scriptedBattleDemoId != null){
		if(target == "actor"){
			definitions = _this._eventDefinitions[$gameTemp.scriptedBattleDemoId].actors;
		}
		if(target == "enemy"){
			definitions = _this._eventDefinitions[$gameTemp.scriptedBattleDemoId].enemies;
		}
		if(definitions && definitions[id] && definitions[id][type] && !definitions[id][type][subType]){
			subType = "default";
		}
		if(definitions && definitions[id] && definitions[id][type] && definitions[id][type][subType]){
			var options = definitions[id][type][subType];
			var idx = Math.floor(Math.random() * (options.length));
			return options[idx];
		}
	}*/
	var id = ref.SRWStats.pilot.id;
	var mechId = ref.SRWStats.mech.id;
	var text;
	var eventDef;
	if($gameTemp.scriptedBattleDemoId != null){
		var eventDefs = _this._eventDefinitions;
		var def;
		var ctr = 0;
		while(!def && ctr < eventDefs.length){
			if(eventDefs[ctr].refId == $gameTemp.scriptedBattleDemoId){
				def = eventDefs[ctr].data;
			}
			ctr++;
		}
		if(def){
			eventDef = def;
			text = _this.getTextCandidate(def, target, id, mechId, type, subType, targetInfo, targetIdx, attackId, supportedInfo);
		}		
	}
	var stageTextDef;	
	if($gameSystem.stageTextId != null){
		var eventDefs = _this._eventDefinitions;
		var def;
		var ctr = 0;
		while(!def && ctr < eventDefs.length){
			if(eventDefs[ctr].refId == $gameSystem.stageTextId){
				def = eventDefs[ctr].data;
			}
			ctr++;
		}
		if(!text && def){
			text = _this.getTextCandidate(def, target, id, mechId, type, subType, targetInfo, targetIdx, attackId, supportedInfo);
		}	
		stageTextDef = def;
	}
	
	
	function getAppropriateText(actorOrEnemy, def){
		var result;
		var subTypes = ["target_actor_tag", "target_mech_tag", "target_mech", "mech", "default"];
		subTypes.unshift(actorOrEnemy);
		var ctr = 0;
		while(!result && ctr < subTypes.length){				
			result = _this.getTextCandidate(def, target, id, mechId, type, subTypes[ctr++], targetInfo, targetIdx, attackId, supportedInfo);
		}
		
		return result;
	}
	
	if(!text && eventDef){
		text = getAppropriateText(subType, eventDef);
		/*if(subType == -1){
			text = getAppropriateText();
		} else {
			text = _this.getTextCandidate(_this._definitions, target, id, mechId, type, subType, targetInfo, targetIdx, attackId, supportedInfo);
		}	*/	
	}
	
	if(!text && stageTextDef){
		text = getAppropriateText(subType, stageTextDef);
	}
	
	if(!text){
		text = getAppropriateText(subType, _this._definitions);
	}
	
	if(!text && !noAlias){
		if(ref.SRWStats.pilot.textAlias > 0){
			let actor;
			if(ref.isActor()){
				actor = $gameActors.actor(ref.SRWStats.pilot.textAlias);
			} else {
				actor = new Game_Enemy(ref.SRWStats.pilot.textAlias, 0, 0);
			}
			
			if(!$statCalc.isActorSRWInitialized(actor)){
				$statCalc.initSRWStats(actor);
			}
			text = this.getText(target, actor, type, subType, targetInfo, targetIdx, attackId, supportedInfo, true);
		}		
	}
	
	if(!text){
		var faceName;
		var faceIndex;
		if(ref.isActor()){
			faceName = $dataActors[ref.actorId()].faceName;
			faceIndex = $dataActors[ref.actorId()].faceIndex;
		} else {
			faceName = $dataEnemies[ref.enemyId()].meta.faceName;
			faceIndex = $dataEnemies[ref.enemyId()].meta.faceIndex - 1;
		}
		text = {
			faceName: faceName,
			faceIndex: faceIndex,
			text: "..."
		};
	}
	return text;
}

SRWBattleTextManager.prototype.getTextCandidate = function(definitions, target, id, mechId, type, subType, targetInfo, targetIdx, attackId, supportedInfo){	
	if(typeof subType == "undefined") {
		subType = "default";
	}
	var text = null;
	
	try {
		if(target == "actor"){
			definitions = definitions.actor;
		}
		if(target == "enemy"){
			definitions = definitions.enemy;
		}
		if(definitions){
			definitions = definitions[id][type];		
				
			if(type == "attacks"){
				definitions = definitions[attackId];
			}
			
			if(definitions && definitions[subType]){
				var options;
				options = definitions[subType];
				if(subType != "default"){
					var hasSupportQuote = false;
					if(type == "support_attack"){
						var tmp = [];
						options.forEach(function(option){
							if(option[0].unitId == supportedInfo.id){
								hasSupportQuote = true;
								tmp.push(option);
							}
						});			
						options = tmp;
					} 
					if(!hasSupportQuote){
						var tmp = [];
						options.forEach(function(option){
							if(option[0].unitId == targetInfo.id){
								tmp.push(option);
							}
						});			
						options = tmp;	
					}							
				}
				if(subType == "target_mech"){
					options = definitions.target_mech || [];
					var tmp = [];
					options.forEach(function(option){
						if(option[0].mechId == targetInfo.mechId){
							tmp.push(option);
						}
					});			
					options = tmp;
				}
				
				if(subType == "mech"){
					options = definitions.mech || [];
					var tmp = [];
					options.forEach(function(option){
						if(option[0].mechId == mechId){
							tmp.push(option);
						}
					});			
					options = tmp;
				}
				
				if(subType == "target_mech_tag"){
					options = definitions.target_mech_tag || [];
					var tmp = [];
					var tags = $statCalc.getMechTagsById(targetInfo.mechId);
					options.forEach(function(option){
						if(tags[option[0].tag]){
							tmp.push(option);
						}
					});			
					options = tmp;
				}
				
				if(subType == "target_actor_tag"){
					options = definitions.target_actor_tag || [];
					var tmp = [];
					var tags;
					if(targetInfo.type == "actor"){
						tags = $statCalc.getActorTags(targetInfo.id);
					} else {
						tags = $statCalc.getEnemyTags(targetInfo.id);
					}					
					options.forEach(function(option){
						if(tags[option[0].tag]){
							tmp.push(option);
						}
					});			
					options = tmp;
				}
				
				 
				if(subType == "default"){
					options = definitions.default;
				} 
				
				var tmp = [];
				for(let option of options){
					if(option[0].variable == null || $gameVariables.value(option[0].variable) == option[0].variableValue){
						tmp.push(option);
					}
				}
				options = tmp;
				
				var idx = -1;
				if(type == "attacks"){
					var ctr = 0;
					
					this.selectAttackGroupId(options, definitions["__groupodds"] || []);
					
					let quoteIdOptions = [];
					while(ctr < options.length){
						//HACK: coerce into new format
						if(!Array.isArray(options[ctr])){
							options[ctr] = [options[ctr]];
						}
						//HACK: the lines are assumed to all have the same quote id and the first line's id is used
						if(options[ctr] && options[ctr][0].quoteId == targetIdx){							
							quoteIdOptions.push({
								data: options[ctr][0],
								idx: ctr
							});
						}					
						ctr++;
					}
					
					ctr = 0;
					let defaultIdx = -1;
					while(ctr < quoteIdOptions.length && idx == -1){
						let groupId;
						if(quoteIdOptions[ctr].data.quoteGroup == null){
							groupId = 0;
						} else {
							groupId = quoteIdOptions[ctr].data.quoteGroup;
						}
					
						if(groupId == this._currentAttackGroupId){
							idx = quoteIdOptions[ctr].idx;
						}
						if(groupId == 0){
							defaultIdx = quoteIdOptions[ctr].idx;
						}
						ctr++;	
					}
					
					if(idx == -1 && defaultIdx != -1){
						idx = defaultIdx;
					}
					if(idx == -1 && quoteIdOptions.length){
						idx = 0;
					}						
					
				} else if(targetIdx != null){
					idx = targetIdx;
				} else {
					idx = Math.floor(Math.random() * (options.length));
				}	
				text = options[idx];
			}
		}
	} catch (e){
		
	} 
	return text;
}