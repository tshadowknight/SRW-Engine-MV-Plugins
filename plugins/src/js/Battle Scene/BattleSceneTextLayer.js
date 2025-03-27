import Window_CSS from "../SRW Menus/Window_CSS.js";
//import "./style/digital-7.regular.ttf";
import "./style/BattleSceneUILayer.css";

export default function BattleSceneTextLayer() {
	this.initialize.apply(this, arguments);	
	this._currentName = "";
	this._currentText = ""; 
	this._currentIconClassId = -1; //debug
	this._currentEntityType = "";
	this._allyStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	this._enemyStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	this._allyTwinStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	this._enemyTwinStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	
	this._currentActor;
	this._currentEnemy;
}

BattleSceneTextLayer.prototype = Object.create(Window_CSS.prototype);
BattleSceneTextLayer.prototype.constructor = BattleSceneTextLayer;

BattleSceneTextLayer.prototype.initialize = function() {	
	var _this = this;
	this._layoutId = "battle_scene_text_layer";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function () {
		_this.redraw();
	});
}

BattleSceneTextLayer.prototype.fadeOutTextBox = function(immediate){
	var _this = this;
	if(immediate){
		this._textDisplay.style.transition = "none";
	}
	this._textDisplay.classList.add("fadeOut");
	if(immediate){
		setTimeout(function(){_this._textDisplay.style.transition = "";}, 100);
	}
	
}

BattleSceneTextLayer.prototype.fadeInTextBox = function(immediate){
	var _this = this;
	if(immediate){
		this._textDisplay.style.transition = "none";
	}
	this._textDisplay.classList.remove("fadeOut");
	if(immediate){
		setTimeout(function(){_this._textDisplay.style.transition = "";}, 100);
	}
}


BattleSceneTextLayer.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	this._textDisplay = document.createElement("div");
	this._textDisplay.id = this.createId("text_display");
	
	var content = "";
	content+="<div id='icon_and_noise_container'>";
	content+="<div id='icon_container'></div>";
	
	const pixelSize = ENGINE_SETTINGS.BATTLE_SCENE.NOISE_PIXEL_SIZE || 1;
	const canvasDim = 144 / pixelSize;

	content+="<canvas width="+canvasDim+" height="+canvasDim+" id='noise'></canvas>";
	content+="</div>";
	
	this._textDisplay.innerHTML = content;
	this._textDisplayNameAndContent = document.createElement("div");
	this._textDisplayNameAndContent.id = this.createId("text_display_name_and_content");		
	this._textDisplay.appendChild(this._textDisplayNameAndContent);
	windowNode.appendChild(this._textDisplay);
	
	this._noiseCanvas = this._textDisplay.querySelector("#noise");
	this._noiseCtx = this._noiseCanvas.getContext("2d");
	
}	

BattleSceneTextLayer.prototype.resetTextBox = function(){
	this._currentEntityType = -1;
	this._currentIconClassId = -1;
	this._currentName = "";
	this._currentText = {}; 	
	this.showTextBox();
}

BattleSceneTextLayer.prototype.setTextBox = function(entityType, entityId, displayName, textInfo, showNoise, immediate){
	var _this = this;
	if(ENGINE_SETTINGS.BATTLE_SCENE.SHOW_FADE_BELOW_TEXTBOX){
		var windowNode = this.getWindowNode();
		windowNode.style.zIndex = 60;
	}
	return new Promise(function(resolve, reject){
		var time = Date.now();
		if(!_this._lastTextTime || time - _this._lastTextTime > 1000 || immediate){

			_this._lastTextTime = time;
			_this._currentEntityType = entityType;
			_this._currentIconClassId = entityId;
			_this._currentName = displayName;
			_this._currentText = JSON.parse(JSON.stringify(textInfo)); 
			if(showNoise){
				_this.showNoise();
			}
			_this.showTextBox().then(function(){				
				setTimeout(resolve, 500);
			});					
		} else {
			setTimeout(function(){
				_this.setTextBox(entityType, entityId, displayName, textInfo, showNoise);
				resolve();
			}, 1000);
		}
	});		
}

BattleSceneTextLayer.prototype.showTextBox = function() {
	var _this = this;
	var lines = [];
	if(!Array.isArray(_this._currentText)){
		lines = [_this._currentText];
	} else {
		lines = _this._currentText;
	}
	return new Promise(function(resolve, reject){
		_this.showTextLines(lines, resolve);
	});	
}

BattleSceneTextLayer.prototype.showTextLines = function(lines, callback) {	
	var _this = this;
	var line = lines.shift();
	if(line){
		var textDisplayContent = "";		
		textDisplayContent+="<div id='name_container' class='scaled_text'>";	
		if(line.displayName){
			var characterDef = $scriptCharactersLoader.getData()[line.displayName];
			if(characterDef && ENGINE_SETTINGS.variableUnitPortraits){
				var expressionInfo = characterDef.expressions[0];
				var keyParts = expressionInfo.face.split("_");
				keyParts.pop();
				var faceKey = keyParts.join("_");
				
				var substitutionCandidates = ENGINE_SETTINGS.variableUnitPortraits[faceKey];
				let active;
				if(substitutionCandidates){
					substitutionCandidates.forEach(function(entry){
						if($statCalc.isMechDeployed(entry.deployedId)){
							active = entry;
						}
					});
				}
				if(active){
					textDisplayContent+= $dataClasses[active.deployedId].name;
				} else {
					textDisplayContent+=line.displayName;
				}
				
			} else {
				textDisplayContent+=line.displayName;
			}			
		} else {
			textDisplayContent+=_this._currentName;
		}		
		textDisplayContent+="</div>";
		textDisplayContent+="<div id='text_container' class='text_container scaled_text'>";	
		if(line.text){
			textDisplayContent+=(line.text || "");//"\u300C "+(line.text || "")+" \u300D";
		} else {
			textDisplayContent+="";
		}		
		textDisplayContent+="</div>";
		
		_this._textDisplayNameAndContent.innerHTML = textDisplayContent;
		_this.updateScaledDiv(_this._textDisplay, true, false);
		
		var iconContainer = _this._textDisplay.querySelector("#icon_and_noise_container");
		_this.updateScaledDiv(iconContainer);		
		
		var actorIcon = _this._container.querySelector("#icon_container");
		actorIcon.innerHTML = "";
		if(_this._currentIconClassId != -1 && _this._currentEntityType != -1){			
			/*if(_this._currentEntityType == "actor"){
				_this.loadActorFace(_this._currentIconClassId, actorIcon);
			} else {
				_this.loadEnemyFace(_this._currentIconClassId, actorIcon);
			}*/	
			_this.loadFaceByParams(line.faceName, line.faceIndex, actorIcon);
			
		} 
		
		this.updateCanvas();
		var duration = 90 * 1000/60;
		if(line.duration){
			duration = line.duration * 1000/60;
		}

		setTimeout(function(){_this.showTextLines(lines, callback)}, duration);
	} else {
		callback();
	}	
}

BattleSceneTextLayer.prototype.showNoise = function() {
	var _this = this;
	_this._runNoise = true;
	var iconContainer = this._container.querySelector("#icon_container");
	iconContainer.className = "";
	void iconContainer.offsetWidth;
	iconContainer.classList.add("shake");
	
	//this._noiseCanvas.className = "";
	//void this._noiseCanvas.offsetWidth;
	//this._noiseCanvas.className = "fade_in active";
	//this._noiseCanvas.classList.add("fade_in");
	this._noiseCanvas.classList.add("active");
	
	this._noiseCtr = 0;
	this.registerNoiseUpdate();
}

BattleSceneTextLayer.prototype.registerNoiseUpdate = function() {
	var _this = this;	

	let opacityUpdater = ENGINE_SETTINGS.BATTLE_SCENE.NOISE_OPACITY || ((ctr) => {
		if(ctr == 0){
			return 255;
		}
		if(ctr == 30){
			return 255;
		}

		if(ctr == 60){
			return 255;
		}

		if(ctr == 75){
			return 255;
		}

		if(ctr > 90){
			return (ctr - 30) * 2;
		}
	});
	if(!_this._noiseUpdate){
		_this._noiseUpdate = function noise(){	
			if(_this._noiseCtx){
				_this._noiseCtr++;
				var imgd = _this._noiseCtx.createImageData(_this._noiseCanvas.width, _this._noiseCanvas.height);
				var pix = imgd.data;

				for (var i = 0, n = pix.length; i < n; i += 4) {
				// var c = 7 + Math.sin(i/50000 + time/7); // A sine wave of the form sin(ax + bt)
					pix[i] = pix[i+1] = pix[i+2] = 255 * Math.random() + 50; // Set a random gray
					pix[i+3] = opacityUpdater(_this._noiseCtr);

					if(!_this._runNoise){
						pix[i+3] = 0;
					}
					
				}

				
				_this._noiseCtx.putImageData(imgd, 0, 0);
				//time = (time + 1) % canvas.height;
			
			}
			
			requestAnimationFrame(_this._noiseUpdate);
					
		}
		requestAnimationFrame(_this._noiseUpdate);
	}
	
}


BattleSceneTextLayer.prototype.hideNoise = function() {
	this._runNoise = false;
	if(this._noiseCanvas){
		this._noiseCanvas.className = "";	
	}	
}	

BattleSceneTextLayer.prototype.redraw = function() {	
	var _this = this;
	_this.showTextBox();	
			
	this.updateCanvas();
}

BattleSceneTextLayer.prototype.updateCanvas = function(side, barriers, additionalClass){
	Graphics._updateCanvas();
	$CSSUIManager.doUpdateScaledText();//this window must call this function directly instead of the deferred one because it runs in a context where the main map_scene is not running(it is the one to apply text scaling at the end of the frame)
}