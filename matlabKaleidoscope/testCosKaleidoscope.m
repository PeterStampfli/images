% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function testCosKaleidoscope()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;

map=createIdentityMap(mPix,-7,7,-2,2);
cosMap(map, 0.8);
outMap = basicKaleidoscope(map,5,4,2);
im=createStructureImage(outMap);
imshow(im);
end
