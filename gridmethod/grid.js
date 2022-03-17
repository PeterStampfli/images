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
export const grid = {};

grid.parallelLines = [];


grid.linepositions = [];

// adjust line positions
// origin plus offset equals mean value of positions
grid.adjust = function() {
    const length = grid.linepositions.length;
    let sum = 0;
    for (let i = 0; i < length; i++) {
        sum += grid.linepositions[i];
    }
    const shift = main.offset - sum / length;
    for (let i = 0; i < length; i++) {
        grid.linepositions[i] += shift;
    }
};

// a basic grid for n-fold symmetry, given offset from symmetric case
// distance between lines equal to one

grid.createBasic = function() {
    grid.parallelLines.length = 0;
    // angle between lines
    grid.dAlpha = Math.PI * 2 / main.nFold;
    if (main.nFold & 1) {
        grid.nDirections = main.nFold;
        grid.dAlpha /= 2;
    } else {
        grid.nDirections = main.nFold / 2;
    }
    for (let i = 0; i < grid.nDirections; i++) {
        grid.parallelLines.push(ParallelLines.createBasicBundle(i * Math.PI * 2 / main.nFold, main.offset, main.nLines));
    }
};

grid.drawLines = function() {
    grid.parallelLines.forEach(lines => lines.draw());
};

grid.drawIntersections = function() {
    grid.parallelLines.forEach(lines => lines.drawIntersections());
};

grid.makeIntersections = function() {
    const length = grid.parallelLines.length;
    for (let i = 0; i < length; i++) {
        for (let j = i + 1; j < length; j++) {
            grid.parallelLines[i].makeIntersections(grid.parallelLines[j]);
        }
    }
};

grid.sortIntersections = function() {
    grid.parallelLines.forEach(lines => lines.sortIntersections());
};

// for centering the tiling
grid.sumIntersectionsX = function() {
    let sum = 0;
    grid.parallelLines.forEach(lines => sum += lines.sumIntersectionsX());
    return sum;
};

grid.sumIntersectionsY = function() {
    let sum = 0;
    grid.parallelLines.forEach(lines => sum += lines.sumIntersectionsY());
    return sum;
};

grid.numberOfIntersections = function() {
    let sum = 0;
    grid.parallelLines.forEach(lines => sum += lines.numberOfIntersections());
    return sum;
};

grid.shiftIntersections = function(dx, dy) {
    // compensation for double shift
    grid.parallelLines.forEach(lines => lines.shiftIntersections(dx / 2, dy / 2));
};

// finally: centering the tiling
grid.center = function() {
    const sumX = grid.sumIntersectionsX();
    const sumY = grid.sumIntersectionsY();
    const n = grid.numberOfIntersections();
    grid.shiftIntersections(-sumX / n, -sumY / n);
};

// make the tiling from an existing grid
grid.makeTiling = function() {
    grid.makeIntersections();
    if (main.tile) {
        grid.sortIntersections();
        // start with the first line of the first bundle
        const line = grid.parallelLines[0].lines[0];
        // define position of a first rhombus of the tiling
        line.intersections[0].set(0, 0);
        // do the first line
        line.adjust();
        const length = grid.parallelLines.length;
        for (let i = 1; i < length; i++) {
            grid.parallelLines[i].adjust();
        }
        grid.center();
    }

};