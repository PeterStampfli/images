/* jshint esversion: 6 */

import {
    main
}
from "./modules.js";

import {
    output,
    BooleanButton
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
    this.on=true;
    Object.assign(this, params);
    // an array of lines, each line is an array with coordinate pairs
    this.lines = [];
}

/**
* initialize line drawing: round corner and joins
* @method Lines.init
*/
Lines.init=function(){
	output.canvasContext.lineJoin='round';
	output.canvasContext.lineCap='round';
}

/**
 * make the UI for color and lineWidth into main GUI
 * @method Lines#makeUI
 * @param {String} label
 */
Lines.prototype.makeUI = function(label = 'missing label') {
BooleanButton.greenRedBackground();
    this.colorController=main.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        labelText:label,
        onChange: main.drawImageChanged
    });
        this.onController = main.gui.add({
        type: 'boolean',
        params: this,
        property: 'on',
        labelText: '',
        onChange: main.drawImageChanged
    });
    this.onController .add({
        type: 'number',
        params: this,
        property: 'lineWidth',
        labelText: 'width',
        min: 0.1,
        onChange: main.drawImageChanged
    });
};

/**
* hide the UI
* @method Lines#hideUI
*/
Lines.prototype.hideUI=function(){
	this.onController.hide();
	this.colorController.hide();
}

/**
* show the UI
* @method Lines#hideUI
*/
Lines.prototype.showUI=function(){
	this.onController.show();
	this.colorController.show();
}

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
    if (this.on){
    	const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = this.color;
    output.setLineWidth(this.lineWidth);
    this.lines.forEach(line => {
        output.makePath(line);
        canvasContext.stroke();
    });
}
};

/**
 * object for drawing areas with choosable color
 * including overprinting
 * @creator Areas
 * @param {object} params - optional, initial color
 */
export function Areas(params) {
    this.color = '#00ff00';
    this.overprinting=true;
    this.lineWidth=1;
    Object.assign(this, params);
    // an array of lines, each line is an array with coordinate pairs
    this.lines = [];
}

/**
 * make the UI for color into main GUI
 * @method Areas#makeUI
 * @param {String} label
 */
Areas.prototype.makeUI = function(label = 'missing label') {
    this.colorController = main.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        labelText: label,
        onChange: main.drawImageChanged
    });
        this.onController = main.gui.add({
        type: 'boolean',
        params: this,
        property: 'overprinting',
        onChange: main.drawImageChanged
    });
    this.onController .add({
        type: 'number',
        params: this,
        property: 'lineWidth',
        labelText: 'width',
        min: 0.1,
        onChange: main.drawImageChanged
    });
};

/**
* hide the UI
* @method Areas#hideUI
*/
Areas.prototype.hideUI=function(){
	this.onController.hide();
	this.colorController.hide();
}

/**
* show the UI
* @method Areas#hideUI
*/
Areas.prototype.showUI=function(){
	this.onController.show();
	this.colorController.show();
}

/**
 * clear the areas (lines)
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
    canvasContext.strokeStyle = this.color;
    this.lines.forEach(line => {
        output.makePath(line);
        canvasContext.fill();
        if (this.overprinting){
        	canvasContext.stroke();
        }
    });
};