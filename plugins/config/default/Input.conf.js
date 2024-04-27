Input.keyMapper = {
	8: 'select', //backspace
	9: 'tab',       // tab
	13: 'menu',       // enter
	16: 'shift',    // shift
	17: 'control',  // control
	18: 'control',  // alt
	27: 'escape',   // escape
	32: 'ok',       // space
	33: 'pageup',   // pageup
	34: 'pagedown', // pagedown
	37: 'left',     // left arrow
	38: 'up',       // up arrow
	39: 'right',    // right arrow
	40: 'down',     // down arrow
	45: 'escape',   // insert
	81: 'pageup',   // Q
	87: 'pagedown', // W
	88: 'escape',   // X
	90: 'ok',       // Z
	96: 'escape',   // numpad 0
	98: 'down',     // numpad 2
	100: 'left',    // numpad 4
	102: 'right',   // numpad 6
	104: 'up',      // numpad 8
	120: 'debug',    // F9
	36: "left_trigger", //home
	35: "right_trigger", //end
	45: "L3",
	"-1": "d:left_right",
	"-2": "d:up_down",
	"-3": "d:shoulder_buttons",
	"-4": "d:shoulder_triggers",
};

Input.gamepadMapper = {
	0: 'ok',        // A
	1: 'cancel',    // B
	2: 'shift',     // X
	3: 'menu',      // Y
	4: 'pageup',    // LB
	5: 'pagedown',  // RB
	8: 'select',	// Select
	12: 'up',       // D-pad up
	13: 'down',     // D-pad down
	14: 'left',     // D-pad left
	15: 'right',    // D-pad right
	
	6: "left_trigger",
	7: "right_trigger",
	10: "L3",
	"-1": "d:left_right",
	"-2": "d:up_down",
	"-3": "d:shoulder_buttons",
	"-4": "d:shoulder_triggers",
};	

Input.padToGlyph = {
	0: 'face_down',        // A
	1: 'face_right',    // B
	2: 'face_left',     // X
	3: 'face_up',      // Y
	4: 'lb',    // LB
	5: 'rb',  // RB
	8: 'directions',	// Select
	12: 'directions',       // D-pad up
	13: 'directions',     // D-pad down
	14: 'directions',     // D-pad left
	15: 'directions',    // D-pad right
	
	6: "lt",
	7: "rt",
	10: "l3",
	"-1": "left_right",
	"-2": "up_down",
	"-3": "shoulder_buttons",
	"-4": "shoulder_triggers",
};	

Input.keyToGlyph = {
	"-1": "left_right",
	"-2": "up_down",
	"-3": "shoulder_buttons",
	"-4": "shoulder_triggers",
	37: "directions",
	38: "directions",
	39: "directions",
	40: "directions",
	49: "k_1",
	50: "k_2",
	51: "k_3",
	52: "k_4",
	53: "k_5",
	54: "k_6",
	55: "k_7",
	56: "k_8",
	57: "k_9",
	48: "k_0",
	173: "k_minus",
	61: "k_plus",
	//: "k_equals",
	//: "k_underscore",
	8: "k_backspace",
	81: "k_q",
	87: "k_w",
	69: "k_e",
	82: "k_r",
	84: "k_t",
	89: "k_y",
	85: "k_u",
	73: "k_i",
	79: "k_o",
	80: "k_p",
	219: "k_[",
	221: "k_]",
	//: "k_{",
	//: "k_}",
	220: "k_b_slash",
	13: "k_enter",
	16: "k_shift",
	65: "k_a",
	83: "k_s",
	68: "k_d",
	70: "k_f",
	71: "k_g",
	72: "k_h",
	74: "k_j",
	75: "k_k",
	76: "k_l",
	222: "k_hyphen",
	//: "k_quote",
	59: "k_colon",
	//: "k_semi_colon",
	//32: "k_space",
	91: "k_win",
	90: "k_z",
	88: "k_x",
	67: "k_c",
	86: "k_v",
	66: "k_b",
	78: "k_n",
	77: "k_m",
	188: "k_lt",
	199: "k_gt",
	191: "k_question",
	//: "k_f_slash",
	
	18: "k_alt",
	9: "k_tab",
	46: "k_del",
	35: "k_end",
	144: "k_num",
	110: "k_period",
	//: "k_dollar",
	//: "k_percent",
	//: "k_^",
	//: "k_cent",
	//: "k_(",
	//: "k_)",
	17: "k_control",
	20: "k_caps",
	36: "k_home",
	33: "k_page_up",
	34: "k_page_down",
	32: "k_space_large",
	16: "k_shift_large",
	45: "k_insert",
}

Input.glyphDefintions = {
	"xbox":{
		"directions": {
			"tiles": [[[0,1]]]
		},
		"left_right": {
			"tiles": [[[5,1]]]
		},
		"up_down": {
			"tiles": [[[6,1]]]
		},
		"face_up": {
			"tiles": [[[11,0]]]
		},
		"face_down": {
			"tiles": [[[8,0]]]
		},
		"face_left": {
			"tiles": [[[10,0]]]
		},
		"face_right": {
			"tiles": [[[9,0]]]
		},
		"start": {
			"tiles": [[[5,18]]]
		},
		"rb": {
			"tiles": [[[10,16]]]
		},
		"lb": {
			"tiles": [[[9,16]]]
		},
		"shoulder_buttons": {
			"tiles": [[[9,16],[10,16]]]
		},
		"rt": {
			"tiles": [[[8,16]]]
		},
		"lt": {
			"tiles": [[[7,16]]]
		},
		"shoulder_triggers": {
			"tiles": [[[7,16],[8,16]]]
		},
		"r3": {
			"tiles": [[[16,14]]]
		},
		"l3": {
			"tiles": [[[16,13]]]
		}
	},
	"ds": {
		"directions": {
			"tiles": [[[0,7]]]
		},
		"left_right": {
			"tiles": [[[5,7]]]
		},
		"up_down": {
			"tiles": [[[6,7]]]
		},
		"face_up": {
			"tiles": [[[17,16]]]
		},
		"face_down": {
			"tiles": [[[23,16]]]
		},
		"face_left": {
			"tiles": [[[21,16]]]
		},
		"face_right": {
			"tiles": [[[19,16]]]
		},
		"start": {
			"tiles": [[[5,18]]]
		},
		"rb": {
			"tiles": [[[26,18]]]
		},
		"lb": {
			"tiles": [[[25,18]]]
		},
		"shoulder_buttons": {
			"tiles": [[[25,18],[26,18]]]
		},
		"rt": {
			"tiles": [[[22,18]]]
		},
		"lt": {
			"tiles": [[[21,18]]]
		},
		"shoulder_triggers": {
			"tiles": [[[21,18],[22,18]]]
		},
		"r3": {
			"tiles": [[[16,14]]]
		},
		"l3": {
			"tiles": [[[16,13]]]
		}
	},
	"nin": {
		"directions": {
			"tiles": [[[0,7]]]
		},
		"left_right": {
			"tiles": [[[5,7]]]
		},
		"up_down": {
			"tiles": [[[6,7]]]
		},
		"face_up": {
			"tiles": [[[10,0]]]
		},
		"face_down": {
			"tiles": [[[9,0]]]
		},
		"face_left": {
			"tiles": [[[7,0]]]
		},
		"face_right": {
			"tiles": [[[8,0]]]
		},
		"start": {
			"tiles": [[[5,21]]]
		},
		"rb": {
			"tiles": [[[12,18]]]
		},
		"lb": {
			"tiles": [[[11,18]]]
		},
		"shoulder_buttons": {
			"tiles": [[[11,18],[12,18]]]
		},
		"rt": {
			"tiles": [[[14,18]]]
		},
		"lt": {
			"tiles": [[[13,18]]]
		},
		"shoulder_triggers": {
			"tiles": [[[13,18],[14,18]]]
		},
		"r3": {
			"tiles": [[[16,14]]]
		},
		"l3": {
			"tiles": [[[16,13]]]
		}
	},
	"mkb": {
		"directions": {
			"tiles": [[[33,19]]]
		},
		"left_right": {
			"tiles": [[[33,17]]]
		},
		"up_down": {
			"tiles": [[[33,18]]]
		},
		"shoulder_buttons": {
			"tiles": [[[23,6],[24,6]]],
			"tiles2": [[[25,6],[26,6]]]
		},
		"shoulder_triggers": {
			"tiles": [[[21,6],[22,6]]],
			"tiles2": [[[23,5],[24,5]]]
		},
		"k_1": {
			"tiles": [[[17,1]]]
		},
		"k_2": {
			"tiles": [[[18,1]]]
		},
		"k_3": {
			"tiles": [[[19,1]]]
		},
		"k_4": {
			"tiles": [[[20,1]]]
		},
		"k_5": {
			"tiles": [[[21,1]]]
		},
		"k_6": {
			"tiles": [[[22,1]]]
		},
		"k_7": {
			"tiles": [[[23,1]]]
		},
		"k_8": {
			"tiles": [[[24,1]]]
		},
		"k_9": {
			"tiles": [[[25,1]]]
		},
		"k_0": {
			"tiles": [[[26,1]]]
		},
		"k_minus": {
			"tiles": [[[27,1]]]
		},
		"k_plus": {
			"tiles": [[[28,1]]]
		},
		"k_equals": {
			"tiles": [[[29,1]]]
		},
		"k_underscore": {
			"tiles": [[[30,1]]]
		},
		"k_backspace": {
			"tiles": [[[32,1], [33,1]]]
		},
		"k_q": {
			"tiles": [[[17,1]]]
		},
		"k_w": {
			"tiles": [[[18,2]]]
		},
		"k_e": {
			"tiles": [[[19,2]]]
		},
		"k_r": {
			"tiles": [[[20,2]]]
		},
		"k_t": {
			"tiles": [[[21,2]]]
		},
		"k_y": {
			"tiles": [[[22,2]]]
		},
		"k_u": {
			"tiles": [[[23,2]]]
		},
		"k_i": {
			"tiles": [[[24,2]]]
		},
		"k_o": {
			"tiles": [[[25,2]]]
		},
		"k_p": {
			"tiles": [[[26,2]]]
		},
		"k_[": {
			"tiles": [[[27,2]]]
		},
		"k_]": {
			"tiles": [[[28,2]]]
		},
		"k_{": {
			"tiles": [[[29,2]]]
		},
		"k_}": {
			"tiles": [[[30,2]]]
		},
		"k_b_slash": {
			"tiles": [[[31,2]]]
		},
		"k_enter": {
			"tiles": [[[32,2], [33,2]], [[32,3], [33,3]]]
		},
		"k_shift": {
			"tiles": [[[17,3]]]
		},
		"k_a": {
			"tiles": [[[18,3]]]
		},
		"k_s": {
			"tiles": [[[19,3]]]
		},
		"k_d": {
			"tiles": [[[20,3]]]
		},
		"k_f": {
			"tiles": [[[21,3]]]
		},
		"k_g": {
			"tiles": [[[22,3]]]
		},
		"k_h": {
			"tiles": [[[23,3]]]
		},
		"k_j": {
			"tiles": [[[24,3]]]
		},
		"k_k": {
			"tiles": [[[25,3]]]
		},
		"k_l": {
			"tiles": [[[26,3]]]
		},
		"k_hyphen": {
			"tiles": [[[27,3]]]
		},
		"k_quote": {
			"tiles": [[[28,3]]]
		},
		"k_colon": {
			"tiles": [[[29,3]]]
		},
		"k_semi_colon": {
			"tiles": [[[30,3]]]
		},
		"k_space": {
			"tiles": [[[17,4]]]
		},
		"k_win": {
			"tiles": [[[18,4]]]
		},
		"k_z": {
			"tiles": [[[19,4]]]
		},
		"k_x": {
			"tiles": [[[20,4]]]
		},
		"k_c": {
			"tiles": [[[21,4]]]
		},
		"k_v": {
			"tiles": [[[22,4]]]
		},
		"k_b": {
			"tiles": [[[23,4]]]
		},
		"k_n": {
			"tiles": [[[24,4]]]
		},
		"k_m": {
			"tiles": [[[25,4]]]
		},
		"k_lt": {
			"tiles": [[[26,4]]]
		},
		"k_gt": {
			"tiles": [[[27,4]]]
		},
		"k_question": {
			"tiles": [[[28,4]]]
		},
		"k_f_slash": {
			"tiles": [[[29,4]]]
		},
		"k_up": {
			"tiles": [[[30,4]]]
		},
		"k_right": {
			"tiles": [[[31,4]]]
		},
		"k_down": {
			"tiles": [[[32,4]]]
		},
		"k_left": {
			"tiles": [[[33,4]]]
		},
		"k_alt": {
			"tiles": [[[17,5],[18,5]]]
		},
		"k_tab": {
			"tiles": [[[19,5],[20,5]]]
		},
		"k_del": {
			"tiles": [[[21,5],[22,5]]]
		},
		"k_end": {
			"tiles": [[[23,5],[24,5]]]
		},
		"k_num": {
			"tiles": [[[25,5],[26,5]]]
		},
		"k_period": {
			"tiles": [[[27,5]]]
		},
		"k_dollar": {
			"tiles": [[[28,5]]]
		},
		"k_percent": {
			"tiles": [[[29,5]]]
		},
		"k_^": {
			"tiles": [[[30,5]]]
		},
		"k_cent": {
			"tiles": [[[31,5]]]
		},
		"k_(": {
			"tiles": [[[32,5]]]
		},
		"k_)": {
			"tiles": [[[33,5]]]
		},
		"k_control": {
			"tiles": [[[17,6],[18,6]]]
		},
		"k_caps": {
			"tiles": [[[19,6],[20,6]]]
		},
		"k_home": {
			"tiles": [[[21,6],[22,6]]]
		},
		"k_page_up": {
			"tiles": [[[23,6],[24,6]]]
		},
		"k_page_down": {
			"tiles": [[[25,6],[26,6]]]
		},
		"k_,": {
			"tiles": [[[27,6]]]
		},
		"k_space_large": {
			"tiles": [[[17,4]]]
		},
		"k_shift_large": {
			"tiles": [[[17,7],[18,7]]]
		},
		"k_insert": {
			"tiles": [[[19,7],[20,7]]]
		}
	}	
};