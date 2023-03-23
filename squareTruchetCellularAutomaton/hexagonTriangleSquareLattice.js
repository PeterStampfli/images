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

export const hexagonTriangleSquareLattice = {};

// number of tiles in each direction, radius for determining center cells(s)
hexagonTriangleSquareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
hexagonTriangleSquareLattice.shiftX = 0;
hexagonTriangleSquareLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
hexagonTriangleSquareLattice.neighborCutoff = 1.1+1/Math.sqrt(3);

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(main.size / 4);
    main.scale=0.99*main.svgSize/(2*n+1)/(1.5+rt32);
    for (let j = -n; j <= n; j++) {
        const y = (1.5 + rt32) * j - hexagonTriangleSquareLattice.shiftY;
        const jMod2 = (0.5 + rt32) * (j - 2 * Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = (1 + rt3) * i + jMod2 - hexagonTriangleSquareLattice.shiftX;
            let corners = [x + rt32, y - 0.5, x + 1 + rt32, y - 0.5, x + 1 + rt32, y + 0.5, x + rt32, y + 0.5];
            action(corners);
            corners = [x + rt32, y - 0.5, x + 1 + rt32, y - 0.5, x + 0.5 + rt32, y - 0.5 - rt32];
            action(corners);
            corners = [x + rt32, y - 0.5, x + 0.5 + rt32, y - 0.5 - rt32, x + 0.5, y - 1 - rt32, x, y - 1];
            action(corners);
            corners = [x - rt32, y - 0.5, x - 0.5 - rt32, y - 0.5 - rt32, x - 0.5, y - 1 - rt32, x, y - 1];
            action(corners);
            corners = [x - 0.5, y - 1 - rt32, x, y - 1,x + 0.5, y - 1 - rt32];
            action(corners);
          corners = [x,y-1,x+rt32,y-0.5,x+rt32,y+0.5,x,y+1,x-rt32,y+0.5,x-rt32,y-0.5];
            action(corners);
        }
    }
}

hexagonTriangleSquareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, hexagonTriangleSquareLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
hexagonTriangleSquareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};

hexagonTriangleSquareLattice.newInitialCell = function() {
    automaton.setInitial(0.01);
};