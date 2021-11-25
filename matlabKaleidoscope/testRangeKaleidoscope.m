% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testRangeKaleidoscope(k, m, n)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix);
basicKaleidoscope(map,k,m,n);
[xMin, xMax, yMin, yMax] = getRangeMap(map);
xMin
xMax
yMin
yMax
im=createStructureImage(map);
imshow(im)
end
