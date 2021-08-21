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
export const view = {};

const rt3 = Math.sqrt(3);
const colorObject = {};
const lightness = 0.75;
const darkness = 0.5;

// drawing spheres
//=================================

function drawDisc(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
}

function drawCircle(x, y, radius, color, lineWidth) {
    const canvasContext = output.canvasContext;
    output.setLineWidth(lineWidth);
    canvasContext.strokeStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.stroke();
}

function drawDiscCircle(x, y, radius, colorDisc, colorCircle, lineWidth) {
    const canvasContext = output.canvasContext;
    output.setLineWidth(lineWidth);
    canvasContext.strokeStyle = colorCircle;
    canvasContext.fillStyle = colorDisc;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.stroke();
}

function drawSphere(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - lightness) + 255.9 * lightness);
    colorObject.green = Math.floor(colorObject.green * (1 - lightness) + 255.9 * lightness);
    colorObject.blue = Math.floor(colorObject.blue * (1 - lightness) + 255.9 * lightness);
    const lightColor = ColorInput.stringFromObject(colorObject);
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - darkness));
    colorObject.green = Math.floor(colorObject.green * (1 - darkness));
    colorObject.blue = Math.floor(colorObject.blue * (1 - darkness));
    const darkColor = ColorInput.stringFromObject(colorObject);
    const grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, radius * 0.1, x - 0.5 * radius, y - 0.5 * radius, radius * 1.5);
    grd.addColorStop(0, lightColor);
    grd.addColorStop(0.8, color);
    grd.addColorStop(1, darkColor);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
}

function drawUpperBubble(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = 0;
    const transparentColor = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, 0, x - 0.5 * radius, y - 0.5 * radius, radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
}

function drawLowerBubble(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = 0;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.9, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = 200;
    color = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x + 0.5 * radius, y + 0.5 * radius, 0, x + 0.5 * radius, y + 0.5 * radius, 0.8 * radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
}

//  drawing the poincare sphere for reference
//==========================================================
// set the hyperbolic radius with mappingSpheres.setProjection
var hyperbolicRadius;

poincareSphere.drawCircle = function() {
    drawCircle(0, 0, hyperbolicRadius, poincareSphere.color, poincareSphere.lineWidth);
};

poincareSphere.drawSphere = function() {
    drawSphere(0, 0, hyperbolicRadius, poincareSphere.color);
};

poincareSphere.drawUpperBubble = function() {
    drawUpperBubble(0, 0, hyperbolicRadius, poincareSphere.color);
};

poincareSphere.drawLowerBubble = function() {
    drawLowerBubble(0, 0, hyperbolicRadius, poincareSphere.color);
};

// the mapping spheres, 3 dimensions
//==================================================================
const mappingRadius = [];
const mappingRadius2 = [];
const mappingCenterX = [];
const mappingCenterY = [];
const mappingCenterZ = [];
const mappingImageGeneration = []; // collecting the image spheres inside the mapping sphere
const mappingImageCenterX = [];
const mappingImageCenterY = [];
const mappingImageCenterZ = [];
const mappingImageRadius = [];
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
    mappingImageGeneration.length = 0;
    mappingImageCenterX.length = 0;
    mappingImageCenterY.length = 0;
    mappingImageCenterZ.length = 0;
    mappingImageRadius.length = 0;
}

mappingSpheres.add = function(radius, centerX, centerY, centerZ = 0) {
    mappingRadius.push(radius);
    mappingRadius2.push(radius * radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
    mappingCenterZ.push(centerZ);
    mappingImageGeneration.push([]);
    mappingImageCenterX.push([]);
    mappingImageCenterY.push([]);
    mappingImageCenterZ.push([]);
    mappingImageRadius.push([]);
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
        const data = [];
        data.length = 5;
        data[0] = mappingCenterX[i];
        data[1] = mappingCenterY[i];
        data[2] = mappingCenterZ[i];
        data[3] = mappingRadius[i];
        data[4] = i;
        mapSpheresDisplay.push(data);
    }
};

mappingSpheres.rotate = function() {
    rotate(mapSpheresDisplay);
};

mappingSpheres.transform = function() {
    view.spheresTransform(mapSpheresDisplay);
};

mappingSpheres.zSort = function() {
    zSort(mapSpheresDisplay);
};

// for the simple 2d case, or top-down view
// draw circles for the mapping spheres (not discs)
mappingSpheres.drawSpheres = function() {
    const length = mapSpheresDisplay.length;
    for (var i = 0; i < length; i++) {
        const data = mapSpheresDisplay[i];
        const radius = data[3];
        if (radius > 0) {
            drawSphere(data[0], data[1], data[3], mappingSpheres.color);
        } else {
            drawCircle(data[0], data[1], -data[3], mappingSpheres.color);
        }
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

function addImageSphere(generation, mappingSphere, radius, centerX, centerY, centerZ) {
    imageGeneration.push(generation);
    imageRadius.push(radius);
    imageCenterX.push(centerX);
    imageCenterY.push(centerY);
    imageCenterZ.push(centerZ);
    mappingImageGeneration[mappingSphere].push(generation);
    mappingImageRadius[mappingSphere].push(radius);
    mappingImageCenterX[mappingSphere].push(centerX);
    mappingImageCenterY[mappingSphere].push(centerY);
    mappingImageCenterZ[mappingSphere].push(centerZ);
}

function clearImageSpheres() {
    imageGeneration.length = 0;
    imageRadius.length = 0;
    imageCenterX.length = 0;
    imageCenterY.length = 0;
    imageCenterZ.length = 0;
    const length = mappingRadius.length;
    for (var i = 0; i < length; i++) {
        mappingImageGeneration[i].length = 0;
        mappingImageCenterX[i].length = 0;
        mappingImageCenterY[i].length = 0;
        mappingImageCenterZ[i].length = 0;
        mappingImageRadius[i].length = 0;
    }
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

imageSpheres.rotate = function() {
    rotate(imageSpheresDisplay);
};

imageSpheres.transform = function() {
    view.spheresTransform(imageSpheresDisplay);
};

imageSpheres.zSort = function() {
    zSort(imageSpheresDisplay);
};

imageSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(imageSpheres.lineWidth);
    canvasContext.strokeStyle = imageSpheres.stroke;
    canvasContext.fillStyle = imageSpheres.fill;
    const length = imageSpheresDisplay.length;
    for (var i = 0; i < length; i++) {
        const data = imageSpheresDisplay[i];
        const radius = data[3];
        canvasContext.beginPath();
        canvasContext.arc(data[0], data[1], Math.abs(data[3]), 0, 2 * Math.PI);
        if (radius > 0) {
            canvasContext.fill();
        }
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

imagePoints.rotate = function() {
    rotate(pointsDisplay);
};

imagePoints.transform = function() {
    view.pointsTransform(pointsDisplay);
};

var width, height, invScale, shiftX, shiftY, pixelSize, intColor, pixelsArray, data;

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
    if (imagePoints.drawBack) {
        ColorInput.setObject(imagePointsColor, imagePoints.colorBack);
        intColor = Pixels.integerOfColor(imagePointsColor);
        for (let k = 0; k < length; k++) {
            data = pointsDisplay[k];
            if (data[2] < 0) {
                drawPoint(k);
            }
        }
    }
    if (imagePoints.drawFront) {
        ColorInput.setObject(imagePointsColor, imagePoints.colorFront);
        intColor = Pixels.integerOfColor(imagePointsColor);
        for (let k = 0; k < length; k++) {
            data = pointsDisplay[k];
            if (data[2] >= 0) {
                drawPoint(k);
            }
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
        addImageSphere(0, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], mappingCenterZ[i]);
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
                addImageSphere(generation, i, newRadius, newCenterX, newCenterY, newCenterZ);
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

// rotating

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

function rotate(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing[0];
        const y = thing[1];
        const z = thing[2];
        thing[0] = txx * x + txy * y + txz * z;
        thing[1] = tyx * x + tyy * y + tyz * z;
        thing[2] = tzx * x + tzy * y + tzz * z;
    }
}

function eulerRotation() {
    const newX = txx * x + txy * y + txz * z;
    const newY = tyx * x + tyy * y + tyz * z;
    z = tzx * x + tzy * y + tzz * z;
    x = newX;
    y = newY;
}

// view (transforms)

view.normal = function(things) {};

var viewCenter, viewRadius2;

view.setup = function() {
    viewCenter = hyperbolicRadius / view.interpolation / view.interpolation;
    viewRadius2 = viewCenter * viewCenter + hyperbolicRadius * hyperbolicRadius;
};

view.stereographicSpheres = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing[0];
        const y = thing[1];
        const z = thing[2];
        const radius = thing[3];
        const dz = z - viewCenter;
        const d2 = x * x + y * y + dz * dz;
        const factor = viewRadius2 / (d2 - radius * radius);
        thing[0] = factor * x;
        thing[1] = factor * y;
        // we do not change z, is not shown
        thing[3] = factor * radius;
    }
};
view.stereographicPoints = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing[0];
        const y = thing[1];
        const z = thing[2];
        const dz = z - viewCenter;
        const d2 = x * x + y * y + dz * dz;
        const factor = viewRadius2 / d2;
        thing[0] = factor * x;
        thing[1] = factor * y;
        // we do not change z, is not shown
    }
};

// sorting for top down view
function zSort(things) {
    things.sort((one, two) => one[2] - two[2]);
}