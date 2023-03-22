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

export const dodecagonTriangleLattice = {};

// number of tiles in each direction, radius for determining center cells(s)
dodecagonTriangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
dodecagonTriangleLattice.shiftX = 0;
dodecagonTriangleLattice.shiftY = 0;
// cutoff for 2nd nearest neighbors
dodecagonTriangleLattice.neighborCutoff = 2.01+Math.sqrt(3);

const rt32 = Math.sqrt(3) / 2;
const rt3=Math.sqrt(3);

function createPolygon(corners) {
    const scaledCorners = [];
    const scale = main.scale;
    corners.forEach(corner => scaledCorners.push(scale * corner));
    SVG.createPolygon(scaledCorners);
}

function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    main.scale=0.99*main.svgSize/(2*n+1)/(1.5+rt3);
    for (let j = -n; j <= n; j++) {
        const y = (1.5+rt3) * j - dodecagonTriangleLattice.shiftY;
        const jMod2 = (1+rt32)*(j - 2 * Math.floor(j / 2));
        for (let i = -n; i <= n; i++) {
            // lower left corner
            const x = (2+rt3) * i + jMod2 - dodecagonTriangleLattice.shiftX;
            let corners = [x + 0.5+rt32, y+0.5+rt32,x+1+rt32,y+0.5,x + 1.5+rt32, y+0.5+rt32];
            action(corners);
            corners = [x + 0.5+rt32, y-0.5-rt32,x+1+rt32,y-0.5,x + 1.5+rt32, y-0.5-rt32];
            action(corners);
            corners = [x - 0.5-rt32, y-0.5-rt32,x-0.5,y-1-rt32,x+0.5,y-1-rt32,x + 0.5+rt32, y-0.5-rt32,x+1+rt32,y-0.5,x+1+rt32,y+0.5,x + 0.5+rt32, y+0.5+rt32,x+0.5,y+1+rt32,x-0.5,y+1+rt32,x - 0.5-rt32, y+0.5+rt32,x-1-rt32,y+0.5,x-1-rt32,y-0.5];
            action(corners);
        }
    }
}

dodecagonTriangleLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, dodecagonTriangleLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
dodecagonTriangleLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};