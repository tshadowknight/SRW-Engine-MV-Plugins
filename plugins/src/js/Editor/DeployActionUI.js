import EditorUI from "./EditorUI.js";
import DBList from "./DBList.js";
import MenuSpriteManager from "./MenuSpriteManager";
import BasicBattleSpriteManager from "./BasicBattleSpriteManager";
import OverworldSpriteManager from "./OverworldSpriteManager";

export default function DeployActionUI(editorContainer, managedMech, mainUIHandler, callbacks){
	EditorUI.call(this, mainUIHandler);
	this._managedMech = managedMech;
	this._dataFile = "data/DeployActions.json";
	this._callbacks = callbacks;
	this._editorContainer = editorContainer;
	var div = document.createElement("div");
	div.id="deploy_action_ui";
	div.classList.add("overlay_container");
	editorContainer.appendChild(div);	
	
	this._container = div;
}

DeployActionUI.prototype = Object.create(EditorUI.prototype);
DeployActionUI.prototype.constructor = DeployActionUI;

DeployActionUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
}

DeployActionUI.prototype.parseData = function(){
	let _this = this;
	
}

DeployActionUI.prototype.packData = function(){
	let _this = this;
	var outData = JSON.parse(JSON.stringify(_this._data));
	return JSON.stringify(outData);
}

DeployActionUI.prototype.show = async function(){
	let _this = this;
	_this.loadData();
	
	var currentScroll;
	var scrollContainer = _this._container.querySelector(".scroll");
	if(scrollContainer){
		currentScroll = scrollContainer.scrollTop;
	}
	
	let content = "";
	let typeOptions = ["main", "sub"];
	
	let sourceOptions = ["direct", "main", "sub"];
	
	_this.initMechDef(_this._managedMech);
	var mechData = _this._data[_this._managedMech];
	
	content+="<div class='content_container'>";
	content+="<div class='title'>";
	content+="Deploy Actions for #"+String(_this._managedMech).padStart(3,0)+" "+$dataClasses[_this._managedMech].name;
	content+="<img id='close_deploy_actions' class='remove_button' src='"+_this._svgPath+"/close-line.svg'>";
	content+="</div>";
	
	content+="<div class='scroll'>";
	Object.keys(mechData).sort().forEach(function(pilotId){
		
			content+="<div class='section_block'>";
			content+="<div class='title'>";
			content+="If deployed with pilot";
			content+="<select class='pilot_block_main_select' data-blockid='"+pilotId+"'>";
			content+="<option "+(i == -1 ? "selected" : "")+" value='-1'>Any</option>";
			for(var i = 1; i < $dataActors.length; i++){	
				content+="<option "+(i == pilotId ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataActors[i].name+"</option>";							
			}	
			content+="</select>";
			content+="Optional";
			content+="<input type='checkbox' data-blockid='"+pilotId+"' class='pilot_block_optional_toggle' "+(mechData[pilotId].optional ? "checked" : "")+"/>";
			content+="<img class='remove_pilot_block remove_button' data-blockid='"+pilotId+"' src='"+_this._svgPath+"/close-line.svg'>";
			content+="</div>";
			content+="<div class='content'>";
			var mechEntries = mechData[pilotId];
			
			Object.keys(mechEntries).sort().forEach(function(mechId){
				//hack to avoid having to change the deployAction structure
				if(mechId != "optional"){			
					content+="<div class='section_block'>";
					content+="<div class='title'>";
					content+="Change the pilot(s) of ";
					content+="<select class='mech_block_select' data-blockid='"+pilotId+"' data-mechid='"+mechId+"'>";
					content+="<option></option>";
					for(var i = 1; i < $dataClasses.length; i++){	
						content+="<option "+(i == mechId ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataClasses[i].name+"</option>";							
					}	
					content+="</select>";
					content+="<img class='remove_mech_block remove_button' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="<div class='content'>";
					
					var targetIdx = 0;
					var targetEntries = mechData[pilotId][mechId];
					targetEntries.forEach(function(targetEntry){
						content+="<div class='section_block'>";
						content+="<div class='title'>";
						content+="Take pilot";
						content+="<img class='remove_target_block remove_button' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"' src='"+_this._svgPath+"/close-line.svg'>";
						content+="</div>";
						content+="<div class='target_control'>";
						content+="<div class='label'>";
						content+="Type";
						content+="</div>";
						content+="<select class='source_type_select' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"'>";
						content+="<option></option>";
						for(var i = 0; i < sourceOptions.length; i++){	
							content+="<option "+(sourceOptions[i] == targetEntry.source.type ? "selected" : "")+" value='"+sourceOptions[i]+"'>"+sourceOptions[i]+"</option>";							
						}	
						content+="</select>";		
						content+="</div>";
						if(targetEntry.source.type == "direct"){
							content+="<div class='target_control'>";
							content+="<div class='label'>";
							content+="Pilot";
							content+="</div>";
							content+="<select class='source_pilot_select' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"'>";
							content+="<option></option>";
							for(var i = 1; i < $dataActors.length; i++){	
								content+="<option "+(i == targetEntry.source.id ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataActors[i].name+"</option>";							
							}	
							content+="</select>";
							content+="</div>";
						} 
						if(targetEntry.source.type == "main" || targetEntry.source.type == "sub"){
							content+="<div class='target_control'>";
							content+="<div class='label'>";
							content+="Take from";
							content+="</div>";
							content+="<select class='source_mech_select' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"'>";
							content+="<option></option>";
							for(var i = 1; i < $dataClasses.length; i++){	
								content+="<option "+(i == targetEntry.source.mech_id ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataClasses[i].name+"</option>";							
							}	
							content+="</select>";
							content+="</div>";
							
						}
						if(targetEntry.source.type == "sub"){
							
							content+="<div class='target_control'>";
							content+="<div class='label'>";
							content+="Slot";
							content+="</div>";					
							content+="<input class='source_slot' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"' value='"+(targetEntry.source.slot || "")+"'></input>";
							content+="</div>";
						}
						
						
						content+="<div class='title'>";
						content+="Put them into slot(of #"+(String(mechId).padStart(3, 0))+" "+($dataClasses[mechId].name)+") ";
						content+="</div>";
						content+="<div class='target_control'>";
						content+="<div class='label'>";
						content+="Type";
						content+="</div>";
						content+="<select class='target_type_select' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"'>";
						content+="<option></option>";
						for(var i = 0; i < typeOptions.length; i++){	
							content+="<option "+(typeOptions[i] == targetEntry.target.type ? "selected" : "")+" value='"+typeOptions[i]+"'>"+typeOptions[i]+"</option>";							
						}	
						content+="</select>";		
						content+="</div>";
						if(targetEntry.target.type == "sub"){
							content+="<div class='target_control'>";
							content+="<div class='label'>";
							content+="Slot";
							content+="</div>";					
							content+="<input class='target_sub_slot' data-blockid='"+pilotId+"' data-mechid='"+mechId+"' data-targetidx='"+targetIdx+"' value='"+(targetEntry.target.slot || "")+"'></input>";
							content+="<div class='hint'>Starts at 0</div>";
							content+="</div>";
						}	
					
						content+="</div>";
						targetIdx++;
					});
					content+="<div class='controls'>";
					content+="<button class='add_target_block' data-blockid='"+pilotId+"' data-mechid='"+mechId+"'>Add Target</button>";
					content+="</div>";
					
					content+="</div>";
					content+="</div>";
				}
			});
			
			content+="<div class='controls'>";
			content+="<button class='add_mech_block' data-blockid='"+pilotId+"' >Add Mech</button>";
			content+="</div>";
			
			content+="</div>";
			content+="</div>";
		
	});
	content+="</div>";
	content+="<div class='controls'>";
	content+="<button id='add_pilot_block'>Add Pilot</button>";
	content+="</div>";
	content+="<div class='controls'>";
	content+="<button id='apply_deploy_actions'>Save</button>";
	content+="</div>";
	content+="</div>";
	
	

	
	
	this._container.innerHTML = content;
	var scrollContainer = _this._container.querySelector(".scroll");
	if(scrollContainer){
		scrollContainer.scrollTop = currentScroll;
	}
	
	
	this.hook();
	
}

DeployActionUI.prototype.getUnusedPilot = function(list){
	let _this = this;
	if(!list[-1]){
		return -1;
	} else {
		var id;
		var ctr = 1;
		while(id == null && ctr < $dataActors.length){
			if(!list[ctr]){
				id = ctr;
			}
			ctr++;
		}
		return id;
	}
}

DeployActionUI.prototype.getUnusedMech = function(list){
	let _this = this;
	
	var id;
	var ctr = 1;
	while(id == null && ctr < $dataClasses.length){
		if(!list[ctr]){
			id = ctr;
		}
		ctr++;
	}
	return id;	
}

DeployActionUI.prototype.initMechDef = function(id){
	if(!this._data[id]){
		this._data[id] = {};
	}
}

DeployActionUI.prototype.hook = function(){
	let _this = this;
	this._container.querySelector("#close_deploy_actions").addEventListener("click", function(){
		_this._editorContainer.removeChild(_this._container);
	});	
	
	this._container.querySelector("#add_pilot_block").addEventListener("click", function(){
		
		var mechData = _this._data[_this._managedMech];
		var newId = _this.getUnusedPilot( _this._data[_this._managedMech]);
		if(newId != null){
			mechData[newId] = {};
			_this.show();
		}				
	});	
	
	var entries = this._container.querySelectorAll(".remove_pilot_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			delete mechData[blockId];
			_this.show();
		});
	});
	
	var entries = this._container.querySelectorAll(".pilot_block_main_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			var newId = this.value;
			if(!mechData[newId]){
				mechData[newId] = mechData[blockId];
				delete  mechData[blockId];
				_this.show();
			} else {
				alert("This pilot already has a definition!");
				return false;
			}
		});
	});
	
	var entries = this._container.querySelectorAll(".pilot_block_optional_toggle");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			mechData[blockId].optional = this.checked;
			_this.show();		
		});
	});	
	
	
	var entries = this._container.querySelectorAll(".add_mech_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			var newId = _this.getUnusedMech(mechData[blockId]);
			if(newId != null){
				mechData[blockId][newId] = [];
				_this.show();
			}
		});
	});
	
	var entries = this._container.querySelectorAll(".remove_mech_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			var mechId = this.getAttribute("data-mechid");			
			delete mechData[blockId][mechId];
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".mech_block_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechData = _this._data[_this._managedMech];
			var mechId = this.getAttribute("data-mechid");
			var newId = this.value;
			
			if(!mechData[blockId][newId]){
				mechData[blockId][newId] = mechData[blockId][mechId];
				delete mechData[blockId][mechId];
				_this.show();
			} else {
				
				alert("This mech already has a definition!");
				return false;
			}					
		});
	});
	
	 
	var entries = this._container.querySelectorAll(".add_target_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var data = _this._data[_this._managedMech][blockId][mechId];
			data.push({target: {type: "main"}, source: {type: "direct", id: 1}});				
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".remove_target_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId];
			data.splice(targetIdx, 1);			
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".source_type_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.source.type = this.value;
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".source_pilot_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.source.id = this.value;
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".source_mech_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.source.mech_id = this.value;
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".source_slot");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.source.slot = this.value;
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".target_type_select");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.target.type = this.value;
			_this.show();			
		});
	});
	
	var entries = this._container.querySelectorAll(".target_sub_slot");
	entries.forEach(function(entry){
		entry.addEventListener("change", function(){
			var blockId = this.getAttribute("data-blockid");
			var mechId = this.getAttribute("data-mechid");
			var targetIdx = this.getAttribute("data-targetidx");
			var data = _this._data[_this._managedMech][blockId][mechId][targetIdx];
			data.target.slot = this.value;
			_this.show();			
		});
	});
	
	
	
	
	this._container.querySelector("#apply_deploy_actions").addEventListener("click", function(){
		_this.save();
		_this._editorContainer.removeChild(_this._container);
	});	
}
