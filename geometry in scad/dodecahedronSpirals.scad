include <spirals.scad>;

module dodecahedronSpirals() {
    nTurns = 1;
    nSeg = 20;
    weight = 1;
    phi = 0.5 * (1 + sqrt(5));
    r = 0.5 * sqrt(10 - 2 * sqrt(5));
    PI = 180;
    x0 = 2;
    x1 = 2 * cos(2 / 5 * PI);
    x2 = 2 * cos(2 / 5 * PI * 2);
    x3 = 2 * cos(2 / 5 * PI * 3);
    x4 = 2 * cos(2 / 5 * PI * 4);
    y0 = 0;
    y1 = 2 * sin(2 / 5 * PI);
    y2 = 2 * sin(2 / 5 * PI * 2);
    y3 = 2 * sin(2 / 5 * PI * 3);
    y4 = 2 * sin(2 / 5 * PI * 4);
     //   project(x, y, phi + 1, r);
     //   project(-x, -y, -(phi + 1), r);
      //  project(phi * x, phi * y, phi - 1, r);
      //  project(-phi * x, -phi * y, -(phi - 1), r);
    
    corners = [
        [x0, y0, phi + 1],
        [x1, y1, phi + 1],
        [x2, y2, phi + 1],
        [x3, y3, phi + 1],
        [x4, y4, phi + 1],
        [phi * x0, phi * y0, phi - 1],
        [phi * x1, phi * y1, phi - 1],
        [phi * x2, phi * y2, phi - 1],
        [phi * x3, phi * y3, phi - 1],
        [phi * x4, phi * y4, phi - 1],
        [-phi * x0, -phi * y0, -phi + 1],
        [-phi * x1, -phi * y1, -phi + 1],
        [-phi * x2, -phi * y2, -phi + 1],
        [-phi * x3, -phi * y3, -phi + 1],
        [-phi * x4, -phi * y4, -phi + 1],
        [-x0, -y0, -phi - 1],
        [-x1, -y1, -phi - 1],
        [-x2, -y2, -phi - 1],
        [-x3, -y3, -phi - 1],
        [-x4, -y4, -phi - 1],
    ];

    drawArchimedian([
        corners[0], corners[1], corners[2], corners[3], corners[4]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[0], corners[1], corners[6], corners[13], corners[5]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[1], corners[2], corners[7], corners[14], corners[6]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[2], corners[3], corners[8], corners[10], corners[7]
    ], nTurns, nSeg, 20, weight); 
    drawArchimedian([
        corners[3], corners[4], corners[9], corners[11], corners[8]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[4], corners[0], corners[5], corners[12], corners[9]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[5], corners[12], corners[17], corners[18], corners[13]
    ], nTurns, nSeg, 20, weight); 
    drawArchimedian([
        corners[6], corners[13], corners[18], corners[19], corners[14]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[7], corners[14], corners[19], corners[15], corners[10]
    ], nTurns, nSeg, 20, weight); 
    drawArchimedian([
        corners[8], corners[10], corners[15], corners[16], corners[11]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[9], corners[11], corners[16], corners[17], corners[12]
    ], nTurns, nSeg, 20, weight);
    drawArchimedian([
        corners[19], corners[18], corners[17], corners[16], corners[15]
    ], nTurns, nSeg, 20, weight);
   
 

   


 

};


$fn=60;

dodecahedronSpirals();