$SRWConfig.relationShipbonuses = function(){
	this.addDefinition(
		0, 
		"Love", 
		"Increases damage with level.", 
		function(actor, level){
			var effects = [
				[{type: "final_damage", modType: "mult", value: 1.04}],
				[{type: "final_damage", modType: "mult", value: 1.08}],
				[{type: "final_damage", modType: "mult", value: 1.12}],
			];
			return effects[level];
		}
	);
	this.addDefinition(
		1, 
		"Friendship", 
		"Increases Hit/Evade with level.", 
		function(actor, level){
			var effects = [
				[{type: "evade", modType: "addFlat", value: 5}, {type: "hit", modType: "addFlat", value: 5}],
				[{type: "evade", modType: "addFlat", value: 10}, {type: "hit", modType: "addFlat", value: 10}],
				[{type: "evade", modType: "addFlat", value: 15}, {type: "hit", modType: "addFlat", value: 15}],
			];
			return effects[level];
		}
	);
	this.addDefinition(
		2, 
		"Rivalry", 
		"Increases Crit rate with level.", 
		function(actor, level){
			var effects = [
				[{type: "crit", modType: "addFlat", value: 5}],
				[{type: "crit", modType: "addFlat", value: 10}],
				[{type: "crit", modType: "addFlat", value: 15}],
			];
			return effects[level];
		}
	);
	this.addDefinition(
		3, 
		"Test", 
		"Increases Crit rate with level.", 
		function(actor, level){			
			return [
				{type: "HP_regen", modType: "addFlat", value: 30},
				{type: "EN_regen", modType: "addFlat", value: 30}
			];
		}
	);
}