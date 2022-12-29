/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const subdivs = {};

subdivs.setup = function() {
    console.log('setup');
    
    Polygon.prototype.simpleTriangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        const nCorners = this.nCorners;
        // subdivision of border
        const addVertices = false;
        for (let i = 0; i < nCorners; i++) {
            const p = new Polygon(this.generation + 1);
            p.addCorner(centerX, centerY);
            if (addVertices) {
                p.addCorner(0.5 * (centerX + this.cornersX[i]), 0.5 * (centerY + this.cornersY[i]));
            }
            p.addCorner(this.cornersX[i], this.cornersY[i]);
            const ip = (i + 1) % nCorners;
            p.addCorner(this.cornersX[ip], this.cornersY[ip]);
            if (addVertices) {
                p.addCorner(0.5 * (centerX + this.cornersX[ip]), 0.5 * (centerY + this.cornersY[ip]));
            }
            p.subdivide();
        }
    };

};