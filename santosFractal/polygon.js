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
Polygon.hueAlternance = 0.05;
Polygon.spin = false;
Polygon.colors = 'hue(angle)-value(surface)';

// geometry options
Polygon.size = 600;

Polygon.initial = 'quadrangles';
Polygon.star = 1;
Polygon.additionalVertices = false;
Polygon.initialAddVertices = false;

Polygon.subdivisions = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
Polygon.indices = [];
Polygon.indices.length = 12;
Polygon.useOffset = false;
Polygon.generations = 2;
Polygon.subdivApproach = 'graphEuclidean';
Polygon.subdivApproach = 'modular 4';
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

// adding a corner
Polygon.prototype.addCorner = function(x, y) {
    this.cornersX.push(x);
    this.cornersY.push(y);
    this.nCorners += 1;
};

// special subdivisions
//====================================================

// scaling an array of vectors
function scaleVectors(scale, vectorsX, vectorsY) {
    const length = vectorsX.length;
    for (let i = 0; i < length; i++) {
        vectorsX[i] *= scale;
        vectorsY[i] *= scale;
    }
}

// copy an array with spread operator
// [...theArray]

// calculating midpoints of vectors
// mid[0]=0.5*(vectors[0]+vectors[1])
function midVectors(scale, vectorsX, vectorsY) {
    const length = vectorsX.length;
    const midX=[];
    const midY=[];
    midX.length=length;
    midY.length=length;
    midX[0]=0.5*(vectorsX[length-1]+vectorsX[0]);
    midY[0]=0.5*(vectorsY[length-1]+vectorsY[0]);
    for (let i = 1; i < length; i++) {
            midX[0]=0.5*(vectorsX[i-1]+vectorsX[i]);
    midY[0]=0.5*(vectorsY[i-1]+vectorsY[i]);
    }
    return [midX,midY];
}




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

Polygon.prototype.saveForDrawing = function() {
    Polygon.collection.push(this);
    // indices for each generation
    // asymmetric, each index going from 0 to Polygon.subdivisions[generation]-1
    this.indices = [];
    this.indices.length = Polygon.generations;
    this.indices.fill(0);
    // symmetric, each index going from 0 to floor(Polygon.subdivisions[generation]/2) and back to 0
    this.symmetricIndices = [];
    this.symmetricIndices.length = Polygon.generations;
    this.symmetricIndices.fill(0);
    for (let i = 0; i < Polygon.generations; i++) {
        let ix = Polygon.indices[i];
        this.indices[i] = ix;
        this.symmetricIndices[i] = Math.min(ix, Polygon.subdivisions[i] - 1 - ix);
    }
};

// subdivide the polygon or store it for showing
Polygon.prototype.subdivide = function() {
    // indices go from 0 ... number of subdivisions-1
    // reset indices of child tiles
    for (let i = this.generation; i < Polygon.generations; i++) {
        Polygon.indices[i] = -1;
    }
    // increase index of this tile
    Polygon.indices[this.generation - 1] += 1;
    // if final generation achieved store polygon else continue fragmentation
    if (this.generation >= Polygon.generations) {
        this.saveForDrawing();
    } else {
        const nChilds = Polygon.subdivisions[this.generation];
        const nCorners = this.cornersX.length;
        console.log('ncorners', nCorners);
        if (nChilds === 0) {
            this.concentricPentagons();
        } else if (nChilds === 1) {
            this.concentricQuads();
        } else {
            switch (Polygon.subdivApproach) {
                case 'graphEuclidean':
                    this.graphEuclidean();
                    break;
                case 'modular 3':
                    switch (nChilds) {
                        case 2:
                            if (nCorners === 3) {
                                this.triangleTo2Triangles();
                            }
                            if (nCorners === 4) {
                                this.quadTo2Triangles();
                            }
                            break;
                        case 3:
                            if (nCorners === 3) {
                                this.triangleTo3Triangles();
                            }
                            break;
                        case 4:
                            if (nCorners === 3) {
                                this.triangleTo4Triangles();
                            }
                            if (nCorners === 4) {
                                this.quadTo4Triangles();
                            }
                            break;
                        case 5:
                            if (nCorners === 3) {
                                this.triangleTo5Triangles();
                            }
                            break;
                        case 6:
                            if (nCorners === 3) {
                                this.triangleTo6Triangles();
                            }
                            if (nCorners === 4) {
                                this.quadTo6Triangles();
                            }
                            break;
                        case 8:
                            if (nCorners === 4) {
                                this.quadTo8Triangles();
                            }
                            break;
                    }
                    break;
                case 'modular 4':
                    switch (nChilds) {
                        case 2:
                            if (nCorners === 3) {
                                this.triangleTo2Quads();
                            }
                            if (nCorners === 4) {
                                this.quadTo2Quads();
                            }
                            break;
                        case 3:
                            if (nCorners === 3) {
                                this.triangleTo3Quads();
                            }
                            if (nCorners === 4) {
                                this.quadTo3Quads();
                            }
                            break;
                        case 4:
                            if (nCorners === 3) {
                                this.triangleTo4Quads();
                            }
                            if (nCorners === 4) {
                                this.quadTo4Quads();
                            }
                            break;
                        case 5:
                            if (nCorners === 3) {
                                this.triangleTo5Quads();
                            }
                            if (nCorners === 4) {
                                this.quadTo5Quads();
                            }
                            break;
                        case 6:
                            if (nCorners === 3) {
                                this.triangleTo6Quads();
                            }
                            if (nCorners === 4) {
                                this.quadTo6Quads();
                            }
                            break;
                        case 7:
                            if (nCorners === 4) {
                                this.quadTo7Quads();
                            }
                            break;
                        case 8:
                            if (nCorners === 4) {
                                this.quadTo8Quads();
                            }
                            break;
                    }
                    break;
            }
        }
    }
};
