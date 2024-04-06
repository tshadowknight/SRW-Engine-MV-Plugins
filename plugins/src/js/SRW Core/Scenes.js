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

	}	
	
	