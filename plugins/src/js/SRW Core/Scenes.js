	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	
	
	patches.apply = function(){
		SceneManager.resume = function() {
			if(!$gameTemp.editMode){
				this._stopped = false;
				this.requestUpdate();
				if (!Utils.isMobileSafari()) {
					this._currentTime = this._getTimeInMsWithoutMobileSafari();
					this._accumulator = 0;
				}
			}			
		};
		
		
		Scene_Map.prototype.onMapLoaded = function() {
			$gameTemp.allocateSRPGMapStructures();
			DataManager.resetTextScriptCache(); //do not cache script files from previous map(s)
			if (this._transfer) {
				$gamePlayer.performTransfer();
			}			
			this.createDisplayObjects();			
		};

		Scene_Title.prototype.checkGL = function () { 
			if(this._GLOK == null){	
				try {
					var canvas = document.createElement('canvas'); 
					this._GLOK = !!(window.WebGLRenderingContext &&
					(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
				} catch(e) {
					this._GLOK = false;
				}
			}
			return this._GLOK;
		}

		Scene_Title.prototype.create = function() {
			Scene_Base.prototype.create.call(this);			
			this.createBackground();
			this.createForeground();
			this.createWindowLayer();
			this.createCommandWindow();						
		};


		Scene_Title.prototype.start = function() {
			Scene_Base.prototype.start.call(this);
			SceneManager.clearStack();
			if(!this.checkGL()){
				this.drawGLError();
			} else {
				this.centerSprite(this._backSprite1);
				this.centerSprite(this._backSprite2);
				this.playTitleMusic();
				this.startFadeIn(this.fadeSpeed(), false);
			}			
		};

		Scene_Title.prototype.drawGLError = function() {
			var x = 20;
			var y = 30
			var maxWidth = Graphics.width - x * 2;
			var text = "WebGL is required to run this game.";
			var text2 = "If you are seeing this error no WebGL support was detected."
			var text3 = "If you have multiple GPUs(discrete and integrated) make sure the game is running using the discrete GPU.";
			this._gameTitleSprite.bitmap.outlineColor = 'black';
			this._gameTitleSprite.bitmap.outlineWidth = 0;
			this._gameTitleSprite.bitmap.fontSize = 28;
			this._gameTitleSprite.bitmap.drawText(text, x, y * 1, maxWidth, 48, 'left');
			this._gameTitleSprite.bitmap.drawText(text2, x, y * 2, maxWidth, 48, 'left');
			this._gameTitleSprite.bitmap.drawText(text3, x, y * 4, maxWidth, 48, 'left');
		};

		Scene_Title.prototype.drawGameTitle = function() {
			if(this.checkGL()){
				var x = 20;
				var y = Graphics.height / 4;
				var maxWidth = Graphics.width - x * 2;
				var text = $dataSystem.gameTitle;
				this._gameTitleSprite.bitmap.outlineColor = 'black';
				this._gameTitleSprite.bitmap.outlineWidth = 8;
				this._gameTitleSprite.bitmap.fontSize = 72;
				this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
			}
		};

		Scene_Title.prototype.createCommandWindow = function() {
			this._commandWindow = new Window_TitleCommand();
			if(this.checkGL()){
				this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
				this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
				this._commandWindow.setHandler('options',  this.commandOptions.bind(this));
				this.addWindow(this._commandWindow);
			}			
		};

	}	
	
	