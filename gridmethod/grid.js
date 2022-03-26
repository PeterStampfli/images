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
    const shift = + main.offset - sum / length;
    for (let i = 0; i < length; i++) {
        grid.linepositions[i] += shift;
    }
};

function equal(generation, position) {
    if (generation > 0) {
        equal(generation - 1, 2 * position);
        equal(generation - 1, 2 * position + 1);
    } else {
        grid.linepositions.push(position);
    }
}

// make equally spaced linepositions
grid.equalSpacedLines = function() {
    grid.linepositions.length = 0;
    equal(main.generations, 0);
};

function A(generation, position) {
    if (generation > 0) {
        C(generation - 1, 2.247 * position);
    } else {
        grid.linepositions.push(position);
    }
}

function B(generation, position) {
    if (generation > 0) {
        B(generation - 1, 2.247 * position);
        C(generation - 1, 2.247 * position+1.802);
    } else {
        grid.linepositions.push(position);
    }
}
function C(generation, position) {
    if (generation > 0) {
        A(generation - 1, 2.247 * position);
        B(generation - 1, 2.247 * position+1);
        C(generation - 1, 2.247 * position+2.802);
    } else {
        grid.linepositions.push(position);
    }
}

grid.trisection=function(){
    grid.linepositions.length = 0;
    C(main.generations, 0);
};

function one(generation, position) {
    if (generation > 0) {
        phi(generation - 1, 1.618 * position);
    } else {
        grid.linepositions.push(position);
    }
}

function phi(generation, position) {
    if (generation > 0) {
        one(generation - 1, 1.618 * position);
        phi(generation - 1, 1.618 * position+1);
    } else {
        grid.linepositions.push(position);
    }
}

grid.goldenSection=function(){
   grid.linepositions.length = 0;
    phi(main.generations, 0);
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

grid.create=function(){
       grid.parallelLines.length = 0;
    // angle between lines
    grid.dAlpha = Math.PI * 2 / main.nFold;
    if (main.nFold & 1) {
        grid.nDirections = main.nFold;
        grid.dAlpha /= 2;
        grid.nRhombi=(main.nFold-1)/2;
    } else {
        grid.nDirections = main.nFold / 2;
        if (main.nFold&2){
        grid.nRhombi=(main.nFold/2-1)/2;
        } else { 
            // multiple of 4
        grid.nRhombi=main.nFold/4;  
        }  
    }
    for (let i = 0; i < grid.nDirections; i++) {
        grid.parallelLines.push(ParallelLines.createBundle(i * Math.PI * 2 / main.nFold, grid.linepositions));
    }
}

grid.drawLines = function() {
    grid.parallelLines.forEach(lines => lines.draw());
};

grid.drawIntersections = function() {
    grid.parallelLines.forEach(lines => lines.drawIntersections());
};

grid.drawBentBottomBackground = function() {
    grid.parallelLines.forEach(lines => lines.drawBentBottomBackground());
};

grid.drawBentTopBackground = function() {
    grid.parallelLines.forEach(lines => lines.drawBentTopBackground());
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