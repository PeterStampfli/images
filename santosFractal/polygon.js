/* jshint esversion: 6 */

import {
    ColorInput,
    output
}
from "../libgui/modules.js";

const epsilon = 0.01;

// polygon with corners, fillcolor, generation number
export const Polygon = function(generation) {
    this.cornersX = [];
    this.cornersY = [];
    this.generation = generation;
    this.red = 255;
    this.green = 255;
    this.blue = 255;
    this.alpha = 255;
};

// drawing options
Polygon.fill = true;
Polygon.stroke = true;
Polygon.vertices = true;
Polygon.lineColor = '#000000';
Polygon.lineWidth = 2;
Polygon.vertexSize = 0.02;
Polygon.initial = 'triangles';
Polygon.initial = 'quadrangles';
Polygon.additionalVertices = false;
Polygon.initialAddVertices = false;

// geometry options
Polygon.useOffset = false;
Polygon.generations = 2;
Polygon.symmetry = 5;
Polygon.subdivApproach = 'graphEuclidean';
Polygon.subdivApproach = 'mod 4';

// calculate center of polygon
Polygon.prototype.getCenter = function() {
    let centerX = 0;
    let centerY = 0;
    let length = this.cornersX.length;
    for (let i = 0; i < length; i++) {
        centerX += this.cornersX[i];
        centerY += this.cornersY[i];
    }
    centerX /= length;
    centerY /= length;
    return [centerX, centerY];
};

// adding a corner
Polygon.prototype.addCorner = function(x, y) {
    this.cornersX.push(x);
    this.cornersY.push(y);
};

// interpolate corners
// returns a point defined by its coordinates
Polygon.prototype.interpolate = function(t) {
    const result = {};
    const iLow = Math.floor(t);
    t -= iLow;
    result.x = this.cornersX[iLow] * (1 - t) + this.cornersX[iLow + 1] * t;
    result.y = this.cornersY[iLow] * (1 - t) + this.cornersY[iLow + 1] * t;
    return result;
};

// add an interpolated corner
Polygon.prototype.addInterpolatedCorner = function(parent, t) {
    const c = parent.interpolate(t);
    this.addCorner(c.x, c.y);
};

// make initial triangles, one for each side
Polygon.prototype.initialTriangles = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    const nChilds = this.cornersX.length;
    // repeat first point
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5);
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
        }
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        p.addCorner(this.cornersX[i + 1], this.cornersY[i + 1]);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i + 1]), 0.5 * (centerY + this.cornersY[i + 1]));
        }
        p.subdivide();
    }
};

// make initial pseudo quadrangles, one for each side
Polygon.prototype.initialPseudoQuadrangles = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    const nChilds = this.cornersX.length;
    // repeat first point (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5);
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
        }
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        p.addCorner(0.5 * (this.cornersX[i] + this.cornersX[i + 1]), 0.5 * (this.cornersY[i] + this.cornersY[i + 1]));
        p.addCorner(this.cornersX[i + 1], this.cornersY[i + 1]);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i + 1]), 0.5 * (centerY + this.cornersY[i + 1]));
        }
        p.subdivide();
    }
};

// make initial double triangles, two for each side
Polygon.prototype.initialDoubleTriangles = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    const nChilds = this.cornersX.length;
    // repeat first point (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5);
    for (let i = 0; i < nChilds; i++) {
        const midX = 0.5 * (this.cornersX[i] + this.cornersX[i + 1]);
        const midY = 0.5 * (this.cornersY[i] + this.cornersY[i + 1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        if (addVertices) {
            p1.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
        }
        p1.addCorner(this.cornersX[i], this.cornersY[i]);
        p1.addCorner(midX, midY);
        if (addVertices) {
            p1.addCorner(0.5 * (centerX + midX), 0.5 * (centerY + midY));
        }
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        if (addVertices) {
            p2.addCorner(0.5 * (centerX + this.cornersX[i + 1]), 0.5 * (centerY + this.cornersY[i + 1]));
        }
        p2.addCorner(this.cornersX[i + 1], this.cornersY[i + 1]);
        p2.addCorner(midX, midY);
        if (addVertices) {
            p2.addCorner(0.5 * (centerX + midX), 0.5 * (centerY + midY));
        }
        p2.subdivide();
    }
};

// make initial quadrangles, one for each corner
Polygon.prototype.initialQuadrangles = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    const nChilds = this.cornersX.length;
    // repeat first point and second (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    this.addCorner(this.cornersX[1], this.cornersY[1]);
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5);
    for (let i = 1; i <= nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cLow = this.interpolate(i - 0.5);
        let cHigh = this.interpolate(i + 0.5);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cLow.x), 0.5 * (centerY + cLow.y));
        }
        p.addCorner(cLow.x, cLow.y);
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        p.addCorner(cHigh.x, cHigh.y);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cHigh.x), 0.5 * (centerY + cHigh.y));
        }
        p.subdivide();
    }
};

// graph-euclidean subdivision
Polygon.prototype.graphEuclidean = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    let length = this.cornersX.length;
    // repeat first point and second (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    this.addCorner(this.cornersX[1], this.cornersY[1]);
    // subdivision of border
    // number of child polygons for fractal all the same
    const nChilds = Polygon.symmetry;
    const addVertices = Polygon.additionalVertices && (nChilds >= 5);
    const delta = length / nChilds;
    for (let i = 0; i < nChilds; i++) {
        const tLow = i * delta;
        const tHigh = tLow + delta;
        // indices to parent tile corners/vertices between
        // interpolated new vertices
        const jLow = Math.floor(tLow + epsilon) + 1;
        const jHigh = Math.floor(tHigh - epsilon);
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cLow = this.interpolate(tLow);
        let cHigh = this.interpolate(tHigh);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cLow.x), 0.5 * (centerY + cLow.y));
        }
        p.addCorner(cLow.x, cLow.y);
        // there should be at most one parent corner (vertex) between
        // the two interpolated corners
        if ((jHigh - jLow) >= 1) {
            alert('subdivide: more than one parent corner between new interpolated corners');
        } else if (jHigh === jLow) {
            // one parent corner between new corners, add to new polygon
            p.addCorner(this.cornersX[jLow], this.cornersY[jLow]);
        } else {
            // add a vertex between the interpolated ones to get a quadrilateral
            p.addCorner(0.5 * (cLow.x + cHigh.x), 0.5 * (cLow.y + cHigh.y));
        }
        p.addCorner(cHigh.x, cHigh.y);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cHigh.x), 0.5 * (centerY + cHigh.y));
        }
        p.subdivide();
    }
};

// mod 3 subdivision for 5 childs
Polygon.prototype.mod3for5 = function() {
    let length = this.cornersX.length;
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(0.5 * (this.cornersX[0] + this.cornersX[1]), 0.5 * (this.cornersY[0] + this.cornersY[1]));
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[0], this.cornersY[0]);
        p2.addCorner(0.5 * (this.cornersX[0] + this.cornersX[2]), 0.5 * (this.cornersY[0] + this.cornersY[2]));
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.addCorner(0.5 * (this.cornersX[0] + this.cornersX[2]), 0.5 * (this.cornersY[0] + this.cornersY[2]));
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[1], this.cornersY[1]);
        p4.addCorner(0.5 * (this.cornersX[0] + this.cornersX[1]), 0.5 * (this.cornersY[0] + this.cornersY[1]));
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[1], this.cornersY[1]);
        p5.addCorner(this.cornersX[2], this.cornersY[2]);
        p5.subdivide();
    }
};

// mod 3 ubdivision for 6 childs
Polygon.prototype.mod3for6 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[0] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[0] + this.cornersY[2]);
        let midX12 = 0.5 * (this.cornersX[2] + this.cornersX[1]);
        let midY12 = 0.5 * (this.cornersY[2] + this.cornersY[1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX1, midY1);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.addCorner(midX12, midY12);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX12, midY12);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[2], this.cornersY[2]);
        p5.addCorner(midX2, midY2);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(this.cornersX[0], this.cornersY[0]);
        p6.addCorner(midX2, midY2);
        p6.subdivide();
    } else if (length === 4) {

    }
};

// mod 4 ubdivision for 5 childs
Polygon.prototype.mod4for5 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[0] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[0] + this.cornersY[2]);
        let midX12 = 0.5 * (this.cornersX[2] + this.cornersX[1]);
        let midY12 = 0.5 * (this.cornersY[2] + this.cornersY[1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX1, midY1);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.addCorner(midX12, midY12);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX12, midY12);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[2], this.cornersY[2]);
        p5.addCorner(midX2, midY2);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(this.cornersX[0], this.cornersY[0]);
        p6.addCorner(midX2, midY2);
        p6.subdivide();
    } else if (length === 4) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[1] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[1] + this.cornersY[2]);
        let midX3 = 0.5 * (this.cornersX[2] + this.cornersX[3]);
        let midY3 = 0.5 * (this.cornersY[2] + this.cornersY[3]);
        let midX4 = 0.5 * (this.cornersX[3] + this.cornersX[0]);
        let midY4 = 0.5 * (this.cornersY[3] + this.cornersY[0]);
        const p0 = new Polygon(this.generation + 1);
        p0.addCorner(centerX, centerY);
        p0.addCorner(midX1, midY1);
        p0.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p0.addCorner(this.cornersX[0], this.cornersY[0]);
        p0.subdivide();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(0.5 * (this.cornersX[0] + midX4), 0.5 * (this.cornersY[0] + midY4));
        p1.addCorner(midX4, midY4);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX2, midY2);
        p2.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(midX2, midY2);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX3, midY3);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(midX3, midY3);
        p5.addCorner(this.cornersX[3], this.cornersY[3]);
        p5.addCorner(midX4, midY4);
        p5.subdivide();
    }
};

// mod 4 subdivision for 6 childs
Polygon.prototype.mod4for6 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    if (length === 3) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[0] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[0] + this.cornersY[2]);
        let midX12 = 0.5 * (this.cornersX[2] + this.cornersX[1]);
        let midY12 = 0.5 * (this.cornersY[2] + this.cornersY[1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(0.5 * (this.cornersX[1] + midX1), 0.5 * (this.cornersY[1] + midY1));
        p2.addCorner(midX1, midY1);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.addCorner(0.5 * (this.cornersX[1] + midX12), 0.5 * (this.cornersY[1] + midY12));
        p3.addCorner(midX12, midY12);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(0.5 * (this.cornersX[2] + midX12), 0.5 * (this.cornersY[2] + midY12));
        p4.addCorner(midX12, midY12);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[2], this.cornersY[2]);
        p5.addCorner(0.5 * (this.cornersX[2] + midX2), 0.5 * (this.cornersY[2] + midY2));
        p5.addCorner(midX2, midY2);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(this.cornersX[0], this.cornersY[0]);
        p6.addCorner(0.5 * (this.cornersX[0] + midX2), 0.5 * (this.cornersY[0] + midY2));
        p6.addCorner(midX2, midY2);
        p6.subdivide();
    } else if (length === 4) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[1] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[1] + this.cornersY[2]);
        let midX3 = 0.5 * (this.cornersX[2] + this.cornersX[3]);
        let midY3 = 0.5 * (this.cornersY[2] + this.cornersY[3]);
        let midX4 = 0.5 * (this.cornersX[3] + this.cornersX[0]);
        let midY4 = 0.5 * (this.cornersY[3] + this.cornersY[0]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(midX1, midY1);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX4, midY4);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(0.5 * (this.cornersX[1] + midX1), 0.5 * (this.cornersY[1] + midY1));
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(0.5 * (this.cornersX[1] + midX2), 0.5 * (this.cornersY[1] + midY2));
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(midX2, midY2);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX3, midY3);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(midX3, midY3);
        p5.addCorner(0.5 * (this.cornersX[3] + midX3), 0.5 * (this.cornersY[3] + midY3));
        p5.addCorner(this.cornersX[3], this.cornersY[3]);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(midX4, midY4);
        p6.addCorner(0.5 * (this.cornersX[3] + midX4), 0.5 * (this.cornersY[3] + midY4));
        p6.addCorner(this.cornersX[3], this.cornersY[3]);
        p6.subdivide();
    }
};

// mod 4 subdivision for 7 childs
Polygon.prototype.mod4for7 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    if (length === 3) {} else if (length === 4) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[1] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[1] + this.cornersY[2]);
        let midX3 = 0.5 * (this.cornersX[2] + this.cornersX[3]);
        let midY3 = 0.5 * (this.cornersY[2] + this.cornersY[3]);
        let midX4 = 0.5 * (this.cornersX[3] + this.cornersX[0]);
        let midY4 = 0.5 * (this.cornersY[3] + this.cornersY[0]);
        const p0 = new Polygon(this.generation + 1);
        p0.addCorner(centerX, centerY);
        p0.addCorner(midX1, midY1);
        p0.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p0.addCorner(this.cornersX[0], this.cornersY[0]);
        p0.subdivide();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(0.5 * (this.cornersX[0] + midX4), 0.5 * (this.cornersY[0] + midY4));
        p1.addCorner(midX4, midY4);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(0.5 * (this.cornersX[1] + midX1), 0.5 * (this.cornersY[1] + midY1));
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(0.5 * (this.cornersX[1] + midX2), 0.5 * (this.cornersY[1] + midY2));
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(midX2, midY2);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX3, midY3);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(midX3, midY3);
        p5.addCorner(0.5 * (this.cornersX[3] + midX3), 0.5 * (this.cornersY[3] + midY3));
        p5.addCorner(this.cornersX[3], this.cornersY[3]);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(midX4, midY4);
        p6.addCorner(0.5 * (this.cornersX[3] + midX4), 0.5 * (this.cornersY[3] + midY4));
        p6.addCorner(this.cornersX[3], this.cornersY[3]);
        p6.subdivide();
    }
};

// subdivide the polygon or show
Polygon.prototype.subdivide = function() {
    if (this.generation >= Polygon.generations) {
        this.draw();
    } else {
        const nChilds = Polygon.symmetry;
        switch (Polygon.subdivApproach) {
            case 'graphEuclidean':
                this.graphEuclidean();
                break;
            case 'mod 3':
                switch (nChilds) {
                    case 5:
                        this.mod3for5();
                        break;
                    case 6:
                        this.mod3for6();
                        break;
                }
                break;
            case 'mod 4':
                switch (nChilds) {
                    case 5:
                        this.mod4for5();
                        break;
                    case 6:
                        this.mod4for6();
                        break;
                    case 7:
                        this.mod4for7();
                        break;
                }
                break;
        }
    }
};

// draw the polygon
Polygon.prototype.draw = function() {
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    canvasContext.beginPath();
    canvasContext.moveTo(this.cornersX[0], this.cornersY[0]);
    const length = this.cornersX.length;
    for (let i = 1; i <= length; i++) {
        canvasContext.lineTo(this.cornersX[i], this.cornersY[i]);
    }
    canvasContext.closePath();
    if (Polygon.fill) {
        canvasContext.fillStyle = ColorInput.stringFromObject(this);
        canvasContext.fill();
    }
    if (Polygon.stroke) {
        canvasContext.strokeStyle = Polygon.lineColor;
        canvasContext.stroke();
    } else if (Polygon.fill) {
        canvasContext.strokeStyle = ColorInput.stringFromObject(this);
        canvasContext.stroke();
    }
    if (Polygon.vertices) {
        canvasContext.fillStyle = Polygon.lineColor;
        for (let i = 0; i <= length; i++) {
            canvasContext.beginPath();
            canvasContext.arc(this.cornersX[i], this.cornersY[i], Polygon.vertexSize, 0, 2 * Math.PI);
            canvasContext.fill();
        }
    }
};

// create regular polygon with n corners, generation 0

Polygon.createRegular = function(n) {
    const polygon = new Polygon(0);
    for (let i = 0; i < n; i++) {
        const angle = 2 * i * Math.PI / n;
        polygon.addCorner(Math.sin(angle), Math.cos(angle));
    }
    return polygon;
};