function BattleAnimationBuilder(){	
	var _this = this;
	_this._isLoaded = new Promise(function(resolve, reject){
		_this._resolveLoad = resolve;
	});
	this.loadDefinitions(
		"active", 
		function(data){
			_this.processDefinitions(data)
		}, function(){
			_this.loadDefinitions(
				"default",
				function(data){
					_this.processDefinitions(data)
				}
			)	
		}
	);
	this._fileHelper = new FileHelper("attack_animation");
}

BattleAnimationBuilder.prototype.loadDefinitions = function(type, onload, onerror){
	var xhr = new XMLHttpRequest();
    var url = 'data/BattleAnimations.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            onload(JSON.parse(xhr.responseText));            
        }
    };
    xhr.onerror = onerror;
    window[name] = null;
    xhr.send();
}

BattleAnimationBuilder.prototype.getEasingFunctions = function(){
	return {
		"sine": "SineEase",		
		"circle": "CircleEase",
		"back": "BackEase",
		"bounce": "BounceEase",
		"cubic": "CubicEase",
		"elastic": "ElasticEase",
		"exponential": "ExponentialEase",
		"power": "PowerEase",
		"quadratic": "QuadraticEase",
		"quartic": "QuarticEase",
		"quintic": "QuinticEase"
	};
}

BattleAnimationBuilder.prototype.getDefinitions = function(){
	return this._animLookup;
}

BattleAnimationBuilder.prototype.isLoaded = function(){
	return this._isLoaded;
}

BattleAnimationBuilder.prototype.save = function(id){
	var fs = require('fs');
	fs.writeFileSync('data/BattleAnimations.json', JSON.stringify(this._animLookup));
}

BattleAnimationBuilder.prototype.saveBackup = function(id){
	var fs = require('fs');
	if(this._animLookup && Object.keys(this._animLookup).length){
		fs.writeFileSync('data/BattleAnimations.json.bak', JSON.stringify(this._animLookup));
	}
}

BattleAnimationBuilder.prototype.newDef = function(name){
	var newId = Math.max(...Object.keys(this._animLookup)) + 1;
	this._animLookup[newId] = {
		name: name,
		data: {
			mainAnimation: {},
			onHit: {},
			onHitTwin: {},
			onHitOverwrite: {},
			onMiss: {},
			onMissTwin: {},
			onMissOverwrite: {},
			onDestroy: {},
			onDestroyTwin: {},
			onDestroyOverwrite: {},
			onNoDestroy: {},
			onNoDestroyOverwrite: {},
			onNoDestroyTwin: {}
		}		
	};
	//this.save();
	return newId;
}

BattleAnimationBuilder.prototype.copyDef = function(id){
	var newId = Math.max(...Object.keys(this._animLookup)) + 1;
	this._animLookup[newId] = JSON.parse(JSON.stringify(this._animLookup[id]));
	//this.save();
	return newId;
}

BattleAnimationBuilder.prototype.deleteDef = function(id){
	delete this._animLookup[id];
	//this.save();
}

BattleAnimationBuilder.prototype.updateName = function(id, value){
	this._animLookup[id].name = value;
	//this.save();
}

BattleAnimationBuilder.prototype.isUsedTick = function(id, sequence, tick){
	var def = this._animLookup[id].data[sequence];	
	if(def[tick] && def[tick].length){
		return true;
	}
	return false;
}

BattleAnimationBuilder.prototype.newTick = function(id, sequence, tick){
	var def = this._animLookup[id].data[sequence];	
	def[tick] = [];
}

BattleAnimationBuilder.prototype.pasteTick = function(id, sequence, tick, tickData){
	var def = this._animLookup[id].data[sequence];	
	def[tick] = JSON.parse(JSON.stringify(tickData));
}

BattleAnimationBuilder.prototype.deleteTick = function(id, sequence, tick){
	var def = this._animLookup[id].data[sequence];	
	delete def[tick];
}

BattleAnimationBuilder.prototype.shiftTicks = function(id, sequence, startTick, amount){
	var def = this._animLookup[id].data[sequence];	
	var tmp = {}
	Object.keys(def).forEach(function(tick){
		var newTick;
		if(tick * 1 >= startTick * 1){
			newTick = tick * 1 + amount * 1;
			if(tmp[newTick] != null){
				throw("Shifting would result in a collision between existing and shifted ticks!\nThe Shift operation was cancelled!");
			}			
		} else {
			newTick = tick;
		}
		if(newTick < 0){
			throw("A tick went below 0!\nThe Shift operation was cancelled!");
		}
		
		tmp[newTick] = def[tick];
	});
	this._animLookup[id].data[sequence] = tmp;
}

BattleAnimationBuilder.prototype.addCommand = function(id, sequence, tick, command){
	var def = this._animLookup[id].data[sequence];	
	if(command){
		def[tick].unshift(JSON.parse(JSON.stringify(command)));
	} else {
		def[tick].unshift({
			type: "clear_attack_text",
			target: "",
			params: {}
		});
	}	
}

BattleAnimationBuilder.prototype.addInnerCommand = function(id, sequence, tick, idx, type, command){
	var def = this._animLookup[id].data[sequence];
	var params = def[tick][idx].params;
	if(!params[type]){
		params[type] = [];
	}
	if(command){
		params[type].unshift(JSON.parse(JSON.stringify(command)));
	} else {
		params[type].unshift({
			type: "clear_attack_text",
			target: "",
			params: {}
		});
	}	
}

BattleAnimationBuilder.prototype.getTickCopy = function(id, sequence, tick){
	var def = this._animLookup[id].data[sequence];	
	return JSON.parse(JSON.stringify(def[tick]));
}

BattleAnimationBuilder.prototype.getCommandCopy = function(id, sequence, tick, cmdIdx){
	var def = this._animLookup[id].data[sequence];	
	return JSON.parse(JSON.stringify(def[tick][cmdIdx]));
}

BattleAnimationBuilder.prototype.getInnerCommandCopy = function(id, sequence, tick, idx, type, innerIdx){
	var def = this._animLookup[id].data[sequence];	
	var params = def[tick][idx].params;
	if(!params[type]){
		params[type] = [];
	}
	return JSON.parse(JSON.stringify(params[type][innerIdx]));
}

BattleAnimationBuilder.prototype.changeCommand = function(id, sequence, tick, cmdIdx, cmdId){
	var def = this._animLookup[id].data[sequence];	
	def[tick][cmdIdx] = {
		type: cmdId,
		target: "",
		params: {}
	};
}

BattleAnimationBuilder.prototype.changeInnerCommand = function(id, sequence, tick, idx, type, innerIdx, cmdId){
	var def = this._animLookup[id].data[sequence];
	var params = def[tick][idx].params;
	if(!params[type]){
		params[type] = [];
	}
	params[type][innerIdx] = {
		type: cmdId,
		target: "",
		params: {}
	};
}

BattleAnimationBuilder.prototype.changeCommandTarget = function(id, sequence, tick, cmdIdx, target){
	var def = this._animLookup[id].data[sequence];	
	def[tick][cmdIdx].target = target;
}

BattleAnimationBuilder.prototype.changeInnerCommandTarget = function(id, sequence, tick, idx, type, innerIdx, target){
	var def = this._animLookup[id].data[sequence];
	var params = def[tick][idx].params;
	if(!params[type]){
		params[type] = [];
	}
	params[type][innerIdx].target = target;
}

BattleAnimationBuilder.prototype.deleteCommand = function(id, sequence, tick, idx){
	var def = this._animLookup[id].data[sequence];	
	def[tick].splice(idx, 1);
}

BattleAnimationBuilder.prototype.deleteInnerCommand = function(id, sequence, tick, idx, type, innerIdx){
	var def = this._animLookup[id].data[sequence];	
	def[tick][idx].params[type].splice(innerIdx, 1);
}

BattleAnimationBuilder.prototype.moveCommand = function(id, sequence, tick, idx, direction){
	var def = this._animLookup[id].data[sequence];	
	idx = idx * 1;
	var commands = def[tick];
	if(commands.length > 1){
		if(direction == "up"){
			if(idx != 0){
				var tmp = commands[idx-1];
				commands[idx-1] = commands[idx];
				commands[idx] = tmp;
			}
		} else {
			if(idx != commands.length - 1){
				var tmp = commands[idx+1];
				commands[idx+1] = commands[idx];
				commands[idx] = tmp;
			}
		}
	}
}

BattleAnimationBuilder.prototype.moveInnerCommand = function(id, sequence, tick, idx, type, innerIdx, direction){
	var def = this._animLookup[id].data[sequence];	
	idx = idx * 1;
	innerIdx = innerIdx * 1;
	var commands = def[tick][idx].params[type];
	if(commands.length > 1){
		if(direction == "up"){
			if(innerIdx != 0){
				var tmp = commands[innerIdx-1];
				commands[innerIdx-1] = commands[innerIdx];
				commands[innerIdx] = tmp;
			}
		} else {
			if(innerIdx != commands.length - 1){
				var tmp = commands[innerIdx+1];
				commands[innerIdx+1] = commands[innerIdx];
				commands[innerIdx] = tmp;
			}
		}
	}
}

BattleAnimationBuilder.prototype.changeParamValue = function(id, sequence, tick, cmdIdx, param, value){
	var def = this._animLookup[id].data[sequence];	
	def[tick][cmdIdx].params[param] = value;
}

BattleAnimationBuilder.prototype.changeInnerParamValue = function(id, sequence, tick, cmdIdx, type, innerIdx, param, value){
	var def = this._animLookup[id].data[sequence];	
	def[tick][cmdIdx].params[type][innerIdx].params[param] = value;
}

BattleAnimationBuilder.prototype.updateTick = function(id, sequence, originalTick, tick){
	tick = tick*1;
	originalTick = originalTick*1;
	var def = this._animLookup[id].data[sequence];
	if(def){
		if(!def[tick]){
			def[tick] = [];
		}
		def[tick] = def[tick].concat(def[originalTick]);
		delete def[originalTick];
	}
	//this.save();
}

BattleAnimationBuilder.prototype.mergeTickIntoSequence = function(id, sequence, tick, tickData){
	tick = tick*1;
	var def = this._animLookup[id].data[sequence];
	if(def){
		if(!def[tick]){
			def[tick] = [];
		}
		def[tick] = def[tick].concat(tickData);
	}
	//this.save();
}

BattleAnimationBuilder.prototype.processDefinitions = function(data){
	var _this = this;
	
	
	_this._animLookup = data;
	_this.validateDefinitions();
	_this._resolveLoad();
	/*Object.keys(this._animLookup).forEach(function(id){
		var data = _this._animLookup[id].data;
		
	}); */
}

BattleAnimationBuilder.prototype.validateDefinitions = function(){
	var _this = this;
	var requiredSequences = {
		mainAnimation: {},
		onHit: {},
		onHitTwin: {},
		onHitOverwrite: {},
		onMiss: {},
		onMissTwin: {},
		onMissOverwrite: {},
		onDestroy: {},
		onDestroyTwin: {},
		onDestroyOverwrite: {},
		onNoDestroy: {},
		onNoDestroyOverwrite: {},
		onNoDestroyTwin: {}
	};
	
	Object.keys(_this._animLookup).forEach(function(id){
		var data = _this._animLookup[id].data;
		Object.keys(requiredSequences).forEach(function(sequenceName){
			if(data[sequenceName] == null){
				data[sequenceName] = {};
			}
		});
	});
}

BattleAnimationBuilder.prototype.processDefinition = function(data){
	var _this = this;
	var paramHandlers = {
		easingFunction: function(value){
			if(value != ""){
				return new BABYLON[_this.getEasingFunctions()[value]]()
			} else {
				return "";
			}			
		}
	};
	
	data = JSON.parse(JSON.stringify(data));
	Object.keys(data).forEach(function(animTimelineType){
		var timeLineData = data[animTimelineType];
		var tmp = [];
		Object.keys(timeLineData).forEach(function(tick){
			tmp[tick*1] = timeLineData[tick];
			var commands = tmp[tick];
			commands.forEach(function(command){
				var params = command.params;
				Object.keys(params).forEach(function(param){
					if(paramHandlers[param]){
						params[param] = paramHandlers[param](params[param]);
					}
					if(param == "commands"){
						var innerCommands = params[param];
						if(innerCommands && Array.isArray(innerCommands)){
							innerCommands.forEach(function(command){
								var params = command.params;
								Object.keys(params).forEach(function(param){
									if(paramHandlers[param]){
										params[param] = paramHandlers[param](params[param]);
									}
								});
							});
						}						
					}
				});
			});
		});
		data[animTimelineType] = tmp;
	});
	return data;
}

BattleAnimationBuilder.prototype.buildAnimation = function(idx, context){
	if(this._animLookup[idx]){
		return this.processDefinition(this._animLookup[idx].data);
	} else {
		return null;
	}	
}	

BattleAnimationBuilder.mergeAnimationIntoList = function(idx, list, animation){
	if(!list[idx]){
		list[idx] = [];
	}
	list[idx] = list[idx].concat(animation);
}

BattleAnimationBuilder.prototype.exportDef = function(idx){	
	this._fileHelper.exportDef(this._animLookup[idx], idx);
}

BattleAnimationBuilder.prototype.importDef = async function(currentIdx){	
	let data = await this._fileHelper.importDef();
	if(data != -1){
		let c = confirm("Overwrite the current definition? If not a new definition will be made.");
		if(c){
			this._animLookup[currentIdx] = data;
			return currentIdx;
		} else {
			var newId = Math.max(...Object.keys(this._animLookup)) + 1;
			this._animLookup[newId] = data;
			this.save();
			return newId;
		}		
	} else {
		return -1;
	}
} 
