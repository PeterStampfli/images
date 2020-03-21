/* jshint esversion: 6 */
/*
 * module for showing the state of the cells, general interface
 *==============================================================
 *
 * object with methods:
 *
 * init(gui, canvas)
 * initialization
 * gui is a ParamGui-folder for the ui of the module
 * canvas is a canvas object
 *
 * showUI()
 * shows the ui of the module
 *
 * hideUI()
 * hides the ui of the module (when using another module)
 *
 * input(cells)
 * reads an array of cells
 *
 * redraw()
 * update display (resized canvas, changed display method)
 *
 * setNumberOfStates(n)
 * changes number of states per cell, reset image
 */

import {
    ParamGui,
    guiUtils
}
from "../libgui/modules.js";

export const lifeShowSquareRGB = {};

// private variables used in methods

var gui, canvas, canvasContext;
var red, green, blue;
var uiController;
var nStates = 0;
var imageSize = 0;

/**
 *
 * @method lifeShowSquareRGB.init
 * @param {ParamGui} theGui - a paramGui folder
 * @param {Canvas} theCanvas - for showing the automaton
 */
lifeShowSquareRGB.init = function(theGui, theCanvas) {
    gui = theGui;
    canvas = theCanvas;
    canvasContext = canvas.getContext("2d");
    red = [];
    green = [];
    blue = [];
    // set up the gui
    const choices = {
        'greyBlockPixels': greyBlock,
        'greyLinearInterpolation': greyLinear,
        'greyCubicInterpolation': greyCubic,
        'colorBlockPixels': colorBlock,
        'colorLinearInterpolation': colorLinear,
        'colorCubicInterpolation': colorCubic
    };
    uiController = gui.add({
        type: 'selection',
        options: choices,
        params: lifeShowSquareRGB,
        property: 'draw',
        labelText: 'display',
        onChange: function() {
            lifeShowSquareRGB.draw();
        }
    });
};

/**
 * hide the ui for choosing the display method
 * @method lifeShowSquareRGB.hideUI
 */
lifeShowSquareRGB.hideUI = function() {
    uiController.hide();
};

/**
 * show the ui for choosing the display method
 * @method lifeShowSquareRGB.showUI
 */
lifeShowSquareRGB.showUI = function() {
    uiController.show();
};

/**
 * set the number of states per cell (minimum is 2)
 * clears the images (assuming that the number changes)
 * @method lifeShowSquareRGB.setNumberOfStates
 * @param {int} n
 */
lifeShowSquareRGB.setNumberOfStates = function(n) {
    nStates = Math.max(2, n);
    clearImage();
};

/**
 * (re)draws the image after changing the canvas size or display method
 * @method lifeShowSquareRGB.draw
 */
lifeShowSquareRGB.draw = greyBlock;

/**
 * read data of a (new) generation of the world as an array
 * the array has a border of cells around it, it is square
 * if its length is s*s, then the image data has a side length of s-2
 * if the size changes, then we have to reset the image data (red, green, blue)
 * @method lifeShowSquareRGB.inputGeneration
 * @param {array} worldData
 */
lifeShowSquareRGB.inputGeneration = function(worldData) {
    var worldIndex, imageIndex;
    const worldSize = Math.round(Math.sqrt(worldData.length));
    // if size changes we update the image size and data arrays
    if (worldSize !== imageSize + 2) {
        imageSize = worldSize - 2;
        red.length = imageSize*imageSize;
        green.length = imageSize*imageSize;
        blue.length = imageSize*imageSize;
        clearImage();
    }
    // generations go from green to red to blue: exchange data arrays
    const lastGeneration = blue;
    blue = red;
    red = green;
    green = lastGeneration;
    // image of input generation
    // going through all cells that belong to the image, omit border cells
    const factor = 255.9 / (nStates - 1);
    imageIndex = -1;
    for (var j = 1; j <= imageSize; j++) {
        worldIndex = j * worldSize;
        for (var i = 1; i <= imageSize; i++) {
            worldIndex += 1;
            imageIndex += 1;
            green[imageIndex] = Math.max(0,Math.min(255, Math.floor(factor * worldData[worldIndex])));
        }
    }
    lifeShowSquareRGB.draw();
};

// fill the image data arrays with zeros
function clearImage() {
    red.fill(0);
    green.fill(0);
    blue.fill(0);
}

// the drawing routines

function greyBlock() {
    console.log('drawing grey blocks');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height); 
    const pixelSize = Math.floor(canvasSize / imageSize);
    var i, j;
    let y = 0;
    let index = 0;
    for (j = 0; j < imageSize; j++) {
        let x = 0;
        for (i = 0; i < imageSize; i++) {
        	// grey level as hex string with two digits
        	// note that '#aaa' is equivalent to '#aaaaaa' and not '#0a0a0a'
        	let grey=green[index].toString(16);
        	if (grey.length<2){
        		grey='0'+grey;
        	}
            canvasContext.fillStyle = '#'+grey+grey+grey;
            canvasContext.fillRect(x, y, pixelSize, pixelSize);
            x += pixelSize;
            index += 1;
        }
        y += pixelSize;
    }
}

function colorBlock() {
    console.log('drawing color blocks');
       const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height); 
    const pixelSize = Math.floor(canvasSize / imageSize);
    var i, j;
    let y = 0;
    let index = 0;
    for (j = 0; j < imageSize; j++) {
        let x = 0;
        for (i = 0; i < imageSize; i++) {
        	// grey level as hex string with two digits
        	// note that '#aaa' is equivalent to '#aaaaaa' and not '#0a0a0a'
        	let g=green[index].toString(16);
        	if (g.length<2){
        		g='0'+g;
        	}
        	let r=red[index].toString(16);
        	if (r.length<2){
        		r='0'+r;
        	}
        	let b=blue[index].toString(16);
        	if (b.length<2){
        		b='0'+b;
        	}
            canvasContext.fillStyle = '#'+r+g+b;
            canvasContext.fillRect(x, y, pixelSize, pixelSize);
            x += pixelSize;
            index += 1;
        }
        y += pixelSize;
    }
}

function greyLinear() {
    console.log('drawing grey linear interpolation');
}

function colorLinear() {
    console.log('drawing color linear interpolation');
}

function greyCubic() {
    console.log('drawing grey cubic interpolation');
}

function colorCubic() {
    console.log('drawing color cubic interpolation');
}