/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const mod3 = {};

mod3.setup = function() {

    // subdivision of triangles into triangles
    //==========================================================

    Polygon.prototype.triangleTo2Triangles = function() {
        let midX12 = 0.5 * (this.cornersX[2] + this.cornersX[1]);
        let midY12 = 0.5 * (this.cornersY[2] + this.cornersY[1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.addCorner(midX12, midY12);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(midX12, midY12);
        p2.addCorner(this.cornersX[2], this.cornersY[2]);
        p2.addCorner(this.cornersX[0], this.cornersY[0]);
        p2.subdivide();
    };

    Polygon.prototype.triangleTo3Triangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(this.cornersX[2], this.cornersY[2]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.addCorner(this.cornersX[0], this.cornersY[0]);
        p3.subdivide();
    };

    Polygon.prototype.triangleTo4Triangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        let midX12 = 0.5 * (this.cornersX[2] + this.cornersX[1]);
        let midY12 = 0.5 * (this.cornersY[2] + this.cornersY[1]);
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX12, midY12);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX12, midY12);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(this.cornersX[0], this.cornersY[0]);
        p4.subdivide();
    };

    Polygon.prototype.triangleTo5Triangles = function() {
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
    };

    Polygon.prototype.triangleTo6Triangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
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
    };

    // quadrangles to triangles
    //==================================================================

    Polygon.prototype.quadTo2Triangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.addCorner(this.cornersX[2], this.cornersY[2]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(this.cornersX[2], this.cornersY[2]);
        p2.addCorner(this.cornersX[3], this.cornersY[3]);
        p2.addCorner(this.cornersX[0], this.cornersY[0]);
        p2.subdivide();
    };

    Polygon.prototype.quadTo4Triangles = function() {
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
        const p1 = new Polygon(this.generation + 1);
        p1.addCorner(centerX, centerY);
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(this.cornersX[2], this.cornersY[2]);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.addCorner(this.cornersX[3], this.cornersY[3]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[3], this.cornersY[3]);
        p4.addCorner(this.cornersX[0], this.cornersY[0]);
        p4.subdivide();
    };

    Polygon.prototype.quadTo6Triangles = function() {
        this.shiftMod4();
        let length = this.cornersX.length;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
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
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(this.cornersX[1], this.cornersY[1]);
        p1.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX2, midY2);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX3, midY3);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(midX3, midY3);
        p5.addCorner(this.cornersX[3], this.cornersY[3]);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(this.cornersX[3], this.cornersY[3]);
        p6.addCorner(this.cornersX[0], this.cornersY[0]);
        p6.subdivide();
    };

    Polygon.prototype.quadTo8Triangles = function() {
        let length = this.cornersX.length;
        var centerX, centerY;
        [centerX, centerY] = this.getCenter();
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
        p1.addCorner(this.cornersX[0], this.cornersY[0]);
        p1.addCorner(midX1, midY1);
        p1.subdivide();
        const p11 = new Polygon(this.generation + 1);
        p11.addCorner(centerX, centerY);
        p11.addCorner(midX1, midY1);
        p11.addCorner(this.cornersX[1], this.cornersY[1]);
        p11.subdivide();
        const p2 = new Polygon(this.generation + 1);
        p2.addCorner(centerX, centerY);
        p2.addCorner(this.cornersX[1], this.cornersY[1]);
        p2.addCorner(midX2, midY2);
        p2.subdivide();
        const p3 = new Polygon(this.generation + 1);
        p3.addCorner(centerX, centerY);
        p3.addCorner(midX2, midY2);
        p3.addCorner(this.cornersX[2], this.cornersY[2]);
        p3.subdivide();
        const p4 = new Polygon(this.generation + 1);
        p4.addCorner(centerX, centerY);
        p4.addCorner(this.cornersX[2], this.cornersY[2]);
        p4.addCorner(midX3, midY3);
        p4.subdivide();
        const p5 = new Polygon(this.generation + 1);
        p5.addCorner(centerX, centerY);
        p5.addCorner(midX3, midY3);
        p5.addCorner(this.cornersX[3], this.cornersY[3]);
        p5.subdivide();
        const p6 = new Polygon(this.generation + 1);
        p6.addCorner(centerX, centerY);
        p6.addCorner(this.cornersX[3], this.cornersY[3]);
        p6.addCorner(midX4, midY4);
        p6.subdivide();
        const p66 = new Polygon(this.generation + 1);
        p66.addCorner(centerX, centerY);
        p66.addCorner(midX4, midY4);
        p66.addCorner(this.cornersX[0], this.cornersY[0]);
        p66.subdivide();
    };
};