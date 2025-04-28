import Window_CSS from "./Window_CSS.js";
import "./style/Window_ZoneSummary.css";

export default function Window_ZoneSummary() {
	this.initialize.apply(this, arguments);	
}

Window_ZoneSummary.prototype = Object.create(Window_CSS.prototype);
Window_ZoneSummary.prototype.constructor = Window_ZoneSummary;

Window_ZoneSummary.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "zone_summary";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.redraw();
	});	
}

Window_ZoneSummary.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_ZoneSummary.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){			
		this.refresh();
	}
};

Window_ZoneSummary.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_ZoneSummary.prototype.redraw = function() {	
	var _this = this;
	let content = "";
	content+="<div class='zone_summary_content '>";	
	
	let zoneInfo = $gameSystem.getActiveZonesAtTile({x: $gamePlayer.posX(), y: $gamePlayer.posY()});
	let stackCount = zoneInfo.length;
	
	let ctr = 0;
	for(let entry of zoneInfo){
		let displayInfo = $abilityZoneManager.getAbilityDisplayInfo(entry.abilityId);
		const actorInfo = $gameSystem.EventToUnit(entry.ownerEventId);
		if(actorInfo){		
			let isFriendly = $gameSystem.isFriendly(actorInfo[1], "player");
			if(stackCount < 4 || ctr < 4){
				content+="<div class='entry "+(isFriendly ? "friendly" : "")+"'>";
				content+="<div class='label scaled_text fitted_text '>";
				content+=displayInfo.name;
				content+="</div>";
				
				content+="<div class='level_indic scaled_text fitted_text'>";
				content+=APPSTRINGS.ZONE_STATUS.label_level+Math.min(stackCount, displayInfo.upgradeCount);
				content+="</div>";
				
				content+="</div>";
			} else if(ctr == 4){
				content+="<div class='scaled_text fitted_text entry'>";
				content+="<div class='label'>";
				content+="...";
				content+="</div>";
				content+="</div>";
			}
		}
		ctr++;
	}	
	content+="</div>";
	
	_this._bgFadeContainer.innerHTML = content;		
	
	this.updateScaledDiv(_this._bgFadeContainer);	

	Graphics._updateCanvas();
}

