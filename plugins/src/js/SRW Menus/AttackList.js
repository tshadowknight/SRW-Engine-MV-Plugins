import Window_CSS from "./Window_CSS.js";
import "./style/AttackList.css";

export default function AttackList(container, weaponModProvider){
	this._container = container;	
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 5;
	this._weaponModProvider = weaponModProvider;
	this._view = "upgrades";
	this._selectionEnabled = false;
	this._attackValidator;
}


AttackList.prototype = Object.create(Window_CSS.prototype);
AttackList.prototype.constructor = AttackList;

AttackList.prototype.getAvailableUnits = function(){
	return $statCalc.getCurrentWeapons(this.createReferenceData($gameTemp.currentMenuUnit.mech, true));
}

AttackList.prototype.setView = function(view){
	this._view = view;
}

AttackList.prototype.setAttackValidator = function(validator){
	this._attackValidator = validator;
}

AttackList.prototype.enableSelection = function(){
	this._selectionEnabled = true;
}

AttackList.prototype.getCurrentPage = function(){
	return this._currentPage;
}

AttackList.prototype.getMaxPage = function(){
	this._availableUnits = this.getAvailableUnits();
	return Math.ceil(this._availableUnits.length / this._maxPageSize) - 1;
}

AttackList.prototype.getCurrentSelection = function(){
	var availableUnits = this.getAvailableUnits();
	var idx = this._currentSelection + this._currentPage * this._maxPageSize;
	if(idx >= availableUnits.length){
		this._currentSelection = 0;
		this._currentPage = 0;
		idx = 0;
		this.requestRedraw();
	}
	return availableUnits[idx];
}

AttackList.prototype.getCurrentPageAmount = function(){
	var refData = this.createReferenceData($gameTemp.currentMenuUnit.mech, true);
	var totalAttacks = $statCalc.getCurrentWeapons(refData).length;
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= totalAttacks){
		return totalAttacks - start;
	} else {
		return this._maxPageSize;
	}
}

AttackList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

AttackList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

AttackList.prototype.incrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._availableUnits.length){
		this._currentPage = 0;
	}
	if(this._currentSelection > this._availableUnits.length - (this._currentPage * this._maxPageSize) - 1){
		this._currentSelection = 0;
	}
	this.validateCurrentSelection();
}

AttackList.prototype.decrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._availableUnits.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._availableUnits.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	if(this._currentSelection > this._availableUnits.length - (this._currentPage * this._maxPageSize) - 1){
		this._currentSelection = 0;
	}
	this.validateCurrentSelection();
}

AttackList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "attack_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "attack_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._topBorder = document.createElement("div");
	this._topBorder.id = "mech_list_control_top_border";
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);	
	this._container.appendChild(this._topBorder);	
}


AttackList.prototype.getUpgradeAmount = function(attack) {
	if(this._weaponModProvider){
		var refData = this.createReferenceData($gameTemp.currentMenuUnit.mech);
		return $statCalc.getWeaponDamageUpgradeAmount(attack, this._weaponModProvider.getWeaponLevels());
	} else {
		return 0;
	}
}

AttackList.prototype.createUpgradeViewRow = function(refData, attack, idx) {
	var listContent = "";
	listContent+="<div class='attack_list_block scaled_text'>";
	if(attack.type == "M"){
		listContent+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
	} else {
		listContent+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
	}
	
	listContent+="</div>";
	listContent+="<div class='attack_list_block scaled_text fitted_text'>"+attack.name+"</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+this.createAttributeBlock(attack)+"</div>";
	var currentPower = $statCalc.getWeaponPower(refData, attack)*1;
	listContent+="<div class='attack_list_block scaled_text'>"+currentPower+"</div>";
	listContent+="<div class='attack_list_block scaled_text'><div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div></div>";
	var upgradeAmount = this.getUpgradeAmount(attack);
	listContent+="<div class='attack_list_block scaled_text upgrade_amount' data-idx='"+idx+"'>"+(currentPower + upgradeAmount)+"</div>";
	return listContent;
}

AttackList.prototype.createSummaryViewRow = function(refData, attack) {
	var listContent = "";
	listContent+="<div class='attack_list_block scaled_text'>";
	if(attack.type == "M"){
		listContent+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
	} else {
		listContent+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
	}
	
	listContent+="</div>";
	listContent+="<div class='attack_list_block scaled_text fitted_text'>"+attack.name+"</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+this.createAttributeBlock(attack)+"</div>";
	var currentPower = $statCalc.getWeaponPowerWithMods(refData, attack)*1;
	
	var tagBoostInfo = $statCalc.getModDefinitions(refData, ["weapon_type_boost"]);
	for(const modDef of tagBoostInfo){
		if(modDef.tag == attack.particleType){
			currentPower+=modDef.value;
		}
	}
	
	listContent+="<div class='attack_list_block scaled_text "+$statCalc.getWeaponPowerStatState(refData, attack)+"'>"+currentPower+"</div>";
	if(attack.isMap){
		listContent+="<div class='attack_list_block scaled_text'>---</div>";
	} else {
		var minRange = $statCalc.getRealWeaponMinRange($gameTemp.currentMenuUnit.actor, attack);
		listContent+="<div class='attack_list_block scaled_text "+$statCalc.getWeaponRangeStatState(refData, attack)+"'>"+(minRange ? minRange : "1")+"-"+$statCalc.getRealWeaponRange($gameTemp.currentMenuUnit.actor, attack)+"</div>";
	}
	
	var hitMod = attack.hitMod;
	if(attack.hitMod >= 0){
		hitMod = "+"+attack.hitMod;
	}
	listContent+="<div class='attack_list_block scaled_text'>"+hitMod+"</div>";
	var critMod = attack.critMod;
	if(attack.critMod >= 0){
		critMod = "+"+attack.critMod;
	}
	listContent+="<div class='attack_list_block scaled_text'>"+critMod+"</div>";
	return listContent;
}

AttackList.prototype.redrawUpgrades = function() {
	var refData;
	if($gameTemp.currentMenuUnit.actor && $gameTemp.currentMenuUnit.actor.SRWStats && $gameTemp.currentMenuUnit.actor.SRWStats.id != -1){
		refData = $gameTemp.currentMenuUnit.actor;
	} else {
		refData = this.createReferenceData($gameTemp.currentMenuUnit.mech);
	}
	
	var attacks = $statCalc.getCurrentWeapons(refData);	
	
	var pageOffset = this._currentPage * this._maxPageSize;
	var start = pageOffset;
	var end = Math.min(attacks.length, (start + this._maxPageSize));
		
	for(var i = start; i < end; i++){		
		var upgradeAmount = this.getUpgradeAmount(attacks[i]);	
		var currentPower = $statCalc.getWeaponPower(refData, attacks[i])*1;
		this._container.querySelector(".upgrade_amount[data-idx='"+i+"'").innerHTML = currentPower + upgradeAmount;
	}
}

AttackList.prototype.redraw = function(softRefresh) {
	var _this = this;	
	var refData;
	if($gameTemp.currentMenuUnit.actor && $gameTemp.currentMenuUnit.actor.SRWStats && $gameTemp.currentMenuUnit.actor.SRWStats.id != -1){
		refData = $gameTemp.currentMenuUnit.actor;
	} else {
		refData = this.createReferenceData($gameTemp.currentMenuUnit.mech);
	}
	var attacks = $statCalc.getCurrentWeapons(refData);	
	var maxPage = Math.ceil(attacks.length / this._maxPageSize);
	if(maxPage < 1){
		maxPage = 1;
	}
	let currentEntry = this._listDiv.querySelector(".page.selected");
	if(currentEntry && softRefresh){
		this._listDiv.querySelector(".page.selected").classList.remove("selected");
		this._listDiv.querySelector(".page[data-page='"+this._currentPage+"']").classList.add("selected");
		
		let rows = this._listDiv.querySelectorAll(".attack_list_row");
		for(const row of rows){
			row.classList.remove("selected");
			if(row.getAttribute("data-idx") == this._currentSelection){
				row.classList.add("selected");
			}
		}
		
		var content = "";
		content+="<img id='prev_page' src=svg/chevron_right.svg>";
		content+=(this._currentPage + 1)+"/"+maxPage;
		content+="<img id='next_page' src=svg/chevron_right.svg>";
		this._pageDiv.innerHTML = content;
		return;
	}
	
	
	
	
	var listContent = "";
	
	listContent+="<div class='attack_list_row header "+this._view+"'>";
	if(this._view == "upgrades"){
		listContent+="<div class='attack_list_block header scaled_text '></div>";
		listContent+="<div class='attack_list_block header scaled_text fitted_text'>"+APPSTRINGS.ATTACKLIST.label_attack_name+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_attributes+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_power+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '></div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_upgraded+"</div>";
	} else if(this._view == "summary"){
		listContent+="<div class='attack_list_block header scaled_text '></div>";
		listContent+="<div class='attack_list_block header scaled_text fitted_text'>"+APPSTRINGS.ATTACKLIST.label_attack_name+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_attributes+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_power+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_range+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_hit+"</div>";
		listContent+="<div class='attack_list_block header scaled_text '>"+APPSTRINGS.ATTACKLIST.label_crit+"</div>";
	}
	listContent+="</div>";
	
	listContent+="<div class='pages_container'>";
	
	let pageCtr = 0;
	var pageOffset = this._currentPage * this._maxPageSize;
	var start = 0;//pageOffset;
	var end = attacks.length;//Math.min(attacks.length, (start + this._maxPageSize));
	
	listContent+="<div data-page='"+pageCtr+"' class='page "+(pageCtr == this._currentPage ? "selected" : "")+"'>";
	
	for(var i = start; i < end; i++){
		if(i != 0 && (i % this._maxPageSize) == 0){
			listContent+="</div>";
			pageCtr++;
			listContent+="<div data-page='"+pageCtr+"' class='page "+(pageCtr == this._currentPage ? "selected" : "")+"'>";
		}
		var rowClasses = [];
		var validationResult;
		if(this._attackValidator) {
			validationResult = this._attackValidator.validateAttack(attacks[i]);
			if(!validationResult.canUse){
				rowClasses.push("disabled");
			}
		}
		if(_this._selectionEnabled && i-(pageCtr * this._maxPageSize) == this._currentSelection){
			rowClasses.push("selected");
		}
		listContent+="<div data-idx='"+(i-(pageCtr * this._maxPageSize))+"' class='attack_list_row "+this._view+" "+rowClasses.join(" ")+"'>";
		if(this._view == "upgrades"){
			listContent+=this.createUpgradeViewRow(refData, attacks[i], i);
		} else if(this._view == "summary"){
			listContent+=this.createSummaryViewRow(refData, attacks[i]);			
		}
		
		
		listContent+="</div>";
	}
	listContent+="</div>";
	listContent+="</div>";
	
	this._listDiv.innerHTML = listContent;
	
	
	var content = "";
	content+="<img id='prev_page' src=svg/chevron_right.svg>";
	content+=(this._currentPage + 1)+"/"+maxPage;
	content+="<img id='next_page' src=svg/chevron_right.svg>";
	this._pageDiv.innerHTML = content;
	
	this.loadImages();
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".attack_list_row");
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