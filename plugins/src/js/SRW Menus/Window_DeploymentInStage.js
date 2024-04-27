import Window_CSS from "./Window_CSS.js";
import Window_DeploymentTwin from "./Window_DeploymentTwin.js";


import "./style/Window_Deployment.css"

export default function Window_DeploymentInStage() {
	this.initialize.apply(this, arguments);	
}

Window_DeploymentInStage.prototype = Object.create(Window_DeploymentTwin.prototype);
Window_DeploymentInStage.prototype.constructor = Window_DeploymentInStage;

Window_DeploymentInStage.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment_in_stage";	
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 5;
	
	this._availableRowSize = 4;
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
	this._twinSwapSource = -1;
	this._maxSlots = ENGINE_SETTINGS.MAX_DEPLOY_SIZE_TWIN || 40;
	if(!this.isTwinMode()){
		this._rearrageRowSize = 9;
		this._maxSlots = ENGINE_SETTINGS.MAX_DEPLOY_SIZE || 36;
	}
}
var Window_Deployment_createComponents = Window_DeploymentTwin.prototype.createComponents;
Window_DeploymentInStage.prototype.createComponents = function() {
	Window_Deployment_createComponents.call(this);
	var windowNode = this.getWindowNode();
	this._toolTip = document.createElement("div");
	this._toolTip.classList.add("scaled_text");
	this._toolTip.classList.add("tool_tip");
	this._toolTip.innerHTML = APPSTRINGS.DEPLOYMENT.label_in_stage;	
	windowNode.appendChild(this._toolTip);	
}

Window_DeploymentInStage.prototype.onCancel = function() {

}

Window_DeploymentInStage.prototype.setButtonHints = function() {	
	const items = Window_DeploymentTwin.prototype.setButtonHints.call(this);
	items.push(["deploy"]);
	return items;
}

Window_DeploymentInStage.prototype.onMenu = function(){
	//Input.clear();	
	var deployInfo = $gameSystem.getDeployInfo();
	var deployList;
	var count;
	if($gameTemp.deployMode != "ships"){
		deployList = $gameSystem.getDeployList();
		count = deployInfo.count;
	} else {
		deployList = $gameSystem.getShipDeployList();
		count = deployInfo.shipCount;
	}

	//$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()))
	var deployCount = 0;
	var activeDeployList = [];
	for(var i = 0; i < count; i++){
		activeDeployList.push(deployList[i]);
		if(!deployInfo.doNotDeploySlots[i] && deployList[i] && deployList[i].main != null){
			deployCount++;
		}
	}
	if(deployCount >= deployInfo.minDeployCount){		
		if($gameTemp.deployMode != "ships"){
			$gameSystem.setActiveDeployList(activeDeployList);
			$gameSystem.setSubBattlePhase("rearrange_deploys_init");
			$gameSystem.highlightDeployTiles();
			$gameTemp.buttonHintManager.hide();
			$gameSystem.redeployActors(false, true);
		} else {			
			$gameSystem.setActiveShipDeployList(activeDeployList);
			$gameTemp.popMenu = true;
			$gameTemp.buttonHintManager.hide();
			$gameSystem.deployShips(true);
			
			$gameMap._interpreter.setWaitMode("enemy_appear");
			$gameTemp.enemyAppearQueueIsProcessing = true;
			$gameTemp.unitAppearTimer = 0;		
		}			
	} else {
		SoundManager.playBuzzer();
	}
			
}
