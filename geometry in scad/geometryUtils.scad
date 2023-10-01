// polar coordinates for vector v = (x, y, z)
//===========================================================
// distance between points is simply norm(a - b), length is norm(v)
// check if length has given value (within eps)
function lengthIs(v, distance, eps = 0.001) = (abs(norm(v) - distance) < eps);

// angle from the z-axis, in degrees! 
function theta(v) = atan2(norm([v[0], v[1]]), v[2]);

// projected angle in the (x,y)-plane, in degrees! 
function phi(v) = atan2(v[1], v[0]);

// point in polar coordinates to cartesian
function fromPolar(radius,theta,phi)=radius*[sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta)];


// mapping vectors
//=========================================
// inverting the z-coordinate, mirror at xy-plane
function mirrorZ(v) = [v[0], v[1], -v[2]];

// normalize a vector
function normalize(v) = v / norm(v);

// normalize an array of vectors
function normalizeVectors(vectors)=[for (v=vectors) normalize(v)];

// rotating the positive z-axis to a given vector
// orient a given planar object in the (x,y) plane, 
// or an elongated object parallel to the z-axis according to a given vector v 
// a planar object will be perpendicular to v, an elongated object perpendicular
// multiple objects possible
// orient(v) thing1;
// orient(v) {thing1;thing2;}
module orient(v){
    rotate([0, theta(v), phi(v)]) children();
}

// inverse: rotating a given vector to the z-axis
// use for making a plane parallel to the (x,y) plane, the vector is the normal vector
module rotateToZ(v){
    rotate([0, - theta(v), 0]) rotate([0, 0, - phi(v)]) children();
}

// rotate an array of vectors, given a (normal) vector that is rotated to the z-axis
// all other points do the same rotation
// the normal vector has to be normalized
function rotateToZVectors1(nx, ny, nz, nxy, vectors) = [for (v = vectors) nxy > 0.001? [nz/nxy*(nx*v[0]+ny*v[1])-nxy*v[2],(-ny*v[0]+nx*v[1])/nxy,nx*v[0]+ny*v[1]+nz*v[2]] : [nz * v[0], v[1], nz * v[2]]];

function rotateToZVectors(n, vectors) = rotateToZVectors1(n[0], n[1], n[2], sqrt(n[0]*n[0] + n[1]*n[1]), vectors);

// general utilities
//=======================================
// making the sum of the elements of an array by recursion
// if not scalar indicate the result type (give explicit initial null result)
function sumArray(array, r=0, i=0) = (i<len(array)) ? sumArray(array, r+array[i], i+1) : r;

// an array of points
//==========================================
// scaling an array of points: simply scale * points
// determine distance between two points of an array of points
function distanceOf(points, i = 0, j = 1) = norm(points[i] - points[j]);

// check if distance between two points of an array has given value
function distanceIs(points, i, j, distance, eps = 0.001) = lengthIs(points[i] - points[j], distance, eps);

// select some points from an array, using a second array of indices
function selection(points,indices) = [for(index = indices) points[index]];

// drawing points
//============================
// draw a point at [x,y,z] as a sphere with parameter weight as diameter
module drawPoint(point, weight = 1){
    translate(point) sphere(d = weight);
}

// draw an array of points as spheres of diameter weight
module drawPoints(points, weight = 1){
    for (point = points){
        drawPoint(point, weight);
    }
}

// drawing endpoints of a line 
module drawEndpoints(a, b, weight = 1){
    drawPoint(a, weight);
    drawPoint(b, weight);
}

// drawing a line with a cylinder
// no joints, draw endpoints as spheres in extra step
module drawLine(a, b, weight = 1){
    v = b - a;
    translate(a)
    orient(v) 
    cylinder(h = norm(v), r = weight / 2);
}

// draw all lines of a given length between points
module drawAllLines(points, length, weight = 1, eps = 0.001){
    for (i = [0 : len(points)-2]){
        pointI = points[i];
        for (j = [i + 1 : len(points)-1]){
            pointJ = points[j];
            if (lengthIs(pointI - pointJ,length)){
                drawLine(pointI, pointJ, weight);
            }
        }
    }
}

// draw lines between pairs of points
module drawLines(points, weight = 1){
    stop=len(points)-2;
    for (i = [0 : stop : 2]){
        pointI = points[i];
        pointJ = points[i+1];
        drawLine(pointI, pointJ, weight);
    }
}

// circles: center point, radius>0, normal vector, weight for drawing
// lines: endpointa, "radius"<0, endpointB
module drawCircle(center, radius, normal,weight=1){
    if (radius<0){
        drawLine(center, normal,2*weight);
    }
    if (radius>weight){
        translate(center) orient(normal) rotate_extrude(angle = 360) translate([radius,0,0]) circle(weight);
    }
}

// drawing circles, stored in an array
// each circle is an array, elements are center vector, radius, normal vector
module drawCircles(theCircles,weight=1){
    for (i=[0:len(theCircles)-1]){
        circleI=theCircles[i];
        drawCircle(circleI[0],circleI[1],circleI[2],weight);
    }
}
