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

export const hexagonLattice = {};

// length of side of triangles is equal to 1
hexagonLattice.scale=129;
// number of tiles in each direction, radius for determining center cells(s)
hexagonLattice.centerRadius = 0.1;
// shift, with respect to unit cell
hexagonLattice.shiftX = 0;
hexagonLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
hexagonLattice.neighbor2Cutoff = 3.01;
hexagonLattice.neighborCutoff = Math.sqrt(3)+0.01;

const rt32 = Math.sqrt(3) / 2;

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    for (let j = -n; j <= n; j++) {
        const y = 1.5 * j - hexagonLattice.shiftY;
        const jMod2 = rt32*(j - 2 * Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = 2 * rt32*i + jMod2 - hexagonLattice.shiftX;
            let corners = [x,y-1,x+rt32,y-0.5,x+rt32,y+0.5,x,y+1,x-rt32,y+0.5,x-rt32,y-0.5];
            action(corners);
        }
    }
}

hexagonLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, hexagonLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
hexagonLattice.createCells = function() {
    const n = Math.floor(hexagonLattice.nTiles / 2);
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2(hexagonLattice.neighbor2Cutoff);
    automaton.setInitial(0.01);
};