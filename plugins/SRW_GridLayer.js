//================================================================
// RS_Gridlayer.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2015 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================


//var Imported = Imported || {};
//Imported.RS_Gridlayer = true;

(function () {

  var parameters = $plugins.filter(function(i) {
    return i.description.contains("<RS_Gridlayer>");
  })

  parameters = (parameters.length > 0) && parameters[0].parameters;

  var params = [
    String(eval(parameters["Version"] || '1.0')),
    Number(parameters['fontSize'] || 14),
    String(parameters['textColor'] || "rgb(56, 150, 119)"),
    String(parameters['outlineColor'] || "rgb(255, 255, 255)"),
    Number(parameters['outlineWidth'] || 2),
    String(parameters['defaultText'] || 'Version : '),
    String(parameters['textAlign'] || 'right'),
    Boolean(parameters['visible'] === 'true'),
    Number(parameters['opacity'] || 255),
    String(parameters['Position'] || 'Top'),
    false
  ];

  //----------------------------------------------------------------------------
  // Gridlayer
  //
  //

  function Gridlayer() {
    this.initialize.apply(this, arguments);
  };

  Gridlayer.prototype = Object.create(Sprite.prototype);
  Gridlayer.prototype.constructor = Gridlayer;

  Gridlayer.prototype.initialize = function (bitmap) {
    Sprite.prototype.initialize.call(this, bitmap);
    this.refresh();
  };

  Gridlayer.prototype.refresh = function () {
    if(!this.bitmap) return;
    var width = this.bitmap.width;
    var height = this.bitmap.height;
    this.visible = true;
    this.opacity = 255;
    this.bitmap.clear();
   /* this.bitmap.fontSize = params[1];
    this.bitmap.textColor = params[2];
    this.bitmap.outlineColor = params[3];
    this.bitmap.outlineWidth = params[4];*/
    //this.bitmap.drawText(params[5] + ' ' + params[0], 0, 0, width, height, params[6]);
	this.bitmap.fillRect(0 ,0, 48, 48, "#FFFFFF");
  };

  Gridlayer.prototype.update = function () {
    Sprite.prototype.update.call(this);
    if(params[10]) {
      this.refresh();
      params[10] = false;
    }
  };

  //----------------------------------------------------------------------------
  // Scene_Base
  //
  //

  var alias_Scene_Base_create = Scene_Base.prototype.create;
  Scene_Base.prototype.create = function() {
    alias_Scene_Base_create.call(this);
    this.createGridlayer();
  };

  var alias_Scene_Base_start = Scene_Base.prototype.start;
  Scene_Base.prototype.start = function () {
    alias_Scene_Base_start.call(this);
    this.addGridlayer();
  };

  var alias_Scene_Base_terminate = Scene_Base.prototype.terminate;
  Scene_Base.prototype.terminate = function () {
	if(alias_Scene_Base_terminate) alias_Scene_Base_terminate.call(this);
	this.removeChild(this._Gridlayer);
  };

  Scene_Base.prototype.createGridlayer = function () {
	this._Gridlayer = new Gridlayer(new Bitmap(Graphics.boxWidth, 20));
  };

  Scene_Base.prototype.addGridlayer = function () {
	var length = this.children.length;
	this.addChildAt(this._Gridlayer, length);
  };

  //----------------------------------------------------------------------------
  // Game_Interpreter
  //
  //

})();
