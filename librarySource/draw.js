/**
 * drawing on an output image, depends on language and system resources
 * @namespace Draw
 */

/* jshint esversion:6 */

var Draw = {};

(function() {
    "use strict";

    var context, outputImage, lineWidth, nullRadius;
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
     * @param {float} theLineWidth - in pixel
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

    /**
     * set the nullradius for drawing points/vector2 objects
     * @method Draw.setNullRadius
     * @param {float} theNullRadius
     */
    Draw.setNullRadius = function(theNullRadius) {
        nullRadius = theNullRadius;
    };

    /**
     * set the line to solid
     * @method Draw.solidLine
     */
    Draw.solidLine = function() {
        context.setLineDash([]);
    };

    /** 
     * set the line to dashed, independent of output image size
     * @method Draw.dashedLine
     * @param {integer} dashLength
     * @param {integer} gapLength
     */
    Draw.dashedLine = function(dashLength, gapLength) {
        context.setLineDash([dashLength * outputImage.scale, gapLength * outputImage.scale]);
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

    /**
     * draw a line between two points with components
     * @method Draw.lineCoordinates
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     */
    Draw.lineCoordinates = function(ax, ay, bx, by) {
        Draw.start(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
    };

    /**
     * draw a line between two points a and b, without endcircles
     * but taking into account the spaace required for endcircles
     * @method Draw.lineWithoutEnds
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {float} ra - radius of endpoint a
     * @param {float} rb - radius of endpoint b
     */
    Draw.lineWithoutEnds = function(a, b, ra, rb) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let length = Math.hypot(dx, dy);
        if (length < ra + rb) {
            return;
        }
        Draw.start(a.x + ra * dx / length, a.y + ra * dy / length);
        context.lineTo(b.x - rb * dx / length, b.y - rb * dy / length);
        context.stroke();
    };

    /**
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

    /**
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
     * draw a point/vector2 as a small circle at its position
     * @method Draw.vector2
     * @param {Vector2} p
     */
    Draw.vector2 = function(p) {
        Draw.circle(nullRadius * outputImage.scale, p);
    };

    /**
     * draw a rectangle
     * @method Draw.rectangle
     * @param {float} cornerX
     * @param {float} cornerY
     * @param {float} width
     * @param {float} height
     */
    Draw.rectangle = function(cornerX, cornerY, width, height) {
        context.strokeStyle = color;
        context.lineWidth = lineWidth * outputImage.scale;
        context.beginPath();
        context.rect(cornerX, cornerY, width, height);
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

    /**
     * draw an arc between points a and b and radius ra and rb, around center c, always taking the short path
     * @method Draw.arcWithoutEnds
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {float} ra - radius of endpoint a
     * @param {float} rb - radius of endpoint b
     * @param {Vector2} center
     */
    Draw.arcWithoutEnds = function(a, b, ra, rb, center) {
        let h = 0;
        let angleA = Fast.atan2(a.y - center.y, a.x - center.x);
        let angleB = Fast.atan2(b.y - center.y, b.x - center.x);
        let radius = Math.hypot(a.y - center.y, a.x - center.x);
        let alpha = 2 * Math.asin(0.5 * ra / radius);
        let beta = 2 * Math.asin(0.5 * rb / radius);
        // finally draw from a to b, a less than b, b-a less than pi
        if (angleA > angleB) {
            h = angleA;
            angleA = angleB;
            angleB = h;
            h = alpha;
            alpha = beta;
            beta = h;
        }
        // now angleA<angleB
        if (angleB - angleA > Math.PI) {
            angleA += 2 * Math.PI;
            // now angleA>angleB and angleA-angleB<pi
            h = angleA;
            angleA = angleB;
            angleB = h;
            h = alpha;
            alpha = beta;
            beta = h;
        }
        angleA += alpha;
        angleB -= beta;
        if (angleB < angleA) {
            return;
        }
        Draw.start(radius * Fast.cos(angleA), radius * Fast.sin(angleA));
        context.arc(center.x, center.y, radius, angleA, angleB);
        context.stroke();
    };


    /**
     * draw the items in an array, they have a draw-method
     * @method Draw.array
     * @param {array} array - of iobjects with a draw method
     */
    Draw.array = function(array) {
        array.forEach(item => {
            item.draw();
        });
    };

}());
