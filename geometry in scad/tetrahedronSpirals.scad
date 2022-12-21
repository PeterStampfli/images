include <spirals.scad>;

module tetrahedronSpirals(nTurns) {
    rt32 = sqrt(3) / 2;
    r3 = 2 / 3 * sqrt(2);

    corners = [
        [0,0,-1],
        [r3, 0, 1 / 3],
        [-r3 / 2, rt32 * r3, 1 / 3],
        [-r3 / 2, -rt32 * r3, 1 / 3]
    ];

    drawArchimedian([
        corners[0], corners[1], corners[2]], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[1], corners[3]], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[2], corners[3]], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[1], corners[2], corners[3]], nTurns, nSeg, 20, weight);

};


$fn=60;
nSeg = 20;
weight = 0.75;

orient([20,30,40])tetrahedronSpirals(1);
//orient([20,30,40])tetrahedronSpirals(-1);


