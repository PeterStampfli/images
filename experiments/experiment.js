/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    julia,
    map,
    xTranslation,
    yTranslation,
    circularDrift,
    xDrift,
    kaleidoscope,
    rosette,
    cartioid,
    bulatov,
    bulatovRing,
    square,
    generalBulatov,
    cayley,
    spirals,
    flipXY,
    polygon,
    dihedral
} from "./modules.js";

export const base = {};
base.maps = [];

function setup() {
    base.maps.length = 0;
    // base gui
    const gui = new ParamGui({
        name: 'experimental',
        closed: false
    });
    base.gui = gui;

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 2);
    output.createPixels();
    // her come the tools/modules
    //=======================================================
    //  cartioid.setup();
    //  square.setup();
    //  bulatov.setup();
    //bulatovRing.setup();
    //  generalBulatov.setup();
    //   xTranslation.setup();
    //   yTranslation.setup();
    //   kaleidoscope.setup();
    //   rosette.setup();
    //  circularDrift.setup();
    //  xDrift.setup();

    base.maps.push(
        polygon,
        kaleidoscope,
        rosette);
    //====================================================


    base.maps.forEach(map => map.setup());
    map.setupDrawing(gui);

    // changing the grid
    // image pixels do not change, put on canvas, draw grid&points
    output.drawGridChanged = function() {
        julia.drawNoChange();
    };

    // moving/zooming canvas
    output.drawCanvasChanged = julia.drawNewStructure;
}

// structure does not change
// (input) image may change (other quality, input image)
julia.drawNewImage = function() {
    map.draw();
    output.drawGrid();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    map.init();
    for (let i = 0; i < base.maps.length; i++) {
        base.maps[i].map();
    }
    map.addDriftMap();
    map.draw();
    output.drawGrid();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    map.draw();
    output.drawGrid();
};

setup();
julia.drawNewStructure();