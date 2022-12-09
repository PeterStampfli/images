include <spirals.scad>;

module octagonTriangleSpirals() {
    nTurns3 = 0.5;
    nSeg3 = 20;
    nTurns8 = 1;
    nSeg8 = 30;
    weight = 1;
    rt2p = sqrt(2) + 1;
    corners = [
        [rt2p, 1, rt2p],
        [1, rt2p, rt2p],
        [-1, rt2p, rt2p],
        [-rt2p, 1, rt2p],
        [-rt2p, -1, rt2p],
        [-1, -rt2p, rt2p],
        [1, -rt2p, rt2p],
        [rt2p, -1, rt2p],
        [rt2p, rt2p, 1],
        [-rt2p, rt2p, 1],
        [-rt2p, -rt2p, 1],
        [rt2p, -rt2p, 1],
        [rt2p, rt2p, -1],
        [-rt2p, rt2p, -1],
        [-rt2p, -rt2p, -1],
        [rt2p, -rt2p, -1],
        [rt2p, 1, -rt2p],
        [1, rt2p, -rt2p],
        [-1, rt2p, -rt2p],
        [-rt2p, 1, -rt2p],
        [-rt2p, -1, -rt2p],
        [-1, -rt2p, -rt2p],
        [1, -rt2p, -rt2p],
        [rt2p, -1, -rt2p],
    ];

//drawPoints(20*corners,5);

    drawArchimedian([
        corners[0], corners[1], corners[8]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[2], corners[3], corners[9]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[4], corners[5], corners[10]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[6], corners[7], corners[11]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[16], corners[17], corners[12]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[18], corners[19], corners[13]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[20], corners[21], corners[14]
    ], nTurns3, nSeg3, 20, weight);
    drawArchimedian([
        corners[22], corners[23], corners[15]
    ], nTurns3, nSeg3, 20, weight);

    drawArchimedian([
        corners[0], corners[1], corners[2], corners[3], corners[4], corners[5], corners[6], corners[7]
    ], nTurns8, nSeg8, 20, weight);
    drawArchimedian([
        corners[0], corners[8], corners[12], corners[16], corners[23], corners[15], corners[11], corners[7]
    ], nTurns8, nSeg8, 20, weight);
    drawArchimedian([
        corners[5], corners[6], corners[11], corners[15], corners[22], corners[21], corners[14], corners[10]
    ], nTurns8, nSeg8, 20, weight);
    drawArchimedian([
        corners[3], corners[4], corners[10], corners[14], corners[20], corners[19], corners[13], corners[9]
    ], nTurns8, nSeg8, 20, weight);
    drawArchimedian([
        corners[2], corners[1], corners[8], corners[12], corners[17], corners[18], corners[13], corners[9]
    ], nTurns8, nSeg8, 20, weight);
    drawArchimedian([
        corners[16], corners[17], corners[18], corners[19], corners[20], corners[21], corners[22], corners[23]
    ], nTurns8, nSeg8, 20, weight);
}


$fn=60;


octagonTriangleSpirals();