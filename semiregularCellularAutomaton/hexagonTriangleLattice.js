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

export const hexagonTriangleLattice = {};

// length of side of triangles is equal to 1
// number of tiles in each direction, radius for determining center cells(s)
hexagonTriangleLattice.nTiles = 3;
hexagonTriangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
hexagonTriangleLattice.shiftX = 0;
hexagonTriangleLattice.shiftY = 0;
// other shift for 3fold symmetry
// hexagonTriangleLattice.shiftY = 2/Math.sqrt(3);
// cutoff for 2nd nearest neighbors
hexagonTriangleLattice.neighbor2Cutoff = 2.01;
hexagonTriangleLattice.neighborCutoff = 2/Math.sqrt(3)+0.01;

const rt32 = Math.sqrt(3) / 2;

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(hexagonTriangleLattice.nTiles / 2);
    for (let j = -n; j <= n; j++) {
        const y = 2 * rt32 * j - hexagonTriangleLattice.shiftY;
        const jMod2 = j - 2 * Math.floor(j / 2);
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = 2 * i + jMod2 - hexagonTriangleLattice.shiftX;
            let corners = [x + 0.5, y - rt32, x + 1.5, y - rt32, x + 1, y];
            action(corners);
            corners = [x + 0.5, y + rt32, x + 1.5, y + rt32, x + 1, y];
            action(corners);
            corners = [x - 0.5, y - rt32, x + 0.5, y - rt32, x + 1, y, x + 0.5, y + rt32, x - 0.5, y + rt32, x - 1, y];
            action(corners);
        }
    }
}

hexagonTriangleLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};
