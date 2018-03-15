/**
 * on-screen canvas with a map and mouse events to change the map
 * maybe it would be better to isolate the map and do interactions outside ...
 * @constructor OutputImage
 * @param {String} idName - html identifier
 * @param {Map} map - a VectorMap or other map object with the same functions
 * @param {integer} width - initial width
 * @param {integer} height - initial height
 */

/* jshint esversion:6 */

function OutputImage(idName, map, width, height) {
    "use strict";

    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.map = map;

    // set size, makes it visible, creates pixel
    this.setSize(width, height);

    // linking pixelcanvas to setMapDimension
    this.map.pixelCanvas = this.pixelCanvas;

    /**
     * what to do if map changes (redraw image)
     * @method OutputImage#action
     */
    this.action = function() {};

    /*
     * add standard down, up and out actions
     */
    this.mouseEvents.addDownAction();
    this.mouseEvents.addUpAction();
    this.mouseEvents.addOutAction();

    const outputImage = this;

    // mouse wheel changes scale
    this.mouseEvents.addWheelAction(function(mouseEvents) {
        outputImage.map.mouseZoom(mouseEvents);
        outputImage.action();
    });

    // mouse move shifts image
    this.mouseEvents.addMoveAction(function(mouseEvents) {
        outputImage.map.mouseShift(mouseEvents);
        outputImage.action();
    });
}

(function() {
    "use strict";

    /**
     * set size of the output canvas and its map, create pixel
     * @method OutputImage#setSize
     * @param {float} width
     * @param {float} height
     */
    OutputImage.prototype.setSize = function(width, height) {
        this.pixelCanvas.setupOnscreen(width, height);
        this.map.setMapDimensions(width, height);
    };

    /**
     * set the action() - function for this controller, called at each position or scale change for instant following
     * @method OutputImage#setAction
     * @param {function} action
     */
    OutputImage.prototype.setAction = function(action) {
        this.action = action;
    };

}());
