/* jshint esversion: 6 */

import {
    ParallelLines
} from "./parallelLines.js";

import {
    main
} from "./gridmethod.js";

/**
 * a grid made of bundles of gridlines
 */
export const Grid = function() {
    this.parallelLines = [];
};

// a basic grid for n-fold symmetry, given offset from symmetric case
// distance between lines equal to one

Grid.createBasic = function() {
    const grid = new Grid();
    if (main.nFold & 1) {
        for (let i = 0; i < main.nFold; i++) {
            grid.parallelLines.push(ParallelLines.createBasicBundle(i * Math.PI * 2 / main.nFold, main.offset, main.nLines));
        }
    } else {
        for (let i = 0; i < main.nFold / 2; i++) {
            grid.parallelLines.push(ParallelLines.createBasicBundle(i * Math.PI * 2 / main.nFold, main.offset, main.nLines));
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
        for (let j = i + 1; j < length; j++) {
            this.parallelLines[i].makeIntersections(this.parallelLines[j]);
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

Grid.prototype.shiftIntersections = function(dx, dy) {
    // compensation for double shift
    this.parallelLines.forEach(lines => lines.shiftIntersections(dx / 2, dy / 2));
};

// finally: centering the tiling
Grid.prototype.center = function() {
    const sumX = this.sumIntersectionsX();
    const sumY = this.sumIntersectionsY();
    const n = this.numberOfIntersections();
    this.shiftIntersections(-sumX / n, -sumY / n);
};

// make the tiling from an existing grid
Grid.prototype.makeTiling = function() {
    this.makeIntersections();
    if (main.tile) {
        this.sortIntersections();
        // start with the first line of the first bundle
        const line = this.parallelLines[0].lines[0];
        // define position of a first rhombus of the tiling
        line.intersections[0].set(0, 0);
        // do the first line
        line.adjust();
        const length = this.parallelLines.length;
        for (let i = 1; i < length; i++) {
            this.parallelLines[i].adjust();
        }
        this.center();
    }

};