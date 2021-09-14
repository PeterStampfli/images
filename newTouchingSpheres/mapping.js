/* jshint esversion: 6 */

import {
	draw,
	poincare
} from './modules.js';

export const mapping={};

mapping.color='#666666';

mapping.spheres=[];

mapping.on = [true, true, true, true, true];


// initialize: clear spheres and using a sample mapping sphere
// determine hyperbolic radius and projection from 4d to 3d
var stereographicRadius, stereographicRadius2, stereographicCenter;

function initialize(radius, x, y, z, w = 0){
	mapping.spheres.length=0;
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
    mappingSphere.viewRadius=radius;
    mappingSphere.viewX=x;
    mappingSphere.viewY=y;
    mappingSphere.viewZ=z;
    // image spheres and lines, stored in generations
    mappingSphere.imageSpheres=[];
    mappingSphere.lines=[];
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
};

mapping.logSpheres = function() {
    const length = mapping.spheres.length;
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < length; i++) {
        const sphere = mapping.spheres[i];
        console.log(i, sphere.radius, sphere.x, sphere.y, sphere.z);
    }
};

mapping.drawSpheres=function(){
    mapping.spheres.forEach(sphere=>draw.sphere(sphere.viewX,sphere.viewY,sphere.viewRadius,mapping.color));
}

mapping.drawDiscs=function(){
    mapping.spheres.forEach(sphere=>draw.disc(sphere.viewX,sphere.viewY,sphere.viewRadius,mapping.color));
}

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