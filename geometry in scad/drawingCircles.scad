
$fn=128;
include <geometryUtils.scad>;
include <theCircles.scad>;




orient([1,0.3,0.2])drawCircles(imageCircles,0.55);

//color([0.3,0.7,0.2])drawCircles(mappingCircles,0.7);
color("red") translate([-400,-200,-200])cube(400);