import Window_CSS from "./Window_CSS.js";
import "./style/Window_Attribute_Chart.css"

export default function Window_Attribute_Chart() {
	this.initialize.apply(this, arguments);	
}

Window_Attribute_Chart.prototype = Object.create(Window_CSS.prototype);
Window_Attribute_Chart.prototype.constructor = Window_Attribute_Chart;

Window_Attribute_Chart.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "attr_chart";	
	this._pageSize = 1;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}


Window_Attribute_Chart.prototype.resetSelection = function(){		
	if(!this._wasStacked){
		this._currentSelection = 0;
		this._wasStacked = false;
	}
}


Window_Attribute_Chart.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.ATTR_CHART.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
}	

Window_Attribute_Chart.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
	
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			
		
			return;	
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
	
	
			return;	
		}
		
				

		if(Input.isTriggered('left') || Input.isRepeated('left')){
	
			return;	
					
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
		
			return;		
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
		
		}
		
		if(Input.isTriggered('menu')){
			
		}	
		
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){	
			SoundManager.playCancel();			
			$gameTemp.popMenu = true;	
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}				
			this.refresh();
			return;		
		}				
		this.resetTouchState();
		this.refresh();
	}		
};

Window_Attribute_Chart.prototype.redraw = function() {
	var _this = this;
	
	var content = "";
	
	$gameTemp.buttonHintManager.hide();	
	
	const attributeInfo = {		
		"fire": {name: "Fire", position: {x: "50", y: "0"}, color: "#8c282e", pointer: {rotation: "115deg", filter: "invert(17%) sepia(52%) saturate(3178%) hue-rotate(337deg) brightness(89%) contrast(87%);"}},
		"ice":  {name: "Ice", position: {x: "75", y: "25"}, color: "#395cb7", pointer: {rotation: "180deg", filter: "invert(34%) sepia(44%) saturate(1351%) hue-rotate(193deg) brightness(91%) contrast(91%);"}},
		"water":  {name: "Water", position: {x: "25", y: "25"}, color: "#3c93bf", pointer: {rotation: "62deg", filter: "invert(53%) sepia(48%) saturate(638%) hue-rotate(155deg) brightness(90%) contrast(81%);"}},
		"electric":  {name: "Electric", position: {x: "25", y: "66"}, color: "#b7b000", pointer: {rotation: "0deg", filter: "invert(81%) sepia(40%) saturate(5783%) hue-rotate(20deg) brightness(95%) contrast(101%);"}},
		"air":  {name: "Air", position: {x: "75", y: "66"}, color: "#609a2b", pointer: {rotation: "242deg", filter: "invert(51%) sepia(12%) saturate(3090%) hue-rotate(48deg) brightness(102%) contrast(67%);"}},
		"earth":  {name: "Earth", position: {x: "50", y: "89"}, color: "#654b2c", pointer: {rotation: "290deg", filter: "invert(28%) sepia(42%) saturate(508%) hue-rotate(353deg) brightness(95%) contrast(92%);"}},
		"light":  {name: "Light", position: {x: "40", y: "45"}, color: "#a89c6c", pointer: {rotation: "75deg", filter: "invert(65%) sepia(39%) saturate(340%) hue-rotate(11deg) brightness(91%) contrast(79%);"}},
		"dark":  {name: "Dark", position: {x: "60", y: "45"}, color: "#6a5287", pointer: {rotation: "255deg", filter: "invert(35%) sepia(18%) saturate(1120%) hue-rotate(225deg) brightness(94%) contrast(90%);"}},
	};
	
	for(let attr in attributeInfo){
		const src = "img/system/attribute_"+attr+".png";
		const position = attributeInfo[attr].position;
		const pointer = attributeInfo[attr].pointer;
		content+="<div class='attr_entry' style='top: "+position.y+"%; left: "+position.x+"%;'>";
		content+="<div class='attr_entry_inner'>";
		content+="<img class='pointer' src='svg/arrow_up.svg' style='transform: rotate("+pointer.rotation+"); filter: "+pointer.filter+";'>";
		
		
		content+="<div class='circle a' style='background-color: "+attributeInfo[attr].color+";'>";
		content+="</div>";
		content+="<div class='circle b' style='background-color: "+attributeInfo[attr].color+";'>";
		content+="</div>";
		content+="<div class='circle c' style='background-color: "+attributeInfo[attr].color+";'>";
		content+="</div>";
		content+="<div class='circle d' style='background-color: "+attributeInfo[attr].color+";'>";
		content+="</div>";
		content+="<img  class='attr_img' data-img='"+src+"'>";
		content+="</div>";
		content+="</div>";
	}

	this._listContainer.innerHTML = content;
	
	const attrIcons = this._listContainer.querySelectorAll(".attr_entry");
	for(let icon of attrIcons){
		_this.updateScaledDiv(icon);
	}
	
	
	this.loadImages();
	Graphics._updateCanvas();
}