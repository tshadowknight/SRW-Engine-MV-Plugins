import Window_CSS from "./Window_CSS.js";
import "./style/Window_SpiritActivation.css";

export default function Window_SpiritActivation() {
	this.initialize.apply(this, arguments);	
}

function printStackTrace() {
  const error = new Error();
  const stack = error.stack
	.split('\n')
	.slice(2)
	.map((line) => line.replace(/\s+at\s+/, ''))
	.join('\n');
  console.log(stack);
}
	

Window_SpiritActivation.prototype = Object.create(Window_CSS.prototype);
Window_SpiritActivation.prototype.constructor = Window_SpiritActivation;

Window_SpiritActivation.prototype.initialize = function() {
	var _this = this;
	this._processingAction = false;
	this._processingAnimationCount = 0;
	this._animationQueue = [];
	this._requiredImages = [];	
	this._layoutId = "spirit_activation";	
	this._timer = 50;
	this._participantInfo = {
		"actor": {
			img: ""
		}		
	};
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
		
	this._actionQueue = [];
	
	this._finishing = false;
	this._finishTimer = 0;
	
	Object.keys($spiritManager.getSpiritDefinitions()).forEach(function(id){
		var spiritAnimInfo = $spiritManager.getSpiritDisplayInfo(id).animInfo;		
		if(spiritAnimInfo.name){
			ImageManager.loadNormalBitmap('img/SRWMapEffects/'+spiritAnimInfo.name+".png");
		} else if(spiritAnimInfo.src){
			ImageManager.loadBitmapPromise(_this.makeSpiritAnimationURL(spiritAnimInfo.src));
		}
	});
}

Window_SpiritActivation.prototype.testSpirits = function(){
	var _this = this;
	var target = $statCalc.getAllActors("actor").shift();
	$gameTemp.spiritTargetActor = target;
	var queued = [];
	Object.keys($spiritManager.getSpiritDefinitions()).forEach(function(id){
		queued.push({type: "spirit", parameters: {target: target, idx: id}})
	});	
	
	$gameTemp.queuedActorEffects = [queued.shift()];
	this.open();
	this.show();
	$gameTemp.spiritWindowDoneHandler = function(){
		_this.hide();
		_this.close();
		if(queued.length){
			$gameTemp.queuedActorEffects = [queued.shift()];
			console.log("Testing " + $gameTemp.queuedActorEffects[0].parameters.idx + ", " +  $spiritManager.getSpiritDisplayInfo($gameTemp.queuedActorEffects[0].parameters.idx).animInfo.name);
			_this.open();
			_this.show();
		}
	}
}

Window_SpiritActivation.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_SpiritActivation.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	//this._actor.classList.add("scaled_width");
	//this._actor.classList.add("scaled_height");
	this._actor = document.createElement("div");
	this._actor.id = this.createId("actor");
	this._actorImg = document.createElement("img");
	this._actor.appendChild(this._actorImg);
	this._participantInfo.actor.imgElem = this._actorImg;
	
	this._spiritAnim = document.createElement("div");
	this._spiritAnim.id = this.createId("spirit_anim");
	this._spiritAnimImageContainer = document.createElement("div");
	this._spiritAnimImageContainer.classList.add("spirit_anim_container");
	this._spiritAnimImage = document.createElement("img");
	this._spiritAnimImage.classList.add("spirit_anim");
	this._spiritAnimImageContainer.appendChild(this._spiritAnimImage);
	this._spiritAnim.appendChild(this._spiritAnimImageContainer);
	
	this._bgFadeContainer.innerHTML = "";
	
	this._HPBar = document.createElement("div");
	this._HPBar.id = this.createId("HPBar");
	this._HPBarFill = document.createElement("div");
	this._HPBarFill.id = this.createId("HPBarFill");
	this._HPBar.appendChild(this._HPBarFill);
	
	this._messageText = document.createElement("div");
	this._messageText.id = this.createId("message");
	this._messageText.classList.add("scaled_text");
	this._bgFadeContainer.appendChild(this._messageText);
	
	this._bgFadeContainer.appendChild(this._HPBar);	
	
	this._bgFadeContainer.appendChild(this._actor);	
	this._bgFadeContainer.appendChild(this._spiritAnim);	
	
}	

Window_SpiritActivation.prototype.loadRequiredImages = function(){
	var _this = this;
	return new Promise(function(resolve, reject){
		var promises = [];
		Object.keys(_this._participantInfo).forEach(function(type){
			var participant = _this._participantInfo[type];			
			promises.push(ImageManager.loadBitmapPromise(_this.makeImageURL(participant.img)));					
		});
		_this._actionQueue.forEach(function(effectDef){
			if(effectDef.type == "spirit"){
				var spiritId = effectDef.parameters.idx;	
				var spiritAnimInfo = $spiritManager.getSpiritDisplayInfo(spiritId).animInfo;				
				if(spiritAnimInfo.name){
					ImageManager.loadNormalBitmap('img/SRWMapEffects/'+spiritAnimInfo.name+".png");
				} else if(spiritAnimInfo.src){
					promises.push(ImageManager.loadBitmapPromise(_this.makeSpiritAnimationURL(spiritAnimInfo.src)));
				}
			} else if(effectDef.type == "repair"){
				promises.push(ImageManager.loadBitmapPromise(_this.makeSpiritAnimationURL(effectDef.parameters.animId)));
			}		
		});
		
		Promise.all(promises).then(function(){
			resolve();
		});
	});
}

Window_SpiritActivation.prototype.loadImage = function(url){
	return new Promise(function(resolve, reject){
		var img=new Image();
		img.src=url;
		img.onload = resolve;
	});
}

Window_SpiritActivation.prototype.getActorInfo = function() {
	var _this = this;	
	_this._participantInfo.actor.img = $statCalc.getBasicBattleImage($gameTemp.spiritTargetActor);	
	/*var effectList = [];
	if($gameTemp.queuedActorEffects){
		effectList = JSON.parse(JSON.stringify($gameTemp.queuedActorEffects));
	}*/
	_this._actionQueue = $gameTemp.queuedActorEffects;	
}

Window_SpiritActivation.prototype.show = function(softRefresh) {
	var _this = this;	
	
	
	console.log("Window_SpiritActivation.prototype.show called at "+Date.now());
	printStackTrace();
	this._doubleSpeedEnabled = false;
	this._processingAction = false;
	this._finishing = false;
	_this.clearMessage();
	if(!softRefresh){
		_this.createComponents();
	}
	
	_this.visible = true;
	_this._redrawRequested = true;
	_this._visibility = "";
	_this.refresh();	
	Graphics._updateCanvas();	
	
	_this.getActorInfo();	
	//this._actorImg.style.display = "block";
	this.redraw();
	_this._waitingTimer = 120;//wait 120 frames max for images to load
	_this.loadRequiredImages().then(function(){
		_this._handlingInput = false;
		_this._waitingTimer = 0;//immediately clear load wait	
	});	
};

Window_SpiritActivation.prototype.setMessage = function(message, color) {
	if(!color){
		color = "#FFFFFF";
	}
	this._messageText.innerHTML = message;
	this._messageText.style.color = color;
}

Window_SpiritActivation.prototype.clearMessage = function(message, color) {
	this.setMessage("");
}

Window_SpiritActivation.prototype.getHPAnimInfo = function(action) {
	var targetMechStats = $statCalc.getCalculatedMechStats(action.attacked.ref);

	var startPercent = Math.floor((action.attacked.currentAnimHP / targetMechStats.maxHP)*100);
	var endPercent = Math.floor(((action.attacked.currentAnimHP - action.damageInflicted) / targetMechStats.maxHP)*100);
	if(endPercent < 0){
		endPercent = 0;
	}
	return {startPercent: startPercent, endPercent: endPercent};
}

Window_SpiritActivation.prototype.animateHP = function(elem, fillElem, startPercent, endPercent) {
	var _this = this;
	elem.style.display = "block";
	fillElem.style.width = startPercent+"%";
	var steps = 100;
	var stepDuration =  (400 * this.getAnimTimeRatio())/steps;
	var startTime = Date.now();
	var sign = Math.sign(startPercent - endPercent);
	var step = Math.abs(startPercent - endPercent) / steps;
	var hpDrainInterval = setInterval(function(){
		var ctr = Math.floor((Date.now() - startTime) / stepDuration);
		if(ctr <= steps){
			fillElem.style.width=startPercent - (step * ctr * sign)+"%";;
		} else {
			fillElem.style.width=endPercent;
		}
		if(ctr >= steps + 100){//linger a bit on the final hp value
			clearInterval(hpDrainInterval);
			elem.style.display = "none";
		}
	}, stepDuration);
}

/*Window_SpiritActivation.prototype.hide = function() {

}*/

Window_SpiritActivation.prototype.hide = function() {
	console.log("Window_SpiritActivation.prototype.hide called at "+Date.now());
	printStackTrace();
	
    this.visible = false;
	this._visibility = "none";
	//this._bgFadeContainer.style.display = "none";
	this.refresh();
};

Window_SpiritActivation.prototype.update = async function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(_this._waitingTimer > 0){
		_this._waitingTimer--;
		return;
	}
	
	if(this.isOpen() && !this._handlingInput){
		
		if(this._finishing){
			if(this._finishTimer <= 0){
				this._finishing = false;
				//this._actorImg.style.display = "none";
				if(_this._callbacks.done){
					_this._callbacks.done();
				}				
			}
			this._finishTimer--;
			return;
		}
		
		if(!this._processingAction){
			var nextAction = this._actionQueue.shift();
			
			if(typeof nextAction == "undefined"){
				if(!this._finishing){
					this._finishing = true;
					this._finishTimer = 20;
				}							
			} else {
				this._actor.className = "";				
				this._processingAction = true;
				this._processingAnimation = false;
				this._animationQueue = [nextAction]
			}			
		} else {
			if(!this._processingAnimation){
				//console.log("Processing animation");
				//this.requestRedraw();
				var effectDef = this._animationQueue.shift();				
				
				var newNode = this._spiritAnimImage.cloneNode(true);
				this._spiritAnimImageContainer.replaceChild(newNode, this._spiritAnimImage);
				this._spiritAnimImage = newNode;
				
				if(typeof effectDef != "undefined"){
					if(effectDef.type == "spirit"){
						var spiritId = effectDef.parameters.idx;
						this._processingAnimation = true;			
						var spiritAnimInfo = $spiritManager.getSpiritDisplayInfo(spiritId).animInfo;
						this._spiritAnimImage.style.display = "block";
						this._spiritAnimImage.setAttribute("data-img", this.makeSpiritAnimationURL(spiritAnimInfo.src));
						this._spiritAnimImage.style["animation-duration"] = "";
						//console.log("Showing Spirit Image: "+this._spiritAnimImage.src);
						this.applyDoubleTime(this._spiritAnimImage);
											
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							//console.log("Hiding spirit image");
							_this._processingAnimation = false;
						}, spiritAnimInfo.duration * this.getAnimTimeRatio());							
						
						var se = {};
						se.name = spiritAnimInfo.se || "SRWPowerUp";
						se.pan = 0;
						se.pitch = 100;
						se.volume = 90;
						AudioManager.playSe(se);
						
						if(effectDef.parameters.target && spiritAnimInfo.recovered){
							var stats = $statCalc.getCalculatedMechStats(effectDef.parameters.target);
							
							var startPercent = Math.floor((stats.HPBeforeRecovery / stats.maxHP) * 100);
							var endPercent = Math.floor((stats.currentHP / stats.maxHP) * 100);
							_this.setMessage(stats.currentHP - stats.HPBeforeRecovery, "#227722");
							_this.animateHP(_this._HPBar, _this._HPBarFill, startPercent, endPercent);
						}
						
						
					} else if(effectDef.type == "damage"){
						this._processingAnimation = true;			
						var stats = $statCalc.getCalculatedMechStats(effectDef.parameters.target);							
						var startPercent = Math.floor((stats.currentHP / stats.maxHP) * 100);
						var endPercent = Math.floor((Math.max(stats.currentHP - effectDef.parameters.damage, 0) / stats.maxHP) * 100);						
						_this.animateHP(_this._HPBar, _this._HPBarFill, startPercent, endPercent);
						_this.setMessage(effectDef.parameters.damage, "#FF2222");
						if(effectDef.parameters.damage > 0){
							_this._actor.classList.add("damage");
						}
						
						setTimeout(function(){ 
							_this.clearMessage();
						}, 400 * this.getAnimTimeRatio());	
							
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							_this._processingAnimation = false;
						}, 650 * this.getAnimTimeRatio());	
						
						var se = {};
						se.name = 'SRWHit';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 90;
						AudioManager.playSe(se);
					} else if(effectDef.type == "double_image"){
						this._processingAnimation = true;			
						_this.setMessage("DOUBLE IMAGE");
						_this._actor.classList.add("double_image");
													
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							_this._processingAnimation = false;
						}, 650 * this.getAnimTimeRatio());	
						
						var se = {};
						se.name = 'SRWDoubleImage';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 90;
						AudioManager.playSe(se);
					} else if(effectDef.type == "miss"){
						this._processingAnimation = true;			
						_this.setMessage("MISS");
													
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							_this._processingAnimation = false;
						}, 650 * this.getAnimTimeRatio());	
						
						var se = {};
						se.name = 'SRWMiss';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 90;
						AudioManager.playSe(se);
					} else if(effectDef.type == "repair"){
						this._processingAnimation = true;			
						
						this._spiritAnimImage.style.display = "block";
						this._spiritAnimImage.setAttribute("data-img", this.makeSpiritAnimationURL(effectDef.parameters.animId));
						this._spiritAnimImage.style["animation-duration"] = "";
						this.applyDoubleTime(this._spiritAnimImage);
											
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							//console.log("Hiding spirit image");
							_this._processingAnimation = false;
						}, 800 * this.getAnimTimeRatio());		
						
						
						var stats = $statCalc.getCalculatedMechStats(effectDef.parameters.target);
						
						if(effectDef.parameters.total){
							var startPercent = Math.floor((effectDef.parameters.startAmount / effectDef.parameters.total) * 100);
							var endPercent = Math.floor((effectDef.parameters.endAmount / effectDef.parameters.total) * 100);
							_this.setMessage(effectDef.parameters.endAmount - effectDef.parameters.startAmount, "#227722");
							_this.animateHP(_this._HPBar, _this._HPBarFill, startPercent, endPercent);
						}												
						
						setTimeout(function(){ 
							_this.clearMessage();
						}, 400 * this.getAnimTimeRatio());	
							
						setTimeout(function(){ 
							_this._spiritAnimImage.style.display = "none" 
							_this._processingAnimation = false;
						}, 650 * this.getAnimTimeRatio());	
						
						var se = {};
						se.name = 'SRWPowerUp';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 90;
						AudioManager.playSe(se);
					}			
					//await this.loadImages();
					Graphics._updateCanvas();		
				} else {
					this._processingAction = false;
				}

				this.redraw();	
			}
		}		
		
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			
	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			
	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			
		
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			
			
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			
			
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			
			
		}
		
		if(Input.isTriggered('L3')){
			
			//this.getActorInfo();
		} 	
		
	
		if (Input.isTriggered('ok') || Input.isPressed('ok') || Input.isLongPressed('ok')) {
			this._doubleSpeedEnabled = true;
			this.getWindowNode().classList.add("double_speed");
		} else {
			this._doubleSpeedEnabled = false;
			this.getWindowNode().classList.remove("double_speed"); 
		}
		
		if(Input.isTriggered('cancel')){				
			//$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_SpiritActivation.prototype.makeImageURL = function(name) {
	return "img/basic_battle/"+name+".png";
}

Window_SpiritActivation.prototype.makeSpiritAnimationURL = function(name) {
	return "img/animations/spirits/"+name+".png";
}

Window_SpiritActivation.prototype.redraw = async function() {	
	var _this = this;
	
	//console.log("Redrawing spirit animation window");
	Object.keys(_this._participantInfo).forEach(function(type){
		var participant = _this._participantInfo[type];
		
		if(participant.img){
			participant.imgElem.setAttribute("data-img", _this.makeImageURL(participant.img));
		}		
		//_this.updateScaledImage(participant.imgElem);
					
	});	
	
	await this.loadImages();
	
	_this.updateScaledDiv(_this._bgFadeContainer);	
	if(!_this.updateScaledImage(_this._spiritAnimImage)){
		//console.log("Attempted to set image scale on an unintialized image!");
		this.requestRedraw();
	}
	_this.updateScaledDiv(_this._spiritAnim);
	_this.updateScaledDiv(_this._HPBar);
	_this.updateScaledDiv(_this._actor);
	_this.updateScaledDiv(_this._messageText);
	//_this._messageText.innerHTML = "DOUBLE IMAGE";
	
	Graphics._updateCanvas();
}

