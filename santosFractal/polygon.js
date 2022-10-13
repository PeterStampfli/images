/* jshint esversion: 6 */

import {
    ColorInput,
    SVG
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
Polygon.vertices = false;
Polygon.lineColor = '#000000';
Polygon.lineWidth = 5;
Polygon.vertexSize = 10;
Polygon.valueMin = 0.2;
Polygon.valueMax = 0.8;
Polygon.saturated = 0.7;
Polygon.minSaturation = 0.3;
Polygon.hueMin = 0;
Polygon.hueMax = 0.5;
Polygon.hueAlternance = 0.05;
Polygon.spin = false;
Polygon.colors = 'hue(angle)-value(surface)';

// geometry options
Polygon.size = 600;

Polygon.initial = 'quadrangles';
Polygon.star = 1;
Polygon.additionalVertices = false;
Polygon.initialAddVertices = false;

Polygon.subdivisions = [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
Polygon.indices = [];
Polygon.indices.length = 12;
Polygon.useOffset = false;
Polygon.generations = 1;
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

// make the path for a polygon as an array of point coordinate pairs
Polygon.prototype.makePath = function() {
    let path = [];
    const length = this.cornersX.length;
    for (let i = 0; i < length; i++) {
        path.push(this.cornersX[i], this.cornersY[i]);
    }
    return path;
};

// drawing the collected polygons
Polygon.drawCollection = function() {
    let pLength = Polygon.collection.length;
    SVG.createGroup(SVG.groupAttributes);
    if (Polygon.fill) {
        if (!Polygon.stroke) {
            for (let p = 0; p < pLength; p++) {
                const polygon = Polygon.collection[p];
                SVG.createPolygon(polygon.makePath(), {
                    stroke: ColorInput.stringFromObject(polygon)
                });
            }
        }
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            polygon.makePath();
            SVG.createPolygon(polygon.makePath(), {
                fill: ColorInput.stringFromObject(polygon)
            });
        }
    }
    if (Polygon.stroke) {
        SVG.groupAttributes.stroke = Polygon.lineColor;
        SVG.createGroup(SVG.groupAttributes);
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            SVG.createPolygon(polygon.makePath());
        }
    }
    if (Polygon.vertices) {
        SVG.groupAttributes.stroke = 'none';
        SVG.groupAttributes.fill = Polygon.lineColor;
        SVG.createGroup(SVG.groupAttributes);
        for (let p = 0; p < pLength; p++) {
            const polygon = Polygon.collection[p];
            const cornersX = polygon.cornersX;
            const cornersY = polygon.cornersY;
            const length = cornersX.length;
            for (let i = 0; i < length; i++) {
                SVG.createCircle(cornersX[i], cornersY[i], Polygon.vertexSize);
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
    if (Math.abs(diff / Polygon.maxSurface) < 0.001) {
        for (let i = 0; i < length; i++) {
            Polygon.collection[i].normalizedSurface = 0.5; // all surfaces same value
        }
    } else {
        const iDiff = 0.999 / diff;
        const minSurface = Polygon.minSurface;
        for (let i = 0; i < length; i++) {
            let x = (Polygon.collection[i].surface - minSurface) * iDiff;
            Polygon.collection[i].normalizedSurface = x;
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

// set rgb components of a polygon depending on its hue, brightness and saturation values
// hue, brightness and saturation all go from 0 to 1
Polygon.prototype.setRGBFromHBS = function() {
    let red = 0;
    let green = 0;
    let blue = 0;
    let hue = this.hue; // hue cyclic from 0 to 1
    hue = 6 * (hue - Math.floor(hue));
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
    const saturation = this.saturation;
    const brightness = 255.9 * this.brightness;
    this.red = Math.floor(brightness * (saturation * red + 1 - saturation));
    this.green = Math.floor(brightness * (saturation * green + 1 - saturation));
    this.blue = Math.floor(brightness * (saturation * blue + 1 - saturation));
};

// grey colors black for smallest to white for largest
Polygon.greySurfaces = function() {
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        const grey = Math.floor(polygon.normalizedSurface * 255.9);
        polygon.red = grey;
        polygon.green = grey;
        polygon.blue = grey;
    }
};

// grey colors black for smallest to white for largest
Polygon.greyAngles = function() {
    const length = Polygon.collection.length;
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        const grey = Math.floor(polygon.cosAngle * 255.9);
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
        const green = Math.floor(polygon.normalizedSurface * 255.9);
        const magenta = Math.floor(polygon.cosAngle * 255.9);
        polygon.red = magenta;
        polygon.green = green;
        polygon.blue = magenta;
    }
};

// transform hue,value to hue,saturation, brightness
// hue is not changed
Polygon.prototype.HBSFromHueValue = function() {
    const value = this.value;
    if (value < Polygon.saturated) {
        this.saturation = 1;
        this.brightness = value / Polygon.saturated;
    } else {
        this.brightness = 1;
        this.saturation = 1 - (1 - Polygon.minSaturation) * (value - Polygon.saturated) / (1 - Polygon.saturated);
    }
};

// particular colorings
Polygon.hueValue = function() {
    const length = Polygon.collection.length;
    const range = Polygon.hueMax - Polygon.hueMin;
    const lastSubdiv = Polygon.subdivisions[Math.max(0, Polygon.generations - 1)];
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        polygon.hue = range * polygon.hue + Polygon.hueMin + (((i % lastSubdiv) & 1) - 0.5) * Polygon.hueAlternance;
        polygon.HBSFromHueValue();
        polygon.setRGBFromHBS();
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
    this.cosAngle = Math.abs((ax * bx + ay * by)) / Math.sqrt((ax * ax + ay * ay) * (bx * bx + by * by));
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
        p1.addCorner(-Polygon.star, 0);
        p1.addCorner(-1, -1);
        p1.addCorner(1, -1);
        p1.addCorner(Polygon.star, 0);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(-Polygon.star, 0);
        p2.addCorner(-1, 1);
        p2.addCorner(1, 1);
        p2.addCorner(Polygon.star, 0);
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
        p.addCorner(0.5 * Polygon.star * (this.cornersX[i] + this.cornersX[ip]), 0.5 * Polygon.star * (this.cornersY[i] + this.cornersY[ip]));
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
        const midX = 0.5 * Polygon.star * (this.cornersX[i] + this.cornersX[ip]);
        const midY = 0.5 * Polygon.star * (this.cornersY[i] + this.cornersY[ip]);
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
        p1.addCorner(-Polygon.star, -Polygon.star);
        p1.addCorner(1, -1);
        p1.addCorner(Polygon.star, Polygon.star);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(0, 0);
        p2.addCorner(-Polygon.star, -Polygon.star);
        p2.addCorner(-1, 1);
        p2.addCorner(Polygon.star, Polygon.star);
        p2.subdivide();
        return;
    }
    const centerX = 0;
    const centerY = 0;
    const nChilds = this.cornersX.length;
    // subdivision of border
    const addVertices = Polygon.initialAddVertices && (nChilds >= 5) && (Polygon.subdivApproach === 'graphEuclidean');
    let cornerHigh = this.interpolate(nChilds - 0.5);
    cornerHigh.x *= Polygon.star;
    cornerHigh.y *= Polygon.star;
    for (let i = 0; i < nChilds; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(centerX, centerY);
        let cornerLow = cornerHigh;
        cornerHigh = this.interpolate(i + 0.5);
        cornerHigh.x *= Polygon.star;
        cornerHigh.y *= Polygon.star;
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
    for (let i = this.generation; i < Polygon.generations; i++) {
        Polygon.indices[i] = -1;
    }
    Polygon.indices[this.generation - 1] += 1;
    // if final generation achieved store polygon elsse continue fragmentation
    if (this.generation >= Polygon.generations) {
        Polygon.collection.push(this);
        // indices for each generation
        // asymmetric, each index going from 0 to Polygon.subdivisions[generation]-1
        this.indices = [];
        this.indices.length = Polygon.generations;
        // symmetric, each index going from 0 to floor(Polygon.subdivisions[generation]/2) and back to 0
        this.symmetricIndices = [];
        this.symmetricIndices.length = Polygon.generations;
        for (let i = 0; i < Polygon.generations; i++) {
            let ix = Polygon.indices[i];
            this.indices[i] = ix;
            this.symmetricIndices[i] = Math.min(ix, Polygon.subdivisions[i] - 1 - ix);
        }
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
        polygon.addCorner(Polygon.size * Math.sin(angle), Polygon.size * Math.cos(angle));
    }
    return polygon;
};