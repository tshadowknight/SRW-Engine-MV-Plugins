import EditorUI from "./EditorUI.js";
import DBList from "./DBList.js";
import MenuSpriteManager from "./MenuSpriteManager";
import BasicBattleSpriteManager from "./BasicBattleSpriteManager";
import OverworldSpriteManager from "./OverworldSpriteManager";
import DeployActionUI from "./DeployActionUI";

export default function MechUI(container, mainUIHandler){
	EditorUI.call(this, container, mainUIHandler);
	this._dataFile = "data/Mechs.json";
	this._vanillaFile = "data/Classes.json";
	this._gameVar = "$dataClasses";
	
	this._currentAbiPage = 0;
	this._abiPageSize = 10;
	
	this._currentRelPage = 0;
	this._relPageSize = 10;
}

MechUI.prototype = Object.create(EditorUI.prototype);
MechUI.prototype.constructor = MechUI;

MechUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
	_this._propertyHandlers = {
		menu_sprite: {
			createControls(entry){
				var content = "";
				content+="<div>";
				content+="<div class='menu_preview unit_img_preview'></div>";
				if(!_this.getMetaValue("mechMenuSprite")){
					content+="<div class='menu_preview_warning' title='Falling back to Battle Scene sprite because no Menu Sprite is defined!'>Using fallback!</div>";
				}
				content+="</div>";
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				function updatePortraitPreviews(){
				var divs = containerNode.querySelectorAll(".menu_preview");
					divs.forEach(function(div){
						var menuPath;
						var menuSprite = _this.getMetaValue("mechMenuSprite");
						if(menuSprite){
							menuPath = "img/menu/"+menuSprite+".png";
						} else {
							menuPath = "img/SRWBattleScene/"+_this.getMetaValue("mechBattleSceneSprite")+"/main.png";
						}
						div.innerHTML = "<img src='"+menuPath+"'/>";
					});
				}
				updatePortraitPreviews();
				
				var divs = containerNode.querySelectorAll(".menu_preview");
				divs.forEach(function(div){
					div.addEventListener("click", async function(e){
						var elem = this;
						let result = await MenuSpriteManager.showSelector(e, _this.getMetaValue("mechMenuSprite"), this);
						if(result.status == "updated"){
							_this.setMetaValue("mechMenuSprite", result.path)
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
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Stats Label";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='stats_name' value='"+_this.getMetaValue("mechStatsLabel")+"'></input>";
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
				containerNode.querySelector("#stats_name").addEventListener("change", function(){
					_this.setMetaValue("mechStatsLabel", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});	
			}
		},
		is_ship: {
			createControls(entry){
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Is Ship";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='is_ship' type=checkbox "+(_this.getMetaValue("mechIsShip")*1 ? "checked" : "")+"></input>";
				content+="</div>";
				content+="</div>";
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				containerNode.querySelector("#is_ship").addEventListener("change", function(){
					_this.setMetaValue("mechIsShip", this.checked ? 1 : 0);
					_this.show();
					_this._mainUIHandler.setModified();
				});
			}
		},
		inherits: {
			createControls(entry){
				var content = "";
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Sync Parts With";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("sync_parts_with", "", _this.getMetaValue("mechInheritsPartsFrom"));
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";
				content+="<div class='cell'>";
				content+="Sync Upgrades With";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("sync_upgrades_with", "", _this.getMetaValue("mechInheritsUpgradesFrom"));
				content+="</div>";
				content+="</div>";
				return content;
			},
			hook(entry){
				entry = _this.getCurrentEntry();
				containerNode.querySelector("#sync_parts_with").addEventListener("change", function(){
					_this.setMetaValue("mechInheritsPartsFrom", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});
				containerNode.querySelector("#sync_upgrades_with").addEventListener("change", function(){
					_this.setMetaValue("mechInheritsUpgradesFrom", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});
			}
		},
		//species: handleDefaultProp("pilotSpecies", "Species"),
		terrain: {
			createControls(){
				
				var content = "";
				content+="";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Enabled";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<div class='terrain_container'>";
				for(var i = 0; i < terrains.length; i++){
					content+="<div class='column'>";
					content+="<div class='entry terrain_header'>";
					content+=terrains[i].type;
					content+="</div>";
					var value = _this.getMetaValue(terrains[i].prop);
					if(terrains[i].type == "SEA"){
						content+="<div >";
						//content+="<input data-terrainidx='"+i+"' class='terrain_enabled_select' type=checkbox "+(value >= 1 ? "checked" : "")+"></input>";
						content+="<select id='terrain_enabled_select'>";
						var options = [
							"No",
							"With Movement Penalty",
							"Yes"
						];
						for(var j = 0; j < options.length; j++){					
							content+="<option "+(j == value ? "selected" : "")+" value='"+j+"'>"+options[j]+"</option>";										
						}
						
						content+="</select>";
						
						content+="</div>";
					} else {
						content+="<div >";
						content+="<input data-terrainidx='"+i+"' class='terrain_enabled' type=checkbox "+(value >= 1 ? "checked" : "")+"></input>";
						content+="</div>";
					}
					
					
					content+="</div>";
				}
				
				content+="</div>";
				content+="</div>";
				
				content+="</div>";
				content+="<div class='row'>";	
				content+=_this.createTerrainControls("mechTerrain", "Rank");
				content+="</div>";
				return content;
			},
			hook(){
				let entries = containerNode.querySelectorAll(".terrain_container .entry");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var parts = _this.getMetaValue("mechTerrain").split("");
						var idx = this.getAttribute("data-scoreidx");
						var score = this.getAttribute("data-score");
						parts[idx] = score;
						_this.setMetaValue("mechTerrain", parts.join(""));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".terrain_enabled");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						_this.setMetaValue(terrains[this.getAttribute("data-terrainidx")].prop, this.checked ? 1 : 0);
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				containerNode.querySelector("#terrain_enabled_select").addEventListener("change", function(){
					_this.setMetaValue(terrains[2].prop, this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});
			}
		},
		exp_yield: handleDefaultProp("mechExpYield", "Exp. Yield"),
		pp_yield: handleDefaultProp("mechPPYield", "PP Yield"),
		fund_yield: handleDefaultProp("mechFundYield", "Fund Yield"),
		tags: handleDefaultProp("mechTags", "Tags"),
		attribute1: handleDefaultProp("mechAttribute1", "Attribute 1"),
		attribute2: handleDefaultProp("mechAttribute2", "Attribute 2"),
		fub: {
			createControls(){		
				var abilityDefs = $mechAbilityManager.getDefinitions()
				var content = "";
				
							
				var content = "";
				var id = _this.getMetaValue("mechFullUpgradeAbility");
				if(id == ""){
					id = -1;
				}				
					
				content+="<div title='Full Upgrade Bonus' class='cell'>";
				content+="FUB";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='fub_select'>";
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
				containerNode.querySelector("#fub_select").addEventListener("change", function(){
					_this.setMetaValue("mechFullUpgradeAbility", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});					
			}
		},
		item_slots: {
			createControls(){		
				var content = "";
				
							
				var content = "";
				var count = _this.getMetaValue("mechItemSlots");
				if(count == ""){
					count = 0;
				}				
					
				content+="<div class='cell'>";
				content+="Item Slots";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='item_slot_select'>";
				for(var i = 0; i < 5; i++){					
					content+="<option "+(i == count ? "selected" : "")+" value='"+i+"'>"+i+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
								
								
				return content;
			},
			hook(){				
				containerNode.querySelector("#item_slot_select").addEventListener("change", function(){
					_this.setMetaValue("mechItemSlots", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});					
			}
		},
		stats: {
			createControls(entry){
				function createGrowthControls(growthTypeProp, growthAmountProp){
					var content = "";
					content+="<div class='cell'>";
					content+="Cost Type";
					content+="</div>";
					content+="<div class='cell'>";
					var value = _this.getMetaValue(growthTypeProp);
					var growthTypes;
					if(growthTypeProp == "mechUpgradeWeaponCost"){
						growthTypes = ENGINE_SETTINGS.COST_TYPES.WEAPON;
					} else {
						growthTypes = ENGINE_SETTINGS.COST_TYPES.NORMAL;
					}
	
					content+="<select id='prop_"+growthTypeProp+"'>";
					content+="<option  value=''></option>";
					Object.keys(growthTypes).forEach(function(type){
						content+="<option "+(type == value ? "selected" : "")+" value='"+type+"'>"+type+"</option>";		
					});
					
					content+="</select>";
					content+="</div>";
					content+="<div class='cell'>";
					var typeSummary = [];
					var typeData = growthTypes[value];
					if(typeData){
						for(var i = 0; i < typeData.length; i++){
							typeSummary.push("Level "+(i+1)+": "+typeData[i]);
						}
						content+="<img title='"+(typeSummary.join("\n"))+"' class='view_type_costs_icon' img src='"+_this._svgPath+"eye-line.svg'>"
					}
					
					
					
					content+="</div>";
					
					if(growthAmountProp){
						var defaults = {
							mechUpgradeHPAmount: 350,
							mechUpgradeENAmount: 10,
							mechUpgradeArmorAmount: 60,
							mechUpgradeMobilityAmount: 5,
							mechUpgradAccuracyAmount: 6
						};
						content+="<div class='cell'>";
						content+="Upgrade Amount";
						content+="</div>";
						
						content+="<div class='cell'>";
						content+="<input id='prop_"+growthAmountProp+"' value='"+(_this.getMetaValue(growthAmountProp) || defaults[growthAmountProp])+"'></input>";
						content+="</div>";
					} else {
						content+="<div class='cell'>";						
						content+="</div>";
						content+="<div class='cell'>";						
						content+="</div>";
					}			
					
					return content;
				}
				var content = "";
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechHP", "HP");
				content+=createGrowthControls("mechUpgradeHPCost", "mechUpgradeHPAmount");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechEN", "EN");
				content+=createGrowthControls("mechUpgradeENCost", "mechUpgradeENAmount");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechArmor", "Armor");
				content+=createGrowthControls("mechUpgradeArmorCost", "mechUpgradeArmorAmount");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechMobility", "Mobility");
				content+=createGrowthControls("mechUpgradeMobilityCost", "mechUpgradeMobilityAmount");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechAccuracy", "Accuracy");
				content+=createGrowthControls("mechUpgradAccuracyCost", "mechUpgradAccuracyAmount");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Weapons";
				content+="</div>";
				content+="<div class='cell'>";
				content+="</div>";
				content+=createGrowthControls("mechUpgradeWeaponCost");
				content+="</div>";
				
				content+="<div class='row'>";	
				content+=_this.createValueInput("mechMove", "Move");
				content+="</div>";
				
				
				
				content+="<div class='row'>";	
				//content+=_this.createValueInput("mechSize", "Size");
				
				content+="<div class='cell'>";
				content+="Size";
				content+="</div>";
				content+="<div class='cell'>";
				var value = _this.getMetaValue("mechSize");
				if(value == "LL"){
					value = "2L";
				}
				if(value == "L"){
					value = "1L";
				}
				if(value == "1S"){
					value = "S";
				}
				var options = ["S", "M", "1L", "2L"];
				content+="<select id='prop_mechSize'>";
				for(var i = 0; i < options.length; i++){					
					content+="<option "+(options[i] == value ? "selected" : "")+" value='"+options[i]+"'>"+options[i]+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				
				content+="</div>";
				return content;
			},
			hook(entry){
				let hookedProperties = [
					"mechHP",
					"mechEN",
					"mechArmor",
					"mechMobility",
					"mechAccuracy",
				
					"mechUpgradeHPAmount",
					
					"mechUpgradeENAmount",	
					
					"mechUpgradeArmorAmount",
					
					"mechUpgradeMobilityAmount",
					
					"mechUpgradAccuracyAmount",
				
					"mechMove",		
						
					
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
					
					
					
					"mechUpgradeHPCost",
					
					"mechUpgradeENCost",
					
					"mechUpgradeArmorCost",
					
					"mechUpgradeMobilityCost",
					
					"mechUpgradAccuracyCost",
					
					"mechUpgradeWeaponCost",
				
					"mechSize",		
					
				];
				hookedProperties.forEach(function(prop){
					containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
						let value = this.value;						
						_this.setMetaValue(prop, this.value);
						_this.show();
						_this._mainUIHandler.setModified();										
					});
				});
				
			}
		},
		abilities: {
			createControls(){		
				var abilityDefs = $mechAbilityManager.getDefinitions()
				var content = "";
				
				function createAbilityControl(idx){					
					var content = "";
					var value = _this.getMetaValue("mechAbility"+idx);
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
					
					content+="</div>";				
					return content;
				}
				content+="<div class=''>";	
				for(var i = 1; i <= 6; i++){
					content+=createAbilityControl(i);
				}
				content+="</div>";	
				return content;
			},
			hook(){
				for(var i =  i = 1; i <= 6; i++){
					containerNode.querySelector("#ability_select_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						_this.setMetaValue("mechAbility"+idx, this.value);
						//_this.show();
						_this._mainUIHandler.setModified();
					});
					
				}
			}
		},
		weapons: {
			createControls(){		
				var abilityDefs = $dataWeapons;
				var content = "";
				
				function createWeaponControl(idx){					
					var content = "";
					var value = _this.getMetaValue("mechAttack"+idx);
					var parts = value.split(",");
					var id = parts[0] || -1;
					var isLocked = (parts[1] || 0) * 1;
	
					
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+="#"+String(idx).padStart(3,0);
					content+="</div>";
					content+="<div class='cell'>";
					content+="<select data-idx='"+idx+"' id='weapon_select_"+idx+"'>";
					content+="<option title='None' value=''></option>";
					for(var i = 1; i < abilityDefs.length; i++){
						if(abilityDefs[i]){
							content+="<option "+(i == id ? "selected" : "")+" title='"+_this.escapeAttribute(abilityDefs[i].description)+"' value='"+i+"'>"+abilityDefs[i].name+"</option>";
						}					
					}
					
					content+="</select>";
					content+="</div>";
					content+="<div class='cell'>";
					content+="Locked";
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input data-idx='"+idx+"' id='weapon_locked_"+idx+"' type=checkbox "+(isLocked ? "checked" : "")+"></input>";
					content+="</div>";
					content+="</div>";				
					return content;
				}
				content+="<div class='weapons_scroll'>";	
				content+="<div class='table'>";	
				for(var i = 0; i <= 20; i++){
					content+=createWeaponControl(i);
				}
				content+="</div>";	
				content+="</div>";	
				return content;
			},
			hook(){
				for(var i =  i = 0; i <= 20; i++){
					containerNode.querySelector("#weapon_select_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("mechAttack"+idx);
						var parts = value.split(",");
						parts[0] = this.value;
						_this.setMetaValue("mechAttack"+idx, parts.join(","));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
					containerNode.querySelector("#weapon_locked_"+i).addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = _this.getMetaValue("mechAttack"+idx);
						var parts = value.split(",");
						parts[1] = this.checked ? 1 : 0;
						_this.setMetaValue("mechAttack"+idx, parts.join(","));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				}
			}
		}, 	
		transformation: {
			createControls(){	
				var content = "";
				
				content+="<div class='table'>";
				
				
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Command Name";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='transform_cmd_name' value='"+_this.getMetaValue("mechTransformCmd")+"'></input>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Available";
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				
				content+="<div class='transformation_scroll'>";
				content+="<div class='table'>";
				
				var value = JSON.parse(_this.getMetaValue("mechTransformsInto") || "[]");
				var willReqs = JSON.parse(_this.getMetaValue("mechTransformWill") || "[]");
				for(var i = 0; i < value.length; i++){
					
				
				
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+=_this.createMechSelect("transform_select_"+i, "transform_select", value[i], "data-idx="+i);
					content+="</div>";
			
					content+="<div class='cell'>";
					content+="Required Will";
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input id='transform_will_"+i+"' class='transform_will' data-idx="+i+" value='"+willReqs[i]+"'></input>";
					content+="</div>";
					content+="<div class='cell'>";
					content+="<img class='remove_transformation remove_button' data-idx='"+i+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="</div>";
				
				}
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transform_list_controls'>";
				content+="<button id='add_transformation'>Add</button>";
				content+="</div>";
				
				
				
				content+="<div class='row transform_restore_controls_header'>";	
				content+="<div class='cell'>";
				content+="Restores";
				content+="</div>";
				content+="</div>";
				
				var values = _this.getMetaValue("mechTransformRestores");
				var parts = values.split(",");
				var restoresHP = parts[0] * 1;
				var restoresEN;
				if(parts.length > 1){
					restoresEN = parts[1] * 1;
				} else {
					restoresEN = restoresHP;
				}
				
				content+="<div class='row transform_restore_controls'>";	
				content+="<div class='cell'>";
				content+="HP";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='transform_restores_hp' type=checkbox "+(restoresHP ? "checked" : "")+"></input>";
				content+="</div>";
			
				content+="<div class='cell'>";
				content+="EN";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<input id='transform_restores_en' type=checkbox "+(restoresEN ? "checked" : "")+"></input>";
				content+="</div>";
				content+="</div>";
				
				
				
				
				return content;
			},			
			hook(){
				containerNode.querySelector("#destroy_transform_mech_select").addEventListener("change", function(){
					_this.setMetaValue("mechDestroyTransformInto", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				containerNode.querySelector("#destroy_transform_pilot_select").addEventListener("change", function(){
					_this.setMetaValue("mechDestroyTransformedActor", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#transform_restores_hp").addEventListener("change", function(){
					var values = _this.getMetaValue("mechTransformRestores");
					var parts = values.split(",");
					parts[0] = this.checked ? 1 : 0;
					_this.setMetaValue("mechTransformRestores", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#transform_restores_en").addEventListener("change", function(){
					var values = _this.getMetaValue("mechTransformRestores");
					var parts = values.split(",");
					parts[1] = this.checked ? 1 : 0;
					_this.setMetaValue("mechTransformRestores", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#add_transformation").addEventListener("click", function(){
					var value = JSON.parse(_this.getMetaValue("mechTransformsInto") || "[]");
					var willReqs = JSON.parse(_this.getMetaValue("mechTransformWill") || "[]");
					value.push("");
					willReqs.push(0);
					_this.setMetaValue("mechTransformsInto", JSON.stringify(value));
					_this.setMetaValue("mechTransformWill", JSON.stringify(willReqs));
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				let entries = containerNode.querySelectorAll(".remove_transformation");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechTransformsInto") || "[]");
						var willReqs = JSON.parse(_this.getMetaValue("mechTransformWill") || "[]");
						value.splice(idx, 1);
						willReqs.splice(idx, 1);
						
						_this.setMetaValue("mechTransformsInto", JSON.stringify(value));
						_this.setMetaValue("mechTransformWill", JSON.stringify(willReqs));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".transform_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechTransformsInto") || "[]");
						value[idx] = this.value;
			
						_this.setMetaValue("mechTransformsInto", JSON.stringify(value));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".transform_will");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var willReqs = JSON.parse(_this.getMetaValue("mechTransformWill") || "[]");
						willReqs[idx] = this.value;
			
						_this.setMetaValue("mechTransformWill", JSON.stringify(willReqs));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				containerNode.querySelector("#transform_cmd_name").addEventListener("change", function(){
					_this.setMetaValue("mechTransformCmd", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});							
			}
		},
		auto_transformation: {
			createControls(){
				var content = "";
				content+="<div class='table sub_section'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="On Destruction";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Mech";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("destroy_transform_mech_select", "", _this.getMetaValue("mechDestroyTransformInto"));
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Pilot";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createPilotSelect("destroy_transform_pilot_select", "", _this.getMetaValue("mechDestroyTransformedActor"));
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				var value = _this.getMetaValue("mechTransformsWhenTargetPresent");
				var parts = value.split(",");
				var otherUnit = parts[0];
				var targetUnit = parts[1];
				
				content+="<div class='table sub_section'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="If Other Unit Present";
				content+="</div>";
				content+="</div>";

				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Other Unit";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("other_unit_present_select", "", otherUnit);
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Tranform Into";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("other_unit_present_target_select", "", targetUnit);
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				var value = _this.getMetaValue("mechTransformsWhenTargetMissing");
				var parts = value.split(",");
				var otherUnit = parts[0];
				var targetUnit = parts[1];
				
				content+="<div class='table sub_section'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="If Other Unit Missing";
				content+="</div>";
				content+="</div>";

				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Other Unit";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("other_unit_missing_select", "", otherUnit);
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Tranform Into";
				content+="</div>";
				content+="<div class='cell'>";
				content+=_this.createMechSelect("other_unit_missing_target_select", "", targetUnit);
				content+="</div>";
				content+="</div>";
				content+="</div>";
				return content;
			},
			hook(){
				containerNode.querySelector("#other_unit_present_select").addEventListener("change", function(){					
					var value = _this.getMetaValue("mechTransformsWhenTargetPresent");
					var parts = value.split(",");
					parts[0] = this.value;
					
					_this.setMetaValue("mechTransformsWhenTargetPresent", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#other_unit_present_target_select").addEventListener("change", function(){					
					var value = _this.getMetaValue("mechTransformsWhenTargetPresent");
					var parts = value.split(",");
					parts[1] = this.value;
					
					_this.setMetaValue("mechTransformsWhenTargetPresent", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#other_unit_missing_select").addEventListener("change", function(){					
					var value = _this.getMetaValue("mechTransformsWhenTargetMissing");
					var parts = value.split(",");
					parts[0] = this.value;
					
					_this.setMetaValue("mechTransformsWhenTargetMissing", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#other_unit_missing_target_select").addEventListener("change", function(){					
					var value = _this.getMetaValue("mechTransformsWhenTargetMissing");
					var parts = value.split(",");
					parts[1] = this.value;
					
					_this.setMetaValue("mechTransformsWhenTargetMissing", parts.join(","));
					//_this.show();
					_this._mainUIHandler.setModified();
				});
			}
		},
		combination: {
			createControls(){	
				var content = "";
				
				content+="<div class='table'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="From";
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='combine_scroll'>";
				content+="<div class='table'>";
				
				var value = JSON.parse(_this.getMetaValue("mechCombinesFrom") || "[]");
				for(var i = 0; i < value.length; i++){
					
				
				
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+=_this.createMechSelect("combine_select_"+i, "combine_select", value[i], "data-idx="+i);
					content+="</div>";
			
			/*
					content+="<div class='cell'>";
					content+="Required Will";
					content+="</div>";
					content+="<div class='cell'>";
					content+="<input id='transform_will_"+i+"' class='transform_will' data-idx="+i+" value='"+willReqs[i]+"'></input>";
					content+="</div>";*/
					content+="<div class='cell'>";
					content+="<img class='remove_combine_from remove_button' data-idx='"+i+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="</div>";
				
				}
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transform_list_controls'>";
				content+="<button id='add_combine_from'>Add</button>";
				content+="</div>";
				
				
				content+="<div class='table'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Into";
				content+="</div>";
		
				
				
				
				var value = JSON.parse(_this.getMetaValue("mechCombinesTo") || "[]");				
		
				content+="<div class='cell'>";
				content+=_this.createMechSelect("combine_into_select", "combine_into_select", value, "data-idx="+i);
				content+="</div>";
	
						
				content+="</div>";
				content+="</div>";
				
				content+="<div class='table'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Required Will";
				content+="</div>";
		
						
		
				content+="<div class='cell'>";
				content+="<input id='combine_will' value='"+_this.getMetaValue("mechCombineWill")+"'></input>";
				content+="</div>";
	
						
				content+="</div>";
				content+="</div>";
				
		
				return content;
			},
			hook(){
				containerNode.querySelector("#add_combine_from").addEventListener("click", function(){
					var value = JSON.parse(_this.getMetaValue("mechCombinesFrom") || "[]");
					value.push("");		
					_this.setMetaValue("mechCombinesFrom", JSON.stringify(value));
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#combine_into_select").addEventListener("change", function(){	
					_this.setMetaValue("mechCombinesTo", this.value);
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				let entries = containerNode.querySelectorAll(".remove_combine_from");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechCombinesFrom") || "[]");						
						value.splice(idx, 1);						
						_this.setMetaValue("mechCombinesFrom", JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".combine_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechCombinesFrom") || "[]");
						value[idx] = this.value;
			
						_this.setMetaValue("mechCombinesFrom", JSON.stringify(value));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				containerNode.querySelector("#combine_will").addEventListener("change", function(){
					_this.setMetaValue("mechCombineWill", this.value);
					//_this.show();
					_this._mainUIHandler.setModified();
				});	
			}
		},
		deployment: {
			createControls(){		
				var content = "";
				
				content+="<div class='table'>";
				
				content+="<div title='If enabled the mech can be deployed directly' class='row'>";
				content+="<div class='cell'>";
				content+="Can Deploy";
				content+="</div>";
				content+="<div class='cell'>";

				content+="<input id='can_deploy' type=checkbox "+(_this.getMetaValue("mechNotDeployable") * 1 ? "" : "checked")+"></input>";

				content+="</div>";
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Deploy Actions";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<button id='edit_deploy_actions'>Edit</button>";
				content+="</div>";
				content+="</div>";
				
				content+="<div title='If enabled setting a pilot for this mech will immediately reconfigure other pilots if needed according to the deploy actions' class='row'>";
				content+="<div class='cell'>";
				content+="Force Pilots";
				content+="</div>";
				content+="<div class='cell'>";

				content+="<input id='force_pilots' type=checkbox "+(_this.getMetaValue("mechForcePilots") * 1 ? "checked" : "")+"></input>";

				content+="</div>";
				content+="</div>";
				
				content+="<div title='If enabled a menu option to swap between the available pilots will be enabled on the unit's map menu' class='row'>";
				content+="<div class='cell'>";
				content+="Quick Swap";
				content+="</div>";
				content+="<div class='cell'>";

				content+="<input id='quick_swap' type=checkbox "+(_this.getMetaValue("mechCanQuickSwap") * 1 ? "checked" : "")+"></input>";

				content+="</div>";
				content+="</div>";
			
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Allowed Pilots";
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transformation_scroll'>";
				content+="<div class='table'>";
				
				var value;
				try {
					value = JSON.parse(_this.getMetaValue("mechAllowedPilots") || "[]");	
				} catch(e){
					//workaround for handling definitions in the deprecated format
					value = [];
					_this.setMetaValue("mechAllowedPilots", "[]");
				}
				
				/*if(value.length < 2){
					content+="Add at least two Pilots to make this Mech available in the Pilot Assignment Intermission menu.";
				}*/
				for(var i = 0; i < value.length; i++){			
				
					content+="<div class='row'>";	
					content+="<div class='cell'>";
					content+=_this.createPilotSelect("allowed_pilot_select_"+i, "allowed_pilot_select", value[i], "data-idx="+i);
					content+="</div>";
			
					content+="<div class='cell'>";
					content+="<img class='remove_allowed_pilot remove_button' data-idx='"+i+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="</div>";
				
				}
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transform_list_controls'>";
				content+="<button id='add_allowed_pilot'>Add</button>";
				content+="</div>";
				
				content+="<div class='table'>";
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Sub Pilot Slots";
				content+="</div>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='sub_pilot_scroll'>";
				content+="<div class='table sub_pilot_slot'>";
				
				value = JSON.parse(_this.getMetaValue("mechSubPilots") || "[]");	
				
				/*if(value.length < 2){
					content+="Add at least two Pilots to make this Mech available in the Pilot Assignment Intermission menu.";
				}*/
				for(var i = 0; i < value.length; i++){	
					var allowedSubPilots;
					try {
						allowedSubPilots = JSON.parse(_this.getMetaValue("mechAllowedSubPilots"+(i+1)) || "[]");	
					} catch(e){
						//workaround for handling definitions in the deprecated format
						allowedSubPilots = [];
						_this.setMetaValue("mechAllowedSubPilots"+(i+1), "[]");
					}
				
					content+="<div class='row'>";	
					
					content+="<div class='cell'>";
					content+="Slot "+(i+1);
					content+="</div>";
					
					content+="<div class='cell'>";
					content+="Default Pilot";
					content+="</div>";
					
					content+="<div class='cell'>";
					content+=_this.createPilotSelect("default_pilot_select"+i, "default_pilot_select", value[i], "data-idx="+i);
					content+="</div>";
			
					content+="<div class='cell'>";
					content+="<img class='remove_sub_pilot_slot remove_button' data-idx='"+i+"' src='"+_this._svgPath+"/close-line.svg'>";
					content+="</div>";
					content+="</div>";
					
					content+="<div class='row'>";	
					
					content+="<div class='cell'>";
					content+="</div>";
					
					content+="<div class='cell top'>";
					content+="Allowed";
					content+="</div>";
					
					content+="<div class='cell'>";
					
					content+="<div class='allowed_sub_pilots_scroll'>";
					for(var j = 0; j < allowedSubPilots.length; j++){
						content+="<div class='entry'>";
						content+=_this.createPilotSelect("sub_slot_pilot_select"+i, "sub_slot_pilot_select", allowedSubPilots[j], "data-idx="+i+" data-entry="+j);
						content+="<img class='remove_sub_pilot_from_slot remove_button' data-idx='"+i+"' data-entry='"+j+"' src='"+_this._svgPath+"/close-line.svg'>";
						content+="</div>";
						
					}
					content+="</div>";
					content+="<div class='sub_pilot_controls'>";
					content+="<button data-idx='"+i+"' data-entry='"+j+"' class='add_sub_pilot'>Add</button>";
					content+="</div>";
					content+="</div>";
			
					content+="</div>";
				
				}
				
				
				content+="</div>";
				content+="</div>";
				
				content+="<div class='transform_list_controls'>";
				content+="<button id='add_sub_pilot_slot'>Add</button>";
				content+="</div>";
				
				return content;
			},
			hook(){
				let entries;				
				
				containerNode.querySelector("#edit_deploy_actions").addEventListener("click", function(){
					new DeployActionUI(_this._container, _this.getCurrentEntry().id, _this, {
						"changed": function(){
							
						}
					}).show();
				});
				
				containerNode.querySelector("#can_deploy").addEventListener("click", function(){
					_this.setMetaValue("mechNotDeployable", this.checked ? 0 : 1);
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				containerNode.querySelector("#force_pilots").addEventListener("click", function(){
					_this.setMetaValue("mechForcePilots", this.checked ? 1 : 0);
					_this.show();
					_this._mainUIHandler.setModified();
				});

				containerNode.querySelector("#quick_swap").addEventListener("click", function(){
					_this.setMetaValue("mechCanQuickSwap", this.checked ? 1 : 0);
					_this.show();
					_this._mainUIHandler.setModified();
				});				
				
				
				
				containerNode.querySelector("#add_allowed_pilot").addEventListener("click", function(){
					var value = JSON.parse(_this.getMetaValue("mechAllowedPilots") || "[]");
					value.push("");		
					_this.setMetaValue("mechAllowedPilots", JSON.stringify(value));
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				entries = containerNode.querySelectorAll(".remove_allowed_pilot");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx");						
						var value = JSON.parse(_this.getMetaValue("mechAllowedPilots") || "[]");	
									
						value.splice(idx, 1);						
						_this.setMetaValue("mechAllowedPilots", JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".allowed_pilot_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechAllowedPilots") || "[]");
						value[idx] = this.value;
			
						_this.setMetaValue("mechAllowedPilots", JSON.stringify(value));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				
				containerNode.querySelector("#add_sub_pilot_slot").addEventListener("click", function(){
					var value = JSON.parse(_this.getMetaValue("mechSubPilots") || "[]");
					if(value.length < 10){
						value.push("");		
						_this.setMetaValue("mechSubPilots", JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					}					
				});
				
				entries = containerNode.querySelectorAll(".remove_sub_pilot_slot");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx");						
						var value = JSON.parse(_this.getMetaValue("mechSubPilots") || "[]");	
									
						value.splice(idx, 1);						
						_this.setMetaValue("mechSubPilots", JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".default_pilot_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx");
						var value = JSON.parse(_this.getMetaValue("mechSubPilots") || "[]");
						value[idx] = this.value || 0;
			
						_this.setMetaValue("mechSubPilots", JSON.stringify(value));
						//_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".add_sub_pilot");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx") * 1;
						var entry = this.getAttribute("data-entry") * 1;
						var value = JSON.parse(_this.getMetaValue("mechAllowedSubPilots"+(idx+1)) || "[]");	
						value.push("");
			
						_this.setMetaValue("mechAllowedSubPilots"+(idx+1), JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".remove_sub_pilot_from_slot");
				entries.forEach(function(entry){
					entry.addEventListener("click", function(){
						var idx = this.getAttribute("data-idx") * 1;
						var entry = this.getAttribute("data-entry") * 1;
						var value = JSON.parse(_this.getMetaValue("mechAllowedSubPilots"+(idx+1)) || "[]");	
						value.splice(entry, 1);		
			
						_this.setMetaValue("mechAllowedSubPilots"+(idx+1), JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
				entries = containerNode.querySelectorAll(".sub_slot_pilot_select");
				entries.forEach(function(entry){
					entry.addEventListener("change", function(){
						var idx = this.getAttribute("data-idx") * 1;
						var entry = this.getAttribute("data-entry") * 1;
						var value = JSON.parse(_this.getMetaValue("mechAllowedSubPilots"+(idx+1)) || "[]");	
						value[entry] = this.value || 0;		
			
						_this.setMetaValue("mechAllowedSubPilots"+(idx+1), JSON.stringify(value));
						_this.show();
						_this._mainUIHandler.setModified();
					});
				});
				
			},
			
		},
		sprites: {
			createControls: function(){
				var content = "";
				content+="<div title='' class='table sub_section'>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Basic Battle";
				content+="</div>";
				content+="<div class='cell'>";
				content+="Overworld";
				content+="</div>";
				content+="</div>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="<div id='basic_battle_selector_icon'>";
				content+="<img  src='img/basic_battle/"+_this.getMetaValue("mechBasicBattleSprite")+".png'></img>";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='cell'>";
				content+= "<div class='overworld_preview unit_img_preview'></div>";
				content+="</div>";
				
				content+="</div>";
				content+="</div>";
				
				content+="<div title='' class='table sub_section'>";
				
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Battle Scene";
				content+="</div>";
				content+="</div>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Folder";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<div class='hint_text'>img/SRWBattleScene/</div>";
				content+="<input  id='prop_mechBattleSceneSprite' value='"+_this.getMetaValue("mechBattleSceneSprite")+"'></input>";
				content+="<div class='hint_text'>/main.png</div>";
				content+="</div>";
				
				content+="</div>";
				
				var spriteType;
				if(_this.getMetaValue("mechBattleSceneUseSpriter") * 1){
					spriteType = "Spriter";
				} else if(_this.getMetaValue("mechBattleSceneUseDragonBones") * 1){
					spriteType = "DragonBones";
				} else if(_this.getMetaValue("mechBattleSceneUseSpine") * 1){
					spriteType = "Spine";
				} else if(_this.getMetaValue("mechBattleSceneUse3D") * 1){
					spriteType = "3D";
				} else {
					spriteType = "Default";
				}
				
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Sprite Type";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='sprite_type_select'>";
				var options = [
					"Default",
					"Spine",
					"3D"
					//"Spriter",
					//"DragonBones"
				];
				for(var j = 0; j < options.length; j++){					
					content+="<option "+(options[j] == spriteType ? "selected" : "")+" value='"+options[j]+"'>"+options[j]+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";	
				
				if(spriteType == "DragonBones"){
					content+="<div title='' class='row'>";
					content+=_this.createValueInput("mechBattleSceneArmatureName", "Armature Name");
					content+="</div>";
					content+="<div title='' class='row'>";
					content+=_this.createValueInput("mechBattleSceneDragonBonesSize", "DragonBones World Size");
					content+="</div>";
				}
				if(spriteType == "Spine" || spriteType == "DragonBones"){
					content+="<div title='Determines the width for the canvas on which the DragonBones sprite is rendered' class='row'>";
					content+=_this.createValueInput("mechBattleSceneCanvasWidth", "Internal Canvas Width");
					content+="</div>";
					content+="<div title='Determines the height for the canvas on which the DragonBones sprite is rendered' class='row'>";
					content+=_this.createValueInput("mechBattleSceneCanvasHeight", "Internal Canvas Height");
					content+="</div>";
				}
				
				if(spriteType == "Default"){
					content+="<div title='The width and height of the texture files for this sprite in pixels' class='row'>";
					content+=_this.createValueInput("mechBattleSceneSpriteSize", "Source Size", "", "px");
					content+="</div>";	
				}	

				if(spriteType == "3D"){
					content+="<div title='A scaling factor for the 3D model ' class='row'>";
					content+=_this.createValueInput("mechBattleSceneSpriteScale", "Scale", "", "");
					content+="</div>";
					content+="<div title='The default rotation of the 3D model' class='row'>";
					content+=_this.createValueInput("mechBattleSceneSpriteRotation", "Rotation", "", "°");
					content+="</div>";						
				}		
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechBattleYOffset", "Y Offset", "", "world units");
				content+="</div>";			
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechBattleCenterYOffset", "Root Y Offset", "", "world units");
				content+="</div>";					
				content+="<div title='Scale for the shadow of the unit' class='row'>";
				content+=_this.createValueInput("mechBattleSceneShadowSize", "Shadow Scale");
				content+="</div>";	
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechBattleSceneShadowOffsetZ", "Shadow Z Offset", "", "world units");
				content+="</div>";
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechBattleSceneShadowOffsetX", "Shadow X Offset", "", "world units");
				content+="</div>";
				content+="<div title='The size at which the sprite is displayed in World units(default 3)' class='row'>";
				content+=_this.createValueInput("mechBattleReferenceSize", "World Size", "", "world units");
				content+="</div>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Death Animation";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<select id='death_anim_select'>";
				var animData = _this._mainUIHandler.getAnimationDefs();
				var value = _this.getMetaValue("mechBattleSceneDeathAnim");
				content+="<option title='' value=''>System Default</option>";
				var options = Object.keys(animData);
				for(var j = 0; j < options.length; j++){					
					content+="<option "+(options[j] == value ? "selected" : "")+" value='"+options[j]+"'>"+animData[options[j]].name+"</option>";										
				}
				
				content+="</select>";
				content+="</div>";
				content+="</div>";
				
				content+="</div>";
				return content;
			},
			hook: function(){
				var spriteType;
				if(_this.getMetaValue("mechBattleSceneUseSpriter") * 1){
					spriteType = "Spriter";
				} else if(_this.getMetaValue("mechBattleSceneUseDragonBones") * 1){
					spriteType = "DragonBones";
				} else if(_this.getMetaValue("mechBattleSceneUseSpine") * 1){
					spriteType = "Spine";
				} else if(_this.getMetaValue("mechBattleSceneUse3D") * 1){
					spriteType = "3D";
				} else {
					spriteType = "Default";
				}
				
				var overworldInfo = _this.getMetaValue("srpgOverworld").split(",");
				var divs = containerNode.querySelectorAll(".overworld_preview");
				divs.forEach(function(div){
					OverworldSpriteManager.loadOverworldByParams(overworldInfo[0], overworldInfo[1], div);
				});
				
				divs.forEach(function(div){
					div.addEventListener("click", async function(e){
						var elem = this;
						let result = await OverworldSpriteManager.showOverworldSelector(e, overworldInfo[0], overworldInfo[1], this);
						if(result.status == "updated"){
							_this.setMetaValue("srpgOverworld", result.faceName+","+result.faceIndex);							
							_this.show();
							_this._mainUIHandler.isModified();
						}
					});			
				});
				
				
				containerNode.querySelector("#basic_battle_selector_icon").addEventListener("click", async function(e){
					var elem = this;
					let result = await BasicBattleSpriteManager.showSelector(e, _this.getMetaValue("mechBasicBattleSprite"), this);
					if(result.status == "updated"){
						_this.setMetaValue("mechBasicBattleSprite", result.path)
						_this.show();
						_this._mainUIHandler.isModified();
					}
				});	
				
				containerNode.querySelector("#sprite_type_select").addEventListener("change", function(e){
					
					if(this.value == "Default"){
						_this.setMetaValue("mechBattleSceneUseDragonBones", 0);
						_this.setMetaValue("mechBattleSceneUseSpriter", 0);
						_this.setMetaValue("mechBattleSceneUseSpine", 0);
						_this.setMetaValue("mechBattleSceneUse3D", 0);
					} else if(this.value == "Spriter"){
						_this.setMetaValue("mechBattleSceneUseDragonBones", 0);
						_this.setMetaValue("mechBattleSceneUseSpriter", 1);
						_this.setMetaValue("mechBattleSceneUseSpine", 0);
						_this.setMetaValue("mechBattleSceneUse3D", 0);
					} else if(this.value == "Spine"){
						_this.setMetaValue("mechBattleSceneUseDragonBones", 0);
						_this.setMetaValue("mechBattleSceneUseSpriter", 0);
						_this.setMetaValue("mechBattleSceneUseSpine", 1);
						_this.setMetaValue("mechBattleSceneUse3D", 0);
					} else if(this.value == "3D"){
						_this.setMetaValue("mechBattleSceneUseDragonBones", 0);
						_this.setMetaValue("mechBattleSceneUseSpriter", 0);
						_this.setMetaValue("mechBattleSceneUseSpine", 0);
						_this.setMetaValue("mechBattleSceneUse3D", 1);
					} else {
						_this.setMetaValue("mechBattleSceneUseDragonBones", 1);
						_this.setMetaValue("mechBattleSceneUseSpriter", 0);
						_this.setMetaValue("mechBattleSceneUseSpine", 0);
						_this.setMetaValue("mechBattleSceneUse3D", 0);
					}		
					
					_this.show();
					_this._mainUIHandler.setModified();
				});
				
				let hookedProperties = [					
					"mechBattleYOffset",
					"mechBattleCenterYOffset",
					"mechBattleSceneShadowSize",
					"mechBattleSceneShadowOffsetZ",				
					"mechBattleSceneShadowOffsetX",					
					"mechBattleReferenceSize",					
				];
				
				if(spriteType == "Default"){
					hookedProperties.unshift("mechBattleSceneSpriteSize");
				}
				
				if(spriteType == "3D"){
					hookedProperties.unshift("mechBattleSceneSpriteRotation");
					hookedProperties.unshift("mechBattleSceneSpriteScale");					
				}
				
				if(spriteType == "DragonBones"){
					
					hookedProperties.push("mechBattleSceneCanvasWidth");
					hookedProperties.push("mechBattleSceneCanvasHeight");
				}
				
				if(spriteType == "Spine"){
					hookedProperties.push("mechBattleSceneCanvasWidth");
					hookedProperties.push("mechBattleSceneCanvasHeight");
				}
				
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
					"mechBattleSceneSprite",					
				];
				if(spriteType == "DragonBones"){
					hookedProperties.push("mechBattleSceneArmatureName");
				}
				hookedProperties.forEach(function(prop){
					containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
						let value = this.value;						
						_this.setMetaValue(prop, this.value);
						_this.show();
						_this._mainUIHandler.setModified();										
					});
				});
				
				containerNode.querySelector("#death_anim_select").addEventListener("change", function(e){
					_this.setMetaValue("mechBattleSceneDeathAnim", this.value);					
					_this.show();
					_this._mainUIHandler.setModified();
				});
			}	
		},
		animations: {
			createControls: function(){
				var content = "";
				content+="<div title='' class='table sub_section'>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Spawn";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Animation";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<div class='hint_text'>img/animations/</div>";
				content+="<input id='prop_mechSpawnAnimName' value='"+_this.getMetaValue("mechSpawnAnimName")+"'></input>";
				content+="<div class='hint_text'>.png</div>";
				content+="</div>";				
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimFrameSize", "Frame Size", "", "px");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimFrames", "Frames");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimSheetWidth", "Sheet Width", "", "px");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimSpeed", "Animation Speed", "", "frames");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimAppearFrame", "Change on Frame");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechSpawnAnimSoundEffect", "Sound Effect", "audio/se/", ".ogg");
				content+="</div>";
				
				content+="</div>";
				
				
				content+="<div title='' class='table sub_section'>";
				content+="<div title='' class='row'>";
				content+="<div class='cell'>";
				content+="Destroy";
				content+="</div>";
				content+="</div>";
				
				content+="<div class='row'>";	
				content+="<div class='cell'>";
				content+="Animation";
				content+="</div>";
				content+="<div class='cell'>";
				content+="<div class='hint_text'>img/animations/</div>";
				content+="<input id='prop_mechDestroyAnimName' value='"+_this.getMetaValue("mechDestroyAnimName")+"'></input>";
				content+="<div class='hint_text'>.png</div>";
				content+="</div>";				
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimFrameSize", "Frame Size", "", "px");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimFrames", "Frames");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimSheetWidth", "Sheet Width", "", "px");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimSpeed", "Animation Speed", "", "frames");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimAppearFrame", "Change on Frame");
				content+="</div>";
				
				content+="<div title='' class='row'>";
				content+=_this.createValueInput("mechDestroyAnimSoundEffect", "Sound Effect", "audio/se/", ".ogg");
				content+="</div>";
				
				content+="</div>";
				content+="</div>";
				
				return content;
			},
			hook: function(){
				let hookedProperties = [					
					"mechSpawnAnimFrameSize",
					"mechSpawnAnimFrames",
					"mechSpawnAnimSheetWidth",
					"mechSpawnAnimSpeed",
					"mechSpawnAnimAppearFrame",			

					"mechDestroyAnimFrameSize",
					"mechDestroyAnimFrames",
					"mechDestroyAnimSheetWidth",
					"mechDestroyAnimSpeed",
					"mechDestroyAnimAppearFrame",						
					
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
					"mechSpawnAnimName",	
					"mechSpawnAnimSoundEffect",
					"mechDestroyAnimName",	
					"mechDestroyAnimSoundEffect"
				];
			
				hookedProperties.forEach(function(prop){
					containerNode.querySelector("#prop_"+prop).addEventListener("change", function(){
						let value = this.value;						
						_this.setMetaValue(prop, this.value);
						//_this.show();
						_this._mainUIHandler.setModified();										
					});
				});
			}	
		}
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



MechUI.prototype.show = async function(){
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
	content+="<div class='title'>";
	content+="General Info";	
	content+="</div>";
	content+="<div class='content'>";
	content+=_this._propertyHandlers.menu_sprite.createControls();
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.name.createControls();
	content+=_this._propertyHandlers.is_ship.createControls();	
	
	content+=_this._propertyHandlers.inherits.createControls();
	
	
	content+="<div class='row'>";
	content+=_this._propertyHandlers.fund_yield.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.exp_yield.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.pp_yield.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.item_slots.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.fub.createControls();
	content+="</div>";
	content+="<div class='row'>";
	content+=_this._propertyHandlers.tags.createControls();
	content+="</div>";	
	
	content+="</div>";
	content+="</div>";
	content+="</div>";


	content+="<div class='section'>";
	content+="<div class='title'>";
	content+="Stats";	
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.stats.createControls();
	
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
	content+="Terrain";	
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	
	content+=_this._propertyHandlers.terrain.createControls();
	
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="<div class='row'>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Abilities";	
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	content+="<div class='table'>";
	content+=_this._propertyHandlers.abilities.createControls();
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Weapons";	
	content+="</div>";
	content+="<div class='content stats'>";
	
	
	
	content+=_this._propertyHandlers.weapons.createControls();
	content+="<div class='table'>";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Transformation";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.transformation.createControls();
	content+="<div class='table'>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Auto Transformation";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.auto_transformation.createControls();
	content+="<div class='table'>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Combination";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.combination.createControls();
	content+="<div class='table'>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="<div class='row'>";
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Deployment";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.deployment.createControls();
	content+="<div class='table'>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Sprites";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.sprites.createControls();
	content+="<div class='table'>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="Animations";	
	content+="</div>";
	content+="<div class='content transformation stats'>";
	
	
	
	content+=_this._propertyHandlers.animations.createControls();
	content+="<div class='table'>";
	
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


MechUI.prototype.hook = function(){
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



MechUI.prototype.hookPageControls = function(){
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
			
MechUI.prototype.getEmpty = function(id){
	return {
	  "id": id,
	  "learnings": [],
	  "name": "",
	  "note": "",
	  "meta": {}
	};
}			
		