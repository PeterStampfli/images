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
                Make.setMapping(cutCornersKaleidoscope.mapElliptic);
                break;
            case basicKaleidoscope.euclidic:
                cutCornersKaleidoscope.addLine.a.set(basicKaleidoscope.line.a);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addLine.a);
                cutCornersKaleidoscope.addLine.b.set(basicKaleidoscope.line.b);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addLine.b);
                cutCornersKaleidoscope.addLine.update();
                Make.setMapping(cutCornersKaleidoscope.mapEuclidic);
                break;
            case basicKaleidoscope.hyperbolic:
                cutCornersKaleidoscope.addCircle.setRadius(basicKaleidoscope.circle.radius);
                cutCornersKaleidoscope.addCircle.center.set(basicKaleidoscope.circle.center);
                cutCornersKaleidoscope.halfAngleLine.mirror(cutCornersKaleidoscope.addCircle.center);
                Make.setMapping(cutCornersKaleidoscope.mapHyperbolic);
                break;
        }
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
     * map the position for using an elliptic geometry
     * @method cutCornersKaleidoscope.mapElliptic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutCornersKaleidoscope.mapElliptic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                furtherResults.reflections++;
            }
        }
    };

    /**
     * map the position for using an input image, euclidic geometry
     * @method cutCornersKaleidoscope.mapEuclidic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutCornersKaleidoscope.mapEuclidic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addLine.mirrorRightToLeft(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                furtherResults.reflections++;
            }
        }
    };

    /**
     * map the position for using an input image, hyperbolic geometry
     * @method cutCornersKaleidoscope.mapHyperbolic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutCornersKaleidoscope.mapHyperbolic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addCircle.invertInsideOut(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
            if (halfAngleLine.mirrorLeftToRight(position) > 0) {
                furtherResults.reflections++;
            }
        }
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
