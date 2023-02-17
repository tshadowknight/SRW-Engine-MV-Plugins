//==============================================================================
//  Unlocked Camera v2 by Rehtinor
//  RiP_UnlockedCamera.js
//==============================================================================
/*:
 * @author Rehtinor
 * @plugindesc Unlock the camera from map edges keeping it centered on the player.
 *
 * @param Default Camera
 * @desc Whether the camera should default to locking on screen edge.
 * @default false
 * @type boolean
 * @on UNLOCKED
 * @off LOCKED
 *
 * @help
 * Allows control over whether or not the camera will lock on map edges. If the
 * camera does not lock on map edges then the player will always be centered.
 * This helps bypass the need to surround your map with empty tiles to ensure
 * the camera will always be centered on the player.
 *
 * You can specify a default which applies to every map AND notetag specific
 * maps.
 *
 * To make a specific map behave as normal simply add the following notetag.
 * <Locked>
 *
 * To make the camera not lock on map edges add this notetag instead.
 * <Unlocked>
 *
 * The legacy notetags still work, so maps that use it won't break.
 * <Camera: 0/1>
 *
 * If a notetag is used it takes priority over the 'Default Camera' parameter.
*/
//==============================================================================
 
(function() {
 
//==============================================================================
 
var parameters = PluginManager.parameters( 'RiP_UnlockedCamera' );
 
var DefaultCamera = eval( parameters[ 'Default Camera' ] );
 
parameters = null;
 
//==============================================================================
//  Game_Map
//==============================================================================
 
var Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function( id )
{
    Game_Map_setup.call( this, id );
    var mode = Number( $dataMap.meta[ 'Camera' ] )
    if ( isNaN( mode ) )
        this._cameraMode = DefaultCamera;
    if ( $dataMap.meta[ 'Locked' ] )
        this._cameraMode = false;
    if ( $dataMap.meta[ 'Unlocked' ] )
        this._cameraMode = true;
}
 
Game_Map.prototype.cameraUnlocked = function()
{
    return this._cameraMode;
}
 
Game_Map.prototype.cameraLocked = function()
{
    return !this._cameraMode;
}
 
var Game_Map_scrollDown = Game_Map.prototype.scrollDown;
Game_Map.prototype.scrollDown = function( distance )
{
    if ( this.isLoopVertical() || this.cameraLocked() )
    {
        Game_Map_scrollDown.call( this, distance );
    }
    else
    {
        var lastY = this._displayY;
        this._displayY += distance;
        this._parallaxY += this._displayY - lastY;
    }
}
 
var Game_Map_scrollLeft = Game_Map.prototype.scrollLeft;
Game_Map.prototype.scrollLeft = function( distance )
{
    if ( this.isLoopHorizontal() || this.cameraLocked() )
    {
        Game_Map_scrollLeft.call( this, distance );
    }
    else
    {
        var lastX = this._displayX;
        this._displayX -= distance;
        this._parallaxX += this._displayX - lastX;
    }
}
 
var Game_Map_scrollRight = Game_Map.prototype.scrollRight;
Game_Map.prototype.scrollRight = function( distance )
{
    if ( this.isLoopHorizontal() || this.cameraLocked() )
    {
        Game_Map_scrollRight.call( this, distance );
    }
    else
    {
        var lastX = this._displayX;
        this._displayX += distance;
        this._parallaxX += this._displayX - lastX;
    }
}
 
var Game_Map_scrollUp = Game_Map.prototype.scrollUp;
Game_Map.prototype.scrollUp = function( distance )
{
    if ( this.isLoopVertical() || this.cameraLocked() )
    {
        Game_Map_scrollUp.call( this, distance );
    }
    else
    {
        var lastY = this._displayY;
        this._displayY -= distance;
        this._parallaxY += this._displayY - lastY;
    }
}
 
Game_Map.prototype.setDisplayPos = function( x, y )
{
    if ( this.isLoopHorizontal() )
    {
        this._displayX = x.mod( this.width() );
        this._parallaxX = x;
    }
    else
    {
        if ( this.cameraUnlocked() )
        {
            this._displayX = x;
        }
        else
        {
            var endX = this.width() - this.screenTileX();
            this._displayX = endX < 0 ? endX / 2 : x.clamp( 0, endX );
        }
        this._parallaxX = this._displayX;
    }
    if ( this.isLoopVertical() )
    {
        this._displayY = y.mod( this.height() );
        this._parallaxY = y;
    }
    else
    {
        if ( this.cameraUnlocked() )
        {
            this._displayY = y;
        }
        else
        {
            var endY = this.height() - this.screenTileY();
            this._displayY = endY < 0 ? endY / 2 : y.clamp( 0, endY );
        }
        this._parallaxY = this._displayY;
    }
}
 
//==============================================================================
 
})();
 
//==============================================================================
//  End of File
//==============================================================================

     

