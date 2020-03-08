/**
 * a canvas to go into the output div of ParamGui
 * @namespace outputCanvas
 */


import {
    guiUtils,
    ParamGui,
    saveAs
}
from "./modules.js";

export const outputCanvas = {};


// output elements
//  create a div container for output elements (canvas)
//==============================================================

/**
 * get the limit for free space at the left
 * taking into account all guis at the left side
 * @method ParamGui#leftSpaceLimit
 * @return number, for the left offset of a fitting container
 */
ParamGui.leftSpaceLimit = function() {
    let spaceLimit = 0;
    ParamGui.rootGuis.forEach(gui => {
        if (gui.design.horizontalPosition === "left") {
            spaceLimit = Math.max(gui.design.horizontalShift + gui.design.width + 2 * gui.design.borderWidth, spaceLimit);
        }
    });
    return spaceLimit;
};

/**
 * get the limit for free space at the right
 * taking into account all guis at the right hand side
 * @method ParamGui#rightSpaceLimit
 * @return number, the width of fitting container is difference between right and left limit
 */
ParamGui.rightSpaceLimit = function() {
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
};

ParamGui.outputDiv = false;
// dimension of the div for (re)sizing the content
ParamGui.outputDivHeight = 200;
ParamGui.outputDivWidth = 300;

/**
 * resizing the content of the output div
 * does nothing here, overwrite depending on content
 * output div will have its final dimension when calling this
 * so you can use its clientWidth/Height
 * @method ParamGui.resizeOutputContent
 */
ParamGui.resizeOutputContent = function() {};

/**
 * resizing the output div and setting its scrolling
 * sets width and height of the output div
 * calls resize function for contents
 * determines size of content
 * then activates scroll bars
 * @method ParamGui.resizeOutputDiv
 */
ParamGui.resizeOutputDiv = function() {
    const leftOfSpace = ParamGui.leftSpaceLimit();
    const widthOfSpace = ParamGui.rightSpaceLimit() - leftOfSpace;
    ParamGui.outputDiv.style.left = leftOfSpace + "px";
    // resize content: set up final dimensions of the div
    // you can use them to resize content
    // overflow hidden makes that scroll bars do not reduce client width or height
    ParamGui.outputDivWidth = widthOfSpace;
    ParamGui.outputDivHeight = window.innerHeight;
    // now resize content
    ParamGui.resizeOutputContent();
    // get size of contents
    // no height and width given => shrink wrap
    ParamGui.outputDiv.style.height = "";
    ParamGui.outputDiv.style.width = "";
    ParamGui.outputDiv.style.overflow = "hidden";
    // now we can get size of content with clientWidth/Height
    const widthOfContent = ParamGui.outputDiv.clientWidth;
    const heightOfContent = ParamGui.outputDiv.clientHeight;
    // again set final dimensions
    ParamGui.outputDiv.style.width = ParamGui.outputDivWidth + "px";
    ParamGui.outputDiv.style.height = ParamGui.outputDivHeight + "px";
    // see if content is too wide and horizontal scroll bars are required
    if (widthOfContent > ParamGui.outputDiv.clientWidth) {
        ParamGui.outputDiv.style.overflowX = "scroll";
    }
    // see if content is too high (including a possible scroll bar)
    if (heightOfContent > ParamGui.outputDiv.clientHeight) {
        ParamGui.outputDiv.style.overflowY = "scroll";
        // the clientwidth has been reduced, and we may need a herizontal scroll bar now
        if (widthOfContent > ParamGui.outputDiv.clientWidth) {
            ParamGui.outputDiv.style.overflowX = "scroll";
        }
    }
};

/**
 * create an output div fitting the guis
 * it will be in ParamGui.outputDiv
 * it will fit between the guis at the left and those at the right
 * you can have more than one canvas in the output div ...
 * @method ParamGui.createOutputDiv
 * @return the output div
 */
ParamGui.createOutputDiv = function() {
    if (ParamGui.outputDiv) {
        console.error("ParamGui.outputDiv exists already!");
    } else {
        ParamGui.outputDiv = document.createElement("div");
        ParamGui.outputDiv.style.position = "absolute";
        ParamGui.outputDiv.style.top = "0px";
        ParamGui.resizeOutputDiv();
        document.body.appendChild(ParamGui.outputDiv);
        window.addEventListener("resize", ParamGui.resizeOutputDiv, false);
    }
    return ParamGui.outputDiv;
};

outputCanvas.canvas = false;
outputCanvas.saveName = "picture";
outputCanvas.autoResize = true;
// after a size change we have to draw the image again
outputCanvas.draw = function() {
    console.log("draw " + outputCanvas.canvas.width + " " + outputCanvas.canvas.height);
};

/**
 * a canvas in the ParamGui.outputDiv with controllers in a gui
 * maybe wrap its controls in a folder
 * you can set its dimensions (it is square or rectangle)
 * it can resize automatically
 * you can download the image (custom name)
 * @constructor ParamCanvas
 * @param {ParamGui} gui - the gui that controls the canvas
 * @param {html div element} container - where the canvas lives
 * @param {boolean} isRectangular - optional, default: true
 * @param {boolean} canAutoResize - does it resize with the container, optional, default: true
 */
outputCanvas.init = function(gui, isRectangular = true, canAutoResize = true) {
    if (outputCanvas.canvas) {
        console.error("outputCanvas.init: canvas exists already!");
    } else {
        ParamGui.createOutputDiv();
        ParamGui.outputDiv.style.backgroundColor = "blue";
        outputCanvas.canvas = document.createElement("canvas");
        outputCanvas.canvas.style.backgroundColor = "red";
        ParamGui.outputDiv.appendChild(outputCanvas.canvas);
        // the save button and text field for changing the name
        const saveButton = gui.add({
                type: "button",
                buttonText: "save",
                onClick: function() {
                    // for some crazy reason, this clears the console
                    outputCanvas.canvas.toBlob(function(blob) {
                        saveAs(blob, outputCanvas.saveName + '.png');
                    }, 'image/png');
                }
            })
            .setMinLabelWidth(0);
        const saveNameInput = saveButton.add({
                type: "text",
                params: outputCanvas,
                property: "saveName",
                labelText: "as"
            })
            .setMinLabelWidth(20);
        // dimensions
        var widthController, heightController, sizeController;

        if (isRectangular) {
            widthController = gui.add({
                type: "number",
                min: 100,
                max: 10000,
                params: outputCanvas.canvas,
                property: "width",
                onChange: function() {
                    outputCanvas.draw();
                }
            });
            heightController = gui.add({
                type: "number",
                min: 100,
                max: 10000,
                params: outputCanvas.canvas,
                property: "height",
                onChange: outputCanvas.draw
            });

        } else {

        }



        if (canAutoResize) { // resizing later
            gui.add({
                type: "boolean",
                params: outputCanvas,
                property: "autoResize",
                labelText: "resize automatically",
                onChange: function() {}
            });
            ParamGui.resizeOutputContent = function() {
                if (outputCanvas.autoResize) {
                    console.log("resize");
                    if (isRectangular) {

                    } else {

                    }
                }

            };
            ParamGui.resizeOutputContent();
        }
    }
};
