import Window_CSS from "./Window_CSS.js";

export default function DetailBarPilot(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarPilot.prototype = Object.create(Window_CSS.prototype);
DetailBarPilot.prototype.constructor = DetailBarPilot;

DetailBarPilot.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarPilot.prototype.createComponents = function(){
		
}

DetailBarPilot.prototype.redraw = function(){
	var detailContent = "";
	var currentSelection = this.getCurrentSelection();
	var mechData = currentSelection.mech;
	var actor = currentSelection.actor;
	var calculatedStats = mechData.stats.calculated;
	detailContent+="<div id='detail_list_icon'></div>";//icon 
	detailContent+="<div class='mech_hp_en_container scaled_text'>";
	detailContent+="<div class='hp_label scaled_text'>HP</div>";
	detailContent+="<div class='en_label scaled_text'>EN</div>";

	detailContent+="<div class='hp_display'>";
	detailContent+="<div class='current_hp scaled_text'>"+calculatedStats.currentHP+"</div>";
	detailContent+="<div class='divider scaled_text'>/</div>";
	detailContent+="<div class='max_hp scaled_text'>"+calculatedStats.maxHP+"</div>";
	
	detailContent+="</div>";
	
	detailContent+="<div class='en_display'>";
	detailContent+="<div class='current_en scaled_text'>"+calculatedStats.currentEN+"</div>";
	detailContent+="<div class='divider scaled_text'>/</div>";
	detailContent+="<div class='max_en scaled_text'>"+calculatedStats.maxEN+"</div>";
	
	detailContent+="</div>";
	
	var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
	detailContent+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
	
	var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
	detailContent+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
	detailContent+="</div>";
	
	detailContent+="<div id='detail_list_icon_pilot'></div>";//icon 
	

	if(actor.isEmpty){
		detailContent+="<div class='scaled_text actor_name'>--</div>";	
		detailContent+="<div class='mech_stats_container scaled_text'>";
		detailContent+="<div class='stat_section stat_section_level' >";
		detailContent+="<div class='stat_label'>Lv</div>";
		detailContent+="<div class='stat_value'>--</div>";
		detailContent+="</div>";
		detailContent+="<div class='stat_section stat_section_sp'>";
		detailContent+="<div class='stat_label'>SP</div>";	
		detailContent+="<div class='stat_value'>--</div>";
		detailContent+="</div>";
		detailContent+="<div class='stat_section stat_section_pp'>";
		detailContent+="<div class='stat_label'>PP</div>";
		detailContent+="<div class='stat_value'>--</div>";
		detailContent+="</div>";
	} else {	
		detailContent+="<div class='scaled_text actor_name'>"+actor.name()+"</div>";	
		detailContent+="<div class='mech_stats_container scaled_text'>";
		detailContent+="<div class='stat_section stat_section_level' >";
		detailContent+="<div class='stat_label'>Lv</div>";
		detailContent+="<div class='stat_value'>"+$statCalc.getCurrentLevel(actor)+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='stat_section stat_section_sp'>";
		detailContent+="<div class='stat_label'>SP</div>";	
		detailContent+="<div class='stat_value'>"+$statCalc.getCurrentSP(actor)+"</div>";
		detailContent+="</div>";
		detailContent+="<div class='stat_section stat_section_pp'>";
		detailContent+="<div class='stat_label'>PP</div>";
		detailContent+="<div class='stat_value'>"+$statCalc.getCurrentPP(actor)+"</div>";
	}
	
	
	detailContent+="</div>";
	detailContent+="</div>";
	this._container.innerHTML = detailContent;
	
	if(!actor.isEmpty){
		var actorIcon = this._container.querySelector("#detail_list_icon_pilot");
		this.loadActorFace(this.getCurrentSelection().actor.actorId(), actorIcon);
	}	
	
	var mechIcon = this._container.querySelector("#detail_list_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);
}