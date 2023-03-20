/* jshint esversion: 6 */
import {
    Cell
}
from "./cell.js";

// a collection of cells for a quasiperiodic automaton

export const automaton = {};

automaton.cells = [];

automaton.clear = function() {
    automaton.cells.length = 0;
};

automaton.findCenterCell = function() {
    let minr2 = 1e10;
    let result = automaton.cells[0];
    const length = automaton.cells.length;
    for (let i = 0; i < length; i++) {
        const cell = automaton.cells[i];
        const r2 = cell.centerX * cell.centerX + cell.centerY * cell.centerY;
        if (r2 < minr2) {
            minr2 = r2;
            result = cell;
        }
    }
    return result;
};

automaton.setLimit = function(r) {
    automaton.r = r;
    automaton.r2 = r * r;
};

// prepare cells for drawing, at construction
automaton.prepareDrawing = function() {
    automaton.cells.forEach(cell => cell.prepareDrawing());
};

// drawing the cells of the automaton
automaton.draw = function() {
    automaton.cells.forEach(cell => cell.draw());
};

// add a cell at given place if not already there, return the cell
automaton.cellAt = function(x, y) {
    let index = automaton.cells.findIndex((element) => element.isAt(x, y));
    if (index < 0) {
        index = automaton.cells.length;
        automaton.cells.push(new Cell(x, y));
    }
    return automaton.cells[index];
};

// add a dual to a cell: given by an array of corner coordinates, as for drawing the polygon
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
    if (centerX * centerX + centerY * centerY > automaton.r2) {
        return;
    }
    // each corner of the tile is the center of a cell of the automaton
    // get/create these cells, 
    // each of these cells has the center of the tile as a corner
    const cellsAtCorners = [];
    for (let i = 0; i < coordinatesLength; i += 2) {
        const newCell = automaton.cellAt(cornerCoordinates[i], cornerCoordinates[i + 1]);
        newCell.addCorner(centerX, centerY);
        cellsAtCorners.push(newCell);
    }
    // add connections, each corner cell is connected to neighbors
    const cellsLength = cellsAtCorners.length;
    let lastCell = cellsAtCorners[cellsLength - 1];
    for (let i = 0; i < cellsLength; i++) {
        let currentCell = cellsAtCorners[i];
        currentCell.addNeighbor(lastCell);
        lastCell.addNeighbor(currentCell);
        lastCell = currentCell;
    }
};

// running the automaton

automaton.reset = function(centerState) {
    automaton.cells.forEach(cell => cell.setState(0));
    const centerCell = automaton.findCenterCell();
    centerCell.setState( centerState);
};

automaton.advance = function() {


    automaton.cells.forEach(cell => cell.sumNeighborStates());


    automaton.cells.forEach(cell => cell.transition());
};
