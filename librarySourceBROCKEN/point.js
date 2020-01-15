/**
 * point: representing a position given by a vector2, draw as a simple disc
 * @constructor Point
 * @param {Vector2} position
 */

/* jshint esversion:6 */

function Point(position) {
    "use strict";
    this.position = position;
    this.color = "blue"; // default
    this.radius = 10;
}


(function() {
    "use strict";

    /**
     * set the point
     * @method Point#set
     * @param {Vector2} position - new point
     */
    Point.prototype.set = function(position) {
        this.position = position;
    };

    /**
     * set color
     * @method Point#setColor
     * @param {String} color - stroke style 
     */
    Point.prototype.setColor = function(color) {
        this.color = color;
    };

    /**
     * set disc size
     * @method Point#setSize
     * @param {float} lineWidth 
     */
    Point.prototype.setSize = function(size) {
        this.radius = 0.5 * size;
    };

    /**
     * draw the circle on an output image
     * @method Point#draw
     * @param {OutputImage} outputImage
     */
    Point.prototype.draw = function(outputImage) {
        let context = outputImage.pixelCanvas.canvasContext;
        context.fillStyle = this.color;
        context.beginPath();
        context.moveTo(this.position.x + this.radius * outputImage.scale, this.position.y);
        context.arc(this.position.x, this.position.y, this.radius * outputImage.scale, 0, 2 * Math.PI);
        context.fill();
    };

}());
