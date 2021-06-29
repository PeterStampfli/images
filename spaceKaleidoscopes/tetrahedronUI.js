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
} from "./tetrahedronGeometry.js";

export const controllers = {};


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

// for transparent basic tetrahedron
map.iterationsColorZero = 0;
// options of what to show
map.makeShowingGui(gui, {
    closed: false
});

map.surfaceWidthController = map.gui.add({
    type: 'number',
    params: geometry,
    property: 'surfaceWidth',
    min: 0,
    onChange: function() {
        map.drawImageChanged();
    }
});


// hide all image controllers
map.allImageControllersHide = function() {
    map.controlDiv.style.display = 'none';
    map.inputTransform.hide();
    map.imageController.hide();
    map.borderColorController.hide();
    map.lightController.hide();
    map.darkController.hide();
    map.thresholdController.hide();
    map.gammaController.hide();
    map.divergenceThresholdController.hide();
    map.divergenceSaturationController.hide();
    map.surfaceWidthController.hide();
};


map.makeRegionsGui(gui, {
    closed: false
});

map.addDrawIterations();
map.addDrawDivergence();
map.addDrawLimitset();
map.addDrawIterationZero();
map.whatToShowController.addOption('spheres surface', geometry.drawSpheresSurface);

//map.lightController.destroy();
map.linewidthController.destroy();
map.trajectoryOnOffController.destroy();
map.trajectoryColorController.destroy();
// add drag and drop for the input image
map.imageController.addDragAndDropWindow();
// link the output drawing routines to the map routines
map.setOutputDraw();


gui.add({
    type: 'number',
    params: geometry,
    property: 'nDihedral',
    min: 2,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
});

gui.add({
    type: 'boolean',
    params: geometry,
    property: 'mirror5',
    onChange: function() {
        map.drawMapChanged();
    }
});

gui.add({
    type: 'selection',
    params: geometry,
    property: 'view',
    options: ['normal', 'stereographic', 'xy-plane', 'zx-plane'],
    onChange: function() {
        map.drawMapChanged();
    }
});

const rController = gui.add({
    type: 'number',
    params: geometry,
    property: 'r',
    labelText: 'r',
    min: 0,
    onChange: function() {
        map.drawMapChanged();
    }
});
rController.add({
    type: 'button',
    buttonText: 'hyperbolic radius',
    onClick: function() {
        rController.setValue(geometry.rHyperbolic);
    }
});

gui.add({
    type: 'number',
    params: geometry,
    property: 'offset',
    onChange: function() {
        map.drawMapChanged();
    }
});

gui.add({
    type: 'boolean',
    params: geometry,
    property: 'flipZ',
    labelText: 'flip z',
    onChange: function() {
        map.drawMapChanged();
    }
});


const controllerAlpha = gui.add({
    type: 'number',
    params: geometry,
    property: 'alpha',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerAlpha.cyclic();

const controllerBeta = controllerAlpha.add({
    type: 'number',
    params: geometry,
    property: 'beta',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerBeta.cyclic();

const controllerGamma = controllerBeta.add({
    type: 'number',
    params: geometry,
    property: 'gamma',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerGamma.cyclic();
/**
 * what to do when the map changes (parameters, canvas size too)
 * circles might change - we have to determine the regions
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    geometry.setup();
    map.make(); // uses map.mapping(point)
    map.showRegionControls();
    map.drawImageChanged();
};

/**
 * what to do when only the image changes
 * @method map.drawImageChanged
 */
map.drawImageChanged = function() {
    map.makeStructureColors();
    map.draw(); // includes methods for drawing tiling or reflections
    output.drawGrid();
};



map.drawMapChanged();