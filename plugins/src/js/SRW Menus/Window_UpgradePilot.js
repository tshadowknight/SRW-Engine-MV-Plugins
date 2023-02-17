import Window_CSS from "./Window_CSS.js";
import AbilityList from "./AbilityList.js";
import "./style/Window_UpgradePilot.css";

export default function Window_UpgradePilot() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradePilot.prototype = Object.create(Window_CSS.prototype);
Window_UpgradePilot.prototype.constructor = Window_UpgradePilot;

Window_UpgradePilot.prototype.initialize = function() {	
	this._layoutId = "upgrade_pilot";	
	this._unitMode == "actor";
	this.resetDeltas();
	this._upgradeTypes = {
		0: {name: APPSTRINGS.PILOTSTATS.melee, id: "melee", desc: APPSTRINGS.PILOTUPGRADES.tool_tip_melee},
		1: {name: APPSTRINGS.PILOTSTATS.ranged, id: "ranged", desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_ranged},
		2: {name: APPSTRINGS.PILOTSTATS.skill, id: "skill", desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_skill},
		3: {name: APPSTRINGS.PILOTSTATS.defense, id: "defense", desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_defense},
		4: {name: APPSTRINGS.PILOTSTATS.evade, id: "evade", desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_evade},
		5: {name: APPSTRINGS.PILOTSTATS.hit, id: "hit", desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_hit},
		6: {name: APPSTRINGS.GENERAL.label_AIR, id: "air", isTerrain: true, desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_AIR},
		7: {name: APPSTRINGS.GENERAL.label_LND, id: "land", isTerrain: true, desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_LND},
		8: {name: APPSTRINGS.GENERAL.label_SEA, id: "water", isTerrain: true, desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_SEA},
		9: {name: APPSTRINGS.GENERAL.label_SPC, id: "space", isTerrain: true, desc:  APPSTRINGS.PILOTUPGRADES.tool_tip_SPC},
	};
	if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES){
		this._upgradeTypes[0].desc = APPSTRINGS.PILOTUPGRADES.tool_tip_offense;
		this._upgradeTypes[1].desc = APPSTRINGS.PILOTUPGRADES.tool_tip_offense;
	}
	this._currentUIState = "tab_selection"; //tab_selection, upgrading_pilot_stats, ability_selection, ability_replace_selection
	this._currentTab = 0;
	this._maxTab = 2;
	
	this._currentPage = 0;
	this._maxSelection = 10;
	this._currentSelection = 0;
	this._currentCost = 0;
	
	this._maxEquipSelection = 6;
	this._currentEquipSelection = 0;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_UpgradePilot.prototype.resetDeltas = function() {
	this._currentUpgradeDeltas = {
		melee: 0,
		ranged: 0,
		skill: 0,
		defense: 0,
		evade: 0, 
		hit: 0,
		air: 0,
		land: 0,
		water: 0,
		space:0	
	};
}

Window_UpgradePilot.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit.actor;	
}

Window_UpgradePilot.prototype.incrementSelection = function(){	
	if(this._currentUIState == "upgrading_pilot_stats"){
		SoundManager.playCursor();
		this._currentSelection++;
		//skip ranged
		if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && this._currentSelection == 1){
			this._currentSelection++;
		}
		if(this._currentSelection >= this._maxSelection){
			this._currentSelection = 0;
		}
	} else if(this._currentUIState == "ability_selection"){
		SoundManager.playCursor();
		this._abilityList.incrementSelection();
	} else if(this._currentUIState == "ability_equip_selection" || this._currentUIState == "ability_purchase_selection"){
		SoundManager.playCursor();
		this._currentEquipSelection++;
		if(this._currentEquipSelection >= this._maxEquipSelection){
			this._currentEquipSelection = 0;
		}
	}
}

Window_UpgradePilot.prototype.decrementSelection = function(){	
	if(this._currentUIState == "upgrading_pilot_stats"){
		SoundManager.playCursor();
		this._currentSelection--;
		//skip ranged
		if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && this._currentSelection == 1){
			this._currentSelection--;
		}
		if(this._currentSelection < 0){
			this._currentSelection = this._maxSelection - 1;
		}
	} else if(this._currentUIState == "ability_selection"){
		SoundManager.playCursor();
		this._abilityList.decrementSelection();
	} else if(this._currentUIState == "ability_equip_selection" || this._currentUIState == "ability_purchase_selection"){
		SoundManager.playCursor();
		this._currentEquipSelection--;
		if(this._currentEquipSelection < 0){
			this._currentEquipSelection = this._maxEquipSelection - 1;
		}
	}
}

Window_UpgradePilot.prototype.incrementUpgradeLevel = function(){
	if(this._currentUIState == "tab_selection"){
		SoundManager.playCursor();
		this._currentTab++;
		if(this._currentTab >= this._maxTab){
			this._currentTab = 0;
		}
	} else if(this._currentUIState == "upgrading_pilot_stats"){	
		var upgradeInfo = this._upgradeTypes[this._currentSelection];
		var upgradeId = upgradeInfo.id;
		var pilotData = this.getCurrentSelection();
		var stats = $statCalc.getPilotStats(pilotData);
		var upgradeLevels = stats.upgrades;
		if(upgradeInfo.isTerrain){
			var current = stats.calculated.terrain[upgradeId];
			var currentNumeric = $statCalc.terrainToNumeric(current);
			if(currentNumeric + this._currentUpgradeDeltas[upgradeId] < $statCalc.getMaxTerrainLevelNumeric()){
				this._currentUpgradeDeltas[upgradeId]++;
				SoundManager.playCursor();
			}
		} else {
			if(stats.calculated[upgradeId] + this._currentUpgradeDeltas[upgradeId] < $statCalc.getMaxPilotStat()){
				this._currentUpgradeDeltas[upgradeId]++;
				if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES){
					if(upgradeId == "melee"){
						this._currentUpgradeDeltas["ranged"]++;
					} else if(upgradeId == "ranged"){
						this._currentUpgradeDeltas["melee"]++;
					}
				}
				SoundManager.playCursor();
			}
		}	
	} else if(this._currentUIState == "ability_selection"){
		this._abilityList.incrementPage();
		SoundManager.playCursor();
	}
}

Window_UpgradePilot.prototype.decrementUpgradeLevel = function(){	
	if(this._currentUIState == "tab_selection"){
		SoundManager.playCursor();
		this._currentTab--;
		if(this._currentTab < 0){
			this._currentTab = this._maxTab-1;
		}
	} else if(this._currentUIState == "upgrading_pilot_stats"){
		var upgradeId = this._upgradeTypes[this._currentSelection].id;	
		if(this._currentUpgradeDeltas[upgradeId] > 0){
			this._currentUpgradeDeltas[upgradeId]--;
			if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES){
				if(upgradeId == "melee"){
					this._currentUpgradeDeltas["ranged"]--;
				} else if(upgradeId == "ranged"){
					this._currentUpgradeDeltas["melee"]--;
				}
			}
			SoundManager.playCursor();
		}
	} else if(this._currentUIState == "ability_selection"){
		SoundManager.playCursor();
		this._abilityList.decrementPage();
	}
}

Window_UpgradePilot.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.PILOTUPGRADES.stats_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	/*this._upgradeControls = document.createElement("div");	
	this._upgradeControls.classList.add("upgrade_controls");	
	windowNode.appendChild(this._upgradeControls);
	*/
	this._fundsDisplay = document.createElement("div");	
	this._fundsDisplay.classList.add("fund_display");	
	windowNode.appendChild(this._fundsDisplay);
	
	this._pilotInfoDisplay = document.createElement("div");	
	this._pilotInfoDisplay.classList.add("pilot_info");	
	windowNode.appendChild(this._pilotInfoDisplay);
	
	this._toolTip = document.createElement("div");	
	this._toolTip.classList.add("tool_tip");	
	this._toolTip.classList.add("scaled_text");	
	windowNode.appendChild(this._toolTip);
	
	this._pilotStatsTabButton = document.createElement("div");	
	this._pilotStatsTabButton.classList.add("tab_button");	
	this._pilotStatsTabButton.classList.add("pilot_stats_button");	
	this._pilotStatsTabButton.classList.add("scaled_text");			
	this._pilotStatsTabButton.innerHTML = APPSTRINGS.GENERAL.label_stats;
	windowNode.appendChild(this._pilotStatsTabButton);
	this._pilotStatsTabButton.addEventListener("click", function(){		
		_this._currentTab = 0;
		_this._currentUIState = "upgrading_pilot_stats";		
		_this.requestRedraw();
	});
	
	this._abilitiesTabButton = document.createElement("div");	
	this._abilitiesTabButton.classList.add("tab_button");	
	this._abilitiesTabButton.classList.add("abilities_button");	
	this._abilitiesTabButton.classList.add("scaled_text");	
	this._abilitiesTabButton.innerHTML = APPSTRINGS.GENERAL.label_abilities;
	windowNode.appendChild(this._abilitiesTabButton);
	this._abilitiesTabButton.addEventListener("click", function(){		
		_this._currentTab = 1;
		_this._currentSelection = 0;
		_this.resetDeltas();
		_this._currentUIState = "ability_selection";			
		_this.requestRedraw();
	});
	
	this._upgradeControls = document.createElement("div");	
	this._upgradeControls.classList.add("upgrade_controls");	
	windowNode.appendChild(this._upgradeControls);
	
	this._currentAbilities = document.createElement("div");	
	this._currentAbilities.classList.add("current_abilities");	
	windowNode.appendChild(this._currentAbilities);
	
	this._abilityListContainer = document.createElement("div");	
	this._abilityListContainer.classList.add("ability_list_container");	
	windowNode.appendChild(this._abilityListContainer);
	this._abilityList = new AbilityList(this._abilityListContainer, this, true);
	this._abilityList.createComponents();
	this._abilityList.registerTouchObserver("ok", function(){if(_this._currentUIState == "ability_selection"){_this._touchOK = true;}});
	this._abilityList.registerTouchObserver("left", function(){if(_this._currentUIState == "ability_selection"){_this._touchLeft = true;}});
	this._abilityList.registerTouchObserver("right", function(){if(_this._currentUIState == "ability_selection"){_this._touchRight = true;}});
	this._abilityList.registerObserver("redraw", function(){if(_this._currentUIState == "ability_selection"){_this.requestRedraw();}});
}	


Window_UpgradePilot.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			this.incrementSelection();
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();			
			this.decrementSelection();
			this.refresh();
			return;	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left') || this._touchLeft){
			this.requestRedraw();
			this.decrementUpgradeLevel();
			this.refresh();
			return;	
		} else if (Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight) {
			this.requestRedraw();
			this.incrementUpgradeLevel();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
		
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
		
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.resetDeltas();
			this.requestRedraw();	
			this._currentUIState = "tab_selection";	
			$gameTemp.currentMenuUnit = this.getPreviousAvailablePilotGlobal(this.getCurrentSelection().actorId());	
			this.refresh();
			return;	
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.resetDeltas();
			this.requestRedraw();		
			this._currentUIState = "tab_selection";				
			$gameTemp.currentMenuUnit = this.getNextAvailablePilotGlobal(this.getCurrentSelection().actorId());
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
		} 	
		
		if(Input.isTriggered('ok') || _this._touchOK){
			this.requestRedraw();
			
			if(this._currentUIState == "tab_selection"){
				SoundManager.playOk();
				if(this._currentTab == 0){
					this._currentUIState = "upgrading_pilot_stats";					
				} else {
					this._currentSelection = 0;
					this.resetDeltas();
					this._currentUIState = "ability_selection";				
				}				
			} else if(this._currentUIState == "upgrading_pilot_stats"){			
				var cost = this.currentCost();		
				var pilotData = this.getCurrentSelection();
				if(cost <= $statCalc.getCurrentPP(pilotData)){
					SoundManager.playOk();
					$statCalc.applyPilotUpgradeDeltas(pilotData, this._currentUpgradeDeltas);
					$statCalc.subtractPP(pilotData, cost);
					$statCalc.storeActorData(pilotData);
				} else {
					SoundManager.playCancel();
				}
				this.resetDeltas();
			} else if(this._currentUIState == "ability_selection"){					
				var pilotData = this.getCurrentSelection();
				var current = this._abilityList.getCurrentSelection();
				var learnedAbilities = $statCalc.getLearnedPilotAbilities(pilotData);
				
				if((learnedAbilities[current.idx] && learnedAbilities[current.idx].slot == -1)){
					SoundManager.playOk();
					this._currentUIState = "ability_equip_selection";
				} else if(!learnedAbilities[current.idx] || (current.info.hasLevel && learnedAbilities[current.idx].level < current.info.maxLevel)){
					var level = 0;
					if(current.info.hasLevel && learnedAbilities[current.idx]){
						level = learnedAbilities[current.idx].level;
					}
					var cost = current.info.cost[level];
					if(!Number.isNaN(cost) && (cost <= $statCalc.getCurrentPP(pilotData))){
						SoundManager.playOk();
						this._currentUIState = "ability_purchase_selection";
					} else {
						SoundManager.playCancel();
					}
				}				
			} else if(this._currentUIState == "ability_purchase_selection"){	
				SoundManager.playOk();
				var pilotData = this.getCurrentSelection();
				var current = this._abilityList.getCurrentSelection();
				var learnedAbilities = $statCalc.getLearnedPilotAbilities(pilotData);
				var abilityList = $statCalc.getPilotAbilityList(pilotData);
				
				var replacedAbility = abilityList[this._currentEquipSelection];
				var replacedIsUnique = false;
				if(replacedAbility){
					replacedIsUnique = $pilotAbilityManager.getAbilityDisplayInfo(replacedAbility.idx).isUnique;
				}
			
				if(!replacedAbility || !replacedIsUnique){
					var level = 0;
					if(current.info.hasLevel && learnedAbilities[current.idx]){
						level = learnedAbilities[current.idx].level;
					}
					var newLevel = level;
					if(newLevel < current.info.maxLevel){
						newLevel++
					}
					var cost = current.info.cost[level];
					
					
					if(!Number.isNaN(cost)){					
						$statCalc.subtractPP(pilotData, cost);
						$statCalc.learnAbility(pilotData, {
							idx: current.idx,
							level: newLevel,
							requiredLevel: 1,
							slot: this._currentEquipSelection		
						})
						if(replacedAbility){
							abilityList[this._currentEquipSelection].slot = -1;
						}					
						$statCalc.storeActorData(pilotData);
					}
					this._currentUIState = "ability_selection";
				}
			} else if(this._currentUIState == "ability_equip_selection"){		
				SoundManager.playOk();	
				var pilotData = this.getCurrentSelection();
				var current = this._abilityList.getCurrentSelection();
				var learnedAbilities = $statCalc.getLearnedPilotAbilities(pilotData);
				var abilityList = $statCalc.getPilotAbilityList(pilotData);
				
				var replacedAbility = abilityList[this._currentEquipSelection];
				var replacedIsUnique = false;
				if(replacedAbility){
					replacedIsUnique = $pilotAbilityManager.getAbilityDisplayInfo(replacedAbility.idx).isUnique;
				}
			
				if(!replacedAbility || !replacedIsUnique){									
					$statCalc.learnAbility(pilotData, {
						idx: current.idx,
						level: learnedAbilities[current.idx].level,
						requiredLevel: learnedAbilities[current.idx].requiredLevel,
						slot: this._currentEquipSelection		
					})
					if(replacedAbility){
						abilityList[this._currentEquipSelection].slot = -1;
					}					
					$statCalc.storeActorData(pilotData);
					
					this._currentUIState = "ability_selection";
				}
			}
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			SoundManager.playCancel();
			this.requestRedraw();
			if(this._currentUIState == "tab_selection"){
				this._currentSelection = 0;
				this.resetDeltas();	
				$gameTemp.popMenu = true;	
			} else if(this._currentUIState == "upgrading_pilot_stats" || this._currentUIState == "ability_selection"){			
				this._currentUIState = "tab_selection";							
			}  else if(this._currentUIState == "ability_equip_selection" || this._currentUIState == "ability_purchase_selection"){			
				this._currentUIState = "ability_selection";							
			}
			this.refresh();
			return;		
		}		
		this.resetTouchState();
		this.refresh();
	}		
};

Window_UpgradePilot.prototype.getWeaponLevels = function() {
	var _this = this;
	var mechData = this.getCurrentSelection();
	var upgradeLevels = mechData.stats.upgradeLevels;
	var upgradeDef = _this._upgradeTypes[0];
	var levels = [];
	for(var i = 0; i < _this._currentUpgradeDeltas[upgradeDef.id]; i++){
		levels.push(i + upgradeLevels[upgradeDef.id]);
	}
	return levels;
}

Window_UpgradePilot.prototype.currentCost = function() {
	var _this = this;
	if(this._currentUIState == "ability_purchase_selection" || this._currentUIState == "ability_selection"){
		return this._abilityList.getCurrentSelectionCost();
	}
	var pilotData = this.getCurrentSelection();
	var pilotStats = $statCalc.getPilotStats(pilotData);
	var cost = 0;
	Object.keys(_this._upgradeTypes).forEach(function(idx){
		var upgradeInfo = _this._upgradeTypes[idx];
		if(!ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES || upgradeInfo.id != "ranged"){	
			var currentDelta = _this._currentUpgradeDeltas[upgradeInfo.id];
			if(upgradeInfo.isTerrain){
				var levels = [];
				var currentLevel = $statCalc.terrainToNumeric(pilotStats.calculated.terrain[upgradeInfo.id]);
				for(var i = 0; i < _this._currentUpgradeDeltas[upgradeInfo.id]; i++){
					levels.push(currentLevel+i);
				}
				cost+=$statCalc.getPilotTerrainIncreaseCost(levels);
			} else {
				cost+=currentDelta*10;
			}
		}
	});
	return cost;	
}

Window_UpgradePilot.prototype.redraw = function() {
	var _this = this;
	var pilotData = this.getCurrentSelection();
	var abilityList = $statCalc.getPilotAbilityList(pilotData);
	var currentLevel = $statCalc.getCurrentLevel(pilotData);
	var upgradeControlContent = "";
	
	var pilotInfoContent = "";
	pilotInfoContent+="<div id='upgrade_pilot_icon'></div>";
	
	pilotInfoContent+="<div class='pilot_basic_info'>";
	pilotInfoContent+="<div class='pilot_name scaled_text'>";
	pilotInfoContent+=pilotData.name();
	pilotInfoContent+="</div>";
	pilotInfoContent+="<div class='pilot_lv_sp scaled_text'>";
	
	pilotInfoContent+="<div class='pilot_lv '>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="Lv";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	pilotInfoContent+=$statCalc.getCurrentLevel(pilotData);
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="<div class='pilot_sp'>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="SP";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	pilotInfoContent+=$statCalc.getCurrentSP(pilotData);
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="</div>";
	
	_this._pilotInfoDisplay.innerHTML = pilotInfoContent;
	
	var fundDisplayContent = "";
	fundDisplayContent+="<div class='fund_entries'>";
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.PILOTUPGRADES.label_available_PP+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+$statCalc.getCurrentPP(pilotData)+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.PILOTUPGRADES.label_required_PP+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+this.currentCost()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.PILOTUPGRADES.label_remaining_PP+"</div>";
	var remaining = $statCalc.getCurrentPP(pilotData) - this.currentCost();
	fundDisplayContent+="<div class='fund_entry_value scaled_text "+(remaining < 0 ? "underflow" : "")+"'>"+remaining+"</div>";
	fundDisplayContent+="</div>";
	
	
	fundDisplayContent+="<div id='btn_apply' class='disabled scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_apply+"</div>";
	fundDisplayContent+="</div>";
	fundDisplayContent+="</div>";
	
	this._fundsDisplay.innerHTML = fundDisplayContent;
	
	var actorIcon = this._container.querySelector("#upgrade_pilot_icon");
	this.loadActorFace(pilotData.actorId(), actorIcon);
	this.updateScaledDiv(actorIcon);
	
	var upgradeControlContent = "";
	if(_this._currentPage == 0){
		var statDisplayInfo = {
			
		}
		function prepareDisplayVal(val){
			return String(val).padStart(3, "0")
		}
		
		var pilotStats = $statCalc.getPilotStats(pilotData);
		function createStatUpgradeRow(idx){			
			var upgradeInfo = _this._upgradeTypes[idx];
			var isTerrain = upgradeInfo.isTerrain;
			var stat = upgradeInfo.id;
			
			var content = "";
			var stats;
			if(isTerrain){
				stats = pilotStats.calculated.terrain;
			} else {
				stats = pilotStats.calculated;
			}
			var upgrades;
			if(isTerrain){
				upgrades = pilotStats.upgrades.terrain;
			} else {
				upgrades = pilotStats.upgrades;
			}
			var isSelected = false;
			if(idx == _this._currentSelection || ((ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && _this._currentSelection == 0) && idx == 1)){
				isSelected = true;
			}
			content+="<div data-idx='"+idx+"' class='upgrade_control_row "+(isSelected ? "selected" : "")+"'>";
			content+="<div class='upgrade_control_block'>";
			content+="<div class='scaled_text stat_label'>";
			content+=upgradeInfo.name;
			content+="</div>";
			content+="<div class='scaled_text stat_value'>";
			if(isTerrain){
				content+=stats[stat];
			} else {
				content+=prepareDisplayVal(stats[stat]);
			}		
			
			content+="</div>";
			content+="<div class='chevron_right scaled_width'>";
			content+="<img src='svg/chevron_right.svg'>";
			content+="</div>";
			content+="</div>";
			content+="<div class='upgrade_control_block'>";
			content+="<div class='scaled_text stat_value_upgraded'>";
			if(isTerrain){				
				content+="<div class='scaled_text terrain_upgraded'>";
				content+="<div data-idx='"+idx+"' class='decrement upgrade_control'><img src='svg/minus.svg'></div>";
				content+=$statCalc.incrementTerrain(stats[stat],  _this._currentUpgradeDeltas[stat]);
				content+="<div data-idx='"+idx+"' class='increment upgrade_control'><img src='svg/plus.svg'></div>";
				content+="</div>";			
			} else {
				content+=prepareDisplayVal(stats[stat] + _this._currentUpgradeDeltas[stat]);
			}			
			content+="</div>";
			if(!isTerrain){
				content+="<div class='scaled_text pending_upgrades'>";
				content+="<div data-idx='"+idx+"' class='decrement upgrade_control'><img src='svg/minus.svg'></div>";
				content+="<div>( +"+prepareDisplayVal(_this._currentUpgradeDeltas[stat])+" / "+prepareDisplayVal(upgrades[stat])+")</div>";
				content+="<div data-idx='"+idx+"' class='increment upgrade_control'><img src='svg/plus.svg'></div>";
				content+="</div>";
			} 
			
			content+="</div>";
			content+="<div class='scaled_text upgrade_control_block'>";
			if(isTerrain){
				var levels = [];
				var currentLevel = $statCalc.terrainToNumeric(stats[stat]);
				for(var i = 0; i < _this._currentUpgradeDeltas[stat]; i++){
					levels.push(currentLevel+i);
				}
				content+=$statCalc.getPilotTerrainIncreaseCost(levels);
			} else {
				if(!ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES || idx != 1){
					content+=_this._currentUpgradeDeltas[stat] * 10;
				}				
			}			
			content+="</div>";
			content+="</div>";
			return content;
		}
		
		upgradeControlContent+="<div class='upgrade_control_row header'>";
		upgradeControlContent+="<div class='upgrade_control_block scaled_text'>";
		upgradeControlContent+=APPSTRINGS.PILOTUPGRADES.label_ability;
		upgradeControlContent+="</div>";
		upgradeControlContent+="<div class='upgrade_control_block scaled_text'>";
		upgradeControlContent+=APPSTRINGS.PILOTUPGRADES.label_points_added;
		upgradeControlContent+="</div>";
		upgradeControlContent+="<div class='upgrade_control_block scaled_text'>";
		upgradeControlContent+=APPSTRINGS.PILOTUPGRADES.label_required_PP;
		upgradeControlContent+="</div>";
		upgradeControlContent+="</div>";
		
		Object.keys(_this._upgradeTypes).sort().forEach(function(idx){
			upgradeControlContent+=createStatUpgradeRow(idx);
		});
		_this._toolTip.innerHTML = _this._upgradeTypes[_this._currentSelection].desc;
	}
	
	this._upgradeControls.innerHTML = upgradeControlContent;
	
	
	var currentAbilitiesContent = "";
	currentAbilitiesContent+="<div class='abilities_label scaled_text'>";
	currentAbilitiesContent+=APPSTRINGS.GENERAL.label_abilities;	
	currentAbilitiesContent+="</div>";			
	for(var i = 0; i < 6; i++){
		var displayName = "---";
		var uniqueString = "";
		if(typeof abilityList[i] != "undefined" && abilityList[i].requiredLevel <= currentLevel){
			var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(abilityList[i].idx);
			if($gameSystem.isHiddenActorAbility(pilotData, abilityList[i].idx)){
				displayName = "?????";
			} else {	
				displayName = displayInfo.name;
				if(displayInfo.hasLevel){
					displayName+="L"+abilityList[i].level;
				}
				if(displayInfo.isUnique){
					uniqueString = "*";
				} else {
					uniqueString = "&nbsp;";
				}
			}
		}
		var displayClass = "";
		if((this._currentUIState == "ability_equip_selection" || this._currentUIState == "ability_purchase_selection") && i == this._currentEquipSelection){
			displayClass = "selected";
		}
		currentAbilitiesContent+="<div data-idx='"+i+"' class='pilot_stat_container scaled_text fitted_text "+displayClass+"'>";
		currentAbilitiesContent+="<div class='unique_skill_mark scaled_width'>"+uniqueString+"</div>";
		currentAbilitiesContent+="<div class='stat_value'>"+displayName+"</div>";
		currentAbilitiesContent+="</div>";			
	}
	
	this._currentAbilities.innerHTML = currentAbilitiesContent;
	
	this._pilotStatsTabButton.classList.remove("selected");
	this._abilitiesTabButton.classList.remove("selected");
	if(_this._currentTab == 0){
		this._pilotStatsTabButton.classList.add("selected");
		this._currentAbilities.style.display = "none";
		this._abilityListContainer.style.display = "none";
		this._upgradeControls.style.display = "";
	} else {
		this._abilitiesTabButton.classList.add("selected");
		this._upgradeControls.style.display = "none";
		this._currentAbilities.style.display = "";
		this._abilityListContainer.style.display = "";
	}	
	this._upgradeControls.classList.remove("inactive");
	this._currentAbilities.classList.remove("inactive");	
	this._abilityListContainer.classList.remove("inactive");
	
	if(this._currentUIState == "tab_selection"){
		_this._toolTip.innerHTML = APPSTRINGS.PILOTUPGRADES.tool_tip_start;
		this._upgradeControls.classList.add("inactive");
		this._currentAbilities.classList.add("inactive");
		this._abilityListContainer.classList.add("inactive");
	} else if(this._currentUIState == "upgrading_pilot_stats"){
		this._upgradeControls.style.display = "";
		this._currentAbilities.style.display = "none";
		this._abilityListContainer.style.display = "none";
	} else if(this._currentUIState == "ability_selection"){
		this._toolTip.innerHTML = this._abilityList.getCurrentSelection().info.desc;
		this._upgradeControls.style.display = "none";
		this._currentAbilities.style.display = "";
		this._abilityListContainer.style.display = "";
	} else if(this._currentUIState == "ability_purchase_selection"){
		this._toolTip.innerHTML = this._abilityList.getCurrentSelection().info.desc;
	}
	
	this._abilityList.redraw();
	
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".upgrade_control_row");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			if(_this._currentUIState == "upgrading_pilot_stats"){
				var idx = this.getAttribute("data-idx");	
				if(idx != null){
					_this._currentSelection = idx;
					if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && idx == 1){
						_this._currentSelection = 0;
					}
					_this.requestRedraw();
					Graphics._updateCanvas();	
				}	
			}					
		});
	});	
	
	var entries = windowNode.querySelectorAll(".decrement");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			if(_this._currentUIState == "upgrading_pilot_stats"){
				var idx = this.getAttribute("data-idx");				
				_this._currentSelection = idx;
				if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && idx == 1){
					_this._currentSelection = 0;
				}
				_this._touchLeft = true;		
			}					
		});
	});	
	
	var entries = windowNode.querySelectorAll(".increment");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			if(_this._currentUIState == "upgrading_pilot_stats"){
				var idx = this.getAttribute("data-idx");				
				_this._currentSelection = idx;
				if(ENGINE_SETTINGS.MERGE_ATTACK_UPGRADES && idx == 1){
					_this._currentSelection = 0;
				}
				_this._touchRight = true;		
			}					
		});
	});
	
	var entries = windowNode.querySelectorAll(".pilot_stat_container");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			if(_this._currentUIState == "ability_purchase_selection" || _this._currentUIState == "ability_equip_selection"){
				var idx = this.getAttribute("data-idx"); 
				if(idx != null){
					idx*=1;
					if(idx == _this._currentEquipSelection){
						_this._touchOK = true;				
					} else {
						_this._currentEquipSelection = idx;
						_this.requestRedraw();
					}
				}						
			}					
		});
	});
	
	windowNode.querySelector("#btn_apply").addEventListener("click", function(){
		_this._touchOK = true;
	});
	var cost = this.currentCost();					
	var pilotData = this.getCurrentSelection();
	if(cost > 0 && cost <= $statCalc.getCurrentPP(pilotData)){
		windowNode.querySelector("#btn_apply").classList.remove("disabled");		
	} else {
		windowNode.querySelector("#btn_apply").classList.add("disabled");
	}
	
	var entries = windowNode.querySelectorAll(".upgrade_control");
	entries.forEach(function(entry){
		_this.updateScaledDiv(entry);
	});
	
	
	
	
	Graphics._updateCanvas();
}