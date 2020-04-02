/* jshint esversion: 6 */

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

// a method to (re)draw the canvas upon resize
// call it after initialization to get a first image
output.draw = function() {};

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
 *=============================================================
 * resizing the div because of window resize: resize canvas
 * if canvasAutoResize: no scroll bars
 *      if canvasWidthToHeight<0: width and height are dimensions of div
 *      if canvasWidthToHeight>0: 
 *          if div.style.width/div.style.height>canvasWidthToHeight: fit  height=div.style.height
 *                (the div is "wider" than the canvas)
 *          if div.style.width/div.style.height<canvasWidthToHeight: fit  width=div.style.width
 *      if canvas dimensions change then redraw
 * if not canvasAutoResize: canvas dimensions are fixed
 *      avoid scroll bar hysteresis: switch off scroll bars
 *      if div too narrow: horizontal scroll bar
 *      if div too high: vertical scroll bar
 *      check again if horizontal scroll bar needed
 * changing width or height:
 *      if canvasWidthToHeight>0: change other dimension too
 * changing the canvasWidthToHeight:
 *       if canvasAutoResize: 
 *            same as for resizing the window/div
 *       if not canvasAutoResize:
 *           resize with same surface, new width=sqrt(oldWidth*oldHeight*canvasWidthToHeight)
 *               (newHeight=width/canvasWidthToHeight)S
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
        document.body.appendChild(output.div);
        resizeOutputDiv();
        window.addEventListener("resize", resizeOutputDiv, false);
    }
};

/**
 * create a canvas in the output.div with controllers in a gui (folder)
 * you can set its width to height ratio to a fixed value in an extra method
 * @method output.createCanvas
 * @param {ParamGui} gui - the gui that controls the canvas
 */
var autoResize;
var widthController, heightController, sizeController, autoResizeController;

output.createCanvas = function(gui) {
    if (output.canvas) {
        console.error("output.createCanvas: canvas exists already!");
        return;
    }
    if (!output.div) {
        output.createDiv();
    }
    output.canvas = document.createElement("canvas");
    output.div.appendChild(output.canvas);
    // the save button and text field for changing the name
    const saveButton = gui.add({
            type: "button",
            buttonText: "save",
            onClick: function() {
                // for some crazy reason, this clears the console
                output.canvas.toBlob(function(blob) {
                    saveAs(blob, params.saveName + '.png');
                }, 'image/png');
            }
        })
        .setMinLabelWidth(0);
    const saveNameInput = saveButton.add({
            type: "text",
            params: params,
            property: "saveName",
            labelText: "as"
        })
        .setMinLabelWidth(20);

    // actual dimensions are not important here:
    // we only build the controllers
    // dimensions will be resized later

    widthController = gui.add({
        type: "number",
        min: 100,
        max: 10000,
        params: output.canvas,
        property: "width",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                heightController.setValueOnly(value / canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            updateScrollbars();
            output.draw();
        }
    });
    widthController.hSpace(30);
    heightController = widthController.add({
        type: "number",
        min: 100,
        max: 10000,
        params: output.canvas,
        property: "height",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                widthController.setValueOnly(value * canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            updateScrollbars();
            output.draw();
        }
    });

    // resizing after the output.div has been resized, knowing its new dimensions
    autoResize = function() {
        if (params.canvasAutoResize) {
            // autoresize: fit canvas into the output.div
            // thus no scroll bars
             output.div.style.overflow = "hidden";
           const oldWidth = widthController.getValue();
            const oldHeight = heightController.getValue();
            let newWidth = output.divWidth;
            let newHeight = output.divHeight;
            if (canvasWidthToHeight > 0.0001) {
                if (output.divWidth / output.divHeight > canvasWidthToHeight) {
                    // very elongated div: its height determines canvas dimensions
                    newWidth = Math.round(output.divHeight * canvasWidthToHeight);
                } else {
                    newHeight = Math.round(output.divWidth / canvasWidthToHeight);
                }
            }
            if ((oldWidth !== newWidth) || (oldHeight !== newHeight)) {
                widthController.setValueOnly(newWidth);
                heightController.setValueOnly(newHeight);
                output.draw();
            }
        } else {
            // not autoresizing the canvas: its size does not change, but scroll bars may change, no draw()
            updateScrollbars();
        }
    };

    autoResizeController = gui.add({
        type: "boolean",
        labelText: "auto resize",
        params: params,
        property: "canvasAutoResize",
        onChange: autoResize
    });
    autoResize();
    window.addEventListener("resize", autoResize, false);
};

/**
 * set the canvasWidthToHeight
 * if value<0: no fixed ratio
 * if value>0...1: fixed ratio
 * needs to update canvas dimensions
 * @method output.setCanvasWidthToHeight
 * @param {float} ratio
 */
// this parameter will be set by the program, not the user
let canvasWidthToHeight = -1;

output.setCanvasWidthToHeight = function(ratio) {
    if (Math.abs(canvasWidthToHeight - ratio) > 0.0001) { // do this only if ratio changes, thus always draw()
        canvasWidthToHeight = ratio;
        if (params.canvasAutoResize) {
            autoResize();
        } else {
            const width = Math.sqrt(widthController.getValue() * heightController.getValue() * canvasWidthToHeight);
            widthController.setValueOnly(width);
            heightController.setValueOnly(width / canvasWidthToHeight);
            output.draw();
            updateScrollbars();
        }
    }
};