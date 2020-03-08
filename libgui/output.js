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
output.div = false;
output.divHeight = 0;
output.divWidth = 0;

// a method to redraw the canvas upon resize
output.redraw = function() {
    console.log("redraw canvas " + output.canvas.width + " " + output.canvas.Height);
};

// extra canvas parameters
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
    output.div.style.overflow = "hidden";
    // test if width overflows and we have to use overflowX="scroll"
    if (output.canvas.width > output.div.clientWidth) {
        output.div.style.overflowX = "scroll";
    }
    // test if height overflows and we have to use overflowY="scroll"
    if (output.canvas.height > output.div.clientHeight) {
        output.div.style.overflowY = "scroll";
        // now the width might overflow into the scroll bar. Thus test again
        // test if width overflows and we have to use overflowX="scroll"
        if (output.canvas.width > output.div.clientWidth) {
            output.div.style.overflowX = "scroll";
        }
    }
}


/**
 * resizing the output div
 * @method resizeOutputDiv
 */
function resizeOutputDiv() {
    const leftOfSpace = leftSpaceLimit();
    const widthOfSpace = rightSpaceLimit() - leftOfSpace;
    output.div.style.left = leftOfSpace + "px";
    // resize content: set up final dimensions of the div
    // you can use them to resize content
    output.divWidth = widthOfSpace;
    output.divHeight = window.innerHeight;
    output.div.style.width = output.divWidth + "px";
    output.div.style.height = output.divHeight + "px";
}

/**
 * create an output div fitting the guis
 * it will fit between the guis at the left and those at the right
 * @method output.createDiv
 */
output.createDiv = function() {
    if (output.div) {
        console.error("div exists already!");
    } else {
        output.div = document.createElement("div");
        output.div.style.position = "absolute";
        output.div.style.top = "0px";
        resizeOutputDiv();
        document.body.appendChild(output.div);
        window.addEventListener("resize", resizeOutputDiv, false);
    }
};

/**
 * create a canvas in the output.div with controllers in a gui
 * maybe wrap its controlters in a folder
 * you can set if it is a sqaure or flexible rectangle
 * @method output.init
 * @param {ParamGui} gui - the gui that controls the canvas
 * @param {boolean} isRectangular - optional, default: true
 */
