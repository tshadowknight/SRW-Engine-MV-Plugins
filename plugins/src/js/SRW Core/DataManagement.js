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
				await DataManager.loadLocalization();
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
		
		//====================================================================
		// File Storage Backend (cordova-plugin-file, mobile only)
		//====================================================================

		if (Utils.isMobileDevice()) {
			StorageManager._fileCache   = {};
			StorageManager._fileReady   = false;
			StorageManager._deviceReady = false;

			// Capture deviceready as early as possible; initMobileStorage will
			// wait on this promise regardless of when it is called.
			StorageManager._deviceReadyPromise = new Promise(function(resolve) {
				document.addEventListener('deviceready', function() {
					StorageManager._deviceReady = true;
					resolve();
				}, {once: true});
			});

			// Resolves the save directory entry, creating it if needed.
			StorageManager._getSaveDir = function() {
				return new Promise(function(resolve, reject) {
					window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dirEntry) {
						dirEntry.getDirectory('save', {create: true}, resolve, reject);
					}, reject);
				});
			};

			// Maps a savefileId to a filename identical to the desktop build.
			StorageManager.mobileFileName = function(savefileId) {
				if (savefileId == "continue") return "continue";
				if (savefileId < 0)  return 'config.rpgsave';
				if (savefileId === 0) return 'global.rpgsave';
				return 'file%1.rpgsave'.format(savefileId);
			};

			StorageManager.mobileBackupFileName = function(savefileId) {
				return StorageManager.mobileFileName(savefileId) + '.bak';
			};

			// Read a file from the save directory; resolves with text or null.
			StorageManager._readFile = function(saveDir, filename) {
				return new Promise(function(resolve) {
					saveDir.getFile(filename, {create: false}, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.onloadend = function() { resolve(reader.result); };
							reader.onerror   = function() { resolve(null); };
							reader.readAsText(file);
						}, function() { resolve(null); });
					}, function() { resolve(null); });
				});
			};

			// Write text to a file in the save directory asynchronously.
			StorageManager._writeFile = function(saveDir, filename, data) {
				saveDir.getFile(filename, {create: true}, function(fileEntry) {
					fileEntry.createWriter(function(writer) {
						writer.onwriteend = function() {
							// Truncate any leftover bytes from a previous shorter write.
							if (writer.length !== writer.position) {
								writer.truncate(writer.position);
							}
						};
						writer.write(new Blob([data], {type: 'text/plain'}));
					});
				});
			};

			// Delete a file from the save directory asynchronously.
			StorageManager._deleteFile = function(saveDir, filename) {
				saveDir.getFile(filename, {create: false}, function(fileEntry) {
					fileEntry.remove(function() {}, function() {});
				}, function() {});
			};

			// Opens the save directory, pre-loads all known save files into the
			// in-memory cache, then runs the one-time localStorage migration.
			StorageManager.initMobileStorage = function() {
				return new Promise(function(resolve) {
					StorageManager._deviceReadyPromise.then(function() {
						if (!window.cordova || !cordova.file) {
							// Plugin not present – fall back to localStorage silently.
							resolve();
							return;
						}
						StorageManager._getSaveDir().then(function(saveDir) {
							StorageManager._mSaveDir = saveDir;

							// Pre-load every possible save file into cache.
							var maxSaves = DataManager.maxSavefiles ? DataManager.maxSavefiles() : 20;
							var ids = [-1, 0, "continue"];
							for (var i = 1; i <= maxSaves; i++) ids.push(i);

							var reads = ids.map(function(id) {
								var name = StorageManager.mobileFileName(id);
								var bak  = StorageManager.mobileBackupFileName(id);
								return Promise.all([
									StorageManager._readFile(saveDir, name).then(function(data) {
										if (data) StorageManager._fileCache[name] = data;
									}),
									StorageManager._readFile(saveDir, bak).then(function(data) {
										if (data) StorageManager._fileCache[bak] = data;
									})
								]);
							});

							Promise.all(reads).then(function() {
								return StorageManager._migrateFromLocalStorage(saveDir);
							}).then(function() {
								StorageManager._fileReady = true;
								resolve();
							});
						}, function(err) {
							console.error('SRW: cordova-plugin-file init failed, falling back to localStorage.', err);
							resolve();
						});
					});
				});
			};

			// One-time, non-destructive migration of RPG save keys from localStorage.
			// Sentinel file 'migrated' in the save dir prevents re-running.
			// Existing files are never overwritten (file wins over localStorage).
			StorageManager._migrateFromLocalStorage = function(saveDir) {
				return new Promise(function(resolve) {
					StorageManager._readFile(saveDir, 'migrated').then(function(sentinel) {
						if (sentinel !== null) { resolve(); return; }

						var migrations = [];
						for (var i = 0; i < localStorage.length; i++) {
							var key = localStorage.key(i);
							if (!key || key.indexOf('RPG ') !== 0) continue;
							// Derive the savefileId from the localStorage key.
							(function(lsKey) {
								var data = localStorage.getItem(lsKey);
								if (!data) return;
								// Match key to filename; skip if already on disk.
								var id = StorageManager._savefileIdFromWebKey(lsKey);
								if (id === null) return;
								var filename = StorageManager.mobileFileName(id);
								if (StorageManager._fileCache[filename]) return; // disk wins
								StorageManager._fileCache[filename] = data;
								migrations.push(new Promise(function(res) {
									saveDir.getFile(filename, {create: true}, function(fileEntry) {
										fileEntry.createWriter(function(writer) {
											writer.onwriteend = res;
											writer.onerror    = res;
											writer.write(new Blob([data], {type: 'text/plain'}));
										}, res);
									}, res);
								}));
							})(key);
						}

						Promise.all(migrations).then(function() {
							StorageManager._writeFile(saveDir, 'migrated', '1');
							if (migrations.length) {
								console.log('SRW: Migrated ' + migrations.length + ' save(s) from localStorage to file storage.');
							}
							resolve();
						});
					});
				});
			};

			// Reverse-maps a webStorageKey string back to its savefileId.
			StorageManager._savefileIdFromWebKey = function(key) {
				if (key === 'RPG Config') return -1;
				if (key === 'RPG Global') return 0;
				var m = key.match(/^RPG File(\d+)$/);
				return m ? parseInt(m[1]) : null;
			};

			// File-backed equivalents of the web-storage methods.
			StorageManager.saveToMobileFile = function(savefileId, json) {
				var filename = this.mobileFileName(savefileId);
				var data     = LZString.compressToBase64(json);
				this._fileCache[filename] = data;
				this._writeFile(this._mSaveDir, filename, data);
			};

			StorageManager.loadFromMobileFile = function(savefileId) {
				var data = this._fileCache[this.mobileFileName(savefileId)] || null;
				return LZString.decompressFromBase64(data);
			};

			StorageManager.mobileFileExists = function(savefileId) {
				return !!this._fileCache[this.mobileFileName(savefileId)];
			};

			StorageManager.removeMobileFile = function(savefileId) {
				var filename = this.mobileFileName(savefileId);
				delete this._fileCache[filename];
				this._deleteFile(this._mSaveDir, filename);
			};

			StorageManager.backupMobileFile = function(savefileId) {
				if (this.mobileFileExists(savefileId)) {
					var filename = this.mobileFileName(savefileId);
					var bakName  = this.mobileBackupFileName(savefileId);
					var data     = this._fileCache[filename];
					this._fileCache[bakName] = data;
					this._writeFile(this._mSaveDir, bakName, data);
				}
			};

			StorageManager.mobileBackupExists = function(savefileId) {
				return !!this._fileCache[this.mobileBackupFileName(savefileId)];
			};

			StorageManager.cleanMobileBackup = function(savefileId) {
				var bakName = this.mobileBackupFileName(savefileId);
				delete this._fileCache[bakName];
				this._deleteFile(this._mSaveDir, bakName);
			};

			StorageManager.restoreFromMobileBackup = function(savefileId) {
				if (this.mobileBackupExists(savefileId)) {
					var filename = this.mobileFileName(savefileId);
					var bakName  = this.mobileBackupFileName(savefileId);
					var data     = this._fileCache[bakName];
					this._fileCache[filename] = data;
					delete this._fileCache[bakName];
					this._writeFile(this._mSaveDir, filename, data);
					this._deleteFile(this._mSaveDir, bakName);
				}
			};

			// Override the main StorageManager API to route through file storage when
			// ready, falling back to the original implementation otherwise.
			(function() {
				var _save          = StorageManager.save;
				var _load          = StorageManager.load;
				var _exists        = StorageManager.exists;
				var _remove        = StorageManager.remove;
				var _backup        = StorageManager.backup;
				var _backupExists  = StorageManager.backupExists;
				var _cleanBackup   = StorageManager.cleanBackup;
				var _restoreBackup = StorageManager.restoreBackup;

				StorageManager.save = function(savefileId, json) {
					if (this._fileReady) { this.saveToMobileFile(savefileId, json); }
					else                 { _save.call(this, savefileId, json); }
				};
				StorageManager.load = function(savefileId) {
					return this._fileReady ? this.loadFromMobileFile(savefileId) : _load.call(this, savefileId);
				};
				StorageManager.exists = function(savefileId) {
					return this._fileReady ? this.mobileFileExists(savefileId) : _exists.call(this, savefileId);
				};
				StorageManager.remove = function(savefileId) {
					if (this._fileReady) { this.removeMobileFile(savefileId); }
					else                 { _remove.call(this, savefileId); }
				};
				StorageManager.backup = function(savefileId) {
					if (this._fileReady) { this.backupMobileFile(savefileId); }
					else                 { _backup.call(this, savefileId); }
				};
				StorageManager.backupExists = function(savefileId) {
					return this._fileReady ? this.mobileBackupExists(savefileId) : _backupExists.call(this, savefileId);
				};
				StorageManager.cleanBackup = function(savefileId) {
					if (this._fileReady) { this.cleanMobileBackup(savefileId); }
					else                 { _cleanBackup.call(this, savefileId); }
				};
				StorageManager.restoreBackup = function(savefileId) {
					if (this._fileReady) { this.restoreFromMobileBackup(savefileId); }
					else                 { _restoreBackup.call(this, savefileId); }
				};
			})();
		}

		//====================================================================
		// Boot / kit checks
		//====================================================================

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
			if (Utils.isMobileDevice() && StorageManager.initMobileStorage) {
				await StorageManager.initMobileStorage();
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
		
	DataManager.tagTextScriptsForLocalization = function() {
		if (!Utils.isNwjs() || process.versions["nw-flavor"] !== "sdk") {
			console.warn("tagTextScriptsForLocalization is only available in the SDK environment.");
			return;
		}

		const fs = require('fs');
		const path = require('path');

		function findMvsFiles(dir) {
			var files = [];
			var entries = fs.readdirSync(dir, { withFileTypes: true });
			for (var i = 0; i < entries.length; i++) {
				var entry = entries[i];
				var fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					files = files.concat(findMvsFiles(fullPath));
				} else if (entry.name.endsWith('.mvs')) {
					files.push(fullPath);
				}
			}
			return files;
		}

		var scriptDir = 'text_scripts';
		if (!fs.existsSync(scriptDir)) {
			alert('text_scripts directory not found.');
			return;
		}

		var files = findMvsFiles(scriptDir);

		// First pass: find the highest existing localization ID so new ones continue from there
		var maxId = 0;
		files.forEach(function(file) {
			var content = fs.readFileSync(file, 'utf8');
			var lines = content.split('\n');
			lines.forEach(function(line) {
				var match = / #([0-9]+)$/.exec(line.trimEnd());
				if (match) {
					var id = parseInt(match[1], 10);
					if (id > maxId) maxId = id;
				}
			});
		});
		var idCounter = maxId + 1;

		var totalTagged = 0;
		var filesModified = 0;
		var locIdRe = / #[0-9]+$/;

		files.forEach(function(file) {
			var content = fs.readFileSync(file, 'utf8');
			var lines = content.split('\n');
			var modified = false;

			// State tracking
			var inBlockComment = false;
			var inExplicitScript = false;
			// Stack entries: "function" | "inline_script" | "move"
			// Lines inside "inline_script" or "move" are JavaScript/move-commands -- skip.
			// Lines inside "function" are still MVS -- tag normally.
			var blockStack = [];
			// After a speaker line (*Name), following text lines are covered by the speaker's tag.
			var afterSpeaker = false;

			var newLines = lines.map(function(line) {
				var trimmed = line.trim();

				// Block comment /* ... */
				if (trimmed === '/*') { inBlockComment = true; return line; }
				if (trimmed === '*/') { inBlockComment = false; return line; }
				if (inBlockComment) return line;

				// Explicit script block [script] ... [/script]
				if (trimmed === '[script]') { inExplicitScript = true; return line; }
				if (trimmed === '[/script]') { inExplicitScript = false; return line; }
				if (inExplicitScript) return line;

				// "}" closes the innermost tracked block
				if (trimmed === '}') {
					if (blockStack.length > 0) blockStack.pop();
					return line;
				}

				// Standalone "{" -- inline JavaScript script block
				if (trimmed === '{') {
					blockStack.push('inline_script');
					return line;
				}

				// Move block: move <eventId> [wait] {
				if (/^move\s/.test(trimmed) && trimmed.endsWith('{')) {
					blockStack.push('move');
					return line;
				}

				// Function definition: function <name> {
				if (/^function\s.+\{/.test(trimmed)) {
					blockStack.push('function');
					return line;
				}

				// Skip content inside inline script or move blocks
				var currentBlock = blockStack.length > 0 ? blockStack[blockStack.length - 1] : null;
				if (currentBlock === 'inline_script' || currentBlock === 'move') {
					return line;
				}

				// Empty lines and line comments
				if (!trimmed || trimmed.startsWith('//')) return line;

				// Speaker / character lines (*Name ...) -- tag the speaker line; following text is covered by this tag
				if (trimmed.startsWith('*')) {
					afterSpeaker = true;
					if (locIdRe.test(line.trimEnd())) return line;
					var id = '#' + idCounter.toString(10).padStart(8, '0');
					idCounter++;
					modified = true;
					totalTagged++;
					return line.trimEnd() + ' ' + id;
				}

				// Preprocessor directives (#include, #define)
				if (trimmed.startsWith('#')) { afterSpeaker = false; return line; }

				// Function calls  call name(...)
				if (/^call\s/.test(trimmed)) { afterSpeaker = false; return line; }

				// Choice entries [N]text  -- localizable (always tagged regardless of speaker context)
				var isChoiceEntry = /^\[\d\]/.test(trimmed);

				// Other command lines [command: ...]  -- not localizable
				if (trimmed.startsWith('[') && !isChoiceEntry) { afterSpeaker = false; return line; }

				// Already tagged?
				if (locIdRe.test(line.trimEnd())) return line;

				// Text lines following a speaker line are covered by the speaker's tag -- skip
				if (afterSpeaker && !isChoiceEntry) return line;

				// Append localization ID
				var id = '#' + idCounter.toString(10).padStart(8, '0');
				idCounter++;
				modified = true;
				totalTagged++;
				return line.trimEnd() + ' ' + id;
			});

			if (modified) {
				fs.writeFileSync(file, newLines.join('\n'), 'utf8');
				filesModified++;
			}
		});

		console.log('Localization tagging complete. Tagged ' + totalTagged + ' lines across ' + filesModified + ' files.');
		alert('Localization tagging complete!\nTagged ' + totalTagged + ' text lines across ' + filesModified + ' files.');
	};

	DataManager.tagBattleTextForLocalization = function() {
		if (!Utils.isNwjs() || process.versions["nw-flavor"] !== "sdk") {
			console.warn("tagBattleTextForLocalization is only available in the SDK environment.");
			return;
		}

		const fs = require('fs');
		var filePath = 'data/BattleText.json';
		if (!fs.existsSync(filePath)) {
			alert('data/BattleText.json not found.');
			return;
		}

		var data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		var allQuotes = [];

		function collectFromQuoteArrays(subtypeData) {
			Object.keys(subtypeData).forEach(function(key) {
				var arr = subtypeData[key];
				if (Array.isArray(arr)) {
					arr.forEach(function(q) {
						if (q && typeof q === 'object') {
							if(!Array.isArray(q)){
								allQuotes.push(q);	
							} else {
								for(let option of q){
									allQuotes.push(option);		
								}
							}							
						}
					});
				}
			});
		}

		function collectFromUnit(unitData) {
			Object.keys(unitData).forEach(function(hookName) {
				var hook = unitData[hookName];
				if (hookName === 'attacks') {
					Object.keys(hook).forEach(function(attackId) {
						collectFromQuoteArrays(hook[attackId]);
					});
				} else if (hook && typeof hook === 'object') {
					collectFromQuoteArrays(hook);
				}
			});
		}

		function collectFromUnitGroup(group) {
			Object.keys(group).forEach(function(unitId) {
				collectFromUnit(group[unitId]);
			});
		}

		function collectFromSection(sectionData) {
			if (sectionData.actor) collectFromUnitGroup(sectionData.actor);
			if (sectionData.enemy) collectFromUnitGroup(sectionData.enemy);
		}

		if (data.default) collectFromSection(data.default);
		if (data.stage) collectFromSection(data.stage);
		if (Array.isArray(data.event)) {
			data.event.forEach(function(ev) {
				if (ev && ev.data) collectFromSection(ev.data);
			});
		}

		var maxId = 0;
		allQuotes.forEach(function(q) {
			if (q.locId) {
				var match = /^#([0-9]+)$/.exec(q.locId);
				if (match) {
					var id = parseInt(match[1], 10);
					if (id > maxId) maxId = id;
				}
			}
		});
		var idCounter = maxId + 1;

		var tagged = 0;
		allQuotes.forEach(function(q) {
			if (!q.locId) {
				q.locId = '#' + String(idCounter).padStart(8, '0');
				idCounter++;
				tagged++;
			}
		});

		fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
		console.log('Battle text localization tagging complete. Tagged ' + tagged + ' quotes.');
		alert('Battle text localization tagging complete!\nTagged ' + tagged + ' quotes.');
	};

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

		DataManager.loadLocalization = async function() {
			DataManager._localizationData = {};
			DataManager._battleLocalizationData = {};
			DataManager._nameLocalizationInfo = { byId: {}, byName: {} };
			DataManager._abilityLocalizationData = {};
			var locSettings = ENGINE_SETTINGS.LOCALIZATION;

			// Deep clone preserving functions and non-JSON values
			function cloneAppstrings(obj) {
				return structuredClone(obj);
			}
			// Snapshot base APPSTRINGS on first call so locale switches always start clean
			if (!DataManager._baseAppstrings) {
				DataManager._baseAppstrings = cloneAppstrings(window.APPSTRINGS || {});
			} else {
				window.APPSTRINGS = cloneAppstrings(DataManager._baseAppstrings);
			}

			if (!locSettings || !locSettings.LOCALES || !locSettings.LOCALES.length) return;

			var localeName = ConfigManager.locale;
			if (!localeName || localeName === locSettings.DEFAULT_LOCALE) return;

			// Load text substitution JSON
			await new Promise(function(resolve) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'data/localization/' + localeName + '.json');
				xhr.onload = function() {
					if (xhr.status < 400) {
						try {
							DataManager._localizationData = JSON.parse(xhr.responseText);
						} catch(e) {
							console.error('Failed to parse localization file: ' + localeName, e);
						}
					} else {
						console.warn('Localization file not found: data/localization/' + localeName + '.json');
					}
					resolve();
				};
				xhr.onerror = function() {
					console.warn('Failed to load localization file: data/localization/' + localeName + '.json');
					resolve();
				};
				xhr.send();
			});

			// Load battle text substitution JSON
			await new Promise(function(resolve) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'data/localization/' + localeName + '_battle.json');
				xhr.onload = function() {
					if (xhr.status < 400) {
						try {
							DataManager._battleLocalizationData = JSON.parse(xhr.responseText);
						} catch(e) {
							console.error('Failed to parse battle localization file: ' + localeName, e);
						}
					}
					resolve();
				};
				xhr.onerror = function() { resolve(); };
				xhr.send();
			});

			// Load resource name substitution JSON
			await new Promise(function(resolve) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'data/localization/' + localeName + '_names.json');
				xhr.onload = function() {
					if (xhr.status < 400) {
						try {
							const raw = JSON.parse(xhr.responseText);
							DataManager._nameLocalizationInfo.byId = raw;
							var typeArrays = {
								actor:  typeof $dataActors  !== 'undefined' ? $dataActors  : null,
								enemy:  typeof $dataEnemies !== 'undefined' ? $dataEnemies : null,
								mech:   typeof $dataClasses !== 'undefined' ? $dataClasses : null,
								weapon: typeof $dataWeapons !== 'undefined' ? $dataWeapons : null,
							};
							const byName = DataManager._nameLocalizationInfo.byName;
							Object.keys(raw).forEach(function(key) {
								const m = /^(actor|enemy|mech|weapon)_(\d+)$/.exec(key);
								if (m) {
									const type = m[1];
									const arr = typeArrays[type];
									const id = parseInt(m[2]);
									if (arr && arr[id] && arr[id].name) {
										if (!byName[type]) byName[type] = {};
										byName[type][arr[id].name] = raw[key];
									}
								}

								const ms = /^stageInfo_(\d+)$/.exec(key);
								if (ms) {
									const stageConfig = (typeof $SRWConfig !== 'undefined') ? $SRWConfig.stageInfo : null;
									const stageEntry = stageConfig && stageConfig[ms[1]];
									if (stageEntry && stageEntry.name) {
										if (!byName.stageInfo) byName.stageInfo = {};
										byName.stageInfo[stageEntry.name] = raw[key];
									}
								}
							});
						} catch(e) {
							console.error('Failed to parse names localization file: ' + localeName, e);
						}
					}
					resolve();
				};
				xhr.onerror = function() { resolve(); };
				xhr.send();
			});

			// Load abilities localization JSON
		await new Promise(function(resolve) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'data/localization/' + localeName + '_abilities.json');
			xhr.onload = function() {
				if (xhr.status < 400) {
					try {
						DataManager._abilityLocalizationData = JSON.parse(xhr.responseText);
						if (typeof $SRWConfig !== 'undefined' && $SRWConfig.abilityZonesLocalizationSet) {
							$SRWConfig._abilityZonesLocalizationSetOverride = {};
							Object.keys($SRWConfig.abilityZonesLocalizationSet).forEach(function(key) {
								const section = DataManager._abilityLocalizationData['abilityZoneStr'];
							const entry = section && section[key];
								if (entry && entry.desc && String(entry.desc).trim()) {
									$SRWConfig._abilityZonesLocalizationSetOverride[key] = entry.desc;
								}
							});
						}
					} catch(e) {
						console.error('Failed to parse abilities localization file: ' + localeName, e);
					}
				}
				resolve();
			};
			xhr.onerror = function() { resolve(); };
			xhr.send();
		});

		// Load locale-specific Appstrings override
			await new Promise(function(resolve) {
				var el = document.createElement('script');
				el.onload = function() {
					if (window.APPSTRINGS) {
						function deepMerge(base, override) {
							Object.keys(override).forEach(function(key) {
								if (typeof override[key] === 'object' && override[key] !== null &&
									typeof base[key] === 'object' && base[key] !== null) {
									deepMerge(base[key], override[key]);
								} else {
									base[key] = override[key];
								}
							});
						}
						var base = cloneAppstrings(DataManager._baseAppstrings);
						deepMerge(base, window.APPSTRINGS);
						window.APPSTRINGS = base;
					}
					resolve();
				};
				el.onerror = function() { resolve(); };
				el.src = 'data/localization/Appstrings_' + localeName + '.conf.js';
				document.body.appendChild(el);
			});
		};

		DataManager.getLocalizedName = function(type, id, originalName) {
			const info = DataManager._nameLocalizationInfo;
			if (info) {
				if (id != null && info.byId) {
					const byId = info.byId[type + '_' + id];
					if (byId) return byId;
				}
				if (type && originalName && info.byName && info.byName[type]) {
					const byName = info.byName[type][originalName];
					if (byName) return byName;
				}
			}
			return originalName;
		};

		var _Game_Enemy_name = Game_Enemy.prototype.name;
		Game_Enemy.prototype.name = function() {
			var original = _Game_Enemy_name.call(this);
			return DataManager.getLocalizedName('enemy', this.enemyId(), original);
		};

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
					$gameTemp.loadingIntoSaveCtr = 60;
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
				if($gameSystem.isIntermission()){
					$gameSystem.startIntermission();
				} else {
					$gameTemp.loadingIntoSaveCtr = 60;
					$statCalc.invalidateAbilityCache();
					$statCalc.invalidateZoneCache();
					$statCalc.softRefreshUnits();
					
					$SRWGameState.requestNewState("normal");
				}
				
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
				unbindMechPilots: true,
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
				setActorNameOverride: true,
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
				setEventEN: true,
				setEventENPercent: true,
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
						var locId = null;
						var lastEl = lineType.data[lineType.data.length - 1];
						if(lastEl && /^#[0-9]+$/.test(lastEl)){
							locId = lastEl.slice(1);
							lineType.data = lineType.data.slice(0, -1);
						}
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
											name = DataManager.getLocalizedName('mech', active.deployedId, $dataClasses[active.deployedId].name);
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
						var localizedLines = locId && DataManager._localizationData && DataManager._localizationData[locId];
						if(localizedLines){
							if(typeof localizedLines === 'string') localizedLines = [localizedLines];
							localizedLines.forEach(function(localizedLine){
								eventList.push({
									code: 401,
									indent: indent,
									parameters: [localizedLine]
								});
							});
							while(i < contentParts.length && getLineType(contentParts[i]).type == "txt") i++;
						} else {
							while(i < contentParts.length && getLineType(contentParts[i]).type == "txt"){
								eventList.push({
									code: 401,
									indent: indent,
									parameters: [processDefineTokens(processArgTokens(args, contentParts[i].trim()))]
								});
								i++;
							}
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
			ConfigManager.willIndicator = 0;
			
			ConfigManager.defaultSupport = true;
			ConfigManager.skipUnitMove = false;
			
			ConfigManager.battleSpeed = 1;
			
			ConfigManager.battleBGM = true;
			ConfigManager.afterBattleBGM = true;

			ConfigManager.locale = "";

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

				config.locale = this.locale;
				
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
					this.willIndicator = config.willIndicator || 0;
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

				var _defaultLocale = (ENGINE_SETTINGS.LOCALIZATION && ENGINE_SETTINGS.LOCALIZATION.DEFAULT_LOCALE) ? ENGINE_SETTINGS.LOCALIZATION.DEFAULT_LOCALE : "";
				this.locale = (config['locale'] != null) ? config.locale : _defaultLocale;
			};

			ConfigManager.readFlag = function(config, name) {
				return !!config[name];
			};

			ConfigManager.readVolume = function(config, name) {
				var value = config[name];
				if (value !== undefined) {
					return Number(value).clamp(0, 100);
				} else {
					return 60;
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

	
	
	