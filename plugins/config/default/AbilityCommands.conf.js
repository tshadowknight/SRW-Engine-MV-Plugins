$SRWConfig.abilityCommands = function(){
	this.addDefinition(
		0, //the id of the command
		"Chalice", //the display name of the command
		"Recover HP and EN to full up to twice per stage.", //the display description of the command
		{type: "ammo", cost: 2}, //the cost for use
		function(actor){ //the function that applies the effect of the command to the user
			$statCalc.recoverHPPercent(actor, 100);
			$statCalc.recoverENPercent(actor, 100);
		}, function(actor){ //the function that checks if the command can be used
			return $statCalc.canRecoverEN(actor) || $statCalc.canRecoverHP(actor)
		},
		42 //the animation that should be played when the ability is used, -1 if none
	);	
	
	this.addDefinition(
		1, //the id of the command
		"Summon Illusion", //the display name of the command
		"Summon a ghostly copy of an enemy to fight on your side.", //the display description of the command
		{type: "MP", cost: 70}, //the cost for use
		function(actor){ //the function that applies the effect of the command to the user
			var event = $gameMap.requestDynamicEvent();			
			var space = $statCalc.getAdjacentFreeStandableSpace(actor, {x: actor.event.posX(), y: actor.event.posY()});			
			event.locate(space.x, space.y);
			
			var actor_unit = $gameActors.actor(14);//change this number to change the actor that is deployed
			actor_unit._mechClass = 10;
			
			var units = $statCalc.getAllActors("enemy");
			var classes = [];
			units.forEach(function(unit){
				classes.push(unit.SRWStats.mech.id);
			});
			
			var mechClass = classes[Math.floor(Math.random() * classes.length)];
			if(mechClass != null){
				actor_unit._mechClass = mechClass;
			}			
			
			$statCalc.initSRWStats(actor_unit, actor.SRWStats.pilot.level);			
			if(actor_unit && event){
				event.setType("actor");
				$gameSystem.deployActor(actor_unit, event, false);		
				$statCalc.setCustomMechStats(actor_unit, {maxHP: 10000, armor: 500, mobility: 130});				
			}
			
			event.appear();
			event.refreshImage();
		}, function(actor){ //the function that checks if the command can be used
			return $statCalc.getAdjacentFreeStandableSpace(actor, {x: actor.event.posX(), y: actor.event.posY()}) != null;
		},
		102 //the animation that should be played when the ability is used, -1 if none
	);	
	
	this.addDefinition(
        2, //the id of the command
        "Summon Minion", //the display name of the command
        "Summons a minion with support attack to aid you. Up to 4 uses per stage", //the display description of the command
        4, //the number of times the ability can be used per stage
        function(actor){            //the function that applies the effect of the command to the user
            var MinionSum = $statCalc.getStageTemp(actor, "MinionSum");
            if(!MinionSum){
                MinionSum = 0;
            }
                var baseID = 17+MinionSum;
      
                var event = $gameMap.requestDynamicEvent();            
               
                
                var actor_unit = $gameActors.actor(baseID);//change this number to change the actor that is deployed
                actor_unit._mechClass = 2;
                
				$SRWSaveManager.setPilotLevel(baseID,  actor.SRWStats.pilot.level);
				
                $statCalc.initSRWStats(actor_unit);            

				var space = $statCalc.getAdjacentFreeStandableSpace(actor_unit, {x: actor.event.posX(), y: actor.event.posY()});            
                event.locate(space.x, space.y);

                if(actor_unit && event){
                    event.setType("actor");
                    $gameSystem.deployActor(actor_unit, event, false);                
                }
            MinionSum++;
            $statCalc.setStageTemp(actor, "MinionSum", MinionSum);
                event.appear();
                event.refreshImage();
        }, function(actor){ //the function that checks if the command can be used
			return true;
        },
        102 //the animation that should be played when the ability is used, -1 if none
    ); 
	this.addDefinition(
        3, //the id of the command
        "Set Zone", //the display name of the command
        "Sets Zone 1", //the display description of the command
        2, //the number of times the ability can be used per stage
        function(actor){//the function that applies the effect of the command to the user
           $gameSystem.setActorAbilityZone(actor, {
				trackingId: "abi_3_"+actor.actorId(),//id for the zone deployment, used to check if it is up
				pattern: 1,//the pattern defined in the pattern editor, will be centered on the actor
				abilityId: 0,//the id of the effect definition in ZoneAbilities.conf.js
				followsOwner: true,//if true the zone moves with the setter, otherwise it stays put
				color: "#FF0000",			
				phaseCount: 2,//the number of phases the zone stays active, only used if expires == true
				expires: true
		   });
        }, function(actor){ //the function that checks if the command can be used
			//check if there are still slots to set at least one zone, and check if the actor doesn't currently have this zone up
			return $gameSystem.canActorSetZones(1) && !$gameSystem.isZoneDeployed("abi_3_"+actor.actorId());
        },
        102 //the animation that should be played when the ability is used, -1 if none
    );

    this.addDefinition(
        4, //the id of the command
        "Ranged Chalice", //the display name of the command
        "Recover HP and EN to full up to twice per stage for all units within 5 range.", //the display description of the command
        {type: "ammo", cost: 2}, //the cost for use
        function(actor){ //the function that applies the effect of the command to the user
			const range = 5;
			const refEvent = $statCalc.getReferenceEvent(actor);
			if(refEvent){
				const position = {x: refEvent.posX(), y: refEvent.posY()};
				$statCalc.iterateAllActors("actor", function(actor, event){
					const inInRange = ((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) <= range);
					if(inInRange){
						$statCalc.recoverHPPercent(actor, 100);
						$statCalc.recoverENPercent(actor, 100);
					}
				});			
			}
			
        }, function(actor){ //the function that checks if the command can be used
			let hasValidTarget = false;
			const range = 5;
			const refEvent = $statCalc.getReferenceEvent(actor);
			if(refEvent){
				const position = {x: refEvent.posX(), y: refEvent.posY()};
				$statCalc.iterateAllActors("actor", function(actor, event){
					const inInRange = ((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) <= range);
					if(inInRange){
						if($statCalc.canRecoverEN(actor) || $statCalc.canRecoverHP(actor)){
							hasValidTarget = true;
						}
					}
				});			
			}
            return hasValidTarget;
        },
        42 //the animation that should be played when the ability is used, -1 if none
    );	
}