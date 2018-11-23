/**
 * making a mapping from a two-dimensional array to a space position to a single vector function, stored on a grid
 * @constructor VectorMap
 * @param {OutputImage} outputImage - has a pixelcanvas and a transform of output image pixel indices to space coordinates
 * @param {LinearTransform} inpuTransform - linear transform from geometrical space to pixel (column,row) indices
 * @param {PixelCanvas} inputImage - with the space coordinate to input image pixel coordinates
 * @param {ControlImage} controlimage - to make read pixels opaque
 */



/* jshint esversion:6 */

function VectorMap(outputImage, inputTransform, inputImage, controlImage) {
    this.exists = false;
    this.width = 2;
    this.height = 2;
    this.xArray = new Float32Array(4);
    this.yArray = new Float32Array(4);
    // for showing the structure: number of reflections
    this.reflectionsArray = new Uint8ClampedArray(4);
    // the color sector (for color symmetry...)
    this.colorSectorArray = new Uint8Array(4);

    // an array [colorSector] of arrays of integer colors ( new Uint32Array(256)
    this.structureColorCollection = [];

    this.createSimpleColorTable();

    this.lyapunovArray = new Float32Array(4); // array of lyapunov coefficient, negative for invalid points
    this.outputImage = outputImage;
    this.inputTransform = inputTransform;
    this.inputImage = inputImage;
    this.controlImage = controlImage;
    // smooth border for poincaré disc - precomputed alpha values
    // nontrivial for
    //    basicKaleidoscope.geometry=basicKaleidoscope.isHyperbolic
    this.alphaArray = new Uint8ClampedArray(4);
    this.discRadius = -1; // if <0: fills the entire plane, if>0 the disc radius
    this.noColorSymmetry();
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
            const length = width * height;
            this.xArray = new Float32Array(length);
            this.yArray = new Float32Array(length);
            this.lyapunovArray = new Float32Array(length);
            this.reflectionsArray = new Uint8ClampedArray(length);
            this.colorSectorArray = new Uint8Array(length);
            this.alphaArray = new Uint8ClampedArray(length);
        }
    };


    // default values for colors, can be changed

    VectorMap.colorParityNull = new Color(200, 200, 0); //default yellow
    VectorMap.colorParityOdd = new Color(0, 120, 0); // default dark green
    VectorMap.colorParityEven = new Color(200, 120, 0); // default: brown
    VectorMap.colorParityOff = new Color(128, 128, 128, 0);


    // make a color table!


    /**
     * generate a color table for showing the structure, default, for only one color sector
     * using the simple colors
     * @method VectorMap.createSimpleColorTable
     */
    VectorMap.prototype.createSimpleColorTable = function() {
        this.intColorOff = PixelCanvas.integerOf(VectorMap.colorParityOff);
        const colors = new Uint32Array(256);
        for (var i = 0; i < 255; i++) {
            colors[i++] = PixelCanvas.integerOf(VectorMap.colorParityEven);
            colors[i] = PixelCanvas.integerOf(VectorMap.colorParityOdd);
        }
        colors[0] = PixelCanvas.integerOf(VectorMap.colorParityNull);
        this.structureColorCollection = [colors];
    };

    /**
     * generate a color table for showing the structure with given hue
     *  and add to the table of colors
     * full intensity for 0 reflections, double attenuation for odd, single attenuation for even number of reflections
     * sets also color for invalid (off) points
     * @method VectorMap#addStructureColors
     * @param {float} hue - between 0 and 6, going from red to yellow to green to cyan to blue to magenta to red
     * @param {integer} attenuation - between 0 and 127, for even or odd number of reflections
     */
    VectorMap.prototype.addStructureColors = function(hue, attenuation) {
        this.intColorOff = PixelCanvas.integerOf(VectorMap.colorParityOff);
        const color = new Color();
        color.grey = 0;
        color.hue = hue;
        color.colorIntensity = 255;
        color.rgbFromHig();
        const intColorNull = PixelCanvas.integerOf(color);
        color.colorIntensity = 255 - attenuation;
        color.rgbFromHig();
        const intColorEven = PixelCanvas.integerOf(color);
        color.colorIntensity = 255 - 2 * attenuation;
        color.rgbFromHig();
        const intColorOdd = PixelCanvas.integerOf(color);
        const colors = new Uint32Array(256);


        for (var i = 0; i < 255; i++) {
            colors[i++] = intColorEven;
            colors[i] = intColorOdd;
        }
        colors[0] = intColorNull;
        this.structureColorCollection.push(colors);
    };

    /**
     * make a map using a supplied function mapping(mapIn,mapOut)
     * @method VectorMap#make
     * @param {function} mapping - maps a position, return lyapunov coefficient>0 for valid points, <0 for invalid points
     */
    VectorMap.prototype.make = function(mapping) {
        this.exists = true;
        let position = new Vector2();
        let furtherResults = {};
        // default results for mappings that do not chenge the fields
        // number of reflections (for showing the mirror structure
        furtherResults.reflections = 0;
        // valid points have lyapunov>0, less than zero means that method has not converged or other problem
        furtherResults.lyapunov = 1;
        // the color (symmetry) sector, default value for images without color symmetry...
        furtherResults.colorSector = 0;
        let width = this.width;
        let height = this.height;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let reflectionsArray = this.reflectionsArray;
        let colorSectorArray = this.colorSectorArray;
        let alphaArray = this.alphaArray;
        let scale = this.outputImage.scale;
        let index = 0;
        let cutDisc = (this.discRadius > 0);
        var discRadius2, discRadiusMinus2, alphaFactor;
        if (cutDisc) {
            discRadius2 = this.discRadius * this.discRadius;
            // smooth cutting inside the disc to avoid wrong colors
            // pixel size is scale
            discRadiusMinus2 = this.discRadius - scale;
            discRadiusMinus2 *= discRadiusMinus2;
            alphaFactor = 255.9 / (discRadius2 - discRadiusMinus2);
        }
        let x = 0;
        let y = 0;
        y = this.outputImage.cornerY;
        for (var j = 0; j < height; j++) {
            x = this.outputImage.cornerX;
            let y2 = y * y;
            for (var i = 0; i < width; i++) {
                position.x = x;
                position.y = y;
                if (cutDisc) {
                    let r2 = x * x + y2;
                    // alpha for a smooth disc
                    if (r2 < discRadiusMinus2) {
                        alphaArray[index] = 255;
                    } else if (r2 < discRadius2) {
                        // automatic type conversion and clamping ???
                        alphaArray[index] = alphaFactor * (discRadius2 - r2);
                    } else {
                        alphaArray[index] = 0;
                    }
                    // making the tranmsform
                    if (r2 < discRadius2) {
                        mapping(position, furtherResults);
                        lyapunovArray[index] = furtherResults.lyapunov;
                        reflectionsArray[index] = furtherResults.reflections;
                        colorSectorArray[index] = furtherResults.colorSector;
                        if (furtherResults.lyapunov < 0) {
                            alphaArray[index] = 0;
                        }
                    } else {
                        lyapunovArray[index] = -1;
                    }
                } else {
                    mapping(position, furtherResults);
                    lyapunovArray[index] = furtherResults.lyapunov;
                    reflectionsArray[index] = furtherResults.reflections;
                    colorSectorArray[index] = furtherResults.colorSector;
                    if (furtherResults.lyapunov >= -0.001) {
                        alphaArray[index] = 255;
                    } else {
                        alphaArray[index] = 0;
                    }
                }
                xArray[index] = position.x;
                yArray[index] = position.y;
                x += scale;
                index++;
            }
            y += scale;
        }
    };

    /**
     * recalculate the lyapunov coefficient based on the maps differences
     * taking out the output image scale
     * @method VectorMap#lyapunovFromDifferences
     */
    VectorMap.prototype.lyapunovFromDifferences = function() {
        let iScale = 1 / this.outputImage.scale;
        let width = this.width;
        let widthM = this.width - 1;
        let heightM = this.height - 1;
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        var xPlusX, x, yPlusX, y;
        var index;
        var lyapunov;
        var ax, ay, bx, by;
        // don't do borders
        for (var j = 1; j < heightM; j++) {
            index = j * width;
            xPlusX = xArray[index];
            yPlusX = yArray[index];
            for (var i = 0; i < widthM; i++) {
                x = xPlusX;
                xPlusX = xArray[index + 1];
                y = yPlusX;
                yPlusX = yArray[index + 1];
                lyapunov = lyapunovArray[index];
                // if lyapunov <0 then it is an invalid pount, do not change that
                if (lyapunov > 0) {
                    // the vectors for the sides of the pixel square
                    ax = xPlusX - x;
                    ay = yPlusX - y;
                    // beware of invalid points ????, no seems to be ok
                    bx = xArray[index + width] - x;
                    by = yArray[index + width] - y;
                    lyapunov = iScale * Math.sqrt(Math.abs(ax * by - ay * bx));
                    lyapunovArray[index] = lyapunov;
                }
                index++;
            }
            // the right column copies
            lyapunovArray[index] = lyapunov;
            // the left column copies
            lyapunovArray[index - widthM] = lyapunovArray[index - widthM + 1];
        }
        // the top row
        let indexMax = width * this.height;
        for (index = indexMax - width; index < indexMax; index++) {
            lyapunovArray[index] = lyapunovArray[index - width];
        }
        for (index = 0; index < width; index++) {
            lyapunovArray[index] = lyapunovArray[index + width];
        }
    };

    /**
     * limit the Lyapunov coefficients
     * @method VectorMap#limitLyapunov
     * @param {float} maxValue
     */
    VectorMap.prototype.limitLyapunov = function(maxValue) {
        let lyapunovArray = this.lyapunovArray;
        for (var i = lyapunovArray.length - 1; i >= 0; i--) {
            if (lyapunovArray[i] > maxValue) {
                lyapunovArray[i] = maxValue;
            }
        }
    };

    /**
     * determine center of gravity of map (to shift it to origin)
     * "invalid" points are marked with negative lyapunov coefficient -> do not count
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
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] >= -0.001) {
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
        const length = xArray.length;
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
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] >= -0.001) {
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
     * make a collection of color tables, put in structureColorCollection
     * depending on number of colors (sectors), first hue, difference in hue, 
     * attenuation of intensity
     * @method VectorMap#makeColorCollection
     * @param {integer} nColors
     * @param {float} firstHue
     * @param {float} deltaHue
     * @param {float} attenuation
     */
    VectorMap.prototype.makeColorCollection = function(nColors, firstHue, deltaHue, attenuation) {
        this.structureColorCollection = [];
        let hue = firstHue;
        for (var i = 0; i < nColors; i++) {
            this.addStructureColors(hue, attenuation);
            hue += deltaHue;
        }
    };

    /**
     * draw on a pixelcanvas use a map
     * color showing structure, based on parity stored in this.xArray
     * and sector stored in this.yArray
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawStructure
     */
    VectorMap.prototype.drawStructure = function() {
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let intColorOff = this.intColorOff;
        let lyapunovArray = this.lyapunovArray;
        let reflectionsArray = this.reflectionsArray;
        let colorSectorArray = this.colorSectorArray;
        let structureColorCollection = this.structureColorCollection;
        const length = lyapunovArray.length;
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] >= -0.001) {
                pixel[index] = structureColorCollection[colorSectorArray[index]][reflectionsArray[index]];
            } else {
                pixel[index] = intColorOff;
            }
        }
        pixelCanvas.showPixel();
    };

    // color symmetry: colorSector=0: no change in color
    // other values:special color changing routine!

    /**
     * change the color, if it is not in the symmetry sector 0
     *  default: does nothing
     * change using map.colorSymmetry=somefunction, where map=new VectorMap instance
     * @method VectorMap#colorSymmetry
     * @param {integer} colorSector - number of color modification
     * @param {Color} color - change it
     */
    VectorMap.prototype.colorSymmetry = function(colorSector, color) {};

    // choosing the color symmetries

    /**
     * switching off any color symmetry, default
     * @method VectorMap#noColorSymmetry
     */
    VectorMap.prototype.noColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {};
    };

    /**
     * two-color symmetry: invert the color for sector 1 and larger
     * @method VectorMap#inversionColorSymmetry
     */
    VectorMap.prototype.inversionColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector > 0) {
                color.invert();
            }
        };
    };

    /**
     * two-color symmetry: invert the hue for sector 1 and larger
     * @method VectorMap#hueInversionColorSymmetry
     */
    VectorMap.prototype.hueInversionColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector > 0) {
                color.invertHue();
            }
        };
    };

    /**
     * three-color symmetry: rotate the rgb components
     * @method VectorMap#rgbRotationColorSymmetry
     */
    VectorMap.prototype.rgbRotationColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector === 1) {
                color.rotation();
            } else if (colorSector === 2) {
                color.inverseRotation();
            }
        };
    };

    /**
     * six-color symmetry: rotate the rgb components and invert
     * @method VectorMap#rgbRotationColorSymmetry
     */
    VectorMap.prototype.rgbRotationInversionColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {
            if ((colorSector === 1) || (colorSector === 4)) {
                color.rotation();
            } else if ((colorSector === 2) || (colorSector === 5)) {
                color.inverseRotation();
            }
            if (colorSector >= 3) {
                color.invert();
            }
        };
    };

    /**
     * four-color symmetry: color inversion and hue inversion
     * @method VectorMap#doubleInversionColorSymmetry
     */
    VectorMap.prototype.doubleInversionColorSymmetry = function() {
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector & 1) {
                color.invertHue();
            }
            if (colorSector & 2) {
                color.invert();
            }
        };
    };

    /**
     * shift the hue: set number of hues/symmetry sectors
     * @method VectorMap#setNumberOfHues
     * @param {integer} nHues
     */
    VectorMap.prototype.setNumberOfHues = function(nHues) {
        this.hueShifts = [];
        for (var i = 0; i < nHues; i++) {
            this.hueShifts.push(6 / nHues * i);
        }
    };

    /**
     * n color symmetry: shift the hue depending on the colorSector and total number of sectors
     * @method VectorMap#hueShiftColorSymmetry
     * @param {integer} numberOfSectors
     */
    VectorMap.prototype.hueShiftColorSymmetry = function(numberOfSectors) {
        this.setNumberOfHues(numberOfSectors);
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector > 0) {
                color.higFromRgb();
                color.hue += this.hueShifts[colorSector];
                color.rgbFromHig();
            }
        };
    };

    /**
     * bn color symmetry: shift the hue and invert depending on the colorSector and total number of sectors
     * @method VectorMap#hueShiftInversionColorSymmetry
     * @param {integer} numberOfSectors
     */
    VectorMap.prototype.hueShiftInversionColorSymmetry = function(numberOfSectors) {
        const nHues = Math.floor((numberOfSectors + 1) / 2);
        this.setNumberOfHues(nHues);
        this.colorSymmetry = function(colorSector, color) {
            if (colorSector >= nHues) {
                colorSector -= nHues;
                color.invert();
            }
            if (colorSector > 0) {
                color.higFromRgb();
                color.hue += this.hueShifts[colorSector];
                color.rgbFromHig();
            }
        };
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
        let inputImageWidth = inputImage.width;
        let inputImageHeight = inputImage.height;
        let inputImagePixel = inputImage.pixel;
        // transform data
        let shiftX = this.inputTransform.shiftX;
        let shiftY = this.inputTransform.shiftY;
        let cosAngleScale = this.inputTransform.cosAngleScale;
        let sinAngleScale = this.inputTransform.sinAngleScale;
        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let colorSectorArray = this.colorSectorArray;
        const length = xArray.length;
        // other
        let offColor = new Color(0, 0, 0, 0);
        inputImage.averageImageColor(offColor);
        let intOffColor = PixelCanvas.integerOf(offColor);
        const color = new Color();
        var x, y, h, k;
        for (var index = 0; index < length; index++) {
            if (lyapunovArray[index] >= -0.001) {
                x = xArray[index];
                y = yArray[index];
                // faster math floor instead of Math.round()
                h = (shiftX + cosAngleScale * x - sinAngleScale * y) | 0;
                k = (shiftY + sinAngleScale * x + cosAngleScale * y) | 0;
                if ((h < 0) || (h >= inputImageWidth) || (k < 0) || (k >= inputImageHeight)) { // outside the input image
                    pixel[index] = intOffColor;
                } else { // inside the input image: colorSector=0 means no color change
                    const colorSector = colorSectorArray[index];
                    if (colorSector === 0) {
                        pixel[index] = inputImagePixel[h + k * inputImageWidth];
                    } else { // the color changes, get color in components, change color, set pixel
                        inputImage.getPixelAtIndex(color, h + k * inputImageWidth);
                        this.colorSymmetry(colorSector, color);
                        color.alpha = 255;
                        pixelCanvas.setPixelAtIndex(color, index);
                    }
                    controlCanvas.setOpaque(h * controlDivInputSize, k * controlDivInputSize);
                }
            } else {
                pixel[index] = intOffColor;
            }
        }
        pixelCanvas.showPixel();
        controlCanvas.showPixel();
    };

    /**
     * draw on a pixelcanvas use a map and high quality pixel sampling
     * if map is expanding use smoothing, if contracting use linear and cubic interpolation
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawVeryHighQuality
     */
    VectorMap.prototype.drawVeryHighQuality = function() {
        // the pixel scaling (lyapunov)
        let baseLyapunov = this.inputTransform.scale * this.outputImage.scale;
        var lyapunov;
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        let controlImage = this.controlImage;
        let controlCanvas = controlImage.pixelCanvas;
        let controlDivInputSize = controlImage.controlDivInputSize;
        // input transform data
        let shiftX = this.inputTransform.shiftX;
        let shiftY = this.inputTransform.shiftY;
        let cosAngleScale = this.inputTransform.cosAngleScale;
        let sinAngleScale = this.inputTransform.sinAngleScale;
        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let colorSectorArray = this.colorSectorArray;
        let alphaArray = this.alphaArray;
        // color data
        let offColor = new Color(0, 0, 0, 0);
        inputImage.averageImageColor(offColor);
        let intOffColor = PixelCanvas.integerOf(offColor);
        const color = new Color();
        var x, y, h, k;
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            lyapunov = lyapunovArray[index] * baseLyapunov;
            if (lyapunov >= -0.001) {
                x = xArray[index];
                y = yArray[index];
                h = shiftX + cosAngleScale * x - sinAngleScale * y;
                k = shiftY + sinAngleScale * x + cosAngleScale * y;
                // beware of byte order
                if (inputImage.getVeryHighQuality(color, h, k, lyapunov)) {
                    controlCanvas.setOpaque(h * controlDivInputSize, k * controlDivInputSize);
                    this.colorSymmetry(colorSectorArray[index], color);
                    color.alpha = alphaArray[index];
                } else { // invalid points: use off color
                    color.set(offColor);
                }
            } else {
                color.set(offColor);
            }
            pixelCanvas.setPixelAtIndex(color, index);
        }
        pixelCanvas.showPixel();
        controlCanvas.showPixel();
    };

    /**
     * draw on a pixelcanvas use a map and high quality pixel sampling
     * if map is expanding use smoothing, if contracting use linear interpolation
     * "invalid" points have a negative lyapunov value
     * @method VectorMap#drawVeryHighQuality
     */
    VectorMap.prototype.drawHighQuality = function() {
        // the pixel scaling (lyapunov)
        let baseLyapunov = this.inputTransform.scale * this.outputImage.scale;
        var lyapunov;
        // image objects
        let pixelCanvas = this.outputImage.pixelCanvas;
        let pixel = pixelCanvas.pixel;
        let inputImage = this.inputImage;
        let controlImage = this.controlImage;
        let controlCanvas = controlImage.pixelCanvas;
        let controlDivInputSize = controlImage.controlDivInputSize;
        // input transform data
        let shiftX = this.inputTransform.shiftX;
        let shiftY = this.inputTransform.shiftY;
        let cosAngleScale = this.inputTransform.cosAngleScale;
        let sinAngleScale = this.inputTransform.sinAngleScale;
        // map data
        let xArray = this.xArray;
        let yArray = this.yArray;
        let lyapunovArray = this.lyapunovArray;
        let colorSectorArray = this.colorSectorArray;
        let alphaArray = this.alphaArray;
        // color data
        let offColor = new Color(0, 0, 0, 0);
        inputImage.averageImageColor(offColor);
        let intOffColor = PixelCanvas.integerOf(offColor);
        const color = new Color();
        var x, y, h, k;
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            lyapunov = lyapunovArray[index] * baseLyapunov;
            if (lyapunov >= -0.001) {
                x = xArray[index];
                y = yArray[index];
                h = shiftX + cosAngleScale * x - sinAngleScale * y;
                k = shiftY + sinAngleScale * x + cosAngleScale * y;
                // beware of byte order
                if (inputImage.getHighQuality(color, h, k, lyapunov)) {
                    controlCanvas.setOpaque(h * controlDivInputSize, k * controlDivInputSize);
                    this.colorSymmetry(colorSectorArray[index], color);
                    color.alpha = alphaArray[index];
                } else { // invalid points: use off color
                    color.set(offColor);
                }
            } else {
                color.set(offColor);
            }
            pixelCanvas.setPixelAtIndex(color, index);
        }
        pixelCanvas.showPixel();
        controlCanvas.showPixel();
    };

}());
