import Window_CSS from "./Window_CSS.js";
import "./style/Window_MobileDpad.css";

//currently unused

export default function Window_MobileDpad() {
	if (Window_MobileDpad._instance) {
		return Window_MobileDpad._instance;
	}
	this.initialize.apply(this, arguments);
	Window_MobileDpad._instance = this;
}

Window_MobileDpad.prototype = Object.create(Window_CSS.prototype);
Window_MobileDpad.prototype.constructor = Window_MobileDpad;

Window_MobileDpad.prototype.initialize = function() {
	var _this = this;

	this._layoutId = "mobile_dpad";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);
	if (ENGINE_SETTINGS.DISABLE_TOUCH || !Utils.isMobileDevice()) {
		this._bgFadeContainer.style.display = "none";
	}

	window.addEventListener("resize", function() {
		_this.requestRedraw();
	});

	this._visibility = "none";
	this.getWindowNode().style.display = this._visibility;
	this._hasBeenRendered = false;
	this._visibilityUpdateLock = 0;
};

Window_MobileDpad.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";
};

Window_MobileDpad.prototype.isValidForDisplay = function() {
	try {
		return $gameSystem && $gameSystem.isBattlePhase() != "AI_phase" && $gameSystem.isSubBattlePhase() != "pause_menu";
	} catch(e) {
		return false;
	}
};

Window_MobileDpad.prototype.update = function() {
	Window_Base.prototype.update.call(this);

	if (ENGINE_SETTINGS.DISABLE_TOUCH || !Utils.isMobileDevice()) {
		return;
	}

	if (this._visibilityUpdateLock > 0) {
		this._visibilityUpdateLock--;
		return;
	}

	if (!this.isValidForDisplay()) {
		this._visibility = "none";
	} else {
		this._visibility = "";
		try {
			if ($gameSystem.isIntermission()) {
				this.getWindowNode().style.opacity = 1;
			} else {
				let screenFade = $gameScreen.brightness() / 255;
				let sceneFade = SceneManager.getCurrentSceneFade() / 255;
				this.getWindowNode().style.opacity = Math.min(screenFade, sceneFade);
			}
		} catch(e) {}
	}

	if (this.isOpen() && !this._handlingInput) {
		this.refresh();
	}
};

Window_MobileDpad.prototype.refresh = function() {
	if (this._redrawRequested || !this._hasBeenRendered) {
		this._redrawRequested = false;
		this.redraw();
	}
	this.getWindowNode().style.display = this._visibility;
};

Window_MobileDpad.prototype.redraw = function() {
	var _this = this;

	if (!this.isValidForDisplay()) {
		return;
	}

	this._clearDpad();

	var content = "";

	// D-pad (left side) — arrow chars scaled via scaled_text
	content += "<div class='mobile_dpad_container' id='mobile_dpad_cross'>";
	content += "<div class='dpad_btn dpad_up scaled_text' data-dir='up'>▲</div>";
	content += "<div class='dpad_middle_row'>";
	content += "<div class='dpad_btn dpad_left scaled_text' data-dir='left'>◀</div>";
	content += "<div class='dpad_center'></div>";
	content += "<div class='dpad_btn dpad_right scaled_text' data-dir='right'>▶</div>";
	content += "</div>";
	content += "<div class='dpad_btn dpad_down scaled_text' data-dir='down'>▼</div>";
	content += "</div>";

	// Action buttons (right side) — labels scaled via scaled_text
	content += "<div class='mobile_action_container'>";
	content += "<div class='mobile_action_btn action_cancel scaled_text' id='mobile_btn_cancel'>✕</div>";
	content += "<div class='action_gap'></div>";
	content += "<div class='mobile_action_btn action_ok scaled_text' id='mobile_btn_ok'>○</div>";
	content += "</div>";

	_this._bgFadeContainer.innerHTML = content;

	// Scale all button elements to canvas size via updateScaledDiv
	_this._bgFadeContainer.querySelectorAll(".dpad_btn, .dpad_center, .mobile_action_btn").forEach(function(el) {
		_this.updateScaledDiv(el);
	});
	var actionGap = _this._bgFadeContainer.querySelector(".action_gap");
	if (actionGap) {
		_this.updateScaledDiv(actionGap, true, false); // height only
	}

	// D-pad: handle all touch on the container so sliding between directions works
	var dpadCross = _this._bgFadeContainer.querySelector("#mobile_dpad_cross");
	if (dpadCross) {
		dpadCross.addEventListener("touchstart", function(e) {
			e.preventDefault();
			for (var i = 0; i < e.changedTouches.length; i++) {
				_this._updateDpadFromTouch(e.changedTouches[i]);
			}
		}, {passive: false});
		dpadCross.addEventListener("touchmove", function(e) {
			e.preventDefault();
			for (var i = 0; i < e.changedTouches.length; i++) {
				_this._updateDpadFromTouch(e.changedTouches[i]);
			}
		}, {passive: false});
		dpadCross.addEventListener("touchend", function() {
			_this._clearDpad();
		});
		dpadCross.addEventListener("touchcancel", function() {
			_this._clearDpad();
		});
	}

	// OK button
	var okBtn = _this._bgFadeContainer.querySelector("#mobile_btn_ok");
	if (okBtn) {
		okBtn.addEventListener("touchstart", function(e) {
			e.preventDefault();
			if (!SceneManager.isSceneChanging()) {
				Input._currentState['ok'] = true;
			}
		}, {passive: false});
		okBtn.addEventListener("touchend", function() {
			Input._currentState['ok'] = false;
		});
		okBtn.addEventListener("touchcancel", function() {
			Input._currentState['ok'] = false;
		});
	}

	// Cancel button
	var cancelBtn = _this._bgFadeContainer.querySelector("#mobile_btn_cancel");
	if (cancelBtn) {
		cancelBtn.addEventListener("touchstart", function(e) {
			e.preventDefault();
			if (!SceneManager.isSceneChanging()) {
				Input._currentState['escape'] = true;
			}
		}, {passive: false});
		cancelBtn.addEventListener("touchend", function() {
			Input._currentState['escape'] = false;
		});
		cancelBtn.addEventListener("touchcancel", function() {
			Input._currentState['escape'] = false;
		});
	}

	this.updateScaledDiv(_this._bgFadeContainer);
	Graphics._updateCanvas();

	this._hasBeenRendered = true;
};

Window_MobileDpad.prototype._updateDpadFromTouch = function(touch) {
	this._clearDpad();
	var element = document.elementFromPoint(touch.clientX, touch.clientY);
	if (element) {
		var dir = element.getAttribute("data-dir");
		if (!dir && element.parentElement) {
			dir = element.parentElement.getAttribute("data-dir");
		}
		if (dir) {
			Input._currentState[dir] = true;
		}
	}
};

Window_MobileDpad.prototype._clearDpad = function() {
	Input._currentState['up'] = false;
	Input._currentState['down'] = false;
	Input._currentState['left'] = false;
	Input._currentState['right'] = false;
};
