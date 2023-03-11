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
// number of tiles in each direction, radius for determining center cells(s)
squareLattice.nTiles = 3;
squareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
squareLattice.shiftX = 0.5;
squareLattice.shiftY = 0.5;
// cutoff for neighbors
squareLattice.neighborCutoff = 1.1;


function drawPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(squareLattice.nTiles / 2);
    for (let i = -n; i <= n; i++) {
        const x = i - squareLattice.shiftX;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = j - squareLattice.shiftY;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            action(corners);
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

function createCell(corners) {
    automaton.addCell(corners, squareLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
squareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};