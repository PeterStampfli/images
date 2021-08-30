/* jshint esversion: 6 */

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
mapping.additionalPoints = 1; // create more points with mapping
mapping.useTouchingPoints = true; // points where circles touch belong to the limit set

function addMappingSphere(radius, x, y, z = 0) {
    const sphere = {};
    sphere.radius = radius;
    sphere.radius2 = radius * radius;
    sphere.x = x;
    sphere.y = y;
    sphere.z = z;
    const index = mapping.spheres.length;
    sphere.color = colors[index % colors.length];
    sphere.on = (index < mapping.on.length) ? mapping.on[index] : true;
    sphere.imageSpheres = [];
    sphere.points = [];
    sphere.viewPoints = [];
    mapping.spheres.push(sphere);
}

function addImageSphere(mappingSphere, generation, radius, x, y, z, color) {
    const sphere = {};
    sphere.generation = generation;
    sphere.color = color;
    sphere.radius = radius;
    sphere.x = x;
    sphere.y = y;
    sphere.z = z;
    mappingSphere.imageSpheres.push(sphere);
}

function addPoint(mappingSphere, x, y, z) {
    const point = new Float32Array(3);
    point[0] = x;
    point[1] = y;
    point[2] = z;
    mappingSphere.points.push(point);
    mappingSphere.viewPoints.push(new Float32Array(3));
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

// creating the images (spheres and points)
//===================================

var maxGeneration, minGeneration, minRadius, mappingLength;

// create the images of the existing mapping spheres
mapping.createImages = function() {
    maxGeneration = mapping.maxGeneration;
    minGeneration = mapping.minGeneration;
    minRadius = mapping.minRadius;
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            addImageSphere(mappingSphere, 1, mappingSphere.radius, mappingSphere.x, mappingSphere.y, mappingSphere.z, mappingSphere.color);
            imagesOfSphere(1, i, mappingSphere.radius, mappingSphere.x, mappingSphere.y, mappingSphere.z, mappingSphere.color);
        }
    }
};

function imagesOfSphere(generation, lastMappingIndex, radius, x, y, z, color) {
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
                addImageSphere(mappingSphere, generation, newRadius, newX, newY, newZ, color);
                if (newRadius < minRadius) {
                    addPoint(mappingSphere, newX, newY, newZ);
                    moreImagePoints(0, i, newX, newY, newZ);
                }
            } else if (newRadius < minRadius) {
                addPoint(mappingSphere, newX, newY, newZ);
                moreImagePoints(0, i, newX, newY, newZ);
            } else if (generation < minGeneration) {
                imagesOfSphere(generation, i, newRadius, newX, newY, newZ, color);
            }
        }
    }
}

function moreImagePoints(iterations, lastMappingIndex, x, y, z) {
    if (iterations < mapping.additionalPoints) {
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
            addPoint(mappingSphere, newX, newY, newZ);
            moreImagePoints(iterations, i, newX, newY, newZ);
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
                if (mapping.additionalPoints === 0) {
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
                    moreImagePoints(1, k, newX, newY, newZ);
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
    basics.setupStereographicView();
    basics.copyCoordinatesSpheres(mapping.spheres);
    basics.rotateSpheres(mapping.spheres);
    if (basics.view !== 'normal') {
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
            if (basics.view !== 'normal') {
                basics.stereographicViewSpheres(imageSpheres);
            }
            basics.tiltRotateSpheres(imageSpheres);
            basics.zSortSpheres(imageSpheres);
            const viewPoints = mappingSphere.viewPoints;
            basics.copyCoordinatesPoints(viewPoints, mappingSphere.points);
            basics.rotatePoints(viewPoints);
            if (basics.view !== 'normal') {
                basics.stereographicViewPoints(viewPoints);
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
mapping.imageSphereColor = '#ff0000';
mapping.specialColor = true;

// showing mapping spheres
// if special color: draw circle in special color
// else draw circle in black around disc or nothing around bubble/sphere

mapping.spheresAsSpheres = function() {
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            basics.drawSphere(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            if (mapping.specialColor) {
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mappingSphere.color);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};

mapping.spheresAsDiscs = function() {
    mappingLength = mapping.spheres.length;
    for (let i = 0; i < mappingLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            basics.drawDisc(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
            if (mapping.specialColor) {
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mappingSphere.color);
            } else {
                basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius);
            }
        } else {
            basics.drawCircle(mappingSphere.viewX, mappingSphere.viewY, mappingSphere.viewRadius, mapping.color);
        }
    }
};