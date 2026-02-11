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
		_this.redraw();
	});
}

Window_TerrainDetails.prototype._createBoostSection = function(cssClass, labelText) {
	var section = document.createElement("div");
	section.classList.add(cssClass, "terrain_boost_section", "scaled_text");
	var label = document.createElement("div");
	label.classList.add("label");
	label.textContent = labelText + ":";
	section.appendChild(label);
	var value = document.createElement("div");
	value.classList.add("value");
	section.appendChild(value);
	return { section: section, value: value };
}

Window_TerrainDetails.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";

	this._contentContainer = document.createElement("div");
	this._contentContainer.classList.add("terrain_details_content");
	this._contentContainer.style.display = "none";
	this._bgFadeContainer.appendChild(this._contentContainer);

	var defBoost = this._createBoostSection("defense_boost", APPSTRINGS.TERRAIN_DETAILS.label_def);
	this._defenseValue = defBoost.value;
	this._contentContainer.appendChild(defBoost.section);

	var evaBoost = this._createBoostSection("evasion_boost", APPSTRINGS.TERRAIN_DETAILS.label_evasion);
	this._evasionValue = evaBoost.value;
	this._contentContainer.appendChild(evaBoost.section);

	var hpBoost = this._createBoostSection("hp_regen", APPSTRINGS.TERRAIN_DETAILS.label_hp_regen);
	this._hpRegenValue = hpBoost.value;
	this._contentContainer.appendChild(hpBoost.section);

	var enBoost = this._createBoostSection("en_regen", APPSTRINGS.TERRAIN_DETAILS.label_en_regen);
	this._enRegenValue = enBoost.value;
	this._contentContainer.appendChild(enBoost.section);
}

Window_TerrainDetails.prototype.update = function() {
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
	if($gameTemp.terrainDetails){
		this._contentContainer.style.display = "";
		this._defenseValue.textContent = $gameTemp.terrainDetails.defense + "%";
		this._evasionValue.textContent = $gameTemp.terrainDetails.evasion + "%";
		this._hpRegenValue.textContent = $gameTemp.terrainDetails.hp_regen + "%";
		this._enRegenValue.textContent = $gameTemp.terrainDetails.en_regen + "%";
	}
	this.updateScaledDiv(this._bgFadeContainer);
	Graphics._updateCanvas();
}
