/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    Circle
} from "./circle.js";


const big = 10000;
const eps = 0.001;

// n is normal vector to line, d is distance from origin, d>=0
// normalizes n, enforces d >= 0
// if d near 0, enforces nX>0 (for unique lines going through the origin)
export function Line(nX, nY, d) {
    if (d < 0) {
        nX = -nX;
        nY = -nY;
        d = -d;
    }
    if ((d < eps) && (nX < 0)) {
        nX = -nX;
        nY = -nY;
    }
    const normFactor = 1 / Math.sqrt(nX * nX + nY * nY);
    this.nX = normFactor * nX;
    this.nY = normFactor * nY;
    this.d = d;
}

function prec(x) {
    return x.toPrecision(4);
}

Line.prototype.writeSCAD = function() {
    // export to Circle.SCADtext
    if (Circle.planar) {
        // planar, for comparision,...
        // can't do this
        // a line is a circle of infinite radius ...
    } else {
        // invert line to the hyperbolic sphere, we are now in three dimensions
        // inversion center at (0,0,rHyp), radius sqrt(2)*rHyp
        // this gives a great circle, center at origin, radius is hyperbolic radius
        // normal is inside xy-plane, perpendicular to the line
        if (Circle.first) {
            Circle.first = false;
        } else {
            Circle.SCADtext += ',';
        }
        Circle.SCADtext += '\n';
        Circle.SCADtext += '[[0,0,0],' + prec(Line.rHyp) + ',[' + prec(this.nX) + ',' + prec(this.nY) + ',0]]';
    }
};

Line.prototype.draw = function() {
    const px = this.d * this.nX;
    const py = this.d * this.nY;
    SVG.createPolyline([px + big * this.nY, py - big * this.nX, px - big * this.nY, py + big * this.nX]);
}

// test if two lines are equal, if argument is not Line then they are also not equal
Line.prototype.equals = function(other) {
    if (other instanceof Line) {
        if (Math.abs(other.nX - this.nX) > eps) {
            return false;
        }
        if (Math.abs(other.nY - this.nY) > eps) {
            return false;
        }
        if (Math.abs(other.d - this.d) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};