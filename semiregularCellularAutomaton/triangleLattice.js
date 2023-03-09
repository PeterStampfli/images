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

export const triangleLattice = {};

// length of side of triangles is equal to 1
// number of tiles in each direction, radius for determining center cells(s)
triangleLattice.nTiles = 3;
triangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
triangleLattice.shiftX = 0.5;
triangleLattice.shiftY = 0.5;
// cutoff for 2nd nearest neighbors
triangleLattice.neighbor2Cutoff=1.5;
triangleLattice.neighborCutoff=1.1;

// drawing for debugging, creating the automaton tiles is similar
triangleLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    const scale = main.scale;
    const side = scale;
    const rt32=Math.sqrt(3)/2;
    const n = Math.floor(triangleLattice.nTiles / 2);
    for (let j = -n; j <= n; j++) {
        const y = rt32*(j - triangleLattice.shiftY) * side;
        const jMod2=j/2-Math.floor(j/2);
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = (i+jMod2 - triangleLattice.shiftY) * side;
            const corners = [x, y, x + side, y, x + side, y + side, x, y + side];
            SVG.createPolygon(corners);
        }
    }
};
