/**
 * a canvas inside a div, fitting the leftover space of the guis
 * @namespace output
 */

import {
    guiUtils,
    ParamGui,
    saveAs
}
from "./modules.js";

export const output = {};


// doing both canvas and div together simplifies things

output.canvas = false;
// a method to redraw the canvas upon resize
output.redraw = function() {
    console.log("redraw canvas " + output.canvas.width + " " + output.canvas.Height);
};

// private parts
let outputDiv = false;
let params = {
    saveName: "image",
    autoResize: true
};