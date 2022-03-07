/* jshint esversion: 6 */

import {
    ParallelLines
} from "./parallelLines.js";

/**
 * a grid made of bundles of gridlines
 */
export const Grid = function() {
    this.parallelLines = [];
};

// a basic grid for n-fold symmetry

Grid.createBasic = function(nFold, nLines = 10) {
    const grid = new Grid();
    if (nFold & 1) {
        for (let i = 0; i < nFold; i++) {
            grid.parallelLines.push(ParallelLines.createSymmetricBundle(i * Math.PI * 2 / nFold, nLines));
        }
    } else {
        for (let i = 0; i < nFold / 2; i++) {
            grid.parallelLines.push(ParallelLines.createSymmetricBundle(i * Math.PI * 2 / nFold, nLines));
        }
    }
    return grid;
};

Grid.prototype.drawLines = function() {
    this.parallelLines.forEach(lines => lines.draw());
};

Grid.prototype.drawIntersections = function() {
    this.parallelLines.forEach(lines => lines.drawIntersections());
};

Grid.prototype.makeIntersections = function() {
    const length = this.parallelLines.length;
    for (let i = 0; i < length; i++) {
        for (let j = 1; j < length; j++) {
            if (i !== j) {
                this.parallelLines[i].makeIntersections(this.parallelLines[j]);
            }
        }
    }
};

Grid.prototype.sortIntersections = function() {
    this.parallelLines.forEach(lines => lines.sortIntersections());
};

// for centering the tiling
Grid.prototype.sumIntersectionsX = function() {
    let sum = 0;
    this.parallelLines.forEach(lines => sum += lines.sumIntersectionsX());
    return sum;
};

Grid.prototype.sumIntersectionsY = function() {
    let sum = 0;
    this.parallelLines.forEach(lines => sum += lines.sumIntersectionsY());
    return sum;
};

Grid.prototype.numberOfIntersections = function() {
    let sum = 0;
    this.parallelLines.forEach(lines => sum += lines.numberOfIntersections());
    return sum;
};

Grid.prototype.shiftIntersections = function(dx,dy) {
    this.parallelLines.forEach(lines => lines.shiftIntersections(dx,dy));
};

//for dualization, where to begin, assuming that there are no empty sets of parallel lines
Grid.prototype.getFirstLine=function(){
    return this.parallelLines[0].lines[0];
}