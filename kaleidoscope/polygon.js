/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {

} from './modules.js';

/**
 * polygon surrounding a region
 * @constructor Polygon
 */
export function Polygon() {
    this.corners = [];
}

/**
 * add a corner
 * @method Polygon#addCorner
 * @param {Corner} corner
 */
Polygon.prototype.addCorner = function(corner) {
    const index = this.corners.indexOf(corner);
    if (index >= 0) {
        console.error('Polygon#addCorner: corner already there. It is:');
        console.log(corner);
    } else {
        this.corners.push(corner);
    }
};

// shifting polygon corners towards the center for drawing
// 0 means no shift, 1 means all ccorners are at the center
Polygon.drawShift = 0.1;
Polygon.lineWidth = 3;
Polygon.color = '#ff8800';

/**
 * draw the polygon
 * corners are shifted towards the center to show polygons sharing edges
 * @method Polygon#draw
 */
Polygon.prototype.draw = function() {
    var i;
    const context = output.canvasContext;
    const length = this.corners.length;
    if (length > 0) {
        let centerX = 0;
        let centerY = 0;
        for (i = 0; i < length; i++) {
            centerX += this.corners[i].x;
            centerY += this.corners[i].y;
        }
        centerX *= Polygon.drawShift / length;
        centerY *= Polygon.drawShift / length;
        const t = 1 - Polygon.drawShift;
        output.setLineWidth(Polygon.lineWidth);
        context.strokeStyle = Polygon.color;
        context.beginPath();
        context.moveTo(t * this.corners[0].x + centerX, t * this.corners[0].y + centerY);
        for (i = 1; i < length; i++) {
            context.lineTo(t * this.corners[i].x + centerX, t * this.corners[i].y + centerY);
        }
        context.closePath();
        context.stroke();
    }
};