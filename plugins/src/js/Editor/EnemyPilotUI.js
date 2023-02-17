import AllyPilotUI from "./AllyPilotUI.js";
import DBList from "./DBList.js";
import FaceManager from "./FaceManager.js";

export default function EnemyPilotUI(container, mainUIHandler){
	AllyPilotUI.call(this, container, mainUIHandler);
	this._dataFile = "data/EnemyPilots.json";
	this._vanillaFile = "data/Enemies.json";
	this._gameVar = "$dataEnemies";
}

EnemyPilotUI.prototype = Object.create(AllyPilotUI.prototype);
EnemyPilotUI.prototype.constructor = EnemyPilotUI;

EnemyPilotUI.prototype.initPropertyHandlers = function(){
	let _this = this;
	
	AllyPilotUI.prototype.initPropertyHandlers.call(this);
	let containerNode = _this._container;
	_this._propertyHandlers.face = {
		createControls(entry){
			return "<div class='portrait_preview unit_img_preview'></div>";
		},
		hook(entry){
			entry = _this.getCurrentEntry();
			function updatePortraitPreviews(){
				var divs = containerNode.querySelectorAll(".portrait_preview");
				divs.forEach(function(div){
					FaceManager.loadFaceByParams(_this.getMetaValue("faceName"),_this.getMetaValue("faceIndex") - 1, div);
				});
			}
			updatePortraitPreviews();
			
			var divs = containerNode.querySelectorAll(".portrait_preview");
			divs.forEach(function(div){
				div.addEventListener("click", async function(e){
					var elem = this;
					let result = await FaceManager.showFaceSelector(e, _this.getMetaValue("faceName"),_this.getMetaValue("faceIndex") - 1, this);
					if(result.status == "updated"){
						_this.setMetaValue("faceName", result.faceName);
						_this.setMetaValue("faceIndex", result.faceIndex * 1 + 1);
						_this.show();
						_this._mainUIHandler.isModified();
					}
				});			
			});
		}			
	}
	delete _this._propertyHandlers.relationships;
}

EnemyPilotUI.prototype.createRelationshipSection = function(){
	return "";
}



EnemyPilotUI.prototype.hookPageControls = function(){
	let _this = this;
	_this._container.querySelector("#abi_page_right").addEventListener("click", function(){
		if(_this._currentAbiPage < 19){
			_this._currentAbiPage++;
		}		
		_this.show();	
	});

}