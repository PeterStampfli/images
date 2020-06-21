/* jshint esversion: 6 */
import {
    guiUtils
}
from "./modules.js";

// making kaleidoscopes out of whatever:
// output pixels -> map position to some space
// map the space somehow to give the kaleidoscopic structure
// map to input image and read the input colors

/**
 * reading and writing pixels to a canvas
 * using 32 bit integers instead of 4 bytes, which should be faster
 * with interpolation methods for reading 'pixels' at non-integer 'coordinates'
 * @constructor Pixels
 * @param {html canvas element} canvas
 */

export function Pixels(canvas) {
    this.canvas = canvas;
    this.canvasContext = this.canvas.getContext('2d');
    this.imageData = null; // changes when canvas dimensions change
    this.pixelComponents = null; // UInt8Array with separate r,g,b,a values
    this.array = null; // UInt32Array with packed rgba for one pixel
    this.width = 0;
    this.height = 0;
    // only for input image averaging
    this.integralRed = new Uint32Array(1);
    this.integralBlue = new Uint32Array(1);
    this.integralGreen = new Uint32Array(1);
}

// making images: at start and at end
//==============================================

/**
 * update/create the array buffer views
 * always call when size might change, or after loading an image (changes imageData)
 * @method Pixels#update
 */
Pixels.prototype.update = function() {
    this.integralTablesNotValid = true;
    const canvas = this.canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.imageData = this.canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    this.pixelComponents = this.imageData.data;
    this.array = new Uint32Array(this.pixelComponents.buffer); // a view of the pixels as an array of 32 bit integers
};

/**
 * show the pixel data on the canvas, call after changing the Pixels#array
 * @method Pixels#show
 */
Pixels.prototype.show = function() {
    this.canvasContext.putImageData(this.imageData, 0, 0);
};

// setting pixels
//=================================================

// if color is in correct 32 bit integer form
// (from looking up nearest neighbors without interpolation)
// pixels.array[index] = integerColorValue;

/**
 * transform color into integer with correct byte order
 * @method Pixels.integerOfColor
 * @param {Color} color
 * @return integer value for the color
 */
if (guiUtils.abgrOrder) {
    Pixels.integerOfColor = function(color) {
        return color.red | color.green << 8 | color.blue << 16 | color.alpha << 24;
    };
} else {
    Pixels.integerOfColor = function(color) {
        return color.alpha | color.blue << 8 | color.green << 16 | color.red << 24;
    };
}

/**
 * set color of pixel at given total index, 
 * color is an object with red, green, blue and alpha components
 * assumes that index is in range and that color components are between 0 and 255
 * we need the alpha component to clear selective sectors and points that are mapped outside the input image
 * @method Pixels#setColorAtIndex
 * @param {Object} color 
 * @param {integer} index
 */
if (guiUtils.abgrOrder) {
    Pixels.prototype.setColorAtIndex = function(color, index) {
        this.array[index] = color.red | color.green << 8 | color.blue << 16 | color.alpha << 24;
    };
} else {
    Pixels.prototype.setColorAtIndex = function(color, index) {
        this.array[index] = color.alpha | color.blue << 8 | color.green << 16 | color.red << 24;
    };
}

// changing opacity (alpha channel) only

/**
 * set the alpha value of all pixels
 * @method Pixels#setAlpha
 * @param {integer} alpha - value for all pixels,optional, default is semiopaque
 */
Pixels.prototype.setAlpha = function(alpha = 128) {
    for (var i = this.pixelComponents.length - 1; i > 0; i -= 4) {
        this.pixelComponents[i] = alpha;
    }
};

/**
 * set alpha value of a pixel to 255 (checks if coordinates are on canvas)
 * @method Pixels#setOpaque
 * @param {float} x - coordinate of pixel
 * @param {float} y - coordinate of pixel
 */
Pixels.prototype.setOpaque = function(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    // but check if we are on the canvas, shift to multiply
    if ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height)) {
        this.pixelComponents[((this.width * y + x) << 2) + 3] = 255;
    }
};

// reading pixels
//================================================================

// 32 bit integer form from 
// integerColorValue = pixels.array[index]

/**
 * get color of pixel at given index, assumes that index is in range
 * @method Pixels#getColorAtIndex
 * @param {Color} color - of the pixel
 * @param {integer} index
 */
if (guiUtils.abgrOrder) {
    Pixels.prototype.getColorAtIndex = function(color, index) {
        const thePixel = this.array[index];
        color.red = thePixel & 0xff;
        color.green = (thePixel >>> 8) & 0xff;
        color.blue = (thePixel >>> 16) & 0xff;
        color.alpha = 255;
    };
} else {
    Pixels.prototype.getColorAtIndex = function(color, index) {
        const thePixel = this.array[index];
        color.alpha = 255;
        color.blue = (thePixel >>> 8) & 0xff;
        color.green = (thePixel >>> 16) & 0xff;
        color.red = (thePixel >>> 24) & 0xff;
    };
}

/**
 * get pixel as integer (color) nearest to given position
 * returns integer color value, for pixels lying outside the canvas returns 0 (transparent black)
 * @method Pixels#getNearestPixel
 * @param {float} x - coordinate of point to check
 * @param {float} y - coordinate of point to check
 * @return integer color value, if point lies outside returns 0 (transparent black)
 */
Pixels.prototype.getNearestPixel = function(x, y) {
    const h = Math.round(x);
    const k = Math.round(y);
    if ((h < 0) || (h >= this.width) || (k < 0) || (k >= this.height)) {
        return 0;
    } else {
        return this.array[h + k * this.width];
    }
};

/**
 * get color of nearest canvas pixel to given position for pixels inside canvas
 * returns false for pixels lying outside the canvas
 * for pixels outside the canvas: alpha=0 (transparent)
 * for pixels inside: alpha=255 (opaque)
 * @method Pixels#getNearestColor
 * @param {Color} color - will be set to the color of canvas image pixel
 * @param {float} x - coordinate of point to check
 * @param {float} y - coordinate of point to check
 * @return true, if color is valid, false, if point lies outside
 */
if (guiUtils.abgrOrder) {
    Pixels.prototype.getNearestColor = function(color, x, y) {
        const h = Math.round(x);
        const k = Math.round(y);
        if ((h < 0) || (h >= this.width) || (k < 0) || (k >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const thePixel = this.array[h + k * this.width];
            color.red = thePixel & 0xff;
            color.green = (thePixel >>> 8) & 0xff;
            color.blue = (thePixel >>> 16) & 0xff;
            color.alpha = 255;
            return true;
        }
    };
} else {
    Pixels.prototype.getNearestColor = function(color, x, y) {
        const h = Math.round(x);
        const k = Math.round(y);
        if ((h < 0) || (h >= this.width) || (k < 0) || (k >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const thePixel = this.array[h + k * this.width];
            color.red = (thePixel >>> 24) & 0xff;
            color.green = (thePixel >>> 16) & 0xff;
            color.blue = (thePixel >>> 8) & 0xff;
            color.alpha = 255;
            return true;
        }
    };
}

// interpolation for contracting mappings resulting in expansion of input image parts

/**
 * get color of linearly interpolated canvas pixel to given position
 * for opaque images (jpg only !!!)
 * returns false for pixels lying outside the canvas
 * for pixels outside the canvas: alpha=0 (transparent)
 * for pixels inside: alpha=255 (opaque)     
 * @method PixelCanvas#getLinearColor
 * @param {Color} color - will be set to the interpolated color of canvas image
 * @param {float} x - coordinate of point to check
 * @param {float} y - coordinate of point to check
 * @return true, if color is valid, false, if point lies outside
 */
if (guiUtils.abgrOrder) {
    Pixels.prototype.getLinearColor = function(color, x, y) {
        const h = Math.floor(x);
        const k = Math.floor(y);
        if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const dx = x - h;
            const dy = y - k;
            const pixel = this.array;
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
            color.alpha = 255;
            return true;
        }
    };
} else {
    Pixels.prototype.getLinearColor = function(color, x, y) {
        const h = Math.floor(x);
        const k = Math.floor(y);
        if ((h < 0) || (h + 1 >= this.width) || (k < 0) || (k + 1 >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const dx = x - h;
            const dy = y - k;
            const pixel = this.array;
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
            color.alpha = 255;
            return true;
        }
    };
}

/*
the interpolation kernel: linear interpolation is much slower, the arrow function form is slightly slower
it is normalized to 1 within an error of about 1.00001 ! (good enough)
*/
function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

/**
 * get color of cubic interpolated canvas pixel to given position
 * for opaque images, simply alpha=255 always
 * returns false for pixels lying outside the canvas
 * for pixels outside the canvas: alpha=0 (transparent)
 * for pixels inside: alpha=255 (opaque)     
 * @method Pixels#getCubicColor
 * @param {Color} color - will be set to the interpolated color of canvas image
 * @param {float} x - coordinate of point to check
 * @param {float} y - coordinate of point to check
 * @return true, if color is valid, false, if point lies outside
 */
if (guiUtils.abgrOrder) {
    Pixels.prototype.getCubicColor = function(color, x, y) {
        const h = Math.floor(x);
        const k = Math.floor(y);
        if ((h < 1) || (h + 2 >= this.width) || (k < 1) || (k + 2 >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const dx = x - h;
            const dy = y - k;
            const pixel = this.array;
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
            // beware of negative values
            color.red = Math.max(0, Math.min(255, Math.round(red)));
            color.green = Math.max(0, Math.min(255, Math.round(green)));
            color.blue = Math.max(0, Math.min(255, Math.round(blue)));
            color.alpha = 255;
            return true;
        }
    };
} else {
    Pixels.prototype.getCubicColor = function(color, x, y) {
        const h = Math.floor(x);
        const k = Math.floor(y);
        if ((h < 1) || (h + 2 >= this.width) || (k < 1) || (k + 2 >= this.height)) {
            color.red = 0;
            color.green = 0;
            color.blue = 0;
            color.alpha = 0;
            return false;
        } else {
            const dx = x - h;
            const dy = y - k;
            const pixel = this.array;
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
            // the second column, just at the left of (x,y), skipping alpha
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(dx);
            red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
            green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            //  the third column, just at the right of (x,y)
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(1 - dx);
            red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
            green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            // the forth column
            pixM = pixel[indexM++];
            pix0 = pixel[index0++];
            pix1 = pixel[index1++];
            pix2 = pixel[index2++];
            kx = kernel(2 - dx);
            red += kx * (kym * (pixM >>> 24 & 0xFF) + ky0 * (pix0 >>> 24 & 0xFF) + ky1 * (pix1 >>> 24 & 0xFF) + ky2 * (pix2 >>> 24 & 0xFF));
            green += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
            blue += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
            // beware of negative values
            color.red = Math.max(0, Math.min(255, Math.round(red)));
            color.green = Math.max(0, Math.min(255, Math.round(green)));
            color.blue = Math.max(0, Math.min(255, Math.round(blue)));
            color.alpha = 255;
            return true;
        }
    };
}

// averaging for expanding mappings resulting in contraction of parts of the input image
// using integral color tables
// integral[i,j] = sum of all (<i,<j)
// with additional row and columns of zeros to make lookup faster

/**
 * create integral color tables of input image, depending on input image,
 * call when using averages (high and very high quality)
 * @method Pixels#createIntegralColorTables
 */
Pixels.prototype.createIntegralColorTables = function() {
    if (this.integralTablesNotValid) {
        this.integralTablesNotValid = false;
        let width = this.width;
        this.widthPlus = width + 1;
        let widthPlus = this.widthPlus;
        let height = this.height;
        let size = (width + 1) * (height + 1);
        let color = {};
        var i, j, jWidthPlus, jWidth, index;
        // resize only if size increases
        if (size !== this.integralRed.length) {
            // for small input images use typed Uint32Array
            if (size < 16700000) {
                this.integralRed = new Uint32Array(size);
                this.integralGreen = new Uint32Array(size);
                this.integralBlue = new Uint32Array(size);
            }
            // for large images use generic array with larger integer numbers
            else {
                this.integralRed = new Array(size);
                this.integralGreen = new Array(size);
                this.integralBlue = new Array(size);
            }
        }
        var iRed, iRedLast, iRedBelow, iRedBelowLast;
        var iGreen, iGreenLast, iGreenBelow, iGreenBelowLast;
        var iBlue, iBlueLast, iBlueBelow, iBlueBelowLast;
        const integralRed = this.integralRed;
        const integralGreen = this.integralGreen;
        const integralBlue = this.integralBlue;
        // do the first line of zeros
        for (i = 0; i < widthPlus; i++) {
            integralRed[i] = 0;
            integralGreen[i] = 0;
            integralBlue[i] = 0;
        }
        // do the rest
        for (j = 1; j <= height; j++) {
            jWidthPlus = j * widthPlus;
            jWidth = (j - 1) * width - 1; // index to pixels, with compensation for extra row and column of the table
            iRed = 0;
            iRedBelow = 0;
            iGreen = 0;
            iGreenBelow = 0;
            iBlue = 0;
            iBlueBelow = 0;
            integralRed[jWidthPlus] = 0;
            integralGreen[jWidthPlus] = 0;
            integralBlue[jWidthPlus] = 0;
            for (i = 1; i < widthPlus; i++) {
                index = jWidthPlus + i; // index to integrals
                this.getColorAtIndex(color, i + jWidth);
                iRedLast = iRed;
                iRedBelowLast = iRedBelow;
                iRedBelow = integralRed[index - widthPlus];
                iRed = iRedLast + iRedBelow - iRedBelowLast + color.red;
                integralRed[index] = iRed;
                iGreenLast = iGreen;
                iGreenBelowLast = iGreenBelow;
                iGreenBelow = integralGreen[index - widthPlus];
                iGreen = iGreenLast + iGreenBelow - iGreenBelowLast + color.green;
                integralGreen[index] = iGreen;
                iBlueLast = iBlue;
                iBlueBelowLast = iBlueBelow;
                iBlueBelow = integralBlue[index - widthPlus];
                iBlue = iBlueLast + iBlueBelow - iBlueBelowLast + color.blue;
                integralBlue[index] = iBlue;
            }
        }
    }
};

/**
 * get average color of rectangle centered at (x,y), rounded
 * clamping to limits (0...width-1, 0... height-1), taking into account the shifted tables with extra 0's
 * @method Pixels#getAverageColor
 * @param {Color} color - will be set to the average color of canvas image near pixel coordinates
 * @param {float} x - pixel x-coordinate
 * @param {float} y - pixel y-coordinate
 * @param {float} halfSize - half of the size of pixel
 * @return true, if color is valid, false, if point lies outside
 */
Pixels.prototype.getAverageColor = function(color, x, y, halfSize) {
    this.createIntegralColorTables(); //does only something once for a new image
    x = Math.round(x);
    y = Math.round(y);
    if ((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height)) {
        color.red = 0;
        color.green = 0;
        color.blue = 0;
        color.alpha = 0;
        return false;
    }
    halfSize = Math.floor(halfSize);
    let left = Math.max(0, x - halfSize);
    let bottom = Math.max(0, y - halfSize);
    let right = Math.min(this.width - 1, x + halfSize) + 1;
    let top = Math.min(this.height - 1, y + halfSize) + 1;
    let norm = 1.0 / ((right - left) * (top - bottom));
    let widthPlus = this.widthPlus;
    let iRightTop = right + top * widthPlus;
    let iLeftTop = left + top * widthPlus;
    let iRightBottom = right + bottom * widthPlus;
    let iLeftBottom = left + bottom * widthPlus;
    let integral = this.integralRed;
    // faster special method for rounding: BITwise or
    color.red = 0 | (norm * (integral[iRightTop] - integral[iLeftTop] - integral[iRightBottom] + integral[iLeftBottom]));
    integral = this.integralGreen;
    color.green = 0 | (norm * (integral[iRightTop] - integral[iLeftTop] - integral[iRightBottom] + integral[iLeftBottom]));
    integral = this.integralBlue;
    color.blue = 0 | (norm * (integral[iRightTop] - integral[iLeftTop] - integral[iRightBottom] + integral[iLeftBottom]));
    color.alpha = 255;
    return true;
};

// reading pixel colors at different quality
//======================================================

// pixel coordinates are x,y
// the square of the pixel size is the surface a unit pixel after transformation by the map
// essentially the Lyapunov koefficient
// relates to the mapping of vectors from one pixel to neighbors

/**
 * threshold for doing cubic interpolation (if lyapunov coefficient/pixel size is smaller)
 * that means map strongly shrinks pixels and we need a good interpolation
 * @var Pixels.thresholdCubic
 */
Pixels.thresholdCubic = 0.2;

/**
 * threshold for doing linear interpolation (if lyapunov coefficient/pixel size is smaller)
 * @var PixelCanvas.thresholdLinear
 */
Pixels.thresholdLinear = 1;

/**
 * threshold for doing averaging (if lyapunov coefficient/pixel size is larger)
 * map expands pixel
 * @var PixelCanvas.thresholdAverage
 */
Pixels.thresholdAverage = 3;

/**
 * smoothing factor, gives half of the smoothing square if multiplied with the pixel size
 * thus about 0.5e
 * @var PixelCanvas.smoothing
 */
Pixels.smoothing = 0.5;

/**
 * get very high quality pixel color, depending on transformed pixel size (total lyapunov coefficient)
 * using cubic interpolation, linear interpolation or averaging where needed
 * @method Pixels#getVeryHighQualityColor
 * @param {Color} color - will be set to new pixel color
 * @param {float} x - coordinate of pixel
 * @param {float} y - coordinate of pixel
 * @param {float} size - of the pixel (total Lyapunov coefficient)
 * @return true, if color is valid, false, if point lies outside
 */
Pixels.prototype.getVeryHighQualityColor = function(color, x, y, size) {

    if (size < Pixels.thresholdCubic) {
        return this.getCubicColor(color, x, y);
    }
    if (size < Pixels.thresholdLinear) {
        return this.getLinearColor(color, x, y);
    }
    if (size < Pixels.thresholdAverage) {
        return this.getNearestColor(color, x, y);
    }
    return this.getAverageColor(color, x, y, Pixels.smoothing * size);
};

/**
 * get high quality pixel color, depending on transformed pixel size (total lyapunov coefficient), no cubic interpolation
 * does not use cubic interpolation
 * @method Pixels#getHighQualityColor
 * @param {Color} color - will be set to new pixel color
 * @param {float} x - coordinate of pixel
 * @param {float} y - coordinate of pixel
 * @param {float} size - of the pixel (total Lyapunov coefficient)
 * @return true, if color is valid, false, if point lies outside
 */
Pixels.prototype.getHighQualityColor = function(color, x, y, size) {
    if (size < Pixels.thresholdLinear) {
        return this.getLinearColor(color, x, y);
    }
    if (size < Pixels.thresholdAverage) {
        return this.getNearestColor(color, x, y);
    }
    return this.getAverageColor(color, x, y, Pixels.smoothing * size);
};

/**
 * get low quality pixel color, using only nearest neighbor pixels
 * @method Pixels#getLowQualityColor
 * @param {Color} color - will be set to new pixel color
 * @param {float} x - coordinate of pixel
 * @param {float} y - coordinate of pixel
 * @return true, if color is valid, false, if point lies outside
 */
Pixels.prototype.getLowQualityColor = function(color, x, y) {
    return this.getNearestColor(color, x, y);
};