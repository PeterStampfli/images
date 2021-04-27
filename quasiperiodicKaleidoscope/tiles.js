/* jshint esversion: 6 */

import {
    Lines,
    Areas
}
from "./modules.js";

/**
* making tiles for drawing 
* areas, markers, borders, subBorders, hyperBorders
* @namespace tiles
*/

export const tiles={};

// the areas come from extern
// tiles hat die anderen elemente

const borders=new Lines({color:'#000000',lineWidth:2});