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
triangleLattice.neighbor2Cutoff = 1.5;
triangleLattice.neighborCutoff = 1.1;

const rt32 = Math.sqrt(3) / 2;


function createPolygon(corners){
    const scaledCorners=[];
     const scale = main.scale;
   corners.forEach(corner=> scaledCorners.push(scale*corner));
  SVG.createPolygon(scaledCorners);   
}

// drawing for debugging, creating the automaton tiles is similar
function makeLattice(action) {
    const n = Math.floor(triangleLattice.nTiles / 2);
    for (let j = -n; j <= n; j++) {
        const y = rt32 * (j - triangleLattice.shiftY);
        const jMod2 = j / 2 - Math.floor(j / 2);
        for (let i = -n; i <= n; i++) {
            const x = i + jMod2 - triangleLattice.shiftY;
            const corners = [x+0.5,y,x,y+rt32,x-0.5,y];
            action(corners);
            corners[3] = y-rt32;
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