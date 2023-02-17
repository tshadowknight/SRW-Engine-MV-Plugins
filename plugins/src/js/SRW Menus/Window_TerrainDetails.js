import Window_CSS from "./Window_CSS.js";
import "./style/Window_TerrainDetails.css";

export default function Window_TerrainDetails() {
	this.initialize.apply(this, arguments);	
}

Window_TerrainDetails.prototype = Object.create(Window_CSS.prototype);
Window_TerrainDetails.prototype.constructor = Window_TerrainDetails;

Window_TerrainDetails.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "terrain_details";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_TerrainDetails.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_TerrainDetails.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){			
		this.refresh();
	}
};

Window_TerrainDetails.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_TerrainDetails.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameTemp.terrainDetails){
		var actor = $gameTemp.summaryUnit;
		content+="<div class='terrain_details_content '>";
		
		
		content+="<div class='defense_boost terrain_boost_section scaled_text'>";
		content+="<div class='label'>";
		content+="Defense Boost:";
		content+="</div>";
		content+="<div class='value'>";
		content+=$gameTemp.terrainDetails.defense+"%";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='evasion_boost terrain_boost_section scaled_text'>";
		content+="<div class='label'>";
		content+="Evasion Boost:";
		content+="</div>";
		content+="<div class='value'>";
		content+=$gameTemp.terrainDetails.evasion+"%";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='hp_regen terrain_boost_section scaled_text'>";
		content+="<div class='label'>";
		content+="HP Regen:";
		content+="</div>";
		content+="<div class='value'>";
		content+=$gameTemp.terrainDetails.hp_regen+"%";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='en_regen terrain_boost_section scaled_text'>";
		content+="<div class='label'>";
		content+="EN Regen:";
		content+="</div>";
		content+="<div class='value'>";
		content+=$gameTemp.terrainDetails.en_regen+"%";
		content+="</div>";
		content+="</div>";
		content+="</div>";
		
		_this._bgFadeContainer.innerHTML = content;		
	}
	this.updateScaledDiv(_this._bgFadeContainer);	
	Graphics._updateCanvas();
}

