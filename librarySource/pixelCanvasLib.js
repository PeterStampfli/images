/*
idName String, name of id in html document
(re)set size separately
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

    /*
    set the size
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


    /*
    make a blue screen
    */
    PixelCanvas.prototype.blueScreen = function() {
        this.canvasContext.fillStyle = "Blue";
        this.canvasContext.fillRect(0, 0, this.width, this.height);
    };


    /*
    create pixel as Integer array
    */
    PixelCanvas.prototype.createPixel = function() {
        this.imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        this.pixelComponents = this.imageData.data;
        this.pixel = new Int32Array(this.pixelComponents.buffer);
    };


    /*
    put the pixels on canvas
    */
    PixelCanvas.prototype.showPixel = function() {
        this.canvasContext.putImageData(this.imageData, 0, 0);
    };


    /*
    set alpha value of all pixels
    */
    PixelCanvas.prototype.setAlpha = function(alpha) {
        for (var i = this.pixelComponents.length - 1; i > 0; i -= 4) {
            this.pixelComponents[i] = alpha;
        }
    };


    /*
    set alpha value of a pixel to 255
    */
    PixelCanvas.prototype.setOpaquePixel = function(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        // but check if we are on the canvas, shift to multiply
        if ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height)) {
            this.pixelComponents[((this.width * y + x) << 2) + 3] = 255;
        }
    };


    /*
    save the image as jpg, needs fileSaver.js
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImageJpg = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.jpg');
        }, 'image/jpeg', 0.92);
    };

    /*
    save the image as png, needs fileSaver.js
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImagePng = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.png');
        }, 'image/png');
    };



    /*
    read an image from a file, make its pixels and do some action (create output image)
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
    get color of nearest pixel
    this.red=-1 for pixels lying outside
    from pixelInterpolation.js
    */


    PixelCanvas.prototype.getNearest = function(color, x, y) {
        x = Math.round(x);
        y = Math.round(y);
        if ((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height)) {
            color.red = -1;
        } else {
            const thePixel = this.pixel[x + y * this.width];
            color.red = thePixel & 0xff;
            color.green = (thePixel >> 8) & 0xff;
            color.blue = (thePixel >> 16) & 0xff;
        }
        console.log(color);
    };

    /*
    get interpolated pixel color - linear interpolation
    */
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
            const pix10 = pixel[i + 4];
            i += this.width;
            const pix01 = pixel[i];
            const pix11 = pixel[i + 4];
            //  the weights
            const f00 = (1 - dx) * (1 - dy);
            const f01 = (1 - dx) * dy;
            const f10 = dx * (1 - dy);
            const f11 = dy * dx;
            // faster special method for rounding: BITwise or
            color.red = 0 | (0.5 + f00 * (pix00 & 0xff) + f10 * (pix10 & 0xff) + f01 * (pix01 & 0xff) + f11 * (pix11 & 0xff));
            color.green = 0 | (0.5 + f00 * (pix00 >> 8 & 0xff) + f10 * (pix10 >> 8 & 0xff) + f01 * (pix01 >> 8 & 0xff) + f11 * (pix11 >> 8 & 0xff));
            color.blue = 0 | (0.5 + f00 * (pix00 >> 16 & 0xff) + f10 * (pix10 >> 16 & 0xff) + f01 * (pix01 >> 16 & 0xff) + f11 * (pix11 >> 16 & 0xff));
        }
    };


}());
