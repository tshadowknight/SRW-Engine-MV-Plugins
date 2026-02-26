export default function CSSUIManager(){
	
}


CSSUIManager.textScaleCache = {};
CSSUIManager.textScaleCacheCtr = 0;
CSSUIManager.cacheKeyCtr = 0;
CSSUIManager._measureCanvas = document.createElement('canvas');
CSSUIManager._measureCtx = CSSUIManager._measureCanvas.getContext('2d');

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
		
		var sourceContainer;
		if(windowId){
			sourceContainer = window.document.getElementById(windowId);
		}
		if(!sourceContainer){
			sourceContainer = window.document;
		}
		
		
		
		//this.customUILayer.style.display = "none";
		var referenceWidth = Graphics._getCurrentWidth();
		
		var textElements = sourceContainer.querySelectorAll(".scaled_text");	
		var scaledWidthElements = sourceContainer.querySelectorAll(".scaled_width");
		var scaledHeightElements = sourceContainer.querySelectorAll(".scaled_height");
		
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
		
		var fittedTextElements = sourceContainer.querySelectorAll(".fitted_text");	
		//document.body.display = "none";
		let elemId = 0;
		let fittedElemInfo = {};
		fittedTextElements.forEach(function(textElement){
			
			const currentFontSize = textElement.style.fontSize.replace("px", "");
			fittedElemInfo[elemId] = {
				elem: textElement,
				currentFontSize: currentFontSize,
				minFontSize: Math.floor(currentFontSize / 10),
				isValid: true
			}
			elemId++;	
			
		});
		
		const ctx = CSSUIManager._measureCtx;

		// Phase 1: batch all DOM reads
		for(const elemId in fittedElemInfo){
			const info = fittedElemInfo[elemId];
			const style = window.getComputedStyle(info.elem);
			info.containerWidth = info.elem.clientWidth;
			info.text           = info.elem.textContent;
			info.fontFamily     = style.fontFamily;
			info.fontWeight     = style.fontWeight;
			info.fontStyle      = style.fontStyle;
		}

		// Phase 2: binary search off-DOM via canvas measureText
		for(const elemId in fittedElemInfo){
			const info = fittedElemInfo[elemId];
			if(info.containerWidth <= 0){
				continue;
			}

			ctx.font = `${info.fontStyle} ${info.fontWeight} ${info.currentFontSize}px ${info.fontFamily}`;
			if(ctx.measureText(info.text).width <= info.containerWidth){
				info.finalFontSize = info.currentFontSize;
				continue;
			}

			let lo = info.minFontSize;
			let hi = info.currentFontSize;
			while(lo < hi - 1){
				const mid = Math.floor((lo + hi) / 2);
				ctx.font = `${info.fontStyle} ${info.fontWeight} ${mid}px ${info.fontFamily}`;
				if(ctx.measureText(info.text).width > info.containerWidth){
					hi = mid;
				} else {
					lo = mid;
				}
			}
			info.finalFontSize = lo;
		}

		// Phase 3: batch all DOM writes
		for(const elemId in fittedElemInfo){
			if(fittedElemInfo[elemId].finalFontSize !== undefined){
				fittedElemInfo[elemId].elem.style.fontSize = fittedElemInfo[elemId].finalFontSize + "px";
			}
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