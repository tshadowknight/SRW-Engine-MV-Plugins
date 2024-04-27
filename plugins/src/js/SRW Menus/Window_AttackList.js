import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import MapAttackPreview from "./MapAttackPreview.js";
import "./style/Window_AttackList.css"

export default function Window_AttackList() {
	this.initialize.apply(this, arguments);	
}

Window_AttackList.prototype = Object.create(Window_CSS.prototype);
Window_AttackList.prototype.constructor = Window_AttackList;

Window_AttackList.prototype.initialize = function() {
	
	this._layoutId = "attack_list";	
	this._pageSize = 1;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_AttackList.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;	
}

Window_AttackList.prototype.validateAttack = function(attack) {
	var actor = this.getCurrentSelection().actor;
	var isPostMoveOnly = $gameTemp.isPostMove && !$gameTemp.isEnemyAttack;	
	var rangeTarget;
	//if($gameTemp.isEnemyAttack){
	if($gameTemp.currentBattleEnemy){
		rangeTarget = $gameTemp.currentBattleEnemy;
	}
	return $statCalc.canUseWeaponDetail(actor, attack, isPostMoveOnly, rangeTarget, $gameTemp.allAttackSelectionRequired);	
}

Window_AttackList.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.ATTACKLIST.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._weaponInfoContainer = document.createElement("div");
	this._weaponInfoContainer.classList.add("list_detail");	
	this._weaponInfoContainer.classList.add("weapon_info");
	windowNode.appendChild(this._weaponInfoContainer);	
	
	this._attackList = new AttackList(this._weaponInfoContainer, this);
	this._attackList.setView("summary");
	this._attackList.enableSelection();
	this._attackList.createComponents();	
	this._attackList.setAttackValidator(this);
	this._attackList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._attackList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._attackList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._attackList.registerObserver("redraw", function(){_this.requestRedraw();});
	
	this._weaponDetailContainer = document.createElement("div");
	this._weaponDetailContainer.classList.add("list_detail");	
	this._weaponDetailContainer.classList.add("weapon_detail");
	windowNode.appendChild(this._weaponDetailContainer);	
	
	this._attackSummary = new DetailBarAttackSummary(this._weaponDetailContainer, this._attackList);
	this._attackSummary.createComponents();		
	this._attackSummary.setAttackValidator(this);
	
	this._mechNameDisplayWeapons = document.createElement("div");	
	this._mechNameDisplayWeapons.classList.add("upgrade_mech_name");
	
	this._mapAttackPreview = document.createElement("div");
	this._mapAttackPreview.id = this.createId("map_preview");
	this._mapAttackPreview.classList.add("map_preview");	
	windowNode.appendChild(this._mapAttackPreview);	
	
	this._mapAttackPreviewHandler = new MapAttackPreview(this._mapAttackPreview);
	
	windowNode.appendChild(this._mechNameDisplayWeapons);
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
	
}	

var Window_CSS_prototype_show = Window_CSS.prototype.show;
Window_AttackList.prototype.show = function() {
	this._attackList.resetSelection();
	Window_CSS_prototype_show.call(this);	
};

Window_AttackList.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			
			this._attackList.incrementSelection();
			return;
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();
		    
			this._attackList.decrementSelection();
			return;
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left') || this._touchLeft){
			this.requestRedraw();			
			this._attackList.decrementPage();	
			this.resetTouchState();
			return;	
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight) {
			this.requestRedraw();			
			this._attackList.incrementPage();	
			this.resetTouchState();
			return;	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			return;
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			return;
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			return;
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			return;
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			return;
		} 	
		
		if(Input.isTriggered('ok') || this._touchOK){
			var attack = this._attackList.getCurrentSelection();   
			var validationResult = this.validateAttack(attack);
			if(validationResult.canUse){	
				$gameTemp.buttonHintManager.hide();
				SoundManager.playOk();
				if(this._callbacks["selected"]){
					this._callbacks["selected"](this._attackList.getCurrentSelection());
				}
			} else {
				SoundManager.playCancel();
			}	
			this.resetTouchState();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){		
			SoundManager.playCancel();
			$gameTemp.popMenu = true;	
			$gameTemp.buttonHintManager.hide();
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}
			this.resetTouchState();
			return;	
		}		
		
		this.refresh();
	}		
};



Window_AttackList.prototype.redraw = function() {
	//this._mechList.redraw();	

	$gameTemp.buttonHintManager.setHelpButtons([["select_list_weapon"],["page_nav"], ["confirm_weapon"]]);
	$gameTemp.buttonHintManager.show();

	this._attackList.redraw();
	this._attackSummary.redraw();
	
	var mechNameContent = "";
	mechNameContent+="<div id='detail_pages_weapons_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+this.getCurrentSelection().mech.classData.name+"</div>";//icon 	
	this._mechNameDisplayWeapons.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#detail_pages_weapons_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);	
	
	var attack = this._attackList.getCurrentSelection(); 
	this._mapAttackPreview.classList.remove("active");
	
	
	
	if(attack && attack.isMap){
		this._mapAttackPreview.classList.add("active");
		this.updateScaledDiv(this._mapAttackPreview);
		this._mapAttackPreviewHandler.showPreview(attack);
	}
	
	
	
	Graphics._updateCanvas();
}