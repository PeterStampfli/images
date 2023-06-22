/* jshint esversion:6 */

import {
    output
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
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: chaosTrajectory,
        property: 'nRun',
        labelText: 'run',
        step: 1,
        min: 0,
        max: 4294967295,
        onChange: julia.drawNewStructure
    });
    gui.add({
    	type:'button',
    	buttonText:'rerun',
    	onClick: function(){
    		
    	}
    }).add({
    	type:'button',
    	buttonText:'more points',
    	onClick: function(){
    		
    	}
    })
};

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

// find index to a given position(x,y)
// beware of out of bounds
// returns negative number if out of bounds
map.findIndex = function(x, y) {
    const coordinateTransform = output.coordinateTransform;
    const scale = coordinateTransform.totalScale;
    const mapWidth = map.width;
    const columnIndex = Math.floor((x - coordinateTransform.shiftX) / scale);
    if ((columnIndex < 0) || (columnIndex >= mapWidth)) {
        return -1;
    }
    const rowIndex = Math.floor((y - coordinateTransform.shiftY) / scale);
    if ((rowIndex < 0) || (rowIndex >= map.Height)) {
        return -1;
    }
    return rowIndex * mapWidth + columnIndex;
};

// return position [x,y] for a given pixel index
// index has to be inside map, no check
map.findPosition = function(index) {
    const coordinateTransform = output.coordinateTransform;
    const scale = coordinateTransform.totalScale;
    const mapWidth = map.width;
    const rowIndex = Math.floor(index / mapWidth);
    const columnIndex = index - mapWidth * rowIndex;
    return [coordinateTransform.shiftX + columnIndex * scale, coordinateTransform.shiftY + rowIndex * scale];
};

map.chaosNumbers = new UInt32Array(1);

// initialize the chaos trajectory array: set size and fill with zeros
map.initializeChaosNumbers = function() {
    if (map.xArray.length !== map.chaosNumbers.length) {
        map.chaosNumbers = new UInt32Array(map.xArray.length);
    }
    map.chaosNumbers.fill(0);
};