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


// the spiral
//=====================================================================

// spiral view
let spiralNumber1 = 2;
let spiralNumber2 = 5;
let spiralVector1 = new Vector2();
let spiralVector2 = new Vector2();
let spiralVector = new Vector2();
let rt3 = Math.sqrt(3);

// called at each basicKaleidoscope.setKMN call, every time Make.initializMap is called
function makeSpiralVector(k, m, n) {
    console.log("making sprial vector");
    // setting up the two spiralvectors, reduced units 
    // length scale = basicKaleidoscope.intersectionMirrorXAxis
    // here lineIntersection
    switch (k) {
        case 2:
            switch (m) {
                case 3:
                    spiralVector1.setComponents(3, rt3);
                    spiralVector2.setComponents(0, 2 * rt3);
                    break;
                case 4:
                    spiralVector1.setComponents(2, 0);
                    spiralVector2.setComponents(0, 2);
                    break;
                case 6:
                    spiralVector1.setComponents(1, rt3);
                    spiralVector2.setComponents(2, 0);
                    break;
            }
            break;
        case 3:
            switch (m) {
                case 2:
                    spiralVector1.setComponents(0, 2 * rt3);
                    spiralVector2.setComponents(3, rt3);
                    break;
                case 3:
                    spiralVector1.setComponents(1.5, 0.5 * rt3);
                    spiralVector2.setComponents(0, rt3);
                    break;
                case 6:
                    spiralVector1.setComponents(0, rt3);
                    spiralVector2.setComponents(1.5, 0.5 * rt3);
                    break;
            }
            break;
        case 4:
            switch (m) {
                case 2:
                    spiralVector1.setComponents(2, 0);
                    spiralVector2.setComponents(0, 2);
                    break;
                case 4:
                    spiralVector1.setComponents(1, 1);
                    spiralVector2.setComponents(1, -1);
                    break;
            }
            break;
        case 6:
            switch (m) {
                case 2:
                    spiralVector1.setComponents(2, 0);
                    spiralVector2.setComponents(1, rt3);
                    break;
                case 3:
                    spiralVector1.setComponents(0, rt3);
                    spiralVector2.setComponents(1.5, rt3 * 0.5);
                    break;
            }
            break;
    }
    spiralVector1.scale(spiralNumber1);
    spiralVector2.scale(spiralNumber2);
    spiralVector.set(spiralVector1).add(spiralVector2);
    // make a "periodic vector" defining a path with period 2 pi
    spiralVector.scale(lineIntersection * 0.5 / Math.PI);
}

// the map 
function basicEuclidicSpiral(position) {
    // use the complex log to map the plane into a strip
    // y goes from -pi to +pi, 
    let x = 0.5 * Fast.log(position.x * position.x + position.y * position.y);
    let y = Fast.atan2(position.y, position.x);
    // going from (x,y) to (x,y+2*pi) we have to get the same image
    // so y has to go along a periodic vector with period 2*pi
    // scale and rotate 
    position.x = y * spiralVector.x + x * spiralVector.y;
    position.y = y * spiralVector.y - x * spiralVector.x;
    return 1;
}
