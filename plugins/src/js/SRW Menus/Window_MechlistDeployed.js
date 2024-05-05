import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

export default function Window_MechListDeployed() {
	this.initialize.apply(this, arguments);	
}

Window_MechListDeployed.prototype = Object.create(Window_CSS.prototype);
Window_MechListDeployed.prototype.constructor = Window_MechListDeployed;

Window_MechListDeployed.prototype.initialize = function() {
	
	this._layoutId = "mech_list_deployed";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_MechListDeployed.prototype.getAvailableUnits = function(){
	var _this = this;
	if($gameTemp.searchInfo){
		return $statCalc.getSearchedActors("actor", $gameTemp.searchInfo);
	} else {
		return $statCalc.getAllActors("actor");
	}	
}

Window_MechListDeployed.prototype.rowEnabled = function(actor){
	if($gameTemp.searchInfo && $gameTemp.searchInfo.type == "spirit"){
		const spirits = $statCalc.getSpiritList(actor);
		const currentSP = $statCalc.getCurrentSP(actor);
		let result = false;
		for(const spirit of spirits){
			if(spirit.idx == $gameTemp.searchInfo.value){
				if(spirit.cost <= currentSP){
					result = true;
				}
			}
		}
		return result;
	} else {
		return !actor.srpgTurnEnd();
	}	
}

Window_MechListDeployed.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_MechListDeployed.prototype.createComponents = function() {
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

Window_MechListDeployed.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			this._mechList.incrementSelection();
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
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
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger') ){
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
			/*if($gameTemp.searchInfo){
				$gameTemp.killMenu("mech_list_deployed");	
				if(this._callbacks["search_selected"]){
					this._callbacks["search_selected"](this.getCurrentSelection().actor);
				}
			} else {
				$gameTemp.currentMenuUnit = this.getCurrentSelection();
				$gameTemp.detailPageMode = "menu";
				$gameTemp.pushMenu = "detail_pages";	
			}*/			
			const selectedActor = this.getCurrentSelection().actor;
			var event = $statCalc.getReferenceEvent(selectedActor);
			$gamePlayer.locate(event.posX(), event.posY(), false);		
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();
			this._mechList.setCurrentSelection(0);
			Input.clear();
			
			if($gameTemp.mechListWindowSearchSelectionCallback){
				$gameTemp.mechListWindowSearchSelectionCallback(selectedActor);
			}
			
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}	
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();
			this._mechList.setCurrentSelection(0);
			Input.clear();
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}
			this.refresh();
			return;				
		}		
		
		this.refresh();
	}		
};

Window_MechListDeployed.prototype.redraw = function() {
	this._mechList.redraw();
	this._detailBarMech.redraw();		
	this._detailBarPilot.redraw();
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_mech", "page_nav"], ["highlight_map"], ["det_page_nav", "det_page_sort"], ["det_sort_order"]]);
	$gameTemp.buttonHintManager.show();
	
	if(this._mechList.getCurrentInfoPage() == 0){
		this._detailBarPilot.hide();
		this._detailBarMech.show();
	} else {
		this._detailBarPilot.show();
		this._detailBarMech.hide();
	}
	this.loadImages();
	Graphics._updateCanvas();
}