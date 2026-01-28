import Window_CSS from "./Window_CSS.js";
import "./style/Window_ButtonHints.css";

export default function Window_ButtonHints() {
	this.initialize.apply(this, arguments);	
}

//TODO: separate out text_log button hint functionality into deriving class 

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
	this._topBarContexts = ["text_log"];
	this._usedContexts = {};

	this._tileElemPool = [];
	this._maxPoolSize = 32;
	this._poolPointer = 0;
}

Window_ButtonHints.prototype.resetPoolPointer = function(){
	this._poolPointer = 0;
}

Window_ButtonHints.prototype.getNextTileElem = function(){
	if(!this._tileElemPool[this._poolPointer]){
		this._tileElemPool[this._poolPointer] = document.createElement("div");
	}
	const result = this._tileElemPool[this._poolPointer];
	this._poolPointer++;
	if(this._poolPointer > this._maxPoolSize){
		this._poolPointer = 0;
	}
	return result;
}

Window_ButtonHints.prototype.isTopBar = function(){
	return this._topBarContexts.indexOf(this._currentDisplayKey) != -1;
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

Window_ButtonHints.prototype.show = function(displayKey, immediate) {
	if(displayKey){
		this._usedContexts[displayKey] = true;
	}
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

		this._animateShow = false;
		this._centerContainer.style.opacity = null;
		this._centerContainer.style.left = null;
		this._requestClose = false;

		if(this.isTopBar() && !immediate){
			this.animateShow();
		}
	}
};

Window_ButtonHints.prototype.animateShow = function() {
	this._centerContainer.style.opacity = 0;
	this._animateShow = true;
	this._animateShowCtr = 0;
}

Window_ButtonHints.prototype.hide = function() {
	this.clearDisplayKey();
	this.visible = false;
	this._visibility = "none";
	this.refresh();
	this._requestClose = false;	
};

Window_ButtonHints.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	const animOffset = 0.2;
	const animFrames = 6;
	if(this._animateShow){
		this._animateShowCtr++;
		const progress = this.easeInOutSine(this._animateShowCtr / animFrames);

		this._centerContainer.style.opacity = progress;
		this._centerContainer.style.left = animOffset - (animOffset * (progress)) + "%";
		
		if(this._centerContainer.style.opacity >= 1){
			this._centerContainer.style.opacity = 1;
			this._centerContainer.style.left = null;
			this._animateShow = false;
		}
	} 
	
	//hacky workaround for issue where the hints don't show up for the deployment in stage window, since that is a window that is shown while the event interpreter is active
	//exception for when $gameTemp.doingModeSelection is true, so the hints can be displayed in the mode selection window which is shown while the interpreter is running
	
	//exception for when the message window is open
	//might be a better idea to spin off the message window button hints into its own window class instead
	let messageWindowIsOpen = false;
	let messageWindowRef = SceneManager?._scene?._messageWindow;
	if(messageWindowRef?.isOpen() || messageWindowRef?.isOpening()){
		messageWindowIsOpen = true;
	}
	if(!this._animateHide && !$gameTemp.doingModeSelection && $gameSystem.isSubBattlePhase() != "deploy_selection_window" && (($gameMap && $gameMap._interpreter && $gameMap._interpreter.isRunning()) && !messageWindowIsOpen)){
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

Window_ButtonHints.prototype.populatHintContainer = function(elem, list) {
	let content = "";
	let iconInfo = [];
	let iconCtr = 0;



	for(let entry of list){
		content+="<div class='hint_block'>";
		for(let row of entry){
			let hintDef = APPSTRINGS.BUTTON_HINTS[row];
			if(hintDef){
				let actions = [];
				if(hintDef.action){
					actions.push(hintDef.action);
				} else if(hintDef.actions){
					actions = hintDef.actions;
				}

				content+="<div class='hint "+(actions.length > 1 ? "combo" : "")+"'>";
				content+="<div class='hint_text scaled_text'>";
				content+=hintDef.text;
				content+="</div>"
				content+="<div class='action_icon_container'>";				
				
				let glyphContainers = [];
				for(let action of actions){
					let icons = $gameSystem.getActionGlyphs(action);
					let content = "";
					for(let icon of icons){
						if(icon){							
							content+="<div class='action_icon' data-icon='"+iconCtr+"'>";
							content+="</div>";
							
							iconInfo[iconCtr] = icon;						
						}
						iconCtr++;
					}	
					glyphContainers.push(content);
				}
				content+=glyphContainers.join("<div class='combo_input scaled_text'>+</div>");
							
				content+="</div>"
				content+="</div>"
			}
		}
		content+="</div>"
	}
	elem.innerHTML = content;
	return iconInfo;
}

Window_ButtonHints.prototype.constructButtonIcon = function(iconCtr, iconDef, shrinkMultiRowIcons) {	
	const _this = this;
	const parentElem = this._centerContainer.querySelector(".action_icon[data-icon='"+iconCtr+"']");
	
	
	//elem.appendChild(this._iconsBitmap.canvas);	
	const initialMultiplier = ENGINE_SETTINGS.MAP_BUTTON_CONFIG.BUTTON_SCALE * 1;	
	const tileSize = ENGINE_SETTINGS.MAP_BUTTON_CONFIG.SPRITE_SHEET.TILE_SIZE * 1;
	const bgWidth = ENGINE_SETTINGS.MAP_BUTTON_CONFIG.SPRITE_SHEET.WIDTH * 1;
	const bgHeight = ENGINE_SETTINGS.MAP_BUTTON_CONFIG.SPRITE_SHEET.HEIGHT * 1;
	
	let offsetX = 0;
	let offsetY = 0;
	
	let width = 0;
	let height = 0;

	let shrinkFactor = 1;
	if(shrinkMultiRowIcons){
		let hasMultiRow = false;
		for(let i = 0; i < 4; i++){
			let suffix = "";
			if(i > 0){//compat with original format
				suffix = i;
			}
			let tiles = iconDef["tiles"+suffix];
			if(tiles && tiles.length > 1){
				hasMultiRow = true;
			}
		}

		if(hasMultiRow){
			shrinkFactor = 0.76;
		}
	}
		
	for(let i = 0; i < 4; i++){
		let suffix = "";
		if(i > 0){//compat with original format
			suffix = i;
		}
		let tiles = iconDef["tiles"+suffix];
		if(tiles){
			const elem = this.getNextTileElem();
			parentElem.appendChild(elem);
			
			height = tiles.length;
			
			for(let y = 0; y < tiles.length; y ++){
				width = tiles[y].length;
				for(let x = 0; x < tiles[y].length; x ++){
					if(x == 0 && y == 0){
						offsetX = tiles[y][x][0];
						offsetY = tiles[y][x][1];
					}			
				}
			}
			
			const mutiplier = initialMultiplier * Graphics.getScale() * shrinkFactor;
			const size = tileSize * mutiplier;
			
			offsetX = offsetX * size;
			offsetY = offsetY * size;
			
			elem.style.height = size * height + "px";
			elem.style.width = size * width + "px";
			elem.style.backgroundSize = bgWidth * mutiplier + "px " + bgHeight * mutiplier + "px";
			elem.style.backgroundImage = "url(" + _this._iconsBitmap._image.src + ")";
			elem.style.backgroundPosition =  offsetX * -1 + "px " + offsetY * -1 + "px"
		}
	}
	
}

Window_ButtonHints.prototype.redraw = async function() {	
	var _this = this;
	
	this._requestCtr++;
	let currentCtr = this._requestCtr;

	for(let context in this._usedContexts){
		this._centerContainer.classList.remove(context);	
	}

	this._centerContainer.classList.add(this._currentDisplayKey);
	
	
	if(!_this._iconsBitmap){
		_this._iconsBitmap = await ImageManager.loadBitmapPromise('', ENGINE_SETTINGS.MAP_BUTTON_CONFIG.SPRITE_SHEET.PATH, true, 0, false, true);
	}

	if(currentCtr != this._requestCtr) {
		return;
	}
	
	const iconInfo = this.populatHintContainer(this._centerContainer, this._hints);

	this.resetPoolPointer();

	for(let i = 0; i < iconInfo.length; i++){
		let iconDef = iconInfo[i];
		if(iconDef){
			this.constructButtonIcon(i, iconDef, this.isTopBar());
		}
	}
	
	Graphics._updateCanvas();
	$CSSUIManager.doUpdateScaledText("button_hints");
}

