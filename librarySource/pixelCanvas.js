/**
 * a canvas wrapper with methods for using pixels, reading input image
 * @constructor PixelCanvas
 * @param {String} idName - html identifier for onscreen canvas, or no parameter for off-screen canvas
 */

/**
 * width of the canvas
 * @var PixelCanvas#width {integer}
 */

/**
 * height of the canvas
 * @var PixelCanvas#height {integer}
 */

/**
 * the basic javascript canvas object
 * @var PixelCanvas#canvas {Canvas}
 */

/**
 * the canvas 2d context for drawing
 * @var PixelCanvas#canvasContext {Canvas2DContext}
 */

/**
 * the canvas image data object with pixel data
 * @var PixelCanvas#imageData {CanvasImageData}
 */

/**
 * the pixel data as an unsigned integer array, a 4 byte integer for each pixel, machine dependent packing of bytes
 * @var PixelCanvas#pixel {Uint32Array}
 */

/**
 * the pixel data as a byte array, 4 single byte numbers for each pixel
 * @var PixelCanvas#pixelComponents {Uint8ClampedArray}
 */

/**
 * the color to use if coordinates are outside the image, 
 * including invalid points with very large coordinate values
 * @var PixelCanvas#offColor
 */

/* jshint esversion:6 */

function PixelCanvas(idName) {
    "use strict";
    if (arguments.length > 0) {
        this.canvas = document.getElementById(idName);
    } else {
        this.canvas = document.createElement("canvas"); // off-screen canvas
        this.canvas.style.display = "none";
        document.querySelector("body").appendChild(this.canvas);
    }
    this.canvasContext = this.canvas.getContext('2d');
    this.imageData = null;
    this.pixel = null;
    this.pixelComponents = null;
    this.width = 0;
    this.height = 0;
    this.offColor = new Color(127, 127, 127, 0); //transparent grey
}

(function() {
    "use strict";

    var fileReader = new FileReader();

    /**
     * set the size of the canvas
     * @method PixelCanvas#setSize
     * @param {float} width
     * @param {float} height
     */
    PixelCanvas.prototype.setSize = function(width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if ((this.width != width) || (this.height != height)) {
            this.width = width;
            this.height = height;
            this.canvas.width = width;
            this.canvas.height = height;
        }
    };

    /**
     * fill screen with color
     * @method PixelCanvas#fillScreen
     * @param {String} style - fill style
     */
    PixelCanvas.prototype.fillScreen = function(style) {
        this.canvasContext.fillStyle = style;
        this.canvasContext.fillRect(0, 0, this.width, this.height);
    };

    /**
     * make a blue screen
     * @method PixelCanvas#blueScreen
     */
    PixelCanvas.prototype.blueScreen = function() {
        this.fillScreen("blue");
    };

    /**
     * create access to pixel, pixelComponents is UInt8Array, pixel is an Int32Array
     * sequence of components depends on machine dependent byte order (bigendian or little endian)
     * @method PixelCanvas#createPixel
     */
    PixelCanvas.prototype.createPixel = function() {
        this.imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        this.pixelComponents = this.imageData.data;
        this.pixel = new Uint32Array(this.pixelComponents.buffer);
    };

    /**
     * show the pixel data on the canvas
     * @method PixelCanvas#showPixel
     */
    PixelCanvas.prototype.showPixel = function() {
        this.canvasContext.putImageData(this.imageData, 0, 0);
    };

    /**
     * set the off-color to the values of another color
     * @PixelCanvas#setOffColor
     * @param {Color} offColor
     */
    PixelCanvas.prototype.setOffColor = function(offColor) {
        this.offColor.copyRGBA(offColor);
    };

    /**
     * set the alpha value of all pixels
     * @method PixelCanvas#setAlpha
     * @param {integer} alpha - value for all pixels
     */
    PixelCanvas.prototype.setAlpha = function(alpha) {
        for (var i = this.pixelComponents.length - 1; i > 0; i -= 4) {
            this.pixelComponents[i] = alpha;
        }
    };

    /**
     * set alpha value of a pixel to 255 (checks if coordinates are on canvas)
     * @method PixelCanvas#setOpaque
     * @param {float} x - coordinate of pixel
     * @param {float} y - coordinate of pixel
     */
    PixelCanvas.prototype.setOpaque = function(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        // but check if we are on the canvas, shift to multiply
        if ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height)) {
            this.pixelComponents[((this.width * y + x) << 2) + 3] = 255;
        }
    };

    /**
     * save the image as jpg, needs fileSaver.js
     * @method PixelCanvas#saveImageJpg
     * @param {String} fileName - name for the output file, without extension
     */
    PixelCanvas.prototype.saveImageJpg = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.jpg');
        }, 'image/jpeg', 0.92);
    };

    /**
     * save the image as png, needs fileSaver.js
     * @method PixelCanvas#saveImagePng
     * @param {String} fileName - name for the output file, without extension
     */
    PixelCanvas.prototype.saveImagePng = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.png');
        }, 'image/png');
    };

    /** create an image with onload function that creates pixels and executes given action
     * @method PixelCanvas#createImageOnloadPixels
     * @param {function} action - callback after image has been loaded
     */
    PixelCanvas.prototype.createImageOnloadPixels = function(action) {
        var pixelCanvas = this;
        var image = new Image();
        image.onload = function() {
            pixelCanvas.setSize(image.width, image.height);
            pixelCanvas.canvasContext.drawImage(image, 0, 0);
            image = null;
            pixelCanvas.createPixel();
            action();
        };
        return image;
    };

    /**
     * read an image from a file blob, set canvas to same size
     * draw it on canvas, make its pixels and do some action after image is loaded
     * @method PixelCanvas#readImage
     * @param {File} file - file blob for input image
     * @param {function} action - callback, to do after loading is finished
     */
    PixelCanvas.prototype.readImageFromFileBlob = function(file, action) {
        var image = this.createImageOnloadPixels(action);
        fileReader.onload = function() {
            image.src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    };


    /**
     * read an image with given (relative) file path
     * draw it on canvas, make its pixels and do some action after image is loaded
     * @method PixelCanvas.readImageWithFilePath
     * @param {String} filePath - for input image
     * @param {function} action - callback, to do after loading is finished
     */
    PixelCanvas.prototype.readImageWithFilePath = function(filePath, action) {
        var image = this.createImageOnloadPixels(action);
        image.src = filePath;
    };

    // reading a local file does not need file reader !!!
    // use directly ...
    //   searchPic.src = "XXXX/YYYY/search.png";   

    /**
     * set size of canvas, make blue screen and pixels with alpha=255
     * @method PixelCanvas#setupOnscreen
     * @param {integer} width
     * @param {integer} height
     */
    PixelCanvas.prototype.setupOnscreen = function(width, height) {
        if ((this.width != width) || (this.height != height)) {
            this.setSize(width, height);
            this.blueScreen();
            this.createPixel();
        }
    };

    /**
     * calculate average color of opaque pixels
     * @method PixelCanvas#averageColor
     * @param {Color} color - will be set to average color
     */
    PixelCanvas.prototype.averageColor = function(color) {
        const length = this.pixel.length;
        const pixelComponents = this.pixelComponents;
        let i4 = 0;
        let averageRed = 0;
        let averageGreen = 0;
        let averageBlue = 0;
        let averageSum = 0;
        for (var i = 0; i < length; i++) {
            i4 = 4 * i;
            if (pixelComponents[i4 + 3] > 200) {
                averageSum++;
                averageRed += pixelComponents[i4];
                averageGreen += pixelComponents[i4 + 1];
                averageBlue += pixelComponents[i4 + 2];
            }
        }
        if (averageSum > 0) {
            color.red = averageRed / averageSum;
            color.green = averageGreen / averageSum;
            color.blue = averageBlue / averageSum;
        } else {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
        }
        color.alpha = 255;
    };

    /*
    check byte order
    abgrOrder means
    int32=(a,b,g,r), lowest byte is red byte, then follow green, blue and alpha
    */
    const abgr = new Int8Array(4);
    const intColor = new Int32Array(abgr.buffer);
    abgr[0] = 3; // the red byte, all others are 0
    const abgrOrder = (intColor[0] === 3);

    /**
     * get color of pixel at given index, assumes that index is in range
     * @method PixelCanvas#getPixelAtIndex
     * @param {Color} color - of the pixel
     * @param {integer} index
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getPixelAtIndex = function(color, index) {
            const thePixel = this.pixel[index];
            color.red = thePixel & 0xff;
            color.green = (thePixel >>> 8) & 0xff;
            color.blue = (thePixel >>> 16) & 0xff;
            color.alpha = (thePixel >>> 24) & 0xff;
        };
    } else {
        PixelCanvas.prototype.getPixelAtIndex = function(color, index) {
            const thePixel = this.pixel[index];
            color.alpha = thePixel & 0xff;
            color.blue = (thePixel >>> 8) & 0xff;
            color.green = (thePixel >>> 16) & 0xff;
            color.red = (thePixel >>> 24) & 0xff;
        };
    }

    /**
     * set color of pixel at given index, assumes that index is in range and that color components are between 0 and 255
     * @method PixelCanvas#setPixelAtIndex
     * @param {Color} color - of the pixel
     * @param {integer} index
     */
    if (abgrOrder) {
        PixelCanvas.prototype.setPixelAtIndex = function(color, index) {
            this.pixel[index] = color.red | color.green << 8 | color.blue << 16 | color.alpha << 24;
        };
    } else {
        PixelCanvas.prototype.setPixelAtIndex = function(color, index) {
            this.pixel[index] = color.alpha | color.blue << 8 | color.green << 16 | color.red << 24;
        };
    }

    /**
     * get color of nearest canvas pixel to given position
     * returns offColor for pixels lying outside the canvas
     * @method PixelCanvas#getNearest
     * @param {Color} color - will be set to the color of canvas image
     * @param {Vector2} v - coordinates of point to check
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getNearest = function(color, v) {
            const h = Math.round(v.x);
            const k = Math.round(v.y);
            if ((h < 0) || (h >= this.width) || (k < 0) || (k >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const thePixel = this.pixel[h + k * this.width];
                color.red = thePixel & 0xff;
                color.green = (thePixel >>> 8) & 0xff;
                color.blue = (thePixel >>> 16) & 0xff;
                color.alpha = (thePixel >>> 24) & 0xff;
            }
        };
    } else {
        PixelCanvas.prototype.getNearest = function(color, v) {
            const h = Math.round(v.x);
            const k = Math.round(v.y);
            if ((h < 0) || (h >= this.width) || (k < 0) || (k >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const thePixel = this.pixel[h + k * this.width];
                color.red = (thePixel >>> 24) & 0xff;
                color.green = (thePixel >>> 16) & 0xff;
                color.blue = (thePixel >>> 8) & 0xff;
                color.alpha = thePixel & 0xff;
            }
        };
    }

    /**
     * get color of linearly interpolated canvas pixel to given position
     * returns color.red=-1 for pixels lying outside the canvas
     * @method PixelCanvas#getLinear
     * @param {Color} color - will be set to the interpolated color of canvas image
     * @param {Vector2} v - coordinates of point to check
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getLinear = function(color, v) {
            const h = Math.floor(v.x);
            const k = Math.floor(v.y);
            if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const dx = v.x - h;
                const dy = v.y - k;
                const pixel = this.pixel;
                // the pixels
                let i = h + this.width * k;
                const pix00 = pixel[i];
                const pix10 = pixel[i + 1];
                i += this.width;
                const pix01 = pixel[i];
                const pix11 = pixel[i + 1];
                //  the weights
                const f00 = (1 - dx) * (1 - dy);
                const f01 = (1 - dx) * dy;
                const f10 = dx * (1 - dy);
                const f11 = dy * dx;
                // faster special method for rounding: BITwise or
                color.red = 0 | (0.5 + f00 * (pix00 & 0xff) + f10 * (pix10 & 0xff) + f01 * (pix01 & 0xff) + f11 * (pix11 & 0xff));
                color.green = 0 | (0.5 + f00 * (pix00 >>> 8 & 0xff) + f10 * (pix10 >>> 8 & 0xff) + f01 * (pix01 >>> 8 & 0xff) + f11 * (pix11 >>> 8 & 0xff));
                color.blue = 0 | (0.5 + f00 * (pix00 >>> 16 & 0xff) + f10 * (pix10 >>> 16 & 0xff) + f01 * (pix01 >>> 16 & 0xff) + f11 * (pix11 >>> 16 & 0xff));
                color.alpha = 0 | (0.5 + f00 * (pix00 >>> 24 & 0xff) + f10 * (pix10 >>> 24 & 0xff) + f01 * (pix01 >>> 24 & 0xff) + f11 * (pix11 >>> 24 & 0xff));
            }
        };
    } else {
        PixelCanvas.prototype.getLinear = function(color, v) {
            const h = Math.floor(v.x);
            const k = Math.floor(v.y);
            if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const dx = v.x - h;
                const dy = v.y - k;
                const pixel = this.pixel;
                // the pixels
                let i = h + this.width * k;
                const pix00 = pixel[i];
                const pix10 = pixel[i + 1];
                i += this.width;
                const pix01 = pixel[i];
                const pix11 = pixel[i + 1];
                //  the weights
                const f00 = (1 - dx) * (1 - dy);
                const f01 = (1 - dx) * dy;
                const f10 = dx * (1 - dy);
                const f11 = dy * dx;
                // faster special method for rounding: BITwise or
                color.red = 0 | (0.5 + f00 * (pix00 >>> 24 & 0xff) + f10 * (pix10 >>> 24 & 0xff) + f01 * (pix01 >>> 24 & 0xff) + f11 * (pix11 >>> 24 & 0xff));
                color.green = 0 | (0.5 + f00 * (pix00 >>> 16 & 0xff) + f10 * (pix10 >>> 16 & 0xff) + f01 * (pix01 >>> 16 & 0xff) + f11 * (pix11 >>> 16 & 0xff));
                color.blue = 0 | (0.5 + f00 * (pix00 >>> 8 & 0xff) + f10 * (pix10 >>> 8 & 0xff) + f01 * (pix01 >>> 8 & 0xff) + f11 * (pix11 >>> 8 & 0xff));
                color.alpha = 0 | (0.5 + f00 * (pix00 & 0xff) + f10 * (pix10 & 0xff) + f01 * (pix01 & 0xff) + f11 * (pix11 & 0xff));
            }
        };
    }

    /*
    get interpolated pixel color - cubic interpolation
    */

    /*
    the interpolation kernel: linear interpolation is much slower, the arrow function form is slightly slower
    */
    function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
        if (x < 1) {
            return (1.16666 * x - 2) * x * x + 0.888888;
        }
        return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
    }

    /**
     * get color of cubic interpolated canvas pixel to given position
     * returns color.red=-1 for pixels lying outside the canvas
     * @method PixelCanvas#getCubic
     * @param {Color} color - will be set to the interpolated color of canvas image
     * @param {Vector2} v - coordinates of point to check
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getCubic = function(color, v) {
            const h = Math.floor(v.x);
            const k = Math.floor(v.y);
            if ((h < 1) || (h + 2 >= this.width) || (k < 1) || (k + 2 >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const dx = v.x - h;
                const dy = v.y - k;
                const pixel = this.pixel;
                // y (vertical position) dependent values
                const kym = kernel(1 + dy);
                const ky0 = kernel(dy);
                const ky1 = kernel(1 - dy);
                const ky2 = kernel(2 - dy);
                // combined indices, for different heights at same x-position
                const width = this.width;
                let index0 = width * k + h - 1;
                let indexM = index0 - width;
                let index1 = index0 + width;
                let index2 = index1 + width;
                let pixM = pixel[indexM++];
                let pix0 = pixel[index0++];
                let pix1 = pixel[index1++];
                let pix2 = pixel[index2++];
                let kx = kernel(1 + dx);
                let red = kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                let green = kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                let blue = kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                let alpha = kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                // the second column, just at the left of (x,y), skipping alpha
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(dx);
                red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                alpha += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                //  the third column, just at the right of (x,y)
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(1 - dx);
                red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                alpha += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                // the forth column
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(2 - dx);
                red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                alpha += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                // beware of negative values, with accelerated rounding
                color.red = Math.max(0, Math.min(255, Math.round(red)));
                color.green = Math.max(0, Math.min(255, Math.round(green)));
                color.blue = Math.max(0, Math.min(255, Math.round(blue)));
                color.alpha = Math.max(0, Math.min(255, Math.round(alpha)));
            }
        };
    } else {
        PixelCanvas.prototype.getCubic = function(color, v) {
            const h = Math.floor(v.x);
            const k = Math.floor(v.y);
            if ((h < 1) || (h + 2 >= this.width) || (k < 1) || (k + 2 >= this.height)) {
                color.copyRgba(this.offColor);
            } else {
                const dx = v.x - h;
                const dy = v.y - k;
                const pixel = this.pixel;
                // y (vertical position) dependent values
                const kym = kernel(1 + dy);
                const ky0 = kernel(dy);
                const ky1 = kernel(1 - dy);
                const ky2 = kernel(2 - dy);
                // combined indices, for different heights at same x-position
                const width = this.width;
                let index0 = width * k + h - 1;
                let indexM = index0 - width;
                let index1 = index0 + width;
                let index2 = index1 + width;

                let pixM = pixel[indexM++];
                let pix0 = pixel[index0++];
                let pix1 = pixel[index1++];
                let pix2 = pixel[index2++];

                let kx = kernel(1 + dx);
                let red = kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                let green = kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                let blue = kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                let alpha = kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                // the second column, just at the left of (x,y), skipping alpha
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(dx);
                red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                alpha += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                //  the third column, just at the right of (x,y)
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(1 - dx);
                red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                alpha += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                // the forth column
                pixM = pixel[indexM++];
                pix0 = pixel[index0++];
                pix1 = pixel[index1++];
                pix2 = pixel[index2++];
                kx = kernel(2 - dx);
                red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
                green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
                blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
                alpha += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
                // beware of negative values, with accelerated rounding
                color.red = Math.max(0, Math.min(255, Math.round(red)));
                color.green = Math.max(0, Math.min(255, Math.round(green)));
                color.blue = Math.max(0, Math.min(255, Math.round(blue)));
                color.alpha = Math.max(0, Math.min(255, Math.round(alpha)));
            }
        };
    }


    /**
     * get color of interpolated canvas pixel to given position.
     * Interpolation can be set to nearest, linear or cubic. Default is nearest
     * returns color.red=-1 for pixels lying outside the canvas
     * @method PixelCanvas#getInterpolated
     * @param {Color} color - will be set to the interpolated color of canvas image
     * @param {Vector2} v - coordinates of point to check
     */
    PixelCanvas.prototype.getInterpolated = PixelCanvas.prototype.getNearest;

    /**
     * choose the interpolation method. 0 for nearest, 1 for linear and 2 for cubic.
     * @method PixelCanvas#chooseInterpolation
     * @param {integer} n - choice
     */
    PixelCanvas.prototype.chooseInterpolation = function(n) {
        if (n < 1) {
            PixelCanvas.prototype.getInterpolated = PixelCanvas.prototype.getNearest;
        } else if (n === 1) {
            PixelCanvas.prototype.getInterpolated = PixelCanvas.prototype.getLinear;
        } else {
            PixelCanvas.prototype.getInterpolated = PixelCanvas.prototype.getCubic;
        }
    };


    /**
     * Change the image pixel color. For simple image manipulation.
     * @method PixelCanvas#transform
     * @param {function} action - a function(color), transforms the color
     */
    PixelCanvas.prototype.transform = function(action) {
        var color = new Color();
        var index = 0;
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.getPixelAtIndex(color, index);
                action(color);
                this.setPixelAtIndex(color, index++);
            }
        }
        this.showPixel();
    };
}());
