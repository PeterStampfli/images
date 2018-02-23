/**
 * canvas methods for using pixels, reading input image
 * @constructor PixelCanvas
 * @param {String} idName - html identifier for onscreen canvas, or no parameter for off-screen canvas
 */

/* jshint esversion:6 */

function PixelCanvas(idName) {
    "use strict";
    if (arguments.length > 0) {
        this.canvas = document.getElementById(idName);
    } else {
        this.canvas = document.createElement("canvas"); // off-screen canvas
    }
    this.canvasContext = this.canvas.getContext('2d');
    this.imageData = null;
    this.pixel = null;
    this.pixelComponents = null;
    this.width = 0;
    this.height = 0;
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
        if ((this.width != width) || (this.height != height)) { // avoid page reflow if change does not change
            this.width = width;
            this.height = height;
            this.canvas.width = width;
            this.canvas.height = height;
        }
    };


    /**
     * make a blue screen
     * @method PixelCanvas#blueScreen
     */
    PixelCanvas.prototype.blueScreen = function() {
        this.canvasContext.fillStyle = "Blue";
        this.canvasContext.fillRect(0, 0, this.width, this.height);
    };

    /**
     * create access to pixel, pixelComponents is UInt8Array, pixel is an Int32Array
     * sequence of components depends on machine dependent byte order (bigendian or little endian)
     * @method PixelCanvas#createPixel
     */
    PixelCanvas.prototype.createPixel = function() {
        this.imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        this.pixelComponents = this.imageData.data;
        this.pixel = new Int32Array(this.pixelComponents.buffer);
    };

    /**
     * show the pixel data on the canvas
     * @method PixelCanvas#showPixel
     */
    PixelCanvas.prototype.showPixel = function() {
        this.canvasContext.putImageData(this.imageData, 0, 0);
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
* @mathod PixelCanvas#saveImageJpg
* @param {String} fileName - name for the output file, without extension
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImageJpg = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.jpg');
        }, 'image/jpeg', 0.92);
    };

    /**
    * save the image as png, needs fileSaver.js
* @mathod PixelCanvas#saveImagePng
* @param {String} fileName - name for the output file, without extension
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImagePng = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.png');
        }, 'image/png');
    };

    /**
     * read an image from a file, set canvas to same size
     * draw it on canvas, make its pixels and do some action after image is loaded
     * @method PixelCanvas#readImage
     * @param {File} file - filepath for input image
     * @param {function} action - callback, to do after loading is finished
     */
    PixelCanvas.prototype.readImage = function(file, action) {
        var pixelCanvas = this;
        var image = new Image();
        image.onload = function() {
            pixelCanvas.setSize(image.width, image.height);
            pixelCanvas.canvasContext.drawImage(image, 0, 0);
            image = null;
            pixelCanvas.createPixel();
            action();
        };
        fileReader.onload = function() {
            image.src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    };

    /*
    check byte order
    abgrOrder means
    int32=(a,b,g,r), lowest byte is red byte, then follow green, blue and alpha
    */
    const abgr = new Int8Array(4);
    const intColor = new Int32Array(abgr.buffer);
    abgr[0] = 1; // the red byte, all others are 0
    const abgrOrder = (intColor[0] === 1);

    /**
     * get color of nearest canvas pixel to given position
     * returns color.red=-1 for pixels lying outside the canvas
     * @method PixelCanvas#getNearest
     * @param {Color} color - will be set to the color of canvas image
     * @param {float} x - coordinate of point to check
     * @param {float} y - coordinate of point to check
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getNearest = function(color, x, y) {
            x = Math.round(x);
            y = Math.round(y);
            if ((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height)) {
                color.red = -1;
            } else {
                const thePixel = this.pixel[x + y * this.width];
                color.red = thePixel & 0xff;
                color.green = (thePixel >>> 8) & 0xff;
                color.blue = (thePixel >>> 16) & 0xff;
            }
            console.log(color);
        };
    } else {
        PixelCanvas.prototype.getNearest = function(color, x, y) {
            x = Math.round(x);
            y = Math.round(y);
            if ((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height)) {
                color.red = -1;
            } else {
                const thePixel = this.pixel[x + y * this.width];
                color.red = (thePixel >>> 24) & 0xff;
                color.green = (thePixel >>> 16) & 0xff;
                color.blue = (thePixel >>> 8) & 0xff;
            }
            console.log(color);
        };
    }


    /**
     * get color of linearly interpolated canvas pixel to given position
     * returns color.red=-1 for pixels lying outside the canvas
     * @method PixelCanvas#getLinear
     * @param {Color} color - will be set to the interpolated color of canvas image
     * @param {float} x - coordinate of point to check
     * @param {float} y - coordinate of point to check
     */
    if (abgrOrder) {
        PixelCanvas.prototype.getLinear = function(color, x, y) {
            const h = Math.floor(x);
            const k = Math.floor(y);
            if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
                color.red = -1;
            } else {
                const dx = x - h;
                const dy = y - k;
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
            }
        };
    } else {
        PixelCanvas.prototype.getLinear = function(color, x, y) {
            const h = Math.floor(x);
            const k = Math.floor(y);
            if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
                color.red = -1;
            } else {
                const dx = x - h;
                const dy = y - k;
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
            }
        };
    }


    /*
    get interpolated pixel color - cubic interpolation
    */
    function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
        if (x < 1) {
            return (1.16666 * x - 2) * x * x + 0.888888;
        }
        return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
    }



    InputImage.prototype.getCubic = function(color, x, y) {
        const h = Math.floor(x);
        const k = Math.floor(y);
        if ((h < 1) || (h + 2 >= this.width) || (k < 1) || (k + 2 >= this.height)) {
            color.red = -1;
        } else {
            const dx = x - h;
            const dy = y - k;
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
            // the second column, just at the left of (x,y), skipping alpha
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(dx);
            red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
            green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            //  the third column, just at the right of (x,y)
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(1 - dx);
            red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
            green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            // the forth column
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(2 - dx);
            red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
            green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            // beware of negative values, with accelerated rounding
            color.red = red > 0 ? 0 | (red + 0.5) : 0;
            color.green = green > 0 ? 0 | (green + 0.5) : 0;
            color.blue = blue > 0 ? 0 | (blue + 0.5) : 0;
        }

    };

}());
