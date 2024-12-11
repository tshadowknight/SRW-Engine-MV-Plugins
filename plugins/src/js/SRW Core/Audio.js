	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		AudioManager.staticSeStates = {};
		AudioManager.playStaticSe = function(se) {
			if (se.name) {
				this.loadStaticSe(se);
				for (var i = 0; i < this._staticBuffers.length; i++) {
					var buffer = this._staticBuffers[i];
					if (buffer._reservedSeName === se.name) {
						AudioManager.staticSeStates[se.name] = false;
						
						buffer._stopListeners.push(function(){
							AudioManager.staticSeStates[se.name] = true;
						});
						
						buffer.stop();
						this.updateSeParameters(buffer, se);
						buffer.play(false);
						break;
					}
				}
			}
		};

		AudioManager.seStates = {};		
		AudioManager.playSe = function(se) {
			if (se.name && !$gameTemp.isSkippingEvents) {
				this._seBuffers = this._seBuffers.filter(function(audio) {
					return audio._isStarting || audio.isPlaying();
				});
				var buffer;
				if(this._sePreloads){
					let ctr = 0;
					while(ctr < this._sePreloads.length && !buffer){
						if(this._sePreloads[ctr]["_reservedSeName"] == se.name && !this._sePreloads[ctr].used){
							buffer = this._sePreloads[ctr];
							buffer.used = true;
						}
						ctr++;
					}
				}
				if(!buffer){
					buffer = this.createBuffer('se', se.name);
				}				
				this.updateSeParameters(buffer, se);
				buffer._seName = se.name;
				buffer._isStarting = true;
				AudioManager.seStates[se.name] = false;
				buffer.play(false);
				buffer._stopListeners.push(function(){
					AudioManager.seStates[se.name] = true;
				});
				this._seBuffers.push(buffer);
			}
		};
		
		AudioManager.clearPreloads = function(se) {
			this._sePreloads = [];
		}		
		
		AudioManager.isPlayingSE = function(){
			let result = false;
			for(var seName in this.seStates){
				if(!this.seStates[seName]){
					result = true;
				}
			}
			return result;
		}
		
		AudioManager.loadBgm = function(bgm) {
			if (bgm.name && !this.isStaticSe(bgm)) {
				var buffer = this.createBuffer('bgm', bgm.name);
				buffer._reservedSeName = bgm.name;
				this._staticBuffers.push(buffer);
				if (this.shouldUseHtml5Audio()) {
					Html5Audio.setStaticSe(buffer._url);
				}
			}
		};
		
		AudioManager.fadeOutSe = function(seName, duration) {
			this._seBuffers.forEach(function(buffer) {
				if(buffer._seName == seName){
					buffer.fadeOut(duration);
				}
			});
		};
		
		AudioManager.stopSe = function(seName) {
			let tmp = [];
			this._seBuffers.forEach(function(buffer) {
				if(seName == null || buffer._seName == seName){
					buffer.stop();
				} else {
					tmp.push(buffer);
				}
			});
			this._seBuffers = tmp;
		};
		
		AudioManager.preloadSe = async function(se) {
			if (se.name) {
				var buffer = await this.createBufferAsync('se', se.name);
				buffer._reservedSeName = se.name;
				if(!this._sePreloads){
					this._sePreloads = [];
				}
				this._sePreloads.push(buffer);
			}
		};
		
		AudioManager.createBufferAsync = function(folder, name) {
			const _this = this;
			return new Promise(function(resolve, reject){
				var ext = _this.audioFileExt();
				var url = _this._path + folder + '/' + encodeURIComponent(name) + ext;			
				const wAudio = new WebAudio(url);	
				wAudio.addLoadListener(function() {
					resolve(wAudio);
				});				
			});					
		};
		
		WebAudio.prototype.play = function(loop, offset) {
			if (this.isReady()) {
				offset = offset || 0;
				this._isStarting = false;
				this._startPlaying(loop, offset);
			} else if (WebAudio._context) {
				this._autoPlay = true;
				this.addLoadListener(function() {
					if (this._autoPlay) {
						this.play(loop, offset);
					}
				}.bind(this));
			}
		};
	}