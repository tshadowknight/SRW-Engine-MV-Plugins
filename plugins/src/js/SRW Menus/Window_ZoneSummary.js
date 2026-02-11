import Window_CSS from "./Window_CSS.js";
import "./style/Window_ZoneSummary.css";

export default function Window_ZoneSummary() {
	this.initialize.apply(this, arguments);
}

Window_ZoneSummary.prototype = Object.create(Window_CSS.prototype);
Window_ZoneSummary.prototype.constructor = Window_ZoneSummary;

Window_ZoneSummary.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "zone_summary";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);
	window.addEventListener("resize", function(){
		_this.redraw();
	});
}

Window_ZoneSummary.prototype._createEntrySlot = function() {
	var entry = document.createElement("div");
	entry.classList.add("entry");
	entry.style.display = "none";

	var label = document.createElement("div");
	label.classList.add("label", "scaled_text", "fitted_text");
	entry.appendChild(label);

	var levelIndic = document.createElement("div");
	levelIndic.classList.add("level_indic", "scaled_text", "fitted_text");
	entry.appendChild(levelIndic);

	return { container: entry, label: label, levelIndic: levelIndic };
}

Window_ZoneSummary.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";

	this._contentContainer = document.createElement("div");
	this._contentContainer.classList.add("zone_summary_content");
	this._bgFadeContainer.appendChild(this._contentContainer);

	// Pre-create 4 entry slots (max 3 normal + 1 overflow "...")
	this._entrySlots = [];
	for (var i = 0; i < 4; i++) {
		var slot = this._createEntrySlot();
		this._contentContainer.appendChild(slot.container);
		this._entrySlots.push(slot);
	}
}

Window_ZoneSummary.prototype.update = function() {
	Window_Base.prototype.update.call(this);

	if(this.isOpen() && !this._handlingInput){
		this.refresh();
	}
};

Window_ZoneSummary.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_ZoneSummary.prototype.redraw = function() {
	var zoneInfo = $gameSystem.getActiveZonesAtTile({x: $gamePlayer.posX(), y: $gamePlayer.posY()});
	var stackCount = zoneInfo.length;

	var slotIdx = 0;
	var ctr = 0;
	for (var i = 0; i < zoneInfo.length; i++) {
		var entry = zoneInfo[i];
		var displayInfo = $abilityZoneManager.getAbilityDisplayInfo(entry.abilityId);
		var actorInfo = $gameSystem.EventToUnit(entry.ownerEventId);
		if (actorInfo) {
			var isFriendly = $gameSystem.isFriendly(actorInfo[1], "player");
			if (stackCount <= 4 || ctr < 3) {
				var slot = this._entrySlots[slotIdx];
				slot.container.style.display = "";
				slot.container.className = "entry" + (isFriendly ? " friendly" : "");
				slot.label.textContent = displayInfo.name;
				slot.levelIndic.style.display = "";
				slot.levelIndic.textContent = APPSTRINGS.ZONE_STATUS.label_level + Math.min(stackCount, displayInfo.upgradeCount);
				slotIdx++;
			} else if (ctr == 3) {
				var slot = this._entrySlots[slotIdx];
				slot.container.style.display = "";
				slot.container.className = "scaled_text fitted_text entry";
				slot.label.textContent = "...";
				slot.levelIndic.style.display = "none";
				slotIdx++;
			}
			ctr++;
		}
	}

	// Hide unused slots
	for (var i = slotIdx; i < 4; i++) {
		this._entrySlots[i].container.style.display = "none";
	}

	this.updateScaledDiv(this._bgFadeContainer);
	Graphics._updateCanvas();
}
