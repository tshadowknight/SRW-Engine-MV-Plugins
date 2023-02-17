function JSONLoader(){	
	var _this = this	
	this.load();
}

JSONLoader.prototype.load = function(onload, onerror){
	var _this = this
	_this._isLoaded = new Promise(function(resolve, reject){
		_this._resolveLoad = resolve;
	});
	this.loadDefinitions(			
		function(data){
			_this.processDefinitions(data)
		},
		function(){
			alert("Error while loading data/"+_this._sourceFile+".json");
		}
	);
}

JSONLoader.prototype.isLoaded = async function(){
	await this._isLoaded;
}

JSONLoader.prototype.loadDefinitions = function(onload, onerror){
	var xhr = new XMLHttpRequest();
	var url = 'data/'+this._sourceFile+'.json';
	xhr.open('GET', url);
	xhr.overrideMimeType('application/json');
	xhr.onload = function() {
		if (xhr.status < 400) {
			onload(JSON.parse(xhr.responseText));            
		} else {
			onload({});
		}
	};
	xhr.onerror = onerror;
	window[name] = null;
	xhr.send();
}

JSONLoader.prototype.processDefinitions = function(data){
	var _this = this;	
	_this._data = data;	
	_this._resolveLoad();	
}

JSONLoader.prototype.getData = function(){
	return this._data || {};
}