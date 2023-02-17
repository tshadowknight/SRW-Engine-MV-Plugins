//=============================================================================
// Bluebooth Plugins - Version Display
// BBS_VersionDisplay.js
//=============================================================================

//=============================================================================
 /*:
 * @title Version Display
 * @author Michael Morris (https://www.patreon.com/bluebooth)
 * @date May 29, 2017
 * @filename BBS_VersionDisplay.js
 * If you enjoy my work, consider supporting me on Patreon!
 *
 * https://www.patreon.com/bluebooth
 *
 * @plugindesc v1.02 Adds display of the game version to the title screen.
 * Special Thanks to Tsukihime for all the help.
 * Special Thanks to 'Ramza' Michael Sweeney for all the support.
 * 
 * ============================================================================
 * Parameters
 * ============================================================================
 * 
 * @param Game Version Number
 * @desc Game Version. Recommend using format [MILESTONE].[MAJOR].[MINOR]
 * Default: 1.0.0
 * @default 1.0.0
 * 
 * @param Game Version Font
 * @desc Font face for the version number. Leave blank to use standard. See help.
 * @default
 * 
 * @param Version Font Size
 * @desc Font size for the version number in the details window.
 * Default: 20
 * @default 20
 * 
 * @param Show Version Number?
 * @desc true to show version number, false to hide.  Useful if you want to store version
 * number without showing it.
 * Default: true
 * @default true
 * 
 * @param Version Text Color
 * @desc Version font color. Use system color name.
 * Leave blank to use standard color.
 * @default white
 * 
 * @param Version Outline Color
 * @desc Version text outline color. Use system color name.
 * Leave blank to use standard.
 * @default black
 * 
 * @param Version Outline Width
 * @desc Version text outline width. Use system color number, or leave blank
 * blank to use standard.
 * @default 8
 * 
 * @param Title Italic
 * @desc Version font in Italics?      YES: true      NO: false 
 * Default: false
 * @default false
 * 
 * @param Version Text Max Width
 * @desc Max width for the game version number label.  Can contain formulae!
 * Default Graphics.width / 3
 * @default Graphics.width / 3
 * 	
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *  - Free for use in non-commercial projects and commercial products with credits
 * 
 * @help
 * ============================================================================
 * Description
 * ============================================================================
 *
 * Adds the display of a customized version number to the Title Scene.  Exposes
 * a variable to get version number at any time in play.
 * 
 * Use script: $gameSystem.getVersion();
 * 
 * ============================================================================
 * Change Log
 * ============================================================================
 * 1.02 - Fixed display bug pointed out by Michael 'Ramza' Sweeney when using
 *		  different resolutions.
 * 1.01 - Plugin finished.
 * 
 */
//=============================================================================

//=============================================================================
var Imported = Imported || {} ;
var BBS = BBS || {};
Imported.VersionDisplay = 1;
BBS.VersionDisplay = BBS.VersionDisplay || {};

(function() {
	
   	//=============================================================================
	// Parameter Variables
	//=============================================================================
	var parameters = PluginManager.parameters('BBS_VersionDisplay');
	var pVersionNumber			= String(parameters['Game Version Number'] || '1.0.0');
	var pVersionFont			= String(parameters['Game Version Font'] || '').trim();
	var pFontSize 				= Number(parameters['Version Font Size'] || 20);
	var pShowVersionNumber		= eval(String(parameters['Show Version Number?'] || 'true'));
	
	var pVersionTextColor		= String(parameters['Version Text Color'] || 'white');
	var pVersionOutlineColor	= String(parameters['Version Outline Color'] || 'black');
	var pVersionOutlineWidth	= Number(parameters['Version Outline Width'] || 8);
	var pVersionItalic 			= eval(String(parameters['Title Italic'] || 'false'));
	var pVersionWidth			= String(parameters['Version Text Max Width'] || 'Graphics.width / 3');
	
	var _version = pVersionNumber;				// Track the current version of the game.
	var _saveVersion = pVersionNumber;			// Track the version of the game last saved.  This can be different from current game version.
	var _defaultVersion = "version 1.0.0";		// Value to use when no _version is found.
	
	//=============================================================================
	// Game_System
	//=============================================================================	
	Game_System.prototype.getVersion = function() {
		return _version;
	};
	
	Game_System.prototype.getSaveVersion = function() {
		return _saveVersion;
	};
	
	//=============================================================================
	// Scene_Title
	//=============================================================================
	var BBS_VD_Scene_Title_createForeground = Scene_Title.prototype.createForeground;
	Scene_Title.prototype.createForeground = function() {
		BBS_VD_Scene_Title_createForeground.call(this);
		if (pShowVersionNumber) {
			this.drawGameVersion();
		}
	};

	Scene_Title.prototype.drawGameVersion = function() {
		var x = Graphics.width - (Graphics.width / 3) - 18;
		var y = Graphics.height - 50;
		var maxWidth = eval(pVersionWidth); //Graphics.width / 3;
		
		// Handle customization options.
		this._gameTitleSprite.bitmap.fontSize = pFontSize;
		this._gameTitleSprite.bitmap.fontItalic = pVersionItalic;
		
		if(pVersionFont !== '') {
			this._gameTitleSprite.bitmap.fontFace = pVersionFont;	
		}
		if(pVersionTextColor !== '') {
			this._gameTitleSprite.bitmap.textColor = pVersionTextColor;
		}
		if(pVersionOutlineColor !== '') {
			this._gameTitleSprite.bitmap.outlineColor = pVersionOutlineColor;
		}
		if(pVersionOutlineWidth !== '') {
			this._gameTitleSprite.bitmap.outlineWidth = pVersionOutlineWidth;
		}
		
		// And finally... draw
		this._gameTitleSprite.bitmap.drawText(pVersionNumber, x, y, maxWidth, 48, 'right');
	};
	
	//=============================================================================
	// ConfigManager
	//=============================================================================	
	var bbs_vd_Configmanager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function() {
		var config = bbs_vd_Configmanager_makeData.call(this);
		config.saveVersion = _saveVersion;
		return config;
	};

	var bbs_vd_Configmanager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function(config) {
		bbs_vd_Configmanager_applyData.call(this, config);
		_saveVersion = this.readSaveVersion(config, 'saveVersion');
	};
	
	ConfigManager.readSaveVersion = function(config, name) {
		var value = config[name];
		if (value !== undefined) {
			return value;
		} else {
			return _defaultVersion;
		}
	};	
	
})(BBS.VersionDisplay);
//=============================================================================
// End of File
//=============================================================================