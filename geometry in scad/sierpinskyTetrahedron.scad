module drawTetrahedron(a, b, c, d, iter) {
    if (iter == 0) {
        polyhedron([a, b, c, d], faces = [
            [0, 2, 1],
            [0, 1, 3],
            [1, 2, 3],
            [0, 3, 2]
        ]);
    } else {
        ab = 0.5 * (a + b);
        ac = 0.5 * (a + c);
        ad = 0.5 * (a + d);
        bc = 0.5 * (b + c);
        bd = 0.5 * (b + d);
        cd = 0.5 * (c + d);
        drawTetrahedron(a, ab, ac, ad, iter - 1);
        drawTetrahedron(b, ab, bc, bd, iter - 1);
        drawTetrahedron(c, ac, bc, cd, iter - 1);
        drawTetrahedron(d, ad, bd, cd, iter - 1);
    }
}

rt3 = sqrt(3);
s = 30;
a = s * [-0.5, -0.5 / rt3, 0];
b = s * [0.5, -0.5 / rt3, 0];
c = s * [0, 1 / rt3, 0];
d = s * [0, 0, sqrt(2) / rt3];
ex = 0.2;

minkowski() {
    drawTetrahedron(a, b, c, d, 3);
    sphere(r = ex);
}