% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testJuliaMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=3;
limit=3;
maxIterations=5;
realCo=[0,1,0,0,0.5];
map=createIdentityMap(mPix,-range,range,-range,range);
juliaPolynomTransformMap(map,limit, maxIterations,realCo);
scale(map,limit,1);
basicKaleidoscope(map,5,4,2);
im=createStructureImage(map);
imshow(im)
end
