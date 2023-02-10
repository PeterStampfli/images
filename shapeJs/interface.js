//=================================================simplified creation
// using global var scale


// make a scaled 3d vector from an array of coordinates 
function makeV3D(v){
	return new Vector3d(scale*v[0],scale*v[1],scale*v[2]);
}
// make a point from scaled center, with absolute weight (as radius)
function makePoint(center,weight){
	return new Sphere(makeV3D(center),weight);
}
// make a line from scaled a to b, with absolute weight (radius)
function makeLine(a,b,weight){
	return new Cylinder(makeV3D(a),makeV3D(b),weight);
}
// make a circle with scaled center, scaled radius, orientation, weight
function makeCircle(center, radius, orientation, weight) {
    var centerPoint = makeV3D(orientation);
    var torus = new Torus(centerPoint, scale*radius, weight);
    var nx=orientation[0];
    var ny=orientation[1];
    var nz=orientation[2];
    var nxy = Math.sqrt(nx * nx + ny * ny);
    var angle = Math.atan2(nxy, nz);
    var rotate = new Rotation(new Vector3d(-ny, nx, 0), angle, centerPoint);
    torus.setTransform(rotate);
    return torus;
}

//==========================================================================

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
    weight = 10 * MM;
    var blend = 1 * MM;

    all = new Union();
    all.setBlend(blend);

    all.add(makePoint([0,0,0],weight));

    return all;
}


function main(args) {

	all=tetrahedron();
    
    return new Scene(all, new Bounds(-size, size, -size, size, -size, size));
}