import Window_CSS from "./Window_CSS.js";
import "./style/SaveFileList.css";

export default function SaveFileList(container, selectionProvider, opaque){
	this._container = container;
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 5;
	this._selectionProvider = selectionProvider;
	this._opaque = opaque;
	this._entries = [];
}

SaveFileList.prototype = Object.create(Window_CSS.prototype);
SaveFileList.prototype.constructor = SaveFileList;

SaveFileList.prototype.refreshEntries = function(){
	this._entries = DataManager.listSavefileEntries();
	this.resetSelection();
}

SaveFileList.prototype.getEntries = function(){
	return this._entries;
}

SaveFileList.prototype.resetSelection = function(){
	this._currentPage = 0;
	this._currentSelection = 0;
}

SaveFileList.prototype.getCurrentPageAmount = function(){
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= this._entries.length){
		return this._entries.length - start;
	} else {
		return this._maxPageSize;
	}
}

SaveFileList.prototype.getCurrentSelection = function(){
	return this._entries[this._currentSelection + this._currentPage * this._maxPageSize];
}

SaveFileList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

SaveFileList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

SaveFileList.prototype.incrementPage = function(){
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._entries.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
}

SaveFileList.prototype.decrementPage = function(){
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._entries.length == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._entries.length / this._maxPageSize) - 1;
		}
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
}

SaveFileList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.classList.add("save_file_list_control");
	this._pageDiv = document.createElement("div");
	this._pageDiv.classList.add("save_file_list_control_page");
	this._pageDiv.classList.add("scaled_text");
	if(this._opaque){
		this._listDiv.classList.add("opaque");
		this._pageDiv.classList.add("opaque");
	}
	this._container.appendChild(this._listDiv);
	this._container.appendChild(this._pageDiv);
}

SaveFileList.prototype.formatTimestamp = function(timestamp){
	if(!timestamp){
		return "";
	}
	return new Date(timestamp).toLocaleString();
}

SaveFileList.prototype.redraw = function() {
	var _this = this;

	var listContent = "";
	if(!this._entries.length){
		listContent+="<div class='save_file_row empty scaled_text'>"+APPSTRINGS.GAME_SELECTION.label_no_save_data+"</div>";
	} else {
		var pageOffset = this._currentPage * this._maxPageSize;
		for(var i = pageOffset; i < Math.min(this._entries.length, pageOffset + this._maxPageSize); i++){
			var entry = this._entries[i];
			var info = entry.info || {};
			listContent+="<div data-idx='"+(i - pageOffset)+"' class='save_file_row "+(i == this._currentSelection + pageOffset ? "selected" : "")+"'>";

			listContent+="<div class='save_file_id scaled_text'>"+entry.savefileId+"</div>";

			listContent+="<div class='save_file_details'>";
			listContent+="<div class='save_file_title scaled_text'>"+(info.title || "")+"</div>";
			listContent+="<div class='save_file_stats scaled_text'>";
			if(info.funds != null){
				listContent+="<div class='save_file_stat'>"+APPSTRINGS.SAVEMENU.label_funds+": "+info.funds+"</div>";
			}
			if(info.SRCount != null){
				listContent+="<div class='save_file_stat'>"+APPSTRINGS.SAVEMENU.label_SR_count+": "+info.SRCount+"</div>";
			}
			if(info.turnCount != null){
				listContent+="<div class='save_file_stat'>"+APPSTRINGS.SAVEMENU.label_turn_count+": "+info.turnCount+"</div>";
			}
			listContent+="</div>";
			listContent+="</div>";

			listContent+="<div class='save_file_meta scaled_text'>";
			listContent+="<div>"+(info.playtime || "")+"</div>";
			listContent+="<div>"+this.formatTimestamp(info.timestamp)+"</div>";
			listContent+="</div>";

			listContent+="</div>";
		}
	}

	this._listDiv.innerHTML = listContent;

	var maxPage = Math.ceil(this._entries.length / this._maxPageSize);
	if(maxPage < 1){
		maxPage = 1;
	}
	var pageContent = "";
	pageContent+="<img class='save_list_prev_page' src=svg/chevron_right.svg>";
	pageContent+=(this._currentPage + 1)+"/"+maxPage;
	pageContent+="<img class='save_list_next_page' src=svg/chevron_right.svg>";
	this._pageDiv.innerHTML = pageContent;

	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".save_file_row");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			var idx = this.getAttribute("data-idx");
			if(idx != null){
				idx*=1;
				if(idx == _this._currentSelection){
					_this.notifyTouchObserver("ok");
				} else {
					_this._currentSelection = idx;
					_this.notifyObserver("redraw");
				}
			}
		});
	});

	windowNode.querySelector(".save_list_prev_page").addEventListener("click", function(){
		_this.notifyTouchObserver("left");
	});

	windowNode.querySelector(".save_list_next_page").addEventListener("click", function(){
		_this.notifyTouchObserver("right");
	});
}
