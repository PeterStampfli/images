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

// length of side of triangles is equal to 1
// number of tiles in each direction, radius for determining center cells(s)
manyHexagonsTriangleLattice.nTiles = 3;
manyHexagonsTriangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
manyHexagonsTriangleLattice.shiftX = 0;
manyHexagonsTriangleLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
manyHexagonsTriangleLattice.neighbor2Cutoff = 1.5;
manyHexagonsTriangleLattice.neighborCutoff = 1.1;

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(manyHexagonsTriangleLattice.nTiles / 2);
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
    SVG.groupAttributes.fill = '#bbbbbb';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};