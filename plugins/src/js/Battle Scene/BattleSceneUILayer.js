import Window_CSS from "../SRW Menus/Window_CSS.js";
//import "./style/digital-7.regular.ttf";
import "./style/BattleSceneUILayer.css";

export default function BattleSceneUILayer() {
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

BattleSceneUILayer.prototype = Object.create(Window_CSS.prototype);
BattleSceneUILayer.prototype.constructor = BattleSceneUILayer;

BattleSceneUILayer.prototype.initialize = function() {	
	var _this = this;
	this._layoutId = "battle_scene_ui_layer";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function () {
		_this.redraw();
	});
}

BattleSceneUILayer.prototype.fadeOutTextBox = function(immediate){
	var _this = this;
	if(immediate){
		this._textDisplay.style.transition = "none";
	}
	this._textDisplay.classList.add("fadeOut");
	if(immediate){
		setTimeout(function(){_this._textDisplay.style.transition = "";}, 100);
	}
	
}

BattleSceneUILayer.prototype.fadeInTextBox = function(immediate){
	var _this = this;
	if(immediate){
		this._textDisplay.style.transition = "none";
	}
	this._textDisplay.classList.remove("fadeOut");
	if(immediate){
		setTimeout(function(){_this._textDisplay.style.transition = "";}, 100);
	}
}

BattleSceneUILayer.prototype.updateTwinDisplay = function(info){
	this.resetDisplay();
	this._allyStats.style.display = "";
	this._enemyStats.style.display = "";
	if(info.actor){
		this._allyStats.classList.add("inTwinContext");
		this._allyTwinStats.style.display = "block";
	} else {
		this._allyStats.classList.remove("inTwinContext");
		this._allyTwinStats.style.display = "none";
	}
	
	if(info.enemy){
		this._enemyStats.classList.add("inTwinContext");
		this._enemyTwinStats.style.display = "block";
	} else {
		this._enemyStats.classList.remove("inTwinContext");
		this._enemyTwinStats.style.display = "none";
	}
}

BattleSceneUILayer.prototype.resetDisplay = function(info){
	this._allyStats.style.left = "";
	this._allyStats.style.right = "";
	this._allyStats.style.display = "none";
	
	this._allyTwinStats.style.left = "";
	this._allyTwinStats.style.right = "";
	this._allyTwinStats.style.display = "none";
	
	this._enemyStats.style.left = "";
	this._enemyStats.style.right = "";
	this._enemyStats.style.display = "none";
	
	this._enemyTwinStats.style.left = "";
	this._enemyTwinStats.style.right = "";
	this._enemyTwinStats.style.display = "none";
}

BattleSceneUILayer.prototype.setStatBoxVisible = function(type, inTwinContext){
	if(type == "ally"){
		this._allyStats.style.display = "block";
		if(inTwinContext){
			this._allyStats.style.right = "17%";
		} else {
			this._allyStats.style.right = "0.5%";
		}	
	}
	if(type == "allyTwin"){
		this._allyTwinStats.style.display = "block";
	}
	if(type == "enemy"){
		this._enemyStats.style.display = "block";
		if(inTwinContext){
			this._enemyStats.style.left = "17%";
		} else {
			this._enemyStats.style.left = "0.5%";
		}
	}
	if(type == "enemyTwin"){
		this._enemyTwinStats.style.display = "block";
	}
}

BattleSceneUILayer.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	this._textDisplay = document.createElement("div");
	this._textDisplay.id = this.createId("text_display");
	
	var content = "";
	content+="<div id='icon_and_noise_container'>";
	content+="<div id='icon_container'></div>";
	
	content+="<canvas width=144 height=144 id='noise'></canvas>";
	content+="</div>";
	
	this._textDisplay.innerHTML = content;
	this._textDisplayNameAndContent = document.createElement("div");
	this._textDisplayNameAndContent.id = this.createId("text_display_name_and_content");		
	this._textDisplay.appendChild(this._textDisplayNameAndContent);
	windowNode.appendChild(this._textDisplay);
	
	this._noiseCanvas = this._textDisplay.querySelector("#noise");
	this._noiseCtx = this._noiseCanvas.getContext("2d");
	
	this._damageDisplay = document.createElement("div");
	this._damageDisplay.id = this.createId("damage_display");	
	this._damageDisplay.classList.add("scaled_text");
	windowNode.appendChild(this._damageDisplay);
	
	this._damageDisplayTwin = document.createElement("div");
	this._damageDisplayTwin.id = this.createId("damage_display_twin");
	/*this._damageDisplayTwin.style.top = "55%";	*/
	this._damageDisplayTwin.classList.add("scaled_text");
	windowNode.appendChild(this._damageDisplayTwin);
	
	this._allyStats = document.createElement("div");
	this._allyStats.id = this.createId("ally_stats");
	this._allyStats.classList.add("stats_container");
	this._allyStats.classList.add("isMain");
	windowNode.appendChild(this._allyStats);
	
	this._allyTwinStats = document.createElement("div");
	this._allyTwinStats.id = this.createId("ally_twin_stats");
	this._allyTwinStats.classList.add("stats_container");
	windowNode.appendChild(this._allyTwinStats);
	
	this._enemyStats = document.createElement("div");
	this._enemyStats.id = this.createId("enemy_stats");
	this._enemyStats.classList.add("stats_container");
	this._enemyStats.classList.add("isMain");
	windowNode.appendChild(this._enemyStats);	
	
	this._enemyTwinStats = document.createElement("div");
	this._enemyTwinStats.id = this.createId("enemy_twin_stats");
	this._enemyTwinStats.classList.add("stats_container");
	windowNode.appendChild(this._enemyTwinStats);	
	
	this._allyNotification = document.createElement("div");
	this._allyNotification.id = this.createId("ally_notification");
	this._allyNotification.classList.add("notification");
	this._allyNotification.classList.add("scaled_text");
	windowNode.appendChild(this._allyNotification);
	
	this._enemyNotification = document.createElement("div");
	this._enemyNotification.id = this.createId("enemy_notification");
	this._enemyNotification.classList.add("notification");
	this._enemyNotification.classList.add("scaled_text");
	windowNode.appendChild(this._enemyNotification);
	
	this._allyBarrierNotification = document.createElement("div");
	this._allyBarrierNotification.id = this.createId("ally_barrier_notification");
	this._allyBarrierNotification.classList.add("barrier_notification");
	this._allyBarrierNotification.classList.add("scaled_text");
	windowNode.appendChild(this._allyBarrierNotification);
	
	this._enemyBarrierNotification = document.createElement("div");
	this._enemyBarrierNotification.id = this.createId("enemy_barrier_notification");
	this._enemyBarrierNotification.classList.add("barrier_notification");
	this._enemyBarrierNotification.classList.add("scaled_text");
	windowNode.appendChild(this._enemyBarrierNotification);
}	

BattleSceneUILayer.prototype.createStatsRowContent = function(label, labelFirst) {
	var content = "";
	if(labelFirst){
		content+="<div class='label scaled_text'>"
		content+=label
		content+="</div>"
	}
	
	content+="<div class='values scaled_text'>"
	content+="<div class='current value'>"
	//content+=stats.current+"/";
	content+="</div>"
	content+="<div class='divider'>/</div>"
	content+="<div class='max value'>"
	//content+=stats.max;
	content+="</div>"
	content+="</div>"
	
	content+="<div class='bar scaled_text'>"
	content+="<div style='width: ' class='fill'>";//"+((stats.current /stats.max) * 100)+"%
	
	content+="</div>"
		
	content+="</div>"
	if(!labelFirst){
		content+="<div class='label scaled_text'>"
		content+=label
		content+="</div>"	
	}
	
	return content;
}

BattleSceneUILayer.prototype.animateHP = function(target, slot, oldPercent, newPercent, duration) {
	var _this = this;
	var maxValue;
	var isHidden;
	if(target == "actor"){
		if(slot == "twin"){
			maxValue = $statCalc.getCalculatedMechStats(_this._currentTwinActor.ref).maxHP;
			isHidden = !$statCalc.isRevealed(_this._currentTwinActor.ref);
			_this._allyTwinStatData.HP.max = maxValue;
			_this._allyTwinStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
		} else {
			maxValue = $statCalc.getCalculatedMechStats(_this._currentActor.ref).maxHP;
			isHidden = !$statCalc.isRevealed(_this._currentActor.ref);
			_this._allyStatData.HP.max = maxValue;
			_this._allyStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
		}		
	}
	if(target == "enemy"){
		if(slot == "twin"){
			maxValue = $statCalc.getCalculatedMechStats(_this._currentTwinEnemy.ref).maxHP;
			isHidden = !$statCalc.isRevealed(_this._currentTwinEnemy.ref);
			_this._enemyTwinStatData.HP.max = maxValue;
			_this._enemyTwinStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
		} else {
			maxValue = $statCalc.getCalculatedMechStats(_this._currentEnemy.ref).maxHP;
			isHidden = !$statCalc.isRevealed(_this._currentEnemy.ref);
			_this._enemyStatData.HP.max = maxValue;
			_this._enemyStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
		}
	}
	var elems = _this.getStatElements(target, slot, "HP");
	_this.animateStat(slot, elems, maxValue, oldPercent, newPercent, duration, target, "HP", isHidden);
}

BattleSceneUILayer.prototype.animateEN = function(target, slot, oldPercent, newPercent, duration) {
	var _this = this;
	var maxValue;
	var isHidden;
	if(target == "actor"){
		if(slot == "twin"){
			maxValue = $statCalc.getCalculatedMechStats(_this._currentTwinActor.ref).maxEN;
			isHidden = !$statCalc.isRevealed(_this._currentTwinActor.ref);
			_this._allyTwinStatData.EN.max = maxValue;
			_this._allyTwinStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
		} else {
			maxValue = $statCalc.getCalculatedMechStats(_this._currentActor.ref).maxEN;
			isHidden = !$statCalc.isRevealed(_this._currentActor.ref);
			_this._allyStatData.EN.max = maxValue;
			_this._allyStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
		}
	}
	if(target == "enemy"){
		if(slot == "twin"){
			maxValue = $statCalc.getCalculatedMechStats(_this._currentTwinEnemy.ref).maxEN;
			isHidden = !$statCalc.isRevealed(_this._currentTwinEnemy.ref);
			_this._enemyTwinStatData.EN.max = maxValue;
			_this._enemyTwinStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
		} else {
			maxValue = $statCalc.getCalculatedMechStats(_this._currentEnemy.ref).maxEN;
			isHidden = !$statCalc.isRevealed(_this._currentEnemy.ref);
			_this._enemyStatData.EN.max = maxValue;
			_this._enemyStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
		}
	}
	var elems = _this.getStatElements(target, slot, "EN");
	_this.animateStat(slot, elems, maxValue, oldPercent, newPercent, duration, target, "EN", isHidden);
}

BattleSceneUILayer.prototype.animateStat = function(slot, elems, maxValue, oldPercent, newPercent, duration, target, type, isHidden) {
	var _this = this;
	var ticks = duration / 10;
	var oldValue = maxValue / 100 * oldPercent;
	var newValue = maxValue / 100 * newPercent;
	var totalDelta = newValue - oldValue;
	var direction = Math.sign(newValue - oldValue);		
	//var tickValue = Math.abs((oldValue - newValue) / ticks);
	var currentTick = 0;
	var animIntervalKey;
	if(slot == "twin"){
		animIntervalKey = "animationIntervalTwin";
	} else {
		animIntervalKey = "animationInterval";
	}
	if(_this[animIntervalKey]){
		clearInterval(_this[animIntervalKey]);
	}
	let startTime = Date.now();
	_this[animIntervalKey] = setInterval(function(){	
		let t = (Date.now() - startTime) / duration;
		if(t > 1){
			t = 1;
		}
		var currentVal = oldValue+Math.floor(totalDelta * t);//Math.floor(tickValue * currentTick * direction)
		if(t < 1){		
			if(type == "HP" && newValue <= 100000){ 
				isHidden = false;
				if(target == "actor"){
					if(slot == "twin"){
						$statCalc.setRevealed(_this._currentTwinActor.ref);
						_this.setStat(_this._currentTwinActor, "EN");
					} else {
						$statCalc.setRevealed(_this._currentActor.ref);
						_this.setStat(_this._currentActor, "EN");
					}					
				}
				if(target == "enemy"){
					if(slot == "twin"){
						$statCalc.setRevealed(_this._currentTwinEnemy.ref);
						_this.setStat(_this._currentTwinEnemy, "EN");
					} else {
						$statCalc.setRevealed(_this._currentEnemy.ref);
						_this.setStat(_this._currentEnemy, "EN");
					}
				}		
				
			}
			_this.updateStatContent(elems, maxValue, currentVal, type, isHidden);
		} else {
			_this.updateStatContent(elems, maxValue, newValue, type, isHidden);
			clearInterval(_this[animIntervalKey]);
		}		
		currentTick++;
	}, 10);
}

BattleSceneUILayer.prototype.getStatElements = function(target, slot, type) {
	var rowClass;
	var label;
	var bar;
	var maxLabel;
	if(type == "HP"){
		rowClass = "hp_row";
	} 
	if(type == "EN"){
		rowClass = "en_row";
	} 
	if(slot == "twin"){
		if(target == "actor"){
			label = this._allyTwinStats.querySelector("."+rowClass+" .current");
			maxLabel = this._allyTwinStats.querySelector("."+rowClass+" .max");
			bar = this._allyTwinStats.querySelector("."+rowClass+" .bar .fill");
		}
		if(target == "enemy"){
			label = this._enemyTwinStats.querySelector("."+rowClass+" .current");
			maxLabel = this._enemyTwinStats.querySelector("."+rowClass+" .max");
			bar = this._enemyTwinStats.querySelector("."+rowClass+" .bar .fill");
		}
	} else {
		if(target == "actor"){
			label = this._allyStats.querySelector("."+rowClass+" .current");
			maxLabel = this._allyStats.querySelector("."+rowClass+" .max");
			bar = this._allyStats.querySelector("."+rowClass+" .bar .fill");
		}
		if(target == "enemy"){
			label = this._enemyStats.querySelector("."+rowClass+" .current");
			maxLabel = this._enemyStats.querySelector("."+rowClass+" .max");
			bar = this._enemyStats.querySelector("."+rowClass+" .bar .fill");
		}
	}
	
	return {
		label: label,
		bar: bar,
		maxLabel: maxLabel
	}
}

BattleSceneUILayer.prototype.setStat = function(effect, type) {
	var _this = this;
	var stats = $statCalc.getCalculatedMechStats(effect.ref);
	var maxValue;
	var value;
	var target;
	var isHidden;
	
	var slot;
	if(effect.ref.isSubTwin){
		slot = "twin";
		if(effect.side == "actor"){
			target = "actor";
			_this._currentTwinActor = effect;		
		} else {
			target = "enemy";
			_this._currentTwinEnemy = effect;
		}		
	} else {
		if(effect.side == "actor"){
			target = "actor";
			_this._currentActor = effect;		
		} else {
			target = "enemy";
			_this._currentEnemy = effect;
		}
	}
	
	if(type == "HP"){
		maxValue = stats.maxHP;
		value = effect.currentAnimHP;
		console.log("Setting stat "+type+" to "+effect.currentAnimHP);
	} else {
		maxValue = stats.maxEN;
		value = effect.currentAnimEN;
		console.log("Setting stat "+type+" to "+effect.currentAnimEN);
	}
	isHidden = !$statCalc.isRevealed(effect.ref);
	var elems = _this.getStatElements(target, slot, type);	
	this.updateStatContent(elems, maxValue, value, type, isHidden);
	this.updateUnitIcons();	
}

BattleSceneUILayer.prototype.updateStatContent = function(elems, maxValue, value, type, isHidden) {
	var _this = this;
	var currentVal;
	var maxVal;
	if(isHidden){
		if(type == "EN"){
			currentVal = "???";
			maxVal = "???";
		} else {
			currentVal = "?????";
			maxVal = "?????";
		}
	} else {
		currentVal = Math.round(value);
		maxVal = Math.round(maxValue);
	}
	elems.label.innerHTML = currentVal;
	elems.maxLabel.innerHTML = maxVal;
	elems.bar.style.width = Math.round(value / maxValue * 100) + "%";
}

BattleSceneUILayer.prototype.resetTextBox = function(){
	this._currentEntityType = -1;
	this._currentIconClassId = -1;
	this._currentName = "";
	this._currentText = {}; 	
	this.showTextBox();
}

BattleSceneUILayer.prototype.setTextBox = function(entityType, entityId, displayName, textInfo, showNoise, immediate){
	var _this = this;
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

BattleSceneUILayer.prototype.showAllyNotification = function(text){
	this.setNotification("actor", text);
}

BattleSceneUILayer.prototype.showEnemyNotification = function(text){
	this.setNotification("enemy", text);
}

BattleSceneUILayer.prototype.setNotification = function(side, text){
	var _this = this;
	if(side == "actor"){
		this._allyNotification.innerHTML = text;
		setTimeout(function(){_this._allyNotification.innerHTML = "";}, 1000);
	} else {
		this._enemyNotification.innerHTML = text;
		setTimeout(function(){_this._enemyNotification.innerHTML = "";}, 1000);
	}
}

BattleSceneUILayer.prototype.showAllyBarrierNotification = function(barriers){
	this.setNotification("actor", barriers);
}

BattleSceneUILayer.prototype.showEnemyBarrierNotification = function(barriers){
	this.setNotification("enemy", barriers);
}

BattleSceneUILayer.prototype.clearPopupNotifications = function(){
	var _this = this;
	this._allyBarrierNotification.innerHTML = "";
	this._enemyBarrierNotification.innerHTML = "";
}

BattleSceneUILayer.prototype.setPopupNotification = function(side, barriers, additionalClass){
	var _this = this;
	var text = "";
	var ctr = 0;
	barriers.forEach(function(name){
		if(typeof name == "object"){
			text+="<div style='animation-delay:"+((ctr++ * 0.1))+"s' class='barrier_name "+(name.additionalClass || "")+" scaled_text fitted_text'>"+name.text+"</div>";
		} else {
			text+="<div style='animation-delay:"+((ctr++ * 0.1))+"s' class='barrier_name "+(additionalClass || "")+" scaled_text fitted_text'>"+name+"</div>";
		}
	});
	if(side == "actor"){
		this._allyBarrierNotification.innerHTML = text;
		setTimeout(function(){_this._allyBarrierNotification.innerHTML = "";}, 2500);
	} else {
		this._enemyBarrierNotification.innerHTML = text;
		setTimeout(function(){_this._enemyBarrierNotification.innerHTML = "";}, 2500);
	}
	
	
	var barrierNames = this._container.querySelectorAll(".barrier_name");
	barrierNames.forEach(function(barrierName){
		_this.updateScaledDiv(barrierName);
	});
	Graphics._updateCanvas();
}

BattleSceneUILayer.prototype.showDamage = function(entityType, amount, offsets, displayNum){
	var _this = this;
	var display;
	if(displayNum == 0){
		display = this._damageDisplay;
	} else {
		display = this._damageDisplayTwin;
	}
	display.innerHTML = "";
	display.className = "scaled_text show";
	/*display.style.display = "flex";*/
	/*display.style.top = "";
	display.style.left = "";
	display.style.right = "";*/
	if(entityType == "actor"){		
		display.classList.add("forActor");
		
		//display.style.top = offsets.top + "%";
		//display.style.left = offsets.left + "%";
		
	} 
	if(entityType == "enemy"){		
		display.classList.add("forEnemy");
		
		//display.style.top = offsets.top + "%";
		//display.style.right = offsets.left + "%";
		
	}
	
	
	//display.classList.add("shake");
	var characters = String(amount).split("");
	var charCtr = 0;
	for(var i = 0; i < characters.length; i++){
		display.innerHTML+="<div data-ctr='"+i+"' class='digit disabled'>"+characters[i]+"</div>"
	}
	function displayCharacter(){
		if(charCtr < characters.length){
			display.querySelector(".digit[data-ctr = '"+charCtr+"']").classList.remove("disabled");
			display.querySelector(".digit[data-ctr = '"+charCtr+"']").classList.add("reveal");
			charCtr++;
			setTimeout(displayCharacter, 100);
		} else {
			setTimeout(function(){display.className = "scaled_text hide";}, 1000);
		}
	}	
	displayCharacter();
}

BattleSceneUILayer.prototype.showTextBox = function() {
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

BattleSceneUILayer.prototype.showTextLines = function(lines, callback) {	
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
		
		Graphics._updateCanvas();
		var duration = 90 * 1000/60;
		if(line.duration){
			duration = line.duration * 1000/60;
		}

		setTimeout(function(){_this.showTextLines(lines, callback)}, duration);
	} else {
		callback();
	}	
}

BattleSceneUILayer.prototype.showNoise = function() {
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

BattleSceneUILayer.prototype.registerNoiseUpdate = function() {
	var _this = this;	
	if(!_this._noiseUpdate){
		_this._noiseUpdate = function noise(){	
			if(_this._noiseCtx){
				_this._noiseCtr++;
				var imgd = _this._noiseCtx.createImageData(_this._noiseCanvas.width, _this._noiseCanvas.height);
				var pix = imgd.data;

				for (var i = 0, n = pix.length; i < n; i += 4) {
				// var c = 7 + Math.sin(i/50000 + time/7); // A sine wave of the form sin(ax + bt)
					pix[i] = pix[i+1] = pix[i+2] = 255 * Math.random() + 50; // Set a random gray
					pix[i+3] = _this._noiseCtr * 4;
				}

				if(!_this._runNoise){
					pix[i+3] = 0;
				}
				_this._noiseCtx.putImageData(imgd, 0, 0);
				//time = (time + 1) % canvas.height;
			
			}
			
			requestAnimationFrame(_this._noiseUpdate);
					
		}
		requestAnimationFrame(_this._noiseUpdate);
	}
	
}

BattleSceneUILayer.prototype.updateUnitIcons = function(){
	var _this = this;
	if(_this._currentActor){
		var menuImagePath = $statCalc.getMenuImagePath(_this._currentActor.ref);
		this._container.querySelector("#actor_icon").innerHTML = "<img data-img='img/"+menuImagePath+"'>";
	} else {		
		this._container.querySelector("#actor_icon").innerHTML = "";
	}
	
	if(_this._currentTwinActor){
		var menuImagePath = $statCalc.getMenuImagePath(_this._currentTwinActor.ref);
		this._container.querySelector("#actor_icon_twin").innerHTML = "<img data-img='img/"+menuImagePath+"'>";
	} else {		
		this._container.querySelector("#actor_icon_twin").innerHTML = "";
	}
	
	if(_this._currentEnemy){
		var menuImagePath = $statCalc.getMenuImagePath(_this._currentEnemy.ref);
		this._container.querySelector("#enemy_icon").innerHTML = "<img data-img='img/"+menuImagePath+"'>";
	} else {		
		this._container.querySelector("#enemy_icon").innerHTML = "";
	}
	
	if(_this._currentTwinEnemy){
		var menuImagePath = $statCalc.getMenuImagePath(_this._currentTwinEnemy.ref);
		this._container.querySelector("#enemy_icon_twin").innerHTML = "<img data-img='img/"+menuImagePath+"'>";
	} else {		
		this._container.querySelector("#enemy_icon_twin").innerHTML = "";
	}
	this.loadImages();
}

BattleSceneUILayer.prototype.hideNoise = function() {
	this._runNoise = false;
	if(this._noiseCanvas){
		this._noiseCanvas.className = "";	
	}	
}	

BattleSceneUILayer.prototype.redraw = function() {	
	var _this = this;
	_this.showTextBox();	
	
	
	//_this.updateScaledImage(_this._spiritAnimImage);
	//_this.updateScaledDiv(_this._spiritAnim);
	
	function createStatContent(type, slot){
		var content = "";
		content+="<div class='inner'>"
		
		if(type == "enemy"){
			if(slot == "twin"){
				content+="<div class='icon' id='enemy_icon_twin'>"
				content+="</div>"
			} else {
				content+="<div class='icon' id='enemy_icon'>"
				content+="</div>"
			}			
		}	
		content+="<div class='hp_en'>"
		content+="<div class='hp_row'>"
		
		content+=_this.createStatsRowContent("HP", type == "enemy");
		
		content+="</div>"
		
		content+="<div class='en_row'>"
		
		content+=_this.createStatsRowContent("EN", type == "enemy");
		content+="</div>"
		
		content+="</div>"
		
		if(type == "ally"){			
			if(slot == "twin"){
				content+="<div class='icon' id='actor_icon_twin'>"
				content+="</div>"
			} else {
				content+="<div class='icon' id='actor_icon'>"
				content+="</div>"
			}	
		}
		
		
		if(slot == "main"){
			content+="<div class='slot main "+type+" scaled_text'>MAIN"
			content+="</div>"
		} else {
			content+="<div class='slot sub "+type+" scaled_text'>TWIN"
			content+="</div>"
		}
		
		
		content+="</div>"
		return content;
	}
	
	

	
	this._allyStats.innerHTML = createStatContent("ally", "main");
	this._allyTwinStats.innerHTML =  createStatContent("ally", "twin");
	_this.updateScaledDiv(this._allyStats);
	_this.updateScaledDiv(this._allyTwinStats);
	
	/*var enemyStatsContent = "";
	enemyStatsContent+="<div class='inner'>"
	enemyStatsContent+="<div class='icon' id='enemy_icon'>"
	enemyStatsContent+="</div>"
	enemyStatsContent+="<div class='slot enemy scaled_text'>MAIN"
	enemyStatsContent+="</div>"
	
	enemyStatsContent+="<div class='hp_en'>"
	enemyStatsContent+="<div class='hp_row'>"
	
	enemyStatsContent+=this.createStatsRowContent("HP", true);
	
	enemyStatsContent+="</div>"
	
	enemyStatsContent+="<div class='en_row'>"
	
	enemyStatsContent+=this.createStatsRowContent("EN", true);
	
	enemyStatsContent+="</div>"
	enemyStatsContent+="</div>"
	enemyStatsContent+="</div>"*/
	this._enemyStats.innerHTML = createStatContent("enemy", "main");
	this._enemyTwinStats.innerHTML = createStatContent("enemy", "twin");
	_this.updateScaledDiv(this._enemyStats);
	_this.updateScaledDiv(this._enemyTwinStats);
	
	
	var bars = this._container.querySelectorAll(".bar");
	bars.forEach(function(bar){
		_this.updateScaledDiv(bar, true, false);
	});
	
	var valueLabels = this._container.querySelectorAll(".values .value");
	valueLabels.forEach(function(valueLabel){
		_this.updateScaledDiv(valueLabel, false, true);
	});
	
	var valueLabels = this._container.querySelectorAll(".values .divider");
	valueLabels.forEach(function(valueLabel){
		_this.updateScaledDiv(valueLabel, false, true);
	});
	
	/*this.setStat("actor", "HP", _this._allyStatData.HP.max, _this._allyStatData.HP.current, isHidden);
	this.setStat("actor", "EN", _this._allyStatData.EN.max, _this._allyStatData.EN.current, isHidden);
	
	this.setStat("enemy", "HP", _this._enemyStatData.HP.max, _this._enemyStatData.HP.current, isHidden);
	this.setStat("enemy", "EN", _this._enemyStatData.EN.max, _this._enemyStatData.EN.current, isHidden);*/
	
	_this.updateScaledDiv(this._damageDisplay);
	_this.updateScaledDiv(this._damageDisplayTwin);
	
	//_this.updateScaledDiv(this._allyBarrierNotification);
	//_this.updateScaledDiv(this._enemyBarrierNotification);
	
	var icons = this._container.querySelectorAll(".icon");
	icons.forEach(function(icon){
		_this.updateScaledDiv(icon);
	});
	
	
	
	Graphics._updateCanvas();
}
