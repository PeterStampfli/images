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
    rotaScope.multiCircles = [];
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
        rotaScope.multiCircles.length = 0;
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
        rotaScope.multiCircles.push(multiCircle);
        const center = new Vector2(centerX, centerY);
        for (var i = 2 * rotaScope.rotationGroup.n; i > 0; i--) {
            multiCircle.push(new Circle(radius, center.clone()));
            rotationGroup.rotatePlus(center);
        }

        return circle;
    };


    /**
     * map the position using rotational symmetry and collection of inverting circles
     * @method rotaScope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, lyapunov and colorSector
     */
    const trialPosition = new Vector2();
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
                trialPosition.set(position);
                // rotate and try the position
                let delta = rotaScope.angles[iCircle] - trialPosition.theAngle;
                if (delta < 0) {
                    delta += zPi;
                }
                const iMap = Math.round(delta / rotationGroup.angle);
                const multiCircle = rotaScope.multiCircles[iCircle];
                rotationGroup.maps[iMap](trialPosition);
                if (rotaScope.circles[iCircle].map(trialPosition) > 0) {
                    furtherResults.reflections++;
                    furtherResults.iterations++;
                    changed = true;
                    position.set(trialPosition);
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
            let delta = position.theAngle;
            if (delta < 0) {
                delta += 2 * Math.PI;
            }
            let iMap = Math.floor(delta / rotationGroup.angle);
            rotationGroup.maps[rotationGroup.n - iMap](position);
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
            const multiCircle = rotaScope.multiCircles[i];
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
