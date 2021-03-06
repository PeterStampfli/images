/**
 * basic kaleidoscope extende with additional mirror lines to give a semiregular tiling cutting sides
 * @namespace cutSidesKaleidoscope
 */



/* jshint esversion:6 */

cutSidesKaleidoscope = {};


(function() {
    "use strict";
    const big = 100;


    cutSidesKaleidoscope.addCircle = new Circle(1, new Vector2());
    cutSidesKaleidoscope.addLine = new Line(new Vector2(), new Vector2());
    const addCircle = cutSidesKaleidoscope.addCircle;
    const addLine = cutSidesKaleidoscope.addLine;

    // the mappings
    // note that basicKaleidoscope is a namespace, dihedral is an object
    let dihedral = basicKaleidoscope.dihedral;
    let basicMap = basicKaleidoscope.map;

    /**
     * set the rotational symmetries at corners
     * prepare for cutting corners
     * @method cutSidesKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    cutSidesKaleidoscope.setKMN = function(k, m, n) {
        basicKaleidoscope.setKMN(k, m, n);
        Make.setMapping(cutSidesKaleidoscope.mapInputImage, cutSidesKaleidoscope.mapStructure);
        basicMap = basicKaleidoscope.map;
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        var d, intersection;
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                intersection = basicKaleidoscope.circle.center.x + Fast.cathe(basicKaleidoscope.circle.radius, basicKaleidoscope.circle.center.y);
                d = 0.5 * (basicKaleidoscope.worldRadius2 - intersection * intersection) / intersection / cosGamma;
                addCircle.center.setComponents(-d * cosGamma, -d * sinGamma);
                addCircle.setRadius(Math.hypot(d, basicKaleidoscope.worldRadius));
                Make.setMapping(cutSidesKaleidoscope.mapElliptic);
                break;
            case basicKaleidoscope.euclidic:
                d = basicKaleidoscope.intersectionMirrorXAxis;
                addLine.a.setComponents(d, 0);
                addLine.b.setComponents(d * (1 - sinGamma * sinGamma), d * sinGamma * cosGamma);
                addLine.update();
                Make.setMapping(cutSidesKaleidoscope.mapEuclidic);
                break;
            case basicKaleidoscope.hyperbolic:
                intersection = basicKaleidoscope.circle.center.x - Fast.cathe(basicKaleidoscope.circle.radius, basicKaleidoscope.circle.center.y);
                d = 0.5 * (basicKaleidoscope.worldRadius2 + intersection * intersection) / intersection / cosGamma;
                addCircle.center.setComponents(d * cosGamma, d * sinGamma);
                addCircle.setRadius(Fast.cathe(d, basicKaleidoscope.worldRadius));
                Make.setMapping(cutSidesKaleidoscope.mapHyperbolic);
                break;
        }
    };

    /**
     * drawing the kaleidoscope additional elements
     * @method cutSidesKaleidoscope.drawAdditional
     */
    cutSidesKaleidoscope.drawAdditional = function() {
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                cutSidesKaleidoscope.addCircle.draw();
                break;
            case basicKaleidoscope.euclidic:
                addLine.draw();
                break;
            case basicKaleidoscope.hyperbolic:
                cutSidesKaleidoscope.addCircle.draw();
                break;
        }
    };

    /**
     * map the position for using an input image, elliptic geometry
     * @method cutSidesKaleidoscope.mapInputImageElliptic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutSidesKaleidoscope.mapElliptic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addCircle.invertOutsideIn(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
        }
    };

    /**
     * map the position for using an input image, euclidic geometry
     * @method cutSidesKaleidoscope.mapEuclidic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutSidesKaleidoscope.mapEuclidic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addLine.mirrorRightToLeft(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
        }
    };

    /**
     * map the position for using an input image, hyperbolic geometry
     * @method cutSidesKaleidoscope.mapHyperbolic
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */
    cutSidesKaleidoscope.mapHyperbolic = function(position, furtherResults) {
        furtherResults.lyapunov = basicMap(position);
        if (furtherResults.lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            furtherResults.reflections = basicKaleidoscope.reflections + Dihedral.reflections;
            let factor = addCircle.invertInsideOut(position);
            if (factor > 0) {
                furtherResults.lyapunov *= factor;
                furtherResults.reflections++;
            }
        }
    };

    /**
     * map the position for showing the structure, hyperbolic geometry
     * @method cutSidesKaleidoscope.mapStructureHyperbolic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    cutSidesKaleidoscope.mapStructureHyperbolic = function(position) {
        let lyapunov = basicMap(position);
        let reflections = basicKaleidoscope.reflections;
        if (lyapunov >= 0) {
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            reflections += Dihedral.reflections;
            let factor = addCircle.invertInsideOut(position);
            if (factor > 0) {
                lyapunov *= factor;
                reflections++;
            }
        }
        position.x = reflections;
        position.y = 1;
        return lyapunov;
    };

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method cutSidesKaleidoscope.drawTrajectory
     * @param {Vector2} position
     * @param {float} nullRadius
     */
    cutSidesKaleidoscope.drawTrajectory = function(position, nullRadius) {
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

            basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
        }
    };

}());
