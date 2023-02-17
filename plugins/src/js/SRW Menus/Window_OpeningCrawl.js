import Window_CSS from "./Window_CSS.js";
import "./style/Window_OpeningCrawl.css";

export default function Window_OpeningCrawl() {
	this.initialize.apply(this, arguments);	
}

Window_OpeningCrawl.prototype = Object.create(Window_CSS.prototype);
Window_OpeningCrawl.prototype.constructor = Window_OpeningCrawl;

Window_OpeningCrawl.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "opening_crawl";	
	this._counter = 0;
	this._startOffset = 105;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_OpeningCrawl.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	this._text = document.createElement("div");
	this._text.id = this.createId("text");
	this._text.classList.add("scaled_text");
	
	this._text.style.top = this._startOffset + "%";
	windowNode.appendChild(this._text);
	
}

Window_OpeningCrawl.prototype.show = function() {
	//this.resetSelection();
	this._counter = 0;
	this._text.innerHTML = APPSTRINGS.TEXT_CRAWLS[$gameTemp.textCrawlId] || "ERROR: text crawl '"+$gameTemp.textCrawlId+"' not found!";	
	this._handlingInput = false;
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();	
	Graphics._updateCanvas();
};

Window_OpeningCrawl.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
		this._counter+=1*$gameTemp.textCrawlSpeed;
		if(Input.isPressed('ok') || TouchInput.isPressed()){			
			this._counter+=4*$gameTemp.textCrawlSpeed;
			if(Input.isPressed('pagedown')){
				this._counter+=16*$gameTemp.textCrawlSpeed;
			}
		}
		var step = Math.floor(this._counter / 1);
		var currentOffset = Math.floor((this._startOffset - (0.1 * step)) * 1000) / 1000;	
		
		this._text.style.top = currentOffset + "%";
		
		var endReached = false;
		var windowNode = this.getWindowNode();
		var windowRect = windowNode.getBoundingClientRect();
		
		var textRect = this._text.getBoundingClientRect();
		
		var targetHeight = Math.floor(windowRect.height / 8);
		if(textRect.bottom < 0 && textRect.bottom * -1 > targetHeight){
			endReached = true;
		}		
		
		if(endReached || ($gameTemp.canCancelTextCrawl && (Input.isTriggered('cancel') || TouchInput.isCancelled()))){				
			//$gameTemp.popMenu = true;	
			$gameTemp.popMenu = true;	
			$gameTemp.doingOpeningCrawl = false;
		}
		
		this.refresh();
	}		
};


Window_OpeningCrawl.prototype.redraw = function() {	
	var _this = this;
		
	Graphics._updateCanvas();
}

