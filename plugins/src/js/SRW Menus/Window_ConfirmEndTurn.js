import Window_CSS from "./Window_CSS.js";
import "./style/Window_ConfirmEndTurn.css";

export default function Window_ConfirmEndTurn() {
	this.initialize.apply(this, arguments);	
}

Window_ConfirmEndTurn.prototype = Object.create(Window_CSS.prototype);
Window_ConfirmEndTurn.prototype.constructor = Window_ConfirmEndTurn;

Window_ConfirmEndTurn.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "confirm_end_turn";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
	this._currentSelection = 0;	
}

Window_ConfirmEndTurn.prototype.resetSelection = function(){
	this._currentSelection = 1;
}

Window_ConfirmEndTurn.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_ConfirmEndTurn.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){			
		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			this._currentSelection--;
			if(this._currentSelection < 0){
				this._currentSelection = 1;
			}
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			this._currentSelection++;
			if(this._currentSelection > 1){
				this._currentSelection = 0;
			}
		} else if(Input.isTriggered('ok') || this._touchOK){
			$gameTemp.popMenu = true;
			SoundManager.playOk();
			if(this._callbacks.selected){
				this._callbacks.selected(!this._currentSelection);
			}
		} else if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			$gameTemp.popMenu = true;
			SoundManager.playCancel();
			if(this._callbacks.selected){
				this._callbacks.selected(false);
			}
		}
		this.refresh();
	}			
};

Window_ConfirmEndTurn.prototype.redraw = function() {	
	var _this = this;
	var content = "";

	content+="<div class='confirm_end_turn_content scaled_text'>";
	content+="<div class='question'>";
	var activeActors = $gameSystem.getActorsWithAction().length;
	var label;
	if(activeActors == 1){
		label = APPSTRINGS.GENERAL.label_ask_end_turn_single;
	} else {
		label = APPSTRINGS.GENERAL.label_ask_end_turn_multi;
	}
	
	content+="<div class='label_unit_count'>"+activeActors+"</div>"+label;
	content+="</div>";
	content+="<div class='buttons'>";
	content+="<div class='button ok_button "+(_this._currentSelection == 0 ? "active" : "")+"'>";
	content+=APPSTRINGS.GENERAL.label_yes;
	content+="</div>";
	content+="<div class='button cancel_button "+(_this._currentSelection == 1 ? "active" : "")+"'>";
	content+=APPSTRINGS.GENERAL.label_no;
	content+="</div>";
	content+="</div>";
	content+="</div>";
	_this._bgFadeContainer.innerHTML = content;
	this.updateScaledDiv(_this._bgFadeContainer.querySelector(".confirm_end_turn_content"));
	
	var windowNode = this.getWindowNode();
	windowNode.querySelector(".ok_button").addEventListener("click", function(){
		_this._currentSelection = 0;
		_this._touchOK = true;
	});
	windowNode.querySelector(".cancel_button").addEventListener("click", function(){
		_this._currentSelection = 1;
		_this._touchOK = true;
	});
	
	Graphics._updateCanvas();
}

