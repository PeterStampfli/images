
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





const a=automaton.cellAt(1,2);
const b=automaton.cellAt(3,2);
const d=automaton.cellAt(1,3);
const e=automaton.cellAt(1,2);


console.log(a===e);
console.log(a===b);

a.addNeighbor(b);
a.addNeighbor(d);
a.addNeighbor(d);
console.log(a);

automaton.addTile([0,0,1,2,11,22])
