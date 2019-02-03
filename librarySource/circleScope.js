/**
 * similar to threeMirrorskaleidoscope+basicKaleidoscop, but with two circles instead of one
 * both circles invert inside out
 * @namespace circleScope
 */

/* jshint esversion:6 */

circleScope = {};


(function() {
    "use strict";
    circleScope.maxIterations = 100;
    // radius of a poincare disc ??
    circleScope.discRadius = -1;
    // cutoff or not
    circleScope.discCutoff = true;

    circleScope.dihedral = new Dihedral();
    let dihedral = circleScope.dihedral;

    var worldradius, worldradius2;

    /**
     * set the worldtradius (and its square)
     * @method circleScope.setWorldradius
     * param {float} radius
     */
    circleScope.setWorldradius = function(radius) {
        worldradius = radius;
        worldradius2 = radius * radius;
    };

    circleScope.setWorldradius(9.7);

    /**
     * set coloring/cutoff disc radius
     * @method circleScope.setDiscRadius
     * @param {float} radius
     */
    circleScope.setDiscRadius = function(radius) {
        circleScope.discRadius = radius;
    };

    // trigonometric functions of the angle between the dihedral mirrors
    var sinGamma1, cosGamma1;
    /**
     * set dihedral order and sin and cos of angle gamma1 between reflecting lines
     * @method circleScope.setDihedral
     * @param {integer} k, the order
     */
    circleScope.setDihedral = function(k) {
        circleScope.dihedral.setOrder(k);
        cosGamma1 = Fast.cos(Math.PI / k);
        sinGamma1 = Fast.sin(Math.PI / k);
    };
    circleScope.setDihedral(1);

    /**
     * get dihedral order
     * @method circleScope.setDihedral
     * @result {integer} k, the order
     */
    circleScope.getDihedral = function() {
        return circleScope.dihedral.n;
    };

    /**
     * set the mappings
     * @method circleScope.setMapping
     */
    circleScope.setMapping = function() {
        if (circleScope.discCutoff) {
            Make.map.discRadius = circleScope.discRadius;
        } else {
            Make.map.discRadius = -1;
        }
        Make.setMapping(circleScope.map);
    };


    /**
     * doing something to finish the mapping
     * here it does nothing, rewrite to do something
     * @method circleScope.finishMap
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    circleScope.finishMap = function(position, furtherResults) {};

    /**
     * switching off any finishing mapInputImage
     * @method circleScope.noFinishMap
     */
    circleScope.noFinishMap = function() {
        circleScope.finishMap = function(position, furtherResults) {};
    };

    /**
     * doing nothing, as identity projection or transform after the iterative mapping
     * @method circleScope.doNothing
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    circleScope.doNothing = function(position, furtherResults) {
        return 1;
    };

    /**
     * doing a projection before the mapping
     * here it does nothing, rewrite to do something
     * @method circleScope.projection
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    circleScope.projection = circleScope.doNothing;


    // circle inversion as projection
    circleScope.inversionCircle = new Circle(1, 0, 0);

    /**
     * set the data for the inversion circle used for projection
     * @method circleScope.setInversionCircle
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     */
    circleScope.setInversionCircle = function(radius, centerX, centerY) {
        circleScope.inversionCircle.setRadiusCenterXY(radius, centerX, centerY);
    };

    /**
     * use circle inversion as initial projection
     * @method circleScope.circleInversionProjection
     * @param {Vector2} v - the vector to map
     */
    circleScope.circleInversionProjection = function(v) {
        circleScope.inversionCircle.invert(v);
        return 1;
    };

    /**
     * map the position for using an input image,
     * HACK: circleScope.reflectionsAtWorldradius gives number of reflections at worldradius
     * @method circleScope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    // circleScope.reflectionsAtWorlradius; gives number of reflections...


    circleScope.map = function(position, furtherResults) {
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        circleScope.reflectionsAtWorldradius = 0;
        if (circleScope.projection(position) < -0.1) {
            furtherResults.lyapunov = -1;
            return;
        }
        dihedral.map(position);
        furtherResults.reflections += Dihedral.reflections;
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            if (circleScope.circle1.map(position) > 0) {
                changed = true;
                furtherResults.reflections++;
                furtherResults.iterations++;
                dihedral.map(position);
                furtherResults.reflections += Dihedral.reflections;
            }
            if (circleScope.circle2.map(position) > 0) {
                changed = true;
                furtherResults.reflections++;
                furtherResults.iterations++;
                dihedral.map(position);
                furtherResults.reflections += Dihedral.reflections;
            }
        }
        furtherResults.reflections += circleScope.reflectionsAtWorldradius;
        if (changed) {
            furtherResults.lyapunov = -1;
        } else {
            furtherResults.lyapunov = 1;
        }
        circleScope.finishMap(position, furtherResults);
    };

    /**
     * drawing the mirrors 
     * @method circleScope.draw 
     */
    circleScope.draw = function() {
        dihedral.drawMirrors();
        circleScope.circle1.draw();
        circleScope.circle2.draw();
    };

    // drawing the trajectory

    let mousePosition = new Vector2();
    const lastPosition = new Vector2();
    circleScope.pointColor = new Color(255, 255, 255);
    circleScope.trajectoryColor = new Color(255, 255, 0);

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method circleScope.drawTrajectory
     * @param {Vector2} position
     */
    circleScope.drawTrajectory = function(position) {
        let iterations = 0;
        const positions = [];
        positions.push(position.clone());
        const sizes = [];
        let size = 1;
        sizes.push(size);
        // do the mapping and draw lines
        Draw.setColor(circleScope.trajectoryColor);
        Draw.setLineWidth(basicUI.lineWidth);
        dihedral.drawMap(position);
        positions.push(position.clone());
        sizes.push(size);
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            lastPosition.set(position);
            let factor = circleScope.circle1.map(position);
            if (factor >= 0) {
                changed = true;
                iterations++;
                size *= factor;
                sizes.push(size);
                positions.push(position.clone());
                Draw.line(lastPosition, position);
                dihedral.drawMap(position);
                positions.push(position.clone());
                sizes.push(size);
            }
            lastPosition.set(position);
            factor = circleScope.circle2.map(position);
            if (factor >= 0) {
                changed = true;
                iterations++;
                size *= factor;
                sizes.push(size);
                positions.push(position.clone());
                Draw.line(lastPosition, position);
                dihedral.drawMap(position);
                positions.push(position.clone());
                sizes.push(size);
            }
        }
        // draw the endpoints, scaled sizes
        Draw.setColor(circleScope.pointColor);
        let nullRadius = Make.outputImage.scale * basicUI.nullRadius;
        let sizesLength = sizes.length;
        let endSize = sizes[sizesLength - 1];
        if (endSize > 0) {
            if (endSize < 1) {
                nullRadius /= endSize;
            }
            for (i = 0; i < sizesLength; i++) {
                Draw.circle(nullRadius * sizes[i], positions[i]);
            }
        }
    };

    /**
     * set up mouse listeners on output image for drawing trajectory
     * @method circleScope.setupMouseForTrajectory
     */
    circleScope.setupMouseForTrajectory = function() {
        Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
            Make.outputImage.mouseEvents.dragAction(mouseEvents);
        };
        Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
            Make.updateOutputImage();
        };
        Make.outputImage.move = function(mouseEvents) {
            let nullRadius = Make.outputImage.scale * basicUI.nullRadius;
            Make.updateOutputImage();
            mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
            Make.outputImage.pixelToSpaceCoordinates(mousePosition);
            Draw.setColor("red");
            circleScope.drawTrajectory(mousePosition);
        };
    };

    /**
     * a nothing map 
     * @method circleScope.nothingMap
     * @return -1 because it does nothing
     */
    circleScope.nothingMap = function() {
        return -1;
    };

    /**
     * make a circle that does nothing
     * @method circleScope.circleZero
     * @return Circle, radius zero map method does nothing
     */
    circleScope.circleZero = function() {
        const circle = new Circle(0, new Vector2(0, 0));
        circle.map = circleScope.nothingMap;
        return circle;
    };

    /**
     * make a circle that does nothing
     * @method circleScope.secondCircleZero
     * @return Circle, radius zero map method does nothing
     */
    circleScope.circleDeco = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circle.map = circleScope.nothingMap;
        return circle;
    };

    circleScope.circle1 = circleScope.circleZero();
    circleScope.circle2 = circleScope.circleZero();

    /**
     * create a circle with inside out mapping method
     * @method circleScope.circleInsideOut
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    circleScope.circleInsideOut = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circle.map = circle.invertInsideOut;
        return circle;
    };

    /**
     * create a circle with inside out mapping method, limited to the disc with worldradius
     * @method circleScope.circleInsideOutLimited
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    circleScope.circleInsideOutLimited = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circle.map = function(position) {
            let first = circle.invertInsideOut(position);
            if (first > 0) {
                const length2 = position.x * position.x + position.y * position.y;
                if (length2 > worldradius2) {
                    const scale = worldradius2 / length2;
                    circleScope.reflectionsAtWorldradius++;
                    first *= scale;
                    position.x *= scale;
                    position.y *= scale;
                }
            }
            return first;
        };
        return circle;
    };

    /**
     * create a circle with outside in mapping method
     * @method circleScope.circleOutSideIn
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    circleScope.circleOutsideIn = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circle.map = circle.invertOutsideIn;
        return circle;
    };

    /**
     * create a line with right to left (looking from a to b) mapping method
     * @method circleScope.lineRightLeft
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     * @return Line
     */
    circleScope.lineRightLeft = function(ax, ay, bx, by) {
        const line = new Line(ax, ay, bx, by);
        line.map = line.mirrorRightToLeft;
        return line;
    };

    /**
     * create a line with left to right (looking from a to b) mapping method
     * @method circleScope.lineLeftRight
     * @param {float} ax
     * @param {float} ay
     * @param {float} bx
     * @param {float} by
     * @return Line
     */
    circleScope.lineLeftRight = function(ax, ay, bx, by) {
        const line = new Line(ax, ay, bx, by);
        line.map = line.mirrorLeftToRight;
        return line;
    };





}());
