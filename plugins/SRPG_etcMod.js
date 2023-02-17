/*:
@plugindesc SRPGコンバータMVの細かいところを自分好みに改造
@author アンチョビ

@help
・移動タイルの見た目変更。
・アクターコマンドがステータスに被らないよう変更。
・カーソルをカーソルらしい移動に。
*/
(function(){    
    var _SRPG_Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function() {
        _SRPG_Spriteset_Map_createTilemap.call(this);
        this._srpgMoveTile = [];
        for (var i = 0; i < $gameSystem.spriteMoveTileMax(); i++) {
            this._srpgMoveTile[i] = new Sprite_SrpgMoveTile();
            this._baseSprite.addChild(this._srpgMoveTile[i]);
        }
    };
    
    function Sprite_SrpgMoveTile() {
        this.initialize.apply(this, arguments);
    }
    Sprite_SrpgMoveTile.prototype = Object.create(Sprite.prototype);
    Sprite_SrpgMoveTile.prototype.constructor = Sprite_SrpgMoveTile;
    Sprite_SrpgMoveTile.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.createBitmap();
        this._frameCount = 0;
        this._posX = -1;
        this._posY = -1;
        this.visible = false;
    };
    Sprite_SrpgMoveTile.prototype.isThisMoveTileValid = function() {
        return this._posX >= 0 && this._posY >= 0;
    }
    Sprite_SrpgMoveTile.prototype.setThisMoveTile = function(x, y, attackFlag) {
        this._frameCount = 0;
        this._posX = x;
        this._posY = y;
        var w = $gameMap.tileWidth();
        var h = $gameMap.tileHeight();
        if (attackFlag == true) {
            this.bitmap.fillRect(2, 2, w-4, h-4, 'red');
        } else {
            this.bitmap.fillRect(2, 2, w-4, h-4, 'blue');
        }
    }
    Sprite_SrpgMoveTile.prototype.clearThisMoveTile = function() {
        this._frameCount = 0;
        this._posX = -1;
        this._posY = -1;
    }
    Sprite_SrpgMoveTile.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this.isThisMoveTileValid()){
            this.updatePosition();
            this.updateAnimation();
            this.visible = true;
        } else {
            this.visible = false;
        }
    };
    Sprite_SrpgMoveTile.prototype.createBitmap = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };
    Sprite_SrpgMoveTile.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight;
    };
    Sprite_SrpgMoveTile.prototype.updateAnimation = function() {
        this._frameCount++;
        this._frameCount %= 40;
        var r = Math.PI / 20;
        var x = this._posX;
        var y = this._posY;
        var sin = Math.sin( r * ((this._frameCount + 40-(x*2+y*2)%40) % 40) );
        this.opacity = sin * 40 + 80;
    };
    
    var _Window_ActorCommand_update = Window_ActorCommand.prototype.update;
    Window_ActorCommand.prototype.update = function() {
        _Window_ActorCommand_update.call(this);
        if (this.x > Graphics.boxWidth - this.width) {
            this.x = Graphics.boxWidth - this.width;
        }
        if (this.y > Graphics.boxHeight - this.height - this.fittingHeight(4)) {
            this.y = Graphics.boxHeight - this.height - this.fittingHeight(4);
        }
    };
    
    var _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.call(this);
        this._curcnt = 0;
    };
    var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if (this._curcnt > 0) {
            this._curcnt--;
        }
        if ($gameSystem.isSRPGMode() == true) {
            if (!this.isMoving() && this.canMove() && !$gameTemp.isAutoMoveDestinationValid()) {
                if (this._curcnt <= 0) {
                    var direction = this.getInputDirection();
                    if (direction > 0) {
                        this.setMovementSuccess(this.canPass(this._x, this._y, direction));
                        if (this.isMovementSucceeded()) {
                            SoundManager.playCursor();
                            this.setDirection(direction);
                            this._x = $gameMap.roundXWithDirection(this._x, direction);
                            this._y = $gameMap.roundYWithDirection(this._y, direction);
                            this._realX = this._x;
                            this._realY = this._y;
                        } else {
                            this.setDirection(direction);
                            this.checkEventTriggerTouchFront(direction);
                        }
                        this._curcnt = 5;
                    }
                }
                return;
            }
        }
        _Game_Player_moveByInput.call(this);
    };
})();