/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels,
    BooleanButton,
    Logger
} from "../libgui/modules.js";

import {
    geometry
} from "./hyperKaleidoGeometry.js";

export const controllers = {};

Logger.spacing = 2;

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'spheres',
    closed: false
});
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
map.makeShowingGui(gui, {
    closed: false
});
map.lightController.destroy();
map.linewidthController.destroy();
map.trajectoryOnOffController.destroy();
map.trajectoryColorController.destroy();
// add drag and drop for the input image
map.imageController.addDragAndDropWindow();
// link the output drawing routines to the map routines
map.setOutputDraw();

// for debugging
map.allImageControllersHide();

// the dihedrals
const dihedralControl = {
    type: 'number',
    params: geometry,
    min: 2,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
};

gui.addParagraph('<strong>basic three mirrors</strong>');
controllers.basicTetrahedron = gui.add({
    type: 'button',
    buttonText: 'tetrahedron',
    onChange: function() {
        controllers.d12.setValueOnly(3);
        controllers.d13.setValueOnly(3);
        controllers.d23.setValueOnly(2);
        map.drawMapChanged();
    }
});
controllers.basicOctahedron = controllers.basicTetrahedron.add({
    type: 'button',
    buttonText: 'octahedron',
    onChange: function() {
        controllers.d12.setValueOnly(4);
        controllers.d13.setValueOnly(3);
        controllers.d23.setValueOnly(2);
        map.drawMapChanged();
    }
});
controllers.basicIkosahedron = controllers.basicOctahedron.add({
    type: 'button',
    buttonText: 'ikosahedron',
    onChange: function() {
        controllers.d12.setValueOnly(5);
        controllers.d13.setValueOnly(3);
        controllers.d23.setValueOnly(2);
        map.drawMapChanged();
    }
});
controllers.d12 = gui.add(dihedralControl, {
    property: 'd12',
    labelText: 'order of 1-2'
});
controllers.d13 = controllers.d12.add(dihedralControl, {
    property: 'd13',
    labelText: '1-3'
});
controllers.d23 = controllers.d13.add(dihedralControl, {
    property: 'd23',
    labelText: '2-3'
});
controllers.d12.setActive(false);
controllers.d13.setActive(false);
controllers.d23.setActive(false);

// the fourth mirror
BooleanButton.greenRedBackground();
gui.add({
    type: 'boolean',
    params: geometry,
    property: 'useFourthMirror',
    labelText: '<strong>fourth mirror</strong>',
    onChange: function() {
        map.drawMapChanged();
    }
});
controllers.secondTetrahedron = gui.add({
    type: 'button',
    buttonText: 'tetrahedron',
    onChange: function() {
        controllers.d14.setValueOnly(2);
        controllers.d24.setValueOnly(3);
        controllers.d34.setValueOnly(3);
        map.drawMapChanged();
    }
});
controllers.secondOctahedron = controllers.secondTetrahedron.add({
    type: 'button',
    buttonText: 'octahedron',
    onChange: function() {
        controllers.d14.setValueOnly(2);
        controllers.d24.setValueOnly(3);
        controllers.d34.setValueOnly(4);
        map.drawMapChanged();
    }
});
controllers.secondIkosahedron = controllers.secondOctahedron.add({
    type: 'button',
    buttonText: 'ikosahedron',
    onChange: function() {
        controllers.d14.setValueOnly(2);
        controllers.d24.setValueOnly(3);
        controllers.d34.setValueOnly(5);
        map.drawMapChanged();
    }
});

controllers.d14 = gui.add(dihedralControl, {
    property: 'd14',
    labelText: 'order of 1-4'
});
controllers.d24 = controllers.d14.add(dihedralControl, {
    property: 'd24',
    labelText: '2-4'
});
controllers.d34 = controllers.d24.add(dihedralControl, {
    property: 'd34',
    labelText: '3-4'
});

// the fifth mirror
gui.add({
    type: 'boolean',
    params: geometry,
    property: 'useFifthMirror',
    labelText: '<strong>fifth mirror</strong>',
    onChange: function() {
        map.drawMapChanged();
    }
});
controllers.center = gui.add({
    type: 'button',
    buttonText: 'center',
    onChange: function() {
        controllers.d15.setValueOnly(2);
        controllers.d25.setValueOnly(2);
        controllers.d35.setValueOnly(2);
        map.drawMapChanged();
    }
});
controllers.touching = controllers.center.add({
    type: 'button',
    buttonText: 'touch fourth',
    onChange: function() {
        controllers.d45.setValueOnly(100);
        map.drawMapChanged();
    }
});

controllers.d15 = gui.add(dihedralControl, {
    property: 'd15',
    labelText: 'order of 1-5'
});
controllers.d25 = controllers.d15.add(dihedralControl, {
    property: 'd25',
    labelText: '2-5'
});
controllers.d35 = controllers.d25.add(dihedralControl, {
    property: 'd35',
    labelText: '3-5'
});
controllers.d45 = controllers.d35.add(dihedralControl, {
    property: 'd45',
    labelText: '4-5'
});

gui.addParagraph('<strong>display</strong>');

controllers.radius = gui.add({
    type: 'number',
    params: geometry,
    property: 'radius',
    min: 0,
    onChange: function() {
        map.drawMapChanged();
    }
});

controllers.radius.add({
    type:'boolean',
    params:geometry,
    property:'constantRadius',
    labelText:'constant',
        onChange: function() {
        map.drawMapChanged();
    }
})

controllers.alpha = gui.add({
    type: 'number',
    params: geometry,
    property: 'alpha',
    min: -180,
    max: 180,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllers.alpha.cyclic();

controllers.beta = controllers.alpha.add({
    type: 'number',
    params: geometry,
    property: 'beta',
    min: -180,
    max: 180,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllers.beta.cyclic();

controllers.gamma = controllers.beta.add({
    type: 'number',
    params: geometry,
    property: 'gamma',
    min: -180,
    max: 180,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllers.gamma.cyclic();


//the drawing routines (changing the map object)
//===========================================

/**
 * show structure of the map: color depending on the structure index
 * using the map.colorTable
 * @method map.drawStructure
 */
const colorBasic = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});
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
            const iterations=iterationsArray[index];
            if (iterations === 0) {
                pixelsArray[index] = colorBasic;
            }else if ((iterations & 1) === 0) {
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
    output.drawGrid();
};

/**
 * what to do when the map changes (parameters, canvas size too)
 * circles might change - we have to determine the regions
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    geometry.setup();
    map.make();     // uses map.mapping(point)
    map.drawImageChanged();
};




map.drawMapChanged();