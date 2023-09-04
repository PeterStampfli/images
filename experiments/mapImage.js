/* jshint esversion:6 */

import {
    output,
    Pixels,
    CoordinateTransform,
    MouseEvents
} from "../libgui/modules.js";

export const julia = {};
export const map = {};

// map data, dimensions same as canvas, if not => create new arrays

map.width = 1;
map.height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);
map.driftXArray = new Float32Array(1);
map.driftYArray = new Float32Array(1);

// structure info
// for julia set structure of inversion, 0 or 1
// active pixels: value from 0 to 127
// inactive (invalid) pixels: value from 128 to 255
map.structureArray = new Uint8Array(1);

// the size of pixels of the map, for antialiasing
map.sizeArray = new Float32Array(1);

map.inputTransformValid = false;

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * if the mapping determines the "pixel sizes": set map.needsSizeArrayUpdate = false afterwards
 * and we need a value for the ranges of the mapping
 * fixes scale and offset outmatically
 * height=2, from -1 to +1, center ids origin
 * @method map.startDrawing
 */
map.init = function() {
    // initialize map
    map.sizesValid = false;
    map.rangeValid = false;
    // map.inputTransformValid = false;
    output.pixels.update();
    output.isDrawing = true;
    if ((map.width !== output.canvas.width) || (map.height !== output.canvas.height)) {
        map.width = output.canvas.width;
        map.height = output.canvas.height;
        const size = map.width * map.height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.structureArray = new Uint8Array(size);
        map.sizeArray = new Float32Array(size);
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

// for drifts, storing initial or intermediate values
map.makeDriftArrays = function() {
    const length = map.xArray.length;
    if ((map.xArray.length !== map.driftXArray.length)) {
        map.driftXArray = new Float32Array(length);
        map.driftYArray = new Float32Array(length);
    }
};

map.addDrift = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const driftXArray = map.driftXArray;
    const driftYArray = map.driftYArray;
    const length = xArray.length;
    for (let index = 0; index < length; index++) {
        xArray[index] -= driftXArray[index];
        yArray[index] += driftYArray[index];
    }
};

//  making images
//========================================================================

/**
 * load the image with url=map.inputImage
 * put it on control canvas and draw the new image on the output canvas
 * @method map.loadInputImage
 */

map.loadInputImage = function() {
    let image = new Image();

    image.onload = function() {
        // load to the input canvas, determine scale, and update pixels
        map.inputCanvas.width = image.width;
        map.inputCanvas.height = image.height;
        map.inputCanvasContext.drawImage(image, 0, 0);
        map.inputPixels.update();
        // determine scale from input image to controle image
        // to fit the control image into a square of gui width
        map.inputImageControlCanvasScale = Math.min(map.guiWidth / image.width, map.guiWidth / image.height);
        map.controlCanvas.width = map.inputImageControlCanvasScale * image.width;
        map.controlCanvas.height = map.inputImageControlCanvasScale * image.height;
        // load input image to the control canvas
        map.controlCanvasContext.drawImage(image, 0, 0, map.controlCanvas.width, map.controlCanvas.height);
        map.controlPixels.update();
        // dereference the image for garbage collection
        image = null;
        //  draw the new output image
        map.inputTransformValid = false;
        julia.drawNewImage();
    };

    image.src = map.inputImage;
};


map.setupDrawing = function(gui) {
    map.draw = map.callDrawStructure;
    gui.addParagraph('<strong>image</strong>');
    map.whatToShowController = gui.add({
        type: 'selection',
        params: map,
        property: 'draw',
        options: {
            'structure': map.callDrawStructure,
            'amplitude': map.callDrawAmplitude,
            'phase': map.callDrawPhase,
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
            julia.drawNewImage();
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
    map.inputTransform.setStepShift(1);
    map.inputTransform.onChange = function() {
        julia.drawNewImage();
    };
    // resetting the input transform means adjusting the image to range
    map.inputTransform.resetButton.callback = function() {
        map.inputTransformValid = false;
        julia.drawNewImage();
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
        if (!map.drawingInputImage) {
            map.whatToShowController.setValueOnly('image - low quality');
            julia.drawNewImage();
        }
        mouseEvents.element.onwheel = mouseEvents.onWheelHandler;
    };
    // drag image: map.inputImageControlCanvasScale is scale from input image to control image
    mouseEvents.dragAction = function() {
        const shiftX = mouseEvents.dx / map.inputImageControlCanvasScale;
        const shiftY = mouseEvents.dy / map.inputImageControlCanvasScale;
        map.inputTransform.shiftX += shiftX;
        map.inputTransform.shiftY += shiftY;
        map.inputTransform.updateUI();
        map.inputTransform.updateTransform();
        julia.drawNewImage();
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
            map.inputTransform.inverseTransform(v);
            if (keyboard.shiftPressed) {
                const step = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.angleStep : -CoordinateTransform.angleStep;
                map.inputTransform.angle += step;
            } else {
                const zoomFactor = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.zoomFactor : 1 / CoordinateTransform.zoomFactor;
                map.inputTransform.scale *= zoomFactor;
            }
            map.inputTransform.updateTransform();
            // transform after zooming/rotating
            map.inputTransform.transform(v);
            // correction
            map.inputTransform.shiftX -= (v.x - u.x);
            map.inputTransform.shiftY -= (v.y - u.y);
            map.inputTransform.updateUI();
            map.inputTransform.updateTransform();
            julia.drawNewImage();
        }
    };

    mouseEvents.outAction = function() {
        mouseEvents.element.onwheel = null;
    };
};

// flag to show that the input image is used
map.drawingInputImage = false;

// flag, calculated ranges are valid
map.rangeValid = true;

// flag, calculated "pixelsizes" are valid
map.sizesValid = false;

// flag to show that transform from input image to output image is valid
// becomes false if map is recalculated or new image loaded
map.inputTransformValid = false;

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
    map.drawingInputImage = false;
    map.allImageControllersHide();
    map.drawStructure();
};
map.callDrawAmplitude = function() {
    map.drawingInputImage = false;
    map.allImageControllersHide();
    map.drawAmplitude();
};

map.callDrawPhase = function() {
    map.drawingInputImage = false;
    map.allImageControllersHide();
    map.drawPhase();
};
map.callDrawImageLowQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.drawImageLowQuality();
};
map.callDrawImageHighQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.drawImageHighQuality();
};
map.callDrawImageVeryHighQuality = function() {
    map.drawingInputImage = true;
    map.inputImageControllersShow();
    map.drawImageVeryHighQuality();
};

/**
 * show structure of the map: color depending on the structure index (even/odd)
 * using the map.colorTable
 * @method map.drawStructure
 */

// integer colors for structure ->transparent
const invalidColor = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
});

// integer colors for structure
const grey = Pixels.integerOfColor({
    red: 180,
    green: 180,
    blue: 180,
    alpha: 255
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
const blue = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: 255
});

const yellow = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});

map.drawStructure = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const pixelsArray = output.pixels.array;
    const structureArray = map.structureArray;
    const length = structureArray.length;
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

const nanColor = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 0,
    alpha: 255
});
const inftyColor = Pixels.integerOfColor({
    red: 255,
    green: 128,
    blue: 0,
    alpha: 255
});
const invColor = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: 255
});
const smaller05Color = Pixels.integerOfColor({
    red: 180,
    green: 180,
    blue: 180,
    alpha: 255
});
const smaller1Color = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});
const greater1Color = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});
const greater2Color = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});

map.drawAmplitude = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const pixelsArray = output.pixels.array;
    const structureArray = map.structureArray;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const length = structureArray.length;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const structure = structureArray[index];
        if (structure < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const amp2 = x * x + y * y;
            if (isFinite(amp2)) {
                if (amp2 < 0.25) {
                    pixelsArray[index] = smaller05Color;
                } else if (amp2 < 1) {
                    pixelsArray[index] = smaller1Color;
                } else if (amp2 < 4) {
                    pixelsArray[index] = greater1Color;
                } else {
                    pixelsArray[index] = greater2Color;
                }
            } else if (isNaN(amp2)) {
                pixelsArray[index] = nanColor;
            } else {
                pixelsArray[index] = inftyColor;
            }
        } else {
            pixelsArray[index] = invColor;
        }
    }
    output.pixels.show();
};

// for mapping images
//==================================================

/**
 * get center and range of map values (only valid points, structure < 128)
 * required for loading an input image and zooming/rotating image
 * @method map.determineRange
 */
map.determineRange = function() {
    if (!map.rangeValid) {
        map.rangeValid = true;
        const structureArray = map.structureArray;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        let xMin = 1e10;
        let xMax = -1e10;
        let yMin = 1e10;
        let yMax = -1e10;
        for (let i = 0; i < length; i++) {
            if (structureArray[i] < 128) {
                const x = xArray[i];
                xMax = Math.max(x, xMax);
                xMin = Math.min(x, xMin);
                const y = yArray[i];
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
 * determine transformation from map to input image
 * use before drawing the image
 * @method map.setupMapImageTransform
 */
map.setupMapImageTransform = function() {
    if (!map.inputTransformValid) {
        map.inputTransformValid = true;
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
        map.setupMapImageTransform();
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        const inputImageControlCanvasScale = map.inputImageControlCanvasScale;
        const structureArray = map.structureArray;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        const point = {};
        for (var index = 0; index < length; index++) {
            if (structureArray[index] < 128) {
                point.x = xArray[index];
                point.y = yArray[index];
                map.inputTransform.transform(point);
                output.pixels.array[index] = map.inputPixels.getNearestPixel(point.x, point.y);
                map.controlPixels.setOpaque(inputImageControlCanvasScale * point.x, inputImageControlCanvasScale * point.y);
            } else {
                output.pixels.array[index] = 0; //transparent black
            }
        }
        map.controlPixels.show();
        output.pixels.show();
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

map.sizeArrayUpdate = function() {
    if (!map.sizesValid) {
        map.sizesValid = true;
        map.maxSize = 0;
        const width = map.width;
        const widthM = width - 1;
        const heightM = map.height - 1;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const sizeArray = map.sizeArray;
        const structureArray = map.structureArray;
        var xPlusX, x, yPlusX, y, structurePlusX, structure;
        var index;
        var ax, ay, bx, by;
        var newSize;
        // use rhomb defined by mapped vectors
        // from point(i,j) to point(i+1,j)
        // from point(i,j) to point(i,j+1)
        // so it's offset by half a pixel
        // sizes for i=width-1 and j=height-1 have to be copied
        for (var j = 0; j < heightM; j++) {
            index = j * map.width;
            xPlusX = xArray[index];
            yPlusX = yArray[index];
            structurePlusX = structureArray[index];
            for (var i = 0; i < widthM; i++) {
                x = xPlusX;
                const index1 = index + 1;
                xPlusX = xArray[index1];
                y = yPlusX;
                yPlusX = yArray[index1];
                structure = structurePlusX;
                structurePlusX = structureArray[index1];
                // if size <0 then it is an invalid point, do not change/use that
                if ((structure < 128) && (structurePlusX < 128) && (structureArray[index + width] < 128)) {
                    // the first side
                    ax = xPlusX - x;
                    ay = yPlusX - y;
                    // the second side
                    bx = xArray[index + width] - x;
                    by = yArray[index + width] - y;
                    // surface results from absolute value of the cross product
                    // the size is its square root
                    newSize = Math.sqrt(Math.abs(ax * by - ay * bx));
                    map.maxSize = Math.max(map.maxSize, newSize);
                    sizeArray[index] = newSize;
                } else {
                    newSize = -1;
                }
                index++;
            }
            // the last pixel i=map.width-1 in a row copies the value before, if valid
            if (structureArray[index] < 128) {
                sizeArray[index] = newSize;
            }
        }
        // the top row at j=height-1 copies the lower row
        let indexMax = width * map.height;
        for (index = indexMax - width; index < indexMax; index++) {
            if (structureArray[index] < 128) {
                sizeArray[index] = sizeArray[index - width];
            }
        }
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
        map.setupMapImageTransform();
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        const inputImageControlCanvasScale = map.inputImageControlCanvasScale;
        const structureArray = map.structureArray;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        const color = {
            red: 0,
            green: 128,
            blue: 0,
            alpha: 255
        };
        const point = {};
        for (var index = 0; index < length; index++) {
            if (structureArray[index] < 128) {
                point.x = xArray[index];
                point.y = yArray[index];
                map.inputTransform.transform(point);
                let size = totalScale * map.sizeArray[index];
                map.inputPixels.getHighQualityColor(color, point.x, point.y, size);
                output.pixels.setColorAtIndex(color, index);
                map.controlPixels.setOpaque(inputImageControlCanvasScale * point.x, inputImageControlCanvasScale * point.y);
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
 * high quality using cubic interpolation, nearest neighbor, averaging or linear interpolation
 * @method map.drawImageHighQuality
 */
map.drawImageVeryHighQuality = function() {
    // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded) {
        map.inputImageLoaded = true;
        map.loadInputImage();
    } else {
        map.sizeArrayUpdate();
        const totalScale = map.inputTransform.totalScale;
        map.setupMapImageTransform();
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        const inputImageControlCanvasScale = map.inputImageControlCanvasScale;
        const structureArray = map.structureArray;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        const color = {
            red: 0,
            green: 128,
            blue: 0,
            alpha: 255
        };
        const point = {};
        for (var index = 0; index < length; index++) {
            if (structureArray[index] < 128) {
                point.x = xArray[index];
                point.y = yArray[index];
                map.inputTransform.transform(point);
                let size = totalScale * map.sizeArray[index];
                map.inputPixels.getVeryHighQualityColor(color, point.x, point.y, size);
                output.pixels.setColorAtIndex(color, index);
                map.controlPixels.setOpaque(inputImageControlCanvasScale * point.x, inputImageControlCanvasScale * point.y);
            } else {
                output.pixels.array[index] = 0; //transparent black
            }
        }
        map.controlPixels.show();
        output.pixels.show();
    }
};

// showing phase as hue, brightness for radius
//=======================================================================================
// set rgb components of a color depending on hue, brightness and saturation values
// hue can have any value, cyclic, interval 0 to 1
// brightness and saturation are clamped to interval 0 to 1
function setRGBFromHBS(color, hue, brightness, saturation) {
    let red = 0;
    let green = 0;
    let blue = 0;
    hue = 6 * (hue - Math.floor(hue));
    const c = Math.floor(hue);
    const x = hue - c;
    switch (c) {
        case 0:
            blue = 1;
            red = x;
            break;
        case 1:
            blue = 1 - x;
            red = 1;
            break;
        case 2:
            green = x;
            red = 1;
            break;
        case 3:
            green = 1;
            red = 1 - x;
            break;
        case 4:
            blue = x;
            green = 1;
            break;
        case 5:
            blue = 1;
            green = 1 - x;
            break;
    }
    saturation = Math.max(0, Math.min(1, saturation));
    brightness = 255.9 * Math.max(0, Math.min(1, brightness));
    color.red = Math.floor(brightness * (saturation * red + 1 - saturation));
    color.green = Math.floor(brightness * (saturation * green + 1 - saturation));
    color.blue = Math.floor(brightness * (saturation * blue + 1 - saturation));
}

map.drawPhase = function() {
    const minBrightness = 0.7;
    const extraBrightness = 1 - minBrightness;
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const iPi2 = 0.5 / Math.PI;
    const limit2 = map.limit * map.limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const pixelsArray = output.pixels.array;
    const color = {};
    color.alpha = 255;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        const x = xArray[index];
        const y = yArray[index];
        const r2 = x * x + y * y;
        const brightness = minBrightness + r2 / limit2 * extraBrightness;
        const hue = iPi2 * Math.atan2(y, x);
        setRGBFromHBS(color, hue, brightness, 1);
        pixelsArray[index] = Pixels.integerOfColor(color);
    }
    output.pixels.show();
};