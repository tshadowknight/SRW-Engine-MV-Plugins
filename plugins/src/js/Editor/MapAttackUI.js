import EditorUI from "./EditorUI.js";
import FaceManager from "./FaceManager.js";

export default function MapAttackUI(editorContainer, managedMapAttack, mainUIHandler, callbacks){
	EditorUI.call(this, mainUIHandler);
	this._dataFile = "data/MapAttacks.json";
	this._callbacks = callbacks;
	this._editorContainer = editorContainer;
	this._managedMapAttack = managedMapAttack;
	var div = document.createElement("div");
	div.id="map_attack_ui";
	div.classList.add("overlay_container");
	editorContainer.appendChild(div);	
	
	this._currentEntry;
	this._currentShapeLookup = {};
	this._currentRetargetShapeLookup = {};
	this._currentPreviewDirection = "right";
	this._container = div;
	this._editSecondary = false;
	this._chooseCenter = false;
}

MapAttackUI.prototype = Object.create(EditorUI.prototype);
MapAttackUI.prototype.constructor = MapAttackUI;

MapAttackUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
}

MapAttackUI.prototype.parseData = function(){
	let _this = this;
	
}

MapAttackUI.prototype.packData = function(){
	let _this = this;
	var outData = JSON.parse(JSON.stringify(_this._data));
	return JSON.stringify(outData);
}

MapAttackUI.prototype.show = async function(){
	let _this = this;
	_this.loadData();
	
	var currentScroll;
	var scrollContainer = _this._container.querySelector(".scroll");
	if(scrollContainer){
		currentScroll = scrollContainer.scrollTop;
	}
	
	let content = "";
	
	if(!_this._currentEntry){
	
		if(!_this._data[_this._managedMapAttack]){
			_this._managedMapAttack = null
		}
		if(_this._managedMapAttack == null){
			_this._currentEntry = {
				name: "New Map Attack",
				shape: [],
				
			};
		} else {
			_this._currentEntry = _this._data[_this._managedMapAttack];
		}
		if(!_this._currentEntry.animInfo){
			_this._currentEntry.animInfo = {
				animId: 0,
				offset: {
					up: {x: 0, y: 0},
					down: {x: 0, y: 0},
					left: {x: 0, y: 0},
					right: {x: 0, y: 0},
				},
				scale: 1
			};
		}
		
		if(!_this._currentEntry.animInfo.offset.up){
			_this._currentEntry.animInfo.offset.up = {x: 0, y: 0};
		}
		if(!_this._currentEntry.animInfo.offset.down){
			_this._currentEntry.animInfo.offset.down = {x: 0, y: 0};
		}
		if(!_this._currentEntry.animInfo.offset.left){
			_this._currentEntry.animInfo.offset.left = {x: 0, y: 0};
		}
		if(!_this._currentEntry.animInfo.offset.right){
			_this._currentEntry.animInfo.offset.right = {x: 0, y: 0};
		}
		
		if(!_this._currentEntry.textInfo){
			_this._currentEntry.textInfo = {
				faceName: null,
				faceIdx: null,
				text: ""
			};
		}
		
		if(!_this._currentEntry.retargetInfo){
			_this._currentEntry.retargetInfo = {
				shape: [],
				center: {x: 0, y: 0},
				initialPosition: {x: 0, y: 0},
			};
		}
	
	}
	_this.unpackShape();
	_this.unpackRetargetShape();
	
	
	
	content+="<div class='content_container map'>";
	content+="<div class='title'>";
	if(_this._managedMapAttack == null){
		content+=_this._currentEntry.name;
	} else {
		content+=EDITORSTRINGS.WEAPON.label_map_attack+" #"+String(_this._managedMapAttack).padStart(3,0)+" "+_this._currentEntry.name;
	}
	
	content+="<img id='close_map_changes' class='remove_button' src='"+_this._svgPath+"/close-line.svg'>";
	content+="</div>";
	//content+="<div class='scroll'>";
	
	content+="<div class='panes'>";
	
	content+="<div class='pane left'>";
	
	content+="<div class='target_control'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.GENERAL.label_name;
	content+="</div>";
	content+="<input value='"+_this._currentEntry.name+"' id='map_att_name'></input>"		
	content+="</div>";
	
	content+="<div class='section animation'>";
	content+="<div class='target_control title'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_animation;
	content+="</div>";
	
	content+="</div>";
	content+="<div class='target_control'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_id;
	content+="</div>";
	
	content+="<select id='map_att_anim'>";
	content+="<option title='None' value=''>None</option>";
	for(var i = 1; i < $dataAnimations.length; i++){
		content+="<option "+(i == _this._currentEntry.animInfo.animId ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(3, 0))+" "+$dataAnimations[i].name+"</option>";							
	}	
	content+="</select>";
	
	content+="</div>";
	
	content+="<div class='target_control'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_scale;
	content+="</div>";
	
	content+="<input value='"+_this._currentEntry.animInfo.scale+"' id='map_att_anim_scale'></input>"	
	
	content+="</div>";
	
	content+="<div class='target_control'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_offsets;
	content+="</div>";
	content+="</div>";
	
	function createOffsetRow(direction, name){
		var content = "";
		content+="<div class='target_control'>";
		content+="<div class='label'>";
		content+=name;
		content+="</div>";
		content+="<div class=''>";
		content+="x:";
		content+="</div>";
		
		content+="<input value='"+_this._currentEntry.animInfo.offset[direction].x+"' class='map_att_offset' data-direction='"+direction+"' data-prop='x'></input>"	
		content+="<div class=''>";
		content+="px";
		content+="</div>";
		content+="<div class='' style='margin-left: 5px;'>";
		content+="y:";
		content+="</div>";
		
		content+="<input value='"+_this._currentEntry.animInfo.offset[direction].y+"' class='map_att_offset' data-direction='"+direction+"' data-prop='y'></input>"
		content+="<div class=''>";
		content+="px";
		content+="</div>";
		content+="</div>";
		return content;
	}
	
	content+=createOffsetRow("up", EDITORSTRINGS.WEAPON.label_up);
	content+=createOffsetRow("down", EDITORSTRINGS.WEAPON.label_down);
	content+=createOffsetRow("left", EDITORSTRINGS.WEAPON.label_left);
	content+=createOffsetRow("right", EDITORSTRINGS.WEAPON.label_right);
	
	
	content+="</div>";
	
	
	content+="<div class='section animation'>";
	content+="<div class='target_control title'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_text_box;
	content+="</div>";
	content+="</div>";
	content+="<div class='target_control'>";
	content+="<div class='portrait_preview unit_img_preview'></div>";
	content+="<textarea id='map_att_text'>"+_this._currentEntry.textInfo.text+"</textarea>"	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='pane right'>";
	
	content+="<div class='target_control'>";
	content+="<div class='label secondary'>";
	content+=EDITORSTRINGS.WEAPON.label_edit_secondary_pattern;
	content+="</div>";
	content+="<input type=checkbox "+(_this._editSecondary ? "checked" : "")+" id='edit_secondary'></input>"	
	
	content+="<button id='map_choose_retarget_center'>"+EDITORSTRINGS.WEAPON.label_choose_center+"</button>";
	if(_this._chooseCenter){		
		content+=EDITORSTRINGS.WEAPON.hint_choose_center;	
	}
	
	content+="</div>";
	
	content+="<div class='target_control'>";
	content+="<div class='label'>";
	content+=EDITORSTRINGS.WEAPON.label_lock_rotation;
	content+="</div>";
	content+="<input type=checkbox "+(_this._currentEntry.lockRotation ? "checked" : "")+" id='lock_att_rotation'></input>"	
	content+="<div class='direction_control_container "+(_this._currentEntry.lockRotation ? "locked" : "")+"'>";	
	content+="<img class='eyecon' src='"+_this._svgPath+"/eye-line.svg'>";
	
	content+="<img data-direction='up' class='dir_select up "+(_this._currentPreviewDirection == "up" ? "selected" : "")+"' src='"+_this._svgPath+"/chevron_right.svg'>";
	content+="<img data-direction='down' class='dir_select down "+(_this._currentPreviewDirection == "down" ? "selected" : "")+"' src='"+_this._svgPath+"/chevron_right.svg'>";
	content+="<img data-direction='left' class='dir_select left "+(_this._currentPreviewDirection == "left" ? "selected" : "")+"' src='"+_this._svgPath+"/chevron_right.svg'>";	
	content+="<img data-direction='right' class='dir_select right "+(_this._currentPreviewDirection == "right" ? "selected" : "")+"' src='"+_this._svgPath+"/chevron_right.svg'>";
	content+="</div>";
	content+="</div>";
	
	//content+="</div>";
	
	
	
	
	var previewRows = 31;
	var previewColumns = 31;
	
	var centerX = 15;
	var centerY = 15;
	
	content+="<div class='map_edit_pane_container'>";
	content+="<div id='main_shape' class='map_edit_pane'>";
	for(var row = 0; row < previewRows; row++){
		content+="<div class='row'>";
		for(var column = 0; column < previewColumns; column++){
			var x = row - centerX;
			var y = column - centerY;
			
			if(!_this._currentEntry.lockRotation){
				if(_this._currentPreviewDirection == "left"){
					y*=-1;
				} else if(_this._currentPreviewDirection == "up"){
					var tmp = x;
					x = y;
					y = tmp;
					y*=-1;	
				} else if(_this._currentPreviewDirection == "down"){
					var tmp = x;
					x = y;
					y = tmp;
				}
			}			
			
			var classString = "block ";
			if(_this._currentShapeLookup[y] && _this._currentShapeLookup[y][x]){
				classString+="selected ";
			}
			if(x == 0 && y == 0){
				classString+="center ";
			}
			content+="<div data-row='"+(x)+"' data-column='"+(y)+"' class='"+classString+"'>";
			
			content+="</div>";
		}
		content+="</div>";
	}
	content+="</div>";
	
	
	content+="<div id='sub_shape' class='map_edit_pane map_retarget_edit_pane "+(_this._editSecondary ? "active" : "")+"'>";
	for(var row = 0; row < previewRows; row++){
		content+="<div class='row'>";
		for(var column = 0; column < previewColumns; column++){
			var x = row - centerX;
			var y = column - centerY;
			
			if(!_this._currentEntry.lockRotation){
				if(_this._currentPreviewDirection == "left"){
					y*=-1;
				} else if(_this._currentPreviewDirection == "up"){
					var tmp = x;
					x = y;
					y = tmp;
					y*=-1;	
				} else if(_this._currentPreviewDirection == "down"){
					var tmp = x;
					x = y;
					y = tmp;
				}
			}			
			
			var classString = "block ";
			if(_this._currentRetargetShapeLookup[y] && _this._currentRetargetShapeLookup[y][x]){
				classString+="selected ";
			}
			if(y == _this._currentEntry.retargetInfo.center.x && x == _this._currentEntry.retargetInfo.center.y){
				classString+="center ";
			}
			content+="<div data-row='"+(x)+"' data-column='"+(y)+"' class='"+classString+"'>";
			
			content+="</div>";
		}
		content+="</div>";
	}
	content+="</div>";
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='controls'>";
	content+="<button id='apply_map_changes'>"+EDITORSTRINGS.GENERAL.label_save+"</button>";
	if(_this._managedMapAttack != null){
		content+="<button id='delete_map_att'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";
	}
	
	content+="</div>";
	content+="</div>";
	
	
	
	this._container.innerHTML = content;
	var scrollContainer = _this._container.querySelector(".scroll");
	if(scrollContainer){
		scrollContainer.scrollTop = currentScroll;
	}
	
	
	this.hook();
	
}

MapAttackUI.prototype.unpackShape = function(){
	var _this = this;
	var shape = this._currentEntry.shape || [];
	this._currentShapeLookup = {};
	shape.forEach(function(entry){
		if(!_this._currentShapeLookup[entry[0]]){
			_this._currentShapeLookup[entry[0]] = {};
		}
		_this._currentShapeLookup[entry[0]][entry[1]] = true;
	});
}

MapAttackUI.prototype.packShape = function(){
	var _this = this;
	var tmp = [];
	Object.keys(_this._currentShapeLookup).forEach(function(x){
		Object.keys(_this._currentShapeLookup[x]).forEach(function(y){
			tmp.push([x * 1, y * 1]);
		});
	});
	
	this._currentEntry.shape = tmp;
}

MapAttackUI.prototype.unpackRetargetShape = function(){
	var _this = this;
	var shape = this._currentEntry.retargetInfo.shape || [];
	this._currentRetargetShapeLookup = {};
	shape.forEach(function(entry){
		if(!_this._currentRetargetShapeLookup[entry[0]]){
			_this._currentRetargetShapeLookup[entry[0]] = {};
		}
		_this._currentRetargetShapeLookup[entry[0]][entry[1]] = true;
	});
}

MapAttackUI.prototype.packRetargetShape = function(){
	var _this = this;
	var tmp = [];
	Object.keys(_this._currentRetargetShapeLookup).forEach(function(x){
		Object.keys(_this._currentRetargetShapeLookup[x]).forEach(function(y){
			tmp.push([x * 1, y * 1]);
		});
	});
	
	this._currentEntry.retargetInfo.shape = tmp;
}

MapAttackUI.prototype.hook = function(){
	let _this = this;
	this._container.querySelector("#close_map_changes").addEventListener("click", function(){
		_this._editorContainer.removeChild(_this._container);
	});	
	
	this._container.querySelector("#apply_map_changes").addEventListener("click", async function(){
		var id;
		if(_this._managedMapAttack == null){			
			var defs = _this._data;
			var ctr = 0;
			while(id == null && ctr < _this._data.length){
				if(!_this._data[ctr]){
					id = ctr;
				}
				ctr++;
			}	
			if(id == null){
				id = _this._data.length;
			}
			_this._data[id] = _this._currentEntry;
		}
		_this.save();
		$mapAttackManager.load();
		await $mapAttackManager.isLoaded();
		if(id != null && _this._callbacks.new){
			_this._callbacks.new(id);
		} else if(_this._callbacks.updated){
			_this._callbacks.updated();
		} else {
			_this._editorContainer.removeChild(_this._container);
		}		
	});	
	
	if(_this._managedMapAttack != null){
		this._container.querySelector("#delete_map_att").addEventListener("click", async function(){
			var c = confirm(EDITORSTRINGS.WEAPON.confirm_remove_MAP);
			if(c){
				_this._data.splice(_this._managedMapAttack, 1);
				_this.save();
				$mapAttackManager.load();
				await $mapAttackManager.isLoaded();
				if(_this._callbacks.deleted){
					_this._callbacks.deleted();
				}
			}
		});
	}
	
	this._container.querySelector("#map_att_name").addEventListener("change", function(){
		_this._currentEntry.name = this.value;
	});	
	
	this._container.querySelector("#lock_att_rotation").addEventListener("change", function(){
		_this._currentEntry.lockRotation = this.checked;
		_this.show();
	});	
	
	this._container.querySelector("#edit_secondary").addEventListener("change", function(){
		_this._editSecondary = this.checked;
		if(!_this._editSecondary){
			_this._chooseCenter = false;
		}
		_this.show();
	});		
	
	this._container.querySelector("#map_choose_retarget_center").addEventListener("click", function(){
		_this._editSecondary = true;
		_this._chooseCenter = !_this._chooseCenter;
		_this.show();
	});	
	
	
	
	this._container.querySelector("#map_att_anim").addEventListener("change", function(){
		_this._currentEntry.animInfo.animId = this.value * 1;
	});	
	
	this._container.querySelector("#map_att_anim_scale").addEventListener("change", function(){
		_this._currentEntry.animInfo.scale = this.value;
	});	
	var controls = this._container.querySelectorAll(".dir_select");
	controls.forEach(function(control){
		control.addEventListener("click", function(){
			_this._currentPreviewDirection = this.getAttribute("data-direction");
			_this.show();
		});
	});	
	
	var controls = this._container.querySelectorAll(".map_att_offset");
	controls.forEach(function(control){
		control.addEventListener("change", function(){
			if(isNaN(this.value)){
				this.value = 0;
			} else {
				var direction = this.getAttribute("data-direction");
				var prop = this.getAttribute("data-prop");
				_this._currentEntry.animInfo.offset[direction][prop] = this.value * 1;
			}			
		});
	});
	
	var controls = this._container.querySelectorAll("#main_shape .block");
	controls.forEach(function(control){
		control.addEventListener("click", function(){
			var column = this.getAttribute("data-column") * 1;
			var row = this.getAttribute("data-row") * 1;
			if(row != 0 || column != 0){
				if(_this._currentShapeLookup[column] && _this._currentShapeLookup[column][row]){
					delete _this._currentShapeLookup[column][row];
				} else {
					if(!_this._currentShapeLookup[column]){
						_this._currentShapeLookup[column] = {};
					}
					_this._currentShapeLookup[column][row] = true;
				}
				_this.packShape();
				_this.show();
			}			
		});
	});
	
	var controls = this._container.querySelectorAll("#sub_shape .block");
	controls.forEach(function(control){
		control.addEventListener("click", function(){
			var column = this.getAttribute("data-column") * 1;
			var row = this.getAttribute("data-row") * 1;
			
			if(_this._chooseCenter){
				_this._currentEntry.retargetInfo.center = {x: column, y: row};
				_this._currentEntry.retargetInfo.initialPosition = {x: column, y: row};
				_this._chooseCenter = false;
			} else {
				if(_this._currentRetargetShapeLookup[column] && _this._currentRetargetShapeLookup[column][row]){
					delete _this._currentRetargetShapeLookup[column][row];
				} else {
					if(!_this._currentRetargetShapeLookup[column]){
						_this._currentRetargetShapeLookup[column] = {};
					}
					_this._currentRetargetShapeLookup[column][row] = true;
				}
				_this.packRetargetShape();					
			}		
			_this.show();				
						
		});
	});
	
	var divs = this._container.querySelectorAll(".portrait_preview");
	divs.forEach(function(div){
		FaceManager.loadFaceByParams(_this._currentEntry.textInfo.faceName, _this._currentEntry.textInfo.faceIdx, div);		
		div.addEventListener("click", async function(e){
			var elem = this;
			let result = await FaceManager.showFaceSelector(e, _this._currentEntry.textInfo.faceName, _this._currentEntry.textInfo.faceIdx, this);
			if(result.status == "updated"){
				_this._currentEntry.textInfo.faceName = result.faceName;
				_this._currentEntry.textInfo.faceIdx = result.faceIndex;
				_this.show();
			}
		});	
	});
	this._container.querySelector("#map_att_text").addEventListener("change", function(){
		_this._currentEntry.textInfo.text = this.value;
	});		
}
