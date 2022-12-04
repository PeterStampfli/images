include <geometryUtils.scad>;

// draw archimedian spirals on a sphere
// going to a given array of points on a sphere of given radius
// these pints are corners, midpoints have to be used
// they go out from the centerpoint of these points
// making a given number of turns, using a given number of segments

module drawArchimedian(points, nTurns, nSegments, radius, weight = 1) {
    // doing calculation on the unit sphere, applying the radius on the final line segments
    length = len(points);
    echo(points);
    midpoints = [
        for (i = [1: length]) i == length ? 0.5 * (points[0] + points[length - 1]) : 0.5 * (points[i - 1] + points[i])
    ];
    echo(midpoints);
    normalizedPoints = normalizeVectors(midpoints);
    normalVector = normalize(sumArray(normalizedPoints, [0, 0, 0]));
    rotatedPoints = rotateToZVectors(normalVector, normalizedPoints);
    deltaPhi = 360 * nTurns;
    orient(normalVector) drawPoint([0, 0, radius], weight);
    for (point = rotatedPoints) {
        phiEnd = phi(point);
        phiStart = phiEnd - deltaPhi;
        thetaEnd = theta(point);
        dPhi = deltaPhi / nSegments;
        dTheta = thetaEnd / nSegments;
        for (i = [1: nSegments]) {
            a = fromPolar(radius, (i - 1) * dTheta, phiStart + (i - 1) * dPhi);
            b = fromPolar(radius, i * dTheta, phiStart + i * dPhi);
            orient(normalVector) {
                drawPoint(b, weight);
                drawLine(a, b, weight);
            };
        }
    }
}

// show only the upper half
module upperHalf(){
	cubeSize=100;
	intersection(){
		translate([-0.5*cubeSize,-0.5*cubeSize,0]) cube(cubeSize);
		children();
	};
}

// rotate to diagonal
module spaceDiagonal(){
	rotateToZ([1,1,1]) children();
}

module planeDiagonal(){
	rotateToZ([1,1,0]) children();
}



