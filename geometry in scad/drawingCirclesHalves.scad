
$fn=128;
include <geometryUtils.scad>;
include <theCircles.scad>;



intersection(){
union(){

drawCircles(imageCircles,0.5);

color([0.3,0.7,0.2])drawCircles(mappingCircles,0.7);};
translate([0,0,-50])cube(size=100,center=true);
};


intersection(){
union(){


color([0.6,0.6,0.4]) drawCircles(imageCircles,0.5);

color([0.4,0.6,0.4])drawCircles(mappingCircles,0.7);};
translate([0,0,50])cube(size=100,center=true);
};

