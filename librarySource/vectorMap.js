/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * @constructor VectorMap
 */

/* jshint esversion:6 */

function VectorMap() {
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 1;
    this.spaceVector = newVector2();
    this.mappedVector = newVector2();
    this.width = 1;
    this.height = 1;
    this.xArray = new Floats32Array(1);
    this.yArray = new Floats32Array(1);


}


(function() {
    "use strict";


    /**
     * set the position of the center 
     * @method VectorMap#setCenter
     * @param {float} x - coordinate of center
     * @param {float} y - coordinate of center
     */
    VectorMap.prototype.setCenter = function(x, y) {
        this.centerX = x;
        this.centerY = y;
    };

    /**
     * shift the position of the center 
     * @method VectorMap#shiftCenter
     * @param {float} x - change in coordinate of center
     * @param {float} y - change in coordinate of center
     */
    VectorMap.prototype.shiftCenter = function(x, y) {
        this.centerX += x;
        this.centerY += y;
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


}());
