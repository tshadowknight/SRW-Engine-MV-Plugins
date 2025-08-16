import Window_CSS from "./Window_CSS.js";
import "./style/Window_Intermission.css";

export default function Window_Intermission(CSSUIManager) {
	this.initialize.apply(this, arguments);	
}

Window_Intermission.prototype = Object.create(Window_CSS.prototype);
Window_Intermission.prototype.constructor = Window_Intermission;

Window_Intermission.prototype.show = function() {
	//this.resetSelection();
	this._handlingInput = false;
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();	
	this.triggerCustomBgCreate();
	Graphics._updateCanvas();
};

Window_Intermission.prototype.getCategoryIdx = function(category) {
	let result = -1;
	let ctr = 0;
	while(ctr < this._commands.length && result == -1){
		if(this._commands[ctr].key == category){
			result = ctr;
		}
		ctr++;
	}
	return result;
}

Window_Intermission.prototype.createSubCategoryList = function(container, category, id) {
	let idx = this.getCategoryIdx(category);
	if(idx != -1){
		this.createEntryList(container, this._commands[idx].subCommands, id);	
	}	
}

Window_Intermission.prototype.initialize = function() {
	var _this = this;
	
	_this.titleConfirmSelection = true;
	
	function validateReassignMenu(){
		var availableMechs = Window_CSS.prototype.getAvailableUnits.call(_this);
		var tmp = [];	
		availableMechs.forEach(function(unit){
			if(unit.SRWStats.mech.allowedPilots.length || unit.SRWStats.mech.hasVariableSubPilots){
				tmp.push(unit);
			}
		});
		return tmp.length;	
	}
	
	function validateMechMenu(){
		var availableMechs = Window_CSS.prototype.getAvailableUnits.call(_this, "mech");
		return availableMechs.length;	
	}
	
	function validatePilotMenu(){
		var availablePilots = Window_CSS.prototype.getAvailableUnits.call(_this, "actor");
		return availablePilots.length;	
	}
	
	function validateDeployMenu(){
		return validateMechMenu() && validatePilotMenu();
	}
	
	function validateEquips(){
		return $equipablesManager.getCurrentInventory().length > 0;
	}
	
	this._commands = [
		{name: APPSTRINGS.INTERMISSION.mech_label, key: "mech", enabled: validateMechMenu, subCommands: [
			{name: APPSTRINGS.INTERMISSION.list_label, key: "mech_list"},
			{name: APPSTRINGS.INTERMISSION.upgrade_label, key: "mech_upgrade"},
			{name: APPSTRINGS.INTERMISSION.equip_parts, key: "mech_parts"},			
			{name: APPSTRINGS.INTERMISSION.sell_parts, key: "sell_parts"},			
			//{name: "Sell Parts", key: "mech_parts_sell"},
			//{name: "Search", key: "mech_search"}
		]},
		{name: APPSTRINGS.INTERMISSION.pilot_label, key: "pilot", enabled: validatePilotMenu, subCommands: [
			{name: APPSTRINGS.INTERMISSION.list_label, key: "pilot_list"},
			{name:  APPSTRINGS.INTERMISSION.upgrade_label, key: "upgrade_pilot"},
			//{name: "Search", key: "pilot_search"}
		]},
		{name: APPSTRINGS.INTERMISSION.deployment, key: "deployment", enabled: validateDeployMenu,},
		{name: APPSTRINGS.INTERMISSION.reassign, key: "reassign", enabled: validateReassignMenu},
		{name: APPSTRINGS.INTERMISSION.options, key: "options"},
		{name: APPSTRINGS.INTERMISSION.data_label, key: "data", subCommands: [
			{name: APPSTRINGS.INTERMISSION.data_save_label, key: "data_save"},
			{name:  APPSTRINGS.INTERMISSION.data_load_label, key: "data_load"},
			{name:  APPSTRINGS.INTERMISSION.data_title_label, key: "title"},
			//{name: "Search", key: "pilot_search"}
		]},
		{name: APPSTRINGS.INTERMISSION.next_map, key: "next_map"}
	];
	if(ENGINE_SETTINGS.INTERMISSION_CATEGORIES){
		const enabledCategories = ENGINE_SETTINGS.INTERMISSION_CATEGORIES;
		this._commands = this._commands.filter((item) => {return enabledCategories[item.key]});	
	}	
	if(ENGINE_SETTINGS.ENABLE_EQUIPABLES){
		this._commands[0].subCommands.push({name: APPSTRINGS.INTERMISSION.equip_weapons, key: "equip_weapons", enabled: validateEquips});
		this._commands[0].subCommands.push({name: APPSTRINGS.INTERMISSION.upgrade_equip_weapon, key: "upgrade_equip_weapon", enabled: validateEquips});
	}
	
	this._tooltips = APPSTRINGS.INTERMISSION.tool_tips;
	this._menuLevels = [0];
	this._currentLevel = 0;		
	this._currentKey = this._commands[0].key;
	
	var width = this.windowWidth();
	var height = this.windowHeight();
	this._layoutId = "intermission_menu";
	Window_CSS.prototype.initialize.call(this, -25, -25, width, height);	
	
	
	
	this.rowMargin = 4;
	this.refresh();
	this.hide();
	this.deactivate();		
	this._actor;
	this._currentSelection = 0;
	this._maxSelection = 5;
	this._handlers = {};
	this._internalHandlers = {
		"next_map": function(){
			if(this._handlers.intermissionEnd){
				this._handlers.intermissionEnd();
			}
		},
		"mech": function(){
			this._handlingInput = false;
			if(validateMechMenu()){
				this._currentSelection = 0;
				this._menuLevels.push(0);
				this.requestRedraw();
				return false;//isprevented
			}			
			
			return true; //isprevented
		},
		"pilot": function(){
			this._handlingInput = false;
			if(validatePilotMenu()){
				this._currentSelection = 0;
				this._menuLevels.push(0);
				this.requestRedraw();
				return false;//isprevented
			}			
			
			return true; //isprevented
		},
		"data": function(){
			this._currentSelection = 0;
			this._menuLevels.push(0);
			this.requestRedraw();
			this._handlingInput = false;
		},
		"mech_list": function(){
			$gameTemp.pushMenu = "mech_list";
		},
		"mech_upgrade": function(){
			$gameTemp.pushMenu = "upgrade_unit_selection";
		},
		"pilot_list": function(){
			$gameTemp.pushMenu = "pilot_list";
		},
		"upgrade_pilot": function(){
			$gameTemp.pushMenu = "pilot_upgrade_list";
		},
		"mech_parts": function(){
			$gameTemp.pushMenu = "equip_item_select";
		}, 
		"equip_weapons": function(){
			this._handlingInput = false;
			if(validateEquips()){
				$gameTemp.pushMenu = "equip_weapon_select";
				return false;//isprevented
			}
			return true;
		}, 
		"upgrade_equip_weapon": function(){
			this._handlingInput = false;
			if(validateEquips()){
				$gameTemp.pushMenu = "upgrade_equip_weapon";	
				return false;//isprevented	
			}		
			return true;	
		}, 
		
		"sell_parts": function(){
			$gameTemp.pushMenu = "sell_item";
		}, 
		"data_save": function(){
			_this.hide();
			SceneManager.push(Scene_Save);
		},	
		"data_load": function(){
			_this.hide();
			SceneManager.push(Scene_Load);
		},	
		"title": function(){
			_this._handlingInput = false;
			_this.titleConfirmSelection = true;
			_this._state = "confirm_title";
			_this.requestRedraw();
		},			
		"options": function(){
			/*_this.hide();
			SceneManager.push(Scene_Options);*/
			$gameTemp.pushMenu = "options";
		},	
		"deployment": function(){
			_this._handlingInput = false; 
			if(validateDeployMenu()){
				$gameTemp.pushMenu = "deployment";
				return false;//isprevented
			} 
			
			return true; //isprevented	
		},	
		"reassign": function(){
			if(validateReassignMenu()){
				$gameTemp.pushMenu = "mech_reassign_select";
				return false;//isprevented
			}			
			_this._handlingInput = false; 
			return true; //isprevented
		}		
	};	
};

Window_Intermission.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	if(ENGINE_SETTINGS.ENABLE_FAV_POINTS){
		windowNode.classList.add("fav_points_enabled");
	}
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.INTERMISSION.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._tooltip = document.createElement("div");
	this._tooltip.id = this.createId("tooltip");
	this._tooltip.classList.add("scaled_text");
	this._tooltipText = document.createElement("div");
	this._tooltipText.classList.add("tooltip_text");
	this._tooltipText.innerHTML = "";	
	this._tooltip.appendChild(this._tooltipText);
	this._tooltipLine = document.createElement("div");
	this._tooltipLine.classList.add("tooltip_line");
	this._tooltip.appendChild(this._tooltipLine);
	windowNode.appendChild(this._tooltip);
	
	this._menuSection1 = document.createElement("div");
	this.createEntryList(this._menuSection1, this._commands, "section_1");	
	windowNode.appendChild(this._menuSection1);	
	
	this._menuSectionMech = document.createElement("div");
	this.createSubCategoryList(this._menuSectionMech, "mech", "section_mech");	
	windowNode.appendChild(this._menuSectionMech);
	
	this._menuSectionPilot = document.createElement("div");
	this.createSubCategoryList(this._menuSectionPilot, "pilot", "section_pilot");	
	windowNode.appendChild(this._menuSectionPilot);
	
	this._menuSectionData = document.createElement("div");
	this.createSubCategoryList(this._menuSectionData, "data", "section_data");	
	windowNode.appendChild(this._menuSectionData);
	
	this._deployCount = document.createElement("div");
	this._deployCount.id = this.createId("deploy_count");
	this._deployCount.classList.add("scaled_text");
	this._deployCountText = document.createElement("div");
	this._deployCountText.classList.add("next_stage_info_text");
	
	this._deployCount.appendChild(this._deployCountText);
	windowNode.appendChild(this._deployCount);

	this._terrainWarning = document.createElement("div");
	this._terrainWarning.id = this.createId("terrain_warning");
	this._terrainWarning.classList.add("scaled_text");
	this._terrainWarningText = document.createElement("div");
	this._terrainWarningText.classList.add("next_stage_info_text");
	
	this._terrainWarning.appendChild(this._terrainWarningText);
	windowNode.appendChild(this._terrainWarning);
	
	this._divider = document.createElement("div");
	this._divider.id = this.createId("divider");
	windowNode.appendChild(this._divider);
	
	this._srFundsDisplay = document.createElement("div");
	this._srFundsDisplay.id = this.createId("sr_and_funds");
	this._srFundsDisplay.classList.add("scaled_text");
	
	this._srDisplay = document.createElement("div");
	this._srDisplay.classList.add("sr_display");
	this._srPointsLabel = document.createElement("div");
	this._srPointsLabel.innerHTML = APPSTRINGS.INTERMISSION.sr_points;
	this._srDisplay.appendChild(this._srPointsLabel);	
	this._srPointsValue = document.createElement("div");
	this._srPointsValue.classList.add("sr_value");
	this._srDisplay.appendChild(this._srPointsValue);	
	
	if(ENGINE_SETTINGS.ENABLE_FAV_POINTS){
		this._favDisplay = document.createElement("div");
		this._favDisplay.classList.add("fav_display");
		this._favPointsLabel = document.createElement("div");
		this._favPointsLabel.innerHTML = APPSTRINGS.INTERMISSION.fav_points;
		this._favDisplay.appendChild(this._favPointsLabel);	
		this._favPointsValue = document.createElement("div");
		this._favPointsValue.classList.add("fav_value");
		this._favDisplay.appendChild(this._favPointsValue);
	}
	
	this._fundsDisplay = document.createElement("div");	
	this._fundsDisplay.classList.add("funds_display");
	this._fundsLabel = document.createElement("div");
	this._fundsLabel.innerHTML = APPSTRINGS.INTERMISSION.funds;
	this._fundsDisplay.appendChild(this._fundsLabel);
	this._fundsValue = document.createElement("div");
	this._fundsValue.classList.add("funds_value");
	this._fundsDisplay.appendChild(this._fundsValue);	
	
	this._srFundsDisplay.appendChild(this._srDisplay);
	if(ENGINE_SETTINGS.ENABLE_FAV_POINTS){
		this._srFundsDisplay.appendChild(this._favDisplay);
	}
	this._srFundsDisplay.appendChild(this._fundsDisplay);
	
	windowNode.appendChild(this._srFundsDisplay);
	
	this._stageAndTurnInfo = document.createElement("div");
	this._stageAndTurnInfo.id = this.createId("stage_and_turn");
	this._stageAndTurnInfo.classList.add("scaled_text");
	
	this._stageInfo = document.createElement("div");
	this._stageInfo.classList.add("stage_info");
	this._stageInfo.classList.add("scaled_text");
	this._stageInfo.classList.add("fitted_text");
	this._stageAndTurnInfo.appendChild(this._stageInfo);
	
	this._turnInfo = document.createElement("div");
	this._turnInfo.classList.add("turn_info");
	this._stageAndTurnInfo.appendChild(this._turnInfo);
	windowNode.appendChild(this._stageAndTurnInfo);
	
	this._modeInfo = document.createElement("div");
	this._modeInfo.id = this.createId("mode_info");
	this._modeInfo.classList.add("scaled_text");
	windowNode.appendChild(this._modeInfo);
	
	
	this._aceDisplay = document.createElement("div");
	this._aceDisplay.id = this.createId("ace_display");
	this._aceDisplayInner = document.createElement("div");
	this._aceDisplayInner.id = this.createId("ace_display_inner");
	
	this._acePicContainer = document.createElement("div");	
	this._aceDisplayInner.appendChild(this._acePicContainer);
	
	this._aceLabel = document.createElement("div");	
	this._aceLabel.classList.add("ace_label");
	this._aceLabel.classList.add("scaled_text");
	this._aceLabel.innerHTML = APPSTRINGS.INTERMISSION.top_ace;
	this._aceDisplayInner.appendChild(this._aceLabel);
	
	this._aceValue = document.createElement("div");	
	this._aceValue.classList.add("ace_value");
	this._aceValue.classList.add("scaled_text");
	this._aceDisplayInner.appendChild(this._aceValue);
	
	this._aceName = document.createElement("div");	
	this._aceName.classList.add("ace_name");
	this._aceName.classList.add("scaled_text");
	this._aceDisplayInner.appendChild(this._aceName);
	
	

	
	this._aceDisplay.appendChild(this._aceDisplayInner);
	windowNode.appendChild(this._aceDisplay);
	
	this._confirmContainer = document.createElement("div");	
	this._confirmContainer.classList.add("confirm_container");
	windowNode.appendChild(this._confirmContainer);
}

Window_Intermission.prototype.addHandler = function(key, func) {
	this._handlers[key] = func;
};

Window_Intermission.prototype.setActor = function(actor) {
	this._actor = actor;
};

Window_Intermission.prototype.windowWidth = function() {
	return Graphics.boxWidth + 50;
};	

Window_Intermission.prototype.windowHeight = function() {
	return Graphics.boxHeight + 50;
};

Window_Intermission.prototype.lineHeight = function() {
	return 50;
};


Window_Intermission.prototype.update = function() {
	const _this = this;
	Window_Base.prototype.update.call(this);
	_this.updateGlow();
	if(this.isOpen() && !this._handlingInput){
		
		if(_this._state == "confirm_title"){
			if(Input.isTriggered('left') || Input.isRepeated('left')){
				_this.titleConfirmSelection = !_this.titleConfirmSelection;
				_this.requestRedraw();
			}
			if(Input.isTriggered('right') || Input.isRepeated('right')){
				_this.titleConfirmSelection = !_this.titleConfirmSelection;
				_this.requestRedraw();
			}
		}
		
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			if(_this._state != "confirm_title"){
				SoundManager.playCursor();
				this.requestRedraw();
				this._currentSelection++;
			}
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			if(_this._state != "confirm_title"){
				SoundManager.playCursor();
				this.requestRedraw();
				this._currentSelection--;
			}
		} else if(Input.isTriggered('ok') || (this._isValidTouchInteraction)){
			if(_this._state == "confirm_title"){
				if(!_this.titleConfirmSelection){
					_this.hide();
					SceneManager.goto(Scene_Title);
				} else {
					_this._state = "";
					_this.requestRedraw();
				}
			} else {
				if(this._internalHandlers[this._currentKey]){		
					this._handlingInput = true; 
					var isPrevented = this._internalHandlers[this._currentKey].call(this);
					if(isPrevented){
						SoundManager.playBuzzer();
					} else {
						SoundManager.playOk();
					}
				}
			}			
		} else if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			SoundManager.playCancel();
			if(_this._state == "confirm_title"){
				_this._state = "";
			} else {
				if(this._menuLevels.length > 1){
					this._menuLevels.pop();
					this._currentSelection = this._menuLevels[this._menuLevels.length-1];				
				} else {
					this._currentSelection = this._commands.length-1; //Bottom command, Next Map
				}
			}
			
			this.requestRedraw();
		}
		
		var currentCommands = this._commands;			
		for(var i = 0; i < this._menuLevels.length - 1; i++){
			if(currentCommands[this._menuLevels[i]]){
				currentCommands = currentCommands[this._menuLevels[i]].subCommands;
			}			
		}
		if(currentCommands){
			var maxSelection = currentCommands.length - 1;
			
			if(this._currentSelection > maxSelection){
				this._currentSelection = 0;
			}
			if(this._currentSelection < 0){
				this._currentSelection = maxSelection;
			}		
			this._menuLevels[this._menuLevels.length-1] = this._currentSelection;
			
			this._currentKey = currentCommands[this._menuLevels[this._menuLevels.length-1]].key;
		}				
		
		this.refresh();
	}		
};

Window_Intermission.prototype.redraw = function() {
	const _this = this;
	this._redrawRequested = false;
	
	this.createEntryList(this._menuSection1, this._commands, "section_1");	
	this.createSubCategoryList(this._menuSectionMech, "mech", "section_mech");	
	this.createSubCategoryList(this._menuSectionPilot, "pilot", "section_pilot");	
	this.createSubCategoryList(this._menuSectionData, "data", "section_data");
	
	
	this._menuSectionMech.style.display = "none";
	this._menuSectionPilot.style.display = "none";
	this._menuSectionData.style.display = "none";
	if(this._menuLevels.length >= 2){
		if(this._menuLevels[0] == this.getCategoryIdx("mech")){
			this._menuSectionMech.style.display = "block";
		}
		if(this._menuLevels[0] == this.getCategoryIdx("pilot")){
			this._menuSectionPilot.style.display = "block";
		}
		if(this._menuLevels[0] == this.getCategoryIdx("data")){
			this._menuSectionData.style.display = "block";
		}
	}
	var activeKeys = {};
	var currentDef = this._commands[this._menuLevels[0]];
	var ctr = 0;
	while(currentDef && ctr < this._menuLevels.length){
		activeKeys[currentDef.key] = true;
		ctr++;
		if(currentDef.subCommands){
			currentDef = currentDef.subCommands[this._menuLevels[ctr]];
		}
	}
	
	var windowNode = this.getWindowNode();
	var menuEntries = windowNode.querySelectorAll(".menu_entry");	
	menuEntries.forEach(function(menuEntry){
		menuEntry.classList.remove("selected");
		var key = menuEntry.getAttribute("data-key");
		if(activeKeys[key]){
			menuEntry.classList.add("selected");
		}
	});
	
	var toolTipText = this._tooltips[this._currentKey] || "";		
	this._tooltipText.innerHTML = toolTipText;

	this._deployCountText.innerHTML = APPSTRINGS.INTERMISSION.next_map_units+": <div class='deploy_amount'>"+$gameSystem.getDeployInfo().count+"</div>";

	var nextStageInfo = $SRWStageInfoManager.getStageInfo($gameVariables.value(_nextMapVariable));	
	if(nextStageInfo?.terrainWarning){
		this._terrainWarning.style.display = "inline-flex";
		this._terrainWarningText.innerHTML = APPSTRINGS.INTERMISSION.next_map_terrain+": <div class='deploy_amount'>"+nextStageInfo.terrainWarning+"</div>";
		if(nextStageInfo.showWarningIndicator){
			this._terrainWarningText.innerHTML+="<img src='svg/hazard-sign.svg' class='terrain_hazard_indicator glowing_elem'/>";
		}
	} else {
		this._terrainWarning.style.display = "none";
	}
	
	this._srPointsValue.innerHTML = $SRWSaveManager.getSRCount();		
	if(ENGINE_SETTINGS.ENABLE_FAV_POINTS){
		this._favPointsValue.innerHTML = $gameSystem.getCurrentFavPoints();		
	}
	
	
	this._fundsValue.innerHTML = $gameParty.gold();		
	
	var stageInfo = $SRWStageInfoManager.getStageInfo($gameVariables.value(_lastStageIdVariable));
	this._stageInfo.innerHTML = APPSTRINGS.INTERMISSION.stage_label+" "+stageInfo.displayId+" \""+stageInfo.name+"\" "+APPSTRINGS.INTERMISSION.cleared_label;		
	this._turnInfo.innerHTML = $gameVariables.value(_turnCountVariable)+" "+APPSTRINGS.INTERMISSION.turns_label;	
	
	
	if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.displayInMenus){
		const modeInfo = ENGINE_SETTINGS.DIFFICULTY_MODS.levels[$gameSystem.getCurrentDifficultyLevel()];
		this._modeInfo.innerHTML = modeInfo.name + " " +APPSTRINGS.GENERAL.label_mode;
		this._modeInfo.style.color = modeInfo.color;
	}
	
	if(!this._aceFacePicsLoaded && $gameSystem._availableUnits){
		var ace = $statCalc.getTopAce();
		if(ace){
			this._aceFacePicsLoaded = true;
			this.loadActorFace(ace.SRWStats.pilot.id, this._acePicContainer);
			this._aceValue.innerHTML = $statCalc.getKills(ace);
			this._aceName.innerHTML = ace.name();
		}		
	}
	
	var windowNode = this.getWindowNode();
	var menuEntries = windowNode.querySelectorAll(".menu_entry");
	menuEntries.forEach(function(entry){
		entry.addEventListener("click",function(){
			var key = this.getAttribute("data-key");
			if(_this._currentKey == key){
				_this._isValidTouchInteraction = true;
			} else {
				_this._currentSelection = this.getAttribute("data-idx");
			}
			_this._currentKey = key;
			_this.requestRedraw();
		});		
	});
	
	
	if(_this._state == "confirm_title"){
		this._confirmContainer.innerHTML = _this.createConfirmContent(APPSTRINGS.INTERMISSION.confirm_title, _this.titleConfirmSelection);
		this._confirmContainer.style.display = "";
		this._confirmContainer.querySelector(".ok_button").addEventListener("click", function(){
			_this.titleConfirmSelection = false;
			_this._isValidTouchInteraction = true;
		});
		this._confirmContainer.querySelector(".cancel_button").addEventListener("click", function(){
			_this.titleConfirmSelection = true;
			_this._isValidTouchInteraction = true;
		});
	} else {
		this._confirmContainer.style.display = "none";
	}
	
	this.loadImages();
	Graphics._updateCanvas();
};	