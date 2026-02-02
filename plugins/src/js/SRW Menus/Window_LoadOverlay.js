import Window_CSS from "./Window_CSS.js";

export default function Window_LoadOverlay() {
	this.initialize.apply(this, arguments);	
}

Window_LoadOverlay.prototype = Object.create(Window_CSS.prototype);
Window_LoadOverlay.prototype.constructor = Window_LoadOverlay;

Window_LoadOverlay.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "load_overlay";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
	this._currentScroll = 0;	
}

Window_LoadOverlay.prototype.resetSelection = function(){
	this._currentScroll = 0;	
}

Window_LoadOverlay.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_LoadOverlay.prototype.createComponents = function() {
	var windowNode = this.getWindowNode();
	
	windowNode.style.display = "none";
	windowNode.style.backgroundColor = "#000";
}	


Window_LoadOverlay.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	var windowNode = this.getWindowNode();

	if($gameTemp.loadingIntoSaveCtr > 0){
		windowNode.style.display = "block";
	} else {
		windowNode.style.display = "none";
	}
};

Window_LoadOverlay.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	
}

