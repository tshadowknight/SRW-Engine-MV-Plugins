function PatternManager(){
	this._definitions = [];
	//this.initDefinitions();	
	this._sourceFile = "Patterns";
	JSONLoader.call(this);	
}

PatternManager.prototype = Object.create(JSONLoader.prototype);
PatternManager.prototype.constructor = PatternManager;

PatternManager.prototype.getDefinition = function(idx){
	let result = this._data[idx];
	for(let tile of result.tiles){
		tile.x*=1;
		tile.y*=1;
	}
	return result;
}

PatternManager.prototype.getDefinitions = function(idx){
	return this._data;
}

PatternManager.prototype.initLegacyFormat = function(){
	//$SRWConfig.mapAttacks.call(this);
}


PatternManager.prototype.addDefinition = function(idx, shape, animInfo, lockRotation, textInfo, retargetInfo){
	var _this = this;
	this._definitions[idx] = {
		name: name,
		shape: shape,
		animInfo: animInfo,
		lockRotation: lockRotation,
		textInfo: textInfo,
		retargetInfo: retargetInfo
	};	
}