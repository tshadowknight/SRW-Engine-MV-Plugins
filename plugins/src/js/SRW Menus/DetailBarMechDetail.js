import Window_CSS from "./Window_CSS.js";

export default function DetailBarMechDetail(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
}

DetailBarMechDetail.prototype = Object.create(Window_CSS.prototype);
DetailBarMechDetail.prototype.constructor = DetailBarMechDetail;

DetailBarMechDetail.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarMechDetail.prototype.createComponents = function(){
		
}

DetailBarMechDetail.prototype.redraw = function(){
	var detailContent = "";
	var currentSelection = this.getCurrentSelection();
	var actor = currentSelection.actor;
	var mechData = currentSelection.mech;
	
	var terrainStrings = $statCalc.getRealMechTerrainStrings(actor);
	
	var calculatedStats = mechData.stats.calculated;
	detailContent+="<div class='left_items'>";
	detailContent+="<div class='icon_hp_EN'>";
	detailContent+="<div id='detail_list_icon'></div>";//icon 
	detailContent+="<div class='mech_hp_en_container scaled_text'>";
	detailContent+="<div class='hp_label scaled_text'>HP</div>";
	detailContent+="<div class='en_label scaled_text'>EN</div>";

	detailContent+="<div class='hp_display'>";
	detailContent+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(actor)+"</div>";
	detailContent+="<div class='divider scaled_text'>/</div>";
	detailContent+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(actor)+"</div>";
	
	detailContent+="</div>";
	
	detailContent+="<div class='en_display'>";
	detailContent+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(actor)+"</div>";
	detailContent+="<div class='divider scaled_text'>/</div>";
	detailContent+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(actor)+"</div>";
	
	detailContent+="</div>";
	
	var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
	detailContent+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
	
	var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
	detailContent+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='mech_stats_container scaled_text'>";
	detailContent+="<div class='stat_section stat_section_move' >";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.move+"</div>";
	var statState = $statCalc.getMoveStatState(actor);
	detailContent+="<div class='"+statState+" stat_value'>"+$statCalc.getCurrentMoveRange(actor)+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_armor'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.armor+"</div>";	
	var baseArmor = calculatedStats.armor;
	var currentArmor = baseArmor;
	var armorDown = $statCalc.isArmorDown(actor)
	if(armorDown){
		currentArmor-=armorDown;
	}
	currentArmor = $statCalc.applyStatModsToValue(actor, currentArmor, ["armor"]);
	
	detailContent+="<div class='stat_value "+(baseArmor < currentArmor ? "boosted" : "")+" "+(baseArmor > currentArmor ? "dropped" : "")+"'>"+currentArmor+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_mobility'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.mobility+"</div>";
	var baseMobility = calculatedStats.mobility;
	var currentMobility = baseMobility;
	var mobilityDown = $statCalc.isMobilityDown(actor);
	if(mobilityDown){
		currentMobility-=mobilityDown;
		currentMobility = Math.floor(currentMobility);
	}
	currentMobility = $statCalc.applyStatModsToValue(actor, currentMobility, ["mobility"]);
	if($statCalc.isDisabled(actor)){
		currentMobility = 0;
	}
	detailContent+="<div class='stat_value "+(baseMobility < currentMobility ? "boosted" : "")+" "+(baseMobility > currentMobility ? "dropped" : "")+"'>"+currentMobility+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_accuracy'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.accuracy+"</div>";
	var baseAccuracy = calculatedStats.accuracy;
	var currentAccuracy = baseAccuracy;
	var accuracyDown = $statCalc.isAccuracyDown(actor)
	if(accuracyDown){
		currentAccuracy-=accuracyDown;
		currentAccuracy = Math.floor(currentAccuracy);
	}
	currentAccuracy = $statCalc.applyStatModsToValue(actor, currentAccuracy, ["accuracy"]);
	detailContent+="<div class='stat_value "+(baseAccuracy < currentAccuracy ? "boosted" : "")+" "+(baseAccuracy > currentAccuracy ? "dropped" : "")+"'>"+currentAccuracy+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='stat_section stat_section_size'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.MECHSTATS.size+"</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getCurrentSize(actor)+"</div>";
	detailContent+="</div>";
	
	
	detailContent+="<div class='stat_section stat_section_terrain'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_AIR+"</div>";
	detailContent+="<div class='stat_value'>"+(terrainStrings.air || "-")+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_LND+"</div>";
	detailContent+="<div class='stat_value'>"+(terrainStrings.land || "-")+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_SEA+"</div>";
	detailContent+="<div class='stat_value'>"+(terrainStrings.water || "-")+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_SPC+"</div>";
	detailContent+="<div class='stat_value'>"+(terrainStrings.space || "-")+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	detailContent+="</div>";

	detailContent+="</div>";
	
	detailContent+="<div class='center_items'>";
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_abilities;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	var abilityList = mechData.abilities;
	var rowCounter = 0;
	for(var i = 0; i < 6; i++){
		if(rowCounter >= 2){
			rowCounter = 0;
			detailContent+="</div>";
			detailContent+="<div class='ability_block_row scaled_height'>";
		}		
		var displayClass = "inactive";
		var displayName = "---------";
		var uniqueString = "";
		var descriptionData = "";
		var descriptionClass = "";
		if(typeof abilityList[i] != "undefined"){
			displayClass = "";
			descriptionClass = "described_element";
			descriptionData = "data-type='mech' data-idx='"+abilityList[i].idx+"'";
			var displayInfo = $mechAbilityManager.getAbilityDisplayInfo(abilityList[i].idx);
			
			if(displayInfo.isHighlightedHandler){
				displayClass = displayInfo.isHighlightedHandler(actor, abilityList[i].level);
			}
			
			if($gameSystem.isHiddenMechAbility(actor, abilityList[i].idx)){
				displayName = "??????????";
			} else {
				displayName = displayInfo.name;
			}			
		}		
		detailContent+="<div "+descriptionData+" class='pilot_stat_container "+descriptionClass+" scaled_text scaled_width fitted_text "+displayClass+"'>";
		detailContent+="<div class='stat_value'>"+displayName+"</div>";
		detailContent+="</div>";		
		
		rowCounter++;
	}

	
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='right_items'>";
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_parts;
	detailContent+="</div>";
	
	var itemList = $statCalc.getEquipInfo(actor || this.createReferenceData(mechData));
	var rowCounter = 0;
	for(var i = 0; i < 4; i++){			
		var displayClass = "inactive";
		var displayName = "---------";
		var uniqueString = "";
		var descriptionData = "";
		var descriptionClass = "";
		if(typeof itemList[i] != "undefined" && itemList[i] != null){
			displayClass = "";
			descriptionClass = "described_element";
			descriptionData = "data-type='item' data-idx='"+itemList[i].idx+"'";
			var displayInfo = $itemEffectManager.getAbilityDisplayInfo(itemList[i].idx);
			displayName = displayInfo.name;
			
		}		
		detailContent+="<div class='ability_block_row scaled_height'>";	
		detailContent+="<div "+descriptionData+" class='pilot_stat_container "+descriptionClass+" scaled_text fitted_text "+displayClass+"'>";
		detailContent+=displayName;
		detailContent+="</div>";		
		detailContent+="</div>";	
		rowCounter++;
	}

	
	detailContent+="</div>";
	
	this._container.innerHTML = detailContent;

	var mechIcon = this._container.querySelector("#detail_list_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);
}