import "./style/faceSelector.css";
export default function OverworldSpriteManager(){
	
}

OverworldSpriteManager.faceWidth = 144;
OverworldSpriteManager.faceHeight = 192;
OverworldSpriteManager.faceScale = 0.5;

OverworldSpriteManager.faceFileColumns = 4;
OverworldSpriteManager.faceFileRows = 2;

OverworldSpriteManager.loadOverworldByParams = function(name, index, elem) {
	var width = OverworldSpriteManager.faceWidth;
    var height = OverworldSpriteManager.faceHeight;
	
	elem.innerHTML = "";
	
	var targetBitmap = new Bitmap(width, height);
	
	var bitmap = ImageManager.loadCharacter(name);	
	bitmap.addLoadListener(function(){
		var pw = width;
		var ph = height;
		var sw = Math.min(width, pw);
		var sh = Math.min(height, ph);
		var dx = Math.floor(0 + Math.max(width - pw, 0) / 2);
		var dy = Math.floor(0 + Math.max(height - ph, 0) / 2);
		var sx = index % 4 * pw + (pw - sw) / 2;
		var sy = Math.floor(index / 4) * ph + (ph - sh) / 2;   
		
		targetBitmap.blt(bitmap, sx, sy, sw, sh, dx, dy);
		var facePicContainer = document.createElement("div");
		facePicContainer.classList.add("face_pic_container");
		var facePic = document.createElement("img");
		facePic.style.width = "100%";
		facePic.setAttribute("src", targetBitmap.canvas.toDataURL());
		facePicContainer.appendChild(facePic);	
		elem.appendChild(facePicContainer);	
	});
}

OverworldSpriteManager.showOverworldSelector = function(e, faceName, faceIndex, elem){
	e.stopPropagation();
	
	return new Promise(function(resolve, reject){	
		var path = require('path');
		var base = getBase();
		const dir = base+"img/characters";
		var availableFaceFiles = [];
		const FILESYSTEM = require("fs"); 
		FILESYSTEM.readdirSync(dir).forEach(function(file) {	
			file = file.replace(/\.png$/, "");
			availableFaceFiles.push(file);		
		});	
		
		var editorContainer = document.querySelector("#srw_editor");
		
		var container;
		var containerId = "face_selector_container";
		var container = editorContainer.querySelector("#face_selector_container");
		if(!container){		
			container = document.createElement("div");
			container.id = "face_selector_container";
			editorContainer.appendChild(container);	
			
			container.addEventListener("click", function(e){
				e.stopPropagation();
			});
		}
		var rect = elem.getBoundingClientRect();
		container.style.top = rect.top + "px";
		container.style.left = rect.right + 5 + "px";
		
		var content = "";
		content+="<div class='face_selector'>";
		content+="<div class='face_file_list'>";
		
		content+="</div>";
		content+="<div class='selection_pane'>";
		
		content+="</div>";
		content+="</div>";
		
		container.innerHTML = content;
		container.style.display = "";
		
		var containerRect = container.getBoundingClientRect();
		if(containerRect.bottom > window.innerHeight){
			container.style.top = rect.top - (containerRect.bottom - window.innerHeight + 5) + "px";
		}
		
		Window.innerHeight
		
		function updateFaceList(){
			var ctr = 0;
			var content = "";
			availableFaceFiles.forEach(function(faceFile){
				content+="<div class='entry "+(faceFile == faceName ? "selected" : "")+"' data-facename="+faceFile+">";
				content+=faceFile;
				content+="</div>";
				ctr++;
			});	
			container.querySelector(".face_file_list").innerHTML = content;
			var selected = container.querySelector(".face_file_list .entry[data-facename='"+faceName+"']");
			if(selected){
				selected.scrollIntoView();
			}
			
			var entries = container.querySelectorAll(".face_file_list .entry");
			entries.forEach(function(entry){
				entry.addEventListener("click", function(){
					faceName = this.getAttribute("data-facename");
					updateAll();
				});
			});
		}
		
		function updateFaceSelector(){
			var ctr = 0;
			var content = "";
			content+="<div class='selector_container'>";
			
			var width = OverworldSpriteManager.faceWidth * OverworldSpriteManager.faceScale + "px";
			var height = OverworldSpriteManager.faceHeight * OverworldSpriteManager.faceScale + "px"
			for(var i = 0; i < OverworldSpriteManager.faceFileRows; i++){
				for(var j = 0; j < OverworldSpriteManager.faceFileColumns; j++){
					var top = i * OverworldSpriteManager.faceHeight * OverworldSpriteManager.faceScale - 1 + "px";
					var left = j * OverworldSpriteManager.faceWidth * OverworldSpriteManager.faceScale - 1 + "px";
					var idx = i * OverworldSpriteManager.faceFileColumns + j;
					content+="<div style='width: "+width+"; height: "+height+"; top: "+top+"; left: "+left+"' class='selector_square "+(idx == faceIndex ? "current" : "")+"' data-idx='"+idx+"'>";
					content+="</div>";
				}
			}
			
			content+="</div>";
			
			/*content+="<div class='controls'>";
			content+="<div class='label '>Face name:</div>";
			content+="<div class='label'>"+faceName+"</div>";
			content+="<div class='label '>Face index:</div>";
			content+="<div class='label'>"+faceIndex+"</div>";
			content+="</div>";*/
			
			container.querySelector(".selection_pane").innerHTML = content;
			var selectorContainer = container.querySelector(".selection_pane .selector_container");
			selectorContainer.style.width = OverworldSpriteManager.faceFileColumns * OverworldSpriteManager.faceWidth * OverworldSpriteManager.faceScale + "px";
			selectorContainer.style.height = OverworldSpriteManager.faceFileRows * OverworldSpriteManager.faceHeight * OverworldSpriteManager.faceScale + "px";
			selectorContainer.style.backgroundImage = "url('img/characters/"+faceName+".png')";		
			selectorContainer.style.backgroundSize = OverworldSpriteManager.faceFileColumns * OverworldSpriteManager.faceWidth * OverworldSpriteManager.faceScale + "px";
			
			var faceSelectors = container.querySelectorAll(".selection_pane .selector_square");
			faceSelectors.forEach(function(faceSelector){
				faceSelector.addEventListener("click", function(){
					container.style.display = "none";
					resolve({status: "updated", faceName: faceName, faceIndex: this.getAttribute("data-idx")});
				});
			});
			
		}
		
		function updateAll(){
			updateFaceList();
			updateFaceSelector();
		}
		
		updateAll();
		
		if(!OverworldSpriteManager.hideHandler){
			OverworldSpriteManager.hideHandler = editorContainer.addEventListener("click", function(){
				container.style.display = "none";
				resolve({status: "cancelled"});
			});
			//hacky, solution to hide element if the container holding the parent element is scrolled
			if(document.querySelector(".text_scroll_default")){
				document.querySelector(".text_scroll_default").addEventListener("scroll", function(){
					container.style.display = "none";
					resolve({status: "cancelled"});
				});	
			}			
		}	
	});
}