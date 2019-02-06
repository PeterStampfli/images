/**
 * similar to threeMirrorskaleidoscope+basicKaleidoscop, but with many circles instead of one
 * up to three circles?
 * @namespace circleScope
 */

/* jshint esversion:6 */

circleScope = {};


(function() {
    "use strict";
    circleScope.maxIterations = 100;
    // radius of a poincare disc ??
    circleScope.discRadius = -1;


    // the elements
    circleScope.elements = [];
    // the elements as arrays of symmetric copies according to dihedral symmetry
    circleScope.symmetricElements = [];

    /**
     * reset things
     * @method circleScope.reset
     */
    circleScope.reset = function() {
        circleScope.elements.length = 0;
        circle1.map = circleScope.doNothing;
        circle2.map = circleScope.doNothing;
        circle3.map = circleScope.doNothing;
    };

    // the circes
    circleScope.circle1 = new Circle();
    circleScope.circle2 = new Circle();
    circleScope.circle3 = new Circle();



    /**
     * add a circle to elements, without mapping method
     * @method circleScope.addCircle
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    circleScope.addCircle = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circleScope.elements.push(circle);
        return circle;
    };

    /**
     * make symmetric circles in a new array, using the circle element at the top
     * @method circleScope.makeSymmetricCircles
     */
    circleScope.makeSymmetricCircles = function() {
        const index = circleScope.elements.length - 1;
        console.log(index);
        const circle = circleScope.elements[index];
        if (circleScope.elements.length > circleScope.symmetricElements.length) {
            circleScope.symmetricElements.push([]);
        }
        circleScope.dihedral.generateCircles(circle, circleScope.symmetricElements[index]);
        console.log(circleScope.symmetricElements[index]);
    };

    /**
     * add a circle to elements, with inside out mapping method
     * @method circleScope.addCircleInsideOut
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    circleScope.addCircleInsideOut = function(radius, centerX, centerY) {
        const circle = circleScope.addCircle(radius, centerX, centerY);
        circle.map = circle.invertInsideOut;
        circleScope.makeSymmetricCircles();
        return circle;
    };


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
     * set vectormap to use the circlescope mapping
     * @method circleScope.setMapping
     */
    circleScope.setMapping = function() {
        Make.setMapping(circleScope.map);
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



    /**
     * doing something to start the mapping
     * here it does nothing, rewrite to do something,
     * inversion at a straight line for translation ?
     * inverting if outside world...
     * @method circleScope.startMap
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    circleScope.startMap = function(position, furtherResults) {};

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
        const elements = circleScope.elements;
        const elementsLength = elements.length;
        const symmetricElements = circleScope.symmetricElements;
        if (circleScope.projection(position) < -0.1) {
            furtherResults.lyapunov = -1;
            return;
        }
        dihedral.map(position);
        furtherResults.reflections += Dihedral.reflections;
        // let sectorIndex = dihedral.getSectorIndex(position);
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            for (var j = elementsLength - 1; j >= 0; j--) {
                if (elements[j].map(position) >= 0) {
                    changed = true;
                    // sectorIndex = dihedral.getSectorIndex(position);
                    furtherResults.reflections++;
                    furtherResults.iterations++;
                    dihedral.map(position);

                    furtherResults.reflections += Dihedral.reflections;
                }
            }
        }

        //               circleScope.sectorIndex=sectorIndex;
        // dihedral.mapOfSector(sectorIndex,position);
        dihedral.map(position);
        furtherResults.reflections += Dihedral.reflections;

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
        Draw.array(circleScope.elements);
    };

    // drawing the trajectory

    let mousePosition = new Vector2();
    const lastPosition = new Vector2();
    circleScope.trajectoryColor = new Color(255, 255, 255);

    /**
     * draw the trajectory no endpoints 
     * @method circleScope.drawTrajectory
     * @param {Vector2} position
     */
    circleScope.drawTrajectory = function(position) {
        const elements = circleScope.elements;
        const elementsLength = elements.length;
        // do the mapping and draw lines
        Draw.setColor(circleScope.trajectoryColor);
        Draw.setLineWidth(basicUI.lineWidth);
        dihedral.drawMap(position);
        var i = circleScope.maxIterations;
        var changed = true;
        while ((i > 0) && changed) {
            i--;
            changed = false;
            for (var j = elementsLength - 1; j >= 0; j--) {
                lastPosition.set(position);
                if (elements[j].map(position) >= 0) {
                    changed = true;
                    Draw.line(lastPosition, position);
                    dihedral.drawMap(position);
                }
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
