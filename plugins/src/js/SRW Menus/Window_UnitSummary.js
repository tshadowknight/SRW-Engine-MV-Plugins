import Window_CSS from "./Window_CSS.js";
import "./style/Window_UnitSummary.css";

export default function Window_UnitSummary() {
	this.initialize.apply(this, arguments);
}

Window_UnitSummary.prototype = Object.create(Window_CSS.prototype);
Window_UnitSummary.prototype.constructor = Window_UnitSummary;

Window_UnitSummary.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "unit_summary";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
}

Window_UnitSummary.prototype._createActorBlock = function(idx) {
	var comp = {};

	comp.container = document.createElement("div");
	comp.container.setAttribute("data-idx", idx);
	comp.container.classList.add("unit_summary_inner", "block_" + (idx + 1));

	// Pilot row
	var pilotRow = document.createElement("div");
	pilotRow.setAttribute("data-idx", idx);
	pilotRow.classList.add("row");

	comp.pilotIcon = document.createElement("div");
	comp.pilotIcon.setAttribute("data-idx", idx);
	comp.pilotIcon.classList.add("unit_summary_icon");
	pilotRow.appendChild(comp.pilotIcon);

	comp.shipIcon = document.createElement("img");
	comp.shipIcon.classList.add("ship_icon");
	comp.shipIcon.src = "svg/anchor.svg";
	comp.shipIcon.style.display = "none";
	pilotRow.appendChild(comp.shipIcon);

	comp.summary = document.createElement("div");
	comp.summary.setAttribute("data-idx", idx);
	comp.summary.classList.add("summary");

	// Pilot stats row 1: name + level
	var pilotStats1 = document.createElement("div");
	pilotStats1.classList.add("pilot_stats", "scaled_text");

	comp.pilotName = document.createElement("div");
	comp.pilotName.classList.add("pilot_name", "scaled_text", "fitted_text");
	pilotStats1.appendChild(comp.pilotName);

	var levelDiv = document.createElement("div");
	levelDiv.classList.add("level", "scaled_width");
	var levelLabel = document.createElement("div");
	levelLabel.classList.add("label");
	levelLabel.textContent = APPSTRINGS.GENERAL.label_level;
	levelDiv.appendChild(levelLabel);
	comp.levelValue = document.createElement("div");
	comp.levelValue.classList.add("value");
	levelDiv.appendChild(comp.levelValue);
	pilotStats1.appendChild(levelDiv);

	comp.summary.appendChild(pilotStats1);

	// Pilot stats row 2: will + score
	var pilotStats2 = document.createElement("div");
	pilotStats2.classList.add("pilot_stats", "scaled_text");

	var willDiv = document.createElement("div");
	willDiv.classList.add("will", "scaled_width");
	var willLabel = document.createElement("div");
	willLabel.classList.add("label");
	willLabel.textContent = APPSTRINGS.GENERAL.label_will;
	willDiv.appendChild(willLabel);
	comp.willValue = document.createElement("div");
	comp.willValue.classList.add("value");
	willDiv.appendChild(comp.willValue);
	pilotStats2.appendChild(willDiv);

	comp.scoreDiv = document.createElement("div");
	comp.scoreDiv.classList.add("score", "scaled_width");
	var scoreLabel = document.createElement("div");
	scoreLabel.classList.add("label");
	scoreLabel.textContent = APPSTRINGS.GENERAL.label_score;
	comp.scoreDiv.appendChild(scoreLabel);
	comp.scoreValue = document.createElement("div");
	comp.scoreValue.classList.add("value");
	comp.scoreDiv.appendChild(comp.scoreValue);
	comp.scoreDiv.style.display = "none";
	pilotStats2.appendChild(comp.scoreDiv);

	comp.summary.appendChild(pilotStats2);

	pilotRow.appendChild(comp.summary);

	// Hit display
	comp.hitDisplay = document.createElement("div");
	comp.hitDisplay.classList.add("hit_display", "scaled_text");
	comp.hitDisplay.style.display = "none";
	pilotRow.appendChild(comp.hitDisplay);

	// Status display
	comp.statusDisplay = document.createElement("div");
	comp.statusDisplay.classList.add("status_display");
	comp.statusDisplay.style.display = "none";
	var statusImg = document.createElement("img");
	statusImg.classList.add("scaled_width");
	statusImg.src = "svg/hazard-sign.svg";
	comp.statusDisplay.appendChild(statusImg);
	pilotRow.appendChild(comp.statusDisplay);

	comp.container.appendChild(pilotRow);

	// Mech row
	var mechRow = document.createElement("div");
	mechRow.setAttribute("data-idx", idx);
	mechRow.classList.add("row");

	comp.mechIcon = document.createElement("div");
	comp.mechIcon.setAttribute("data-idx", idx);
	comp.mechIcon.classList.add("unit_summary_mech_icon");
	comp.mechImg = document.createElement("img");
	comp.mechIcon.appendChild(comp.mechImg);
	mechRow.appendChild(comp.mechIcon);

	comp.summaryMech = document.createElement("div");
	comp.summaryMech.setAttribute("data-idx", idx);
	comp.summaryMech.classList.add("summary_mech");

	comp.mechName = document.createElement("div");
	comp.mechName.classList.add("mech_name", "scaled_text", "fitted_text");
	comp.summaryMech.appendChild(comp.mechName);

	comp.mechStatsContainer = document.createElement("div");
	comp.mechStatsContainer.classList.add("mech_stats_container");

	var hpEnContainer = document.createElement("div");
	hpEnContainer.classList.add("mech_hp_en_container", "scaled_text");

	var hpLabel = document.createElement("div");
	hpLabel.classList.add("hp_label", "scaled_text");
	hpLabel.textContent = APPSTRINGS.GENERAL.label_HP;
	hpEnContainer.appendChild(hpLabel);

	var enLabel = document.createElement("div");
	enLabel.classList.add("en_label", "scaled_text");
	enLabel.textContent = APPSTRINGS.GENERAL.label_EN;
	hpEnContainer.appendChild(enLabel);

	// HP display
	var hpDisplay = document.createElement("div");
	hpDisplay.classList.add("hp_display");
	comp.currentHP = document.createElement("div");
	comp.currentHP.classList.add("current_hp", "scaled_text");
	hpDisplay.appendChild(comp.currentHP);
	var hpDivider = document.createElement("div");
	hpDivider.classList.add("divider", "scaled_text");
	hpDivider.textContent = "/";
	hpDisplay.appendChild(hpDivider);
	comp.maxHP = document.createElement("div");
	comp.maxHP.classList.add("max_hp", "scaled_text");
	hpDisplay.appendChild(comp.maxHP);
	hpEnContainer.appendChild(hpDisplay);

	// EN display
	var enDisplay = document.createElement("div");
	enDisplay.classList.add("en_display");
	comp.currentEN = document.createElement("div");
	comp.currentEN.classList.add("current_en", "scaled_text");
	enDisplay.appendChild(comp.currentEN);
	var enDivider = document.createElement("div");
	enDivider.classList.add("divider", "scaled_text");
	enDivider.textContent = "/";
	enDisplay.appendChild(enDivider);
	comp.maxEN = document.createElement("div");
	comp.maxEN.classList.add("max_en", "scaled_text");
	enDisplay.appendChild(comp.maxEN);
	hpEnContainer.appendChild(enDisplay);

	// HP bar
	var hpBar = document.createElement("div");
	hpBar.classList.add("hp_bar");
	comp.hpBarFill = document.createElement("div");
	comp.hpBarFill.classList.add("hp_bar_fill");
	hpBar.appendChild(comp.hpBarFill);
	hpEnContainer.appendChild(hpBar);

	// EN bar
	var enBar = document.createElement("div");
	enBar.classList.add("en_bar");
	comp.enBarFill = document.createElement("div");
	comp.enBarFill.classList.add("en_bar_fill");
	enBar.appendChild(comp.enBarFill);
	hpEnContainer.appendChild(enBar);

	comp.mechStatsContainer.appendChild(hpEnContainer);
	comp.summaryMech.appendChild(comp.mechStatsContainer);
	mechRow.appendChild(comp.summaryMech);
	comp.container.appendChild(mechRow);

	return comp;
}

Window_UnitSummary.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	this._bgFadeContainer.innerHTML = "";

	this._contentContainer = document.createElement("div");
	this._contentContainer.classList.add("unit_summary_content");
	this._contentContainer.style.display = "none";
	this._bgFadeContainer.appendChild(this._contentContainer);

	this._actorBlocks = [];
	for (var i = 0; i < 2; i++) {
		var block = this._createActorBlock(i);
		block.container.style.display = "none";
		this._contentContainer.appendChild(block.container);
		this._actorBlocks.push(block);
	}
}

Window_UnitSummary.prototype.update = function() {
	Window_Base.prototype.update.call(this);

	if(this._redrawRequested){
		this.refresh();
	}
};

Window_UnitSummary.prototype.show = function() {
	this.resetSelection();
	this._handlingInput = false;
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();
};

Window_UnitSummary.prototype.refresh = function() {
	this.getWindowNode().style.display = this._visibility;
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();
	}
}

Window_UnitSummary.prototype._getHPBarColor = function(hpPercent) {
	if(hpPercent >= ENGINE_SETTINGS.HP_BAR_COLORS.full.percent){
		return ENGINE_SETTINGS.HP_BAR_COLORS.full.color;
	} else if(hpPercent >= ENGINE_SETTINGS.HP_BAR_COLORS.high.percent){
		return ENGINE_SETTINGS.HP_BAR_COLORS.high.color;
	} else if(hpPercent >= ENGINE_SETTINGS.HP_BAR_COLORS.med.percent){
		return ENGINE_SETTINGS.HP_BAR_COLORS.med.color;
	} else if(hpPercent >= ENGINE_SETTINGS.HP_BAR_COLORS.low.percent){
		return ENGINE_SETTINGS.HP_BAR_COLORS.low.color;
	} else {
		return ENGINE_SETTINGS.HP_BAR_COLORS.critical.color;
	}
}

Window_UnitSummary.prototype.redraw = async function() {
	const _this = this;
	if($gameTemp.summaryUnit){
		var actors = [$gameTemp.summaryUnit];
		if(actors[0].subTwin){
			actors.push(actors[0].subTwin);
		}

		this._contentContainer.style.display = "";

		actors.forEach(function(actor, ctr){
			var comp = _this._actorBlocks[ctr];
			comp.container.style.display = "";

			// Pilot icon
			if(actor.isActor()){
				_this.loadActorFace(actor.actorId(), comp.pilotIcon);
			} else {
				_this.loadEnemyFace(actor.enemyId(), comp.pilotIcon);
			}

			// Ship icon
			comp.shipIcon.style.display = $statCalc.isShip(actor) ? "" : "none";

			// Pilot info
			comp.pilotName.textContent = actor.name();
			comp.levelValue.textContent = $statCalc.getCurrentLevel(actor);
			comp.willValue.textContent = $statCalc.getCurrentWill(actor);

			// Score
			const kills = $statCalc.getKills(actor);
			if(kills){
				comp.scoreDiv.style.display = "";
				comp.scoreValue.textContent = kills;
			} else {
				comp.scoreDiv.style.display = "none";
			}

			var calculatedStats = $statCalc.getCalculatedMechStats(actor);

			// Hit display vs status display
			var event = $statCalc.getReferenceEvent(actor);
			if(event && event.eventId && $gameTemp.isMapTarget(event.eventId())){
				var hitRate = $battleCalc.performHitCalculation(
					{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
					{actor: actor, action: {type: "defend"}}
				);
				var hitText = APPSTRINGS.GENERAL.label_hit + ": ";
				if(hitRate == -1){
					hitText += "---";
				} else {
					hitText += Math.floor(hitRate * 100) + "%";
				}
				comp.hitDisplay.textContent = hitText;
				comp.hitDisplay.style.display = "";
				comp.statusDisplay.style.display = "none";
				_this.assignFactionColorClass(comp.hitDisplay, actors[0]);
			} else {
				comp.hitDisplay.style.display = "none";
				let statusScore = 0;
				let statusCount = 0;
				const statusList = $statCalc.getStatusSummary(actor);
				for(let status of statusList){
					statusCount++;
					let amount = (status.amount || 0) * -1;
					statusScore += Math.sign(amount);
				}

				if(statusCount){
					let statusClass = "mix";
					if(statusScore > 0){
						statusClass = "buff";
					} else if(statusScore < 0){
						statusClass = "debuff";
					}
					comp.statusDisplay.className = "status_display " + statusClass;
					comp.statusDisplay.style.display = "";
				} else {
					comp.statusDisplay.style.display = "none";
				}
			}

			// Mech icon
			var menuImagePath = $statCalc.getMenuImagePath(actor);
			comp.mechImg.setAttribute("data-img", "img/" + menuImagePath);

			// Mech info
			comp.mechName.textContent = actor.SRWStats.mech.classData.name;

			// HP/EN values
			comp.currentHP.textContent = $statCalc.getCurrentHPDisplay(actor);
			comp.maxHP.textContent = $statCalc.getCurrentMaxHPDisplay(actor);
			comp.currentEN.textContent = $statCalc.getCurrentENDisplay(actor);
			comp.maxEN.textContent = $statCalc.getCurrentMaxENDisplay(actor);

			// HP bar
			var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
			comp.hpBarFill.style.width = hpPercent + "%";
			comp.hpBarFill.style.backgroundColor = _this._getHPBarColor(hpPercent);

			// EN bar
			var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
			comp.enBarFill.style.width = enPercent + "%";

			// Faction color
			_this.assignFactionColorClass(comp.container, actors[0]);

			// Scaled divs
			_this.updateScaledDiv(comp.pilotIcon);
			_this.updateScaledDiv(comp.mechIcon);
			_this.updateScaledDiv(comp.summary, false, false);
			_this.updateScaledDiv(comp.summaryMech, false, false);
			_this.updateScaledDiv(comp.mechStatsContainer);
		});

		// Hide unused blocks
		for (var i = actors.length; i < 2; i++) {
			this._actorBlocks[i].container.style.display = "none";
		}

		this.updateScaledDiv(this._bgFadeContainer);
	}
	this.loadImages();
	Graphics._updateCanvas(this._layoutId);
}
