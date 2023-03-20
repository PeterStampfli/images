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

const rt32 = Math.sqrt(3) / 2;

// length of side of triangles is equal to 1
triangleLattice.scale=220;
// number of tiles in each direction, radius for determining center cells(s)
triangleLattice.centerRadius = 0.1;
// shift, with respect to unit cell
triangleLattice.shiftX = 0;
triangleLattice.shiftY = 0.5/Math.sqrt(3);
// cutoff for nearest neighbors
triangleLattice.neighborCutoff = 1/Math.sqrt(3)+0.01;

function createPolygon(corners){
    const scaledCorners=[];
     const scale = main.scale;
   corners.forEach(corner=> scaledCorners.push(scale*corner));
  SVG.createPolygon(scaledCorners);   
}

// drawing for debugging, creating the automaton tiles is similar
function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    for (let j = -n; j <= n; j++) {
        const y = rt32 * j - triangleLattice.shiftY;
        const jMod2 = j / 2 - Math.floor(j / 2);
        for (let i = -n; i <= n; i++) {
            const x = i + jMod2 - triangleLattice.shiftX;
            let corners = [x+0.5,y,x,y+rt32,x-0.5,y];
            action(corners);
            corners = [x+0.5,y,x-0.5,y,x,y-rt32];
            action(corners);
        }
    }
};

// drawing for debugging, creating the automaton tiles is similar
triangleLattice.draw = function() {
     SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, triangleLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
triangleLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};