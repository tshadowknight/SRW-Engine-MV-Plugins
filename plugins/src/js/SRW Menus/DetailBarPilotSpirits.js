import Window_CSS from "./Window_CSS.js";
import "./style/PilotStatsBar.css"

export default function DetailBarPilotSpirits(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarPilotSpirits.prototype = Object.create(Window_CSS.prototype);
DetailBarPilotSpirits.prototype.constructor = DetailBarPilotSpirits;

DetailBarPilotSpirits.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarPilotSpirits.prototype.createComponents = function(){
		
}

DetailBarPilotSpirits.prototype.redraw = function(){
	var detailContent = "";
	var actor = this.getCurrentSelection().actor;
	var spritList = $statCalc.getSpiritList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	detailContent+="<div class='bar_pilot_stats spirits'>";
	
	detailContent+="<div class='pilot_stats_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.DETAILPAGES.label_pilot_spirits;
	detailContent+="</div>";
	
	for(var i = 0; i < 6; i++){
		var displayName = "---";
		if(typeof spritList[i] != "undefined" && spritList[i].level <= currentLevel){
			displayName = $spiritManager.getSpiritDisplayInfo(spritList[i].idx).name;
		}
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_value'>"+displayName+"</div>";
		detailContent+="</div>";
	}
	detailContent+="</div>";
	this._container.innerHTML = detailContent;
}