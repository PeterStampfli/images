/* jshint esversion:6 */

import {
    guiUtils,
    output,
    Pixels,
    CoordinateTransform,
    MouseEvents,
    keyboard,
    BooleanButton,
    ColorInput,
    ParamGui
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

// mouse wheel zooming factor
map.zoomFactor = 1.04;
// and rotating, angle step, in degrees
map.angleStep = 1;

// default input image for tests
// set its absolute path for use in a internet site:
// http://someSite.com/images/testimage.jpg or something similar
// or use a relative path that goes down to the "root'"

map.inputImage = '../libgui/testimage.jpg';

// dimensions, private, required to check if resizing arrays is required
// then same as for output canvas

map.width = 1;
map.height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);

// the region (for color symmetry and selective display) or other info
map.regionArray = new Uint8Array(1);

// the number of iterations
map.iterationsArray = new Uint8Array(1);

// size of pixels after mapping, not taking into account the final input image transform
map.sizeArray = new Float32Array(1);

// greying out the control image
map.controlPixelsAlpha = 128;

// fractional length of image region checked initially
map.initialImageCovering = 0.75;

// max number of iterations of the map
map.maxIterations = 20;

// linewidth for additional drawings, in pixels
map.linewidth = 3;

// some trajectory
map.trajectoryColor = '#000000';
map.trajectory = false; // switching on and off

/**
 * the mapping function transforms a point argument
 * point.re and point.im have the intial position at call
 * at return they have the final position
 * point.region has the number of a region. Typically, there is no mapping between regions
 * point.iterations has the number of iterations done, or other info
 * point.valid>=0 means that point can be used in display, else make pixel transparent
 * the xArray, yArray, iterationsArray and regionArray have new values, but not the sizeArray
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
 * @method map.drawImageChanged
 */
map.drawImageChanged = function() {
    map.draw(); // default, change if you want to show a grid ...
};

/**
 * combination for showing a new image option
 * depends on whether the map is updated or not
 * @method map.drawImageChangedCheckMapUpdate
 */
map.drawImageChangedCheckMapUpdate = function() {
    if (map.updatingTheMap) {
        // map exists, only redraw image
        map.drawImageChanged();
    } else {
        // have to make map
        map.updatingTheMap = true;
        map.drawMapChanged();
    }
};

/**
 * what to do when the map changes (parameters, canvas size too)
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    map.make();
    map.drawImageChanged();
};

/**
 * define the output drawing routines: 
 * always use newest versions (if redefined) of map.draw...
 * @method map.setOutputDraw
 */
map.setOutputDraw = function() {
    output.drawGridChanged = function() {
        map.drawImageChanged();
    };
    output.drawCanvasChanged = function() {
        map.drawMapChanged();
    };
};

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * @method map.startDrawing
 */
map.startDrawing = function() {
    map.needsSizeArrayUpdate = true;
    map.rangeValid = false;
    output.pixels.update();
    output.isDrawing = true;
    const canvas = output.canvas;
    if ((map.width !== canvas.width) || (map.height !== canvas.height)) {
        map.width = canvas.width;
        map.height = canvas.height;
        const size = map.width * map.height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.regionArray = new Uint8Array(size);
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
        structureIndex: 0,
        region: 0,
        valid: 1
    };
    let index = 0;
    for (var j = 0; j < map.height; j++) {
        for (var i = 0; i < map.width; i++) {
            point.x = i;
            point.y = j;
            point.region = 0;
            point.iterations = 0;
            point.valid = 1;
            point.index = index; // for further work, more data
            output.coordinateTransform.transform(point);
            map.mapping(point);
            map.xArray[index] = point.x;
            map.yArray[index] = point.y;
            map.regionArray[index] = point.region;
            map.iterationsArray[index] = point.iterations;
            map.sizeArray[index] = point.valid;
            index += 1;
        }
    }
};

// showing the map
//==================================

/**
 * showing the map as structure or image, redefine in controller
 * take care, in case user supplies new routines
 * @method map.draw
 */
// flag to show that the input image is used
map.drawingInputImage = false;
// flag, shows if there is an updated map
map.updatingTheMap = true;

// hide the input image controllers
map.inputImageControllersHide = function() {
    map.controlDiv.style.display = 'none';
    map.inputTransform.hide();
    map.imageController.hide();
};
// show the input image controllers
map.inputImageControllersShow = function() {
    map.controlDiv.style.display = 'block';
    map.inputTransform.show();
    map.imageController.show();
};

// hide the threshold and gamma controllers, if exist
map.thresholdGammaControllersHide = function() {
    if (guiUtils.isDefined(map.thresholdController)) {
        map.thresholdController.hide();
        map.gammaController.hide();
    }
};

// show the threshold and gamma controllers, if exist
map.thresholdGammaControllersShow = function() {
    if (guiUtils.isDefined(map.thresholdController)) {
        map.thresholdController.show();
        map.gammaController.show();
    }
};

// hide the light and dark controllers
map.lightDarkControllersHide = function() {
    if (guiUtils.isDefined(map.lightController)) {
        map.lightController.hide();
        map.darkController.hide();
    }
};

// show the light and dark controllers
map.lightDarkControllersShow = function() {
    if (guiUtils.isDefined(map.lightController)) {
        map.lightController.show();
        map.darkController.show();
    }
};

map.callDrawStructure = function() {
    map.drawingInputImage = false;
    map.inputImageControllersHide();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersShow();
    map.drawStructure();
};
map.callDrawImageLowQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawImageLowQuality();
};
map.callDrawImageHighQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawImageHighQuality();
};
map.callDrawImageVeryHighQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawImageVeryHighQuality();
};
map.callDrawRegions = function() {
    map.drawingInputImage = false;
    map.inputImageControllersHide();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawRegions();
};
map.callDrawIterations = function() {
    map.drawingInputImage = false;
    map.inputImageControllersHide();
    map.thresholdGammaControllersShow();
    map.lightDarkControllersHide();
    map.drawIterations();
};
map.callDrawLimitset = function() {
    map.drawingInputImage = false;
    map.inputImageControllersHide();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawLimitset();
};
map.callDrawFundamentalRegion = function() {
    map.drawingInputImage = false;
    map.inputImageControllersHide();
    map.thresholdGammaControllersHide();
    map.lightDarkControllersHide();
    map.drawFundamentalRegion();
};

map.draw = map.callDrawStructure;

// the gui: selecting the regions that will be shown, max 256 regions
map.showRegion = [];
map.showRegion.length = 256;
map.showRegion.fill(true);

// know, which regions are relevant, boolean, true if there is some pixel inside
// do not renumber regions (we might look at a small part of the image, such as part of the Poincare disc)
// hide the UI for unused/inactive regions
map.activeRegions = [];
map.activeRegions.length = 256;

/**
 * clear active regions, set all to false
 * @method map.clearActive
 */
map.clearActive = function() {
    map.activeRegions.fill(false);
};

// default: one active region
map.clearActive();
map.activeRegions[0] = true;

// show the structure resulting from the number of iterations, parity, ...
// typically two colors (even/odd)
// using a table (maximum number of colors is 255) of color integers

// gui to control the regions
// general: contrast between 0, odd and even number of iterations
// show only controllers for active regions
// for each region a basic color and an array of colors[iterations]
// create controllers as needed, make them visible/hide 
map.colorControllers = [];
map.onOffControllers = [];

// switching on/off regions via 'map.showRegion[map.regionArray[index]]'
// initially all true
map.basicColor = [];

// colors for showing the structure
// each element is an array of colors, generate as needed
map.structureColors = [];
// for odd/even colors. 0 gives basicColor. 1 gives black and white
map.light = 0.6;
map.dark = 0.3;

map.basicColor.push('#ddddbb');
map.basicColor.push('#ffbbbb');
map.basicColor.push('#ccccff');
map.basicColor.push('#bbffbb');
map.basicColor.push('#ffaaff');
map.basicColor.length = 256;
guiUtils.arrayRepeat(map.basicColor, 5);

// colors for showing iterations
map.iterationsColor = [];
map.iterationsColor.length = 256;
// parameters for making iterations colors
map.iterationsThreshold = 4;
map.iterationsGamma = 2;

/**
 * make structure colors for active regions, from their basic color
 * call when changing map or colors (does not take much time)
 * @method map.makeStructureColors
 */
map.makeStructureColors = function() {
    for (var index = 0; index < 256; index++) {
        if (map.activeRegions[index]) {
            const basicColor = {};
            ColorInput.setObject(basicColor, map.basicColor[index]);
            basicColor.alpha = 255;
            const oddColor = {};
            oddColor.alpha = 255;
            const evenColor = {};
            evenColor.alpha = 255;
            oddColor.red = (1 - map.dark) * basicColor.red;
            oddColor.blue = (1 - map.dark) * basicColor.blue;
            oddColor.green = (1 - map.dark) * basicColor.green;
            const oddColorInt = Pixels.integerOfColor(oddColor);
            evenColor.red = map.light * 255 + (1 - map.light) * basicColor.red;
            evenColor.blue = map.light * 255 + (1 - map.light) * basicColor.blue;
            evenColor.green = map.light * 255 + (1 - map.light) * basicColor.green;
            const evenColorInt = Pixels.integerOfColor(evenColor);
            const colors = [];
            map.structureColors[index] = colors;
            colors[0] = Pixels.integerOfColor(basicColor);
            for (var i = 1; i < 256; i++) {
                colors[i] = ((i & 1) === 0) ? evenColorInt : oddColorInt;
            }
        }
    }
};

/**
 * make colors for showing iterations
 * white with variable alpha, depends on maxIterations, gamma, threshold
 * @method map#makeIterationsColor
 */
map.makeIterationsColor = function() {
    var i;
    const color = {};
    color.red = 255;
    color.blue = 255;
    color.green = 255;
    color.alpha = 0;
    map.iterationsColor.fill(Pixels.integerOfColor(color));
    for (i = map.iterationsThreshold; i < map.maxIterations; i++) {
        let x = (i - map.iterationsThreshold) / (map.maxIterations - map.iterationsThreshold);
        x = Math.pow(x, map.iterationsGamma);
        color.alpha = Math.floor(255.9 * x);
        map.iterationsColor[i] = Pixels.integerOfColor(color);
    }
    color.alpha = 255;
    const white = Pixels.integerOfColor(color);
    for (i = map.maxIterations; i < 256; i++) {
        map.iterationsColor[i] = white;
    }
};

/**
 * make the gui for controlling regions
 * @method map.makeRegionsGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
map.makeRegionsGui = function(parentGui, args = {}) {
    map.regionsGui = parentGui.addFolder('regions', args);
};

/**
 * add buttons for controlling a region (onOff and color)
 * @method map.addControls
 */
map.addControls = function() {
    const n = map.onOffControllers.length;
    BooleanButton.greenRedBackground();
    const onOffController = map.regionsGui.add({
        type: 'boolean',
        params: map.showRegion,
        property: n,
        labelText: 'region ' + n,
        onChange: function() {
            map.drawImageChanged();
        }
    });
    map.onOffControllers.push(onOffController);
    const colorController = onOffController.add({
        type: 'color',
        params: map.basicColor,
        property: n,
        labelText: '',
        onChange: function() {
            map.makeStructureColors();
            map.drawImageChanged();
        }
    });
    map.colorControllers.push(colorController);
};

/**
 * create/show the relevant controllers
 * @method map.showControllers
 */
map.showControls = function() {
    var i;
    map.regionsGui.hide();
    // determine max index of active regions, including the outside region
    let maxIndex = 0;
    for (i = 0; i <= map.activeRegions.length; i++) {
        if (map.activeRegions[i]) {
            maxIndex = i;
        }
    }
    let length = maxIndex + 1;
    // add controllers if needed
    for (i = map.onOffControllers.length; i < length; i++) {
        map.addControls();
    }
    // show/hide
    length = map.onOffControllers.length;
    for (i = 0; i < length; i++) {
        if (map.activeRegions[i]) {
            map.onOffControllers[i].show();
            map.colorControllers[i].show();
        } else {
            map.onOffControllers[i].hide();
            map.colorControllers[i].hide();
        }
    }
    map.regionsGui.show();
};

/**
 * show structure of the map: color depending on the structure index
 * using the map.colorTable
 * @method map.drawStructure
 */
map.drawStructure = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = map.width * map.height;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const region = map.regionArray[index];
        if (map.showRegion[region] && (map.sizeArray[index] >= 0)) {
            // colors for the target region
            const colors = map.structureColors[region];
            output.pixels.array[index] = colors[map.iterationsArray[index]];
        } else {
            output.pixels.array[index] = 0; // transparent black
        }
    }
    output.pixels.show();
};

/**
 * draw regions of the map (iterations===0)
 * using the map.colorTable
 * @method map.drawRegions
 */
map.drawRegions = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = map.width * map.height;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const region = map.regionArray[index];
        if (map.showRegion[region] && (map.sizeArray[index] >= 0) && (map.iterationsArray[index] === 0)) {
            // colors for the target region
            const colors = map.structureColors[region];
            output.pixels.array[index] = colors[0];
        } else {
            output.pixels.array[index] = 0; // transparent black
        }
    }
    output.pixels.show();
};

/**
 * draw iterations of the map 
 * using the map.colorTable
 * @method map.drawIterations
 */
map.drawIterations = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const white = Pixels.integerOfColor({
        red: 255,
        blue: 255,
        green: 255,
        alpha: 255
    });
    const length = map.width * map.height;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const region = map.regionArray[index];
        if (map.showRegion[region] && (map.sizeArray[index] >= 0)) {
            output.pixels.array[index] = map.iterationsColor[map.iterationsArray[index]];
        } else {
            output.pixels.array[index] = white; // opaque white, pixel presumably belongs to the limit set
        }
    }
    output.pixels.show();
};

/**
 * draw limit set of the map as white opaque
 * pixels that did not converge (size<0) or different pixels in a 2x2 array
 * @method map.drawLimitset
 */
map.drawLimitset = function() {
    var i, j, index;
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const white = Pixels.integerOfColor({
        red: 255,
        blue: 255,
        green: 255,
        alpha: 255
    });
    // top and left pixels are always transparent
    // because they have no neigbors above or at the left
    for (i = 0; i < map.width; i++) {
        output.pixels.array[i] = 0; //transparent black
    }
    index = 0;
    for (i = 0; i < map.height; i++) {
        output.pixels.array[index] = 0; //transparent black
        index += map.width;
    }
    index = 0;
    // for all other pixels
    for (j = 1; j < map.height; j++) {
        index += 1; // skip first pixel of each row
        for (i = 1; i < map.width; i++) {
            if (map.sizeArray[index] < 0) {
                output.pixels.array[index] = white;
            } else {
                const region = map.regionArray[index];
                if (region !== map.regionArray[index - 1]) {
                    output.pixels.array[index] = white;
                } else if (region !== map.regionArray[index - map.width]) {
                    output.pixels.array[index] = white;
                } else if (region !== map.regionArray[index - map.width - 1]) {
                    output.pixels.array[index] = white;
                } else {
                    output.pixels.array[index] = 0;
                }
            }
            index += 1;
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
 * get center and range of map values (only valid points)
 * required for loading an input image and zooming/rotating image
 * @method map.determineRange
 */
map.determineRange = function() {
    if (!map.rangeValid) {
        map.rangeValid = true;
        var i;
        const length = map.width * map.height;
        let xMin = 1e10;
        let xMax = -1e10;
        let yMin = 1e10;
        let yMax = -1e10;
        for (i = 0; i < length; i++) {
            if (map.sizeArray[i] >= 0) {
                const x = map.xArray[i];
                xMax = Math.max(x, xMax);
                xMin = Math.min(x, xMin);
                const y = map.yArray[i];
                yMax = Math.max(y, yMax);
                yMin = Math.min(y, yMin);
            }
        }
        map.centerX = 0.5 * (xMax + xMin);
        map.centerY = 0.5 * (yMax + yMin);
        map.rangeX = xMax - xMin;
        map.rangeY = yMax - yMin;
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
            index = j * map.width;
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
            // the last pixel i=map.width-1 in a row copies the value before
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
 * low quality using nearest neighbor
 * loads image if not yet an image loaded
 * @method map.drawImageLowQuality
 */
map.drawImageLowQuality = function() {
    // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded) {
        map.inputImageLoaded = true;
        map.loadInputImage();
    } else {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        const point = {
            x: 0,
            y: 0
        };
        const length = map.width * map.height;
        for (var index = 0; index < length; index++) {
            if (map.showRegion[map.regionArray[index]] && (map.sizeArray[index] >= 0)) {
                point.x = map.xArray[index];
                point.y = map.yArray[index];
                map.inputTransform.transform(point);
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
 * show image resulting from the map and the input image
 * high quality using nearest neighbor, averaging or linear interpolation
 * @method map.drawImageHighQuality
 */
map.drawImageHighQuality = function() {
    // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded) {
        map.inputImageLoaded = true;
        map.loadInputImage();
    } else {
        map.sizeArrayUpdate();
        const totalScale = map.inputTransform.totalScale;
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
        const length = map.width * map.height;
        for (var index = 0; index < length; index++) {
            if (map.showRegion[map.regionArray[index]] && (map.sizeArray[index] >= 0)) {
                point.x = map.xArray[index];
                point.y = map.yArray[index];
                map.inputTransform.transform(point);
                let size = totalScale * map.sizeArray[index];
                map.inputPixels.getHighQualityColor(color, point.x, point.y, size);
                output.pixels.setColorAtIndex(color, index);
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
 * show image resulting from the map and the input image
 * high quality using nearest neighbor, averaging, cubic, linear interpolation
 * @method map.drawImageVeryHighQuality
 */
map.drawImageVeryHighQuality = function() {
    // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded) {
        map.inputImageLoaded = true;
        map.loadInputImage();
    } else {
        map.sizeArrayUpdate();
        const totalScale = map.inputTransform.totalScale;
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
        const length = map.width * map.height;
        for (var index = 0; index < length; index++) {
            if (map.showRegion[map.regionArray[index]] && (map.sizeArray[index] >= 0)) {
                point.x = map.xArray[index];
                point.y = map.yArray[index];
                map.inputTransform.transform(point);
                let size = totalScale * map.sizeArray[index];
                map.inputPixels.getVeryHighQualityColor(color, point.x, point.y, size);
                output.pixels.setColorAtIndex(color, index);
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
 * determine transformation from map to input image
 * use for loading a new imaage or for resetting after changing the map
 * @method map.setupMapImageTransform
 */
map.setupMapImageTransform = function() {
    map.determineRange();
    // find prescale for inputTransform to fit map into input image, with some free border
    const imageWidth = map.inputCanvas.width;
    const imageHeight = map.inputCanvas.height;
    map.inputTransform.setPrescale(map.initialImageCovering * Math.min(imageWidth / map.rangeX, imageHeight / map.rangeY));
    // determine shifts to get map center to input image center: determine transform of the map center without shift
    map.inputTransform.setValues(0, 0, 1, 0);
    const v = {
        x: map.centerX,
        y: map.centerY
    };
    map.inputTransform.transform(v);
    // now we can determine the correct shifts
    map.inputTransform.setValues(0.5 * imageWidth - v.x, 0.5 * imageHeight - v.y, 1, 0);
};

/**
 * load the image with url=map.inputImage
 * call a callback, might be different for loading the test image than for loading further images
 * @method map.loadInputImage
 */

map.loadInputImage = function(callback) {
    let image = new Image();

    image.onload = function() {
        // load to the input canvas, determine scale, and update pixels
        map.inputCanvas.width = image.width;
        map.inputCanvas.height = image.height;
        map.inputCanvasContext.drawImage(image, 0, 0);
        map.inputPixels.update();
        // transform from map to input image
        map.setupMapImageTransform();
        // determine scale from input image to controle image
        // to fit the control image into a square of gui width
        map.inputImageControlCanvasScale = Math.min(map.guiWidth / image.width, map.guiWidth / image.height);
        map.controlCanvas.width = map.inputImageControlCanvasScale * image.width;
        map.controlCanvas.height = map.inputImageControlCanvasScale * image.height;
        // load input image to the control canvas
        map.controlCanvasContext.drawImage(image, 0, 0, map.controlCanvas.width, map.controlCanvas.height);
        map.controlPixels.update();
        image = null;
        map.drawImageChangedCheckMapUpdate();
    };

    image.src = map.inputImage;
};

/**
 * make gui for selection of what to show
 * create canvas for input image
 * selector for what to show, image select, div with control canvas and coordinate transform
 * the transform from the map result to the input image has a prescaling that makes 
 * that at scale==1 much of the input image will be sampled
 * shifts are input pixels
 * @method map.makeShowingGui
 * @param {ParamGui} parentGui
 */
map.makeShowingGui = function(parentGui, args = {}) {
    const gui = parentGui.addFolder('showing', args);
    map.showingGui = gui;
    if (!(gui.isRoot()) && !(gui.parent && gui.parent.isRoot())) {
        console.error('map.setupInputImage: Because the gui is in a higher level nested folder, the input image will not appear.');
        console.log('Please use as gui the base gui or a first level folder.');
        gui.addParagraph('map.setupInputImage: Use as gui the base gui or a first level folder!!!');
        return;
    }
    // limit number of iterations, destroy if not needed
    map.maxIterationsController = gui.add({
        type: 'number',
        params: map,
        property: 'maxIterations',
        labelText: 'iterations',
        min: 0,
        step: 1,
        onChange: function() {
            map.makeIterationsColor();
            map.drawMapChanged();
        }
    });


    // add a controller for line width 

    map.linewidthController = gui.add({
        type: 'number',
        params: map,
        property: 'linewidth',
        min: 1,
        onChange: function() {
            map.drawImageChanged();
        }
    });


    // add a controller for switching on/off showing trajectory color to the settings gui
    BooleanButton.greenRedBackground();
    map.trajectoryOnOffController = gui.add({
        type: 'boolean',
        params: map,
        property: 'trajectory',
        onChange: function() {
            map.drawImageChanged();
        }
    });
    // add a controller for a trajectory color, destroy if not required
    map.trajectoryColorController = gui.add({
        type: 'color',
        params: map,
        property: 'trajectoryColor',
        onChange: function() {
            map.drawImageChanged();
        }
    });
    // what to we want to see (you can destroy it)
    map.whatToShowController = gui.add({
        type: 'selection',
        params: map,
        property: 'draw',
        options: {
            'structure': map.callDrawStructure,
            'image - low quality': map.callDrawImageLowQuality,
            'image - high quality': map.callDrawImageHighQuality,
            'image - very high quality': map.callDrawImageVeryHighQuality
        },
        onChange: function() {
            if (map.draw === map.callDrawFundamentalRegion) {
                // choosing not to make the map etc. for accelerating builder
                map.updatingTheMap = false;
                map.drawMapChanged();
            } else {
                // making map and output image if map has not been created before
                // because of using accelerated builder
                map.drawImageChangedCheckMapUpdate();
            }
        }
    });
    // add controllers for structure contrast
    map.lightController = gui.add({
        type: 'number',
        params: map,
        property: 'light',
        min: 0,
        max: 1,
        onChange: function() {
            map.makeStructureColors();
            map.drawImageChanged();
        }
    });
    map.darkController = map.lightController.add({
        type: 'number',
        params: map,
        property: 'dark',
        min: 0,
        max: 1,
        onChange: function() {
            map.makeStructureColors();
            map.drawImageChanged();
        }
    });
    // a hidden canvas for the input image
    map.inputCanvas = document.createElement('canvas'); // has default width and height
    map.inputCanvas.style.display = 'none';
    map.inputPixels = new Pixels(map.inputCanvas);
    map.inputCanvasContext = map.inputCanvas.getContext('2d');
    map.inputImageLoaded = false;
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
            if (!map.drawingInputImage) {
                map.whatToShowController.setValueOnly('image - low quality');
            }
            map.loadInputImage();
        },
        onInteraction: function() {
            if (!map.drawingInputImage) {
                map.whatToShowController.setValueOnly('image - low quality');
            }
            map.drawImageChangedCheckMapUpdate();
        }
    });
    // setup control canvas
    // a div that contains the control canvas to 
    // avoid that the lower part of the gui 'jumps' if the input image changes
    const controlDiv = document.createElement('div');
    map.controlDiv = controlDiv;
    // force the scroll bar with vertical overflow of the bodydiv
    controlDiv.style.position = 'relative'; // to make centering work
    controlDiv.style.height = '10000px';
    gui.bodyDiv.appendChild(controlDiv);
    // now the clientwidth accounts for the scroll bar
    // and we can get the effective width of the gui
    // we can only determine the clientwidth if the folder (and parents) is open (displayed)
    const parentGuiClosed = gui.parent && gui.parent.closed;
    if (parentGuiClosed) {
        gui.parent.bodyDiv.style.display = "block";
    }
    if (gui.closed) {
        gui.bodyDiv.style.display = "block";
    }
    map.guiWidth = gui.bodyDiv.clientWidth;
    if (gui.closed) {
        gui.bodyDiv.style.display = "none";
    }
    if (parentGuiClosed) {
        gui.parent.bodyDiv.style.display = "none";
    }
    controlDiv.style.width = map.guiWidth + 'px';
    controlDiv.style.height = map.guiWidth + 'px';
    controlDiv.style.backgroundColor = '#dddddd';
    // a CENTERED canvas in the controldiv 
    map.controlCanvas = document.createElement('canvas');
    const controlCanvas = map.controlCanvas;
    controlDiv.appendChild(controlCanvas);
    controlCanvas.style.position = 'absolute';
    controlCanvas.style.top = '50%';
    controlCanvas.style.left = '50%';
    controlCanvas.style.transform = 'translate(-50%,-50%)';
    controlCanvas.style.cursor = 'pointer';
    controlCanvas.width = map.guiWidth;
    controlCanvas.height = map.guiWidth;
    map.controlPixels = new Pixels(controlCanvas);
    map.controlCanvasContext = controlCanvas.getContext('2d');
    // the transform from the map to the input image, normalized
    // beware of border
    // initial values depend on the image
    // but not on the map (because it is normalized)
    map.inputTransform = new CoordinateTransform(gui, null, true);
    const inputTransform = map.inputTransform;
    inputTransform.setStepShift(1);
    map.inputTransform.onChange = function() {
        map.drawImageChanged();
    };
    // resetting the input transform means adjusting the image to range
    map.inputTransform.resetButton.callback = function() {
        map.setupMapImageTransform();
        map.drawImageChanged();
    };

    // the mouse events on the control canvas
    map.mouseEvents = new MouseEvents(map.controlCanvas);
    const mouseEvents = map.mouseEvents;
    // vectors for intermediate results
    const u = {
        x: 0,
        y: 0
    };
    const v = {
        x: 0,
        y: 0
    };

    // upon click on control image: change to showing image in low quality
    mouseEvents.downAction = function() {
        ParamGui.closePopups();
        if (!map.drawingInputImage) {
            map.whatToShowController.setValueOnly('image - low quality');
            map.drawImageChangedCheckMapUpdate();
        }
        mouseEvents.element.onwheel = mouseEvents.onWheelHandler;
    };
    // drag image: map.inputImageControlCanvasScale is scale from input image to control image
    mouseEvents.dragAction = function() {
        const shiftX = mouseEvents.dx / map.inputImageControlCanvasScale;
        const shiftY = mouseEvents.dy / map.inputImageControlCanvasScale;
        inputTransform.shiftX += shiftX;
        inputTransform.shiftY += shiftY;
        inputTransform.updateUI();
        inputTransform.updateTransform();
        map.drawImageChanged();
    };
    // zoom or rotate
    // the controlcanvas shows a 'shadow' of the mapping result
    // its center should stay fixed when zoomin or scrolling
    // that means the inputTransformation does not change its image of the center of the map
    // be careful not to interfere with ui scrolling
    mouseEvents.element.onwheel = null;

    mouseEvents.wheelAction = function() {
        if (map.drawingInputImage) {
            // position of mouse in input image plane
            u.x = mouseEvents.x / map.inputImageControlCanvasScale;
            u.y = mouseEvents.y / map.inputImageControlCanvasScale;
            v.x = u.x;
            v.y = u.y;
            // back to map plane
            inputTransform.inverseTransform(v);
            if (keyboard.shiftPressed) {
                const step = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.angleStep : -CoordinateTransform.angleStep;
                inputTransform.angle += step;
            } else {
                const zoomFactor = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.zoomFactor : 1 / CoordinateTransform.zoomFactor;
                inputTransform.scale *= zoomFactor;
            }
            inputTransform.updateTransform();
            // transform after zooming/rotating
            inputTransform.transform(v);
            // correction
            inputTransform.shiftX -= (v.x - u.x);
            inputTransform.shiftY -= (v.y - u.y);
            inputTransform.updateUI();
            inputTransform.updateTransform();
            map.drawImageChanged();
        }
    };

    mouseEvents.outAction = function() {
        mouseEvents.element.onwheel = null;
    };
};

/**
 * add the possibility to draw regions
 * @method map.addDrawRegions
 */
map.addDrawRegions = function() {
    map.whatToShowController.addOption('regions', map.callDrawRegions);
};

/**
 * add an option to show the fundamental region
 * pixels that do not map, accelerates the calculation
 * implementation depends on the model
 * @method map.addDrawFundamentalRegion
 */
map.addDrawFundamentalRegion = function() {
    map.whatToShowController.addOption('fundamental region', map.callDrawFundamentalRegion);
};

/**
 * add the possibility to draw iterations
 * needs the settingsGui
 * @method map.addDrawIterations
 */
map.addDrawIterations = function() {
    map.whatToShowController.addOption('iterations', map.callDrawIterations);
    map.makeIterationsColor();
    map.thresholdController = map.showingGui.add({
        type: 'number',
        params: map,
        property: 'iterationsThreshold',
        labelText: 'threshold',
        step: 1,
        min: 0,
        onChange: function() {
            map.makeIterationsColor();
            map.drawMapChanged();
        }
    });
    map.gammaController = map.thresholdController.add({
        type: 'number',
        params: map,
        property: 'iterationsGamma',
        labelText: 'gamma',
        min: 0.1,
        onChange: function() {
            map.makeIterationsColor();
            map.drawMapChanged();
        }
    });
};

/**
 * add the possibility to draw the limit set
 * needs the settingsGui
 * @method map.addDrawLimitset
 */
map.addDrawLimitset = function() {
    map.whatToShowController.addOption('limit set', map.callDrawLimitset);
};