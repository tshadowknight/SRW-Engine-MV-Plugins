import Window_CSS from "./Window_CSS.js";

export default function DetailBarMech(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarMech.prototype = Object.create(Window_CSS.prototype);
DetailBarMech.prototype.constructor = DetailBarMech;

DetailBarMech.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarMech.prototype.createComponents = function(){
		
}

DetailBarMech.prototype.redraw = function(){
	var detailContent = "";
	var mechData = this.getCurrentSelection().mech;
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
	
	detailContent+="<div class='mech_stats_container scaled_text'>";
	detailContent+="<div class='stat_section stat_section_move' >";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.move+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.move+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_armor'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.armor+"</div>";	
	detailContent+="<div class='stat_value'>"+calculatedStats.armor+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_mobility'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.mobility+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.mobility+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_accuracy'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.accuracy+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.accuracy+"</div>";
	detailContent+="</div>";
	

	detailContent+="</div>";
	this._container.innerHTML = detailContent;

	var mechIcon = this._container.querySelector("#detail_list_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);
}