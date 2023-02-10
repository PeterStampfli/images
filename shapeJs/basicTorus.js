// function for oriented torus acting as a circle
// and test
// uses millimeter as unit, converts to meter

function orientedTorus(cx, cy, cz, radius, weight, nx, ny, nz) {
    var center = new Vector3d(cx * MM, cy * MM, cz * MM);
    var torus = new Torus(center, radius * MM, weight * MM);
    var nxy = Math.sqrt(nx * nx + ny * ny);
    var angle = Math.atan2(nxy, nz);
    var rotate = new Rotation(new Vector3d(-ny, nx, 0), angle, center);
    torus.setTransform(rotate);
    return torus;
}

function main(args) {
    var nx = 5;
    var ny = 10;
    var nz = 10;
    var cx = 0;
    var cy = 0;
    var cz = 0;
    var radius = 10;
    var torus = orientedTorus(cx, cy, cz, radius, 1, nx, ny, nz);
    var from = new Vector3d(cx * MM, cy * MM, cz * MM);
    var to = new Vector3d((cx + nx) * MM, (cy + ny) * MM, (cz + nz) * MM);
    var cylinder = new Cylinder(from, to, MM);
    var all = new Union();
    all.add(cylinder);
    all.add(torus);
    var s = 15 * MM;
    return new Scene(all, new Bounds(-s, s, -s, s, -s, s));
}