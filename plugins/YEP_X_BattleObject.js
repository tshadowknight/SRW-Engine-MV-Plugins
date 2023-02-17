/*:
 * @plugindesc Adding "Battle Object" to Yanfly Action Sequence
 * 
 * @author Kenzaki Souji (@EYN_kenzaki)
 *
 *
 * @help
 * This plugin is to add functions to generate sprites during battle, 
 * which can be manuvered by various commands in Yanfly Action Sequence, created by Yanfly(http://yanfly.moe/)
 * Currently Action Sequence does not support animation such as an arrow flying from user to opponent. 
 * this plugin is created to supplement that.
 * ============================================================================
 * Generating Object
 *　============================================================================
 * Syntax: create object: [id], [bitmap], [base coordinate], [xoverhead], [yoverhead]
 *
 * [id]:the identifier for the battle object. 
 *      Please make sure there is no duplicate in an action sequence with same id.
 * [bitmap]:Name of the bitmap loaded onto the object. png file of this name needs to exist in pictures folder.
 * [base coordinate]:the base coordinate which overhead coordinates are added onto. if 'user' then it will base on the current position of the skill user.
 *　                  Otherwise, it will base on (0,0)
 * [xoverhead], [yoverhead]:The added value to the coordinate. For example, if base coordinate is 'user' and xoverhead is 10,
                            the object will created 10 pixel to the right of user coordinate.
 * ============================================================================
 * Removing Object
 * ============================================================================
 * Syntax: delete object: [id]
 *
 * deletes battle object with [id] from screen. 
 * 
 * ============================================================================
 * How to use the Objects
 * ============================================================================
 * Basically any Yanfly Action Sequence command should be able to be applied on Battle Object.（Confirmed with Move and Jump. if you need anything else and it's not working let me know）
 * Just change the "Target Typing" in Action Sequence to 'object [id]' and it should be applicable.
 * For example, a command that looks like this: 'move user: target, front base, 20'　
 * if you just change it to 'move object 1: target, front base, 20'　it will apply to Battle Object with id=1 instead of user.
 */

/*:ja
 * @plugindesc Yanfly Action Sequenceへの「Battle Object」機能追加
 * 
 * @author 剣崎宗二 
 *
 *
 * @help
 * Yanfly氏(http://yanfly.moe/)が制作したYanfly Action Sequenceに、新規の画像を生成し移動させるという機能を提供します。その仕様上、運用にはYanfly Battle Engine Coreが必要となります。
 * 想定される用途は、例えば実際に矢や銃弾が相手の方に飛んでいくアニメが作りたい、等です。
 * ============================================================================
 * 生成関連
 * ============================================================================
 * 書式: create object: [id], [bitmap], [base coordinate], [xoverhead], [yoverhead]
 *
 * [id]:画像の識別Id。自由な数字をつけていただいて構いませんが、同じアニメ内で重複がないようにしてください。
 * [bitmap]:bitmap名です。この名前のpngファイルが、pictures フォルダ内にある必要があります。
 * [base coordinate]:画像を表示する際の基準座標です。 user　の場合はスキルの使用者の座標、それ以外の場合(0,0)を基準にします。
 * [xoverhead], [yoverhead]:基準値に加算される数値です。例えば、base coordinateがuserであり、xoverheadが10であった場合、ユーザーのx座標から+10した位置に生成されます。
 * ============================================================================
 * 消去関連
 * ============================================================================
 * 書式: delete object: [id]
 *
 * [id]を持つオブジェクトを画面上から消去します。 
 * 
 * ============================================================================
 * 操作方法
 * ============================================================================
 * 基本、Action Sequenceで使えるコマンドは生成したオブジェクトに対して応用できるはずです。（確認済みなのはMoveとJump系）
 * Action Sequenceに於ける「Target Typing」の部分を object [id] とすれば、その画像に対して実行できます。
 * 例えば、move user: target, front base, 20　となっている移動コマンドを
 * move object 1: target, front base, 20　とすれば、同様にその画像を相手の前まで移動させられるようになります。
 */

//-----------------------------------------------------------------------------
// Sprite_BattleObject
//
// The sprite for displaying a battle object
(function () {

  function Sprite_BattleObject() {
    this.initialize.apply(this, arguments);
  }

  Sprite_BattleObject.prototype = Object.create(Sprite_Battler.prototype);
  Sprite_BattleObject.prototype.constructor = Sprite_BattleObject;

  Sprite_BattleObject.prototype.initialize = function (picName, id, x, y) {
    Sprite_Battler.prototype.initialize.call(this, null);
    var objbattler = new Game_Battler();
    objbattler._parentSpriteId = id;
    this.setBattler(objbattler);
    this._bitmapName = picName;
    this.bitmap = ImageManager.loadPicture(this._bitmapName);
    this._homeX = x;
    this._homeY = y;
    this._id = id;
    this.scale.x = -1;
  };

  Sprite_BattleObject.prototype.update = function () {
    Sprite_Base.prototype.update.call(this);
    this.updateMain();
    this.updateAnimation();
    this.updateFloat();
  };

  Sprite_BattleObject.prototype.updateVisibility = function () {
    Sprite_Base.prototype.updateVisibility.call(this);
  };

  Sprite_BattleObject.prototype.updateMain = function () {
    this.updateBitmap();
    this.updateMove();
    this.updatePosition();
  };

  Sprite_BattleObject.prototype.updateBitmap = function () {
    Sprite_Battler.prototype.updateBitmap.call(this);
  }

  //------Yanfly関連編集----
  var kzk_BattleManager_processActionSequence =
    BattleManager.processActionSequence;
  BattleManager.processActionSequence = function (actionName, actionArgs) {
    // Action Objects
    if (actionName === 'CREATE OBJECT') {
      return this.createActionObject(actionArgs);
    }
    if (actionName === 'DELETE OBJECT') {
      return this.deleteActionObject(actionArgs);
    }

    return kzk_BattleManager_processActionSequence.call(this,
      actionName, actionArgs);
  };

  BattleManager.createActionObject = function (actionArgs) {
    var objectIndex = Number(actionArgs[0]);
    var filename = actionArgs[1];
    var overheadX = Number(actionArgs[3]);
    var overheadY = Number(actionArgs[4]);
    var x = 0;
    var y = 0;
    if (actionArgs[2].toUpperCase() == "USER") {
      var subjectSprite = this._subject.battler();
      x = subjectSprite._homeX;
      y = subjectSprite._homeY;
    }

    var newSprite = new Sprite_BattleObject(filename, objectIndex, x + overheadX, y + overheadY);
    this._spriteset._battleField.addChild(newSprite);
    this._spriteset._battleObjectSprites[objectIndex] = newSprite;
  }

  BattleManager.deleteActionObject = function (actionArgs) {
    var objectIndex = Number(actionArgs[0]);
    var target = this._spriteset._battleObjectSprites[objectIndex];
    if (target) {
      this._spriteset._battleField.removeChild(target);
      this._spriteset._battleObjectSprites[objectIndex] = null;
    }
  }

  //SpriteSet
  var Spriteset_Battle_prototype_createEnemies = Spriteset_Battle.prototype.createEnemies;
  Spriteset_Battle.prototype.createEnemies = function () {
    Spriteset_Battle_prototype_createEnemies.call(this);
    this._battleObjectSprites = [];
  };

  var Spriteset_Battle_prototype_battlerSprites = Spriteset_Battle.prototype.battlerSprites;
  Spriteset_Battle.prototype.battlerSprites = function () {
    var original = Spriteset_Battle_prototype_battlerSprites.call(this);
    var filteredBattleObject = this._battleObjectSprites.filter(function (element, index, array) {
      return (element != null);
    });
    return original.concat(filteredBattleObject);
  };


  var kzk_BattleManager_getSprite = BattleManager.getSprite;
  BattleManager.getSprite = function (battler) {
    if (battler._parentSpriteId) {
      return this._spriteset._battleObjectSprites[battler._parentSpriteId];
    }
    else {
      return kzk_BattleManager_getSprite.call(this, battler);
    }
  };

  var kzk_BattleManager_makeActionTargets = BattleManager.makeActionTargets;
  BattleManager.makeActionTargets = function (string) {
    if (string.match(/OBJECT[ ](\d+)/i)) {
      var target = this._spriteset._battleObjectSprites[parseInt(RegExp.$1)];
      if (target) return [target._battler];
    }
    return kzk_BattleManager_makeActionTargets.call(this, string);
  };
})();