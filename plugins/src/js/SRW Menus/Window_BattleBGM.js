import Window_CSS from "./Window_CSS.js";
import "./style/Window_BattleBGM.css"

export default function Window_BattleBGM() {
	if (Window_BattleBGM._instance) {
		return Window_BattleBGM._instance;
	}
	this.initialize.apply(this, arguments);
	Window_BattleBGM._instance = this;
}

Window_BattleBGM.prototype = Object.create(Window_CSS.prototype);
Window_BattleBGM.prototype.constructor = Window_BattleBGM;

Window_BattleBGM.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._imagesLoaded = false;
	this._lastBGM = AudioManager._currentBgm.name;
}

Window_BattleBGM.prototype.initialize = function() {
	const _this = this;
	this._layoutId = "battle_bgm_assign";

	this._currentUIState = "unit_selection"; // unit_selection, bgm_selection
	this._currentSelection = 0;
	this._pendingUnitIdx = 0;
	this._unitList = [];
	this._unitGroups = []; // [{name, startIdx}] — first flat index that belongs to each group
	this._availableSongs = []; // [{songId, type}] — type is "game" or "custom"
	this._confirmState = null; // null | "apply_all" | "reset_all"
	this._confirmSelection = 0; // 0 = yes, 1 = no
	this._needsFullRedraw = true;
	this._callbacks = {};

	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);

	window.addEventListener("resize", function(){
		_this._needsFullRedraw = true;
		_this.requestRedraw();
	});
}

Window_BattleBGM.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	const windowNode = this.getWindowNode();

	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.BATTLE_BGM.header;
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);

	this._subHeader = document.createElement("div");
	this._subHeader.id = this.createId("sub_header");
	this._subHeader.classList.add("sub_header");
	this._subHeader.classList.add("scaled_text");
	windowNode.appendChild(this._subHeader);

	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	this._listContainer.classList.add("styled_scroll");
	windowNode.appendChild(this._listContainer);

	this._listContainer.addEventListener('touchstart', function(e) { e.stopPropagation(); }, {passive: true});
	this._listContainer.addEventListener('touchmove',  function(e) { e.stopPropagation(); }, {passive: true});

	this._confirmContainer = document.createElement("div");
	this._confirmContainer.classList.add("confirm_container");
	this._confirmContainer.style.display = "none";
	windowNode.appendChild(this._confirmContainer);
}

Window_BattleBGM.prototype._buildUnitList = function() {
	const config = $SRWConfig.battleSongs;
	const notConfigurable = config.notConfigurableActors || [];
	const availableUnits = this.getAvailableUnits();

	const unitMap = {};
	for(let i = 0; i < availableUnits.length; i++){
		const unit = availableUnits[i];
		if(unit.actorId && unit.actorId() > 0){
			const id = unit.actorId();
			if(notConfigurable.indexOf(id) === -1){
				unitMap[id] = unit;
			}
		}
	}

	const units = [];
	const groups = [];
	const assignedIds = {};

	const groupConfigs = config.assignmentGroups || [];
	for(let g = 0; g < groupConfigs.length; g++){
		const groupConfig = groupConfigs[g];
		const members = groupConfig.members || [];
		let startIdx = -1;
		for(let m = 0; m < members.length; m++){
			const actorId = members[m];
			if(unitMap[actorId] && !assignedIds[actorId]){
				if(startIdx === -1){ startIdx = units.length; }
				units.push(unitMap[actorId]);
				assignedIds[actorId] = true;
			}
		}
		if(startIdx !== -1){
			groups.push({ name: groupConfig.name, startIdx: startIdx });
		}
	}

	const ungroupedStartIdx = units.length;
	const ids = Object.keys(unitMap);
	for(let i = 0; i < ids.length; i++){
		const actorId = parseInt(ids[i], 10);
		if(!assignedIds[actorId]){
			units.push(unitMap[actorId]);
		}
	}

	return { units: units, groups: groups, ungroupedStartIdx: ungroupedStartIdx };
}

Window_BattleBGM.prototype._buildSongList = function() {
	let game = $gameSystem.getUnlockedBGMs().sort(function(a, b){ return a.localeCompare(b); })
		.map(function(id){ return { songId: id, type: "game" }; });
	const custom = (DataManager._customBGMList || []).slice().sort(function(a, b){ return a.localeCompare(b); })
		.map(function(id){ return { songId: id, type: "custom" }; });

	const sortOrder = $SRWConfig.battleSongs.jukeboxOrder;
	if(sortOrder){
		const orderLookup = {};
		for(let i = 0; i < sortOrder.length; i++){
			orderLookup[sortOrder[i]] = i;
		}
		game = game.sort(function(a, b){
			const aOrder = orderLookup[a.songId];
			const bOrder = orderLookup[b.songId];
			if(aOrder == null){
				return 1;
			}
			if(bOrder == null){
				return -1;
			}
			return aOrder - bOrder;
		});
	}

	return game.concat(custom);
}

Window_BattleBGM.prototype._isAssignedSongMissing = function(unit) {
	if(!unit){ return false; }
	const actorId = unit.actorId();
	const customInfo = $gameSystem.customActorSongInfo;
	if(!customInfo || customInfo[actorId] === undefined){ return false; }
	const info = customInfo[actorId];
	const songId = typeof info === "string" ? info : (info && info.default);
	if(!songId || !songId.match('.*custom/')){ return false; }
	return !$songManager.isCustomSongAvailable(songId);
}

Window_BattleBGM.prototype._getCurrentUnitSongId = function(unit) {
	if(!unit){
		return null;
	}
	const actorId = unit.actorId();
	const customInfo = $gameSystem.customActorSongInfo;
	if(customInfo && customInfo[actorId] !== undefined){
		const info = customInfo[actorId];
		if(typeof info === "string"){
			return info;
		} else if(info && info.default){
			return info.default;
		}
	}
	const configMapping = $SRWConfig.battleSongs.actorSongMapping;
	if(configMapping && configMapping[actorId] !== undefined){
		const configInfo = configMapping[actorId];
		if(typeof configInfo === "string"){
			return configInfo;
		} else if(configInfo && configInfo.default){
			return configInfo.default;
		}
	}
	return null;
}

Window_BattleBGM.prototype._getConfigDefaultSongId = function(unit) {
	if(!unit){
		return null;
	}
	const configMapping = $SRWConfig.battleSongs.actorSongMapping;
	const configInfo = configMapping && configMapping[unit.actorId()];
	if(!configInfo){
		return null;
	}
	if(typeof configInfo === "string"){
		return configInfo;
	} else if(configInfo.default){
		return configInfo.default;
	}
	return null;
}

Window_BattleBGM.prototype._getSongDisplayName = function(songId) {
	if(!songId){ return songId; }
	const displayNames = $SRWConfig.battleSongs.displayNames;
	if(displayNames && displayNames[songId] !== undefined){
		return displayNames[songId];
	}
	// Strip "custom/" prefix for display when no explicit name is set
	return songId.replace(/^.*custom[\/\\]/, '');
}

Window_BattleBGM.prototype._getCurrentUnitSongTitle = function(unit) {
	if(!unit){
		return APPSTRINGS.BATTLE_BGM.label_default;
	}
	let songId = this._getCurrentUnitSongId(unit);
	if(songId == null){
		return APPSTRINGS.BATTLE_BGM.label_none;
	}
	return this._getSongDisplayName(songId);
}

Window_BattleBGM.prototype._getUnitName = function(unit) {
	if(!unit){
		return APPSTRINGS.BATTLE_BGM.label_unknown_unit;
	}
	if(typeof unit.name === "function"){
		return unit.name();
	}
	return APPSTRINGS.BATTLE_BGM.label_unknown_unit_fallback;
}

Window_BattleBGM.prototype.open = function() {
	this._currentUIState = "unit_selection";
	this._currentSelection = 0;
	this._pendingUnitIdx = 0;
	const listResult = this._buildUnitList();
	this._unitList = listResult.units;
	this._unitGroups = listResult.groups;
	this._ungroupedStartIdx = listResult.ungroupedStartIdx;
	this._availableSongs = this._buildSongList();
	this._confirmState = null;
	this._confirmContainer.style.display = "none";
	this._needsFullRedraw = true;
	Window_CSS.prototype.open.call(this);
	this.requestRedraw();
	this.refresh();
}

Window_BattleBGM.prototype.update = function() {
	const _this = this;
	Window_Base.prototype.update.call(this);

	if(this.isOpen() && !this._handlingInput){

		if(this._confirmState !== null){
			if(Input.isTriggered('left') || Input.isTriggered('right')){
				this._confirmSelection = this._confirmSelection === 0 ? 1 : 0;
				this._renderConfirm();
				SoundManager.playCursor();
			} else if(Input.isTriggered('ok')){
				if(this._confirmSelection === 0){ this._onConfirmOk(); }
				else { this._onConfirmCancel(); }
			} else if(Input.isTriggered('cancel')){
				this._onConfirmCancel();
			}
			return;
		}

		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.incrementSelection();
			this.requestRedraw();
			this.refresh();
			return;
		}

		if(Input.isTriggered('up') || Input.isRepeated('up')){
			this.decrementSelection();
			this.requestRedraw();
			this.refresh();
			return;
		}

		if(Input.isTriggered('menu')){			
			this._onPreviewSong();		
			return;
		}

		if(Input.isTriggered('ok')){
			if(this._currentUIState === "unit_selection"){
				if(this._unitList.length > 0){
					SoundManager.playOk();
					this._pendingUnitIdx = this._currentSelection;
					this._currentSelection = 0;
					this._currentUIState = "bgm_selection";
					this._availableSongs = this._buildSongList();
					this._needsFullRedraw = true;
					this.requestRedraw();
					this.refresh();
				}
			} else {
				SoundManager.playOk();
				this._confirmBGMSelection();
				this._currentUIState = "unit_selection";
				this._currentSelection = this._pendingUnitIdx;
				this._needsFullRedraw = true;
				this.requestRedraw();
				this.refresh();
			}
			return;
		}

		if(this._currentUIState === "unit_selection" && Input.isTriggered('pageup')){
			if(this._unitList.length > 0){
				const songId = _this._getCurrentUnitSongId(_this._unitList[_this._currentSelection]);
				if(songId){
					const displayName = _this._getSongDisplayName(songId);
					_this._showConfirm("apply_all", APPSTRINGS.BATTLE_BGM.confirm_apply_all.replace("%s", displayName));
				}
			}
			return;
		}

		if(this._currentUIState === "unit_selection" && Input.isTriggered('pagedown')){
			if(this._unitList.length > 0){
				_this._showConfirm("reset_all", APPSTRINGS.BATTLE_BGM.confirm_reset_all);
			}
			return;
		}

		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
			SoundManager.playCancel();
			if(this._currentUIState === "bgm_selection"){
				this._currentUIState = "unit_selection";
				this._currentSelection = this._pendingUnitIdx;
				this._needsFullRedraw = true;
				this.requestRedraw();
				this.refresh();
			} else {
				$songManager.playSong(_this._lastBGM);
				$gameTemp.popMenu = true;
				$gameTemp.buttonHintManager.hide();
				if(this._callbacks["closed"]){
					this._callbacks["closed"]();
				}
			}
			return;
		}

		this.resetTouchState();
		this.refresh();
	}
}

Window_BattleBGM.prototype.incrementSelection = function() {
	const listLen = this._currentUIState === "unit_selection"
		? this._unitList.length
		: this._availableSongs.length + 1;
	this._currentSelection++;
	if(this._currentSelection >= listLen){
		this._currentSelection = 0;
	}
	SoundManager.playCursor();
}

Window_BattleBGM.prototype.decrementSelection = function() {
	const listLen = this._currentUIState === "unit_selection"
		? this._unitList.length
		: this._availableSongs.length + 1;
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = listLen - 1;
	}
	SoundManager.playCursor();
}

Window_BattleBGM.prototype._scrollToSelected = function() {
	const container = this._listContainer;
	const selected = container.querySelector(".entry.selected");
	if(!selected){ return; }
	const containerTop = container.scrollTop;
	const containerBottom = containerTop + container.clientHeight;
	const elemTop = selected.offsetTop;
	const elemBottom = elemTop + selected.offsetHeight;
	const margin = selected.clientHeight * 1.2;
	if(elemTop < containerTop + margin){
		container.scrollTop = elemTop - margin;
	} else if(elemBottom > containerBottom - margin){
		container.scrollTop = elemBottom - container.clientHeight + margin;
	}
}

Window_BattleBGM.prototype._onPreviewSong = function() {	
	let songId;
	if(this._currentUIState === "unit_selection"){
		songId = this._getCurrentUnitSongId(this._unitList[this._currentSelection]);
	} else {
		if(this._currentSelection !== 0){
			songId = this._availableSongs[this._currentSelection - 1].songId;
		}
	}
	
	if(songId){
		$songManager.playSong(songId);
	}	
}

Window_BattleBGM.prototype._showConfirm = function(state, question) {
	this._confirmState = state;
	this._confirmQuestion = question;
	this._confirmSelection = 0;
	this._renderConfirm();
	this._confirmContainer.style.display = "";
}

Window_BattleBGM.prototype._renderConfirm = function() {
	const _this = this;
	this._confirmContainer.innerHTML = this.createConfirmContent(this._confirmQuestion, this._confirmSelection);
	this._confirmContainer.querySelector(".ok_button").addEventListener("click", function(){
		_this._onConfirmOk();
	});
	this._confirmContainer.querySelector(".cancel_button").addEventListener("click", function(){
		_this._onConfirmCancel();
	});
	Graphics._updateCanvas();
}

Window_BattleBGM.prototype._hideConfirm = function() {
	this._confirmState = null;
	this._confirmContainer.style.display = "none";
}

Window_BattleBGM.prototype._onConfirmOk = function() {
	if(this._confirmState === "apply_all"){
		const songId = this._getCurrentUnitSongId(this._unitList[this._currentSelection]);
		if(songId){
			this._unitList.forEach(function(unit){
				$songManager.setCustomActorSong(unit.actorId(), null, songId);
			});
		}
	} else if(this._confirmState === "reset_all"){
		this._unitList.forEach(function(unit){
			$gameSystem.clearCustomActorSong(unit.actorId());
		});
	}
	SoundManager.playOk();
	this._hideConfirm();
	this._needsFullRedraw = true;
	this.requestRedraw();
}

Window_BattleBGM.prototype._onConfirmCancel = function() {
	SoundManager.playCancel();
	this._hideConfirm();
	this.requestRedraw();
}

Window_BattleBGM.prototype._confirmBGMSelection = function() {
	const unit = this._unitList[this._pendingUnitIdx];
	if(!unit){
		return;
	}
	const actorId = unit.actorId();
	if(this._currentSelection === 0){
		$gameSystem.clearCustomActorSong(actorId);
	} else {
		const entry = this._availableSongs[this._currentSelection - 1];
		if(entry){
			$songManager.setCustomActorSong(actorId, null, entry.songId);
		}
	}
}

Window_BattleBGM.prototype._updateSelectionDisplay = function() {
	const prev = this._listContainer.querySelector(".entry.selected");
	if(prev){ prev.classList.remove("selected"); }
	const next = this._listContainer.querySelector(".entry[data-idx='" + this._currentSelection + "']");
	if(next){ next.classList.add("selected"); }
	this._scrollToSelected();
}

Window_BattleBGM.prototype.redraw = function() {
	if(!this._needsFullRedraw){
		this._updateSelectionDisplay();
		return;
	}
	this._needsFullRedraw = false;
	const _this = this;

	if(this._currentUIState === "unit_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["scroll_list"], ["select_bgm_pilot"], ["apply_all_bgm"], ["reset_all_bgm"], ["preview_bgm"]]);
		this._subHeader.innerHTML = APPSTRINGS.BATTLE_BGM.sub_header_unit;
	} else {
		$gameTemp.buttonHintManager.setHelpButtons([["scroll_list"], ["assign_bgm"], ["preview_bgm"]]);
		const unit = this._unitList[this._pendingUnitIdx];
		const unitName = this._getUnitName(unit);
		this._subHeader.innerHTML = APPSTRINGS.BATTLE_BGM.sub_header_bgm + unitName;
	}
	$gameTemp.buttonHintManager.show();

	let content = "";

	if(this._currentUIState === "unit_selection"){
		if(this._unitList.length === 0){
			content += "<div class='entry title scaled_text fitted_text'>" + APPSTRINGS.BATTLE_BGM.label_no_pilots + "</div>";
		} else {
			// Build a lookup: flat index -> group name (header to insert before this entry)
			const groupHeaders = {};
			for(let g = 0; g < _this._unitGroups.length; g++){
				groupHeaders[_this._unitGroups[g].startIdx] = _this._unitGroups[g].name;
			}
			const hasGroups = _this._unitGroups.length > 0;
			const ungroupedStartIdx = _this._ungroupedStartIdx;
			const hasUngrouped = ungroupedStartIdx < _this._unitList.length;
			if(hasGroups && hasUngrouped){
				groupHeaders[ungroupedStartIdx] = APPSTRINGS.BATTLE_BGM.label_group_others;
			}

			_this._unitList.forEach(function(unit, idx){
				if(groupHeaders[idx] !== undefined){
					content += "<div class='entry group_header scaled_text fitted_text'>" + groupHeaders[idx] + "</div>";
				}
				const actorId = unit.actorId();
				const selected = idx === _this._currentSelection;
				content += "<div data-idx='" + idx + "' class='entry" + (selected ? " selected" : "") + "'>";
				content += "<div class='face_col' data-actor-id='" + actorId + "'></div>";
				content += "<div class='label scaled_text fitted_text'>" + _this._getUnitName(unit) + "</div>";
				
				content += "<div class='value scaled_text fitted_text'>" + _this._getCurrentUnitSongTitle(unit);
				if(_this._isAssignedSongMissing(unit)){
					content += "<img class='warn_icon scaled_width' src='svg/hazard-sign.svg'>";
				}
				content += "</div>";
				
				content += "<img class='play_btn scaled_width' data-play-idx='" + idx + "' src='svg/music-play.svg'>";
				content += "</div>";
			});
		}
	} else {
		// Index 0 = "Default" (clear override)
		const pendingUnit = this._unitList[this._pendingUnitIdx];
		const configDefaultId = this._getConfigDefaultSongId(pendingUnit);
		const defaultSelected = this._currentSelection === 0;
		content += "<div data-idx='0' class='entry" + (defaultSelected ? " selected" : "") + "'>";
		content += "<div class='label scaled_text fitted_text'>" + APPSTRINGS.BATTLE_BGM.label_default + "</div>";
		content += "<div class='value scaled_text fitted_text'>" + (configDefaultId ? _this._getSongDisplayName(configDefaultId) : APPSTRINGS.BATTLE_BGM.label_none) + "</div>";
		if(configDefaultId){
			content += "<img class='play_btn scaled_width' data-play-song='" + configDefaultId + "' src='svg/music-play.svg'>";
		}
		content += "</div>";

		if(this._availableSongs.length === 0){
			content += "<div class='entry title scaled_text fitted_text'>" + APPSTRINGS.BATTLE_BGM.label_no_bgms + "</div>";
		} else {
			this._availableSongs.forEach(function(entry, idx){
				if(idx === 0 || entry.type !== _this._availableSongs[idx - 1].type){
					const headerLabel = entry.type === "custom" ? APPSTRINGS.BATTLE_BGM.label_type_custom : APPSTRINGS.BATTLE_BGM.label_type_game;
					content += "<div class='entry group_header scaled_text fitted_text'>" + headerLabel + "</div>";
				}
				const entryIdx = idx + 1;
				const selected = entryIdx === _this._currentSelection;
				content += "<div data-idx='" + entryIdx + "' class='entry" + (selected ? " selected" : "") + "'>";
				content += "<div class='label scaled_text fitted_text'>" + _this._getSongDisplayName(entry.songId) + "</div>";
				content += "<div class='value scaled_text fitted_text'></div>";
				content += "<img class='play_btn scaled_width' data-play-song='" + entry.songId + "' src='svg/music-play.svg'>";
				content += "</div>";
			});
		}
	}

	this._listContainer.innerHTML = content;
	this._scrollToSelected();

	// Load pilot portraits into face placeholder divs (unit list only)
	if(this._currentUIState === "unit_selection"){
		this._listContainer.querySelectorAll(".face_col[data-actor-id]").forEach(function(elem){
			const actorId = parseInt(elem.getAttribute("data-actor-id"), 10);
			if(actorId > 0 && $dataActors[actorId]){
				_this.loadActorFace(actorId, elem);
			}
		});
	}

	// Touch/click handlers
	const windowNode = this.getWindowNode();
	const entries = windowNode.querySelectorAll(".entry[data-idx]");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			const idx = parseInt(this.getAttribute("data-idx"), 10);
			if(!isNaN(idx)){
				if(_this._currentUIState === "unit_selection"){
					_this._pendingUnitIdx = idx;
					_this._currentUIState = "bgm_selection";
					_this._currentSelection = 0;
					_this._availableSongs = _this._buildSongList();
					_this._needsFullRedraw = true;

				} else {
					if(idx === _this._currentSelection){
						_this._confirmBGMSelection();
						_this._currentUIState = "unit_selection";
						_this._needsFullRedraw = true;
					} else {
						_this._currentSelection = idx;
					}
				}
				_this.requestRedraw();
			}
		});
	});

	// Play button click handlers
	windowNode.querySelectorAll(".play_btn[data-play-idx]").forEach(function(btn){
		btn.addEventListener("click", function(e){
			e.stopPropagation();
			const idx = parseInt(this.getAttribute("data-play-idx"), 10);
			const songId = _this._getCurrentUnitSongId(_this._unitList[idx]);
			if(songId){
				$songManager.playSong(songId);
			}
		});
	});

	windowNode.querySelectorAll(".play_btn[data-play-song]").forEach(function(btn){
		btn.addEventListener("click", function(e){
			e.stopPropagation();
			const songId = this.getAttribute("data-play-song");
			if(songId){
				$songManager.playSong(songId);
			}
		});
	});

	if(!this._imagesLoaded){
		setTimeout(function(){
			_this.loadImages();
		}, 50);		
		this._imagesLoaded = true;
	}
	
	Graphics._updateCanvas();

	if(this._callbacks["redraw"]){
		this._callbacks["redraw"]();
	}
}
