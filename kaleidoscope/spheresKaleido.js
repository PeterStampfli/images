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

function stereographic(point) {
    const factor = 2 / (1 + point.x * point.x + point.y * point.y);
    point.x *= factor;
    point.y *= factor;
    point.z = 1 - factor;
}


function inverseStereographic(point) {
    const factor = 1 / (1 - z);
    point.x *= factor;
    point.y *= factor;
}

function inverseNormal(point){};

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