import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

import "./style/Window_SelectReassignMech.css";

export default function Window_SelectReassignMech() {
	this.initialize.apply(this, arguments);	
}

Window_SelectReassignMech.prototype = Object.create(Window_CSS.prototype);
Window_SelectReassignMech.prototype.constructor = Window_SelectReassignMech;

Window_SelectReassignMech.prototype.initialize = function() {
	var _this = this;
	this._availableUnits = [];
	this._layoutId = "mech_reassign_select";	
	this._pageSize = 1;
	this._unitMode = "mech";
	this._currentUIState = "main_selection";
	this._currentSlotSelection = 0;
	this._currentSlotCount = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
}

Window_SelectReassignMech.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._currentSlotSelection = 0;	
	this._currentSlotCount = 0;
	this._currentUIState = "main_selection";
}

Window_SelectReassignMech.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var availableMechs = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];	
	
	availableMechs.forEach(function(unit){
		if(!unit.SRWStats.mech.notDeployable && (unit.SRWStats.mech.allowedPilots.length || unit.SRWStats.mech.hasVariableSubPilots) && !unit.isSubPilot){
			tmp.push(unit);
		}
	});
	
	return tmp;
}

Window_SelectReassignMech.prototype.rowEnabled = function(actor){
	var lockedMechs = {};
	var deployInfo = $gameSystem.getDeployInfo();
	
	Object.keys(deployInfo.assigned).forEach(function(slot){
		if(deployInfo.lockedSlots[slot]){
			var actor = $gameActors.actor(deployInfo.assigned[slot]);
			if(actor.SRWStats){
				lockedMechs[actor.SRWStats.mech.id] = true;
			}			
		}
	});
	
	return !lockedMechs[actor.SRWStats.mech.id];
}

Window_SelectReassignMech.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_SelectReassignMech.prototype.setCurrentSelection = function(value){
	this._mechList.setCurrentSelection(value);
}

Window_SelectReassignMech.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.REASSIGN.mech_title;	
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
	
	this._slotSelectionContainer = document.createElement("div");
	this._slotSelectionContainer.id = this.createId("slot_selection_container");
	windowNode.appendChild(this._slotSelectionContainer);	
	
	this._mechList = new MechList(this._listContainer, [0], this);
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	this._detailBarMech = new DetailBarMech(this._detailContainer, this);
	this._detailBarMech.createComponents();
	this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);
}	

Window_SelectReassignMech.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){			
			this.requestRedraw();
			if(this._currentUIState == "main_selection"){
				this._mechList.incrementSelection();
			} else {
				SoundManager.playCursor();
				this._currentSlotSelection++;
				if(this._currentSlotSelection >= this._currentSlotCount){
					this._currentSlotSelection = 0;
				}
				if(this._currentSlotSelection == 0 && !this.getCurrentSelection().mech.allowedPilots.length){
					this._currentSlotSelection = 1;
				}
			}
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
			if(this._currentUIState == "main_selection"){
				this._mechList.decrementSelection();
			} else {
				SoundManager.playCursor();
				this._currentSlotSelection--;
				if(this._currentSlotSelection < 0){
					this._currentSlotSelection = this._currentSlotCount - 1;
				}
				if(this._currentSlotSelection == 0 && !this.getCurrentSelection().mech.allowedPilots.length){
					this._currentSlotSelection = this._currentSlotCount - 1;
				}
			}
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
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			/*if(this._internalHandlers[this._currentKey]){
				this._handlingInput = true;
				this._internalHandlers[this._currentKey].call(this);
			}*/		
			
			if(this.rowEnabled(this.getCurrentSelection().actor)){
				if(this._currentUIState == "main_selection"){
					SoundManager.playOk();
					if(this.getCurrentSelection().mech.hasVariableSubPilots){
						this._currentSlotSelection = 0;
						if(!this.getCurrentSelection().mech.allowedPilots.length){
							this._currentSlotSelection = 1;
						}
						this._currentUIState = "slot_selection";
						this._currentSlotCount = this.getCurrentSelection().mech.subPilots.length + 1;
						this.requestRedraw();
					} else {
						$gameTemp.reassignTargetMech = {type: "main", id: this.getCurrentSelection().mech.id};
						$gameTemp.pushMenu = "pilot_reassign_select";
					}					
				} else {
					SoundManager.playOk();
					if(this._currentSlotSelection == 0){
						$gameTemp.reassignTargetMech = {type: "main", id: this.getCurrentSelection().mech.id};
					} else {
						$gameTemp.reassignTargetMech = {type: "sub", slot: this._currentSlotSelection -1, id: this.getCurrentSelection().mech.id};
					}				
					
					this._currentSlotSelection = 0;
					$gameTemp.pushMenu = "pilot_reassign_select";
				}
			} else {
				SoundManager.playBuzzer();
			}	
			this.refresh();
			return;		
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			if(this._currentUIState == "main_selection"){
				SoundManager.playCancel();		
				$gameTemp.popMenu = true;	
				$gameTemp.reassignTargetMech = null;
			} else {
				SoundManager.playCancel();	
				this._currentUIState = "main_selection";
				this.requestRedraw();
			}
			this.refresh();
			return;	
		}		
		
		this.refresh();
	}		
};

Window_SelectReassignMech.prototype.redraw = function() {
	var _this = this;
	this._mechList.redraw();
	this._detailBarMech.redraw();		
	this._detailBarPilot.redraw();
	
	if(this._mechList.getCurrentInfoPage() == 0){
		this._detailBarPilot.hide();
		this._detailBarMech.show();
	} else {
		this._detailBarPilot.show();
		this._detailBarMech.hide();
	}
	if(this._currentUIState == "slot_selection"){
		var slotSelectionContent = "";
		slotSelectionContent+="<div class='content'>";
		
		var current = this.getCurrentSelection();
		
		if(current.mech.allowedPilots.length){
			slotSelectionContent+="<div data-idx='0' data-type='main' class='entry scaled_text fitted_text "+(_this._currentSlotSelection == 0 ? "selected" : "")+"'>";
			slotSelectionContent+="<div class='slot_label'>"+APPSTRINGS.REASSIGN.label_main+"</div>";
			slotSelectionContent+="<div class='slot_value'>"+(current.actor.SRWStats.pilot.name || "")+"</div>";
			slotSelectionContent+="<div data-actor='"+(current.actor.SRWStats.pilot.id)+"' class='slot_icon'></div>";
			slotSelectionContent+="</div>";	
		}
			
		var subPilots = current.mech.subPilots;
		for(var i = 0; i < subPilots.length; i++){
			slotSelectionContent+="<div data-idx='"+(i + 1)+"' data-type='main' class='entry scaled_text fitted_text "+(_this._currentSlotSelection == (i + 1) ? "selected" : "")+"'>";
			slotSelectionContent+="<div class='slot_label'>"+APPSTRINGS.REASSIGN.label_slot+" "+(i + 1)+"</div>";
			var actor = $gameActors.actor(subPilots[i]);
			var name = "---"
			if(actor){
				name = actor.SRWStats.pilot.name || "";
			}
			slotSelectionContent+="<div class='slot_value'>"+(name)+"</div>";
			slotSelectionContent+="<div data-actor='"+subPilots[i]+"' class='slot_icon'></div>";
			slotSelectionContent+="</div>";		
		}
		
		
		slotSelectionContent+="</div>";
		this._slotSelectionContainer.innerHTML = slotSelectionContent;
		this._slotSelectionContainer.style.display = "";
		
		var slotIcons = this.getWindowNode().querySelectorAll(".slot_icon");
		slotIcons.forEach(function(slotIcon){
			var actorId = slotIcon.getAttribute("data-actor")*1;
			if(actorId && actorId != -1){
				_this.loadActorFace(actorId, slotIcon);
			}			
		});	

		var entries = this._slotSelectionContainer.querySelectorAll(".entry");
		entries.forEach(function(entry){
			entry.addEventListener("click", function(){		
				var idx = this.getAttribute("data-idx"); 
				if(idx != null){
					idx*=1;
					if(idx == _this._currentSlotSelection){
						_this._touchOK = true;				
					} else {
						_this._currentSlotSelection = idx;
						_this.requestRedraw();
					}
				}				
			});
		});			
		
		this.updateScaledDiv(this._slotSelectionContainer);
	} else {
		this._slotSelectionContainer.innerHTML = "";
		this._slotSelectionContainer.style.display = "none";
	}	
	this.loadImages();
	Graphics._updateCanvas();
}