import Window_CSS from "./Window_CSS.js";
import ItemList from "./WeaponList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_EquipWeapon.css";

export default function Window_EquipWeapon() {
	this.initialize.apply(this, arguments);	
}

Window_EquipWeapon.prototype = Object.create(Window_CSS.prototype);
Window_EquipWeapon.prototype.constructor = Window_EquipWeapon;

Window_EquipWeapon.prototype.initialize = function() {	
	this._layoutId = "equip_weapon";	

	
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

Window_EquipWeapon.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit.mech;	
}

Window_EquipWeapon.prototype.getMaxSelection = function(){
	return $statCalc.getActorMechEquipableSlots(this.createReferenceData(this.getCurrentSelection()));
}

Window_EquipWeapon.prototype.incrementSelection = function(){
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

Window_EquipWeapon.prototype.decrementSelection = function(){
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

Window_EquipWeapon.prototype.incrementUpgradeLevel = function(){
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

Window_EquipWeapon.prototype.decrementUpgradeLevel = function(){	
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

Window_EquipWeapon.prototype.getCurrentWeightUsage = function() {
	let targetItems = {};
	var inventoryInfo = $equipablesManager.getCurrentInventory();
	var itemIdx = this._itemList.getCurrentSelection().idx;
	var mech = this.getCurrentSelection();				
	
	let itemInfo = $equipablesManager.getActorItems(mech.id)
	targetItems = JSON.parse(JSON.stringify(itemInfo));
	if(this._currentUIState == "item_selection"){
		if(itemIdx != -1){ 					
			targetItems[this._currentSelection] = inventoryInfo[itemIdx];
		} else {
			delete targetItems[this._currentSelection];
		}
	}
	let weight = 0;
	let usedWeights = {};
	for(let slot in targetItems){
		let itemInfo = targetItems[slot];
		if(!usedWeights[itemInfo.weaponId]){
			usedWeights[itemInfo.weaponId] = {};
		}
		if(!usedWeights[itemInfo.weaponId][itemInfo.instanceId]){
			usedWeights[itemInfo.weaponId][itemInfo.instanceId] = true;
			weight+=($dataWeapons[itemInfo.weaponId].meta.weaponWeight || 0) * 1;			
		}
		
	}
	return weight;
}

Window_EquipWeapon.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHEQUIPS.weapon_title;	
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
	
	function selectionProvider(){
		
	}
	
	selectionProvider.getCurrentSelection = function(){
		const mechData = _this.getCurrentSelection();
		let equipableInfo;

		if(_this._currentUIState == "slot_selection"){
			const slotIdx = _this._currentSelection;
			const items = $equipablesManager.getActorItems(mechData.id);
			equipableInfo = items[slotIdx];		
		} else if(_this._currentUIState == "item_selection"){
			let selected = _this._itemList.getCurrentSelection();
			if(selected.idx == -1){
				return null;
			}
			equipableInfo = selected.info;			
		}
		
		if(equipableInfo){
			const weaponDefinition = $dataWeapons[equipableInfo.weaponId];
			const weaponProperties = weaponDefinition.meta;		
			let wep = $statCalc.parseWeaponDef(null, false, weaponDefinition, weaponProperties);
			
			
			wep.isEquipable = true;			
			wep.upgrades = equipableInfo.upgrades;
			return wep;
		}
		return null;
		
	}
	
	this._attackSummary = new DetailBarAttackSummary(this._toolTip, selectionProvider, true);
	this._attackSummary.createComponents();		

	
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
	this._itemList.setEntryFilter((weaponId) => {
		const mechId = this.getCurrentSelection().id;
		return 	!!$statCalc.getWeaponValidHolders(weaponId)[mechId];
	});
	
	
	this._transferSelection = document.createElement("div");	
	this._transferSelection.classList.add("transfer_selection");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._transferSelection);
	
	this._mechNameDisplay = document.createElement("div");	
	this._mechNameDisplay.classList.add("upgrade_mech_name");	
	
	
	this._weightLimitDisplay = document.createElement("div");	
	this._weightLimitDisplay.classList.add("weight_limit_display");	
	windowNode.appendChild(this._weightLimitDisplay);
	
	windowNode.appendChild(this._mechNameDisplay);
}	


Window_EquipWeapon.prototype.update = function() {
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
			this.resetTouchState();
			return;	
		} else if (Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight) {
			this.requestRedraw();
			this.incrementUpgradeLevel();
			this.refresh();
			this.resetTouchState();
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
		
			if(this._currentUIState == "slot_selection"){
				this._currentUIState = "item_selection";		
				SoundManager.playOk();	
			} else if(this._currentUIState == "item_selection"){
				var mech = this.getCurrentSelection();	
				var itemIdx = this._itemList.getCurrentSelection().idx;
				if(itemIdx != -1){				
					var inventoryInfo = $equipablesManager.getCurrentInventory();
					var currentItem = inventoryInfo[itemIdx];	
					if($equipablesManager.isDuplicate(currentItem.weaponId, mech.id)){
						SoundManager.playBuzzer();
					} else if(this.getCurrentWeightUsage() <= $statCalc.getActorMechCarryingCapacity($gameTemp.currentMenuUnit.actor)){
						SoundManager.playOk();			
						
									
							
						let itemInfo = $equipablesManager.getActorItems(mech.id)[this._currentSelection];
						if(itemInfo){
							$equipablesManager.removeItemHolder(itemInfo.weaponId, itemInfo.instanceId);
						}
						
						//mech.items = $statCalc.getActorMechItems(mech.id);
						
									
							
						var mech = this.getCurrentSelection();
						$equipablesManager.setItemHolder(currentItem.weaponId, currentItem.instanceId, mech.id, this._currentSelection);
						//mech.items = $statCalc.getActorMechItems(mech.id);				
						
						this._currentUIState = "slot_selection";
						this.refreshAllUnits();	
					} else {
						SoundManager.playBuzzer();
					}		
				} else {
					let itemInfo = $equipablesManager.getActorItems(mech.id)[this._currentSelection];
					if(itemInfo){
						$equipablesManager.removeItemHolder(itemInfo.weaponId, itemInfo.instanceId);
					}
					SoundManager.playOk();			
					this._currentUIState = "slot_selection";
					this.refreshAllUnits();	
				}	
			}
			this.resetTouchState();
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			this.refreshAllUnits();
			SoundManager.playCancel();		
			if(this._currentUIState == "slot_selection"){
				this._currentSelection = 0;
				$gameTemp.popMenu = true;	
				$gameTemp.buttonHintManager.hide();	
			} else if(this._currentUIState == "item_selection"){			
				this._currentUIState = "slot_selection";			
				this.requestRedraw();	
			}  else if(this._currentUIState == "item_transfer"){			
				this._currentUIState = "item_selection";		
				this.requestRedraw();
			}
			this.resetTouchState();
			this.refresh();
			return;				
		}		
		
		this.refresh();
	}		
};

Window_EquipWeapon.prototype.getWeaponLevels = function() {
	return [];
}

Window_EquipWeapon.prototype.currentCost = function() {
	return 0;
}

Window_EquipWeapon.prototype.redraw = function() {
	var _this = this;
	
	if(this._currentUIState == "slot_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_slot"], ["confirm_slot"]]);
	} else if(this._currentUIState == "item_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_weapon", "page_nav"], ["confirm_weapon"]]);
	} 
	
	$gameTemp.buttonHintManager.show();	
	
	var mechData = this.getCurrentSelection();
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	
	this._attackSummary.redraw();

	var items = $equipablesManager.getActorItems(mechData.id);
	var slotSelectionContent = "";
	for(var i = 0; i < this.getMaxSelection(); i++){
		var itemInfo = items[i];
		var displayData;
		if(itemInfo){
			 displayData = {
				 name: $dataWeapons[itemInfo.weaponId].name,
				 upgrades: itemInfo.upgrades
			 }
		} else {
			 displayData = {
				name: "------",
				desc: "",
				upgrades: 0
			 };
		}
		slotSelectionContent+="<div data-idx='"+i+"' class='item_slot scaled_text fitted_text "+(this._currentSelection == i ? "selected" : "")+"'>";
		slotSelectionContent+=displayData.name;
		if(displayData.upgrades){
			slotSelectionContent+="+"+displayData.upgrades;
		}
		slotSelectionContent+="</div>";
	}
	this._slotSelection.innerHTML = slotSelectionContent;
	if(this._itemList.getCurrentSelection().idx != -1){	
		var transferCandidates = inventoryInfo[this._itemList.getCurrentSelection().idx].holders;
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
	if(this._currentUIState == "slot_selection"){
		this._slotSelection.classList.add("active");
		this._itemListContainer.style.display = "";
		var itemId = items[this._currentSelection];				
	} else if(this._currentUIState == "item_selection"){
		this._itemListContainer.classList.add("active");
		this._itemListContainer.style.display = "";				
	} else if(this._currentUIState == "item_transfer"){
		this._transferSelection.classList.add("active");
		this._transferSelection.style.display = "";	
	}
	

	this._transferSelection.style.display = "none";
	
		
	
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
	
	var weightDispContent = "";
	
	weightDispContent+="<div class='label scaled_text'>";
	weightDispContent+=APPSTRINGS.MECHEQUIPS.label_weight;
	weightDispContent+="</div>";
	
	const usedWeight = this.getCurrentWeightUsage();
	const availableWeight = $statCalc.getActorMechCarryingCapacity($gameTemp.currentMenuUnit.actor);
	weightDispContent+="<div class='used_weight scaled_text "+(usedWeight > availableWeight ? "error" : "")+"'>";
	weightDispContent+=usedWeight;
	weightDispContent+="</div>";
	weightDispContent+="<div class='divider scaled_text'>";
	weightDispContent+="/";
	weightDispContent+="</div>";
	weightDispContent+="<div class='available_weight scaled_text'>";
	weightDispContent+=availableWeight;
	weightDispContent+="</div>";
	
	this._weightLimitDisplay.innerHTML = weightDispContent;
	
	this.loadImages();
	Graphics._updateCanvas();
}