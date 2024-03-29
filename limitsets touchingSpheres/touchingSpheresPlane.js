/* jshint esversion: 6 */
import {
    output,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

export const mappingSpheres = {};
export const imageSpheres = {};
export const imagePoints = {};
export const switches = [];

const rt3 = Math.sqrt(3);

const colors = ['#ff0000', '#ffff00', '#00ff00', '#ff8800'];

// the mapping spheres, 2 dimensions
//==================================================================
const mappingRadius = [];
const mappingRadius2 = [];
const mappingCenterX = [];
const mappingCenterY = [];

function clearMapping() {
    mappingRadius.length = 0;
    mappingRadius2.length = 0;
    mappingCenterX.length = 0;
    mappingCenterY.length = 0;
}

mappingSpheres.add = function(radius, centerX, centerY) {
    mappingRadius.push(radius);
    mappingRadius2.push(radius * radius);
    mappingCenterX.push(centerX);
    mappingCenterY.push(centerY);
};

// add a projected mapping sphere
// stereographic projection from inversion at a projecting sphere
// from 3d to 2d and from 4d to 3d

var projectionRadius, projectionRadius2, projectionCenter;

mappingSpheres.setProjection = function(radius, centerX, centerY, centerZ) {
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ;
    const hyperbolicRadius = Math.sqrt(d2 - radius * radius);
    projectionCenter = hyperbolicRadius;
    projectionRadius = Math.sqrt(2) * hyperbolicRadius;
    projectionRadius2 = projectionRadius * projectionRadius;
};

// typically 3d spheres on a 3d sphere, defining a 3d hyperbolic space
mappingSpheres.add3dto2d = function(radius, centerX, centerY, centerZ) {
    const dz = centerZ - projectionCenter;
    const d2 = centerX * centerX + centerY * centerY + dz * dz;
    const factor = projectionRadius2 / (d2 - radius * radius);
    if (factor < 0) {
        console.error('mappingSpheres.add3dto2d: Circle at north pole projects with negative radius:');
        console.log('radius, centerX, centerY, centerZ', radius, centerX, centerY, centerZ);
    } else {
        mappingSpheres.add(radius * factor, centerX * factor, centerY * factor);
    }
};

mappingSpheres.log = function() {
    console.log("mapping spheres, index,radius,centerXY");
    for (var i = 0; i < mappingRadius.length; i++) {
        console.log(i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i]);
    }
};

// for the simple 2d case, or top-down view
// draw circles for the mapping spheres (not discs)
mappingSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = mappingSpheres.fillColor;
    const length = mappingRadius.length;
    for (var i = 0; i < length; i++) {
        canvasContext.beginPath();
        canvasContext.arc(mappingCenterX[i], mappingCenterY[i], mappingRadius[i], 0, 2 * Math.PI);
        if ((i > 3) || (switches[i])) {
            canvasContext.fill();
        }
        if (imageSpheres.useSpecialColors) {
            canvasContext.strokeStyle = colors[i & 3];
        }
        canvasContext.stroke();
    }
    canvasContext.strokeStyle = '#000000';
};

// creating mapping spheres configurations
//==============================================================
mappingSpheres.one = function() {
    mappingSpheres.add(1, 0, 0);
};

mappingSpheres.two = function() {
    mappingSpheres.add(1, 1, 0);
    mappingSpheres.add(1, -1, 0);
};

mappingSpheres.triangle = function() {
    mappingSpheres.add(rt3 / 2, 1, 0);
    mappingSpheres.add(rt3 / 2, -0.5, rt3 / 2);
    mappingSpheres.add(rt3 / 2, -0.5, -rt3 / 2);
};

mappingSpheres.tetrahedron2d = function() {
    // four inverting spheres at the corners of a tetrahedron
    const rSphere = 0.8165;
    const cx2 = 0.9428;
    const cx34 = -0.4714;
    const cy3 = 0.8165;
    const cy4 = -0.8165;
    const cz234 = 0.3333;
    // (0,0,-1),(cx2,0,cz234),(cx34,cy3,cz234),(cx34,cy4,cz234)
    mappingSpheres.setProjection(rSphere, 0, 0, 1);
    mappingSpheres.add3dto2d(rSphere, 0, 0, -1);
    mappingSpheres.add3dto2d(rSphere, cx2, 0, cz234);
    mappingSpheres.add3dto2d(rSphere, cx34, cy3, cz234);
    mappingSpheres.add3dto2d(rSphere, cx34, cy4, cz234);
};

// the resulting image spheres
//================================================================
const imageGeneration = [];
const imageRadius = [];
const imageCenterX = [];
const imageCenterY = [];
const imageOrigin = [];

function addImageSphere(generation, radius, centerX, centerY, origin) {
    imageGeneration.push(generation);
    imageRadius.push(radius);
    imageCenterX.push(centerX);
    imageCenterY.push(centerY);
    imageOrigin.push(origin);
}

function clearImageSpheres() {
    imageGeneration.length = 0;
    imageRadius.length = 0;
    imageCenterX.length = 0;
    imageCenterY.length = 0;
    imageOrigin.length = 0;
}

imageSpheres.log = function() {
    console.log("image spheres, generation,radius,centerXY");
    for (var i = 0; i < imageRadius.length; i++) {
        console.log(i, imageGeneration[i], imageRadius[i], imageCenterX[i], imageCenterY[i], imageOrigin[i]);
    }
};

imageSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = imageSpheres.fillColor;
    const length = imageRadius.length;
    const drawGeneration = Math.min(imageSpheres.drawGeneration, mappingSpheres.minGeneration);
    imageSpheres.drawGenController.setValueOnly(drawGeneration);
    for (var i = 0; i < length; i++) {
        if (imageGeneration[i] === drawGeneration) {
            canvasContext.beginPath();
            canvasContext.arc(imageCenterX[i], imageCenterY[i], imageRadius[i], 0, 2 * Math.PI);
            if (imageSpheres.useSpecialColors) {
                canvasContext.fillStyle = colors[imageOrigin[i] & 3];
            }
            canvasContext.fill();
            canvasContext.stroke();
        }
    }
};

// the resulting image points (very small spheres)
//===================================================
const imagePointX = [];
const imagePointY = [];

function clearImagePoints() {
    imagePointX.length = 0;
    imagePointY.length = 0;
}

imagePoints.log = function() {
    console.log("image points, position XYZ");
    for (var i = 0; i < imagePointX.length; i++) {
        console.log(i, imagePointX[i], imagePointY[i]);
    }
};

imagePoints.drawPixels = function() {
    const imagePointsColor = {};
    ColorInput.setObject(imagePointsColor, imageSpheres.fillColor);
    let intColor = Pixels.integerOfColor(imagePointsColor);
    output.pixels.update();
    const pixelsArray = output.pixels.array;
    const scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    const invScale = 1 / scale;
    const shiftX = output.coordinateTransform.shiftX;
    const shiftY = output.coordinateTransform.shiftY;
    // (x,y)=scale*(i,j)+(shiftX,shiftY)
    const width = output.canvas.width;
    const height = output.canvas.height;
    const pixelSize = imagePoints.pixelSize;
    const length = imagePointX.length;
    for (let k = 0; k < length; k++) {
        let i = invScale * (imagePointX[k] - shiftX);
        let j = invScale * (imagePointY[k] - shiftY);
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
        addImageSphere(1, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], i);
    }
    maxGeneration = mappingSpheres.maxGeneration;
    minGeneration = mappingSpheres.minGeneration;
    minimumRadius = mappingSpheres.minimumRadius;
    mappingLength = mappingRadius.length;
    for (let i = 0; i < mappingLength; i++) {
        if ((i > 3) || (switches[i])) {
            imageOfSphere(1, i, mappingRadius[i], mappingCenterX[i], mappingCenterY[i], i);
        }
    }
};

function imageOfSphere(generation, lastMapping, radius, centerX, centerY, origin) {
    generation += 1;
    const radius2 = radius * radius;
    for (let i = 0; i < mappingLength; i++) {
        // map only at spheres that do not contain it, and that are switched on
        if ((i !== lastMapping) && ((i > 3) || (switches[i]))) {
            const mapRadius2 = mappingRadius2[i];
            const mapX = mappingCenterX[i];
            const mapY = mappingCenterY[i];
            const dx = centerX - mapX;
            const dy = centerY - mapY;
            const d2 = dx * dx + dy * dy;
            const factor = mapRadius2 / (d2 - radius2); // touching spheres laying outside
            const newRadius = radius * Math.abs(factor); // touching surrounding spheres
            const newCenterX = mapX + dx * factor;
            const newCenterY = mapY + dy * factor;
            if (generation <= minGeneration) {
                imageGeneration.push(generation);
                imageRadius.push(newRadius);
                imageCenterX.push(newCenterX);
                imageCenterY.push(newCenterY);
                imageOrigin.push(origin);
            } else if (newRadius < minimumRadius) {
                imagePointX.push(newCenterX);
                imagePointY.push(newCenterY);
            }
            // do always at least the minimum generation independent of radius, save these image spheres
            // do up to maximum generation if radius not small enough
            // maximum generation is safeguard
            // minimum generation is for making images
            if ((generation < minGeneration) || ((generation < maxGeneration) && (newRadius > minimumRadius))) {
                imageOfSphere(generation, i, newRadius, newCenterX, newCenterY, origin);
            }
        }
    }
}