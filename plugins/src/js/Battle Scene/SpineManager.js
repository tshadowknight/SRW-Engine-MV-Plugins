const spine = require("@esotericsoftware/spine-canvas");

export default function SpineManager(){

}

spine.AssetManager.prototype.loadTexture = async function(path, success = () => { }, error = () => { }){
	path = this.start(path);
	/*let isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
	let isWebWorker = !isBrowser; // && typeof importScripts !== 'undefined';
	if (isWebWorker) {
		fetch(path, { mode: "cors" }).then((response) => {
			if (response.ok)
				return response.blob();
			this.error(error, path, `Couldn't load image: ${path}`);
			return null;
		}).then((blob) => {
			return blob ? createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" }) : null;
		}).then((bitmap) => {
			if (bitmap)
				this.success(success, path, this.textureLoader(bitmap));
		});
	}
	else {
		let image = new Image();
		image.crossOrigin = "anonymous";
		image.onload = () => {
			this.success(success, path, this.textureLoader(image));
		};
		image.onerror = () => {
			this.error(error, path, `Couldn't load image: ${path}`);
		};
		if (this.downloader.rawDataUris[path])
			path = this.downloader.rawDataUris[path];
		image.src = path;
	}*/
	let bitmap = await ImageManager.loadBitmapPromise("", path, true, null, null, true);
	let image = new Image();
	image.crossOrigin = "anonymous";
	image.onload = () => {
		this.success(success, path, this.textureLoader(image));
	};
	image.onerror = () => {
		this.error(error, path, `Couldn't load image: ${path}`);
	};
	image.src = bitmap._image.src;	  
	$battleSceneManager.appendTextureCache(path, image.src);
}

SpineManager.prototype.startAnimation = function(animationContext, path, animKey, force){	
	//this._glContext = this._canvas.getContext("webgl");	
	if(this._anim_key != animKey || force){
		this._spriterPath = path;
		this._animationContext = animationContext;
		this._ctx = animationContext.texture.getContext();
		this._anim_key = animKey;

		this.skeletonRenderer = new spine.SkeletonRenderer(this._ctx);
		this.assetManager = new spine.AssetManager(path);
		this.assetManager.loadText("skeleton.json");
		this.assetManager.loadTextureAtlas("skeleton.atlas");
		
		this.loadFiles();	
	}	
}

SpineManager.prototype.shoudAnimLoop = function(){
	let result = false;
	const events = this._skeleton.data.events;
	let loopEvent;
	let ctr = 0;
	while(!loopEvent && ctr < events.length){
		if(events[ctr].name.toLowerCase() == "loop"){
			loopEvent = events[ctr];
		}
		ctr++;
	}
	if(loopEvent){
		result = loopEvent.stringValue.split(",").indexOf(this._anim_key) != -1;
	}
	return result;
}

SpineManager.prototype.loadFiles = async function(){
	await this.assetManager.loadAll();

	// Create the texture atlas and skeleton data.
	let atlas = this.assetManager.require("skeleton.atlas");
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
	let skeletonJson = new spine.SkeletonJson(atlasLoader);
	let skeletonData = skeletonJson.readSkeletonData(this.assetManager.require("skeleton.json"));

	// Instantiate a new skeleton based on the atlas and skeleton data.
	this._skeleton = new spine.Skeleton(skeletonData);
	this._skeleton.setToSetupPose();
	this._skeleton.updateWorldTransform("none");
	this._bounds = this._skeleton.getBoundsRect();

	// Setup an animation state with a default mix of 0.2 seconds.
	var animationStateData = new spine.AnimationStateData(this._skeleton.data);
	animationStateData.defaultMix = 0.2;
	this.animationState = new spine.AnimationState(animationStateData);

	// Set the run animation, non looping.
	this.animationState.setAnimation(0, this._anim_key, this.shoudAnimLoop());
	this.started = true;
}

SpineManager.prototype.update = function(dt) {
	
	if(!this.started){
		return;
	}

	this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
	//this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);//debug

	// Center the skeleton and resize it so it fits inside the canvas.
	this._skeleton.x = this._ctx.canvas.width / 2;
	this._skeleton.y = this._ctx.canvas.height/2;
	let scale = this._ctx.canvas.height / this._bounds.height * 0.8;
	this._skeleton.scaleX = 1;
	this._skeleton.scaleY = -1;

	// Update and apply the animation state, update the skeleton's
	// world transforms and render the skeleton.
	this.animationState.update(dt);
	this.animationState.apply(this._skeleton);
	this._skeleton.updateWorldTransform("none");
	this.skeletonRenderer.draw(this._skeleton);
	
	this._animationContext.texture.update();
}

SpineManager.prototype.updateAnimation = function(animKey, force){	
	if(this._anim_key != animKey || force){
		this._anim_key = animKey;
		this.animationState.setAnimation(0, this._anim_key, this.shoudAnimLoop());	
	}
}