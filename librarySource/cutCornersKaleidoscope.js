/**
 * basic kaleidoscope extende with additional mirror lines to give a semiregular tiling cutting corners
 * @namespace cutCornersKaleidoscope
 */



/* jshint esversion:6 */

cutCornersKaleidoscope = {};


(function() {
    "use strict";
    const big = 100;


    cutCornersKaleidoscope.halfAngleLine = new Line(new Vector2(0, 0), new Vector2()); // line at gamma/2
    cutCornersKaleidoscope.addCircle = new Circle(1, new Vector2());
    cutCornersKaleidoscope.addLine = new Line(new Vector2(), new Vector2());
    const halfAngleLine = cutCornersKaleidoscope.halfAngleLine;
    const addCircle = cutCornersKaleidoscope.addCircle;
    const addLine = cutCornersKaleidoscope.addLine;

    // the mappings
    // note that basicKaleidoscope is a namespace, dihedral is an object
    let dihedral = basicKaleidoscope.dihedral;
    let basicMap = basicKaleidoscope.map;

    /**
     * set the rotational symmetries at corners
     * prepare for cutting corners
     * @method cutCornersKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    cutCornersKaleidoscope.setKMN = function(k, m, n) {
        basicKaleidoscope.setKMN(k, m, n);
        Make.setMapping(cutCornersKaleidoscope.mapInputImage, cutCornersKaleidoscope.mapStructure);
        basicMap = basicKaleidoscope.map;
        cutCornersKaleidoscope.halfAngleLine.b.setPolar(big, 0.5 * Math.PI / k);
        cutCornersKaleidoscope.halfAngleLine.update();
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                cutCornersKaleidoscope.addCircle.setRadius(basicKaleidoscope.circle.radius);
                cutCornersKaleidoscope.addCircle.center.set(basicKaleidoscope.circle.center);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addCircle.center);
                Make.setMapping(cutCornersKaleidoscope.mapInputImageElliptic, cutCornersKaleidoscope.mapStructureElliptic);
                break;
            case basicKaleidoscope.euclidic:
                cutCornersKaleidoscope.addLine.a.set(basicKaleidoscope.line.a);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addLine.a);
                cutCornersKaleidoscope.addLine.b.set(basicKaleidoscope.line.b);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addLine.b);
                cutCornersKaleidoscope.addLine.update();
                Make.setMapping(cutCornersKaleidoscope.mapInputImageEuclidic, cutCornersKaleidoscope.mapStructureEuclidic);
                break;
            case basicKaleidoscope.hyperbolic:
                cutCornersKaleidoscope.addCircle.setRadius(basicKaleidoscope.circle.radius);
                cutCornersKaleidoscope.addCircle.center.set(basicKaleidoscope.circle.center);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addCircle.center);
                Make.setMapping(cutCornersKaleidoscope.mapInputImageHyperbolic, cutCornersKaleidoscope.mapStructureHyperbolic);
                break;
        }
    };


    /**
     * set the rotational symmetries at corners, for spherical image
     * prepare for cutting corners
     * @method cutCornersKaleidoscope.setKMNSpherical
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    cutCornersKaleidoscope.setKMNSpherical = function(k, m, n) {
        cutCornersKaleidoscope.setKMN(k, m, n);
        Make.setMapping(cutCornersKaleidoscope.mapInputImageSpherical, cutCornersKaleidoscope.mapStructureSpherical);
    };

    /**
     * drawing the kaleidoscope additional elements
     * @method cutCornersKaleidoscope.drawAdditional
     */
    cutCornersKaleidoscope.drawAdditional = function() {
        cutCornersKaleidoscope.halfAngleLine.draw();
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                cutCornersKaleidoscope.addCircle.draw();
                break;
            case basicKaleidoscope.euclidic:
                addLine.draw();
                break;
            case basicKaleidoscope.hyperbolic:
                cutCornersKaleidoscope.addCircle.draw();
                break;
        }
    };

    /**
     * map the position for using an input image, elliptic geometry
     * @method cutCornersKaleidoscope.mapInputImageElliptic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapInputImageElliptic = function(position) {
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                lyapunov *= factor;
            }
            halfAngleLine.mirrorLeftToRight(position);
        }
        return lyapunov;
    };

    /**
     * map the position for showing the structure, elliptic geometry
     * @method cutCornersKaleidoscope.mapStructureElliptic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapStructureElliptic = function(position) {
        let lyapunov = basicMap(position);
        let reflections = basicKaleidoscope.reflections;
        if (lyapunov >= 0) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                lyapunov *= factor;
                reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return lyapunov;
    };

    /**
     * map the position for using an input image, spherical geometry
     * @method cutCornersKaleidoscope.mapInputImageSpherical
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapInputImageSpherical = function(position) {
        let sphereLyapunov = sphericalToElliptic.map(position);
        if (sphereLyapunov < 0) return -1;
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                lyapunov *= factor;
            }
            halfAngleLine.mirrorLeftToRight(position);
        }
        return lyapunov * sphereLyapunov;
    };

    /**
     * map the position for showing the structure, elliptic geometry
     * @method cutCornersKaleidoscope.mapStructureSpherical
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapStructureSpherical = function(position) {
        let sphereLyapunov = sphericalToElliptic.map(position);
        if (sphereLyapunov < 0) return -1;
        let lyapunov = basicMap(position);
        let reflections = basicKaleidoscope.reflections;
        if (lyapunov >= 0) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                lyapunov *= factor;
                reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return lyapunov;
    };

    /**
     * map the position for using an input image, euclidic geometry
     * @method cutCornersKaleidoscope.mapInputImageEuclidic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapInputImageEuclidic = function(position) {
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
            let factor = addLine.mirrorRightToLeft(position);
            if (factor > 0) {
                lyapunov *= factor;
            }
            halfAngleLine.mirrorLeftToRight(position);
        }
        return lyapunov;
    };

    /**
     * map the position for showing the structure, euclidic geometry
     * @method cutCornersKaleidoscope.mapStructureEuclidic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapStructureEuclidic = function(position) {
        let lyapunov = basicMap(position);
        let reflections = basicKaleidoscope.reflections;
        if (lyapunov >= 0) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            let factor = addLine.mirrorRightToLeft(position);
            if (factor > 0) {
                lyapunov *= factor;
                reflections++;
            }
            if (halfAngleLine.mirrorRightToLeft(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return lyapunov;
    };

    /**
     * map the position for using an input image, hyperbolic geometry
     * @method cutCornersKaleidoscope.mapInputImageHyperbolic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapInputImageHyperbolic = function(position) {
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
            let factor = addCircle.invertInsideOut(position);
            if (factor > 0) {
                lyapunov *= factor;
            }
            halfAngleLine.mirrorLeftToRight(position);
        }
        return lyapunov;
    };

    /**
     * map the position for showing the structure, hyperbolic geometry
     * @method cutCornersKaleidoscope.mapStructureHyperbolic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutCornersKaleidoscope.mapStructureHyperbolic = function(position) {
        let lyapunov = basicMap(position);
        let reflections = basicKaleidoscope.reflections;
        if (lyapunov >= 0) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            let factor = addCircle.invertInsideOut(position);
            if (factor > 0) {
                lyapunov *= factor;
                reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return lyapunov;
    };

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method cutCornersKaleidoscope.drawTrajectory
     * @param {Vector2} position
     * @param {float} nullRadius
     */
    cutCornersKaleidoscope.drawTrajectory = function(position, nullRadius) {
        let positions = [];
        positions.push(position.clone());
        let sizes = [];
        sizes.push(1);
        let lyapunov = basicKaleidoscope.drawTrajectory(positions, sizes);
        if (lyapunov > 0) {
            let position = positions[positions.length - 1].clone();
            var factor;
            dihedral.drawMap(position);
            positions.push(position.clone());
            let size = sizes[sizes.length - 1];
            sizes.push(size);
            switch (basicKaleidoscope.geometry) { // we draw only one trajectory and need not be efficient
                case basicKaleidoscope.elliptic:
                    factor = addCircle.drawInvertOutsideIn(position);
                    break;
                case basicKaleidoscope.euclidic:
                    factor = addLine.drawMirrorRightToLeft(position);
                    break;
                case basicKaleidoscope.hyperbolic:
                    factor = addCircle.drawInvertInsideOut(position);
                    break;
            }
            if (factor > 0) {
                size *= factor;
                sizes.push(size);
                positions.push(position.clone());
            }
            if (halfAngleLine.drawMirrorLeftToRight(position) > 0) {
                sizes.push(size);
                positions.push(position.clone());
            }
            basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
        }
    };

}());
