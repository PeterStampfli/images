// parameters
var scale = 20 * MM;

// basic objects
var origin = new Vector3d(0, 0, 0);

var all = new Union();

// make a rotation at origin, for given direction
// rotates z-axis to the direction
function rotationFromZAxisTo(dx, dy, dz) {
    var norm = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= norm;
    dy /= norm;
    dz /= norm;
    var dxy = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dxy, dz);
    if (dxy < 0.02) {
        angle = 0;
        dy = 1;
        dx = 0;
    }
    return new Rotation(new Vector3d(-dy, dx, 0), angle);
}

// normalize a vector
function normalize(direction){
	    var norm = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1] + direction[0] * direction[0]);

}

// rotate a vector (array of 3 components), such that a given normalized direction vector is rotated to the z-axis
// returns rotated vector, original vector is not changed
function rotateToZ(vector,direction){
	var dx=direction[0];
	var dy=direction[1];
	var dz=direction[2];
    var norm = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= norm;
    dy /= norm;
    dz /= norm;
    var dxy = Math.sqrt(dx * dx + dy * dy);
    var vx=vector[0];
    var vy=vector[1];
    var vz=vector[2];
    if (dxy<0.01){
return [];
    } else {
    return [];	
    }
}


function main(args) {
    var torus = new Torus(origin, scale, MM);
    var rotation = rotationFromZAxisTo(0, 0, 0, 10, 10, 0);
  //  torus.setTransform(rotation);
    all.add(torus);
    var dx=1;
    var dy=1;
    var dz=1;

    var cylinder=new Cylinder(origin,new Vector3d(dx*scale,dy*scale,dz*scale),MM)
    cylinder.setTransform(rotationToZAxis(0,0,0,dx,dy,dz));
    all.add(cylinder);

    var s = 1 * scale;
    return new Scene(all, new Bounds(-s, s, -s, s, -s, s));
}