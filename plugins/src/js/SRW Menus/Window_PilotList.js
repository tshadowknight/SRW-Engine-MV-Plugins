import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarPilotStats from "./DetailBarPilotStats.js";
import DetailBarPilotSpirits from "./DetailBarPilotSpirits.js";

export default function Window_PilotList() {
	this.initialize.apply(this, arguments);	
}

Window_PilotList.prototype = Object.create(Window_CSS.prototype);
Window_PilotList.prototype.constructor = Window_PilotList;

Window_PilotList.prototype.initialize = function() {
	
	this._layoutId = "pilot_list";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_PilotList.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_PilotList.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	$gameTemp.listContext = "actor";
}

Window_PilotList.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.PILOTLIST.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._detailPilotContainer = document.createElement("div");
	this._detailPilotContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailPilotContainer);	
	
	this._mechList = new MechList(this._listContainer, [5, 6, 7, 8]); //
	this._mechList.setUnitModeActor();
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	this._detailBarPilotStats = new DetailBarPilotStats(this._detailContainer, this);
	this._detailBarPilotStats.createComponents();
	this._detailBarPilotSpirits = new DetailBarPilotSpirits(this._detailPilotContainer, this);	
}	

Window_PilotList.prototype.update = function() {
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
			$gameTemp.detailPageMode = "menu";
			$gameTemp.pushMenu = "detail_pages";
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

Window_PilotList.prototype.redraw = function() {
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_pilot", "page_nav"], ["generic_list_pilot"], ["det_page_nav", "det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();
	
	this._mechList.redraw();
	this._detailBarPilotStats.redraw();		
	this._detailBarPilotSpirits.redraw();
	
	var infoPage = this._mechList.getCurrentInfoPage();
	if(infoPage == 5 || infoPage == 8){
		this._detailBarPilotSpirits.hide();
		this._detailBarPilotStats.show();
	} else {
		this._detailBarPilotSpirits.show();
		this._detailBarPilotStats.hide();
	}
	this.loadImages();
	Graphics._updateCanvas();
}