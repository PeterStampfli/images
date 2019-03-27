/**
 * collecting unique lines  as four coordinates and drawing them
 */

/* jshint esversion:6 */

/**
 * @constructor DrawingLines
 */


function DrawingLines() {
    this.axs = [];
    this.ays = [];
    this.bxs = [];
    this.bys = [];
}



(function() {
    "use strict";

    console.log("drawing");

    /**
     * return true if empty
     * @method DrawingLines#isEmpty
     * @return boolean, true if arrays empty
     */
    DrawingLines.prototype.isEmpty = function() {
        return this.axs.length === 0;
    };

    /**
     * draw the lines
     * @method DrawingLines.draw
     */
    DrawingLines.prototype.draw = function() {
        const axs = this.axs;
        const ays = this.ays;
        const bxs = this.bxs;
        const bys = this.bys;
        const length = axs.length;
        for (var i = 0; i < length; i++) {
            Draw.lineCoordinates(axs[i], ays[i], bxs[i], bys[i]);
        }
    };

    const eps = 0.01;
    /**
     * add a line, no dublicates
     * @method DrawingLines#add
     * @param {Vector2} a
     * @param {Vector2} b
     */
    DrawingLines.prototype.add = function(a, b) {
        const ax = a.x;
        const ay = a.y;
        const bx = b.x;
        const by = b.y;
        const axs = this.axs;
        const ays = this.ays;
        const bxs = this.bxs;
        const bys = this.bys;
        const length = axs.length;
        for (var i = 0; i < length; i++) {
            console.log(i);
            if (Math.abs(ax - axs[i]) < eps && Math.abs(ay - ays[i]) < eps && Math.abs(bx - bxs[i]) < eps && Math.abs(by - bys[i]) < eps) {
                console.log("dub1");
                return;
            }
            if (Math.abs(bx - axs[i]) < eps && Math.abs(by - ays[i]) < eps && Math.abs(ax - bxs[i]) < eps && Math.abs(ay - bys[i]) < eps) {
                console.log("dub2");
                return;
            }
        }
        axs.push(ax);
        ays.push(ay);
        bxs.push(bx);
        bys.push(by);
    };

    /**
     * add sides of a image parallelgram with directed sides, two different corner types
     * @method DrawingLines.addParallelogram
     * @param {float} angle
     * @param {Vector2} left - clone if changed later
     * @param {Vector2} right - clone if changed later
     */
    DrawingLines.prototype.addParallelogram = function(angle, left, right) {
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        this.add(left, bottom);
        this.add(left, top);
        this.add(bottom, right);
        this.add(top, right);
        Vector2.toPool(halfDiagonal, center, top, bottom);
    };


}());
