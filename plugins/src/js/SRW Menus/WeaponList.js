import Window_CSS from "./Window_CSS.js";
import "./style/ItemList.css";
import WeaponEntry from "./WeaponEntry.js";

export default function WeaponList(container, selectionProvider, excludeUnique, listType){
	this._container = container;	
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 7;
	this._selectionProvider = selectionProvider;
	this._excludeUnique = excludeUnique;
	this._listType = listType || "equip";
	this._sellInfo = {};
	
	this._itemDisplayInfo = [];
	this.pendingUpgrades = {};
	this.initDisplayInfo();
}


WeaponList.prototype = Object.create(Window_CSS.prototype);
WeaponList.prototype.constructor = WeaponList;

WeaponList.prototype.setEntryFilter = function(func){
	this._entryFilter = func;
}

WeaponList.prototype.getCurrentFilteredSet = function(){
	return this._itemDisplayInfo.filter((x) => {
		if(x.idx == -1){
			return true;
		}
		return !this._entryFilter || this._entryFilter(x.info.weaponId);
	});
}

WeaponList.prototype.clearPendingUpgrades = function(){
	this.pendingUpgrades = {};
}

WeaponList.prototype.setPendingUpgrade = function(idx, amount){
	this.pendingUpgrades[idx] = amount;
}

WeaponList.prototype.setPendingUpgradeForCurrent = function(amount){
	this.setPendingUpgrade(this.getCurrentSelection().idx, amount);
}

WeaponList.prototype.setSellInfo = function(sellInfo){
	this._sellInfo = sellInfo;
}

WeaponList.prototype.initDisplayInfo = function(){
	var tmp = [];
	if(this._listType == "equip"){
		tmp.push({idx: -1, info: {name: "<remove item>", desc: ""}});
	}
	
	this._inventoryInfo = $equipablesManager.getCurrentInventory();
	
	for(var i = 0; i < this._inventoryInfo.length; i++){		
		tmp.push({idx: i, info: this._inventoryInfo[i]});		
	}
	this._itemDisplayInfo = tmp;
}

WeaponList.prototype.getCurrentPageAmount = function(){
	const itemDisplayInfo = this.getCurrentFilteredSet();
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= itemDisplayInfo.length){
		return itemDisplayInfo.length - start;
	} else {
		return this._maxPageSize;
	}
}

WeaponList.prototype.getCurrentSelection = function(){	
	const itemDisplayInfo = this.getCurrentFilteredSet();
	var info = itemDisplayInfo[this._currentSelection + this._currentPage * this._maxPageSize];
	return info;
}

WeaponList.prototype.getCurrentSelectionCost = function(){
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

WeaponList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

WeaponList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

WeaponList.prototype.incrementPage = function(){
	const itemDisplayInfo = this.getCurrentFilteredSet();
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= itemDisplayInfo.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
}

WeaponList.prototype.decrementPage = function(){
	const itemDisplayInfo = this.getCurrentFilteredSet();
	this._currentPage--;
	if(this._currentPage < 0){
		if(itemDisplayInfo.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(itemDisplayInfo.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
}

WeaponList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "item_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "item_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);		
}

WeaponList.prototype.redraw = function() {
	var _this = this;	
	this.initDisplayInfo();
	

	var abilities = this.getCurrentFilteredSet();
	var listContent = "";
	
	listContent+="<div class='item_list_row "+_this._listType+" header'>";
	listContent+="<div class='weapon_list_block header scaled_text'></div>";
	if(_this._listType == "equip"){
		listContent+="<div class='weapon_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_weight+"</div>";
		listContent+="<div class='weapon_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_holder+"</div>";

	} else if(_this._listType == "upgrades"){
		listContent+="<div class='weapon_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_upgrades+"</div>";
		listContent+="<div class='weapon_list_block header scaled_text'>"+APPSTRINGS.MECHEQUIPS.label_holder+"</div>";
	}
	
	
	listContent+="</div>";

	var start = this._currentPage * this._maxPageSize;
	var end = Math.min(abilities.length, (start + this._maxPageSize));
	
	for(var i = start; i < end; i++){
		var current = abilities[i];
		
		
			
		
		listContent+="<div data-listidx='"+i+"' data-idx='"+(i - (this._currentPage * this._maxPageSize))+"' data-id='"+current.idx+"' class='item_list_row "+_this._listType+" "+(current.idx == this.getCurrentSelection().idx ? "selected" : "")+"'>";
		
		if(current.idx == -1){		
			listContent+="<div class='weapon_list_block target scaled_text'>Unequip</div>";
		} else {
			listContent+="<div class='weapon_list_block target scaled_text'></div>";	
			
			if(_this._isSellList){
				
			} else {			
				
			}	
			
			
			
			
		}
		listContent+="</div>";
		
		/*listContent+="<div class='item_list_row'>";
		listContent+="<div class='weapon_list_block scaled_text'>";
		if(abilities[i].type == "M"){
			listContent+="<img class='item_list_type scaled_width' src='svg/punch_blast.svg'>";
		} else {
			listContent+="<img class='item_list_type scaled_width' src='svg/crosshair.svg'>";
		}
		
		listContent+="</div>";
		listContent+="<div class='weapon_list_block scaled_text'>"+abilities[i].name+"</div>";
		listContent+="<div class='weapon_list_block scaled_text'>"+this.createAttributeBlock(abilities[i])+"</div>";
		var currentPower = $statCalc.getWeaponPower(refData, abilities[i])*1;
		listContent+="<div class='weapon_list_block scaled_text'>"+currentPower+"</div>";
		listContent+="<div class='weapon_list_block scaled_text'><div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div></div>";
		var upgradeAmount = this.getUpgradeAmount();
		listContent+="<div class='weapon_list_block scaled_text'>"+(currentPower + upgradeAmount)+"</div>";
		listContent+="</div>";*/
	}
	
	this._listDiv.innerHTML = listContent;
	
	let weaponEntries = this._listDiv.querySelectorAll(".item_list_row");
	for(let entry of weaponEntries){
		let listIdx = entry.getAttribute("data-listidx");
		let idx = entry.getAttribute("data-idx");
		if(listIdx != null){
			const current = abilities[listIdx];
			if(current.idx != -1){							
				const target = entry;
				let weaponData = $dataWeapons[current.info.weaponId];
				const displayInfo = {
					name: weaponData.name,
					upgrades: current.info.upgrades,
					pendingUpgrades: _this.pendingUpgrades[current.idx],
					isActive: _this.pendingUpgrades[current.idx] != null,
					holder: current.info.holder,
					weaponWeight: weaponData.meta.weaponWeight || 0,
				};
				new WeaponEntry(target, displayInfo, this).show(this._listType);
			}
		}
		
	}
	
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
	
	var entries = this._container.querySelectorAll(".weapon_upgrades");
	entries.forEach(function(entry){		
		_this.updateScaledDiv(entry);	
	});
	
}