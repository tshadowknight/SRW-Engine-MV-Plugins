function SRWSongManager(){
	
}

SRWSongManager.prototype.initDefinitions = function(songId){
	this._actorSongMapping = $SRWConfig.battleSongs.actorSongMapping;
	this._enemySongMapping = $SRWConfig.battleSongs.enemySongMapping;
	
	this._actorSongPriority = $SRWConfig.battleSongs.actorSongPriority;
	this._enemySongPriority = $SRWConfig.battleSongs.enemySongPriority;
}

SRWSongManager.prototype.setCustomActorSong = function(actorId, weaponId, songId){
	if(!$gameSystem.customActorSongInfo){
		$gameSystem.customActorSongInfo = {};
	}
	var actorInfo = $gameSystem.customActorSongInfo[actorId] || JSON.parse(JSON.stringify($SRWConfig.battleSongs.actorSongMapping[actorId]));
	
	if(typeof actorInfo == "string"){
		actorInfo = {
			default: actorInfo,
			weapons: {}			
		};
	}
	
	if(weaponId){
		actorInfo.weapons[weaponId] = songId;
	} else {
		actorInfo.default = songId;
	}
	
	$gameSystem.customActorSongInfo[actorId] = actorInfo;
}

SRWSongManager.prototype.getActorSongInfo = function(actorId){
	if(!$gameSystem.customActorSongInfo){
		$gameSystem.customActorSongInfo = {};
	}	
	return $gameSystem.customActorSongInfo[actorId] || this._actorSongMapping[actorId];
}

SRWSongManager.prototype.getEnemySongInfo = function(enemyId){
	return this._enemySongMapping[enemyId];
}

SRWSongManager.prototype.setSpecialTheme = function(songId){
	$gameSystem._specialTheme = songId;
}

SRWSongManager.prototype.clearSpecialTheme = function(){
	$gameSystem._specialTheme = -1;
}

SRWSongManager.prototype.playSong = function(songId){
	if(songId && songId != -1){
		var bgm = {};
		bgm.name = songId;
		bgm.pan = 0;
		bgm.pitch = 100;
		bgm.volume = 90;
		AudioManager.playBgm(bgm);
	}
}

SRWSongManager.prototype.fadeInSong = function(songId){
	var _this = this;

	_this.playSong(songId);
	//AudioManager.fadeInBgm(1);	
}

SRWSongManager.prototype.getUnitSongInfo = function(actor){
	if(!actor){
		return {
			songs: -1,
			priority: -1
		}
	}
	if(actor.isActor()){
		return {
			songs: this.getActorSongInfo(actor.actorId()),
			priority: this._actorSongPriority[actor.actorId()] || 1
		};
	} else {
		return {
			songs: this._enemySongMapping[actor.enemyId()],
			priority: this._enemySongPriority[actor.enemyId()] || 1
		};
	}
}

SRWSongManager.prototype.resolveSong = function(songs, actor){
	if(songs == null){
		return -1;
	}
	if(typeof songs == "string"){
		return songs;
	} else {
		var combatInfo = $statCalc.getActiveCombatInfo(actor);
		if(combatInfo && combatInfo.self_action.type == "attack" && combatInfo.self_action.attack){
			if(songs.weapons && songs.weapons[combatInfo.self_action.attack.id]){
				return songs.weapons[combatInfo.self_action.attack.id];
			}
		}
		return songs.default;
	}
}

SRWSongManager.prototype.playBattleSong = function(actor, enemy){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		var actorSongInfo = this.getUnitSongInfo(actor);		
		var enemySongInfo = this.getUnitSongInfo(enemy);		

		if(enemySongInfo.priority > actorSongInfo.priority){
			songId = this.resolveSong(enemySongInfo.songs, enemy);
		} else {
			songId = this.resolveSong(actorSongInfo.songs, actor);
		}
	}
	this.playSong(songId);	
}

SRWSongManager.prototype.playStageSong = function(){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		songId = $gameSystem.currentStageSong;
	}	
	this.fadeInSong(songId);	
}