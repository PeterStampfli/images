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
        furtherResults.iterations = 0;
        dihedral.map(position);
        furtherResults.reflections += Dihedral.reflections;
        for (var i = circleScope.maxIterations; i > 0; i--) {
            let noChange = true;
            if (circleScope.circle1.map(position) > 0) {
                noChange = false;
                furtherResults.reflections++;
                furtherResults.iterations++;
                dihedral.map(position);
                furtherResults.reflections += Dihedral.reflections;
            }
            if (circleScope.circle2.map(position) > 0) {
                noChange = false;
                furtherResults.reflections++;
                furtherResults.iterations++;
                dihedral.map(position);
                furtherResults.reflections += Dihedral.reflections;
            }
            if (noChange) {
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
        for (var i = circleScope.maxIterations; i > 0; i--) {
            let noChange = true;
            lastPosition.set(position);
            let factor = circleScope.circle1.map(position);
            if (factor >= 0) {
                noChange = false;
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
                noChange = false;
                iterations++;
                size *= factor;
                sizes.push(size);
                positions.push(position.clone());
                Draw.line(lastPosition, position);
                dihedral.drawMap(position);
                positions.push(position.clone());
                sizes.push(size);
            }
            if (noChange) {
                break;
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
     * sets dihedral to k and sets circle1 to reflecting element
     * worldradius adjusted to 9.7
     * @method circleScope.triangle
     * @param {integer} k - symmetry at center
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    circleScope.triangleKaleidoscope = function(k, m, n) {
        circleScope.circle2 = circleScope.circleZero();
        circleScope.setDihedral(k);
        const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
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


    /**
     * generate a triangle kaleidoscope with hyperbolic, euclidic or elliptic geometry
     * with an additional circle at the center
     * worldradius adjusted to 9.7
     * @method circleScope.triangleCentralCircle
     * @param {integer} k1 - order of dihedral group of image
     * @param {integer} m1 - symmetry at "right" corner of basic triangle
     * @param {integer} n1 - symmetry at "left" corner of basic triangle
     * @param {integer} k2 - symmetry of intersection of additional circle with circle side of triangle
     * @param {integer} m2 - symmetry of intersection of additional circle with "right" side of triangle
     * @param {integer} n2 - symmetry of intersection of additional circle with "right" side of triangle
     */
    circleScope.triangleCentralCircle = function(k1, m1, n1, k2, m2, n2) {
        circleScope.setDihedral(k1);
        const angleSum = 1.0 / k1 + 1.0 / m1 + 1.0 / n1;
        const cosAlpha1 = Fast.cos(Math.PI / m1);
        const sinAlpha1 = Fast.sin(Math.PI / m1);
        const cosBeta1 = Fast.cos(Math.PI / n1);
        const sinBeta1 = Fast.sin(Math.PI / n1);

        const cosAlpha2 = Fast.cos(Math.PI / m2);
        const sinAlpha2 = Fast.sin(Math.PI / m2);
        const cosBeta2 = Fast.cos(Math.PI / n2);
        const sinBeta2 = Fast.sin(Math.PI / n2);
        const cosGamma2 = Fast.cos(Math.PI / k2);
        const sinGamma2 = Fast.sin(Math.PI / k2);

        // for the line containing the center of the second circle
        const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
        const v = cosAlpha2;
        // separate colorsectors
        var separator1 = -cosGamma1 / sinGamma1;
        var separator2;
        var cx, cy;

        function triangleSectors(position, furtherResults) {
            const dx = position.x - cx;
            const dy = position.y - cy;
            if (dx < 0) {
                if (dy < separator1 * dx) {
                    furtherResults.colorSector = 3;
                } else {
                    furtherResults.colorSector = 2;
                }
            } else {
                if (dy < separator2 * dx) {
                    furtherResults.colorSector = 1;
                } else {
                    furtherResults.colorSector = 2;
                }
            }
        }

        // elliptic
        if (angleSum > 1.000001) {
            const circle1 = circleScope.circleOutsideIn(1, -(cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1, cosAlpha1);
            circleScope.circle1 = circle1;
            let worldradius = Math.sqrt(1 - circle1.center.length2());
            const center1 = circle1.center;
            const r1 = circle1.radius;
            const a = u * u + v * v - 1;
            const b = -2 * (center1.x * u + center1.y * v - r1 * cosGamma2);
            const c = center1.length2() - r1 * r1;
            if (Fast.quadraticEquation(a, b, c)) {
                const r2 = Fast.xHigh;
                cx = r2 * u;
                cy = r2 * v;
                const circle2 = circleScope.circleInsideOut(r2, cx, cy);
                circleScope.circle2 = circle2;
                separator2 = (circle2.center.y - circle1.center.y) / (circle2.center.x - circle1.center.x);
                circleScope.finishMap = triangleSectors;
            }
        }
        // euklidic
        else if (angleSum > 0.999999) {
            const big = 100000;
            const dBase = 6;
            const line = circleScope.lineLeftRight(dBase - big * cosAlpha1, big * sinAlpha1, dBase + big * cosAlpha1, -big * sinAlpha1);
            circleScope.circle1 = line;
            const r2 = sinAlpha1 * dBase / (sinAlpha1 * u + cosAlpha1 * v + cosGamma2);
            cx = r2 * u;
            cy = r2 * v;
            const circle2 = circleScope.circleInsideOut(r2, cx, cy);
            circleScope.circle2 = circle2;
            separator2 = cosAlpha1 / sinAlpha1;
            circleScope.finishMap = triangleSectors;
        }
        // hyperbolic
        else {
            const circle1 = circleScope.circleInsideOut(1, (cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1, cosAlpha1);
            circleScope.circle1 = circle1;
            let worldradius2 = circle1.center.length2() - 1;
            circle1.scale(9.7 / Math.sqrt(worldradius2));
            worldradius2 = 9.7 * 9.7;
            const center1 = circle1.center;
            const r1 = circle1.radius;
            const a = u * u + v * v - 1;
            const b = -2 * (center1.x * u + center1.y * v + r1 * cosGamma2);
            const c = center1.length2() - r1 * r1;
            if (Fast.quadraticEquation(a, b, c)) {
                const r2 = Fast.xLow;
                cx = r2 * u;
                cy = r2 * v;
                const circle2 = circleScope.circleInsideOut(r2, cx, cy);
                circleScope.circle2 = circle2;
                separator2 = (circle2.center.y - circle1.center.y) / (circle2.center.x - circle1.center.x);
            }
            circleScope.finishMap = function(position, furtherResults) {
                let l2 = position.length2();
                if (l2 > worldradius2) {
                    position.scale(worldradius2 / l2);
                    furtherResults.colorSector = 0;
                } else {
                    triangleSectors(position, furtherResults);
                }
            };
        }
    };


    const worldradius = 9.7;
    const worldradius2 = worldradius * worldradius;
    const solutions = new Vector2();


    /**
     * generate a hyperbolic quadrangle
     * at least one of k,m,n,or p has to be larger than 2 
     * @method circleScope.hyperbolicQuadrangle
     * @param {integer} k - symmetry at center
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "middle" corner
     * @param {integer} p - symmetry at left corner
     * @param {float} r - 0...1, determine point of circle at the right, fractional distance from center
     */
    circleScope.hyperbolicQuadrangle = function(k, m, n, p, r) {


        console.log(worldradius);
        circleScope.setDihedral(k); // cosGamma1, sinGamma1
        // the first circle
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        r = Fast.clamp(0.05, r, 0.95); // beware of singularity               
        const r1 = 0.5 * worldradius * (1 / r - r);
        const x1 = Math.hypot(worldradius, r1 * sinAlpha);
        const y1 = r1 * cosAlpha;
        circleScope.circle1 = circleScope.circleInsideOut(r1, x1, y1);
        circleScope.circle1.log("1");

        // the second circle
        circleScope.circle2 = circleScope.circleZero();
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        const cosDelta = Fast.cos(Math.PI / p);
        const sinDelta = Fast.sin(Math.PI / p);


        if (k > 2) {
            const tanGamma1 = sinGamma1 / cosGamma1;
            const f0 = 1 / (x1 + y1 * tanGamma1);
            const f1 = f0 * (y1 * cosDelta / cosGamma1 - r1 * cosBeta);
            const g0 = f0 * tanGamma1;
            const g1 = f1 * tanGamma1 - cosDelta / cosGamma1;

            const a = f1 * f1 + g1 * g1 - 1;
            const b = 2 * worldradius2 * (f1 * f0 + g1 * g0);
            const c = worldradius2 * worldradius2 * (f0 * f0 + g0 * g0) - worldradius2;
            console.log(a);
            console.log(b);
            console.log(c);
            console.log(Fast.quadraticEquation(a, b, c, solutions));
            solutions.log("solutions for r2");
            const r2 = solutions.x;
            const x2 = f0 * worldradius2 + f1 * r2;
            const y2 = g0 * worldradius2 + g1 * r2;
            circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
            circleScope.circle2.log("2");
        } else if (m > 2) {
            console.log("m");
            const f0 = worldradius2 / y1;
            const f1 = -(x1 * cosDelta + r1 * cosBeta) / y1;
            const a = f1 * f1 - cosDelta * cosDelta;
            const b = 2 * f0 * f1;
            const c = f0 * f0 - worldradius2;
            console.log(Fast.quadraticEquation(a, b, c, solutions));
            solutions.log("solutions for r2");
            const r2 = solutions.x;
            const x2 = r2 * cosDelta;
            const y2 = f0 + f1 * r2;


            circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
            circleScope.circle2.log("2");

        }

    };


    /**
     * generate a hyperbolic quadrangle with three right angles
     * at least one of k,m,n,or p has to be larger than 2 (k?)
     * worldradius adjusted to 9.7
     * @method circleScope.hyperbolicQuadrangle
     * @param {integer} k - symmetry at center
     * @param {float} r - 0...1, determine point of circle at the right, fractional distance from center
     */
    circleScope.hyperbolicQuadranglek222 = function(k, r) {
        circleScope.setDihedral(k); // cosGamma1, sinGamma1
        Make.map.discRadius = worldradius;
        firstCircle(2, r);
        const x1 = circleScope.circle1.center.x;
        const y1 = circleScope.circle1.center.y;
        const r1 = circleScope.circle1.radius;
        const worldradius2 = worldradius * worldradius;
        const d2 = worldradius2 / x1 / cosGamma1;
        console.log(d2);
        const r2 = Math.sqrt(d2 * d2 - worldradius2);
        circleScope.circle2 = circleScope.circleInsideOut(r2, d2 * cosGamma1, d2 * sinGamma1);

    };

    /**
     * generate a hyperbolic tiling with kites
     * @method circleScope.hyperbolicKite
     * @param {integer} k - symmetry at center
     * @param {integer} m - symmetry at corners with straight lines
     * @param {integer} n - symmetry at corner of the two circles
     */
    circleScope.hyperbolicKite = function(k, m, n) {
        circleScope.setDihedral(k);
        Make.map.discRadius = worldradius;
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta2 = Fast.cos(Math.PI / 2 / n);
        const sinBeta2 = Fast.sin(Math.PI / 2 / n);
        const cosGamma2 = Fast.cos(Math.PI / 2 / k);
        const sinGamma2 = Fast.sin(Math.PI / 2 / k);
        const x1 = (cosAlpha * cosGamma2 + cosBeta2) / sinGamma2;
        const y1 = cosAlpha;
        circleScope.circle1 = circleScope.circleInsideOut(1, x1, y1);


        const x2 = x1 * cosGamma1 + y1 * sinGamma1;
        const y2 = x1 * sinGamma1 - y1 * cosGamma1;
        circleScope.circle2 = circleScope.circleInsideOut(1, x2, y2);

        let worldradius2 = circleScope.circle1.center.length2() - 1;
        circleScope.circle1.scale(worldradius / Math.sqrt(worldradius2));
        circleScope.circle2.scale(worldradius / Math.sqrt(worldradius2));

    };

}());
