/* jshint esversion: 6 */
import {
    output
} from "../libgui/modules.js";

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

mappingSpheres.add = function(radius, centerX, centerY, centerZ) {
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

mappingSpheres.setProjection = function(radius, centerX, centerY, centerZ = 0, centerW = 0) {
    const d2 = centerX * centerX + centerY * centerY + centerZ * centerZ + centerW * centerW;
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
    mappingSpheres.add(radius * Math.abs(factor), centerX * factor, centerY * factor, projectionCenter + dz * factor);
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

// for the simple 2d case, or top-down view
// draw circles for the mapping spheres (not discs)
mappingSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(mappingSpheres.lineWidth);
    canvasContext.strokeStyle = mappingSpheres.color;
    const length = mappingRadius.length;
    for (var i = 0; i < length; i++) {
        canvasContext.beginPath();
        canvasContext.arc(mappingCenterX[i], mappingCenterY[i], mappingRadius[i], 0, 2 * Math.PI);
        canvasContext.stroke();
    }
};

// creating mapping spheres configurations
//==============================================================
mappingSpheres.two = function() {
    mappingSpheres.add(1, 1, 0, 0);
    mappingSpheres.add(1, -1, 0, 0);
};

mappingSpheres.triangle = function() {
    mappingSpheres.add(rt3 / 2, 1, 0, 0);
    mappingSpheres.add(rt3 / 2, -0.5, rt3 / 2, 0);
    mappingSpheres.add(rt3 / 2, -0.5, -rt3 / 2, 0);
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

imageSpheres.draw2dCircles = function() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(imageSpheres.lineWidth);
    canvasContext.strokeStyle = imageSpheres.stroke;
    canvasContext.fillStyle = imageSpheres.fill;
    const length = imageRadius.length;
    const drawGeneration = Math.min(imageSpheres.drawGeneration, mappingSpheres.minGeneration);
    imageSpheres.drawGenController.setValueOnly(drawGeneration);
    for (var i = 0; i < length; i++) {
        if (imageGeneration[i] === drawGeneration) {
            canvasContext.beginPath();
            canvasContext.arc(imageCenterX[i], imageCenterY[i], imageRadius[i], 0, 2 * Math.PI);
            canvasContext.fill();
            canvasContext.stroke();
        }
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

imagePoints.drawDots = function() {
    const radius = 0.5 * imagePoints.size;
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = imagePoints.color;
    for (var i = 0; i < imagePointX.length; i++) {
        canvasContext.beginPath();
        canvasContext.arc(imagePointX[i], imagePointY[i], radius, 0, 2 * Math.PI);
        canvasContext.fill();
    }
};

// creating the images
//===================================

var maxGeneration, minGeneration, minimumRadius, mappingLength;

// using images of the mapping spheress

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
            // do always at least the minimum generation independent of radius, save these image spheres
            // do up to maximum generation if radius not small enough
            // maximum generation is safeguard
            // minimum generation is for making images
            if ((generation < minGeneration) || ((generation < maxGeneration) && (newRadius > minimumRadius))) {
                imageOfSphere(generation, i, newRadius, newCenterX, newCenterY, newCenterZ);
            }
            if (generation <= minGeneration) {
                imageGeneration.push(generation);
                imageRadius.push(newRadius);
                imageCenterX.push(newCenterX);
                imageCenterY.push(newCenterY);
                imageCenterZ.push(newCenterZ);
            } else if ((newRadius < minimumRadius) || (generation === maxGeneration)) {
                imagePointX.push(newCenterX);
                imagePointY.push(newCenterY);
                imagePointZ.push(newCenterZ);
            }
        }
    }
}

// making the limit set from points where the spheres touch

mappingSpheres.createImagePoints = function() {
    const eps = 0.01;
    clearImagePoints();
    clearMapping();
    mappingSpheres.config();
    mappingLength = mappingRadius.length;
    for (let i = 1; i < mappingLength; i++) {
        const radiusI = mappingRadius[i];
        const centerXI = mappingCenterX[i];
        const centerYI = mappingCenterY[i];
        for (let j = 0; j < i; j++) {
            // check if spheres touch
            const dx = mappingCenterX[j] - centerXI;
            const dy = mappingCenterY[j] - centerYI;
            const d2 = dx * dx + dy * dy;
            const radiusJ = mappingRadius[j];
            if (Math.abs(d2 - (radiusI + radiusJ) * (radiusI + radiusJ)) < eps) {
                const d = Math.sqrt(d2);
                const h = 0.5 * (radiusI + d - radiusJ) / d;
                const pointX = centerXI + h * dx;
                const pointY = centerYI + h * dy;
                imagePointX.push(pointX);
                imagePointY.push(pointY);
                for (let k = 0; k < mappingLength; k++) {
                    if ((i !== k) && (j !== k)) {
                        console.log(i, j, k);
                        const centerXK = mappingCenterX[k];
                        const centerYK = mappingCenterY[k];
                        const dx = pointX - centerXK;
                        const dy = pointY - centerYK;
                        const d2 = dx * dx + dy * dy;
                        const radiusK = mappingRadius[k];
                        const factor = radiusK * radiusK / d2;
                        const newPointX = centerXK + factor * dx;
                        const newPointY = centerYK + factor * dy;
                        imagePointX.push(newPointX);
                        imagePointY.push(newPointY);

                    }

                }
            }


        }
    }

};