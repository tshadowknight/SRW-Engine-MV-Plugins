import Window_CSS from "./Window_CSS.js";
import "./style/Window_MapButtons.css";

export default function Window_MapButtons() {
	this.initialize.apply(this, arguments);	
}

Window_MapButtons.prototype = Object.create(Window_CSS.prototype);
Window_MapButtons.prototype.constructor = Window_MapButtons;

Window_MapButtons.prototype.initialize = function() {
	var _this = this;
	
	this._layoutId = "map_buttons";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	if(ENGINE_SETTINGS.DISABLE_TOUCH){
		this._bgFadeContainer.style.display = "none";
	}
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_MapButtons.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_MapButtons.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){			
		this.refresh();
	}
};

Window_MapButtons.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_MapButtons.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameSystem.isSubBattlePhase() == 'rearrange_deploys'){
		content+="<div data-action='deploy' class='map_button center scaled_text' id='button_deploy'>";
		content+=APPSTRINGS.MAP_BUTTONS.label_deploy;
		content+="<div>";			
	}
	
	if($gameSystem.isSubBattlePhase() == 'normal'){
		content+="<div data-action='deploy' class='map_button menu scaled_text' id='button_menu'>";
		content+="<img src='svg/menu.svg'>"
		content+="<div>";			
	}
	
	if($gameSystem.isSubBattlePhase() == 'pause_menu'){
		content+="<div data-action='deploy' class='map_button menu active scaled_text' >";
		content+="<img src='svg/menu.svg'>"
		content+="<div>";			
	}
	_this._bgFadeContainer.innerHTML = content;	
	
	var buttonDeploy = _this._bgFadeContainer.querySelector("#button_deploy");
	if(buttonDeploy){
		var overListener = buttonDeploy.addEventListener("mouseover", function(){
			$gameSystem.setSubBattlePhase("hover_map_button");	
		});
		var leaveListener = buttonDeploy.addEventListener("mouseleave", function(){
			$gameSystem.setSubBattlePhase("rearrange_deploys");	
		});
		buttonDeploy.addEventListener("click", function(){
			//this.removeEventListener("mouseover", overListener);
			//this.removeEventListener("mouseleave", leaveListener);			
			TouchInput.clear();
			$gameSystem.setSubBattlePhase("rearrange_deploys");	
			$gameTemp.setMapButton("deploy");
			this.parentElement.removeChild(this);
		});
	}
	
	var buttonMenu = _this._bgFadeContainer.querySelector("#button_menu");
	if(buttonMenu){
		var overListener = buttonMenu.addEventListener("mouseover", function(){
			$gameSystem.setSubBattlePhase("hover_map_button");	
		});
		var leaveListener = buttonMenu.addEventListener("mouseleave", function(){
			$gameSystem.setSubBattlePhase("normal");	
		});
		buttonMenu.addEventListener("click", function(){
			//this.removeEventListener("mouseover", overListener);
			//this.removeEventListener("mouseleave", leaveListener);			
			TouchInput.clear();
			$gameSystem.setSubBattlePhase("pause_menu");	
			//$gameTemp.setMapButton("deploy");
			this.parentElement.removeChild(this);
			_this.hide();
			_this.close();
		});
	}
	this.updateScaledDiv(_this._bgFadeContainer);	
	Graphics._updateCanvas();
}

