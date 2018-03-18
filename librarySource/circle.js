/**
 * a circle as an object with a radius, square of radius and center vector
 * @constructor Circle
 * @param {float} radius 
 * @param {Vector2} center
 */

/* jshint esversion:6 */

function Circle(radius, center) {
    "use strict";
    this.setRadius(radius);
    this.setCenter(center);
}

(function() {
    "use strict";

    /**
     * set radius, square of radius 
     * @method Circle#setRadius
     * @param {float} radius 
     */
    Circle.prototype.setRadius = function(radius) {
        this.radius = radius;
        this.radius2 = radius * radius;
    };

    /**
     * set center vector
     * @method Circle#setCenter
     * @param {float} radius 
     * @param {Vector2} center
     */
    Circle.prototype.setCenter = function(center) {
        this.center = center;
    };

    /*
     * drawing the circle: set styles before
     * context.strokeStyle='red';
     * context.lineWidth=10;
     * 
    /**
     *  draw the circle on an output image
     * @method Circle#draw
     * @param {OutputImage} outputImage
     */
    Circle.prototype.draw = function(outputImage) {
        let context = outputImage.pixelCanvas.canvasContext;
        context.strokeStyle = "red";
        context.lineWidth = 5 * outputImage.scale;
        console.log("cir cle");
        context.beginPath();
        context.moveTo(this.center.x + this.radius, this.center.y);
        context.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        context.moveTo(300, 200);
        //context.arc(200,200,100,0,2*Math.PI);

        context.stroke();

    };

    /**
     * check if a vector is inside the circle
     * @method Circle#contains
     * @param {Vector2} v - the vector to check
     * @return {boolean} true if vector is inside circle
     */
    Circle.prototype.contains = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        return this.radius2 >= dx * dx + dy * dy;
    };

    /**
     * invert a point at the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     */
    Circle.prototype.invert = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        const factor = this.radius2 / pointR2;
        v.x = this.center.x + dx * factor;
        v.y = this.center.y + dy * factor;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     * @return {boolean} true if the point has been inverted
     */
    Circle.prototype.invertInsideOut = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return true;
        }
        return false;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     * @return {boolean} true if the point has been inverted
     */
    Circle.prototype.invertOutsideIn = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 + 0.0001 < pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return true;
        }
        return false;
    };

}());
