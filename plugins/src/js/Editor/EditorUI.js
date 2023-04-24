import("./style/editor.css");
import DBList from "./DBList.js";
import FaceManager from "./FaceManager.js";

export default function EditorUI(container, mainUIHandler){
	this._container = container;
	this._mainUIHandler = mainUIHandler;
	this._data;
	this._currentId = 1;
	this.initPropertyHandlers();
	this._svgPath = "svg/editor/";
	if(this._mainUIHandler){
		this._mainUIHandler.registerUnloadListener();
	}	
}

EditorUI.prototype.initPropertyHandlers = function(){
	throw("No initPropertyHandlers implementation provided!");
}

EditorUI.prototype.parseData = function(){
	let _this = this;
	_this._data.forEach(function(entry){
		if(entry){
			DataManager.extractMetadata(entry);
		}		
	});	
}

EditorUI.prototype.loadData = function(){
	let _this = this;	
	const FILESYSTEM = require("fs"); 
	if(!_this._data){
		var path = require('path');
		this._data = JSON.parse(FILESYSTEM.readFileSync(this._dataFile, 'utf8'));		
		this.parseData();
		this.saveBackup();
	}			
}

EditorUI.prototype.packData = function(){
	let _this = this;
	var outData = JSON.parse(JSON.stringify(_this._data));
	outData.forEach(function(entry){
		if(entry){
			var meta = entry.meta;
			var parts = [];
			Object.keys(meta).forEach(function(metaKey){
				parts.push("<"+metaKey+":"+meta[metaKey]+">");
			});
			entry.note = parts.join("\n");
			delete entry.meta;
		}		
	});
	return JSON.stringify(outData);
}

EditorUI.prototype.save = function(){
	var fs = require('fs');
	fs.writeFileSync(this._dataFile, this.packData(this._data));
	if(this._vanillaFile){
		fs.writeFileSync(this._vanillaFile, this.packData(this._data));
	}
	if(this._gameVar){
		window[this._gameVar] = JSON.parse(JSON.stringify(this._data));
	}
}

EditorUI.prototype.saveBackup = function(){
	var fs = require('fs');
	fs.writeFileSync(this._dataFile+".bak", this.packData(this._data));
}

EditorUI.prototype.hook = function(){
	
}

EditorUI.prototype.getCurrentEntry = function(){
	return this._data[this._currentId];
}

EditorUI.prototype.getMetaValue = function(key){
	if(this.getCurrentEntry().meta[key] == null){
		return "";
	}
	return String(this.getCurrentEntry().meta[key]).trim();
}

EditorUI.prototype.setMetaValue = function(key, value){
	return this.getCurrentEntry().meta[key] = String(value);
}

EditorUI.prototype.createValueInput = function(key, name, preHint, postHint){
	let _this = this;
	var content = "";
	
	content+="<div class='cell'>";
	content+=name;
	content+="</div>";
	content+="<div class='cell'>";
	if(preHint){
		content+="<div class='hint_text pre'>"+preHint+"</div>";
	}
	content+="<input id='prop_"+key+"' value='"+_this.getMetaValue(key)+"'></input>";
	if(postHint){
		content+="<div class='hint_text post'>"+postHint+"</div>";
	}
	content+="</div>";
	
	return content;
}

EditorUI.prototype.createPilotSelect = function(id, classString, selected, data){
	let _this = this;
	var content = "";	
	content+="<select class='"+classString+"' "+data+" id='"+id+"'>";
	content+="<option title='None' value=''>None</option>";
	for(var i = 1; i < $dataActors.length; i++){	
		content+="<option "+(i == selected ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataActors[i].name+"</option>";							
	}	
	content+="</select>";
	
	return content;
}

EditorUI.prototype.createMechSelect = function(id, classString, selected, data){
	let _this = this;
	var content = "";	
	content+="<select class='"+classString+"' "+data+" id='"+id+"'>";
	content+="<option title='None' value=''>None</option>";
	for(var i = 1; i < $dataClasses.length; i++){
		content+="<option "+(i == selected ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataClasses[i].name+"</option>";							
	}	
	content+="</select>";
	
	return content;
}
EditorUI.prototype.createTerrainControls = function(key, name){
	let _this = this;
	var unitScores = _this.getMetaValue(key).split("");
	var terrains = ["AIR", "LND", "SEA", "SPC"];
	var scores = ["S", "A", "B", "C", "D", "-"];
	var content = "";
	
	content+="<div class='cell'>";
	content+=EDITORSTRINGS.GENERAL.label_terrain || "Terrain";
	content+="</div>";
	content+="<div class='cell'>";
	content+="<div class='terrain_container'>";
	for(var i = 0; i < terrains.length; i++){
		content+="<div class='column'>";
		content+="<div class='entry terrain_header'>";
		content+=terrains[i];
		content+="</div>";
		for(var j = 0; j < scores.length; j++){
			content+="<div data-scoreidx='"+i+"' data-score='"+scores[j]+"' class='entry "+(unitScores[i] == scores[j] ? "selected" : "")+"'>";
			content+=scores[j];
			content+="</div>";
		}
		content+="</div>";
	}
	
	content+="</div>";
	content+="</div>";
	
	return content;
}


EditorUI.prototype.copyEntry = function(id){
	this._copyBuffer = JSON.parse(JSON.stringify(this._data[id]));
}
		
EditorUI.prototype.pasteEntry = function(id){
	if(this._copyBuffer){
		this._data[id] = JSON.parse(JSON.stringify(this._copyBuffer));
		this._data[id].id = id * 1;
		this.show();
	}
}

EditorUI.prototype.deleteEntry = function(id){
	var c  = confirm("Erase this entry?");
	if(c){
		this._data[id] = this.getEmpty(id);
		this.show();
	}	
}

EditorUI.prototype.copyIsBuffered = function(){
	return !!this._copyBuffer;
}
	
EditorUI.prototype.escapeAttribute = function(string){
	if(!string){
		return "";
	}
	return string.replace(/\'/g, "&apos;").replace(/\"/g, "&quot;").replace(/\<br\>/g, "\n");
}	