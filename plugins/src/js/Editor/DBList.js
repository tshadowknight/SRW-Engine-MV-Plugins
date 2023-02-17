export default function DBList(container, data, copyHandler, callbacks){
	this._container = container;
	this._data = data;
	this._callbacks = callbacks;
	this._selectedIdx = -1;
	this._copyHandler = copyHandler;
	this._search = "";
}

DBList.prototype.getScroll = function(){
	var elem = this._container.querySelector(".scroll")
	if(elem){
		return elem.scrollTop;
	} else {
		return 0;
	}
}

DBList.prototype.setScroll = function(scroll){
	var elem = this._container.querySelector(".scroll")
	if(elem){
		elem.scrollTop = scroll;
	}
}

DBList.prototype.getSearch = function(){
	return this._search;
}

DBList.prototype.setSearch = function(search){
	this._search = search;
}

DBList.prototype.show = function(idx, isSearch){
	let _this = this;
	var content = "";
	this._selectedIdx = idx;
	
	content+="<div class='db_list'>";
	content+="<div class='list_controls'>";
	content+="<div class='label'>Max. Entries</div><input id='max_entries' value='"+(this._data.length - 1)+"'></input>";
	content+="<div class='label' id='list_search_label'>Search</div><input id='list_search' value='"+(this._search)+"'></input>";
	content+="<img title='Clear' id='clear_search' src='"+_this._copyHandler._svgPath+"close-line.svg'>";	
	content+="</div>";
	
	content+="<div class='scroll'>";
	//RPG Maker MV databases are 1-indexed
	for(var i = 1; i < this._data.length; i++){
		if(this._search == "" || this._data[i].name.toLowerCase().indexOf(this._search.toLowerCase()) != -1){		
			content+="<div class='entry "+(i == idx ? "selected" : "")+"' data-idx='"+i+"'>";
			content+=String(i).padStart(4, 0) + " " +this._data[i].name;
			if(this._data[i].meta.editorTag){
				content+= " <div class='editor_tag'>[" +this._data[i].meta.editorTag+"]</div>";
			}
			
			content+="<div class='controls' >";
			if(this._copyHandler.copyIsBuffered()){
				//content+="<button data-idx='"+i+"' class='paste'>Paste</button>";
				content+="<img title='Paste' data-idx='"+i+"' class='paste' src='"+_this._copyHandler._svgPath+"paste.svg'>";	
			}
			//content+="<button data-idx='"+i+"' class='copy'>Copy</button>";	
			content+="<img title='Copy' data-idx='"+i+"' class='copy' src='"+_this._copyHandler._svgPath+"copy.svg'>";	
			
			content+="<img title='Erase' data-idx='"+i+"' class='delete' src='"+_this._copyHandler._svgPath+"close-line.svg'>";		
			content+="</div>";
			
			content+="</div>";
		}
	}
	content+="</div>";
	content+="</div>";
	this._container.innerHTML = content;
	if(isSearch){
		var searchInput = this._container.querySelector("#list_search");		
		const end = searchInput.value.length;
		searchInput.setSelectionRange(end, end);		
		searchInput.focus();
	}	
	this.hook();
}

DBList.prototype.hook = function(){
	let _this = this;
	this._container.querySelector("#max_entries").addEventListener("change", function(){
		var newCount = this.value * 1;
		if(!isNaN(newCount) && newCount >= 1){
			var c = true;
			if(newCount < _this._data.length - 1){
				c = confirm("Reducing the entry count to this number will discard existing entries. This cannot be undone! Continue?");				
			}
			if(c){
				_this._callbacks.countChanged(newCount);
			}
		}
	});
	
	this._container.querySelector("#list_search").addEventListener("change", function(){
		_this._search = this.value;
		_this.show(null, true);
	});
	
	this._container.querySelector("#clear_search").addEventListener("click", function(){
		_this._search = "";
		_this.show(_this._selectedIdx);
	});
		
	var entries = this._container.querySelectorAll(".entry");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			_this._callbacks.selected(this.getAttribute("data-idx"));
		});
	});	
	
	var entries = this._container.querySelectorAll(".copy");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			_this._copyHandler.copyEntry(this.getAttribute("data-idx"));
		});
	});	
	
	var entries = this._container.querySelectorAll(".paste");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			_this._copyHandler.pasteEntry(this.getAttribute("data-idx"));
		});
	});	
	
	var entries = this._container.querySelectorAll(".delete");
	entries.forEach(function(entry){
		entry.addEventListener("click", function(){
			_this._copyHandler.deleteEntry(this.getAttribute("data-idx"));
		});
	});	
}