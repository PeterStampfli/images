/* jshint esversion: 6 */

import {
	draw,
	poincare
} from './modules.js';

export const mappingSpheres={};

mappingSpheres.color='#444444';

mappingSpheres.collection=[];

mappingSpheres.on = [true, true, true, true, true];


// initialize: clear collection and using a sample mapping sphere
// determine hyperbolic radius and projection from 4d to 3d
var stereographicRadius, stereographicRadius2, stereographicCenter;

function initialize(radius, x, y, z, w = 0){
	mappingSpheres.collection.length=0;
    const d2 = x * x + y * y + z * z + w * w;
    const hyperbolicRadius = Math.sqrt(d2 - radius * radius);
   poincare.radius = hyperbolicRadius;
    stereographicCenter = hyperbolicRadius;
    stereographicRadius = Math.sqrt(2) * hyperbolicRadius;
    stereographicRadius2 = stereographicRadius * stereographicRadius;
}

function add(radius, x, y, z = 0) {
    const mappingSphere = {};
    mappingSphere.radius = radius;
    mappingSphere.radius2 = radius * radius;
    mappingSphere.x = x;
    mappingSphere.y = y;
    mappingSphere.z = z;
    const index = mappingSpheres.collection.length;
     mappingSphere.on = (index < mappingSpheres.on.length) ? mappingSpheres.on[index] : true;
    mappingSpheres.collection.push(mappingSphere);
}

// typically 4d spheres on a 4d sphere, defining a 4d hyperbolic space
// projecting to 3d space, for calculating the structure of the surface of the hyperbolic space
function add4dto3d(radius, x, y, z, w) {
    const dw = w - stereographicCenter;
    const d2 = x * x + y * y + z * z + dw * dw;
    const factor = stereographicRadius2 / (d2 - radius * radius);
    if (factor < 0) {
        console.error('mappingSpheres.add4dto3d: Circle at "north pole" projects with negative radius:');
        console.log('radius, x, y, z, w', radius, x, y, z, w);
    } else {
        add(radius, x * factor, y * factor, z * factor);
    }
};

mappingSpheres.log = function() {
    const length = mappingSpheres.collection.length;
    console.log("mapping spheres, index,radius,centerXYZ");
    for (var i = 0; i < length; i++) {
        const sphere = mappingSpheres.collection[i];
        console.log(i, sphere.radius, sphere.x, sphere.y, sphere.z);
    }
};


// various configurations
//============================================

mappingSpheres.tetrahedron = function() {
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