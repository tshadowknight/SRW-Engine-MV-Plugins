export default function CSSUIManager(){
	
}


CSSUIManager.textScaleCache = {};
CSSUIManager.textScaleCacheCtr = 0;
CSSUIManager.cacheKeyCtr = 0;

CSSUIManager.bumpScaleCache = function(dimensions){
	CSSUIManager.textScaleCacheCtr++;
	CSSUIManager.textScaleCache = {};
}

CSSUIManager.prototype.updateLayer = function(dimensions){
	if(this.customUILayer){
		this.customUILayer.style.width = dimensions.width+"px";
		this.customUILayer.style.height = dimensions.height+"px";
	}	
}

CSSUIManager.prototype.updateScaledText = function(windowId, bustCache){
	if($gameTemp){
		$gameTemp.scaledTextUpdateRequested = true;	
	}	
}

CSSUIManager.prototype.doUpdateScaledText = function(windowId, forceAll){
	CSSUIManager.bumpScaleCache();
	if(this.customUILayer){
		
		var sourceContainers;
		if(windowId){
			var windowNode = window.document.getElementById(windowId);
			sourceContainers = windowNode ? [windowNode] : [];
		} else {
			// only query visible UI windows to avoid processing stale content in hidden windows
			sourceContainers = Array.from(window.document.querySelectorAll(".UI_window"))
				.filter(function(w){ return w.style.display !== "none"; });
		}

		//this.customUILayer.style.display = "none";
		var referenceWidth = Graphics._getCurrentWidth();

		var textElements = [];
		var scaledWidthElements = [];
		var scaledHeightElements = [];
		for(var si = 0; si < sourceContainers.length; si++){
			var sc = sourceContainers[si];
			textElements = textElements.concat(Array.from(sc.querySelectorAll(".scaled_text")));
			scaledWidthElements = scaledWidthElements.concat(Array.from(sc.querySelectorAll(".scaled_width")));
			scaledHeightElements = scaledHeightElements.concat(Array.from(sc.querySelectorAll(".scaled_height")));
		}
		
		//measure
		for(let textElement of textElements){
			let fontPercent = window.getComputedStyle(textElement, null).getPropertyValue('--fontsize');
			fontPercent = parseFloat(fontPercent.replace("px", ""));			
			
			textElement.targetFontPercent = fontPercent;			
		}
		
		for(let scaledElement of scaledWidthElements){		
			var scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('--widthscaling');
			if(!scalePercent){
				scalePercent = scaledElement.getAttribute("data-original-width");
			}			
			if(!scalePercent){				
				if(!scalePercent){
					scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('width');
				}								
				scaledElement.setAttribute("data-original-width", scalePercent);
			}			
			
			scalePercent = parseFloat(scalePercent.replace("px", ""));
			
			scaledElement.targetWidthScalePercent = scalePercent;		
		}
		
		for(let scaledElement of scaledHeightElements){	
			
			var scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('--heightscaling');
			if(!scalePercent){
				scalePercent = scaledElement.getAttribute("data-original-height");
			}
			if(!scalePercent){
				if(!scalePercent){
					scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('height');
				}				
				scaledElement.setAttribute("data-original-height", scalePercent);
			}
			scalePercent = parseFloat(scalePercent.replace("px", ""));
			
			scaledElement.targetHeightScalePercent = scalePercent;					
		}
		
		//mutate
		for(let textElement of textElements){		
			const fontPercent = textElement.targetFontPercent;
			
			textElement.style.fontSize = Math.floor(referenceWidth/100 * fontPercent) * (ENGINE_SETTINGS.FONT_SCALE || 1) + "px";
			if(ENGINE_SETTINGS.FONT_LINE_HEIGHT_SCALE){
				textElement.style.lineHeight = Math.floor(referenceWidth/100 * fontPercent) * (ENGINE_SETTINGS.FONT_SCALE || 1) * ENGINE_SETTINGS.FONT_LINE_HEIGHT_SCALE + "px";
			}
			
		}
		
		for(let scaledElement of scaledWidthElements){						
			scaledElement.style.width = Math.floor(referenceWidth/100 * scaledElement.targetWidthScalePercent) + "px";				
		}
		
		for(let scaledElement of scaledHeightElements){	
			scaledElement.style.height = Math.floor(referenceWidth/100 * scaledElement.targetHeightScalePercent) + "px";
		}
		
		
		//this.customUILayer.style.display = "";
		
		var fittedTextElements = [];
		for(var si = 0; si < sourceContainers.length; si++){
			fittedTextElements = fittedTextElements.concat(Array.from(sourceContainers[si].querySelectorAll(".fitted_text")));
		}

		let elemId = 0;
		let fittedElemInfo = {};
		fittedTextElements.forEach(function(textElement){
			const currentFontSize = parseFloat(textElement.style.fontSize);
			fittedElemInfo[elemId] = {
				elem: textElement,
				currentFontSize: Math.floor(currentFontSize),
				minFontSize: Math.floor(currentFontSize / 10),
			}
			elemId++;
		});

		for(const elemId in fittedElemInfo){
			const info = fittedElemInfo[elemId];
			const textElement = info.elem;

			if(textElement.scrollHeight <= textElement.clientHeight &&
			   textElement.scrollWidth  <= textElement.clientWidth){
				continue;
			}

			let lo = info.minFontSize;
			let hi = info.currentFontSize;
			let sanity = 10;

			while(sanity-- > 0 && lo < hi - 1){
				const mid = Math.floor((lo + hi) / 2);
				textElement.style.fontSize = mid + "px";
				if(textElement.scrollHeight > textElement.clientHeight ||
				   textElement.scrollWidth  > textElement.clientWidth){
					hi = mid;
				} else {
					lo = mid;
				}
			}

			textElement.style.fontSize = lo + "px";
		}					
				
	}
}

CSSUIManager.prototype.initAllWindows = function(){	
	this.customUILayer = document.createElement("div");
	this.customUILayer.id = "custom_UI_layer";		
	document.body.appendChild(this.customUILayer);
	
	this.initWindow("intermission_menu");
	this.initWindow("mech_list");
	this.initWindow("upgrade_unit_selection");
	this.initWindow("upgrade_mech");
	this.initWindow("pilot_list");
	this.initWindow("pilot_upgrade_list");	
	this.initWindow("upgrade_pilot");	
	this.initWindow("equip_item_select");
	this.initWindow("equip_item");
	this.initWindow("equip_weapon_select");
	this.initWindow("upgrade_equip_weapon");
	this.initWindow("equip_weapon");
	this.initWindow("sell_item");
	this.initWindow("battle_basic");
	this.initWindow("spirit_activation");
	this.initWindow("detail_pages");
	this.initWindow("attack_list");
	this.initWindow("rewards");
	this.initWindow("level_up");
	this.initWindow("spirit_selection");
	this.initWindow("spirit_selection_before_battle");
	this.initWindow("before_battle");
	this.initWindow("unit_summary");
	this.initWindow("terrain_details");
	this.initWindow("zone_summary");
	this.initWindow("deployment");
	this.initWindow("deployment_in_stage");
	this.initWindow("deploy_selection");
	this.initWindow("confirm_end_turn");
	this.initWindow("mech_list_deployed");
	this.initWindow("mech_reassign_select");
	this.initWindow("pilot_reassign_select");
	this.initWindow("search");
	this.initWindow("options");
	this.initWindow("map_buttons");
	this.initWindow("opening_crawl");
	this.initWindow("text_log");
	this.initWindow("load_overlay");
	this.initWindow("zone_status");
	this.initWindow("game_modes");
	this.initWindow("button_hints");
	this.initWindow("mode_selection");
	this.initWindow("attr_chart");
}

CSSUIManager.prototype.initWindow = function(id){
	var newWindow = document.createElement("div");
	newWindow.classList.add("UI_window");
	newWindow.id = id;
	this.customUILayer.appendChild(newWindow);
}