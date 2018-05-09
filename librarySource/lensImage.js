/**
 * magnifying canvas 
 * @constructor LensImage
 * @param {String} idName - html identifier
 */

/* jshint esversion:6 */


function LensImage(idName) {
    "use strict";

    this.pixelCanvas = new PixelCanvas(idName);
    this.object = null;
    this.objectCornerX = 0;
    this.objectCornerY = 0;
    this.magnification = 4;

}

(function() {
    "use strict";


    // set transform of object



    /**
     * set object of the lens 
     * @method LensImage#setObject
     * @param {PixelCanvas} pixelCanvas
     */
    LensImage.prototype.setObject = function(pixelCanvas) {
        this.object = pixelCanvas;


    };



}());
