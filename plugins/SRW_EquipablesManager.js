function SRWEquipablesManager(){	
	this._holderLookup;
}

/*
result[i] = {
	weaponId: 0,
	instanceId: 0,
	holder: -1,
	slot: -1,
	upgrades: 0
};
*/

SRWEquipablesManager.prototype.getInventorybase = function(){
	return [];
}

SRWEquipablesManager.prototype.getCurrentHolderLookup = function(){
	var _this = this;
	if(!_this._holderLookup){
		_this._holderLookup = {};
		var inventory = _this.getCurrentInventory();
		for(let i = 0; i < inventory.length; i++){
			const weapon = inventory[i];
			weapon.equipableIdx = i;
			if(!_this._holderLookup[weapon.holder]){
				_this._holderLookup[weapon.holder] = {};
			}
			_this._holderLookup[weapon.holder][weapon.slot] = weapon;
		}
	}
	return _this._holderLookup;
}

SRWEquipablesManager.prototype.getActorItems = function(mechId){
	return this.getCurrentHolderLookup()[mechId] || [];
}

SRWEquipablesManager.prototype.getActorItemIds = function(mechId){
	let result = [];
	let items = this.getActorItems(mechId);
	for(let slot in items){
		const itemDef = items[slot];
		if(itemDef){
			result.push(itemDef.weaponId);
		}
	}
	return result;
}

SRWEquipablesManager.prototype.getCurrentInventory = function(){
	let inventoryBase = this.getInventorybase();
	const storedInventoryState = $SRWSaveManager.getEquipablesData() || [];
	
	Object.keys(storedInventoryState).forEach(function(itemIdx){
		inventoryBase[itemIdx] = storedInventoryState[itemIdx];
	});
	return inventoryBase;
}

SRWEquipablesManager.prototype.updateCurrentInventory = function(inventory){
	this._holderLookup = null;
	$SRWSaveManager.setEquipablesData(inventory);
}

SRWEquipablesManager.prototype.addItem = function(weaponId){
	var inventory = this.getCurrentInventory();	
	if(inventory.length > 2000){
		console.log("Global equipable weapons inventory limit exceeded. The new weapon was not added.");
		return;
	}
	
	let lastInstanceId = -1;
	
	for(let item of inventory){
		if(item.weaponId == weaponId){
			lastInstanceId++;
		}
	}
	inventory.push({
		weaponId: weaponId,
		instanceId: lastInstanceId+1,
		holder: -1,
		slot: -1,
		upgrades: 0
	});
	
	this.updateCurrentInventory(inventory);
	return lastInstanceId+1;
}

SRWEquipablesManager.prototype.getItemIdx = function(weaponId, instanceId){
	var inventory = this.getCurrentInventory();	
	let targetIdx = -1;
	
	for(let i = 0; i < inventory.length; i++){
		const item = inventory[i];
		if(item.weaponId == weaponId && item.instanceId == instanceId){
			targetIdx = i;
		}
	}
	
	return targetIdx;
}

SRWEquipablesManager.prototype.removeItem = function(weaponId, instanceId){
	var inventory = this.getCurrentInventory();	
	const targetIdx = this.getItemIdx(weaponId, instanceId);
	
	if(targetIdx != -1){
		inventory.splice(targetIdx, 1);
	}	
	
	this.updateCurrentInventory(inventory);
}

SRWEquipablesManager.prototype.addItemHolder = function(weaponId, mechId, slot){
	if(this.isDuplicate(weaponId, mechId)){
		console.log("Attempted to assign a duplicate item("+weaponId+") to mech '"+mechId+"'!");
		return false;
	}
	
	var inventory = this.getCurrentInventory();
	let targetIdx = -1;
	
	for(let i = 0; i < inventory.length; i++){
		const item = inventory[i];
		if(item.weaponId == weaponId && item.holder == -1){
			targetIdx = i;
		}
	}
	if(targetIdx != -1){
		inventory[targetIdx].holder = mechId;
		inventory[targetIdx].slot = slot;
	} else {
		console.log("Attempted to assign an instance of item " + weaponId + " when none are available in the inventory!");
	}
	this.updateCurrentInventory(inventory);
}

SRWEquipablesManager.prototype.clearHolderSlot = function(mechId, slot){
	var inventory = this.getCurrentInventory();
	for(let i = 0; i < inventory.length; i++){
		const item = inventory[i];
		if(item.holder == mechId && item.slot == slot){
			item.holder = -1;
			item.slot = -1;
		}
	}
}

SRWEquipablesManager.prototype.isDuplicate = function(weaponId, mechId){
	let currentItems = this.getActorItemIds(mechId);
	if(!ENGINE_SETTINGS.ALLOW_DUPLICATE_EQUIPS && currentItems.indexOf(weaponId) != -1){
		console.log("Attempted to assign a duplicate item("+weaponId+") to mech '"+mechId+"'!");
		return true;
	}	
	return false;
}

SRWEquipablesManager.prototype.setItemHolder = function(weaponId, instanceId, mechId, slot){
	var inventory = this.getCurrentInventory();
	if(this.isDuplicate(weaponId, mechId)){
		console.log("Attempted to assign a duplicate item("+weaponId+") to mech '"+mechId+"'!");
		return false;
	}	
	
	const targetIdx = this.getItemIdx(weaponId, instanceId);
	this.clearHolderSlot(mechId, slot);
	
	inventory[targetIdx].holder = mechId;
	inventory[targetIdx].slot = slot;
	
	this.updateCurrentInventory(inventory);
}


SRWEquipablesManager.prototype.removeItemHolder = function(weaponId, instanceId){
	var inventory = this.getCurrentInventory();
	const targetIdx = this.getItemIdx(weaponId, instanceId);
	
	inventory[targetIdx].holder = -1;
	inventory[targetIdx].slot = -1;
	
	this.updateCurrentInventory(inventory);
}

SRWEquipablesManager.prototype.setItemUpgrades = function(weaponId, instanceId, upgrades){
	var inventory = this.getCurrentInventory();
	const targetIdx = this.getItemIdx(weaponId, instanceId);

	inventory[targetIdx].upgrades = upgrades;
	
	this.updateCurrentInventory(inventory);
}