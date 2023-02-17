//=============================================================================
// Tile Changer (Shaz_TileChanger.js)
// by Shaz
// Last Updated: 2018.03.24 v1.10
//=============================================================================

/*:
 * @plugindesc Change tiles on map or copy tiles from another map
 * @author Shaz
 *
 * @help
 * This plugin allows you to copy a block of tiles from another map to the 
 * current map, or from one place on the current map to another, or to 
 * change an individual tile to a specific tile id.
 *
 * To Use:
 * -------
 *
 * To copy tiles from other maps, you must set up references to the map id
 * in the current map's note box.  This consists of a name/map id pair, for
 * each map you want to copy tiles from.  The format should be as follows (I
 * suggest setting this up in something with a larger window to make it
 * easier to see/modify, then copy/pasting into the map properties):
 *
 * <load:[{"name":"pinkroom","map":120},
 *        {"name":"blueroom","map":121},
 *        {"name":"greenroom","map":122}]> 
 *
 * This will then allow you to run the CopyTiles plugin command, and refer to
 * the maps by the names "pinkroom", "blueroom", and "greenroom" rather than
 * their map ids.  Note - these do NOT have to be the same as the map name
 * shown in the editor or the display name.
 *
 * If you only wish to copy tile areas from the current map to another place
 * on the current map, you do not need to set up the map notes.  This is only
 * required if you want to copy from other maps.
 *
 * The current map and the maps being copied must use the same tileset, or at
 * least have the same or similar tiles in the same location on the tileset.
 * This plugin does not copy the tile image, just the tile id, so if the source
 * map has a vase of flowers, and the current map has a teddy bear in the same
 * location on the tileset, a teddy bear is what will appear when you copy the
 * tiles.
 *
 * If you only wish to use the ChangeTile plugin command, you do not need to
 * set up the map notes.
 *
 *
 * Plugin Commands:
 * ----------------
 *
 * CopyTiles dx dy source sx1 sy1 sx2 sy2 z-list
 * Copies tiles from another (or the same) map, where
 *   dx      is the x-coordinate of the top left destination area
 *   dy      is the y-coordinate of the top left destination area
 *   source  is the 'name' of the source map in the map note
 *           or 'self' if you want to copy a section of the current map
 *   sx1     is the x-coordinate of the top left source area
 *   sy1     is the y-coordinate of the top left source area
 *   sx2     is the x-coordinate of the bottom right source area
 *   sy2     is the y-coordinate of the bottom right source area
 *   z-list  is an optional series of z values indicating which layers to copy
 *           if more than one, just use spaces between
 *           if omitted, all layers will be copied
 *
 * ChangeTile x y z tileId
 * Changes the tile at the specified coordinates and layer to the tileId
 * indicated.  Note - no auto-formatting of autotiles happens here.
 *
 * Z-layers
 * 0 - ground layer (most A tiles)
 * 1 - ground cover layer (A1 tiles with transparent areas, and right 4
 *     columns of A2 tiles)
 * 2 - upper layer 1
 * 3 - upper layer 2
 * 4 - shadow layer
 * 5 - region layer
 *
 *
 * Examples:
 * ---------
 *
 * CopyTiles 3 3 destroyed 5 8 9 12
 * copies the area between 5,8 and 9,12 from the 'destroyed' map to the
 * current map, with the upper left at 3,3.  All layers are copied
 *
 * CopyTiles 3 3 wilted 5 8 9 12 2 3
 * copies layers 2 and 3 (the upper layers) between 5,8 and 9,12 from the
 * 'wilted' map to the current map, with the upper left at 3,3
 *
 * ChangeTile 3 3 2 0
 * replaces the tile at coordinate 3,3 on layer 0 (upper layer 1) with tile 0
 * (which is the 'erase' tile - so this is removing whatever tile may have
 * previously been there)
 *
 * 
 * Change Log:
 * -----------
 * 2018.03.24  1.10  Save tile changes (fixes issue with returning to map
 *                   after menu or battle, and loading games) - no longer any
 *                   need for an event to re-do tile changes when map is
 *                   reloaded.
 *
 */

var Imported = Imported || {};
Imported.Shaz_TileChanger = true;

var Shaz = Shaz || {};
Shaz.TC = Shaz.TC || {};
Shaz.TC.Version = 1.10;

(function() {

	var _Shaz_TC_DataManager_onLoad = DataManager.onLoad;
	DataManager.onLoad = function(object) {
		_Shaz_TC_DataManager_onLoad.call(this, object);
		if (object === $dataMap) {
			$dataMap.extraMaps = {};
			$dataMap.extraMapCount = 0;
			if ($dataMap.meta.load) {
				$dataMap.meta.load = JSON.parse($dataMap.meta.load);
				for (var i = 0; i < $dataMap.meta.load.length; i++) {
					var name = $dataMap.meta.load[i].name;
					var map = parseInt($dataMap.meta.load[i].map);
					var filename = 'Map%1.json'.format(map.padZero(3));
					this.loadExtraMap(name, filename);
				}
			}
		}
	};

	DataManager.loadExtraMap = function(name, src) {
		var xhr = new XMLHttpRequest();
		var url = 'data/' + src;
		xhr.open('GET', url);
		xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				var data = JSON.parse(xhr.responseText);
				$dataMap.extraMaps[name] = {};
				$dataMap.extraMaps[name].width = data.width;
				$dataMap.extraMaps[name].height = data.height;
				$dataMap.extraMaps[name].data = data.data;
				$dataMap.extraMapCount -= 1;
			}
		}
		xhr.onerror = this._mapLoader || function() {
			DataManager._errorUrl = DataManager._errorUrl || url;
		}
		$dataMap.extraMaps[name] = null;
		$dataMap.extraMapCount += 1;
		xhr.send();
	};

	var _Shaz_TC_DataManager_isMapLoaded = DataManager.isMapLoaded;
	DataManager.isMapLoaded = function() {
		return _Shaz_TC_DataManager_isMapLoaded.call(this) && $dataMap.extraMapCount === 0;
	};

	var _Shaz_TC_Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
	Spriteset_Map.prototype.updateTilemap = function() {
		_Shaz_TC_Spriteset_Map_updateTilemap.call(this);
		if ($gameTemp.needMapDataRefresh()) {
			this._tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
			this._tilemap.refresh();
			$gameTemp.setMapDataRefresh(false);
		}
	};

	var _Shaz_TC_Game_Temp_initialize = Game_Temp.prototype.initialize;
	Game_Temp.prototype.initialize = function() {
		_Shaz_TC_Game_Temp_initialize.call(this);
		this._needMapDataRefresh = false;
	};

	Game_Temp.prototype.needMapDataRefresh = function() {
		return this._needMapDataRefresh;
	};

	Game_Temp.prototype.setMapDataRefresh = function(refresh) {
		this._needMapDataRefresh = refresh;
	};

	var _Shaz_TC_Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Shaz_TC_Game_System_initialize.call(this);
		this._mapTiles = [];
	};

	Game_System.prototype.saveMapTile = function(location, tileId) {
		var mapId = $gameMap.mapId();
		if (!this._mapTiles[mapId]) {
			this._mapTiles[mapId] = {};
		}
		this._mapTiles[mapId][location] = tileId;
	};

	Game_System.prototype.restoreMapTiles = function(mapId) {
		var tiles = this._mapTiles[mapId] || {};
		Object.keys(tiles).forEach(function(location) {
			$dataMap.data[location] = tiles[location];
		}.bind(this));
		$gameTemp.setMapDataRefresh(true);
	};

	Game_Map.prototype.copyTiles = function(args) {
		var dtlx = eval(args.shift());
		var dtly = eval(args.shift());
		var src = eval(args.shift());
		var stlx = eval(args.shift());
		var stly = eval(args.shift());
		var sbrx = eval(args.shift());
		var sbry = eval(args.shift());
		var zarray = [];
		for (var i = 0; i < args.length; i++) {
			zarray.push(eval(args[i]));
		}
		if (zarray.length === 0) {
			zarray = [0, 1, 2, 3, 4, 5];
		}

		if (src.toUpperCase() === 'SELF') {
			var source = $dataMap;
		} else {
			var source = $dataMap.extraMaps[src];
		}

		var sw = sbrx - stlx + 1;
		var sh = sbry - stly + 1;

		for (var z1 = 0; z1 < zarray.length; z1++) {
			for (var y = 0; y < sh; y++) {
				for (var x = 0; x < sw; x++) {
					var sx = stlx + x;
					var sy = stly + y;
					var dx = dtlx + x;
					var dy = dtly + y;
					var z = zarray[z1];
					var dIndex = this.calcIndex($dataMap, dx, dy, z);
					var sIndex = this.calcIndex(source, sx, sy, z);
					$dataMap.data[dIndex] = source.data[sIndex];
					$gameSystem.saveMapTile(dIndex, source.data[sIndex]);
				}
			}
		}

		$gameTemp.setMapDataRefresh(true);
	};

	Game_Map.prototype.changeTile = function(args) {
		var x = eval(args.shift());
		var y = eval(args.shift());
		var z = eval(args.shift());
		var tileId = eval(args.shift());
		var mapLoc = this.calcIndex($dataMap, x, y, z);

		$dataMap.data[mapLoc] = tileId;
		$gameSystem.saveMapTile(mapLoc, tileId);
		$gameTemp.setMapDataRefresh(true);
	};

	Game_Map.prototype.calcIndex = function(dataMap, x, y, z) {
		var w = dataMap.width;
		var h = dataMap.height;

		return (z * w * h) + (y * w) + x;
	};

	var _Shaz_TC_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		switch(command.toUpperCase()) {
			case 'COPYTILES':
				$gameMap.copyTiles(args);
				break;
			case 'CHANGETILE':
				$gameMap.changeTile(args);
				break;
			default:
				_Shaz_TC_Game_Interpreter_pluginCommand.call(this, command, args);
		}
	};

	var _Shaz_TC_Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
	Scene_Map.prototype.onMapLoaded = function() {
		$gameSystem.restoreMapTiles(this._transfer ? $gamePlayer.newMapId() : $gameMap.mapId());
		_Shaz_TC_Scene_Map_onMapLoaded.call(this);
	};

})();