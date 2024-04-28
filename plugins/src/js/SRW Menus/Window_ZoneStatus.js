import Window_CSS from "./Window_CSS.js";
import "./style/Window_ZoneStatus.css";

export default function Window_ZoneStatus() {
	this.initialize.apply(this, arguments);	
}

Window_ZoneStatus.prototype = Object.create(Window_CSS.prototype);
Window_ZoneStatus.prototype.constructor = Window_ZoneStatus;

Window_ZoneStatus.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "zone_status";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
	this._currentScroll = 0;	
}

Window_ZoneStatus.prototype.resetSelection = function(){
	this._currentScroll = 0;	
}

Window_ZoneStatus.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_ZoneStatus.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.ZONE_STATUS.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	this._listContainer.classList.add("styled_scroll");	
	windowNode.appendChild(this._listContainer);	
}	


Window_ZoneStatus.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
	
		
		if(Input.isTriggered('ok')){
			//$gameTemp.popMenu = true;	
		}
		
		if(Input.isPressed('down') || Input.isLongPressed('down')){
			this._currentScroll+=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._listContainer, this._currentScroll);			
		}
		if(Input.isPressed('up') || Input.isLongPressed('up')){
			this._currentScroll-=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._listContainer, this._currentScroll);			
		}
	
		if(Input.isTriggered('cancel') || TouchInput.isCancelled() || !$gameSystem.textLog){				
			$gameTemp.popMenu = true;	
			$gameTemp.buttonHintManager.hide();
			$gameSystem.setSubBattlePhase('normal');
		}		
		
		this.refresh();
	}		
};

Window_ZoneStatus.prototype.redraw = function() {	
	var _this = this;	
	
	$gameTemp.buttonHintManager.setHelpButtons([["scroll_list"]]);
	$gameTemp.buttonHintManager.show();
	
	let zoneInfo = $gameSystem.getActiveZonesAtTile({x: $gamePlayer.posX(), y: $gamePlayer.posY()});
	let stackCount = zoneInfo.length;
	let content = "";
	for(let entry of zoneInfo){
		let displayInfo = $abilityZoneManager.getAbilityDisplayInfo(entry.abilityId);
		let isFriendly = $gameSystem.isFriendly($gameSystem.EventToUnit(entry.ownerEventId)[1], "player");
		content+="<div class='entry "+(isFriendly ? "friendly" : "")+"'>";
		content+="<div class='title'>";
		content+="<div class='label scaled_text fitted_text'>";
		content+=displayInfo.name;
		content+="</div>";
		if(displayInfo.upgradeCount > 1){
			content+="<div class='level_indic scaled_text fitted_text'>";
			content+=APPSTRINGS.ZONE_STATUS.label_level+": "+Math.min(stackCount, displayInfo.upgradeCount) + "/" +displayInfo.upgradeCount;
			content+="</div>";
		}		
		content+="</div>";
		content+="<div class='desc scaled_text fitted_text'>";
		let descInfo = displayInfo.desc(stackCount);
		if(descInfo){		
			if(isFriendly){
				if(descInfo.ally){
					content+=APPSTRINGS.ZONE_STATUS.label_player+": "+descInfo.ally;
					content+="<br>";
				}
				if(descInfo.enemy){
					content+=APPSTRINGS.ZONE_STATUS.label_enemy+":  "+descInfo.enemy;
					content+="<br>";
				}
			} else {
				if(descInfo.enemy){
					content+=APPSTRINGS.ZONE_STATUS.label_player+": "+descInfo.enemy;
					content+="<br>";
				}
				if(descInfo.ally){
					content+=APPSTRINGS.ZONE_STATUS.label_enemy+":  "+descInfo.ally;
					content+="<br>";
				}
			}
		}
		content+="</div>";
		content+="</div>";
	}	
	this._listContainer.innerHTML = content;
	this.loadImages();
	Graphics._updateCanvas();
}

