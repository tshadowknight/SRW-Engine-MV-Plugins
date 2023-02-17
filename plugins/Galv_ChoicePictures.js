//-----------------------------------------------------------------------------
//  Galv's Choice Pictures
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ChoicePictures.js
//-----------------------------------------------------------------------------
//  2017-09-17 - Version 1.2 - Added code to remove an overwrite
//  2017-03-01 - Version 1.1 - made compatible with HIME hidden choices
//  2016-12-10 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ChoicePictures = true;

var Galv = Galv || {};                  // Galv's main object
Galv.CPICS = Galv.CPICS || {};          // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.2) Displays different pictures depending on which choice is highlighted.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Choice Picture Id
 * @desc The "Picture Id' that will be used when displaying choice pictures.
 * @default 1
 *
 * @help
 *   Galv's Choice Pictures
 * ----------------------------------------------------------------------------
 * This plugin allows you to set up pictures that can display when certain
 * choices are highlighted. To do this, you need to add a tag to each choice
 * in a 'Show Choices' event command.
 *
 *   <p:imageName,x,y>     // imageName is the image name from /img/pictures/
 *                         // x,y is the screen x,y location based on the
 *                         // center origin of the image.
 *
 * This will create images using the image id specified in the plugin settings
 * meaning it will replace any picture you created previsouly using that id.
 * ----------------------------------------------------------------------------
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.CPICS.pidId = Number(PluginManager.parameters('Galv_ChoicePictures')["Choice Picture Id"]);
Galv.CPICS.picList = [];

Galv.CPICS.getPics = function() {
	Galv.CPICS.picList = [];
	if (!$gameMessage._choices) return;
	for (var i = 0; i < $gameMessage._choices.length; i++) {
		var txt = $gameMessage._choices[i].match(/<p:(.*)>/i);
		if (txt) Galv.CPICS.setPic(i,txt);
	}
};

Galv.CPICS.setPic = function(index,txt) {
	$gameMessage._choices[index] = $gameMessage._choices[index].replace(txt[0],'');
	var opts = txt[1].split(',');
	Galv.CPICS.picList[index] = {img:opts[0],x:Number(opts[1]),y:Number(opts[2])};
};

Galv.CPICS.showPic = function(obj) {
	$gameScreen.showPicture(Galv.CPICS.pidId, obj.img, 1, obj.x, obj.y, 100, 100, 255, 0);
};

Galv.CPICS.erasePic = function(obj) {
	$gameScreen.erasePicture(Galv.CPICS.pidId);
};


//-----------------------------------------------------------------------------
//  WINDOW CHOICE
//-----------------------------------------------------------------------------

Galv.CPICS.Window_ChoiceList_callUpdateHelp = Window_ChoiceList.prototype.callUpdateHelp;
Window_ChoiceList.prototype.callUpdateHelp = function() {
	Galv.CPICS.Window_ChoiceList_callUpdateHelp.call(this);
	var i = this.index();
	if (this.active && Galv.CPICS.picList[i]) {
        Galv.CPICS.showPic(Galv.CPICS.picList[i]);
    } else {
		Galv.CPICS.erasePic();
	}
};

Galv.CPICS.Window_ChoiceList_start = Window_ChoiceList.prototype.start;
Window_ChoiceList.prototype.start = function() {
	Galv.CPICS.getPics();
	Galv.CPICS.Window_ChoiceList_start.call(this);
};

})();


if (Imported.HiddenChoiceConditions) {
// HIME hide choices
Galv.CPICS.Window_ChoiceList_makeCommandList = Window_ChoiceList.prototype.makeCommandList;
Window_ChoiceList.prototype.makeCommandList = function() {
	Galv.CPICS.Window_ChoiceList_makeCommandList.call(this);
	Galv.CPICS.getPics();
	var needsUpdate = false;
	for (var i = 0; i < this._list.length; i++) {
		var txt = this._list[i].name.match(/<p:(.*)>/i);
		if (txt) {
			this._list[i].name = this._list[i].name.replace(txt[0],'');
			needsUpdate = true;
		}
	}
	if (needsUpdate) this.updatePlacement();
};
}