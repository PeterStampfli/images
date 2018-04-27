/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * with additional borders for smoothing
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
    this.lyapunovArray = new Float32Array(4); // array of lyapunov coefficient, negative for invalid points
    this.outputImage = outputImage;
    this.offColor = new Color(127, 127, 127, 0); //transparent grey for pixels without image
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
            const length = (width + 2) * (height + 2);
            if (length > this.xArray.length) {
                this.xArray = new Float32Array(length);
                this.yArray = new Float32Array(length);
                this.lyapunovArray = new Float32Array(length);
            }
        }
    };

    /**
     * set the off-color to the values of another color
     * @VectorMap#setOffColor
     * @param {Color} offColor
     */
    VectorMap.prototype.setOffColor = function(offColor) {
        this.offColor.set(offColor);
    };

    /**
     * make a map using a supplied function mapping(mapIn,mapOut)
     * @method VectorMap#make
     * @param {function} mapping - from mapIn to mapOut, return lyapunov coefficient>0 for valid points, <0 for invalid points
     */
    VectorMap.prototype.make = function(mapping) {
        this.exists = true;
        let mapIn = new Vector2();
        let mapOut = new Vector2();
        let widthPlus = this.width + 2; // adding borders
        let heightPlus = this.height + 2;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let scale = this.outputImage.scale;
        let index = 0;
        mapIn.y = this.outputImage.cornerY - scale; // additional borders
        for (var j = 0; j < heightPlus; j++) {
            mapIn.x = this.outputImage.cornerX - scale;
            for (var i = 0; i < widthPlus; i++) {
                lyapunovArray[index] = mapping(mapIn, mapOut);
                xArray[index] = mapOut.x;
                yArray[index] = mapOut.y;
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
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        const length = (this.width + 2) * (this.height + 2);
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] >= 0) {
                sum++;
                sumX += xArray[index];
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
        const length = (this.width + 2) * (this.height + 2);
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
        let lyapunovArray = this.lyapunovArray;
        const length = (this.width + 2) * (this.height + 2);
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] < limit) {
                x = xArray[index];
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
        let lyapunovArray = this.lyapunovArray;
        let pixelCanvas = this.outputImage.pixelCanvas;
        let height = this.height;
        let width = this.width;

        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        for (var j = 1; j <= height; j++) {
            indexMapBase += width + 2;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {
                    mapOut.x = xArray[indexMap];
                    mapOut.y = yArray[indexMap];
                    mapping(mapOut, color);
                } else {
                    color.set(this.offColor);
                }
                pixelCanvas.setPixelAtIndex(color, indexPixel++);
            }
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
        let pixelCanvas = this.outputImage.pixelCanvas;
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
                mapOut.x = 0.5 * (baseX + xArray[indexPlusX]);
                mapOut.y = 0.5 * (baseY + yArray[indexPlusX]);
                mapping(mapOut, colorPlusX);
                mapOut.x = 0.5 * (baseX + xArray[indexPlusY]);
                mapOut.y = 0.5 * (baseY + yArray[indexPlusY]);
                mapping(mapOut, colorPlusY);
                mapOut.x = 0.5 * (baseX + xArray[indexPlusXY]);
                mapOut.y = 0.5 * (baseY + yArray[indexPlusXY]);
                mapping(mapOut, colorPlusXY);
                //averaging with shift, including rounding
                color.red = (2 + baseColor.red + colorPlusX.red + colorPlusY.red + colorPlusXY.red) >> 2;
                color.green = (2 + baseColor.green + colorPlusX.green + colorPlusY.green + colorPlusXY.green) >> 2;
                color.blue = (2 + baseColor.blue + colorPlusX.blue + colorPlusY.blue + colorPlusXY.blue) >> 2;
                color.alpha = (2 + baseColor.alpha + colorPlusX.alpha + colorPlusY.alpha + colorPlusXY.alpha) >> 2;
                pixelCanvas.setPixelAtIndex(color, baseIndex);
                baseIndex++;
                indexPlusY++;
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
