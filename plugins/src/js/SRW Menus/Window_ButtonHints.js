import Window_CSS from "./Window_CSS.js";
import "./style/Window_ButtonHints.css";

export default function Window_ButtonHints() {
	this.initialize.apply(this, arguments);	
}

Window_ButtonHints.prototype = Object.create(Window_CSS.prototype);
Window_ButtonHints.prototype.constructor = Window_ButtonHints;

Window_ButtonHints.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "button_hints";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.redraw();
	});	
	this._requestCtr = 0;
	this._hints = [];
}

Window_ButtonHints.prototype.setHelpButtons = function(hints){
	this._hints = hints;
}

Window_ButtonHints.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	
	this._centerContainer = document.createElement("div");
	this._centerContainer.id = this.createId("center");
	this._centerContainer.classList.add("hint_container");
	this._centerContainer.classList.add("center_container");	
	this._centerContainer.classList.add("scaled_text");
	windowNode.appendChild(this._centerContainer);
	
	this._leftContainer = document.createElement("div");
	this._leftContainer.id = this.createId("left");
	this._leftContainer.classList.add("hint_container");
	this._leftContainer.classList.add("left_container");	
	this._leftContainer.classList.add("scaled_text");
	windowNode.appendChild(this._leftContainer);
	
	this._rightContainer = document.createElement("div");
	this._rightContainer.id = this.createId("right");
	this._rightContainer.classList.add("hint_container");
	this._rightContainer.classList.add("left_container");	
	this._rightContainer.classList.add("scaled_text");
	windowNode.appendChild(this._rightContainer);
}	

Window_ButtonHints.prototype.clearDisplayKey = function() {
	this._currentDisplayKey = null
}

Window_ButtonHints.prototype.show = function(displayKey) {
	if(!displayKey || this._currentDisplayKey != displayKey){
		this._currentDisplayKey = displayKey;	
		this.resetSelection();
		this._handlingInput = false;
		this.visible = true;
		this._redrawRequested = true;
		this._visibility = "";
		this.refresh();	
		this.triggerCustomBgCreate();
		
		Graphics._updateCanvas();
	}
};


Window_ButtonHints.prototype.hide = function() {
	this.clearDisplayKey();
    this.visible = false;
	this._visibility = "none";
	this.refresh();
};

Window_ButtonHints.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	//hacky workaround for issue where the hints don't show up for the deployment in stage window, since that is a window that is shown while the event interpreter is active
	//exception for when $gameTemp.doingModeSelection is true, so the hints can be displayed in the mode selection window which is shown while the interpreter is running
	if(!$gameTemp.doingModeSelection && $gameSystem.isSubBattlePhase() != "deploy_selection_window" && $gameMap && $gameMap._interpreter && $gameMap._interpreter.isRunning()){
		this.hide();
	}
	
	
	if(this.isOpen() && !this._handlingInput){			
		this.refresh();
	}
};

Window_ButtonHints.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}



Window_ButtonHints.prototype.redraw = async function() {	
	var _this = this;
	
	this._requestCtr++;
	let currentCtr = this._requestCtr;
	
	
	if(!_this._iconsBitmap){
		_this._iconsBitmap = await ImageManager.loadBitmapPromise('', ENGINE_SETTINGS.MAP_BUTTON_CONFIG.SPRITE_SHEET.PATH, true, 0, false, true);
	}

	if(currentCtr != this._requestCtr) {
		return;
	}
	
	const iconInfo = this.populatHintContainer(this._centerContainer, this._hints);
	for(let i = 0; i < iconInfo.length; i++){
		let iconDef = iconInfo[i];
		if(iconDef){
			this.constructButtonIcon(i, iconDef);
		}
	}
	
	/*const hintBlocks = this._centerContainer.querySelectorAll(".hint_block");
	for(const hintBlock of hintBlocks){
		const hints = hintBlock.querySelectorAll(".hint_text");
		let maxWidth = 0;
		for(let hint of hints){
			const width = hint.getBoundingClientRect().width;
			if(width > maxWidth){
				maxWidth = width;
			}
		}
		for(let hint of hints){
			hint.style.width = maxWidth + "px";
		}
	}*/
	Graphics._updateCanvas();
	$CSSUIManager.doUpdateScaledText("button_hints");
}

