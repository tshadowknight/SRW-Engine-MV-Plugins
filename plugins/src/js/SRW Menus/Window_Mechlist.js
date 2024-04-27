import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

export default function Window_MechList() {
	this.initialize.apply(this, arguments);	
}

Window_MechList.prototype = Object.create(Window_CSS.prototype);
Window_MechList.prototype.constructor = Window_MechList;

Window_MechList.prototype.initialize = function() {
	
	this._layoutId = "mech_list";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_MechList.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}
var Window_CSS_getAvailableUnits = Window_CSS.prototype.getAvailableUnits;
Window_MechList.prototype.getAvailableUnits = function(){
	let units = [];
	if(this._unitProvider){
		units = this._unitProvider.getAvailableUnits();
	} else {
		units = Window_CSS_getAvailableUnits.call(this);
	}
	let tmp = [];
	for(let unit of units){
		if(!unit.isSubPilot){
			tmp.push(unit);
		}
	}
	return tmp;
}

Window_MechList.prototype.rowEnabled = function(actor){
	return true;
}

Window_MechList.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	$gameTemp.listContext = "mech";
}

Window_MechList.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.MECHLIST.title;	
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
	
	this._mechList = new MechList(this._listContainer, [0, 1, 2, 3], this);
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._detailBarMech = new DetailBarMech(this._detailContainer, this);
	this._detailBarMech.createComponents();
	this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);	
}	

Window_MechList.prototype.update = function() {
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
			$gameTemp.listContext = "actor"; //lazy way to manage this as mech context is much rarer than actor context		
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();	
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

Window_MechList.prototype.redraw = function() {
	var _this = this;
	this._mechList.redraw();
	this._detailBarMech.redraw();		
	this._detailBarPilot.redraw();
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_mech", "page_nav"], ["generic_list_mech"], ["det_page_nav", "det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();
	
	if(this._mechList.getCurrentInfoPage() == 0){
		this._detailBarPilot.hide();
		this._detailBarMech.show();
	} else {
		this._detailBarPilot.show();
		this._detailBarMech.hide();
	}
	
	this.loadImages();
}