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
    xScale,
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
    dihedral,
    powers,
    scale,
    inversion,
    insideOutside,
    mandelbrot,
    specialStar,
    rotation,
    normalViewEquator,
    normalViewPolar,
    inverseMercator,
    simpleRationalFamily,
    simplePolyFamily,
    circularScale,
    periodicXDrift,
    waves,
    brokenEvenWaves,
    brokenOddWaves,
    productWaves,
    triangles
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
    output.addCursorposition();
    output.setInitialCoordinates(0, 0, 100);
    output.createPixels();
    // her come the tools/modules
    //=======================================================

    base.maps.push(
        //   bulatovRing,
        //    powers,
        // mandelbrot,
        //  insideOutside,
        //  specialStar,
        //dihedral,
        // scale
        //  normalViewEquator,
        // rotation,
        //  spirals,
        // normalViewPolar,
        // rotation,
        //  xTranslation,
        // spirals,
        //   xDrift,
        //   simplePolyFamily,
        // simpleRationalFamily,
        //  periodicXDrift,
        //   bulatovRing,
        //  kaleidoscope,
        //   rosette,
        //   circularDrift,
        //  circularScale,

        // brokenEvenWaves,
        // brokenOddWaves,
        //productWaves
          waves
        // triangles
    );
    //====================================================


    base.maps.forEach(map => map.setup(gui));
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