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

Window_UnitSummary.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_UnitSummary.prototype.update = function() {
	var _this = this;
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
	//Graphics._updateCanvas(); //remove the redundant updateCanvas to improve performance
};

Window_UnitSummary.prototype.refresh = function() {
	this.getWindowNode().style.display = this._visibility;
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}	
}

Window_UnitSummary.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameTemp.summaryUnit){
		var actors = [$gameTemp.summaryUnit];
		if(actors[0].subTwin){
			actors.push(actors[0].subTwin);
		}
		content+="<div class='unit_summary_content'>";
		/*content+="<div class='background "+(actors.length > 1 ? "twin" : "")+"'></div>";*/
		var ctr = 0;
		actors.forEach(function(actor){
			content+="<div data-idx='"+ctr+"' class='unit_summary_inner block_"+(ctr + 1)+"'>";
			content+="<div data-idx='"+ctr+"' class='row'>";
			content+="<div data-idx='"+ctr+"' class='unit_summary_icon'></div>";//icon 		
			if($statCalc.isShip(actor)){
				content+="<img class='ship_icon' src='svg/anchor.svg' />";//icon 		
			}	
				
			content+="<div data-idx='"+ctr+"' class='summary'>";		
			
			content+="<div class='pilot_name scaled_text fitted_text'>";
			content+=actor.name();
			content+="</div>";
			
			content+="<div class='pilot_stats scaled_text'>";	
			content+="<div class='level scaled_width'>";
			content+="<div class='label'>";
			content+=APPSTRINGS.GENERAL.label_level;
			content+="</div>";
			content+="<div class='value'>";
			content+=$statCalc.getCurrentLevel(actor);
			content+="</div>";
			content+="</div>";
			content+="<div class='will scaled_width'>";
			content+="<div class='label'>";
			content+=APPSTRINGS.GENERAL.label_will;
			content+="</div>";
			content+="<div class='value'>";
			content+=$statCalc.getCurrentWill(actor);
			content+="</div>";
			content+="</div>";
			content+="</div>";
			
			var calculatedStats = $statCalc.getCalculatedMechStats(actor);
			
			/**/
			content+="</div>"
			var event = $statCalc.getReferenceEvent(actor);
			if(event && event.eventId && $gameTemp.isMapTarget(event.eventId())){
				var hitRate = $battleCalc.performHitCalculation(
					{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
					{actor: actor, action: {type: "defend"}}
				);
				content+="<div class='hit_display scaled_text'>";
				content+=APPSTRINGS.GENERAL.label_hit+": ";
				if(hitRate == -1){
					content+="---";	
				} else {
					content+=Math.floor(hitRate * 100)+"%";	
				}
				content+="</div>";				
			} else {
				let statusScore = 0;
				let statusCount = 0;
				const statusList = $statCalc.getStatusSummary(actor);
				for(let status of statusList){
					statusCount++;
					let amount = (status.amount || 0) * -1;
					statusScore+=Math.sign(amount);
				}
				
				if(statusCount){
					let statusClass = "mix";
					if(statusScore > 0){
						statusClass = "buff";
					} else if(statusScore < 0){
						statusClass = "debuff";
					}
					content+="<div class='status_display "+statusClass+"'>";
					content+="<img class='scaled_width' src='svg/hazard-sign.svg'></img>";
					
					content+="</div>";
				}
			}	
			
			
			
			content+="</div>";
			content+="<div data-idx='"+ctr+"' class='row'>";
			content+="<div data-idx='"+ctr+"' class='unit_summary_mech_icon'></div>";//icon 	
			
			content+="<div data-idx='"+ctr+"' class='summary_mech'>";	
			content+="<div class='mech_name scaled_text fitted_text'>";
			content+=actor.SRWStats.mech.classData.name;
			content+="</div>";
			
			content+="<div class='mech_stats_container'>";
			content+="<div class='mech_hp_en_container scaled_text'>";
			content+="<div class='hp_label scaled_text'>HP</div>";
			content+="<div class='en_label scaled_text'>EN</div>";

				
			content+="<div class='hp_display'>";
			content+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(actor)+"</div>";
			content+="<div class='divider scaled_text'>/</div>";
			content+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(actor)+"</div>";
			
			
			content+="</div>";
			
			content+="<div class='en_display'>";
			content+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(actor)+"</div>";
			content+="<div class='divider scaled_text'>/</div>";
			content+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(actor)+"</div>";
			
			content+="</div>";
			
			
			var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
			content+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
			
			var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
			content+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
			
			content+="</div>";
			
			content+="</div>";
			content+="</div>";
			
			content+="</div>";
			
			content+="</div>";
			
			ctr++;
		});
		content+="</div>";	
		_this._bgFadeContainer.innerHTML = content;
		this.updateScaledDiv(_this._bgFadeContainer);
		var icons = _this._bgFadeContainer.querySelectorAll(".unit_summary_icon");
		icons.forEach(function(icon){
			_this.updateScaledDiv(icon);	
			var actor = actors[icon.getAttribute("data-idx")];
			//_this._bgFadeContainer.classList.remove("enemy");
			//_this._bgFadeContainer.classList.remove("actor");
			if(actor.isActor()){
				//_this._bgFadeContainer.classList.add("actor");
				_this.loadActorFace(actor.actorId(), icon);
			} else {
				//_this._bgFadeContainer.classList.add("enemy");
				_this.loadEnemyFace(actor.enemyId(), icon);
			}
		});
		
		var icons = _this._bgFadeContainer.querySelectorAll(".unit_summary_mech_icon");
		icons.forEach(function(icon){
			_this.updateScaledDiv(icon);	
			var actor = actors[icon.getAttribute("data-idx")];
			
			var menuImagePath = $statCalc.getMenuImagePath(actor);
			icon.innerHTML = "<img data-img='img/"+menuImagePath+"'>";
		});
		
		var summaries = _this._bgFadeContainer.querySelectorAll(".summary_mech");
		summaries.forEach(function(summary){
			_this.updateScaledDiv(summary, false, false);				
		});
		
		var summaries = _this._bgFadeContainer.querySelectorAll(".summary");
		summaries.forEach(function(summary){
			_this.updateScaledDiv(summary, false, false);				
		});
		
		var summaries = _this._bgFadeContainer.querySelectorAll(".unit_summary_inner");
		summaries.forEach(function(summary){
			_this.assignFactionColorClass(summary, actors[0]);			
		});
		
		
		var statContainers = _this._bgFadeContainer.querySelectorAll(".mech_stats_container");
		statContainers.forEach(function(container){
			_this.updateScaledDiv(container);				
		});
		
		var hitDisplayContainers = _this._bgFadeContainer.querySelectorAll(".hit_display");
		hitDisplayContainers.forEach(function(container){
			_this.assignFactionColorClass(container, actors[0]);			
		});
		
		
		
		
			
		//_this.assignFactionColorClass(_this._bgFadeContainer.querySelector(".background"), actors[0]);
		//_this.updateScaledDiv(_this._bgFadeContainer.querySelector(".background"));
	}
	this.loadImages();
	Graphics._updateCanvas(this._layoutId);
}

