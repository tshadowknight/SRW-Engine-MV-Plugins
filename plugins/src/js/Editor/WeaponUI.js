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
				content+=EDITORSTRINGS.GENERAL.label_name;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='prop_name' value='"+entry.name+"'></input>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.GENERAL.label_editor_tag;
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
				content+=EDITORSTRINGS.WEAPON.label_type;
				content+="</div>";
				content+="<div class='cell'>";
				var value = _this.getMetaValue("weaponType");
				if(!value){
					value = "R";
				}
				var options = [
					{name: EDITORSTRINGS.WEAPON.label_melee, value: "M"},
					{name: EDITORSTRINGS.WEAPON.label_ranged, value: "R"},
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
				content+=EDITORSTRINGS.WEAPON.label_post_move;
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
		power: handleDefaultProp("weaponPower", EDITORSTRINGS.WEAPON.label_power),		
		min_range: handleDefaultProp("weaponMinRange", EDITORSTRINGS.WEAPON.label_min_range),
		range: handleDefaultProp("weaponRange", EDITORSTRINGS.WEAPON.label_range),
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
		ammo: handleDefaultProp("weaponAmmo", EDITORSTRINGS.WEAPON.label_ammo),
		EN: handleDefaultProp("weaponEN", EDITORSTRINGS.WEAPON.label_EN),
		MP: handleDefaultProp("weaponMP", EDITORSTRINGS.WEAPON.label_MP),
		will: handleDefaultProp("weaponWill", EDITORSTRINGS.WEAPON.label_will),
		hit_mod: handleDefaultProp("weaponHitMod", EDITORSTRINGS.WEAPON.label_hit_mod),
		crit_mod: handleDefaultProp("weaponCritMod", EDITORSTRINGS.WEAPON.label_crit_mod),
		category: handleDefaultProp("weaponCategory", EDITORSTRINGS.WEAPON.label_category),
		attr1: handleDefaultProp("weaponAttribute1", EDITORSTRINGS.WEAPON.label_primary_attr),
		attr2: handleDefaultProp("weaponAttribute2", EDITORSTRINGS.WEAPON.label_secondary_attr),
		invalid_tags: handleDefaultProp("weaponInvalidTags", EDITORSTRINGS.WEAPON.label_invalid_target_tags),
		upgrade_type: {
			createControls(){
				var content = "";
				var idx = _this.getMetaValue("weaponUpgradeType") || 0;
				var options = Object.keys(ENGINE_SETTINGS.WEAPON_UPGRADE_TYPES);
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_upgrade_type;
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
				content+=EDITORSTRINGS.WEAPON.label_always_counter;
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
				content+=EDITORSTRINGS.WEAPON.label_only_counter;
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
		hp_tresh: handleDefaultProp("weaponHPThreshold", EDITORSTRINGS.WEAPON.label_HP_treshold),
		is_all: {
			createControls(){		
				var content = "";			

				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_ALL;
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
				content+="<div class='table sub_section'>";	
				content+="<div class='row '>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_animation;
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
				content+="</div>";
				
				
				content+="<div class='row '>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_animation_ally;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='anim_ally_select'>";
				var animData = _this._mainUIHandler.getAnimationDefs();
				var value = _this.getMetaValue("weaponVSAllyAnimId");
				content+="<option title='' value=''>System Default</option>";
				var options = Object.keys(animData);
				for(var j = 0; j < options.length; j++){					
					content+="<option "+(options[j] == value ? "selected" : "")+" value='"+options[j]+"'>"+animData[options[j]].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='table sub_section'>";	
				
				content+="<div class='row '>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_basic_animation;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='anim_bb_select'>";
				var value = _this.getMetaValue("weaponBBAnimId");
				content+="<option title='' value='-1'>None</option>";
				var options = $dataAnimations;
				for(var j = 1; j < options.length; j++){					
					content+="<option "+(options[j].id == value ? "selected" : "")+" value='"+options[j].id+"'>"+String(j).padStart(4, "0")+" "+options[j].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBAnimId_scale", EDITORSTRINGS.WEAPON.label_basic_animation_scale, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBAnimId_rate", EDITORSTRINGS.WEAPON.label_basic_animation_rate, "", EDITORSTRINGS.WEAPON.label_frames);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBAnimId_XOff", EDITORSTRINGS.WEAPON.label_basic_animation_x_off, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBAnimId_YOff", EDITORSTRINGS.WEAPON.label_basic_animation_y_off, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='table sub_section'>";	
				
				content+="<div class='row '>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_basic_animation_ally;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='anim_bb_ally_select'>";
				var value = _this.getMetaValue("weaponBBVSAllyAnimId");
				content+="<option title='' value='-1'>None</option>";
				var options = $dataAnimations;
				for(var j = 1; j < options.length; j++){					
					content+="<option "+(options[j].id == value ? "selected" : "")+" value='"+options[j].id+"'>"+String(j).padStart(4, "0")+" "+options[j].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBVSAllyAnimId_scale", EDITORSTRINGS.WEAPON.label_basic_animation_scale_ally, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBVSAllyAnimId_rate", EDITORSTRINGS.WEAPON.label_basic_animation_rate, "", EDITORSTRINGS.WEAPON.label_frames);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBVSAllyAnimId_XOff", EDITORSTRINGS.WEAPON.label_basic_animation_x_off, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="<div class='row '>";
				content+=_this.createValueInput("weaponBBVSAllyAnimId_YOff", EDITORSTRINGS.WEAPON.label_basic_animation_y_off, "", EDITORSTRINGS.WEAPON.label_percent);
				content+="</div>";
				
				content+="</div>";
				
				return content;				
			},
			hook(){
				
				containerNode.querySelector("#anim_select").addEventListener("change", function(){
					_this.setMetaValue("weaponAnimId", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	
				containerNode.querySelector("#anim_ally_select").addEventListener("change", function(){
					_this.setMetaValue("weaponVSAllyAnimId", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});		

				containerNode.querySelector("#anim_bb_select").addEventListener("change", function(){
					_this.setMetaValue("weaponBBAnimId", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});		
				containerNode.querySelector("#anim_bb_ally_select").addEventListener("change", function(){
					_this.setMetaValue("weaponBBVSAllyAnimId", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	
				
				const handledProps = [
					"weaponBBVSAllyAnimId_scale",
					"weaponBBAnimId_scale",
					"weaponBBAnimId_rate",
					"weaponBBVSAllyAnimId_rate",
					"weaponBBAnimId_XOff",
					"weaponBBVSAllyAnimId_XOff",
					"weaponBBAnimId_YOff",
					"weaponBBVSAllyAnimId_YOff"
				];
				
				for(const prop of handledProps){
					containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
						_this.setMetaValue(prop, this.value);
						_this._mainUIHandler.setModified();
					});
				}			
			}
		},
		effects: {
			createControls(){		
				var abilityDefs = $weaponEffectManager.getDefinitions();
				var content = "";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.hint_effects;
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
					
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.WEAPON.label_affects;
					content+="</div>";
						
					content+="<div class='cell'>";
					var targetSetting = _this.getMetaValue("weaponEffectTargeting"+idx);
					var options = [
						{name: EDITORSTRINGS.WEAPON.label_target_both, value: "all"},
						{name: EDITORSTRINGS.WEAPON.label_target_enemies, value: "enemy"},
						{name: EDITORSTRINGS.WEAPON.label_target_allies, value: "ally"},
					];
					
					content+="<select data-idx='"+idx+"' id='weapon_effect_target_"+idx+"'>";
					for(var i = 0; i < options.length; i++){						
						content+="<option "+(options[i].value == targetSetting ? "selected" : "")+" value='"+options[i].value+"'>"+options[i].name+"</option>";								
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
					containerNode.querySelector("#weapon_effect_target_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						_this.setMetaValue("weaponEffectTargeting"+idx, this.value);
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
					content+=EDITORSTRINGS.WEAPON.hint_is_map;
				} else {
					content+=EDITORSTRINGS.WEAPON.hint_is_regular;
				}				
				content+="</div>";
				content+="</div>";
				
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_attack_id;
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
				content+=EDITORSTRINGS.WEAPON.label_ignore_friendlies;
				content+="</div>";	
				content+="<div class='cell'>";
				let ignoresFriendlies = _this.getMetaValue("weaponIgnoresFriendlies");
				if(ignoresFriendlies == null || ignoresFriendlies == ""){
					ignoresFriendlies = 1;
				}
				content+="<input id='map_ignore_friendlies' type=checkbox "+(!(ignoresFriendlies * 1) ? "checked" : "")+"></input>";
				content+="</div>";	
				
				content+="<div class='cell'>";
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_allies_interaction;
				content+="</div>";	
				content+="<div class='cell'>";
				var interactionType = _this.getMetaValue("weaponAllyInteraction");
				
				var options = [
					{name: EDITORSTRINGS.WEAPON.label_damage_and_status, value: "damage_and_status"},
					{name: EDITORSTRINGS.WEAPON.label_status_only, value: "status"},
					{name: EDITORSTRINGS.WEAPON.label_damage_only, value: "damage"},
				];
				
				content+="<select id='wep_ally_interaction'>";
				for(var i = 0; i < options.length; i++){				
					content+="<option "+(options[i].value == interactionType ? "selected" : "")+"  value='"+options[i].value+"'>"+options[i].name+"</option>";										
				}
				
				content+="</select>";
				
				content+="</div>";	
				
				content+="<div class='cell'>";
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_allies_counter;
				content+="</div>";	
				content+="<div class='cell'>";
				let alliesCounter = _this.getMetaValue("weaponAlliesCounter");
				if(alliesCounter == null || alliesCounter == ""){
					alliesCounter = true;
				}
	
				content+="<input id='wep_allies_counter' type=checkbox "+((alliesCounter * 1) ? "checked" : "")+"></input>";
				content+="</div>";	
				
				content+="<div class='cell'>";
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_hit_enemies;
				content+="</div>";	
				content+="<div class='cell'>";
				content+="<input id='map_ignore_enemies' type=checkbox "+(!(_this.getMetaValue("weaponIgnoresEnemies") * 1) ? "checked" : "")+"></input>";
				content+="</div>";	
				
				content+="<div class='cell'>";
				content+="</div>";
					
				content+="</div>";	

				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_enemies_interaction;
				content+="</div>";	
				content+="<div class='cell'>";
				var interactionType = _this.getMetaValue("weaponEnemyInteraction");
				
				var options = [
					{name: EDITORSTRINGS.WEAPON.label_damage_and_status, value: "damage_and_status"},
					{name: EDITORSTRINGS.WEAPON.label_status_only, value: "status"},
					{name: EDITORSTRINGS.WEAPON.label_damage_only, value: "damage"},
				];
				
				content+="<select id='wep_enemy_interaction'>";
				for(var i = 0; i < options.length; i++){				
					content+="<option "+(options[i].value == interactionType ? "selected" : "")+"  value='"+options[i].value+"'>"+options[i].name+"</option>";										
				}
				
				content+="</select>";
				
				content+="</div>";	
				content+="<div class='cell'>";
				content+="</div>";
				
				content+="</div>";
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_enemies_counter;
				content+="</div>";
				content+="<div class='cell'>";
				let enemiesCounter = _this.getMetaValue("weaponEnemiesCounter");
				if(enemiesCounter == null || enemiesCounter == ""){
					enemiesCounter = true;
				}
	
				content+="<input id='wep_enemies_counter' type=checkbox "+((enemiesCounter * 1) ? "checked" : "")+"></input>";
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
					_this.setMetaValue("weaponIgnoresFriendlies", this.checked ? 0 : 1);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	

				containerNode.querySelector("#map_ignore_enemies").addEventListener("change", function(){
					_this.setMetaValue("weaponIgnoresEnemies", this.checked ? 0 : 1);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	

				containerNode.querySelector("#wep_ally_interaction").addEventListener("change", function(){
					_this.setMetaValue("weaponAllyInteraction", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	

				containerNode.querySelector("#wep_enemy_interaction").addEventListener("change", function(){
					_this.setMetaValue("weaponEnemyInteraction", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	

				containerNode.querySelector("#wep_allies_counter").addEventListener("change", function(){
					_this.setMetaValue("weaponAlliesCounter", this.checked ? 1 : 0);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	

				containerNode.querySelector("#wep_enemies_counter").addEventListener("change", function(){
					_this.setMetaValue("weaponEnemiesCounter", this.checked ? 1 : 0);
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
				content+=EDITORSTRINGS.WEAPON.label_combo_type;
				content+="</div>";
				content+="<div class='cell'>";
				var value = _this.getMetaValue("weaponComboType");
				var options = [
					{name: EDITORSTRINGS.WEAPON.label_adjacent, value: "0"},
					{name: EDITORSTRINGS.WEAPON.label_on_map, value: "1"},
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
				content+=EDITORSTRINGS.WEAPON.label_required_weapons;
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
		costType: {
			createControls(){
				var content = "";
				var idx = _this.getMetaValue("weaponCostType") || 0;
				var options = Object.keys(ENGINE_SETTINGS.COST_TYPES.WEAPON);
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.WEAPON.label_cost_type;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='weapon_cost_type'>";
				for(var i = 0; i < options.length; i++){
					content+="<option "+(i == idx ? "selected" : "")+" value='"+i+"'>"+i+"</option>";									
				}				
				content+="</select>";
				
				
				var typeSummary = [];
				var typeData = ENGINE_SETTINGS.COST_TYPES.WEAPON[options[idx]];
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
				containerNode.querySelector("#weapon_cost_type").addEventListener("change", function(){
					_this.setMetaValue("weaponCostType", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});	
			}		
		},
		weight: handleDefaultProp("weaponWeight", EDITORSTRINGS.WEAPON.label_weight),
		bannedMechs: handleDefaultProp("weaponBannedOn", EDITORSTRINGS.WEAPON.label_banned_mechs),
		allowedMechs: handleDefaultProp("weaponAllowedOn", EDITORSTRINGS.WEAPON.label_allowed_mechs),
		alias: {
			createControls(){		
				var content = "";			

				var abilityDefs = $dataWeapons;
				var value = _this.getMetaValue("weaponTextAlias");
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.MECH.lavel_text_alias;
				content+="</div>";
				content+="<div class='cell'>";
				
				content+="<select id='weapon_text_alias'>";
				content+="<option title='None' value='-1'></option>";
				for(var i = 1; i < abilityDefs.length; i++){
					if(abilityDefs[i]){
						content+="<option "+(i == value ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].description)+"' value='"+i+"'>["+String(i).padStart(3, "0")+"] "+abilityDefs[i].name+"</option>";
					}					
				}
				content+="</select>";
				content+="</div>";
				content+="</div>";
				return content;				
			},
			hook(){				
				containerNode.querySelector("#weapon_text_alias").addEventListener("change", function(){
					_this.setMetaValue("weaponTextAlias", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
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
	content+="<button class='cancel'>"+EDITORSTRINGS.GENERAL.label_cancel+"</button>";
	content+="<button class='save'>"+EDITORSTRINGS.GENERAL.label_save+"</button>";	
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

	content+=_this._propertyHandlers.alias.createControls();

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
	content+="<div class='row'>";
	content+=_this._propertyHandlers.invalid_tags.createControls();
	content+="</div>";
	content+="</div>";
	
	
	
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.WEAPON.label_attributes;	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	
	content+="<div class='table sub_section'>";		
	
	content+="<div class='row numeric'>";
	content+="<div class='cell'>";
	content+=EDITORSTRINGS.WEAPON.hint_no_cost;	
	content+="</div>";
	content+="</div>";
	content+="<div class='table' style='width: 100%;'>";
	
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.EN.createControls();	
	content+="</div>";
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.MP.createControls();
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
	content+=EDITORSTRINGS.WEAPON.label_effects;	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	content+="<div class='table'>";		
	content+=_this._propertyHandlers.effects.createControls();
	content+="</div>";	
	
	
	content+="</div>";	
	content+="</div>";
	
	
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.WEAPON.label_animation;	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	content+="<div class='table'>";		
	content+=_this._propertyHandlers.animation.createControls();
	content+="</div>";	
	
	
	content+="</div>";	
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.WEAPON.label_map_attack;	
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
	content+=EDITORSTRINGS.WEAPON.label_combo_attack;	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	
	content+=_this._propertyHandlers.combo_properties.createControls();

	
	
		
	content+="</div>";
	
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.WEAPON.label_equipable;	
	content+="</div>";
	content+="<div class='content' style='display: block;'>";
	content+="<div class='table'>";	
	content+="<div class='row '>";
	content+=_this._propertyHandlers.costType.createControls();
	content+="</div>";
	
	content+="<div class='row numeric'>";
	content+=_this._propertyHandlers.weight.createControls();
	content+="</div>";
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.bannedMechs.createControls();
	content+="</div>";
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.allowedMechs.createControls();
	content+="</div>";
	
	content+="</div>";
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
			c = confirm(EDITORSTRINGS.GENERAL.confirm_discard_unchaged);
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
		