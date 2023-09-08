	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		//====================================================================
		// ●Game_Interpreter
		//====================================================================
		// イベントＩＤをもとに、ユニット間の距離をとる

		Game_Interpreter.prototype.initialize = function(depth) {
			this._depth = depth || 0;
			this.checkOverflow();
			this.clear();
			this._branch = {};
			this._params = [];
			this._indent = 0;
			this._frameCount = 0;
			this._freezeChecker = 0;
			
			this._lastFadeState = -1;
			this._haltingCommands = {
				
			};
		};
		
		Game_Interpreter.prototype.setWaitMode = function(waitMode) {
			/*if(this.isTextSkipMode){
				return;
			}*/
			this._waitMode = waitMode;
			if(this._childInterpreter){
				this._childInterpreter.setWaitMode(waitMode);
			}
		}

		Game_Interpreter.prototype.isHaltingCommand = function(command) {
			if(command.code == 355){ // script call
				//loose checking for halting custom commands 
				var haltingScriptCommands = [
					"showStageConditions",
					"showEnemyPhaseText",
					"awardSRPoint",
					"showMapAttackText",
					"destroyEvent",
					"destroyEvents",
					"applyActorSpirits",
					"applyEventSpirits",
					"processEnemyAppearQueue",
					"processUnitAppearQueue",
					"processDisappearQueue",
					"manualDeploy",
					"manualShipDeploy",
					"playBattleScene",			
				];
				
				var hasHalting = false;
				haltingScriptCommands.forEach(function(entry){
					var re = new RegExp(".*"+entry+".*","g");
					if(command.parameters[0].match(re)){
						hasHalting = true;
					}
				});
				return hasHalting;
			}
			
			if(command.code == 356){ // plugin command
				var haltingPluginCommands = {
					"stopSkipping": true,
					"Intermission": true
				}
				var args = command.parameters[0].split(" ");
				var entry = args.shift();
				return !!haltingPluginCommands[entry];
			}
			
			return !!this._haltingCommands[command.code];
		}

		// Script
		Game_Interpreter.prototype.command355 = function() {
			var script = this.currentCommand().parameters[0] + '\n';
			while (this.nextEventCode() === 655) {
				this._index++;
				script += this.currentCommand().parameters[0] + '\n';
			}
			var result;
			try {
				result = eval(script);
			} catch (e){
				var msg = "";
				msg+="Error while executing a script command:";
				msg+="<br>";
				if(e.message){
					msg+=e.message;
				} else {
					msg+=e;
				}
				msg+="<br><br>Script body:<br>";
				msg+="<div style='overflow: auto; height: 28vh; max-width: 50vw; text-align: left; margin-left: auto; margin-right: auto; background-color: white; color: black; padding: 5px;text-shadow: none; font-size: 14px;'>";
				msg+=script.replace(/\n/g, "<br>");
				msg+="</div>";
				throw msg;
			}
			
			if(result == null){
				return true;
			} else {
				return result;
			}
		};
		
		Game_Interpreter.prototype.distanceBetweenEvents = function(eventId1, eventId2) {
			var event1 = $gameMap.event(eventId1);
			var event2 = $gameMap.event(eventId2);
			var deltaX = Math.abs(event1.posX() - event2.posX());
			var deltaY = Math.abs(event1.posY() - event2.posY());
			return deltaX + deltaY;
		}

		Game_Interpreter.prototype.EventDistance = function(variableId, eventId1, eventId2) {
			var event1 = $gameMap.event(eventId1);
			var event2 = $gameMap.event(eventId2);
			if (event1 && event2 && !event1.isErased() && !event2.isErased()) {
				var value = $gameSystem.unitDistance(event1, event2);
				$gameVariables.setValue(variableId, value);
			} else {
				$gameVariables.setValue(variableId, 999);
			}
			return true;
		};

		// アクターＩＤをもとに、ユニット間の距離をとる
		Game_Interpreter.prototype.ActorDistance = function(variableId, actorId1, actorId2) {
			var eventId1 = $gameSystem.ActorToEvent(actorId1);
			var eventId2 = $gameSystem.ActorToEvent(actorId2);
			this.EventDistance(variableId, eventId1, eventId2);
			return true;
		};

		// 特定のＩＤのイベントと全アクターの中で最短の距離をとる
		Game_Interpreter.prototype.fromActorMinimumDistance = function(variableId, eventId) {
			var minDistance = 999;
			var event1 = $gameMap.event(eventId);
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
					var event2 = $gameMap.event(event.eventId());
					if (event1 && event2 && !event1.isErased() && !event2.isErased()) {
						var value = $gameSystem.unitDistance(event1, event2);
						if (value < minDistance) {
							minDistance = value;
						}
					}
				}
			});
			$gameVariables.setValue(variableId, minDistance);
			return true;
		};

		// 新規アクターを追加する（増援）
		Game_Interpreter.prototype.addActor = function(eventId, actorId) {
			var actor_unit = $gameActors.actor(actorId);
			var event = $gameMap.event(eventId);
			if (actor_unit && event) {
				$gameSystem.pushSrpgAllActors(event.eventId());
				actor_unit.initTp(); //TPを初期化
				var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
				var oldValue = $gameVariables.value(_existActorVarID);
				$gameVariables.setValue(_existActorVarID, oldValue + 1);
				$gameSystem.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
				event.setType('actor');
				var xy = event.makeAppearPoint(event, event.posX(), event.posY());
				event.setPosition(xy[0], xy[1]);
				$gameMap.setEventImages();
			}
			return true;
		};

		Game_Interpreter.prototype.setMasteryText = function(text){
			$gameVariables.setValue(_masteryConditionText, text);
		}

		Game_Interpreter.prototype.setVictoryText = function(text){
			$gameVariables.setValue(_victoryConditionText, text);
		}

		Game_Interpreter.prototype.setDefeatText = function(text){
			$gameVariables.setValue(_defeatConditionText, text);
		}

		Game_Interpreter.prototype.showStageConditions = function(){
			/*if (!$gameMessage.isBusy()) {
				$gameMessage.setFaceImage("", "");
				$gameMessage.setBackground(0);
				$gameMessage.setPositionType(1);
				$gameMessage.add(APPSTRINGS.GENERAL.label_victory_condition + ": "+($gameVariables.value(_victoryConditionText) || ""));
				$gameMessage.add(APPSTRINGS.GENERAL.label_defeat_condition + ": "+($gameVariables.value(_defeatConditionText) || ""));
				var masteryText = $gameVariables.value(_masteryConditionText);
				if($SRWSaveManager.isMapSRPointLocked($gameMap.mapId())){
					masteryText = APPSTRINGS.GENERAL.label_mastery_locked;
				}
				$gameMessage.add(APPSTRINGS.GENERAL.label_mastery_condition + ": "+(masteryText || ""));
				
				this._index++;
				this.setWaitMode('message');
			}*/
			$gameTemp.pushMenu = "stage_conditions";
			$gameTemp.contextState = $gameSystem.isSubBattlePhase();
			$gameSystem.setSubBattlePhase("stage_conditions");	
			
			$gameTemp.showingStageConditions = true;
			this.setWaitMode('stage_conditions');
			this._index++;
			return false;
		}
		
		

		Game_Interpreter.prototype.showEnemyPhaseText = function(){
			if (!$gameMessage.isBusy()) {
				$gameMessage.setFaceImage("", "");
				$gameMessage.setBackground(1);
				$gameMessage.setPositionType(1);
				
				var text;
				if($gameSystem.isEnemyPhase()){
					text =  APPSTRINGS.GENERAL.label_enemy_phase;
				} else {
					text =  APPSTRINGS.GENERAL.label_ally_phase;
				}
				var colorId;
				if($gameTemp.currentFaction == 0){
					colorId = 18;
				}
				if($gameTemp.currentFaction == 1){
					colorId = 3;
				}
				if($gameTemp.currentFaction == 2){
					colorId = 14;
				}
				$gameMessage.add("\\TA[1]\n\\>\\C["+colorId+"]\\{"+text+"\n\\.\\.\\^");	//\\|			
				this._index++;
				
				$gameSystem.pushTextLog("", "", text);
				
			
				this.setWaitMode('message');
			}
			return false;
		}

		Game_Interpreter.prototype.awardSRPoint = function(){	
			var mapId = $gameMap.mapId();
			var isNewlyAwarded = $SRWSaveManager.awardMapSRPoint(mapId);	
			if(isNewlyAwarded){
				if(ENGINE_SETTINGS.MASTERY_REWARDS){
					if(ENGINE_SETTINGS.MASTERY_REWARDS.PP){
						var scope = ENGINE_SETTINGS.MASTERY_REWARDS.PP.SCOPE;
						var actors = [];
						if(scope == "deployed"){
							actors = $statCalc.getAllActors("actor");
						} else if(scope == "unlocked"){
							actors = $gameParty.allMembers();
						} else if(scope == "all"){
							for(var i = 0; i < $dataActors.length; i++){
								var actor = $gameActors.actor(i);
								actors.push(actor);
							}
						}	
						actors.forEach(function(actor){
							if(actor && actor.isActor()){
								$statCalc.addPP(actor, ENGINE_SETTINGS.MASTERY_REWARDS.PP.AMOUNT);	
							}					
						});
					}
					if(ENGINE_SETTINGS.MASTERY_REWARDS.FUNDS){
						$gameParty.gainGold(ENGINE_SETTINGS.MASTERY_REWARDS.FUNDS);	
					}
				}		
				
				var se = {};
				se.name = 'SRWMastery';
				se.pan = 0;
				se.pitch = 100;
				se.volume = 80;
				AudioManager.playSe(se);
				$gameVariables.setValue(_masteryConditionText, APPSTRINGS.GENERAL.label_mastery_completed);	
				
				if (!$gameMessage.isBusy()) {
					$gameMessage.setFaceImage("", "");
					$gameMessage.setBackground(1);
					$gameMessage.setPositionType(1);
					$gameMessage.add("\\TA[1]\n" + APPSTRINGS.GENERAL.label_mastery_completed_message);				
					this._index++;
					this.setWaitMode('message');
				}
				
				return false;
			}
			return true;
		}

		Game_Interpreter.prototype.showMapAttackText = function(faceName, faceIdx, text){
			if (!$gameMessage.isBusy()) {
				$gameMessage.setFaceImage(faceName, faceIdx);
				$gameMessage.setPositionType(2);
				$gameMessage.setBackground(0);
				$gameMessage.add(text);				
				this._index++;
				this.setWaitMode('message');
			}
			return false;
		}

		Game_Interpreter.prototype.isActorDestructionQueued  = function(id){
			var result = false;
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(queuedDeath.actor.isActor() && queuedDeath.actor.actorId() == id && (!$gameTemp.preventedDeathQuotes || !$gameTemp.preventedDeathQuotes[id])){
						result = true;
					}
				});
			}
			return result;
		}

		Game_Interpreter.prototype.isEnemyDestructionQueued  = function(id){
			var result = false;
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(!queuedDeath.actor.isActor() && queuedDeath.actor.enemyId() == id){
						result = true;
					}
				});
			}
			return result;
		}

		Game_Interpreter.prototype.isEventDestructionQueued  = function(id){
			var result = false;
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(queuedDeath.actor.event.eventId() == id){
						result = true;
					}
				});
			}
			return result;
		}

		Game_Interpreter.prototype.isActorBelowHP  = function(id, hp){
			return $statCalc.isActorBelowHP(id, hp);
		}

		Game_Interpreter.prototype.isEnemyBelowHP  = function(id, hp){
			return $statCalc.isEnemyBelowHP(id, hp);
		}

		Game_Interpreter.prototype.isEventBelowHP  = function(id, hp){
			return $statCalc.isEventBelowHP(id, hp);
		}
		
		Game_Interpreter.prototype.isActorBelowHPPercent  = function(id, hp){
			return $statCalc.isActorBelowHPPercent(id, hp);
		}

		Game_Interpreter.prototype.isEnemyBelowHPPercent  = function(id, hp){
			return $statCalc.isEnemyBelowHPPercent(id, hp);
		}
		
		Game_Interpreter.prototype.isEventBelowHPPercent  = function(id, hp){
			return $statCalc.isEventBelowHPPercent(id, hp);
		}
		
		Game_Interpreter.prototype.updateCountAfterDestruction = function (actor){
			if (actor.isActor(0)) {
				var oldValue = $gameVariables.value(_existActorVarID);
				$gameVariables.setValue(_existActorVarID, oldValue - 1);
				
				var oldValue = $gameVariables.value(_actorsDestroyed);
				$gameVariables.setValue(_actorsDestroyed, oldValue + 1);
	
			} else if(!$gameSystem.isFriendly(actor, "player")){
				var oldValue = $gameVariables.value(_existEnemyVarID);
				$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
				
				var oldValue = $gameVariables.value(_enemiesDestroyed);
				$gameVariables.setValue(_enemiesDestroyed, oldValue + 1);
			}
		}

		Game_Interpreter.prototype.cancelActorDestruction  = function(id, updateCount){
			var _this = this;
			var tmp = [];
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(!queuedDeath.actor.isActor() || queuedDeath.actor.actorId() != id){
						tmp.push(queuedDeath);
					} else if(updateCount){
						_this.updateCountAfterDestruction(queuedDeath.actor);
					}
				});
				$gameTemp.deathQueue = tmp;
			}
		}

		Game_Interpreter.prototype.cancelEnemyDestruction  = function(id, updateCount){
			var _this = this;
			var tmp = [];
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(queuedDeath.actor.isActor() || queuedDeath.actor.enemyId() != id){
						tmp.push(queuedDeath);
					} else if(updateCount){
						_this.updateCountAfterDestruction(queuedDeath.actor);
					}
				});
				$gameTemp.deathQueue = tmp;
			}
		}

		Game_Interpreter.prototype.cancelEventDestruction  = function(id, updateCount){
			var _this = this;
			var tmp = [];
			if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
				$gameTemp.deathQueue.forEach(function(queuedDeath){
					if(queuedDeath.actor.event && queuedDeath.actor.event.eventId() != id){
						tmp.push(queuedDeath);
					} else if(updateCount){
						_this.updateCountAfterDestruction(queuedDeath.actor);
					}
				});
				$gameTemp.deathQueue = tmp;
			}
		}

		Game_Interpreter.prototype.addEnemiesFromObj = function(params) {
			for(var i = startId; i <= endId; i++){
				this.addEnemy(
					params.toAnimQueue, 
					i, 
					params.enemyId, 
					params.mechClass, 
					params.level, 
					params.mode, 
					params.targetId, 
					params.items, 
					params.squadId, 
					params.targetRegion,
					params.factionId,
					params.counterBehavior,
					params.attackBehavior,
					params.noUpdateCount,
					params.attribute1,
					params.attribute2,
					params.boxDrop,
					params.targetBox
				);
			}
		}

		Game_Interpreter.prototype.addEnemies = function(toAnimQueue, startId, endId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, attribute1, attribute2, boxDrop, targetBox) {
			for(var i = startId; i <= endId; i++){
				this.addEnemy(toAnimQueue, i, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, attribute1, attribute2, boxDrop, targetBox);
			}
		}

		Game_Interpreter.prototype.addEnemyFromObj = function(params){
			this.addEnemy(
				params.toAnimQueue, 
				params.eventId, 
				params.enemyId, 
				params.mechClass, 
				params.level, 
				params.mode, 
				params.targetId, 
				params.items, 
				params.squadId, 
				params.targetRegion,
				params.factionId,
				params.counterBehavior,
				params.attackBehavior,
				params.noUpdateCount,
				params.attribute1,
				params.attribute2,
				params.boxDrop,
				params.targetBox
			);
		}

		// 新規エネミーを追加する（増援）
		Game_Interpreter.prototype.addEnemy = function(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, counterBehavior, attackBehavior, noUpdateCount, attribute1, attribute2, boxDrop, targetBox) {
			if(!$dataEnemies[enemyId] || !$dataEnemies[enemyId].meta || !Object.keys($dataEnemies[enemyId].meta).length){
				throw("Attempted to create an enemy pilot with id '"+enemyId+"' which does not have SRW data.");
			}
			
			if(!$dataClasses[mechClass] || !$dataClasses[mechClass].meta || !Object.keys($dataClasses[mechClass].meta).length){
				throw("Attempted to create a mech with id '"+mechClass+"' which does not have SRW data.");
			}
			
			var enemy_unit = new Game_Enemy(enemyId, 0, 0);
			var event = $gameMap.event(eventId);
			
			event._appearSpriteInitialized = false;
			event._destroySpriteInitialized = false;
			
			let parts = $dataClasses[mechClass].meta.srpgOverworld.split(",");
			ImageManager.loadCharacter(parts[0]);
			
			if(typeof squadId == "undefined" || squadId == ""){
				squadId = -1;
			}
			if(typeof targetRegion == "undefined"|| targetRegion == ""){
				targetRegion = -1;
			}
			if(typeof targetBox == "undefined"|| targetBox == ""){
				targetBox = -1;
			}
			if(typeof factionId == "undefined"|| factionId == ""){
				factionId = 0;
			}
			if (enemy_unit && event) { 	
				event._lastModsPosition = null;
				event.isDropBox = false;
				event.isShip = false;
				delete event.dropBoxItems;

				enemy_unit._mechClass = mechClass;	
				enemy_unit.squadId = squadId;	
				enemy_unit.targetRegion = targetRegion;	
				enemy_unit.targetBox = targetBox;
				enemy_unit.factionId = factionId;	
				enemy_unit.targetUnitId = targetId || "";
				enemy_unit.counterBehavior = counterBehavior || "attack";
				enemy_unit.attackBehavior = attackBehavior || "attack";
				if (enemy_unit) {
					enemy_unit.event = event;
					if (mode) {
						enemy_unit.setBattleMode(mode || "");
					}
					enemy_unit.initTp(); //TPを初期化
					var faceName = enemy_unit.enemy().meta.faceName; //顔グラフィックをプリロードする
					if (faceName) {
						var bitmap = ImageManager.loadFace(faceName);
					} else {
						if ($gameSystem.isSideView()) {
							var bitmap = ImageManager.loadSvEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
						} else {
							var bitmap = ImageManager.loadEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
						}
					}
					
					$gameSystem.setEventToUnit(event.eventId(), 'enemy', enemy_unit);
					$statCalc.initSRWStats(enemy_unit, level, items, false, false, boxDrop);
					$statCalc.applyBattleStartWill(enemy_unit);
					$statCalc.updateSuperState(enemy_unit, false, true);
					
					
					if(!noUpdateCount){
						
						if(!$gameSystem.isFriendly(enemy_unit, "player")){
							var oldValue = $gameVariables.value(_existEnemyVarID);
							$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
						} else {
							var oldValue = $gameVariables.value(_existActorVarID);
							$gameVariables.setValue(_existActorVarID, oldValue + 1);
						}
					}
					
					event.setType('enemy');
					/*var xy = event.makeAppearPoint(event, event.posX(), event.posY())
					event.setPosition(xy[0], xy[1]);	*/
					var position = $statCalc.getAdjacentFreeSpace({x: event.posX(), y: event.posY()}, null, event.eventId());
					event.locate(position.x, position.y);
					if(!$gameTemp.enemyAppearQueue){
						$gameTemp.enemyAppearQueue = [];
					}	
					if(toAnimQueue){				
						event.erase();
						$gameTemp.enemyAppearQueue.push(event);
					} else {
						$gameMap.setEventImages();
					}
				}
				if(attribute1){
					$statCalc.setStageTemp(enemy_unit, "attribute1", attribute1);
				}
				if(attribute2){
					$statCalc.setStageTemp(enemy_unit, "attribute2", attribute2);
				}
			}
			//$statCalc.invalidateAbilityCache();
			
			
			return true;
		};
		
		
		Game_Interpreter.prototype.addSubTwinEnemyFromObj = function(params){
			this.addEnemy(
				params.eventId, 
				params.enemyId, 
				params.mechClass, 
				params.level, 
				params.mode, 
				params.targetId, 
				params.items, 
				params.squadId, 
				params.targetRegion,
				params.factionId,
				params.counterBehavior,
				params.noUpdateCount
			);
		}

		Game_Interpreter.prototype.addSubTwinEnemy = function(eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, counterBehavior, noUpdateCount) {
			var enemy_unit = new Game_Enemy(enemyId, 0, 0);
			var event = $gameMap.event(eventId);
			if(typeof squadId == "undefined" || squadId == ""){
				squadId = -1;
			}
			if(typeof targetRegion == "undefined"|| targetRegion == ""){
				targetRegion = -1;
			}
			if(typeof factionId == "undefined"|| factionId == ""){
				factionId = 0;
			}
			if (enemy_unit && event) { 	
				var mainEnemy = $gameSystem.EventToUnit(eventId)[1];
				
				enemy_unit._mechClass = mechClass;	
				enemy_unit.squadId = squadId;	
				enemy_unit.targetRegion = targetRegion;	
				enemy_unit.factionId = factionId;	
				enemy_unit.targetUnitId = targetId || "";
				enemy_unit.counterBehavior = counterBehavior || "attack";
				if (enemy_unit) {
					
					if (mode) {
						enemy_unit.setBattleMode(mode);
					}
					enemy_unit.initTp(); //TPを初期化
					var faceName = enemy_unit.enemy().meta.faceName; //顔グラフィックをプリロードする
					if (faceName) {
						var bitmap = ImageManager.loadFace(faceName);
					} else {
						if ($gameSystem.isSideView()) {
							var bitmap = ImageManager.loadSvEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
						} else {
							var bitmap = ImageManager.loadEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
						}
					}
					if(!noUpdateCount && !$gameSystem.isFriendly(enemy_unit, "player")){
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
					}			
					$statCalc.initSRWStats(enemy_unit, level, items);
					$statCalc.applyBattleStartWill(enemy_unit);
					
					enemy_unit.isSubTwin = true;			
					mainEnemy.subTwin = enemy_unit;
					mainEnemy.subTwinId = enemy_unit.enemyId();
				}
			}
			$statCalc.invalidateAbilityCache();
			return true;
		}

		Game_Interpreter.prototype.destroyEvents = function(startId, endId) {
			var se = {};
			se.name = "SRWExplosion";
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
			for(var i = startId; i <= endId; i++){
				this.destroyEvent(i, true);
			}
		}

		Game_Interpreter.prototype.destroyEvent = function(eventId, silent) {
			var event = $gameMap.event(eventId);
			if(event && !event.isErased()){
				event.isDoingDeathAnim = true;
				event.silent = silent;
				var actorInfo = $gameSystem.EventToUnit(eventId);
				if(actorInfo){
					var actor = actorInfo[1];
					if(actor.isActor()){
						var oldValue = $gameVariables.value(_existActorVarID);
						$gameVariables.setValue(_existActorVarID, oldValue - 1);
					} else {
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
					}
				}				
			}			
		}

		Game_Interpreter.prototype.eraseEventsOfType = function(type, omitted, toQueue) {
			var _this = this;
			omitted = omitted || [];
			var candidates = $statCalc.getAllCandidateActors(type);
			candidates.forEach(function(candidate){
				if(candidate.event){
					if(omitted.indexOf(candidate.event.eventId()) == -1){
						_this.eraseEvent(candidate.event.eventId(), toQueue);
					}
				}
			});
		}

		Game_Interpreter.prototype.eraseEvents = function(startId, endId, toQueue) {
			for(var i = startId; i <= endId; i++){
				this.eraseEvent(i, toQueue);
			}
		}

		Game_Interpreter.prototype.eraseEvent = function(eventId, toQueue) {
			var event = $gameMap.event(eventId);
			if(event && !event.isErased()){
				if(toQueue){
					if(!$gameTemp.disappearQueue){
						$gameTemp.disappearQueue = [];
					}
					$gameTemp.disappearQueue.push(event);
				} else {
					event.erase();
				}	
				event.manuallyErased = true;
				var battlerArray = $gameSystem.EventToUnit(eventId);
				if(battlerArray){
					var actor = battlerArray[1];
					if(actor.isActor()){
						var decrement = 1;
						if(actor.SRWStats.mech.combinesFrom){
							decrement = actor.SRWStats.mech.combinesFrom.length;
						}
						var oldValue = $gameVariables.value(_existActorVarID);
						$gameVariables.setValue(_existActorVarID, oldValue - decrement);
						if($gameVariables.value(_existActorVarID) < 0){
							$gameVariables.setValue(_existActorVarID, 0);
						}
					} else {
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
					}
				}				
			}	
		}
		
		Game_Interpreter.prototype.revealEvent = function(eventId, toQueue) {
			var event = $gameMap.event(eventId);
			if(event && event.isErased()){
				if(toQueue){
					if(!$gameTemp.enemyAppearQueue){
						$gameTemp.enemyAppearQueue = [];
					}
					$gameTemp.enemyAppearQueue.push(event);
				} else {
					event.appear();
				}	
				event.manuallyErased = false;
				var battlerArray = $gameSystem.EventToUnit(eventId);
				if(battlerArray){
					var actor = battlerArray[1];
					if(actor.isActor()){
						var oldValue = $gameVariables.value(_existActorVarID);
						$gameVariables.setValue(_existActorVarID, oldValue + 1);
					} else {
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
					}
					event.isPendingDeploy = true;
					$statCalc.invalidateAbilityCache(actor);
					$statCalc.applyStatModsToValue(actor, 0, ["weapon_melee"]);//force a reeval
				}	
				event.refreshImage();	
			}
		}

		Game_Interpreter.prototype.updateWaitMode = function() {
			var waiting = false;
			switch (this._waitMode) {
			case 'message':
				waiting = $gameMessage.isBusy();
				break;
			case 'transfer':
				waiting = $gamePlayer.isTransferring();
				break;
			case 'scroll':
				waiting = $gameMap.isScrolling();
				break;
			case 'route':
				waiting = this._character.isMoveRouteForcing();
				break;
			case 'animation':
				waiting = this._character.isAnimationPlaying();
				break;
			case 'balloon':
				waiting = this._character.isBalloonPlaying();
				break;
			case 'gather':
				waiting = $gamePlayer.areFollowersGathering();
				break;
			case 'action':
				waiting = BattleManager.isActionForced();
				break;
			case 'video':
				waiting = Graphics.isVideoPlaying();
				break;
			case 'image':
				waiting = !ImageManager.isReady();
				break;
			case 'enemy_appear':
				waiting = $gameTemp.enemyAppearQueueIsProcessing || $gameTemp.disappearQueueIsProcessing;
				break;	
			case 'manual_deploy':
				waiting = $gameTemp.doingManualDeploy;
				break;	
			case 'move_to_point':
				waiting = $gameSystem.srpgWaitMoving();
				break;	
			case 'battle_demo':
				waiting = $gameTemp.playingBattleDemo;
				break;
			case 'spirit_activation':
				waiting = $gameTemp.playingSpiritAnimations;
				break;	
			case 'text_script_loading':
				waiting = this._isLoadingTextScript;
				break;		
			case 'opening_crawl':
				waiting = $gameTemp.doingOpeningCrawl;
				break;		
			case 'stage_conditions':
				waiting = $gameTemp.showingStageConditions;
				break;	
			case 'custom_wait':
				waiting = $gameTemp.isCustomWait;
				break;	
			case 'sound_effect':
				waiting = AudioManager.isPlayingSE();
				break;	
			} 
			
			if (!waiting) {
				if(this._waitMode == "route"){
					$gameTemp.movingCursorByScript = false;
				}
				this._waitMode = '';
			}
			return waiting;
		};

		Game_Interpreter.prototype.applyActorSpirits = function(actorId, spiritIds){
			this.applyEventSpirits($gameActors.actor(actorId).event.eventId(), spiritIds);
		}

		Game_Interpreter.prototype.applyEventSpirits = function(eventId, spiritIds){
			var spirits = [];
			var event = $gameMap.event(eventId);
			$gamePlayer.locate(event.posX(), event.posY());
			var actor = $gameSystem.EventToUnit(eventId)[1];
			spiritIds.forEach(function(spiritId){
				spirits.push({
					idx: spiritId,
					level: 1,
					cost: 0,
					caster: actor,
					target: actor
				});
			});
			$gameTemp.playingSpiritAnimations = true;
			this.setWaitMode("spirit_activation");
			$gameTemp.eventSpirits = spirits;
			$gameTemp.eventSpiritPhaseContext = $gameSystem.isSubBattlePhase();
			$gameSystem.setSubBattlePhase("event_spirits");			
			//this._index++;
			return true;
		}
		
		Game_Interpreter.prototype.setCustomWait = function(){
			$gameTemp.isCustomWait = true;
			this.setWaitMode("custom_wait");
		}
		
		Game_Interpreter.prototype.setSEWait = function(){
			this.setWaitMode("sound_effect");
		}
		
		Game_Interpreter.prototype.clearCustomWait = function(){
			$gameTemp.isCustomWait = false;
		}

		Game_Interpreter.requestImages = function(list, commonList){
			if(!list) return;
			let _this = this;

			list.forEach(function(command){
				var params = command.parameters;
				switch(command.code){
					// Show Text
					case 101:
						ImageManager.requestFace(params[0]);
						break;

					// Common Event
					case 117:
						var commonEvent = $dataCommonEvents[params[0]];
						if (commonEvent) {
							if (!commonList) {
								commonList = [];
							}
							if (!commonList.contains(params[0])) {
								commonList.push(params[0]);
								Game_Interpreter.requestImages(commonEvent.list, commonList);
							}
						}
						break;

					// Change Party Member
					case 129:
						var actor = $gameActors.actor(params[0]);
						if (actor && params[1] === 0) {
							var name = actor.characterName();
							ImageManager.requestCharacter(name);
						}
						break;

					// Set Movement Route
					case 205:
						if(params[1]){
							params[1].list.forEach(function(command){
								var params = command.parameters;
								if(command.code === Game_Character.ROUTE_CHANGE_IMAGE){
									ImageManager.requestCharacter(params[0]);
								}
							});
						}
						break;

					// Show Animation, Show Battle Animation
					case 212: case 337:
						if(params[1]) {
							var animation = $dataAnimations[params[1]];
							var name1 = animation.animation1Name;
							var name2 = animation.animation2Name;
							var hue1 = animation.animation1Hue;
							var hue2 = animation.animation2Hue;
							ImageManager.requestAnimation(name1, hue1);
							ImageManager.requestAnimation(name2, hue2);
						}
						break;

					// Change Player Followers
					case 216:
						if (params[0] === 0) {
							$gamePlayer.followers().forEach(function(follower) {
								var name = follower.characterName();
								ImageManager.requestCharacter(name);
							});
						}
						break;

					// Show Picture
					case 231:
						ImageManager.loadPicture(params[1]); //make show picture awaitable by the interpreter
						if($gameMap && $gameMap._interpreter){
							$gameMap._interpreter.setWaitMode('image');
						}						
						break;

					// Change Tileset
					case 282:
						var tileset = $dataTilesets[params[0]];
						tileset.tilesetNames.forEach(function(tilesetName){
							ImageManager.requestTileset(tilesetName);
						});
						break;

					// Change Battle Back
					case 283:
						if ($gameParty.inBattle()) {
							ImageManager.requestBattleback1(params[0]);
							ImageManager.requestBattleback2(params[1]);
						}
						break;

					// Change Parallax
					case 284:
						if (!$gameParty.inBattle()) {
							ImageManager.requestParallax(params[0]);
						}
						break;

					// Change Actor Images
					case 322:
						ImageManager.requestCharacter(params[1]);
						ImageManager.requestFace(params[3]);
						ImageManager.requestSvActor(params[5]);
						break;

					// Change Vehicle Image
					case 323:
						var vehicle = $gameMap.vehicle(params[0]);
						if(vehicle){
							ImageManager.requestCharacter(params[1]);
						}
						break;

					// Enemy Transform
					case 336:
						var enemy = $dataEnemies[params[1]];
						var name = enemy.battlerName;
						var hue = enemy.battlerHue;
						if ($gameSystem.isSideView()) {
							ImageManager.requestSvEnemy(name, hue);
						} else {
							ImageManager.requestEnemy(name, hue);
						}
						break;
				}
			});
		};

		Game_Interpreter.prototype.processEnemyAppearQueue = function(){
			this.setWaitMode("enemy_appear");
			$gameTemp.enemyAppearQueueIsProcessing = true;
			$gameTemp.unitAppearTimer = 0;
		}

		Game_Interpreter.prototype.processUnitAppearQueue = function(){
			this.setWaitMode("enemy_appear");
			$gameTemp.enemyAppearQueueIsProcessing = true;
			$gameTemp.unitAppearTimer = 0;
		}

		Game_Interpreter.prototype.processDisappearQueue = function(){
			if($gameTemp.disappearQueue && $gameTemp.disappearQueue.length){
				this.setWaitMode("enemy_appear");
				$gameTemp.disappearQueueIsProcessing = true;
				$gameTemp.unitAppearTimer = 0;
			}			
		}

		Game_Interpreter.prototype.manualDeploy = function(unlockedOnly){
			this.setWaitMode("manual_deploy");
			$gameTemp.deployContextState = "start_srpg";
			$gameTemp.deployContextSubState = "wait";
			$gameTemp.deployMode = "";
			$gameTemp.manualDeployType = unlockedOnly ? "unlocked" : "all";
			$gameTemp.doingManualDeploy = true;
			$gameTemp.disableHighlightGlow = true;
			$gameSystem.setSubBattlePhase("deploy_selection_window");
			$gameTemp.pushMenu = "in_stage_deploy";
			$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()));
		}
		
		Game_Interpreter.prototype.manualDeployOnActorTurn = function(unlockedOnly){
			this.setWaitMode("manual_deploy");
			$gameTemp.deployContextState = "actor_phase";
			$gameTemp.deployContextSubState = "normal";
			$gameTemp.deployMode = "";
			$gameTemp.manualDeployType = unlockedOnly ? "unlocked" : "all";
			$gameTemp.doingManualDeploy = true;
			$gameTemp.disableHighlightGlow = true;
			$gameSystem.setSubBattlePhase("deploy_selection_window");
			$gameTemp.pushMenu = "in_stage_deploy";
			$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()));
		}

		Game_Interpreter.prototype.manualShipDeploy = function(){
			this.setWaitMode("manual_deploy");
			$gameTemp.deployMode = "ships";
			$gameTemp.doingManualDeploy = true;
			$gameTemp.disableHighlightGlow = true;
			$gameSystem.setSubBattlePhase("deploy_selection_window");
			$gameTemp.pushMenu = "in_stage_deploy";
			$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()));
		}
		
		Game_Interpreter.prototype.showTextCrawl = function(id, canCancel, speed){
			this.setWaitMode("opening_crawl");	
			$gameTemp.textCrawlId = id;	
			$gameTemp.textCrawlSpeed = speed || 1;	
			$gameTemp.pushMenu = "opening_crawl";		
			$gameTemp.canCancelTextCrawl = canCancel;	
			$gameTemp.doingOpeningCrawl = true;
		}

		// 指定した座標にプレイヤーを移動する
		Game_Interpreter.prototype.playerMoveTo = function(x, y) {
			$gameTemp.setAutoMoveDestinationValid(true);
			$gameTemp.setAutoMoveDestination(x, y);
			return true;
		};

		Game_Interpreter.prototype.cursorMoveTo = function(x, y, freeCam) {
			$gamePlayer.locate(x, y, freeCam);
			return true;
		};

		Game_Interpreter.prototype.isActorInRegion = function(actorId, regionId) {
			return $statCalc.isActorInRegion(actorId, regionId);
		}

		Game_Interpreter.prototype.isEnemyInRegion = function(enemyId, regionId) {
			return $statCalc.isEnemyInRegion(enemyId, regionId);
		}
		
		Game_Interpreter.prototype.isEventInRegion = function(eventId, regionId) {
			return $statCalc.isEventInRegion(eventId, regionId);
		}

		Game_Interpreter.prototype.getActorKillCount = function(actorId) {
			return $statCalc.getKills($gameActors.actor(actorId));
		}

		Game_Interpreter.prototype.setBattleModes = function(startId, endId, mode) {
			for(var i = startId; i <= endId; i++){
				this.setBattleMode(i, mode);
			}
		}

		// 指定したイベントの戦闘モードを設定する
		Game_Interpreter.prototype.setBattleMode = function(eventId, mode, applyToSquad) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				battlerArray[1].setBattleMode(mode, true);			
			}
			/*if(battlerArray[0] === 'enemy' && applyToSquad){
				if(battlerArray[1].squadId != -1){
					this.setSquadMode(squadId, mode);
				}
			}	*/
			return true;
		};

		Game_Interpreter.prototype.setTargetRegion = function(eventId, targetRegion) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				battlerArray[1].targetRegion = targetRegion;				
			}
			
			return true;
		};

		Game_Interpreter.prototype.setActorTargetRegion = function(actorId, targetRegion) {	
			return this.setTargetRegion($gameActors.actor(actorId).event.eventId(), targetRegion);
		};

		// 指定したイベントの戦闘モードを設定する
		Game_Interpreter.prototype.setActorBattleMode = function(actorId, mode) {  
			$gameActors.actor(actorId).setBattleMode(mode, true);		
			return true;
		};

		Game_Interpreter.prototype.setSquadMode = function(squadId, mode) {
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'enemy') {
					var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
					if(enemy.squadId == squadId){
						enemy.setBattleMode(mode, true);
					}	
				}
			});
		}

		Game_Interpreter.prototype.isDeployed = function(actorId) {
			var isDeployed = false;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor') {
					var battlerArray = $gameSystem.EventToUnit(event.eventId());
					if(battlerArray){
						var actor = battlerArray[1];
						if(actor.actorId() == actorId){
							isDeployed = true;
						}
					}				
				}
			});
			return isDeployed;
		}

		Game_Interpreter.prototype.isSquadWiped = function(squadId) {
			var isWiped = true;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'enemy') {
					var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
					if(enemy.squadId == squadId && !event.isErased()){
						isWiped = false;
					}	
				}
			});
			return isWiped;
		}

		Game_Interpreter.prototype.canObtainSRPoint = function() {
			return !$SRWSaveManager.isMapSRPointLocked($gameMap.mapId());
		}

		Game_Interpreter.prototype.activeFaction = function() {
			return $gameTemp.currentFaction;
		}

		Game_Interpreter.prototype.lastActorAttack = function() {
			return $gameTemp.lastActorAttack;
		}

		Game_Interpreter.prototype.isActorHitBy = function(actorId, weaponId, includeSupport) {
			var result = false;
			if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.actor){
				if($gameTemp.unitHitInfo.actor[actorId] && $gameTemp.unitHitInfo.actor[actorId][weaponId]){
					var hitInfo = $gameTemp.unitHitInfo.actor[actorId][weaponId];
					if(includeSupport || !hitInfo.isSupport) {
						result = true;
					} 
				}
			}
			return result;
		}

		Game_Interpreter.prototype.isEnemyHitBy = function(enemyId, weaponId, includeSupport) {
			var result = false;
			if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.enemy){
				if($gameTemp.unitHitInfo.enemy[enemyId] && $gameTemp.unitHitInfo.enemy[enemyId][weaponId]){
					var hitInfo = $gameTemp.unitHitInfo.enemy[enemyId][weaponId];
					if(includeSupport || !hitInfo.isSupport) {
						result = true;
					} 
				}
			}
			return result;
		}

		Game_Interpreter.prototype.isEventHitBy = function(eventId, weaponId, includeSupport) {
			var result = false;
			if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.event){
				if($gameTemp.unitHitInfo.event[eventId] && $gameTemp.unitHitInfo.event[eventId][weaponId]){
					var hitInfo = $gameTemp.unitHitInfo.event[eventId][weaponId];
					if(includeSupport || !hitInfo.isSupport) {
						result = true;
					} 
				}
			}
			return result;
		}

		Game_Interpreter.prototype.isActorInBattle = function(actorId) {
			var result = false;
			if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.isActor()){
				if($gameTemp.currentBattleActor.actorId() == actorId){
					result = true;
				}		
				if($gameTemp.currentBattleActor.subTwin && $gameTemp.currentBattleActor.subTwin.actorId() == actorId){
					result = true;
				}
			}
			if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.isActor()){
				if($gameTemp.currentBattleEnemy.actorId() == actorId){
					result = true;
				}
				if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.currentBattleEnemy.subTwin.actorId() == actorId){
					result = true;
				}
			}
			return result;
		}

		Game_Interpreter.prototype.isEnemyInBattle = function(enemyId) {
			var result = false;
			if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.isEnemy()){
				if($gameTemp.currentBattleActor.enemyId() == enemyId){
					result = true;
				}		
				if($gameTemp.currentBattleActor.subTwin && $gameTemp.currentBattleActor.subTwin.enemyId() == enemyId){
					result = true;
				}
			}
			if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.isEnemy()){
				if($gameTemp.currentBattleEnemy.enemyId() == enemyId){
					result = true;
				}
				if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.currentBattleEnemy.subTwin.enemyId() == enemyId){
					result = true;
				}
			}
			return result;
		}

		Game_Interpreter.prototype.isEventInBattle = function(eventId) {
			var result = false;
			if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.event && $gameTemp.currentBattleActor.event.eventId() == eventId){
				result = true;
			}
			if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.event && $gameTemp.currentBattleEnemy.event.eventId() == eventId){
				result = true;
				
			}
			return result;
		}
		
		Game_Interpreter.prototype.setEventAbilityZone = function(eventId, params) {
			$gameSystem.setEventAbilityZone(eventId, params);
		}

		Game_Interpreter.prototype.applyFadeState = function() {
			if(this.isTextSkipMode){
				if(this._lastFadeState == 0){
					$gameScreen.startFadeOut(this.fadeSpeed());
					this.wait(this.fadeSpeed());
				} else {
					$gameScreen.startFadeIn(this.fadeSpeed());
					this.wait(this.fadeSpeed());
				}
			}
		}

		Game_Interpreter.prototype.executeCommand = function() {
			var command = this.currentCommand();
			
			if (command) {
				//Input.update();
				if(!this.isHaltingCommand(command) && Input.isPressed("ok") && Input.isPressed("pagedown") && Input.isPressed("pageup")){
					if(!this.isTextSkipMode){
						$gameScreen.startFadeOut(this.fadeSpeed());
					}
					this.isTextSkipMode = true;		
					$gameTemp.isSkippingEvents = true;	
					this._lastBGM = AudioManager._currentBgm;
					//AudioManager.fadeOutBgm(2);
				}
				
				if(this.isHaltingCommand(command)){
					this.applyFadeState();
					this.isTextSkipMode = false;		
					this._lastFadeState = null;
					if(this._lastBGM){
						AudioManager.playBgm(this._lastBGM);
					}
					
					this._lastBGM = null;
					$gameTemp.isSkippingEvents = false;	
				}
				this._params = command.parameters;
				this._indent = command.indent;
				var methodName = 'command' + command.code;
				if (typeof this[methodName] === 'function') {
					if (!this[methodName]()) {
						return false;
					}
				}
				this._index++;
			} else {
				this.applyFadeState();
				this.isTextSkipMode = false;		
				this._lastFadeState = null;
				if(this._lastBGM){
					AudioManager.playBgm(this._lastBGM);
				}
				this._lastBGM = null;
				$gameTemp.isSkippingEvents = false;	
				this.terminate();
			}
			return true;
		};

		// Fadeout Screen
		Game_Interpreter.prototype.command221 = function() {
			if (!$gameMessage.isBusy()) {
				this._lastFadeState = 0;
				if(!this.isTextSkipMode){
					$gameScreen.startFadeOut(this.fadeSpeed());
					this.wait(this.fadeSpeed());
				}
				this._index++;
			}
			return false;
		};

		// Fadein Screen
		Game_Interpreter.prototype.command222 = function() {
			if (!$gameMessage.isBusy()) {
				this._lastFadeState = 1;
				if(!this.isTextSkipMode){
					$gameScreen.startFadeIn(this.fadeSpeed());
					this.wait(this.fadeSpeed());
				}
				this._index++;
			}
			return false;
		};

		//Wait
		Game_Interpreter.prototype.command230 = function() {
			if(!this.isTextSkipMode){
				this.wait(this._params[0]);
			}
			return true;
		};

		// Show Animation
		Game_Interpreter.prototype.command212 = function() {
			this._character = this.character(this._params[0]);
			if (this._character && !this.isTextSkipMode) {
				this._character.requestAnimation(this._params[1]);
				if (this._params[2]) {
					this.setWaitMode('animation');
				}
			}
			return true;
		};
		
		
		Game_Interpreter.prototype.convertToLogString = function(text) {
			text = text.replace(/\\/g, '\x1b');
			text = text.replace(/\x1b\x1b/g, '\\');
			text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
				return $gameVariables.value(parseInt(arguments[1]));
			}.bind(this));
			text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
				return $gameVariables.value(parseInt(arguments[1]));
			}.bind(this));
			text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
				return this.actorName(parseInt(arguments[1]));
			}.bind(this));
			text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
				return this.partyMemberName(parseInt(arguments[1]));
			}.bind(this));
			text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
			
			var index = 0;
			var tmp = [];
			while(index < text.length){
				if(text[index] == "\x1b"){
					index++;
					var regExp = /^[\$\.\|\^!><\{\}\\]|^[A-Z]+/i;
					var arr = regExp.exec(text.slice(index));
					if(arr){
						index+=arr[0].length;
					}
					var arr = /^\[\d+\]/.exec(text.slice(index));
					if (arr) {
						index += arr[0].length;
					}
				} else {
					tmp.push(text[index++]);
				}
			}		
			
			return tmp.join("");
		};

		Game_Interpreter.prototype.command101 = function() {
			if (!$gameMessage.isBusy()) {							
				
				var nextText = "";
				
				$gameMessage.setFaceImage(this._params[0], this._params[1]);
				$gameMessage.setBackground(this._params[2]);
				$gameMessage.setPositionType(this._params[3]);
				while (this.nextEventCode() === 401) {  // Text data
					this._index++;
					$gameMessage.add(this.currentCommand().parameters[0]);
				}			
				
				$gameSystem.pushTextLog(ImageManager.getTranslationInfo(this._params[0]), this._params[1], this.convertToLogString($gameMessage.allText()));
				
				switch (this.nextEventCode()) {
				case 102:  // Show Choices
					this._index++;
					this.setupChoices(this.currentCommand().parameters);
					
					this.applyFadeState();
					this.isTextSkipMode = false;
					$gameTemp.isSkippingEvents = false;	
					break;
				case 103:  // Input Number
					this._index++;
					this.setupNumInput(this.currentCommand().parameters);
					
					this.applyFadeState();
					this.isTextSkipMode = false;
					$gameTemp.isSkippingEvents = false;	
					break;
				case 104:  // Select Item
					this._index++;
					this.setupItemChoice(this.currentCommand().parameters);
					
					this.applyFadeState();
					this.isTextSkipMode = false;
					$gameTemp.isSkippingEvents = false;	
					break;
				default: // Regular text 
					if(this.isTextSkipMode){
						$gameMessage.clear();
					}			
					break;
				}
				this._index++;
				this.setWaitMode('message');
				
				
				
			}
			return false;
		};
		
		// Play SE
		Game_Interpreter.prototype.command250 = function() {
			if(!this.isTextSkipMode){
				AudioManager.playSe(this._params[0]);
			}
			return true;
		};
		
		// Play BGM
		Game_Interpreter.prototype.command241 = function() {
			if(!this.isTextSkipMode){
				AudioManager.playBgm(this._params[0]);
			} else {
				this._lastBGM = this._params[0];
			}
			
			return true;
		};
		
		// Play BGS
		Game_Interpreter.prototype.command245 = function() {
			if(!this.isTextSkipMode){
				AudioManager.playBgs(this._params[0]);
			}
			return true;
		};


		/**************************************
		Sample:
			this.playBattleScene({
				eventId: 0, // if included the matching event text will be used for the scene(see BattleText.conf.js).
				enemyFirst: 0, // if 0 the actor will move first, if 1 the enemy will move first. This also affects the supports. If 0, the actor support will be attacking otherwise defending. If 1, the enemy support will be attacking otherwise defending.
				songId: "Battle1", // the id of the song that should be played during the battle scene
				actor: {
					id: 1, // the id of the actor pilot
					action: "attack", // the action the actor will take: "attack", "defend", "evade". 
					weapon: 1, // the id of the attack the actor will use. Only used if the action is "attack".
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					startHP: 20, // the start HP of the actor in percent
					targetEndHP: 5, // the end HP of the target in percent
					posX: 0, // the x coordinate of the position on the map where this unit stands(optional)
					posY: 0, // the y coordinate of the position on the map where this unit stands(optional)
					referenceEventId: 21 // if provided posX, posY and startHP will be derived from this event instead
				},
				actorTwin: {
					id: 2, // the id of the actor pilot
					action: "attack", // the action the actor will take: "attack", "defend", "evade". 
					weapon: 3, // the id of the attack the actor will use. Only used if the action is "attack".
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					startHP: 20, // the start HP of the actor in percent
					targetEndHP: 5, // the end HP of the target in percent
					posX: 0, // the x coordinate of the position on the map where this unit stands(optional)
					posY: 0, // the y coordinate of the position on the map where this unit stands(optional)
					referenceEventId: 21 // if provided posX, posY and startHP will be derived from this event instead
				},
				actorSupport: { // ommit this section if there is no actor supporter
					id: 3, // the id of the actor pilot
					action: "attack", // the action the actor will take: "attack", "defend", "evade". 
					weapon: 5, // the id of the attack the actor will use. Only used if the action is "attack".
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					startHP: 100, // the start HP of the actor in percent
					targetEndHP: 0, // the end HP of the target in percent
				},
				enemy: {
					id: 1, // the id of the enemy pilot
					mechId: 10, // the id of the enemy mech
					weapon: 6, // the id of the attack the actor will use. Only used if the action is "attack".
					action: "attack", // the action the enemy will take: "attack", "defend", "evade". 
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					startHP: 80, // the start HP of the enemy in percent
					targetEndHP: 5, // the end HP of the target in percent
				},
				enemyTwin: {
					id: 1, // the id of the enemy pilot
					mechId: 10, // the id of the enemy mech
					weapon: 6, // the id of the attack the actor will use. Only used if the action is "attack".
					action: "attack", // the action the enemy will take: "attack", "defend", "evade". 
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					startHP: 80, // the start HP of the enemy in percent
					targetEndHP: 5, // the end HP of the target in percent
				},
				enemySupport: { // ommit this section if there is no enemy supporter
					id: 3, // the id of the enemy pilot
					mechId: 11,
					action: "defend", // the action the enemy will take: "attack", "defend", "evade". 
					hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
					weapon: -1, // the id of the attack the actor will use. Only used if the action is "attack".
					startHP: 100, // the start HP of the enemy in percent
					targetEndHP: 0, // the end HP of the target in percent
				}			
			});

		**************************************/
		Game_Interpreter.prototype.prepareBattleSceneActor = function(params) {
			var actor = new Game_Actor(params.id, 0, 0);
			$statCalc.initSRWStats(actor);
			if(params.mechId){
				actor._mechClass = params.mechId;	
				$statCalc.initSRWStats(actor);
			}
			params.unit = actor;
			if(params.referenceEventId != null){
				actor.event = $gameMap.event(params.referenceEventId)
			} else {
				actor.event = {
					eventId: function(){return 1;}, 
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			
			
			return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneSupportActor = function(params) {
			var actor = new Game_Actor(params.id, 0, 0);
			$statCalc.initSRWStats(actor);
			if(params.mechId){
				actor._mechClass = params.mechId;	
				$statCalc.initSRWStats(actor);
			}
			params.unit = actor;
			if(params.referenceEventId != null){
				actor.event = $gameMap.event(params.referenceEventId)
			} else {
				actor.event = {
					eventId: function(){return 3;},
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			
			return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneActorTwin = function(params) {
			var actor = new Game_Actor(params.id, 0, 0);
			$statCalc.initSRWStats(actor);
			actor.isEventSubTwin = true;
			actor.isSubTwin = true;
			if(params.mechId){
				actor._mechClass = params.mechId;	
				$statCalc.initSRWStats(actor);
			}
			params.unit = actor;
			if(params.referenceEventId != null){
				actor.event = $gameMap.event(params.referenceEventId)
			} else {
				actor.event = {
					eventId: function(){return 5;},
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			
			return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneEnemy = function(params) {
			var enemy = new Game_Enemy(params.id, 0, 0);
			$statCalc.initSRWStats(enemy);
			params.unit = enemy;
			enemy._mechClass = params.mechId;	
			$statCalc.initSRWStats(enemy);
			if(params.referenceEventId != null){
				enemy.event = $gameMap.event(params.referenceEventId)
			} else {
				enemy.event = {
					eventId: function(){return 2;},
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneSupportEnemy = function(params) {
			var enemy = new Game_Enemy(params.id, 0, 0);
			$statCalc.initSRWStats(enemy);
			params.unit = enemy;
			enemy._mechClass = params.mechId;	
			$statCalc.initSRWStats(enemy);
			if(params.referenceEventId != null){
				enemy.event = $gameMap.event(params.referenceEventId)
			} else {
				enemy.event = {
					eventId: function(){return 4;},
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneEnemyTwin = function(params) {
			var enemy = new Game_Enemy(params.id, 0, 0);
			$statCalc.initSRWStats(enemy);
			enemy.isEventSubTwin = true;
			enemy.isSubTwin = true;
			params.unit = enemy;
			enemy._mechClass = params.mechId;	
			$statCalc.initSRWStats(enemy);
			if(params.referenceEventId != null){
				enemy.event = $gameMap.event(params.referenceEventId)
			} else {
				enemy.event = {
					eventId: function(){return 6;},
					posX: function(){return params.posX || 0},
					posY: function(){return params.posY || 0},
				};
			}
			return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
		}

		Game_Interpreter.prototype.prepareBattleSceneAction = function(params) {
			var unit = params.unit;
			
			var weapon;
			if(typeof params.weapon == "object"){
				weapon = params.weapon;
			} else {
				weapon = $statCalc.getActorMechWeapon(unit, params.weapon)
			}
			
			var action;
			if(params.action == "attack"){		
				action = {
					type: "attack",
					attack: weapon,
					target: 0
				}
			}
			if(params.action == "defend"){		
				action = {
					type: "defend",
					attack: -1,
					target: 0
				}
			}
			if(params.action == "evade"){		
				action = {
					type: "evade",
					attack: -1,
					target: 0
				}
			}
			return action;
		}

		Game_Interpreter.prototype.setBattleSceneHP = function(actor, params) {
			if(actor && params){
				var mechStats = $statCalc.getCalculatedMechStats(actor);
				mechStats.currentHP = Math.floor(mechStats.maxHP * (params.startHP / 100));
			}	
		}

		Game_Interpreter.prototype.playBattleScene = function(params) {
			this.setWaitMode("battle_demo");
			$gameTemp.playingBattleDemo = true;
			$gameTemp.returnState = $gameSystem.isSubBattlePhase();
			$gameTemp.battleEffectCache = {};
			
			var actorInfo;
			if(params.actor.isEnemy){
				actorInfo = this.prepareBattleSceneEnemy(params.actor);
			} else {
				actorInfo = this.prepareBattleSceneActor(params.actor);
			}
			var enemyInfo = this.prepareBattleSceneEnemy(params.enemy);
				
			var actorTwinInfo;
			if(params.actorTwin){
				actorTwinInfo = this.prepareBattleSceneActorTwin(params.actorTwin);
			}
			
			var enemyTwinInfo;
			if(params.enemyTwin){
				enemyTwinInfo = this.prepareBattleSceneEnemyTwin(params.enemyTwin);
			}
			
			var actor = actorInfo.actor;
			var enemy = enemyInfo.actor;
			
			var attacker;
			var attackerTwin;
			var defender;
			var defenderTwin;
			var attackerSide;
			var defenderSide;
			if(params.enemyFirst){
				attackerSide = "enemy";
				defenderSide = "actor";
				attacker = enemyInfo;
				defender = actorInfo;
				attackerTwin = enemyTwinInfo;
				defenderTwin = actorTwinInfo;
			} else {
				attackerSide = "actor";
				defenderSide = "enemy";
				attacker = actorInfo;
				defender = enemyInfo;
				attackerTwin = actorTwinInfo;
				defenderTwin = enemyTwinInfo;
			}
			
			$battleCalc.prepareBattleCache(attacker, "initiator");
			$battleCalc.prepareBattleCache(defender, "defender");
			
			if(attackerTwin){
				$battleCalc.prepareBattleCache(attackerTwin, "twin attack");
			}
			
			if(defenderTwin){
				$battleCalc.prepareBattleCache(defenderTwin, "twin defend");
			}
				
			
			var actorCacheEntry = $gameTemp.battleEffectCache[actor._cacheReference];
			var enemyCacheEntry = $gameTemp.battleEffectCache[enemy._cacheReference];
			
			var supportAttacker;
			var supportDefender;
			
			var actorSupportInfo;	
			if(params.actorSupport){
				actorSupportInfo = this.prepareBattleSceneSupportActor(params.actorSupport);		
			}
			var actorSupport;
			var actorSupportCacheEntry;
			if(actorSupportInfo){
				actorSupport = actorSupportInfo.actor;
				if(params.enemyFirst){
					supportDefender = actorSupportInfo;
					$battleCalc.prepareBattleCache(actorSupportInfo, "support defend");
				} else {
					supportAttacker = actorSupportInfo;
					$battleCalc.prepareBattleCache(actorSupportInfo, "support attack");
				}	
				actorSupportCacheEntry = $gameTemp.battleEffectCache[actorSupport._cacheReference];	
			}
			
			var enemySupportInfo;	
			if(params.enemySupport){
				enemySupportInfo = this.prepareBattleSceneSupportEnemy(params.enemySupport);		
			}
			var enemySupport;
			var enemySupportCacheEntry;
			if(enemySupportInfo){
				enemySupport = enemySupportInfo.actor;
				if(params.enemyFirst){
					supportAttacker = enemySupportInfo;
					$battleCalc.prepareBattleCache(enemySupportInfo, "support attack");
				} else {
					supportDefender = enemySupportInfo;
					$battleCalc.prepareBattleCache(enemySupportInfo, "support defend");
				}	
				enemySupportCacheEntry = $gameTemp.battleEffectCache[enemySupport._cacheReference];	
			}	
			
				
			this.setBattleSceneHP(actor, params.actor);
			this.setBattleSceneHP(enemy, params.enemy);
			this.setBattleSceneHP(actorSupport, params.actorSupport);
			this.setBattleSceneHP(enemySupport, params.enemySupport);

			function BattleAction(attacker, defender, supportDefender, side, isSupportAttack){
				this._attacker = attacker;
				this._defender = defender;
				this._supportDefender = supportDefender;
				this._side = side;
				this._isSupportAttack = isSupportAttack;
			}
			
			BattleAction.prototype.execute = function(orderIdx){
				var aCache = $gameTemp.battleEffectCache[this._attacker.actor._cacheReference];
				if(this._isSupportAttack){
					aCache =  $gameTemp.battleEffectCache[this._attacker.actor._supportCacheReference];
				}
				aCache.damageInflicted = 0;
				aCache.side = this._side;
				
					
				
				var defenders = [this._defender];
				if(this._attacker.action.attack && this._attacker.action.attack.isAll){
					if(this._side == "actor"){ 
						if(this._attacker.actor.isSubTwin && params.enemyTwin){
							defenders.push(enemyInfo);
						} else if(params.enemy && enemyTwinInfo){
							defenders.push(enemyTwinInfo);
						}				
					}
					if(this._side == "enemy"){				
						if(this._attacker.actor.isSubTwin && params.actorTwin){
							defenders.push(actorInfo);
						} else if(params.actor && actorTwinInfo){
							defenders.push(actorTwinInfo);
						}
					}
				}
				
				for(var i = 0; i < defenders.length; i++){	
					var attackedRef = "";
					if(i == 1){
						attackedRef = "_all_sub";
					}
					var dCache = $gameTemp.battleEffectCache[defenders[i].actor._cacheReference];
					
					var activeDefender = this._defender;
					if(this._supportDefender) {
						var sCache = $gameTemp.battleEffectCache[this._supportDefender.actor._supportCacheReference];
						if(!sCache.hasActed){
							activeDefender = this._supportDefender;
							dCache = sCache;
							dCache.defended = defenders[i].actor;
						}
					}	
					
					dCache.damageTaken = 0;
					if(!aCache.isDestroyed && !dCache.isDestroyed){		
						aCache.actionOrder = orderIdx;
						aCache["attacked"+attackedRef] = dCache;
						aCache.originalTarget = dCache;
						aCache.hasActed = true;
						dCache.hasActed = true;
						
						if(this._side == "actor"){
							dCache.side = "enemy";
						} else {
							dCache.side = "actor";
						}
						
						var isHit = this._attacker.params.hits;
						if(isHit){
							aCache["hits"+attackedRef] = isHit;
							aCache.inflictedCritical = this._attacker.params.isCrit;
							dCache.isHit = isHit;
							dCache.tookCritical = this._attacker.params.isCrit;
							
							var mechStats = $statCalc.getCalculatedMechStats(activeDefender.actor);
							var startHP = 100;
							if(activeDefender.params.startHP){
								startHP = activeDefender.params.startHP;
							} else if(activeDefender.params.referenceEventId){
								var unitInfo = $gameSystem.EventToUnit(activeDefender.params.referenceEventId);
								if(unitInfo){
									var stats = $statCalc.getCalculatedMechStats(unitInfo[1]);
									startHP = Math.floor(stats.currentHP / stats.maxHP) * 100;
								}								
							}
							var damagePercent = startHP - this._attacker.params.targetEndHP;
							if(this._attacker.params.damageInflicted){
								damagePercent = this._attacker.params.damageInflicted;
							}
							var damage = Math.floor(mechStats.maxHP * (damagePercent / 100));
							aCache["damageInflicted"+attackedRef] = damage;
							aCache.statusEffects = {};
							dCache.damageTaken+= damage;
							if(this._attacker.params.targetEndHP <= 0){
								dCache.isDestroyed = true;
								dCache.destroyer = aCache.ref;
							}
						} 
					}
				}
			}
			
			var currentTargetingSettings = {
				attacker: defender,
				attackerTwin: defenderTwin,
				defender: attacker,
				defenderTwin: attackerTwin
			};
			
			if(params.actor){
				var target;
				if(params.actor.target == "twin" && params.enemyTwin){
					target = "twin";
				} else {
					target = "main";
				}
				if(params.enemyFirst){
					if(target == "twin"){
						currentTargetingSettings.defender = attackerTwin;
					} else {
						currentTargetingSettings.defender = attacker;
					}			
				} else {
					if(target == "twin"){
						currentTargetingSettings.attacker = defenderTwin;
					} else {
						currentTargetingSettings.attacker = defender;
					}
				}
			} 
			
			if(params.actorTwin){
				var target;
				if(params.actorTwin.target == "twin" && params.enemyTwin){
					target = "twin";
				} else {
					target = "main";
				}
				if(params.enemyFirst){
					if(target == "twin"){
						currentTargetingSettings.defenderTwin = attackerTwin;
					} else {
						currentTargetingSettings.defenderTwin = attacker;
					}			
				} else {
					if(target == "twin"){
						currentTargetingSettings.attackerTwin = defenderTwin;
					} else {
						currentTargetingSettings.attackerTwin = defender;
					}
				}
			}
			
			if(params.enemy){
				var target;
				if(params.enemy.target == "twin" && params.actorTwin){
					target = "twin";
				} else {
					target = "main";
				}
				if(params.enemyFirst){
					if(target == "twin"){
						currentTargetingSettings.attacker = defenderTwin;
					} else {
						currentTargetingSettings.attacker = defender;
					}		
				} else {			
					if(target == "twin"){
						currentTargetingSettings.defender = attackerTwin;
					} else {
						currentTargetingSettings.defender = attacker;
					}
				}
			} 
			
			if(params.enemyTwin){
				var target;
				if(params.enemyTwin.target == "twin" && params.actorTwin){
					target = "twin";
				} else {
					target = "main";
				}
				if(params.enemyFirst){
					if(target == "twin"){
						currentTargetingSettings.attackerTwin = defenderTwin;
					} else {
						currentTargetingSettings.attackerTwin = defender;
					}		
				} else {			
					if(target == "twin"){
						currentTargetingSettings.defenderTwin = attackerTwin;
					} else {
						currentTargetingSettings.defenderTwin = attacker;
					}	
				}
			}
			
			
			
			var actions = [];
			if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
				actions.push(new BattleAction(supportAttacker, currentTargetingSettings.attacker, supportDefender, attackerSide, true));								
			}	
			if(attackerTwin){
				actions.push(new BattleAction(attackerTwin, currentTargetingSettings.attackerTwin, supportDefender, attackerSide));	
			}
			actions.push(new BattleAction(attacker, currentTargetingSettings.attacker, supportDefender, attackerSide));	
			
			if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
				actions.push(new BattleAction(supportAttacker, currentTargetingSettings.attacker, supportDefender, attackerSide, true));								
			}	
			
			if(defenderTwin){
				actions.push(new BattleAction(defenderTwin, currentTargetingSettings.defenderTwin, supportDefender, defenderSide));	
			}
			actions.push(new BattleAction(defender, currentTargetingSettings.defender, null, defenderSide));			
			
			
			for(var i = 0; i < actions.length; i++){
				actions[i].execute(i);
			}
			if(params.eventId != null){
				$gameTemp.scriptedBattleDemoId = params.eventId;
			}
			
			$gameSystem.setSubBattlePhase('halt');
			//SceneManager.stop();	
			$battleSceneManager.playBattleScene();
			if(params.songId){
				$songManager.playSong(params.songId);
			}	
		}

		// 指定したイベントのターゲットＩＤを設定する（戦闘モードが'aimingEvent'または'aimingActor'でのみ機能する）
		Game_Interpreter.prototype.setTargetId = function(eventId, targetId) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				battlerArray[1].setTargetId(targetId);
			}
			return true;
		};

		// 指定したイベントが戦闘不能か指定したスイッチに返す
		Game_Interpreter.prototype.isUnitDead = function(switchId, eventId) {
			$gameSwitches.setValue(switchId, false);
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				$gameSwitches.setValue(switchId, battlerArray[1].isDead());
			}
			return true;
		};

		// 指定した座標のイベントＩＤを取得する
		Game_Interpreter.prototype.isEventIdXy = function(variableId, x, y) {
			$gameVariables.setValue(variableId, 0);
			$gameMap.eventsXy(x, y).forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
					$gameVariables.setValue(variableId, event.eventId());
				}
			});
			return true;
		};

		// 指定したイベントＩＤのユニットを全回復する
		Game_Interpreter.prototype.unitRecoverAll = function(eventId) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				if (battlerArray[1].isAlive()) {
					battlerArray[1].recoverAll();
				}
			}
			return true;
		};

		// 指定したイベントＩＤのユニットを復活する
		Game_Interpreter.prototype.unitRevive = function(eventId) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			var event = $gameMap.event(eventId);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				if (battlerArray[1].isAlive()) {
					return;
				}
				battlerArray[1].removeState(battlerArray[1].deathStateId());
				var oldValue = $gameVariables.value(_existEnemyVarID);
				$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
				var xy = event.makeAppearPoint(event, event.posX(), event.posY())
				event.setPosition(xy[0], xy[1]);
				event.appear();
				$gameMap.setEventImages();
			}
		};

		// 指定したイベントＩＤのユニットを指定したステートにする
		Game_Interpreter.prototype.unitAddState = function(eventId, stateId) {
			var battlerArray = $gameSystem.EventToUnit(eventId);
			var event = $gameMap.event(eventId);
			if (battlerArray && event && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				var alreadyDead = battlerArray[1].isDead();
				battlerArray[1].addState(stateId);
				if (battlerArray[1].isDead() && !alreadyDead) {
					if (!event.isErased()) {
						event.erase();
						if (battlerArray[0] === 'actor') {
							var oldValue = $gameVariables.value(_existActorVarID);
							$gameVariables.setValue(_existActorVarID, oldValue - 1);
							
							var oldValue = $gameVariables.value(_actorsDestroyed);
							$gameVariables.setValue(_actorsDestroyed, oldValue + 1);
				
						} else if (battlerArray[0] === 'enemy') {
							var oldValue = $gameVariables.value(_existEnemyVarID);
							$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
							
							var oldValue = $gameVariables.value(_enemiesDestroyed);
							$gameVariables.setValue(_enemiesDestroyed, oldValue + 1);
						}
					}
				}
				battlerArray[1].clearResult();
			}
			return true;
		};

		// ターン終了を行う（メニューの「ターン終了」と同じ）
			Game_Interpreter.prototype.turnEnd = function() {
				$gameTemp.setTurnEndFlag(true);
				return true;
			};

		// プレイヤーの操作を受け付けるかの判定（操作できるサブフェーズか？）
			Game_Interpreter.prototype.isSubPhaseNormal = function(id) {
				if ($gameSystem.isBattlePhase() === 'actor_phase' && $gameSystem.isSubBattlePhase() === 'normal') {
					$gameSwitches.setValue(id, true);
				} else {
					$gameSwitches.setValue(id, false);
				}
				return true;
			};
			
			
			Game_Interpreter.prototype.runSubEvent = function(id) {
				$gameMap.events().forEach(function(event) {
					if (event.event().meta.function == id) {
						if (event.pageIndex() >= 0){
							$gameMap._interpreter.setupChild(event.list(), 0);
						}				
					}
				});
			};
			
			Game_Interpreter.prototype.getEventWill = function(eventId) {
				var actor = $gameSystem.EventToUnit(eventId)[1];
				var result = 0;
				if(actor){
					result = $statCalc.getCurrentWill(actor);
				}
				return result;
			};
			
			Game_Interpreter.prototype.getActorWill = function(actorId) {
				var actor = $gameActors.actor(actorId);
				var result = 0;
				if(actor){
					result = $statCalc.getCurrentWill(actor);
				}
				return result;
			};
			
			// Set Movement Route
			Game_Interpreter.prototype.command205 = function() {
				$gameMap.refreshIfNeeded();
				this._character = this.character(this._params[0]);
				if(/actor\:.*/.exec(this._params[0])){
					this._character = null;
					var actorId = this._params[0].replace("actor:", "");
					var actor = $gameActors.actor(actorId);
					if(actor){
						var event = $statCalc.getReferenceEvent(actor);
						if(event){
							this._character = this.character(event.eventId());
						}
					}					
				}
				if (this._character) {
					this._character.forceMoveRoute(this._params[1]);
					if (this._params[1].wait) {
						this.setWaitMode('route');
					}
				}
				if(this._params[0] == -1){//cursor
					$gameTemp.movingCursorByScript = true;
				}
				
				
				return true;
			};
			
			Game_Interpreter.prototype.runTextScript = async function(scriptId) {
				this.setWaitMode("text_script_loading");
				this._isLoadingTextScript = true;
				let eventList = await DataManager.interpretTextScript(scriptId);
				$gameMap._interpreter.setupChild(eventList, 0);	
				this._isLoadingTextScript = false;
			}		
			
		Game_Interpreter.prototype.reloadRelativeUnits = function(params) {
			$statCalc.applyRelativeTransforms();
		}
	}