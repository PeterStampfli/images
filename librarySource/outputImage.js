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
    
    // the linear transform between pixel indices and image coordinates
    // (x,y)= (cornerX,cornerY)+scale*(i,j)
    
    this.cornerX = 0;
    this.cornerY = 0;
    this.scale = 1;


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
        outputImage.mouseZoom(mouseEvents);
        outputImage.action();
    });

    // mouse move shifts image
    this.mouseEvents.addMoveAction(function(mouseEvents) {
        outputImage.map.mouseShift(mouseEvents);
        outputImage.mouseShift(mouseEvents);
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
        this.pixelCanvas.setupOnscreen(width, height);  // does nothing if size has not changed
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
    
    // modifying the input transform
    /**
     * set input coordinates
     * @method OutputImage#setCoordinates
     * @param {float} xMin - lowest value for x-coordinate
     * @param {float} yMin - lowest value for y-coordinate
     * @param {float} xMax - highest value for x-coordinate
     */
    OutputImage.prototype.setCoordinates=function(xMin,yMin,xMax){
        this.cornerX=xMin;
        this.cornerY=yMin;
        if (this.pixelCanvas.width > 1) {
            this.scale=(xMax - xMin) / (this.pixelCanvas.width - 1);
        }
        else {
            console.log(" ***Output.setCoordinates: width of canvas=0");
        }
    };
    
    /**
     * mouse shifts the image, action method for mouse handler linked to the canvas, 
     * needs image update
     * @method OutputImage#mouseShift
     * @param {MouseEvents} mouseEvents - contains the data
     */
    OutputImage.prototype.mouseShift = function(mouseEvents) {
        this.cornerX-=mouseEvents.dx * this.scale;
        this.cornerY-=mouseEvents.dy * this.scale;
    };

    
    /**
     * zoom with given factor to/from given point (mouse position) as center
     * @method OutputImage#zoom
     * @param {float} factor - zoom factor
     * @param {float} x - coordinate of zooming center
     * @param {float} y - coordinate of zooming center
     */
    OutputImage.prototype.zoom = function(factor, x, y) {
        this.cornerX+=this.scale * (1 - factor) * x;
        this.cornerY+=this.scale * (1 - factor) * y;
        this.scale*=factor;
    };

    /**
     * mouse wheel zooms the image, action method for mouse handler linked to the canvas, 
     * needs image update
     * @method OutputImage#mouseZoom
     * @param {MouseEvents} mouseEvents - contains the data
     */
    OutputImage.prototype.mouseZoom = function(mouseEvents) {
        if (mouseEvents.wheelDelta > 0) {
            this.zoom(this.zoomFactor, mouseEvents.x, mouseEvents.y);
        } else {
            this.zoom(1 / this.zoomFactor, mouseEvents.x, mouseEvents.y);
        }
    };


}());
