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
    //  final,straight array of coordinates of ordered corners, for drawing
    this.cornerCoordinates = [];
    this.neighbors = []; //  cells
    this.sum = 0;
    this.neighbors2 = []; //  cells
    this.state = 0;
    this.prevState = 0;
    // mark cells that get nonzero initial state
    this.initial = false;
};

// check if point (x,y) is at center of cell
const eps = 0.01;

Cell.prototype.centerIsAt = function(x, y) {
    const result = ((Math.abs(this.centerX - x) < eps) && (Math.abs(this.centerY - y) < eps));
    return result;
};

// check if a point is a corner, using the coordinates array, return 1 if yes, return 0 if not
Cell.prototype.isCorner = function(x, y) {
    const length = this.cornerCoordinates.length;
    const coordinates = this.cornerCoordinates;
    for (let i = 0; i < length; i += 2) {
        if ((Math.abs(x - coordinates[i]) < eps) && (Math.abs(y - coordinates[i + 1]) < eps)) {
            return true;
        }
    }
    return false;
};

// check if another cell is a nearest neighbor.
// true if they have two common corners
Cell.prototype.hasCommonCorners = function(otherCell) {
    const length = this.cornerCoordinates.length;
    const coordinates = this.cornerCoordinates;
    let commonCorners = 0;
    for (let i = 0; i < length; i += 2) {
        if (otherCell.isCorner(coordinates[i], coordinates[i + 1])) {
            commonCorners += 1;
            if (commonCorners === 2) {
                return true;
            }
        }
    }
    return false;
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

// find second nearest neighbors, each cell finds the nearest second neighbors
Cell.prototype.findNeighbors2 = function() {
    const nLength = this.neighbors.length;
    let mindis2 = 1e10;
    // find the shortest 2nd neighbor distance
    for (let n = 0; n < nLength; n++) {
        const neighbor = this.neighbors[n];
        const n2Length = neighbor.neighbors.length;
        for (let n2 = 0; n2 < n2Length; n2++) {
            // all possible 2nd neighbors
            const neighbor2 = neighbor.neighbors[n2];
            // check if we have gone back
            if (neighbor2 === this) {
                continue;
            }
            // check if it is a nearest neighbor
            if (this.isNeighbor(neighbor2)) {
                continue;
            }
            // check distance
            const dx = this.centerX - neighbor2.centerX;
            const dy = this.centerY - neighbor2.centerY;

            mindis2 = Math.min(dx * dx + dy * dy, mindis2);
        }
    }
    mindis2 += 0.01;
    // do only neighbors with this distance
    for (let n = 0; n < nLength; n++) {
        const neighbor = this.neighbors[n];
        const n2Length = neighbor.neighbors.length;
        for (let n2 = 0; n2 < n2Length; n2++) {
            // all possible 2nd neighbors
            const neighbor2 = neighbor.neighbors[n2];
            // check if we have gone back
            if (neighbor2 === this) {
                continue;
            }
            // check if it is a nearest neighbor
            if (this.isNeighbor(neighbor2)) {
                continue;
            }
            // check if too far away
            const dx = this.centerX - neighbor2.centerX;
            const dy = this.centerY - neighbor2.centerY;
            if (dx * dx + dy * dy > mindis2) {
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
Cell.prototype.drawFill = function() {
    const scale = main.scale;
    const length = this.cornerCoordinates.length;
    const scaledCoordinates = [];
    scaledCoordinates.length = length;
    for (let i = 0; i < length; i++) {
        scaledCoordinates[i] = scale * this.cornerCoordinates[i];
    }
    SVG.createPolygon(scaledCoordinates, {
        fill: automaton.color[this.state]
    });
};

// draw scaled polygon, fill color depending on state
Cell.prototype.drawLine = function() {
    const scale = main.scale;
    const length = this.cornerCoordinates.length;
    const scaledCoordinates = [];
    scaledCoordinates.length = length;
    for (let i = 0; i < length; i++) {
        scaledCoordinates[i] = scale * this.cornerCoordinates[i];
    }
    SVG.createPolygon(scaledCoordinates);
};

// draw lines from center of this cell to center of target cells
Cell.prototype.drawLines = function(targets) {
    const scale = main.scale;
    const scaledCoordinates = [];
    scaledCoordinates.length = 4;
    scaledCoordinates[0] = scale * this.centerX;
    scaledCoordinates[1] = scale * this.centerY;
    const length = targets.length;
    for (let i = 0; i < length; i++) {
        const target = targets[i];
        scaledCoordinates[2] = scale * target.centerX;
        scaledCoordinates[3] = scale * target.centerY;
        SVG.createPolyline(scaledCoordinates);
    }
};

// draw lines to nearest neigbhbors
Cell.prototype.drawNeighborLines = function() {
    this.drawLines(this.neighbors);
};

// draw lines to second nearest neigbhbors
Cell.prototype.drawNeighbor2Lines = function() {
    this.drawLines(this.neighbors2);
};


// running the automaton

// set initial(state) for cells inside a critical radius around origin
Cell.prototype.setInitial = function(radius2) {
    this.initial = ((this.centerX * this.centerX + this.centerY * this.centerY) < radius2);
};

// set initial(state) for cells at given position
Cell.prototype.setInitialAt = function(x, y) {
    this.initial = this.centerIsAt(x, y);
};

// for the initial state, cells at center get special initial value, others are zero
Cell.prototype.initialize = function() {
    if (this.initial) {
        this.state = automaton.initial;
    } else {
        this.state = 0;
    }
    this.prevState=0;
};

// advancing: calculate sums and make transition
Cell.prototype.makeSum = function() {
    let sum = automaton.prevWeight * this.prevState + automaton.centerWeight*this.state;
    let neighborSum = 0;
    this.neighbors.forEach(neighbor => neighborSum += neighbor.state);
    sum += automaton.neighborWeight * neighborSum;
    if (automaton.neighbor2Weight !== 0) {
        neighborSum = 0;
        this.neighbors2.forEach(neighbor => neighborSum += neighbor.state);
        sum += automaton.neighbor2Weight * neighborSum;
    }
    this.sum = sum;
};

Cell.prototype.transition = function() {
    this.prevState = this.state;
    this.state = this.sum % automaton.nStates;
};