import "./style/editor.css";
import FaceManager from "./FaceManager.js";
import AllyPilotUI from "./AllyPilotUI.js";
import EnemyPilotUI from "./EnemyPilotUI.js";
import MechUI from "./MechUI.js";
import WeaponUI from "./WeaponUI.js";
import PatternUI from "./PatternUI.js";

export default function SRWEditor(){
	this._currentEditor = "attack_editor";
	this._initialized = false;
	
	this._referenceAnimationBuilder = new BattleAnimationBuilder();
	
	
	window.addEventListener("resize", function(){
		Graphics.updatePreviewWindowWidth();	
	});
}

SRWEditor.prototype.initTitles = function(){
	if(!this._initialized){
		this._initialized = true;
		this._title = EDITORSTRINGS.GENERAL.title;
		this._editorData = {		
			weapon_editor: {title: EDITORSTRINGS.GENERAL.weapon_editor_label, func: this.showWeaponEditor},
			mech_editor: {title: EDITORSTRINGS.GENERAL.mech_editor_label, func: this.showMechEditor},
			enemy_pilot_editor: {title: EDITORSTRINGS.GENERAL.enemy_pilot_editor_label, func: this.showEnemyPilotEditor},
			ally_pilot_editor: {title: EDITORSTRINGS.GENERAL.ally_pilot_editor_label, func: this.showAllyPilotEditor},
			pattern_editor: {title: EDITORSTRINGS.GENERAL.pattern_editor_label, func: this.showPatternEditor},
			attack_editor: {title: EDITORSTRINGS.GENERAL.attack_editor_label, func: this.showAttackEditor},
			environment_editor: {title: EDITORSTRINGS.GENERAL.environment_editor_label, func: this.showEnvironmentEditor},
			battle_text_editor: {title: EDITORSTRINGS.GENERAL.battle_text_editor_label, func: this.showBattleTextEditor},
		}
	}
}

SRWEditor.prototype.getAnimationDefs = function(){
	return this._referenceAnimationBuilder.getDefinitions();
}

SRWEditor.prototype.init = function(){
	var _this = this;
	/*var head  = document.getElementsByTagName('head')[0];
	var link  = document.createElement('link');
	link.rel  = 'stylesheet';
	link.type = 'text/css';
	link.href = 'js/plugins/editor/editor.css';
	link.media = 'all';
	head.appendChild(link);*/
	
	_this.initTitles();
	
	_this._svgPath = "svg/editor/";
	
	_this._contentDiv = document.createElement("div");
	_this._contentDiv.id = "srw_editor";
	document.body.appendChild(_this._contentDiv);
	
	$battleSceneManager.init(true);	
	
	this._battleTextBuilder = $battleSceneManager.getBattleTextBuilder();
	this._animationBuilder = $battleSceneManager.getAnimationBuilder();
	this._environmentBuilder = $battleSceneManager.getEnvironmentBuilder();
	
	_this._battleTextBuilder.isLoaded().then(function(){
		_this._battleTextBuilder.saveBackup();	
	});
	_this._animationBuilder.isLoaded().then(function(){
		_this._animationBuilder.saveBackup();	
	});
	_this._environmentBuilder.isLoaded().then(function(){
		_this._environmentBuilder.saveBackup();	
	});

		
	$gameSystem.skyBattleOffset = 0;
	
	$gameSystem.battleBg = "mountains2";
	//$gameSystem.battleParallax1 = "Empty";
	
	$gameSystem.battleParallax1 = "trees1";
	$gameSystem.battleParallax2 = "trees2";
	$gameSystem.battleParallax3 = "mountains1";
	
	$gameSystem.floorParallax1 = "dirt1";
	$gameSystem.floorParallax2 = "dirt2";
	
	//$gameSystem.battleFloor = "floor1";
	$gameSystem.battleSkyBox = "dusk";
	
	$gameSystem.skyBattleBg = "Sky";
	$gameSystem.skyBattleParallax1 = "Empty";
	
	$gameSystem.setSubBattlePhase('after_battle');
	
	_this._previewAttackHits = true;
	_this._previewAttackDestroys = false;
	_this._enemySideAttack = false;
	_this._playBGM = true;
	_this._playUntil = -1;
	_this._fastForward = false;
	_this._currentDefinition = 0;
	_this._currentEnvironmentDefinition = 0;
	_this._sequenceTypes = [
		{name: "Main", id: "mainAnimation"},
		{name: "Hit", id: "onHit"},		
		{name: "Hit Overwrite", id: "onHitOverwrite"},		
		{name: "Hit Twin", id: "onHitTwin"},		
		{name: "Miss", id: "onMiss"},
		{name: "Miss Overwrite", id: "onMissOverwrite"},
		{name: "Miss Twin", id: "onMissTwin"},
		{name: "Destroy", id: "onDestroy"},
		{name: "Destroy Overwrite", id: "onDestroyOverwrite"},
		{name: "Destroy Twin", id: "onDestroyTwin"},
	];
	
	_this._specialTargets = [
		{name: "active_main", id: "active_main"},
		{name: "active_target", id: "active_target"},
		{name: "active_target_twin", id: "active_target_twin"},
		{name: "Camera", id: "Camera"},
	];
	
	_this._specialLights = [
		{name: "scene_light", id: "scene_light"},
	];
	
	_this._easingFunctions = {
		"sine": "SineEase",		
		"circle": "CircleEase",
		"back": "BackEase",
		"bounce": "BounceEase",
		"cubic": "CubicEase",
		"elastic": "ElasticEase",
		"exponential": "ExponentialEase",
		"power": "PowerEase",
		"quadratic": "QuadraticEase",
		"quartic": "QuarticEase",
		"quintic": "QuinticEase"
	};
	
	_this._easingModes = {
		0: "In", 
		1: "Out",
		2: "InOut"
	};
	
	_this._commandDisplayInfo = {
		set_blend_color: {
			hasTarget: true,
			params: ["r", "g", "b"],
			desc: "Set the blend color for the target."
		},
		fade_in_textbox: {
			hasTarget: false,
			params: ["immediate"],
			desc: "Fade in the textbox. No effect if the textbox is currently shown."
		},
		fade_out_textbox: {
			hasTarget: false,
			params: ["immediate"],
			desc: "Fade out the textbox."
		},
		effect_shockwave: {
			hasTarget: false,
			params: ["x_fraction", "y_fraction", "shockwave_intensity"],
			desc: "Play the shockwave effect at the specified screen position."
		},
		effect_screen_shader: {
			hasTarget: false,
			params: ["shaderName", "shaderDuration","shaderParam0","shaderParam1", "shaderParam2", "shaderParam4", "shaderParam5", "shaderParam6", "shaderParam7", "shaderParam8", "shaderParam9"],
			desc: "Play custom screen shader effect."
		},
		kill_active_animations: {
			hasTarget: false,
			params: [],
			desc: "Immediately stop all running animations."
		},
		teleport: {
			hasTarget: true,
			params: ["position"],
			desc: "Immediately move an object."
		},
		rotate_to: {
			hasTarget: true,
			params: ["rotation"],
			desc: "Immediately set to rotation of an object."
		},
		translate: {
			hasTarget: true,
			params: ["relative", "startPosition", "position", "duration", "easingFunction", "easingMode", "hide", "catmullRom"],
			desc: "Move an object from the start position to the end position."
		},
		rotate: {
			hasTarget: true,
			params: ["startRotation", "rotation", "duration", "easingFunction", "easingMode"],
			desc: "Rotate an object from the start rotation to the end rotation."
		},
		resize: {
			hasTarget: true,
			params: ["startSize", "endSize", "duration", "easingFunction", "easingMode"],
			desc: "Change the size of an object between the start size and end size."
		},
		flip: {
			hasTarget: true,
			params: ["x", "y"],
			desc: "Flip the texture of an object."
		},
		shake: {
			hasTarget: true,
			params: ["magnitude_x", "speed_x", "magnitude_y", "speed_y", "duration", "fadeInTicks", "fadeOutTicks"],
			desc: "Shake the screen on the x and y axis with the specified magnitude."
		},
		set_opacity_texture: {
			hasTarget: true,
			params: ["path"],
			desc: "Set an opacity texture for the target."
		},
		clear_opacity_texture: {
			hasTarget: true,
			params: [],
			desc: "Clear any opacity texture the target currently has."
		},
		create_clone: {
			hasTarget: true,
			params: ["position", "name"],
			desc: "Create a clone of the target with reference id name."
		},
		/*set_camera_target: {
			hasTarget: true,
			params: [],
			desc: "Lock the camera on an object in the scene. The camera will always look straight at the object while locked."
		},*/	
	
		set_damage_text: {
			hasTarget: false,
			params: [],
			desc: "Show damage text for the current target. This command is automatically called during the reset_position command."
		},
		
		set_evade_text: {
			hasTarget: false,
			params: [],
			desc: "Show evade text for the current target. This command is automatically called during the reset_position command."
		},
		
		set_destroyed_text: {
			hasTarget: false,
			params: [],
			desc: "Show destroyed text for the current target. This command is automatically called during the destroy command."
		},
		
		set_attack_text: {
			hasTarget: false,
			params: ["id"],
			paramAlias: {id: "id_text"},
			desc: "Show attack text for the current target."
		},
		clear_attack_text: {
			hasTarget: false,
			params: [],
			desc: "Clear the text box."
		},
		show_support_defender_text: {
			hasTarget: false,
			params: [],
			desc: "Show text for the incoming support defender. This command is automatically called during the next_phase command if applicable."
		},
		enable_support_defender: {
			hasTarget: false,
			params: [],
			desc: "Switch out the defender for the support defender. This command is automatically called during the next_phase command if applicable."
		},
		
		disable_support_defender: {
			hasTarget: false,
			params: [],
			desc: "Switch out the support defender for the defender. This command is automatically called after an attack if applicable."
		},		
		fade_in_bg: {
			hasTarget: true,
			params: ["startFade", "endFade", "duration", "easingFunction", "easingMode"],
			desc: "Fade in the target background."
		},		
		fade_swipe: {
			hasTarget: false,
			params: ["time"],
			desc: "Swipe the screen to black. This command is automatically called during the next_phase command."
		},
		fade_white: {
			hasTarget: false,
			params: ["time", "speed", "speedOut"],
			desc: "Fade the screen to white and from white."
		},		
		updateBgMode: {
			hasTarget: true,
			params: [],
			desc: "Update the current default backgrounds to match the target. This command is automatically called during the next_phase command."
		},	
		next_phase: {
			hasTarget: false,
			params: ["cleanUpCommands", "commands"],
			desc: "Fade the screen to black and set the scene up for the second phase of the attack. This command automatically brings the support defender if available and sets up the default background to match the target."
		},
		dodge_pattern: {
			hasTarget: true,
			params: ["commands"],
			desc: "Show the target's doging action. The commands provided as parameters define the evade movement of the target. If the target has a special dodge action, like Double Image, the matching animation will be played instead."
		},
		spawn_sprite: {
			hasTarget: true,
			params: ["path", "position", "size", "frameSize", "animationFrames", "animationLoop", "animationDelay"],
			desc: "Create a new sprite."
		},
		remove_sprite: {
			hasTarget: true,
			params: [],
			desc: "Remove a sprite."
		},
		set_light_color: {
			isLightCommand: true,
			hasTarget: true,
			hasTarget: true,
			params: ["r", "g", "b", "duration", "easingFunction", "easingMode"],
			desc: "Set the groundColor and diffuse color of specified light. scene_light is the global hemispheric light"
		},
		create_bg: {
			hasTarget: true,
			params: ["isPilotCutin", "path", "parent", "position", "size", "alpha", "billboardMode", "rotation", "frameSize", "lineCount", "columnCount", "animationLoop", "animationFrames", "animationDelay", "holdFrame", "scrollSpeed", "clamp"],
			aliases: {"animationLoop": "loopFromFrame", "animationFrames": "loopToFrame"},
			desc: "Create a new background."
		},
		set_bg_scroll_speed: {
			hasTarget: true,
			params: ["scrollSpeed", "duration", "easingFunction", "easingMode"],
			desc: "Set the scrolling speed of a spawned background."
		},
		create_movie_bg: {
			hasTarget: true,
			params: ["path", "parent", "position", "size", "alpha", "billboardMode", "rotation"],
			aliases: {"animationLoop": "loopFromFrame", "animationFrames": "loopToFrame"},
			desc: "Create a new background that plays the movie file with the specified path on it."
		},
		remove_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove a background."
		},
		create_dragonbones_bg: {
			hasTarget: true,
			params: ["path", "armatureName", "animName", "parent", "position", "size", "canvasWidth", "canvasHeight"],
			desc: "Create a new background with a Dragonbones animation running on it."
		},		
		remove_dragonbones_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove dragonbones background."
		},	
		set_dragonbones_bg_anim: {
			hasTarget: true,
			params: ["animName"],
			desc: "Set dragonbones background animation."
		},
		create_spriter_bg: {
			hasTarget: true,
			params: ["path",  "animName", "parent", "position", "canvasWidth", "canvasHeight", "size"],
			desc: "Create a new background with a Spriter animation running on it."
		},	
		create_spine_bg: {
			hasTarget: true,
			params: ["path",  "animName", "parent", "position", "canvasWidth", "canvasHeight", "size"],
			desc: "Create a new background with a Spine animation running on it."
		},
		create_model: {
			hasTarget: true,
			params: ["path", "parent", "moveOriginToParent", "position", "rotation", "size"],//"animGroup",  "animName", 
			aliases: {"moveOriginToParent": "syncOrigin"},
			desc: "Create a new model."
		},	
		create_model_instance: {
			hasTarget: true,
			params: ["parent"],
			desc: "Create an instance of a loaded model."
		},
		remove_spriter_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove Spriter background."
		},	
		set_spriter_bg_anim: {
			hasTarget: true,
			params: ["animName"],
			desc: "Set Spriter background animation."
		},		
		create_layer: {
			hasTarget: true,
			params: ["path", "isBackground", "frameSize", "lineCount", "columnCount", "animationFrames", "animationLoop", "animationDelay"],
			desc: "Create a new layer."
		},
		create_command_environment: {
			hasTarget: true,
			params: ["id"],
			desc: "Display the specified environment."
		},
		set_rendering_group: {
			hasTarget: true,
			params: ["id"],
			desc: "Set the target's rendering group(default 2, front layer 3, back layer 1)."
		},
		create_target_environment: {
			hasTarget: true,
			params: [],
			desc: "Display the current environment for the specified target(should be active_main or active_target)."
		},
		remove_layer: {
			hasTarget: true,
			params: [],
			desc: "Remove a layer."
		},	
		create_sky_box: {
			hasTarget: true,
			params: ["path", "color"],
			desc: "Create a new sky box."
		},
		remove_sky_box: {
			hasTarget: true,
			params: [],
			desc: "Remove a sky box."
		},	
		play_effekseer: {
			hasTarget: true,
			params: ["path", "position", "scale", "speed", "rotation", "parent", "isBackground", "autoRotate", "flipZ"],
			desc: "Play a predefined effekseer effect."
		},
		remove_effekseer_parent: {
			hasTarget: true,
			params: [],
			desc: "Remove the parent of an effekseer effect if it has one."
		},
		stop_matrix_animations: {
			hasTarget: true,
			params: [],
			desc: "Remove all matrix animation(rotate, translate) applied to the target."
		},
		show_barrier: {
			hasTarget: true,
			params: [],
			desc: "Flashes or breaks the barrier for the target."
		},		
		hide_effekseer: {
			hasTarget: true,
			params: [],
			desc: "Hide a running effekseer effect."
		},
		stop_effekseer_root: {
			hasTarget: true,
			params: [],
			desc: "Stop the root of the effekseer effect, letting the particle system fade out."
		},
		send_effekseer_trigger: {
			hasTarget: true,
			params: ["id"],
			desc: "Send the trigger with the specified id to the target effekseer effect."
		},
		set_effekseer_attract_point: {
			hasTarget: true,
			params: ["position"],
			desc: "Set the location of the attraction point for the effekseer context of the target handle."
		},		
		play_rmmv_anim: {
			hasTarget: true,
			params: ["animId", "position", "scaleX", "scaleY", "loop", "noFlash", "noSfx", "delay"],
			desc: "Play RMMV animation."
		},		
		remove_rmmv_anim: {
			hasTarget: true,
			params: [],
			desc: "Remove a running RMMV animation."
		},
		stop_rmmv_anim: {
			hasTarget: true,
			params: [],
			desc: "Stop a running RMMV animation after the next loop."
		},
		play_rmmv_screen_anim: {
			hasTarget: true,
			params: ["animId", "position", "scaleX", "scaleY", "loop", "noFlash", "noSfx", "delay"],
			desc: "Play RMMV screen animation."
		},		
		remove_rmmv_screen_anim: {
			hasTarget: true,
			params: [],
			desc: "Remove a running RMMV screen animation."
		},
		stop_rmmv_screen_anim: {
			hasTarget: true,
			params: [],
			desc: "Stop a running RMMV screen animation after the next loop."
		},
		play_movie: {
			hasTarget: false,
			params: ["path", "muted", "fade_in"],
			desc: "Play a movie file."
		},	
		stop_movie: {
			hasTarget: false,
			params: [],
			desc: "Stop an active movie."
		},
		fade_out_bgm: {
			hasTarget: false,
			params: ["duration"],
			desc: "Fade out the battle music."
		},
		fade_out_se: {
			hasTarget: false,
			params: ["seId", "duration"],
			desc: "Fade out the sound effect with the specified id."
		},
		fade_in_bgm: {
			hasTarget: false,
			params: ["duration"],
			desc: "Fade in the battle music."
		},
		set_sprite_index: {
			hasTarget: true,
			params: ["index"],
			desc: "Set the frame of a sprite."
		},
		set_sprite_animation: {
			hasTarget: true,
			params: ["name", "animationFrames", "holdFrame", "frameSize", "lineCount", "columnCount", "animationLoop", "animationDelay"],
			desc: "Set the source of a sprite and specify animation details."
		},
		set_sprite_frame: {
			hasTarget: true,
			params: ["name", "snap", "loop", "playAll", "speed", "from", "to", "isPassive"],
			desc: "Set the source frame of a sprite(in, out, dodge, hurt, main)."
		},
		set_model_animation: {
			hasTarget: true,
			params: ["name", "snap", "loop", "playAll", "speed", "from", "to", "isPassive"],
			desc: "Set the animation by name of a model specified by target."
		},
		hide_attachment: {
			hasTarget: true,
			params: ["attachId"],
			desc: "Show the attachment with the specified name for the target model."
		},
		show_attachment: {
			hasTarget: true,
			params: ["attachId"],
			desc: "Hide the attachment with the specified name for the target model."
		},
		hide_sprite: {
			hasTarget: true,
			params: [],
			desc: "Hide a sprite."
		},
		show_sprite: {
			hasTarget: true,
			params: [],
			desc: "Show a sprite."
		},
		hide_bgs: {
			hasTarget: false,
			params: [],
			desc: "Hide the default background elements."
		},
		show_bgs: {
			hasTarget: false,
			params: [],
			desc: "Show the default background elements."
		},
		reset_position: {
			hasTarget: true,
			params: ["duration", "noDamage", "noDamageText"],
			desc: "Reset the position of the target to the default position."
		},
		destroy: {
			hasTarget: true,
			params: ["noWait"],
			desc: "Play the destruction animation of the target."
		},
		show_damage: {
			hasTarget: false,
			params: [],
			desc: "Show the damage the target has taken for the current attack."
		},
		drain_hp_bar: {
			hasTarget: true,
			params: ["percent","duration"],
			desc: "Show damage on the HP bar."
		},
		drain_en_bar: {
			hasTarget: false,
			params: ["percent","duration"],
			desc: "Show EN spent."
		},
		play_se: {
			hasTarget: false,
			params: ["seId","pitch","volume"],
			desc: "Play a sound effect."
		},
		kill_se:  {
			hasTarget: false,
			params: [],
			desc: "Mute all playing sound effects."
		},
		show_portrait_noise: {
			hasTarget: false,
			params: [],
			desc: "Fade in static on character portrait."
		},
		hide_portrait_noise: {
			hasTarget: false,
			params: [],
			desc: "Remove static on character portrait."
		},
		set_bg_scroll_ratio: {
			hasTarget: false,
			params: ["ratio", "smooth", "duration"],
			desc: "Set the speed at which the backgrounds scroll."
		},
		set_animation_ratio: {
			hasTarget: false,
			params: ["ratio", "smooth", "duration(ms)", "easingFunction", "easingMode"],
			desc: "Set the speed at the scene is animated."
		},
		toggle_bg_scroll: {
			hasTarget: false,
			params: [],
			desc: "Invert the current background scroll direction."
		}
	};
	
	if(ENGINE_SETTINGS.BATTLE_SCENE.USE_RENDER_GROUPS){
		_this._commandDisplayInfo["play_rmmv_anim"].params.push("isFront");
		_this._commandDisplayInfo["create_bg"].params.push("isFront");
		_this._commandDisplayInfo["create_movie_bg"].params.push("isFront");
	}
		
	
	
	_this._paramTooltips = {
		r: "The red component of a color 0-255",
		g: "The green component of a color 0-255",
		b: "The blue component of a color 0-255",
		x_fraction: "A screen space position defined by a percentage of the width of the screen.",
		y_fraction: "A screen space position defined by a percentage of the height of the screen.",
		shaderName: "The name of the shader effect to apply",
		shaderDuration: "How the effect is applied for in seconds",
		shaderParam0: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam1: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam2: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam3: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam4: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam5: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam6: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam7: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam8: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shaderParam9: "A parameter for the custom shader. Defined as <param type>:<param name>=<param value>",
		shockwave_intensity: "The intensity of the shockwave effect.",
		immediate: "If 1 the change will be instant.",
		position: "A position defined by an x, y and z coordinate.",
		armatureName: "The name of Armature that will be shown", 
		animGroup: "The name of the group of the model's animations",
		animName: "The name of the animation that will be shown",
		moveOriginToParent: "If 1 set the origin of the object to the parent's absolute position",
		canvasWidth: "The width of the rendering surface for the external renderer", 
		canvasHeight: "The height of the rendering surface for the external renderer",
		parent: "The id of the object that will be the parent of this object.",
		rotation: "A rotation defined by an x, y and z component. The rotations are described with radian values.",
		relative: "If 1 the animation positions will be relative to the target's current position. The specified start position will be ignored!",
		startPosition: "A position defined by an x, y and z coordinate.",
		duration: "The duration of the command in animation ticks.",
		"duration(ms)": "The duration of the command in milliseconds.",		
		easingFunction: "Describes how an object moves from point a to point b. If not specified the object will move linearly.",
		easingMode: "In, out or inout. Parameterizes the easingFunction.",
		hide: "Hide the target object after the command has finished.",
		catmullRom: "Describes two addtional points for a Catmull-Rom spline.",
		startRotation: "A rotation defined by an x, y and z component. The rotations are described with radian values.",
		startSize: "The initial size of the target object.",
		endSize: "The final size of the target object.",
		x: "If 1 the object will be flipped along its x-axis.",
		y: "If 1 the object will be flipped along its y-axis.",
		magnitude_x: "The severity of the shaking effect along the x-axis.",
		magnitude_y: "The severity of the shaking effect along the y-axis.",
		speed_x: "The speed of the shaking effect along the x-axis",
		speed_y: "The speed of the shaking effect along the y-axis",
		fadeInTicks: "The number of ticks the shake effect will ramp up for",
		fadeOutTicks: "The number of ticks the shake effect will ramp down for",
		startFade: "The initial opacity of the object, between 0-1.",
		endFade: "The final opacity of the object, between 0-1.",
		time: "The duration of the command in ticks.",
		speed: "The speed of the effect.",
		speedIn: "The speed of the fadein: 'fast' or 'slow'.",
		speedOut: "The speed of the fadeout: 'fast' or 'slow'.",
		cleanUpCommands: "A list of commands to be run to clean up objects before the next phase.",
		commands: "A list of commands to be run to during the phase transition to set up the next phase.",
		animationFrames: "The number of animation frames in the spritesheet.",
		snap: "If set to 1 no blending will be done into the new sprite frame(if applicable)",
		playAll: "If set to 1 every animation available in the model will be played at once",
		isPassive: "If set to 1 the animation will play alongside other model animations",
		from: "The frame to start playing from",
		to: "The frame to play until",
		attachId: "The name/id of the attachment",
		holdFrame: "If 1 the sprite will hold the final frame of the animation, ignored if animation looping is enabled.",
		scrollSpeed: "Sets the horizontal scroll speed of the background, use negative values to change the scroll direction",
		clamp: "If 1 U Wrap will be set to clamp.",
		noWait: "If 1 the engine will not wait for the destruction animation to complete.",
		noDamage: "If 1 the damage number will not be shown",
		noDamageText: "If 1 the quote for taking damage will not be shown",
		animationLoop: "The animation frame from where to loop. 0 or empty to not loop.",
		animationDelay: "The time between animation frames in ticks.",
		path: "The file path of the asset.",
		size: "The size of the asset.",
		alpha: "The alpha of the object.",
		billboardMode: "Set the billboarding mode for the object: 'none' or 'full'",
		isPilotCutin: "If 1, path is ignored and the active main pilot's defined cutin is used",
		frameSize: "The size of the frames in the spritesheet.",
		lineCount: "The number of lines in the spritesheet.",
		columnCount: "The number of columns in the spritesheet.",
		isBackground: "If 1 the layer will be a background layer.",
		autoRotate: "If 1 the effect will be automatically rotated for enemies.",
		flipZ: "If 1 the effect will have its z scale inverted.",
		color: "The blend color for the skybox.",
		scale: "A scaling factor for the effect.",
		scaleX: "A scaling factor for the width of the effect.",
		scaleY: "A scaling factor for the height of the effect.",
		index: "The new sprite index",
		percent: "How much of the change to the value that should be shown. If the total change is 5000, specifying 50 will show 2500.",
		seId: "The name of the sound effect to play.",
		pitch: "The pitch to play the sound effect at.",
		volume: "The volume to play the sound effect at.",
		ratio: "The factor by which the scroll speed is multiplied.",
		smooth: "If set to 1 the ratio change will be smoothed out over the specified duration.",
		animId: "The id of the RMMV animation.",
		loop: "If set to 1 the animation will continue looping.",
		noFlash: "If set to 1 the flashing effects of the RMMV animation are not shown.",
		noSfx: "If set to 1 the built in sound effects of the animation will not play.",
		delay: "The delay between frames of the animation, default 4.",
		fps: "The frames per second of the movie file",
		muted: "If set to 1 the audio of the video is not played",
		fade_in: "Number of frames the movie will fade in for",
		isFront: "If set to 1 the element will be shown in front of the units, otherwise behind."
	}
	
	_this._paramDisplayHandlers = {
		r: function(value){
			
		},
		g: function(value){
			
		},
		b: function(value){
			
		},
		x_fraction: function(value){
			
		},
		y_fraction: function(value){
			
		},
		shaderDuration: function(value){
			
		},
		shaderName: function(value){
			
		},
		shaderParam0: function(value){
			
		},
		shaderParam1: function(value){
			
		},
		shaderParam2: function(value){
			
		},
		shaderParam3: function(value){
			
		},
		shaderParam4: function(value){
			
		},
		shaderParam5: function(value){
			
		},
		shaderParam6: function(value){
			
		},
		shaderParam7: function(value){
			
		},
		shaderParam8: function(value){
			
		},
		shaderParam9: function(value){
			
		},
		shockwave_intensity: function(value){
			
		},
		immediate: function(value){
			
		}, 
		armatureName: function(value){
			
		}, 
		animName: function(value){
			
		},
		moveOriginToParent: function(value){
			
		},
		animGroup: function(value){
			
		},
		canvasWidth: function(value){
			
		}, 
		canvasHeight: function(value){
			
		},
		position: function(value){
			if(!value){
				value = {};
			}
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";

			result+="<select class='position_select'>";
			result+="<option  value=''></option>";
			var defaultPositions = $battleSceneManager.getDefaultPositions();
			Object.keys(defaultPositions).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";	
			result+="<button class='copy_from_cam' data-prop='position'>"+EDITORSTRINGS.ATTACKS.label_copy_helper+"</button>";
			result+="</div>";
			return result;
		},
		rotation: function(value){
			if(!value){
				value = {};
			}
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";	

			result+="<select class='rotation_select'>";
			result+="<option  value=''></option>";
			var defaultRotations = $battleSceneManager.getDefaultRotations();
			Object.keys(defaultRotations).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";	
			
			result+="<button class='copy_from_cam' data-prop='rotation'>"+EDITORSTRINGS.ATTACKS.label_copy_helper+"</button>";
			result+="</div>";
			return result;
		},
		parent: function(value){
			
		}, 
		startPosition: function(value){
			return _this._paramDisplayHandlers.position(value);
		},
		duration: function(value){
			
		},
		"duration(ms)": function(value){
			
		},
		relative: function(value){
			
		},
		easingFunction: function(value){
			var result = "";			
			result+="<select class='easing_select param_select'>";
			result+="<option  value=''></option>";
			Object.keys(_this._easingFunctions).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";
			return result;
		},
		easingMode: function(value){
			var result = "";			
			result+="<select class='easing_mode_select param_select'>";
			result+="<option value=''></option>";
			Object.keys(_this._easingModes).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+_this._easingModes[type]+"</option>";
			});
			result+="</select>";
			return result;
		},
		hide: function(value){
			var result = "";			
			result+="<select class='hide_select param_select'>";
			result+="<option value='0' "+(!value ? "selected" : "")+">0</option>";
			result+="<option value='1' "+(value ? "selected" : "")+">1</option>";			
			result+="</select>";
			return result;
		},
		catmullRom: function(value){		
			if(!value){
				value = {
					pos1: {},
					pos4: {}
				};
			}
			var result = "";
			result+="<div class='catmullrom_block' style=''>";
			result+="<div data-catmullpos='pos1' class='param_values pos1'>";
			result+="x1: <input data-dataid='x' class='param_value param_coord' value='"+(value.pos1.x || "")+"'></input>";
			result+="y1: <input data-dataid='y' class='param_value param_coord' value='"+(value.pos1.y || "")+"'></input>";
			result+="z1: <input data-dataid='z' class='param_value param_coord' value='"+(value.pos1.z || "")+"'></input>";	

			
			result+="</div>";
			
			result+="<div data-catmullpos='pos4' class='param_values pos4'>";
			result+="x2: <input data-dataid='x' class='param_value param_coord' value='"+(value.pos4.x || "")+"'></input>";
			result+="y2: <input data-dataid='y' class='param_value param_coord' value='"+(value.pos4.y || "")+"'></input>";
			result+="z2: <input data-dataid='z' class='param_value param_coord' value='"+(value.pos4.z || "")+"'></input>";	

			result+="</div>";
			result+="</div>";
			return result;
		},
		startRotation: function(value){
			return _this._paramDisplayHandlers.rotation(value);
		},
		startSize: function(value){
		
		},
		endSize: function(value){
		
		},
		x: function(value){
		
		},
		y: function(value){
		
		},
		id: function(value){
		
		},
		id_text: function(value){
			let result = "";
			
			result+="<input value='"+(value || "")+"'></input>";
			
				
			
			
			result+="<div class='quote_selector_container'>";
			result+="<img class='quote_selector_control' src='"+_this._svgPath+"pencil-fill.svg'>";
			result+="<div class='quote_selector'>";
			
			result+="</div>";
			result+="</div>";
			return result;
		},
		magnitude_x: function(value){
		
		},
		magnitude_y: function(value){
		
		},
		speed_x: function(value){
		
		},
		speed_y: function(value){
		
		},
		fadeInTicks: function(value){
		
		},
		fadeOutTicks: function(value){
		
		},
		startFade: function(value){
		
		},
		endFade: function(value){
		
		},
		time: function(value){
		
		},
		speed: function(value){
		
		},
		speedOut: function(value){
		
		},
		cleanUpCommands: function(value){
			return _this._paramDisplayHandlers.commands(value);
		},
		commands: function(value){
			var content = "<div class='inner_commands'>";
			content+="<button class='tick_add_command'>New</button>";
			if(_this._clipboardCommand){
				content+="<button class='tick_paste_command'>Paste</button>";
			}			
			if(value){			
				var ctr = 0;
				value.forEach(function(command){
					content+="<div data-cmdid='"+command.type+"' data-cmdidx='"+(ctr++)+"' class='cmd_block_inner'>";
					content+=_this.getCommandContent(command, true);
					content+="</div>";
				});
			}
			content+="</div>";
			return content;
		},
		animationFrames: function(value){
		
		},
		attachId: function(value){
		
		},
		snap: function(value){
		
		}, 
		playAll: function(value){
			
		},
		isPassive: function(value){
			
		},
		from: function(value){
			
		},
		to: function(value){
			
		},
		animationLoop: function(value){
		
		},
		holdFrame: function(value){
		
		}, 
		scrollSpeed: function(value){
		
		},
		clamp: function(value){
		
		},		
		noWait:  function(value){
		
		}, 
		noDamage: function(value){
		
		}, 
		isFront: function(value){
		
		}, 
		noDamageText: function(value){
		
		}, 
		animationDelay: function(value){
		
		},
		path: function(value){
		
		},
		name: function(value){
		
		},
		size: function(value){
		
		},
		alpha: function(value){
		
		},
		billboardMode: function(value){
		
		},
		isPilotCutin: function(value){
		
		}, 
		frameSize: function(value){
		
		},
		lineCount: function(value){
		
		},
		columnCount: function(value){
		
		},
		isBackground: function(value){
		
		},
		autoRotate: function(value){
		
		},
		flipZ: function(value){
		
		},
		color: function(value){
		
		},
		scale: function(value){
		
		},
		index: function(value){
		
		},
		percent: function(value){
		
		},
		seId: function(value){
		
		},
		pitch: function(value){
		
		},
		volume: function(value){
		
		},
		ratio: function(value){
			
		},
		smooth: function(value){
			
		},
		animId: function(value){
			
		},
		fps: function(value){
			
		},
		muted: function(value){
			
		},
		fade_in: function(value){
			
		},
		loop: function(value){
			
		},
		noFlash: function(value){
			
		},
		delay: function(value){
			
		},
		scaleX: function(value){
			
		},
		scaleY: function(value){
			
		},
		noSfx: function(value){
			
		}
	}
	
	_this._currentSequenceType = "mainAnimation";
	_this._paramHandlers = {};
	_this._editorScrollTop = 0;
	
	_this._currentActor = 1;
	_this._currentActorTwin = -1;
	_this._currentActorMech = 1;
	_this._currentActorTwinMech = -1;
	_this._currentEnemy = 1;
	_this._currentEnemyTwin = -1;
	_this._currentEnemyMech = 1;
	_this._currentEnemyTwinMech = -1;
	
	//battle text
	_this._currentBattleTextType = "default";
	_this._currentBattleTextActorType = "actor";
	_this._currentBattleTextStage = -1;
	_this._currentBattleTextEvent = -1;
	_this._currentTextUnit = 0;
	_this._currentTextHook = "battle_intro";
	
	_this.show();
}


SRWEditor.prototype.savePreferences = function(id){
	if(!this._preferences){
		this._preferences = {};
	}
	var fs = require('fs');
	var dirPath = 'js/plugins/config/active';
	if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
	fs.writeFileSync('js/plugins/config/active/EditorPreferences.json', JSON.stringify(this._preferences));
}

SRWEditor.prototype.show = function(){
	var _this = this;
	var content = "";
	
	AudioManager.stopBgm();
	
	var xhr = new XMLHttpRequest();
    var url = 'js/plugins/config/active/EditorPreferences.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            _this._preferences = (JSON.parse(xhr.responseText));  
			finalize();	
        }
    };
    xhr.onerror = finalize;
    window[name] = null;
    xhr.send();
	
	
	function finalize(){	
		$battleSceneManager.toggleTextBox(true);
	
		if(!_this._preferences){
			_this._preferences = {};
		}
		var currentEditorInfo = _this._editorData[_this._currentEditor];
		content+="<div class='header'>";
		content+=_this._title + " - " + currentEditorInfo.title;
		
		content+="<select id='editor_selector'>";	
		
		content+="<option value='ally_pilot_editor' "+(_this._currentEditor == "ally_pilot_editor" ? "selected" : "")+">Ally Pilots</option>";
		content+="<option value='enemy_pilot_editor' "+(_this._currentEditor == "enemy_pilot_editor" ? "selected" : "")+">Enemy Pilots</option>";
		content+="<option value='mech_editor' "+(_this._currentEditor == "mech_editor" ? "selected" : "")+">Mechs</option>";	
		
		content+="<option value='weapon_editor' "+(_this._currentEditor == "weapon_editor" ? "selected" : "")+">Weapons</option>";	
		
		content+="<option value='pattern_editor' "+(_this._currentEditor == "pattern_editor" ? "selected" : "")+">Patterns</option>";
		
		content+="<option value='attack_editor' "+(_this._currentEditor == "attack_editor" ? "selected" : "")+">Attack Animations</option>";
		content+="<option value='environment_editor' "+(_this._currentEditor == "environment_editor" ? "selected" : "")+">Environments</option>";
		content+="<option value='battle_text_editor' "+(_this._currentEditor == "battle_text_editor" ? "selected" : "")+">Battle Text</option>";
		
		content+="</select>";
		content+="</div>";
		
		content+="<div class='content'>";
		content+="</div>";
		
		_this._contentDiv.innerHTML = content;
		
		//Graphics.updatePreviewWindowWidth();
		
		_this._contentDiv.querySelector("#editor_selector").addEventListener("change", function(){
			var c = true;
			if(_this._modified){
				c = confirm("Discard unsaved changes in the current editor?");
			}
			if(c){
				_this._modified = false;
				$battleSceneManager.endScene();
				//_this._currentDefinition = 0;
				//_this._currentEnvironmentDefinition = 0;
				_this._currentEditor = this.value;
				_this.show();
			} else {
				this.value = _this._currentEditor;
				return false;
			}			
		});
		
		currentEditorInfo.func.call(_this);
		Graphics.updatePreviewWindowWidth()
	}
}

SRWEditor.prototype.getBattleEnvironmentId = function(){
	return this._currentEnvironmentDefinition;
}

SRWEditor.prototype.prepareBattleScenePreview = function(){
	var _this = this;
	document.onkeydown = null;
	
	/*if(_this._battleSceneLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_layer"));
	}	
	_this._battleSceneLayer = document.querySelector("#attack_editor #battle_scene_layer");
	_this._battleSceneLayer.style.width = "";
	_this._battleSceneLayer.style.height = "";
	
	if(_this._battleSceneUILayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneUILayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_ui_layer"));
	}	
	_this._battleSceneUILayer = document.querySelector("#attack_editor #battle_scene_ui_layer");
	_this._battleSceneUILayer.style.width = "";
	_this._battleSceneUILayer.style.height = "";
	
	if(_this._battleSceneFadeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneFadeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#fade_container"));
	}
	_this._battleSceneFadeLayer = document.querySelector("#attack_editor #fade_container");
	_this._battleSceneFadeLayer.style.width = "";
	_this._battleSceneFadeLayer.style.height = "";
	
	if(_this._battleSceneSystemFadeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneSystemFadeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#system_fade_container"));
	}
	_this._battleSceneSystemFadeLayer = document.querySelector("#attack_editor #system_fade_container");
	_this._battleSceneSystemFadeLayer.style.width = "";
	_this._battleSceneSystemFadeLayer.style.height = "";
	
	if(_this._battleSceneSwipeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneSwipeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#swipe_container"));
	}
	_this._battleSceneSwipeLayer = document.querySelector("#attack_editor #swipe_container");
	_this._battleSceneSwipeLayer.style.width = "";
	_this._battleSceneSwipeLayer.style.height = "";*/
	
	
	
	
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._container);
	$battleSceneManager._container.style.width = "";
	$battleSceneManager._container.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._UIcontainer);	
	$battleSceneManager._UIcontainer.style.width = "";
	$battleSceneManager._UIcontainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._PIXIContainer);	
	$battleSceneManager._PIXIContainer.style.width = "";
	$battleSceneManager._PIXIContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._movieContainer);	
	$battleSceneManager._movieContainer.style.width = "";
	$battleSceneManager._movieContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._fadeContainer);
	$battleSceneManager._fadeContainer.style.width = "";
	$battleSceneManager._fadeContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._systemFadeContainer);
	$battleSceneManager._systemFadeContainer.style.width = "";
	$battleSceneManager._systemFadeContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._swipeContainer);
	$battleSceneManager._swipeContainer.style.width = "";
	$battleSceneManager._swipeContainer.style.height = "";
	
	//$battleSceneManager.init(true);	
	
	$battleSceneManager.setExternalFPSCounter(document.querySelector("#attack_editor .fps_counter"));
	$battleSceneManager.setExternalTickCounter(document.querySelector("#attack_editor .tick_counter"));
	
	//$battleSceneManager._fadeContainer = _this._battleSceneFadeLayer;
}

SRWEditor.prototype.showBattleTextEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	
	$battleSceneManager.toggleTextBox(true);
	
	content+="<div id='attack_editor' class='text_editor'>";
	content+="<div class='edit_controls'>";
	
	content+="</div>";
	content+="<div class='preview'>";
	
	content+="<div class='preview_window_container'>";
	
	
	
	content+="<div class='preview_window'>";
	content+="</div>";
	
	
	
	content+="</div>";	
	
	content+="<div class='preview_extra_controls'>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	this.prepareBattleScenePreview();
	
	
	this.showBattleTextEditorControls();
}

SRWEditor.prototype.showBattleTextEditorControls = function(){
	var _this = this;
	_this._battleTextBuilder.isLoaded().then(function(){
		$battleSceneManager.showEnvironmentScene();	
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>"+EDITORSTRINGS.GENERAL.label_save+"</button>";
		content+="<div class='section_label'>"+EDITORSTRINGS.GENERAL.label_info+"</div>";
		content+="<div class='section_content' id='text_editor_section_tools'>";
		
		var currentTextInfo;

		var currentTypeInfo = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType];
		
		content+="<div class='row'>";
		content+="<div class='select_label'>";
		content+=EDITORSTRINGS.TEXT.label_text_type;
		content+="</div>";
		content+="<select id='battle_text_type_select'>";
		content+="<option value='default' "+(_this._currentBattleTextType == "default" ? "selected" : "")+">Default</option>";
		//content+="<option value='stage' "+(_this._currentBattleTextType == "stage" ? "selected" : "")+">Stage</option>";
		content+="<option value='event' "+(_this._currentBattleTextType == "event" ? "selected" : "")+">Special</option>";
		content+="</select>";
		
		if(_this._currentBattleTextType == "event"){
			content+="<div class='select_label'>";
			content+=EDITORSTRINGS.TEXT.label_event;
			content+="</div>";
			content+="<select id='battle_text_event_select'>";
			content+="<option value='-1'></option>";
			if(currentTypeInfo){
				var definedEvents = Object.keys(currentTypeInfo);
				//if(_this._currentBattleTextEvent == -1){
				//	_this._currentBattleTextEvent = definedEvents[0];
			//	}
				Object.keys(definedEvents).forEach(function(eventId){
					var refId = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][eventId].refId;
					content+="<option value='"+eventId+"' "+(_this._currentBattleTextEvent == eventId ? "selected" : "")+">"+eventId+". "+refId+"</option>";
				});
				
				var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextEvent];	
				if(currentStageTextInfo){
					currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
				}
			}
			content+="</select>";
			
		} else {
			if(currentTypeInfo){
				currentTextInfo = currentTypeInfo[_this._currentBattleTextActorType];
			}
		}
		content+="</div>";
		content+="<div class='row'>";
		content+="<div class='select_label'>";
		content+=EDITORSTRINGS.TEXT.label_unit_type;
		content+="</div>";
		content+="<select id='battle_text_actor_type_select'>";
		content+="<option value='actor' "+(_this._currentBattleTextActorType == "actor" ? "selected" : "")+">Actor</option>";
		content+="<option value='enemy' "+(_this._currentBattleTextActorType == "enemy" ? "selected" : "")+">Enemy</option>";

		content+="</select>";
		
		content+="<div class='select_label'>";
		content+=EDITORSTRINGS.TEXT.label_unit;
		content+="</div>";
		content+=_this.createUnitSelect(_this._currentTextUnit, null, false, "main_unit_select");
		
		
		var textHooks = _this._battleTextBuilder.getAvailableTextHooks();
		content+="<div class='select_label'>";
		content+=EDITORSTRINGS.TEXT.label_text_type;
		content+="</div>";
		content+="<select id='text_type_select'>";
		
		textHooks.forEach(function(textHook){
			content+="<option "+(_this._currentTextHook == textHook ? "selected" : "")+" value='"+textHook+"'>"+textHook+"</option>";
		});
		content+="</select>";
		content+="</div>";
		
		content+="</div>";
		content+="</div>";
		
		if(_this._currentBattleTextType == "event"){
			content+="<div class='event_controls'>";
			if(_this._currentBattleTextEvent != -1){
				content+="<div class='command_label reference_id_label'>"+EDITORSTRINGS.TEXT.label_reference_id+":</div>";
				content+="<input class='event_id' value='"+_this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][_this._currentBattleTextEvent].refId+"'></input>";
			}
			content+="<button class='event_new'>New</button>";
			if(_this._currentBattleTextEvent != -1){
				content+="<button class='event_copy'>"+EDITORSTRINGS.GENERAL.label_copy+"</button>";
				content+="<button class='event_delete'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";
			}		
			content+="</div>";
		}
		
		content+="<div class='commands_scroll text_scroll_"+_this._currentBattleTextType+"'>";
		
		/*Object.keys(currentTextInfo).forEach(function(unitId){
			var currentData = currentTextInfo[unitId];
			content+="<div data-unitbg='"+unitId+"' class='bg_block tick_block'>";
			content+=_this.createUnitSelect(unitId);
			content+="</div>";
		});*/
		
		var unitSet;
		if(_this._currentBattleTextActorType == "actor"){
			unitSet = $dataActors;
		} else {
			unitSet = $dataEnemies;
		}
		var result = "";
		
		
		function createUnitText(textInfo){
			var content = "";
			content+="<div class='unit_text'>";
			content+="<div data-subtype='default' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_default+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.default.forEach(function(quote){
				content+=_this.createQuoteContent("default", ctr++, quote);
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='target_mech' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_target_mech+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.target_mech.forEach(function(quote){
				content+=_this.createQuoteContent("target_mech", ctr++, quote, null, null, {id: quote.mechId});
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='mech' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_mech+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.mech.forEach(function(quote){
				content+=_this.createQuoteContent("mech", ctr++, quote, null, {id: quote.mechId});
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='actor' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_actors+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"	
			
			var ctr = 0;
			textInfo.actor.forEach(function(unitInfo){								
				content+=_this.createQuoteContent("actor", ctr++, unitInfo, {type: "actor", id: unitInfo.unitId});							
			});

			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='enemy' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_enemies+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
								
			var ctr = 0;
			textInfo.enemy.forEach(function(unitInfo){								
				content+=_this.createQuoteContent("enemy", ctr++, unitInfo, {type: "enemy", id: unitInfo.unitId});							
			});

			content+="</div>";
			
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='target_actor_tag' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_target_pilots_tags+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
								
			var ctr = 0;
			textInfo.target_actor_tag.forEach(function(unitInfo){									
				content+=_this.createQuoteContent("target_actor_tag", ctr++, unitInfo, {type: "tag"});							
			});

			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='target_mech_tag' class='text_category_controls'>";
			content+="<div class='text_label'>"+EDITORSTRINGS.TEXT.label_target_mech_tags+"</div>";
			content+="<button class='add_category_quote'>"+EDITORSTRINGS.TEXT.label_new+"</button>";
			content+="</div>"
								
			var ctr = 0;
			textInfo.target_mech_tag.forEach(function(unitInfo){								
				content+=_this.createQuoteContent("target_mech_tag", ctr++, unitInfo, {type: "tag"});							
			});

			content+="</div>";
			return content;
		}
		
		var i = _this._currentTextUnit;
		var def = unitSet[_this._currentTextUnit];
		if(def && def.name){
			content+="<div data-unitid='"+i+"' class='unit_text_block '>";//tick_block
			//content+=i+". "+def.name;				
			let textHook = _this._currentTextHook;	
			//textHooks.sort().forEach(function(textHook){
				content+="<div data-hook='"+textHook+"' data-unitid='"+i+"' class='text_block'>";//cmd_block cmd_block_outer 
				content+="<div class='hook_label'>";
				//content+=textHook;
				content+="</div>";
				
				content+="<div class='text_types'>";
				var textInfo = _this.getUnitDef(i, textHook);
				if(textInfo){
					if(textHook == "attacks"){		
						content+="<div data-subtype='default' class='attacks_controls'>";
						
						var availableAttacks = [];
						content+="<select class='attack_select'>";
						content+="<option value='-1'></option>"
						$dataWeapons.forEach(function(weapon){
							if(weapon && weapon.name && !textInfo[weapon.id]){
								content+="<option value='"+weapon.id+"'>"+weapon.name+"</option>"
							}
						});
						content+="</select>"
						content+="<button class='add_attack'>"+EDITORSTRINGS.TEXT.label_add+"</button>";
						content+="</div>"
						Object.keys(textInfo).forEach(function(weaponId){
							content+="<div data-weaponid='"+weaponId+"' class='attack_text'>";
							content+="<div class='delete_weapon_entry'><img src='"+_this._svgPath+"close-line.svg'></div>";
							content+="<div class='title_label'>"+weaponId+". "+$dataWeapons[weaponId].name+"</div>";
							
							var options = textInfo[weaponId];
							if(!options.default){
								options.default = [];
							}
							if(!options.mech){
								options.mech = [];
							}
							if(!options.actor){
								options.actor = [];
							}
							if(!options.enemy){
								options.enemy = [];
							}
							if(!options.target_mech){
								options.target_mech = [];
							}
							if(!options.target_mech_tag){
								options.target_mech_tag = [];
							}
							if(!options.target_actor_tag){
								options.target_actor_tag = [];
							}
							content+=createUnitText(options);
							content+="</div>"
						});						
					} else {	
						if(!textInfo.target_mech_tag){
							textInfo.target_mech_tag = [];
						}
						if(!textInfo.target_actor_tag){
							textInfo.target_actor_tag = [];
						}
					
						content+=createUnitText(textInfo);
					}
				}
				content+="</div>";
				content+="</div>";
			//});
			content+="</div>";

		}
		
				
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector("#battle_text_type_select").addEventListener("change", function(){
			$gameTemp.scriptedBattleDemoId = null;
			_this._currentBattleTextType = this.value;
			_this._currentTextUnit = 0;
			//_this._currentBattleTextActorType = "actor";
			//_this._currentTextUnit = 0;
			_this.showBattleTextEditorControls();
		});
		
		if(_this._currentBattleTextType == "stage"){
			containerNode.querySelector("#battle_text_stage_select").addEventListener("change", function(){
				_this._currentBattleTextStage = this.value;
				_this.showBattleTextEditorControls();
			});
		}
		
		if(_this._currentBattleTextType == "event"){
			containerNode.querySelector("#battle_text_event_select").addEventListener("change", function(){
				_this._currentBattleTextEvent = this.value;
				$gameTemp.scriptedBattleDemoId =_this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][_this._currentBattleTextEvent].refId;
				_this.showBattleTextEditorControls();
			});
		}
		
		containerNode.querySelector("#battle_text_actor_type_select").addEventListener("change", function(){
			_this._currentBattleTextActorType = this.value;
			_this.showBattleTextEditorControls();
		});		
		
		containerNode.querySelector(".main_unit_select").addEventListener("change", function(){
			_this._currentTextUnit = this.value;
			_this.showBattleTextEditorControls();
		});
		
		containerNode.querySelector("#text_type_select").addEventListener("change", function(){
			_this._currentTextHook = this.value;
			_this.showBattleTextEditorControls();
		});		
		
		var viewButtons = containerNode.querySelectorAll(".view_text_btn");
		viewButtons.forEach(function(button){
			button.addEventListener("click", function(){
				var entityType = _this._currentBattleTextActorType;
				var entityId = this.closest(".unit_text_block").getAttribute("data-unitid");
				var unitSet;
				if(_this._currentBattleTextActorType == "actor"){
					unitSet = $dataActors;
				} else {
					unitSet = $dataEnemies;
				}
				var name = unitSet[entityId].name;
				var type = this.closest(".text_block").getAttribute("data-hook");
				var subType = this.closest(".quote").getAttribute("data-subtype");
				
				var targetIdx =  this.closest(".quote").getAttribute("data-idx");
				var attackId;
				var attackText = this.closest(".attack_text");
				if(attackText){
					attackId = attackText.getAttribute("data-weaponid");
					targetIdx = this.closest(".quote").querySelector(".quote_id").value;
				}
				var actor = new Game_Actor(entityId, 0, 0);
				$statCalc.initSRWStats(actor);
				var mechId;
								
				if(subType == "mech"){
					mechId = this.closest(".quote").querySelector(".mech_select").value;
				}
				if(mechId){
					actor._mechClass = mechId;	
					$statCalc.initSRWStats(actor);
				}
				
				var targetId = this.closest(".quote").getAttribute("data-targetunit");
				var targetMechId;
				if(subType == "target_mech"){
					targetMechId = this.closest(".quote").querySelector(".target_mech_select").value;
				}				
				
				$battleSceneManager.showText(entityType, actor, name, type, subType, {id: targetId, mechId: targetMechId}, targetIdx, attackId, {id: targetId, mechId: targetMechId});
			});
		});	

		function getLocatorInfo(elem){
			var params = {};
			params.sceneType = _this._currentBattleTextType;
			params.entityType = _this._currentBattleTextActorType;
			params.eventId = _this._currentBattleTextEvent;
			params.stageId = _this._currentBattleTextStage;
			params.entityId = elem.closest(".unit_text_block").getAttribute("data-unitid");
			
			params.type = elem.closest(".text_block").getAttribute("data-hook");
			var quote = elem.closest(".quote");
			if(quote){
				params.subType = quote.getAttribute("data-subtype");
				params.targetId = quote.getAttribute("data-targetunit");
				params.targetIdx = quote.getAttribute("data-idx");
			}			
			var attackText = elem.closest(".attack_text");
			if(attackText){
				params.weaponId = attackText.getAttribute("data-weaponid");
			}		
			var quoteLine = elem.closest(".quote_line");
			if(quoteLine){
				params.lineIdx = quoteLine.getAttribute("data-lineidx");
			}
			
			
			return params;
		}	
		
		var buttons = containerNode.querySelectorAll(".delete_text_btn");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){
				if(confirm(EDITORSTRINGS.TEXT.confirm_delete_text)){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.deleteText(params);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		});	
		
		var buttons = containerNode.querySelectorAll(".delete_weapon_entry");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){
				if(confirm(EDITORSTRINGS.TEXT.confirm_delete_entry)){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.deleteWeaponEntry(params);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		});			
		
		var buttons = containerNode.querySelectorAll(".add_attack");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){			
				var weaponId = this.parentNode.querySelector(".attack_select").value;
				if(weaponId != -1){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.addWeaponEntry(params, weaponId);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}													
			});
		});		
		
		function updatePortraitPreviews(){
			var divs = containerNode.querySelectorAll(".portrait_preview");
			divs.forEach(function(div){
				let faceName = div.closest(".quote_line").querySelector(".quote_face_name").value;
				let	faceIndex = div.closest(".quote_line").querySelector(".quote_face_index").value;
				FaceManager.loadFaceByParams(faceName, faceIndex, div);
			});
		}
		updatePortraitPreviews();
		
		var divs = containerNode.querySelectorAll(".portrait_preview");
		divs.forEach(function(div){
			div.addEventListener("click", async function(e){
				var elem = this;
				let faceName = this.closest(".quote_line").querySelector(".quote_face_name").value;
				let	faceIndex = this.closest(".quote_line").querySelector(".quote_face_index").value;
				let result = await FaceManager.showFaceSelector(e, faceName, faceIndex, this);
				if(result.status == "updated"){
					this.closest(".quote_line").querySelector(".quote_face_name").value = result.faceName;
					this.closest(".quote_line").querySelector(".quote_face_index").value = result.faceIndex;
					updateQuote(e, elem);
				}
			});			
		});
		
		function updateQuote(e, elem){
			if(!elem){
				elem = this;
			}
			var newVal  = {
				text: elem.closest(".quote_line").querySelector(".quote_text").value,
				faceName: elem.closest(".quote_line").querySelector(".quote_face_name").value,
				faceIndex: elem.closest(".quote_line").querySelector(".quote_face_index").value,
				displayName: elem.closest(".quote_line").querySelector(".quote_display_name").value,
				duration: elem.closest(".quote_line").querySelector(".quote_duration").value,
			}
			var params = getLocatorInfo(elem);
			if(params.type == "attacks"){
				newVal.quoteId = elem.closest(".quote").querySelector(".quote_id").value;
			}
			_this._battleTextBuilder.updateText(params, newVal);
			_this._modified = true;
			updatePortraitPreviews();
		}
		
		var inputs = containerNode.querySelectorAll(".quote_text");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});	
		
		var inputs = containerNode.querySelectorAll(".quote_face_name");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});	
		
		var inputs = containerNode.querySelectorAll(".quote_face_index");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});
		
		var inputs = containerNode.querySelectorAll(".quote_display_name");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});		
		
		var inputs = containerNode.querySelectorAll(".quote_duration");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});
		
		
					
		
		
		var inputs = containerNode.querySelectorAll(".quote_id");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){				
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setQuoteId(params, this.value);
				_this._modified = true;
			});
		});			
		
		var inputs = containerNode.querySelectorAll(".add_category_quote");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var params = getLocatorInfo(this);
				var categoryControls = this.closest(".text_category_controls");
				params.subType = categoryControls.getAttribute("data-subtype");
				_this._battleTextBuilder.addText(params);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".add_line");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.addTextLine(params);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		});	
		
		var inputs = containerNode.querySelectorAll(".unit_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setUnitId(params, this.value);
				_this._modified = true;
			});
		});	
		
		var inputs = containerNode.querySelectorAll(".mech_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setMechId(params, this.value);
				_this._modified = true;
			});
		});
		
		var inputs = containerNode.querySelectorAll(".target_mech_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setMechId(params, this.value);
				_this._modified = true;
			});
		});	
		var inputs = containerNode.querySelectorAll(".quote_tag");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setQuoteTag(params, this.value);
				_this._modified = true;
			});
		});	
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._battleTextBuilder.save();
			_this._modified = false;
			_this.showBattleTextEditorControls();
		});
		
		var eventIdInput = containerNode.querySelector(".event_id");
		if(eventIdInput){
			eventIdInput.addEventListener("change", function(){
				_this._battleTextBuilder.changeEventId(_this._currentBattleTextEvent, this.value);
				$gameTemp.scriptedBattleDemoId = this.value;
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}
		
		var eventNewBtn = containerNode.querySelector(".event_new");
		if(eventNewBtn){
			eventNewBtn.addEventListener("click", function(){
				_this._battleTextBuilder.addEvent();
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}
		
		var eventNewBtn = containerNode.querySelector(".event_copy");
		if(eventNewBtn){
			eventNewBtn.addEventListener("click", function(){
				_this._battleTextBuilder.copyEvent(_this._currentBattleTextEvent);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}

		var eventDeleteBtn = containerNode.querySelector(".event_delete");
		if(eventDeleteBtn){
			eventDeleteBtn.addEventListener("click", function(){
				if(confirm(EDITORSTRINGS.TEXT.confirm_delete_event_entry)){
					_this._battleTextBuilder.deleteEvent(_this._currentBattleTextEvent);
					_this._currentBattleTextEvent = -1;
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		}		
		
		var btns = containerNode.querySelectorAll(".portrait_copy");
		btns.forEach(function(btn){
			btn.addEventListener("click", function(){
				let faceName = this.closest(".quote_line").querySelector(".quote_face_name").value;
				let	faceIndex = this.closest(".quote_line").querySelector(".quote_face_index").value;
				_this._faceBuffer = {
					faceName: faceName,
					faceIndex: faceIndex
				};
				_this.showBattleTextEditorControls();
			});
		});
		
		var btns = containerNode.querySelectorAll(".portrait_paste");
		btns.forEach(function(btn){
			btn.addEventListener("click", function(e){
				if(_this._faceBuffer){
					this.closest(".quote_line").querySelector(".quote_face_name").value = _this._faceBuffer.faceName;
					this.closest(".quote_line").querySelector(".quote_face_index").value = _this._faceBuffer.faceIndex;
					updateQuote(e, this);
					_this.showBattleTextEditorControls();
				}				
			});
		});
		
	});
}

SRWEditor.prototype.createQuoteContent = function(type, idx, quote, unitBaseInfo, mechBaseInfo, targetMechBaseInfo){
	var _this = this;
	var content = "";
	var targetUnitId;

	var lines = [];
	if(!Array.isArray(quote)){
		lines = [quote];
	} else {
		lines = quote;
	}
	
	var lineCounter = 0;
	content+="<div data-subtype='"+type+"' data-idx='"+idx+"'class='quote'>";
	content+="<div class='quote_title'>"+EDITORSTRINGS.TEXT.label_quote+"</div>";
	lines.forEach(function(quote){			
		var mechInfo;
		if(mechBaseInfo){
			mechInfo = {
				id: quote.mechId
			};
		}	
		
		var unitInfo;
		if(unitBaseInfo){
			unitInfo = {
				id: quote.unitId,
				type: unitBaseInfo.type,
				tag: quote.tag || ""
			};
		}
		var targetMechInfo;
		if(targetMechBaseInfo){
			targetMechInfo = {
				id: quote.mechId
			};
		}
		
		//hack to pretend that the quote id is stored for an entire quote instead of for each line of the quote		
		if(quote.quoteId != null && lineCounter == 0){		
			content+="<div class='command_label quote_id_label'>"+EDITORSTRINGS.TEXT.label_quote_id+":</div>";
			content+="<input class='quote_id' value='"+quote.quoteId+"'></input>";		
		}	
		
		
		content+="<div data-lineidx='"+(lineCounter)+"'  data-targetunit='"+(quote.unitId)+"'  class='quote_line'>";
		
		content+="<div class='line_title'>"+EDITORSTRINGS.TEXT.label_line+" "+(lineCounter+1)+"</div>";		
		content+="<div class='quote_config'>";
		
		
		
		content+="<div class='portrait_preview'></div>";
		
		content+="<div class='face_controls'>";
		content+="<button class='portrait_copy'>"+EDITORSTRINGS.TEXT.label_copy_face+"</button>";
		if(_this._faceBuffer){
			content+="<button class='portrait_paste'>"+EDITORSTRINGS.TEXT.label_paste_face+"</button>";
		}
		content+="</div>";
		
		content+="<div class='face_inputs'>";
		
		content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_face_name+":</div>";
		content+="<input class='quote_face_name' value='"+quote.faceName+"'></input>";
		content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_face_index+":</div>";
		content+="<input class='quote_face_index' value='"+quote.faceIndex+"'></input>";
		
		content+="</div>";
		
		
		content+="<div class='quote_controls'>";
		content+="<div title='"+EDITORSTRINGS.TEXT.hint_preview+"' class='view_text_btn'><img src='"+_this._svgPath+"eye-line.svg'></div>"
		content+="<div title='"+EDITORSTRINGS.TEXT.hint_delete+"' class='delete_text_btn'><img src='"+_this._svgPath+"close-line.svg'></div>"
		content+="</div>";
		content+="</div>";
		
		content+="<div>";
		content+="<div class='command_label name'>"+EDITORSTRINGS.TEXT.label_name+":</div>";
		content+="<input class='quote_display_name' value='"+(quote.displayName || "")+"'></input>";
		
		content+="<div class='command_label duration'>"+EDITORSTRINGS.TEXT.label_duration+":</div>";
		content+="<input class='quote_duration' value='"+(quote.duration ||  "")+"'></input>";
		content+="</div>";
		
		content+="<div class='quote_id_container'>";
		
		
		if(unitInfo && lineCounter == 0){
			if(unitInfo.type != "tag"){
				content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_other_unit+":</div>";
				content+=_this.createUnitSelect(unitInfo.id, unitInfo.type);
			} else {
				content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_tag+":</div>";
				content+="<input class='quote_tag' value='"+unitInfo.tag+"'></input>";
			}			
		}
	
		
		if(mechInfo && lineCounter == 0){
			content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_mech+":</div>";
			content+="<select class='mech_select'>";
			content+="<option value='-1'></option>";
			$dataClasses.forEach(function(classInfo){
				if(classInfo && classInfo.name){
					content+="<option "+(classInfo.id == mechInfo.id ? "selected" : "")+" value='"+classInfo.id+"'>"+classInfo.name+"</option>";
				}
			});	
			content+="</select>";		
		}
		
		if(targetMechInfo && lineCounter == 0){
			content+="<div class='command_label '>"+EDITORSTRINGS.TEXT.label_target_mech+":</div>";
			content+="<select class='target_mech_select'>";
			content+="<option value='-1'></option>";
			$dataClasses.forEach(function(classInfo){
				if(classInfo && classInfo.name){
					content+="<option "+(classInfo.id == targetMechInfo.id ? "selected" : "")+" value='"+classInfo.id+"'>"+classInfo.name+"</option>";
				}
			});	
			content+="</select>";		
		}
		
		content+="</div>";
		content+="<input class='param_value quote_text' value=\""+(quote.text.replace(/\"/g, '&quot;') || "")+"\"></input>";
		
		
		
		content+="</div>";
		
		lineCounter++;
	});
	
	
	content+="<div class='line_controls'>";
	
	content+="<img class='add_line' src='"+_this._svgPath+"add-line.svg'>";
	
	content+="</div>";
	content+="</div>";
	
	return content;
}

SRWEditor.prototype.getUnitDef = function(unitId, hook){
	var _this = this;
	var currentTextInfo;
	var currentTypeInfo = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType];

	if(currentTypeInfo){	
		if(_this._currentBattleTextType == "stage"){						
			var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextStage].data;	
			if(currentStageTextInfo){
				if(!currentStageTextInfo[_this._currentBattleTextActorType]){
					currentStageTextInfo[_this._currentBattleTextActorType] = {};
				}
				currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
			}
			
			
		} else if(_this._currentBattleTextType == "event"){				
			var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextEvent].data;	
			if(currentStageTextInfo){
				if(!currentStageTextInfo[_this._currentBattleTextActorType]){
					currentStageTextInfo[_this._currentBattleTextActorType] = {};
				}
				currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
			}			
		} else {			
			currentTextInfo = currentTypeInfo[_this._currentBattleTextActorType];			
		}
	}
	
	if(!currentTextInfo[unitId]){
		currentTextInfo[unitId] = {};
	}
	
	if(!currentTextInfo[unitId][hook]){
		currentTextInfo[unitId][hook] = {};
	}	
	
	currentTextInfo = currentTextInfo[unitId][hook];	
	
	if(hook != "attacks"){
		if(!currentTextInfo){
			currentTextInfo = {
				default: [],
				actor: [],
				enemy: [],
				mech: [],
				target_mech: []
			}
		}
		
		if(!currentTextInfo.default){
			currentTextInfo.default = [];
		}
		if(!currentTextInfo.mech){
			currentTextInfo.mech = [];
		}
		if(!currentTextInfo.target_mech){
			currentTextInfo.target_mech = [];
		}
		if(!currentTextInfo.actor){
			currentTextInfo.actor = [];
		}
		if(!currentTextInfo.enemy){
			currentTextInfo.enemy = [];
		}
	}
	return currentTextInfo;
}

SRWEditor.prototype.createUnitSelect = function(selected, type, noEmpty, cssClass){
	var unitSet;
	if(type == "actor" || (!type && this._currentBattleTextActorType == "actor")){
		unitSet = $dataActors;
	} else {
		unitSet = $dataEnemies;
	}
	var result = "";
	var cssClass = cssClass || "unit_select";
	result+="<select class='"+cssClass+"'>";
	if(!noEmpty){
		result+="<option value='-1'></option>";
	}
	
	for(var i = 0; i < unitSet.length; i++){
		var def = unitSet[i];
		if(def && def.name){
			result+="<option value='"+i+"'  "+(i == selected ? "selected" : "")+">"+def.name+"</option>";
		}		
	}
	result+="</select>";
	return result;
}

SRWEditor.prototype.showEnvironmentEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	content+="<div id='attack_editor'>";
	content+="<div class='edit_controls'>";
	
	content+="</div>";
	content+="<div class='preview'>";
	content+="<div class='preview_window_container'>";
	
	
	
	content+="<div class='preview_window'>";
	content+="</div>";
	
	
	
	content+="</div>";	
	
	content+="<div class='preview_extra_controls'>";
	
	content+="<div class='extra_control'>";
	content+="<button id='reset_view' >Reset</button>";	
	content+="</div>";
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Show textbox</div>";
	content+="<input id='hide_textbox' checked type='checkbox'></input>";	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	
	containerNode.querySelector("#reset_view").addEventListener("click", function(){
		_this.showEnvironmentEditorControls();
	});
	
	containerNode.querySelector("#hide_textbox").addEventListener("click", function(){
		$battleSceneManager.toggleTextBox(this.checked);
	});
	
	
	
	this.prepareBattleScenePreview();
	this._environmentBuilder = $battleSceneManager.getEnvironmentBuilder();
	//$battleSceneManager.showEnvironmentScene();
		
	this.showEnvironmentEditorControls();
}


SRWEditor.prototype.showEnvironmentEditorControls = function(){
	var _this = this;
	_this._environmentBuilder.isLoaded().then(function(){
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		$battleSceneManager.showEnvironmentScene();	
		
		content+="<div class='selection_controls'>";
		content+="<select class='definition_select'>";
		var definitions = _this._environmentBuilder.getDefinitions();
		Object.keys(definitions).forEach(function(id){
			content+="<option "+(_this._currentEnvironmentDefinition == id ? "selected" : "")+" value='"+id+"'>"+id+" - "+definitions[id].name+"</option>";
		});
		if(!definitions[_this._currentEnvironmentDefinition]){
			_this._currentEnvironmentDefinition = _this._environmentBuilder.newDef("Environment");
		}
		content+="</select>";
		content+="<div class='selection_control_buttons'>";
		content+="<button id='new_def'>"+EDITORSTRINGS.GENERAL.label_new+"</button>";
		content+="<button id='copy_def'>"+EDITORSTRINGS.GENERAL.label_copy+"</button>";
		content+="<button id='delete_def'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";
		content+="<button id='export_def'>"+EDITORSTRINGS.GENERAL.label_export+"</button>";
		content+="<button id='import_def'>"+EDITORSTRINGS.GENERAL.label_import+"</button>";

		content+="</div>";
		content+="</div>";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>"+EDITORSTRINGS.GENERAL.label_save+"</button>";
		content+="<div class='section_label'>"+EDITORSTRINGS.GENERAL.label_info+"</div>";
		content+="<div class='section_content'>";
		content+=""+EDITORSTRINGS.GENERAL.label_name+"<input id='def_name' value='"+definitions[_this._currentEnvironmentDefinition].name+"'></input>";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>"+EDITORSTRINGS.BG.label_layers+"</div>";
		content+="<div id='timeline_section' class='section_content'>";
		
		content+="<button id='new_bg'>"+EDITORSTRINGS.GENERAL.label_new+"</button>";
		
		
		content+="<div class='commands_scroll'>";
		
		var bgs = definitions[_this._currentEnvironmentDefinition].data.bgs;
		bgs = bgs.sort(function(a, b){return a.zoffset - b.zoffset});
		bgs.forEach(function(bg){
			content+="<div data-bgid='"+bg.id+"' class='bg_block tick_block'>";
			content+="<div class='bg_controls' data-bgid='"+bg.id+"'>";
			content+="<button class='bg_delete_button'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";	
			
			content+="<div class='bg_label label_visible'>"+EDITORSTRINGS.BG.label_visible+":</div> <input type='checkbox' data-dataid='hidden' class='param_value' "+(!bg.hidden ? "checked" : "")+"></input>";
			content+="</div>";
			content+="<div data-bgid='"+bg.id+"' class='cmd_block cmd_block_outer'>";
			content+="<div class='param_values'>";	
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_path+":</div> <input data-dataid='path' class='param_value' value='"+(bg.path || "")+"'></input>";
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_fixed+":</div> <input type='checkbox' data-dataid='isfixed' class='param_value' "+(bg.isfixed ? "checked" : "")+"></input>";
			content+="</div>";
			content+="<div class='param_values'>";			
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_width+":</div> <input data-dataid='width' class='param_value' value='"+(bg.width || 0)+"'></input>";
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_height+": </div><input data-dataid='height' class='param_value' value='"+(bg.height || 0)+"'></input>";
			content+="</div>";
			content+="<div class='param_values'>";
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_y_offset+": </div><input data-dataid='yoffset' class='param_value' value='"+(bg.yoffset || 0)+"'></input>";
			content+="<div class='bg_label'>"+EDITORSTRINGS.BG.label_z_offset+": </div><input data-dataid='zoffset' class='param_value' value='"+(bg.zoffset || 0)+"'></input>";
			content+="</div>";
			content+="</div>";
			content+="</div>";
		});
		
		content+="</div>";
		content+="</div>";
		
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector(".definition_select").addEventListener("change", function(){
			_this._currentEnvironmentDefinition = this.value;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._environmentBuilder.save();
			_this._modified = false;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#new_def").addEventListener("click", function(){
			var name = prompt(EDITORSTRINGS.BG.prompt_name) || "New Animation";
			var newId = _this._environmentBuilder.newDef(name);
			_this._currentEnvironmentDefinition = newId;
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		containerNode.querySelector("#copy_def").addEventListener("click", function(){
			var newId = _this._environmentBuilder.copyDef(_this._currentEnvironmentDefinition);
			_this._currentEnvironmentDefinition = newId;
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		containerNode.querySelector("#delete_def").addEventListener("click", function(){
			if(confirm(EDITORSTRINGS.BG.confirm_delete)){
				_this._environmentBuilder.deleteDef(_this._currentEnvironmentDefinition);
				_this._currentEnvironmentDefinition = 0;
				_this._modified = true;
				_this.showEnvironmentEditorControls();
			}			
		});
		
		containerNode.querySelector("#export_def").addEventListener("click", function(){
			_this._environmentBuilder.exportDef(_this._currentEnvironmentDefinition);		
		});
		
		containerNode.querySelector("#import_def").addEventListener("click", async function(){
			let newId = await _this._environmentBuilder.importDef(_this._currentEnvironmentDefinition);		
			if(newId != -1){
				_this._currentEnvironmentDefinition = newId;
				_this._modified = false;
				_this.showEnvironmentEditorControls();
			}
		});
		
		containerNode.querySelector("#def_name").addEventListener("blur", function(){
			_this._environmentBuilder.updateName(_this._currentEnvironmentDefinition, this.value);
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#new_bg").addEventListener("click", function(){			
			_this._environmentBuilder.newBg(_this._currentEnvironmentDefinition);
			_this._modified = true;
			_this.showEnvironmentEditorControls();					
		});
		
		var inputs = containerNode.querySelectorAll(".bg_delete_button");
		inputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var bg = this.parentNode.getAttribute("data-bgid");
				var c = confirm(EDITORSTRINGS.BG.confirm_delete_layer);
				if(c){
					_this._environmentBuilder.deleteBg(_this._currentEnvironmentDefinition, bg);
					_this._modified = true;
					_this.showEnvironmentEditorControls();
				}			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".param_value");
		inputs.forEach(function(tickInput){
			tickInput.addEventListener("change", function(){
				var bg = this.closest(".bg_block").getAttribute("data-bgid");
				var dataId = this.getAttribute("data-dataid");
				var value;
				if(dataId == "isfixed"){
					value = this.checked;
				} else if(dataId == "hidden"){
					value = !this.checked;
				} else {
					value = this.value;
				}
				_this._environmentBuilder.updateBg(_this._currentEnvironmentDefinition, bg, dataId, value);
				_this._modified = true;
				_this.showEnvironmentEditorControls();	
				
			});
		});
			
		_this.registerUnloadListener();	
	});	
}

SRWEditor.prototype.registerUnloadListener = function(){
	var _this = this;
	if(!_this._unloadListener){
		_this._unloadListener = window.addEventListener("beforeunload", function(event){
			if(_this._modified){
				event.returnValue = "You have unsaved changes, exit anyway?";
			}
		});		
	}
}

SRWEditor.prototype.applyPreferences = function(){
	var _this = this;
	if(_this._preferences){
		Object.keys(_this._preferences).forEach(function(id){
			var elem = document.getElementById(id);
			if(elem){
				elem.value = _this._preferences[id];
			}		
		});
		if(_this._preferences.actor_select != null){
			_this._currentActor = _this._preferences.actor_select;
		}
		
		if(_this._preferences.actor_twin_select != null){
			_this._currentActorTwin = _this._preferences.actor_twin_select;
		}
		
		if(_this._preferences.quote_set != null){
			_this._currentQuoteSet = _this._preferences.quote_set;
		}
	
		if(_this._preferences.environment_select != null){
			_this._currentEnvironmentDefinition = _this._preferences.environment_select;
		}
	
		if(_this._preferences.actor_mech_select != null){
			_this._currentActorMech = _this._preferences.actor_mech_select;
		}
		
		if(_this._preferences.actor_twin_mech_select != null){
			_this._currentActorTwinMech = _this._preferences.actor_twin_mech_select;
		}

		if(_this._preferences.enemy_select != null){
			_this._currentEnemy = _this._preferences.enemy_select;
		}
	
		if(_this._preferences.enemy_mech_select != null){
			_this._currentEnemyMech = _this._preferences.enemy_mech_select;
		}
		
		if(_this._preferences.enemy_twin_select != null){
			_this._currentEnemyTwin = _this._preferences.enemy_twin_select;
		}
	
		if(_this._preferences.enemy_twin_mech_select != null){
			_this._currentEnemyTwinMech = _this._preferences.enemy_twin_mech_select;
		}
	}
}

SRWEditor.prototype.showAllyPilotEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	new AllyPilotUI(containerNode, this).show();
}

SRWEditor.prototype.showEnemyPilotEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	new EnemyPilotUI(containerNode, this).show();
}

SRWEditor.prototype.showMechEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	new MechUI(containerNode, this).show();
}

SRWEditor.prototype.showWeaponEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	new WeaponUI(containerNode, this).show();
}

SRWEditor.prototype.showPatternEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	new PatternUI(containerNode, this).show();
}

SRWEditor.prototype.showAttackEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	content+="<div id='attack_editor'>";
	content+="<div class='edit_controls'>";
	content+="<div class='timeline'>";
	content+="</div>";
	content+="<div class='edit_panel'>";
	content+="</div>";
	content+="</div>";
	content+="<div class='preview'>";
	
	content+="<div class='fps_counter'>";
	content+="0 fps";
	content+="</div>";
	
	content+="<div class='tick_counter'>";
	content+="tick 0";
	content+="</div>";
	
	content+="<div class='camera_info'>";
	content+="<div class='title'>";
	content+=EDITORSTRINGS.ATTACKS.label_helper;
	content+="<input id='helper_target' value='Camera'></input>";
	content+="<img id='refresh_camera' src='"+_this._svgPath+"clockwise-rotation.svg'>";
	
	content+="<img id='hide_camera_info' src='"+_this._svgPath+"close-line.svg'>";
	content+="</div>";
	content+="<div id='camera_info_content'>";

	content+="</div>";
	content+="</div>";
	
	content+="<div class='preview_window_container'>";
	content+="<div class='preview_window'>";
	content+="</div>";
	content+="</div>";
	content+="<div class='preview_controls'>";
	content+="<img id='play_button' src='"+_this._svgPath+"play-button.svg'>";
	content+="<img id='pause_button' src='"+_this._svgPath+"pause-button.svg'>";
	
	content+="<img id='stop_button' src='"+_this._svgPath+"stop-sign.svg'>";
	content+="</div>";
	
	content+="<div class='preview_extra_controls_flex'>";
	content+="<div class='preview_extra_controls'>";
	
	content+="<div class='extra_control playback'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_play_until+"</div>";
	content+="<input id='inp_play_until'></input>";	
	content+="<img id='advance' src='"+_this._svgPath+"play-mini-fill.svg'>";
	content+="<img id='fast_forward' src='"+_this._svgPath+"speed-fill.svg'>";
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_play+"</div>";
	content+="<input id='chk_play_bgm' checked type='checkbox'></input>";	
	content+="</div>";
	
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_enemy_side+"</div>";
	content+="<input id='chk_enemy_side' type='checkbox'></input>";	
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_hits+"</div>";
	content+="<input id='chk_hits' checked type='checkbox'></input>";	
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_destroys+"</div>";
	content+="<input id='chk_destroys' type='checkbox'></input>";	
	content+="</div>";	
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_show_barrier+"</div>";
	content+="<select id='barriers_select'>";
	content+="<option  value='0'>"+EDITORSTRINGS.GENERAL.label_no+"</option>";
	content+="<option  value='1'>"+EDITORSTRINGS.GENERAL.label_yes+"</option>";
	content+="<option  value='2'>"+EDITORSTRINGS.ATTACKS.label_break+"</option>";
	
	content+="</select>";
	//content+="<input id='chk_barriers' type='checkbox'></input>";	
	content+="</div>";	
	
	content+="</div>";
	
	content+="<div class='preview_extra_controls'>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_attack+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_attack+"</div>";
	content+="<select class='has_preference' id='quote_set'>";
	$dataWeapons.forEach(function(weapon){
		if(weapon && weapon.name){
			content+="<option value='"+weapon.id+"'>"+weapon.name+"</option>"
		}
	});
	content+="</select>"

	content+="</div>";
	
	
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_environment+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_environment+"</div>";
	content+="<select class='has_preference' id='environment_select'>";
	
	content+="</select>"

	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_actor+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_actor+"</div>";
	content+="<select class='has_preference' id='actor_select'>";
	for(var i = 1; i < $dataActors.length; i++){
		if($dataActors[i].name){
			var id = $dataActors[i].id;
			content+="<option "+(id == _this._currentActor ? "selected" : "")+" value='"+id+"'>"+$dataActors[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_actor_mech+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_actor_mech+"</div>";
	content+="<select class='has_preference' id='actor_mech_select'>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentActorMech ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_actor_twin+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_actor_twin+"</div>";
	content+="<select class='has_preference' id='actor_twin_select'>";
	content+="<option "+(_this._currentActorTwin == -1 ? "selected" : "")+" value='-1'>None</option>";
	for(var i = 1; i < $dataActors.length; i++){
		if($dataActors[i].name){
			var id = $dataActors[i].id;
			content+="<option "+(id == _this._currentActorTwin ? "selected" : "")+" value='"+id+"'>"+$dataActors[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_actor_twin_mech+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_actor_twin_mech+"</div>";
	content+="<select class='has_preference' id='actor_twin_mech_select'>";
	content+="<option "+(_this._currentActorTwinMech == -1 ? "selected" : "")+" value='-1'>None</option>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentActorTwin ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_enemy+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_enemy+"</div>";
	content+="<select class='has_preference' id='enemy_select'>";
	for(var i = 1; i < $dataEnemies.length; i++){
		if($dataEnemies[i].name){
			var id = $dataEnemies[i].id;
			content+="<option "+(id == _this._currentEnemy ? "selected" : "")+" value='"+id+"'>"+$dataEnemies[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_enemy_mech+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_enemy_mech+"</div>";
	content+="<select class='has_preference' id='enemy_mech_select'>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentEnemyMech ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_enemy_twin+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_enemy_twin+"</div>";
	content+="<select class='has_preference' id='enemy_twin_select'>";
	content+="<option "+(_this._currentEnemyTwin == -1 ? "selected" : "")+" value='-1'>None</option>";
	for(var i = 1; i < $dataEnemies.length; i++){
		if($dataEnemies[i].name){
			var id = $dataEnemies[i].id;
			content+="<option "+(id == _this._currentEnemyTwin ? "selected" : "")+" value='"+id+"'>"+$dataEnemies[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div title='"+EDITORSTRINGS.ATTACKS.hint_enemy_twin_mech+"' class='extra_control'>";
	content+="<div class='editor_label'>"+EDITORSTRINGS.ATTACKS.label_enemy_twin_mech+"</div>";
	content+="<select class='has_preference' id='enemy_twin_mech_select'>";
	content+="<option "+(_this._currentEnemyTwinMech == -1 ? "selected" : "")+" value='-1'>None</option>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentEnemyTwinMech ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	
	_this.applyPreferences();
	
	
	this.prepareBattleScenePreview();
	
	//this._animationBuilder = $battleSceneManager.getAnimationBuilder();
	//this._environmentBuilder = $battleSceneManager.getEnvironmentBuilder()
	
	if(_this._currentEnvironmentDefinition == null){
		_this._currentEnvironmentDefinition = id;
	}
	
	_this._environmentBuilder.isLoaded().then(function(){
		var content = "";
		var defs = _this._environmentBuilder.getDefinitions();	
		Object.keys(defs).forEach(function(id){					
			content+="<option value='"+id+"'>"+defs[id].name+"</option>";		
		});		
		containerNode.querySelector("#environment_select").innerHTML = content;
		_this.applyPreferences();
	});
	
	
	
	this.showAttackEditorControls();
	
	document.querySelector("#actor_select").addEventListener("change", function(){
		_this._currentActor = this.value;
	});
	
	document.querySelector("#actor_twin_select").addEventListener("change", function(){
		_this._currentActorTwin = this.value;
	});
	
	document.querySelector("#quote_set").addEventListener("change", function(){
		_this._currentQuoteSet = this.value;
	});	
	
	document.querySelector("#environment_select").addEventListener("change", function(){
		_this._currentEnvironmentDefinition = this.value;
	});	
	
	
	document.querySelector("#actor_mech_select").addEventListener("change", function(){
		_this._currentActorMech = this.value;
	});
	
	document.querySelector("#actor_twin_mech_select").addEventListener("change", function(){
		_this._currentActorTwinMech = this.value;
	});
	
	document.querySelector("#enemy_select").addEventListener("change", function(){
		_this._currentEnemy = this.value;
	});
	
	document.querySelector("#enemy_twin_select").addEventListener("change", function(){
		_this._currentEnemyTwin = this.value;
	});
	
	document.querySelector("#enemy_mech_select").addEventListener("change", function(){
		_this._currentEnemyMech = this.value;
	});
	
	document.querySelector("#enemy_twin_mech_select").addEventListener("change", function(){
		_this._currentEnemyTwinMech = this.value;
	});

	document.querySelector("#play_button").addEventListener("click", function(){
		if($battleSceneManager.isPaused()){
			$battleSceneManager.startAnimations();
		} else {
			$battleSceneManager.resetMaxAnimationTick();
			_this.playBattleScene();
		}		
	});
	
	document.querySelector("#pause_button").addEventListener("click", function(){
		if($battleSceneManager.isPaused()){
			$battleSceneManager.startAnimations();
		} else {
			$battleSceneManager.pauseAnimations();
		}
		
	});	
	
	document.querySelector("#stop_button").addEventListener("click", function(){
		$battleSceneManager.endScene(true);
	});
	
	document.querySelector("#chk_hits").addEventListener("change", function(){
		_this._previewAttackHits = this.checked;
	});
	
	document.querySelector("#chk_destroys").addEventListener("change", function(){
		_this._previewAttackDestroys = this.checked;
	});
	
	document.querySelector("#barriers_select").addEventListener("change", function(){
		_this._previewShowsBarriers = this.value * 1;
	});	
	
	document.querySelector("#chk_enemy_side").addEventListener("change", function(){
		_this._enemySideAttack = this.checked;
	});
	
	document.querySelector("#chk_play_bgm").addEventListener("change", function(){
		_this._playBGM = this.checked;
	});
	
	document.querySelector("#inp_play_until").addEventListener("change", function(){
		let value = this.value * 1;
		if(!isNaN(value)){
			_this._playUntil = value;
		} else {
			_this._playUntil = -1;
		}
		$battleSceneManager.setPlayUntil(_this._playUntil);
	});
	
	document.querySelector("#advance").addEventListener("click", function(){
		_this._fastForward = false;
		document.querySelector("#fast_forward").classList.remove("active");
		$battleSceneManager.advanceTick();
	});
	
	document.querySelector("#fast_forward").addEventListener("click", function(){
		_this._fastForward = !_this._fastForward;
		if(_this._fastForward){
			this.classList.add("active");
		} else {
			this.classList.remove("active");
		}
	});
		
	var preferenceEntries = document.querySelectorAll(".has_preference")
	preferenceEntries.forEach(function(entry){
		entry.addEventListener("change", function(){
			_this._preferences[this.id] = this.value;
			_this.savePreferences();
		});
	});	
	
	document.querySelector("#refresh_camera").addEventListener("click", function(){
		_this.showCameraState();
	});
	
	document.querySelector("#helper_target").addEventListener("keyup", function(e){
		if(e.keyCode == 13){
			_this.showCameraState();
		}
	});
	
	document.querySelector("#hide_camera_info").addEventListener("click", function(){
		_this.clearCameraState();
	});
	_this.clearCameraState();
	/*if(_this._cameraInfoInterval){
		clearInterval(_this._cameraInfoInterval);
	}
	_this._cameraInfoContainer = document.querySelector("#camera_info_content");
	_this._cameraInfoInterval = setInterval(function(){
		_this.showAttackEditorControls();
	}, 100);*/
}

SRWEditor.prototype.clearCameraState = function(){
	var cameraInfoContainer = document.querySelector("#camera_info_content");
	if(cameraInfoContainer){
		cameraInfoContainer.innerHTML = "";
	}
}

SRWEditor.prototype.showCameraState = function(){
	var cameraInfoContainer = document.querySelector("#camera_info_content");
		
	if(cameraInfoContainer && $battleSceneManager){
		const name = document.querySelector("#helper_target").value;
		let targetObj = $battleSceneManager.getTargetObject(name);
		if(targetObj) {
			if(targetObj.parent_handle){
				targetObj = targetObj.parent_handle;
			}
			var content = "";
			var position = targetObj.position;
			if(targetObj.handle){				
				if(targetObj.parent){
					position = targetObj.offset;
				} else {
					position = targetObj.handle.position;
				}
			}
			content+="<div>"
			content+="<b>Position</b>"
			content+="</div>"
			content+="<div>"
			content+="x: <input data-type='position' data-prop='x' value='"+position.x.toFixed(3)+"'></input>";
			content+="</div>"
			content+="<div>"
			content+="y: <input data-type='position' data-prop='y' value='"+position.y.toFixed(3)+"'></input>";
			content+="</div>"
			content+="<div>"
			content+="z: <input data-type='position' data-prop='z' value='"+position.z.toFixed(3)+"'></input>";
			content+="</div>"
			
			var rotation = targetObj.rotation;
			if(targetObj.handle){
				if(targetObj.parent){
					rotation = targetObj.offsetRotation;
				} else {
					rotation = targetObj.handle.rotation;	
				}
				
			}
			content+="<div>"
			content+="<b>Rotation</b>"
			content+="</div>"
			content+="<div>"
			content+="x: <input data-type='rotation' data-prop='x' value='"+rotation.x.toFixed(3)+"'></input>";
			content+="</div>"
			content+="<div>"
			content+="y: <input data-type='rotation' data-prop='y' value='"+rotation.y.toFixed(3)+"'></input>";
			content+="</div>"
			content+="<div>"
			content+="z: <input data-type='rotation' data-prop='z' value='"+rotation.z.toFixed(3)+"'></input>";
			content+="</div>"
			
			cameraInfoContainer.innerHTML = content;
			
			function handleCameraInput(input){
				var type = input.getAttribute("data-type");
				var prop = input.getAttribute("data-prop");
				var value = input.value;
				if(!isNaN(value)){					
					if(targetObj.handle){					
						if(type == "rotation"){
							var newVector;
							if(targetObj.parent){
								var scale = new BABYLON.Vector3(0, 0, 0);
								var rotation = new BABYLON.Quaternion();
								var position = new BABYLON.Vector3(0,0,0);
								
								var tempWorldMatrix = targetObj.parent.getWorldMatrix();
								tempWorldMatrix.decompose(scale, rotation, position);
								
								rotation = rotation.toEulerAngles();
								
								targetObj.offsetRotation[prop] = value * 1;
								let offsetVector = new BABYLON.Vector3(targetObj.offsetRotation.x * 1, targetObj.offsetRotation.y * 1, targetObj.offsetRotation.z * 1);
								
								newVector = new BABYLON.Vector3(
									rotation.x + offsetVector.x,
									rotation.y + offsetVector.y,
									rotation.z + offsetVector.z,
								);
							} else {
								newVector = new BABYLON.Vector3().copyFrom(targetObj.handle[type]);
								newVector[prop] = value * 1;
							}
							
							targetObj.handle.setRotation(
								newVector.x, 
								newVector.y, 
								newVector.z
							);
						} else {
							if(targetObj.parent){
								var scale = new BABYLON.Vector3(0, 0, 0);
								var rotation = new BABYLON.Quaternion();
								var position = new BABYLON.Vector3(0,0,0);
								
								var tempWorldMatrix = targetObj.parent.getWorldMatrix();
								tempWorldMatrix.decompose(scale, rotation, position);
								
								rotation = rotation.toEulerAngles();
								
								targetObj.offset[prop] = value * 1;
								let offsetVector = new BABYLON.Vector3(targetObj.offset.x * 1, targetObj.offset.y * 1, targetObj.offset.z * 1);
								
								newVector = new BABYLON.Vector3(
									position.x + offsetVector.x,
									position.y + offsetVector.y,
									position.z + offsetVector.z,
								);
							} else {
								newVector = new BABYLON.Vector3().copyFrom(targetObj.handle[type]);
								newVector[prop] = value * 1;
							}
							
							targetObj.handle.setLocation(
								newVector.x, 
								newVector.y, 
								newVector.z
							);							
						}
						targetObj.context.update();
						targetObj.context.draw();
					} else {
						var newVector = new BABYLON.Vector3().copyFrom(targetObj[type]);
						newVector[prop] = value * 1;
						targetObj[type] = newVector;
					}					
				}
			}
			
			var inputs = cameraInfoContainer.querySelectorAll("input");
			inputs.forEach(function(input){
				input.addEventListener("blur", function(e){
					handleCameraInput(input);
				});
				input.addEventListener("keyup", function(e){
					if(e.keyCode == 13){
						handleCameraInput(input);
					}
				});
			});
		} else {
			cameraInfoContainer.innerHTML = EDITORSTRINGS.ATTACKS.label_missing_object.replace("[NAME]", name);
		}
	}
}

SRWEditor.prototype.showAttackEditorControls = function(){
	var _this = this;
	_this._animationBuilder.isLoaded().then(function(){
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		
		
		content+="<div class='selection_controls'>";
		content+="<select class='definition_select'>";
		var definitions = _this._animationBuilder.getDefinitions();
		Object.keys(definitions).forEach(function(id){
			content+="<option "+(_this._currentDefinition == id ? "selected" : "")+" value='"+id+"'>"+id+" - "+definitions[id].name+"</option>";
		});
		content+="</select>";
		content+="<div class='selection_control_buttons'>";
		content+="<button id='new_def'>"+EDITORSTRINGS.GENERAL.label_new+"</button>";
		content+="<button id='copy_def'>"+EDITORSTRINGS.GENERAL.label_copy+"</button>";
		content+="<button id='delete_def'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";
		content+="<button id='export_def'>"+EDITORSTRINGS.GENERAL.label_export+"</button>";
		content+="<button id='import_def'>"+EDITORSTRINGS.GENERAL.label_import+"</button>";		

		content+="</div>";
		content+="</div>";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>"+EDITORSTRINGS.GENERAL.label_save+"</button>";
		content+="<div class='section_label'>"+EDITORSTRINGS.GENERAL.label_info+"</div>";
		content+="<div class='section_content'>";
		content+=EDITORSTRINGS.GENERAL.label_name+"<input id='def_name' value='"+definitions[_this._currentDefinition].name+"'></input>";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>"+EDITORSTRINGS.GENERAL.label_commands+"</div>";
		content+="<div id='timeline_section' class='section_content'>";
		
		content+="<div class='command_tools'>";
		content+=EDITORSTRINGS.ATTACKS.label_sequence+"<select id='sequence_select'>";
		_this._sequenceTypes.forEach(function(sequenceInfo){
			content+="<option "+(_this._currentSequenceType == sequenceInfo.id ? "selected" : "")+" value='"+sequenceInfo.id+"'>"+sequenceInfo.name+"</option>";
		});
		content+="</select>";
		
		content+="<button id='new_tick'>"+EDITORSTRINGS.ATTACKS.label_new_tick+"</button>";
		
		if(_this._clipboardTick){
			content+="<button class='tick_paste_button'>"+EDITORSTRINGS.GENERAL.label_paste+"</button>";
		}
		
		content+="</div>";
		
		content+="<div class='commands_scroll'>";
	
		var commands = definitions[_this._currentDefinition].data;
		var sequence = commands[_this._currentSequenceType];
		if(!sequence){
			sequence = {};
		}
		
		Object.keys(sequence).forEach(function(tick){
			var tickCommands = sequence[tick];
			content+="<div data-tick='"+tick+"' class='tick_block'>";
			content+="<div data-tick='"+tick+"' class='tick_controls'>";
			content+="<input class='tick_input' value='"+tick+"'></input>";
			//content+="<button class='tick_button'>Update</button>";	
			content+="<button class='tick_delete_button'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";	
			content+="<select class='tick_send_select'>";	
			content+="<option value='-1'>"+EDITORSTRINGS.ATTACKS.label_send_to+"</option>";
			_this._sequenceTypes.forEach(function(sequenceInfo){
				if(sequenceInfo.id != _this._currentSequenceType){
					content+="<option data-name='"+sequenceInfo.name+"' value='"+sequenceInfo.id+"'>"+sequenceInfo.name+"</option>";
				}				
			});
			content+="</select>";	
			content+="<button class='tick_shift_button'>"+EDITORSTRINGS.ATTACKS.label_shift+"</button>";	
			content+="<button class='tick_copy_button'>"+EDITORSTRINGS.GENERAL.label_copy+"</button>";			
			
			content+="</div>"
			//content+="<button class='tick_play_button'>Play</button>";				
			content+="<div>"
			content+="<button class='tick_add_command'>"+EDITORSTRINGS.GENERAL.label_new+"</button>";		
			if(_this._clipboardCommand){
				content+="<button class='tick_paste_command'>"+EDITORSTRINGS.GENERAL.label_paste+"</button>";
			}		
						
			content+="</div>"	
			var ctr = 0;
			Object.keys(tickCommands).forEach(function(tick){
				var command = tickCommands[tick];
				content+="<div data-cmdid='"+command.type+"' data-cmdidx='"+(ctr++)+"' class='cmd_block cmd_block_outer'>";
				content+=_this.getCommandContent(command);
				content+="</div>";
			});
			content+="</div>";
		});
		
		content+="</div>";
		content+="</div>";
		
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector(".definition_select").addEventListener("change", function(){
			_this._currentDefinition = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#sequence_select").addEventListener("change", function(){
			_this._currentSequenceType = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._animationBuilder.save();
			_this._modified = false;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#new_def").addEventListener("click", function(){
			var name = prompt("Please enter a name") || "New Animation";
			var newId = _this._animationBuilder.newDef(name);
			_this._currentDefinition = newId;
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		containerNode.querySelector("#copy_def").addEventListener("click", function(){
			var newId = _this._animationBuilder.copyDef(_this._currentDefinition);
			_this._currentDefinition = newId;
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		containerNode.querySelector("#delete_def").addEventListener("click", function(){
			if(confirm("Delete the current definition?")){
				_this._animationBuilder.deleteDef(_this._currentDefinition);
				_this._currentDefinition = 0;
				_this._modified = true;
				_this.showAttackEditorControls();
			}			
		});
		
		containerNode.querySelector("#export_def").addEventListener("click", function(){
			_this._animationBuilder.exportDef(_this._currentDefinition);		
		});
		
		containerNode.querySelector("#import_def").addEventListener("click", async function(){
			let newId = await _this._animationBuilder.importDef(_this._currentDefinition);		
			if(newId != -1){
				_this._currentDefinition = newId;
				_this._modified = false;
				_this.showAttackEditorControls();
			}
		});
		
		containerNode.querySelector("#def_name").addEventListener("blur", function(){
			_this._animationBuilder.updateName(_this._currentDefinition, this.value);
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#new_tick").addEventListener("click", function(){
			var newTick = prompt("Please enter the new tick value") * 1;
			var isUsed = _this._animationBuilder.isUsedTick(_this._currentDefinition, _this._currentSequenceType, newTick);
			if(!isUsed){
				_this._animationBuilder.newTick(_this._currentDefinition, _this._currentSequenceType, newTick);
				_this._modified = true;
				_this.showAttackEditorControls();
			}			
		});		
		
		var tickInputs = containerNode.querySelectorAll(".tick_input");
		tickInputs.forEach(function(tickInput){
			var isProcessing = false;
			tickInput.addEventListener("change", function(){
				var originalTick = this.parentNode.getAttribute("data-tick");
				var newTick = this.value;
				if(!isProcessing && originalTick != newTick){
					isProcessing = true;
					var isUsed = _this._animationBuilder.isUsedTick(_this._currentDefinition, _this._currentSequenceType, newTick);
					var c = true;
					if(isUsed){
						var c = confirm(EDITORSTRINGS.ATTACKS.confirm_merge_tick);
					}
					if(c){
						_this._animationBuilder.updateTick(_this._currentDefinition, _this._currentSequenceType, originalTick, newTick);
						_this._modified = true;
						_this.showAttackEditorControls();
					}					
					isProcessing = false;
				}				
			});
		});		
		
		var tickInputs = containerNode.querySelectorAll(".tick_delete_button");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var tick = this.parentNode.querySelector(".tick_input").value;
				var c = confirm(EDITORSTRINGS.ATTACKS.confirm_delete);
				if(c){
					_this._animationBuilder.deleteTick(_this._currentDefinition, _this._currentSequenceType, tick);
					_this._modified = true;
					_this.showAttackEditorControls();
				}			
			});
		});	
		var tickSelects = containerNode.querySelectorAll(".tick_send_select");
		tickSelects.forEach(function(tickSelect){
			tickSelect.addEventListener("change", function(){
				const targetSequence = this.value;
				if(targetSequence != -1 && targetSequence != _this._currentSequenceType){
					var tick = this.parentNode.querySelector(".tick_input").value;
					//var c = confirm("Send the selected tick to the "+this.options[this.selectedIndex ].getAttribute("data-name")+" sequence? (Will merge with existing ticks)");
					//if(c){
						const tickCopy = _this._animationBuilder.getTickCopy(_this._currentDefinition, _this._currentSequenceType, tick);	
						_this._animationBuilder.mergeTickIntoSequence(_this._currentDefinition, targetSequence, tick, tickCopy);	
						_this._animationBuilder.deleteTick(_this._currentDefinition, _this._currentSequenceType, tick);
						_this.showAttackEditorControls();		
					//} else {
					//	this.value = -1;
					//}
				}							
			});
		});	
		
		
		var tickInputs = containerNode.querySelectorAll(".tick_shift_button");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var amount = (prompt(EDITORSTRINGS.ATTACKS.prompt_ticks_count) || 0) * 1;
				if(!isNaN(amount) && amount != 0){
					var tick = this.parentNode.querySelector(".tick_input").value;					
					try {
						_this._animationBuilder.shiftTicks(_this._currentDefinition, _this._currentSequenceType, tick, amount);
						_this._modified = true;
						_this.showAttackEditorControls();
					} catch(e){
						alert(e);
					}										
				}											
			});
		});	
		
		var tickInputs = containerNode.querySelectorAll(".tick_copy_button");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;					
				_this._clipboardTickDef = _this._animationBuilder.getTickCopy(_this._currentDefinition, _this._currentSequenceType, tick);			
				_this._clipboardTick = tick;
				_this.showAttackEditorControls();										
			});
		});	
		
		var tickInputs = containerNode.querySelectorAll(".tick_paste_button");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				if(_this._clipboardTickDef){
					if(!_this._animationBuilder.isUsedTick(_this._currentDefinition, _this._currentSequenceType, _this._clipboardTick)){
						_this._animationBuilder.pasteTick(_this._currentDefinition, _this._currentSequenceType, _this._clipboardTick, _this._clipboardTickDef);				
						_this._modified = true;
						_this.showAttackEditorControls();
					} else {
						alert(EDITORSTRINGS.ATTACKS.alert_tick_in_use.replace("[TICK]", _this._clipboardTick));
					}						
				}												
			});
		});	
		
		var tickInputs = containerNode.querySelectorAll(".tick_add_command");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){		
				var tick = this.parentNode.closest(".tick_block").querySelector(".tick_input").value;	
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.addInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type);
				} else {
					_this._animationBuilder.addCommand(_this._currentDefinition, _this._currentSequenceType, tick);					
				}				
				_this._modified = true;
				_this.showAttackEditorControls();	
			});
		});	

		var tickInputs = containerNode.querySelectorAll(".tick_paste_command");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){		
				if(_this._clipboardCommand){
					var tick = this.parentNode.closest(".tick_block").querySelector(".tick_input").value;	
					var isCmdParam = this.closest(".inner_commands") != null;
					if(isCmdParam){
						var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
						var type = this.closest(".command_param").getAttribute("data-param");
						_this._animationBuilder.addInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, _this._clipboardCommand);
					} else {
						_this._animationBuilder.addCommand(_this._currentDefinition, _this._currentSequenceType, tick, _this._clipboardCommand);					
					}				
					_this._modified = true;
					_this.showAttackEditorControls();	
				}				
			});
		});			

		var inputs = containerNode.querySelectorAll(".delete_command");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.deleteInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx);
				} else {
					_this._animationBuilder.deleteCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});

		var inputs = containerNode.querySelectorAll(".copy_command");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._clipboardCommand = _this._animationBuilder.getInnerCommandCopy(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx);
				} else {
					_this._clipboardCommand = _this._animationBuilder.getCommandCopy(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx);
				}
				
				_this.showAttackEditorControls();							
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".command_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.changeInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, this.value);
				} else {
					_this._animationBuilder.changeCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, this.value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".target_input");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.changeInnerCommandTarget(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, this.value);
				} else {
					_this._animationBuilder.changeCommandTarget(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, this.value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param input");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block_outer").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				var param = this.closest(".command_param").getAttribute("data-param");
				if(isCmdParam){
					var value = _this.processParamInput(this);
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param_outer").getAttribute("data-param");
					_this._animationBuilder.changeInnerParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, param, value);
				} else {
					var value = _this.processParamInput(this);
					_this._animationBuilder.changeParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, param, value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param .copy_from_cam");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){		
				var referenceNode = this.closest(".param_values");
				var prop = this.getAttribute("data-prop");
				const name = document.querySelector("#helper_target").value;
				let targetObj = $battleSceneManager.getTargetObject(name);
				if(targetObj){
					var data = targetObj[prop]; 
				
					if(targetObj.handle){
						if(targetObj.parent){
							if(prop == "position"){
								data = targetObj.offset;
							} else if(prop == "rotation"){
								data = targetObj.offsetRotation;
							}	
						} else {
							if(prop == "position"){
								data = targetObj.handle.position;
							} else if(prop == "rotation"){
								data = targetObj.handle.rotation;
							}	
						}												
					}
					
			
					var xInput = referenceNode.querySelector(".param_value[data-dataid='x']");	
					xInput.value = ((data.x || data._x || 0).toFixed(3)) * $battleSceneManager.getAnimationDirection();
					var event = new Event('change');
					xInput.dispatchEvent(event);
					
					var yInput = referenceNode.querySelector(".param_value[data-dataid='y']");	
					yInput.value = (data.y || data._y || 0).toFixed(3);
					var event = new Event('change');
					yInput.dispatchEvent(event);
					
					var zInput = referenceNode.querySelector(".param_value[data-dataid='z']");	
					zInput.value = (data.z || data._z || 0).toFixed(3);
					var event = new Event('change');
					zInput.dispatchEvent(event);
				}					
			});
		});
		
		
		var inputs = containerNode.querySelectorAll(".command_param .param_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block_outer").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				var param = this.closest(".command_param").getAttribute("data-param");
				if(isCmdParam){
					var value = _this.processParamInput(this);
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param_outer").getAttribute("data-param");
					_this._animationBuilder.changeInnerParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, param, value);
				} else {
					var value = _this.processParamInput(this);
					_this._animationBuilder.changeParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, param, value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".target_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var targetInput = this.closest(".command_target").querySelector(".target_input");
				targetInput.value = this.value;
				var event = new Event('change');
				targetInput.dispatchEvent(event);	
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param .position_select")
		inputs.forEach(function(input){
			input.addEventListener("change", function(){	
				var container = input.parentNode;
				var defaultPositions = $battleSceneManager.getDefaultPositions();
				var pos = defaultPositions[this.value];
				
				var xInput = container.querySelector("input[data-dataid='x']");				
				xInput.value = pos.x;
				container.querySelector("input[data-dataid='y']").value = pos.y;
				container.querySelector("input[data-dataid='z']").value = pos.z;				
				
				var event = new Event('change');
				xInput.dispatchEvent(event);	
			});
		});	
		
		var inputs = containerNode.querySelectorAll(".command_param .rotation_select")
		inputs.forEach(function(input){
			input.addEventListener("change", function(){	
				var container = input.parentNode;
				var defaultRotations = $battleSceneManager.getDefaultRotations();
				var pos = defaultRotations[this.value];
				
				var xInput = container.querySelector("input[data-dataid='x']");				
				xInput.value = pos.x;
				container.querySelector("input[data-dataid='y']").value = pos.y;
				container.querySelector("input[data-dataid='z']").value = pos.z;				
				
				var event = new Event('change');
				xInput.dispatchEvent(event);	
			});
		});	
	
		var inputs = containerNode.querySelectorAll(".tick_play_button")
		inputs.forEach(function(input){
			input.addEventListener("click", function(){	
				var tick = this.parentNode.querySelector(".tick_input").value;
				$battleSceneManager.setMaxAnimationTick(tick);
				_this.playBattleScene();
			});
		});
		
		var inputs = containerNode.querySelectorAll(".quote_selector_control")
		inputs.forEach(function(input){
			input.addEventListener("click", function(){	
				let targetSelector = this.parentNode.querySelector(".quote_selector");
				if(targetSelector.getAttribute("data-active") * 1){
					targetSelector.style.display = "none";
					targetSelector.setAttribute("data-active", 0);
				} else {
					targetSelector.setAttribute("data-active", 1);
					targetSelector.style.display = "block";
					let rect = this.getBoundingClientRect();
					targetSelector.style.top = rect.bottom + "px";
					targetSelector.style.left = rect.left + "px";
				}		
				let value = this.closest(".command_param").querySelector("input").value;	
				let result = "";
				
				let quoteSet = [];
				try {
					quoteSet = _this._battleTextBuilder.getDefinitions().default;
					if(_this._enemySideAttack){
						quoteSet = quoteSet.enemy[_this._currentEnemy];
					} else {
						quoteSet = quoteSet.actor[_this._currentActor];
					}
					quoteSet = quoteSet.attacks[_this._currentQuoteSet].default;
					
				} catch(e){
					
				}	
				
				try {
					if(quoteSet.length){
						for(let quote of quoteSet){
							let line = quote[0];
							result+="<div  data-quoteid='"+line.quoteId+"' class='entry "+(value == line.quoteId ? "selected" : "")+"' >";
							result+="<div class='display_name'>";
							let displayName;
							if(line.displayName){
								displayName = line.displayName;
							} else if(_this._enemySideAttack){
								displayName = $dataEnemies[_this._currentEnemy].name;
							} else {
								displayName = $dataActors[_this._currentActor].name;
							}
							result+=displayName;
							result+="</div>";
							result+="<div>";
							result+=line.text;
							result+="</div>";
							result+="</div>";
						}
					} else {
						result+=EDITORSTRINGS.GENERAL.hint_no_quote;
					}
				} catch(e){
					
				}
				targetSelector.innerHTML = result;
				
				var inputs = targetSelector.querySelectorAll(".quote_selector .entry")
				inputs.forEach(function(input){
					input.addEventListener("click", function(){		
						let selector = this.parentNode;
						selector.style.display = "none";
						selector.setAttribute("data-active", 0);
						
						let targetInput = this.closest(".command_param").querySelector("input");				
						targetInput.value = this.getAttribute("data-quoteid");
						var event = new Event('change');
						targetInput.dispatchEvent(event);	
					});
				});
				
			});
		});
		
		
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			var selectors = containerNode.querySelectorAll(".quote_selector")
			selectors.forEach(function(selector){
				selector.style.display = "none";
				selector.setAttribute("data-active", 0);
			});
		});
		
		_this.registerUnloadListener();	
		
		
		var inputs = containerNode.querySelectorAll(".move_command_button");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var direction = this.getAttribute("data-direction");
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.moveInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, direction);
				} else {
					_this._animationBuilder.moveCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, direction);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});
	});	
}

SRWEditor.prototype.processParamInput = function(input){
	var param = input.closest(".command_param").getAttribute("data-param");
	var paramHandlers = {
		position: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value*1;
			var y = container.querySelector("input[data-dataid='y']").value*1;
			var z = container.querySelector("input[data-dataid='z']").value*1;
			return {x: x, y: y, z: z};
		},
		startPosition: function(input){
			return this.position(input);
		},
		rotation: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value*1;
			var y = container.querySelector("input[data-dataid='y']").value*1;
			var z = container.querySelector("input[data-dataid='z']").value*1;
			return {x: x, y: y, z: z};
		},
		startRotation: function(input){
			return this.position(input);
		},
		duration: function(input){
			return input.value*1;
		},
		catmullRom: function(input){
			var container = input.closest(".command_param ");
			var pos1 = {};
			pos1.x = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='x']").value*1;
			pos1.y = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='y']").value*1;
			pos1.z = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='z']").value*1;
			
			var pos4 = {};
			pos4.x = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='x']").value*1;
			pos4.y = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='y']").value*1;
			pos4.z = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='z']").value*1;
			return {pos1: pos1, pos4: pos4};
		}
	};
	if(paramHandlers[param]){
		return paramHandlers[param](input);
	} else {
		return input.value;
	}
}

SRWEditor.prototype.getCommandDisplayInfo = function(command){
	var _this = this;
	
	if(_this._commandDisplayInfo[command]){
		return _this._commandDisplayInfo[command]
	} else {
		return {
			hasTarget: true,
			params: [],
			desc: ""
		};
	}
}

SRWEditor.prototype.getCommandContent = function(command, isInner){
	var _this = this;
	var result = "";
	var displayInfo = _this.getCommandDisplayInfo(command.type);
	
	result+="<div class='command_type command_row'>";
	result+="<div class='command_label' title='"+displayInfo.desc+"'>"+EDITORSTRINGS.ATTACKS.label_command+":</div>";
	result+=_this.getCommandSelect(command.type, isInner);
	result+="<button class='copy_command'>"+EDITORSTRINGS.GENERAL.label_copy+"</button>";
	result+="<button class='delete_command'>"+EDITORSTRINGS.GENERAL.label_delete+"</button>";	
	
	result+="<div class='move_command_buttons'>";
	result+="<div data-direction='up' class='move_command_button up'>";
	result+="<img src='"+_this._svgPath+"arrow-up-line.svg'>";
	result+="</div>";
	result+="<div data-direction='down' class='move_command_button down'>";
	result+="<img src='"+_this._svgPath+"arrow-down-line.svg'>";
	result+="</div>";
	result+="</div>";
	
	result+="</div>";
	
	if(displayInfo.hasTarget){	
		result+="<div class='command_target command_row'><div class='command_label'>"+EDITORSTRINGS.ATTACKS.label_target+": </div><input class='target_input' value='"+command.target+"'></input>"+_this.getTargetSelect(command.target, displayInfo.isLightCommand)+"</div>";
	
	}
	if(displayInfo.params.length){
		const aliases = displayInfo.aliases || {};
		result+="<div class='command_row'>";
		result+="<div class='params_label'>"+EDITORSTRINGS.ATTACKS.label_parameters+"</div>";
		var params = command.params;
		displayInfo.params.forEach(function(param){
			var value = params[param];
			result+="<div data-param='"+param+"' class='command_param "+(isInner ? "" : "command_param_outer")+"'>";
			result+="<div title='"+(_this._paramTooltips[param] || "")+"' class='param_label'>"+(aliases[param] || param)+": </div>";
			result+=_this.getParamContent(param, value, displayInfo);
			result+="</div>";
		});
		result+="</div>";
	}
	return result;
}

SRWEditor.prototype.getCommandSelect = function(command, isInner){
	var _this = this;
	var result = "";
	result+="<select class='command_select'>";
	Object.keys(_this._commandDisplayInfo).sort().forEach(function(type){
		if(!isInner || (type != "next_phase" && type != "dodge_pattern")){
			result+="<option "+(command == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
		}		
	});
	result+="</select>";
	return result;
}

SRWEditor.prototype.getTargetSelect = function(target, isLightCommand){
	var _this = this;
	var result = "";
	result+="<select class='target_select'>";
	result+="<option value=''></option>";
	let targets;
	if(isLightCommand){
		targets = _this._specialLights;
	} else {
		targets = _this._specialTargets;
	}
	targets.forEach(function(type){
		result+="<option "+(target == type.id ? "selected" : "")+" value='"+type.id+"'>"+type.name+"</option>";
	});
	result+="</select>";
	return result;
}

SRWEditor.prototype.getParamContent = function(param, value, displayInfo){
	var _this = this;
	var result = "";
	if(displayInfo.paramAlias && displayInfo.paramAlias[param]){
		param = displayInfo.paramAlias[param];
	}
	if(_this._paramDisplayHandlers[param]){
		result = _this._paramDisplayHandlers[param](value);
		if(!result){
			result = "<input value='"+(value || "")+"'></input>";
		}
	} else {
		result+="???";
	}
	return result;
}

SRWEditor.prototype.killAudioAfterScene = function(){
	var _this = this;
	if($gameSystem.isSubBattlePhase() == "after_battle"){
		AudioManager.stopBgm();
	} else {		
		setTimeout(function(){_this.killAudioAfterScene()}, 100);
	}	
}

SRWEditor.prototype.playBattleScene = function(){
	var _this = this;
	if($gameSystem.isSubBattlePhase() == "after_battle"){
		$battleSceneManager._UILayerManager.redraw();// ensure the UI is scaled to the preview window's size
		$gameSystem.setSubBattlePhase("halt");
		
		var weapon = {
			id: _this._currentQuoteSet || 1,
			name: "Test",
			type: "M",
			postMoveEnabled: 0,
			power: 0,
			minRange: 0,
			range:0,
			hitMod: 0,
			critMod: 0,
			totalAmmo: 0,
			currentAmmo: 0,
			ENCost: 50,
			willRequired: 0,
			terrain: {air: "C", land: "C", water: "C", space: "C"},
			effects: [],
			particleType: "", //missile, funnel, beam, gravity, physical or "".
			animId:_this._currentDefinition,
			isMap: 0, 
			mapId: -1,
			isCombination: 0,
			combinationWeapons: null,
			combinationType: null
		}			
		
		if(_this._currentQuoteSet){
			weapon.isAll = ($dataWeapons[_this._currentQuoteSet].meta.weaponIsAll || 0) * 1;
		}
		let songId = "";
		if(_this._playBGM){
			songId = $songManager.getActorSongInfo(_this._currentActor) || "Battle1";			
		}
		var demoConfig = {
			enemyFirst: _this._enemySideAttack, // if 0 the actor will move first, if 1 the enemy will move first. This also affects the supports. If 0, the actor support will be attacking otherwise defending. If 1, the enemy support will be attacking otherwise defending.
			songId: songId, // the id of the song that should be played during the battle scene
			actor: {
				id: _this._currentActor, // the id of the actor pilot
				mechId: _this._currentActorMech, // the id of the actor mech
				action: _this._enemySideAttack ? "defend" : "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the actor in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
			},
			/*actorSupport: { // ommit this section if there is no actor supporter
				id: 3, // the id of the actor pilot
				action: "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: 5, // the id of the attack the actor will use. Only used if the action is "attack".
				hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the actor in percent
				targetEndHP: 0, // the end HP of the target in percent
			},*/
			enemy: {
				id: _this._currentEnemy, // the id of the enemy pilot
				mechId: _this._currentEnemyMech, // the id of the enemy mech
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				action: _this._enemySideAttack ? "attack" : "defend", // the action the enemy will take: "attack", "defend", "evade". 
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the enemy in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
			},
			/*enemySupport: { // ommit this section if there is no enemy supporter
				id: 3, // the id of the enemy pilot
				action: "defend", // the action the enemy will take: "attack", "defend", "evade". 
				hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				weapon: -1, // the id of the attack the actor will use. Only used if the action is "attack".
				startHP: 100, // the start HP of the enemy in percent
				targetEndHP: 0, // the end HP of the target in percent
			}	*/		
		}
		
		if(_this._currentActorTwin != -1 && _this._currentActorTwinMech != -1){
			demoConfig.actorTwin = {
				id: _this._currentActorTwin, // the id of the actor pilot
				mechId: _this._currentActorTwinMech, // the id of the actor mech
				action: _this._enemySideAttack ? "defend" : "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the actor in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
				target: "twin"
			}
		}
		
		if(_this._currentEnemyTwin != -1 && _this._currentEnemyTwinMech != -1){
			demoConfig.enemyTwin = {
				id: _this._currentEnemyTwin, // the id of the enemy pilot
				mechId: _this._currentEnemyTwinMech, // the id of the enemy mech
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				action: _this._enemySideAttack ? "attack" : "defend", // the action the enemy will take: "attack", "defend", "evade". 
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the enemy in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
				target: "twin"
			}
		}
		
		$battleSceneManager.setDebugBarriers(_this._previewShowsBarriers);
		if(this._playUntil){
			$battleSceneManager.setPlayUntil(this._playUntil);
		}
		$battleSceneManager.setFastForward(this._fastForward);
		$gameMap._interpreter.playBattleScene(demoConfig);
		this.killAudioAfterScene();
	}
}

SRWEditor.prototype.isModified = function(){
	return this._modified;
}

SRWEditor.prototype.setModified = function(){
	this._modified = true;
}

SRWEditor.prototype.clearModified = function(){
	this._modified = false;
}

SRWEditor.prototype.generateDist = async function(){
	const fs = require('fs');
	let fse = require('fs-extra');
	let path = require('path');
	let base = path.dirname(process.mainModule.filename)+"\\";
	let distPath = base+'\\dist\\www\\';
	
	function initDir(path){
		// if folder doesn't exists create it
		if (!fs.existsSync(distPath+path)){
			fs.mkdirSync(distPath+path, { recursive: true });
		}
	}
	
	function copyDir(path){
		// if folder doesn't exists create it
		if (!fs.existsSync(distPath+path)){
			fs.mkdirSync(distPath+path, { recursive: true });
		}
		//copy directory content including subfolders
		fse.copySync(base+path, distPath+path); 
	}
	
	function listFiles(Directory, files) {
		fs.readdirSync(Directory).forEach(File => {
			const Absolute = Directory+"\\"+File;
			if (fs.statSync(Absolute).isDirectory()) return listFiles(Absolute, files);
			else return files.push(Absolute);
		});
	}
	
	
	fs.copyFileSync(base+'index.html', distPath+'index.html');
	
	copyDir('js');	
	fs.rmSync(distPath+"js/plugins/src", { recursive: true });
	
	copyDir('data');
	
	copyDir('effekseer');
	
	copyDir('fonts');
	
	copyDir('icon');
	
	copyDir('shader');
	
	copyDir('svg');
	
	copyDir('text_scripts');
	
	copyDir('UI');
	
	let whiteList = {};
	
	function append(resourcePath, resourceName, resourceType){
		if(resourceName){
			whiteList[resourcePath+resourceName+"."+resourceType] = true;
		}		
	}
	
	let files = [];
	listFiles("img\\animations\\spirits", files);
	
	for(let file of files){
		whiteList[file] = true;
	}
	
	append("img\\characters\\", "srpg_set", "png");
	append("img\\animations\\", "SRWAppear", "png");
	append("img\\animations\\", "Explosion1", "png");
	append("img\\animations\\", "SRWDisappear", "png");
	//database
	
	append("img\\titles1\\", $dataSystem.title1Name, "png");
	append("img\\titles2\\", $dataSystem.title2Name, "png");
	
	append("audio\\bgm\\", $dataSystem.gameoverMe.name, "ogg");
	
	append("audio\\bgm\\", $dataSystem.titleBgm.name, "ogg");
	
	//only the first 7 are used by the engine(Cursor -> Load)
	for(let i = 0; i < 7; i++){
		append("audio\\se\\", $dataSystem.sounds[i].name, "ogg");
	}
	
	/*
	for(let animation of $dataAnimations){
		if(animation){
			append("img\\animations\\", animation.animation1Name, "png");
			append("img\\animations\\", animation.animation2Name, "png");
		}
	}
	*/
	
	function loadAnimAssets(animId){
		let animation = $dataAnimations[animId];
		if(animation){
			append("img\\animations\\", animation.animation1Name, "png");
			append("img\\animations\\", animation.animation2Name, "png");
			if(animation.timings){
				for(let timing of animation.timings){
					if(timing.se){
						append("audio\\se\\", timing.se.name, "ogg");
					}
				}
			}
		}	
	}	
	
	for(let tileset of $dataTilesets){
		if(tileset){
			for(let name of tileset.tilesetNames){
				append("img\\tilesets\\", name, "png");
				append("img\\tilesets\\", name, "txt");
			}			
		}
	}
	
	for(let actor of $dataActors){
		if(actor){
			append("img\\faces\\", actor.faceName, "png");						
		}
	}
	
	for(let actor of $dataEnemies){
		if(actor){
			append("img\\faces\\", actor.meta.faceName, "png");						
		}
	}
	
	for(let mech of $dataClasses){
		if(mech){
			append("img\\basic_battle\\", mech.meta.mechBasicBattleSprite, "png");						
			let battleSceneFiles = [];	
			if(mech.meta.mechBattleSceneSprite){
				try {				
					listFiles("img\\SRWBattleScene\\"+mech.meta.mechBattleSceneSprite, battleSceneFiles);
					for(let file of battleSceneFiles){
						whiteList[file] = true;		
					}	
				} catch(e){
					
				}
			}
			
			append("img\\menu\\", mech.meta.mechMenuSprite, "png");	
			if(mech.meta.srpgOverworld){
				let OWInfo = mech.meta.srpgOverworld.split(",");
				append("img\\characters\\", OWInfo[0], "png");	
			}
						
			append("img\\animations\\", mech.meta.mechSpawnAnimName, "png");	
			append("audio\\se\\", mech.meta.mechSpawnAnimSoundEffect, "ogg");	
			
			append("img\\animations\\", mech.meta.mechDestroyAnimName, "png");	
			append("audio\\se\\", mech.meta.mechDestroyAnimSoundEffect, "ogg");			
		}
	}
	
	append("img\\basic_battle\\", "barrier", "png");	
	append("img\\basic_battle\\", "damage", "png");	
	append("img\\basic_battle\\", "destroyed", "png");
	
	for(let weapon of $dataWeapons){
		if(weapon && weapon.weaponMapId != null){
			let mapAttackInfo = $mapAttackManager.getDefinition(weapon.weaponMapId);
			if(mapAttackInfo && mapAttackInfo.animInfo){
				loadAnimAssets(mapAttackInfo.animInfo.animId);
			}
		}
	}		
	
	let spiritInfo = $spiritManager.getSpiritDefinitions();
	for(let spiritDef of spiritInfo){
		if(spiritDef && spiritDef.animInfo){
			append("audio\\se\\", spiritDef.animInfo.se, "ogg");	
			loadAnimAssets(spiritDef.animInfo.animId);
		}
	}
	
	for(let actorId in $SRWConfig.battleSongs.actorSongMapping){
		append("audio\\bgm\\", $SRWConfig.battleSongs.actorSongMapping[actorId], "ogg");	
	}
	
	for(let enemyId in $SRWConfig.battleSongs.enemySongMapping){
		append("audio\\bgm\\", $SRWConfig.battleSongs.enemySongMapping[enemyId], "ogg");	
	}
	
	let battleAnimBuilder = new BattleAnimationBuilder();
	await battleAnimBuilder.isLoaded();
	let animList = battleAnimBuilder.getDefinitions();
	for(let animId in animList){
		var animationList = battleAnimBuilder.buildAnimation(animId);
		Object.keys(animationList).forEach(function(animType){
			animationList[animType].forEach(function(batch){
				batch.forEach(function(animCommand){
					var target = animCommand.target;
					var params = animCommand.params;
					if(animCommand.type == "play_se"){						
						append("audio\\se\\", params.seId, "ogg");	
					}
					if(animCommand.type == "play_rmmv_anim"){						
						loadAnimAssets(params.animId);
					}						
				});
			});				
		});
	}
	
	let mvsFiles = [];
	listFiles("text_scripts", mvsFiles);
	for(let file of mvsFiles){
		if(file.match(/.*\.mvs$/)){			
			let scriptId = file.replace("text_scripts\\", "").replace(".mvs", "");
			let eventList = await DataManager.interpretTextScript(scriptId)						
			for(let command of eventList){
				if(command.code == 250){
					append("audio\\se\\", command.parameters[0].name, "ogg");	
				}
				if(command.code == 241){
					append("audio\\bgm\\", command.parameters[0].name, "ogg");	
				}	
				if(command.code == 356){
					let parts = command.parameters[0].split(" ");
					if(parts[0] == "setStageSong"){
						append("audio\\bgm\\", parts[1], "ogg");	
					}
					if(parts[0] == "setCloudScrollImage"){
						append("img\\parallaxes\\", parts[1], "png");	
					}	
										
				}
				if(command.code == 212){					
					loadAnimAssets(command.parameters[1]);
				}
			}		
		}
	}

	files = [];
	
	listFiles("img", files);
	listFiles("audio", files);
	
	for(let file of files){
		if(whiteList[file]){
			let filePathParts = (file).split("\\");
			filePathParts.pop();
			let filePath = filePathParts.join("\\")
			if (!fs.existsSync(distPath+filePath)){
				fs.mkdirSync(distPath+filePath, { recursive: true });
			}
			fs.copyFileSync(base+file, distPath+file);
		}
	}
	
	
	
	copyDir("img\\pictures");
	copyDir("img\\SRWBattlebacks");
	copyDir("img\\system");
	
	initDir("img\\SRWBattleScene");
	fs.copyFileSync(base+'\\img\\SRWBattleScene\\shadow.png', distPath+'\\img\\SRWBattleScene\\shadow.png');
	fs.copyFileSync(base+'\\img\\SRWBattleScene\\battleFade.png', distPath+'\\img\\SRWBattleScene\\battleFade.png');
	copyDir("img\\SRWBattleScene\\opacityTextures");
	
	initDir("audio\\me");
	initDir("audio\\bgs");
	initDir("audio\\se");
	
	fs.copyFileSync(base+'\\audio\\se\\SRWAppear.ogg', distPath+'\\audio\\se\\SRWAppear.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWAttack.ogg', distPath+'\\audio\\se\\SRWAttack.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWDisappear.ogg', distPath+'\\audio\\se\\SRWDisappear.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWDoubleImage.ogg', distPath+'\\audio\\se\\SRWDoubleImage.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWExplosion.ogg', distPath+'\\audio\\se\\SRWExplosion.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWFloat.ogg', distPath+'\\audio\\se\\SRWFloat.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWHit.ogg', distPath+'\\audio\\se\\SRWHit.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWHit_Barrier.ogg', distPath+'\\audio\\se\\SRWHit_Barrier.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWHit_Barrier_Break.ogg', distPath+'\\audio\\se\\SRWHit_Barrier_Break.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWHit_Crit.ogg', distPath+'\\audio\\se\\SRWHit_Crit.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWJamming.ogg', distPath+'\\audio\\se\\SRWJamming.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWLand.ogg', distPath+'\\audio\\se\\SRWLand.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWLevelUp.ogg', distPath+'\\audio\\se\\SRWLevelUp.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWMastery.ogg', distPath+'\\audio\\se\\SRWMastery.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWMiss.ogg', distPath+'\\audio\\se\\SRWMiss.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWParry.ogg', distPath+'\\audio\\se\\SRWParry.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWPowerUp.ogg', distPath+'\\audio\\se\\SRWPowerUp.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWShield.ogg', distPath+'\\audio\\se\\SRWShield.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWShootDown.ogg', distPath+'\\audio\\se\\SRWShootDown.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWSubmerge.ogg', distPath+'\\audio\\se\\SRWSubmerge.ogg');
	fs.copyFileSync(base+'\\audio\\se\\SRWTransform.ogg', distPath+'\\audio\\se\\SRWTransform.ogg');
	
	
	
	alert("Dist package created");
}

SRWEditor.prototype.generateAllyPilotOverview = function(){
	let dataProvider = new AllyPilotUI();
	dataProvider.loadData();
	let result = [];
	for(let i = 0; i < dataProvider._data.length; i++){
		dataProvider._currentId = i;
		const entry = dataProvider._data[i];
		if(entry && entry.name){
			result.push(entry.name)
			result.push("Terrain: "+dataProvider.getMetaValue("pilotTerrain"));
			let aceInfo = $pilotAbilityManager.getDefinitions()[dataProvider.getMetaValue("pilotAbilityAce")];
			if(aceInfo){
				result.push("Ace: "+aceInfo.name+" ("+aceInfo.desc+")");
			} else {
				result.push("Ace: None");
			}
			
			result.push("Tags: "+dataProvider.getMetaValue("pilotTags"));
			result.push("\nStats");
			const stats = ["SP", "Melee", "Ranged", "Skill", "Evade", "Hit"];
			for(const stat of stats){
				var value = dataProvider.getMetaValue("pilot"+stat+"Growth");
				var parts = value.split(",");
				var type = parts.length > 1 ? "curve" : "flat";
				result.push("\t"+stat+":"+(stat == "SP" ? "\t" : "")+"\t"+dataProvider.getMetaValue("pilotBase"+stat)+"\t ("+type+", "+value+")");
			}
			
			result.push("\nSpirits");
			for(let j = 1; j <= 6; j++){
				var value = dataProvider.getMetaValue("pilotSpirit"+j);
				var parts = value.split(",");
				var id = parts[0] || -1;
				var learnedAt = parts[1] || 0;
				var cost = parts[2] || 0;
				let def = $spiritManager.getSpiritDefinitions()[id];
				if(def){
					result.push("\t"+def.name+"\t cost: "+cost+"\t learned at: "+learnedAt);
				}			
				
			}
			
			result.push("\nAbilities");
			
			for(var idx = 0; idx < 200; idx++){
				var value = dataProvider.getMetaValue("pilotAbility"+idx);
				var parts = value.split(",");
				var id = parts[0] || -1;
				var abilityLevel = parts[1] || 0;
				var requiredLevel = parts[2] || 0;
				
				let def;
				try{
					def	= $pilotAbilityManager.getAbilityDef(id);
				} catch(e){
					
				}
				
				if(def){
					result.push("\t"+def.name+"\t level: "+abilityLevel+"\t learned at: "+requiredLevel);
				}	
			}
			result.push("================================\n");
		}
	}
	return result.join("\n");
}