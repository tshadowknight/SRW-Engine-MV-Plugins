import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarPilotStats from "./DetailBarPilotStats.js";

export default function Window_SelectReassignPilot() {
	this.initialize.apply(this, arguments);	
}

Window_SelectReassignPilot.prototype = Object.create(Window_CSS.prototype);
Window_SelectReassignPilot.prototype.constructor = Window_SelectReassignPilot;

Window_SelectReassignPilot.prototype.initialize = function() {
	this._availableUnits = [];
	this._layoutId = "pilot_reassign_select";	
	this._pageSize = 1;
	this._unitMode = "actor";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_SelectReassignPilot.prototype.resetSelection = function(){
	if(this._mechList){
		this._mechList.setCurrentSelection(0);
	}	
}

Window_SelectReassignPilot.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var assignablePilotLookup = {};
	
	var availablePilots = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];	
	
	if($gameTemp.reassignTargetMech){
		var target = $gameTemp.reassignTargetMech;	
		var mechId = target.id;
		var mechData = $statCalc.getMechData($dataClasses[mechId], true);
		if(target.type == "main"){				
			mechData.allowedPilots.forEach(function(id){
				assignablePilotLookup[id] = true;
			});
		} else {
			var allowedSubPilots = mechData.allowedSubPilots[$gameTemp.reassignTargetMech.slot];
			if(allowedSubPilots){
				allowedSubPilots.forEach(function(id){
					assignablePilotLookup[id] = true;
				});
			}			
		}	
		/*var currentPilot = $statCalc.getCurrentPilot(mechId);
		if(currentPilot){
			assignablePilotLookup[currentPilot.SRWStats.pilot.id] = false;
		}*/
	}	
	
	availablePilots.forEach(function(unit){
		if(assignablePilotLookup[unit.SRWStats.pilot.id]){
			tmp.push(unit);
		}
	});
	
	return tmp;
}

Window_SelectReassignPilot.prototype.rowEnabled = function(actor){
	var lockedPilots = {};
	var deployInfo = $gameSystem.getDeployInfo();
	
	Object.keys(deployInfo.assigned).forEach(function(slot){
		if(deployInfo.lockedSlots[slot]){
			lockedPilots[$gameActors.actor(deployInfo.assigned[slot]).SRWStats.pilot.id] = true;
		}
	});
	
	return !lockedPilots[actor.SRWStats.pilot.id];
}

Window_SelectReassignPilot.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_SelectReassignPilot.prototype.setCurrentSelection = function(value){
	this._mechList.setCurrentSelection(value);
}

Window_SelectReassignPilot.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.REASSIGN.pilot_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	/*this._detailPilotContainer = document.createElement("div");
	this._detailPilotContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailPilotContainer);	*/
	
	this._mechList = new MechList(this._listContainer, [5], this);
	this._mechList.createComponents();
	this._mechList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._mechList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._mechList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._mechList.registerObserver("redraw", function(){_this.requestRedraw();});
	this._detailBarMech = new DetailBarPilotStats(this._detailContainer, this);
	this._detailBarMech.createComponents();
	//this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);
}	

Window_SelectReassignPilot.prototype.update = function() {
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
			var selection = this.getCurrentSelection();
			if(selection && this.rowEnabled(selection.actor) && $gameTemp.reassignTargetMech){
				SoundManager.playOk();
				var target = $gameTemp.reassignTargetMech;
				var mechId = target.id;
				if(target.type == "main"){
					var targetPilot = this.getCurrentSelection().actor;
					var currentPilot = $statCalc.getCurrentPilot(mechId);
					let subTwinId;
					if(currentPilot){
						currentPilot._classId = 0;
						currentPilot.isSubPilot = false;		
						$statCalc.resetTwinState(currentPilot);
						$statCalc.initSRWStats(currentPilot);						
						$gameSystem.clearActorDeployInfo(currentPilot.actorId());
						$gameSystem.overwritePilotFallbackInfo(currentPilot);
					}					
					
					var previousMechs = $statCalc.getCurrentVariableSubPilotMechs(targetPilot.actorId());
					previousMechs.forEach(function(previousMechId){		
						var previousMech = $statCalc.getMechData($dataClasses[previousMechId], true);
						if(previousMech && previousMech.id != -1){
							previousMech.subPilots[previousMech.subPilots.indexOf(targetPilot.actorId())] = 0;
							$statCalc.storeMechData(previousMech);
							$gameSystem.overwriteMechFallbackInfo(previousMech.id, JSON.parse(JSON.stringify(previousMech.subPilots)));	
							//ensure the live copy of the unit is also updated
							var currentPilot = $statCalc.getCurrentPilot(previousMech.id);
							if(currentPilot){
								currentPilot.SRWStats.mech.subPilots[currentPilot.SRWStats.mech.subPilots.indexOf(targetPilot.actorId())] = 0;
								$gameSystem.overwritePilotFallbackInfo(currentPilot);
							}
						}	
					});	
					
					targetPilot._classId = mechId;
					targetPilot.isSubPilot = false;
					$statCalc.resetTwinState(targetPilot);
					$statCalc.initSRWStats(targetPilot);
					$gameSystem.clearActorDeployInfo(targetPilot.actorId());
					$gameSystem.overwritePilotFallbackInfo(targetPilot);
					const targetMech = $statCalc.getMechData($dataClasses[mechId], true);
					$gameSystem.overwriteMechFallbackInfo(mechId, JSON.parse(JSON.stringify(targetMech.subPilots)));						
					$gameTemp.popMenu = true;
				} else {
					var targetPilot = this.getCurrentSelection().actor;
					if(targetPilot){
						targetPilot._classId = 0;
						targetPilot.isSubPilot = true;
						$statCalc.resetTwinState(targetPilot);
						$statCalc.initSRWStats(targetPilot);						
						$gameSystem.clearActorDeployInfo(targetPilot.actorId());
						$gameSystem.overwritePilotFallbackInfo(targetPilot);
					}
					var previousMechs = $statCalc.getCurrentVariableSubPilotMechs(targetPilot.actorId());
					previousMechs.forEach(function(previousMechId){		
						var previousMech = $statCalc.getMechData($dataClasses[previousMechId], true);
						if(previousMech && previousMech.id != -1){
							previousMech.subPilots[previousMech.subPilots.indexOf(targetPilot.actorId())] = 0;
							$statCalc.storeMechData(previousMech);
							$gameSystem.overwriteMechFallbackInfo(previousMech.id, JSON.parse(JSON.stringify(previousMech.subPilots)));	
							//ensure the live copy of the unit is also updated
							var currentPilot = $statCalc.getCurrentPilot(previousMech.id);
							if(currentPilot){
								currentPilot.SRWStats.mech.subPilots[currentPilot.SRWStats.mech.subPilots.indexOf(targetPilot.actorId())] = 0;
								$gameSystem.overwritePilotFallbackInfo(currentPilot);
							}
						}	
					});	
					var targetMech = $statCalc.getMechData($dataClasses[$gameTemp.reassignTargetMech.id], true);
					targetMech.subPilots[$gameTemp.reassignTargetMech.slot] = targetPilot.actorId();
					$statCalc.storeMechData(targetMech);
					$gameSystem.overwriteMechFallbackInfo(targetMech.id, JSON.parse(JSON.stringify(targetMech.subPilots)));	
					
					targetPilot._classId = $gameTemp.reassignTargetMech.id;
					
					//ensure the live copy of the unit is also updated
					var currentPilot = $statCalc.getCurrentPilot(mechId);
					if(currentPilot){
						currentPilot.SRWStats.mech.subPilots[$gameTemp.reassignTargetMech.slot] = targetPilot.actorId();
						$gameSystem.overwritePilotFallbackInfo(currentPilot);
					}
					
					$gameTemp.popMenu = true;						
				}
				
				if(this.getCurrentSelection().mech.forcePilots){
					$statCalc.applyDeployActions(this.getCurrentSelection().actor.actorId(), mechId, true);
					$statCalc.initSRWStats(this.getCurrentSelection().actor);
				} else {
					$statCalc.unbindLinkedDeploySlots(this.getCurrentSelection().actor.actorId(), mechId, target.type, $gameTemp.reassignTargetMech.slot);
				}			
				
				$gameSystem.updateAvailableUnits(false, true);
			} else {
				SoundManager.playBuzzer();
			}
			this.refresh();
			return;		
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;	
			$gameTemp.reassignTargetMech = null;
			this.refresh();
			return;	
		}		
		
		this.refresh();
	}		
};

Window_SelectReassignPilot.prototype.redraw = function() {
	this._mechList.redraw();
	this._detailBarMech.redraw();		
	
	this._detailBarMech.show();
	
	this.loadImages();
	Graphics._updateCanvas();
}