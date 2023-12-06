function GameState(){
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false,
		popupAnims: false
	};
}

GameState.prototype.update = function(scene){
	return true;
}

GameState.prototype.updateTriggerAction = function(cursor){
	return false;
}

GameState.prototype.updateMapEvent = function(x, y, triggers){
	return false;
}

GameState.prototype.canCursorMove = function(){
	return this.allowedActions.cursor;
}

GameState.prototype.canUseMenu = function(){
	return !!this.allowedActions.menu;
}

GameState.prototype.canShowSummaries = function(){
	return !!this.allowedActions.summaries;
}

GameState.prototype.canShowPopUpAnim = function(){
	return !!this.allowedActions.popupAnims;
}

function GameStateManager(){
	var _this = this;
	this._currentState = "";
	this._stateClassMapping = {
		actor_command_window: "GameState_actor_command_window", //OK
		actor_map_target: "GameState_actor_map_target", //OK
		actor_map_target_confirm: "GameState_actor_map_target_confirm", //OK
		actor_move: "GameState_actor_move", //OK
		actor_support: "GameState_actor_support", //OK
		actor_target: "GameState_actor_target", //OK
		actor_target_spirit: "GameState_actor_target_spirit", //OK
		after_battle: "GameState_after_battle", //OK
		//auto_actor_action: "GameState_auto_actor_action",
		//auto_actor_move: "GameState_auto_actor_move",
		auto_spirits: "GameState_auto_spirits", //OK
		await_character_anim: "GameState_await_character_anim", //OK
		battle_basic: "GameState_battle_basic", //OK
		battle_window: "GameState_battle_window",
		before_enemy_map_animation: "GameState_before_enemy_map_animation", //OK
		cancel_move: "GameState_cancel_move", //OK
		//cancel_post_move: "GameState_cancel_post_move",
		confirm_boarding: "GameState_confirm_boarding", //OK
		confirm_end_turn: "GameState_confirm_end_turn", //OK
		end_actor_turn: "GameState_end_actor_turn", //OK
		enemy_action: "GameState_enemy_action",
		enemy_item_usage: "GameState_enemy_item_usage",
		enemy_attack: "GameState_enemy_attack", //OK
		enemy_command: "GameState_enemy_command", //OK
		enemy_move: "GameState_enemy_move", //OK
		enemy_hit_and_away: "GameState_enemy_hit_and_away", //OK
		enemy_range_display: "GameState_enemy_range_display", //OK
		enemy_targeting_display: "GameState_enemy_targeting_display", //OK
		enemy_unit_summary: "GameState_enemy_unit_summary", //OK
		event_before_battle: "GameState_event_before_battle", //OK
		event_spirits: "GameState_event_spirits", //OK
		event_spirits_display: "GameState_event_spirits_display", //OK
		halt: "GameState_halt", //OK
		initialize: "GameState_initialize", //OK
		invoke_action: "GameState_invoke_action", //??
		level_up_display: "GameState_level_up_display", //OK
		map_attack_animation: "GameState_map_attack_animation", //OK
		map_spirit_animation: "GameState_map_spirit_animation", //OK
		normal: "GameState_normal", //OK
		pause_menu: "GameState_pause_menu", //OK
		post_move_command_window: "GameState_post_move_command_window", //OK
		process_death: "GameState_process_death", //OK
		process_death_queue: "GameState_process_death_queue", //OK
		process_destroy_transform: "GameState_process_destroy_transform", //OK
		process_destroy_transform_queue: "GameState_process_destroy_transform_queue", //OK
		process_map_attack_queue: "GameState_process_map_attack_queue", //OK
		rearrange_deploys: "GameState_rearrange_deploys", //OK
		rearrange_deploys_init: "GameState_rearrange_deploys_init", //OK
		rewards_display: "GameState_rewards_display", //OK
		select_deploy_position: "GameState_select_deploy_position", //OK
		spirit_activation: "GameState_spirit_activation", //OK
		//status_window: "GameState_status_window",
		twin_selection: "GameState_twin_selection",	
		battle_intro: "GameState_battle_intro", //OK
		wait: "GameState_wait",
		hover_map_button: "GameState_hover_map_button",
		confirm_adjacent_spirit: "GameState_confirm_adjacent_spirit",
		event_after_actor_action: "GameState_event_after_actor_action",
		await_actor_float: "GameState_await_actor_float",
		stage_conditions: "GameState_stage_conditions",
		popup_anim: "GameState_popup_anim",
		check_item_pickup: "GameState_check_item_pickup",
	};
	this._stateObjMapping = {};
	Object.keys(_this._stateClassMapping).forEach(function(stateId){
		var className = _this._stateClassMapping[stateId];
		if(window[className]){
			_this._stateObjMapping[stateId] = new window[className]();
		}
	});
}

GameStateManager.prototype.getActiveStateName = function(){
	return this._currentState;
}

GameStateManager.prototype.getActiveState = function(){
	return this._stateObjMapping[this._currentState];
}

GameStateManager.prototype.update = function(scene){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].update(scene);
	} else {
		return true;
	}
}

GameStateManager.prototype.updateTriggerAction = function(cursor){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].updateTriggerAction(cursor);
	} else {
		return true;
	}
}

GameStateManager.prototype.updateMapEvent = function(x, y, triggers){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].updateMapEvent(x, y, triggers);
	} else {
		return false;
	}
}

GameStateManager.prototype.canCursorMove = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canCursorMove();
	} else {
		return false;
	}
}

GameStateManager.prototype.canUseMenu = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canUseMenu();
	} else {
		return false;
	}
}

GameStateManager.prototype.canShowSummaries = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canShowSummaries();
	} else {
		return false;
	}
}

GameStateManager.prototype.canShowPopUpAnim = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canShowPopUpAnim();
	} else {
		return false;
	}
}

GameStateManager.prototype.requestNewState = function(state){
	if(this._stateObjMapping[state]){
		this._currentState = state;
	} else {
		//while transitioning to the new system allow the stage manager to be left on an empty state
		this._currentState = null;
		//throw("Invalid game state requested!")
	}	
}

/*State implementations*/


function GameState_wait(){
	GameState.call(this);
}

GameState_wait.prototype = Object.create(GameState.prototype);
GameState_wait.prototype.constructor = GameState_wait;

function GameState_hover_map_button(){
	GameState.call(this);
	this.allowedActions = {
		cursor: false,
		menu: true,
		summaries: false
	};
}

GameState_hover_map_button.prototype = Object.create(GameState.prototype);
GameState_hover_map_button.prototype.constructor = GameState_hover_map_button;

function GameState_actor_command_window(){
	GameState.call(this);	
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false,
		popupAnims: true
	};
}

GameState_actor_command_window.prototype = Object.create(GameState.prototype);
GameState_actor_command_window.prototype.constructor = GameState_actor_command_window;

GameState_actor_command_window.prototype.update = function(scene){
	if(!scene._mapSrpgActorCommandWindow.isOpen() && !scene._mapSrpgActorCommandWindow.isOpening()){
		$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
	}	
	return true;
}


function GameState_spirit_activation(){
	GameState.call(this);
}

GameState_spirit_activation.prototype = Object.create(GameState.prototype);
GameState_spirit_activation.prototype.constructor = GameState_spirit_activation;

function GameState_post_move_command_window(){
	GameState.call(this);
}

GameState_post_move_command_window.prototype = Object.create(GameState.prototype);
GameState_post_move_command_window.prototype.constructor = GameState_post_move_command_window;

function GameState_battle_window(){
	GameState.call(this);
}

GameState_battle_window.prototype = Object.create(GameState.prototype);
GameState_battle_window.prototype.constructor = GameState_battle_window;

function GameState_actor_move(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: false
	};
}

GameState_actor_move.prototype = Object.create(GameState.prototype);
GameState_actor_move.prototype.constructor = GameState_actor_move;

GameState_actor_move.prototype.canCursorMove = function(){
	return !ENGINE_SETTINGS.ENABLE_QUICK_MOVE || (!Input.isPressed('pagedown') && !Input.isPressed('shift')) || !$gameTemp.moveEdgeInfo;
}

GameState_actor_move.prototype.update = function(){
	function putCursorAtCorner(direction){
		$gamePlayer.locate($gameTemp.moveEdgeInfo.corners[direction].x, $gameTemp.moveEdgeInfo.corners[direction].y);
	}
	function putCursorAtNextTile(direction){
		var nextTile = $gameTemp.moveEdgeInfo.graph[$gamePlayer.posX()][$gamePlayer.posY()].connections[direction];
		if(nextTile){
			$gamePlayer.locate(nextTile.x, nextTile.y);
		}		
	}	
	
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		$statCalc.invalidateAbilityCache($gameSystem.getActiveUnit());
		SoundManager.playCancel();
		$gameTemp.isPostMove = false;
		$gameTemp.activeEvent().locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
		$gameSystem.setSubBattlePhase('cancel_move');
		$gameTemp.clearMoveTable();							
		
		$gameSystem.showMoveEdge = false;
		$gameSystem.moveEdgeHighlightsRefreshed = true;
		$gameSystem.moveEdgeHighlights = [];
		
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());					
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
	}
	
	$gameSystem.showMoveEdge = false;
	if(ENGINE_SETTINGS.ENABLE_QUICK_MOVE && (Input.isPressed('pagedown') || Input.isPressed('shift'))){
		$gameSystem.showMoveEdge = true;
		if($gameTemp.moveEdgeInfo){
			var lookup = $gameTemp.moveEdgeInfo.graph;
			if(Input.isTriggered('right') || Input.isRepeated('right')){
				if(!lookup[$gamePlayer.posX()] || !lookup[$gamePlayer.posX()][$gamePlayer.posY()]){
					putCursorAtCorner("right");
				} else {
					putCursorAtNextTile("right");
				}
			} else if(Input.isTriggered('left') || Input.isRepeated('left')){
				if(!lookup[$gamePlayer.posX()] || !lookup[$gamePlayer.posX()][$gamePlayer.posY()]){
					putCursorAtCorner("left");
				} else {
					putCursorAtNextTile("left");
				}
			} else if(Input.isTriggered('down') || Input.isRepeated('down')){
				if(!lookup[$gamePlayer.posX()] || !lookup[$gamePlayer.posX()][$gamePlayer.posY()]){
					putCursorAtCorner("down");
				} else {
					putCursorAtNextTile("down");
				}
			} else if(Input.isTriggered('up') || Input.isRepeated('up')){
				if(!lookup[$gamePlayer.posX()] || !lookup[$gamePlayer.posX()][$gamePlayer.posY()]){
					putCursorAtCorner("up");
				} else {
					putCursorAtNextTile("up");
				}
			}
		}		
	}
	
	return true;
}

GameState_actor_move.prototype.updateTriggerAction = function(cursor){
	if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
		var list = $gameTemp.moveList();
		for (var i = 0; i < list.length; i++) {
			var pos = list[i];
			if (pos[2] == false && pos[0] == cursor._x && pos[1] == cursor._y) {
				var target = $statCalc.activeUnitAtPosition({x: cursor._x, y: cursor._y}, "actor");	
				var initiator = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
				
				if(!$statCalc.isEssential(initiator) && !$gameTemp.activeShip && $statCalc.isShip(target) && $gameTemp.activeEvent().eventId() != target.event.eventId()){
					SoundManager.playOk();
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
					battlerArray[1].srpgMakeNewActions();
					$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameSystem.setSubBattlePhase('confirm_boarding');
					$gameTemp.targetShip = {position: {x: cursor._x, y: cursor._y}, actor: target};
					
					$gameSystem.showMoveEdge = false;
					//$gameSystem.moveEdgeHighlightsRefreshed = true;
					//$gameSystem.moveEdgeHighlights = [];
					
				} else if ($statCalc.isFreeSpace({x: cursor._x, y: cursor._y})) {
					SoundManager.playOk();

				   // var route = $gameTemp.MoveTable(pos[0], pos[1])[1];
					var event = $gameTemp.activeEvent();
					$gameSystem.setSrpgWaitMoving(true);
					event.srpgMoveToPoint({x: cursor._x, y: cursor._y});
					var battlerArray = $gameSystem.EventToUnit(event.eventId());
					battlerArray[1].srpgMakeNewActions();
					
					$gameTemp.isPostMove = true;
					if($gameTemp.isHitAndAway){
						$gameTemp.clearMoveTable();
						$gameSystem.setSubBattlePhase('end_actor_turn');
					} else {
						$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
						$gameSystem.setSubBattlePhase('post_move_command_window');
					}
					$gameSystem.showMoveEdge = false;
					//$gameSystem.moveEdgeHighlightsRefreshed = true;
					//$gameSystem.moveEdgeHighlights = [];	
				} else if ($gameTemp.isPostMove && $statCalc.activeUnitAtPosition({x: cursor._x, y: cursor._y}) == initiator) {
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
					$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameSystem.setSubBattlePhase('post_move_command_window');
					$gameSystem.showMoveEdge = false;
				} else {
					SoundManager.playBuzzer();
				}
			}
		}
		return true;
	}
	return false;
}

//unused

function GameState_select_deploy_position(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: false
	};
}

GameState_select_deploy_position.prototype = Object.create(GameState.prototype);
GameState_select_deploy_position.prototype.constructor = GameState_select_deploy_position;

GameState_select_deploy_position.prototype.updateTriggerAction = function(cursor){
	if (Input.isTriggered('ok') || TouchInput.isTriggered()) {   					
		if ($statCalc.isFreeSpace({x: cursor._x, y: cursor._y}) && $statCalc.canStandOnTile($gameTemp.actorToDeploy, {x: cursor._x, y: cursor._y})) {
			SoundManager.playOk();
			
			
			var isInrange = ((Math.abs($gameTemp.activeEvent().posX() - cursor.x) + Math.abs($gameTemp.activeEvent().posY() - cursor.y)) == 1);
			
			if(isInrange){
				$statCalc.removeBoardedUnit($gameTemp.actorToDeploy, $gameTemp.activeShip);				
				var event = $gameTemp.actorToDeploy.event;
				event.locate(cursor._x, cursor._y);
				event.appear();						
				$gameMap.setEventImages();	
				
				$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
				var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
				if($statCalc.hasBoardedUnits($gameTemp.activeShip)){
					$gameTemp.actorCommandPosition = 1;
				}						
				$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
				
				$gameSystem.setSubBattlePhase('actor_command_window');
				$gameTemp.clearMoveTable();						
			
			}						                          
		} else {
			SoundManager.playBuzzer();
		}                    
		return true;
	}
	return false;
}


//utility
function updateMapAttackTargets(tiles, attack){
	var targets = $statCalc.activeUnitsInTileRange(tiles || [], attack.ignoresFriendlies ? "enemy" : null);
	var tmp = [];
	for(var i = 0; i < targets.length; i++){
		if(targets[i] != $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]){
			var terrain = $statCalc.getCurrentTerrain(targets[i]);					
			var terrainRank = attack.terrain[terrain];
			if(terrainRank != "-"){
				tmp.push(targets[i]);
			}
		}
	}
	targets = tmp;
	
	return targets;
}

function GameState_actor_map_target(){
	GameState.call(this);
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false
	};
}

GameState_actor_map_target.prototype = Object.create(GameState.prototype);
GameState_actor_map_target.prototype.constructor = GameState_actor_map_target;

GameState_actor_map_target.prototype.update = function(scene){
	var attack = $gameTemp.actorAction.attack;
	var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
	if(Input.isTriggered("ok") || TouchInput.isTriggered()){// && !$gameTemp.OKHeld	
		var processOK = false;
		if(TouchInput.isTriggered() && $gameTemp.touchMapAttackState == "direction"){
			var x = TouchInput.x;
			var y = TouchInput.y;
			var eventX = $gameTemp.activeEvent().posX();
			var eventY = $gameTemp.activeEvent().posY();
			
			var centerX = Math.floor((eventX - $gameMap._displayX) * $gameMap.tileWidth());//Math.floor(SceneManager._screenWidth / 2);
			var centerY = Math.floor((eventY - $gameMap._displayY) * $gameMap.tileHeight());//Math.floor(SceneManager._screenHeight / 2);
			
			var vec2 = {x: x - centerX, y: y - centerY};
			var vec1 = {x: 1, y: 0};
			
			var angleInRadians = Math.atan2(vec2.y, vec2.x) - Math.atan2(vec1.y, vec1.x);
			var angle = angleInRadians * 180 / Math.PI;
			
			
			var targetDirection;
			if(angle >= 45 && angle <= 135){
				targetDirection = "down";
			} else if(angle > 135 || angle <= -135){
				targetDirection = "left";
			} else if(angle <= -45 && angle >= -135){
				targetDirection = "up";
			} else if(angle >= -45 && angle <= 45){
				targetDirection = "right";
			}
			//console.log(targetDirection);
			
			if(targetDirection == $gameTemp.mapTargetDirection){
				processOK = true;
			} else {
				 $gameTemp.mapTargetDirection = targetDirection;
				 updateMapDirection($gameTemp.mapTargetDirection);	
			}					
		} 

		if(!TouchInput.isTriggered() || processOK){
			if(!mapAttackDef.retargetInfo || !mapAttackDef.retargetInfo.shape.length){					
				var targets = updateMapAttackTargets($gameTemp.currentMapTargetTiles, attack);
				if(targets.length){
					$gameTemp.currentMapTargets = targets;
					var targetEvent = targets[0].event;
					if(targetEvent){
						$gamePlayer.locate(targetEvent.posX(), targetEvent.posY());
					}
					$gameSystem.setSubBattlePhase('actor_map_target_confirm');
				}
			} else {
				var x = mapAttackDef.retargetInfo.initialPosition.x;
				var y = mapAttackDef.retargetInfo.initialPosition.y;
				var adjusted = scene.getAdjustedMapAttackCoordinates([[x, y]], $gameTemp.mapTargetDirection);
				$gamePlayer.locate($gameTemp.activeEvent().posX() + adjusted[0][0], $gameTemp.activeEvent().posY() + adjusted[0][1]);
				$gameTemp.mapTouchRetargetState = "init";
				$gameSystem.setSubBattlePhase('actor_map_target_confirm');
				Input.clear();
			}	
		}									
	} else if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		if(TouchInput.isTriggered() && $gameTemp.touchMapAttackState == "confirm"){
			$gameTemp.touchMapAttackState = "direction";
		} else {	
			$gameTemp.showAllyAttackIndicator = false;
			$gameTemp.showAllyDefendIndicator = false;
			$gameTemp.showEnemyAttackIndicator = false;
			$gameTemp.showEnemyDefendIndicator = false;
			SoundManager.playCancel();
			var event = $gameTemp.activeEvent();
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			$gameTemp.clearMoveTable();
			
			/*var list = $gameTemp.moveList();
			for (var i = 0; i < list.length; i++) {
				var pos = list[i];
				event.makeRangeTable(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0], pos[0], pos[1], $dataSkills[battlerArray[1].attackSkillId()]);
			}*/
			$gameTemp.pushRangeListToMoveList();
			$gameTemp.setResetMoveList(true);
			$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
			if($gameTemp.isPostMove){
				$gameSystem.setSubBattlePhase('post_move_command_window');
				$gameTemp.initialMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]));
				event.makeMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]), [0], battlerArray[1]);
			} else {
				$gamePlayer.locate(event.posX(), event.posY());
				$gameSystem.setSubBattlePhase('actor_command_window');	
			}  
		}				
	} else {	
		var directionChanged = false;		
		if(!mapAttackDef.lockRotation){						
			if(Input.isTriggered("up")){
				$gameTemp.mapTargetDirection = "up";
			} else if(Input.isTriggered("down")){
				$gameTemp.mapTargetDirection = "down";
			} else if(Input.isTriggered("left")){
				$gameTemp.mapTargetDirection = "left";
			} else if(Input.isTriggered("right")){
				$gameTemp.mapTargetDirection = "right";
			}
		} else {
			$gameTemp.mapTargetDirection = "up";
		}
		
		updateMapDirection($gameTemp.mapTargetDirection);		
																
	}
	
	function updateMapDirection(direction){
		var tileCoordinates = mapAttackDef.shape;		
		var deltaX = $gameTemp.activeEvent().posX();
		var deltaY = $gameTemp.activeEvent().posY();
		
		tileCoordinates = scene.getAdjustedMapAttackCoordinates(tileCoordinates, direction);
		
		
		//$gameTemp.clearMoveTable();	
		//$gameTemp.setResetMoveList(true);
		$gameSystem.highlightsRefreshed = true;	
		$gameSystem.highlightedTiles = [];
		$gameTemp.disableHighlightGlow = false;
		for(var i = 0; i < tileCoordinates.length; i++){
			tileCoordinates[i].push(true); //is attack range
			tileCoordinates[i][0]+=deltaX;
			tileCoordinates[i][1]+=deltaY;
			//$gameTemp.pushMoveList(tileCoordinates[i]);		
			$gameSystem.highlightedTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "#ff3a3a"});	
		}							
		$gameTemp.currentMapTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));
	}
	
	return true;
}

function GameState_actor_map_target_confirm(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_map_target_confirm.prototype = Object.create(GameState.prototype);
GameState_actor_map_target_confirm.prototype.constructor = GameState_actor_map_target_confirm;	

GameState_actor_map_target_confirm.prototype.update = function(scene){
	
	var currentPosition = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};		

	var summaryUnit = $statCalc.activeUnitAtPosition(currentPosition);
	if(summaryUnit && $gameTemp.summariesTimeout <= 0){
		var previousUnit = $gameTemp.summaryUnit;
		$gameTemp.summaryUnit = summaryUnit;	
		if(!scene._summaryWindow.visible || $gameTemp.summaryUnit != previousUnit){
			scene._summaryWindow.show();
		}				
	} else {
		scene._summaryWindow.hide();
	}	
	
	
	var attack = $gameTemp.actorAction.attack;
	var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
	if(mapAttackDef.retargetInfo && mapAttackDef.retargetInfo.shape.length && !$gamePlayer.isMoving()){				
		$gameTemp.mapRetargetLock = true;	
		$gameSystem.highlightedMapRetargetTiles = [];
		
		
		var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
		
		tileCoordinates = scene.getAdjustedMapAttackCoordinates(tileCoordinates, $gameTemp.mapTargetDirection);
		
		var x = mapAttackDef.retargetInfo.initialPosition.x;
		var y = mapAttackDef.retargetInfo.initialPosition.y;
		var adjusted = scene.getAdjustedMapAttackCoordinates([[x, y]], $gameTemp.mapTargetDirection);
		
		var deltaX = $gamePlayer.posX() - adjusted[0][0];
		var deltaY = $gamePlayer.posY() - adjusted[0][1];
		
		for(var i = 0; i < tileCoordinates.length; i++){
			tileCoordinates[i][0]+=deltaX;
			tileCoordinates[i][1]+=deltaY;

			$gameSystem.highlightedMapRetargetTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "white"});
			$gameSystem.highlightsLayer1Refreshed = true;					
		}		
		
		$gameTemp.currentMapReTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));
		
		var targets = updateMapAttackTargets($gameTemp.currentMapReTargetTiles || [], attack);
		
		$gameTemp.currentMapTargets = targets;				
	}			
	
	if(Input.isTriggered("ok") || TouchInput.isTriggered()){// && !$gameTemp.OKHeld	
		
		if(!mapAttackDef.retargetInfo || !mapAttackDef.retargetInfo.shape.length){
			$gameTemp.clearMoveTable();	
			$gameTemp.setResetMoveList(true);
			scene.mapAttackStart();
		} else {
			var triggerOK = true;
			if(TouchInput.isTriggered()){
				triggerOK = false;
				var x = $gameMap.canvasToMapX(TouchInput.x);
				var y = $gameMap.canvasToMapY(TouchInput.y);
				
				if($gameTemp.mapTouchRetargetState == "init"){
					$gameTemp.mapTouchRetargetState = "confirm";
					$gameTemp.mapTouchRetargetCoords = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
				} else if($gameTemp.mapTouchRetargetState == "confirm"){
					if($gameTemp.mapTouchRetargetCoords.x == $gamePlayer.posX() && $gameTemp.mapTouchRetargetCoords.y == $gamePlayer.posY()){
						triggerOK = true;
					} else {
						$gameTemp.mapTouchRetargetState = "init"
						$gameTemp.mapTouchRetargetCoords = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
					}					
				}					
			}
			if(triggerOK){
				var targets = updateMapAttackTargets($gameTemp.currentMapReTargetTiles, attack);
				if(targets.length){
					$gameTemp.currentMapTargets = targets;
					$gameSystem.highlightedMapRetargetTiles = [];
					$gameSystem.highlightsRefreshed = true;	
					scene.mapAttackStart();
					$gameTemp.mapRetargetLock = false;
				} 
			}			
		}				
	} else if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		$gameTemp.mapTouchRetargetState = "init";
		$gameSystem.highlightedMapRetargetTiles = [];
		$gameSystem.highlightsRefreshed = true;
		$gameTemp.mapRetargetLock = false;
		SoundManager.playCancel();
		var event = $gameTemp.activeEvent();
		$gamePlayer.locate(event.posX(), event.posY());
		$gameSystem.setSubBattlePhase('actor_map_target');	
	 }	
	 return true;
}

function GameState_confirm_adjacent_spirit(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_confirm_adjacent_spirit.prototype = Object.create(GameState.prototype);
GameState_confirm_adjacent_spirit.prototype.constructor = GameState_confirm_adjacent_spirit;

GameState_confirm_adjacent_spirit.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {		
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());		
		$gameSystem.setSubBattlePhase("normal");    
		SoundManager.playCancel();
		$gameTemp.clearMoveTable();		
	} else if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
		if(!$gamePlayer.wasTouchMoved){
			$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			var spiritInfo = $gameTemp.adjacentSpiritInfo.spiritInfo;
			var caster = $gameTemp.adjacentSpiritInfo.caster;
			var initialTargetingResult = $gameTemp.adjacentSpiritInfo.initialTargetingResult;
			$spiritManager.applyEffect(spiritInfo.idx, caster, initialTargetingResult.targets, spiritInfo.cost);
			$gameTemp.queuedEffectSpiritId = spiritInfo.idx; 
			$gameSystem.setSubBattlePhase("map_spirit_animation");		
		}
	}
	return true;
}

function GameState_actor_support(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_support.prototype = Object.create(GameState.prototype);
GameState_actor_support.prototype.constructor = GameState_actor_support;

GameState_actor_support.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		SoundManager.playCancel();
		$gameSystem.highlightedActionTiles = [];
		$gameSystem.reloadMoveHighlights();
		$gameSystem.highlightsRefreshed = true;
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gameSystem.setSubBattlePhase("actor_command_window");    
		scene._mapSrpgActorCommandWindow.activate();					
	}
	return true;
}

GameState_actor_support.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_support.prototype.updateMapEvent = function(x, y, triggers){
	$gameMap.eventsXy(x, y).forEach(function(event) {
		if (event.isTriggerIn(triggers) && !event.isErased() && $gameSystem.EventToUnit(event.eventId()) != null) {
			var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
			var candidate = $gameSystem.EventToUnit(event.eventId())[1];
			var battler = actionBattlerArray[1];
			if (event.isType() == 'actor' || $gameSystem.isFriendly(candidate, "player")) {						
				var position = {
					x: $gameTemp.activeEvent().posX(),
					y: $gameTemp.activeEvent().posY(),
				};
				var isInrange = false;
				if($statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){
					isInrange = true;
				} else {
					isInrange = ((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1);
				}
				var candidateCanReceiveSupport = ($gameTemp.supportType == "heal" && $statCalc.canRecoverHP(candidate) || $gameTemp.supportType == "resupply" && ($statCalc.canRecoverEN(candidate) || $statCalc.canRecoverAmmo(candidate)));
				if (isInrange && candidateCanReceiveSupport) {
					
					var stats = $statCalc.getCalculatedMechStats(candidate);
					
					var originalEN = stats.currentEN;
					if($gameTemp.supportType == "heal") {
						$statCalc.recoverHPPercent(candidate, $statCalc.applyStatModsToValue(battler, 50, ["heal_boost"]));
					} else {
						$statCalc.recoverENPercent(candidate, 100);
						$statCalc.recoverAmmoPercent(candidate, 100);
						$statCalc.modifyWill(candidate, -10);
					}							
					$gameTemp.clearMoveTable();
					
					stats = $statCalc.getCalculatedMechStats(candidate);
					var newEN = stats.currentEN;
					var effect;

					var baseYield;
					if($gameTemp.supportType == "heal"){
						baseYield = 250;
						effect = {type: "repair", parameters: {animId: "Trust", target: candidate, startAmount: stats.HPBeforeRecovery, endAmount: stats.currentHP, total: stats.maxHP}};									
					} else {
						baseYield = 375;
						effect = {type: "repair", parameters: {animId: "Resupply", target: candidate, startAmount: originalEN, endAmount: newEN, total: stats.maxEN}};		
					}									
					$gameTemp.queuedActorEffects = [effect];	

					$gameTemp.spiritTargetActor	= candidate;						
						
					$gameTemp.spiritWindowDoneHandler = function(){
						var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
						
						var attackerLevel = actor.SRWStats.pilot.level;
						var defenderLevel = candidate.SRWStats.pilot.level;
						var defenderTotalYield = baseYield;
						
						var totalExp = eval(ENGINE_SETTINGS.EXP_YIELD.LEVEL_SCALING_FORMULA);
						if(totalExp < ENGINE_SETTINGS.EXP_YIELD.MIN){
							totalExp = ENGINE_SETTINGS.EXP_YIELD.MIN;
						}
						if(totalExp > ENGINE_SETTINGS.EXP_YIELD.MAX){
							totalExp = ENGINE_SETTINGS.EXP_YIELD.MAX;
						}
						totalExp = Math.floor(totalExp);
						var gainResults = [{actor: actor, expGain: totalExp, ppGain: 0}];			

						var expResults = [{actor: actor, details: $statCalc.addExp(actor, totalExp)}];
									
						
						$gameTemp.rewardsInfo = {
							//actor: battleEffect.ref,
							levelResult: expResults,
							//expGain: battleEffect.expGain,
							//ppGain: battleEffect.ppGain,
							itemDrops: [],
							fundGain: 0,
							gainResults: gainResults
						};
						
						$gameTemp.popMenu = true;
						$gameTemp.rewardsDisplayTimer = 20;	
						$gameSystem.setSubBattlePhase("rewards_display");				
						$gameTemp.pushMenu = "rewards";
						//$gameSystem.setSubBattlePhase('end_actor_turn');
					}							
					
					$gameSystem.setSubBattlePhase('spirit_activation');	
					$gameTemp.pushMenu = "spirit_activation";
					
					if($statCalc.applyStatModsToValue(battler, 0, ["heal_again"])){
						if($statCalc.getStageTemp(battler, "heal_again_used") != $gameVariables.value(_turnCountVariable)){
							$statCalc.setStageTemp(battler, "heal_again_used", $gameVariables.value(_turnCountVariable));
							$statCalc.addAdditionalAction(battler);
						}						
					}														
				}
			}
		}
	});		
	return true;
}	

function GameState_actor_target(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_target.prototype = Object.create(GameState.prototype);
GameState_actor_target.prototype.constructor = GameState_actor_target;

GameState_actor_target.prototype.update = function(scene){
	if (Input.isTriggered('pageup')) {                   
		$gameSystem.getNextLTarget();
	} else if (Input.isTriggered('pagedown')) {      
		$gameSystem.getNextRTarget();
	}
	
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		$gameTemp.showAllyAttackIndicator = false;
		$gameTemp.showAllyDefendIndicator = false;
		$gameTemp.showEnemyAttackIndicator = false;
		$gameTemp.showEnemyDefendIndicator = false;
		SoundManager.playCancel();
		var event = $gameTemp.activeEvent();
		var battlerArray = $gameSystem.EventToUnit(event.eventId());
		$gameTemp.clearMoveTable();
		if($gameTemp.isPostMove){
			$gameSystem.reloadMoveHighlights();
		}
		$gameTemp.disableHighlightGlow = true;
		
		/*var list = $gameTemp.moveList();
		for (var i = 0; i < list.length; i++) {
			var pos = list[i];
			event.makeRangeTable(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0], pos[0], pos[1], $dataSkills[battlerArray[1].attackSkillId()]);
		}*/
		$gameTemp.pushRangeListToMoveList();
		$gameTemp.setResetMoveList(true);
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gamePlayer.locate(event.posX(), event.posY());
		if($gameTemp.isPostMove){
			$gameSystem.setSubBattlePhase('post_move_command_window');
			$gameTemp.initialMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]));
			event.makeMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]), [0], battlerArray[1]);
		} else {			
			$gameSystem.setSubBattlePhase('actor_command_window');	
		}                   
	}
	return true;
}

GameState_actor_target.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_target.prototype.updateMapEvent = function(x, y, triggers){
	
	if($gamePlayer.wasTouchMoved){
		return; //do no process event triggers on the same click as moving the cursor
	}
	
	$gameMap.eventsXy(x, y).forEach(function(event) {
		if (event.isTriggerIn(triggers) && !event.isErased()) {
			if (event.isType() == 'actor' || event.isType() == 'enemy') {
				var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
				var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
			   
				var isInRange = $battleCalc.isTargetInRange({x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}, {x: event.posX(), y: event.posY()}, $statCalc.getRealWeaponRange(actionBattlerArray[1], $gameTemp.actorAction.attack), $gameTemp.actorAction.attack.minRange);
				var validTarget = $statCalc.canUseWeapon(actionBattlerArray[1], $gameTemp.actorAction.attack, false, targetBattlerArray[1]);
				
				if(isInRange && validTarget){
					let isValidWeaponTarget = $statCalc.isValidWeaponTarget(actionBattlerArray[1], targetBattlerArray[1], $gameTemp.actorAction.attack);
					if(isValidWeaponTarget || (targetBattlerArray[0] === 'actor' && $gameTemp.actorAction.type === "support")){
						//$gameSystem.setSrpgBattleWindowNeedRefresh(actionBattlerArray, targetBattlerArray);
						//$gameSystem.setSrpgStatusWindowNeedRefresh(actionBattlerArray);
						$gameTemp.currentBattleActor = actionBattlerArray[1];
						//enemy counter action determination
						$gameTemp.currentBattleEnemy = targetBattlerArray[1];
						//var availableWeapons = $statCalc.getActorMechWeapons();
						var enemyInfo = {actor: $gameTemp.currentBattleEnemy, pos: {x: event.posX(), y: event.posY()}};
						var actorInfo = {actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}};
						$gameTemp.enemyAction = null;
						if(enemyInfo.actor.counterBehavior == "defend"){
							$gameTemp.enemyAction = {
								type: "defend",
								attack: 0,
								target: 0
							};
						} else if(enemyInfo.actor.counterBehavior == "evade"){
							$gameTemp.enemyAction = {
								type: "evade",
								attack: 0,
								target: 0
							};
						} else if(enemyInfo.actor.counterBehavior == "defend_low"){
							var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
							if(stats.currentHP / stats.maxHP <= 0.25){
								$gameTemp.enemyAction = {
									type: "defend",
									attack: 0,
									target: 0
								};	
							} 										
						} else if(enemyInfo.actor.counterBehavior == "evade_low"){
							var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
							if(stats.currentHP / stats.maxHP <= 0.25){
								$gameTemp.enemyAction = {
									type: "evade",
									attack: 0,
									target: 0
								};
							}
						} else if(enemyInfo.actor.counterBehavior == "survive"){
							var weaponResult = $battleCalc.getBestWeaponAndDamage(actorInfo, enemyInfo);											
							var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
							if(weaponResult.damage >= stats.currentHP){
								if(weaponResult.damage <= stats.currentHP * 2){
									$gameTemp.enemyAction = {
										type: "defend",
										attack: 0,
										target: 0
									};
								} else {
									$gameTemp.enemyAction = {
										type: "evade",
										attack: 0,
										target: 0
									};
								}												
							}
						}
						
						if(enemyInfo.actor.counterBehavior == "attack" || $gameTemp.enemyAction == null){
							var weapon = $battleCalc.getBestWeapon(enemyInfo, actorInfo);
							if($gameTemp.currentBattleEnemy.battleMode() !== 'disabled' && weapon){
								$gameTemp.enemyAction = {
									type: "attack",
									attack: weapon,
									target: 0
								};
							} else {
								$gameTemp.enemyAction = {
									type: "none",
									attack: 0,
									target: 0
								};
							}
						}
							
						var position = {
							x: $gameTemp.activeEvent().posX(),
							y: $gameTemp.activeEvent().posY(),
						};
						var supporters = $statCalc.getSupportAttackCandidates("player", position, $statCalc.getCurrentAliasedTerrainIdx($gameTemp.currentBattleActor));
						
						var aSkill = $statCalc.getPilotStat($gameTemp.currentBattleActor, "skill");
						var dSkill = $statCalc.getPilotStat($gameTemp.currentBattleEnemy, "skill");
						
						if((aSkill - dSkill >= 20) && $statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["attack_again"])){
							supporters.push({actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}});
						}
						
						if($statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_support"]) || 
							$statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_target_support"])){
							supporters = [];
						}
						
						var allRequired = false;
						if($gameTemp.actorAction && $gameTemp.actorAction.attack){
							allRequired = $gameTemp.actorAction.attack.isAll ? 1 : -1;
						}

						$gameTemp.currentTargetingSettings = null;	
						$battleCalc.updateTwinActions();
						
						$gameTemp.supportDefendCandidates = [];
						$gameTemp.supportDefendSelected = -1;
						
						$gameTemp.supportAttackCandidates = [];
						$gameTemp.supportAttackSelected = -1;						
						
						let canUseSupporter = true;
						if($gameTemp.actorAction){					
							let interactionInfo = $gameSystem.getCombatInteractionInfo($gameTemp.actorAction.attack);
							
							if(interactionInfo.isBetweenFriendlies && interactionInfo.interactionType == Game_System.INTERACTION_STATUS){
								canUseSupporter = false;
							}
							if(interactionInfo.isBetweenFriendlies){
								if(!$gameTemp.actorAction.attack.alliesCounter){
									$gameTemp.enemyAction = {
										type: "none",
										attack: 0,
										target: 0
									};
								}
							} else {
								if(!$gameTemp.actorAction.attack.enemiesCounter){
									$gameTemp.enemyAction = {
										type: "none",
										attack: 0,
										target: 0
									};
								}
							}
						}						
						
						if(canUseSupporter){	
						
							var supporterInfo = [];
							var supporterSelected = -1;
							var bestDamage = 0;
							for(var i = 0; i < supporters.length; i++){
								supporters[i].actor.isSupport = true;
								var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], enemyInfo, false, false, false, allRequired);
								if(weaponResult.weapon){								
									supporters[i].action = {type: "attack", attack: weaponResult.weapon};
									supporterInfo.push(supporters[i]);
									if(bestDamage < weaponResult.damage){
										bestDamage = weaponResult.damage;
										supporterSelected = supporterInfo.length - 1;
									}							
								} else {
									supporters[i].actor.isSupport = false;
								}
							}										
							$gameTemp.supportAttackCandidates = supporterInfo;
							$gameTemp.supportAttackSelected = supporterSelected;
							
							$battleCalc.updateTwinSupportAttack();
							
							if(!$gameTemp.actorAction || !$gameTemp.actorAction.attack || !$gameTemp.actorAction.attack.isAll){
								var supporters = $statCalc.getSupportDefendCandidates(
									$gameSystem.getFactionId($gameTemp.currentBattleEnemy), 
									{x: event.posX(), y: event.posY()},
									$statCalc.getCurrentAliasedTerrainIdx($gameTemp.currentBattleEnemy)
								);
								
								if($statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_support"]) || 
									$statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_target_support"])){
									supporters = [];
								}
								
								var supporterSelected = -1;
								var minDamage = -1;
								for(var i = 0; i < supporters.length; i++){
									supporters[i].action = {type: "defend", attack: null};											
									
									var damageResult = $battleCalc.performDamageCalculation(
										{actor: actorInfo.actor, action: $gameTemp.actorAction},
										supporters[i],
										true,
										false,
										true	
									);
									
									if(minDamage == -1 || damageResult.damage < minDamage){
										minDamage = damageResult.damage;
										supporterSelected = i;
									}
								}
								$gameTemp.supportDefendCandidates = supporters;
								$gameTemp.supportDefendSelected = supporterSelected;
							}
						}																			
						
						
						$gameTemp.setTargetEvent(event);
						$statCalc.invalidateAbilityCache($gameTemp.currentBattleActor);
						$statCalc.invalidateAbilityCache($gameTemp.currentBattleEnemy);
						$gameSystem.setSubBattlePhase('battle_window');
						$statCalc.applyMoveCost(actionBattlerArray[1]);
						$gameTemp.preferredActorTwinTarget = null;
						$gameTemp.pushMenu = "before_battle";
					}	
				}								
			}
		}
	});	
}

function GameState_actor_target_spirit(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_target_spirit.prototype = Object.create(GameState.prototype);
GameState_actor_target_spirit.prototype.constructor = GameState_actor_target_spirit;

GameState_actor_target_spirit.prototype.update = function(scene){
	
	if (Input.isTriggered('pageup')) {                   
		$gameSystem.getNextLSpiritTarget();
	} else if (Input.isTriggered('pagedown')) {      
		$gameSystem.getNextRSpiritTarget();
	}
	
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		SoundManager.playCancel();
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gameSystem.setSubBattlePhase("actor_command_window");                  
	}
	return true;
}

GameState_actor_target_spirit.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_target_spirit.prototype.updateMapEvent = function(x, y, triggers){
	var spiritDef = $spiritManager.getSpiritDef($gameTemp.currentTargetingSpirit.idx);
	$gameMap.eventsXy(x, y).forEach(function(event) {
		if (event.isTriggerIn(triggers) && !event.isErased()) {
			var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
			var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
			if(targetBattlerArray){		
				var target = targetBattlerArray[1];
				if (($gameSystem.isFriendly(target, "player") && spiritDef.targetType == "ally") || (!$gameSystem.isFriendly(target, "player")  && spiritDef.targetType == "enemy")) {
					var spiritInfo = $gameTemp.currentTargetingSpirit;	
				
					var caster;
					if(spiritInfo.caster){
						caster = spiritInfo.caster;
					} else {
						caster = actionBattlerArray[1];
					}
					
					if(spiritDef.singleTargetEnabledHandler(target)){
						$spiritManager.applyEffect($gameTemp.currentTargetingSpirit.idx, caster, [target], $gameTemp.currentTargetingSpirit.cost);
						$gamePlayer.locate(event.posX(), event.posY());
						
						$gameTemp.spiritTargetActor = target;
						$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: target, idx: $gameTemp.currentTargetingSpirit.idx}}];
						$gameSystem.setSubBattlePhase('spirit_activation');
						
						$gameTemp.spiritWindowDoneHandler = function(){
							$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
							$gameTemp.popMenu = true;
							$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
							$gameSystem.setSubBattlePhase("actor_command_window");
						}	
						$gameTemp.pushMenu = "spirit_activation";					
					}																					
				}
			}
		}
	});
}

function GameState_after_battle(){
	GameState.call(this);
}

GameState_after_battle.prototype = Object.create(GameState.prototype);
GameState_after_battle.prototype.constructor = GameState_after_battle;

GameState_after_battle.prototype.update = function(scene){
	if(!$gameSystem.optionAfterBattleBGM){
		$songManager.playStageSong();
	}
	if($gameTemp.playingBattleDemo){
		$gameSystem.setSubBattlePhase($gameTemp.returnState);
		$gameTemp.scriptedBattleDemoId = null;
		$gameTemp.playingBattleDemo = false;
	} else {
		$gameTemp.clearMoveTable();
		scene.srpgBattlerDeadAfterBattle();
	}			
    return false;
}

function GameState_auto_spirits(){
	GameState.call(this);
}

GameState_auto_spirits.prototype = Object.create(GameState.prototype);
GameState_auto_spirits.prototype.constructor = GameState_auto_spirits;

GameState_auto_spirits.prototype.update = function(scene){
	
	if($gameMap._interpreter.isRunning()){
		return true;
	}

	if(!scene.handlingAutoSpirits){
		scene.handlingAutoSpirits = true;
		$gameTemp.spiritWindowDoneHandler = function(){
			handleAutoSpirits()
		}	
		function handleAutoSpirits(){
			$gameTemp.popMenu = true;
			if($gameTemp.autoSpirits.length){
				$gameTemp.queuedActorEffects = [];
				var currentActor = $gameTemp.autoSpirits[0].actor;
				var remaining = [];
				$gameTemp.autoSpirits.forEach(function(autoSpirit){
					if(autoSpirit.actor == currentActor){							
						$gameTemp.spiritTargetActor = autoSpirit.actor;
						$gamePlayer.locate(autoSpirit.actor.event.posX(), autoSpirit.actor.event.posY());
						$spiritManager.applyEffect(autoSpirit.spirit, autoSpirit.actor, [autoSpirit.actor], 0);
						$gameTemp.queuedActorEffects.push({type: "spirit", parameters: {idx: autoSpirit.spirit, target: autoSpirit.actor}})
					} else {
						remaining.push(autoSpirit);
					}
				});
				
				$gameTemp.autoSpirits = remaining;
				
				
				$gameSystem.setSubBattlePhase('spirit_activation');				
				$gameTemp.pushMenu = "spirit_activation";		
			} else {
				scene.handlingAutoSpirits = false;
				if($gameTemp.AIActors.length){
					$gameSystem.setBattlePhase('AI_phase');
					$gameSystem.setSubBattlePhase('enemy_command');
				} else {			
					$gameSystem.setSubBattlePhase('initialize');
				}	
			}			
		}
		handleAutoSpirits();
	}		
	return true;
}

function GameState_await_character_anim(){
	GameState.call(this);
}

GameState_await_character_anim.prototype = Object.create(GameState.prototype);
GameState_await_character_anim.prototype.constructor = GameState_await_character_anim;

GameState_await_character_anim.prototype.update = function(scene){
	if($gameTemp.animCharacter){
		if($gameTemp.animCharacter.isAnimationPlaying()){
			return false;
		} else {					
			$gameSystem.setSubBattlePhase('normal');
			$gameTemp.animCharacter = null;
			return true;
		}
	}
}

function GameState_battle_basic(){
	GameState.call(this);
}

GameState_battle_basic.prototype = Object.create(GameState.prototype);
GameState_battle_basic.prototype.constructor = GameState_battle_basic;

function GameState_before_enemy_map_animation(){
	GameState.call(this);
}

GameState_before_enemy_map_animation.prototype = Object.create(GameState.prototype);
GameState_before_enemy_map_animation.prototype.constructor = GameState_before_enemy_map_animation;

GameState_before_enemy_map_animation.prototype.update = function(scene){
	if($gameTemp.mapAttackRetargetDelay > 0){
		$gameTemp.mapAttackRetargetDelay--;
		return false;
	}
	
	if($gameTemp.showBeforeEnemyMapAnimation){
		$gameSystem.highlightedTiles = [];
		$gameSystem.highlightsRefreshed = true;	
		$gameTemp.showBeforeEnemyMapAnimation = false;
		var bestMapAttack = $gameTemp.enemyMapAttackDef;
		if(bestMapAttack.bestPosition){
			var mapAttackDef = $mapAttackManager.getDefinition(bestMapAttack.attack.mapId);
			$gamePlayer.locate(bestMapAttack.bestPosition.x, bestMapAttack.bestPosition.y);
			
			$gameSystem.highlightedMapRetargetTiles = [];
			
			var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));						
			tileCoordinates = scene.getAdjustedMapAttackCoordinates(tileCoordinates, $gameTemp.mapTargetDirection);
		
			var x = mapAttackDef.retargetInfo.initialPosition.x;
			var y = mapAttackDef.retargetInfo.initialPosition.y;
			var adjusted = scene.getAdjustedMapAttackCoordinates([[x, y]], $gameTemp.mapTargetDirection);
			
			var deltaX =  bestMapAttack.bestPosition.x - adjusted[0][0];
			var deltaY =  bestMapAttack.bestPosition.y - adjusted[0][1];
			
			for(var i = 0; i < tileCoordinates.length; i++){
				tileCoordinates[i][0]+=deltaX;
				tileCoordinates[i][1]+=deltaY;

				$gameSystem.highlightedMapRetargetTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "white"});
				$gameSystem.highlightsLayer1Refreshed = true;					
			}	
			
			$gameTemp.currentMapReTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));	
			
			$gameTemp.showingEnemyMapRetarget = true;
			$gameTemp.enemyMapRetargetTimer = 30;						
		} else {
			$gameTemp.lockCameraToCursor = true;
			$gamePlayer.locate($gameTemp.activeEvent().posX(),$gameTemp.activeEvent().posY());
			$gameTemp.lockCameraToCursor = false;
			
			$gameSystem.setSubBattlePhase('map_attack_animation');
		}				
	}
	
	if($gameTemp.showingEnemyMapRetarget){
		if($gameTemp.enemyMapRetargetTimer < 0){
			$gameTemp.showingEnemyMapRetarget = false;
			$gameSystem.setSubBattlePhase('map_attack_animation');
			//$gameTemp.lockCameraToCursor = true;
			//$gamePlayer.locate($gameTemp.activeEvent().posX(),$gameTemp.activeEvent().posY());
			//$gameTemp.lockCameraToCursor = false;
			$gameTemp.mapAttackAnimationDelay = 30;
		} 				
		$gameTemp.enemyMapRetargetTimer--;
	}
	
	return false;
}


function GameState_map_attack_animation(){
	GameState.call(this);
}

GameState_map_attack_animation.prototype = Object.create(GameState.prototype);
GameState_map_attack_animation.prototype.constructor = GameState_map_attack_animation;

GameState_map_attack_animation.prototype.update = function(scene){
	if($gameTemp.mapAttackAnimationDelay > 0){
		$gameTemp.mapAttackAnimationDelay--;
		return;
	}
	$gameSystem.highlightedMapRetargetTiles = [];
	$gameSystem.highlightsLayer1Refreshed = true;	
	$gameSystem.highlightsRefreshed = true;	
	
	if(!$gameTemp.mapAttackAnimationStarted){
		$songManager.playBattleSong($gameTemp.currentBattleActor);
		$gameTemp.clearMoveTable();
		var attack;
		if($gameTemp.isEnemyAttack){
			attack = $gameTemp.enemyAction.attack;
		} else {
			attack = $gameTemp.actorAction.attack;
		}
		var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
		$gameTemp.mapAttackAnimationStarted = true;
		$gameTemp.mapAttackAnimationDuration = mapAttackDef.animInfo.duration || 60;
		
		var textInfo = mapAttackDef.textInfo;
		if(textInfo && textInfo.faceName != null && textInfo.faceIdx != null && textInfo.text){
			$gameMap._interpreter.showMapAttackText(textInfo.faceName, textInfo.faceIdx, textInfo.text);
		}	
		$gameTemp.mapAttackAnimationPlaying = false;			
		
	} else {
		if(!$gameMap._interpreter.updateWaitMode()){
			if(!$gameTemp.mapAttackAnimationPlaying){
				$gameTemp.mapAttackAnimationPlaying = true;
				var attack;
				if($gameTemp.isEnemyAttack){
					attack = $gameTemp.enemyAction.attack;
				} else {
					attack = $gameTemp.actorAction.attack;
				}
				var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
				
				var options = JSON.parse(JSON.stringify(mapAttackDef.animInfo));					
				
				var activeEvent;
				if(!mapAttackDef.retargetInfo || !mapAttackDef.retargetInfo.shape.length){
					activeEvent = $gameTemp.activeEvent();
					options.direction = $gameTemp.mapTargetDirection;
				} else {
					activeEvent = $gameMap.requestDynamicEvent();
					activeEvent.isMAPAttackEvent = true;
					activeEvent.locate($gamePlayer._x, $gamePlayer._y);
					//options.direction = "up";
					//options.offset = {x: 0, y: 0};
				}				
				
				$gameTemp.animCharacter = activeEvent;
			
				activeEvent.requestAnimation(mapAttackDef.animInfo.animId, options);
			} else if(!$gameTemp.awaitingMapAttackAnim){
				if(!$gameTemp.animCharacter.isAnimationPlaying()){
					$gameTemp.afterMapAttackAnimationDelay = 30;
					$gameTemp.awaitingMapAttackAnim = true;
					if($gameTemp.animCharacter.isMAPAttackEvent){
						delete $gameTemp.animCharacter.isMAPAttackEvent;
						$gameTemp.animCharacter.isUnused = true;	
					}					
				}
			}					
		}				
	} 

	if($gameTemp.awaitingMapAttackAnim){
		if($gameTemp.afterMapAttackAnimationDelay < 0){
			$gameTemp.animCharacter = null;
			$gameTemp.mapAttackAnimationStarted = false;
			$gameTemp.awaitingMapAttackAnim = false;
			scene.startMapAttackResultDisplay();
		}		
		$gameTemp.afterMapAttackAnimationDelay--;	
	}
	return true;
}


function GameState_process_map_attack_queue(){
	GameState.call(this);
}

GameState_process_map_attack_queue.prototype = Object.create(GameState.prototype);
GameState_process_map_attack_queue.prototype.constructor = GameState_process_map_attack_queue;

GameState_process_map_attack_queue.prototype.update = function(scene){
	if(!$gameTemp.processingMapAttackEffect){
		$gameTemp.processingMapAttackEffect = true;
		if($gameTemp.mapAttackEffectQueue.length){
			var effect = $gameTemp.mapAttackEffectQueue.shift();
			var target = effect.parameters.target;
			var event = $statCalc.getReferenceEvent(target);					
			
			$gamePlayer.locate(event.posX(), event.posY());
			$gameTemp.queuedActorEffects = [effect];			
			$gameTemp.spiritTargetActor	= target;
			$gameTemp.spiritWindowDoneHandler = function(){						
				$gameTemp.processingMapAttackEffect = false;
			}	
			if(!$gameTemp.battleEffectWindowIsOpen){
				$gameTemp.battleEffectWindowIsOpen = true;
				$gameTemp.pushMenu = "spirit_activation";
			}
			scene._spiritAnimWindow.show();
				
		} else {
			$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			scene.srpgBattlerDeadAfterBattle();
			$gameTemp.popMenu = true;
		}				
	}
	return true;
}

function GameState_normal(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: true,
		summaries: true,
		popupAnims: true
	};
}

GameState_normal.prototype = Object.create(GameState.prototype);
GameState_normal.prototype.constructor = GameState_normal;


GameState_normal.prototype.update = function(scene){
	$gameTemp.activeShip = null;
	$gameTemp.actorAction = {};
	$gameTemp.enemyAction = {};
	$gameTemp.isEnemyAttack = false;
	$gameTemp.currentBattleEnemy = null;
	$gameTemp.currentBattleActor = null;
	$gameTemp.battleOccurred = false;
	$gameTemp.mapAttackOccurred = false;
	$gameTemp.supportAttackSelected = -1;
	$gameTemp.supportDefendSelected = -1;
	$gameTemp.attackingTwinAction = null;
	$gameTemp.defendingTwinAction = null;
	$gameTemp.isPostMove = false;
	$gameTemp.isHitAndAway = false;		
	$gameTemp.currentMapTargets	= [];
	$gameTemp.unitHitInfo = {};
	
	if(!scene._mapButtonsWindow.visible && !$gameTemp.onMapSaving){
		scene._mapButtonsWindow.open();
		scene._mapButtonsWindow.show();
	}
	
	if (!$gameSystem.isSRPGMode()){
		if(Input.isTriggered('menu')){
			scene.showPauseMenu();
			$gameSystem.setSubBattlePhase('pause_menu');		
			scene._mapButtonsWindow.requestRedraw();	
		}
		return;
	}
	
	
	
	if($gameTemp.supportAttackCandidates && $gameTemp.supportAttackCandidates.length){
		$gameTemp.supportAttackCandidates.forEach(function(candidate){
			candidate.actor.isSupport = false;
			if(candidate.actor.subTwin){
				candidate.actor.subTwin.isSupport = false;
			}
		});
		$gameTemp.supportAttackCandidates = [];
	}

	
	if($gameMap.isEventRunning() || $gameSystem.isIntermission()){
		scene._mapButtonsWindow.hide();
		scene._mapButtonsWindow.close();
		return true;
	}
	
	if($gameTemp.isDraggingMap){
		return true;
	}
	
	previousPosition = $gameTemp.previousCursorPosition || {x: -1, y: -1};
	var currentPosition = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
	$gameTemp.previousCursorPosition = currentPosition;			

	let hasActiveZones = $gameSystem.isZoneActiveAtTile(currentPosition);		
	
	var summaryUnit = $statCalc.activeUnitAtPosition(currentPosition);
	if(summaryUnit && $gameTemp.summariesTimeout <= 0){
		var previousUnit = $gameTemp.summaryUnit;
		$gameTemp.summaryUnit = summaryUnit;	
		if(!scene._summaryWindow.visible || $gameTemp.summaryUnit != previousUnit){
			scene._summaryWindow.show();
		}			

		if(!$gameTemp.commanderAuraVisible || $gameTemp.summaryUnit != previousUnit){
			
			$gameTemp.commanderAuraVisible = true;
			var abilityAuraLookup = $statCalc.getAbilityAura(summaryUnit);
			$gameSystem.highlightedTiles = [];
			Object.keys(abilityAuraLookup).forEach(function(x){
				Object.keys(abilityAuraLookup[x]).forEach(function(y){
					$gameSystem.highlightedTiles.push({x: x, y: y, color: abilityAuraLookup[x][y]});
				});
			});
			
			$gameSystem.highlightsRefreshed = true;
			
			if(!$gameSystem.isEnemy($gameTemp.summaryUnit)){
				$gameTemp.showAllyAttackIndicator = true;
				$gameTemp.showAllyDefendIndicator = true;
			} else {
				$gameTemp.showEnemyAttackIndicator = true;
				$gameTemp.showEnemyDefendIndicator = true;
			}
		}
		
	} else {
		$gameTemp.summaryUnit = null;
		scene._summaryWindow.hide();
		if($gameTemp.commanderAuraVisible){
			$gameTemp.commanderAuraVisible = false;
			$gameSystem.highlightedTiles = [];
			$gameSystem.highlightsRefreshed = true;
		}				
		
		$gameTemp.showAllyAttackIndicator = false;
		$gameTemp.showAllyDefendIndicator = false;
		$gameTemp.showEnemyAttackIndicator = false;
		$gameTemp.showEnemyDefendIndicator = false;
		
		if(Input.isTriggered('ok')){			
			scene.showPauseMenu();
			$gameSystem.setSubBattlePhase('pause_menu');		
			scene._mapButtonsWindow.requestRedraw();	
		} else {
			$gameTemp.OKHeld = false;
		}
		
		if(Input.isTriggered('menu') && !hasActiveZones){
			$gameSystem.showWillIndicator = !$gameSystem.showWillIndicator;
		}
	}	
	
	var regionId = $gameMap.regionId(currentPosition.x, currentPosition.y);
	var terrainDetails;
	if($gameSystem.regionAttributes && $gameSystem.regionAttributes[regionId]){
		terrainDetails = $gameSystem.regionAttributes[regionId];		
	} else {
		terrainDetails = $gameMap.getTilePropertiesAsObject({x: currentPosition.x, y: currentPosition.y});	
	}
	
	if(summaryUnit && terrainDetails){
		terrainDetails = $statCalc.getCurrentTerrainMods(summaryUnit);		
	}  
	
	if(terrainDetails && $gameTemp.summariesTimeout <= 0 && !$gameTemp.onMapSaving){
		$gameTemp.terrainDetails = terrainDetails;
		if(!scene._terrainDetailsWindow.visible || previousPosition.x != currentPosition.x || previousPosition.y != currentPosition.y){
			scene._terrainDetailsWindow.show();
		}
	} else {
		scene._terrainDetailsWindow.hide();
	}
	
	if(hasActiveZones && $gameTemp.summariesTimeout <= 0 && !$gameTemp.onMapSaving){
		if(!scene._zoneSummaryWindow.visible || previousPosition.x != currentPosition.x || previousPosition.y != currentPosition.y){
			scene._zoneSummaryWindow.show();
		}
	} else {
		scene._zoneSummaryWindow.hide();
	}
	
	$gameTemp.summariesTimeout--;
	if(hasActiveZones && Input.isTriggered("menu")){		
		$gameSystem.setSubBattlePhase('wait');
		$gameTemp.pushMenu = "zone_status";		
	} else if(summaryUnit && Input.isTriggered("menu")){
		$gameTemp.detailPagesWindowCancelCallback = function(){
			$gameTemp.detailPagesWindowCancelCallback = null;
			$gameSystem.setSubBattlePhase('normal');
		};
		$gameTemp.currentMenuUnit = {
			actor: summaryUnit,
			mech: summaryUnit.SRWStats.mech
		};
		$gameTemp.detailPageMode = "map";
		$gameSystem.setSubBattlePhase('enemy_unit_summary');
		$statCalc.invalidateAbilityCache(summaryUnit);
		$gameTemp.pushMenu = "detail_pages";
	}		
	if(Input.isTriggered("select")){
		if($gameSystem.foregroundSpriteToggleState == null){
			$gameSystem.foregroundSpriteToggleState = 0;
		}
		$gameSystem.foregroundSpriteToggleState++;
		if($gameSystem.foregroundSpriteToggleState > 2){
			$gameSystem.foregroundSpriteToggleState = 0;
		}	
	}
	if(!$gameSystem.isIntermission()) {
		$gameTemp.isPostMove = false;
		if (Input.isTriggered('pageup')) {                   
			$gameSystem.getNextLActor();
		} else if (Input.isTriggered('pagedown')) {      
			$gameSystem.getNextRActor();
		}
	}
	return true;
}

GameState_normal.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_normal.prototype.updateMapEvent = function(x, y, triggers){
	if($gameTemp.isDraggingMap){
		return;
	}
	if($gamePlayer.wasTouchMoved){
		return; //do no process event triggers on the same click as moving the cursor
	}
	$gameMap.eventsXy(x, y).forEach(function(event) {
		if (event.isTriggerIn(triggers) && !event.isErased() && $gameSystem.EventToUnit(event.eventId()) != null) {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			if ((event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') && !$statCalc.isAI(battlerArray[1])) {
				SoundManager.playOk();
				$gameTemp.setActiveEvent(event);								
				if (battlerArray[1].canInput() == true) {
					$gameSystem.highlightedTiles = [];
					$gameSystem.highlightsRefreshed = true;
					$gameTemp.commanderAuraVisible = false;
					
					$gameTemp.reserveOriginalPos($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
					$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameParty.pushSrpgBattleActors(battlerArray[1]);
					$statCalc.invalidateAbilityCache(battlerArray[1]);
					//ensure that a live unit is no longer treated as support
					battlerArray[1].isSupport = false;
					$gameSystem.setSubBattlePhase('actor_command_window');
				} else {
					$gameTemp.detailPagesWindowCancelCallback = function(){
						$gameTemp.detailPagesWindowCancelCallback = null;
						$gameSystem.setSubBattlePhase('normal');
					}
					
					var battlerArray = $gameSystem.EventToUnit(event.eventId());
					$gameTemp.currentMenuUnit = {
						actor: battlerArray[1],
						mech: battlerArray[1].SRWStats.mech
					};
					$gameTemp.detailPageMode = "map";
					$gameSystem.setSubBattlePhase('enemy_unit_summary');
					$statCalc.invalidateAbilityCache(battlerArray[1]);
					$gameTemp.pushMenu = "detail_pages";
					
				}
				return true;
			} else if (event.isType() === 'enemy' || (battlerArray && $statCalc.isAI(battlerArray[1]))) {
				
				$gameSystem.srpgMakeMoveTable(event);
				$gameSystem.setSubBattlePhase('enemy_range_display');
				Input.clear();
				TouchInput.clear();
				return true;
				
			} else if (event.isType() === 'playerEvent') {
				if (event.pageIndex() >= 0) event.start();
				return true;
			}
		}
	});
}

function GameState_confirm_boarding(){
	GameState.call(this);
}

GameState_confirm_boarding.prototype = Object.create(GameState.prototype);
GameState_confirm_boarding.prototype.constructor = GameState_confirm_boarding;

function GameState_confirm_end_turn(){
	GameState.call(this);
}

GameState_confirm_end_turn.prototype = Object.create(GameState.prototype);
GameState_confirm_end_turn.prototype.constructor = GameState_confirm_end_turn;

function GameState_cancel_move(){
	GameState.call(this);
}

GameState_cancel_move.prototype = Object.create(GameState.prototype);
GameState_cancel_move.prototype.constructor = GameState_cancel_move;

GameState_cancel_move.prototype.update = function(scene){		

	$gameSystem.updateAbilityZones($gameTemp.activeEvent().eventId());
	
	$gameTemp.activeEvent().locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);	
	$gamePlayer.locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);	
	
	$gameSystem.setSubBattlePhase("actor_command_window");	
}

function GameState_end_actor_turn(){
	GameState.call(this);
}

GameState_end_actor_turn.prototype = Object.create(GameState.prototype);
GameState_end_actor_turn.prototype.constructor = GameState_end_actor_turn;

GameState_end_actor_turn.prototype.update = function(scene){
	if($gameSystem.srpgWaitMoving()){
		this._waitAfterMove = 10;
		return;
	}
	if(this._waitAfterMove > 0){
		this._waitAfterMove--;
		return;
	}
	if($gameTemp.eraseActorAfterTurn){
		$gameTemp.activeEvent().erase();
		$statCalc.applyRelativeTransforms();
	}
	scene.srpgPrepareNextAction();
}

function GameState_enemy_attack(){
	GameState.call(this);
}

GameState_enemy_attack.prototype = Object.create(GameState.prototype);
GameState_enemy_attack.prototype.constructor = GameState_enemy_attack;

function GameState_enemy_command(){
	GameState.call(this);
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false,
		popupAnims: true
	};
}

GameState_enemy_command.prototype = Object.create(GameState.prototype);
GameState_enemy_command.prototype.constructor = GameState_enemy_command;

GameState_enemy_command.prototype.update = function(scene){
	if (!$gameMap.isEventRunning()) {
		
		$gameTemp.AIWaitTimer--;
		if($gameTemp.AIWaitTimer < 0){		
			$gameTemp.unitHitInfo = {};
			scene.srpgInvokeAICommand();		
		}			
	}	
	return true;
}

function GameState_enemy_move(){
	GameState.call(this);
}

GameState_enemy_move.prototype = Object.create(GameState.prototype);
GameState_enemy_move.prototype.constructor = GameState_enemy_move;

GameState_enemy_move.prototype.update = function(scene){
	if (!$gameMap.isEventRunning()) {
		$gameTemp.AIWaitTimer--;
		if($gameTemp.AIWaitTimer < 0){	
			scene.srpgInvokeAIMove();			
			//$gameTemp.AIWaitTimer = 30;				
		}
	}
	return true;
}

function GameState_enemy_action(){
	GameState.call(this);
}

GameState_enemy_action.prototype = Object.create(GameState.prototype);
GameState_enemy_action.prototype.constructor = GameState_enemy_action;

GameState_enemy_action.prototype.update = function(scene){
	if (!$gameMap.isEventRunning() && !$gameSystem.srpgWaitMoving()) {
		$gameTemp.AIWaitTimer--;
		if($gameTemp.AIWaitTimer < 0){	
			$gamePlayer.setTransparent(false);
			scene.srpgInvokeAIAction();		
			$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(20);;				
		}
	}
	return true;
}


function GameState_enemy_item_usage(){
	GameState.call(this);
}

GameState_enemy_item_usage.prototype = Object.create(GameState.prototype);
GameState_enemy_item_usage.prototype.constructor = GameState_enemy_item_usage;

GameState_enemy_item_usage.prototype.update = function(scene){
	if(!$gameTemp.handlingItemAnim){
		if(ENGINE_SETTINGS.AI_USES_ITEMS){
			const actor = $gameSystem.getActiveUnit();
			let validConsumables = $statCalc.getAIConsumables(actor);
			if(validConsumables.length){
				let current = validConsumables.pop();
				$gameTemp.handlingItemAnim = true;	
				$statCalc.setConsumableUsed(actor, current.listIdx);
				$itemEffectManager.applyConsumable(actor, current.itemIdx, function(){
					$gameTemp.handlingItemAnim = false;
					$gameTemp.spiritWindowDoneHandler = null;
					$gameTemp.popMenu = true;
					$gameSystem.setSubBattlePhase('enemy_item_usage');	
				});					
				return true;
			}	
		}			
		scene.srpgContinueAICommand();
	}	
	return true;
}

function GameState_enemy_range_display(){
	GameState.call(this);
}

GameState_enemy_range_display.prototype = Object.create(GameState.prototype);
GameState_enemy_range_display.prototype.constructor = GameState_enemy_range_display;

GameState_enemy_range_display.prototype.update = function(scene){
	if(Input.isTriggered("cancel") || TouchInput.isCancelled()){
		$gameTemp.clearMoveTable();
		$gameSystem.setSubBattlePhase("normal");
	}
	if(Input.isTriggered("ok") || TouchInput.isTriggered()){
		var summaryUnit = $statCalc.activeUnitAtPosition({x: $gamePlayer.posX(), y: $gamePlayer.posY()});
		if(summaryUnit){
			$gameTemp.clearMoveTable();
			$gameTemp.detailPagesWindowCancelCallback = function(){
				$gameTemp.detailPagesWindowCancelCallback = null;
				$gameSystem.setSubBattlePhase('normal');
			};
			$gameTemp.currentMenuUnit = {
				actor: summaryUnit,
				mech: summaryUnit.SRWStats.mech
			};
			$gameTemp.detailPageMode = "map";
			$gameSystem.setSubBattlePhase('enemy_unit_summary');
			$statCalc.invalidateAbilityCache(summaryUnit);
			$gameTemp.pushMenu = "detail_pages";
		}
	}
	return false;
}

function GameState_enemy_targeting_display(){
	GameState.call(this);
}

GameState_enemy_targeting_display.prototype = Object.create(GameState.prototype);
GameState_enemy_targeting_display.prototype.constructor = GameState_enemy_targeting_display;

GameState_enemy_targeting_display.prototype.update = function(scene){	
	if($gameTemp.targetingDisplayCounter <= 0){
		$statCalc.invalidateAbilityCache($gameSystem.getActiveUnit());
		$gameTemp.preferredActorTwinTarget = null;
		$gameTemp.pushMenu = "before_battle";
		$gameSystem.setSubBattlePhase("enemy_attack");
	} else {
		$gameTemp.targetingDisplayCounter--;
	}
	return true;
}


function GameState_enemy_hit_and_away(){
	GameState.call(this);
}

GameState_enemy_hit_and_away.prototype = Object.create(GameState.prototype);
GameState_enemy_hit_and_away.prototype.constructor = GameState_enemy_hit_and_away;

GameState_enemy_hit_and_away.prototype.update = function(scene){
	if($gameSystem.srpgWaitMoving()){
		return;
	}
	if($gameTemp.hitAndAwayTimer > 0){
		$gameTemp.hitAndAwayTimer--;
		return;
	}
	const actor = $gameSystem.getActiveUnit();
	if(!$gameTemp.isPostMove && $statCalc.applyStatModsToValue(actor, 0, ["hit_and_away"])){
		let optimalPos = scene.srpgGetAITargetPosition();	
		if(optimalPos){
			let event = $gameTemp.activeEvent();
			if(optimalPos[0] != event.posX() || optimalPos[1] != event.posY()){
				$gameSystem.srpgMakeMoveTable(event);
				$gameTemp.isPostMove = true;
				$gameTemp.hitAndAwayTimer = $gameSystem.getScaledTime(30);
				var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
				$gameSystem.setSrpgWaitMoving(true);
				event.srpgMoveToPoint({x: optimalPos[0], y: optimalPos[1]});
				$gamePlayer.setTransparent(true);
			} else {
				$gameTemp.isPostMove = true;
			}			
		}	
	} else {
		scene.srpgAfterAction();
	}
	return true;
}

function GameState_enemy_unit_summary(){
	GameState.call(this);
}

GameState_enemy_unit_summary.prototype = Object.create(GameState.prototype);
GameState_enemy_unit_summary.prototype.constructor = GameState_enemy_unit_summary;

function GameState_event_before_battle(){
	GameState.call(this);
}

GameState_event_before_battle.prototype = Object.create(GameState.prototype);
GameState_event_before_battle.prototype.constructor = GameState_event_before_battle;

GameState_event_before_battle.prototype.update = function(scene){
	if(!$gameMap.isEventRunning()){
		if(scene.beforeBattleEventTimer <= 0){
			$gameSystem.setSubBattlePhase("battle_intro")
			scene.playBattleScene();
		} else {
			scene.beforeBattleEventTimer--;
		}				
	} else {
		scene.beforeBattleEventTimer = 20;
	}
	return true;
}

function GameState_event_spirits(){
	GameState.call(this);
}

GameState_event_spirits.prototype = Object.create(GameState.prototype);
GameState_event_spirits.prototype.constructor = GameState_event_spirits;

GameState_event_spirits.prototype.update = function(scene){
	$gameSystem.setSubBattlePhase("event_spirits_display");
	scene.handleEventSpirits($gameTemp.eventSpirits);
	return true;
}

function GameState_event_spirits_display(){
	GameState.call(this);
}

GameState_event_spirits_display.prototype = Object.create(GameState.prototype);
GameState_event_spirits_display.prototype.constructor = GameState_event_spirits_display;

GameState_event_spirits_display.prototype.update = function(scene){
	if(!$gameTemp.playingSpiritAnimations){
		$gameSystem.setSubBattlePhase("normal");
	}
	return true;
}

function GameState_halt(){
	GameState.call(this);
}

GameState_halt.prototype = Object.create(GameState.prototype);
GameState_halt.prototype.constructor = GameState_halt;

GameState_halt.prototype.update = function(scene){
	return false;
}

function GameState_initialize(){
	GameState.call(this);
}

GameState_initialize.prototype = Object.create(GameState.prototype);
GameState_initialize.prototype.constructor = GameState_initialize;

function GameState_battle_intro(){
	GameState.call(this);
}

GameState_battle_intro.prototype = Object.create(GameState.prototype);
GameState_battle_intro.prototype.constructor = GameState_battle_intro;

GameState_battle_intro.prototype.update = function(scene){
	if(scene._transitioningToBattle){
		scene.updateEncounterEffect();
		return false;
	}
	
	if(scene._loadingIntoBattle){
		scene._loadingIntoBattle = false;
		
		setTimeout(function(){
			//hack to remove the black overlay of the map scene while in the battle scene
			scene.removeChild(scene._transitionBackSprite);					
		}, 500);						
		
		$gameSystem.setSubBattlePhase('halt');			
		$battleSceneManager.playBattleScene();
		//
		return false;
	}
}	

function GameState_rewards_display(){
	GameState.call(this);
}

GameState_rewards_display.prototype = Object.create(GameState.prototype);
GameState_rewards_display.prototype.constructor = GameState_rewards_display;

GameState_rewards_display.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || Input.isTriggered('ok') || TouchInput.isCancelled() || TouchInput.isTriggered() || ($gameTemp.rewardsDisplayTimer <= 0 && (Input.isLongPressed('ok') || Input.isLongPressed('cancel') || TouchInput.isLongPressed()))) {
		 $gameTemp.popMenu = true;			 
		 if($gameTemp.rewardsInfo.levelResult.length){			
			$gameSystem.setSubBattlePhase("level_up_display");
			$gameTemp.awaitingLevelUpWindow = false;
		
		} else {				
			scene.srpgPrepareNextAction();
		}				
	 }
	 $gameTemp.rewardsDisplayTimer--;
	 return true;
}

function GameState_level_up_display(){
	GameState.call(this);
}

GameState_level_up_display.prototype = Object.create(GameState.prototype);
GameState_level_up_display.prototype.constructor = GameState_level_up_display;

GameState_level_up_display.prototype.update = function(scene){
	if($gameTemp.awaitingLevelUpWindow){
		if (Input.isTriggered('cancel') || Input.isTriggered('ok') || TouchInput.isTriggered() || TouchInput.isCancelled()|| ($gameTemp.rewardsDisplayTimer <= 0 && (Input.isLongPressed('ok') || Input.isLongPressed('cancel') || TouchInput.isLongPressed()))) {
			$gameTemp.popMenu = true;			
			if($gameTemp.rewardsInfo.levelResult.length){
				$gameTemp.awaitingLevelUpWindow = false;
			} else {
				$gameTemp.rewardsInfo = {};					
				scene.srpgPrepareNextAction();
			}						
		}
	}	

	if(!$gameTemp.awaitingLevelUpWindow){
		$gameTemp.awaitingLevelUpWindow = true;
		var currentResult = $gameTemp.rewardsInfo.levelResult.shift();
		while($gameTemp.rewardsInfo.levelResult.length && !currentResult.details.hasLevelled){
			currentResult = $gameTemp.rewardsInfo.levelResult.shift();
		}					
		if(currentResult && currentResult.details.hasLevelled){
			$gameTemp.currentLevelResult = currentResult;
			$gameTemp.rewardsDisplayTimer = 30;
			
			var se = {};
			se.name = 'SRWLevelUp';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);						
			$gameTemp.pushMenu = "level_up";
		} else {
			$gameTemp.rewardsInfo = {};					
			scene.srpgPrepareNextAction();
		}					
	} 
	
	$gameTemp.rewardsDisplayTimer--;
	return true;
}

function GameState_map_spirit_animation(){
	GameState.call(this);
}

GameState_map_spirit_animation.prototype = Object.create(GameState.prototype);
GameState_map_spirit_animation.prototype.constructor = GameState_map_spirit_animation;

GameState_map_spirit_animation.prototype.update = function(scene){
	if($gameTemp.mapSpiritAnimationDelay > 0){
		$gameTemp.mapSpiritAnimationDelay--;
		return;
	}
	if(!$gameTemp.mapSpiritAnimationStarted){
		$gameTemp.clearMoveTable();
		var attack;
		if($gameTemp.isEnemyAttack){
			attack = $gameTemp.enemyAction.attack;
		} else {
			attack = $gameTemp.actorAction.attack;
		}
		var spiritInfo = $spiritManager.getSpiritDisplayInfo($gameTemp.queuedEffectSpiritId).animInfo;
		
		
		$gameTemp.mapSpiritAnimationStarted = true;
		$gameTemp.mapSpiritAnimationDuration = spiritInfo.duration || 60;
		var activeEvent = $gameTemp.activeEvent();
		var eventX = activeEvent.posX();
		var eventY = activeEvent.posY();
		var spritePosition = {
			x: activeEvent.screenX(),
			y: activeEvent.screenY() - ($gameMap.tileWidth() / 2),
		};
	
		$gameTemp.animCharacter = activeEvent;
		activeEvent.requestAnimation(spiritInfo.animId);
	} else {
		if(!$gameTemp.animCharacter.isAnimationPlaying()){
			$gameTemp.animCharacter = null;
			$gameTemp.mapSpiritAnimationStarted = false;
			$gameSystem.setSubBattlePhase("actor_command_window");
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			scene._mapSrpgActorCommandWindow.activate();	
			scene._mapSrpgActorCommandWindow.show()
		}
		$gameTemp.mapSpiritAnimationDuration--;
	}	
	return true;
}

function GameState_pause_menu(){
	GameState.call(this);
}

GameState_pause_menu.prototype = Object.create(GameState.prototype);
GameState_pause_menu.prototype.constructor = GameState_pause_menu;

GameState_pause_menu.prototype.update = function(scene){
	if(!scene._mapButtonsWindow.visible){
		scene._mapButtonsWindow.open();
		scene._mapButtonsWindow.show();
	}
	if(!$gameTemp.deactivatePauseMenu){
		scene.showPauseMenu();
	}	
	return true;
}

function GameState_process_death(){
	GameState.call(this);
}

GameState_process_death.prototype = Object.create(GameState.prototype);
GameState_process_death.prototype.constructor = GameState_process_death;

GameState_process_death.prototype.update = function(scene){
	if(scene._startDeath){
		scene._currentDeath.event.isDoingSubTwinDeath = false;
		scene._currentDeath.event.isDoingMainTwinDeath = false;
		if(scene._currentDeath.actor.isSubTwin){
			$statCalc.swapEvent($statCalc.getMainTwin(scene._currentDeath.actor).event, true);						
			scene._currentDeath.event.isDoingSubTwinDeath = true;
		} else if($statCalc.isMainTwin(scene._currentDeath.actor)){
			scene._currentDeath.event.isDoingMainTwinDeath = true;
		}
		scene._startDeath = false;
		scene._currentDeath.event.isDoingDeathAnim = true;
	}
	if(scene._deathTimer <= 0){
		
		//scene._currentDeath.event.erase();
		if ($gameSystem.isFriendly(scene._currentDeath.actor, "player")) {
			var delta = 1;
			if(scene._currentDeath.actor.SRWStats.mech.combinesFrom){
				delta = scene._currentDeath.actor.SRWStats.mech.combinesFrom.length;
			}
			
			var oldValue = $gameVariables.value(_existActorVarID) * 1;
			$gameVariables.setValue(_existActorVarID, oldValue - delta);
			if($gameVariables.value(_existActorVarID) < 0){
				$gameVariables.setValue(_existActorVarID, 0);
			}
			
			var oldValue = $gameVariables.value(_actorsDestroyed) * 1;
			$gameVariables.setValue(_actorsDestroyed, oldValue + delta); 
			
			if(scene._currentDeath.event.isType() == "ship"){
				var oldValue = $gameVariables.value(_existShipVarId);
				$gameVariables.setValue(_existShipVarId, oldValue - 1); 	
			}
		} else {
			var oldValue = $gameVariables.value(_existEnemyVarID) * 1;
			$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
			
			var oldValue = $gameVariables.value(_enemiesDestroyed) * 1;
			$gameVariables.setValue(_enemiesDestroyed, oldValue + 1);
		}
		
		if(scene._currentDeath.actor.isSubTwin){
			
		} else {
			scene._currentDeath.event.isUnused = true;
		}
		
		$gameSystem.setSubBattlePhase("process_death_queue");
	}				
	scene._deathTimer--;
	return true;	
}


function GameState_process_death_queue(){
	GameState.call(this);
}

GameState_process_death_queue.prototype = Object.create(GameState.prototype);
GameState_process_death_queue.prototype.constructor = GameState_process_death_queue;

GameState_process_death_queue.prototype.update = function(scene){
	if($gameMap.isEventRunning()){
		return true;
	}
	if($gameTemp.deathQueue.length){
		if(this.erasedActors == null){
			this.erasedActors = [];
		}
		scene._currentDeath = $gameTemp.deathQueue.shift();
		this.erasedActors.push(scene._currentDeath.actor);
		if($gameTemp.deathQueue.length){
			scene._deathTimer = 10;
		} else {
			scene._deathTimer = 40;
		}
		scene._startDeath = true;
		$gameSystem.setSubBattlePhase("process_death");
	} else {
		$statCalc.applyRelativeTransforms();
		if(this.erasedActors){
			for(var i = 0; i < this.erasedActors.length; i++){
				$statCalc.invalidateAbilityCache(this.erasedActors[i]);
			}
		}		
		this.erasedActors = null;
		scene.srpgAfterAction();
	}
	return true;
}

function GameState_process_destroy_transform(){
	GameState.call(this);
}

GameState_process_destroy_transform.prototype = Object.create(GameState.prototype);
GameState_process_destroy_transform.prototype.constructor = GameState_process_destroy_transform;

GameState_process_destroy_transform.prototype.update = function(scene){
	if(scene._startDeath){
		scene._startDeath = false;
	}
	if(scene._deathTimer <= 0){
		
		$gameSystem.setSubBattlePhase("process_death_queue");
	}				
	scene._deathTimer--;
				
	return true;
}

function GameState_process_destroy_transform_queue(){
	GameState.call(this);
}

GameState_process_destroy_transform_queue.prototype = Object.create(GameState.prototype);
GameState_process_destroy_transform_queue.prototype.constructor = GameState_process_destroy_transform_queue;

GameState_process_destroy_transform_queue.prototype.update = function(scene){
	if($gameMap.isEventRunning()){
		return true;
	}
	if($gameTemp.destroyTransformQueue.length){
		scene._currentDeath = $gameTemp.destroyTransformQueue.shift();
		scene._deathTimer = 60;
		scene._startDeath = true;
		$statCalc.transformOnDestruction(scene._currentDeath.actor);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		$gameSystem.setSubBattlePhase("process_destroy_transform");
	} else {
		$gameSystem.setSubBattlePhase("process_death_queue");
	}
	return true;
}

function GameState_rearrange_deploys(){
	GameState.call(this);
	this.allowedActions = {
		cursor: 2,
		menu: false,
		summaries: false
	};
}

GameState_rearrange_deploys.prototype = Object.create(GameState.prototype);
GameState_rearrange_deploys.prototype.constructor = GameState_rearrange_deploys;

GameState_rearrange_deploys.prototype.update = function(scene){
	if(!scene._mapButtonsWindow.visible){
		scene._mapButtonsWindow.open();
		scene._mapButtonsWindow.show();
	}
	if((Input.isTriggered("ok") || TouchInput.isTriggered()) && !$gamePlayer.isMoving()){					
		var event;// = $statCalc.activeUnitAtPosition({x: $gamePlayer.posX(), y: $gamePlayer.posY()}).event;
		var events = $gameMap.events();
		events.forEach(function(e){
			if(e.posX() == $gamePlayer.posX() && e.posY() == $gamePlayer.posY()){
				event = e;
			}
		});
		if(event && event.isType() == "actor" && !event.isScriptedDeploy){				
			var slot = $gameSystem.getEventDeploySlot(event);
			var deployInfo = $gameSystem.getDeployInfo();	
			var deployList = $gameSystem.getActiveDeployList();	
			if(!deployInfo.lockedSlots[slot]){
				SoundManager.playOk();	
				if($gameTemp.currentSwapSource == -1){
					$gameTemp.currentSwapSource = slot;
					$gameTemp.currentSwapSourcePosition = {x: event.posX(), y: event.posY()};
					$gameSystem.highlightDeployTiles();
				} else {						
					var swapSource = $gameTemp.currentSwapSource;
					var selection = slot;									
					
					var sourceEntry = deployList[swapSource] || {};
					var targetEntry = deployList[selection] || {};
					
					var sourceActor = sourceEntry.main;
					var targetActor = targetEntry.main;
					
					var validPositions = (!sourceActor || $statCalc.canStandOnTile($gameActors.actor(sourceActor), {x: event.posX(), y: event.posY()})) && (!targetActor || $statCalc.canStandOnTile($gameActors.actor(targetActor), $gameTemp.currentSwapSourcePosition));
					if(validPositions){						
						var tmp = deployList[swapSource];
						deployList[swapSource] = deployList[selection];
						
						deployList[selection] = tmp;
						
						$gameTemp.currentSwapSource = -1;
						
						$gameSystem.redeployActors();
						$gameSystem.highlightDeployTiles();
						$gameMap.setEventImages();
					} else {
						SoundManager.playBuzzer();	
					}							
				}
			} else {
				SoundManager.playBuzzer();	
			}
		}	
	}	

	if(!Input.isTriggered("menu")){
		$gameTemp.menuStillHeld = false;
	}

	if((!$gameTemp.menuStillHeld && Input.isTriggered("menu")) || $gameTemp.mapButtonClicked("deploy")){	
		$gameTemp.clearMapButton("deploy");
		$gameSystem.removeDeployTileHighlights();
		$gameTemp.doingManualDeploy = false;
		$gameTemp.disableHighlightGlow = false;
		$gameSystem.undeployActors(true);
		$gameSystem.deployActors(true, $gameTemp.manualDeployType, true);
		$gameSystem.setBattlePhase($gameTemp.deployContextState);
		$gameSystem.setSubBattlePhase($gameTemp.deployContextSubState);
		
		var deployInfo = $gameSystem.getDeployInfo();
		deployInfo.count = 0;
		deployInfo.assigned = {};
		deployInfo.assignedSub = {};
		deployInfo.assignedShips = {};
		deployInfo.lockedSlots = {};
		deployInfo.lockedShipSlots = {};
		deployInfo.doNotDeploySlots = {};
		deployInfo.minDeployCount = 1;
		$gameSystem.setDeployInfo(deployInfo);
		
		$gameMap._interpreter.setWaitMode("enemy_appear");
		$gameTemp.enemyAppearQueueIsProcessing = true;
		$gameTemp.unitAppearTimer = 0;
		scene._mapButtonsWindow.hide();
		scene._mapButtonsWindow.close();
	} 

	if(Input.isTriggered("cancel") || TouchInput.isCancelled()){
		SoundManager.playCancel();	
		if($gameTemp.currentSwapSource == -1){
			//$gameSystem.deployList = JSON.parse(JSON.stringify( $gameTemp.originalDeployInfo));
			$gameSystem.setSubBattlePhase("deploy_selection_window");
			$gameTemp.pushMenu = "in_stage_deploy";
			$gameSystem.undeployActors(true);		
		} else {								
			$gameTemp.currentSwapSource = -1;
			$gameSystem.highlightDeployTiles();
		}
	}
	return true;
}


function GameState_rearrange_deploys_init(){
	GameState.call(this);
}

GameState_rearrange_deploys_init.prototype = Object.create(GameState.prototype);
GameState_rearrange_deploys_init.prototype.constructor = GameState_rearrange_deploys_init;

GameState_rearrange_deploys_init.prototype.update = function(scene){
	$gameTemp.currentSwapSource = -1;
	$gameSystem.setSubBattlePhase('rearrange_deploys');
	//Input.update();
	if(Input.isPressed("menu") || Input.isLongPressed("menu")){
		$gameTemp.menuStillHeld = true;
	}
	$gameTemp.popMenu = true;
	return true;
}

function GameState_twin_selection(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_twin_selection.prototype = Object.create(GameState.prototype);
GameState_twin_selection.prototype.constructor = GameState_twin_selection;

GameState_twin_selection.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		$gameSystem.highlightedActionTiles = [];
		$gameSystem.highlightsRefreshed = true;
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		SoundManager.playCancel();
		$gameTemp.clearMoveTable();
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gameSystem.setSubBattlePhase("actor_command_window");    
		scene._mapSrpgActorCommandWindow.activate();					
	}
	return true;	
}

GameState_twin_selection.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_twin_selection.prototype.updateMapEvent = function(x, y, triggers){
	if($gamePlayer.wasTouchMoved){
		return; //do no process event triggers on the same click as moving the cursor
	}
	$gameMap.eventsXy(x, y).forEach(function(event) {
		if (event.isTriggerIn(triggers) && !event.isErased() && $gameSystem.EventToUnit(event.eventId()) != null) {
			if (event.isType() == 'actor') {
				var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
				var candidate = $gameSystem.EventToUnit(event.eventId())[1];
				
				if($statCalc.canTwin(actor, candidate)){
					$statCalc.twin(actor, candidate);
					
					if($gameTemp.isPostMove){
						$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
						$gameSystem.setSubBattlePhase('post_move_command_window');
						$gameTemp.hasTwinned = true;	
					} else {
						$gameSystem.setSubBattlePhase('normal');
					}								
					
					$gameSystem.highlightedActionTiles = [];
					$gameSystem.highlightsRefreshed = true;
				}
				Input.clear();
			}
		}
	});	
}


function GameState_event_after_actor_action(){
	GameState.call(this);
}

GameState_event_after_actor_action.prototype = Object.create(GameState.prototype);
GameState_event_after_actor_action.prototype.constructor = GameState_event_after_actor_action;

GameState_event_after_actor_action.prototype.update = function(scene){
	if(!$gameMap.isEventRunning()){		
		$gameSystem.setSubBattlePhase("normal");					
	} 
	return true;
}

function GameState_await_actor_float(){
	GameState.call(this);
}

GameState_await_actor_float.prototype = Object.create(GameState.prototype);
GameState_await_actor_float.prototype.constructor = GameState_await_actor_float;

GameState_await_actor_float.prototype.update = function(scene){
	if(!$gameTemp.activeEvent().transitioningFloat){		
		scene._mapSrpgActorCommandWindow.activate();
		$gameSystem.setSubBattlePhase('actor_command_window');		
	} 
	return true;
}

function GameState_stage_conditions(){
	GameState.call(this);
}

GameState_stage_conditions.prototype = Object.create(GameState.prototype);
GameState_stage_conditions.prototype.constructor = GameState_stage_conditions;

GameState_stage_conditions.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled() || Input.isTriggered('ok') || TouchInput.isTriggered()) {
		$gameSystem.setSubBattlePhase($gameTemp.contextState);	
		$gameTemp.popMenu = true;
		$gameTemp.showingStageConditions = false;
	} 
	return true;
}

function GameState_popup_anim(){
	GameState.call(this);
}

GameState_popup_anim.prototype = Object.create(GameState.prototype);
GameState_popup_anim.prototype.constructor = GameState_popup_anim;

GameState_popup_anim.prototype.update = function(scene){
	$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
	$gameTemp.popUpAnimDelay--;
	if($gameTemp.popUpAnimDelay > 0){
		return true;
	}
	
	if($gameTemp.handlingPopUpAnim){
		if(!$gameTemp.animCharacter.isAnimationPlaying()){
			$gameTemp.handlingPopUpAnim = false;
			$gameTemp.queuedPopUpAnim = null;
		} else {
			return true;
		}
	}
	
	if($gameTemp.popUpAnimQueue && $gameTemp.popUpAnimQueue.length && !$gameTemp.queuedPopUpAnim){
		$gameTemp.queuedPopUpAnim = $gameTemp.popUpAnimQueue.pop();
		let event = $statCalc.getReferenceEvent($gameTemp.queuedPopUpAnim.actor);
		$gamePlayer.locate(event.posX(), event.posY(), false, true);
		$gameTemp.popUpAnimDelay = 30;
		$statCalc.setPopUpAnimPlayed($gameTemp.queuedPopUpAnim.actor, $gameTemp.queuedPopUpAnim.trackingId);
	}

	if($gameTemp.queuedPopUpAnim){		
		$gameTemp.handlingPopUpAnim = true;
		let event = $statCalc.getReferenceEvent($gameTemp.queuedPopUpAnim.actor);
		let animId = $gameTemp.queuedPopUpAnim.animId;
		
		$gameTemp.animCharacter = event;				
		event.requestAnimation(animId);
	} else {
		$gameTemp.handlingPopUpAnim = false;
		$gameTemp.animCharacter = null;
		$gameSystem.setSubBattlePhase($gameTemp.contextState);	
	}	
	return true;
}

function GameState_check_item_pickup(){
	GameState.call(this);
}

GameState_check_item_pickup.prototype = Object.create(GameState.prototype);
GameState_check_item_pickup.prototype.constructor = GameState_check_item_pickup;

GameState_check_item_pickup.prototype.update = function(scene){
	let targetEvent;
	if(!$gameTemp.activeEvent().isErased()){
		$gameMap.eventsXy($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()).forEach(function(event) {
			if (!event.isErased() && event.isDropBox) {
				targetEvent = event;
				event.isDropBox = false;
			}
		});
	}
	
	if(targetEvent){
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		if(battlerArray){
			if($gameSystem.isFriendly(battlerArray[1], "player")){
				$gameMessage.setFaceImage("", "");
				$gameMessage.setBackground(1);
				$gameMessage.setPositionType(1);
				let names = targetEvent.dropBoxItems.map((itemId) => $itemEffectManager.getAbilityDisplayInfo(itemId).name);
				$gameMessage.add("\\TA[1]\n" + APPSTRINGS.GENERAL.label_box_pickup.replace("{ITEMS}", names.join(", ")));
			} else {
				$gameMessage.setFaceImage("", "");
				$gameMessage.setBackground(1);
				$gameMessage.setPositionType(1);
				$gameMessage.add("\\TA[1]\n" + APPSTRINGS.GENERAL.label_box_stolen);
			}			
		}
		targetEvent.erase();
		for(let item of targetEvent.dropBoxItems){
			$inventoryManager.addItem(item);
		}
		$gameMap._interpreter.setWaitMode('message');
	} else if (!$gameMessage.isBusy()) {
		scene.eventAfterAction();
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            scene.eventUnitEvent();
        }
        $gameTemp.clearActiveEvent();
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            if (scene.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('event_after_actor_action');
            }
        } else if ($gameSystem.isBattlePhase() === 'auto_actor_phase') {
            $gameSystem.setSubBattlePhase('auto_actor_command');
        } else if ($gameSystem.isBattlePhase() === 'AI_phase') {
            $gameSystem.setSubBattlePhase('enemy_command');
        }
	}

	return true;
}

/***********************/