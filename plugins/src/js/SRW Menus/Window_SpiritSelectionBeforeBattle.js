import Window_CSS from "./Window_CSS.js";
import Window_SpiritSelection from "./Window_SpiritSelection.js";
import "./style/Window_SpiritSelection.css";

export default function Window_SpiritSelectionBeforeBattle() {
	this.initialize.apply(this, arguments);	
}

Window_SpiritSelectionBeforeBattle.prototype = Object.create(Window_SpiritSelection.prototype);
Window_SpiritSelectionBeforeBattle.prototype.constructor = Window_SpiritSelectionBeforeBattle;

Window_SpiritSelectionBeforeBattle.prototype.initialize = function() {	
	var _this = this;
	this._layoutId = "spirit_selection_before_battle";	
	this._currentSelection = [0,0];
	this._maxSelection = 6;
	this._selectionRowSize = 3;
	this._currentActor = [0, 0];
	this._currentSlot = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_SpiritSelectionBeforeBattle.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	windowNode.classList.add("spirit_selection_container");
	windowNode.classList.add("before_battle");
	var contentContainer = document.createElement("div");
	contentContainer.id = this.createId("content");
	contentContainer.classList.add("content_container");
	windowNode.appendChild(contentContainer);
	this._contentContainer = contentContainer;
	//this._contentContainer.innerHTML = "";	
	
}	

Window_SpiritSelectionBeforeBattle.prototype.getSpiritEnabledState = function(listIdx, slot, isTwin){
	var result = Window_SpiritSelection.prototype.getSpiritEnabledState.call(this, listIdx, slot, isTwin);	
	if(result && listIdx != null){
		var caster = this.getAvailableActors(slot)[this.getCurrentActor(slot)];
		var regularSpirits = $statCalc.getSpiritList(caster);		
		var spiritInfo = $spiritManager.getSpiritDef(regularSpirits[listIdx].idx);
		if(spiritInfo?.targetType != "self"){
			result = -1;
		}
	}
	return result;
	
}
