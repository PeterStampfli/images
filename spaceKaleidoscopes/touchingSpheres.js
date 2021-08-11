/* jshint esversion: 6 */

export const mappingSpheres = {};
export const imageSpheres = {};
export const imagePoints = {};

const rt3 = Math.sqrt(3);

// the mapping spheres, 3 dimensions
//==================================================================
const mappingRadius = [];
const mappingRadius2 = [];
const mappingCenterX = [];
const mappingCenterY = [];
const mappingCenterZ = [];
// we need them for drawing?
// drawing routines better fit here
// but it may be useful for tests
mappingSpheres.radius = mappingRadius;
mappingSpheres.centerX = mappingCenterX;
mappingSpheres.centerY = mappingCenterY;
mappingSpheres.centerZ = mappingCenterZ;

function clearMapping() {
    mappingRadius.length = 0;
    mappingRadius2.length = 0;
    mappingCenterX.length = 0;
    mappingCenterY.length = 0;
    mappingCenterZ.length = 0;
}

function addMappingSphere(radius, centerX, centerY, centerZ) {
    mappingRadius.push(radius);
    mappingRadius2.push(radius * radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
    mappingCenterZ.push(centerZ);
}

// add a projected mapping sphere
// stereographic projection from inversion at a projecting sphere
// from 3d to 2d and from 4d to 3d

var projectionRadius, projectionRadius2, projectionCenter;

function setProjection(radius, centerX, centerY, centerZ = 0, centerW = 0) {
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ + centerW * centerW;
    const hyperbolicRadius = Math.sqrt(d2 - radius * radius);
    projectionCenter = hyperbolicRadius;
    projectionRadius = Math.sqrt(2) * hyperbolicRadius;
    projectionRadius2 = projectionRadius * projectionRadius;
}

// typically 3d spheres on a 3d sphere, defining a 3d hyperbolic space
function add3dTo2dMappingSphere(radius, centerX, centerY, centerZ) {
    const dz = centerZ - projectionCenter;
    const d2 = centerX * centerX + centerY * centerY + dz * dz;
    const factor = projectionRadius2 / (d2 - radius * radius);
    addMappingSphere(radius * Math.abs(factor), centerX * factor, centerY * factor, projectionCenter + dz * factor);
}

// typically 4d spheres on a 4d sphere, defining a 4d hyperbolic space
// projecting to 3d space, for calculating the structure of the surface of the hyperbolic space
function add4dTo3dMappingSphere(radius, centerX, centerY, centerZ, centerW) {
    const dw = centerW - projectionCenter;
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ + dw * dw;
    const factor = projectionRadius2 / (d2 - radius * radius);
    console.log('w', projectionCenter + dw * factor);
    addMappingSphere(radius * Math.abs(factor), centerX * factor, centerY * factor, centerZ * factor);
}

mappingSpheres.log = function logMappingSpheres() {
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < mappingRadius.length; i++) {
        console.log(i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
};

// creating mapping spheres configurations
//==============================================================
mappingSpheres.idealTriangle = function() {
    clearMapping();
    addMappingSphere(rt3 / 2, 1, 0, 0);
    addMappingSphere(rt3 / 2, -0.5, rt3 / 2, 0);
    addMappingSphere(rt3 / 2, -0.5, -rt3 / 2, 0);
};

// the stack
//================================================================
const stackGeneration = [];
const stackLastMapping = [];
const stackRadius = [];
const stackCenterX = [];
const stackCenterY = [];
const stackCenterZ = [];

function addStackSphere(generation, lastMapping, radius, centerX, centerY, centerZ) {
    stackGeneration.push(generation);
    stackLastMapping.push(lastMapping);
    stackRadius.push(radius);
    stackCenterX.push(centerX);
    stackCenterY.push(centerY);
    stackCenterZ.push(centerZ);
}

function clearStackSpheres() {
    stackGeneration.length = 0;
    stackLastMapping.length = 0;
    stackRadius.length = 0;
    stackCenterX.length = 0;
    stackCenterY.length = 0;
    stackCenterZ.length = 0;
}

function logStackSpheres() {
    console.log("stack spheres, index,generation,lastMapping,radius,centerXYZ");
    for (var i = 0; i < stackRadius.length; i++) {
        console.log(i, stackGeneration[i], stackLastMapping[i], stackRadius[i], stackCenterX[i], stackCenterY[i], stackCenterZ[i]);
    }
}

// the resulting image spheres
//================================================================
const imageGeneration = [];
const imageRadius = [];
const imageCenterX = [];
const imageCenterY = [];
const imageCenterZ = [];
imageSpheres.generation = imageGeneration;
imageSpheres.radius = imageRadius;
imageSpheres.centerX = imageCenterX;
imageSpheres.centerY = imageCenterY;
imageSpheres.centerZ = imageCenterZ;

function addImageSphere(generation, radius, centerX, centerY, centerZ) {
    imageGeneration.push(generation);
    imageRadius.push(radius);
    imageCenterX.push(centerX);
    imageCenterY.push(centerY);
    imageCenterZ.push(centerZ);
}

function clearImageSpheres() {
    imageGeneration.length = 0;
    imageRadius.length = 0;
    imageCenterX.length = 0;
    imageCenterY.length = 0;
    imageCenterZ.length = 0;
}

imageSpheres.log = function() {
    console.log("image spheres, generation,radius,centerXYZ");
    for (var i = 0; i < imageRadius.length; i++) {
        console.log(i, imageGeneration[i], imageRadius[i], imageCenterX[i], imageCenterY[i], imageCenterZ[i]);
    }
};

// the resulting image points (very small spheres)
//===================================================
const imagePointX = [];
const imagePointY = [];
const imagePointZ = [];
imagePoints.x = imagePointX;
imagePoints.y = imagePointY;
imagePoints.z = imagePointZ;

function clearImagePoints() {
    imagePointX.length = 0;
    imagePointY.length = 0;
    imagePointZ.length = 0;
}

imagePoints.log = function() {
    console.log("image points, position XYZ");
    for (var i = 0; i < imagePointX.length; i++) {
        console.log(i, imagePointX[i], imagePointY[i], imagePointZ[i]);
    }
};

// creating the images
//===================================

// limits
mappingSpheres.maxGeneration = 3;
mappingSpheres.minimumRadius = 0.01;

mappingSpheres.createImages = function createImages() {
    clearStackSpheres();
    clearImageSpheres();
    clearImagePoints();
    const mappingLength = mappingRadius.length;
    for (let i = 0; i < mappingRadius.length; i++) {
        addStackSphere(0, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
        addImageSphere(0, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
    const maxGeneration = mappingSpheres.maxGeneration;
    const minimumRadius = mappingSpheres.minimumRadius;
    while (stackRadius.length > 0) {
        // get a sphere from the stack, and then map it
        // mapping the sphere makes a new generation
        const sphereGeneration = stackGeneration.pop() + 1;
        const sphereLastMapping = stackLastMapping.pop();
        const sphereRadius = stackRadius.pop();
        const sphereRadius2 = sphereRadius * sphereRadius; // probably faster than reading it from memory
        const sphereCenterX = stackCenterX.pop();
        const sphereCenterY = stackCenterY.pop();
        const sphereCenterZ = stackCenterZ.pop();
        for (let i = 0; i < mappingLength; i++) {
            // map only at spheres that do not contain it
            if (i !== sphereLastMapping) {
                const mapRadius2 = mappingRadius2[i];
                const mapX = mappingCenterX[i];
                const mapY = mappingCenterY[i];
                const mapZ = mappingCenterZ[i];
                const dx = sphereCenterX - mapX;
                const dy = sphereCenterY - mapY;
                const dz = sphereCenterZ - mapZ;
                const d2 = dx * dx + dy * dy + dz * dz;
                const factor = mapRadius2 / (d2 - sphereRadius2); // touching spheres laying outside
                const newRadius = sphereRadius * factor;
                const newCenterX = mapX + dx * factor;
                const newCenterY = mapY + dy * factor;
                const newCenterZ = mapZ + dz * factor;
                if ((sphereGeneration < maxGeneration) && (newRadius > minimumRadius)) {
                    stackGeneration.push(sphereGeneration);
                    stackLastMapping.push(i);
                    stackRadius.push(newRadius);
                    stackCenterX.push(newCenterX);
                    stackCenterY.push(newCenterY);
                    stackCenterZ.push(newCenterZ);
                }
                if (newRadius > minimumRadius) {
                    imageGeneration.push(sphereGeneration);
                    imageRadius.push(newRadius);
                    imageCenterX.push(newCenterX);
                    imageCenterY.push(newCenterY);
                    imageCenterZ.push(newCenterZ);
                } else {
                    imagePointX.push(newCenterX);
                    imagePointY.push(newCenterY);
                    imagePointZ.push(newCenterZ);
                }
            }
        }
    }
};