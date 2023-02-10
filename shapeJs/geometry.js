//  basic geometry - independent of shape.js

// polar coordinates
// cartesian vector from polar coordinates
function fromPolar(radius, phi, theta) {
    var rSinTheta = radius * Math.sin(theta);
    return [rSinTheta * Math.cos(phi), rSinTheta * Math.sin(phi), radius * Math.cos(theta)];
}

// calculate radius of a vector
function radiusOf(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}
// phi, safe if vector is parallel to z-axis
function phiOf(v) {
    var vx = v[0];
    var vy = v[1];
    if (vx * vx + vy * vy < 0.001) {
        return 0;
    } else {
        return Math.atan2(vy, vx);
    }
}

// theta, theta=0 is north pole, z=r*cos(theta)
function thetaOf(v) {
    var vx = v[0];
    var vy = v[1];
    return Math.atan2(Math.sqrt(vx * vx + vy * vy), v[2]);
}

// normalize a vector
function normalize(v) {
    var norm = radiusOf(v);
    v[0] /= norm;
    v[1] /= norm;
    v[2] /= norm;
}
// average of an array of vectors(arrays of components)
function averageOf(vectors) {
    var length = vectors.length;
    var x = 0;
    var y = 0;
    var z = 0;
    for (var i = 0; i < length; i++) {
        var v = vectors[i];
        x += v[0];
        y += v[1];
        z += v[2];
    }
    return [x / length, y / length, z / length];
}

// rotate a vector (array of 3 components), 
// such that a given normalized direction vector is rotated to the z-axis
// returns rotated vector, original vector is not changed
function rotateToZ(vector, direction) {
    var dx = direction[0];
    var dy = direction[1];
    var dz = direction[2];
    var dxy = Math.sqrt(dx * dx + dy * dy);
    var vx = vector[0];
    var vy = vector[1];
    var vz = vector[2];
    if (dxy < 0.01) {
        return [dz * vx, vy, dz * vz];
    } else {
        // rotate in the xy-plane to the xz-plane
        // cos(phi)=dx/dxy, sin(phi)=dy/dxy
        dx /= dxy;
        dy /= dxy;
        var h = dx * vx + dy * vy;
        vy = -dy * vx + dx * vy;
        vx = h;
        // rotate in the xz-plane to z
        // cos(theta)=dz, sin(theta)=dxy
        h = dz * vz + dxy * vx;
        vx = -dxy * vz + dz * vx;
        vz = h;
        return [vx, vy, vz];
    }
}

// inverse: rotate a vector (array of 3 components), 
// such that the z-axis is rotated to given normalized direction vector
// returns rotated vector, original vector is not changed
function rotateFromZ(vector, direction) {
    var dx = direction[0];
    var dy = direction[1];
    var dz = direction[2];
    var dxy = Math.sqrt(dx * dx + dy * dy);
    var vx = vector[0];
    var vy = vector[1];
    var vz = vector[2];
    if (dxy < 0.01) {
        return [dz * vx, vy, dz * vz];
    } else {
        // rotate in the xz-plane to z
        // cos(theta)=dz, sin(theta)=dxy
        var h = dz * vz - dxy * vx;
        vx = dxy * vz + dz * vx;
        vz = h;
        // rotate in the xy-plane to the xz-plane
        // cos(phi)=dx/dxy, sin(phi)=dy/dxy
        dx /= dxy;
        dy /= dxy;
        h = dx * vx - dy * vy;
        vy = dy * vx + dx * vy;
        vx = h;
        return [vx, vy, vz];
    }
}

// calculate normal vector to a plane defined  by three points (arrays of 3 vector components)
// counterclockwise abc with respecct to normal
function normalToPlane(a, b, c) {
    var dbx = b[0] - a[0];
    var dby = b[1] - a[1];
    var dbz = b[2] - a[2];
    var dcx = c[0] - a[0];
    var dcy = c[1] - a[1];
    var dcz = c[2] - a[2];
    return [dby * dcz - dbz * dcy, dbz * dcx - dbx * dcz, dbx * dcy - dby * dcx];
}
//=================================================simplified creation
// using global var scale

// make a scaled 3d vector from an array of coordinates 
function makeV3D(v) {
    return new Vector3d(scale * v[0], scale * v[1], scale * v[2]);
}
// make a point from scaled center, with absolute weight (as radius)
function makePoint(center, weight) {
    return new Sphere(makeV3D(center), weight);
}
// make a line from scaled a to b, with absolute weight (radius)
function makeLine(a, b, weight) {
    return new Cylinder(makeV3D(a), makeV3D(b), weight);
}
// make a circle with scaled center, scaled radius, orientation, weight
function makeCircle(center, radius, orientation, weight) {
    var centerPoint = makeV3D(orientation);
    var torus = new Torus(centerPoint, scale * radius, weight);
    var nx = orientation[0];
    var ny = orientation[1];
    var nz = orientation[2];
    var nxy = Math.sqrt(nx * nx + ny * ny);
    var angle = Math.atan2(nxy, nz);
    var rotate = new Rotation(new Vector3d(-ny, nx, 0), angle, centerPoint);
    torus.setTransform(rotate);
    return torus;
}

// make a piece of a great circle (centered at origin) on unit sphere
// connecting two given points a and b, across the short path
// angle step size is limited
// weight is diameter of lines
// adds arc to arcs (union)
function greatArc(a, b, maxAngleStep, weight, arcs) {
    // determine the normal vector and rotate to z-axis
    var normal = normalToPlane([0, 0, 0], a, b);
    normalize(normal);
    var aRot = rotateToZ(a, normal);
    var bRot = rotateToZ(b, normal);
    // points will be in the xy-plane, z=0
    var phiA = Math.atan2(aRot[1], aRot[0]);
    var phiB = Math.atan2(bRot[1], bRot[0]);
    // going from phiA to phiB, increasing angle values
    // correct order
    var h;
    if (phiA > phiB) {
        h = phiA;
        phiA = phiB;
        phiB = h;
    }
    // change path
    if (phiB - phiA > Math.PI) {
        h = phiA + 2 * Math.PI;
        phiA = phiB;
        phiB = h;
    }
    var nSteps = Math.floor((phiB - phiA) / maxAngleStep) + 1;
    var dAngle = (phiB - phiA) / nSteps;
    var angle = phiA;
    var last = a;
    arcs.add(makePoint(a, weight));
    for (var i = 0; i < nSteps; i++) {
        angle += dAngle;
        var next = rotateFromZ([Math.cos(angle), Math.sin(angle), 0], normal);
        arcs.add(makePoint(next, weight));
        arcs.add(makeLine(last, next, weight));
        last = next;
    }
}

// make archimedean spiral on a unit sphere
// corresponding to the side of a polyhedron, given by corners
// going from the midpoints of the side to the center, projected onto the sphere
// adds to spirals
function archimedean(vectors, nTurns, nSteps,weight,spirals) {
    var i;
    var deltaPhi = 2 * Math.PI * nTurns;
    var dPhi = deltaPhi / nSteps;
    var normal = averageOf(vectors);
    normalize(normal);
    var nPoints = vectors.length;
    var lastCorner = vectors[nPoints - 1];
    // calculate midpoints, rotate, make spiral
    spirals.add(makePoint(normal,weight));
    for (i = 0; i < nPoints; i++) {
        var nextCorner = vectors[i];
        var midPoint = averageOf([lastCorner, nextCorner]);
        normalize(midPoint);
        lastCorner = nextCorner;
        midPoint = rotateToZ(midPoint, normal);
        var phiEnd = phiOf(midPoint);
        var phiStart = phiEnd - deltaPhi;
        var thetaEnd = thetaOf(midPoint);
        var dTheta = thetaEnd / nSteps;
        var a = normal;
        for (j = 1; j <= nSteps; j++) {
            var b = fromPolar(1, phiStart + j * dPhi, j * dTheta);
            b = rotateFromZ(b, normal);
    spirals.add(makePoint(b,weight));
    spirals.add(makeLine(a,b,weight));
            a = b;
        }
    }
}

// make the 3d tetrahedron
// sets parameters
// returns all...

var scale, size;

function tetrahedron() {
    var rt32 = Math.sqrt(3) / 2;
    var r3 = 2 / 3 * Math.sqrt(2);
    var corners = [
        [0, 0, -1],
        [r3, 0, 1 / 3],
        [-r3 / 2, rt32 * r3, 1 / 3],
        [-r3 / 2, -rt32 * r3, 1 / 3]
    ];
    scale = 80 * MM;
    size = 1.1 * scale;
    weight = 1 * MM;
    var blend = 1 * MM;

    all = new Union();
  //  all.setBlend(blend);
    maxAngleStep = 0.1;
    nSteps=30;
    nTurns=2;
    greatArc(corners[0], corners[1], maxAngleStep, weight, all);
    greatArc(corners[0], corners[2], maxAngleStep, weight, all);
    greatArc(corners[0], corners[3], maxAngleStep, weight, all);
    greatArc(corners[1], corners[2], maxAngleStep, weight, all);
    greatArc(corners[1], corners[3], maxAngleStep, weight, all);
    greatArc(corners[2], corners[3], maxAngleStep, weight, all);
    archimedean([corners[0],corners[1],corners[2]],nTurns,nSteps,weight,all);
    archimedean([corners[0],corners[1],corners[3]],nTurns,nSteps,weight,all);
    archimedean([corners[0],corners[2],corners[3]],nTurns,nSteps,weight,all);
    archimedean([corners[1],corners[2],corners[3]],nTurns,nSteps,weight,all);

    return all;
}


function main(args) {

    all = tetrahedron();

    return new Scene(all, new Bounds(-size, size, -size, size, -size, size));
}