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


// about drawing

automaton.cellLineColor = '#00bb00';
automaton.drawCellLines = true;
automaton.cellFill = true;

automaton.neighborLineColor = '#ff0000';
automaton.drawNeighborLines = true;

automaton.neighbor2LineColor = '#ff9900';
automaton.drawNeighbor2Lines = true;

automaton.color = [];
const color = automaton.color;
const colorControllers = [];
color.push('#ffffff');
color.push('#88ff88');
color.push('#ffff00');
color.push('#ff8800');
color.push('#ff4444');
color.push('#ff00ff');
color.push('#4444ff');
color.push('#00aaaa');

function draw() {
    main.draw();
}

automaton.createGui = function(gui) {
    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighborLineColor',
        labelText: 'neighbor line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighborLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighbor2LineColor',
        labelText: '2nd nbr line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighbor2Lines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'cellLineColor',
        labelText: 'cell line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawCellLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'boolean',
        params: automaton,
        property: 'cellFill',
        labelText: 'cell fill',
        onChange: draw
    });

    gui.add({
        type: 'number',
        params: automaton,
        property: 'nStates',
        min: 2,
        step: 1,
        onChange: function() {
            create();
            draw();
        }
    });

    gui.addParagraph("colors for states");
    for (let i = 0; i < color.length; i++) {
        colorControllers.push(gui.add({
            type: 'color',
            params: color,
            property: i,
            onChange: draw
        }));
    }
};

// setting up the automaton

// destroy all cells
automaton.clear = function() {
    automaton.cells.length = 0;
};

// set initial cells, inside critical radius
automaton.setInitial = function(radius) {
    const radius2 = radius * radius;
    automaton.cells.forEach(cell => cell.setInitial(radius2));
};

// sort corners resulting from dual tiling and create array of coordinate pairs
automaton.sortCorners = function() {
    automaton.cells.forEach(cell => cell.sortCorners());
};

// drawing the cells of the automaton, and neighbor lines
automaton.draw = function() {
    if (automaton.drawCellLines) {
        SVG.groupAttributes.stroke = automaton.cellLineColor;
    } else {
        SVG.groupAttributes.stroke = 'none';
    }
    // if there is fill, it will be defined drawing each cell
    SVG.groupAttributes.fill = 'none';
    SVG.createGroup(SVG.groupAttributes);
    automaton.cells.forEach(cell => cell.draw());
    if (automaton.drawNeighborLines) {
        SVG.groupAttributes.stroke = automaton.neighborLineColor;
        SVG.groupAttributes.fill = 'none';
        SVG.createGroup(SVG.groupAttributes);
    automaton.cells.forEach(cell => cell.drawNeighborLines());


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

// add a cell dual to a tile: given by an array of corner coordinates, as for drawing the polygon
automaton.addDualCell = function(cornerCoordinates) {
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
    // each corner of the tile is the center of a cell of the automaton
    // get/create these cells, 
    // each of these cells has the center of the tile as a corner
    const cellsAtCorners = [];
    for (let i = 0; i < coordinatesLength; i += 2) {
        const newCell = automaton.getCellAt(cornerCoordinates[i], cornerCoordinates[i + 1]);
        newCell.addCorner(centerX, centerY);
        cellsAtCorners.push(newCell);
    }
    // add connections, each corner cell is connected to neighbors
    // by edges of the tile
    const cellsLength = cellsAtCorners.length;
    let lastCell = cellsAtCorners[cellsLength - 1];
    for (let i = 0; i < cellsLength; i++) {
        let currentCell = cellsAtCorners[i];
        currentCell.addNeighbor(lastCell);
        lastCell.addNeighbor(currentCell);
        lastCell = currentCell;
    }

    // find second nearest neighbors

    automaton.findNeighbors2=function(){
        console.log('nbs2')
        automaton.cells.forEach(cell=>cell.findNeighbors2());
    }
};