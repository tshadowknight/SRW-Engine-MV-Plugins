import Window_CSS from "./Window_CSS.js";
import "./style/Window_BattleBasic.css";
import Sprite_Animation_BasicBattle from "./Sprites/Sprite_Animation_BasicBattle.js";

export default function Window_BattleBasic() {
	this.initialize.apply(this, arguments);	
}

Window_BattleBasic.prototype = Object.create(Window_CSS.prototype);
Window_BattleBasic.prototype.constructor = Window_BattleBasic;

Window_BattleBasic.prototype.initialize = function() {
	var _this = this;
	this._processingAction = false;
	this._processingAnimationCount = 0;
	this._animationQueue = [];
	this._requiredImages = [];	
	this._layoutId = "battle_basic";	
	this._timer = 50;
	this._participantInfo = {
		"actor": {
			img: "", 
			participating: false
		},
		"actor_twin": {
			img: "", 
			participating: false
		},
		"actor_supporter": {
			img: "", 
			participating: false
		},
		"actor_supporter_twin": {
			img: "", 
			participating: false
		},
		"enemy": {
			img: "", 
			participating: false
		},
		"enemy_twin": {
			img: "", 
			participating: false
		},
		"enemy_supporter": {
			img: "", 
			participating: false
		},
		"enemy_supporter_twin": {
			img: "", 
			participating: false
		}
	};
	this._participantTypeLookup = {};
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
		
	this._actionQueue = [];
	
	this._finishing = false;
	this._finishTimer = 0;
	
	this._RMMVSpriteInfo = [];
	this._lastFrameTime = -1;
	this._deltaTime = -1;
	
	//workaround for issue where on rare occassions, tabbing out of the game during a basic battle animation causes animtionend to not fire, locking up the basic battle view
	window.addEventListener("blur", function(){
		if(_this.isOpen()){
			_this._wasBlurred = true;
			_this._blurCtr = 600;
		}		
	});
}

Window_BattleBasic.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_BattleBasic.prototype.createParticipantComponents = function(componentId, side) {
	var component = {};
	
	var id = this.createId(componentId);
	var previous = document.getElementById(id);
	if(previous){
		previous.parent.removeChild(previous);
	}
	
	var container = document.createElement("div"); 
	
	component.side = side;
	
	container.classList.add("participant_container");
	container.classList.add(side);
	container.id = this.createId(componentId);
	component.container = container;
	
	var unitPicContainer = document.createElement("div");
	unitPicContainer.classList.add("unit_pic_container");
	container.appendChild(unitPicContainer);
	component.unitPicContainer = unitPicContainer;
	
	var image = document.createElement("img");
	image.classList.add("unit_pic");
	unitPicContainer.appendChild(image);
	//this._participantInfo.actor.imgElem = this._actorImg;
	component.image = image;	
	
	var HP = document.createElement("div");
	HP.classList.add("label");
	HP.classList.add("HP_bar");
	
	var HPFill =  document.createElement("div");
	HPFill.classList.add("fill");
	HP.appendChild(HPFill);	
	
	container.appendChild(HP);
	//container.appendChild(HPFill);
	
	component.HP = HP;
	component.HPFill = HPFill;
	
	var damageLabel = document.createElement("div");
	damageLabel.classList.add("label");
	damageLabel.classList.add("damage_label");
	container.appendChild(damageLabel);
	component.damageLabel = damageLabel;
	
	var critLabel = document.createElement("div");
	critLabel.classList.add("label");
	critLabel.classList.add("crit_label");
	critLabel.classList.add("scaled_text");
	critLabel.innerHTML = APPSTRINGS.BASIC_BATTLE.label_CRIT;
	container.appendChild(critLabel);
	component.critLabel = critLabel;
	
	var statusLabel = document.createElement("div");
	statusLabel.classList.add("label");
	statusLabel.classList.add("status_label");
	statusLabel.classList.add("scaled_text");
	statusLabel.innerHTML = APPSTRINGS.BASIC_BATTLE.label_STATUS;
	container.appendChild(statusLabel);
	component.statusLabel = statusLabel;
	
	var evadeLabel = document.createElement("div");
	evadeLabel.classList.add("evade_label");
	evadeLabel.classList.add("scaled_text");
	evadeLabel.classList.add("label");
	evadeLabel.innerHTML = APPSTRINGS.BASIC_BATTLE.label_MISS;
	container.appendChild(evadeLabel);
	component.evadeLabel = evadeLabel;
	
	var counterLabel = document.createElement("div");
	counterLabel.classList.add("label");
	counterLabel.classList.add("counter_label");
	counterLabel.classList.add("scaled_text");
	counterLabel.innerHTML = APPSTRINGS.BASIC_BATTLE.label_COUNTER;
	container.appendChild(counterLabel);
	component.counterLabel = counterLabel;
	
	var specialEvadeLabel = document.createElement("div");
	specialEvadeLabel.classList.add("label");
	specialEvadeLabel.classList.add("special_evade_label");
	specialEvadeLabel.classList.add("scaled_text");
	specialEvadeLabel.innerHTML = "";
	container.appendChild(specialEvadeLabel);
	component.specialEvadeLabel = specialEvadeLabel;
	
	var barrier = document.createElement("img");
	barrier.classList.add("barrier");
	barrier.setAttribute("data-img", this.makeImageURL("barrier"));
	container.appendChild(barrier);
	component.barrier = barrier;
	
	var destroyedContainer = document.createElement("div");
	destroyedContainer.classList.add("destroyed_container");
	container.appendChild(destroyedContainer);
	component.destroyedContainer = destroyedContainer;
	
	var destroyed = document.createElement("img");
	destroyed.classList.add("destroyed_anim");
	destroyed.setAttribute("data-img", this.makeImageURL("destroyed"));
	destroyedContainer.appendChild(destroyed);
	component.destroyed = destroyed;
	
	var damageContainer = document.createElement("div");
	damageContainer.classList.add("damage_container");
	container.appendChild(damageContainer);
	component.damageContainer = damageContainer;
	
	var damage = document.createElement("img");
	damage.classList.add("damage_anim");
	damage.setAttribute("data-img", this.makeImageURL("damage"));
	damageContainer.appendChild(damage);
	component.damage = damage;
	
	var buffContainer = document.createElement("div");
	buffContainer.classList.add("buff_container");
	container.appendChild(buffContainer);
	component.buffContainer = buffContainer;
	
	var buff = document.createElement("img");
	buff.classList.add("buff_anim");
	buff.setAttribute("data-img", this.makeImageURL("buff"));
	buffContainer.appendChild(buff);
	component.buff = buff;
	
	var rmmvAnimContainer = document.createElement("div");
	rmmvAnimContainer.classList.add("rmmv_container");
	container.appendChild(rmmvAnimContainer);
	component.rmmvAnimContainer = rmmvAnimContainer;
	
	var rmmvAnim = document.createElement("canvas");
	rmmvAnim.classList.add("rmmv_anim");
	rmmvAnim.setAttribute("width", 1000);
	rmmvAnim.setAttribute("height", 1000);
	rmmvAnimContainer.appendChild(rmmvAnim);
	component.rmmvAnim = rmmvAnim;
	
	var shadow = document.createElement("img");
	shadow.classList.add("shadow");
	shadow.setAttribute("data-img", "img/system/Shadow1.png");
	container.appendChild(shadow);
	component.shadow = shadow;
	
	
	this._participantComponents[componentId] = component;
}

Window_BattleBasic.prototype.createComponents = async function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	this._participantComponents = {};
	
	this.createParticipantComponents("actor", "actor");
	this.createParticipantComponents("actor_twin", "actor");
	this.createParticipantComponents("actor_supporter", "actor");
	this.createParticipantComponents("actor_supporter_twin", "actor");
	
	this.createParticipantComponents("enemy", "enemy");
	this.createParticipantComponents("enemy_twin", "enemy");
	this.createParticipantComponents("enemy_supporter", "enemy");
	this.createParticipantComponents("enemy_supporter_twin", "enemy");
	
	
	
	
	this._bgFadeContainer.innerHTML = "";
	
	this._activeZoneContainer = document.createElement("div");
	this._activeZoneContainer.id = this.createId("active_zone_container");
	
	this._activeZoneInnerContainer = document.createElement("div");
	this._activeZoneInnerContainer.classList.add("active_zone_inner_container");
	this._activeZoneInnerContainer.id = this.createId("active_zone_inner_ally");
	
	this._activeZone = document.createElement("div");
	this._activeZone.classList.add("active_zone");
	this._activeZone.id = this.createId("active_zone_ally");
	this._activeZoneInnerContainer.appendChild(this._activeZone);
	
	this._activeZoneEnemyInnerContainer = document.createElement("div");
	this._activeZoneEnemyInnerContainer.classList.add("active_zone_inner_container");
	this._activeZoneEnemyInnerContainer.id = this.createId("active_zone_inner_enemy");
	
	this._activeZoneEnemy = document.createElement("div");
	this._activeZoneEnemy.classList.add("active_zone");
	this._activeZoneEnemy.id = this.createId("active_zone_enemy")
	this._activeZoneEnemyInnerContainer.appendChild(this._activeZoneEnemy);
	
	/*	
	Object.keys(_this._participantComponents).forEach(function(type){
		_this._activeZone.appendChild(_this._participantComponents[type].container);
	});*/
	_this._activeZone.appendChild(_this._participantComponents["actor"].container);
	_this._activeZone.appendChild(_this._participantComponents["actor_twin"].container);
	_this._activeZone.appendChild(_this._participantComponents["actor_supporter"].container);
	_this._activeZone.appendChild(_this._participantComponents["actor_supporter_twin"].container);
	
	_this._activeZoneEnemy.appendChild(_this._participantComponents["enemy"].container);
	_this._activeZoneEnemy.appendChild(_this._participantComponents["enemy_twin"].container);
	_this._activeZoneEnemy.appendChild(_this._participantComponents["enemy_supporter"].container);
	_this._activeZoneEnemy.appendChild(_this._participantComponents["enemy_supporter_twin"].container);
	
	
	this._activeZoneContainer.appendChild(this._activeZoneInnerContainer);	
	this._activeZoneContainer.appendChild(this._activeZoneEnemyInnerContainer);	
	/*
	this._activeZoneContainerGradient = document.createElement("div");
	this._activeZoneContainerGradient.id = this.createId("active_zone_container_gradient");
	this._activeZoneContainer.appendChild(this._activeZoneContainerGradient);
	
	this._activeZoneContainerLeft = document.createElement("div");
	this._activeZoneContainerLeft.id = this.createId("active_zone_container_left");
	this._activeZoneContainer.appendChild(this._activeZoneContainerLeft);
	
	this._activeZoneContainerRight = document.createElement("div");
	this._activeZoneContainerRight.id = this.createId("active_zone_container_right");
	this._activeZoneContainer.appendChild(this._activeZoneContainerRight);
	
	this._activeZoneContainerShadowLeft = document.createElement("div");
	this._activeZoneContainerShadowLeft.id = this.createId("active_zone_container_shadow_left");
	this._activeZoneContainer.appendChild(this._activeZoneContainerShadowLeft);
	
	this._activeZoneContainerShadowRight = document.createElement("div");
	this._activeZoneContainerShadowRight.id = this.createId("active_zone_container_shadow_right");
	this._activeZoneContainer.appendChild(this._activeZoneContainerShadowRight);
	*/
	
	this._bgFadeContainer.appendChild(this._activeZoneContainer);	
	
	/*Redesign component*/
	
	this._loader = document.createElement("div");
	this._loader.id = this.createId("loader");
	this._activeZoneContainer.appendChild(this._loader);
	this._loader.addEventListener("animationend", () => {this._isLoading = false;})	
	
	this._terrainViewContainer = document.createElement("div");
	this._terrainViewContainer.id = this.createId("terrain_view");
	this._bgFadeContainer.appendChild(this._terrainViewContainer);
	
	this._allySideTerrainOuter = document.createElement("div");
	this._allySideTerrainOuter.classList.add("terrain_scroll_container");
	this._allySideTerrainOuter.id = this.createId("ally_container");
	this._terrainViewContainer.appendChild(this._allySideTerrainOuter);
	
	this._allySideTerrain = document.createElement("div");
	this._allySideTerrain.classList.add("terrain_scroll");
	this._allySideTerrain.id = this.createId("ally_terrain");
	this._allySideTerrainOuter.appendChild(this._allySideTerrain);
	
	this._enemySideTerrainOuter = document.createElement("div");
	this._enemySideTerrainOuter.classList.add("terrain_scroll_container");
	this._enemySideTerrainOuter.id = this.createId("enemy_container");
	this._terrainViewContainer.appendChild(this._enemySideTerrainOuter);
	
	this._enemySideTerrain = document.createElement("div");
	this._enemySideTerrain.classList.add("terrain_scroll");
	this._enemySideTerrain.id = this.createId("enemy_terrain");
	this._enemySideTerrainOuter.appendChild(this._enemySideTerrain);
	
	if(!this._overlayBitmap){
		this._overlayBitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattlebacks/basic_battle_overlay.png", true, 0, false, true);
	}
		
	this._terrainViewOverlay = document.createElement("img");
	this._terrainViewOverlay.id = this.createId("terrain_overlay");
	this._terrainViewOverlay.src = this._overlayBitmap._image.src;
	this._terrainViewContainer.appendChild(this._terrainViewOverlay);
	
	if(!this._terrainMaskBitmap){
		this._terrainMaskBitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattlebacks/terrain_view_mask.png", true, 0, false, true);		
	}
	
	
	this._allySideTerrainOuter.style.webkitMaskImage = "url('" + this._terrainMaskBitmap._image.src + "')";
	this._allySideTerrainOuter.style.webkitMaskSize = "cover";
	
	if(!this._terrainMaskEnemyBitmap){
		this._terrainMaskEnemyBitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattlebacks/terrain_view_mask_enemy.png", true, 0, false, true);	
	}

	this._enemySideTerrainOuter.style.webkitMaskImage = "url('" + this._terrainMaskEnemyBitmap._image.src + "')";
	this._enemySideTerrainOuter.style.webkitMaskSize = "cover";
	
	
	if(!this._BBMaskBitmap){
		this._BBMaskBitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattlebacks/bb_ally_mask.png", true, 0, false, true);	
	}
	this._activeZoneInnerContainer.style.webkitMaskImage = "url('" + this._BBMaskBitmap._image.src + "')";
	this._activeZoneInnerContainer.style.webkitMaskSize = "cover";
	
	
	if(!this._BBMaskEnemyBitmap){
		this._BBMaskEnemyBitmap = await ImageManager.loadBitmapPromise("", "img/SRWBattlebacks/bb_enemy_mask.png", true, 0, false, true);	
	}
	this._activeZoneEnemyInnerContainer.style.webkitMaskImage = "url('" + this._BBMaskEnemyBitmap._image.src + "')";
	this._activeZoneEnemyInnerContainer.style.webkitMaskSize = "cover";
}	


Window_BattleBasic.prototype.loadRequiredImages = function(){
	var _this = this;
	return new Promise(function(resolve, reject){
		var promises = [];
		Object.keys(_this._participantInfo).forEach(function(type){
			var participant = _this._participantInfo[type];
			if(participant.participating){
				promises.push(ImageManager.loadBitmapPromise(_this.makeImageURL(participant.img)));
			}			
		});
		promises.push(ImageManager.loadBitmapPromise(_this.makeImageURL("destroyed")));
		promises.push(ImageManager.loadBitmapPromise(_this.makeImageURL("damage")));
		promises.push(ImageManager.loadBitmapPromise(_this.makeImageURL("barrier")));
		
		function preloadRMMVAnimation(animId){
			const animData = $dataAnimations[animId];
			if(animData){
				if(animData.animation1Name){
					promises.push(ImageManager.loadBitmapPromise("img/animations/"+animData.animation1Name));
				}
				if(animData.animation2Name){
					promises.push(ImageManager.loadBitmapPromise("img/animations/"+animData.animation2Name));
				}
				for(const timing of animData.timings){
					if(timing.se){
						//TODO: Figure out a way to actually preload sound effects
					}
				}
			}
			
		}
		
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];
			if(battleEffect.action && battleEffect.action.type == "attack"){
				if(!battleEffect.isBuffingAttack){
					const animId = battleEffect.action.attack.BBAnimId;
					if(animId != -1){
						preloadRMMVAnimation(animId);
					}
					
				} else {
					const animId = battleEffect.action.attack.vsAllyBBAnimId;
					if(animId != -1){
						preloadRMMVAnimation(animId);
					}
				}			
			}
		});
		
		
		Promise.all(promises).then(function(){
			resolve();
		});
	});
}

Window_BattleBasic.prototype.loadImage = function(url){
	return new Promise(function(resolve, reject){
		var img=new Image();
		img.src=url;
		img.onload = resolve;
	});
}

Window_BattleBasic.prototype.readBattleCache = function() {
	var _this = this;
	_this._actionQueue = [];
	
	_this._participantInfo.actor.participating = false;
	_this._participantInfo.actor_twin.participating = false;
	_this._participantInfo.actor_supporter.participating = false;
	_this._participantInfo.actor_supporter_twin.participating = false;
	_this._participantInfo.enemy.participating = false;
	_this._participantInfo.enemy_twin.participating = false;
	_this._participantInfo.enemy_supporter.participating = false;
	_this._participantInfo.enemy_supporter_twin.participating = false;
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		_this._actionQueue[battleEffect.actionOrder] = battleEffect;
		//battleEffect.currentAnimHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP - (battleEffect.HPRestored || 0);
		if(battleEffect.side == "actor"){
			if(battleEffect.type == "initiator" || battleEffect.type == "defender" || battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.actor_twin.participating = true;
					_this._participantInfo.actor_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_twin";
				} else {
					_this._participantInfo.actor.participating = true;
					_this._participantInfo.actor.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor";
				}				
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.actor_supporter_twin.participating = true;
					_this._participantInfo.actor_supporter_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_supporter_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_supporter_twin";
				} else {
					_this._participantInfo.actor_supporter.participating = true;
					_this._participantInfo.actor_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_supporter.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_supporter";
				}
			}
		} else {
			if(battleEffect.type == "initiator" || battleEffect.type == "defender" || battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.enemy_twin.participating = true;
					_this._participantInfo.enemy_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_twin";
				} else {
					_this._participantInfo.enemy.participating = true;
					_this._participantInfo.enemy.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy";
				}
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.enemy_supporter_twin.participating = true;
					_this._participantInfo.enemy_supporter_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_supporter_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_supporter_twin";
				} else {
					_this._participantInfo.enemy_supporter.participating = true;
					_this._participantInfo.enemy_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_supporter.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_supporter";
				}
			}
		}				
	});
	
	/*Object.keys(_this._participantComponents).forEach(function(type){
		_this._participantComponents[type].container.className = "participant_container "+_this._participantComponents[type].side;
		_this._participantComponents[type].destroyed.className = "destroyed_anim";
		_this._participantComponents[type].container.style.visibility = "visible";
	});*/
	_this.createParticipantComponents();
}

Window_BattleBasic.prototype.show = function() {
	var _this = this;
	this._processingAction = false;
	this._finishing = false;
	this._processingAnimationCount = 0;
	var windowNode = this.getWindowNode();
	windowNode.classList.add("beforeView");
	windowNode.classList.remove("beginView");
	windowNode.classList.remove("fadeIn");	
	windowNode.classList.add("fadeIn");
	
	
	_this.initTimer = 18;
	_this.createComponents();
	_this.readBattleCache();
	
	
	_this.loadRequiredImages().then(function(){
		_this._isLoading = true;
		setTimeout(function(){//ensure the player can cancel the battle scene if loading fails
			_this._isLoading = false;
		}, 5000);
		_this.createTerrainScrolls();
		
		_this._handlingInput = false;
		_this.visible = true;
		_this._redrawRequested = true;
		_this._visibility = "";
		_this.refresh();	
		Graphics._updateCanvas();
	});	
	
	
};

Window_BattleBasic.prototype.getTerrainScrollInfo = function(participantInfo) {
	//debug
	const environmentId = $gameSystem.getUnitSceneBgId(participantInfo.ref);
	if(BASIC_BATTLE_BGS[environmentId]){
		return BASIC_BATTLE_BGS[environmentId];
	}
	return BASIC_BATTLE_BGS["default"];
}

Window_BattleBasic.prototype.createTerrainScrolls = function() {
	this.createTerrainScroll("actor");
	this.createTerrainScroll("enemy");
}

Window_BattleBasic.prototype.applyFactionClass = function(container, factionId) {
	const factionType = {
		"player": "ally",
		0: "enemy",
		1: "green",
		2: "yellow"
	}[factionId];
	container.style.background = ENGINE_SETTINGS.GRADIENT_BATTLE_BG_COLORS[factionType];
}

Window_BattleBasic.prototype.createTerrainScroll = function(side) {
	const _this = this;
	let direction;
	let participantInfo;
	let targetContainer;
	if(side == "actor"){
		direction = 1;
		participantInfo = _this._participantInfo.actor;
		targetContainer = _this._allySideTerrain;
	} else {
		direction = -1;
		participantInfo = _this._participantInfo.enemy;
		targetContainer = _this._enemySideTerrain;
	}
	let shadowDisplay;
	if(ENGINE_SETTINGS.USE_CUSTOM_BASIC_BATTLE_BGS){
		const scrollInfo = _this.getTerrainScrollInfo(participantInfo);
		const scrollMod = scrollInfo.scrollMod || 1;
		let content = "";
		let ctr = 0;
		for(let entry of scrollInfo.layers){
			content+="<div class='layer img_bg' data-side='"+side+"' data-scrollduration='"+entry.scroll * scrollMod+"' data-imgscale='"+(scrollInfo.scale || 1)+"' data-img='"+("img/SRWBattlebacks/"+entry.path)+".png' style='z-index: "+(ctr++)+";' data-xoff='"+(scrollInfo.offsets.x || 0)+"' data-yoff='"+(scrollInfo.offsets.y || 0)+"'></div>"
		}
		targetContainer.innerHTML = content;	
		const configShadowDisplay = scrollInfo.showShadows;
		if(configShadowDisplay != null){
			shadowDisplay =  configShadowDisplay ? "block" : "none";
		}
		
	} else {
		targetContainer.style.background = "";	
		shadowDisplay = "block";
		if(side == "actor" && $gameTemp.currentBattleActor){
			const factionId = $gameSystem.getFactionId($gameTemp.currentBattleActor);
			this.applyFactionClass(_this._allySideTerrainOuter, factionId);			
			
		} else if($gameTemp.currentBattleEnemy){
			const factionId = $gameSystem.getFactionId($gameTemp.currentBattleEnemy);
			this.applyFactionClass(this._enemySideTerrainOuter, factionId);	
		}
	}
	
	

		
	if(side == "actor" && $gameTemp.currentBattleActor){
		if(shadowDisplay == null){
			shadowDisplay = !$statCalc.isBattleShadowHiddenOnCurrentTerrain($gameTemp.currentBattleActor) ? "block" : "none";
		}

		this._participantComponents["actor"].shadow.style.display = shadowDisplay;
		this._participantComponents["actor_twin"].shadow.style.display = shadowDisplay;
		this._participantComponents["actor_supporter"].shadow.style.display = shadowDisplay;
		this._participantComponents["actor_supporter_twin"].shadow.style.display = shadowDisplay;		
		
	} else if($gameTemp.currentBattleEnemy){
		if(shadowDisplay == null){
			shadowDisplay = !$statCalc.isBattleShadowHiddenOnCurrentTerrain($gameTemp.currentBattleEnemy) ? "block" : "none";
		}
		this._participantComponents["enemy"].shadow.style.display = shadowDisplay;
		this._participantComponents["enemy_twin"].shadow.style.display = shadowDisplay;
		this._participantComponents["enemy_supporter"].shadow.style.display = shadowDisplay;
		this._participantComponents["enemy_supporter_twin"].shadow.style.display = shadowDisplay;
		
	}
}

Window_BattleBasic.prototype.getHPAnimInfo = function(action, attackRef) {
	var targetMechStats = $statCalc.getCalculatedMechStats(action["attacked"+attackRef].ref);

	var startPercent = Math.floor((action["attacked"+attackRef].currentAnimHP / targetMechStats.maxHP)*100);
	var endPercent = Math.floor(((action["attacked"+attackRef].currentAnimHP - action["damageInflicted"+attackRef]) / targetMechStats.maxHP)*100);
	if(endPercent < 0){
		endPercent = 0;
	}
	return {startPercent: startPercent, endPercent: endPercent};
}

Window_BattleBasic.prototype.getHPRecoveredAnimInfo = function(action) {
	var result = null;
	if(action.HPRestored){
		var targetMechStats = $statCalc.getCalculatedMechStats(action.ref);

		var startPercent = Math.floor((action.currentAnimHP / targetMechStats.maxHP)*100);
		var endPercent = Math.floor(((action.currentAnimHP + action.HPRestored) / targetMechStats.maxHP)*100);
		if(endPercent < 0){
			endPercent = 0;
		}
		if(endPercent > 100){
			endPercent = 100;
		}
		result = {startPercent: startPercent, endPercent: endPercent};
	}	
	return result;
}

Window_BattleBasic.prototype.updateHPBarColor = function(fillElem, percent) {
	if(percent >= ENGINE_SETTINGS.HP_BAR_COLORS.full.percent){
		fillElem.style.backgroundColor = ENGINE_SETTINGS.HP_BAR_COLORS.full.color;
	} else if(percent >= ENGINE_SETTINGS.HP_BAR_COLORS.high.percent){
		fillElem.style.backgroundColor = ENGINE_SETTINGS.HP_BAR_COLORS.high.color;
	} else if(percent >= ENGINE_SETTINGS.HP_BAR_COLORS.med.percent){
		fillElem.style.backgroundColor = ENGINE_SETTINGS.HP_BAR_COLORS.med.color;
	} else if(percent >= ENGINE_SETTINGS.HP_BAR_COLORS.low.percent){
		fillElem.style.backgroundColor = ENGINE_SETTINGS.HP_BAR_COLORS.low.color;
	} else {
		fillElem.style.backgroundColor = ENGINE_SETTINGS.HP_BAR_COLORS.critical.color;
	}
}

Window_BattleBasic.prototype.animateHP = function(type, startPercent, endPercent) {
	var _this = this;
	var containerInfo = this._participantComponents[type];
	var elem = containerInfo.HP;
	var fillElem = containerInfo.HPFill;
	elem.style.display = "block";
	fillElem.style.width = startPercent+"%";
	var steps = 100;
	var stepDuration =  400/steps * this.getAnimTimeRatio();
	var startTime = Date.now();
	var step = (startPercent - endPercent) / steps;
	var hpDrainInterval = setInterval(function(){
		var ctr = Math.floor((Date.now() - startTime) / stepDuration);
		if(ctr <= steps){
			fillElem.style.width=startPercent - (step * ctr)+"%";;
		} else {
			
			fillElem.style.width=endPercent;
		}
		if(ctr >= steps + 50){//linger a bit on the final hp value
			_this.updateHPBarColor(fillElem, fillElem.style.width.replace("%", ""));
		}
		if(ctr >= steps + 100){//linger a bit on the final hp value
			clearInterval(hpDrainInterval);
			elem.style.display = "none";
		}
		
	}, stepDuration);
	_this.updateHPBarColor(fillElem, fillElem.style.width.replace("%", ""));
}



Window_BattleBasic.prototype.animateBuff = function(type) {
	var _this = this;
	var containerInfo = this._participantComponents[type];
	if(containerInfo){
		
		var parentNode = containerInfo.buff.parentNode;
		parentNode.removeChild(containerInfo.buff);		
		parentNode.appendChild(containerInfo.buff);
			
		containerInfo.buff.className = "";	
		containerInfo.buff.className = "buff_anim active";	
		//delete containerInfo.damage.style["animation-duration"];
		containerInfo.buff.style["animation-duration"] = "";
		this.applyDoubleTime(containerInfo.buff);
		
		containerInfo.buff.style.visibility = "visible";

		setTimeout(function(){ containerInfo.buff.style.visibility = "hidden" }, 400 * this.getAnimTimeRatio());
		
		var se = {};
		se.name = "SRW_Recovery";
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
	}
}

Window_BattleBasic.prototype.animateDamage = function(type, special) {
	var _this = this;
	var containerInfo = this._participantComponents[type];
	containerInfo.damageLabel.style.display = "block";
	containerInfo.damageLabel.className = "scaled_text damage_label label";	
	containerInfo.damageLabel.innerHTML = special.damage;
	this.applyDoubleTime(containerInfo.damageLabel);
	
	if(containerInfo){
		
		var parentNode = containerInfo.damage.parentNode;
		parentNode.removeChild(containerInfo.damage);		
		parentNode.appendChild(containerInfo.damage);
			
		containerInfo.damage.className = "";	
		containerInfo.damage.className = "damage_anim active";	
		//delete containerInfo.damage.style["animation-duration"];
		containerInfo.damage.style["animation-duration"] = "";
		this.applyDoubleTime(containerInfo.damage);
		
		containerInfo.damage.style.visibility = "visible";

		setTimeout(function(){ containerInfo.damage.style.visibility = "hidden" }, 400 * this.getAnimTimeRatio());
		
		if(special.crit){
			containerInfo.critLabel.style.display = "block";
		}
		if(special.inflictsStatus){
			containerInfo.statusLabel.style.display = "block";
		}
	}
	
	var seName = "SRWHit";
	if(special.crit){
		containerInfo.damageLabel.classList.add("crit");
		seName = "SRWHit_Crit";
	}
	if(special.barrierState == 1){
		seName = "SRWHit_Barrier";
	}
	if(special.barrierState == 2){
		seName = "SRWHit_Barrier_Break";
	}
	
	setTimeout(function(){ containerInfo.damageLabel.style.display = "none" }, 600 * this.getAnimTimeRatio());
	
	setTimeout(function(){ containerInfo.critLabel.style.display = "none" }, 600 * this.getAnimTimeRatio());
	
	setTimeout(function(){ containerInfo.statusLabel.style.display = "none" }, 600 * this.getAnimTimeRatio());
	
	var se = {};
	se.name = seName;
	se.pan = 0;
	se.pitch = 100;
	se.volume = 80;
	AudioManager.playSe(se);
	
	
}

Window_BattleBasic.prototype.showWeaponAnimation = function(type, special) {
	var _this = this;

	var containerInfo = this._participantComponents[type];	
	
	containerInfo.rmmvAnim.style.transform = "scale("+(special.scale || 1)+")";	
	
	let xOffset = special.offsets.x;
	if(xOffset){
		if(containerInfo.side == "enemy"){
			xOffset*=-1; 
		}
		containerInfo.rmmvAnim.style.marginLeft = (xOffset * Graphics.getScale()) + "%";
	} else {
		containerInfo.rmmvAnim.style.marginLeft = "0%";
	}
	
	if(special.offsets.y){
		containerInfo.rmmvAnim.style.marginTop = (special.offsets.y * Graphics.getScale()) + "%";
	} else {
		containerInfo.rmmvAnim.style.marginTop = "0%";
	}
	
	_this._processingAnimationCount++;
	_this.setUpRMMVAnim(containerInfo, special.animId, special.rate, function(){
		_this._processingAnimationCount--;
	});
}


Window_BattleBasic.prototype.animateDestroy = function(type) {
	var containerInfo = this._participantComponents[type];
	if(containerInfo){
		containerInfo.destroyed.className = "";	
		containerInfo.destroyed.className = "destroyed_anim active";	
		this.applyDoubleTime(containerInfo.destroyed);

		setTimeout(function(){ containerInfo.container.style.visibility = "hidden" }, 400 * this.getAnimTimeRatio());
	}
	
	var se = {};
	se.name = 'SRWExplosion';
	se.pan = 0;
	se.pitch = 100;
	se.volume = 80;
	AudioManager.playSe(se);
}	

Window_BattleBasic.prototype.setUpAnimations = function(nextAction) {
	var _this = this;
	var type;
	if(nextAction.side == "actor"){
		type = "actor";
	} else {
		type = "enemy";
	}
	
	
	var initiator;
	if(nextAction.type == "support attack" || nextAction.type == "support defend"){
		initiator = _this._participantTypeLookup[nextAction.ref._supportCacheReference];
	} else {
		initiator = _this._participantTypeLookup[nextAction.ref._cacheReference];
	}
	
	var target;
	if(nextAction.attacked){
		if(nextAction.attacked.type == "support defend" || nextAction.attacked.type == "support attack"){							
			target = _this._participantTypeLookup[nextAction.attacked.ref._supportCacheReference];						
		} else {
			target = _this._participantTypeLookup[nextAction.attacked.ref._cacheReference];		
		}	
	}
	
	var allTarget;
	if(nextAction.attacked_all_sub){
		if(nextAction.attacked_all_sub.type == "support defend" || nextAction.attacked_all_sub.type == "support attack"){							
			allTarget = _this._participantTypeLookup[nextAction.attacked_all_sub.ref._supportCacheReference];						
		} else {
			allTarget = _this._participantTypeLookup[nextAction.attacked_all_sub.ref._cacheReference];		
		}
	}
	
	
	if(nextAction.counterActivated){
		var counterAnimation =  {target: initiator, type: "counter"};
		counterAnimation.special =  {};
		counterAnimation.special["counterActivated"] = {target: nextAction.side};	
		this._animationQueue.push([counterAnimation]);
	}
	
	var attackAnimation = {target: initiator, type: "startAttack"};
	attackAnimation.special = {
		attack_start: true
	} 
	this._animationQueue.push([attackAnimation]);
	
	var attackAnimationSubQueue = {
		supportDefendAnimation: null,
		weaponAnimation: null,
		damageAnimation: [],
		hpBarAnimation: [],
		destroyAnimation: [],
		evadeAnimation: [],
		supportDefendReturnAnimation: null,
	};
	
	if(target){
		processBattleAnimations("", target);
	}
	
	if(allTarget){
		processBattleAnimations("_all_sub", allTarget);
	}
	
	
	var hpRecoveredAnimInfo = _this.getHPRecoveredAnimInfo(nextAction);
	if(nextAction.HPRestored){
		nextAction.currentAnimHP = nextAction.currentAnimHP + nextAction.HPRestored;
	}
	
	if(hpRecoveredAnimInfo && attackAnimationSubQueue.hpBarAnimation[0]){			
		attackAnimationSubQueue.hpBarAnimation[0].special["hp_bar_recover"] =  {target: initiator, startPercent: hpRecoveredAnimInfo.startPercent, endPercent: hpRecoveredAnimInfo.endPercent};
	}
	
	if(attackAnimationSubQueue.supportDefendAnimation){
		this._animationQueue.push([attackAnimationSubQueue.supportDefendAnimation]);
	}
	
	if(attackAnimationSubQueue.weaponAnimation){
		this._animationQueue.push([attackAnimationSubQueue.weaponAnimation]);
	}
	
	this._animationQueue.push(attackAnimationSubQueue.damageAnimation.concat(attackAnimationSubQueue.evadeAnimation));
	
	if(attackAnimationSubQueue.hpBarAnimation.length){
		this._animationQueue.push(attackAnimationSubQueue.hpBarAnimation);
	}
	
	if(attackAnimationSubQueue.destroyAnimation.length){
		this._animationQueue.push(attackAnimationSubQueue.destroyAnimation);
	}
	
	if(attackAnimationSubQueue.supportDefendReturnAnimation){
		this._animationQueue.push([attackAnimationSubQueue.supportDefendReturnAnimation]);
	}
	
	
	
	
	function processBattleAnimations(attackRef, target){
		
		var weaponAnimation;
		
		if(ENGINE_SETTINGS.BASIC_BATTLE_ANIM_MODE == "normal"){
			if(nextAction.action && nextAction.action.type == "attack"){
				if(!nextAction.isBuffingAttack){
					const animId = nextAction.action.attack.BBAnimId;
					if(animId != -1){
						weaponAnimation = {
							target: target,
							type: "no_damage", 
							special: {
								weaponAnim: {
									animId: animId, 
									target: target, 
									scale: nextAction.action.attack.BBAnimIdScale,
									rate: nextAction.action.attack.BBAnimIdRate,
									offsets: {
										x: nextAction.action.attack.BBAnimIdXOff,
										y: nextAction.action.attack.BBAnimIdYOff,
									}
								}
							}
						};
					}
					
				} else {
					const animId = nextAction.action.attack.vsAllyBBAnimId;
					if(animId != -1){
						weaponAnimation = {
							target: target,
							type: "no_damage", 
							special: {
								weaponAnim: {
									animId: animId, 
									target: target, 
									scale: nextAction.action.attack.vsAllyBBAnimIdScale,
									rate: nextAction.action.attack.vsAllyBBAnimIdRate,
									offsets: {
										x: nextAction.action.attack.vsAllyBBAnimIdXOff,
										y: nextAction.action.attack.vsAllyBBAnimIdYOff,
									}
								}
							}
						};
					}
				}			
			}
		}
		
		
		
			
		attackAnimationSubQueue.weaponAnimation = weaponAnimation;
		
		if(nextAction["hits"+attackRef]){
			if(nextAction["attacked"+attackRef].type == "support defend"){
				if(nextAction["attacked"+attackRef].ref.isSubTwin){
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefendSub"};
				} else {
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefend"};
				}				
			}
			
			var animInfo = _this.getHPAnimInfo(nextAction, attackRef);
			
			
			nextAction["attacked"+attackRef].currentAnimHP = nextAction["attacked"+attackRef].currentAnimHP - nextAction["damageInflicted"+attackRef];		
			
			
			
			
			var damageAnimation;
			if(nextAction["damageInflicted"+attackRef] > 0){
				damageAnimation = {target: target, type: "damage"};
			} else if(nextAction.isBuffingAttack){
				damageAnimation = {target: target, type: "no_damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			if(nextAction.isBuffingAttack){
				damageAnimation.special["buff"] = {target: target};
				attackAnimationSubQueue.damageAnimation.push(damageAnimation);
			} else {	
				var barrierState = 0;
				if(nextAction["attacked"+attackRef].hasBarrier){
					if(nextAction["attacked"+attackRef].barrierBroken){
						barrierState = 2;
					} else {
						barrierState = 1;
					}
				}
				var inflictsStatus = false;
				if(nextAction.damageInflicted > 0){
					var resistance = $statCalc.applyMaxStatModsToValue(nextAction.attacked.ref, 0, ["status_resistance"]);
					if(resistance < 1 || (nextAction.hasFury && resistance == 1)){
						Object.keys(nextAction.statusEffects).forEach(function(inflictionId){
							if(nextAction.statusEffects[inflictionId]){
								inflictsStatus = true;					
							}
						});
					}	
				}
				
				damageAnimation.special["damage"] = {target: target, damage: nextAction["damageInflicted"+attackRef], crit: nextAction.inflictedCritical, barrierState: barrierState, inflictsStatus: inflictsStatus};
				if(nextAction["attacked"+attackRef].hasBarrier && !nextAction["attacked"+attackRef].barrierBroken){
					damageAnimation.special["barrier"] = {target: target};
				}
			
			
			
				attackAnimationSubQueue.damageAnimation.push(damageAnimation);
				
				var hpBarAnimation = {target: target, type: "hp_bar"}
				hpBarAnimation.special =  {};
				hpBarAnimation.special["hp_bar"] =  {target: target, startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
				attackAnimationSubQueue.hpBarAnimation.push(hpBarAnimation);
			}
			
			
					
			if(nextAction["attacked"+attackRef].currentAnimHP <= 0){
				var destroyAnimation = {target: target, type: "destroyed_participant"};
				destroyAnimation.special = {};
				destroyAnimation.special["destroy"] = {target: target};		
				attackAnimationSubQueue.destroyAnimation.push(destroyAnimation);
			} else if(nextAction["attacked"+attackRef].type == "support defend"){
				if(nextAction["attacked"+attackRef].ref.isSubTwin){
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendSubReturn"};
				} else {
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendReturn"};
				}
			}
			
			
		} else {
			var evadeAnimation;
			
			if(nextAction["attacked"+attackRef].specialEvasion){
				var patternId = nextAction["attacked"+attackRef].specialEvasion.dodgePattern;
				var animDef = {
					basic_anim: "no_damage",
					se: "SRWMiss",
					
				};
				if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
					animDef =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId];
				}
				
				animDef.name = nextAction["attacked"+attackRef].specialEvasion.name;
				animDef.target = target;
				
				var evadeAnimation = animDef.basic_anim;
				
				
				if(nextAction["attacked"+attackRef].type == "support defend"){				
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefend"};		
				 
					evadeAnimation = {target: target, type: evadeAnimation};
					evadeAnimation.special = {};
					evadeAnimation.special["special_evade"] = animDef;

					attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
							
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendReturn"};		
				} else {
					evadeAnimation = {target: target, type: evadeAnimation};
					evadeAnimation.special = {};
					evadeAnimation.special["special_evade"] = animDef;
					attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
				}
			} else {
				evadeAnimation = {target: target, type: "evade"};
				evadeAnimation.special = {};
				evadeAnimation.special["evade"] = {target: target};		
				attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
			}
		}
	}
	
	this._animationQueue.push([{target: initiator, type: "return"}]);
	if(nextAction.selfDestructed){
		var destroyAnimation = {target: initiator, type: "destroyed_participant"};
		destroyAnimation.special = {};
		destroyAnimation.special["destroy"] = {target: initiator};		
		this._animationQueue.push([destroyAnimation]);		
	}
}

Window_BattleBasic.prototype.setUpRMMVAnim = function(component, animId, rate, callback) {
	
	var renderer =  new PIXI.CanvasRenderer(1000, 1000, {view: component.rmmvAnim,  transparent: true });
	
	var stage = new PIXI.Container();
	var animation = $dataAnimations[animId];
	if(!animation){
		return;
	}
	var sprite = new Sprite_Animation_BasicBattle();
	sprite.setup(
		animation, 
		component.side == "actor" ? true: false, //mirror
		0, //delay
		false, //loop
		true, //noFlash
		false, //noSfx
		rate,//rate
		callback
	);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;

	stage.addChild(sprite);
	this._RMMVSpriteInfo.push({
		RMMVSprite: sprite,
		renderer: renderer,
		stage: stage
	});
}


Window_BattleBasic.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this._lastFrameTime == -1){
		this._lastFrameTime = Date.now();
		this._deltaTime = 0;
	} else {
		this._deltaTime = Date.now() - this._lastFrameTime;
		this._lastFrameTime = Date.now();
	}
	
	if(this.isOpen() && !this._handlingInput){
		//debug:
		/*if(Input.isTriggered('pageup')){
			this.show();
		} 
		
		this.refresh();
		return;//debug*/
		if(_this._isLoading){
			return;
		}
		if(_this.initTimer > 0){
			_this.initTimer--;
			return;
		}
			
		if(this._finishing){
			if(this._finishTimer <= 0 && !$gameTemp.pauseBasicBattle){
				this._animationQueue = [];
				this._finishing = false;
				$gameTemp.popMenu = true;
				$gameSystem.setSubBattlePhase('after_battle');
			}
			this._finishTimer--;
			return;
		}
		
		var tmp = [];
		_this._RMMVSpriteInfo.forEach(function(RMMVBg){
			if(!RMMVBg.RMMVSprite.hasEnded()){			
				RMMVBg.RMMVSprite.update(_this._deltaTime / Math.max(_this.getAnimTimeRatio(), 0.5));				
				RMMVBg.renderer.render(RMMVBg.stage);	
				tmp.push(RMMVBg);
			}			
		});
		_this._RMMVSpriteInfo = tmp;
		
		
		if(!this._processingAction){
			var nextAction = this._actionQueue.shift();
			while((!nextAction || !nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none") && this._actionQueue.length){
				nextAction = this._actionQueue.shift();
			}
			if(nextAction && (!nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none")){
				nextAction = null;
			}
			if(!nextAction){
				if(!this._finishing){
					this._finishing = true;
					this._finishTimer = 8;
				}							
			} else {
				//this._actor.className = "participant_container";
				//this._enemy.className = "participant_container";
				this.setUpAnimations(nextAction);
				this._processingAction = true;
				this._processingAnimation = false;
			}			
		} else {
			if(this._wasBlurred){
				this._blurCtr--;
			}
			if(this._processingAnimationCount <= 0 || (this._wasBlurred && this._blurCtr <= 0)){
				if(this._wasBlurred){
					this._wasBlurred = false;
				}
				_this._processingAnimationCount = 0;
				var nextAnimations = this._animationQueue.shift();
				if(nextAnimations){
					this._processingAnimation = true;					
					
					for(var i = 0; i < nextAnimations.length; i++){
						_this._processingAnimationCount++;
						
						var nextAnimation = nextAnimations[i];
						var componentInfo = _this._participantComponents[nextAnimation.target];
						let target = _this._participantComponents[nextAnimation.target].container;
						target.className = "";
						void target.offsetWidth;
						target.className = "participant_container "+componentInfo.side;
						
						target.classList.add(nextAnimation.type);
						target.style["animation-duration"] = "";
						
						/*componentInfo.unitPicContainer.className = "";
						componentInfo.unitPicContainer.className = "unit_pic_container";
						componentInfo.unitPicContainer.style["animation-duration"] = "";
						
						componentInfo.image.className = "";
						componentInfo.image.className = "unit_pic";
						componentInfo.image.style["animation-duration"] = "";*/
						
						_this.applyDoubleTime(target);
						if(!target.endHooked){
							target.addEventListener("animationend", function(){
								//nextAnimation.target.className = "";
								_this._processingAnimationCount--;
							});	
							target.endHooked = true;
						}
						
						if(nextAnimation.special){
							if(nextAnimation.special.damage){
								_this.animateDamage(nextAnimation.special.damage.target, nextAnimation.special.damage);		
							}
							
							if(nextAnimation.special.weaponAnim){
								_this.showWeaponAnimation(nextAnimation.special.weaponAnim.target, nextAnimation.special.weaponAnim);		
							}
							
							
							
							if(nextAnimation.special.buff){
								_this.animateBuff(nextAnimation.special.buff.target);		
							}
							
							if(nextAnimation.special.hp_bar){								
								_this.animateHP(nextAnimation.special.hp_bar.target, nextAnimation.special.hp_bar.startPercent, nextAnimation.special.hp_bar.endPercent);
							}
							
							if(nextAnimation.special.hp_bar_recover){								
								_this.animateHP(nextAnimation.special.hp_bar_recover.target, nextAnimation.special.hp_bar_recover.startPercent, nextAnimation.special.hp_bar_recover.endPercent);
							}

							if(nextAnimation.special.destroy){								
								_this.animateDestroy(nextAnimation.special.destroy.target);								
							}
							

							if(nextAnimation.special.barrier){
								let target = _this._participantComponents[nextAnimation.special.barrier.target].barrier;
								target.style.display = "block";
								setTimeout(function(){ target.style.display = "none" }, 600 * _this.getAnimTimeRatio());	
							}								
							
							if(nextAnimation.special.attack_start){
								var se = {};
								se.name = 'SRWAttack';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}	

							if(nextAnimation.special.evade){
								let target = _this._participantComponents[nextAnimation.special.evade.target].evadeLabel;
								target.style.display = "block";
								setTimeout(function(){ target.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWMiss';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);
							}		

							if(nextAnimation.special.counterActivated){
								let target = _this._participantComponents[nextAnimation.special.counterActivated.target].counterLabel;
								target.style.display = "block";
								setTimeout(function(){ target.style.display = "none" }, 200 * _this.getAnimTimeRatio());	
							}	


							if(nextAnimation.special.special_evade){
								let target = _this._participantComponents[nextAnimation.special.special_evade.target].specialEvadeLabel;
								var def = nextAnimation.special.special_evade;
								target.style.display = "block";
								target.innerHTML = def.name;
								setTimeout(function(){ target.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = def.se;
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}	
								
							
							
							if(nextAnimation.special.enemy_counter){
								_this._enemyCounter.style.display = "block";
								setTimeout(function(){ _this._enemyCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
							if(nextAnimation.special.actor_counter){
								_this._actorCounter.style.display = "block";
								setTimeout(function(){ _this._actorCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
														
							
						}
					}
					Graphics._updateCanvas();					
				} else {
					this._processingAction = false;
				}			
			}
		}		
		/*this._timer--;
		if(this._timer < 0){
			$gameTemp.popMenu = true;
			$gameSystem.setSubBattlePhase('after_battle');
		}*/
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			//this.requestRedraw();

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			//this.requestRedraw();
	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			//this.requestRedraw();
	
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			//this.requestRedraw();
	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			//this.requestRedraw();
		
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			//this.requestRedraw();
			
		}
		
		if (Input.isTriggered('ok') || Input.isPressed('ok') || this._touchDoubleSpeed) {
			this._doubleSpeedEnabled = true;
			this.getWindowNode().classList.add("double_speed");
		} else {
			this._doubleSpeedEnabled = false;
			this.getWindowNode().classList.remove("double_speed"); //debug should be remove for final!
		}
		
		if(Input.isTriggered('pageup')){
			//this.requestRedraw();
			//this.readBattleCache();
		} 	
		
		if(Input.isTriggered('ok')){
			
		}
		if(Input.isTriggered('cancel')){
			Input._latestButton = "ok";
			
			this._finishing = true;
		}		
		
		this.refresh();
	}		
};

Window_BattleBasic.prototype.makeImageURL = function(name) {
	return "img/basic_battle/"+name+".png";
}

Window_BattleBasic.prototype.redraw = async function() {	
	var _this = this;
	
	Object.keys(_this._participantInfo).forEach(function(type){
		var participant = _this._participantInfo[type];
		if(participant.participating && _this._participantComponents[type]){
			var containerInfo = _this._participantComponents[type];
			containerInfo.image.setAttribute("data-img", _this.makeImageURL(participant.img));
		}
	});
	
	await this.loadImages();
	
	Object.keys(_this._participantInfo).forEach(function(type){
		var participant = _this._participantInfo[type];
		if(participant.participating && _this._participantComponents[type]){
			var containerInfo = _this._participantComponents[type];
			_this.updateScaledDiv(containerInfo.container);
			_this.updateScaledDiv(containerInfo.HP);
			_this.updateScaledDiv(containerInfo.destroyedContainer);
			_this.updateScaledImage(containerInfo.destroyed);
			_this.updateScaledDiv(containerInfo.damageContainer);
			_this.updateScaledImage(containerInfo.damage);
			_this.updateScaledDiv(containerInfo.buffContainer);
			_this.updateScaledImage(containerInfo.buff);
			_this.updateScaledImage(containerInfo.barrier);
			_this.updateScaledDiv(containerInfo.rmmvAnim);
		}			
	});	
	
	var windowNode = this.getWindowNode();	
	windowNode.addEventListener("mousedown", function(){
		_this._touchDoubleSpeed = true;
	});	
	
	windowNode.addEventListener("mouseup", function(){
		_this._touchDoubleSpeed = false;
	})
	
	const imgBgs = windowNode.querySelectorAll(".layer");
	
	const introLength = 1000;
	const introSpeed = 20;
	
	for(let imgBg of imgBgs){
		this.updateScaledImageBg(imgBg, true);
		const side = imgBg.getAttribute("data-side");
		const direction = side == "actor" ? 1 : -1;
		
		const scrollSpeed = imgBg.getAttribute("data-bgwidth") / (imgBg.getAttribute("data-scrollduration") * 1000); //pixels/millisecond
		const startPos = (scrollSpeed * introLength * introSpeed);
		
		imgBg.animate(
		  [
			{ "backgroundPositionX": startPos * direction * -1 + "px" },
			{ "backgroundPositionX": "0px" },
		  ],
		  {
			duration: 500,
			easing: "ease-out",
			iterations: 1,
		  },
		).onfinish = function(){
			imgBg.animate(
			  [
				{ "backgroundPositionX": "0px" },
				{ "backgroundPositionX": imgBg.getAttribute("data-bgwidth") * direction + "px" },
			  ],
			  {
				duration: imgBg.getAttribute("data-scrollduration") * 1000,
				iterations: Infinity,
			  },
			)
		};
	}
	
	if(_this._isLoading){
		_this._loader.classList.add("out");


		this._participantComponents["actor"].container.classList.remove("intro");
		this._participantComponents["actor_twin"].container.classList.remove("intro");
		this._participantComponents["actor_supporter"].container.classList.remove("intro");
		this._participantComponents["actor_supporter_twin"].container.classList.remove("intro");		
			
		this._participantComponents["enemy"].container.classList.remove("intro");
		this._participantComponents["enemy_twin"].container.classList.remove("intro");
		this._participantComponents["enemy_supporter"].container.classList.remove("intro");
		this._participantComponents["enemy_supporter_twin"].container.classList.remove("intro");
		
		this._participantComponents["actor"].container.classList.add("intro");
		this._participantComponents["actor_twin"].container.classList.add("intro");
		this._participantComponents["actor_supporter"].container.classList.add("intro");
		this._participantComponents["actor_supporter_twin"].container.classList.add("intro");		
			
		this._participantComponents["enemy"].container.classList.add("intro");
		this._participantComponents["enemy_twin"].container.classList.add("intro");
		this._participantComponents["enemy_supporter"].container.classList.add("intro");
		this._participantComponents["enemy_supporter_twin"].container.classList.add("intro");
		
		setTimeout(function(){
			windowNode.classList.remove("beforeView");
			windowNode.classList.add("beginView");
		}, 400);
	}
	
	Graphics._updateCanvas();
}

