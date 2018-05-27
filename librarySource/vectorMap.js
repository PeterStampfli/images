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
       let intColorParityNull=PixelCanvas.integerOf(colorParityNull);
       let intColorParityOdd=PixelCanvas.integerOf(colorParityOdd);
       let intColorParityEven=PixelCanvas.integerOf(colorParityEven);
        let height = this.height;
        let width = this.width;
        let widthPlus = width + 2;
        let lyapunovArray = this.lyapunovArray;
        let xArray = this.xArray;
        let indexMapBase = 0;
        var indexMapHigh;
        var indexPixel = 0;
        var parity,intColor;
        for (var j = 1; j <= height; j++) {
            indexMapBase += widthPlus;
            indexMapHigh = indexMapBase + width;
            for (var indexMap = indexMapBase + 1; indexMap <= indexMapHigh; indexMap++) {
                if (lyapunovArray[indexMap] >= 0) {
                    let parity = xArray[indexMap];
                    if (parity == 0) {
                        intColor=intColorParityNull;
                    } else if (parity & 1) {
                        intColor=intColorParityOdd;
                    } else {
                        intColor=intColorParityEven;
                    }
                } else {
                    intColor=intOffColor;
                }
                            pixel[indexPixel++] = intColor;
            }
        }
        pixelCanvas.showPixel();
    };



    /**
     * draw on a pixelcanvas use a map and an input image as fast as you can
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawSimple
     * @param {function} createColor - a VectorMap.prototype method (map,index,color), sets color depending on index to map data
     */
    VectorMap.prototype.drawFast = function() {
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        let controlImage = this.controlImage;
        let controlCanvas=controlImage.pixelCanvas;
        let controlDivInputSize=controlImage.controlDivInputSize;
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
        var intColor;
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
                        intColor = intOffColor;
                    } else {
                        intColor = inputImagePixel[h + k * inputImageWidth];
                        controlCanvas.setOpaque(h*controlDivInputSize,k*controlDivInputSize);
                        //////////////////////////////////////////////////////
                    }
                } else {
                    intColor = intOffColor;
                }
                pixel[indexPixel++] = intColor;
            }
        }
        pixelCanvas.showPixel();
    };


    var map, inputImage, controlImage, xArray, yArray,lyapunovArray;
    var inputImageWidth,inputImageHeight,inputImagePixel;
    var shiftX, shiftY, cosAngleScale, sinAngleScale;
    var offColor;
    var color = new Color(0, 0, 0, 255);
    let position = new Vector2();

    /*
     * set map to this map, and other variables
     */
    VectorMap.prototype.setMap = function() {
        map = this;
        inputImage = map.inputImage;
        inputImageWidth = inputImage.width;
        inputImageHeight = inputImage.height;
        inputImagePixel = inputImage.pixel;
        controlImage = map.controlImage;
        xArray = map.xArray;
        yArray = map.yArray;
        lyapunovArray=map.lyapunovArray;
        let inputImageLinearTransform = inputImage.linearTransform;
        shiftX = inputImageLinearTransform.shiftX;
        shiftY = inputImageLinearTransform.shiftY;
        cosAngleScale = inputImageLinearTransform.cosAngleScale;
        sinAngleScale = inputImageLinearTransform.sinAngleScale;
        offColor = map.offColor;
    };



    // color averaging, to get better image near border, keeping it simple and throughing away points at the border, the region near the border is important

    var basePositionX, basePositionY;
    var colorRed, colorGreen, colorBlue, colorAlpha, colorIsValid;



    /*
     * look up interpolated position and its color, add to color
     * use only valid points
     * treating all color components equal thus no problem with byte order
     * return true if both points are ok and color added, return false if color becomes invalid
     */
    function addInterpolated(t, indexInter) {
        if (map.lyapunovArray[indexInter] < 0) { 
                        colorIsValid = false;

        }
            let x = basePositionX + t * xArray[indexInter];
            let y = basePositionY + t * yArray[indexInter];
            // faster math floor instead of Math.round()
            let h = (shiftX + cosAngleScale * x - sinAngleScale * y) | 0;
            let k = (shiftY + sinAngleScale * x + cosAngleScale * y) | 0;
            if ((h < 0) || (h >= inputImageWidth) || (k < 0) || (k >= inputImageHeight)) {
                colorIsValid = false;
             return false;
           } else {
                let intColor = inputImagePixel[h + k * inputImageWidth];
                colorRed += intColor & 0xff;
                colorGreen += (intColor >>> 8) & 0xff;
                colorBlue += (intColor >>> 16) & 0xff;
                colorAlpha += (intColor >>> 24) & 0xff;
            }
              return true;
      
    }
    // only called if basePosition is valid
    // calculate average color of 9 points
    // returns true if color is correct, else false
    VectorMap.createAverageInputColor9 = function(index) {
        let widthPlus = map.width + 2;
        let t = 0.33333;
        basePositionX = xArray[index];
        basePositionY = yArray[index];
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
            colorRed = Math.round(t * colorRed);
            colorGreen = Math.round(t * colorGreen);
            colorBlue = Math.round(t * colorBlue);
            colorAlpha = 255;
            return true;
        } else {
            return false;
        }
    };


    /**
     * draw on a pixelcanvas use a map using a supplied function mapping(mapOut,color)
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawSimple
     * @param {function} createColor - a VectorMap.prototype method (map,index,color), sets colorRed,...colorAlpha depending on index to map data
     * returns true if colors are correct, else false
     */
    VectorMap.prototype.draw = function(createColor) {
        this.setMap();
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
          let intOffColor = PixelCanvas.integerOf(this.offColor);
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
                    if (createColor(indexMap)) {
                        pixel[indexPixel++] = colorRed | colorGreen << 8 | colorBlue << 16 | colorAlpha << 24;

                    } else { //beware of byte order
                            pixel[indexPixel++] = intOffColor;

                    }
                } else {
                            pixel[indexPixel++] = intOffColor;
                }

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
