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
Polygon.brightnessFrom = 0.2;
Polygon.brightnessTo = 1.5;
Polygon.saturationFrom = 1.5;
Polygon.saturationTo = 0.3;
Polygon.hueFrom = 0;
Polygon.hueTo = 0.5;
Polygon.colors = 'hue(angle)-value(surface)';

// geometry options
Polygon.size = 600;

Polygon.symmetry = 6;
Polygon.star = false;
Polygon.starFactor = 0.5;


Polygon.useOffset = false;
Polygon.generations = 1;
Polygon.subdivApproach = 'graphEuclidean';
Polygon.subdivApproach = 'modular 4';
Polygon.originExtra = 0;
Polygon.shift = false;
Polygon.shiftValue = 0.5;

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

// calculate center of polygon, shift towards/away center possible
Polygon.prototype.getCenter = function(originExtra=0) {
    if (this.generation === 0) {
        return [0, 0];
    }
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
    centerX = (centerX + originExtra * originX) / (1 + originExtra);
    centerY = (centerY + originExtra * originY) / (1 + originExtra);
    return [centerX, centerY];
};

// adding a corner
Polygon.prototype.addCorner = function(x, y) {
    this.cornersX.push(x);
    this.cornersY.push(y);
    this.nCorners += 1;
};

// adding interpolated corners
// n corners from start to end, including end, without start
Polygon.prototype.addCorners = function(n, startX, startY, endX, endY) {
    const dx = (endX - startX) / n;
    const dy = (endY - startY) / n;
    let x = startX;
    let y = startY;
    for (let i = 0; i < n; i++) {
        x += dx;
        y += dy;
        this.addCorner(x, y);
    }
};

// special subdivisions
//====================================================




//=======================================================
// decomposition into a central polygon and pentagons per corner
Polygon.prototype.concentricPentagons = function() {
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    // points at middle of sides
    const sideX = [];
    const sideY = [];
    sideX.length = length;
    sideY.length = length;
    sideX[0] = 0.5 * (this.cornersX[0] + this.cornersX[length - 1]);
    sideY[0] = 0.5 * (this.cornersY[0] + this.cornersY[length - 1]);
    for (let i = 1; i < length; i++) {
        sideX[i] = 0.5 * (this.cornersX[i] + this.cornersX[i - 1]);
        sideY[i] = 0.5 * (this.cornersY[i] + this.cornersY[i - 1]);
    }
    // points between middle of sides and center
    const midX = [];
    const midY = [];
    midX.length = length;
    midY.length = length;
    const p0 = new Polygon(this.generation + 1);
    for (let i = 0; i < length; i++) {
        midX[i] = 0.5 * (centerX + sideX[i]);
        midY[i] = 0.5 * (centerY + sideY[i]);
        p0.addCorner(midX[i], midY[i]);
    }
    p0.subdivide();
    const p = new Polygon(this.generation + 1);
    p.addCorner(this.cornersX[length - 1], this.cornersY[length - 1]);
    p.addCorner(sideX[0], sideY[0]);
    p.addCorner(midX[0], midY[0]);
    p.addCorner(midX[length - 1], midY[length - 1]);
    p.addCorner(sideX[length - 1], sideY[length - 1]);
    p.subdivide();
    for (let i = 1; i < length; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(this.cornersX[i - 1], this.cornersY[i - 1]);
        p.addCorner(sideX[i], sideY[i]);
        p.addCorner(midX[i], midY[i]);
        p.addCorner(midX[i - 1], midY[i - 1]);
        p.addCorner(sideX[i - 1], sideY[i - 1]);
        p.subdivide();
    }
};

Polygon.prototype.concentricQuads = function() {
    // concentric appraoch
    console.log('concentric quads');
    let length = this.cornersX.length;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter();
    const midX = [];
    const midY = [];
    midX.length = length;
    midY.length = length;
    const p0 = new Polygon(this.generation + 1);
    for (let i = 0; i < length; i++) {
        midX[i] = 0.5 * (centerX + this.cornersX[i]);
        midY[i] = 0.5 * (centerY + this.cornersY[i]);
        p0.addCorner(midX[i], midY[i]);
    }
    p0.subdivide();
    const p = new Polygon(this.generation + 1);
    p.addCorner(midX[0], midY[0]);
    p.addCorner(midX[length - 1], midY[length - 1]);
    p.addCorner(this.cornersX[length - 1], this.cornersY[length - 1]);
    p.addCorner(this.cornersX[0], this.cornersY[0]);
    p.subdivide();
    for (let i = 1; i < length; i++) {
        const p = new Polygon(this.generation + 1);
        p.addCorner(midX[i], midY[i]);
        p.addCorner(midX[i - 1], midY[i - 1]);
        p.addCorner(this.cornersX[i - 1], this.cornersY[i - 1]);
        p.addCorner(this.cornersX[i], this.cornersY[i]);
        p.subdivide();
    }
};

// subdivide the polygon or store it for showing
Polygon.prototype.subdivide = function() {
    // if final generation achieved store polygon else continue fragmentation
    if (this.generation >= Polygon.generations) {
        Polygon.collection.push(this);
    } else {
       // this.simpleTriangles(2,2);
        //this.simpleQuadrangles();
        //this.halfQuadrangles(2,1);
     //   this.concentricQuadrangles(0.4,1,2,2);
      //  this.concentricPentangles();
     // this.concentricHalfPentangles(0.4,2,1,2);
      this.concentricHalfHexagons();
    }
};