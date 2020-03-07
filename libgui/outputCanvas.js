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

outputCanvas.canvas = false;
outputCanvas.saveName = "picture";
outputCanvas.autoResize = true;
// after a size change we have to draw the image again
outputCanvas.draw=function(){
	console.log("draw "+outputCanvas.canvas.width+" "+outputCanvas.canvas.height);
}

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
                onChange: function(){
                	outputCanvas.draw();
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