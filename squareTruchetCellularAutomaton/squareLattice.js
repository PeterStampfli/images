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
    /*const n = Math.floor(main.size / 2);
    main.scale=0.99*main.svgSize/(2*n+1);
    for (let i = -n; i <= n; i++) {
        const x = i - squareLattice.shiftX;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = j - squareLattice.shiftY;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            action(corners,i+j);
        }
    }
    */

    const n = 2 * main.size;
    const size = main.size;
    main.scale = 0.99 * main.svgSize / n;
    for (let i = 0; i < n; i++) {
        const x = i - size;
        for (let j = 0; j < n; j++) {
            // lower left corner
            const y = j - size;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            action(corners, i + j);
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

function createCell(corners, iPlusJ) {
    const cell = automaton.addCell(corners, squareLattice.neighborCutoff);
    cell.positionParity = iPlusJ % 2;
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
squareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
};

squareLattice.newInitialCell = function() {
    if (automaton.initialCell === 1) {
        automaton.setInitial(0.8);
    } else {
        automaton.setInitialAt(0.5, 0.5);
    }
};