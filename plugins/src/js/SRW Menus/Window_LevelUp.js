import Window_CSS from "./Window_CSS.js";
import "./style/Window_LevelUp.css";

export default function Window_LevelUp() {
	this.initialize.apply(this, arguments);	
}

Window_LevelUp.prototype = Object.create(Window_CSS.prototype);
Window_LevelUp.prototype.constructor = Window_LevelUp;

Window_LevelUp.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "level_up";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._currentScroll = 0;
}

Window_LevelUp.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_LevelUp.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_LevelUp.prototype.resetSelection = function(){
	this._currentScroll = 0;	
}

Window_LevelUp.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
		
		if(Input.isTriggered('ok')){
			//$gameTemp.popMenu = true;	
		}
		if(Input.isTriggered('cancel')){				
			//$gameTemp.popMenu = true;	
			//$gameTemp.popMenu = true;	
		}		
		
		if(Input.isPressed('down') || Input.isLongPressed('down')){
			this._currentScroll+=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._bgFadeContainer.querySelector(".skills_scroll"), this._currentScroll);			
		}
		if(Input.isPressed('up') || Input.isLongPressed('up')){
			this._currentScroll-=15 * Graphics.getScale();
			this._currentScroll = _this.handleElemScrol(this._bgFadeContainer.querySelector(".skills_scroll"), this._currentScroll);			
		}
		
		this.refresh();
	}		
};

Window_LevelUp.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameTemp.currentLevelResult){
		var actor = $gameTemp.currentLevelResult.actor;
		var levelResult = $gameTemp.currentLevelResult.details;
		content+="<div class='level_up_content'>";
		content+="<div class='level_up_row level_up'>";
		content+="<div id='level_up_icon'></div>";//icon 	
		
		content+="<div class='level_up_block'>";
		content+="<div class='name scaled_text'>";
		content+=actor.name();
		content+="</div>";
		content+="<div class='level_up_text scaled_text'>";
		content+=APPSTRINGS.LEVELUP.label_level_up;
		content+="</div>";
		
		content+="<div class='level_up_delta'>";
		
		content+="<div class='level_label scaled_text'>";
		content+="Lv";
		content+="</div>";
		content+="<div class='level_value old scaled_text'>";
		content+=levelResult.oldLevel;
		content+="</div>";
		content+="<div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div>";
		content+="<div class='level_label scaled_text'>";
		content+="Lv";
		content+="</div>";
		content+="<div class='level_value new scaled_text'>";
		content+=levelResult.newLevel;
		content+="</div>";
		
		content+="</div>";
		
		content+="</div>";
		content+="</div>";
		
		content+="<div class='level_up_row details'>";
		content+="<div class='skills_block'>";
		content+="<div class='row header scaled_text'>";
		content+="<div class='column'>";
		content+=APPSTRINGS.LEVELUP.label_skills;
		content+="</div>";
		content+="</div>";
		
		content+="<div class='skills_scroll styled_scroll'>";
		
		var currentLevel = $statCalc.getCurrentLevel(actor);
		Object.keys(levelResult.newAbilities)
		.sort(function(a, b){
			var aIsNew = !levelResult.oldAbilities[a] || levelResult.oldAbilities[a].level != levelResult.newAbilities[a].level;
			var bIsNew = !levelResult.oldAbilities[b] || levelResult.oldAbilities[b].level != levelResult.newAbilities[b].level;
			if((!aIsNew && !bIsNew) || (aIsNew && bIsNew)){
				return levelResult.newAbilities[a].slot - levelResult.newAbilities[b].slot
			} else if(aIsNew){
				return -1;
			} else if(bIsNew){
				return 1;
			}
			return 0;			
		})
		.forEach(function(abilityId){
				var ability = levelResult.newAbilities[abilityId];
				var displayName = "---";
				var uniqueString = "";
				if(ability && ability.requiredLevel <= currentLevel){
					var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(ability.idx);
					displayName = displayInfo.name;
					if(displayInfo.hasLevel){
						displayName+="L"+ability.level;
					}
					if($gameSystem.isHiddenActorAbility(actor, ability.idx) ||  $gameSystem.isLockedActorAbility(actor, ability.idx)){
						displayName = "?????";
					}
					if(displayInfo.isUnique){
						uniqueString = "*";
					} else {
						uniqueString = "&nbsp;";
					}
				}
				var displayClass = "";
				
				if(!levelResult.oldAbilities[abilityId] || levelResult.oldAbilities[abilityId].level != levelResult.newAbilities[abilityId].level) {
					displayClass = "updated_skill";
				}
				
				content+="<div class='row scaled_text fitted_text "+displayClass+"'>";
				content+="<div class='column skill_entry'>";
				content+="<div class='unique_skill_mark scaled_width'>"+uniqueString+"</div>";
				content+="<div class=''>"+displayName+"</div>";
				content+="</div>";		
				content+="</div>";		
		});
		content+="</div>";
		content+="</div>";
		
		content+="<div class='spirits_block'>";
		
		content+="<div class='row header scaled_text'>";
		content+="<div class='column'>";
		content+=APPSTRINGS.LEVELUP.label_spirits;
		content+="</div>";
		content+="</div>";
		
		var spiritList = $statCalc.getSpiritList(actor);
		
		for(var i = 0; i < 6; i++){
			var displayName = "---";
			if(typeof spiritList[i] != "undefined" && spiritList[i].level <= levelResult.newLevel){
				displayName = $spiritManager.getSpiritDisplayInfo(spiritList[i].idx).name;
			}
			
			var displayClass = "";
			if(typeof spiritList[i] != "undefined" && spiritList[i].level > levelResult.oldLevel){
				displayClass = "updated_spirit";
			}			
			
			content+="<div class='row scaled_text fitted_text "+displayClass+"'>";
			content+="<div class='column'>";
			content+="<div class=''>"+displayName+"</div>";
			content+="</div>";
			content+="</div>";
		}
		
		content+="</div>";
		content+="<div class='stats_block'>";
			
		var statsToDraw = [
			{id: "SP", name: "SP"},
			{id: "melee", name: APPSTRINGS.PILOTSTATS.melee},
			{id: "ranged", name: APPSTRINGS.PILOTSTATS.ranged},
			{id: "skill", name: APPSTRINGS.PILOTSTATS.skill},
			{id: "defense", name: APPSTRINGS.PILOTSTATS.defense},
			{id: "evade", name: APPSTRINGS.PILOTSTATS.evade},
			{id: "hit", name: APPSTRINGS.PILOTSTATS.hit},
		];
		for(var i = 0; i < statsToDraw.length; i++){
			var oldVal = levelResult.oldStats[statsToDraw[i].id];
			var newVal = String(levelResult.newStats[statsToDraw[i].id]).padStart("&nbsp;", 3);
			var delta = newVal - oldVal;
			var addClass = "";
			if(delta) {
				addClass = "delta";
			}
			
			content+="<div class='row "+statsToDraw[i].id+" scaled_text'>";
			content+="<div class='column "+addClass+"'>";
			content+=statsToDraw[i].name;
			content+="</div>";
			content+="<div class='column "+addClass+"'>";
			content+=newVal;
			content+="</div>";
			content+="<div class='column "+addClass+"'>";		
			content+=delta;					
			content+="</div>";
			content+="</div>";						
		}
		
		content+="</div>";	
		
		content+="</div>";
		content+="</div>";
		content+="</div>";
		_this._bgFadeContainer.innerHTML = content;
		this.updateScaledDiv(_this._bgFadeContainer);
		this.updateScaledDiv(_this._bgFadeContainer.querySelector("#level_up_icon"));	
		var actorIcon = this._bgFadeContainer.querySelector("#level_up_icon");
		this.loadActorFace($gameTemp.currentLevelResult.actor.actorId(), actorIcon);
	}	
	
	Graphics._updateCanvas();
}

