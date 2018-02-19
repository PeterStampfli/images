/*
idName String, name of id in html document
(re)set size separately
*/
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

    var color = new Color();


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
    }


    /*
    make a blue screen
    */
    PixelCanvas.prototype.blueScreen = function() {
        this.canvasContext.fillStyle = "Blue";
        this.canvasContext.fillRect(0, 0, this.width, this.height);
    }


    /*
    create pixel as Integer array
    */
    PixelCanvas.prototype.createPixel = function() {
        this.imageData = this.canvasContext.getImageData(0, 0, this.width, this.height);
        this.pixelComponents = this.imageData.data;
        this.pixel = new Int32Array(this.pixelComponents.buffer);
    }


    /*
    put the pixels on canvas
    */
    PixelCanvas.prototype.showPixel = function() {
        this.canvasContext.putImageData(this.imageData, 0, 0);
    }


    /*
    set alpha value of all pixels
    */
    PixelCanvas.prototype.setAlpha = function(alpha) {
        for (var i = this.pixelComponents.length - 1; i > 0; i -= 4) {
            this.pixelComponents[i] = alpha;
        }
    }


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
    }


    /*
    save the image as jpg, needs fileSaver.js
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImageJpg = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.jpg');
        }, 'image/jpeg', 0.92);
    }

    /*
    save the image as png, needs fileSaver.js
    fileName String, name of file without extension
    */
    PixelCanvas.prototype.saveImagePng = function(fileName) {
        this.canvas.toBlob(function(blob) {
            saveAs(blob, fileName + '.png');
        }, 'image/png');
    }

}());
