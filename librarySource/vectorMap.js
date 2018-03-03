/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * @constructor VectorMap
 */

/* jshint esversion:6 */

function VectorMap() {
    this.cornerX = 0;
    this.cornerY = 0;
    this.scale = 1;
    this.zoomFactor = 1.05;
    this.width = 1;
    this.height = 1;
    this.xArray = new Floats32Array(1);
    this.yArray = new Floats32Array(1);
}


(function() {
    "use strict";

    /**
     * set the position of the corner in the input coordinate system
     * @method VectorMap#setCenter
     * @param {float} x - coordinate of corner
     * @param {float} y - coordinate of corner
     */
    VectorMap.prototype.setCorner = function(x, y) {
        this.cornerX = x;
        this.cornerY = y;
    };

    /**
     * shift the position  
     * @method VectorMap#shiftCorner
     * @param {float} x - change in coordinate of corner
     * @param {float} y - change in coordinate of corner
     */
    VectorMap.prototype.shiftCorner = function(x, y) {
        this.cornerX += x;
        this.cornerY += y;
    };

    /**
     * make that the origin of coordinate system is in the center 
     * @method VectorMap#center
     */
    VectorMap.prototype.center = function() {
        this.cornerX = -this.scale * 0.5 * (this.width - 1);
        this.cornerY = y;
    };

    /**
     * set the scale 
     * @method VectorMap#setScale
     * @param {float} scale
     */
    VectorMap.prototype.setScale = function(scale) {
        this.scale = scale;
    };

    /**
     * multiply the scale for zooming
     * @method VectorMap#multiplyScale
     * @param {float} factor
     */
    VectorMap.prototype.multiplyScale = function(factor) {
        this.scale *= factor;
    };


    /**
     * zoom with given factor to/from given point (mouse position)
     * @method VectorMap#zoom
     * @param {float} factor - zoom factor
     * @param {float} x - coordinate of zooming center
     * @param {float} y - coordinate of zooming center
     */
    VectorMap.prototype.zoom = function(factor, x, y) {
        this.shiftCorner(this.scale * (1 - factor) * x, this.scale * (1 - factor) * y);
        this.scale *= factor;
    };

    /**
     * mouse shifts the image, action method for mouse handler linked to the canvas, needs image update
     * @method Vector.mouseShift
     * @param {MouseEvents} mouseEvents - contains the data
     */
    VectorMap.prototype.mouseShift = function(mouseEvents) {
        this.shiftCorner(-mouseEvents.dx, -mouseEvents.dy);
    };

    /**
     * mouse wheel zooms the image, action method for mouse handler linked to the canvas, needs image update
     * @method Vector.mouseZoom
     * @param {MouseEvents} mouseEvents - contains the data
     */
    VectorMap.prototype.mouseZoom = function(mouseEvents) {
        if (mouseEvents.wheelData > 0) {
            this.zoom(this.zoomFactor);
        } else {
            this.zoom(1 / this.zoomFactor);
        }
    };

    /**
     * set or reset the dimensions of the array, rescale to obtain the same region
     * @method VectorMap#setArrayDimensions
     * @param {integer} width - of the map
     * @param {integer} height - of the map
     */
    VectorMap.prototype.setArrayDimensions = function(width, height) {
        this.multiplyScale(Math.sqrt(this.width * this.height / width / height));
        this.width = width;
        this.height = height;
        const length = width * heigth;
        this.xArray = new Floats32Array(length);
        this.yArray = new Floats32Array(length);
    };

    /**
     * make a map using a supplied function mapping(mapIn,mapOut)
     * @method VectorMap#make
     * @param {function} mapping - from mapIn to mapOut
     */
    VectorMap.prototype.make = function(mapping) {
        let mapIn = new Vector2();
        let mapOut = new Vector2();
        let width = this.width;
        let height = this.height;
        let scale = this.scale;
        let index = 0;
        mapIn.y = this.cornerY;
        for (var j = 0; j < height; j++) {
            mapIn.x = this.cornerX;
            for (var i = 0; i < width; i++) {
                mapping(mapIn, mapOut);
                xArray[index] = mapOut.x;
                yArray[index] = mapOut.y;
                mapIn.x += scale;
                index++;
            }
            mapIn.y += scale;
        }
    };

}());
