/* jshint esversion:6 */

import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    map,
    julia
} from "./mapImage.js";

export const chaosTrajectory = {};

chaosTrajectory.nInitial = 1000;
chaosTrajectory.nRun = 100000;

chaosTrajectory.setup = function(gui) {
    gui.addParagraph('<strong>chaos trajectory</strong>');
    gui.add({
        type: 'number',
        params: chaosTrajectory,
        property: 'nInitial',
        labelText: 'initial',
        step: 1,
        min: 0
    }).add({
        type: 'number',
        params: chaosTrajectory,
        property: 'nRun',
        labelText: 'run',
        step: 1,
        min: 0,
        max: 4294967295
    });
    gui.add({
        type: 'button',
        buttonText: 'rerun',
        onClick: function() {
            chaosTrajectory.initialize();
            chaosTrajectory.run();
            chaosTrajectory.show();
        }
    }).add({
        type: 'button',
        buttonText: 'more points',
        onClick: function() {
            chaosTrajectory.run();
            chaosTrajectory.show();
        }
    });
};

// colors
const invalidColor = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
});

const greys = [];
for (let i = 0; i < 256; i++) {
    greys.push(Pixels.integerOfColor({
        red: i,
        green: i,
        blue: i,
        alpha: 255
    }));
}

chaosTrajectory.colors = greys;

// check that the julia set is nonempty, return true if nonempty
map.nonemptyJuliaSet = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            return true;
        }
    }
    return false;
};

// find a random pixel in the julia set, it has to be nonempty, else infinite loop
// returns index of pixel
map.pixelInJuliaSet = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    while (true) {
        const index = Math.floor(nPixels * Math.random());
        if (structureArray[index] < 128) {
            return index;
        }
    }
};

// find index to a given point(x,y)
// beware of out of bounds
// returns negative number if out of bounds
map.findIndex = function(point) {
    const coordinateTransform = output.coordinateTransform;
    const scale = coordinateTransform.totalScale;
    const mapWidth = map.width;
    const columnIndex = Math.floor((point.x - coordinateTransform.shiftX) / scale);
    if ((columnIndex < 0) || (columnIndex >= mapWidth)) {
        return -1;
    }
    const rowIndex = Math.floor((point.y - coordinateTransform.shiftY) / scale);
    if ((rowIndex < 0) || (rowIndex >= map.Height)) {
        return -1;
    }
    return rowIndex * mapWidth + columnIndex;
};

// find point[x,y] for a given pixel index
// index has to be inside map, no check
map.findPosition = function(point, index) {
    const coordinateTransform = output.coordinateTransform;
    const scale = coordinateTransform.totalScale;
    const mapWidth = map.width;
    const rowIndex = Math.floor(index / mapWidth);
    const columnIndex = index - mapWidth * rowIndex;
    point.x = coordinateTransform.shiftX + columnIndex * scale;
    point.y = coordinateTransform.shiftY + rowIndex * scale;
};

map.chaosNumbers = new UInt32Array(1);

// mapping point.x,point.y
// simple test circle
chaosTrajectory.mapping = function(point) {
    const angle = 0.01;
    const h = point.x * Math.cos(angle) - point.y * Math.sin(angle);
    point.y = point.x * Math.sin(angle) + y * Math.cos(angle);
};

chaosTrajectory.nonemptyJuliaSet = true;
chaosTrajectory.point = {};

// run the big number of points
// add up the numbers
chaosTrajectory.run = function() {
    if (chaosTrajectory.nonemptyJuliaSet) {
        const startIndex = map.findIndex();
        map.findPosition(point, index);
        const nRun = chaosTrajectory.nRun;
        const mapping = chaosTrajectory.mapping;
        const chaosNumbers = map.chaosNumbers;
        for (var i = 0; i < nRun; i++) {
            mapping(point);
            const index = map.findIndex(point);
            if (index >= 0) {
                chaosNumbers[index] += 1;
            }
        }
    }
};

chaosTrajectory.draw = function() {
    const pixelsArray = output.pixels.array;
    const structureArray = map.structureArray;
    const length = structureArray.length;
    const colors = chaosTrajectory.colors;
    const chaosNumbers = chaosTrajectory.chaosNumbers;
    let maxNumber = 0;
    for (let index = 0; index < length; index++) {
        maxNumber = Math.max(maxNumber, chaosNumbers[index]);
    }
    const factor = 255.9 / maxNumber;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const structure = structureArray[index];
        if (structure < 128) {
            pixelsArray[index] = colors[Math.floor(factor * chaosNumbers[index])];
        } else {
            pixelsArray[index] = invalidColor;
        }
    }
    output.pixels.show();
};

// initialize the chaos trajectory array: set size if needed
// always fill with zeros
// check for nonempty julia set
// find point in julia set
// do initial run
chaosTrajectory.initialize = function() {
    if (map.xArray.length !== map.chaosNumbers.length) {
        map.chaosNumbers = new UInt32Array(map.xArray.length);
    }
    map.chaosNumbers.fill(0);
    chaosTrajectory.nonemptyJuliaSet = map.nonemptyJuliaSet();
    if (chaosTrajectory.nonemptyJuliaSet) {
        const startIndex = map.findIndex();
        map.findPosition(point, index);
        const nInitial = chaosTrajectory.nInitial;
        const mapping = chaosTrajectory.mapping;
        for (var i = 0; i < nInitial; i++) {
            mapping(point);
        }
    }
};