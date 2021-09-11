/* jshint esversion: 6 */

import {
    Pixels,
    ColorInput,
    output
} from "../libgui/modules.js";

import {
    basics
} from "./basics.js";
export const mapping = {};

// colors depending on origin
const colors = ['#ff0000', '#ffff00', '#00ff00', '#ff8800', '#ff00ff', '#00ffff'];

// switching the first 5 mapping spheres on or off
mapping.on = [true, true, true, true, true];

mapping.spheres = [];

/* mapping spheres have these fields:
on (boolean, for switching on or off)
color (string, special color, origin)
x (coordinate of center in fixed coordinates)
y (coordinate of center in fixed coordinates)
z (coordinate of center in fixed coordinates)
radius (of the inverting sphere)
radius2 (square)
viewX (coordinate of center for view)
viewY (coordinate of center for view)
viewZ (coordinate of center for view)
viewRadius (of the sphere as visible)
imageSpheres (Array of image sphere objects)
points (Array of Float32Array(3) for coordinates of limit points in fixed coordinates)
viewPoints (Array of Float32Array(3) for coordinates of transformed points as shown)
stereographicPoints (Array of Float32Array(3) for coordinates of transformed points in stereographic projection as shown)
*/

/* image spheres have these fields
generation (integer, number of generation that made it)
color (string, special color, origin)
x (coordinate of center in fixed coordinates)
y (coordinate of center in fixed coordinates)
z (coordinate of center in fixed coordinates)
radius (of the sphere)
viewX (coordinate of center for view)
viewY (coordinate of center for view)
viewZ (coordinate of center for view)
viewRadius (of the sphere as visible)
*/

//mapping.config=mapping.tetrahedron;
mapping.maxGeneration = 100;
mapping.minGeneration = 6; // minimum number for creating image spheres
mapping.minRadius = 0.001; // critical radius for terminating and writing a point
mapping.additionalPointsIterations = 0; // create more points with mapping
mapping.useTouchingPoints = true; // points where circles touch belong to the limit set

function addMappingSphere(radius, x, y, z = 0) {
    const mappingSphere = {};
    mappingSphere.radius = radius;
    mappingSphere.radius2 = radius * radius;
    mappingSphere.x = x;
    mappingSphere.y = y;
    mappingSphere.z = z;
    const index = mapping.spheres.length;
    mappingSphere.color = colors[index % colors.length];
    mappingSphere.on = (index < mapping.on.length) ? mapping.on[index] : true;
    mappingSphere.imageSpheres = [];
    mappingSphere.points = [];
    mappingSphere.viewPoints = [];
    mappingSphere.stereographicPoints = [];
    mapping.spheres.push(mappingSphere);
}

var color;

function addImageSphere(mappingSphere, generation, radius, x, y, z) {
    const imageSphere = {};
    imageSphere.generation = generation;
    imageSphere.color = color;
    imageSphere.radius = radius;
    imageSphere.x = x;
    imageSphere.y = y;
    imageSphere.z = z;
    mappingSphere.imageSpheres.push(imageSphere);
}

function addPoint(mappingSphere, x, y, z) {
    const point = new Float32Array(3);
    point[0] = x;
    point[1] = y;
    point[2] = z;
    mappingSphere.points.push(point);
    mappingSphere.viewPoints.push(new Float32Array(3));
    mappingSphere.stereographicPoints.push(new Float32Array(3));
}

// determine hyperbolic radius and projection from 4d to 3d
var stereographicRadius, stereographicRadius2, stereographicCenter;

function setupHyperbolicSpace(radius, x, y, z, w = 0) {
    const d2 = x * x + y * y + z * z + w * w;
    const hyperbolicRadius = Math.sqrt(d2 - radius * radius);
    basics.hyperbolicRadius = hyperbolicRadius;
    stereographicCenter = hyperbolicRadius;
    stereographicRadius = Math.sqrt(2) * hyperbolicRadius;
    stereographicRadius2 = stereographicRadius * stereographicRadius;
}

// typically 4d spheres on a 4d sphere, defining a 4d hyperbolic space
// projecting to 3d space, for calculating the structure of the surface of the hyperbolic space
mapping.add4dto3d = function(radius, x, y, z, w) {
    const dw = w - stereographicCenter;
    const d2 = x * x + y * y + z * z + dw * dw;
    const factor = stereographicRadius2 / (d2 - radius * radius);
    if (factor < 0) {
        console.error('mappingSpheres.add4dto3d: Circle at "north pole" projects with negative radius:');
        console.log('radius, x, y, z, w', radius, x, y, z, w);
    } else {
        mappingSpheres.add(radius, x * factor, y * factor, z * factor);
    }
};

mapping.logSpheresGeometry = function() {
    const length = mapping.spheres.length;
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < length; i++) {
        const sphere = mapping.spheres[i];
        console.log(i, sphere.radius, sphere.x, sphere.y, sphere.z);
    }
};

mapping.logSpheres = function() {
    const length = mapping.spheres.length;
    console.log("mapping spheres");
    for (var i = 0; i < length; i++) {
        console.log(i, mapping.spheres[i]);
    }
};

// various configurations
//============================================

mapping.tetrahedron = function() {
    // four inverting spheres at the corners of a tetrahedron
    const rSphere = 0.8165;
    const cx2 = 0.9428;
    const cx34 = -0.4714;
    const cy3 = 0.8165;
    const cy4 = -0.8165;
    const cz234 = 0.3333;
    // (0,0,-1),(cx2,0,cz234),(cx34,cy3,cz234),(cx34,cy4,cz234)
    setupHyperbolicSpace(rSphere, 0, 0, 1);
    addMappingSphere(rSphere, 0, 0, -1);
    addMappingSphere(rSphere, cx2, 0, cz234);
    addMappingSphere(rSphere, cx34, cy3, cz234);
    addMappingSphere(rSphere, cx34, cy4, cz234);
};

mapping.fourSimplex = function() {
    // four inverting spheres at the corners of a tetrahedron
    const rSphere = 0.8165;
    const cx2 = 0.9428;
    const cx34 = -0.4714;
    const cy3 = 0.8165;
    const cy4 = -0.8165;
    const cz234 = 0.3333;
    // (0,0,-1),(cx2,0,cz234),(cx34,cy3,cz234),(cx34,cy4,cz234)
    setupHyperbolicSpace(rSphere, 0, 0, 1);
    addMappingSphere(rSphere, 0, 0, -1);
    addMappingSphere(1-rSphere, 0, 0, 0);
    addMappingSphere(rSphere, cx2, 0, cz234);
    addMappingSphere(rSphere, cx34, cy3, cz234);
    addMappingSphere(rSphere, cx34, cy4, cz234);
};

mapping.cube=function(){
setupHyperbolicSpace(1,1,1,1);
addMappingSphere(1,1,1,1);
addMappingSphere(1,1,1,-1);
addMappingSphere(1,1,-1,1);
addMappingSphere(1,1,-1,-1);
addMappingSphere(1,-1,1,1);
addMappingSphere(1,-1,1,-1);
addMappingSphere(1,-1,-1,1);
addMappingSphere(1,-1,-1,-1);
};

// creating the images (spheres and points)
//===================================

var maxGeneration, minGeneration, minRadius, mappingLength, color;

// create the images of the existing mapping spheres
mapping.createImages = function() {
    maxGeneration = mapping.maxGeneration;
    minGeneration = mapping.minGeneration;
    minRadius = mapping.minRadius;
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            color = mappingSphere.color;
            addImageSphere(mappingSphere, 1, mappingSphere.radius, mappingSphere.x, mappingSphere.y, mappingSphere.z);
            imagesOfSphere(1, i, mappingSphere.radius, mappingSphere.x, mappingSphere.y, mappingSphere.z);
        }
    }
};

function imagesOfSphere(generation, lastMappingIndex, radius, x, y, z) {
    generation += 1;
    const radius2 = radius * radius;
    for (let i = 0; i < mappingLength; i++) {
        // map only at spheres that do not contain it
        if (i === lastMappingIndex) {
            continue;
        }
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const mapX = mappingSphere.x;
            const mapY = mappingSphere.y;
            const mapZ = mappingSphere.z;
            const dx = x - mapX;
            const dy = y - mapY;
            const dz = z - mapZ;
            const d2 = dx * dx + dy * dy + dz * dz;
            const factor = mappingSphere.radius2 / (d2 - radius2);
            const newRadius = radius * factor;
            const newX = mapX + dx * factor;
            const newY = mapY + dy * factor;
            const newZ = mapZ + dz * factor;
            if (generation <= minGeneration) {
                addImageSphere(mappingSphere, generation, newRadius, newX, newY, newZ);
                if (newRadius < minRadius) {
                    addPoint(mappingSphere, newX, newY, newZ);
                }
                imagesOfSphere(generation, i, newRadius, newX, newY, newZ);
            } else if (newRadius < minRadius) {
                addPoint(mappingSphere, newX, newY, newZ);
            } else if (generation < maxGeneration) {
                imagesOfSphere(generation, i, newRadius, newX, newY, newZ);
            }
        }
    }
}

function moreImagePoints(iterations, lastMappingIndex, x, y, z) {
    iterations += 1;
    for (let i = 0; i < mappingLength; i++) {
        // map only at spheres that do not contain it
        if (i === lastMappingIndex) {
            continue;
        }
        const mappingSphere = mapping.spheres[i];
        if (!mappingSphere.on) {
            continue;
        }
        const mapX = mappingSphere.x;
        const mapY = mappingSphere.y;
        const mapZ = mappingSphere.z;
        const dx = x - mapX;
        const dy = y - mapY;
        const dz = z - mapZ;
        const d2 = dx * dx + dy * dy + dz * dz;
        const factor = mappingSphere.radius2 / d2;
        const newX = mapX + dx * factor;
        const newY = mapY + dy * factor;
        const newZ = mapZ + dz * factor;
        if (iterations <= mapping.additionalPointsIterations) {
            addPoint(mappingSphere, newX, newY, newZ);
        }
    }
}

// using the touching points of spheres
//======================================

mapping.createTouchingPoints = function() {
    if (!mapping.useTouchingPoints) {
        return;
    }
    const eps = 0.01;
    mappingLength = mapping.spheres.length;
    for (let i = 1; i < mappingLength; i++) {
        const mappingSphereI = mapping.spheres[i];
        if (!mappingSphereI.on) {
            continue;
        }
        const radiusI = mappingSphereI.radius;
        const xI = mappingSphereI.x;
        const yI = mappingSphereI.y;
        const zI = mappingSphereI.z;
        for (let j = 0; j < i; j++) {
            const mappingSphereJ = mapping.spheres[j];
            if (!mappingSphereJ.on) {
                continue;
            }
            const radiusJ = mappingSphereJ.radius;
            const dx = mappingSphereJ.x - mappingSphereI.x;
            const dy = mappingSphereJ.y - mappingSphereI.y;
            const dz = mappingSphereJ.z - mappingSphereI.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (Math.abs(d2 - (radiusI + radiusJ) * (radiusI + radiusJ)) < eps) {
                const h = radiusI / (radiusI + radiusJ);
                const x = xI + h * dx;
                const y = yI + h * dy;
                const z = zI + h * dz;
                addPoint(mappingSphereI, x, y, z);
                if (mapping.additionalPointsIterations === 0) {
                    continue;
                }
                for (let k = 0; k < mappingLength; k++) {
                    if ((i === k) || (j === k)) {
                        continue;
                    }
                    const mappingSphereK = mapping.spheres[k];
                    if (!mappingSphereK.on) {
                        continue;
                    }
                    const mapX = mappingSphereK.x;
                    const mapY = mappingSphereK.y;
                    const mapZ = mappingSphereK.z;
                    const dx = x - mapX;
                    const dy = y - mapY;
                    const dz = z - mapZ;
                    const d2 = dx * dx + dy * dy + dz * dz;
                    const factor = mappingSphereK.radius2 / d2;
                    const newX = mapX + dx * factor;
                    const newY = mapY + dy * factor;
                    const newZ = mapZ + dz * factor;
                    addPoint(mappingSphereK, newX, newY, newZ);
                    if (mapping.additionalPointsIterations > 1) {
                        moreImagePoints(1, k, newX, newY, newZ);
                    }
                }
            }
        }
    }
};

// transforming the mapping spheres, image spheres and points, and making z-sort
//============================

mapping.sortPoints = false;

mapping.transformSortImages = function() {
    basics.updateEulerAngles();
    basics.setupTiltRotation();
    basics.copyCoordinatesSpheres(mapping.spheres);
    basics.rotateSpheres(mapping.spheres);
    if (basics.view === 'stereographic') {
        basics.stereographicViewSpheres(mapping.spheres);
    }
    basics.tiltRotateSpheres(mapping.spheres);
    basics.zSortSpheres(mapping.spheres);
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const imageSpheres = mappingSphere.imageSpheres;
            basics.copyCoordinatesSpheres(imageSpheres);
            basics.rotateSpheres(imageSpheres);
            if (basics.view === 'stereographic') {
                basics.stereographicViewSpheres(imageSpheres);
            }
            basics.tiltRotateSpheres(imageSpheres);
            basics.zSortSpheres(imageSpheres);
            const viewPoints = mappingSphere.viewPoints;
            basics.copyCoordinatesPoints(viewPoints, mappingSphere.points);
            basics.rotatePoints(viewPoints);
            if (basics.view === 'stereographic') {
                basics.stereographicViewPoints(viewPoints);
            } else if (basics.view === 'both (for points only)') {
                basics.bothViewsPoints(mappingSphere.stereographicPoints, viewPoints);
                basics.tiltRotatePoints(mappingSphere.stereographicPoints);
            }
            basics.tiltRotatePoints(viewPoints);
            if (mapping.sortPoints) {
                basics.zSortPoints(viewPoints);
            }
        }
    }
};

//  showing things
//=============================================

mapping.color = '#aaaaaa';
mapping.drawImageSphereGen = 2;
mapping.colorFront = '#ff0000';
mapping.colorBack = '#000000';
mapping.specialColor = true;

var redMean, greenMean, blueMean, redDelta, greenDelta, blueDelta;
var imagePointsColor = {};

function setupColorInterpolation() {
    ColorInput.setObject(imagePointsColor, mapping.colorFront);
    const redFront = imagePointsColor.red;
    const greenFront = imagePointsColor.green;
    const blueFront = imagePointsColor.blue;
    ColorInput.setObject(imagePointsColor, mapping.colorBack);
    const redBack = imagePointsColor.red;
    const greenBack = imagePointsColor.green;
    const blueBack = imagePointsColor.blue;
    redMean = 0.5 * (redBack + redFront);
    greenMean = 0.5 * (greenBack + greenFront);
    blueMean = 0.5 * (blueBack + blueFront);
    redDelta = 0.5 * (redFront - redBack) / basics.hyperbolicRadius;
    greenDelta = 0.5 * (greenFront - greenBack) / basics.hyperbolicRadius;
    blueDelta = 0.5 * (blueFront - blueBack) / basics.hyperbolicRadius;
}

function interpolateColorInteger(z) {
    imagePointsColor.red = Math.min(255, Math.max(0, Math.round(redMean + z * redDelta)));
    imagePointsColor.green = Math.min(255, Math.max(0, Math.round(greenMean + z * greenDelta)));
    imagePointsColor.blue = Math.min(255, Math.max(0, Math.round(blueMean + z * blueDelta)));
    return Pixels.integerOfColor(imagePointsColor);
}

function interpolateColorString(z) {
    imagePointsColor.red = Math.min(255, Math.max(0, Math.round(redMean + z * redDelta)));
    imagePointsColor.green = Math.min(255, Math.max(0, Math.round(greenMean + z * greenDelta)));
    imagePointsColor.blue = Math.min(255, Math.max(0, Math.round(blueMean + z * blueDelta)));
    return ColorInput.stringFromObject(imagePointsColor);
}

// showing mapping spheres
// if special color: draw circle in special color
// else draw circle in black around disc or nothing around bubble/sphere

mapping.drawSpheres = function() {
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            if (mappingSphere.viewRadius > 0) {
                basics.drawSphere(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
                if (mapping.specialColor) {
                    basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mappingSphere.color);
                }
            } else {
                const color = (mapping.specialColor) ? mappingSphere.color : mapping.color;
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawBubbles = function() {
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            if (mappingSphere.viewRadius > 0) {
                basics.drawLowerBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
                basics.drawUpperBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
                if (mapping.specialColor) {
                    basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mappingSphere.color);
                }
            } else {
                const color = (mapping.specialColor) ? mappingSphere.color : mapping.color;
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawSpheresAsDiscs = function() {
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            if (mappingSphere.viewRadius > 0) {
                basics.drawDisc(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            }
            const color = (mapping.specialColor) ? mappingSphere.color : '#000000';
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawImageSpheresMappingBubbles = function() {
    var color = mapping.colorFront;
    const specialColor = mapping.specialColor;
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const length = mappingSphere.imageSpheres.length;
            if (mappingSphere.viewRadius > 0) {
                basics.drawLowerBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            }
            for (let j = 0; j < length; j++) {
                const imageSphere = mappingSphere.imageSpheres[j];
                if (imageSphere.generation !== mapping.drawImageSphereGen) {
                    continue;
                }
                if (specialColor) {
                    color = imageSphere.color;
                } else {
                    color = interpolateColorString(imageSphere.viewZ);
                }
                if (imageSphere.viewRadius > 0) {
                    basics.drawSphere(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, color);
                } else {
                    basics.drawCircle(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, color);
                }
            }
            if (mappingSphere.viewRadius > 0) {
                basics.drawUpperBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
                if (mapping.specialColor) {
                    basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mappingSphere.color);
                }
            } else {
                const color = (mapping.specialColor) ? imageSphere.color : mapping.colorFront;
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawImageSpheresAsDiscs = function() {
    var imageColor = mapping.colorFront;
    const specialColor = mapping.specialColor;
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const length = mappingSphere.imageSpheres.length;
            if (mappingSphere.viewRadius > 0) {
                basics.drawDisc(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            }
            const color = (mapping.specialColor) ? mappingSphere.color : '#000000';
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
            for (let j = 0; j < length; j++) {
                const imageSphere = mappingSphere.imageSpheres[j];
                if (imageSphere.generation !== mapping.drawImageSphereGen) {
                    continue;
                }
                if (specialColor) {
                    imageColor = imageSphere.color;
                }
                if (imageSphere.viewRadius > 0) {
                    basics.drawDisc(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, imageColor);
                    basics.drawCircle(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, '#000000');
                } else {
                    basics.drawCircle(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, imageColor);
                }
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawImageSpheresOnly = function() {
    var color = mapping.colorFront;
    const specialColor = mapping.specialColor;
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const length = mappingSphere.imageSpheres.length;
            for (let j = 0; j < length; j++) {
                const imageSphere = mappingSphere.imageSpheres[j];
                if (imageSphere.generation !== mapping.drawImageSphereGen) {
                    continue;
                }
                if (specialColor) {
                    color = imageSphere.color;
                } else {
                    color = interpolateColorString(imageSphere.viewZ);
                }
                if (imageSphere.viewRadius > 0) {
                    basics.drawSphere(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, color);
                } else {
                    basics.drawCircle(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, color);
                }
            }
        }
    }
};

mapping.drawPointsMappingBubbles = function() {
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            if (mappingSphere.viewRadius > 0) {
                basics.drawLowerBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            }
            basics.startDrawingPoints();
            const points = mappingSphere.viewPoints;
            const length = points.length;
            for (let j = 0; j < length; j++) {
                const point = points[j];
                const intColor = interpolateColorInteger(point[2]);
                basics.drawPoint(point, intColor);
            }
            output.pixels.show();
            if (mappingSphere.viewRadius > 0) {
                basics.drawUpperBubble(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            } else {
                const color = (mapping.specialColor) ? imageSphere.color : mapping.colorFront;
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, color);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.drawPointsInFront = function() {
    var intColor;
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const points = mappingSphere.viewPoints;
            const length = points.length;
            for (let j = 0; j < length; j++) {
                const point = points[j];
                const z = point[2];
                if (z >= 0) {
                    const intColor = interpolateColorInteger(z);
                    basics.drawPoint(point, intColor);
                }
            }
        }
    }
};

mapping.drawPointsInBack = function() {
    var intColor;
    setupColorInterpolation();
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const points = mappingSphere.viewPoints;
            const length = points.length;
            for (let j = 0; j < length; j++) {
                const point = points[j];
                const z = point[2];
                if (z < 0) {
                    const intColor = interpolateColorInteger(z);
                    basics.drawPoint(point, intColor);
                }
            }
        }
    }
};

mapping.drawStereographicPointsInBack = function() {
    if (basics.view === 'both (for points only)') {
        var intColor;
        setupColorInterpolation();
        mappingLength = mapping.spheres.length;
        for (let i = 0; i < mappingLength; i++) {
            const mappingSphere = mapping.spheres[i];
            if (mappingSphere.on) {
                const points = mappingSphere.viewPoints;
                const stereographicPoints = mappingSphere.stereographicPoints;
                const length = points.length;
                for (let j = 0; j < length; j++) {
                    const stereographicPoint = stereographicPoints[j];
                    if (stereographicPoint[2] < 0) {
                        const point = points[j];
                        const intColor = interpolateColorInteger(point[2]);
                        basics.drawPoint(stereographicPoint, intColor);
                    }
                }
            }
        }
    }
};

mapping.drawStereographicPointsInFront = function() {
    if (basics.view === 'both (for points only)') {
        var intColor;
        setupColorInterpolation();
        mappingLength = mapping.spheres.length;
        for (let i = 0; i < mappingLength; i++) {
            const mappingSphere = mapping.spheres[i];
            if (mappingSphere.on) {
                const points = mappingSphere.viewPoints;
                const stereographicPoints = mappingSphere.stereographicPoints;
                const length = points.length;
                for (let j = 0; j < length; j++) {
                    const stereographicPoint = stereographicPoints[j];
                    if (stereographicPoint[2] >= 0) {
                        const point = points[j];
                        const intColor = interpolateColorInteger(point[2]);
                        basics.drawPoint(stereographicPoint, intColor);
                    }
                }
            }
        }
    }
};

// equator for stereographic projection
//=============================================

mapping.equatorOn = true;
mapping.equatorColor = '#aaaa00';
mapping.equatorNPoints = 500;
const equator = [];

function addEquatorPoint(x, y, z) {
    const point = new Float32Array(3);
    point[0] = x;
    point[1] = y;
    point[2] = z;
    equator.push(point);
}

mapping.createEquator = function() {
    const nPoints = mapping.equatorNPoints;
    const deltaAngle = 2 * Math.PI / nPoints;
    const hyperbolicRadius = basics.hyperbolicRadius;
    const r2 = 4 * hyperbolicRadius * hyperbolicRadius;
    const rt05 = Math.sqrt(0.5);
    equator.length = 0;
    let angle = 0;
    for (var i = 0; i < nPoints; i++) {
        let point = new Float32Array(3);
        let x = Math.cos(angle) * hyperbolicRadius;
        const y = Math.sin(angle) * hyperbolicRadius;
        addEquatorPoint(x, y, 0);
        addEquatorPoint(rt05 * x, rt05 * x, y);
        addEquatorPoint(rt05 * x, -rt05 * x, y);
        addEquatorPoint(2 * x, 2 * y, -hyperbolicRadius);
        const dz = y - hyperbolicRadius;
        const factor = r2 / (x * x + dz * dz);
        const z = hyperbolicRadius + dz * factor;
        x *= factor;
        addEquatorPoint(rt05 * x, rt05 * x, z);
        addEquatorPoint(rt05 * x, -rt05 * x, z);
        angle += deltaAngle;
    }
    basics.tiltRotatePoints(equator);
};

mapping.drawEquatorBack = function() {
    if (mapping.equatorOn && (basics.view === 'both (for points only)')) {
        const color = {};
        ColorInput.setObject(color, mapping.equatorColor);
        const intColor = Pixels.integerOfColor(color);
        const length = equator.length;
        for (var i = 0; i < length; i++) {
            const point = equator[i];
            if (point[2] < 0) {
                basics.drawPoint(point, intColor);
            }
        }
    }
};

mapping.drawEquatorFront = function() {
    if (mapping.equatorOn && (basics.view === 'both (for points only)')) {
        const color = {};
        ColorInput.setObject(color, mapping.equatorColor);
        const intColor = Pixels.integerOfColor(color);
        const length = equator.length;
        for (var i = 0; i < length; i++) {
            const point = equator[i];
            if (point[2] >= 0) {
                basics.drawPoint(point, intColor);
            }
        }
    }
};