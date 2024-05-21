import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";

export default function Window_UpgradeUnitSelection() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradeUnitSelection.prototype = Object.create(Window_CSS.prototype);
Window_UpgradeUnitSelection.prototype.constructor = Window_UpgradeUnitSelection;

Window_UpgradeUnitSelection.prototype.initialize = function() {	
	const _this = this;
	this._layoutId = "upgrade_unit_selection";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_UpgradeUnitSelection.prototype.rowEnabled = function(actor){
	return true;
}


Window_UpgradeUnitSelection.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var availableMechs = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];
	availableMechs.forEach(function(candidate){
		if(!candidate.isSubPilot){
			tmp.push(candidate);
		}
	});
	return tmp;
}

Window_UpgradeUnitSelection.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_UpgradeUnitSelection.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHUPGRADES.select_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	

	this._mechList = new MechList(this._listContainer, [0, 4], this);
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._DetailBarMechUpgrades = new DetailBarMechUpgrades(this._detailContainer, this);
}	

Window_UpgradeUnitSelection.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			this._mechList.incrementSelection();
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    this._mechList.decrementSelection();
			this.refresh();
			return;	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left') || this._touchLeft){
			this.requestRedraw();
			this._mechList.decrementPage();
			this.refresh();
			return;	
		} else if (Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight) {
			this.requestRedraw();
		    this._mechList.incrementPage();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			this._mechList.decrementInfoPage();
			this.refresh();
			return;	
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			this._mechList.incrementInfoPage();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			this._mechList.decrementSortIdx();
			this.refresh();
			return;	
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			this._mechList.incrementSortIdx();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			this._mechList.toggleSortOrder();	
			this.refresh();
			return;		
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "upgrade_mech";
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();	
			this.refresh();
			return;				
		}		
		this.resetTouchState();
		this.refresh();
	}		
};

Window_UpgradeUnitSelection.prototype.redraw = function() {
	this._mechList.redraw();
	this._DetailBarMechUpgrades.redraw();	

	$gameTemp.buttonHintManager.setHelpButtons([["select_mech", "page_nav"], ["upgrade_unit"], ["det_page_nav", "det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();	
	
	this.loadImages();
	Graphics._updateCanvas();
}

