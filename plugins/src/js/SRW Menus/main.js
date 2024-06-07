import CSSUIManager from "./CSSUIManager.js";
window.CSSUIManager = CSSUIManager;

import Window_Intermission from "./Window_Intermission.js";
window.Window_Intermission = Window_Intermission;

import Window_MechList from "./Window_MechList.js";
window.Window_MechList = Window_MechList;

import Window_UpgradeUnitSelection from "./Window_UpgradeUnitSelection.js";
window.Window_UpgradeUnitSelection = Window_UpgradeUnitSelection;

import Window_UpgradeMech from "./Window_UpgradeMech.js";
window.Window_UpgradeMech = Window_UpgradeMech;

import Window_PilotList from "./Window_PilotList.js";
window.Window_PilotList = Window_PilotList;

import Window_UpgradePilotSelection from "./Window_UpgradePilotSelection.js";
window.Window_UpgradePilotSelection = Window_UpgradePilotSelection;

import Window_BattleBasic from "./Window_BattleBasic.js";
window.Window_BattleBasic = Window_BattleBasic;

import Window_UpgradePilot from "./Window_UpgradePilot.js";
window.Window_UpgradePilot = Window_UpgradePilot;

import Window_EquipItem from "./Window_EquipItem.js";
window.Window_EquipItem = Window_EquipItem;

import Window_SellItem from "./Window_SellItem.js";
window.Window_SellItem = Window_SellItem;

import Window_EquipMechSelection from "./Window_EquipMechSelection.js";
window.Window_EquipMechSelection = Window_EquipMechSelection;

import Window_SpiritActivation from "./Window_SpiritActivation.js";
window.Window_SpiritActivation = Window_SpiritActivation;

import Window_DetailPages from "./Window_DetailPages.js";
window.Window_DetailPages = Window_DetailPages;

import Window_AttackList from "./Window_AttackList.js";
window.Window_AttackList = Window_AttackList;

import Window_Rewards from "./Window_Rewards.js";
window.Window_Rewards = Window_Rewards;

import Window_LevelUp from "./Window_LevelUp.js";
window.Window_LevelUp = Window_LevelUp;

import Window_SpiritSelection from "./Window_SpiritSelection.js";
window.Window_SpiritSelection = Window_SpiritSelection;

import Window_SpiritSelectionBeforeBattle from "./Window_SpiritSelectionBeforeBattle.js";
window.Window_SpiritSelectionBeforeBattle = Window_SpiritSelectionBeforeBattle;

import Window_UnitSummary from "./Window_UnitSummary.js";
window.Window_UnitSummary = Window_UnitSummary;

import Window_TerrainDetails from "./Window_TerrainDetails.js";
window.Window_TerrainDetails = Window_TerrainDetails;

import Window_Deployment from "./Window_Deployment.js";
window.Window_Deployment = Window_Deployment;

import Window_DeploymentInStage from "./Window_DeploymentInStage.js";
window.Window_DeploymentInStage = Window_DeploymentInStage;

import Window_DeploySelection from "./Window_DeploySelection.js";
window.Window_DeploySelection = Window_DeploySelection;

import Window_ConfirmEndTurn from "./Window_ConfirmEndTurn.js";
window.Window_ConfirmEndTurn = Window_ConfirmEndTurn;

import Window_MechListDeployed from "./Window_MechListDeployed.js";
window.Window_MechListDeployed = Window_MechListDeployed;

import Window_SelectReassignMech from "./Window_SelectReassignMech.js";
window.Window_SelectReassignMech = Window_SelectReassignMech;

import Window_SelectReassignPilot from "./Window_SelectReassignPilot.js";
window.Window_SelectReassignPilot = Window_SelectReassignPilot;


import Window_BeforeBattle from "./Window_BeforebattleTwin.js";
window.Window_BeforeBattle = Window_BeforeBattle;

import Window_BeforebattleTwin from "./Window_BeforebattleTwin.js";
window.Window_BeforebattleTwin = Window_BeforebattleTwin;

import Window_DeploymentTwin from "./Window_DeploymentTwin.js";
window.Window_DeploymentTwin = Window_DeploymentTwin;

import Window_Search from "./Window_Search.js";
window.Window_Search = Window_Search;

import Window_Options from "./Window_Options.js";
window.Window_Options = Window_Options;

import Window_MapButtons from "./Window_MapButtons.js";
window.Window_MapButtons = Window_MapButtons;

import Window_OpeningCrawl from "./Window_OpeningCrawl.js";
window.Window_OpeningCrawl = Window_OpeningCrawl;

import Window_TextLog from "./Window_TextLog.js";
window.Window_TextLog = Window_TextLog;

import Window_ZoneStatus from "./Window_ZoneStatus.js";
window.Window_ZoneStatus = Window_ZoneStatus;

import Window_ZoneSummary from "./Window_ZoneSummary.js";
window.Window_ZoneSummary = Window_ZoneSummary;	

import Window_EquipWeaponSelection from "./Window_EquipWeaponSelection.js";
window.Window_EquipWeaponSelection = Window_EquipWeaponSelection;

import Window_EquipWeapon from "./Window_EquipWeapon.js";
window.Window_EquipWeapon= Window_EquipWeapon;

import Window_UpgradeEquipWeapon from "./Window_UpgradeEquipWeapon.js";
window.Window_UpgradeEquipWeapon= Window_UpgradeEquipWeapon;

import Window_Game_Modes from "./Window_Game_Modes.js";
window.Window_Game_Modes= Window_Game_Modes;

import Window_ButtonHints from "./Window_ButtonHints.js";
window.Window_ButtonHints= Window_ButtonHints;

import Window_ModeSelection from "./Window_ModeSelection.js";
window.Window_ModeSelection= Window_ModeSelection;

import Window_Attribute_Chart from "./Window_Attribute_Chart.js";
window.Window_Attribute_Chart = Window_Attribute_Chart;


import "./style/SRW_Menus.css";


import Window_CSS from "./Window_CSS.js";

Graphics.getPreviewWindowWidth = function(){
	if($gameTemp && $gameTemp.editMode){
		var previewWindow = document.querySelector("#attack_editor .preview_window");
		if(previewWindow){
			return previewWindow.getBoundingClientRect().width;
		}
	}
	return 1110;
}

Graphics.updatePreviewWindowWidth = function(){
	if($gameTemp && $gameTemp.editMode){
		var previewWindow = document.querySelector("#attack_editor .preview_window");
		var previewWindowContainer = document.querySelector("#attack_editor .preview_window_container");
		if(previewWindowContainer && previewWindow){
			var targetWidth = Math.min(previewWindowContainer.getBoundingClientRect().width, 1110);
			previewWindow.style.width = targetWidth + "px";
			previewWindow.style.height = 624 * (targetWidth / 1110) + "px";
		}
	}	
}

Graphics._getCurrentWidth = function(){
	if(!$gameTemp || !$gameTemp.editMode){
		return this._width * this._realScale;
	} else {
		return Graphics.getPreviewWindowWidth();
	}	
}

Graphics._getCurrentHeight = function(){	
	return this._height * this._realScale;		
}

Graphics.getOriginalWidth = function(){
	return this._width;
}

Graphics.getScale = function(){
	if(!$gameTemp || !$gameTemp.editMode){
		return this._realScale * (this.getOriginalWidth() / 1110);
	} else {
		return 1 * (Graphics.getPreviewWindowWidth() / 1110);
	}
}

Graphics.getVerticalScale = function(){
	return this._realScale * (this._height / 624);	
}


Graphics._createErrorPrinter = function() {
    this._errorPrinter = document.createElement('p');
    this._errorPrinter.id = 'ErrorPrinter';
	this._errorPrinter.style.pointerEvents = "none";
    this._updateErrorPrinter();
    document.body.appendChild(this._errorPrinter);
};



