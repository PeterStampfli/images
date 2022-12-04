include <spirals.scad>;

module cubeSpirals() {
    nTurns = 1.5;
    nSeg = 30;
    weight = 1;
    corners = [
        [1, 1, 1],
        [-1, 1, 1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, -1],
        [1, -1, -1]
    ];
    drawArchimedian([
        corners[0], corners[1], corners[2], corners[3],
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[1], corners[5], corners[4],
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[1], corners[2], corners[6], corners[5],
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[2], corners[3], corners[7], corners[6],
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[3], corners[7], corners[4],
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[4], corners[5], corners[6], corners[7],
    ], nTurns, nSeg, 20, weight);
}

$fn = 60;
cubeSpirals();