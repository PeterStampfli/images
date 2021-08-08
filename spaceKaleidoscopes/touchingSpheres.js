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
    mappingRadius2.push(radius*radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
    mappingCenterZ.push(centerZ);
}

// add a projected mapping sphere
// stereographic projection from inversion at a projecting sphere
// from 3d to 2d and from 4d to 3d

var projectionRadius ,projectionRadius2,projectionCenter;

function setProjection(radius,centerX,centerY,centerZ=0,centerW=0){
    const d2=centerX*centerX+centerY*centerY+centerZ*centerZ+centerW*centerW;
    console.log(d2)
    const hyperbolicRadius=Math.sqrt(d2-radius*radius);
    projectionCenter=hyperbolicRadius;
    projectionRadius=Math.sqrt(2)*hyperbolicRadius;
    projectionRadius2=projectionRadius*projectionRadius;
    console.log(projectionCenter,projectionRadius)
}

function add3dTo2dMappingSphere(radius,centerX,centerY,centerZ) {
const dz= centerZ-projectionCenter;
const d2= centerX*centerX+centerY*centerY+dz*dz;
const factor=projectionRadius2/(d2-radius*radius) ;
addMappingSphere(radius*Math.abs(factor),centerX*factor,centerY*factor,projectionCenter+dz*factor);
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
        const sphereGeneration = stackGeneration.pop();
        const sphereLastMapping = stackLastMapping.pop();
        const sphereRadius = stackRadius.pop();
        const sphereCenterX = stackCenterX.pop();
        const sphereCenterY = stackCenterY.pop();
        const sphereCenterZ = stackCenterZ.pop();

        for (var i = 0; i < mappingLength; i++) {
            if (i !== sphereLastMapping) {
                console.log(i);
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

setProjection(0.5,1,1,1);
add3dTo2dMappingSphere(0.5,1,1,1);
add3dTo2dMappingSphere(0.5,rt3,0,0);
add3dTo2dMappingSphere(0.5,0,0,rt3);
add3dTo2dMappingSphere(0.5,1,1,-1);
add3dTo2dMappingSphere(0.5,-1,1,-1);


logMappingSpheres();

createSpheres();

logStackSpheres();

logResultSpheres();