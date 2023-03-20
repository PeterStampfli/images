/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main
} from "./main.js";

import {
    automaton
} from "./automaton.js";

export const squareLattice = {};

// length of side of squares is equal to 1, same as periodicity
squareLattice.scale=200;
// radius for determining center cells(s)
squareLattice.centerRadius = 0.8;
// shift, with respect to unit cell
squareLattice.shiftX = 0.5;
squareLattice.shiftY = 0.5;
// cutoff for neighbors
squareLattice.neighborCutoff = 1.1;


function drawPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    console.log(scale);
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = 2*main.size;
    const size=main.size;
    main.scale=7900/n;
    for (let i = 0; i < n; i++) {
        const x = i - size
        for (let j = 0; j < n; j++) {
            // lower left corner
            const y = j - size;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            action(corners,i+j);
        }
    }
}

// drawing for debugging, creating the automaton tiles is similar
squareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(drawPolygon);
};

function createCell(corners,iPlusJ) {
   const cell= automaton.addCell(corners, squareLattice.neighborCutoff);
    cell.positionParity=iPlusJ%2;
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
squareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.8);
};