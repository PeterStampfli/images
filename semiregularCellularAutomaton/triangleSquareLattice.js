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

export const triangleSquareLattice = {};

// length of side of triangles is equal to 1
// number of tiles in each direction, radius for determining center cells(s)
triangleSquareLattice.nTiles = 3;
triangleSquareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
triangleSquareLattice.shiftX = 0;
triangleSquareLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
triangleSquareLattice.neighborCutoff = 0.51+0.5/Math.sqrt(3);

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(triangleSquareLattice.nTiles / 2);
    for (let j = -n; j <= n; j++) {
        const y0 = 0.5 * j - triangleSquareLattice.shiftY;
        const x0 = (1 + rt32) * j - triangleSquareLattice.shiftX;
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = x0 - 0.5 * i;
            const y = y0 + (1 + rt32) * i;
            let corners = [x - 0.5, y - 0.5, x + 0.5, y - 0.5, x + 0.5, y + 0.5, x - 0.5, y + 0.5];
            action(corners);
            corners = [x + 0.5, y + 0.5, x + 0.5 + rt32, y + 1, x + rt32, y + 1 + rt32, x, y + 0.5 + rt32];
            action(corners);
            corners = [x + 0.5, y + 0.5, x + 0.5, y - 0.5, x + 0.5 + rt32, y];
            action(corners);
            corners = [x + 0.5, y + 0.5, x + 0.5 + rt32, y, x + 0.5 + rt32, y + 1];
            action(corners);
            corners = [x + 0.5, y + 0.5, x - 0.5, y + 0.5, x, y + 0.5 + rt32];
            action(corners);corners = [ x - 0.5, y + 0.5, x, y + 0.5 + rt32,x-1,y+0.5+rt32];
            action(corners);
        }
    }
}

triangleSquareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, triangleSquareLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
triangleSquareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};