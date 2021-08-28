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

function addMappingSphere(radius, x, y, z = 0) {
    const sphere = {};
    sphere.radius = radius;
    sphere.radius = radius * radius;
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
        sphere = mapping.spheres[i];
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

// creating the images
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
        if (i !== lastMappingIndex) {
            const mappingSphere = mapping.spheres[i];
            if (mappingSphere.on) {
                const mapRadius2 = mappingSphere.radius2;
                const mapX = mappingSphere.x;
                const mapY = mappingSphere.y;
                const mapZ = mappingSphere.z;
                const dx = x - mapX;
                const dy = y - mapY;
                const dz = z - mapZ;
                const d2 = dx * dx + dy * dy + dz * dz;
                const factor = mapRadius2 / (d2 - radius2);
                const newRadius = radius * factor;
                const newX = mapX + dx * factor;
                const newY = mapY + dy * factor;
                const newZ = mapZ + dz * factor;
                if (generation <= minGeneration) {
                    addImageSphere(mappingSphere, generation, newRadius, newX, newY, newZ, color);
                } else if (newRadius < minRadius) {
                    addPoint(mappingSphere, newX, newY, newZ);
                }
                // do always at least the minimum generation independent of radius, save these image spheres
                // do up to maximum generation if radius not small enough
                // maximum generation is safeguard
                // minimum generation is for making images
                if ((generation < minGeneration) || ((generation < maxGeneration) && (newRadius > minRadius))) {
                    imagesOfSphere(generation, i, newRadius, newX, newY, newZ, color);
                }
            }
        }
    }
}