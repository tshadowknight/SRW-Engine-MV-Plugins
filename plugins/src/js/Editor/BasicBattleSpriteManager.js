import "./style/menuSpriteSelector.css";
export default function BasicBattleSpriteManager(){
	
}

BasicBattleSpriteManager.showSelector = function(e, current, elem){
	var currentSearch = "";
	e.stopPropagation();
	if(!current){
		current = "none";
	}
	return new Promise(function(resolve, reject){	
		var path = require('path');
		var base = getBase();
		const dir = base+"img/basic_battle";
		var availableFiles = [];
		const FILESYSTEM = require("fs"); 
		FILESYSTEM.readdirSync(dir).forEach(function(file) {	
			file = file.replace(/\.png$/, "");
			availableFiles.push(file);		
		});	
		
		var editorContainer = document.querySelector("#srw_editor");
		
		var container;
		var containerId = "menu_selector_container";
		var container = editorContainer.querySelector("#menu_selector_container");
		if(!container){		
			container = document.createElement("div");
			container.id = "menu_selector_container";
			editorContainer.appendChild(container);	
			
			container.addEventListener("click", function(e){
				e.stopPropagation();
			});
		}
		var rect = elem.getBoundingClientRect();
		container.style.top = rect.top + "px";
		container.style.left = rect.right + 5 + "px";
		
		var content = "";
		content+="<div class='preview_selector'>";
		content+="<div class='controls'>";
		content+="<div class='label'>Search </div>";
		content+="<input class='search'></input>";
		content+="</div>";
		content+="<div class='selection_pane'>";
		
		content+="</div>";
		content+="</div>";
		
		container.innerHTML = content;
		container.style.display = "";
		
		
	
		
		function updateSelector(){
			var ctr = 0;
			var content = "";
			var ctr = 0;
			content+="<div class='selector_container'>";
			content+="<div class='row'>";
			content+="<div data-file='none' class='entry_container "+(current == "none" ? "selected" : "")+" '>";
			content+="<div class='entry'>";
			content+="None";
			content+="</div>";
			content+="</div>";
			availableFiles.forEach(function(file){
				if(file.toLowerCase().indexOf(currentSearch.toLowerCase()) != -1){
					if(!((ctr + 1) % 3)){
						content+="</div>";
						content+="<div class='row'>";
					}
					content+="<div data-file='"+file+"' class='entry_container "+(current == "file" ? "selected" : "")+"'>";
					content+="<div class='entry'>";
					content+="<img src='img/basic_battle/"+file+".png'/>";
					content+="</div>";
					content+="<div title='"+file+"' class='file_name'>";
					content+=file;
					content+="</div>";
					content+="</div>";
					ctr++;
				}				
			});
			content+="</div>";
			content+="</div>";
			
			/*content+="<div class='controls'>";
			content+="<div class='label '>Face name:</div>";
			content+="<div class='label'>"+faceName+"</div>";
			content+="<div class='label '>Face index:</div>";
			content+="<div class='label'>"+faceIndex+"</div>";
			content+="</div>";*/
			
			container.querySelector(".selection_pane").innerHTML = content;			
			
			var selectors = container.querySelectorAll(".selection_pane .entry_container");
			selectors.forEach(function(selector){
				selector.addEventListener("click", function(){
					container.style.display = "none";
					var path = this.getAttribute("data-file");
					if(path == "none"){
						path = "";
					}
					resolve({status: "updated", path: path});
				});
			});
			
		}
		
		function updateAll(){
			updateSelector();
			var containerRect = container.getBoundingClientRect();
			if(containerRect.bottom > window.innerHeight){
				container.style.top = rect.top - (containerRect.bottom - window.innerHeight + 5) + "px";
			}
		}
		
		updateAll();
		
		if(!BasicBattleSpriteManager.hideHandler){
			BasicBattleSpriteManager.hideHandler = editorContainer.addEventListener("click", function(){
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
		
		container.querySelector(".search").addEventListener("keyup", function(){
			currentSearch = this.value;
			updateAll();
		});
	});
}