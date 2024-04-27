import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import DescriptionOverlay from "./DescriptionOverlay.js";
import "./style/Window_Search.css"

export default function Window_Search() {
	this.initialize.apply(this, arguments);	
}

Window_Search.prototype = Object.create(Window_CSS.prototype);
Window_Search.prototype.constructor = Window_Search;

Window_Search.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "search";	
	this._pageSize = 1;
	this._tabInfo = [
		{id: "spirit", elem: null, button: null},
		{id: "pilot", elem: null, button: null},
		{id: "mech", elem: null, button: null}
	]
	this._uiState = "tab_selection";
	this._selectedTab = 0;
	this._rowSize = 5;
	this._maxRows = 5;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}


Window_Search.prototype.resetSelection = function(){
	if(this._uiState != "pending_selection"){
		this._currentSelection = 0;
		this._currentPage = 0;
		this._selectedTab = 0;
		this._uiState = "tab_selection";
	} else {
		this._uiState = "entry_selection";
	}	
}

Window_Search.prototype.getCurrentSelection = function(){
	var unit = $gameTemp.currentMenuUnit;	
	if(this._subPilotIdx != 0){
		var subPilots = $statCalc.getSubPilots(unit.actor);
		var subPilotId = subPilots[this._subPilotIdx - 1];
		if(subPilotId != null){
			unit = {actor: $gameActors.actor(subPilotId), mech: unit.actor.SRWStats.mech};
		}
	}
	return unit;
}

Window_Search.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.SEARCH.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	this._listContainer.classList.add("styled_scroll");
	windowNode.appendChild(this._listContainer);	
	
	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	this._detailContainer.classList.add("scaled_text");
	this._detailContainer.classList.add("fitted_text");
	windowNode.appendChild(this._detailContainer);
	
	this._spiritTabButton = document.createElement("div");	
	this._spiritTabButton.classList.add("tab_button");	
	this._spiritTabButton.classList.add("spirit_info_button");	
	this._spiritTabButton.classList.add("scaled_text");			
	this._spiritTabButton.innerHTML = APPSTRINGS.SEARCH.label_spirit;
	this._spiritTabButton.addEventListener("click", function(){
		_this._selectedTab = 0;
		_this.requestRedraw();
	});
	this._tabInfo[0].button = this._spiritTabButton;
	windowNode.appendChild(this._spiritTabButton);
	
	this._pilotTabButton = document.createElement("div");	
	this._pilotTabButton.classList.add("tab_button");	
	this._pilotTabButton.classList.add("pilot_stats_button");	
	this._pilotTabButton.classList.add("scaled_text");			
	this._pilotTabButton.innerHTML = APPSTRINGS.SEARCH.label_pilot;
	windowNode.appendChild(this._pilotTabButton);
	this._pilotTabButton.addEventListener("click", function(){
		_this._selectedTab = 1;
		_this.requestRedraw();
	});
	this._tabInfo[1].button = this._pilotTabButton;
	
	this._mechTabButton = document.createElement("div");	
	this._mechTabButton.classList.add("tab_button");	
	this._mechTabButton.classList.add("mech_stats_button");	
	this._mechTabButton.classList.add("scaled_text");			
	this._mechTabButton.innerHTML = APPSTRINGS.SEARCH.label_mech;
	windowNode.appendChild(this._mechTabButton);
	this._mechTabButton.addEventListener("click", function(){
		_this._selectedTab = 2;
		_this.requestRedraw();
	});
	this._tabInfo[2].button = this._mechTabButton;
	
}	

Window_Search.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
	
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			if(this._uiState == "entry_selection"){
				var referenceLength;
				if(!(this._currentEntries.length % this._rowSize)){
					referenceLength = this._currentEntries.length;
				} else {
					referenceLength = Math.floor((this._currentEntries.length + this._rowSize) / this._rowSize) * this._rowSize;
				}
				if(this._currentSelection + this._rowSize < referenceLength - 1){
					SoundManager.playCursor();
					this._currentSelection+=this._rowSize;
					if(this._currentSelection >= this._currentEntries.length){
						this._currentSelection = this._currentEntries.length - 1;
					}
				} 
			}
			this.refresh();
			return;	
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
			if(this._uiState == "entry_selection"){
				if(this._currentSelection - this._rowSize >= 0){
					SoundManager.playCursor();
					this._currentSelection-=this._rowSize;
				} 
			}
			this.refresh();
			return;	
		}
		
		
					

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			if(this._uiState == "tab_selection"){
				this._selectedTab--;
				if(this._selectedTab < 0){
					this._selectedTab = this._tabInfo.length-1;
				}
			} else {
				if(!(this._currentSelection % this._rowSize)){
					this._currentSelection+=(this._rowSize - 1);
				} else {
					this._currentSelection--;
				}				
				if(this._currentSelection >= this._currentEntries.length){
					this._currentSelection = this._currentEntries.length - 1;
				}
			}
			SoundManager.playCursor();
			this.refresh();
			return;			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			if(this._uiState == "tab_selection"){
				this._selectedTab++;
				if(this._selectedTab > this._tabInfo.length-1){
					this._selectedTab = 0;
				}
			} else {
				if(!((this._currentSelection + 1) % this._rowSize)){
					this._currentSelection-=(this._rowSize - 1);
				} else {
					this._currentSelection++;
				}				
				if(this._currentSelection >= this._currentEntries.length){
					this._currentSelection = Math.floor(this._currentEntries.length / this._rowSize) * this._rowSize;
				}
			}
			SoundManager.playCursor();
			this.refresh();
			return;		
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			if(this._uiState == "tab_selection"){
				SoundManager.playOk();
				this.requestRedraw();
				this._uiState = "entry_selection";
			} else if(this.validateEntry(this._currentSelection)){
				SoundManager.playOk();
				$gameTemp.searchInfo = {};
				$gameTemp.searchInfo.value = this._currentEntries[this._currentSelection].id;
				if(this._selectedTab == 0){
					$gameTemp.searchInfo.type = "spirit";
				}
				if(this._selectedTab == 1){
					$gameTemp.searchInfo.type = "pilot";
				}
				if(this._selectedTab == 2){
					$gameTemp.searchInfo.type = "mech";
				}
				/*$gameTemp.mechListWindowCancelCallback = function(){
					
				}*/
				$gameTemp.mechListWindowSearchSelectionCallback = function(actor){
					$gameTemp.mechListWindowSearchSelectionCallback = null;
					_this._uiState = "tab_selection";
					$gameTemp.killMenu("search");						
					if(_this._callbacks["selected"]){
						_this._callbacks["selected"](actor);
					}	
				}
				this._uiState = "pending_selection";
				$gameTemp.pushMenu = "mech_list_deployed";
			} else {
				SoundManager.playBuzzer();
			}
			this.refresh();
			return;	
		}
		
		if(Input.isTriggered('menu')){
			
		}	
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			SoundManager.playCancel();
			$gameTemp.searchInfo = null;
			if(this._uiState == "tab_selection"){
				$gameTemp.popMenu = true;			
				$gameTemp.buttonHintManager.hide();		
				if(this._callbacks["closed"]){
					this._callbacks["closed"]();
				}					
			} else if(this._uiState == "pending_selection"){
				this.requestRedraw();
				this._uiState = "tab_selection";
			} else {
				this.requestRedraw();
				this._currentSelection = 0;
				this._uiState = "tab_selection";
			}
			this.refresh();
			return;				
		}				
		
		this.refresh();
	}		
};

Window_Search.prototype.validateEntry = function(idx) {
	var searchInfo = {};
	searchInfo.value = this._currentEntries[idx].id;
	if(this._selectedTab == 0){
		searchInfo.type = "spirit";
	}
	if(this._selectedTab == 1){
		searchInfo.type = "pilot";
	}
	if(this._selectedTab == 2){
		searchInfo.type = "mech";
	}
	return !!$statCalc.getSearchedActors("actor", searchInfo).length;
}

Window_Search.prototype.createEntryList = function(list) {
	var content = "";
	var rowCtr = 0;
	content+="<div data-row='"+rowCtr+"' class='row'>";
	/*var startIdx = (Math.floor(this._currentSelection / this._rowSize) - (this._rowSize - 1)) * this._rowSize;
	if(this._previousStartIdx != null && Math.abs(this._previousStartIdx - this._currentSelection) < (this._rowSize * this._maxRows)){
		startIdx = this._previousStartIdx;
	}
	if(this._previousStartIdx > this._currentSelection){
		startIdx = this._previousStartIdx;
		while(startIdx > 0 && startIdx > this._currentSelection){
			startIdx-=this._rowSize;
		}
	}
	if(startIdx < 0){
		startIdx = 0;
	}
	this._previousStartIdx = startIdx;*/
	for(var i = 0; i < list.length; i++){
		if(i && !(i % this._rowSize)){
			content+="</div>";
			rowCtr++;
			content+="<div data-row='"+rowCtr+"' class='row'>";
		}
		var name = list[i].name;
		var isValid = true;
		if(!this.validateEntry(i)){
			name = "???";
			isValid = false;
		}
		content+="<div data-entryid="+i+" class='entry scaled_text fitted_text "+((this._uiState == "entry_selection" &&  i == this._currentSelection) ? "selected" : "")+" "+(isValid ? "" : "disabled")+"'>";
		content+=name;
		content+="</div>";
	}
	
	content+="</div>";
	this._listContainer.innerHTML = content;
}

Window_Search.prototype.redraw = function() {

	var _this = this;
	
	if(this._uiState == "tab_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["tab_nav"], ["tab_selection"]]);
	} 
	if(this._uiState == "entry_selection"){
		if(this._selectedTab == 0){
			$gameTemp.buttonHintManager.setHelpButtons([["navigate_entries"], ["search_select_spirit"]]);
		}
		if(this._selectedTab == 1){
			$gameTemp.buttonHintManager.setHelpButtons([["navigate_entries"], ["search_select_abi"]]);
		}
		if(this._selectedTab == 2){
			$gameTemp.buttonHintManager.setHelpButtons([["navigate_entries"], ["search_select_abi"]]);
		}
		
	}
	$gameTemp.buttonHintManager.show();
	
	this._spiritTabButton.classList.remove("selected");
	this._pilotTabButton.classList.remove("selected");
	this._mechTabButton.classList.remove("selected");
	this._tabInfo[this._selectedTab].button.classList.add("selected");
	var currentScrollTop = this._listContainer.scrollTop;
	var ids = [];
	var list = [];
	if(this._selectedTab == 0){
		ids = ENGINE_SETTINGS.ABILITY_SEARCH_LIST.SPIRIT;
	}
	if(this._selectedTab == 1){
		ids = ENGINE_SETTINGS.ABILITY_SEARCH_LIST.PILOT;
	}
	if(this._selectedTab == 2){
		ids = ENGINE_SETTINGS.ABILITY_SEARCH_LIST.MECH;
	}
	
	for(var i = 0; i < ids.length; i++){
		var entry;
		if(this._selectedTab == 0){
			entry = $spiritManager.getSpiritDef(ids[i]);
		}
		if(this._selectedTab == 1){
			entry = $pilotAbilityManager.getAbilityDef(ids[i]);
		}
		if(this._selectedTab == 2){
			entry = $mechAbilityManager.getAbilityDef(ids[i]);
		}
		entry = JSON.parse(JSON.stringify(entry));
		entry.id = ids[i];
		list.push(entry);		
	}
	list = list.sort(function(a, b){return a.name.localeCompare(b.name)});	
	this._currentEntries = list;
	this.createEntryList(list);
	
	var activeElem = this._listContainer.querySelector(".entry.selected");
	if(activeElem){
		var id = activeElem.getAttribute("data-entryid");
		if(this.validateEntry(id)){
			this._detailContainer.innerHTML = list[id].desc;
		} else {
			this._detailContainer.innerHTML = "";
		}		
	}
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			var idx = this.getAttribute("data-entryid"); 
			if(idx != null){
				idx*=1;
				if(idx == _this._currentSelection){
					_this._touchOK = true;				
				} else {
					_this._uiState = "entry_selection"
					_this._currentSelection = idx;
					_this.requestRedraw();
				}
			}		
		});
	});
	this.loadImages();
	Graphics._updateCanvas();
	
	
	if(activeElem){
		var listRect = this._listContainer.getBoundingClientRect();
	
		var currentActiveRow = activeElem.parentNode;
		var rowRect = currentActiveRow.getBoundingClientRect();
		if(rowRect.bottom > listRect.bottom){
			this._listContainer.scrollTop = rowRect.height * currentActiveRow.getAttribute("data-row");
		} else if(rowRect.top < listRect.top){
			this._listContainer.scrollTop-=listRect.top - rowRect.top;
		} else {
			this._listContainer.scrollTop = currentScrollTop;
		}
		
		
	}	

}