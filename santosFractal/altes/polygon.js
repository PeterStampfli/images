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
    this.nCorners = 0;
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
Polygon.gamma = 1;

Polygon.initial = 'triangles';
Polygon.initial = 'quadrangles';
Polygon.additionalVertices = false;
Polygon.initialAddVertices = false;

// geometry options
Polygon.useOffset = false;
Polygon.generations = 1;
Polygon.subdiv = '5 ...';
Polygon.subdivApproach = 'graphEuclidean';
//Polygon.subdivApproach = 'modular 4';
Polygon.centerWeight = 1;
Polygon.shift = false;
Polygon.shiftValue = 0.5;
Polygon.trueBaryCenter = true;

// other
Polygon.noAlert = true;

// collecting polygons
Polygon.collection = [];

var canvasContext;

// make the path for a polygon
Polygon.prototype.makePath = function() {
    canvasContext.beginPath();
    canvasContext.moveTo(this.cornersX[0], this.cornersY[0]);
    const length = this.cornersX.length;
    for (let i = 1; i < length; i++) {
        canvasContext.lineTo(this.cornersX[i], this.cornersY[i]);
    }
    canvasContext.closePath();
};

// drawing the collected polygons
Polygon.drawCollection = function() {
    const canvas = output.canvas;
    canvasContext = canvas.getContext('2d');
    let pLength = Polygon.collection.length;
    if (Polygon.fill) {
        if (!Polygon.stroke) {
            for (let p = 0; p < pLength; p++) {
                const polygon = Polygon.collection[p];
                polygon.makePath();
                canvasContext.strokeStyle = ColorInput.stringFromObject(polygon);
                canvasContext.stroke();
            }
        }
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            polygon.makePath();
            canvasContext.fillStyle = ColorInput.stringFromObject(polygon);
            canvasContext.fill();
        }
    }
    if (Polygon.stroke) {
        canvasContext.strokeStyle = Polygon.lineColor;
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            polygon.makePath();
            canvasContext.stroke();
        }
    }
    if (Polygon.vertices) {
        canvasContext.fillStyle = Polygon.lineColor;
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            const cornersX = polygon.cornersX;
            const cornersY = polygon.cornersY;
            const length = cornersX.length;
            for (let i = 0; i < length; i++) {
                canvasContext.beginPath();
                canvasContext.arc(cornersX[i], cornersY[i], Polygon.vertexSize, 0, 2 * Math.PI);
                canvasContext.fill();
            }
        }
    }
};

// calculate surfaces and cosAngles
Polygon.setSurfaces = function() {
    Polygon.collection.forEach(polygon => polygon.setSurface());
};

// minimum and maximum surface, and acosAngles
Polygon.minMaxSurface = function() {
    let minSurface = 100000;
    let maxSurface = -100000;
    let minCosAngle = 100000;
    let maxCosAngle = -100000;
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const surface = Polygon.collection[i].surface;
        minSurface = Math.min(minSurface, surface);
        maxSurface = Math.max(maxSurface, surface);
        const cosAngle = Polygon.collection[i].cosAngle;
        minCosAngle = Math.min(minCosAngle, cosAngle);
        maxCosAngle = Math.max(maxCosAngle, cosAngle);
    }
    Polygon.minSurface = minSurface;
    Polygon.maxSurface = maxSurface;
    Polygon.minCosAngle = minCosAngle;
    Polygon.maxCosAngle = maxCosAngle;
};

// normalize surfaces between 0 and 0.999
// if all nearly same surface - make it 0.9999
// normalize cosAngle to 0...0.999
Polygon.normalizeSurface = function() {
    const diff = Polygon.maxSurface - Polygon.minSurface;
    const length = Polygon.collection.length;
    const gamma = Polygon.gamma;
    if (Math.abs(diff / Polygon.maxSurface) < 0.001) {
        for (let i = 0; i < length; i++) {
            Polygon.collection[i].surface = 0.999;
        }
    } else {
        const iDiff = 0.999 / diff;
        const minSurface = Polygon.minSurface;
        for (let i = 0; i < length; i++) {
            let x = (Polygon.collection[i].surface - minSurface) * iDiff;
            x = Math.pow(x, gamma);
            Polygon.collection[i].surface = x;
        }
    }
    const aDiff = Polygon.maxCosAngle - Polygon.minCosAngle;
    if (aDiff < 0.001) {
        for (let i = 0; i < length; i++) {
            Polygon.collection[i].cosAngle = 0.5;
        }
    } else {
        const iADiff = 0.999 / aDiff;
        const minCosAngle = Polygon.minCosAngle;
        for (let i = 0; i < length; i++) {
            Polygon.collection[i].cosAngle = (Polygon.collection[i].cosAngle - minCosAngle) * iADiff;
        }
    }
};


// set rgb components of a polygon depending on hue and value
// hue and value between 0 and 1
Polygon.prototype.setHueValue = function(hue, value) {
    let red = 0;
    let green = 0;
    let blue = 0;
    hue *= 6;
    const c = Math.floor(hue);
    const x = hue - c;
    switch (c) {
        case 0:
            blue = 1;
            red = x;
            break;
        case 1:
            blue = 1 - x;
            red = 1;
            break;
        case 2:
            green = x;
            red = 1;
            break;
        case 3:
            green = 1;
            red = 1 - x;
            break;
        case 4:
            blue = x;
            green = 1;
            break;
        case 5:
            blue = 1;
            green = 1 - x;
            break;
    }
    const f = 255.9 * value;
    this.red = Math.floor(f * red);
    this.green = Math.floor(f * green);
    this.blue = Math.floor(f * blue);
};

// grey colors black for smallest to white for largest
Polygon.greySurfaces = function() {
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        const grey = Math.floor(polygon.surface * 255.9);
        polygon.red = grey;
        polygon.green = grey;
        polygon.blue = grey;
    }
};

// magenta-green  (cosangle-surface)
Polygon.magentaGreen = function() {
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        const green = Math.floor(polygon.surface * 255.9);
        const magenta = Math.floor(polygon.cosAngle * 255.9);
        polygon.red = magenta;
        polygon.green = green;
        polygon.blue = magenta;
    }
};

// hue(cosangle)-value(surface)
Polygon.hueValue = function() {
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        polygon.setHueValue(polygon.cosAngle, polygon.surface);
    }
};

// calculate center of polygon
Polygon.prototype.getCenter = function() {
    if (Polygon.trueBaryCenter) {
        const originX = this.cornersX[0];
        const originY = this.cornersY[0];
        let newSideX = this.cornersX[1] - originX;
        let newSideY = this.cornersY[1] - originY;
        let lastSideX = newSideX;
        let lastSideY = newSideY;
        let areaSum = 0;
        let centerX = 0;
        let centerY = 0;
        const nCorners = this.cornersX.length;
        for (let i = 2; i < nCorners; i++) {
            lastSideX = newSideX;
            lastSideY = newSideY;
            newSideX = this.cornersX[i] - originX;
            newSideY = this.cornersY[i] - originY;
            const area = newSideX * lastSideY - newSideY * lastSideX;
            areaSum += area;
            centerX += area * (originX + this.cornersX[i - 1] + this.cornersX[i]);
            centerY += area * (originY + this.cornersY[i - 1] + this.cornersY[i]);
        }
        const factor = 0.333 / areaSum;
        centerX *= factor;
        centerY *= factor;
        return [centerX, centerY];
    } else {
        const centerWeight = Polygon.centerWeight;
        let centerX = centerWeight * this.cornersX[0];
        let centerY = centerWeight * this.cornersY[0];
        const length = this.cornersX.length;
        for (let i = 1; i < length; i++) {
            centerX += this.cornersX[i];
            centerY += this.cornersY[i];
        }
        const factor = 1 / (length - 1 + centerWeight);
        centerX *= factor;
        centerY *= factor;
        return [centerX, centerY];
    }
};

// calculate the surface of the polygon and store it in its field
// and calculate cos of angle between lines going out from center=vertex[0]
Polygon.prototype.setSurface = function() {
    const length = this.cornersX.length;
    var ax, ay, bx, by;
    switch (length) {
        case 3:
            // triangle without additional vertices
            // take sides
            ax = this.cornersX[1] - this.cornersX[0];
            ay = this.cornersY[1] - this.cornersY[0];
            bx = this.cornersX[2] - this.cornersX[0];
            by = this.cornersY[2] - this.cornersY[0];
            break;
        case 5:
            // triangle with additional vertices (indices 1 and 4)
            ax = this.cornersX[2] - this.cornersX[0];
            ay = this.cornersY[2] - this.cornersY[0];
            bx = this.cornersX[3] - this.cornersX[0];
            by = this.cornersY[3] - this.cornersY[0];
            break;
        case 4:
            // quadrilateral without additional vertices
            // take diagonals
            ax = this.cornersX[2] - this.cornersX[0];
            ay = this.cornersY[2] - this.cornersY[0];
            bx = this.cornersX[3] - this.cornersX[1];
            by = this.cornersY[3] - this.cornersY[1];
            break;
        case 6:
            // quadrilateral with additional vertices (indices 1 and 5)
            // take diagonals
            ax = this.cornersX[3] - this.cornersX[0];
            ay = this.cornersY[3] - this.cornersY[0];
            bx = this.cornersX[4] - this.cornersX[2];
            by = this.cornersY[4] - this.cornersY[2];
            break;
    }
    this.surface = Math.abs(ax * by - ay * bx);
    ax = this.cornersX[1] - this.cornersX[0];
    ay = this.cornersY[1] - this.cornersY[0];
    bx = this.cornersX[length - 1] - this.cornersX[0];
    by = this.cornersY[length - 1] - this.cornersY[0];
    this.cosAngle = (ax * bx + ay * by) / Math.sqrt((ax * ax + ay * ay) * (bx * bx + by * by));
};

// adding a corner
Polygon.prototype.addCorner = function(x, y) {
    this.cornersX.push(x);
    this.cornersY.push(y);
    this.nCorners += 1;
};

// interpolate corners
// returns a point defined by its coordinates
Polygon.prototype.interpolate = function(t) {
    const result = {};
    const nCorners = this.nCorners;
    let iLow = Math.floor(t);
    t -= iLow;
    if (iLow >= nCorners) {
        iLow -= nCorners;
    }
    let iHigh = iLow + 1;
    if (iHigh >= nCorners) {
        iHigh -= nCorners;
    }
    result.x = this.cornersX[iLow] * (1 - t) + this.cornersX[iHigh] * t;
    result.y = this.cornersY[iLow] * (1 - t) + this.cornersY[iHigh] * t;
    return result;
};

// add an interpolated corner
Polygon.prototype.addInterpolatedCorner = function(parent, t) {
    const c = parent.interpolate(t);
    this.addCorner(c.x, c.y);
};

// make initial triangles, one for each side
Polygon.prototype.initialTriangles = function() {
    if (Polygon.subdivisions[0] === 2) {
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(-1, -1);
        p1.addCorner(-1, 1);
        p1.addCorner(1, 1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(-1, -1);
        p2.addCorner(1, -1);
        p2.addCorner(1, 1);
        p2.subdivide();
        return;
    }
    const centerX = 0;
    const centerY = 0;
    const nChilds = this.nCorners;
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5) && (Polygon.subdivApproach === 'graphEuclidean');
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
        }
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        let ip = i + 1;
        if (ip === nChilds) {
            ip = 0;
        }
        p.addCorner(this.cornersX[ip], this.cornersY[ip]);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[ip]), 0.5 * (centerY + this.cornersY[ip]));
        }
        p.subdivide();
    }
};

// make initial pseudo quadrangles, one for each side
Polygon.prototype.initialPseudoQuadrangles = function() {
    if (Polygon.subdivisions[0] === 2) {
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(-1, 0);
        p1.addCorner(-1, -1);
        p1.addCorner(1, -1);
        p1.addCorner(1, 0);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(-1, 0);
        p2.addCorner(-1, 1);
        p2.addCorner(1, 1);
        p2.addCorner(1, 0);
        p2.subdivide();
        return;
    }
    const centerX = 0;
    const centerY = 0;
    const nChilds = this.nCorners;
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5) && (Polygon.subdivApproach === 'graphEuclidean');
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
        }
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        let ip = i + 1;
        if (ip === nChilds) {
            ip = 0;
        }
        p.addCorner(0.5 * (this.cornersX[i] + this.cornersX[ip]), 0.5 * (this.cornersY[i] + this.cornersY[ip]));
        p.addCorner(this.cornersX[ip], this.cornersY[ip]);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + this.cornersX[ip]), 0.5 * (centerY + this.cornersY[ip]));
        }
        p.subdivide();
    }
};

// make initial double triangles, two for each side
Polygon.prototype.initialDoubleTriangles = function() {
    const centerX = 0;
    const centerY = 0;
    const nChilds = this.nCorners;
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5) && (Polygon.subdivApproach === 'graphEuclidean');
    for (let i = 0; i < nChilds; i++) {
        let ip = i + 1;
        if (ip === nChilds) {
            ip = 0;
        }
        const midX = 0.5 * (this.cornersX[i] + this.cornersX[ip]);
        const midY = 0.5 * (this.cornersY[i] + this.cornersY[ip]);
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
            p2.addCorner(0.5 * (centerX + this.cornersX[ip]), 0.5 * (centerY + this.cornersY[ip]));
        }
        p2.addCorner(this.cornersX[ip], this.cornersY[ip]);
        p2.addCorner(midX, midY);
        if (addVertices) {
            p2.addCorner(0.5 * (centerX + midX), 0.5 * (centerY + midY));
        }
        p2.subdivide();
    }
};

// make initial quadrangles, one for each corner
Polygon.prototype.initialQuadrangles = function() {
    if (Polygon.subdivisions[0] === 2) {
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(0, 0);
        p1.addCorner(-1, -1);
        p1.addCorner(1, -1);
        p1.addCorner(1, 1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(0, 0);
        p2.addCorner(-1, -1);
        p2.addCorner(-1, 1);
        p2.addCorner(1, 1);
        p2.subdivide();
        return;
    }
    const centerX = 0;
    const centerY = 0;
    const nChilds = this.cornersX.length;
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5) && (Polygon.subdivApproach === 'graphEuclidean');
    let cornerHigh = this.interpolate(nChilds - 0.5);
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cornerLow = cornerHigh;
        cornerHigh = this.interpolate(i + 0.5);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerLow.x), 0.5 * (centerY + cornerLow.y));
        }
        p.addCorner(cornerLow.x, cornerLow.y);
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        p.addCorner(cornerHigh.x, cornerHigh.y);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerHigh.x), 0.5 * (centerY + cornerHigh.y));
        }
        p.subdivide();
    }
};

// graph-euclidean subdivision
Polygon.prototype.graphEuclidean = function() {
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    let nCorners = this.cornersX.length;
    // subdivision of border
    // number of child polygons for fractal all the same
    const nChilds = Polygon.subdivisions[this.generation];
    const addVertices = Polygon.additionalVertices && (nChilds >= 5);
    let delta = nCorners / nChilds;
    let offset = 0;
    let nChildsPart = nChilds;
    if (Polygon.shift) {
        offset = Polygon.shiftValue * nCorners / nChilds;
        delta = (nCorners - 2 * offset) / (nChilds - 1);
        nChildsPart = nChilds - 1;
        // add polygon at refernence vertex, index=0
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cornerLow = this.interpolate(offset);
        let cornerHigh = this.interpolate(nCorners - offset);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerLow.x), 0.5 * (centerY + cornerLow.y));
        }
        p.addCorner(cornerLow.x, cornerLow.y);
        p.addCorner(this.cornersX[0], this.cornersY[0]);
        p.addCorner(cornerHigh.x, cornerHigh.y);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerHigh.x), 0.5 * (centerY + cornerHigh.y));
        }
        p.subdivide();
    }
    for (let i = 0; i < nChildsPart; i++) {
        let tLow = i * delta + offset;
        let tHigh = tLow + delta;
        // indices to parent tile corners/vertices between
        // interpolated new vertices
        const jLow = Math.floor(tLow + epsilon) + 1;
        const jHigh = Math.floor(tHigh - epsilon);
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cornerLow = this.interpolate(tLow);
        let cornerHigh = this.interpolate(tHigh);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerLow.x), 0.5 * (centerY + cornerLow.y));
        }
        p.addCorner(cornerLow.x, cornerLow.y);
        // there should be at most one parent corner (vertex) between
        // the two interpolated corners
        if ((jHigh - jLow) >= 1) {
            if (Polygon.noAlert) {
                Polygon.noAlert = false;
                alert('subdivide: more than one parent corner between new interpolated corners');
            }
        } else if (jHigh === jLow) {
            // one parent corner between new corners, add to new polygon
            if (jLow < nCorners) {
                p.addCorner(this.cornersX[jLow], this.cornersY[jLow]);
            } else {
                p.addCorner(this.cornersX[jLow - nCorners], this.cornersY[jLow - nCorners]);
            }
        } else {
            // add a vertex between the interpolated ones to get a quadrilateral
            p.addCorner(0.5 * (cornerLow.x + cornerHigh.x), 0.5 * (cornerLow.y + cornerHigh.y));
        }
        p.addCorner(cornerHigh.x, cornerHigh.y);
        if (addVertices) {
            p.addCorner(0.5 * (centerX + cornerHigh.x), 0.5 * (centerY + cornerHigh.y));
        }
        p.subdivide();
    }
};

// for mod 4 subdivision
// shift the vertex of reference
Polygon.prototype.shiftMod4 = function() {
    if (Polygon.shift) {
        let h = this.cornersX[0];
        this.cornersX[0] = this.cornersX[2];
        this.cornersX[2] = h;
        h = this.cornersY[0];
        this.cornersY[0] = this.cornersY[2];
        this.cornersY[2] = h;
    }
};

// mod 3 subdivision for 5 childs
Polygon.prototype.mod3for5 = function() {
    let length = this.cornersX.length;
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[0] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[0] + this.cornersY[2]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX2, midY2);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[0], this.cornersY[0]);
        p5.addCorner(midX2, midY2);
        p5.subdivide();
    } else {
        if (Polygon.noAlert) {
            Polygon.noAlert = false;
            alert('modular 3 for 5 childs not implemented for quadrangles');
        }
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
    } else {
        if (Polygon.noAlert) {
            Polygon.noAlert = false;
            alert('modular 3 for 6 childs not implemented for quadrangles');
        }
    }
};

// mod 4 subdivision for 4 childs
Polygon.prototype.mod4for4 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        if (Polygon.noAlert) {
            Polygon.noAlert = false;
            alert('modular 4 for 4 childs not implemented for triangles');
        }
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
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX2, midY2);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.addCorner(midX3, midY3);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(midX3, midY3);
        p4.addCorner(this.cornersX[3], this.cornersY[3]);
        p4.addCorner(midX4, midY4);
        p4.subdivide();
    }
};


// mod 4 subdivision for 5 childs
Polygon.prototype.mod4for5 = function() {
    this.shiftMod4();
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    // can only subdivide a triangle into 5 triangles because of symmetry
    if (length === 3) {
        let midX1 = 0.5 * (this.cornersX[0] + this.cornersX[1]);
        let midY1 = 0.5 * (this.cornersY[0] + this.cornersY[1]);
        let midX2 = 0.5 * (this.cornersX[0] + this.cornersX[2]);
        let midY2 = 0.5 * (this.cornersY[0] + this.cornersY[2]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[1], this.cornersY[1]);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX2, midY2);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[0], this.cornersY[0]);
        p5.addCorner(midX2, midY2);
        p5.subdivide();

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
        p1.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(midX1, midY1);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX2, midY2);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.addCorner(midX3, midY3);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(midX3, midY3);
        p4.addCorner(this.cornersX[3], this.cornersY[3]);
        p4.addCorner(midX4, midY4);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(this.cornersX[0], this.cornersY[0]);
        p5.addCorner(0.5 * (this.cornersX[0] + midX4), 0.5 * (this.cornersY[0] + midY4));
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
    this.shiftMod4();
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    if (length === 3) {
        if (Polygon.noAlert) {
            Polygon.noAlert = false;
            alert('modular 4 for 7 childs not implemented for triangles');
        }
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
        p1.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
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
        const p7 = new Polygon(this.generation + 1);
        p7.addCorner(centerX, centerY);
        p7.addCorner(this.cornersX[0], this.cornersY[0]);
        p7.addCorner(0.5 * (this.cornersX[0] + midX4), 0.5 * (this.cornersY[0] + midY4));
        p7.addCorner(midX4, midY4);
        p7.subdivide();

    }
};
// mod 4 subdivision for 8 childs
Polygon.prototype.mod4for8 = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    if (length === 3) {
        if (Polygon.noAlert) {
            Polygon.noAlert = false;
            alert('modular 4 for 8 childs not implemented for triangles');
        }
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
        p1.addCorner(0.5 * (this.cornersX[0] + midX1), 0.5 * (this.cornersY[0] + midY1));
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
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
        p4.addCorner(0.5 * (this.cornersX[2] + midX2), 0.5 * (this.cornersY[2] + midY2));
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.subdivide();
        const p4a = new Polygon(this.generation + 1);
        p4a.addCorner(centerX, centerY);
        p4a.addCorner(midX3, midY3);
        p4a.addCorner(0.5 * (this.cornersX[2] + midX3), 0.5 * (this.cornersY[2] + midY3));
        p4a.addCorner(this.cornersX[2], this.cornersY[2]);
        p4a.subdivide();
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
        const p7 = new Polygon(this.generation + 1);
        p7.addCorner(centerX, centerY);
        p7.addCorner(this.cornersX[0], this.cornersY[0]);
        p7.addCorner(0.5 * (this.cornersX[0] + midX4), 0.5 * (this.cornersY[0] + midY4));
        p7.addCorner(midX4, midY4);
        p7.subdivide();
    }
};

// subdivide the polygon or show
Polygon.prototype.subdivide = function() {
    if (this.generation >= Polygon.generations) {
        Polygon.collection.push(this);
    } else {
        const nChilds = Polygon.subdivisions[this.generation];
        switch (Polygon.subdivApproach) {
            case 'graphEuclidean':
                this.graphEuclidean();
                break;
            case 'modular 3':
                switch (nChilds) {
                    case 5:
                        this.mod3for5();
                        break;
                    case 6:
                        this.mod3for6();
                        break;
                    default:
                        if (Polygon.noAlert) {
                            Polygon.noAlert = false;
                            alert('modular 3 not implemented for subdivision into ' + nChilds);
                        }
                }
                break;
            case 'modular 4':
                switch (nChilds) {
                    case 4:
                        this.mod4for4();
                        break;
                    case 5:
                        this.mod4for5();
                        break;
                    case 6:
                        this.mod4for6();
                        break;
                    case 7:
                        this.mod4for7();
                        break;
                    case 8:
                        this.mod4for8();
                        break;
                    default:
                        if (Polygon.noAlert) {
                            Polygon.noAlert = false;
                            alert('modular 4 not implemented for subdivision into ' + nChilds);
                        }
                }
                break;
        }
    }
};

// create regular polygon with n corners, generation 0

Polygon.createRegular = function(n) {
    const polygon = new Polygon(0);
    const delta = (n & 1) ? 0 : Math.PI / n;

    for (let i = 0; i < n; i++) {
        const angle = 2 * i * Math.PI / n + delta;
        polygon.addCorner(Math.sin(angle), Math.cos(angle));
    }
    return polygon;
};