	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		//====================================================================
		// ●Game_Temp
		//====================================================================
		//初期化処理
		var _SRPG_Game_Temp_initialize = Game_Temp.prototype.initialize;
		Game_Temp.prototype.initialize = function() {
			_SRPG_Game_Temp_initialize.call(this);
			this._MoveTable = [];
			this._MoveList = [];
			this._RangeTable = [];
			this._RangeList = [];
			this._ResetMoveList = false;
			this._SrpgDistance = 0;
			this._SrpgSpecialRange = true;
			this._ActiveEvent = null;
			this._TargetEvent = null;
			this._OriginalPos = [];
			this._SrpgEventList = [];
			this._autoMoveDestinationValid = false;
			this._autoMoveDestinationX = -1;
			this._autoMoveDestinationY = -1;
			this._srpgLoadFlag = false;
			this._srpgActorEquipFlag = false;
			this._SrpgTurnEndFlag = false;
			this._srpgBestSearchFlag = false;
			this._srpgBestSearchRoute = [null, []];
			this._srpgPriorityTarget = null;
			this._mapButtons = {};
			this.summariesTimeout = 0;
		};
		
		Game_Temp.prototype.isEnemyTurn = function() {
			return $gameSystem.isBattlePhase() === 'AI_phase';
		}
		
		Game_Temp.prototype.killMenu = function(id) {
			if(!this.killMenus){
				this.killMenus = {};
			}
			this.killMenus[id] = true;
		}
		
		Game_Temp.prototype.setMapButton = function(button) {
			this._mapButtons[button] = true;
		};
		
		Game_Temp.prototype.clearMapButton = function(button) {
			delete this._mapButtons[button];
		};
		
		Game_Temp.prototype.mapButtonClicked = function(button) {
			return this._mapButtons[button];
		};
		
		//移動範囲と移動経路を記録する配列変数を返す
		Game_Temp.prototype.MoveTable = function(x, y) {
			return this._MoveTable[x][y];
		};

		//移動範囲を設定する
		Game_Temp.prototype.setMoveTable = function(x, y, move, route) {
			this._MoveTable[x][y] = [move, route];
		};

		//攻撃射程と計算経路を記録する配列変数を返す
		Game_Temp.prototype.RangeTable = function(x, y) {
			return this._RangeTable[x][y];
		};

		//攻撃射程を設定する
		Game_Temp.prototype.setRangeTable = function(x, y, move, route) {
			this._RangeTable[x][y] = [move, route];
		};

		//移動可能な座標のリストを返す(移動範囲表示で使用)
		Game_Temp.prototype.moveList = function() {
			return this._MoveList;
		};

		//移動可能な座標のリストに追加する
		Game_Temp.prototype.pushMoveList = function(xy) {
			this._MoveList.push(xy);
		};

		//座標リストにデータが入っているか返す
		Game_Temp.prototype.isMoveListValid = function() {
			return this._MoveList.length > 0;
		};

		//攻撃可能な座標のリストを返す(攻撃射程表示で使用)
		Game_Temp.prototype.rangeList = function() {
			return this._RangeList;
		};

		//攻撃可能な座標のリストに追加する
		Game_Temp.prototype.pushRangeList = function(xy) {
			this._RangeList.push(xy);
		};

		//移動範囲の配列に射程範囲の配列を結合する
		Game_Temp.prototype.pushRangeListToMoveList = function(array) {
			Array.prototype.push.apply(this._MoveList, this._RangeList);
		};

		//射程範囲から最低射程を除く
		Game_Temp.prototype.minRangeAdapt = function(oriX, oriY, minRange) {
			var newList = [];
			for (var i = 0; i < this._RangeList.length; i++) {
				var x = this._RangeList[i][0];
				var y = this._RangeList[i][1];
				var dis = Math.abs(x - oriX) + Math.abs(y - oriY);
				if (dis >= minRange) {
					newList.push(this._RangeList[i]);
				}
			}
			this._RangeList = [];
			this._RangeList = newList;
		};

		//移動範囲を初期化する
		Game_Temp.prototype.clearMoveTable = function() {
			$gameTemp.validTiles = {};
			$gameSystem.highlightedTiles = [];
			$gameSystem.highlightedActionTiles = [];
			$gameSystem.highlightsRefreshed = true;
			$gameTemp.disableHighlightGlow = false;
			
			$gameSystem.showMoveEdge = false;
			$gameSystem.moveEdgeHighlightsRefreshed = true;
			$gameSystem.moveEdgeHighlights = [];
			
			this._MoveTable = [];
			this._MoveList = [];
			for (var i = 0; i < $dataMap.width; i++) {
			  var vartical = [];
			  for (var j = 0; j < $dataMap.height; j++) {
				vartical[j] = [-1, []];
			  }
			  this._MoveTable[i] = vartical;
			}
			this._RangeTable = [];
			this._RangeList = [];
			for (var i = 0; i < $dataMap.width; i++) {
			  var vartical = [];
			  for (var j = 0; j < $dataMap.height; j++) {
				vartical[j] = [-1, []];
			  }
			  this._RangeTable[i] = vartical;
			}
		};

		//移動範囲のスプライト消去のフラグを返す
		Game_Temp.prototype.resetMoveList = function() {
			return this._ResetMoveList;
		};

		//移動範囲のスプライト消去のフラグを設定する
		Game_Temp.prototype.setResetMoveList = function(flag) {
			this._ResetMoveList = flag;
		};

		//自身の直下は常に歩けるようにする
		Game_Temp.prototype.initialMoveTable = function(oriX, oriY, oriMove) {
			this.setMoveTable(oriX, oriY, oriMove, [0]);
			this.pushMoveList([oriX, oriY, false]);
		}

		//自身の直下は常に攻撃射程に含める
		Game_Temp.prototype.initialRangeTable = function(oriX, oriY, oriMove) {
			this.setRangeTable(oriX, oriY, oriMove, [0]);
			this.pushRangeList([oriX, oriY, true]);
		}

		//攻撃ユニットと対象の距離を返す
		Game_Temp.prototype.SrpgDistance = function() {
			return this._SrpgDistance;
		};

		//攻撃ユニットと対象の距離を設定する
		Game_Temp.prototype.setSrpgDistance = function(val) {
			this._SrpgDistance = val;
		};

		//攻撃ユニットと対象が特殊射程内にいるかを返す
		Game_Temp.prototype.SrpgSpecialRange = function() {
			return this._SrpgSpecialRange;
		};

		//攻撃ユニットと対象が特殊射程内にいるかを設定する
		Game_Temp.prototype.setSrpgSpecialRange = function(val) {
			this._SrpgSpecialRange = val;
		};

		//アクティブイベントの設定
		Game_Temp.prototype.activeEvent = function() {
			return this._ActiveEvent;
		};

		Game_Temp.prototype.setActiveEvent = function(event) {
			this._ActiveEvent = event;
			$gameVariables.setValue(_activeEventID, event.eventId());
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			if(actor.isActor()){
				$gameVariables.setValue(_currentActorId, actor.actorId());
			} else {
				$gameVariables.setValue(_currentEnemyId, actor.enemyId());
			}		
		};

		Game_Temp.prototype.clearActiveEvent = function() {
			this._ActiveEvent = null;
			$gameVariables.setValue(_activeEventID, 0);
		};

		//行動対象となるユニットの設定
		Game_Temp.prototype.targetEvent = function() {
			return this._TargetEvent;
		};

		Game_Temp.prototype.setTargetEvent = function(event) {
			this._TargetEvent = event;
			if (this._TargetEvent) {
				$gameVariables.setValue(_targetEventID, event.eventId());
				var actor = $gameSystem.EventToUnit(event.eventId())[1];
				if(actor.isActor()){
					$gameVariables.setValue(_currentActorId, actor.actorId());
				} else {
					$gameVariables.setValue(_currentEnemyId, actor.enemyId());
				}	
			}
		};

		Game_Temp.prototype.clearTargetEvent = function() {
			this._TargetEvent = null;
			$gameVariables.setValue(_targetEventID, 0);
		};

		//アクティブイベントの座標を返す
		Game_Temp.prototype.originalPos = function() {
			return this._OriginalPos;
		};

		//アクティブイベントの座標を記録する
		Game_Temp.prototype.reserveOriginalPos = function(x, y) {
			this._OriginalPos = [x, y];
		};

		//実行待ちイベントリストを確認する
		Game_Temp.prototype.isSrpgEventList = function() {
			return this._SrpgEventList.length > 0;
		};

		//実行待ちイベントリストを追加する
		Game_Temp.prototype.pushSrpgEventList = function(event) {
			this._SrpgEventList.push(event);
		};

		//実行待ちイベントリストの先頭を取得し、前に詰める
		Game_Temp.prototype.shiftSrpgEventList = function() {
			var event = this._SrpgEventList[0];
			this._SrpgEventList.shift();
			return event;
		};

		//プレイヤーの自動移動フラグを返す
		Game_Temp.prototype.isAutoMoveDestinationValid = function() {
			return this._autoMoveDestinationValid;
		};

		//プレイヤーの自動移動フラグを設定する
		Game_Temp.prototype.setAutoMoveDestinationValid = function(val) {
			this._autoMoveDestinationValid = val;
		};

		//プレイヤーの自動移動先を返す(X)
		Game_Temp.prototype.autoMoveDestinationX = function() {
			return this._autoMoveDestinationX;
		};

		//プレイヤーの自動移動先を返す(Y)
		Game_Temp.prototype.autoMoveDestinationY = function() {
			return this._autoMoveDestinationY;
		};

		//プレイヤーの自動移動先を設定する
		Game_Temp.prototype.setAutoMoveDestination = function(x, y) {
			this._autoMoveDestinationX = x;
			this._autoMoveDestinationY = y;
		};

		//戦闘中にロードしたフラグを返す
		Game_Temp.prototype.isSrpgLoadFlag = function() {
			return this._srpgLoadFlag;
		};

		//戦闘中にロードしたフラグを設定する
		Game_Temp.prototype.setSrpgLoadFlag = function(flag) {
			this._srpgLoadFlag = flag;
		};

		//ターン終了フラグを返す
		Game_Temp.prototype.isTurnEndFlag = function() {
			return this._SrpgTurnEndFlag;
		};

		//ターン終了フラグを変更する
		Game_Temp.prototype.setTurnEndFlag = function(flag) {
			this._SrpgTurnEndFlag = flag;
		};

		//オート戦闘フラグを返す
		Game_Temp.prototype.isAutoBattleFlag = function() {
			return this._SrpgAutoBattleFlag;
		};

		//オート戦闘フラグを変更する
		Game_Temp.prototype.setAutoBattleFlag = function(flag) {
			this._SrpgAutoBattleFlag = flag;
		};

		//アクターコマンドから装備を呼び出したフラグを返す
		Game_Temp.prototype.isSrpgActorEquipFlag = function() {
			return this._srpgActorEquipFlag;
		};

		//アクターコマンドから装備を呼び出したフラグを設定する
		Game_Temp.prototype.setSrpgActorEquipFlag = function(flag) {
			this._srpgActorEquipFlag = flag;
		};

		//探索用移動範囲計算時の実行フラグを返す
		Game_Temp.prototype.isSrpgBestSearchFlag = function() {
			return this._srpgBestSearchFlag;
		};

		//探索用移動範囲計算時の実行フラグを設定する
		Game_Temp.prototype.setSrpgBestSearchFlag = function(flag) {
			this._srpgBestSearchFlag = flag;
		};

		//探索用移動範囲計算時の最適ルートを返す
		Game_Temp.prototype.isSrpgBestSearchRoute = function() {
			return this._srpgBestSearchRoute;
		};

		//探索用移動範囲計算時の最適ルートを設定する
		Game_Temp.prototype.setSrpgBestSearchRoute = function(array) {
			this._srpgBestSearchRoute = array;
		};

		//優先ターゲットを返す
		Game_Temp.prototype.isSrpgPriorityTarget = function() {
			return this._srpgPriorityTarget;
		};

		//優先ターゲットを設定する
		Game_Temp.prototype.setSrpgPriorityTarget = function(event) {
			this._srpgPriorityTarget = event;
		};
		
		Game_Temp.prototype.isMapTarget = function(eventId) {
			var result = false;
			if(this.currentMapTargets){
				for(var i = 0; i < this.currentMapTargets.length; i++){
					if($statCalc.getReferenceEvent(this.currentMapTargets[i]).eventId() == eventId){
						result = true;
					}
				}
			}
			return result;
		};
		
		Game_Temp.prototype.isSpiritTarget = function(eventId) {
			var result = false;
			if($gameTemp.currentTargetingSpirit){
				var spiritDef = $spiritManager.getSpiritDef($gameTemp.currentTargetingSpirit.idx);
				var actorInfo = $gameSystem.EventToUnit(eventId);
				if(actorInfo){
					var target = actorInfo[1];
					if (($gameSystem.isFriendly(target, "player") && spiritDef.targetType == "ally") || (!$gameSystem.isFriendly(target, "player")  && spiritDef.targetType == "enemy")) {						
						if(spiritDef.singleTargetEnabledHandler(target)){
							return true;
						}
					}
				}
			}
			return result;
		};
		
		Game_Temp.prototype.updatePlayerSpriteVisibility = function(id) {
			if($gameSystem.isSRPGMode()){
				if(this.upperPlayerSprite){
					this.upperPlayerSprite.show();
				}
				if(this.lowerPlayerSprite){
					this.lowerPlayerSprite.hide();
				}
			} else {
				if(this.upperPlayerSprite){
					this.upperPlayerSprite.hide();
				}
				if(this.lowerPlayerSprite){
					this.lowerPlayerSprite.show();
				}
			}
		}
		
		Game_Temp.prototype.clearActiveShip = function() {
			if(this.activeShip){
				delete this.activeShip.event.isActiveShip;
			}
			this.activeShip = null;
		}
	}