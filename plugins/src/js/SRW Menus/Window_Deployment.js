import Window_CSS from "./Window_CSS.js";

import "./style/Window_Deployment.css"

export default function Window_Deployment() {
	this.initialize.apply(this, arguments);	
}

Window_Deployment.prototype = Object.create(Window_CSS.prototype);
Window_Deployment.prototype.constructor = Window_Deployment;

Window_Deployment.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment";	
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 14;
	
	this._availableRowSize = 10
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
}

Window_Deployment.prototype.getMaxDeploySlots = function(){
	if(this._UIState == "select_deploy_slot"){
		return Math.min(this._maxAvailableSlots, this.getAvailableUnits().length);
	} else {
		return Math.min(this._rearrageRowSize * 2, $gameSystem.getDeployInfo().count);
	}	
}

Window_Deployment.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;
	
}

Window_Deployment.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
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
	windowNode.appendChild(this._deployedList);	
	
	this._deployedListLabel = document.createElement("div");
	this._deployedListLabel.classList.add("deployed_list_label");
	this._deployedListLabel.classList.add("list_label");
	this._deployedListLabel.classList.add("scaled_text");
	this._deployedListLabel.innerHTML = APPSTRINGS.DEPLOYMENT.order;
	windowNode.appendChild(this._deployedListLabel);	
	
	this._availableList = document.createElement("div");
	this._availableList.classList.add("scrolled_list");
	this._availableList.classList.add("available_list");
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

Window_Deployment.prototype.getCurrentSelection = function() {
	if(this._UIState == "rearrange_slots"){
		return this._rearrageSelection;
	} else {
		return this._deployedSelection;
	}
}

Window_Deployment.prototype.setCurrentSelection = function(value) {
	if(this._UIState == "rearrange_slots"){
		this._rearrageSelection = value;
	} else {
		this._deployedSelection = value;
	}
}

Window_Deployment.prototype.getMaxRowSize = function() {
	if(this._UIState == "rearrange_slots"){
		return this._rearrageRowSize;
	} else {
		return this._availableRowSize;
	}
}

Window_Deployment.prototype.getCurrentRowSize = function() {
	var row = Math.floor(this.getCurrentSelection() / this.getMaxRowSize()) + 1;
	if(row * this.getMaxRowSize() > this.getMaxDeploySlots()){
		return  this.getMaxRowSize() - ((row * this.getMaxRowSize()) - this.getMaxDeploySlots());
	} else {
		return this.getMaxRowSize();
	}
}

Window_Deployment.prototype.getCurrentRowIndex = function() {
	var row = Math.floor(this.getCurrentSelection() / this.getMaxRowSize()) + 1;
	return this.getMaxRowSize() - ((row * this.getMaxRowSize()) - this.getCurrentSelection());
}

Window_Deployment.prototype.incrementRow = function() {	
	var maxDeploySlots = this.getMaxDeploySlots()
	if(this.getCurrentSelection() + this.getMaxRowSize() < maxDeploySlots){
		this.setCurrentSelection(this.getCurrentSelection() + this.getMaxRowSize());
	} else if(this._UIState == "select_deploy_slot") {
		this._UIState = "rearrange_slots";
	}	
}

Window_Deployment.prototype.decrementRow = function() {
	if(this.getCurrentSelection() - this.getMaxRowSize() >= 0){
		this.setCurrentSelection(this.getCurrentSelection() - this.getMaxRowSize());
	} else if(this._UIState == "rearrange_slots") {
		this._UIState = "select_deploy_slot";
	}	 
}

Window_Deployment.prototype.incrementColumn = function() {	
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() + 1) < this.getCurrentRowSize()){
		this.setCurrentSelection(this.getCurrentSelection() + 1);
	}		
}

Window_Deployment.prototype.decrementColumn = function() {	
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() - 1) >= 0){		
		this.setCurrentSelection(this.getCurrentSelection() - 1);
	}		
}

Window_Deployment.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
		
			SoundManager.playCursor();
			this.incrementRow();			
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    
			SoundManager.playCursor();
			this.decrementRow();			
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			this.decrementColumn();
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			this.incrementColumn();
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
		
		if(Input.isTriggered('ok')){	
			if(this._UIState == "rearrange_slots"){
				this.requestRedraw();
				var deployInfo = $gameSystem.getDeployInfo();
				if(deployInfo.lockedSlots[this._rearrageSelection]){
					this._swapSource = -1;
					SoundManager.playBuzzer();
				} else {
					if(this._swapSource == -1){
						this._swapSource = this._rearrageSelection;
					} else if(this._swapSource != this._rearrageSelection){
						
						var sourceActor = deployInfo.assigned[this._swapSource];
						var targetActor = deployInfo.assigned[this._rearrageSelection];
						if(typeof sourceActor != undefined){
							deployInfo.assigned[this._rearrageSelection] = sourceActor;
						} else {
							delete deployInfo.assigned[this._rearrageSelection];
						}
						
						if(typeof targetActor != undefined){
							deployInfo.assigned[this._swapSource] = targetActor;
						} else {
							delete deployInfo.assigned[this._swapSource];
						}
						this.updateDeployInfo(deployInfo);
						this._swapSource = -1;
					}
				}				
			} else {
				var availableUnits = this.getAvailableUnits();
				var slotLookup = this.getSlotLookup();
				var deployInfo = $gameSystem.getDeployInfo();
				var actorId = availableUnits[this._deployedSelection].actorId()
				var slot = slotLookup[actorId];
				var ctr = 0;
				while(ctr < deployInfo.count && typeof slot == "undefined"){
					if(!deployInfo.assigned[ctr]){
						slot = ctr;
					}
					ctr++;
				}
				if(typeof slot == "undefined" || deployInfo.lockedSlots[slot] || $statCalc.isShip($gameActors.actor(actorId))){
					SoundManager.playBuzzer();
				} else {
					this.requestRedraw();
					if(typeof deployInfo.assigned[slot] == "undefined"){
						deployInfo.assigned[slot] = actorId;
					} else {
						delete deployInfo.assigned[slot];
					}
					this.updateDeployInfo(deployInfo);
				}	
			}
					
		}
		
		if(Input.isTriggered('shift')){
			if(this._UIState == "select_deploy_slot"){
				var availableUnits = this.getAvailableUnits();
				var deployInfo = $gameSystem.getDeployInfo();
				var actorId = availableUnits[this._deployedSelection].actorId();
				if(!$statCalc.isShip($gameActors.actor(actorId))){
					deployInfo.favorites[actorId] = !deployInfo.favorites[actorId];		
					this.requestRedraw();	
					this.updateDeployInfo(deployInfo);
				}				
			}
		}
		
		if(Input.isTriggered('cancel')){	
			this.onCancel();	
		}
		if(Input.isTriggered('menu')){	
			this.onMenu();	
		}		
		
		this.refresh();
	}		
};

Window_Deployment.prototype.onCancel = function() {
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

Window_Deployment.prototype.onMenu = function(){
	
}

Window_Deployment.prototype.updateDeployInfo = function(deployInfo) {
	$gameSystem.setDeployInfo(deployInfo);
	this._slotLookup = null;
}

Window_Deployment.prototype.getAvailableUnits = function() {
	var candidates = $gameSystem.getAvailableUnits();	
	var tmp = [];
	candidates.forEach(function(candidate){
		if($statCalc.isValidForDeploy(candidate)){
			tmp.push(candidate);
		}
	});
	return tmp;
}

Window_Deployment.prototype.getSlotLookup = function() {
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

Window_Deployment.prototype.redraw = function() {
	var _this = this;
	var windowNode = this.getWindowNode();
	var deployInfo = $gameSystem.getDeployInfo();
	var slotLookup = _this.getSlotLookup();
	var deployedContent = "";
	deployedContent+="<div class='list_row'>";
	
	
	for(var i = 0; i < deployInfo.count; i++) { //
		if(i != 0 && !(i % _this._rearrageRowSize)){
			deployedContent+="</div>";
			deployedContent+="<div class='list_row'>"
		}
		var displayClass = "";
		if(this._UIState == "rearrange_slots"){
			if(i == _this._swapSource){
				displayClass = "swap";
			} else if(i == _this._rearrageSelection){
				displayClass = "active";
			}
		}		
		deployedContent+="<div class='entry "+displayClass+"'>"
		var actorId = deployInfo.assigned[i];
		if(actorId != null && $statCalc.isValidForDeploy($gameActors.actor(actorId))){
			var menuImagePath = $statCalc.getMenuImagePath($gameActors.actor(actorId));
			deployedContent+="<img class='actor_img' src='img/"+menuImagePath+"'>";


			if(deployInfo.lockedSlots[i]){				
				deployedContent+="<img class='locked_icon' src='svg/padlock.svg'/>";
			}		
		}
			 
		deployedContent+="<div class='order_icon scaled_text'>"+(i + 1)+"</div>";
			
		deployedContent+="</div>";
	}
	deployedContent+="</div>";
	_this._deployedList.innerHTML = deployedContent;
	
	var availableContent = "";
	var availableUnits = _this.getAvailableUnits();
	availableContent+="<div class='list_row'>";
	for(var i = 0; i < availableUnits.length; i++) { //
		if(i != 0 && !(i % _this._availableRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>"
		}
		if(availableUnits[i] && $statCalc.isValidForDeploy(availableUnits[i])) {
			availableContent+="<div class='entry "+(this._UIState == "select_deploy_slot" && _this._deployedSelection == i ? "active" : "")+"'>"
		
			var menuImagePath = $statCalc.getMenuImagePath(availableUnits[i]);
			availableContent+="<img class='actor_img' src='img/"+menuImagePath+"'>";
			
			var actorId = availableUnits[i].actorId()
			var slot = slotLookup[actorId];
			if(deployInfo.lockedSlots[slot]){				
				availableContent+="<img class='locked_icon' src='svg/padlock.svg'/>";
			} else if(deployInfo.assigned[slot] != null){				
				availableContent+="<img class='deployed_icon' src='svg/check_mark.svg'/>";
			}
			if(deployInfo.assigned[slot] != null){				
				availableContent+="<div class='order_icon scaled_text'>"+(slot * 1 + 1)+"</div>";
			}
			
			if(deployInfo.favorites[actorId]){
				availableContent+="<img class='fav_icon' src='svg/round_star.svg'/>";
			}
			
			if($statCalc.isShip($gameActors.actor(actorId))){
				availableContent+="<img class='ship_icon' src='svg/anchor.svg'/>";
			}
		
		
			availableContent+="</div>";
		}
	}
	availableContent+="</div>";
	_this._availableList.innerHTML = availableContent;
	
	_this._availableListLabel.innerHTML = Object.keys(deployInfo.assigned).length + "/" + deployInfo.count + " " + APPSTRINGS.DEPLOYMENT.label_selected;
	
	var actorId;
	if(this._UIState == "rearrange_slots"){
		actorId = deployInfo.assigned[this._rearrageSelection];
	} else if(availableUnits[this._deployedSelection]){
		actorId = availableUnits[this._deployedSelection].actorId();
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
		pilotInfoContent+=$statCalc.getCurrentSP(pilotData);
	} else {
		pilotInfoContent+="---";
	}
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="</div>";
	
	_this._pilotInfoDisplay.innerHTML = pilotInfoContent;
	
	if(pilotData && $statCalc.isValidForDeploy(pilotData)){
		var actorIcon = this._container.querySelector("#deploy_pilot_icon");
		this.loadActorFace(pilotData.actorId(), actorIcon);
	}
	
	
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		_this.updateScaledDiv(entry);
	});
	
	_this.updateScaledDiv(windowNode.querySelector("#deploy_pilot_icon"));
	
	Graphics._updateCanvas();
}