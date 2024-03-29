/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const subdivs = {};


// calculate a scaled array of vectors
function scaledVectors(scale, centerX, centerY, vectorsX, vectorsY) {
    const length = vectorsX.length;
    const resultX = [];
    resultX.length = length;
    const resultY = [];
    resultY.length = length;
    for (let i = 0; i < length; i++) {
        resultX[i] = centerX + scale * (vectorsX[i] - centerX);
        resultY[i] = centerY + scale * (vectorsY[i] - centerY);
    }
    return [resultX, resultY];
}

// copy an array with spread operator
// [...theArray]

subdivs.setup = function() {

    // calculating midpoints of corners
    // mid[0]=0.5*(corners[0]+corners[1])
    Polygon.prototype.midVectors = function() {
        const length = this.cornersX.length;
        const midX = [];
        const midY = [];
        midX.length = length;
        midY.length = length;
        midX[0] = 0.5 * (this.cornersX[length - 1] + this.cornersX[0]);
        midY[0] = 0.5 * (this.cornersY[length - 1] + this.cornersY[0]);
        for (let i = 1; i < length; i++) {
            midX[i] = 0.5 * (this.cornersX[i - 1] + this.cornersX[i]);
            midY[i] = 0.5 * (this.cornersY[i - 1] + this.cornersY[i]);
        }
        return [midX, midY];
    };

    Polygon.prototype.simpleTriangles = function(subControls) {
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        const nCorners = this.nCorners;
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, centerX, centerY, this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
            p.addCorners(radialVertices, this.cornersX[ip], this.cornersY[ip], centerX, centerY);
            p.subdivide();
        }
    };

    Polygon.prototype.simpleQuadrangles = function(subControls) {
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        var midX, midY;
        [midX, midY] = this.midVectors();
        const nCorners = this.nCorners;
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, centerX, centerY, midX[i], midY[i]);
            p.addCorners(outsideVertices, midX[i], midY[i], this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], midX[ip], midY[ip]);
            p.addCorners(radialVertices, midX[ip], midY[ip], centerX, centerY);
            p.subdivide();
        }
    };

    Polygon.prototype.halfQuadrangles = function(subControls) {
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        const nCorners = this.nCorners;
        for (let i = 0; i < nCorners - 1; i += 2) {
            const ip = (i + 1) % nCorners;
            const ip2 = (i + 2) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, centerX, centerY, this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
            p.addCorners(outsideVertices, this.cornersX[ip], this.cornersY[ip], this.cornersX[ip2], this.cornersY[ip2]);
            p.addCorners(radialVertices, this.cornersX[ip2], this.cornersY[ip2], centerX, centerY);
            p.subdivide();
        }
    };

    Polygon.prototype.concentricQuadrangles = function(subControls) {
        const insideVertices = subControls.insideVertices;
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        const nCorners = this.nCorners;
        var innerX, innerY;
        [innerX, innerY] = scaledVectors(subControls.ratio, centerX, centerY, this.cornersX, this.cornersY);
        const p = new Polygon(this.generation + 1);
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            p.addCorners(insideVertices, innerX[i], innerY[i], innerX[ip], innerY[ip]);
        }
        p.subdivide();
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, innerX[i], innerY[i], this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
            p.addCorners(radialVertices, this.cornersX[ip], this.cornersY[ip], innerX[ip], innerY[ip]);
            p.addCorners(insideVertices, innerX[ip], innerY[ip], innerX[i], innerY[i]);
            p.subdivide();
        }
    };

    Polygon.prototype.concentricPentangles = function(subControls) {
        const insideVertices = subControls.insideVertices;
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        const nCorners = this.nCorners;
        var midX, midY;
        [midX, midY] = this.midVectors();
        var innerX, innerY;
        [innerX, innerY] = scaledVectors(subControls.ratio, centerX, centerY, midX, midY);
        const p = new Polygon(this.generation + 1);
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            p.addCorners(insideVertices, innerX[i], innerY[i], innerX[ip], innerY[ip]);
        }
        p.subdivide();
        for (let i = 0; i < nCorners; i++) {
            const ip = (i + 1) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, innerX[i], innerY[i], midX[i], midY[i]);
            p.addCorners(outsideVertices, midX[i], midY[i], this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], midX[ip], midY[ip]);
            p.addCorners(radialVertices, midX[ip], midY[ip], innerX[ip], innerY[ip]);
            p.addCorners(insideVertices, innerX[ip], innerY[ip], innerX[i], innerY[i]);
            p.subdivide();
        }
    };

    Polygon.prototype.concentricHalfPentangles = function(subControls) {
        const insideVertices = subControls.insideVertices;
        const radialVertices = subControls.radialVertices;
        const outsideVertices = subControls.outsideVertices;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter(subControls.origin);
        var innerX, innerY;
        [innerX, innerY] = scaledVectors(subControls.ratio, centerX, centerY, this.cornersX, this.cornersY);
        const nCorners = this.nCorners;
        const p = new Polygon(this.generation + 1);
        for (let i = 0; i < nCorners - 1; i += 2) {
            const ip = (i + 2) % nCorners;
            p.addCorners(insideVertices, innerX[i], innerY[i], innerX[ip], innerY[ip]);
        }
        p.subdivide();
        for (let i = 0; i < nCorners - 1; i += 2) {
            const ip = (i + 1) % nCorners;
            const ip2 = (i + 2) % nCorners;
            const p = new Polygon(this.generation + 1);
            p.addCorners(radialVertices, innerX[i], innerY[i], this.cornersX[i], this.cornersY[i]);
            p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
            p.addCorners(outsideVertices, this.cornersX[ip], this.cornersY[ip], this.cornersX[ip2], this.cornersY[ip2]);
            p.addCorners(radialVertices, this.cornersX[ip2], this.cornersY[ip2], innerX[ip2], innerY[ip2]);
            p.addCorners(insideVertices, innerX[ip2], innerY[ip2], innerX[i], innerY[i]);
            p.subdivide();
        }
    };
};

Polygon.prototype.concentricHalfHexagons = function(subControls) {
    const insideVertices = subControls.insideVertices;
    const radialVertices = subControls.radialVertices;
    const outsideVertices = subControls.outsideVertices;
    var centerX, centerY;
    [centerX, centerY] = this.getCenter(subControls.origin);
    const nCorners = this.nCorners;
    var midX, midY;
    [midX, midY] = this.midVectors();
    var innerX, innerY;
    [innerX, innerY] = scaledVectors(subControls.ratio, centerX, centerY, midX, midY);
    const p = new Polygon(this.generation + 1);
    for (let i = 0; i < nCorners - 1; i += 2) {
        const ip = (i + 2) % nCorners;
        p.addCorners(insideVertices, innerX[i], innerY[i], innerX[ip], innerY[ip]);
    }
    p.subdivide();
    for (let i = 0; i < nCorners - 1; i += 2) {
        const ip = (i + 1) % nCorners;
        const ip2 = (i + 2) % nCorners;
        const p = new Polygon(this.generation + 1);
        p.addCorners(radialVertices, innerX[i], innerY[i], midX[i], midY[i]);
        p.addCorners(radialVertices, midX[i], midY[i], this.cornersX[i], this.cornersY[i]);
        p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
        p.addCorners(radialVertices, this.cornersX[ip], this.cornersY[ip], midX[ip2], midY[ip2]);
        p.addCorners(radialVertices, midX[ip2], midY[ip2], innerX[ip2], innerY[ip2]);
        p.addCorners(insideVertices, innerX[ip2], innerY[ip2], innerX[i], innerY[i]);
        p.subdivide();
    }
};


Polygon.prototype.innerPolygon = function(subControls) {
    const insideVertices = subControls.insideVertices;
    const outsideVertices = subControls.outsideVertices;
    const nCorners = this.nCorners;
    const p = new Polygon(this.generation + 1);
    for (let i = 0; i < nCorners - 1; i += 2) {
        const ip = (i + 2) % nCorners;
        p.addCorners(insideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
    }
    p.subdivide();
    for (let i = 0; i < nCorners - 1; i += 2) {
        const ip = (i + 1) % nCorners;
        const ip2 = (i + 2) % nCorners;
        const p = new Polygon(this.generation + 1);
        p.addCorners(outsideVertices, this.cornersX[i], this.cornersY[i], this.cornersX[ip], this.cornersY[ip]);
        p.addCorners(outsideVertices, this.cornersX[ip], this.cornersY[ip], this.cornersX[ip2], this.cornersY[ip2]);
        p.addCorners(insideVertices, this.cornersX[ip2], this.cornersY[ip2], this.cornersX[i], this.cornersY[i]);
        p.subdivide();
    }
};