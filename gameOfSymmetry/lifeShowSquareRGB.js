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

var gui, canvas;
var red, green, blue;
var uiController;
var nStates = 0;

/**
 *
 * @method lifeShowSquareRGB.init
 * @param {ParamGui} theGui - a paramGui folder
 * @param {Canvas} theCanvas - for showing the automaton
 */
lifeShowSquareRGB.init = function(theGui, theCanvas) {
    gui = theGui;
    canvas = theCanvas;
    red = [];
    green = [];
    blue = [];
    // set up the gui
    lifeShowSquareRGB.displayMethod = 'greysBlock';
    const choices = {
        'greysBlockPixels': 'greysBlock',
        'greysLinearInterpolation': 'greysLinear',
        'greysCubicInterpolation': 'greysCubic',
        'colorBlockPixels': 'colorBlock',
        'colorLinearInterpolation': 'colorLineaar',
        'colorCubicInterpolation': 'colorCubic'
    };
    uiController = gui.add({
        type: 'selection',
        options: choices,
        params: lifeShowSquareRGB,
        property: 'displayMethod',
        labelText: 'display',
        onChange: function(value) {
            console.log(value);
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

/**
 * read data of a (new) generation of the world as an array
 * the array has a border of cells around it, it is square
 * if its length is s*s, then the image data has a side length of s-2
 * if the size changes, then we have to reset the image data (red, green, blue)
 * @method lifeShowSquareRGB.newGeneration
 * @param {array} worldData
 */

// fill the image data arrays with zeros
function clearImage() {
    red.fill(0);
    green.fill(0);
    blue.fill(0);
}