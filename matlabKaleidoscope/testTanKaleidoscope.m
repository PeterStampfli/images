% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function testTanKaleidoscope()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;

map=createIdentityMap(mPix,-3,3,-2,2);
tanMap(map, 0.8);
outMap = basicKaleidoscope(map,5,4,2);
im=createStructureImage(outMap);
imshow(im);
end
