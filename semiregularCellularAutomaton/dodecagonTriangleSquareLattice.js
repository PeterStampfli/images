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

export const dodecagonTriangleSquareLattice = {};

// length of side of triangles is equal to 1
// number of tiles in each direction, radius for determining center cells(s)
dodecagonTriangleSquareLattice.nTiles = 3;
dodecagonTriangleSquareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
dodecagonTriangleSquareLattice.shiftX = 0;
dodecagonTriangleSquareLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
dodecagonTriangleSquareLattice.neighbor2Cutoff = 1.5;
dodecagonTriangleSquareLattice.neighborCutoff = 1.1;

const rt32 = Math.sqrt(3) / 2;
const rt3 = Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(dodecagonTriangleSquareLattice.nTiles / 2);
    for (let j = -n; j <= n; j++) {
        const y = (1.5 + 1.5 * rt3) * j - dodecagonTriangleSquareLattice.shiftY;
        const jMod2 = (1.5 + rt32) * (j - 2 * Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = (3 + rt3) * i + jMod2 - dodecagonTriangleSquareLattice.shiftX;
            let corners = [x - 0.5 - rt32, y - 0.5 - rt32, x - 0.5, y - 1 - rt32, x + 0.5, y - 1 - rt32, x + 0.5 + rt32, y - 0.5 - rt32, x + 1 + rt32, y - 0.5, x + 1 + rt32, y + 0.5, x + 0.5 + rt32, y + 0.5 + rt32, x + 0.5, y + 1 + rt32, x - 0.5, y + 1 + rt32, x - 0.5 - rt32, y + 0.5 + rt32, x - 1 - rt32, y + 0.5, x - 1 - rt32, y - 0.5];
            action(corners);
            corners = [x + 1 + rt32, y - 0.5, x + 2 + rt32, y - 0.5, x + 2 + rt32, y + 0.5, x + 1 + rt32, y + 0.5];
            action(corners);
            corners = [x + 1 + rt32, y + 0.5, x + 2 + rt32, y + 0.5, x + 2.5 + rt32, y + 0.5 + rt32, x + 2 + rt32, y + 0.5 + rt3, x + 1 + rt32, y + 0.5 + rt3, x + 0.5 + rt32, y + 0.5 + rt32];
            action(corners);
            corners = [  x + 0.5 + rt32, y + 0.5 + rt32,x + 1 + rt32, y + 0.5 + rt3,x+1,y+1+rt3,x+0.5,y+1+rt32];
            action(corners);
            corners = [x + 1 + rt32, y - 0.5, x + 2 + rt32, y - 0.5, x + 2.5 + rt32, y - 0.5 - rt32, x + 2 + rt32, y - 0.5 - rt3, x + 1 + rt32, y - 0.5 - rt3, x + 0.5 + rt32, y - 0.5 - rt32];
            action(corners);
            corners = [  x + 0.5 + rt32, y - 0.5 - rt32,x + 1 + rt32, y - 0.5 - rt3,x+1,y-1-rt3,x+0.5,y-1-rt32];
            action(corners);
        }
    }
}

dodecagonTriangleSquareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.fill = '#bbbbbb';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};