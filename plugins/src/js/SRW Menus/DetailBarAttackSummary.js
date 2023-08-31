import Window_CSS from "./Window_CSS.js";
import "./style/AttackList.css";

export default function DetailBarAttackSummary(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
	this._attackValidator;
}

DetailBarAttackSummary.prototype = Object.create(Window_CSS.prototype);
DetailBarAttackSummary.prototype.constructor = DetailBarAttackSummary;

DetailBarAttackSummary.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarAttackSummary.prototype.setAttackValidator = function(validator){
	this._attackValidator = validator;
}

DetailBarAttackSummary.prototype.createComponents = function(){
		
}

DetailBarAttackSummary.prototype.padCostValue = function(value){
	return String(value).padStart(3, "0");
}

DetailBarAttackSummary.prototype.redraw = function(){
	var detailContent = "";
	var attackData = this.getCurrentSelection() || {totalAmmo: -1, ENCost: -1, willRequired: -1, effects: [], MPCost: -1};
	var mechData = $gameTemp.currentMenuUnit.mech;
	var actor = $statCalc.getCurrentPilot($gameTemp.currentMenuUnit.mech.id);
	if(!actor){
		actor = this.createReferenceData($gameTemp.currentMenuUnit.mech);
	}
	var terrainStrings = $statCalc.getRealWeaponTerrainStrings(actor, attackData);
	
	var calculatedStats = mechData.stats.calculated;
	var upgradeLevels = mechData.stats.upgradeLevels;
	

	
	detailContent+="<div class='summary_flex'>";	
	
	detailContent+="<div class='summary_column'>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_ammo;
	detailContent+="</div>";
	if(attackData.totalAmmo == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="-- / --";
		detailContent+="</div>";
	} else if(attackData.currentAmmo < 0) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=attackData.currentAmmo + " / " + attackData.totalAmmo;
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=attackData.currentAmmo + " / " + attackData.totalAmmo;
		detailContent+="</div>";
	}		
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_EN_cost;
	detailContent+="</div>";
	
	var realEnCost = $statCalc.getRealENCost($gameTemp.currentMenuUnit.actor, attackData.ENCost);
	if(realEnCost == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="--- ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	} else if(calculatedStats.currentEN < realEnCost) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=this.padCostValue(realEnCost)+" ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=this.padCostValue(realEnCost)+" ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	}		
	var realMPCost = $statCalc.getRealMPCost($gameTemp.currentMenuUnit.actor, attackData.MPCost);
	if(attackData.MPCost > 0){
		let currentMP = actor.SRWStats.pilot.stats.calculated.currentMP;
		detailContent+="<div class='summary_row_label scaled_text' id='label_MP_cost'>";
		detailContent+=APPSTRINGS.ATTACKLIST.label_MP_cost;
		detailContent+="</div>";
		if(currentMP < realMPCost) {
			detailContent+="<div class='summary_row_value scaled_text insufficient'>";
			detailContent+=this.padCostValue(realMPCost)+" ("+currentMP+")";
			detailContent+="</div>";
		} else {
			detailContent+="<div class='summary_row_value scaled_text'>";
			detailContent+=this.padCostValue(realMPCost)+" ("+currentMP+")";
			detailContent+="</div>";
		}
	}
	
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_required_will;
	detailContent+="</div>";
	if(attackData.willRequired == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="--- ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	} else if($statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor) < attackData.willRequired) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=this.padCostValue(attackData.willRequired)+" ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=this.padCostValue(attackData.willRequired)+" ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	}		
	detailContent+="</div>";
	
	if(this._attackValidator){
		detailContent+="<div class='summary_row usage_detail scaled_text'>";
	
		var validationResult = this._attackValidator.validateAttack(attackData);
		if(!validationResult.canUse){
			var detail = validationResult.detail;
			
			if(detail.noComboSupport){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_combo_support;
			} else if(detail.isCounterOnly){
				detailContent+=APPSTRINGS.ATTACKLIST.label_counter_only;
			} else if(detail.isInnerCombo){
				detailContent+=APPSTRINGS.ATTACKLIST.label_inner_combo;
			} else if(detail.isSubTwinComboInit){
				detailContent+=APPSTRINGS.ATTACKLIST.label_sub_twin_combo;
			} else if(detail.ammo){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_ammo;
			} else if(detail.EN){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_EN;
			} else if(detail.MP){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_MP;
			} else if(detail.will){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_will;
			} else if(detail.postMove){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_post_move;
			} else if(detail.target){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_target;
			} else if(detail.isMap){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_map_counter;
			} else if(detail.isMap2){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_map_support;
			} else if(detail.noParticipants){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_participants;
			} else if(detail.terrain){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_terrain;
			} else if(detail.isAll){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_all;
			} else if(detail.isRegular){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_regular;
			} else if(detail.isHPGated){
				var info = APPSTRINGS.ATTACKLIST.label_HP_gated;
				info = info.replace("{HP_THRESHOLD}", attackData.HPThreshold);
				detailContent+=info;
			} else if(detail.tag){
				detailContent+=APPSTRINGS.ATTACKLIST.label_invalid_tags;
			} 		
		}
	
		detailContent+="</div>";
	}
	
	detailContent+="</div>";
	
	detailContent+="<div class='summary_column'>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_terrain_rating;
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row_value scaled_text disabled'>";
	
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
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
	
	function createEffectRow(idx){
		let detailContent = "";
		detailContent+="<div class='summary_row'>";
		detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
		detailContent+=APPSTRINGS.ATTACKLIST.label_special_effect;
		detailContent+="</div>";
		if(typeof attackData.effects[idx] == "undefined"){
			detailContent+="<div class='summary_row_value scaled_text disabled'>";
			detailContent+="------";
			detailContent+="</div>";
		} else {
			detailContent+="<div class='summary_row_value scaled_text'>";
			detailContent+=$weaponEffectManager.getAbilityDisplayInfo(attackData.effects[idx].idx).name;
			if(attackData.effects[idx].targeting != "all"){
				if(attackData.effects[idx].targeting == "enemy"){
					detailContent+="["+APPSTRINGS.ATTACKLIST.label_target_enemies+"]";
				}
				if(attackData.effects[idx].targeting == "ally"){
					detailContent+="["+APPSTRINGS.ATTACKLIST.label_target_allies+"]";
				}
			}
			detailContent+="</div>";
		}		
		detailContent+="</div>";
		return detailContent;		
	}
	detailContent+=createEffectRow(0);
	detailContent+=createEffectRow(1);
	

	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_upgrades;
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row_value scaled_text disabled'>";
	detailContent+=this.createUpgradeBarScaled(upgradeLevels.weapons);
	detailContent+="</div>";
		
	detailContent+="</div>";	
		
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	this._container.innerHTML = detailContent;
}