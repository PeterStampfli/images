/* jshint esversion:6 */

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents
} from "../libgui/modules.js";

import {
    julia
} from "./julia.js";

import {
    points
} from "./points.js";

export const map = {};

map.iters = 1;
map.limit = 10;
map.drawingInputImage = false;

map.setup = function(gui) {
    gui.addParagraph('mapping');
    gui.add({
        type: 'number',
        params: map,
        property: 'limit',
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: map,
        property: 'iters',
        step: 1,
        min: 0,
        max: 127,
        onChange: julia.drawNewStructure
    });
};

map.setupDrawing = function(gui) {
    map.draw = map.callDrawStructure;
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
            julia.drawNewImage();
        }
    });
    // a hidden canvas for the input image
    map.inputCanvas = document.createElement('canvas'); // has default width and height
    map.inputCanvas.style.display = 'none';
    map.inputPixels = new Pixels(map.inputCanvas);
    map.inputCanvasContext = map.inputCanvas.getContext('2d');
    map.inputImageLoaded = false;
    // setup image selection
    map.inputImage = '../libgui/dormouse.jpg';
    map.imageController = gui.add({
        type: 'image',
        params: map,
        property: 'inputImage',
        options: {
            dormouse: '../libgui/dormouse.jpg',
            'railway station': '../libgui/railway station.jpg'
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
    map.inputTransform.resetButton.addHelp('Above you see the input image and its parts used for the kaleidoscopic image. Unused pixels are greyed out. You can change this using mouse drag on the image for translation, mouse wheel to zoom and shift-mouse wheel to rotate. The current mouse position is the center for zoom and rotation.');

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


// map data, dimensions same as canvas, if not => create new arrays

map.width = 1;
map.height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);

// structure info
// for julia set structure of inversion, 0 or 1
// active pixels: value from 0 to 127
// inactive (invalid) pixels: value from 128 to 255
map.structureArray = new Uint8Array(1);

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * if the mapping determines the "pixel sizes": set map.needsSizeArrayUpdate = false afterwards
 * and we need a value for the ranges of the mapping
 * * initialize the map positions and structure
 * @method map.startDrawing
 */
map.init = function() {
    // initialize map
    map.needsSizeArrayUpdate = true;
    map.rangeValid = false;
    output.pixels.update();
    output.isDrawing = true;
    if ((map.width !== output.canvas.width) || (map.height !== output.canvas.height)) {
        map.width = output.canvas.width;
        map.height = output.canvas.height;
        const size = map.width * map.height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.structureArray = new Uint8Array(size);
    }
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            xArray[index] = x;
            yArray[index] = y;
            index += 1;
            x += scale;
        }
        y += scale;
    }
    map.structureArray.fill(0);
};

/**
 * apply limit to the map, all pixels with radius> limit will become inactive
 * complement to 255
 * no further computation for these pixels
 */
map.radialLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        if ((x * x + y * y) > limit2) {
            structureArray[index] = 255 - structure;
        }
    }
};

/**
 * invert select: needed for simple julia set display
 *  for showing structure of "blocked" pixels
 *  assuming active points have value select=1 and 'blocked' pixels value 0
 */
map.invertSelect = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
        structureArray[index] = 255 - structureArray[index];
    }
};

// count iterations, increment for active pixels
map.countIterations = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure < 128) {
            structureArray[index] = structure + 1;
        }
    }
};

// make the julia set
map.juliaSet = function() {
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.radialLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
};

// showing the map
//==================================

// flag to show that the input image is used
map.drawingInputImage = false;
// flag, shows if there is an updated map
map.updatingTheMap = true;

// size of pixels after mapping, not taking into account the final input image transform
map.sizeArray = new Float32Array(1);
map.maxSize = 0; // maximum value

// greying out the control image
map.controlPixelsAlpha = 100;

// fractional length of image region checked initially
map.initialImageCovering = 0.75;

// hide all image controllers
map.allImageControllersHide = function() {
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

// the different drawing methods
//===================================================
map.callDrawStructure = function() {
    console.log('structure');
    map.drawingInputImage = false;
    map.allImageControllersHide();
    map.drawStructure();
};
map.callDrawImageLowQuality = function() {
    console.log('lowquality');
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    //   map.drawImageLowQuality();
};
map.callDrawImageHighQuality = function() {
    console.log('highquality');
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    //  map.drawImageHighQuality();
};
map.callDrawImageVeryHighQuality = function() {
    console.log('veryhighquality');
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    //  map.drawImageVeryHighQuality();
};

/**
 * show structure of the map: color depending on the structure index (even/odd)
 * using the map.colorTable
 * @method map.drawStructure
 */

// integer colors for structure
const invalidColor = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
});

const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});

const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});

map.drawStructure = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = map.width * map.height;
    const pixelsArray = output.pixels.array;
    const structureArray = map.structureArray;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const structure = structureArray[index];
        if (structure < 128) {
            if ((structure & 1) === 0) {
                pixelsArray[index] = white;
            } else {
                pixelsArray[index] = black;
            }
        } else {
            pixelsArray[index] = invalidColor;
        }
    }
    output.pixels.show();
};

// for mapping images
//==================================================


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
