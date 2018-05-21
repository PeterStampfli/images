/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * with additional borders for smoothing
 * @constructor VectorMap
 * @param {OutputImage} outputImage - has a pixelcanvas and a transform of output image pixel indices to space coordinates
 * @param {PixelCanvas} inputImage - with the space coordinate to input image pixel coordinates
 * @param {ControlImage} controlimage - to make read pixels opaque
 */

/* jshint esversion:6 */

function VectorMap(outputImage, inputImage, controlImage) {
    this.exists = false;
    this.width = 2;
    this.height = 2;
    this.xArray = new Float32Array(4);
    this.yArray = new Float32Array(4);
    this.lyapunovArray = new Float32Array(4); // array of lyapunov coefficient, negative for invalid points
    this.outputImage = outputImage;
    this.inputImage = inputImage;
    this.controlImage = controlImage;
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
        width = Math.round(width);
        height = Math.round(height);
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
     * @param {function} mapping - maps a position, return lyapunov coefficient>0 for valid points, <0 for invalid points
     */
    VectorMap.prototype.make = function(mapping) {
        this.exists = true;
        let position = new Vector2();
        let x = 0;
        let y = 0;
        let widthPlus = this.width + 2; // adding borders
        let heightPlus = this.height + 2;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let scale = this.outputImage.scale;
        let index = 0;
        y = this.outputImage.cornerY - scale; // additional borders
        for (var j = 0; j < heightPlus; j++) {
            x = this.outputImage.cornerX - scale;
            for (var i = 0; i < widthPlus; i++) {
                position.x = x;
                position.y = y;
                lyapunovArray[index] = mapping(position);
                xArray[index] = position.x;
                yArray[index] = position.y;
                x += scale;
                index++;
            }
            y += scale;
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
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        const length = (this.width + 2) * (this.height + 2);
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] > 0) {
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

    let colorParityNull = new Color(200, 200, 0); //default yellow
    let colorParityOdd = new Color(0, 120, 0); // default cyan
    let colorParityEven = new Color(200, 120, 0); // default: brown


    /**
     * draw on a pixelcanvas use a map
     * color showing structure, based on parity stored in this.xArray
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawStructure
     */
    VectorMap.prototype.drawStructure = function() {
        map = this;
        let pixelCanvas = this.outputImage.pixelCanvas;
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;
        let lyapunovArray = this.lyapunovArray;
        let xArray = this.xArray;
        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {

                    let parity = xArray[indexMap];
                    if (parity == 0) {
                        color.set(colorParityNull);
                    } else if (parity & 1) {
                        color.set(colorParityOdd);
                    } else {
                        color.set(colorParityEven);
                    }
                } else {
                    color.set(this.offColor);
                }
                pixelCanvas.setPixelAtIndex(color, indexPixel++);
            }
        }
        pixelCanvas.showPixel();
    };





    let position = new Vector2();

    /**
     * create color showing input image with low quality, no interpolation, no smoothing
     * @method VectorMap.createInputImageColorLowQuality
     * @param {integer} index - to the map data
     */
    VectorMap.createInputImageColorLowQuality = function(index) {
        position.x = map.xArray[index];
        position.y = map.yArray[index];
        map.inputImage.getNearest(color, position);
        map.controlImage.setOpaque(position);
    };

    // color averaging, to get better image near border, keeping it simple and throughing away points at the border, the region near the border is important

    var basePositionX, basePositionY;
    var colorRed, colorGreen, colorBlue, colorIsValid;

    /*
     * look up interpolated position and its color, add to color
     * exception handling: if interpolation is not possible  then color is not valid
     */

    /*
     * look up interpolated position and its color, add to color
     * use only valid points
     */
    function addInterpolated(t, indexInter) {
        if (map.lyapunovArray[indexInter] >= 0) { // if neighbor is valid use interpolation, most cases
            position.x = basePositionX + t * map.xArray[indexInter];
            position.y = basePositionY + t * map.yArray[indexInter];
            map.inputImage.getNearest(color, position);
            if (color.alpha === 255) {
                colorRed += color.red;
                colorGreen += color.green;
                colorBlue += color.blue;
            } else {
                colorIsValid = false;
            }
        } else {
            colorIsValid = false;
        }

    }
    // only called if basePosition is valid
    VectorMap.createAverageInputColor9 = function(index) {
        let widthPlus = map.width + 2;
        let t = 0.33333;
        basePositionX = map.xArray[index];
        basePositionY = map.yArray[index];
        position.x = basePositionX;
        position.y = basePositionY;
        map.inputImage.getNearest(color, position);
        if (color.alpha < 255) {
            color.set(map.offColor);
            return;
        }
        map.controlImage.setOpaque(position);
        colorRed = color.red;
        colorGreen = color.green;
        colorBlue = color.blue;
        colorIsValid = true;
        let ct = 1 - t;
        basePositionX *= ct;
        basePositionY *= ct;
        addInterpolated(t, index + 1);
        addInterpolated(t, index - 1);
        addInterpolated(t, index + widthPlus);
        addInterpolated(t, index - widthPlus);
        addInterpolated(t, index - widthPlus - 1);
        addInterpolated(t, index + widthPlus + 1);
        addInterpolated(t, index - widthPlus + 1);
        addInterpolated(t, index + widthPlus - 1);
        if (colorIsValid) {
            t = 0.1111111111;
            color.red = Math.round(t * colorRed);
            color.green = Math.round(t * colorGreen);
            color.blue = Math.round(t * colorBlue);
            color.alpha = 255;
        } else {
            color.set(map.offColor);
        }
    };

    var map;
    var color = new Color();

    /**
     * draw on a pixelcanvas use a map using a supplied function mapping(mapOut,color)
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawSimple
     * @param {function} createColor - a VectorMap.prototype method (map,index,color), sets color depending on index to map data
     */
    VectorMap.prototype.draw = function(createColor) {
        map = this;
        let pixelCanvas = this.outputImage.pixelCanvas;
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;
        let lyapunovArray = this.lyapunovArray;
        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {
                    createColor(indexMap);
                } else {
                    color.set(this.offColor);
                }
                pixelCanvas.setPixelAtIndex(color, indexPixel++);
            }
        }
        pixelCanvas.showPixel();
    };



    // the laypunov thing


    /**
     * get combined pixel scale
     * @method VectorMap#getCombinedPixelScale
     * @return float, product of scales
     */
    VectorMap.prototype.getCombinedPixelScale = function() {
        return this.inputImage.linearTransform.scale * this.outputImage.scale;
    };

    /**
     * get maximum and minimum of lyapunov values>0
     * @method VectorMap#lyapunovMinMax
     * @return [minimum,maximum] float array of 2 values
     */
    /*
     VectorMap.prototype.lyapunovMinMax = function() {
        let lyapunovArray = this.lyapunovArray;
        let length=lyapunovArray.length
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

*/


}());
