/**
 * similar to circlescope
 * but with an unlimited number of inverting circles, inverting inside out
 * @namespace rotaScope
 */

/* jshint esversion:6 */

rotaScope = {};

(function() {
    "use strict";
    rotaScope.maxIterations = 100;


    const rotationGroup = new RotationGroup();
    rotaScope.rotationGroup = rotationGroup;
    // a collection of inverting circles
    rotaScope.circles = [];
    const multiCircles = [];
    rotaScope.angles = [];

    // the concentric circles
    rotaScope.doInner = false;
    rotaScope.doOuter = false;
    rotaScope.innerRadius = 0;
    rotaScope.innerRadius2 = 0;
    rotaScope.outerRadius = 99999999;
    rotaScope.outerRadius2 = 99999999;

    /**
     * set radius of inner concentric
     * @method rotaScope.setInnerRadius
     * @param {float} r
     */
    rotaScope.setInnerRadius = function(r) {
        rotaScope.innerRadius = r;
        rotaScope.innerRadius2 = r * r;
    };

    /**
     * set radius of outer concentric
     * @method rotaScope.setOuterRadius
     * @param {float} r
     */
    rotaScope.setOuterRadius = function(r) {
        rotaScope.outerRadius = r;
        rotaScope.outerRadius2 = r * r;
    };

    /**
     * initialization: clear arrays
     * @method rotaScope.reset
     */
    rotaScope.reset = function() {
        rotaScope.circles.length = 0;
        rotaScope.angles.length = 0;
        multiCircles.length = 0;
    };

    /**
     * set the rosette parameters
     * @method rotaScope.setRosetteParameters
     * @param {int} k - order of rotational symmetry
     * @param {int} r - power for radius
     */
    rotaScope.setRosetteParameters = function(k, r) {
        rotaScope.rotationGroup.setOrder(k);
        rotaScope.rotationGroup.setRadialPower(r);
    };

    /**
     * create a circle with inside out mapping method
     * create rotationally symmetric images of the circle
     * @method rotaScope.circleInsideOut
     * @param {float} radius
     * @param {float} centerX
     * @param {float} centerY
     * @return Circle
     */
    rotaScope.circleInsideOut = function(radius, centerX, centerY) {
        const circle = new Circle(radius, centerX, centerY);
        circle.map = circle.invertInsideOut;
        rotaScope.circles.push(circle);
        rotaScope.angles.push(Math.atan2(centerY, centerX));
        // The angle should not be too large ?? be generous
        const multiCircle = [];
        multiCircle.length = 2 * rotaScope.rotationGroup.n;
        multiCircles.push(multiCircle);
        const center = new Vector2(centerX, centerY);
        for (var i = 0; i < multiCircle.length; i++) {
            multiCircle[i] = new Circle(radius, center.clone());
            multiCircle[i].map = multiCircle[i].invertInsideOut;
            rotationGroup.rotatePlus(center);
        }
        return circle;
    };


    /**
     * map the position using a collection of inverting circles
     * (actually rotationally symmetric collections)
     * the endpoint of the mapping may lie everythere, is not mapped to first sector
     * position has valid angle at return
     * @method rotaScope.mapInputImage
     * @param {Vector2} position - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    const zPi = 2 * Math.PI;

    rotaScope.map = function(position, furtherResults) {
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        position.angle();
        let iter = rotaScope.maxIterations;
        let changed = true;
        const nCircles = rotaScope.circles.length;
        while ((iter > 0) && changed) {
            changed = false;
            // try a mapping at each circle
            for (var iCircle = 0; iCircle < nCircles; iCircle++) {
                let delta = position.theAngle - rotaScope.angles[iCircle];
                if (delta < 0) {
                    delta += zPi;
                }
                const iMap = Math.round(delta / rotationGroup.angle);
                if (multiCircles[iCircle][iMap].map(position) > 0) {
                    furtherResults.reflections++;
                    furtherResults.iterations++;
                    changed = true;
                    position.angle();
                }
            }
            // concentric circles
            if (rotaScope.doInner) {
                let r2 = position.length2();
                if (r2 < rotaScope.innerRadius2) {
                    position.scale(rotaScope.innerRadius2 / r2);
                    furtherResults.reflections++;
                    changed = true;
                }
            }
            if (rotaScope.doOuter) {
                let r2 = position.length2();
                if (r2 > rotaScope.outerRadius2) {
                    position.scale(rotaScope.outerRadius2 / r2);
                    furtherResults.reflections++;
                    changed = true;
                }
            }
            iter--;
        }
        if (changed) {
            furtherResults.lyapunov = -1;
        } else {
            furtherResults.lyapunov = 1;
        }
    };



    /**
     * drawing the sector
     * @method rotaScope.drawSector
     */
    rotaScope.drawSector = function() {
        rotaScope.rotationGroup.drawSector();
    };

    const zero = new Vector2();

    /**
     * draw the circles
     * @method rotaScope.drawCircles
     */
    rotaScope.drawCircles = function() {
        for (var i = 0; i < rotaScope.circles.length; i++) {
            const multiCircle = multiCircles[i];
            for (var j = 0; j < rotaScope.rotationGroup.n; j++) {
                multiCircle[j].draw();
            }


            // rotaScope.rotationGroup.drawCircles(rotaScope.circles[i]);
        }
        if (rotaScope.doInner) {
            Draw.circle(rotaScope.innerRadius, zero);
        }
        if (rotaScope.doOuter) {
            Draw.circle(rotaScope.outerRadius, zero);
        }
    };

}());
