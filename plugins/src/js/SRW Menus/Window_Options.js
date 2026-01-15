import Window_CSS from "./Window_CSS.js";
import "./style/Window_Options.css"

export default function Window_Options() {
	this.initialize.apply(this, arguments);	
}

Window_Options.prototype = Object.create(Window_CSS.prototype);
Window_Options.prototype.constructor = Window_Options;

Window_Options.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "options";
	this._pageSize = 1;
	this._optionInfo = [];
	/*this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_display,
		display: function(){

		},
		update: function(){

		}
	});*/
	this._wasStacked = false;

	// Tab state management
	this._currentUIState = "tab_selection"; // tab_selection, options_editing
	this._currentTab = 0;
	// Calculate max tabs based on enabled features
	this._availableTabs = [];
	this._availableTabs.push("general");
	this._availableTabs.push("sound");
	if(ENGINE_SETTINGS.ENABLE_GRAPHICS_MENU){
		this._availableTabs.push("graphics");
	}
	if(ENGINE_SETTINGS.ENABLE_TWEAKS_MENU){
		this._availableTabs.push("tweaks");
	}
	this._maxTab = this._availableTabs.length;

	// Options will be organized by tab
	this._gameOptions = [];
	this._graphicsOptions = [];
	this._soundOptions = [];
	this._tweaksOptions = [];

	this._titleInfo = {};
	// Titles removed since they're now in the tabs
	// this._titleInfo[0] = APPSTRINGS.OPTIONS.label_game_options;
	// Sound options title also removed - now in tab
	/*if(ENGINE_SETTINGS.ENABLE_TWEAKS_MENU){
		this._titleInfo[9] = APPSTRINGS.OPTIONS.label_sound_options;
	} else {
		this._titleInfo[8] = APPSTRINGS.OPTIONS.label_sound_options;
	}*/

	// Game Options
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_fullscreen,
		display: function(){
			return ConfigManager["Fullscreen"] ? "ON" : "OFF";
		},
		update: function(){
			var newState = !ConfigManager["Fullscreen"];
			ConfigManager["Fullscreen"] = newState;
			if(newState){
				Graphics._requestFullScreen();
			} else {
				Graphics._cancelFullScreen();
			}
			
		}
	});

	const buttonImgs = {"xbox": "XBox", "ds": "Playstation", "nin": "Nintendo"};
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_button_set,
		display: function(){
			return buttonImgs[$gameSystem.getOptionPadSet()];
		},
		update: function(){
			const padSet = $gameSystem.getOptionPadSet();
			if(padSet == "xbox"){
				ConfigManager["padSet"] = "ds";
			} else if(padSet == "ds"){
				ConfigManager["padSet"] = "nin";
			} else if(padSet == "nin"){
				ConfigManager["padSet"] = "xbox";
			}
			if($gameTemp.buttonHintManager){
				$gameTemp.buttonHintManager.redraw();
			}
		}
	});

	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_show_map_buttons,
		display: function(){
			return ConfigManager["mapHints"] ? "ON" : "OFF";
		},
		update: function(){
			ConfigManager["mapHints"] = !ConfigManager["mapHints"];
		}
	});
	
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_grid,
		display: function(){
			return ConfigManager["disableGrid"] ? "OFF" : "ON";
		},
		update: function(){
			ConfigManager["disableGrid"]= !ConfigManager["disableGrid"];
		}
	});
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_will,
		display: function(){		
			if(ConfigManager["willIndicator"] == 0){
				return "None";
			}	
			if(ConfigManager["willIndicator"] == 1){
				return "Will";
			}	
			if(ConfigManager["willIndicator"] == 2){
				return "HP";
			}
		},
		update: function(direction){
			if(direction == "up"){
				ConfigManager["willIndicator"]++;
				if(ENGINE_SETTINGS.ENABLE_HEALTH_BARS_ON_MAP) {
					if(ConfigManager["willIndicator"] > 2){
						ConfigManager["willIndicator"] = 0;
					}
				} else {
					if(ConfigManager["willIndicator"] > 1){
						ConfigManager["willIndicator"] = 0;
					}
				}	
			} else {
				ConfigManager["willIndicator"]--;	
				if(ENGINE_SETTINGS.ENABLE_HEALTH_BARS_ON_MAP) {
					if(ConfigManager["willIndicator"] < 0){
						ConfigManager["willIndicator"] = 2;
					}
				} else {
					if(ConfigManager["willIndicator"] < 0){
						ConfigManager["willIndicator"] = 1;
					}
				}	
			}		
		}
	});
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_default_support,
		display: function(){
			return ConfigManager["defaultSupport"] ? APPSTRINGS.OPTIONS.label_default_support_on : APPSTRINGS.OPTIONS.label_default_support_off;
		},
		update: function(){
			ConfigManager["defaultSupport"] = !ConfigManager["defaultSupport"];
		}
	});
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_skip_move,
		display: function(){
			return ConfigManager["skipUnitMove"] ? "ON" : "OFF";
		},
		update: function(){
			ConfigManager["skipUnitMove"] = !ConfigManager["skipUnitMove"];
		}
	});
	
	this._gameOptions.push({
		name: APPSTRINGS.OPTIONS.label_battle_speed,
		display: function(){
			var battleSpeed = $gameSystem.getBattleSpeed();
			if(battleSpeed == 1){
				return "›";
			}
			if(battleSpeed == 2){
				return "››";
			}
			if(battleSpeed == 3){
				return "›››";
			}
			if(battleSpeed >= 4){
				return "››››";
			}				
		},
		update: function(direction){
			if(direction == "up"){
				var battleSpeed = $gameSystem.getBattleSpeed();
				battleSpeed++;
				if(battleSpeed > 4){
					battleSpeed = 1;
				}
				$gameSystem.setBattleSpeed(battleSpeed);
			} else {
				var battleSpeed = $gameSystem.getBattleSpeed();
				battleSpeed--;
				if(battleSpeed < 1){
					battleSpeed = 4;
				}
				$gameSystem.setBattleSpeed(battleSpeed);
			}
		}
	});

	// Graphics Options
	
	this._graphicsOptions.push({
		name: APPSTRINGS.OPTIONS.label_save_vram || "Effects Quality",
		display: function(){
			return ConfigManager["SaveVRAM"] ? "LOW" : "HIGH";
		},
		update: function(){
			var newState = !ConfigManager["SaveVRAM"];
			ConfigManager["SaveVRAM"] = newState;
		}
	});
	

	// Sound Options
	this._soundOptions.push({
		name: APPSTRINGS.OPTIONS.label_battle_bgm,
		display: function(){
			return ConfigManager["battleBGM"] ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			ConfigManager["battleBGM"] = !ConfigManager["battleBGM"];
		}
	});

	this._soundOptions.push({
		name: APPSTRINGS.OPTIONS.label_after_battle_bgm,
		display: function(){
			return ConfigManager["afterBattleBGM"] ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			ConfigManager["afterBattleBGM"] = !ConfigManager["afterBattleBGM"];
		}
	});

	this._soundOptions.push({
		name: APPSTRINGS.OPTIONS.label_bgm_vol,
		display: function(){
			return ConfigManager["bgmVolume"];
		},
		update: function(direction){
			var current = ConfigManager["bgmVolume"];
			if(direction == "up"){
				if(current < 100){
					current+=20;
				} else {
					current = 0;
				}
			} else {
				if(current > 0){
					current-=20;
				} else {
					current = 100;
				}
			}
			ConfigManager["bgmVolume"] = current;
			ConfigManager["bgsVolume"] = current;

		}
	});

	this._soundOptions.push({
		name: APPSTRINGS.OPTIONS.label_sfx_vol,
		display: function(){
			return ConfigManager["seVolume"];
		},
		update: function(direction){
			var current = ConfigManager["seVolume"];
			if(direction == "up"){
				if(current < 100){
					current+=20;
				} else {
					current = 0;
				}
			} else {
				if(current > 0){
					current-=20;
				} else {
					current = 100;
				}
			}
			ConfigManager["seVolume"] = current;
			ConfigManager["meVolume"] = current;

		}
	});

	// Tweaks Options (Game Modes)

	const includeAuto = ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 2;
	if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 1){
		this._tweaksOptions.push({
			name: APPSTRINGS.GAME_MODES.label_difficulty,
			display: function(){
				if(includeAuto){
					if($gameSystem.isManualSetDifficulty()){
						const current = $gameSystem.getCurrentDifficultyLevel();
						return ENGINE_SETTINGS.DIFFICULTY_MODS.levels[current].name;
					} else {
						return APPSTRINGS.GAME_MODES.label_auto;
					}
				} else {
					const current = $gameSystem.getCurrentDifficultyLevel();
					return ENGINE_SETTINGS.DIFFICULTY_MODS.levels[current].name;
				}
			},
			update: function(direction){
				let current = $gameSystem.getCurrentDifficultyLevel();
				let max =  ENGINE_SETTINGS.DIFFICULTY_MODS.levels.length;
				if(includeAuto){
					max++;
					if($gameSystem.isManualSetDifficulty()){
						current++;
					} else {
						current = 0;
					}
				}
				let newVal;
				if(direction == "up"){
					newVal = current + 1;
					if(newVal >= max){
						newVal = 0;
					}
				} else {
					newVal = current - 1;
					if(newVal < 0){
						newVal = max - 1;
					}
				}
				if(includeAuto){
					if(newVal == 0){
						$gameSystem.clearManualSetDifficulty();
						$gameSystem.setAutomaticDifficultyLevel();
					} else {
						$gameSystem.setCurrentDifficultyLevel(newVal - 1);
					}
				} else {
					$gameSystem.setCurrentDifficultyLevel(newVal);
				}
			}
		});
	}

	if(ENGINE_SETTINGS.ENABLE_TWEAKS_OPTION){
		this._tweaksOptions.push({
			name: APPSTRINGS.GAME_MODES.label_infinite_funds,
			display: function(){
				return $gameSystem.optionInfiniteFunds ? "ON" : "OFF";
			},
			update: function(){
				$gameSystem.optionInfiniteFunds = !$gameSystem.optionInfiniteFunds;
			}
		});

		this._tweaksOptions.push({
			name: APPSTRINGS.GAME_MODES.label_infinite_PP,
			display: function(){
				return $gameSystem.optionInfinitePP ? "ON" : "OFF";
			},
			update: function(){
				$gameSystem.optionInfinitePP = !$gameSystem.optionInfinitePP;
			}
		});
	}
	

	// Set the initial option list based on the first tab
	this._optionInfo = this._gameOptions;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_Options.prototype.getActiveTabIdx = function(key){	
	return this._availableTabs.indexOf(key);
}

Window_Options.prototype.resetSelection = function(){		
	if(!this._wasStacked){
		this._currentSelection = 0;
		this._wasStacked = false;
	}
}

Window_Options.prototype.getCurrentSelection = function(){
	var unit = $gameTemp.currentMenuUnit;	
	if(this._subPilotIdx != 0){
		var subPilots = $statCalc.getSubPilots(unit.actor);
		var subPilotId = subPilots[this._subPilotIdx - 1];
		if(subPilotId != null){
			unit = {actor: $gameActors.actor(subPilotId), mech: unit.actor.SRWStats.mech};
		}
	}
	return unit;
}

Window_Options.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);

	var windowNode = this.getWindowNode();


	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.OPTIONS.title;
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);

	// Create tab buttons
	this._generalOptionsTabButton = document.createElement("div");
	this._generalOptionsTabButton.classList.add("tab_button");
	this._generalOptionsTabButton.classList.add("general_options_button");
	this._generalOptionsTabButton.classList.add("scaled_text");
	this._generalOptionsTabButton.innerHTML = APPSTRINGS.OPTIONS.label_game_options || "General";
	windowNode.appendChild(this._generalOptionsTabButton);
	this._generalOptionsTabButton.addEventListener("click", function(){
		_this._currentTab = 0;
		_this._currentSelection = 0;
		_this._currentUIState = "options_editing";
		_this.requestRedraw();
	});

	this._soundOptionsTabButton = document.createElement("div");
	this._soundOptionsTabButton.classList.add("tab_button");
	this._soundOptionsTabButton.classList.add("sound_options_button");
	this._soundOptionsTabButton.classList.add("scaled_text");
	this._soundOptionsTabButton.innerHTML = APPSTRINGS.OPTIONS.label_sound_options || "Sound";
	windowNode.appendChild(this._soundOptionsTabButton);
	this._soundOptionsTabButton.addEventListener("click", function(){
		_this._currentTab = 1;
		_this._currentSelection = 0;
		_this._currentUIState = "options_editing";
		_this.requestRedraw();
	});

	if(ENGINE_SETTINGS.ENABLE_GRAPHICS_MENU){
		this._graphicsOptionsTabButton = document.createElement("div");
		this._graphicsOptionsTabButton.classList.add("tab_button");
		this._graphicsOptionsTabButton.classList.add("graphics_options_button");
		this._graphicsOptionsTabButton.classList.add("scaled_text");
		this._graphicsOptionsTabButton.innerHTML = "Graphics";
		windowNode.appendChild(this._graphicsOptionsTabButton);
		this._graphicsOptionsTabButton.addEventListener("click", function(){
			// Calculate tab index based on enabled features
			_this._currentTab = _this.getActiveTabIdx("graphics");
			_this._currentSelection = 0;
			_this._currentUIState = "options_editing";
			_this.requestRedraw();
		});
	}

	if(ENGINE_SETTINGS.ENABLE_TWEAKS_MENU){
		this._tweaksTabButton = document.createElement("div");
		this._tweaksTabButton.classList.add("tab_button");
		this._tweaksTabButton.classList.add("tweaks_button");
		this._tweaksTabButton.classList.add("scaled_text");
		this._tweaksTabButton.innerHTML = APPSTRINGS.GAME_MODES.title || "Tweaks";
		windowNode.appendChild(this._tweaksTabButton);
		this._tweaksTabButton.addEventListener("click", function(){
			// Calculate tab index based on enabled features
			_this._currentTab = _this.getActiveTabIdx("tweaks");;
			_this._currentSelection = 0;
			_this._currentUIState = "options_editing";
			_this.requestRedraw();
		});
	}

	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);

}

Window_Options.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);

	if(this.isOpen() && !this._handlingInput){

		if(Input.isTriggered('down') || Input.isRepeated('down')){
			if(this._currentUIState == "tab_selection"){
				// Enter the options editing mode
				SoundManager.playCursor();
				this._currentUIState = "options_editing";
				this.requestRedraw();
				this.refresh();
				return;
			} else if(this._currentUIState == "options_editing"){
				this.requestRedraw();
				this._currentSelection++;
				if(this._currentSelection >= this._optionInfo.length){
					this._currentSelection = 0;
				}
				SoundManager.playCursor();
				this.refresh();
				return;
			}

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			if(this._currentUIState == "options_editing"){
				this.requestRedraw();
				this._currentSelection--;
				if(this._currentSelection < 0){
					this._currentSelection = this._optionInfo.length - 1;
				}
				SoundManager.playCursor();
				this.refresh();
				return;
			}
		}
		
		function toggleOption(direction){
			if(!_this._optionInfo[_this._currentSelection].isSubMenu){
				_this._optionInfo[_this._currentSelection].update(direction);
			}
		}

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			if(this._currentUIState == "tab_selection"){
				SoundManager.playCursor();
				this._currentTab--;
				if(this._currentTab < 0){
					this._currentTab = this._maxTab - 1;
				}
				this._currentSelection = 0;
				this.requestRedraw();
				this.refresh();
				return;
			} else if(this._currentUIState == "options_editing"){
				this.requestRedraw();
				toggleOption("down");
				SoundManager.playCursor();
				this.refresh();
				return;
			}

		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			if(this._currentUIState == "tab_selection"){
				SoundManager.playCursor();
				this._currentTab++;
				if(this._currentTab >= this._maxTab){
					this._currentTab = 0;
				}
				this._currentSelection = 0;
				this.requestRedraw();
				this.refresh();
				return;
			} else if(this._currentUIState == "options_editing"){
				this.requestRedraw();
				toggleOption("up");
				SoundManager.playCursor();
				this.refresh();
				return;
			}
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			if(this._currentUIState == "tab_selection"){
				SoundManager.playCursor();
				this._currentTab--;
				if(this._currentTab < 0){
					this._currentTab = this._maxTab - 1;
				}
				this._currentSelection = 0;
			}
			this.requestRedraw();


		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			if(this._currentUIState == "tab_selection"){
				SoundManager.playCursor();
				this._currentTab++;
				if(this._currentTab >= this._maxTab){
					this._currentTab = 0;
				}
				this._currentSelection = 0;
			}
			this.requestRedraw();

		}
		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
			if(this._currentUIState == "tab_selection"){
				// Enter the selected tab
				SoundManager.playOk();
				this._currentUIState = "options_editing";
				this.requestRedraw();
				this.refresh();
				return;
			} else if(this._currentUIState == "options_editing" && _this._optionInfo[_this._currentSelection].isSubMenu){
				_this._wasStacked = true;
				_this._optionInfo[_this._currentSelection].update();
			}
		}

		if(Input.isTriggered('menu')){

		}

		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
			SoundManager.playCancel();			
			if(this._currentUIState == "tab_selection"){
				ConfigManager.save();
				$gameTemp.popMenu = true;
				$gameTemp.buttonHintManager.hide();
				if(this._callbacks["closed"]){
					this._callbacks["closed"]();
				}
			} else if(this._currentUIState == "options_editing"){
				this.requestRedraw();
				this._currentUIState = "tab_selection";
				this.refresh();
			}			
			return;
		}				
		this.resetTouchState();
		this.refresh();
	}		
};

Window_Options.prototype.redraw = function() {
	var _this = this;

	// Update option list based on current tab
	const currentTabKey = this._availableTabs[this._currentTab];
	if(currentTabKey === "general"){
		this._optionInfo = this._gameOptions;
	} else if(currentTabKey === "sound"){
		this._optionInfo = this._soundOptions;
	} else if(currentTabKey === "graphics"){
		this._optionInfo = this._graphicsOptions;
	} else if(currentTabKey === "tweaks"){
		this._optionInfo = this._tweaksOptions;
	}

	// Update button hints based on UI state
	if(this._currentUIState == "tab_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["tab_nav"], ["tab_selection"]]);
	} else if(this._currentUIState == "options_editing"){
		if(ENGINE_SETTINGS.ENABLE_TWEAKS_MENU){
			$gameTemp.buttonHintManager.setHelpButtons([["select_option"], ["toggle_option"], ["enter_sub_menu"]]);
		} else {
			$gameTemp.buttonHintManager.setHelpButtons([["select_option"], ["toggle_option"]]);
		}
	}
	$gameTemp.buttonHintManager.show();

	var content = "";
	if(currentTabKey == "tweaks" && !$gameSystem?._isIntermission){
		content+="<div class='entry title scaled_text fitted_text'>";
		content+=APPSTRINGS.OPTIONS.label_intermission_only;
		content+="</div>";
	} else {
		var ctr = 0;
		this._optionInfo.forEach(function(option){
			if(_this._titleInfo[ctr]){
				content+="<div class='entry title scaled_text fitted_text'>";
				content+=_this._titleInfo[ctr];			
				content+="</div>";
			}
			content+="<div data-idx='"+ctr+"' class='entry "+(ctr == _this._currentSelection ? "selected" : "")+"'>";
			content+="<div class='label scaled_text fitted_text'>";
			content+=option.name;
			content+="</div>";
			content+="<div class='value scaled_text fitted_text'>";
			content+=option.display();
			content+="</div>";
			content+="</div>";
			ctr++;
		});
	}
	
	
	this._listContainer.innerHTML = content;
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			var idx = this.getAttribute("data-idx"); 
			if(idx != null){
				idx*=1;
				if(idx == _this._currentSelection){
					_this._optionInfo[_this._currentSelection].update("up");
					_this.requestRedraw();
				} else {
					_this._currentSelection = idx;
					_this.requestRedraw();
				}
			}								
		});
	});

	// Update tab button styling
	this._generalOptionsTabButton.classList.remove("selected");
	this._soundOptionsTabButton.classList.remove("selected");
	if(ENGINE_SETTINGS.ENABLE_GRAPHICS_MENU && this._graphicsOptionsTabButton){
		this._graphicsOptionsTabButton.classList.remove("selected");
	}
	if(ENGINE_SETTINGS.ENABLE_TWEAKS_MENU && this._tweaksTabButton){
		this._tweaksTabButton.classList.remove("selected");
	}

	if(currentTabKey === "general"){
		this._generalOptionsTabButton.classList.add("selected");
	} else if(currentTabKey === "sound"){
		this._soundOptionsTabButton.classList.add("selected");
	} else if(currentTabKey === "graphics" && this._graphicsOptionsTabButton){
		this._graphicsOptionsTabButton.classList.add("selected");
	} else if(currentTabKey === "tweaks" && this._tweaksTabButton){
		this._tweaksTabButton.classList.add("selected");
	}

	// Update list container inactive state
	this._listContainer.classList.remove("inactive");
	if(this._currentUIState == "tab_selection"){
		this._listContainer.classList.add("inactive");
	}

	this.loadImages();
	Graphics._updateCanvas();

	if(this._callbacks["redraw"]){
		this._callbacks["redraw"]();
	}
}