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

// geometry options
Polygon.size = 600;
// initial
Polygon.symmetry = 6;
Polygon.star = false;
Polygon.starFactor = 0.5;
Polygon.generations = 1;
// subdivs
Polygon.subControls = [];
Polygon.subControls.length = 10;
const length = Polygon.subControls.length;
for (let i = 0; i < length; i++) {
    const subControls = {};
    Polygon.subControls[i]=subControls;
    subControls.subDiv = 'simpleQuadrangles';
    subControls.origin = 0;
    subControls.ratio = 0.4;
    subControls.insideVertices = 1;
    subControls.radialVertices = 1;
    subControls.outsideVertices = 1;
}
Polygon.subControls[0].subDiv='simpleTriangles';

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
Polygon.prototype.getCenter = function(originExtra = 0) {
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
// n corners from start to end, including start, without end
Polygon.prototype.addCorners = function(n, startX, startY, endX, endY) {
    const dx = (endX - startX) / n;
    const dy = (endY - startY) / n;
    let x = startX;
    let y = startY;
    for (let i = 0; i < n; i++) {
        this.addCorner(x, y);
        x += dx;
        y += dy;
    }
};

Polygon.subDivs = ['simpleTriangles', 'simpleQuadrangles', 'halfQuadrangles', 'concentricQuadrangles', 'concentricPentangles', 'concentricHalfPentangles', 'concentricHalfHexagons', 'innerPolygon'];

// subdivide the polygon or store it for showing
Polygon.prototype.subdivide = function() {
    // if final generation achieved store polygon else continue fragmentation
    if (this.generation >= Polygon.generations) {
        Polygon.collection.push(this);
    } else {
        const subControls = Polygon.subControls[this.generation];
        const ratio=subControls.ratio;
        const insideVertices=subControls.insideVertices;
        const radialVertices=subControls.radialVertices;
        const outsideVertices=subControls.outsideVertices;
        switch (subControls.subDiv) {
            case 'simpleTriangles':
                this.simpleTriangles(subControls);
                break;
            case 'simpleQuadrangles':
                this.simpleQuadrangles(subControls);
                break;
            case 'halfQuadrangles':
                this.halfQuadrangles(subControls);
                break;
            case 'concentricQuadrangles':
                this.concentricQuadrangles(subControls);
                break;
            case 'concentricPentangles':
                this.concentricPentangles(subControls);
                break;
            case 'concentricHalfHexagons':
                this.concentricHalfHexagons(subControls);
                break;
            case 'concentricHalfPentangles':
                this.concentricPentangles(subControls);
                break;
            case 'innerPolygon':
                this.innerPolygon(subControls);
                break;
        }
    }
};