function SRWStageInfoManager(){
	//this._stageInfo = $SRWConfig.stageInfo;
}

SRWStageInfoManager.prototype.initDefinitions = function(id){
	this._stageInfo = $SRWConfig.stageInfo;
}

SRWStageInfoManager.prototype.getStageInfo = function(id){
	if(id == -1){
		return {
			name: "",
			displayId: "---"
		}
	}
	return this._stageInfo[id] || {};
}