/* jshint esversion: 6 */

import {
    main
}
from "./modules.js";

import {
    output,
}
from "../libgui/modules.js";

/**
 * object for drawing lines with choosable color and line width
 * @creator Lines
 * @param {object} params - optional, initial color and linewidth
 */
export function Lines(params) {
    this.color = '#000000';
    this.lineWidth = 1;
    Object.assign(this, params);
    // an array of lines, each line is an array with coordinate pairs
    this.lines = [];
}

// todo: add on/off (for all lines), hide/show ui

/**
 * make the UI for color and lineWidth into main GUI
 * @method Lines#makeUI
 * @param {String} label
 * @return {ParamController}  for hiding, destroying, ...
 */
Lines.prototype.makeUI = function(label = 'missing label') {
    const controller = main.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        labelText: label,
        onChange: main.drawImageChanged
    });
    controller.add({
        type: 'number',
        params: this,
        property: 'lineWidth',
        labelText: 'width',
        min: 0.1,
        onChange: main.drawImageChanged
    });
    return controller;
};

/**
 * clear the lines
 * @method Lines#clear
 */
Lines.prototype.clear = function() {
    this.lines.length = 0;
};

/**
 * add an open line
 * @method Lines#addOpen
 * @param {list of numbers||Array of numbers} pairs of x,y coordinates
 */
Lines.prototype.addOpen = function(coordinates) {
    var line;
    if (arguments.length === 1) {
        line = coordinates;
    } else {
        line = Array.from(arguments);
    }
    this.lines.push(line);
};

/**
 * add a closed line
 * @method Lines#addClosed
 * @param {list of numbers||Array of numbers} pairs of x,y coordinates
 */
Lines.prototype.addClosed = function(coordinates) {
    var line;
    if (arguments.length === 1) {
        line = coordinates;
    } else {
        line = Array.from(arguments);
    }
    // going back, close path
    line.push(line[0]);
    line.push(line[1]);
    this.lines.push(line);
};

/**
 * draw the lines on canvas
 * @method Lines#draw
 */
Lines.prototype.draw = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = this.color;
    output.setLineWidth(this.lineWidth);
    this.lines.forEach(line => {
        output.makePath(line);
        canvasContext.stroke();
    });
};

/**
 * object for drawing areas with choosable color
 * @creator Areas
 * @param {object} params - optional, initial color
 */
export function Areas(params) {
    this.color = '#00ff00';
    Object.assign(this, params);
    // an array of lines, each line is an array with coordinate pairs
    this.lines = [];
}

/**
 * make the UI for color into main GUI
 * @method Areas#makeUI
 * @param {String} label
 * @return {ParamController}  for hiding, destroying, ...
 */
Areas.prototype.makeUI = function(label = 'missing label') {
    const controller = main.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        labelText: label,
        onChange: main.drawImageChanged
    });
    return controller;
};

/**
 * clear the lines
 * @method Areas#clear
 */
Areas.prototype.clear = function() {
    this.lines.length = 0;
};

/**
 * add a closed line
 * @method Areas#add
 * @param {list of numbers||Array of numbers} pairs of x,y coordinates
 */
Areas.prototype.add = function(coordinates) {
    var line;
    if (arguments.length === 1) {
        line = coordinates;
    } else {
        line = Array.from(arguments);
    }
    // going back, close path
    line.push(line[0]);
    line.push(line[1]);
    this.lines.push(line);
};

/**
 * draw the areas on canvas
 * @method Areas#draw
 */
Areas.prototype.draw = function() {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = this.color;
    this.lines.forEach(line => {
        output.makePath(line);
        canvasContext.fill();
    });
};