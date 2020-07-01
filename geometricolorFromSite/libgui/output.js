/* jshint esversion: 6 */

/**
 * a canvas inside a div, fitting the leftover space of the guis
 * @namespace output
 */

import {
    guiUtils,
    CoordinateTransform,
    MouseEvents,
    keyboard,
    ParamGui
}
from "./modules.js";

export const output = {};

// doing both canvas and div together simplifies things

output.canvas = false;
output.canvasContext = false; // 2d-context
output.div = false;
output.divHeight = 0;
output.divWidth = 0;

/**
 * draw the output image when the canvas changes (size or transform)
 * define your own method to get your image
 * call it after initialization of everything to get a first image
 * @method output.drawCanvasChange
 */
output.drawCanvasChanged = function() {
    console.error('Please define method output.drawCanvasChanged!');
    console.log('You can hide this message by using before calling output.createCanvas():');
    console.log('output.drawCanvasChanged=function(){};');
};

/**
 * draw output image when grid parameters change
 * kaleidoscopes: the map remains the same, do same as when image changes
 * @method output.drawGridChanged()
 */
output.drawGridChanged = function() {
    console.error('Please define method output.drawGridChanged!');
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
 * resizing the output div, called by window.onResize upon window onload
 * @method resizeOutputDiv
 */
function resizeOutputDiv() {
    var leftOfSpace, widthOfSpace;
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
// else adjust scroll bars
// redraw if canvas dimensions changed since last call
// (re)draw at first call
let oldWidth = 0;
let oldHeight = 0;

function autoResizeDraw() {
    if (autoResizeController.getValue()) {
        // autoresize: fit canvas into the output.div. thus no scroll bars
        output.canvas.style.width = '';
        output.canvas.style.height = '';
        output.div.style.overflow = "hidden";
        var newWidth, newHeight;
        if (canvasWidthToHeight > 0.0001) {
            if (output.divWidth / output.divHeight > canvasWidthToHeight) {
                // elongated div: its height determines canvas dimensions
                newWidth = Math.floor(output.divHeight * canvasWidthToHeight);
                newHeight = output.divHeight;
            } else {
                // narrow div: its width determines canvas dimensions
                newWidth = output.divWidth;
                newHeight = Math.floor(output.divWidth / canvasWidthToHeight);
            }
        } else {
            newWidth = output.divWidth;
            newHeight = output.divHeight;
        }
        // only if the true canvas dimensions change then we need to redraw
        // controllers directly change canvas dimensions
        if (oldWidth !== newWidth) {
            widthController.setValueOnly(newWidth);
        }
        if (oldHeight !== newHeight) {
            heightController.setValueOnly(newHeight);
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
    // draw if dimensions changed
    if ((oldWidth !== output.canvas.width) || (oldHeight !== output.canvas.height)) {
        oldWidth = output.canvas.width;
        oldHeight = output.canvas.height;
        // if there is a transform we have to update ...
        if (guiUtils.isDefined(output.coordinateTransform)) {
            // prescaling: makes that for square canvas x- and y-axis range from 0 to 1
            output.coordinateTransform.setPrescale(1 / Math.sqrt(output.canvas.width * output.canvas.height));
            output.coordinateTransform.updateTransform();
        }
        output.drawCanvasChanged();
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
            autoResizeDraw();
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
            autoResizeDraw();
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
            autoResizeDraw();
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
            autoResizeDraw();
        }
    }).addHelp('Scales the image of the canvas to fit the available space.');

    // extending the canvas width
    extendCanvasController = gui.add({
        type: 'boolean',
        initialValue: false,
        labelText: 'extend canvas width',
        onChange: function() {
            resizeOutputDiv();
            autoResizeDraw();
        }
    }).addHelp('Extend the canvas width to window width. Maybe, nothing happens for fixed width to height ratio.');

    // extending the browser window to the entire screen
    // the output div andd canvas resize because of the window.onresize event
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
    autoResizeDraw();
    window.addEventListener("resize", autoResizeDraw, false);
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

output.setCanvasWidthToHeight = function(ratio = 1) {
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
            autoResizeDraw();
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
    widthController.setStep(stepVertical); // might resize output.canvas.width
    heightController.setStep(stepHorizontal);
    autoResizeDraw();
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
            autoResizeDraw();
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
 * add mouse events to change the visible part (-> changes transform)
 * ctrl-key allows for other actions, Shift key changes wheel action to rotation
 * @method output.addCoordinateTransform
 * @param {ParamGui} gui - for the transform UI elements
 * @param {boolean} withRotation - optional, default is false
 */
output.addCoordinateTransform = function(gui, withRotation = false) {
    output.withRotation = withRotation;
    output.coordinateTransform = gui.addCoordinateTransform(output.canvas, withRotation);
    const coordinateTransform = output.coordinateTransform;
    coordinateTransform.setPrescale(1 / Math.sqrt(output.canvas.width * output.canvas.height));
    coordinateTransform.updateTransform();
    let helpText = 'The values of "translateX" and "Y" are the coordinates of the upper left image corner.';
    helpText += '<br>The value of "scale" is the mean range of the image along the coordinate x- and y-axis.';
    helpText += '<br>Drag the mouse on the image to move it. Change the scale with the mouse wheel.';
    coordinateTransform.addHelp(helpText);
    output.coordinateTransform.onChange = function() {
        output.drawCanvasChanged(); // this calls always the latest version
    };
    output.canvas.style.cursor = "pointer";
    output.mouseEvents = new MouseEvents(output.canvas);
    const mouseEvents = output.mouseEvents;
    // mouse wheel zooming factor
    output.zoomFactor = 1.04;
    // and rotating, angle step, in degrees
    output.angleStep = 1;
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
        if (keyboard.ctrlPressed) {
            output.mouseDownAction(mouseEvents);
        }
    };
    mouseEvents.dragAction = function() {
        if (keyboard.ctrlPressed) {
            output.mouseDragAction(mouseEvents);
        } else {
            v.x = mouseEvents.dx;
            v.y = mouseEvents.dy;
            coordinateTransform.rotateScale(v);
            coordinateTransform.shiftX -= v.x;
            coordinateTransform.shiftY -= v.y;
            coordinateTransform.updateUI();
            coordinateTransform.updateTransform();
            output.drawCanvasChanged();
        }
    };
    mouseEvents.moveAction = function() {
        if (keyboard.ctrlPressed) {
            output.mouseMoveAction(mouseEvents);
        }
    };
    mouseEvents.upAction = function() {
        if (keyboard.ctrlPressed) {
            output.mouseUpAction(mouseEvents);
        }
    };
    mouseEvents.outAction = function() {
        if (keyboard.ctrlPressed) {
            output.mouseOutAction(mouseEvents);
        }
    };
    mouseEvents.wheelAction = function() {
        if (keyboard.ctrlPressed) {
            output.mouseWheelAction(mouseEvents);
        } else {
            // the zoom center, prescaled
            u.x = mouseEvents.x;
            u.y = mouseEvents.y;
            v.x = u.x;
            v.y = u.y;
            coordinateTransform.rotateScale(u);
            if (keyboard.shiftPressed && output.withRotation) {
                const step = (mouseEvents.wheelDelta > 0) ? output.angleStep : -output.angleStep;
                coordinateTransform.angle += step;
            } else {
                const zoomFactor = (mouseEvents.wheelDelta > 0) ? output.zoomFactor : 1 / output.zoomFactor;
                coordinateTransform.scale *= zoomFactor;
            }
            coordinateTransform.updateTransform();
            coordinateTransform.rotateScale(v);
            coordinateTransform.shiftX += u.x - v.x;
            coordinateTransform.shiftY += u.y - v.y;
            coordinateTransform.updateUI();
            coordinateTransform.updateTransform();
            output.drawCanvasChanged();
        }
    };
};

/**
 * change initial coordinate axis ranges:
 * define coordinate values (centerX, centerY) at center of image
 * define range for square canvas, mean value for rectangular canvas
 * @method output.setInitialCoordinates
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} range
 */
output.setInitialCoordinates = function(centerX, centerY, range) {
    const coordinateTransform = output.coordinateTransform;
    const canvasScale = 1 / Math.sqrt(output.canvas.width * output.canvas.height);
    const shiftX = centerX - 0.5 * output.canvas.width * canvasScale * range;
    const shiftY = centerY - 0.5 * output.canvas.height * canvasScale * range;
    coordinateTransform.setValues(shiftX, shiftY, range, 0);
    coordinateTransform.setResetValues();
};

/**
 * set the line width in pixels, independent of scale
 * compensate for the scaling of the inverse transform: multiply with scale of forward transform
 * @method output.setLineWidth
 * @param{number} width
 */
output.setLineWidth = function(width) {
    output.canvasContext.lineWidth = width * output.coordinateTransform.totalScale;
};

/**
 * add a grid to the canvas
 * @method output.addGrid
 * @param {ParamGui} gui
 */
const grid = {};
grid.on = true;
grid.interval = 1;
grid.color = '#000000';
grid.axisWidth = 6;
grid.lineWidth = 3;

output.addGrid = function(gui) {
    const onOffController = gui.add({
        type: 'boolean',
        params: grid,
        property: 'on',
        labelText: '',
        onChange: function() {
            output.drawGridChanged();
        }
    });
    const intervalController = onOffController.add({
        type: 'number',
        params: grid,
        property: 'interval',
        step: 0.1,
        min: 0.1,
        onChange: function() {
            output.drawGridChanged();
        }
    });
    const colorController = gui.add({
        type: 'color',
        params: grid,
        property: 'color',
        onChange: function() {
            output.drawGridChanged();
        }
    });
};

/**
 * draw the grid, no rotation
 * @method output.drawGrid
 */
output.drawGrid = function() {
    if (grid.on) {
        const canvasContext = output.canvasContext;
        canvasContext.strokeStyle = grid.color;
        // canvas limits to coordinate space limits, from transformation of corners
        const v = {};
        v.x = 0;
        v.y = 0;
        output.coordinateTransform.transform(v);
        const xMin = v.x;
        const yMin = v.y;
        v.x = output.canvas.width;
        v.y = output.canvas.height;
        output.coordinateTransform.transform(v);
        const xMax = v.x;
        const yMax = v.y;
        // axis
        output.setLineWidth(grid.axisWidth);
        canvasContext.beginPath();
        canvasContext.moveTo(xMin, 0);
        canvasContext.lineTo(xMax, 0);
        canvasContext.moveTo(0, yMin);
        canvasContext.lineTo(0, yMax);
        canvasContext.stroke();
        //grid lines
        output.setLineWidth(grid.lineWidth);
        const iMax = Math.floor(xMax / grid.interval);
        for (let i = Math.floor(xMin / grid.interval + 1); i <= iMax; i++) {
            canvasContext.beginPath();
            canvasContext.moveTo(i * grid.interval, yMin);
            canvasContext.lineTo(i * grid.interval, yMax);
            canvasContext.stroke();
        }
        const jMax = Math.floor(yMax / grid.interval);
        for (let j = Math.floor(yMin / grid.interval + 1); j <= jMax; j++) {
            canvasContext.beginPath();
            canvasContext.moveTo(xMin, j * grid.interval);
            canvasContext.lineTo(xMax, j * grid.interval);
            canvasContext.stroke();
        }
    }
};

/**
 * clear the canvas with TRANSPARENT BLACK (for line drawings ...)
 * preserves the current transform
 * @method output.clearCanvas
 */
output.clearCanvas = function() {
    const transform = output.canvasContext.getTransform();
    output.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    output.canvasContext.clearRect(0, 0, output.canvas.width, output.canvas.height);
    output.canvasContext.setTransform(transform);
};

/**
 * fill the canvas with some color (for line drawings ...)
 * preserves the current transform, changes fill style
 * @method output.fillCanvas
 * @param {String} color - hex color string
 */
output.fillCanvas = function(color) {
    const transform = output.canvasContext.getTransform();
    output.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    output.canvasContext.fillStyle=color;
    output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);
    output.canvasContext.setTransform(transform);
};