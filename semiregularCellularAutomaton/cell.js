/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main
} from "./main.js";

import {
    automaton
} from "./automaton.js";

// cells for a cellular automaton, in particular quasiperiodic

export const Cell = function(x, y) {
    // center position
    this.centerX = x;
    this.centerY = y;
    // intermediate, for calculation
    // each corner is an array [x,y as absolute coordinates, the angle with respect to center of cell]
    this.corners = [];
    //  final,straight array of coordinates of ordered corners, for drawing
    this.cornerCoordinates = [];
    this.neighbors = []; //  cells
    this.neighborsum = 0;
    this.neighbors2 = []; //  cells
    this.neighbor2sum = 0;
    this.state = 0;
    // mark cells that get nonzero initial state
    this.initial = false;
};

// draw scaled polygon, fill color depending on state
// uses array of coordinate pairs
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

// check if point (x,y) is at center of cell
const eps = 0.01;

Cell.prototype.centerIsAt = function(x, y) {
    const result = ((Math.abs(this.centerX - x) < eps) && (Math.abs(this.centerY - y) < eps));
    return result;
};

// creation from dual tiling
// add a corner to the cell, one for each tile that has the center of the cell at one of its corners
// no check of dublicates, the cello corner is the center of the tile
// angle is relative to center of the cell

Cell.prototype.addCorner = function(x, y) {
    const angle = Math.atan2(y - this.centerY, x - this.centerX);
    this.corners.push([x, y, angle]);
};

// sort corners according to angle, create array of coordinates, do before drawing
Cell.prototype.sortCorners = function() {
    this.corners.sort((a, b) => a[2] - b[2]);
    this.corners.forEach(corner => this.cornerCoordinates.push(corner[0], corner[1]));
};

// check if a cell is in neighbor list
Cell.prototype.isNeighbor = function(otherCell) {
    const index = this.neighbors.findIndex(cell => cell === otherCell);
    return index >= 0;
};

// check if a cell is in second neighbor list
Cell.prototype.isNeighbor2 = function(otherCell) {
    const index = this.neighbors2.findIndex(cell => cell === otherCell);
    return index >= 0;
};

// add a (nearest) neighbor to another cell, if not already there
Cell.prototype.addNeighbor = function(otherCell) {
    if (!this.isNeighbor(otherCell)) {
        this.neighbors.push(otherCell);
    }
};

// find second nearest neighbors
Cell.prototype.findNeighbors2 = function() {
    const nLength = this.neighbors.length;
    for (n = 0; n < nLength; n++) {
        const neighbor = this.neighbors[n];
        const n2Length = neighbor.neighbors.length;
        for (n = 0; n < n2Length; n2++) {
            // all possible 2nd neighbors
            neighbor2 = neighbor.neighbors[n2];
            // check if we have gone back
            if (neighbor2 === this) {
                continue;
            }
            // check if it is a nearest neighbor
            if (this.isNeighbor(neighbor2)) {
                continue;
            }
            // check if it is already a second neraest neighbor
            if (this.isNeighbor2(neighbor2)) {
                continue;
            }
            this.neighbors2.push(neighbor2);
        }
    }

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
    if (automaton.cellFill) {
        SVG.createPolygon(scaledCoordinates, {
            fill: automaton.color[this.state]
        });
    } else {
        SVG.createPolygon(scaledCoordinates);
    }
};

// draw lines to neigbhbors
Cell.prototype.drawNeighborLines = function() {
    const scale = main.scale;
    const scaledCoordinates = [];
    scaledCoordinates.length = 4;
    scaledCoordinates[0] = scale * this.centerX;
    scaledCoordinates[1] = scale * this.centerY;
    const length = this.neighbors.length;
    for (let i = 0; i < length; i++) {
        const neighbor = this.neighbors[i];
        scaledCoordinates[2] = scale * neighbor.centerX;
        scaledCoordinates[3] = scale * neighbor.centerY;
        SVG.createPolyline(scaledCoordinates);
    }
};

// running the automaton

// set initial(state) for cells inside a critical radius around origin
Cell.prototype.setInitial = function(radius2) {
    this.initial = ((this.centerX * this.centerX + this.centerY * this.centerY) < radius2);
};

// for the initial state, cells at center get special initial value, others are zero
Cell.prototype.initialize = function(initialValue) {
    if (this.initial) {
        this.state = initialValue;
    } else {
        this.state = 0;
    }
};

// advancing: calculate sums and make transition
Cell.prototype.sumNeighborStates = function() {
    let sum = 0;
    this.neighbors.forEach(neighbor => sum += neighbor.state);
    this.neighborsum = sum;
};


Cell.prototype.transition = function() {
    this.state = (this.neighborsum + this.state) % automaton.nStates;
};