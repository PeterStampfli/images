// creating an image with an array of circles

var imageCircles = [
    [
        [5, 0, 0], 5, [5, 0, 0]
    ],
    [
        [-5, 0, 0], 5, [-5, 0, 0]
    ],
    [
        [0, -5, 0], 5, [0, -5, 0]
    ],
    [
        [0, 5, 0], 5, [0, 5, 0]
    ],
    [
        [0, 0, -5], 5, [0, 0, -5]
    ],
    [
        [0, 0, 5], 5, [0, 0, 5]
    ]
];

var scale = 1 * MM;

function orientedTorus(theCenter, radius, weight, normal) {
    var center = new Vector3d(theCenter[0] * scale, theCenter[1] * scale, theCenter[2] * scale);
    var torus = new Torus(center, radius * scale, weight);
    var nx = normal[0];
    var ny = normal[1];
    var nz = normal[2];
    var norm = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= norm;
    ny /= norm;
    nz /= norm;
    var nxy = Math.sqrt(nx * nx + ny * ny);
    var angle = Math.atan2(nxy, nz);
    if (nxy > 0.02) {
        var rotate = new Rotation(new Vector3d(-ny, nx, 0), angle, center);
        torus.setTransform(rotate);
    }
    return torus;
}

function main(args) {
    var weight = 1 * MM;
    var blend = 1 * MM;
    var length = imageCircles.length;
    var circle, torus;
    var all = new Union();
  //  all.setBlend(blend);
    for (var i = 0; i < length; i++) {
        circle = imageCircles[i];
        torus = orientedTorus(circle[0], circle[1], weight, circle[2]);
        all.add(torus);
    }

    var invCenter = new Vector3d(5 * scale, 5 * scale, 5 * scale);
    var inversion = new SphereInversion(invCenter, 5 * scale);
    all.setTransform(inversion);

    var inside=new Intersection(all,new Sphere(invCenter,5*scale));

    var s = 15 * MM;
    return new Scene(inside, new Bounds(-s, s, -s, s, -s, s));
}