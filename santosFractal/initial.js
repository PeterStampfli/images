/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const initial = {};

initial.setup = function() {

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

    Polygon.createInitial = function() {
        const subdivisions = Polygon.subdivisions[0];
        var basisPolygon;
        if (Polygon.initial === 'double triangles') {
            if (((subdivisions & 1) === 0) && (subdivisions > 5)) {
                basisPolygon = Polygon.createRegular(subdivisions / 2);
            } else {
                if (Polygon.noAlert) {
                    Polygon.noAlert = false;
                    alert('cannot do double triangles for odd number of children or initial subdivison smaller than 6 ');
                }
                return;
            }
        } else {
            if (subdivisions === 2) {
                basisPolygon = Polygon.createRegular(4);
            } else {
                basisPolygon = Polygon.createRegular(subdivisions);
            }
        }
        switch (Polygon.initial) {
            case 'triangles':
                basisPolygon.initialTriangles();
                break;
            case 'double triangles':
                basisPolygon.initialDoubleTriangles();
                break;
            case 'quadrangles':
                basisPolygon.initialQuadrangles();
                break;
            case 'pseudo quadrangles':
                basisPolygon.initialPseudoQuadrangles();
                break;
        }
    };
};