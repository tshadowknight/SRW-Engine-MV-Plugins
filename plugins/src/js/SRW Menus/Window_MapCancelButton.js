import Window_CSS from "./Window_CSS.js";
import "./style/Window_MapButtons.css";

export default function Window_MapCancelButton() {
	if (Window_MapCancelButton._instance) {
		return Window_MapCancelButton._instance;
	}
	this.initialize.apply(this, arguments);
	Window_MapCancelButton._instance = this;
}

Window_MapCancelButton.prototype = Object.create(Window_CSS.prototype);
Window_MapCancelButton.prototype.constructor = Window_MapCancelButton;

Window_MapCancelButton.prototype.initialize = function() {
	var _this = this;

	this._layoutId = "map_cancel_button";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);
	if(ENGINE_SETTINGS.DISABLE_TOUCH || !Utils.isMobileDevice()){
		this._bgFadeContainer.style.display = "none";
	}

	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});

	this._visibility = "none";
	this.getWindowNode().style.display = this._visibility;

	this._hasBeenRendered = false;
	this._visibilityUpdateLock = 0;
}

Window_MapCancelButton.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";
}

Window_MapCancelButton.prototype.isValidForDisplay = function() {
	return (($gameSystem.isBattlePhase() != "AI_phase" && !$gameMap.isEventRunning()) || $gameSystem.isIntermission()) && $gameTemp.enableCancelButton;
}

Window_MapCancelButton.prototype.hideForSave = function(){
	const windowNode = this.getWindowNode();
	windowNode.classList.add("scene_save");
	//hack to prevent update from being called one last time before the next scene is loaded
	this._visibilityUpdateLock = 3;
}

Window_MapCancelButton.prototype.toggle = function() {
	this.update();
}

Window_MapCancelButton.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	if(this._visibilityUpdateLock > 0){
		this._visibilityUpdateLock--;
		return;
	}

	const windowNode = this.getWindowNode();

	windowNode.classList.remove("battle_window");
	windowNode.classList.remove("scene_save");
	windowNode.classList.remove("intermission");
	
	try {
		if($gameSystem.isSubBattlePhase() == "battle_window"){
			windowNode.classList.add("battle_window");
		} 

		if($gameSystem.isIntermission()){
			windowNode.classList.add("intermission");
		}		
	} catch(e){
		console.log("Error while resolving cancel button state:" + (e.message || e));
	}
	
	if(!this.isValidForDisplay()){
		this._visibility = "none";
	} else {
		this._visibility = "";
		if($gameSystem.isIntermission()){
			windowNode.style.opacity = 1;
		} else {			
			let screenFade = $gameScreen.brightness() / 255;
			let sceneFade = SceneManager.getCurrentSceneFade() / 255;
			windowNode.style.opacity = Math.min(screenFade, sceneFade);
		}		
	}	

	if(this.isOpen() && !this._handlingInput){
		this.refresh();
	}
};

Window_MapCancelButton.prototype.refresh = function() {
	if(this._redrawRequested || !this._hasBeenRendered){
		this._redrawRequested = false;
		this.redraw();
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_MapCancelButton.prototype.redraw = function() {
	var _this = this;
	var content = "";

	//hack to make sure the window does not appear before it should
	if(!this.isValidForDisplay()){
		return;
	}
	
	//if(!ENGINE_SETTINGS.DISABLE_TOUCH || Utils.isMobileDevice()){
		content+="<div class='map_button cancel scaled_text' id='button_cancel'>";
		content+="<img src='svg/return.svg'>"
		content+="</div>";
	//}
	_this._bgFadeContainer.innerHTML = content;

	var buttonCancel = _this._bgFadeContainer.querySelector("#button_cancel");
	if(buttonCancel){
		buttonCancel.addEventListener("click", function(){
			TouchInput.clear();
			TouchInput._onCancel(TouchInput.x, TouchInput.y);
		});
	}
	this.updateScaledDiv(_this._bgFadeContainer);
	Graphics._updateCanvas();

	this._hasBeenRendered = true;
}
