/**
 * drawing on an output image, depends on language and system resources
 * @namespace Draw
 */

/* jshint esversion:6 */

var Draw = {};

(function() {
    "use strict";

    var context, outputImage, lineWidth;
    var color;

    /**
     * set the outputImage object, becomes graphics context
     * @method Draw.setOutputImage
     * @param {OutputImage} theOutputImage
     */
    Draw.setOutputImage = function(theOutputImage) {
        context = theOutputImage.pixelCanvas.canvasContext;
        outputImage = theOutputImage;
    };

    /**
     * set the lineWidth
     * @method Draw.setLineWidth
     * @param {float} theLineWidth
     */
    Draw.setLineWidth = function(theLineWidth) {
        lineWidth = theLineWidth;
    };

    /**
     * set the color
     * @method Draw.setColor
     * @param {String} theColor - css color string !!!
     */
    Draw.setColor = function(theColor) {
        color = theColor;
    };

    /*
     * start a drawing by setting the context and moving to start point
     */
    Draw.start = function(x, y) {
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = lineWidth * outputImage.scale;
        context.beginPath();
        context.moveTo(x, y);
    };

    /**
     * draw a line between two points a and b
     * @method Draw.line
     * @param {Vector2} a
     * @param {Vector2} b
     */
    Draw.line = function(a, b) {
        Draw.start(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
    };

    /*
     * fill a circle, draw as disc
     * @method Draw.disc
     * @param {float} radius
     * @param {Vector2} center
     */
    Draw.disc = function(radius, center) {
        Draw.start(center.x + radius, center.y);
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.fill();
    };

    /*
     * draw a circle
     * @method Draw.circle
     * @param {float} radius
     * @param {Vector2} center
     */
    Draw.circle = function(radius, center) {
        Draw.start(center.x + radius, center.y);
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
    };

    /**
     * draw an arc between points a and b around center c, always taking the short path
     * @method Draw.arc
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {Vector2} center
     */
    Draw.arc = function(a, b, center) {

        let angleA = Fast.atan2(a.y - center.y, a.x - center.x);
        let angleB = Fast.atan2(b.y - center.y, b.x - center.x);
        let radius = Math.hypot(a.y - center.y, a.x - center.x);
        if (angleA < angleB) {
            Draw.start(a.x, a.y);
            context.arc(center.x, center.y, radius, angleA, angleB, angleB - angleA > Math.PI);
            context.stroke();
        } else {


            Draw.start(b.x, b.y);
            context.arc(center.x, center.y, radius, angleB, angleA, angleA - angleB > Math.PI);
            context.stroke();

        }
    };

}());
