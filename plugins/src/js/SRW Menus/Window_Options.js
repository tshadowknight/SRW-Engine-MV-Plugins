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
	
	this._titleInfo = {};
	this._titleInfo[0] = APPSTRINGS.OPTIONS.label_game_options;
	this._titleInfo[6] = APPSTRINGS.OPTIONS.label_sound_options;
	


	this._optionInfo.push({
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
			ConfigManager.save();
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_grid,
		display: function(){
			return $gameSystem.optionDisableGrid ? "OFF" : "ON";
		},
		update: function(){
			$gameSystem.optionDisableGrid = !$gameSystem.optionDisableGrid;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_will,
		display: function(){
			return $gameSystem.showWillIndicator ? "ON" : "OFF";
		},
		update: function(){
			$gameSystem.showWillIndicator = !$gameSystem.showWillIndicator;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_default_support,
		display: function(){
			return $gameSystem.optionDefaultSupport ? APPSTRINGS.OPTIONS.label_default_support_on : APPSTRINGS.OPTIONS.label_default_support_off;
		},
		update: function(){
			$gameSystem.optionDefaultSupport = !$gameSystem.optionDefaultSupport;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_skip_move,
		display: function(){
			return $gameSystem.optionSkipUnitMoving ? "ON" : "OFF";
		},
		update: function(){
			$gameSystem.optionSkipUnitMoving = !$gameSystem.optionSkipUnitMoving;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_battle_speed,
		display: function(){
			var battleSpeed = $gameSystem.getBattleSpeed();
			if(battleSpeed == 1){
				return "???";
			}
			if(battleSpeed == 2){
				return "??????";
			}
			if(battleSpeed == 3){
				return "?????????";
			}
			if(battleSpeed >= 4){
				return "????????????";
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
	
	
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_battle_bgm,
		display: function(){
			return $gameSystem.optionBattleBGM ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			$gameSystem.optionBattleBGM = !$gameSystem.optionBattleBGM;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_after_battle_bgm,
		display: function(){
			return $gameSystem.optionAfterBattleBGM ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			$gameSystem.optionAfterBattleBGM = !$gameSystem.optionAfterBattleBGM;
		}
	});
	
	this._optionInfo.push({
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
			ConfigManager.save();
		}
	});
	
	this._optionInfo.push({
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
			ConfigManager.save();
		}
	});
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}


Window_Options.prototype.resetSelection = function(){	
	this._currentSelection = 0;
		
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
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
}	

Window_Options.prototype.update = function() {
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

Window_Options.prototype.redraw = function() {
	var _this = this;
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
	
	
	
	Graphics._updateCanvas();
}