import Window_CSS from "./Window_CSS.js";
import "./style/Window_Game_Modes.css"

export default function Window_Game_Modes() {
	this.initialize.apply(this, arguments);	
}

Window_Game_Modes.prototype = Object.create(Window_CSS.prototype);
Window_Game_Modes.prototype.constructor = Window_Game_Modes;

Window_Game_Modes.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "game_modes";	
	this._pageSize = 1;
	this._optionInfo = [];
	/*this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_display,
		display: function(){
			
		},
		update: function(){
			
		}
	});*/
	
	this._titleInfo = {};
	this._titleInfo[0] = APPSTRINGS.GAME_MODES.resources;
	
	const includeAuto = ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 2;
	if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 1){
		this._optionInfo.push({
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
		this._optionInfo.push({
			name: APPSTRINGS.GAME_MODES.label_infinite_funds,
			display: function(){
				return $gameSystem.optionInfiniteFunds ? "ON" : "OFF";
			},
			update: function(){
				$gameSystem.optionInfiniteFunds = !$gameSystem.optionInfiniteFunds;
			}
		});
		
		this._optionInfo.push({
			name: APPSTRINGS.GAME_MODES.label_infinite_PP,
			display: function(){
				return $gameSystem.optionInfinitePP ? "ON" : "OFF";
			},
			update: function(){
				$gameSystem.optionInfinitePP = !$gameSystem.optionInfinitePP;
			}
		});
	}

	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}


Window_Game_Modes.prototype.resetSelection = function(){	
	this._currentSelection = 0;
		
}

Window_Game_Modes.prototype.getCurrentSelection = function(){
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

Window_Game_Modes.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.GAME_MODES.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
}	

Window_Game_Modes.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
	
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			this._currentSelection++;
			if(this._currentSelection >= this._optionInfo.length){
				this._currentSelection = 0;
			}
			SoundManager.playCursor();
			this.refresh();
			return;	
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
			this._currentSelection--;
			if(this._currentSelection < 0){
				this._currentSelection = this._optionInfo.length - 1;
			}
			SoundManager.playCursor();
			this.refresh();
			return;	
		}
		
		function toggleOption(direction){
			_this._optionInfo[_this._currentSelection].update(direction);
		}					

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			toggleOption("down");
			SoundManager.playCursor();
			this.refresh();
			return;	
					
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			toggleOption("up");
			SoundManager.playCursor();
			this.refresh();
			return;		
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
			//toggleOption("up");
		}
		
		if(Input.isTriggered('menu')){
			
		}	
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			SoundManager.playCancel();			
			$gameTemp.popMenu = true;	
			$gameTemp.buttonHintManager.hide();			
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}		
			this.refresh();
			return;		
		}				
		this.resetTouchState();
		this.refresh();
	}		
};

Window_Game_Modes.prototype.redraw = function() {
	var _this = this;
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_option"], ["toggle_option"]]);
	$gameTemp.buttonHintManager.show();
		
	var content = "";
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
	
	
	this.loadImages();
	Graphics._updateCanvas();
}