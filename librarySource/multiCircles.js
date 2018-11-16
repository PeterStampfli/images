/** reflections from any number of circles and lines
 * @namespace multiCircles
 */

/* jshint esversion:6 */

multiCircles = {};


(function() {
    "use strict";
    multiCircles.maxIterations = 100;
    // radius of a poincare disc ??
    multiCircles.discRadius = -1;
    // cutoff or not
    multiCircles.discCutoff = false;

    // remap if outside for image
    multiCircles.discRemapForImage = false;

    // the elements
    multiCircles.elements = [];


    /**
     * drawing the mirrors 
     * @method multiCircles.draw 
     */
    multiCircles.draw = function() {
        Draw.array(multiCircles.elements);
    };

    /**
     * reset things
     * @method multiCircles.reset
     */
    multiCircles.reset = function() {
        multiCircles.elements.length = 0;
    };

    /**
     * add a circle to elements, without mapping method
     * @method multiCircles.addCircle
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    multiCircles.addCircle = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        multiCircles.elements.push(circle);
        return circle;
    };

    /**
     * add a circle to elements, with inside out mapping method
     * @method multiCircles.addCircleInsideOut
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    multiCircles.addCircleInsideOut = function(radius, centerX, centerY) {
        const circle = multiCircles.addCircle(radius, centerX, centerY);
        circle.map = circle.invertInsideOut;
        return circle;
    };

    /**
     * add a circle to elements, with outside in mapping method
     * @method multiCircles.addCircleOutsideIn
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    multiCircles.addCircleOutsideIn = function(radius, centerX, centerY) {
        const circle = multiCircles.addCircle(radius, centerX, centerY);
        circle.map = circle.invertOutsideIn;
        return circle;
    };

    /**
     * add a line to elements, without mapping method
     * @method multiCircles.addLine
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     * @return Line
     */
    multiCircles.addLine = function(ax, ay, bx, by) {
        const line = new Line(ax, ay, bx, by);
        multiCircles.elements.push(line);
        return line;
    };

    /**
     * add a line to elements, with right to left (looking from a to b) mapping method
     * @method multiCircles.addLineRightLeft
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     * @return Line
     */
    multiCircles.addLineRightLeft = function(ax, ay, bx, by) {
        const line = multiCircles.addLine(ax, ay, bx, by);
        line.map = line.mirrorRightToLeft;
        return line;
    };

    /**
     * add a line to elements, with left to right (looking from a to b) mapping method
     * @method multiCircles.addLineLeftRight
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     * @return Line
     */
    multiCircles.addLineLeftRight = function(ax, ay, bx, by) {
        const line = multiCircles.addLine(ax, ay, bx, by);
        line.map = line.mirrorLeftToRight;
        return line;
    };


    /**
     * set the mappings
     * @method multiCircles.setMapping
     */
    multiCircles.setMapping = function() {
        multiCircles.discRadius2 = multiCircles.discRadius * multiCircles.discRadius;
        if (multiCircles.discCutoff) {
            Make.map.discRadius = multiCircles.discRadius;
        } else {
            Make.map.discRadius = -1;
        }
        Make.setMapping(multiCircles.mapInputImage, multiCircles.mapStructure);
    };





}());
