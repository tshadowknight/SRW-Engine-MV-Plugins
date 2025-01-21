import Window_CSS from "./Window_CSS.js";
import ItemList from "./ItemList.js";
import "./style/Window_EquipItem.css";

export default function Window_EquipItem() {
	this.initialize.apply(this, arguments);	
}

Window_EquipItem.prototype = Object.create(Window_CSS.prototype);
Window_EquipItem.prototype.constructor = Window_EquipItem;

Window_EquipItem.prototype.initialize = function() {	
	this._layoutId = "equip_item";	

	
	this._currentUIState = "slot_selection"; //slot_selection, item_selection, item_transfer
	this._currentTab = 0;
	this._maxTab = 2;
	
	this._currentPage = 0;
	this._maxSelection = 10;
	this._currentSelection = 0;
	this._currentCost = 0;
	
	this._currentTransferSelection = 0;
	this._maxTransferSelection = 10;
	this._transferSelectionRowSize = 5;
	
	this._maxEquipSelection = 6;
	this._currentEquipSelection = 0;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_CSS.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._currentTransferSelection = 0;
}

Window_EquipItem.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit.mech;	
}

Window_EquipItem.prototype.getMaxSelection = function(){
	return $statCalc.getRealItemSlots(this.createReferenceData(this.getCurrentSelection()));
}

Window_EquipItem.prototype.incrementSelection = function(){
	if(this._currentUIState == "slot_selection"){
		this._currentSelection++;
		if(this._currentSelection >= this.getMaxSelection()){
			this._currentSelection = 0;
		}
	} else if(this._currentUIState == "item_selection"){
		this._itemList.incrementSelection();
	} else if(this._currentUIState == "item_transfer"){
		this._currentTransferSelection++;
		if(this._currentTransferSelection >= this._maxTransferSelection){
			this._currentTransferSelection = 0;
		}
	} 
}

Window_EquipItem.prototype.decrementSelection = function(){
	if(this._currentUIState == "slot_selection"){
		this._currentSelection--;
		if(this._currentSelection < 0){
			this._currentSelection = this.getMaxSelection() - 1;
		}
	} else if(this._currentUIState == "item_selection"){
		this._itemList.decrementSelection();
	} else if(this._currentUIState == "item_transfer"){
		this._currentTransferSelection--;
		if(this._currentTransferSelection < 0){
			this._currentTransferSelection = this._maxTransferSelection - 1;
		}
	}  
}

Window_EquipItem.prototype.incrementUpgradeLevel = function(){
	if(this._currentUIState == "item_selection"){
		SoundManager.playCursor();
		this._itemList.incrementPage();
	} else if(this._currentUIState == "item_transfer"){			
		if(this._currentTransferSelection+this._transferSelectionRowSize < this._maxTransferSelection){
			this._currentTransferSelection+=this._transferSelectionRowSize;
			SoundManager.playCursor();
		}
	} 
}

Window_EquipItem.prototype.decrementUpgradeLevel = function(){	
	if(this._currentUIState == "item_selection"){
		this._itemList.decrementPage();
		SoundManager.playCursor();
	} else if(this._currentUIState == "item_transfer"){				
		if(this._currentTransferSelection-this._transferSelectionRowSize >= 0){
			this._currentTransferSelection-=this._transferSelectionRowSize;
			SoundManager.playCursor();
		}
	} 
}

Window_EquipItem.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHEQUIPS.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	/*this._upgradeControls = document.createElement("div");	
	this._upgradeControls.classList.add("upgrade_controls");	
	windowNode.appendChild(this._upgradeControls);
	*/
	
	
	this._toolTip = document.createElement("div");	
	this._toolTip.classList.add("tool_tip");	
	this._toolTip.classList.add("scaled_text");	
	this._toolTip.classList.add("fitted_text");	
	windowNode.appendChild(this._toolTip);
	
	this._slotSelection = document.createElement("div");	
	this._slotSelection.classList.add("slot_selection");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._slotSelection);	
	
	this._itemListContainer = document.createElement("div");	
	this._itemListContainer.classList.add("item_list_container");	
	windowNode.appendChild(this._itemListContainer);
	this._itemList = new ItemList(this._itemListContainer, this, true);
	this._itemList.createComponents();
	this._itemList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._itemList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._itemList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._itemList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._transferSelection = document.createElement("div");	
	this._transferSelection.classList.add("transfer_selection");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._transferSelection);
	
	this._mechNameDisplay = document.createElement("div");	
	this._mechNameDisplay.classList.add("upgrade_mech_name");	
	windowNode.appendChild(this._mechNameDisplay);
}	

Window_EquipItem.prototype.getTargetMechId = function(mechId){
	var mech = $dataClasses[mechId];
	if(mech.meta.mechInheritsPartsFrom != null && mech.meta.mechInheritsPartsFrom != ""){
		mechId = mech.meta.mechInheritsPartsFrom;
	}
	return mechId;
}

Window_EquipItem.prototype.update = function() {
	const _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			this.incrementSelection();
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();			
			this.decrementSelection();
			this.refresh();
			return;	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left') || this._touchLeft){
			this.requestRedraw();
			this.decrementUpgradeLevel();
			this.refresh();
			return;	
		} else if (Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight) {
			this.requestRedraw();
			this.incrementUpgradeLevel();
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
			this._currentUIState = "slot_selection";	
			$gameTemp.currentMenuUnit = this.getPreviousAvailableUnitGlobal(this.getCurrentSelection().id, true);		
			this.refresh();
			return;		
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
		
			this.requestRedraw();		
			this._currentUIState = "slot_selection";				
			$gameTemp.currentMenuUnit = this.getNextAvailableUnitGlobal(this.getCurrentSelection().id, true);
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
		} 	
		
		
		
		if(Input.isTriggered('ok') || this._touchOK){
			this.requestRedraw();
			SoundManager.playOk();
			if(this._currentUIState == "slot_selection"){
				this._currentUIState = "item_selection";					
			} else if(this._currentUIState == "item_selection"){
				var inventoryInfo = $inventoryManager.getCurrentInventory();
				var itemIdx = this._itemList.getCurrentSelection().idx;
				if(itemIdx == -1){
					var mech = this.getCurrentSelection();
					$inventoryManager.removeItemHolder(_this.getTargetMechId(mech.id), this._currentSelection);
					mech.items = $statCalc.getActorMechItems(mech.id);
					this._currentUIState = "slot_selection";
					this.refreshAllUnits();
				} else if(this.getAvailableCount(inventoryInfo[itemIdx]) > 0){
					if(this.getAvailableCount(inventoryInfo[itemIdx]) - this.getAvailableHoldersCount(itemIdx) > 0){
						var mech = this.getCurrentSelection();
						$inventoryManager.addItemHolder(itemIdx, _this.getTargetMechId(mech.id), this._currentSelection);
						mech.items = $statCalc.getActorMechItems(mech.id);
						this._currentUIState = "slot_selection";	
						this.refreshAllUnits();
					} else {
						this._currentTransferSelection = 0;
						this._currentUIState = "item_transfer";	
					}
				}								
			} else if(this._currentUIState == "item_transfer"){			
				var itemIdx = this._itemList.getCurrentSelection().idx;
				if(itemIdx != -1){
					var inventoryInfo = $inventoryManager.getCurrentInventory();
					var mech = this.getCurrentSelection();
					var transferCandidates = this.getTransferCandidates();		
					if(transferCandidates[this._currentTransferSelection]){
						var donor = transferCandidates[this._currentTransferSelection];
						$inventoryManager.removeItemHolder(_this.getTargetMechId(donor.mechId), donor.slot);
						$inventoryManager.addItemHolder(itemIdx, _this.getTargetMechId(mech.id), this._currentSelection);
						this._currentUIState = "slot_selection";
						var availableUnits = this.getAvailableUnits();
						for(var i = 0; i < availableUnits.length; i++){
							if(availableUnits[i].SRWStats.mech.id == donor.mechId){
								availableUnits[i].SRWStats.mech.items = $statCalc.getActorMechItems(donor.mechId);
							}
						}
					}	
					mech.items = $statCalc.getActorMechItems(mech.id);
					this.refreshAllUnits();
				}
			}
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			this.refreshAllUnits();
			SoundManager.playCancel();		
			this.requestRedraw();
			if(this._currentUIState == "slot_selection"){
				this._currentSelection = 0;
				$gameTemp.popMenu = true;	
			} else if(this._currentUIState == "item_selection"){			
				this._currentUIState = "slot_selection";							
			}  else if(this._currentUIState == "item_transfer"){			
				this._currentUIState = "item_selection";							
			}
			this.refresh();
			return;				
		}		
		this.resetTouchState();
		this.refresh();
	}		
};

Window_EquipItem.prototype.getAvailableCount = function(itemInfo) {
	let result = itemInfo.count;
	
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	var holders = inventoryInfo[this._itemList.getCurrentSelection().idx].holders;
	for(let holder of holders){
		if($inventoryManager.islockedForTransfer(holder.mechId) && !$SRWSaveManager.getUnlockedUnits()[holder.mechId]){
			result--;
		}
	}
	return result;
}

Window_EquipItem.prototype.getAvailableHoldersCount = function(itemIdx) {
	let result = 0;
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	var holders = inventoryInfo[itemIdx].holders;
	for(let holder of holders){
		if(!$inventoryManager.islockedForTransfer(holder.mechId) || $SRWSaveManager.getUnlockedUnits()[holder.mechId]){
			result++;
		}
	}
	return result;
}

Window_EquipItem.prototype.getTransferCandidates = function() {
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	var transferCandidates = inventoryInfo[this._itemList.getCurrentSelection().idx].holders;
	transferCandidates = transferCandidates.filter((x) => !$inventoryManager.islockedForTransfer(x.mechId) || $SRWSaveManager.getUnlockedUnits()[x.mechId]);
	return transferCandidates;
}

Window_EquipItem.prototype.getWeaponLevels = function() {
	return [];
}

Window_EquipItem.prototype.currentCost = function() {
	return 0;
}

Window_EquipItem.prototype.redraw = function() {
	var _this = this;
	
	if(this._currentUIState == "slot_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_slot"], ["confirm_slot"]]);
	} else if(this._currentUIState == "item_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_item", "page_nav"], ["confirm_item"]]);
	} else if(this._currentUIState == "item_transfer"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_transfer_slot"], ["confirm_transfer"]]);
	}	
	
	$gameTemp.buttonHintManager.show();	
	
	var mechData = this.getCurrentSelection();
	var inventoryInfo = $inventoryManager.getCurrentInventory();

	var items = $inventoryManager.getActorItemIds(_this.getTargetMechId(mechData.id));
	var slotSelectionContent = "";
	for(var i = 0; i < this.getMaxSelection(); i++){
		var itemId = items[i];
		var displayData;
		if(typeof itemId != "undefined"){
			 displayData = $itemEffectManager.getAbilityDisplayInfo(itemId);
		} else {
			 displayData = {
				name: "------",
				desc: ""
			 };
		}
		slotSelectionContent+="<div data-idx='"+i+"' class='item_slot scaled_text fitted_text "+(this._currentSelection == i ? "selected" : "")+"'>";
		slotSelectionContent+=displayData.name;
		slotSelectionContent+="</div>";
	}
	this._slotSelection.innerHTML = slotSelectionContent;
	if(this._itemList.getCurrentSelection().idx != -1){	
		var transferCandidates = this.getTransferCandidates();	
		var transferSelectionContent = "";
		transferSelectionContent+="<div class='transfer_column'>";
		for(var i = 0; i < this._maxTransferSelection; i++){
			if(i != 0 && i % this._transferSelectionRowSize == 0){
				transferSelectionContent+="</div>";
				transferSelectionContent+="<div class='transfer_column'>";
			}
			var itemId = items[i];
			var displayData;
			if(transferCandidates[i]){			
				displayData = {
					name: "<div data-mechid='"+transferCandidates[i].mechId+"' class='mechIcon'></div>"+$dataClasses[transferCandidates[i].mechId].name
				 };
			} else {
				displayData = {
					name: "------",
				 };
			}		 
			
			transferSelectionContent+="<div data-idx='"+i+"' class='item_slot scaled_text fitted_text "+(this._currentTransferSelection == i ? "selected" : "")+"'>";
			transferSelectionContent+=displayData.name;
			transferSelectionContent+="</div>";
		}
		transferSelectionContent+="</div>";
		this._transferSelection.innerHTML = transferSelectionContent;
	}
	this._transferSelection.querySelectorAll(".mechIcon").forEach(function(icon){
		_this.loadMechMiniSprite(icon.getAttribute("data-mechid"), icon);
	});
	
	
	this._itemList.redraw();
	
	this._slotSelection.classList.remove("active");
	this._itemListContainer.classList.remove("active");
	
	this._itemListContainer.style.display = "none";
	this._transferSelection.style.display = "none";
	
	this._toolTip.innerHTML = "";
	if(this._currentUIState == "slot_selection"){
		this._slotSelection.classList.add("active");
		this._itemListContainer.style.display = "";
		var itemId = items[this._currentSelection];
		if(typeof itemId != "undefined"){
			this._toolTip.innerHTML = $itemEffectManager.getAbilityDisplayInfo(itemId).desc;
		} 		
	} else if(this._currentUIState == "item_selection"){
		this._itemListContainer.classList.add("active");
		this._itemListContainer.style.display = "";
		if(this._itemList.getCurrentSelection().idx != -1 && this.getAvailableCount(inventoryInfo[this._itemList.getCurrentSelection().idx]) > 0){
			this._toolTip.innerHTML = this._itemList.getCurrentSelection().info.desc;
		} 		
	} else if(this._currentUIState == "item_transfer"){
		this._transferSelection.classList.add("active");
		this._transferSelection.style.display = "";
		this._toolTip.innerHTML = APPSTRINGS.MECHEQUIPS.label_transfer_hint;			
	}		
	
	var mechNameContent = "";
	mechNameContent+="<div id='equip_item_upgrade_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+mechData.classData.name+"</div>";//icon 	
	this._mechNameDisplay.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#equip_item_upgrade_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().id, mechIcon);
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".item_slot");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			if(_this._currentUIState == "slot_selection"){
				var idx = this.getAttribute("data-idx");
				_this._currentSelection = idx;
				_this._touchOK = true;
			} else if(_this._currentUIState == "item_transfer"){
				var idx = this.getAttribute("data-idx");
				_this._currentTransferSelection = idx;
				_this._touchOK = true;
			}
		});
	});
	this.loadImages();
	Graphics._updateCanvas();
}