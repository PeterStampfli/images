
include <geometryUtils.scad>;

nn=normalize(sumArray([[1,0,0],[0,1,0],[0,0,1]], [0,0,0]));
echo(nn);
vs=rotateToZVectors(nn,[nn,[1,2,3],[0,0,1]]);


echo(vs);

echo(normalizeVectors([[1,2,3],[1,1,0],[2,0,0]]));
