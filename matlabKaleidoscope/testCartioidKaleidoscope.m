% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function testCartioidKaleidoscope(r)
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;

map=createIdentityMap(mPix,-r,r,-r,r);
cartioidMap(map,2);
%basicCartioidMap(map,1.2);
%fourMap(map,0.9);
outMap = basicKaleidoscope(map,5,3,3);
im=createStructureImage(outMap);
imshow(im);
end
