	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
		Game_Interpreter.prototype.pluginCommand = function(command, args) {
			_Game_Interpreter_pluginCommand.call(this, command, args);
			
			function getLogContext(){
				return command + " " + args.join(" ");
			}
			
			function resolveDeployedActorId(actorId){
				var originalId = actorId;
				var parts = actorId.match(/\<(.*)\>/);	
				if(parts && parts.length > 1){
					actorId = $gameVariables.value(parts[1]);
				}
				var event = $statCalc.getReferenceEvent($gameActors.actor(actorId));
				if(!event){
					throw "Attempted to use an undeployed actor(id: "+originalId+", resolved id: "+actorId+") in a command";
				}
				return actorId;
			}
			
			try {				
				if (command === 'SRPGBattle') {
					switch (args[0]) {
					case 'Start':
						$gameSystem.startSRPG();
						break;
					case 'End':
						$gameSystem.endSRPG();
						break;
					}
				}
				if (command === 'Intermission') {
					switch (args[0]) {
					case 'Start':
						$gameSystem.startIntermission();
						break;
					case 'End':
						$gameSystem.endIntermission();
						break;
					}
				}
				
				if (command === 'assignUnit') {
					const actor = $gameActors.actor(args[0]);
					if(!actor){
						throw "Invalid actor "+args[0]+" for assignUnit command.";
					}
					if(isNaN(args[1] * 1) || args[1] * 1 < 0){
						throw "Invalid mech "+args[1]+" for assignUnit command.";
					}
					actor._classId = args[1] * 1;
					actor.isSubPilot = !!(args[2] * 1);
					//actor._intermissionClassId = args[1] * 1; 
					if(actor.isSubPilot){
						$gameSystem.overwritePilotFallbackInfo(actor);
					} else {
						let actionsResult = $statCalc.applyDeployActions(args[0], args[1], true);
						if(!actionsResult){
							$gameSystem.overwritePilotFallbackInfo(actor);
						}
					}					
				}
				
				if (command === 'UnlockUnit') {
					$SRWSaveManager.setUnitUnlocked(args[0]);
				}
				if (command === 'unlockUnit') {
					$SRWSaveManager.setUnitUnlocked(args[0]);
				}
				if (command === 'lockUnit') {
					$SRWSaveManager.setUnitLocked(args[0]);
				}
				if (command === 'LockUnit') {
					$SRWSaveManager.setUnitLocked(args[0]);
				}
				if (command === 'SetLevel') {
					$SRWSaveManager.setPilotLevel(args[0], args[1]);
				}
				if (command === 'setLevel') {
					$SRWSaveManager.setPilotLevel(args[0], args[1]);
				}
				if (command === 'addKills') {
					$SRWSaveManager.addKills(args[0], args[1]);
				}		
				if (command === 'AddKills') {
					$SRWSaveManager.addKills(args[0], args[1]);
				}	
				if (command === 'addPP') {
					$SRWSaveManager.addPP(args[0], args[1]);
				}
				if (command === 'addExp') {
					$SRWSaveManager.addExp(args[0], args[1]);
				}
				if (command === 'setStageSong') {
					$gameSystem.currentStageSong  = args[0];
				}	
				if (command === 'setSpecialTheme') {
					$songManager.setSpecialTheme(args[0]);
				}	
				if (command === 'clearSpecialTheme') {
					$songManager.clearSpecialTheme();
				}			
				if (command === 'addItem') {
					$inventoryManager.addItem(args[0]);
				}	
				if (command === 'addAllItems') {            
					for(var i = 0; i < $itemEffectManager.getDefinitionCount(); i++){
						$inventoryManager.addItem(i);
					}
				}
				if (command === 'removeItem') {
					$inventoryManager.removeItem(args[0]);
				}	
				if (command === 'addItemToHolder') {
					$inventoryManager.addItemHolder(args[0], args[1], args[2]);
				}
				if (command === 'removeItemFromHolder') {
					$inventoryManager.removeItemHolder(args[0], args[1]);
				}
				
				if (command === 'addEquipable') {
					$equipablesManager.addItem(args[0]);
				}			
				if (command === 'addEquipableToHolder') {
					$equipablesManager.addItemHolder(args[0], args[1], args[2]);
				}
				if (command === 'removeEquipableFromHolder') {
					$equipablesManager.removeItemHolder(args[0], args[1]);
				}
				
				if (command === 'setFreeEventCam') {
					$gameTemp.freeEventCam = true;
				}
				if (command === 'clearFreeEventCam') {
					$gameTemp.freeEventCam = false;
				}
				if (command === 'focusActor') {
					var actorId = args[0];
					var parts = actorId.match(/\<(.*)\>/);	
					if(parts && parts.length > 1){
						actorId = $gameVariables.value(parts[1]);
					}
					
					var event = $statCalc.getReferenceEvent($gameActors.actor(actorId));
					
					if(event){
						var battlerArray = $gameSystem.EventToUnit(event.eventId());
						if(battlerArray){
							let referenceActor = battlerArray[1];					
							if($statCalc.isBoarded(referenceActor)){
								$statCalc.iterateAllActors("actor", function(actor, iEvent){
									if($statCalc.hasBoardedUnit(actor, referenceActor)){
										event = iEvent;
									}
								});
							}
						}						
					}					
					
					if(event && !event.isErased()){
						applyFocus();
					} else {
						event = null;//allow default event to be used if direct reference event is erased
					}
					if(!event && $gameSystem.defaultFocusActor){
						var event = $statCalc.getReferenceEvent($gameActors.actor($gameSystem.defaultFocusActor));
						if(event){
							applyFocus();
						}
					} 
					if(!event && $gameSystem.defaultFocusEvent){
						var event = $gameMap.event($gameSystem.defaultFocusEvent);
						if(event){
							applyFocus();
						}
					}
					
					function applyFocus(){					
						var freeCam = false;
						if(args[1] != null){
							freeCam = args[1] * 1;
						} else {
							freeCam = $gameTemp.freeEventCam || false;
						}
						$gamePlayer.locate(event.posX(), event.posY(), freeCam);										
					}
				}
				if (command === 'focusEvent') {
					var event = $gameMap.event(args[0]);
					if(event && !event.isErased()){
						var freeCam = false;
						if(args[1] != null){
							freeCam = args[1] * 1;
						} else {
							freeCam = $gameTemp.freeEventCam || false;
						}
						$gamePlayer.locate(event.posX(), event.posY(), freeCam);
					}
				}
				if (command === 'focusEnemy') {
					var enemyId = args[0];
					var targetEvent;
					$statCalc.iterateAllActors("enemy", function(actor, event){
						if(actor && event && !event.isErased() && actor.enemyId() == enemyId){
							targetEvent = event;
						}
					});
					if(targetEvent && !targetEvent.isErased()){
						var freeCam = false;
						if(args[1] != null){
							freeCam = args[1] * 1;
						} else {
							freeCam = $gameTemp.freeEventCam || false;
						}
						$gamePlayer.locate(targetEvent.posX(), targetEvent.posY(), freeCam);
					}
				}
				
				if (command === 'clearDeployInfo') {
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
				}
				
				if (command === 'populateDeployList') {
					$gameSystem.updateAvailableUnits();
					$gameSystem.constructDeployList();
				}
				
				if (command === 'setMinDeployCount') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.minDeployCount = args[0];
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'setDeployCount') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.count = args[0];
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'setShipDeployCount') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.shipCount = args[0];
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'assignSlot') {
					//args[0]: slot 
					//args[1]: actor id
					var deployInfo = $gameSystem.getDeployInfo();
					var actorId = args[1];
					var parts = actorId.match(/\<(.*)\>/);	
					if(parts && parts.length > 1){
						actorId = $gameVariables.value(parts[1]);
					}
					deployInfo.assigned[args[0]] = actorId;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'assignSlotFromMech') {
					//args[0]: slot 
					//args[1]: actor id
					var deployInfo = $gameSystem.getDeployInfo();
					//always check the fallback info to avoid issues with pilots who were switched around during the stage
					var actorId = String($statCalc.getCurrentPilot(args[1], true, false, false, true).actorId());
					var parts = actorId.match(/\<(.*)\>/);	
					if(parts && parts.length > 1){
						actorId = $gameVariables.value(parts[1]);
					}

					deployInfo.assigned[args[0]] = actorId;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'assignSlotSub') {
					//args[0]: slot 
					//args[1]: actor id
					var deployInfo = $gameSystem.getDeployInfo();
					var actorId = args[1];
					var parts = actorId.match(/\<(.*)\>/);	
					if(parts && parts.length > 1){
						actorId = $gameVariables.value(parts[1]);
					}
					deployInfo.assignedSub[args[0]] = actorId;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'assignShipSlot') {
					//args[0]: slot 
					//args[1]: actor id
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.assignedShips[args[0]] = args[1];
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'lockDeploySlot') {
					//prevents a slot from being changed by the player in the menu, assignSlot can still override
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.lockedSlots[args[0]] = true;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'unlockDeploySlot') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.lockedSlots[args[0]] = false;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'disableDeploySlot') {
					//prevents a slot from being deployed, should be used in conjuction with a locked slot
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.doNotDeploySlots[args[0]] = true;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'enableDeploySlot') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.doNotDeploySlots[args[0]] = false;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'lockShipDeploySlot') {
					//prevents a slot from being changed by the player in the menu, assignSlot can still override
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.lockedShipSlots[args[0]] = true;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'unlockShipDeploySlot') {
					var deployInfo = $gameSystem.getDeployInfo();
					deployInfo.lockedShipSlots[args[0]] = false;
					$gameSystem.setDeployInfo(deployInfo);
				}
				
				if (command === 'setSRWBattleBg') {
					$gameSystem.battleBg = args[0];
				}
				
				if (command === 'setSRWBattleParallax1') {
					$gameSystem.battleParallax1 = args[0];
				}
				
				if (command === 'setSRWBattleParallax2') {
					$gameSystem.battleParallax2 = args[0];
				}
				
				if (command === 'setSRWBattleParallax3') {
					$gameSystem.battleParallax3 = args[0];
				}
				
				if (command === 'setSRWBattleParallax3') {
					$gameSystem.battleParallax3 = args[0];
				}
				
				if (command === 'setSRWBattleFloor') {
					$gameSystem.battleFloor = args[0];
				}
				
				if (command === 'setSRWBattleSkybox') {
					$gameSystem.battleSkyBox = args[0];
				}
				
				if (command === 'setSRWSkyBattleBg') {
					$gameSystem.skyBattleBg = args[0];
				}
				
				if (command === 'setSRWSkyBattleParallax1') {
					$gameSystem.skyBattleParallax1 = args[0];
				}
				
				if (command === 'setSRWDefaultBattleEnv') {
					$gameSystem.defaultBattleEnv = args[0];
				}
				
				if (command === 'setDefaultBattleEnv') {
					$gameSystem.defaultBattleEnv = args[0];
				}
				
				if (command === 'setSkyBattleEnv') {
					$gameSystem.superStateBattleEnv[1] = args[0];
				}
				
				if (command === 'setSuperStateBattleEnv') {
					$gameSystem.superStateBattleEnv[args[0]] = args[1];
				}
				
				if (command === 'setRegionBattleEnv') {
					$gameSystem.regionBattleEnv[args[0]] = args[1];
				}
				
				if (command === 'setRegionSkyBattleEnv') {
					if(!$gameSystem.regionSuperStateBattleEnv[1]){
						$gameSystem.regionSuperStateBattleEnv[1] = {};
					}
					$gameSystem.regionSuperStateBattleEnv[1][args[0]] = args[1];
				}
				
				if (command === 'setRegionSuperStateBattleEnv') {
					if(!$gameSystem.regionSuperStateBattleEnv[args[0]]){
						$gameSystem.regionSuperStateBattleEnv[args[0]] = {};
					}
					$gameSystem.regionSuperStateBattleEnv[args[0]][args[1]] = args[2];
				}
				
				if (command === 'resetRegionAttributes') {			
					if(!$gameSystem.regionAttributes){
						$gameSystem.regionAttributes = {};
					}	
					delete $gameSystem.regionAttributes[args[0] * 1];
				}
				
				if (command === 'addRegionAttributes') {
					if(!$gameSystem.regionAttributes){
						$gameSystem.regionAttributes = {};
					}
					$gameSystem.regionAttributes[args[0] * 1] = {
						defense: args[1] * 1,
						evasion: args[2] * 1,
						hp_regen: args[3] * 1, 
						en_regen: args[4] * 1
					};
				}
				
				if (command === 'addMapHighlight') {
					if(!$gameSystem.highlightedTiles){
						$gameSystem.highlightedTiles = [];
					}
					$gameSystem.highlightedTiles.push({x: args[0], y: args[1], color: args[2] || "white"});
					$gameSystem.highlightsRefreshed = true;
				}
				
				if (command === 'removeMapHighlight') {
					if($gameSystem.highlightedTiles){
						var x = args[0];
						var y = args[1];
						var tmp = [];
						for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
							if($gameSystem.highlightedTiles[i].x != x || $gameSystem.highlightedTiles[i].y != y){
								tmp.push($gameSystem.highlightedTiles);
							}
						}
						$gameSystem.highlightedTiles = tmp;
					}
					$gameSystem.highlightsRefreshed = true;
				}
				
				if (command === 'addMapRegionHighlight') {
					if(!$gameSystem.regionHighlights){
						$gameSystem.regionHighlights = {};
					}
					$gameSystem.regionHighlights[args[0]] = args[1] || "white";
					$gameSystem.regionHighlightsRefreshed = true;
					$gameMap.clearRegionTiles();
				}
				
				if (command === 'removeMapRegionHighlight') {
					delete $gameSystem.regionHighlights[args[0]];
					$gameSystem.regionHighlightsRefreshed = true;
					$gameMap.clearRegionTiles();
				}
				
				if (command === 'setEnemyUpgradeLevel') {
					$gameSystem.enemyUpgradeLevel = args[0];
				}
				
				if (command === 'setMechUpgradeLevel') {
					var mechId = args[0]*1;
					var targetLevel = args[1]*1;
					var force = args[2]*1;
					var mechData = $statCalc.getMechData($dataClasses[mechId], true);
					if(mechData && mechData.id != -1){
						var upgradeLevels = mechData.stats.upgradeLevels;
						var targetUpgrades = ["maxHP","maxEN","armor","mobility","accuracy","weapons"];
						targetUpgrades.forEach(function(upgrade){
							if(upgradeLevels[upgrade] < targetLevel || force){
								upgradeLevels[upgrade] = targetLevel;
							}
						});
					}
					$statCalc.storeMechData(mechData);
				}
				
				if (command === 'setPilotRelationship') {
					var actorId = parseInt(args[0]);
					var otherActorId = parseInt(args[1]);
					var effectId = parseInt(args[2]);
					var level = parseInt( args[3]);
					
					var actor = $gameActors.actor(actorId);
					if(!actor.SRWStats.pilot.relationships){
						actor.SRWStats.pilot.relationships = {};
					}
					actor.SRWStats.pilot.relationships[otherActorId] = {
						actor: otherActorId,
						effectId: effectId,
						level: level
					};
					$statCalc.storeActorData(actor);	
				}		
				
				if (command === 'addPersuadeOption') {
					//args[0] = actorId
					//args[1] = eventId
					//args[2] = varId
					if(!$gameSystem.persuadeOptions[args[0]]){
						$gameSystem.persuadeOptions[args[0]] = {};
					}
					$gameSystem.persuadeOptions[args[0]][args[1]] = args[2];
				}	

				if (command === 'removePersuadeOption') {
					//args[0] = actorId
					//args[1] = eventId
					if($gameSystem.persuadeOptions[args[0]]){
						delete $gameSystem.persuadeOptions[args[0]][args[1]];
					}
				}	
				
				if (command === 'deployShips') {
					var deployInfo = $gameSystem.getDeployInfo();
					var deployList = $gameSystem.getShipDeployList();			
					var activeDeployList = [];
					for(var i = 0; i < deployInfo.shipCount; i++){
						activeDeployList.push(deployList[i]);
					}
					$gameSystem.setActiveShipDeployList(activeDeployList);
					$gameSystem.deployShips(args[0] * 1);					
				}
				
				if (command === 'deployAll') {
					var deployInfo = $gameSystem.getDeployInfo();
					var deployList = $gameSystem.getDeployList();
					var activeDeployList = [];
					for(var i = 0; i < deployInfo.count; i++){
						activeDeployList.push(deployList[i]);
					}
					$gameSystem.setActiveDeployList(activeDeployList);
					$gameSystem.deployActors(args[0] * 1, "all");
				}
				
				if (command === 'deployAllLocked') {
					$gameSystem.deployActors(args[0] * 1, "locked");
				}
				
				if (command === 'deployAllUnLocked') {
					$gameSystem.deployActors(args[0] * 1, "unlocked");
				}
				
				if (command === 'deployActor') {
					var actorId = args[0];
					var parts = actorId.match(/\<(.*)\>/);	
					if(parts && parts.length > 1){
						actorId = $gameVariables.value(parts[1]);
					}
					
					var actor_unit = $gameActors.actor(actorId);
					var event = $gameMap.event(args[1]);
					if(actor_unit && event){
						var type;
						if(event.event().meta.type){
							type = event.event().meta.type;
						} else {
							type = "actor";
						}
						event.setType(type);
						$gameSystem.deployActor(actor_unit, event, args[2] * 1, args[3], true);
					}			
				}
				
				if (command === 'deployMech') {
					var mechId = args[0];
					var actor_unit = $statCalc.getCurrentPilot(mechId, true);
					var event = $gameMap.event(args[1]);
					if(actor_unit && event){
						var type;
						if(event.event().meta.type){
							type = event.event().meta.type;
						} else {
							type = "actor";
						}
						event.setType(type);
						$gameSystem.deployActor(actor_unit, event, args[2] * 1, args[3], true);
					}
				}
				
				if (command === 'deploySlot') {
					var slot = args[0];
					var deployInfo = $gameSystem.getDeployInfo();
					var actor_id = deployInfo.assigned[slot];
					var actor_unit = $gameActors.actor(actor_id);
					var eventId = -1;
					var ctr = 0;
					var actorEventCtr = 0;
					var events = $gameMap.events();
					while(eventId == -1 && ctr < events.length){
						var event = events[ctr];
						if (event.isType() === 'actor'){
							if(actorEventCtr == slot){
								eventId = event.eventId();
							}
							actorEventCtr++;
						}
						ctr++;
					}
					if(actor_unit && eventId != -1){
						$gameSystem.deployActor(actor_unit, $gameMap.event(eventId), args[1], deployInfo.assignedSub[slot]);
					}			
				}
				
				if (command === 'redeployActor') {
					$gameSystem.redeployActor(args[0], args[1] * 1);			
				}
				
				if (command === 'storeEventPoint') {
					if(!$gameTemp.storedEventLocations){
						$gameTemp.storedEventLocations = {};
					}
					var eventId = args[0] * 1;
					var event = $gameMap.event(args[0]);		
					if(event){
						$gameTemp.storedEventLocations[eventId] = {x: event.posX(), y: event.posY()};
					}	
				}
				
				if (command === 'moveEventToStoredPoint') {
					if(!$gameTemp.storedEventLocations){
						$gameTemp.storedEventLocations = {};
					}
					var eventId = args[0] * 1;
					var event = $gameMap.event(args[0]);	
					var point = $gameTemp.storedEventLocations[eventId];
					if(event && point){
						moveEventToPoint(eventId, point.x, point.y, args[1], args[2], args[3]);					
					}	
				}
				
				function moveEventToPoint(eventId, x, y, follow, asynchronous, ignoreObstacles){
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!((asynchronous || 0) * 1)){
						$gameSystem.setSrpgWaitMoving(true);
					}				
					var event = $gameMap.event(eventId);
					if(event){
						var position = $statCalc.getAdjacentFreeSpace({x: x, y: y}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((ignoreObstacles || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(follow * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}			
					}
				}
				
				if (command === 'moveEventToPoint') {
					moveEventToPoint(args[0], args[1], args[2], args[3], args[4], args[5]);
				}
				
				if (command === 'moveActorToPoint') {
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!args[4] * 1){
						$gameSystem.setSrpgWaitMoving(true);
					}
					var event = $statCalc.getReferenceEvent($gameActors.actor(resolveDeployedActorId(args[0])));
					if(event){
						var position = $statCalc.getAdjacentFreeSpace({x: args[1], y: args[2]}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((args[5] || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(args[3] * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}	
					}					
				}
				
				if (command === 'moveEventToEvent') {
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!args[3] * 1){
						$gameSystem.setSrpgWaitMoving(true);
					}
					var targetEvent = $gameMap.event(args[1]);
					var event = $gameMap.event(args[0]);
					if(event && targetEvent){
						var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((args[4] || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(args[2] * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}			
					}
				}
				
				if (command === 'moveActorToEvent') {
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!args[3] * 1){
						$gameSystem.setSrpgWaitMoving(true);
					}
					var targetEvent = $gameMap.event(args[1]);
					var event = $statCalc.getReferenceEvent($gameActors.actor(resolveDeployedActorId(args[0])));
					if(event && targetEvent){
						var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((args[4] || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(args[2] * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}
					}						
				}
				
				if (command === 'moveEventToActor') {
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!args[3] * 1){
						$gameSystem.setSrpgWaitMoving(true);
					}
					var targetEvent = $statCalc.getReferenceEvent($gameActors.actor(resolveDeployedActorId(args[1])));
					var event = $gameMap.event(args[0]);
					if(event && targetEvent){
						var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((args[4] || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(args[2] * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}			
					}
				}
				
				if (command === 'moveActorToActor') {
					$gameMap._interpreter.setWaitMode("move_to_point");
					if(!args[3] * 1){
						$gameSystem.setSrpgWaitMoving(true);
					}
					var targetEvent = $statCalc.getReferenceEvent($gameActors.actor(resolveDeployedActorId(args[1])));
					var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
					if(event && targetEvent){
						var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, event.eventId(), {x: event.posX(), y: event.posY()});
						var ignoreObstacles = !((args[4] || 0) * 1);
						event.srpgMoveToPoint(position, true, ignoreObstacles);
						if(args[2] * 1){
							$gamePlayer.locate(event.posX(), event.posY());
							$gameTemp.followMove = true;
						}
					}						
				}
				
				if (command === 'setEventFlying') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					if($statCalc.canBeOnTerrain(actor, 1)){
						$statCalc.setSuperState(actor, 1, (args[1] || 0) * 1);
					}			
				}
				
				if (command === 'setEventLanded') {
					var actor = $gameSystem.EventToUnit(args[0])[1];		
					$statCalc.setSuperState(actor, -1,(args[1] || 0) * 1);						
				}
				
				if (command === 'enableFaction') {
					$gameSystem.enableFaction(args[0]);
				}
				
				if (command === 'disableFaction') {
					$gameSystem.disableFaction(args[0]);
				}			
				
				if (command === 'setFactionAggro') {
					$gameSystem.setFactionAggro(args[0], JSON.parse(args[1]));
				}
				
				if (command === 'clearFactionAggro') {
					$gameSystem.clearFactionAggro(args[0]);
				}
				
				if (command === 'transformEvent') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					/*if(actor.isSubTwin){
						var main = $statCalc.getMainTwin(actor);
						$statCalc.swap(main, true);
					}*/
					$statCalc.transform(actor, args[1], true);
					if(!(args[2] || 0) * 1){
						var se = {};
						se.name = 'SRWTransform';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);
					}				
				}	

				if (command === 'combineEvent') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					$statCalc.combine(actor, true);
					var se = {};
					if(!(args[1] || 0) * 1){
						se.name = 'SRWTransform';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);
					}
				}	

				if (command === 'splitEvent') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					$statCalc.split(actor, true);
					var se = {};
					if(!(args[1] || 0) * 1){
						se.name = 'SRWTransform';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);
					}
				}
				
				if (command === 'transformActor') {
					var actor = $gameActors.actor(args[0]);
					/*if(actor.isSubTwin){
						var main = $statCalc.getMainTwin(actor);
						$statCalc.swap(main, true);
					}*/
					$statCalc.transform(actor, args[1], true, args[2]);
					var se = {};
					se.name = 'SRWTransform';
					se.pan = 0;
					se.pitch = 100;
					se.volume = 80;
					AudioManager.playSe(se);
				}

				if (command === 'transformActorDirect') {
					var actor = $gameActors.actor(args[0]);
					/*if(actor.isSubTwin){
						var main = $statCalc.getMainTwin(actor);
						$statCalc.swap(main, true);
					}*/
					$statCalc.transform(actor, 0, true, args[1]);
					var se = {};
					se.name = 'SRWTransform';
					se.pan = 0;
					se.pitch = 100;
					se.volume = 80;
					AudioManager.playSe(se);
				}

				if (command === 'combineActor') {
					var actor = $gameActors.actor(args[0]);
					$statCalc.combine(actor, true);
					var se = {};
					se.name = 'SRWTransform';
					se.pan = 0;
					se.pitch = 100;
					se.volume = 80;
					AudioManager.playSe(se);
				}	

				if (command === 'splitActor') {
					var actor = $gameActors.actor(args[0]);
					$statCalc.split(actor, true);
					var se = {};
					se.name = 'SRWTransform';
					se.pan = 0;
					se.pitch = 100;
					se.volume = 80;
					AudioManager.playSe(se);
				}
				
				if (command === 'separateActor') {
					var actor = $gameActors.actor(args[0]);
					if(actor.isSubTwin){
						actor = $statCalc.getMainTwin(actor);
					}
					if(actor.subTwin || actor.isSubTwin){
						$statCalc.separate(actor, true);
					}			
				}
				
				if (command === 'makeActorMainTwin') {
					var actor = $gameActors.actor(args[0]);
					if(actor.isSubTwin){
						actor = $statCalc.getMainTwin(actor);
						$statCalc.swap(actor, true);
					}			
				}
				
				if (command === 'preventActorDeathQuote') {
					if(!$gameTemp.preventedDeathQuotes){
						$gameTemp.preventedDeathQuotes = {};
					}
					$gameTemp.preventedDeathQuotes[args[0]] = true;
				}
				
				if (command === 'setSaveDisplayName') {			
					$gameSystem.saveDisplayName = (args[0] || "").replace(/\_/ig, " ");
				}	

				if (command === 'setStageTextId') {			
					$gameSystem.stageTextId = args[0];
				}				
				
				if (command === 'setEventWill') {	
					var actor = $gameSystem.EventToUnit(args[0])[1];
					$statCalc.setWill(actor, args[1] * 1);
				}
				
				if (command === 'setActorWill') {	
					var actor = $gameActors.actor(args[0]);
					$statCalc.setWill(actor, args[1] * 1);
				}
				
				if (command === 'makeActorAI') {	
					var actor = $gameActors.actor(resolveDeployedActorId(args[0]));
					$statCalc.setIsAI(actor, true);
				}
				
				if (command === 'makeActorControllable') {	
					var actor = $gameActors.actor(resolveDeployedActorId(args[0]));
					$statCalc.setIsAI(actor, false);
				}
				
				if (command === 'setActorEssential') {
					var actor = $gameActors.actor(args[0]);
					$statCalc.setEssential(actor, true);
				}
				
				if (command === 'setActorNonEssential') {
					var actor = $gameActors.actor(args[0]);
					$statCalc.setEssential(actor, false);
				}
				
				if (command === 'setEventMapCooldown') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					$statCalc.setMapAttackCooldown(actor, args[1] * 1);
				}
				
				if (command === 'unlockMechWeapon') {			
					$statCalc.setWeaponUnlocked(args[0], args[1]);
				}
				
				if (command === 'lockMechWeapon') {
					$statCalc.setWeaponLocked(args[0], args[1]);
				}
				
				if (command === 'setUnlockedUpgradeLevel') {
					var tmp = parseInt(args[0]);
					var onlyUpgrade = args[1] * 1;
					if(!isNaN(tmp)){
						if($gameSystem.unlockedUpgradeLevel == null || !onlyUpgrade || tmp > $gameSystem.unlockedUpgradeLevel){
							$gameSystem.unlockedUpgradeLevel = tmp;
						}						
					}			
				}
				
				if (command === 'setRequiredFUBLevel') {
					var tmp = parseInt(args[0]);
					if(!isNaN(tmp)){
						$gameSystem.requiredFUBLevel = tmp;
					}			
				}
				
				if (command === 'setEventCounterAction') {	
					var actor = $gameSystem.EventToUnit(args[0])[1];
					actor.counterBehavior = args[1];
				}
				
				if (command === 'setEventAttackAction') {	
					var actor = $gameSystem.EventToUnit(args[0])[1];
					actor.attackBehavior = args[1];
				}
				
				if (command === 'setEventBattleMode') {	
					var battlerArray = $gameSystem.EventToUnit(args[0]);
					if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
						battlerArray[1].setBattleMode(args[1], true);			
					}
					/*if(battlerArray[0] === 'enemy'){
						if(battlerArray[1].squadId != -1){
							this.setSquadMode(squadId, args[1]);
						}
					}*/	
					return true;
				};
				
				if (command === 'hidePilotAbility') {	
					$gameSystem.setPilotAbilityStatus(args[0], args[1], "hidden");
				}
				
				if (command === 'lockPilotAbility') {	
					$gameSystem.setPilotAbilityStatus(args[0], args[1], "locked");
				}
				
				if (command === 'unlockPilotAbility') {	
					$gameSystem.setPilotAbilityStatus(args[0], args[1], "");
				}
				
				if (command === 'hideMechAbility') {	
					$gameSystem.setMechAbilityStatus(args[0], args[1], "hidden");
				}
				
				if (command === 'lockMechAbility') {	
					$gameSystem.setMechAbilityStatus(args[0], args[1], "locked");
				}
				
				if (command === 'unlockMechAbility') {	
					$gameSystem.setMechAbilityStatus(args[0], args[1], "");
				}
				
				if (command === 'lockTransformation') {	
					$gameSystem.lockTransformation(args[0], args[1]);
				}
				
				if (command === 'lockAllTransformations') {	
					$gameSystem.lockAllTransformations();
				}
				
				if (command === 'unlockTransformation') {	
					$gameSystem.unlockTransformation(args[0], args[1]);
				}
				
				if (command === 'unlockAllTransformations') {	
					$gameSystem.unlockAllTransformations();
				}
							
				if (command === 'lockCombine') {	
					$gameSystem.lockCombine(args[0]);
				}
				
				if (command === 'lockAllCombines') {	
					$gameSystem.lockAllCombines();
				}
				
				if (command === 'unlockCombine') {	
					$gameSystem.unlockCombine(args[0]);
				}
				
				if (command === 'unlockAllCombines') {	
					$gameSystem.unlockAllCombines();
				}
				
				if (command === 'setFaceAlias') {	
					if(!$gameSystem.faceAliases){
						$gameSystem.faceAliases = {};
					}
					$gameSystem.faceAliases[args[0]] = args[1];
				}
				
				if (command === 'setCharacterIndexAlias') {	
					if(!$gameSystem.characterIdexAliases){
						$gameSystem.characterIdexAliases = {};
					}
					$gameSystem.characterIdexAliases[args[0]] = args[1];
				}
				
				if (command === 'setPilotAbilityUpgrade') {	
					$pilotAbilityManager.setUpgrade(args[0], args[1]);
				}
				
				if (command === 'setMechAbilityUpgrade') {	
					$mechAbilityManager.setUpgrade(args[0], args[1]);
				}
				
				if (command == 'showTargetingReticule'){			
					var eventIdSource;
					var parts = args[0].match(/\actor\:(.*)/);	
					if(parts && parts.length > 1){
						eventIdSource = $gameSystem.ActorToEvent(parts[1]);
					} else {
						eventIdSource = args[0];
					}			
					
					var eventIdTarget;
					var parts = args[1].match(/\actor\:(.*)/);	
					if(parts && parts.length > 1){
						eventIdTarget = $gameSystem.ActorToEvent(parts[1]);
					} else {
						eventIdTarget = args[1];
					}
					
					$gameTemp.reticuleInfo = {
						actor: $gameMap.event(eventIdSource),
						targetActor: $gameMap.event(eventIdTarget)
					};					
				}
				
				if (command === 'clearTile') {
					var position = {x: args[0], y: args[1]};
					var actor = $statCalc.activeUnitAtPosition(position);
					if(actor){
						var newPosition = $statCalc.getAdjacentFreeSpace(position);
						var event = $statCalc.getReferenceEvent(actor);
						var actorId = -1;
						if(actor.isActor()){
							actorId = actor.actorId();
						}
						if(event.eventId() != args[2] && actorId != args[3]){
							event.locate(newPosition.x, newPosition.y);
						}				
					}
				}
				
				function clearAdjacentToTile(position, includeDiagonal){
					var positions  = [];
					positions.push({position: {x: position.x - 1, y: position.y}, biasPosition:{x: position.x - 2, y: position.y}});
					positions.push({position: {x: position.x + 1, y: position.y}, biasPosition:{x: position.x + 2, y: position.y}});
					positions.push({position: {x: position.x, y: position.y + 1}, biasPosition:{x: position.x, y: position.y + 2}});
					positions.push({position: {x: position.x, y: position.y - 1}, biasPosition:{x: position.x, y: position.y - 2}});
					
					if(includeDiagonal){
						positions.push({position: {x: position.x - 1, y: position.y - 1}, biasPosition:{x: position.x - 2, y: position.y - 2}});
						positions.push({position: {x: position.x + 1, y: position.y + 1}, biasPosition:{x: position.x + 2, y: position.y + 2}});
						positions.push({position: {x: position.x - 1, y: position.y + 1}, biasPosition:{x: position.x - 2, y: position.y + 2}});
						positions.push({position: {x: position.x + 1, y: position.y - 1}, biasPosition:{x: position.x + 2, y: position.y - 2}});
					}
					
					var usedPositions = {};
					positions.forEach(function(currentInfo){				
						var actor = $statCalc.activeUnitAtPosition(currentInfo.position);
						if(actor){
							var newPosition = $statCalc.getAdjacentFreeSpace(currentInfo.position, null, null, currentInfo.biasPosition, true, usedPositions);
							if(!usedPositions[newPosition.x]){
								usedPositions[newPosition.x] = {};
							}
							if(!usedPositions[newPosition.x][newPosition.y]){
								usedPositions[newPosition.x][newPosition.y] = true;
							}
							var event = $statCalc.getReferenceEvent(actor);
							var actorId = -1;					
							event.locate(newPosition.x, newPosition.y);								
						}
					});	
				}
				
				if (command === 'clearAdjacentToTile') {
					clearAdjacentToTile({x: args[0] * 1, y: args[1] * 1}, args[2] * 1);
				}
				
				if (command === 'clearAdjacentToEvent') {
					var event = $gameMap.event(args[0]);
					if(event){
						clearAdjacentToTile({x: event.posX(), y:  event.posY()}, args[1] * 1);
					}			
				}
				
				if (command === 'clearAdjacentToActor') {
					var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
					if(event){
						clearAdjacentToTile({x: event.posX(), y:  event.posY()}, args[1] * 1);
					}			
				}
				if (command === 'stopSkipping') {
					//exists purely to manually ensure A+Start skipping stops at the point the command is called.
				}
				if (command === 'setEventAIFlags') {
					var actor = $gameSystem.EventToUnit(args[0])[1];
					$statCalc.setAIFlags(actor, {
						terrain: args[1] * 1,  //if 1 the unit will prefer to move onto tile that grant terrain bonuses
						formation: args[2] * 1,//if 1 the unit will prefer to move adjacent to allies that provide support attack/defend
						reposition: args[3] * 1,//if 1 the unit will move closer to hit enemies with stronger attacks even if they already can hit a target with a longer range attack
						preferTarget: args[4] * 1//if 1 the unit will move towards its target region(if it has one) even it has attack targets already in range
					});
				}
				if (command === 'setTerrainMoveCosts') {
					$gameSystem.setTerrainMoveCosts(args[0], args[1], args[2], args[3]);
				}
				if (command === 'setCloudScrollImage') {
					$gameSystem.cloudScrollSource = args[0];
				}
				if (command === 'setCloudScrollXSpeed') {
					$gameSystem.cloudScrollXSpeed = args[0] * 1;
				}
				if (command === 'setCloudScrollYSpeed') {
					$gameSystem.cloudScrollYSpeed = args[0] * 1 ;
				}
				if (command === 'setCloudScrollFrequency') {
					$gameSystem.cloudScrollFrequency = args[0] * 1 ;
				}
				if (command === 'setDefaultFocusEvent') {
					$gameSystem.defaultFocusEvent = args[0] * 1;
				}			
				if (command === 'setDefaultFocusActor') {
					$gameSystem.defaultFocusActor = args[0] * 1;
				}
				if (command === 'lockCameraToCursor') {
					$gameTemp.lockCameraToCursor = true;
				}
				if (command === 'unlockCameraFromCursor') {
					$gameTemp.lockCameraToCursor = false;
				}
				if (command === 'setAllyWillCap') {
					$gameSystem.allyWillCap = args[0] * 1;
				}
				if (command === 'clearAllyWillCap') {
					$gameSystem.allyWillCap = null;
				}
				if (command === 'setEnemyWillCap') {
					$gameSystem.enemyWillCap = args[0] * 1;
				}
				if (command === 'clearEnemyWillCap') {
					$gameSystem.enemyWillCap = null;
				}
				if (command === 'setTerrainSolidForEnemy') {
					if(!$gameSystem.enemySolidTerrain){
						$gameSystem.enemySolidTerrain = {};
					}
					$gameSystem.enemySolidTerrain[args[0] * 1] = true;
				}	
				if (command === 'setTerrainPassableForEnemy') {
					if(!$gameSystem.enemySolidTerrain){
						$gameSystem.enemySolidTerrain = {};
					}
					delete $gameSystem.enemySolidTerrain[args[0] * 1];
				}		
				
				if (command === 'disableVariablePortraits') {
					$gameSystem.disableVariablePortraits = true;
				}
				if (command === 'enableVariablePortraits') {
					$gameSystem.disableVariablePortraits = false;
				}
				if (command === 'refundMechUpgrades') {
					$SRWSaveManager.refundMechUpgrades(args[0] * 1);
				}	
				if (command === 'refundPilotPP') {
					$SRWSaveManager.refundPilotPP(args[0] * 1);
				}					
				if (command === 'setEventWillOverflow') {
					var actor = $gameSystem.EventToUnit(args[0])[1];				
					$statCalc.setStageTemp(actor, "willOverflow", (args[1] || 0) * 1);								
				}	
				if (command === 'setEventUntargetable') {
					$gameSystem.untargetableAllies[args[0]] = true;							
				}
				if (command === 'setEventTargetable') {
					delete $gameSystem.untargetableAllies[args[0]];							
				}			
				if (command === 'setActorSong') {
					$songManager.setCustomActorSong(args[0] * 1, null, args[1])						
				}
				if (command === 'setActorWeaponSong') {
					$songManager.setCustomActorSong(args[0] * 1, args[1] * 1, args[2])						
				}
				if (command === 'addFunds'){
					let amount = args[0];
					if(isNaN(amount)){
						throw "Invalid gold amount: "+amount;
					}
					$gameParty.gainGold(amount * 1);
				}
				
				if (command === 'setEventHP') {
					var actor = $gameSystem.EventToUnit(args[0])[1];				
					$statCalc.setHP(actor, (args[1] || 1) * 1);	
				}		

				if (command === 'setEventHPPercent') {
					var actor = $gameSystem.EventToUnit(args[0])[1];				
					var mechStats = $statCalc.getCalculatedMechStats(actor);
					$statCalc.setHP(actor, Math.floor(mechStats.maxHP * args[1] / 100));		
				}
				
				
				if (command === 'addSubPilot') {					
					var targetMech = $statCalc.getMechData($dataClasses[args[0] * 1], true);
					targetMech.subPilots[args[1] * 1] = args[2] * 1;
					$statCalc.storeMechData(targetMech);
					$gameSystem.overwriteMechFallbackInfo(args[0] * 1, targetMech.subPilots);
					let actor = $gameActors.actor(args[2] * 1)
					actor.isSubPilot = true;
					//actor._intermissionClassId = args[1] * 1; 
					$gameSystem.overwritePilotFallbackInfo(actor);
				}	
				
				if (command === 'removeSubPilot') {					
					var targetMech = $statCalc.getMechData($dataClasses[args[0] * 1], true);
					targetMech.subPilots[args[1] * 1] = null;
					$statCalc.storeMechData(targetMech);
					$gameSystem.overwriteMechFallbackInfo(args[0] * 1, targetMech.subPilots);
					let actor = $gameActors.actor(args[2] * 1)
					actor.isSubPilot = false;
					//actor._intermissionClassId = args[1] * 1; 
					$gameSystem.overwritePilotFallbackInfo(actor);
				}
				
				if (command === 'setPortraitOverlay') {		
					if(!$gameTemp.portraitOverlays){
						$gameTemp.portraitOverlays = [];
					}
					$gameTemp.portraitOverlays.push((args[0] || 0) * 1);
				}	
				if (command === 'hidePortraitOverlay') {
					if(!$gameTemp.portraitOverlays){
						$gameTemp.portraitOverlays = [];
					}	
					let tmp = [];
					for(let id of $gameTemp.portraitOverlays){
						if(id != args[0]){
							tmp.push(id);
						}
					}
					$gameTemp.portraitOverlays = tmp;
				}
				if (command === 'hideAllPortraitOverlays') {					
					$gameTemp.portraitOverlays = [];
				}
				if (command === 'setLocationHeader') {					
					$gameTemp.locationHeader = (args[0] || "").replace(/\_/ig, " ");
				}	
				if (command === 'clearLocationHeader') {					
					$gameTemp.locationHeader = null;
				}
				if (command === 'clearLocationHeader') {					
					$gameTemp.locationHeader = null;
				}
				
				if (command === 'setCustomSpirit') {					
					var actor = $gameActors.actor(args[0]);
					if(actor){
						$statCalc.setCustomSpirit(
							actor,
							args[1],//slot
							args[2],//idx
							args[3],//cost
							args[4],//level						
						);
					}
				}
				
				if (command === 'clearCustomSpirit') {					
					var actor = $gameActors.actor(args[0]);
					if(actor){
						$statCalc.clearCustomSpirit(
							actor,
							args[1],//slot				
						);
					}
				}
				
				if (command === 'awardFavPoints') {					
					$gameSystem.awardFavPoints(args[0]);
				}
				
				if (command === 'deployItemBox') {					
					$gameSystem.deployItemBox($gameMap.event(args[0] * 1), JSON.parse(args[1] || "[]"))
				}
				
				if (command === 'collectItemsBoxes') {		
					let targetId = args[0];
					if(targetId == null){
						targetId = -1;
					}
					let items = [];
					for(let event of $gameMap.events()){
						if(event.isDropBox && (targetId == -1 || event.eventId() == targetId)){
							items = items.concat(event.dropBoxItems);
							event.isDropBox = false;
							event.erase();
						}
					}
					if(items.length){
						$gameMessage.setFaceImage("", "");
						$gameMessage.setBackground(1);
						$gameMessage.setPositionType(1);
						let names = items.map((itemId) => $itemEffectManager.getAbilityDisplayInfo(itemId).name);
						$gameMessage.add("\\TA[1]\n" + APPSTRINGS.GENERAL.label_box_pickup_scripted.replace("{ITEMS}", names.join(", ")));
						
						for(let item of items){
							$inventoryManager.addItem(item);
						}
					}
				}
							
			} catch(e){
				var msg = "";
				msg+="Error while executing a plugin command: "+getLogContext();
				msg+="<br><br>";
				if(e.message){
					msg+=e.message + "\n\n" + e.stack;
					console.error(e.stack);
				} else {
					msg+=e;
				}
				
				throw msg;
			}
		};	
	}