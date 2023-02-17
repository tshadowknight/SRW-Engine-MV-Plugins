$SRWConfig.weaponEffects = function(){
	this.addDefinition(
		0, 
		"Barrier Piercing", 
		"Ignores barriers on the target.", 
		false,
		false,
		function(actor, level){
			return [{type: "pierce_barrier", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		1, 
		"Ignore Size", 
		"Ignore negative effects of the target's size when attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "ignore_size", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"Accuracy Down", 
		"Accuracy reduced by 30 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_accuracy_down", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"Mobility Down", 
		"Mobility reduced by 30 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_mobility_down", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"Armor Down", 
		"Armor halved for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_armor_down", modType: "addFlat", value: 500}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		5, 
		"Movement Down", 
		"Movement reduced by 3 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_move_down", modType: "addFlat", value: 3}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"Attack Power Down", 
		"Attack Power reduced by 500 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_attack_down", modType: "addFlat", value: 500}];
		},
		function(actor, level){
			return true;
		}
	);

	this.addDefinition(
		7, 
		"Range Down", 
		"Attack Range reduced by 3 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_range_down", modType: "addFlat", value: 3}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"SP Down", 
		"SP reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_SP_down", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"Will Down", 
		"Will reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_will_down", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		10, 
		"Self-destruct", 
		"The unit will be destroyed after using this attack.", 
		false,
		false,
		function(actor, level){
			return [{type: "self_destruct", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		11, 
		"Self-destruct(Hit)", 
		"The unit will be destroyed after using this attack and hitting its target.", 
		false,
		false,
		function(actor, level){
			return [{type: "self_destruct_hit", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		12, 
		"Disable", 
		"The target will be unable to act for a turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_disable", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		13, 
		"Seal Spirits", 
		"The target will be unable to use spirit commands for a turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_spirit_seal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
}