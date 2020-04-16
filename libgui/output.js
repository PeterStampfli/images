/* jshint esversion: 6 */

/**
 * a canvas inside a div, fitting the leftover space of the guis
 * @namespace output
 */

import {
    guiUtils,
    ParamGui
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


// show that the window has been loaded
output.windowLoaded = false;

/**
 * resizing the output div, called by window.onResize upon window onload
 * @method resizeOutputDiv
 */
function resizeOutputDiv() {
    output.windowLoaded = true;
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
 * a function that saves the canvas to file, suitable for animations
 * @method output.saveCanvasAsFile
 * @param{string} filename - without extension
 * @param{string} type - default'png', else use 'jpg' or 'png'
 */
output.saveCanvasAsFile = function(filename, type = 'png') {
    if (output.canvas) {
        guiUtils.saveCanvasAsFile(output.canvas, filename, type);
    } else {
        console.error("output.saveCanvasAsFile: there is no canvas!");
    }
};

/**
 * create a canvas in the output.div with controllers in a gui (folder)
 * you can set its width to height ratio to a fixed value in output.setCanvasWidthToHeight
 * @method output.createCanvas
 * @param {ParamGui} gui - the gui that controls the canvas
 */
var autoResize;
var widthController, heightController, sizeController, autoResizeController, autoScaleController;

output.createCanvas = function(gui) {
    if (output.canvas) {
        console.error("output.createCanvas: canvas exists already!");
        return;
    }
    if (!output.div) {
        output.createDiv();
    }
    gui.updateDesign({
        textInputWidth: 150
    });
    output.canvas = document.createElement("canvas");
    output.div.appendChild(output.canvas);
    // the save button and text field for changing the name
    const saveButton = gui.add({
            type: "button",
            buttonText: "save",
            onClick: function() {
                output.saveCanvasAsFile(saveName.getValue(), saveType.getValue());
            }
        })
        .setMinLabelWidth(0);
    const saveName = saveButton.add({
            type: "text",
            initialValue: "image",
            labelText: "as"
        })
        .setMinLabelWidth(20);
    const saveType = saveButton.add({
        type: 'selection',
        options: ['png', 'jpg'],
        initialValue: 'png',
        labelText: '.'
    }).setMinLabelWidth(5);

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
            output.draw();
            autoResize();
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
            output.draw();
            autoResize();
        }
    });

    // resizing after the output.div has been resized, knowing its new dimensions
    autoResize = function() {
        const oldWidth = widthController.getValue();
        const oldHeight = heightController.getValue();
        if (autoResizeController.getValue()) {
            output.canvas.style.width = '';
            output.canvas.style.height = '';
            // autoresize: fit canvas into the output.div. thus no scroll bars
            output.div.style.overflow = "hidden";
            var newWidth, newHeight;
            if (canvasWidthToHeight > 0.0001) {
                if (output.divWidth / output.divHeight > canvasWidthToHeight) {
                    // very elongated div: its height determines canvas dimensions
                    newWidth = Math.round(output.divHeight * canvasWidthToHeight);
                    newHeight = output.divHeight;
                } else {
                    newWidth = output.divWidth;
                    newHeight = Math.round(output.divWidth / canvasWidthToHeight);
                }
            } else {
                newWidth = output.divWidth;
                newHeight = output.divHeight;
            }
            if ((oldWidth !== newWidth) || (oldHeight !== newHeight)) {
                // only if the true canvas dimensions change then we need to redraw
                widthController.setValueOnly(newWidth);
                heightController.setValueOnly(newHeight);
                output.draw();
            }
        } else if (autoScaleController.getValue()) {
            var scale;
            if (output.canvas.width / output.canvas.height > output.divWidth / output.divHeight) {
                // the canvas is very wide, its width determines the scale
                scale = output.divWidth / output.canvas.width;
            } else {
                scale = output.divHeight / output.canvas.height;
            }
            output.canvas.style.width = scale * output.canvas.width + 'px';
            output.canvas.style.height = scale * output.canvas.height + 'px';
            // autoresize: fit canvas 'image' into the output.div. thus no scroll bars
            output.div.style.overflow = "hidden";
        } else {
            output.canvas.style.width = '';
            output.canvas.style.height = '';
            // not autoresizing/autoscaling the canvas: its size does not change, 
            // but scroll bars may change, no draw()
            output.div.style.overflow = "hidden";
            // test if width overflows and we have to use overflowX="scroll"
            if (output.canvas.offsetWidth > output.divWidth) {
                output.div.style.overflowX = "scroll";
            }
            // test if height overflows and we have to use overflowY="scroll"
            if (output.canvas.offsetHeight > output.divHeight) {
                output.div.style.overflowY = "scroll";
                // now the width might overflow into the scroll bar. Thus test again
                // test if width overflows and we have to use overflowX="scroll"
                if (output.canvas.offsetWidth > output.divWidth) {
                    output.div.style.overflowX = "scroll";
                }
            }
        }
    };

    autoResizeController = gui.add({
        type: "boolean",
        labelText: "auto resize canvas",
        initialValue: true,
        onChange: function(on) {
            if (on) {
                autoScaleController.setValueOnly(false);
            }
            autoResize();
        }
    }).addHelp("Sets the canvas dimensions to fit the available space.");

    autoScaleController = gui.add({
        type: "boolean",
        labelText: "auto scale canvas image",
        initialValue: false,
        onChange: function(on) {
            if (on) {
                autoResizeController.setValueOnly(false);
            }
            autoResize();
        }
    }).addHelp('Scales the image of the canvas to fit the available space.');

    autoResize();
    window.addEventListener("resize", autoResize, false);
};

/**
* autoresizing the canvas, required after changing the width to size ratio
* @method output.resizeCanvas
*/
output.resizeCanvas=function(){
    autoResize();
};

/**
 * set the canvasWidthToHeight
 * if value<0: no fixed ratio
 * if value>0...1: fixed ratio
 * needs to update canvas dimensions
 * CALL autoresize and draw later (particularly in initialization...)
 * @method output.setCanvasWidthToHeight
 * @param {float} ratio
 */
// this parameter will be set by the program, not the user
let canvasWidthToHeight = -1;

output.setCanvasWidthToHeight = function(ratio) {
    if (Math.abs(canvasWidthToHeight - ratio) > 0.0001) { // do this only if ratio changes, thus always 
        canvasWidthToHeight = ratio;
        // if autoresizing we do not need to set canvas dimensions 
        //because autoResize does this automatically (better names ?)
        if (!autoResizeController.getValue()&&(ratio>0.0001)) {
            const width = Math.sqrt(widthController.getValue() * heightController.getValue() * canvasWidthToHeight);
            widthController.setValueOnly(width);
            heightController.setValueOnly(width / canvasWidthToHeight);
        }
    }
};

/**
 * create buttons that set the canvas width and height to special values
 * many buttons on one line
 * buttons are defined by an  object 
 * {label: string (optional), 
 *  width: number, 
 *  height: number (optional for fixed widthToHeight ratio)}
 * @method output.makeCanvasSizeButtons
 * @param {ParamGui} gui - where the buttons go to
 * @param {...object} buttonDefinition - repeated for several on a line
 */

function makeArgs(buttonDefinition) {
    const result = {
        type: 'button'
    };
    if (guiUtils.isNumber(buttonDefinition.width)) {
        if (guiUtils.isString(buttonDefinition.label)) {
            result.buttonText = buttonDefinition.label;
        } else if (guiUtils.isNumber(buttonDefinition.height)) {
            result.buttonText = buttonDefinition.width + " x " + buttonDefinition.height;
        } else {
            result.buttonText = 'width: ' + buttonDefinition.width;
        }
        result.onClick = function() {
            autoResizeController.setValueOnly(false);
            widthController.setValueOnly(buttonDefinition.width);
            if (canvasWidthToHeight > 0.0001) {
                heightController.setValueOnly(buttonDefinition.width / canvasWidthToHeight);
            } else {
                heightController.setValueOnly(guiUtils.check(buttonDefinition.height, buttonDefinition.width));
            }
            output.draw();
            autoResize();
        };
    } else {
        result.buttonText = buttonDefinition.label;
        result.labelText = 'undefined width';
        console.error('makeCanvasSizeButtons - undefined width in buttonDefinition, which is');
        console.log(buttonDefinition);
        console.log('should be an object with fields: label (string, optional), width (number) and height (number, optional)');
    }
    return result;
}

output.makeCanvasSizeButtons = function(gui, buttonDefinition) {
    // make first button from object, that presumably exists
    const controller = gui.add(makeArgs(buttonDefinition));
    // make more buttons, arguments[2] ...
    for (var i = 2; i < arguments.length; i++) {
        controller.add(makeArgs(arguments[i])).setMinLabelWidth(0);
    }
};