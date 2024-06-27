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
	var retargetCoordLookup = {};
		
	var maxCoord = 0;
	
	function updateCoordInfo(tileCoordinates, offset, coordLookup){
		if(!offset){
			offset = {x: 0, y: 0};
		}
		for(var coord of tileCoordinates){
			const x = coord[0] + offset.x;
			const y = coord[1] + offset.y;
			if(x > maxCoord){
				maxCoord = x;
			}
			if(y > maxCoord){
				maxCoord = y;
			}
			if(!coordLookup[x]){
				coordLookup[x] = {};
			}
			coordLookup[x][y] = true;
		}
	}
	updateCoordInfo(tileCoordinates, null, coordLookup);
	
	
	if(mapAttackDef.retargetInfo){
		var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
		let initialPos = mapAttackDef.retargetInfo.initialPosition;
		let center = mapAttackDef.retargetInfo.center;
		const offset = {
			x: initialPos.x - center.x,
			y: initialPos.y - center.y
		};
		updateCoordInfo(tileCoordinates, offset, retargetCoordLookup);
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
			if(retargetCoordLookup[refX] && retargetCoordLookup[refX][refY]){
				classes = ["grid_block", "retarget_tile"];
				previewContent+="<div style='border: "+borderSize+"px solid rgba(255,255,255,0.75); width: "+blockSize+"px; height: "+blockSize+"px; top: "+(j * fullSize)+"px; left: "+(i * fullSize)+"px;' class='"+(classes.join(" "))+"'>";
				previewContent+="</div>";
			}
			
			
		}
	}
	
	
	
	previewContent+="</div>";
	this._container.innerHTML = previewContent;	
}