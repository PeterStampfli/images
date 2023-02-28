
/* jshint esversion: 6 */

import {
    Cell
}
from "./cell.js";

import {
    automaton
}
from "./automaton.js";

const eps = 0.01;



automaton.setLimit(100);



automaton.addTile([0,0,1,2,11,22]);
automaton.addTile([0,0,1,2,-3,-4]);
automaton.addTile([0,0,1,2,110000,22]);
automaton.prepareDrawing();

console.log(automaton.cells);
