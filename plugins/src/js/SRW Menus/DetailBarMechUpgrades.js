import Window_CSS from "./Window_CSS.js";

export default function DetailBarMechUpgrades(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarMechUpgrades.prototype = Object.create(Window_CSS.prototype);
DetailBarMechUpgrades.prototype.constructor = DetailBarMechUpgrades;

DetailBarMechUpgrades.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarMechUpgrades.prototype.createComponents = function(){
		
}

DetailBarMechUpgrades.prototype.redraw = function(){
	var detailContent = "";
	var mechData = this.getCurrentSelection().mech;
	var calculatedStats = mechData.stats.calculated;
	var upgradeLevels = mechData.stats.upgradeLevels;
	detailContent+="<div class='detail_bar_upgrades'>";
	detailContent+="<div class='mod_level_label scaled_text'>";
	detailContent+=APPSTRINGS.MECHUPGRADES.title;
	detailContent+="</div>";
	detailContent+="<div class='upgrade_block HP scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>HP</div>";
	detailContent+="<div class='value scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(this.getCurrentSelection().actor)+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.maxHP)+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='upgrade_block armor scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>"+APPSTRINGS.MECHSTATS.armor+"</div>";
	detailContent+="<div class='value scaled_text'>"+calculatedStats.armor+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.armor)+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='upgrade_block accuracy scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>"+APPSTRINGS.MECHSTATS.accuracy+"</div>";
	detailContent+="<div class='value scaled_text'>"+calculatedStats.accuracy+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.accuracy)+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='upgrade_block EN scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>EN</div>";
	detailContent+="<div class='value scaled_text'>"+$statCalc.getCurrentMaxENDisplay(this.getCurrentSelection().actor)+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.maxEN)+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='upgrade_block mobility scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>"+APPSTRINGS.MECHSTATS.mobility+"</div>";
	detailContent+="<div class='value scaled_text'>"+calculatedStats.mobility+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.mobility)+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='upgrade_block weapon scaled_width scaled_height'>";
	detailContent+="<div class='label scaled_text'>"+APPSTRINGS.MECHSTATS.weapon+"</div>";
	detailContent+="<div class='value scaled_text'>"+upgradeLevels.weapons+"</div>";
	detailContent+="<div class='bar scaled_text'>"+this.createUpgradeBar(upgradeLevels.weapons)+"</div>";
	detailContent+="</div>";
	
	detailContent+="</div>";
	this._container.innerHTML = detailContent;
}