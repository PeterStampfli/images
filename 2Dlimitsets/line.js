/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    main
}
from "./limitsets.js";

// n is normal vector to line, d is distance from origin
export function Line(nX, nY, d) {
    this.nX = nX;
    this.nY = nY;
    this.d = d;
}

const big=10000;

Line.prototype.draw=function(){
    const px=this.d*this.nX;
    const py=this.d*this.nY;
    SVG.createPolyline([px+big*this.nY,py-big*this.nX,px-big*this.nY,py+big*this.nX]);
}