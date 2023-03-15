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

export const pascalTriangle = {};

// length of side of triangles is equal to 1
pascalTriangle.scale=100;
// number of tiles in each direction, radius for determining center cells(s)
pascalTriangle.centerRadius = 0.1;
// shift, with respect to unit cell
pascalTriangle.shiftX = 0;
pascalTriangle.shiftY = 0;
// cutoff for 2nd nearest neighbors
pascalTriangle.neighbor2Cutoff = 3.01;
pascalTriangle.neighborCutoff = Math.sqrt(3)+0.01;

const rt32 = Math.sqrt(3) / 2;

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

var top;
function makeLattice(action) {
    const n = 2*Math.floor(main.size / 2);
    top = 1.5 * n - pascalTriangle.shiftY;
    for (let j = -n; j <= n; j++) {
        const y = 1.5 * j - pascalTriangle.shiftY;
        const jMod2 = rt32*(j - 2 * Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = 2 * rt32*i + jMod2 - pascalTriangle.shiftX;
            let corners = [x,y-1,x+rt32,y-0.5,x+rt32,y+0.5,x,y+1,x-rt32,y+0.5,x-rt32,y-0.5];
            action(corners);
        }
    }
}

pascalTriangle.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCellPascalTriangle(corners, pascalTriangle.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
pascalTriangle.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.setInitialAt(pascalTriangle.shiftX,top);
    const origin=automaton.getCellAt(pascalTriangle.shiftX,top);
    // make that the origin cell retains its value
    origin.neighbors.push(origin);
};