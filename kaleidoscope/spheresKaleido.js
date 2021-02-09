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

// the geometry
basic.platonic = 'ikosahedron';

/**
 * setting up the output, gui and drawing
 * @method basic.setup
 */
basic.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'spheres',
        closed: false
    });
    basic.gui = gui;
    // create an output canvas, with coordinates and pixels
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.createPixels();
    // add options for the output image
    output.addImageProcessing();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    // options of what to show
    map.makeShowingGui(gui);
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
                if (iterationsArray[index] === 0) {
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
        geometry();

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

    // choices for geometry
    gui.add({
        type: 'selection',
        params: basic,
        property: 'platonic',
        options: ['tetrahedron', 'octahedron', 'ikosahedron'],
        onChange: function() {
            console.log(basic.platonic);
            map.drawMapChanged();
        }
    });
};

// coordinates of point
var x, y, z, w, valid, iterations;

/**
 * make the map using the map.mapping(point) function
 * initialize map before
 * @method map.make
 */
map.make = function() {
    let scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    let offset = 0;
    switch (output.pixels.antialiasType) {
        case 'none':
            break;
        case '2*2 subpixels':
            offset = -2 * scale;
            break;
        case '3*3 subpixels':
            offset = -2.5 * scale;
            break;
    }
    shiftY += offset;
    shiftX += offset;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const regionArray = map.regionArray;
    const iterationsArray = map.iterationsArray;
    const sizeArray = map.sizeArray;
    const mapping = map.mapping;
    let yy = shiftY;
    for (var j = 0; j < map.height; j++) {
        let xx = shiftX;
        for (var i = 0; i < map.width; i++) {
            x = xx;
            y = yy;
            iterations = 0;
            valid = 1;
            mapping();
            xArray[index] = x;
            yArray[index] = y;
            iterationsArray[index] = iterations;
            sizeArray[index] = valid;
            index += 1;
            xx += scale;
        }
        yy += scale;
    }
};



function stereographic3d() {
    const factor = 2 / (1 + x * x + y * y);
    x *= factor;
    y *= factor;
    z = 1 - factor;
}


function inverseStereographic3d() {
    const factor = 1 / (1 - z);
    x *= factor;
    y *= factor;
}

function inverseNormal() {}

var alpha, beta, gamma;
var n2x, n2y, n3x, n3y, n3z;

// the mapping - setup of geometry
function geometry() {
    console.log('geo');
    gamma = Math.PI / 2;
    beta = Math.PI / 3;
    switch (basic.platonic) {
        case 'tetrahedron':
            alpha = Math.PI / 3;
            break;
        case 'octahedron':
            alpha = Math.PI / 4;
            break;
        case 'ikosahedron':
            alpha = Math.PI / 5;
            break;
    }
    n2x = -Math.cos(alpha);
    n2y = Math.sin(alpha);
    const tanPhi = (Math.cos(alpha) - Math.cos(gamma) / Math.cos(beta)) / Math.sin(alpha);
    const phi = Math.atan(tanPhi);
    const sinTheta = -Math.cos(beta) / Math.cos(phi);
    n3x = sinTheta * Math.cos(phi);
    n3y = sinTheta * Math.sin(phi);
    n3z = Math.sqrt(1 - sinTheta * sinTheta);

    console.log(n2x, n2y);
    console.log(n3x, n3y, n3z);
    console.log(Math.cos(alpha), n2x);
    console.log(Math.cos(beta), n3x);
    console.log(Math.cos(gamma), n2x * n3x + n2y * n3y);
}


map.mapping = function(point) {}; // default is identity


basic.setup();
map.drawMapChanged();