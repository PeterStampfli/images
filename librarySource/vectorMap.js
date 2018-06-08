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
        let pixel = pixelCanvas.pixel;
        let intOffColor = PixelCanvas.integerOf(this.offColor);
        let intColorParityNull = PixelCanvas.integerOf(colorParityNull);
        let intColorParityOdd = PixelCanvas.integerOf(colorParityOdd);
        let intColorParityEven = PixelCanvas.integerOf(colorParityEven);
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;
        let lyapunovArray = this.lyapunovArray;
        let xArray = this.xArray;
        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        var parity;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {
                    let parity = xArray[indexMap];
                    if (parity == 0) {
                        pixel[indexPixel++] = intColorParityNull;
                    } else if (parity & 1) {
                        pixel[indexPixel++] = intColorParityOdd;
                    } else {
                        pixel[indexPixel++] = intColorParityEven;
                    }
                } else {
                    pixel[indexPixel++] = intOffColor;
                }
            }
        }
        pixelCanvas.showPixel();
    };



    /**
     * draw on a pixelcanvas use a map and an input image as fast as you can
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawFast
     */
    VectorMap.prototype.drawFast = function() {
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        let controlImage = this.controlImage;
        let controlCanvas = controlImage.pixelCanvas;
        let controlDivInputSize = controlImage.controlDivInputSize;
        // input image data
        let inputImageLinearTransform = inputImage.linearTransform;
        let inputImageWidth = inputImage.width;
        let inputImageHeight = inputImage.height;
        let inputImagePixel = inputImage.pixel;
        // transform data
        let shiftX = inputImageLinearTransform.shiftX;
        let shiftY = inputImageLinearTransform.shiftY;
        let cosAngleScale = inputImageLinearTransform.cosAngleScale;
        let sinAngleScale = inputImageLinearTransform.sinAngleScale;
        // map dimensions
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;
        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        // map indices
        let indexMapBase = 0;
        var indexMapHigh;
        var indexMap;
        // color data
        var indexPixel = 0;
        let intOffColor = PixelCanvas.integerOf(this.offColor);
        var x, y, h, k;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {
                    x = xArray[indexMap];
                    y = yArray[indexMap];
                    // faster math floor instead of Math.round()
                    h = (shiftX + cosAngleScale * x - sinAngleScale * y) | 0;
                    k = (shiftY + sinAngleScale * x + cosAngleScale * y) | 0;
                    if ((h < 0) || (h >= inputImageWidth) || (k < 0) || (k >= inputImageHeight)) {
                        pixel[indexPixel++] = intOffColor;
                    } else {
                        pixel[indexPixel++] = inputImagePixel[h + k * inputImageWidth];
                        controlCanvas.setOpaque(h * controlDivInputSize, k * controlDivInputSize);
                    }
                } else {
                    pixel[indexPixel++] = intOffColor;
                }
            }
        }
        pixelCanvas.showPixel();
        controlCanvas.showPixel();
    };




    /**
     * draw on a pixelcanvas use a map and high quality pixel sampling
     * if map is expanding use smoothing, if contracting use interpolation
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#draw
     */
    VectorMap.prototype.draw = function() {
        // the pixel scaling (lyapunov)
        let baseLyapunov = this.inputImage.linearTransform.scale * this.outputImage.scale;
        var lyapunov;
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        let controlImage = this.controlImage;
        let controlCanvas = controlImage.pixelCanvas;
        let controlDivInputSize = controlImage.controlDivInputSize;
        // input transform data
        let inputImageLinearTransform = inputImage.linearTransform;
        let shiftX = inputImageLinearTransform.shiftX;
        let shiftY = inputImageLinearTransform.shiftY;
        let cosAngleScale = inputImageLinearTransform.cosAngleScale;
        let sinAngleScale = inputImageLinearTransform.sinAngleScale;
        // map dimensions
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;

        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;

        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        // color data
        let intOffColor = PixelCanvas.integerOf(this.offColor);
        const color = new Color();
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                lyapunov = lyapunovArray[indexMap] * baseLyapunov;
                if (lyapunov > 0) {
                    let x = xArray[indexMap];
                    let y = yArray[indexMap];
                    let h = shiftX + cosAngleScale * x - sinAngleScale * y;
                    let k = shiftY + sinAngleScale * x + cosAngleScale * y;
                    // beware of byte order
                    if (inputImage.getHighQuality(color, h, k, lyapunov)) {
                        pixelCanvas.setPixelAtIndex(color, indexPixel++);
                        controlCanvas.setOpaque(h * controlDivInputSize, k * controlDivInputSize);
                    } else { // invalid points: use off color
                        pixel[indexPixel++] = intOffColor;
                    }
                } else {
                    pixel[indexPixel++] = intOffColor;
                }
            }
        }
        pixelCanvas.showPixel();
        controlCanvas.showPixel();
    };

    // test smoothing
    /**
     * draw on a pixelcanvas use a map 
     * if map is expanding use smoothing, if contracting use interpolation
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawSimple
     * returns true if colors are correct, else false
     */
    VectorMap.prototype.drawHalf = function() {
        console.log("half");
        let baseLyapunov = this.inputImage.linearTransform.scale * this.outputImage.scale;
        var lyapunov;
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        // input image data
        let inputImageLinearTransform = inputImage.linearTransform;
        // input transform data
        let shiftX = inputImageLinearTransform.shiftX;
        let shiftY = inputImageLinearTransform.shiftY;
        let cosAngleScale = inputImageLinearTransform.cosAngleScale;
        let sinAngleScale = inputImageLinearTransform.sinAngleScale;
        // map dimensions
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;

        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;

        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        // color data
        let intOffColor = PixelCanvas.integerOf(this.offColor);
        const color = new Color();
        var success;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                lyapunov = lyapunovArray[indexMap] * baseLyapunov;
                if (lyapunov >= 0) {
                    let x = xArray[indexMap];
                    let y = yArray[indexMap];
                    let h = shiftX + cosAngleScale * x - sinAngleScale * y;
                    let k = shiftY + sinAngleScale * x + cosAngleScale * y;
                    if (j < 0.5 * height) {
                        success = inputImage.getNearest(color, h, k);
                    } else {
                        success = inputImage.getHighQuality(color, h, k, lyapunov);
                    }
                    if (success) {
                        pixelCanvas.setPixelAtIndex(color, indexPixel++);
                        // controlimage is not visible, do not draw
                    } else { //beware of byte order
                        pixel[indexPixel++] = intOffColor;
                    }
                } else { // invalid points: use off color
                    pixel[indexPixel++] = intOffColor;
                }
            }
        }
        pixelCanvas.showPixel();
    };


    // test interpolation

    /**
     * draw on a pixelcanvas use a map 
     * if map is expanding use smoothing, if contracting use interpolation
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawSimple
     * returns true if colors are correct, else false
     */
    VectorMap.prototype.drawInterpolation = function() {
        console.log("test interpolation");
        let baseLyapunov = this.inputImage.linearTransform.scale * this.outputImage.scale;
        var lyapunov;
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        // input image data
        let inputImageLinearTransform = inputImage.linearTransform;
        // input transform data
        let shiftX = inputImageLinearTransform.shiftX;
        let shiftY = inputImageLinearTransform.shiftY;
        let cosAngleScale = inputImageLinearTransform.cosAngleScale;
        let sinAngleScale = inputImageLinearTransform.sinAngleScale;
        // map dimensions
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;

        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;

        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        // color data
        let intOffColor = PixelCanvas.integerOf(this.offColor);
        const color = new Color();
        var success;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                lyapunov = lyapunovArray[indexMap];
                if (lyapunov >= 0) {
                    let x = xArray[indexMap];
                    let y = yArray[indexMap];
                    let h = shiftX + cosAngleScale * x - sinAngleScale * y;
                    let k = shiftY + sinAngleScale * x + cosAngleScale * y;
                    // beware of byte order
                    if (j < 0.33 * height) {
                        success = inputImage.getCubic(color, h, k);
                    } else if (j < 0.66 * height) {
                        success = inputImage.getLinearWithAlpha(color, h, k);
                    } else {
                        success = inputImage.getNearest(color, h, k);
                    }
                    if (success) {
                        pixelCanvas.setPixelAtIndex(color, indexPixel++);
                    } else { // invalid points: use off color
                        pixel[indexPixel++] = intOffColor;
                    }
                } else {
                    pixel[indexPixel++] = intOffColor;
                }
            }
        }
        pixelCanvas.showPixel();
    };

}());
