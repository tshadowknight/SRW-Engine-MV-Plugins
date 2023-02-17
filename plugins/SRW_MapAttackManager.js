function MapAttackManager(){
	this._definitions = [];
	//this.initDefinitions();	
	this._sourceFile = "MapAttacks";
	JSONLoader.call(this);	
}

MapAttackManager.prototype = Object.create(JSONLoader.prototype);
MapAttackManager.prototype.constructor = MapAttackManager;

MapAttackManager.prototype.getDefinition = function(idx){
	return this._data[idx];
}

MapAttackManager.prototype.getDefinitions = function(idx){
	return this._data;
}

MapAttackManager.prototype.initLegacyFormat = function(){
	$SRWConfig.mapAttacks.call(this);
}


MapAttackManager.prototype.addDefinition = function(idx, shape, animInfo, lockRotation, textInfo, retargetInfo){
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