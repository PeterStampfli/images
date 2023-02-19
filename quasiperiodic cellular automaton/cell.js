/* jshint esversion: 6 */

// cells for a cellular automaton, in particular quasiperiodic



export const Cell = function(x, y) {
    this.centerX = x; // center position, coordinate x
    this.centerY = y;
    this.corners = []; // each corner is array [x,y,angle with respect to center]
    this.neighbors = []; //  cells
};

// check if (x,y) is at same place
const eps = 0.01;

Cell.prototype.isAt = function(x, y) {
    const result = ((Math.abs(this.centerX - x) < eps) && (Math.abs(this.centerY - y) < eps));
    return result;
};

// add a corner, one for each tile that has cell at one of its corners
// no check of dublicates

Cell.prototype.addCorner = function(x, y) {
    const angle = Math.atan2(y - this.centerY, x - this.centerX);
    this.corners.push([x, y, angle]);
};

// sort corners according to angle, do before drawing
Cell.prototype.sortCorners = function() {
    this.corners.sort((a, b) => a[2] - b[2]);
};

// add a neighbor to another cell, if not already there
Cell.prototype.addNeighbor = function(otherCell) {
    const index = this.neighbors.findIndex(neighbor => neighbor === otherCell);
    console.log(index);
    if (index < 0) {
        this.neighbors.push(otherCell);
    }
};