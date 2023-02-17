//=============================================================================
// MVP_Gamepad.js
// Version: 1.2
//----------------------------------------------------------------------------
// Copyright (c) 2015-2017 uchuzine, NAK
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
@plugindesc
(Modified) Plug-in for smartphone operation. The virtual buttons that support landscape/portrait
holding and touch operation methods have been added and expanded to make smartphone play more comfortable.
@author
uchuzine (modified by NAK)
@help
MVP_Gamepad (Version: 1.2)
------------------------------------------------------------------------------
■Changelog
------------------------------------------------------------------------------

↓------この更新履歴はMVP_Gamepad.jsのものです------↓

1.2 2018/1/26

・HideButton Switchオプションが有効である時に非表示にすると、
　透過度を0にして完全に見えなくするようにしました。

1.1 2018/1/5

・HideButton OnMessageが有効であっても、コモンイベントの「文章の表示」に反応しない問題の修正。

1.0 2018/1/4

改変の度合いが大きいのでバージョンを見直しました。
MVP_Gamepad.jsにリネームしました。

・MVコアスクリプト1.5.0のプラグインパラメータを設定して
　多少使いやすくしました。
　小数点以下3桁までを有効にしてあります。
　仮想パッドの画像ファイルはimg/systemフォルダに入れて下さい。
　拡張子がすべて小文字でないとエラーが出ます。

・Chromeのバージョンによってはフリック操作でコンソールにエラーが出るので
　下記Qiita記事を参考に抑制しました。
　https://qiita.com/ru_shalm/items/4d79e94b5d9c7c88607d

・HideButton OnMessageのメモリリーク問題に対応しました。
　参考）
　https://qiita.com/EudyptesCapital/items/d4a76d665b038e027638
　https://tm.lucky-duet.com/viewtopic.php?t=371

・HideButton Switchオプションを追加しました。
　マップ画面(Scene_Map)／バトル画面(Scene_Battle)において、
　指定した番号のスイッチによって、仮想パッドの表示を切り替えます。
　この表示状態は他の画面(Scene)でも持ち越されます。
（マップ画面で非表示にしたままバトル画面(Scene_Battle)に移行すると、
　バトルでも表示されない）
　この機能を有効にすると、HideButton OnMessageは機能しません。
（HideButton OnMessageをtrueにしても、スイッチがOFFだと隠れない）

・HideButton Switch Valueオプションの追加。
　ここで設定した値の時、仮想パッドが表示されます。
　HideButtonSwitchが10の時、
　このオプションをtrueに設定する：
　10番のスイッチがオンの時に表示、オフの時に非表示
　このオプションをfalseに設定する：
　10番のスイッチがオフの時に表示、オンの時に非表示

↓------この更新履歴はMVP_Gamepad.jsのものです------↓

1.1.4 2015/12/04  画面下部メッセージ表示後に下記の問題が再発する不具合を修正
1.1.3 2015/11/29  画面左上にボタンを設置した際にボタンが押せない不具合を修正
1.1.2 2015/11/24  パラメータを変更できない不具合を修正
1.1.1 2015/11/23  PC上での仮想ボタン操作時の不具合を修正
1.1.0 2015/11/17  「AnalogMove.js」使用時のアナログ移動に対応。下記説明を参照
1.0.0 2015/11/15 プラグイン公開

↓------以下の説明はMVP_Gamepad.jsのものです------↓

------------------------------------------------------------------------------
■特徴
------------------------------------------------------------------------------
プラグイン作成にあたり、por Masked氏のMBS_MobileDirPad.jsを参考にしています。

○本プラグインの特徴
・ゲーム画面外(黒帯部分)にボタンを設置するため、プレイ画面に干渉しにくい
・パッドやボタンは個別に表示／非表示の切り替えが可能
・ボタンの基準点を画面四隅のいずれかに指定でき、縦持ち操作に対応可能
・方向パッドの操作性を重視し、タッチ判定領域、斜め方向の感度など調整可能
　（詳細は下記の説明を参照）
・方向パッドによる移動と、デフォルトの目的地タッチによる移動を併用可能
・特定のタッチ操作、ジェスチャーによるボタン操作の拡張

これらを利用し、

・仮想十字キーは使わずに、MENUボタンと決定ボタンのみ使用
・ボタンは全て使用せず、画面長押しでオート連打、画面外タッチでメニュー呼出

といった使い方もできます。

------------------------------------------------------------------------------
■一部のパラメータの説明
------------------------------------------------------------------------------
▼ DPad OpelationRange（方向パッド作動領域）‥‥
方向パッド画像の表示サイズに対する、タッチ判定領域の大きさを倍率で指定します。
数値を上げても見た目は変わりませんが、画像の中心から外側に判定が広がります。
例）
「1」のとき‥‥画像のサイズがタッチ判定の大きさになる（画像の内接円の中のみ）
「2」のとき‥‥タッチ判定の大きさが縦横２倍になる（画像の外側に50%ずつ広がる）

数値を上げることで操作ミスを防ぎ、操作性を上げることができますが
上げ過ぎて他のボタン等に重なってしまわないように注意してください。

▼ DPad DiagonalRange（方向パッドの斜め方向範囲）‥‥
方向の判定は、パッド画像の対角線を境界線にして上下左右に分けていますが、
この数値を上げると、対角線上をタッチしたときにその両側の方向がオンになり
（「右」＋「上」など）、８方向判定ができるようになります。
８方向移動のプラグインを使用している時などは、この数値を設定してください。

数値の大きさが斜め判定角度の広さとなり、「0～1」の範囲で指定します
例)
「0」のとき‥‥上下左右の４方向のみ入力可能。
「0.5」のとき‥均等８分割の８方向入力が可能。
「1」のとき‥‥「右上」「右下」「左上」「左下」の４方向入力。

数値を上げるほど、「上を押すつもりが右上になっていた」等のミスが起こるため
４方向で問題ない場合は、「0」を指定すると操作ミスが最小限になります。


（var1.1.0より追加）
▼ AnalogMove（アナログ移動）‥‥
サンシロ様のプラグイン「AnalogMove.js」使用時に、アナログ移動を可能にします。
方向パッドの中心からタッチ位置の距離と角度で、ドット単位の移動ができます。
使用の際はプラグインマネージャーで、先に「AnalogMove.js」を読み込み
こちらのパラメータ「AnalogMove」をtrueに変えてください。
※アナログ移動使用中は、「DPad DiagonalRange」の数値は無視されます。

▼ AnalogSensitivity（入力感度）‥‥
「AnalogSensitivity」は入力感度で、数値を上げるほど
最大値（最大スピード）まで入力するのに必要な指の動きが小さくなります。
例)
「1」のとき‥‥入力判定の外端で最大値に。大きな指の移動が必要。
「DPad OpelationRange」と同じとき‥‥方向パッド画像の外端で最大値に。

DPad OpelationRangeよりも大きめの数値を指定すると、入力が楽になります。
（DPad OpelationRangeの初期値1.3に対し、AnalogSensitivityの初期値は1.8です)

------------------------------------------------------------------------------
■パッド、ボタン画像について
------------------------------------------------------------------------------
・（追加）パッド・ボタン画像はシステムフォルダ（img/system）に入れ、
　拡張子(.png)はすべて小文字にしてください。

・画像ファイルは任意のサイズで作成可能ですが、縦横比1:1で作成してください。
　表示の際は、「DPad Size」で指定したpixel数にリサイズされます。
　ボタン画像も同様です。
・方向パッドのグラフィックの中心が画像の中心になるようにしてください。

@param ---PC Option---
@default

@param PC BtnDisplay
@desc Show virtual buttons when running on PC. Yes: true / Not:false
Default:false
@default false
@type boolean

@param PC TouchExtend
@desc Enable touch operation extension when running on PC. Yes: true / Not:false
Default:true
@default true
@type boolean

@param ---File Path---
@default

@param DPad Image
@desc The file path of the D-Pad image
@default DirPad
@require 1
@dir img/system/
@type file

@param ActionBtn Image
@desc The file path of the Action button image
@default ActionButton
@require 1
@dir img/system/
@type file

@param CancelBtn Image
@desc File path of Cancel (menu) button image
@default CancelButton
@require 1
@dir img/system/
@type file

@param ---Button Customize---
@default

@param Button Opacity
@desc Button opacity (0 to 1) Default: 0.7
@default 0.700
@type number
@max 1.000
@min 0.000
@decimals 3

@param Vertical BtnZoom
@desc Magnification of all buttons when displayed in portrait
初期値:1.700
@default 0.900
@type number
@decimals 3

@param Tablet BtnZoom
@desc Magnification of all buttons when displayed in landscape in Tablet
初期値:0.800
@default 0.800
@type number
@decimals 3

@param TabVertical BtnZoom
@desc Magnification of all buttons when displayed in portrait in Tablet
初期値:1.100
@default 0.900
@type number
@decimals 3

@param HideButton OnMessage
@desc When the message is displayed at the bottom of the screen, lower the display order of the virtual button to the bottom of the game screen.
初期値:false
@default false
@type boolean

@param HideButton Switch
@desc Control the display of virtual buttons with this numbered switch. Disabled at 0.
@default 0
@type number

@param HideButton Switch Value
@desc When controlling a virtual button with a switch, set whether to display ON (true) or OFF (false).
@default false
@type boolean

@param DPad Visible
@desc Show direction pad. Yes:true / Not:false. Default:true
@default true
@type boolean

@param DPad Size
@desc Direction pad size (px). Initial value: 200
@default 128
@type number

@param DPad Margin
@desc The position of the direction pad image. The size of the gap from the edge of the screen.
(width from left; width from bottom) Initial value: 10; 10
@default 20; 20

@param DPad Orientation
@desc You want to change the reference position of the direction pad to something other than the lower left.
left か right; top か bottom で指定。 初期値:left; bottom
@default left; bottom
@type select
@option left; top
@option left; bottom
@option right; top
@option right; bottom

@param DPad OpelationRange
@desc For the direction pad image, the operating range of the touch (magnification, 1~ )
to widen the touch determination to the outside of the image, to prevent operation error. Initial value: 1.3
@default 1.000
@type number
@decimals 3

@param DPad DiagonalRange
@desc The size of the determination of the direction pad oblique direction (0-1). The easier it is to enter diagonally, the easier it is to shake the operation. 0 if it is good in four directions. Initial value: 0.3;
@default 0.300
@type number
@max 1.000
@min 0.000
@decimals 3

@param ActionBtn Visible
@desc Show Action button: true Not:false Initial value: true
@default true
@type boolean

@param ActionBtn Size
@desc The size of the decision button (px). Initial value: 100
@default 60
@type number

@param ActionBtn Margin
@desc The position of the decision button. The size of the gap from the edge of the screen.
 (width from right; width from bottom) Initial value: 10; 90
@default 20; 70

@param ActionBtn Orientation
@desc You want to change the reference position of the decision button to something other than the lower right.
left か right; top か bottom で指定。 初期値:right; bottom
@default right; bottom
@type select
@option left; top
@option left; bottom
@option right; top
@option right; bottom

@param CancelBtn Visible
@desc キャンセル（メニュー）ボタンを表示する:true しない:false
初期値:true
@default true
@type boolean

@param CancelBtn Size
@desc キャンセルボタンの大きさ(px）。 初期値:100
@default 60
@type number

@param CancelBtn Margin
@desc キャンセルボタンの位置。画面端からの隙間の大きさで指定。
 (右からの幅; 下からの幅) 初期値:110; 10
@default 70; 20

@param CancelBtn Orientation
@desc キャンセルボタンの基準位置を、右下以外に変えたい場合。
left か right; top か bottomで指定。 初期値:right; bottom
@default right; bottom
@type select
@option left; top
@option left; bottom
@option right; top
@option right; bottom

@param ---TouchInput Extend---
@default 

@param Flick PageUp-PageDown
@desc Flick left or right on the screen to get the PageUp/PageDown operation.
ステータス画面でキャラを切り替えたい時などに。初期値:true
@default true
@type boolean

@param HoldCanvas ActionBtn
@desc Press and hold the screen to press the decision button.
初期値:true
@default true
@type boolean

@param OutCanvas CancelBtn
@desc The entire black belt outside the game screen is treated like a cancel button.
初期値:false
@default false
@type boolean

@param OutCanvas ActionBtn
@desc The entire black belt part outside the game screen becomes the decision button treatment.
初期値:false
@default false
@type boolean

@param --!need AnalogMove.js!--
@default

@param Analog Move
@desc [※AnalogMove.jsを先に読み込んでください]
方向パッドでアナログ移動ができるようにする。初期値:false
@default false
@type boolean

@param Analog Sensitivity
@desc アナログ移動の入力感度。数値を上げると、細かい指の動きでキャラが大きく動く。
初期値:1.800
@default 1.800
@type number
@decimals 3

*/

var Imported = Imported || {};
Imported.MVP_Gamepad = "1.2";

var MVP_Gamepad = {};

(function() {
    "use strict";
	
	//-----------------------------------------------------------------------------
	// Setup
	
	var Parameters = PluginManager.parameters('MVP_Gamepad');
	var PRM = PRM || {};
	
	PRM.url=[];
	PRM.visible=[];
	PRM.size=[];
	PRM.pos=[];
	PRM.spot=[];
	
	PRM.pcBtn = Boolean(Parameters["PC BtnDisplay"] === 'true' || false);
	PRM.pcExt = Boolean(Parameters["PC TouchExtend"] === 'true' || false);
	PRM.url[0] = "./img/system/" + String(Parameters["DPad Image"]) + ".png";
	PRM.url[1] = "./img/system/" + String(Parameters["ActionBtn Image"])+ ".png";
	PRM.url[2] = "./img/system/" + String(Parameters["CancelBtn Image"])+ ".png";
	PRM.opacity = Number(Parameters["Button Opacity"]);
	PRM.vZoom = Number(Parameters["Vertical BtnZoom"]);
	PRM.tabZoom = Number(Parameters["Tablet BtnZoom"]);
	PRM.tabvZoom = Number(Parameters["TabVertical BtnZoom"]);
	PRM.hideBtn = Boolean(Parameters["HideButton OnMessage"] === 'true' || false);
	PRM.visible[0] = Boolean(Parameters["DPad Visible"] === 'true' || false);
	PRM.size[0] = Number(Parameters["DPad Size"]);
	PRM.pos[0] =Parameters["DPad Margin"].split(";");
	PRM.spot[0] = Parameters["DPad Orientation"].split(";");
	PRM.pad_scale = Number(Parameters["DPad OpelationRange"]);
	PRM.pad_dia = Math.max(0,Math.min(1,(1-Number(Parameters["DPad DiagonalRange"]))));
	PRM.visible[1] = Boolean(Parameters["ActionBtn Visible"] === 'true' || false);
	PRM.size[1] = Number(Parameters["ActionBtn Size"]);
	PRM.pos[1] = Parameters["ActionBtn Margin"].split(";");
	PRM.spot[1] = Parameters["ActionBtn Orientation"].split(";");
	PRM.visible[2] = Boolean(Parameters["CancelBtn Visible"] === 'true' || false);
	PRM.size[2] = Number(Parameters["CancelBtn Size"]);
	PRM.pos[2] = Parameters["CancelBtn Margin"].split(";");
	PRM.spot[2] = Parameters["CancelBtn Orientation"].split(";");
	PRM.flickpage = Boolean(Parameters["Flick PageUp-PageDown"] === 'true' || false);
	PRM.holdaction = Boolean(Parameters["HoldCanvas ActionBtn"] === 'true' || false);
	PRM.outcansel = Boolean(Parameters["OutCanvas CancelBtn"] === 'true' || false);
	PRM.outaction = Boolean(Parameters["OutCanvas ActionBtn"] === 'true' || false);
	PRM.analogmove = Boolean(Parameters["Analog Move"] === 'true' || false);
	PRM.sensitivity = Number(Parameters["Analog Sensitivity"]);
	//改変者による機能追加
	PRM.hideBtnSwitch = Number(Parameters["HideButton Switch"]);
	PRM.hideBtnSwitchValue = Boolean(Parameters["HideButton Switch Value"] === 'true' || false);
	
	var btn_id=["DirPad","ok","escape"];
	var current_zoom=1;	
	var st_x = 0;
	var st_y = 0;
	var pad_range=PRM.size[0]*PRM.pad_scale;
	var pad_size=pad_range*current_zoom/2;
	var Btn_ready=false;
	var Btn_hide=false;
	var PressBtn=false;
	var dirx=0;
	var diry=0;
	var touchx=0;
	var touchy=0;
	var autofire=false;
	var hvzoom=[1, PRM.vZoom];
	var ua = (function(u){
	  return {
	    Tablet:(u.indexOf("windows") != -1 && u.indexOf("touch") != -1) || u.indexOf("ipad") != -1 || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1) || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1) || u.indexOf("kindle") != -1 || u.indexOf("silk") != -1 || u.indexOf("playbook") != -1
	  };
	})(window.navigator.userAgent.toLowerCase());

	if(ua.Tablet){
		hvzoom=[PRM.tabZoom, PRM.tabvZoom];
	}
	if (!Utils.isMobileDevice() && !PRM.pcBtn) {PRM.visible[0]=PRM.visible[1]=PRM.visible[2]=false;}

	//-----------------------------------------------------------------------------
	// Locate_DirPad

	function Locate_DirPad() {
		this.initialize.apply(this, arguments);
	}


	Locate_DirPad.prototype.initialize = function() {
		var img = new Image();
		var url = PRM.url[0];
		img.onerror = function() {Graphics.printError('DirPad Image was Not Found:',url);};
		img.src = url;
		img = null;
		this.Div = document.createElement("div");
		this.Div.id = 'Dirpad';
		this.Div.style.position = 'fixed';
		this.Div.style[PRM.spot[0][0].replace(/\s+/g, "")] = String(PRM.pos[0][0]-(pad_range-PRM.size[0])/2)+'px';
		this.Div.style[PRM.spot[0][1].replace(/\s+/g, "")] = String(PRM.pos[0][1]-(pad_range-PRM.size[0])/2)+'px';
		this.Div.style.width = pad_range+'px';
		this.Div.style.height = pad_range+'px';
		this.Div.style.opacity = PRM.opacity;
		this.Div.style.zIndex = '11';
		this.Div.style.userSelect="none";
		this.Div.style["-webkit-tap-highlight-color"]="rgba(0,0,0,0)";
		this.Div.style.background = 'url('+PRM.url[0]+') 50% 50% / '+String(Math.round(PRM.size[0]/pad_range*100))+'% no-repeat';
		
		if(!Utils.isMobileDevice() && PRM.pcBtn){
			this.Div.addEventListener('mousedown', function(e) {
			  if (!SceneManager.isSceneChanging()){dirope(e.layerX,e.layerY,true);PressBtn=true;}
			}, false);
			this.Div.addEventListener('mousemove', function(e) {
			  if(PressBtn && !SceneManager.isSceneChanging()){dirope(e.layerX,e.layerY,false);}
			}, false);
			this.Div.addEventListener('mouseup', function() {
				disope();PressBtn=false;
			}, false);
			this.Div.addEventListener('mouseout', function() {
			    disope();PressBtn=false;
			}, false);
		}
		this.Div.addEventListener('touchstart', function(e) {
			PressBtn=true;
			if (!SceneManager.isSceneChanging()){dirope(e.touches[0].clientX-dirx, e.touches[0].clientY-diry,true)};
		}, false);
		this.Div.addEventListener('touchmove', function(e) {
			if (!SceneManager.isSceneChanging()){dirope(e.touches[0].clientX-dirx, e.touches[0].clientY-diry,false)};
			PressBtn=true;
		}, false);
		this.Div.addEventListener('touchend', function() {
			disope();PressBtn=false;
		}, false);
			document.body.appendChild(this.Div);
	};
	
	function dirope(xx,yy,st) {
		touchx=(xx-pad_size)/pad_size;
		touchy=(yy-pad_size)/pad_size;
		if(st && Math.sqrt(touchx*touchx+touchy*touchy)>1){
			disope();
		}else{
			if(touchx>Math.abs(touchy)*PRM.pad_dia){Input._currentState['right']=true;Input._currentState['left']=false;}
			else if(touchx<-Math.abs(touchy)*PRM.pad_dia){Input._currentState['left']=true;Input._currentState['right']=false;}
			else{Input._currentState['left']=false;Input._currentState['right']=false;}
			if(touchy>Math.abs(touchx)*PRM.pad_dia){Input._currentState['down']=true;Input._currentState['up']=false;}
			else if(touchy<-Math.abs(touchx)*PRM.pad_dia){Input._currentState['up']=true;Input._currentState['down']=false;}
			else{Input._currentState['up']=false;Input._currentState['down']=false;}
		}
	}
	function disope() {
		touchx=0; touchy=0;
		Input._currentState['up']=false;
		Input._currentState['down']=false;
		Input._currentState['left']=false;
		Input._currentState['right']=false;
	}
	
	//-----------------------------------------------------------------------------
	// Locate_Button

	function Locate_Button() {
		this.initialize.apply(this, arguments);
	}
	Locate_Button.prototype.initialize = function(type) {
		var img = new Image();
		var url = PRM.url[type];
		img.onerror = function() {Graphics.printError('Button Image was Not Found:',url);};
		img.src = url;
		img = null;
		this.Div = document.createElement("div");
		this.Div.id = btn_id[type]+'Btn';
		this.Div.style.position = 'fixed';
		this.Div.style[PRM.spot[type][0].replace(/\s+/g, "")] = PRM.pos[type][0]+'px';
		this.Div.style[PRM.spot[type][1].replace(/\s+/g, "")] = PRM.pos[type][1]+'px';
		this.Div.style.width = PRM.size[type]+'px';
		this.Div.style.height = PRM.size[type]+'px';
		this.Div.style.opacity = PRM.opacity;
		this.Div.style.zIndex = '11';
		this.Div.style.userSelect="none";
		this.Div.style.background = 'url('+PRM.url[type]+') 0 0 / cover no-repeat';
		
		if(!Utils.isMobileDevice() && PRM.pcBtn){
			this.Div.addEventListener('mousedown', function() {
				Input._currentState[btn_id[type]] = true;PressBtn=true;
			}, false);
			this.Div.addEventListener('mouseover', function() {
			  if(TouchInput.isPressed()){Input._currentState[btn_id[type]] = true;PressBtn=true;return false;}
			}, false);
			this.Div.addEventListener('mouseup', function() {
			  Input._currentState[btn_id[type]] = false;PressBtn=false;
			}, false);
			this.Div.addEventListener('mouseout', function() {
			  Input._currentState[btn_id[type]] = false;PressBtn=false;
			}, false);
		}
		
		this.Div.addEventListener('touchstart', function() {
			if (!SceneManager.isSceneChanging()){Input._currentState[btn_id[type]] = true;PressBtn=true;}
		}, false);
		this.Div.addEventListener('touchend', function() {
			Input._currentState[btn_id[type]] = false;PressBtn=false;
		}, false);
		
		document.body.appendChild(this.Div);
	};

	//-----------------------------------------------------------------------------
	// Replace function
			
	var Scene_Base_start = Scene_Base.prototype.start;
	Scene_Base.prototype.start = function() {
            Scene_Base_start.call(this);
	    if (Utils.isMobileDevice() || PRM.pcBtn) {
			if(!Btn_ready){
				Btn_ready=true;
				if(PRM.visible[0]){this.DirPad = new Locate_DirPad();}
				if(PRM.visible[1]){this.okButton = new Locate_Button(1);}
				if(PRM.visible[2]){this.canselButton = new Locate_Button(2);}
				Graphics._updateRealScale();
				document.documentElement.style["-webkit-user-select"]="none";
				document.addEventListener("touchmove", function(evt) {evt.preventDefault();}, {passive: false});
			}
		}
	};

        if(PRM.visible[0] || PRM.visible[1] || PRM.visible[2]){
            var Game_Temp_setDestination = Game_Temp.prototype.setDestination;
            Game_Temp.prototype.setDestination = function(x, y) {
                Game_Temp_setDestination.apply(this, arguments);
                if(PressBtn){
                    this._destinationX = null;
                    this._destinationY = null;
                }
            };
		
            var Graphics_updateRealScale = Graphics._updateRealScale;
            Graphics._updateRealScale = function() {
                Graphics_updateRealScale.call(this);
                if (this._stretchEnabled) {
                    if(document.getElementById("Dirpad")){
                    if(window.innerWidth<window.innerHeight){current_zoom=hvzoom[1];}else{current_zoom=hvzoom[0];}
                    pad_size=pad_range*current_zoom/2;
                    if(PRM.visible[0]){
                            document.getElementById("Dirpad").style.zoom=current_zoom;
                            dirx=document.getElementById("Dirpad").offsetLeft*current_zoom;
                            diry=document.getElementById("Dirpad").offsetTop*current_zoom;
                    }
                    if(PRM.visible[1]){document.getElementById("okBtn").style.zoom=current_zoom;}
                    if(PRM.visible[2]){document.getElementById("escapeBtn").style.zoom=current_zoom;}
                    }
                }
            };
	}
	
	//-----------------------------------------------------------------------------
	// Option
        // MVP_Gamepadからの改変が多い箇所
        
        //MVP_Gamepadの同名メソッドとほぼ同じ
        Scene_Base.prototype.hideUserInterface = function() {
            if (Utils.isMobileDevice() || PRM.pcBtn) {
                Btn_hide = true;
                //元々のMVP_Gamepadの処理
                if(PRM.visible[0]){document.getElementById("Dirpad").style.zIndex = '0';}
                if(PRM.visible[1]){document.getElementById("okBtn").style.zIndex = '0';}
                if(PRM.visible[2]){document.getElementById("escapeBtn").style.zIndex = '0';}
                if(PRM.hideBtnSwitch != 0){
                    //透明度をゼロにする処理
                    if(PRM.visible[0]){document.getElementById("Dirpad").style.opacity = '0';}
                    if(PRM.visible[1]){document.getElementById("okBtn").style.opacity = '0';}
                    if(PRM.visible[2]){document.getElementById("escapeBtn").style.opacity = '0';}
                }
            }
        };
        
        //MVP_Gamepadの同名メソッドとほぼ同じ
        Scene_Base.prototype.showUserInterface = function() {
            if (Utils.isMobileDevice() || PRM.pcBtn) {
                Btn_hide = false;
                //元々のMVP_Gamepadの処理
                if(PRM.visible[0]){document.getElementById("Dirpad").style.zIndex = '11';}
                if(PRM.visible[1]){document.getElementById("okBtn").style.zIndex = '11';}
                if(PRM.visible[2]){document.getElementById("escapeBtn").style.zIndex = '11';}
                if(PRM.hideBtnSwitch != 0){
                    //透明度を設定値にする処理
                    if(PRM.visible[0]){document.getElementById("Dirpad").style.opacity = PRM.opacity;}
                    if(PRM.visible[1]){document.getElementById("okBtn").style.opacity = PRM.opacity;}
                    if(PRM.visible[2]){document.getElementById("escapeBtn").style.opacity = PRM.opacity;}                      
                }
            }
        };

        //updateMainで表示状態をチェックする
        var dice2000_Scene_Map_updatemain = Scene_Map.prototype.updateMain;
        Scene_Map.prototype.updateMain = function() {
            dice2000_Scene_Map_updatemain.apply(this, arguments);
            //スイッチ番号が設定されている時
            if(PRM.hideBtnSwitch != 0){
                //どの値で表示するかはPRM.hideBtnSwitchValue（真理値）による
                //非表示状態にする
                if($gameSwitches.value(PRM.hideBtnSwitch) != PRM.hideBtnSwitchValue){
                    //表示状態(Btn_hideがfalse)にメソッドを呼び、行き先でBtn_hideをtrueにする
                    if(!Btn_hide) this.hideUserInterface();
                //表示状態にする
                }else{
                    //非表示状態(Btn_hideがtrue)にメソッドを呼び、行き先でBtn_hideをfalseにする
                    if(Btn_hide) this.showUserInterface();
                }
            //スイッチ番号が設定されておらず、HideButton OnMessageがtrueに設定されている時
            }else if(PRM.hideBtn){
                //消去条件：メッセージウィンドウにテキストが存在する時＆スクロールモードでない時＆ウィンドウ位置が下の時
                //ここの条件式を変えれば消すタイミングは変えられます
                if($gameMessage.hasText() && !$gameMessage.scrollMode() && $gameMessage.positionType() == 2){
                    if(!Btn_hide) this.hideUserInterface();
                }else{
                    if(Btn_hide) this.showUserInterface();
                }
            }
        };

        var dice2000_Scene_Battle_update = Scene_Battle.prototype.update;
        Scene_Battle.prototype.update = function() {
            dice2000_Scene_Battle_update.apply(this, arguments);
            if(PRM.hideBtnSwitch != 0){
                if($gameSwitches.value(PRM.hideBtnSwitch) != PRM.hideBtnSwitchValue){
                    if(!Btn_hide) this.hideUserInterface();
                }else{
                    if(Btn_hide) this.showUserInterface();
                }
            }else if(PRM.hideBtn){
                if($gameMessage.hasText() && !$gameMessage.scrollMode() && $gameMessage.positionType() == 2){
                    if(!Btn_hide) this.hideUserInterface();
                }else{
                    if(Btn_hide) this.showUserInterface();
                }
            }
        };

	if(Utils.isMobileDevice() || PRM.pcExt){
		if(PRM.holdaction){
			var TouchInput_update = TouchInput.update;
			TouchInput.update = function() {
				TouchInput_update.call(this);
				if (!PressBtn && TouchInput.isLongPressed()) {
					Input._currentState['ok']=true;autofire=true;
				}
				if(!TouchInput.isPressed() && autofire){
					Input._currentState['ok']=false;autofire=false;
				}
			};
		}
		
		if(PRM.flickpage || PRM.outcansel || PRM.outaction){
			TouchInput._endRequest= function(type) {
				Input._currentState[type]=false;
			}
			if(Utils.isMobileDevice()){
				var TouchInput_onTouchStart = TouchInput._onTouchStart;
				TouchInput._onTouchStart = function(event) {
				    TouchInput_onTouchStart.apply(this, arguments);
					var touch = event.changedTouches[0];
					if(!PressBtn){
						st_x = Graphics.pageToCanvasX(touch.pageX);
						st_y = Graphics.pageToCanvasY(touch.pageY);
						if(st_x<0 || st_y<0 || st_x>Graphics.boxWidth || st_y>Graphics.boxHeight){
							if(PRM.outcansel){Input._currentState['escape']=true;setTimeout("TouchInput._endRequest('escape');", 100);}
							if(PRM.outaction){Input._currentState['ok']=true;setTimeout("TouchInput._endRequest('ok');", 100);}
						}
					}
				};
			}else{
				var TouchInput_onLeftButtonDown = TouchInput._onLeftButtonDown;
				TouchInput._onLeftButtonDown = function(event) {
					TouchInput_onLeftButtonDown.apply(this, arguments);
					if(!PressBtn){
						st_x = Graphics.pageToCanvasX(event.pageX);
						st_y = Graphics.pageToCanvasY(event.pageY);
						if(st_x<0 || st_y<0 || st_x>Graphics.boxWidth || st_y>Graphics.boxHeight){
							if(PRM.outcansel){Input._currentState['escape']=true;setTimeout("TouchInput._endRequest('escape');", 100);}
							if(PRM.outaction){Input._currentState['ok']=true;setTimeout("TouchInput._endRequest('ok');", 100);}
						}
					}
				};
			}
		}
			
		if(PRM.flickpage){
			var TouchInput_onMove = TouchInput._onMove;
			TouchInput._onMove = function(x, y) {
				TouchInput_onMove.apply(this, arguments);
				if(!PressBtn){
					if((st_x-x)<-50 && Math.abs(st_y-y)<100){st_y=9999;Input._currentState['pageup']=true;setTimeout("TouchInput._endRequest('pageup');", 100);}
					if((st_x-x)>50 && Math.abs(st_y-y)<100){st_y=9999;Input._currentState['pagedown']=true;setTimeout("TouchInput._endRequest('pagedown');", 100);}
				}
			}
		}
	}
	
	//AnalogMove.js
	if(PRM.analogmove && Utils.isMobileDevice() || PRM.analogmove && PRM.pcBtn){
		Input.leftStick = function() {
			var threshold = 0.1;
			var x = touchx;
			var y = touchy;
			var tilt = Math.min(1,Math.sqrt(touchx*touchx+touchy*touchy)*PRM.sensitivity);
			var direction = 0.0;
			if (x === 0.0) {
				direction = (-y > 0 ? Math.PI * 0.0 : Math.PI * 1.0);
			} else if (y === 0.0) {
				direction = (-x > 0 ? Math.PI * 0.5 : Math.PI * 1.5);
			} else {
				direction = Math.atan2(-x, -y);
			}
			return {tilt: tilt, direction: direction};
		};
	}
})(MVP_Gamepad);

