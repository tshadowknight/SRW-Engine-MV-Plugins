import "./style/faceSelector.css";
export default function FaceManager(){
	
}

FaceManager.faceSize = 144;
FaceManager.faceScale = 0.5;

FaceManager.faceFileColumns = 4;
FaceManager.faceFileRows = 2;

FaceManager.loadFaceByParams = function(faceName, faceIndex, elem) {
	var width = Window_Base._faceWidth;
    var height = Window_Base._faceHeight;
	
	elem.innerHTML = "";
	
	var targetBitmap = new Bitmap(width, height);
	
	var bitmap = ImageManager.loadFace(faceName);	
	bitmap.addLoadListener(function(){
		var pw = Window_Base._faceWidth;
		var ph = Window_Base._faceHeight;
		var sw = Math.min(width, pw);
		var sh = Math.min(height, ph);
		var dx = Math.floor(0 + Math.max(width - pw, 0) / 2);
		var dy = Math.floor(0 + Math.max(height - ph, 0) / 2);
		var sx = faceIndex % 4 * pw + (pw - sw) / 2;
		var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;   
		
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

FaceManager.showFaceSelector = function(e, faceName, faceIndex, elem){
	e.stopPropagation();
	const FILESYSTEM = require("fs"); 
	let _this = this;
	_this.visible = true;
	_this._searchBuffer = "";
	return new Promise(function(resolve, reject){	
		var path = require('path');
		var base = getBase();
		const dir = base+"img/faces";
		var availableFaceFiles = [];
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
				selected.scrollIntoView(false);
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
			
			var width = FaceManager.faceSize * FaceManager.faceScale + "px";
			var height = FaceManager.faceSize * FaceManager.faceScale + "px"
			for(var i = 0; i < FaceManager.faceFileRows; i++){
				for(var j = 0; j < FaceManager.faceFileColumns; j++){
					var top = i * FaceManager.faceSize * FaceManager.faceScale - 1 + "px";
					var left = j * FaceManager.faceSize * FaceManager.faceScale - 1 + "px";
					var idx = i * FaceManager.faceFileColumns + j;
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
			selectorContainer.style.width = FaceManager.faceFileColumns * FaceManager.faceSize * FaceManager.faceScale + "px";
			selectorContainer.style.height = FaceManager.faceFileRows * FaceManager.faceSize * FaceManager.faceScale + "px";
			selectorContainer.style.backgroundImage = "url('img/faces/"+faceName+".png')";		
			selectorContainer.style.backgroundSize = FaceManager.faceFileColumns * FaceManager.faceSize * FaceManager.faceScale + "px";
			
			var faceSelectors = container.querySelectorAll(".selection_pane .selector_square");
			faceSelectors.forEach(function(faceSelector){
				faceSelector.addEventListener("click", function(){
					container.style.display = "none";
					resolveResult({status: "updated", faceName: faceName, faceIndex: this.getAttribute("data-idx")});
				});
			});
			
		}
		
		function updateAll(){
			updateFaceList();
			updateFaceSelector();
		}
		
		updateAll();
		
		
		
		if(!FaceManager.hideHandler){
			FaceManager.hideHandler = editorContainer.addEventListener("click", function(){
				container.style.display = "none";
				_this.visible = false;
				resolveResult({status: "cancelled"});
			});
		
			//hacky, solution to hide element if the container holding the parent element is scrolled
			if(document.querySelector(".text_scroll_default")){
				document.querySelector(".text_scroll_default").addEventListener("scroll", function(){
					container.style.display = "none";
					_this.visible = false;
					resolveResult({status: "cancelled"});
				});	
			}			
		}	
		
		function handleKeySearch(e){
			_this._searchBuffer+=String.fromCharCode(e.which);
			var entries = container.querySelectorAll(".face_file_list .entry");
			let targetEntry;
			let ctr = 0;
			while(ctr < entries.length && !targetEntry){
				let entry = entries[ctr];				
				let name = entry.getAttribute("data-facename");
				if(name.toLowerCase().indexOf(_this._searchBuffer.toLowerCase()) == 0){
					targetEntry = entry;
				}					
				ctr++;
			}				
			if(targetEntry){
				//targetEntry.scrollIntoView();
				faceName = targetEntry.getAttribute("data-facename");
				updateAll();
			}
			if(_this._searchInterval){
				clearInterval(_this._searchInterval);
			}
			_this._searchInterval = setInterval(function(){
				_this._searchBuffer = "";
				clearInterval(_this._searchInterval);
			}, 1500);
		}
	
		document.addEventListener("keydown", handleKeySearch);
		
		
		function resolveResult(result){		
			document.removeEventListener("keydown", handleKeySearch);			
			resolve(result);
		}
	});
}