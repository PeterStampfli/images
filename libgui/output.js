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
    canvasAutoResize: true
};


/**
 * get the limit for free space at the left
 * taking into account all guis at the left side
 * @method leftSpaceLimit
 * @return number, for the left offset of a fitting container
 */
function leftSpaceLimit() {
    let spaceLimit = 0;
    ParamGui.rootGuis.forEach(gui => {
        if (gui.design.horizontalPosition === "left") {
            spaceLimit = Math.max(gui.design.horizontalShift + gui.design.width + 2 * gui.design.borderWidth, spaceLimit);
        }
    });
    return spaceLimit;
}

/**
 * get the limit for free space at the right
 * taking into account all guis at the right hand side
 * @method rightSpaceLimit
 * @return number, the width of fitting container is difference between right and left limit
 */
function rightSpaceLimit() {
    let space = 0;
    ParamGui.rootGuis.forEach(gui => {
        if (gui.design.horizontalPosition === "right") {
            space = Math.max(gui.design.horizontalShift + gui.design.width + 2 * gui.design.borderWidth, space);
        }
    });
    // with window.innerWidth we do not get some ghosts of scroll bars
    // document.documentElement.clientWidth upon reducing screen height gives a smaller width because of spurious vertical scroll bar
    const spaceLimit = window.innerWidth - space;
    return spaceLimit;
}

/*
 * resize the canvas and the div:
 * the div has absolute position, top at top of screen, left at left space limit
 * the canvas has default position in the div in the upper left corner
 * the width of the div fills the space between left- and right space limit
 * the height is the full window height
 * if canvasAutoResize: no scroll bars
 *      for rectangular size: width and height are same as div
 *      for square size: width and height are minimum dimensions of div
 *      if canvas dimensions change then redraw
 * if not canvasAutoResize: canvas dimensions are fixed
 *      avoid scroll bar hysteresis: switch off scroll bars
 *      if div too narrow: horizontal scroll bar
 *      if div too high: vertical scroll bar
 *      check again if horizontal scroll bar needed
 * NOTE: changing the canvas size sets canvasAutoResize to false, requires redraw and checking of scroll bars
 */


/**
 * set the x- and y-scrollbars of the container div depending on the dimensions of the canvas
 * we need to do this upon resizing the div, or changing the canvas dimensions
 * @method updateScrollbars
 */
function updateScrollbars() {
    outputDiv.style.overflow = "hidden";
    // test if width overflows and we have to use overflowX="scroll"
    if (output.canvas.width > outputDiv.clientWidth) {
        outputDiv.style.overflowX = "scroll";
    }
    // test if height overflows and we have to use overflowY="scroll"
    if (output.canvas.height > outputDiv.clientHeight) {
        outputDiv.style.overflowY = "scroll";
        // now the width might overflow into the scroll bar. Thus test again
        // test if width overflows and we have to use overflowX="scroll"
        if (output.canvas.width > outputDiv.clientWidth) {
            outputDiv.style.overflowX = "scroll";
        }
    }
}

/**
 * create a canvas in the outputDiv with controllers in a gui
 * maybe wrap its controlters in a folder
 * you can set if it is a sqaure or flexible rectangle
 * @method output.init
 * @param {ParamGui} gui - the gui that controls the canvas
 * @param {boolean} isRectangular - optional, default: true
 */