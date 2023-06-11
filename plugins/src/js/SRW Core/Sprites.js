	export default {
		patches: patches,
		Sprite_Player: Sprite_Player,
		Sprite_MapEffect:Sprite_MapEffect,
		Sprite_MapAttack:Sprite_MapAttack,
		Sprite_WillIndicator:Sprite_WillIndicator,
		Sprite_BasicShadow:Sprite_BasicShadow,
		Sprite_DefendIndicator:Sprite_DefendIndicator,
		Sprite_AttackIndicator:Sprite_AttackIndicator,
		Sprite_TwinIndicator:Sprite_TwinIndicator,
		Sprite_Destroyed:Sprite_Destroyed,
		Sprite_Appear:Sprite_Appear,
		Sprite_Disappear:Sprite_Disappear,
		Sprite_Reticule:Sprite_Reticule,
		Sprite_SrpgGrid:Sprite_SrpgGrid,
		Sprite_AreaHighlights:Sprite_AreaHighlights,
		Sprite_CloudScroll: Sprite_CloudScroll,
		Sprite_MapBorder: Sprite_MapBorder
	} 
	
	function patches(){};
	
	
	
	patches.apply = function(){
		
		Sprite.PROJECTION_VERTEX_SHADER =`
			attribute vec4 aVertexPosition;
			attribute vec2 aTextureCoord;
			
			attribute vec4 aVertexColor;

			uniform mat4 uModelViewMatrix;
			uniform mat4 uProjectionMatrix;
			
			uniform mat4 uXFormMatrix;

			varying highp vec2 vTextureCoord;
			varying lowp vec4 vColor;


			void main(void) {					  
			  vec4 position = uModelViewMatrix * aVertexPosition;
				position = uProjectionMatrix * vec4(position.x, position.y, position.z, position.w);
				gl_Position = position * uXFormMatrix;
			  
			  vTextureCoord = aTextureCoord;
			 // vColor = aVertexColor;
			}
	  `;
	  
		Sprite.PROJECTION_FRAGMENT_SHADER =`
			varying highp vec2 vTextureCoord;
			varying lowp vec4 vColor;

			uniform sampler2D uSampler;
			uniform highp float opacity;

			void main(void) {
			  gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(1,1,1,opacity);
			  //gl_FragColor = vColor;
			}
		  `;
					
		//dummy for users running with the plugin disabled
		if(typeof window.UltraMode7 == "undefined"){
			window.UltraMode7 = function(){};
			window.UltraMode7.isActive = function(){
				return false;
			}
		}
		
		const Sprite_prototype_initialize = Sprite.prototype.initialize;
		Sprite.prototype.initialize = function(bitmap){
			Sprite_prototype_initialize.call(this, bitmap);
			if(this._isProjected){
				
			}
		}
		
		Sprite.prototype.update = function() {
			let pre = [];
			let sorted = [];
			let post = [];
			let foundStartOfSorted = false;
			if(this.children[0] && this.children[0].children){
				this.children[0].children.forEach(function(child) {					
					if(child.isSorted){
						foundStartOfSorted = true;
						sorted.push(child);
					} else if(!foundStartOfSorted){
						pre.push(child);
					} else {
						post.push(child);
					}					
				});
				sorted = sorted.sort(function(a, b){return a._character.posY() - b._character.posY()});
	
				this.children[0].children = pre.concat(sorted).concat(post);
			}
			
			this.children.forEach(function(child) {
				if (child.update) {
					child.update();
				}
			});
		};
		
		Sprite.prototype.initShaderProgram = function(gl) {
			// Initialize a shader program, so WebGL knows how to draw our data
			if(this.programInfo){
				return this.programInfo;
			}			
			//
			// creates a shader of the given type, uploads the source and
			// compiles it.
			//
			function loadShader(gl, type, source) {
			  const shader = gl.createShader(type);

			  // Send the source to the shader object

			  gl.shaderSource(shader, source);

			  // Compile the shader program

			  gl.compileShader(shader);

			  // See if it compiled successfully

			  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
				gl.deleteShader(shader);
				return null;
			  }

			  return shader;
			}
			
			const vertexShader = loadShader(gl, gl.VERTEX_SHADER, Sprite.PROJECTION_VERTEX_SHADER);
			const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, Sprite.PROJECTION_FRAGMENT_SHADER);

			// Create the shader program

			const shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			// If creating the shader program failed, alert

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
				return null;
			}
			
			this.programInfo = {
				program: shaderProgram,
				attribLocations: {
				  vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
				  textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
				  color: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
				},
				uniformLocations: {
				  projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
				  modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
				  uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
				  xFormMatrix: gl.getUniformLocation(shaderProgram, 'uXFormMatrix'),
				  opacity: gl.getUniformLocation(shaderProgram, 'opacity'),
				},
			};
			return this.programInfo;
		}
		
		Sprite.prototype.initBuffers = function(gl) {
			if(this.buffers){
				return this.buffers;
			}
			// Create a buffer for the square's positions.

			const positionBuffer = gl.createBuffer();

			// Select the positionBuffer as the one to apply buffer
			// operations to from here out.

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

			// Now create an array of positions for the square.
			const height = $gameMap.height() * $gameMap.tileHeight();
			const width =  $gameMap.width() * $gameMap.tileWidth();
			const positions = [
				0,  0,
				0,  height,
				width, 0,
				width, 0,
				0, height,
				width, height,
			];

			// Now pass the list of positions into WebGL to build the
			// shape. We do this by creating a Float32Array from the
			// JavaScript array, then use it to fill the current buffer.

			gl.bufferData(gl.ARRAY_BUFFER,
				new Float32Array(positions),
				gl.STATIC_DRAW);


			 const textureCoordinates = [
				0, 0,
				0, 1,
				1, 0,
				1, 0,
				0, 1,
				1, 1,
			]

			const textureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);				 
				  
			this.buffers = {
				position: positionBuffer,
				textureCoord: textureCoordBuffer
			};
			return this.buffers;
		}
		
		Sprite.prototype.prepareTexture = function(gl){
			const _this = this;
			if(this.projectedTexture){
				return this.projectedTexture;
			}
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
						  gl.RGBA, gl.UNSIGNED_BYTE, _this.bitmap.canvas);

			// WebGL1 has different requirements for power of 2 images
			// vs non power of 2 images so check if the image is a
			// power of 2 in both dimensions.
			if (isPowerOf2(_this.bitmap.canvas.width) && isPowerOf2(_this.bitmap.canvas.height)) {
			   // Yes, it's a power of 2. Generate mips.
			   gl.generateMipmap(gl.TEXTURE_2D);
			} else {
			   // No, it's not a power of 2. Turn off mips and set
			   // wrapping to clamp to edge
			   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			
			}
			
			function isPowerOf2(value) {
			  return (value & (value - 1)) === 0;
			}
			this.projectedTexture = texture;
			return this.projectedTexture;
		}
		
		Sprite.prototype._renderWebGL = function(renderer) {
			if (this.bitmap) {
				this.bitmap.touch();
			}
			if(this.bitmap && !this.bitmap.isReady()){
				return;
			}
			if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
				if (this._bitmap) {
					this._bitmap.checkDirty();
				}

				//copy of pixi-v4 internal code
				this.calculateVertices();

				if (this.pluginName === 'sprite' && this._isPicture) {
					// use heavy renderer, which reduces artifacts and applies corrent blendMode,
					// but does not use multitexture optimization
					this._speedUpCustomBlendModes(renderer);
					renderer.setObjectRenderer(renderer.plugins.picture);
					renderer.plugins.picture.render(this);
				} else {
					// use pixi super-speed renderer
					renderer.setObjectRenderer(renderer.plugins[this.pluginName]);					
					//renderer.currentRenderer.renderer.gl.useProgram(renderer.currentRenderer.shader.program);
					renderer.plugins[this.pluginName].render(this);
				}
			}
		};
		
		Sprite.prototype.renderWebGL = function(renderer){
			const _this = this;
			if(this._isProjected && (typeof UltraMode7 != "undefined") && UltraMode7.isActive() && $gameMap.ultraMode7ProjectionMatrix && $gameMap.ultraMode7ModelviewMatrix){
				let gl = renderer.gl;
				let prevBuffer = renderer.plugins["sprite"].vertexBuffers[0];
				let prevShaderProgram = renderer.gl.getParameter(renderer.gl.CURRENT_PROGRAM);				
								
				
				const programInfo = this.initShaderProgram(gl);								
				const buffers = this.initBuffers(gl);				
				const texture = this.prepareTexture(gl);
				/*
				// gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				// Prevents s-coordinate wrapping (repeating).
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				// Prevents t-coordinate wrapping (repeating).
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				*/
				
				function drawScene(gl, programInfo, buffers) {					  
					  //[hack]if opacity == 0 do not use additive blending, as it seems to break hiding the sprite
					  if(_this._blendAdditive && _this.opacity != 0){						
						gl.blendFunc(1, 771);//default PIXI blend mode
					  } else {
						gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA );
					  }
						
					  const fieldOfView = 45 * Math.PI / 180;   // in radians
					  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
					  const zNear = 0;
					  const zFar = 100.0;
					  const projectionMatrix = glMatrix.mat4.create();

					  // note: glmatrix.js always has the first argument
					  // as the destination to receive the result.
					  glMatrix.mat4.perspective(projectionMatrix,
									   fieldOfView,
									   aspect,
									   zNear,
									   zFar);

					  // Set the drawing position to the "identity" point, which is
					  // the center of the scene.
					  const modelViewMatrix = glMatrix.mat4.create();

					  // Now move the drawing position a bit to where we want to
					  // start drawing the square.

					  glMatrix.mat4.translate(modelViewMatrix,     // destination matrix
									 modelViewMatrix,     // matrix to translate
									 [-0.0, 0.0, -6.0]);  // amount to translate

					  // Tell WebGL how to pull out the positions from the position
					  // buffer into the vertexPosition attribute.
					  {
						const numComponents = 2;  // pull out 2 values per iteration
						const type = gl.FLOAT;    // the data in the buffer is 32bit floats
						const normalize = false;  // don't normalize
						const stride = 0;         // how many bytes to get from one set of values to the next
												  // 0 = use type and numComponents above
						const offset = 0;         // how many bytes inside the buffer to start from
						gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
						gl.vertexAttribPointer(
							programInfo.attribLocations.vertexPosition,
							numComponents,
							type,
							normalize,
							stride,
							offset);
						gl.enableVertexAttribArray(
							programInfo.attribLocations.vertexPosition);
					  }
					  
					  // tell webgl how to pull out the texture coordinates from buffer
						{
							const num = 2; // every coordinate composed of 2 values
							const type = gl.FLOAT; // the data in the buffer is 32-bit float
							const normalize = false; // don't normalize
							const stride = 0; // how many bytes to get from one set to the next
							const offset = 0; // how many bytes inside the buffer to start from
							gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
							gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
							gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
						}
						
						
						// Tell WebGL to use our program when drawing

						gl.useProgram(programInfo.program);

						// Set the shader uniforms

						gl.uniformMatrix4fv(
							programInfo.uniformLocations.projectionMatrix,
							false,
							//projectionMatrix
							$gameMap.ultraMode7ProjectionMatrix.data
						);
							
						gl.uniformMatrix4fv(
							programInfo.uniformLocations.modelViewMatrix,
							false,
							//modelViewMatrix
							$gameMap.ultraMode7ModelviewMatrix.data
						);
						
						var Sx = 1.0, Sy = 1.0, Sz = 1.0;
						 var xFormMatrix = [
							Sx,   0.0,  0.0,  0.0,
							0.0,  Sy,   0.0,  0.0,
							0.0,  0.0,  Sz,   0.0,
							0.0,  0.0,  0.0,  1.0  
						 ];
						
						gl.uniformMatrix4fv(
							programInfo.uniformLocations.xFormMatrix,
							false,
							new Float32Array(xFormMatrix)
						);

						// Tell WebGL we want to affect texture unit 0
						gl.activeTexture(gl.TEXTURE0);

						// Bind the texture to texture unit 0
						gl.bindTexture(gl.TEXTURE_2D, texture);

						// Tell the shader we bound the texture to texture unit 0
						gl.uniform1i(programInfo.uniformLocations.uSampler, 0);  
						 
					
						gl.uniform1f(programInfo.uniformLocations.opacity, _this.opacity / 255);  			

					  {
						const offset = 0;
						const vertexCount = 6;
						gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
					  }
					  gl.blendFunc(1, 771);//default PIXI blend mode
				}

				
				drawScene(gl, programInfo, buffers);
				
				//renderer.gl.useProgram(prevShaderProgram);
				//prevBuffer.bind();	
				return;
			}
			
			
			if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
				return;
			}

			// do a quick check to see if this element has a mask or a filter.
			if (this._mask || this.filters && this.filters.length) {
				this.renderAdvancedWebGL(renderer);
			} else {
				this._renderWebGL(renderer);

				// simple render children!
				for (var i = 0, j = this.children.length; i < j; ++i) {
					this.children[i].renderWebGL(renderer);
				}
			}
		}
		
		Sprite_Character.prototype.setupAnimation = function() {
			if (this._character.animationId() > 0) {
				var animation = $dataAnimations[this._character.animationId()];
				var animOptions = this._character._animationOptions;
				if(animOptions){
					Object.keys(animOptions).forEach(function(key){
						animation[key] = animOptions[key];
					});
				}
				this.startAnimation(animation, false, 0);
				this._character.startAnimation();
			}
		};
		
		Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
			this._target = target;
			this._animation = animation;
			this._mirror = mirror;
			this._delay = delay;
			if (this._animation) {
				this.remove();
				this.setupRate();
				this.setupDuration();
				this.loadBitmaps();
				this.createSprites();
			}
			
		};
		
		Sprite_Animation.prototype.setupRate = function() {
			this._rate = 5 - $gameSystem.getBattleSpeed();
		};
		
		Sprite_Animation.prototype.updateMain = function() {
			if (this.isPlaying() && this.isReady()) {
				if (this._delay > 0) {
					this._delay--;
				} else {
					this._duration--;
					this.updatePosition();
					if (this._duration % this._rate === 0) {
						this.updateFrame();
					}
				}
			}
		};


		Sprite_Animation.prototype.update = function() {
			Sprite.prototype.update.call(this);
			this.updateMain();
			this._noFlash = this._animation.noflash;
			this.updateFlash();
			this.updateScreenFlash();
			
			this.updateHiding();
			Sprite_Animation._checker1 = {};
			Sprite_Animation._checker2 = {};		
			
			this.scale.x = 1;
			this.scale.y = 1;	
			this.rotation = 0;
			if(this._animation.direction){			
				
				if(this._animation.direction == "down"){
					this.scale.y = -1;	
				}
				if(this._animation.direction == "left" || this._animation.direction == "right"){				
					this.scale.x = -1;		
					this.rotation = 90 * Math.PI / 180;				
				}
				
				if(this._animation.direction == "left"){
					this.scale.y = -1;	
				}			
				
				if(this._animation.offset){
					var offset = this._animation.offset[this._animation.direction];	
					if(offset){
						this.x+=offset.x;
						this.y+=offset.y;
					}	
				}			
			}
			
			if(this._animation.scale){
				this.scale.y*=this._animation.scale;
				this.scale.x*=this._animation.scale;
			}
			
		};
			
		Sprite_Animation.prototype.updatePosition = function() {
			if (this._animation.position === 3) {
				this.x = this.parent.width / 2;
				this.y = this.parent.height / 2;
			} else {
				var parent = this._target.parent;
				var grandparent = parent ? parent.parent : null;
				this.x = this._target.x;
				this.y = this._target.y;
				if (this.parent === grandparent) {
					this.x += parent.x;
					this.y += parent.y;
				}
				if (this._animation.position === 0) {
					this.y -= $gameMap.tileHeight();
				} else if (this._animation.position === 1) {
					this.y -= $gameMap.tileHeight() / 2 - 0;
				}
			}
		};
		
		var _SRPG_Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
		Sprite_Actor.prototype.setActorHome = function(index) {
			if ($gameSystem.isSRPGMode() == true) {
				this.setHome(Graphics.width - 216 - index * 240, Graphics.height / 2 + 48);
			} else {
				_SRPG_Sprite_Actor_setActorHome.call(this, index);
			}
		};
		
		//Character sprites are split into two a bottom and top part to improve overlap for units whose map icon goes outside their current tiles.
		//This can happen for flying units for example.
		//The base sprite is normally hidden, but is still available.
		
		Sprite_Character.prototype.allBodyPartsAvailable = function(character) {
			return this._upperBody && this._lowerBody && this._upperBodyTop && this._upperBodyOverlay && this._lowerBodyOverlay;
		}
		
		Sprite_Character.prototype.update = function(character) {
			Sprite_Base.prototype.update.call(this);
			if(!this.visible) {
				return;
			}
			this.updateBitmap();
			this.updateFrame();
			this.updatePosition();
			this.updateAnimation();
			this.updateBalloon();
			this.updateOther();
			if (this._character.isEvent() == true) {
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				if (battlerArray) {
					if ($gameSystem.isEnemy(battlerArray[1]) && !ENGINE_SETTINGS.KEEP_ENEMY_SPRITE_ORIENTATION) {
						this.scale.x = -1;			
						if(this.allBodyPartsAvailable()){	
							this._upperBody.scale.x = -1;
							this._upperBodyOverlay.scale.x = -1;
							this._upperBodyTop.scale.x = -1;
							this._lowerBody.scale.x = -1;
							this._lowerBodyOverlay.scale.x = -1;
						}	
					} else {
						this.scale.x = 1;				
						if(this.allBodyPartsAvailable()){	
							this._upperBody.scale.x = 1;
							this._upperBodyOverlay.scale.x = 1;
							this._upperBodyTop.scale.x = 1;
							this._lowerBody.scale.x = 1;
							this._lowerBodyOverlay.scale.x = 1;
						}
					}
					if(this.allBodyPartsAvailable()){	
						if(battlerArray[0] === 'actor' && $gameTemp.doingManualDeploy){
							this._frameCount+=2;
							this._frameCount %= 200;
							if(this._frameCount < 100){
								this._upperBody.opacity = this._frameCount + 80;
								this._upperBodyTop.opacity = this._frameCount + 80;
								this._lowerBody.opacity = this._frameCount + 80;
								this.opacity = this._frameCount + 80;
							} else {
								this._upperBody.opacity = 200 + 80 - this._frameCount;
								this._upperBodyTop.opacity = 200 + 80 - this._frameCount;
								this._lowerBody.opacity = 200 + 80 - this._frameCount;
								this.opacity = 200 + 80 - this._frameCount;
							}
						} else {
							this._upperBody.opacity = 255;
							this._upperBodyTop.opacity = 255;
							this._lowerBody.opacity = 255;
							this.opacity = 255;
						}
						
						this._upperBodyOverlay.opacity = 0;
						this._lowerBodyOverlay.opacity = 0;
						
						var refX;
						var refY;
						if(this._character._x != this._character._realX || this._character._y != this._character._realY){
							if($gameMap.hasStarTile(this._character._x,  this._character._y) || $gameMap.hasStarTile(this._character._prevX,  this._character._prevY)){
								this._upperBodyTop.opacity = 0;
								
								if($gameSystem.foregroundSpriteToggleState == 0){
									this._upperBodyOverlay.opacity = 0;
									this._lowerBodyOverlay.opacity = 0;
									this.opacity = 0;
								} else if($gameSystem.foregroundSpriteToggleState == 1){
									this._upperBodyOverlay.opacity = 128;
									this._lowerBodyOverlay.opacity = 128;
									this.opacity = 128;
								} else if($gameSystem.foregroundSpriteToggleState == 2){
									this._upperBodyOverlay.opacity = 255;
									this._lowerBodyOverlay.opacity = 255;
									this.opacity = 255;
								}
								//this._upperBodyOverlay.opacity = 128;
								//this._lowerBodyOverlay.opacity = 128;
							} else {
								this._upperBodyTop.opacity = 255;
								this._upperBody.opacity = 0;
							}
						} else {
							if($gameMap.hasStarTile(this._character._x,  this._character._y)){
								this._upperBodyTop.opacity = 0;
								if($gameSystem.foregroundSpriteToggleState == 0){
									this._upperBodyOverlay.opacity = 0;
									this._lowerBodyOverlay.opacity = 0;
									this.opacity = 0;
								} else if($gameSystem.foregroundSpriteToggleState == 1){
									this._upperBodyOverlay.opacity = 128;
									this._lowerBodyOverlay.opacity = 128;
									this.opacity = 128;
								} else if($gameSystem.foregroundSpriteToggleState == 2){
									this._upperBodyOverlay.opacity = 255;
									this._lowerBodyOverlay.opacity = 255;
									this.opacity = 255;
								}
								//this._upperBodyOverlay.opacity = 128;
								//this._lowerBodyOverlay.opacity = 128;
							} else {
								this._upperBodyTop.opacity = 255;
								this.opacity = 255;
								this._upperBody.opacity = 0;
							}
						}	
						if(//$gameTemp.activeEvent() == this._character || 
							$gameTemp._TargetEvent == this._character ||
							($gameSystem.isSubBattlePhase() == "actor_move" && $gameTemp.activeEvent() == this._character) || 
							($gameSystem.isSubBattlePhase()== "enemy_move" && $gameTemp.activeEvent() == this._character) || 
							$gameSystem.isSubBattlePhase()== "actor_target" || 
							$gameSystem.isSubBattlePhase() == "enemy_targeting_display" ||
							$gameSystem.isSubBattlePhase() == "post_move_command_window" ||
							$gameSystem.isSubBattlePhase() == "rearrange_deploys" ||
							$gameSystem.isSubBattlePhase() == "hover_deploy_btn"							
						){
							this._upperBodyOverlay.opacity = 255;
							this._lowerBodyOverlay.opacity = 255;
							this.opacity = 255;
						}
						if(battlerArray && battlerArray[1] && $statCalc.getCurrentTerrain(battlerArray[1]) == "water" && !$statCalc.hoversOnWater(battlerArray[1])){
							this._upperBody.opacity-=120;
							this._upperBodyOverlay.opacity-=120;
							this._upperBodyTop.opacity-=120;
							this._lowerBody.opacity-=120;
							this._lowerBodyOverlay.opacity-=120;
						}					
					}
				}			
			}		
		}
		
		Sprite_Character.prototype.isTurnEndUnit = function() {
			if (this._character.isEvent() == true) {
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				if (battlerArray) {
					if (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy') {
						return battlerArray[1].srpgTurnEnd();
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		//キャラクタービットマップの更新
		var _SRPG_Sprite_Character_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
		Sprite_Character.prototype.setCharacterBitmap = function() {
			_SRPG_Sprite_Character_setCharacterBitmap.call(this);
			this._turnEndBitmap = ImageManager.loadCharacter('srpg_set');
			this._frameCount = 0;
		
		};
		Sprite_Character.prototype.setUpperBodyTop = function(sprite) {
			this._upperBodyTop = sprite;
			this._upperBodyTop.anchor.x = 0.5;
			this._upperBodyTop.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setUpperBody = function(sprite) {
			this._upperBody = sprite;
			this._upperBody.anchor.x = 0.5;
			this._upperBody.anchor.y = 2;
		}

		Sprite_Character.prototype.setLowerBody = function(sprite) {
			this._lowerBody = sprite;
			this._lowerBody.anchor.x = 0.5;
			this._lowerBody.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setUpperBodyOverlay = function(sprite) {
			this._upperBodyOverlay = sprite;
			this._upperBodyOverlay.anchor.x = 0.5;
			this._upperBodyOverlay.anchor.y = 2;
		}

		Sprite_Character.prototype.setLowerBodyOverlay = function(sprite) {
			this._lowerBodyOverlay = sprite;
			this._lowerBodyOverlay.anchor.x = 0.5;
			this._lowerBodyOverlay.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setTurnEnd = function(sprite) {
			this._turnEndSprite = sprite;
			this._turnEndSprite.anchor.x = 0;
			this._turnEndSprite.anchor.y = 1;
		}

		
		Sprite_Character.prototype.updateHalfBodySprites = function() {   
			if(this.allBodyPartsAvailable()){		
				this._upperBody.bitmap = this.bitmap;
				this._upperBody.visible = true;
				this._upperBodyTop.bitmap = this.bitmap;
				this._upperBodyTop.visible = true;
				this._lowerBody.bitmap = this.bitmap;
				this._lowerBody.visible = true;	
				this._upperBodyOverlay.bitmap = this.bitmap;
				this._upperBodyOverlay.visible = true;
				this._lowerBodyOverlay.bitmap = this.bitmap;
				this._lowerBodyOverlay.visible = true;	
			}
		};
		
		Sprite_Character.prototype.updatePosition = function() {
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ();
			
			if(this.allBodyPartsAvailable()){
				this._upperBody.x = this.x;
				this._upperBody.y = this.y;
				this._upperBody.z = this.z + 1;
				
				this._upperBodyOverlay.x = this.x;
				this._upperBodyOverlay.y = this.y;
				this._upperBodyOverlay.z = this.z + 1;
				
				this._upperBodyTop.x = this.x;
				this._upperBodyTop.y = this.y;
				this._upperBodyTop.z = this.z + 1;
				
				this._lowerBody.x = this.x;
				this._lowerBody.y = this.y + 24;
				this._lowerBody.z = this.z;
				
				this._lowerBodyOverlay.x = this.x;
				this._lowerBodyOverlay.y = this.y + 24;
				this._lowerBodyOverlay.z = this.z;
				
				
			}
			if(this._turnEndSprite){
				this._turnEndSprite.x = this.x - 20;
				this._turnEndSprite.y = this.y - this._character._floatOffset;
				this._turnEndSprite.z = this.z + 2;	
			}			
		};
		
		//キャラクターフレームの更新
		var _SRPG_Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
		Sprite_Character.prototype.updateCharacterFrame = function() {
			var pw = this.patternWidth();
			var ph = this.patternHeight();
			var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
			var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
			
			let isMode7 = (typeof UltraMode7 != "undefined") && UltraMode7.isActive();
			
			if (this._turnEndSprite) {
				this._turnEndSprite.visible = false;
			}
			
			if($gameTemp.intermissionPending){
				//workaround for issue where turn end sprites would show up for a couple seconds when transitioning to the intermission
				return;
			}
			
			if(isMode7 && $gameSystem.isSRPGMode() == true && this._character.isEvent() == true){
				this.setFrame(sx, sy, pw, ph);
				if($gameSystem.isSubBattlePhase() === 'actor_map_target_confirm' || $gameSystem.isSubBattlePhase() == 'actor_target_spirit'){
					if(($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(this._character.eventId())) &&
						($gameSystem.isSubBattlePhase() !== 'actor_target_spirit' || $gameTemp.isSpiritTarget(this._character.eventId()))
					){				
						if(battlerArray && battlerArray[1] && $statCalc.getCurrentTerrain(battlerArray[1]) == "water" && !$statCalc.hoversOnWater(battlerArray[1])){
							this.setBlendColor([21, 87, 255, 64]);								
							
						} else {
							this.setBlendColor([0, 0, 0, 0]);	
						}	
						this._currentColorState = ""
						this.filters = [];
											
						
					} else {						
						this.setBlendColor([64, 64, 64, 128]);	
												
					}		
					
				} else {
					this.setBlendColor([0, 0, 0, 0]);	
					
					if(this.isTurnEndUnit()){

						if(this._currentColorState != "grayed_out"){
							this._currentColorState = "grayed_out"
							let colorMatrix = new PIXI.filters.ColorMatrixFilter();
							colorMatrix.greyscale(0.3);
							this.filters = [colorMatrix];
						}
					} else {
						if(this._currentColorState == "grayed_out"){
							this._currentColorState = ""
							this.filters = [];
						}
					}
					//return;
				}				
				/*
				this.visible = false;
				
				//hack to ensure there's no weird overlap issues when deploying an actor from a ship
				if($gameTemp.activeShip && $gameTemp.activeShip.event.eventId() != this._character.eventId()){
					if(this._character.posX() == $gameTemp.activeShip.position.x && this._character.posY() == $gameTemp.activeShip.position.y){
						this.visible = true;
						this.setFrame(sx, sy, pw, ph);
					}				
				}		
				this.setFrame(sx, sy, pw, ph);*/
				//this.visible = false;
				if ($gameSystem.isSRPGMode() == true && this._character.isEvent() == true) {
					var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
					if (battlerArray) {				
						var pw = this._turnEndBitmap.width / 12;
						var ph = this._turnEndBitmap.height / 8;
						if ((battlerArray[0] === 'actor' || battlerArray[0] === 'enemy') &&
							battlerArray[1].isAlive() && !this._character.isErased()) {
							if (battlerArray[1].isRestricted()) {
								var sx = (6 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this.isTurnEndUnit() == true) {							
								var sx = (3 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (battlerArray[1].isAutoBattle()) {
								var sx = (9 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this._turnEndSprite) {
								this._turnEndSprite.visible = false;
							}
						} else if (this._turnEndSprite) {
							this._turnEndSprite.visible = false;
						}
					}
				}
				
				return;
			}
			
			
			if(this.allBodyPartsAvailable()  && this._character.isEvent() == true){	
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				
				this.updateHalfBodySprites();
			
				var d = 24;
				this._upperBody.setFrame(sx, sy, pw, ph - d);
				this._upperBodyTop.setFrame(sx, sy, pw, ph - d);
				this._upperBodyOverlay.setFrame(sx, sy, pw, ph - d);
				this._lowerBody.setFrame(sx, sy + ph - d, pw, d);	
				this._lowerBodyOverlay.setFrame(sx, sy + ph - d, pw, d);	
				
				
				if($gameSystem.isSubBattlePhase() === 'actor_map_target_confirm' || $gameSystem.isSubBattlePhase() == 'actor_target_spirit'){
					if(($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(this._character.eventId())) &&
						($gameSystem.isSubBattlePhase() !== 'actor_target_spirit' || $gameTemp.isSpiritTarget(this._character.eventId()))
					){				
						if(battlerArray && battlerArray[1] && $statCalc.getCurrentTerrain(battlerArray[1]) == "water" && !$statCalc.hoversOnWater(battlerArray[1])){
							this._upperBody.setBlendColor([21, 87, 255, 64]);	
							this._upperBodyOverlay.setBlendColor([21, 87, 255, 64]);	
							this._upperBodyTop.setBlendColor([21, 87, 255, 64]);	
							this._lowerBody.setBlendColor([21, 87, 255, 64]);
							this._lowerBodyOverlay.setBlendColor([21, 87, 255, 64]);
							
							
						} else {
							this._upperBody.setBlendColor([0, 0, 0, 0]);	
							this._upperBodyOverlay.setBlendColor([0, 0, 0, 0]);	
							this._upperBodyTop.setBlendColor([0, 0, 0, 0]);
							this._lowerBody.setBlendColor([0, 0, 0, 0]);
							this._lowerBodyOverlay.setBlendColor([0, 0, 0, 0]);
						}	
						this._currentColorState = ""
						this._upperBodyOverlay.filters = [];
						this._upperBody.filters = [];
						this._upperBodyTop.filters = [];
						this._lowerBody.filters = [];
						this._lowerBodyOverlay.filters = [];
											
						
					} else {						
						this._upperBody.setBlendColor([64, 64, 64, 128]);	
						this._upperBodyOverlay.setBlendColor([64, 64, 64, 128]);	
						this._upperBodyTop.setBlendColor([64, 64, 64, 128]);	
						this._lowerBody.setBlendColor([64, 64, 64, 128]);
						this._lowerBodyOverlay.setBlendColor([64, 64, 64, 128]);
												
					}		
					
				} else {
					this._upperBody.setBlendColor([0, 0, 0, 0]);	
					this._upperBodyOverlay.setBlendColor([0, 0, 0, 0]);	
					this._upperBodyTop.setBlendColor([0, 0, 0, 0]);
					this._lowerBody.setBlendColor([0, 0, 0, 0]);
					this._lowerBodyOverlay.setBlendColor([0, 0, 0, 0]);
					
					if(this.isTurnEndUnit()){
					
						/*this._upperBody.setBlendColor([21, 87, 255, 64]);	
						this._upperBodyOverlay.setBlendColor([21, 87, 255, 64]);	
						this._upperBodyTop.setBlendColor([21, 87, 255, 64]);	
						this._lowerBody.setBlendColor([21, 87, 255, 64]);
						this._lowerBodyOverlay.setBlendColor([21, 87, 255, 64]);*/
						if(this._currentColorState != "grayed_out"){
							this._currentColorState = "grayed_out"
							let colorMatrix = new PIXI.filters.ColorMatrixFilter();
							colorMatrix.greyscale(0.3);
							this._upperBodyOverlay.filters = [colorMatrix];
							this._upperBody.filters = [colorMatrix];
							this._upperBodyTop.filters = [colorMatrix];
							this._lowerBody.filters = [colorMatrix];
							this._lowerBodyOverlay.filters = [colorMatrix];	
						}
					} else {
						if(this._currentColorState == "grayed_out"){
							this._currentColorState = ""
							this._upperBodyOverlay.filters = [];
							this._upperBody.filters = [];
							this._upperBodyTop.filters = [];
							this._lowerBody.filters = [];
							this._lowerBodyOverlay.filters = [];
						}
					}
				}				
				
				this.visible = false;
				
				//hack to ensure there's no weird overlap issues when deploying an actor from a ship
				if($gameTemp.activeShip && $gameTemp.activeShip.event.eventId() != this._character.eventId()){
					if(this._character.posX() == $gameTemp.activeShip.position.x && this._character.posY() == $gameTemp.activeShip.position.y){
						this.visible = true;
						this.setFrame(sx, sy, pw, ph);
					}				
				}		
				this.setFrame(sx, sy, pw, ph);
				//this.visible = false;
				if ($gameSystem.isSRPGMode() == true && this._character.isEvent() == true) {
					var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
					if (battlerArray) {				
						var pw = this._turnEndBitmap.width / 12;
						var ph = this._turnEndBitmap.height / 8;
						if ((battlerArray[0] === 'actor' || battlerArray[0] === 'enemy') &&
							battlerArray[1].isAlive() && !this._character.isErased()) {
							if (battlerArray[1].isRestricted()) {
								var sx = (6 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this.isTurnEndUnit() == true) {							
								var sx = (3 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (battlerArray[1].isAutoBattle()) {
								var sx = (9 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this._turnEndSprite) {
								this._turnEndSprite.visible = false;
							}
						} else if (this._turnEndSprite) {
							this._turnEndSprite.visible = false;
						}
					}
				}
			} else {
				this.setFrame(sx, sy, pw, ph);
			}
		};
		

		//ターン終了の表示を作る
		Sprite_Character.prototype.createTurnEndSprites = function() {
			if (!this._turnEndSprite) {
				this._turnEndSprite = new Sprite();
				this._turnEndSprite.anchor.x = 0.5;
				this._turnEndSprite.anchor.y = 1;
							
				this.addChild(this._turnEndSprite);
			}
		};	
	}	
	
	
	
	function Sprite_Player() {
        this.initialize.apply(this, arguments);
		
    }

    Sprite_Player.prototype = Object.create(Sprite_Character.prototype);
    Sprite_Player.prototype.constructor = Sprite_Player;
	
	const UltraMode7_Sprite_Player_prototype_update = Sprite_Player.prototype.update;
	Sprite_Player.prototype.update = function(){
		if((!$gameMap || !$gameMap._interpreter || !$gameMap._interpreter.isRunning()) && ENGINE_SETTINGS.CURSOR_TINT_INFO && ENGINE_SETTINGS.CURSOR_TINT_INFO.enabled && $gameTemp.summaryUnit){
			this.setBlendColor(ENGINE_SETTINGS.CURSOR_TINT_INFO.colors[$gameSystem.getFactionId($gameTemp.summaryUnit)]);
		} else {
			this.setBlendColor([0, 0, 0, 0]);
		}	
		if (!UltraMode7.isActive())
		{
			UltraMode7_Sprite_Player_prototype_update.call(this);
			return;
		}
		if (!!this._character)
		{
			this._ultraMode7PreUpdate();
		}
		UltraMode7_Sprite_Player_prototype_update.call(this);
		if (!!this._character)
		{
			this._ultraMode7Update();
		}
			
	};
	
	Sprite_Player.prototype.updatePosition = function() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		this.z = this._character.screenZ();
		
		if($gamePlayer.followedEvent && $gameTemp.followMove){			
			this.y = this.y + ($gamePlayer.followedEvent._floatOffset);		
		} else if($gameTemp.movingCursorByScript){
			var newUnit = $statCalc.activeUnitAtPosition({x: this._character._x, y: this._character._y});
			var prevUnit = $statCalc.activeUnitAtPosition({x: this._character._prevX, y: this._character._prevY});
			if(newUnit){
				this.y = this.y + newUnit.event._floatOffset;		
				//console.log(1);	
			} else if(prevUnit){
				this.y = this.y + prevUnit.event._floatOffset;		
				//console.log(0);
			}
		} else {
			var prevUnit = $statCalc.activeUnitAtPosition({x: this._character._prevX, y: this._character._prevY});
			var prevHoverState = prevUnit && $statCalc.isFlying(prevUnit);
			var newUnit = $statCalc.activeUnitAtPosition({x: this._character._x, y: this._character._y});
			var newHoverState = newUnit && $statCalc.isFlying(newUnit);
			if(newUnit && newUnit.event.transitioningFloat){
				this.y = this.y + newUnit.event._floatOffset;		
			} else if(prevHoverState == newHoverState){
				if(prevHoverState){
					this.y = this.y + (newUnit.event._floatOffset);
				}			
			} else if(prevHoverState || newHoverState ){
				var floatOffset = 0;
				if(prevHoverState && prevUnit){
					floatOffset = prevUnit.event._floatOffset;
				}
				if(newHoverState && newUnit){
					floatOffset = newUnit.event._floatOffset;
				}
				
				var delta = 0;
				if(this._character._x != this._character._realX || this._character._y != this._character._realY){				
					if(this._character._x != this._character._realX){
						delta = Math.abs(this._character._x - this._character._realX);
					} else if(this._character._y != this._character._realY){
						delta = Math.abs(this._character._y - this._character._realY);
					}				
				}
				var ratio;
				if(newHoverState){
					ratio = 1 - delta;
				} else {
					ratio = 0 + delta;
				}
				this.y = this.y + (floatOffset * ratio);
			}
		}	
	};
	
//====================================================================
// ●Sprite_MapEffect
//====================================================================	
	
	function Sprite_MapEffect() {
		this.initialize.apply(this, arguments);
	}

	Sprite_MapEffect.prototype = Object.create(Sprite_Base.prototype);
	Sprite_MapEffect.prototype.constructor = Sprite_MapEffect;

	Sprite_MapEffect.prototype.initialize = function(spriteInfo, position) {
		Sprite_Base.prototype.initialize.call(this);		
		this.bitmap =  ImageManager.loadNormalBitmap('img/SRWMapEffects/'+spriteInfo.name+".png");
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this._animationFrame = 0;
		this.visible = false;
		this._frameSize = spriteInfo.frameSize;
		this._sheetHeight = spriteInfo.sheetHeight;
		this._sheetWidth = spriteInfo.sheetWidth;
		this._frames = spriteInfo.frames;
		this._frameCounter = 0;
		this._animationSpeed = spriteInfo.animationSpeed || 2;
		this._position = position;
		this._positionOffset = spriteInfo.offset || {x: 0, y: 0}
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_MapEffect.prototype.updatePosition = function() {
		this.x = this._position.x + this._positionOffset.x;
		this.y = this._position.y + this._positionOffset.y;
		this.z = 999;
	}
	
	Sprite_MapEffect.prototype.update = function() {	
		this.updatePosition();
		if(this._animationFrame > this._frames){
			this.visible = false;
			this.parent.removeChild(this);
		} else {								
			this.visible = true;
			var col = this._animationFrame % this._sheetWidth;
			var row = Math.floor(this._animationFrame / this._sheetWidth);
			this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
			this._frameCounter++;
			if(this._frameCounter >= this._animationSpeed){
				this._animationFrame+=$gameSystem.getBattleSpeed();
				this._frameCounter = 0;
			}				
		}			
	};	
	
	function Sprite_MapAttack() {
		this.initialize.apply(this, arguments);
	}

	Sprite_MapAttack.prototype = Object.create(Sprite_MapEffect.prototype);
	Sprite_MapAttack.prototype.constructor = Sprite_MapAttack;
	
	Sprite_MapAttack.prototype.updatePosition = function() {
		this.scale.x = 1;
		this.scale.y = 1;		
		var offset = JSON.parse(JSON.stringify(this._positionOffset));
		if($gameTemp.mapTargetDirection == "left"){
			offset.x*= -1;
			this.scale.x = -1;	
		}
		if($gameTemp.mapTargetDirection == "up" || $gameTemp.mapTargetDirection == "down"){
			var tmp = offset.x;
			offset.x = offset.y;
			offset.y = tmp;
			this.scale.y = -1;		
		}
		if($gameTemp.mapTargetDirection == "up"){
			offset.y*= -1;
		}		
		this.x = this._position.x + offset.x;
		this.y = this._position.y + offset.y;
		this.z = 999;
	}
	
//====================================================================
// ●Sprite_WillIndicator
//====================================================================	
	
	function Sprite_WillIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_WillIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_WillIndicator.prototype.constructor = Sprite_WillIndicator;

	Sprite_WillIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;		
		this.text = new PIXI.Text('',
		{
		  fontFamily : 'Arial',
		  fontSize: "13px",
		  fill : 0xffffff,
		  cacheAsBitmap: true, // for better performance
		  height: 30,
		  width: 20,
		});
		this.addChild(this.text);
		this._previousEventType = -1;
	};

	Sprite_WillIndicator.prototype.update = function() {
		var type = this._character.isType();
		this._isEnemy = type === 'enemy'
		if(this._previousEventType != type){
			this._previousEventType = type;
			if(this._isEnemy){
				this.bitmap = ImageManager.loadSystem('WillIndicatorEnemy');
			} else {
				this.bitmap = ImageManager.loadSystem('WillIndicator');
			}
		}		
		
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		
		 
		if(this._isEnemy){
			this.text.anchor.set(0); 
			this.text.x = -23; 
			this.text.y = -49.5	;
		} else {
			this.text.anchor.set(1); 
			this.text.x = 23; 
			this.text.y = -33.5	;
		}	
		
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if($gameSystem.showWillIndicator && battlerArray){
			var unit = battlerArray[1];
			if(unit && !this._character.isErased()){
				this.opacity = 255;
				var maxWill = $statCalc.getMaxWill(unit);
				var will = $statCalc.getCurrentWill(unit);
				//this.drawText(will, 0, 0, 20);
				this.text.text = will;
				var color = "#ffffff";				
				if(will < 100){
					color = "#f1de55";
				} 
				if(will <= 50){
					color = "#ff2222";
				}
				if(will == maxWill){
					color = "#00f1ff";
				}
				this.text.style.fill = color;
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};
	
//====================================================================
// ●Sprite_BasicShadow
//====================================================================	
	
	function Sprite_BasicShadow() {
		this.initialize.apply(this, arguments);
	}

	Sprite_BasicShadow.prototype = Object.create(Sprite_Base.prototype);
	Sprite_BasicShadow.prototype.constructor = Sprite_BasicShadow;

	Sprite_BasicShadow.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadPicture('flight_shadow');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
	};

	Sprite_BasicShadow.prototype.update = function() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if(battlerArray){
			if (this._character._characterName == "" || this._character._transparent || (!$statCalc.isFlying(battlerArray[1]) && this._character._floatOffset == 0)) {
				this.opacity = 0;
			} else {
				this.y-=this._character._floatOffset;
				this.opacity = this._character._opacity - 128;
			};
		} else {
			this.opacity = 0;
		}		
	};

//====================================================================
// ●Sprite_DefendIndicator
//====================================================================	
	
	function Sprite_DefendIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_DefendIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_DefendIndicator.prototype.constructor = Sprite_DefendIndicator;

	Sprite_DefendIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('shield');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_DefendIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 2;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			var isShown = true;
			if(!$gameSystem.isEnemy(unit)){
				if(!$gameTemp.showAllyDefendIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() + 15;
			} else {
				if(!$gameTemp.showEnemyDefendIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() - 15;
			}
			if($gameSystem.isBattlePhase() === 'AI_phase' || $gameSystem.isSubBattlePhase() === 'actor_target'){
				var activeEvent = $gameTemp.activeEvent();
				if(activeEvent){
					var actor = $gameSystem.EventToUnit(activeEvent.eventId())[1];
					if($gameSystem.isFriendly(actor, $gameSystem.getFactionId(unit))){
						if(!actor || !$statCalc.canSupportDefend(actor, unit)){
							isShown = false;
						}
					} else {
						if(!$statCalc.hasSupportDefend(unit)){
							isShown = false;
						}
					}					
				} else {
					isShown = false;
				}
			} else {
				if($gameTemp.summaryUnit && !$statCalc.canSupportDefend($gameTemp.summaryUnit, unit)){
					isShown = false;
				}
			}
			if(!$gameTemp.summaryUnit){
				isShown = false;
			}
			if(isShown && unit && !this._character.isErased()){
			
				this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}
				
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};
	
//====================================================================
// ●Sprite_AttackIndicator
//====================================================================	
	
	function Sprite_AttackIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_AttackIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_AttackIndicator.prototype.constructor = Sprite_AttackIndicator;

	Sprite_AttackIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('sword');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_AttackIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 2;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			var isShown = true;
			if(!$gameSystem.isEnemy(unit)){
				if(!$gameTemp.showAllyAttackIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() - 15;
			} else {
				if(!$gameTemp.showEnemyAttackIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() + 15;
			}
			
			if($gameSystem.isBattlePhase() === 'AI_phase' || $gameSystem.isSubBattlePhase() === 'actor_target'){
				var activeEvent = $gameTemp.activeEvent();
				if(activeEvent){
					var actor = $gameSystem.EventToUnit(activeEvent.eventId())[1];
					if($gameSystem.isFriendly(actor, $gameSystem.getFactionId(unit))){
						if(!actor || !$statCalc.canSupportAttack(actor, unit)){
							isShown = false;
						}
					} else {
						if(!$statCalc.hasSupportAttack(unit)){
							isShown = false;
						}
					}
				} else {
					isShown = false;
				}				
			} else {
				if(!$gameTemp.summaryUnit || !$statCalc.canSupportAttack($gameTemp.summaryUnit, unit)){
					isShown = false;
				}
			}
			if(!$gameTemp.summaryUnit){
				isShown = false;
			}
			
			if(isShown && unit && !this._character.isErased()){
			
				this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}
				
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};	
	
//====================================================================
// ●Sprite_TwinIndicator
//====================================================================	
	
	function Sprite_TwinIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_TwinIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_TwinIndicator.prototype.constructor = Sprite_TwinIndicator;

	Sprite_TwinIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('twin');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_TwinIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 30;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			if(!$gameSystem.isEnemy(unit)){				
				this.x = this._character.screenX() - 15;
			} else {
				this.x = this._character.screenX() + 15;
			}		
			
			if($statCalc.isMainTwin(unit) && unit && !this._character.isErased()){
			
				/*this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}*/
				this.opacity = 255;
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};	
		
	
//====================================================================
// Sprite_Destroyed
//====================================================================	
	
	function Sprite_Destroyed() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Destroyed.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Destroyed.prototype.constructor = Sprite_Destroyed;

	Sprite_Destroyed.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		this._character = character;
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		
		this._sheetHeight = 3;
	
		this._frameCounter = 0;
		
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Destroyed.prototype.setCharacter = function(character){
		this._character = character;
	}

	Sprite_Destroyed.prototype.update = function() {
		if(this._character.manuallyErased){
			return;
		}
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if((!this._character._destroySpriteInitialized || !this._initialized) && battlerArray && battlerArray[1]){
			this._character._destroySpriteInitialized = true;
			this._initialized = true;
			var animInfo = $statCalc.getDestroyAnimInfo(battlerArray[1]);
			this.bitmap =  ImageManager.loadAnimation(animInfo.name);
			this._frameSize = animInfo.frameSize;
			this._sheetWidth = animInfo.sheetWidth;
			this._frames = animInfo.frames;
			this._animationSpeed = animInfo.speed;
			this._disappearFrame = animInfo.disappearFrame;
			this._se = animInfo.se;
		}
		
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingDeathAnim = false;
			this._processedDeath = false;
			this._animationFrame = 0;
		} else {
			var eventId = this._character.eventId();
			var battlerArray = $gameSystem.EventToUnit(eventId);
			
			if(this._animationFrame == this._disappearFrame && !this._processedDeath){
				this._processedDeath = true;
				if(this._character.isDoingSubTwinDeath){
					$statCalc.swapEvent(this._character, true);
					//_this._currentDeath.event.appear();
					//this._character.refreshImage();
					$statCalc.getMainTwin(battlerArray[1]).subTwin = null;
				} else if(this._character.isDoingMainTwinDeath){	
					$statCalc.swapEvent(this._character, true);
					$statCalc.getMainTwin(battlerArray[1]).subTwin = null;
					//battlerArray[1].subTwin.isSubTwin = false;
					//battlerArray[1].subTwin = null;
				} else {	
					this._character.erase();	
				}							
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingDeathAnim) {
					if(this._animationFrame == 1){								
						if(!this.playingSE){
							this.playingSE = true;
							if(!this._character.silent){			
								var se = {};
								se.name = this._se;
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);
							}							
							this._character.silent = false;
						}							
					} else {
						this.playingSE = false;
					}
					
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter+=$gameSystem.getBattleSpeed();
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};	
	
//====================================================================
// Sprite_Appear
//====================================================================	
	
	function Sprite_Appear() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Appear.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Appear.prototype.constructor = Sprite_Appear;

	Sprite_Appear.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		
		this._character = character;
		
		
		this._initialized = false;
		
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		
		this._sheetHeight = 3;
		
		this._frameCounter = 0;
		
		
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Appear.prototype.setCharacter = function(character){
		this._character = character;
	}
	
	Sprite_Appear.prototype.erase = function() {
		this._initialized = false;
		this._erased = true;
		this.refresh();
	};

	Sprite_Appear.prototype.update = function() {
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if((!this._character._appearSpriteInitialized || !this._initialized) && battlerArray && battlerArray[1]){
			this._character._appearSpriteInitialized = true;
			this._initialized = true;
			var animInfo = $statCalc.getSpawnAnimInfo(battlerArray[1]);
			this.bitmap =  ImageManager.loadAnimation(animInfo.name);
			this._frameSize = animInfo.frameSize;
			this._sheetWidth = animInfo.sheetWidth;
			this._frames = animInfo.frames;
			this._animationSpeed = animInfo.speed;
			this._appearFrame = animInfo.appearFrame;
			this._se = animInfo.se;
		}
		
		
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingAppearAnim = false;
			this._animationFrame = 0;
		} else {
			if(this._animationFrame == this._appearFrame){
				this._character.appear();
				this._character.refreshImage();
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			
			
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingAppearAnim) {
					if(this._animationFrame == 0){
						if(!this.playingSE){
							this.playingSE = true;
							var se = {};
							se.name = this._se;
							se.pan = 0;
							se.pitch = 100;
							se.volume = 60;
							AudioManager.playSe(se);
						}
					} else {
						this.playingSE = false;
					}
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter+=$gameSystem.getBattleSpeed();;
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};	

//====================================================================
// Sprite_Disappear
//====================================================================	
	
	function Sprite_Disappear() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Disappear.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Disappear.prototype.constructor = Sprite_Disappear;

	Sprite_Disappear.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		this.bitmap =  ImageManager.loadAnimation('SRWDisappear');
		this._character = character;
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		this._frameSize = 192;
		this._sheetHeight = 3;
		this._sheetWidth = 5;
		this._frames = 8;
		this._frameCounter = 0;
		this._animationSpeed = 2;
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Disappear.prototype.setCharacter = function(character){
		this._character = character;
	}

	Sprite_Disappear.prototype.update = function() {
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingDisappearAnim = false;
		} else {
			if(this._animationFrame == 3){
				this._character.erase();
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			var eventId = this._character.eventId();
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingDisappearAnim) {
					if(this._animationFrame == 0){
						if(!this.playingSE){
							this.playingSE = true;
							var se = {};
							se.name = 'SRWDisappear';
							se.pan = 0;
							se.pitch = 100;
							se.volume = 60;
							AudioManager.playSe(se);
						}
					} else {
						this.playingSE = false;
					}
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter+=$gameSystem.getBattleSpeed();;
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};		
	
	
//====================================================================
// Sprite_Reticule
//====================================================================	
	
	function Sprite_Reticule() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Reticule.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Reticule.prototype.constructor = Sprite_Reticule;

	Sprite_Reticule.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap =  ImageManager.loadPicture('reticule');
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this._duration = 8;
		this._holdDuration = 16;
	};
	
	Sprite_Reticule.prototype.start = function(info) {
		this._time = 0;
		this._actorEvent = info.actor;
		this._targetActorEvent = info.targetActor;
	}

	Sprite_Reticule.prototype.update = function() {
		function lerp(start, end, t){
		//	t => 1-(--t)*t*t*t;
			return start + (end - start) * t;
		}
		
		if(this._time > this._duration){
			if(this._time < this._duration + this._holdDuration){
				var scaleFactor = 1.05 + (Math.sin((this._time - this._duration) / 2) / 15);
				this.scale.x = scaleFactor;
				this.scale.y = scaleFactor;
			} else {
				$gameTemp.reticuleInfo = null;
				this._actorEvent = null;
				this._targetActorEvent = null;
				this._time = 0;
				this.scale.x = 1;
				this.scale.y = 1;
			}			
		}
		if(this._actorEvent && this._targetActorEvent){	
			if(this._time <= this._duration){
				this.visible = true;
				this.x = lerp(this._actorEvent.screenX(), this._targetActorEvent.screenX(), this._time / this._duration);
				this.y = lerp(this._actorEvent.screenY() - 24, this._targetActorEvent.screenY() - 24, this._time / this._duration);				
			}
			this._time+=$gameSystem.getBattleSpeed();
		} else if($gameTemp.reticuleInfo){
			this.start($gameTemp.reticuleInfo);
		} else {	
			this.visible = false;
		}		
	};
//====================================================================
// Sprite_SrpgGrid
//====================================================================	
	
	function Sprite_SrpgGrid() {
		this._isProjected = true;
		this._blendAdditive = true;
		this.initialize.apply(this, arguments);		
	}

	Sprite_SrpgGrid.prototype = Object.create(Sprite_Base.prototype);
	Sprite_SrpgGrid.prototype.constructor = Sprite_SrpgGrid;

	Sprite_SrpgGrid.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap = new Bitmap($gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());
		for(var i = 0; i < $gameMap.width(); i++){
			this.bitmap.fillRect(i * $gameMap.tileWidth(), 0, 1 , this.bitmap.height, "white");
		}
		for(var i = 0; i < $gameMap.height(); i++){
			this.bitmap.fillRect(0, i * $gameMap.tileHeight(), this.bitmap.width , 1, "white");
		}
		
		this.anchor.x = 0;
		this.anchor.y = 0;
		this._posX = 0;
		this._posY = 0;
		//this.blendMode = Graphics.BLEND_ADD;
	};

	Sprite_SrpgGrid.prototype.update = function() {
		if($gameSystem.enableGrid && !$gameSystem.optionDisableGrid){
			this.opacity = 128;
		} else {
			this.opacity = 0;
		}		
		this.updatePosition();		
		//this.bitmap.fillAll('red');
	};
	
	Sprite_SrpgGrid.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		this.z = 0;
    };
	
	
//====================================================================
// Sprite_CloudScroll
//====================================================================	
	
	function Sprite_CloudScroll() {
		this.initialize.apply(this, arguments);
	}
	


	Sprite_CloudScroll.prototype = Object.create(TilingSprite.prototype);
	Sprite_CloudScroll.prototype.constructor = Sprite_CloudScroll;
	
	const Sprite_CloudScroll_prototype_updateBitmap = Sprite_CloudScroll.prototype.updateBitmap;
	Sprite_CloudScroll.prototype.updateBitmap = function()
	{
		const imageChanged = this.isImageChanged();
		Sprite_CloudScroll_prototype_updateBitmap.call(this);
		if (UltraMode7.isActive() && imageChanged && this.bitmap)
		{
			this.bitmap.smooth = !UltraMode7.CHARACTERS_PIXELATED;
		}
	};

	Sprite_CloudScroll.prototype.initialize = function(x, y) {
		TilingSprite.prototype.initialize.call(this, new Bitmap());
		//this.width = 960;
		//this.height = 960;
		this.anchor.x = 0;
		this.anchor.y = 0;
		if(UltraMode7.isActive()){
			this.anchor.y = 1;
		}
		this._posX = x;
		this._posY = y;
		//$gameSystem.cloudScrollSource = "Clouds1"
		//this.blendMode = Graphics.BLEND_ADD;
	};

	Sprite_CloudScroll.prototype.update = function() {	
		if(!(this._posY % ($gameSystem.cloudScrollFrequency || 5))){
			this.opacity = 255;
		} else {
			this.opacity = 0;
			return;
		}	
		if(this._src != $gameSystem.cloudScrollSource){
			this._src = $gameSystem.cloudScrollSource;
			if(this._src == ""){				
				this.bitmap = new Bitmap();	
			} else {				
				this.bitmap = ImageManager.loadParallax($gameSystem.cloudScrollSource);
			}			
		}  
		
		
		var xSpeed = $gameSystem.cloudScrollXSpeed || 0;
		var ySpeed = $gameSystem.cloudScrollYSpeed || 0;
		this.updatePosition();
		
		this.scale.x = 1;
		this.scale.y = 1;
		
		if(UltraMode7.isActive()){
			const screenScale = UltraMode7.mapToScreenScale(this.screenX(), this.screenY());			
			this.scale.x = screenScale;
			this.scale.y = screenScale;
		}		
		
		this.origin.x -= xSpeed;
		this.origin.y -= ySpeed;
		TilingSprite.prototype.update.call(this);			
		/*if(this._posX + 20 > $gameMap.width()){
			this.bitmap.clearRect((($gameMap.width() - this._posX) * 48),0, 960, 960);
		}	
		
		if(this._posY + 20 > $gameMap.height()){
			//this.bitmap.clearRect(0,(($gameMap.height() - this._posY) * 48), 960, 960);
			var overflow = (($gameMap.height() - this._posY) * 48);
			this.setFrame(0,overflow,960, 960 - overflow);
		}*/
		//this.bitmap.fillAll('red');
	};
	
	Sprite_CloudScroll.prototype.screenX = function() {
		var tileWidth = $gameMap.tileWidth();
		return Math.round($gameMap.adjustX(this._posX) * tileWidth + tileWidth / 2);
	}
	
	Sprite_CloudScroll.prototype.screenY = function() {
		var tileHeight = $gameMap.tileHeight();
		return Math.round($gameMap.adjustY(this._posY) * tileHeight + tileHeight +$gameMap.height());//-  this.shiftY() - this.jumpHeight()
	}
	
	Sprite_CloudScroll.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		if(UltraMode7.isActive()){
			//console.log(this.screenX());
			
			let adjustedCoords = UltraMode7.mapToScreen(this.screenX(), this.screenY());		
			this.x = adjustedCoords.x;
			this.y = adjustedCoords.y;
		}
		this.z = 0;
    };	
	
	
//====================================================================
// Sprite_MapBorder
//====================================================================		
	
function Sprite_MapBorder() {
		this.initialize.apply(this, arguments);
	}

	Sprite_MapBorder.prototype = Object.create(Sprite_Base.prototype);
	Sprite_MapBorder.prototype.constructor = Sprite_MapBorder;

	Sprite_MapBorder.prototype.initialize = function(x, y, width, height) {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap = new Bitmap(width, height);
		this.bitmap.fillAll('black');
		this.width = width;
		this.height = height;
		this.anchor.x = 0;
		this.anchor.y = 0;
		this._posX = x;
		this._posY = y;
		//$gameSystem.cloudScrollSource = "Clouds1"
		//this.blendMode = Graphics.BLEND_ADD;
	};

	Sprite_MapBorder.prototype.update = function() {		
		if((typeof UltraMode7 != "undefined") && UltraMode7.isActive()){
			this.opacity = 0;
			return;
		}
		this.updatePosition();
		
	};
	
	Sprite_MapBorder.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		
		this.z = 0;
    };		

//====================================================================
// Sprite_AreaHighlights
//====================================================================	
	
	function Sprite_AreaHighlights() {
		
		this.initialize.apply(this, arguments);
		this._isProjected = true;
	}

	Sprite_AreaHighlights.prototype = Object.create(Sprite_Base.prototype);
	Sprite_AreaHighlights.prototype.constructor = Sprite_AreaHighlights;
	
	


	Sprite_AreaHighlights.prototype.initialize = function(layer, subId) {
		Sprite_Base.prototype.initialize.call(this);
		/*for(var i = 0; i < $gameMap.width(); i++){
			this.bitmap.fillRect(i * $gameMap.tileWidth(), 0, 1 , this.bitmap.height, "white");
		}
		for(var i = 0; i < $gameMap.height(); i++){
			this.bitmap.fillRect(0, i * $gameMap.tileHeight(), this.bitmap.width , 1, "white");
		}*/
		this._layer = layer;
		this._subId = subId;
		this.bitmap = new Bitmap($gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());
		
		this.anchor.x = 0;
		this.anchor.y = 0;
		this._posX = 0;
		this._posY = 0;
		//this.opacity = 128;
		//this.blendMode = Graphics.BLEND_ADD;
		this._frameCount = 0;
		this._animCounter = 1;
		this._animInfo = [];
		this.construct();
	};
	
	Sprite_AreaHighlights.prototype.shuffleAnimTiles = function(){
		let array = this._animInfo;		
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	
	Sprite_AreaHighlights.prototype.construct = function() {
		var _this = this;
		this.projectedTexture = null;
		if(!this._animInfo){
			this._animInfo = [];
		}
	
		this.bitmap.clearRect(0, 0, $gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());	
			
			
		if(this._layer == "1"){
			if($gameSystem.highlightedMapRetargetTiles){
				for(var i = 0; i < $gameSystem.highlightedMapRetargetTiles.length; i++){
					var highlight = $gameSystem.highlightedMapRetargetTiles[i];
					this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
				}
			}
		} else if(this._layer == "region"){
			if($gameSystem.regionHighlights){
				Object.keys($gameSystem.regionHighlights).forEach(function(regionId){
					var color = $gameSystem.regionHighlights[regionId];
					var tileCoords = $gameMap.getRegionTiles(regionId);
					for(var i = 0; i < tileCoords.length; i++){
						var highlight = tileCoords[i];
						_this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), color);
					}
				});			
			}
		} else if(this._layer == "move_edge"){
			if($gameSystem.moveEdgeHighlights){
				for(var i = 0; i < $gameSystem.moveEdgeHighlights.length; i++){
					var highlight = $gameSystem.moveEdgeHighlights[i];
					this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
				}		
			}
		} else if(this._layer == "ability_zone"){
			let zoneInfo = $gameSystem.getAbilityZone(this._subId);
			if(zoneInfo && zoneInfo.phaseCount > 0){
				let center = zoneInfo.center;
				for(var i = 0; i < zoneInfo.pattern.length; i++){
					var highlight = zoneInfo.pattern[i];
					this.bitmap.fillRect((center.x + highlight.x) * $gameMap.tileWidth(), (center.y + highlight.y) * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), zoneInfo.color);
				}	
			}
			
		} else {
			if($gameSystem.highlightedTiles){
				for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
					var highlight = $gameSystem.highlightedTiles[i];
					this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
				}
			}	
			
			if($gameSystem.highlightedActionTiles){
				for(var i = 0; i < $gameSystem.highlightedActionTiles.length; i++){
					var highlight = $gameSystem.highlightedActionTiles[i];
					this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
				}
			}
		}	
	}

	Sprite_AreaHighlights.prototype.update = function() {
		if(this._layer == "0" && $gameSystem.highlightsRefreshed){
			$gameSystem.highlightsRefreshed = false;
			this.construct();
		}	
		
		if(this._layer == "1" && $gameSystem.highlightsLayer1Refreshed){
			$gameSystem.highlightsLayer1Refreshed = false;
			this.construct();
		}
		
		if(this._layer == "region" && $gameSystem.regionHighlightsRefreshed){
			$gameSystem.regionHighlightsRefreshed = false;
			this.construct();
		}
		
		if(this._layer == "move_edge" && $gameSystem.moveEdgeHighlightsRefreshed){
			$gameSystem.moveEdgeHighlightsRefreshed = false;
			this.construct();
		}
		
		if(this._layer == "ability_zone" && $gameSystem.abilityZoneNeedsRefresh(this._subId)){
			$gameSystem.clearAbilityZoneNeedsRefresh(this._subId);
			for(let tile of this._animInfo){
				tile.isLeaving = true;
			}
			this.construct();
		}
		
		
		this.updatePosition();	
		if(this._layer == "move_edge"){
			if(!$gameSystem.showMoveEdge){
				this.opacity = 0;
			} else {
				this.opacity = 175;
			}			
		} else if(this._layer != "region" && $gameTemp.disableHighlightGlow){
			this.opacity = 100;
		} else {
			this._frameCount+=2;
			this._frameCount %= 200;
			if(this._frameCount < 100){
				this.opacity = this._frameCount + 80;
			} else {
				this.opacity = 200 + 80 - this._frameCount;
			}
		}	

	};
	
	Sprite_AreaHighlights.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		this.z = 0;
    };
	
	
	