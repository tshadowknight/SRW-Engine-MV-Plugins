import EditorUI from "./EditorUI.js";
import DBList from "./DBList.js";
import MapAttackUI from "./MapAttackUI.js";


export default function WeaponUI(container, mainUIHandler){
	EditorUI.call(this, container, mainUIHandler);
	this._dataFile = "data/MechWeapons.json";
	this._vanillaFile = "data/Weapons.json";
	this._gameVar = "$dataWeapons";
}

WeaponUI.prototype = Object.create(EditorUI.prototype);
WeaponUI.prototype.constructor = WeaponUI;

WeaponUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
	_this._propertyHandlers = {
		name: {
			createControls(entry){
				entry = _this.getCurrentEntry();
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Name";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='prop_name' value='"+entry.name+"'></input>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Editor tag";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='editor_tag' value='"+_this.getMetaValue("editorTag")+"'></input>";
				content+="</div>";
				content+="</div>";
				
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				containerNode.querySelector("#prop_name").addEventListener("change", function(){
					entry.name = this.value;
					_this.show();
					_this._mainUIHandler.setModified();
				});
				containerNode.querySelector("#editor_tag").addEventListener("change", function(){
					_this.setMetaValue("editorTag", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});	
			}
		},
		type: {
			createControls(){							
				var content = "";
				content+="<div title='' class='cell'>";
				content+="Type";
				content+="</div>";
				content+="<div class='cell'>";
				var value = _this.getMetaValue("weaponType");
				if(!value){
					value = "R";
				}
				var options = [
					{name: "Melee", value: "M"},
					{name: "Ranged", value: "R"},
				];
				
				content+="<select id='wep_type_select'>";
				for(var i = 0; i < options.length; i++){				
					content+="<option "+(options[i].value == value ? "selected" : "")+"  value='"+options[i].value+"'>"+options[i].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
								
								
				return content;
			},
			hook(){				
				containerNode.querySelector("#wep_type_select").addEventListener("change", function(){
					_this.setMetaValue("weaponType", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});					
			}
		},
		post_move: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+="Post Move";
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='weapon_post_move' type=checkbox "+(_this.getMetaValue("weaponPostMoveEnabled") * 1 ? "checked" : "")+"></input>";
				content+="</div>";
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#weapon_post_move").addEventListener("change", function(){
					_this.setMetaValue("weaponPostMoveEnabled", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		}, 	
		power: handleDefaultProp("weaponPower", "Power"),		
		min_range: handleDefaultProp("weaponMinRange", "Min Range"),
		range: handleDefaultProp("weaponRange", "Range"),
		terrain: {
			createControls(){
				var content = "";
				content+=_this.createTerrainControls("weaponTerrain");
				return content;
			},
			hook(){
				let entries = containerNode.querySelectorAll(".terrain_container .entry");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var parts = _this.getMetaValue("weaponTerrain").split("");
						var idx = this.getAttribute("data-scoreidx");
						var score = this.getAttribute("data-score");
						parts[idx] = score;
						_this.setMetaValue("weaponTerrain", parts.join(""));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
			}
		},
		ammo: handleDefaultProp("weaponAmmo", "Ammo"),
		EN: handleDefaultProp("weaponEN", "EN"),
		will: handleDefaultProp("weaponWill", "Will"),
		hit_mod: handleDefaultProp("weaponHitMod", "Hit Modifier"),
		crit_mod: handleDefaultProp("weaponCritMod", "Crit Modifier"),
		category: handleDefaultProp("weaponCategory", "Category"),
		attr1: handleDefaultProp("weaponAttribute1", "Primary Attribute"),
		attr2: handleDefaultProp("weaponAttribute2", "Secondary Attribute"),
		upgrade_type: {
			createControls(){
				var content = "";
				var idx = _this.getMetaValue("weaponUpgradeType");
				var options = Object.keys(ENGINE_SETTINGS.WEAPON_UPGRADE_TYPES);
				content+="<div class='cell'>";
				content+="Upgrade Type";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='weapon_upgrade_type'>";
				for(var i = 0; i < options.length; i++){
					content+="<option "+(i == idx ? "selected" : "")+" value='"+i+"'>"+i+"</option>";									
				}				
				content+="</select>";
				
				
				var typeSummary = [];
				var typeData = ENGINE_SETTINGS.WEAPON_UPGRADE_TYPES[options[idx]];
				if(typeData){
					for(var i = 0; i < typeData.length; i++){
						typeSummary.push("Level "+(i+1)+": "+typeData[i]);
					}
					content+="<img title='"+(typeSummary.join("\n"))+"' class='view_type_costs_icon' img src='"+_this._svgPath+"eye-line.svg'>"
				}
				
				content+="</div>";
				
				
				return content;
			},
			hook(){
				containerNode.querySelector("#weapon_upgrade_type").addEventListener("change", function(){
					_this.setMetaValue("weaponUpgradeType", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});	
			}		
		},
		is_counter: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+="Always Counter";
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='weapon_is_counter' type=checkbox "+(_this.getMetaValue("weaponIsCounter") * 1 ? "checked" : "")+"></input>";
				content+="</div>";
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#weapon_is_counter").addEventListener("change", function(){
					_this.setMetaValue("weaponIsCounter", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		}, 
		is_counter_only: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+="Only as Counter";
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='weapon_only_counter' type=checkbox "+(_this.getMetaValue("weaponIsCounterOnly") * 1 ? "checked" : "")+"></input>";
				content+="</div>";
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#weapon_only_counter").addEventListener("change", function(){
					_this.setMetaValue("weaponIsCounterOnly", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		}, 
		hp_tresh: handleDefaultProp("weaponHPThreshold", "HP Treshold"),
		is_all: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+="ALL Weapon";
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='weapon_is_ALL' type=checkbox "+(_this.getMetaValue("weaponIsAll") * 1 ? "checked" : "")+"></input>";
				content+="</div>";
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#weapon_is_ALL").addEventListener("change", function(){
					_this.setMetaValue("weaponIsAll", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		},
		animation: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+="Animation";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='anim_select'>";
				var animData = _this._mainUIHandler.getAnimationDefs();
				var value = _this.getMetaValue("weaponAnimId");
				content+="<option title='' value=''>System Default</option>";
				var options = Object.keys(animData);
				for(var j = 0; j < options.length; j++){					
					content+="<option "+(options[j] == value ? "selected" : "")+" value='"+options[j]+"'>"+animData[options[j]].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#anim_select").addEventListener("change", function(){
					_this.setMetaValue("weaponAnimId", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		},
		effects: {
			createControls(){		
				var abilityDefs = $weaponEffectManager.getDefinitions();
				var content = "";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Only the first two effects are shown in the UI";
				content+="</div>";
				content+="</div>";
				function createEffectControl(idx){					
					var content = "";
					var id = _this.getMetaValue("weaponEffect"+idx);
					if(id == ""){
						id = null;
					}
					
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+="#"+String(idx + 1).padStart(2,0);
					content+="</div>";
					content+="<div class='cell'>";
					content+="<select data-idx='"+idx+"' id='weapon_effect_"+idx+"'>";
					content+="<option title='None' value=''></option>";
					for(var i = 0; i < abilityDefs.length; i++){
						if(abilityDefs[i]){
							content+="<option "+(i == id ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].desc)+"' value='"+i+"'>"+abilityDefs[i].name+"</option>";
						}					
					}
					
					content+="</select>";
					content+="</div>";
					
					content+="</div>";				
					return content;
				}
				content+="<div class=''>";	
				for(var i = 0; i < 10; i++){
					content+=createEffectControl(i);
				}
				content+="</div>";	
				return content;
			},
			hook(){
				for(var i = 0; i < 10; i++){
					containerNode.querySelector("#weapon_effect_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						_this.setMetaValue("weaponEffect"+idx, this.value);
						//_this.show();
						_this._mainUIHandler.setModified();
					});
					
				}
			}
		},
		map_attack: {
			createControls(){		
				var abilityDefs = $mapAttackManager.getDefinitions();
				var content = "";

			
				var id = _this.getMetaValue("weaponMapId");
				if(id == ""){
					id = null;
				}
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				if(id != null){
					content+="Is a Map Attack";
				} else {
					content+="Is a Regular Attack";
				}				
				content+="</div>";
				content+="</div>";
				
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Attack Id";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='map_attack'>";
				content+="<option title='None' value=''></option>";
				for(var i = 0; i < abilityDefs.length; i++){
					if(abilityDefs[i]){
						content+="<option "+(i == id ? "selected" : "")+"  value='"+i+"'>"+String(i).padStart(3, "0")+" "+abilityDefs[i].name+"</option>";
					}					
				}
				
				content+="</select>";
				content+="</div>";
				content+="<div class='cell'>";
				if(id == null){
					content+="<button id='edit_map_attack'>New</button>";
				} else {
					content+="<button id='edit_map_attack'>Edit</button>";
				}
				
				content+="</div>";
				
				content+="</div>";		
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Ignore Friendlies";
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='map_ignore_friendlies' type=checkbox "+(_this.getMetaValue("weaponIgnoresFriendlies") * 1 ? "checked" : "")+"></input>";
				content+="</div>";	
				
				content+="<div class='cell'>";
				content+="</div>";
					
				content+="</div>";		
				
				return content;
			},
			hook(){
				
				containerNode.querySelector("#map_attack").addEventListener("change", function(){
					var idx = this.getAttribute("data-idx");
					_this.setMetaValue("weaponMapId", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#edit_map_attack").addEventListener("click", function(){
					var mapAttackId = _this.getMetaValue("weaponMapId");
					if(mapAttackId == ""){
						mapAttackId = null;
					}					
					new MapAttackUI(_this._container, mapAttackId, _this, {
						"new": function(id){
							_this.setMetaValue("weaponMapId", id);
							_this.show();
							_this._mainUIHandler.setModified();
						},
						"updated": function(){							
							_this.show();
							_this._mainUIHandler.setModified();
						},
						"deleted": function(){							
							_this.setMetaValue("weaponMapId", "");
							_this.show();
							_this._mainUIHandler.setModified();
						},
					}).show();
				});				
				
			}
		},
		ignore_friendlies: {
			createControls(){		
				var content = "";			

				
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#map_ignore_friendlies").addEventListener("change", function(){
					_this.setMetaValue("weaponIgnoresFriendlies", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});				
			}
		}, 	
		combo_properties: {
			createControls(){							
				var content = "";
				
				content+="<div class='table'>";	
				content+="<div class='row'>";	
		
				content+="<div title='' class='cell'>";
				content+="Type";
				content+="</div>";
				content+="<div class='cell'>";
				var value = _this.getMetaValue("weaponComboType");
				var options = [
					{name: "Adjacent", value: "0"},
					{name: "On Map", value: "1"},
				];
				content+="<select id='combo_type_select'>";
				for(var i = 0; i < options.length; i++){				
					content+="<option "+(options[i].value == value ? "selected" : "")+"  value='"+options[i].value+"'>"+options[i].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
		
				content+="<div title='' class='cell'>";
				content+="Required Weapons";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transformation_scroll'>";
				content+="<div class='table'>";
				
				var value = JSON.parse(_this.getMetaValue("weaponComboWeapons") || "[]");
				var abilityDefs = $dataWeapons;
				for(var i = 0; i < value.length; i++){			
				
					content+="<div class='row'>";	
					content+="<div class='cell'>";					
					content+="<select data-idx='"+i+"' class='combo_weapon_select'>";
					content+="<option title='None' value=''></option>";
					for(var j = 1; j < abilityDefs.length; j++){
						if(abilityDefs[j]){
							content+="<option "+(j == value[i] ? "selected" : "")+" title='"+abilityDefs[j].description+"' value='"+j+"'>"+abilityDefs[j].name+"</option>";
						}					
					}
					
					content+="</select>";
					
					content+="</div>";
			
					content+="<div class='cell'>";
					content+="<img class='remove_combo_weapon remove_button' data-idx='"+i+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="</div>";
				}
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transform_list_controls'>";
				content+="<button id='add_combo_weapon'>Add</button>";
				content+="</div>";
				
				content+="</div>";
								
								
				return content;
			},
			hook(){				
				containerNode.querySelector("#combo_type_select").addEventListener("change", function(){
					_this.setMetaValue("weaponComboType", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});				

				containerNode.querySelector("#add_combo_weapon").addEventListener("click", function(){
					var value = JSON.parse(_this.getMetaValue("weaponComboWeapons") || "[]");
					value.push("");
					_this.setMetaValue("weaponComboWeapons", JSON.stringify(value));
					_this.show();
					_this._mainUIHandler.setModified();
				});	
				
				let entries = containerNode.querySelectorAll(".remove_combo_weapon");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("weaponComboWeapons") || "[]");
						value.splice(idx, 1);
					
						_this.setMetaValue("weaponComboWeapons", JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".combo_weapon_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("weaponComboWeapons") || "[]");
						value[idx] = this.value;			
						_this.setMetaValue("weaponComboWeapons", JSON.stringify(value));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
			}
		},
	};	
	
	var terrains = [
		{type: "AIR", prop: "mechAirEnabled"},
		{type: "LND",  prop: "mechLandEnabled"},
		{type: "SEA",  prop: "mechWaterEnabled"},
		{type: "SPC", prop: "mechSpaceEnabled"}
	];
	
	function handleDefaultProp(prop, name){
		return {
			createControls(){
				var content = "";
				content+=_this.createValueInput(prop, name);
				return content;
			},
			hook(){
				containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
					_this.setMetaValue(prop, this.value);
					_this._mainUIHandler.setModified();
				});
			}
		};
	}
}



WeaponUI.prototype.show = async function(){
	let _this = this;
	_this.loadData();
	var listScroll = 0;
	if(this._dbList){
		listScroll = this._dbList.getScroll();
	}
	var currentScroll;
	var scrollContainer = document.querySelector(".edit_pane .main_info");
	if(scrollContainer){
		currentScroll = scrollContainer.scrollTop;
	}
	
	var currentEntry = this.getCurrentEntry();
	var content = "";
	content+="<div class='editor_ui'>";
	content+="<div class='list_pane'>";
	
	content+="</div>";
	content+="<div class='edit_pane'>";
	content+="<div class='controls'>";
	content+="<button class='cancel'>Cancel</button>";
	content+="<button class='save'>Save</button>";	
	content+="</div>";
	content+="<div class='main_info'>";
	content+="<div class='row'>";
	
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="General";	
	content+="</div>";
	content+="<div class='content'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.name.createControls();
	content+="<div class='row '>";
	content+=_this._propertyHandlers.animation.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.type.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.post_move.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.power.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.range.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.min_range.createControls();
	content+="</div>";
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.terrain.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.upgrade_type.createControls();
	content+="</div>";
	content+="</div>";
	
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Attributes";	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	
	content+="<div class='table sub_section'>";		
	
	content+="<div class='row numeric'>";
	content+="<div class='cell'>";
	content+="-1 means no cost or requirement";
	content+="</div>";
	content+="</div>";
	content+="<div class='table' style='width: 100%;'>";
	
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.EN.createControls();	
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.ammo.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.will.createControls();
	content+="</div>";	
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='table sub_section'>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.hit_mod.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.crit_mod.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.hp_tresh.createControls();
	content+="</div>";	
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.is_counter.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.is_counter_only.createControls();
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.is_all.createControls();
	content+="</div>";
	content+="<div class='row '>";
	content+=_this._propertyHandlers.category.createControls();
	content+="</div>";
	content+="<div class='row '>";
	content+=_this._propertyHandlers.attr1.createControls();
	content+="</div>";
	content+="<div class='row '>";
	content+=_this._propertyHandlers.attr2.createControls();
	content+="</div>";
	
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	content+="</div>";
	content+="<div class='row'>";
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Effects";	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	content+="<div class='table'>";		
	content+=_this._propertyHandlers.effects.createControls();
	content+="</div>";	
	
	
	content+="</div>";	
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Map Attack";	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	content+="<div class='table'>";		
	
	content+=_this._propertyHandlers.map_attack.createControls();
	;	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.ignore_friendlies.createControls();
	content+="</div>";	
	content+="</div>";	
	
	
	content+="</div>";
	content+="</div>";	
	content+="</div>";
	
	content+="<div class='row'>";
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Combo Attack";	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	
	content+=_this._propertyHandlers.combo_properties.createControls();

	
	
		
	content+="</div>";
	content+="</div>";
	
	content+="</div>";	
	content+="</div>";
	
	
	this._container.innerHTML = content;
	var search = "";
	if(this._dbList){
		search = this._dbList.getSearch();
	}
	this._dbList = new DBList(
		this._container.querySelector(".list_pane"), 
		this._data, 
		this,
		{
			selected: function(id){
				_this._currentId = id;
				_this.show();
			},
			countChanged: function(amount){
				
				var tmp = [];
				for(var i = 0; i < amount + 1; i++){
					let blankEntry = _this.getEmpty(i);
					tmp.push(_this._data[i] || blankEntry);
				}
				_this._data = tmp;
				_this.show();
				_this._mainUIHandler.setModified();
			}
		}
	);
	this._dbList.setSearch(search);
	this._dbList.show(_this._currentId);
	if(listScroll){
		this._dbList.setScroll(listScroll);
	}
	
	document.querySelector(".edit_pane .main_info").scrollTop = currentScroll;
	this.hook();
	
}


WeaponUI.prototype.hook = function(){
	let _this = this;
	_this._container.querySelector(".edit_pane .controls .save").addEventListener("click", function(){
		_this.save();
		_this._mainUIHandler.clearModified();
	});
	
	_this._container.querySelector(".edit_pane .controls .cancel").addEventListener("click", function(){
		var c = true;
		if(_this._mainUIHandler.isModified()){
			c = confirm("Discard all unsaved changes?");
		}
		if(c){
			_this._data = null;
			_this.show();	
			_this._mainUIHandler.clearModified();
		}		
	});
	var currentEntry = this.getCurrentEntry();
	Object.keys(_this._propertyHandlers).forEach(function(prop){
		_this._propertyHandlers[prop].hook(currentEntry);
	});	
	_this.hookPageControls();
}



WeaponUI.prototype.hookPageControls = function(){
	let _this = this;
	/*_this._container.querySelector("#abi_page_left").addEventListener("click", function(){
		if(_this._currentAbiPage > 0){
			_this._currentAbiPage--;
		}		
		_this.show();	
	});
	
	_this._container.querySelector("#abi_page_right").addEventListener("click", function(){
		if(_this._currentAbiPage < 19){
			_this._currentAbiPage++;
		}		
		_this.show();	
	});*/
	
}
			
WeaponUI.prototype.getEmpty = function(id){
	return {
	  "id": id,
	  "learnings": [],
	  "name": "",
	  "note": "",
	  "meta": {}
	};
}			
		