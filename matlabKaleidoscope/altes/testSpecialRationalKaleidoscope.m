% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function outMap = testSpecialRationalKaleidoscope(k, m, n)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
amplitude = 0.28;
map=createIdentityMap(mPix,-4,4,-4,4);
tic();
specialRationalMap(map,amplitude);
toc();
outMap = basicKaleidoscope(map,k,m,n);
im=createStructureImage(outMap);
imshow(im)
end
