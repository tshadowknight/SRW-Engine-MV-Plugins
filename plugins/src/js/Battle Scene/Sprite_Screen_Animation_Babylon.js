import Sprite_Animation_Babylon from "./Sprite_Animation_Babylon.js";
export default function Sprite_Screen_Animation_Babylon(){
	this.initialize.apply(this, arguments);
}
Sprite_Screen_Animation_Babylon.prototype = Object.create(Sprite_Animation_Babylon.prototype);
Sprite_Screen_Animation_Babylon.prototype.constructor = Sprite_Screen_Animation_Babylon;


Sprite_Screen_Animation_Babylon.prototype.updatePosition = function() {	
	
};