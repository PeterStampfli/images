include <spirals.scad>;

module cuboctahedronSpirals() {
    nTurns3 = 1;
    nSeg3 = 20;
    nTurns4 = 1.5;
    nSeg4 = 30;
    weight = 1;
    corners = [
        [1, 0, 1],
        [0, 1, 1],
        [-1, 0, 1],
        [0, -1, 1],
        [1, -1, 0],
        [1, 1, 0],
        [-1, 1, 0],
        [-1, -1, 0],
        [1, 0, -1],
        [0, 1, -1],
        [-1, 0, -1],
        [0, -1, -1]
    ];

   drawArchimedian([
        corners[0], corners[1], corners[2], corners[3]
    ], nTurns4, nSeg4, 20, weight);
   drawArchimedian([
        corners[0], corners[5], corners[8], corners[4]
    ], nTurns4, nSeg4, 20, weight);
   drawArchimedian([
        corners[1], corners[5], corners[9], corners[6]
    ], nTurns4, nSeg4, 20, weight);
   drawArchimedian([
        corners[2], corners[6], corners[10], corners[7]
    ], nTurns4, nSeg4, 20, weight);
   drawArchimedian([
        corners[3], corners[7], corners[11], corners[4]
    ], nTurns4, nSeg4, 20, weight);
   drawArchimedian([
        corners[8], corners[9], corners[10], corners[11]
    ], nTurns4, nSeg4, 20, weight);

   drawArchimedian([
        corners[0], corners[3], corners[4]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[0], corners[1], corners[5]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[2], corners[1], corners[6]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[2], corners[3], corners[7]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[4], corners[8], corners[11]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[5], corners[9], corners[8]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[6], corners[10], corners[9]
    ], nTurns3, nSeg3, 20, weight);
   drawArchimedian([
        corners[7], corners[11], corners[10]
    ], nTurns3, nSeg3, 20, weight);
}


$fn=60;

cuboctahedronSpirals();