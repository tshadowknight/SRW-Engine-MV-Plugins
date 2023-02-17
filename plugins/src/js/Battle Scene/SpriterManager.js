//Derived from the JS API for Spriter demo

SpriterManager.defCache = {};

export default function SpriterManager(){
	this._spriter_data = null;
	this._spriter_pose = null;
	this._spriter_pose_next = null;
	this._atlas_data = null;
	this._anim_time = 0;
	
	this._anim_length = 0;
	this._anim_length_next = 0;
	this._anim_rate = 1;
	this._anim_repeat = 2;

	this._file_index = 0;
	this._entity_index = 0;
	this._anim_index = 0;
	this._anim_blend = 0.0;
	this._alpha = 1.0;

	this._loading = false;

	this._render_webgl;
	this._render_ctx2d;


	this._camera_x = 0;
	this._camera_y = 0;
	this._camera_zoom = 1;

	this._enable_render_debug_pose = false;
}

SpriterManager.prototype.initContainer = function(battleSceneManager){
		
}

SpriterManager.prototype.init = function(attachControl){	
	if(!this._initialized){
		this._initialized = true;
	}
}

SpriterManager.prototype.getGlContext = function(attachControl){	
	return this._glContext;
}

SpriterManager.prototype.startAnimation = function(animationContext, path, animKey){	
	//this._glContext = this._canvas.getContext("webgl");	
	this._spriterPath = path;
	this._animationContext = animationContext;
	this._ctx = animationContext.texture.getContext();
	this._anim_key = animKey;
	this.loadDefFile();
	this.started = true;
}

SpriterManager.prototype.updateAnimation = function(animKey, animKeyOut){	
	this._anim_key = animKey;
	if(this._spriter_pose){
		this._spriter_pose.setAnim(animKey);
		this._spriter_pose.setAnimOut(animKeyOut);
	}	
}

SpriterManager.prototype.loadDefFile = function(){
	var _this = this;
	_this._render_webgl = new RenderWebGL(_this._glContext);
	_this._render_ctx2d = new RenderCtx2D(_this._ctx);

	
	var loadFile = function(file, callback) {
		
		_this._render_webgl.dropData(_this._spriter_data, _this._atlas_data);
		_this._render_ctx2d.dropData(_this._spriter_data, _this._atlas_data);
		_this._spriter_pose = null;
		_this._spriter_pose_next = null;
		_this._atlas_data = null;

		var file_path = file.path;
		var file_spriter_url = file_path + file.spriter_url;
		var file_atlas_url = (file.atlas_url) ? (file_path + file.atlas_url) : ("");

		loadText(file_spriter_url, function(err, text) {
			if (err) {
				callback();
				return;
			}

			var match = file.spriter_url.match(/\.scml$/i);
			if (match) {
				var parser = new DOMParser();
				// replace &quot; with \"
				var xml_text = text.replace(/&quot;/g, "\"");
				var xml = parser.parseFromString(xml_text, 'text/xml');
				var json_text = xml2json(xml, '\t');
				// attributes marked with @, replace "@(.*)": with "\1":
				json_text = json_text.replace(/"@(.*)":/g, "\"$1\":");
				var json = JSON.parse(json_text);
				var spriter_json = json.spriter_data;
				if(!SpriterManager.defCache[file_spriter_url]){
					SpriterManager.defCache[file_spriter_url] = new spriter.Data().load(spriter_json);
				}
				_this._spriter_data = SpriterManager.defCache[file_spriter_url];
			} else {
				if(!SpriterManager.defCache[file_spriter_url]){
					SpriterManager.defCache[file_spriter_url] = new spriter.Data().load(JSON.parse(text));
				}
				_this._spriter_data = SpriterManager.defCache[file_spriter_url];
			}

			_this._spriter_pose = new spriter.Pose(_this._spriter_data);
			_this._spriter_pose_next = new spriter.Pose(_this._spriter_data);

			loadText(file_atlas_url, function(err, atlas_text) {
				var images = {};

				var counter = 0;
				var counter_inc = function() {
					counter++;
				}
				var counter_dec = function() {
					if (--counter === 0) {
						_this._render_ctx2d.loadData(_this._spriter_data, _this._atlas_data, images);
						_this._render_webgl.loadData(_this._spriter_data, _this._atlas_data, images);
						callback();
					}
				}

				counter_inc();

				if (!err && atlas_text) {
					_this._atlas_data = new atlas.Data().importTpsText(atlas_text);

					// load atlas page images
					var dir_path = file_atlas_url.slice(0, file_atlas_url.lastIndexOf('/'));
					_this._atlas_data.pages.forEach(function(page) {
						var image_key = page.name;
						var image_url = dir_path + "/" + image_key;
						counter_inc();
						images[image_key] = loadImage(image_url, (function(page) {
							return function(err, image) {
								if (err) {
									console.log("error loading:", image && image.src || page.name);
								}
								page.w = page.w || image.width;
								page.h = page.h || image.height;
								counter_dec();
							}
						})(page));
					});
				} else {
					_this._spriter_data.folder_array.forEach(function(folder) {
						folder.file_array.forEach(function(file) {
							switch (file.type) {
								case 'image':
									var image_key = file.name;
									counter_inc();
									images[image_key] = loadImage(file_path + file.name, (function(file) {
										return function(err, image) {
											if (err) {
												console.log("error loading:", image && image.src || file.name);
											}
											counter_dec();
										}
									})(file));
									break;
								case 'sound':
									break;
								default:
									console.log("TODO: load", file.type, file.name);
									break;
							}
						});
					});
				}

				// with an atlas, still need to load the sound files
				_this._spriter_data.folder_array.forEach(function(folder) {
					folder.file_array.forEach(function(file) {
						switch (file.type) {
							case 'sound':
								/*if (player_web.ctx) {
									counter_inc();
									loadSound(file_path + file.name, (function(file) {
										return function(err, buffer) {
											if (err) {
												console.log("error loading sound", file.name);
											}
											player_web.ctx.decodeAudioData(buffer, function(buffer) {
													player_web.sounds[file.name] = buffer;
												},
												function() {
													console.log("error decoding sound", file.name);
												});
											counter_dec();
										}
									})(file));
								} else {
									console.log("TODO: load", file.type, file.name);
								}*/
								break;
						}
					});
				});

				counter_dec();
			});
		});
	}

	var files = [];

	var add_file = function(path, spriter_url, atlas_url) {
		var file = {};
		file.path = path;
		file.spriter_url = spriter_url;
		file.atlas_url = atlas_url || "";
		files.push(file);
	}

	add_file(_this._spriterPath, "entity.scon", "entity.json");
	//add_file("GreyGuyPlus/", "player_006.scon", "player_006.tps.json");


	

	

	var file = files[_this._file_index];
	//messages.innerHTML = "loading";
	_this._loading = true;
	loadFile(file, function() {
		_this._loading = false;
		var entity_keys = _this._spriter_data.getEntityKeys();
		var entity_key = entity_keys[_this._entity_index = 0];
		_this._spriter_pose.setEntity(entity_key);
		_this._spriter_pose_next.setEntity(entity_key);
		//var entity = _this._spriter_pose.curEntity();
		//console.log(entity.character_map_keys);
		//_this._spriter_pose.character_map_key_array = entity.character_map_keys;
		//_this._spriter_pose.character_map_key_array = [ 'glasses', 'blue gloves', 'black gloves', 'look ma no hands' ];
		//_this._spriter_pose.character_map_key_array = [ 'glasses', 'blue gloves' ];
		var anim_keys = _this._spriter_data.getAnimKeys(entity_key);
		_this._spriter_pose.setAnim(_this._anim_key);
		var anim_key_next = anim_keys[(_this._anim_index + 1) % anim_keys.length];
		_this._spriter_pose_next.setAnim(anim_key_next);
		_this._spriter_pose.setTime(_this._anim_time = 0);
		_this._spriter_pose_next.setTime(_this._anim_time);
		_this._anim_length = _this._spriter_pose.curAnimLength() || 1000;
		_this._anim_length_next = _this._spriter_pose_next.curAnimLength() || 1000;
	});
	
	function loadText(url, callback) {
		var req = new XMLHttpRequest();
		if (url) {
			req.open("GET", url, true);
			req.responseType = 'text';
			req.addEventListener('error', function() {
				callback("error", null);
			});
			req.addEventListener('abort', function() {
				callback("abort", null);
			});
			req.addEventListener('load', function() {
					if (req.status === 200) {
						callback(null, req.response);
					} else {
						callback(req.response, null);
					}
				},
				false);
			req.send();
		} else {
			callback("error", null);
		}
		return req;
	}

	function loadImage(url, callback) {
		var image = new Image();
		image.crossOrigin = "Anonymous";
		image.addEventListener('error', function() {
			callback("error", null);
		});
		image.addEventListener('abort', function() {
			callback("abort", null);
		});
		image.addEventListener('load', function() {
			callback(null, image);
		});
		image.src = url;
		return image;
	}

	function loadSound(url, callback) {
		var req = new XMLHttpRequest();
		if (url) {
			req.open("GET", url, true);
			req.responseType = 'arraybuffer';
			req.addEventListener('error', function() {
				callback("error", null);
			});
			req.addEventListener('abort', function() {
				callback("abort", null);
			});
			req.addEventListener('load', function() {
				if (req.status === 200) {
					callback(null, req.response);
				} else {
					callback(req.response, null);
				}
			});
			req.send();
		} else {
			callback("error", null);
		}
		return req;
	}
}
SpriterManager.prototype.update = function(dt) {
	var _this = this;
    /*var dt = time - (prev_time || time);
       prev_time = time;*/ // ms
   if(!_this.started){
	   return;
   }
	var ctx = _this._ctx;
	var gl = _this._glContext;
	
    var entity_keys;
    var entity_key;
    var anim_keys;
    var anim_key;
    var anim_key_next;

    if (!_this._loading) {
		if(!_this._anim_hold || _this._current_play_time <= _this._anim_length)
        _this._spriter_pose.update(dt * _this._anim_rate);
        var anim_rate_next = _this._anim_rate * _this._anim_length_next / _this._anim_length;
        _this._spriter_pose_next.update(dt * anim_rate_next);

        _this._anim_time += dt * _this._anim_rate;

       /* if (_this._anim_time >= (_this._anim_length * _this._anim_repeat)) {
            entity_keys = _this._spriter_data.getEntityKeys();
            entity_key = entity_keys[_this._entity_index];
            anim_keys = _this._spriter_data.getAnimKeys(entity_key);
            if (++_this._anim_index >= anim_keys.length) {
                _this._anim_index = 0;
                if (++_this._entity_index >= entity_keys.length) {
                    _this._entity_index = 0;
                    if (files.length > 1) {
                        if (++_this._file_index >= files.length) {
                            _this._file_index = 0;
                        }
                        file = files[_this._file_index];
                        //messages.innerHTML = "_this._loading";
                        _this._loading = true;
                        loadFile(file, function() {
                            _this._loading = false;
                            entity_keys = _this._spriter_data.getEntityKeys();
                            entity_key = entity_keys[_this._entity_index = 0];
                            _this._spriter_pose.setEntity(entity_key);
                            _this._spriter_pose_next.setEntity(entity_key);
                            anim_keys = _this._spriter_data.getAnimKeys(entity_key);
                            anim_key = anim_keys[_this._anim_index = 0];
                            _this._spriter_pose.setAnim(anim_key);
                            anim_key_next = anim_keys[(_this._anim_index + 1) % anim_keys.length];
                            _this._spriter_pose_next.setAnim(anim_key_next);
                            _this._spriter_pose.setTime(_this._anim_time = 0);
                            _this._spriter_pose_next.setTime(_this._anim_time);
                            _this._anim_length = _this._spriter_pose.curAnimLength() || 1000;
                            _this._anim_length_next = _this._spriter_pose_next.curAnimLength() || 1000;
                        });
                        return;
                    }
                }
                entity_keys = _this._spriter_data.getEntityKeys();
                entity_key = entity_keys[_this._entity_index];
                _this._spriter_pose.setEntity(entity_key);
                _this._spriter_pose_next.setEntity(entity_key);
            }
            entity_keys = _this._spriter_data.getEntityKeys();
            entity_key = entity_keys[_this._entity_index];
            anim_keys = _this._spriter_data.getAnimKeys(entity_key);
            anim_key = anim_keys[_this._anim_index];
            _this._spriter_pose.setAnim(anim_key);
            anim_key_next = anim_keys[(_this._anim_index + 1) % anim_keys.length];
            _this._spriter_pose_next.setAnim(anim_key_next);
            _this._spriter_pose.setTime(_this._anim_time = 0);
            _this._spriter_pose_next.setTime(_this._anim_time);
            _this._anim_length = _this._spriter_pose.curAnimLength() || 1000;
            _this._anim_length_next = _this._spriter_pose_next.curAnimLength() || 1000;
        }*/

        entity_keys = _this._spriter_data.getEntityKeys();
        entity_key = entity_keys[_this._entity_index];
        anim_keys = _this._spriter_data.getAnimKeys(entity_key);
        anim_key = anim_keys[_this._anim_index];
        anim_key_next = anim_keys[(_this._anim_index + 1) % anim_keys.length];
       /* messages.innerHTML = "entity: " + entity_key + ", anim: " + anim_key + ", next anim: " + anim_key_next + "<br>" + file.path + file.spriter_url;
        if (_this._spriter_pose.event_array.length > 0) {
            messages.innerHTML += "<br>events: " + _this._spriter_pose.event_array;
        }
        if (_this._spriter_pose.sound_array.length > 0) {
            messages.innerHTML += "<br>sounds: " + _this._spriter_pose.sound_array;
        }
        if (_this._spriter_pose.tag_array.length > 0) {
            messages.innerHTML += "<br>tags: " + _this._spriter_pose.tag_array;
        }
        var var_map_keys = Object.keys(_this._spriter_pose.var_map);
        if (var_map_keys.length > 0) {
            messages.innerHTML += "<br>vars: ";
            var_map_keys.forEach(function(key) {
                messages.innerHTML += "<br>" + key + " : " + _this._spriter_pose.var_map[key];
            });
        }*/
    }

    if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (gl) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    if (_this._loading) {
        return;
    }

    _this._spriter_pose.strike();
    _this._spriter_pose_next.strike();

    _this._spriter_pose.sound_array.forEach(function(sound) {
        if (!player_web.mute) {
            if (player_web.ctx) {
                var source = player_web.ctx.createBufferSource();
                source.buffer = player_web.sounds[sound.name];
                var gain = player_web.ctx.createGain();
                gain.gain = sound.volume;
                var stereo_panner = player_web.ctx.createStereoPanner();
                stereo_panner.pan.value = sound.panning;
                source.connect(gain);
                gain.connect(stereo_panner);
                stereo_panner.connect(player_web.ctx.destination);
                source.start(0);
            } else {
                console.log("TODO: play sound", sound.name, sound.volume, sound.panning);
            }
        }
    });

    var spin = 1;

    // blend next pose bone into pose bone
    _this._spriter_pose.bone_array.forEach(function(bone, bone_index) {
        var bone_next = _this._spriter_pose_next.bone_array[bone_index];
        if (!bone_next) {
            return;
        }
        spriter.Space.tween(bone.local_space, bone_next.local_space, _this._anim_blend, spin, bone.local_space);
    });

    // blend next pose object into pose object
    _this._spriter_pose.object_array.forEach(function(object, object_index) {
        var object_next = _this._spriter_pose_next.object_array[object_index];
        if (object_next) {
            return;
        }
        switch (object.type) {
            case 'sprite':
                spriter.Space.tween(object.local_space, object_next.local_space, _this._anim_blend, spin, object.local_space);
                if (_this._anim_blend >= 0.5) {
                    object.folder_index = object_next.folder_index;
                    object.file_index = object_next.file_index;
                    object.pivot.copy(object_next.pivot);
                }
                object.alpha = spriter.tween(object.alpha, object_next.alpha, _this._anim_blend);
                break;
            case 'bone':
                spriter.Space.tween(object.local_space, object_next.local_space, _this._anim_blend, spin, object.local_space);
                break;
            case 'box':
                spriter.Space.tween(object.local_space, object_next.local_space, _this._anim_blend, spin, object.local_space);
                if (_this._anim_blend >= 0.5) {
                    object.pivot.copy(object_next.pivot);
                }
                break;
            case 'point':
                spriter.Space.tween(object.local_space, object_next.local_space, _this._anim_blend, spin, object.local_space);
                break;
            case 'sound':
                if (_this._anim_blend >= 0.5) {
                    object.name = object_next.name;
                }
                object.volume = spriter.tween(object.volume, object_next.volume, _this._anim_blend);
                object.panning = spriter.tween(object.panning, object_next.panning, _this._anim_blend);
                break;
            case 'entity':
                spriter.Space.tween(object.local_space, object_next.local_space, _this._anim_blend, spin, object.local_space);
                break;
            case 'variable':
                break;
            default:
                throw new Error(object.type);
        }
    });

    // compute bone world space
    _this._spriter_pose.bone_array.forEach(function(bone) {
        var parent_bone = _this._spriter_pose.bone_array[bone.parent_index];
        if (parent_bone) {
            spriter.Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
        } else {
            bone.world_space.copy(bone.local_space);
        }
    });

    // compute object world space
    _this._spriter_pose.object_array.forEach(function(object) {
        switch (object.type) {
            case 'sprite':
                var bone = _this._spriter_pose.bone_array[object.parent_index];
                if (bone) {
                    spriter.Space.combine(bone.world_space, object.local_space, object.world_space);
                } else {
                    object.world_space.copy(object.local_space);
                }
                var folder = _this._spriter_data.folder_array[object.folder_index];
                var file = folder && folder.file_array[object.file_index];
                if (file) {
                    var offset_x = (0.5 - object.pivot.x) * file.width;
                    var offset_y = (0.5 - object.pivot.y) * file.height;
                    spriter.Space.translate(object.world_space, offset_x, offset_y);
                }
                break;
            case 'bone':
                var bone = _this._spriter_pose.bone_array[object.parent_index];
                if (bone) {
                    spriter.Space.combine(bone.world_space, object.local_space, object.world_space);
                } else {
                    object.world_space.copy(object.local_space);
                }
                break;
            case 'box':
                var bone = _this._spriter_pose.bone_array[object.parent_index];
                if (bone) {
                    spriter.Space.combine(bone.world_space, object.local_space, object.world_space);
                } else {
                    object.world_space.copy(object.local_space);
                }
                var entity = _this._spriter_pose.curEntity();
                var box_info = entity.obj_info_map[object.name];
                if (box_info) {
                    var offset_x = (0.5 - object.pivot.x) * box_info.w;
                    var offset_y = (0.5 - object.pivot.y) * box_info.h;
                    spriter.Space.translate(object.world_space, offset_x, offset_y);
                }
                break;
            case 'point':
                var bone = _this._spriter_pose.bone_array[object.parent_index];
                if (bone) {
                    spriter.Space.combine(bone.world_space, object.local_space, object.world_space);
                } else {
                    object.world_space.copy(object.local_space);
                }
                break;
            case 'sound':
                break;
            case 'entity':
                var bone = _this._spriter_pose.bone_array[object.parent_index];
                if (bone) {
                    spriter.Space.combine(bone.world_space, object.local_space, object.world_space);
                } else {
                    object.world_space.copy(object.local_space);
                }
                break;
            case 'variable':
                break;
            default:
                throw new Error(object.type);
        }
    });

    if (ctx) {
        ctx.globalAlpha = _this._alpha;

        // origin at center, x right, y up
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.scale(-1, -1);


        ctx.translate(-_this._camera_x, -_this._camera_y);
        ctx.scale(_this._camera_zoom, _this._camera_zoom);
        ctx.lineWidth = 1 / _this._camera_zoom;

       
		_this._render_ctx2d.drawPose(_this._spriter_pose, _this._atlas_data);
		//ctx.translate(0, -10);
		//_this._render_ctx2d.drawPose(_this._spriter_pose_next, _this._atlas_data);
        

        if (_this._enable_render_debug_pose) {
            _this._render_ctx2d.drawDebugPose(_this._spriter_pose, _this._atlas_data);
            //ctx.translate(0, -10);
            //_this._render_ctx2d.drawDebugPose(_this._spriter_pose_next, _this._atlas_data);
        }
    }

    if (gl) {
        var gl_color = _this._render_webgl.gl_color;
        gl_color[3] = _this._alpha;

        var gl_projection = _this._render_webgl.gl_projection;
        mat4x4Identity(gl_projection);
        mat4x4Ortho(gl_projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);

        mat4x4Translate(gl_projection, -_this._camera_x, -_this._camera_y, 0);
        mat4x4Scale(gl_projection, _this._camera_zoom, _this._camera_zoom, _this._camera_zoom);

       
		_this._render_webgl.drawPose(_this._spriter_pose, _this._atlas_data);
		//mat4x4Translate(gl_projection, 0, -10, 0);
		//_this._render_webgl.drawPose(_this._spriter_pose_next, _this._atlas_data);
        
    }
	
	/*var targetContext = _this._targetTexture.getContext();
	targetContext.fillStyle = ("green");
	targetContext.fillRect(0, 0, 300, 200);*/
	this._animationContext.texture.update();
}