
export default function Sprite_Animation_Babylon(){
	this.initialize.apply(this, arguments);
}
Sprite_Animation_Babylon.prototype = Object.create(Sprite_Animation.prototype);
Sprite_Animation_Babylon.prototype.constructor = Sprite_Animation_Babylon;

Sprite_Animation_Babylon.prototype.setup = function(animation, mirror, delay, loop, noFlash, noSfx, rate) {
	this._animation = animation;
	this._mirror = mirror;
	this._delay = delay;
	this._loop = loop;
	this._noFlash = noFlash;
	this._noSfx = noSfx;
	if (this._animation) {
		this.remove();
		this.setupRate(rate);
		this.setupDuration();
		this.loadBitmaps();
		this.createSprites();
	}
};

Sprite_Animation_Babylon.prototype.setupRate = function(rate) {
    this._rate = rate || 4;
};


Sprite_Animation_Babylon.prototype.hasEnded = function() {
	return this._hasEnded;
};

Sprite_Animation_Babylon.prototype.setupDuration = function() {
	this._accumulator = 0;
    this._duration = this._animation.frames.length * this._rate + 1;
};

Sprite_Animation_Babylon.prototype.getFramesElapsed = function() {
	return Math.floor(this._accumulator / (1000 / 60));
};

Sprite_Animation_Babylon.prototype.update = function(deltaTime) {
	Sprite.prototype.update.call(this);
	this._accumulator+=deltaTime;
	this.updateMain();
	//this.updateFlash();
	this.updateScreenFlash();
	this.updateHiding();
	Sprite_Animation._checker1 = {};
	Sprite_Animation._checker2 = {};		
};

Sprite_Animation.prototype.updateScreenFlash = function() {
    if (this._screenFlashDuration > 0) {
        var d = this._screenFlashDuration--;
        if (this._screenFlashSprite) {
            this._screenFlashSprite.x = -this.absoluteX();
            this._screenFlashSprite.y = -this.absoluteY();
            this._screenFlashSprite.opacity *= (d - 1) / d;
            this._screenFlashSprite.visible = (this._screenFlashDuration > 0);
        }
    }
	if(this._screenFlashSprite && this._noFlash){
		 this._screenFlashSprite.visible = false;
	}
};

Sprite_Animation_Babylon.prototype.updateFlash = function() {
    if (this._flashDuration > 0) {
        var d = this._flashDuration--;
        this._flashColor[3] *= (d - 1) / d;
        //this._target.setBlendColor(this._flashColor);
    }
};

Sprite_Animation_Babylon.prototype.isPlaying = function() {
    return (this._duration - this.getFramesElapsed()) > 0;
};

Sprite_Animation_Babylon.prototype.currentFrameIndex = function() {
    return (this._animation.frames.length -
            Math.floor(((this._duration - this.getFramesElapsed()) + this._rate - 1) / this._rate));
};

Sprite_Animation.prototype.processTimingData = function(timing) {
    var duration = timing.flashDuration * this._rate;
    switch (timing.flashScope) {
    case 1:
        this.startFlash(timing.flashColor, duration);
        break;
    case 2:
        this.startScreenFlash(timing.flashColor, duration);
        break;
    case 3:
        this.startHiding(duration);
        break;
    }
    if (!this._duplicated && timing.se && !this._noSfx) {
        AudioManager.playSe(timing.se);
    }
};

Sprite_Animation_Babylon.prototype.updateMain = function() {
    if (this.isReady()) {
		if(this.isPlaying()){
			if (this._delay > 0) {
				this._delay--;
			} else {
				//this._duration--;
				this.updatePosition();
				if ((this._duration - this.getFramesElapsed()) % this._rate === 0) {
					this.updateFrame();
				}
			}
		} else if(this._loop){
			this.setupDuration();
		} else {
			this._hasEnded = true;
			this.visible = false;
		}        
    }
};

Sprite_Animation_Babylon.prototype.updatePosition = function() {	
	this.x = 1000 / 2;
	this.y = 1000 / 2;	
};