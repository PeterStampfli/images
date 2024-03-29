% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c, polygonToCircle.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testPolygonToCircleKaleidoscope(k, m, n)
% test of the basic kaleidoscope
% depending on symmetry parameters k, n and m
% shows pattern of inversions

nCorners = 6;
winding=1;
angle=pi/1000000;

s = 1000;
mPix=s*s/1e6;
[xMin, xMax, yMin, yMax] = getRangePolygon(nCorners);
map=createIdentityMap(mPix,xMin, xMax, yMin, yMax);
polygonToCircle(map, nCorners, angle, winding);
basicKaleidoscope(map,k,m,n);
im=createStructureImage(map);
imshow(im)
end
