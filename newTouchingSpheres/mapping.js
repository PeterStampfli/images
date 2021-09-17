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

mapping.doGenerations = 2;
mapping.drawGeneration = 1;

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

mapping.config = mapping.tetrahedron;

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
            // index to the mapping sphere, for making images of lines
            // index is easier for debugging
            imageSphere.liesInside = i;
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
    for (let mappingSphereIndex = 0; mappingSphereIndex < mappingSpheresLength; mappingSphereIndex++) {
        const mappingSphere = mapping.spheres[mappingSphereIndex];
        if (mappingSphere.on) {
            // make the image spheres of this mapping sphere for the given generation
            const mapX = mappingSphere.x;
            const mapY = mappingSphere.y;
            const mapZ = mappingSphere.z;
            const mapRadius2 = mappingSphere.radius2;
            const mappedImageSpheres = [];
            mappingSphere.imageSpheres[generation] = mappedImageSpheres;
            for (let otherMappingSphereSphereIndex = 0; otherMappingSphereSphereIndex < mappingSpheresLength; otherMappingSphereSphereIndex++) {
                if (mappingSphereIndex === otherMappingSphereSphereIndex) {
                    continue;
                }
                const otherMappingSphere = mapping.spheres[otherMappingSphereSphereIndex];
                if (otherMappingSphere.on) {
                    // map image spheres of the other mapping sphere
                    const oldImageSpheres = otherMappingSphere.imageSpheres[generation - 1];
                    const oldImageSpheresLength = oldImageSpheres.length;
                    for (let oldImageSphereIndex = 0; oldImageSphereIndex < oldImageSpheresLength; oldImageSphereIndex++) {
                        //map the sphere and make a new image sphere
                        const oldImageSphere = oldImageSpheres[oldImageSphereIndex];
                        const mappedImageSphere = {};
                        mappedImageSpheres.push(mappedImageSphere);
                        // the original parent image sphere gets reference to its image
                        // indexed by the sphere that did the mapping
                        oldImageSphere.nextGeneration[mappingSphereIndex] = mappedImageSphere;
                        // has references to its next generation images
                        mappedImageSphere.nextGeneration = [];
                        mappedImageSphere.nextGeneration.length = mappingSpheresLength;
                        // where it is inside
                        mappedImageSphere.liesInside = mappingSphereIndex;
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

mapping.initializeLines = function() {
    const eps = 0.01;
    const mappingSpheresLength = mapping.spheres.length;
    for (let i = 0; i < mappingSpheresLength; i++) {
        const mappingSphereI = mapping.spheres[i];
        if (!mappingSphereI.on) {
            continue;
        }
        const imageSpheresI = mappingSphereI.imageSpheres[1];
        const imageSphereI = imageSpheresI[0];
        const mappingSphereILines = [];
        mappingSphereI.lines[1] = mappingSphereILines;
        const radiusI = mappingSphereI.radius;
        const xI = mappingSphereI.x;
        const yI = mappingSphereI.y;
        const zI = mappingSphereI.z;
        for (let j = 0; j < i; j++) {
            const mappingSphereJ = mapping.spheres[j];
            if (!mappingSphereJ.on) {
                continue;
            }
            const radiusJ = mappingSphereJ.radius;
            const xJ = mappingSphereJ.x;
            const yJ = mappingSphereJ.y;
            const zJ = mappingSphereJ.z;
            const dx = xJ - xI;
            const dy = yJ - yI;
            const dz = zJ - zI;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (Math.abs(d2 - (radiusI + radiusJ) * (radiusI + radiusJ)) < eps) {
                // a line connects two image spheres, we need refernces to these spheres
                // touching spheres, we get a bridging line, 
                // it belongs to the mapping sphere I the first end point
                // the second end (image sphere) belongs to the other mapping sphere
                // normal (non-bridging) lines have both ends (image spheres) in the same mapping sphere
                const imageSpheresJ = mappingSphereJ.imageSpheres[1];
                const imageSphereJ = imageSpheresJ[0];
                const line = {};
                line.end1 = imageSphereI;
                line.end2 = imageSphereJ;
                // for sorting and coloring
                line.x = 0.5 * (xI + xJ);
                line.viewX = line.x;
                line.y = 0.5 * (yI + yJ);
                line.viewY = line.y;
                line.z = 0.5 * (zI + zJ);
                line.viewZ = line.z;
                mappingSphereILines.push(line);
            }
        }
    }
};

mapping.makeLineGeneration = function(generation) {
    const mappingSpheresLength = mapping.spheres.length;
    for (let mappingSphereIndex = 0; mappingSphereIndex < mappingSpheresLength; mappingSphereIndex++) {
        const mappingSphere = mapping.spheres[mappingSphereIndex];
        if (mappingSphere.on) {
            const mappedLines = [];
            mappingSphere.lines[generation] = mappedLines;
            // make lines for this mapping sphere using the mapped image spheres
            for (let otherMappingSphereIndex = 0; otherMappingSphereIndex < mappingSpheresLength; otherMappingSphereIndex++) {
                const otherMappingSphere = mapping.spheres[otherMappingSphereIndex];
                if (otherMappingSphere.on) {
                    // mapping the line of the previous generation
                    const oldLines = otherMappingSphere.lines[generation - 1];
                    const oldLinesLength = oldLines.length;
                    for (let oldLineIndex = 0; oldLineIndex < oldLinesLength; oldLineIndex++) {
                        const oldLine = oldLines[oldLineIndex];
                        const oldEnd2 = oldLine.end2;
                        const oldEnd2LiesInside = oldEnd2.liesInside;
                        if (mappingSphereIndex === otherMappingSphereIndex) {
                            // mapping lines that belong to the mapping sphere:
                            // only those bridging to another mapping sphere
                            // the first end should be inside, the second end outside
                            // the image of the line connects the image of the second end as mapped by the mapping sphere
                            // with the first end as mapped by the other mapping sphere that contains the second end
                            console.log('same', mappingSphereIndex, 'ends', oldLine.end1.liesInside, oldEnd2LiesInside);
                            if (oldEnd2LiesInside !== mappingSphereIndex) {
                                const oldEnd1 = oldLine.end1;
                                if (oldEnd1.liesInside === mappingSphereIndex) {
                                    // a bridging line, going out from the mapping sphere
                                    console.log('bridge from to', mappingSphereIndex, oldEnd2LiesInside);
                                    const mappedLine = {};
                                    mappedLines.push(mappedLine);
                                    const mappedEnd1 = oldEnd1.nextGeneration[oldEnd2LiesInside];
                                    mappedLine.end1 = mappedEnd1;
                                    const mappedEnd2 = oldEnd2.nextGeneration[mappingSphereIndex];
                                    mappedLine.end2 = mappedEnd2;
                                    mappedLine.x = 0.5 * (mappedEnd1.x + mappedEnd2.x);
                                    mappedLine.viewX = mappedLine.x;
                                    mappedLine.y = 0.5 * (mappedEnd1.y + mappedEnd2.y);
                                    mappedLine.viewY = mappedLine.y;
                                    mappedLine.z = 0.5 * (mappedEnd1.z + mappedEnd2.z);
                                    mappedLine.viewZ = mappedLine.z;
                                } else {
                                    console.log('error end1 of old line does not lie inside mapping sphere');
                                }
                            }
                        } else {
                            // mapping lines of other mapping spheres
                            // only those that have not their second end in the mapping
                            // the first end is always inside the other mapping sphere
                            // test if second end too lies outside the mapping sphere
                            // if second end lies inside the mapping sphere, then we have a bridge that is already done
                            // the image of the line connects the two ends as mapped by the mapping sphere
                            console.log('diff map sp', mappingSphereIndex, otherMappingSphereIndex, 'ends', oldLine.end1.liesInside, oldEnd2LiesInside);
                            if (oldEnd2LiesInside !== mappingSphereIndex) {
                                console.log('line outside', mappingSphereIndex);
                                const mappedLine = {};
                                mappedLines.push(mappedLine);
                                const oldEnd1 = oldLine.end1;
                                const mappedEnd1 = oldEnd1.nextGeneration[mappingSphereIndex];
                                mappedLine.end1 = mappedEnd1;
                                const mappedEnd2 = oldEnd2.nextGeneration[mappingSphereIndex];
                                mappedLine.end2 = mappedEnd2;
                                mappedLine.x = 0.5 * (mappedEnd1.x + mappedEnd2.x);
                                mappedLine.viewX = mappedLine.x;
                                mappedLine.y = 0.5 * (mappedEnd1.y + mappedEnd2.y);
                                mappedLine.viewY = mappedLine.y;
                                mappedLine.z = 0.5 * (mappedEnd1.z + mappedEnd2.z);
                                mappedLine.viewZ = mappedLine.z;
                            } else {
                                console.log('do not repeat bridge', mappingSphereIndex, otherMappingSphereIndex);
                                if (otherMappingSphereIndex !== oldLine.end1.liesInside) {
                                    console.log("errrrrr old end1 does not lie inside the other mapping sphere");
                                }
                            }
                        }

                    }
                }
            }
        }
    }
};

mapping.generate = function() {
    mapping.initializeImageSpheres();
    mapping.initializeLines();
    for (let generation = 2; generation <= mapping.doGenerations; generation++) {
        mapping.makeImageSphereGeneration(generation);
    }
    for (let generation = 2; generation <= mapping.doGenerations; generation++) {
        mapping.makeLineGeneration(generation);
    }
};

// view transform and drawing spheres
//=========================================================

mapping.viewTransform = function() {
    view.transform(mapping.spheres);
    const length = mapping.spheres.length;
    for (let i = 0; i < length; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const imageSpheres = mappingSphere.imageSpheres;
            const imageSpheresLength = imageSpheres.length;
            // generation 0 is empty
            for (let j = 1; j < imageSpheresLength; j++) {
                view.transform(imageSpheres[j]);
            }
            const lines = mappingSphere.lines;
            const linesLength = lines.length;
            for (let j = 1; j < linesLength; j++) {
                view.transform(lines[j]);
            }
        }
    }
};

mapping.checkDrawGeneration = function() {
    if (mapping.drawGeneration > mapping.doGenerations) {
        ui.drawGenerationController.setValueOnly(mapping.doGenerations);
    }
};

mapping.drawSpheres = function() {
    mapping.spheres.forEach(sphere => draw.sphere(sphere.viewX, sphere.viewY, sphere.viewRadius, mapping.color));
};

mapping.drawDiscs = function() {
    mapping.spheres.forEach(sphere => draw.disc(sphere.viewX, sphere.viewY, sphere.viewRadius, mapping.color));
};

// draw image spheres generation given by mapping.drawGeneration (=>ui)
mapping.drawImageSpheres = function() {
    const mappingSpheresLength = mapping.spheres.length;
    for (let i = 0; i < mappingSpheresLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const imageSpheres = mappingSphere.imageSpheres[mapping.drawGeneration];
            const imageSpheresLength = imageSpheres.length;
            for (let j = 0; j < imageSpheresLength; j++) {
                const imageSphere = imageSpheres[j];
                const sphereColor = color.interpolation(imageSphere);
                draw.sphere(imageSphere.viewX, imageSphere.viewY, imageSphere.viewRadius, sphereColor);
            }
        }
    }
};

// draw lines generation given by mapping.drawGeneration (=>ui)
mapping.drawLines = function() {
    const mappingSpheresLength = mapping.spheres.length;
    for (let i = 0; i < mappingSpheresLength; i++) {
        const mappingSphere = mapping.spheres[i];
        if (mappingSphere.on) {
            const lines = mappingSphere.lines[mapping.drawGeneration];
            const linesLength = lines.length;
            console.log(mapping.drawGeneration, i, linesLength);
            for (let j = 0; j < linesLength; j++) {
                const line = lines[j];
                const end1 = line.end1;
                const end2 = line.end2;
                const lineColor = color.interpolation(line);
                draw.line(end1.viewX, end1.viewY, end2.viewX, end2.viewY, lineColor);
            }
        }
    }
};