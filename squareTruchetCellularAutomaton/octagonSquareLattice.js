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

export const octagonSquareLattice = {};

// number of tiles in each direction, radius for determining center cells(s)
octagonSquareLattice.centerRadius = 0.1;
// shift, with respect to unit cell
octagonSquareLattice.shiftX = 0.5;
octagonSquareLattice.shiftY = 0.5;
// cutoff for 2nd nearest neighbors
octagonSquareLattice.neighborCutoff=2.1;

const s=1/(1+Math.sqrt(2));
const s2=s/Math.sqrt(2);

function createPolygon(corners){
    const scaledCorners=[];
     const scale = main.scale;
   corners.forEach(corner=> scaledCorners.push(scale*corner));
  SVG.createPolygon(scaledCorners);   
}

function makeLattice(action) {
    const n = Math.floor(main.size / 2);
    main.scale=0.99*main.svgSize/(2*n+1);
    for (let i = -n; i <= n; i++) {
        const x = i - octagonSquareLattice.shiftX;
        for (let j = -n; j <= n; j++) {
            // lower left corner
            const y = j - octagonSquareLattice.shiftY;
            let corners = [x, y-s2,x+s2,y,x,y+s2,x-s2,y];
            action(corners);
            corners = [x+s2,y,x+(1-s2),y,x+1,y+s2,x+1,y+(1-s2),x+(1-s2),y+1,x+s2,y+1,x,y+(1-s2),x,y+s2];
            action(corners);
        }
    }
};

octagonSquareLattice.draw = function() {
    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = main.tileLineColor;
    SVG.createGroup(SVG.groupAttributes);
    makeLattice(createPolygon);
};

function createCell(corners) {
    automaton.addCell(corners, octagonSquareLattice.neighborCutoff);
}

// create the tiles of the automaton as duals to the tiles of this lattice
// determine initial tile
octagonSquareLattice.createCells = function() {
    automaton.clear();
    makeLattice(createCell);
    automaton.findNeighbors2();
    automaton.setInitial(0.01);
};