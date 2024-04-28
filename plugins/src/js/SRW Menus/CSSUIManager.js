export default function CSSUIManager(){
	
}


CSSUIManager.textScaleCache = {};
CSSUIManager.textScaleCacheCtr = 0;

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
	if(this.customUILayer){
		
		function getElemCacheIdx(elem){
			let resultParts = [];
			resultParts.push(elem.id+"::"+Array.from(elem.classList).join("__"));
			let ctr = 0;
			while(elem.parentNode && ctr < 1){
				elem = elem.parentNode;
				resultParts.push(elem.id+"::"+Array.from(elem.classList).join("__"));
				ctr++;
			}
			return resultParts.join("->");
		}
		
		var sourceContainer;
		if(windowId){
			sourceContainer = window.document.getElementById(windowId);
		}
		if(!sourceContainer){
			sourceContainer = window.document;
		}
		
		const baseCacheKey = "::";
		
		//this.customUILayer.style.display = "none";
		var referenceWidth = Graphics._getCurrentWidth();
		var textElements = sourceContainer.querySelectorAll(".scaled_text");	
		textElements.forEach(function(textElement){
			if(forceAll || textElement.offsetParent != null){		
				const cacheKey = "scaled_text:" + getElemCacheIdx(textElement);
				if(CSSUIManager.textScaleCache[cacheKey]){
					textElement.style.fontSize = CSSUIManager.textScaleCache[cacheKey].fontSize;
					if(ENGINE_SETTINGS.FONT_LINE_HEIGHT_SCALE){
						textElement.style.lineHeight = CSSUIManager.textScaleCache[cacheKey].lineHeight;
					}
					return;
				}
				var fontPercent = textElement.getAttribute("data-font-percent");
				if(!fontPercent){
					fontPercent = window.getComputedStyle(textElement, null).getPropertyValue('--fontsize');
					fontPercent = parseFloat(fontPercent.replace("px", ""));
					textElement.setAttribute("data-font-percent", fontPercent);
				}
				
				textElement.style.fontSize = Math.floor(referenceWidth/100 * fontPercent) * (ENGINE_SETTINGS.FONT_SCALE || 1) + "px";
				if(ENGINE_SETTINGS.FONT_LINE_HEIGHT_SCALE){
					textElement.style.lineHeight = Math.floor(referenceWidth/100 * fontPercent) * (ENGINE_SETTINGS.FONT_SCALE || 1) * ENGINE_SETTINGS.FONT_LINE_HEIGHT_SCALE + "px";
				}
				CSSUIManager.textScaleCache[cacheKey] = {
					fontSize: textElement.style.fontSize,
					lineHeight: textElement.style.lineHeight
				};
			}
		});
		var scaledWidthElements = sourceContainer.querySelectorAll(".scaled_width");	
		scaledWidthElements.forEach(function(scaledElement){
			if(forceAll || scaledElement.offsetParent != null){			
				const cacheKey = "scaled_width:" + getElemCacheIdx(scaledElement);
				if(CSSUIManager.textScaleCache[cacheKey]){
					scaledElement.style.width = CSSUIManager.textScaleCache[cacheKey].width;
					return;
				}
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
				
				scaledElement.style.width = Math.floor(referenceWidth/100 * scalePercent) + "px";
				CSSUIManager.textScaleCache[cacheKey] = {
					width: scaledElement.style.width
				}
			}
		});
		
		var scaledHeightElements = sourceContainer.querySelectorAll(".scaled_height");	
		scaledHeightElements.forEach(function(scaledElement){
			if(forceAll || scaledElement.offsetParent != null){			
				const cacheKey = "scaled_height:" + getElemCacheIdx(scaledElement);
				if(CSSUIManager.textScaleCache[cacheKey]){
					scaledElement.style.height = CSSUIManager.textScaleCache[cacheKey].height;
					return;
				}
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
				
				scaledElement.style.height = Math.floor(referenceWidth/100 * scalePercent) + "px";
				CSSUIManager.textScaleCache[cacheKey] = {
					height: scaledElement.style.height
				}
			}
		});
		
		//this.customUILayer.style.display = "";
		
		var fittedTextElements = sourceContainer.querySelectorAll(".fitted_text");	
		//document.body.display = "none";
		let elemId = 0;
		let fittedElemInfo = {};
		fittedTextElements.forEach(function(textElement){
			if(forceAll || textElement.offsetParent != null){			
				const currentFontSize = textElement.style.fontSize.replace("px", "");
				fittedElemInfo[elemId] = {
					elem: textElement,
					currentFontSize: currentFontSize,
					minFontSize: Math.floor(currentFontSize / 10),
					isValid: true
				}
				elemId++;	
			}
		});
		
		for(const elemId in fittedElemInfo){
			const textElement = fittedElemInfo[elemId].elem;
			
			const cacheKey = "fitted_text:" + getElemCacheIdx(textElement)+"="+textElement.innerText;
			if(CSSUIManager.textScaleCache[cacheKey]){
				textElement.style.fontSize = CSSUIManager.textScaleCache[cacheKey].fontSize;
				
			} else {
				let needsProcessing = true;
				let isUnderflow = false;
				while(!isUnderflow && (textElement.scrollHeight > textElement.clientHeight || textElement.scrollWidth > textElement.clientWidth)){
					const nextSize = Math.floor(fittedElemInfo[elemId].currentFontSize / 1.2);
					if(nextSize > fittedElemInfo[elemId].minFontSize){
						fittedElemInfo[elemId].currentFontSize = nextSize;
					} else {
						isUnderflow = true;
					}
					fittedElemInfo[elemId].elem.style.fontSize = fittedElemInfo[elemId].currentFontSize + "px";
					CSSUIManager.textScaleCache[cacheKey] = {
						fontSize: fittedElemInfo[elemId].elem.style.fontSize
					}
				}
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
	this.initWindow("zone_status");
	this.initWindow("game_modes");
	this.initWindow("button_hints");
}

CSSUIManager.prototype.initWindow = function(id){
	var newWindow = document.createElement("div");
	newWindow.classList.add("UI_window");
	newWindow.id = id;
	this.customUILayer.appendChild(newWindow);
}