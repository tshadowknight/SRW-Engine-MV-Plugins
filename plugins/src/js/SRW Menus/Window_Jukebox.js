import Window_CSS from "./Window_CSS.js";
import "./style/Window_Jukebox.css"

export default function Window_Jukebox() {
	if (Window_Jukebox._instance) {
		return Window_Jukebox._instance;
	}
	this.initialize.apply(this, arguments);
	Window_Jukebox._instance = this;
}

Window_Jukebox.prototype = Object.create(Window_CSS.prototype);
Window_Jukebox.prototype.constructor = Window_Jukebox;

Window_Jukebox.prototype.initialize = function() {
	const _this = this;
	this._layoutId = "jukebox";
	this._currentSelection = 0;
	this._availableSongs = []; // [{songId, type}]
	this._nowPlayingSongId = null;
	this._lastBGM = null;
	this._needsFullRedraw = true;
	this._callbacks = {};

	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);

	window.addEventListener("resize", function(){
		_this._needsFullRedraw = true;
		_this.requestRedraw();
	});
}

Window_Jukebox.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	const windowNode = this.getWindowNode();

	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.JUKEBOX.header;
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
}

Window_Jukebox.prototype._buildSongList = function() {
	let game = $gameSystem.getUnlockedJukeboxSongs().sort(function(a, b){ return a.localeCompare(b); })
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

Window_Jukebox.prototype._getSongDisplayName = function(songId) {
	if(!songId){ return songId; }
	const displayNames = $SRWConfig.battleSongs.displayNames;
	if(displayNames && displayNames[songId] !== undefined){
		return displayNames[songId];
	}
	return songId.replace(/^.*custom\//, '');
}

Window_Jukebox.prototype.open = function() {
	this._currentSelection = 0;
	this._lastBGM = AudioManager._currentBgm ? AudioManager._currentBgm.name : null;
	this._availableSongs = this._buildSongList();
	const currentBgmName = AudioManager._currentBgm ? AudioManager._currentBgm.name : null;
	const match = currentBgmName && this._availableSongs.find(function(e){ return e.songId === currentBgmName; });
	this._nowPlayingSongId = match ? currentBgmName : null;
	if(this._nowPlayingSongId){
		const idx = this._availableSongs.indexOf(match);
		if(idx !== -1){ this._currentSelection = idx; }
	}
	this._needsFullRedraw = true;
	Window_CSS.prototype.open.call(this);
	this.requestRedraw();
	this.refresh();
}

Window_Jukebox.prototype.update = function() {
	Window_Base.prototype.update.call(this);

	if(this.isOpen() && !this._handlingInput){
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

		if(Input.isTriggered('ok') || Input.isTriggered('menu')){
			if(this._availableSongs.length > 0){
				const entry = this._availableSongs[this._currentSelection];
				if(entry){
					SoundManager.playOk();
					this._playEntry(entry.songId);
				}
			}
			return;
		}

		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
			SoundManager.playCancel();
			//$songManager.playSong(this._lastBGM);
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}
			return;
		}

		this.resetTouchState();
		this.refresh();
	}
}

Window_Jukebox.prototype._playEntry = function(songId) {
	this._nowPlayingSongId = songId;
	$songManager.playSong(songId);
	this._needsFullRedraw = true;
	this.requestRedraw();
}

Window_Jukebox.prototype.incrementSelection = function() {
	const listLen = this._availableSongs.length;
	if(listLen === 0){ return; }
	this._currentSelection++;
	if(this._currentSelection >= listLen){ this._currentSelection = 0; }
	SoundManager.playCursor();
}

Window_Jukebox.prototype.decrementSelection = function() {
	const listLen = this._availableSongs.length;
	if(listLen === 0){ return; }
	this._currentSelection--;
	if(this._currentSelection < 0){ this._currentSelection = listLen - 1; }
	SoundManager.playCursor();
}

Window_Jukebox.prototype._scrollToSelected = function() {
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

Window_Jukebox.prototype._updateSelectionDisplay = function() {
	const prev = this._listContainer.querySelector(".entry.selected");
	if(prev){ prev.classList.remove("selected"); }
	const next = this._listContainer.querySelector(".entry[data-idx='" + this._currentSelection + "']");
	if(next){ next.classList.add("selected"); }
	this._scrollToSelected();
}

Window_Jukebox.prototype.redraw = function() {
	if(!this._needsFullRedraw){
		this._updateSelectionDisplay();
		return;
	}
	this._needsFullRedraw = false;
	const _this = this;

	$gameTemp.buttonHintManager.setHelpButtons([["scroll_list"], ["play_jukebox_song"]]);
	$gameTemp.buttonHintManager.show();

	if(this._nowPlayingSongId){
		this._subHeader.innerHTML = APPSTRINGS.JUKEBOX.now_playing + this._getSongDisplayName(this._nowPlayingSongId);
	} else {
		this._subHeader.innerHTML = APPSTRINGS.JUKEBOX.sub_header;
	}

	let content = "";

	if(this._availableSongs.length === 0){
		content += "<div class='entry title scaled_text fitted_text'>" + APPSTRINGS.JUKEBOX.label_no_songs + "</div>";
	} else {
		this._availableSongs.forEach(function(entry, idx){
			if(idx === 0 || entry.type !== _this._availableSongs[idx - 1].type){
				const headerLabel = entry.type === "custom" ? APPSTRINGS.JUKEBOX.label_type_custom : APPSTRINGS.JUKEBOX.label_type_game;
				content += "<div class='entry group_header scaled_text fitted_text'>" + headerLabel + "</div>";
			}
			const selected = idx === _this._currentSelection;
			const nowPlaying = entry.songId === _this._nowPlayingSongId;
			content += "<div data-idx='" + idx + "' class='entry" + (selected ? " selected" : "") + (nowPlaying ? " now_playing" : "") + "'>";
			content += "<div class='label scaled_text fitted_text'>" + _this._getSongDisplayName(entry.songId) + "</div>";
			content += "<img class='play_btn scaled_width' data-play-song='" + entry.songId + "' src='svg/music-play.svg'>";
			content += "</div>";
		});
	}

	this._listContainer.innerHTML = content;
	this._scrollToSelected();

	const windowNode = this.getWindowNode();

	windowNode.querySelectorAll(".entry[data-idx]").forEach(function(entry){
		entry.addEventListener("click", function(){
			const idx = parseInt(this.getAttribute("data-idx"), 10);
			if(!isNaN(idx)){
				_this._currentSelection = idx;
				const e = _this._availableSongs[idx];
				if(e){ _this._playEntry(e.songId); }
				else { _this.requestRedraw(); }
			}
		});
	});

	windowNode.querySelectorAll(".play_btn[data-play-song]").forEach(function(btn){
		btn.addEventListener("click", function(e){
			e.stopPropagation();
			const songId = this.getAttribute("data-play-song");
			if(songId){ _this._playEntry(songId); }
		});
	});
	this.loadImages();
	Graphics._updateCanvas();

	if(this._callbacks["redraw"]){
		this._callbacks["redraw"]();
	}
}
