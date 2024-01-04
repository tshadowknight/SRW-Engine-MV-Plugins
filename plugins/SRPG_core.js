//=============================================================================
// SRPG_core.js -SRPGコンバータMV-
// バージョン   : 1.22
// 最終更新日   : 2019/8/23
// 制作         : 神鏡学斗
// 配布元       : http://www.lemon-slice.net/
// バグ修正協力 : アンチョビ様　
//                エビ様　http://www.zf.em-net.ne.jp/~ebi-games/
//                Tsumio様
// Copyright 2017 - 2019 Lemon slice all rights reserved.
//-----------------------------------------------------------------------------
// SRW Engine MV
// Version   : 1.0
// Copyright 2020 The Shadow Knight all rights reserved.
//-----------------------------------------------------------------------------
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//=============================================================================

//global reference to the filesystem module to circumvent issues with webpacked sections(battle scene)


function getBase(){
	var base = "./";
	
	return base;
}

//disable touch support


TouchInput.update = function() {
	if(typeof ENGINE_SETTINGS != "undefined" && !ENGINE_SETTINGS.DISABLE_TOUCH){
		this._triggered = this._events.triggered;
		this._cancelled = this._events.cancelled;
		this._moved = this._events.moved;
		this._released = this._events.released;
		this._wheelX = this._events.wheelX;
		this._wheelY = this._events.wheelY;
		this._events.triggered = false;
		this._events.cancelled = false;
		this._events.moved = false;
		this._events.released = false;
		this._events.wheelX = 0;
		this._events.wheelY = 0;
		if (this.isPressed()) {
			this._pressedTime++;
		}
	}
}

//

var windowOffset = 0;
 
//Control variable ids 
var _nextMapVariable = 6;
var _nextMapXVariable = 7;
var _nextMapYVariable = 8;
var _nextMapDeployVariable = 9;
var _SRCountVariable = 10;
var _lastStageIdVariable = 11;
var _turnCountVariable = 12;

var _currentActorId = 13;
var _currentEnemyId = 14;

var _actorsDestroyed = 15;
var _enemiesDestroyed = 16;

var _masteryConditionText = 17;
var _victoryConditionText = 18;
var _defeatConditionText = 19;

var _existShipVarId = 20;

var _lastActorAttackId = 61;
var _lastActorSupportAttackId = 62;
var _lastEnemyAttackId = 63;
var _lastEnemySupportAttackId = 64;



var $SRWEditor = new SRWEditor();

var $SRWGameState = new GameStateManager();
$SRWGameState.requestNewState("normal");

var $SRWStageInfoManager = new SRWStageInfoManager();
var $SRWSaveManager = new SRWSaveManager();
var $statCalc = new StatCalc();
var $spiritManager = new SpiritManager(); 
var $pilotAbilityManager = new PilotAbilityManager(); 
var $mechAbilityManager = new MechAbilityManager(); 
var $itemEffectManager = new ItemEffectManager(); 
var $abilityCommandManger = new AbilityCommandManger();
var $weaponEffectManager = new WeaponEffectManager();
var $relationshipBonusManager = new RelationshipBonusManager();
var $battleCalc = new BattleCalc();
var $CSSUIManager = new CSSUIManager();
var $songManager = new SRWSongManager();
var $mapAttackManager = new MapAttackManager();
var $patternManager = new PatternManager();
var $abilityZoneManager = new AbilityZoneManager();

var $inventoryManager = new SRWInventoryManager();
var $equipablesManager = new SRWEquipablesManager();

var $terrainTypeManager = new TerrainTypeManager();

var $scriptCharactersLoader = new ScriptCharactersLoader();
var $deployActionsLoader = new DeployActionsLoader();
 
var $battleSceneManager = new BattleSceneManager();

var parameters = PluginManager.parameters('SRPG_core');
var _srpgTroopID = Number(parameters['srpgTroopID'] || 1);
var _srpgBattleSwitchID = Number(parameters['srpgBattleSwitchID'] || 1);
var _endIntermissionSwitchID = 3;
var _inIntermissionSwitchID = 4;
var _existActorVarID = Number(parameters['existActorVarID'] || 1);
var _existEnemyVarID = Number(parameters['existEnemyVarID'] || 2);

var _turnVarID = Number(parameters['turnVarID'] || 3);
var _activeEventID = Number(parameters['activeEventID'] || 4);
var _targetEventID = Number(parameters['targetEventID'] || 5);
var _defaultMove = Number(parameters['defaultMove'] || 4);
var _srpgBattleExpRate = Number(parameters['srpgBattleExpRate'] || 0.4);
var _srpgBattleExpRateForActors = Number(parameters['srpgBattleExpRateForActors'] || 0.1);
var _enemyDefaultClass = parameters['enemyDefaultClass'] || 'エネミー';
var _textSrpgEquip = parameters['textSrpgEquip'] || '装備';
var _textSrpgMove = parameters['textSrpgMove'] || '移動力';
var _textSrpgRange = parameters['textSrpgRange'] || '射程';
var _textSrpgWait = parameters['textSrpgWait'] || '待機';
var _textSrpgTurnEnd = parameters['textSrpgTurnEnd'] || 'ターン終了';
var _textSrpgAutoBattle = parameters['textSrpgAutoBattle'] || 'オート戦闘';
var _srpgBattleQuickLaunch = parameters['srpgBattleQuickLaunch'] || 'true';
var _srpgActorCommandEquip = parameters['srpgActorCommandEquip'] || 'true';
var _srpgBattleEndAllHeal = parameters['srpgBattleEndAllHeal'] || 'true';
var _srpgStandUnitSkip = parameters['srpgStandUnitSkip'] || 'false';
var _srpgPredictionWindowMode = Number(parameters['srpgPredictionWindowMode'] || 1);
var _srpgAutoBattleStateId = Number(parameters['srpgAutoBattleStateId'] || 14);
var _srpgBestSearchRouteSize = Number(parameters['srpgBestSearchRouteSize'] || 20);
var _srpgDamageDirectionChange = parameters['srpgDamageDirectionChange'] || 'true';
var _defaultPlayerSpeed = parameters['defaultPlayerSpeed'] || 4;


(function() {
	
	Input._isEscapeCompatible = function(keyName) {
		return keyName === 'cancel';
	};
	
	Input._shouldPreventDefault = function(keyCode) {
		if($gameTemp && $gameTemp.editMode){
			return false;
		} else {
			switch (keyCode) {
				case 8:     // backspace
				case 33:    // pageup
				case 34:    // pagedown
				case 37:    // left arrow
				case 38:    // up arrow
				case 39:    // right arrow
				case 40:    // down arrow
					return true;
			}
		}		
		return false;
	};
	
	/*Input._pollGamepads = function() {
		if (navigator.getGamepads) {
			var gamepads = navigator.getGamepads();
			if (gamepads) {
				for (var i = 0; i < gamepads.length; i++) {
					var gamepad = gamepads[i];
					if (gamepad && gamepad.connected && gamepad.id == "Xbox 360 Controller (XInput STANDARD GAMEPAD)") {
						this._updateGamepadState(gamepad);
					}
				}
			}
		}
	};*/
	
	TouchInput._onWheel = function(event) {
		
	}
	
	Graphics._createAllElements = function() {
		this._createErrorPrinter();
		this._createCanvas();
		this._createVideo();
		this._createUpperCanvas();
		this._createRenderer();
		this._createFPSMeter();
		this._createModeBox();
		this._createGameFontLoader();
		
		$CSSUIManager.initAllWindows();	
		$battleSceneManager.initContainer();			
	};
	

	
	Graphics.render = function(stage) {
		if (this._skipCount <= 0) { //fix for rare freezes
			var startTime = Date.now();
			if (stage) {
				this._renderer.render(stage);
				if (this._renderer.gl && this._renderer.gl.flush) {
					this._renderer.gl.flush();
				}
			}
			var endTime = Date.now();
			var elapsed = endTime - startTime;
			this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip);
			this._rendered = true;
		} else {
			this._skipCount--;
			this._rendered = false;
		}
		this.frameCount++;
	};
	

	var Graphics_updateCanvas = Graphics._updateCanvas;
	Graphics._updateCanvas = function(windowId){
		Graphics_updateCanvas.call(this);
		if(!$gameTemp || !$gameTemp.editMode){
			var battleScenePIXILayer = document.querySelector("#battle_scene_pixi_layer");
			if(battleScenePIXILayer){
				battleScenePIXILayer.width = this._width;
				battleScenePIXILayer.height = this._height;
				this._centerElement(battleScenePIXILayer);
			}	
			var customUILayer = document.querySelector("#custom_UI_layer");
			if(customUILayer){
				customUILayer.width = this._width;
				customUILayer.height = this._height;
				this._centerElement(customUILayer);
			}
			var battleSceneLayer = document.querySelector("#battle_scene_layer");
			if(battleSceneLayer){
				battleSceneLayer.width = this._width;
				battleSceneLayer.height = this._height;
				this._centerElement(battleSceneLayer);
			}	
			var battleSceneUILayer = document.querySelector("#battle_scene_ui_layer");
			if(battleSceneUILayer){
				battleSceneUILayer.width = this._width;
				battleSceneUILayer.height = this._height;
				this._centerElement(battleSceneUILayer);
			}	
			var fadeContainer = document.querySelector("#fade_container");
			if(fadeContainer){
				fadeContainer.width = this._width;
				fadeContainer.height = this._height;
				this._centerElement(fadeContainer);
			}	
			var movieContainer = document.querySelector("#battle_scene_movie_layer");
			if(movieContainer){
				movieContainer.width = this._width;
				movieContainer.height = this._height;
				this._centerElement(movieContainer);
			}
		}	
		$CSSUIManager.updateScaledText(windowId);				
	}
	
	ImageManager.getTranslationInfo = function(filename){	
		if(filename){
			if($gameSystem.faceAliases && $gameSystem.faceAliases[filename]){
			filename = $gameSystem.faceAliases[filename];
			}
			if(ENGINE_SETTINGS.variableUnitPortraits && !$gameSystem.disableVariablePortraits){
				var keyParts = filename.split("_");
				keyParts.pop();
				var variablePortraitKey = keyParts.join("_");
				var defs = ENGINE_SETTINGS.variableUnitPortraits[variablePortraitKey];
				if(defs){
					var translationFound = false;
					var ctr = 0;
					while(ctr < defs.length && !translationFound){
						var def = defs[ctr];
						var mechId = def.deployedId;
						if($statCalc.isMechDeployed(mechId)){
							translationFound = true;
							filename = def.filename;
						}
						ctr++;
					}
				}			
			}
		}		
		return filename;
	}
	
	ImageManager.loadFace = function(filename, hue, noTranslation) {
		if(!noTranslation){
			filename = this.getTranslationInfo(filename); 
		}		
		return this.loadBitmap('img/faces/', filename, hue, true);
	};	
	
	ImageManager.requestFace = function(filename, hue) {		
		filename = this.getTranslationInfo(filename); 		
		return this.requestBitmap('img/faces/', filename, hue, true);
	};
	
	ImageManager.reserveFace = function(filename, hue, reservationId) {
		filename = this.getTranslationInfo(filename); 
		return this.reserveBitmap('img/faces/', filename, hue, true, reservationId);
	};
	
	ImageManager.loadNormalBitmap = function(path, hue, asBlob) {
		var key = this._generateCacheKey(path, hue);
		var bitmap = this._imageCache.get(key);
		if (!bitmap || asBlob) {
			bitmap = Bitmap.load(decodeURIComponent(path));
			//if the bitmap is set to asBlob the blob for the associated object url is not cleared after creation of the internal canvas
			//this mode is required when loading battle scene resources as the associated blob is used to create the texture
			bitmap.asBlob = asBlob;
			bitmap.addLoadListener(function() {
				bitmap.rotateHue(hue);
			});
			this._imageCache.add(key, bitmap);
		}else if(!bitmap.isReady()){
			bitmap.decode();
		}

		return bitmap;
	};

	ImageManager.loadBitmapPromise = async function(folder, filename, asBlob, hue, smooth) {
		return new Promise((resolve, reject) => {
			if (filename) {
				var path = folder + encodeURIComponent(filename);
				var bitmap = this.loadNormalBitmap(path, hue || 0, asBlob);
				bitmap.smooth = smooth;
				bitmap.addLoadListener(() => {
					resolve(bitmap);
				});
				bitmap.setErrorHandler(() => {
					resolve(-1);
				});
			} else {
				resolve(this.loadEmptyBitmap());
			}	
		});		
	};	
	
	/**
	 * @method _onError
	 * @private
	 */
	Bitmap.prototype._onError = function() {
		if(this._errorHandler){
			this._errorHandler();
		}
		this._image.removeEventListener('load', this._loadListener);
		this._image.removeEventListener('error', this._errorListener);
		this._loadingState = 'error';
	};
	
	Bitmap.prototype.setErrorHandler = function(func) {
		this._errorHandler = func;
	};
	
	Bitmap.prototype._requestImage = function(url){
		if(Bitmap._reuseImages.length !== 0){
			this._image = Bitmap._reuseImages.pop();
		}else{
			this._image = new Image();
		}

		if (this._decodeAfterRequest && !this._loader) {
			this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
		}

		this._image = new Image();
		this._url = url;
		
		//always go into the decryptor and load the image as blob instead of using a different path for non-encrypted images.
		//this is so the blob itself can be preserved for components that use it directly like the battle scene
		this._loadingState = 'decrypting';
		Decrypter.decryptImg(url, this);
	};
	
	Bitmap.prototype._onLoad = function() {
		this._image.removeEventListener('load', this._loadListener);
		this._image.removeEventListener('error', this._errorListener);

		this._renewCanvas();

		switch(this._loadingState){
			case 'requesting':
				this._loadingState = 'requestCompleted';
				if(this._decodeAfterRequest){
					this.decode();
				}else{
					this._loadingState = 'purged';
					this._clearImgInstance();
				}
				break;

			case 'decrypting':
				if(!this.asBlob){
					window.URL.revokeObjectURL(this._image.src);
				}
				
				this._loadingState = 'decryptCompleted';
				if(this._decodeAfterRequest){
					this.decode();
				}else{
					this._loadingState = 'purged';
					this._clearImgInstance();
				}
				break;
		}
	};
	
	//decryption required checks were moved to here
	Decrypter.decryptImg = function(url, bitmap) {
		if(!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
			url = this.extToEncryptExt(url);
		}

		var requestFile = new XMLHttpRequest();
		requestFile.open("GET", url);
		requestFile.responseType = "arraybuffer";
		requestFile.send();

		requestFile.onload = function () {
			if(this.status < Decrypter._xhrOk) {
				var arrayBuffer = requestFile.response;
				if(!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
					arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response);
				}				
				bitmap._image.src = Decrypter.createBlobUrl(arrayBuffer);
				bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
				bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
			}
		};

		requestFile.onerror = function () {
			if (bitmap._loader) {
				bitmap._loader();
			} else {
				bitmap._onError();
			}
		};
	};
	
//====================================================================
// ●Spriteset_Map
//====================================================================	
	
SceneManager.reloadCharacters = function(startEvent){
	if(SceneManager._scene){
		SceneManager._scene.children[0].reloadCharacters(startEvent);
	}	
}

SceneManager.catchException = function(e) {
	if (e instanceof Error) {
        Graphics.printError(e.name, "<b style='color: red;'>Please screenshot this error and share it with the developer!</b><br>"+e.stack);
        console.error(e.stack);
    } else {
        Graphics.printError('EngineError', e);
    }
    AudioManager.stopAll();
    this.stop();
}

SceneManager.isInSaveScene = function(){
	return SceneManager._scene instanceof Scene_Save;
}

//====================================================================
// ●Scene_Base
//====================================================================
    //SRPG戦闘中は無効化する
    var _SRPG_Scene_Base_checkGameover = Scene_Base.prototype.checkGameover;
    Scene_Base.prototype.checkGameover = function() {
        //if ($gameSystem.isSRPGMode() == false) {
        //    _SRPG_Scene_Base_checkGameover.call(this);
        //}
    };

//====================================================================
// ●Scene_Map
//====================================================================
    // 初期化
    var _SRPG_SceneMap_initialize = Scene_Map.prototype.initialize;
    Scene_Map.prototype.initialize = function() {
        _SRPG_SceneMap_initialize.call(this);
        this._callSrpgBattle = false;
		//this._deathQueue = [];
		this.idToMenu = {};
		$gameTemp.menuStack = [];
    };
	
	Scene_Map.prototype.processMapTouch = function() {
		if (TouchInput.isTriggered() || this._touchCount > 0) {
			if (TouchInput.isPressed()) {
				if (this._touchCount === 0 || this._touchCount >= 15) {
									
					if(UltraMode7.isActive()){
						const position = UltraMode7.screenToMap(TouchInput.x, TouchInput.y);
						$gameTemp.setDestination(Math.floor(position.x / $gameMap.tileWidth()), Math.floor(position.y / $gameMap.tileHeight()));	
					} else {
						var x = $gameMap.canvasToMapX(TouchInput.x);
						var y = $gameMap.canvasToMapY(TouchInput.y);
						$gameTemp.setDestination(x, y);	
					}					
				}
				$gameTemp.cameraMode = "touch";
				this._touchCount++;
			} else {
				this._touchCount = 0;
			}
		}
	};

    // フェード速度を返す
    Scene_Map.prototype.fadeSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
           return 12;
        } else {
           return Scene_Base.prototype.fadeSpeed.call(this);
        }
    };

    //セーブファイルをロードした際に画像をプリロードする
    var _SRPG_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _SRPG_Scene_Map_start.call(this);
        if ($gameTemp.isSrpgLoadFlag() == true) {
            $gameMap.events().forEach(function(event) {
                var battlerArray = $gameSystem.EventToUnit(event.eventId());
                if (battlerArray && battlerArray[0] === 'actor') {
                    var bitmap = ImageManager.loadFace(battlerArray[1].faceName());
                } else if (battlerArray && battlerArray[0] === 'enemy') {
                    var faceName = battlerArray[1].enemy().meta.faceName;
                    if (faceName) {
                        var bitmap = ImageManager.loadFace(faceName);
                    } else {
                        if ($gameSystem.isSideView()) {
                            var bitmap = ImageManager.loadSvEnemy(battlerArray[1].battlerName(), battlerArray[1].battlerHue());
                        } else {
                            var bitmap = ImageManager.loadEnemy(battlerArray[1].battlerName(), battlerArray[1].battlerHue());
                        }
                    }
                }
            });
            $gameTemp.setSrpgLoadFlag(false);
        }
    };
	
	Scene_Map.prototype.destroy = function() {
		
	}
	
	var Scene_Map_prototype_stop = Scene_Map.prototype.stop;
	Scene_Map.prototype.stop = function() {
		var _this = this;
		Scene_Map_prototype_stop.call(this);
		Object.keys(_this.idToMenu).forEach(function(id){
			_this.idToMenu[id].destroy();
		});
	}

    // マップのウィンドウ作成
    var _SRPG_SceneMap_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _SRPG_SceneMap_createAllWindows.call(this);
        this.createSrpgActorCommandWindow();
        this.createHelpWindow();
        
		this.createAttackWindow();
		this.createSpiritWindow();
		this.createBeforeBattleSpiritWindow();
		
		this.createRewardsWindow();
		this.createLevelUpWindow();
		this.createUnitSummaryWindow();
		this.createTerrainDetailsWindow();
		this.createIntermissionWindow();
		this.createMechListWindow();
		this.createMechListDeployedWindow();
		this.createMechReassignSelectWindow();
		this.createPilotReassignSelectWindow();
		this.createUpgradeUnitSelectionWindow();
		this.createUpgradeMechWindow();
		this.createPilotListWindow();
		this.createPilotUpgradeSelectionWindow();
		this.createPilotUpgradeWindow();
		this.createItemEquipWindow();
		this.createWeaponEquipWindow();
		this.createWeaponUpgradeWindow();
		this.createItemSellWindow();
		this.createItemEquipSelectionWindow();
		this.createWeaponEquipSelectionWindow();
		this.createMinimalBattleWindow();
		this.createSpiritAnimWindow();
		this.createDetailPagesWindow();
		this.createBeforeBattleWindow();
		this.createPauseWindow();
		this.createConditionsWindow();
		this.createItemWindow();
		this.createAbilityWindow();
		this.createTransformWindow();
		this.createPilotSwapWindow();
		this.createDeploymentWindow();
		this.createEndTurnConfirmWindow();
		this.createDeploymentInStageWindow();
		this.createDeploySelectionWindow();
		this.createSearchWindow();
		this.createOptionsWindow();
		this.createMapButtonsWindow();
		this.createOpeningCrawlWindow();
		this.createTextLogWindow();
		this.createZoneStatusWindow();
		this.createZoneSummaryWindow();
		$battleSceneManager.init();	
    };
	
	Scene_Map.prototype.createPauseWindow = function() {
		
		this._commandWindow = new Window_MenuCommand(0, 0);
		this._commandWindow.setHandler('save',      this.commandSave.bind(this));
		this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
		this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
		this._commandWindow.setHandler('cancel',    this.closePauseMenu.bind(this));
		this._commandWindow.setHandler('turnEnd',this.commandTurnEnd.bind(this));    
		this._commandWindow.setHandler('unitList',this.commandUnitList.bind(this));   
		this._commandWindow.setHandler('search',this.commandSearch.bind(this));   		
		this._commandWindow.setHandler('conditions',this.commandConditions.bind(this)); 		
		this._commandWindow.setHandler('transform_all', this.transformAllActorMenuCommand.bind(this));	

		this._commandWindow.setHandler('item',      this.commandItemVanilla.bind(this));
		this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
		this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
		
		this._commandWindow.setHandler('log',this.commandLog.bind(this)); 
		
		//hacky way to restore compatibility with plugins that still rely on scene_menu being used for the map menu		
		Scene_Map.prototype.createCommandWindow.call(this)
			
		
		this._commandWindow.y = 50;
		this._commandWindow.x = 800;
		this.addWindow(this._commandWindow);	
		this._goldWindow = new Window_StageInfo(0, 0);
		this._goldWindow.y = this._commandWindow.y + this._commandWindow.windowHeight();
		this._goldWindow.x = 800;
		this.addWindow(this._goldWindow);
		this._commandWindow.hide();
		this._commandWindow.deactivate();
		this._goldWindow.hide();
		this._goldWindow.deactivate();
	}
	
	Scene_Map.prototype.createCommandWindow = function(){
		
	}
	
	
	Scene_Map.prototype.commandItemVanilla = function() {
		 SceneManager.push(Scene_Item);
	};

	
	Scene_Map.prototype.commandPersonal = function() {
		this._statusWindow.setFormationMode(false);
		this._statusWindow.selectLast();
		this._statusWindow.activate();
		this._statusWindow.setHandler('ok',     this.onPersonalOk.bind(this));
		this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
	};

	Scene_Map.prototype.commandFormation = function() {
		this._statusWindow.setFormationMode(true);
		this._statusWindow.selectLast();
		this._statusWindow.activate();
		this._statusWindow.setHandler('ok',     this.onFormationOk.bind(this));
		this._statusWindow.setHandler('cancel', this.onFormationCancel.bind(this));
	};
	Scene_Map.prototype.createConditionsWindow = function() {
		this._conditionsWindow = new Window_ConditionsInfo(0, 0);
		this._conditionsWindow.y = 50;
		this._conditionsWindow.x = 20;
		this._conditionsWindow.hide();
		this._conditionsWindow.deactivate();
		this.addWindow(this._conditionsWindow);
		
		this._conditionsWindowCommand = new Window_ConditionsInfo(0, 0);
		this._conditionsWindowCommand.y = 50;
		this._conditionsWindowCommand.x = 175;
		this._conditionsWindowCommand.hide();
		this._conditionsWindowCommand.deactivate();
		this.idToMenu["stage_conditions"] = this._conditionsWindowCommand;
		this.addWindow(this._conditionsWindowCommand);
	};
	
	
	Scene_Map.prototype.commandOptions = function() {
		//SceneManager.push(Scene_Options);
		var _this = this;
		$gameTemp.optionsWindowCancelCallback = function(){
			$gameTemp.optionsWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "options";
	};
	
	Scene_Map.prototype.showPauseMenu = function() {
		this._commandWindow.open();
		this._commandWindow.show();
		this._commandWindow.activate();
		this._goldWindow.open();
		this._goldWindow.show();
		this._goldWindow.activate();
	}
	
	Scene_Map.prototype.closePauseMenu = function() {
		this._commandWindow.hide();
		this._commandWindow.deactivate();
		this._goldWindow.hide();
		this._goldWindow.deactivate();
		this._conditionsWindow.hide();
		this._mapButtonsWindow.hide();
		this._mapButtonsWindow.close();
		$gameTemp.summariesTimeout = 5;//hack to avoid summaries showing for a couple frames when cancelling the pause menu while hovering a map button
		$gameSystem.setSubBattlePhase('normal');
	}
	
	Scene_Map.prototype.commandGameEnd = function() {
		//this.closePauseMenu();
		SceneManager.push(Scene_GameEnd);
	};
	
	Scene_GameEnd.prototype.commandToTitle = function() {
		this.fadeOutAll();
		//SceneManager.goto(Scene_Disclaimer);
		//if (Utils.isNwjs()) {
			location.reload();
		//}
	};
	
	Scene_Map.prototype.commandSave = function() {
		if(ENGINE_SETTINGS.DEBUG_SAVING){
			$gameTemp.onMapSaving = true;
			this._mapButtonsWindow.hide();
			this._mapButtonsWindow.close();
			$gameSystem.setSubBattlePhase('normal');
			SceneManager.push(Scene_Save);
			DataManager.saveContinueSlot();	
		} else {
			this.closePauseMenu();
			DataManager.saveContinueSlot();	
		}			
	};
	
	Scene_Map.prototype.commandTurnEnd = function() {
		this._conditionsWindow.hide();
		this._commandWindow.hide();
		this._goldWindow.hide();
		$gameSystem.setSubBattlePhase('confirm_end_turn');
		if($gameSystem.getActorsWithAction().length){			
			$gameTemp.pushMenu = "confirm_end_turn";
		} else {
			$gameTemp.setTurnEndFlag(true);
			$gameTemp.setAutoBattleFlag(false);
		}		
    }
	
	Scene_Map.prototype.commandUnitList = function() {
		var _this = this;
		$gameTemp.mechListWindowCancelCallback = function(){
			$gameTemp.mechListWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "mech_list_deployed";
    }
	
	Scene_Map.prototype.commandSearch = function() {
		var _this = this;
		$gameTemp.searchWindowCancelCallback = function(){
			$gameTemp.searchWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		$gameTemp.searchWindowSelectedCallback = function(actor){
			$gameTemp.searchWindowSelectedCallback = null;
			var referenceEvent = $statCalc.getReferenceEvent(actor);
			if(referenceEvent){
				$gamePlayer.locate(referenceEvent.posX(), referenceEvent.posY());
			}
			$gameTemp.deactivatePauseMenu = false;
			_this.closePauseMenu();
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "search";
    }
	
	Scene_Map.prototype.commandConditions = function() {
		this._conditionsWindow.refresh();
		if(this._conditionsWindow.visible){
			this._conditionsWindow.hide();
		} else {
			this._conditionsWindow.show();
		}		
	}	
	
	Scene_Map.prototype.commandLog = function() {
		var _this = this;
		this._commandWindow.deactivate();
		this._commandWindow.hide();
		this._goldWindow.hide();
		
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
		
		$gameTemp.textLogCancelCallback = function(){
			$gameTemp.textLogCancelCallback = null;
			_this._commandWindow.activate();
			_this._commandWindow.show();
			_this._goldWindow.show();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		
        $gameTemp.pushMenu = "text_log";		
	}	
	
	
	Scene_Map.prototype.createIntermissionWindow = function() {
		var _this = this;
		_this._intermissionWindow = new Window_Intermission(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		_this._intermissionWindow.addHandler("intermissionEnd", function(){
			//$gameVariables.setValue(_nextMapVariable, 4);
			$gameVariables.setValue(_nextMapXVariable, 1);
			$gameVariables.setValue(_nextMapYVariable, 1);
			$gameSwitches.setValue(_endIntermissionSwitchID, true);
		});
		_this._intermissionWindow.hide();
		_this._intermissionWindow.close();
		_this.addWindow(this._intermissionWindow);
		_this.idToMenu["intermission_menu"] = this._intermissionWindow;
    };
	
	Scene_Map.prototype.createMechListWindow = function() {
		var _this = this;
		this._mechListWindow = new Window_MechList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechListWindow.close();
		this.addWindow(this._mechListWindow);
		this._mechListWindow.registerCallback("closed", function(){
			if($gameTemp.mechListWindowCancelCallback){
				$gameTemp.mechListWindowCancelCallback();
			}
		});
		this._mechListWindow.hide();
		this.idToMenu["mech_list"] = this._mechListWindow;
    };
	
	Scene_Map.prototype.createZoneStatusWindow = function() {
		var _this = this;
		this._zoneStatusWindow = new Window_ZoneStatus(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._zoneStatusWindow.close();
		this.addWindow(this._zoneStatusWindow);
	
		this._zoneStatusWindow.hide();
		this.idToMenu["zone_status"] = this._zoneStatusWindow;
    };
	
	Scene_Map.prototype.createMechListDeployedWindow = function() {
		var _this = this;
		this._mechListDeployedWindow = new Window_MechListDeployed(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechListDeployedWindow.close();
		this.addWindow(this._mechListDeployedWindow);
		this._mechListDeployedWindow.registerCallback("closed", function(){
			if($gameTemp.mechListWindowCancelCallback){
				$gameTemp.mechListWindowCancelCallback();
			}
		});
		this._mechListDeployedWindow.registerCallback("search_selected", function(actor){
			if($gameTemp.mechListWindowSearchSelectionCallback){
				$gameTemp.mechListWindowSearchSelectionCallback(actor);
			}
		});
		this._mechListDeployedWindow.hide();
		this.idToMenu["mech_list_deployed"] = this._mechListDeployedWindow;
    };
	
	Scene_Map.prototype.createMechReassignSelectWindow = function() {
		var _this = this;
		this._mechReassignSelectWindow = new Window_SelectReassignMech(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechReassignSelectWindow.close();
		this.addWindow(this._mechReassignSelectWindow);
		
		this._mechReassignSelectWindow.hide();
		this.idToMenu["mech_reassign_select"] = this._mechReassignSelectWindow;
    };
	
	Scene_Map.prototype.createPilotReassignSelectWindow = function() {
		var _this = this;
		this._pilotReassignSelectWindow = new Window_SelectReassignPilot(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotReassignSelectWindow.close();
		this.addWindow(this._pilotReassignSelectWindow);
		
		this._pilotReassignSelectWindow.hide();
		this.idToMenu["pilot_reassign_select"] = this._pilotReassignSelectWindow;
    };	
	
	Scene_Map.prototype.createDeploySelectionWindow = function() {
		var _this = this;
		this._deploySelectionWindow = new Window_DeploySelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._deploySelectionWindow.close();
		this.addWindow(this._deploySelectionWindow);
		this._deploySelectionWindow.hide();
		this.idToMenu["boarded_deploy_selection"] = this._deploySelectionWindow;
    };
	
	Scene_Map.prototype.createDeploymentWindow = function() {
		var _this = this;
		
		this._deploymentWindow = new Window_DeploymentTwin(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		
		
		this._deploymentWindow.close();
		this.addWindow(this._deploymentWindow);
		this._deploymentWindow.hide();
		this.idToMenu["deployment"] = this._deploymentWindow;
    };
	
	Scene_Map.prototype.createEndTurnConfirmWindow = function() {
		var _this = this;
		this._endTurnConfirmWindow = new Window_ConfirmEndTurn(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._endTurnConfirmWindow.close();
		this.addWindow(this._endTurnConfirmWindow);
		this._endTurnConfirmWindow.registerCallback("selected", function(result){
			$gameTemp.OKHeld = true;			
			if(result){
				$gameTemp.setTurnEndFlag(true);
				$gameTemp.setAutoBattleFlag(false);
			} else {
				$gameSystem.setSubBattlePhase("normal");
			}
		});
		this._endTurnConfirmWindow.hide();
		this.idToMenu["confirm_end_turn"] = this._endTurnConfirmWindow;
    };	
	
	Scene_Map.prototype.createDeploymentInStageWindow = function() {
		var _this = this;
		this._deploymentInStageWindow = new Window_DeploymentInStage(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._deploymentInStageWindow.close();
		this.addWindow(this._deploymentInStageWindow);
		this._deploymentInStageWindow.hide();
		this.idToMenu["in_stage_deploy"] = this._deploymentInStageWindow;
    };
	
	Scene_Map.prototype.createUpgradeUnitSelectionWindow = function() {
		var _this = this;
		this._ugradeUnitSelectionWindow = new Window_UpgradeUnitSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._ugradeUnitSelectionWindow.close();
		this.addWindow(this._ugradeUnitSelectionWindow);
		this._ugradeUnitSelectionWindow.hide();
		this.idToMenu["upgrade_unit_selection"] = this._ugradeUnitSelectionWindow;
    };
	
	Scene_Map.prototype.createUpgradeMechWindow = function() {
		var _this = this;
		this._upgradeMechWindow = new Window_UpgradeMech(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._upgradeMechWindow.close();
		this.addWindow(this._upgradeMechWindow);
		this._upgradeMechWindow.hide();
		this.idToMenu["upgrade_mech"] = this._upgradeMechWindow;
    };
	
	Scene_Map.prototype.createPilotListWindow = function() {
		var _this = this;
		this._pilotListWindow = new Window_PilotList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotListWindow.close();
		this.addWindow(this._pilotListWindow);
		this._pilotListWindow.hide();
		this.idToMenu["pilot_list"] = this._pilotListWindow;
    };	
	
	Scene_Map.prototype.createPilotUpgradeSelectionWindow = function() {
		var _this = this;
		this._pilotUpgradeSelectionWindow = new Window_UpgradePilotSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotUpgradeSelectionWindow.close();
		this.addWindow(this._pilotUpgradeSelectionWindow);
		this._pilotUpgradeSelectionWindow.hide();
		this.idToMenu["pilot_upgrade_list"] = this._pilotUpgradeSelectionWindow;
    };	
	
	Scene_Map.prototype.createPilotUpgradeWindow = function() {
		var _this = this;
		this._pilotUpgradeWindow = new Window_UpgradePilot(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotUpgradeWindow.close();
		this.addWindow(this._pilotUpgradeWindow);
		this._pilotUpgradeWindow.hide();
		this.idToMenu["upgrade_pilot"] = this._pilotUpgradeWindow;
    };	
	
	Scene_Map.prototype.createItemEquipWindow = function() {
		var _this = this;
		this._itemEquipWindow = new Window_EquipItem(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._itemEquipWindow.close();
		this.addWindow(this._itemEquipWindow);
		this._itemEquipWindow.hide();
		this.idToMenu["equip_item"] = this._itemEquipWindow;
    };	
	
	Scene_Map.prototype.createWeaponEquipWindow = function() {
		var _this = this;
		this._weaponEquipWindow = new Window_EquipWeapon(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._weaponEquipWindow.close();
		this.addWindow(this._weaponEquipWindow);
		this._weaponEquipWindow.hide();
		this.idToMenu["equip_weapon"] = this._weaponEquipWindow;
    };	
	
	Scene_Map.prototype.createWeaponUpgradeWindow = function() {
		var _this = this;
		this._weaponUpgradeWindow = new Window_UpgradeEquipWeapon(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._weaponUpgradeWindow.close();
		this.addWindow(this._weaponUpgradeWindow);
		this._weaponUpgradeWindow.hide();
		this.idToMenu["upgrade_equip_weapon"] = this._weaponUpgradeWindow;
    };	
	
	Scene_Map.prototype.createItemSellWindow = function() {
		var _this = this;
		this._itemSellWindow = new Window_SellItem(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._itemSellWindow.close();
		this.addWindow(this._itemSellWindow);
		this._itemSellWindow.hide();
		this.idToMenu["sell_item"] = this._itemSellWindow;
    };	
	
	
	Scene_Map.prototype.createItemEquipSelectionWindow = function() {
		var _this = this;
		this._itemEquipSelectWindow = new Window_EquipMechSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._itemEquipSelectWindow.close();
		this.addWindow(this._itemEquipSelectWindow);
		this._itemEquipSelectWindow.hide();
		this.idToMenu["equip_item_select"] = this._itemEquipSelectWindow;
    };		
	
	Scene_Map.prototype.createWeaponEquipSelectionWindow = function() {
		var _this = this;
		this._weaponEquipSelectWindow = new Window_EquipWeaponSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._weaponEquipSelectWindow.close();
		this.addWindow(this._weaponEquipSelectWindow);
		this._weaponEquipSelectWindow.hide();
		this.idToMenu["equip_weapon_select"] = this._weaponEquipSelectWindow;
    };	
	
	Scene_Map.prototype.createMinimalBattleWindow = function() {
		var _this = this;
		this._minimalBattleWindow = new Window_BattleBasic(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._minimalBattleWindow.close();
		this.addWindow(this._minimalBattleWindow);
		this._minimalBattleWindow.hide();
		this.idToMenu["battle_basic"] = this._minimalBattleWindow;
    };	
	
	Scene_Map.prototype.createSpiritAnimWindow = function() {
		var _this = this;
		this._spiritAnimWindow = new Window_SpiritActivation(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._spiritAnimWindow.registerCallback("done", function(){
			if($gameTemp.spiritWindowDoneHandler){
				$gameTemp.spiritWindowDoneHandler();
			}
		});
		this._spiritAnimWindow.close();
		this.addWindow(this._spiritAnimWindow);
		this._spiritAnimWindow.hide();
		this.idToMenu["spirit_activation"] = this._spiritAnimWindow;
    };
	
	Scene_Map.prototype.createDetailPagesWindow = function() {
		var _this = this;
		this._detailPagesWindow = new Window_DetailPages(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._detailPagesWindow.registerCallback("closed", function(){
			if($gameTemp.detailPagesWindowCancelCallback){
				$gameTemp.detailPagesWindowCancelCallback();
			}
		});
		this._detailPagesWindow.close();
		this.addWindow(this._detailPagesWindow);
		this._detailPagesWindow.hide();
		this.idToMenu["detail_pages"] = this._detailPagesWindow;
    };
	
	Scene_Map.prototype.createSearchWindow = function() {
		var _this = this;
		this._searchWindow = new Window_Search(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._searchWindow.registerCallback("closed", function(){
			if($gameTemp.searchWindowCancelCallback){
				$gameTemp.searchWindowCancelCallback();
			}
		});
		this._searchWindow.registerCallback("selected", function(actor){
			if($gameTemp.searchWindowSelectedCallback){
				$gameTemp.searchWindowSelectedCallback(actor);
			}
		});
		this._searchWindow.close();
		this.addWindow(this._searchWindow);
		this._searchWindow.hide();
		this.idToMenu["search"] = this._searchWindow;
    };
	
	Scene_Map.prototype.createOptionsWindow = function() {
		var _this = this;
		this._optionsWindow = new Window_Options(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._optionsWindow.registerCallback("closed", function(){
			if($gameTemp.optionsWindowCancelCallback){
				$gameTemp.optionsWindowCancelCallback();
			}
		});
		this._optionsWindow.close();
		this.addWindow(this._optionsWindow);
		this._optionsWindow.hide();
		this.idToMenu["options"] = this._optionsWindow;
    };

    // アクターコマンドウィンドウを作る
    Scene_Map.prototype.createSrpgActorCommandWindow = function() {
        this._mapSrpgActorCommandWindow = new Window_ActorCommand();
        this._mapSrpgActorCommandWindow.x = Math.max(Graphics.boxWidth / 2 - this._mapSrpgActorCommandWindow.windowWidth(), 0);
        this._mapSrpgActorCommandWindow.y = Math.max(Graphics.boxHeight / 2 - this._mapSrpgActorCommandWindow.windowHeight(), 0);
		this._mapSrpgActorCommandWindow.setHandler('move',  this.commandMove.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('item',   this.commandItem.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('ability',   this.commandAbility.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('equip',   this.commandEquip.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('wait',  this.commandWait.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('land',  this.commandLand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('fly',  this.commandFly.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('spirit',  this.commandSpirit.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('board',  this.commandBoard.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('deploy',  this.commandDeploy.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('heal',  this.commandHeal.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('resupply',  this.commandResupply.bind(this));				
		this._mapSrpgActorCommandWindow.setHandler('persuade', this.persuadeActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('combine', this.combineActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('split', this.splitActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('transform', this.transformActorMenuCommand.bind(this));
		
		this._mapSrpgActorCommandWindow.setHandler('swap', this.swapActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('separate', this.separateActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('join', this.joinActorMenuCommand.bind(this));		
		this._mapSrpgActorCommandWindow.setHandler('status', this.statusActorMenuCommand.bind(this));	
		
		this._mapSrpgActorCommandWindow.setHandler('swap_pilot', this.swapPilotMenuCommand.bind(this));	
		
		this._mapSrpgActorCommandWindow.setHandler('change_super_state_0',  this.commandChangeSuperState.bind(this, 0));
		this._mapSrpgActorCommandWindow.setHandler('change_super_state_1',  this.commandChangeSuperState.bind(this, 1));
		this._mapSrpgActorCommandWindow.setHandler('change_super_state_2',  this.commandChangeSuperState.bind(this, 2));
		this._mapSrpgActorCommandWindow.setHandler('change_super_state_3',  this.commandChangeSuperState.bind(this, 3));
		
		
        this._mapSrpgActorCommandWindow.setHandler('cancel', this.cancelActorMenuCommand.bind(this));
		$gameTemp.actorCommandPosition = -1;
        this.addWindow(this._mapSrpgActorCommandWindow);
    };

    // ヘルプウィンドウを作る
    Scene_Map.prototype.createHelpWindow = function() {
        this._helpWindow = new Window_Help();
        this._helpWindow.visible = false;
        this.addWindow(this._helpWindow);
    };
	
	Scene_Map.prototype.createAttackWindow = function() {
		var _this = this;
		this._attackWindow = new Window_AttackList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._attackWindow.registerCallback("selected", function(attack){			
			if($gameTemp.attackWindowCallback){
				$gameTemp.attackWindowCallback(attack);
			}
		});
		this._attackWindow.registerCallback("closed", function(){
			if($gameTemp.attackWindowCancelCallback){
				$gameTemp.attackWindowCancelCallback();
			}
		});
		this._attackWindow.close();
		this.addWindow(this._attackWindow);
		this._attackWindow.hide();
		this.idToMenu["attack_list"] = this._attackWindow;
    };
	
	Scene_Map.prototype.createSpiritWindow = function() {
		var _this = this;
		_this._spiritWindow = new Window_SpiritSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		this._spiritWindow.registerCallback("selected", function(spiritInfo){
			_this.handleSpiritSelection(spiritInfo);
		});
		this._spiritWindow.registerCallback("selectedMultiple", function(spirits){
			_this.handleMultipleSpiritSelection(spirits);
		});		
		this._spiritWindow.registerCallback("closed", function(spiritInfo){
			_this._spiritWindow.close();
			_this._mapSrpgActorCommandWindow.activate()
			_this._mapSrpgActorCommandWindow.show()
		});
		this._spiritWindow.close();
		this.addWindow(this._spiritWindow);
		this._spiritWindow.hide();
		this.idToMenu["spirit_selection"] = this._spiritWindow;
    };
	
	Scene_Map.prototype.createOpeningCrawlWindow = function() {
		var _this = this;
		_this._openingCrawlWindow = new Window_OpeningCrawl(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		this._openingCrawlWindow.close();
		this.addWindow(this._openingCrawlWindow);
		this._openingCrawlWindow.hide();
		this.idToMenu["opening_crawl"] = this._openingCrawlWindow;
    };
	
	Scene_Map.prototype.createTextLogWindow = function() {
		var _this = this;
		_this._textLogWindow = new Window_TextLog(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		this._textLogWindow.close();
		this.addWindow(this._textLogWindow);
		this._textLogWindow.hide();
		this.idToMenu["text_log"] = this._textLogWindow;
    };
	
	Scene_Map.prototype.createBeforeBattleSpiritWindow = function() {
		var _this = this;
		_this._spiritWindowBeforeBattle = new Window_SpiritSelectionBeforeBattle(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		this._spiritWindowBeforeBattle.registerCallback("selected", function(spiritInfo){
			if($gameTemp.beforeBattleSpiritWindowSelected){
				$gameTemp.beforeBattleSpiritWindowSelected(_this, spiritInfo);
			}			
		});
		this._spiritWindowBeforeBattle.registerCallback("selectedMultiple", function(spirits){
			if($gameTemp.beforeBattleSpiritWindowSelectedMultiple){
				$gameTemp.beforeBattleSpiritWindowSelectedMultiple(_this, spirits);
			}	
		});		
		this._spiritWindowBeforeBattle.registerCallback("closed", function(spiritInfo){
			if($gameTemp.beforeBattleSpiritWindowClosed){
				$gameTemp.beforeBattleSpiritWindowClosed();
			}	
		});
		this._spiritWindowBeforeBattle.close();
		this.addWindow(this._spiritWindowBeforeBattle);
		this._spiritWindowBeforeBattle.hide();
		this.idToMenu["spirit_selection_before_battle"] = this._spiritWindowBeforeBattle;
    };
	
	Scene_Map.prototype.createBeforeBattleWindow = function() {
		var _this = this;
		if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM){
			_this._beforeBattleWindow = new Window_BeforebattleTwin(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		} else {
			_this._beforeBattleWindow = new Window_BeforeBattle(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		}
		
		this._beforeBattleWindow.registerCallback("selected", function(spiritInfo){
			_this.commandBattleStart();
		});
		this._beforeBattleWindow.registerCallback("closed", function(spiritInfo){
			_this.selectPreviousSrpgBattleStart();
		});
		
		this._beforeBattleWindow.close();
		this.addWindow(this._beforeBattleWindow);
		this._beforeBattleWindow.hide();
		this.idToMenu["before_battle"] = this._beforeBattleWindow;
    };
	
	Scene_Map.prototype.testSpirits = function() {
		this._spiritAnimWindow.testSpirits();
	}
	
	Scene_Map.prototype.applyAdditionalSpiritEffects = function(spiritInfo, target, caster) {
		//Implementation of Great Wall Ace Bonus
		if(spiritInfo.idx == 22 && $statCalc.applyStatModsToValue(target, 0, ["great_wall"])) { //Wall
			$spiritManager.applyEffect(9, caster, [target], 0); //Drive
		}
	}
	
	Scene_Map.prototype.handleMultipleSpiritSelection = function(spirits, callback) {
		var _this = this;
		//if($gameTemp.playingSpiritAnimations){
		//	return;//fix attempt for issue where spirit activation window lingers after activating a spirit
		//}
		$gameTemp.playingSpiritAnimations = true;
		var currentSpirit = spirits.pop();	
		this._spiritWindow.close();
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		
		function applySpirit(){
			_this.applyAdditionalSpiritEffects(currentSpirit, currentSpirit.target, currentSpirit.caster);
			var targets = [currentSpirit.target];
			if(currentSpirit.target.isActor()){
				var subPilots = currentSpirit.target.SRWStats.mech.subPilots;
				if(subPilots){
					subPilots.forEach(function(actorId){
						targets.push($gameActors.actor(actorId));
					});
				}
			}			
			$spiritManager.applyEffect(currentSpirit.idx, currentSpirit.caster, targets, currentSpirit.cost);
			
			$gameTemp.spiritTargetActor = currentSpirit.target;
			$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: currentSpirit.target, idx: currentSpirit.idx}}];	
			_this._spiritAnimWindow.show(true);	
		}
			
		$gameTemp.spiritWindowDoneHandler = function(){
			if(!spirits.length){
				if(callback){
					callback();
				} else {
					$gameTemp.popMenu = true;
					$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
					$gameSystem.setSubBattlePhase("actor_command_window");
				}				
			} else {
				currentSpirit = spirits.pop();	
				applySpirit();
			}
		}
		
		$gameSystem.setSubBattlePhase('spirit_activation');	
		$gameTemp.pushMenu = "spirit_activation";
		applySpirit();
	}
	
	Scene_Map.prototype.handleEventSpirits = function(spirits) {
		var _this = this;
		$gameTemp.playingSpiritAnimations = true;
		var currentSpirit = spirits.pop();	
		this._spiritWindow.close();
		
		function applySpirit(){
			_this.applyAdditionalSpiritEffects(currentSpirit, currentSpirit.target, currentSpirit.caster);					
			$spiritManager.applyEffect(currentSpirit.idx, currentSpirit.caster, [currentSpirit.target], 0);			
			$gameTemp.spiritTargetActor = currentSpirit.target;
			$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: currentSpirit.target, idx: currentSpirit.idx}}];	
			_this._spiritAnimWindow.show(true);	
		}
			
		$gameTemp.spiritWindowDoneHandler = function(){
			if(!spirits.length){
				$gameSystem.setSubBattlePhase($gameTemp.eventSpiritPhaseContext || 'normal');	
				$gameTemp.eventSpiritPhaseContext = null;
				$gameTemp.playingSpiritAnimations = false;
				$gameTemp.popMenu = true;
			} else {
				currentSpirit = spirits.pop();	
				applySpirit();
			}
		}
		
		$gameSystem.setSubBattlePhase('spirit_activation');	
		$gameTemp.pushMenu = "spirit_activation";
		applySpirit();
	}
	
	Scene_Map.prototype.handleSpiritSelection = function(spiritInfo, callback) {
		this._spiritWindow.close();
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		var target;
		if(spiritInfo.target){
			target = spiritInfo.target;
		} else {
			target = battlerArray[1];
		}
		var caster;
		if(spiritInfo.caster){
			caster = spiritInfo.caster;
		} else {
			caster = battlerArray[1];
		}
		var referenceEvent = $statCalc.getReferenceEvent(caster);
		var initialTargetingResult = $spiritManager.performInitialTargeting(spiritInfo.idx, target, {x: referenceEvent.posX(), y: referenceEvent.posY()});
		
		if(initialTargetingResult.type == "enemy" || initialTargetingResult.type == "ally"){
		 //manual Targeting required
			 $gameTemp.currentTargetingSpirit = spiritInfo;
			 $gameSystem.setSubBattlePhase('actor_target_spirit');
		} else if(initialTargetingResult.type == "ally_adjacent" || initialTargetingResult.type == "enemy_adjacent") {
			$gameTemp.adjacentSpiritInfo = {
				spiritInfo: spiritInfo,
				initialTargetingResult: initialTargetingResult,
				caster: caster
			};
			$gameTemp.clearMoveTable()
			/*$gameTemp.initialRangeTable(referenceEvent.posX(), referenceEvent.posY(), 1);
			referenceEvent.makeRangeTable(referenceEvent.posX(), referenceEvent.posY(), 1, [0], referenceEvent.posX(), referenceEvent.posY(), null);
			$gameTemp.minRangeAdapt(referenceEvent.posX(), referenceEvent.posY(), 0);
			$gameTemp.pushRangeListToMoveList();
			$gameTemp.setResetMoveList(true);*/
			
			$gameSystem.highlightedTiles.push({x: referenceEvent.posX() - 1, y: referenceEvent.posY(), color: "#2c57ff"});
			$gameSystem.highlightedTiles.push({x: referenceEvent.posX() + 1, y: referenceEvent.posY(), color: "#2c57ff"});
			$gameSystem.highlightedTiles.push({x: referenceEvent.posX(), y: referenceEvent.posY() - 1, color: "#2c57ff"});
			$gameSystem.highlightedTiles.push({x: referenceEvent.posX(), y: referenceEvent.posY() + 1, color: "#2c57ff"});
			$gameSystem.highlightsRefreshed = true;
			
			$gameSystem.setSubBattlePhase("confirm_adjacent_spirit");		
		} else {
			//apply immediately
			$spiritManager.applyEffect(spiritInfo.idx, caster, initialTargetingResult.targets, spiritInfo.cost);
			
			this.applyAdditionalSpiritEffects(spiritInfo, target, caster);
			if(initialTargetingResult.type != "enemy_all" && initialTargetingResult.type != "ally_all"){
				$gameTemp.spiritTargetActor = initialTargetingResult.targets[0];
				$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: initialTargetingResult.targets[0], idx: spiritInfo.idx}}];					
				$gameSystem.setSubBattlePhase('spirit_activation');
				
				
				$gameTemp.spiritWindowDoneHandler = callback || function(){
					$gameTemp.popMenu = true;
					$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
					$gameSystem.setSubBattlePhase("actor_command_window");
				}
				
					
				$gameTemp.pushMenu = "spirit_activation";
				
							
				//_this._mapSrpgActorCommandWindow.activate();
			}  else {
				$gameTemp.queuedEffectSpiritId = spiritInfo.idx; 
				$gameSystem.setSubBattlePhase("map_spirit_animation");				
			}				
		}
	}


    // アイテムウィンドウを作る
    Scene_Map.prototype.createItemWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._itemWindow = new Window_SRWItemBattle(0, wy, 200, 180);
		this._itemWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._itemWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok',     this.onConsumableOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
    };
	
	Scene_Map.prototype.createAbilityWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._abilityWindow = new Window_SRWAbilityCommand(0, wy, 400, 180);
		this._abilityWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._abilityWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._abilityWindow.setHandler('ok',     this.onAbilityOk.bind(this));
        this._abilityWindow.setHandler('cancel', this.onAbilityCancel.bind(this));
        this.addWindow(this._abilityWindow);
		
		this._abilityDescriptionWindow = new Window_SRWAbilityDescription(0, 0);
		this.addWindow(this._abilityDescriptionWindow);
		this._abilityDescriptionWindow.hide();
		
		this._abilityWindow.setDescriptionWindow(this._abilityDescriptionWindow);
    };
	
	Scene_Map.prototype.createTransformWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._transformWindow = new Window_SRWTransformSelection(0, wy, 200, 180);
		this._transformWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._transformWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._transformWindow.setHandler('ok',     this.onTransformOk.bind(this));
        this._transformWindow.setHandler('cancel', this.onTransformCancel.bind(this));
        this.addWindow(this._transformWindow);
    };
	
	Scene_Map.prototype.createPilotSwapWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._swapPilotWindow = new Window_SRWPilotSelection(0, wy, 200, 180);
		this._swapPilotWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._swapPilotWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._swapPilotWindow.setHandler('ok',     this.onSwapPilotOk.bind(this));
        this._swapPilotWindow.setHandler('cancel', this.onSwapPilotCancel.bind(this));
        this.addWindow(this._swapPilotWindow);
    };
	
	Scene_Map.prototype.createRewardsWindow = function() {
		this._rewardsWindow = new Window_Rewards();
		
		this._rewardsWindow.close();
		this.addWindow(this._rewardsWindow);
		this._rewardsWindow.hide();
		this.idToMenu["rewards"] = this._rewardsWindow;
    };
		
	Scene_Map.prototype.createUnitSummaryWindow = function() {
		this._summaryWindow = new Window_UnitSummary(0, 0);				
		this._summaryWindow.close();
		this.addWindow(this._summaryWindow);
		this._summaryWindow.hide();
		this.idToMenu["unit_summary"] = this._summaryWindow;
    };
	
	Scene_Map.prototype.createTerrainDetailsWindow = function() {
		this._terrainDetailsWindow = new Window_TerrainDetails(0, 0);				
		this._terrainDetailsWindow.close();
		this.addWindow(this._terrainDetailsWindow);
		this._terrainDetailsWindow.hide();
		this.idToMenu["terrain_details"] = this._terrainDetailsWindow;
    };
	
	Scene_Map.prototype.createZoneSummaryWindow = function() {
		this._zoneSummaryWindow = new Window_ZoneSummary(0, 0);				
		this._zoneSummaryWindow.close();
		this.addWindow(this._zoneSummaryWindow);
		this._zoneSummaryWindow.hide();
		this.idToMenu["zone_summary"] = this._zoneSummaryWindow;
    };
	
	Scene_Map.prototype.createMapButtonsWindow = function() {
		this._mapButtonsWindow = new Window_MapButtons(0, 0);				
		this._mapButtonsWindow.close();
		this.addWindow(this._mapButtonsWindow);
		this._mapButtonsWindow.hide();
		this.idToMenu["map_buttons"] = this._mapButtonsWindow;
    };	
	
	Scene_Map.prototype.createLevelUpWindow = function() {
		this._levelUpWindow = new Window_LevelUp();
				
		this._levelUpWindow.close();
		this.addWindow(this._levelUpWindow);
		this._levelUpWindow.hide();
		this.idToMenu["level_up"] = this._levelUpWindow;
    };

    // サブフェーズの状況に応じてキャンセルキーの機能を変更する
    var _SRPG_SceneMap_updateCallMenu = Scene_Map.prototype.updateCallMenu;
    Scene_Map.prototype.updateCallMenu = function() {
		var _this = this;
        if ($gameSystem.isSRPGMode() == true) {
			if(!$SRWGameState.canUseMenu()){
				 this.menuCalling = false;
				return;
			}
        } else {
            _SRPG_SceneMap_updateCallMenu.call(this);
        }
    };
	
	Scene_Map.prototype.processMenuStack = function(){
		var menuStack = $gameTemp.menuStack;
		if($gameTemp.popMenu){
			//console.log("Pop Menu " + $gameTemp.menuStack[menuStack.length-1]);
			
			//Input.update is called twice to prevent inputs that triggered the closing of a window to also trigger something in the new state
			Input.update();
			Input.update();
			if(menuStack.length){
				var menu = menuStack.pop();
				if(menu){
					menu.hide();
					menu.close();
					menu.deactivate();
				}
				if(menuStack.length){					
					var menu = menuStack[menuStack.length-1];
					if(menu){
						menu.show();
						menu.open();
						menu.activate();
					}
				}
			}
			$gameTemp.popMenu = false;
			if($gameTemp.popFunction){
				$gameTemp.popFunction.call(this);				
				$gameTemp.popFunction = null;
			}
		}		
		
		if($gameTemp.killMenus && Object.keys($gameTemp.killMenus).length){
			var tmp = [];
			for(var i = 0; i < menuStack.length; i++){
				var menu = menuStack[i];
				if(menu){
					if(!$gameTemp.killMenus[menuStack[i]._layoutId]){
						tmp.push(menu);
					} else {
						menu.hide();
						menu.close();
						menu.deactivate();
					}					
				}				
			}
			$gameTemp.killMenus = {};
			menuStack = tmp;
			if(menuStack.length){					
				var menu = menuStack[menuStack.length-1];
				if(menu){
					menu.show();
					menu.open();
					menu.activate();
				}
			}
			$gameTemp.menuStack = menuStack;
		}
		
		if($gameTemp.pushMenu){
			//console.log("Push Menu "+$gameTemp.pushMenu);
			if(menuStack.length){
				var menu = menuStack[menuStack.length-1];
				if(menu){
					menu.hide();
					menu.close();
					menu.deactivate();
				}
			}
			var menu = this.idToMenu[$gameTemp.pushMenu];
			if(menu){
				menu.show();
				menu.open();
				menu.activate();
				menuStack.push(menu);
			}	
			$gameTemp.pushMenu = null;	
		}	
	}

    // マップの更新
    var _SRPG_SceneMap_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
		var _this = this;
			
		//Soft Reset
		if(!$gameSystem.isIntermission() && Input.isPressed("ok") && Input.isPressed("cancel") && Input.isPressed("pageup") && Input.isPressed("pagedown")){
			Input.clear();
			$gameSystem.setSubBattlePhase("normal");
			try {
				JsonEx.parse(StorageManager.load("continue"));//check if the continue slot exists first by trying to parse it
				DataManager.loadContinueSlot();
			} catch(e){
				
			}			
			return;
		}				
		
		if(Input.isTriggered("left") || Input.isTriggered("right") || Input.isTriggered("up") || Input.isTriggered("down")){
			$gameTemp.cameraMode = "controller";
		}
		
		$gameSystem.updateColorCycles();
		
		
						
		if($gamePlayer.canMove() && !ENGINE_SETTINGS.DISABLE_TOUCH){		
		
			if(TouchInput.isPressed()) {
				if($gameTemp._ckex == -1 || $gameTemp._ckey == -1){
					$gameTemp._ckex = TouchInput.x;
					$gameTemp._ckey = TouchInput.y;
					$gameTemp.lastDragX = TouchInput.x;
					$gameTemp.lastDragY = TouchInput.y;
					$gameTemp.dragTimer = 10;
					$gameTemp.dragAccelTimer = 0;
					$gameTemp.isDraggingMap = true;
				} else if($gameTemp.isDraggingMap){
					if(Math.abs($gameTemp.lastDragX - TouchInput.x) > 50 || Math.abs($gameTemp.lastDragY - TouchInput.y) > 50){
						$gameTemp.lastDragX = TouchInput.x;
						$gameTemp.lastDragY = TouchInput.y;
						$gameTemp.dragTimer = 10;
					} else {
						$gameTemp.dragTimer--;
					}
					if($gameTemp.dragTimer >= 0){
						var ckeX = ($gameTemp._ckex - TouchInput.x);
						var ckeY = ($gameTemp._ckey - TouchInput.y);
						$gameTemp.dragAccelTimer++;
						if($gameTemp.dragAccelTimer > 30){
							$gameTemp.dragAccelTimer = 30;
						}
						var ratio = 500 + ((30 - $gameTemp.dragAccelTimer) * 5);
						$gameMap.applyDragDistances(ckeX / ratio, ckeY / ratio);
					} else {
						$gameTemp._ckex = -1;
						$gameTemp._ckey = -1;
						$gameTemp.isDraggingMap = false;
					}				
				}
			} else {
				$gameTemp._ckex = -1;
				$gameTemp._ckey = -1;
				$gameTemp.isDraggingMap = false;
			}		
		}
		
		
		_SRPG_SceneMap_update.call(this);
		
		this.processMenuStack();
		
		if($gameSystem.isIntermission()){
			$SRWGameState.requestNewState("intermission");
			if(!this._intermissionWindowOpen){
				$gameSystem.clearData();//make sure stage temp data is cleared when moving between stages
				this._intermissionWindowOpen = true;
				this._intermissionWindow.setActor($gameSystem._availableUnits[0]);
				/*this._intermissionWindow.refresh();
				this._intermissionWindow.open();
				this._intermissionWindow.show();
				this._intermissionWindow.activate();*/
				$gameTemp.pushMenu = "intermission_menu";
			}	
			var menu = this.idToMenu["intermission_menu"];
			if(!menu.visible){
				menu.visible = true;
			}
			return;			
		} else {
			if(this._intermissionWindowOpen){
				this._intermissionWindowOpen = false;
				this._intermissionWindow.close();
				this._intermissionWindow.hide();
			}
		}
		
		if($gameTemp.enemyAppearQueueIsProcessing && $gameTemp.enemyAppearQueue){
			if(ImageManager.isReady()){//wait for potential still pending character sheet loading by addEnemy or deployActor
				$gameTemp.unitAppearTimer--;
				if($gameTemp.unitAppearTimer <= 0){
					if(!$gameTemp.enemyAppearQueue.length){
						$gameTemp.enemyAppearQueueIsProcessing = false;
					} else {
						var current = $gameTemp.enemyAppearQueue.shift();
						$gamePlayer.locate(current.posX(), current.posY());
						current.isDoingAppearAnim = true;
						current.isPendingDeploy = false;
						var battlerArray = $gameSystem.EventToUnit(current.eventId());
						var wait = 15;
						/*if(battlerArray && battlerArray[1]){
							var animInfo = $statCalc.getSpawnAnimInfo(battlerArray[1]);
							wait+=animInfo.frames;
						}*/
						$gameTemp.unitAppearTimer = wait;
					}				
				}
			}			
		}
		
		if($gameTemp.disappearQueueIsProcessing && $gameTemp.disappearQueue){
			$gameTemp.unitAppearTimer--;
			if($gameTemp.unitAppearTimer <= 0){
				if(!$gameTemp.disappearQueue || !$gameTemp.disappearQueue.length){
					$gameTemp.disappearQueueIsProcessing = false;
				} else {
					var current = $gameTemp.disappearQueue.shift();
					$gamePlayer.locate(current.posX(), current.posY());
					current.isDoingDisappearAnim = true;
					$gameTemp.unitAppearTimer = 15;
				}				
			}
		}
		
		if(!$gameMap._interpreter.isRunning() && $SRWGameState.canShowPopUpAnim()){
			let animDefs = $statCalc.getPopUpAnims();
			if(animDefs.length){
				$gameTemp.popUpAnimQueue = animDefs;
				$gameTemp.contextState = $gameSystem.isSubBattlePhase();
				$gameSystem.setSubBattlePhase("popup_anim");
			}				
		}
		
		if(!$SRWGameState.update(this)) {
			return;
		}
		
		if($gameTemp.continueLoaded){
			$gameTemp.continueLoaded = false;
			$gameSystem.onAfterLoad();
		}
		
		//Start first actor turn
		if ($gameSystem.isBattlePhase() == "start_srpg"){
			if (!$gameMap.isEventRunning()) {
				$gameSystem.srpgStartActorTurn();
			}
		}
		
		//$gameSystem.isSubBattlePhase() !== 'normal' && $gameSystem.isSubBattlePhase() !== 'actor_target' && $gameSystem.isSubBattlePhase() !== 'actor_target_spirit' && $gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm'
		if (!$SRWGameState.canShowSummaries()) {	
			this._summaryWindow.hide();
			this._terrainDetailsWindow.hide();
			this._zoneSummaryWindow.hide();
		}		
		
		if(!$SRWGameState.canUseMenu() && $gameSystem.isSubBattlePhase() !== 'pause_menu' && $gameSystem.isSubBattlePhase() !== 'rearrange_deploys'){
			this._mapButtonsWindow.hide();
			this._mapButtonsWindow.close();
		}
		
		if($gameTemp.OKHeld && !Input.isTriggered("ok")){
			$gameTemp.OKHeld = false;
		}		
				
		//console.log($gameSystem.isSubBattlePhase());
		
				
        if ($gameSystem.isSRPGMode() == false) {
            return;
        }
        if ($gameSystem.srpgWaitMoving() == true || $gameTemp.isAutoMoveDestinationValid() == true) {
            return;
        }
		
        //ターン終了コマンドの実行
        if ($gameTemp.isTurnEndFlag() == true) {
            this.menuActorTurnEnd();
            return;
        }
        //アクターコマンドからの装備変更の後処理
        if ($gameTemp.isSrpgActorEquipFlag() == true) {
            this.srpgAfterActorEquip();
            return;
        }
			
        var flag = $gameSystem.srpgActorCommandWindowNeedRefresh();
        if (flag[0]) {
            if ($gameTemp.forceActorMenuRefresh || (!this._mapSrpgActorCommandWindow.isOpen() && !this._mapSrpgActorCommandWindow.isOpening())) {
                $gameTemp.forceActorMenuRefresh = false;
				this._mapSrpgActorCommandWindow.setup(flag[1][1]);
				this._mapSrpgActorCommandWindow.activate();
				this._mapSrpgActorCommandWindow.open();
				this._mapSrpgActorCommandWindow.show();
				if($gameTemp.actorCommandPosition != -1){					
					this._mapSrpgActorCommandWindow.select($gameTemp.actorCommandPosition);
					$gameTemp.actorCommandPosition = -1;
				}
            }
        } else {
            if (this._mapSrpgActorCommandWindow.isOpen() && !this._mapSrpgActorCommandWindow.isClosing()) {
                this._mapSrpgActorCommandWindow.close();
                this._mapSrpgActorCommandWindow.deactivate();
            }
        }
        
      
		
		if ($gameMap.isEventRunning() == true) {
            return;
        }
		
        //アクターフェイズの開始処理
        if ($gameSystem.isBattlePhase() === 'actor_phase' && $gameSystem.isSubBattlePhase() === 'initialize') {
			/*if($gameVariables.value(_turnVarID) != 1){
				$statCalc.modifyAllWill("actor", 1);				
			}*/
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        }      
       	
		
        //エネミーフェイズの処理
        if ($gameSystem.isBattlePhase() === 'AI_phase') {
			$gameTemp.summaryUnit = null;					
        }
						
		//$gameSystem.isSubBattlePhase() === 'actor_target' || $gameSystem.isSubBattlePhase() === 'actor_target_spirit' || $gameSystem.isSubBattlePhase() === 'actor_map_target_confirm'
		if ($SRWGameState.canShowSummaries() && $gameTemp.summariesTimeout <= 0 && !$gameTemp.isDraggingMap) {
			var currentPosition = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
			$gameTemp.previousCursorPosition = currentPosition;
			var summaryUnit = $statCalc.activeUnitAtPosition(currentPosition);
			if(summaryUnit && ($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(summaryUnit.event.eventId()))){
				var previousUnit = $gameTemp.summaryUnit;
				$gameTemp.summaryUnit = summaryUnit;	
				if(!_this._summaryWindow.visible || $gameTemp.summaryUnit != previousUnit){
					_this._summaryWindow.show();
				}											
			}
		}
		
    };
	
	Scene_Map.prototype.startMapAttackResultDisplay = function(){
		$gameTemp.mapAttackEffectQueue = [];
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];
			if(battleEffect.type == "defender"){
				var effect = {parameters: {target: battleEffect.ref}};
				if(battleEffect.isHit){
					effect.type = "damage";
					effect.parameters.damage = battleEffect.damageTaken;
				} else if(battleEffect.isDoubleImage){
					effect.type = "double_image";
				} else {
					effect.type = "miss";
				}				
				$gameTemp.mapAttackEffectQueue.push(effect);
			}
		});
		$gameTemp.battleEffectWindowIsOpen = false;
		$gameTemp.processingMapAttackEffect = false;
		$gameSystem.setSubBattlePhase('process_map_attack_queue');
	}
	
	Scene_Map.prototype.getAdjustedMapAttackCoordinates = function(originalCoordinates, direction){
		var result = JSON.parse(JSON.stringify(originalCoordinates));
		//default direction is right
		if(direction == "left"){
			for(var i = 0; i < result.length; i++){
				result[i][0]*=-1;
			}
		} 
		if(direction == "down" || direction == "up"){
			for(var i = 0; i < result.length; i++){
				var tmp = result[i][0];
				result[i][0] = result[i][1];
				result[i][1] = tmp;
			}
			if(direction == "up"){
				for(var i = 0; i < result.length; i++){
					result[i][1]*=-1;
				}
			}
		} 	
		return result;
	};
	
    //戦闘終了後の戦闘不能判定
    Scene_Map.prototype.srpgBattlerDeadAfterBattle = function() {
		var _this = this;
		$gameTemp.currentMapTargets = [];
		$gameTemp.deathQueue = [];
		$gameTemp.destroyTransformQueue = [];
		
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];
			if(battleEffect.isDestroyed){
				if(battleEffect.ref.SRWStats.mech.destroyTransformInto != null){
					//$statCalc.transformOnDestruction(battleEffect.ref);
					$gameTemp.destroyTransformQueue.push({actor: battleEffect.ref, event: battleEffect.ref.event});
				} else {
					//battleEffect.ref.event._erased = true;
					$gameTemp.deathQueue.push({actor: battleEffect.ref, event: $statCalc.getReferenceEvent(battleEffect.ref)});
					if($statCalc.isShip(battleEffect.ref)){
						var boardedUnits = $statCalc.getBoardedUnits(battleEffect.ref)
						for(var i = 0; i < boardedUnits.length; i++){
							$gameTemp.deathQueue.push({actor: boardedUnits[i], event: boardedUnits[i].event});
						}
					}
				}				
			}			
		});
		if($gameTemp.destroyTransformQueue.length){
			$gameSystem.setSubBattlePhase("process_destroy_transform_queue");
			this.eventBeforeDestruction();
		} else if($gameTemp.deathQueue.length){
			$gameSystem.setSubBattlePhase("process_death_queue");
			this.eventBeforeDestruction();
		} else {
			$gameSystem.setSubBattlePhase("enemy_hit_and_away");
			//this.srpgAfterAction();
		}
    };

    //行動終了時の処理
    //戦闘終了の判定はイベントで行う。
    Scene_Map.prototype.srpgAfterAction = function() {	
		if(ENGINE_SETTINGS.EXPIRE_ZONES_ON_DEATH){
			$gameSystem.expireAbilityZones(true);
		}
		
		function processGains(battleEffect){
			var subPilots = $statCalc.getSubPilots(battleEffect.ref);
			var gainResults = [];
			subPilots.forEach(function(id){	
				if($gameActors.actor(id)){
					gainResults.push({actor: $gameActors.actor(id), expGain: 0, ppGain: battleEffect.ppGain});
				}				
			});
		
			var gainDonors = battleEffect.gainDonors;
			var itemDrops = [];
			gainDonors.forEach(function(gainDonor){
				if(gainDonor.isDestroyed){
					$statCalc.addKill(battleEffect.ref);
				}				
				if(gainDonor.isDestroyed){
					var items = $statCalc.getEquipInfo(gainDonor.ref);
					if(items){
						items.forEach(function(item){
							if(item){
								$inventoryManager.addItem(item.idx);
								itemDrops.push(item.idx);	
							}							
						});
					}					
				}
								
				
				gainResults.forEach(function(entry){	
					var gain = $battleCalc.performExpCalculation(entry.actor, gainDonor.ref);
					if(!gainDonor.isDestroyed){
						gain = Math.floor(gain/10);
					}
					entry.expGain+=gain;
				});
			});	

			if($statCalc.isMainTwin(battleEffect.ref)){
				var subTwin = battleEffect.ref.subTwin;
				var gainModifier = 0.75;
				if($statCalc.applyStatModsToValue(subTwin, 0, ["full_twin_gains"])){
					gainModifier = 1;
				}
				gainResults.unshift({actor: subTwin, expGain: Math.floor(battleEffect.expGain * gainModifier), ppGain: Math.floor(battleEffect.ppGain * gainModifier)});	
			}	
			
			gainResults.unshift({actor: battleEffect.ref, expGain: battleEffect.expGain, ppGain: battleEffect.ppGain});			
			
			var expResults = [];
			gainResults.forEach(function(entry){						
				$statCalc.addPP(entry.actor, battleEffect.ppGain);
				expResults.push({actor: entry.actor, details: $statCalc.addExp(entry.actor, entry.expGain)});				
			});				
			
			$gameTemp.rewardsInfo = {
				//actor: battleEffect.ref,
				levelResult: expResults,
				//expGain: battleEffect.expGain,
				//ppGain: battleEffect.ppGain,
				itemDrops: itemDrops,
				fundGain: battleEffect.fundGain,
				gainResults: gainResults
			};
		}
	
		function applyCostsToActor(actor, weapon, battleResult){
			if(actor && weapon && battleResult){			
				var targetActors = [actor];
				if(weapon.isCombination){
					targetActors  = targetActors.concat($statCalc.getCombinationWeaponParticipants(actor, weapon).participants);
				}
				targetActors.forEach(function(actor){
					if(actor && actor.SRWStats && actor.SRWStats.mech){
						if(battleResult.hasActed){
							var ENCost = battleResult.ENUsed;
							ENCost = $statCalc.applyStatModsToValue(actor, ENCost, ["EN_cost"]);
							
							if(!$statCalc.applyStatModsToValue(actor, 0, ["en_to_power"])){
								ENCost = $statCalc.applyStatModsToValue(actor, ENCost, ["EN_cost"]);
							}
										
							actor.setMp(actor.mp - Math.floor(ENCost));
							if(weapon){
								$statCalc.modifyCurrentAmmo(actor, weapon, battleResult.ammoUsed * -1);
							}
							var MPCost = battleResult.MPCost;
							if(MPCost){
								MPCost = $statCalc.applyStatModsToValue(actor, MPCost, ["MP_cost"]);
								$statCalc.applyMPCost(actor, MPCost);
							}														
						}								
					}					
				});	
			}	
			if(battleResult && battleResult.barrierCost){
				actor.setMp(actor.mp - Math.floor(battleResult.barrierCost));
			}	
		}
		function applyStatusConditions(statusEffects, defender, hasFury){
			var resistance = $statCalc.applyMaxStatModsToValue(defender, 0, ["status_resistance"]);
			if(resistance < 1 || (hasFury && resistance == 1)){			
				if(statusEffects.inflict_accuracy_down){
					$statCalc.setAccuracyDown(defender, statusEffects.inflict_accuracy_down);
				}
				if(statusEffects.inflict_mobility_down){
					$statCalc.setMobilityDown(defender, statusEffects.inflict_mobility_down);
				}
				if(statusEffects.inflict_armor_down){
					$statCalc.setArmorDown(defender, statusEffects.inflict_armor_down);
				}
				if(statusEffects.inflict_move_down){
					$statCalc.setMovementDown(defender, statusEffects.inflict_move_down);
				}
				if(statusEffects.inflict_attack_down){
					$statCalc.setAttackDown(defender, statusEffects.inflict_attack_down);
				}
				if(statusEffects.inflict_range_down){
					$statCalc.setRangeDown(defender, statusEffects.inflict_range_down);
				}				
				if(statusEffects.inflict_disable){
					$statCalc.setDisabled(defender);
				}
				if(statusEffects.inflict_spirit_seal){
					$statCalc.setSpiritsSealed(defender);
				}
				var SPReduction = statusEffects.inflict_SP_down || 0;
				$statCalc.applySPCost(defender, SPReduction);
				
				var willReduction = statusEffects.inflict_will_down || 0;
				$statCalc.modifyWill(defender, willReduction * -1);
			}
		}
		$gameTemp.clearMoveTable();
		if($gameTemp.mapAttackOccurred){
			Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
				var battleEffect = $gameTemp.battleEffectCache[cacheRef];
				if(battleEffect.ref && !battleEffect.ref.isActor()){
					battleEffect.ref.setSquadMode("normal");
				}
				if(battleEffect.attacked && battleEffect.attacked.ref && !battleEffect.attacked.ref.isActor()){
					battleEffect.attacked.ref.setSquadMode("normal");
				}
				applyCostsToActor(battleEffect.ref, battleEffect.action.attack, battleEffect);
				if(battleEffect.damageTaken){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP;
					battleEffect.ref.setHp(oldHP - battleEffect.damageTaken);
				}
				
				var defenderPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.ref);
				var attackerPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.attackedBy);
				
				if(battleEffect.attackedBy && battleEffect.isDestroyed){
					$statCalc.modifyWill(battleEffect.attackedBy.ref, Math.floor((attackerPersonalityInfo.destroy || 0) / 2));
					//$statCalc.modifyAllWill(battleEffect.isActor ? "actor" : "enemy", 1);	
					$statCalc.applyEnemyDestroyedWill($gameSystem.getFactionId(battleEffect.attackedBy.ref));	
				}
				if(battleEffect.isAttacked){		
					if(!battleEffect.isHit){
						$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["evade_will"]));
						$statCalc.modifyWill(battleEffect.ref, defenderPersonalityInfo.evade);
						$statCalc.incrementEvadeCount(battleEffect.ref);
					} else {						
						$statCalc.resetEvadeCount(battleEffect.ref);
					}					
				}
				if(battleEffect.isHit){		
					$statCalc.modifyWill(battleEffect.ref, defenderPersonalityInfo.damage);
					$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["damage_will"]));
					if(battleEffect.attackedBy && battleEffect.statusReceived && (battleEffect.damageTaken > 0 || battleEffect.receivedBuff)){
						applyStatusConditions(battleEffect.statusReceived, battleEffect.ref, battleEffect.attackedBy.hasFury);
					}					
				}
				if(battleEffect.type == "initiator"){
					$statCalc.clearNonMapAttackCounter(battleEffect.ref);
				} else {
					if($statCalc.getCalculatedMechStats(battleEffect.ref).currentHP <= 100000){
						$statCalc.setRevealed(battleEffect.ref);
					}	
					if(battleEffect.attacked && battleEffect.attacked.ref && $statCalc.getCalculatedMechStats(battleEffect.attacked.ref).currentHP <= 100000){
						$statCalc.setRevealed(battleEffect.attacked.ref);
					}
					if(battleEffect.isAttacked){
						$statCalc.clearSpirit(battleEffect.ref, "alert");
					}
					if(battleEffect.isHit){
						$statCalc.clearSpirit(battleEffect.ref, "persist");
					}
				}				
				if(battleEffect.isActor && battleEffect.type == "initiator"){	
					processGains(battleEffect);
				}
			});	
			$gameTemp.mapAttackOccurred = false;
			if($gameTemp.isEnemyAttack){
				this.srpgAfterAction();
			} else {
				$gameParty.gainGold($gameTemp.rewardsInfo.fundGain);	
				$gameTemp.rewardsDisplayTimer = 20;	
				$gameSystem.setSubBattlePhase("rewards_display");				
				$gameTemp.pushMenu = "rewards";
			}			
		} else if($gameTemp.battleOccurred){
			var actorIsDestroyed = false;
			if($gameTemp.supportAttackCandidates){
				$gameTemp.supportAttackCandidates.forEach(function(candidate){
					candidate.actor.isSupport = false;
					if(candidate.actor.subTwin){
						candidate.actor.subTwin.isSupport = false;
					}
				});
			}
			Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
				var battleEffect = $gameTemp.battleEffectCache[cacheRef];
				
				if(battleEffect.ref){
					if(battleEffect.HPRestored){
						$statCalc.recoverHP(battleEffect.ref, battleEffect.HPRestored);
					}					
				}
				
				if(battleEffect.ref && !battleEffect.ref.isActor()){
					battleEffect.ref.setSquadMode("normal");
				}
				if(battleEffect.attacked && battleEffect.attacked.ref && !battleEffect.attacked.ref.isActor()){
					battleEffect.attacked.ref.setSquadMode("normal");
				}
				applyCostsToActor(battleEffect.ref, battleEffect.action.attack, battleEffect);
				if(battleEffect.hasActed && battleEffect.attacked){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.attacked.ref).currentHP;
					battleEffect.attacked.ref.setHp(oldHP - battleEffect.damageInflicted);
				}
				if(battleEffect.hasActed && battleEffect.attacked_all_sub){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.attacked_all_sub.ref).currentHP;
					battleEffect.attacked_all_sub.ref.setHp(oldHP - battleEffect.damageInflicted_all_sub);
				}
				
				var personalityInfo = $statCalc.getPersonalityInfo(battleEffect.ref);
				
				
				if(battleEffect.attacked && battleEffect.attacked.isDestroyed && battleEffect.attacked.destroyer == battleEffect.ref){					
					$statCalc.modifyWill(battleEffect.ref, personalityInfo.destroy || 0);
					//$statCalc.modifyAllWill(battleEffect.isActor ? "actor" : "enemy", 1);	
					$statCalc.applyEnemyDestroyedWill($gameSystem.getFactionId(battleEffect.ref));	
				}	
				if(battleEffect.isAttacked){		
					if(!battleEffect.isHit){
						;
						$statCalc.incrementEvadeCount(battleEffect.ref);
					} else {
						$statCalc.resetEvadeCount(battleEffect.ref);
					}					
				}
				if(battleEffect.isHit){		
					
				}
				if(battleEffect.attacked){	
					var defenderPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.attacked.ref);
					if(battleEffect.hits){
						$statCalc.modifyWill(battleEffect.ref, personalityInfo.hit || 0);
						$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["hit_will"]));

						$statCalc.modifyWill(battleEffect.attacked.ref, defenderPersonalityInfo.damage || 0);
						$statCalc.modifyWill(battleEffect.attacked.ref, $statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["damage_will"]));						
						
						if(battleEffect.damageInflicted > 0|| battleEffect.attacked.receivedBuff){
							applyStatusConditions(battleEffect.statusEffects, battleEffect.attacked.ref, battleEffect.hasFury);
						}
						
					} else {
						
						$statCalc.modifyWill(battleEffect.attacked.ref, defenderPersonalityInfo.evade || 0)
						$statCalc.modifyWill(battleEffect.attacked.ref, $statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["evade_will"]));
									
						$statCalc.modifyWill(battleEffect.ref, personalityInfo.miss || 0);
					}					
				}			
				if(battleEffect.type == "initiator"){
					$statCalc.incrementNonMapAttackCounter(battleEffect.ref);
				}
				if(battleEffect.isActor && (battleEffect.type == "initiator" || battleEffect.type == "defender")){
					if(battleEffect.isDestroyed) {
						actorIsDestroyed = true;
					} else if($gameTemp.currentBattleEnemy != battleEffect.ref){//do not process gains for allies that served as the target for an ally attack
						processGains(battleEffect);
					}						
				}
				
				if(battleEffect.isAttacked && !battleEffect.receivedBuff){
					$statCalc.clearSpirit(battleEffect.ref, "alert");
				}
				if(battleEffect.isHit && !battleEffect.receivedBuff){
					$statCalc.clearSpirit(battleEffect.ref, "persist");
				}
				if(battleEffect.type == "support attack" && battleEffect.hasActed){
					$statCalc.incrementSupportAttackCounter(battleEffect.ref);
				}
				if(battleEffect.type == "support defend" && battleEffect.hasActed){
					$statCalc.incrementSupportDefendCounter(battleEffect.ref);
				}
				if($statCalc.getCalculatedMechStats(battleEffect.ref).currentHP <= 100000){
					$statCalc.setRevealed(battleEffect.ref);
				}	
				if(battleEffect.attacked && battleEffect.attacked.ref && $statCalc.getCalculatedMechStats(battleEffect.attacked.ref).currentHP <= 100000){
					$statCalc.setRevealed(battleEffect.attacked.ref);
				}
			});
			$gameTemp.battleOccurred = false;
			$gameTemp.currentBattleResult = null;
			if(actorIsDestroyed){				
				this.srpgPrepareNextAction();
			} else if($gameTemp.rewardsInfo){
				$gameParty.gainGold($gameTemp.rewardsInfo.fundGain);	
				$gameTemp.rewardsDisplayTimer = 20;
				$gameSystem.setSubBattlePhase("rewards_display");				
				/*this._rewardsWindow.refresh();
				//this._rewardsWindow.open();
				this._rewardsWindow.show();
				this._rewardsWindow.activate();	*/
				$gameTemp.pushMenu = "rewards";
			} else {
				this.srpgPrepareNextAction();
			}						
		} else {
			this.srpgPrepareNextAction();
		}
		$statCalc.resetCurrentAttack($gameTemp.currentBattleActor);	
		$statCalc.resetCurrentAttack($gameTemp.currentBattleEnemy);	
		
	}	
	
	Scene_Map.prototype.srpgPrepareNextAction = function(){
		$gameTemp.rewardsInfo = null;	
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.activeEvent().lastMoveCount = 0;
		if(!$gameTemp.eraseActorAfterTurn && (battler.SRPGActionTimes() >= 1 && !$gameTemp.isPostMove && $statCalc.applyStatModsToValue(battler, 0, ["hit_and_away"])) && $gameSystem.isBattlePhase() != "AI_phase"){
			$gameTemp.isHitAndAway = true;
			$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			$gameSystem.setSubBattlePhase('actor_command_window');			
			return;
		}
		$gameTemp.eraseActorAfterTurn = false;
       
        battler.srpgCheckFloorEffect($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		
		if($gameTemp.isPostMove){
			$statCalc.clearSpirit(battler, "accel");
			$statCalc.clearSpirit(battler, "charge");
		}
        
		var hasDefeatedOpponent;
		var battleEffect;
		if($gameTemp.battleEffectCache){
			battleEffect = $gameTemp.battleEffectCache[battler._cacheReference];
		}		
		
		if(battleEffect && battleEffect.attacked){
			hasDefeatedOpponent	= battleEffect.attacked.isDestroyed;
		}		
		var hasContinuousAction = $statCalc.applyStatModsToValue(battler, 0, ["continuous_action"]) && !$statCalc.hasUsedContinuousAction(battler);
		
		if(hasDefeatedOpponent && hasContinuousAction){
			$statCalc.setHasUsedContinuousAction(battler);
		} else if($statCalc.getActiveSpirits(battler).zeal){
			$statCalc.clearSpirit(battler, "zeal");
		} else if($statCalc.consumeAdditionalAction(battler)){
			//do not end turn if an action could be consumed
		} else {
			if (battler.SRPGActionTimes() <= 1) {
				battler.setSrpgTurnEnd(true);
			} else {
				battler.useSRPGActionTimes(1);
			}
		}	
        
        $gameSystem.clearSrpgActorCommandWindowNeedRefresh();
        $gameSystem.clearSrpgActorCommandStatusWindowNeedRefresh();        
        $gameTemp.clearTargetEvent();
        $gameParty.clearSrpgBattleActors();
        $gameTroop.clearSrpgBattleEnemys();
		$gameTemp.battleEffectCache = null;
       
	   $gameSystem.setSubBattlePhase('check_item_pickup');	
    };

    //ユニットイベントの実行
    Scene_Map.prototype.eventUnitEvent = function() {
        $gameMap.eventsXy($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()).forEach(function(event) {
            if (event.isType() === 'unitEvent') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
                $gameSystem.pushSearchedItemList([$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()]);
            }
        });
    };

    //行動前イベントの実行
    Scene_Map.prototype.eventBeforeBattle = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'beforeBattle') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
		if ($gameTemp.isSrpgEventList()) {
            var event = $gameTemp.shiftSrpgEventList();
            if (event.isStarting()) {
                event.clearStartingFlag();
                $gameMap._interpreter.setup(event.list(), event.eventId());
            }
        }
    };
	
	Scene_Map.prototype.eventBeforeDestruction = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'beforeDestruction') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
		if ($gameTemp.isSrpgEventList()) {
            var event = $gameTemp.shiftSrpgEventList();
            if (event.isStarting()) {
                event.clearStartingFlag();
                $gameMap._interpreter.setup(event.list(), event.eventId());
            }
        }
    };

    //行動後イベントの実行
    Scene_Map.prototype.eventAfterAction = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'afterAction') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
    };

    //アクターターン終了の判定
    Scene_Map.prototype.isSrpgActorTurnEnd = function() {
        /*return $gameMap.events().some(function(event) {
            var battlerArray = $gameSystem.EventToUnit(event._eventId);
            if (battlerArray && battlerArray[0] === 'actor') {
                return battlerArray[1].canInput();
            }
        });*/
		return $gameTemp.isTurnEndFlag();
    };

    //アクターコマンド・攻撃
    Scene_Map.prototype.commandAttack = function() {
		var _this = this
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
       /* this._attackWindow.setActor(actor);
        this._attackWindow.setStypeId(this._mapSrpgActorCommandWindow.currentExt());
        this._attackWindow.refresh();
        this._attackWindow.show();
        this._attackWindow.activate();*/
		
		$gameTemp.summaryUnit = null;
		
		$gameTemp.showAllyAttackIndicator = true;
		$gameTemp.showAllyDefendIndicator = false;
		$gameTemp.showEnemyAttackIndicator = false;
		$gameTemp.showEnemyDefendIndicator = true;
		
		
		
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.attackWindowCallback = function(attack){
			$gameTemp.popMenu = true;	
			$gameTemp.actorAction.type = "attack";  
			$gameTemp.actorAction.attack = attack;
			_this.startActorTargeting();
		};		
		$gameTemp.attackWindowCancelCallback = function(){						
			_this._mapSrpgActorCommandWindow.activate();
		
		}
		
		$gameTemp.pushMenu = "attack_list";
    };

    //アクターコマンド・スキル
    Scene_Map.prototype.commandSkill = function() {
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        this._skillWindow.setActor(actor);
        this._skillWindow.setStypeId(this._mapSrpgActorCommandWindow.currentExt());
        this._skillWindow.refresh();
        this._skillWindow.show();
        this._skillWindow.activate();
    };

    //アクターコマンド・アイテム
    Scene_Map.prototype.commandItem = function() {
        this._itemWindow.refresh();
        this._itemWindow.show();
        this._itemWindow.activate();
    };
	
	 Scene_Map.prototype.commandAbility = function() {
        this._abilityWindow.refresh();
        this._abilityWindow.show();
        this._abilityWindow.activate();
    };
	
	

    //アクターコマンド・装備
    Scene_Map.prototype.commandEquip = function() {
        SceneManager.push(Scene_Equip);
    };

    //アクターコマンド・待機
    Scene_Map.prototype.commandWait = function() {
		$gameTemp.isPostMove = true;
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.clearTwinPositionInfo(actor);
		actor.onAllActionsEnd();
		this.srpgAfterAction();		       
    };
	
	Scene_Map.prototype.commandLand = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setSuperState(actor, false);
		
		$gameTemp.activeEvent().transitioningFloat = true;
		$gameSystem.setSubBattlePhase('await_actor_float');
		
		
		this._mapSrpgActorCommandWindow.refresh();
		this._mapSrpgActorCommandWindow.deactivate();
    };
	
	Scene_Map.prototype.commandFly = function() {
		
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setSuperState(actor, true);
	   
		$gameTemp.activeEvent().transitioningFloat = true;
		$gameSystem.setSubBattlePhase('await_actor_float');
		
		
		this._mapSrpgActorCommandWindow.refresh();
		this._mapSrpgActorCommandWindow.deactivate();
    };
	
	Scene_Map.prototype.commandChangeSuperState = function(idx) {
		
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		let terrainCmd = $statCalc.getAvailableSuperStateTransitionsForCurrentPosition(actor)[idx];	
		$statCalc.setSuperState(actor, terrainCmd.endState, false, terrainCmd.se);
	   
		$gameTemp.activeEvent().transitioningFloat = true;
		$gameSystem.setSubBattlePhase('await_actor_float');		
		
		this._mapSrpgActorCommandWindow.refresh();
		this._mapSrpgActorCommandWindow.deactivate();
    };	
	
	Scene_Map.prototype.commandSpirit = function() {
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.pushMenu = "spirit_selection";
		this._mapSrpgActorCommandWindow.hide()
    };	
	
	Scene_Map.prototype.commandDeploy = function() {
		var _this = this;
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		this._deploySelectionWindow.setAvailableUnits($statCalc.getBoardedUnits(actionBattlerArray[1]));
		this._deploySelectionWindow.setCurrentSelection(0);
      	$gameTemp.pushMenu = "boarded_deploy_selection";
		this._mapSrpgActorCommandWindow.hide();
		//this._mapSrpgActorCommandWindow.close();
		//$gameSystem.clearSrpgActorCommandWindowNeedRefresh(actionBattlerArray[1]);
		
		$gameTemp.deployWindowCallback = function(deployed){
			var shipEvent = $gameTemp.activeEvent();
			$gameTemp.activeShip = {position: {x: shipEvent.posX(), y: shipEvent.posY()}, actor: $gameSystem.EventToUnit(shipEvent.eventId())[1], event: $gameTemp.activeEvent()};
			$gameTemp.activeEvent().isActiveShip = true;
			$statCalc.removeBoardedUnit(deployed.actor, $gameTemp.activeShip.actor);				
			var event = deployed.actor.event;
			event.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			event.appear();				

			$statCalc.applyRelativeTransforms();	
			$gameMap.setEventImages();	
			
			$gameTemp.setActiveEvent(event);			
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			//$gameSystem.srpgMakeMoveTable(event);
			var battlerArray = actor;		
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			_this._mapSrpgActorCommandWindow.close();
			//$gameSystem.setSubBattlePhase('actor_move');
		}
		
		$gameTemp.deployCancelWindowCallback = function(){
			//$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			_this._mapSrpgActorCommandWindow.show();
			_this._mapSrpgActorCommandWindow.activate();
		}
    };	
	
	Scene_Map.prototype.commandBoard = function() {
		var event = $gameTemp.activeEvent();
       	var actionBattlerArray = $gameSystem.EventToUnit(event.eventId());
		/*$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.pushMenu = "spirit_selection";
		this._mapSrpgActorCommandWindow.hide()*/
		if($gameTemp.targetShip){
			$statCalc.addBoardedUnit(actionBattlerArray[1], $gameTemp.targetShip.actor);
			$statCalc.invalidateAbilityCache(actionBattlerArray[1]);
			$gameSystem.setSrpgWaitMoving(true);
            event.srpgMoveToPoint($gameTemp.targetShip.position);
			$gameTemp.clearMoveTable();
			$gameTemp.eraseActorAfterTurn = true;
			$gameSystem.setSubBattlePhase('end_actor_turn');
			$gameTemp.targetShip = null;
			
		}
    };	
	
	Scene_Map.prototype.commandHeal = function() {
        //var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var event = $gameTemp.activeEvent();
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.supportType = "heal";        
		/*$gameTemp.clearMoveTable();
        $gameTemp.initialRangeTable(event.posX(), event.posY(), 1);
        event.makeRangeTable(event.posX(), event.posY(), 1, [0], event.posX(), event.posY(), null);
        $gameTemp.minRangeAdapt(event.posX(), event.posY(), 0);
        $gameTemp.pushRangeListToMoveList();
        $gameTemp.setResetMoveList(true);*/
		$gameSystem.highlightedTiles = [];
		$gameSystem.highlightedActionTiles = [];
		$gameSystem.highlightsRefreshed = true;
		var x = $gameTemp.activeEvent().posX();
		var y = $gameTemp.activeEvent().posY();		
		
		if(!$statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){
			$gameSystem.highlightedActionTiles.push({x: x, y: y+1, color: "#009bff"});	
			$gameSystem.highlightedActionTiles.push({x: x-1, y: y, color: "#009bff"});
			$gameSystem.highlightedActionTiles.push({x: x+1, y: y, color: "#009bff"});
			$gameSystem.highlightedActionTiles.push({x: x, y: y-1, color: "#009bff"});
		}
	
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_support');
    };	
	
	Scene_Map.prototype.commandResupply = function() {
        //var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var event = $gameTemp.activeEvent();
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.supportType = "resupply";        
		/*$gameTemp.clearMoveTable();
		if(!$statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){			
			$gameTemp.initialRangeTable(event.posX(), event.posY(), 1);
			event.makeRangeTable(event.posX(), event.posY(), 1, [0], event.posX(), event.posY(), null);
			 $gameTemp.minRangeAdapt(event.posX(), event.posY(), 0);
			$gameTemp.pushRangeListToMoveList();
			$gameTemp.setResetMoveList(true);
		}    */       
		
		if(!$statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){	
			$gameSystem.highlightedTiles = [];
			$gameSystem.highlightedActionTiles = [];
			$gameSystem.highlightsRefreshed = true;
			var x = $gameTemp.activeEvent().posX();
			var y = $gameTemp.activeEvent().posY();		
		
			$gameSystem.highlightedActionTiles.push({x: x, y: y+1, color: "#009bff"});	
			$gameSystem.highlightedActionTiles.push({x: x-1, y: y, color: "#009bff"});
			$gameSystem.highlightedActionTiles.push({x: x+1, y: y, color: "#009bff"});
			$gameSystem.highlightedActionTiles.push({x: x, y: y-1, color: "#009bff"});
		}
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_support');
    };	
	
	//command version of actor movement
	Scene_Map.prototype.commandMove = function() {
		var event = $gameTemp.activeEvent();
        var actor = $gameSystem.EventToUnit(event.eventId())[1];
        $gameSystem.srpgMakeMoveTable(event, true);
		var battlerArray = actor;		
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_move');
    };

	Scene_Map.prototype.transformActorMenuCommand = function() {   
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var list = $statCalc.getTransformationList(actor);
		if(list.length == 1){
			$statCalc.transform(actor, null, true, list[0]);
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameSystem.setSubBattlePhase('normal');
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);	
		} else {
			this._transformWindow.refresh();
			this._transformWindow.show();
			this._transformWindow.activate();
		}		
    };	
	
	Scene_Map.prototype.swapPilotMenuCommand = function() { 
		this._swapPilotWindow.refresh();
		this._swapPilotWindow.show();
		this._swapPilotWindow.activate();
	} 	
	
	Scene_Map.prototype.transformAllActorMenuCommand = function() {   
		var hadTransform = false;
		$statCalc.iterateAllActors("actor", function(actor, event){
			if(actor && event && !event.isErased() && !actor.srpgTurnEnd()){
				if(ENGINE_SETTINGS.TRANSFORM_ALL_EXCEPTIONS.indexOf(actor.actorId()) == -1){
					var list = $statCalc.getTransformationList(actor);
					if(list.length){
						hadTransform = true;
						$statCalc.transform(actor, null, true, list[list.length - 1]);
					}					
				}				
			}
		});
		if(hadTransform){
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		} else {
			SoundManager.playBuzzer();
		} 		
    };		
	
	Scene_Map.prototype.swapActorMenuCommand = function() {   
		$statCalc.swap($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
    };
	
	Scene_Map.prototype.separateActorMenuCommand = function() {   
		$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
    };	
	
	Scene_Map.prototype.statusActorMenuCommand = function() { 
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		var unit = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.detailPagesWindowCancelCallback = function(){
			$gameTemp.detailPagesWindowCancelCallback = null;
			$gameSystem.setSubBattlePhase('normal');
		};
		$gameTemp.currentMenuUnit = {
			actor: unit,
			mech: unit.SRWStats.mech
		};
		$gameTemp.detailPageMode = "map";
		$gameSystem.setSubBattlePhase('enemy_unit_summary');
		$statCalc.invalidateAbilityCache(unit);
		$gameTemp.pushMenu = "detail_pages";
	}
	
	Scene_Map.prototype.joinActorMenuCommand = function() {   
		//$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		
		$gameSystem.highlightedActionTiles = [];
		$gameSystem.highlightsRefreshed = true;
		var x = $gameTemp.activeEvent().posX();
		var y = $gameTemp.activeEvent().posY();
		
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y-1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x, y: y-1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y-1, color: "#009bff"});
		
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('twin_selection');
    };	
	
	Scene_Map.prototype.splitActorMenuCommand = function() {   
		$statCalc.split($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
    };
	
	Scene_Map.prototype.combineActorMenuCommand = function() {   
		$statCalc.combine($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
    };
		
	Scene_Map.prototype.persuadeActorMenuCommand = function() {
		$gameTemp.isPostMove = true;
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var persuadeOption = $gameSystem.getPersuadeOption(actor);
		$gameVariables.setValue(persuadeOption.controlVar, 1);
		actor.onAllActionsEnd();
		this.srpgAfterAction();	       
    };

    //アクターコマンド・キャンセル
    Scene_Map.prototype.cancelActorMenuCommand = function() {
        $gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		if($gameTemp.activeShip && !$gameTemp.isPostMove){
			var event = $gameTemp.activeEvent();
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			$statCalc.addBoardedUnit(actor, $gameTemp.activeShip.actor);			
			//event.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			event.erase();				
				
			$statCalc.applyRelativeTransforms();
			//$gameMap.setEventImages();	
			$gameTemp.setActiveEvent($gameTemp.activeShip.actor.event);
			$gameTemp.forceActorMenuRefresh = true;
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
				
			$gameTemp.clearActiveShip();
		} else if($gameSystem.isSubBattlePhase() == "confirm_boarding"){
			$gameSystem.setSubBattlePhase('actor_move');
		} else if($gameTemp.isPostMove){
			$gameSystem.setSubBattlePhase('actor_move');
			if($gameTemp.hasTwinned){
				$gameTemp.hasTwinned = false;
				$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
			}
			//var event = $gameTemp.activeEvent();
			//event.locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
		} else if($gameTemp.isHitAndAway){
			$gameTemp.isPostMove = true;
			var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
			$statCalc.clearTwinPositionInfo(actor);
			actor.onAllActionsEnd();
			this.srpgAfterAction();	
		}else{
			$gameTemp.clearActiveEvent();
			$gameSystem.setSubBattlePhase('normal');
		}        
    };

	
   
	
	Scene_Map.prototype.onConsumableOk = function() {
        var item = this._itemWindow.item();		
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setConsumableUsed(actor, item.listIdx);
        $itemEffectManager.applyConsumable(actor, item.itemIdx);
        this._itemWindow.hide();
		//this._mapSrpgActorCommandWindow.setup(actor);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('wait');
    };
	

    //アイテムコマンド・キャンセル
    Scene_Map.prototype.onItemCancel = function() {
        this._itemWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onAbilityOk = function() {
        var item = this._abilityWindow.item();		
		var itemDef = $abilityCommandManger.getAbilityDef(item);
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		if(itemDef && itemDef.isActiveHandler(actor)){			
			var useInfo = $abilityCommandManger.getUseInfo(actor, item);
			if(useInfo.type == "ammo" || useInfo.type == null){
				$statCalc.setAbilityUsed(actor, item);
			} else if(useInfo.type == "EN"){
				var ENCost = useInfo.cost;										
				actor.setMp(actor.mp - Math.floor(ENCost));
			} else if(useInfo.type == "MP"){
				$statCalc.applyMPCost(actor, useInfo.cost);
			}				
			itemDef.statmodHandler(actor);
       
			this._abilityWindow.hide();
			this._mapSrpgActorCommandWindow.deactivate();
			this._mapSrpgActorCommandWindow.hide();
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();				
			
			if(itemDef.animId != null && itemDef.animId != -1){
				$gameSystem.setSubBattlePhase('await_character_anim');	
				$gameTemp.animCharacter = actor.event;
				actor.event.requestAnimation(itemDef.animId);
			}			
		} else {
			this._abilityWindow.activate();
		}
    };
	
	Scene_Map.prototype.onTransformOk = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        var item = this._transformWindow.item();		
		$statCalc.transform(actor, 0, true, item);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
		this._transformWindow.hide();
    };
	
	Scene_Map.prototype.onSwapPilotOk = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        var item = this._swapPilotWindow.item();		
		$statCalc.swapPilot(actor, item);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		//$gameSystem.setSubBattlePhase('normal')
		this._swapPilotWindow.hide();
		
		actor.onAllActionsEnd();
		this.srpgAfterAction();	
    };	
	
	Scene_Map.prototype.onAbilityCancel = function() {
        this._abilityWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onTransformCancel = function() {
        this._transformWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onSwapPilotCancel = function() {
        this._swapPilotWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };	
	
	
	Scene_Map.prototype.getMapAttackTargets = function(originEvent, attack, type, direction) {
		var _this = this;	
		var result = [];
		var deltaX = originEvent.posX();
		var deltaY = originEvent.posY();
		
		var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
		
		var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.shape));		
		tileCoordinates = _this.getAdjustedMapAttackCoordinates(tileCoordinates, direction);
		for(var i = 0; i < tileCoordinates.length; i++){
			tileCoordinates[i].push(true); //is attack range
			tileCoordinates[i][0]+=deltaX;
			tileCoordinates[i][1]+=deltaY;
			//$gameTemp.pushMoveList(tileCoordinates[i]);					
		}			
		
		if(mapAttackDef.retargetInfo && mapAttackDef.retargetInfo.shape.length){
			for(var i = 0; i < tileCoordinates.length; i++){
				var retargetCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
				retargetCoordinates = _this.getAdjustedMapAttackCoordinates(retargetCoordinates, direction);
				
				var x = mapAttackDef.retargetInfo.initialPosition.x;
				var y = mapAttackDef.retargetInfo.initialPosition.y;
				var adjusted = _this.getAdjustedMapAttackCoordinates([[x, y]], direction);
				
				var deltaX =  tileCoordinates[i][0] - adjusted[0][0];
				var deltaY =  tileCoordinates[i][1] - adjusted[0][1];
				
				for(var j = 0; j < retargetCoordinates.length; j++){
					retargetCoordinates[j][0]+=deltaX;
					retargetCoordinates[j][1]+=deltaY;			
				}
				
				
				var targets = $statCalc.activeUnitsInTileRange(retargetCoordinates || [], type);
				var tmp = [];
				for(var j = 0; j < targets.length; j++){
					if(targets[j] != $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]){
						var terrain = $statCalc.getCurrentTerrain(targets[j]);					
						var terrainRank = attack.terrain[terrain];
						if(terrainRank != "-"){
							tmp.push(targets[j]);
						}
					}					
				}
				result.push({position: {x: tileCoordinates[i][0], y: tileCoordinates[i][1]}, direction: direction, targets: tmp});
			}
		} else {
			var targets = $statCalc.activeUnitsInTileRange(tileCoordinates || [], type);
			var tmp = [];
			for(var i = 0; i < targets.length; i++){
				var terrain = $statCalc.getCurrentTerrain(targets[i]);					
				var terrainRank = attack.terrain[terrain];
				if(terrainRank != "-"){
					tmp.push(targets[i]);
				}
			}
			result.push({targets: tmp, direction: direction});
		}
		return result;
	}
	
	Scene_Map.prototype.getBestMapAttackTargets = function(originEvent, attack, type) {
		var _this = this;				
			
		var directions = ["up", "down", "left", "right"];
		var maxTargets = -1;
		var bestDirection = "up";
		var bestPosition;
		var bestTargets = [];
		
		directions.forEach(function(direction){		
			var targetResults = _this.getMapAttackTargets(originEvent, attack, type, direction);
			targetResults.forEach(function(targetResult){
				if(targetResult.targets.length > maxTargets){
					maxTargets = targetResult.targets.length;
					bestDirection = targetResult.direction;
					bestPosition = targetResult.position;
					bestTargets = targetResult.targets;
				}
			});
			
		});
		return {targets: bestTargets, direction: bestDirection, bestPosition: bestPosition};
	}
    //ターゲットの選択開始
    Scene_Map.prototype.startActorTargeting = function() {
		var _this = this;
        var event = $gameTemp.activeEvent();
        var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        var weapon = $gameTemp.actorAction.attack;
		if(weapon.isMap){
			$gameTemp.currentBattleActor = battler;			
			var type;
			if(battler.isActor()){
				type = "enemy";
			} else {
				type = "actor";
			}
			
			$gameTemp.mapTargetDirection = this.getBestMapAttackTargets(event, weapon, type).direction;			
			$statCalc.setCurrentAttack(battler, weapon);
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameTemp.OKHeld = true;
			Input.clear();
			$gameTemp.touchMapAttackState = "direction";
			$gameTemp.mapTargetDirection = "up";
			$gameSystem.setSubBattlePhase('actor_map_target');
		} else {
			var range = $statCalc.getRealWeaponRange(battler, weapon);
			var minRange = $statCalc.getRealWeaponMinRange(battler, weapon);
			
			this.setUpAttackRange(event.posX(), event.posY(), range, minRange);
			
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameSystem.targetLRId = -1;
			$gameSystem.setSubBattlePhase('actor_target');
		}		
    };
	
	Scene_Map.prototype.setUpAttackRange = function(x, y, range, minRange) {
		$gameTemp.validTiles = {};
		$gameSystem.highlightedTiles = [];
		$gameSystem.highlightsRefreshed = true;
		$gameTemp.disableHighlightGlow = true;
		for(var i = range * -1; i <= range; i++){
			for(var j = range * -1; j <= range; j++){
				var distance = Math.abs(i) + Math.abs(j);
				if(distance <= range && distance >= minRange){
					var realX = x - i;
					var realY = y - j;
					if(realX >= 0 && realX < $gameMap.width() && realY >=0 && realY <= $gameMap.height()){
						if(!$gameTemp.validTiles[realX]){
							$gameTemp.validTiles[realX] = {};
						}
						$gameTemp.validTiles[realX][realY] = true;
						$gameSystem.highlightedTiles.push({x: realX, y: realY, color: "#ff3a3a"});
					}					
				}
			}
		}	
	}

    //戦闘開始コマンド・戦闘開始
    Scene_Map.prototype.commandBattleStart = function() {
        var actionArray = $gameSystem.srpgBattleWindowNeedRefresh()[1];
		var targetArray = $gameSystem.srpgBattleWindowNeedRefresh()[2];			

        $gameSystem.setSubBattlePhase('invoke_action');
        this.srpgBattleStart(actionArray, targetArray);
    };
	
	Scene_Map.prototype.selectCounterAction = function() {		
		this._counterWindow.show();
		this._counterWindow.activate();
	}	

    //戦闘開始コマンド・キャンセル
    Scene_Map.prototype.selectPreviousSrpgBattleStart = function() {
		if(!$gameTemp.isEnemyAttack){		
			var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
			var battlerArray = $gameSystem.srpgBattleWindowNeedRefresh()[1];
			$statCalc.revertMoveCost(battler);
			$gameTemp.setSrpgDistance(0);
			$gameTemp.setSrpgSpecialRange(true);
			$gameTemp.clearTargetEvent();
			$gameSystem.setSubBattlePhase('actor_target');
		}
    };

    //メニューからのターン終了処理
    Scene_Map.prototype.menuActorTurnEnd = function() {
        for (var i = 1; i <= $gameMap.isMaxEventId(); i++) {
            var event = $gameMap.event(i);
            if (event && !event.isErased() && (event.isType() === 'actor' || event.isType() === 'ship'  || event.isType() === 'ship_event')) {
                var battlerArray =  $gameSystem.EventToUnit(event.eventId());
				if(battlerArray){
					var actor = battlerArray[1];
					if (actor && actor.canInput() == true && !actor.srpgTurnEnd()) {
						if ($gameTemp.isAutoBattleFlag() == true) {
							actor.addState(_srpgAutoBattleStateId);
						} else {
							//$gameTemp.isPostMove = true; // set post move true to ensure the hit and run command window is not sh
							$gameTemp.setActiveEvent(event);
							actor.onAllActionsEnd();
							actor.useSRPGActionTimes(99);
							this.srpgAfterAction();
						}
					}
				}				
            }
        }
        $gameTemp.setAutoBattleFlag(false);
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        } else if ($gameSystem.isBattlePhase() === 'AI_phase') {
            $gameSystem.setSubBattlePhase('enemy_command');
        }
        $gameTemp.setTurnEndFlag(false); // 処理終了
        return;
    };

    //アクターコマンドからの装備変更の後処理
    Scene_Map.prototype.srpgAfterActorEquip = function() {
        var event = $gameTemp.activeEvent();
        var battlerArray = $gameSystem.EventToUnit(event.eventId());
        $gameTemp.clearMoveTable();
        $gameTemp.initialMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], battlerArray[1].srpgMove());
        event.makeMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]), [0], battlerArray[1]);
        var list = $gameTemp.moveList();
        for (var i = 0; i < list.length; i++) {
            var pos = list[i];
            event.makeRangeTable(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0], pos[0], pos[1], $dataSkills[battlerArray[1].attackSkillId()]);
        }
        $gameTemp.pushRangeListToMoveList();
        $gameTemp.setResetMoveList(true);
        $gameTemp.setSrpgActorEquipFlag(false); // 処理終了
        return;
    };

    //自動行動アクターの行動決定
    Scene_Map.prototype.srpgInvokeAutoActorCommand = function() {
		
        for (var i = 1; i <= $gameMap.isMaxEventId() + 1; i++) {
            var event = $gameMap.event(i);
            if (event && !event.isErased() && (event.isType() === 'actor' || event.isType() === 'ship'  || event.isType() === 'ship_event')) {
                var battlerArray =  $gameSystem.EventToUnit(event.eventId());
				if(battlerArray){
					var actor = battlerArray[1];
					if (actor && actor.canMove() == true && !actor.srpgTurnEnd()) {
						break;
					}
				}
            }
            if (i > $gameMap.isMaxEventId()) {
                $gameSystem.srpgStartEnemyTurn(0); // エネミーターンの開始
                return;
            }
        }
        actor.makeActions();
        if (actor.isConfused()) {
            actor.makeConfusionActions();
        }
        if (_srpgStandUnitSkip === 'true' && actor.battleMode() === 'stand') {
            var targetType = this.makeTargetType(actor, 'actor');
            $gameTemp.setActiveEvent(event);
            $gameSystem.srpgMakeMoveTable(event);
            var canAttackTargets = this.srpgMakeCanAttackTargets(enemy, targetType); //行動対象としうるユニットのリストを作成
            $gameTemp.clearMoveTable();
            if (canAttackTargets.length === 0) {
                $gameTemp.setActiveEvent(event);
                actor.onAllActionsEnd();
                this.srpgAfterAction();
                return;
            }
        }
        if (actor.action(0).item()) {
            $gameTemp.setAutoMoveDestinationValid(true);
            $gameTemp.setAutoMoveDestination(event.posX(), event.posY());
            $gameTemp.setActiveEvent(event);
            $gameSystem.setSubBattlePhase('auto_actor_move');
        } else {
            $gameTemp.setActiveEvent(event);
            actor.onAllActionsEnd();
            this.srpgAfterAction();
        }
    };

    //自動行動アクターの移動先決定と移動実行
    Scene_Map.prototype.srpgInvokeAutoActorMove = function() {
        var event = $gameTemp.activeEvent();
        var type = $gameSystem.EventToUnit(event.eventId())[0];
        var actor = $gameSystem.EventToUnit(event.eventId())[1];
        var targetType = this.makeTargetType(actor, type);
        $gameSystem.srpgMakeMoveTable(event);
        this.srpgPriorityTarget(actor); //優先ターゲットの設定
        var canAttackTargets = this.srpgMakeCanAttackTargets(actor, targetType); //行動対象としうるユニットのリストを作成
        var targetEvent = this.srpgDecideTarget(canAttackTargets, event, targetType); //ターゲットの設定
        $gameTemp.setTargetEvent(targetEvent);
        if ($gameTemp.isSrpgBestSearchFlag() == true) {
            $gameTemp.setSrpgBestSearchFlag(false);
            $gameSystem.srpgMakeMoveTable(event);
        }
        var optimalPos = this.srpgSearchOptimalPos(targetEvent, actor, type);
        var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
        $gameSystem.setSrpgWaitMoving(true);
        event.srpgMoveRouteForce(route);
        $gameSystem.setSubBattlePhase('auto_actor_action');
    };

    //エネミーの行動決定
    Scene_Map.prototype.srpgInvokeAICommand = function() {
		if($gameTemp.currentFaction == -1){
			var enemy;
			var ctr = 0;
			while(!enemy && ctr < $gameTemp.AIActors.length){
				var event = $gameTemp.AIActors[ctr];	
				var candidate = $gameSystem.EventToUnit(event.eventId())[1];
				if (!$statCalc.hasEndedTurn(candidate) && !event.isErased()) {
					enemy = candidate;
				}	
				ctr++;	
			}	

			if (!enemy) {
				$gameSystem.setBattlePhase('actor_phase');
				$gameSystem.setSubBattlePhase('initialize');				
				return;
			}	
		} else {		
			for (var i = 1; i <= $gameMap.isMaxEventId() + 1; i++) {				
				var event = $gameMap.event(i);
				if (event && event.isType() === 'enemy') {
					var enemy = $gameSystem.EventToUnit(event.eventId())[1];
					if (!enemy.srpgTurnEnd() && !event.isErased() && enemy.factionId == $gameTemp.currentFaction) {//enemy.canMove() == true && 
						break;
					}
				}
				if (i > $gameMap.isMaxEventId()) {
					$gameTemp.currentFaction++;
					$gameSystem.srpgStartEnemyTurn($gameTemp.currentFaction); // ターンを終了する
					return;
				}
			}            
		}
		
		
		$gameTemp.setActiveEvent(event);
		
		$gameTemp.isPostMove = false;
		if(enemy.battleMode() === 'disabled'){
			enemy.onAllActionsEnd();
			$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(10);
			$gamePlayer.locate(event.posX(), event.posY());		
			this.srpgAfterAction();
			return;
		}
		$gamePlayer.locate(event.posX(), event.posY());		
		$gameSystem.setSubBattlePhase('enemy_item_usage');
	}
	Scene_Map.prototype.srpgContinueAICommand = function() {
		const event = $gameTemp.activeEvent();
		const enemy = $gameSystem.EventToUnit(event.eventId())[1];
        if (_srpgStandUnitSkip === 'true' && enemy.battleMode() === 'stand' || enemy.battleMode() === 'fixed') {
           
            $gameSystem.srpgMakeMoveTable(event);
            var canAttackTargets = this.srpgMakeCanAttackTargets(enemy, null, true); //行動対象としうるユニットのリストを作成
            $gameTemp.clearMoveTable();
            if (canAttackTargets.length === 0) {
				var mapAttackInfo = this.getEnemyMapAttackInfo(event, false);	
				if(mapAttackInfo && mapAttackInfo.targets.length >= 1){//if the map attack has at least one target, use it if no regular targets exist without moving
					$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(30);
					this.doEnemyMapAttack(event, false);	
					return;
				} else {
					enemy.onAllActionsEnd();
					$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(10);
					$gamePlayer.locate(event.posX(), event.posY());		
					this.srpgAfterAction();
					return;
				}               
			} 
        }
		
			
		if($gameSystem.isEnemy(enemy)){
			$gameTemp.showAllyAttackIndicator = false;
			$gameTemp.showAllyDefendIndicator = true;
			$gameTemp.showEnemyAttackIndicator = true;
			$gameTemp.showEnemyDefendIndicator = false;
		} else {
			$gameTemp.showAllyAttackIndicator = true;
			$gameTemp.showAllyDefendIndicator = false;
			$gameTemp.showEnemyAttackIndicator = false;
			$gameTemp.showEnemyDefendIndicator = true;
		}
		
        		
		$statCalc.invalidateAbilityCache($gameSystem.getActiveUnit());
		$gameSystem.setSubBattlePhase('enemy_move');
		$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(1);
		$gamePlayer.locate(event.posX(), event.posY());			
      
    };
	
	Scene_Map.prototype.getEnemyMapAttackInfo = function(event, isPostMove) {
		var _this = this;
		var enemy = $gameSystem.EventToUnit(event.eventId())[1];		
		var mapWeapons = $statCalc.getActiveMapWeapons(enemy, isPostMove);
		var bestMapAttack;
		if(mapWeapons.length){
			mapWeapons.forEach(function(mapWeapon){
				var targetInfo = _this.getBestMapAttackTargets(event, mapWeapon, $gameSystem.isEnemy(enemy) ? "actor" : "enemy");
				if(targetInfo.targets.length && (!bestMapAttack || targetInfo.targets.length > bestMapAttack.targets.length)){
					bestMapAttack = targetInfo;
					bestMapAttack.attack = mapWeapon;
				}
			});
		}
		return bestMapAttack;
	}
	
	Scene_Map.prototype.doEnemyMapAttack = function(event, isPostMove) {
		var _this = this;
		var enemy = $gameSystem.EventToUnit(event.eventId())[1];		
		var mapWeapons = $statCalc.getActiveMapWeapons(enemy, isPostMove);
		var bestMapAttack;
		if(mapWeapons.length){
			mapWeapons.forEach(function(mapWeapon){
				var targetInfo = _this.getBestMapAttackTargets(event, mapWeapon, $gameSystem.isEnemy(enemy) ? "actor" : "enemy");
				if(targetInfo.targets.length && (!bestMapAttack || targetInfo.targets.length > bestMapAttack.targets.length)){
					bestMapAttack = targetInfo;
					bestMapAttack.attack = mapWeapon;
				}
			});
		}
		if(bestMapAttack){
			$gameTemp.enemyMapAttackDef = bestMapAttack;
			var type = "";
			if(bestMapAttack.attack.ignoresFriendlies){
				type = $gameSystem.isEnemy(enemy) ? "actor" : "enemy";
			}
			var targetInfo = _this.getMapAttackTargets(event, bestMapAttack.attack, type, bestMapAttack.direction);
			if(bestMapAttack.bestPosition){				
				targetInfo.forEach(function(candidate){
					if(candidate.position && candidate.position.x == bestMapAttack.bestPosition.x && candidate.position.y == bestMapAttack.bestPosition.y){
						$gameTemp.currentMapTargets = candidate.targets;
					}
				});				
			} else {
				$gameTemp.currentMapTargets = bestMapAttack.targets
			}
			$gameTemp.mapTargetDirection = bestMapAttack.direction;
			$gameTemp.currentBattleEnemy = enemy;
			$gameTemp.enemyAction = {
				type: "attack",
				attack: bestMapAttack.attack,
				target: 0
			};
			$gameTemp.clearMoveTable();	
			$gameTemp.setResetMoveList(true);
						
			var deltaX = event.posX();
			var deltaY = event.posY();
			
			var tileCoordinates = JSON.parse(JSON.stringify($mapAttackManager.getDefinition(bestMapAttack.attack.mapId).shape));		
			tileCoordinates = _this.getAdjustedMapAttackCoordinates(tileCoordinates,  bestMapAttack.direction);
			$gameSystem.highlightedTiles = [];
			$gameSystem.highlightsRefreshed = true;	
			$gameTemp.disableHighlightGlow = false;
			for(var i = 0; i < tileCoordinates.length; i++){
				tileCoordinates[i].push(true); //is attack range
				tileCoordinates[i][0]+=deltaX;
				tileCoordinates[i][1]+=deltaY;
				$gameTemp.pushMoveList(tileCoordinates[i]);	
				$gameSystem.highlightedTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "#ff3a3a"});					
			}
				
			$statCalc.setCurrentAttack(enemy, bestMapAttack.attack);
			_this.enemyMapAttackStart();
			return true;
		} else {
			return false;
		}
	}
	
	Scene_Map.prototype.srpgGetAITargetPosition = function() {
		var event = $gameTemp.activeEvent();
        var type = $gameSystem.EventToUnit(event.eventId())[0];
        var enemy = $gameSystem.EventToUnit(event.eventId())[1];		
		
		function checkPriorityTarget(candidates){
			var priorityTargetInRange = false;
			if(enemy.targetUnitId != -1){
				candidates.forEach(function(event){
					var target = $gameSystem.EventToUnit(event.eventId())[1];
					if($statCalc.getActiveSpirits(target).taunt){
						priorityTargetInRange = true;
					} else {
						if(target.isActor()){
							if(target.actorId() == enemy.targetUnitId){
								priorityTargetInRange = true;
							}
						} else {
							if(target.enemyId() == enemy.targetUnitId){
								priorityTargetInRange = true;
							}
						}
						if(target.subTwin){
							if(target.subTwin.isActor()){
								if(target.subTwin.actorId() == enemy.targetUnitId){
									priorityTargetInRange = true;
								}
							} else {
								if(target.subTwin.enemyId() == enemy.targetUnitId){
									priorityTargetInRange = true;
								}
							}
						}
					}					
				});
			}
			return priorityTargetInRange;
		}
		
		let optimalPos;
		
		var AIFlags = $statCalc.getAIFlags(enemy);
		var canAttackTargets = this.srpgMakeCanAttackTargets(enemy, null, enemy.battleMode() === 'stand' || enemy.battleMode() === 'fixed'); //行動対象としうるユニットのリストを作成
		var priorityTargetInRange = checkPriorityTarget(canAttackTargets);
		var optimalPosStanding;
		if(!AIFlags.reposition && canAttackTargets && canAttackTargets.length){
			var targetInfo = this.srpgDecideTarget(canAttackTargets, event, !AIFlags.reposition); //ターゲットの設定
			$gameTemp.enemyWeaponSelection = targetInfo.weapon;
			$gameTemp.setTargetEvent(targetInfo.target);
			enemy._currentTarget = targetInfo.target;
			var alreadyInRange = $battleCalc.isTargetInRange({x: event.posX(), y: event.posY()}, {x: targetInfo.target.posX(), y: targetInfo.target.posY()}, $statCalc.getRealWeaponRange(enemy, targetInfo.weapon), $statCalc.getRealWeaponMinRange(enemy, targetInfo.weapon));
			if(alreadyInRange){
				optimalPosStanding =  this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, $statCalc.getRealWeaponRange(enemy, targetInfo.weapon), $statCalc.getRealWeaponMinRange(enemy, targetInfo.weapon));
			}
		}	
		
		var fullRange = $statCalc.getFullWeaponRange(enemy, true);
		$gameSystem.srpgMakeMoveTable(event, false, true);
		var targetInfo;
		
		var optimalPosWithMove;
		var canAttackTargets = this.srpgMakeCanAttackTargetsWithMove(enemy);
		var withMoveHasPrio = checkPriorityTarget(canAttackTargets);
		if(canAttackTargets && canAttackTargets.length){
			targetInfo = this.srpgDecideTarget(canAttackTargets, event); //ターゲットの設定
			if(targetInfo.target){
				var alreadyInRange = $battleCalc.isTargetInRange({x: event.posX(), y: event.posY()}, {x: targetInfo.target.posX(), y: targetInfo.target.posY()}, $statCalc.getRealWeaponRange(enemy, targetInfo.weapon), $statCalc.getRealWeaponMinRange(enemy, targetInfo.weapon));
				if(!alreadyInRange){						
					enemy._currentTarget = targetInfo.target;						
					optimalPosWithMove = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range, fullRange.minRange);
				} else {
					optimalPosWithMove = [event.posX(), event.posY()];
				}
			}
		}
		
		var optimalPosMap;
		var mapPositionHasPrio = checkPriorityTarget($statCalc.getAllActorEvents("", $gameSystem.getUnitFactionInfo(enemy)));
		targetInfo = this.srpgDecideTarget($statCalc.getAllActorEvents("", $gameSystem.getUnitFactionInfo(enemy)), event); //ターゲットの設定
		if(targetInfo.target){
			enemy._currentTarget = targetInfo.target;
			var minRange = fullRange.minRange;
			if(minRange == -1){
				minRange = 0;
			}
			optimalPosMap = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range || -1, minRange, true);
		}
		
		/*if(enemy._currentTarget && !enemy._currentTarget.isErased()){
			targetInfo = {target: enemy._currentTarget};
			optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range, fullRange.minRange);
		} else */
		var regionOptimalPos;
		if(enemy.targetRegion != -1 && enemy.targetRegion != null){
			var candidatePositions = $gameMap.getRegionTiles(enemy.targetRegion);
			var currentBestDist = -1;
			var xRef = event.posX();
			var yRef = event.posY();
			for(var i = 0; i < candidatePositions.length; i++){
				
				var dist = Math.hypot(xRef-candidatePositions[i].x, yRef-candidatePositions[i].y);
				if((currentBestDist == -1 || dist < currentBestDist) && ($statCalc.isFreeSpace(candidatePositions[i]) || (xRef == candidatePositions[i].x && yRef == candidatePositions[i].y))){
					regionOptimalPos = candidatePositions[i];
					currentBestDist = dist;
				}
			}
			if(!regionOptimalPos){
				currentBestDist = -1;
				for(var i = 0; i < candidatePositions.length; i++){						
					var dist = Math.hypot(xRef-candidatePositions[i].x, yRef-candidatePositions[i].y);
					if((currentBestDist == -1 || dist < currentBestDist)){
						regionOptimalPos = candidatePositions[i];
						currentBestDist = dist;
					}
				}
			}
			if(regionOptimalPos){
				regionOptimalPos = this.srpgSearchOptimalPos(regionOptimalPos, enemy, type, -1, 0);
			}					
		} 
		
		if(enemy.targetBox != -1 && enemy.targetBox != null){
			const targetBoxEvent = $gameMap.event(enemy.targetBox);
			if(targetBoxEvent && targetBoxEvent.isDropBox){
				optimalPos = this.srpgSearchOptimalPos({x: targetBoxEvent.posX(), y: targetBoxEvent.posY()}, enemy, type, -1, 0);
			}
		}
		
		//if the priority target is in range, target it
		if(!optimalPos && (priorityTargetInRange || (!AIFlags.preferTarget && optimalPosStanding))){
			optimalPos = optimalPosStanding;
		}
		
		//if the priority target is among the possible targets with move or somewhere on the map, prefer moving towards it
		if(!optimalPos && withMoveHasPrio){
			optimalPos = optimalPosWithMove;
		}
		
		if(!optimalPos && mapPositionHasPrio){
			optimalPos = optimalPosMap;
		}
		
		//if no priority target is present and the enemy has no target region or doesn't prefer its target
		if(!optimalPos && (enemy.targetRegion == -1 || AIFlags.preferTarget < 2)){
			if(optimalPosStanding){
				optimalPos = optimalPosStanding;
			}
		}		
				
		//if no priority target is present first check if a target region is reachable
		if(!optimalPos){
			if(regionOptimalPos){
				optimalPos = regionOptimalPos;
			}
		}
		
		//if no priority target or target region, take any target reachable
		if(!optimalPos){
			if(optimalPosStanding){
				optimalPos = optimalPosStanding;
			}
		}
		
		//if no priority target or region target is present, take any target in move range
		if(!optimalPos){
			if(optimalPosWithMove){
				optimalPos = optimalPosWithMove;
			}
		}
		
		//if still no target is found, pick one from targets on the entire map
		if(!optimalPos){
			if(optimalPosMap){
				optimalPos = optimalPosMap;
			}
		}
		return optimalPos;
	}
	
    //エネミーの移動先決定と移動実行
    Scene_Map.prototype.srpgInvokeAIMove = function() {
		var _this = this;
		$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(20);
		$gameVariables.setValue(_currentActorId, -1); //ensure no active actor id lingers
		$gameTemp.enemyWeaponSelection = null;
        var event = $gameTemp.activeEvent();
        var type = $gameSystem.EventToUnit(event.eventId())[0];
        var enemy = $gameSystem.EventToUnit(event.eventId())[1];
		
		
		
		var mapAttackInfo = this.getEnemyMapAttackInfo(event, false);		
		
		if(mapAttackInfo && mapAttackInfo.targets.length > 1){//if the map attack has at least two or more targets use it, else check for regular attacks	
			$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(30);
			this.doEnemyMapAttack(event, false);	
		} else {      
					
			let optimalPos = this.srpgGetAITargetPosition();
	
			
			if(optimalPos){
				if(optimalPos[0] != event.posX() || optimalPos[1] != event.posY()){
					$gameSystem.srpgMakeMoveTable(event);
					$gameTemp.isPostMove = true;
					var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
					$gameSystem.setSrpgWaitMoving(true);
					event.srpgMoveToPoint({x: optimalPos[0], y: optimalPos[1]});
					$gamePlayer.setTransparent(true);
				}					
			} else if(mapAttackInfo && mapAttackInfo.targets.length >= 1){//if the map attack has at least one target, use it if no regular targets exist without moving
				$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(30);
				this.doEnemyMapAttack(event, false);	
			}
			
			$gameSystem.setSubBattlePhase('enemy_action');
		}	
    };

    // 行動対象とするユニットのタイプを返す
    Scene_Map.prototype.makeTargetType = function(battler, type) {
        var targetType = null;
        if (battler.isConfused() == true) {
            switch (battler.confusionLevel()) {
            case 1:
                if (type === 'enemy') {
                    return 'actor';
                } else if (type === 'actor') {
                    return 'enemy';
                }
            case 2:
                if (Math.randomInt(2) === 0) {
                    if (type === 'enemy') {
                        return 'actor';
                    } else if (type === 'actor') {
                        return 'enemy';
                    }
                }
                if (type === 'enemy') {
                    return 'enemy';
                } else if (type === 'actor') {
                    return 'actor';
                }
            default:
                if (type === 'enemy') {
                    return 'enemy';
                } else if (type === 'actor') {
                    return 'actor';
                }
            }
        }
        if (type === 'enemy' && battler.currentAction().isForOpponent()) {
            targetType = 'actor';
        } else if (type === 'enemy' && battler.currentAction().isForFriend()) {
            targetType = 'enemy';
        } else if (type === 'actor' && battler.currentAction().isForOpponent()) {
            targetType = 'enemy';
        } else if (type === 'actor' && battler.currentAction().isForFriend()) {
            targetType = 'actor';
        }
        return targetType;
    };

    // 移動力と射程を足した範囲内にいる対象をリストアップする
    Scene_Map.prototype.srpgMakeCanAttackTargets = function(battler, targetType, isFinalCheck) {        	
		//var type = battler.isActor() ? "enemy" : "actor";
		if(battler.attackBehavior == "none"){
			return [];
		}
		var referenceEvent = $statCalc.getReferenceEvent(battler);
		var pos = {
			x: $gameTemp.activeEvent().posX(),
			y: $gameTemp.activeEvent().posY()
		};
		var fullRange = $statCalc.getFullWeaponRange(battler, $gameTemp.isPostMove);
        var targets = $statCalc.getAllInRange(battler);
		var tmp = [];
		for(var i = 0; i < targets.length; i++){
			if((!battler.isEnemy() || !$gameSystem.untargetableAllies[targets[i].eventId()]) && $statCalc.canBeTargetedOnCurrentTerrain($gameSystem.EventToUnit(targets[i].eventId())[1])){		
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				
				if($battleCalc.getBestWeapon({actor: battler, pos: {x: referenceEvent.posX(), y: referenceEvent.posY()}}, {actor: actor, pos: {x: targets[i].posX(), y: targets[i].posY()}}, false, false, false)){
					tmp.push(targets[i]);
				}
			}			
		}
		targets = tmp;
		if(battler.targetUnitId != "" && battler.targetUnitId != -1){
			var target;
			for(var i = 0; i < targets.length; i++){					
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				if(actor.isActor() && actor.actorId() == battler.targetUnitId){
					target = targets[i];
				}
				if(actor.isEnemy() && actor.enemyId() == battler.targetUnitId){
					target = targets[i];
				}				
			}
			if(target){
				targets = [target];
			} else if($statCalc.getAIFlags(battler).preferTarget == 2){
				targets = [];
			} else if($statCalc.getAIFlags(battler).preferTarget == 1 && !isFinalCheck){
				targets = [];
			} else {
				targets = tmp;
			}
		}
		return targets;
    };
	
	Scene_Map.prototype.srpgMakeCanAttackTargetsWithMove = function(battler, targetType) {        	
		//var type = battler.isActor() ? "enemy" : "actor";
		if(battler.attackBehavior == "none"){
			return [];
		}
		var pos = {
			x: $gameTemp.activeEvent().posX(),
			y: $gameTemp.activeEvent().posY()
		};

        var targets =  $statCalc.getAllInRange(battler, true);
		var tmp = [];
		for(var i = 0; i < targets.length; i++){
			if((!battler.isEnemy() || !$gameSystem.untargetableAllies[targets[i].eventId()]) && $statCalc.canBeTargetedOnCurrentTerrain($gameSystem.EventToUnit(targets[i].eventId())[1])){		
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				if($battleCalc.getBestWeapon({actor: battler}, {actor: actor}, false, true, false)){
					tmp.push(targets[i]);
				}
			}
		}
		targets = tmp;
		if(battler.targetUnitId != "" && battler.targetUnitId != -1){
			var target;
			for(var i = 0; i < targets.length; i++){
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				if(actor.isActor() && actor.actorId() == battler.targetUnitId){
					target = targets[i];
				}				
				if(actor.isEnemy() && actor.enemyId() == battler.targetUnitId){
					target = targets[i];
				}
			}
			if(target){
				targets = [target];
			} else {
				targets = [];
			}
		}
		return targets;
    };

     //優先ターゲットの決定
    Scene_Map.prototype.srpgPriorityTarget = function(battler) {
        var event = null;
        if (battler.battleMode() === 'aimingEvent') {
            event = $gameMap.event(battler.targetId());
        } else if (battler.battleMode() === 'aimingActor') {
            var eventId1 = $gameSystem.ActorToEvent(battler.targetId());
            event = $gameMap.event(eventId1);
        }
        // ターゲットにしたeventが有効でない場合、優先ターゲットは設定しない
        if (event) { 
            var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
            // 優先ターゲットが失われている場合、優先ターゲットは設定しない
            if (!(targetBattlerArray && targetBattlerArray[1].isAlive())) event = null;
        }
        $gameTemp.setSrpgPriorityTarget(event);
    }

     //ターゲットの決定
    Scene_Map.prototype.srpgDecideTarget = function(canAttackTargets, activeEvent, ignoreMoveOptions) {
        var targetEvent = null;
       	
		var bestTarget;
		var bestWeapon;
		var bestScore = -1;
		var attacker = $gameSystem.EventToUnit(activeEvent.eventId())[1];
		var targetsByHit = [];
		var priorityTargetId = attacker.targetUnitId;
		var priorityTargetEvent = -1;
		var tauntTargetEvent = -1;
		
		canAttackTargets.forEach(function(event) {
			if(!event.isErased() && !$gameSystem.untargetableAllies[event.eventId()] && $statCalc.canBeTargetedOnCurrentTerrain($gameSystem.EventToUnit(event.eventId())[1])){					
				var defender = $gameSystem.EventToUnit(event.eventId())[1];
				if(defender.isActor() && defender.actorId() == priorityTargetId){
					priorityTargetEvent = event;
				}
				if(defender.isEnemy() && defender.enemyId() == priorityTargetId){
					priorityTargetEvent = event;
				}	
				if(defender.isActor() && $statCalc.getActiveSpirits(defender).taunt){
					tauntTargetEvent = event;
				}				
				
				var hitRate = $battleCalc.performHitCalculation(
					{actor: attacker, action: {type: "attack", attack: {hitMod: 0}}},
					{actor: defender, action: {type: "none"}},
					true
				);
				targetsByHit.push({
					hit: hitRate,
					target: defender,
					event: event
				});
			}
		});
		if(tauntTargetEvent != -1){
			var defender = $gameSystem.EventToUnit(tauntTargetEvent.eventId())[1];
			targetsByHit = [{
				hit: 0,
				target: defender,
				event: tauntTargetEvent
			}];
		} else if(priorityTargetEvent != -1){
			var defender = $gameSystem.EventToUnit(priorityTargetEvent.eventId())[1];
			targetsByHit = [{
				hit: 0,
				target: defender,
				event: priorityTargetEvent
			}];
		}
		/*targetsByHit.sort(function(a, b){
			return b.hit - a.hit;
		});*/
		if(targetsByHit.length){			
			var maxHitRate = targetsByHit[0].hit;
			var ctr = 0;
			var currentHitRate = targetsByHit[0].hit;
			while(ctr < targetsByHit.length){
				var currentHitRate = targetsByHit[ctr].hit;
							
				var defender = targetsByHit[ctr].target;
				var weaponResult = {};
				var weaponResultCurrentPos = $battleCalc.getBestWeaponAndDamage(
					{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
					{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
					false,
					false, 
					$gameTemp.isPostMove,
					false,
					true
				);
				
				var weaponResultAnyPosPostMove = {};
				if(!$gameTemp.isPostMove && !ignoreMoveOptions){
					var weaponResultAnyPosPostMove = $battleCalc.getBestWeaponAndDamage(
						{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
						{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
						false,
						true, 
						true,
						false,
						true
					);	
				}			
				
				if(weaponResultCurrentPos.weapon && weaponResultAnyPosPostMove.weapon){
					if(weaponResultCurrentPos.damage > weaponResultAnyPosPostMove.damage){
						weaponResult = weaponResultCurrentPos;
					} else {
						weaponResult = weaponResultAnyPosPostMove;
					}
				} else if(weaponResultCurrentPos.weapon){
					weaponResult = weaponResultCurrentPos;
				} else if(weaponResultAnyPosPostMove.weapon){
					weaponResult = weaponResultAnyPosPostMove;
				} else {
					weaponResult = $battleCalc.getBestWeaponAndDamage(
						{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
						{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
						false,
						true, 
						false,
						false,
						true
					);
				}
				var damage = weaponResult.damage;
				var hitrate = currentHitRate;
				var canDestroy = weaponResult.damage >= $statCalc.getCalculatedMechStats(defender).currentHP ? 1 : 0;
				
				var attackerEvent = $statCalc.getReferenceEvent(attacker);
				var defenderEvent = $statCalc.getReferenceEvent(defender);
				var deltaX = Math.abs(attackerEvent.posX() - defenderEvent.posX());
				var deltaY = Math.abs(attackerEvent.posY() - defenderEvent.posY());
				var distance = Math.hypot(deltaX, deltaY);
				var targetHasZone = $gameSystem.eventHasZone(defenderEvent.eventId());
						
				var formula = $statCalc.getTargetScoringFormula(attacker);
				if(!formula){
					formula = ENGINE_SETTINGS.ENEMY_TARGETING_FORMULA || "Math.min(hitrate + 0.01, 1) * (damage + (canDestroy * 5000))";
				}				
				function translateTagTokens(txt){
					var scriptTokens = /\[\[(.*?)\]\]/g.exec(txt);
					if(scriptTokens){
						scriptTokens.shift();
						scriptTokens.forEach(function(tagToken){
							var parts = tagToken.split(":");
							var tags = {};
							if(parts[0] == "pilot"){								
								tags = $statCalc.getPilotTags(defender);
							} else {
								tags = $statCalc.getMechTags(defender);
							}
							txt = txt.replace(new RegExp("\\[\\["+tagToken+"\\]\\]", "g"), tags[parts[1]] ? 1 : 0);
						});
					}
					return txt;
				}
				formula = translateTagTokens(formula);
				var score = eval(formula);
				
				if(score > bestScore){
					bestScore = score;
					bestTarget = targetsByHit[ctr].event;
					bestWeapon = weaponResult.weapon
				}
				
				ctr++;
			}
		}
		
        return {target: bestTarget, weapon: bestWeapon};
    };
	
	Scene_Save.prototype.popScene = function() {
		$gameTemp.onMapSaving = false;
		SceneManager.pop();
	};
	
	function coordUtils(startX, startY, chunkRadius){
		this.startX = startX;
		this.startY = startY;
		this.radius = chunkRadius;
	}
	
	coordUtils.prototype.convertToNormalCoordinate = function(coord){
			return Math.floor(coord / 3);
	}
	
	coordUtils.prototype.convertToExplodedCoordinate = function(coord){
		return coord * 3 + 1;
	}
	
	coordUtils.prototype.convertToGridCoordinate = function(coords){
		return {
			x: coords.x - this.startX + this.radius,
			y: coords.y - this.startY + this.radius
		}
	}
	
	coordUtils.prototype.convertToMapCoordinate = function(coords){
		return {
			x: coords.x + this.startX - this.radius,
			y: coords.y + this.startY - this.radius
		}
	}

    // 最適移動位置の探索
    Scene_Map.prototype.srpgSearchOptimalPos = function(targetCoords, battler, type, range, minRange, noTargets) {
		function isValidSpace(pos){
			return $statCalc.isFreeSpace(pos) || (pos.x == $gameTemp.activeEvent().posX() && pos.y == $gameTemp.activeEvent().posY());
		}
		
		if(targetCoords.x == battler.event.posX() && targetCoords.y == battler.event.posY()){
			return [targetCoords.x, targetCoords.y];
		}
		
        if ($gameTemp.isSrpgBestSearchRoute()[0] && 
            !(battler.battleMode() === 'absRegionUp' || battler.battleMode() === 'absRegionDown')) {
            var route = $gameTemp.isSrpgBestSearchRoute()[1].slice(1, battler.srpgMove() + 1);
            for (var i = 0; i < battler.srpgMove() + 1; i++) {
                var pos = [$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()];
                for (var j = 0; j < route.length; j++) {
                    var d = route[j];
                    if (d == 2) {
                        pos[1] += 1;
                    } else if (d == 4) {
                        pos[0] -= 1;
                    } else if (d == 6) {
                        pos[0] += 1;
                    } else if (d == 8) {
                        pos[1] -= 1;
                    }
                }
                if (pos[0] < 0) {
                  pos[0] += $gameMap.width();
                } else if (pos[0] >= $gameMap.width()) {
                  pos[0] -= $gameMap.width();
                }
                if (pos[1] < 0) {
                  pos[1] += $gameMap.height();
                } else if (pos[1] >= $gameMap.height()) {
                  pos[1] -= $gameMap.height();
                }
                if (isValidSpace({x: pos[0], y: pos[1]})) {
                    break;
                } else {
                    route.pop();
                }
            }
            $gameTemp.setSrpgBestSearchRoute([null, []]);
            return pos;
        }
        var list = $gameTemp.moveList();
		list.push([$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY(), false]);
		
		var occupiedPositions = $statCalc.getOccupiedPositionsLookup(null, $gameSystem.getUnitFactionInfo(battler));
		var allOccupiedPosition = $statCalc.getOccupiedPositionsLookup();
		
		
		
		
		var detailedAIRadius = 30;
		var startX = battler.event.posX();
		var startY = battler.event.posY();
		var bestDist = -1;
		var referencePos = {x: startX, y: startY};
		
		var pathfindingGrid = [];
		var directionGrid = [];
		for(var i = 0; i < $gameMap.width(); i++){			
			pathfindingGrid[i] = [];
			directionGrid[i] = [];			
			for(var j = 0; j < $gameMap.height(); j++){
				var isCenterPassable = !(occupiedPositions[i] && occupiedPositions[i][j]) && $statCalc.canStandOnTile(battler, {x: i, y: j});
				if(!battler.isActor() && $gameSystem.enemySolidTerrain && $gameSystem.enemySolidTerrain[$gameMap.regionId(i, j)]){
					isCenterPassable = false;
				}
				var isTopPassable;
				var isBottomPassable;
				var isLeftPassable;
				var isRightPassable;
				if(!isCenterPassable || $statCalc.ignoresTerrainCollision(battler, $gameMap.regionId(i, j) % 8) || !ENGINE_SETTINGS.USE_TILE_PASSAGE){
				 	isTopPassable = isCenterPassable;
					isBottomPassable = isCenterPassable;
					isLeftPassable = isCenterPassable;
					isRightPassable = isCenterPassable;
				} else {
					isTopPassable = $gameMap.isPassable(i, j, 8);
					isBottomPassable = $gameMap.isPassable(i, j, 2);
					isLeftPassable = $gameMap.isPassable(i, j, 4);
					isRightPassable = $gameMap.isPassable(i, j, 6);
				}
				
				var weight = 1 ;
				
				if(!$statCalc.ignoresTerrainCost(battler, $gameMap.regionId(i, j) % 8)){
					weight+=$gameMap.SRPGTerrainTag(i, j);
				}				
				pathfindingGrid[i][j] = isCenterPassable ? weight : 0; 	
				directionGrid[i][j] = {
					top: isTopPassable,
					bottom: isBottomPassable,
					left: isLeftPassable,
					right: isRightPassable
				};
			}
		}
		
		
		
		var targetDist = minRange || 1;
		var currentBestDist = -1;
		var improves = true;
		var path = [];
	
		var candidatePaths = [];
		var targetTileCounter = 0;	
				
		var graph = new Graph(pathfindingGrid, directionGrid);
		
		while(targetTileCounter < list.length){
			var targetNode = list[targetTileCounter];
			var endCoords ={x: targetNode[0], y: targetNode[1]};
			var endNode = graph.grid[endCoords.x][endCoords.y];
			
			if(isValidSpace({x: endNode.x, y: endNode.y})){					
				candidatePaths.push([endNode])
			}
			targetTileCounter++;
		}	
		
		var AIFlags = $statCalc.getAIFlags(battler);
		
		var canReach = false;
		var pathScores = [];
		var bestPath = [];
		
		candidatePaths.push([{x: battler.event.posX(), y: battler.event.posY()}])
		
		candidatePaths.forEach(function(path){
			var node = path[path.length-1];
			
			var startNode = graph.grid[node.x][node.y];
			var endNode = graph.grid[targetCoords.x][targetCoords.y];
			var distPath = astar.search(graph, startNode, endNode, {closest: true});
			var travelDistToTarget = distPath.length;
			
			var deltaX = Math.abs(targetCoords.x - node.x);
			var deltaY = Math.abs(targetCoords.y - node.y);
			var dist = deltaX + deltaY;
			
			var srcDeltaX = Math.abs(battler.event.posX() - node.x);
			var srcDeltaY = Math.abs(battler.event.posY() - node.y);
			
			
			var environmentScore = 0;
			
			if(AIFlags.terrain){			
				var terrainDetails = $gameMap.getTilePropertiesAsObject({x: node.x, y: node.y});	
				var terrainScore = 0;
				if(terrainDetails){
					terrainScore+=terrainDetails.defense / 100;
					terrainScore+=terrainDetails.evasion / 100;
					terrainScore+=terrainDetails.hp_regen / 100;
					terrainScore+=terrainDetails.en_regen / 100;
				}			
				environmentScore+=terrainScore;
			}
			
			if(AIFlags.formation){			
				var supporterDefenders = $statCalc.getSupportDefendCandidates(
					$gameSystem.getFactionId(battler), 
					{x: node.x, y: node.y},
					$statCalc.getCurrentAliasedTerrainIdx(battler),
					battler.event.eventId()
				);
				
				if(supporterDefenders.length){
					environmentScore+=1;
				}
				
				var supportersAttackers = $statCalc.getSupportAttackCandidates(
					$gameSystem.getFactionId(battler), 
					{x: node.x, y: node.y},
					$statCalc.getCurrentAliasedTerrainIdx(battler),
					battler.event.eventId()
				);
				
				if(supportersAttackers.length){
					environmentScore+=0.5;
				}
			}
			var distanceOK = dist <= range && dist >= minRange;
			if(distanceOK){
				canReach = true;
			}
			pathScores.push({
				path: path,
				pathLength: path.length,
				distanceOK: distanceOK,
				dist: dist,
				travelDistToTarget: travelDistToTarget,
				environment: environmentScore,
				srcDeltaX: srcDeltaX,
				srcDeltaY: srcDeltaY
			});
		});
		
		pathScores.sort(function(a, b){
			if(a.distanceOK && b.distanceOK){
				if(b.environment - a.environment == 0){
					return a.dist - b.dist;
				} else {
					return b.environment - a.environment;
				}				
			} else if(a.distanceOK){
				return -1;
			} else if(b.distanceOK) {
				return 1;
			} else if(a.travelDistToTarget != b.travelDistToTarget){
				return a.travelDistToTarget - b.travelDistToTarget;
			} else if(b.pathLength == a.pathLength){
				return [
					{retVal: -1, refVal: a.srcDeltaX},
					{retVal: -1, refVal: a.srcDeltaY},
					{retVal: 1, refVal: b.srcDeltaX},
					{retVal: 1, refVal: b.srcDeltaY}
				].sort((a, b) => b.refVal - a.refVal)[0].retVal;
			} else {
				return b.pathLength - a.pathLength;
			}				
		});

		if(pathScores[0]){
			path = pathScores[0].path;
		}			
		
		var pathNodeLookup = {};
		var ctr = 0;
		
		var tmp = [];
		path.forEach(function(node){
			var deltaX = Math.abs(targetCoords.x - node.x);
			var deltaY = Math.abs(targetCoords.y - node.y);
			var dist = Math.hypot(deltaX, deltaY);
			if(deltaX + deltaY >= minRange){
				tmp.push(node);
			}
		});
		path = tmp;

		path.forEach(function(node){
			if(!pathNodeLookup[node.x]){
				pathNodeLookup[node.x] = {};
			}
			pathNodeLookup[node.x][node.y] = ctr++;
		});
		
		var bestIdx = -1;
		for(var i = 0; i < list.length; i++){
			var pathIdx = -1;
			if(pathNodeLookup[list[i][0]] && pathNodeLookup[list[i][0]][list[i][1]] != null){
				pathIdx = pathNodeLookup[list[i][0]][list[i][1]];
			}
			if(isValidSpace({x: list[i][0], y: list[i][1]}) && pathIdx > bestIdx){
				bestIdx = pathIdx;
			}
		}
		
		var candidatePos = [];
		if(bestIdx != -1){
			candidatePos.push([path[bestIdx].x, path[bestIdx].y]);
		} else {		
			var distanceSortedPositions = [];
			
			for(var i = 0; i < list.length; i++){
				var deltaX = Math.abs(targetCoords.x - list[i][0]);
				var deltaY = Math.abs(targetCoords.y - list[i][1]);
				var distance = Math.hypot(deltaX, deltaY);
				if((range == -1 || (deltaX + deltaY <= range && deltaX + deltaY >= minRange)) && isValidSpace({x: list[i][0], y: list[i][1]})){
					distanceSortedPositions.push({
						x: list[i][0],
						y: list[i][1],
						distance: distance
					});
				}
			}	

			if(!distanceSortedPositions.length){
				//check for a closest position without taking range into account
				for(var i = 0; i < list.length; i++){
					var deltaX = Math.abs(targetCoords.x - list[i][0]);
					var deltaY = Math.abs(targetCoords.y - list[i][1]);
					var distance = Math.hypot(deltaX, deltaY);		
					if(isValidSpace({x: list[i][0], y: list[i][1]})){
						distanceSortedPositions.push({
							x: list[i][0],
							y: list[i][1],
							distance: distance
						});
					}											
				}	
			}

			
			distanceSortedPositions = distanceSortedPositions.sort(function(a, b){
				return a.distance - b.distance;
			});
			
			
			
			if(distanceSortedPositions.length){
				var optimalDistance = distanceSortedPositions[0].distance;
				var ctr = 0;
				var currentDistance = distanceSortedPositions[0].distance;
				while(currentDistance == optimalDistance && ctr < distanceSortedPositions.length){
					currentDistance = distanceSortedPositions[ctr].distance;
					if(currentDistance == optimalDistance){
						candidatePos.push([distanceSortedPositions[ctr].x, distanceSortedPositions[ctr].y]);
					}			
					ctr++;
				} 
			}			
		}
		
		
		for(var i = 0; i < candidatePos.length; i++){
			if(candidatePos[i][0] == targetCoords.x && candidatePos[i][1] == targetCoords.y){
				return candidatePos[i];
			}
		} 
		var resultPos = candidatePos[0];
		var ctr = 1;
		while(ctr < candidatePos.length && !isValidSpace({x: resultPos[0], y: resultPos[1]})){
			resultPos = candidatePos[ctr++];
		}
		if(!resultPos){
			return [startX, startY];
		}
		
		if(!isValidSpace({x: resultPos[0], y: resultPos[1]})){
			return [startX, startY];
		} else {
			return resultPos;
		}        
    };

    //自動行動アクター&エネミーの戦闘の実行
    Scene_Map.prototype.srpgInvokeAutoUnitAction = function() {
        if (!$gameTemp.targetEvent()) {
            var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
            actionArray[1].onAllActionsEnd();
            this.srpgAfterAction();
            return;
        }
        var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
        var targetArray = $gameSystem.EventToUnit($gameTemp.targetEvent().eventId());
        var skill = actionArray[1].currentAction().item();
        var range = actionArray[1].srpgSkillRange(skill);
        $gameTemp.setSrpgDistance($gameSystem.unitDistance($gameTemp.activeEvent(), $gameTemp.targetEvent()));
        $gameTemp.setSrpgSpecialRange($gameTemp.activeEvent().srpgRangeExtention($gameTemp.targetEvent().posX(), $gameTemp.targetEvent().posY(), $gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY(), skill, range));
        if (actionArray[1].canUse(skill)) {
            $gameTemp.setAutoMoveDestinationValid(true);
            $gameTemp.setAutoMoveDestination($gameTemp.targetEvent().posX(), $gameTemp.targetEvent().posY());
            $gameSystem.setSubBattlePhase('invoke_action');
            this.srpgBattleStart(actionArray, targetArray);
        } else {
            actionArray[1].onAllActionsEnd();
            this.srpgAfterAction();
        }
    };
	
	Scene_Map.prototype.srpgInvokeAIAction = function() {		
		var mapAttackInfo = this.getEnemyMapAttackInfo($gameTemp.activeEvent(), true);		
	
		if(mapAttackInfo && mapAttackInfo.targets.length > 1){
			$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(30);
			this.doEnemyMapAttack($gameTemp.activeEvent(), true);
			return;
		}	
       
		var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		var canAttackTargets = this.srpgMakeCanAttackTargets(actionArray[1], null, true); 
		if(canAttackTargets.length){		
			var targetInfo = this.srpgDecideTarget(canAttackTargets, $gameTemp.activeEvent(), true); 
			$gameTemp.enemyWeaponSelection = targetInfo.weapon;
			$gameTemp.setTargetEvent(targetInfo.target);
			$gameTemp.activeEvent()._currentTarget = targetInfo.target;
		} else if(mapAttackInfo && mapAttackInfo.targets.length >= 1){
			$gameTemp.AIWaitTimer = $gameSystem.getScaledTime(30);
			this.doEnemyMapAttack($gameTemp.activeEvent(), true);
			return;
		} else {				
			actionArray[1].onAllActionsEnd();
			this.srpgAfterAction();
			return;
		}           
     
		
		
		
        var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
        var targetArray = $gameSystem.EventToUnit($gameTemp.targetEvent().eventId());
		
		$gameTemp.reticuleInfo = {
			actor: $statCalc.getReferenceEvent(actionArray[1]),
			targetActor: $statCalc.getReferenceEvent(targetArray[1])
		};
	
		$gameSystem.setSubBattlePhase('invoke_action');
		
		//actor default action determination
		$gameTemp.isEnemyAttack = true;
		$gameTemp.currentBattleActor = targetArray[1];			
		$gameTemp.currentBattleEnemy = actionArray[1];
		
		
		
		var enemyInfo = {actor: $gameTemp.currentBattleEnemy, pos: {x: $gameTemp.currentBattleEnemy.event.posX(), y: $gameTemp.currentBattleEnemy.event.posY()}};
		var actorInfo = {actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}};
		var weapon = $gameTemp.enemyWeaponSelection;
		if(weapon){
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
		
		let isCounterable = true;
		let interactionInfo = $gameSystem.getCombatInteractionInfo($gameTemp.enemyAction.attack);
		if(interactionInfo.isBetweenFriendlies){
			if(!$gameTemp.enemyAction.attack.alliesCounter){
				isCounterable = false;
			}
		} else {
			if(!$gameTemp.enemyAction.attack.enemiesCounter){
				isCounterable = false;
			}
		}
		
		if($statCalc.isDisabled($gameTemp.currentBattleActor) || !isCounterable){
			$gameTemp.actorAction = {
				type: "none",
				attack: null,
				target: 0
			};
		} else {
			var weapon = $battleCalc.getBestWeapon(actorInfo, enemyInfo, true);
			if(weapon){
				$gameTemp.actorAction = {
					type: "attack",
					attack: weapon,
					target: 0
				};
			} else {
				$gameTemp.actorAction = {
					type: "defend",
					attack: 0,
					target: 0
				};
			}
		}
		
		$gameTemp.supportDefendCandidates = [];
		$gameTemp.supportDefendSelected = -1;
		
		$gameTemp.supportAttackCandidates = [];
		$gameTemp.supportAttackSelected = -1;
		
		let canUseSupporter = true;
								
		if(interactionInfo.isBetweenFriendlies && interactionInfo.interactionType == Game_System.INTERACTION_STATUS){
			canUseSupporter = false;
		}
		
		if(canUseSupporter){
			if((!$gameTemp.enemyAction || !$gameTemp.enemyAction.attack || !$gameTemp.enemyAction.attack.isAll)){	
				var supporters = $statCalc.getSupportDefendCandidates(
					$gameSystem.getFactionId(actorInfo.actor), 
					actorInfo.pos,
					$statCalc.getCurrentAliasedTerrainIdx(actorInfo.actor)
				);
				
				if($statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_support"]) || 
					$statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_target_support"])){
					supporters = [];
				}
				
				var supporterSelected = -1;
				var minDamage = -1;
				for(var i = 0; i < supporters.length; i++){
					supporters[i].action = {type: "defend", attack: null};			
					var damageResult = $battleCalc.performDamageCalculation(
						{actor: enemyInfo.actor, action: $gameTemp.enemyAction},
						supporters[i],
						true,
						false,
						true	
					);				
					if(minDamage == -1 || damageResult.damage < minDamage){
						if(damageResult.damage < $statCalc.getCalculatedMechStats(supporters[i].actor).currentHP){
							minDamage = damageResult.damage;
							supporterSelected = i;
						}				
					}
				}
				$gameTemp.supportDefendCandidates = supporters;
				if($gameSystem.optionDefaultSupport){
					$gameTemp.supportDefendSelected = supporterSelected;
				} else {
					$gameTemp.supportDefendSelected = -1;
				}			
			}
			var supporters = $statCalc.getSupportAttackCandidates(
				$gameSystem.getFactionId(enemyInfo.actor), 
				{x: $gameTemp.activeEvent().posX(), y: $gameTemp.activeEvent().posY()},
				$statCalc.getCurrentAliasedTerrainIdx($gameTemp.currentBattleEnemy)
			);
			
			var aSkill = $statCalc.getPilotStat(enemyInfo.actor, "skill");
			var dSkill = $statCalc.getPilotStat(actorInfo.actor, "skill");
			
			if((aSkill - dSkill >= 20) && $statCalc.applyStatModsToValue(enemyInfo.actor, 0, ["attack_again"])){
				supporters.push({actor:enemyInfo.actor, pos: {x: enemyInfo.actor.event.posX(), y: enemyInfo.actor.event.posY()}});
			}
			
			if($statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_support"]) || 
				$statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_target_support"])){
				supporters = [];
			}
			
			var allRequired = false;
			if($gameTemp.enemyAction && $gameTemp.enemyAction.attack){
				allRequired = $gameTemp.enemyAction.attack.isAll ? 1 : -1;
			}
			
			var supporterInfo = [];
			var supporterSelected = -1;
			var bestDamage = 0;
			for(var i = 0; i < supporters.length; i++){
				var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], actorInfo, false, false, false, allRequired);
				if(weaponResult.weapon){
					supporters[i].action = {type: "attack", attack: weaponResult.weapon};
					supporterInfo.push(supporters[i]);
					if(bestDamage < weaponResult.damage){
						bestDamage = weaponResult.damage;
						supporterSelected = i;
					}
				}
			}										
			$gameTemp.supportAttackCandidates = supporterInfo;
			$gameTemp.supportAttackSelected = supporterSelected;
			
			$battleCalc.updateTwinSupportAttack();
		}
		
		//hack to make sure that the actor attacks from the correct side of the screen when dealing with AI actors
		if(!$gameSystem.isEnemy($gameTemp.currentBattleEnemy) && $gameSystem.isEnemy($gameTemp.currentBattleActor)){
			$gameTemp.isEnemyAttack = false;
			var tmp = $gameTemp.currentBattleActor;
			$gameTemp.currentBattleActor = $gameTemp.currentBattleEnemy;
			$gameTemp.currentBattleEnemy = tmp;
			
			var tmp = $gameTemp.actorAction;
			$gameTemp.actorAction = $gameTemp.enemyAction;
			$gameTemp.enemyAction = tmp;
		}
		$gameTemp.currentTargetingSettings = null;	
		$battleCalc.updateTwinActions();
		
		var weapon = $gameTemp.enemyWeaponSelection;
		var range = $statCalc.getRealWeaponRange(actionArray[1], weapon);
		var minRange = $statCalc.getRealWeaponMinRange(actionArray[1], weapon);
		var event = actionArray[1].event;		
		
		this.setUpAttackRange(event.posX(), event.posY(), range, minRange);
		
		$gameSystem.setSubBattlePhase("enemy_targeting_display");
		$gameTemp.targetingDisplayCounter = $gameSystem.getScaledTime(40);
		/*$gameTemp.fastReticule = false;
		if(Input.isTriggered('ok') || Input.isPressed('ok') || Input.isLongPressed('ok')){
			$gameTemp.targetingDisplayCounter = 15;
			$gameTemp.fastReticule = true;
		}*/
       
    };

    //戦闘処理の実行
    Scene_Map.prototype.srpgBattleStart = function(actionArray, targetArray) {		
		$statCalc.setCurrentAttack($gameTemp.currentBattleActor, $gameTemp.actorAction.attack);	
		if($gameTemp.currentBattleActor.subTwin){
			$statCalc.setCurrentAttack($gameTemp.currentBattleActor.subTwin, $gameTemp.actorTwinAction.attack);	
		}
		$statCalc.setCurrentAttack($gameTemp.currentBattleEnemy, $gameTemp.enemyAction.attack);	
		if($gameTemp.currentBattleEnemy.subTwin){
			$statCalc.setCurrentAttack($gameTemp.currentBattleEnemy.subTwin, $gameTemp.enemyTwinAction.attack);	
		}
		$battleCalc.generateBattleResult();
		
				
				
     
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];				
			if(	
				battleEffect.madeContact && 
				battleEffect.attacked && 
				$statCalc.applyStatModsToValue(battleEffect.ref, 0, ["noise_destroy"]) && 
				$statCalc.getSpecies(battleEffect.attacked.ref) == "human" && 
				!$statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["noise_destroy_immune"]) && 
				!$statCalc.isStatModActiveOnAnyActor("noise_destroy_immune_all")
			){						
				battleEffect.isDestroyed = true;
				battleEffect.attacked.isDestroyed = true;
			}					
			
		});
		
		
		$gameTemp.clearMoveTable();
		$gameTemp.isEnemyAttack = false;
		$gameTemp.battleOccurred = true;
		
				
		
		this.eventBeforeBattle();		
			
		this.beforeBattleEventTimer = 20;
		$gameTemp.popMenu = true;
		$gameSystem.setSubBattlePhase('event_before_battle');		
    };
	
	Scene_Map.prototype.enemyMapAttackStart = function(actionArray, targetArray) {	
		var _this = this;
		$gameTemp.isEnemyAttack = true;
		$battleCalc.generateMapBattleResult();				
				
		$gameTemp.mapAttackOccurred = true;
		$gameTemp.mapAttackAnimationStarted = false;
		$gameTemp.mapAttackAnimationDelay = 30; 
		$gameTemp.mapAttackRetargetDelay = 30; 
		$gameTemp.showBeforeEnemyMapAnimation = true;
		$gameSystem.setSubBattlePhase('before_enemy_map_animation');			
    };
	
	Scene_Map.prototype.mapAttackStart = function(actionArray, targetArray) {	
		var _this = this;
		$gameTemp.isEnemyAttack = false;
		$battleCalc.generateMapBattleResult();				
		$gameTemp.clearMoveTable();		
		$gameTemp.mapAttackOccurred = true;
		$gameTemp.mapAttackAnimationStarted = false;
		$gameSystem.setSubBattlePhase('map_attack_animation');		
    };
	
	Scene_Map.prototype.playBattleScene = function() {
		if($gameSystem.demoSetting){			
			this.startEncounterEffect();
			//$battleSceneManager.earlyPreloadSceneAssets();				
		} else {
			$gameTemp.popMenu = true;//remove before battle menu
			$gameSystem.setSubBattlePhase('battle_basic');
			$gameTemp.pushMenu = "battle_basic";
		}
	}

    // 戦闘開始時に向きを修正する
    Scene_Map.prototype.preBattleSetDirection = function() {
        var differenceX = $gameTemp.activeEvent().posX() - $gameTemp.targetEvent().posX();
        var differenceY = $gameTemp.activeEvent().posY() - $gameTemp.targetEvent().posY();
        if ($gameMap.isLoopHorizontal() == true) {
            var event1X = $gameTemp.activeEvent().posX() > $gameTemp.targetEvent().posX() ? $gameTemp.activeEvent().posX() - $gameMap.width() : $gameTemp.activeEvent().posX() + $gameMap.width();
            var disX = event1X - $gameTemp.targetEvent().posX();
            differenceX = Math.abs(differenceX) < Math.abs(disX) ? differenceX : disX;
        }
        if ($gameMap.isLoopVertical() == true) {
            var event1Y = $gameTemp.activeEvent().posY() > $gameTemp.targetEvent().posY() ? $gameTemp.activeEvent().posY() - $gameMap.height() : $gameTemp.activeEvent().posY() + $gameMap.height();
            var disY = event1Y - $gameTemp.targetEvent().posY();
            differenceY = Math.abs(differenceY) < Math.abs(disY) ? differenceY : disY;
        }
        if (Math.abs(differenceX) > Math.abs(differenceY)) {
            if (differenceX > 0) {
                $gameTemp.activeEvent().setDirection(4);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(6);
            } else {
                $gameTemp.activeEvent().setDirection(6);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(4);
            }
        } else {
            if (differenceY >= 0) {
                $gameTemp.activeEvent().setDirection(8);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(2);
            } else {
                $gameTemp.activeEvent().setDirection(2);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(8);
            }
        }
    };

      // SRPG戦闘中は戦闘開始エフェクトを高速化する
    var _SRPG_SceneMap_updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
    Scene_Map.prototype.updateEncounterEffect = function() {
      		
		this._transitionSprite.scale.x = this._transitionSpriteScale;
		this._transitionSprite.scale.y = this._transitionSpriteScale;
		if (this._transitionFilter.strength >= 0.4) {	
			this._transitionSprite.opacity-=10;
			/*this._transitionSpriteScale+=0.005;
			this._transitionSprite.x-=2.5;
			this._transitionSprite.y-=0.5;*/
			this._transitionFilter.strength+=0.01;
			if(this._transitionFilter.strength >= 0.65){
				//this._transitionFilter.blurX = 0;	
				//this.clearTREffects();
				this._transitioningToBattle = false;
				this._loadingIntoBattle = true;
				this.removeChild(this._transitionSprite);				
			}			
		} else {
			this._transitionFilter.strength+=0.02;
		}
		this._transitionTimer++;
    };

    // SRPG戦闘中は戦闘開始エフェクトを高速化する
    var _SRPG_SceneMap_encounterEffectSpeed = Scene_Map.prototype.encounterEffectSpeed;
    Scene_Map.prototype.encounterEffectSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
            return 10;
        } else {
            return _SRPG_SceneMap_encounterEffectSpeed.call(this);
        }
    };
	
	var _SRPG_SceneMap_startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
    Scene_Map.prototype.startEncounterEffect = function() {
        /*if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
            this._encounterEffectDuration = this.encounterEffectSpeed();
        } else {
            _SRPG_SceneMap_startEncounterEffect.call(this);
        }*/
		
		try {
			this.removeChild(this._transitionBackSprite);
		} catch(e){
			
		}
		
		this._transitionBase = SceneManager.snap();
		
		this._transitioningToBattle = true;
		this._transitionTimer = 0;
	
		this._transitionBackSprite = new Sprite(new Bitmap(Graphics.boxWidth,Graphics.boxHeight));
		this._transitionBackSprite.bitmap.fillAll('black');
		this.addChild(this._transitionBackSprite);

		this._transitionSprite = new Sprite(this._transitionBase);
		this._transitionSpriteScale = 1;
		
		var filter = new PIXI.filters.ZoomBlurFilter();
		filter.strength = 0.01;
		var x = 0;
		var y = 0;
		var activeEvent = $gameTemp.targetEvent();
		if(activeEvent){
			x = activeEvent.screenX();
			y = activeEvent.screenY() - 24;
		}
		filter.center = [x, y];
		filter.innerRadius = 0;
		
		this._transitionFilter = filter;	
		
		/*var twistFilter = new PIXI.filters.TwistFilter();
		twistFilter.angle = -0.5;
		twistFilter.offset = [Graphics._getCurrentWidth() / 2, Graphics._getCurrentHeight() / 2];
		twistFilter.radius = 0;
		
		this._twistFilter = twistFilter;	*/
		
		this._transitionSprite.filters = [filter];
		this.addChild(this._transitionSprite);
		
		if($gameSystem.optionBattleBGM){
			$songManager.playBattleSong($gameTemp.currentBattleActor, $gameTemp.currentBattleEnemy);
		}		
    };
	
	Scene_Gameover.prototype.gotoTitle = function() {
		$gameTemp.intermissionPending = true;
		
		$SRWSaveManager.lockMapSRPoint($gameMap.mapId());	
		$gameMap._interpreter.clear();//make sure no events run after the game over before loading into the intermission
		$gamePlayer.reserveTransfer(2, 0, 0);//send player to intermission after losing
		SceneManager.goto(Scene_Map);
	};
	
	Scene_Map.prototype.callMenu = function() {
		//SoundManager.playOk();
		//SceneManager.push(Scene_Menu);
		//Window_MenuCommand.initCommandPosition();
		//$gameTemp.clearDestination();
		//this._mapNameWindow.hide();
		//this._waitCount = 2;
		//this.showPauseMenu()
	};

//====================================================================
// ●Scene_Menu
//====================================================================
    var _SRPG_SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
       
    };    

    Scene_Menu.prototype.commandAutoBattle = function() {
        $gameTemp.setTurnEndFlag(true);
        $gameTemp.setAutoBattleFlag(true);
        SceneManager.pop();
    };
	
	Scene_Menu.prototype.createStatusWindow = function() {
        
    };
	
	Scene_Menu.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this);
		
	};
	
	

	Scene_Menu.prototype.createGoldWindow = function() {
		this._goldWindow = new Window_StageInfo(0, 0);
		this._goldWindow.y = this._commandWindow.y + this._commandWindow.windowHeight();
		this._goldWindow.x = 800;
		this.addWindow(this._goldWindow);
	};
	
	SceneManager.snapForBackground = function() {
		this._backgroundBitmap = this.snap();
		this._backgroundBitmap.blur();
	};
	
	SceneManager.snap = function() {
		return Bitmap.snap(this._scene);
	};
	

//====================================================================
// ●Scene_Equip
//====================================================================
    Scene_Equip.prototype.popScene = function() {
        if ($gameSystem.isSRPGMode() == true && $gameTemp.activeEvent()) {
            $gameTemp.setSrpgActorEquipFlag(true);
        }
        SceneManager.pop();
    };

//====================================================================
// ●Scene_Load
//====================================================================
    var _SRPG_Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
    Scene_Load.prototype.onLoadSuccess = function() {
        _SRPG_Scene_Load_onLoadSuccess.call(this);
        if ($gameSystem.isSRPGMode() == true) {
            $gameTemp.setSrpgLoadFlag(true);
        }
    };

    var _SRPG_Scene_Load_reloadMapIfUpdated = Scene_Load.prototype.reloadMapIfUpdated;
    Scene_Load.prototype.reloadMapIfUpdated = function() {
        if ($gameSystem.isSRPGMode() == false) {
            _SRPG_Scene_Load_reloadMapIfUpdated.call(this);
        }
    };
	
	
	//-----------------------------------------------------------------------------
	// Scene_Disclaimer
	//
	// The scene class of the title screen.

	
	Scene_Boot.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		SoundManager.preloadImportantSounds();
		if (DataManager.isBattleTest()) {
			DataManager.setupBattleTest();
			SceneManager.goto(Scene_Battle);
		} else if (DataManager.isEventTest()) {
			DataManager.setupEventTest();
			SceneManager.goto(Scene_Map);
		} else {
			this.checkPlayerLocation();
			DataManager.setupNewGame();
			if(ENGINE_SETTINGS.DISCLAIMER_TEXT){
				SceneManager.goto(Scene_Disclaimer);
			} else {
				SceneManager.goto(Scene_Title);
			}
			
			Window_TitleCommand.initCommandPosition();
		}
		this.updateDocumentTitle();
	};
		
})();

function Scene_Disclaimer() {
	this.initialize.apply(this, arguments);
}

Scene_Disclaimer.prototype = Object.create(Scene_Base.prototype);
Scene_Disclaimer.prototype.constructor = Scene_Disclaimer;

Scene_Disclaimer.prototype.initialize = function() {
	Scene_Base.prototype.initialize.call(this);
};

Scene_Disclaimer.prototype.create = function() {
	Scene_Base.prototype.create.call(this);
	this.createForeground();
};

Scene_Disclaimer.prototype.start = function() {
	Scene_Base.prototype.start.call(this);
	SceneManager.clearStack();

	//this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Disclaimer.prototype.update = function() {
	Scene_Base.prototype.update.call(this);
	if (!this._leavingScene && (Input.isTriggered('ok') || Input.isTriggered('cancel') || TouchInput.isTriggered() || TouchInput.isCancelled())) {
		this.startFadeOut(this.slowFadeSpeed(), false);
		this._leavingScene = true;
		
	}
	if(this._leavingScene && !this.isBusy()){
		SceneManager.goto(Scene_Title);		
	}
};

Scene_Disclaimer.prototype.terminate = function() {
	Scene_Base.prototype.terminate.call(this);
	SceneManager.snapForBackground();
};

Scene_Disclaimer.prototype.createForeground = function() {
	this._disclaimerSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
	this.addChild(this._disclaimerSprite);
	var x = 20;
	var maxWidth = Graphics.width - x * 2;
	var y = 20;
	var text = ENGINE_SETTINGS.DISCLAIMER_TEXT;
	var lines = text.split("\n");
	var ctr = 0;
	this._disclaimerSprite.bitmap.fontSize = ENGINE_SETTINGS.FONT_SIZE || 24;
	for(line of lines){		
		this._disclaimerSprite.bitmap.drawText(line, x, y + 28 * ctr++, maxWidth, ENGINE_SETTINGS.LINE_HEIGHT || 28, "left");
	}	
};

SceneManager.onKeyDown = function(event) {
	if (!event.ctrlKey && !event.altKey) {
		switch (event.keyCode) {
		case 116:   // F5
			if (Utils.isNwjs()) {
				if($battleSceneManager){
					$battleSceneManager.dispose();
				}
				location.reload();
			}
			break;
		case 119:   // F8
			if (Utils.isNwjs() && Utils.isOptionValid('test')) {
				require('nw.gui').Window.get().showDevTools();
			}
			break;
		}
	}
};

let lastLogTime = {};
function logSafe(type, msg){
	if(!lastLogTime[type]){
		lastLogTime[type] = Date.now();
	}
	if(Date.now() - lastLogTime[type] > 2000){
		lastLogTime[type] = Date.now();
		console.log(msg);
	}
}


Game_Actors.prototype.actor = function(actorId) {
	if(actorId == null){
		return null;
	}
	//resolve indirect actor id. if the pattern <x> is matched, the actor id is the value of game variable x
	var parts = String(actorId).match(/\<(.*)\>/);	
	if(parts && parts.length > 1){
		actorId = $gameVariables.value(parts[1]);
	}
	
    if ($dataActors[actorId]) {
        if (!this._data[actorId]) {
            this._data[actorId] = new Game_Actor(actorId);
        }
        return this._data[actorId];
    }
    return null;
};
