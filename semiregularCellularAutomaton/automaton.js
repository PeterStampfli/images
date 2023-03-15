/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main
} from "./main.js";

import {
    Cell
} from "./cell.js";

export const automaton = {};

// the mechanics
automaton.cells = [];
automaton.nStates = 2;
automaton.initial = 1;
automaton.time=0;
automaton.timerValue=0;
automaton.stepsToDo=2;

automaton.prevWeight=0;
automaton.centerWeight=1;
automaton.neighborWeight=1;
automaton.neighbor2Weight=0;

// about drawing

automaton.cellLineColor = '#00bb00';
automaton.drawCellLines = true;
automaton.cellFill = true;

automaton.neighborLineColor = '#ff0000';
automaton.drawNeighborLines = false;

automaton.neighbor2LineColor = '#ff9900';
automaton.drawNeighbor2Lines = false;

automaton.color = [];
const color = automaton.color;
automaton.colorControllers = [];
color.push('#eeeeff');
color.push('#88ff88');
color.push('#ffff00');
color.push('#ff8800');
color.push('#ff4444');
color.push('#ff00ff');
color.push('#4444ff');
color.push('#00aaaa');

// setting up the automaton

// destroy all cells
automaton.clear = function() {
    automaton.cells.length = 0;
};

automaton.updateColorControllers = function() {
    const length = automaton.colorControllers.length;
    for (let i = 1; i < length; i++) {
        automaton.colorControllers[i].hide();
    }
    for (let i = 1; i < automaton.nStates; i++) {
        automaton.colorControllers[i].show();
    }
};

// set initial cells, inside critical radius
automaton.setInitial = function(radius) {
    const radius2 = radius * radius;
    automaton.cells.forEach(cell => cell.setInitial(radius2));
};

// set initial cells, at given position
automaton.setInitialAt = function(x, y) {
    automaton.cells.forEach(cell => cell.setInitialAt(x, y));
};

// sort corners resulting from dual tiling and create array of coordinate pairs
automaton.sortCorners = function() {
    automaton.cells.forEach(cell => cell.sortCorners());
};

// drawing the cells of the automaton, and neighbor lines
automaton.draw = function() {
    // if there is fill, it will be defined drawing each cell
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = 'none';
    if (automaton.cellFill) {
        SVG.createGroup(SVG.groupAttributes);
        automaton.cells.forEach(cell => cell.drawFill());
    }
    if (automaton.drawCellLines) {
        SVG.groupAttributes.stroke = automaton.cellLineColor;
        SVG.createGroup(SVG.groupAttributes);
        automaton.cells.forEach(cell => cell.drawLine());
    }
    if (automaton.drawNeighborLines) {
        SVG.groupAttributes.stroke = automaton.neighborLineColor;
        SVG.groupAttributes.fill = 'none';
        SVG.createGroup(SVG.groupAttributes);
        automaton.cells.forEach(cell => cell.drawNeighborLines());
    }
    if (automaton.drawNeighbor2Lines) {
        SVG.groupAttributes.stroke = automaton.neighbor2LineColor;
        SVG.groupAttributes.fill = 'none';
        SVG.createGroup(SVG.groupAttributes);
        automaton.cells.forEach(cell => cell.drawNeighbor2Lines());
    }
};

// add a cell at given place if not already there, return the cell
automaton.getCellAt = function(x, y) {
    let index = automaton.cells.findIndex(cell => cell.centerIsAt(x, y));
    if (index < 0) {
        index = automaton.cells.length;
        automaton.cells.push(new Cell(x, y));
    }
    return automaton.cells[index];
};

// add a cell with center at given place, return cell, use if there cannot yet be a cell at this place
automaton.newCellAt = function(x, y) {
    const cell = new Cell(x, y);
    automaton.cells.push(cell);
    return cell;
};

// add a cell: given by an array of corner coordinates, as for drawing the polygon
automaton.addCell = function(cornerCoordinates, neighborCutoff) {
    // determine center of the tile
    let centerX = 0;
    let centerY = 0;
    let coordinatesLength = cornerCoordinates.length;
    for (let i = 0; i < coordinatesLength; i += 2) {
        centerX += cornerCoordinates[i];
        centerY += cornerCoordinates[i + 1];
    }
    centerX *= 2 / coordinatesLength;
    centerY *= 2 / coordinatesLength;
    // create the cell, we know that there are no dublicates
    const cell = automaton.newCellAt(centerX, centerY);
    cell.cornerCoordinates = cornerCoordinates;
    // create nearest neighbors, all cells near this cell
    neighborCutoff *= neighborCutoff;
    // excluding this cell, it is the last one
    const length = automaton.cells.length - 1;
    for (let i = 0; i < length; i++) {
        const neighbor = automaton.cells[i];
        // check close enough, should work for all semiregular tilings
        const dx = cell.centerX - neighbor.centerX;
        const dy = cell.centerY - neighbor.centerY;
        if (dx * dx + dy * dy < neighborCutoff) {
            // check if the cell and its neighbor have two common corners
            if (cell.hasCommonCorners(neighbor)) {
                // it has to be a new neighbor connection because this cell is new
                cell.neighbors.push(neighbor);
                neighbor.neighbors.push(cell);
            }
        }
    }
};

// add a cell: given by an array of corner coordinates, as for drawing the polygon
// next neighbor only above, interaction going down
// special for hexagon lattice as pascal triangle
automaton.addCellPascalTriangle = function(cornerCoordinates, neighborCutoff) {
    // determine center of the tile
    let centerX = 0;
    let centerY = 0;
    let coordinatesLength = cornerCoordinates.length;
    for (let i = 0; i < coordinatesLength; i += 2) {
        centerX += cornerCoordinates[i];
        centerY += cornerCoordinates[i + 1];
    }
    centerX *= 2 / coordinatesLength;
    centerY *= 2 / coordinatesLength;
    // create the cell, we know that there are no dublicates
    const cell = automaton.newCellAt(centerX, centerY);
    cell.cornerCoordinates = cornerCoordinates;
    // create nearest neighbors, all cells near this cell
    neighborCutoff *= neighborCutoff;
    // excluding this cell, it is the last one
    const length = automaton.cells.length - 1;
    for (let i = 0; i < length; i++) {
        const neighbor = automaton.cells[i];
        // check close enough, should work for all semiregular tilings
        const dx = cell.centerX - neighbor.centerX;
        const dy = cell.centerY - neighbor.centerY;
        if (dx * dx + dy * dy < neighborCutoff) {
            // check if the cell and its neighbor have two common corners
            if (cell.hasCommonCorners(neighbor)) {
                // it has to be a new neighbor connection because this cell is new
                // only nearest neighbors above
                if (neighbor.centerY - cell.centerY > 0.1) {
                    cell.neighbors.push(neighbor);
                } else if (cell.centerY - neighbor.centerY > 0.1) {
                    neighbor.neighbors.push(cell);
                }
            }
        }
    }
};

// find second nearest neighbors
automaton.findNeighbors2 = function(cutoff) {
    const cutoff2 = cutoff * cutoff;
    automaton.cells.forEach(cell => cell.findNeighbors2(cutoff2));
};

// running the automaton

// set value of cells equal to zero except selected cells, getting initialValue
automaton.initialize = function() {
automaton.time=0;
    automaton.cells.forEach(cell => cell.initialize());
};

// provisorisch

automaton.advance = function() {
automaton.time+=1;
automaton.timer.setValueOnly(automaton.time);


    automaton.cells.forEach(cell => cell.makeSum());


    automaton.cells.forEach(cell => cell.transition());
};

