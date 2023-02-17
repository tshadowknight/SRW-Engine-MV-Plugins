$SRWConfig.abilityZones = function(){
	this.addDefinition(
		0, //the id of the command
		"Power Balance", //the display name of the command
		function(stackCount){
			if(stackCount <= 1){
				return {ally: "Boost Weapon Power by 500.", enemy: "Reduce weapon power by 500."} //the display description of the command
			} else {
				return {ally: "Boost Weapon Power by 1000.", enemy: "Reduce weapon power by 500."} //the display description of the command
			}			
		},
		2, //upgradesWhenStacked		
		function(actor, stackCount){ //the function that applies the effect of the command to allies
			if(stackCount <= 1){
				return [
					{type: "weapon_ranged", modType: "addFlat", value: 500},
					{type: "weapon_melee", modType: "addFlat", value: 500}
				];
			} else {
				return [
					{type: "weapon_ranged", modType: "addFlat", value: 1000},
					{type: "weapon_melee", modType: "addFlat", value: 1000}
				];
			}			
		},
		function(actor, stackCount){ //the function that applies the effect of the command to enemies
			return [
				{type: "weapon_ranged", modType: "addFlat", value: -500},
				{type: "weapon_melee", modType: "addFlat", value: -500}
			];
		}
	);	

	this.addDefinition(
		1, //the id of the command
		"Evade Up", //the display name of the command
		function(stackCount){
			if(stackCount <= 1){
				return {ally: "Raise evade by 20%.", enemy: ""}
			} else {
				return {ally: "Raise evade by 30%.", enemy: ""}
			}	
		},
		2, //upgradesWhenStacked		
		function(actor, stackCount){ //the function that applies the effect of the command to allies
			if(stackCount <= 1){
				return [
					{type: "evade", modType: "addFlat", value: 20},
				];
			} else {
				return [
					{type: "evade", modType: "addFlat", value: 30},
				];
			}			
		},
		function(actor, stackCount){ //the function that applies the effect of the command to enemies
		
		}
	);		
}