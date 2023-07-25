/* jshint esversion:6 */


export const polygon = {};

// corner coordinates, first corner is repeated
let nCorners = 0;
cornersX = [];
cornersY = [];
cornersAngle = [];
cornersPerimeter = [];

// sides: unit vector, length, height as distance to center
const sidesLength = [];
const sidesUnitX = [];
const sidesUnitY = [];
const sidesHeight = [];
let perimeter = 0;

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
        cornersAngle = Math.atan2(cornersY[i], cornersX[i]);
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
polygon.findSideLog = function(pointX, pointY) {
    angle = Math.atan2(pointY, pointX);
    let i = 0;
    // search for sector/side that contains the point
    while ((angle < cornersAngle[i]) || (angle > cornersAngle[i + 1])) {
        i += 1;
        console.log(i, cornersAngle[i], cornersAngle[i + 1]);
    }
    return i;
};

// find perimeter fraction going from first corner to given point
// and radial fraction (height fraction)
polygon.analyzePoint=function(pointX, pointY) {
    const i = findSideLog(pointX, pointY);
    const pointHeight = sidesUnitY[i] * pointX - sidesUnitX[i] * pointY;
    relativePointHeight = pointHeight / sidesHeight[i];
    

};