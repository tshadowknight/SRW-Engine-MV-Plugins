function DEPLOY_ACTIONS(){
	
}

//samples

/*
	RyuKoOh style pilot deploy.
	RyoKoOh is unit id 14, KoRyuOh is unit id 15.
	The definition for RyoKoOh specifies that:
		*when pilot 13(Kusuha) is set as its main the following pilot changes should happen:
			*Set pilot 13(Kusuha) as the main of unit 14(RyuKoOh)
			*Set pilot 12(Bullet) as the sub-pilot of unit 14(RyuKoOh)
			*Set pilot 12(Bullet) as the main of unit 15(KoRyuOh) (For display in the unit list during the intermission)
		*when pilot 12(Bullet) is set as its main the following pilot changes should happen:
			*Set pilot 13(Kusuha) as the main of unit 14(RyuKoOh)
			*Set pilot 12(Bullet) as the sub-pilot of unit 14(RyuKoOh)
		
*/
DEPLOY_ACTIONS[0] = {
	13: {//pilot 13
		14: [ //unit 14
			{target: {type: "sub", slot: 0}, source: {type: "direct", id: 12}}, //assign pilot 12 to sub slot 0 of unit 14
			{target: {type: "main"}, source: {type: "direct", id: 13}} //assign pilot 13 to the main pilot slot of unit 14
		],
		15: [ //unit 15
			{target: {type: "main"}, source: {type: "direct", id: 12}} //assign pilot 12 to the main pilot slot of unit 15
		]
	},
	12: { // this definition is used when transforming into RyoKoOh on the map, as pilot 12(Bullet) is still the main pilot at the time of transformation
		14: [ //unit 14
			{target: {type: "sub", slot: 0}, source: {type: "direct", id: 12}}, //assign pilot 12 to sub slot 0 of unit 14
			{target: {type: "main"}, source: {type: "direct", id: 13}} //assign pilot 13 to the main pilot slot of unit 14
		],
	}
};

/*
	KoRyuOh (unit 15)	
*/

DEPLOY_ACTIONS[1] = {
	13: {//Note that the definition is for pilot 13(Kusuha) and not 12(Bullet)! This is because when the transformation is performed pilot 13(Kusuha) is still the active pilot!
		15: [ //unit 15
			{target: {type: "sub", slot: 0}, source: {type: "direct", id: 13}}, //assign pilot 13 to sub slot 0 of unit 15
			{target: {type: "main"}, source: {type: "direct", id: 12}} //assign pilot 12 to the main pilot slot of unit 15
		]
	}	
};

/*
	Type 3 (unit 16)
*/

DEPLOY_ACTIONS[2] = {
	"-1": { //any pilot
		16: [ 
			{target: {type: "main"}, source: {type: "main", mech_id: 17}}, // assign the main pilot of unit 17(Bird) as main pilot of unit 16(Type 3)
			{target: {type: "sub", slot: 0}, source: {type: "main", mech_id: 18}} // assign the main pilot of unit 18(Lander) as sub pilot of unit 16(Type 3)
		]		
	}
};

/*
	Type 3 - Bird(unit 17)
*/

DEPLOY_ACTIONS[3] = {
	"-1": { //any pilot
		17: [
			{target: {type: "main"}, source: {type: "main", mech_id: 16}}, // assign the main pilot of unit 16(Type 3) as main pilot of unit 17(Bird)
		]		
	}
};

/*
	Type 3 - Lander(unit 18)
*/

DEPLOY_ACTIONS[4] = {
	"-1": { //any pilot
		18: [
			{target: {type: "main"}, source: {type: "sub", slot: 0, mech_id: 16}}, // assign the sub pilot of unit 16(Type 3) as main pilot of unit 18(Lander)
		]		
	}
};