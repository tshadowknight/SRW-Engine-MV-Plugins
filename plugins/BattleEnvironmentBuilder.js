function BattleEnvironmentBuilder(){	
	var _this = this;
	this._dataFileName = "BattleEnvironments.json";
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
	this._fileHelper = new FileHelper("environment");
}

BattleEnvironmentBuilder.prototype.loadDefinitions = function(type, onload, onerror){
	var xhr = new XMLHttpRequest();
    var url = 'js/plugins/config/'+type+'/'+this._dataFileName;
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

BattleEnvironmentBuilder.prototype.getDefinition = function(id){
	return this._data[id];
}

BattleEnvironmentBuilder.prototype.getDefinitions = function(){
	return this._data;
}

BattleEnvironmentBuilder.prototype.isLoaded = function(){
	return this._isLoaded;
}

BattleEnvironmentBuilder.prototype.processDefinitions = function(data){
	var _this = this;	
	_this._data = data;
	_this._resolveLoad();
}


BattleEnvironmentBuilder.prototype.save = function(id){
	var fs = require('fs');
	var dirPath = 'js/plugins/config/active';
	if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
	fs.writeFileSync('js/plugins/config/active/'+this._dataFileName, JSON.stringify(this._data));
}

BattleEnvironmentBuilder.prototype.saveBackup = function(id){
	var fs = require('fs');
	var dirPath = 'js/plugins/config/active';
	if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
	fs.writeFileSync('js/plugins/config/active/'+this._dataFileName+'.bak', JSON.stringify(this._data));
}

BattleEnvironmentBuilder.prototype.newDef = function(name){
	var newId;	
	if(Object.keys(this._data).length){
		newId = Math.max(...Object.keys(this._data)) + 1;
	} else {
		newId = 0;
	}
	this._data[newId] = {
		name: name,
		data: {
			bgs: []
		}	
	};
	//this.save();
	return newId;
}

BattleEnvironmentBuilder.prototype.copyDef = function(id){
	var newId = Math.max(...Object.keys(this._data)) + 1;
	this._data[newId] = JSON.parse(JSON.stringify(this._data[id]));
	//this.save();
	return newId;
}

BattleEnvironmentBuilder.prototype.deleteDef = function(id){
	delete this._data[id];
	//this.save();
}

BattleEnvironmentBuilder.prototype.updateName = function(id, value){
	this._data[id].name = value;
	//this.save();
}

BattleEnvironmentBuilder.prototype.newBg = function(id){
	var bgs = this._data[id].data.bgs;
	var maxId = -1;
	for(var i = 0; i < bgs.length; i++){
		if(bgs[i].id > maxId){
			maxId = bgs[i].id;
		}
	}
	this._data[id].data.bgs.push({
		path: "",
		yoffset: 0,
		zoffset: 0,
		width: 0,
		height: 0, 
		isfixed: false,
		id: maxId + 1,
		hidden: false
	});
	//this.save();
}

BattleEnvironmentBuilder.prototype.deleteBg = function(id, bgId){
	var bgs = this._data[id].data.bgs;
	var targetIdx = -1;
	for(var i = 0; i < bgs.length; i++){
		if(bgs[i].id == bgId){
			targetIdx = i;
		}
	}
	if(targetIdx != -1){
		bgs.splice(targetIdx, 1);
	}
	//this.save();
}

BattleEnvironmentBuilder.prototype.updateBg = function(id, bgId, dataId, value){
	var bgs = this._data[id].data.bgs;
	var targetIdx = -1;
	for(var i = 0; i < bgs.length; i++){
		if(bgs[i].id == bgId){
			targetIdx = i;
		}
	}
	if(targetIdx != -1){
		var bg = bgs[targetIdx];
		bg[dataId] = value;
	}
	//this.save();
}


BattleEnvironmentBuilder.prototype.exportDef = function(idx){	
	this._fileHelper.exportDef(this._data[idx], idx);
}

BattleEnvironmentBuilder.prototype.importDef = async function(currentIdx){	
	let data = await this._fileHelper.importDef();
	if(data != -1){
		let c = confirm("Overwrite the current definition? If not a new definition will be made.");
		if(c){
			this._data[currentIdx] = data;
			return currentIdx;
		} else {
			var newId = Math.max(...Object.keys(this._data)) + 1;
			this._data[newId] = data;
			this.save();
			return newId;
		}		
	} else {
		return -1;
	}
} 
