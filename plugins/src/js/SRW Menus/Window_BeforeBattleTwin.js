import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_Beforebattle.css";

export default function Window_BeforebattleTwin() {
	this.initialize.apply(this, arguments);	
}

Window_BeforebattleTwin.prototype = Object.create(Window_CSS.prototype);
Window_BeforebattleTwin.prototype.constructor = Window_BeforebattleTwin;

Window_BeforebattleTwin.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "before_battle";	
	this._pageSize = 1;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	this._currentAction = "counter";
	this._currentSelection = 0;
	this._currentActionSelection = 0;
	this._currentSupportSelection = 0;
	this._currentTwinTargetSelection = 0;
	this._currentEnemySelection = 0;
	this._currentUIState = "main_selection";
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
}	

Window_BeforebattleTwin.prototype.resetSelection = function(){
	this._currentAction = "counter";
	this._currentSelection = 0;
	this._currentActionSelection = 0;
	this._currentSupportSelection = 0;
	if(this._currentUIState != "enemy_twin_target_selection"){
		//ensure that reloading the before battle window when returning from the attack window doesn't reset the current twin and enemy targeting settings
		this._currentTwinTargetSelection = 0;
		if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){			
			this._currentEnemySelection = 0;
		} else {
			this._currentEnemySelection = 1;
		}
	}		
}

Window_BeforebattleTwin.prototype.show = function(){
	Window_CSS.prototype.show.call(this);
	
	this._currentSelection = 0;
	this._currentActionSelection = 0;
	this._currentSupportSelection = 0;
	this.getWindowNode().style.display = "";
	this._longPressTimer = 20;
	this.updateButtonPermissions();
	this._battleStarting = false;
	this.redraw();
}

Window_BeforebattleTwin.prototype.isBuffingAttack = function(){
	const interactionInfo = $gameSystem.getCombatInteractionInfo($gameTemp.actorAction.attack);
	return interactionInfo.isBetweenFriendlies && interactionInfo.interactionType == Game_System.INTERACTION_STATUS;
}

Window_BeforebattleTwin.prototype.assistIsValid = function(){
	return $gameTemp.currentBattleActor.isActor() && !this.isBuffingAttack() && !$statCalc.isAI($gameTemp.currentBattleActor);
}

Window_BeforebattleTwin.prototype.counterValid = function(){
	if(!$gameTemp.enemyAction.attack){
		return true;
	}
	return $gameTemp.enemyAction.attack.enemiesCounter;
}

Window_BeforebattleTwin.prototype.updateButtonPermissions = function(){
	var _this = this;
	
	
	
	this._btnInfo.forEach(function(btnDef){
		if(btnDef.type == "action"){
			btnDef.enabled = false;
			if(!$statCalc.isAI($gameTemp.currentBattleActor) && _this.counterValid()){
				if($gameTemp.isEnemyAttack){
					btnDef.enabled = true;
				}
				if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
					btnDef.enabled = true;
				}
			}			
		}
		if(btnDef.type == "spirit"){
			btnDef.enabled = false;
			if(ENGINE_SETTINGS.BEFORE_BATTLE_SPIRITS && !$statCalc.isAI($gameTemp.currentBattleActor)){
				btnDef.enabled = true;
			}			
		}
		
		if(btnDef.type == "assist"){
			btnDef.enabled = _this.assistIsValid();
		}
	});
}

Window_BeforebattleTwin.prototype.isALLContext = function(){
	return $gameTemp.currentTargetingSettings.actor == "all" || $gameTemp.currentTargetingSettings.actorTwin == "all";
}

Window_BeforebattleTwin.prototype.incrementMainSelection = function(){
	this._currentSelection++;
	
	if(this._currentSelection >= this._btnInfo.length){
		this._currentSelection = 0;
	}
	
	var ctr = 0;
	while(ctr < this._btnInfo.length && !this._btnInfo[this._currentSelection].enabled){
		this._currentSelection++;
		ctr++;
		if(this._currentSelection >= this._btnInfo.length){
			this._currentSelection = 0;
		}
	}
}

Window_BeforebattleTwin.prototype.decrementMainSelection = function(){	
	this._currentSelection--;
	
	if(this._currentSelection < 0){
		this._currentSelection = this._btnInfo.length - 1;
	}
	
	var ctr = 0;
	while(ctr < this._btnInfo.length && !this._btnInfo[this._currentSelection].enabled){
		this._currentSelection--;
		ctr++;
		if(this._currentSelection < 0){
			this._currentSelection = this._btnInfo.length - 1;
		}
	}
}

Window_BeforebattleTwin.prototype.incrementActionSelection = function(){
	this._currentActionSelection++;
	if(this._currentActionSelection >= 3){
		this._currentActionSelection = 0;
	}
}

Window_BeforebattleTwin.prototype.decrementActionSelection = function(){
	this._currentActionSelection--;
	if(this._currentActionSelection < 0){
		this._currentActionSelection = 2;
	}
}


Window_BeforebattleTwin.prototype.getMaxSupportSelection = function(){
	if($gameTemp.isEnemyAttack){
		return $gameTemp.supportDefendCandidates.length + 1;
	} else {
		return $gameTemp.supportAttackCandidates.length + 1;
	}
}

Window_BeforebattleTwin.prototype.incrementSupportSelection = function(){
	this._currentSupportSelection++;
	if(this._currentSupportSelection >= this.getMaxSupportSelection()){
		this._currentSupportSelection = 0;
	}
}

Window_BeforebattleTwin.prototype.decrementSupportSelection = function(){
	this._currentSupportSelection--;
	if(this._currentSupportSelection < 0){
		this._currentSupportSelection = this.getMaxSupportSelection() - 1;
	}
}

Window_BeforebattleTwin.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	if(ENGINE_SETTINGS.DISABLE_FULL_BATTLE_SCENE){
		windowNode.classList.add("full_scene_disabled");
	}
	
	this._btnInfo = [];
	
	windowNode.classList.add("twin");
	
	this._enemy_header = document.createElement("div");
	this._enemy_header.id = this.createId("enemy_header");
	this._enemy_header.classList.add("scaled_text");
	this._enemy_header.classList.add("faction_color");
	this._enemy_label = document.createElement("div");
	this._enemy_label.classList.add("enemy_label");
	this._enemy_header.appendChild(this._enemy_label);
	windowNode.appendChild(this._enemy_header);	
	
	this._ally_header = document.createElement("div");
	this._ally_header.id = this.createId("ally_header");
	this._ally_header.classList.add("scaled_text");
	this._ally_header.classList.add("faction_color");
	this._ally_label = document.createElement("div");
	this._ally_label.classList.add("ally_label");
	this._ally_header.appendChild(this._ally_label);	
	windowNode.appendChild(this._ally_header);	
	
	this._ally_main = document.createElement("div");
	this._ally_main.id = this.createId("ally_main");
	this._ally_main.classList.add("faction_color");
	this._ally_main.addEventListener("click", function(){
		if(!$statCalc.isAI($gameTemp.currentBattleActor)){		
			if(_this._currentUIState == "main_selection"){
				_this._currentUIState = "actor_twin_target_selection";
				_this._currentTwinTargetSelection = 0;
				_this.requestRedraw();
				_this._touchOK = true;
			}		
		}
	});
	windowNode.appendChild(this._ally_main);	
	
	this._ally_twin = document.createElement("div");
	this._ally_twin.id = this.createId("ally_twin");
	this._ally_twin.classList.add("faction_color");
	this._ally_twin.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this._currentUIState = "actor_twin_target_selection";
			_this._currentTwinTargetSelection = 1;
			_this.requestRedraw();
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._ally_twin);	
	
	this._enemy_main = document.createElement("div");
	this._enemy_main.id = this.createId("enemy_main");
	this._enemy_main.classList.add("faction_color");
	this._enemy_main.addEventListener("click", function(){
		if(_this._currentUIState == "enemy_twin_target_selection"){
			_this._currentEnemySelection = 0;
			_this.requestRedraw();
			_this._touchOK = true;
		}		
	});
	windowNode.appendChild(this._enemy_main);		
	
	this._enemy_twin = document.createElement("div");
	this._enemy_twin.id = this.createId("enemy_twin");
	this._enemy_twin.classList.add("faction_color");
	this._enemy_twin.addEventListener("click", function(){
		if(_this._currentUIState == "enemy_twin_target_selection"){
			_this._currentEnemySelection = 1;
			_this.requestRedraw();
			_this._touchOK = true;
		}		
	});
	windowNode.appendChild(this._enemy_twin);	
	
	this._btn_start = document.createElement("div");
	this._btn_start.id = this.createId("btn_start");
	this._btn_start.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_start_battle;
	this._btn_start.classList.add("action_btn");
	this._btn_start.classList.add("scaled_text");
	this._btn_start.setAttribute("action_id", 0);
	this._btn_start.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this.requestRedraw();
			_this._currentSelection = 0;
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._btn_start);	
	
	this._btnInfo.push({type: "start", elem: this._btn_start, enabled: true, action: 0});
	
	this._btn_demo = document.createElement("div");
	this._btn_demo.id = this.createId("btn_demo");
	this._btn_demo.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_demo_off;
	this._btn_demo.classList.add("action_btn");
	this._btn_demo.classList.add("scaled_text");
	this._btn_demo.setAttribute("action_id", 1);
	this._btn_demo.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this.requestRedraw();
			_this._currentSelection = 1;
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._btn_demo);	
	
	this._btnInfo.push({type: "demo", elem: this._btn_demo, enabled: !ENGINE_SETTINGS.DISABLE_FULL_BATTLE_SCENE, action: 1});
	
	this._btn_assist = document.createElement("div");
	this._btn_assist.id = this.createId("btn_asssist");
	this._btn_assist.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_select_assist;
	this._btn_assist.classList.add("action_btn");
	this._btn_assist.classList.add("scaled_text");
	this._btn_assist.setAttribute("action_id", 2);
	this._btn_assist.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this.requestRedraw();
			_this._currentSelection = 2;
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._btn_assist);	
	
	this._btnInfo.push({type: "assist", elem: this._btn_assist, enabled: true, action: 2});
	
	this._btn_action = document.createElement("div");
	this._btn_action.id = this.createId("btn_action");
	this._btn_action.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_select_action;
	this._btn_action.classList.add("action_btn");
	this._btn_action.classList.add("scaled_text");
	this._btn_action.setAttribute("action_id", 3);
	this._btn_action.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this.requestRedraw();
			_this._currentSelection = 3;
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._btn_action);
	
	this._btnInfo.push({type: "action", elem: this._btn_action, enabled: true, action: 3});
	
	this._btn_spirit = document.createElement("div");
	this._btn_spirit.id = this.createId("btn_spirit");
	this._btn_spirit.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_sprits;
	this._btn_spirit.classList.add("action_btn");
	this._btn_spirit.classList.add("scaled_text");
	this._btn_spirit.setAttribute("action_id", 4);
	this._btn_spirit.addEventListener("click", function(){
		if(_this._currentUIState == "main_selection"){
			_this.requestRedraw();
			_this._currentSelection = 4;
			_this._touchOK = true;
		}
	});
	windowNode.appendChild(this._btn_spirit);
	
	this._btnInfo.push({type: "spirit", elem: this._btn_spirit, enabled: true, action: 4});

	this._support_selection = document.createElement("div");
	this._support_selection.id = this.createId("support_selection");
	windowNode.appendChild(this._support_selection);		
	
	this._action_selection = document.createElement("div");
	this._action_selection.id = this.createId("action_selection");
	this._action_selection.classList.add("scaled_text");
	
	windowNode.appendChild(this._action_selection);

	this._ally_support_1 = document.createElement("div");
	this._ally_support_1.id = this.createId("ally_support_1");
	this._ally_support_1.classList.add("faction_color");
	windowNode.appendChild(this._ally_support_1);

	this._ally_support_2 = document.createElement("div");
	this._ally_support_2.id = this.createId("ally_support_2");
	this._ally_support_2.classList.add("faction_color");
	windowNode.appendChild(this._ally_support_2);	

	this._enemy_support_1 = document.createElement("div");
	this._enemy_support_1.id = this.createId("enemy_support_1");
	this._enemy_support_1.classList.add("faction_color");
	windowNode.appendChild(this._enemy_support_1);

	this._enemy_support_2 = document.createElement("div");
	this._enemy_support_2.id = this.createId("enemy_support_2");
	this._enemy_support_2.classList.add("faction_color");
	windowNode.appendChild(this._enemy_support_2);		
	
	this._targeting_arrows_1 = document.createElement("img");
	this._targeting_arrows_1.id = this.createId("targeting_arrows_1");
	this._targeting_arrows_1.setAttribute("data-img", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_1);	
	
	this._targeting_arrows_2 = document.createElement("img");
	this._targeting_arrows_2.id = this.createId("targeting_arrows_2");
	this._targeting_arrows_2.setAttribute("data-img", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_2);	
	
	this._targeting_arrows_enemy_1 = document.createElement("img");
	this._targeting_arrows_enemy_1.id = this.createId("targeting_arrows_enemy_1");
	this._targeting_arrows_enemy_1.setAttribute("data-img", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_enemy_1);	
	
	this._targeting_arrows_enemy_2 = document.createElement("img");
	this._targeting_arrows_enemy_2.id = this.createId("targeting_arrows_enemy_2");
	this._targeting_arrows_enemy_2.setAttribute("data-img", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_enemy_2);	
	
	this.new_attack_inidicator = document.createElement("div");
	this.new_attack_inidicator.id = this.createId("new_attack_inidicator");
	this.new_attack_inidicator.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_new_move;
	this.new_attack_inidicator.classList.add("scaled_text");
	this.new_attack_inidicator.classList.add("glowing_elem");
	
	
	windowNode.appendChild(this.new_attack_inidicator);	
	
	if(!ENGINE_SETTINGS.SHOW_NEW_MOVE_INDICATOR){
		this.new_attack_inidicator.style.display = "none";
	}
	
}	

Window_BeforebattleTwin.prototype.update = function() {	
	Window_Base.prototype.update.call(this);
	var _this = this;
	this.updateGlow();
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			
			//this._attackList.incrementSelection();
			if(this._currentUIState == "support_selection"){
				SoundManager.playCursor();
				_this.incrementSupportSelection()
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCursor();
				_this.incrementActionSelection();
			} else if(this._currentUIState == "actor_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentTwinTargetSelection++;
			
				if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
					if(_this._currentTwinTargetSelection > 1){
						_this._currentTwinTargetSelection = 0;
						_this._currentUIState = "main_selection";
					}
				} else {
					if(_this._currentTwinTargetSelection > 0){
						_this._currentTwinTargetSelection = 0;
						_this._currentUIState = "main_selection";
					}
				}
				
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentEnemySelection++;
				
				if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
					if(_this._currentEnemySelection > 1){
						_this._currentEnemySelection = 1;
					}
				} else {
					if(_this._currentEnemySelection > 0){
						_this._currentEnemySelection = 0;
					}
				}				
			}
			this.refresh();
			return;
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    
			//this._attackList.decrementSelection();
			if(this._currentUIState == "support_selection"){
				SoundManager.playCursor();
				_this.decrementSupportSelection()
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCursor();
				_this.decrementActionSelection();
			} else if(this._currentUIState == "main_selection"){
				//if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
					if(!$statCalc.isAI($gameTemp.currentBattleActor)){
						SoundManager.playCursor();
						if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
							_this._currentTwinTargetSelection = 1;
						} else {
							_this._currentTwinTargetSelection = 0;
						}					
						_this._currentUIState = "actor_twin_target_selection";
					}					
				//}				
			} else if(this._currentUIState == "actor_twin_target_selection"){					
				_this._currentTwinTargetSelection--;
				if(_this._currentTwinTargetSelection < 0){
					_this._currentTwinTargetSelection = 0;
				} else {
					SoundManager.playCursor();
				}
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentEnemySelection--;
				
				if(_this._currentEnemySelection < 0){
					_this._currentEnemySelection = 0;
				}
				
			}
			this.refresh();
			return;
		}		

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();			
			//this._attackList.decrementPage();		
			if(this._currentUIState == "main_selection"){
				SoundManager.playCursor();
				this.incrementMainSelection();
			}
			this.refresh();
			return;
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();			
			//this._attackList.incrementPage();		
			if(this._currentUIState == "main_selection"){
				SoundManager.playCursor();
				this.decrementMainSelection();
			}
			this.refresh();
			return;
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			return;
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			this.refresh();
			return;
		}
		
		function quickUpdateActorAction(){
			if(_this._currentActionSelection == 0){
				$gameTemp.actorAction.type = "attack";				
			}
			if(_this._currentActionSelection == 1){
				$gameTemp.actorAction.type = "defend";					
			}
			if(_this._currentActionSelection == 2){
				$gameTemp.actorAction.type = "evade";
			}
		}		
		
		if(!Input.isTriggered('ok') && !Input.isLongPressed('ok') && !Input.isPressed('ok')){
			if(!$statCalc.isAI($gameTemp.currentBattleActor)){			
				if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
					this.requestRedraw();
					if(this._currentUIState == "main_selection"){
						if(_this.counterValid() && $gameTemp.currentBattleActor.isActor() && $gameTemp.isEnemyAttack){
							_this._currentActionSelection--;
							if(_this._currentActionSelection < 0){
								_this._currentActionSelection = 2;
							}
							if(_this._currentActionSelection == 0 && !$gameTemp.actorAction.attack){
								_this._currentActionSelection = 1;
							}
							quickUpdateActorAction();
						}
					}
					this.refresh();
					return;
				} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
					this.requestRedraw();
					if(this._currentUIState == "main_selection"){
						if(_this.counterValid() && $gameTemp.currentBattleActor.isActor() && $gameTemp.isEnemyAttack){
							_this._currentActionSelection++;
							if(_this._currentActionSelection > 2){
								_this._currentActionSelection = 0;
							}
							if(_this._currentActionSelection == 0 && !$gameTemp.actorAction.attack){
								_this._currentActionSelection = 2;
							}
							quickUpdateActorAction();
						}
					}		
					this.refresh();
					return;				
				}	
			}	
		}		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();			
		} 	
		
		if(this._longPressTimer <= 0 && (Input.isLongPressed('ok') || ((Input.isPressed('ok') && Input.isRepeated('pageup')) || (Input.isPressed('ok') && Input.isRepeated('pagedown'))))){
			if(this._currentSelection == 0){
				this._battleStarting = true;
				if(this._callbacks["selected"]){
					this._callbacks["selected"]();
				}	
				setTimeout(function(){_this.getWindowNode().style.display = "none"; _this.close()}, 1000); //hack to make sure the pre battle window is hidden after returning from the battle scene
			}
		}	
		this._longPressTimer--;
		
		if(Input.isTriggered('ok') || this._touchOK){	
			//$gameTemp.popMenu = true;	
			if(this._currentUIState == "main_selection"){
				if(this._currentSelection == 0){
					this._battleStarting = true;
					if(this._callbacks["selected"]){
						this._callbacks["selected"]();
					}	
					setTimeout(function(){_this.getWindowNode().style.display = "none"; _this.close()}, 1000); //hack to make sure the pre battle window is hidden after returning from the battle scene
				}
				if(this._currentSelection == 1){
					this.requestRedraw();
					$gameSystem.demoSetting = !$gameSystem.demoSetting;
				}
				if(this._currentSelection == 2){
					SoundManager.playOk();
					this.requestRedraw();
					_this._currentUIState = "support_selection";
					if($gameTemp.isEnemyAttack){
						_this._currentSupportSelection = $gameTemp.supportDefendSelected + 1;
					} else {
						_this._currentSupportSelection = $gameTemp.supportAttackSelected + 1;
					}
					
				}
				if(this._currentSelection == 3){
					
					this.requestRedraw();	
					
					if(!$statCalc.isAI($gameTemp.currentBattleActor)){
						SoundManager.playCursor();
						if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
							_this._currentTwinTargetSelection = 1;
							_this._currentUIState = "actor_twin_target_selection";
							SoundManager.playOk();
						} else if(!$statCalc.isDisabled($gameTemp.currentBattleActor)){
							_this._currentUIState = "action_selection";
							if($gameTemp.actorAction.type == "attack"){
								_this._currentActionSelection = 0;
								SoundManager.playOk();						
							}
							if($gameTemp.actorAction.type == "defend"){
								_this._currentActionSelection = 1;
								SoundManager.playOk();
							}
							if($gameTemp.actorAction.type == "evade"){
								_this._currentActionSelection = 2;
								SoundManager.playOk();
							}
							
						} else {
							SoundManager.playBuzzer();
						}						
					}
				}
				
				if(this._currentSelection == 4){
					SoundManager.playOk();
					this.requestRedraw();	
					
					if(!$statCalc.isAI($gameTemp.currentBattleActor)){
						SoundManager.playCursor();						
						_this._currentUIState = "actor_spirit_selection";
						$gameTemp.pushMenu = "spirit_selection_before_battle";
						
						var storedMenuUnit = $gameTemp.currentMenuUnit;
						$gameTemp.currentMenuUnit = {mech: $gameTemp.currentBattleActor.SRWStats.mech, actor: $gameTemp.currentBattleActor};
				
						function spiritsApplied(){
							$gameTemp.playingSpiritAnimations = false;
							_this._currentUIState = "main_selection";
							$gameTemp.popMenu = true;
							$gameTemp.currentMenuUnit = storedMenuUnit;
							_this.requestRedraw();	
						}
						
						$gameTemp.beforeBattleSpiritWindowSelected = function(scene, spiritInfo){							
							$gameTemp.popMenu = true;	
							scene.handleSpiritSelection(spiritInfo, spiritsApplied);
						}	

						$gameTemp.beforeBattleSpiritWindowSelectedMultiple = function(scene, spirits){							
							$gameTemp.popMenu = true;	
							scene.handleMultipleSpiritSelection(spirits, spiritsApplied);
						}	
						
						$gameTemp.beforeBattleSpiritWindowClosed = spiritsApplied;
					}
				}
			} else if(this._currentUIState == "support_selection"){
				SoundManager.playOk();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
				if($gameTemp.isEnemyAttack){
					$gameTemp.supportDefendSelected = _this._currentSupportSelection - 1;
				} else {
					$gameTemp.supportAttackSelected = _this._currentSupportSelection - 1;
					if(_this._currentSupportSelection != 0){
						var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];	
						if($gameTemp.currentTargetingSettings.actor == "all"){
							$gameTemp.allAttackSelectionRequired = 1;
						} else {
							$gameTemp.allAttackSelectionRequired = -1;
						}
						$gameTemp.currentMenuUnit = {
							actor: supporter.actor,
							mech: supporter.actor.SRWStats.mech
						};
						$gameTemp.attackWindowCallback = function(attack){

							$gameTemp.popMenu = true;	
							supporter.action.type = "attack";
							supporter.action.attack = attack;
							if($statCalc.isMainTwin(supporter.actor)){
								var twinPos = {
									x: supporter.actor.event.posX(),
									y: supporter.actor.event.posY(),
								};
								
								var targetPos = {
									x: $gameTemp.currentBattleEnemy.event.posX(),
									y: $gameTemp.currentBattleEnemy.event.posY()
								};
								
								if($battleCalc.getBestWeapon({actor: supporter.actor.subTwin, pos: twinPos}, {actor: $gameTemp.currentBattleEnemy, pos: targetPos}, false, false, false)){
										$gameTemp.currentMenuUnit = {
										actor: supporter.actor.subTwin,
										mech: supporter.actor.subTwin.SRWStats.mech
									};
									$gameTemp.attackWindowCallback = function(attack){
										$gameTemp.popMenu = true;	
										$gameTemp.twinSupportAttack = {actor: supporter.actor.subTwin, action: {type: "attack", attack: attack}}
										$gameTemp.allAttackSelectionRequired = false;
										_this._currentSelection = 0;
										_this.requestRedraw();	
									};
									$gameTemp.pushMenu = "attack_list";
								} else {
									$gameTemp.allAttackSelectionRequired = false;
									$gameTemp.twinSupportAttack = null;
									_this._currentSelection = 0;
									_this.requestRedraw();	
								}								
							} else {
								$gameTemp.allAttackSelectionRequired = false;
								$gameTemp.twinSupportAttack = null;
								_this._currentSelection = 0;
								_this.requestRedraw();	
							}
													
						};	
						$gameTemp.attackWindowCancelCallback = function(){
							$gameTemp.allAttackSelectionRequired = false;
						}	
						$gameTemp.pushMenu = "attack_list";
						return;
					}  else {
						$gameTemp.twinSupportAttack = null;
					}		
				}
			} else if(this._currentUIState == "action_selection"){
				
				
				this.requestRedraw();
				if(_this._currentActionSelection == 0){
					if($statCalc.hasWeapons($gameTemp.currentBattleActor)){
						_this._currentUIState = "main_selection";
						SoundManager.playOk();
						$gameTemp.actorAction.type == "attack";
						$gameTemp.allAttackSelectionRequired = false;
						if(_this._currentTwinTargetSelection == 0){
							$gameTemp.currentMenuUnit = {
								actor: $gameTemp.currentBattleActor,
								mech: $gameTemp.currentBattleActor.SRWStats.mech
							};
						} else {
							if($gameTemp.currentTargetingSettings.actor == "all"){
								$gameTemp.allAttackSelectionRequired = 1;
							} else {
								$gameTemp.allAttackSelectionRequired = -1;
							}
							$gameTemp.currentMenuUnit = {
								actor: $gameTemp.currentBattleActor.subTwin,
								mech: $gameTemp.currentBattleActor.subTwin.SRWStats.mech
							};
						}
						$gameTemp.attackWindowCallback = function(attack){
							$gameTemp.popMenu = true;	
							var allSelected = false;
							var allRequired = 0;
							if(_this._currentTwinTargetSelection == 0){
								$gameTemp.actorAction.type = "attack";
								$gameTemp.actorAction.attack = attack;
								if(attack.isAll){												
									$gameTemp.currentTargetingSettings.actor = "all";
									allSelected = true;
									allRequired = 1;
								} else {
									allRequired = -1;
								} 
								var target;
								if($gameTemp.currentBattleEnemy.subTwin){
									target = $gameTemp.currentBattleEnemy.subTwin;
								} else {
									target = $gameTemp.currentBattleEnemy;
								}
								if($gameTemp.currentBattleActor.subTwin){
									var enemyInfo = {actor: $gameTemp.currentBattleEnemy, pos: {x: $gameTemp.currentBattleEnemy.event.posX(), y: $gameTemp.currentBattleEnemy.event.posY()}};
									var actorInfo = {actor: $gameTemp.currentBattleActor.subTwin, pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}};

									var weaponResult = $battleCalc.getBestWeaponAndDamage(actorInfo, enemyInfo, false, false, false, allRequired);
									if(weaponResult.weapon){
										$gameTemp.actorTwinAction.type = "attack";
										$gameTemp.actorTwinAction.attack = weaponResult.weapon;
										if(allSelected){										
											$gameTemp.currentTargetingSettings.actorTwin = "all";
										} else if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.preferredActorTwinTarget == "twin"){
											$gameTemp.currentTargetingSettings.actorTwin = "twin";
										} else {									
											$gameTemp.currentTargetingSettings.actorTwin = "main";
										}
									} else if($gameTemp.actorTwinAction){
										$gameTemp.actorTwinAction.type = "defend";	
									}
								}							
							} else {
								$gameTemp.actorTwinAction.type = "attack";
								$gameTemp.actorTwinAction.attack = attack;
								
								if(!$gameTemp.isEnemyAttack){
									$gameTemp.supportAttackSelected = -1;
									$gameTemp.twinSupportAttack = null;
								}	
								if(attack.isAll){
									$gameTemp.currentTargetingSettings.actorTwin = "all";
									allSelected = true;
								}
							}
							if(allSelected || !$gameTemp.currentBattleEnemy.subTwin){
								_this._currentUIState = "main_selection";
							} else {
								
								if(_this._currentTwinTargetSelection == 0 || !$gameTemp.currentBattleActor.subTwin){
									if($gameTemp.currentTargetingSettings.actor == "main"){
										_this._currentEnemySelection = 0;
									} else {
										_this._currentEnemySelection = 1;
									}
								} else {
									if($gameTemp.currentTargetingSettings.actorTwin == "main"){
										_this._currentEnemySelection = 0;
									} else {
										_this._currentEnemySelection = 1;
									}
								}			
								
								
								_this._currentUIState = "enemy_twin_target_selection";
							}
							$gameTemp.allAttackSelectionRequired = false;
							_this._currentSelection = 0;
							_this.requestRedraw();							
						};		
						
						$gameTemp.attackWindowCancelCallback = function(){
							$gameTemp.allAttackSelectionRequired = false;
						}
						$gameTemp.pushMenu = "attack_list";
					} else {
						SoundManager.playBuzzer();
					}
				}
				if(_this._currentActionSelection == 1){
					_this._currentUIState = "main_selection";
					SoundManager.playOk();
					if(_this._currentTwinTargetSelection == 0){
						$gameTemp.actorAction.type = "defend";
						//$gameTemp.actorAction.attack = null;						
					} else {
						$gameTemp.actorTwinAction.type = "defend";	
						//$gameTemp.actorTwinAction.attack = null;
					}	
					if(!$gameTemp.isEnemyAttack){
						$gameTemp.supportAttackSelected = -1;
						$gameTemp.twinSupportAttack = null;
					}					
					_this._currentUIState = "main_selection";
				}
				if(_this._currentActionSelection == 2){
					_this._currentUIState = "main_selection";
					SoundManager.playOk();
					if(_this._currentTwinTargetSelection == 0){
						$gameTemp.actorAction.type = "evade";	
						//$gameTemp.actorAction.attack = null;	
					} else {
						$gameTemp.actorTwinAction.type = "evade";
						//$gameTemp.actorTwinAction.attack = null;							
					}	
					if(!$gameTemp.isEnemyAttack){
						$gameTemp.supportAttackSelected = -1;
						$gameTemp.twinSupportAttack = null;
					}	
					_this._currentUIState = "main_selection";
				}
			} else if(this._currentUIState == "actor_twin_target_selection"){
				
				//_this._currentUIState = "enemy_twin_target_selection";
				
				if(_this._currentTwinTargetSelection == 0){
					if(!$statCalc.isDisabled($gameTemp.currentBattleActor)){
						if($gameTemp.isEnemyAttack){
							_this._currentUIState = "action_selection";
						} else if($gameTemp.currentTargetingSettings.actor != "all"){
							if($gameTemp.currentTargetingSettings.actor == "main"){
								_this._currentEnemySelection = 0;
							} else {
								_this._currentEnemySelection = 1;
							}
							
							_this._currentUIState = "enemy_twin_target_selection";
						}
						SoundManager.playOk();
					} else {
						SoundManager.playBuzzer();
					}
				
				} else {
					if(!$statCalc.isDisabled($gameTemp.currentBattleActor.subTwin)){
						_this._currentUIState = "action_selection";
						SoundManager.playOk();
					} else {
						SoundManager.playBuzzer();
					}
				}				
				this.requestRedraw();
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playOk();
				if(_this._currentTwinTargetSelection == 0){
					if(_this._currentEnemySelection == 0){
						$gameTemp.currentTargetingSettings.actor = "main";
					} else {
						$gameTemp.currentTargetingSettings.actor = "twin";
					}
				} else {
					if(_this._currentEnemySelection == 0){
						$gameTemp.currentTargetingSettings.actorTwin = "main";
					} else {
						$gameTemp.currentTargetingSettings.actorTwin = "twin";
					}
					$gameTemp.preferredActorTwinTarget = $gameTemp.currentTargetingSettings.actorTwin;
				}
				_this._currentUIState = "main_selection";
				this.requestRedraw();
			}		
			this.refresh();
			return;	
		}
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			if(this._currentUIState == "main_selection"){
				if(!$gameTemp.isEnemyAttack && !$statCalc.isAI($gameTemp.currentBattleActor)){
					SoundManager.playCancel();
					$gameTemp.popMenu = true;	
					$gameTemp.currentBattleEnemy = null;
					if(this._callbacks["closed"]){
						this._callbacks["closed"]();
					}
				}
			} else if(this._currentUIState == "support_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "actor_twin_target_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "actor_twin_target_selection";
			}		
			this.refresh();			
			return;
		}		
		
		if(Input.isTriggered('menu')){
			this.requestRedraw();
			$gameSystem.demoSetting = !$gameSystem.demoSetting;
			this.refresh();
			return;
		}		
		
		this.refresh();
	}		
};


Window_BeforebattleTwin.prototype.createPercentIndicator = function(allyOrEnemy, action, ref, cssClass){
	var _this = this;
	var content = "";
	content+="<div class='scaled_text percent_indicator "+cssClass+"'>";
	var hitRates = [];
	var critRates = [];
	if(action.type == "attack"){	
		var initiatorType;			
		if(allyOrEnemy == "ally"){
			initiatorType = "actor";
			if(ref.isSubTwin){
				initiatorType = "actorTwin"
			}
		} else {
			initiatorType = "enemy";
			if(ref.isSubTwin){
				initiatorType = "enemyTwin"
			}
		}
	
		/*
		var initiator;			
		var initiatorAction;	
		if(initiatorType == "actor"){
			initiator = $gameTemp.currentBattleActor;
			initiatorAction = $gameTemp.actorAction;
		} else if(initiatorType == "actorTwin"){
			initiator = $gameTemp.currentBattleActor.subTwin;
			initiatorAction = $gameTemp.actorTwinAction;
		} else if(initiatorType == "enemy"){
			initiator = $gameTemp.currentBattleEnemy;
			initiatorAction = $gameTemp.enemyAction;
		} else if(initiatorType == "enemyTwin"){
			initiator = $gameTemp.currentBattleEnemy.subTwin;
			initiatorAction = $gameTemp.enemyTwinAction;
		}
		*/
		var initiator = ref;
		var initiatorAction = action;
		
		var defenderInfo = [];
		var defender;
		var defenderAction;
		var targetType = $gameTemp.currentTargetingSettings[initiatorType];
		if(allyOrEnemy == "ally"){
			if(targetType == "main"){
				defenderInfo.push({
					defender: $gameTemp.currentBattleEnemy,					
					defenderAction: $gameTemp.enemyAction
				});
			}
			if(targetType == "twin"){
				defenderInfo.push({
					defender: $gameTemp.currentBattleEnemy.subTwin,					
					defenderAction: $gameTemp.enemyTwinAction
				});
			}
			if(targetType == "all"){
				defenderInfo.push({
					defender: $gameTemp.currentBattleEnemy,					
					defenderAction: $gameTemp.enemyAction
				});
				defenderInfo.push({
					defender: $gameTemp.currentBattleEnemy.subTwin,					
					defenderAction: $gameTemp.enemyTwinAction
				});
			}
		} else {
			if(targetType == "main"){
				defenderInfo.push({
					defender: $gameTemp.currentBattleActor,					
					defenderAction: $gameTemp.actorAction
				});
			}
			if(targetType == "twin"){					
				defenderInfo.push({
					defender: $gameTemp.currentBattleActor.subTwin,					
					defenderAction: $gameTemp.actorTwinAction
				});
			}
			if(targetType == "all"){
				defenderInfo.push({
					defender: $gameTemp.currentBattleActor,					
					defenderAction: $gameTemp.actorAction
				});
				defenderInfo.push({
					defender: $gameTemp.currentBattleActor.subTwin,					
					defenderAction: $gameTemp.actorTwinAction
				});
			}
		}		
		
		var realIdx = 0;
		for(var i = 0; i < defenderInfo.length; i++){
			var hitRate = -1;
			var critRate = -1;
			if(defenderInfo[i].defender && defenderInfo[i].defenderAction){
				if(allyOrEnemy == "ally"){				
					hitRate = $battleCalc.performHitCalculation(
						{actor: initiator, action: initiatorAction, isInitiator: !$gameTemp.isEnemyAttack},
						{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: $gameTemp.isEnemyAttack}
					);					
				} else {				
					hitRate = $battleCalc.performHitCalculation(				
						{actor: initiator, action: initiatorAction, isInitiator: $gameTemp.isEnemyAttack},
						{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: !$gameTemp.isEnemyAttack}
					);			
				}			
				hitRates[realIdx] = hitRate;
				
				if(allyOrEnemy == "ally"){				
					critRate = $battleCalc.performCritCalculation(
						{actor: initiator, action: initiatorAction, isInitiator: !$gameTemp.isEnemyAttack},
						{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: $gameTemp.isEnemyAttack}
					);					
				} else {				
					critRate = $battleCalc.performCritCalculation(				
						{actor: initiator, action: initiatorAction, isInitiator: $gameTemp.isEnemyAttack},
						{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: !$gameTemp.isEnemyAttack}
					);			
				}			
				critRates[realIdx] = critRate;					
				realIdx++;
			}				
		}			
		
		
	}
	content+="<div class='percent_indicator_containers "+initiatorType+" "+(hitRates.length > 1 ? "twin" : "")+"'>";
	
	content+="<div class='target_arrow_container "+initiatorType+" "+(hitRates.length > 1 ? "twin" : "")+" "+(ref.isSubTwin ? "sub_twin" : "")+"'>";
	
	if(targetType == "all"){		
		if(realIdx > 1){//if there are actually two targets
			content+="<img class='target_arrow main' data-img='img/system/targeting1.png'>";
			content+="<img class='target_arrow twin' data-img='img/system/targeting2.png'>";
		} else if(ref.isSubTwin){
			content+="<img class='target_arrow twin' data-img='img/system/targeting2.png'>";
		} else {
			content+="<img class='target_arrow main' data-img='img/system/targeting1.png'>";
		}		
	} else if(targetType == "main"){
		if(ref.isSubTwin){
			content+="<img class='target_arrow main' data-img='img/system/targeting2.png'>";
		} else {
			content+="<img class='target_arrow main' data-img='img/system/targeting1.png'>";
		}		
	} else{		
		if(ref.isSubTwin){
			content+="<img class='target_arrow main' data-img='img/system/targeting1.png'>";
		} else {
			content+="<img class='target_arrow twin' data-img='img/system/targeting2.png'>";
		}	
	}
	
	content+="</div>";
	
	for(var i = 0; i < hitRates.length; i++){
		var hitRate = hitRates[i];
		var critRate = critRates[i];
		
		content+="<div class='percent_indicator_container'>";
		content+="<div class='entry "+initiatorType+"'>";
		if(initiatorType == "actor" || initiatorType == "actorTwin"){
			content+="<img class='scaled_width "+initiatorType+"' src='svg/crosshair.svg'>";
		}		
		content+="<div class='text'>";	
		if(hitRate == -1){
			content+="---";	
		} else {
			content+=Math.floor(hitRate * 100)+"%";	
		}			
		content+="</div>";
		if(initiatorType == "enemy" || initiatorType == "enemyTwin"){
			content+="<img class='scaled_width "+initiatorType+"' src='svg/crosshair.svg'>";
		}				
		content+="</div>";
		
		content+="<div class='entry "+initiatorType+"'>";
		if(initiatorType == "actor" || initiatorType == "actorTwin"){
			content+="<img class='scaled_width ' src='svg/arrow-scope.svg'>";
		}			
		content+="<div class='text'>";	
		if(critRate == -1){
			content+="---";	
		} else {
			content+=Math.floor(critRate * 100)+"%";	
		}
		content+="</div>";			
		if(initiatorType == "enemy" || initiatorType == "enemyTwin"){
			content+="<img class='scaled_width "+initiatorType+"' src='svg/arrow-scope.svg'>";
		}				
		content+="</div>";
		content+="</div>";
	}
	
	
	
	content+="</div>";
	
	content+="</div>";
	return content;
}

Window_BeforebattleTwin.prototype.createParticipantBlock = function(ref, action, isSupport, allyOrEnemy, participantId) {
	const _this = this;
	var content = "";
	content+="<div class='participant_block "+allyOrEnemy+"'>";
	
	var effectRef;

	if(ref._cacheReference && $gameTemp.battleEffectCache[ref._cacheReference]){
		effectRef = ref._cacheReference;
	} else if(ref._supportCacheReference && $gameTemp.battleEffectCache[ref._supportCacheReference]){
		effectRef = ref._supportCacheReference;
	}
	
	if(allyOrEnemy == "ally"){
		content+="<div data-participantid='"+participantId+"' class='mech_icon pilot'>";
		content+="</div>";
		
		if(this._unitsWithShootDown[effectRef]){
			content+="<div class='shoot_down_indicator pilot scaled_text glowing_elem' style='opacity: "+this.getGlowOpacity()+"'>";
			content+="<img src='svg/hazard-sign.svg' class='mech_icon_small'/>";
			content+="</div>";
		}
	} else {
		content+="<div data-participantid='"+participantId+"' class='mech_icon enemy'>";
		content+="</div>";
		
		if(this._unitsWithShootDown[effectRef]){
			content+="<div class='shoot_down_indicator enemy scaled_text glowing_elem' style='opacity: "+this.getGlowOpacity()+"'>";
			content+="<img src='svg/hazard-sign.svg' class='mech_icon_small'/>";
			content+="</div>";
		}
	}
	
	content+="<div class='scaled_text action_row'>";
	if(this.isBuffingAttack()){
		if(allyOrEnemy == "ally"){
			content+="Buffing";
		} else {
			content+="Receiving";
		}
	} else {
		if(!isSupport){
			if(action.type == "attack"){
				content+=APPSTRINGS.BEFORE_BATTLE.label_attack;
			}
			if(action.type == "evade"){
				content+=APPSTRINGS.BEFORE_BATTLE.label_evade;
			}
			if(action.type == "defend"){
				content+=APPSTRINGS.BEFORE_BATTLE.label_defend;
			}
			if(action.type == "none"){
				content+="---";
			}
		} else {
			if(action.type == "attack"){
				content+=APPSTRINGS.BEFORE_BATTLE.label_attack;
			}
			if(action.type == "evade"){
				content+="---";
			}
			if(action.type == "defend"){
				content+=APPSTRINGS.BEFORE_BATTLE.label_defend;
			}
			if(action.type == "none"){
				content+="---";
			}
		}
	}
	
	content+="</div>";
	content+="<div class='main_row'>";
	if(allyOrEnemy == "ally"){
		content+=this.createPercentIndicator(allyOrEnemy, action, ref);
		content+=createMainContent();
	} else {
		content+=createMainContent();
		content+=this.createPercentIndicator(allyOrEnemy, action, ref);		
	}
	
	content+=this.createAttributeEffectivenessBlock(ref, "attribute1");
	
	
	function createMainContent(){
		var content = "";
	
		content+="<div class='main_content'>";
	
		if(allyOrEnemy == "ally"){
			content+="<div data-type='"+(ref.isActor() ? "actor" : "enemy")+"' data-pilot='"+ref.SRWStats.pilot.id+"' class='pilot_icon display_icon'>";
			content+="</div>";
		} else {
			content+="<div data-type='"+(ref.isActor() ? "actor" : "enemy")+"' data-pilot='"+ref.SRWStats.pilot.id+"' class='enemy_icon display_icon'>";
			content+="</div>";		
		}				
		
		content+="<div class='pilot_name scaled_text scaled_width fitted_text'>";
		content+=ref.name();
		content+="</div>";
		
		content+="<div class='pilot_stats scaled_text'>";	
		content+="<div class='level scaled_width level_container'>";
		content+="<div class='label label_level'>";
		content+=APPSTRINGS.GENERAL.label_level;
		content+="</div>";
		content+="<div class='value value_level'>";
		content+=$statCalc.getCurrentLevel(ref);
		content+="</div>";
		content+="</div>";
		content+="<div class='will scaled_width will_container'>";
		content+="<div class='label label_will'>";
		content+=APPSTRINGS.GENERAL.label_will;
		content+="</div>";
		content+="<div class='value value_will'>";
		content+=$statCalc.getCurrentWill(ref);
		content+="</div>";
		content+="</div>";
		content+="</div>";
		
		var calculatedStats = $statCalc.getCalculatedMechStats(ref);
		
		content+="<div class='mech_hp_en_container scaled_text'>";
		content+="<div class='hp_label scaled_text'>"+APPSTRINGS.GENERAL.label_HP+"</div>";
		content+="<div class='en_label scaled_text'>"+APPSTRINGS.GENERAL.label_EN+"</div>";

		content+="<div class='hp_display'>";
		content+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(ref)+"</div>";
		
		content+="</div>";
		
		content+="<div class='en_display'>";
		content+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(ref)+"</div>";
		
		content+="</div>";
		
		var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
		content+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
		
		var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
		content+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
		content+="</div>";
		
		content+="<div class='attack_name scaled_text fitted_text "+(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM ? "with_attributes" : "")+"'>";	
		var attack = action.attack;
		if(attack && action.type == "attack"){	
			if(attack.type == "M"){
				content+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
			} else {
				content+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
			}
			if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){
				const aCache = $gameTemp.battleEffectCache[effectRef];
				if(aCache){
					const attacked = aCache.attacked;
					if(attacked){
						content+=_this.createAttributeEffectivenessBlock(ref, "attribute1", attack, attacked.ref);
					}	
				}								
			}
			
			content+="<div class=''>"+attack.name+"</div>";
		} else {
			content+="<div class=''>------</div>";
		}
		content+="</div>";	
		
		var spirits = $statCalc.getAvailableSpiritStates();
		var activeSpirits = $statCalc.getActiveSpirits(ref);
		content+="<div class='active_spirits scaled_text'>";	
		for(var i = 0; i < spirits.length; i++){
			content+="<div class='spirit_entry "+(activeSpirits[spirits[i]] ? "active" : "")+" fitted_text'>";	
			content+=spirits[i].substring(0, 3).toUpperCase();	
			content+="</div>";	
		}
		content+="</div>";	
		content+="</div>";	
		return content;
	}
	
	content+="</div>";
	content+="</div>";
	return content;
}


Window_BeforebattleTwin.prototype.createSmallParticipantBlock = function(ref, action, allyOrEnemy, participantId) {
	const _this = this;
	var content = "";
	content+="<div class='participant_block participant_block_small "+allyOrEnemy+" "+participantId+"'>";
	
	var effectRef = ref._cacheReference || ref._supportCacheReference;
	
	content+="<div class='scaled_text action_row'>";
	
	
	if(allyOrEnemy == "ally"){
		content+=this.createPercentIndicator(allyOrEnemy, action, ref, "support");
		content+="<div data-participantid='"+participantId+"' class='mech_icon_small pilot'>";
		content+="</div>";
		content+="<div data-type='"+(ref.isActor() ? "actor" : "enemy")+"' data-pilot='"+ref.SRWStats.pilot.id+"' class='pilot_icon display_icon'>";
		content+="</div>";
	} 
	
	if(action.type == "attack"){
		content+="<div class='attack_name scaled_text fitted_text "+(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM ? "with_attributes" : "")+"'>";	
		var attack = action.attack;
		if(attack && action.type == "attack"){	
			if(attack.type == "M"){
				content+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
			} else {
				content+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
			}
			if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){		
				let attacked;
				if(ref._supportCacheReference){
					let mainAttacker = $gameTemp.battleEffectCache[ref._supportCacheReference].mainAttacker;
					if(mainAttacker){				
						attacked = mainAttacker.attacked.ref;								
					}				
				}
				content+=_this.createAttributeEffectivenessBlock(ref, "attribute1", attack, attacked);
			}
			
			content+="<div class=''>"+attack.name+"</div>";
		} else {
			content+="<div class=''>------</div>";
		}
		content+="</div>";
	}
	/*if(action.type == "evade"){
		content+="---";
	}*/
	if(action.type == "defend"){		
		content+="<div class='attack_name fitted_text'>";	
		content+="Support Defend";
		content+="</div>";
		
		if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){		
			let attacked;
			if(ref._supportCacheReference){
				let mainAttacker = $gameTemp.battleEffectCache[ref._supportCacheReference].mainAttacker;
				if(mainAttacker){				
					attacked = mainAttacker.attacked.ref;								
				}				
			}
			content+=_this.createAttributeEffectivenessBlock(ref, "attribute1", attack, attacked);
		}
	}
	/*if(action.type == "none"){
		content+="---";
	}*/
	
	if(allyOrEnemy == "enemy"){
		content+="<div data-type='"+(ref.isActor() ? "actor" : "enemy")+"' data-pilot='"+ref.SRWStats.pilot.id+"' class='enemy_icon display_icon'>";
		content+="</div>";
		content+="<div data-participantid='"+participantId+"' class='mech_icon_small enemy'>";
		content+="</div>";
		content+=this.createPercentIndicator(allyOrEnemy, action, ref, "support");
	}
	
	content+="</div>";

	
	
	
	//content+="</div>";
	content+="</div>";
	return content;
}

Window_BeforebattleTwin.prototype.setupHasUnseenMove = function() {
	var result = false;
	
	function resolveAnimId(attack){
		var animId;
		if(typeof attack.animId != "undefined" && attack.animId != -1){
			animId = attack.animId;
		} else {
			/*_this.playDefaultAttackAnimation(nextAction).then(function(){
				_this.processActionQueue();
			});*/
			var defaultAnim;
			if(ENGINE_SETTINGS.BATTLE_SCENE && ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS){
				if(attack.particleType && ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS[attack.particleType] != null){
					defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS[attack.particleType];
				}
				if(defaultAnim == null){
					if(attack.type == "M"){
						defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS["melee"];
					} else {
						defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS["ranged"];
					}
				}
			} 
			if(defaultAnim == null){
				defaultAnim = 0;
			}
			animId = defaultAnim;
		}
		return animId;
	}
	
	if($gameTemp.actorAction && $gameTemp.actorAction.type == 'attack'){
		if(!$gameSystem.isMoveSeen(resolveAnimId($gameTemp.actorAction.attack))){
			result = true;
		}
	}
	if($gameTemp.actorTwinAction && $gameTemp.actorTwinAction.type == 'attack'){
		if(!$gameSystem.isMoveSeen(resolveAnimId($gameTemp.actorTwinAction.attack))){
			result = true;
		}
	}
	if($gameTemp.enemyAction && $gameTemp.enemyAction.type == 'attack'){
		if(!$gameSystem.isMoveSeen(resolveAnimId($gameTemp.enemyAction.attack))){
			result = true;
		}
	}
	if($gameTemp.enemyTwinAction && $gameTemp.enemyTwinAction.type == 'attack'){
		if(!$gameSystem.isMoveSeen(resolveAnimId($gameTemp.enemyTwinAction.attack))){
			result = true;
		}
	}
	
	if($gameTemp.twinSupportAttack){
		var supportAttackAction =  $gameTemp.twinSupportAttack.action;	
		if(supportAttackAction && supportAttackAction.type == 'attack'){
			if(!$gameSystem.isMoveSeen(resolveAnimId(supportAttackAction.attack))){
				result = true;
			}
		}
	}
		
	if($gameTemp.supportAttackCandidates){
		var supportAttacker = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
		if(supportAttacker){
			var supportAttackAction =  supportAttacker.action;	
			if(supportAttackAction && supportAttackAction.type == 'attack'){
				if(!$gameSystem.isMoveSeen(resolveAnimId(supportAttackAction.attack))){
					result = true;
				}
			}
		}
	}
	
	return result;
}

Window_BeforebattleTwin.prototype.redraw = function() {
	var _this = this;
	
	$gameTemp.buttonHintManager.hide();
	
	if(this._battleStarting){
		return;
	}
	$battleCalc.generateBattleResult(true);
	_this._unitsWithShootDown = {};
	
	Object.keys($gameTemp.battleEffectCache).forEach(function(battleEffectRef){
		var cachedEffect = $gameTemp.battleEffectCache[battleEffectRef];
		if(cachedEffect.isDestroyed){
			_this._unitsWithShootDown[battleEffectRef] = true;
		}
	});
	
	//this._mechList.redraw();	

	/*
	
	var mechIcon = this._container.querySelector("#detail_pages_weapons_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);	
*/
	var noTwins = false;
	var windowNode = this.getWindowNode();
	windowNode.classList.remove("no_twins");
	
	if(!$gameTemp.currentBattleActor.subTwin && !$gameTemp.currentBattleEnemy.subTwin){
		noTwins = true;
		windowNode.classList.add("no_twins");
	}

	this._ally_main.innerHTML = this.createParticipantBlock($gameTemp.currentBattleActor, $gameTemp.actorAction, false, "ally", "ally_main");
	this._enemy_main.innerHTML = this.createParticipantBlock($gameTemp.currentBattleEnemy, $gameTemp.enemyAction, false, "enemy", "enemy_main");
	this._enemy_main.style.display = "";
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	this._ally_support_1.innerHTML = "";
	this._enemy_support_1.innerHTML = "";
	this._enemy_support_1.style.display = "none";
	this._ally_support_1.style.display = "none";
	if(supporter){
		this._supportAttacker = supporter;
		if($gameTemp.isEnemyAttack){			
			this._enemy_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "enemy", "support_attack");
			this._enemy_support_1.style.display = "";
		} else {
			this._ally_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "ally", "support_attack");
			this._ally_support_1.style.display = "";
		}
		
	} else {
		this._supportAttacker = null;
		if($gameTemp.isEnemyAttack){
			this._enemy_support_1.innerHTML = "";
			this._enemy_support_1.style.display = "none";
		} else {
			this._ally_support_1.innerHTML = "";
			this._ally_support_1.style.display = "none";
		}
	}
	
	var supporter = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];	
	if(supporter){
		this._supportDefender = supporter;
		if($gameTemp.isEnemyAttack){
			this._ally_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "ally", "support_defend");
			this._ally_support_1.style.display = "";
		} else {			
			this._enemy_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "enemy", "support_defend");
			this._enemy_support_1.style.display = "";
		}
		
	} else {
		this._supportDefender = null;
		if($gameTemp.isEnemyAttack){			
			this._ally_support_1.innerHTML = "";
			this._ally_support_1.style.display = "none";
		} else {
			this._enemy_support_1.innerHTML = "";
			this._enemy_support_1.style.display = "none";
		}
	}
	
	var supporter = $gameTemp.twinSupportAttack;
	this._ally_support_2.innerHTML = "";
	this._ally_support_2.style.display = "none";
	this._enemy_support_2.innerHTML = "";
	this._enemy_support_2.style.display = "none";
	if(supporter){
		this._supportAttacker2 = supporter;
		if($gameTemp.isEnemyAttack){
			this._enemy_support_2.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "enemy", "support_attack2");
			this._enemy_support_2.style.display = "";
		} else {
			this._ally_support_2.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, "ally", "support_attack2");
			this._ally_support_2.style.display = "";
		}
		
	} else {
		this._supportAttacker2 = null;
		if($gameTemp.isEnemyAttack){
			this._enemy_support_2.innerHTML = "";
			this._enemy_support_2.style.display = "none";
		} else {
			this._ally_support_2.innerHTML = "";
			this._ally_support_2.style.display = "none";
		}
	}
	

	if($gameTemp.currentBattleActor.subTwin){
		var action;
		if(!$gameTemp.actorTwinAction){
			action = {type: "none"};
		} else {
			action = $gameTemp.actorTwinAction;
		}
		this._ally_twin.innerHTML = this.createParticipantBlock($gameTemp.currentBattleActor.subTwin, action, false, "ally", "ally_twin");
		this._ally_twin.style.display = "";
	} else {
		this._ally_twin.innerHTML = "";
		this._ally_twin.style.display = "none";
	}
	
	if($gameTemp.currentBattleEnemy.subTwin){
		var action;
		if(!$gameTemp.enemyTwinAction){
			action = {type: "none"};
		} else {
			action = $gameTemp.enemyTwinAction;
		}
		this._enemy_twin.innerHTML = this.createParticipantBlock($gameTemp.currentBattleEnemy.subTwin, action, false, "enemy", "enemy_twin");
		this._enemy_twin.style.display = "";
	} else {
		this._enemy_twin.innerHTML = "";
		this._enemy_twin.style.display = "none";
	}
	
	if(this.isBuffingAttack()){
		this._enemy_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_support;
		this._ally_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_support;
	} else {
		if(!$gameTemp.isEnemyAttack){
			this._enemy_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_defending;
			this._ally_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_attacking;
		} else {
			this._enemy_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_attacking;
			this._ally_label.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_defending;
		}
	}	
	
	var spiritEntries = this.getWindowNode().querySelectorAll(".spirit_entry");
	spiritEntries.forEach(function(spiritEntry){
		_this.updateScaledDiv(spiritEntry);
	});
	
	var disableActionButtons = false;
	if(_this._currentUIState != "actor_twin_target_selection" && _this._currentUIState != "enemy_twin_target_selection" && _this._currentUIState != "action_selection"){
		disableActionButtons = true;
	}
	/*var actionButtons = this.getWindowNode().querySelectorAll(".action_btn");
	actionButtons.forEach(function(actionButton){
		if(disableActionButtons && actionButton.getAttribute("action_id") == _this._currentSelection){
			actionButton.classList.add("selected");
		} else {
			actionButton.classList.remove("selected");
		}		
	});*/
	
	var btnCtr = 0;
	var btnOffset = 15;
	var btnStart = 85;
	this._btnInfo.forEach(function(info){
		if(info.enabled){
			info.elem.style.display = "flex";
			info.elem.style.left = btnStart - ((btnCtr++) * btnOffset)+"%";
			if(info.action == _this._currentSelection){			
				info.elem.classList.add("selected");
			} else {
				info.elem.classList.remove("selected");
			}	
		} else {
			info.elem.style.display = "none";
		}		
	});	
	
	if($gameSystem.demoSetting){
		_this._btn_demo.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_demo_on;
	} else {
		_this._btn_demo.innerHTML = APPSTRINGS.BEFORE_BATTLE.label_demo_off;
	}
	
	/*if(!$gameTemp.currentBattleActor.isActor() || $statCalc.isAI($gameTemp.currentBattleActor)){
		_this._btn_action.style.display = "none";
		//_this._btn_assist.style.display = "none";
	} else {
		_this._btn_action.style.display = "";
		_this._btn_assist.style.display = "";
		if($gameTemp.isEnemyAttack){
			_this._btn_action.style.display = "";
		} else {
			if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
				_this._btn_action.style.display = "";
			} else {
				_this._btn_action.style.display = "none";
			}			
		}
	}*/
	
	_this._enemy_header.classList.remove("support_selection_header");
	_this.assignFactionColorClass(_this._enemy_header, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_main, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_twin, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_support_1, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_support_2, $gameTemp.currentBattleEnemy);
	
	_this._ally_header.classList.remove("support_selection_header");
	_this.assignFactionColorClass(_this._ally_header, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_main, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_twin, $gameTemp.currentBattleActor);	
	_this.assignFactionColorClass(_this._ally_support_1, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_support_2, $gameTemp.currentBattleActor);
	
	
	
	_this._support_selection.style.display = "none";
	
	if(_this._currentUIState == "support_selection"){
		_this._enemy_main.style.display = "none";
		_this._enemy_twin.style.display = "none";
		_this._enemy_label.innerHTML = "Choose Assist";
		_this._enemy_header.classList.add("support_selection_header");
		_this._support_selection.style.display = "";
		var content = "";
		content+="<div data-idx='0' class='support_candiate_block none scaled_text' id='"+(_this._currentSupportSelection == 0 ? "selected_candidate" : "")+"'>";
		content+="---------";
		content+="</div>";
		if($gameTemp.isEnemyAttack){
			for(var i = 0; i < 4; i++){				
				if($gameTemp.supportDefendCandidates[i]){
					content+="<div data-idx='"+(i + 1)+"' class='support_candiate_block' id='"+(i + 1 == _this._currentSupportSelection ? "selected_candidate" : "")+"'>";
					content+=this.createParticipantBlock($gameTemp.supportDefendCandidates[i].actor, $gameTemp.supportDefendCandidates[i].action, true, "ally");
					content+="</div>";
				}				
			}			
		} else {
			for(var i = 0; i < 4; i++){				
				if($gameTemp.supportAttackCandidates[i]){
					content+="<div data-idx='"+(i + 1)+"' class='support_candiate_block' id='"+(i + 1 == _this._currentSupportSelection ? "selected_candidate" : "")+"'>";
					content+=this.createParticipantBlock($gameTemp.supportAttackCandidates[i].actor, $gameTemp.supportAttackCandidates[i].action, true, "ally");
					content+="</div>";
				}				
			}
		}
		_this._support_selection.innerHTML = content;
		
		var entries = _this._support_selection.querySelectorAll(".support_candiate_block");
		entries.forEach(function(entry){
			entry.addEventListener("click", function(){
				_this._currentSupportSelection = this.getAttribute("data-idx") * 1;
				_this._touchOK = true;
			});
		});
		
	}
	
	content = "";
	content+="<div data-idx=0 class='action_block "+(_this._currentActionSelection == 0 ? "selected" : "")+" "+($statCalc.hasWeapons($gameTemp.currentBattleActor) ? "" : "disabled")+"'>";
	content+="Attack";
	content+="</div>";
	content+="<div data-idx=1 class='action_block "+(_this._currentActionSelection == 1 ? "selected" : "")+"'>";
	content+="Defend";
	content+="</div>";
	content+="<div data-idx=2 class='action_block "+(_this._currentActionSelection == 2 ? "selected" : "")+"'>";
	content+="Evade";
	content+="</div>";
	if(_this._currentUIState == "action_selection"){
		_this._action_selection.style.display = "block";
	} else {
		_this._action_selection.style.display = "";
	}
	_this._action_selection.innerHTML = content;
	_this._action_selection.classList.remove("slot_0");
	_this._action_selection.classList.remove("slot_1");
	_this._action_selection.classList.add("slot_"+_this._currentTwinTargetSelection);
	
	var entries = _this._action_selection.querySelectorAll(".action_block");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){			
			if(_this._currentUIState == "action_selection"){
				var idx = this.getAttribute("data-idx") * 1;
				if(idx == _this._currentActionSelection){
					_this._touchOK = true;
				} else {
					_this._currentActionSelection = idx;
					_this.requestRedraw();
				}				
			}
		});
	});
	
	var pilotIcons = this.getWindowNode().querySelectorAll(".display_icon");
	pilotIcons.forEach(function(pilotIcon){
		_this.updateScaledDiv(pilotIcon);
		var pilotId = pilotIcon.getAttribute("data-pilot");
		var type = pilotIcon.getAttribute("data-type");
		if(type == "actor"){
			_this.loadActorFace(pilotId, pilotIcon);
		} else {
			_this.loadEnemyFace(pilotId, pilotIcon);
		}		
	});
	
	/*var pilotIcons = this.getWindowNode().querySelectorAll(".enemy_icon");
	pilotIcons.forEach(function(pilotIcon){
		_this.updateScaledDiv(pilotIcon);
		var pilotId = pilotIcon.getAttribute("data-pilot");
		_this.loadEnemyFace(pilotId, pilotIcon);
	});*/
	
	if(this.isBuffingAttack()){
		if($gameTemp.isEnemyAttack){
			let elem = windowNode.querySelector(".percent_indicator_containers.enemy .percent_indicator_container");
			if(elem){
				elem.style.visibility = "hidden";	
			}			
		} else {
			let elem = windowNode.querySelector(".percent_indicator_containers.actor .percent_indicator_container")
			if(elem){
				elem.style.visibility = "hidden";	
			}
		}	
	} else {
		if($gameTemp.isEnemyAttack){
			let elem = windowNode.querySelector(".percent_indicator_containers.enemy .percent_indicator_container")
			if(elem){
				elem.style.visibility = "visible";
			}			
		} else {
			let elem = windowNode.querySelector(".percent_indicator_containers.actor .percent_indicator_container")
			if(elem){
				elem.style.visibility = "visible";
			}				
		}			
	}
	
	var arrowsOffset = 0;
	var noTwinOffet = 2;
	var selfNoTwinOffset = 19;
	if($gameTemp.currentTargetingSettings.actor != "all"){
		arrowsOffset = noTwinOffet;
	}
	if(!$statCalc.isMainTwin($gameTemp.currentBattle)){		
		arrowsOffset = selfNoTwinOffset;
	}
	
	_this._targeting_arrows_1.style.transform = "";
	_this._targeting_arrows_1.style.display = "none";
	_this._targeting_arrows_1.style.top = "";
	_this._targeting_arrows_1.src = "img/system/targeting1.png";
	
	_this._targeting_arrows_2.style.transform = "";
	_this._targeting_arrows_2.style.display = "none";
	_this._targeting_arrows_2.style.top = "";
	_this._targeting_arrows_2.src = "img/system/targeting1.png";
	
	
	/*
	if($gameTemp.actorAction.type == "attack"){
		_this._targeting_arrows_1.style.display = "";
		_this._targeting_arrows_1.style.top = (27 + arrowsOffset)+"%";
	}
	
	if(_this._currentUIState == "enemy_twin_target_selection" && _this._currentTwinTargetSelection == 0){
		if(_this._currentEnemySelection == 1){
			_this._targeting_arrows_1.style.transform = "rotate(-45deg)";
			_this._targeting_arrows_1.style.top = (27 + arrowsOffset)+"%";
		} 
	} else {
		if($gameTemp.currentTargetingSettings.actor == "twin"){
			_this._targeting_arrows_1.style.transform = "rotate(-45deg)";
			_this._targeting_arrows_1.style.top = (27 + arrowsOffset)+"%";
		}	
		
		if($gameTemp.currentTargetingSettings.actor == "all" && $gameTemp.currentBattleEnemy.subTwin){
			_this._targeting_arrows_1.src = "img/system/targeting2.png";
			_this._targeting_arrows_1.style.top = (27.5 + arrowsOffset)+"%";
		}
	}
	
	arrowsOffset = 0;
	if($gameTemp.currentTargetingSettings.actorTwin != "all"){
		arrowsOffset = noTwinOffet;
	}
	
	if($gameTemp.currentBattleActor.subTwin){
		if($gameTemp.actorTwinAction && $gameTemp.actorTwinAction.type == "attack"){
			_this._targeting_arrows_2.style.display = "";
		}
		
		if(_this._currentUIState == "enemy_twin_target_selection" && _this._currentTwinTargetSelection == 1){
			if(_this._currentEnemySelection == 0){
				_this._targeting_arrows_2.style.transform = "rotate(45deg)";
			} 
		} else {
			if($gameTemp.currentTargetingSettings.actorTwin == "main"){
				_this._targeting_arrows_2.style.transform = "rotate(45deg)";
			}	
			if($gameTemp.currentTargetingSettings.actorTwin == "all" && $gameTemp.currentBattleEnemy.subTwin){
				_this._targeting_arrows_2.src = "img/system/targeting2.png";
				_this._targeting_arrows_2.style.transform = "scaleY(-1)";
				_this._targeting_arrows_2.style.top = "56.5%";
			}else {
				_this._targeting_arrows_2.style.top = "60.5%";
			}
		}			
	}
	*/
	_this._targeting_arrows_enemy_1.style.transform = "";
	_this._targeting_arrows_enemy_1.style.display = "none";
	_this._targeting_arrows_enemy_1.style.top = "";
	_this._targeting_arrows_enemy_1.src = "img/system/targeting1.png";
	
	_this._targeting_arrows_enemy_2.style.transform = "";
	_this._targeting_arrows_enemy_2.style.display = "none";
	_this._targeting_arrows_enemy_2.style.top = "";
	_this._targeting_arrows_enemy_2.src = "img/system/targeting1.png";
	
	arrowsOffset = 0;
	if($gameTemp.currentTargetingSettings.enemy != "all"){
		arrowsOffset = noTwinOffet;
	}
	if(!$statCalc.isMainTwin($gameTemp.currentBattleEnemy)){		
		arrowsOffset = selfNoTwinOffset;
	}
	
	/*
	
	if($gameTemp.enemyAction.type == "attack"){
		_this._targeting_arrows_enemy_1.style.display = "";
		_this._targeting_arrows_enemy_1.style.top = (27 + arrowsOffset)+"%";
	}
	
	if($gameTemp.currentTargetingSettings.enemy == "twin"){
		_this._targeting_arrows_enemy_1.style.transform = "rotate(45deg) scaleX(-1)";
		_this._targeting_arrows_enemy_1.style.top = (27 + arrowsOffset)+"%";
	}	
	
	if($gameTemp.currentTargetingSettings.enemy == "all" && $gameTemp.currentBattleActor.subTwin){
		_this._targeting_arrows_enemy_1.src = "img/system/targeting2.png";
		_this._targeting_arrows_enemy_1.style.top = (27.5 + arrowsOffset)+"%";
	}
	
	arrowsOffset = 0;
	if($gameTemp.currentTargetingSettings.enemyTwin != "all"){
		arrowsOffset = noTwinOffet;
	}
	
	if($gameTemp.currentBattleEnemy.subTwin){
		if($gameTemp.enemyTwinAction && $gameTemp.enemyTwinAction.type == "attack"){
			_this._targeting_arrows_enemy_2.style.display = "";
		}
		if($gameTemp.currentTargetingSettings.enemyTwin == "main"){
			_this._targeting_arrows_enemy_2.style.transform = "rotate(135deg)";
		}	
		if($gameTemp.currentTargetingSettings.enemyTwin == "all" && $gameTemp.currentBattleActor.subTwin){
			_this._targeting_arrows_enemy_2.src = "img/system/targeting2.png";
			_this._targeting_arrows_enemy_2.style.transform = "scaleY(-1) scaleX(-1)";
			_this._targeting_arrows_enemy_2.style.top = "56.5%";
		} else {
			_this._targeting_arrows_enemy_2.style.top = "60.5%";
			_this._targeting_arrows_enemy_2.style.transform = "rotate(135deg)";
		}
	}
	*/
	_this.updateScaledImage(_this._targeting_arrows_1);
	_this.updateScaledImage(_this._targeting_arrows_2);
	
	_this.updateScaledImage(_this._targeting_arrows_enemy_1);
	_this.updateScaledImage(_this._targeting_arrows_enemy_2);
	
	
	this._ally_twin.classList.remove("selected");
	this._ally_main.classList.remove("selected");
	if(this._currentUIState == "actor_twin_target_selection" || this._currentUIState == "enemy_twin_target_selection"){
		_this._ally_label.innerHTML = "Select Action";
		_this._ally_header.classList.add("support_selection_header");
		if(_this._currentTwinTargetSelection == 0){
			this._ally_main.classList.add("selected");
		} else {
			this._ally_twin.classList.add("selected");
		}
	}
	
	this._enemy_twin.classList.remove("selected");
	this._enemy_main.classList.remove("selected");
	if(this._currentUIState == "enemy_twin_target_selection"){
		_this._enemy_label.innerHTML = "Select Target";
		_this._enemy_header.classList.add("support_selection_header");
		if(_this._currentEnemySelection == 0){
			this._enemy_main.classList.add("selected");
		} else {
			this._enemy_twin.classList.add("selected");
		}
	}
	
	var icons = windowNode.querySelectorAll(".mech_icon");
	icons.forEach(function(icon){
		_this.updateScaledDiv(icon);	
		var actor;
		var participantId = icon.getAttribute("data-participantid");
	
		if(participantId == "ally_main" && $gameTemp.currentBattleActor){
			actor = $gameTemp.currentBattleActor;
		}
		
		if(participantId == "enemy_main" && $gameTemp.currentBattleActor){
			actor = $gameTemp.currentBattleEnemy;
		}
		
		if(participantId == "ally_twin" && $gameTemp.currentBattleActor){
			actor = $gameTemp.currentBattleActor.subTwin;
		}
		
		if(participantId == "enemy_twin" && $gameTemp.currentBattleActor){
			actor = $gameTemp.currentBattleEnemy.subTwin;
		}
		
		if(actor){
			var menuImagePath = $statCalc.getMenuImagePath(actor);
			icon.innerHTML = "<img data-img='img/"+menuImagePath+"'>";
			icon.display = "";
		} else {
			icon.display = "none";
		}		
	});
	
	var icons = windowNode.querySelectorAll(".mech_icon_small");
	icons.forEach(function(icon){
		_this.updateScaledDiv(icon);	
		var actor;
		var participantId = icon.getAttribute("data-participantid");
	
		if(participantId == "support_attack" && _this._supportAttacker){
			actor = _this._supportAttacker.actor;
		}
		
		if(participantId == "support_attack2" && _this._supportAttacker2){
			actor = _this._supportAttacker2.actor;
		}
		
		if(participantId == "support_defend" && _this._supportDefender){
			actor = _this._supportDefender.actor;
		}
		
		if(actor){
			var menuImagePath = $statCalc.getMenuImagePath(actor);
			icon.innerHTML = "<img data-img='img/"+menuImagePath+"'>";
			icon.display = "";
		} else {
			icon.display = "none";
		}		
	});
	
	var icons = windowNode.querySelectorAll(".attribute_effectiveness_block");
	icons.forEach(function(icon){
		_this.updateScaledDiv(icon);	
	});
	var icons = windowNode.querySelectorAll(".effectiveness_indicator");
	icons.forEach(function(icon){
		_this.updateScaledDiv(icon);	
	});
	
	if(ENGINE_SETTINGS.SHOW_NEW_MOVE_INDICATOR){
		if(this.setupHasUnseenMove()){
			this.new_attack_inidicator.style.display = "flex"; 
		} else {
			this.new_attack_inidicator.style.display = "none";		
		}
	}
	_this.updateScaledDiv(this.new_attack_inidicator);
	
	var percentIndicators = windowNode.querySelectorAll(".participant_block .percent_indicator .entry");
	percentIndicators.forEach(function(percentIndicator){
		_this.updateScaledDiv(percentIndicator);
	});
	this.loadImages();
	Graphics._updateCanvas();
}