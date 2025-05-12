import * as BABYLON from "babylonjs";
import * as Materials from 'babylonjs-materials';
import * as Loaders from 'babylonjs-loaders';

import Sprite_Animation_Babylon from "./Sprite_Animation_Babylon.js";
import Sprite_Screen_Animation_Babylon from "./Sprite_Screen_Animation_Babylon.js";

import BattleSceneUILayer from "./BattleSceneUILayer.js";
import BattleSceneTextLayer from "./BattleSceneTextLayer.js";
import SpriterManager from "./SpriterManager.js";
import SpineManager from "./SpineManager.js";

import DragonBonesManager from "./dragonBones/DragonBonesManager.js";

import { Spector } from 'spectorjs';

export default function BattleSceneManager(){
	this._initialized = false;
	this._isLoading = 0;
	this._animQueue = [];
	this._instanceId = 0;
	this._frameAccumulator = 0;
	this._bgWidth = 50;	
	this._defaultSpriteSize = 128;
	this._defaultShadowSize = 1;
	this._bgScrollDirection = 1;
	this._previousBgScrollDirection = 1;
	var cameraMainIdle = new BABYLON.Vector3(0, 1.15, -6.5);
	
	
	this._materialCache = {};
	
	this._activeTextureCache = {};
	
	this._instantiatedUnits = [];

	this._renderTargets = {};
	
	this._defaultPositions = {
		// "camera_root": new BABYLON.Vector3(0, 0, -5),
		"ally_main_idle": new BABYLON.Vector3(2, 0, 1),
		"ally_twin_idle": new BABYLON.Vector3(5, 0, 3),
		"enemy_main_idle": new BABYLON.Vector3(-2, 0, 1),
		"enemy_twin_idle": new BABYLON.Vector3(-5, 0, 3),
		"camera_main_idle": cameraMainIdle, //1.15
		"camera_main_intro": new BABYLON.Vector3(-6, 0.75, -7),
		"ally_support_idle": new BABYLON.Vector3(10, 0, 1),
		"ally_twin_support_idle": new BABYLON.Vector3(10, 0, 1),
		"enemy_support_idle": new BABYLON.Vector3(-10, 0, 1),
		"enemy_twin_support_idle": new BABYLON.Vector3(-10, 0, 1),
	}
	this._defaultRotations = {
		// "camera_root": new BABYLON.Vector3(0, 0, -5),
		"ally_main_idle": new BABYLON.Vector3(0, 0, 0),
		"ally_twin_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_main_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_twin_idle": new BABYLON.Vector3(0, 0, 0),
		"camera_main_idle": new BABYLON.Vector3(0, 0, 0),
		"camera_main_intro": new BABYLON.Vector3(0, 0, 0),
		"ally_support_idle": new BABYLON.Vector3(0, 0, 0),
		"ally_twin_support_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_support_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_twin_support_idle": new BABYLON.Vector3(0, 0, 0),
	}
	this._runningAnimation = false;
	this._playUntil = -1;
	this._fastForward = false;
	this._currentAnimationTick = 0;
	this._currentAnimationTickTime;
	this._lastAnimationTick = -1;
	this._lastAnimationTickTime = -1;
	this._animationTickDuration = 1000/60;
	this._animationList = [];

	this._activeAliases = {};

	this._matrixAnimations = {};
	this._matrixUpdates = {};
	this._translateAnimationCtr = 0;
	this._matrixUpdateCtr = 0;
	this._animationBlends = {};
	this._animationBlendCtr = 0;
	this._sizeAnimations = {};
	this._sizeAnimationCtr = 0;
	this._lightAnimations = {};
	this._lightAnimationCtr = 0;
	this._shakeAnimations = {};
	this._shakeAnimationCtr = 0;
	this._bgAnimations = {};
	this._animatedModelTextureInfo = [];
	this._bgAnimationCounter = 0;
	this._fadeAnimations = {};
	this._fadeAnimationCtr = 0;
	this._effekserDynParamAnimations = {};
	this._effekserDynParamAnimationCtr = 0;
	
	this._nextEffekseerUniqueId = 0;
	
	this._bgScrolls = {};
	this._bgScrollCounter = 0;
	
	this._animationDirection = 1;

	this.setBgScrollDirection(1, true);
	this._bgScrollCooldown = 60;
	this._bgScrollRatio = 1;
	this._animRatio = 1;
	this._holdTickDuration = 0;

	this._spriteManagers = {};
	this._animationSpritesInfo = [];
	this._lights = [];
	this._animationBackgroundsInfo = [];
	this._spritersBackgroundsInfo = [];
	this._spriterMainSpritesInfo = [];
	this._spineMainSpritesInfo = [];
	this._unitModelInfo = [];
	this._RMMVSpriteInfo = [];
	this._RMMVScreenSpriteInfo = [];
	this._movieBGInfo = [];
	this._dragonBonesSpriteInfo = [];
	this._effekseerInfo = [];
	this._preloadedEffekseerInfo = {};
	this._barrierEffects = [];
	this._particleSystemsDefinitions = {};
	this._activeParticleSystems = {};

	this._participantInfo = {
		"actor": {
			participating: false
		},
		"actor_twin": {
			participating: false
		},
		"actor_supporter": {
			participating: false
		},
		"actor_twin_supporter": {
			participating: false
		},
		"enemy": {
			participating: false
		},
		"enemy_twin": {
			participating: false
		},
		"enemy_supporter": {
			participating: false
		},
		"enemy_twin_supporter": {
			participating: false
		}
	};
	
	this._battleTextManager = new SRWBattleTextManager();
	
	//editor control
	this._maxAnimationTick = -1;
	
	this._shaderManagement = {
		shockWave: {
			isPlaying: false,
			targetTime: 0.9,
			currentTime: 0,
			params: [{type: "vector2", name: "iWaveCentre"}, {type: "float", name: "iIntensity"}]
		}
	}
	
	this._canvasPoolMaxSize = 20;
	this._canvasPool = [];
	
	this._debugBarriers = false;
	this._cachedBgs = {};
	this._bgLayerInfo = {};
	this._textBoxState = true;
	
	this.createVideoPlayers();

	this._shadowFloor = 0;
}

BattleSceneManager.prototype.attachSpector = function(value){
	if(!this._spectorAttached){
		this._spectorAttached = true;
		var spector = new Spector();
		spector.spyCanvases();
		spector.displayUI();	

		const style = document.createElement("style");
		
		style.textContent = `
			.captureMenuComponent {
				z-index: 99999999999999999 !important;
			}
			.resultViewComponent  {
				z-index: 99999999999999999 !important;
			}
		`;
		document.head.appendChild(style);	
	}
}

BattleSceneManager.prototype.setPlayUntil = function(value){
	this._playUntil = value;	
}

BattleSceneManager.prototype.setFastForward = function(value){
	this._fastForward = value;	
}

BattleSceneManager.prototype.createVideoPlayers = function(){
	this._videoPlayers = [];
	for(var i = 0; i < 8; i++){
		let player = document.createElement("video");
		player.isReleased = true;
		this._videoPlayers.push(player);	
	}	
}

BattleSceneManager.prototype.requestVideoPlayer = function(){
	let result;
	let ctr = 0;
	while(!result && ctr < this._videoPlayers.length){
		if(this._videoPlayers[ctr].isReleased){
			result = this._videoPlayers[ctr];
			result.isReleased = false;
		}
		ctr++;
	}
	return result;
}

BattleSceneManager.prototype.createApplicationCanvas = function(){
	let newCanvas = document.createElement("canvas");
	//if(ENGINE_SETTINGS.BATTLE_SCENE.USE_PIXELATED_CANVAS){
		newCanvas.style.imageRendering = "pixelated";
	//}	
	return newCanvas;	
}

BattleSceneManager.prototype.requestCanvas = function(){
	var canvas;
	
	var ctr = 0;
	while(!canvas && ctr < this._canvasPool.length){
		if(this._canvasPool[ctr].isReleased){
			canvas = this._canvasPool[ctr];
		}
		ctr++;
	}
	if(!canvas){
		if(this._canvasPool.length < this._canvasPoolMaxSize){
			var newCanvas = this.createApplicationCanvas();	
			newCanvas.isReleased = false;
			newCanvas.poolId = this._canvasPool.length;
			canvas = newCanvas;
			this._canvasPool.push(newCanvas);
		}
	}
	
	if(!canvas){
		throw "Canvas pool limit exceeded!";
	}
	return canvas;
}

BattleSceneManager.prototype.setExternalFPSCounter = function(elem){
	this._fpsCounter = elem;
}

BattleSceneManager.prototype.setExternalTickCounter = function(elem){
	this._tickCounter = elem;
}

BattleSceneManager.prototype.initContainer = async function(){
	this._container = document.createElement("div");
	this._container.id = "battle_scene_layer";		
	
	document.body.appendChild(this._container);
	
	this._canvas = this.createApplicationCanvas();
	this._canvas.id = "render_canvas";
	this._container.appendChild(this._canvas);
	
	/*
	this._fpsCounter = document.createElement("div");
	this._fpsCounter.id = "fps_counter";
	document.body.appendChild(this._fpsCounter);
	*/
	this._fadeContainer = document.createElement("div");
	this._fadeContainer.id = "fade_container";
	this._fadeContainer.classList.add("fade_container");
	document.body.appendChild(this._fadeContainer);
	
	this._systemFadeContainer = document.createElement("div");
	this._systemFadeContainer.id = "system_fade_container";
	this._systemFadeContainer.classList.add("fade_container");
	document.body.appendChild(this._systemFadeContainer);
	
	this._swipeContainer = document.createElement("div");
	this._swipeContainer.id = "swipe_container";
	this._swipeContainer.classList.add("fade_container");
	
	this._swipeBox = document.createElement("div");
	this._swipeBox.id = "swipe_box";
	//this._swipeBox.classList.add("");
	this._swipeContainer.appendChild(this._swipeBox);
	
	this._swipeImage = document.createElement("img");
	this._swipeImage.id = "swipe_image";
	this._swipeBox.appendChild(this._swipeImage);
	document.body.appendChild(this._swipeContainer);
	
	this._movieContainer = document.createElement("div");
	this._movieContainer.id = "battle_scene_movie_layer";	
	document.body.appendChild(this._movieContainer);
	
	this._UIcontainer = document.createElement("div");
	this._UIcontainer.id = "battle_scene_ui_layer";	
	document.body.appendChild(this._UIcontainer);		

	this._TextContainer = document.createElement("div");
	this._TextContainer.id = "battle_scene_text_layer";	
	document.body.appendChild(this._TextContainer);		
	
	this._PIXIContainer = document.createElement("div");
	this._PIXIContainer.id = "battle_scene_pixi_layer";	
	document.body.appendChild(this._PIXIContainer);
	
	
}

BattleSceneManager.prototype.loadStaticImages = async function(){
	let bitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattleScene/battleFade.png");	
	this._swipeImage.setAttribute("src", bitmap.canvas.toDataURL());
	
}

BattleSceneManager.prototype.init = function(attachControl){
	var _this = this;
	if(!this._initialized){		
		this.loadStaticImages();
		this._initialized = true;
		BABYLON.RenderingManager.MAX_RENDERINGGROUPS = 8;
		this._UILayerManager = new BattleSceneUILayer("battle_scene_ui_layer");	
		this._TextlayerManager = new BattleSceneTextLayer("battle_scene_text_layer");
		this._animationBuilder = new BattleAnimationBuilder();
		this._environmentBuilder = new BattleEnvironmentBuilder();
		
		this._attachControl = attachControl;
		if(!this._canvas){
			this._canvas = this.createApplicationCanvas();
			this._canvas.id = "render_canvas";
			this._container.appendChild(this._canvas);

		} else {
			var canvas = this.createApplicationCanvas();
			canvas.id = "render_canvas";			
			this._container.replaceChild(canvas, this._canvas);
			this._canvas = canvas;
		}	
		this._glContext = this._canvas.getContext("webgl2", { antialias: false });	
		//this._glContext.getExtension("EXT_color_buffer_float");
		//this._glContext.getExtension("EXT_color_buffer_half_float");
		//if(this._glContext.drawingBufferStorage){
			//this._glContext.drawingBufferStorage(this._glContext.RGBA16F, this._canvas.width, this._canvas.height);
		//}
		if(ENGINE_SETTINGS.BATTLE_SCENE.RENDER_WIDTH > 0){
			this._canvas.setAttribute("width", ENGINE_SETTINGS.BATTLE_SCENE.RENDER_WIDTH);
		}
		if(ENGINE_SETTINGS.BATTLE_SCENE.RENDER_HEIGHT > 0){
			this._canvas.setAttribute("height", ENGINE_SETTINGS.BATTLE_SCENE.RENDER_HEIGHT);
		}
		
		
		this._effksContext = effekseer.createContext();		
		this._effksContextMirror = effekseer.createContext();		
		this._effksContextFg = effekseer.createContext();
		this._effksContextFgMirror = effekseer.createContext();
		this._effksContextAttached = effekseer.createContext();
		
		const settings = {
			instanceMaxCount: 25000
		};
		
		this._effksContext.init(this._glContext, settings);
		this._effksContextMirror.init(this._glContext, settings);
		this._effksContextFg.init(this._glContext, settings);
		this._effksContextFgMirror.init(this._glContext, settings);
		this._effksContextAttached.init(this._glContext, settings);
		
		this._engine = new BABYLON.Engine(this._canvas, true, {preserveDrawingBuffer: true, stencil: true, antialiasing: true}); // Generate the BABYLON 3D engine	
		this._engine.getCaps().parallelShaderCompile = false;
		
		this._textureCopier = new BABYLON.CopyTextureToTexture(this._engine);
		
		//this.initShaders();
		//this.initParticleSystems();
		
		this.initScene();
		
		
		
		//this.createNativeParticleSystem("native_test", "native_test", new BABYLON.Vector3(0, 0, 0))//debug
		
		this._UILayerManager.redraw();
		this._TextlayerManager.redraw();
		//await _this.initEffekseerParticles();
		
		
	}
}

//to be called by external components that load images in the scope of the battle scene so the battle scene can clear the object urls after the scene finishes
BattleSceneManager.prototype.appendTextureCache = function(path, objURL){
	this._activeTextureCache[path] = {
		imgData: objURL
	};	
}

//TODO: figure out the impact of the use of object urls on Babylon's caching here. 
//It is possible the babylon cache is bypassed due to mismatching urls, if so verify if this is enough of a problem to try and fix.
BattleSceneManager.prototype.preloadTexture = async function(path, context){
	const _this = this;
	const bitmap = await ImageManager.loadBitmapPromise("", path, true, null, null, true);
	if(bitmap == -1){
		if(!_this._isEnvPreview){
			alert("Failed to load image from path '" + path + "' "+(context ? " For "+context : "" + "") + "\n\nYou may need to reload the game to get the battlescene to load again after fixing the missing asset.");
		}
	} else {
		let objURL = bitmap._image.src; //after loading an image through the manager with asBlob=true, the returned bitmap has an image with an Object URL src
		new BABYLON.Texture(objURL, _this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
		_this._activeTextureCache[path] = {
			imgData: objURL
		};		
	}	
}

BattleSceneManager.prototype.getCachedTexture = function(path){
	if(!this._activeTextureCache[path]){
		console.log("An uncached texture was requested("+path+"), is preloading broken?");
		return null;
	}
	return new BABYLON.Texture(this.getCachedImageData(path), this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
}

BattleSceneManager.prototype.getCachedImageData = function(path){
	if(!this._activeTextureCache[path]){
		throw "An uncached texture was requested("+path+"), is preloading broken?";
	}
	return this._activeTextureCache[path].imgData;
}

BattleSceneManager.prototype.stopEffekContext = function(ctx){
	if(ctx){
		ctx.stopAll();
	}
}

BattleSceneManager.prototype.disposeTextureCache = function(){
	if(this._activeTextureCache){
		for(let cacheKey in this._activeTextureCache){
			let objURL = this._activeTextureCache[cacheKey].imgData;
			window.URL.revokeObjectURL(objURL);
		}
	}
	this._activeTextureCache = {};
}

BattleSceneManager.prototype.disposeDynamicModels = function(){
	for(let unitModel of this._instantiatedUnits){
		unitModel.sprite.dispose();
		if(unitModel.sprite.shadowSprite){
			unitModel.sprite.shadowSprite.dispose();
		}
	}
	this._instantiatedUnits = [];
}

BattleSceneManager.prototype.disposeRenderTargets = function(){
	for(let targetId in this._renderTargets){
		const entry = this._renderTargets[targetId];
		entry.camera.dispose();
		entry.texture.dispose();
	}
	this._renderTargets = {};
}

BattleSceneManager.prototype.dispose = function(){
	function destroyCanvas(canvas){
		if(canvas){
			canvas.parentNode.removeChild(canvas);
		}		
	}
	
	destroyCanvas(this._canvas);
	destroyCanvas(this._pixiCanvas);
	destroyCanvas(this._movieCanvas);
	if(this._scene){
		this._scene.dispose();
	}	
	
	this.disposeAnimationSprites();
	this.disposeAnimationBackgrounds();
	this.disposeSpriterBackgrounds();
	this.disposeEffekseerInstances();
	this.disposeLights();
	/*this.stopEffekContext(this._effksContext);
	this.stopEffekContext(this._effksContextMirror);
	this.stopEffekContext(this._effksContextFg);
	this.stopEffekContext(this._effksContextFgMirror);
	this.stopEffekContext(this._effksContextAttached);*/
	
	
	this.disposeMovieBackgrounds();
	this.disposeRMMVBackgrounds();
	this._animationList = [];
	this.disposeTextureCache();
	this.disposeDynamicModels();
	this.disposeRenderTargets();
}

BattleSceneManager.prototype.initEffekseerParticles = async function(){
	var _this = this;	
	var promises = [];
	if (Utils.isNwjs()){
		const FILESYSTEM = require("fs"); 
		const dir = "effekseer";
		FILESYSTEM.readdirSync(dir).forEach(function(file) {
			file = dir+'/'+file;
			if(file.match(/.*\.efk$/)){
				promises.push(new Promise(function(resolve, reject){
					_this._effksContext.loadEffect(file, 1.0, resolve);	
						
				}));
				promises.push(new Promise(function(resolve, reject){
					_this._effksContext.loadEffect(file, 1.0, resolve);	
						
				}));
			}
			
		});		
	}
	await Promise.all(promises);	
}

BattleSceneManager.prototype.initShaders = function(){
	var _this = this;
	if (Utils.isNwjs()){
		const FILESYSTEM = require("fs"); 
		var path = require('path');
		var base = getBase();
		const dir = base+"shader";
		FILESYSTEM.readdirSync(dir).forEach(function(file) {
			var name = file.replace(/\.fx$/, "");
			var parts = name.split("_");
			var shaderName = parts[0];
			var shaderType = parts[1] == "fragment" ? "Fragment" : "Vertex";
			file = dir+'/'+file;
			var data = FILESYSTEM.readFileSync(file, 'utf8');		
			BABYLON.Effect.ShadersStore[shaderName+shaderType+'Shader'] = data;		
					
			_this._shaderManagement[shaderName] = {
				isPlaying: false,
				targetTime: 0.9,
				currentTime: 0,
				params: [{type: "vector2", name: "iWaveCentre"}, {type: "float", name: "iIntensity"}]
			}
		});	
	}
}

BattleSceneManager.prototype.initShader = async function(name, params){
	let _this = this;
	return new Promise(function(resolve, reject){	
		var parts = name.split("_");
		var shaderName = parts[0];
		var shaderType = parts[1] == "fragment" ? "Fragment" : "Vertex";
		var base = getBase();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', "shader/"+name+".fx");
		//xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				let data = xhr.responseText;
				BABYLON.Effect.ShadersStore[shaderName+shaderType+'Shader'] = data;		
				
				let shaderParams = [];
				if(params){
					for(var i = 0; i < 10; i++){
						if(params["shaderParam"+i]){
							var parts = params["shaderParam"+i].match(/^(.*)\:(.*)\=(.*)/);
							if(parts && parts.length >= 4){
								var type = parts[1];
								var varName = parts[2];
							
								shaderParams.push({
									type: type,
									name: varName
								});
							}
						}
					}
				} else {
					shaderParams = [{type: "vector2", name: "iWaveCentre"}, {type: "float", name: "iIntensity"}]  
				}
				
				
				_this._shaderManagement[shaderName] = {
					isPlaying: false,
					targetTime: 0.9,
					currentTime: 0,
					params: shaderParams
				}	
				
				resolve(1);					
			} else {
				resolve(-1);
			}
		};
		xhr.onerror = function(){
			resolve(-1);
		}					
		window[name] = null;
		xhr.send();		
	});
}

BattleSceneManager.prototype.initParticleSystems = function(){
	var _this = this;
	const dir = "particles";
	if (Utils.isNwjs()){
		const FILESYSTEM = require("fs"); 
		FILESYSTEM.readdirSync(dir).forEach(function(file) {
			var name = file.replace(/\.json$/, "");
			file = dir+'/'+file;
			var data = FILESYSTEM.readFileSync(file, 'utf8');		
			_this._particleSystemsDefinitions[name] = JSON.parse(data);
		});	
	}
}

BattleSceneManager.prototype.createNativeParticleSystem = function(name, refName, position){
	if(this._particleSystemsDefinitions[name]){
		var particleSystem = BABYLON.ParticleSystem.Parse(this._particleSystemsDefinitions[name], this._scene, "");
		var parent = new BABYLON.AbstractMesh(refName, this._scene);
		parent.position = new BABYLON.Vector3().copyFrom(position);
		parent.emitter = particleSystem;
		particleSystem.start();
		this._activeParticleSystems[refName] = {
			emitter: particleSystem,
			parent: parent
		};
	}    
}

BattleSceneManager.prototype.getContainer = function(tick){
	return this._container;
}

BattleSceneManager.prototype.setMaxAnimationTick = function(tick){
	this._maxAnimationTick = tick;
}

BattleSceneManager.prototype.resetMaxAnimationTick = function(tick){
	this._maxAnimationTick = -1;
}

BattleSceneManager.prototype.getBattleTextBuilder = function(){
	return this._battleTextManager.getTextBuilder();
}

BattleSceneManager.prototype.getAnimationBuilder = function(){
	return this._animationBuilder;
}	

BattleSceneManager.prototype.getEnvironmentBuilder = function(){
	return this._environmentBuilder;
}	

BattleSceneManager.prototype.getDefaultPositions = function(){
	return this._defaultPositions;
}	

BattleSceneManager.prototype.getDefaultRotations = function(){
	return this._defaultRotations;
}	

BattleSceneManager.prototype.setDebugBarriers = function(value){
	this._debugBarriers = value;
}

BattleSceneManager.prototype.initScene = function(){
	var _this = this;
	 // Create the scene space
	/*if(this._scene){
		this._scene.dispose();
		
	}*/
	this._materialCache = {};
	
	this._animsPaused = false;	
	
	
	var scene = new BABYLON.Scene(this._engine);
	this._scene = scene;
	//this._scene.performancePriority  = BABYLON.ScenePerformancePriority.Intermediate;
	
	this._scene.clearColor = new BABYLON.Color3(0, 0, 0);
	//this._scene.ambientColor = new BABYLON.Color3(0, 0, 0);
	
	//const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, 0), scene);
	
	//this._scene.renderSize = new BABYLON.Vector2(200,200); 
	//this._scene.screenSize = new BABYLON.Vector2(200,200); 

	// Add a camera to the scene and attach it to the canvas
	//var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
	this._camera = new BABYLON.FreeCamera("FreeCamera", this._defaultPositions.camera_main_idle, scene);
	this._cameraParent = _this.createBg("CameraParent", "", new BABYLON.Vector3(0,0,0), 0, 1, null, true);
	this._cameraParent.isVisible = false;
	this._camera.parent = this._cameraParent;
	
	if(this._attachControl){
		this._camera.attachControl(this._canvas, true);
		//hack to add up down controls to the camera
		document.addEventListener("keydown", function(e){
			if(e.key == "PageUp"){
				_this._camera.position.y+=1;
			}
			if(e.key == "PageDown"){
				_this._camera.position.y-=1;
			}
		});
	}
	var pipeline = new BABYLON.DefaultRenderingPipeline(
		"defaultPipeline", // The name of the pipeline
		false, // Do you want the pipeline to use HDR texture?
		this._scene, // The scene instance
		[this._camera] // The list of cameras to be attached to
	);
	
	
	
	if(ENGINE_SETTINGS.BATTLE_SCENE.FXAA_ON){
		//pipeline.fxaaEnabled = true;
		//var postProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, this._camera);
		const passProcess = new BABYLON.PassPostProcess("Scene copy",
			1.0,
			this._camera,
			0,
			this._scene.getEngine(),
			false,
			BABYLON.Engine.TEXTURETYPE_FLOAT
		);

		const fxaaPostProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, this._camera);
		//passProcess.fxaaEnabled = true;
	}
	
	/*this._lensEffects = new BABYLON.LensRenderingPipeline('lens', {
		//edge_blur: 0,
		//chromatic_aberration: 0,
		//distortion: 0,
		dof_focus_distance: 1000,
		dof_aperture: 0,			// set this very high for tilt-shift effect
		grain_texture: new BABYLON.Texture(),
		//grain_amount: 0,
		//dof_pentagon: false,
		//dof_gain: 0,
		//dof_threshold: 0,
		//dof_darken: 0
	}, this._scene, 1.0, this._camera);*/
	

	// Add lights to the scene
	_this._hemisphereLight = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	_this._hemisphereLight.groundColor = new BABYLON.Color3(1,1,1);
	_this._hemisphereLight.diffuse = new BABYLON.Color3(1,1,1);
	//var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
	
	/*var pipeline = new BABYLON.DefaultRenderingPipeline(
		"defaultPipeline", // The name of the pipeline
		false, // Do you want the pipeline to use HDR texture?
		this._scene, // The scene instance
		[this._camera] // The list of cameras to be attached to
	);
	pipeline.samples = 4;*/

	// Add and manipulate meshes in the scene
	//var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
	
	
	//_this._ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6, subdivisions: 4}, scene); //default ground
	
	this._bgs = [];
	this._fixedBgs = [];
	this._skyBgs = [];
	this._floors = [];
	
	this._bgMode = "land";
	
	this.hookBeforeRender();
	
	_this.shaderTime = 0;
    var rate = 0.01;
    scene.registerBeforeRender(function () {
        _this.shaderTime += scene.getAnimationRatio() * rate;
    });
	
	//_this.initShaderEffect("shockWave");
	/*Object.keys(_this._shaderManagement).forEach(function(shaderName){
		_this.initShaderEffect(shaderName);
	});*/
	/**/
	
	//_this.createRMMVAnimationSprite("test", null, new BABYLON.Vector3(0,0,1));
	
	//this.startScene();	
	
	//_this.createDragonBonesSprite("test", null, new BABYLON.Vector3(0,0,1));
	
	var canvas = this.createApplicationCanvas();
	//canvas.setAttribute("width", 1110);
	//canvas.setAttribute("height", 624);
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	this._pixiCanvas = canvas;
	this._PIXIContainer.innerHTML = "";
	this._PIXIContainer.appendChild(canvas);
	
	
	_this._screenSpacePixiRenderer = new PIXI.CanvasRenderer(1110, 624, {
		view: canvas,	
		transparent: true
	});
	
	var stage = new PIXI.Container();
	/*var sprite = PIXI.Sprite.from("https://i.imgur.com/1yLS2b8.jpg");
	sprite.anchor.set(0.5);
	sprite.position.set(100, 100);
	stage.addChild(sprite);*/
	
	_this._screenSpacePixiStage = stage;
	
	//this.addOverlayPIXISprite("test", 74, new BABYLON.Vector3(200,200,1), {width: 1, height: 1}, false, true, true, true);
	
	
	var canvas = this.createApplicationCanvas();
	//canvas.setAttribute("width", 1110);
	//canvas.setAttribute("height", 624);
	canvas.id = "movie_canvas";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	this._movieContainer.innerHTML = "";
	this._movieCanvas = canvas;
	this._movieContainer.appendChild(canvas);
	
	var video = document.createElement("video");
	video.id = "movie_video";
	video.style.display = "none";
	video.style.width = "100%";
	video.style.height = "100%";
	video.autoplay = true;
	//video.muted = true;
	this._movieVideo = video;
	this._movieContainer.appendChild(video);
	
	_this._bgsParent = _this.createBg(name, "", new BABYLON.Vector3(0,0,0), 0, 1, null, true);
	_this._bgsParent.isVisible = false;
		
		
	//this._engine.resize();	
	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () {
		//_this._engine.resize();
	});
	
	window.addEventListener("blur", function () {
		_this._paused = true;
	});
	
	window.addEventListener("focus", function () {
		_this._paused = false;
		_this._returnFromBlur = true;
	});
}

BattleSceneManager.prototype.initShaderEffect = function(id){
	var _this = this;
	var def = _this._shaderManagement[id];
	if(def){	
		var effectUniforms = ["iTime", "iResolution"];
		var params = def.params;
		if(params){
			params.forEach(function(paramDef){
				effectUniforms.push(paramDef.name);
			});
		}
		const postEffect = new BABYLON.PostProcess(id, id, effectUniforms, [], 1, this._camera);
		_this._shaderManagement[id].effectHandle = postEffect;
		postEffect.onApply = function (effect) {			
			_this.runShaderEffect(id, effect, postEffect);						
		};	
	}
}

BattleSceneManager.prototype.runShaderEffect = function(id, effect, postEffect){
	var _this = this;
	var params = _this._shaderManagement[id].params;
	/*if(!this._animsPaused){
		_this._shaderManagement[id].currentTime+=(_this._engine.getDeltaTime() * 0.01 * (_this.isOKHeld ? 2 : 1));	
		
	}*/
	
	console.log(_this._shaderManagement[id].currentTime);
			
	effect.setVector2('iResolution', new BABYLON.Vector2(postEffect.width, postEffect.height));
	//effect.setBool('iPlaying', true);
	effect.setFloat('iTime', _this._shaderManagement[id].currentTime);
	params.forEach(function(paramDef){
		if((paramDef.type == "vector2" || paramDef.type == "vector2_f") && paramDef.value != null){
			effect.setVector2(paramDef.name, paramDef.value);
		}
		if((paramDef.type == "vector3" || paramDef.type == "vector3_f") && paramDef.value != null){
			effect.setVector3(paramDef.name, paramDef.value);
		}
		if(paramDef.type == "float" && paramDef.value != null){
			effect.setFloat(paramDef.name, paramDef.value);
		}
	});
	if(!this._shaderManagement[id].isPlaying || _this._shaderManagement[id].currentTime > _this._shaderManagement[id].targetTime){
		//effect.setBool('iPlaying', false);
		this._camera.detachPostProcess(this._shaderManagement[id].effectHandle);
		this._shaderManagement[id].isPlaying = false;
	}
	 
}

BattleSceneManager.prototype.playShaderEffect = function(id, params, duration){
	if(this._shaderManagement[id]){
		if(this._shaderManagement[id].effectHandle){
			this._camera.detachPostProcess(this._shaderManagement[id].effectHandle);
		}
		this.initShaderEffect(id);
		this._shaderManagement[id].isPlaying = true;
		this._shaderManagement[id].currentTime = 0;
		this._shaderManagement[id].params = params;
		if(duration != null){
			this._shaderManagement[id].targetTime = duration;
		}
	}
}

BattleSceneManager.prototype.registerAnimationBlend = function(targetObj, newAnim, newAnimLoops, speed, from, to){
	const prevAnimInfo = targetObj.animationRef[targetObj.lastAnim];
	const animInfo = targetObj.animationRef[newAnim];
	
	if(animInfo){
		let from;
		let to;
		if(!from){
			from = animInfo.from;
		}
		if(!to){
			to = animInfo.to;
		}
		if(prevAnimInfo){
			//animInfo.start(animInfo._loopAnimation, 1.0, animInfo.from, animInfo.to, false); 
			//TODO: Figure out how to manage the loopAnimation flag from blender or add different method of handling loop settings
			animInfo.start(newAnimLoops, speed, animInfo.from, animInfo.to, false);
			prevAnimInfo.setWeightForAllAnimatables(1);
			animInfo.setWeightForAllAnimatables(0);
			//animInfo._speedRatio = 10;
			this._animationBlends[this._animationBlendCtr++] = {
				targetObj: targetObj,
				prevAnim: prevAnimInfo,
				nextAnim: animInfo,
				ctr: 0,
				duration: 10
			};
		} else {
			animInfo.start(newAnimLoops, speed, animInfo.from, animInfo.to, false);
		}		
	}	
}

BattleSceneManager.prototype.createBg = function(name, img, position, size, alpha, rotation, useDiffuseAlpha, billboardMode, noClamp){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	
	
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	bg.sizeInfo = {
		width: width, 
		height: height
	};
	var material = new BABYLON.StandardMaterial(name, this._scene);
	//material.alphaMode = BABYLON.Constants.ALPHA_PREMULTIPLIED;
	

	if(img){
		if(img == ""){
			//loading a null texture causes engine ready to not fire! As a workaround we load shadow.png instead
			material.diffuseTexture = new BABYLON.Texture("img/SRWBattlebacks/shadow.png", this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
		} else {
			material.diffuseTexture = this.getCachedTexture("img/SRWBattlebacks/"+img+".png");//new BABYLON.Texture(this.getCachedTexture("img/SRWBattlebacks/"+img+".png"), this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
		}
		
		material.diffuseTexture.hasAlpha = true;
		if(useDiffuseAlpha){
			material.useAlphaFromDiffuseTexture  = true;
		}		
		
		if(ENGINE_SETTINGS.BATTLE_SCENE.USE_PIXEL_BGS){
			material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;//BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;
			material.alphaCutOff = 0.5;
		} else {
			material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;//BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;
			material.alphaCutOff = 0.1;
		}		
		
		if(!noClamp){
			material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		} else {
			material.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
		}
		
		material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
		
		/*material.needDepthPrePass = true;
		material.backFaceCulling = false;*/
		
		material.opacityTexture = material.diffuseTexture;
	}
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	//material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	//material.ambientColor = new BABYLON.Color3(0, 0, 0);
	if(typeof alpha != "undefined" && alpha != -1){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	if(rotation){
		bg.rotation = rotation;
	}
	
	return bg;
}

BattleSceneManager.prototype.createSceneBg = function(name, path, position, size, alpha, billboardMode, flipX, clamp, unlit, uScale, vScale, uOffset, vOffset, renderTargetId){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	
	var material = new BABYLON.StandardMaterial(name, this._scene);
	
	
	if(renderTargetId){
		if(this._renderTargets[renderTargetId]){
			material.diffuseTexture = this._renderTargets[renderTargetId].texture;
		}
	} else {
		material.diffuseTexture = this.getCachedTexture("img/SRWBattleScene/"+path+".png");//new BABYLON.Texture(this.getCachedTexture("img/SRWBattleScene/"+path+".png"), this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
	}
	material.diffuseTexture.hasAlpha = true;
	//
	material.diffuseTexture.uScale = uScale || 1;
	material.diffuseTexture.vScale = vScale || 1;
	
	if(uOffset != null){
		material.diffuseTexture.uOffset = uOffset;	
	}
	if(vOffset != null){
		material.diffuseTexture.vOffset = vOffset;
	}	
	
	if(flipX){
		material.diffuseTexture.uScale*= -1;
		material.diffuseTexture.uOffset = material.diffuseTexture.uScale * -1;
	}
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	if(unlit){
		material.emissiveColor = new BABYLON.Color3(0, 0, 0);
		material.ambientColor = new BABYLON.Color3(0, 0, 0);	
	}
	
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
		material.useAlphaFromDiffuseTexture  = true;
	}
	
	if(material.diffuseTexture.uScale == 1){
		if(clamp){
			material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		} else {
			material.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
		}
	}
	
	if(material.diffuseTexture.vScale == 1){
		material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	}
	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	return bg;
}

BattleSceneManager.prototype.createSpriterBg = function(name, position, size, alpha, billboardMode, flipX, sourceCanvas, useAlpha, groupId, canvasWidth, canvasHeight){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	//bg.renderingGroupId = 1;
	var material = new BABYLON.StandardMaterial(name, this._scene);
	
	var dynTextureOptions;
	if(sourceCanvas){
		dynTextureOptions = sourceCanvas;
	} else {
		dynTextureOptions = {width: canvasWidth || 1000, height: canvasHeight || 1000};
	}
		
	var texture = new BABYLON.DynamicTexture("dyn_texture_"+name, dynTextureOptions, this._scene, false);//, BABYLON.Texture.NEAREST_NEAREST
	material.diffuseTexture = texture;
	material.diffuseTexture.hasAlpha = true;
	if(useAlpha){
		material.useAlphaFromDiffuseTexture  = true;
	}
	
	//material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
	
	material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	
	if(flipX){
		material.diffuseTexture.uScale = -1;
		material.diffuseTexture.uOffset = 1;
	}
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.ambientColor = new BABYLON.Color3(0, 0, 0);
	
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
	}	
	
	if(groupId){
		bg.renderingGroupId = groupId;
	}

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	
	texture.update(); //ensure the texture is marked as ready
	
	return {sprite: bg, texture: texture, size: {width: width, height: height}};
}
		
BattleSceneManager.prototype.configureSprite = function(parent, id, shadowInfo, type){	
	var _this = this;
	parent.sprite.sizeInfo = parent.size;
	var shadow; 
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_3D_SHADOW){
		shadow = this.createBg(id+"_shadow", "shadow", new BABYLON.Vector3(0, 0, 0), {width: 2 * shadowInfo.size, height: 2 * shadowInfo.size}, 1, new BABYLON.Vector3(Math.PI / 2, 0, 0), true);
	} else {
		shadow = this.createBg(id+"_shadow", "shadow", new BABYLON.Vector3(0, 0, 0), {width: 2.25 * shadowInfo.size, height: 0.5 * shadowInfo.size}, 1, new BABYLON.Vector3(0, 0, 0), true);
	}
	shadow.shadowInfo = shadowInfo;
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
		shadow.renderingGroupId = 0;
	}
	parent.sprite.shadowSprite = shadow;
	
	var referenceSize = 0;
	if(parent.sprite.spriteConfig){
		referenceSize =  parent.sprite.spriteConfig.referenceSize;
	}
	
	/*var barrier = this.createBg(id+"_barrier", "barrier", new BABYLON.Vector3(0, 0, 0), referenceSize* 1.1, 1, null, true);
	if(type == "enemy"){
		barrier.material.diffuseTexture.uScale = -1;
		barrier.material.diffuseTexture.uOffset = 1;
	}
	//barrier.renderingGroupId = 1;
	barrier.setEnabled(false);
	barrier.parent = parent.sprite.pivothelper;
	parent.sprite.barrierSprite = barrier;*/
	
	var position = new BABYLON.Vector3(0,0,0);		
	var scale =  1;
	//scale*=_this._animationDirection;
	var speed = 1;
	var rotation = new BABYLON.Vector3(0,0,0);
	if(type == "enemy"){
		rotation.y = rotation.y * 1 + Math.PI;
	}
	var info;
	var effect = _this._effksContextAttached.loadEffect("effekseer/sys_barrier.efk", 1.0, function(){
		// Play the loaded effect				
		var handle = _this._effksContextAttached.play(effect, position.x, position.y, position.z);		
		handle.setShown(false);
		handle.setSpeed(speed);
		info.handle = handle;
		handle.setRotation(rotation.x, rotation.y, rotation.z);
	});
	info = {name: id+"_barrier", effect: effect, context: _this._effksContextAttached, offset: {x: position.x, y: position.y, z: position.z-0.01}};
		
	var parentObj = parent.sprite.pivothelper;	
	info.parent = parentObj;	
	info.referenceSprite = parent;
	
	_this._barrierEffects.push(info);			
	effect.scale = 3.5;	
	
	parent.sprite.barrierInfo = info;
	
	return shadow;
}

BattleSceneManager.prototype.updateMainSprite = async function(type, name, spriteConfig, position, frameSize, flipX, shadowInfo){
	var _this = this;
	if(!_this._assetsPreloaded){
		return;
	}
	var basePath = spriteConfig.path;
	var spriteId = spriteConfig.id;
	var path;
	if(!spriteConfig){
		path = "";
	} else if(spriteConfig.type == "default"){
		path = basePath+"/"+spriteId;
	} else {
		path = basePath;
	}
	
	async function getSprite(){	
		var spriteInfo;
		var spriteParent = _this.createBg(name, "", position, 0, 1, null, true);
		spriteParent.isVisible = false;
		var pivothelper = _this.createBg(name+"_pivot", "", new BABYLON.Vector3(0, 0, 0), 0.5, 1, null, true);
		let pivotYOffset = 0;
		let pivotXOffset = 0;
		pivothelper.isVisible = false;
		pivothelper.renderingGroupId = 6;
		let xOffset = spriteConfig.xOffset;
		if(flipX){
			xOffset*=-1;
		}
		if(!spriteConfig || spriteConfig.type == "default"){
			spriteInfo = _this.createPlanarSprite(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), frameSize, flipX, spriteConfig.referenceSize);		
			spriteInfo.sprite.setPivotMatrix(BABYLON.Matrix.Translation(-0, spriteInfo.size.height/2, -0), false);
			pivotYOffset+=spriteConfig.centerYOffset;	
		} else if(spriteConfig.type == "spriter"){
			spriteInfo = _this.createSpriterSprite(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX);
			pivotYOffset+=spriteConfig.referenceSize / 2;			
		} else if(spriteConfig.type == "dragonbones"){
			spriteInfo = _this.createDragonBonesSprite(name+"_displayed", path, spriteConfig.armatureName, new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX, spriteConfig.dragonbonesWorldSize, spriteConfig.canvasDims);
			pivotYOffset+=spriteConfig.referenceSize / 2 - spriteConfig.yOffset;			
		} else if(spriteConfig.type == "spine"){
			spriteInfo = _this.createSpineSprite(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX, "main", spriteConfig.referenceSize, spriteConfig.canvasDims.width, spriteConfig.canvasDims.height);
			pivotYOffset+=spriteConfig.referenceSize / 2 - spriteConfig.yOffset;				
		} else if(spriteConfig.type == "3D"){
			spriteInfo = await _this.createUnitModel(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX, spriteConfig.animGroup, "main",  spriteConfig.scale, new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(spriteConfig.rotation || 0), 0), spriteConfig.BBHack, spriteConfig.shadowParent);
			pivotYOffset+=spriteConfig.referenceSize / 2 - spriteConfig.yOffset + spriteConfig.centerYOffset;	
			pivotXOffset+=spriteConfig.centerXOffset;
			/*if(flipX){
				spriteParent.rotation.y = -BABYLON.Tools.ToRadians(spriteConfig.rotation || 0) ;
				spriteParent.scaling = new BABYLON.Vector3(spriteConfig.scale * -1, spriteConfig.scale, spriteConfig.scale);	
			} else {
				spriteParent.rotation.y = BABYLON.Tools.ToRadians(spriteConfig.rotation || 0);	
				spriteParent.scaling = new BABYLON.Vector3(spriteConfig.scale, spriteConfig.scale, spriteConfig.scale);		
			}*/
			//_this.registerAnimationBlend(spriteInfo.sprite, "main");
			for(let animName in spriteInfo.sprite.animationRef){
				spriteInfo.sprite.animationRef[animName].stop();
			}
			const animInfo = spriteInfo.sprite.animationRef["main"];
			if(animInfo){
				animInfo.start(false, 1.0, animInfo.from, animInfo.to, false);
			}
			
			if(spriteConfig.defaultAttachments){
				for(let defaultAttachment of spriteConfig.defaultAttachments){
					_this.showAttachment(spriteInfo.sprite, defaultAttachment);
				}
			}
		} 	
		
		pivothelper.position.y+=pivotYOffset;
		pivothelper.position.x+=pivotXOffset;
		
		spriteInfo.sprite.position.y-=pivotYOffset;
			
		pivothelper.parent = spriteParent;
		spriteInfo.sprite.pivothelper = pivothelper;
		spriteInfo.sprite.spriteInfo = spriteInfo;
		spriteInfo.sprite.spriteConfig = spriteConfig;
		
		spriteInfo.sprite.parent = pivothelper;
		spriteInfo.sprite.parent_handle = spriteParent;
		
		return spriteInfo;	
	}
	
	var spriteInfo;
	if(type == "actor"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._actorSprite = await getSprite();				
		this._actorShadow = this.configureSprite(this._actorSprite, "actorShadow", shadowInfo, type);		
	} 
	if(type == "actor_twin"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorTwinSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._actorTwinSprite = await getSprite();				
		this._actorTwinShadow = this.configureSprite(this._actorTwinSprite, "actorTwinShadow", shadowInfo, type);		
	} 
	if(type == "enemy"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemySprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._enemySprite = await getSprite();
		this._enemyShadow = this.configureSprite(this._enemySprite, "enemyShadow", shadowInfo, type);
	}
	if(type == "enemy_twin"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemyTwinSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._enemyTwinSprite = await getSprite();
		this._enemyTwinShadow = this.configureSprite(this._enemyTwinSprite, "enemyTwinShadow", shadowInfo, type);
	}	
	if(type == "actor_supporter"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorSupporterSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._actorSupporterSprite = await getSprite();
		this._actorSupporterShadow = this.configureSprite(this._actorSupporterSprite, "actorSupporterShadow", shadowInfo, type);
	} 
	if(type == "actor_twin_supporter"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorTwinSupporterSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._actorTwinSupporterSprite = await getSprite();
		this._actorTwinSupporterShadow = this.configureSprite(this._actorTwinSupporterSprite, "actorTwinSupporterShadow", shadowInfo, type);
	} 
	if(type == "enemy_supporter"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemySupporterSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._enemySupporterSprite = await getSprite();
		this._enemySupporterShadow = this.configureSprite(this._enemySupporterSprite, "enemySupporterShadow", shadowInfo, type);
	}
	if(type == "enemy_twin_supporter"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemyTwinSupporterSprite;
		if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._enemyTwinSupporterSprite = await getSprite();
		this._enemyTwinSupporterShadow = this.configureSprite(this._enemyTwinSupporterSprite, "enemyTwinSupporterShadow", shadowInfo, type);
	}
}

BattleSceneManager.prototype.createSpriterSprite = function(name, path, position, flipX, animName, size, width, height){
	var dynamicBgInfo = this.createSpriterBg(name+"_spriter", position, size || 10, 1, 0, flipX, null, true, null, width, height);
	dynamicBgInfo.renderer = new SpriterManager();
	dynamicBgInfo.renderer.startAnimation(dynamicBgInfo, "img/SRWBattleScene/"+path, animName || "main");
	this._spriterMainSpritesInfo.push(dynamicBgInfo);
	return dynamicBgInfo;
}

BattleSceneManager.prototype.createSpineSprite = function(name, path, position, flipX, animName, size, width, height, useAlpha){
	var dynamicBgInfo = this.createSpriterBg(name+"_spine", position, size || 10, 1, 0, flipX, null, useAlpha, null, width, height);
	dynamicBgInfo.renderer = new SpineManager();
	dynamicBgInfo.renderer.startAnimation(dynamicBgInfo, "img/SRWBattleScene/"+path, animName || "main");
	this._spineMainSpritesInfo.push(dynamicBgInfo);
	return dynamicBgInfo;
}

BattleSceneManager.prototype.createModel = async function(name, path, position, flipX, animGroup, animName, scale, rotation, unlit){
	this._isLoading++;
	let result = await BABYLON.SceneLoader.ImportMeshAsync(null, "img/SRWBattleScene/"+path, "", this._scene);
	const root = result.meshes[0];
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
		root.renderingGroupId = 2;
	}
	this._isLoading--;
	
	let animationGroupLookup = {};
	for(let group of result.animationGroups){
		animationGroupLookup[group.name] = group;
	}
	root.animationRef = animationGroupLookup;
	
	for(let animName in root.animationRef){
		root.animationRef[animName].stop();
	}
	
	return this.prepareModel(root, name, position, flipX, animGroup, animName, scale, rotation, null, unlit);	
}

BattleSceneManager.prototype.prepareModel = function(root, name, position, flipX, animGroup, animName, scale, rotation, BBHack, unlit, shadowParent){
	const _this = this;
	scale = scale || 1;
	let directionFactor = flipX ? -1 : 1;
	root.scaling = new BABYLON.Vector3(scale * directionFactor * -1, scale, scale);
	root.defaultScale = scale;
	if(rotation){
		root.rotation =  new BABYLON.Vector3(rotation.x ,rotation.y * directionFactor, rotation.z);
	}
	root.position = position;
	
	//body is our actual player mesh
	const body = root;
	//body.parent = outer;
	body.isPickable = false; //so our raycasts dont hit ourself
	let meshGroups = {};
	
	body.getChildMeshes().forEach(m => {
		m.isPickable = false;
		
		if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
			m.renderingGroupId = 2;
		}
		/*
		if(m.id.indexOf("att_") == 0){
			m.isVisible = false;
		} else {
			if(m.material){
				let materialName = name + "__" + m.material.name;
				if(!_this._materialCache[materialName]){
					_this._materialCache[materialName] = m.material;
				}
				m.material = _this._materialCache[materialName];
			}
			
		}	*/	
		
		//m.material.backFaceCulling = true;
		//m.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
		
		
		if(m.material){
			m.material.specularColor = new BABYLON.Color3(0, 0, 0);
			if(unlit){
				m.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
				m.material.ambientColor = new BABYLON.Color3(0, 0, 0);	
			}
		}
	});
	
	let shadowParentNode;
	if(shadowParent){
		const stack = [];
		stack.push(body);
		while(stack.length){
			let current = stack.shift();
			if(current.id.indexOf(shadowParent) != -1){
				shadowParentNode = current;
			}
			
			let children = current.getChildren();
			
			let materialLeaves = {};
			for(let child of children){		
				stack.push(child);		
			}
		}
	}
		
	if(body.material){
		body.material.specularColor = new BABYLON.Color3(0, 0, 0);
		if(unlit){
			body.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
			body.material.ambientColor = new BABYLON.Color3(0, 0, 0);	
		}
	}
	
	if(BBHack){
		//merge the leaf geometry to reduce draw calls
		let stack = [];
		stack.push(body);
		
		while(stack.length){
			let current = stack.shift();
			let children = current.getChildren();
			let materialLeaves = {};
			for(let child of children){
				if(child.getChildren().length){
					stack.push(child);
				} else if(child instanceof BABYLON.Mesh && child.id.indexOf("att_") == -1 && child.id.indexOf("point_") == -1){
					let materialName = child.material.name;
					if(!materialLeaves[materialName]){
						materialLeaves[materialName] = [];
					}
					materialLeaves[materialName].push(child);
				}
			}
			for(const materialName in materialLeaves){
				let leaves = materialLeaves[materialName];
				if(leaves.length){
					let merged = BABYLON.Mesh.MergeMeshes(leaves);
					if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
						merged.renderingGroupId = 2;
					}
					merged.setParent(current);
				}				
			}
		}
	}
	
	let stack = [];
	stack.push(body);
	let attNodes = [];
	let textureAnimNodes = [];
	while(stack.length){
		let current = stack.shift();
		if(current.id.indexOf("att_") == 0){
			attNodes.push(current);
		}
		
		
		
		let animInfoRef;
		
		if(current.animInfoRef){
			current.animInfoRef.nodes.push(current);
			animInfoRef = current.animInfoRef;
		}		
		
		if(current.id.indexOf("anim_") == 0){
			const parts = current.id.split("_");
			animInfoRef = {
				animInfo: {
					frameSize: parts[1],
					lineCount: parts[2],
					columnCount: parts[3],
					delay: parts[4],
					accumulator: 0,
					currentFrame: 0,
					endFrame: parts[2] * parts[3]
				},
				nodes: []
			};
			textureAnimNodes.push(animInfoRef);
		}
		
		let children = current.getChildren();
		
		let materialLeaves = {};
		for(let child of children){		
			if(animInfoRef){
				child.animInfoRef = animInfoRef;
			}
			stack.push(child);		
		}

	}
	
	stack = attNodes;
	while(stack.length){
		let current = stack.shift();
		current.isVisible = false;
		let children = current.getChildren();
		for(let child of children){		
			stack.push(child);		
		}
	}
	
	for(let entry of textureAnimNodes){
		this._animatedModelTextureInfo.push(entry);
	}
	
	root.name = name+"_model";
	
	body.spriteConfig = {
		type: "3D",
	};
	const unitModelInfo = {
		sprite: body,
		shadowParentNode: shadowParentNode	
	};
	this._unitModelInfo.push(unitModelInfo);
	
	return unitModelInfo;
}

BattleSceneManager.prototype.createUnitModel = async function(name, path, position, flipX, animGroup, animName, scale, rotation, BBHack, shadowParent){
	let result = await BABYLON.SceneLoader.ImportMeshAsync(null, "img/SRWBattleScene/"+path, "model.glb", this._scene);
	const root = result.meshes[0];
	root.defaultScale = scale;
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
		root.renderingGroupId = 2;
	}
	
	let animationGroupLookup = {};
	for(let group of result.animationGroups){
		animationGroupLookup[group.name] = group;
	}
	
	let animationRef = {};
	const defaultAnims = ["main", "in", "out", "hurt", "dodge", "block"];
	
	for(let defaultAnim of defaultAnims){
		let animData = animationGroupLookup[defaultAnim];
		if(!animData){
			console.log("Did not find required animation '"+defaultAnim+"' while loading model:"+path);
		}
		animationRef[defaultAnim] = animData;
	}
	root.animationRef = animationGroupLookup;
	
	return this.prepareModel(root, name, position, flipX, animGroup, animName, scale, rotation, BBHack, false, shadowParent);	
}

BattleSceneManager.prototype.createDragonBonesSprite = function(name, path, armatureName, position, flipX, size, canvasDims, animName){
	if(!canvasDims){
		canvasDims = {
			width: 1000,
			height: 1000
		};
	}
	var canvas = this.requestCanvas();
	canvas.setAttribute("width", canvasDims.width);
	canvas.setAttribute("height", canvasDims.height);
	
	//document.body.appendChild(canvas);
	
	var renderer =  new PIXI.CanvasRenderer({width: canvasDims.width, height: canvasDims.height, view: canvas,  transparent: true });
	
	var dynamicBgInfo = this.createSpriterBg(name+"_dragonbones", position, size, 1, 0, flipX, canvas, true, 1);
	dynamicBgInfo.renderer = renderer;
	//dynamicBgInfo.sprite.material.useAlphaFromDiffuseTexture = true;
	
	var stage = new DragonBonesManager("img/SRWBattleScene/"+path, armatureName, animName, renderer);
	stage.start();
	
	dynamicBgInfo.stage = stage;
	
	dynamicBgInfo.canvas = canvas;
	
	this._dragonBonesSpriteInfo.push(dynamicBgInfo);
	return dynamicBgInfo;
}

BattleSceneManager.prototype.createRMMVAnimationSprite = function(name, animId, position, size, flipX, loop, noFlash, noSfx, rate, isFront){
	var canvas = this.requestCanvas();
	canvas.setAttribute("width", 1000);
	canvas.setAttribute("height", 1000);
	
	//document.body.appendChild(canvas);
	
	var renderer =  new PIXI.CanvasRenderer(1000, 1000, {view: canvas,  transparent: true });
	
	var dynamicBgInfo = this.createSpriterBg(name+"_rmmv", position, size, 1, 0, flipX, canvas, true);
	dynamicBgInfo.renderer = renderer;
	
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
		if(isFront){
			dynamicBgInfo.sprite.renderingGroupId = 3;
		} else {
			dynamicBgInfo.sprite.renderingGroupId = 1;
		}
	}	
	
	var stage = new PIXI.Container();
	var animation = $dataAnimations[animId];
	var sprite = new Sprite_Animation_Babylon();
    sprite.setup(animation, false, 0, loop, noFlash, noSfx, rate);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	
	stage.addChild(sprite);
	
	dynamicBgInfo.stage = stage;
	dynamicBgInfo.RMMVSprite = sprite;
	
	dynamicBgInfo.canvas = canvas;
	
	this._RMMVSpriteInfo.push(dynamicBgInfo);
	return dynamicBgInfo;
}

BattleSceneManager.prototype.addOverlayPIXISprite = function(name, animId, position, size, flipX, loop, noFlash, noSfx){
	var animation = $dataAnimations[animId];
	var sprite = new Sprite_Screen_Animation_Babylon();
    sprite.setup(animation, false, 0, loop, noFlash, noSfx);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.x = position.x;
	sprite.y = position.y;
	sprite.scale.x = size.width;
	if(flipX){
		sprite.scale.x*=-1;
	}
	sprite.scale.y = size.height;
	sprite._name = name+"_rmmv";
	this._screenSpacePixiStage.addChild(sprite);	
	this._RMMVScreenSpriteInfo.push({
		RMMVSprite: sprite,
		name: sprite._name
	});
}

BattleSceneManager.prototype.createPlanarSprite = function(name, path, position, frameSize, flipX, size){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = ENGINE_SETTINGS.BATTLE_SCENE.SPRITE_WORLD_SIZE || 3;
		height = ENGINE_SETTINGS.BATTLE_SCENE.SPRITE_WORLD_SIZE || 3;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	//bg.billboardMode = 7;
	
	var material = new BABYLON.StandardMaterial(name, this._scene);
	var sampleMode;
	if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
		sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
	} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
		sampleMode = BABYLON.Texture.NEAREST_NEAREST;
	}
	if(path){
		material.diffuseTexture = this.getCachedTexture("img/SRWBattleScene/"+path+".png");//new BABYLON.Texture("img/SRWBattleScene/"+path+".png", this._scene, false, true, sampleMode);
	} else {
		//loading a null texture causes engine ready to not fire! As a workaround we load shadow.png instead
		material.diffuseTexture = new BABYLON.Texture("img/SRWBattlebacks/shadow.png", this._scene, false, true, sampleMode);
	}
	
	material.diffuseTexture.hasAlpha = true;
	material.useAlphaFromDiffuseTexture  = true;	
	
	if(flipX){
		material.diffuseTexture.uScale = -1;
		material.diffuseTexture.uOffset = 1;
	}	
	
	material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
	
	material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
	material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.disableLighting = true;
	
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	return {sprite: bg, size: {width: width, height: height}};
}

BattleSceneManager.prototype.applyAnimationDirection = function(position){
	var result = new BABYLON.Vector3(position.x * this._animationDirection, position.y, position.z);
	return result;
}

BattleSceneManager.prototype.getAnimationDirection = function(){
	return this._animationDirection;
}

BattleSceneManager.prototype.getBattleTextId = function(action){
	if(action){
		if(action.ref.isActor()){
			return {id: action.ref.actorId(), mechId: action.ref.SRWStats.mech.id, type: "actor"};
		} else {
			return {id: action.ref.enemyId(), mechId: action.ref.SRWStats.mech.id, type: "enemy"};
		}
	}	
}

BattleSceneManager.prototype.setBgScrollDirection = function(direction, immediate){
	var _this = this;
	if(!_this._changingScroll && _this._previousBgScrollDirection != direction){		
		_this._previousBgScrollDirection = _this._bgScrollDirection;
		_this._bgScrollDirection = direction;
		if(immediate){
			_this._bgScrollTimer = 0;
		} else {
			_this._changingScroll = true;
			_this._bgScrollTimer = _this._bgScrollCooldown;
		}
	}	
}

BattleSceneManager.prototype.setBgScrollRatio = function(ratio, immediate){
	var _this = this;
	_this._bgScrollRatio = ratio;
	_this._targetScrollRatio = null;
}

BattleSceneManager.prototype.setAnimRatio = function(ratio, immediate){
	var _this = this;
	_this._animRatio = ratio;
	_this._targetAnimRatio = null;
}

BattleSceneManager.prototype.getTickDuration = function(){
	return this._animationTickDuration;
}

BattleSceneManager.prototype.isReady = function(){	
    if (!this._scene.isReady()) return false;

    for (let tex of this._scene.textures) {
      if (!tex.isReady()) return false;
    }

    for (let mesh of this._scene.meshes) {
      if (!mesh.isReady()) return false;
    }

    return true;  
}

BattleSceneManager.prototype.advanceTick = function(){
	if(this._animsPaused){
		this._fastForward = false;
		this._animsPaused = false;
		this._playUntil = this._currentAnimationTick + 1;
	}
}


BattleSceneManager.prototype.setWeightForAllAnimatables = function(animatables, weight, prevOrNext){
	for(let animatable of animatables){
		if(animatable.target.id.indexOf("step_") == 0){
			if(prevOrNext == "previous"){
				animatable.weight = 0;
			} else if(prevOrNext == "next"){
				animatable.weight = 1;
			}
		} else {
			animatable.weight = weight;
		}		
	}
}

BattleSceneManager.prototype.hookBeforeRender = function(){
	var _this = this;
	function scrollBg(bg, animRatio, step){
		if(bg.isInstanceRef){		
			//var deltaStep1 = (step/(1000/60)) * deltaTime;	
			//var deltaStep2 = step * _this._scene.getAnimationRatio();
			if(!_this._animsPaused){
				//_this._previousBgScrollDirection = _this._bgScrollDirection;
				var direction = _this._previousBgScrollDirection;
				
				/*bg.translate(new BABYLON.Vector3(1 * direction, 0, 0), step * animRatio, BABYLON.Space.LOCAL);
				bg.position.x = Math.floor(bg.position.x * 1000) / 1000;
				if(Math.abs(bg.originPosition.x - bg.position.x) >= (bg.sizeInfo.width || _this._bgWidth)){
					bg.position = bg.originPosition;
				}*/
				
				var texture;	
				if(bg.material){
					texture = bg.material.diffuseTexture;
				} else {
					texture = bg.texture;
				}
				if(texture){
					const refWidth = texture._texture.baseWidth;
					if(refWidth){
						const roundingStep = 1 / refWidth;
						if(texture.uOffsetAccumulator == null){
							texture.uOffsetAccumulator = texture.uOffset_ || 0;
							if(bg.scrollOffset * 1){
								texture.uOffsetAccumulator+=bg.scrollOffset * 1;
							}
						}
						texture.uOffsetAccumulator+=(step * animRatio / 100) * (100 / bg.sizeInfo.width) * -1 * direction;
						
						if(texture.uOffsetAccumulator > 1){
							texture.uOffsetAccumulator-=1;
						} else if(texture.uOffsetAccumulator < 0){
							texture.uOffsetAccumulator+=1;
						}
						//texture.uOffset_ = texture.uOffsetAccumulator;
						//bg.material.diffuseTexture.getTextureMatrix().setRowFromFloats(2, texture.uOffset_, 0, 0, 0);
						texture.uOffset = texture.uOffsetAccumulator;
					}
					
				}
			}
		}
	}
	
	function updateShadow(spriteInfo){
		if(spriteInfo){
			var shadowSprite = spriteInfo.sprite.shadowSprite;
			if(shadowSprite){		
				//shadowSprite.renderingGroupId = 4;
				//shadowSprite.material.needDepthPrePass = true;
				if(_this._useHardShadows){
					shadowSprite.material.alpha = 1;
					//shadowSprite.material.diffuseTexture.hasAlpha = false;
					shadowSprite.material.useAlphaFromDiffuseTexture  = false;
					shadowSprite.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
				} else {
					shadowSprite.material.alpha = 1;
					//shadowSprite.material.diffuseTexture.hasAlpha = true;
					shadowSprite.material.useAlphaFromDiffuseTexture  = true;
					shadowSprite.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;
				}	
				let refPosition;
				if(spriteInfo.shadowParentNode){
					refPosition = spriteInfo.shadowParentNode.getAbsolutePosition();
				} else {
					refPosition = spriteInfo.sprite.parent_handle.position;
				}
				
				shadowSprite.position.x = refPosition.x + ((shadowSprite.shadowInfo.offsetX || 0) * (shadowSprite.shadowInfo.type == "enemy" ? -1 : 1));
				shadowSprite.position.z = refPosition.z + 0.1;//(shadowSprite.shadowInfo.offsetZ || 0);
				shadowSprite.position.y = _this._shadowFloor;
				var scale = Math.max(4 - spriteInfo.sprite.parent_handle.position.y, _this._shadowFloor) / 4;
				
				shadowSprite.scaling.x = scale;
				shadowSprite.scaling.y = scale;
				shadowSprite.scaling.z = scale;
				shadowSprite.setEnabled(spriteInfo.sprite.isEnabled());
				
				if(shadowSprite.animatedVisiblity){
					shadowSprite.visibility = spriteInfo.sprite.visibility * shadowSprite.animatedVisiblity;
				}
				
			}
			
			/*if(spriteInfo.sprite.isEnabled()){
				console.log(spriteInfo.sprite.parent_handle.position.x+", "+spriteInfo.sprite.parent_handle.position.z);
			}*/
		}		
	}
//debug
	/*_this._drawCounts = {};
	
	_this._scene.registerBeforeRender(() => {        
		console.log(_this._drawCounts);
		_this._drawCounts = {};
	});*/

	
	_this._scene.registerBeforeRender(function() {
		var deltaTime = _this._engine.getDeltaTime();
		_this._effekseerWasTranslated = false;
		
		var ratio = _this.getCurrentRatio();
		ratio*=_this._animRatio;
		deltaTime*=ratio;
		if(_this._fastForward){
			deltaTime*=5;
		}
		
		if(_this._holdTickDuration > 0){
			_this._holdTickDuration-=deltaTime;
			return;
		}
		
		_this._scene.animationTimeScale = ratio;
		
		if(!_this._animsPaused){
		
			if(!_this._returnFromBlur && !_this._envCreateStall && !_this._isLoading){//do not consume the delta time reported on the first frame after returning from a blurred state or after setting up a new environment(engine is stalled during this time due to heavy load)
				_this._animTimeAccumulator+=deltaTime;
			} else {
				_this._returnFromBlur = false;
				_this._envCreateStall = false;
			}		
		} else {
			_this._scene.animationTimeScale = 0;
		}
		
		if(_this._targetAnimRatio != null){			
			let ratioDeltaTime = Date.now() - _this._animRatioTransitionStart;
			if(ratioDeltaTime > _this._animRatioDuration){
				_this._animRatio = _this._targetAnimRatio * 1;
				_this._targetAnimRatio = null;
				_this._animRatioEasingFunction = null;
			} else {
				let delta = _this._targetAnimRatio - _this._startAnimRatio;		
				let t = ratioDeltaTime / _this._animRatioDuration;
				if(_this._animRatioEasingFunction){
					t = _this._animRatioEasingFunction.ease(t);
				}
				_this._animRatio = _this._startAnimRatio * 1 + (delta * (t));
				//console.log(_this._animRatio);
			}			
		}
		
		_this._currentAnimationTick = Math.floor(_this._animTimeAccumulator / _this.getTickDuration());
		//console.log(_this._currentAnimationTick);
		
		if(_this._sceneCanEnd && !_this._playingIntro && _this._playUntil != -1 && _this._currentAnimationTick >= _this._playUntil){
			_this._playUntil = -1;
			_this.pauseAnimations();
			return;
		}
		
		var ticksSinceLastUpdate =  _this._currentAnimationTick - _this._lastAnimationTick;
		_this._ticksSinceLastUpdate = ticksSinceLastUpdate;	

		
			
		
		
		var animRatio =  _this._scene.getAnimationRatio() * ratio;
		var step = 0.04 * _this._bgScrollRatio;
		if(_this._animsPaused){
			step = 0;
		}		
		
		if(_this._targetScrollRatio != null && _this._scrollRatioDuration > 0){
			if(_this._scrollRatioCtr > 0){
				var delta = _this._targetScrollRatio - _this._bgScrollRatio;				
				step = 0.04 * ((_this._bgScrollRatio * 1) + (delta * ((_this._scrollRatioDuration - _this._scrollRatioCtr) / _this._scrollRatioDuration)));
				_this._scrollRatioCtr-=ticksSinceLastUpdate;
				if(_this._scrollRatioCtr <= 0){
					_this._bgScrollRatio = _this._targetScrollRatio * 1;
					_this._targetScrollRatio = null;
				}
			} 	
		}
		
		if(_this._changingScroll){
			if(_this._bgScrollTimer > 0){
				if(!_this._bgSpeedUp){//slowing down
					step-=(step / _this._bgScrollCooldown) * (_this._bgScrollCooldown - _this._bgScrollTimer);
				} else {//speeding up
					step-=(step / _this._bgScrollCooldown) * (_this._bgScrollTimer);
				}
				_this._bgScrollTimer-=ticksSinceLastUpdate;
			} else {
				if(_this._previousBgScrollDirection != _this._bgScrollDirection){
					_this._bgScrollTimer = _this._bgScrollCooldown;
					_this._bgSpeedUp = true;
					_this.setBgScrollRatio(1);
				} else {
					_this._bgSpeedUp = false;
					_this._changingScroll = false;
				}
				_this._previousBgScrollDirection = _this._bgScrollDirection;
			}
		} 		
	
		_this._bgs.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		_this._skyBgs.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		_this._floors.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		
		
		
		
		Input.update();
		_this.isOKHeld = Input.isPressed("ok") || Input.isLongPressed("ok") || TouchInput.isLongPressed();
		if(!_this._animsPaused && !$gameTemp.editMode){
			if((Input.isPressed("cancel") || TouchInput.isCancelled()) && _this._sceneCanEnd && !_this._sceneIsEnding){
				_this.endScene();
			}
		}		
		
		if(_this._animsPaused || (_this._maxAnimationTick != -1 && _this._currentAnimationTick >= _this._maxAnimationTick)){
			return;
		}	
		
		for(let id in _this._shaderManagement){
			if(_this._shaderManagement[id].isPlaying){
				_this._shaderManagement[id].currentTime+=deltaTime * 0.001;	
			}			
		}
		
			
		
		
		Object.keys(_this._animationBlends).forEach(function(blendId){			
			var blendInfo = _this._animationBlends[blendId];
			var targetObj = blendInfo.targetObj;
			if(targetObj){				
				var duration = blendInfo.duration * _this.getTickDuration();
				if(blendInfo.accumulator == null){
					blendInfo.accumulator = 0;
				}
				blendInfo.accumulator+=deltaTime;
				var t = blendInfo.accumulator / duration;		
				
				if(t < 1){
					//blendInfo.prevAnim.setWeightForAllAnimatables(1-t);
					//blendInfo.nextAnim.setWeightForAllAnimatables(t);

					_this.setWeightForAllAnimatables(blendInfo.prevAnim.animatables, 1-t, "previous");
					_this.setWeightForAllAnimatables(blendInfo.nextAnim.animatables, t, "next");
				} else {
					blendInfo.prevAnim.setWeightForAllAnimatables(0);
					blendInfo.prevAnim.stop()
					blendInfo.nextAnim.setWeightForAllAnimatables(1);
					
					delete _this._animationBlends[blendId];
				}	
			}
		});
		
		Object.keys(_this._sizeAnimations).forEach(function(animationId){			
			var animation = _this._sizeAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){				
				if(targetObj.pivothelper){
					targetObj = targetObj.pivothelper;
				}
				var duration = animation.duration * _this.getTickDuration();
				if(animation.accumulator == null){
					animation.accumulator = 0;
				}
				animation.accumulator+=deltaTime;
				var t = animation.accumulator / duration;	
				let refScale = (targetObj.defaultScale || 1) * 1;
				
				let xScaleFactor = 1;
				
				if(targetObj.spriteConfig?.type == "3D"){
					xScaleFactor*=-1;
				}
				
				if(targetObj.flipX){
					xScaleFactor*=targetObj.flipX;
				}
				
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}				
					
					var startSizeVector = new BABYLON.Vector3(animation.startSize * refScale, animation.startSize * refScale, animation.startSize * refScale);
					var endSizeVector = new BABYLON.Vector3(animation.endSize * refScale, animation.endSize * refScale, animation.endSize * refScale);
					var sizeVector = BABYLON.Vector3.Lerp(startSizeVector, endSizeVector, t);
					
					
					
					if(targetObj.handle){ //support for effekseer handles
						targetObj.handle.setScale(sizeVector.x, sizeVector.y, sizeVector.z);
					} else {
						targetObj.scaling.x = sizeVector.x * xScaleFactor;
						targetObj.scaling.y = sizeVector.y;
						targetObj.scaling.z = sizeVector.z;
					}					
				} else {						
					if(targetObj.handle){ //support for effekseer handles
						targetObj.handle.setScale(animation.endSize * refScale, animation.endSize * refScale, animation.endSize * refScale);
					} else {
						targetObj.scaling.x = animation.endSize * refScale * xScaleFactor;
						targetObj.scaling.y = animation.endSize * refScale;
						targetObj.scaling.z = animation.endSize * refScale;
					}
					
					if(animation.hide){
						targetObj.isVisible = false;
					}
					delete _this._sizeAnimations[animationId];
				}				
			}
		});
		
		Object.keys(_this._lightAnimations).forEach(function(animationId){			
			var animation = _this._lightAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){				
				var duration = animation.duration * _this.getTickDuration();
				if(animation.accumulator == null){
					animation.accumulator = 0;
				}
				animation.accumulator+=deltaTime;
				var t = animation.accumulator / duration;	
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}				
					
					var startVector = new BABYLON.Vector3(animation.startColor.r, animation.startColor.g, animation.startColor.b);
					var endVector = new BABYLON.Vector3(animation.endColor.r, animation.endColor.g, animation.endColor.b);
					var targetVector = BABYLON.Vector3.Lerp(startVector, endVector, t);
					
					targetObj.groundColor = new BABYLON.Color3(targetVector.x, targetVector.y, targetVector.z);	
					targetObj.diffuse = new BABYLON.Color3(targetVector.x, targetVector.y, targetVector.z);								
				} else {						
					
					targetObj.groundColor = new BABYLON.Color3(animation.endColor.r, animation.endColor.g, animation.endColor.b);	
					targetObj.diffuse = new BABYLON.Color3(animation.endColor.r, animation.endColor.g, animation.endColor.b);				
				}				
			}
		});
		
	
		
		Object.keys(_this._fadeAnimations).forEach(function(animationId){			
			var animation = _this._fadeAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){			
				var duration = animation.duration * _this.getTickDuration();
				if(animation.accumulator == null){
					animation.accumulator = 0;
				}
				animation.accumulator+=deltaTime;
				var t = animation.accumulator / duration;	
					
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}
					var startVector = new BABYLON.Vector3(animation.startFade * 1, 0, 0);
					var endVector = new BABYLON.Vector3(animation.endFade * 1, 0, 0);
					var interpVector = BABYLON.Vector3.Lerp(startVector, endVector, t);
					//console.log(interpVector);					
					
					_this.applyMutator(targetObj, (mesh) => {
						mesh.visibility = interpVector.x;
						mesh.animatedVisiblity = interpVector.x;				
					});
					
				} else {					
					_this.applyMutator(targetObj, (mesh) => {
						mesh.visibility = animation.endFade * 1;
						mesh.animatedVisiblity = animation.endFade * 1;
					});
					delete _this._fadeAnimations[animationId];
				}
			}
		});	
		
		Object.keys(_this._effekserDynParamAnimations).forEach(function(animationId){			
			var animation = _this._effekserDynParamAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj && targetObj.handle){			
				var duration = animation.duration * _this.getTickDuration();
				if(animation.accumulator == null){
					animation.accumulator = 0;
				}
				animation.accumulator+=deltaTime;
				var t = animation.accumulator / duration;	
					
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}
					var startVector = new BABYLON.Vector3(animation.startValue * 1, 0, 0);
					var endVector = new BABYLON.Vector3(animation.endValue * 1, 0, 0);
					var interpVector = BABYLON.Vector3.Lerp(startVector, endVector, t);
					//console.log(interpVector);					
					
					targetObj.handle.setDynamicInput(animation.inputId, interpVector.x);
					
				} else {					
					targetObj.handle.setDynamicInput(animation.inputId, animation.endValue * 1);
					delete _this._effekserDynParamAnimations[animationId];
				}
			}
		});
		
		
		Object.keys(_this._bgAnimations).forEach(function(animationId){			
			var animation = _this._bgAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){
				var texture;	
				if(targetObj.material){
					texture = targetObj.material.diffuseTexture;
				} else {
					texture = targetObj.texture;
				}
				if(texture){			
					var deltaFrames = 0;
					animation.accumulator+=deltaTime;
					while(animation.accumulator - animation.delay >= 0){
						animation.accumulator-=animation.delay;
						deltaFrames++;
					}
					
					animation.currentFrame+=deltaFrames;
					
					
					animation.lastTick = _this._currentAnimationTick;
					if(animation.flipX){
						texture.uScale = -1 / animation.columnCount;
					} else {
						texture.uScale = 1 / animation.columnCount;
					}
					texture.vScale = 1 / animation.lineCount;
					if(animation.currentFrame >= animation.endFrame){
						if(animation.loop){ 
							//console.log("loop to " +  (animation.loop - 1));
							animation.currentFrame = animation.loop - 1;
							animation.startTick = _this._currentAnimationTick;
						} else if(animation.holdFrame){
							delete _this._bgAnimations[animationId];
						} else {
							targetObj.dispose();
							delete _this._bgAnimations[animationId];
						}							
					}					
					
					if(_this._bgAnimations[animationId]){
						var col = animation.currentFrame % animation.columnCount;
						
						var row = Math.floor(animation.currentFrame / animation.columnCount);
						//console.log("col: " + col + ", " + "row:" + row);
												
						if(animation.flipX){
							texture.uOffset = ((col + 1) * (1 / (animation.columnCount)));
						} else {
							texture.uOffset = (col * (1 / (animation.columnCount)));
						}						
						
						texture.vOffset = (1 - 1 / (animation.lineCount)) - (row * (1 / (animation.lineCount)));					
					}					
				}	
			}
		});	
		
		for(let entry of _this._animatedModelTextureInfo){
			const animation = entry.animInfo;
			for(let node of entry.nodes){
				if(node){
					var texture;	
					if(node.material){
						if(node.material.diffuseTexture){
							texture = node.material.diffuseTexture;
						} else if(node.material.albedoTexture){
							texture = node.material.albedoTexture;
						}
					} else {
						texture = node.texture;
					}
					if(texture){			
						var deltaFrames = 0;
						animation.accumulator+=deltaTime;
						while(animation.accumulator - animation.delay >= 0){
							animation.accumulator-=animation.delay;
							deltaFrames++;
						}
						
						animation.currentFrame+=deltaFrames;
						
						
						animation.lastTick = _this._currentAnimationTick;
									
						if(animation.currentFrame >= animation.endFrame){							
							//console.log("loop to " +  (animation.loop - 1));
							animation.currentFrame = 0;
							animation.startTick = _this._currentAnimationTick;													
						}			

						
						
						
						
						const uSize = 1 / (texture._texture.width / animation.frameSize);	
						const vSize = 1 / (texture._texture.height / animation.frameSize);
					
						var col = animation.currentFrame % animation.columnCount;						
						var row = Math.floor(animation.currentFrame / animation.columnCount);
						//console.log("col: " + col + ", " + "row:" + row);
						if(!texture.defaultOffsets){
							texture.defaultOffsets = {
								u: texture.uOffset,
								v: texture.vOffset
							};
						}		
					
						texture.uOffset = (texture.defaultOffsets.u * uSize) + (col * uSize);								
						texture.vOffset = (texture.defaultOffsets.v * vSize) + (row * vSize);					
											
					}	
				}
			}
		}
		
		Object.keys(_this._bgScrolls).forEach(function(targetName){
			var animInfo = _this._bgScrolls[targetName];
			let speed = 0;
			if(!animInfo.next){
				speed = animInfo.current.speed;
			} else {
				let currentSpeed = animInfo.current.speed;
				let targetSpeed = animInfo.next.speed;
				
				var duration = animInfo.next.duration * _this.getTickDuration();
				if(animInfo.next.accumulator == null){
					animInfo.next.accumulator = 0;
				}
				animInfo.next.accumulator+=deltaTime;
				var t = animInfo.next.accumulator / duration;
				
				if(t < 1){
					if(animInfo.easingFunction){
						t = animInfo.easingFunction.ease(t);
					}
					var startVector = new BABYLON.Vector3(currentSpeed * 1, 0, 0);
					var endVector = new BABYLON.Vector3(targetSpeed * 1, 0, 0);
					var interpVector = BABYLON.Vector3.Lerp(startVector, endVector, t);
					//console.log(interpVector);					
					
					speed = interpVector.x;
					
				} else {					
					animInfo.current = animInfo.next;
					delete animInfo.next;
					speed = animInfo.current.speed;
				}
				
			}
			var targetObj = animInfo.targetObj;
			if(targetObj){
				var texture;	
				if(targetObj.material){
					texture = targetObj.material.diffuseTexture;
				} else {
					texture = targetObj.texture;
				}
				if(texture){
					texture.uOffset+=(speed / 1000);
					if(texture.uOffset > 1){
						texture.uOffset-=1;
					} else if(texture.uOffset < 0){
						texture.uOffset+=1;
					}
				}
			}
		});
		
		
		updateShadow(_this._actorSprite);
		updateShadow(_this._enemySprite);	
		updateShadow(_this._actorSupporterSprite);	
		updateShadow(_this._enemySupporterSprite);
		updateShadow(_this._actorTwinSprite);
		updateShadow(_this._enemyTwinSprite);
		updateShadow(_this._actorTwinSupporterSprite);
		updateShadow(_this._enemyTwinSupporterSprite);

		if(_this._instantiatedUnits){
			for(let unit of _this._instantiatedUnits){
				updateShadow(unit);
			}
		}
		
	});
}

BattleSceneManager.prototype.setBgAnimationFrame = function(animation){
	
}

BattleSceneManager.prototype.disposeAnimationSprites = function(){
	this._animationSpritesInfo.forEach(function(spriteInfo){
		spriteInfo.sprite.dispose();
	});
	this._animationSpritesInfo = [];
}

BattleSceneManager.prototype.disposeLights = function(){
	this._lights.forEach(function(light){
		light.dispose();
	});
	this._lights = [];
}

BattleSceneManager.prototype.disposeAnimationBackgrounds = function(){
	this._animationBackgroundsInfo.forEach(function(bg){
		bg.dispose();
	});
	this._animationBackgroundsInfo = [];
}

BattleSceneManager.prototype.disposeEffekseerInstances = function(preserveSysEffects){
	const tmp = []
	this._effekseerInfo.forEach(function(effekInfo){
		if(!effekInfo.isSysEffect || !preserveSysEffects){
			if(effekInfo.handle){
				effekInfo.handle.stop();
				effekInfo.context.releaseEffect(effekInfo.effect);
				effekInfo.context.activeCount = 0;
			}
		} else {
			tmp.push(effekInfo);
		}		
	});
	this._effekseerInfo = tmp;	
	
	this.stopEffekContext(this._effksContext);
	this.stopEffekContext(this._effksContextMirror);
	this.stopEffekContext(this._effksContextFg);
	this.stopEffekContext(this._effksContextFgMirror);
	this.stopEffekContext(this._effksContextAttached);
}

BattleSceneManager.prototype.disposeBarrierEffects = function(){
	this._barrierEffects.forEach(function(effekInfo){
		if(effekInfo.handle){
			effekInfo.handle.stop();
		}		
	});
	this._barrierEffects = [];
}

BattleSceneManager.prototype.disposeRMMVBackgrounds = function(){
	this._RMMVSpriteInfo.forEach(function(bg){
		bg.sprite.dispose();
		bg.canvas.isReleased = true;
	});
	this._RMMVSpriteInfo = [];
}

BattleSceneManager.prototype.disposeMovieBackgrounds = function(){
	const _this = this;
	this._movieBGInfo.forEach(function(bg){
		bg.sprite.dispose();
		bg.canvas.isReleased = true;
		bg.video.isReleased = true;
	});
	this._movieBGInfo = [];
}

BattleSceneManager.prototype.disposeSpriterBackgrounds = function(){
	this._spritersBackgroundsInfo.forEach(function(bg){
		bg.sprite.dispose();
	});
	this._spritersBackgroundsInfo = [];
	
	this._spriterMainSpritesInfo.forEach(function(bg){
		bg.sprite.dispose();
	});	
	
	this._spineMainSpritesInfo.forEach(function(bg){
		bg.sprite.dispose();
	});	
	
	this._unitModelInfo.forEach(function(bg){
		bg.sprite.dispose();
	});	
	this._unitModelInfo = [];
	
	this._dragonBonesSpriteInfo.forEach(function(bg){
		bg.sprite.dispose();
		bg.stage.destroy({children:true, texture:true, baseTexture:true});
		bg.canvas.isReleased = true;
	});
	
	//this._spriterMainSpritesInfo = [];	
}

BattleSceneManager.prototype.updateParentedEffekseerEffect = function(effekInfo){
	if(effekInfo.parent && effekInfo.handle){
				
		var scale = new BABYLON.Vector3(0, 0, 0);
		var rotation = new BABYLON.Quaternion();
		var position = new BABYLON.Vector3(0,0,0);
		
		
		var tempWorldMatrix = effekInfo.parent.computeWorldMatrix(true);
		tempWorldMatrix.decompose(scale, rotation, position);
		
		rotation = rotation.toEulerAngles();
		
		//console.log("sys rotation: " + effekInfo.parent.rotation.x + ", " + effekInfo.parent.rotation.y + ", " + effekInfo.parent.rotation.z + " VS " + "calc rotation: " + rotation.x + ", " + rotation.y + ", " + rotation.z);
		
		/*var position; 
		if(effekInfo.parent.getAbsolutePosition){
			position = effekInfo.parent.getAbsolutePosition();
		} else {
			position = effekInfo.parent.position;
		}
		
		var rotation = effekInfo.parent.absoluteRotationQuaternion().toEulerAngles();*/
		
		
		
		let mirrorFactor = 1;
		if(effekInfo.isMirrored){
			mirrorFactor = -1;
		}	
		effekInfo.handle.setLocation(
			position.x * mirrorFactor + effekInfo.offset.x, 
			position.y + effekInfo.offset.y, 
			position.z + effekInfo.offset.z
		);
		if(!effekInfo.ignoreParentRotation){
			effekInfo.handle.setRotation(
				(rotation.x + effekInfo.offsetRotation.x), 
				(rotation.y + effekInfo.offsetRotation.y), 
				(rotation.z + effekInfo.offsetRotation.z) * mirrorFactor
			);
		}
		
		
		this._effekseerWasTranslated = true;
	}
}

BattleSceneManager.prototype.getCurrentRatio = function(){
	let ratio = 1;
	
	let isSpeedUp = this.isOKHeld;
	if(this._doingSwipAnim && this._lockedSwipeState != null){
		isSpeedUp = this._lockedSwipeState;
	}
	
	if(isSpeedUp){
		ratio = 2;
	}	
		
	return ratio;
}


BattleSceneManager.prototype.runAnimations = function(deltaTime){
	const _this = this;
	
	Object.keys(_this._matrixUpdates).forEach(function(animationId){
		var animation = _this._matrixUpdates[animationId];
		var targetObj = animation.targetObj;
		if(targetObj){
			if(animation.type == "translate" || animation.type == "translate_relative" || animation.type == "translate_effek"){
				targetObj.position = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
				targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
			} else {
				targetObj.rotation = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
			}
			
			if(targetObj.handle){ //support for effekseer handles
				if(targetObj.position){
					targetObj.handle.setLocation(targetObj.position.x, targetObj.position.y, targetObj.position.z);
				}
				if(targetObj.rotation){
					//targetObj.handle.setRotation(targetObj.rotation.x, targetObj.rotation.y, targetObj.rotation.z);
					//targetObj.offsetRotation = {x: targetObj.rotation.x, y: targetObj.rotation.y, z: targetObj.rotation.z};
					
					if(targetObj.parent && !targetObj.ignoreParentRotation){			
						targetObj.offsetRotation = {x: targetObj.rotation.x, y: targetObj.rotation.y, z: targetObj.rotation.z};
					} else {
						targetObj.handle.setRotation(targetObj.rotation.x, targetObj.rotation.y, targetObj.rotation.z);
					}	
				}
				_this._effekseerWasTranslated = true;
			}	
		}
	});		
	_this._matrixUpdates = {};
	
	Object.keys(_this._matrixAnimations).forEach(function(animationId){			
		var animation = _this._matrixAnimations[animationId];
		var targetObj = animation.targetObj;
		if(targetObj){				
		
			if(animation.type == "translate_relative"){
				if(!animation.startPointSet){
					let directionFactor = _this._animationDirection;
					if(targetObj.handle){
						directionFactor = 1;//do not convert relative motions for effekseer handlers as mirrored instance there are handled through a mirrored renderer
					}	
					
					animation.startPointSet = true;
					animation.startPosition = new BABYLON.Vector3(targetObj.position.x, targetObj.position.y, targetObj.position.z);				
					animation.endPosition.x =animation.startPosition.x + (animation.endPosition.x * directionFactor);
					animation.endPosition.y+=animation.startPosition.y;
					animation.endPosition.z+=animation.startPosition.z;
				}				
			}
		
			var duration = animation.duration * _this.getTickDuration();
			if(animation.accumulator == null){
				animation.accumulator = 0;
			}
			animation.accumulator+=deltaTime;
			var t = animation.accumulator / duration;		
			
			if(t < 1){
				if(animation.easingFunction){
					t = animation.easingFunction.ease(t);
				}					
				if(animation.type == "translate" || animation.type == "translate_relative" || animation.type == "translate_effek"){
					var hasValidSpline = false;
					if(animation.catmullRom){
						var pos1 = new BABYLON.Vector3(animation.catmullRom.pos1.x, animation.catmullRom.pos1.y, animation.catmullRom.pos1.z);
						var pos4 =  new BABYLON.Vector3(animation.catmullRom.pos4.x, animation.catmullRom.pos4.y, animation.catmullRom.pos4.z);
						
						var pos1Valid = pos1 && pos1.x != "" && pos1.y != "" && pos1.z != "";
						var pos4Valid = pos4 && pos4.x != "" && pos4.y != "" && pos4.z != "";
						
						if(pos1Valid && pos4Valid){
							pos1.x*=_this._animationDirection;
							pos4.x*=_this._animationDirection;
							hasValidSpline = true;
							targetObj.position = BABYLON.Vector3.CatmullRom(pos1, animation.startPosition, animation.endPosition, pos4, t);
						}
					} 

					if(!hasValidSpline){
						targetObj.position = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, t);
					}						
					targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
				} else {
					targetObj.rotation = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, t);
				}
				
			} else {
				if(animation.type == "translate" || animation.type == "translate_relative" || animation.type == "translate_effek"){
					targetObj.position = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
					targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
				} else {
					targetObj.rotation = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
				}
				if(animation.hide){
					targetObj.isVisible = false;
				}
				delete _this._matrixAnimations[animationId];
			}	
			if(targetObj.handle){ //support for effekseer handles
				if(targetObj.position){
					targetObj.handle.setLocation(targetObj.position.x, targetObj.position.y, targetObj.position.z);
				}
				if(targetObj.rotation){
					//targetObj.handle.setRotation(targetObj.rotation.x, targetObj.rotation.y, targetObj.rotation.z);
					//targetObj.offsetRotation = {x: targetObj.rotation.x, y: targetObj.rotation.y, z: targetObj.rotation.z};
					
					if(targetObj.parent && !targetObj.ignoreParentRotation){			
						targetObj.offsetRotation = {x: params.rotation.x, y: params.rotation.y, z: params.rotation.z};
					} else {
						targetObj.handle.setRotation(targetObj.rotation.x, targetObj.rotation.y, targetObj.rotation.z);
					}	
				}
				_this._effekseerWasTranslated = true;
			}	
		}
	});	
	
		
	Object.keys(_this._shakeAnimations).forEach(function(animationId){			
		var animation = _this._shakeAnimations[animationId];
		var targetObj = animation.targetObj;
		if(targetObj){			
			var currentTick = _this._currentAnimationTick - animation.startTick;
			var duration = animation.duration * _this.getTickDuration();
			if(animation.accumulator == null){
				animation.accumulator = 0;
			}
			animation.accumulator+=deltaTime;
			var t = animation.accumulator / duration;	
			if(t <= 1){
				//targetObj.position.x = targetObj.realPosition.x + (Math.random() * animation.magnitude_x * 2) - animation.magnitude_x;		
				//targetObj.position.y = targetObj.realPosition.y + (Math.random() * animation.magnitude_y * 2) - animation.magnitude_y;	
				var fade = 1;
				if(currentTick < animation.fadeInTicks){
					fade = currentTick / animation.fadeInTicks;
				} else if(currentTick > (animation.duration - animation.fadeOutTicks)){
					fade = (animation.duration - currentTick) / animation.fadeOutTicks;
				}

				const variance = 1 + (Math.sin((animation.speed_variance || 0) * currentTick) * (animation.magnitude_variance || 0) / 10);
				
				targetObj.position.x = targetObj.realPosition.x + Math.sin(currentTick * animation.speed_x) * animation.magnitude_x / 10 * fade * variance;		
				targetObj.position.y = targetObj.realPosition.y + Math.sin(currentTick * animation.speed_y) * animation.magnitude_y / 10 * fade * variance;
				targetObj.position.z = targetObj.realPosition.z + Math.sin(currentTick * animation.speed_z) * animation.magnitude_z / 10 * fade * variance;						
			} else {
				targetObj.position = targetObj.realPosition;
				delete _this._shakeAnimations[animationId];
			}
		}
	});	
}
BattleSceneManager.prototype.startScene = function(){
	var _this = this;
	//_this.initScene();
	
	this._isLoading = 0;
	Input.clear();
	this._container.style.display = "block";
	this._engine._deltaTime = 0;

	// Register a render loop to repeatedly render the scene
	this._engine.stopRenderLoop();
	this._scene.render();
	this._frame = 0;
	
	
	this._scene.onAfterAnimationsObservable.add(() => {
		
		if(_this._holdTickDuration > 0){
			return;
		}
		
		var deltaTime = _this._engine.getDeltaTime();
		
		
		
		var ratio = _this.getCurrentRatio();
		ratio*=_this._animRatio;
		deltaTime*=ratio;
		if(_this._fastForward){
			deltaTime*=5;
		}
		
		var ticksSinceLastUpdate =  _this._currentAnimationTick - _this._lastAnimationTick;
		_this._ticksSinceLastUpdate = ticksSinceLastUpdate;			
		if(_this._runningAnimation && !_this._animsPaused){
			
			if(ticksSinceLastUpdate >= 1 && !_this._isLoading){	
				//_this._animTimeAccumulator = 0;
				//console.log(ticksSinceLastUpdate);
				if(_this.isOKHeld){
					ticksSinceLastUpdate*=2;
				}
				//_this._currentAnimationTick+=ticksSinceLastUpdate;			
				
				
				for(var i = 0; i <=_this._currentAnimationTick; i++){					
					if(_this._animationList[i]){
						let current = _this._animationList[i];
						_this._animationList[i] = null;
						for(var j = 0; j < current.length; j++){
							//_this.executeAnimation(_this._animationList[i][j], i);
							_this._animQueue.push({
								def: current[j],
								tick: i
							});
						}
					}
				}
				let command = _this._animQueue.shift();
				while(command){
					_this.executeAnimation(command.def, command.tick);
					command = null;
					if(!_this._isLoading){
						command = _this._animQueue.shift();
					}
				}
				
					
				_this._lastAnimationTick = _this._currentAnimationTick;
				/*if(_this._isLoading){
					return;
				}*/
				//_this._lastAnimationTickTime = frameTime;
				
				if(_this._currentAnimationTick > _this._animationList.length){
					if(_this._supportDefenderActive){
						_this._supportDefenderActive = false;
						_this._animationList[_this._currentAnimationTick  + 50] = [
							{type: "set_sprite_frame", target: "active_support_defender", params: {name: "out"}},
							{type: "translate", target: "active_support_defender", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-10, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
						];	
						_this._animationList[_this._currentAnimationTick  + 60] = [
							{type: "set_sprite_frame", target: "active_target", params: {name: "in"}},
							{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
							{type: "disable_support_defender", target: "", params: {}},
						];
						
						_this._animationList[_this._currentAnimationTick  + 90] = [
							{type: "set_sprite_frame", target: "active_target", params: {name: "main"}},
							{type: "set_sprite_frame", target: "active_support_defender", params: {name: "main"}},
						];
						_this._animationList[_this._currentAnimationTick  + 100] = []; //padding
					} else if(_this._doubleImageActive){
						_this._doubleImageActive = false;
						_this._animationList[_this._currentAnimationTick  + 50] = [
							{type: "show_sprite", target: "active_target"},
							{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
						];	
						_this._animationList[_this._currentAnimationTick  + 100] = []; //padding
					} else {
						if(!_this._awaitingText){
							_this._runningAnimation = false;
							_this.disposeAnimationSprites();
							_this.disposeAnimationBackgrounds();
							_this.disposeEffekseerInstances(true);
							_this.disposeLights();
							//_this.disposeSpriterBackgrounds();
							_this.disposeRMMVBackgrounds();
							_this.disposeMovieBackgrounds();
							_this._textProviderOverride = null;
							_this._animationResolve();
						}						
					}					
				} 
			}
		}	
		
		
		
		
		if(!_this._animsPaused){			
			this.runAnimations(deltaTime);
			
			this._effekseerInfo.forEach(function(effekInfo){
				_this.updateParentedEffekseerEffect(effekInfo)				
			});
		}	
		
		for(let info of this._effekseerInfo){
			if(!info.context.updateStarted){
				info.context.updateStarted = true;
				info.context.beginUpdate();
			}			
		}		
		
		_this._effekseerWasTranslated = false;
		//do a 0 speed update to rerender the effect at the new location without progressing the animation
		for(let info of this._effekseerInfo){
			info.context.updateHandle(info.handle, 0);
		}

		for(let info of this._effekseerInfo){
			//force reapply active triggers because sometimes they get lost during the update process
			if(info.handle.activeTriggers){
				for(let trigger of info.handle.activeTriggers){
					info.handle.sendTrigger(trigger);
				}
			}
			if(info.context.updateStarted){
				info.context.updateStarted = false;
				info.context.endUpdate();
			}
		}
			
		
		if(!_this._animsPaused){
			_this._effksContext.update(60 / _this._engine.getFps() * ratio);
			_this._effksContextMirror.update(60 / _this._engine.getFps() * ratio);
			_this._effksContextFg.update(60 / _this._engine.getFps() * ratio);				
			_this._effksContextFgMirror.update(60 / _this._engine.getFps() * ratio);	
			_this._effksContextAttached.update();	
		}
		
	});
	this._scene.onBeforeRenderObservable.add(() => {
		var ratio = _this.getCurrentRatio();
		ratio*=_this._animRatio;
		
		let checkedObjects = ["active_main", "active_twin", "active_target"];
		for(let obj of checkedObjects){
			let parentObj = _this.getTargetObject(obj);
			if(parentObj){
				let barrierObj = _this.getTargetObject(obj+"sys_barrier");
				if(barrierObj){
					barrierObj.handle.setShown(parentObj.isEnabled());					
				}
			}
		}		
		_this._effekseerLayerRendered = {
			bg: false,
			fg: false
		};
		//console.log("_effksContext.update");

	});
	
	//render the effekseer layer once per frame
	function renderEffekseerLayer(layerId){
		if(!_this._effekseerLayerRendered[layerId]){
			
			let targetContext;
			let targetContextMirror;
			
			if(layerId == "bg"){
				targetContext = _this._effksContext;
				targetContextMirror = _this._effksContextMirror;
			} else if(layerId == "fg"){
				targetContext = _this._effksContextFg;
				targetContextMirror = _this._effksContextFgMirror;
			}
			
			_this._effekseerLayerRendered[layerId] = true;
		
			let projectionMatrix = new BABYLON.Matrix().copyFrom(_this._camera.getProjectionMatrix()).m;
			targetContext.setProjectionMatrix(projectionMatrix);
			let worldMatrix = new BABYLON.Matrix().copyFrom(BABYLON.Matrix.Invert(_this._camera.getWorldMatrix())).m;		
			targetContext.setCameraMatrix(worldMatrix);
		
			targetContext.draw();
			
			
			
			projectionMatrix = new BABYLON.Matrix().copyFrom(_this._camera.getProjectionMatrix()).m;
			//projectionMatrix[0]*=-1;
			targetContextMirror.setProjectionMatrix(projectionMatrix);
			
			worldMatrix = new BABYLON.Matrix().copyFrom(BABYLON.Matrix.Invert(_this._camera.getWorldMatrix())).m;
			worldMatrix[0]*=-1;
			worldMatrix[1]*=-1;
			worldMatrix[2]*=-1;
			//worldMatrix[3]*=-1;
			targetContextMirror.setCameraMatrix(worldMatrix);		
			targetContextMirror.draw();		
				
			
			if(layerId == "bg"){
				//TODO: handle this in a less hacky way
				_this._effksContextAttached.setProjectionMatrix(_this._camera.getProjectionMatrix().m);
				_this._effksContextAttached.setCameraMatrix(BABYLON.Matrix.Invert(_this._camera.getWorldMatrix()).m);
				_this._effksContextAttached.draw();
			}			
		}
	}
	
	
	//foreground layer
	this._scene.onAfterDrawPhaseObservable.add(() => {//onAfterRenderObservable 
		renderEffekseerLayer("bg"); //if it was not rendered during render group handling, render it after drawing is completed
		renderEffekseerLayer("fg");
	});
	
	//background layer
	this._scene.onAfterRenderingGroupObservable.add((info) => {//onAfterRenderObservable 		
		/*if(info.renderingGroupId == 2){
			renderEffekseerLayer("bg"); //render it after group 2 was rendered
		}
		if(info.renderingGroupId == 4){
			renderEffekseerLayer("fg");
		}*/
	});
	
	this._scene.onBeforeRenderingGroupObservable.add((info) => {//onAfterRenderObservable
		if(info.renderingGroupId > 2){
			renderEffekseerLayer("bg"); //render it before any higher group is handled(if no group 2 observables fired)
		}
		if(info.renderingGroupId > 4){
			renderEffekseerLayer("fg");
		}
	});
		
	this._engine.runRenderLoop(function () {
		if(_this._fpsCounter){
			_this._fpsCounter.innerHTML = _this._engine.getFps().toFixed() + " fps";
		}
		
		if(_this._tickCounter){
			_this._tickCounter.innerHTML = "tick "+_this._currentAnimationTick;
		}
		
		_this._scene.render();
		_this._engine.wipeCaches(true);
		var ratio = _this.getCurrentRatio();
		ratio*=_this._animRatio;
		
		if(_this._moviePlayback){
			if(_this._moviePlayback.hasEnded){
				_this._movieContainer.style.display = "";
			} else {
				if(_this._moviePlayback.fadeIn > 0 && _this._moviePlayback.fadeCtr < _this._moviePlayback.fadeIn){
					_this._movieContainer.style.opacity = _this._moviePlayback.fadeCtr / _this._moviePlayback.fadeIn;
					_this._moviePlayback.fadeCtr++;
				} else {
					_this._movieContainer.style.opacity = 1;
				}
				_this._movieContainer.style.display = "block";
				var canvas = _this._movieCanvas;
				var rect = _this._movieContainer.getBoundingClientRect();
				canvas.width = rect.width;
				canvas.height = rect.height;
				var video = _this._movieVideo;
				video.playbackRate = ratio;
				if(_this._animsPaused){
					video.playbackRate = 0;
				}
				canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, rect.width, rect.height);
			}
		}
		
		var tmp = [];
		_this._spriterMainSpritesInfo.forEach(function(spriterBg){
			if(!spriterBg.sprite.isDisposed()){
				if(!_this._animsPaused){
					spriterBg.renderer.update(_this._engine.getDeltaTime());	
				}
				tmp.push(spriterBg);
			}			
		});
		_this._spriterMainSpritesInfo = tmp;	
		
		var tmp = [];
		_this._spineMainSpritesInfo.forEach(function(spriterBg){
			if(!spriterBg.sprite.isDisposed()){
				if(!_this._animsPaused){
					spriterBg.renderer.update(_this._engine.getDeltaTime() / 1000 * ratio);	
				}
				tmp.push(spriterBg);
			}			
		});
		_this._spineMainSpritesInfo = tmp;		
		

		var tmp = [];
		_this._RMMVSpriteInfo.forEach(function(RMMVBg){
			if(!RMMVBg.sprite.isDisposed()){
				if(!_this._animsPaused){
					RMMVBg.RMMVSprite.update(_this._engine.getDeltaTime() * ratio);
				}
				RMMVBg.renderer.render(RMMVBg.stage);	
				RMMVBg.texture.update();
				tmp.push(RMMVBg);
			}			
		});
		_this._RMMVSpriteInfo = tmp;
		
		var tmp = [];
		_this._movieBGInfo.forEach(function(movieBG){
			if(!movieBG.sprite.isDisposed() && !movieBG.video.completed){

				const canvas = movieBG.canvas;
				var video = movieBG.video;
				
				if(_this._animsPaused){
					video.playbackRate = 0;
				} else {
					video.playbackRate = ratio;
				}
				
				canvas.getContext('2d', { alpha: true }).drawImage(video, 0, 0, canvas.width, canvas.height);
				
				movieBG.texture.update();
				tmp.push(movieBG);
			}			
		});
		_this._movieBGInfo = tmp;
		
		var tmp = [];
		_this._RMMVScreenSpriteInfo.forEach(function(RMMVBg){
			if(!RMMVBg.RMMVSprite.hasEnded()){
				RMMVBg.RMMVSprite.update(_this._engine.getDeltaTime() * ratio);
				tmp.push(RMMVBg);
			} else {
				RMMVBg.RMMVSprite.parent.removeChild(RMMVBg.RMMVSprite);
			}	
		});
		_this._RMMVScreenSpriteInfo = tmp;
		
		var tmp = [];
		if(dragonBones.PixiFactory._dragonBonesInstance){
			dragonBones.PixiFactory._clockHandler((_this._engine.getDeltaTime() * 60 / 1000 * ratio));
		}
		
		_this._dragonBonesSpriteInfo.forEach(function(dragonBoneBg){
			if(!dragonBoneBg.sprite.isDisposed()){
				dragonBoneBg.renderer.render(dragonBoneBg.stage);	
				if(_this._ticksSinceLastUpdate > 0){
					dragonBoneBg.texture.update();
				}				
				tmp.push(dragonBoneBg);
			}		
		});
		_this._dragonBonesSpriteInfo = tmp;		
		
		
		//_this._screenSpacePixiRenderer.reset();
		_this._screenSpacePixiRenderer.render(_this._screenSpacePixiStage);
			
	});
	//this._engine.resize()
}

BattleSceneManager.prototype.stopScene = function(){
	var _this = this;
	this._container.style.display = "";
	if(this._engine){
		this._engine.stopRenderLoop();
	}
	if(this._scene){
		this._scene.dispose();	
	}	
	
	AudioManager.stopSe();
	AudioManager.clearPreloads();
	//this._engine.dispose();		
}

BattleSceneManager.prototype.registerMatrixAnimation = function(type, targetObj, startPosition, endPosition, startTick, duration, easingFunction, easingMode, hide, catmullRom){
	if(type == "translate"){
		startPosition = this.applyAnimationDirection(startPosition);
		endPosition = this.applyAnimationDirection(endPosition);
	}	
	
	if(!startPosition){
		startPosition = new BABYLON.Vector3(0, 0, 0);
	}
	if(!endPosition){
		endPosition = new BABYLON.Vector3(0, 0, 0);
	}

	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._matrixAnimations[this._translateAnimationCtr++] = {
		type: type, 
		targetObj: targetObj,
		startPosition: startPosition,
		endPosition: endPosition,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
		hide: hide,
		catmullRom: catmullRom
	};
}

BattleSceneManager.prototype.registerMatrixUpdate = function(type, targetObj, endPosition){
	if(type == "translate"){
		endPosition = this.applyAnimationDirection(endPosition);
	}	
	
	if(!endPosition){
		endPosition = new BABYLON.Vector3(0, 0, 0);
	}

	this._matrixUpdates[this._matrixUpdateCtr++] = {
		type: type, 
		targetObj: targetObj,
		endPosition: endPosition,
		startPosition: new BABYLON.Vector3(0,0,0)
	};
}


BattleSceneManager.prototype.registerSizeAnimation = function(targetObj, startSize, endSize, startTick, duration, easingFunction, easingMode, hide){
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._sizeAnimations[this._sizeAnimationCtr++] = {
		targetObj: targetObj,
		startSize: startSize,
		endSize: endSize,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
		hide: hide,
	};
}

BattleSceneManager.prototype.registerFadeAnimation = function(targetObj, startFade, endFade, startTick, duration, easingFunction, easingMode){	
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._fadeAnimations[this._fadeAnimationCtr++] = {
		targetObj: targetObj,
		startFade: startFade,
		endFade: endFade,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
	};
}

BattleSceneManager.prototype.registerEffekseerDynamicParamAnimation = function(targetObj, paramId, startValue, endValue, startTick, duration, easingFunction, easingMode){	
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._effekserDynParamAnimations[this._effekserDynParamAnimationCtr++] = {
		targetObj: targetObj,
		startValue: startValue,
		endValue: endValue,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
		paramId: paramId
	};
}
	
BattleSceneManager.prototype.registerShakeAnimation = function(targetObj, magnitude_x, speed_x, magnitude_y, speed_y, magnitude_z, speed_z, startTick, duration, fadeInTicks, fadeOutTicks, magnitude_variance, speed_variance){	
	this._shakeAnimations[this._shakeAnimationCtr++] = {		
		targetObj: targetObj,
		magnitude_x: magnitude_x,
		speed_x: speed_x,
		magnitude_y: magnitude_y,
		speed_y: speed_y,
		magnitude_z: magnitude_z,
		speed_z: speed_z,
		startTick: startTick,
		duration: duration,
		fadeInTicks: fadeInTicks,
		fadeOutTicks: fadeOutTicks,
		magnitude_variance: magnitude_variance,
		speed_variance: speed_variance
	};
}

BattleSceneManager.prototype.registerBgAnimation = function(targetObj, startTick, frameSize, lineCount, columnCount, startFrame, endFrame, loop, delay, holdFrame, flipX){	
	this._bgAnimations[this._bgAnimationCounter++] = {		
		targetObj: targetObj,
		startTick: startTick,
		lastTick: -1,
		currentFrame: startFrame,
		frameSize: frameSize,
		startFrame: startFrame,
		endFrame: endFrame,
		loop: loop,
		delay: delay,
		lineCount: lineCount,
		columnCount: columnCount,
		holdFrame: holdFrame,
		accumulator: 0,
		flipX: flipX
	};
}

BattleSceneManager.prototype.registerBgScroll = function(targetName, targetObj, speed, duration, easingFunction, easingMode){	
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}

	if(!this._bgScrolls[targetName]){
		this._bgScrolls[targetName] = {
			targetObj: targetObj,
			current: {				
				speed: speed,
				easingFunction: easingFunction,
				easingMode: easingFunction,
				duration: duration,
			},
			next: null
		};
	} else {
		this._bgScrolls[targetName].next = {
			speed: speed,
			easingFunction: easingFunction,
			easingMode: easingFunction,
			duration: duration,
		};
	}
}

BattleSceneManager.prototype.registerLightAnimation = function(targetObj, startColor, endColor, startTick, duration, easingFunction, easingMode){
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._lightAnimations[this._lightAnimationCtr++] = {
		targetObj: targetObj,
		startColor: startColor,
		endColor: endColor,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
	};
}

BattleSceneManager.prototype.delayAnimationList = function(startTick, delay){
	var delayedList = [];
	for(var i = 0; i < this._animationList.length; i++){
		if(this._animationList[i]){
			if(i >= startTick){
				delayedList[i+delay] = this._animationList[i];
			} else {
				delayedList[i] = this._animationList[i];
			}
		}		
	}
	this._animationList = delayedList;
}

BattleSceneManager.prototype.applyMutator = function(targetObj, func){
	if(targetObj){
		if(targetObj.getChildMeshes){
			const meshes = targetObj.getChildMeshes();
			for(let mesh of meshes){
				func(mesh);
			}
		}
		func(targetObj);					
	}
}

BattleSceneManager.prototype.getTargetObject = function(name){
	const _this = this;
	const parts = name.split(":");
	name = parts[0];
	const attPoint = parts[1];
	
	if(name && this._activeAliases[name]){
		name = this._activeAliases[name];
	}
	
	let obj;
	if(name == "Camera"){
		return _this._camera;
	} else if(name == "camera_parent"){
		return _this._cameraParent;
	}else if(name == "bgs_parent"){
		return _this._bgsParent;
	} else if(name == "active_main"){
		if(_this._supportAttackerActive){
			obj = _this._active_support_attacker;
		} else {
			obj = _this._active_main;
		}
	} else if(name == "active_twin"){
		obj = _this._active_twin
	} else if(name == "active_target"){
		if(_this._supportDefenderActive){
			obj = _this._active_support_defender;
		} else {
			obj = _this._active_target;
		}			
	} else if(name == "active_target_twin"){			
		obj = _this._active_target_twin;						
	} else if(name == "active_support_defender"){
		obj = _this._active_support_defender;
	} else if(name == "active_support_attacker"){
		obj = _this._active_support_attacker;
	} else if(name == "ally_main"){
		obj = _this._actorSprite.sprite;
	} else if(name == "enemy_main"){
		obj = _this._enemySprite.sprite;
	} else if(name == "scene_light"){
		obj = _this._hemisphereLight;
	} else {	
		
		if(name && String(name).indexOf("envBg__") == 0){
			const envName = name.replace("envBg__", "");
			_this._bgs.forEach(function(bg){	
				if(bg.isVisible && bg.envRefId == envName){
					obj = bg;
				}
			});	
		}
		
		if(!obj){//check models
			var ctr = 0;
			while(!obj && ctr < _this._unitModelInfo.length){
				if(_this._unitModelInfo[ctr].sprite.name == name+"_model"){
					obj = _this._unitModelInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		
		if(!obj){//check dynamic unit models
			var ctr = 0;
			while(!obj && ctr < _this._instantiatedUnits.length){
				if(_this._instantiatedUnits[ctr].name == name){
					obj = _this._instantiatedUnits[ctr].sprite;
				}
				ctr++;
			}
		}

		if(!obj){//check dynamic unit models
			var ctr = 0;
			if(_this._renderTargets[name] != null){
				obj = _this._renderTargets[name].camera;
			}
		}
		
		if(!obj){//check sprites
			var ctr = 0;
			while(!obj && ctr < _this._animationSpritesInfo.length){
				var spriteInfo = _this._animationSpritesInfo[ctr];
				if(spriteInfo.sprite.name == name){
					obj = spriteInfo.sprite;
				}
				ctr++;
			}
		}
		if(!obj && _this._scene.layers){//check layers
			var ctr = 0;
			while(!obj && ctr < _this._scene.layers.length){
				if(_this._scene.layers[ctr].name == name){
					obj = _this._scene.layers[ctr];
				}
				ctr++;
			}
		}
		if(!obj){//check effekseer handles
			var ctr = 0;
			while(!obj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == name){
					obj = _this._effekseerInfo[ctr];
				}
				ctr++;
			}
		}
		if(!obj){//check rmmv animation
			var ctr = 0;
			while(!obj && ctr < _this._RMMVSpriteInfo.length){
				if(_this._RMMVSpriteInfo[ctr].sprite.name == name+"_rmmv"){
					obj = _this._RMMVSpriteInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		if(!obj){//check movie bgs
			var ctr = 0;
			while(!obj && ctr < _this._movieBGInfo.length){
				if(_this._movieBGInfo[ctr].sprite.name == name+"_moviebg"){
					obj = _this._movieBGInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		if(!obj){//check spriter bgs
			var ctr = 0;
			while(!obj && ctr < _this._spriterMainSpritesInfo.length){
				if(_this._spriterMainSpritesInfo[ctr].sprite.name == name+"_spriter"){
					obj = _this._spriterMainSpritesInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		if(!obj){//check spine bgs
			var ctr = 0;
			while(!obj && ctr < _this._spineMainSpritesInfo.length){
				if(_this._spineMainSpritesInfo[ctr].sprite.name == name+"_spine"){
					obj = _this._spineMainSpritesInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		
		if(!obj){//check dragonbones bgs
			var ctr = 0;
			while(!obj && ctr < _this._dragonBonesSpriteInfo.length){
				if(_this._dragonBonesSpriteInfo[ctr].sprite.name == name+"_dragonbones"){
					obj = _this._dragonBonesSpriteInfo[ctr].sprite;
				}
				ctr++;
			}
		}
		
		if(!obj){//check lights
			var ctr = 0;
			while(!obj && ctr < _this._lights.length){
				if(_this._lights[ctr].name == name+"_light"){
					obj = _this._lights[ctr];
				}
				ctr++;
			}
		}
		
		if(!obj){
			obj = _this._scene.getMeshByName(name);
		}
		
	}
	if(obj && attPoint){
		let targetObj;
		if(obj.getChildMeshes){
			const meshes = obj.getChildMeshes();
			for(const mesh of meshes){
				if(mesh.id == attPoint){
					targetObj = mesh;
				}
			}
		}	
		
		if(targetObj){
			obj = targetObj;
		}
	}
	return obj;	
}


BattleSceneManager.prototype.stopShakeAnimations = function(target){
	const _this = this;
	const targetObj = _this.getTargetObject(target);
	if(targetObj){
		let tmp = [];
		if(_this._shakeAnimations){
			for(let animCtr in _this._shakeAnimations){
				if(_this._shakeAnimations[animCtr].targetObj != targetObj){
					tmp.push(_this._shakeAnimations[animCtr]);
				} else {
					targetObj.position = targetObj.realPosition;
				}
			}
			_this._shakeAnimations = tmp;
		}
	}	
}			

BattleSceneManager.prototype.executeAnimation = function(animation, startTick){
	var _this = this;
	//debug
	/*_this._scene.meshes.forEach((mesh) => {
		mesh.onBeforeDraw = () => {
			!_this._drawCounts[mesh.name] ? _this._drawCounts[mesh.name] = 1 : _this._drawCounts[mesh.name]++;                
		}
	});*/
	
	if(animation.target && this._activeAliases[animation.target]){
		animation.target = this._activeAliases[animation.target];
	}
	
	function getTargetObject(name){
		return _this.getTargetObject(name);
	}
	
	function usesPropRotation(target){		
		return {
			"Camera": true,  
			"active_main": true,  
			"active_twin": true,  
			"active_target": true,  
			"active_target_twin": true,  
			"active_support_defender": true,  
			"active_support_attacker": true,  
			"ally_main": true,  
			"enemy_main": true
		}[target] == null;
	}
		
	var animationHandlers = {
		register_alias: function(target, params){
			_this._activeAliases[params.id] = target;
		},
		set_opacity_texture: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.material.opacityTexture = _this.getCachedTexture("img/SRWBattleScene/opacityTextures/"+params.path+".png");
			}
		},
		clear_opacity_texture: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.material.opacityTexture = null;
			}
		},
		set_blend_color: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				/*if(targetObj.getChildMeshes){
					const meshes = targetObj.getChildMeshes();
					for(let mesh of meshes){
						if(mesh.material){
							mesh.material.emissiveColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
							//mesh.material.diffuseColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
						}
					}
				} else {
					targetObj.material.emissiveColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
				}	*/			
				_this.applyMutator(targetObj, (mesh) => {
					if(mesh.material){
						mesh.material.emissiveColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255); 
					}
				});
			}
		},
		fade_in_textbox: function(target, params){
			_this._TextlayerManager.fadeInTextBox(params.immediate * 1);
		},
		fade_out_textbox: function(target, params){
			_this._TextlayerManager.fadeOutTextBox(params.immediate * 1);
		},
		effect_shockwave: function(target, params){
			var x_fraction = params.x_fraction;
			if(_this._animationDirection == -1){
				x_fraction = 1 - x_fraction;
			}
			_this.playShaderEffect("shockWave", [
				{type: "vector2", name: "iWaveCentre", value: new BABYLON.Vector2(x_fraction, params.y_fraction)},
				{type: "float", name: "iIntensity", value: params.shockwave_intensity || 0.1}
			]);
		},
		effect_screen_shader: function(target, params){
			var effectName = params.shaderName;
			if(_this._shaderManagement[effectName]){
				var duration = params.shaderDuration * 1;
				var shaderParams = [];
				for(var i = 0; i < 10; i++){
					if(params["shaderParam"+i]){
						var parts = params["shaderParam"+i].match(/^(.*)\:(.*)\=(.*)/);
						if(parts && parts.length >= 4){
							var type = parts[1];
							var varName = parts[2];
							var value = parts[3];
							if(type == "vector2"){
								var valueParts = value.split(",");
								if(_this._animationDirection == -1){
									valueParts[0] =  1 - valueParts[0];
								}
								value = new BABYLON.Vector2(valueParts[0] * 1, valueParts[1] * 1);
							} else if(type == "vector2_f"){
								var valueParts = value.split(",");				
								valueParts[0] =  1 - valueParts[0];							
								value = new BABYLON.Vector2(valueParts[0] * 1, valueParts[1] * 1);
							} else if(type == "vector3"){
								var valueParts = value.split(",");
								if(_this._animationDirection == -1){
									valueParts[0] =  1 - valueParts[0];
								}
								value = new BABYLON.Vector3(valueParts[0] * 1, valueParts[1] * 1, valueParts[2] * 1);
							} else if(type == "vector3_f"){
								var valueParts = value.split(",");
								value = new BABYLON.Vector3(valueParts[0] * 1, valueParts[1] * 1, valueParts[2] * 1);
							} 
							shaderParams.push({
								type: type,
								name: varName, 
								value: value
							});
						}
					}
				}
				_this.playShaderEffect(effectName, shaderParams, duration);
			}
		},
		kill_active_animations: function(target, params){
			_this._matrixAnimations = {};
		},
		teleport: function(target, params){
			//console.log("teleport: "+target);			 
			var targetObj = getTargetObject(target);
			if(targetObj.parent_handle){
				targetObj = targetObj.parent_handle;
			}
			if(targetObj){
				if(targetObj.parent_handle){
					targetObj = targetObj.parent_handle;
				}
				targetObj.wasMoved = true;
				var targetPosition = params.position || new BABYLON.Vector3(0,0,0);				
				
				if(targetObj.isMirrored){
					_this.registerMatrixUpdate("translate_effek", targetObj, new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z));
				} else {
					_this.registerMatrixUpdate("translate", targetObj, new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z));
				}
				
			}
		},
		rotate_to: function(target, params){
			//console.log("teleport: "+target);
			var targetObj = getTargetObject(target);
			if(targetObj){
				if(params.aroundPivot * 1 && targetObj.pivothelper){
					targetObj = targetObj.pivothelper;
				} else if(targetObj.parent_handle){
					targetObj = targetObj.parent_handle;
				}
				var startRotation = new BABYLON.Vector3(0,0,0);
				
				var targetRotation = new BABYLON.Vector3(0,0,0);
				
				if( params.rotation){
					targetRotation = new BABYLON.Vector3(params.rotation.x, params.rotation.y, params.rotation.z);
				}
				if(_this._animationDirection == -1){
					//targetRotation.x*=-1;					
					if(params.aroundPivot || usesPropRotation(target)){
						//targetRotation.y+=Math.PI;						
						//targetRotation.x = targetRotation.x * -1 + Math.PI;
						
						//startRotation.y+=Math.PI;
						//startRotation.x = startRotation.x * -1 + Math.PI;
						targetRotation.z*=-1;
						startRotation.z*=-1;
						targetRotation.y*=-1;
						startRotation.y*=-1;
					} else {						
						targetRotation.y*=-1;
						startRotation.y*=-1;
					}
				}
				_this.registerMatrixUpdate("rotate", targetObj, targetRotation);
			}	
		},
		stop_matrix_animations: function(target, params){
			const targetObj = getTargetObject(target);
			let tmp = [];
			if(_this._matrixAnimations){
				for(let animCtr in _this._matrixAnimations){
					if(_this._matrixAnimations[animCtr].targetObj != targetObj){
						tmp.push(_this._matrixAnimations[animCtr]);
					}
				}
				_this._matrixAnimations = tmp;
			}
			
		},
		translate: function(target, params){
			var targetObj = getTargetObject(target);
			//_this.stopShakeAnimations(target);
			
			if(targetObj){
				if(targetObj.parent_handle){
					targetObj = targetObj.parent_handle;
				}
				targetObj.wasMoved = true;
				var startPosition;
				if(params.startPosition){
					startPosition = params.startPosition;
				} else {
					startPosition = targetObj.position;
				}
				startPosition = startPosition || new BABYLON.Vector3(0,0,0);	
				var targetPosition = params.position || new BABYLON.Vector3(0,0,0);				
				targetPosition = {x: targetPosition.x, y:  targetPosition.y, z: targetPosition.z};
				if(params.relative == 1){
					let directionFactor = _this._animationDirection;
					if(targetObj.handle){
						directionFactor = 1;//do not convert relative motions for effekseer handlers as mirrored instance there are handled through a mirrored renderer
						if(!targetObj.position){
							targetObj.position = {x: targetObj.offset.x, y: targetObj.offset.y, z: targetObj.offset.z};
						}
					}
					/*startPosition = {x: targetObj.position.x, y:  targetObj.position.y, z: targetObj.position.z};				
					targetPosition.x = startPosition.x + (targetPosition.x * directionFactor);
					targetPosition.y+=startPosition.y;
					targetPosition.z+=startPosition.z;*/
					_this.registerMatrixAnimation("translate_relative", targetObj, new BABYLON.Vector3(startPosition.x, startPosition.y, startPosition.z), new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), startTick, params.duration, params.easingFunction, params.easingMode, params.hide, params.catmullRom);
				} else {
					if(targetObj.isMirrored){
						_this.registerMatrixAnimation("translate_effek", targetObj, new BABYLON.Vector3(startPosition.x, startPosition.y, startPosition.z), new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), startTick, params.duration, params.easingFunction, params.easingMode, params.hide, params.catmullRom);
					} else {
						_this.registerMatrixAnimation("translate", targetObj, new BABYLON.Vector3(startPosition.x, startPosition.y, startPosition.z), new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), startTick, params.duration, params.easingFunction, params.easingMode, params.hide, params.catmullRom);
					}
				}
				
			}			
		},
		rotate: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				if(params.aroundPivot * 1 && targetObj.pivothelper){
					targetObj = targetObj.pivothelper;
				} else if(targetObj.parent_handle){
					targetObj = targetObj.parent_handle;
				}
				var startRotation;
				if(params.startRotation){
					startRotation = new BABYLON.Vector3(params.startRotation.x, params.startRotation.y, params.startRotation.z);
				} else {
					startRotation = targetObj.rotation;
				}
				var targetRotation = new BABYLON.Vector3(0,0,0);
				
				if( params.rotation){
					targetRotation = new BABYLON.Vector3(params.rotation.x, params.rotation.y, params.rotation.z);
				}
				if(_this._animationDirection == -1){
					//targetRotation.x*=-1;					
					if(params.aroundPivot || usesPropRotation(target)){
						//targetRotation.y+=Math.PI;						
						//targetRotation.x = targetRotation.x * -1 + Math.PI;
						
						//startRotation.y+=Math.PI;
						//startRotation.x = startRotation.x * -1 + Math.PI;
						targetRotation.z*=-1;
						startRotation.z*=-1;
						targetRotation.y*=-1;
						startRotation.y*=-1;
					} else {						
						targetRotation.y*=-1;
						startRotation.y*=-1;
					}
				}
				_this.registerMatrixAnimation("rotate", targetObj, startRotation, targetRotation, startTick, params.duration, params.easingFunction, params.easingMode);
			}			
		},
		resize: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				_this.registerSizeAnimation(targetObj, params.startSize, params.endSize, startTick, params.duration, params.easingFunction, params.easingMode);
			}			
		},
		flip: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				var flipX = (params.x || 1);
				if(target == "active_main" || target == "active_target"){
					flipX*=_this._animationDirection;
				}
				if(targetObj.spriteConfig.type == "3D"){	
					if(targetObj.originalXSign == null){
						targetObj.originalXSign = Math.sign(targetObj.scaling.x);
					}
					
					targetObj.flipX = flipX;					
					if(flipX == 1){			
						if(Math.sign(targetObj.scaling.x) != targetObj.originalXSign){
							targetObj.scaling.x*=-1;
						}										
					} else if(flipX == -1){
						if(Math.sign(targetObj.scaling.x) == targetObj.originalXSign){
							targetObj.scaling.x*=-1;
						}
					}
				} else if(targetObj.material){
					targetObj.material.diffuseTexture.uScale = flipX;
					if(targetObj.material.diffuseTexture.uScale == -1){
						targetObj.material.diffuseTexture.uOffset = 1; 
					} else {
						targetObj.material.diffuseTexture.uOffset = 0; 
					}				
					targetObj.material.diffuseTexture.vScale = (params.y || 1) * 1;
				}
				
			}			
		},
		shake: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				_this.stopShakeAnimations(target);
				targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
				_this.registerShakeAnimation(targetObj, params.magnitude_x || 0, params.speed_x || 1, params.magnitude_y || 0, params.speed_y || 1, params.magnitude_z || 0, params.speed_z || 1, startTick, params.duration, params.fadeInTicks || 0, params.fadeOutTicks || 0, params.magnitude_variance || 0, params.speed_variance || 0);
			}			
		},
		set_camera_target: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				//_this._camera.setTarget(targetObj.position);
				_this._camera.lockedTarget = targetObj.position;
			}			
		},	
	
		set_damage_text: function(target, params){
			var action = _this.getTargetAction(target);
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			
			var type;
			if((action.currentAnimHP - action.damageTaken) / $statCalc.getCalculatedMechStats(action.ref).maxHP < 0.25){
				type = "damage_critical";
			} else {
				type = "damage";
			}
			var battleText = _this._battleTextManager.getText(entityType, action.ref, type, action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			
			_this._awaitingText = true;
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText).then(function(){
				_this._awaitingText = false;
			});
		},
		
		set_evade_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "evade", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._awaitingText = true;
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText).then(function(){
				_this._awaitingText = false;
			});
		},
		
		set_destroyed_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "destroyed", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._awaitingText = true;
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText).then(function(){
				_this._awaitingText = false;
			});
		},
		
		set_attack_text: function(target, params){
			var action = _this._currentAnimatedAction;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var attackTextProviderId;
			if(action.action.attack.textAlias != -1){
				attackTextProviderId = action.action.attack.textAlias;
			} else {
				attackTextProviderId = action.action.attack.id;
			}
			
			let textProvider;
			
			if(_this._textProviderOverride){
				textProvider = $gameActors.actor(_this._textProviderOverride); 
				$statCalc.initSRWStatsIfUninitialized(textProvider);
			} else{
				textProvider = action.ref;
			}
			
			var battleText = _this._battleTextManager.getText(entityType, textProvider, "attacks", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction), params.id, attackTextProviderId);
			_this._awaitingText = true;
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText, false, true).then(function(){
				_this._awaitingText = false;
			});
		},
		set_text_provider: function(target, params){
			_this._textProviderOverride = params.id;
		},
		clear_attack_text: function(target, params){
			_this._TextlayerManager.resetTextBox();
		},
		show_support_defender_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "support_defend", entityType, _this.getBattleTextId({ref: _this._currentAnimatedAction.attacked.defended}));
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);			
			_this._UILayerManager.setNotification(entityType, "Support Defend");
		},
		enable_support_defender: function(target, params){
			_this._supportDefenderActive = true;			
			var action = _this.getTargetAction(target);
			var ref = _this._currentAnimatedAction.attacked.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			var currentHP;
			if(action.side == "actor"){
				currentHP = _this._participantInfo.actor_supporter.tempHP;
				_this._actorSprite.sprite.setEnabled(false);
			} else {
				currentHP = _this._participantInfo.enemy_supporter.tempHP;
				_this._enemySprite.sprite.setEnabled(false);
			}
			_this._UILayerManager.setStat(action, "HP");
			_this._UILayerManager.setStat(action, "EN");
		},
		
		disable_support_defender: function(target, params){
			_this._supportDefenderActive = false;
			var action = _this._currentAnimatedAction.originalTarget;		
			var ref = action.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			var currentHP;
			if(action.side == "actor"){				
				if(action.ref.isSubTwin){
					currentHP = _this._participantInfo.actor_twin.tempHP;
					_this._actorTwinSprite.sprite.setEnabled(true);
				} else {
					currentHP = _this._participantInfo.actor_twin.tempHP;
					_this._actorSprite.sprite.setEnabled(true);
				}				
			} else {				
				if(action.ref.isSubTwin){
					currentHP = _this._participantInfo.enemy.tempHP;
					_this._enemyTwinSprite.sprite.setEnabled(true);
				} else {
					currentHP = _this._participantInfo.enemy.tempHP;
					_this._enemySprite.sprite.setEnabled(true);
				}
			}
			_this._UILayerManager.setStat(action, "HP");
			_this._UILayerManager.setStat(action, "EN");
		},	
		store_active_main_visibility: function(target, params){
			var targetObj = getTargetObject("active_main");
			_this._storedActiveMainVisbility = targetObj.isVisible;
		},
		restore_active_main_visibility: function(target, params){
			var targetObj = getTargetObject("active_main");
			if(_this._storedActiveMainVisbility !== undefined){
				targetObj.isVisible = _this._storedActiveMainVisbility;
				delete _this._storedActiveMainVisbility;
			}			
		},
		fade_in_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				_this.registerFadeAnimation(targetObj, params.startFade, params.endFade, startTick, params.duration, params.easingFunction, params.easingMode);
			}
		},	
		set_hard_shadows: function(target, params){
			_this._useHardShadows = params.hard;
		},
		fade_in_shadows: function(target, params){
			var targetObj = getTargetObject(target);
			
			let targets = [
				_this._actorShadow,
				_this._actorTwinShadow,
				_this._enemyShadow,
				_this._enemyTwinShadow,
				_this._actorSupporterShadow,
				_this._actorTwinSupporterShadow,
				_this._enemySupporterShadow,
				_this._enemyTwinSupporterShadow
			];
			if(_this._instantiatedUnits){
				for(let unit of _this._instantiatedUnits){
					targets.push(unit);
				}
			}
			for(let target of targets){
				if(target){
					_this.registerFadeAnimation(target, params.startFade, params.endFade, startTick, params.duration, params.easingFunction, params.easingMode);
				}
			}			
		},		
		fade_swipe: function(target, params){
			var swipeTime = params.time;
			if(!swipeTime){
				swipeTime = 700;
			} else {
				swipeTime*=_this.getTickDuration();
			}
			var direction;
			if(params.direction){
				direction = params.direction;
			} else {
				if(_this._currentAnimatedAction.side == "actor"){
					direction = "right";
				} else {
					direction = "left";
				}
			}
			if(_this.isOKHeld){
				swipeTime/=2;
			}
			_this._doingSwipAnim = true;
			_this._lockedSwipeState = _this.isOKHeld;
			_this.swipeToBlack(direction, "in", swipeTime).then(function(){
				clearSwipe();				
			});	
			
			function clearSwipe(){
				if(!_this.isReady()){
					setTimeout(clearSwipe, 100);
				} else {
					setTimeout(function(){
						_this.swipeToBlack(direction, "out").then(function(){
							_this._doingSwipAnim = false;
							_this._lockedSwipeState = null;
						});
					}, 100);					
				}
			}
		},
		fade_white: function(target, params){
			var fadeTime = params.time;
			
			if(!fadeTime){
				fadeTime = 0.7;
			} else {
				fadeTime*=_this.getTickDuration();
				fadeTime = Math.round(fadeTime / 100) / 10;
			}
			
			if(params.speed == "fast"){
				params.speed = 0.3;
			} else if(params.speed == "slow"){
				params.speed = 0.6;
			} else {
				params.speed*=_this.getTickDuration();
				params.speed = Math.round(params.speed / 100) / 10;
			}
			
			if(params.speedOut == "fast"){
				params.speedOut = 0.3;
			} else if(params.speedOut == "slow"){
				params.speedOut = 0.6;
			} else {
				params.speedOut*=_this.getTickDuration();
				params.speedOut = Math.round(params.speedOut / 100) / 10;
			}			
			
			if(_this.isOKHeld){
				fadeTime/=2;
				params.speed/=2;
				params.speedOut/=2;
			}
			_this._doingSwipAnim = true;
			_this._lockedSwipeState = _this.isOKHeld;
			_this.fadeToWhite(fadeTime * 1000, params.speed).then(function(){
				_this.fadeFromWhite(params.speedOut).then(function(){
					_this._doingSwipAnim = false;
					_this._lockedSwipeState = null;
				});
			});	
		
		},		
		updateBgMode: function(target){
			var action;
			if(target == "active_target"){
				action = _this._currentAnimatedAction.originalTarget;
			} else {
				action = _this._currentAnimatedAction;
			}
			_this.setBgMode($statCalc.isBattleShadowHiddenOnCurrentTerrain(action.ref) ? "sky" : "land");			
		},	
		next_phase: function(target, params){
			let insertStartTick = _this._currentAnimationTick;
			
			_this._animationList[insertStartTick + 1] = [{type: "fade_swipe", target: "", params: {time: 18}}];	
			
			_this._animationList[insertStartTick + 25] = [{type: "create_target_environment"}, {type: "updateBgMode", target: "active_target"}];
			if(params.cleanUpCommands){				
				_this._animationList[insertStartTick + 26] = params.cleanUpCommands;						
			}		

			
			//support defend animation
			if(_this._currentAnimatedAction.attacked && _this._currentAnimatedAction.attacked.type == "support defend"){
				_this.delayAnimationList(insertStartTick + 27, 170);
				_this._animationList[insertStartTick + 27] =  [{type: "store_active_main_visibility", target: ""}];
				_this._animationList[insertStartTick + 30] = [
					{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
					{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
					{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
				
					{type: "show_sprite", target: "active_target", params: {}},		
					{type: "hide_sprite", target: "active_main", params: {}},					
				];	
				
				_this._animationList[insertStartTick + 50] = [
					{type: "set_sprite_frame", target: "active_target", params: {name: "out"}},
					{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-10, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
				];
				
				_this._animationList[insertStartTick + 80] = [
					{type: "show_sprite", target: "active_support_defender", params: {}},
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "in"}},
					{type: "translate", target: "active_support_defender", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
					{type: "show_support_defender_text"},					
				];
				
				_this._animationList[insertStartTick + 110] = [
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "block", spriterOnly: true}},
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "block", defaultOnly: true}},
					{type: "set_sprite_frame", target: "active_target", params: {name: "block"}},
					{type: "show_barrier", target: "active_support_defender", params: {}}
				];
				
				_this._animationList[insertStartTick + 150] = [
					{type: "fade_swipe", target: "", params: {time: 54}},
				];
				
				_this._animationList[insertStartTick + 160] = [
					//{type: "show_sprite", target: "active_main", params: {}},	
					{type: "enable_support_defender"},
					{type: "hide_sprite", target: "active_target", params: {}},		
					{type: "restore_active_main_visibility", target: ""}		
				];				
				
				if(params.commands){
					_this._animationList[insertStartTick + 161] = params.commands;						
				}
				_this._animationList[insertStartTick + 162] = [{type: "updateBgMode", target: "active_target"}];
			} else {
				if(params.commands){
					_this._animationList[insertStartTick + 27] = params.commands;	
					_this._animationList[insertStartTick + 28] = [{type: "updateBgMode", target: "active_target"}];
					
					//if(_this._currentAnimatedAction.hits){
						var additions = [];
						additions[insertStartTick + 50] = [{type: "show_barrier", target: "active_target", params: {}}];	
						//if(_this._currentAnimatedAction.attacked.action.type == "defend"){
						additions[insertStartTick + 50].push({type: "set_sprite_frame", target: "active_target", params: {name: "block"}});
						//}
						_this.mergeAnimList(additions);	
					//}								
				}
			}
		},
		dodge_pattern: function(target, params){
			let insertStartTick = _this._currentAnimationTick;
			var action = _this.getTargetAction(target);
			
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "evade", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
			
			var hasSpecialEvasion = false;
			if(action.specialEvasion){
				_this._UILayerManager.setPopupNotification(action.isActor ? "actor" : "enemy", [action.specialEvasion.name], "evasion");
				var patternId = action.specialEvasion.dodgePattern;
				var animDef = {
					full_anim: "null"
				};
				if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
					animDef =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId];
				}
				if(animDef.full_anim != null){
					hasSpecialEvasion = true;
					var animData = _this._animationBuilder.buildAnimation(animDef.full_anim, _this).mainAnimation;
					var additions = [];
					Object.keys(animData).forEach(function(tick){
						additions[insertStartTick * 1 + tick * 1 + 1] = animData[tick];
					});
					_this.mergeAnimList(additions);		
					
				} 
			} 

			if(!hasSpecialEvasion){
				if(params.commands){
					var additions = [];
					Object.keys(params.commands).forEach(function(tick){
						additions[insertStartTick * 1 + tick * 1 + 1] = params.commands[tick];
					});
					_this.mergeAnimList(additions);
				}
			}
			
			/*if(action.isDoubleImage){
				_this._doubleImageActive = true;
				var additions = [];
				var position = _this._defaultPositions.enemy_main_idle;
				
				var moveCount = 15;
				var moveTicks = 30;
				var moveStep = Math.floor(moveTicks / moveCount);
				for(var i = 0; i < moveCount; i++){
					var sign = i % 2 ? 1 : -1;
					additions[startTick + (i * moveStep)] = [
						{type: "translate", target: "active_target", params:{startPosition: position,position: new BABYLON.Vector3(position.x - (0.2 * i * sign), position.y, position.z), duration: moveStep}},
					];
				}
				additions[startTick + 30] = [					
					{type: "hide_sprite", target: "active_target", params:{index: 0}},
					{type: "teleport", target: "active_target", params:{position: position}},
				];
				_this.mergeAnimList(additions);
				
				var entityType = action.side;
				_this._UILayerManager.setNotification(entityType, "DOUBLE IMAGE");
			} else {
				if(params.commands){
					_this._animationList[startTick + 1] = params.commands;	
				}
			}*/
				
		},
		
		set_light_color: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){	
				if(params.duration){
					_this.registerLightAnimation(targetObj, targetObj.diffuse, new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255), startTick, params.duration, params.easingFunction, params.easingMode);
				} else {
					targetObj.groundColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
					targetObj.diffuse = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);	
				}				
			}
		},
		create_hemi_light: function(target, params){
			let position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			const hemiLight = new BABYLON.HemisphericLight(target+"_light", position, _this._scene);
			hemiLight.groundColor = new BABYLON.Color3(1,1,1);
			hemiLight.diffuse = new BABYLON.Color3(1,1,1);
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					hemiLight.parent = parentObj;
				}
			}
			if(params.r == null || params.r == ""){
				params.r = 255;
			}
			if(params.g == null || params.g == ""){
				params.g = 255;
			}
			if(params.b == null || params.b == ""){
				params.b = 255;
			}
			hemiLight.groundColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
			hemiLight.diffuse = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);	
			if(params.includeOnly){
				var includeOnlyObj = getTargetObject(params.includeOnly);
				if(includeOnlyObj){
					hemiLight.includedOnlyMeshes = [];
					_this.applyMutator(includeOnlyObj, (mesh) => {
						hemiLight.includedOnlyMeshes.push(mesh);
					});
				}
				
			}	
			_this._lights.push(hemiLight);
		},
		create_point_light: function(target, params){
			let position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			const pointLight = new BABYLON.PointLight(target+"_light", position, _this._scene);
			pointLight.intensity = params.lightIntensity || 1;
			pointLight.specular = new BABYLON.Color3.Red();
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					pointLight.parent = parentObj;
				}
			}
			if(params.r == null || params.r == ""){
				params.r = 255;
			}
			if(params.g == null || params.g == ""){
				params.g = 255;
			}
			if(params.b == null || params.b == ""){
				params.b = 255;
			}
			pointLight.groundColor = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);
			pointLight.diffuse = new BABYLON.Color3(params.r / 255, params.g / 255, params.b / 255);	
			if(params.includeOnly){
				var includeOnlyObj = getTargetObject(params.includeOnly);
				if(includeOnlyObj){
					pointLight.includedOnlyMeshes = [];
					_this.applyMutator(includeOnlyObj, (mesh) => {
						pointLight.includedOnlyMeshes.push(mesh);
					});
				}
				
			}	
			_this._lights.push(pointLight);
		},
		exclude_from_light: function(target, params){
			const targetObj = getTargetObject(target);
			const excluded = getTargetObject(params.excludedObj);
			if(targetObj && excluded){				
				_this.applyMutator(excluded, (mesh) => {
					targetObj.excludedMeshes.push(mesh);
				});
			}			
		},
		create_render_target: function(target, params){
			let position;
			if(!_this._renderTargets[target]){
				if(params.position){
					position = _this.applyAnimationDirection(params.position);
				} else {
					position = new BABYLON.Vector3(0, 0, 0);
				}		
	
				const camera = new BABYLON.FreeCamera("render_target_cam_"+(_this._renderTargets.length), position, _this._scene);
				if(params.rotation){
					camera.rotation = _this.applyAnimationDirection(params.rotation);
				}
				const renderTarget = new BABYLON.RenderTargetTexture("render_target_tex_"+(_this._renderTargets.length), {width: ENGINE_SETTINGS.BATTLE_SCENE.RENDER_WIDTH, height: ENGINE_SETTINGS.BATTLE_SCENE.RENDER_HEIGHT}, _this._scene, true);
				renderTarget.activeCamera = camera;
				renderTarget.renderList = null;
				_this._scene.customRenderTargets.push(renderTarget);			
	
				_this._renderTargets[target] = {
					camera: camera,
					texture: renderTarget
				}	
			} else {
				console.log("Render target "+target+" already defined.");
			}			
		},
		create_bg: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var alpha;
			if(params.alpha != "" && params.alpha != null){
				alpha = params.alpha*1;
			}
			
			var size = params.size || "4";
			var sizeParts = size.split(",");
			if(sizeParts && sizeParts.length == 2){
				size = {
					width: sizeParts[0],
					height: sizeParts[1]
				}
			} 
			let path;
			if(params.isPilotCutin * 1){
				path = _this._currentAnimatedAction.ref.SRWStats.pilot.cutinPath;
			} else {
				path = params.path;
			}
			var bg = _this.createSceneBg(target, path, _this.applyAnimationDirection(position), size, alpha, params.billboardMode, _this._animationDirection == -1 ? true : false, params.clamp, params.unlit, (params.uScale || 0) * 1, (params.vScale || 0) * 1, (params.uOffset || 0) * 1, (params.vOffset || 0) * 1, params.renderTargetId);
			if(params.rotation){
				bg.rotation = _this.applyAnimationDirection(params.rotation);
			}
			
			if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
				if(params.isFront == 1){
					bg.renderingGroupId = 3;
				} else if(params.isFront == -1){
					bg.renderingGroupId = 2;
				} else {
					bg.renderingGroupId = 1;
				}
			}			
			
			params.animationDelay*=_this.getTickDuration();
			
			if(params.animationFrames){
				_this.registerBgAnimation(bg, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames*1, params.animationLoop*1, params.animationDelay*1, params.holdFrame*1, _this._animationDirection == -1 ? true : false);
			}
			if(params.scrollSpeed){
				//var speed = params.scrollSpeed * _this._animationDirection;				
				_this.registerBgScroll(target, bg, params.scrollSpeed * 1);
			}
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bg.parent = parentObj;
				}
			}
			_this._animationBackgroundsInfo.push(bg);
		},
		
		set_bg_scroll_speed: function(target, params){
			var targetObj = getTargetObject(target);
			if(params.scrollSpeed){
				//var speed = params.scrollSpeed * _this._animationDirection;				
				_this.registerBgScroll(target, targetObj, params.scrollSpeed * 1, params.duration * 1, params.easingFunction, params.easingMode);
			}
		},
		create_movie_bg: function(target, params){
			var position;
			if(params.position){
				position = new BABYLON.Vector3(params.position.x, params.position.y, params.position.z);
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var alpha;
			if(params.alpha != "" && params.alpha != null){
				alpha = params.alpha*1;
			}
			
			var size = params.size || "4";
			var sizeParts = size.split(",");
			if(sizeParts && sizeParts.length == 2){
				size = {
					width: sizeParts[0],
					height: sizeParts[1]
				}
			} 
			let path = params.path;
			const canvas = _this.requestCanvas();
			canvas.setAttribute("width", 1000);
			canvas.setAttribute("height", 1000);
			
			var dynamicBgInfo = _this.createSpriterBg(target+"_moviebg", position, size, 1, 0, _this._animationDirection == -1, canvas, true);			
			
			
			
			var video = _this.requestVideoPlayer();
			//video.id = "movie_video_"+target;
			video.style.display = "none";
			video.style.width = "100%";
			video.style.height = "100%";
			
			//debug
			/*video.style.display = "block";
			video.style.width = "100px";
			video.style.height = "100px";
			video.style.position = "fixed";
			video.style.top = 0;
			video.style.left = 0;*/
			
			video.autoplay = true;
			video.muted = true;
			//_this._movieContainer.appendChild(video);
			_this._container.appendChild(video);
			
			video.src = "img/SRWBattleScene/"+path;
			video.crossOrigin = 'anonymous';
			/*if(_this._animationDirection == -1){
				_this._movieCanvas.style.transform = "scaleX(-1)";
			} else {
				_this._movieCanvas.style.transform = "";
			}*/
			/*video.onended = function(){
				video.completed = true;
			}*/
			video.play();
			
			//document.body.appendChild(canvas);
			
			
			dynamicBgInfo.canvas = canvas;
			dynamicBgInfo.video = video;
			
			var bg = dynamicBgInfo.sprite;
			if(params.rotation){
				bg.rotation = _this.applyAnimationDirection(params.rotation);
			}
			
			if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
				if(params.isFront){
					bg.renderingGroupId = 3;
				} else {
					bg.renderingGroupId = 1;
				}
			}		

			_this._movieBGInfo.push(dynamicBgInfo);
			
			/*
			params.animationDelay*=_this.getTickDuration();
			
			if(params.animationFrames){
				_this.registerBgAnimation(bg, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames*1, params.animationLoop*1, params.animationDelay*1, params.holdFrame*1, _this._animationDirection == -1 ? true : false);
			}
			if(params.scrollSpeed){
				var speed = params.scrollSpeed * _this._animationDirection;				
				_this.registerBgScroll(bg, speed);
			}
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bg.parent = parentObj;
				}
			}*/
			//_this._animationBackgroundsInfo.push(bg);
		},
		remove_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){ 
				targetObj.isVisible = false;
				targetObj.dispose();
			}
		},	
		create_clone: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			position = _this.applyAnimationDirection(position);
			var targetObj = getTargetObject(target);
			if(targetObj){
				/*if(targetObj.parent_handle){
					targetObj = targetObj.parent_handle;
				}*/
				
				var spriteConfig = targetObj.spriteConfig;
				var newObj;
				if(targetObj.spriteConfig.type == "default"){
					newObj = targetObj.clone();
					newObj.material = newObj.material.clone();
					newObj.name = params.name;						
					newObj.setPivotMatrix(BABYLON.Matrix.Translation(-0, targetObj.spriteInfo.size.height/2, -0), false);
				} else if(spriteConfig.type == "spriter"){
					newObj = _this.createSpriterSprite(params.name, spriteConfig.path,  new BABYLON.Vector3(0, spriteConfig.yOffset, 0), false).sprite;		
				} else if(spriteConfig.type == "dragonbones"){
					newObj = _this.createDragonBonesSprite(params.name, spriteConfig.path, spriteConfig.armatureName, new BABYLON.Vector3(0, spriteConfig.yOffset, 0), false, spriteConfig.dragonbonesWorldSize, spriteConfig.canvasDims).sprite;
				} else if(spriteConfig.type == "spine"){
					//newObj = _this.createSpineSprite(params.name, spriteConfig.path, new BABYLON.Vector3(0, spriteConfig.yOffset, 0), false, spriteConfig.canvasDims.width, spriteConfig.canvasDims.height).sprite;
				}
				if(newObj){
					newObj.spriteConfig = targetObj.spriteConfig;
					newObj.spriteInfo = targetObj.spriteInfo;
					newObj.material.diffuseTexture.uScale = targetObj.material.diffuseTexture.uScale;
					newObj.material.diffuseTexture.uOffset = targetObj.material.diffuseTexture.uOffset;
					
					if(targetObj.parent_handle){					
						newObj.position = new BABYLON.Vector3(0, 0, 0);
						newObj.parent_handle = _this.createBg(name, "", position, 0, 1, null, true);
						newObj.parent = newObj.parent_handle;
						newObj.parent.isVisible = false;
						newObj = newObj.parent_handle;				
					}
					newObj.position = position;
					
					_this._animationBackgroundsInfo.push(newObj);
				}				
			}			
		},
		create_spriter_bg: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var width = params.canvasWidth || 1000;
			var height = params.canvasHeight || 1000;
			var bgInfo = _this.createSpriterSprite(
				target, 
				"spriter/"+params.path+"/", 
				_this.applyAnimationDirection(position), 
				_this._animationDirection == -1 ,
				params.animName,
				(params.size || 10 )*1,
				width*1,
				height*1
			);
			
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bgInfo.sprite.parent = parentObj;
				}
			}
		},
		create_spine_bg: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var width = params.canvasWidth || 1000;
			var height = params.canvasHeight || 1000;
			var bgInfo = _this.createSpineSprite(
				target, 
				params.path+"/", 
				_this.applyAnimationDirection(position), 
				_this._animationDirection == -1 ,
				params.animName,
				(params.size || 10 )*1,
				width*1,
				height*1,
				true
			);
			
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bgInfo.sprite.parent = parentObj;
				}
			}
		},
		set_rendering_group: function(target, params){
			var targetObj = getTargetObject(target);
			_this.applyMutator(targetObj, (mesh) => {
				mesh.renderingGroupId = params.id;
			});
		},
		create_model_instance: function(target, params){
			var targetObj = getTargetObject(params.parent);
			if(targetObj){
				 _this._unitModelInfo.push({sprite: targetObj.createInstance(target)});
			}
		},
		create_model: function(target, params){
			let position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			let rotation;
			if(params.rotation){
				rotation = params.rotation;
				if(_this._animationDirection == -1){
					//rotation.y+=Math.PI;
					//rotation.x = rotation.x * -1 + Math.PI;
					rotation.z*=-1;
				}
			} else {
				rotation = new BABYLON.Vector3(0, 0, 0);
			}
			
			const preload = _this.getPreloadedModel(target);
			var bgInfo;
			if(preload){
				bgInfo = _this.prepareModel(preload, target, _this.applyAnimationDirection(position), _this._animationDirection == -1, params.animGroup, params.animName, (params.size || 1 )*1, params.rotation, null, params.unlit * 1);
			} else {
				bgInfo = _this.createModel(
					target, 
					params.path+".glb", 
					_this.applyAnimationDirection(position), 
					_this._animationDirection == -1,
					params.animGroup,
					params.animName,
					(params.size || 1 )*1,
					params.rotation,
					params.unlit * 1
				);	
			}
					
			
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					//bgInfo.sprite.parent = parentObj;
					if(params.moveOriginToParent * 1){
						let parentPos = parentObj.getAbsolutePosition();						
						bgInfo.sprite.position = new BABYLON.Vector3(parentPos.x + position.x, parentPos.y + position.y,parentPos.z + position.z);
					}
					bgInfo.sprite.setParent(parentObj);
				}
			}
		},
		create_unit_model: function(target, params){
			
			
			var targetObj = getTargetObject(target);
			if(targetObj){
				if(targetObj.setEnabled){
					targetObj.setEnabled(true); 
				} else {
					targetObj.isVisible = true;
				}				
			} 
			//return spriteInfo;	
		},
		set_spriter_bg_anim: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._spriterMainSpritesInfo.length){
				if(_this._spriterMainSpritesInfo[ctr].sprite.name == target+"_spriter"){
					targetObj = _this._spriterMainSpritesInfo[ctr];
				}
				ctr++;
			}
			if(targetObj){
				targetObj.renderer.updateAnimation(params.animName);
			}
		},		
		remove_spriter_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.isVisible = false;
				targetObj.dispose();
			}
		},
		remove_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.isVisible = false;
				targetObj.dispose();
			}
		},
		create_dragonbones_bg: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var width = params.canvasWidth || 1000;
			var height = params.canvasHeight || 1000;
			var bgInfo = _this.createDragonBonesSprite(
				target, 
				"dragonbones/"+params.path+"/", 
				params.armatureName, 
				_this.applyAnimationDirection(position), 
				_this._animationDirection == -1 ,
				params.size, 
				{width: width, height: height}, 
				params.animName
			);
			
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bgInfo.sprite.parent = parentObj;
				}
			}
		},
		
		set_dragonbones_bg_anim: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._dragonBonesSpriteInfo.length){
				if(_this._dragonBonesSpriteInfo[ctr].sprite.name == target+"_dragonbones"){
					targetObj = _this._dragonBonesSpriteInfo[ctr];
				}
				ctr++;
			}
			if(targetObj){
				targetObj.stage.updateAnimation(params.animName);
			}
		},
		
		remove_dragonbones_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.isVisible = false;
				targetObj.dispose();
			}
		},
		
		create_layer: function(target, params){
			_this._fixedBgs.forEach(function(bg){	
				bg.dispose();
			});	
			_this._fixedBgs = [];			
			var bg = new BABYLON.Layer(target, this.getCachedImageData("img/SRWBattleScene/"+params.path+".png"), _this._scene, params.isBackground*1);
			_this._fixedBgs.push(bg);
			if(params.animationFrames){
				params.animationDelay*=_this.getTickDuration();
				_this.registerBgAnimation(bg, startTick, params.frameSize*1, params.lineCount*1, params.columnCount*1, 0, params.animationFrames*1, params.animationLoop*1, params.animationDelay*1);
				_this._animationBackgroundsInfo.push(bg);
			}
			
		},
		remove_layer: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},	
		create_sky_box: function(target, params){
			var skybox = BABYLON.MeshBuilder.CreateBox(target, {size:1000.0}, _this._scene);			
			var skyboxMaterial = new BABYLON.StandardMaterial(target+"_material", _this._scene);
			skyboxMaterial.backFaceCulling = false;
			skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(this.getCachedImageData("img/skyboxes/"+params.path), _this._scene);
			skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
			skyboxMaterial.diffuseColor = params.color || new BABYLON.Color3(0, 0, 0);
			skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			skybox.material = skyboxMaterial;
			
		},
		remove_sky_box: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},	
		play_effekseer: function(target, params){					
			let effekInfo;
			if(params.path == "sys_barrier"){
				effekInfo = _this._preloadedEffekseerInfo["ub__sys_barrier"];
			} else {
				effekInfo = _this._preloadedEffekseerInfo[_this._currentAnimatedAction.effekseerId+"__"+target+"__"+params.path];
			}
				
			if(effekInfo){
				const targetContext = effekInfo.targetContext;
				const effect = effekInfo.effect;
				
				var position;
				if(params.autoRotate){
					position = params.position || new BABYLON.Vector3(0,0,0);
				} else {
					position = _this.applyAnimationDirection(params.position || new BABYLON.Vector3(0,0,0));
				}
				var scale = params.scale || 1;
				let parts = String(scale).split(",");
				let xScale;
				let yScale;
				let zScale;
				if(parts.length > 1){
					xScale = parts[0]*1 || 1;
					yScale = parts[1]*1 || 1;
					zScale = parts[2]*1 || 1;
				} else {
					xScale = scale;
					yScale = scale;
					zScale = scale;
				}
				//scale*=_this._animationDirection;
				var speed = params.speed || 1;
				var rotation = params.rotation || new BABYLON.Vector3(0,0,0);
				/*if(params.autoRotate && _this._animationDirection == -1){
					rotation.y = rotation.y * 1 + Math.PI;
					rotation.x = rotation.x * 1 + Math.PI;
				}*/
				
								
				var handle = targetContext.play(effect, position.x, position.y, position.z);

				const _setRotation = handle.setRotation;
				handle.setRotation = function(x, y, z){
					_setRotation.call(this, x, y, z);
					this.rotation = new BABYLON.Vector3(x, y, z);
				}

				const _setLocation = handle.setLocation;
				handle.setLocation = function(x, y, z){
					_setLocation.call(this, x, y, z);
					this.position = new BABYLON.Vector3(x, y, z);
				}

				const _setSpeed = handle.setSpeed;
				handle.setSpeed = function(speed){
					_setSpeed.call(this, speed);
					this.speed = speed;
				}


				handle.setSpeed(speed);

				handle.setRotation(rotation.x, rotation.y, rotation.z);
				handle.setLocation(position.x, position.y, position.z);

				handle.setScale(xScale, yScale, zScale * (params.flipZ ? -1 : 1));
							
						
				const info = {name: target, effect: effect, context: targetContext, offset: {x: position.x, y: position.y, z: position.z}, offsetRotation: {x: rotation.x, y: rotation.y, z: rotation.z}};
				info.handle = handle;
				info.isSysEffect = params.isSysEffect;

				//info.actionIdx = actionIdx;

				if(params.autoRotate && _this._animationDirection == -1){
					info.isMirrored = true;
				}
				info.ignoreParentRotation = params.ignoreParentRotation * 1;
				_this._effekseerInfo.push(info);	
				
				if(params.parent){
					var parentObj = getTargetObject(params.parent)
					
					if(params.isBarrier * 1 && parentObj.pivothelper){
						parentObj = parentObj.pivothelper;
					} else if(!params.attachForShake && parentObj.parent_handle){
						parentObj = parentObj.parent_handle;
					}
					
					if(parentObj){
						info.parent = parentObj;
					}		
					
					//_this.updateParentedEffekseerEffect(effekInfo);	
				}
			}
		},	
		remove_effekseer_parent: function(target, params){	
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr];
				}
				ctr++;
			}
			if(targetObj && targetObj.parent){
				targetObj.position = targetObj.parent.getAbsolutePosition();
				delete targetObj.parent;
			}
		},
		set_effekseer_frame: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setFrame(params.frame * 1);
			}
		},
		play_rmmv_anim: function(target, params){
			var position = _this.applyAnimationDirection(params.position || new BABYLON.Vector3(0,0,0));	
			var width = params.scaleX || 5;
			var height = params.scaleY || 5;
			_this.createRMMVAnimationSprite(target, params.animId, position, {width: width, height: height}, _this._animationDirection == -1 ? true : false, params.loop * 1, params.noFlash * 1, params.noSfx * 1, params.delay * 1, params.isFront);
		},
		remove_rmmv_anim: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},
		stop_rmmv_anim: function(target, params){
			var obj;
			var ctr = 0;
			while(!obj && ctr < _this._RMMVSpriteInfo.length){
				if(_this._RMMVSpriteInfo[ctr].sprite.name == target+"_rmmv"){
					obj = _this._RMMVSpriteInfo[ctr];
				}
				ctr++;
			}
			if(obj){
				obj.RMMVSprite._loop = false;
			}
		},
		play_rmmv_screen_anim: function(target, params){
			var position = _this.applyAnimationDirection(params.position || new BABYLON.Vector3(0,0,0));
			position.x+=555;
			position.y+=324;
			var width = params.scaleX || 5;
			var height = params.scaleY || 5;
			_this.addOverlayPIXISprite(target, params.animId, position, {width: width, height: height}, _this._animationDirection == -1 ? true : false, params.loop * 1, params.noFlash * 1, params.noSfx * 1);
		},
		remove_rmmv_screen_anim: function(target, params){
			var obj;
			var ctr = 0;
			while(!obj && ctr < _this._RMMVScreenSpriteInfo.length){
				if(_this._RMMVScreenSpriteInfo[ctr].name == target+"_rmmv"){
					obj = _this._RMMVScreenSpriteInfo[ctr];
				}
				ctr++;
			}
			if(obj){
				obj.RMMVSprite._hasEnded = true;
			}
		},
		stop_rmmv_screen_anim: function(target, params){
			var obj;
			var ctr = 0;
			while(!obj && ctr < _this._RMMVScreenSpriteInfo.length){
				if(_this._RMMVScreenSpriteInfo[ctr].name == target+"_rmmv"){
					obj = _this._RMMVScreenSpriteInfo[ctr];
				}
				ctr++;
			}
			if(obj){
				obj.RMMVSprite._loop = false;
			}
		},		
		play_movie: function(target, params){			
			_this._moviePlayback = {
				hasEnded: false,
				fadeIn: (params.fade_in || 0) * 1,
				fadeCtr: 0
			};
			var videoElem = _this._movieVideo;
			videoElem.muted = !!(params.muted * 1);
			
			videoElem.src = "img/SRWBattleScene/"+params.path;
			videoElem.crossOrigin = 'anonymous';
			if(_this._animationDirection == -1){
				_this._movieCanvas.style.transform = "scaleX(-1)";
			} else {
				_this._movieCanvas.style.transform = "";
			}
			videoElem.onended = function(){
				_this._moviePlayback.hasEnded = true;
				_this._movieContainer.style.display = "";
			}
			videoElem.play();
		},	
		fade_out_bgm: function(target, params){
			AudioManager.fadeOutBgm((params.duration || 60) / 60);
		},
		fade_in_bgm: function(target, params){
			AudioManager.fadeInBgm((params.duration || 60) / 60);
		},
		stop_movie: function(target, params){
			if(_this._moviePlayback){
				_this._movieContainer.style.display = "";
				_this._movieVideo.pause();
				_this._moviePlayback = null;
			}
		},
		hide_effekseer: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setShown(false);
				targetObj.context.update();
				targetObj.stop();
				//targetObj.context.releaseEffect(targetObj.handle);
				targetObj.context.activeCount--;
			}
		},
		send_effekseer_trigger: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.sendTrigger(params.id * 1);
				if(!targetObj.activeTriggers){
					targetObj.activeTriggers = [];
				}
				targetObj.activeTriggers.push(params.id * 1);
			}
		}, 
		set_effekseer_input: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setDynamicInput(params.paramId, params.value * 1);
			}			
		},
		animate_effekseer_input: function(target, params){
			var targetObj;
			var ctr = 0;
			
			_this.registerEffekseerDynamicParamAnimation(
				getTargetObject(target),
				params.paramId * 1,
				params.startValue * 1,
				params.endValue * 1,
				startTick,
				params.duration, 
				params.easingFunction, 
				params.easingMode
			);
		}, 
		set_effekseer_color: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setAllColor(params.r, params.g, params.b, params.a);
			}
		},
		set_effekseer_attract_point: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setTargetLocation(params.position.x * _this._animationDirection, params.position.y * 1, params.position.z * 1);
			}
		}, 	
		stop_effekseer_root: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.stopRoot();
			}
		},
		set_effekseer_paused: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setPaused(params.paused * 1);
			}
		},


		
		set_sprite_index: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj && targetObj.playAnimation){
				targetObj.playAnimation(params.index, params.index, false, 100);
			}
		},
		set_sprite_animation: function(target, params){
			params = JSON.parse(JSON.stringify(params));
			var targetObj = getTargetObject(target);				
			var targetObj = getTargetObject(target);
			var action = _this._currentAnimatedAction;
			var targetAction = _this._currentAnimatedAction.attacked;
			if(targetObj){
				if(ENGINE_SETTINGS.SINGLE_BATTLE_SPRITE_MODE){
					params.name = "main";
				}
				var sampleMode;
				if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
					sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
				} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
					sampleMode = BABYLON.Texture.NEAREST_NEAREST
				}
				
				var battleEffect;
				if(target == "active_main" || target == "active_support_attacker"){
					battleEffect = action;
				} else if(target == "active_target" || target == "active_support_defender"){
					battleEffect = targetAction;
				}
				if(!battleEffect){
					for(let entry of _this._instantiatedUnits){
						if(entry.name == target){
							battleEffect = {ref: entry.ref};
						}
					}
				}
				let flipX = false;
				if(battleEffect){
					if(battleEffect.side == "actor"){
						flipX = false;
					} else {
						flipX = true;
					}
				}
				
				
				var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);
				
				targetObj.material.diffuseTexture = _this.getCachedTexture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png"); 
				targetObj.material.diffuseTexture.hasAlpha = true;
				targetObj.material.useAlphaFromDiffuseTexture  = true;
				targetObj.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
				
				
				targetObj.material.specularColor = new BABYLON.Color3(0, 0, 0);
				//targetObj.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
				//targetObj.material.ambientColor = new BABYLON.Color3(0, 0, 0);


				if(params.animationFrames){
					params.animationDelay*=_this.getTickDuration();
					_this.registerBgAnimation(targetObj, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames*1, params.animationLoop*1, params.animationDelay, params.holdFrame*1, flipX);
				}
			}
		},
		set_sprite_frame: function(target, params){
			params = JSON.parse(JSON.stringify(params));
			var targetObj = getTargetObject(target);
			var action = _this._currentAnimatedAction;
			var targetAction = _this._currentAnimatedAction.attacked;
			if(targetObj){
				
				var tmp = {};
				Object.keys(_this._bgAnimations).forEach(function(animationId){			
					var animation = _this._bgAnimations[animationId];
					if(targetObj != animation.targetObj){
						tmp[animationId] = _this._bgAnimations[animationId];
					}					
				});	
				_this._bgAnimations = tmp;
				
				if(ENGINE_SETTINGS.SINGLE_BATTLE_SPRITE_MODE){
					params.name = "main";
				} else if(params.name == "hurt" || params.name == "hurt_end"){
					if(target == "active_main" || target == "active_support_attacker" || target == "active_twin"){
						battleEffect = targetAction; 					
					} else if(target == "active_target" || target == "active_support_defender" || target == "active_target_twin"){
						battleEffect = action;					
					}
					if(targetObj.lastAnimation == "block"){
						if(action.damageInflicted / $statCalc.getCalculatedMechStats(targetAction.ref).maxHP < (ENGINE_SETTINGS.BATTLE_SCENE.BLOCK_BREAK_THRESHOLD || 0.2) && targetAction.destroyer != action.ref){
							params.name = "block";	
						}										
					} else if(battleEffect.damageInflicted == 0){						
						params.name = "main";												
					}
				}
				
				if(params.name == "hurt" && ((action.attacked.barrierBroken && _this._debugBarriers == 0) || _this._debugBarriers == 2)){			
					if(_this._activeSysBarrier && !ENGINE_SETTINGS.BATTLE_SCENE.FADE_BARRIER_DURING_NEXT_PHASE){
						var additions = [];					
						additions[startTick + 1] = [									
							//{type: "send_effekseer_trigger", target: target+"sys_barrier", params:{id: 0}},
							//{type: "send_effekseer_trigger", target: target+"sys_barrier", params:{id: 2}}
							{type: "animate_effekseer_input", target: _this._activeSysBarrier, params:{
								paramId: 0,
								startValue: 1,
								endValue: 0,
								duration: 30
							}}
							
						];												
						_this.mergeAnimList(additions);	
					}										
				}
				
				targetObj.lastAnimation = params.name;
				
				if(targetObj.spriteConfig.type == "default"){
					if(!params.spriterOnly){					
						var sampleMode;
						if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
							sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
						} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
							sampleMode = BABYLON.Texture.NEAREST_NEAREST
						}
						
						var flipX;
						var battleEffect;
						if(target == "active_main" || target == "active_support_attacker" || target == "active_twin" ){
							battleEffect = action;					
						} else if(target == "active_target" || target == "active_support_defender" || target == "active_target_twin"){
							battleEffect = targetAction;					
						}
						
						if(battleEffect){
							if(battleEffect.side == "actor"){
								flipX = false;
							} else {
								flipX = true;
							}
						}
						
						
						var imgPath = targetObj.spriteConfig.path;
						
						targetObj.material.diffuseTexture = _this.getCachedTexture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png");//new BABYLON.Texture(this.getCachedTexture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png"), _this._scene, false, true, sampleMode);
						targetObj.material.diffuseTexture.hasAlpha = true;
						targetObj.material.useAlphaFromDiffuseTexture  = true;
						
						targetObj.material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
						targetObj.material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
						targetObj.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
						
						targetObj.material.specularColor = new BABYLON.Color3(0, 0, 0);
						//targetObj.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
						//targetObj.material.ambientColor = new BABYLON.Color3(0, 0, 0);
						
						if(flipX){
							targetObj.material.diffuseTexture.uScale = -1; 
							targetObj.material.diffuseTexture.uOffset = 1; 
						}
					}
				} else if(targetObj.spriteConfig.type == "spriter"){
					if(!params.defaultOnly){
						targetObj.spriteInfo.renderer.updateAnimation(params.name);
					}						
				} else if(targetObj.spriteConfig.type == "dragonbones"){
					targetObj.spriteInfo.stage.updateAnimation(params.name);
				} else if(targetObj.spriteConfig.type == "spine"){
					targetObj.spriteInfo.renderer.updateAnimation(params.name);
				} else if(targetObj.spriteConfig.type == "3D"){
					let isPassive = params.isPassive * 1;
					if(!isPassive){
						for(let animKey in targetObj.animationRef){
							if(!targetObj.animationRef[animKey].startedAsPassive){
								targetObj.animationRef[animKey].stop();
								targetObj.animationRef[animKey].speedRatio = 1	;
							}							
						}
					}
					
					if(!targetObj.lastAnim){
						targetObj.lastAnim = "main";
					}
					if(params.name == "main"){
						const preMainAnimKey = "pre_main";
						if(targetObj.animationRef[preMainAnimKey]){
							let animInfo = targetObj.animationRef[preMainAnimKey];
							animInfo.start(false, 1, animInfo.from * 1, animInfo.to * 1, false);
						}
					}

					const speed = (params.speed || 1) * 1;
					if(params.playAll){
						for(let animKey in targetObj.animationRef){
							let animInfo = targetObj.animationRef[animKey];
							animInfo.start(params.loop * 1, speed, (params.from || animInfo.from) * 1, (params.to || animInfo.to) * 1, false);
						}
					} else {
						if(params.snap || isPassive){
							const animInfo = targetObj.animationRef[params.name];
							if(animInfo){
								if(isPassive){
									animInfo.startedAsPassive = true;
								}
								
								animInfo.start(params.loop * 1, speed, (params.from || animInfo.from) * 1, (params.to || animInfo.to) * 1, false);
							}								
						} else {
							_this.registerAnimationBlend(targetObj, params.name, params.loop * 1, speed);	
						}		
					}
					if(!isPassive){	
						targetObj.lastAnim = params.name;
					}	
					
				}						
			}
		},
		show_attachment: function(target, params){
			const targetObj = getTargetObject(target);		
			/*targetObj.getChildMeshes().forEach(m => {
				if(m.id.indexOf(params.attachId) == 0){
					m.isVisible = true;
				}
			});*/		
			_this.showAttachment(targetObj, params.attachId);				
		},
		hide_attachment: function(target, params){
			const targetObj = getTargetObject(target);		
			/*targetObj.getChildMeshes().forEach(m => {
				if(m.id.indexOf(params.attachId) == 0){
					m.isVisible = false;
				}
			});*/
			let stack = [];
			stack.push(targetObj);
			let attNodes = [];
			while(stack.length){
				let current = stack.shift();
				if(current.id.indexOf(params.attachId) == 0){
					attNodes.push(current);
				}
				
				let children = current.getChildren();
				
				let materialLeaves = {};
				for(let child of children){		
					stack.push(child);		
				}
			}
			
			stack = attNodes;
			while(stack.length){
				let current = stack.shift();
				current.isVisible = false;
				let children = current.getChildren();
				for(let child of children){		
					stack.push(child);		
				}
			}
		},
		hide_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				if(targetObj.setEnabled){
					targetObj.setEnabled(false); 
				} else {
					targetObj.isVisible = false;
				}				
			} 
			
		},
		show_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				if(targetObj.setEnabled){
					targetObj.setEnabled(true); 
				} else {
					targetObj.isVisible = true;
				}				
			} 			
		},
		hide_bgs: function(target, params){
			_this._bgsHidden = true;
			_this._bgs.forEach(function(bg){
				bg.isVisible = false;
				bg.visibility = 0;
			});
			
			_this._fixedBgs.forEach(function(bg){
				bg.scale.x = 0;
				bg.scale.y = 0;
				bg.scale.z = 0;
			});
		},
		show_bgs: function(target, params){
			_this._bgsHidden = false;
			
			_this._bgs.forEach(function(bg){
				if(!bg.inactive){
					bg.isVisible = true;
					bg.visibility = 1;
				}				
			});
			
			_this._fixedBgs.forEach(function(bg){
				bg.scale.x = 1;
				bg.scale.y = 1;
				bg.scale.z = 1;
			});			
		},
		reset_position: function(target, params){
			if(!target){
				target = "active_target";
			}
			var targetObj = getTargetObject(target);
			
			var targetOffset = (_this._defaultPositions.camera_main_idle.x * _this._animationDirection * -1) - _this._camera.position.x;
			
			var changeScrollDirection = true;
			if($gameTemp.defenderCounterActivated && _this._currentAnimatedAction.type != "defender"){
				changeScrollDirection = false;
			}
			if(!$gameTemp.defenderCounterActivated && _this._currentAnimatedAction.type != "initiator"){
				changeScrollDirection = false;
			}
			
			if(_this._currentAnimatedAction.attacked && _this._currentAnimatedAction.attacked.isDestroyed){
				changeScrollDirection = false;
			}
			
			if(changeScrollDirection){
				if(_this._currentAnimatedAction.side == "actor"){
					_this.setBgScrollDirection(-1);		
				} else {
					_this.setBgScrollDirection(1);		
				}
			}			
				
			_this._camera.position.x = _this._defaultPositions.camera_main_idle.x * _this._animationDirection * -1;

			_this._cameraParent.x = 0;
			_this._cameraParent.y = 0;
			_this._cameraParent.z = 0;
			
			if(_this._actorSprite && _this._actorSprite.sprite.parent_handle.wasMoved){
				_this._actorSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._actorTwinSprite && _this._actorTwinSprite.sprite.parent_handle.wasMoved){
				_this._actorTwinSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._enemySprite && _this._enemySprite.sprite.parent_handle.wasMoved){
				_this._enemySprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._enemyTwinSprite && _this._enemyTwinSprite.sprite.parent_handle.wasMoved){
				_this._enemyTwinSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._actorSupporterSprite && _this._actorSupporterSprite.sprite.parent_handle.wasMoved){
				_this._actorSupporterSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._actorTwinSupporterSprite && _this._actorTwinSupporterSprite.sprite.parent_handle.wasMoved){
				_this._actorTwinSupporterSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._enemySupporterSprite && _this._enemySupporterSprite.sprite.parent_handle.wasMoved){
				_this._enemySupporterSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			if(_this._enemyTwinSupporterSprite && _this._enemyTwinSupporterSprite.sprite.parent_handle.wasMoved){
				_this._enemyTwinSupporterSprite.sprite.parent_handle.position.x+=targetOffset;
			}
			
			//this should be done through UV scrolling, but changing the UV on the same frame as the camera position causes flickering?
			_this._bgs.forEach(function(bg){	
				if(!bg.inactive){ 
					bg.position.x+=targetOffset % bg.sizeInfo.width;	
				}
				
			});
			_this._bgInstances.forEach(function(bg){	
				if(!bg.inactive){
					bg.position.x+=targetOffset % bg.sizeInfo.width;	
				}
			});
			
			
			if(targetObj){
				//targetObj.playAnimation(1, 1, false, 100)			
				if(!params.duration){
					params.duration = 10;
				}
				
				var targetPostion
				if(target == "active_target_twin"){
					targetPostion = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_twin_idle);
				} else {
					targetPostion = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_main_idle);
				}
				
				
				/*if(targetObj == _this._actorSprite.sprite || targetObj == _this._actorSupporterSprite.sprite){
					_this.registerMatrixAnimation("translate", targetObj, _this.applyAnimationDirection(targetObj.position), targetPostion, startTick, params.duration);
				} else if(targetObj == _this._enemySprite.sprite || targetObj == _this._enemySupporterSprite.sprite) {
					_this.registerMatrixAnimation("translate", targetObj, targetObj.position, targetPostion, startTick, params.duration);
				}*/
				
				var additions = [];
				
				var action = _this._currentAnimatedAction.attacked;
				var entityType = action.isActor ? "actor" : "enemy";
				var hasSpecialEvasion = false;
				if(action.specialEvasion){		
					var patternId = action.specialEvasion.dodgePattern;
					var animDef = {
						full_anim: "null"
					};
					if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
						animDef =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId];
					}
					if(animDef.full_anim_return != null){
						hasSpecialEvasion = true;
						var animData = _this._animationBuilder.buildAnimation(animDef.full_anim_return, _this).mainAnimation;
						var additions = [];
						Object.keys(animData).forEach(function(tick){
							additions[startTick * 1 + tick * 1 + 1] = animData[tick];
						});
						_this.mergeAnimList(additions);
					} 
				} else {
					if(!action.isHit){
						var action = _this.getTargetAction(target);
						if(!params.noReposition){
							if(action.side == "actor"){
								if(_this.applyAnimationDirection(targetPostion).x > targetObj.parent_handle.position.x){								
									additions[startTick + 1] = [									
										{type: "set_sprite_frame", target: target, params:{name: "out"}},
									];
								} else if(_this.applyAnimationDirection(targetPostion).x < targetObj.parent_handle.position.x){
									additions[startTick + 1] = [									
										{type: "set_sprite_frame", target: target, params:{name: "in"}},
									];
								}							
							} else {
								if(_this.applyAnimationDirection(targetPostion).x > targetObj.parent_handle.position.x){								
									additions[startTick + 1] = [									
										{type: "set_sprite_frame", target: target, params:{name: "in"}},
									];
								} else if(_this.applyAnimationDirection(targetPostion).x < targetObj.parent_handle.position.x){
									additions[startTick + 1] = [									
										{type: "set_sprite_frame", target: target, params:{name: "out"}},
									];
								}
							}
						}						
					}
				}				
					
				
				if(!hasSpecialEvasion && !params.noReposition){
					
					_this.registerMatrixAnimation("translate", targetObj.parent_handle, _this.applyAnimationDirection(targetObj.parent_handle.position), targetPostion, startTick, params.duration);
				}
				
				
				additions[startTick + params.duration] = [];
				if(!params.noDamage && action.isHit){
					additions[startTick + params.duration].push({type: "show_damage", target: target, params:{}});		
					
				}
				
				if(_this._activeSysBarrier){
					if(!action.barrierBroken && _this._debugBarriers != 2 && !ENGINE_SETTINGS.BATTLE_SCENE.FADE_BARRIER_DURING_NEXT_PHASE){
						additions[startTick + params.duration].push(									
							{type: "animate_effekseer_input", target: _this._activeSysBarrier, params:{
								paramId: 0,
								startValue: 1,
								endValue: 0,
								duration: 30
							}}
						);	
	
										
					}
				}
				
				
				var action = _this.getTargetAction(target);
			
				if(!params.noDamageText && !action.isDestroyed && action.isHit){
					additions[startTick + params.duration].push({type: "set_damage_text", target: target, params:{}});	
					
				}
				
				if(!action.isHit){
					additions[startTick + params.duration].push({type: "set_sprite_frame", target: target, params:{name: "main"}});	
				}
				
				if(action.isHit && !action.isDestroyed){
					if(targetObj.spriteConfig.type == "spriter" || targetObj.spriteConfig.type == "dragonbones"){
						additions[startTick + params.duration + 50] = [
							{type: "set_sprite_frame", target: target, params:{name: "hurt_end"}},
						];
					} else {
						additions[startTick + params.duration + 50] = [
							{type: "set_sprite_frame", target: target, params:{name: "main"}},
						];
					}				
				}	
				_this.mergeAnimList(additions);		
			}
		},
		show_barrier: function(target, params){
			var targetObj = getTargetObject(target);
			var action = _this._currentAnimatedAction;
			var additions = [];
			if((action.attacked && action.attacked.hasBarrier) || _this._debugBarriers > 0){				
				targetObj.lastAnimation = "block";
				let scale = $statCalc.getBattleSceneInfo(action.attacked.ref).barrierScale || 3.5;
				let color;
				if(action.attacked.barrierColors){
					for(let bColor of action.attacked.barrierColors){
						if(bColor){
							bColor = bColor.replace("#", "");
							if(!color){
								color = hexToRgbArray(bColor);
							} else {
								color = colorMixer(color, hexToRgbArray(bColor), 0.5);
							}
						}						
					}
				} 
				if(!color){
					color = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_BARRIER_COLOR || "#7c00e6";
					color = color.replace("#", "");
					color = hexToRgbArray(color);
				}
				
				function hexToRgb(hex) {
					var bigint = parseInt(hex, 16);
					var r = (bigint >> 16) & 255;
					var g = (bigint >> 8) & 255;
					var b = bigint & 255;
				
					return {
						r: r,
						g: g,
						b: b
					};
				}

				function hexToRgbArray(hex) {
					const values = hexToRgb(hex);
					return [values.r, values.g, values.b];
				}

				//colorChannelA and colorChannelB are ints ranging from 0 to 255
				function colorChannelMixer(colorChannelA, colorChannelB, amountToMix){
					var channelA = colorChannelA*amountToMix;
					var channelB = colorChannelB*(1-amountToMix);
					return parseInt(channelA+channelB);
				}
				//rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
				//example (red): rgbA = [255,0,0]
				function colorMixer(rgbA, rgbB, amountToMix){
					var r = colorChannelMixer(rgbA[0],rgbB[0],amountToMix);
					var g = colorChannelMixer(rgbA[1],rgbB[1],amountToMix);
					var b = colorChannelMixer(rgbA[2],rgbB[2],amountToMix);
					return [r, g, b];
				}

				const encodedColorValue = color[0] * 65536 + color[1] * 256 + color[2];			
				additions[startTick + 1] = [];

				//account for multiple activations during the same battle scene(support attacks)
				let targetName = target+"sys_barrier";
				let ctr = 0;
				while(_this.getTargetObject(targetName) != null){
					targetName = targetName + "_" + ctr;
					ctr++;
				}

				_this._activeSysBarrier = targetName;

				additions[startTick + 1].push({type: "play_effekseer", target: _this._activeSysBarrier, params:{path: "sys_barrier", parent: target, scale: scale, isBarrier: true, isSysEffect: true}});

				additions[startTick + 1].push({type: "animate_effekseer_input", target: _this._activeSysBarrier, params:{
					paramId: 0,
					startValue: 0,
					endValue: 1,
					duration: 30
				}});
				additions[startTick + 1].push({type: "set_effekseer_input", target: _this._activeSysBarrier, params:{
					paramId: 1,
					value: encodedColorValue
				}});
				if(ENGINE_SETTINGS.BATTLE_SCENE.FADE_BARRIER_DURING_NEXT_PHASE){
					if(!additions[startTick + 25]){
						additions[startTick + 25] = [];
					}
					additions[startTick + 25].push({type: "animate_effekseer_input", target: _this._activeSysBarrier, params:{
						paramId: 0,
						startValue: 1,
						endValue: 0,
						duration: 30
					}});
				}
						
			}
			_this.mergeAnimList(additions);	
		},
		destroy: function(target, params){
			var targetObj = getTargetObject(target);
			
			var noWait = (params.noWait || 0) * 1;
					
			var action = _this.getTargetAction(target);
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "destroyed", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			
			_this._awaitingText = true;
			_this._TextlayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText, true).then(function(){
				_this._awaitingText = false;
			});
			
			var animId = $statCalc.getBattleSceneInfo(action.ref).deathAnimId;
			if(animId == null || animId == ''){
				animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
			}
			var animData = _this._animationBuilder.buildAnimation(animId, _this).mainAnimation;
			if(!noWait){
				_this.delayAnimationList(startTick + 1, animData.length);
			}
			
			var additions = [];
			Object.keys(animData).forEach(function(tick){
				var tickCommands = animData[tick];
				if(target == "active_target_twin"){
					//fudge the command targeting and offsets to fit the position of the twin					
					tickCommands.forEach(function(command){
						if(command.params){
							if(command.params.position){
								command.params.position.x+=(_this._defaultPositions.enemy_twin_idle.x - _this._defaultPositions.enemy_main_idle.x);
								command.params.position.y+=(_this._defaultPositions.enemy_twin_idle.y - _this._defaultPositions.enemy_main_idle.y);
								command.params.position.z+=(_this._defaultPositions.enemy_twin_idle.z - _this._defaultPositions.enemy_main_idle.z);
							}							
						}
						if(command.target == "active_target"){
							command.target = "active_target_twin";
						}
					});
				}
				
				additions[startTick * 1 + tick * 1 + 1] = tickCommands;
			});
			_this.mergeAnimList(additions);
		},
		show_damage: function(target, params){	
			var originalAction = _this._currentAnimatedAction;
			var action = _this._currentAnimatedAction.attacked;
			var side = action.side;			
			var offsets;
			var displayNum = 0;
			if(target == "active_target_twin"){
				action = _this.getTargetAction(target);
				displayNum = 1;
				offsets = {top: 16, left: 78};
				if(ENGINE_SETTINGS.BATTLE_SCENE.DAMAGE_TWIN_OFFSET){
					offsets = ENGINE_SETTINGS.BATTLE_SCENE.DAMAGE_TWIN_OFFSET;
				}
				_this._UILayerManager.showDamage(side, originalAction.damageInflicted_all_sub, offsets, displayNum);
				action.currentAnimHP-=originalAction.damageInflicted_all_sub;
			} else {
				offsets = {top: 20, left: 60};
				if(ENGINE_SETTINGS.BATTLE_SCENE.DAMAGE_OFFSETS){
					offsets = ENGINE_SETTINGS.BATTLE_SCENE.DAMAGE_OFFSETS;
				}
				_this._UILayerManager.showDamage(side, originalAction.damageInflicted, offsets, displayNum);
				action.currentAnimHP-=originalAction.damageInflicted;
			}
			
			
			
			
			if(originalAction.inflictedCritical){
				_this._UILayerManager.setNotification(action.isActor ? "enemy" : "actor", "CRITICAL!");
			}
			var popUpNotifications = [];
			if(action.isHit && action.barrierNames){
				action.barrierNames.forEach(function(name){
					popUpNotifications.push({text: name, additionalClass: ""});
				});				
			}
			
			if(originalAction.damageInflicted > 0){
				var resistance = $statCalc.applyMaxStatModsToValue(action, 0, ["status_resistance"]);
				if(resistance < 1 || (originalAction.hasFury && resistance == 1)){
					Object.keys(originalAction.statusEffects).forEach(function(inflictionId){
						if(originalAction.statusEffects[inflictionId]){
							popUpNotifications.push({text: APPSTRINGS.STATUS_BY_INFLICTION_ID[inflictionId].name, additionalClass: "status"});							
						}
					});
				}	
			}			

		
			if(originalAction.attacked?.specialEvasion){
				var patternId = originalAction.attacked?.specialEvasion.dodgePattern;
				if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
					if(ENGINE_SETTINGS.DODGE_PATTERNS[patternId].treat_as_block){
						popUpNotifications.push({text: originalAction.attacked.specialEvasion.name, additionalClass: "evasion"});	
					}
							
				}
			}

			_this._UILayerManager.setPopupNotification(action.isActor ? "actor" : "enemy", popUpNotifications);
						
			if(originalAction.HPRestored){
				var stats = $statCalc.getCalculatedMechStats(originalAction.ref);
				var recovered = originalAction.HPRestored;
				
				if(originalAction.currentAnimHP < stats.maxHP){				
					var startValue = originalAction.currentAnimHP;
					var endValue = originalAction.currentAnimHP + recovered;
					
					var startPercent = (startValue / stats.maxHP * 100);
					var endPercent = (endValue / stats.maxHP * 100);
					if(endPercent < 0){
						endPercent = 0;
					}
					if(endPercent > 100){
						endPercent = 100;
					}
					originalAction.currentAnimHP = endValue;
					var drainInfoKey = target + "_" + (action.ref.isSubTwin ? "twin" : "");
					if(!_this._barDrainInfo[drainInfoKey]) {
						_this._barDrainInfo[drainInfoKey] = {};
					}	
					if(typeof _this._barDrainInfo[drainInfoKey].HP == "undefined"){
						_this._barDrainInfo[drainInfoKey].HP = 0;
					}
					_this._barDrainInfo[drainInfoKey].HP = endPercent;
					_this._UILayerManager.animateHP(originalAction.side, originalAction.ref.isSubTwin ? "twin" : "main", startPercent, endPercent, params.duration || 500);
					_this._UILayerManager.setNotification(originalAction.side, "HP DRAIN");
				}
			}			
		},
		drain_hp_bar: function(target, params){			
			var originalAction = _this._currentAnimatedAction;
			var action = _this.getTargetAction(target);
			var originalTarget = target;
			var target = action.side;
			var stats = $statCalc.getCalculatedMechStats(action.ref);
			var drainInfoKey = target + "_" + (action.ref.isSubTwin ? "twin" : "");
			if(!_this._barDrainInfo[drainInfoKey]) {
				_this._barDrainInfo[drainInfoKey] = {};
			}	
			if(typeof _this._barDrainInfo[drainInfoKey].HP == "undefined"){
				_this._barDrainInfo[drainInfoKey].HP = 0;
			}
			
			var totalDamage;

			if(originalTarget == "active_target_twin"){
				totalDamage = Math.min(originalAction.damageInflicted_all_sub, action.currentAnimHP);
			} else {
				totalDamage = Math.min(originalAction.damageInflicted, action.currentAnimHP);
			}			
			
			var startValue = action.currentAnimHP - (_this._barDrainInfo[drainInfoKey].HP /100 * totalDamage);
			var endValue = action.currentAnimHP - (params.percent /100 * totalDamage);
			
			var startPercent = (startValue / stats.maxHP * 100);
			var endPercent = (endValue / stats.maxHP * 100);
			if(endPercent < 0){
				endPercent = 0;
			}
			_this._barDrainInfo[drainInfoKey].HP = params.percent;
			_this._UILayerManager.animateHP(target, action.ref.isSubTwin ? "twin" : "main", startPercent, endPercent, params.duration * _this.getTickDuration() || 500);
		},
		drain_en_bar: function(target, params){			
			var action = _this._currentAnimatedAction;
			if(action.ENUsed != -1){
				action.ENDrainShown = true;
				var target = action.side;
				var stats = $statCalc.getCalculatedMechStats(action.ref);
				var drainInfoKey = target + "_" + (action.ref.isSubTwin ? "twin" : "");
				if(!_this._barDrainInfo[drainInfoKey]) {
					_this._barDrainInfo[drainInfoKey] = {};
				}	
				if(typeof _this._barDrainInfo[drainInfoKey].EN == "undefined"){
					_this._barDrainInfo[drainInfoKey].EN = 0;
				}
				var startValue = action.currentAnimEN;
				var endValue = action.currentAnimEN - action.ENUsed;
				action.currentAnimEN = endValue;
				var startPercent = (startValue / stats.maxEN * 100);
				var endPercent = (endValue / stats.maxEN * 100);
				if(endPercent < 0){
					endPercent = 0;
				}
				_this._barDrainInfo[drainInfoKey].EN = params.percent;
				_this._UILayerManager.animateEN(target, action.ref.isSubTwin ? "twin" : "main", startPercent, endPercent, params.duration * _this.getTickDuration() || 500);
				
			}			
		},
		play_se: function(target, params){
			var se = {};
			se.name = params.seId;
			se.pan = 0;
			se.pitch = params.pitch || 100;
			se.volume = params.volume || 100;
			AudioManager.playSe(se);
		},
		kill_se: function(target, params){
			AudioManager.stopSe(target)
		},
		fade_out_se: function(target, params){
			AudioManager.fadeOutSe(params.seId, (params.duration || 60) / 60);
		},
		create_target_environment: function(target, params){
			if(target == "active_main"){
				_this.showEnvironment(_this._currentAnimatedAction.ref);
			} else {
				_this.showEnvironment(_this._currentAnimatedAction.originalTarget.ref);
			}			
		},
		create_command_environment: async function(target, params){
			//await _this.createEnvironment({commandBgId: params.id});
			_this.showEnvironment({commandBgId: params.id});
		},		
		show_portrait_noise: function(target, params){
			_this._TextlayerManager.showNoise();
		},
		hide_portrait_noise: function(target, params){
			_this._TextlayerManager.hideNoise();
		},
		set_bg_scroll_ratio: function(target, params){
			if(params.smooth * 1){
				_this._targetScrollRatio = params.ratio || 0;
				_this._scrollRatioDuration = params.duration || 0;
				_this._scrollRatioCtr = _this._scrollRatioDuration;
			} else {
				_this.setBgScrollRatio(params.ratio || 0);
			}			
		},
		set_animation_ratio: function(target, params){
			if(params.smooth * 1){
				_this._targetAnimRatio = params.ratio || 0;
				_this._startAnimRatio = _this._animRatio;
				_this._animRatioDuration = params["duration(ms)"] || 0;
				_this._animRatioTransitionStart = Date.now();
				if(params.easingFunction && params.easingMode){
					_this._animRatioEasingFunction = params.easingFunction;
					_this._animRatioEasingFunction.setEasingMode(params.easingMode);
				}
				
			} else {
				_this.setAnimRatio(params.ratio || 0);
			}			
		},
		hold_tick: function(target, params){			
			_this._holdTickDuration = params["duration(ms)"] || 0;
		},
		toggle_bg_scroll: function(target, params){
			_this.setBgScrollDirection(_this._bgScrollDirection * -1);
		},
		include_animation: function(target, params){
			const animationData = _this._animationBuilder.buildAnimation(params.battleAnimId, _this);
			const targetAnimationId = params.sequenceId || "mainAnimation";
			const additions = animationData[targetAnimationId];
			if(additions){
				let tmp = [];
				for(var i = 0; i < additions.length; i++){
					if(additions[i]){
						tmp[i + startTick + 1] = additions[i];
					}			
				}
				_this.mergeAnimList(tmp);	
			}				
		},
		merge_complete_animation: function(target, params){
			const animationData = _this._animationBuilder.buildAnimation(params.battleAnimId, _this);
			const additions = _this.constructAnimationList(_this._currentAnimatedAction, animationData);
			
			if(additions){
				let tmp = [];
				for(var i = 0; i < additions.length; i++){
					if(additions[i]){
						tmp[i + startTick + 1] = additions[i];
					}			
				}
				_this.mergeAnimList(tmp);	
			}				
		}, 
		set_shadow_floor: function(target, params){
			_this._shadowFloor = (params.floor || 0 ) * 1;
		}
	};
	
	animationHandlers["set_model_animation"] = animationHandlers["set_sprite_frame"];
	if(animationHandlers[animation.type] && _this._currentAnimatedAction){
		animationHandlers[animation.type](animation.target, animation.params || {});
	}
}

BattleSceneManager.prototype.getTargetAction = function(target){
	/*if(this._currentAnimatedAction.side == "enemy"){
		if(target == "active_target_twin"){
			if(this._participantInfo.actor_twin.participating){
				return this._participantInfo.actor_twin.effect;
			} 
		} 
		return this._participantInfo.actor.effect;
	} else {
		if(target == "active_target_twin"){
			if(this._participantInfo.enemy_twin.participating){
				return this._participantInfo.enemy_twin.effect;
			} 
		} 
		return this._participantInfo.enemy.effect;
	}	*/
	if(target == "active_target_twin" && this._currentAnimatedAction.attacked_all_sub){
		return this._currentAnimatedAction.attacked_all_sub;
	} 
	if(this._currentAnimatedAction.attacked){
		return this._currentAnimatedAction.attacked;
	}
	return this._currentAnimatedAction.attacked_all_sub;
}

BattleSceneManager.prototype.showAttachment = function(targetObj, attachId){
	let stack = [];
	stack.push(targetObj);
	let attNodes = [];
	while(stack.length){
		let current = stack.shift();
		if(current.id.indexOf(attachId) == 0){
			attNodes.push(current);
		}
		
		let children = current.getChildren();
		
		let materialLeaves = {};
		for(let child of children){		
			stack.push(child);		
		}
	}

	stack = attNodes;
	while(stack.length){
		let current = stack.shift();
		current.isVisible = true;
		let children = current.getChildren();
		for(let child of children){		
			stack.push(child);		
		}
	}
}


BattleSceneManager.prototype.startAnimation = function(){
	
	var _this = this;
	
	_this._runningAnimation	= true;
	_this._lastAnimationTickTime = new Date().getTime();
	_this._animationStartTickTime = _this._lastAnimationTickTime;
	_this._currentAnimationTick = 0;
	_this._animTimeAccumulator = 0;
	_this._currentAnimationTickHiRes = 0;
	_this._lastAnimationTick = -1;	
	_this._holdTickDuration = 0;
	_this._animRatio = 1;
	_this._barDrainInfo = {};
	_this._animationPromise = new Promise(function(resolve, reject){
		_this._animationResolve = resolve;
		_this._animationReject = reject;
	});
	_this._animationPromise.instanceId = _this._instanceId;
	return _this._animationPromise;
}

BattleSceneManager.prototype.playIntroAnimation = function(){
	this._playingIntro = true;
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "translate", target: "Camera", params: {startPosition: this._defaultPositions.camera_main_intro, position: this._defaultPositions.camera_main_idle, duration: 25, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}}
	];
	
	this._animationList[60] = []; //padding
	return this.startAnimation();
}

BattleSceneManager.prototype.playTwinIntroAnimation = function(){
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "set_sprite_frame", target: "active_main", params: {name: "out"}},
		{type: "translate", target: "active_main", params: {startPosition: this._defaultPositions.ally_main_idle, position: this._defaultPositions.ally_support_idle, duration: 20}},
	];	
	
	this._animationList[20] = [
		{type: "set_sprite_frame", target: "active_main", params: {name: "main"}},
		{type: "set_sprite_frame", target: "active_twin", params: {name: "in"}},
		{type: "translate", target: "active_twin", params: {startPosition: this._defaultPositions.ally_twin_idle, position: this._defaultPositions.ally_main_idle, duration: 15}}
	];
	this._animationList[35] = [
		{type: "set_sprite_frame", target: "active_twin", params: {name: "main"}},
	]
	
	this._animationList[80] = []; //padding
	return this.startAnimation();
}

BattleSceneManager.prototype.playTwinMainIntroAnimation = function(){
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "set_sprite_frame", target: "active_twin", params: {name: "out"}},
		{type: "translate", target: "active_twin", params: {startPosition: this._defaultPositions.ally_twin_idle, position: new BABYLON.Vector3(10, 0, 3), duration: 20}},
	];		
	
	this._animationList[35] = [
		{type: "set_sprite_frame", target: "active_twin", params: {name: "main"}},
	]
	
	this._animationList[60] = []; //padding
	return this.startAnimation();
}

BattleSceneManager.prototype.playCounterTwinAnimation = function(){
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "set_sprite_frame", target: "active_target", params: {name: "out"}},
		{type: "translate", target: "active_target", params: {startPosition: this._defaultPositions.enemy_main_idle, position: this._defaultPositions.enemy_support_idle, duration: 20}},
	];	
	
	this._animationList[20] = [
		{type: "set_sprite_frame", target: "active_target", params: {name: "main"}},
		{type: "set_sprite_frame", target: "active_target_twin", params: {name: "in"}},
		{type: "translate", target: "active_target_twin", params: {startPosition: this._defaultPositions.enemy_twin_idle, position: this._defaultPositions.enemy_main_idle, duration: 15}}
	];
	this._animationList[35] = [
		{type: "set_sprite_frame", target: "active_target_twin", params: {name: "main"}},
	]
	
	this._animationList[80] = []; //padding
	return this.startAnimation();
}

BattleSceneManager.prototype.playCounterTwinMainIntroAnimation = function(){
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "set_sprite_frame", target: "active_target_twin", params: {name: "out"}},
		{type: "translate", target: "active_target_twin", params: {startPosition: this._defaultPositions.enemy_twin_idle, position: new BABYLON.Vector3(-10, 0, 3), duration: 20}},
	];		
	
	this._animationList[60] = []; //padding
	return this.startAnimation();
}


BattleSceneManager.prototype.mergeAnimList = function(additions){
	var _this = this;
	if(additions){
		for(var i = 0; i < additions.length; i++){
			if(additions[i]){
				if(!_this._animationList[i]){
					_this._animationList[i] = [];
				}
				_this._animationList[i] = _this._animationList[i].concat(additions[i]);
			}			
		}
	}	
}

BattleSceneManager.prototype.constructAnimationList = function(cacheRef, attackDef){
	const targetList = attackDef.mainAnimation; //the def retrieved from the BattleAnimationBuilder is already a clone, so no worries about modifying the underlying definition
	function mergeAnimList(additions){
		for(var i = 0; i < additions.length; i++){
			if(additions[i]){
				if(!targetList[i]){
					targetList[i] = [];
				}
				targetList[i] = targetList[i].concat(additions[i]);
			}			
		}
	}
	
	function overwriteAnimList(additions){
		for(var i = 0; i < additions.length; i++){
			if(additions[i]){
				if(!targetList[i]){
					targetList[i] = [];
				}
				targetList[i] = additions[i];
			}			
		}
	}
	let isBlockingMiss = false;
	if(cacheRef.attacked?.specialEvasion){
		var patternId = cacheRef.attacked.specialEvasion.dodgePattern;
		if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
			isBlockingMiss =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId].treat_as_block;
		}
	}
	if(cacheRef.hits || isBlockingMiss){
		mergeAnimList(attackDef.onHit);
		if(attackDef.onHitOverwrite){
			overwriteAnimList(attackDef.onHitOverwrite);
		}
		if(cacheRef.attacked){			
			if(cacheRef.attacked.isDestroyed && cacheRef.attacked.destroyer == cacheRef.ref && cacheRef.attacked.destroyedOrderIdx == cacheRef.actionOrder){
				mergeAnimList(attackDef.onDestroy);
				if(attackDef.onDestroyOverwrite){
					overwriteAnimList(attackDef.onDestroyOverwrite);
				}	
			}  else {
				if(attackDef.onNoDestroy){
					mergeAnimList(attackDef.onNoDestroy);
				}
				if(attackDef.onNoDestroyOverwrite){
					overwriteAnimList(attackDef.onNoDestroyOverwrite);
				}
			}			
		} 	
	} else {
		mergeAnimList(attackDef.onMiss);
		if(attackDef.onMissOverwrite){
			overwriteAnimList(attackDef.onMissOverwrite);
		}
	}
	if(cacheRef.attacked_all_sub){
		if(cacheRef.hits_all_sub){		
			mergeAnimList(attackDef.onHitTwin);		
			if(cacheRef.attacked_all_sub){
				if(cacheRef.attacked_all_sub.isDestroyed && cacheRef.attacked_all_sub.destroyer == cacheRef.ref && cacheRef.attacked_all_sub.destroyedOrderIdx == cacheRef.actionOrder){
					mergeAnimList(attackDef.onDestroyTwin);
				} else {
					mergeAnimList(attackDef.onNoDestroyTwin);
				}
			}
				
		} else {			
			mergeAnimList(attackDef.onMissTwin);			
		}
	}
	return targetList;
}

BattleSceneManager.prototype.playAttackAnimation = function(cacheRef, attackDef){
	var _this = this;
	//console.log("playAttackAnimation");
	
	this._animationList = this.constructAnimationList(cacheRef, attackDef);
	
	
	//force participating sprites to their idle stance
	if(!_this._animationList[0]){
		_this._animationList[0] = [];
	}
	_this._animationList[0].unshift({type: "set_sprite_frame", target: "active_target", params: {name: "main"}});
	_this._animationList[0].unshift({type: "set_sprite_frame", target: "active_target_twin", params: {name: "main"}});
	_this._animationList[0].unshift({type: "set_sprite_frame", target: "active_support_defender", params: {name: "main"}});
	_this._animationList[0].unshift({type: "set_sprite_frame", target: "active_main", params: {name: "main"}});
	
	return this.startAnimation();
}

BattleSceneManager.prototype.playDefaultAttackAnimation = function(cacheRef){
	var _this = this;
	
	var mainAnimation = {};
	
	mainAnimation[0] = [
		{type: "set_sprite_index", target: "active_main", params: {index: 1}},
		{type: "set_sprite_index", target: "active_target", params: {index: 0}},
		{type: "translate", target: "active_main", params: {startPosition: _this._defaultPositions.ally_main_idle, position: new BABYLON.Vector3(-6, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "translate", target: "Camera", params: {startPosition: _this._defaultPositions.camera_main_idle, position: new BABYLON.Vector3(-4, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "drain_en_bar", target: "", params: {percent: 100}} //percent of damage inflicted
	];
	mainAnimation[31] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(-6, 0, 1), position: new BABYLON.Vector3(-12, 0, 1), duration: 20}},
	];
	mainAnimation[70] = [
		{type: "next_phase", target: "", params: {commands: [
			{target: "active_main", type: "show_sprite", params: {}},
			{target: "active_target", type: "show_sprite", params: {}},
			{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},			
			{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},		
		]}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}}, 
		
	];//padding
	
	mainAnimation[130] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(6, 0, 0.99), position: new BABYLON.Vector3(-6, 0, 0.99), duration: 30}}
	];
	
	var onHit = {};
	
	onHit[150] = [
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-2.7, 0, 1), duration: 4, easingFunction: new BABYLON.QuarticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "spawn_sprite", target: "hit", params: {position: new BABYLON.Vector3(-2, 0, 0.8), path: "effects/Hit1", frameSize: 192, animationFrames: 4, animationDelay: 100, animationLoop: false}},
		{type: "drain_hp_bar", target: "", params: {percent: 100}} //percent of damage inflicted
	];
	onHit[160] = [
		{type: "remove_sprite", target: "hit", params: {}}
	];
	onHit[200] = [
		{type: "reset_position", target: "active_target", params: {duration: 10}}
	];
	
	onHit[300] = [];//padding
	var onMiss = {};
	
	
	onMiss[150] = [
		{type: "dodge_pattern", target: "", params: {commands: [
			{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-2.5, 0.5, 1), duration: 4, easingFunction: new BABYLON.QuarticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		]}},
	];

	onMiss[200] = [
		{type: "reset_position", target: "active_target", params: {duration: 10}}
	];
	onMiss[300] = [];//padding
	
	var onDestroy = {};
	
	onDestroy[280] = [
		{type: "destroy", target: "active_target", params: {}}
	];
	
	onDestroy[330] = [];//padding*/
	var defaultAttack = {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy, 
		onDestroyOverwrite: {}
	};
	return this.playAttackAnimation(cacheRef, defaultAttack);
}

BattleSceneManager.prototype.createSpriteInfo = function(actor) {
	let spriteInfo = {};
	var imgPath = $statCalc.getBattleSceneImage(actor);
	var spriteType = $statCalc.getBattleSceneSpriteType(actor);
	

	spriteInfo.type = spriteType;
	if(spriteType == "default"){
		spriteInfo.path = imgPath;
		spriteInfo.id = "main";
	} else if(spriteType == "spriter"){			
		spriteInfo.path = imgPath+"/spriter/";
		spriteInfo.id = "main";
	} else if(spriteType == "dragonbones"){
		spriteInfo.path = imgPath+"/dragonbones/";
		spriteInfo.id = "main";
	} else if(spriteType == "spine"){
		spriteInfo.path = imgPath+"/spine/";
		spriteInfo.id = "main";
	} else if(spriteType == "3D"){
		spriteInfo.path = imgPath+"/3d/";
		spriteInfo.id = "main";
	}
	
	spriteInfo.referenceSize = $statCalc.getBattleReferenceSize(actor);
	const battleSceneInfo = $statCalc.getBattleSceneInfo(actor);
	spriteInfo.scale = battleSceneInfo.scale;
	spriteInfo.rotation = battleSceneInfo.rotation;
	spriteInfo.animGroup = battleSceneInfo.animGroup;
	spriteInfo.yOffset = battleSceneInfo.yOffset;
	spriteInfo.xOffset = battleSceneInfo.xOffset;
	
	spriteInfo.centerYOffset = battleSceneInfo.centerYOffset;
	spriteInfo.centerXOffset = battleSceneInfo.centerXOffset;
	spriteInfo.dragonbonesWorldSize = battleSceneInfo.dragonbonesWorldSize;
	spriteInfo.canvasDims = battleSceneInfo.canvasDims;
	spriteInfo.armatureName = battleSceneInfo.armatureName;
	spriteInfo.BBHack = battleSceneInfo.BBHack;
	spriteInfo.shadowParent = battleSceneInfo.shadowParent;
	spriteInfo.defaultAttachments = battleSceneInfo.defaultAttachments;
	return spriteInfo;
}

BattleSceneManager.prototype.readBattleCache = async function() {
	var _this = this;
	_this._noCounter = false;
	_this._actionQueue = [];
	//_this._requiredImages.push("img/basic_battle/test.png");
	_this._participantInfo.actor.participating = false;
	_this._participantInfo.actor_twin.participating = false;
	_this._participantInfo.actor_supporter.participating = false;
	_this._participantInfo.actor_twin_supporter.participating = false;
	_this._participantInfo.enemy.participating = false;
	_this._participantInfo.enemy_twin.participating = false;
	_this._participantInfo.enemy_supporter.participating = false;
	_this._participantInfo.enemy_twin_supporter.participating = false;
	
	_this._actorSupporterSprite = null;
	_this._enemySupporterSprite = null;
	_this._actorTwinSprite = null;
	_this._actorTwinSupporterSprite = null;
	_this._enemyTwinSprite = null;
	_this._enemyTwinSupporterSprite = null;
	
	const keys = Object.keys($gameTemp.battleEffectCache);
	for(let i = 0; i < keys.length; i++){
		const cacheRef = keys[i];
	
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		
		if(battleEffect.type == "defender" && battleEffect.action.type == "none" && !battleEffect.isDestroyed && !battleEffect.targetSelfDestructed){
			_this._noCounter = true;
			_this._defenderCache = battleEffect;
		}
		
		_this._actionQueue[battleEffect.actionOrder] = battleEffect;
		//battleEffect.currentAnimHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP;
		var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);
		var imgSize = $statCalc.getBattleSceneImageSize(battleEffect.ref) || _this._defaultSpriteSize;
		var shadowInfo = $statCalc.getBattleSceneShadowInfo(battleEffect.ref);
		var mechStats = $statCalc.getCalculatedMechStats(battleEffect.ref);
		var spriteType = $statCalc.getBattleSceneSpriteType(battleEffect.ref);
		
		var spriteInfo = this.createSpriteInfo(battleEffect.ref, imgPath);
		
		if(battleEffect.side == "actor"){
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){
				 
				_this._participantInfo.actor.participating = true;
				_this._participantInfo.actor.effect = battleEffect;				
				_this._participantInfo.actor.img = imgPath;
				await _this.updateMainSprite("actor", "ally_main", spriteInfo, _this._defaultPositions.ally_main_idle, imgSize, false, shadowInfo);
				_this._participantInfo.actor.tempHP = mechStats.currentHP;
			//_this._participantInfo.actor.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);

				
			}
			if(battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				_this._participantInfo.actor_twin.participating = true;
				_this._participantInfo.actor_twin.effect = battleEffect;				
				_this._participantInfo.actor_twin.img = imgPath;
				await _this.updateMainSprite("actor_twin", "ally_twin", spriteInfo, _this._defaultPositions.ally_main_idle, imgSize, false, shadowInfo);
				_this._participantInfo.actor_twin.tempHP = mechStats.currentHP;

			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.actor_twin_supporter.participating = true;
					_this._participantInfo.actor_twin_supporter.effect = battleEffect;
					_this._participantInfo.actor_twin_supporter.img = imgPath;
					await _this.updateMainSprite("actor_twin_supporter", "ally_twin_support", spriteInfo, _this._defaultPositions.ally_support_idle, imgSize, false, shadowInfo);	
					_this._participantInfo.actor_twin_supporter.tempHP = mechStats.currentHP;
					//_this._participantInfo.actor_supporter.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);
				} else {
					_this._participantInfo.actor_supporter.participating = true;
					_this._participantInfo.actor_supporter.effect = battleEffect;
					_this._participantInfo.actor_supporter.img = imgPath;
					await _this.updateMainSprite("actor_supporter", "ally_support", spriteInfo, _this._defaultPositions.ally_support_idle, imgSize, false, shadowInfo);	
					_this._participantInfo.actor_supporter.tempHP = mechStats.currentHP;
					//_this._participantInfo.actor_supporter.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);	
				}
			}
		} else {
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){				
				_this._participantInfo.enemy.participating = true;
				_this._participantInfo.enemy.effect = battleEffect;
				_this._participantInfo.enemy.img = imgPath;
				await _this.updateMainSprite("enemy", "enemy_main", spriteInfo, _this._defaultPositions.enemy_main_idle, imgSize, true, shadowInfo);	
				_this._participantInfo.enemy.tempHP = mechStats.currentHP;
				//_this._participantInfo.enemy.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);				
			}
			if(battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				_this._participantInfo.enemy_twin.participating = true;
				_this._participantInfo.enemy_twin.effect = battleEffect;
				_this._participantInfo.enemy_twin.img = imgPath;
				await _this.updateMainSprite("enemy_twin", "enemy_twin", spriteInfo, _this._defaultPositions.enemy_main_idle, imgSize, true, shadowInfo);	
				_this._participantInfo.enemy_twin.tempHP = mechStats.currentHP;
				//_this._participantInfo.enemy.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.enemy_twin_supporter.participating = true;
					_this._participantInfo.enemy_twin_supporter.effect = battleEffect;
					_this._participantInfo.enemy_twin_supporter.img = imgPath;
					await _this.updateMainSprite("enemy_twin_supporter", "enemy_twin_support", spriteInfo, _this._defaultPositions.enemy_support_idle, imgSize, true, shadowInfo);	
					_this._participantInfo.enemy_twin_supporter.tempHP = mechStats.currentHP;
					//_this._participantInfo.enemy_supporter.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);3
				} else {
					_this._participantInfo.enemy_supporter.participating = true;
					_this._participantInfo.enemy_supporter.effect = battleEffect;
					_this._participantInfo.enemy_supporter.img = imgPath;
					await _this.updateMainSprite("enemy_supporter", "enemy_support", spriteInfo, _this._defaultPositions.enemy_support_idle, imgSize, true, shadowInfo);	
					_this._participantInfo.enemy_supporter.tempHP = mechStats.currentHP;
					//_this._participantInfo.enemy_supporter.animatedHP = mechStats.currentHP - (battleEffect.HPRestored || 0);3
				}
			}
		}
			
	}
	if(!_this._actorSupporterSprite){
		await _this.updateMainSprite("actor_supporter", "ally_support", "", _this._defaultPositions.ally_support_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._enemySupporterSprite){
		await _this.updateMainSprite("enemy_supporter", "enemy_support", "", _this._defaultPositions.enemy_support_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._actorTwinSprite){
		await _this.updateMainSprite("actor_twin", "ally_twin", "", _this._defaultPositions.ally_twin_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._actorTwinSupporterSprite){
		await _this.updateMainSprite("actor_twin_supporter", "ally_twin_support", "", _this._defaultPositions.ally_support_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._enemyTwinSprite){
		await _this.updateMainSprite("enemy_twin", "enemy_twin", "", _this._defaultPositions.enemy_twin_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._enemyTwinSupporterSprite){
		await _this.updateMainSprite("enemy_twin_supporter", "enemy_twin_support", "", _this._defaultPositions.enemy_support_idle, _this._defaultSpriteSize, false, {});	
	}
	
	_this._UILayerManager.updateTwinDisplay({
		actor: _this._participantInfo.actor_twin.participating,
		enemy: _this._participantInfo.enemy_twin.participating,
	});
	
	if(_this._participantInfo.actor.participating){
		_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "HP");
		_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "EN");
	}
	
	if(_this._participantInfo.actor_twin.participating){
		_this._UILayerManager.setStat(_this._participantInfo.actor_twin.effect, "HP");
		_this._UILayerManager.setStat(_this._participantInfo.actor_twin.effect, "EN");
	}
	
	if(_this._participantInfo.enemy.participating){
		_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "HP");
		_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "EN");
	}
	
	if(_this._participantInfo.enemy_twin.participating){
		_this._UILayerManager.setStat(_this._participantInfo.enemy_twin.effect, "HP");
		_this._UILayerManager.setStat(_this._participantInfo.enemy_twin.effect, "EN");
	}
}

BattleSceneManager.prototype.resetSprite = function(mainSprite){
	var _this = this;
	if(mainSprite.sprite.spriteConfig.type == "spriter"){
		mainSprite.renderer.updateAnimation("main");
	}
}

BattleSceneManager.prototype.resetSprites = function() {
	var _this = this;	
	_this.resetSprite(_this._actorSprite);
	_this.resetSprite(_this._enemySprite);
	_this.resetSprite(_this._actorSupporterSprite);
	_this.resetSprite(_this._enemySupporterSprite);	
}

BattleSceneManager.prototype.resetFadeState = function() {
	var newDiv = document.createElement("div");
	newDiv.id = "fade_container";
	newDiv.classList.add("fade_container");

	/*if(ENGINE_SETTINGS.BATTLE_SCENE.SHOW_FADE_BELOW_TEXTBOX){
		newDiv.style.zIndex = 51;
	}*/
	
	this._fadeContainer.replaceWith(newDiv);
	this._fadeContainer = newDiv;
	if(!$gameTemp || !$gameTemp.editMode){
		this._fadeContainer.width = Graphics._width;
		this._fadeContainer.height = Graphics._height;
		Graphics._centerElement(this._fadeContainer);
	}	
}

BattleSceneManager.prototype.resetSystemFadeState = function() {
	var newDiv = document.createElement("div");
	newDiv.id = "system_fade_container";
	newDiv.classList.add("fade_container");
	
	this._systemFadeContainer.replaceWith(newDiv);
	this._systemFadeContainer = newDiv;
}

BattleSceneManager.prototype.swipeToBlack = function(direction, inOrOut, holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		//_this.resetFadeState();
		/*if(ENGINE_SETTINGS.BATTLE_SCENE.SHOW_FADE_BELOW_TEXTBOX){
			_this._swipeContainer.style.zIndex = 51;
		}*/
		var swipeClass;
		if(direction == "left"){
			swipeClass = "swipe_left";
		} else {
			swipeClass = "swipe_right";
		}
		_this._swipeBox.className = "";
		_this._swipeBox.classList.add(swipeClass);		
		_this._swipeBox.classList.add(inOrOut);
		if((_this._lockedSwipeState != null && _this._lockedSwipeState) || (_this._lockedSwipeState == null && _this.isOKHeld)){
			var duration = _this._swipeBox.style["animation-duration"].replace(/s$/, "");
			duration/=2;
			_this._swipeBox.style["animation-duration"] = duration;
		} else {
			_this._swipeBox.style["animation-duration"] = "";
		}
		_this._swipeBox.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});
}

BattleSceneManager.prototype.fadeToBlack = function(holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.classList.add("fade_to_black");
		_this._fadeContainer.style.display = "block";
		_this._fadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.fadeFromBlack = function() {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.style.display = "block";
		_this._fadeContainer.classList.add("fade_from_black");		
		_this._fadeContainer.addEventListener("animationend", function(){
			_this._fadeContainer.style.display = "";
			resolve();
		});
	});	
}

BattleSceneManager.prototype.systemFadeToBlack = function(duration, holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetSystemFadeState();
		_this._systemFadeContainer.classList.add("fade_to_black");
		_this._systemFadeContainer.style["animation-duration"] = duration;
		_this._systemFadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.systemFadeFromBlack = function(duration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetSystemFadeState();
		_this._systemFadeContainer.classList.add("fade_from_black");
		_this._systemFadeContainer.style["animation-duration"] = duration;
		_this._systemFadeContainer.addEventListener("animationend", function(){
			resolve();
		});
	});	
}

BattleSceneManager.prototype.fadeToWhite = function(holdDuration, fadeSpeed) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.style.display = "block";		
		_this._fadeContainer.classList.add("fade_to_white");	
		_this._fadeContainer.style["animation-duration"] = fadeSpeed + "s";	
		
		_this._fadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.fadeFromWhite = function(fadeSpeed) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.style.display = "block";
		_this._fadeContainer.classList.add("fade_from_white");	
		_this._fadeContainer.style["animation-duration"] = fadeSpeed + "s";
		
		_this._fadeContainer.addEventListener("animationend", function(){
			_this._fadeContainer.style.display = "";
			resolve();
		});
	});	
}

BattleSceneManager.prototype.setBgMode = function(mode) {
	var _this = this;
	_this._bgMode = mode;
	if(!_this._bgsHidden){		
		_this._skyBgs.forEach(function(bg){
			if(_this._bgMode == "sky"){
				bg.isVisible = true;
			} else {
				bg.isVisible = false;
			}
			
		});		
		_this._bgs.forEach(function(bg){
			if(_this._bgMode == "land"){
				//bg.isVisible = true;
				if(bg.originalPos){
					bg.position.y = bg.originalPos.y;
				}
			} else {
				//bg.isVisible = false;
				bg.position.originalPos = new BABYLON.Vector3().copyFrom(bg.position);
				bg.position.y-=($gameSystem.skyBattleOffset || 0);
			} 
		});	

		_this._floors.forEach(function(bg){
			if(_this._bgMode == "land"){
				//bg.isVisible = true;
				if(bg.originalPos){
					bg.position.y = bg.originalPos.y;
				}
			} else {
				//bg.isVisible = false;
				bg.position.originalPos = new BABYLON.Vector3().copyFrom(bg.position);
				bg.position.y-=($gameSystem.skyBattleOffset || 0);
			} 
		});			
	}

	if(_this._bgMode == "sky"){
		_this._actorShadow.isVisible = false;
		_this._actorTwinShadow.isVisible = false;
		_this._enemyShadow.isVisible = false;
		_this._enemyTwinShadow.isVisible = false;
		_this._actorSupporterShadow.isVisible = false;
		_this._actorTwinSupporterShadow.isVisible = false;
		_this._enemySupporterShadow.isVisible = false;
		_this._enemyTwinSupporterShadow.isVisible = false;
		
	} else {
		_this._actorShadow.isVisible = true;
		_this._actorTwinShadow.isVisible = true;
		_this._enemyShadow.isVisible = true;
		_this._enemyTwinShadow.isVisible = true;
		_this._actorSupporterShadow.isVisible = true;
		_this._actorTwinSupporterShadow.isVisible = true;
		_this._enemySupporterShadow.isVisible = true;
		_this._enemyTwinSupporterShadow.isVisible = true;
	}	

	if(_this._instantiatedUnits){
		for(let unit of _this._instantiatedUnits){
			if(unit.sprite.shadowSprite){
				unit.sprite.shadowSprite.isVisible = _this._bgMode != "sky";
			}
		}
	}
}

BattleSceneManager.prototype.resetScene = function() {
	var _this = this;
	this.initScene();
	
	this._isEnvPreview = false;
	this._textProviderOverride = null;
	this._useHardShadows = false;
	
	_this.disposeBarrierEffects();
	
	_this.disposeAnimationSprites();
	_this.disposeAnimationBackgrounds();
	_this.disposeSpriterBackgrounds();
	_this.disposeEffekseerInstances();
	_this.disposeLights();
	_this.disposeMovieBackgrounds();
	_this.disposeRMMVBackgrounds();
	_this.disposeTextureCache();
	_this.disposeDynamicModels();
	_this.disposeRenderTargets();
	
	_this._spriteManagers = {};
	_this.setBgScrollRatio(1);
	_this.setAnimRatio(1);
	_this._TextlayerManager.hideNoise();
	_this._TextlayerManager.resetTextBox();
	if(_this._textBoxState != false){
		_this._TextlayerManager.fadeInTextBox();
	}
	
	_this._animationList = [];
	_this._matrixAnimations = {};
	_this._activeAliases = {};
	_this._sizeAnimations = {};
	_this._shakeAnimations = {};
	_this._bgAnimations = {};	
	_this._animatedModelTextureInfo = [];
	_this._bgScrolls = {};	
	_this._fadeAnimations = {};	
	_this._lastAction = null;
	
	_this._bgs.forEach(function(bg){
		bg.dispose();
	});	
	_this._bgs = [];
	_this._bgInstances = [];
	
	_this._fixedBgs.forEach(function(bg){
		bg.dispose();
	});
	_this._cachedBgs = {};
	
	var cameraMainIdle = _this._defaultPositions.camera_main_idle;
	
	if(ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_CAMERA_POSITION){
		cameraMainIdle.x = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_CAMERA_POSITION.x;
		cameraMainIdle.y = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_CAMERA_POSITION.y;
		cameraMainIdle.z = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_CAMERA_POSITION.z;
	}
	
	_this._camera.position = cameraMainIdle;
	_this._camera.rotation = _this._defaultRotations.camera_main_intro;
	if(_this._actorSprite){
		_this._actorSprite.sprite.parent_handle.position.copyFrom(_this._defaultPositions.ally_main_idle);
		_this._actorSprite.wasMoved = false;
		delete _this._actorSprite.sprite.realPosition;
	}
	if(_this._enemySprite){
		_this._enemySprite.sprite.parent_handle.position.copyFrom(_this._defaultPositions.enemy_main_idle);	
		_this._enemySprite.wasMoved = false;
		delete _this._enemySprite.sprite.realPosition;
	}
	if(_this._actorSupporterSprite){
		_this._actorSupporterSprite.sprite.parent_handle.position.copyFrom(_this._defaultPositions.ally_support_idle);
		_this._actorSupporterSprite.wasMoved = false;
		delete _this._actorSupporterSprite.sprite.realPosition;
	}
	if(_this._enemySupporterSprite){
		_this._enemySupporterSprite.sprite.parent_handle.position.copyFrom(_this._defaultPositions.enemy_support_idle);
		_this._enemySupporterSprite.wasMoved = false;
		delete _this._enemySupporterSprite.sprite.realPosition;
	}	
}

BattleSceneManager.prototype.showEnvironment = function(ref, all){
	var bgId;
	this._envCreateStall = true;
	this._isEnvPreview = true;
	if(!all){
		bgId = $gameSystem.getUnitSceneBgId(ref);
	}
	this._bgs.forEach(function(bg){	
		bg.visibility = all || bg.bgId == bgId;
		bg.isVisible = all || bg.bgId == bgId;
		if(bg.bgId != bgId) {
			bg.inactive = true;
		} else {
			bg.inactive = false;
		}
	});	
	this._fixedBgs.forEach(function(bg){	
		bg.dispose();
	});	
	this._fixedBgs = [];
	for(let refId in this._bgLayerInfo){
		if(all || refId == bgId){
			let layer = new BABYLON.Layer("bg_layer_"+refId, this.getCachedImageData("img/SRWBattlebacks/"+this._bgLayerInfo[refId]+".png"), this._scene, true);
			layer.visibility = 0;
			layer.bgId = bgId;
			this._fixedBgs.push(layer);
		}
	}
}

BattleSceneManager.prototype.createEnvironment = function(ref){
	var _this = this;
	return new Promise(async function(resolve, reject){	
		var promises = [];
		_this._envCreateStall = true;
		_this._creatingEnvironment = true;
		/*_this._bgs.forEach(function(bg){
			bg.dispose();
		});	
		_this._bgs = [];
		
		_this._fixedBgs.forEach(function(bg){
			bg.dispose();
		});	
		_this._fixedBgs = [];
		*/
		
		
		var bgId = $gameSystem.getUnitSceneBgId(ref);
		
		if(!_this._cachedBgs[bgId]){
			_this._cachedBgs[bgId] = true;		
			
			var environmentDef = _this._environmentBuilder.getDefinition(bgId);
			if(environmentDef){
				var bgs = JSON.parse(JSON.stringify(environmentDef.data.bgs));
				
				var ctr = 0;
				
				var maxZOffset = 0;
				
				bgs.forEach(function(bg){
					if(bg.zoffset > maxZOffset){
						maxZOffset = bg.zoffset;
					}
				});
				let promises = [];
				bgs.forEach(function(bg){
					if(!bg.hidden){	
						if(!bg.isfixed){
							promises.push(_this.preloadTexture("img/SRWBattlebacks/"+bg.path+".png", "Environment Creation"));
						}
					}						
				});
				
				await Promise.all(promises);
				
				for(let bg of bgs){
					if(!bg.hidden){		
						if(bg.isfixed){			
							_this._bgLayerInfo[bgId] = bg.path;
							await _this.preloadTexture("img/SRWBattlebacks/"+bg.path+".png", "Environment Creation Fixed BG");
						} else {
							_this.createScrollingBg("bg"+ctr, bgId, bg.path, {width: bg.width, height: bg.height}, bg.yoffset, bg.zoffset, maxZOffset - bg.zoffset, bg.xoffset);
						}	
					}	
					ctr++;
				}
			}
		}
		//Promise.all(promises).then(resolve);
		resolve();//debug
		_this._creatingEnvironment = false; 
	});
}	 

BattleSceneManager.prototype.createScrollingBg = function(id, bgId, path, size, yOffset, zOffset, alphaIndex, scrollOffset){
	var _this = this;
	if(!size){
		size = {
			width: 50,
			height: 25
		};
	}
	
	var amount = Math.ceil(500 / (size.width || 500));
	if(amount > 20){
		amount = 20;
	}
	
	var startX = (size.width / 2) * (amount - 1) * -1;
	let instanceRef;
	for(var i = 0; i < amount; i++){
		var bg;
		const position = new BABYLON.Vector3(startX + (i * size.width), yOffset, zOffset);
		if(i == 0){
			bg = this.createBg(id + "_" + i, path, position, size, 1, null, true, false, true);
			bg.parent = _this._bgsParent;
			bg.isInstanceRef = true;
			instanceRef = bg;
			bg.visibility = 0;
			bg.bgId = bgId;
			const pathParts = path.split("/");
			bg.envRefId = pathParts[pathParts.length - 1];
			bg.alphaIndex = alphaIndex;
			bg.scrollOffset = scrollOffset;
			_this._bgs.push(bg);
		} else {
			bg = instanceRef.createInstance(id + "_" + i);
			bg.parent = _this._bgsParent;
			bg.isInstanceRef = false;
			bg.position = position;
			bg.sizeInfo = {
				width: size.width, 
				height: size.height
			};			
			_this._bgInstances.push(bg);
		}			
	} 
}

BattleSceneManager.prototype.fadeAndShowScene = function(){
	var _this = this;
	_this.systemFadeToBlack(1, 1000).then(function(){
		_this.showScene();
	});	
}

BattleSceneManager.prototype.getBgPromise = function(bg){	
	return this.getTexturePromise(bg.material.diffuseTexture);
}	

BattleSceneManager.prototype.getTexturePromise = function(texture){
	return new Promise((resolve) => {
		texture.onLoadObservable.add(() => {
			resolve();
		});
	});
}		

BattleSceneManager.prototype.preloadEffekseerEffect = function(target, params, actionIdx, isEnemyAction){
	const _this = this;
	
	return new Promise(function(resolve, reject){	
		
		var targetContext;
		if(params.autoRotate && isEnemyAction){
			
			if(params.isForeground * 1){
				targetContext = _this._effksContextFgMirror;//_this._effksContextFg;
			} else {
				targetContext =  _this._effksContextMirror;//_this._effksContext;
			}
		} else {
			if(params.isForeground * 1){
				targetContext = _this._effksContextFg;
			} else {
				targetContext = _this._effksContext;
			}
		}
		if(targetContext.activeCount == null){
			targetContext.activeCount = 0;
		}	
				
		_this._glContext.pixelStorei(_this._glContext.UNPACK_FLIP_Y_WEBGL, 0);
		//_this._isLoading++;
		let preloadKey = actionIdx+"__"+target+"__"+params.path;
		if(target == "sys_barrier"){
			preloadKey = "ub__sys_barrier";
		}
		if(!_this._preloadedEffekseerInfo[preloadKey]){
			_this._preloadedEffekseerInfo[preloadKey] = {};//avoid double loading
			var effect = targetContext.loadEffect("effekseer/"+params.path+".efk", 1.0, function(){
				targetContext.activeCount++;
				
				_this._preloadedEffekseerInfo[preloadKey] = {
					effect: effect,
					targetContext: targetContext
				};
				//_this._isLoading--;
				resolve();
			});
		} else {
			resolve();
		}
		
	});
}

BattleSceneManager.prototype.preloadAnimListEffekseerEffects = async function(animationList, effekseerId, isEnemyAction){
	const promises = [];
	for(let animType of Object.keys(animationList)){
		const batch = animationList[animType];
		if(batch){		
			for(let entry of batch){
				if(entry){
					for(let animCommand of entry){
						var params = animCommand.params;
						if(animCommand.type == "play_effekseer"){
							await this.preloadEffekseerEffect(animCommand.target, animCommand.params, effekseerId, isEnemyAction);				
						}
						if(animCommand.type == "next_phase"){
							if(animCommand.params.commands){							
								for(let innerAnimCommand of animCommand.params.commands){								
									if(innerAnimCommand.type == "play_effekseer"){
										await this.preloadEffekseerEffect(innerAnimCommand.target, innerAnimCommand.params, effekseerId, isEnemyAction);		
									}								
								}
							}
							if(animCommand.params.cleanUpCommands){		
								for(let innerAnimCommand of animCommand.params.cleanUpCommands){							
									if(innerAnimCommand.type == "play_effekseer"){
										await this.preloadEffekseerEffect(innerAnimCommand.target, innerAnimCommand.params, effekseerId, isEnemyAction);		
									}								
								}	
							}							
							//promises.push(this.preloadEffekseerEffect({"next_phase": [animCommand.params.commands]}, nextAction.effekseerId, nextAction.side == "enemy"));
							//promises.push(this.preloadEffekseerEffect({"next_phase": [animCommand.params.cleanUpCommands]}, nextAction.effekseerId, nextAction.side == "enemy"));
						}	
					}
				}			
			}
		}
	}	
	//await Promise.all(promises);
}

//workaround for a bug where spawning effekseer effects would have them render all their texture upside down
//preloading them before the animation starts prevents this
BattleSceneManager.prototype.preloadEffekseerParticles = async function(){
	var _this = this;
	this._preloadedEffekseerInfo = {};

	await this.preloadEffekseerEffect("sys_barrier", {path: "sys_barrier"}, "ub");

	for(var i = 0; i < _this._actionQueue.length; i++){
		
		var nextAction = _this._actionQueue[i];
		if(nextAction){		
		
			nextAction.effekseerId = i;

			let animIdsToPreload = {};
			
			var attack = nextAction.action.attack;
			
			var animId;
			if(attack && typeof attack.animId != "undefined" && attack.animId != -1){
				animId = attack.animId;
			} else if(attack){
				animId = _this.getDefaultAnim(attack);//default
			}				
			if(animId == null){
				continue;
			}
			var animationList = _this._animationBuilder.buildAnimation(animId, _this);
			if(!animationList){
				alert("Animation "+animId+" does not have a definition!");
				throw("Animation "+animId+" does not have a definition!");
			}
			var promises = [];
			Object.keys(animationList).forEach(function(animType){
				animationList[animType].forEach(function(batch){
					batch.forEach(function(animCommand){
						var params = animCommand.params;

						if(animCommand.type == "include_animation"){
							animIdsToPreload[animCommand.params.battleAnimId] = true;
						}
						if(animCommand.type == "merge_complete_animation"){
							animIdsToPreload[animCommand.params.battleAnimId] = true;
						}		

							
					});
				});				
			});	
			
			
			promises.push(_this.preloadAnimListEffekseerEffects(animationList, nextAction.effekseerId, nextAction.side == "enemy"));
			
			if(nextAction.isDestroyed){
				var animId = $statCalc.getBattleSceneInfo(nextAction.action.ref).deathAnimId;
				if(animId == null || animId == ''){
					animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
				}
				animIdsToPreload[animId] = true;
			}
			
			
			if(nextAction.attacked && nextAction.attacked.isDestroyed){
				var animId = $statCalc.getBattleSceneInfo(nextAction.attacked.ref).deathAnimId;
				if(animId == null || animId == ''){
					animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
				}
				animIdsToPreload[animId] = true;
			}	
			
			const visitedAnims = {};
			const stack = [];
			for(let animId in animIdsToPreload){
				stack.push(animId);
			}
			
			while(stack.length){
				const animId = stack.pop();
				if(!visitedAnims[animId]){
					visitedAnims[animId] = true;
					var animationList = _this._animationBuilder.buildAnimation(animId, _this);
			
					Object.keys(animationList).forEach(function(animType){
						animationList[animType].forEach(function(batch){
							batch.forEach(function(animCommand){
								var params = animCommand.params;
								if(animCommand.type == "include_animation"){
									stack.push(animCommand.params.battleAnimId);
								}
								if(animCommand.type == "merge_complete_animation"){
									stack.push(animCommand.params.battleAnimId);
								}							
							});
						});				
					});	
					
					promises.push(_this.preloadAnimListEffekseerEffects(animationList, nextAction.effekseerId, nextAction.side == "enemy"));
				}
			}
			
			
			await Promise.all(promises);	
			
		}	
	}		
}

BattleSceneManager.prototype.getPreloadedModel = function(target){
	const _this = this;
	let obj;
	let ctr = 0;
	while(!obj && ctr < _this._unitModelInfo.length){
		if(_this._unitModelInfo[ctr].sprite.name == target+"_preload_model"){
			obj = _this._unitModelInfo[ctr].sprite;
		}
		ctr++;
	}
	return obj;
}

BattleSceneManager.prototype.earlyPreloadSceneAssets = async function(){
	var _this = this;
	_this.resetScene();
	await _this.readBattleCache();
	_this.preloadSceneAssets();
}

BattleSceneManager.prototype.preloadDynamicUnitModel = async function(target, params, flipX){
	const _this = this;
	const name = target;

	let position;
	if(params.position){
		position = new BABYLON.Vector3(params.position.x, params.position.y, params.position.z);
	} else {
		position = new BABYLON.Vector3(0, 0, 0);
	}
	
	let currentPilot = $statCalc.createEmptyActor();

	var mechData = $statCalc.getMechData($dataClasses[params.mechId], true);
	$statCalc.calculateSRWMechStats(mechData, false, currentPilot);	
	currentPilot.SRWStats.mech = mechData;

	
	_this._dynamicUnitsUnderPreload[target] = currentPilot;
	
	const spriteConfig = _this.createSpriteInfo(currentPilot);
	var basePath = spriteConfig.path;
	var spriteId = spriteConfig.id;
	var path;
	if(!spriteConfig){
		path = "";
	} else if(spriteConfig.type == "default"){
		path = basePath+"/"+spriteId;
		let promises = [];
		this.preloadDefaultFrames(currentPilot, promises);
		await Promise.all(promises);
	} else {
		path = basePath;
	}
	
	var spriteInfo;
	var spriteParent = _this.createBg(name, "", position, 0, 1, null, true);
	spriteParent.isVisible = false;
	var pivothelper = _this.createBg(name+"_pivot", "", new BABYLON.Vector3(0, 0, 0), 0.5, 1, null, true);
	let pivotYOffset = 0;
	let pivotXOffset = 0;
	pivothelper.isVisible = false;
	pivothelper.renderingGroupId = 6;
	let xOffset = spriteConfig.xOffset;
	if(flipX){
		xOffset*=-1;
	}
	if(!spriteConfig || spriteConfig.type == "default"){
		var imgSize = $statCalc.getBattleSceneImageSize(currentPilot) || _this._defaultSpriteSize;
		

		spriteInfo = _this.createPlanarSprite(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), imgSize, flipX, spriteConfig.referenceSize);		
		spriteInfo.sprite.setPivotMatrix(BABYLON.Matrix.Translation(-0, spriteInfo.size.height/2, -0), false);	
	} else if(spriteConfig.type == "spine"){
		spriteInfo = _this.createSpineSprite(name+"_displayed", path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX, "main", spriteConfig.referenceSize, spriteConfig.canvasDims.width, spriteConfig.canvasDims.height);
		pivotYOffset+=spriteConfig.referenceSize / 2 - spriteConfig.yOffset;				
	} else if(spriteConfig.type == "3D"){
		spriteInfo = await _this.createUnitModel(name+"_displayed", spriteConfig.path,  new BABYLON.Vector3(xOffset, spriteConfig.yOffset, 0), flipX, spriteConfig.animGroup, "main",  spriteConfig.scale, new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(spriteConfig.rotation || 0), 0), spriteConfig.BBHack, spriteConfig.shadowParent);
		pivotYOffset+=spriteConfig.referenceSize / 2 - spriteConfig.yOffset + spriteConfig.centerYOffset;	
		pivotXOffset+=spriteConfig.centerXOffset;
		/*if(flipX){
			spriteParent.rotation.y = -BABYLON.Tools.ToRadians(spriteConfig.rotation || 0) ;
			spriteParent.scaling = new BABYLON.Vector3(spriteConfig.scale * -1, spriteConfig.scale, spriteConfig.scale);	
		} else {
			spriteParent.rotation.y = BABYLON.Tools.ToRadians(spriteConfig.rotation || 0);	
			spriteParent.scaling = new BABYLON.Vector3(spriteConfig.scale, spriteConfig.scale, spriteConfig.scale);		
		}*/
		//_this.registerAnimationBlend(spriteInfo.sprite, "main");
		for(let animName in spriteInfo.sprite.animationRef){
			spriteInfo.sprite.animationRef[animName].stop();
		}
		const animInfo = spriteInfo.sprite.animationRef["main"];
		if(animInfo){
			animInfo.start(false, 1.0, animInfo.from, animInfo.to, false);
		}
		
		if(spriteConfig.defaultAttachments){
			for(let defaultAttachment of spriteConfig.defaultAttachments){
				_this.showAttachment(spriteInfo.sprite, defaultAttachment);
			}
		}
	} 		
	
	pivothelper.position.y+=pivotYOffset;
	pivothelper.position.x+=pivotXOffset;
	
	spriteInfo.sprite.position.y-=pivotYOffset;
		
	pivothelper.parent = spriteParent;
	spriteInfo.sprite.pivothelper = pivothelper;
	spriteInfo.sprite.spriteInfo = spriteInfo;
	spriteInfo.sprite.spriteConfig = spriteConfig;
	
	spriteInfo.sprite.parent = pivothelper;
	spriteInfo.sprite.parent_handle = spriteParent;
	
	spriteInfo.name = target;
	spriteInfo.ref = currentPilot;

	const shadowInfo = $statCalc.getBattleSceneShadowInfo(currentPilot);
	this.configureSprite(spriteInfo, "dynamicShadow", shadowInfo, "actor");		
	
	
	this._instantiatedUnits.push(spriteInfo);
	
	var targetObj = _this.getTargetObject(name);
	if(targetObj){
		if(targetObj.setEnabled){
			targetObj.setEnabled(false); 
		} else {
			targetObj.isVisible = false;
		}				
	} 
}


BattleSceneManager.prototype.preloadDefaultFrames = function(ref, promises){
	const _this = this;
	var defaultFrames = ["main", "in", "out", "hurt", "dodge", "block"];
	if(ENGINE_SETTINGS.SINGLE_BATTLE_SPRITE_MODE){
		defaultFrames = ["main"];
	}
	if(ref){
		var battleSceneInfo = $statCalc.getBattleSceneInfo(ref);
		if(battleSceneInfo.useSpriter){
			var path = $statCalc.getBattleSceneImage(ref)+"/spriter/";
			var bgInfo = _this.createSpriterSprite(path+"_preload", path,  new BABYLON.Vector3(0, 0, -1000));
			bgInfo.sprite.dispose();
		} else if(battleSceneInfo.useDragonBones){
			var path = $statCalc.getBattleSceneImage(ref)+"/dragonbones/";
			/*var bgInfo = _this.createDragonBonesSprite(path+"_preload", path, $statCalc.getBattleSceneInfo(ref).armatureName, new BABYLON.Vector3(0, 0, -1000));
			bgInfo.sprite.dispose();*/
			dragonBonesResources["img/SRWBattleScene/"+path+"ske.json"] = true;
			dragonBonesResources["img/SRWBattleScene/"+path+"tex.json"] = true;
			dragonBonesResources["img/SRWBattleScene/"+path+"tex.png"] = true;
		} else if(battleSceneInfo.useSpine){
			
		} else if(battleSceneInfo.use3D){
			
		} else {
			var imgPath = $statCalc.getBattleSceneImage(ref);
			defaultFrames.forEach(function(frame){
				promises.push(_this.preloadTexture("img/SRWBattleScene/"+imgPath+"/"+frame+".png", "Preload of mech asset for mech " + ref.SRWStats.mech.id));												
			});
		}					
	}
}

BattleSceneManager.prototype.preloadSceneAssets = function(){
	var _this = this;
	_this._cachedBgs = {};
	_this._bgLayerInfo = {};
	
	if(_this.isPreloading){
		return this._preloadPromise;
	}
	
	_this.isPreloading = true;
	
	this._preloadPromise = new Promise(function(resolve, reject){
		var promises = [];
		var dragonBonesResources = {};
		
		promises.push(_this.preloadTexture("img/SRWBattlebacks/shadow.png"));
		
		_this._dynamicUnitsUnderPreload = {}; //tracks dynamic units created during preload by target name so information is available to link them to battle actors for sprite frame preloading
		_this._preloadAliases = {}; //track assigned aliases during preload so that default sprite mode units can get preloaded correctly if they were aliased
		
		function handleAnimCommand(action, animCommand, animId, animType, tick, flipX){
			var target = animCommand.target;
			var params = animCommand.params;
			
		
			const imgReportingContext = "preload of " + animCommand.type + " command \nin animation " + animId + "\nin sequence " + animType + "\non tick " + tick;
			
			
			if(animCommand.type == "create_model"){				
				promises.push(_this.createModel(
					target+"_preload", 
					params.path+".glb", 
					new BABYLON.Vector3(0,0,-100000), 
					false ,
					"",
					"",
					1,
					0
				));			
			}
			
			if(animCommand.type == "create_unit_model"){				
				promises.push(_this.preloadDynamicUnitModel(target, params, flipX));			
			}
			
			if(animCommand.type == "register_alias"){						
				_this._preloadAliases[params.id] = target;
			}	
			
			
			if(animCommand.type == "create_bg"){
				if(!params.renderTargetId){
					let path;
					if(params.isPilotCutin){
						path = action.ref.SRWStats.pilot.cutinPath;
					} else {
						path = params.path;
					}
					
					//var bg = _this.createSceneBg(animCommand.target+"_preload", path, new BABYLON.Vector3(0,0,-1000), 1, 1, 0);
					//promises.push(_this.getBgPromise(bg));
					//_this._animationBackgroundsInfo.push(bg);
					promises.push(_this.preloadTexture("img/SRWBattleScene/"+path+".png", imgReportingContext));
				}				
			}	
			if(animCommand.type == "create_movie_bg"){
				var r = new XMLHttpRequest();			
				r.open("GET", "img/SRWBattleScene/"+params.path);
				r.responseType = "blob";
				r.send();
			}
			if(animCommand.type == "set_sprite_animation" || animCommand.type == "set_sprite_frame"){
				
	
				var targetAction = action.attacked;
				
				var battleEffect;
				if(target == "active_main" || target == "active_support_attacker" || target == "active_twin"){
					battleEffect = action;
				} else if(target == "active_target" || target == "active_support_defender" || target == "active_target_twin"){
					battleEffect = targetAction;
				} else {
					for(let entry of _this._instantiatedUnits){
						if(entry.name == target){
							battleEffect = {ref: entry.ref};
						}
					}
					if(!battleEffect &&  _this._dynamicUnitsUnderPreload[target]){
						battleEffect = {ref: _this._dynamicUnitsUnderPreload[target]};
					}
					if(!battleEffect){
						let alias = _this._preloadAliases[target];
						if(alias && _this._dynamicUnitsUnderPreload[alias]){
							battleEffect = {ref: _this._dynamicUnitsUnderPreload[alias]};
						}						
					}
					
				}						
				if(battleEffect){
					var battleSceneInfo = $statCalc.getBattleSceneInfo(battleEffect.ref);
					if(!battleSceneInfo.use3D && !battleSceneInfo.useSpine && !battleSceneInfo.useSpriter && !battleSceneInfo.useDragonBones){						
						if(battleEffect){
							var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);

						
							if(ENGINE_SETTINGS.SINGLE_BATTLE_SPRITE_MODE){
								params.name = "main";
							}
							
							promises.push(_this.preloadTexture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png", imgReportingContext));
						}	
					}
				}
					
			}
			if(animCommand.type == "create_sky_box"){				
				this.preloadTexture("img/skyboxes/"+params.path+".png", imgReportingContext);
			}	
			if(animCommand.type == "create_layer"){			
				promises.push(this.preloadTexture("img/SRWBattleScene/"+params.path+".png", imgReportingContext));													
			}	
			if(animCommand.type == "create_spriter_bg"){
				var bgInfo = _this.createSpriterSprite(animCommand.target+"_preload", "spriter/"+params.path+"/",  new BABYLON.Vector3(0, 0, -1000));
				bgInfo.sprite.dispose();														
			}	
			if(animCommand.type == "create_dragonbones_bg"){
				dragonBonesResources["img/SRWBattleScene/dragonbones/"+params.path+"/ske.json"] = true;
				dragonBonesResources["img/SRWBattleScene/dragonbones/"+params.path+"/tex.json"] = true;
				dragonBonesResources["img/SRWBattleScene/dragonbones/"+params.path+"/tex.png"] = true;	
			}
			if(animCommand.type == "set_opacity_texture"){
				_this.preloadTexture("img/SRWBattleScene/opacityTextures/"+params.path+".png", imgReportingContext);
			}
			if(animCommand.type == "play_rmmv_anim"){
				_this.createRMMVAnimationSprite(target+"_preload", params.animId, new BABYLON.Vector3(0, 0, -1000), {width: 0, height: 0}, true, false, true, true, 0);
			}
			
			if(animCommand.type == "effect_shockwave"){
				promises.push(_this.initShader("shockWave_fragment"));
			}
			if(animCommand.type == "effect_screen_shader"){
				promises.push(_this.initShader(params.shaderName+"_fragment", animCommand.params));
			}
			if(animCommand.type == "play_se"){
				var se = {};
				se.name = params.seId;
				se.pan = 0;
				se.pitch = params.pitch || 100;
				se.volume = params.volume || 100;
				promises.push(AudioManager.preloadSe(se));
			}	
			
			if(animCommand.type == "create_command_environment"){
				promises.push(_this.createEnvironment({commandBgId: params.id}));
			}
		}
		
		var sampleMode;
		if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
			sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
		} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
			sampleMode = BABYLON.Texture.NEAREST_NEAREST
		}
		
		
		
		for(var i = 0; i < _this._actionQueue.length; i++){
			var nextAction = _this._actionQueue[i];
			if(nextAction){			
				var attack = nextAction.action.attack;
				
				const animIdsToPreload = {};
				
				let animId;
				if(attack && typeof attack.animId != "undefined" && attack.animId != -1){
					animId = attack.animId;
				} else if(attack){
					animId = _this.getDefaultAnim(attack);//default
				}
				if(animId != null){
					animIdsToPreload[animId] = true;
				}				
				
				_this.preloadDefaultFrames(nextAction.ref, promises);
				if(nextAction.ref.subTwin){
					_this.preloadDefaultFrames(nextAction.ref.subTwin, promises);
				}
				if(nextAction.originalTarget){
					_this.preloadDefaultFrames(nextAction.originalTarget.ref, promises);
				}
				if(nextAction.attacked){
					_this.preloadDefaultFrames(nextAction.attacked.ref, promises);
					if(nextAction.attacked.ref.subTwin){
						_this.preloadDefaultFrames(nextAction.attacked.ref.subTwin, promises);
					}
				}
				if(nextAction.attacked_support){
					_this.preloadDefaultFrames(nextAction.attacked_support.ref, promises);
				}
				if(nextAction.attacked_all_sub){
					_this.preloadDefaultFrames(nextAction.attacked_all_sub.ref, promises);
					if(nextAction.attacked_all_sub.ref.subTwin){
						_this.preloadDefaultFrames(nextAction.attacked_all_sub.ref.subTwin, promises);
					}
				}
				

			
				promises.push(_this.createEnvironment(nextAction.ref));
				if(nextAction.originalTarget){
					promises.push(_this.createEnvironment(nextAction.originalTarget.ref));
				}
				if(nextAction.attacked){
					promises.push(_this.createEnvironment(nextAction.attacked.ref));
				}
				
				if(nextAction.isDestroyed){
					let animId = $statCalc.getBattleSceneInfo(nextAction.action.ref).deathAnimId;
					if(animId == null || animId == ''){
						animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
					}
					animIdsToPreload[animId] = true;
				}
				
				
				if(nextAction.attacked && nextAction.attacked.isDestroyed){
					let animId = $statCalc.getBattleSceneInfo(nextAction.attacked.ref).deathAnimId;
					if(animId == null || animId == ''){
						animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
					}
					animIdsToPreload[animId] = true;
				}			
				
				
				const visitedAnims = {};
				
				const stack = [];
				for(let animId in animIdsToPreload){
					stack.push(animId);
				}
				
				while(stack.length){
					const animId = stack.pop();
					if(!visitedAnims[animId]){
						visitedAnims[animId] = true;
						var animationList = _this._animationBuilder.buildAnimation(animId, _this);
						if(!animationList){
							alert("Animation "+animId+" does not have a definition!");
							throw("Animation "+animId+" does not have a definition!");
						}
						Object.keys(animationList).forEach(function(animType){
							Object.keys(animationList[animType]).forEach(function(tick){
								const batch = animationList[animType][tick];
								batch.forEach(function(animCommand){
									handleAnimCommand(nextAction, animCommand, animId, animType, tick, nextAction.side == "enemy");
									if(animCommand.type == "next_phase"){
										if(animCommand.params.commands){
											for(let command of animCommand.params.commands){
												handleAnimCommand(nextAction, command, animId, animType, tick, nextAction.side == "enemy");	
											}
										}
										if(animCommand.params.cleanUpCommands){
											for(let command of animCommand.params.cleanUpCommands){
												handleAnimCommand(nextAction, command, animId, animType, tick, nextAction.side == "enemy");	
											}
										}
									}	
									if(animCommand.type == "include_animation"){
										stack.push(animCommand.params.battleAnimId);
									}
									if(animCommand.type == "merge_complete_animation"){
										stack.push(animCommand.params.battleAnimId);
									}
									
								});
							});				
						});	
					}
				}					
			}	 
			
			promises.push(DragonBonesManager.load(Object.keys(dragonBonesResources)));
		}
		
		Promise.all(promises).then(() => {
			_this._dynamicUnitsUnderPreload = {};
			_this._preloadAliases = {};
			_this.isPreloading = false;
			resolve();
		});	
	});
	
	return this._preloadPromise;
}

BattleSceneManager.prototype.showScene = async function() {
	var _this = this;		
	_this._instanceId++;
	_this._sceneCanEnd = false;
	_this._sceneIsEnding = false;
	_this._UIcontainer.style.display = "block";	
	_this._TextContainer.style.display = "block";	
	_this._PIXIContainer.style.display = "block";	
	_this._systemFadeContainer.style.display = "block";
	_this._swipeContainer.style.display = "block";
	_this._shadowFloor = 0;
	//_this.resetScene();
	_this._assetsPreloaded = false;
	await _this.readBattleCache();	

	//this._glContext.UNPACK_FLIP_Y_WEBGL = false;
	
	this._glContext.pixelStorei(this._glContext.UNPACK_FLIP_Y_WEBGL, 1);
	
	await _this.preloadEffekseerParticles();
	
	var firstAction = _this._actionQueue[0];
	var ctr = 1;
	while((!firstAction || !firstAction.hasActed || firstAction.action.type == "defend" || firstAction.action.type == "evade") && ctr < _this._actionQueue.length){
		firstAction = _this._actionQueue[ctr++];
	}
	if(firstAction.side == "actor"){
		_this._previousBgScrollDirection = 1;
		_this._bgScrollDirection = 1;
		_this.setBgScrollDirection(1, true);
	} else {
		_this._previousBgScrollDirection = -1;
		_this._bgScrollDirection = -1;
		_this.setBgScrollDirection(-1, true);
	}
	
	
	
	_this.preloadSceneAssets().then(function(){
		//setTimeout(finalize, 1000);
		finalize();
	});
		
	async function finalize(){
		_this._assetsPreloaded = true;
		await _this.readBattleCache();			
		
		_this._TextlayerManager.resetTextBox();
		if(_this._participantInfo.actor.participating){
			var ref = _this._participantInfo.actor.effect.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			//_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "HP");
			//_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "EN");
		}
		if(_this._participantInfo.enemy.participating){
			var ref = _this._participantInfo.enemy.effect.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			//_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "HP");
			//_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "EN");
		}
		
		var firstAction = _this._actionQueue[0];
		var ctr = 1;
		while((!firstAction || !firstAction.hasActed || firstAction.action.type == "defend" || firstAction.action.type == "evade") && ctr < _this._actionQueue.length){
			firstAction = _this._actionQueue[ctr++];
		}
		
		
		_this.setUpActionSceneState(firstAction);
		_this.setUpActionTwinDisplay(firstAction);
		
		if($gameTemp.defenderCounterActivated){
			_this._UILayerManager.setNotification(firstAction.isActor ? "actor" : "enemy", "COUNTER");
		}
		_this.showEnvironment(firstAction.ref);
		_this._lastActionWasSupportAttack = false;
		_this._lastActionWasSupportDefend = false;
		
		//_this._scene.render();
		//_this._scene.render();
		//_this._scene.render();
		
		//await new Promise(function(resolve, reject){setTimeout(resolve, 5000)});
		
		await _this._scene.whenReadyAsync();
		
		_this.systemFadeFromBlack();
		_this._currentAnimatedAction = firstAction;
		
		_this.playIntroAnimation().then(function(){
			_this._sceneCanEnd = true;
			_this.processActionQueue();
		});	
	}
}

BattleSceneManager.prototype.setUpActionTwinDisplay = function(action) {
	var _this = this;
	if(action.ref.isSubTwin){
		if(action.side == "actor"){
			_this._actorTwinSprite.sprite.setEnabled(true);		
			_this._actorTwinSprite.sprite.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_twin_idle);
		} else {
			_this._enemyTwinSprite.sprite.setEnabled(true);		
			_this._enemyTwinSprite.sprite.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_twin_idle);			
		}
		_this.isTwinInitiating = true;
	} else if($statCalc.isMainTwin(action.ref)) {
		if(action.side == "actor"){
			_this._actorTwinSprite.sprite.setEnabled(true);		
			_this._actorTwinSprite.sprite.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_twin_idle);
		} else {
			_this._enemyTwinSprite.sprite.setEnabled(true);		
			_this._enemyTwinSprite.sprite.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_twin_idle);			
		}
		_this.isTwinMainInitiating = true;
	} else {
		_this._actorTwinSprite.sprite.setEnabled(false);		
		_this._enemyTwinSprite.sprite.setEnabled(false);		
		_this.isTwinInitiating = false;
	}
}

BattleSceneManager.prototype.setUpActionSceneState = function(action) {
	var _this = this;
	if(action){	
	
		_this._camera.position.copyFrom(_this._defaultPositions.camera_main_idle);
		_this._camera.rotation.copyFrom(_this._defaultRotations.camera_main_idle);
	
		_this.resetSprites();
		
		
		_this._bgsHidden = false;
		_this.setBgMode($statCalc.isBattleShadowHiddenOnCurrentTerrain(action.ref) ? "sky" : "land");
		_this._actorSprite.sprite.visibility = 1;
		
		if(_this._actorSprite.sprite.material){
			_this._actorSprite.sprite.material.diffuseTexture.uScale = 1;
			_this._actorSprite.sprite.material.diffuseTexture.vScale = 1;
			_this._actorTwinSprite.sprite.visibility = 1;
			_this._actorTwinSprite.sprite.material.diffuseTexture.uScale = 1;
			_this._actorTwinSprite.sprite.material.diffuseTexture.vScale = 1;
		}
		
		_this._enemySprite.sprite.visibility = 1;
		if(_this._enemySprite.sprite.material){
			_this._enemySprite.sprite.material.diffuseTexture.uScale = -1;
			_this._enemySprite.sprite.material.diffuseTexture.vScale = 1;
			_this._enemyTwinSprite.sprite.visibility = 1;
			_this._enemyTwinSprite.sprite.material.diffuseTexture.uScale = -1;
			_this._enemyTwinSprite.sprite.material.diffuseTexture.vScale = 1;
		}
		
		_this._actorSupporterSprite.sprite.visibility = 1;
		if(_this._actorSupporterSprite.sprite.material){
			_this._actorSupporterSprite.sprite.material.diffuseTexture.uScale = 1;
			_this._actorSupporterSprite.sprite.material.diffuseTexture.vScale = 1;  
		}
		_this._actorTwinSupporterSprite.sprite.visibility = 1;
		if(_this._actorTwinSupporterSprite.sprite.material){
			_this._actorTwinSupporterSprite.sprite.material.diffuseTexture.uScale = 1;
			_this._actorTwinSupporterSprite.sprite.material.diffuseTexture.vScale = 1;
		}
		_this._enemySupporterSprite.sprite.visibility = 1;
		if(_this._enemySupporterSprite.sprite.material){
			_this._enemySupporterSprite.sprite.material.diffuseTexture.uScale = -1;
			_this._enemySupporterSprite.sprite.material.diffuseTexture.vScale = 1;
		}
		_this._enemyTwinSupporterSprite.sprite.visibility = 1;
		if(_this._enemyTwinSupporterSprite.sprite.material){
			_this._enemyTwinSupporterSprite.sprite.material.diffuseTexture.uScale = -1;
			_this._enemyTwinSupporterSprite.sprite.material.diffuseTexture.vScale = 1;
		}
		
		/*_this._actorSprite.sprite.parent_handle.position = _this._defaultPositions.ally_main_idle;		
		_this._actorTwinSprite.sprite.parent_handle.position = _this._defaultPositions.ally_main_idle;		
		_this._actorSupporterSprite.sprite.parent_handle.position = _this._defaultPositions.ally_support_idle;
		_this._actorTwinSupporterSprite.sprite.parent_handle.position = _this._defaultPositions.ally_support_idle;
		
		_this._enemySprite.sprite.parent_handle.position = _this._defaultPositions.enemy_main_idle;		
		_this._enemyTwinSprite.sprite.parent_handle.position = _this._defaultPositions.enemy_main_idle;		
		_this._enemySupporterSprite.sprite.parent_handle.position = _this._defaultPositions.enemy_support_idle;
		_this._enemyTwinSupporterSprite.sprite.parent_handle.position = _this._defaultPositions.enemy_support_idle;*/
		
		
		_this._supportDefenderActive = false;
		_this._supportAttackerActive = false;
		_this._doubleImageActive = false;
		_this._actorSupporterSprite.sprite.setEnabled(false);
		_this._enemySupporterSprite.sprite.setEnabled(false);
		//_this._actorTwinSprite.sprite.setEnabled(false);
		_this._actorTwinSupporterSprite.sprite.setEnabled(false);
		//_this._enemyTwinSprite.sprite.setEnabled(false);
		_this._enemyTwinSupporterSprite.sprite.setEnabled(false);
		if(action.side == "actor"){
			
			_this._animationDirection = 1;
			
			_this.setBgScrollDirection(1, false);
			
			
			_this._enemySprite.sprite.setEnabled(false);
			_this._enemyTwinSprite.sprite.setEnabled(false);
			_this._enemyTwinSupporterSprite.sprite.setEnabled(false);
			if(action.type == "support attack"){
				_this._lastActionWasSupportAttack = true;
				_this._supportAttackerActive = true;
				_this._actorSprite.sprite.setEnabled(false);
				_this._actorSupporterSprite.sprite.setEnabled(true);
				_this._actorSupporterSprite.sprite.parent_handle.position = _this._defaultPositions.ally_main_idle;
				//_this._UILayerManager.setStat(_this._participantInfo.actor_supporter.effect, "HP");
				//_this._UILayerManager.setStat(_this._participantInfo.actor_supporter.effect, "EN");
			} else{		
			_this._lastActionWasSupportAttack = false;
				if(action.ref.isSubTwin){
					_this._actorTwinSprite.sprite.setEnabled(true);		
				} else {					
					_this._actorSprite.sprite.setEnabled(true);											
				}
				_this._actorSupporterSprite.sprite.parent_handle.position = _this._defaultPositions.ally_support_idle;
				//_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "HP");
				//_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "EN");
			}			
		} else {
			_this._animationDirection = -1;
			
			_this.setBgScrollDirection(-1, false);	
			
			_this._actorSprite.sprite.setEnabled(false);
			_this._actorTwinSprite.sprite.setEnabled(false);
			_this._actorTwinSupporterSprite.sprite.setEnabled(false);
			if(action.type == "support attack"){
				_this._lastActionWasSupportAttack = true;
				_this._supportAttackerActive = true;
				_this._enemySprite.sprite.setEnabled(false);
				_this._enemySupporterSprite.sprite.setEnabled(true);
				_this._enemySupporterSprite.sprite.parent_handle.position = _this._defaultPositions.enemy_main_idle;
				//_this._UILayerManager.setStat(_this._participantInfo.enemy_supporter.effect, "HP");
				//_this._UILayerManager.setStat(_this._participantInfo.enemy_supporter.effect, "EN");
			} else {			
				_this._lastActionWasSupportAttack = false;
				if(action.ref.isSubTwin){
					_this._enemyTwinSprite.sprite.setEnabled(true);	
				} else {
					_this._enemySprite.sprite.setEnabled(true);	
				}
				
				_this._enemySupporterSprite.sprite.parent_handle.position = _this._defaultPositions.enemy_support_idle;
				//_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "HP");
				//_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "EN");
			}
		}
		if(action.attacked){
			if(action.attacked.type == "support defend"){
				_this._lastActionWasSupportDefend = true;
			} else {
				_this._lastActionWasSupportDefend = false;
			}
		}
	}
}

BattleSceneManager.prototype.endScene = function(force) {
	var _this = this;
	_this.lastAnimId = -1;
	var sanityCheck = true;
	_this.endSceneTimeOut = setTimeout(function(){
		if(sanityCheck){
			console.log("battle scene ended due to sanity check");			
			_this.disposeAnimationSprites();
			_this.disposeAnimationBackgrounds();
			_this.disposeSpriterBackgrounds();
			_this.disposeLights();
			_this.disposeEffekseerInstances();
			_this.disposeMovieBackgrounds();
			_this.disposeRMMVBackgrounds();			
			_this.disposeTextureCache();
			_this.disposeDynamicModels();
			_this.disposeRenderTargets();
			_this._UIcontainer.style.display = "";
			_this._TextContainer.style.display = "";
			_this._PIXIContainer.style.display = "";	
			_this.stopScene();
			$gameSystem.setSubBattlePhase('after_battle');
		}
		//fail safe against state bugs with the system fade and swipe container
		_this._systemFadeContainer.style.display = "none";
		_this._swipeContainer.style.display = "none";
		_this._runningAnimation = false;
		_this._animationList = [];
		_this.endSceneTimeOut = null;
	}, 2500);
	if(!_this._sceneIsEnding || force){
		_this._sceneIsEnding = true;	
		_this.systemFadeToBlack(400, 400).then(function(){			
			//_this._animationReject();
			_this._animsPaused = false;
			if(_this._moviePlayback){
				_this._movieContainer.style.display = "";
				_this._movieVideo.pause();
				_this._moviePlayback = null;
			}	
			
			_this._runningAnimation = false;
			_this.disposeAnimationSprites();
			_this.disposeAnimationBackgrounds();
			_this.disposeSpriterBackgrounds();
			_this.disposeEffekseerInstances();
			_this.disposeLights();
			_this.disposeRMMVBackgrounds();
			_this.disposeMovieBackgrounds();
			_this._animationList = [];
			_this.disposeTextureCache();
			_this.disposeDynamicModels();
			_this.disposeRenderTargets();
			_this._UIcontainer.style.display = "";
			_this._TextContainer.style.display = "";
			_this._PIXIContainer.style.display = "";	
			_this.stopScene();
			_this.systemFadeFromBlack(400, 1000).then(function(){
				//fail safe against state bugs with the system fade and swipe container
				_this._systemFadeContainer.style.display = "none";
				_this._swipeContainer.style.display = "none";
				sanityCheck = false;
				$gameSystem.setSubBattlePhase('after_battle');
				if(!$gameTemp.editMode){
					SceneManager.resume();
				}			
			});			
		});
	}	
}

BattleSceneManager.prototype.getDefaultAnim = function(attack) {
	var defaultAnim;
	if(ENGINE_SETTINGS.BATTLE_SCENE && ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS){
		if(attack.particleType && ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS[attack.particleType] != null){
			defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS[attack.particleType];
		}
		if(defaultAnim == null){
			if(attack.type == "M"){
				defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS["melee"];
			} else {
				defaultAnim = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIMATIONS["ranged"];
			}
		}
	} 
	if(defaultAnim == null){
		defaultAnim = 0;
	}
	
	return defaultAnim;
}

BattleSceneManager.prototype.processActionQueue = function() {
	var _this = this;
	if(_this._awaitingText){
		setTimeout(function(){_this.processActionQueue()}, 100);
		return;
	}
	
	if(!_this._actionQueue.length){
		
		if($gameTemp.debugSceneManager){
			return;
		}
		if(!_this._sceneIsEnding){
			_this._sceneIsEnding = true;
			var endTimer = 1000;
			if(_this._noCounter){
				endTimer = 2000;
				
				var nextAction = _this._defenderCache;
				var entityType = nextAction.isActor ? "actor" : "enemy";
				var entityId = nextAction.ref.SRWStats.pilot.id;				
				
				let textType = "no_counter";
				if(this._currentAnimatedAction.isBuffingAttack){
					textType = "received_buff";
				}
				var battleText = _this._battleTextManager.getText(entityType, nextAction.ref, textType, nextAction.isActor ? "actor" : "enemy", _this.getBattleTextId(nextAction.attackedBy), null, null);
				
				_this._TextlayerManager.setTextBox(entityType, entityId, nextAction.ref.SRWStats.pilot.name, battleText);
			}
			setTimeout(function(){
				_this.systemFadeToBlack(100, 1000).then(function(){					
					_this.stopScene();
					_this._UIcontainer.style.display = "";
					_this._PIXIContainer.style.display = "";	
					_this._TextContainer.style.display = "";
					_this.systemFadeFromBlack(1000).then(function(){
						$gameSystem.setSubBattlePhase('after_battle');
						if(!$gameTemp.editMode){
							SceneManager.resume();
						}
					});			
				});		
			}, endTimer);
		}
		
		return;
	} else {		
		var nextAction = _this._actionQueue.shift();		
		while((!nextAction || !nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none") && _this._actionQueue.length){
			nextAction = _this._actionQueue.shift();
		}
		
		
		
		
		if(nextAction && nextAction.hasActed && nextAction.action.type != "defend" && nextAction.action.type != "evade" && nextAction.action.type != "none"){
			_this._TextlayerManager.resetTextBox();
			_this._TextlayerManager.hideNoise();
			_this._battleTextManager.clearAttackGroupId();
			
			_this.doingFadeTransition = false;
			var direction;
			if(nextAction.side == "actor"){
				direction = "right";
			} else {
				direction = "left";
			}
			
			/*if((!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && _this._lastActionWasSupportAttack) || (ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && nextAction.type == "support attack")){// || _this._lastActionWasSupportDefend
				_this.fadeToBlack(700).then(function(){
					_this.createEnvironment(nextAction.ref);
					continueScene();
					_this.fadeFromBlack();
				});
			} else {
				continueScene();
			}*/
			continueScene();
			
			async function continueScene(){			
				if(_this._lastAction && _this._lastAction.attacked.ref != nextAction.ref){
					if(_this._lastAction.attacked_all_sub && _this._lastAction.attacked_all_sub.ref == nextAction.ref){
						await _this.playCounterTwinAnimation()
						await continueSetup();
						finalizeSetup();
						await showBeforeAnimationTextBox();						
						startAnimation();
					} else {
						_this.doingFadeTransition = true;						
						await _this.swipeToBlack(direction, "in", 300);
						_this._UILayerManager.clearPopupNotifications()
						_this.showEnvironment(nextAction.ref);
						await continueSetup();	
						finalizeSetup();
						await _this.swipeToBlack(direction, "out", 300);
						await showBeforeAnimationTextBox();						
						startAnimation();						
					}					
				} else {
					if(_this._lastAction && _this._lastAction.attacked_all_sub){
						await _this.playCounterTwinMainIntroAnimation()						
						await continueSetup();
						finalizeSetup();
						await showBeforeAnimationTextBox();
						
						startAnimation();
					} else {
						await continueSetup();
						finalizeSetup();
						await showBeforeAnimationTextBox();						
						startAnimation();
					}					
				}
				
				async function showBeforeAnimationTextBox(){
					var textType = "";
					
					var entityType = nextAction.isActor ? "actor" : "enemy";
					var entityId = nextAction.ref.SRWStats.pilot.id;
					
					var battleText;
					if(nextAction.type == "support attack"){
						battleText = _this._battleTextManager.getText(entityType, nextAction.ref, "support_attack", nextAction.isActor ? "actor" : "enemy", _this.getBattleTextId(nextAction.attacked), null, null, _this.getBattleTextId(nextAction.mainAttacker));
					}					
					if(!battleText || battleText.text == "..."){
						if(nextAction.type == "initiator"){
							textType = "battle_intro";
						}
						if(nextAction.type == "defender"){
							textType = "retaliate";
						}
						
						battleText = _this._battleTextManager.getText(entityType, nextAction.ref, textType, nextAction.isActor ? "enemy" : "actor", _this.getBattleTextId(nextAction.attacked));
					}				
					await _this._TextlayerManager.setTextBox(entityType, entityId, nextAction.ref.SRWStats.pilot.name, battleText);
				}
				
				function startAnimation(){					
					if(nextAction.type == "support attack")	{
						_this._UILayerManager.setNotification(nextAction.side, "Support Attack");
					} else if(nextAction.ref.isSubTwin){
						_this._UILayerManager.setNotification(nextAction.side, "Twin Attack");
					} else {					
						_this._UILayerManager.setNotification(nextAction.side, "Main Attack");					
					}
					
					let isBetweenFriendlies;

					if($gameTemp.editMode){
						isBetweenFriendlies = false;
					} else {
						isBetweenFriendlies = $gameSystem.areUnitsFriendly(nextAction.ref, nextAction.attacked.ref);
					}
					
					
					var attack = nextAction.action.attack;
					var animId;
					if(isBetweenFriendlies && (typeof attack.vsAllyAnimId != "undefined" && attack.vsAllyAnimId != -1)){						
						animId = attack.vsAllyAnimId;										
					} else if(typeof attack.animId != "undefined" && attack.animId != -1){
						animId = attack.animId;
					} else {						
						animId = _this.getDefaultAnim(attack);
					}
					_this.lastAnimId = animId;
					_this._playingIntro = false;	
					//prevent lingering promises from a cancelled scene from triggering action queue processing
					_this.playAttackAnimation(nextAction, _this._animationBuilder.buildAnimation(animId, _this)).then(function(){
						//prevent lingering promises from a cancelled scene from triggering action queue processing
						if(_this._animationPromise.instanceId == _this._instanceId){
							if(_this.lastAnimId != -1){
								$gameSystem.setMovesSeen(_this.lastAnimId);
							}
							_this.processActionQueue();
						}
					});
				}	
				
				async function continueSetup(){				
					_this._lastAction = nextAction;
					_this.setUpActionSceneState(nextAction);						
						
					_this._active_target_twin = null;					
					_this._currentAnimatedAction = nextAction;					
					
					if(nextAction.side == "actor"){
						_this._enemyTwinSprite.sprite.setEnabled(false);						
						_this._animationDirection = 1;
						//_this.setBgScrollDirection(1, false);
						_this._active_main = _this._actorSprite.sprite;	
						_this._active_twin =  _this._actorTwinSprite.sprite;
						_this._active_support_attacker = _this._actorSupporterSprite.sprite;
						_this._active_support_defender = _this._enemySupporterSprite.sprite;
						if(nextAction.attacked.type == "support defend" && nextAction.attacked.ref.isSubTwin){
							
							_this._active_support_defender = _this._enemyTwinSupporterSprite.sprite;
						}
						if(nextAction.attacked_all_sub){
							_this._active_target = _this._enemySprite.sprite;									
							_this._active_target_twin = _this._enemyTwinSprite.sprite;	
						} else if(nextAction.originalTarget.ref.isSubTwin){
							_this._active_target = _this._enemyTwinSprite.sprite;		
						} else {
							_this._active_target = _this._enemySprite.sprite;		
						}						
					} else {
						_this._actorTwinSprite.sprite.setEnabled(false);
						_this._animationDirection = -1;
						//_this.setBgScrollDirection(-1, false);
						_this._active_main = _this._enemySprite.sprite;
						_this._active_twin =  _this._enemyTwinSprite.sprite;
						_this._active_support_attacker = _this._enemySupporterSprite.sprite;
						_this._active_support_defender = _this._actorSupporterSprite.sprite;
						if(nextAction.attacked.type == "support defend" && nextAction.attacked.ref.isSubTwin){
							_this._active_support_defender = _this._actorTwinSupporterSprite.sprite;
						}
						if(nextAction.attacked_all_sub){
							_this._active_target = _this._actorSprite.sprite;									
							_this._active_target_twin = _this._actorTwinSprite.sprite;	
						} else
						if(nextAction.originalTarget.ref.isSubTwin){
							_this._active_target = _this._actorTwinSprite.sprite;
						} else {
							_this._active_target = _this._actorSprite.sprite;		
						}	
					}

					function updateRenderingGroup(elem){
						if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
							_this.applyMutator(elem, (mesh) => {
								mesh.renderingGroupId = 2;
							});
						} else {
							_this.applyMutator(elem, (mesh) => {
								mesh.renderingGroupId = 0;
							});
						}
					}
					
					if(_this._active_main){
						_this._active_main.parent_handle.rotation = new BABYLON.Vector3(0,0,0);	
						_this._active_main.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_main);
					}
					
					if(_this._active_twin){
						_this._active_twin.parent_handle.rotation = new BABYLON.Vector3(0,0,0);	
						_this._active_twin.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_twin);
					}
					
					if(_this._active_support_attacker){
						_this._active_support_attacker.parent_handle.rotation = new BABYLON.Vector3(0,0,0);	
						_this._active_support_attacker.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_support_attacker);
					}
					
					if(_this._active_support_defender){
						_this._active_support_defender.parent_handle.rotation = new BABYLON.Vector3(0,0,0);	
						_this._active_support_defender.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_support_defender);
					}
					
					if(_this._active_target){
						_this._active_target.parent_handle.rotation = new BABYLON.Vector3(0,0,0);
						_this._active_target.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_target);
					}
					
					if(_this._active_target_twin){
						_this._active_target_twin.parent_handle.rotation = new BABYLON.Vector3(0,0,0);		
						_this._active_target_twin.pivothelper.rotation = new BABYLON.Vector3(0,0,0);
						updateRenderingGroup(_this._active_target_twin);
					}
							
								
					
					if(nextAction.attacked && nextAction.attacked.hasBarrier){
						var target;
						if(nextAction.attacked.ref.isSubTwin){
							target = _this._active_target_twin;
						} else {
							target = _this._active_target;
						}					
					}
					if(nextAction.attacked_all_sub && nextAction.attacked_all_sub.hasBarrier){
						var target;
						if(nextAction.attacked_all_sub.ref.isSubTwin){
							target = _this._active_target_twin;
						} else {
							target = _this._active_target;
						}
					}
					
					if(_this.isTwinInitiating){
						_this.isTwinInitiating = false;
						await _this.playTwinIntroAnimation()
					} else if(_this.isTwinMainInitiating){
						_this.isTwinMainInitiating = false;
						await  _this.playTwinMainIntroAnimation();						
					} 				
				}				
				
				async function finalizeSetup(){	
					_this._UILayerManager.resetDisplay();
					if(nextAction.side == "actor"){
						if(nextAction.attacked_all_sub){
							_this._UILayerManager.setStatBoxVisible("enemyTwin", true);
							_this._UILayerManager.setStatBoxVisible("enemy", true);	
						} else if(nextAction.attacked.ref.isSubTwin){	
							_this._UILayerManager.setStatBoxVisible("enemyTwin");		
						} else {
							_this._UILayerManager.setStatBoxVisible("enemy");	
						}						
					} else {
						if(nextAction.attacked_all_sub){	
							_this._UILayerManager.setStatBoxVisible("allyTwin", true);
							_this._UILayerManager.setStatBoxVisible("ally", true);	
						} else
						if(nextAction.attacked.ref.isSubTwin){	
							_this._UILayerManager.setStatBoxVisible("allyTwin");
						} else {	
							_this._UILayerManager.setStatBoxVisible("ally");	
						}	
					}
					
					
					if(_this._participantInfo.actor.participating){
						_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "HP");
						_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "EN");
					}
					
					if(_this._participantInfo.actor_twin.participating){
						_this._UILayerManager.setStat(_this._participantInfo.actor_twin.effect, "HP");
						_this._UILayerManager.setStat(_this._participantInfo.actor_twin.effect, "EN");
					}
					
					if(_this._participantInfo.enemy.participating){
						_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "HP");
						_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "EN");
					}
					
					if(_this._participantInfo.enemy_twin.participating){
						_this._UILayerManager.setStat(_this._participantInfo.enemy_twin.effect, "HP");
						_this._UILayerManager.setStat(_this._participantInfo.enemy_twin.effect, "EN");
					}
					
					if(nextAction.attacked.type == "support defend"){
						if(nextAction.side == "actor"){
							if(nextAction.attacked.ref.isSubTwin){
								_this._UILayerManager.setStat(_this._participantInfo.enemy_twin_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.enemy_twin_supporter.effect, "EN");
							} 					
						} else {
							if(nextAction.attacked.ref.isSubTwin){
								_this._UILayerManager.setStat(_this._participantInfo.actor_twin_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.actor_twin_supporter.effect, "EN");
							} 
						}
					}
					
				
					if(nextAction.type == "support attack")	{
						
						_this._active_main.setEnabled(false);		
						_this._active_twin.setEnabled(false);
						_this._actorTwinSupporterSprite.sprite.setEnabled(false);
						_this._actorSupporterSprite.sprite.setEnabled(false);
						_this._enemyTwinSupporterSprite.sprite.setEnabled(false);
						_this._enemySupporterSprite.sprite.setEnabled(false);
						if(nextAction.side == "actor"){									
							if(nextAction.ref.isSubTwin){									
								_this._active_support_attacker = _this._actorTwinSupporterSprite.sprite;
								_this._UILayerManager.setStat(_this._participantInfo.actor_twin_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.actor_twin_supporter.effect, "EN");
							} else {
								_this._active_support_attacker = _this._actorSupporterSprite.sprite;
								_this._UILayerManager.setStat(_this._participantInfo.actor_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.actor_supporter.effect, "EN");
							}
							_this._active_support_attacker.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_main_idle);
							
						} else {
							if(nextAction.ref.isSubTwin){									
								_this._active_support_attacker = _this._enemyTwinSupporterSprite.sprite;
								_this._UILayerManager.setStat(_this._participantInfo.enemy_twin_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.enemy_twin_supporter.effect, "EN");
							} else {
								_this._active_support_attacker = _this._enemySupporterSprite.sprite;
								_this._UILayerManager.setStat(_this._participantInfo.enemy_supporter.effect, "HP");
								_this._UILayerManager.setStat(_this._participantInfo.enemy_supporter.effect, "EN");
							}
							_this._active_support_attacker.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_main_idle);
							
						}
						_this._active_support_attacker.setEnabled(true);
						if(nextAction.side == "actor"){
							_this._UILayerManager.setStatBoxVisible("ally");
						} else {
							_this._UILayerManager.setStatBoxVisible("enemy");
						}
					} else if(nextAction.ref.isSubTwin){								
						
						_this._active_main.setEnabled(false);		
						_this._active_twin.setEnabled(false);									
						_this._active_main = _this._active_twin;
						_this._active_main.setEnabled(true);
						if(nextAction.side == "actor"){
							_this._UILayerManager.setStatBoxVisible("allyTwin");
						} else {
							_this._UILayerManager.setStatBoxVisible("enemyTwin");
						}
					} else {
						_this._active_main.setEnabled(true);		
						_this._active_twin.setEnabled(false);	

						if(nextAction.side == "actor"){
							_this._UILayerManager.setStatBoxVisible("ally");
						} else {
							_this._UILayerManager.setStatBoxVisible("enemy");
						}
					}					
					if(nextAction.side == "actor"){
						_this._active_main.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_main_idle);
						_this._active_target.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_main_idle);
						if(_this._active_target_twin){
							_this._active_target_twin.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_twin_idle);
						}
					} else {
						_this._active_main.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_main_idle);
						_this._active_target.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_main_idle);
						if(_this._active_target_twin){
							_this._active_target_twin.parent_handle.position = new BABYLON.Vector3().copyFrom(_this._defaultPositions.ally_twin_idle);
						}
					}	
					
				}
			}	
		} else {
			_this.processActionQueue();
		}
	}
}

BattleSceneManager.prototype.playBattleScene = async function(){
	var _this = this;
	this._sceneCanEnd = false;
	this._runningAnimation = false;
	_this._animationList = [];
	//_this.stopScene();
	var promises = [];
	if(_this.endSceneTimeOut){
		clearTimeout(_this.endSceneTimeOut);
	}
	_this.systemFadeToBlack(200, 200).then(async function(){		
		
		$gameTemp.popMenu = true;//remove before battle menu
		//SceneManager.stop();		
		_this.resetScene();
		//_this.stopScene();
		_this.startScene();
		_this.showScene();
	});
}

BattleSceneManager.prototype.isPaused = function() {
	return this._animsPaused;
}

BattleSceneManager.prototype.pauseAnimations = function() {
	this._animsPaused = true;
}

BattleSceneManager.prototype.startAnimations = function() {
	this._returnFromBlur = true;
	this._animsPaused = false;
}

BattleSceneManager.prototype.showEnvironmentScene = async function() {
	var _this = this;		
	
	_this._bgs.forEach(function(bg){
		bg.dispose();
	});	
	_this._bgs = [];
	_this._bgInstances = [];
	
	_this._fixedBgs.forEach(function(bg){
		bg.dispose();
	});
	_this._cachedBgs = {};
	_this._bgLayerInfo = {};
	
	_this._sceneCanEnd = false;
	_this._sceneIsEnding = false;
	_this._UIcontainer.style.display = "block";	
	_this._TextContainer.style.display = "block";
	_this._PIXIContainer.style.display = "block";	
	_this._systemFadeContainer.style.display = "block";
	_this._swipeContainer.style.display = "block";
	
	_this.resetScene();		
	_this.setBgScrollDirection(1, true);
	
	if(_this._actorSprite){
		_this._actorSprite.sprite.setEnabled(false);
	}
	if(_this._enemySprite){
		_this._enemySprite.sprite.setEnabled(false);
	}
	if(_this._actorSupporterSprite){
		_this._actorSupporterSprite.sprite.setEnabled(false);
	}
	if(_this._enemySupporterSprite){
		_this._enemySupporterSprite.sprite.setEnabled(false);
	}
	_this._TextlayerManager.resetTextBox();
	_this._camera.position.copyFrom(_this._defaultPositions.camera_main_idle);
	_this._camera.rotation.copyFrom(_this._defaultRotations.camera_main_idle);
	//_this.stopScene();
	_this.startScene();		
	await _this.createEnvironment();
	_this.showEnvironment(null, true);
	_this.systemFadeFromBlack();
}

BattleSceneManager.prototype.showText = function(entityType, ref, name, type, subType, target, targetIdx, attackId, supported) {
	var _this = this;
	var battleText = _this._battleTextManager.getText(entityType, ref, type, subType, target, targetIdx, attackId, supported);
	_this._TextlayerManager.setTextBox(entityType, ref.actorId, name, battleText);
}

BattleSceneManager.prototype.toggleTextBox = function(state) {	
	this._textBoxState = state;
	if(this._UILayerManager){
		if(state){
			this._TextlayerManager.fadeInTextBox(true);
		} else {
			this._TextlayerManager.fadeOutTextBox(true);
		}	
	}	
}

BattleSceneManager.prototype.toggleUnitPivots = function(state) {	
	const _this = this;
	if(_this._actorSprite && _this._actorSprite.sprite.pivothelper){
		_this._actorSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._actorTwinSprite && _this._actorTwinSprite.sprite.pivothelper){
		_this._actorTwinSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._enemySprite && _this._enemySprite.sprite.pivothelper){
		_this._enemySprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._enemyTwinSprite && _this._enemyTwinSprite.sprite.pivothelper){
		_this._enemyTwinSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._actorSupporterSprite && _this._actorSupporterSprite.sprite.pivothelper){
		_this._actorSupporterSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._actorTwinSupporterSprite && _this._actorTwinSupporterSprite.sprite.pivothelper){
		_this._actorTwinSupporterSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._enemySupporterSprite && _this._enemySupporterSprite.sprite.pivothelper){
		_this._enemySupporterSprite.sprite.pivothelper.isVisible = state;
	}
	if(_this._enemyTwinSupporterSprite && _this._enemyTwinSupporterSprite.sprite.pivothelper){
		_this._enemyTwinSupporterSprite.sprite.pivothelper.isVisible = state;
	}
}
