/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const graphEuclidean = {};

graphEuclidean.setup = function() {
    const epsilon = 0.01;

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
};