function importGlobal(exports){
	Object.keys(exports).forEach(function(className){
		window[className] = exports[className];
	});
}

import Windows from './Windows.js';

importGlobal(Windows);
Windows.patches.apply();

import PluginCommands from './PluginCommands.js';
PluginCommands.patches.apply();

import GameTemp from './GameTemp.js';
GameTemp.patches.apply();

import GameSystem from './GameSystem.js';
GameSystem.patches.apply();

import DataManagement from './DataManagement.js';
DataManagement.patches.apply();
importGlobal(DataManagement);

import GameInterpreter from './GameInterpreter.js';
GameInterpreter.patches.apply();

import Sprites from './Sprites.js';
importGlobal(Sprites);
Sprites.patches.apply();

import Map from './Map.js';
Map.patches.apply();

import Entities from './Entities.js';
Entities.patches.apply();

import Audio from './Audio.js';
Audio.patches.apply();