$SRWConfig.mapAttacks = function(){
	this.addDefinition(
		0, 
		[[1,0],[1,1],[1,-1],[2,0],[2,1],[2,-1],[3,0],[3,1],[3,-1]], 
		{			
			/*offset: {
				up: {x: 0, y: -96},
				down: {x: 0, y: 96},
				left: {x: -96, y: 0},
				right: {x: 96, y: 0},
			},	
			animId: 107,
			scale: 0.5*/
			offset: {
				up: {x: 0, y: -48},
				down: {x: 0, y: 0},
				left: {x: -24, y: -24},
				right: {x: 24, y: -24},
			},	
			animId: 72,
			scale: 0.7
		},
		false,
		{faceName: "Actor3", faceIdx: 7, text: "Marsha\nGet a load of this!"}
	);	
	
	this.addDefinition(
		1, 
		[[2,0],[2,1],[2,-1],[3,0],[3,1],[3,-1]], 
		{
			offset: {
				x: 0, 
				y: 0			
			},	
			animId: 5,
			scale: 0.7
		},
		false,
		null,
		{
			shape: [[1,0],[2,0],[2,1],[2,-1],[3,0]],
			center: {x: 2, y: 0},
			initialPosition: {x: 2, y: 0}
		}
		
	);	
	
	this.addDefinition(
		2, 
		[[1,0],[2,0],[3,0],[-1,0],[-2,0],[-3,0]], 
		{			
			/*offset: {
				up: {x: 0, y: -96},
				down: {x: 0, y: 96},
				left: {x: -96, y: 0},
				right: {x: 96, y: 0},
			},	
			animId: 107,
			scale: 0.5*/
			offset: {
				up: {x: 0, y: -48},
				down: {x: 0, y: 0},
				left: {x: -24, y: -24},
				right: {x: 24, y: -24},
			},	
			animId: 72,
			scale: 0.7
		},
		false,
		{faceName: "Actor3", faceIdx: 7, text: "Marsha\nGet a load of this!"}
	);
}