import Window_CSS from "./Window_CSS.js";
import "./style/AbilityList.css";

export default function AbilityList(container, selectionProvider, excludeUnique){
	this._container = container;	
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 8;
	this._selectionProvider = selectionProvider;
	this._excludeUnique = excludeUnique;
	this._orderedAbilityIdxs = ENGINE_SETTINGS.PURCHASABLE_ABILITIES;
	this._abilityDisplayInfo = [];
	this.initDisplayInfo();
}


AbilityList.prototype = Object.create(Window_CSS.prototype);
AbilityList.prototype.constructor = AbilityList;

AbilityList.prototype.initDisplayInfo = function(){
	var tmp = [];
	for(var i = 0; i < this._orderedAbilityIdxs.length; i++){
		var abilityIdx = this._orderedAbilityIdxs[i];
		var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(abilityIdx);
		if(!displayInfo.isUnique || !this._excludeUnique){
			tmp.push({idx: abilityIdx, info: displayInfo});
		}
	}
	this._abilityDisplayInfo = tmp;
}


AbilityList.prototype.getCurrentPageAmount = function(){
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= this._abilityDisplayInfo.length){
		return this._abilityDisplayInfo.length - start;
	} else {
		return this._maxPageSize;
	}
}

AbilityList.prototype.getCurrentSelection = function(){	
	var info = this._abilityDisplayInfo[this._currentSelection + this._currentPage * this._maxPageSize];
	return info;
}

AbilityList.prototype.getCurrentSelectionCost = function(){
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

AbilityList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

AbilityList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

AbilityList.prototype.incrementPage = function(){
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._abilityDisplayInfo.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
}

AbilityList.prototype.decrementPage = function(){
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._abilityDisplayInfo.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._abilityDisplayInfo.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
}

AbilityList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "ability_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "ability_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);		
}

AbilityList.prototype.redraw = function() {
	var _this = this;	
	
	var referenceActor = this._selectionProvider.getCurrentSelection();
	var learnedAbilities = $statCalc.getLearnedPilotAbilities(referenceActor);
	
	var abilities = this._abilityDisplayInfo;
	var listContent = "";
	
	listContent+="<div class='ability_list_row header'>";
	listContent+="<div class='ability_list_block header scaled_text'>"+APPSTRINGS.DETAILPAGES.label_ability+"</div>";
	listContent+="<div class='ability_list_block header scaled_text'>"+APPSTRINGS.DETAILPAGES.label_cost+"</div>";
	listContent+="</div>";
	
	var offset = this._currentPage * this._maxPageSize;

	var start = offset;
	var end = Math.min(abilities.length, (start + this._maxPageSize));
	
	for(var i = start; i < end; i++){
		var current = abilities[i];
		
		listContent+="<div data-idx='"+(i - offset)+"' class='ability_list_row "+(current.idx == this.getCurrentSelection().idx ? "selected" : "")+"'>";
		
		listContent+="<div class='ability_list_block scaled_text'>";
		listContent+=current.info.name;
		listContent+="</div>";
		
		var cost = 0;
		var costEntryContent = "";
		if(learnedAbilities[current.idx]){
			if(learnedAbilities[current.idx].slot == -1){
				costEntryContent+="Learned";
			} else {
				if(current.info.hasLevel){
					if(current.info.maxLevel > learnedAbilities[current.idx].level){
						costEntryContent+="(E)"+current.info.cost[learnedAbilities[current.idx].level];
						cost = current.info.cost[learnedAbilities[current.idx].level];
					} else {						
						costEntryContent+="Equipped";						
					}
				} else {					
					costEntryContent+="Equipped";					
				}
			}			
		} else {
			costEntryContent+=current.info.cost[0];
			cost = current.info.cost[0];
		}
		listContent+="<div class='ability_list_block scaled_text "+(cost > $statCalc.getCurrentPP(referenceActor) ? "underflow" : "")+"'>";
		listContent+=costEntryContent;
		listContent+="</div>";
		
		listContent+="</div>";
		
		/*listContent+="<div class='ability_list_row'>";
		listContent+="<div class='ability_list_block scaled_text'>";
		if(abilities[i].type == "M"){
			listContent+="<img class='ability_list_type scaled_width' src='svg/punch_blast.svg'>";
		} else {
			listContent+="<img class='ability_list_type scaled_width' src='svg/crosshair.svg'>";
		}
		
		listContent+="</div>";
		listContent+="<div class='ability_list_block scaled_text'>"+abilities[i].name+"</div>";
		listContent+="<div class='ability_list_block scaled_text'>"+this.createAttributeBlock(abilities[i])+"</div>";
		var currentPower = $statCalc.getWeaponPower(refData, abilities[i])*1;
		listContent+="<div class='ability_list_block scaled_text'>"+currentPower+"</div>";
		listContent+="<div class='ability_list_block scaled_text'><div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div></div>";
		var upgradeAmount = this.getUpgradeAmount();
		listContent+="<div class='ability_list_block scaled_text'>"+(currentPower + upgradeAmount)+"</div>";
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
	var entries = windowNode.querySelectorAll(".ability_list_row");
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
}