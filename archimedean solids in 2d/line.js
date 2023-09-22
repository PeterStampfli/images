/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    Circle
} from "./circle.js";

// n is normal vector to line, d is distance from origin, d>=0
// normalizes n, enforces d >= 0, normal vector pointing away from origin.
// point d*normalVector is on the line, the line is orthogonal to the normal vector and going through this point
// thus the definition is unique
export function Line(nX, nY, d) {
    const eps = 0.001;
    if (d < 0) {
        nX = -nX;
        nY = -nY;
        d = -d;
    }
    // if d approx 0, enforces nX>0 (for unique lines going through the origin), or ny>0
    if (d < eps) {
        if (Math.abs(nX) > eps) {
            if (nX < 0) {
                nX = -nX;
                nY = -nY;
            }
        } else {
            if (nY < 0) {
                nX = -nX;
                nY = -nY;
            }
        }
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
    const big = 10;
    let size = Circle.size;
    if (Circle.first) {
        Circle.first = false;
    } else {
        Circle.SCADtext += ',';
    }
    if (Circle.planar) {
        const px = this.d * this.nX;
        const py = this.d * this.nY;
        size=2*size;
        Circle.SCADtext += '\n';
        Circle.SCADtext += '[[' + prec(size * (px + big * this.nY)) + ',' + prec(size * (py - big * this.nX)) + ','+prec(-size/2)+'],' + '-1' + ',';
        Circle.SCADtext += '[' + prec(size * (px - big * this.nY)) + ',' + prec(size * (py + big * this.nX)) + ','+prec(-size/2)+']';
    } else {
        // invert line to the hyperbolic sphere with radius 1, we are now in three dimensions
        // inversion center at (0,0,1), radius sqrt(2)
        // this gives a great circle, center at origin, radius is hyperbolic radius = 1
        // normal is inside xy-plane, perpendicular to the line, thus same as normal to the line
        Circle.SCADtext += '\n';
        Circle.SCADtext += '[[0,0,0],' + prec(size) + ',[' + prec(this.nX) + ',' + prec(this.nY) + ',0]]';
    }
};

Line.prototype.draw = function() {
    const big = 1000;
    const px = this.d * this.nX;
    const py = this.d * this.nY;
    const length = (Circle.planar) ? big : Circle.size;
    SVG.createPolyline([px + length * this.nY, py - length * this.nX, px - length * this.nY, py + length * this.nX]);
};

// test if two lines are equal, if argument is not Line then they are also not equal
Line.prototype.equals = function(other) {
    const eps = 0.001;
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