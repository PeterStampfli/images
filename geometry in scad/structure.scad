// polar coordinates for vector v = (x, y, z)
//===========================================================
// distance between points is simply norm(a - b), length is norm(v)
// check if length has given value (within eps)
function lengthIs(v, distance, eps = 0.001) = (abs(norm(v) - distance) < eps);
// angle from the z-axis, in degrees! 
function theta(v) = atan2(norm([v[0], v[1]]), v[2]);
// projected angle in the (x,y)-plane, in degrees! 
function phi(v) = atan2(v[1], v[0]);

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
// adding the elements of an array by recursion
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
// drawing a line with a cylinder
// no joints, draw endpoints as spheres in extra step
module drawLine(a, b, weight = 1){
    v = b - a;
    translate(a)
    orient(v) 
    cylinder(h = norm(v), r = weight / 2);
}
// draw lines of a given length between points
module drawLines(points, length, weight = 1, eps = 0.001){
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

// circles: center point, normal vector, radius, weight for drawing
module drawCircle(center, radius, normal,weight=1){
    if (radius>weight){
        translate(center) orient(normal) rotate_extrude(angle = 360) translate([radius,0,0]) circle(weight);
    }
}
octagon = [[20,0,0],[0,20,0],[0,0,20],[-20,0,0],[0,-20,0],[0,0,-20]];
$fn=128;
drawCircle([20,0,0], [20,0,0],20);
drawCircle([0,20,0], [0,20,0],20);
drawCircle([0,0,20], [0,0,20],20);