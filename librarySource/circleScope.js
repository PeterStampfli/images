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
     * map the position for using an input image,
     * @method circleScope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    circleScope.map = function(position, furtherResults) {
        furtherResults.lyapunov = -1;
        furtherResults.reflections = 0;
        for (var i = circleScope.maxIterations; i > 0; i--) {
            dihedral.map(position);
            furtherResults.reflections += Dihedral.reflections;
            if ((circleScope.circle1.map(position) > 0) || (circleScope.circle2.map(position) > 0)) {
                furtherResults.reflections++;
            } else {
                furtherResults.lyapunov = 1;
                break;
            }
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
        const positions = [];
        positions.push(position.clone());
        const sizes = [];
        let size = 1;
        sizes.push(size);
        // do the mapping and draw lines
        Draw.setColor(circleScope.trajectoryColor);
        Draw.setLineWidth(Layout.lineWidth);
        for (var i = circleScope.maxIterations; i > 0; i--) {
            dihedral.drawMap(position);
            positions.push(position.clone());
            sizes.push(size);
            lastPosition.set(position);
            let factor = circleScope.circle1.map(position);
            if (factor >= 0) {
                size *= factor;
                sizes.push(size);
                positions.push(position.clone());
                Draw.line(lastPosition, position);
            } else {
                let factor = circleScope.circle2.map(position);
                if (factor >= 0) {
                    size *= factor;
                    sizes.push(size);
                    positions.push(position.clone());
                    Draw.line(lastPosition, position);
                } else {
                    break;
                }
            }
        }
        // draw the endpoints, scaled sizes
        Draw.setColor(circleScope.pointColor);
        let nullRadius = Make.outputImage.scale * Layout.nullRadius;
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
            let nullRadius = Make.outputImage.scale * Layout.nullRadius;
            Make.updateOutputImage();
            mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
            Make.outputImage.pixelToSpaceCoordinates(mousePosition);
            circleScope.drawTrajectory(mousePosition);
        };
    };

    /**
     * make a circle that does nothing
     * @method circleScope.secondCircleZero
     * @return Circle, radius zero map method does nothing
     */
    circleScope.circleZero = function() {
        const circle = new Circle(0, new Vector2(0, 0));
        circle.map = function(p) {
            return -1;
        };
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



    /**
     * generate a triangle kaleidoscope with hyperbolic, euclidic or elliptic geometry
     * sets dihedral to k and returns a reflecting element
     * worldradius adjusted to 9.7
     * @method circleScope.triangle
     * @param {integer} k - symmetry at center
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     * @param {boolean} outer - true for outer (towards the center), false for inner reflection (away fromcenter)
     * @return circle or line suitable as outer reflection
     */
    circleScope.triangleKaleidoscope = function(k, m, n) {
        circleScope.setDihedral(k);
        const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
        console.log("angsu " + angleSum);


        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        // elliptic
        if (angleSum > 1.000001) {
            const circle = circleScope.circleOutsideIn(1, -(cosAlpha * cosGamma1 + cosBeta) / sinGamma1, cosAlpha);
            circleScope.circle1 = circle;
            let worldradius = Math.sqrt(1 - circle.center.length2());
            circle.scale(9.7 / worldradius);
            circleScope.noFinishMap();
        }
        // euklidic
        else if (angleSum > 0.999999) {
            const big = 100000;
            const line = circleScope.lineLeftRight(6 - big * cosAlpha, big * sinAlpha, 6 + big * cosAlpha, -big * sinAlpha);
            circleScope.circle1 = line;
            circleScope.noFinishMap();
        }
        // hyperbolic
        else {
            const circle = circleScope.circleInsideOut(1, (cosAlpha * cosGamma1 + cosBeta) / sinGamma1, cosAlpha);
            circleScope.circle1 = circle;
            let worldradius2 = circle.center.length2() - 1;
            console.log(worldradius2);
            circle.scale(9.7 / Math.sqrt(worldradius2));
            worldradius2 = 9.7 * 9.7;
            circleScope.finishMap = function(position, furtherResults) {
                let l2 = position.length2();
                if (l2 > worldradius2) {
                    position.scale(worldradius2 / l2);
                    furtherResults.colorSector = 1;
                } else {
                    furtherResults.colorSector = 0;
                }
            };

        }
    };

}());
