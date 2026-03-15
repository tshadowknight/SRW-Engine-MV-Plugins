import Window_CSS from "./Window_CSS.js";
import "./style/Window_MapButtons.css";

export default function Window_MapCancelButton() {
	this.initialize.apply(this, arguments);
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
}

Window_MapCancelButton.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";
}

Window_MapCancelButton.prototype.isValidForDisplay = function() {
	return !$gameMap.isEventRunning() && $gameSystem.isSRPGMode() && $gameTemp.enableCancelButton;
}

Window_MapCancelButton.prototype.update = function() {
	Window_Base.prototype.update.call(this);

	if(!this.isValidForDisplay()){
		this._visibility = "none";
	} else {
		this._visibility = "";
		let screenFade = $gameScreen.brightness() / 255;
		let sceneFade = SceneManager.getCurrentSceneFade() / 255;
		this.getWindowNode().style.opacity = Math.min(screenFade, sceneFade);
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
