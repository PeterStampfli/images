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

// point in polar coordinates
function fromPolar(radius,theta,phi)=radius*[sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta)];

// draw an archimedian spiral on a sphere, from theta=0 to thetaEnd,
// given final phi
// given multiplicator for phi
// given number of points
module drawArchimedian(thetaEnd,phiEnd,multPhi,nPoints,weight=1){
   drawPoint(scale*[0,0,1],weight);
   initialPhi=phiEnd-multPhi*thetaEnd; 
for (i = [0 : nPoints-1]){
    theta1 = i *thetaEnd/nPoints;
    phi1=multPhi*theta1+initialPhi;
    p1=fromPolar(scale,theta1,phi1);

    theta2 = (i+1) *thetaEnd/nPoints;
    phi2=multPhi*theta2+initialPhi;
    p2=fromPolar(scale,theta2,phi2);
    drawVariableLine(p1,p2);
    drawPoint(p2);
};
};

$fn=68;

nPoints=50;
nTurns=10;
scale=20;

d=0.1;

module cap(){
drawArchimedian(45,0,nTurns,nPoints);
drawArchimedian(45,90,nTurns,nPoints);
drawArchimedian(45,180,nTurns,nPoints);
drawArchimedian(45,270,nTurns,nPoints);
}

module one(){
orient ([1,0,0]) cap();
orient ([-1,0,0]) cap();
orient ([0,1,0]) cap();
orient ([0,-1,0]) cap();
orient ([0,0,1]) cap();
orient ([0,0,-1]) cap();
}

one();
