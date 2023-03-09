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

// length of side of squares is equal to 1, same as periodicity
// number of tiles in each direction, radius for determining center cells(s)
squareLattice.nTiles = 3;
squareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
squareLattice.shiftX = 0.5;
squareLattice.shiftY = 0.5;
// cutoff for 2nd nearest neighbors
squareLattice.neighbor2Cutoff=1.5;
squareLattice.neighborCutoff=1.1;

// drawing for debugging, creating the automaton tiles is similar
squareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    const scale = main.scale;
    const side = scale;
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
    const n = Math.floor(squareLattice.nTiles / 2);
    automaton.clear();
    for (let i = -n; i <= n; i++) {
        const x = i - squareLattice.shiftX;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = j - squareLattice.shiftY;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            automaton.addDualCell(corners);
        }
    }
    automaton.sortCorners();
    automaton.findNeighbors2(squareLattice.neighbor2Cutoff);
};

// create the tiles of the automaton as duals to the tiles of this lattice
// svg scale is not used, use in drawing cells
squareLattice.createCells = function() {
    const n = Math.floor(squareLattice.nTiles / 2);
    automaton.clear();
    for (let i = -n; i <= n; i++) {
        const x = i - squareLattice.shiftX;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = j - squareLattice.shiftY;
            const corners = [x, y, x + 1, y, x + 1, y + 1, x, y + 1];
            // cutoff may depend on cell for semiregular tilings
            automaton.addCell(corners,squareLattice.neighborCutoff);
        }
    }
    automaton.sortCorners();
    automaton.findNeighbors2(squareLattice.neighbor2Cutoff);
};