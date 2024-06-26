import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import "./style/Window_EquipMechSelection.css"

export default function Window_EquipMechSelection() {
	this.initialize.apply(this, arguments);	
}

Window_EquipMechSelection.prototype = Object.create(Window_CSS.prototype);
Window_EquipMechSelection.prototype.constructor = Window_EquipMechSelection;

Window_EquipMechSelection.prototype.initialize = function() {
	
	this._layoutId = "equip_item_select";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_EquipMechSelection.prototype.rowEnabled = function(actor){
	return true;
}

Window_EquipMechSelection.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var availableMechs = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];
	availableMechs.forEach(function(candidate){
		if( !candidate.isSubPilot){//
			tmp.push(candidate);
		}
	});
	return tmp;
}

Window_EquipMechSelection.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_EquipMechSelection.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHEQUIPS.select_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._mechList = new MechList(this._listContainer, [10], this); //
	//this._mechList.setUnitModeActor();
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._mechList.setMaxPageSize(4);
	this._detailBarMechDetail = new DetailBarMechDetail(this._detailContainer, this);
	this._detailBarMechDetail.createComponents();
}	

Window_EquipMechSelection.prototype.update = function() {
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
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "equip_item";
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

Window_EquipMechSelection.prototype.redraw = function() {
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_mech", "page_nav"], ["change_equips"], ["det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();	
	
	this._mechList.redraw();
	this._detailBarMechDetail.redraw();		
	this.loadImages();
	Graphics._updateCanvas();
}