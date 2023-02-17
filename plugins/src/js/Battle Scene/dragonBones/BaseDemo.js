
export default function DragonBonesManager() {
	var _this = _super.call(this) || this;
	_this._renderer = new PIXI.WebGLRenderer(1136, 640);
	_this._background = new PIXI.Sprite(PIXI.Texture.EMPTY);
	_this._resources = [];
	_this._renderer.backgroundColor = 0x666666;
	_this._resources.push(DragonBonesManager.BACKGROUND_URL);
	document.body.appendChild(_this._renderer.view);
	//
	setTimeout(function () {
		_this.x = _this.stageWidth * 0.5;
		_this.y = _this.stageHeight * 0.5;
		_this._loadResources();
	}, 10);
	return _this;
}
DragonBonesManager.prototype._renderHandler = function (deltaTime) {
	this._renderer.render(this);
};
DragonBonesManager.prototype._startRenderTick = function () {
	PIXI.ticker.shared.add(this._renderHandler, this);
};
DragonBonesManager.prototype._loadResources = function () {
	var _this = this;
	var binaryOptions = { loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR, xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER };
	for (var _i = 0, _a = this._resources; _i < _a.length; _i++) {
		var resource = _a[_i];
		if (resource.indexOf("dbbin") > 0) {
			PIXI.loader.add(resource, resource, binaryOptions);
		}
		else {
			PIXI.loader.add(resource, resource);
		}
	}
	PIXI.loader.once("complete", function (loader, resources) {
		_this._pixiResources = resources;
		//
		_this._background.texture = _this._pixiResources[DragonBonesManager.BACKGROUND_URL].texture;
		_this._background.x = -_this._background.texture.width * 0.5;
		_this._background.y = -_this._background.texture.height * 0.5;
		_this.addChild(_this._background);
		//
		_this._onStart();
		_this._startRenderTick(); // Make sure render after dragonBones update.
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
DragonBonesManager.BACKGROUND_URL = "resource/background.png";
   // return DragonBonesManager;

