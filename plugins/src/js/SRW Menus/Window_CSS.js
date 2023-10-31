export default function Window_CSS() {
	this.initialize.apply(this, arguments);	
}

Window_CSS.prototype = Object.create(Window_Base.prototype);
Window_CSS.prototype.constructor = Window_CSS;

Window_CSS.prototype.initialize = function() {
	Window_Base.prototype.initialize.call(this, arguments);	
	this._container = document.querySelector("#"+this._layoutId);
	if(ENGINE_SETTINGS.DISABLE_TOUCH){
		this._container.style.pointerEvents = "none";
	}
	this._redrawRequested = false;
	this._callbacks = {};
	this.createComponents();
	this._glowCycleTime = 120;
	this._maxGlowDelta = 0.25;
	this._glowTimer = this._glowCycleTime;
	this._container.classList.add("custom_css");
}

Window_CSS.prototype.destroy = function() {
	this._callbacks = {};
}

Window_CSS.prototype.registerCallback = function(handle, func) {
	this._callbacks[handle] = func;
};

Window_CSS.prototype.getWindowNode = function() {
	return this._container;
};

Window_CSS.prototype.createId = function(id) {
	return this._layoutId+"_"+id;
};

Window_CSS.prototype.hide = function() {
    this.visible = false;
	this._visibility = "none";
	this.refresh();
};

Window_CSS.prototype.show = function() {
	this.resetSelection();
	this._handlingInput = false;
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();	
	Graphics._updateCanvas();
};

Window_CSS.prototype.requestRedraw = function() {	
	this._redrawRequested = true;
};

Window_CSS.prototype.validateCurrentSelection = function() {	
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
};

Window_CSS.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.resetTouchState();
	this._isValidTouchInteraction = false;
	this.getWindowNode().style.display = this._visibility;
}
	
Window_CSS.prototype.createComponents = function() {
	var windowNode = this.getWindowNode();
	windowNode.innerHTML = "";	
	windowNode.classList.add("menu_bg");
	this._bgFadeContainer = document.createElement("div");
	this._bgFadeContainer.classList.add("bg_fade_container");
	this._bgTextureContainer = document.createElement("div");
	this._bgTextureContainer.classList.add("bg_container");
	this._bgFadeContainer.appendChild(this._bgTextureContainer);
	windowNode.appendChild(this._bgFadeContainer);
}

Window_CSS.prototype.loadImages = async function() {	
	const windowNode = this.getWindowNode();
	
	let images = windowNode.querySelectorAll("img");
	
	let promises = [];
	let imgNameLookup = {};
	let ctr = 0;
	for(let img of images){
		let imgPath = img.getAttribute("data-img");
		if(imgPath){
			if(imgNameLookup[imgPath] == null){
				imgNameLookup[imgPath] = ctr++;
				promises.push(ImageManager.loadBitmapPromise("", imgPath));
			}	
		}				
	}
	
	await Promise.all(promises);
	
	let bitmaps = [];
	for(let promise of promises){
		bitmaps.push(await promise);
	}
	
	for(let img of images){
		let imgPath = img.getAttribute("data-img");
		if(imgNameLookup[imgPath] != null){
			img.setAttribute("src", bitmaps[imgNameLookup[imgPath]].canvas.toDataURL());
		}	
	}	
}

Window_CSS.prototype.createEntryList = function(node, listInfo, id) {	
	node.innerHTML = "";
	node.id = this.createId(id);
	node.classList.add("menu_section");
	
	for(var i = 0; i < listInfo.length; i++){
		var div = document.createElement("div");
		div.classList.add("scaled_text");
		div.classList.add("menu_entry");
		if(this._currentKey == listInfo[i].key){
			div.classList.add("selected");
		}
		if(listInfo[i].enabled && !listInfo[i].enabled()){
			div.classList.add("disabled");
		}
		div.setAttribute("data-key", listInfo[i].key);
		div.setAttribute("data-idx", i);
		div.innerHTML = listInfo[i].name;
		node.appendChild(div);
	}
}

Window_CSS.prototype.loadEnemyFace = function(actorId, elem) {
	this.loadFace($dataEnemies[actorId], elem);
}

Window_CSS.prototype.loadActorFace = function(actorId, elem) {
	this.loadFace($dataActors[actorId], elem);
}

Window_CSS.prototype.loadFace = function(actorData, elem) {		
	var faceName;
	if(actorData && elem){
		if(typeof actorData.faceName != "undefined"){
			faceName = actorData.faceName;		
		} else {
			faceName = actorData.meta.faceName;
		}
		var faceIndex;
		if(typeof actorData.faceIndex != "undefined"){
			faceIndex = actorData.faceIndex;		
		} else {
			faceIndex = actorData.meta.faceIndex - 1;
		}
		this.loadFaceByParams(faceName, faceIndex, elem);
	}	
}

Window_CSS.prototype.loadFaceByParams = function(faceName, faceIndex, elem, noTranslation) {
	var width = Window_Base._faceWidth;
    var height = Window_Base._faceHeight;
	
	elem.innerHTML = "";
	
	var targetBitmap = new Bitmap(width, height);
	
	var bitmap = ImageManager.loadFace(faceName, null, noTranslation);	
	bitmap.addLoadListener(function(){
		var pw = Window_Base._faceWidth;
		var ph = Window_Base._faceHeight;
		var sw = Math.min(width, pw);
		var sh = Math.min(height, ph);
		var dx = Math.floor(0 + Math.max(width - pw, 0) / 2);
		var dy = Math.floor(0 + Math.max(height - ph, 0) / 2);
		var sx = faceIndex % 4 * pw + (pw - sw) / 2;
		var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;   
		
		targetBitmap.blt(bitmap, sx, sy, sw, sh, dx, dy);
		var facePicContainer = document.createElement("div");
		facePicContainer.classList.add("face_pic_container");
		var facePic = document.createElement("img");
		facePic.style.width = "100%";
		facePic.setAttribute("src", targetBitmap.canvas.toDataURL());
		facePicContainer.appendChild(facePic);	
		elem.appendChild(facePicContainer);	
	});
}

Window_CSS.prototype.loadMechMiniSprite = function(mechClass, elem) {
	if($dataClasses[mechClass] && $dataClasses[mechClass].meta && $dataClasses[mechClass].meta.srpgOverworld){	
		var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
		var characterName = overworldSpriteData[0];
		var characterIndex = overworldSpriteData[1];
		
		elem.innerHTML = "";	

		var bitmap = ImageManager.loadCharacter(characterName);   
		
		bitmap.addLoadListener(function(){
			var big = ImageManager.isBigCharacter(characterName);
			var pw = bitmap.width / (big ? 3 : 12);
			var ph = bitmap.height / (big ? 4 : 8);
			
			var targetBitmap = new Bitmap(pw, ph);
			
			var n = big ? 0: characterIndex;
			var sx = (n % 4 * 3 + 1) * pw;
			var sy = (Math.floor(n / 4) * 4) * ph;
			
			targetBitmap.blt(bitmap, sx, sy, pw, ph, 0, 0); 
			var mechPicContainer = document.createElement("div");
			mechPicContainer.classList.add("mech_pic_container");
			var mechPic = document.createElement("img");
			mechPic.style.width = "100%";
			mechPic.setAttribute("src", targetBitmap.canvas.toDataURL());
			mechPicContainer.appendChild(mechPic);	
			elem.appendChild(mechPicContainer);	
		});	
	}
}

Window_CSS.prototype.getMechDisplayData = function(unit) {
	return unit.SRWStats.mech;
}

Window_CSS.prototype.createUpgradeBar = function(level, pending, context) {
	var content = "";
	var parts = $statCalc.getMaxUpgradeLevel();
	var unlocked = $statCalc.getUnlockedUpgradeLevel();
	content+="<div class='upgrade_bar'>";
	for(var i = 0; i < parts; i++){
		var cssClass = "";
		if(i >= unlocked){
			cssClass = "locked";
		} else if(i < level){
			cssClass = "active";
		} else if(pending && i < (level + pending)) {
			cssClass = "pending";
		}
		content+="<div data-context='"+context+"' data-idx='"+i+"' class='upgrade_bar_part "+cssClass+"'>";
		content+="</div>";
	}
	content+="</div>";
	return content;
}

Window_CSS.prototype.createUpgradeBarScaled = function(level, pending) {
	var content = "";
	var parts = $statCalc.getMaxUpgradeLevel();
	content+="<div class='upgrade_bar scaled_height'>";
	for(var i = 0; i < parts; i++){
		var cssClass = "";
		if(i < level){
			cssClass = "active";
		} else if(pending && i < (level + pending)) {
			cssClass = "pending";
		}
		content+="<div class='upgrade_bar_part scaled_width "+cssClass+"'>";
		content+="</div>";
	}
	content+="</div>";
	return content;
}

Window_CSS.prototype.createReferenceData = function(mech, useActorIfAvailable){
	if(useActorIfAvailable){
		var currentPilot = $statCalc.getCurrentPilot(mech.id);
		if(currentPilot){
			return currentPilot;
		}
	}
	var result = $statCalc.createEmptyActor();
	result.SRWStats.mech = mech;
	$statCalc.attachDummyEvent(result, mech.id);
	return result;
}

Window_CSS.prototype.getAvailableUnits = function(unitMode, deployableOnly){
	if(!unitMode){
		unitMode = this._unitMode;
	}
	if(unitMode == "actor"){
		this._availableUnits = $gameSystem._availableUnits;
	} else {
		/*var tmp = Object.keys($SRWSaveManager.getUnlockedUnits());			
		this._availableUnits = [];
		for(var i = 0; i < tmp.length; i++){
			var currentPilot = $statCalc.getCurrentPilot(tmp[i]);
			if(currentPilot){
				this._availableUnits.push(currentPilot);
			} else {
				var mechData = $statCalc.getMechData($dataClasses[tmp[i]], true);
				$statCalc.calculateSRWMechStats(mechData);		
				this._availableUnits.push(this.createReferenceData(mechData));
			}
		}*/
		var actorCollection = $gameSystem._availableUnits || [];
		actorCollection = actorCollection.concat($gameSystem._availableMechs || []);
		this._availableUnits = actorCollection;
		
		var tmp = [];
		if(this._availableUnits){
			this._availableUnits.forEach(function(unit){
				if($statCalc.isActorSRWInitialized(unit) && unit.SRWStats.mech.id != -1){
					tmp.push(unit);
				}
			});
		}
		this._availableUnits = tmp; 
	}		
	var tmp = [];
	if(this._availableUnits){
		this._availableUnits.forEach(function(unit){
			if($statCalc.isActorSRWInitialized(unit) && (!deployableOnly || !unit.SRWStats.mech.notDeployable)){
				tmp.push(unit);
			}
		});
	}
	
	this._availableUnits = tmp; 
	/*this._availableUnits.forEach(function(unit){
		$statCalc.initSRWStats(unit);
	});*/
	return this._availableUnits;
}

Window_CSS.prototype.refreshAllUnits = function(){
	$statCalc.invalidateAbilityCache();
	var availableUnits = this.getAvailableUnits();
	availableUnits.forEach(function(unit){
		if(unit.actorId() != -1){
			$statCalc.initSRWStats(unit);
		} else if(unit.SRWStats.mech.id != -1){
			var mechData = $statCalc.getMechData($dataClasses[unit.SRWStats.mech.id], true);
			$statCalc.calculateSRWMechStats(mechData, false, unit);	
			unit.SRWStats.mech = mechData;
		}	
	});
}

Window_CSS.prototype.getNextAvailableUnitGlobal = function(currentUnitId, deployableOnly){
	var availableUnits = this.getAvailableUnits(null, deployableOnly);
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.mech.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx++
	if(currentIdx >= availableUnits.length){
		currentIdx = 0;
	}	
	var currentMech = availableUnits[currentIdx];
	var mechData = this.getMechDisplayData(currentMech);
	var currentPilot = $statCalc.getCurrentPilot(currentMech.SRWStats.mech.id);		
	if(!currentPilot){
		currentPilot = this.createReferenceData(mechData);
	}
	return {mech: mechData, actor: currentPilot};
}

Window_CSS.prototype.getPreviousAvailableUnitGlobal = function(currentUnitId, deployableOnly){
	var availableUnits = this.getAvailableUnits(null, deployableOnly);
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.mech.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx--;
	if(currentIdx < 0){
		currentIdx = availableUnits.length - 1;
	}
	var currentMech = availableUnits[currentIdx];
	var mechData = this.getMechDisplayData(currentMech);
	var currentPilot = $statCalc.getCurrentPilot(currentMech.SRWStats.mech.id);	
	if(!currentPilot){
		currentPilot = this.createReferenceData(mechData);
	}
	return {mech: mechData, actor: currentPilot};
}

Window_CSS.prototype.getNextAvailablePilotGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits("actor");
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.pilot.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx++;
	if(currentIdx >= availableUnits.length){
		currentIdx = 0;
	}
	var actor = availableUnits[currentIdx];
	return {mech: actor.SRWStats.mech, actor: actor};
}

Window_CSS.prototype.getPreviousAvailablePilotGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits("actor");
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.pilot.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx--;
	if(currentIdx < 0){
		currentIdx = availableUnits.length - 1;
	}
	var actor = availableUnits[currentIdx];
	return {mech: actor.SRWStats.mech, actor: actor};
}

Window_CSS.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
}

Window_CSS.prototype.updateScaledImage = function(img) {
	if(img.naturalWidth == 0){
		return false;
	} else {
		img.style.width = (img.naturalWidth * Graphics.getScale()) + "px";
		//img.style.width = "0px";
		return true;
	}	
}

Window_CSS.prototype.updateScaledDiv = function(div, noWidth, noHeight, ignoreOriginalDimensions) {
	if(div){
		var computedStyle = getComputedStyle(div);
		var originalWidth = div.getAttribute("original-width");
		if(!originalWidth || ignoreOriginalDimensions){
			originalWidth = computedStyle.getPropertyValue('--widthpixels');
			if(!originalWidth){
				originalWidth = computedStyle.width.replace("px", "");
			}		
			div.setAttribute("original-width", originalWidth);
		}
		var originalHeight = div.getAttribute("original-height");
		if(!originalHeight || ignoreOriginalDimensions){
			originalHeight = computedStyle.getPropertyValue('--heightpixels');
			if(!originalHeight){
				originalHeight = computedStyle.height.replace("px", "");
			}
			div.setAttribute("original-height", originalHeight);
		}
		if(!noWidth){
			div.style.width = (originalWidth * Graphics.getScale()) + "px";
		}
		if(!noHeight){
			div.style.height = (originalHeight * Graphics.getScale()) + "px";
		}	
	}
}


Window_CSS.prototype.assignFactionColorClass = function(elem, ref) {
	elem.classList.add("faction_color");
	elem.classList.remove("ally");
	elem.classList.remove("enemy");
	elem.classList.remove("faction_1");
	elem.classList.remove("faction_2");
	if(ref.isActor()){
		elem.classList.add("ally");
	} else {
		if(ref.factionId == 0){
			elem.classList.add("enemy");
		}
		if(ref.factionId == 1){
			elem.classList.add("faction_1");
		}
		if(ref.factionId == 2){
			elem.classList.add("faction_2");
		}
	}
}

Window_CSS.prototype.applyDoubleTime = function(el) {	
	if(this._doubleSpeedEnabled || $gameSystem.getBattleSpeed() > 1){
		var compStyle = window.getComputedStyle(el, null);
		var duration = compStyle.getPropertyValue("animation-duration").replace(/s/g, "").replace(/\s/g, "");
		var parts = duration.split(",");
		for(var i = 0; i < parts.length; i++){
			parts[i] = parts[i] / (1 + $gameSystem.getBattleSpeed()) + "s";
		}
		el.style["animation-duration"] = parts.join(",");
	} else {
		el.style["animation-duration"] = "";
	}
}

Window_CSS.prototype.getAnimTimeRatio = function() {	
	if(this._doubleSpeedEnabled || $gameSystem.getBattleSpeed() > 1){
		return 1 / (1 + $gameSystem.getBattleSpeed());
	}
	return 1;
}

Window_CSS.prototype.resetTouchState = function(){
	this._touchOK = false;
	this._touchMenu = false;
	this._touchShift = false;
	this._touchLeft = false;
	this._touchRight = false;
	this._touchUp = false;
	this._touchDown = false;
	this._touchCancel = false;
	this._touchL2 = false;
	this._touchR2 = false;
	this._touchL1 = false;
	this._touchR1 = false;
}

Window_CSS.prototype.registerTouchObserver = function(type, func) {
	if(!this._touchObservers){
		this._touchObservers = {};
	}	
	this._touchObservers[type] = func;
}

Window_CSS.prototype.notifyTouchObserver = function(type) {
	if(this._touchObservers && this._touchObservers[type]){
		this._touchObservers[type]();
	}
}

Window_CSS.prototype.registerObserver = function(type, func) {
	if(!this._observers){
		this._observers = {};
	}
	this._observers[type] = func;
}

Window_CSS.prototype.notifyObserver = function(type) {
	if(this._observers && this._observers[type]){
		this._observers[type]();
	}
}

Window_CSS.prototype.getGlowOpacity = function() {	
	var opacity;		
	var cycle = this._glowCycleTime/2;
	if(this._glowTimer/ this._glowCycleTime > 0.5){
		var timer = this._glowTimer - cycle;
		//opacity = 1 - (this._maxGlowDelta * ((timer / cycle)));
		opacity = (0.99 - this._maxGlowDelta) + (this._maxGlowDelta * ((timer / cycle)));
	} else {
		var timer = this._glowTimer;
		opacity = 0.99 - (this._maxGlowDelta * ((timer / cycle)));
	}
	return opacity;
}

Window_CSS.prototype.updateGlow = function() {
	if(this.isOpen()){
		this._glowTimer--;
		if(this._glowTimer < 0){
			this._glowTimer = this._glowCycleTime;
		}
		var opacity = this.getGlowOpacity();
		//console.log(opacity);
		var elems = this.getWindowNode().querySelectorAll(".glowing_elem");
		elems.forEach(function(elem){
			elem.style.opacity = opacity;
		});
	}	
}

Window_CSS.prototype.handleElemScrol = function(scrolledElem, scroll) {
	if(scrolledElem){
		if(scroll > (scrolledElem.scrollHeight - scrolledElem.clientHeight)){
			scroll = scrolledElem.scrollHeight - scrolledElem.clientHeight;
		} else if(scroll < 0){
			scroll = 0;
		}
		scrolledElem.scrollTop = scroll;
	}
	return scrolledElem.scrollTop;
}

Window_CSS.prototype.createAttributeEffectivenessBlock = function(actor, attribute, attack, target) {
	let content = "";
	let effectClass = "";
	if(target){
		let effectiveness = $statCalc.getEffectivenessMultiplier(actor, attack, target, "damage");
		if(effectiveness > 1){
			effectClass = "SE";
		} else if(effectiveness < 1){
			effectClass = "NVE";
		}
	}
	content+="<div class='attribute_effectiveness_block "+effectClass+"'>";
	let attr = $statCalc.getParticipantAttribute(actor, attribute, attack);
	if(attr){
		
		content+="<img class='effectiveness_icon' data-img='img/system/attribute_"+attr+".png'>";	
		content+="<div class='effectiveness_indicator glowing_elem'></div>";	
	}			
	content+="</div>";
	return content;
}


Window_CSS.prototype.createAttributeBlock = function(attack) {
	var content = "";
	content+="<div class='attribute_block'>";
	
	if(ENGINE_SETTINGS.USE_WEAPON_ATTRIBUTE){
		content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text effectiveness'>";
		let attr1 = $statCalc.getParticipantAttribute($gameTemp.currentMenuUnit.actor, "attribute1", attack);
		if(attr1){
			content+="<img data-img='img/system/attribute_"+attr1+".png'>";	
		}			
		content+="</div>";
	}
	
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.effects.length){
		content+="S";
	} 
	content+="</div>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.postMoveEnabled){
		content+="P";
	} 
	content+="</div>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.isCounter){
		content+="C";
	} 
	content+="</div>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	/*if(attack.particleType == "missile"){
		content+="Mi";	
	}
	if(attack.particleType == "physical"){
		content+="Ph";	
	}
	if(attack.particleType == "funnel"){
		content+="Fu";	
	}
	if(attack.particleType == "beam"){
		content+="Be";	
	}
	if(attack.particleType == "gravity"){
		content+="Gr";	
	}*/
	if(attack.particleType != "" && attack.particleType != null){
		var typeIndicator = attack.particleType.substring(0, 2);
		content+=typeIndicator.charAt(0).toUpperCase() + typeIndicator.slice(1);
	}
	content+="</div>";
	
	if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM){
		content+="<div class='attribute_block_entry all scaled_width scaled_height scaled_text fitted_text'>";
		if(attack.isAll){
			content+="ALL";
		} 
		content+="</div>";
	}
	
	
	content+="</div>";
	return content;
}