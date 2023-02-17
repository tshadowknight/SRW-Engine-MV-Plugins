import Window_CSS from "./Window_CSS.js";
import "./style/mapAttackPreview.css";

export default function MapAttackPreview(container){
	this._container = container;	
}

MapAttackPreview.prototype.showPreview = function(attack){
	
		
	
	var previewContent = "";	
	
	var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
	var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.shape));	
	
	var coordLookup = {};
		
	var maxCoord = 0;
	for(var coord of tileCoordinates){
		if(coord[0] > maxCoord){
			maxCoord = coord[0];
		}
		if(coord[1] > maxCoord){
			maxCoord = coord[1];
		}
		if(!coordLookup[coord[0]]){
			coordLookup[coord[0]] = {};
		}
		coordLookup[coord[0]][coord[1]] = true;
	}
	var gridSize = maxCoord + 1;		
	if(mapAttackDef.lockRotation){
		gridSize*= 2;	
	} 
	if(!(gridSize % 2)){
		gridSize++;
	}
	
	//padding
	gridSize+=2;
	
	var refPosition = {x: 0, y: 0}
	if(mapAttackDef.lockRotation){
		refPosition = {
			x: Math.floor(gridSize / 2),
			y: Math.floor(gridSize / 2),
		};
	} else {
		refPosition = {
			x: 1,
			y: Math.floor(gridSize / 2),
		};
	}
	
	var blockSize = (140 * Graphics.getScale()) / gridSize;
	var fullSize = blockSize;
	var borderPercent = 2;
	var borderSize = Math.ceil(blockSize / 100 * borderPercent / 2);
	blockSize-= borderSize * 2;
	previewContent+="<div class='preview_grid'>";
	for(var i = 0; i < gridSize; i++){
		for(var j = 0; j < gridSize; j++){	
			var classes = ["grid_block"];
			if(i == refPosition.x && j == refPosition.y){
				classes.push("source_tile");
			}
			var refX = i - refPosition.x;
			var refY = j - refPosition.y;
			
			if(coordLookup[refX] && coordLookup[refX][refY]){
				classes.push("attack_tile");
				if(attack.ignoresFriendlies){
					classes.push("ignore_friendlies");
				}
			}
			
			
			previewContent+="<div style='border: "+borderSize+"px solid rgba(255,255,255,0.75); width: "+blockSize+"px; height: "+blockSize+"px; top: "+(j * fullSize)+"px; left: "+(i * fullSize)+"px;' class='"+(classes.join(" "))+"'>";
			previewContent+="</div>";
		}
	}
	previewContent+="</div>";
	this._container.innerHTML = previewContent;	
}