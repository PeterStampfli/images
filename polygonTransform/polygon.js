/* jshint esversion:6 */


export const polygon = {};

// basic polygon data
polygon.nFold = 5;
polygon.extra = 0.5;
polygon.winding = 1;

// corner coordinates, first corner is repeated
let nCorners = 0;
const cornersX = [];
const cornersY = [];
const cornersAngle = [];
const cornersPerimeter = [];

// sides: unit vector, length, height as distance to center
const sidesLength = [];
const sidesUnitX = [];
const sidesUnitY = [];
const sidesHeight = [];
let perimeter = 0;

// results for a given point, mapping to the circle
polygon.isInside = true;
polygon.radius = 1;
polygon.angle = 0;

const eps = 0.001;

polygon.setup = function(gui) {
    gui.addParagraph('<strong>polygon</strong>');
    gui.add({
        type: 'number',
        params: polygon,
        property: 'nFold',
        step: 1,
        min: 1,
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: polygon,
        property: 'extra',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    polygon.type = polygon.nothing;
    gui.add({
        type: 'selection',
        params: polygon,
        property: 'type',
        options: {
            nothing: polygon.nothing,
            regular:polygon.regular
        },
        onChange: function() {
            julia.drawNewStructure();
        }
    });
};

// define a polgon with its corners as pairs of coordinates
// the "convex" center lies at the origin
// corners defined in positive winding sense, counterclockwise
polygon.setCorners = function(corners) {
    const length = corners.length;
    cornersX.length = 0;
    cornersY.length = 0;
    nCorners = length / 2;
    for (let i = 0; i < length; i += 2) {
        cornersX.push(corners[i]);
        cornersY.push(corners[i + 1]);
    }
    // repeating the first corner to simplify programming
    cornersX.push(cornersX[0]);
    cornersY.push(cornersY[0]);
    // calculate angles 
    cornersAngle.length = nCorners + 1;
    for (let i = 0; i <= nCorners; i++) {
        cornersAngle[i] = Math.atan2(cornersY[i], cornersX[i]);
    }
    // sides
    sidesLength.length = nCorners;
    sidesUnitX.length = nCorners;
    sidesUnitY.length = nCorners;
    sidesHeight.length = nCorners;
    cornersPerimeter.length = nCorners;
    perimeter = 0;
    for (let i = 0; i < nCorners; i++) {
        const dx = cornersX[i + 1] - cornersX[i];
        const dy = cornersY[i + 1] - cornersY[i];
        const dist = Math.hypot(dx, dy);
        cornersPerimeter[i] = perimeter;
        perimeter += dist;
        sidesLength[i] = dist;
        sidesUnitX[i] = dx / dist;
        sidesUnitY[i] = dy / dist;
        // unit vector perpendicular to side and going out is (sidesUnitY,-sidesUnitX)
        sidesHeight[i] = sidesUnitY[i] * cornersX[i] - sidesUnitX[i] * cornersY[i];
    }
};

polygon.log = function() {
    console.log('======================================');
    console.log('i, cornerX, cornerY, angle');
    for (let i = 0; i <= nCorners; i++) {
        console.log(i, cornersX[i], cornersY[i], cornersAngle[i]);
    }
    console.log('======================================');
    console.log('i, sidesUnitX,sidesUnitY,sidesLength,cornersPerimeter');
    for (let i = 0; i < nCorners; i++) {
        console.log(i, sidesUnitX[i], sidesUnitY[i], sidesLength[i], cornersPerimeter[i]);
    }
    console.log('======================================');
};

// find index to a side from coordinates of a point
// simple search for a small number of points
function findSideLog(pointX, pointY) {
    // Math.atan2(0,0)=0
    const angle = Math.atan2(pointY, pointX);
    let i = 0;
    // search for sector/side that contains the point
    console.log('angle point', angle);
    while ((angle < cornersAngle[i]) || (angle > cornersAngle[i + 1])) {
        i += 1;
        console.log(i, cornersAngle[i], cornersAngle[i + 1]);
    }
    return i;
}

// find perimeter fraction going from first corner to given point
// and radial fraction (height fraction)
polygon.analyzePoint = function(pointX, pointY) {
    const i = findSideLog(pointX, pointY);
    const pointHeight = sidesUnitY[i] * pointX - sidesUnitX[i] * pointY;
    // the "radius" of a point is the fraction of the height to this side
    // resulting in a mapping of parallels of the side to concentric circle sectors
    const relativePointHeight = pointHeight / sidesHeight[i];
    polygon.isInside = (relativePointHeight <= 1);
    polygon.radius = relativePointHeight;
    // the "angle" of the point is its fraction of the perimeter times the winding number
    // the scaled back corner point
    const scaledX = relativePointHeight * cornersX[i];
    const scaledY = relativePointHeight * cornersY[i];
    // part of perimeter from scaled corner point to given point
    let perimeterPart = sidesUnitX[i] * (pointX - scaledX) + sidesUnitY[i] * (pointY - scaledY);
    console.log(perimeterPart, cornersPerimeter[i]);
    // converting to angle in cirle using total part of perimeter
    console.log('part perimeter');
    // partial perimeter projected to outline of polygon
    perimeterPart /= relativePointHeight;
    const perimeterFraction = (cornersPerimeter[i] + perimeterPart) / perimeter;
    polygon.angle = 2 * Math.PI * polygon.winding * perimeterFraction;

    console.log('point', pointX, pointY);
    console.log(relativePointHeight, scaledX, scaledY);
    console.log('isInside,radius,angle', polygon.isInside, polygon.radius, polygon.angle);
};

polygon.nothing = function() {};

polygon.regular = function() {
    const nCorners = polygon.nFold;
    const corners = [];
    const dAngle = 2 * Math.PI / nCorners;
    for (let i = 0; i < nCorners; i++) {
        corners.push(Math.cos(i * dAngle));
        corners.push(Math.sin(i * dAngle));
    }
    polygon.setCorners(corners);
    polygon.log();
    polygon.analyzePoint(0, 0.2);
};

polygon.star = function() {
    const nCorners = polygon.nFold;
    const corners = [];
    const dAngle = 2 * Math.PI / nCorners;
    for (let i = 0; i < nCorners; i++) {
        corners.push(Math.cos(i * dAngle));
        corners.push(Math.sin(i * dAngle));
        corners.push(polygon.extra * Math.cos((i + 0.5) * dAngle));
        corners.push(polygon.extra * Math.sin((i + 0.5) * dAngle));
    }
    return corners;
};

polygon.basicStar = function() {
    const nCorners = polygon.nFold;
    const corners = [];
    const dAngle = 2 * Math.PI / nCorners;
    const starRadius = Math.cos(dAngle) / Math.cos(0.5 * dAngle);
    for (let i = 0; i < nCorners; i++) {
        corners.push(Math.cos(i * dAngle));
        corners.push(Math.sin(i * dAngle));
        corners.push(starRadius * Math.cos((i + 0.5) * dAngle));
        corners.push(starRadius * Math.sin((i + 0.5) * dAngle));
    }
    return corners;
};

polygon.cross = function() {
    const x = 2.2;
    corners.push(x);
    corners.push(1);
    corners.push(1);
    corners.push(1);
    corners.push(1);
    corners.push(x);

    corners.push(-1);
    corners.push(x);
    corners.push(-1);
    corners.push(1);
    corners.push(-x);
    corners.push(1);

    corners.push(-x);
    corners.push(-1);
    corners.push(-1);
    corners.push(-1);
    corners.push(-1);
    corners.push(-x);

    corners.push(1);
    corners.push(-x);
    corners.push(1);
    corners.push(-1);
    corners.push(x);
    corners.push(-1);
    return corners;
};