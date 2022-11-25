
include <geometryUtils.scad>;

radius = 20;
weight = 1;

// great Circle: normal vector, radius, weight for drawing
module drawGreatCircle(normal){
    if (radius>weight){
        orient(normal) rotate_extrude(angle = 360) translate([radius,0,0]) circle(weight);
    }
}

// drawing circles, stored in an array
// each circle is an array, elements are center vector, radius, normal vector
module drawGreatCircles(normals){
    for (normal=normals){
        drawGreatCircle(normal);
    }
}

octagon = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
cube=[[1,1,1],[-1,1,1],[1,-1,1],[-1,-1,1],[1,1,-1],[-1,1,-1],[1,-1,-1],[-1,-1,-1]];

color("red") drawGreatCircles(octagon);
drawGreatCircles(cube);