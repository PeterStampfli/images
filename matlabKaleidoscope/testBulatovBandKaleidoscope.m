% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function outMap = testTransformedKaleidoscope(k, m, n, a)
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% intrerpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
if (a <= 1)
width=min(6,getBulatovWidth(a));
map=createIdentityMap(mPix,-width,width,-1,1);
else
map=createIdentityMap(mPix,-3,3,0,4/a);
end
bulatovBandMap(map, a);
outMap = basicKaleidoscope(map,k,m,n);
im=createStructureImage(outMap);
imshow(im)
end
