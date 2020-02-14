/**
 * output elements, in particular a canvas
 * @object output
 */
import {
    guiUtils,
    saveAs
}
from "./modules.js";

export const output = {};

/**
 * an output canvas with controls in a gui
 * you can set its dimensions (it is square or rectangle)
 * it can resize automatically
 * you can download the image (custom name)
 * @object output.canvas
 */
output.canvas = false;


/**
 * set the x- and y-scrollbars of the container depending on the content
 * @method updateScrollbars
 */
function updateScrollbars() {
    output.canvasDiv.style.overflow = "hidden";
    // test if width overflows and we have to use overflowX="scroll"
    if (output.canvas.width > output.canvasDiv.clientWidth) {
        output.canvasDiv.style.overflowX = "scroll";
    }
    // test if height overflows and we have to use overflowY="scroll"
    if (output.canvas.height > output.canvasDiv.clientHeight) {
        output.canvasDiv.style.overflowY = "scroll";
        // now the width might overflow into the scroll bar. Thus test again
        // test if width overflows and we have to use overflowX="scroll"
        if (output.canvas.width > output.canvasDiv.clientWidth) {
            output.canvasDiv.style.overflowX = "scroll";
        }
    }
}


/**
 * create the output canvas if not already existing
 * with controls in a gui( which is at the left of the window) to set its dimensions
 * you can save the image with a custom name
 * the canvas is in a containing div that scrolls if the canvas becomes too large
 * the canvas can be rectangular or square
 * @method output.createCanvas
 * @param {ParamGui} gui - the gui that controls the canvas
 * @param {boolean} isRectangular - optional, default: true
 */
output.createCanvas = function(gui, isRectangular) {
    if (output.canvas) {
        console.log("*** output.createCanvas: canvas already exists");
        return;
    } else if (gui.autoPlace && (gui.design.horizontalPosition === "right") && (gui.design.horizontalShift === 0)) {
        // create the div that contains the canvas

        output.canvasDiv = document.createElement("div");
        guiUtils.style(output.canvasDiv)
            .position("absolute")
            .top("0px")
            .left("0px");

        output.canvasDiv.style.backgroundColor = "yellow";

        document.body.appendChild(output.canvasDiv);




        // resize the output div such that it fills the screen at the left of the gui
        // and resize the canvas


        const guiTotalWidth = gui.design.width + 2 * gui.design.borderWidth;
        const resize = function() {
            output.canvasDiv.style.height = document.documentElement.clientHeight + "px";
            output.canvasDiv.style.width = (document.documentElement.clientWidth - guiTotalWidth) + "px";
        };
        resize();
        window.addEventListener("resize", resize, false);
    } else {
        console.log("*** problem in ParamGui#createOutputDiv:");
        console.log("autoPlace " + gui.autoPlace);
        console.log("design.horizontalPosition " + gui.design.horizontalPosition);
        console.log("design.horizontalShift " + gui.design.horizontalShift);
    }

};
