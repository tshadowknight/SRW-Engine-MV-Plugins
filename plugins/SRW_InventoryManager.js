function SRWInventoryManager(){	
	this._holderLookup;
}

SRWInventoryManager.prototype.getInventorybase = function(){
	var result = {};
	for(var i = 0; i < $itemEffectManager.getDefinitionCount(); i++){
		result[i] = {
			count: 0,
			holders: []
		};
	}
	return result;
}

SRWInventoryManager.prototype.getCurrentHolderLookup = function(){
	var _this = this;
	if(!_this._holderLookup){
		_this._holderLookup = {};
		var inventory = _this.getCurrentInventory();
		Object.keys(inventory).forEach(function(itemIdx){
			var holders = inventory[itemIdx].holders;
			for(var i = 0; i < holders.length; i++){
				if(!_this._holderLookup[holders[i].mechId]){
					_this._holderLookup[holders[i].mechId] = [];
				}
				_this._holderLookup[holders[i].mechId][holders[i].slot] = itemIdx;
			}
		});
	} 
	return _this._holderLookup;
}

SRWInventoryManager.prototype.getActorItemIds = function(mechId){
	var result = [];
	var holderLookup = this.getCurrentHolderLookup()[mechId];
	if(holderLookup){
		result = holderLookup;
	}
	return result;
}

SRWInventoryManager.prototype.getCurrentInventory = function(){
	var inventoryBase = this.getInventorybase();
	var storedInventoryState = {};
	if($gameSystem.inventoryData){
		storedInventoryState = $SRWSaveManager.getInventoryData();
	} 	
	Object.keys(storedInventoryState).forEach(function(itemIdx){
		inventoryBase[itemIdx] = storedInventoryState[itemIdx];
	});
	return inventoryBase;
}

SRWInventoryManager.prototype.updateCurrentInventory = function(inventory){
	this._holderLookup = null;
	$SRWSaveManager.setInventoryData(inventory);
}

SRWInventoryManager.prototype.addItem = function(itemIdx){
	var inventory = this.getCurrentInventory();
	if(inventory[itemIdx]){
		inventory[itemIdx].count++;
		inventory[itemIdx].discovered = true;
	} else {
		console.log("An item with an invalid item index("+itemIdx+") was attempted to be added to the inventory");
	}
	this.updateCurrentInventory(inventory);
}

SRWInventoryManager.prototype.removeItem = function(itemIdx){
	var inventory = this.getCurrentInventory();
	if(inventory[itemIdx]){
		if(inventory[itemIdx].count){
			if(inventory[itemIdx].count > inventory[itemIdx].holders.length){
				inventory[itemIdx].count--;
			} else {
				console.log("Attempted to remove an item("+itemIdx+") while all instances of it are held by an actor");
			}			
		} else {
			console.log("Attempted to remove an item("+itemIdx+") while none were in the inventory");
		}		
	} else {
		console.log("An item with an invalid item index("+itemIdx+") was attempted to be removed to the inventory");
	}
	this.updateCurrentInventory(inventory);
}

SRWInventoryManager.prototype.addItemHolder = function(itemIdx, mechId, slot){
	var inventory = this.getCurrentInventory();
	if(inventory[itemIdx]){
		if(inventory[itemIdx].count){
			if(inventory[itemIdx].count > inventory[itemIdx].holders.length){
				
				var currentItems = this.getActorItemIds(mechId);
				if(currentItems[slot]){
					var conflictIdx = -1;
					var ctr = 0;
					while(conflictIdx == -1 && ctr < inventory[currentItems[slot]].holders.length){
						if(inventory[currentItems[slot]].holders[ctr].mechId == mechId && inventory[currentItems[slot]].holders[ctr].slot == slot){
							conflictIdx = ctr;
						}
						ctr++;
					}		
					if(conflictIdx != -1){	
						inventory[currentItems[slot]].holders.splice(conflictIdx, 1);
						console.log("Conflicting item found in target slot("+slot+") during addItemHolder, previous item was unequipped");
					}
				}				
				inventory[itemIdx].holders.push({mechId: mechId, slot: slot});
			} else {
				console.log("Attempted to assign an item("+itemIdx+") while all instances of it are held by an actor");
			}			
		} else {
			console.log("Attempted to assign an item("+itemIdx+") while none were in the inventory");
		}
	} else {
		console.log("An item with an invalid item index("+itemIdx+") was attempted to be assigned to a holder");
	}
	this.updateCurrentInventory(inventory);
}

SRWInventoryManager.prototype.lockMechPartsForTransfer = function(mechId){
	if(!$gameSystem.lockedPartsTransferInfo){
		$gameSystem.lockedPartsTransferInfo = {};
	}
	$gameSystem.lockedPartsTransferInfo[mechId] = true;
}

SRWInventoryManager.prototype.unlockMechPartsForTransfer = function(mechId){
	if(!$gameSystem.lockedPartsTransferInfo){
		$gameSystem.lockedPartsTransferInfo = {};
	}
	$gameSystem.lockedPartsTransferInfo[mechId] = false;
}

SRWInventoryManager.prototype.islockedForTransfer = function(mechId){
	if(!$gameSystem.lockedPartsTransferInfo){
		$gameSystem.lockedPartsTransferInfo = {};
	}
	return $gameSystem.lockedPartsTransferInfo[mechId];
}

SRWInventoryManager.prototype.removeItemHolder = function(mechId, slot){
	var inventory = this.getCurrentInventory();
	
	var currentItems = this.getActorItemIds(mechId);
	var itemIdx = currentItems[slot];
	
	if(inventory[itemIdx]){
		if(inventory[itemIdx].count){
			var holderIdx = -1;
			var ctr = 0;
			while(holderIdx == -1 && ctr < inventory[itemIdx].holders.length){
				if(inventory[itemIdx].holders[ctr].mechId == mechId && inventory[currentItems[slot]].holders[ctr].slot == slot){
					holderIdx = ctr;
				}
				ctr++;
			}
			if(holderIdx != -1){
				inventory[itemIdx].holders.splice(holderIdx, 1);
			} else {
				console.log("Attempted to remove an item("+itemIdx+") that was not being held by the holder");
			}			
		} else {
			console.log("Attempted to remove an item("+itemIdx+") while none were in the inventory");
		}
	} else {
		console.log("An item with an invalid item index("+itemIdx+") was attempted to be removed from a holder");
	}
	this.updateCurrentInventory(inventory);
}
