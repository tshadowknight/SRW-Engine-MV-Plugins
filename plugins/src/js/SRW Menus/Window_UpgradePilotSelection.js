import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarPilotDetail from "./DetailBarPilotDetail.js";
import "./style/PilotUpgradeSelection.css"

export default function Window_UpgradePilotSelection() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradePilotSelection.prototype = Object.create(Window_CSS.prototype);
Window_UpgradePilotSelection.prototype.constructor = Window_UpgradePilotSelection;

Window_UpgradePilotSelection.prototype.initialize = function() {
	const _this = this;
	this._layoutId = "pilot_upgrade_list";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_UpgradePilotSelection.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_UpgradePilotSelection.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.PILOTUPGRADES.select_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._mechList = new MechList(this._listContainer, [9]); //
	this._mechList.setUnitModeActor();
	this._mechList.createComponents();
	this._mechList.setMaxPageSize(4);
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._detailBarPilotDetail = new DetailBarPilotDetail(this._detailContainer, this);
	this._detailBarPilotDetail.createComponents();
}	

Window_UpgradePilotSelection.prototype.update = function() {
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
			/*if(this._internalHandlers[this._currentKey]){
				this._handlingInput = true;
				this._internalHandlers[this._currentKey].call(this);
			}*/
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "upgrade_pilot";
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

Window_UpgradePilotSelection.prototype.redraw = function() {
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_pilot", "page_nav"], ["upgrade_pilot"], ["det_page_nav", "det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();
	
	this._mechList.redraw();
	this._detailBarPilotDetail.redraw();		
	this.loadImages();
	Graphics._updateCanvas();
}