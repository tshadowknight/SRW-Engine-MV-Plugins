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
	const info = this._stageInfo[id];
	if (!info) return {};
	const localizedName = DataManager.getLocalizedName('stageInfo', id, info.name);
	if (localizedName === info.name) return info;
	return Object.assign({}, info, { name: localizedName });
}