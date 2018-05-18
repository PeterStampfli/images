/**
 * basic kaleidoscope extende with additional mirror lines to give semiregular tilings
 * @namespace semiRegularKaleidoscope
 */



/* jshint esversion:6 */

semiRegularKaleidoscope = {};


(function() {
    "use strict";
    const big = 100;

    semiRegularKaleidoscope.addCircle = new Circle(1, new Vector2());
    semiRegularKaleidoscope.addCircles = [];
    semiRegularKaleidoscope.addLine = new Line(new Vector2(), new Vector2());
    semiRegularKaleidoscope.addLines = [];

    // line at gamma/2
    semiRegularKaleidoscope.halfAngleLine = new Line(new Vector2(0, 0), new Vector2());


    // the mappings
    // note that basicKaleidoscope is a namespace, dihedral is an object
    let dihedral = basicKaleidoscope.dihedral;
    let basicMap = basicKaleidoscope.mapHyperbolic;


    /**
     * set the rotational symmetries at corners
     * prepare for cutting corners
     * @method semiRegularKaleidoscope.setCutCornersKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    semiRegularKaleidoscope.setCutCornersKMN = function(k, m, n) {
        basicKaleidoscope.setKMN(k, m, n);
        semiRegularKaleidoscope.halfAngleLine.b.setPolar(big, 0.5 * Math.PI / k);
        semiRegularKaleidoscope.halfAngleLine.update();
        console.log(semiRegularKaleidoscope.halfAngleLine.a);
        console.log(semiRegularKaleidoscope.halfAngleLine.b);

        if (basicKaleidoscope.geometry == basicKaleidoscope.euclidic) {
            semiRegularKaleidoscope.addLine.a.set(basicKaleidoscope.line.a);
            semiRegularKaleidoscope.halfAngleLine.mirror(semiRegularKaleidoscope.addLine.a);
            semiRegularKaleidoscope.addLine.b.set(basicKaleidoscope.line.b);
            semiRegularKaleidoscope.halfAngleLine.mirror(semiRegularKaleidoscope.addLine.b);
            dihedral.generateLines(semiRegularKaleidoscope.addLine, semiRegularKaleidoscope.addLines);
        } else {
            semiRegularKaleidoscope.addCircle.setRadius(basicKaleidoscope.circle.radius);
            semiRegularKaleidoscope.addCircle.center.set(basicKaleidoscope.circle.center);

            console.log(semiRegularKaleidoscope.addCircle.center);
            console.log(semiRegularKaleidoscope.addCircle.radius);

            semiRegularKaleidoscope.halfAngleLine.mirror(semiRegularKaleidoscope.addCircle.center);

            console.log(semiRegularKaleidoscope.addCircle.center);

            dihedral.generateCircles(semiRegularKaleidoscope.addCircle, semiRegularKaleidoscope.addCircles);
        }

    };


    /**
     * drawing the kaleidoscope additional elements
     * @method semiRegularKaleidoscope.drawAdditional
     */
    semiRegularKaleidoscope.drawAdditional = function() {
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                Draw.array(semiRegularKaleidoscope.addCircles);
                break;
            case basicKaleidoscope.euclidic:
                Draw.array(semiRegularKaleidoscope.addLines);
                break;
            case basicKaleidoscope.hyperbolic:
                Draw.array(semiRegularKaleidoscope.addCircles);
                console.log("*");
                semiRegularKaleidoscope.addCircle.draw();
                console.log(semiRegularKaleidoscope.addCircle.center);
                console.log(semiRegularKaleidoscope.addCircle.radius);
                console.log(basicKaleidoscope.circle.center);
                console.log(basicKaleidoscope.circle.radius);

                break;
        }
    };


}());
