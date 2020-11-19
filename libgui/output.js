/* jshint esversion: 6 */

/**
 * a canvas inside a div, fitting the leftover space of the guis
 * @namespace output
 */

import {
    guiUtils,
    CoordinateTransform,
    Pixels,
    MouseEvents,
    ParamGui,
    BooleanButton
}
from "./modules.js";

export const output = {};

// a div for output
output.div = false;
output.divHeight = 0;
output.divWidth = 0;
// the canvas in the output div
output.canvas = false;
output.canvasContext = false; // 2d-context
output.pixels = false;

// zoom animation
output.animationRunning = false;
output.animationRecording = false;
output.animationZoomFactor = 1.01;
output.animationStep = 0;
output.animationNSteps = 100;
output.animationFps = 10;
output.animationScale = 1;
output.animationStartScale = 1;
output.animationEndScale = 10;
output.frameNumberDigits = 5;

// vectors for intermediate results
const u = {
    x: 0,
    y: 0
};
const v = {
    x: 0,
    y: 0
};

/**
 * call this when drawing starts
 * @method output.startDrawing
 */
output.startDrawing = function() {
    output.isDrawing = true;
};

/**
 * draw the output image when the canvas changes (size or transform)
 * define your own method to get your image
 * call it after initialization of everything to get a first image
 * @method output.drawCanvasChange
 */
output.drawCanvasChanged = function() {
    console.error('Please define method output.drawCanvasChanged!');
};

/**
 * draw output image when grid parameters change
 * kaleidoscopes: the map remains the same, pixels remain the same
 * output.drawGridChanged=function(){
 *   output.pixels.show();
 *   output.drawGrid();
 * };
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
        console.error("output div exists already!");
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
 * @param {string} filename - without extension
 * @param {string} type - default'png', else use 'jpg' or 'png'
 * @param {function} callback - optional
 */
output.saveCanvasAsFile = function(filename, type = 'png', callback = function() {}) {
    if (output.canvas) {
        guiUtils.saveCanvasAsFile(output.canvas, filename, type, callback);
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
// initially do not draw
output.isDrawing = false;

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
        if ((oldWidth !== newWidth) || (oldHeight !== newHeight)) {
            output.canvasWidthController.setValueOnly(newWidth);
            output.canvasHeightController.setValueOnly(newHeight);
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
        // if there is a transform we have to update ...
        if (guiUtils.isDefined(output.coordinateTransform)) {

            // prescaling: makes that for square canvas x- and y-axis range from 0 to 1
            // change prescale to show about the same image part
            // make center of canvas fixed
            const coordinateTransform = output.coordinateTransform;
            // get current center
            u.x = oldWidth / 2;
            u.y = oldHeight / 2;
            coordinateTransform.transform(u);
            coordinateTransform.setPrescale(1 / Math.sqrt(output.canvas.width * output.canvas.height));
            coordinateTransform.updateTransform();
            // get new center
            v.x = output.canvas.width / 2;
            v.y = output.canvas.height / 2;
            coordinateTransform.transform(v);
            // correction
            coordinateTransform.shiftX += u.x - v.x;
            coordinateTransform.shiftY += u.y - v.y;
            coordinateTransform.updateTransform();
            coordinateTransform.updateUI();
        }
        oldWidth = output.canvas.width;
        oldHeight = output.canvas.height;
        if (output.isDrawing) {
            output.drawCanvasChanged();
        }
    }
}

/**
 * create a canvas in the output.div with controllers in a gui
 * makes its own gui folder (initially closed)
 * you can set the canvas width to height ratio to a fixed value in output.setCanvasWidthToHeight
 * @method output.createCanvas
 * @param {ParamGui} gui
 */
var autoResizeController, autoScaleController, extendCanvasController;

output.createCanvas = function(gui) {
    if (output.canvas) {
        console.error("output.createCanvas: canvas exists already!");
        return;
    }
    output.canvas = document.createElement("canvas");
    output.canvasBackgroundColor = '#000099';
    output.canvas.style.backgroundColor = output.canvasBackgroundColor;
    output.canvasContext = output.canvas.getContext("2d");
    gui = gui.addFolder('output image');
    output.canvasGui = gui;

    // the save button and text field for changing the name
    output.saveButton = gui.add({
        type: "button",
        buttonText: "save",
        minLabelWidth: 20,
        onClick: function() {
            output.saveCanvasAsFile(output.saveName.getValue(), output.saveType.getValue());
        }
    });
    output.saveName = output.saveButton.add({
        type: "text",
        initialValue: "image",
        labelText: "as",
        textInputWidth: 150,
        minLabelWidth: 20
    });
    output.saveType = output.saveButton.add({
        type: 'selection',
        options: ['png', 'jpg'],
        initialValue: 'png',
        labelText: '.',
        minLabelWidth: 5
    }).addHelp('You can save the image as a *.png or *.jpg file to your download folder. Transparent parts become opaque black for *.jpg files. Give it a better file name than "image".');

    output.canvasWidthController = gui.add({
        type: "number",
        max: 10000,
        step: 1,
        params: output.canvas,
        property: "width",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                output.canvasHeightController.setValueOnly(value / canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            autoResizeDraw();
        }
    });
    output.canvasWidthController.hSpace(30);
    output.canvasHeightController = output.canvasWidthController.add({
        type: "number",
        max: 10000,
        step: 1,
        params: output.canvas,
        property: "height",
        onChange: function(value) {
            // called only if value changes, thus draw() always
            if (canvasWidthToHeight > 0.0001) {
                output.canvasWidthController.setValueOnly(value * canvasWidthToHeight);
            }
            autoResizeController.setValueOnly(false);
            autoResizeDraw();
        }
    }).addHelp('You can set image sizes in pixels. Values up to 10000 are possible.');

    BooleanButton.greenRedBackground();
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
    });
    autoResizeController.addHelp("Sets the canvas dimensions to fit the available space.");

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
    }).addHelp('Switches full screen mode on and off.');
    // note that changing the background color has no effect on *.jpg images
    // and all alpha=0 pixels become opaque black in *.jpg output
    output.canvasBackgroundColorController = gui.add({
        type: 'color',
        params: output,
        property: 'canvasBackgroundColor',
        labelText: 'background',
        onChange: function() {
            output.canvas.style.backgroundColor = output.canvasBackgroundColor;
        }
    }).addHelp('Choose a convenient background color for transparent image parts. Note: They will always be opaque black in saved *.jpg files.');
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
 * CALL output.resizeCanvasDraw later
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
                const width = Math.sqrt(output.canvasWidthController.getValue() * output.canvasHeightController.getValue() * canvasWidthToHeight);
                output.canvasWidthController.setValueOnly(width);
                output.canvasHeightController.setValueOnly(width / canvasWidthToHeight);
            }
        }
        autoResizeDraw();
    }
};

/**
 * set canvas dimensions
 * disactivate the autoresizing
 * @method output.setCanvasDimensions
 * @param {integer} width
 * @param {integer} height - optional, default width
 */
output.setCanvasDimensions = function(width, height = width) {
    autoResizeController.setValueOnly(false);
    autoResizeController.setActive(false);
    output.canvasWidthController.setValueOnly(width);
    output.canvasHeightController.setValueOnly(height);
    autoResizeDraw();
};

/**
 * draw and enable drawing at resizing
 * call when drawing has been defined
 * @method output.resizeCanvasDraw
 */
output.firstDrawing = function() {
    output.isDrawing = true;
    output.drawCanvasChanged();
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
    output.canvasWidthController.setStep(stepVertical); // might resize output.canvas.width
    output.canvasHeightController.setStep(stepHorizontal);
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
            output.canvasWidthController.setValueOnly(buttonDefinition.width);
            if (canvasWidthToHeight > 0.0001) {
                output.canvasHeightController.setValueOnly(buttonDefinition.width / canvasWidthToHeight);
            } else {
                output.canvasHeightController.setValueOnly(guiUtils.check(buttonDefinition.height, buttonDefinition.width));
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
 * change cursor, depending on ctrl-key
 * @method output.addCoordinateTransform
 * @param {boolean} withRotation - optional, default is false
 */
output.addCoordinateTransform = function(withRotation = false) {
    output.withRotation = withRotation;
    const gui = output.canvasGui.addFolder('coordinate transform');
    output.coordinateTransformGui = gui;
    output.coordinateTransform = gui.addCoordinateTransform(output.canvas, withRotation);
    const coordinateTransform = output.coordinateTransform;
    coordinateTransform.setPrescale(1 / Math.sqrt(output.canvas.width * output.canvas.height));
    coordinateTransform.updateTransform();
    coordinateTransform.addHelp('The values of "translateX" and "Y" are the coordinates of the upper left image corner. The value of "scale" is the mean range of the image along the coordinate x- and y-axis. Drag the mouse on the image to move it. Change the scale with the mouse wheel. Use the reset button to come back to the original settings.');
    output.coordinateTransform.onChange = function() {
        output.drawCanvasChanged(); // this calls always the latest version
    };
    output.canvas.style.cursor = "pointer";
    output.mouseEvents = new MouseEvents(output.canvas);
    const mouseEvents = output.mouseEvents;

    // make that changing the scale does not change center
    // running animation
    coordinateTransform.scaleController.callback = function() {
        const minimumFrameTime = 1000 / output.animationFps - 1000 / 60; // always defined, even without animation
        const startOfFrame = Date.now();
        const canvas = output.canvas;
        // get current center
        u.x = canvas.width / 2;
        u.y = canvas.height / 2;
        coordinateTransform.transform(u);
        coordinateTransform.updateTransform();
        // get new center
        v.x = canvas.width / 2;
        v.y = canvas.height / 2;
        coordinateTransform.transform(v);
        coordinateTransform.shiftX += u.x - v.x;
        coordinateTransform.shiftY += u.y - v.y;
        coordinateTransform.updateUI();
        coordinateTransform.updateTransform();
        coordinateTransform.onChange(); // if not reprogrammed: calls output.drawCanvasChanged
        // now the image has been drawn
        // advance scale and step number, frame numbers begin at 1
        output.animationScale *= output.animationZoomFactor;
        output.animationStep += 1;
        output.animationStepMessage.innerText = 'steps done: ' + output.animationStep;
        if (output.animationRunning) {
            // see if end reached, then stop
            if (animationFinished()) {
                output.animationRunningButton.setButtonText('run');
                output.animationRunning = false;
            }
            if (output.animationRecording) {
                // 'download' canvas image and do next step, if animation running
                const name = output.saveName.getValue() + makeFrameNumber();
                const type = output.saveType.getValue();
                guiUtils.saveCanvasAsFile(output.canvas, name, type,
                    function() {
                        if (output.animationRunning) {
                            const timeUsed = Date.now() - startOfFrame;
                            // prepare next frame
                            setTimeout(function() {
                                requestAnimationFrame(function() {
                                    output.coordinateTransform.scaleController.setValue(output.animationScale);
                                });
                            }, minimumFrameTime - timeUsed);
                        }
                    });
            } else {
                // do next step if animation running
                const timeUsed = Date.now() - startOfFrame;
                if (output.animationRunning) {
                    // prepare next frame
                    setTimeout(function() {
                        requestAnimationFrame(function() {
                            output.coordinateTransform.scaleController.setValue(output.animationScale);
                        });
                    }, minimumFrameTime - timeUsed);
                }
            }
        }
    };

    // switching with ctrl key from coordinate transformation to other actions
    // modifying things with shift key
    // things can become confusing if ctrl&mousebutton pressed, ctrl released, mouse moves and image gets dragged
    // thus ctrl key up or down event sets mouse pressed to false
    // selected elements should stay selected even if ctrl-key goes up
    // if ctrl key goes down, select elements

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Control') {
            output.canvas.style.cursor = "default";
            mouseEvents.setPressedFalse();
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.ctrlKeyDownAction(transformedEvent);
        } else if (event.key === 'Shift') {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.shiftKeyDownAction(transformedEvent);
        }
    }, false);

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Control') {
            output.canvas.style.cursor = "pointer";
            mouseEvents.setPressedFalse();
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.ctrlKeyUpAction(transformedEvent);
        } else if (event.key === 'Shift') {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.shiftKeyUpAction(transformedEvent);
        }
    }, false);

    // other mouse actions (ctrl-key pressed) than changing the transform/view
    output.mouseCtrlInAction = function(event) {}; // mouse in (enter)
    output.mouseCtrlMoveAction = function(event) {}; // mouse move (move with button released)
    output.mouseCtrlDownAction = function(event) {}; // mouse down 
    output.mouseCtrlDragAction = function(event) {}; // mouse drag (move with button pressed)
    output.mouseCtrlUpAction = function(event) {}; // mouse up
    output.mouseCtrlOutAction = function(event) {}; // mouse out (leave)
    output.mouseCtrlWheelAction = function(event) {}; // mouse wheel or keyboard keys
    // actions upon ctrl key down/up
    output.ctrlKeyUpAction = function(event) {};
    output.ctrlKeyDownAction = function(event) {};
    // actions upon shift key down/up
    output.shiftKeyUpAction = function(event) {};
    output.shiftKeyDownAction = function(event) {};

    // change the transform or do something else

    const transformedEvent = {};

    mouseEvents.inAction = function() {
        if (mouseEvents.ctrlPressed) {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.mouseCtrlInAction(transformedEvent);
        }
    };
    mouseEvents.moveAction = function() {
        makeTransformedMouseEvent(transformedEvent, mouseEvents);
        output.setCursorposition(transformedEvent);
        if (mouseEvents.ctrlPressed) {
            output.mouseCtrlMoveAction(transformedEvent);
        }
    };
    mouseEvents.downAction = function() {
        if (mouseEvents.ctrlPressed) {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.mouseCtrlDownAction(transformedEvent);
        } else {
            output.canvas.style.cursor = "grabbing";
        }
    };
    mouseEvents.dragAction = function() {
        makeTransformedMouseEvent(transformedEvent, mouseEvents);
        output.setCursorposition(transformedEvent);
        if (mouseEvents.ctrlPressed) {
            output.mouseCtrlDragAction(transformedEvent);
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
    mouseEvents.upAction = function() {
        if (mouseEvents.ctrlPressed) {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.mouseCtrlUpAction(transformedEvent);
        } else {
            output.canvas.style.cursor = "pointer";
        }
    };
    mouseEvents.outAction = function() {
        if (mouseEvents.ctrlPressed) {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.mouseCtrlOutAction(transformedEvent);
        }
    };
    mouseEvents.wheelAction = function() {
        if (mouseEvents.ctrlPressed) {
            makeTransformedMouseEvent(transformedEvent, mouseEvents);
            output.mouseCtrlWheelAction(transformedEvent);
        } else {
            // the zoom center, prescaled
            u.x = mouseEvents.x;
            u.y = mouseEvents.y;
            v.x = u.x;
            v.y = u.y;
            coordinateTransform.rotateScale(u);
            if (mouseEvents.shiftPressed && output.withRotation) {
                const step = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.angleStep : -CoordinateTransform.angleStep;
                coordinateTransform.angle += step;
            } else {
                const zoomFactor = (mouseEvents.wheelDelta > 0) ? CoordinateTransform.zoomFactor : 1 / CoordinateTransform.zoomFactor;
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

// condition that animation is finished: scale out of interval
function animationFinished() {
    let finished = (output.animationScale < Math.min(output.animationStartScale, output.animationEndScale) - 0.00001);
    finished = finished || (output.animationScale > Math.max(output.animationStartScale, output.animationEndScale) + 0.00001);
    return finished;
}

// make frame number with fixed number of digits
function makeFrameNumber() {
    let result = output.animationStep.toString(10);
    while (result.length < output.frameNumberDigits) {
        result = '0' + result;
    }
    return result;
}

/**
 * add a zoom animation
 * @method output.addZoomAnimation
 */
output.addZoomAnimation = function() {
    const gui = output.canvasGui.addFolder('zoom animation');
    // set animation to start
    output.animationResetButton = gui.add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            output.animationRunningButton.setButtonText('run');
            output.animationRunning = false;
            output.animationRecordingButton.setValue(false);
            output.animationScale = output.animationStartScale;
            output.coordinateTransform.scaleController.setValue(output.animationScale);
            output.animationStep = 0;
            output.animationScale = output.animationStartScale;
            output.animationStepMessage.innerText = 'steps done: ' + 0;
        }
    });
    // run animation: initialize params
    output.animationRunningButton = output.animationResetButton.add({
        type: 'button',
        buttonText: 'run',
        onClick: function() {
            if (output.animationRunning) {
                // animation is running, thus stop it
                // now pressing button again would start it
                output.animationRunningButton.setButtonText('run');
                output.animationRunning = false;
            } else {
                // animation not running, start it
                // pressing button again would now stop it
                output.animationRunningButton.setButtonText('stop');
                output.animationRunning = true;
                if (animationFinished()) {
                    output.animationStep = 0;
                    output.animationScale = output.animationStartScale;
                }
                // update zoom factor
                output.animationZoomFactor = Math.exp(Math.log(output.animationEndScale / output.animationStartScale) / (output.animationNSteps - 1));
                output.coordinateTransform.scaleController.setValue(output.animationScale);
            }
        }
    });
    BooleanButton.greenRedBackground();
    output.animationRecordingButton = gui.add({
        type: 'boolean',
        labelText: 'recording',
        params: output,
        property: 'animationRecording'
    });
    output.animationStartScaleController = gui.add({
        type: 'number',
        params: output,
        property: 'animationStartScale',
        labelText: 'scale at start'
    });
    output.animationStartScaleController.add({
        type: 'button',
        buttonText: 'current value',
        onClick: function() {
            output.animationStartScaleController.setValueOnly(output.coordinateTransform.scaleController.getValue());
        }
    });
    output.animationEndScaleController = gui.add({
        type: 'number',
        params: output,
        property: 'animationEndScale',
        labelText: 'scale at end'
    });
    output.animationEndScaleController.add({
        type: 'button',
        buttonText: 'current value',
        onClick: function() {
            output.animationEndScaleController.setValueOnly(output.coordinateTransform.scaleController.getValue());
        }
    });
    output.animationNStepsController = gui.add({
        type: 'number',
        params: output,
        property: 'animationNSteps',
        labelText: 'total steps',
        min: 1,
        step: 1
    });
    output.animationFpsController = output.animationNStepsController.add({
        type: 'number',
        params: output,
        property: 'animationFps',
        labelText: 'fps',
        min: 1
    });
    output.animationStepMessage = gui.addParagraph('steps done: ' + 0);
};

/**
 * add a message paragraph for the cursor position
 * @method output.addCursorposition
 * @param {ParamGui} gui - for the UI elements
 */
output.addCursorposition = function(gui) {
    output.cursorMessage = output.coordinateTransformGui.addParagraph('cursor position');
    if (guiUtils.isObject(output.coordinateTransform)) {

    } else {
        console.error('output.addCursorposition: There is no coordinate transform!');
    }
};

/**
 * set the cursor position message
 * @method output.setCursorposition
 * @param {object} position - with x- and y- fields
 */
output.setCursorposition = function(position) {
    if (guiUtils.isObject(output.cursorMessage)) {
        output.cursorMessage.innerHTML = 'cursor position is &ensp; x = ' + position.x.toPrecision(3) + ', y = ' + position.y.toPrecision(3);
    }
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
 * make a transfomed mouse event object with
 * position data transformed to calculation coordinates
 * @method makeTransformedMouseEvent
 * @param {object} transformedEvent
 * @param {object} mouseEvent
 */
const dPosition = {};

function makeTransformedMouseEvent(transformedEvent, mouseEvents) {
    // copy data that does not change
    transformedEvent.button = mouseEvents.button;
    transformedEvent.wheelDelta = mouseEvents.wheelDelta;
    transformedEvent.shiftPressed = mouseEvents.shiftPressed;
    transformedEvent.ctrlPressed = mouseEvents.ctrlPressed;
    // transform position with shift, rotate and scale
    transformedEvent.x = mouseEvents.x;
    transformedEvent.y = mouseEvents.y;
    output.coordinateTransform.transform(transformedEvent);
    // transform change in position (rotate and shift only)
    dPosition.x = mouseEvents.dx;
    dPosition.y = mouseEvents.dy;
    output.coordinateTransform.rotateScale(dPosition);
    transformedEvent.dx = dPosition.x;
    transformedEvent.dy = dPosition.y;
}

/**
 * create pixels object for canvas, call after creating the canvas
 * show with: output.pixels.show();
 * @method output.createPixels
 */
output.createPixels = function() {
    if (output.pixels) {
        console.error("output.createPixels: pixels exists already!");
        return;
    }
    output.pixels = new Pixels(output.canvas);
};

/**
 * set the line width in pixels, independent of scale
 * COMPENSATE for the scaling of the inverse transform: multiply with scale of forward transform
 * @method output.setLineWidth
 * @param{number} width
 */
output.setLineWidth = function(width) {
    output.canvasContext.lineWidth = width * output.coordinateTransform.totalScale;
};

/**
 * add a grid to the canvas
 * @method output.addGrid
 */
const grid = {};
output.grid = grid;
grid.on = false;
grid.interval = 1;
grid.color = '#000000';
grid.lineWidth = 1;

output.addGrid = function() {
    const gui = output.canvasGui.addFolder('grid');
    BooleanButton.greenRedBackground();
    const onOffController = gui.add({
        type: 'boolean',
        params: grid,
        property: 'on',
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
    }).addHelp('Draws a grid. The two coordinate axis appear as thicker lines.');
    const colorController = gui.add({
        type: 'color',
        params: grid,
        property: 'color',
        labelText: 'color',
        onChange: function() {
            output.drawGridChanged();
        }
    });
    const lineWidthControllerController = gui.add({
        type: 'number',
        params: grid,
        min: 0,
        property: 'lineWidth',
        labelText: 'linewidth',
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
        output.setLineWidth(3 * grid.lineWidth);
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
 * fill the canvas with some color (for line drawings ...)
 * preserves the current transform, changes fill style
 * @method output.fillCanvas
 * @param {String} color - hex color string
 */
output.fillCanvas = function(color) {
    const transform = output.canvasContext.getTransform();
    output.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    output.canvasContext.fillStyle = color;
    output.canvasContext.clearRect(0, 0, output.canvas.width, output.canvas.height);
    if (color !== '#00000000') {
        output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);
    }
    output.canvasContext.setTransform(transform);
};

/**
 * clear the canvas with TRANSPARENT BLACK (for line drawings ...)
 * preserves the current transform
 * @method output.clearCanvas
 */
output.clearCanvas = function() {
    output.fillCanvas('#00000000');
};