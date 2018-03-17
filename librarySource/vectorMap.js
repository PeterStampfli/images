/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * @constructor VectorMap
 * @param {OutputImage} outputImage - has a pixelcanvas and a transform of pixel to map input coordinates
 */

/* jshint esversion:6 */

function VectorMap(outputImage) {
    this.exists = false;
    this.width = 2;
    this.height = 2;
    this.xArray = new Float32Array(4);
    this.yArray = new Float32Array(4);
    this.outputImage = outputImage;
}

(function() {
    "use strict";

    /**
     * set or reset the dimensions of the map, rescale to obtain the same region, does nothing if size has not changed
     * @method VectorMap#setSize
     * @param {integer} width - of the map
     * @param {integer} height - of the map
     */
    VectorMap.prototype.setSize = function(width, height) {
        if ((width != this.width) || (height != this.heigth)) {
            this.width = width;
            this.height = height;
            const length = width * height;
            if (length > this.xArray.length) {
                this.xArray = new Float32Array(length);
                this.yArray = new Float32Array(length);
            }
        }
    };

    /**
     * make a map using a supplied function mapping(mapIn,mapOut)
     * may return "invalid" points with a very large x-coordinate as marker
     * @method VectorMap#make
     * @param {function} mapping - from mapIn to mapOut, return true if it has a valid point
     */
    VectorMap.prototype.make = function(mapping) {
        this.exists = true;
        let mapIn = new Vector2();
        let mapOut = new Vector2();
        let width = this.width;
        let height = this.height;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let scale = this.outputImage.scale;
        let index = 0;
        const invalid = 1e20;
        mapIn.y = this.outputImage.cornerY;
        for (var j = 0; j < height; j++) {
            mapIn.x = this.outputImage.cornerX;
            for (var i = 0; i < width; i++) {
                if (mapping(mapIn, mapOut)) {
                    xArray[index] = mapOut.x;
                    yArray[index] = mapOut.y;
                } else {
                    xArray[index] = invalid;
                    yArray[index] = invalid;
                }
                mapIn.x += scale;
                index++;
            }
            mapIn.y += scale;
        }
    };

    /**
     * determine center of gravity of map (to shift it to origin)
     * "invalid" points may be marked with a very large x-coordinate -> do not count
     * @method VectorMap#getOutputCenter
     * @param {Vector2} center - will be set to center of gravity
     */
    VectorMap.prototype.getOutputCenter = function(center) {
        let sumX = 0;
        let sumY = 0;
        let sum = 0;
        let x = 0;
        const limit = 10000;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let length = this.width * this.height;
        for (var index = 0; index < length; index++) {
            x = xArray[index];
            if (x < limit) {
                sum++;
                sumX += x;
                sumY += yArray[index];
            }
        }
        if (sum > 0) {
            center.x = sumX / sum;
            center.y = sumY / sum;
        } else {
            center.x = 0;
            center.y = 0;
        }
    };

    /**
     * shift the map output, including invalid points, to move the point new Origin to (0,0)
     * @method VectorMap#shiftOutput
     * @param {Vector2} newOrigin
     */
    VectorMap.prototype.shiftOutput = function(newOrigin) {
        let dx = -newOrigin.x;
        let dy = -newOrigin.y;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let length = this.width * this.height;
        for (var index = 0; index < length; index++) {
            xArray[index] += dx;
            yArray[index] += dy;
        }
    };

    /**
     * determine range of coordinates
     * "invalid" points may be marked with a very large x-coordinate -> do not count
     * @method VectorMap#getOutputRange
     * @param {Vector2} lowerLeft - will be set to lower left corner of data (minima)
     * @param {Vector2} upperRight - will be set to upper right corner of data (maxima)
     */
    VectorMap.prototype.getOutputRange = function(lowerLeft, upperRight) {
        let left = 1e10;
        let right = -1e10;
        let lower = 1e10;
        let upper = -1e10;
        let x = 0;
        const limit = 10000;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let length = this.width * this.height;
        for (var index = 0; index < length; index++) {
            x = xArray[index];
            if (x < limit) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                x = yArray[index];
                lower = Math.min(lower, x);
                upper = Math.max(upper, x);
            }
        }
        lowerLeft.x = left;
        lowerLeft.y = lower;
        upperRight.x = right;
        upperRight.y = upper;
    };

    /**
     * draw on a pixelcanvas use a map using a supplied function mapping(mapOut,color)
     * "invalid" points may be marked with a very large x-coordinate -> mapping returns special off-color
     * @method VectorMap#drawSimple
     * @param {function} mapping - from coordinates (x,y) to color
     */
    VectorMap.prototype.drawSimple = function(mapping) {
        let mapOut = new Vector2();
        let color = new Color(); // default: opaque black
        let xArray = this.xArray;
        let yArray = this.yArray;
        let length = this.width * this.height;
        let pixelCanvas = this.outputImage.pixelCanvas;
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
     * @method VectorMap#drawSmooth
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


    /**
     * the choosen drawing method (simple or smoothed)
     * @method VectorMap#draw
     * @param {function} mapping - from mapOut to color
     */
    VectorMap.prototype.draw = VectorMap.prototype.drawSimple;

    /**
     * choose the smoothing method
     * @method VectorMap#chooseSmoothing
     * @param {integer} n - 0 for no smoothing, 1 for smoothing
     */
    VectorMap.prototype.chooseSmoothing = function(n) {
        if (n == 0) {
            VectorMap.prototype.draw = VectorMap.prototype.drawSimple;
        } else {
            VectorMap.prototype.draw = VectorMap.prototype.drawSmooth;
        }
    };

}());
