import Window_CSS from "./Window_CSS.js";
import "./style/DescriptionOverlay.css";

export default function DescriptionOverlay(container, selectionProvider, excludeUnique){
	this._container = container;	
	this._sourceContainer;
	this._elementIdx = 0;
	this._abilityManagerLookup = {
		pilot: $pilotAbilityManager,
		mech: $mechAbilityManager,
		item: $itemEffectManager
	};
}

DescriptionOverlay.prototype = Object.create(Window_CSS.prototype);
DescriptionOverlay.prototype.constructor = DescriptionOverlay;


DescriptionOverlay.prototype.createComponents = function(){
	this._text = document.createElement("div");
	this._text.classList.add("description_text");
	this._text.classList.add("fitted_text");
	this._text.classList.add("scaled_text")
	this._container.appendChild(this._text);
}

DescriptionOverlay.prototype.show = function(sourceContainer){
	this._container.style.display = "block";	
	this._sourceContainer = sourceContainer;
	this._elementIdx = 0;
	this.redraw();
}

DescriptionOverlay.prototype.getMaxSelection = function(){
	if(this._sourceContainer){
		var describedElements = this._sourceContainer.querySelectorAll(".described_element");
		return describedElements.length;
	} else {
		return 0;
	}	 
}

DescriptionOverlay.prototype.incrementSelection = function(sourceContainer){
	this._elementIdx++;
	if(this._elementIdx >= this.getMaxSelection()){
		this._elementIdx = 0;
	}
}

DescriptionOverlay.prototype.decrementSelection = function(sourceContainer){
	this._elementIdx--;
	if(this._elementIdx < 0){
		this._elementIdx = this.getMaxSelection() - 1;
	}
}

DescriptionOverlay.prototype.hide = function(){
	this._container.style.display = "none";	
	if(this._sourceContainer){
		var describedElements = this._sourceContainer.querySelectorAll(".described_element");
		describedElements.forEach(function(describedElement){
			describedElement.classList.remove("described");
		});
	}
	this._sourceContainer = null;
}

DescriptionOverlay.prototype.redraw = function() {
	var _this = this;	
	this._text.innerHTML = "";
	if(_this._sourceContainer){
		var describedElements = _this._sourceContainer.querySelectorAll(".described_element");
		describedElements.forEach(function(describedElement){
			describedElement.classList.remove("described");
		});
		var describedElement = describedElements[this._elementIdx];
		if(describedElement){		
			describedElement.classList.add("described");
			
			var type = describedElement.getAttribute("data-type");
			var idx = describedElement.getAttribute("data-idx");
			if(type == "spirit"){				
				var displayInfo = $spiritManager.getSpiritDisplayInfo(idx);
				this._text.innerHTML = displayInfo.desc;				
			} else if(type == "status"){				
				this._text.innerHTML = APPSTRINGS.STATUS[describedElement.getAttribute("data-ref")].description;				
			} else if(type == "fav_skill"){	
				const isUnlocked = describedElement.getAttribute("data-isunlocked");
				if(!isUnlocked){
					this._text.innerHTML = "?????";
				} else {
					this._text.innerHTML = $pilotAbilityManager.getAbilityDisplayInfo(idx).desc;
				}
								
			} else {
				var isHidden = false;
				var actor = $gameTemp.currentMenuUnit.actor;
				if(type == "pilot"){
					isHidden = $gameSystem.isHiddenActorAbility(actor, idx) ||  $gameSystem.isLockedActorAbility(actor, idx);
				}
				if(type == "mech"){
					isHidden = $gameSystem.isHiddenMechAbility(actor, idx) ||  $gameSystem.isLockedMechAbility(actor, idx);
				}
				var manager = _this._abilityManagerLookup[type];
				if(!isHidden && manager){
					var displayInfo = manager.getAbilityDisplayInfo(idx);
					this._text.innerHTML = displayInfo.desc;
				} else {
					this._text.innerHTML = "?????";
				}
			}			
		}
	}
	this.updateScaledDiv(_this._container);
	this.updateScaledDiv(_this._text);
	
	Graphics._updateCanvas();
}