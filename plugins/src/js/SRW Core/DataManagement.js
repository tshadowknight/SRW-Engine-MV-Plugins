	const {Parser} = require("acorn")
	
	export default {
		patches: patches,
		ScriptCharactersLoader,
		DeployActionsLoader
	} 
	
	function patches(){};
	
	patches.apply = function(){
		//====================================================================
		// Save Management
		//====================================================================	
		

		
		Scene_Boot.prototype.create = function() {
			Scene_Base.prototype.create.call(this);
			DataManager.checkSRWKit().then(async function(){
				DataManager.loadDatabase();
				await DataManager.loadSRWConfig();
				ConfigManager.load();	
				if(ENGINE_SETTINGS.PRELOADER){
					ENGINE_SETTINGS.PRELOADER();
				}		
			});			
			this.loadSystemWindowImage();
		};
		
		Scene_Boot.prototype.isReady = function() {
			if(!DataManager.isSRWKitChecked()){
				return false;
			}
			if(!$scriptCharactersLoader || !$scriptCharactersLoader._isLoaded){
				return false;
			}
			if(!$deployActionsLoader || !$deployActionsLoader._isLoaded){
				return false;
			}
			if(!$mapAttackManager || !$mapAttackManager._isLoaded){
				return false;
			}
			if (Scene_Base.prototype.isReady.call(this)) {
				return DataManager.isDatabaseLoaded() && this.isGameFontLoaded() && DataManager.isConfigLoaded();
			} else {
				return false;
			}
		};
		
		DataManager.maxSavefiles = function() {
			return 100;
		};
		
		DataManager.isConfigLoaded = function() {
			return this._configLoaded;
		}
		
		DataManager.isSRWKitChecked = function() {
			return this._SRWKitChecked;
		}
		
		DataManager.isThisGameFile = function(savefileId) {
			var globalInfo = this.loadGlobalInfo();
			if (globalInfo && globalInfo[savefileId]) {
				if (StorageManager.isLocalMode()) {
					return true;
				} else {
					var savefile = globalInfo[savefileId];
					return (savefile.globalId === ENGINE_SETTINGS.GAMEID || 'SRWMV');
				}
			} else {
				return false;
			}
		};
		
		DataManager.checkSRWKit = async function(){
			var _this = this;
			if (Utils.isNwjs() && process.versions["nw-flavor"] === "sdk") {
				const fs = require('fs');
				var path = require('path');
				var base = getBase();
				let filesToCheck = ["AllyPilots", "Mechs", "MechWeapons", "EnemyPilots", "DeployActions", "MapAttacks", "ScriptCharacters", "Patterns", "BattleAnimations", "BattleEnvironments", "BattleText"];
				let missingFiles = [];	
				filesToCheck.forEach(function(file){
					if (!fs.existsSync("data/"+file+".json")) {
						missingFiles.push(file);
					}
				});
				if(missingFiles.length){
					var c = confirm("Some required data files are not present, this may be due to upgrading to a new engine version. Perform auto upgrade?");	
					if(c){
						await this.upgradeSRWKit(missingFiles);
					}
				}		
			}
			this._SRWKitChecked = true;	
		}
		
		DataManager.upgradeSRWKit = async function(missingFiles){
			const fs = require('fs');
			var path = require('path');
			var base = getBase();
			missingFiles.forEach(async function(file){
				if(file == "AllyPilots"){
					fs.copyFileSync("data/Actors.json", "data/AllyPilots.json", fs.constants.COPYFILE_EXCL);
				}
				if(file == "Mechs"){
					fs.copyFileSync("data/Classes.json", "data/Mechs.json", fs.constants.COPYFILE_EXCL);
				}
				if(file == "MechWeapons"){
					fs.copyFileSync("data/Weapons.json", "data/MechWeapons.json", fs.constants.COPYFILE_EXCL);
				}
				if(file == "EnemyPilots"){
					fs.copyFileSync("data/Enemies.json", "data/EnemyPilots.json", fs.constants.COPYFILE_EXCL);
				}
				if(file == "DeployActions"){				
					fs.writeFileSync("data/DeployActions.json", JSON.stringify({}));
				}
				if(file == "Patterns"){				
					fs.writeFileSync("data/Patterns.json", JSON.stringify([]));
				}
				if(file == "MapAttacks"){
					var sourceFile = "js/plugins/config/active/MapAttacks.conf.js";
					if(!fs.existsSync(sourceFile)){
						sourceFile = "js/plugins/config/default/MapAttacks.conf.js";
					}
					var s = document.createElement("script");
					s.type = "text/javascript";
					s.src = sourceFile;
					window.document.body.append(s);
					await new Promise(function(resolve, reject){
						 s.addEventListener('load', function() {
							$mapAttackManager.initLegacyFormat();
							fs.writeFileSync("data/MapAttacks.json", JSON.stringify($mapAttackManager._definitions));
						 });
					});		
				}
				if(file == "ScriptCharacters"){
					var sourceFile = "js/plugins/config/active/ScriptCharacters.json";
					if(!fs.existsSync(sourceFile)){
						sourceFile = "js/plugins/config/default/ScriptCharacters.json";
					}
					fs.copyFileSync(sourceFile, "data/ScriptCharacters.json", fs.constants.COPYFILE_EXCL);	
				}
				if(file == "BattleAnimations"){
					var sourceFile = "js/plugins/config/active/BattleAnimations.json";
					if(!fs.existsSync(sourceFile)){
						sourceFile = "js/plugins/config/default/BattleAnimations.json";
					}
					fs.copyFileSync(sourceFile, "data/BattleAnimations.json", fs.constants.COPYFILE_EXCL);	
				}
				if(file == "BattleEnvironments"){
					var sourceFile = "js/plugins/config/active/BattleEnvironments.json";
					if(!fs.existsSync(sourceFile)){
						sourceFile = "js/plugins/config/default/BattleEnvironments.json";
					}
					fs.copyFileSync(sourceFile, "data/BattleEnvironments.json", fs.constants.COPYFILE_EXCL);	
				}
				if(file == "BattleText"){
					var sourceFile = "js/plugins/config/active/BattleText.json";
					if(!fs.existsSync(sourceFile)){
						sourceFile = "js/plugins/config/default/BattleText.json";
					}
					fs.copyFileSync(sourceFile, "data/BattleText.json", fs.constants.COPYFILE_EXCL);	
				}
			});
		}
		
		DataManager.loadSRWConfig = async function() {		
			var _this = this;
			//const fs = require('fs');		
			
			
			
			function loadConfigFromFile(url){
				return new Promise(function(resolve, reject){
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url);
					//xhr.overrideMimeType('application/json');
					xhr.onload = function() {
						if (xhr.status < 400) {
							resolve(xhr.responseText);					
						} else {
							resolve(-1);
						}
					};
					xhr.onerror = function(){
						resolve(-1);
					}			
					
					window[name] = null;
					xhr.send();
				});
			}
	
			var configResults = [];
			
			async function loadConfigFile(path){					
				var result;
				var content = await loadConfigFromFile(path);
				
				try {
					if(content == -1){
						result = {status: "NOK", data: "Config '"+path+"' not found or empty!", path: path};
					} else {
						var parseError = false;
						try {
							Parser.parse(content);
						} catch(e){
							parseError = true;
							var msg = e.message;		
							if(e.loc){
								var lines = content.split("\n");
								var line = lines[e.loc.line-1];
								if(line && line.length > e.loc.column){
									var badChar = line.charAt(e.loc.column);
									msg+="<br>(line: "+e.loc.line+", column: "+e.loc.column+", token: '"+badChar+"')";
								}								
							}	
							result = {status: "NOK", data: msg, path: path};
						}
						
						if(!parseError){					
							//eval.call(window, content);
							await (new Promise(function(resolve, reject){
								var el = document.createElement('script');
								window.document.body.append(el);
								el.onload = resolve;
								el.src = path;									
							}));
							result = {status: "OK", data: "", path: path};
						}						
					}					
				} catch(e){
					result = {status: "NOK", data: e.message, path: path};
				}
				configResults[path] = result;
			}
			
			async function loadActiveConfig(type){			
				/*var path_lib = require('path');
				var base = path_lib.dirname(process.mainModule.filename);
				var path = '/js/plugins/config/active/'+type+'.conf.js';
				if (!fs.existsSync(path)) {					
					path = '/js/plugins/config/default/'+type+'.conf.js'
				}*/
				
				var base = getBase();
				
				var path = 'js/plugins/config/active/'+type+'.conf.js';
				await loadConfigFile(path);		
				if(configResults[path].status == "NOK"){
					delete configResults[path];
					path = 'js/plugins/config/default/'+type+'.conf.js'
					await loadConfigFile(path);		
				}
			}

			var configs = [
				//"Appstrings",
				"Input",
				//"Engine",
				"Spirits",
				"PilotAbilities",
				"MechAbilities",
				"ItemEffects",
				"WeaponEffects",
				"AbilityCommands",
				"StageInfo",
				"BattleSongs",
				//"MapAttacks",
				"BattleText",
				//"DeployActions",
				"RelationshipBonuses",
				"Constants",
				"AbilityZones",
				"TerrainTypes",
				"BasicBattleBGs"
			];
			
			
			
			var defs = [];
			configs.forEach(function(config){
				defs.push(loadActiveConfig(config));
			});
			await Promise.all(defs).then(async function(){
				var base = getBase();
				//Engine
				await loadConfigFile('js/plugins/config/default/Engine.conf.js');
				
				var ENGINE_SETTINGS_DEFAULT = window.ENGINE_SETTINGS;
				
				//if (fs.existsSync('/js/plugins/config/active/Engine.conf.js')) {
					await loadConfigFile('js/plugins/config/active/Engine.conf.js');						
				//}			
				if(configResults['js/plugins/config/default/Engine.conf.js'].status == "OK") {
					delete configResults['js/plugins/config/active/Engine.conf.js'];
				}		
				
				//Appstrings
				await loadConfigFile('js/plugins/config/default/Appstrings.conf.js');
				
				var APPSTRINGS_DEFAULT = window.APPSTRINGS;
				var EDITORSTRINGS_DEFAULT = window.EDITORSTRINGS;
				
				await loadConfigFile('js/plugins/config/active/Appstrings.conf.js');						
					
				if(configResults['js/plugins/config/default/Appstrings.conf.js'].status == "OK") {
					delete configResults['js/plugins/config/active/Appstrings.conf.js'];
				}		
					
				
				var errors = [];
				Object.keys(configResults).forEach(function(type){
					if(configResults[type].status == "NOK"){
						errors.push("An error occurred while loading config file '"+configResults[type].path+"': "+configResults[type].data+". Current work dir: " + process.cwd());
					}
				});
				if(errors.length){
					SceneManager.catchException(errors.join("<br><br>"));
				} else {	

					function updateFromDefault(defaultConf, activeConf){
						Object.keys(defaultConf).forEach(function(key){
							if(activeConf[key] == null){
								activeConf[key] = defaultConf[key];
							} else if(typeof defaultConf[key] == "object" && typeof activeConf[key] == "object"){
								updateFromDefault(defaultConf[key], activeConf[key]);
							}
						});
					}				

					if(typeof window.ENGINE_SETTINGS == "undefined"){
						window.ENGINE_SETTINGS = {};
					}
							
					updateFromDefault(ENGINE_SETTINGS_DEFAULT, window.ENGINE_SETTINGS);					
					updateFromDefault(APPSTRINGS_DEFAULT, window.APPSTRINGS);
					updateFromDefault(EDITORSTRINGS_DEFAULT, window.EDITORSTRINGS);
				
					$spiritManager.initDefinitions();
					$pilotAbilityManager.initDefinitions();
					$mechAbilityManager.initDefinitions();
					$itemEffectManager.initDefinitions();
					$abilityCommandManger.initDefinitions();
					$weaponEffectManager.initDefinitions();
					$relationshipBonusManager.initDefinitions();
					$songManager.initDefinitions();
					//$mapAttackManager.initDefinitions();
					$SRWStageInfoManager.initDefinitions();
					$abilityZoneManager.initDefinitions();
					$terrainTypeManager.initDefinitions();
					
					if(ENGINE_SETTINGS.CUSTOM_TITLE_SCREEN){
						 await loadConfigFile('js/plugins/'+ENGINE_SETTINGS.CUSTOM_TITLE_SCREEN+".js");
					}
					
					_this._configLoaded = true;
				}
			});
		}		

		DataManager.loadGameWithoutRescue = function(savefileId) {
			if (this.isThisGameFile(savefileId)) {
				var json = StorageManager.load(savefileId);
				this.createGameObjects();
				this.extractSaveContents(JsonEx.parse(json));
				this._lastAccessedId = savefileId;
				//$gameSystem.setSrpgActors();
				//$gameSystem.setSrpgEnemys();
				
				//patches for old save files
				if(!$gameSystem.untargetableAllies){
					$gameSystem.untargetableAllies = {};
				}
				
				if(ENGINE_SETTINGS.SAVE_UPDATE_FUNCTION){
					ENGINE_SETTINGS.SAVE_UPDATE_FUNCTION();
				}
				
				if($gameSystem.isIntermission()){
					$gameSystem.startIntermission();
				} else {
					$statCalc.invalidateAbilityCache();
					$statCalc.invalidateZoneCache();
					$statCalc.softRefreshUnits();
					
					$SRWGameState.requestNewState("normal");
				}			
				return true;
			} else {
				return false;
			}
		};
		
		DataManager.saveGameWithoutRescue = function(savefileId) {
			$gameSystem._saveRevision = ENGINE_SETTINGS.SAVE_REVISION || 0;
			var json = JsonEx.stringify(this.makeSaveContents());

			StorageManager.save(savefileId, json);
			this._lastAccessedId = savefileId;
			var globalInfo = this.loadGlobalInfo() || [];
			globalInfo[savefileId] = this.makeSavefileInfo();
			this.saveGlobalInfo(globalInfo);
			return true;
		};

		DataManager.makeSavefileInfo = function() {
			var info = {};
			info.globalId   = ENGINE_SETTINGS.GAMEID || 'SRWMV';
			
			let title = "";
			let stageId;
			if($gameSystem.isIntermission()){
				stageId = $gameVariables.value(_lastStageIdVariable);
			} else if($gameMap){
				stageId = $gameMap.mapId()
			}
			if(stageId != null){
				var stageInfo = $SRWStageInfoManager.getStageInfo(stageId);
				if(stageInfo){
					title = APPSTRINGS.INTERMISSION.stage_label+" "+stageInfo.displayId+" - ";
				}
			}			
			title+=$gameSystem.saveDisplayName || $dataSystem.gameTitle;
			info.title      = title;
			info.characters = $gameParty.charactersForSavefile();
			info.faces      = $gameParty.facesForSavefile();
			info.playtime   = $gameSystem.playtimeText();
			info.timestamp  = Date.now();
			info.funds = $gameParty.gold();
			info.SRCount = $SRWSaveManager.getSRCount();
			info.turnCount =  $gameVariables.value(_turnCountVariable)
			return info;
		};
		
		DataManager.saveContinueSlot = function() {
			var savefileId = "continue";
			$gameSystem.onBeforeSave();
			var json = JsonEx.stringify({date: Date.now(), content: this.makeSaveContents()});		
			StorageManager.save(savefileId, json);
			return true;
		};
		
		DataManager.loadContinueSlot = function() {
			try{
				var savefileId = "continue";
				var globalInfo = this.loadGlobalInfo();		
				var json = StorageManager.load(savefileId);
				this.createGameObjects();
				this.extractSaveContents(JsonEx.parse(json).content);
				if(ENGINE_SETTINGS.SAVE_UPDATE_FUNCTION){
					ENGINE_SETTINGS.SAVE_UPDATE_FUNCTION();
				}
				$statCalc.invalidateAbilityCache();
				$statCalc.invalidateZoneCache();
				$statCalc.softRefreshUnits();

				$SRWGameState.requestNewState("normal");
				
				SceneManager._scene.fadeOutAll()
				SceneManager.goto(Scene_Map);
				if($gameSystem._bgmOnSave){
					$gameTemp.continueLoaded = true;
				}			
			} catch(e){
				console.log("Failed to load continue save");
				console.trace();
			}		
			return true;		
		};
		
		DataManager.latestSavefileDate = function() {
			var globalInfo = this.loadGlobalInfo();
			var savefileId = 1;
			var timestamp = 0;
			if (globalInfo) {
				for (var i = 1; i < globalInfo.length; i++) {
					if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
						timestamp = globalInfo[i].timestamp;
						savefileId = i;
					}
				}
			}
			return timestamp;
		};	
		
		DataManager._databaseFiles = [
			{ name: '$dataActors',       src: 'AllyPilots.json'       },
			{ name: '$dataClasses',      src: 'Mechs.json'      },
			{ name: '$dataSkills',       src: 'Skills.json'       },
			{ name: '$dataItems',        src: 'Items.json'        },
			{ name: '$dataWeapons',      src: 'MechWeapons.json'      },
			{ name: '$dataArmors',       src: 'Armors.json'       },
			{ name: '$dataEnemies',      src: 'EnemyPilots.json'      },
			{ name: '$dataTroops',       src: 'Troops.json'       },
			{ name: '$dataStates',       src: 'States.json'       },
			{ name: '$dataAnimations',   src: 'Animations.json'   },
			{ name: '$dataTilesets',     src: 'Tilesets.json'     },
			{ name: '$dataCommonEvents', src: 'CommonEvents.json' },
			{ name: '$dataSystem',       src: 'System.json'       },
			{ name: '$dataMapInfos',     src: 'MapInfos.json'     },
		];
		
		DataManager.textScriptCache = {};
		
		DataManager.resetTextScriptCache = function(){
			DataManager.textScriptCache = {};
		}
		
		DataManager.loadTextScript = function(id) {
			return new Promise(function(resolve, reject){
				if(!DataManager.textScriptCache[id]){
					var xhr = new XMLHttpRequest();
					var url = 'text_scripts/' + id + ".mvs";
					xhr.open('GET', url);
					xhr.onload = function() {
						if (xhr.status < 400) {
							DataManager.textScriptCache[id] = xhr.responseText;
							resolve(xhr.responseText);
						}
					};
					xhr.onerror = reject;
					xhr.send();
				} else {
					resolve(DataManager.textScriptCache[id]);
				}				
			});			
		};
		StorageManager.localFileDirectoryPath = function() {
			var path = require('path');

		
			if(process.versions["nw-flavor"] === "sdk"){
			return getBase()+"save/";
			} else {
				var base = path.dirname(process.execPath);
				return path.join(base, '/../save/');
				
			}			
		};
		
		DataManager.interpretTextScript = function(scriptId) {
			var _this = this;
			var functionDefs = {};
			var defineDefs = {};
			var currentTxtLayout = {
				bg: 0,
				pos: 2
			};			
			
			function handleUpgradedPluginCommand(command, eventList, indent, params){
				eventList.push({
					code: 356,
					indent: indent,
					parameters: [command+" "+params.join(" ")]
				});
			}
			
			var pluginCommandNames = {
				SRPGBattle: true,
				Intermission: true,
				UnlockUnit: true,
				unlockUnit: true,
				assignUnit: true,
				lockUnit: true,
				SetLevel: true,
				setLevel: true,
				addKills: true,
				addPP: true,
				addExp: true,
				setStageSong: true,
				setSpecialTheme: true,
				clearSpecialTheme: true,
				addItem: true,
				addAllItems: true,
				removeItem: true,
				addItemToHolder: true,
				removeItemFromHolder: true,
				addEquipable: true,
				addEquipableToHolder: true,
				removeEquipableFromHolder: true,
				focusActor: true,
				focusEvent: true,
				clearDeployInfo: true,
				populateDeployList: true,
				setDeployCount: true,
				setMinDeployCount: true,
				setShipDeployCount: true,
				assignSlot: true,
				assignSlotFromMech: true,
				assignSlotSub: true,
				assignShipSlot: true,
				lockDeploySlot: true,
				unlockDeploySlot: true,
				disableDeploySlot: true, 
				enableDeploySlot: true,
				lockShipDeploySlot: true,
				unlockShipDeploySlot: true,
				setSRWBattleBg: true,
				setSRWBattleParallax1: true,
				setSRWBattleParallax2: true,
				setSRWBattleParallax3: true,
				setSRWBattleParallax3: true,
				setSRWBattleFloor: true,
				setSRWBattleSkybox: true,
				setSRWSkyBattleBg: true,
				setSRWSkyBattleParallax1: true,
				setSRWDefaultBattleEnv: true,
				setDefaultBattleEnv: true,
				setSkyBattleEnv: true,
				setSuperStateBattleEnv: true,
				setRegionBattleEnv: true,
				setRegionSkyBattleEnv: true,
				setRegionSuperStateBattleEnv: true,
				resetRegionAttributes: true,
				addRegionAttributes: true,
				addMapHighlight: true,
				removeMapHighlight: true,
				addMapRegionHighlight: true,
				removeMapRegionHighlight: true,
				setEnemyUpgradeLevel: true,
				setMechUpgradeLevel: true,
				setPilotRelationship: true,
				addPersuadeOption: true,
				removePersuadeOption: true,
				deployShips: true,
				deployAll: true,
				deployAllLocked: true,
				deployAllUnLocked: true,
				deployActor: true,
				deploySlot: true,
				redeployActor: true,
				moveEventToPoint: true,
				storeEventPoint: true,
				moveEventToStoredPoint: true,
				moveActorToPoint: true,
				moveEventToEvent: true,
				moveActorToEvent: true,
				moveEventToActor: true,
				moveActorToActor: true,
				setEventFlying: true,
				setEventLanded: true,
				enableFaction: true,
				disableFaction: true,
				setFactionAggro: true,
				clearFactionAggro: true,
				transformEvent: true,
				combineEvent: true,
				splitEvent: true,
				transformActor: true,
				transformActorDirect: true,
				combineActor: true,
				splitActor: true,
				separateActor: true,
				makeActorMainTwin: true,
				preventActorDeathQuote: true,
				setSaveDisplayName: true,
				setStageTextId: true,
				setEventWill: true,
				setEventWillOverflow: true,
				setEventUntargetable: true,
				setEventTargetable: true,
				setActorWill: true,
				makeActorAI: true,
				makeActorControllable: true,
				setActorEssential: true,
				setActorNonEssential: true,
				setEventMapCooldown: true,
				unlockMechWeapon: true,
				lockMechWeapon: true,
				setUnlockedUpgradeLevel: true,
				setRequiredFUBLevel: true,
				setEventCounterAction: true,
				setEventAttackAction: true,
				setEventBattleMode: true,
				hidePilotAbility: true,
				lockPilotAbility: true,
				unlockPilotAbility: true,
				hideMechAbility: true,
				lockMechAbility: true,
				unlockMechAbility: true,
				lockTransformation: true,
				lockAllTransformations: true,
				unlockTransformation: true,
				unlockAllTransformations: true,
				setFaceAlias: true,
				setCharacterIndexAlias: true,
				setPilotAbilityUpgrade: true,
				setMechAbilityUpgrade: true,
				clearTile: true,
				clearAdjacentToTile: true,
				clearAdjacentToEvent: true,
				clearAdjacentToActor: true,
				stopSkipping: true,
				setEventAIFlags: true,
				showTargetingReticule: true,
				setFreeEventCam: true,
				clearFreeEventCam: true,
				setTerrainMoveCosts: true,
				setCloudScrollImage: true,
				setCloudScrollFrequency: true,
				setCloudScrollXSpeed: true,
				setCloudScrollYSpeed: true,
				setDefaultFocusEvent: true,
				setDefaultFocusActor: true,
				lockCameraToCursor: true,
				unlockCameraFromCursor: true,
				setAllyWillCap: true,
				clearAllyWillCap: true,
				setEnemyWillCap: true,
				clearEnemyWillCap: true,
				setTerrainSolidForEnemy: true,
				setTerrainPassableForEnemy: true,
				disableVariablePortraits: true,
				enableVariablePortraits: true,
				lockCombine: true,
				lockAllCombines: true,
				unlockCombine: true,
				unlockAllCombines: true,
				setActorSong: true, 
				setActorWeaponSong: true,
				refundMechUpgrades: true,
				refundPilotPP: true,
				addFunds: true,
				setEventHP: true,
				setEventHPPercent: true,
				addSubPilot: true,
				removeSubPilot: true,
				setPortraitOverlay: true,
				hidePortraitOverlay: true,
				hideAllPortraitOverlays: true,
				setLocationHeader: true,
				clearLocationHeader: true,
				deployMech: true,
				setCustomSpirit: true, 
				clearCustomSpirit: true,
				awardFavPoints: true,
				deployItemBox: true,
				collectItemsBoxes: true
			}
			var scriptCommands = {
				fadeIn: function(eventList, indent, params){
					eventList.push({
						code: 222,
						indent: indent,
						parameters: []
					});
				},
				fadeOut: function(eventList, indent, params){
					eventList.push({
						code: 221,
						indent: indent,
						parameters: []
					});
				},
				wait: function(eventList, indent, params){
					eventList.push({
						code: 230,
						indent: indent,
						parameters: [params[0]]
					});
				},
				showBackground: function(eventList, indent, params){
					let x = 0;
					let y = 0;
					if(ENGINE_SETTINGS.VN_BG_OFFSET){
						x = ENGINE_SETTINGS.VN_BG_OFFSET.x || 0;
						y = ENGINE_SETTINGS.VN_BG_OFFSET.y || 0;
					}
					eventList.push({
						code: 231,
						indent: indent,
						parameters: [params[0], params[1], 0, 0, x, y, 100, 100, 255, 0]
					});
				},
				showPicture: function(eventList, indent, params){
					let blendMode = {
						"Normal": 0,
						"Additive": 1,
						"Multiply": 2,
						"Screen": 3
					}[params[9]] || 0;
					eventList.push({
						code: 231,
						indent: indent,
						parameters: [
							params[0] * 1,//pictureID
							params[1],//name
							params[2] == "Center" ? 1 : 0,//0, origin
							params[3] == "Direct" ? 0 : 1,//0, direct designation
							params[4] * 1,//0, x
							params[5] * 1,//0, y
							params[6] * 1,//scaleX
							params[7] * 1,//scaleY
							params[8] * 1,//opacity
							blendMode,//blend mode
						]
					});
				},
				hideBackground: function(eventList, indent, params){
					eventList.push({
						code: 235,
						indent: indent,
						parameters: [params[0]]
					});
				},
				erasePicture: function(eventList, indent, params){
					eventList.push({
						code: 235,
						indent: indent,
						parameters: [params[0]]
					});
				},
				movePicture: function(eventList, indent, params){
					let blendMode = {
						"Normal": 0,
						"Additive": 1,
						"Multiply": 2,
						"Screen": 3
					}[params[8]] || 0;
					eventList.push({
						code: 232,
						indent: indent,
						parameters: [
							params[0] * 1,//pictureID
							null,//name
							params[1] == "Center" ? 1 : 0,//0, origin
							params[2] == "Direct" ? 0 : 1,//0, direct designation
							params[3] * 1,//0, x
							params[4] * 1,//0, y
							params[5] * 1,//scaleX
							params[6] * 1,//scaleY
							params[7] * 1,//opacity
							blendMode,//blend mode,
							params[9] * 1,//duration
							params[10] == "wait" ? 1 : 0,//wait
						]
					});
				},
				rotatePicture: function(eventList, indent, params){
					eventList.push({
						code: 233,
						indent: indent,
						parameters: [params[0] * 1, params[1] * 1]
					});
				},
				tintPicture: function(eventList, indent, params){
					let colorArray = params[1].split(",");
					let tmp = [];
					colorArray.forEach(function(val){
						tmp.push(val * 1);
					});
					colorArray = tmp;
					eventList.push({
						code: 234,
						indent: indent,
						parameters: [
							params[0] * 1, //picture id
							colorArray, //tone
							params[2] * 1, //duration
							params[3] == "wait" ? 1 : 0,//wait
						]
					});
				},
				playSE: function(eventList, indent, params){
					eventList.push({
						code: 250,
						indent: indent,
						parameters: [{name: params[0], volume: params[1] || 90, pitch: params[2] || 100, pan: params[3] || 0}]
					});
				},
				playBGM: function(eventList, indent, params){
					eventList.push({
						code: 241,
						indent: indent,
						parameters: [{name: params[0], volume: params[1] || 90, pitch: params[2] || 100, pan: params[3] || 0}]
					});
				},
				fadeOutBGM: function(eventList, indent, params){
					eventList.push({
						code: 242,
						indent: indent,
						parameters: [params[0]*1]
					});
				}, 
				playBGS: function(eventList, indent, params){
					eventList.push({
						code: 245,
						indent: indent,
						parameters: [{name: params[0], volume: params[1] || 90, pitch: params[2] || 100, pan: params[3] || 0}]
					});
				},
				fadeOutBGS: function(eventList, indent, params){
					eventList.push({
						code: 246,
						indent: indent,
						parameters: [params[0]*1]
					});
				}, 
				setVar: function(eventList, indent, params){
					var value = params[1];
					var type;
					if(Number.isInteger(value)){
						value = value * 1;
						type = 0;
					} else {
						type = 4;
					}
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 0, type, value]
					});
				},
				addVar: function(eventList, indent, params){
					var value = params[1] * 1;
					var type;
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 1, 0, value]
					});
				},
				subVar: function(eventList, indent, params){
					var value = params[1] * 1;
					var type;
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 2, 0, value]
					});
				},
				mulVar: function(eventList, indent, params){
					var value = params[1] * 1;
					var type;
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 3, 0, value]
					});
				},
				divVar: function(eventList, indent, params){
					var value = params[1] * 1;
					var type;
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 4, 0, value]
					});
				},
				modVar: function(eventList, indent, params){
					var value = params[1] * 1;
					var type;
					eventList.push({
						code: 122,
						indent: indent,
						parameters: [params[0]*1,params[0]*1, 5, 0, value]
					});
				},
				setSwitch: function(eventList, indent, params){
					eventList.push({
						code: 121,
						indent: indent,
						parameters: [params[0]*1,params[0]*1,String(params[1]).trim() == "ON" ? 0 : 1]
					});
				},
				pluginCmd: function(eventList, indent, params){				
					eventList.push({
						code: 356,
						indent: indent,
						parameters: [params.join(" ")]
					});
				},
				txtLayout: function(eventList, indent, params){				
					currentTxtLayout.bg = {
						window: 0,
						dim: 1,
						transparent: 2
					}[params[0].toLowerCase()];
					currentTxtLayout.pos = {
						top: 0,
						middle: 1,
						bottom: 2
					}[params[1].toLowerCase()];
				},
				gameOver: function(eventList, indent, params){				
					eventList.push({
						code: 353,
						indent: indent,
						parameters: []
					});
				},
				shakeScreen: function(eventList, indent, params){				
					eventList.push({
						code: 225,
						indent: indent,
						parameters: [params[0]*1,params[1]*1,params[2]*1,String(params[3]).trim() == "wait"]
					});
				},
				showAnimation: function(eventList, indent, params){				
					eventList.push({
						code: 212,
						indent: indent,
						parameters: [params[0]*1,params[1]*1,String(params[2]).trim() == "wait"]
					});
				},
				tintScreen: function(eventList, indent, params){	
					var colorArray = params[0].split(",");
					var tmp = [];
					colorArray.forEach(function(val){
						tmp.push(val * 1);
					});
					eventList.push({
						code: 223,
						indent: indent,
						parameters: [tmp,params[1]*1,String(params[2]).trim() == "wait"]
					});
				},
				label: function(eventList, indent, params){				
					eventList.push({
						code: 118,
						indent: indent,
						parameters: [String(params[0]).trim()]
					});
				},
				jumpLabel: function(eventList, indent, params){				
					eventList.push({
						code: 119,
						indent: indent,
						parameters: [String(params[0]).trim()]
					});
				},
				changePartyMember: function(eventList, indent, params){				
					eventList.push({
						code: 129,
						indent: indent,
						parameters: [params[1]*1, String(params[0]).trim().toLowerCase() == "add" ? 0 : 1]
					});
				},
				warp: function(eventList, indent, params){				
					eventList.push({
						code: 201,
						indent: indent,
						parameters: [0, params[0]*1, params[1]*1, params[2]*1]
					});
				},
				generic: function(eventList, indent, params){
					var params = JSON.parse(JSON.stringify(params));
					var id = params.shift();
					eventList.push({
						code: id,
						indent: indent,
						parameters: params
					});
				},
				
			};
			
			
			
			function getLineType(line){
				line = line.trim();
				var result = {
					type: "txt",
					data: []
				}
				
				if(line == "{"){
					result.type = "script_start";
					return result;
				}
				
				if(line == "[script]"){
					result.type = "script_start_explicit";
					return result;
				}
				if(line == "[/script]"){
					result.type = "script_end_explicit";
					return result;
				}
				
				if(line == "/*"){
					result.type = "comment_start";
					return result;
				}
				if(line == "*/"){
					result.type = "comment_end";
					return result;
				}
				var subMatch = /function (.*)\{/.exec(line);
				if(subMatch){
					result.type = "function";					
					result.data = [subMatch[1].trim()];
				}
				if(line == "}"){
					result.type = "function_end";
				}
				
				var moveMatch = /move (.*?) (.*?)\{/.exec(line);
				if(moveMatch){
					result.type = "move_start";
					result.data = [moveMatch[1].trim(), moveMatch[2].trim() == "wait" ? true : false];
				}
				
				var callMatch = /call (.*)\((.*)\)/.exec(line);
				if(callMatch){
					result.type = "function_call";
					var regex = new RegExp("(?<!\\\\),");
					var args = callMatch[2].split(regex);
					var tmp = [];
					args.forEach(function(arg){
						tmp.push(String(arg).trim());
					});
					result.data = [callMatch[1].trim(), tmp];
				}
				
				var incMatch = /\#include (.*)/.exec(line);
				if(incMatch){
					result.type = "include";					
					result.data = [incMatch[1].trim()];
				}
				
				var defineMatch = /\#define (\<.*\>) (.*)/.exec(line);
				if(defineMatch){
					result.type = "define";					
					result.data = [defineMatch[1].trim(), defineMatch[2].trim()];
				}
				
				if(line.indexOf("*") == 0){
					result.type = "txt_start",
					line = line.replace(/^\*/,"");
					result.data = line.split(" ");
				}
				if(line == "[choice]"){
					result.type = "choice_start";
				}
				if(line == "[/choice]"){
					result.type = "choice_end";
				}
				
				var conditionalMatch = /\[if var(.*?)([\=\=|\<|\>|\>\=|\<\=|\!\=]+)(.*?)\]/.exec(line);
				if(conditionalMatch){
					result.type = "conditional_start";
					var params = [];
					
					var compared = conditionalMatch[3].trim();
					var comparison = conditionalMatch[2].trim();
					var comparisonId;
					switch (comparison) {
						case "==":  // Equal to
							comparisonId = 0;
							break;
						case ">=":  // Greater than or Equal to
							comparisonId = 1;
							break;
						case "<=":  // Less than or Equal to
							comparisonId = 2;
							break;
						case ">":  // Greater than
							comparisonId = 3;
							break;
						case "<":  // Less than
							comparisonId = 4;
							break;
						case "!=":  // Not Equal to
							comparisonId = 5;
							break;
					}
					
					var varId = conditionalMatch[1].trim();						
					params = [1, varId, 0, compared * 1, comparisonId];						
					
					result.data = params;
				}
				
				var conditionalSwitchMatch = /\[if switch(.*?) (.*)\]/.exec(line);
				if(conditionalSwitchMatch){
					result.type = "conditional_start";
					var params = [];											
					params = [0, conditionalSwitchMatch[1].trim(), conditionalSwitchMatch[2].trim() == "ON" ?  0 : 1];											
					
					result.data = params;
				}	

				var conditionalSwitchMatch = /\[if script(.*)]/.exec(line);
				if(conditionalSwitchMatch){
					result.type = "conditional_start";
					var params = [];											
					params = [12, conditionalSwitchMatch[1]];											
					
					result.data = params;
				}		
				
				if(line == "[else]"){
					result.type = "else";
				}
				
				if(line == "[/if]"){
					result.type = "conditional_end";
				}
				var entryMatch = /^\[(\d)\](.*)/.exec(line);
				if(entryMatch){
					result.type = "choice_entry";
					result.data = [entryMatch[1] - 1, entryMatch[2].trim()];
				}
				if(line.indexOf("//") == 0){
					result.type = "comment";
				}
				
				
				var cmdMatch = /^\[(.*?)\:(.*)\]/.exec(line);
				if(cmdMatch && cmdMatch.length == 3){
					if(scriptCommands[cmdMatch[1].trim()] || pluginCommandNames[cmdMatch[1].trim()]){
						result.type = "command";
						var argString =  cmdMatch[2].trim();
						var scriptTokens = /\{(.*?)\}/g.exec(argString);
						var tokenCtr = 0;
						var tokenLookup = {};
						if(scriptTokens){
							scriptTokens.shift();
							scriptTokens.forEach(function(scriptToken){
								var regex = new RegExp(scriptToken, "g");
								tokenLookup["{script_"+tokenCtr+"}"] = scriptToken;
								argString = argString.replace(scriptToken, "script_"+tokenCtr);
							});
						}	
						var args = argString.split(" ");
						var tmp = [];
						args.forEach(function(arg){
							if(tokenLookup[arg]){
								tmp.push(tokenLookup[arg]);
							} else {
								tmp.push(arg);
							}
						});
						
						result.data = [cmdMatch[1].trim(), tmp];
					}
					
				}
				return result;
			}
			
			function processArgTokens(args, line){
				var argTokens = line.match(/args\_(\d+)/g);
				if(argTokens){
					argTokens.forEach(function(argToken){
						var argIdx = argToken.replace("args_", "");
						var regex = new RegExp(argToken, "g");
						line = line.replace(regex, args[argIdx] || "");
					});
				}
				return line;
			}
			
			function processDefineTokens(line){
				var defineTokens = line.match(/(<.*?>)/g);
				if(defineTokens){
					defineTokens.forEach(function(token){
						if(defineDefs[token]){
							var regex = new RegExp(token, "g");
							line = line.replace(regex, defineDefs[token]);
						} else {
							//console.log("Unknown define '"+token+"', did you forget an include?");
						}				
					});
				}
				return line;
			}
			
			function processVarTokens(line){
				var defineTokens = line.match(/(\|.*?\|)/g);
				if(defineTokens){
					defineTokens.forEach(function(token){
						var originalToken = token;
						token = token.replace(/^\|/, "<");
						token = token.replace(/\|$/, ">");
						if(defineDefs[token]){
							var regex = new RegExp(originalToken, "g");
							var value = $gameVariables.value(defineDefs[token]);
							line = line.replace(regex, value);
						} else {
							//console.log("Unknown define '"+token+"', did you forget an include?");
						}				
					});
				}
				return line;
			}
			
			function processBlock(contentParts, indent, args, isInclude){
				if(!args){
					args = [];
				}
				var eventList = [];
				if(indent > 10){
					return eventList;
				}
				for(var i = 0; i < contentParts.length; i++){
					var line = contentParts[i];								
				
					line = processArgTokens(args, line);
					line = processDefineTokens(line);
					line = processVarTokens(line);
					var lineType = getLineType(line);
					if(isInclude && lineType.type != "function" && lineType.type != "define"){
						continue;
					} 
					
					if(lineType.type == "define"){
						if(defineDefs[lineType.data[0]]){
							console.log(lineType.data[0]+" was redefined!");
						}
						defineDefs[lineType.data[0]] = lineType.data[1];															
					} else if(lineType.type == "function_call"){
						if(functionDefs[lineType.data[0]]){
							eventList = eventList.concat(processBlock(functionDefs[lineType.data[0]], indent, lineType.data[1]));
						} else {
							console.log("Attempted to call unknown function '"+lineType.data[0]+"'");
						}							
					}else if(lineType.type == "function"){
						var functionContent = [];
						var depth = 0;
						i++;
						var readingScriptBlock = false;
						while(i < contentParts.length && (getLineType(contentParts[i]).type != "function_end" || depth > 0 || readingScriptBlock)){
							let lineType = getLineType(contentParts[i]).type;
							
							if(lineType == "script_start_explicit"){									
								readingScriptBlock = true;
							}
							
							if(lineType == "script_end_explicit"){
								readingScriptBlock = false;
							}
							if(!readingScriptBlock){												
								if(lineType == "function_end"){
									depth--;	
								}
								if(lineType == "function"){
									depth++;	
								}
								if(lineType == "script_start"){
									depth++;	
								}
								
								if(lineType == "move_start"){
									depth++;	
								}
							}
							functionContent.push(contentParts[i]);
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}	
						if(functionDefs[lineType.data[0]]){
							console.log("Function "+lineType.data[0]+" is defined twice and was overwritten!");
						}
						functionDefs[lineType.data[0]] = functionContent;
						
					} else if(lineType.type == "move_start"){
						var moveCodes = {
							"end": 0,
							"move down": 1,
							"move left": 2,
							"move right": 3,
							"move up": 4,
							"move lower left": 5,
							"move lower right"      : 6,
							"move upper left"      : 7,
							"move upper right"      : 8,
							"move at random"      : 9,
							"move toward player"      : 10,
							"move away from player"         : 11,
							"move 1 step forward"      : 12,
							"move 1 step backward"     : 13,
							"jump"              : 14,
							"wait"              : 15,
							"turn down"         : 16,
							"turn left"         : 17,
							"turn right"      : 18,
							"turn up"           : 19,
							"turn 90 right"        : 20,
							"turn 90 left"        : 21,
							"turn 180"       : 22,
							"turn 90 right or left"      : 23,
							"turn at random"       : 24,
							"turn toward player"       : 25,
							"turn away from player"         : 26,
							//Game_Character.ROUTE_SWITCH_ON         : 27,
							//Game_Character.ROUTE_SWITCH_OFF        : 28,
							"change speed"     : 29,
							//Game_Character.ROUTE_CHANGE_FREQ       : 30,
							//Game_Character.ROUTE_WALK_ANIME_ON     : 31,
							//Game_Character.ROUTE_WALK_ANIME_OFF    : 32,
							//Game_Character.ROUTE_STEP_ANIME_ON     : 33,
							//Game_Character.ROUTE_STEP_ANIME_OFF    : 34,
							//Game_Character.ROUTE_DIR_FIX_ON        : 35,
							//Game_Character.ROUTE_DIR_FIX_OFF       : 36,
							//Game_Character.ROUTE_THROUGH_ON        : 37,
							//Game_Character.ROUTE_THROUGH_OFF       : 38,
							"transparent on": 39,
							"transparent off": 38,
							//Game_Character.ROUTE_CHANGE_IMAGE      : 41,
							"change opacity": 42,
							//Game_Character.ROUTE_CHANGE_OPACITY    : 42,
							//Game_Character.ROUTE_CHANGE_BLEND_MODE : 43,
							//Game_Character.ROUTE_PLAY_SE           : 44,
							"route script": 45,
							
						};
						var eventId = lineType.data[0];
						if(eventId == "cursor"){
							eventId = -1;
						} else if(!/actor\:.*/.exec(eventId)){
							eventId*=1;
						} 
						var wait = lineType.data[1];
						var moveList = [];
						i++;
						while(i < contentParts.length && getLineType(contentParts[i]).type != "function_end"){
							var parts = contentParts[i].split(",");
							var command = parts[0].trim().toLowerCase();
							var tmp = [];
							parts.shift();
							if(command == "route script"){
								tmp = [parts.join(",")];
							} else {																		
								parts.forEach(function(param){
									tmp.push(param * 1);
								});
							}
							
							if(moveCodes[command] != null){									
								moveList.push({
									code: moveCodes[command],
									indent: null,
									parameters: tmp
								})
							} else {
								console.log("Invalid move command: " + contentParts[i]);
							}
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}
						moveList.push({
							code: moveCodes["end"],
							indent: null
						});	
						eventList.push({
							code: 205,
							indent: indent,
							parameters: [eventId, {
								list: moveList,
								repeat: false,
								skippable: true,
								wait: wait
							}]
						});
					} else if(lineType.type == "txt_start"){
						var characterId = String(lineType.data[0]).trim();
						var expressionId = lineType.data[1];
						var skipFocus = (lineType.data[2] || 0) * 1;
						var noNameTranslation = (lineType.data[3] || 0) * 1;
						var name = "";
						var faceName = "";
						var faceIdx = 0;
						if(characterId != "TEXT"){
							var characterDef = $scriptCharactersLoader.getData()[characterId];
							if(characterDef){
								if(characterDef.nameVar != -1){
									name = "\\V["+characterDef.nameVar+"]"
								} else {
									name = characterId;
								}
								var expressionInfo;
								if(characterDef.expressions[expressionId]){
									expressionInfo = characterDef.expressions[expressionId];
								} else {
									expressionInfo = characterDef.expressions[0]
								}
								if(expressionInfo){
									faceName = expressionInfo.face;
									faceIdx = expressionInfo.index;
									
									if(expressionInfo.name){
										name = expressionInfo.name;
									} 
									
									var keyParts = expressionInfo.face.split("_");
									keyParts.pop();
									var faceKey = keyParts.join("_");
									if(!noNameTranslation && ENGINE_SETTINGS.variableUnitPortraits && !$gameSystem.disableVariablePortraits){
										var substitutionCandidates = ENGINE_SETTINGS.variableUnitPortraits[faceKey];
										let active;
										if(substitutionCandidates){
											substitutionCandidates.forEach(function(entry){
												if($statCalc.isMechDeployed(entry.deployedId)){
													active = entry;
												}
											});
										}
										if(active && !expressionInfo.name){
											name = $dataClasses[active.deployedId].name;
										}
									}
								}
							}
						}
						
						
						
						if(!skipFocus && characterDef && characterDef.actorId != null){
							eventList.push({
								code: 356,
								indent: indent,
								parameters: ["focusActor "+characterDef.actorId]
							});
						}
						
						if(!skipFocus && characterDef && characterDef.enemyId != null){
							eventList.push({
								code: 356,
								indent: indent,
								parameters: ["focusEnemy "+characterDef.enemyId]
							});
						}
						
						eventList.push({
							code: 101,
							indent: indent,
							parameters: [faceName, faceIdx, currentTxtLayout.bg, currentTxtLayout.pos]
						});
						i++;
						if(characterId != "TEXT"){
							eventList.push({
								code: 401,
								indent: indent,
								parameters: ["\\>"+name]
							});
						}
						while(i < contentParts.length && getLineType(contentParts[i]).type == "txt"){
							eventList.push({
								code: 401,
								indent: indent,
								parameters: [processDefineTokens(processArgTokens(args, contentParts[i].trim()))]
							});
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}							
					}else if(lineType.type == "conditional_start"){
						//var choiceContent = [];
						var stackCount = 0;
						var branches = [];
						var branchContent = {
							0: [],
							1: []
						};
						i++;
						var branchIdx = 0;
						while(i < contentParts.length && (getLineType(contentParts[i]).type != "conditional_end" || stackCount != 0)){
							if(getLineType(contentParts[i]).type == "conditional_start"){
								stackCount++;
							}
							if(getLineType(contentParts[i]).type == "conditional_end"){
								stackCount--;
							}
							if(stackCount == 0){
								let lineInfo = getLineType(contentParts[i]);
								if(lineInfo.type == "else"){
									branchIdx = 1;
								}									
							}
							
							if(branchContent[branchIdx]){
								branchContent[branchIdx].push(contentParts[i]);
							}
							//choiceContent.push(contentParts[i]);
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}
						
						
						eventList.push({
							code: 111,
							indent: indent,
							parameters: lineType.data
						});
						
						eventList = eventList.concat(processBlock(branchContent[0], indent+1, args));
						eventList.push({
							code: 0,
							indent: indent + 1,
							parameters: []
						});
						if(branchContent[1].length){
							eventList.push({
								code: 411,
								indent: indent,
								parameters: []
							});
							eventList = eventList.concat(processBlock(branchContent[1], indent+1, args));
							eventList.push({
								code: 0,
								indent: indent + 1,
								parameters: []
							});
						} 		
						eventList.push({
							code: 412,
							indent: indent,
							parameters: []
						});	
						//processBlock(choiceContent, indent+1);
					} else if(lineType.type == "choice_start"){
						//var choiceContent = [];
						var stackCount = 0;
						var choiceValues = [];
						var choiceContent = {
							
						};
						i++;
						var currentOptionIdx = -1;
						while(i < contentParts.length && (getLineType(contentParts[i]).type != "choice_end" || stackCount != 0)){
							if(getLineType(contentParts[i]).type == "choice_start"){
								stackCount++;
							}
							if(getLineType(contentParts[i]).type == "choice_end"){
								stackCount--;
							}
							if(stackCount == 0){
								let lineInfo = getLineType(contentParts[i]);
								if(lineInfo.type == "choice_entry"){
									choiceValues[lineInfo.data[0]] = lineInfo.data[1];
									choiceContent[lineInfo.data[0]] = [];
									currentOptionIdx = lineInfo.data[0];
								}									
							}
							
							if(currentOptionIdx != -1 && choiceContent[currentOptionIdx]){
								choiceContent[currentOptionIdx].push(contentParts[i]);
							}
							//choiceContent.push(contentParts[i]);
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}
						eventList.push({
							code: 102,
							indent: indent,
							parameters: [choiceValues, 1, 0, 1, 1]
						});
						for(var j = 0; j < choiceValues.length; j++){
							if(choiceValues[j]){
								eventList.push({
									code: 402,
									indent: indent,
									parameters: [j, choiceValues[j]]
								});
								eventList = eventList.concat(processBlock(choiceContent[j], indent+1, args));
								eventList.push({
									code: 0,
									indent: indent,
									parameters: []
								});
							}
						}
						
						//processBlock(choiceContent, indent+1);
					} else if(lineType.type == "comment_start"){
						while(i < contentParts.length && getLineType(contentParts[i]).type != "comment_end"){
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}	
					}  else if(lineType.type == "script_start"){
						var scriptContent = [];
						i++;
						while(i < contentParts.length && getLineType(contentParts[i]).type != "function_end"){
							scriptContent.push(contentParts[i]);
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}	
						var scriptStart = scriptContent.shift();
						eventList.push({
							code: 355,
							indent: indent,
							parameters: [scriptStart]
						});
						scriptContent.forEach(function(scriptLine){
							eventList.push({
								code: 655,
								indent: indent,
								parameters: [scriptLine]
							});
						});
					}  else if(lineType.type == "script_start_explicit"){
						var scriptContent = [];
						i++;
						while(i < contentParts.length && getLineType(contentParts[i]).type != "script_end_explicit"){
							scriptContent.push(contentParts[i]);
							i++;
						}
						if(i < contentParts.length){
							i--;//Correct for potential overread
						}	
						var scriptStart = scriptContent.shift();
						eventList.push({
							code: 355,
							indent: indent,
							parameters: [scriptStart]
						});
						scriptContent.forEach(function(scriptLine){
							eventList.push({
								code: 655,
								indent: indent,
								parameters: [scriptLine]
							});
						});
					} else if(lineType.type == "command"){
						if(pluginCommandNames[lineType.data[0]]){
							handleUpgradedPluginCommand(lineType.data[0], eventList, indent, lineType.data[1]);
						} else {
							scriptCommands[lineType.data[0]](eventList, indent, lineType.data[1]);
						}							
					}
				}
				return eventList;
			}
			
			let resolveLoad;
			
			DataManager.loadTextScript(scriptId).then(function(content){					
				
				var contentParts = content.split("\n");
				//includes are only processed for the main script file
				var includes = [];
				contentParts.forEach(function(line){
					var lineType = getLineType(line);
					if(lineType.type == "include"){
						includes.push(lineType.data[0]);
					}
				});
				var includePromises = [];
				includes.forEach(function(include){
					includePromises.push(new Promise(function(resolve, reject){
						DataManager.loadTextScript(include).then(function(content){
							processBlock(content.split("\n"), 0, [], true);		
							resolve();
						});
					}));
				});
				Promise.all(includePromises).then(function(){
					var eventList = processBlock(contentParts, 0)					
					resolveLoad(eventList);				
				});					
			});
			
			return new Promise(function(resolve, reject){
				resolveLoad = resolve;
			});
			
			
			
			
		};	


			//-----------------------------------------------------------------------------
			// ConfigManager
			//
			// The static class that manages the configuration data

			ConfigManager.alwaysDash        = false;
			ConfigManager.commandRemember   = false;
			
			ConfigManager.padSet = "xbox";
			ConfigManager.disableGrid = false;
			ConfigManager.mapHints = true;
			ConfigManager.willIndicator = true;
			
			ConfigManager.defaultSupport = true;
			ConfigManager.skipUnitMove = false;
			
			ConfigManager.battleSpeed = 1;
			
			ConfigManager.battleBGM = true;
			ConfigManager.afterBattleBGM = true;

			Object.defineProperty(ConfigManager, 'bgmVolume', {
				get: function() {
					return AudioManager._bgmVolume;
				},
				set: function(value) {
					AudioManager.bgmVolume = value;
				},
				configurable: true
			});

			Object.defineProperty(ConfigManager, 'bgsVolume', {
				get: function() {
					return AudioManager.bgsVolume;
				},
				set: function(value) {
					AudioManager.bgsVolume = value;
				},
				configurable: true
			});

			Object.defineProperty(ConfigManager, 'meVolume', {
				get: function() {
					return AudioManager.meVolume;
				},
				set: function(value) {
					AudioManager.meVolume = value;
				},
				configurable: true
			});

			Object.defineProperty(ConfigManager, 'seVolume', {
				get: function() {
					return AudioManager.seVolume;
				},
				set: function(value) {
					AudioManager.seVolume = value;
				},
				configurable: true
			});

			ConfigManager.load = function() {
				var json;
				var config = {};
				try {
					json = StorageManager.load(-1);
				} catch (e) {
					console.error(e);
				}
				if (json) {
					config = JSON.parse(json);
				}
				this.applyData(config);
			};

			ConfigManager.save = function() {
				StorageManager.save(-1, JSON.stringify(this.makeData()));
			};

			ConfigManager.makeData = function() {
				var config = {};
				config.alwaysDash = this.alwaysDash;
				config.commandRemember = this.commandRemember;
				config.bgmVolume = this.bgmVolume;
				config.bgsVolume = this.bgsVolume;
				config.meVolume = this.meVolume;
				config.seVolume = this.seVolume;
				
				config.padSet = this.padSet;
				config.disableGrid = this.disableGrid;
				config.mapHints = this.mapHints;
				config.willIndicator = this.willIndicator;
				config.defaultSupport = this.defaultSupport;		
				config.skipUnitMove = this.skipUnitMove;	

				config.battleSpeed = this.battleSpeed;
				
				config.battleBGM = this.battleBGM;
				config.afterBattleBGM = this.afterBattleBGM;
				
				return config;
			};

			ConfigManager.applyData = function(config) {
				this.alwaysDash = this.readFlag(config, 'alwaysDash');
				this.commandRemember = this.readFlag(config, 'commandRemember');
				this.bgmVolume = this.readVolume(config, 'bgmVolume');
				this.bgsVolume = this.readVolume(config, 'bgsVolume');
				this.meVolume = this.readVolume(config, 'meVolume');
				this.seVolume = this.readVolume(config, 'seVolume');
				
				this.padSet = config.padSet || "xbox";
				
				if(config['disableGrid'] != null){
					this.disableGrid = this.readFlag(config, 'disableGrid');
				}
				if(config['mapHints'] != null){
					this.mapHints = this.readFlag(config, 'mapHints');
				}
				if(config['willIndicator'] != null){
					this.willIndicator = this.readFlag(config, 'willIndicator');
				}
				if(config['defaultSupport'] != null){
					this.defaultSupport = this.readFlag(config, 'defaultSupport');
				}
				if(config['skipUnitMove'] != null){
					this.skipUnitMove = this.readFlag(config, 'skipUnitMove');
				}
				
				this.battleSpeed = config.battleSpeed || 1;
				
				if(config['battleBGM'] != null){
					this.battleBGM = this.readFlag(config, 'battleBGM');
				}
				
				if(config['afterBattleBGM'] != null){
					this.afterBattleBGM = this.readFlag(config, 'afterBattleBGM');
				}
			};

			ConfigManager.readFlag = function(config, name) {
				return !!config[name];
			};

			ConfigManager.readVolume = function(config, name) {
				var value = config[name];
				if (value !== undefined) {
					return Number(value).clamp(0, 100);
				} else {
					return 100;
				}
			};		
	}
	
	
	
	function ScriptCharactersLoader(){	
		var _this = this;
		_this._sourceFile = "ScriptCharacters";
		JSONLoader.call(this);		
	}
	ScriptCharactersLoader.prototype = Object.create(JSONLoader.prototype);
	ScriptCharactersLoader.prototype.constructor = ScriptCharactersLoader;
	
	function DeployActionsLoader(){	
		var _this = this;
		_this._sourceFile = "DeployActions";
		JSONLoader.call(this);		
	}
	DeployActionsLoader.prototype = Object.create(JSONLoader.prototype);
	DeployActionsLoader.prototype.constructor = DeployActionsLoader;

	
	
	