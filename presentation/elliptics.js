/* jshint esversion:6 */

// elliptic
//==========================================================

function firstCircleElliptic() {
    // set up the first circle, elliptic
    // same worldradius as hyperbolic
    r1 = 1;
    x1 = -(cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1;
    y1 = -cosAlpha1;
    const scale = Math.sqrt(worldradius2 / (1 - x1 * x1 - y1 * y1));
    r1 *= scale;
    x1 *= scale;
    y1 *= scale;
    circleScope.circle1 = new Circle(r1, x1, y1);
    circleScope.circle1.map = circleScope.circle1.invertOutsideIn;
    circleScope.finishMap = circleScope.doNothing;
}

function secondCircleEllipticAllIntersections() {
    // calculate the second circle for intersecting with all three sides
    secondCircleExists = false;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    const a = u * u + v * v - 1;
    const b = -2 * (x1 * u + y1 * v - r1 * cosGamma2);
    const c = x1 * x1 + y1 * y1 - r1 * r1;
    if (Fast.quadraticEquation(a, b, c, solutions)) {
        secondCircleExists = true;
        r2 = solutions.y;
        x2 = r2 * u;
        y2 = r2 * v;
        circleScope.circle2 = new Circle(r2, x2, y2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;
        // separators
        m22 = cosGamma1 / sinGamma1;
        m12 = (y2 - y1) / (x2 - x1);
        // the finishing function to mark the different triangles
        circleScope.finishMap = finishMapEuclidicFourAllIntersections;
    } else {
        console.log("no second circle");
    }
}

function secondCircleEllipticFourSmall() {
    secondCircleExists = false;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    console.log(u);
    console.log(v);
    const a = u * u + v * v - 1;
    const b = -2 * (x1 * u + y1 * v - r1);
    const c = x1 * x1 + y1 * y1 - r1 * r1;
    if (Fast.quadraticEquation(a, b, c, solutions)) {
        secondCircleExists = true;
        solutions.log();
        r2 = circleSize * solutions.y;
        x2 = r2 * u;
        y2 = r2 * v;
        circleScope.circle2 = new Circle(r2, x2, y2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;
        circleScope.circle2.log("circle2 ell");
        // separators
        m22 = cosGamma1 / sinGamma1;
        m12 = (y2 - y1) / (x2 - x1);
        console.log(m12);
        // the finishing function to mark the different triangles
        circleScope.finishMap = finishMapEuclidicFourSmall;
    } else {
        console.log("no second circle");
    }
}
