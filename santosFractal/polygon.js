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
Polygon.additionalVertices = false;
Polygon.initialAddVertices = true;

// geometry options
Polygon.useOffset = false;
Polygon.generations = 3;
Polygon.symmetry = 5;

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

// make initial triangles, one for each side
Polygon.prototype.initialTriangles = function() {
    // get center
    let centerX = 0;
    let centerY = 0;
    let length = this.cornersX.length;
    for (let i = 0; i < length; i++) {
        centerX += this.cornersX[i];
        centerY += this.cornersY[i];
    }
    centerX /= length;
    centerY /= length;
    // repeat first point and second (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    // subdivision of border
    // number of child polygons for fractal
    const nChilds = length;
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
    // get center
    let centerX = 0;
    let centerY = 0;
    let length = this.cornersX.length;
    for (let i = 0; i < length; i++) {
        centerX += this.cornersX[i];
        centerY += this.cornersY[i];
    }
    centerX /= length;
    centerY /= length;
    // repeat first point and second (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    // subdivision of border
    // number of child polygons for fractal
    const nChilds = length;
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

// make initial quadrangles, one for each corner
Polygon.prototype.initialQuadrangles = function() {
    // get center
    let centerX = 0;
    let centerY = 0;
    let length = this.cornersX.length;
    for (let i = 0; i < length; i++) {
        centerX += this.cornersX[i];
        centerY += this.cornersY[i];
    }
    centerX /= length;
    centerY /= length;
    // repeat first point and second (interpolation)
    this.addCorner(this.cornersX[0], this.cornersY[0]);
    this.addCorner(this.cornersX[1], this.cornersY[1]);
    // subdivision of border
    // number of child polygons for fractal
    const nChilds = length;
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

// subdivide the polygon or show
Polygon.prototype.subdivide = function() {
    if (this.generation >= Polygon.generations) {
        this.draw();
    } else {
        // get center
        let centerX = 0;
        let centerY = 0;
        let length = this.cornersX.length;
        for (let i = 0; i < length; i++) {
            centerX += this.cornersX[i];
            centerY += this.cornersY[i];
        }
        centerX /= length;
        centerY /= length;
        // repeat first point and second (interpolation)
        this.addCorner(this.cornersX[0], this.cornersY[0]);
        this.addCorner(this.cornersX[1], this.cornersY[1]);
        // subdivision of border
        // number of child polygons for fractal
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