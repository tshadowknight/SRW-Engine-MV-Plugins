import Window_CSS from "./Window_CSS.js";
import "./style/Window_TextLog.css";

export default function Window_TextLog() {
	this.initialize.apply(this, arguments);	
}

Window_TextLog.prototype = Object.create(Window_CSS.prototype);
Window_TextLog.prototype.constructor = Window_TextLog;

Window_TextLog.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "text_log";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
	this._currentScroll = 0;	
}

Window_TextLog.prototype.resetSelection = function(){
	this._currentScroll = 0;	
}

Window_TextLog.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_TextLog.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	this._bgFadeContainer.innerHTML = "";	
}	


Window_TextLog.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
	
		
		if(Input.isTriggered('ok')){
			//$gameTemp.popMenu = true;	
		}
		
		if(Input.isPressed('down') || Input.isLongPressed('down')){
			this._currentScroll+=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._bgFadeContainer.querySelector(".log_container"), this._currentScroll);			
		}
		if(Input.isPressed('up') || Input.isLongPressed('up')){
			this._currentScroll-=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._bgFadeContainer.querySelector(".log_container"), this._currentScroll);			
		}
	
		if(Input.isTriggered('cancel') || TouchInput.isCancelled() || !$gameSystem.textLog){				
			$gameTemp.popMenu = true;	
			if($gameTemp.textLogCancelCallback){
				$gameTemp.textLogCancelCallback();
			}
		}		
		
		this.refresh();
	}		
};

Window_TextLog.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	$gameTemp.buttonHintManager.hide();
	
	if($gameSystem.textLog){
		content+="<div class='log_container styled_scroll'>";		
		
		let idx = 0;
	
		$gameSystem.textLog.forEach(function(entry){
			content+="<div class='entry'>";
			content+="<div class='portrait_preview' data-facename='"+entry.faceName+"' data-faceindex='"+entry.faceIndex+"'>";
			
			content+="</div>";
			content+="<div class='text scaled_text' data-idx='"+(idx++)+"'>";
			
			content+="</div>";
			content+="</div>";
		});		
		
		content+="</div>";
		_this._bgFadeContainer.innerHTML = content;
	}
	this.updateScaledDiv(_this._bgFadeContainer);
	this.updateScaledDiv(_this._bgFadeContainer.querySelector(".funds_gained_value"), false, true);
	this.updateScaledDiv(_this._bgFadeContainer.querySelector(".current_funds_value"), false, true);
	
	Graphics._updateCanvas();
	
	var divs = _this._bgFadeContainer.querySelectorAll(".portrait_preview");
	divs.forEach(function(div){
		_this.loadFaceByParams(div.getAttribute("data-facename"),div.getAttribute("data-faceindex"), div, true);
		_this.updateScaledDiv(div);
	});
	
	var divs = _this._bgFadeContainer.querySelectorAll(".text");
	divs.forEach(function(div){
		div.innerText = $gameSystem.textLog[div.getAttribute("data-idx")].text;
		_this.updateScaledDiv(div, true);
	});	
	this.loadImages();
	Graphics._updateCanvas();
	_this._bgFadeContainer.style.visibility = "hidden";
	setTimeout(function(){
		let logContainer = _this._bgFadeContainer.querySelector(".log_container");
		logContainer.scrollTop = logContainer.scrollHeight - logContainer.clientHeight;
		_this._currentScroll = logContainer.scrollTop;
		_this._bgFadeContainer.style.visibility = "visible";
	}, 1);
	
}

