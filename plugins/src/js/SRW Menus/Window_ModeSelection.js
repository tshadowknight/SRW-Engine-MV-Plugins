import Window_CSS from "./Window_CSS.js";
import "./style/Window_ModeSelection.css"

export default function Window_ModeSelection() {
	this.initialize.apply(this, arguments);	
}

Window_ModeSelection.prototype = Object.create(Window_CSS.prototype);
Window_ModeSelection.prototype.constructor = Window_ModeSelection;

Window_ModeSelection.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "mode_selection";	
	this._pageSize = 1;
	this._options = null;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_ModeSelection.prototype.show = function(){		
	this.resetSelection();
	
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();	
	this.triggerCustomBgCreate();
	
	//lock input until loader has faded away
	this._handlingInput = true;
	setTimeout(() => {this._handlingInput = false}, 1000);
	this.doFadeIn();
	this._loader.classList.remove("fadeToNone");
	Graphics._updateCanvas();
}

Window_ModeSelection.prototype.resetSelection = function(){		
	if(!this._wasStacked){
		this._currentSelection = 0;
		this._wasStacked = false;
	}
}

Window_ModeSelection.prototype.getCurrentSelection = function(){
	return this._currentSelection;
}

Window_ModeSelection.prototype.resetFade = function() {
	var windowNode = this.getWindowNode();
	windowNode.removeChild(this._loader);
	windowNode.appendChild(this._loader);
}

Window_ModeSelection.prototype.doFadeIn = function() {
	this.resetFade();
	this._loader.classList.add("doFade");
}

Window_ModeSelection.prototype.doFadeOut = function() {
	this.resetFade();
	this._loader.classList.add("fadeToNone");
}

Window_ModeSelection.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MODE_SELECTION.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);
	
	this._instructionContainer = document.createElement("div");
	this._instructionContainer.classList.add("instruction_container");
	this._instructionContainer.classList.add("scaled_text");
	this._instructionContainer.innerHTML = APPSTRINGS.MODE_SELECTION.instructions;
	windowNode.appendChild(this._instructionContainer);	
	
	this._loader = document.createElement("div");
	this._loader.classList.add("loader");
	windowNode.appendChild(this._loader);
	
}	

Window_ModeSelection.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		
		if(this._options){
			if(Input.isTriggered('down') || Input.isRepeated('down')){
				this.requestRedraw();
				this._currentSelection++;
				if(this._currentSelection >= this._options.length){
					this._currentSelection = 0;
				}
				SoundManager.playCursor();
				this.refresh();
				return;	
			
			} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
				this.requestRedraw();
				this._currentSelection--;
				if(this._currentSelection < 0){
					this._currentSelection = this._options.length - 1;
				}
				SoundManager.playCursor();
				this.refresh();
				return;	
			}
		}
				

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			
			return;	
					
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			
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
		
		if(Input.isTriggered('ok') || this._touchOK){
			if(this._options){
				let selection = this.getCurrentSelection();
				if(ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 2){//automatic mode enabled
					if(selection == 0){
						$gameSystem.clearManualSetDifficulty();
						$gameSystem.setAutomaticDifficultyLevel();
					} else {
						$gameSystem.setCurrentDifficultyLevel(selection - 1);
					}
				} else {
					$gameSystem.setCurrentDifficultyLevel(selection);
				}				
			}
			$gameTemp.doingModeSelection = false;
			$gameTemp.popMenu = true;
		}
		
		if(Input.isTriggered('menu')){
			
		}	
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			if(this._callbacks["closed"]){
				this.doFadeOut();
				setTimeout(() => {$gameTemp.buttonHintManager.hide(); $gameTemp.popMenu = true; this._callbacks["closed"]();}, 1000);				
			}
		}			
		this.resetTouchState();
		this.refresh();
	}		
};

Window_ModeSelection.prototype.redraw = function() {
	var _this = this;
	

	$gameTemp.buttonHintManager.setHelpButtons([["select_option"], ["confirm_option"]]);	
	$gameTemp.buttonHintManager.show();
	
	var content = "";
	
	if(!this._options){
		if(ENGINE_SETTINGS.DIFFICULTY_MODS && ENGINE_SETTINGS.DIFFICULTY_MODS.levels && ENGINE_SETTINGS.DIFFICULTY_MODS.levels.length){
			this._options = structuredClone(ENGINE_SETTINGS.DIFFICULTY_MODS.levels);
			if(ENGINE_SETTINGS.DIFFICULTY_MODS.enabled & 2){
				this._options.unshift({
					name: APPSTRINGS.MODE_SELECTION.label_automatic,
					description: APPSTRINGS.MODE_SELECTION.desc_automatic
				});
			}
		} else {
			this._options = [];
		}
	}
	
	if(this._options.length){
		const entryHeight = 1 / this._options.length * 100;
		for(let i = 0; i < this._options.length; i++){
			const entry = this._options[i];
			content+="<div data-idx='"+i+"' style='height: "+entryHeight+"%;' class='difficulty_entry "+(i == this.getCurrentSelection() ? "selected" : "")+"'>";
			content+="<div class='content'>";
			content+="<div class='title scaled_text' style='color: "+(entry.color || "#FFFFFF")+";'>";
			content+=entry.name;
			content+="</div>";
			content+="<div class='description scaled_text'>";
			content+=entry.description;
			content+="</div>";
			content+="</div>";
			content+="</div>";
		}
	}
	
	this._listContainer.innerHTML = content;
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".difficulty_entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			_this._currentSelection = this.getAttribute("data-idx");
			_this._touchOK = true;					
		});
		entry.addEventListener("mousemove", function(){	
			const targetIdx = this.getAttribute("data-idx"); 
			if(targetIdx != _this._currentSelection){
				_this._currentSelection = this.getAttribute("data-idx");
				_this.requestRedraw();
			}				
		});
	});	
	
	
	this.loadImages();
	Graphics._updateCanvas();
}