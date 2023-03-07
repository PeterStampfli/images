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

// length of side of squares, number of tiles in each direction, radius for determining center ceells(s)
squareLattice.side = 1;
squareLattice.nTiles = 3;
squareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
squareLattice.shiftX = 0.5;
squareLattice.shiftY = 0.5;

// drawing for debugging, creating the automaton tiles is similar
squareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    const scale = main.scale;
    const side = scale * squareLattice.side;
    const n = Math.floor(squareLattice.nTiles / 2);
    for (let i = -n; i <= n; i++) {
        const x = (i - squareLattice.shiftX) * side;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = (j - squareLattice.shiftY) * side;
            const corners = [x, y, x + side, y, x + side, y + side, x, y + side];
            SVG.createPolygon(corners);
        }
    }
};

// create the tiles of the automaton as duals to the tiles of this lattice
// svg scale is not used, use in drawing cells
squareLattice.createDualCells = function() {
    const side = squareLattice.side;
    const n = Math.floor(squareLattice.nTiles / 2);
    automaton.clear();
    for (let i = -n; i <= n; i++) {
        const x = (i - squareLattice.shiftX) * side;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = (j - squareLattice.shiftY) * side;
            const corners = [x, y, x + side, y, x + side, y + side, x, y + side];
            automaton.addDualCell(corners);
        }
    }
    automaton.sortCorners();
};