import Window_CSS from "./Window_CSS.js";
import ItemList from "./WeaponList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_UpgradeEquipWeapon.css";

export default function Window_UpgradeEquipWeapon() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradeEquipWeapon.prototype = Object.create(Window_CSS.prototype);
Window_UpgradeEquipWeapon.prototype.constructor = Window_UpgradeEquipWeapon;

Window_UpgradeEquipWeapon.prototype.initialize = function() {	
	const _this = this;
	this._layoutId = "upgrade_equip_weapon";	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	
	this._currentUIState = "item_selection"; //slot_selection, item_selection, item_transfer
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
	
	this._currentUpgradeDeltas = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_UpgradeEquipWeapon.prototype.resetDeltas = function() {
	this._currentUpgradeDeltas = 0;
	this._itemList.clearPendingUpgrades();
}

Window_UpgradeEquipWeapon.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._currentTransferSelection = 0;
}

Window_UpgradeEquipWeapon.prototype.getCurrentSelection = function(){
	return 0;	
}

Window_UpgradeEquipWeapon.prototype.getMaxSelection = function(){
	return $statCalc.getActorMechEquipableSlots(this.createReferenceData(this.getCurrentSelection()));
}

Window_UpgradeEquipWeapon.prototype.incrementSelection = function(){	
	if(this._currentUIState == "item_selection"){
		this._itemList.incrementSelection();	
	}
}

Window_UpgradeEquipWeapon.prototype.decrementSelection = function(){	
	if(this._currentUIState == "item_selection"){
		this._itemList.decrementSelection();
	}
}

Window_UpgradeEquipWeapon.prototype.getCurrentEntryUpgradeLevel = function(){
	const inventoryInfo = $equipablesManager.getCurrentInventory();
	const itemIdx = this._itemList.getCurrentSelection().idx;
	return inventoryInfo[itemIdx].upgrades;	
}

Window_UpgradeEquipWeapon.prototype.incrementUpgradeLevel = function(){
	if(this._currentUIState == "item_selection"){
		SoundManager.playCursor();
		this._itemList.incrementPage();
	} else if(this._currentUIState == "item_upgrade"){			
		this._currentUpgradeDeltas++;
		let currentUpgradeLevel = this.getCurrentEntryUpgradeLevel();
		if(currentUpgradeLevel + this._currentUpgradeDeltas > 10){
			this._currentUpgradeDeltas = 10 - currentUpgradeLevel;
		}
			
		SoundManager.playCursor();
		this._itemList.setPendingUpgradeForCurrent(this._currentUpgradeDeltas);
	} 
}

Window_UpgradeEquipWeapon.prototype.decrementUpgradeLevel = function(){	
	if(this._currentUIState == "item_selection"){
		this._itemList.decrementPage();
		SoundManager.playCursor();
	} else if(this._currentUIState == "item_upgrade"){				
		this._currentUpgradeDeltas--;
		if(this._currentUpgradeDeltas < 0){
			this._currentUpgradeDeltas = 0;
		}
		SoundManager.playCursor();
		this._itemList.setPendingUpgradeForCurrent(this._currentUpgradeDeltas);
	} 
}

Window_UpgradeEquipWeapon.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHEQUIPS.weapon_upgrade_title;	
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

	
		let selected = _this._itemList.getCurrentSelection();
		if(selected.idx == -1){
			return null;
		}
		equipableInfo = selected.info;			
		
		
		if(equipableInfo){
			const weaponDefinition = $dataWeapons[equipableInfo.weaponId];
			const weaponProperties = weaponDefinition.meta;		
			let wep = $statCalc.parseWeaponDef(null, false, weaponDefinition, weaponProperties);
			
			
			wep.isEquipable = true;			
			wep.upgrades = equipableInfo.upgrades + _this._currentUpgradeDeltas;
			return wep;
		}
		return null;
		
	}
	
	this._attackSummary = new DetailBarAttackSummary(this._toolTip, selectionProvider, true);
	this._attackSummary.createComponents();		

	
	this._fundsDisplay = document.createElement("div");	
	this._fundsDisplay.classList.add("fund_display");	
	windowNode.appendChild(this._fundsDisplay);
	
	this._itemListContainer = document.createElement("div");	
	this._itemListContainer.classList.add("item_list_container");	
	windowNode.appendChild(this._itemListContainer);
	this._itemList = new ItemList(this._itemListContainer, this, true, "upgrades");
	this._itemList.createComponents();
	this._itemList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._itemList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._itemList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._itemList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._transferSelection = document.createElement("div");	
	this._transferSelection.classList.add("transfer_selection");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._transferSelection);
	
	this._fundsDisplay = document.createElement("div");	
	this._fundsDisplay.classList.add("fund_display");	
	windowNode.appendChild(this._fundsDisplay);
}	


Window_UpgradeEquipWeapon.prototype.update = function() {
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
			
				
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
		
		
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			this.requestRedraw();
			
			
			if(this._currentUIState == "item_selection"){
				SoundManager.playOk();
				this.resetDeltas();
				this._itemList.setPendingUpgradeForCurrent(this._currentUpgradeDeltas);
				this._currentUIState = "item_upgrade";
			} else if(this._currentUIState == "item_upgrade"){				
				var cost = this.currentCost();					
				if(cost <= $gameParty.gold()){
					SoundManager.playOk();
					$gameParty.loseGold(cost);
					const inventoryInfo = $equipablesManager.getCurrentInventory();
					const wep = this._itemList.getCurrentSelection().info;
					var cost = 0;
					
					let startLevel = this.getCurrentEntryUpgradeLevel();
					$equipablesManager.setItemUpgrades(wep.weaponId, wep.instanceId, startLevel + this._currentUpgradeDeltas);
					this.resetDeltas();
				} else {
					this.resetDeltas();
					SoundManager.playCancel();
				}
				this._currentUIState = "item_selection";
			}
			
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			this.refreshAllUnits();
			SoundManager.playCancel();		
			this.requestRedraw();
			if(this._currentUIState == "item_selection"){
				this._currentSelection = 0;
				$gameTemp.popMenu = true;	
			} else if(this._currentUIState == "item_upgrade"){
				this.resetDeltas();
				this._currentUIState = "item_selection"				
			}
			
			this.refresh();
			return;				
		}		
		this.resetTouchState();
		this.refresh();
	}		
};

Window_UpgradeEquipWeapon.prototype.getWeaponLevels = function() {
	return [];
}

Window_UpgradeEquipWeapon.prototype.currentCost = function() {
	var _this = this;
	const inventoryInfo = $equipablesManager.getCurrentInventory();
	const weaponId = this._itemList.getCurrentSelection().info.weaponId;
	var cost = 0;
	
	let startLevel = this.getCurrentEntryUpgradeLevel();
	var levels = [];
	for(var i = startLevel; i < startLevel + _this._currentUpgradeDeltas; i++){
		levels.push(i );
	}
	cost+=$statCalc.getWeaponUpgradeCost(weaponId, levels);

	return cost;	
}

Window_UpgradeEquipWeapon.prototype.redraw = function() {
	var _this = this;
	var mechData = this.getCurrentSelection();
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	const windowNode = this.getWindowNode();	
	this._attackSummary.redraw();

	
	
	this._itemList.redraw();
	
	this._itemListContainer.classList.remove("active");
	this._itemListContainer.style.display = "none";

	this._itemListContainer.classList.add("active");
	this._itemListContainer.style.display = "";				
	
	

	this._transferSelection.style.display = "none";
	
	var fundDisplayContent = "";
	fundDisplayContent+="<div class='fund_entries'>";
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_current_funds+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+$gameParty.gold()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_cost+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+this.currentCost()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_remaining_funds+"</div>";
	var remaining = $gameParty.gold() - this.currentCost();
	fundDisplayContent+="<div class='fund_entry_value scaled_text "+(remaining < 0 ? "underflow" : "")+"'>"+remaining+"</div>";
	fundDisplayContent+="</div>";
	
	
	
	fundDisplayContent+="<div id='btn_apply' class='disabled scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_apply+"</div>";
	fundDisplayContent+="</div>";
	
	
	this._fundsDisplay.innerHTML = fundDisplayContent;
	

	
	var mechIcon = this._container.querySelector("#equip_item_upgrade_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().id, mechIcon);
	
	this._fundsDisplay.querySelector("#btn_apply").addEventListener("click", function(){
		_this._touchOK = true;
	});
	
	var cost = this.currentCost();					
	if(cost > 0 && cost <= $gameParty.gold()){
		this._fundsDisplay.querySelector("#btn_apply").classList.remove("disabled");		
	} else {
		this._fundsDisplay.querySelector("#btn_apply").classList.add("disabled");
	}
	
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