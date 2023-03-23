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

export const rhombusLattice = {};

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

// number of tiles in each direction, radius for determining center cells(s)
rhombusLattice.centerRadius = 0.1;
// shift, with respect to unit cell
rhombusLattice.shiftX = 0;
rhombusLattice.shiftY = 0;
// cutoff for nearest neighbors
rhombusLattice.neighborCutoff = 0.5 * Math.sqrt(3) + 0.01;

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

// drawing for debugging, creating the automaton tiles is similar
function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    main.scale = 0.99 * main.svgSize / (2 * n + 1) / 1.5;
    for (let j = -n; j <= n; j++) {
        const y = 1.5 * j - rhombusLattice.shiftY;
        const jMod2 = rt3 * (j / 2 - Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            const x = rt3 * i + jMod2 - rhombusLattice.shiftX;
            let corners = [x, y, x + rt32, y - 0.5, x + rt3, y, x + rt32, y + 0.5];
            action(corners);
            corners = [x, y, x + rt32, y + 0.5, x + rt32, y + 1.5, x, y + 1];
            action(corners);
            corners = [x, y, x + rt32, y - 0.5, x + rt32, y - 1.5, x, y - 1];
            action(corners);
        }
    }
}

// drawing for debugging, creating the automaton tiles is similar
rhombusLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, rhombusLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
rhombusLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
};

rhombusLattice.newInitialCell = function() {
    automaton.setInitial(rt32 + 0.01);
};