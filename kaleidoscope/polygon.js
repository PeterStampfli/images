/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    Side
} from './modules.js';

/**
 * polygon surrounding a region
 * @constructor Polygon
 */
export function Polygon() {
    this.corners = [];
    this.sides = [];
    // boundary
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;
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

/**
 * determine the boundary parameters
 * @method Polygon#determineBoundary
 */
Polygon.prototype.determineBoundary = function() {
    const length = this.corners.length;
    if (length > 0) {
        let corner = this.corners[0];
        this.top = corner.y;
        this.bottom = corner.y;
        this.left = corner.x;
        this.right = corner.x;
        for (var i = 1; i < length; i++) {
            corner = this.corners[i];
            this.top = Math.max(this.top, corner.y);
            this.bottom = Math.min(this.bottom, corner.y);
            this.left = Math.min(this.left, corner.x);
            this.right = Math.max(this.right, corner.x);
        }
    } else {
        console.error('Polygon#determineBoundary: There are no corners');
        console.log(this);
    }
};

/**
 * make the sides of the polygon
 * @method Polygon#makeSides
 */
Polygon.prototype.makeSides = function() {
    const length = this.corners.length;
    this.sides.length = 0;
    if (length > 1) {
        this.sides.push(new Side(this.corners[0], this.corners[length - 1]));
        for (var i = 1; i < length; i++) {
            this.sides.push(new Side(this.corners[i], this.corners[i - 1]));
        }
    } else {
        console.error('Polygon#makeSides: There are less than 2 corners');
        console.log(this);
    }
};

/**
* determine if a point is inside the polygon
* @method Polygon#isInside
* @param {Object} point - with x- and y-fields
* @return boolean, true if point is inside
*/
Polygon.prototype.isInside=function(point){
// check the bounding rectangle
if ((point.x<this.left)||(point.x>this.right)||(point.y<this.bottom)||(point.y>this.top)){
	return false;
}

return true;

};

// shifting polygon corners towards the center for drawing
// 0 means no shift, 1 means all ccorners are at the center
Polygon.drawShift = 0.1;
Polygon.lineWidth = 3;
Polygon.color = '#ff8800';

Polygon.point={};

/**
 * draw the polygon
 * corners are shifted towards the center to show polygons sharing edges
 * @method Polygon#draw
 */
Polygon.prototype.draw = function() {


if (!this.isInside(Polygon.point)){
	return;
}

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

    this.makeSides();

};