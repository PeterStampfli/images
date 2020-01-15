/* jshint esversion:6 */

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
        circleScope.geometry = "elliptic";
        const circle = circleScope.circleOutsideIn(1, -(cosAlpha * cosGamma1 + cosBeta) / sinGamma1, cosAlpha);
        circleScope.circle1 = circle;
        let worldradius = Math.sqrt(1 - circle.center.length2());
        circle.scale(9.7 / worldradius);
        circleScope.noFinishMap();
    }
    // euklidic
    else if (angleSum > 0.999999) {
        circleScope.geometry = "euklidic";
        const big = 100000;
        const line = circleScope.lineLeftRight(6 - big * cosAlpha, big * sinAlpha, 6 + big * cosAlpha, -big * sinAlpha);
        circleScope.circle1 = line;
        circleScope.noFinishMap();
    }
    // hyperbolic
    else {
        circleScope.geometry = "hyperbolic";
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
 * @param {integer} n2 - symmetry of intersection of additional circle with "left" side of triangle
 */
const data = new Vector2();



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
    // the finishing function to mark the different triangles
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
        if (Fast.quadraticEquation(a, b, c, data)) {
            const r2 = data.y;
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
        if (Fast.quadraticEquation(a, b, c, data)) {
            const r2 = data.x;
            cx = r2 * u;
            cy = r2 * v;
            const circle2 = circleScope.circleInsideOut(r2, cx, cy);
            circle2.log("olf");
            //  circleScope.circle2 = circle2;
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

circleScope.triangleCentralCircleReduced = function(k1, m1, n1, factor, m2, n2) {
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
    const cosGamma2 = 1;
    const sinGamma2 = 0;

    // for the line containing the center of the second circle
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    // separate colorsectors
    var separator1 = -cosGamma1 / sinGamma1;
    var separator2;
    var cx, cy;
    // the finishing function to mark the different triangles
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
                furtherResults.colorSector = 2;
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
        if (Fast.quadraticEquation(a, b, c, data)) {
            const r2 = data.y * factor;
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
        const r2 = sinAlpha1 * dBase / (sinAlpha1 * u + cosAlpha1 * v + cosGamma2) * factor;
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
        if (Fast.quadraticEquation(a, b, c, data)) {
            const r2 = data.x * factor;
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
const solutions = new Vector2();
