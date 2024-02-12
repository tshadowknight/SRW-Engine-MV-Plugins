function BattleTextBuilder(){	
	var _this = this;
	this._dataFileName = "BattleText.json";
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
	
	this._availableHooks = [
		"battle_intro",
		"retaliate",
		"attacks",
		"evade",
		"damage",
		"damage_critical",
		"destroyed",
		"support_defend",
		"support_attack",
		"no_counter"
	];			
}

BattleTextBuilder.prototype.getAvailableTextHooks = function(){
	return this._availableHooks.slice();
}

BattleTextBuilder.prototype.loadDefinitions = function(type, onload, onerror){
	var xhr = new XMLHttpRequest();
    var url = 'data/'+this._dataFileName;
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

BattleTextBuilder.prototype.getDefinitions = function(){
	return this._data;
}

BattleTextBuilder.prototype.isLoaded = function(){
	return this._isLoaded;
}

BattleTextBuilder.prototype.processDefinitions = function(data){
	var _this = this;	
	_this._data = data;
	_this._resolveLoad();
}


BattleTextBuilder.prototype.save = function(id){
	var fs = require('fs');
	fs.writeFileSync('data/'+this._dataFileName, JSON.stringify(this._data));
}

BattleTextBuilder.prototype.saveBackup = function(id){
	var fs = require('fs');
	if(this._data && Object.keys(this._data).length){
		fs.writeFileSync('data/'+this._dataFileName+'.bak', JSON.stringify(this._data));
	}
}

BattleTextBuilder.prototype.updateText = function(params, updateValues){
	try {
		var def = this.getDefinitions()[params.sceneType]
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		} 
		var options = hookDef[params.subType];
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}		
		var line = lines[params.lineIdx];
		Object.keys(updateValues).forEach(function(key){
			line[key] = updateValues[key];
		});		
		options[params.targetIdx] = lines;	
		
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.addText = function(params, idx){
	try {
		var definition = this.getDefinitions();
		var def = definition[params.sceneType];
		if(params.sceneType == "event"){
			if(!def){
				definition[params.sceneType] = [];
				def = definition[params.sceneType];
			}
			if(!def[params.eventId]){
				def[params.eventId] = {
					refId: "",
					data: {}
				}
			}
			def = def[params.eventId].data;
		} else {
			if(!def){
				definition[params.sceneType] = {
					actor: {},
					enemy: {}
				};
				def = definition[params.sceneType];
			}
		}
		
		var entityDef = def[params.entityType][params.entityId];
		if(!entityDef){
			def[params.entityType][params.entityId] = {};
			entityDef = def[params.entityType][params.entityId];
		}
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			if(!hookDef){
				entityDef[params.type] = {};
				hookDef = entityDef[params.type];
			}
			hookDef = hookDef[params.weaponId];			
		}  
		if(!hookDef){
			entityDef[params.type] = {
				default: [],
				actor: [],
				enemy: []
			}			
			hookDef = entityDef[params.type];
		}		
		
		var options = hookDef[params.subType];
		var newEntry;
		if(params.subType == "default"){
			newEntry = [{text: "", faceName: "", faceIndex: ""}];
		} else {
			newEntry = [{text: "", faceName: "", faceIndex: "", unitId: -1, tag: ""}];
		}
		if(params.type == "attacks"){
			newEntry[0].quoteId = 0;
		}
		if(idx == null){
			options.unshift(newEntry);
		} else {
			options.splice(idx * 1 + 1, 0 , newEntry);
		}
		
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.addTextLine = function(params){
	try {
		var def = this.getDefinitions()[params.sceneType];		
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}		
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];		
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}
		
		var newEntry;
		if(params.subType == "default"){
			newEntry = {text: "", faceName: "", faceIndex: ""};
		} else {
			newEntry = {text: "", faceName: "", faceIndex: "", unitId: -1};
		}
		if(params.type == "attacks"){
			newEntry.quoteId = 0;
		}
		
		lines.push(newEntry);
		options[params.targetIdx] = lines;		
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.setUnitId = function(params, id){
	try {
		var def = this.getDefinitions()[params.sceneType];		
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}		
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];		
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}
		
		lines[params.lineIdx].unitId = id;
		options[params.targetIdx] = lines;	
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.addAttackGroupOdds = function(params){
	var def = this.getDefinitions()[params.sceneType];		
	if(params.sceneType == "event"){			
		def = def[params.eventId].data;
	}		
	var entityDef = def[params.entityType][params.entityId];
	var hookDef = entityDef[params.type];
	if(params.type == "attacks"){
		hookDef = hookDef[params.weaponId];			
	}
	if(!hookDef["__groupodds"]){
		hookDef["__groupodds"] = [];
	}
	hookDef["__groupodds"].push({
		groupId: "",
		weight: ""
	});
}

BattleTextBuilder.prototype.removeAttackGroupOdds = function(params, idx){
	var def = this.getDefinitions()[params.sceneType];		
	if(params.sceneType == "event"){			
		def = def[params.eventId].data;
	}		
	var entityDef = def[params.entityType][params.entityId];
	var hookDef = entityDef[params.type];
	if(params.type == "attacks"){
		hookDef = hookDef[params.weaponId];			
	}
	if(!hookDef["__groupodds"]){
		hookDef["__groupodds"] = [];
	}
	hookDef["__groupodds"].splice(idx, 1);
}

BattleTextBuilder.prototype.setAttackGroupProperty = function(params, idx, prop, value){
	var def = this.getDefinitions()[params.sceneType];		
	if(params.sceneType == "event"){			
		def = def[params.eventId].data;
	}		
	var entityDef = def[params.entityType][params.entityId];
	var hookDef = entityDef[params.type];
	if(params.type == "attacks"){
		hookDef = hookDef[params.weaponId];			
	}
	if(!hookDef["__groupodds"]){
		hookDef["__groupodds"] = [];
	}
	if(hookDef["__groupodds"][idx]){
		hookDef["__groupodds"][idx][prop] = value;
	}

}

BattleTextBuilder.prototype.setAttackQuoteProperty = function(property, params, id){
	try {
		var def = this.getDefinitions()[params.sceneType];		
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}		
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];		
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}
		
		//lines[params.lineIdx].unitId = id;
		
		
		//hack to ensure the quoteId is the same for all lines in a quote
		if(params.type == "attacks"){
			lines.forEach(function(line){
				line[property] = id;
			});
		}
		options[params.targetIdx] = lines;	
		
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.setQuoteId = function(params, id){
	this.setAttackQuoteProperty("quoteId", params, id);
}

BattleTextBuilder.prototype.setQuoteGroup = function(params, id){
	this.setAttackQuoteProperty("quoteGroup", params, id);
}

BattleTextBuilder.prototype.setMechId = function(params, id){
	try {
		var def = this.getDefinitions()[params.sceneType];		
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}		
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];	
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}	
		lines[params.lineIdx].mechId = id;
		options[params.targetIdx] = lines;	
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.setQuoteTag = function(params, id){
	try {
		var def = this.getDefinitions()[params.sceneType];		
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}		
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];	
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}	
		lines[params.lineIdx].tag = id;
		options[params.targetIdx] = lines;	
	} catch(e){
		console.log(e.message);
	}
}


BattleTextBuilder.prototype.deleteText = function(params){
	try {
		var def = this.getDefinitions()[params.sceneType]
		if(params.sceneType == "event"){			
			def = def[params.eventId].data;
		}
		var entityDef = def[params.entityType][params.entityId];
		var hookDef = entityDef[params.type];
		if(params.type == "attacks"){
			hookDef = hookDef[params.weaponId];			
		}
		var options = hookDef[params.subType];
		var lines = options[params.targetIdx];
		if(!Array.isArray(lines)){
			lines = [lines];
		}				
		lines.splice(params.lineIdx, 1);
		options[params.targetIdx] = lines;	
		if(!lines.length){
			options.splice(params.targetIdx, 1);
		}		
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.deleteWeaponEntry = function(params){
	try {
		if(params.type == "attacks"){
			var def = this.getDefinitions()[params.sceneType]
			if(params.sceneType == "event"){			
				def = def[params.eventId].data;
			}
			var entityDef = def[params.entityType][params.entityId];
			var hookDef = entityDef[params.type];			
			delete hookDef[params.weaponId];						
		}
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.addWeaponEntry = function(params, weaponId){
	try {
		if(params.type == "attacks"){
			var def = this.getDefinitions()[params.sceneType]
			if(params.sceneType == "event"){			
				def = def[params.eventId].data;
			}
			var entityDef = def[params.entityType][params.entityId];
			var hookDef = entityDef[params.type];			
			hookDef[weaponId] = {
				
			};			
		}
	} catch(e){
		console.log(e.message);
	}
}

BattleTextBuilder.prototype.addEvent = function(){
	var definition = this.getDefinitions();
	var def = definition.event;
	def.push({
		refId: "",
		data: {}
	});
}

BattleTextBuilder.prototype.copyEvent = function(eventId){
	var definition = this.getDefinitions();
	var def = definition.event;
	def.push(JSON.parse(JSON.stringify(def[eventId])));
}

BattleTextBuilder.prototype.deleteEvent = function(eventId){
	var definition = this.getDefinitions();
	var def = definition.event;
	delete def[eventId];
}

BattleTextBuilder.prototype.changeEventId = function(eventId, id){
	var definition = this.getDefinitions();
	var def = definition.event;
	def[eventId].refId = id;
}

