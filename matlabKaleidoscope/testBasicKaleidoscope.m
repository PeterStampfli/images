% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function outMap = testBasicKaleidoscope(k, m, n, maxRange, minRange)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% and range (number of iterations)
% shows pattern of inversions

s = 700;
mPix = s * s / 1e6;
map = createIdentityMap(mPix);
tic;
outMap = basicKaleidoscope(map, k, m, n, maxRange, minRange);
toc;
im = createStructureImage(outMap);
imshow(im)
end
