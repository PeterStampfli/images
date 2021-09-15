/* jshint esversion: 6 */

import {
    draw,
    poincare,
    view,
    color,
    ui
} from './modules.js';

export const mapping = {};

mapping.color = '#666666';
mapping.spheres = [];
mapping.on = [true, true, true, true, true];

mapping.doGenerations = 5;
mapping.drawGeneration =2;

// initialize: clear spheres and using a sample mapping sphere
// determine hyperbolic radius and projection from 4d to 3d
var stereographicRadius, stereographicRadius2, stereographicCenter;

function initialize(radius, x, y, z, w = 0) {
    mapping.spheres.length = 0;
    const d2 = x * x + y * y + z * z + w * w;
    const hyperbolicRadius = Math.sqrt(d2 - radius * radius);
    poincare.radius = hyperbolicRadius;
    stereographicCenter = hyperbolicRadius;
    stereographicRadius = Math.sqrt(2) * hyperbolicRadius;
    stereographicRadius2 = stereographicRadius * stereographicRadius;
}

// adding a mapping sphere with all fields (for completeness)
function add(radius, x, y, z = 0) {
    const mappingSphere = {};
    mappingSphere.radius = radius;
    mappingSphere.radius2 = radius * radius;
    mappingSphere.x = x;
    mappingSphere.y = y;
    mappingSphere.z = z;
    // only one view transform (interpolated stereographic)
    mappingSphere.viewRadius = radius;
    mappingSphere.viewX = x;
    mappingSphere.viewY = y;
    mappingSphere.viewZ = z;
    // image spheres and lines, stored in generations
    mappingSphere.imageSpheres = [];
    // generation number 1 is initial configuration and has index 1
    // generation 0 is empty
    mappingSphere.imageSpheres.length = mapping.doGenerations + 1;
    mappingSphere.imageSpheres[0] = [];
    mappingSphere.lines = [];
    mappingSphere.lines.length = mapping.doGenerations + 1;
    mappingSphere.lines[0] = [];
    const index = mapping.spheres.length;
    mappingSphere.on = (index < mapping.on.length) ? mapping.on[index] : true;
    mapping.spheres.push(mappingSphere);
}

// typically 4d spheres on a 4d sphere, defining a 4d hyperbolic space
// projecting to 3d space, for calculating the structure of the surface of the hyperbolic space
function add4dto3d(radius, x, y, z, w) {
    const dw = w - stereographicCenter;
    const d2 = x * x + y * y + z * z + dw * dw;
    const factor = stereographicRadius2 / (d2 - radius * radius);
    if (factor < 0) {
        console.error('mapping.add4dto3d: Circle at "north pole" projects with negative radius:');
        console.log('radius, x, y, z, w', radius, x, y, z, w);
    } else {
        add(radius, x * factor, y * factor, z * factor);
    }
}

mapping.logSpheres = function() {
    const length = mapping.spheres.length;
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < length; i++) {
        const sphere = mapping.spheres[i];
        console.log(i, sphere.radius, sphere.x, sphere.y, sphere.z);
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
    initialize(rSphere, 0, 0, 1);
    add(rSphere, 0, 0, -1);
    add(rSphere, cx2, 0, cz234);
    add(rSphere, cx34, cy3, cz234);
    add(rSphere, cx34, cy4, cz234);
};

mapping.config=mapping.tetrahedron;

// create the image spheres
//===========================================

mapping.initializeImageSpheres = function() {
    const length = mapping.spheres.length;
    for (let i = 0; i < length; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const imageSphere = {};
            imageSphere.x = mappingSphere.x;
            imageSphere.y = mappingSphere.y;
            imageSphere.z = mappingSphere.z;
            imageSphere.radius = mappingSphere.radius;
            imageSphere.viewX = mappingSphere.x;
            imageSphere.viewY = mappingSphere.y;
            imageSphere.viewZ = mappingSphere.z;
            imageSphere.viewRadius = mappingSphere.radius;
            imageSphere.nextGeneration = [];
            // has references to its next generation images
            imageSphere.nextGeneration.length = length;
            // the first generation is simply made of the mapping sphere
            mappingSphere.imageSpheres[1] = [imageSphere];
        }
    }
};


mapping.makeImageSphereGeneration = function(generation) {
    const mappingSpheresLength = mapping.spheres.length;
    for (let i = 0; i < mappingSpheresLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            // make the image sspheres of this mapping sphere for the given generation
            const mapX = mappingSphere.x;
            const mapY = mappingSphere.y;
            const mapZ = mappingSphere.z;
            const mapRadius2 = mappingSphere.radius2;
            const mappedImageSpheres = [];
            mappingSphere.imageSpheres[generation] = mappedImageSpheres;
            for (let j = 0; j < mappingSpheresLength; j++) {
                if (i === j) {
                    continue;
                }
                const otherMappingSphere = mapping.spheres[j];
                if (otherMappingSphere.on) {
                    // map image spheres of the other mapping sphere
                    const oldImageSpheres = otherMappingSphere.imageSpheres[generation - 1];
                    const oldImageSpheresLength = oldImageSpheres.length;
                    for (let k = 0; k < oldImageSpheresLength; k++) {
                        //map the sphere and make a new image sphere
                        const oldImageSphere = oldImageSpheres[k];
                        const mappedImageSphere = {};
                        mappedImageSpheres.push(mappedImageSphere);
                        oldImageSphere.nextGeneration[k] = mappedImageSphere;
                        mappedImageSphere.nextGeneration = [];
                        // has references to its next generation images
                        mappedImageSphere.nextGeneration.length = mappingSpheresLength;
                        const radius = oldImageSphere.radius;
                        const dx = oldImageSphere.x - mapX;
                        const dy = oldImageSphere.y - mapY;
                        const dz = oldImageSphere.z - mapZ;
                        const factor = mapRadius2 / (dx * dx + dy * dy + dz * dz - radius * radius);
                        mappedImageSphere.radius = factor * radius;
                        mappedImageSphere.x = mapX + factor * dx;
                        mappedImageSphere.y = mapY + factor * dy;
                        mappedImageSphere.z = mapZ + factor * dz;
                    }
                }
            }
        }
    }
};

mapping.generate = function() {
    mapping.initializeImageSpheres();
    for (let generation = 2; generation <= mapping.doGenerations; generation++) {
        mapping.makeImageSphereGeneration(generation);
    }
};

// view transform and drawing spheres
//=========================================================

mapping.viewTransform = function() {
    view.transform(mapping.spheres);
    const length = mapping.spheres.length;
    for (let i = 0; i < length; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on){
        const imageSpheres = mappingSphere.imageSpheres;
        const imageSpheresLength = imageSpheres.length;
        // 0 is empty
        for (let j = 1; j < imageSpheresLength; j++) {
            view.transform(imageSpheres[j]);
        }
    }
    }
};

mapping.checkDrawGeneration=function(){
if (mapping.drawGeneration>mapping.doGenerations){
    ui.drawGenerationController.setValueOnly(mapping.doGenerations);
}
};

mapping.drawSpheres = function() {
    mapping.spheres.forEach(sphere => draw.sphere(sphere.viewX, sphere.viewY, sphere.viewRadius, mapping.color));
};

mapping.drawDiscs = function() {
    mapping.spheres.forEach(sphere => draw.disc(sphere.viewX, sphere.viewY, sphere.viewRadius, mapping.color));
};

// draw image spheres as given by mapping.drawGeneration (=>ui)
mapping.drawImageSpheres = function() {
    const mappingSpheresLength = mapping.spheres.length;
    for (let i = 0; i < mappingSpheresLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on){
        const imageSpheres = mappingSphere.imageSpheres[mapping.drawGeneration];
        const imageSpheresLength = imageSpheres.length;
        // 0 is empty
        for (let j = 0; j < imageSpheresLength; j++) {
            const imageSphere = imageSpheres[j];
            const sphereColor = color.interpolation(imageSphere.viewZ);
            draw.sphere(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, sphereColor);
        }
    }
    }
};