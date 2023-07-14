$SRWConfig.terrainTypes = function(){
	this.addDefinition(//air
		1, //tile_association
		null, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"fly", //name of the ability that enables this terrain for a unit
		1, //moveENCost
		true,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "superState", value: 1}, {type: "terrainEnabled", value: 1}],
		],
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
		],
		0,//opacityMod 0-255
		{floatAmount: 10, displayShadow: true},//displaysFlying,
		true, //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain
		true, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		1,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		2,//preference, used to assign a super state if none is currently set
		0, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed.
		true,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		true,//canAttack, if false a unit in this terrain state cannot attack
		[],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled
	);
	
	this.addDefinition(//lnd
		2, //tile_association
		null, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"land_enabled", //name of the ability that enables this terrain for a unit
		0, //moveENCost
		false,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "superState", value: 1}],
			[{type: "terrainEnabled", value: 2}],
		],
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
			{startState: -1, endState: 1, cmdName: "Fly", se: "SRWFloat"},
			{startState: 1, endState: 5, cmdName: "Hover", se: "SRWFloat"},
			{startState: 1, endState: -1, cmdName: "Land", se: "SRWLand"},			
			{startState: 5, endState: 1, cmdName: "Fly", se: "SRWFloat"},
			
			{startState: -1, endState: 6, cmdName: "Dig", se: "SRWSubmerge"},		
			{startState: 1, endState: 6, cmdName: "Dig", se: "SRWSubmerge"},
			
			{startState: 6, endState: 1, cmdName: "Fly", se: "SRWFloat"},
			{startState: 6, endState: -1, cmdName: "Emerge", se: "SRWFloat"},
			
			{startState: -1, endState: 5, cmdName: "Hover", se: "SRWFloat"},//this rule is required to make the unit able to be forced into the hover state when deployed
		],
		0,//opacityMod 0-255
		null, //displaysFlying
		false, //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain
		false, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		1,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		0,//preference
		0, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed
		true,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		true,//canAttack, if false a unit in this terrain state cannot attack
		[],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled
	);
	
	this.addDefinition(//water
		3, //tile_association
		null, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"water_enabled", //name of the ability that enables this terrain for a unit
		0, //moveENCost
		false,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "superState", value: 1}],//allow a flying unit to enter water terrain
			[{type: "superState", value: 5}],//allow a hovering unit to enter water terrain
			[{type: "terrainEnabled", value: 3}],//allow a unit with water compatibility to enter 
		],		
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
			[{type: "superState", value: 6}],//make sure a digging unit can't enter water
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
			{startState: -1, endState: 1, cmdName: "Fly", se: "SRWFloat"},// add the ability to transition to the flight super state
			{startState: 1, endState: 5, cmdName: "Hover", se: "SRWFloat"},// add the ability to transition to the Hover super state(should be unused, since hover is always forced)
			{startState: 1, endState: -1, cmdName: "Submerge", se: "SRWSubmerge"},// add the ability to transition to the water state
			{startState: 5, endState: 1, cmdName: "Fly", se: "SRWFloat"},// add the ability to transition from hover to fly when on water terrain
			
			{startState: -1, endState: 5, cmdName: "Hover", se: "SRWFloat"},//this rule is required to make the unit able to be forced into the hover state when deployed
		],
		-120,//opacityMod 0-255
		null, //displaysFlying
		false, //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain
		false, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		2,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		0,//preference, if > 0 this terrain state will be preffered when deploying a unit
		0, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed
		true,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		true,//canAttack, if false a unit in this terrain state cannot attack
		[],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled
	);
	
	this.addDefinition(//water
		4, //tile_association
		null, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"space_enabled", //name of the ability that enables this terrain for a unit
		0, //moveENCost
		true,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "terrainEnabled", value: 4}],
		],
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
		],
		0,//opacityMod 0-255
		null, //displaysFlying
		false, //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain
		false, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		1,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		0,//preference
		0, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed
		true,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		true,//canAttack, if false a unit in this terrain state cannot attack
		[],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled
	);
	
	this.addDefinition(//water
		5, //tile_association
		2, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"hover_enabled", //name of the ability that enables this terrain for a unit
		1, //moveENCost
		false,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "terrainEnabled", value: 5}],
		],
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
		],
		0,//opacityMod 0-255
		{floatAmount: 5, displayShadow: true},//displaysFlying,
		[3], //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain. If a list is provided only terrain of the listed types is ignored.
		false, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		1,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		1,//preference
		1, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed
		true,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		true,//canAttack, if false a unit in this terrain state cannot attack
		[],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled

	);
	
	this.addDefinition(//dig
		6, //tile_association
		2, //alias, if not null use the terrain with the specified id instead for relevant terrain calculations
		"dig_enabled", //name of the ability that enables this terrain for a unit
		0, //moveENCost
		false,//hide shadows for battles on this terrain in the battle scene
		[//entry rules. entry is permitted if any line in the rules matches. For a line to match all conditions for that line must match.
			[{type: "terrainEnabled", value: 6}],
		],
		[//entry forbidden rules. entry is forbidden if any line in the rules matches. For a line to match all conditions for that line must match. Always supersedes entry rules!
		],
		[//super state transition settings. Defines into which terrain super states a unit can go when on this terrain and when in which super state. -1 is none.
		],
		-160,//opacityMod 0-255
		{floatAmount: -4, displayShadow: false},//displaysFlying,
		true, //ignoresTerrainCost if true the movement cost from terrain tags will not be applied if the unit is on this terrain. If a list is provided only terrain of the listed types is ignored.
		true, //ignoresTerrainCollision if true the movement will not be affected by the tile collisions for tiles of this terrain
		1,//moveCostMod only applies if the movement type is with penalty. If greater than 1 the option to select with penalty is added to the mech UI.
		0,//preference
		0, //priority, if > 0 a unit will be forced into the terrain type with the higher priority when deployed
		false,//canBeTargeted, if false a unit in this terrain state cannot be targeted
		false,//canAttack, if false a unit in this terrain state cannot attack
		[18],//regionBlacklist, any region ids in this list will be treated as solid when on this terrain, even if ignoresTerrainCollision is enabled
	);
}