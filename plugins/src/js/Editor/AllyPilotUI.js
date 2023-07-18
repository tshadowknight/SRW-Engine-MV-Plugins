import EditorUI from "./EditorUI.js";
import DBList from "./DBList.js";
import FaceManager from "./FaceManager.js";
import OverworldSpriteManager from "./OverworldSpriteManager";

export default function AllyPilotUI(container, mainUIHandler){
	EditorUI.call(this, container, mainUIHandler);
	this._dataFile = "data/AllyPilots.json";
	this._vanillaFile = "data/Actors.json";
	this._gameVar = "$dataActors";
	this._currentAbiPage = 0;
	this._abiPageSize = 10;
	
	this._currentRelPage = 0;
	this._relPageSize = 10;
}

AllyPilotUI.prototype = Object.create(EditorUI.prototype);
AllyPilotUI.prototype.constructor = AllyPilotUI;

AllyPilotUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
	_this._propertyHandlers = {
		face: {
			createControls(entry){
				return "<div class='portrait_preview unit_img_preview'></div>";
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				function updatePortraitPreviews(){
					var divs = containerNode.querySelectorAll(".portrait_preview");
					divs.forEach(function(div){
						FaceManager.loadFaceByParams(entry.faceName, entry.faceIndex, div);
					});
				}
				updatePortraitPreviews();
				
				var divs = containerNode.querySelectorAll(".portrait_preview");
				divs.forEach(function(div){
					div.addEventListener("click", async function(e){
						var elem = this;
						let result = await FaceManager.showFaceSelector(e, entry.faceName, entry.faceIndex, this);
						if(result.status == "updated"){
							entry.faceName = result.faceName;
							entry.faceIndex = result.faceIndex;
							_this.show();
							_this._mainUIHandler.isModified();
						}
					});			
				});
			}			
		},
		name: {
			createControls(entry){
				entry = _this.getCurrentEntry();
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_name;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='prop_name' value='"+entry.name+"'></input>";
				
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_use_mech_name;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='use_classname' type=checkbox "+(_this.getMetaValue("pilotUsesClassName")*1 ? "checked" : "")+"></input>";
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
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_stats_label;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='stats_name' value='"+_this.getMetaValue("pilotStatsLabel")+"'></input>";
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
				containerNode.querySelector("#use_classname").addEventListener("change", function(){
					_this.setMetaValue("pilotUsesClassName", this.checked ? 1 : 0);
					_this.show();
					_this._mainUIHandler.setModified();
				});
				containerNode.querySelector("#editor_tag").addEventListener("change", function(){
					_this.setMetaValue("editorTag", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});		
				containerNode.querySelector("#stats_name").addEventListener("change", function(){
					_this.setMetaValue("pilotStatsLabel", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});					
			}
		},
		default_mech: {
			createControls(entry){
				entry = _this.getCurrentEntry();
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_default_mech;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='prop_default_mech'>";
				for(var i = 1; i < $dataClasses.length; i++){
					content+="<option "+(i == entry.classId ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataClasses[i].name+"</option>";
				}
				content+="</select>";
				content+="</div>";
				content+="</div>";
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				containerNode.querySelector("#prop_default_mech").addEventListener("change", function(){
					entry.classId = this.value;
					_this._mainUIHandler.setModified();
				});
			}
		},
		stats: {
			createControls(entry){
				function createGrowthControls(prop){
					var content = "";
					var value = _this.getMetaValue(prop);
					var parts = value.split(",");
					var type = parts.length > 1 ? "curve" : "flat";
					content+="<div class='cell'>";
					content+="<select id='prop_curve_"+prop+"'>";
					
					content+="<option "+(type == "flat" ? "selected" : "")+" value='flat'>flat</option>";
					content+="<option "+(type == "curve" ? "selected" : "")+" value='curve'>curve</option>";
					
					content+="</select>";
					content+="</div>";
					
					if(type == "flat"){
						content+="<div class='cell'>";
						content+=EDITORSTRINGS.PILOT.label_rate;
						content+="</div>";
						content+="<div class='cell'>";
						content+="<input id='prop_"+prop+"_flat_rate' value='"+parts[0]+"'></input>";
						content+="</div>";
						
						content+="<div class='cell'>";				
						content+="</div>";
						content+="<div class='cell'>";
						content+="</div>";
					} else {
						content+="<div class='cell'>";
						content+=EDITORSTRINGS.PILOT.label_rate;
						content+="</div>";
						content+="<div class='cell'>";
						content+="<input id='prop_"+prop+"_curve_rate' value='"+parts[1]+"'></input>";
						content+="</div>";
						
						content+="<div class='cell'>";
						content+=EDITORSTRINGS.PILOT.label_max;
						content+="</div>";
						content+="<div class='cell'>";
						content+="<input id='prop_"+prop+"_curve_max' value='"+parts[0]+"'></input>";
						content+="</div>";
					}
					return content;
				}
				var content = "";
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseSP", EDITORSTRINGS.PILOT.label_SP);
				content+=createGrowthControls("pilotSPGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseMP", EDITORSTRINGS.PILOT.label_MP);
				content+=createGrowthControls("pilotMPGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseMelee", EDITORSTRINGS.PILOT.label_melee);
				content+=createGrowthControls("pilotMeleeGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseRanged", EDITORSTRINGS.PILOT.label_ranged);
				content+=createGrowthControls("pilotRangedGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseSkill", EDITORSTRINGS.PILOT.label_skill);
				content+=createGrowthControls("pilotSkillGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseDefense", EDITORSTRINGS.PILOT.label_defense);
				content+=createGrowthControls("pilotDefenseGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseEvade", EDITORSTRINGS.PILOT.label_evade);
				content+=createGrowthControls("pilotEvadeGrowth");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("pilotBaseHit", EDITORSTRINGS.PILOT.label_hit);
				content+=createGrowthControls("pilotHitGrowth");
				content+="</div>";
				return content;
			},
			hook(entry){
				let hookedProperties = [
					"pilotBaseSP",
					"pilotBaseMP",
					"pilotBaseMelee",
					"pilotBaseRanged",
					"pilotBaseSkill",
					"pilotBaseDefense",
					"pilotBaseEvade",
					"pilotBaseHit"					
				];
				hookedProperties.forEach(function(prop){
					containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
						let value = this.value;
						if(!isNaN(value)){
							_this.setMetaValue(prop, this.value);
							_this._mainUIHandler.setModified();
						} else {
							this.value = "";
						}						
					});
				});
				
				hookedProperties = [
					"pilotSPGrowth",
					"pilotMPGrowth",
					"pilotMeleeGrowth",
					"pilotRangedGrowth",
					"pilotSkillGrowth",
					"pilotDefenseGrowth",
					"pilotEvadeGrowth",
					"pilotHitGrowth"					
				];
				hookedProperties.forEach(function(prop){
					containerNode.querySelector("#prop_curve_"+prop).addEventListener("change", function(){
						let value = this.value;
						if(value == "flat"){
							_this.setMetaValue(prop, 0);
						} else {
							_this.setMetaValue(prop, "0,0");
						}
						_this.show();
						_this._mainUIHandler.setModified();							
					});
					var flatRate = containerNode.querySelector("#prop_"+prop+"_flat_rate");
					if(flatRate){
						flatRate.addEventListener("change", function(){
							let value = this.value;
							if(!isNaN(value)){
								_this.setMetaValue(prop, this.value);
								_this._mainUIHandler.setModified();
							} else {
								this.value = "";
							}						
						});
					}
					var curveRate = containerNode.querySelector("#prop_"+prop+"_curve_rate");
					var curveMax = containerNode.querySelector("#prop_"+prop+"_curve_max");
					if(curveRate && curveMax){
						curveRate.addEventListener("change", function(){
							var current = _this.getMetaValue(prop);
							var parts = current.split(",");							
							let value = this.value;
							if(!isNaN(value)){
								parts[1] = value;
								_this.setMetaValue(prop, parts.join(","));
								_this._mainUIHandler.setModified();
							} else {
								this.value = "";
							}						
						});
						curveMax.addEventListener("change", function(){
							var current = _this.getMetaValue(prop);
							var parts = current.split(",");							
							let value = this.value;
							if(!isNaN(value)){
								parts[0] = value;
								_this.setMetaValue(prop, parts.join(","));
								_this._mainUIHandler.setModified();
							} else {
								this.value = "";
							}						
						});
					}
				});
			}
		},
		//species: handleDefaultProp("pilotSpecies", "Species"),
		terrain: {
			createControls(){
				var content = "";
				content+=_this.createTerrainControls("pilotTerrain");
				return content;
			},
			hook(){
				let entries = containerNode.querySelectorAll(".terrain_container .entry");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var parts = _this.getMetaValue("pilotTerrain").split("");
						var idx = this.getAttribute("data-scoreidx");
						var score = this.getAttribute("data-score");
						parts[idx] = score;
						_this.setMetaValue("pilotTerrain", parts.join(""));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
			}
		},
		exp_yield: handleDefaultProp("pilotExpYield", EDITORSTRINGS.PILOT.label_exp_yield),
		pp_yield: handleDefaultProp("pilotPPYield", EDITORSTRINGS.PILOT.label_pp_yield),
		tags: handleDefaultProp("pilotTags", EDITORSTRINGS.PILOT.label_tags),
		target_formula: handleDefaultProp("pilotTargetingFormula", EDITORSTRINGS.PILOT.label_target_formula),
		text_alias:{
			createControls(){
	
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_text_alias;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='prop_text_alias'>";
				const value = _this.getMetaValue("pilotTextAlias");
				content+="<option "+(value == -1 ? "selected" : "")+" value='-1'>None</option>";
				for(var i = 1; i < $dataActors.length; i++){
					content+="<option "+(i == value ? "selected" : "")+" value='"+i+"'>"+(String(i).padStart(4, 0))+" "+$dataActors[i].name+"</option>";
				}
				content+="</select>";
				content+="</div>";
				content+="</div>";
				return content;
			},
			hook(){
				containerNode.querySelector("#prop_text_alias").addEventListener("change", function(){
					_this.setMetaValue("pilotTextAlias", this.value);
					_this._mainUIHandler.setModified();
				});
			}
		},
		attribute1: handleDefaultProp("pilotAttribute1",  EDITORSTRINGS.MECH.label_attribute1),
		attribute2: handleDefaultProp("pilotAttribute2",  EDITORSTRINGS.MECH.label_attribute2),
		spirits: {
			createControls(){		
				var spiritDefs = $spiritManager.getSpiritDefinitions();
				var content = "";
				
				function createSpiritControl(idx){					
					var content = "";
					var value = _this.getMetaValue("pilotSpirit"+idx);
					var parts = value.split(",");
					var id = parts[0] || -1;
					var learnedAt = parts[1] || 0;
					var cost = parts[2] || 0;
					
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+="#"+idx;
					content+="</div>";
					content+="<div class='cell'>";
					content+="<select data-idx='"+idx+"' id='spirit_select_"+idx+"'>";
					content+="<option title='None' value=''></option>";
					for(var i = 0; i < spiritDefs.length; i++){
						if(spiritDefs[i]){
							content+="<option "+(i == id ? "selected" : "")+" title='"+spiritDefs[i].desc+"' value='"+i+"'>"+spiritDefs[i].name+"</option>";
						}					
					}
					
					content+="</select>";
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_level;
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input data-idx='"+idx+"' id='spirit_learned_"+idx+"' value='"+learnedAt+"'></input>";
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_cost;
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input data-idx='"+idx+"' id='spirit_cost_"+idx+"' value='"+cost+"'></input>";
					content+="</div>";
					
					content+="</div>";				
					return content;
				}
				for(var i = 1; i <= 6; i++){
					content+=createSpiritControl(i);
				}
				return content;
			},
			hook(){
				for(var i = 1; i <= 6; i++){
					containerNode.querySelector("#spirit_select_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotSpirit"+idx);
						var parts = value.split(",");
						parts[0] = this.value;
						_this.setMetaValue("pilotSpirit"+idx, parts.join(","));
						_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#spirit_learned_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotSpirit"+idx);
						var parts = value.split(",");
						if(!isNaN(this.value)){
							parts[1] = this.value;
						}						
						_this.setMetaValue("pilotSpirit"+idx, parts.join(","));
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#spirit_cost_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotSpirit"+idx);
						var parts = value.split(",");
						if(!isNaN(this.value)){
							parts[2] = this.value;
						}
						_this.setMetaValue("pilotSpirit"+idx, parts.join(","));
						_this._mainUIHandler.setModified();
					});
				}
			}
		},
		twin_spirit: {
			createControls(){		
				var spiritDefs = $spiritManager.getSpiritDefinitions();
				var content = "";
				
								
				var content = "";
				var value = _this.getMetaValue("pilotTwinSpirit");
				var parts = value.split(",");
				var id = parts[0] || -1;
				var cost = parts[1] || 0;
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_twin;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='spirit_select_twin'>";
				content+="<option title='None' value=''></option>";
				for(var i = 0; i < spiritDefs.length; i++){
					if(spiritDefs[i]){
						content+="<option "+(i == id ? "selected" : "")+" title='"+spiritDefs[i].desc+"' value='"+i+"'>"+spiritDefs[i].name+"</option>";
					}					
				}
				
				content+="</select>";
				content+="</div>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_cost;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='spirit_cost_twin' value='"+cost+"'></input>";
				content+="</div>";
				
				content+="</div>";				
					
				
				
				return content;
			},
			hook(){
				
				containerNode.querySelector("#spirit_select_twin").addEventListener("change", function(){
					var idx = this.getAttribute("data-idx");
					var value = _this.getMetaValue("pilotTwinSpirit");
					var parts = value.split(",");
					parts[0] = this.value;
					_this.setMetaValue("pilotTwinSpirit", parts.join(","));
					_this.show();
					_this._mainUIHandler.setModified();
				});
				containerNode.querySelector("#spirit_cost_twin").addEventListener("change", function(){
					var idx = this.getAttribute("data-idx");
					var value = _this.getMetaValue("pilotTwinSpirit");
					var parts = value.split(",");
					if(!isNaN(this.value)){
						parts[1] = this.value;
					}
					_this.setMetaValue("pilotTwinSpirit", parts.join(","));
					_this._mainUIHandler.setModified();
				});
				
			}
		},
		abilities: {
			createControls(){		
				var abilityDefs = $pilotAbilityManager.getDefinitions()
				var content = "";
				
				function createAbilityControl(idx){					
					var content = "";
					var value = _this.getMetaValue("pilotAbility"+idx);
					var parts = value.split(",");
					var id = parts[0] || -1;
					var abilityLevel = parts[1] || 0;
					var requiredLevel = parts[2] || 0;
					
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+="#"+String(idx).padStart(3,0);
					content+="</div>";
					content+="<div class='cell'>";
					content+="<select data-idx='"+idx+"' id='ability_select_"+idx+"'>";
					content+="<option title='None' value=''></option>";
					for(var i = 0; i < abilityDefs.length; i++){
						if(abilityDefs[i]){
							content+="<option "+(i == id ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].desc)+"' value='"+i+"'>"+abilityDefs[i].name+"</option>";
						}					
					}
					
					content+="</select>";
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_ability_level;
					content+="</div>";
					content+="<div class='cell'>";
					//content+="<input data-idx='"+idx+"' id='ability_level_"+idx+"' value='"+abilityLevel+"'></input>";
					
					content+="<select data-idx='"+idx+"' id='ability_level_"+idx+"'>";
					var maxLevel = 1;
					if(abilityDefs[id]){
						maxLevel = abilityDefs[id].maxLevel;
					}
					for(var i = 1; i <= maxLevel; i++){				
						content+="<option "+(i == abilityLevel ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].desc)+"' value='"+i+"'>"+i+"</option>";									
					}
					
					content+="</select>";
					
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_learned_at;
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input data-idx='"+idx+"' id='ability_learned_"+idx+"' value='"+requiredLevel+"'></input>";
					content+="</div>";
					
					content+="</div>";				
					return content;
				}
				content+="<div class='ability_scroll'>";	
				for(var i = 1 + (_this._currentAbiPage * _this._abiPageSize); i <= Math.min((_this._currentAbiPage * _this._abiPageSize) + _this._abiPageSize); i++){
					content+=createAbilityControl(i);
				}
				content+="</div>";	
				return content;
			},
			hook(){
				for(var i = 1 + (_this._currentAbiPage * _this._abiPageSize); i <= Math.min((_this._currentAbiPage * _this._abiPageSize) + _this._abiPageSize); i++){
					containerNode.querySelector("#ability_select_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotAbility"+idx);
						var parts = value.split(",");
						parts[0] = this.value;
						if(!parts[1]){
							parts[1] = 1;
						}
						if(!parts[2]){
							parts[2] = 1;
						}
						_this.setMetaValue("pilotAbility"+idx, parts.join(","));
						_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#ability_level_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotAbility"+idx);
						var parts = value.split(",");
						if(!isNaN(this.value)){
							parts[1] = this.value;
						}						
						_this.setMetaValue("pilotAbility"+idx, parts.join(","));
						_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#ability_learned_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotAbility"+idx);
						var parts = value.split(",");
						if(!isNaN(this.value)){
							parts[2] = this.value;
						}
						_this.setMetaValue("pilotAbility"+idx, parts.join(","));
						_this._mainUIHandler.setModified();
					});
				}
			}
		}, 
		ace_ability: {
			createControls(){		
				var abilityDefs = $pilotAbilityManager.getDefinitions()
				var content = "";
				
							
				var content = "";
				var id = _this.getMetaValue("pilotAbilityAce");
				if(id == ""){
					id = -1;
				}				
					
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_ace_ability;
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select  id='ability_select_ace'>";
				content+="<option title='None' value=''></option>";
				for(var i = 0; i < abilityDefs.length; i++){
					if(abilityDefs[i]){
						content+="<option "+(i == id ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].desc)+"' value='"+i+"'>"+abilityDefs[i].name+"</option>";
					}					
				}
				
				content+="</select>";
				content+="</div>";
								
								
				return content;
			},
			hook(){				
				containerNode.querySelector("#ability_select_ace").addEventListener("change", function(){
					_this.setMetaValue("pilotAbilityAce", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});					
			}
		},
		will_on_hit: handleDefaultProp("pilotOnHitWill", EDITORSTRINGS.PILOT.label_will_on_hit),
		will_on_miss: handleDefaultProp("pilotOnMissWill", EDITORSTRINGS.PILOT.label_will_on_miss),
		will_on_damage: handleDefaultProp("pilotOnDamageWill", EDITORSTRINGS.PILOT.label_will_on_damage),
		will_on_evade: handleDefaultProp("pilotOnEvadeWill", EDITORSTRINGS.PILOT.label_will_on_evade),
		will_on_destroy: handleDefaultProp("pilotOnDestroyWill", EDITORSTRINGS.PILOT.label_will_on_destroy),
		will_on_ally_down: handleDefaultProp("pilotOnAllyDownWill", EDITORSTRINGS.PILOT.label_will_on_ally_down),
		assets: {
			createControls(entry){
				entry = _this.getCurrentEntry();
				var content = "";			
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_cutin_path;
				content+="</div>";
				content+="<div class='cell'>";
				content+="img/SRWBattleScene/";
				
				content+="<input id='cutin_path' value='"+_this.getMetaValue("pilotCutinPath")+"'></input>";
				content+=".png";
				content+="</div>";
				content+="</div>";
				
				content+="<div title='' class='table sub_section'>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+=EDITORSTRINGS.PILOT.label_overworld;
				content+="</div>";
				content+="</div>";
				content+="<div title='' class='row'>";
				
				content+="<div class='cell'>";
				content+= "<div class='overworld_preview unit_img_preview'></div>";
				content+="</div>";
				
				content+="</div>";
				content+="</div>";
				
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				containerNode.querySelector("#cutin_path").addEventListener("change", function(){
					_this.setMetaValue("pilotCutinPath", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});	

				var overworldInfo = [
					_this.getProperty("characterName"),
					_this.getProperty("characterIndex")
				];//_this.getMetaValue("srpgOverworld").split(",");
				var divs = containerNode.querySelectorAll(".overworld_preview");
				divs.forEach(function(div){
					OverworldSpriteManager.loadOverworldByParams(overworldInfo[0], overworldInfo[1], div);
				});		


				divs.forEach(function(div){
					div.addEventListener("click", async function(e){
						var elem = this;
						let result = await OverworldSpriteManager.showOverworldSelector(e, overworldInfo[0], overworldInfo[1], this);
						if(result.status == "updated"){
							//_this.setMetaValue("srpgOverworld", result.faceName+","+result.faceIndex);
							_this.setProperty("characterName", result.faceName);	
							_this.setProperty("characterIndex", result.faceIndex);	
							_this.show();
							_this._mainUIHandler.isModified();
						}
					});			
				});		
			}
		},
		relationships: {
			createControls(){		
				var abilityDefs = $relationshipBonusManager.getDefinitions()
				var content = "";
				
				function createAbilityControl(idx){					
					var content = "";
					var value = _this.getMetaValue("pilotRelationship"+idx);
					var parts = value.split(",");
					var pilotId = parts[0] || -1;
					var effectId = parts[1] || -1;
					var effectLevel = parts[2] || 0;
					
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+="#"+String(idx).padStart(2,0);
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_receiving;
					content+="</div>";
					content+="<div class='cell'>";
					content+="<select data-idx='"+idx+"' id='rel_pilot_select_"+idx+"'>";
					content+="<option title='None' value=''></option>";
					for(var i = 1; i < $dataActors.length; i++){						
						content+="<option "+(i == pilotId ? "selected" : "")+" value='"+i+"'>"+$dataActors[i].name+"</option>";											
					}
					
					content+="</select>";
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_effect;
					content+="</div>";
					content+="<div class='cell'>";
					//content+="<input data-idx='"+idx+"' id='ability_level_"+idx+"' value='"+abilityLevel+"'></input>";
					
					content+="<select data-idx='"+idx+"' id='rel_abi_"+idx+"'>";
					content+="<option value=''></option>";
					for(var i = 0; i < abilityDefs.length; i++){
						if(abilityDefs[i]){
							content+="<option "+(i == effectId ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].desc)+"' value='"+i+"'>"+abilityDefs[i].name+"</option>";
						}					
					}
					
					content+="</select>";
					
					content+="</div>";
					content+="<div class='cell'>";
					content+=EDITORSTRINGS.PILOT.label_rel_level;
					content+="</div>";
					content+="<div class='cell'>";
					//content+="<input data-idx='"+idx+"' id='rel_abi_level_"+idx+"' value='"+(effectLevel + 1)+"'></input>";
					
					content+="<select data-idx='"+idx+"' id='rel_abi_level_"+idx+"'>";
					//content+="<option value=''></option>";
					for(var i = 0; i < 3; i++){
						if(abilityDefs[i]){
							content+="<option "+(i == effectLevel ? "selected" : "")+" value='"+i+"'>"+(i + 1)+"</option>";
						}					
					}
					
					content+="</select>";
					
					content+="</div>";
					
					content+="</div>";				
					return content;
				}
				content+="<div class='ability_scroll'>";	
				for(var i = 1 + (_this._currentRelPage * _this._relPageSize); i <= Math.min((_this._currentRelPage * _this._relPageSize) + _this._relPageSize); i++){
					content+=createAbilityControl(i);
				}
				content+="</div>";	
				return content;
			},
			hook(){
				for(var i = 1 + (_this._currentRelPage * _this._relPageSize); i <= Math.min((_this._currentRelPage * _this._relPageSize) + _this._relPageSize); i++){
					containerNode.querySelector("#rel_pilot_select_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotRelationship"+idx);
						var parts = value.split(",");
						parts[0] = this.value;
						_this.setMetaValue("pilotRelationship"+idx, parts.join(","));
						_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#rel_abi_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotRelationship"+idx);
						var parts = value.split(",");						
						parts[1] = this.value;												
						_this.setMetaValue("pilotRelationship"+idx, parts.join(","));
						_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#rel_abi_level_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("pilotRelationship"+idx);
						var parts = value.split(",");
						if(!isNaN(this.value)){
							parts[2] = this.value;
						}
						_this.setMetaValue("pilotRelationship"+idx, parts.join(","));
						_this._mainUIHandler.setModified();
					});
				}
			}
		}, 
	};	
	
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



AllyPilotUI.prototype.show = async function(){
	let _this = this;
	_this.loadData();
	var listScroll = 0;
	if(this._dbList){
		listScroll = this._dbList.getScroll();
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
	content+="<div class='title'>";
	content+=EDITORSTRINGS.PILOT.label_general_info;	
	content+="</div>";
	content+="<div class='content'>";
	content+=_this._propertyHandlers.face.createControls();
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.name.createControls();
	content+=_this._propertyHandlers.default_mech.createControls();
	/*content+="<div class='row'>";
	content+=_this._propertyHandlers.species.createControls();
	content+="</div>";*/
	content+="<div class='row'>";
	content+=_this._propertyHandlers.terrain.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.exp_yield.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.pp_yield.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.ace_ability.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.tags.createControls();
	content+="</div>";	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.target_formula.createControls();
	content+="</div>";	

	content+=_this._propertyHandlers.text_alias.createControls();
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.attribute1.createControls();
	content+="</div>";
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.attribute2.createControls();
	content+="</div>";

	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title'>";
	content+=EDITORSTRINGS.PILOT.label_stats;		
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.stats.createControls();
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title'>";
	content+=EDITORSTRINGS.PILOT.label_spirits;	
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.spirits.createControls();
	content+=_this._propertyHandlers.twin_spirit.createControls();
	
	content+="</div>";
	
	
	content+="</div>";	
	content+="</div>";	
	content+="</div>";
	
	content+="<div class='row'>";	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.PILOT.label_abilities;	
	
	content+="<div class='abi_page_control'>";
	content+="<img title='Previous page' id='abi_page_left' src='svg/chevron_right.svg'/>"
	content+="<img title='Next page' id='abi_page_right' src='svg/chevron_right.svg'/>"
	content+="</div>";
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.abilities.createControls();
	
	
	content+="</div>";
	
	
	content+="</div>";	
	content+="</div>";	
	
	content+="<div class='section'>";
	content+="<div class='title'>";
	content+=EDITORSTRINGS.PILOT.label_personality;
	content+="</div>";
	content+="<div class='content stats'>";
	content+="<div class='table'>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_hit.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_miss.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_damage.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_evade.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_destroy.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.will_on_ally_down.createControls();
	content+="</div>";
	
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";

	
	
	content+=_this.createRelationshipSection();
	content+="</div>";
	content+="<div class='row'>";
	content+="<div class='section'>";
	content+="<div class='title'>";
	content+=EDITORSTRINGS.PILOT.label_assets;
	content+="</div>";
	content+="<div class='content'>";
	
	content+="<div class='table'>";
	
	
	content+=_this._propertyHandlers.assets.createControls();

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
	
	this.hook();
	
}

AllyPilotUI.prototype.createRelationshipSection = function(){
	let content = "";
	content+="<div class='section relationships'>";
	content+="<div class='title abilities'>";
	content+=EDITORSTRINGS.PILOT.label_rel_bonus;
	content+="<div class='abi_page_control'>";
	content+="<img title='Previous page' id='rel_page_left' src='svg/chevron_right.svg'/>"
	content+="<img title='Next page' id='rel_page_right' src='svg/chevron_right.svg'/>"
	content+="</div>";
	content+="</div>";
	content+="<div class='content stats'>";
	content+="<div class='table'>";

	content+=this._propertyHandlers.relationships.createControls();

	content+="</div>";

	content+="</div>";
	content+="</div>";
	return content;
}

AllyPilotUI.prototype.hook = function(){
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

AllyPilotUI.prototype.hookPageControls = function(){
	let _this = this;
	
	_this._container.querySelector("#abi_page_left").addEventListener("click", function(){
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
	});
	
	_this._container.querySelector("#rel_page_left").addEventListener("click", function(){
		if(_this._currentRelPage > 0){
			_this._currentRelPage--;
		}		
		_this.show();	
	});

	_this._container.querySelector("#rel_page_right").addEventListener("click", function(){
		if(_this._currentRelPage < 4){
			_this._currentRelPage++;
		}		
		_this.show();	
	});
}

AllyPilotUI.prototype.getEmpty = function(id){
	return {
	  "id": id,
	  "learnings": [],
	  "name": "",
	  "note": "",
	  "meta": {},
	  classId: 1
	};
}	