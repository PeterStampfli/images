/* jshint esversion: 6 */
import {
    output,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

export const poincareSphere = {};
export const mappingSpheres = {};
export const imageSpheres = {};
export const imagePoints = {};
export const eulerAngles = {};

const rt3 = Math.sqrt(3);

//  drawing the poincare sphere for reference
//==========================================================
// set the hyperbolic radius with mappingSpheres.setProjection
var hyperbolicRadius;

poincareSphere.drawDisc = function() {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = poincareSphere.color;
    canvasContext.beginPath();
    canvasContext.arc(0, 0, hyperbolicRadius, 0, 2 * Math.PI);
    canvasContext.fill();
};

// the mapping spheres, 3 dimensions
//==================================================================
const mappingRadius = [];
const mappingRadius2 = [];
const mappingCenterX = [];
const mappingCenterY = [];
const mappingCenterZ = [];
// for display: an array of Float32Arrays, [x,y,z,radius]
// take only required generation
// sorting: a.sort((one,two)=>one[2]-two[2])  for the z-component
const mapSpheresDisplay = [];

function clearMapping() {
    mappingRadius.length = 0;
    mappingRadius2.length = 0;
    mappingCenterX.length = 0;
    mappingCenterY.length = 0;
    mappingCenterZ.length = 0;
}

mappingSpheres.add = function(radius, centerX, centerY, centerZ = 0) {
    mappingRadius.push(radius);
    mappingRadius2.push(radius * radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
    mappingCenterZ.push(centerZ);
};

// add a projected mapping sphere
// stereographic projection from inversion at a projecting sphere
// from 3d to 2d and from 4d to 3d

var projectionRadius, projectionRadius2, projectionCenter;

mappingSpheres.setProjection = function(radius, centerX, centerY, centerZ, centerW = 0) {
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ + centerW * centerW;
    hyperbolicRadius = Math.sqrt(d2 - radius * radius);
    projectionCenter = hyperbolicRadius;
    projectionRadius = Math.sqrt(2) * hyperbolicRadius;
    projectionRadius2 = projectionRadius * projectionRadius;
};

// typically 4d spheres on a 4d sphere, defining a 4d hyperbolic space
// projecting to 3d space, for calculating the structure of the surface of the hyperbolic space
mappingSpheres.add4dto3d = function(radius, centerX, centerY, centerZ, centerW) {
    const dw = centerW - projectionCenter;
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ + dw * dw;
    const factor = projectionRadius2 / (d2 - radius * radius);
    mappingSpheres.add(radius * Math.abs(factor), centerX * factor, centerY * factor, centerZ * factor);
};

mappingSpheres.log = function() {
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < mappingRadius.length; i++) {
        console.log(i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
};

mappingSpheres.copy = function() {
    mapSpheresDisplay.length = 0;
    const length = mappingRadius.length;
    for (var i = 0; i < length; i++) {
        const data = new Float32Array(4);
        data[0] = mappingCenterX[i];
        data[1] = mappingCenterY[i];
        data[2] = mappingCenterZ[i];
        data[3] = mappingRadius[i];
        mapSpheresDisplay.push(data);
    }
};

// for the simple 2d case, or top-down view
// draw circles for the mapping spheres (not discs)
mappingSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(mappingSpheres.lineWidth);
    canvasContext.strokeStyle = mappingSpheres.color;
    const length = mapSpheresDisplay.length;
    for (var i = 0; i < length; i++) {
        const data = mapSpheresDisplay[i];
        canvasContext.beginPath();
        canvasContext.arc(data[0], data[1], data[3], 0, 2 * Math.PI);
        canvasContext.stroke();
    }
};

// creating mapping spheres configurations
//==============================================================

mappingSpheres.tetrahedron = function() {
    // four inverting spheres at the corners of a tetrahedron
    const rSphere = 0.8165;
    const cx2 = 0.9428;
    const cx34 = -0.4714;
    const cy3 = 0.8165;
    const cy4 = -0.8165;
    const cz234 = 0.3333;
    // (0,0,-1),(cx2,0,cz234),(cx34,cy3,cz234),(cx34,cy4,cz234)
    mappingSpheres.setProjection(rSphere, 0, 0, 1);
    mappingSpheres.add(rSphere, 0, 0, -1);
    mappingSpheres.add(rSphere, cx2, 0, cz234);
    mappingSpheres.add(rSphere, cx34, cy3, cz234);
    mappingSpheres.add(rSphere, cx34, cy4, cz234);
};

// the resulting image spheres
//================================================================
const imageGeneration = [];
const imageRadius = [];
const imageCenterX = [];
const imageCenterY = [];
const imageCenterZ = [];
// for display: an array of Float32Arrays, [x,y,z,radius]
// take only required generation
// sorting: a.sort((one,two)=>one[2]-two[2])  for the z-component
const imageSpheresDisplay = [];

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

imageSpheres.copy = function() {
    imageSpheresDisplay.length = 0;
    const drawGeneration = Math.min(imageSpheres.drawGeneration, mappingSpheres.minGeneration);
    imageSpheres.drawGenController.setValueOnly(drawGeneration);
    const length = imageRadius.length;
    for (var i = 0; i < length; i++) {
        if (imageGeneration[i] === drawGeneration) {
            const data = new Float32Array(4);
            data[0] = imageCenterX[i];
            data[1] = imageCenterY[i];
            data[2] = imageCenterZ[i];
            data[3] = imageRadius[i];
            imageSpheresDisplay.push(data);
        }
    }
};

imageSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(imageSpheres.lineWidth);
    canvasContext.strokeStyle = imageSpheres.stroke;
    canvasContext.fillStyle = imageSpheres.fill;
    const length = imageSpheresDisplay.length;
    for (var i = 0; i < length; i++) {
        const data = imageSpheresDisplay[i];
        canvasContext.beginPath();
        canvasContext.arc(data[0], data[1], data[3], 0, 2 * Math.PI);
        canvasContext.fill();
        canvasContext.stroke();
    }
};

// the resulting image points (very small spheres)
//===================================================
const imagePointX = [];
const imagePointY = [];
const imagePointZ = [];
// for display: an array of Float32Arrays, [x,y,z]
// sorting: a.sort((one,two)=>one[2]-two[2])  for the z-component
const pointsDisplay = [];

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

imagePoints.copy = function() {
    pointsDisplay.length = 0;
    const length = imagePointX.length;
    for (var i = 0; i < length; i++) {
        const data = new Float32Array(3);
        data[0] = imagePointX[i];
        data[1] = imagePointY[i];
        data[2] = imagePointZ[i];
        pointsDisplay.push(data);
    }
};

var width, height, invScale, shiftX, shiftY, pixelSize, intColor, pixelsArray,data;

function drawPoint(k) {
    let i = invScale * (data[0] - shiftX);
    let j = invScale * (data[1] - shiftY);
    switch (pixelSize) {
        case 1:
            i = Math.floor(i);
            j = Math.floor(j);
            if ((i >= 0) && (i < width) && (j >= 0) && (j < height)) {
                pixelsArray[i + j * width] = intColor;
            }
            break;
        case 2:
            i = Math.round(i);
            j = Math.round(j);
            if ((i > 0) && (i < width) && (j > 0) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
            }
            break;
        case 3:
            i = Math.floor(i) + 1;
            j = Math.floor(j) + 1;
            if ((i >= 2) && (i < width) && (j >= 2) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
            }
            break;
        case 4:
            i = Math.round(i) + 1;
            j = Math.round(j) + 1;
            if ((i >= 3) && (i < width) && (j >= 3) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                pixelsArray[index - 3] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                pixelsArray[index - 3] = intColor;
                index -= width;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
            }
            break;
    }
}

imagePoints.drawPixels = function() {
    const imagePointsColor = {};
    output.pixels.update();
    pixelsArray = output.pixels.array;
    const scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    invScale = 1 / scale;
    shiftX = output.coordinateTransform.shiftX;
    shiftY = output.coordinateTransform.shiftY;
    // (x,y)=scale*(i,j)+(shiftX,shiftY)
    width = output.canvas.width;
    height = output.canvas.height;
    pixelSize = imagePoints.pixelSize;
    const length = imagePointX.length;
    ColorInput.setObject(imagePointsColor, imagePoints.colorBack);
    intColor = Pixels.integerOfColor(imagePointsColor);
    for (let k = 0; k < length; k++) {
        data = pointsDisplay[k];
        if (data[2] < 0) {
            drawPoint(k);
        }
    }
    ColorInput.setObject(imagePointsColor, imagePoints.colorFront);
    intColor = Pixels.integerOfColor(imagePointsColor);
    for (let k = 0; k < length; k++) {
        data = pointsDisplay[k];
        if (data[2] >= 0) {
            drawPoint(k);
        }
    }
    output.pixels.show();
};

// creating the images
//===================================

var maxGeneration, minGeneration, minimumRadius, mappingLength;

// using images of the mapping spheres

mappingSpheres.createImageSpheres = function() {
    clearImageSpheres();
    clearImagePoints();
    clearMapping();
    mappingSpheres.config();
    mappingLength = mappingRadius.length;
    for (let i = 0; i < mappingRadius.length; i++) {
        addImageSphere(0, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
    maxGeneration = mappingSpheres.maxGeneration;
    minGeneration = mappingSpheres.minGeneration;
    minimumRadius = mappingSpheres.minimumRadius;
    mappingLength = mappingRadius.length;
    for (let i = 0; i < mappingLength; i++) {
        imageOfSphere(0, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
    }
};

function imageOfSphere(generation, lastMapping, radius, centerX, centerY, centerZ) {
    generation += 1;
    const radius2 = radius * radius;
    for (let i = 0; i < mappingLength; i++) {
        // map only at spheres that do not contain it
        if (i !== lastMapping) {
            const mapRadius2 = mappingRadius2[i];
            const mapX = mappingCenterX[i];
            const mapY = mappingCenterY[i];
            const mapZ = mappingCenterZ[i];
            const dx = centerX - mapX;
            const dy = centerY - mapY;
            const dz = centerZ - mapZ;
            const d2 = dx * dx + dy * dy + dz * dz;
            const factor = mapRadius2 / (d2 - radius2); // touching spheres laying outside
            const newRadius = radius * Math.abs(factor); // touching surrounding spheres
            const newCenterX = mapX + dx * factor;
            const newCenterY = mapY + dy * factor;
            const newCenterZ = mapZ + dz * factor;
            if (generation <= minGeneration) {
                imageGeneration.push(generation);
                imageRadius.push(newRadius);
                imageCenterX.push(newCenterX);
                imageCenterY.push(newCenterY);
                imageCenterZ.push(newCenterZ);
            } else if (newRadius < minimumRadius) {
                imagePointX.push(newCenterX);
                imagePointY.push(newCenterY);
                imagePointZ.push(newCenterZ);
            } // do always at least the minimum generation independent of radius, save these image spheres
            // do up to maximum generation if radius not small enough
            // maximum generation is safeguard
            // minimum generation is for making images
            if ((generation < minGeneration) || ((generation < maxGeneration) && (newRadius > minimumRadius))) {
                imageOfSphere(generation, i, newRadius, newCenterX, newCenterY, newCenterZ);
            }
        }
    }
}

//  image transforms/views
//================================

const fromDeg = Math.PI / 180;

var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

eulerAngles.updateCoefficients = function() {
    const c1 = Math.cos(fromDeg * eulerAngles.alpha);
    const s1 = Math.sin(fromDeg * eulerAngles.alpha);
    const c2 = Math.cos(fromDeg * eulerAngles.beta);
    const s2 = Math.sin(fromDeg * eulerAngles.beta);
    const c3 = Math.cos(fromDeg * eulerAngles.gamma);
    const s3 = Math.sin(fromDeg * eulerAngles.gamma);
    txx = c1 * c3 - c2 * s1 * s3;
    txy = -c1 * s3 - c2 * c3 * s1;
    txz = s1 * s2;
    tyx = c3 * s1 + c1 * c2 * s3;
    tyy = c1 * c2 * c3 - s1 * s3;
    tyz = -c1 * s2;
    tzx = s2 * s3;
    tzy = c3 * s2;
    tzz = c2;
};

function eulerRotation() {
    const newX = txx * x + txy * y + txz * z;
    const newY = tyx * x + tyy * y + tyz * z;
    z = tzx * x + tzy * y + tzz * z;
    x = newX;
    y = newY;
}