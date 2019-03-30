/* jshint esversion:6 */

//  euklidic
//=========================================================

function firstLineEuklidic() {
    const big = 100;
    const intersectionFraction = 0.35;
    lineIntersection = intersectionFraction * worldradius;
    const ax = lineIntersection + big * cosAlpha1;
    const ay = -big * sinAlpha1;
    const bx = lineIntersection - big * cosAlpha1;
    const by = big * sinAlpha1;
    circleScope.circle1 = new Line(ax, ay, bx, by);
    circleScope.circle1.map = circleScope.circle1.mirrorRightToLeft;
    circleScope.finishMap = circleScope.doNothing;
}

function secondCircleEuklidicAllIntersections() {
    secondCircleExists = true;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    r2 = sinAlpha1 * lineIntersection / (sinAlpha1 * u + cosAlpha1 * v + cosGamma2);
    x2 = r2 * u;
    y2 = r2 * v;
    m12 = cosAlpha1 / sinAlpha1;
    circleScope.circle2 = new Circle(r2, x2, y2);
    circleScope.circle2.map = circleScope.circle2.invertInsideOut;
    circleScope.finishMap = finishMapEuclidicFourAllIntersections;
}

function secondCircleEuklidicFourSmall() {
    secondCircleExists = true;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    r2 = circleSize * sinAlpha1 * lineIntersection / (sinAlpha1 * u + cosAlpha1 * v + 1);
    x2 = r2 * u;
    y2 = r2 * v;
    circleScope.circle2 = new Circle(r2, x2, y2);
    circleScope.circle2.map = circleScope.circle2.invertInsideOut;
    m22 = cosGamma1 / sinGamma1;
    circleScope.finishMap = finishMapEuclidicFourSmall;
}


function finishMapEuclidicFourAllIntersections(position, furtherResults) {
    // sector 1 is close to origin, sector 2 is at x-axis, sector 0 at "diagonal" line
    if (position.x < x2) {
        if (position.y < y2 + m22 * (x2 - position.x)) {
            furtherResults.colorSector = 1;
        } else {
            furtherResults.colorSector = 0;
            position.x -= x2;
            position.y -= y2 + y2;
        }
    } else {
        if (position.y < y2 + m12 * (position.x - x2)) {
            furtherResults.colorSector = 2;
            position.x -= x2;
        } else {
            furtherResults.colorSector = 0;
            position.x -= x2;
            position.y -= y2 + y2;
        }
    }
}

function finishMapEuclidicFourSmall(position, furtherResults) {
    // sector 1 is close to origin,  sector 0 is far away
    if (position.x < x2) {
        if (position.y < y2 + m22 * (x2 - position.x)) {
            furtherResults.colorSector = 1;
        } else {
            furtherResults.colorSector = 0;
            position.x -= x2;
            position.y -= y2 + y2;
        }
    } else {
        furtherResults.colorSector = 0;
        position.x -= x2;
        position.y -= y2 + y2;
    }
}
