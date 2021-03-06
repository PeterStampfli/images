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
        Make.setMapping(multiCircles.map);
    };

    /**
     * doing nothing, as identity projection or transform after the iterative mapping
     * @method multiCircles.doNothing
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    multiCircles.doNothing = function(position, furtherResults) {};

    /**
     * doing a projection before the mapping
     * here it does nothing, rewrite to do something
     * @method multiCircles.projection
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    multiCircles.projection = multiCircles.doNothing;

    // circle inversion as projection
    multiCircles.inversionCircle = new Circle(1, 0, 0);

    /**
     * set the data for the inversion circle used for projection
     * @method multiCircles.setInversionCircle
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     */
    multiCircles.setInversionCircle = function(radius, centerX, centerY) {
        multiCircles.inversionCircle.setRadiusCenterXY(radius, centerX, centerY);
    };

    /**
     * use circle inversion as initial projection
     * @method multiCircles.circleInversionProjection
     * @param {Vector2} v - the vector to map
     */
    multiCircles.circleInversionProjection = function(v) {
        multiCircles.inversionCircle.invert(v);
    };

    /**
     * doing something to finish the mapping
     * here it does nothing, rewrite to do something
     * @method multiCircles.finishMap
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    multiCircles.finishMap = multiCircles.doNothing;

    /**
     * limit the mapping, set lyapunov=-1 if position too large, after mapping
     * @method multiCircles.limitMap
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    multiCircles.mapLimit = 10;
    multiCircles.limitMap = function(v, furtherResults) {
        if ((v.x < -multiCircles.mapLimit) || (v.x > multiCircles.mapLimit) || (v.y < -multiCircles.mapLimit) || (v.y > multiCircles.mapLimit)) {
            furtherResults.lyapunov = -1;
        }
    };


    /**
     * map the position for using an input image
     * @method multiCircles.mapEuclidic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    multiCircles.map = function(position, furtherResults) {
        furtherResults.lyapunov = -1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        multiCircles.projection(position);
        const elements = multiCircles.elements;
        const elementsLength = elements.length;
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            for (var j = elementsLength - 1; j >= 0; j--) {
                if (elements[j].map(position) >= 0) {
                    changed = true;
                    furtherResults.reflections++;
                    furtherResults.iterations++;
                }
            }
        }
        if (changed) {
            furtherResults.lyapunov = -1;
        } else {
            furtherResults.lyapunov = 1;
        }
        multiCircles.finishMap(position, furtherResults);
    };

    // drawing the trajectory

    let mousePosition = new Vector2();
    let imagePosition = new Vector2();


    /**
     * set up mouse listeners on output image for drawing trajectory
     * @method multiCircles.setupMouseForTrajectory
     */
    multiCircles.setupMouseForTrajectory = function() {
        Make.outputImage.centerAction = function(mouseEvents) {
            Make.updateOutputImage();
            mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
            Make.outputImage.pixelToSpaceCoordinates(mousePosition);
            multiCircles.drawTrajectory(mousePosition);
        };
    };


    /**
     * set up center and right mouse button action on output image for doing nothing
     * @method circleScope.setupMouseForTrajectory
     */
    multiCircles.setupMouseNoTrajectory = function() {
        Make.outputImage.centerAction = function(mouseEvents) {};
    };

    multiCircles.trajectoryColor = new Color(255, 255, 255);
    const lastPosition = new Vector2();

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method multiCircles.drawTrajectory
     * @param {Vector2} position
     */
    multiCircles.drawTrajectory = function(position) {
        // do the mapping and draw lines
        let nullRadius = Make.outputImage.scale * basicUI.nullRadius;

        Draw.setColor(circleScope.trajectoryColor);
        Draw.circle(nullRadius, position);

        const elements = multiCircles.elements;
        const elementsLength = elements.length;
        // do the mapping and draw lines
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            for (var j = elementsLength - 1; j >= 0; j--) {
                lastPosition.set(position);
                let factor = elements[j].map(position);
                if (factor >= 0) {
                    changed = true;

                    Draw.line(lastPosition, position);
                }
            }
        }
        // draw the endpoints, scaled sizes
        Draw.circle(nullRadius, position);
    };

}());
