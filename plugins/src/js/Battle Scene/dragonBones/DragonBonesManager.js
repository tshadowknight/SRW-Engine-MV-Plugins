
export default function DragonBonesManager(path, armatureName, animName, renderer) {
	var _this = PIXI.Container.call(this);
	_this._path = path;
	_this._armatureName = armatureName;
	_this._animName = animName || "main";
	_this._renderer = renderer;
	//_this._background = new PIXI.Sprite(PIXI.Texture.EMPTY);
	_this._resources = [];
	//_this._renderer.backgroundColor = 0x666666;
	//_this._resources.push(DragonBonesManager.BACKGROUND_URL);
	//document.body.appendChild(_this._renderer.view);
	//
	_this._resources.push(
		path+"ske.json", 
		path+"tex.json", 
		path+"tex.png"
	);
	
	_this.x = _this.stageWidth * 0.5;
	_this.y = _this.stageHeight * 0.5;
	//_this._loadResources();
	//_this._loaded = false;
	return _this; 
}

DragonBonesManager.prototype = Object.create(PIXI.Container.prototype);
DragonBonesManager.prototype.constructor = DragonBonesManager;

DragonBonesManager.prototype.getResources = function () {
	return this._resources;
};

DragonBonesManager.prototype._renderHandler = function (deltaTime) {
	this._renderer.render(this);
};
DragonBonesManager.prototype._startRenderTick = function () {
	PIXI.ticker.shared.add(this._renderHandler, this);
};

DragonBonesManager.load = function(resources) {
	var _this = this;
	return new Promise(function(resolve, reject){
		var needsLoading = false;
		for (var _i = 0, _a = resources; _i < _a.length; _i++) {
			var resource = _a[_i];
				
			if(!PIXI.loader.resources[resource] || !PIXI.loader.resources[resource].data){
				needsLoading = true;				
				PIXI.loader.add(resource, resource);				
			}			
		}
		if(!needsLoading){
			resolve();
		} else {
			PIXI.loader.once("complete", function (loader, resources) {
				resolve();
			});
			PIXI.loader.load();
		}		
	});
}

DragonBonesManager.prototype._loadResources = function () {
	var _this = this;
	//PIXI.loader.reset();
	var binaryOptions = { loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR, xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER };
	var needsLoading = false;
	for (var _i = 0, _a = this._resources; _i < _a.length; _i++) {
		var resource = _a[_i];
			
		if(!PIXI.loader.resources[resource]){
			needsLoading = true;
			if (resource.indexOf("dbbin") > 0) {
				PIXI.loader.add(resource, resource, binaryOptions);
			}
			else {
				PIXI.loader.add(resource, resource);
			}
		}			
	}
	if(!needsLoading){
		
		_this._onStart();
	}
	PIXI.loader.once("complete", function (loader, resources) {
		_this._loaded = true;
		
		//
		//_this._background.texture = _this._pixiResources[DragonBonesManager.BACKGROUND_URL].texture;
	//	_this._background.x = -_this._background.texture.width * 0.5;
		//_this._background.y = -_this._background.texture.height * 0.5;
	//	_this.addChild(_this._background);
		//
		_this._onStart();
		//_this._startRenderTick(); // Make sure render after dragonBones update.
	});
	PIXI.loader.load();
};
DragonBonesManager.prototype.createText = function (string) {
	var text = new PIXI.Text(string, { align: "center" });
	text.text = string;
	text.scale.x = 0.7;
	text.scale.y = 0.7;
	text.x = -text.width * 0.5;
	text.y = this.stageHeight * 0.5 - 100.0;
	this.addChild(text);
	return text;
};
Object.defineProperty(DragonBonesManager.prototype, "stageWidth", {
	get: function () {
		return this._renderer.width;
	},
	enumerable: true,
	configurable: true
});
Object.defineProperty(DragonBonesManager.prototype, "stageHeight", {
	get: function () {
		return this._renderer.height;
	},
	enumerable: true,
	configurable: true
});
//DragonBonesManager.BACKGROUND_URL = "resource/background.png";
   // return DragonBonesManager;
DragonBonesManager.prototype.start = function () {
	this._onStart();
}   
   
DragonBonesManager.prototype._onStart = function () {
	this._pixiResources = PIXI.loader.resources;
	var factory = dragonBones.PixiFactory.factory;
	factory.parseDragonBonesData(this._pixiResources[this._path+"ske.json"].data);
	factory.parseTextureAtlasData(this._pixiResources[this._path+"tex.json"].data, this._pixiResources[this._path+"tex.png"].texture);
	this._armatureDisplay = factory.buildArmatureDisplay(this._armatureName || "Default");
	this._armatureDisplay.animation.play(this._animName);
	//armatureDisplay.x = 0.0;
	//armatureDisplay.y = 200.0;
	this.addChild(this._armatureDisplay);
};

DragonBonesManager.prototype.update = function(deltaTime){
	if(this._loaded){
		dragonBones.PixiFactory._clockHandler(deltaTime);
	}	
}

DragonBonesManager.prototype.updateAnimation = function(name){
	if(this._armatureDisplay && this._armatureDisplay.animation){
		this._armatureDisplay.animation.play(name);
	}	
}
