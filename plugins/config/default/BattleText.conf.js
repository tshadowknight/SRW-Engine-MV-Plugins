$SRWConfig.battleText = {
	actor: {
		1: { //Harold
			battle_intro: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Let's see how well you stand up to my assault!"},
					{faceName: "Actor1", faceIndex: 0, text: "Don't underestimate me just because I can't fly!"},
				]
			},
			retaliate: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Right back at ya, pal."},
				]
			},
			attacks: {
				1: {
					default: [{faceName: "Actor1", faceIndex: 0, text: "Here I come!", quoteId: 0},]
				},
				2: {
					default: [{faceName: "Actor1", faceIndex: 0, text: "Not usually my style, but!", quoteId: 0},]
				}	
			},
			evade: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Whew, I actually dodged something for once."},
				]
			},
			damage: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Hey! You're scuffing the paint on my armor!"},
				]
			},
			damage_critical: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Well, this is looking kinda bad..."},
				]
			},
			destroyed: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Aaaaaaaaaagh!"},
				]
			}, 
			support_defend: {
				default: [
					{faceName: "Actor1", faceIndex: 0, text: "Stand back!"},
				],
				actor: [
					{unitId: 3, faceName: "Actor1", faceIndex: 0, text: "Marsha, watch out!"},
				]				
			}
		},
		3: { //Marsha
			battle_intro: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "Line right up for your free explosion!"},
				]
			},
			retaliate: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "You're messing with the wrong witch, punk!"},
				],
				enemy: [
					{unitId: 1, faceName: "Actor3", faceIndex: 7, text: "Why is it always bats..."},
				]				
			},
			attacks: {
				1: {
					default: [{faceName: "Actor3", faceIndex: 7, text: "Do I really have to get so close to them...", quoteId: 0},]
				},
				2: {
					default: [{faceName: "Actor3", faceIndex: 7, text: "Ranged attacks are where it's at!", quoteId: 0},]
				}
			},
			evade: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "Better luck next time!"},
				]
			},
			damage: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "Ack, I'm not built for actually taking hits..."},
				]
			},
			damage_critical: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "H-Harold, could you give me some cover please..."},
				]
			},
			destroyed: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "Iyaaaaaaaaaa!"},
				]
			}, 
			support_defend: {
				default: [
					{faceName: "Actor3", faceIndex: 7, text: "Wait, why am I jumping in to take an attack?!"},
				]
			}
		}
	},
	enemy: {
		1: { //Bat
			battle_intro: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skree!"}
				]
			},
			retaliate: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skr-Skreeee!"}
				]
			},
			attacks: {

			},
			evade: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skree skree!"}
				]
			},
			damage: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skree!"}
				]
			},
			damage_critical: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skree..."}
				]
			},
			destroyed: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "SKREEEEEEEEEEEE!"}
				]
			}, 
			support_defend: {
				default: [
					{faceName: "Monster", faceIndex: 0, text: "Skree!"}
				]
			}
		},
		3: { //Orc
			battle_intro: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "... Attack..."}
				]
			},
			retaliate: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "... Attack!"}
				]
			},
			attacks: {
				
			},
			evade: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "Ha!"}
				]
			},
			damage: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "Gah!"}
				]
			},
			damage_critical: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "Grugh!!"}
				]
			},
			destroyed: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "GRAAAAAAAAGH!"}
				]
			}, 
			support_defend: {
				default: [
					{faceName: "Monster", faceIndex: 2, text: "... Defend..."}
				]
			}
		},
		5: { //Wraith
			battle_intro: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "Be cursed with me..."}
				]
			},
			retaliate: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "Unforgivable..."}
				]
			},
			attacks: {
				
			},
			evade: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "Useless."}
				]
			},
			damage: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "Agh!"}
				]
			},
			damage_critical: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "Pain..."}
				]
			},
			destroyed: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "SHYAAAAAAA..."}
				]
			}, 
			support_defend: {
				default: [
					{faceName: "Monster", faceIndex: 6, text: "... Defend..."}
				]
			}
		}
	}
};

$SRWConfig.eventBattleText = [
	{
		refId: "event_0",
		data: {
			actor: {			
				1: { //Harold
					damage: {
						default: [
							{faceName: "Actor1", faceIndex: 0, text: "That director guy better pay for my armor..."}
						]
					},			
					support_defend: {
						actor: [
							{unitId: 3, faceName: "Actor1", faceIndex: 0, text: "Marsha, don't die in the event!"}
						]
					}
				},
			}
		}		
	}
]