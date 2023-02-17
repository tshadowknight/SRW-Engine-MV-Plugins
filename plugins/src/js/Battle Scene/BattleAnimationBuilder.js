import * as BABYLON from "babylonjs";

export default function BattleAnimationBuilder(){	
	this._animLookup = {
		1: this.Rushia__Fan_Dead_Swarm,
		2: this.Broken_Dream__A_Dream_Shattered,
		3: this.Fubuki__seven_pages,
		4: this.Matsuri__Divine_Assertion
	}
}

BattleAnimationBuilder.prototype.buildAnimation = function(idx, context){
	if(this._animLookup[idx]){
		return this._animLookup[idx].call(context);
	} else {
		return null;
	}	
}	

BattleAnimationBuilder.mergeAnimationIntoList = function(idx, list, animation){
	if(!list[idx]){
		list[idx] = [];
	}
	list[idx] = list[idx].concat(animation);
}

BattleAnimationBuilder.prototype.Rushia__Fan_Dead_Swarm = function(){
	var _this = this;
	var mainAnimation = [];
	mainAnimation[0] = [
		//{type: "play_effekseer", target: "rushia_explosion2", params: {path: "rushia_explosion", layer: 0}},

		{type: "set_sprite_index", target: "active_main", params: {index: 1}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(2, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
	]
	
	mainAnimation[20] = [
		{type: "hide_bgs"},
		{type: "create_bg", target: "bg1", params: {billboardMode: 7, path: "rushia/rushia_bg1", position: new BABYLON.Vector3(0, 0, 30), size: {width: 200, height: 100}}},
	]
	mainAnimation[30] = [
		{type: "drain_en_bar", target: "", params: {percent: 100}},
		{type: "set_attack_text", target: "", params: {id: 0}},
		{type: "set_sprite_index", target: "active_main", params: {index: 0}},
		//{type: "spawn_sprite", target: "circle", params: {position: new BABYLON.Vector3(2, 10, 1), path: "rushia/circle", frameSize: 128, size: 30, animationFrames: 20, animationDelay: 100, animationLoop: true}},
		{type: "create_bg", target: "circle", params: {position: new BABYLON.Vector3(2, -1.5, 1), path: "rushia/circle", frameSize: 512, size: 4, animationFrames: 30, animationDelay: 100, animationLoop: true, lineCount: 8, columnCount: 4}},
		{type: "rotate_to", target: "circle", params: {rotation: new BABYLON.Vector3(Math.PI / 2, 0, 0)}},	
		{type: "resize", target: "circle", params: {duration: 30, startSize: 0, endSize: 1, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},

	]
	
	var skullSpawnStartTick = 40;
	var maxX = 25;
	var minX = 0;
	var maxY = 25;
	var minY = 0;
	var maxZ = 25;
	var minZ = 0;
	var xOffset = -12;
	var zOffset = -12;
	var yOffset = -12;
	var spawnedSkulls = [];
	for(var i = 0; i < 200; i++){
		var id = "skull" + i;
		var x = Math.floor(Math.random() * maxX);
		var y = Math.floor(Math.random() * maxY);
		var z = Math.floor(Math.random() * maxZ);
		mainAnimation[skullSpawnStartTick + (i*1)] = [
			{type: "create_bg", target: id, params: {billboardMode: 7, position: new BABYLON.Vector3(x+xOffset, y+yOffset, z+zOffset), path: "rushia/skull_aura2", frameSize: 300, size: 2.5, animationDelay: 50, animationFrames: 25, animationLoop: true, lineCount: 7, columnCount: 4}},
		//	{type: "spawn_sprite", target: id, params: {position: new BABYLON.Vector3(x+xOffset, y+yOffset, z+zOffset), path: "rushia/skull", frameSize: 32, size: 1.5 }},

			{type: "translate", target: id, params: {position: new BABYLON.Vector3(x+xOffset, y+yOffset+1, z+zOffset), duration: 30, easingFunction: new BABYLON.QuinticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		];
		if(!Math.floor(Math.random() * 8)){
			mainAnimation[skullSpawnStartTick + (i*1)].push({type: "play_se", params: {seId: "GhostOhh2", volume: 100}});
		}
		spawnedSkulls.push({id: id, position: {x: x+xOffset, y: y+yOffset+1, z: z+zOffset}});
	}
	
	mainAnimation[140] = [
	{type: "resize", target: "circle", params: {duration: 120, startSize: 1, endSize: 7, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	];
	mainAnimation[150] = [
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-2.7, 4	, -21.6), duration: 30, easingFunction: new BABYLON.CubicEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "rotate", target: "Camera", params: {startRotation:  new BABYLON.Vector3(0, 0, 0), rotation: new BABYLON.Vector3(0.23, 0.14, 0), duration: 30, easingFunction: new BABYLON.CubicEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		//
		
	];
	
	mainAnimation[199] = [
		{type: "set_attack_text", target: "", params: {id: 1}},
	]
	var skullMoveStartTick = 200;
	for(var i = 0; i < 50; i++){
		var skullDef = spawnedSkulls[i];
		var position = skullDef.position;
		mainAnimation[skullMoveStartTick + (i*4)] = [	
			{type: "translate", target: skullDef.id, params: {position: new BABYLON.Vector3(position.x - 100, position.y, position.z), duration: 1200, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},

		];
		/*if(!Math.floor(Math.random() * 12)){
			mainAnimation[skullMoveStartTick + (i*4)].push({type: "play_se", params: {seId: "MoreGhosts", volume: 70}});
		}*/
	}
	
	mainAnimation[221] = [		
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(15.7, 6.3	, -24.7), duration: 600}},
		{type: "rotate", target: "Camera", params: {rotation: new BABYLON.Vector3(0.24, -0.76, 0), duration: 600}}
	];

	
	var phaseTransitionCommands = [
		{type: "teleport", target: "Camera", params: {position: new BABYLON.Vector3(20, -0.35, -10)}},	
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},						
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},				
	]	
	for(var i = 0; i < spawnedSkulls.length; i++){
		var skullDef = spawnedSkulls[i];
		var position = skullDef.position;
		phaseTransitionCommands.push(
			{type: "teleport", target: skullDef.id, params: {position: new BABYLON.Vector3(position.x+30, position.y, position.z)}},
			{type: "show_sprite", target: skullDef.id},
		);		
	}
	
	var phaseCleanUpCommands = [
		{type: "kill_active_animations", params: {}},
		{target: "active_main", type: "hide_sprite", params: {}},
		{target: "active_target", type: "show_sprite", params: {}},
		{target: "circle", type: "hide_sprite", params: {}},
	];
	for(var i = 0; i < spawnedSkulls.length; i++){
		var skullDef = spawnedSkulls[i];
		var position = skullDef.position;
		phaseCleanUpCommands.push(
			{type: "hide_sprite", target: skullDef.id},
		);		
	}
	mainAnimation[600] = [
		{type: "next_phase", target: "", params: {commands: phaseTransitionCommands, cleanUpCommands: phaseCleanUpCommands}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}},		
	];
	
	mainAnimation[629] = [
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(0, -0.35, -10), duration: 240, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "play_se", params: {seId: "Menacing", volume: 120}}
	];
	var skullMoveInStartTick = 630;
	mainAnimation[skullMoveInStartTick] = [];
	for(var i = 0; i < spawnedSkulls.length; i++){
		var skullDef = spawnedSkulls[i];
		var position = skullDef.position;
		mainAnimation[skullMoveInStartTick].push(
			{type: "translate", target: skullDef.id, params: {position: new BABYLON.Vector3(position.x, position.y, position.z), duration: 120, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		);
	}
	
	mainAnimation[890] = [
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(24, -6, -7), duration: 30, easingFunction: new BABYLON.CubicEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "rotate", target: "Camera", params: {rotation: new BABYLON.Vector3(-0.04, -0.92, 0), duration: 30, easingFunction: new BABYLON.CubicEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	]
	
	mainAnimation[959] = [
		{type: "kill_se"},
	];
	var hpDrainPercent = 0;
	var skullAssaultStartTick = 960;
	for(var i = 0; i < spawnedSkulls.length; i++){
		var skullDef = spawnedSkulls[i];
		var position = skullDef.position;
		var splineOffset = 10;
		var pos1 = new BABYLON.Vector3(position.x + splineOffset, position.y + splineOffset, position.z );
		var pos2 = new BABYLON.Vector3(position.x, position.y, position.z);
		var pos3 = new BABYLON.Vector3(-2, 0, 1);
		var pos4 = new BABYLON.Vector3(-2 + splineOffset, 0 + splineOffset, 1 );
		mainAnimation[skullAssaultStartTick + (i*1)] = [			
			{type: "translate", target: skullDef.id, params: {position: pos3, duration: 10, catmullRom: {pos1: pos1, pos4: pos4}, hide: true, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
			
		];
		if(!(i % 4)){
			mainAnimation[skullAssaultStartTick + (i*1)].push(
				{type: "play_se", params: {seId: "GhostOhh", volume: 70}},
				
			);				
			
		}
		if(!(i % 8)){
			mainAnimation[skullAssaultStartTick + (i*1)].push(
				{type: "drain_hp_bar", target: "", params: {percent: hpDrainPercent}}	
			);
			hpDrainPercent++;
		}		
	}
	BattleAnimationBuilder.mergeAnimationIntoList(970, mainAnimation, [
		{type: "create_bg", target: "cocoon", params: {billboardMode: 7, position: new BABYLON.Vector3(-2, 0, 1), path: "rushia/cocoon", size: {width: 8, height: 8}, animationFrames: 30, animationDelay: 50, animationLoop: true, lineCount: 8, columnCount: 4}},
		{type: "fade_in_bg", target: "cocoon", params: {duration: 30, endFade: 1, startFade: 0}}
	]);
			
	mainAnimation[1218] = [
		{type: "play_effekseer", target: "rushia_explosion", params: {layer: 0, path: "rushia_explosion", position: _this._defaultPositions.enemy_main_idle, scale: 3, speed: 1.5}},
		//{type: "create_bg", target: "explosion", params : {billboardMode: 7, position: new BABYLON.Vector3(5, -3, 9), path: "rushia/explosion", frameSize: 512, size: {width: 50, height: 25}, animationFrames: 44, animationDelay: 40, animationLoop: false, lineCount: 11, columnCount: 4}},
		{type: "play_se", params: {seId: "energy_buildup", volume: 180, pitch: 110}}
	]	
	
	mainAnimation[1280] = [
		{type: "play_se", params: {seId: "explosion3", volume: 200}},
		{type: "remove_bg", target: "cocoon"},
		
	]	
	
	mainAnimation[1300] = [
		{type: "drain_hp_bar", target: "", params: {percent: 100}}	
	]
	
	mainAnimation[1320] = [
		{type: "fade_white", params: {speedOut: "slow"}},
	]	
	
	mainAnimation[1330] = [
		{type: "hide_effekseer", target: "rushia_explosion"},
		{type: "remove_bg", target: "explosion"},
	]
	
	mainAnimation[1400] = [
		{type: "kill_se"},
	]
	
	/*BattleAnimationBuilder.mergeAnimationIntoList(1200, mainAnimation, [
		{type: "create_bg", target: "bg2", params: {billboardMode: 7, path: "rushia/rushia_bg2", position: new BABYLON.Vector3(1, -10, 15), size: {width: 100, height: 50}}},
	]);	*/
	
	mainAnimation[1500] = [];
	var onHit = [];
	onHit[971] = [
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, magnitude_y: 0.2, duration: 240}},
	];
	
	onHit[1340] = [	
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.5, duration: 60}},
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
	]
	
	onHit[1400] = [
		{type: "reset_position", target: "active_target", params: {duration: 30}}
	]
	
	onHit[1440] = [
		
	]
	
	onHit[1580] = []
	
	var onMiss = [];
	
	onMiss[960] = [
		{type: "dodge_pattern", target: "", params: {commands: [
			{type: "translate", target: "active_target", params: {position: new BABYLON.Vector3(-10, 0	, -10), duration: 20}},
			{type: "set_sprite_index", target: "active_target", params: {index: 2}},
		]}},			
	];
	
	onMiss[1340] = [
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
		{type: "set_sprite_index", target: "active_target", params: {index: 0}},
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
	]
	
	onMiss[1380] = [
		{type: "show_damage"}
	]
	
	
	var onDestroy = [];
	var onDestroyOverwrite = [];
	
	onDestroyOverwrite[1340] = [	
		{type: "hide_sprite", target: "active_target"},
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
		{type: "create_bg", target: "bg2", params: {billboardMode: 0, path: "rushia/rushia_bg2", animationLoop: true, position: new BABYLON.Vector3(3, 0, 15), rotation: new BABYLON.Vector3(0.1, -0.5, 0), size: {width: 60, height: 30}}},
	]
	onDestroyOverwrite[1400] = []; //disable reset_position
	onDestroyOverwrite[1378] = [
		{type: "create_layer", target: "sparkles", params: {isBackground: false, path: "rushia/sparkles", animationFrames: 32, animationLoop: true, lineCount: 8, columnCount: 4, animationDelay: 50}},
	];
	onDestroyOverwrite[1480] = [
		{type: "fade_white", params: {time: 1200, speed: "slow"}}
	]
	
	onDestroyOverwrite[1520] = [
		{type: "remove_bg", target: "bg2"},
		{type: "remove_bg", target: "sparkles"},
		{type: "remove_bg", target: "bg1"},
		{type: "show_bgs", target: "bg1"},
	]
	
	onDestroyOverwrite[1700] = [];
	
	return {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy,
		onDestroyOverwrite: onDestroyOverwrite
	};
}

BattleAnimationBuilder.prototype.Broken_Dream__A_Dream_Shattered = function(){
	var _this = this;
	var mainAnimation = [];
	
	mainAnimation[0] = [
		{type: "create_sky_box", target: "skybox1", params: {path: "default2", color: new BABYLON.Color3(0.5, 0, 0)}},
		//{type: "create_bg", target: "bg1", params: {billboardMode: 7, path: "rushia/rushia_bg1", position: new BABYLON.Vector3(0, 0, 50), size: {width: 200, height: 100}}},
		{type: "translate", target: "active_main", params: {startPosition: _this._defaultPositions.ally_main_idle, position: new BABYLON.Vector3(1, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
	]
	
	mainAnimation[40] = [
		{type: "hide_bgs"},
		{type: "drain_en_bar", target: "", params: {percent: 100}},
		{type: "create_bg", target: "bg2", params: {billboardMode: 7, path: "broken_dream/bg1", position: new BABYLON.Vector3(8, -14, 10), size: {width: 100, height: 100}}},
		{type: "fade_in_bg", target: "bg2", params: {duration: 30, endFade: 1, startFade: 0}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-34.9, -25, -100), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "rotate", target: "Camera", params: {rotation: new BABYLON.Vector3(-0.05, -0.01, 0), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
	]
	
	mainAnimation[100] = [
		{type: "play_se", params: {seId: "Charge", volume: 160}},
	];
	
	mainAnimation[110] = [
		
		{type: "create_layer", target: "big_laser", params : {isBackground: false, path: "broken_dream/big_laser", frameSize: {width: 555, height: 312}, size: {width: 50, height: 25}, animationFrames: 104, animationDelay: 40, animationLoop: false, lineCount: 26, columnCount: 4}},
	];
	mainAnimation[190] = [
		{type: "kill_se"},
		{type: "play_se", params: {seId: "Laser3", volume: 160}},
	]
	
	var phaseCleanUpCommands = [
		{type: "kill_active_animations", params: {}},		
		{type: "remove_layer", target: "big_laser"},
		{type: "show_bgs"},
		{type: "remove_bg", target: "bg2"},
		{target: "active_main", type: "hide_sprite", params: {}},
		{target: "active_target", type: "show_sprite", params: {}}
	];
	
	var phaseTransitionCommands = [
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},	
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},						
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},				
	]
	mainAnimation[230] = [
		{type: "next_phase", target: "", params: {commands: phaseTransitionCommands, cleanUpCommands: phaseCleanUpCommands}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}},		
	];
	
	mainAnimation[270] = [
		{type: "hide_bgs"},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(15, 0, -40), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		//{type: "rotate", target: "Camera", params: {rotation: new BABYLON.Vector3(0, 0.1, 0), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
	]
	
	mainAnimation[300] = [
		{type: "play_se", params: {seId: "Laser3", volume: 160}},
		{type: "create_layer", target: "big_laser_impact", params : {isBackground: false, path: "broken_dream/big_laser_impact", animationFrames: 64, animationDelay: 40, animationLoop: false, lineCount: 16, columnCount: 4}},
	];
	
	mainAnimation[400] = [
		{type: "play_se", params: {seId: "Explosion4", volume: 160}},
		{type: "drain_hp_bar", target: "", params: {percent: 100}},
		{type: "create_layer", target: "broken_dream_explosion", params : {isBackground: false, path: "broken_dream/broken_dream_explosion", animationFrames: 16, animationDelay: 40, animationLoop: false, lineCount: 4, columnCount: 4}},
	];
	
	mainAnimation[410] = [
		{type: "fade_white", params: {speedOut: "slow"}},
	]
	
	mainAnimation[550] = [
		{type: "kill_se"},
	];
	var onHit = [];
	
	mainAnimation[310] = [
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, magnitude_y: 0.2, duration: 100}},
	]

	onHit[415] = [	
		{type: "show_bgs"},
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, duration: 60}},
		{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
	]
	
	onHit[500] = [
		{type: "reset_position", target: "active_target", params: {duration: 30}}
	]
	
	
	var onMiss = [];
	
	onMiss[300] = [
		{type: "dodge_pattern", target: "", params: {commands: [
			{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-30, 0	, -10), duration: 40}},
			{type: "set_sprite_index", target: "active_target", params: {index: 2}},
		]}},			
	];
	
	onMiss[415] = [
		{type: "show_bgs"},
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
		{type: "set_sprite_index", target: "active_target", params: {index: 0}},
		{type: "rotate", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
	]
	
	onMiss[500] = [
		{type: "show_damage"}
	]
	
	
	var onDestroy = [];
	var onDestroyOverwrite = [];
	onDestroy[580] = [
		{type: "destroy", target: "active_target", params: {}}
	];
	onDestroy[620] = [];

	
	return {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy,
		onDestroyOverwrite: onDestroyOverwrite
	};
}


BattleAnimationBuilder.prototype.Fubuki__seven_pages = function(){
	var _this = this;
	var mainAnimation = [];
	
	mainAnimation[0] = [
		{type: "play_se", params: {seId: "MechActivate", volume: 100, pitch: 100}},
		{type: "play_effekseer", target: "general_power_up", params: {path: "general_power_up", position: _this._defaultPositions.ally_main_idle, scale: 1.2, speed: 0.7}},
	];
	
	mainAnimation[30] = [
		{type: "hide_bgs"},
		{type: "create_bg", target: "bg1", params: {billboardMode: 7, path: "general/bg1", position: new BABYLON.Vector3(0, 0, 30), size: {width: 200, height: 100}}},
		{type: "set_attack_text", params: {id: 0}},
	]
	
	mainAnimation[90] = [
		{type: "play_se", params: {seId: "MechMove", volume: 100, pitch: 100}},
		{type: "translate", target: "active_main", params: {startPosition: _this._defaultPositions.ally_main_idle, position: new BABYLON.Vector3(-6, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "translate", target: "Camera", params: {startPosition: _this._defaultPositions.camera_main_idle, position: new BABYLON.Vector3(-4, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		
	]
	
	mainAnimation[121] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(-6, 0, 1), position: new BABYLON.Vector3(-12, 0, 1), duration: 20}},
	];
	
	mainAnimation[160] = [
		{type: "next_phase", target: "", params: {commands: [
			{target: "active_main", type: "show_sprite", params: {}},
			{target: "active_target", type: "show_sprite", params: {}},
			{type: "teleport", target: "Camera", params: {position: new BABYLON.Vector3(0, -0.35, -5)}},			
			{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},		
		]}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}}, 
		
	];//padding
	
	var onHit = [];
	
	
	onHit[220] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(6, 0, 1), position: new BABYLON.Vector3(-0.5, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-1.5, -0.35, -5), duration: 60, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	];
	
	onHit[225] = [
		{type: "play_se", params: {seId: "MechMoveStop", volume: 100, pitch: 100}},
	];
	
	onHit[290] = [
		
		{type: "play_effekseer", target: "fubuki_hits", params: {path: "fubuki_hits", position: new BABYLON.Vector3(-2, 0, 1), scale: 0.5, speed: 1}},
		{type: "play_effekseer", target: "fubuki_flurry", params: {path: "fubuki_flurry", position: new BABYLON.Vector3(-0.75, 0, 1), scale: 2.5, speed: 1}},
		//{type: "rotate_to", target: "fubuki_hits", params: {rotation: new BABYLON.Vector3(0, Math.PI / 2, 0)}},
		{type: "set_attack_text", params: {id: 1}},
		{type: "drain_hp_bar", target: "", params: {percent: 5}},
	]
	onHit[300] = [
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, magnitude_y: 0.05, duration: 400}},
	]
	onHit[350] = [
		{type: "set_attack_text", params: {id: 2}},
		{type: "drain_hp_bar", target: "", params: {percent: 10}},
		{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-2, 0, 1), position: new BABYLON.Vector3(-2.5, 1.2, 1), duration: 180}},
		{type: "translate", target: "fubuki_hits", params: {startPosition: new BABYLON.Vector3(-2, 0, 1), position: new BABYLON.Vector3(-2.5, 1.2, 1), duration: 180}},
		
	]
	onHit[410] = [
		{type: "set_attack_text", params: {id: 3}},
		{type: "drain_hp_bar", target: "", params: {percent: 15}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-1.5, 0.5, -8), duration: 150, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	]
	
	onHit[470] = [
		{type: "set_attack_text", params: {id: 4}},
		{type: "drain_hp_bar", target: "", params: {percent: 20}},
	]
	
	onHit[530] = [
		{type: "set_attack_text", params: {id: 5}},
		{type: "drain_hp_bar", target: "", params: {percent: 25}},
	]
	
	onHit[590] = [
		{type: "set_attack_text", params: {id: 5}},
		{type: "drain_hp_bar", target: "", params: {percent: 30}},
	]
	
	var targetEndPosition = new BABYLON.Vector3(-3.5, 3, 1);
	
	onHit[699] = [
		{type: "hide_effekseer", target: "fubuki_flurry"},
	]
	
	for(var i = 290; i < 700; i+=5){
		var pitch = 80;
		pitch+=Math.random() * 20;
		BattleAnimationBuilder.mergeAnimationIntoList(i, onHit, [{type: "play_se", params: {seId: "MechImpactLight", volume: 30, pitch: pitch}}]);
	}
	
	onHit[700] = [
		{type: "shake", target: "active_target", params: {magnitude_x: 0.05, magnitude_y: 0.05, duration: 130}},
		{type: "play_se", params: {seId: "MechImpactLight", volume: 40, pitch: 50}},
		{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-3, 1.7, 1), position: targetEndPosition, duration: 5}},
		{type: "set_attack_text", params: {id: 6}},
		{type: "drain_hp_bar", target: "", params: {percent: 40}},
		{type: "flip", target: "active_main", params: {x: -1}},
	]
	
		
	onHit[770] = [		
		{type: "set_attack_text", params: {id: 7}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-1.5, 0.5, -20), duration: 60, easingFunction: new BABYLON.QuinticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		//{type: "shake", target: "active_target", params: {magnitude_x: 0.2, magnitude_y: 0.05, duration: 220}},
		{type: "play_effekseer", target: "general_energy_accumulates", params: {path: "general_energy_accumulates", position: targetEndPosition, scale: 2, speed: 10}},
		{type: "play_se", params: {seId: "BeforeExplosion", volume: 80, pitch: 100}},
	]	
	
	onHit[825] = [
		{type: "shake", target: "Camera", params: {magnitude_x: 0.2, magnitude_y: 0.05, duration: 20}},
		{type: "drain_hp_bar", target: "", params: {percent: 100}},
		{type: "play_effekseer", target: "fubuki_explosion", params: {path: "fubuki_explosion", position: targetEndPosition, scale: -1.5, speed: 1.2}},
		{type: "play_se", params: {seId: "MechImpactHard", volume: 80, pitch: 100}}
	]
	
	onHit[890] = [
		{type: "play_effekseer", target: "fubuki_smoking", params: {path: "fubuki_smoking", position: new BABYLON.Vector3(-3.5, 2.5, 1), scale: 3, speed: 1}},
		{type: "translate", target: "active_target", params: {startPosition: targetEndPosition, position: new BABYLON.Vector3(-3.5, 0, 1), duration: 80, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "translate", target: "fubuki_smoking", params: {startPosition:  new BABYLON.Vector3(-3.5, 2.5, 1), position: new BABYLON.Vector3(-3.5, -0.5, 1), duration: 80, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
	]
	
	onHit[930] = [
		{type: "play_se", params: {seId: "MechMove", volume: 100, pitch: 100}},
		{type: "translate", target: "active_main", params: {position: new BABYLON.Vector3(20, 0, 1), duration: 100, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	]
	
	onHit[960] = [
		{type: "fade_swipe"}
	]
	
	onHit[980] = [	
		{type: "remove_bg", target: "bg1"},
		{type: "show_bgs"},
		{type: "hide_effekseer", target: "fubuki_smoking"},
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, duration: 60}},
		{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
		{type: "hide_sprite", target: "active_main"},
	]
	
	onHit[1065] = [
		{type: "reset_position", target: "active_target", params: {duration: 30}}
	]
	
	onHit[1200] = [
		{type: "kill_se"},

	];
	
	
	
	var onMiss = [];
	
	onMiss[220] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(6, 0, 0.8), position: new BABYLON.Vector3(-4, 0, 0.8), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-1.5, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	];
	
	onMiss[230] = [
		{type: "dodge_pattern", target: "", params: {commands: [
			{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-2.5, 0.5, 1), duration: 4, easingFunction: new BABYLON.QuarticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		]}},
	];
	
	onMiss[280] = [
	{type: "set_attack_text", params: {id: 8}},
	];
	
	onMiss[300] = [
		{type: "translate", target: "active_main", params: {position: new BABYLON.Vector3(-15, 0, 1), duration: 30}},
	];
	
	onMiss[350] = [
		{type: "fade_swipe"}
	]
	
	onMiss[370] = [	
		{type: "remove_bg", target: "bg1"},
		{type: "show_bgs"},
		{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
		{type: "hide_sprite", target: "active_main"},
	]

	onMiss[400] = [
		{type: "reset_position", target: "active_target", params: {duration: 10}}
	];
	onMiss[450] = [];//padding	
	
	
	var onDestroy = [];
	var onDestroyOverwrite = [];
	
	onDestroyOverwrite[890] = [
		{type: "hide_sprite", target: "active_target"},
	]
	
	onDestroyOverwrite[1065] = [
	]
	
	return {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy,
		onDestroyOverwrite: onDestroyOverwrite
	};
}


BattleAnimationBuilder.prototype.Matsuri__Divine_Assertion = function(){
	var _this = this;
	var mainAnimation = [];
	
	mainAnimation[0] = [
		{type: "play_se", params: {seId: "MechActivate", volume: 100, pitch: 100}},
		{type: "play_effekseer", target: "general_power_up", params: {path: "general_power_up", position: _this._defaultPositions.ally_main_idle, scale: 1.2, speed: 0.7}},
	];
	
	mainAnimation[30] = [
		{type: "hide_bgs"},
		/*{type: "create_bg", target: "bg1", params: {billboardMode: 7, path: "general/bg1", position: new BABYLON.Vector3(0, 0, 30), size: {width: 200, height: 100}}},
		{type: "set_attack_text", params: {id: 0}},*/
	]
	
	mainAnimation[90] = [
		{type: "play_se", params: {seId: "MechMove", volume: 100, pitch: 100}},
		{type: "translate", target: "active_main", params: {startPosition: _this._defaultPositions.ally_main_idle, position: new BABYLON.Vector3(2, 6, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		//{type: "translate", target: "Camera", params: {startPosition: _this._defaultPositions.camera_main_idle, position: new BABYLON.Vector3(-4, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		
	]
	
	mainAnimation[130] = [
		{type: "next_phase", target: "", params: {commands: [
			{target: "active_main", type: "show_sprite", params: {}},
			{target: "active_target", type: "show_sprite", params: {}},
			{type: "teleport", target: "Camera", params: {position: new BABYLON.Vector3(-4, -0.35, -5)}},	
			{type: "rotate_to", target: "Camera", params: {rotation: new BABYLON.Vector3(-0.11, 0.85, 0)}},	
			{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},	
			{type: "teleport", target: "active_main", params: {position:  new BABYLON.Vector3(20, 6, 7)}},	

		]}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}}, 
		
	];
	mainAnimation[170] = [
		{type: "translate", target: "active_main", params: {startPosition:  new BABYLON.Vector3(20, 6, 7), position: new BABYLON.Vector3(20, 8, 7), duration: 60, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	];
	mainAnimation[250] = [	
		{type: "set_attack_text", target: "", params: {id: 0}},
		{type: "create_bg", target: "god_aura", params: {billboardMode: 7, path: "matsuri/god_aura", position: new BABYLON.Vector3(20.2, 7.7, 7.3), size: {width: 23, height:23}}},
		{type: "shake", target: "god_aura", params: {magnitude_x: 0.2, magnitude_y: 0.05, duration: 20}},
		{type: "resize", target: "god_aura", params: {duration: 20, startSize: 0, endSize: 1, easingFunction: new BABYLON.QuinticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEINOUT}},
	];
	mainAnimation[340] = [
		{type: "play_effekseer", target: "general_blast_red", params: {layer: 0, path: "general_blast_red", position:  new BABYLON.Vector3(20, 8, 7), scale: 1, speed: 0.8}},
	];
	
	mainAnimation[400] = [		
		{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},	
		{type: "teleport", target: "active_target", params: {position: new BABYLON.Vector3(0,0,1)}},	
		
		{type: "hide_sprite", target: "active_main"},
		{type: "remove_bg", target: "god_aura"},
		{type: "create_bg", target: "bg1", params: { path: "matsuri/bg1", position: new BABYLON.Vector3(0, 0, 30), size: {width: 200, height: 200}}},
		{type: "hide_effekseer", target: "general_blast_red"},
	];
	
	mainAnimation[450] = [
		{type: "create_bg", target: "bg2", params: { position: new BABYLON.Vector3(0, 20, 28), path: "matsuri/bg2", size: {width: 120, height: 120}}},
		{type: "fade_in_bg", target: "bg2", params: {duration: 60, endFade: 1, startFade: 0}},
		//{type: "translate", target: "bg2", params: {startPosition:  new BABYLON.Vector3(20, 0, 30), position: new BABYLON.Vector3(15, 0, 30), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(0, 22, -83), duration: 60, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "rotate", target: "Camera", params: {rotation: new BABYLON.Vector3(0.17, 0, 0), duration: 60, easingFunction: new BABYLON.CubicEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
	];
	mainAnimation[510] = [
		{type: "set_attack_text", target: "", params: {id: 1}},
	];
	mainAnimation[550] = [
		//{type: "fade_in_bg", target: "bg2", params: {duration: 60, endFade: 0, startFade: 1}},

	];	
	
/*	var devX = 20;
	var devY = 20;
	var devZ = 20;
	var origX = 0;
	var origY = 0;
	var origZ = 1;
	
	var xOffset = devX/2*-1;
	var zOffset = devY/2*-1;
	var yOffset = devZ/2*-1;
	var spawnedOrbs = [];
	var orbSpawnTick = 620;
	
	for(var i = 0; i < 100; i++){
		if(!mainAnimation[orbSpawnTick+(Math.floor(i/5))]){
			mainAnimation[orbSpawnTick+(Math.floor(i/5))] = [];
		}
		
		var id = "orb" + i;
		var x = Math.floor(Math.random() * devX) + origX + xOffset;
		var y = Math.floor(Math.random() * devY) + origY + yOffset;
		var z = Math.floor(Math.random() * devZ) + origZ + zOffset;
		mainAnimation[orbSpawnTick+(Math.floor(i/5))].push({type: "create_bg", target: id, params: {billboardMode: 7, position: new BABYLON.Vector3(x, y, z), path: "matsuri/orb",  size: {width: 2, height: 2}}});
		//	{type: "spawn_sprite", target: id, params: {position: new BABYLON.Vector3(x+xOffset, y+yOffset, z+zOffset), path: "rushia/skull", frameSize: 32, size: 1.5 }},

		spawnedOrbs.push({id: id, position: {x: x, y: y, z: z}});
	}
	
	mainAnimation[670] = [
		{type: "create_bg", target: "bg3", params: { position: new BABYLON.Vector3(0, 0, 20), path: "matsuri/bg3", size: {width: 60, height: 60}}},
		//{type: "translate", target: "bg2", params: {startPosition:  new BABYLON.Vector3(20, 0, 30), position: new BABYLON.Vector3(15, 0, 30), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "resize", target: "bg3", params: {duration: 80, startSize: 0, endSize: 1, easingFunction: new BABYLON.QuinticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEINOUT}},
		//{type: "translate", target: "Camera", params: {position: new BABYLON.Vector3(-4, 6, -30), duration: 60, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},

	];
	
	
	var orbExplosionstart = 750;
	for(var i = 0; i < 100; i++){
		mainAnimation[orbExplosionstart + (i * 2)] = [
			{type: "remove_bg", target: spawnedOrbs[i].id},
			{type: "play_effekseer", target: "matsuri_fireworks_"+spawnedOrbs[i].id, params: {path: "matsuri_fireworks", position: new BABYLON.Vector3(spawnedOrbs[i].position.x, spawnedOrbs[i].position.y, spawnedOrbs[i].position.z), scale: 1.5, speed: 0.8}},
		]
	}
	
	mainAnimation[783] = [
		{type: "shake", target: "active_target", params: {magnitude_x: 0.1, magnitude_y: 0, duration: 200}},
	]
	
	mainAnimation[950] = [
		{type: "drain_hp_bar", target: "", params: {percent: 100}},
		{type: "play_effekseer", target: "general_blast_red2", params: {path: "general_blast_red", position: new BABYLON.Vector3(0, 0, 1), scale: 1, speed: 0.8}},
	];
	
	var explosionsEndTick = 1000;
	mainAnimation[explosionsEndTick] = [
		
		{type: "kill_active_animations"},
		{type: "remove_bg", target: "bg1"},
		{type: "remove_bg", target: "bg2"},
		{type: "remove_bg", target: "bg3"},
		{type: "remove_bg", target: "bg4"},		
	
		{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},	
		{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},	
		{type: "show_bgs"},
		{type: "shake", target: "active_target", params: {magnitude_x: 0.2, duration: 100}},
		{type: "fade_white", params: {time: 1800, speedOut: "slow"}},
	];
	
	
	for(var i = 0; i < spawnedOrbs.length; i++){
		mainAnimation[explosionsEndTick].push({type: "remove_bg", target: spawnedOrbs[i].id});
		mainAnimation[explosionsEndTick].push({type: "hide_effekseer", target: "matsuri_fireworks_"+spawnedOrbs[i].id});
	}
	mainAnimation[1040] = [			
		{type: "hide_effekseer", target: "general_blast_red2"},
	];
	
	mainAnimation[1200] = [
		{type: "reset_position", target: "active_target", params: {duration: 30}}
	]
	*/
	mainAnimation[500000] = [];//padding
	
	var onHit = [];
	
	var onMiss = [];
	
	
	var onDestroy = [];
	
	onDestroy[1000] = [
		{type: "hide_sprite", target: "active_target"},
	]
	
	var onDestroyOverwrite = [];
	
	onDestroyOverwrite[1200] = [];
	
	return {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy,
		onDestroyOverwrite: onDestroyOverwrite
	};
}