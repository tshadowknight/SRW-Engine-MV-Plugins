import Window_CSS from "./Window_CSS.js";
import "./style/PilotDetailBar.css"

export default function DetailBarPilotDetail(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarPilotDetail.prototype = Object.create(Window_CSS.prototype);
DetailBarPilotDetail.prototype.constructor = DetailBarPilotDetail;

DetailBarPilotDetail.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarPilotDetail.prototype.createComponents = function(){
		
}

DetailBarPilotDetail.prototype.redraw = function(){
	var detailContent = "";
	var actor = this.getCurrentSelection().actor;
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	var abilityList = $statCalc.getPilotAbilityList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	detailContent+="<div class='bar_pilot_stats details'>";
	detailContent+="<div id='bar_pilot_stats_icon' class=''></div>";//icon 

	detailContent+="<div class='ability_block details scaled_width'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_stats;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.melee+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.melee+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.skill+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.skill+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.evade+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.evade+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.ranged+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.ranged+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.defense+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.defense+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.hit+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.hit+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_AIR+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.air+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_LND+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.land+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_SEA+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.water+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_SPC+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.space+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block skills scaled_width'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_abilities;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	var rowCounter = 0;
	for(var i = 0; i < 6; i++){
		if(rowCounter >= 2){
			rowCounter = 0;
			detailContent+="</div>";
			detailContent+="<div class='ability_block_row scaled_height'>";
		}		
		
		var displayName = "---";
		var uniqueString = "";
		if(typeof abilityList[i] != "undefined" && abilityList[i].requiredLevel <= currentLevel){
			var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(abilityList[i].idx);
			
			if($gameSystem.isHiddenActorAbility(actor, abilityList[i].idx)){
				displayName = "?????";
			} else {
				displayName = displayInfo.name;
				if(displayInfo.hasLevel){
					displayName+="L"+abilityList[i].level;
				}
				if(displayInfo.isUnique){
					uniqueString = "*";
				} else {
					uniqueString = "&nbsp;";
				}
			}
			
		}
		
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width fitted_text'>";
		detailContent+="<div class='unique_skill_mark scaled_width'>"+uniqueString+"</div>";
		detailContent+="<div class='stat_value'>"+displayName+"</div>";
		detailContent+="</div>";		
		
		rowCounter++;
	}
	detailContent+="</div>";
	
	
	detailContent+="</div>";
	this._container.innerHTML = detailContent;
	
	var actorIcon = this._container.querySelector("#bar_pilot_stats_icon");
	this.loadActorFace(actor.actorId(), actorIcon);
	this.updateScaledDiv(actorIcon);
}