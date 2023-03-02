/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main,
    color
} from "./gridmethod.js";

// cells for a cellular automaton, in particular quasiperiodic

export const Cell = function(x, y) {
    this.centerX = x; // center position, coordinate x
    this.centerY = y;
    // each corner is an array [x,y as absolute coordinates, the angle with respect to center of cell]
    this.corners = [];
    //  straight array of coordinates of ordered corners, for drawing
    this.cornerCoordinates = [];
    this.neighbors = []; //  cells
    this.state = 0;
};

// draw scaled polygon, fill color depending on state
Cell.prototype.draw = function() {
    const scale = main.scale;
    const length = this.cornerCoordinates.length;
    const scaledCoordinates = [];
    scaledCoordinates.length = length;
    for (let i = 0; i < length; i++) {
        scaledCoordinates[i] = scale * this.cornerCoordinates[i];
    }
    if (main.cellFill) {
        SVG.createPolygon(scaledCoordinates, {
            fill: color[this.state]
        });
    } else {
        SVG.createPolygon(scaledCoordinates);
    }
};

// check if (x,y) is at same place
const eps = 0.01;

Cell.prototype.isAt = function(x, y) {
    const result = ((Math.abs(this.centerX - x) < eps) && (Math.abs(this.centerY - y) < eps));
    return result;
};

// add a corner, one for each tile that has the cell at one of its corners
// no check of dublicates, angle is relative to center of the cell

Cell.prototype.addCorner = function(x, y) {
    const angle = Math.atan2(y - this.centerY, x - this.centerX);
    this.corners.push([x, y, angle]);
};

// sort corners according to angle, create array of coordinates, do before drawing
Cell.prototype.prepareDrawing = function() {
    this.corners.sort((a, b) => a[2] - b[2]);
    this.corners.forEach(corner => this.cornerCoordinates.push(corner[0], corner[1]));
};

// add a neighbor to another cell, if not already there
Cell.prototype.addNeighbor = function(otherCell) {
    const index = this.neighbors.findIndex(neighbor => neighbor === otherCell);
    if (index < 0) {
        this.neighbors.push(otherCell);
    }
};