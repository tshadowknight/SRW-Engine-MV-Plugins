import Window_CSS from "./Window_CSS.js";
import SaveFileList from "./SaveFileList.js";
import "./style/Window_GameSelection.css"

export default function Window_GameSelection() {
	this.initialize.apply(this, arguments);
}

Window_GameSelection.prototype = Object.create(Window_CSS.prototype);
Window_GameSelection.prototype.constructor = Window_GameSelection;

Window_GameSelection.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "game_selection";
	this._pageSize = 1;
	this._options = null;
	this._currentUIState = "chapter_selection";

	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);

	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
}

Window_GameSelection.prototype.show = function(){
	this.resetSelection();
	this._options = null;
	this._currentUIState = "chapter_selection";
	this._pendingChapter = null;
	this._messageOnDismiss = null;

    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();
	this.triggerCustomBgCreate();

	//lock input until loader has faded away
	this._handlingInput = true;
	setTimeout(() => {this._handlingInput = false}, 1000);
	this.doFadeIn();
	this._loader.classList.remove("fadeToNone");
	Graphics._updateCanvas();
}

Window_GameSelection.prototype.resetSelection = function(){
	if(!this._wasStacked){
		this._currentSelection = 0;
		this._wasStacked = false;
	}
}

Window_GameSelection.prototype.getCurrentSelection = function(){
	return this._currentSelection;
}

Window_GameSelection.prototype.resetFade = function() {
	var windowNode = this.getWindowNode();
	windowNode.removeChild(this._loader);
	windowNode.appendChild(this._loader);
}

Window_GameSelection.prototype.doFadeIn = function() {
	this.resetFade();
	this._loader.classList.add("doFade");
}

Window_GameSelection.prototype.doFadeOut = function() {
	this.resetFade();
	this._loader.classList.add("fadeToNone");
}

Window_GameSelection.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);

	var windowNode = this.getWindowNode();

	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.GAME_SELECTION.title;
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);

	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);

	this._instructionContainer = document.createElement("div");
	this._instructionContainer.classList.add("instruction_container");
	this._instructionContainer.classList.add("scaled_text");
	this._instructionContainer.innerHTML = APPSTRINGS.GAME_SELECTION.instructions;
	windowNode.appendChild(this._instructionContainer);

	this._saveSelectContainer = document.createElement("div");
	this._saveSelectContainer.classList.add("save_select_container");
	this._saveSelectContainer.style.display = "none";
	windowNode.appendChild(this._saveSelectContainer);

	this._saveSelectHeader = document.createElement("div");
	this._saveSelectHeader.classList.add("save_select_header");
	this._saveSelectHeader.classList.add("scaled_text");
	this._saveSelectHeader.innerHTML = APPSTRINGS.GAME_SELECTION.save_selection_title;
	this._saveSelectContainer.appendChild(this._saveSelectHeader);

	this._saveSelectListContainer = document.createElement("div");
	this._saveSelectListContainer.classList.add("save_select_list");
	this._saveSelectContainer.appendChild(this._saveSelectListContainer);

	//the chapter background pictures show through anything translucent, so all of the overlays are drawn fully opaque
	this._saveFileList = new SaveFileList(this._saveSelectListContainer, this, true);
	this._saveFileList.createComponents();
	this._saveFileList.registerTouchObserver("ok", function(){_this._touchOK = true;});
	this._saveFileList.registerTouchObserver("left", function(){_this._touchLeft = true;});
	this._saveFileList.registerTouchObserver("right", function(){_this._touchRight = true;});
	this._saveFileList.registerObserver("redraw", function(){_this.requestRedraw();});

	this._confirmContainer = document.createElement("div");
	this._confirmContainer.classList.add("confirm_container");
	this._confirmContainer.style.display = "none";
	windowNode.appendChild(this._confirmContainer);

	this._messageContainer = document.createElement("div");
	this._messageContainer.classList.add("message_container");
	this._messageContainer.style.display = "none";
	windowNode.appendChild(this._messageContainer);

	this._loader = document.createElement("div");
	this._loader.classList.add("loader");
	windowNode.appendChild(this._loader);

}

Window_GameSelection.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);

	if(this.isOpen() && !this._handlingInput){

		//the sub states consume all input so the chapter list below never sees it
		if(this._currentUIState == "message"){
			if(Input.isTriggered('ok') || Input.isTriggered('cancel') || this._touchOK || TouchInput.isCancelled()){
				SoundManager.playOk();
				this.dismissMessage();
			}
			this.resetTouchState();
			this.refresh();
			return;
		}

		if(this._currentUIState == "carry_ask"){
			if(Input.isTriggered('left') || Input.isTriggered('right')){
				this._confirmSelection = this._confirmSelection === 0 ? 1 : 0;
				SoundManager.playCursor();
				this.renderConfirm();
			} else if(Input.isTriggered('ok') || this._touchOK){
				SoundManager.playOk();
				if(this._confirmSelection === 0){
					this.enterSaveSelection();
				} else {
					this.startSelectedChapter(this._pendingChapter);
				}
			} else if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
				SoundManager.playCancel();
				this.enterChapterSelection();
			}
			this.resetTouchState();
			this.refresh();
			return;
		}

		if(this._currentUIState == "save_selection"){
			if(Input.isTriggered('down') || Input.isRepeated('down')){
				this._saveFileList.incrementSelection();
				SoundManager.playCursor();
				this.requestRedraw();
			} else if(Input.isTriggered('up') || Input.isRepeated('up')){
				this._saveFileList.decrementSelection();
				SoundManager.playCursor();
				this.requestRedraw();
			} else if(Input.isTriggered('right') || Input.isRepeated('right') || this._touchRight){
				this._saveFileList.incrementPage();
				SoundManager.playCursor();
				this.requestRedraw();
			} else if(Input.isTriggered('left') || Input.isRepeated('left') || this._touchLeft){
				this._saveFileList.decrementPage();
				SoundManager.playCursor();
				this.requestRedraw();
			} else if(Input.isTriggered('ok') || this._touchOK){
				SoundManager.playOk();
				this.confirmSaveSelection();
			} else if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
				SoundManager.playCancel();
				this.enterCarryAsk(this._pendingChapter);
			}
			this.resetTouchState();
			this.refresh();
			return;
		}

		if(this._options && this._options.length && !this._closing){
			if(Input.isTriggered('right') || Input.isRepeated('right')){
				this.requestRedraw();
				this._currentSelection++;
				if(this._currentSelection >= this._options.length){
					this._currentSelection = 0;
				}
				SoundManager.playCursor();
				this.refresh();
				return;

			} else if (Input.isTriggered('left') || Input.isRepeated('left')) {
				this.requestRedraw();
				this._currentSelection--;
				if(this._currentSelection < 0){
					this._currentSelection = this._options.length - 1;
				}
				SoundManager.playCursor();
				this.refresh();
				return;
			}
		}

		if(Input.isTriggered('ok') || this._touchOK){
			if(this._options && this._options.length && !this._closing){
				const selection = this.getCurrentSelection();
				SoundManager.playOk();
				if($gameSystem.getChapterCarryOver(selection)){
					this.enterCarryAsk(selection);
				} else {
					this.startSelectedChapter(selection);
				}
			}
		}

		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
			if(!this._closing && $gameTemp.gameSelectionAllowCancel){
				if(this._callbacks["closed"]){
					this._closing = true;
					this.doFadeOut();
					setTimeout(() => {$gameTemp.buttonHintManager.hide(); $gameTemp.popMenu = true; this._closing = false; this._callbacks["closed"]();}, 1000);
				}
			}
		}
		this.resetTouchState();
		this.refresh();
	}
};

Window_GameSelection.prototype.enterChapterSelection = function() {
	this._currentUIState = "chapter_selection";
	this._pendingChapter = null;
	this.requestRedraw();
}

Window_GameSelection.prototype.enterCarryAsk = function(chapterIdx) {
	this._currentUIState = "carry_ask";
	this._pendingChapter = chapterIdx;
	this._confirmSelection = 0;
	this.requestRedraw();
}

//keepSelection is used when returning to the list after a failed carry over, so the cursor stays where the player left it
Window_GameSelection.prototype.enterSaveSelection = function(keepSelection) {
	if(!keepSelection){
		this._saveFileList.refreshEntries();
		if(!this._saveFileList.getEntries().length){
			this.showMessage(APPSTRINGS.GAME_SELECTION.label_no_save_data, () => {
				this.enterCarryAsk(this._pendingChapter);
			});
			return;
		}
	}
	this._currentUIState = "save_selection";
	this.requestRedraw();
}

Window_GameSelection.prototype.confirmSaveSelection = function() {
	const entry = this._saveFileList.getCurrentSelection();
	const chapterIdx = this._pendingChapter;
	const saveContents = entry ? DataManager.loadPackedSaveFile(entry.savefileId) : null;

	if(!saveContents){
		this.showMessage(APPSTRINGS.GAME_SELECTION.msg_carry_over_failed, () => {
			this.enterSaveSelection(true);
		});
		return;
	}

	if(!$gameSystem.validateCarryOverSave(chapterIdx, saveContents)){
		this.showMessage(APPSTRINGS.GAME_SELECTION.msg_carry_over_invalid, () => {
			this.enterSaveSelection(true);
		});
		return;
	}

	if(!$gameSystem.applyCarryOver(chapterIdx, saveContents)){
		this.showMessage(APPSTRINGS.GAME_SELECTION.msg_carry_over_failed, () => {
			this.enterSaveSelection(true);
		});
		return;
	}

	this.showMessage(APPSTRINGS.GAME_SELECTION.msg_carry_over_success, () => {
		this.startSelectedChapter(chapterIdx);
	});
}

Window_GameSelection.prototype.showMessage = function(message, onDismiss) {
	this._currentUIState = "message";
	this._message = message;
	this._messageOnDismiss = onDismiss;
	this.requestRedraw();
}

Window_GameSelection.prototype.dismissMessage = function() {
	const onDismiss = this._messageOnDismiss;
	this._messageOnDismiss = null;
	if(onDismiss){
		onDismiss();
	} else {
		this.enterChapterSelection();
	}
}

Window_GameSelection.prototype.startSelectedChapter = function(chapterIdx) {
	if(this._closing){
		return;
	}
	this._closing = true;
	this._currentUIState = "chapter_selection";
	this.requestRedraw();
	this.refresh();
	this.doFadeOut();
	setTimeout(() => {
		$gameTemp.buttonHintManager.hide();
		if(this._callbacks["confirmed"]){
			this._callbacks["confirmed"](chapterIdx);
		}
		$gameTemp.doingGameSelection = false;
		$gameTemp.popMenu = true;
		this._closing = false;
	}, 1000);
}

Window_GameSelection.prototype.renderConfirm = function() {
	var _this = this;
	this._confirmContainer.innerHTML = this.createConfirmContent(APPSTRINGS.GAME_SELECTION.carry_over_question, this._confirmSelection, true);
	this._confirmContainer.querySelector(".ok_button").addEventListener("click", function(){
		_this._confirmSelection = 0;
		_this._touchOK = true;
	});
	this._confirmContainer.querySelector(".cancel_button").addEventListener("click", function(){
		_this._confirmSelection = 1;
		_this._touchOK = true;
	});
	Graphics._updateCanvas();
}

Window_GameSelection.prototype.renderMessage = function() {
	var _this = this;
	this._messageContainer.innerHTML = this.createMessageContent(this._message, true);
	this._messageContainer.querySelector(".ok_button").addEventListener("click", function(){
		_this._touchOK = true;
	});
	Graphics._updateCanvas();
}

Window_GameSelection.prototype.redraw = function() {
	var _this = this;

	if(this._currentUIState == "message"){
		$gameTemp.buttonHintManager.setHelpButtons([["confim_text"]]);
	} else if(this._currentUIState == "save_selection"){
		$gameTemp.buttonHintManager.setHelpButtons([["scroll_list"], ["page_nav"], ["confirm_selection"]]);
	} else {
		$gameTemp.buttonHintManager.setHelpButtons([["select_option_lr"], ["confirm_option"]]);
	}
	$gameTemp.buttonHintManager.show();

	var content = "";

	if(!this._options){
		this._options = $gameSystem.getChapterList();
	}

	//participant.imgElem.setAttribute("data-img", _this.makeImageURL(participant.img));

	if(this._options.length){
		const entryHeight = 1 / this._options.length * 100;
		for(let i = 0; i < this._options.length; i++){
			const entry = this._options[i];
			content+="<div data-idx='"+i+"' class='chapter_entry "+(i == this.getCurrentSelection() ? "selected" : "")+"'>";

			content+="<div class='content'>";

			if(entry.bgPicture){
				content+="<div class='bg_picture img_bg' style='' data-img='img/pictures/"+entry.bgPicture+"'></div>";
			}

			content+="<div class='text_container'>";
			content+="<div class='title scaled_text' style='color: "+(entry.color || "#FFFFFF")+";'>";
			content+=entry.name;
			content+="</div>";
			content+="<div class='description scaled_text'>";
			content+=entry.description || "";
			content+="</div>";
			content+="</div>";
			content+="</div>";

			content+="</div>";
		}
	}

	this._listContainer.innerHTML = content;

	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".chapter_entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			_this._currentSelection = Number(this.getAttribute("data-idx"));
			_this._touchOK = true;
		});
		entry.addEventListener("mousemove", function(){
			const targetIdx = Number(this.getAttribute("data-idx"));
			if(targetIdx != _this._currentSelection){
				_this._currentSelection = targetIdx;
				_this.requestRedraw();
			}
		});
	});

	if(this._currentUIState == "carry_ask"){
		this.renderConfirm();
		this._confirmContainer.style.display = "";
	} else {
		this._confirmContainer.style.display = "none";
	}

	if(this._currentUIState == "message"){
		this.renderMessage();
		this._messageContainer.style.display = "";
	} else {
		this._messageContainer.style.display = "none";
	}

	if(this._currentUIState == "save_selection"){
		this._saveFileList.redraw();
		this._saveSelectContainer.style.display = "";
	} else {
		this._saveSelectContainer.style.display = "none";
	}

	this.loadImages();
	Graphics._updateCanvas();
}
