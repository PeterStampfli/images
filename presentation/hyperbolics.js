/* jshint esversion:6 */

// hyperbolic
//======================================================

function firstCircleHyperbolic() {
    // set up the first circle, hyperbolic
    r1 = 1;
    x1 = (cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1;
    y1 = cosAlpha1;
    const scale = Math.sqrt(worldradius2 / (x1 * x1 + y1 * y1 - 1));
    r1 *= scale;
    x1 *= scale;
    y1 *= scale;
    circleScope.circle1 = new Circle(r1, x1, y1);
    circleScope.circle1.map = circleScope.circle1.invertInsideOut;
    circleScope.finishMap = finishMapHyperbolicThree;
}

function secondCircleHyperbolicAllIntersections() { // calculate the second circle for intersecting with all three sides
    secondCircleExists = false;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    const a = u * u + v * v - 1;
    const b = -2 * (x1 * u + y1 * v + r1 * cosGamma2);
    const c = x1 * x1 + y1 * y1 - r1 * r1;
    if (Fast.quadraticEquation(a, b, c, solutions)) {
        secondCircleExists = true;
        r2 = solutions.x;
        x2 = r2 * u;
        y2 = r2 * v;
        circleScope.circle2 = new Circle(r2, x2, y2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;
        // separators
        m22 = cosGamma1 / sinGamma1;
        m12 = (y2 - y1) / (x2 - x1);
        // the finishing function to mark the different triangles
        circleScope.finishMap = finishMapHyperbolicFourAllIntersections;
    } else {
        console.log("no second circle");
    }
}

function secondCircleHyperbolicFourSmall() {
    secondCircleExists = false;
    const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
    const v = cosAlpha2;
    const a = u * u + v * v - 1;
    const b = -2 * (x1 * u + y1 * v + r1);
    const c = x1 * x1 + y1 * y1 - r1 * r1;
    if (Fast.quadraticEquation(a, b, c, solutions)) {
        secondCircleExists = true;
        r2 = circleSize * solutions.x;
        x2 = r2 * u;
        y2 = r2 * v;
        circleScope.circle2 = new Circle(r2, x2, y2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;
        circleScope.circle2.log("**");
        console.log(circleSize);
        // separators
        m22 = cosGamma1 / sinGamma1;
        // the finishing function to mark the different triangles
        circleScope.finishMap = finishMapHyperbolicFourSmall;
    } else {
        console.log("no second circle");
    }
}

function thirdCircleHyperbolic() {
    // calculate the third circle for intersecting with all three sides
    if (secondCircleExists) {
        const u = (cosBeta3 + cosAlpha3 * cosGamma1) / sinGamma1;
        const v = cosAlpha3;
        const a = u * u + v * v - 1;
        const b = -2 * (x2 * u + y2 * v + r2 * cosGamma3);
        const c = x2 * x2 + y2 * y2 - r2 * r2;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            r3 = solutions.x;
            x3 = r3 * u;
            y3 = r3 * v;
            circleScope.circle3 = new Circle(r3, x3, y3);
            circleScope.circle3.map = circleScope.circle3.invertInsideOut;
            m23 = (y3 - y2) / (x3 - x2);
            circleScope.finishMap = finishMapHyperbolicFive;
        } else {
            console.log("no third circle");
        }
    }
}

// finish map for basic triangle only
function finishMapHyperbolicThree(position, furtherResults) {
    let l2 = position.length2();
    if (l2 > worldradius2) {
        position.scale(worldradius2 / l2);
        furtherResults.colorSector = 3;
    } else {
        furtherResults.colorSector = 0;
    }
}

// finish map for four circles with three intersections

function finishMapHyperbolicFourAllIntersections(position, furtherResults) {
    let l2 = position.length2();
    if (l2 > worldradius2) {
        position.scale(0.33 * worldradius2 / l2);
        furtherResults.colorSector = 3;
    } else {
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
}

function finishMapHyperbolicFourSmall(position, furtherResults) {
    let l2 = position.length2();
    if (l2 > worldradius2) {
        position.scale(0.33 * worldradius2 / l2);
        furtherResults.colorSector = 3;
    } else {
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
            furtherResults.colorSector = 0;
            position.x -= x2;
            position.y -= y2 + y2;
        }
    }
}

function finishMapHyperbolicFive(position, furtherResults) {
    let l2 = position.length2();
    if (l2 > worldradius2) {
        position.scale(0.25 * worldradius2 / l2);
        furtherResults.colorSector = 3;
    } else {
        if (position.x < x3) {
            if (position.y < y3 + (x3 - position.x) * m22) {
                furtherResults.colorSector = 0;
            } else {
                furtherResults.colorSector = 1;
                position.x -= x3;
                position.y -= y3 + y3;
            }
        } else if (position.x < x2) {
            if (position.y < y3 + (position.x - x3) * m23) {
                furtherResults.colorSector = 2;
                position.x -= x3;
            } else if (position.y < y2 + (x2 - position.x) * m22) {
                furtherResults.colorSector = 1;
                position.x -= x3;
                position.y -= y3 + y3;
            } else {
                furtherResults.colorSector = 4;
                position.x -= x2;
                position.y -= y2 + y2;
            }
        } else {
            if (position.y < y2 + (position.x - x2) * m12) {
                furtherResults.colorSector = 5;
                position.x -= x2;
            } else {
                furtherResults.colorSector = 4;
                position.x -= x2;
                position.y -= y2 + y2;
            }
        }
    }
}

// projection functions

function poincarePlane(position) {
    position.x /= worldradius;
    position.y /= worldradius;
    // cayley transform
    let r2 = position.x * position.x + position.y * position.y;
    let base = 1 / (r2 + 2 * position.y + 1.00001);
    position.y = -2 * position.x * base * worldradius;
    position.x = (r2 - 1) * base * worldradius;
    return 1;
}

function poincarePlaneBoth(position) {
    position.y = worldradius - position.y;
    return poincarePlane(position);
}

function poincarePlaneSingle(position) {
    position.y = worldradius - position.y;
    if (position.y < 0) {
        return -1;
    }
    return poincarePlane(position);
}

function kleinDisc(position) {
    let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
    let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
    position.x *= mapFactor;
    position.y *= mapFactor;
    return 1;
}

const qEpsilon = 0.0001;

function quincuncial(position) {
    // periods are 2*worldradius, reduce to ranges -0.5 ... 0.5
    let h = 0.25 / worldradius;
    position.x *= h;
    position.y *= h;
    position.x -= Math.round(position.x);
    position.y -= Math.round(position.y);
    // lower part to up, diagonal shifts
    if (position.y < 0) {
        if (position.x > 0) {
            position.x -= 0.5;
        } else {
            position.x += 0.5;
        }
        position.y += 0.5;
    }
    // left to right, rotate
    if (position.x < 0) {
        position.x = -position.x;
        position.y = 0.5 - position.y;
    }
    // shift to center
    position.x -= 0.25;
    position.y -= 0.25;

    // rotate 45 degrees, corners at (+-2,0) and (0,+-2)
    h = position.x + position.y;
    let invert = false;
    position.y = 4 * (position.x - position.y);
    position.x = 4 * h;

    if (position.x > 1) {
        position.x = 2 - position.x;
    } else if (position.x < -1) {
        position.x = -2 - position.x;
    } else if (position.y > 1) {
        position.y = 2 - position.y;
    } else if (position.y < -1) {
        position.y = -2 - position.y;
    } else {
        invert = true;
    }

    // transform unit square (+-1,0) and (0,+-1) to unit circle
    const x2 = position.x * position.x;
    const y2 = position.y * position.y;
    const r2 = x2 + y2;
    var scale;
    // beware of singularities
    if (r2 < qEpsilon) {
        scale = 1;
    } else if (r2 + qEpsilon > 2) {
        scale = 0.7071;
    } else {
        const x2y2 = x2 * y2;
        scale = Math.sqrt((r2 - 2 * x2y2) / r2 / (1 - x2y2));
    }
    position.scale(scale);
    // invert for lower hemisphere
    if (invert) {
        const scale = 1 / (position.length2() + 0.0001);
        position.scale(scale);
    }
    position.scale(worldradius);
    return 1;
}


function quincuncialSingle(position) {
    if ((position.x > worldradius) || (position.x < -worldradius) || (position.y > worldradius) || (position.y < -worldradius)) {
        return -1;
    }
    return quincuncial(position);
}
