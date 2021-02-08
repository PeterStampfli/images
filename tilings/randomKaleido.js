/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

/**
 * basic things for screen output and mouse input
 * @namespace basic
 */
const basic = {};

/**
 * setting up the output, gui and drawing
 * @method basic.setup
 */
basic.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'kaleidoBuilder',
        closed: false
    });
    basic.gui = gui;
    // create an output canvas, with coordinates and pixels
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(5, 5, 10);
    output.createPixels();
    // add options for the output image
    output.addImageProcessing();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    // options of what to show
    map.makeShowingGui(gui);
    map.maxIterationsController.destroy();
    map.linewidthController.destroy();
    map.trajectoryOnOffController.destroy();
    map.trajectoryColorController.destroy();
    // add drag and drop for the input image
    map.imageController.addDragAndDropWindow();
    map.setOutputDraw(); // links the output drawing routines to the map routines

    /**
     * show structure of the map: color depending on the structure index
     * using the map.colorTable
     * @method map.drawStructure
     */
    const colorZero = Pixels.integerOfColor({
        red: 255,
        green: 255,
        blue: 180,
        alpha: 255
    });
    const colorOne = Pixels.integerOfColor({
        red: 180,
        green: 180,
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
        const sizeArray = map.sizeArray;
        const structureColors = map.structureColors;
        const iterationsArray = map.iterationsArray;
        for (var index = 0; index < length; index++) {
            if (sizeArray[index] >= 0) {
                if ((iterationsArray[index] & 1) === 0) {
                    pixelsArray[index] = colorZero;
                } else {
                    pixelsArray[index] = colorOne;
                }
            } else {
                pixelsArray[index] = 0; // transparent black
            }
        }
        output.pixels.show();
    };

    /**
     * what to do when the map changes (parameters, canvas size too)
     * circles might change - we have to determine the regions
     * @method map.drawMapChanged
     */
    map.drawMapChanged = function() {
        // make pixels
        map.startDrawing();
        // make the qp structure
        // make the map using the qp structure
        //           map.xArray[index] = point.x;
        //           map.yArray[index] = point.y;
        //           map.iterationsArray[index] = 0 or 1;
        //           map.sizeArray[index] > 0 for image points (valid), < 0 transparent
        //test only
        map.make();

        // draw image, taking into account regions, and new options
        map.drawImageChanged();
    };

    /**
     * what to do when only the image changes
     * @method map.drawImageChanged
     */
    map.drawImageChanged = function() {
        map.draw();
        // add tiles borders
        output.drawGrid();

    };
};

const setup = {};
setup.n = 10; // number of vertical cells
setup.m = 10; // number of horizontal cells
setup.variant = true;  // the two differeent kaleidoscopes
setup.symmetry='d4';

const centerDown = []; // choice of center

// randomize center position
function randomCenter() {
    centerDown.length = setup.n * setup.m;
    const length = centerDown.length;
    for (var i = 0; i < length; i++) {
        centerDown[i] = (Math.random() >= 0.5);
    }
}

randomCenter();
console.log(centerDown);

/**
 * the mapping function transforms a point argument
 * (point.x,point.y) coordinates
 * point.structureIndex: initially 0, number of iterations
 * point.region: initially 0, number of region for endpoint (if distinct regions)
 * point.valid>0 gives image pixels, point.valid<0 makes transparent pixels
 * @method map.mapping
 * @param {object}point
 */
map.mapping = function(point) {
    let x = point.x;
    let y = point.y;
    if ((x < 0) || (y < 0) || (x >= setup.n) || (y >= setup.m)) {
        point.valid = -1;
    } else {
        let m = Math.floor(x);
        let n = Math.floor(y);
        x -= m;
        y -= n;
        if (setup.variant) {
            if ((m&1)===0){
                x=1-x;
            }
            if ((n&1)===0){
                y=1-y;
            }
            if (y > x) {
                const h = y;
                y = x;
                x = h;
                point.iterations += 1;
            }
            if (y > 1-x) {
                const h = 1-y;
                y = 1-x;
                x = h;
                point.iterations += 1;
            }

        } else {
            if (x > 0.5) {
                x = 1 - x;
                point.iterations += 1;
            }
            if (y > 0.5) {
                y = 1 - y;
                point.iterations += 1;
            }
            if (y > x) {
                const h = y;
                y = x;
                x = h;
                point.iterations += 1;
            }
        }
        switch(setup.symmetry){
            case 'd4':
            n=Math.min(n,setup.n-1-n);
            m=Math.min(m,setup.m-1-m);
if (m>n){
    const h=m;
    m=n;
    n=h;
}

            break;
        }
        if (centerDown[m + n * setup.m]) {
            y = -y;
            point.iterations += 1;
        }
        point.x = x;
        point.y = y;
    }


};


basic.setup();
map.drawMapChanged();