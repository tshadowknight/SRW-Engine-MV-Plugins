import EditorUI from "./EditorUI.js";
import DBList from "./DBList.js";


export default function PatternUI(container, mainUIHandler){
	EditorUI.call(this, container, mainUIHandler);
	this._dataFile = "data/Patterns.json";
}

PatternUI.prototype = Object.create(EditorUI.prototype);
PatternUI.prototype.constructor = PatternUI;

PatternUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	var containerNode = _this._container;
}

PatternUI.prototype.unpackTiles = async function(){
	this._currentShapeLookup = {};
	var currentEntry = this.getCurrentEntry();
	if(currentEntry){
		for(let tile of currentEntry.tiles){
			let x = tile.x;
			let y = tile.y;
			if(!this._currentShapeLookup[x]){
				this._currentShapeLookup[x] = {};
			}
			if(!this._currentShapeLookup[x][y]){
				this._currentShapeLookup[x][y] = true;
			}
		}	
	}	
}

PatternUI.prototype.packTiles = function(){
	var _this = this;
	var currentEntry = this.getCurrentEntry();
	var tmp = [];
	Object.keys(_this._currentShapeLookup).forEach(function(x){
		Object.keys(_this._currentShapeLookup[x]).forEach(function(y){
			tmp.push({x: x, y: y});
		});
	});
	
	currentEntry.tiles = tmp;
}

PatternUI.prototype.show = async function(){
	let _this = this;
	_this.loadData();
	var listScroll = 0;
	if(this._dbList){
		listScroll = this._dbList.getScroll();
	}
	var currentScroll;
	var scrollContainer = document.querySelector(".edit_pane .main_info");
	if(scrollContainer){
		currentScroll = scrollContainer.scrollTop;
	}
	
	var currentEntry = this.getCurrentEntry();
	this.unpackTiles();
	var content = "";
	content+="<div class='editor_ui'>";
	content+="<div class='list_pane'>";
	
	content+="</div>";
	content+="<div class='edit_pane'>";
	content+="<div class='controls'>";
	content+="<button class='cancel'>Cancel</button>";
	content+="<button class='save'>Save</button>";	
	content+="</div>";
	content+="<div class='main_info'>";
	
	content+="<div class='row'>";
	
	
	
	content+="<div class='section'>";
	content+="<div class='title abilities'>";
	content+="General";	
	content+="</div>";
	content+="<div class='content'>";
	
	content+="<div class='row'>";
	content+="<div class='cell'>";
	content+="Name";
	content+="</div>";
	content+="<div class='cell'>";
	content+="<input id='prop_name' value='"+(currentEntry ? currentEntry.name : "")+"'></input>";
	
	var previewRows = 31;
	var previewColumns = 31;
	
	var centerX = 15;
	var centerY = 15;
	
	content+="<div class='map_edit_pane_container'>";
	content+="<div id='main_shape' class='map_edit_pane'>";
	for(var row = 0; row < previewRows; row++){
		content+="<div class='row'>";
		for(var column = 0; column < previewColumns; column++){
			var x = row - centerX;
			var y = column - centerY;	
			
			var classString = "block ";
			if(_this._currentShapeLookup[y] && _this._currentShapeLookup[y][x]){
				classString+="selected ";
			}
			if(x == 0 && y == 0){
				classString+="center ";
			}
			content+="<div data-row='"+(x)+"' data-column='"+(y)+"' class='"+classString+"'>";
			
			content+="</div>";
		}
		content+="</div>";
	}
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	
	this._container.innerHTML = content;
	var search = "";
	if(this._dbList){
		search = this._dbList.getSearch();
	}
	this._dbList = new DBList(
		this._container.querySelector(".list_pane"), 
		this._data, 
		this,
		{
			selected: function(id){
				_this._currentId = id;
				_this.show();
			},
			countChanged: function(amount){
				
				var tmp = [];
				for(var i = 0; i < amount + 1; i++){
					let blankEntry = _this.getEmpty(i);
					tmp.push(_this._data[i] || blankEntry);
				}
				_this._data = tmp;
				_this.show();
				_this._mainUIHandler.setModified();
			}
		}
	);
	this._dbList.setSearch(search);
	this._dbList.show(_this._currentId);
	if(listScroll){
		this._dbList.setScroll(listScroll);
	}
	
	document.querySelector(".edit_pane .main_info").scrollTop = currentScroll;
	this.hook();
	
}


PatternUI.prototype.hook = function(){
	let _this = this;
	_this._container.querySelector(".edit_pane .controls .save").addEventListener("click", function(){
		_this.save();
		_this._mainUIHandler.clearModified();
	});
	
	_this._container.querySelector(".edit_pane .controls .cancel").addEventListener("click", function(){
		var c = true;
		if(_this._mainUIHandler.isModified()){
			c = confirm("Discard all unsaved changes?");
		}
		if(c){
			_this._data = null;
			_this.show();	
			_this._mainUIHandler.clearModified();
		}		
	});
	
	_this._container.querySelector("#prop_name").addEventListener("change", function(){
		let currentEntry = _this.getCurrentEntry();
		currentEntry.name = this.value;
		_this.show();
		_this._mainUIHandler.setModified();
	});
	
	var controls = this._container.querySelectorAll("#main_shape .block");
	controls.forEach(function(control){
		control.addEventListener("click", function(){
			var column = this.getAttribute("data-column") * 1;
			var row = this.getAttribute("data-row") * 1;
			
			if(_this._currentShapeLookup[column] && _this._currentShapeLookup[column][row]){
				delete _this._currentShapeLookup[column][row];
			} else {
				if(!_this._currentShapeLookup[column]){
					_this._currentShapeLookup[column] = {};
				}
				_this._currentShapeLookup[column][row] = true;
			}
			_this.packTiles();
			_this.show();
						
		});
	});
	
	_this.hookPageControls();
}

PatternUI.prototype.hookPageControls = function(){
	let _this = this;

	
}
			
PatternUI.prototype.getEmpty = function(id){
	return {
	  "id": id,
	  "name": "",
	  "tiles": [],
	  "meta": {}
	};
}			
		