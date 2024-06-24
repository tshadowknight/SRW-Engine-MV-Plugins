import Window_CSS from "./Window_CSS.js";
import "./style/Window_SpiritSelection.css";

export default function Window_SpiritSelection() {
	this.initialize.apply(this, arguments);	
}

Window_SpiritSelection.prototype = Object.create(Window_CSS.prototype);
Window_SpiritSelection.prototype.constructor = Window_SpiritSelection;

Window_SpiritSelection.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "spirit_selection";	
	this._currentSelection = [0,0];
	this._maxSelection = 6;
	this._selectionRowSize = 3;
	this._currentActor = [0, 0];
	this._currentSlot = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_SpiritSelection.prototype.getMaxActor = function(){
	return this.getAvailableActors().length;
}

Window_SpiritSelection.prototype.resetSelection = function(){
	this._currentSelection = [0,0];
	this._currentPage = 0;
	this._currentActor = [0, 0];
	this._currentBatchInfo = {};
	this._currentPlusSpirits = {};
	this._currentBatchedSpirits = {};
	this._currentSlot = 0;
}

Window_SpiritSelection.prototype.incrementSelection = function(){	
	if(this.getCurrentSelection() == this._maxSelection) {
		return;
	}
	if((this.getCurrentSelection() + 1) % this._selectionRowSize == 0) {
		return;
	}
	this.incrementCurrentSelection();
	SoundManager.playCursor();
	if(this.getCurrentSelection() >= this._maxSelection){
		this.setCurrentSelection(0);
	}	
}

Window_SpiritSelection.prototype.decrementSelection = function(){	
	if(this.getCurrentSelection() == 0) {
		return;
	}
	if((this.getCurrentSelection()) % this._selectionRowSize == 0) {
		return;
	}
	this.decrementCurrentSelection();
	SoundManager.playCursor();
	if(this.getCurrentSelection() < 0){
		this.setCurrentSelection(this._maxSelection - 1);
	}	 
}

Window_SpiritSelection.prototype.incrementPage = function(){	
	if(this._isTwinDisplay){
		SoundManager.playCursor();
		if(this._currentSlot == 1){
			this._currentSelection[0] = this._currentSelection[1];
			this._currentSlot = 0;
		} else {
			this._currentSelection[1] = this._currentSelection[0];
			this._currentSlot = 1;
		}
	} else {
		if(this.getCurrentSelection()+this._selectionRowSize < this._maxSelection){
			this.setCurrentSelection(this.getCurrentSelection()+this._selectionRowSize);
			SoundManager.playCursor();
		} else if(this.getCurrentActor() + 1 < this.getMaxActor()){
			this.setCurrentSelection(this.getCurrentSelection()-this._selectionRowSize);		
			this.incrementCurrentActor();
			SoundManager.playCursor();
		}
	}
}

Window_SpiritSelection.prototype.decrementPage = function(){		
	if(this._isTwinDisplay){
		SoundManager.playCursor();
		if(this._currentSlot == 0){
			this._currentSelection[1] = this._currentSelection[0];
			this._currentSlot = 1;
		} else {
			this._currentSelection[0] = this._currentSelection[1];
			this._currentSlot = 0;
		}
	} else {
		if(this.getCurrentSelection()-this._selectionRowSize >= 0){
			this.setCurrentSelection(this.getCurrentSelection()-this._selectionRowSize);	
			SoundManager.playCursor();
		} else if(this.getCurrentActor() > 0){
			this.setCurrentSelection(this.getCurrentSelection()+this._selectionRowSize);
			this.decrementCurrentActor();
			SoundManager.playCursor();
		}
	}		 
}

Window_SpiritSelection.prototype.getCurrentSelection = function(slot){
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentSelection[slot];	
}

Window_SpiritSelection.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	windowNode.classList.add("spirit_selection_container");
	windowNode.classList.add("normal");
	var contentContainer = document.createElement("div");
	contentContainer.id = this.createId("content");
	contentContainer.classList.add("content_container");
	windowNode.appendChild(contentContainer);
	this._contentContainer = contentContainer;
	//this._contentContainer.innerHTML = "";	
}	

Window_SpiritSelection.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
		
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			if(!this._twinSpiritSelection){
				if((this.getCurrentSelection() + 1) % this._selectionRowSize == 0) {
					if(this._isTwinDisplay){
						this._twinSpiritSelection = true;					
						SoundManager.playCursor();
					}
				} else {
					this.incrementSelection();
				}
			}
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();		
			if(!this._twinSpiritSelection){	
				this.decrementSelection();
			} else {
				SoundManager.playCursor();
				this._twinSpiritSelection = false;
			}
			this.refresh();
			return;	
		}			

		if(Input.isTriggered('pageup') || Input.isRepeated('pageup') || this._touchL1){
			this.requestRedraw();			
			this.decrementCurrentActor();
			if(this.getCurrentActor() < 0){
				this.setCurrentActor(0);
			}
			SoundManager.playCursor();
			this.refresh();
			return;	

		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown') || this._touchR1) {
			this.requestRedraw();	
			this.incrementCurrentActor();
			if(this.getCurrentActor() >= this.getMaxActor()){
				this.setCurrentActor(this.getMaxActor()-1);
			}
			SoundManager.playCursor();
			this.refresh();
			return;	
		}	

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			this.decrementPage();
			this.refresh();
			return;	
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			this.incrementPage();
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('ok') || this._touchOK){			
			var actor = this.getAvailableActors()[this.getCurrentActor()];
			var currentLevel = $statCalc.getCurrentLevel(actor);
			var spiritList = $statCalc.getSpiritList(actor);
			var selectedIdx = this.getCurrentSelection();
		
			var enabledState = Math.min(_this.getSpiritEnabledState(null, 0, true), _this.getSpiritEnabledState(null, 1, true));
			
			if(spiritList[selectedIdx] && spiritList[selectedIdx].level <= currentLevel && (this.getSpiritEnabledState(selectedIdx) > 0 || (_this._twinSpiritSelection && enabledState))){
				var spirits = [];				
				var type = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx).targetType;
				
				if(type == "self"){
					if(_this._twinSpiritSelection){
						
						if(_this._currentSlot == 0){
							actor = $gameTemp.currentMenuUnit.actor;
						} else {
							actor = $gameTemp.currentMenuUnit.actor.subTwin;
						}
						var twinSpiritInfo = $statCalc.getTwinSpirit(actor);
						//var displayInfo = $spiritManager.getSpiritDisplayInfo(twinSpiritInfo.idx);
						this.getCurrentBatchedSpirits(0)[twinSpiritInfo.idx] = {actor: $gameTemp.currentMenuUnit.actor, target: $gameTemp.currentMenuUnit.actor, spiritInfo: twinSpiritInfo};
						this.getCurrentBatchedSpirits(1)[twinSpiritInfo.idx] = {actor: $gameTemp.currentMenuUnit.actor.subTwin, target: $gameTemp.currentMenuUnit.actor.subTwin, spiritInfo: twinSpiritInfo};
					} else {
						this.getCurrentBatchedSpirits(_this._currentSlot)[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: spiritList[selectedIdx]};
						
						var affectsTwinInfo = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx).affectsTwinInfo;
						if(affectsTwinInfo){
							var info = {
								cost: 0,
								idx: spiritList[selectedIdx].idx
							}
							if(_this._currentSlot == 0){
								this.getCurrentBatchedSpirits(1)[spiritList[selectedIdx].idx] = {target: $gameTemp.currentMenuUnit.actor.subTwin, spiritInfo: info};
							} else {
								this.getCurrentBatchedSpirits(0)[spiritList[selectedIdx].idx] = {target: $gameTemp.currentMenuUnit.actor, spiritInfo: info};
							}						
						}
					}				
					
					Object.keys(this._currentBatchedSpirits).forEach(function(slot){
						var slotBatch = _this._currentBatchedSpirits[slot];
						Object.keys(slotBatch).forEach(function(spiritIdx){
							var info = slotBatch[spiritIdx];
							var spiritInfo = JSON.parse(JSON.stringify(info.spiritInfo));
							spiritInfo.caster = info.actor;
							if(!spiritInfo.target){
								if(slot == 0){
									spiritInfo.target = $gameTemp.currentMenuUnit.actor;
								} else {
									spiritInfo.target = $gameTemp.currentMenuUnit.actor.subTwin;
								}
							}
							if(spiritInfo.target){
								spirits.push(spiritInfo);		
							}											
						});
					});
					let debug = [];
					for(let entry of spirits){
						debug.push(entry);
					}
					if(_this._callbacks["selectedMultiple"]){
						_this._callbacks["selectedMultiple"](spirits);
					}
				} else {
					var spiritInfo = JSON.parse(JSON.stringify(spiritList[selectedIdx]));
					spiritInfo.caster = actor;
					spiritInfo.target = $gameTemp.currentMenuUnit.actor;
					if(this._callbacks["selected"]){
						this._callbacks["selected"](spiritInfo);
					}
				}	
				
				$gameTemp.popMenu = true;	
				$gameTemp.buttonHintManager.hide();	
				this._handlingInput = true;
				
			}
			this.refresh();
			return;	
		} else if(Input.isTriggered('cancel') || TouchInput.isCancelled()){				
			$gameTemp.popMenu = true;	
			$gameTemp.buttonHintManager.hide();	
			
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}
			this.refresh();
			return;	
		}	
		
		if(Input.isTriggered('shift') || this._touchShift){				
			//$gameTemp.popMenu = true;	
			var actor = this.getAvailableActors()[this.getCurrentActor()];
			var currentLevel = $statCalc.getCurrentLevel(actor);
			var spiritList = $statCalc.getSpiritList(actor);
			var selectedIdx = this.getCurrentSelection();
			if(_this._twinSpiritSelection){
				selectedIdx = "twin";
				if(_this._currentSlot == 0){
					actor = $gameTemp.currentMenuUnit.actor;
				} else {
					actor = $gameTemp.currentMenuUnit.actor.subTwin;
				}
				var twinSpiritInfo = $statCalc.getTwinSpirit(actor);
				if(twinSpiritInfo){
					var type = $spiritManager.getSpiritDef(twinSpiritInfo.idx).targetType;
					if(type == "self"){
						if(this.getCurrentBatchInfo()[selectedIdx]){
							delete this.getCurrentBatchInfo()[selectedIdx];
							delete this.getCurrentBatchedSpirits(0)[twinSpiritInfo.idx];
							delete this.getCurrentBatchedSpirits(1)[twinSpiritInfo.idx];
						} else if(this.getSpiritEnabledState(null, _this._currentSlot, true) > 0){
							this.getCurrentBatchInfo()[selectedIdx] = true;
							this.getCurrentBatchedSpirits(0)[twinSpiritInfo.idx] = {actor: actor, spiritInfo: twinSpiritInfo};
							this.getCurrentBatchedSpirits(1)[twinSpiritInfo.idx] = {actor: actor, spiritInfo: twinSpiritInfo};
						}				
						if(!Object.keys(this.getCurrentBatchInfo()).length){
							delete this.getCurrentBatchInfo();
						}				
						this.requestRedraw();
					}
				}				
			} else {
				var type = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx).targetType;
			
				if(spiritList[selectedIdx] && spiritList[selectedIdx].level <= currentLevel && type == "self"){	
					var spiritInfo = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx);
					var affectsTwinInfo = spiritInfo.affectsTwinInfo;
					if(this.getCurrentBatchInfo()[selectedIdx]){
						delete this.getCurrentBatchInfo()[selectedIdx];
						delete this.getCurrentBatchedSpirits()[spiritList[selectedIdx].idx];
						if(affectsTwinInfo){
							delete this._currentPlusSpirits[spiritList[selectedIdx].idx];
							delete this._currentPlusSpirits[affectsTwinInfo.maskedSpirit];
							if(_this._currentSlot == 0){
								delete this.getCurrentBatchedSpirits(1)[spiritList[selectedIdx].idx];
							} else {
								delete this.getCurrentBatchedSpirits(0)[spiritList[selectedIdx].idx];
							}
							
						}
						
					} else if(this.getSpiritEnabledState(selectedIdx) > 0){
						this.getCurrentBatchInfo()[selectedIdx] = true;
						this.getCurrentBatchedSpirits()[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: spiritList[selectedIdx]};
						if(affectsTwinInfo){
							this._currentPlusSpirits[spiritList[selectedIdx].idx] = actor.actorId();
							this._currentPlusSpirits[affectsTwinInfo.maskedSpirit] = -1;
							var info = {
								cost: 0,
								idx: spiritList[selectedIdx].idx
							}
							if(_this._currentSlot == 0){
								this.getCurrentBatchedSpirits(1)[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: info};
							} else {
								this.getCurrentBatchedSpirits(0)[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: info};
							}
						}
					}					
					
					if(!Object.keys(this.getCurrentBatchInfo()).length){
						delete this.getCurrentBatchInfo();
					}				
					this.requestRedraw();
				}
			}
			this.refresh();
			return;	
		}
		
			
		
		this.refresh();
	}		
};

Window_SpiritSelection.prototype.getSpiritEnabledState = function(listIdx, slot, isTwin){
	var result = 1;
	var caster = this.getAvailableActors(slot)[this.getCurrentActor(slot)];
	if(!caster){
		return true;// don't check for non populated twin slot
	}
	var target = $gameTemp.currentMenuUnit.actor;
	if(slot == null){
		slot = this._currentSlot;
	}
	if(slot == 1){
		target = $gameTemp.currentMenuUnit.actor.subTwin;
	}
	if($statCalc.isSpiritsSealed(target)){
		return -2;
	}
	var list = $statCalc.getSpiritList(caster);
	if(isTwin){
		if(slot == 1){
			caster = $gameTemp.currentMenuUnit.actor.subTwin;
		} else {
			caster = $gameTemp.currentMenuUnit.actor;
		}
		listIdx = 0;
		var twinSpirit = $statCalc.getTwinSpirit(caster);
		if(twinSpirit){
			list = [twinSpirit];
		} else {
			list = [];
		}		
	}
	
	var pendingBatchCost = 0;
	
	var batchInfo;
	if(isTwin){//when evaluating a twin spirit make sure to get the batch info of the main pilot
		if(this._currentBatchInfo[slot]){
			batchInfo =	this._currentBatchInfo[slot][0];
		}		
	} else {
		batchInfo =	this.getCurrentBatchInfo(slot);
	}
	
	if(batchInfo){
		var regularSpirits = $statCalc.getSpiritList(caster);		
		Object.keys(batchInfo).forEach(function(listIdx){
			if(listIdx < regularSpirits.length){
				var selectedSpirit = regularSpirits[listIdx];
				pendingBatchCost+=selectedSpirit.cost;
			}			
		});
	}
	
	if(!caster.isSubPilot){		
		if(this._currentBatchInfo && this._currentBatchInfo[0] && this._currentBatchInfo[0][0] && this._currentBatchInfo[0][0]["twin"]){
			pendingBatchCost+=$statCalc.getTwinSpirit($gameTemp.currentMenuUnit.actor).cost;
		} 
		if(this._currentBatchInfo && this._currentBatchInfo[1] && this._currentBatchInfo[1][0] && this._currentBatchInfo[1][0]["twin"]){
			pendingBatchCost+=$statCalc.getTwinSpirit($gameTemp.currentMenuUnit.actor.subTwin).cost;
		} 		
	}
	
	if(listIdx < list.length){	
		var selectedSpirit = list[listIdx];
		var spiritDisplayInfo = $spiritManager.getSpiritDisplayInfo(selectedSpirit.idx);
		
		//this is enabled handler check also filters out checks for invalid spirit ids! Without it further checks may crash!
		if(!spiritDisplayInfo.enabledHandler(target)){
			result = -1;
		} else if(selectedSpirit.cost > $statCalc.getCalculatedPilotStats(caster).currentSP - pendingBatchCost && (this.getCurrentBatchedSpirits(slot)[selectedSpirit.idx] == null || this.getCurrentBatchedSpirits(slot)[selectedSpirit.idx].actor.actorId() != caster.actorId())){
			result = -2;
		} else if(this.getCurrentBatchedSpirits(slot)[selectedSpirit.idx] != null && this.getCurrentBatchedSpirits(slot)[selectedSpirit.idx].actor.actorId() != caster.actorId()){
			result = -1;
		} else if(Object.keys(this.getCurrentBatchedSpirits(slot)).length && $spiritManager.getSpiritDef(selectedSpirit.idx).targetType != "self"){
			result = -1;
		} 
		if(isTwin && caster.isSubPilot){
			result = -2;
		}
		if(this._currentPlusSpirits[selectedSpirit.idx] == -1){
			result = -3;
		}
		if(this._currentPlusSpirits[selectedSpirit.idx] != null && this._currentPlusSpirits[selectedSpirit.idx] != caster.actorId()){
			result = -3;
		}  
	} else {
		result = -1;
	}
	return result;
}

Window_SpiritSelection.prototype.getAvailableActors = function(slot) {
	var actor = $gameTemp.currentMenuUnit.actor;
	if(slot == null){
		slot = this._currentSlot;
	}
	if(slot == 1){
		if(actor.subTwin){
			actor = actor.subTwin;
		} else {
			return [];
		}
	}
	var subPilotIds = $statCalc.getSubPilots(actor);
	var subPilots = [];
	for(var i = 0; i < subPilotIds.length; i++){
		if(subPilotIds[i]){
			subPilots.push($gameActors.actor(subPilotIds[i]));
		}		
	}
	return [actor].concat(subPilots);
}	

Window_SpiritSelection.prototype.getCurrentActor = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentActor[slot];
}

Window_SpiritSelection.prototype.setCurrentActor = function(value, slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentActor[slot] = value;
}

Window_SpiritSelection.prototype.incrementCurrentActor = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentActor[slot]++;
}

Window_SpiritSelection.prototype.decrementCurrentActor = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentActor[slot]--;
}

Window_SpiritSelection.prototype.incrementCurrentSelection = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentSelection[slot]++;
}

Window_SpiritSelection.prototype.decrementCurrentSelection = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentSelection[slot]--;
}

Window_SpiritSelection.prototype.setCurrentSelection = function(value, slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	return this._currentSelection[slot] = value;
}

Window_SpiritSelection.prototype.getCurrentBatchInfo = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	if(!this._currentBatchInfo[slot]){
		this._currentBatchInfo[slot] = {};
	}
	if(!this._currentBatchInfo[slot][this.getCurrentActor(slot)]){
		this._currentBatchInfo[slot][this.getCurrentActor(slot)] = {};
	}
	return this._currentBatchInfo[slot][this.getCurrentActor(slot)];
}

Window_SpiritSelection.prototype.getCurrentBatchedSpirits = function(slot) {
	if(slot == null){
		slot = this._currentSlot;
	}
	if(!this._currentBatchedSpirits[slot]){
		this._currentBatchedSpirits[slot] = {};
	}
	return this._currentBatchedSpirits[slot];
}

Window_SpiritSelection.prototype.redraw = function() {	
	var _this = this;
	
	$gameTemp.buttonHintManager.setHelpButtons([["select_spirit"], ["to_sub_pilot"], ["multi_select"], ["confirm_spirits"]]);
	$gameTemp.buttonHintManager.show();
	
	var content = "";	
	var isTwinDisplay = $gameTemp.currentMenuUnit.actor.subTwin != null;
	this._isTwinDisplay = isTwinDisplay;
	var windowNode = this.getWindowNode();
	if(isTwinDisplay){
		_this._selectionRowSize = 6;
		windowNode.classList.add("twin");
	} else {
		_this._selectionRowSize = 3;
		windowNode.classList.remove("twin");
	}
	var slot = 0;
	var availableActors = this.getAvailableActors(slot);
	var actor = availableActors[this.getCurrentActor(slot)];
	
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	
	var twin;
	var calculatedTwinStats;
	if(isTwinDisplay){
		twin = this.getAvailableActors(1)[this.getCurrentActor(1)];
		calculatedTwinStats = twin.SRWStats.pilot.stats.calculated;
	}
	
	
	var spiritList = $statCalc.getSpiritList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	var twinSpiritList;
	if(isTwinDisplay){
		twinSpiritList = $statCalc.getSpiritList(twin);
	}
	
	content+="<div class='spirit_selection_content'>";
	content+="<div class='spirit_selection_row spirit_selection'>";
	//content+="<div id='spirit_selection_icons_container'>";//icons container
	content+="<div data-slot=0 data-offset=-1 class='previous_selection_icon left selection_icon'></div>";//icon 	
	content+="<div data-slot=0 data-offset=0 class='spirit_selection_icon left selection_icon'></div>";//icon 	
	content+="<div data-slot=0 data-offset=1 class='next_selection_icon left selection_icon'></div>";//icon 	
	//content+="</div>";
	content+="<div data-slot=0 class='scaled_text spirit_selection_SP_display left'>SP "+(calculatedStats.currentSP + "/" + calculatedStats.SP)+"</div>";//icon 
	content+="<div class='spirit_selection_block scaled_text fitted_text'>";	
	var selectedIdx = this.getCurrentSelection();
	
	if(_this._twinSpiritSelection){		
		var actor;
		if(_this._currentSlot == 0){
			actor = $gameTemp.currentMenuUnit.actor;
		} else {
			actor = $gameTemp.currentMenuUnit.actor.subTwin;
		}
		var twinSpiritInfo = $statCalc.getTwinSpirit(actor);
		var displayInfo = $spiritManager.getSpiritDisplayInfo(twinSpiritInfo.idx);
	
		content+=displayInfo.desc;	
	} else {
		var referenceList;
		if(this._currentSlot == 1){
			referenceList = twinSpiritList;
		} else {
			referenceList = spiritList;
		}
		
		if(referenceList[selectedIdx]){
			if(referenceList[selectedIdx].level <= currentLevel){
				var displayInfo = $spiritManager.getSpiritDisplayInfo(referenceList[selectedIdx].idx);
				content+=displayInfo.desc;	
			}
		}	
	}
	
	
	content+="</div>";
	
	if(isTwinDisplay){
		content+="<div data-slot=1 data-offset=-1 class='previous_selection_icon right selection_icon'></div>";//icon 	
		content+="<div data-slot=1 data-offset=0 class='spirit_selection_icon right selection_icon'></div>";//icon 	
		content+="<div data-slot=1 data-offset=1 class='next_selection_icon right selection_icon'></div>";//icon 
		content+="<div data-slot=1 class='scaled_text spirit_selection_SP_display right'>SP "+(calculatedTwinStats.currentSP + "/" + calculatedTwinStats.SP)+"</div>";//icon 
	}
	
	content+="</div>";
	
	content+="<div class='spirit_selection_row details'>";
	
	
	content+="<div class='spirit_list_container'>";
	content+="<div class='spirit_list'>";
	
	
	function getSpiritListContent(spiritList, currentLevel, slot){
		var content = "";	
		content+="<div class='section_column'>";
		for(var i = 0; i < _this._maxSelection; i++){
			var displayName = "---";
			var isDisplayed = false;
			var targetType;
			if(i != 0 && i % _this._selectionRowSize == 0){
				content+="</div>"
				content+="<div class='section_column'>";
			}
			if(typeof spiritList[i] != "undefined" && spiritList[i].idx !== "" && spiritList[i].level <= currentLevel){
				targetType = $spiritManager.getSpiritDef(spiritList[i].idx).targetType;
				var displayInfo = $spiritManager.getSpiritDisplayInfo(spiritList[i].idx);
				displayName = "<div class='scaled_width spirit_label scaled_text fitted_text'>"+displayInfo.name+"</div>("+spiritList[i].cost+")" ;
				isDisplayed = true;
			}
			
			var displayClass = "";
			var enabledState = _this.getSpiritEnabledState(i, slot);
			if(enabledState == -4){
				displayClass = "active";
			} else if(enabledState == -1 || !isDisplayed || enabledState == -3){
				displayClass = "disabled";
			} else if(enabledState == -2){
				displayClass = "insufficient";
			}		
			
			if(enabledState != -3){
				var isBatched = false;
				if(_this.getCurrentBatchInfo(slot)){ 
					if(_this.getCurrentBatchInfo(slot)[i]){
						isBatched = true;
						displayClass = "batched";
					}			
				}
			}			
			
			content+="<div class='row scaled_text "+displayClass+"'>";
			
			if(slot == 1 || !isTwinDisplay){
				content+="<div data-slot='"+slot+"' data-idx='"+i+"' class='multi_select_check "+(isBatched ? "enabled" : "")+" "+(targetType == "self" && isDisplayed ? "available" : "")+"'>";
				content+="</div>";
			}
			
			
			content+="<div data-slot='"+slot+"' data-idx='"+i+"' class='column "+(slot == _this._currentSlot && i == _this.getCurrentSelection(slot) && !_this._twinSpiritSelection ? "selected" : "")+"'>";
			content+=displayName;
			content+="</div>";
			
			if(slot == 0 && isTwinDisplay){
				content+="<div data-slot='"+slot+"' data-idx='"+i+"'  class='multi_select_check "+(isBatched ? "enabled" : "")+" "+(targetType == "self" && isDisplayed ? "available" : "")+"'>";
				content+="</div>";
			}
			
			content+="</div>";
		}
		content+="</div>";
		return content;
	}
	content+=getSpiritListContent(spiritList, currentLevel, 0);
	if(isTwinDisplay){
		content+="<div class='divider'></div>";
		content+=getSpiritListContent($statCalc.getSpiritList(twin), $statCalc.getCurrentLevel(twin), 1);
	}
	content+="</div>";
	content+="</div>";
	
	
	
	content+="</div>";
	
	if(isTwinDisplay){
		
		function createTwinSpiritContent(actor, slot){
			var displayName = "---";
			content = "";
			var twinSpiritInfo = $statCalc.getTwinSpirit(actor);
			var displayClass = "";
			var displayInfo;
			var type;
			if(twinSpiritInfo){
				displayInfo = $spiritManager.getSpiritDisplayInfo(twinSpiritInfo.idx);
				type = $spiritManager.getSpiritDef(twinSpiritInfo.idx).targetType;
				displayName = "<div class='scaled_width spirit_label fitted_text'>"+displayInfo.name+"</div>("+twinSpiritInfo.cost+")" ;
				
				var otherSlot;
				if(slot == 1){
					otherSlot = 0;
				} else {
					otherSlot = 1;
				}
				var enabledState = Math.min(_this.getSpiritEnabledState(null, slot, true), _this.getSpiritEnabledState(null, otherSlot, true));
				if(enabledState == -1){
					displayClass = "disabled";
				} else if(enabledState == -2){
					displayClass = "insufficient";
				}						
				var isBatched = false;
				if(_this.getCurrentBatchInfo(slot)){ 
					if(_this.getCurrentBatchInfo(slot)["twin"]){
						isBatched = true;
						displayClass = "batched";
					}			
				}			
			}
			
			if(actor.isSubPilot){
				displayClass = "insufficient";
			}
			
			if(slot == 1){
				content+="<div data-istwin=1 data-slot='"+slot+"' class='multi_select_check twin "+(isBatched ? "enabled" : "")+" "+(type == "self" ? "available" : "")+"'>";
				content+="</div>";
			}
			
			
			content+="<div data-istwin=1 data-slot='"+slot+"' class='column scaled_text "+displayClass+" "+(_this._currentSlot == slot &&  _this._twinSpiritSelection ? "selected" : "")+" "+(slot == 1 ? "twin" : "main")+"'>";
			content+=displayName;
			content+="</div>";
			
			if(slot == 0){
				content+="<div data-istwin=1 data-slot='"+slot+"' class='multi_select_check "+(isBatched ? "enabled" : "")+" "+(type == "self" ? "available" : "")+"'>";
				content+="</div>";
			}
			
			content+="</div>";
			return content;
		}
		
		content+="<div class='spirit_selection_row twin'>";
		content+="<div class='spirit_list_container'>";
		content+="<div class='spirit_list'>";
		content+="<div class='section_column'>";
		
		content+=createTwinSpiritContent(this.getAvailableActors(0)[this.getCurrentActor(0)], 0);
		content+="<div class='divider scaled_text'>TWIN</div>";
		content+="<div class='section_column'>";
		content+=createTwinSpiritContent(this.getAvailableActors(1)[this.getCurrentActor(1)], 1);
		
		
		content+="</div>";
		content+="</div>";
		content+="</div>";
	}
	
	
	content+="</div>";
	
	content+="</div>";
	_this._contentContainer.innerHTML = content;
	
	this.updateScaledDiv(_this._contentContainer, false, false, true);
	//this.updateScaledDiv(_this._contentContainer.querySelector("#spirit_selection_icon"));
	//this.updateScaledDiv(_this._contentContainer.querySelector("#previous_selection_icon"));
	//this.updateScaledDiv(_this._contentContainer.querySelector("#next_selection_icon"));
	
	var selectionIcons =  this._contentContainer.querySelectorAll(".selection_icon")
	selectionIcons.forEach(function(selectionIcon){
		_this.updateScaledDiv(selectionIcon);
		var slot = selectionIcon.getAttribute("data-slot")*1;
		var offset = selectionIcon.getAttribute("data-offset")*1;
		var availableActors = _this.getAvailableActors(slot);
		if(availableActors[_this.getCurrentActor(slot)+offset]){
			_this.loadActorFace(availableActors[_this.getCurrentActor(slot)+offset].actorId(), selectionIcon);
		}		
		selectionIcon.addEventListener("click", function(){
			var slot = this.getAttribute("data-slot")*1;
			var offset = this.getAttribute("data-offset")*1;
			_this._currentSlot = slot;
			if(offset == -1){
				_this._touchL1 = true;
			} else {
				_this._touchR1 = true;
			}
		});
	});
	
	
	/*var actorIcon = this._contentContainer.querySelector("#spirit_selection_icon");
	this.loadActorFace(actor.actorId(), actorIcon);
	
	if(availableActors[this.getCurrentActor(slot)-1]){
		actorIcon = this._contentContainer.querySelector("#previous_selection_icon");
		this.loadActorFace(availableActors[this.getCurrentActor(slot)-1].actorId(), actorIcon);
	}
	
	if(availableActors[this.getCurrentActor(slot)+1]){
		actorIcon = this._contentContainer.querySelector("#next_selection_icon");
		this.loadActorFace(availableActors[this.getCurrentActor(slot)+1].actorId(), actorIcon);
	}*/
	
	var multiChecks = _this._contentContainer.querySelectorAll(".multi_select_check");
	multiChecks.forEach(function(multiCheck){
		_this.updateScaledDiv(multiCheck);
	});
	
	var entries = _this._contentContainer.querySelectorAll(".column");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var slot = this.getAttribute("data-slot") * 1;
			var idx = this.getAttribute("data-idx") * 1;
			var isTwin = !!(this.getAttribute("data-istwin") * 1);
			
			if(_this._currentSelection[slot] == idx && _this._currentSlot == slot && _this._twinSpiritSelection == isTwin){
				_this._touchOK = true;
			} else {
				_this._currentSlot = slot;
				_this._currentSelection[slot] = idx;			
				_this._twinSpiritSelection = this.getAttribute("data-istwin") * 1;				
				_this.requestRedraw();
			}
			
		});
	});
	
	var entries = _this._contentContainer.querySelectorAll(".multi_select_check");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var slot = this.getAttribute("data-slot") * 1;
			var idx = this.getAttribute("data-idx") * 1;
			_this._currentSlot = slot;
			_this._currentSelection[slot] = idx;
			_this._touchShift = true;		
			_this._twinSpiritSelection = this.getAttribute("data-istwin") * 1;
		});
	});
	
	
	Graphics._updateCanvas();
}

