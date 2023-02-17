import Window_CSS from "./Window_CSS.js";
import "./style/PilotStatsBar.css"

export default function DetailBarPilotStats(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarPilotStats.prototype = Object.create(Window_CSS.prototype);
DetailBarPilotStats.prototype.constructor = DetailBarPilotStats;

DetailBarPilotStats.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarPilotStats.prototype.createComponents = function(){
		
}

DetailBarPilotStats.prototype.redraw = function(){
	var detailContent = "";
	var selection = this.getCurrentSelection();
	if(selection){
		var actor = selection.actor;
		var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	
		detailContent+="<div class='bar_pilot_stats'>";
		
		detailContent+="<div class='pilot_stats_label scaled_text scaled_width'>";
		detailContent+=APPSTRINGS.DETAILPAGES.label_pilot_stats;
		detailContent+="</div>";
		
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.melee+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.melee+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.ranged+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.ranged+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.skill+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.skill+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.defense+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.defense+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.evade+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.evade+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
		detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.hit+"</div>";
		detailContent+="<div class='stat_value'>"+calculatedStats.hit+"</div>";
		detailContent+="</div>";
		

		detailContent+="</div>";
	}
	
	this._container.innerHTML = detailContent;
}