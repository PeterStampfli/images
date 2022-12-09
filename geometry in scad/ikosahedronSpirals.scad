include <spirals.scad>;

module ikosahedronSpirals() {
    nTurns = 1;
    nSeg = 20;
    weight = 1;
    rt5 = sqrt(5);
    plus = 0.1 * (5 + rt5);
    minus = 0.1 * (5 - rt5);
    echo(plus,minus);

    corners = [
        [0, 0, 1],
        [2 / rt5, 0, 1 / rt5],
        [minus, sqrt(plus), 1 / rt5],
        [-plus, sqrt(minus), 1 / rt5],
        [-plus, -sqrt(minus), 1 / rt5],
        [minus, -sqrt(plus), 1 / rt5],
        [plus, sqrt(minus), -1 / rt5],
        [-minus, sqrt(plus), -1 / rt5],
        [-2 / rt5, 0, -1 / rt5],
        [-minus, -sqrt(plus), -1 / rt5],
        [plus, -sqrt(minus), -1 / rt5],
        [0, 0, -1]
    ];

  //  drawPoints(20*corners,10);

   drawArchimedian([
        corners[0], corners[1], corners[2]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[0], corners[2], corners[3]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[0], corners[3], corners[4]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[0], corners[4], corners[5]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[0], corners[5], corners[1]
    ], nTurns, nSeg, 20, weight);

   drawArchimedian([
        corners[6], corners[1], corners[2]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[7], corners[2], corners[3]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[8], corners[3], corners[4]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[9], corners[4], corners[5]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[10], corners[5], corners[1]
    ], nTurns, nSeg, 20, weight);

   drawArchimedian([
        corners[2], corners[6], corners[7]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[3], corners[7], corners[8]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[4], corners[8], corners[9]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[5], corners[9], corners[10]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[1], corners[10], corners[6]
    ], nTurns, nSeg, 20, weight);


   drawArchimedian([
        corners[11], corners[6], corners[7]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[11], corners[7], corners[8]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[11], corners[8], corners[9]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[11], corners[9], corners[10]
    ], nTurns, nSeg, 20, weight);
   drawArchimedian([
        corners[11], corners[10], corners[6]
    ], nTurns, nSeg, 20, weight);

}


$fn=120;

ikosahedronSpirals();