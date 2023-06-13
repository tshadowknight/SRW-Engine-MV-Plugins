$SRWConfig.spirits = function(){
	this.addDefinition(
		0, 
		"Love", 
		"Commands Accel, Strike, Alert, Valor, Spirit, Gain and Fortune will take effect.", 
		function(target){
			$statCalc.modifyWill(target, 10);
			$statCalc.setSpirit(target, "accel");
			$statCalc.setSpirit(target, "strike");
			$statCalc.setSpirit(target, "alert");
			$statCalc.setSpirit(target, "valor");
			$statCalc.setSpirit(target, "spirit");
			$statCalc.setSpirit(target, "gain");
			$statCalc.setSpirit(target, "fortune");
		},
		"self",
		function(actor){
			var activeSpirits = $statCalc.getActiveSpirits(actor);
			return ( 
				$statCalc.canWillIncrease(actor) ||
				!activeSpirits.accel ||
				!activeSpirits.strike ||
				!activeSpirits.alert ||
				!activeSpirits.valor ||
				!activeSpirits.spirit ||
				!activeSpirits.gain ||
				!activeSpirits.fortune
			);
		}, 
		null,
		{
			src: "Love",
			duration: 800
		}
	);
	this.addDefinition(
		1, 
		"Cheer", 
		"Increases EXP gained by 100% for the next battle.", 
		function(target){
			$statCalc.setSpirit(target, "gain");
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).gain;
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).gain;
		}, 
		{
			src: "Gain",
			duration: 800
		}
	);
	this.addDefinition(
		2, 
		"Zeal", 
		"Grants the unit one extra action. You cannot stack this effect.", 
		function(target){
			$statCalc.setSpirit(target, "zeal");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).zeal;
		},
		null,
		{
			src: "Zeal",
			duration: 800
		}
	);
	this.addDefinition(
		3, 
		"Disrupt", 
		"Halves all enemy Accuracy % for one turn.", 
		function(target){
			$statCalc.setSpirit(target, "disrupt");
		},
		"enemy_all",
		null,
		null,
		{
			animId: 56
		}
	);
	this.addDefinition(
		4, 
		"Accel", 
		"Increases movement by 3 for yourself for one time. Effect will stay until you move.", 
		function(target){
			$statCalc.setSpirit(target, "accel");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).accel;
		}, 
		null,
		{
			src: "Accel",
			duration: 800
		}
	);
	this.addDefinition(
		5, 
		"Attune", 
		"Unit's Accuracy % becomes 100% for one turn.", 
		function(target){
			$statCalc.setSpirit(target, "strike");
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).strike;
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).strike;
		}, 
		{
			src: "Strike",
			duration: 600
		}
	);
	this.addDefinition(
		6, 
		"Spirit", 
		"Increases Morale by 10.", 
		function(target){
			$statCalc.modifyWill(target, 10);
		},
		"self",
		function(actor){
			return $statCalc.canWillIncrease(actor);
		}, 
		null,
		{
			src: "Spirit",
			duration: 800
		}
	);
	this.addDefinition(
		7, 
		"Bonds", 
		"Recovers 5000 HP for all ally units.", 
		function(target){
			$statCalc.recoverHP(target, 5000);
		},
		"ally_all",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				var mechStats = $statCalc.getCalculatedMechStats(actors[ctr++]);	
				isValid = mechStats.currentHP < mechStats.maxHP;
			}
			return isValid;
		}, 
		null,
		{	
			animId: 44,				
		}
	);
	this.addDefinition(
		8, 
		"Prospect", 
		"Recovers 30 SP for an ally unit's main pilot.", 
		function(target){
			$statCalc.recoverSP(target, 30);
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				var pilotStats = $statCalc.getCalculatedPilotStats(actors[ctr++]);
				isValid = pilotStats.currentSP < pilotStats.SP;
			}
			return isValid;
		},
		function(actor){
			var pilotStats = $statCalc.getCalculatedPilotStats(actor);
			return pilotStats.currentSP < pilotStats.SP;
		}, 
		{
			src: "Prospect",
			duration: 800
		}
	);
	this.addDefinition(
		9, 
		"Drive", 
		"Increases Morale by 30.", 
		function(target){
			$statCalc.modifyWill(target, 30);
		},
		"self",
		function(actor){
			return $statCalc.canWillIncrease(actor);
		}, 
		null,
		{
			src: "Drive",
			duration: 800
		}
	);
	/*this.addDefinition(
		10, 
		"Wish", 
		"Recovers 50% HP for an ally unit. Recovers any negative status and applies Gain and Fortune.", 
		function(target){
			
		},
		"ally"
	);*/
	this.addDefinition(
		11, 
		"Rouse", 
		"Increases Morale by 10 for one ally.", 
		function(target){
			$statCalc.modifyWill(target, 10);
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = $statCalc.canWillIncrease(actors[ctr++]);
			}
			return isValid;
		},
		function(actor){
			return $statCalc.canWillIncrease(actor);

		}, 
		{
			src: "Spirit",
			duration: 800
		}
	);
	this.addDefinition(
		12, 
		"Fortune", 
		"Next time this unit defeats an enemy, increases money gained by 100%.", 
		function(target){
			$statCalc.setSpirit(target, "fortune");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).fortune;
		}, 
		null,
		{
			src: "Fortune",
			duration: 800
		}
	);
	this.addDefinition(
		13, 
		"Focus", 
		"For 1 turn, hit & evade rates increase by 30%.", 
		function(target){
			$statCalc.setSpirit(target, "focus");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).focus;
		}, 
		null,
		{
			src: "Focus",
			duration: 600
		}
	);
	this.addDefinition(
		14, 
		"Bless", 
		"Next time this unit defeats an enemy, increases money gained by 100%.", 
		function(target){
			$statCalc.setSpirit(target, "fortune");
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).fortune;
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).fortune;
		}, 
		{
			src: "Fortune",
			duration: 800
		}
	);
	this.addDefinition(
		15, 
		"Trust", 
		"Recovers 3000 HP for an ally unit.", 
		function(target){
			$statCalc.recoverHP(target, 3000);
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				var mechStats = $statCalc.getCalculatedMechStats(actors[ctr++]);	
				isValid = mechStats.currentHP < mechStats.maxHP;
			}
			return isValid;
		},
		function(actor){			
			var mechStats = $statCalc.getCalculatedMechStats(actor);	
			return mechStats.currentHP < mechStats.maxHP;			
		}, 
		{
			src: "Trust",
			duration: 800,
			recovered: 1
		}
	);
	this.addDefinition(
		16, 
		"Foresee", 
		"Allows one ally unit to completely evade attacks for one battle.", 
		function(target){
			$statCalc.setSpirit(target, "alert");
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).alert;
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).alert;
		}, 
		{
			src: "Alert",
			duration: 800
		}
	);
	this.addDefinition(
		17, 
		"Snipe", 
		"Increases Range by 2 for one battle for all weapons excluding RNG 1 and MAP weapons.", 
		function(target){
			$statCalc.setSpirit(target, "snipe");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).snipe;
		}, 
		null,
		{
			src: "Snipe",
			duration: 800
		}
	);
	this.addDefinition(
		18, 
		"Daunt", 
		"Decreases an enemy unit's Morale by 10. ", 
		function(target){
			$statCalc.modifyWill(target, -10);
		},
		"enemy",
		function(actor){
			var actors = $statCalc.getAllActors("enemy");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = $statCalc.canWillDecrease(actors[ctr++]);
			}
			return isValid;
		},
		function(actor){
			return $statCalc.canWillDecrease(actor);

		}, 
		{
			src: "Daunt",
			duration: 800
		}
	);
	this.addDefinition(
		19, 
		"Soul", 
		"Increases damage dealt by 120% for one time.", 
		function(target){
			$statCalc.setSpirit(target, "soul");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).soul;
		}, 
		null,
		{
			src: "Soul",
			duration: 800
		}
	);
	this.addDefinition(
		20, 
		"Intuition", 
		"Grants the effects of Strike and Alert.", 
		function(target){
			$statCalc.setSpirit(target, "alert");
			$statCalc.setSpirit(target, "strike");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).strike || !$statCalc.getActiveSpirits(actor).alert;
		}, 
		null,
		{
			src: "Intuition",
			duration: 800
		}
	);
	this.addDefinition(
		21, 
		"Mercy", 
		"Leaves enemy with 10 HP. Only affects enemies with lower SKL than yourself.", 
		function(target){
			$statCalc.setSpirit(target, "mercy");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).mercy;
		}, 
		null,
		{
			src: "Mercy",
			duration: 800
		}
	);
	this.addDefinition(
		22, 
		"Wall", 
		"Decrease damage taken by 75% for one turn.", 
		function(target){
			$statCalc.setSpirit(target, "wall");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).wall;
		}, 
		null,
		{
			src: "Wall",
			duration: 700
		}
	);
	this.addDefinition(
		23, 
		"Charge", 
		"You can use any weapon excluding map weapons after moving for one time.", 
		function(target){
			$statCalc.setSpirit(target, "charge");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).charge;
		}, 
		null,
		{
			src: "Charge",
			duration: 800
		}
	);
	
	this.addDefinition(
		24, 
		"Valor", 
		"Increases damage dealt by 100% for one time.", 
		function(target){
			$statCalc.setSpirit(target, "valor");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).valor;
		}, 
		null,
		{
			src: "Valor",
			duration: 800
		}
	);
	this.addDefinition(
		25, 
		"Strike", 
		"Unit's Accuracy % becomes 100% for one turn.", 
		function(target){
			$statCalc.setSpirit(target, "strike");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).strike;
		}, 
		null,
		{
			src: "Strike",
			duration: 600
		}
	);
	this.addDefinition(
		26, 
		"Alert", 
		"100% chance to evade the next attack.", 
		function(target){
			$statCalc.setSpirit(target, "alert");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).alert;
		}, 
		null,
		{
			src: "Alert",
			duration: 800
		}
	);
	this.addDefinition(
		27, 
		"Persist", 
		"Damage taken on the next hit becomes 10. Remains active until hit.", 
		function(target){
			$statCalc.setSpirit(target, "persist");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).persist;
		}, 
		null,
		{
			src: "Persist",
			duration: 700
		}
	);
	this.addDefinition(
		28, 
		"Analyze", 
		"Increases damage dealt to one enemy by 10% and decreases damage taken from that enemy by 10% for one turn.", 
		function(target){
			$statCalc.setSpirit(target, "analyse");
			$statCalc.setRevealed(target);
		},
		"enemy",
		function(actor){
			var actors = $statCalc.getAllActors("enemy");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).analyse;
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).analyse;
		}, 
		{
			src: "Analyze",
			duration: 800
		}
	);
	this.addDefinition(
		29, 
		"Resupply", 
		"Recovers all EN and ammo for an ally unit.", 
		function(target){
			$statCalc.recoverENPercent(target, 100);
			$statCalc.recoverAmmoPercent(target, 100);
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = $statCalc.canRecoverEN(actors[ctr]) || $statCalc.canRecoverAmmo(actors[ctr]);
				ctr++;
			}
			return isValid;
		},
		function(actor){
			return $statCalc.canRecoverEN(actor) || $statCalc.canRecoverAmmo(actor);
		}, 
		{
			src: "Resupply",
			duration: 800
		}
	);
	this.addDefinition(
		30, 
		"Bravery", 
		"Commands Accel, Strike, Persist, Valor, Spirit, and Charge will take effect.", 
		function(target){
			$statCalc.modifyWill(target, 10);
			$statCalc.setSpirit(target, "accel");
			$statCalc.setSpirit(target, "strike");
			$statCalc.setSpirit(target, "persist");
			$statCalc.setSpirit(target, "valor");
			$statCalc.setSpirit(target, "spirit");
			$statCalc.setSpirit(target, "charge");
		},
		"self",
		function(actor){
			var activeSpirits = $statCalc.getActiveSpirits(actor);
			return ( 
				$statCalc.canWillIncrease(actor) ||
				!activeSpirits.accel ||
				!activeSpirits.strike ||
				!activeSpirits.persist ||
				!activeSpirits.valor ||
				!activeSpirits.spirit ||
				!activeSpirits.charge 
			);
		}, 
		null,
		{
			src: "Bravery",
			duration: 800
		}
	);
	this.addDefinition(
		31, 
		"Faith", 
		"Recovers 6000 HP for an ally unit.", 
		function(target){
			$statCalc.recoverHP(target, 6000);
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				var mechStats = $statCalc.getCalculatedMechStats(actors[ctr++]);	
				isValid = mechStats.currentHP < mechStats.maxHP;
			}
			return isValid;
		},
		function(actor){			
			var mechStats = $statCalc.getCalculatedMechStats(actor);	
			return mechStats.currentHP < mechStats.maxHP;			
		}, 
		{
			src: "Faith",
			duration: 800,
			recovered: 1
		}
	);
	this.addDefinition(
		32, 
		"Guts", 
		"Fully recovers HP.", 
		function(target){
			$statCalc.recoverHPPercent(target, 100);
		},
		"self",
		function(actor){
			var mechStats = $statCalc.getCalculatedMechStats(actor);
			return mechStats.currentHP < mechStats.maxHP;
		}, 
		null,
		{
			src: "Guts",
			duration: 800,
			recovered: 1
		}
	);
	this.addDefinition(
		33, 
		"Miracle", 
		"All positive spirit commands are applied.", 
		function(target){
			$statCalc.modifyWill(target, 10);
			$statCalc.setSpirit(target, "accel");
			$statCalc.setSpirit(target, "strike");
			$statCalc.setSpirit(target, "alert");
			$statCalc.setSpirit(target, "valor");
			$statCalc.setSpirit(target, "spirit");
			$statCalc.setSpirit(target, "gain");
			$statCalc.setSpirit(target, "fortune");
			$statCalc.setSpirit(target, "soul");
			$statCalc.setSpirit(target, "zeal");
			$statCalc.setSpirit(target, "persist");
			$statCalc.setSpirit(target, "wall");
			$statCalc.setSpirit(target, "focus");
			$statCalc.setSpirit(target, "snipe");
		},
		"self",
		function(actor){
			var activeSpirits = $statCalc.getActiveSpirits(actor);
			return ( 
				$statCalc.canWillIncrease(actor) ||
				!activeSpirits.accel ||
				!activeSpirits.strike ||
				!activeSpirits.alert ||
				!activeSpirits.valor ||
				!activeSpirits.spirit ||
				!activeSpirits.gain ||
				!activeSpirits.fortune ||
				!activeSpirits.soul ||				
				!activeSpirits.zeal ||
				!activeSpirits.persist ||
				!activeSpirits.wall ||
				!activeSpirits.focus ||
				!activeSpirits.snipe 
			);
		}, 
		null,
		{
			src: "Miracle",
			duration: 800
		}
	);
	this.addDefinition(
		34, 
		"Enable", 
		"Grants an ally unit one extra action. You cannot stack this effect.", 
		function(target){
			if($statCalc.hasEndedTurn(target)){
				target.setSrpgTurnEnd(false);
				target.SRWStats.battleTemp.hasFinishedTurn = 0;
			} else {
				$statCalc.setSpirit(target, "zeal");
			}						
		},
		"ally",
		function(actor){
			var actors = $statCalc.getAllActors("actor");
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = !$statCalc.getActiveSpirits(actors[ctr++]).zeal || $statCalc.hasEndedTurn(actor);
			}
			return isValid;
		},
		function(actor){
			return !$statCalc.getActiveSpirits(actor).zeal || $statCalc.hasEndedTurn(actor);
		}, 
		{
			src: "Zeal",
			duration: 800
		}
	);
	this.addDefinition(
		35, 
		"Gain", 
		"Increases EXP gained by 100% for the next battle.", 
		function(target){
			$statCalc.setSpirit(target, "gain");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).gain;
		}, 
		null,
		{
			src: "Gain",
			duration: 800
		}
	);	
	this.addDefinition(
		36, 
		"Fury", 
		"Ignores the target's barrier, defensive abilites and size advantage for one attack.", 
		function(target){
			$statCalc.setSpirit(target, "fury");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).fury;
		}, 
		null,
		{
			src: "Focus",
			duration: 800
		}
	);	
	this.addDefinition(
		37, 
		"Strike+", 
		"Unit's Accuracy % becomes 100% for one turn. Also affects other unit in a twin.", 
		function(target){
			$statCalc.setSpirit(target, "strike");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).strike;
		}, 
		null,
		{
			src: "Strike",
			duration: 600
		},
		{maskedSpirit: 25}
	);
	
	this.addDefinition(
		38, 
		"Valor+", 
		"Increases damage dealt by 100% for one time. Also affects other unit in a twin.", 
		function(target){
			$statCalc.setSpirit(target, "valor");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).valor;
		}, 
		null,
		{
			src: "Valor",
			duration: 800
		},
		{maskedSpirit: 24}
	);
	
	this.addDefinition(
		39, 
		"Rouse", 
		"Increases Morale by 10 for adjacent allies.", 
		function(target){
			$statCalc.modifyWill(target, 10);
		},
		"ally_adjacent",
		function(actor){
			var referenceEvent = $statCalc.getReferenceEvent(actor);
			var actors = $statCalc.getAdjacentActors("actor", {x: referenceEvent.posX(), y: referenceEvent.posY()});
			var isValid = false;
			var ctr = 0;
			while(!isValid && ctr < actors.length){
				isValid = $statCalc.canWillIncrease(actors[ctr++]);
			}
			return isValid;
		},
		function(actor){
			return $statCalc.canWillIncrease(actor);

		}, 
		{	
			animId: 44,				
		}
	);
	
	this.addDefinition(
		40, 
		"Animation Test", 
		"Unit's Accuracy % becomes 100% for one turn. Also affects other unit in a twin.", 
		function(target){
			$statCalc.setSpirit(target, "strike");
		},
		"self",
		function(actor){
			return true;
		}, 
		null,
		{
			src: "Spirit",
			duration: 600
		}
	);
	
	this.addDefinition(
		41, 
		"Vigor", 
		"Recovers 30% HP.", 
		function(target){
			$statCalc.recoverHPPercent(target, 30);
		},
		"self",
		function(actor){
			return $statCalc.canRecoverHP(actor);	
		}, 
		null,
		{
			src: "Guts",
			duration: 800,
			recovered: 1
		}
	);
	
	this.addDefinition(
		42, 
		"Taunt", 
		"Enemies will target this unit for a turn.", 
		function(target){
			$statCalc.setSpirit(target, "taunt");
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).taunt;
		}, 
		null,
		{
			src: "Daunt",
			duration: 800
		}
	);
	
	this.addDefinition(
		43, 
		"Fortune", 
		"Increases critical rate by 30% and next time this unit defeats an enemy, increases money gained by 100%.", 
		function(target){
			$statCalc.setSpirit(target, "fortune");
			$statCalc.setTempEffect(target, [{type: "crit", modType: "mult", value: 1.3, phaseCount: 2}, {type: "spirit_43", phaseCount: 2}]);
		},
		"self",
		function(actor){
			return !$statCalc.getActiveSpirits(actor).fortune && !$statCalc.hasTempEffect(actor, "spirit_43");
		}, 
		null,
		{
			src: "Fortune",
			duration: 800
		}
	);
	
	this.addDefinition(
		44, 
		"Anim Test", 
		"Increases critical rate by 30% and next time this unit defeats an enemy, increases money gained by 100%.", 
		function(target){
			$statCalc.setSpirit(target, "fortune");
			$statCalc.setTempEffect(target, [{type: "crit", modType: "mult", value: 1.3, phaseCount: 2}, {type: "spirit_43", phaseCount: 2}]);
		},
		"self",
		function(actor){
			return true;
		}, 
		null,
		{
			src: "Focus",
			duration: 800
		}
	);
}