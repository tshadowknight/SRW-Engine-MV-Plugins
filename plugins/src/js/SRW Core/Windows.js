	export default {
		patches: patches,
		Window_CounterCommand: Window_CounterCommand,
		Window_SRWItemBattle: Window_SRWItemBattle,
		Window_SRWAbilityCommand: Window_SRWAbilityCommand,
		Window_SRWAbilityDescription: Window_SRWAbilityDescription,
		Window_SRWTransformSelection: Window_SRWTransformSelection,
		Window_SRWPilotSelection: Window_SRWPilotSelection,
		Window_StageInfo: Window_StageInfo,
		Window_ConditionsInfo: Window_ConditionsInfo,
		Window_LocationHeader: Window_LocationHeader
	} 
	
	function patches(){};
	
	patches.apply = function(){
		Window_SavefileList.prototype.drawItem = function(index) {
			var id = index + 1;
			var valid = DataManager.isThisGameFile(id);
			var info = DataManager.loadSavefileInfo(id);
			var rect = this.itemRectForText(index);
			this.resetTextColor();
			if (this._mode === 'load') {
				this.changePaintOpacity(valid);
			}
			this.drawFileId(id, rect.x, rect.y);
			if (info) {
				this.changePaintOpacity(valid);
				this.drawContents(info, rect, valid);
				this.changePaintOpacity(true);
			}
		};
		
		Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
			var bottom = rect.y + rect.height;
			if (rect.width >= 420) {
				this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
				if (valid) {
					this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
				}
			}
			var lineHeight = this.lineHeight();
			var y2 = bottom - lineHeight;
			if (y2 >= lineHeight) {
				this.drawPlaytime(info, rect.x, y2, rect.width);
			}
			var offSetX = 20;
			var bottomOffset = 54;
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_funds+": "+info.funds, offSetX + rect.x, bottom - bottomOffset, 240);
			}
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_SR_count+": "+info.SRCount, offSetX + rect.x + 240, bottom - bottomOffset, 240);
			}
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_turn_count+": "+info.turnCount, offSetX + rect.x + 480, bottom - bottomOffset, 240);
			}		
		};	
		
		
		Window_SavefileList.prototype.cursorRight = function(wrap) {
			var index = this.index();
			var maxItems = this.maxItems();		
			if(index == maxItems - 1){
				//no loop around with large steps seems better
				//this.select(0);
			} else if(index + 10 > maxItems - 1){
				this.select(maxItems - 1);
			} else {
				this.select((index + 10) % maxItems);	
			}					
		};

		Window_SavefileList.prototype.cursorLeft = function(wrap) {
			var index = this.index();
			var maxItems = this.maxItems();	
			if(index == 0){
				//no loop around with large steps seems better
				//this.select(maxItems - 1);
			} else if(index - 10 < 0){
				this.select(0);
			} else {
				this.select((index - 10 + maxItems) % maxItems);
			}									
		};

		
		Window_Message.prototype.isInstantText = function() {
			return Input.isPressed('ok') && Input.isPressed('pagedown');
		}
		
		Window_Message.prototype.updateMessage = function() {
			if (this._textState) {
				while (!this.isEndOfText(this._textState)) {
					if (this.needsNewPage(this._textState)) {
						this.newPage(this._textState);
					}
									
					this.updateShowFast();
					this.processCharacter(this._textState);
					if(!this.isInstantText()){			
						if (!this._showFast && !this._lineShowFast) {
							break;
						}
						if (this.pause || this._waitCount > 0) {
							break;
						}
					} 
				}
				if (this.isEndOfText(this._textState)) {
					this.onEndOfText();
				}
				return true;
			} else {
				return false;
			}
		};
		
		Window_Message.prototype.updateInput = function() {		
			var _this = this;
			if (this.isAnySubWindowActive()) {
				return true;
			}
			if (this._showingLog){
				return true;
			}
			if (this.pause) {
				if(Input.isTriggered('menu')){	
					this._showingLog = true;	
					this.hide();
					$gameTemp.textLogCancelCallback = function(){
						_this._showingLog = false;
						_this.show();
						Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
					}					
					$gameTemp.pushMenu = "text_log";
				} else if (this.isTriggered() || this.isInstantText()) {
					Input.update();
					this.pause = false;
					if (!this._textState) {
						this.terminateMessage();
					}
				}
				return true;
			}
			return false;
		};
		
		Window_Message.prototype.startPause = function() {
			var waitCount;
			if(this.isInstantText()){
				waitCount = 2;
			} else {
				waitCount = 10;
			}
			this.startWait(waitCount);
			this.pause = true;
		};		
		
		Window_Message.prototype.processEscapeCharacter = function(code, textState) {
			switch (code) {
			/*case 'R':
				this._isRemote = !!this.obtainEscapeParam(textState);
				this.updateFaceDisplay();
				break;*/
			case '$':
				this._goldWindow.open();
				break;
			case '.':
				this.startWait(15);
				break;
			case '|':
				this.startWait(60);
				break;
			case '!':
				this.startPause();
				break;
			case '>':
				this._lineShowFast = true;
				break;
			case '<':
				this._lineShowFast = false;
				break;
			case '^':
				this._pauseSkip = true;
				break;
			default:
				Window_Base.prototype.processEscapeCharacter.call(this, code, textState);
				break;
			}
		};
		
		Window_Message.prototype.update = function() {
			this.checkToNotClose();
			Window_Base.prototype.update.call(this);
			while (!this.isOpening() && !this.isClosing()) {
				this._remoteOverlayCounter+=0.2;
				if($gameMessage.faceName()){
					this.updateFaceDisplay();
				}
				if($gameTemp.locationHeader){
					this._locationHeaderWindow.open();
				} else {
					this._locationHeaderWindow.close();
				}
				if (this.updateWait()) {
					return;
				} else if (this.updateLoading()) {
					return;
				} else if (this.updateInput()) {
					return;
				} else if (this.updateMessage()) {
					return;
				} else if (this.canStart()) {
					this.startMessage();
				} else {
					this.startInput();
					return;
				}
			}
		};
		
		Window_Message.prototype.updateLoading = function() {
			if (this._faceBitmap) {
				if (this._faceBitmap.isReady()) {
					this.updateFaceDisplay();
					this._faceBitmap = null;
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		};
		
		Window_Message.prototype.updateFaceDisplay = function() {
			let width = Window_Base._faceWidth;
			let height = Window_Base._faceHeight;
			this.contents.clearRect(0, 0, width, height);
		
			this.drawMessageFace();
			if($gameMessage.faceName()){
				this.drawPortraitOverlay();
			}
			
		}
		
		Window_Message.prototype.initMembers = function() {
			this._imageReservationId = Utils.generateRuntimeId();
			this._background = 0;
			this._positionType = 2;
			this._waitCount = 0;
			this._faceBitmap = null;
			this._remoteBGBitmaps = [];
			this._textState = null;
			this._remoteOverlayCounter = 0;
			this.clearFlags();
		};
		
		Window_Message.prototype.drawPortraitOverlay = function() {
			if($gameTemp.portraitOverlays){
				for(let overlayId of $gameTemp.portraitOverlays){					
					if(!this._remoteBGBitmaps[overlayId]){
						this._remoteBGBitmaps[overlayId] = ImageManager.loadSystem("PortraitOverlay_"+overlayId)
					}
					const x = 0;
					const y = 0;
					let width = Window_Base._faceWidth;
					let height = Window_Base._faceHeight;
					var pw = Window_Base._faceWidth;
					var ph = Window_Base._faceHeight;
					var sw = Math.min(width, pw);
					var sh = Math.min(height, ph);
					var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
					var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
					let frame = Math.floor(this._remoteOverlayCounter % 16);
					//this._remoteOverlayCounter = frame;
					var sx = frame % 8 * pw + (pw - sw) / 2;
					var sy = Math.floor(frame / 8) * ph + (ph - sh) / 2;
					this.contents.blt(this._remoteBGBitmaps[overlayId], sx, sy, sw, sh, dx, dy);					
				}				
			}			
		};
		
		Window_Message.prototype.loadMessageFace = function() {
			this._faceBitmap = ImageManager.reserveFace($gameMessage.faceName(), 0, this._imageReservationId);			
		};
		
		Window_Message.prototype.subWindows = function() {
			return [this._goldWindow, this._choiceWindow,
					this._numberWindow, this._itemWindow,
					this._locationHeaderWindow];
		};
		
		Window_Message.prototype.createSubWindows = function() {
			this._goldWindow = new Window_Gold(0, 0);
			this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
			this._goldWindow.openness = 0;
			this._choiceWindow = new Window_ChoiceList(this);
			this._numberWindow = new Window_NumberInput(this);
			this._itemWindow = new Window_EventItem(this);
			
			this._locationHeaderWindow = new Window_LocationHeader(0, 20);
			this._locationHeaderWindow.openness = 0;
		};
		
		Window_Message.prototype.terminateMessage = function() {
			this.close();
			this._goldWindow.close();
			$gameMessage.clear();
		};

	//====================================================================
	// ●Window_ActorCommand
	//====================================================================
		Window_Command.prototype.isList = function() {
			if (this._list) {
				return true;
			} else {
				return false;
			}
		};

		var _SRPG_Window_ActorCommand_numVisibleRows = Window_ActorCommand.prototype.numVisibleRows;
		Window_ActorCommand.prototype.numVisibleRows = function() {
			if ($gameSystem.isSRPGMode() == true) {
				if (this.isList()) {
					return this.maxItems();
				} else {
					return 0;
				}
			} else {
				return _SRPG_Window_ActorCommand_numVisibleRows.call(this);
			}
		};

		var _SRPG_Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
		Window_ActorCommand.prototype.makeCommandList = function() {
			var _this = this;
			if ($gameSystem.isSRPGMode() == true) {
				if (this._actor) {
					//TODO: turn different menus into subclasses
					
					var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
					var type = battler.isActor() ? "enemy" : "actor";
					var pos = {
						x: $gameTemp.activeEvent().posX(),
						y: $gameTemp.activeEvent().posY()
					};
			
					var hasTarget = $statCalc.getAllInRange(this._actor).length > 0;
					var hasMapWeapon = $statCalc.hasMapWeapon(battler);
					
					function boardingMenu(){
						_this.addCommand(APPSTRINGS.MAPMENU.board, 'board');
					}
					
					function regularMenu(){
						if(_this._actor.battleMode() != "fixed"){
							_this.addMoveCommand();
						}
						if((hasTarget || hasMapWeapon) && $statCalc.canAttackOnCurrentTerrain(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
						}
						if($statCalc.isShip(_this._actor) && $statCalc.hasBoardedUnits(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.deploy, 'deploy');
						}
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"]) && $statCalc.hasHealTargets(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
						}
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["resupply"]) && $statCalc.hasResupplyTargets(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_resupply, 'resupply');
						}
						if($statCalc.getConsumables(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
						}
						if($statCalc.getAbilityCommands(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_ability, 'ability');
						}

						let terrainCmds = $statCalc.getAvailableSuperStateTransitionsForCurrentPosition(_this._actor);	
						for(let i = 0; i < Math.min(4, terrainCmds.length); i++){
							_this.addCommand(terrainCmds[i].cmdName, 'change_super_state_'+i);
						}
						
						if($gameSystem.getPersuadeOption(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
						}	
						if($statCalc.canCombine(_this._actor).isValid){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_combine, 'combine');
						}	
						if($statCalc.isCombined(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_split, 'split');
						}
						if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS){
							if(!$statCalc.isShip(_this._actor) && $statCalc.canSwap(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_swap, 'swap');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.canDisband(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_separate, 'separate');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.canTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_join, 'join');
							}	
						}
						
						if($statCalc.canTransform(_this._actor)){
							_this.addCommand($statCalc.getTransformCmdName(_this._actor) || APPSTRINGS.MAPMENU.cmd_transform, 'transform');
						}
						
						if($statCalc.canSwapPilot(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_swap_pilot, 'swap_pilot');
						}							
												
					
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_status, 'status');						
						
						_this.addWaitCommand();					
					}
					
					function hitAndAwayMenu(){
						_this.addMoveCommand();
						_this.addWaitCommand();
					}
					
					function disabledMenu(){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_status, 'status');	
						_this.addWaitCommand();
					}
					
					function statusDisabledMenu(){
						if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS){
							if(!$statCalc.isShip(_this._actor) && $statCalc.canSwap(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_swap, 'swap');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.canDisband(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_separate, 'separate');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.canTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_join, 'join');
							}	
						}
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_status, 'status');	
						_this.addWaitCommand();								
					}
					
					function postMoveMenu(){
						if(hasTarget || hasMapWeapon){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
						}
						if($gameSystem.getPersuadeOption(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
						}
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"]) && $statCalc.hasHealTargets(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
						}
						
						if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS){
							if($statCalc.canTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_join, 'join');
							}	
						}
						if($statCalc.canSwapPilot(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_swap_pilot, 'swap_pilot');
						}	
						
						_this.addWaitCommand();
					}
					
					function deployMenu(){
						_this.addMoveCommand();					
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
						let terrainCmds = $statCalc.getAvailableSuperStateTransitionsForCurrentPosition(_this._actor);	
						for(let i = 0; i < Math.min(4, terrainCmds.length); i++){
							_this.addCommand(terrainCmds[i].cmdName, 'change_super_state_'+i);
						}
						if($statCalc.getConsumables(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
						}
					}
					
					if($gameSystem.isSubBattlePhase() == 'confirm_boarding'){
						boardingMenu();
					} else if($gameTemp.isHitAndAway){
						hitAndAwayMenu();
					} else if($gameTemp.isPostMove){
						postMoveMenu();
					} else if($gameTemp.activeShip){
						deployMenu();
					} else if(this._actor.battleMode() == "disabled"){
						disabledMenu();
					} else if($statCalc.isDisabled(this._actor)){
						statusDisabledMenu();
					} else {	
						regularMenu();
					}				
				}
			} else {
				_SRPG_Window_ActorCommand_makeCommandList.call(this);
			}
		};

		Window_ActorCommand.prototype.addEquipCommand = function() {
			this.addCommand(_textSrpgEquip, 'equip', this._actor.canSrpgEquip());
		};

		Window_ActorCommand.prototype.addWaitCommand = function() {
			this.addCommand(APPSTRINGS.MAPMENU.cmd_wait, 'wait');
		};
		
		Window_ActorCommand.prototype.addMoveCommand = function() {
			this.addCommand(APPSTRINGS.MAPMENU.cmd_move, 'move');
		};

		var _SRPG_Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
		Window_ActorCommand.prototype.setup = function(actor) {
			if ($gameSystem.isSRPGMode() == true) {
				this._actor = actor;
				this.clearCommandList();
				this.makeCommandList();
				this.updatePlacement();
				this.refresh();
				this.selectLast();
				this.activate();
				this.open();
			} else {
				_SRPG_Window_ActorCommand_setup.call(this, actor);
			}
		};

		Window_ActorCommand.prototype.updatePlacement = function() {
			this.width = this.windowWidth();
			this.height = this.windowHeight();
			this.x = Math.max($gameTemp.activeEvent().screenX() - $gameMap.tileWidth() / 2 - this.windowWidth(), 0);
			if ($gameTemp.activeEvent().screenY() < Graphics.boxHeight - 160) {
				var eventY = $gameTemp.activeEvent().screenY();
			} else {
				var eventY = Graphics.boxHeight - 160;
			}
			this.y = Math.max(eventY - this.windowHeight(), 0);
		};
		
		//====================================================================
		// ●Window_MenuCommand
		//====================================================================
			var _SRPG_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
			Window_MenuCommand.prototype.makeCommandList = function() {       
				 
			   
			   if($gameSystem.isSRPGMode()){
				   this.addTurnEndCommand();     
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_search, 'search', true);
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_list, 'unitList', true);
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_conditions, 'conditions', true);
				   				   	
			   
					if(ENGINE_SETTINGS.ENABLE_TRANSFORM_ALL){
						this.addCommand(APPSTRINGS.MAPMENU.cmd_transform_all, 'transform_all');
					}
			   } else {
					if (this.needsCommand('item')) {
						this.addCommand(TextManager.item, 'item', true);
					}
					this.addOriginalCommands();
			   }
			   
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_options, 'options');
			   if($gameSystem.isSRPGMode()){
				this.addCommand(APPSTRINGS.MAPMENU.cmd_log, 'log');
			   }
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_save, 'save');
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_game_end, 'gameEnd');
			};

			Window_MenuCommand.prototype.addTurnEndCommand = function() {
				this.addCommand(APPSTRINGS.MAPMENU.cmd_end_turn, 'turnEnd', true);
			};

			var _SRPG_Window_MenuCommand_isFormationEnabled = Window_MenuCommand.prototype.isFormationEnabled;
			Window_MenuCommand.prototype.isFormationEnabled = function() {
				/*if ($gameSystem.isSRPGMode() == true) {
					return false;
				} else {
					return _SRPG_Window_MenuCommand_isFormationEnabled.call(this);
				}*/
				return false
			};
	}
	
	//A window that lists the counter/evade/defend options for the player when counter attacking
	function Window_CounterCommand(){
		this.initialize.apply(this, arguments);
	}

	Window_CounterCommand.prototype = Object.create(Window_Command.prototype);
	Window_CounterCommand.prototype.constructor = Window_CounterCommand;

	Window_CounterCommand.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
		this._actor = null;
		this._item = null;
		this.openness = 0;
		this.setup();
		this.hide();
		this.deactivate();
	};

	Window_CounterCommand.prototype.makeCommandList = function() {  
		this.addCommand("Counter", 'counter');	
		this.addCommand("Defend", 'defend');
		this.addCommand("Evade", 'evade');
	};

	Window_CounterCommand.prototype.setup = function(actorArray) {
		this.clearCommandList();
		this.makeCommandList();
		this.refresh();
		this.activate();
		this.open();
	};

	Window_CounterCommand.prototype.maxCols = function() {
		return 1;
	};

	Window_CounterCommand.prototype.windowHeight = function() {
		return this.fittingHeight(3);
	};
	
	
	Window_Base.prototype.drawSectionRect = function(x, y, w, h, margin, color) {
		var lineWidth = 1;
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		//top
		this.contents.fillRect(x ,y, w, lineWidth, color);
		//bottom
		this.contents.fillRect(x, y + h, w + lineWidth, lineWidth, color);
		//left
		this.contents.fillRect(x ,y, lineWidth, h, color);
		//right
		this.contents.fillRect(x + w, y, lineWidth, h, color);
	}
	
	Window_Base.prototype.drawRect = function(x, y, w, h, margin, color) {
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		this.contents.fillRect(x ,y, w, h, color);
	}
	
	Window_Base.prototype.windowInnerWidth = function() {
        return this.windowWidth() - 38;
    };
	
	Window_Base.prototype.setFontSize = function(size) {
        this.contents.fontSize = size;
    };
	
	Window_Base.prototype.setItalic = function(state) {
        this.contents.fontItalic = state;
    };
	
	Window_Base.prototype.centerTextOffset = function(text, containerWidth) {
        return containerWidth / 2 - this.textWidth(text) / 2;
    };
	
	
	Window_Base.prototype.standardFontSize = function() {
		return ENGINE_SETTINGS.FONT_SIZE || 28;
	};
	
	Window_Base.prototype.lineHeight = function() {
		return ENGINE_SETTINGS.LINE_HEIGHT || 36;
	};
	
	Window_Base.prototype.calcTextHeight = function(textState, all) {
		var lastFontSize = this.contents.fontSize;
		var textHeight = 0;
		var lines = textState.text.slice(textState.index).split('\n');
		var maxLines = all ? lines.length : 1;

		for (var i = 0; i < maxLines; i++) {
			var maxFontSize = this.contents.fontSize;
			var regExp = /\x1b[\{\}]/g;
			for (;;) {
				var array = regExp.exec(lines[i]);
				if (array) {
					if (array[0] === '\x1b{') {
						this.makeFontBigger();
					}
					if (array[0] === '\x1b}') {
						this.makeFontSmaller();
					}
					if (maxFontSize < this.contents.fontSize) {
						maxFontSize = this.contents.fontSize;
					}
				} else {
					break;
				}
			}
			textHeight += maxFontSize + 8;
		}

		this.contents.fontSize = lastFontSize;
		return textHeight * (ENGINE_SETTINGS.MSG_LINE_HEIGHT_SCALE);
	};
	
	
	Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
		this.contents.drawText(text, x, y + (ENGINE_SETTINGS.LINE_OFFSET || 0), maxWidth, this.lineHeight(), align);
	};
	
	Window_Base.prototype.processNormalCharacter = function(textState) {
		var c = textState.text[textState.index++];
		var w = this.textWidth(c);
		this.contents.drawText(c, textState.x, textState.y + (ENGINE_SETTINGS.LINE_OFFSET || 0), w * 2, textState.height);
		textState.x += w;
	};
	
	var _Window_Base_ResetFontSettings = Window_Base.prototype.resetFontSettings;
	Window_Base.prototype.resetFontSettings = function() {
		_Window_Base_ResetFontSettings.call( this );
		if(ENGINE_SETTINGS.NO_TEXT_SHADOW){
			this.contents.outlineWidth = 0;
		}		
	};
	
	Window_Base.prototype.standardBackOpacity = function() {
		return ENGINE_SETTINGS.BACK_OPACITY || 192;
	};
	
	var _Window_updateCursor = Window.prototype._updateCursor;
	Window.prototype._updateCursor = function() {
		_Window_updateCursor.call( this );
		if(ENGINE_SETTINGS.NO_CURSOR_BLINK){
			this._windowCursorSprite.alpha = 1;
		}
	}

	
	function Window_SRWItemBattle() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWItemBattle.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWItemBattle.prototype.constructor = Window_SRWItemBattle;
	
	Window_SRWItemBattle.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWItemBattle.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWItemBattle.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWItemBattle.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWItemBattle.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item) {
			item = $itemEffectManager.getAbilityDisplayInfo(item.itemIdx);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWItemBattle.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWItemBattle.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getConsumables(actor);
	};
	
	Window_SRWItemBattle.prototype.isEnabled = function(item) {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var itemDef = $itemEffectManager.getAbilityDef(item.itemIdx);
		return itemDef.isActiveHandler(actor);
	};	
	
	function Window_SRWAbilityCommand() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWAbilityCommand.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWAbilityCommand.prototype.constructor = Window_SRWAbilityCommand;
	
	Window_SRWAbilityCommand.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWAbilityCommand.prototype.windowWidth = function() {
        return 400;
    };

    Window_SRWAbilityCommand.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWAbilityCommand.prototype.refresh = function(){
		this._parent.refresh.call(this);
		if(this._descWindow){
			this._descWindow.refresh(this.getActiveAbilityIndex());
		}
	}
	
	Window_SRWAbilityCommand.prototype.callUpdateHelp = function() {
		if(this._descWindow){
			this._descWindow.refresh(this.getActiveAbilityIndex());
		}
	};	
	
	Window_SRWAbilityCommand.prototype.setDescriptionWindow = function(window){
		return this._descWindow = window;
	}
	
	Window_SRWAbilityCommand.prototype.getActiveAbilityIndex = function(){
		return this._data[this._index];
	}	
	
	Window_SRWAbilityCommand.prototype.show = function() {
		this.selectLast();
		this.showHelpWindow();
		Window_ItemList.prototype.show.call(this);
		if(this._descWindow){
			this._descWindow.show();
		}
	};

	Window_SRWAbilityCommand.prototype.hide = function() {
		this.hideHelpWindow();
		Window_ItemList.prototype.hide.call(this);
		if(this._descWindow){
			this._descWindow.hide();
		}
	};
	
	Window_SRWAbilityCommand.prototype.drawItem = function(index) {
		var cmdAbilityIdx = this._data[index];
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		if (cmdAbilityIdx != null) {
			var item = $abilityCommandManger.getAbilityDisplayInfo(cmdAbilityIdx);
			var itemDef = $abilityCommandManger.getAbilityDef(cmdAbilityIdx);
			var numberWidth = 100;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			
			if(!itemDef.isActiveHandler(actor)){
				this.changeTextColor("#AAAAAA");
			} else {
				this.resetTextColor();
			}
			
			this.drawItemName(item, rect.x, rect.y, this.windowWidth() - numberWidth);
			
			var useInfo = $abilityCommandManger.getUseInfo(actor, cmdAbilityIdx);
			if(typeof useInfo != "object"){
				useInfo = {
					type: "ammo",
					cost: useInfo
				};
			}
			if(useInfo.type == "ammo"){
				var timesUsed = actor.SRWStats.stageTemp.abilityUsed[cmdAbilityIdx] || 0;
				var maxCount = useInfo.cost;
				var remaining = maxCount - timesUsed;			
				
				if(remaining <= 0) {
					this.changeTextColor("#FF0000");
				} 
				this.drawText(remaining+"/"+maxCount, this.windowWidth() - numberWidth + 5, rect.y, numberWidth);
			} else if(useInfo.type == "EN"){
				if(actor.SRWStats.mech.stats.calculated.currentEN < useInfo.cost){
					this.changeTextColor("#FF0000");
				}
				this.drawText(useInfo.cost+" "+APPSTRINGS.GENERAL.label_EN, this.windowWidth() - numberWidth - 15, rect.y, numberWidth);
			} else if(useInfo.type == "MP"){
				if(actor.SRWStats.pilot.stats.calculated.currentMP < useInfo.cost){
					this.changeTextColor("#FF0000");
				}
				this.drawText(useInfo.cost+" "+APPSTRINGS.GENERAL.label_MP, this.windowWidth() - numberWidth - 15, rect.y, numberWidth);
			}
			
		}
	};
	
	Window_SRWAbilityCommand.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWAbilityCommand.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getAbilityCommands(actor);
	};
	
	Window_SRWAbilityCommand.prototype.isEnabled = function(item) {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var itemDef = $abilityCommandManger.getAbilityDef(item);
		
		var useInfo = $abilityCommandManger.getUseInfo(actor, item);
		let canPayCost = true;		
		if(useInfo.type == "ammo"){
			var timesUsed = actor.SRWStats.stageTemp.abilityUsed[item] || 0;
			var maxCount = useInfo.cost;
			var remaining = maxCount - timesUsed;			
			if(remaining <= 0) {
				canPayCost = false;
			} 
		} else if(useInfo.type == "EN"){
			if(actor.SRWStats.mech.stats.calculated.currentEN < useInfo.cost){
				canPayCost = false;
			}
		} else if(useInfo.type == "MP"){
			if(actor.SRWStats.pilot.stats.calculated.currentMP < useInfo.cost){
				canPayCost = false;
			}
		}		
		return itemDef.isActiveHandler(actor) && canPayCost;
	};	
	
	function Window_SRWTransformSelection() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWTransformSelection.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWTransformSelection.prototype.constructor = Window_SRWTransformSelection;
	
	Window_SRWTransformSelection.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWTransformSelection.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWTransformSelection.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWTransformSelection.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWTransformSelection.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item != null) {
			item = $dataClasses[item];
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWTransformSelection.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWTransformSelection.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getTransformationList(actor);
	};
	
	Window_SRWTransformSelection.prototype.isEnabled = function(item) {
		return true;
	};	
	
	
	
	function Window_SRWPilotSelection() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWPilotSelection.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWPilotSelection.prototype.constructor = Window_SRWPilotSelection;
	
	Window_SRWPilotSelection.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWPilotSelection.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWPilotSelection.prototype.windowHeight = function() {
		if(!this._data){
			return this.fittingHeight(4);
		} else {
			return this.fittingHeight(this._data.length);
		}        
    };
	
	
	Window_SRWPilotSelection.prototype.refresh = function(){		
		this.makeItemList();
		this.height = this.windowHeight();
		this.createContents();
		this.drawAllItems();
	}
	
	Window_SRWPilotSelection.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item != null) {
			item = $gameActors.actor(item);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWPilotSelection.prototype.drawItemName = function(item, x, y, width) {
		const _this = this;
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name(), x + 10, y, width - 60);
			let attr1 = $statCalc.getParticipantAttribute(item, "attribute1");
			if(attr1){
				let attrInfo = ENGINE_SETTINGS.ATTRIBUTE_DISPLAY_NAMES[attr1] || {};
				var bitmap = ImageManager.loadSystem("attribute_"+attr1);
				bitmap.addLoadListener(function(){
					_this.contents.blt(bitmap, 0, 0, 32, 32, x + width - 42, y+2);
				});				
			}
		}
	};
	
	Window_SRWPilotSelection.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getSwapOptions(actor);
	};
	
	Window_SRWPilotSelection.prototype.isEnabled = function(item) {
		return true;
	};	
	
	function Window_StageInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_StageInfo.prototype = Object.create(Window_Base.prototype);
	Window_StageInfo.prototype.constructor = Window_StageInfo;

	Window_StageInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_StageInfo.prototype.windowWidth = function() {
		return 240;
	};

	Window_StageInfo.prototype.windowHeight = function() {
		if($gameSystem.isSRPGMode()){
			return this.fittingHeight(4);
		} else {
			return this.fittingHeight(1);
		}		
	};

	Window_StageInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		//this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
		this.drawText(APPSTRINGS.MAPMENU.label_funds, x, 0, width);
		this.drawText(this.value(), x + columnOffset , 0, width);
		
		this.drawText(APPSTRINGS.MAPMENU.label_turn, x,  lineheight, width);
		/*--text-color-highlight: #f9e343;	
	 	--text-color-highlight2: #43dbf9;	*/
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_turnVarID), x + columnOffset, lineheight, width);
		this.changeTextColor("#FFFFFF");
		this.drawText(APPSTRINGS.MAPMENU.label_enemy, x,  lineheight * 2, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_enemiesDestroyed), x + columnOffset,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 2, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_enemiesDestroyed) + $gameVariables.value(_existEnemyVarID), x + columnOffset + 45,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		
		this.drawText(APPSTRINGS.MAPMENU.label_ally, x,  lineheight * 3, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_actorsDestroyed), x + columnOffset,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 3, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_actorsDestroyed) + $gameVariables.value(_existActorVarID), x + columnOffset + 45,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		
	};

	Window_StageInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_StageInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_StageInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	
	function Window_ConditionsInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_ConditionsInfo.prototype = Object.create(Window_Base.prototype);
	Window_ConditionsInfo.prototype.constructor = Window_ConditionsInfo;

	Window_ConditionsInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_ConditionsInfo.prototype.windowWidth = function() {
		return 760;
	};

	Window_ConditionsInfo.prototype.windowHeight = function() {
		return this.fittingHeight(9);
	};
	
	Window_ConditionsInfo.prototype.drawText = function(text, x, y, maxWidth, align) {
		//text = this.convertEscapeCharacters(text);
		//this.processEscapeCharacter(text);
		var parts = text.split("\n");
		for(var i = 0; i < parts.length; i++){
			Window_Base.prototype.drawText.call(this, parts[i], x, y + (35 * i), maxWidth, align)
		}		
	}

	Window_ConditionsInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		
		
		
		
		this.changeTextColor("#FFFFFF");
		
		var valueOffset = 20;
		this.drawText($gameVariables.value(_victoryConditionText) || "", x + valueOffset, lineheight, width - valueOffset);
		
		this.drawText($gameVariables.value(_defeatConditionText) || "", x + valueOffset, lineheight * 4, width - valueOffset);
		
		var masteryText = $gameVariables.value(_masteryConditionText);
		if($SRWSaveManager.isMapSRPointLocked($gameMap.mapId())){
			masteryText = APPSTRINGS.GENERAL.label_mastery_locked;
		}
		this.drawText(masteryText || "", x + valueOffset, lineheight * 7, width - valueOffset);
		
		this.changeTextColor("#43dbf9");
		this.drawText(APPSTRINGS.GENERAL.label_victory_condition, x, 0, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_defeat_condition, x, lineheight * 3, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_mastery_condition, x, lineheight * 6, width);
		
	};

	Window_ConditionsInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_ConditionsInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_ConditionsInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	function Window_SRWAbilityDescription(x,y) {
		this.initialize.apply(this, arguments);		
	}

	Window_SRWAbilityDescription.prototype = Object.create(Window_Base.prototype);
	Window_SRWAbilityDescription.prototype.constructor = Window_SRWAbilityDescription;

	Window_SRWAbilityDescription.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		var x = 0;
		var y =  SceneManager._screenHeight - height;
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_SRWAbilityDescription.prototype.windowWidth = function() {
		return 1110;
	};

	Window_SRWAbilityDescription.prototype.windowHeight = function() {
		return this.fittingHeight(2);
	};
	
	Window_SRWAbilityDescription.prototype.drawText = function(text, x, y, maxWidth, align) {
		//text = this.convertEscapeCharacters(text);
		//this.processEscapeCharacter(text);
		var parts = text.split("\n");
		for(var i = 0; i < parts.length; i++){
			Window_Base.prototype.drawText.call(this, parts[i], x, y + (35 * i), maxWidth, align)
		}		
	}

	Window_SRWAbilityDescription.prototype.refresh = function(cmdAbilityIdx) {
		this.contents.clear();
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var event = $gameTemp.activeEvent();
		if(event){
			var actorInfo = $gameSystem.EventToUnit(event.eventId());
			if(actorInfo){
				var actor = actorInfo[1];
				if (cmdAbilityIdx != null && actor) {
					var item = $abilityCommandManger.getAbilityDisplayInfo(cmdAbilityIdx);
					var itemDef = $abilityCommandManger.getAbilityDef(cmdAbilityIdx);
					var txt;
					if(typeof item.desc == "function"){
						txt = item.desc(actor);
					} else {
						txt = item.desc;
					}
					this.drawText((txt || ""), 0, 0, 1110 - 38);
				}
			}
		}		
	};

	Window_SRWAbilityDescription.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	
	function Window_LocationHeader(x,y) {
		this.initialize.apply(this, arguments);		
	}

	Window_LocationHeader.prototype = Object.create(Window_Base.prototype);
	Window_LocationHeader.prototype.constructor = Window_LocationHeader;

	Window_LocationHeader.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.setBackgroundType(1);
		this.refresh();
	};

	Window_LocationHeader.prototype.windowWidth = function() {
		return 1110;
	};

	Window_LocationHeader.prototype.windowHeight = function() {
		return this.fittingHeight(1);
	};
	
	Window_LocationHeader.prototype.refresh = function() {
		this.contents.clear();		
		
		this.drawText($gameTemp.locationHeader, 0, 0, 1110 - 38);
			
	};

	Window_LocationHeader.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	