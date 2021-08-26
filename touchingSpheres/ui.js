/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    basics
} from "./basics.js";

import {
    poincare
} from "./poincare.js";


// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres',
    closed: false,
    booleanButtonWidth: 40
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 2);
output.createPixels();
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();