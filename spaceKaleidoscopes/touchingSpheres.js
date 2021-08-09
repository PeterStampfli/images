/* jshint esversion: 6 */

const rt3 = Math.sqrt(3);


// the mapping spheres, 3 dimensions
//==================================================================
const mappingRadius = [];
const mappingRadius2 = [];
const mappingCenterX = [];
const mappingCenterY = [];
const mappingCenterZ = [];

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

function logMappingSpheres() {
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < mappingRadius.length; i++) {
        console.log(i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
}

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

function initStack() {
    stackGeneration.length = 0;
    stackLastMapping.length = 0;
    stackRadius.length = 0;
    stackCenterX.length = 0;
    stackCenterY.length = 0;
    stackCenterZ.length = 0;
    for (var i = 0; i < mappingRadius.length; i++) {
        addStackSphere(0, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
}

function logStackSpheres() {
    console.log("stack spheres, index,generation,lastMapping,radius,centerXYZ");
    for (var i = 0; i < stackRadius.length; i++) {
        console.log(i, stackGeneration[i], stackLastMapping[i], stackRadius[i], stackCenterX[i], stackCenterY[i], stackCenterZ[i]);
    }
}

// the result
//================================================================
const resultGeneration = [];
const resultRadius = [];
const resultCenterX = [];
const resultCenterY = [];
const resultCenterZ = [];

function addResultSphere(generation, radius, centerX, centerY, centerZ) {
    resultGeneration.push(generation);
    resultRadius.push(radius);
    resultCenterX.push(centerX);
    resultCenterY.push(centerY);
    resultCenterZ.push(centerZ);
}

function initResult() {
    resultGeneration.length = 0;
    resultRadius.length = 0;
    resultCenterX.length = 0;
    resultCenterY.length = 0;
    resultCenterZ.length = 0;
    for (var i = 0; i < mappingRadius.length; i++) {
        addResultSphere(0, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
}

function logResultSpheres() {
    console.log("result spheres, index,generation,radius,centerXYZ");
    for (var i = 0; i < resultRadius.length; i++) {
        console.log(i, resultGeneration[i], resultRadius[i], resultCenterX[i], resultCenterY[i], resultCenterZ[i]);
    }
}

// creating the images
//===================================

// limits
let maxGeneration = 3;
let minimumRadius = 0.01;

function createSpheres() {
    const mappingLength = mappingRadius.length;
    initStack();
    initResult();
    while (stackRadius.length > 0) {
        // get a sphere from the stack, and then map it
        let sphereGeneration = stackGeneration.pop();
        const sphereLastMapping = stackLastMapping.pop();
        const sphereRadius = stackRadius.pop();
        const sphereRadius2 = sphereRadius * sphereRadius; // probably faster than reading it from memory
        const sphereCenterX = stackCenterX.pop();
        const sphereCenterY = stackCenterY.pop();
        const sphereCenterZ = stackCenterZ.pop();
        for (var i = 0; i < mappingLength; i++) {
            // mapping the sphere makes a new generation
            sphereGeneration += 1;
            // map only at spheres that do not contain it
            if (i !== sphereLastMapping) {
                console.log(i);
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
                resultGeneration.push(sphereGeneration);
                resultRadius.push(newRadius);
                resultCenterX.push(newCenterX);
                resultCenterY.push(newCenterY);
                resultCenterZ.push(newCenterZ);
            }
        }
    }

}


// first test case
function threeMappingSpheres() {
    addMappingSphere(rt3, 1, 0, 0);
    addMappingSphere(rt3, -0.5, rt3 / 2, 0);
    addMappingSphere(rt3, -0.5, -rt3 / 2, 0);
}

//threeMappingSpheres();

setProjection(0.5, 1, 1, 1, 1);

add4dTo3dMappingSphere(0.5, 1, 1, 1, 1);
add4dTo3dMappingSphere(0.5, 1, 1, 1, -1);
add4dTo3dMappingSphere(0.5, 2, 0, 0, 0);

logMappingSpheres();

createSpheres();

logStackSpheres();

logResultSpheres();