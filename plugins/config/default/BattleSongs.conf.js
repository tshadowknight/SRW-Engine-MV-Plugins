$SRWConfig.battleSongs = {
	actorSongMapping: {
		1: "Battle1",
		3: {
			default: "Theme1",
			weapons: {
				4: "Battle2",
				5: "Battle3"
			}
		}
	},
	enemySongMapping: {
		5: "SRW_Boss1",
	},
	actorSongPriority: {
		
	},
	enemySongPriority: {
		5: 2,
	},
	notConfigurableActors: [
		//list actor ids of actors that should not be able to be assigned a custom bgm here(permanent subpilots)
	],
	assignmentGroups: [ //used to order pilots in the assign bgm menu
		/*{
			name: "Default RPG Maker",
			members: []//list of actor ids
		}*/
	],
	displayNames: {//provide nice display names by .ogg file name
		//"Theme_Myth": "Theme Myth",		
	},
	jukeboxOrder: [//list of .ogg files names, used for order in the Jukebox window
	
	]
};



