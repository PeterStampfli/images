/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

import {
    output
} from "../libgui/modules.js";

export const polygon = {};

// basic polygon data
polygon.nFold = 5;
polygon.extra = 0.5;
polygon.winding = 1;
polygon.rotation = 0;

polygon.d=0;

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
const sidesAngle1 = [];
const sidesAngle2 = [];
// beware of cut, angle discontinues from pi to -pi
const sidesAcrossCut = [];
let perimeter = 0;

// results for a given point, mapping to the circle
polygon.isInside = true;
polygon.radius = 1;
polygon.angle = 0;

const eps = 0.001;

polygon.setup = function(gui) {
    gui.addParagraph('<strong>polygon</strong>');
    polygon.type = polygon.regular;
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
        type: 'selection',
        params: polygon,
        property: 'type',
        options: {
            nothing: polygon.nothing,
            regular: polygon.regular,
            star: polygon.star,
            'basic star': polygon.basicStar,
            cross: polygon.cross,
            oval: polygon.oval
        },
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: polygon,
        property: 'extra',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: polygon,
        property: 'winding',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: polygon,
        property: 'rotation',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type:'number',
        params:polygon,
        property:'d',
        labelText:"drift",
        onChange:julia.drawNewStructure
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
        sidesAngle1[i] = cornersAngle[i];
        sidesAngle2[i] = cornersAngle[i + 1];
        sidesAcrossCut[i] = (sidesAngle1[i] > sidesAngle2[i]);
    }
};

polygon.process = function() {
    var i;
    const eps = 0.0001;
    const winding = polygon.winding;
    const rotation=polygon.rotation;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const pointX = xArray[index];
        const pointY = yArray[index];
        // Math.atan2(0,0)=0
        let angle = Math.atan2(pointY, pointX);
        // search for sector/side that contains the point
        for (i = 0; i < nCorners; i++) {
            if (sidesAcrossCut[i]) {
                if (angle > 0) {
                    // above cut
                    if (angle > sidesAngle1[i]) {
                        break;
                    }
                } else {
                    // below cut
                    if (angle < sidesAngle2[i]) {
                        break;
                    }
                }
            } else {
                // usual interval
                if ((sidesAngle1[i] < angle) && (sidesAngle2[i] > angle)) {
                    break;
                }
            }
        }

        // take projection of line between origin and point to line perpendicular to the side
        // calculate length of this projection
        const pointHeight = sidesUnitY[i] * pointX - sidesUnitX[i] * pointY;
        // the "radius" of a point is the fraction of the height to this side
        // resulting in a mapping of parallels of the side to concentric circle sectors
        const radius = pointHeight / sidesHeight[i];
        if (radius < eps) {
            xArray[index] = 0;
            yArray[index] = 0;
            continue;
        }
        // the scaled back corner point, lying now on the parallel to the side 
        // going through the point in coonsideration
        const scaledCornerX = radius * cornersX[i];
        const scaledCornerY = radius * cornersY[i];
        // calculate distance between this scaled corner and the point in consideration
        let perimeterPart = sidesUnitX[i] * (pointX - scaledCornerX) + sidesUnitY[i] * (pointY - scaledCornerY);
        // converting to angle in cirle using total part of perimeter
        // partial perimeter projected to outline of polygon
        perimeterPart /= radius;
        const perimeterFraction = (cornersPerimeter[i] + perimeterPart) / perimeter;
        angle = 2 * Math.PI * winding * perimeterFraction+rotation;
        xArray[index] = radius * Math.cos(angle);
        yArray[index] = radius * Math.sin(angle);
        xArray[index] = radius * Math.cos(angle);
        yArray[index] = radius * Math.sin(angle);
    }
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
    polygon.process();
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
    polygon.setCorners(corners);
    polygon.process();
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
    polygon.setCorners(corners);
    polygon.process();
};

polygon.cross = function() {
    const x = 1 + polygon.extra;
    const corners = [];
    corners.push(x);
    corners.push(0.5);
    corners.push(0.5);
    corners.push(0.5);
    corners.push(0.5);
    corners.push(x);

    corners.push(-0.5);
    corners.push(x);
    corners.push(-0.5);
    corners.push(0.5);
    corners.push(-x);
    corners.push(0.5);

    corners.push(-x);
    corners.push(-0.5);
    corners.push(-0.5);
    corners.push(-0.5);
    corners.push(-0.5);
    corners.push(-x);

    corners.push(0.5);
    corners.push(-x);
    corners.push(0.5);
    corners.push(-0.5);
    corners.push(x);
    corners.push(-0.5);
    polygon.setCorners(corners);
    polygon.process();
};

polygon.oval = function() {
    const nCorners = polygon.nFold;
    const corners = [];
    const extra = polygon.extra;
    const dAngle = Math.PI / nCorners;
    for (let i = 0; i <= nCorners; i++) {
        corners.push(extra + Math.cos(i * dAngle - Math.PI / 2));
        corners.push(Math.sin(i * dAngle - Math.PI / 2));
    }
    for (let i = 0; i <= nCorners; i++) {
        corners.push(-extra + Math.cos(i * dAngle + Math.PI / 2));
        corners.push(Math.sin(i * dAngle + Math.PI / 2));
    }
    console.log(corners);
    polygon.setCorners(corners);
    polygon.process();
};


polygon.drift = function() {
    const d=polygon.d;
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            const r=Math.hypot(x,y);
            xArray[index] -= d*y;
            yArray[index] += d*x;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};
