import Window_CSS from "./Window_CSS.js";
import "./style/ItemList.css";

export default function ItemList(container, selectionProvider, excludeUnique, isSellList){
	this._container = container;	
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 7;
	this._selectionProvider = selectionProvider;
	this._excludeUnique = excludeUnique;
	this._isSellList = isSellList;
	this._sellInfo = {};
	
	this._itemDisplayInfo = [];
	this.initDisplayInfo();
}


ItemList.prototype = Object.create(Window_CSS.prototype);
ItemList.prototype.constructor = ItemList;

ItemList.prototype.setSellInfo = function(sellInfo){
	this._sellInfo = sellInfo;
}

ItemList.prototype.initDisplayInfo = function(){
	var tmp = [];
	if(!this._isSellList){
		tmp.push({idx: -1, info: {name: "<remove item>", desc: ""}});
	}
		
	for(var i = 0; i < $itemEffectManager.getDefinitionCount(); i++){	
		var displayInfo = $itemEffectManager.getAbilityDisplayInfo(i);		
		tmp.push({idx: i, info: displayInfo});		
	}
	this._itemDisplayInfo = tmp;
}


ItemList.prototype.getCurrentPageAmount = function(){
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= this._itemDisplayInfo.length){
		return this._itemDisplayInfo.length - start;
	} else {
		return this._maxPageSize;
	}
}

ItemList.prototype.getCurrentSelection = function(){	
	var info = this._itemDisplayInfo[this._currentSelection + this._currentPage * this._maxPageSize];
	return info;
}

ItemList.prototype.getCurrentSelectionCost = function(){
	var referenceActor = this._selectionProvider.getCurrentSelection();
	var learnedAbilities = $statCalc.getLearnedPilotAbilities(referenceActor);
	var currentSelection = this.getCurrentSelection();
	var cost = 0;
	if(learnedAbilities[currentSelection.idx]){
		if(currentSelection.info.hasLevel && currentSelection.info.maxLevel > learnedAbilities[currentSelection.idx].level){
			cost = currentSelection.info.cost[learnedAbilities[currentSelection.idx].level];	
		}
	} else {
		cost = currentSelection.info.cost[0];	
	}	
	return cost;
}

ItemList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

ItemList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

ItemList.prototype.incrementPage = function(){
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._itemDisplayInfo.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
}

ItemList.prototype.decrementPage = function(){
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._itemDisplayInfo.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._itemDisplayInfo.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
}

ItemList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "item_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "item_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);		
}

ItemList.prototype.redraw = function() {
	var _this = this;	
	var inventoryInfo = $inventoryManager.getCurrentInventory();
	

	var abilities = this._itemDisplayInfo;
	var listContent = "";
	
	listContent+="<div class='item_list_row header'>";
	listContent+="<div class='item_list_block header scaled_text'></div>";
	if(_this._isSellList){
		listContent+="<div class='item_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_price+"</div>";
		listContent+="<div class='item_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_sell+"</div>";
		listContent+="<div class='item_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_available+"</div>";
	} else {
		listContent+="<div class='item_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_balance+"</div>";
		listContent+="<div class='item_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_total+"</div>";
	}
	
	
	listContent+="</div>";

	var start = this._currentPage * this._maxPageSize;
	var end = Math.min(abilities.length, (start + this._maxPageSize));
	
	for(var i = start; i < end; i++){
		var current = abilities[i];
		
		
			
		
		listContent+="<div data-idx='"+(i - (this._currentPage * this._maxPageSize))+"' class='item_list_row "+(current.idx == this.getCurrentSelection().idx ? "selected" : "")+"'>";
		
		if(current.idx == -1){		
			listContent+="<div class='item_list_block scaled_text'>Unequip</div>";
			listContent+="<div class='item_list_block scaled_text'></div>";
			listContent+="<div class='item_list_block scaled_text'></div>";	
		} else {
			listContent+="<div class='item_list_block scaled_text fitted_text'>";
			if(inventoryInfo[current.idx].discovered){
				listContent+=current.info.name;
			} else {
				listContent+="???";
			}
			
			listContent+="</div>";
			
			let transferLockOffset = 0;
			var holders = inventoryInfo[current.idx].holders;
			for(let holder of holders){
				if($inventoryManager.islockedForTransfer(holder.mechId) && !$SRWSaveManager.getUnlockedUnits()[holder.mechId]){
					transferLockOffset++;
				}
			}
			
			if(_this._isSellList){
				listContent+="<div class='item_list_block scaled_text'>";
				listContent+=current.info.worth;
				listContent+="</div>";
				listContent+="<div class='item_list_block scaled_text sell_amount'>";
				listContent+="<img class='sell_select decrement' src=svg/chevron_right.svg>";
				listContent+=_this._sellInfo[current.idx] || 0;
				listContent+="<img class='sell_select increment' src=svg/chevron_right.svg>";				
				listContent+="</div>";
				listContent+="<div class='item_list_block scaled_text'>";
				listContent+=(inventoryInfo[current.idx].count - transferLockOffset) - (inventoryInfo[current.idx].holders.length - transferLockOffset);
				listContent+="</div>";
			} else {			
				listContent+="<div class='item_list_block scaled_text'>";
				listContent+=(inventoryInfo[current.idx].count - transferLockOffset) - (inventoryInfo[current.idx].holders.length - transferLockOffset);
				listContent+="</div>";
				listContent+="<div class='item_list_block scaled_text'>";
				listContent+=inventoryInfo[current.idx].count - transferLockOffset;
				listContent+="</div>";
			}	
			
			
			
			
		}
		listContent+="</div>";
		
		/*listContent+="<div class='item_list_row'>";
		listContent+="<div class='item_list_block scaled_text'>";
		if(abilities[i].type == "M"){
			listContent+="<img class='item_list_type scaled_width' src='svg/punch_blast.svg'>";
		} else {
			listContent+="<img class='item_list_type scaled_width' src='svg/crosshair.svg'>";
		}
		
		listContent+="</div>";
		listContent+="<div class='item_list_block scaled_text'>"+abilities[i].name+"</div>";
		listContent+="<div class='item_list_block scaled_text'>"+this.createAttributeBlock(abilities[i])+"</div>";
		var currentPower = $statCalc.getWeaponPower(refData, abilities[i])*1;
		listContent+="<div class='item_list_block scaled_text'>"+currentPower+"</div>";
		listContent+="<div class='item_list_block scaled_text'><div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div></div>";
		var upgradeAmount = this.getUpgradeAmount();
		listContent+="<div class='item_list_block scaled_text'>"+(currentPower + upgradeAmount)+"</div>";
		listContent+="</div>";*/
	}
	
	this._listDiv.innerHTML = listContent;
	
	var maxPage = Math.ceil(abilities.length / this._maxPageSize);
	if(maxPage < 1){
		maxPage = 1;
	}
	var content = "";
	content+="<img id='prev_page' src=svg/chevron_right.svg>";
	content+=(this._currentPage + 1)+"/"+maxPage;
	content+="<img id='next_page' src=svg/chevron_right.svg>";
	this._pageDiv.innerHTML = content;
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".item_list_row");
	entries.forEach(function(entry){
		entry.addEventListener("click",function(){		
			var idx = this.getAttribute("data-idx"); 
			if(idx != null){
				idx*=1;
				if(idx == _this._currentSelection){
					_this.notifyTouchObserver("ok");				
				} else {
					_this._currentSelection = idx;
					_this.redraw();
					_this.notifyObserver("redraw");
					Graphics._updateCanvas();
				}
			}						
		});		
	});	
	
	windowNode.querySelector("#prev_page").addEventListener("click", function(){
		_this.notifyTouchObserver("left");
	});
	
	windowNode.querySelector("#next_page").addEventListener("click", function(){
		_this.notifyTouchObserver("right");
	});
	
	var entries = windowNode.querySelectorAll(".decrement");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			var idx = this.getAttribute("data-idx");				
			_this._currentSelection = idx;
			_this.notifyTouchObserver("left_select");									
		});
	});	
	
	var entries = windowNode.querySelectorAll(".increment");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			var idx = this.getAttribute("data-idx");				
			_this._currentSelection = idx;
			_this.notifyTouchObserver("right_select");									
		});
	});
}