/* jshint esversion: 6 */

/**
 * a canvas inside a div, fitting the leftover space of the guis
 * @namespace output
 */

import {
    guiUtils,
    CoordinateTransform,
    MouseEvents,
    ParamGui
}
from "./modules.js";

export const output = {};

// doing both canvas and div together simplifies things

output.canvas = false;
output.canvasContext=false;   // 2d-context
output.canvasScale = 1; // scale to transform (square) canvas dimensions to (0...1)
output.div = false;
output.divHeight = 0;
output.divWidth = 0;

/**
 * updating the canvas scale
 * always use in the beginning of the draw method if using the canvas transform
 * makes that the transformed image does not change when the canvas size changes
 * a square canvas will have coordinates going from 0...1
 * @method output.updateCanvasScale
 */
output.updateCanvasScale = function() {
    output.canvasScale = 1 / Math.sqrt(output.canvas.width * output.canvas.height);
};

/**
* updating the canvas context transform
* always use at start of draw method if canvas context drawing is done
* calls updateCanvasScale as this is always required
* @method output.updateCanvasTransform
*/
output.updateCanvasTransform=function(){
    output.updateCanvasScale();
const coordinateTransform=output.coordinateTransform;
         const totalScale=1/(coordinateTransform.scale*output.canvasScale);
       output.canvasContext.setTransform(
        totalScale,
        0,
        0,
        totalScale,
        -totalScale*coordinateTransform.shiftX,
        -totalScale*coordinateTransform.shiftY
  )


};

/**
 * a method to (re)draw the canvas upon resize and so on
 * define your own method to get your image
 * call it after initialization of everything to get a first image
 * to avoid flickering use in the beginning output.draw = function(){};
 * @method output.draw
 */
output.draw = function() {
    const canvas = output.canvas;
    const context = output.canvas.getContext('2d');
    context.fillStyle = 'blue';
    context.fillRect(0, 0, output.canvas.width, output.canvas.height);
    context.fillStyle = 'white';
    context.font = Math.round(canvas.height / 20) + 'px FreeSans';
    context.fillText('Please define the output.draw() method!', canvas.width / 20, canvas.height / 2, canvas.width * 0.9);
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


// show that the window has been loaded
output.windowLoaded = false;

/**
 * resizing the output div, called by window.onResize upon window onload
 * @method resizeOutputDiv
 */
function resizeOutputDiv() {
    var leftOfSpace, widthOfSpace;
    output.windowLoaded = true;
    if (extendCanvasController.getValue()) {
        leftOfSpace = 0;
        widthOfSpace = window.innerWidth;
    } else {
        leftOfSpace = leftSpaceLimit();
        widthOfSpace = rightSpaceLimit() - leftOfSpace;
    }
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
// if autoresize is on:
// resizing after the output.div has been resized, knowing its new dimensions
// draws output if outoresize is on and size changes
// if autoscale is on: adjust size of canvas image, the canvas itself does not change, no redraw
// else adjust scroll  bars
function autoResize() {
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
}

/**
 * create a canvas in the output.div with controllers in a gui
 * makes its own gui folder as an option (initially closed)
 * you can set its width to height ratio to a fixed value in output.setCanvasWidthToHeight
 * @method output.createCanvas
 * @param {ParamGui} gui - the gui that controls the canvas
 * @param {string|Object} folderName - optional name or arguments/design object for folder, no folder if missing
 */
var widthController, heightController, sizeController;
var autoResizeController, autoScaleController, extendCanvasController;

output.createCanvas = function(gui, folderName) {
    if (output.canvas) {
        console.error("output.createCanvas: canvas exists already!");
        return;
    }
    output.canvas = document.createElement("canvas");
    output.canvasContext = output.canvas.getContext("2d");
    if (guiUtils.isDefined(folderName)) {
        gui = gui.addFolder(folderName);
    }

    // the save button and text field for changing the name
    const saveButton = gui.add({
        type: "button",
        buttonText: "save",
        minLabelWidth: 20,
        onClick: function() {
            output.saveCanvasAsFile(saveName.getValue(), saveType.getValue());
        }
    });
    const saveName = saveButton.add({
        type: "text",
        initialValue: "image",
        labelText: "as",
        textInputWidth: 150,
        minLabelWidth: 20
    });
    const saveType = saveButton.add({
        type: 'selection',
        options: ['png', 'jpg'],
        initialValue: 'png',
        labelText: '.',
        minLabelWidth: 5
    });

    widthController = gui.add({
        type: "number",
        max: 10000,
        step: 1,
        params: output.canvas,
        property: "width",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                heightController.setValueOnly(value / canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            autoResize();
            output.draw();
        }
    });
    widthController.hSpace(30);
    heightController = widthController.add({
        type: "number",
        max: 10000,
        step: 1,
        params: output.canvas,
        property: "height",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                widthController.setValueOnly(value * canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            autoResize();
            output.draw();
        }
    });

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

    // extending the canvas width
    extendCanvasController = gui.add({
        type: 'boolean',
        initialValue: false,
        labelText: 'extend canvas width',
        onChange: function() {
            resizeOutputDiv();
            autoResize();
        }
    }).addHelp('Extend the canvas width to window width. Maybe, nothing happens for fixed width to height ratio.');

    // extending the browser window to the entire screen
    gui.add({
        type: 'boolean',
        labelText: 'full screen window',
        initialValue: false,
        onChange: function(value) {
            if (value) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }).addHelp('Switches browser to full screen mode and back.');

    if (!output.div) {
        output.createDiv();
    }
    output.div.appendChild(output.canvas);
    autoResize();
    window.addEventListener("resize", autoResize, false);
};

/**
 * set the canvasWidthToHeight, does not yet resize the canvas
 * if value<0: no fixed ratio
 * if value>0...1: fixed ratio
 * CALL output.resize and draw later (particularly in initialization...)
 * @method output.setCanvasWidthToHeight
 * @param {float} ratio
 */
// this parameter will be set by the program, not the user
let canvasWidthToHeight = -1;

output.setCanvasWidthToHeight = function(ratio) {
    if (Math.abs(canvasWidthToHeight - ratio) > 0.0001) { // do this only if ratio changes, thus always 
        canvasWidthToHeight = ratio;
        if (ratio > 0.0001) {
            // need to change the canvas dimensions
            // if not autoresizing we do not need to set explicitely canvas dimensions 
            if (!autoResizeController.getValue()) {
                const width = Math.sqrt(widthController.getValue() * heightController.getValue() * canvasWidthToHeight);
                widthController.setValueOnly(width);
                heightController.setValueOnly(width / canvasWidthToHeight);
            }
            autoResize();
        }
    }
};

/**
 * set that the canvas dimensions are integer multiples of a basic step size
 * you need this for making images with rectangular tiles
 * the sides of the tiles should be integer numbers to get an image without artificial dark lines
 * @method output.setCanvasDimensions
 * @param {int} stepVertical
 * @param {int} stepHorizontal - optional, default is stepHorizontal
 */
output.setCanvasDimensionsStepsize = function(stepVertical, stepHorizontal = stepVertical) {
    const oldWidth = output.canvas.width;
    const oldHeight = output.canvas.height;
    widthController.setStep(stepVertical);
    heightController.setStep(stepHorizontal);
    if ((oldWidth !== output.canvas.width) || (oldHeight !== output.canvas.height)) {
        output.draw();
    }
    autoResize();
};

/**
 * create buttons that set the canvas width and height to special values
 * many buttons on one line
 * buttons are defined by an  object 
 * {label: string (optional), 
 *  width: number, 
 *  height: number (optional, default is width or width/canvasWidthToHeight ratio}
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
        controller.add(makeArgs(arguments[i]));
    }
};

/**
 * add a coordinate transform to the canvas
 * @method output.addCoordinateTransform
 * @param {ParamGui} gui - for the transform UI elements
 * @param {boolean} withRotation - optional, default is false
 */
output.addCoordinateTransform = function(gui, withRotation = false) {
    output.coordinateTransform = gui.addCoordinateTransform(withRotation);
    output.coordinateTransform.onChange = function() {
        output.draw(); // this calls always the latest version
    };
    output.canvas.style.cursor = "pointer";
    output.mouseEvents = new MouseEvents(output.canvas);
    const mouseEvents = output.mouseEvents;
    const coordinateTransform = output.coordinateTransform;

    // mouse events on the output canvas may do other things than aa coordinate transform
    // in case, set this to false
    output.leftMouseButtonPressed = true; // true if left mouse button pressed or none (false if other buttons pressed)

    // mouse wheel zooming
    output.zoomFactor = 1.04;

    // vectors for intermediate results
    const u = {
        x: 0,
        y: 0
    };
    const v = {
        x: 0,
        y: 0
    };
    // other actions (right mouse button pressed) 
    // than changing the transform/view (left mouse button pressed)
    output.mouseDownAction = function(mouseEvents) {}; // mouse down 
    output.mouseDragAction = function(mouseEvents) {}; // mouse drag (move with button pressed)
    output.mouseMoveAction = function(mouseEvents) {}; // mouse move (move with button released)
    output.mouseUpAction = function(mouseEvents) {}; // mouse up
    output.mouseOutAction = function(mouseEvents) {}; // mouse out (leave)
    output.mouseWheelAction = function(mouseEvents) {}; // mouse wheel or keyboard keys

    // change the transform or do something else
    mouseEvents.downAction = function() {
        output.leftMouseButtonPressed = (mouseEvents.button === 0);
        if (output.leftMouseButtonPressed) {
            // nothing to do
        } else {
            output.mouseDownAction(mouseEvents);
        }
    };
    mouseEvents.dragAction = function() {
        if (output.leftMouseButtonPressed) {
            console.log('mouse drag');
            v.x = output.canvasScale * mouseEvents.dx;
            v.y = output.canvasScale * mouseEvents.dy;
            coordinateTransform.rotateScale(v);
            coordinateTransform.shiftX -= v.x;
            coordinateTransform.shiftY -= v.y;
            coordinateTransform.updateUI();
            output.draw();
        } else {
            output.mouseDragAction(mouseEvents);
        }
    };
    mouseEvents.moveAction = function() {
        if (output.leftMouseButtonPressed) {
            // nothing to do
        } else {
            output.mouseMoveAction(mouseEvents);
        }
    };
    mouseEvents.upAction = function() {
        if (output.leftMouseButtonPressed) {
            // nothing to do
        } else {
            output.mouseUpAction(mouseEvents);
        }
        output.leftMouseButtonPressed = true; // mouse wheel continues to zoom
    };
    mouseEvents.outAction = function() {
        if (output.leftMouseButtonPressed) {
            // nothing to do
        } else {
            output.mouseOutAction(mouseEvents);
        }
        output.leftMouseButtonPressed = true; // mouse wheel continues to zoom
    };
    mouseEvents.wheelAction = function() {
        if (output.leftMouseButtonPressed) {
            const zoomFactor = (mouseEvents.wheelDelta > 0) ? output.zoomFactor : 1 / output.zoomFactor;
            console.log(zoomFactor);
            // the zoom center, prescaled
            u.x = output.canvasScale * mouseEvents.x;
            u.y = output.canvasScale * mouseEvents.y;
            v.x = output.canvasScale * mouseEvents.x;
            v.y = output.canvasScale * mouseEvents.y;
            coordinateTransform.rotateScale(u);
            console.log(mouseEvents.pressed)
            coordinateTransform.scale *= zoomFactor;
            coordinateTransform.updateScaleAngle();
            coordinateTransform.rotateScale(v);
            coordinateTransform.shiftX += u.x - v.x;
            coordinateTransform.shiftY += u.y - v.y;
            coordinateTransform.updateUI();
            output.draw();
        } else {
            output.mouseWheelAction(mouseEvents);
        }
    };
};

/**
 * do the transform for the output canvas: first rotate and scale, then shift
 * @method output#transform
 * @param {Object} v - with coordinates v.x and v.y
 */
output.transform = function(v) {
    v.x *= output.canvasScale;
    v.y *= output.canvasScale;
    const transform = output.coordinateTransform;
    let h = transform.cosAngleScale * v.x - transform.sinAngleScale * v.y + transform.shiftX;
    v.y = transform.sinAngleScale * v.x + transform.cosAngleScale * v.y + transform.shiftY;
    v.x = h;
};