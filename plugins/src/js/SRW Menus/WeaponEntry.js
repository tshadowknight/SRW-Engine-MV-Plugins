import "./style/ItemList.css";

export default function WeaponEntry(container, weaponData, windowProvider){
	this._container = container;	
	this._weaponData = weaponData;	
	this._windowProvider = windowProvider;
}

WeaponEntry.prototype.show = function(listType){
	let content = "";
	content+="<div class='weapon_entry_content scaled_text fitted_text'>";	
	
	content+="<div class='weapon_list_block'>";
	content+="<div class='fitted_text weapon_name'>";	
	content+=this._weaponData.name;
	
	if(this._weaponData.upgrades){
		content+="+"+this._weaponData.upgrades;
	}
	content+="</div>";
	content+="</div>";
	if(listType == "upgrades" && this._windowProvider){
		content+="<div class='weapon_list_block'>";
		content+="<div class='weapon_upgrades "+(this._weaponData.isActive ? "active" : "")+"'>";	
		content+=this._windowProvider.createUpgradeBar(this._weaponData.upgrades, this._weaponData.pendingUpgrades, "weapon_upgrade");
		content+="</div>";
		content+="</div>";
	}
	
	if(listType == "equip"){
		content+="<div class='weapon_list_block'>";
		content+="<div class='fitted_text weapon_weight'>";	
		content+=this._weaponData.weaponWeight;
		content+="</div>";
		content+="</div>";
	}
	content+="<div class='weapon_list_block'>";
	content+="<div class='weapon_owner_icon'>";	
	let menuImagePath = $statCalc.getBattleSceneInfo({
		SRWInitialized: true, 
		SRWStats: {
			mech: { 
				id: this._weaponData.holder
			}
		}
	}).menuSpritePath;
	if(menuImagePath){
		content+="<img class='actor_img' data-img='img/"+menuImagePath+"'>";
	}
	content+="</div>";
	content+="</div>";
	
	
	content+="</div>";
	this._container.innerHTML = content;
		
}

