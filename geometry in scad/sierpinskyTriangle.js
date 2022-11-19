module drawTriangle(a, b, c, iter) {
    if (iter == 0) {
        polygon([a, b, c]);
    } else {
        echo("go");
        ab = 0.5 * (a + b);
        ac = 0.5 * (a + c);
        bc = 0.5 * (b + c);
        drawTriangle(a, ab, ac, iter - 1);
        drawTriangle(b, bc, ab, iter - 1);
        drawTriangle(c, ac, bc, iter - 1);
    }
}

rt3 = sqrt(3);
s = 30;
a = s * [-0.5, -0.5 / rt3];
b = s * [0.5, -0.5 / rt3];
c = s * [0, 1 / rt3];
h = s * sqrt(2) / rt3;
ex = 0.1;

offset(r = ex) drawTriangle(a, b, c, 4);
ab = 0.5 * (a + b);
echo(ab);