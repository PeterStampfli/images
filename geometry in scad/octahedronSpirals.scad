include <spirals.scad>;

module octahedronSpirals() {
    nTurns = 1.5;
    nSeg = 30;
    weight = 1;
    corners = [
        [0, 0, 1],
        [1, 0, 0],
        [0, 1, 0],
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, -1]
    ];

    drawArchimedian([
        corners[0], corners[1], corners[4]
    ], nTurns, nSeg, 20, weight);	
    drawArchimedian([
        corners[0], corners[1], corners[2]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[3], corners[2]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[3], corners[4]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[5], corners[1], corners[4]
    ], nTurns, nSeg, 20, weight);	
    drawArchimedian([
        corners[5], corners[1], corners[2]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[5], corners[3], corners[2]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[5], corners[3], corners[4]
    ], nTurns, nSeg, 20, weight);
}

$fn=60;

octahedronSpirals();