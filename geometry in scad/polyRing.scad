// polar coordinates for vector v = (x, y, z)
//===========================================================
// distance between points is simply norm(a - b), length is norm(v)
// check if length has given value (within eps)
function lengthIs(v, distance, eps = 0.001) = (abs(norm(v) - distance) < eps);

// angle from the z-axis, in degrees! 
function theta(v) = atan2(norm([v[0], v[1]]), v[2]);

// projected angle in the (x,y)-plane, in degrees! 
function phi(v) = atan2(v[1], v[0]);

// mapping vectors
//=========================================
// inverting the z-coordinate, mirror at xy-plane
function mirrorZ(v) = [v[0], v[1], -v[2]];

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

// general utilities
//=======================================
// making the sum of the elements of an array by recursion
function addArray(array, i=0, r=0) = (i<len(array)) ? add(array, i+1, r+array[i]) : r;

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

// drawing a line of variable Thickness with a cylinder
// no joints, draw endpoints as spheres in extra step
module drawVariableLine(a, b, da = 1, db = 1){
    v = b - a;
    translate(a)
    orient(v) 
    cylinder(h = norm(v), d1 = da, d2 = db);
}

$fn=68;

nPoints=400;
nTurns=3;
scale=20;

d=0.1;

for (i = [0 : nPoints]){
    angle1 = i * nTurns * 360/nPoints;

    ex1=cos(angle1);
    ey1=sin(angle1);
    angle2 = (i+1) * nTurns *360/nPoints;

    ex2=cos(angle2);
    ey2=sin(angle2);
    f=7200;

p1=[scale*ex1*(1+d*cos(i*f/nPoints)),scale*ey1*(1+d*cos(i*f/nPoints)),scale*d*sin(i*f/nPoints)];
p2=[scale*ex2*(1+d*cos((i+1)*f/nPoints)),scale*ey2*(1+d*cos((i+1)*f/nPoints)),scale*d*sin((i+1)*f/nPoints)];

    drawVariableLine(p1,p2);
};