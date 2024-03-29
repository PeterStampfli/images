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

export const manyHexagonsTriangleLattice = {};

// number of tiles in each direction, radius for determining center cells(s)
manyHexagonsTriangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
manyHexagonsTriangleLattice.shiftX = 0;
manyHexagonsTriangleLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
manyHexagonsTriangleLattice.neighborCutoff = Math.sqrt(3)*0.5+0.5/Math.sqrt(3)+0.1;

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    main.scale=0.99*main.svgSize/(2*n+1)/0.5;
    for (let j = -n; j <= n; j++) {
        const y0 = 0.5 * j - manyHexagonsTriangleLattice.shiftY;
        const x0 = (3 * rt32) * j - manyHexagonsTriangleLattice.shiftX;
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = x0 + rt32 * i;
            const y = y0 + 2.5 * i;
            let corners = [x, y - 1, x + rt32, y - 0.5, x + rt32, y + 0.5, x, y + 1, x - rt32, y + 0.5, x - rt32, y - 0.5];
            action(corners);
            corners = [x + rt32, y - 0.5, x + rt32, y + 0.5, x + rt3, y];
            action(corners);
            corners = [x + rt32, y + 0.5, x + rt3, y, x + rt3, y + 1];
            action(corners);
            corners = [x + rt32, y - 0.5, x + rt3, y, x + rt3, y - 1];
            action(corners);
            corners = [x + rt32, y + 0.5, x + rt3, y + 1, x + rt32, y + 1.5];
            action(corners);
            corners = [x + rt32, y - 0.5, x + rt3, y - 1, x + rt32, y - 1.5];
            action(corners);
            corners = [x + rt32, y + 1.5, x, y + 2, x, y + 1];
            action(corners);
            corners = [x, y + 1, x+rt32,y+0.5,x+rt32, y +1.5];
            action(corners);
             corners = [x, y - 1, x+rt32,y-0.5,x+rt32, y -1.5];
            action(corners);
        }
    }
}

manyHexagonsTriangleLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, manyHexagonsTriangleLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
manyHexagonsTriangleLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
};

manyHexagonsTriangleLattice.newInitialCell = function() {
    automaton.setInitial(0.01);
};