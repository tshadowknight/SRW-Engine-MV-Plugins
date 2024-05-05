	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		
	//====================================================================
	// ●Game_System
	//====================================================================
		var _SRPG_Game_System_initialize = Game_System.prototype.initialize;
		Game_System.prototype.initialize = function() {
			_SRPG_Game_System_initialize.call(this);
			this._SRPGMode = false;
			this._isBattlePhase = 'initialize';
			this._isSubBattlePhase = 'initialize';
			this._AutoUnitId = 0;
			this._EventToUnit = [];
			this._SrpgStatusWindowRefreshFlag = [false, null];
			this._SrpgBattleWindowRefreshFlag = [false, null, null];
			this._SrpgWaitMoving = false;
			this._SrpgActorCommandWindowRefreshFlag = [false, null];
			this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
			this._srpgAllActors = []; //SRPGモードに参加する全てのアクターの配列
			this._searchedItemList = [];
			this._pilotFallbackInfo = {};
			this.initOptions();
			
			this._controlSet = "mkb";
		};
		
		Game_System.prototype.initOptions = function() {
			if(this.optionDisableGrid == null){
				this.optionDisableGrid = false;
			}
			if(this.showWillIndicator == null){
				this.showWillIndicator = false;
			}
			if(this.optionDefaultSupport == null){
				this.optionDefaultSupport = true;
			}
			if(this.optionSkipUnitMoving == null){
				this.optionSkipUnitMoving = false;
			}
			if(this.optionBattleBGM == null){
				this.optionBattleBGM = true;
			}
			if(this.optionAfterBattleBGM == null){
				this.optionAfterBattleBGM = true;
			}
			if(this.optionInfiniteFunds == null){
				this.optionInfiniteFunds = false;
			}
			if(this.optionInfinitePP == null){
				this.optionInfinitePP = false;
			}
			if(this.optionPadSet == null){
				this.optionPadSet = "xbox";
			}
			if(this.optionPadSet == null){
				this.optionPadSet = "xbox";
			}
			if(this.optionMapHints == null){
				this.optionMapHints = true;
			}
		};
		
		Game_System.prototype.getOptionMapHints = function() {
			if(this.optionMapHints == null){
				this.optionMapHints = true;
			}
			return this.optionMapHints;
		}
		
		Game_System.prototype.setOptionMapHints = function(value) {			
			this.optionMapHints = value;		
		}
		
		Game_System.prototype.getControllerIconSets = function() {
			return ["xbox", "ds", "nin"];
		}
		
		Game_System.prototype.getOptionPadSet = function() {
			return this.optionPadSet || "xbox";
		}
		
		Game_System.prototype.setControlSet = function(newSet) {
			if(this._controlSet != newSet){
				if($gameTemp.buttonHintManager){
					$gameTemp.buttonHintManager.redraw();
				}
			}
			this._controlSet = newSet;		
		}
		
		Game_System.prototype.getActiveGlyphSet = function() {
			if(this._controlSet == "mkb"){
				return this._controlSet;
			}
			if(this._controlSet == "controller"){
				return this.optionPadSet || "xbox";
			}
			return "mkb";
		}
		
		Game_System.prototype.getActionGlyphs = function(action) {
			const activeSet = this.getActiveGlyphSet();
			let glyphs;
			if(activeSet == "mkb"){
				glyphs = Input.getActionGlyphs(action);
			} else {
				glyphs = Input.getPadGlyphs(action);
			}
			return Input.getGlyphDefinition(activeSet, glyphs);
		}

	//変数関係の処理
		//戦闘中かどうかのフラグを返す
		Game_System.prototype.isSRPGMode = function() {
			return this._SRPGMode;
		};
		Game_System.prototype.setTerrainMoveCosts = function(air, land, water, space) {
			this.terrainMoveCosts = {
				air: air || 0,
				land: land || 0,
				water: water || 0,
				space: space || 0,
			};
		}
		Game_System.prototype.getTerrainMoveCosts = function() {
			if(!this.terrainMoveCosts){
				this.terrainMoveCosts = {
					air: 0,
					land: 0,
					water: 0,
					space: 0,
				};
			}
			return this.terrainMoveCosts;
		}
		
		//戦闘のフェーズを返す
		// initialize：初期化状態
		// actor_phase：アクター行動フェーズ
		// auto_actor_phase：アクター自動行動フェーズ
		// enemy_phase：エネミー行動フェーズ
		Game_System.prototype.isBattlePhase = function() {
			return this._isBattlePhase;
		};

		//戦闘のフェーズを変更する
		Game_System.prototype.setBattlePhase = function(phase) {
			this._isBattlePhase = phase;
		};

		//戦闘のサブフェーズを返す。各BattlePhase内で使用され、処理の進行を制御する。
		// initialize：初期化を行う状態
		// normal：行動アクターが選択されていない状態
		// actor_move：移動範囲が表示され、移動先を選択している状態
		// actor_target：行動対象を選択している状態
		// status_window：ステータスウィンドウが開かれている状態
		// actor_command_window：アクターコマンドウィンドウが開かれている状態
		// battle_window：攻撃確認ウィンドウが開かれている状態
		// auto_actor_command：自動行動アクターをイベント順に行動決定する状態
		// auto_actor_move : 自動行動アクターが移動先を決定し、移動する状態
		// auto_actor_action：自動行動アクターの実際の行動を行う状態
		// enemy_command：エネミーをイベント順に行動決定する状態
		// enemy_move : エネミーが移動先を決定し、移動する状態
		// enemy_action：エネミーの実際の行動を行う状態
		// invoke_action：戦闘を実行している状態
		// after_battle：戦闘終了後の処理を呼び出す状態
		Game_System.prototype.isSubBattlePhase = function() {
			return this._isSubBattlePhase;
		};

		//戦闘のサブフェーズを変更する
		Game_System.prototype.setSubBattlePhase = function(phase) {
			$SRWGameState.requestNewState(phase);
			this._isSubBattlePhase = phase;
		};
		
		Game_System.prototype.getActiveUnit = function() {
			return this.EventToUnit($gameTemp.activeEvent().eventId())[1]
		};

		//自動行動・エネミーの実行ＩＤを返す
		Game_System.prototype.isAutoUnitId = function() {
			return this._AutoUnitId;
		};

		//自動行動・エネミーの実行ＩＤを設定する
		Game_System.prototype.setAutoUnitId = function(num) {
			this._AutoUnitId = num;
		};

		// ステータスウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgStatusWindowNeedRefresh = function() {
			return this._SrpgStatusWindowRefreshFlag;
		};

		// ステータスウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgStatusWindowNeedRefresh = function(battlerArray) {
			this._SrpgStatusWindowRefreshFlag = [true, battlerArray];
		};

		// ステータスウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgStatusWindowNeedRefresh = function() {
			this._SrpgStatusWindowRefreshFlag = [false, null];
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgBattleWindowNeedRefresh = function() {
			return this._SrpgBattleWindowRefreshFlag;
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgBattleWindowNeedRefresh = function(actionBattlerArray, targetBattlerArray) {
			this._SrpgBattleWindowRefreshFlag = [true, actionBattlerArray, targetBattlerArray];
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgBattleWindowNeedRefresh = function() {
			this._SrpgBattleWindowRefreshFlag = [false, null, null];
		};

		//移動範囲を表示するスプライトの最大数
		Game_System.prototype.spriteMoveTileMax = function() {
			return Math.min($dataMap.width * $dataMap.height, 1000);
		};

		// 移動中のウェイトフラグを返す
		Game_System.prototype.srpgWaitMoving = function() {
			return this._SrpgWaitMoving;
		};

		// 移動中のウェイトフラグを設定する
		Game_System.prototype.setSrpgWaitMoving = function(flag) {
			this._SrpgWaitMoving = flag;
		};

		// アクターコマンドウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgActorCommandWindowNeedRefresh = function() {
			return this._SrpgActorCommandWindowRefreshFlag;
		};

		// アクターコマンドウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgActorCommandWindowNeedRefresh = function(battlerArray) {
			this._SrpgActorCommandWindowRefreshFlag = [true, battlerArray];
		};

		// アクターコマンドウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgActorCommandWindowNeedRefresh = function() {
			this._SrpgActorCommandWindowRefreshFlag = [false, null];
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgActorCommandStatusWindowNeedRefresh = function() {
			return this._SrpgActorCommandStatusWindowRefreshFlag;
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgActorCommandStatusWindowNeedRefresh = function(battlerArray) {
			this._SrpgActorCommandStatusWindowRefreshFlag = [true, battlerArray];
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgActorCommandStatusWindowNeedRefresh = function() {
			this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
		};

		//戦闘に参加するアクターのリスト
		Game_System.prototype.srpgAllActors = function() {
			return this._srpgAllActors;
		};

		Game_System.prototype.clearSrpgAllActors = function() {
			this._srpgAllActors = [];
		};

		Game_System.prototype.pushSrpgAllActors = function(actor) {
			this._srpgAllActors.push(actor);
		};

		// 探査済み座標のリスト
		Game_System.prototype.pushSearchedItemList = function(xy) {
			if (!this._searchedItemList) {
				this._searchedItemList = [];
			}
			this._searchedItemList.push(xy);
		};

		Game_System.prototype.indexOfSearchedItemList = function(xy) {
			if (!this._searchedItemList) {
				this._searchedItemList = [];
			}
			var flag = -1;
			for (var i=0; i < this._searchedItemList.length; i++) {
				var xy2 = this._searchedItemList[i];
				if (xy[0] === xy2[0] && xy[1] === xy2[1]) {
					flag = i;
					break;
				}
			};
			return flag;
		};

		Game_System.prototype.resetSearchedItemList = function() {
			this._searchedItemList = [];
		};

		Game_System.prototype.updateAvailableUnits = function(ignoreEventDeploys, preservePilotTypes, noReload){
			const _this = this;
			this._availableMechs = [];//available mechs must be cleared to avoid conflicts with previously serialized entries in the listing
			this._availableUnits = $gameParty.allMembers();
			$statCalc.invalidateAbilityCache();
			
			//ensure pilots are reset to their default class assignments before constructing the deploy list
			var eventCtr = 0;
			
			function updateUnit(actor){
				//revert any class changes made during the stage by a deploy action
				var refEvent = $statCalc.getReferenceEvent(actor);
				if(!ignoreEventDeploys || !refEvent || !refEvent.isScriptedDeploy){
					//if(actor._intermissionClassId){
					//	actor._classId = actor._intermissionClassId;
						//actor.isSubPilot = false;
					//	delete actor._intermissionClassId;
					//}
					if(_this._pilotFallbackInfo && _this._pilotFallbackInfo[actor.actorId()]){
						let info = _this._pilotFallbackInfo[actor.actorId()];
						actor._classId = info.classId;
						actor.isSubPilot = info.isSubPilot;
					}
					
					var targetMech = $statCalc.getMechData($dataClasses[actor._classId], true);					
					if(_this._mechFallbackInfo && _this._mechFallbackInfo[actor._classId]){
						let info = _this._mechFallbackInfo[actor._classId];
						targetMech.subPilots = info.subPilots;
						$statCalc.storeMechData(targetMech);
					}
					
					/*if(!preservePilotTypes){
						actor.isSubPilot = false;
					}*/
					
					$statCalc.attachDummyEvent(actor, eventCtr++);
					$statCalc.invalidateAbilityCache(actor);
					$statCalc.initSRWStats(actor);	
				}
				$statCalc.applyBattleStartWill(actor);
			}
			
			this._availableUnits.forEach(function(actor){		
				actor.event = null									
			});
			
			if(!noReload){
				//main twin must be initialized first to ensure a reference event is available for their sub twin
				this._availableUnits.forEach(function(actor){
					if(!actor.isSubTwin){
						updateUnit(actor);
					}					
				});
				
				this._availableUnits.forEach(function(actor){
					if(actor.isSubTwin){
						updateUnit(actor);
					}					
				});
			}
			
			
			var deployList = this.getDeployList();
			var isSubTwin = {};
			var subTwinLookup = {};
			if(deployList){
				deployList.forEach(function(entry){
					if(entry.sub != null && entry.main != null){
						isSubTwin[entry.sub] = true;
						subTwinLookup[entry.main] = entry.sub;
					}
				});
			}
			
			
			this.dummyId = 0;
			this._availableUnits.forEach(function(actor){
				var refEvent = $statCalc.getReferenceEvent(actor);
				if(!ignoreEventDeploys || !refEvent || !refEvent.isScriptedDeploy){
					/*if(!preservePilotTypes){
						actor.isSubPilot = false;
					}*/
					if(isSubTwin[actor.actorId()]){
						actor.isSubTwin = true;
						actor.subTwin = null;
						actor.subTwinId = null;
					} else {
						actor.isSubTwin = false;
						if(subTwinLookup[actor.actorId()] != null && subTwinLookup[actor.actorId()] != 0){
							actor.subTwinId = subTwinLookup[actor.actorId()];
						} else {
							actor.subTwin = null;
							actor.subTwinId = null;
						}
					}
					
					$statCalc.attachDummyEvent(actor, actor.SRWStats.mech.id);
					$statCalc.invalidateAbilityCache(actor);
					$statCalc.initSRWStats(actor);		
				}
			});
			
			var tmp = Object.keys($SRWSaveManager.getUnlockedUnits());			
			for(var i = 0; i < tmp.length; i++){
				let mechId = tmp[i];
				var currentPilot = $statCalc.getCurrentPilot(mechId);
				if(!currentPilot){
					//wholesale replace evolved units with their targets for availability
					if($SRWSaveManager.isEvolvedMech(mechId)){
						mechId = $SRWSaveManager.getEvolutionTarget(mechId);
					}
					var mechData = $statCalc.getMechData($dataClasses[mechId], true);			
					
					var result = $statCalc.createEmptyActor();				
					result.SRWStats.mech = mechData;		
					$statCalc.attachDummyEvent(result, mechData.id);
																	
					this._availableMechs.push(result);
					$statCalc.invalidateAbilityCache(result);	
					$statCalc.calculateSRWMechStats(mechData, false, result);		
				}
			}	
			
			//_this._pilotFallbackInfo = {};
			//_this._mechFallbackInfo = {};
		}
		
		Game_System.prototype.startIntermission = function(){
			this._isIntermission = true;
			//$statCalc.reloadSRWActors();
			this.updateAvailableUnits();
			$gameTemp.summaryUnit = null;
			$statCalc.invalidateAbilityCache();
			$gameTemp.deployMode = "";			
		}
		
		Game_System.prototype.isIntermission = function(id){
			return this._isIntermission;
		}
		
		Game_System.prototype.getAvailableUnits = function(id){
			return this._availableUnits;
		}
		
		//use $gameActors.actor instead!
		Game_System.prototype.getActorById = function(id){
			var result;
			var ctr = 0; 
			while(!result && ctr < this._availableUnits.length){
				if(this._availableUnits[ctr].actorId() == id){
					result = this._availableUnits[ctr];
				}
				ctr++;
			}
			return result;
		}
		
		Game_System.prototype.endIntermission = function(){
			$gameTemp.intermissionPending = false;
			this._isIntermission = false;
		}	
		
		Game_System.prototype.startSRPG = function() {
			this._SRPGMode = true;
			this.enableGrid = true;
			
			this.resetAbilitZones();
				
			$gameTemp.listContext = "actor";
			$gameSwitches.setValue(_srpgBattleSwitchID, true);
			this._isBattlePhase = 'start_srpg';
			this._isSubBattlePhase = 'start_srpg';
			$gamePlayer.refresh();
			$gameTemp.clearActiveEvent();
			$gameTemp.actorAction = {};
			$gameTemp.enemyAction = {};
			this.clearData(); 
			this.setAllEventType(); 
			this._availableUnits = [];
			this.setSrpgActors(); 
			this.setSrpgEnemys(); 
			
			$gameMap.setEventImages();  
			this.runBattleStartEvent(); 
			this.runAfterDeployEvent();
			//clear stage temp variables
			for(var i = 21; i <= 60; i++){
				$gameVariables.setValue(i, 0);
			}
		
			$gameVariables.setValue(_turnVarID, 1); 
			$gameSystem.resetSearchedItemList();
			$gameSystem.textLog = [];			
			$gameSystem._specialTheme = -1;
			$gameSystem.highlightedTiles = [];
			$gameSystem.regionHighlights = {};
			$gameSystem.enemyUpgradeLevel = 0;
			$gameSystem.persuadeOptions = {};
			$gameTemp.currentSwapSource = -1;
			$gameTemp.enemyAppearQueue = [];
			$gameTemp.eventToDeploySlot = null;
			$gameSystem.defaultBattleEnv = null;
			$gameSystem.skyBattleEnv = null;
			$gameSystem.superStateBattleEnv = {};
			$gameSystem.regionBattleEnv = {};
			$gameSystem.regionSkyBattleEnv = {};
			$gameSystem.regionSuperStateBattleEnv = {};
			$gameSystem.stageTextId = null;
			
			if($gameSystem.foregroundSpriteToggleState == null){
				$gameSystem.foregroundSpriteToggleState = 0;
			}
			//$gameSystem.showWillIndicator = false;
			$gameTemp.disappearQueue = [];

			$gameSystem.actorRankLookup = $statCalc.getActorRankLookup();
			$gameTemp.AIWaitTimer = 0;
			
			$gameVariables.setValue(_masteryConditionText, APPSTRINGS.GENERAL.label_default_mastery_condition);	
			$gameVariables.setValue(_victoryConditionText, APPSTRINGS.GENERAL.label_default_victory_condition);	
			$gameVariables.setValue(_defeatConditionText, APPSTRINGS.GENERAL.label_default_defeat_condition);
			
			$gameSystem.factionConfig = {
				0: {
					attacksPlayers:true,
					attacksFactions: [1,2],
					active: true
				},
				1: {
					attacksPlayers:false,
					attacksFactions: [0],
					active: false
				},
				2: {
					attacksPlayers:false,
					attacksFactions: [0],
					active: false
				}
			};
			$gameTemp.preventedDeathQuotes = {};
			$gameTemp.updatePlayerSpriteVisibility();
			
			SceneManager._scene.createPauseWindow(); //ensure pause menu is updated to reflect the new mode
			
			this.untargetableAllies = {};
			
			if($gameMap){
				$gameMap.clearRegionTiles();
				$gameMap._SRWTileProperties = null;
				$gameMap.initSRWTileProperties();
			}			
		};		
		
		Game_System.prototype.enableFaction = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].active = true;
			}		
		}
		
		Game_System.prototype.disableFaction = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].active = false;
			}		
		}
		
		Game_System.prototype.setFactionAggro = function(id, aggro) {
			if(this.factionConfig[id]){
				this.factionConfig[id].attacksFactions = [];
				for(var i = 0; i < aggro.length; i++){
					if(aggro[i] == "player"){
						this.factionConfig[id].attacksPlayers = true;
					} else {
						this.factionConfig[id].attacksFactions.push(aggro[i]);
					}
				}		
			}
		}		
		
		Game_System.prototype.clearFactionAggro = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].attacksFactions = [];
			}
		}
		
		Game_System.prototype.getPlayerFactionInfo = function() {
			 var aggressiveFactions = [];
			 if(this.factionConfig[0].attacksPlayers){
				 aggressiveFactions.push(0);
			 }
			 if(this.factionConfig[1].attacksPlayers){
				 aggressiveFactions.push(1);
			 }
			 if(this.factionConfig[2].attacksPlayers){
				 aggressiveFactions.push(2);
			 }
			 return {
				attacksPlayers:false,
				attacksFactions: aggressiveFactions,
				active: true,
				ownFaction: "player"
			 };
		}
		
		Game_System.prototype.getFactionId = function(actor) {
			if(actor.isActor()){
				return "player";
			} else {
				return actor.factionId;
			}		
		}
		
		Game_System.prototype.getEnemyFactionInfo = function(enemy) {
			 let result = this.factionConfig[enemy.factionId] || {};
			 result.ownFaction = enemy.factionId;
			 return result;
		}
		
		Game_System.prototype.areUnitsFriendly = function(actor, other) {
			return this.isFriendly(actor, this.getFactionId(other))
		}
		
		Game_System.prototype.isFriendly = function(actor, factionId) {
			var factionInfo = this.getUnitFactionInfo(actor);
			if(factionId == "player"){
				return !factionInfo.attacksPlayers;
			} else {
				return factionInfo.attacksFactions.indexOf(factionId) == -1;
			}
		}	
		
		Game_System.prototype.getUnitFactionInfo = function(actor) {
			if(actor.isActor()){
				return this.getPlayerFactionInfo();
			} else {
				return this.getEnemyFactionInfo(actor);
			}
		}
		
		Game_System.prototype.isEnemy = function(actor) {
			if(!actor.isActor){
				return true;
			}
			if(actor.isActor()){
				return false;
			} else {
				return this.getEnemyFactionInfo(actor).attacksPlayers;
			}
		}
		
		Game_System.prototype.isEnemyPhase = function(actor) {
			return $gameSystem.factionConfig[$gameTemp.currentFaction].attacksPlayers;
		}

		//イベントＩＤに対応するアクター・エネミーデータを初期化する
		Game_System.prototype.clearData = function() {
			this._EventToUnit = [];
			$gameSystem.clearSrpgAllActors();
		};

		//イベントＩＤに対応するアクター・エネミーデータをセットする
		Game_System.prototype.setEventToUnit = function(event_id, type, data) {
			this._EventToUnit[event_id] = [type, data];
		};
		
		Game_System.prototype.clearEventToUnit = function(event_id) {
			delete this._EventToUnit[event_id];
		}

		//イベントＩＤから対応するアクター・エネミーデータを返す
		Game_System.prototype.EventToUnit = function(event_id) {
			//return this._EventToUnit[event_id];
			var battlerArray = this._EventToUnit[event_id];
			if (battlerArray) {
				if (battlerArray[0] === 'actor') {
					var actor = $gameActors.actor(battlerArray[1]);
					return [battlerArray[0], actor]
				} else {
					return battlerArray;
				}
			} else {
				return;
			}
		};

		//アクターＩＤから対応するイベントＩＤを返す
		Game_System.prototype.ActorToEvent = function(actor_id) {
			var eventId = 0;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
					var unit =  $gameSystem.EventToUnit(event.eventId());
					if(unit){
						var actor = unit[1];
						if (actor && actor.actorId() == actor_id) {
							eventId = event.eventId();
						}
					}              
				}
			});
			return eventId;
		};
		

		// イベントのメモからイベントのタイプを設定する
		Game_System.prototype.setAllEventType = function() {
			$gameMap.events().forEach(function(event) {
				if (event.event().meta.type) {
					event.setType(event.event().meta.type);
				}
			});
		}
		
		Game_System.prototype.getActorsWithAction = function(){
			var _this = this;		
			var result = [];
			$gameMap.events().forEach(function(event) {
				var battlerArray = _this.EventToUnit(event.eventId());
				if(!event.isErased() && battlerArray){
					var actor = battlerArray[1];
					if(actor.isActor() && !actor.srpgTurnEnd() && !$statCalc.isAI(actor)){
						result.push(actor);
					}
				}
			});
			return result;
		}

		// イベントのメモからアクターを読み込み、対応するイベントＩＤに紐づけする
		Game_System.prototype.setSrpgActors = function() {
			const _this = this;
			$gameVariables.setValue(_existActorVarID, 0);
			$gameVariables.setValue(_actorsDestroyed, 0);
			$gameVariables.setValue(_existShipVarId, 0);	
			
			this._availableUnits = $gameParty.allMembers();
			this._availableUnits.forEach(function(actor){
				$statCalc.initSRWStats(actor);
				actor.event = null;
				actor.reversalInfo = {};
			});
			
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
					event.erase();
				}
			});
		};
		
		Game_System.prototype.registerPilotFallbackInfo = function(actor) {
			const _this = this;
			if(_this._pilotFallbackInfo[actor.actorId()] == null){
				_this._pilotFallbackInfo[actor.actorId()] = {
					classId: actor._classId,
					isSubPilot: actor.isSubPilot
				};
			}
		}
		
		Game_System.prototype.overwritePilotFallbackInfo = function(actor) {
			const _this = this;
			if(!_this._pilotFallbackInfo){
				_this._pilotFallbackInfo = {};
			}
			_this._pilotFallbackInfo[actor.actorId()] = {
				classId: actor._classId,
				isSubPilot: actor.isSubPilot
			};
		}
		
		Game_System.prototype.registerMechFallbackInfo = function(mechId, subPilots) {
			const _this = this;
			if(!_this._mechFallbackInfo){
				_this._mechFallbackInfo = {};
			}
			if(_this._mechFallbackInfo[mechId] == null){
				_this._mechFallbackInfo[mechId] = {
					subPilots: subPilots
				};
			}
		}	

		Game_System.prototype.overwriteMechFallbackInfo = function(mechId, subPilots) {
			const _this = this;
			if(!_this._mechFallbackInfo){
				_this._mechFallbackInfo = {};
			}
			
			_this._mechFallbackInfo[mechId] = {
				subPilots: subPilots
			};			
		}			
		
		Game_System.prototype.getPilotFallbackInfo = function(actor) {
			const _this = this;
			if(!_this._pilotFallbackInfo){
				_this._pilotFallbackInfo = {};
			}
			if(_this._pilotFallbackInfo[actor.actorId()]){
				return _this._pilotFallbackInfo[actor.actorId()];
			} else {
				return {
					classId: actor._classId,
					isSubPilot: actor.isSubPilot
				}
			}
		}
		
		Game_System.prototype.getMechFallbackInfo = function(mechId) {
			const _this = this;
			if(!_this._mechFallbackInfo){
				_this._mechFallbackInfo = {};
			}
			if(_this._mechFallbackInfo[mechId]){
				return _this._mechFallbackInfo[mechId];
			} else {
				return {
					subPilots: $statCalc.getMechData($dataClasses[mechId], true).subPilots
				}
			}
		}

		Game_System.prototype.deployShips = function(toAnimQueue) {		
			var _this = this;
			var deployInfo = _this.getDeployInfo();
			var deployList = _this.getActiveShipDeployList();			
			
			var shipCtr = 0;		
			$gameMap.events().forEach(function(event) { //ensure to spawn ships first so that are drawn below the other actor sprites
				if (event.isType() === 'ship' && !event.isDeployed) {
					var actor_unit;
					var entry = deployList[shipCtr] || {};
					var actorId = entry.main;					
					if(typeof actorId != "undefined"){
						actor_unit = $gameActors.actor(actorId);
					}
					if (actor_unit) {
						_this.deployActor(actor_unit, event, toAnimQueue);
					} else {
						event.erase();
					}
					shipCtr++;
				}
				
			});
		}
		
		Game_System.prototype.deployActor = function(actor_unit, event, toAnimQueue, subId, isScriptedDeploy) {
			var _this = this;
			actor_unit.event = event;
			event._lastModsPosition = null;
			event.isDropBox = false;
			delete event.dropBoxItems;
			_this.pushSrpgAllActors(event.eventId());
			event.isDeployed = true;
			event.isScriptedDeploy = isScriptedDeploy ? true : false;
			var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
			var oldValue = $gameVariables.value(_existActorVarID);
			
			
			actor_unit.isSubPilot = false;
			
			$statCalc.initSRWStats(actor_unit);
			
			var increment = 1;
			if(actor_unit.SRWStats.mech.combinesFrom){
				increment = actor_unit.SRWStats.mech.combinesFrom.length;
			}
			$gameVariables.setValue(_existActorVarID, oldValue + increment);
			_this.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
			
			$statCalc.applyDeployActions(actor_unit.SRWStats.pilot.id, actor_unit.SRWStats.mech.id);
			
			if($statCalc.isShip(actor_unit)){
				var oldValue = $gameVariables.value(_existShipVarId);
				$gameVariables.setValue(_existShipVarId, oldValue + 1);
			}		
			
			actor_unit.SRPGActionTimesSet($statCalc.applyStatModsToValue(actor_unit, 1, ["extra_action"]));
			actor_unit.setSrpgTurnEnd(false);	
			actor_unit.setBattleMode("");

			var position = $statCalc.getAdjacentFreeSpace({x: event.posX(), y: event.posY()}, null, event.eventId());
			event.locate(position.x, position.y);
			
			if(!$gameTemp.enemyAppearQueue){
				$gameTemp.enemyAppearQueue = [];
			}	
			if(toAnimQueue){				
				$gameTemp.enemyAppearQueue.push(event);
				event.erase();
				event.isPendingDeploy = true;
			} else {
				event.appear();
				//event.refreshImage();
				$gameMap.setEventImages();			
			}
		
			
			if(subId != null){
				actor_unit.subTwinId = subId;
			}
			
			$statCalc.invalidateAbilityCache(actor_unit);
			$statCalc.initSRWStats(actor_unit);
			$statCalc.applyBattleStartWill(actor_unit);
			let preferredSuperState = this.getPreferredSuperState(actor_unit);
			if(preferredSuperState){
				$statCalc.setSuperState(actor_unit, preferredSuperState);
			}
			$statCalc.updateSuperState(actor_unit, true);
			//call refresh to clear any lingering states of the actor
			actor_unit.refresh();
			
			let parts = $dataClasses[actor_unit.SRWStats.mech.id].meta.srpgOverworld.split(",");
			ImageManager.loadCharacter(parts[0]);
			
			$statCalc.applyRelativeTransforms();
			
			event.isShip = $statCalc.isShip(actor_unit);
		}
		
		Game_System.prototype.deployItemBox = function(event, items) {
			var _this = this;
			//
			event.isDropBox = true;
			event.setType("");
			event.dropBoxItems = items;			
			event.setImage(ENGINE_SETTINGS.ITEM_BOX_SPRITE.characterName, ENGINE_SETTINGS.ITEM_BOX_SPRITE.characterIndex);
			event.appear();				
		}
		
		Game_System.prototype.finalizeItemBox = function(event){
			if(event.isDropBox){
				this.clearEventToUnit(event.eventId());
				event.visible = true;
				event.appear();	
			}
		}
		
		Game_System.prototype.getEventDeploySlot = function(event) {
			var _this = this;
			if(!$gameTemp.eventToDeploySlot){
				$gameTemp.eventToDeploySlot = {};
				var i = 0;
				var deployInfo = _this.getDeployInfo();
				while(deployInfo.doNotDeploySlots[i]){
					i++;
				}				
				$gameMap.events().forEach(function(event) {
					if(event.isType() === 'actor' && !event.isScriptedDeploy) {
						$gameTemp.eventToDeploySlot[event.eventId()] = i++;
						while(deployInfo.doNotDeploySlots[i]){
							i++;
						}
					}
				});
			}
			return $gameTemp.eventToDeploySlot[event.eventId()];
		}
		
		Game_System.prototype.highlightDeployTiles = function() {
			var _this = this;
			if(!$gameSystem.highlightedTiles){
				$gameSystem.highlightedTiles = [];
			}
			this.removeDeployTileHighlights();
			$gameTemp.currentDeployTileHighlights = [];
			var deployInfo = _this.getDeployInfo();
			var i = 0;
			while(deployInfo.doNotDeploySlots[i]){
				i++;
			}
			var deployList = $gameSystem.getDeployList();	
			
			$gameMap.events().forEach(function(event) {
				if(event.isType() === 'actor' && !event.isScriptedDeploy) {
					if(i == $gameTemp.currentSwapSource){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "#00FF00"});
					} else if(deployInfo.lockedSlots[i]){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "yellow"});
					} else if(deployList[i] && deployList[i].main !=null && !$statCalc.canStandOnTile($gameActors.actor(deployList[i].main), {x: event.posX(), y: event.posY()})){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "red"});
					} else {
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "white"});
					}
					$gameTemp.currentDeployTileHighlights.push({x: event.posX(), y: event.posY()});
					i++;
					while(deployInfo.doNotDeploySlots[i]){
						i++;
					}
				}
			});
			
			$gameSystem.highlightsRefreshed = true;
		}	
		
		Game_System.prototype.removeDeployTileHighlights = function() {
			var _this = this;
			if($gameTemp.currentDeployTileHighlights && $gameSystem.highlightedTiles){
				var tileLookup = {};
				$gameTemp.currentDeployTileHighlights.forEach(function(coords){
					if(!tileLookup[coords.x]){
						tileLookup[coords.x] = {};
					}
					tileLookup[coords.x][coords.y] = true;
				});
							
				var tmp = [];
				for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
					if(!tileLookup[$gameSystem.highlightedTiles[i].x] || !tileLookup[$gameSystem.highlightedTiles[i].x][$gameSystem.highlightedTiles[i].y]){
						tmp.push($gameSystem.highlightedTiles);
					}
				}
				$gameSystem.highlightedTiles = tmp;
				$gameSystem.highlightsRefreshed = true;
			}
		}
		
		Game_System.prototype.undeployActors = function(preserveScripted){
			$gameVariables.setValue(_existActorVarID, 0);
			$gameSystem.clearSrpgAllActors();
			$gameMap.events().forEach(function(event) {			
				if (event.isType() === 'actor' && (!event.isScriptedDeploy || !preserveScripted)) {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
					event.erase();
				}
			});
		}
		
		Game_System.prototype.redeployActors = function(validatePositions, forceRefresh){                                                                                                                                                                                                                             
			$gameVariables.setValue(_existActorVarID, 0);
			$gameSystem.clearSrpgAllActors();
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' && !event.isScriptedDeploy) {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
				}
			 });
			 if(!forceRefresh){
				$statCalc.externalLockUnitUpdates(); 
			 }			 
			 this.deployActors(false, $gameTemp.manualDeployType, validatePositions);
			 $statCalc.externalUnlockUnitUpdates();
		}
		
		Game_System.prototype.redeployActor = function(actorId, toAnimQueue){  
			var actor = $gameActors.actor(actorId);		
			$gameMap.events().forEach(function(event) {
				if (event.eventId() === actor.event.eventId()) {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
					var oldValue = $gameVariables.value(_existActorVarID);
					$gameVariables.setValue(_existActorVarID, oldValue - 1);
				}
			});
			this.deployActor(actor, actor.event, toAnimQueue);
			actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			if(!toAnimQueue){
				actor.event.refreshImage();
			}		 
		}
		
		Game_System.prototype.deployActors = function(toAnimQueue, lockedOnly, validatePositions) {
			var _this = this;
			if(lockedOnly == null){
				lockedOnly = "all";
			}
			console.log("===deployActors===");
			var deployInfo = _this.getDeployInfo();
			var deployList = _this.getActiveDeployList();
			var i = 0;
			while(deployInfo.doNotDeploySlots[i]){
				i++;
			}	
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' && !event.isDeployed) {									
					if(i < deployList.length){	
						console.log("found target event, deploying "+i+"...");	
						var actor_unit;
						var entry = deployList[i] || {};
						var actorId = entry.main;		
						if(lockedOnly == "all" || (lockedOnly == "locked" && deployInfo.lockedSlots[i]) || (lockedOnly == "unlocked" && !deployInfo.lockedSlots[i])){
							if(typeof actorId != "undefined"){
								actor_unit = $gameActors.actor(actorId);
							}				
							if (actor_unit) {
								var validPosition;
								if(validatePositions && !deployInfo.lockedSlots[i]){
									validPosition = $statCalc.canStandOnTile(actor_unit, {x: event.posX(), y: event.posY()})
								} else {
									validPosition = true;
								}
								if(validPosition){
									console.log("Deployed: actor "+actorId+" to event "+event.eventId()+" (queued: "+(!!toAnimQueue)+")");
									_this.deployActor(actor_unit, event, toAnimQueue, entry.sub);
								} else {
									console.log("!!!Invalid position - the actor can't stand on the target tile!");
									event.erase();
								}						
							} else {
								console.log("!!!Invalid actor - no defined actor found for id: "+actorId);
								event.erase();
							}
						}	
					}
					i++;	
					while(deployInfo.doNotDeploySlots[i]){
						i++;
					}
				}		
			});
			console.log("===deployActors finished===");
		}
		
		// イベントのメモからエネミーを読み込み、対応するイベントＩＤに紐づけする
		Game_System.prototype.setSrpgEnemys = function() {
			$gameVariables.setValue(_existEnemyVarID, 0);
			$gameVariables.setValue(_enemiesDestroyed, 0);
			var i = 0;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'enemy') {
					var enemyId = event.event().meta.id ? Number(event.event().meta.id) : 1;
					var enemy_unit = new Game_Enemy(enemyId, 0, 0);				
					enemy_unit._mechClass = parseInt(event.event().meta.mechClass)
					
					if (enemy_unit) {
						enemy_unit.event = event;
						if (event.event().meta.mode) {
							enemy_unit.setBattleMode(event.event().meta.mode);
							if (event.event().meta.targetId) {
								enemy_unit.setTargetId(event.event().meta.targetId);
							}
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
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
						$gameSystem.setEventToUnit(event.eventId(), 'enemy', enemy_unit);
						$statCalc.initSRWStats(enemy_unit);
					}
				}
			});
		};

		//２イベント間の距離を返す
		Game_System.prototype.unitDistance = function(event1, event2) {
			var minDisX = Math.abs(event1.posX() - event2.posX());
			var minDisY = Math.abs(event1.posY() - event2.posY());
			if ($gameMap.isLoopHorizontal() == true) {
				var event1X = event1.posX() > event2.posX() ? event1.posX() - $gameMap.width() : event1.posX() + $gameMap.width();
				var disX = Math.abs(event1X - event2.posX());
				minDisX = minDisX < disX ? minDisX : disX;
			}
			if ($gameMap.isLoopVertical() == true) {
				var event1Y = event1.posY() > event2.posY() ? event1.posY() - $gameMap.height() : event1.posY() + $gameMap.height();
				var disY = Math.abs(event1Y - event2.posY());
				minDisY = minDisY < disY ? minDisY : disY;
			}
			return minDisX + minDisY;
		};

	//戦闘終了に関係する処理
		//戦闘終了するためのプラグイン・コマンド
		Game_System.prototype.endSRPG = function() {
			$gameTemp.clearActiveEvent();
			$gameMap.events().forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
					if (_srpgBattleEndAllHeal == 'true') {
						battlerArray[1].recoverAll();
					}
					battlerArray[1].onTurnEnd();
				}
			});
			this._SRPGMode = false;
			$gameSwitches.setValue(_srpgBattleSwitchID, false);
			this._isBattlePhase = 'initialize';
			this._isSubBattlePhase = 'initialize';
			$gamePlayer.refresh();
			this.clearData(); //データの初期化
			$gameMap.setEventImages();   // ユニットデータに合わせてイベントのグラフィックを変更する
			
			$gameTemp.updatePlayerSpriteVisibility();
			SceneManager._scene.createPauseWindow(); //ensure pause menu is updated to reflect the new mode
		};

	//戦闘の進行に関係する処理
		// 戦闘開始時のイベントを起動する
		Game_System.prototype.runBattleStartEvent = function() {
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'battleStart') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
		};
		
		Game_System.prototype.runAfterDeployEvent = function() {
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'afterDeploy') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
		};

		//次のカーソル移動先のアクターを取得する(R)
		Game_System.prototype.getNextRActor = function() {
			var candidates =  $statCalc.getAllCandidates("actor", true);
			this.actorLRId++;
			if(this.actorLRId >= candidates.length){
				this.actorLRId = 0;
			}
			var candidate = candidates[this.actorLRId];
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  
		}

		//次のカーソル移動先のアクターを取得する(L)
		Game_System.prototype.getNextLActor = function() {       
			var candidates =  $statCalc.getAllCandidates("actor", true);
			this.actorLRId--;
			if(this.actorLRId < 0){
				this.actorLRId = candidates.length-1;
			}
			var candidate = candidates[this.actorLRId];
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}        
		}
		
		Game_System.prototype.isValidAttackTarget = function(candidate){
			var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
			var targetBattlerArray = $gameSystem.EventToUnit(candidate.event.eventId());
		   
			var isInRange = $battleCalc.isTargetInRange({x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}, {x: candidate.event.posX(), y: candidate.event.posY()}, $statCalc.getRealWeaponRange(actionBattlerArray[1], $gameTemp.actorAction.attack), $gameTemp.actorAction.attack.minRange);
			var validTarget = $statCalc.canUseWeapon(actionBattlerArray[1], $gameTemp.actorAction.attack, false, targetBattlerArray[1]);
			
			return isInRange && validTarget;
		}                               
		
		Game_System.prototype.getNextRTarget = function() {
			var candidates =  $statCalc.getAllCandidates("enemy");
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetLRId++;
				if(this.targetLRId >= candidates.length){
					this.targetLRId = 0;
				}
				if(this.isValidAttackTarget(candidates[this.targetLRId])){
					candidate = candidates[this.targetLRId];
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  
		}

		//次のカーソル移動先のアクターを取得する(L)
		Game_System.prototype.getNextLTarget = function() {       
			var candidates =  $statCalc.getAllCandidates("enemy");
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetLRId--;
				if(this.targetLRId < 0){
					this.targetLRId = candidates.length-1;
				}
				if(this.isValidAttackTarget(candidates[this.targetLRId])){
					candidate = candidates[this.targetLRId];
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  		
		}
		
		Game_System.prototype.getNextRSpiritTarget = function() {
			var spiritDef;
			if(this.targetSpiritLRId == null){
				this.targetSpiritLRId = 0;
			}
			if($gameTemp.currentTargetingSpirit){
				spiritDef = $spiritManager.getSpiritDef($gameTemp.currentTargetingSpirit.idx);
				if(spiritDef.targetType == "ally"){
					var candidates =  $statCalc.getAllCandidates("actor");
				} else {
					var candidates =  $statCalc.getAllCandidates("enemy");
				}
			}
			
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetSpiritLRId++;
				if(this.targetSpiritLRId >= candidates.length){
					this.targetSpiritLRId = 0;
				}
				var target = candidates[this.targetSpiritLRId].actor;
				if (($gameSystem.isFriendly(target, "player") && spiritDef.targetType == "ally") || (!$gameSystem.isFriendly(target, "player")  && spiritDef.targetType == "enemy")) {						
					if(spiritDef.singleTargetEnabledHandler(target)){
						candidate = candidates[this.targetSpiritLRId];
					}
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  
		}

		//次のカーソル移動先のアクターを取得する(L)
		Game_System.prototype.getNextLSpiritTarget = function() {       
			var spiritDef;
			if(this.targetSpiritLRId == null){
				this.targetSpiritLRId = 0;
			}
			if($gameTemp.currentTargetingSpirit){
				spiritDef = $spiritManager.getSpiritDef($gameTemp.currentTargetingSpirit.idx);
				if(spiritDef.targetType == "ally"){
					var candidates =  $statCalc.getAllCandidates("actor");
				} else {
					var candidates =  $statCalc.getAllCandidates("enemy");
				}
			}
			
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetSpiritLRId--;
				if(this.targetSpiritLRId < 0){
					this.targetSpiritLRId = candidates.length-1;
				}
				var target = candidates[this.targetSpiritLRId].actor;
				if (($gameSystem.isFriendly(target, "player") && spiritDef.targetType == "ally") || (!$gameSystem.isFriendly(target, "player")  && spiritDef.targetType == "enemy")) {						
					if(spiritDef.singleTargetEnabledHandler(target)){
						candidate = candidates[this.targetSpiritLRId];
					}
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			} 		
		}


		//アクターターンの開始
		Game_System.prototype.srpgStartActorTurn = function() {
			var _this = this;
			$statCalc.invalidateAbilityCache();
			
			$gameTemp.currentFaction = -1;
			$songManager.playStageSong();
			this.aliveActorIdList = [];
			this.actorLRId = 0;
			this.targetLRId = 0;
			this.targetSpiritLRId = 0;
			var spiritActivations = [];
			var AIActors = [];
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actorTurn') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && battlerArray[0] === 'actor' && battlerArray[1].isAlive() && !event.isErased()) {
					$gameSystem.aliveActorIdList.push(event.eventId());
					battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
					var SPRegen = 0;
					SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
					if(ENGINE_SETTINGS.VXT_SP){
						SPRegen+=5;
					}
					if(ENGINE_SETTINGS.DEFAULT_SP_REGEN){
						SPRegen+=ENGINE_SETTINGS.DEFAULT_SP_REGEN;
					}
					if($gameVariables.value(_turnVarID) != 1){
						$statCalc.recoverSP(battlerArray[1], SPRegen);
					}
					
					var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
					
					autoSpirits.forEach(function(autoSpirit){		
						$statCalc.setAbilityUsed(battlerArray[1], "auto_spirit_"+autoSpirit.stackId);
						spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
					});				
					const actor = battlerArray[1];
					
					if(actor && !actor.isSubPilot){
						var subPilots = $statCalc.getSubPilots(actor);
						var mainPilot = actor;
						var ctr = 0;
						subPilots.forEach(function(pilotId){
							var subPilot = $gameActors.actor(pilotId);
							if(subPilot){
								var SPRegen = 0;
								SPRegen = $statCalc.applyStatModsToValue(subPilot, SPRegen, ["SP_regen"]);
								if(ENGINE_SETTINGS.VXT_SP){
									SPRegen+=5;
								}
								if(ENGINE_SETTINGS.DEFAULT_SP_REGEN){
									SPRegen+=ENGINE_SETTINGS.DEFAULT_SP_REGEN;
								}
								if($gameVariables.value(_turnVarID) != 1){
									$statCalc.recoverSP(subPilot, SPRegen);
								}
							}							
						});
					}
					
					if($statCalc.isAI(battlerArray[1])){
						AIActors.push(event);
					}
				}
				if (battlerArray && battlerArray[0] === 'enemy' && battlerArray[1].isAlive()) {
					battlerArray[1].SRPGActionTimesSet(1);
				}
				
			});
			$statCalc.clearSpiritOnAll("actor", "strike");
			$statCalc.clearSpiritOnAll("actor", "wall");
			$statCalc.clearSpiritOnAll("actor", "focus");
			$statCalc.clearSpiritOnAll("enemy", "disrupt");
			$statCalc.clearSpiritOnAll("enemy", "analyse");
			$statCalc.clearSpiritOnAll("actor", "taunt");
			$statCalc.clearTempEffectsOnAll();
			$gameSystem.expireAbilityZones();
			$statCalc.resetAllBattleTemp();
			$statCalc.resetAllStatus("enemy");
			if($gameVariables.value(_turnVarID) != 1){
				$statCalc.applyTurnStartWill("actor");
			}
			$statCalc.applyMPRegen("actor");
			$statCalc.applyENRegen("actor");
			$statCalc.applyAmmoRegen("actor");
			$statCalc.applyHPRegen("actor");
			this.aliveActorIdList.sort(function(a, b) {
				return a - b;
			});
			var actor1 = $gameMap.event(this.aliveActorIdList[0]);
			if (actor1) {
				$gamePlayer.locate(actor1.posX(), actor1.posY());
			}
			$gameTemp.autoSpirits = spiritActivations;
			$gameTemp.autoSpiritsDelay = 150;
			
			_this.setBattlePhase('actor_phase');
			
			$gameTemp.AIActors = AIActors;
			
			$statCalc.invalidateAbilityCache();
			
			if(spiritActivations.length){					
				_this.setSubBattlePhase('auto_spirits');
			} else if($gameTemp.AIActors.length){
				_this.setBattlePhase('AI_phase');
				_this.setSubBattlePhase('enemy_command');
			} else {			
				_this.setSubBattlePhase('initialize');
			}	
		};

		//自動行動アクターターンの開始
		Game_System.prototype.srpgStartAutoActorTurn = function() {
			this.setBattlePhase('auto_actor_phase');
			this.setSubBattlePhase('auto_actor_command');
		};

		//エネミーターンの開始
		Game_System.prototype.srpgStartEnemyTurn = function(factionId) {
			var _this = this;
			$gameTemp.buttonHintManager.hide();
			
			
			$gameTemp.showAllyAttackIndicator = false;
			$gameTemp.showAllyDefendIndicator = false;
			$gameTemp.showEnemyAttackIndicator = false;
			$gameTemp.showEnemyDefendIndicator = false;
			$gameTemp.currentFaction = factionId;
			if(factionId > 2){
				$gameSystem.srpgTurnEnd();
				return;
			}
			
			if(!$gameSystem.factionConfig[factionId].active){
				$gameTemp.currentFaction++;
				this.srpgStartEnemyTurn($gameTemp.currentFaction);
				return;
			}		
			$songManager.playStageSong();
			var spiritActivations = [];
			$gameTemp.AIActors = [];
					
			$gameMap.events().forEach(function(event) {				
				if (event.isType() === 'enemyTurn') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && battlerArray[0] === 'enemy' && !event.isErased()) {
					battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
					var SPRegen = 0;
					SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
					$statCalc.recoverSP(battlerArray[1], SPRegen);
					
					$gameTemp.AIActors.push(event);
					
					var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
					
					autoSpirits.forEach(function(autoSpirit){	
						$statCalc.setAbilityUsed(battlerArray[1], "auto_spirit_"+autoSpirit.stackId);
						spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
					});	
				}
			});
			
			
			$statCalc.clearSpiritOnAll("enemy", "strike", factionId);
			$statCalc.clearSpiritOnAll("enemy", "wall", factionId);
			$statCalc.clearSpiritOnAll("enemy", "focus", factionId);
			$statCalc.clearSpiritOnAll("actor", "disrupt");
			$statCalc.clearSpiritOnAll("actor", "analyse");
			$statCalc.clearTempEffectsOnAll();
			$gameSystem.expireAbilityZones();
			$statCalc.applyTurnStartWill("enemy", factionId);
			$statCalc.applyENRegen("enemy", factionId);
			$statCalc.applyMPRegen("enemy", factionId);
			$statCalc.applyAmmoRegen("enemy", factionId);
			$statCalc.applyHPRegen("enemy", factionId);
			$statCalc.resetAllBattleTemp(null, factionId);
			$statCalc.resetAllStatus("actor");
			$gameTemp.AIWaitTimer = 0;
			
			$gameTemp.autoSpirits = spiritActivations;
			$gameTemp.autoSpiritsDelay = 150;
			
			$statCalc.invalidateAbilityCache();
			
			if(spiritActivations.length){					
				_this.setSubBattlePhase('auto_spirits');
			} else if($gameTemp.AIActors.length){
				_this.setBattlePhase('AI_phase');
				_this.setSubBattlePhase('enemy_command');
			} else {
				this.setSubBattlePhase('enemy_command');
			}
			
			//
		};

		//ターン終了
		Game_System.prototype.srpgTurnEnd = function() {
			$gameMap.events().forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
					battlerArray[1].onTurnEnd();
				}
			});
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'turnEnd') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
			this.srpgTurnPlus();
			this.srpgStartActorTurn();//アクターターンを開始する
		};

		//ターン数を増やす
		Game_System.prototype.srpgTurnPlus = function() {
			var oldValue = $gameVariables.value(_turnVarID);
			$gameVariables.setValue(_turnVarID, oldValue + 1);
			
			var oldValue = $gameVariables.value(_turnCountVariable);
			$gameVariables.setValue(_turnCountVariable, oldValue + 1);
		};

	//戦闘の計算に関係する処理
		// 移動範囲および攻撃範囲を計算・表示する
		Game_System.prototype.srpgMakeMoveTable = function(event, determineEdge, noHighlights) {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			
			var moveRange = $statCalc.getCurrentMoveRange(battlerArray[1]);
			$gameTemp.clearMoveTable();
			event.makeMoveTable(event.posX(), event.posY(), moveRange, [0], battlerArray[1]);
			var list = $gameTemp.moveList();
			var tileLookup = {};
			this.highlightedTiles = [];
			this.highlightsRefreshed = true;
			if(!noHighlights){			
				$gameTemp.disableHighlightGlow = true;
				for(var i = 0; i < list.length; i++){		
					$gameSystem.highlightedTiles.push({x: list[i][0], y: list[i][1], color: "#2c57ff"});
					if(!tileLookup[list[i][0]]){
						tileLookup[list[i][0]] = {};
					}
					tileLookup[list[i][0]][list[i][1]] = true;
				}
			}
			this._lastMoveRangeHighlights = $gameSystem.highlightedTiles;
			$gameTemp.pushRangeListToMoveList();
			
			$gameSystem.moveEdgeHighlights = [];
			$gameSystem.showMoveEdge = [];
			if(ENGINE_SETTINGS.ENABLE_QUICK_MOVE && determineEdge){
				var centerCoords = {x: event.posX(), y: event.posY()};
				var topCoords = JSON.parse(JSON.stringify(centerCoords));				
				topCoords.y-=moveRange;	
				
				var bottomCoords = JSON.parse(JSON.stringify(centerCoords));				
				bottomCoords.y+=moveRange;	
				
				var leftCoords = JSON.parse(JSON.stringify(centerCoords));				
				leftCoords.x-=moveRange;	
				
				var rightCoords = JSON.parse(JSON.stringify(centerCoords));				
				rightCoords.x+=moveRange;	
				
				$gameSystem.moveEdgeHighlightsRefreshed = true;
				
				var centerTop = JSON.parse(JSON.stringify(centerCoords));
				var centerBottom = JSON.parse(JSON.stringify(centerCoords));
				var centerLeft = JSON.parse(JSON.stringify(centerCoords));
				var centerRight = JSON.parse(JSON.stringify(centerCoords));
				
				var edgeTiles = [];
				var registeredEdgeTiles = {};
				
				//the coords of the outer center tiles must be determined before this function is used
				function isValidEdgeTile(i, j){
					var isValid = true;
					//filter out edge tiles that are on the central axis, except the outer most tiles
					if(i == centerCoords.x){
						if(j != centerTop.y && j != centerBottom.y){
							isValid = false;
						}
					}
					
					if(j == centerCoords.y){
						if(i != centerLeft.x && i != centerRight.x){
							isValid = false;
						}
					}	
					return isValid;
				}
				
				function registerEdgeTiles(i, j){					
					if(!registeredEdgeTiles[i]){
						registeredEdgeTiles[i] = {};
						edgeTiles.push({x: i, y: j});				
					}
					if(!registeredEdgeTiles[i][j]){
						registeredEdgeTiles[i][j] = true;
						edgeTiles.push({x: i, y: j});
					}														
				}
				
				var tileGraphLookup = {};
				function addGraphConnection(i, j, direction, target){
					if(i != target.x || j != target.y){
						if(!tileGraphLookup[i]){
							tileGraphLookup[i] = {};
						}
						if(!tileGraphLookup[i][j]){
							tileGraphLookup[i][j] = {
								x: i,
								y: j,
								connections: {
									up: null,
									down: null,
									left: null,
									right: null
								}
							};
						}
						if(!tileGraphLookup[i][j].connections[direction]){
							tileGraphLookup[i][j].connections[direction] = target;
						}
						
					}					
				}
				
				for(var i = leftCoords.x; i <= rightCoords.x; i++){
					for(var j = topCoords.y; j <= bottomCoords.y; j++){
						if(tileLookup[i] && tileLookup[i][j]){
							if(isEdgeTile({x: i, y: j})){										
								if(i == centerCoords.x){
									if(j < centerCoords.y && j < centerTop.y){
										centerTop.y = j;
									}
									if(j > centerCoords.y && j > centerBottom.y){
										centerBottom.y = j;
									}
								}
								
								if(j == centerCoords.y){
									if(i > centerCoords.x && i > centerRight.x){
										centerRight.x = i;
									}
									if(i < centerCoords.x && i < centerLeft.x){
										centerLeft.x = i;
									}
								}													
							}							
						}
					}					
				}
				
				
				var visited = {};
				
				var offsetCheckOrder = [
					{x: 0, y: -1},
					{x: 1, y: -1},
					{x: 1, y: 0},
					{x: 1, y: 1},
					{x: 0, y: 1},
					{x: -1, y: 1},
					{x: -1, y: 0},
					{x: -1, y: -1},
				];
				
				var offsetCheckOrderBottom = [
					{x: 0, y: 1},
					{x: -1, y: 1},
					{x: -1, y: 0},
					{x: -1, y: -1},
					{x: 0, y: -1},
					{x: 1, y: -1},
					{x: 1, y: 0},
					{x: 1, y: 1},
				];
				
				function isEdgeTile(node){
					var x = node.x;
					var y = node.y;
					var isEdgeTile = false;
					if(!tileLookup[x-1]){
						isEdgeTile = true;
					} else if(!tileLookup[x-1][y]){
						isEdgeTile = true;
					}
					if(!tileLookup[x+1]){
						isEdgeTile = true;
					} else if(!tileLookup[x+1][y]){
						isEdgeTile = true;
					}
					if(tileLookup[x]){
						if(!tileLookup[x][y+1]){
							isEdgeTile = true;
						}
						if(!tileLookup[x][y-1]){
							isEdgeTile = true;
						}
					}
					return isEdgeTile;
				}
				
				function getNeighborInfo(node){
					var x = node.x;
					var y = node.y;
					var result = {};
					for(var i = -1; i < 2; i++){
						for(var j = -1; j < 2; j++){
							if(!result[x+i]){
								result[x+i] = {};
							}
							if(tileLookup[x+i] && tileLookup[x+i][y+j]){
								result[x+i][y+j] = "in_range";
							} else {
								result[x+i][y+j] = "out_range";
							}
						}						
					}
					return result;
				}
				
				function hasConnection(neighborInfo1, neighborInfo2){
					var result = false;
					Object.keys(neighborInfo1).forEach(function(x){
						Object.keys(neighborInfo1[x]).forEach(function(y){
							if(neighborInfo1[x][y] == "out_range"){
								if(neighborInfo2[x] && neighborInfo2[x][y] && neighborInfo2[x][y] == "out_range"){
									result = true;
								}
							}
						});
					});
					
					return result;
				}
				
				function connectNodes(currentNode, nextNode){
					if(nextNode && currentNode){
						if(nextNode.x > currentNode.x){
							addGraphConnection(currentNode.x, currentNode.y, "right", {x: nextNode.x, y: nextNode.y});
							addGraphConnection(nextNode.x, nextNode.y, "left", {x: currentNode.x, y: currentNode.y});
						} else if(nextNode.x < currentNode.x){
							addGraphConnection(currentNode.x, currentNode.y, "left", {x: nextNode.x, y: nextNode.y});
							addGraphConnection(nextNode.x, nextNode.y, "right", {x: currentNode.x, y: currentNode.y});
						} 
						
						if(nextNode.y > currentNode.y){
							addGraphConnection(currentNode.x, currentNode.y, "down", {x: nextNode.x, y: nextNode.y});
							addGraphConnection(nextNode.x, nextNode.y, "up", {x: currentNode.x, y: currentNode.y});
						} else if(nextNode.y < currentNode.y){
							addGraphConnection(currentNode.x, currentNode.y, "up", {x: nextNode.x, y: nextNode.y});
							addGraphConnection(nextNode.x, nextNode.y, "down", {x: currentNode.x, y: currentNode.y});
						} 
					}	
				}
				
				var currentNode = centerTop;
				var firstNode = centerTop;
				var lastNode;
				
				while(currentNode){
					edgeTiles.push({x: currentNode.x, y: currentNode.y});	
					//console.log("visiting: "+ currentNode.x+", "+ currentNode.y)
					if(!visited[currentNode.x]){
						visited[currentNode.x] = {};
					}
					if(!visited[currentNode.x][currentNode.y]){
						visited[currentNode.x][currentNode.y] = true;
					}
					
					let nextNode;
					var currentNeighborInfo = getNeighborInfo(currentNode);
					
					var ctr = 0;
					while(!nextNode && ctr < offsetCheckOrder.length){
						var offset;
						if(currentNode.x >= centerCoords.x){
							offset = offsetCheckOrder[ctr];
						} else {
							offset = offsetCheckOrderBottom[ctr];
						}
						
						if(currentNeighborInfo[currentNode.x + offset.x][currentNode.y + offset.y] == "in_range" && (!visited[currentNode.x + offset.x] || !visited[currentNode.x + offset.x][currentNode.y + offset.y])){
							var candidate = {x: currentNode.x + offset.x, y: currentNode.y + offset.y};
							if(isEdgeTile(candidate) && hasConnection(currentNeighborInfo, getNeighborInfo(candidate))){
								nextNode = candidate;
							}
						}
						ctr++;
					}
					
					connectNodes(currentNode, nextNode);				
					if(nextNode){
						lastNode = nextNode;
					}
					currentNode = nextNode;
				}
					
				if(lastNode) {
					if(Math.abs(lastNode.x - firstNode.x) > 1 || Math.abs(lastNode.y - firstNode.y) > 1){							
						$gameTemp.moveEdgeInfo = null;
					} else {
						connectNodes(lastNode, firstNode);	
						$gameTemp.moveEdgeInfo = {
							corners: {
								up: centerTop,
								down: centerBottom,
								left: centerLeft,	
								right: centerRight
							},
							graph: tileGraphLookup
						};
						
						edgeTiles.forEach(function(tile){
							$gameSystem.moveEdgeHighlights.push({x: tile.x, y: tile.y, color: "#2c57ff"});					
						});
					}
				}							
			}
		};
		
		Game_System.prototype.reloadMoveHighlights = function() {
			this.highlightedTiles = this._lastMoveRangeHighlights;
			this.highlightsRefreshed = true;
		}

		//移動先にアクターまたはエネミーがいる場合は移動できない（重なりを避ける）
		Game_System.prototype.areTheyNoUnits = function(x, y, type) {
			var flag = true;
			$gameMap.eventsXy(x, y).forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event._eventId);
				if (battlerArray && event != $gameTemp.activeEvent() && !event.isErased() &&
					battlerArray[0] === type || event.isType() === 'playerEvent') {
					flag = false;
				}
			});
			return flag;
		};

		//移動先にイベントユニットがあるかどうか
		Game_System.prototype.isThereEventUnit = function(x, y) {
			var flag = false;
			$gameMap.eventsXy(x, y).forEach(function(event) {
				if (event.isType() === 'unitEvent') {
					flag = true;
				}
			});
			return flag;
		};
		
		Game_System.prototype.getTwinInfo = function() {
			if(!$gameSystem.twinInfo){
				$gameSystem.twinInfo = {};
			} 
			return $gameSystem.twinInfo;
		};
		
		Game_System.prototype.getIsTwinInfo = function() {
			if(!$gameSystem.isTwinInfo){
				$gameSystem.isTwinInfo = {};
			} 
			return $gameSystem.isTwinInfo;
		};
		
		Game_System.prototype.getPreferredSlotInfo = function() {
			if(!this.preferredSlotInfo){
				this.preferredSlotInfo = {};
			} 
			return this.preferredSlotInfo;
		};
		
		Game_System.prototype.getPreferredShipSlotInfo = function() {
			if(!this.preferredShipSlotInfo){
				this.preferredShipSlotInfo = {};
			} 
			return this.preferredShipSlotInfo;
		};
		
		Game_System.prototype.invalidateDeployList = function() {
			$gameSystem.deployList = null;
		}
		
		Game_System.prototype.getDeployList = function() {
			if(!$gameSystem.deployList){
				this.constructDeployList();
			}
			return $gameSystem.deployList;
		}
		
		Game_System.prototype.getShipDeployList = function() {
			if(!$gameSystem.shipDeployList){
				this.constructShipDeployList();
			}
			return $gameSystem.shipDeployList;
		}
		
		Game_System.prototype.getActiveDeployList = function() {
			return this._activeDeploylist;
		}
		
		Game_System.prototype.setActiveDeployList = function(list) {
			this._activeDeploylist = list;
		}
		
		Game_System.prototype.getActiveShipDeployList = function() {
			return this._activeShipDeploylist;
		}
		
		Game_System.prototype.setActiveShipDeployList = function(list) {
			this._activeShipDeploylist = list;
		}
		
		Game_System.prototype.constructDeployList = function(forShips) {
			$gameSystem.deployList = [];
			var deployInfo = this.getDeployInfo();
			var usedUnits = {};
			var slotLookup = {};
			
			var validActors = {};
			var candidates = $gameSystem.getAvailableUnits();	
			var tmp = [];
			candidates.forEach(function(candidate){
				if($statCalc.isValidForDeploy(candidate) && !$statCalc.isShip(candidate)){
					validActors[candidate.actorId()] = true;
					tmp.push(candidate);
				}
			});	
			candidates = tmp;
			
			var sortedCandidates = [];
			var usedActors = {};
			var preferredSlotInfo = this.getPreferredSlotInfo();
			Object.keys(preferredSlotInfo).forEach(function(slot){
				var info = preferredSlotInfo[slot];			
				var entry = {
					main: null,
					sub: null
				};
				var isValid = false;
				if(info){
					if(info.main != -1 && validActors[info.main]){
						entry.main = info.main;
						isValid = true;
						usedActors[entry.main] = true;
					}
					if(info.sub != -1 && validActors[info.sub]){
						entry.sub = info.sub;
						isValid = true;
						usedActors[entry.sub] = true;
					}
				}				
				if(isValid){
					sortedCandidates.push(entry);
				}
			});
			
			tmp.forEach(function(candidate){
				if(!usedActors[candidate.actorId()]){
					sortedCandidates.push({
						main: candidate.actorId(),
						sub: null
					});
				}
			});	
					
			
			var i = 0;
			while(sortedCandidates.length){	
				var entry = {};
				if(i < deployInfo.count){				
					var isPredefined = false;
					if(deployInfo.assigned[i] && validActors[deployInfo.assigned[i]]){
						entry.main = deployInfo.assigned[i];
						isPredefined = true;
					}
					if(deployInfo.assignedSub[i] && validActors[deployInfo.assigned[i]]){
						entry.sub = deployInfo.assignedSub[i];
						isPredefined = true;
					}
					if(!isPredefined){
						entry = sortedCandidates.shift();
					} 				
				} else {
					entry = sortedCandidates.shift();
				}
				if(usedUnits[entry.main]){
					entry.main = null;
				}
				if(usedUnits[entry.sub]){
					entry.sub = null;
				}
				if(entry.main || entry.sub){
					$gameSystem.deployList.push(entry);							
					usedUnits[entry.main] = true;
					usedUnits[entry.sub] = true;
				}
				i++;
			}
		}
		
		Game_System.prototype.constructShipDeployList = function() {
			$gameSystem.shipDeployList = [];
			var deployInfo = this.getDeployInfo();
			var usedUnits = {};
			
			var validActors = {};
			var candidates = $gameSystem.getAvailableUnits();	
			var tmp = [];
			candidates.forEach(function(candidate){
				if($statCalc.isValidForDeploy(candidate) && $statCalc.isShip(candidate)){
					validActors[candidate.actorId()] = true;
					tmp.push(candidate);
				}
			});	
			candidates = tmp;
			
			var sortedCandidates = [];
			var usedActors = {};
			var preferredSlotInfo = this.getPreferredShipSlotInfo();
			Object.keys(preferredSlotInfo).forEach(function(slot){
				var info = preferredSlotInfo[slot];			
				var entry = {
					main: null,
					sub: null
				};
				var isValid = false;
				if(info.main != -1 && validActors[info.main]){
					entry.main = info.main;
					isValid = true;
					usedActors[entry.main] = true;
				}
				if(isValid){
					sortedCandidates.push(entry);
				}
			});
			
			tmp.forEach(function(candidate){
				if(!usedActors[candidate.actorId()]){
					sortedCandidates.push({
						main: candidate.actorId(),
						sub: null
					});
				}
			});	
					
			
			var i = 0;
			while(sortedCandidates.length){	
				var entry = {};
				if(i < deployInfo.shipCount){				
					var isPredefined = false;
					if(deployInfo.assignedShips[i] && validActors[deployInfo.assignedShips[i]]){
						entry.main = deployInfo.assignedShips[i];
						isPredefined = true;
					}
					if(!isPredefined){
						entry = sortedCandidates.shift();
					} 				
				} else {
					entry = sortedCandidates.shift();
				}
				if(usedUnits[entry.main]){
					entry.main = null;
				}
				if(usedUnits[entry.sub]){
					entry.sub = null;
				}
				if(entry.main || entry.sub){
					$gameSystem.shipDeployList.push(entry);							
					usedUnits[entry.main] = true;
					usedUnits[entry.sub] = true;
				}
				i++;
			}
		}
		
		Game_System.prototype.syncPreferredSlots = function() {
			var deployInfo = this.getDeployList();
			this.preferredSlotInfo = {};
			for(var i = 0; i < deployInfo.length; i++){
				if(deployInfo[i]){
					this.preferredSlotInfo[i] = deployInfo[i];
				}				
			}
		}
		
		Game_System.prototype.getDeployInfo = function() {
			var info = $gameVariables.value(_nextMapDeployVariable);
			var defaultInfo = {
				count: 0,
				shipCount: 0,
				assigned: {},
				assignedSub: {},
				assignedShips: {},
				lockedSlots: {},		
				lockedShipSlots: {},	
				favorites: {},
				doNotDeploySlots: {},
				minDeployCount: 1
			};
			if(!info){
				info = defaultInfo;
			} else {
				info = JSON.parse(info);
				Object.keys(defaultInfo).forEach(function(setting){
					if(info[setting] == null){
						info[setting] = defaultInfo[setting];
					}
				});
			}
			return info;
		};
		
		Game_System.prototype.setDeployInfo = function(info) {
			this.invalidateDeployList();
			$gameVariables.setValue(_nextMapDeployVariable, JSON.stringify(info));
		};
		
		Game_System.prototype.clearActorDeployInfo = function(actorId) {
			var deployInfo = this.getDeployInfo();
			Object.keys(deployInfo.assigned).forEach(function(slot){
				if(deployInfo.assigned[slot] == actorId){
					delete deployInfo.assigned[slot];
				}
			});
			this.setDeployInfo(deployInfo);
		};
		
		Game_System.prototype.getPersuadeOption = function(actor) {
			if(this.persuadeOptions && actor.isActor()){
				var lookup = this.persuadeOptions[actor.actorId()];
				if(!lookup){
					lookup = this.persuadeOptions[-1];
				}
				if(lookup){
					var event = actor.event;
					var position = {x: event.posX(), y: event.posY()};
					var adjacentEvents = $statCalc.getAdjacentEvents(null, position);
					
					var option;
					var ctr = 0;
					while(!option && ctr < adjacentEvents.length){
						var eventId = adjacentEvents[ctr].eventId();
						if(lookup[eventId] != null){
							option = {eventId: eventId, controlVar: lookup[eventId]};
						}
						ctr++;
					}
					return option;
				}			
			} 
			return null;		
		};
		
		Game_System.prototype.getUnitSceneBgId = function(actor) {
			if(actor && actor.commandBgId){
				return actor.commandBgId;
			} else if($gameTemp.editMode){
				return $SRWEditor.getBattleEnvironmentId();
			} else {
				var event = $statCalc.getReferenceEvent(actor);
				var region = $gameMap.regionId(event.posX(), event.posY());
				let superState = $statCalc.getSuperState(actor);
				if(superState == -1){
					if($gameSystem.regionBattleEnv[region] != null){
						return $gameSystem.regionBattleEnv[region];
					}
				} else {
					if($gameSystem.regionSuperStateBattleEnv[superState] != null && $gameSystem.regionSuperStateBattleEnv[superState][region] != null){
						return $gameSystem.regionSuperStateBattleEnv[superState][region];
					}
					if($gameSystem.superStateBattleEnv[superState]){
						return $gameSystem.superStateBattleEnv[superState];
					}
				}				
				return $gameSystem.defaultBattleEnv;						
			}
		};
		
		Game_System.prototype.validateAbilityLockInfo = function(actorId, abilityId) {
			if(!this.abilityLockInfo){
				this.abilityLockInfo = {
					actor: {},
					mech: {}
				}
			}
		}
		
		Game_System.prototype.setAbilityStatus = function(abilityInfo, id, abilityId, status) {
			//status: hidden, locked, ""
			if(!abilityInfo[id]){
				abilityInfo[id] = {};
			}
			abilityInfo[id][abilityId] = status;
		}
		
		Game_System.prototype.getAbilityStatus = function(abilityInfo, id, abilityId) {
			//status: hidden, locked, ""		
			var result = "";
			if(abilityInfo[id] && abilityInfo[id][abilityId]){
				result = abilityInfo[id][abilityId];
			}		
			return result;
		}
		
		Game_System.prototype.setPilotAbilityStatus = function(actorId, abilityId, status) {		
			this.validateAbilityLockInfo();
			this.setAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId, status);
		}
		
		Game_System.prototype.getPilotAbilityStatus = function(actorId, abilityId) {	
			this.validateAbilityLockInfo();
			return this.getAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId);
		}
		
		Game_System.prototype.isHiddenActorAbility = function(actor, abilityId) {
			var result = false;
			if(actor.isActor()){
				var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
				result = status == "hidden" || status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.isLockedActorAbility = function(actor, abilityId) {
			var result = false;
			if(actor.isActor()){
				var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
				result = status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.setMechAbilityStatus = function(mechId, abilityId, status) {		
			this.validateAbilityLockInfo();
			this.setAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId, status);
		}
		
		Game_System.prototype.getMechAbilityStatus = function(mechId, abilityId) {	
			this.validateAbilityLockInfo();
			return this.getAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId);
		}
		
		Game_System.prototype.isHiddenMechAbility = function(actor, abilityId) {
			var result = false;
			if(actor.SRWStats && actor.SRWStats.mech){
				var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
				result = status == "hidden" || status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.isLockedMechAbility = function(actor, abilityId) {
			var result = false;
			if(actor.SRWStats && actor.SRWStats.mech){
				var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
				result = status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.validateTransformationLockInfo = function() {
			if(!this.transformationLockInfo){
				this.transformationLockInfo = {}
			}
		}
		
		Game_System.prototype.isTransformationLocked = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(this.transformationLockInfo[mechId]){
				return this.transformationLockInfo[mechId][index];
			} else {
				return false;
			}		
		}
		
		Game_System.prototype.lockTransformation = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(!this.transformationLockInfo[mechId]){
				this.transformationLockInfo[mechId] = {};
			}
			this.transformationLockInfo[mechId][index] = true;
		}
		
		Game_System.prototype.lockAllTransformations = function() {
			this.validateTransformationLockInfo();
			for(var i = 1; i < $dataClasses.length; i++){
				var mechProperties = $dataClasses[i].meta;
				var transformsInto;
				transformsInto = mechProperties.mechTransformsInto * 1 || -1;	
				if(transformsInto == -1 && mechProperties.mechTransformsInto != null){
					try {
						transformsInto = JSON.parse(mechProperties.mechTransformsInto);
					} catch(e){
										
					}
				}
				
				if(transformsInto && transformsInto != -1){
					if(!Array.isArray(transformsInto)){
						transformsInto = [transformsInto];
					}			
				} else {
					transformsInto = [];
				}
				this.transformationLockInfo[i] = {};
				for(var j = 0; j < transformsInto.length; j++){				
					this.transformationLockInfo[i][j] = true;
				}			
			}	
		}
		
		Game_System.prototype.unlockTransformation = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(this.transformationLockInfo[mechId]){
				this.transformationLockInfo[mechId][index] = false;
			}		
		}
		
		Game_System.prototype.unlockAllTransformations = function() {
			this.validateTransformationLockInfo();
			for(var i = 1; i < $dataClasses.length; i++){
				delete this.transformationLockInfo[i];
			}	
		}
		
		Game_System.prototype.validateCombineLockInfo = function() {
			if(!this.combineLockInfo){
				this.combineLockInfo = {}
			}
		}

		Game_System.prototype.isCombineLocked = function(mechId) {
			this.validateCombineLockInfo();	
			return !!this.combineLockInfo[mechId];		
		}

		Game_System.prototype.lockCombine = function(mechId) {
			this.validateCombineLockInfo();
			this.combineLockInfo[mechId] = true;
		}

		Game_System.prototype.lockAllCombines = function() {
			this.validateCombineLockInfo();
			for(var i = 1; i < $dataClasses.length; i++){
				var mechProperties = $dataClasses[i].meta;
				if(mechProperties.mechCombinesTo){
					this.combineLockInfo[i] = true;	
				}
			}	
		}

		Game_System.prototype.unlockCombine = function(mechId, index) {
			this.validateCombineLockInfo();	
			this.combineLockInfo[mechId] = false;			
		}

		Game_System.prototype.unlockAllCombines = function() {
			this.validateCombineLockInfo();
			this.combineLockInfo = {}
		}
		
		Game_System.prototype.validateAbilityUpgradesInfo = function(type) {
			if(!this.abilityUpgradesInfo){
				this.abilityUpgradesInfo = {}
			}
			if(!this.abilityUpgradesInfo[type]){
				this.abilityUpgradesInfo[type] = {};
			}
		}
		
		Game_System.prototype.setAbilityUpgrade = function(type, baseIdx, upgradeIdx) {
			this.validateAbilityUpgradesInfo(type);
			this.abilityUpgradesInfo[type][baseIdx] = upgradeIdx;
		}
		
		Game_System.prototype.getAbilityUpgrades = function(type) {
			this.validateAbilityUpgradesInfo(type);
			return this.abilityUpgradesInfo[type];
		}
		
		Game_System.prototype.pushTextLog = function(faceName, faceIndex, text){
			if(!this.textLog){
				this.textLog = [];					
			}
			if(this.textLog.length > 250){
				this.textLog.shift();
			}
			this.textLog.push({
				faceName: faceName,
				faceIndex: faceIndex,
				text: text
			});
				
		}
		
		Game_System.prototype.validateMovesSeenInfo = function() {
			if(!this.movesSeen){
				this.movesSeen = {}
			}
		}
		
		Game_System.prototype.setMovesSeen = function(id) {
			this.validateMovesSeenInfo();
			this.movesSeen[id] = true;
		}
		
		Game_System.prototype.isMoveSeen = function(id) {
			this.validateMovesSeenInfo();
			return this.movesSeen[id];
		}
		
		Game_System.prototype.getBattleSpeed = function() {
			if($gameMap.isEventRunning() && !$gameSystem.isIntermission()){//hacky solution to game speed not being settable during the intermission
				return 1;
			}
			return this._battleSpeed || 1;
		}
		
		Game_System.prototype.setBattleSpeed = function(speed) {
			this._battleSpeed = speed;
		}
		
		Game_System.prototype.getScaledTime = function(time) {
			return time / this.getBattleSpeed();
		}
		
		Game_System.ABI_ZONE_MAX = 8;
		
		Game_System.prototype.validateAbilityZoneInfo = function(id) {
			if(!this.abilityZoneInfo){
				const initZoneInfo = (id) => {
					this.abilityZoneInfo[id] = {
						pattern: [],
						center: {x: -1, y: -1},
						followsOwner: false,
						color: null,
						ownerEventId: -1,
						abilityId: null,
						phaseCount: null,
						expires: true
					}
				}
				this.abilityZoneInfo = {};
				for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
					initZoneInfo(i);
				};		
				
			}
			
			if(!this.abilityZoneRefreshInfo){
				this.abilityZoneRefreshInfo = {};				
				for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
					this.abilityZoneRefreshInfo[i] = false;
				}
			}
			if(!this.abilityZoneAnimationsPending){
				this.abilityZoneAnimationsPending = {};
			}
		}
		
		Game_System.prototype.getAbilityZone = function(id) {
			this.validateAbilityZoneInfo();
			return this.abilityZoneInfo[id];
		}
		
		Game_System.prototype.getFreeAbilityZoneSlotCount = function(forActor) {
			this.validateAbilityZoneInfo();
			let enemyCount = 0;
			let actorCount = 0;
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].phaseCount > 0){
					let referenceEvent = $gameMap.event(this.abilityZoneInfo[i].ownerEventId);
					if(referenceEvent){
						let battlerArray = this.EventToUnit(this.abilityZoneInfo[i].ownerEventId);	
						if(battlerArray[0] == "actor"){
							actorCount++;
						} else {
							enemyCount++;
						}						
					}					
				}
			}
			if(forActor){
				return ENGINE_SETTINGS.ALLY_ZONE_COUNT - actorCount;
			} else {
				return (Game_System.ABI_ZONE_MAX - ENGINE_SETTINGS.ALLY_ZONE_COUNT)	- enemyCount;
			}						
		}
		
		Game_System.prototype.isZoneDeployed = function(trackingId) {
			this.validateAbilityZoneInfo();
			let result = false;
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].phaseCount > 0){
					if(this.abilityZoneInfo[i].trackingId == trackingId){
						result = true;
					}			
				}
			}
			return result;						
		}
		
		Game_System.prototype.canActorSetZones = function(count) {
			return this.getFreeAbilityZoneSlotCount(true) >= count;
		}
		
		Game_System.prototype.getNextAbilityZoneId = function(forActor) {
			this.validateAbilityZoneInfo();
			let id = -1;
			let ctr = 0;
			if(this.getFreeAbilityZoneSlotCount(forActor) > 0){
				while(id == -1 && ctr < Game_System.ABI_ZONE_MAX){
					if(this.abilityZoneInfo[ctr].phaseCount <= 0){
						id = ctr;
					}
					ctr++;
				}
			}
			return id;
		}
		
		Game_System.prototype.setActorAbilityZone = function(actor, params) {
			let referenceEvent = $statCalc.getReferenceEvent(actor);
			this.setEventAbilityZone(referenceEvent.eventId(), params);
		}
		
		Game_System.prototype.setEventAbilityZone = function(eventId, params) {			
			let event = $gameMap.event(eventId);
			let battlerArray = this.EventToUnit(eventId);	
			let zoneId = this.getNextAbilityZoneId(battlerArray[0] == "actor");
			if(zoneId != -1){	
				params.center = {x: event.posX(), y: event.posY()};
				params.ownerEventId = eventId;
				this.setAbilityZone(zoneId, params);							
			}			
		}
		
		Game_System.prototype.clearEventAbilityZones = function(eventId) {
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].ownerEventId == eventId){
					this.abilityZoneInfo[i].phaseCount = 0;
					this.setAbilityZoneNeedsRefresh(i);
				}				
			}			
		}
		
		Game_System.prototype.setAbilityZone = function(id, params) {
			this.validateAbilityZoneInfo();
			if(id < 0 || id >= Game_System.ABI_ZONE_MAX){
				throw("Invalid ability zone id("+id+") used during init");
			}
			let pattern = $patternManager.getDefinition(params.pattern).tiles || [];			
			this.abilityZoneInfo[id] = {
				pattern: pattern,
				center: params.center || {x: -1, y: -1},
				followsOwner: params.followsOwner || false,
				color: params.color || "#FFFFFF",
				ownerEventId: params.ownerEventId,
				abilityId: params.abilityId,
				phaseCount: params.phaseCount || 1,
				expires: params.expires || false,
				trackingId: params.trackingId
			}
			$gameSystem.setAbilityZoneNeedsRefresh(id);
		}
		
		Game_System.prototype.setAbilityZoneNeedsRefresh = function(id) {
			this.validateAbilityZoneInfo();
			this.abilityZoneAnimationsPending[id] = true;
			this.abilityZoneRefreshInfo[id] = true;
			
			$statCalc.invalidateZoneCache();
		}
		
		Game_System.prototype.clearAbilityZoneNeedsRefresh = function(id) {
			this.validateAbilityZoneInfo();
			this.abilityZoneRefreshInfo[id] = false;
		}
		
		Game_System.prototype.clearAbilityZoneAnimationPending = function(id) {
			this.validateAbilityZoneInfo();
			delete this.abilityZoneAnimationsPending[id];
		}
		
		Game_System.prototype.hasAbilityZoneAnimPending = function(id) {
			return Object.keys(this.abilityZoneAnimationsPending).length > 0;
		}
		
		Game_System.prototype.abilityZoneNeedsRefresh = function(id) {
			this.validateAbilityZoneInfo();
			return this.abilityZoneRefreshInfo[id];
		}
		
		Game_System.prototype.expireAbilityZones = function(checkOnly) {
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].phaseCount > 0){
					if(!checkOnly){
						if(this.abilityZoneInfo[i].expires){
							this.abilityZoneInfo[i].phaseCount--;
						}
						if(this.abilityZoneInfo[i].phaseCount <= 0){				
							this.setAbilityZoneNeedsRefresh(i);												
						}
					}					
					
					if(this.abilityZoneInfo[i].ownerEventId != -1){
						let referenceEvent = $gameMap.event(this.abilityZoneInfo[i].ownerEventId);
						if(referenceEvent && referenceEvent.isErased()){
							this.abilityZoneInfo[i].phaseCount = 0;
							this.setAbilityZoneNeedsRefresh(i);
						}
					}
				}				
			}
		}
		
		Game_System.prototype.resetAbilitZones = function() {
			delete this.abilityZoneInfo;			
			delete this.abilityZoneRefreshInfo;
			delete this.abilityZoneAnimationsPending;
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				this.setAbilityZoneNeedsRefresh(i);				
			}
			this.validateAbilityZoneInfo();
			
		}

		Game_System.prototype.updateAbilityZones = function(eventId) {
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].phaseCount > 0 && this.abilityZoneInfo[i].ownerEventId == eventId && this.abilityZoneInfo[i].followsOwner){
					let referenceEvent = $gameMap.event(eventId);
					if(referenceEvent){
						this.abilityZoneInfo[i].center = {x: referenceEvent.posX(), y: referenceEvent.posY()};
					}
					this.setAbilityZoneNeedsRefresh(i);					
				}
			}
		}

		Game_System.prototype.getActiveAbilityZoneTiles = function() {
			let result = {};
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				let zoneInfo = this.abilityZoneInfo[i];
				if(zoneInfo.phaseCount > 0){
					let center = zoneInfo.center;
					for(var j = 0; j < zoneInfo.pattern.length; j++){
						let x = center.x + zoneInfo.pattern[j].x;
						let y = center.y + zoneInfo.pattern[j].y;
						if(!result[x]){
							result[x] = {};
						}
						if(!result[x][y]){
							result[x][y] = [];
						}
						result[x][y].push(zoneInfo);
					}			
				}
			}
			return result;
		}

		Game_System.prototype.eventHasZone = function(eventId) {
			let result = false;
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				if(this.abilityZoneInfo[i].phaseCount > 0 && this.abilityZoneInfo[i].ownerEventId == eventId){
					result = true;				
				}
			}
			return result;
		}	

		Game_System.prototype.getActiveZonesAtTile = function(coords) {
			let result = [];
			this.validateAbilityZoneInfo();
			for(var i = 0; i < Game_System.ABI_ZONE_MAX; i++){
				let zoneInfo = this.abilityZoneInfo[i];
				if(zoneInfo.phaseCount > 0){
					let center = zoneInfo.center;
					for(var j = 0; j < zoneInfo.pattern.length; j++){
						let x = center.x + zoneInfo.pattern[j].x;
						let y = center.y + zoneInfo.pattern[j].y;
						if(x == coords.x && y == coords.y){
							result.push(this.abilityZoneInfo[i]);
						}
					}	
				}
			}
			return result;
		}		
		
		Game_System.prototype.isZoneActiveAtTile = function(coords) {
			return this.getActiveZonesAtTile(coords).length > 0;
		}
		
		Game_System.prototype.checkcolorSubstitutionKit = function() {
			if(!this._currentColorSubstitutions){
				this._currentColorSubstitutions = new Uint32Array([
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					
					0, 0, 0,/*||*/0, 0, 0, 					
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
					0, 0, 0,/*||*/0, 0, 0, 
				]);
			}
			if(this._currentColorSubstitutions.constructor != Uint32Array){
				this._currentColorSubstitutions = new Uint32Array(Object.values(this._currentColorSubstitutions));
			}			
			
			if(!this._colorCycles){
				this._colorCycles = {
					0: {
						running: false,
						lastUpdate: -1,
						colors: [],
						delay: -1,
						cycle: 0
					},
					1: {
						running: false,
						lastUpdate: -1,
						colors: [],
						delay: -1,
						cycle: 0
					},
					2: {
						running: false,
						lastUpdate: -1,
						colors: [],
						delay: -1,
						cycle: 0
					},
				};
			}
		}
		
		Game_System.prototype.getColorSubstitutions = function() {
			this.checkcolorSubstitutionKit();
			return this._currentColorSubstitutions;
		}
		
		Game_System.prototype.registerColorCycle = function(id, colors, delay) {
			this.checkcolorSubstitutionKit();
			if(id >= 0 && id < 3 ){
				let tmp = [];
				let isComplexCycle = false;
				for(let color of colors){
					if(typeof color == "object"){
						let lookup = {};
						for(let searchColor in color.colors){
							lookup[searchColor.replace("#", "")] = color.colors[searchColor].replace("#", "");
						}
						color.colors = lookup;
						tmp.push(color);
						isComplexCycle = true;
					} else {
						tmp.push(color.replace("#", ""));
					}
					
				}
				if(isComplexCycle && tmp[0]){
					delay = tmp[0].delay;
				}
				this._colorCycles[id] = {
					running: true,
					lastUpdate: Date.now(),
					colors: tmp,
					delay: delay || 250,
					isComplexCycle: isComplexCycle,
					cycle: 0
				}
			}			
		}	

		Game_System.prototype.stopColorCycle = function(id) {
			this.checkcolorSubstitutionKit();
			if(id >= 0 && id < 3){
				this._colorCycles[id].running = false;
			}
		}	
		
		Game_System.prototype.updateColorCycles = function() {
			const _this = this;
			
			function registerColorTranslation(baseOffset, entryOffset, currentColor, targetColor){
				let currentR = Number("0x"+currentColor.substring(0, 2), 10);
				let currentG = Number("0x"+currentColor.substring(2, 4), 10);
				let currentB = Number("0x"+currentColor.substring(4), 10);
				
				let targetR = Number("0x"+targetColor.substring(0, 2), 10);
				let targetG = Number("0x"+targetColor.substring(2, 4), 10);
				let targetB = Number("0x"+targetColor.substring(4), 10);
				
				
				_this._currentColorSubstitutions[baseOffset + entryOffset + 0] = currentR;
				_this._currentColorSubstitutions[baseOffset + entryOffset + 1] = currentG;
				_this._currentColorSubstitutions[baseOffset + entryOffset + 2] = currentB;
				
				_this._currentColorSubstitutions[baseOffset + entryOffset + 3] = targetR;
				_this._currentColorSubstitutions[baseOffset + entryOffset + 4] = targetG;
				_this._currentColorSubstitutions[baseOffset + entryOffset + 5] = targetB;
			}
			
			this.checkcolorSubstitutionKit();
			for(let cycleId in _this._colorCycles){
				let cycleInfo = _this._colorCycles[cycleId];
				let timeStamp = Date.now();
				if(timeStamp - cycleInfo.delay >= cycleInfo.lastUpdate){
					cycleInfo.lastUpdate = timeStamp;
					cycleInfo.cycle++;
					if(cycleInfo.cycle >= cycleInfo.colors.length){
						cycleInfo.cycle = 0;
					}
				}		
				const baseOffset = cycleId * 24;	
				if(cycleInfo.isComplexCycle) {
					let frameInfo = cycleInfo.colors[cycleInfo.cycle];
					cycleInfo.delay = frameInfo.delay;
					let ctr = 0;					
					for(let searchColor in frameInfo.colors){
						let targetColor = frameInfo.colors[searchColor];						
						const entryOffset = (ctr++) * 6;
						registerColorTranslation(baseOffset, entryOffset, searchColor, targetColor);
					}
				} else {
					for(var i = 0; i < 4; i++){
						let currentColor = "000000";
						let targetColor = "000000";
						if(cycleInfo.running && i < cycleInfo.colors.length){
							currentColor = String(cycleInfo.colors[i]);
							let targetColorIdx = (i + cycleInfo.cycle) % cycleInfo.colors.length;
							targetColor = String(cycleInfo.colors[targetColorIdx]);
						}
						const entryOffset = i * 6;
						registerColorTranslation(baseOffset, entryOffset, currentColor, targetColor);
					}
				}					
			}		
		}
		
		Game_System.INTERACTION_STATUS = "status";
		Game_System.INTERACTION_DAMAGE = "damage";
		Game_System.INTERACTION_DAMAGE_AND_STATUS = "damage_and_status";
		
		Game_System.prototype.getCombatInteractionInfo = function(weapon) {
			const isBetweenFriendlies = this.areUnitsFriendly($gameTemp.currentBattleActor, $gameTemp.currentBattleEnemy);
			let interactionType;
			if(weapon){
				if(!isBetweenFriendlies){
					interactionType = weapon.enemiesInteraction;
				} else {  
					interactionType = weapon.alliesInteraction;
				}
			}
			
			return {
				isBetweenFriendlies: isBetweenFriendlies,
				interactionType: interactionType
			};
		}
		
		Game_System.prototype.awardFavPoints = function(amount) {
			if(!this.favPoints){
				this.favPoints = 0;
			}
			this.favPoints+=(amount * 1);
		}
		
		Game_System.prototype.getCurrentFavPoints = function(weapon) {
			if(!this.favPoints){
				this.favPoints = 0;
			}
			return this.favPoints;
		}
		
		Game_System.prototype.setPreferredSuperState = function(actor, state) {
			if(!this.preferredSuperStates){
				this.preferredSuperStates = {};
			}
			if(actor.actorId){
				this.preferredSuperStates[actor.actorId()] = state;
			}
			
		}
		
		Game_System.prototype.getPreferredSuperState = function(actor) {
			if(!this.preferredSuperStates){
				this.preferredSuperStates = {};
			}
			if(actor.actorId){
				return this.preferredSuperStates[actor.actorId()];
			}
		}
		
		
	}