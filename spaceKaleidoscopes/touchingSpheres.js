/* jshint esversion: 6 */

const rt3 = Math.sqrt(3);


// the mapping spheres, 3 dimensions
//==================================================================
const mappingRadius = [];
const mappingCenterX = [];
const mappingCenterY = [];
const mappingCenterZ = [];

function addMappingCircle(radius, centerX, centerY, centerZ) {
    mappingRadius.push(radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
    mappingCenterZ.push(centerZ);
}

function logMappingCircles() {
    console.log("mapping circles, index,radius,centerXYZ");
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

function addStackCircle(generation, lastMapping, radius, centerX, centerY, centerZ) {
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
        addStackCircle(0, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
}

function logStackCircles() {
    console.log("stack circles, index,generation,lastMapping,radius,centerXYZ");
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

function addResultCircle(generation, radius, centerX, centerY, centerZ) {
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
        addResultCircle(0,  mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
}

function logResultCircles() {
    console.log("result circles, index,generation,radius,centerXYZ");
    for (var i = 0; i < resultRadius.length; i++) {
        console.log(i, resultGeneration[i], resultRadius[i], resultCenterX[i], resultCenterY[i], resultCenterZ[i]);
    }
}

// creating the images
//===================================

// limits
let maxGeneration=3;
let minimumRadius=0.01;

function createCircles(){
    const mappingLength=mappingRadius.length;
    initStack();
    initResult();
while (stackRadius.length>0){
    const circleGeneration=stackGeneration.pop();
    const circleLastMapping=stackLastMapping.pop();
    const circleRadius=stackRadius.pop();
    const circleCenterX=stackCenterX.pop();
    const circleCenterY=stackCenterY.pop();
    const circleCenterZ=stackCenterZ.pop();

    for (var i=0;i<mappingLength;i++){
        if (i!==circleLastMapping){
            console.log(i);
        }
    }
}

}


// first test case
function threeMappingCircles() {
    addMappingCircle(rt3, 1, 0, 0);
    addMappingCircle(rt3, -0.5, rt3 / 2, 0);
    addMappingCircle(rt3, -0.5, -rt3 / 2, 0);
}

threeMappingCircles();

logMappingCircles();

createCircles();

logStackCircles();

logResultCircles();