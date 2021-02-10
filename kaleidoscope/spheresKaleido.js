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

// coordinates of point, and other data
var x, y, z, w, valid, inversions;
// for terminating
var change = true;
var maxIte = 20;
// radius, depending on space
var r3d, r4d;

// trigonometry
const rt3 = 1.732050808;
const pi = Math.PI;
const tanPi10 = Math.tan(pi / 10);
const tan3Pi10 = Math.tan(3 * pi / 10);
const cosPi5 = Math.cos(pi / 5);
const sinPi5 = Math.sin(pi / 5);
const cos2Pi5 = Math.cos(2 * pi / 5);
const sin2Pi5 = Math.sin(2 * pi / 5);
const cos3Pi5 = Math.cos(3 * pi / 5);
const sin3Pi5 = Math.sin(3 * pi / 5);
const cos4Pi5 = Math.cos(4 * pi / 5);
const sin4Pi5 = Math.sin(4 * pi / 5);
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
    let yy = shiftY;
    for (var j = 0; j < map.height; j++) {
        let xx = shiftX;
        for (var i = 0; i < map.width; i++) {
            x = xx;
            y = yy;
            inversions = 0;
            valid = 1;
            mapping();
            xArray[index] = x;
            yArray[index] = y;
            iterationsArray[index] = inversions;
            sizeArray[index] = valid;
            index += 1;
            xx += scale;
        }
        yy += scale;
    }
};

function normalView3dUnitUpper() {
    const r2 = x * x + y * y;
    if (r2 > 1) {
        valid = -1;
    } else {
        z = Math.sqrt(1 - r2);
    }
}


function normalView3dUpper() {
    const r3d2 = r3d * r3d;
    const r2 = x * x + y * y;
    if (r2 > r3d2) {
        valid = -1;
    } else {
        z = Math.sqrt(r3d2 - r2);
    }
}

function stereographic3dUnit() {
    const factor = 2 / (1 + x * x + y * y);
    x *= factor;
    y *= factor;
    z = 1 - factor;
}

function stereographic3d() {
    const factor = 2 / (1 + (x * x + y * y) / (r3d2 * r3d2));
    x *= factor;
    y *= factor;
    z = r3d * (1 - factor);
}

function inverseStereographic3dUnit() {
    const factor = 1 / (1 - z);
    x *= factor;
    y *= factor;
}

function inverseStereographic3d() {
    const factor = 1 / (1 - z / r3d);
    x *= factor;
    y *= factor;
}

function inverseNormal() {}

var alpha, beta, gamma;
var n2x, n2y, n3x, n3y, n3z;

// the mapping - setup of geometry
var dihedral = d5;

function geometry() {
    // setting up the three planes
    gamma = pi / 2;
    beta = pi / 3;
    switch (basic.platonic) {
        case 'tetrahedron':
            alpha = pi / 3;
            dihedral = d3;
            break;
        case 'octahedron':
            alpha = pi / 4;
            dihedral = d4;
            break;
        case 'ikosahedron':
            alpha = pi / 5;
            dihedral = d5;
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
}

// d_4 symmetry in the (x,y) plane
function d4() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y < 0) {
        y = -y;
        inversions += 1;
        change = true;
    }
    if (x > y) {
        const h = x;
        x = y;
        y = h;
        inversions += 1;
        change = true;
    }
}

// d_3 symmetry in the (x,y) plane
function d3() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y > 0) {
        if (x > rt3 * y) {
            const h = 0.5 * (rt3 * x - y);
            x = 0.5 * (x + rt3 * y);
            y = h;
            inversions += 1;
            change = true;
        }
    } else {
        if (x > -rt3 * y) {
            const h = 0.5 * (rt3 * x - y);
            x = 0.5 * (x + rt3 * y);
            y = h;
            inversions += 1;
            change = true;
        } else {
            const h = 0.5 * (rt3 * x - y);
            x = -0.5 * (x + rt3 * y);
            y = h;
            change = true;
        }
    }
}

// d_5 symmetry in the (x,y) plane
function d5() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y > 0) {
        if (y < tanPi10 * x) {
            const h = sin2Pi5 * x + cos2Pi5 * y;
            x = cos2Pi5 * x - sin2Pi5 * y;
            y = h;
            change = true;
        } else if (y < tan3Pi10 * x) {
            const h = sin3Pi5 * x - cos3Pi5 * y;
            x = cos3Pi5 * x + sin3Pi5 * y;
            y = h;
            inversions += 1;
            change = true;
        }
    } else {
        if (y > -tanPi10 * x) {
            const h = sin2Pi5 * x + cos2Pi5 * y;
            x = cos2Pi5 * x - sin2Pi5 * y;
            y = h;
            change = true;
        } else if (y > -tan3Pi10 * x) {
            const h = sinPi5 * x - cosPi5 * y;
            x = cosPi5 * x + sinPi5 * y;
            y = h;
            inversions += 1;
            change = true;
        } else {
            const h = sin4Pi5 * x + cos4Pi5 * y;
            x = cos4Pi5 * x - sin4Pi5 * y;
            y = h;
            change = true;
        }
    }
}

function thirdMirror() {
    let d = n3x * x + n3y * y + n3z * z;
    if (d < 0) {
        d += d;
        x -= d * n3x;
        y -= d * n3y;
        z -= d * n3z;
        inversions += 1;
        change = true;
    }
}

function mapping() {
    r3d = 2;
    normalView3dUpper();

    if (valid) {
        dihedral();
        for (var i = 0; i < maxIte; i++) {
            change = false;
            thirdMirror();

            dihedral();
            if (!change) {
                break;
            }
        }
    }
}


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

basic.setup();
map.drawMapChanged();