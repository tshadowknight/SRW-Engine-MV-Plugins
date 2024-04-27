import Window_CSS from "./Window_CSS.js";
import ItemList from "./ItemList.js";
import "./style/Window_SellItem.css";

export default function Window_SellItem() {
	this.initialize.apply(this, arguments);	
}

Window_SellItem.prototype = Object.create(Window_CSS.prototype);
Window_SellItem.prototype.constructor = Window_SellItem;

Window_SellItem.prototype.initialize = function() {	
	this._layoutId = "sell_item";	

	
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
	
	this._sellInfo = {};
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_CSS.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._currentTransferSelection = 0;
}

Window_SellItem.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit.mech;	
}

Window_SellItem.prototype.getMaxSelection = function(){
	return $statCalc.getRealItemSlots(this.createReferenceData(this.getCurrentSelection()));
}

Window_SellItem.prototype.incrementSelection = function(){
	if(this._currentUIState == "item_selection"){
		this._itemList.incrementSelection();
	}
}

Window_SellItem.prototype.decrementSelection = function(){
	if(this._currentUIState == "item_selection"){
		this._itemList.decrementSelection();
	} 
}

Window_SellItem.prototype.incrementUpgradeLevel = function(){
	if(this._currentUIState == "item_selection"){
		SoundManager.playCursor();
		this._itemList.incrementPage();
	} else if(this._currentUIState == "sell_selection"){
		var inventoryInfo = $inventoryManager.getCurrentInventory();
		var itemIdx = this._itemList.getCurrentSelection().idx;
		if(!this._sellInfo[itemIdx]){
			this._sellInfo[itemIdx] = 0;
		}
		if(this._sellInfo[itemIdx] < inventoryInfo[itemIdx].count - inventoryInfo[itemIdx].holders.length){
			SoundManager.playCursor();
			this._sellInfo[itemIdx]++;
		}
	}
}

Window_SellItem.prototype.decrementUpgradeLevel = function(){	
	if(this._currentUIState == "item_selection"){
		this._itemList.decrementPage();
		SoundManager.playCursor();
	} else if(this._currentUIState == "sell_selection"){
		var inventoryInfo = $inventoryManager.getCurrentInventory();
		var itemIdx = this._itemList.getCurrentSelection().idx;
		if(!this._sellInfo[itemIdx]){
			this._sellInfo[itemIdx] = 0;
		}
		if(this._sellInfo[itemIdx] > 0){
			SoundManager.playCursor();
			this._sellInfo[itemIdx]--;
		}
	}
}

Window_SellItem.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.SELLITEMS.title;	
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
	this._slotSelection.classList.add("active");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._slotSelection);	
	
	this._itemListContainer = document.createElement("div");	
	this._itemListContainer.classList.add("item_list_container");	
	this._itemListContainer.classList.add("active");	
	windowNode.appendChild(this._itemListContainer);
	this._itemList = new ItemList(this._itemListContainer, this, true, true);
	this._itemList.createComponents();
	this._itemList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._itemList.registerTouchObserver("left", function(){_this._currentUIState = "item_selection"; _this._touchLeft = true;});
	this._itemList.registerTouchObserver("right", function(){_this._currentUIState = "item_selection"; _this._touchRight = true;});
	this._itemList.registerTouchObserver("left_select", function(){_this._currentUIState = "sell_selection"; _this._touchLeft = true;});
	this._itemList.registerTouchObserver("right_select", function(){_this._currentUIState = "sell_selection"; _this._touchRight = true;});

	this._itemList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	/*
	this._transferSelection = document.createElement("div");	
	this._transferSelection.classList.add("transfer_selection");	
	//this._slotSelection.classList.add("scaled_text");	
	windowNode.appendChild(this._transferSelection);
	
	this._mechNameDisplay = document.createElement("div");	
	this._mechNameDisplay.classList.add("upgrade_mech_name");	
	windowNode.appendChild(this._mechNameDisplay);
	*/
}	


Window_SellItem.prototype.update = function() {
	var _this = this;
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
			$gameTemp.currentMenuUnit = this.getPreviousAvailableUnitGlobal(this.getCurrentSelection().id);		
			this.refresh();
			return;		
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
		
			this.requestRedraw();		
			this._currentUIState = "slot_selection";				
			$gameTemp.currentMenuUnit = this.getNextAvailableUnitGlobal(this.getCurrentSelection().id);
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			this.requestRedraw();
			SoundManager.playOk();
			if(this._currentUIState == "item_selection"){
				var inventoryInfo = $inventoryManager.getCurrentInventory();
				var itemIdx = this._itemList.getCurrentSelection().idx;
				this._currentUIState = "sell_selection";
				/*if(itemIdx == -1){
					var mech = this.getCurrentSelection();
					$inventoryManager.removeItemHolder(mech.id, this._currentSelection);
					mech.items = $statCalc.getActorMechItems(mech.id);
					this._currentUIState = "slot_selection";
					this.refreshAllUnits();
				} else if(inventoryInfo[itemIdx].count > 0){
					if(inventoryInfo[itemIdx].count - inventoryInfo[itemIdx].holders.length > 0){
						var mech = this.getCurrentSelection();
						$inventoryManager.addItemHolder(itemIdx, mech.id, this._currentSelection);
						mech.items = $statCalc.getActorMechItems(mech.id);
						this._currentUIState = "slot_selection";	
						this.refreshAllUnits();
					} else {
						this._currentTransferSelection = 0;
						this._currentUIState = "item_transfer";	
					}
				}	*/			
					
			} else if(this._currentUIState == "sell_selection"){	
				this._currentUIState = "item_selection";								
			} 
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('menu') || this._touchMenu){
			this.requestRedraw();
			var worth = this.currentWorth();
			$gameParty.gainGold(worth);
			
			var itemSold = false;
			Object.keys(_this._sellInfo).forEach(function(id){
				var amount = _this._sellInfo[id];
				itemSold = true;				
				for(var i = 0; i < amount; i++){
					$inventoryManager.removeItem(id);
				}					
			});
			if(itemSold){
				var se = {};
				se.name = 'Coin';
				se.pan = 0;
				se.pitch = 100;
				se.volume = 100;
				AudioManager.playSe(se);
			}
			this._sellInfo = {};
			this._currentUIState = "item_selection";	
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			this.refreshAllUnits();
			SoundManager.playCancel();		
			//
			if(this._currentUIState == "item_selection"){			
				this._currentSelection = 0;
				$gameTemp.popMenu = true;	
				$gameTemp.buttonHintManager.hide();	
			} else if(this._currentUIState == "sell_selection"){	
				this._sellInfo[this._itemList.getCurrentSelection().idx] = 0;
				this._currentUIState = "item_selection";	
				this.requestRedraw();	
			} 	
			this.refresh();
			return;	
		}		
		this.resetTouchState();
		this.refresh();
	}		
};

Window_SellItem.prototype.getWeaponLevels = function() {
	return [];
}

Window_SellItem.prototype.currentWorth = function() {
	var _this = this;
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	var result = 0;
	Object.keys(_this._sellInfo).forEach(function(id){
		var amount = _this._sellInfo[id];
		if(amount > inventoryInfo[id].count){
			amount = inventoryInfo[id].count;
		}
		var displayInfo = $itemEffectManager.getAbilityDisplayInfo(id);
		result+=displayInfo.worth * amount;	
	});
	return result;
}

Window_SellItem.prototype.redraw = function() {
	var _this = this;
	var inventoryInfo = $inventoryManager.getCurrentInventory();

	if(this._currentUIState == "item_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["select_item", "page_nav"], ["confirm_item_select"], ["confirm_sale"]]);
	} else if(this._currentUIState == "sell_selection"){	
		$gameTemp.buttonHintManager.setHelpButtons([["select_sell_amount"], ["confirm_sale"]]);					
	} 
	$gameTemp.buttonHintManager.show();	
	
	this._itemList.setSellInfo(this._sellInfo);
	this._itemList.redraw();
	
	var fundDisplayContent = "";
	fundDisplayContent+="<div class='fund_entries'>";
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.SELLITEMS.label_current_funds+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+$gameParty.gold()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.SELLITEMS.label_funds_gained+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+this.currentWorth()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.SELLITEMS.label_funds_result+"</div>";
	var remaining = $gameParty.gold() + this.currentWorth();
	fundDisplayContent+="<div class='fund_entry_value scaled_text "+(remaining < 0 ? "underflow" : "")+"'>"+remaining+"</div>";
	fundDisplayContent+="</div>";
	
	
	
	fundDisplayContent+="<div id='btn_apply' class='disabled scaled_text'>"+APPSTRINGS.SELLITEMS.label_sell+"</div>";
	fundDisplayContent+="</div>";
	
	
	this._slotSelection.innerHTML = fundDisplayContent;
	
	
	this._toolTip.innerHTML = "";
	if(this._currentUIState == "item_selection"){
		this._itemListContainer.classList.add("active");
		this._itemListContainer.style.display = "";
		if(this._itemList.getCurrentSelection().idx != -1 && inventoryInfo[this._itemList.getCurrentSelection().idx].discovered){
			this._toolTip.innerHTML = this._itemList.getCurrentSelection().info.desc;
		} 		
	} else if(this._currentUIState == "sell_selection"){
		this._toolTip.innerHTML = APPSTRINGS.SELLITEMS.label_sell_hint;
	}
	
	var windowNode = this.getWindowNode();
	windowNode.classList.remove("sell_selection");
	if(this._currentUIState == "sell_selection"){
		windowNode.classList.add("sell_selection");
	}
	
	windowNode.querySelector("#btn_apply").addEventListener("click", function(){
		_this._touchMenu = true;
	});
	
	
	this.loadImages();
	Graphics._updateCanvas();
}