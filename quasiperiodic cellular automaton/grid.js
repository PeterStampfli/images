/* jshint esversion: 6 */

import {
    ParallelLines
} from "./parallelLines.js";

import {
    main
} from "./gridmethod.js";

import {
    automaton
} from "./automaton.js";

/**
 * a grid made of bundles of gridlines
 */
export const grid = {};

grid.parallelLines = [];

grid.linepositions = [];

// a basic grid for n-fold symmetry, given offset from symmetric case
// distance between lines equal to one

grid.spacing = function() {
    grid.linepositions.length = 0;
    let offset = 0.5 + main.offset;
    if ((main.nFold & 1) === 0) {
        offset = 0.25 + main.offset;
    }
    grid.linepositions.push(offset);
    const limitSteps = (main.nLines - 1) / 2;
    for (let i = 1; i <= limitSteps; i++) {
        grid.linepositions.push(offset + i);
        grid.linepositions.push(offset - i);
    }
};

grid.create = function() {
    grid.parallelLines.length = 0;
    if (main.nFold & 1) {
        grid.nDirections = main.nFold;
        grid.dAlpha = Math.PI / main.nFold;
    } else {
        grid.nDirections = main.nFold / 2;
        grid.dAlpha = Math.PI * 2 / main.nFold;
    }
    for (let i = 0; i < grid.nDirections; i++) {
        grid.parallelLines.push(ParallelLines.createBundle(i * Math.PI * 2 / main.nFold, grid.linepositions));
    }
};

grid.drawTiles = function() {
    grid.parallelLines.forEach(lines => lines.drawTiles());
};

grid.setupAutomaton = function() {
    automaton.clear();
    automaton.setLimit(main.automatonLimit);
    grid.parallelLines.forEach(lines => lines.setupAutomaton());
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
};