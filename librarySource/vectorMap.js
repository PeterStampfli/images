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
    this.xArray = new Float32Array(1);
    this.yArray = new Float32Array(1);
    this.pixelCanvas = null;
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
     * set or reset the dimensions of the map, rescale to obtain the same region
     * @method VectorMap#setArrayDimensions
     * @param {integer} width - of the map
     * @param {integer} height - of the map
     */
    VectorMap.prototype.setMapDimensions = function(width, height) {
        this.multiplyScale(Math.sqrt(this.width * this.height / width / height));
        this.width = width;
        this.height = height;
        const length = width * height;
        this.xArray = new Float32Array(length);
        this.yArray = new Float32Array(length);
    };

    /**
     * adjust map dimensions to pixelCanvas, draw on this canvas, call after each canvas resize
     * @VectorMap#setCanvas
     * @param {PixelCanvas} pixelCanvas
     */
    VectorMap.prototype.setCanvas = function(pixelCanvas) {
        this.setMapDimensions(pixelCanvas.width, pixelCanvas.height);
        this.pixelCanvas = pixelCanvas;
    };

    /**
     * make a map using a supplied function mapping(mapIn,mapOut)
     * may return "invalid" points with a very large x-coordinate as marker
     * @method VectorMap#make
     * @param {function} mapping - from mapIn to mapOut
     */
    VectorMap.prototype.make = function(mapping) {
        let mapIn = new Vector2();
        let mapOut = new Vector2();
        let width = this.width;
        let height = this.height;
        let xArray = this.xArray;
        let yArray = this.yArray;
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

    /**
     * draw on a pixelcanvas use a map using a supplied function mapping(mapOut,color)
     * "invalid" points may be marked with a very large x-coordinate -> mapping returns special off-color
     * @method VectorMap#draw
     * @param {function} mapping - from mapOut to color
     */
    VectorMap.prototype.draw = function(mapping) {
        let mapOut = new Vector2();
        let color = new Color(); // default: opaque black
        let xArray = this.xArray;
        let yArray = this.yArray;
        let length = xArray.length;
        let pixelCanvas = this.pixelCanvas;
        for (var index = 0; index < length; index++) {
            mapOut.x = xArray[index];
            mapOut.y = yArray[index];
            mapping(mapOut, color);
            pixelCanvas.setPixelAtIndex(color, index);
        }
        pixelCanvas.showPixel();
    };

    /**
     * use 2x2 averaging to draw with smoothing on a pixelcanvas use a map using a supplied function mapping(mapOut,color)
     * "invalid" points may be marked with a very large x-coordinate -> mapping returns special off-color
     * @method VectorMap#draw
     * @param {function} mapping - from mapOut to color
     */
    VectorMap.prototype.drawSmooth = function(mapping) {
        let mapOut = new Vector2();
        let width = this.width;
        let height = this.height;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let baseX, baseY;
        let color = new Color(); // default: opaque black
        let baseColor = new Color();
        let colorPlusX = new Color();
        let colorPlusY = new Color();
        let colorPlusXY = new Color();
        let baseIndex = 0;
        let indexPlusX, indexPlusY, indexPlusXY;
        let pixelCanvas = this.pixelCanvas;
        for (var j = 0; j < height; j++) {
            if (j == height - 1) { // at top pixels beware of out of bounds indices
                indexPlusY = baseIndex;
            } else {
                indexPlusY = baseIndex + width;
            }
            for (var i = 0; i < width; i++) {
                if (i < width - 1) { // at right pixels beware of out of bounds indices
                    indexPlusX = baseIndex + 1;
                    indexPlusXY = indexPlusY + 1;
                } else {
                    indexPlusX = baseIndex;
                    indexPlusXY = indexPlusY;
                }
                baseX = xArray[baseIndex];
                baseY = yArray[baseIndex];
                mapOut.x = baseX;
                mapOut.y = baseY;
                mapping(mapOut, baseColor);
                mapout.x = 0.5 * (baseX + xArray[indexPlusX]);
                mapout.y = 0.5 * (baseY + yArray[indexPlusX]);
                mapping(mapOut, colorPlusX);
                mapout.x = 0.5 * (baseX + xArray[indexPlusY]);
                mapout.y = 0.5 * (baseY + yArray[indexPlusY]);
                mapping(mapOut, colorPlusY);
                mapout.x = 0.5 * (baseX + xArray[indexPlusXY]);
                mapout.y = 0.5 * (baseY + yArray[indexPlusXY]);
                mapping(mapOut, colorPlusXY);
                //averaging with shift, including rounding
                color.red = (2 + baseColor.red + colorPlusX.red + colorPlusY.red + colorPlusXY.red) >> 2;
                color.green = (2 + baseColor.green + colorPlusX.green + colorPlusY.green + colorPlusXY.green) >> 2;
                color.blue = (2 + baseColor.blue + colorPlusX.blue + colorPlusY.blue + colorPlusXY.blue) >> 2;
                color.alpha = (2 + baseColor.alpha + colorPlusX.alpha + colorPlusY.alpha + colorPlusXY.alpha) >> 2;
                pixelCanvas.setPixelAtIndex(color, index);
            }
        }
        pixelCanvas.showPixel();
    };

}());
