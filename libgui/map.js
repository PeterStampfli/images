/* jshint esversion:6 */

import {
    guiUtils,
    output,
    Pixels,
    CoordinateTransform
} from "../libgui/modules.js";

/**
 * organizing the mapping from the output canvas
 * (after transforming the pixel positions to a adjustable space region)
 * to input image/structure
 * recalculate if canvas dimensions, its mapping or mapping parameters change
 * directly tied to the output canvas
 * @namespace map
 */

export const map = {};

// default input image for tests
// set its absolute path for use in a internet site:
// http://someSite.com/images/testimage.jpg or something similar
// or use a relative path that goes down to the "root'"

map.inputImage = '../libgui/testimage.jpg';

// dimensions, private, required to check if resizing arrays is required
// then same as for output canvas

let width = 1;
let height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);

// the sector (for color symmetry and selective display) or other info
map.sectorArray = new Uint8Array(1);

// the number of iterations, or other info
map.iterationsArray = new Uint8Array(1);

// size of pixels after mapping, not taking into account the final input image transform
map.sizeArray = new Float32Array(1);

/**
 * the mapping function transforms a point argument
 * point.re and point.im have the intial position at call
 * at return they have the final position
 * point.sector has the number of a sector. Typically, there is no mapping between sectors
 * point.iterations has the number of iterations done, or other info
 * point.valid>=0 means that point can be used in display, else make pixel transparent
 * the xArray, yArray, iterationsArray and sectorArray have new values, but not the sizeArray
 * results are not normalized
 * @method map.mapping
 * @param {object}point
 */
map.mapping = function(point) {}; // default is identity

/**
 * set the mapping function
 * @method map.setMapping
 * @param {function} mappingFun
 */
map.setMapping = function(mappingFun) {
    map.mapping = mappingFun;
};

/**
 * what to do when only the image changed (incl quality)
 * @method map.showImageChanged
 */
map.showImageChanged = function() {
    map.show(); // default, change if you want to show a grid ...
};

output.showGridChanged = function() {
    map.showImageChanged();
};

/**
 * what to do when the map changes (parameters, canvas size too)
 * @method map.showMapChanged
 */
map.showMapChanged = function() {
    map.initialize();
    map.make();
    map.showImageChanged();
};

output.showCanvasChanged = function() {
    map.showMapChanged();
};

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * @method map.initialize
 */
map.initialize = function() {
    map.needsSizeArrayUpdate = true;
         map.rangeValid = false;
    if (!guiUtils.isDefined(output.pixels)) {
        output.pixels = new Pixels(output.canvas);
    }
    output.pixels.update();
    output.updateTransform();
    const canvas = output.canvas;
    if ((width !== canvas.width) || (height !== canvas.height)) {
        width = canvas.width;
        height = canvas.height;
        const size = width * height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.sectorArray = new Uint8Array(size);
        map.iterationsArray = new Uint8Array(size);
        map.sizeArray = new Float32Array(size);
    }
};

/**
 * make the map using the map.mapping(point) function
 * initialize map before
 * @method map.make
 */
map.make = function() {
    const point = {
        x: 0,
        y: 0,
        iterations: 0,
        sector: 0,
        valid: 1
    };
    let index = 0;
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            point.x = i;
            point.y = j;
            point.sector = 0;
            point.iterations = 0;
            point.valid = 1;
            output.transform(point);
            map.mapping(point);
            map.xArray[index] = point.x;
            map.yArray[index] = point.y;
            map.sectorArray[index] = point.sector;
            map.iterationsArray[index] = point.iterations;
            map.sizeArray[index] = point.valid;
            index += 1;
        }
    }
};

// showing the map
//==================================

// selecting the sectors that will be shown, max 256 sectors
map.showSector = [];
map.showSector.length = 256;
// default, show all
for (let i = 0; i < 256; i++) {
    map.showSector[i] = true;
}

/**
 * showing the map as structure or image, depending on map.whatToShow
 * @method map.show
 */
map.show = function() {
    console.log('map.show ' + map.whatToShow);

    switch (map.whatToShow) {
        case 'structure':
            map.showStructure();
            break;
        case 'image - low quality':
            map.showImage();
            break;
        case 'image - high quality':
        case 'image - very high quality':

    }
};

// show the structure resulting from the number of iterations
// typically two colors (even/odd)
// using a table (maximum number of iterations is 255)
map.colorTable = [];
map.colorTable.length = 256;

/**
 * make an alternating color table
 * @method map.makeColorTable
 * @param {object}color1 - with red, green blue and alpha fields
 * @param {object}color2 - with red, green blue and alpha fields
 */
map.makeColorTable = function(color1, color2) {
    const intColor1 = Pixels.integerOfColor(color1);
    const intColor2 = Pixels.integerOfColor(color2);
    for (var i = 0; i < 256; i++) {
        map.colorTable[i] = (i & 1) ? intColor1 : intColor2;
    }
};

const black = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
};

const white = {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
};

map.makeColorTable(black, white);

/**
 * show structure of the map: color depending on the number of iterations
 * using the map.colorTable
 * @method map.showStructure
 */
map.showStructure = function() {
if (    map.inputImageLoaded)  {
  map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = width * height;
    for (var index = 0; index < length; index++) {
        if (map.showSector[map.sectorArray[index]]) {
            output.pixels.array[index] = map.colorTable[map.iterationsArray[index]];
        }
    }
    output.pixels.show();
};

// using an input image
//==============================================================

// map.inputCanvas is for the pixels of the input image
// map.controlCanvas is for choosing how to map the input image (shift, scale rotate)
// map.inputTransform see above
// map.inputToControlScale is scale factor from input image to control canvas

/**
 * get range of map values
 * only required for loading an input image
 * @method map.determineRange
 */
map.determineRange = function() {
    if (!map.rangeValid) {
        console.log('map.determineRange');
         map.rangeValid = true;
        var i;
        const length = width * height;
        let xMin = 1e10;
        let xMax = -1e10;
        let yMin = 1e10;
        let yMax = -1e10;
        for (i = 0; i < length; i++) {
            const x = map.xArray[i];
            xMax = Math.max(x, xMax);
            xMin = Math.min(x, xMin);
            const y = map.yArray[i];
            yMax = Math.max(y, yMax);
            yMin = Math.min(y, yMin);
        }
        map.xMin = xMin;
        map.xMax = xMax;
        map.yMin = yMin;
        map.yMax = yMax;
    }
};

/**
 * calculate the sizes of pixels based on the maps differences
 * does not include the scaling from the map to the input image
 * includes all other scaling (from outputCanvas to map space)
 * multiply with scale from mapped image to input image
 * required for high and very high quality images
 * @method map.sizeArrayUpdate
 */
map.needsSizeArrayUpdate = true;

map.sizeArrayUpdate = function() {
    if (map.needsSizeArrayUpdate) {
        console.log('map.sizeArrayUpdate');
        map.needsSizeArrayUpdate = false;
        const width = map.width;
        const widthM = width - 1;
        const heightM = map.height - 1;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const sizeArray = map.sizeArray;
        var xPlusX, x, yPlusX, y;
        var index;
        var ax, ay, bx, by;
        var size;
        // use rhomb defined by mapped vectors
        // from point(i,j) to point(i+1,j)
        // from point(i,j) to point(i,j+1)
        // so it's offset by half a pixel
        // sizes for i=width-1 and j=height-1 have to be copied
        for (var j = 0; j < heightM; j++) {
            index = j * width;
            xPlusX = xArray[index];
            yPlusX = yArray[index];
            for (var i = 0; i < widthM; i++) {
                x = xPlusX;
                xPlusX = xArray[index + 1];
                y = yPlusX;
                yPlusX = yArray[index + 1];
                // if size <0 then it is an invalid point, do not change that
                if (sizeArray[index] > 0) {
                    // the first side
                    ax = xPlusX - x;
                    ay = yPlusX - y;
                    // the second side
                    bx = xArray[index + width] - x;
                    by = yArray[index + width] - y;
                    // surface results from absolute value of the cross product
                    // the size is its square root
                    size = Math.sqrt(Math.abs(ax * by - ay * bx));
                    sizeArray[index] = size;
                }
                index++;
            }
            // the last pixel i=width-1 in a row copies the value before
            sizeArray[index] = size;
        }
        // the top row at j=height-1 copies the lower row
        let indexMax = width * map.height;
        for (index = indexMax - width; index < indexMax; index++) {
            sizeArray[index] = sizeArray[index - width];
        }
        for (index = 0; index < width; index++) {
            sizeArray[index] = sizeArray[index + width];
        }
    }
};


/**
 * show image resulting from the map and the input image
 * depending on quality and transform
 * @method map.showImage
 */
 map.controlPixelsAlpha=128;
map.showImage = function() {
    // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded){
        map.inputImageLoaded=true;
        map.loadInputImage();
    }
    else {
                map.updateInputTransform();
    map.controlPixels.setAlpha(map.controlPixelsAlpha);
    const color = {
        red: 0,
        green: 128,
        blue: 0,
        alpha: 255
    };
    const point = {
        x: 0,
        y: 0
    };
    const length = width * height;
    for (var index = 0; index < length; index++) {
        if (map.showSector[map.sectorArray[index]] && (map.sizeArray[index] >= 0)) {
            point.x = map.xArray[index];
            point.y = map.yArray[index];
            map.doInputTransform(point);

            output.pixels.array[index] = map.inputPixels.getNearestPixel(point.x, point.y);
            map.controlPixels.setOpaque(map.inputImageControlCanvasScale * point.x, map.inputImageControlCanvasScale * point.y);

        } else {
            output.pixels.array[index] = 0; //transparent black
        }
    }
    map.controlPixels.show();
    output.pixels.show();
}
};



/**
 * create selector for what to show, image select, div with canvas and coordinate transform
 * initialization for using input images
 * CALL THIS BEFORE calculating the map (with map.make)
 * @method map.setupInputImage
 * @param {ParamGui} gui
 */
map.setupInputImage = function(gui) {
    // a hidden canvas for the input image
    map.inputCanvas = document.createElement('canvas');
    map.inputCanvas.style.display = 'none';
    map.inputPixels = new Pixels(map.inputCanvas);
    map.inputCanvasContext = map.inputCanvas.getContext('2d');
    map.inputImageLoaded=false;
    // what to we want to see (you can delete it)
    map.whatToShow = 'structure';
    map.whatToShowController = gui.add({
        type: 'selection',
        params: map,
        property: 'whatToShow',
        options: ['structure', 'image - low quality', 'image - high quality', 'image - very high quality'],
        onChange: function() {
            console.log('changed what to show: ' + map.whatToShow);
            map.showImageChanged();
        },
        labelText: 'show'
    });
    // setup image selection
    map.imageController = gui.add({
        type: 'image',
        params: map,
        property: 'inputImage',
        options: {
            testimage: map.inputImage,
        },
        labelText: 'input image',
        onChange: function() {
            console.log('changed image: ' + map.inputImage);
           if ( map.whatToShow==='structure'){
            map.whatToShowController.setValueOnly('image - low quality');
        }
            map.loadInputImage();
        }
    });
    // setup control canvas
    // a div that contains the control canvas to 
    // avoid that the lower part of the gui 'jumps' if the input image changes
    const controlDiv = document.createElement('div');
    // force the scroll bar with vertical overflow of the bodydiv
    controlDiv.style.position = 'relative'; // to make centering work
    controlDiv.style.height = '10000px';
    gui.bodyDiv.appendChild(controlDiv);
    // now the clientwidth accounts for the scroll bar
    // and we can get the effective width of the gui
    map.guiWidth = gui.bodyDiv.clientWidth;
    controlDiv.style.width = map.guiWidth + 'px';
    controlDiv.style.height = map.guiWidth + 'px';
    controlDiv.style.backgroundColor = '#dddddd';
    // a CENTERED canvas in the controldiv 
    map.controlCanvas = document.createElement('canvas');
    controlDiv.appendChild(map.controlCanvas);
    map.controlCanvas.style.position = 'absolute';
    map.controlCanvas.style.top = '50%';
    map.controlCanvas.style.left = '50%';
    map.controlCanvas.style.transform = 'translate(-50%,-50%)';
    map.controlPixels = new Pixels(map.controlCanvas);
    map.controlCanvasContext = map.controlCanvas.getContext('2d');
    // the transform from the map to the input image, normalized
    // beware of border
    // initial values depend on the image
    // but not on the map (because it is normalized)
    map.inputTransform = new CoordinateTransform(gui, true);
    map.inputTransform.onChange = function() {
        console.log('change input transform');
        map.showImageChanged();
    };
};

/**
 * load the image with url=map.inputImage
 * call a callback, might be different for loading the test image than for loading further images
 * @method map.loadInputImage
 */
map.loadInputImage = function(callback) {
    console.log('loadinpim');
    let image = new Image();

    image.onload = function() {
        // load to the input canvas, determine scale, and update pixels
        map.inputCanvas.width = image.width;
        map.inputCanvas.height = image.height;
        map.inputCanvasContext.drawImage(image, 0, 0);
        map.inputPixels.update();
        // determine initial transformation from map range: map already done before loading image !
        // preescale factor: fit map into image map.imageScale ??
        // multiply shift of image transform by 1000 -> shift by one pixel for shown 0.001
        map.determineRange(); // always needed at this point, and only here?
        // find scale to fit map into input image, with some free border, serves as reference
        map.inputScale=0.9*Math.min(image.width/(map.xMax-map.xMin),image.height/(map.yMax-map.yMin));
// shift to center
const centerX=0.5*(map.xMax+map.xMin)*map.inputScale;
const centerY=0.5*(map.yMax+map.yMin)*map.inputScale;

        map.inputTransform.setValues((0.5*image.width-centerX)/map.scaleInputShift,(0.5*image.height-centerY)/map.scaleInputShift, 1, 0); 
        map.inputTransform.setResetValues();
        // load to control canvas, determine scale to fit into square of gui width
        map.inputImageControlCanvasScale = Math.min(map.guiWidth / image.width, map.guiWidth / image.height);
        map.controlCanvas.width = map.inputImageControlCanvasScale * image.width;
        map.controlCanvas.height = map.inputImageControlCanvasScale * image.height;
        map.controlCanvasContext.drawImage(image, 0, 0, map.controlCanvas.width, map.controlCanvas.height);
        map.controlPixels.update();
        image = null;
        map.showImageChanged();
    };

    image.src = map.inputImage;
};



/*
 * the input transform
 * note scaling of shifts
 */

var cosAngleTotalScale, sinAngleTotalScale, shiftX, shiftY;
map.scaleInputShift = 1000;

map.updateInputTransform = function() {
    const transform = map.inputTransform;
    cosAngleTotalScale = map.inputScale * transform.cosAngleScale;
    sinAngleTotalScale = map.inputScale * transform.sinAngleScale;
    shiftX = map.scaleInputShift * transform.shiftX;
    shiftY = map.scaleInputShift * transform.shiftY;
};

map.doInputTransform = function(v) {
    let h = cosAngleTotalScale * v.x - sinAngleTotalScale * v.y + shiftX;
    v.y = sinAngleTotalScale * v.x + cosAngleTotalScale * v.y + shiftY;
    v.x = h;
};