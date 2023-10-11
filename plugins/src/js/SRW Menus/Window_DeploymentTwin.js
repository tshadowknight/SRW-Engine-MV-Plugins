import Window_CSS from "./Window_CSS.js";
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import "./style/Window_Deployment.css"

export default function Window_DeploymentTwin() {
	this.initialize.apply(this, arguments);	
}

Window_DeploymentTwin.prototype = Object.create(Window_CSS.prototype);
Window_DeploymentTwin.prototype.constructor = Window_DeploymentTwin;

Window_DeploymentTwin.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment";	
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 5;
	
	this._availableRowSize = 4;
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
	this._twinSwapSource = -1;
	
	
	
	this._maxSlots = ENGINE_SETTINGS.MAX_DEPLOY_SIZE_TWIN || 40;
	if(!this.isTwinMode()){
		this._rearrageRowSize = 9;
		this._maxSlots =  ENGINE_SETTINGS.MAX_DEPLOY_SIZE || 36;
	}
}

Window_DeploymentTwin.prototype.isTwinMode = function(){
	return ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS && $gameTemp.deployMode != "ships";
}

Window_DeploymentTwin.prototype.getDeployList = function(){
	if($gameTemp.deployMode == "ships"){
		return $gameSystem.getShipDeployList();
	} else {
		return $gameSystem.getDeployList();
	}
}

Window_DeploymentTwin.prototype.setDeployList = function(list){
	if($gameTemp.deployMode == "ships"){
		$gameSystem.shipDeployList = list;
	} else {
		$gameSystem.deployList = list;
	}
}

Window_DeploymentTwin.prototype.getDeployCount = function(list){
	var deployInfo = $gameSystem.getDeployInfo();
	if($gameTemp.deployMode == "ships"){
		return deployInfo.shipCount;
	} else {
		return deployInfo.count;
	}
}

Window_DeploymentTwin.prototype.getLockedSlots = function(){
	var deployInfo = $gameSystem.getDeployInfo();
	if($gameTemp.deployMode == "ships"){
		return deployInfo.lockedShipSlots;
	} else {
		return deployInfo.lockedSlots;
	}
}

Window_DeploymentTwin.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._swapSource = -1;
	this._twinSwapSource = -1;
	this._rearrageSelection = 0;
	/*this._maxSlots = 40;
	this._rearrageRowSize = 5;
	if(!this.isTwinMode()){
		this._rearrageRowSize = 9;
		this._maxSlots = 36;
	}*/
}

Window_DeploymentTwin.prototype.getMaxDeploySlots = function(){
	return this._maxSlots * 2;
}
/*
Window_DeploymentTwin.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;
	
}*/

Window_DeploymentTwin.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	windowNode.classList.add("twin");
	windowNode.classList.add("deployment");
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.DEPLOYMENT.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._deployedList = document.createElement("div");
	this._deployedList.classList.add("scrolled_list");
	this._deployedList.classList.add("deployed_list");
	this._deployedList.classList.add("styled_scroll");
	windowNode.appendChild(this._deployedList);	
	
	this._detailBarMechDetail = new DetailBarMechDetail(this._deployedList, {
		getCurrentSelection: function(){
			var actorId;
			var activeElem = _this._availableList.querySelector(".focus");
			if(activeElem){
				actorId = activeElem.getAttribute("data-actorid");
			}
			
			var pilotData;
			if(actorId)	{
				pilotData = $gameActors.actor(actorId);
			}
			return {actor: pilotData, mech: pilotData.SRWStats.mech};
		}
	});
	this._detailBarMechDetail.createComponents();
	
	/*this._deployedListLabel = document.createElement("div");
	this._deployedListLabel.classList.add("deployed_list_label");
	this._deployedListLabel.classList.add("list_label");
	this._deployedListLabel.classList.add("scaled_text");
	this._deployedListLabel.innerHTML = APPSTRINGS.DEPLOYMENT.order;
	windowNode.appendChild(this._deployedListLabel);	*/
	
	this._availableList = document.createElement("div");
	this._availableList.classList.add("scrolled_list");
	this._availableList.classList.add("available_list");
	this._availableList.classList.add("styled_scroll");
	windowNode.appendChild(this._availableList);	
	
	this._availableListLabel = document.createElement("div");
	this._availableListLabel.classList.add("available_list_label");
	this._availableListLabel.classList.add("list_label");
	this._availableListLabel.classList.add("scaled_text");
	//this._availableListLabel.innerHTML = APPSTRINGS.DEPLOYMENT.available;
	windowNode.appendChild(this._availableListLabel);
	
	this._pilotInfoDisplay = document.createElement("div");	
	this._pilotInfoDisplay.classList.add("pilot_info");	
	windowNode.appendChild(this._pilotInfoDisplay);
	
}	

Window_DeploymentTwin.prototype.getCurrentSelection = function() {	
	return this._rearrageSelection;	
}

Window_DeploymentTwin.prototype.setCurrentSelection = function(value) {	
	this._rearrageSelection = value;	
}

Window_DeploymentTwin.prototype.getMaxRowSize = function() {
	return this._rearrageRowSize*2;
}

Window_DeploymentTwin.prototype.getCurrentRowSize = function() {
	return this._rearrageRowSize*2;
}

Window_DeploymentTwin.prototype.getCurrentRowIndex = function() {
	var row = Math.floor(this.getCurrentSelection() / this.getMaxRowSize()) + 1;
	return this.getMaxRowSize() - ((row * this.getMaxRowSize()) - this.getCurrentSelection());
}

Window_DeploymentTwin.prototype.incrementRow = function() {	
	var maxDeploySlots = this.getMaxDeploySlots()
	if(this.getCurrentSelection() + this.getMaxRowSize() < maxDeploySlots){
		this.setCurrentSelection(this.getCurrentSelection() + this.getMaxRowSize());
	}
}

Window_DeploymentTwin.prototype.decrementRow = function() {
	if(this.getCurrentSelection() - this.getMaxRowSize() >= 0){
		this.setCurrentSelection(this.getCurrentSelection() - this.getMaxRowSize());
	}  
}

Window_DeploymentTwin.prototype.incrementColumn = function() {		
	var increment = 1;
	if(!this.isTwinMode()){
		increment = 2;
	}
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() + increment) < this.getCurrentRowSize()){
		this.setCurrentSelection(this.getCurrentSelection() + increment);
	}		
}

Window_DeploymentTwin.prototype.decrementColumn = function() {	
	var decrement = 1;
	if(!this.isTwinMode()){
		decrement = 2;
	}
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() - decrement) >= 0){		
		this.setCurrentSelection(this.getCurrentSelection() - decrement);
	}		
}

Window_DeploymentTwin.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
		
			SoundManager.playCursor();
			this.incrementRow();	
			this.refresh();
			return;		
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    
			SoundManager.playCursor();
			this.decrementRow();		
			this.refresh();
			return;		
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			this.decrementColumn();
			this.refresh();
			return;	
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			this.incrementColumn();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();			
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();			
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok') || _this._touchOK){	
			//if(this._UIState == "rearrange_slots"){
			function swapSlots(sourceActorId, sourceSlot, sourceType, targetActorId, targetSlot, targetType, inBatch){
				var deployList = _this.getDeployList()				
				
				if(!deployList[sourceSlot]){
					deployList[sourceSlot] = {
						main: null,
						sub: null
					};
				}
				if(targetActorId && targetActorId != -1){	
					deployList[sourceSlot][sourceType] = targetActorId;
				} else {
					deployList[sourceSlot][sourceType] = null;
				}
				
				
				if(!deployList[targetSlot]){
					deployList[targetSlot] = {
						main: null,
						sub: null
					};
				}
				if(sourceActorId && sourceActorId != -1){	
					deployList[targetSlot][targetType] = sourceActorId;
				} else {
					deployList[targetSlot][targetType] = null;
				}
				$gameSystem.updateAvailableUnits(true);
			}				
				
			var currentSelection = this._availableList.querySelector(".active");
			if(currentSelection){				
				var isLocked = currentSelection.getAttribute("data-islocked") * 1;
				this.requestRedraw();
				
				if(isLocked){
					SoundManager.playBuzzer();
				} else {
					var swapSelection = this._availableList.querySelector(".swap");
					if(!swapSelection){
						this._swapSource = this._rearrageSelection;
					} else if(swapSelection.classList.contains("twin")){	
						currentSelection = currentSelection.closest(".twin");
						var targetSlot = Math.floor(_this._rearrageSelection / 2);
						
						var sourceSlot = Math.floor(_this._twinSwapSource);
						
						var sourceActorId = swapSelection.querySelector(".entry.main").getAttribute("data-actorid") * 1;
						var targetActorId = currentSelection.querySelector(".entry.main").getAttribute("data-actorid") * 1;
						
						swapSlots(
							sourceActorId, 
							sourceSlot, 
							"main",
							targetActorId,
							targetSlot,
							"main"
						);

						var sourceActorId = swapSelection.querySelector(".entry.sub").getAttribute("data-actorid") * 1;
						var targetActorId = currentSelection.querySelector(".entry.sub").getAttribute("data-actorid") * 1;
						
						swapSlots(
							sourceActorId, 
							sourceSlot, 
							"sub",
							targetActorId,
							targetSlot,
							"sub"
						);							
						_this.updateDeployInfo();	
						//compressDeployList();	
						this._twinSwapSource = -1;
					} else if(this._swapSource != this._rearrageSelection){	
						
						
						var sourceActorId = swapSelection.getAttribute("data-actorid") * 1;
						var targetActorId = currentSelection.getAttribute("data-actorid") * 1;
						
						var targetSlot = Math.floor(_this._rearrageSelection / 2);
						var sourceSlot = Math.floor(_this._swapSource / 2);
						
							
						
						
						if(!_this.validateTwinSlot(sourceActorId, _this._swapSource, targetActorId, _this._rearrageSelection)){							
							SoundManager.playBuzzer();
							return;
						}
						var noTwin = !$statCalc.validateTwinTarget($gameActors.actor(sourceActorId)) || !$statCalc.validateTwinTarget($gameActors.actor(sourceActorId));
						
						swapSlots(
							sourceActorId, 
							sourceSlot, 
							!(_this._swapSource % 2) ? "main" : "sub",
							targetActorId,
							targetSlot,
							!(_this._rearrageSelection % 2) ? "main" : "sub",
						);	
						_this.updateDeployInfo();		
						//compressDeployList();	
						this._swapSource = -1;
					}
					SoundManager.playOk();
				}
			}	
			this.refresh();
			return;		
		}
		
		if(Input.isTriggered('shift')){
			if(!this.isTwinMode()){
				return;
			}
			var currentSelection = this._availableList.querySelector(".active");
			if(currentSelection){				
				var isLocked = currentSelection.getAttribute("data-islocked") * 1;
				this.requestRedraw();
				if(isLocked){
					SoundManager.playBuzzer();
				} else {
					var swapSelection = this._availableList.querySelector(".swap");
					if(!swapSelection){
						this._twinSwapSource = Math.floor(this._rearrageSelection / 2);
					}
				}
			}
			this.refresh();
			return;		
		}
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			if(this._twinSwapSource != -1){
				this.requestRedraw();
				this._twinSwapSource = -1;
			} else if(this._swapSource != -1){
				this.requestRedraw();
				this._swapSource = -1;
			} else {
				this.onCancel();
			}	
			this.refresh();
			return;	
		}
		if(Input.isTriggered('menu') || this._touchMenu){	
			this.onMenu();	
			this.refresh();
			return;	
		}	

		function compressDeployList(){
			var deployList = _this.getDeployList()
			var tmp = [];
			for(var i = 0; i < deployList.length; i++){
				if(deployList[i] && (deployList[i].main || deployList[i].sub)){
					tmp.push(deployList[i]);
				}
			}
			_this.setDeployList(tmp);
		}		
		
		function placeMovedEntry(movedEntry){
			var deployList = _this.getDeployList()
			var deployInfo = $gameSystem.getDeployInfo();
			var placed = false;
			var i = 0;
			while(i < deployList.length && !placed){
				if(!_this.getLockedSlots()[i]  && (!deployList[i] || (!deployList[i].main && !deployList[i].sub))){
					placed = true;
					deployList[i] = movedEntry;
				}
				i++;
			}
			compressDeployList();
			if(!placed){
				deployList.push(movedEntry);
			}
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){ //L, move to front of list
			this.requestRedraw();
			var currentSelection = this._availableList.querySelector(".active");
			if(currentSelection){
				var isLocked = currentSelection.getAttribute("data-islocked") * 1;				
				if(isLocked){
					SoundManager.playBuzzer();
				} else {
					var deployList = _this.getDeployList()
					var deployInfo = $gameSystem.getDeployInfo();
					var targetSlot = Math.floor(_this._rearrageSelection / 2);
					var movedEntry = deployList[targetSlot];
					if(movedEntry && (movedEntry.main || movedEntry.sub)){
						deployList[targetSlot] = null;
						var i = targetSlot - 1;
						while(i >= 0){
							if(!_this.getLockedSlots()[i]){
								var target = i;
								var newIdx = i + 1;
								while(newIdx < deployList.length && _this.getLockedSlots()[newIdx]){
									newIdx++;
								}
								if(newIdx >= 0 && newIdx < deployList.length){
									deployList[newIdx] = deployList[target];
									deployList[target] = null;
								}							
							}
							i--;
						}
					}
					placeMovedEntry(movedEntry);
				}
			}
			this.refresh();
			return;	
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {//R, move to back of list
			this.requestRedraw();
			var currentSelection = this._availableList.querySelector(".active");
			if(currentSelection){
				var isLocked = currentSelection.getAttribute("data-islocked") * 1;				
				if(isLocked){
					SoundManager.playBuzzer();
				} else {
					var deployList = _this.getDeployList()
					var deployInfo = $gameSystem.getDeployInfo();
					var targetSlot = Math.floor(_this._rearrageSelection / 2);
					var movedEntry = deployList[targetSlot];
					if(movedEntry && (movedEntry.main || movedEntry.sub)){
						deployList[targetSlot] = null;
						var i = targetSlot + 1;
						while(i < deployList.length){
							if(!_this.getLockedSlots()[i]){
								var target = i;
								var newIdx = i - 1;
								while(newIdx > 0 && _this.getLockedSlots()[newIdx]){
									newIdx--;
								}
								if(newIdx >= 0 && newIdx < deployList.length){
									deployList[newIdx] = deployList[target];
									deployList[target] = null;
								}							
							}
							i++;
						}
					}
					placeMovedEntry(movedEntry);
				}	
			}	
			this.refresh();
			return;		
		}
		
		this.refresh();
	}		
};

Window_DeploymentTwin.prototype.validateTwinSlot = function(sourceActorId, sourceSelection, targetActorId, targetSelection) {
	var _this = this;
	if(!this.isTwinMode()){
		return true;
	}
	var deployList = _this.getDeployList()
	
	var targetSlot = Math.floor(targetSelection / 2);
	var sourceSlot = Math.floor(sourceSelection / 2);
	
	var targetEntry = deployList[targetSlot] || {};
	var sourceEntry = deployList[sourceSlot] || {}; 
	var isValid = true;
	if(!$statCalc.validateTwinTarget($gameActors.actor(sourceActorId), true)){
		if((targetSelection % 2)){
			if(targetEntry && targetEntry.sub && targetEntry.sub != sourceActorId){
				isValid = false;
			}
		} else {
			if(targetEntry && targetEntry.main && targetEntry.main != sourceActorId){
				isValid = false;
			}
		}
	}
	
	if(!(targetSelection % 2)){
		if(targetEntry && targetEntry.main && targetEntry.main != sourceActorId){
			if(!$statCalc.validateTwinTarget($gameActors.actor(targetEntry.main), true)){
				isValid = false;
			}
		}
	}
	
	if(!$statCalc.validateTwinTarget($gameActors.actor(targetActorId), true)){
		if((sourceSelection % 2)){
			if(sourceEntry && sourceEntry.sub){
				isValid = false;
			}
		} else {
			if(sourceEntry && sourceEntry.main){
				isValid = false;
			}
		}
	}
	return isValid;
}

Window_DeploymentTwin.prototype.onCancel = function() {
	SoundManager.playCancel();
	if(this._UIState == "rearrange_slots" && this._swapSource != -1){
		this._swapSource = -1;
		this.requestRedraw();
	} else {
		$gameTemp.popMenu = true;
		this._slotLookup = null;
		this._availableUnits = null;
	}
}

Window_DeploymentTwin.prototype.onMenu = function(){
	
}

Window_DeploymentTwin.prototype.updateDeployInfo = function(deployInfo) {
	var _this = this;
	//$gameSystem.setDeployInfo(deployInfo);
	//this._slotLookup = null;
	var deployList = _this.getDeployList()
	for(var i = 0; i < deployList.length; i++){
		if(deployList[i] && !deployList[i].main && deployList[i].sub){
			deployList[i].main = deployList[i].sub;
			deployList[i].sub = null;
		} 
	}
	$gameSystem.syncPreferredSlots();
}

Window_DeploymentTwin.prototype.getAvailableUnits = function() {
	var candidates = $gameSystem.getAvailableUnits();	
	var tmp = [];
	candidates.forEach(function(candidate){
		if($statCalc.isValidForDeploy(candidate)){
			tmp.push(candidate);
		}
	});
	return tmp;
}

Window_DeploymentTwin.prototype.getSlotLookup = function() {
	if(!this._slotLookup) {
		var deployInfo = $gameSystem.getDeployInfo();
		var slotLookup = {};
		Object.keys(deployInfo.assigned).forEach(function(slot){
			slotLookup[deployInfo.assigned[slot]] = slot;
		});
		this._slotLookup = slotLookup;
	}
	return this._slotLookup;
}

Window_DeploymentTwin.prototype.redraw = function() {
	var _this = this;
	var windowNode = this.getWindowNode();
	var deployInfo = $gameSystem.getDeployInfo();
	var slotLookup = _this.getSlotLookup();
	var deployList = _this.getDeployList()
	var deployedContent = "";
	
	var currentScrollTop = _this._availableList.scrollTop;
	
	function createTwinEntry(actorId, subActorId, slot, idx){
		var content = "";
		var displayClass = "";
		var displayClassValid = "";
		var displayClassFocus = "";
		
		var realIdx = 2 * idx;
		
		var validTwinSlot = true;
		if(_this._swapSource != -1){
			var swapSelection = _this._availableList.querySelector(".swap");	
			var sourceSlot = Math.floor(_this._swapSource / 2);
			var entry = deployList[sourceSlot] || {};
			var sourceActorId;
			if(!(_this._swapSource % 2)){
				sourceActorId = entry.main;
			} else {
				sourceActorId = entry.sub;
			}
			var targetActorId = actorId;
			if(sourceActorId != null){
				if(!_this.validateTwinSlot(sourceActorId, _this._swapSource, targetActorId, 2 * idx)){
					displayClassValid = "invalid";
				}
			}			
		}
		
		if(realIdx == _this._swapSource){
			displayClass = "swap";
		} else if(realIdx == _this._rearrageSelection){			
			displayClass = "active";						
		}
		
		if(realIdx == _this._rearrageSelection){			
			displayClassFocus = "focus";						
		}
		
		content+="<div  data-islocked='"+(_this.getLockedSlots()[slot] ? 1 : 0)+"' class='twin "+(_this._twinSwapSource == idx ? "swap" : "")+" "+(slot != null ? "deployable" : "")+" "+(_this.getLockedSlots()[slot] ? "locked" : "")+" "+(!_this.isTwinMode() ? "single" : "")+"'>"
		if(listedUnits[actorId]){
			actorId = null;
		}
		content+="<div data-idx='"+realIdx+"' data-islocked='"+(_this.getLockedSlots()[slot] ? 1 : 0)+"' data-actorid='"+(actorId || -1)+"'  class='entry "+displayClass+" "+displayClassValid+" "+displayClassFocus+" main'>"
		//var actorId = deployInfo.assigned[i];
		if(actorId != null && !listedUnits[actorId] && $statCalc.isValidForDeploy($gameActors.actor(actorId))){
			listedUnits[actorId] = true;
			var menuImagePath = $statCalc.getMenuImagePath($gameActors.actor(actorId));
			content+="<img class='actor_img' data-img='img/"+menuImagePath+"'>";
			

				
		}
		content+="</div>";
		
		displayClass = "";
		displayClassValid = "";
		displayClassFocus = "";
		var validTwinSlot = true;
		if(_this._swapSource != -1){
			var swapSelection = _this._availableList.querySelector(".swap");	
			var sourceSlot = Math.floor(_this._swapSource / 2);
			var entry = deployList[sourceSlot] || {};
			var sourceActorId;
			if(!(_this._swapSource % 2)){
				sourceActorId = entry.main;
			} else {
				sourceActorId = entry.sub;
			}
			var targetActorId = subActorId;
			if(sourceActorId != null){
				if(!_this.validateTwinSlot(sourceActorId, _this._swapSource, targetActorId, 2 * idx + 1)){
					displayClassValid = "invalid";
				}
			}
		}
		
		var realIdx = 2 * idx + 1;
		
		if(realIdx == _this._swapSource){
			displayClass = "swap";
		} else if(realIdx == _this._rearrageSelection){		
			displayClass = "active";				
		}
		if(realIdx == _this._rearrageSelection){		
			displayClassFocus = "focus";				
		}		
		
		if(listedUnits[subActorId]){
			subActorId = null;
		}
		content+="<div data-idx='"+realIdx+"' data-islocked='"+(_this.getLockedSlots()[slot] ? 1 : 0)+"' data-actorid='"+(subActorId || -1)+"' class='entry "+displayClass+" "+displayClassValid+"  "+displayClassFocus+" sub'>"
		//var actorId = deployInfo.assignedSub[i];
		if(subActorId != null && !listedUnits[subActorId] && $statCalc.isValidForDeploy($gameActors.actor(subActorId))){
			listedUnits[subActorId] = true;
			var menuImagePath = $statCalc.getMenuImagePath($gameActors.actor(subActorId));
			content+="<img class='actor_img sub' data-img='img/"+menuImagePath+"'>";
		}
		content+="</div>";	 
		
		if(slot != null && _this.getLockedSlots()[slot]){				
			content+="<img class='locked_icon' src='svg/padlock.svg'/>";
		}	
		
		content+="<div class='order_icon scaled_text'>"+(idx + 1)+"</div>";
		content+="</div>";
		return content;
	}
	
	deployedContent+="<div class='list_row'>";
	
	
	
	deployedContent+="</div>";
	_this._deployedList.innerHTML = deployedContent;
	
	var listedUnits = {};
	var availableContent = "";
	var availableUnits = _this.getAvailableUnits();
	var twinInfo = $gameSystem.getTwinInfo();
	var isTwinInfo = $gameSystem.getIsTwinInfo();
	var preferredSlotInfo = $gameSystem.getPreferredSlotInfo();
	var skippedIds = [];
	var rowCtr = 0;

	availableContent+="<div class='list_row'>";
	
	function getUnassignedActorId(slot){
		var result;
		var ctr = 0;
		while(!result && ctr < availableUnits.length){
			var actor = availableUnits[ctr++];
			var actorId = actor.actorId();
			if(!listedUnits[actorId] && !$statCalc.isShip(actor)){
				result = actorId;
			}
		}
		return result;
	}
	
	
	for(var i = 0; i < _this._maxSlots; i++) {
		if(rowCtr != 0 && !(rowCtr % _this._rearrageRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>";
		}
		
		var deploySlot = null;
		if(i < _this.getDeployCount(0)){
			deploySlot = i;
		}
		if(deployList[i]){
			availableContent+=createTwinEntry(deployList[i].main, deployList[i].sub, deploySlot, rowCtr);			
		} else {
			availableContent+=createTwinEntry(null, null, deploySlot, rowCtr);
		}
		rowCtr++;
	}	
	
	availableContent+="</div>";
	_this._availableList.innerHTML = availableContent;
	
	
	_this._availableListLabel.innerHTML = _this.getDeployCount(0) + " " + APPSTRINGS.DEPLOYMENT.label_will_deploy;
	
	var actorId;
	var activeElem = _this._availableList.querySelector(".focus");
	if(activeElem){
		actorId = activeElem.getAttribute("data-actorid");
	}
	
	var pilotData;
	if(actorId)	{
		pilotData = $gameActors.actor(actorId);
	}
	var pilotInfoContent = "";
	pilotInfoContent+="<div id='deploy_pilot_icon'></div>";
	
	pilotInfoContent+="<div class='pilot_basic_info'>";
	pilotInfoContent+="<div class='pilot_name scaled_text'>";
	if(pilotData){
		pilotInfoContent+=pilotData.name();
	} else {
		pilotInfoContent+="---";
	}
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="<div class='pilot_lv_sp scaled_text'>";
	
	pilotInfoContent+="<div class='pilot_lv '>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="Lv";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	if(pilotData){
		pilotInfoContent+=$statCalc.getCurrentLevel(pilotData);
	} else {
		pilotInfoContent+="---";
	}
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="<div class='pilot_sp'>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="SP";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	if(pilotData){
		pilotInfoContent+=$statCalc.getMaxSP(pilotData);
	} else {
		pilotInfoContent+="---";
	}
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="</div>";
	
	
	pilotInfoContent+="<div class='sub_pilot_list'>";
	const subPilots = $statCalc.getSubPilots(pilotData);
	for(let i = 0; i < Math.min(subPilots.length, 5); i++){
		if(subPilots[i] != -1 && subPilots[i] != null && subPilots[i] != ""){	
			pilotInfoContent+="<div data-pilotid="+subPilots[i]+" data-type=twin class='left twin selection_icon'></div>";//icon 	
		}
	}
	
	pilotInfoContent+="</div>";
	
	_this._pilotInfoDisplay.innerHTML = pilotInfoContent;
	
	var selectionIcons =  this._pilotInfoDisplay.querySelectorAll(".selection_icon")
	selectionIcons.forEach(function(selectionIcon){
		_this.updateScaledDiv(selectionIcon);		
		const pilotId = selectionIcon.getAttribute("data-pilotid");					
		_this.loadActorFace(pilotId, selectionIcon);						
	});
	
	if(pilotData && $statCalc.isValidForDeploy(pilotData)){
		var actorIcon = this._container.querySelector("#deploy_pilot_icon");
		this.loadActorFace(pilotData.actorId(), actorIcon);
	}
	
	
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		_this.updateScaledDiv(entry);
	});
	
	var twins = windowNode.querySelectorAll(".twin");
	twins.forEach(function(twin){
		_this.updateScaledDiv(twin, false, true);
	});
	
	_this.updateScaledDiv(windowNode.querySelector("#deploy_pilot_icon"));
	
	if(pilotData && pilotData.SRWStats.mech.id != -1){
		this._detailBarMechDetail.redraw();		
	}
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			var idx = this.getAttribute("data-idx"); 
			if(idx != null){
				idx*=1;
				if(idx == _this._rearrageSelection){
					_this._touchOK = true;				
				} else {
					_this._rearrageSelection = idx;
					_this.requestRedraw();
				}
			}		
		});
	});	
	
	if(this._toolTip){
		this._toolTip.addEventListener("click", function(){
			_this._touchMenu = true;
		});
	}
	this.loadImages();
	Graphics._updateCanvas();
	
	if(activeElem){
		var listRect = _this._availableList.getBoundingClientRect();
	
		var currentActiveRow = activeElem.parentNode.parentNode;
		var rowRect = currentActiveRow.getBoundingClientRect();
		if(rowRect.bottom > listRect.bottom){
			_this._availableList.scrollTop+=rowRect.bottom - listRect.bottom;
		} else if(rowRect.top < listRect.top){
			_this._availableList.scrollTop-=listRect.top - rowRect.top;
		} else {
			_this._availableList.scrollTop = currentScrollTop;
		}
	}	
}