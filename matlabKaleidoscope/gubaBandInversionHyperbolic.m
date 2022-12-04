% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function outMap = testBulatovBandKaleidoscope()
k=7;
m=8;
n=4;

a=1.08;

 CIr = 0.999; CIx = 0; CIy = 0;

% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
if (a <= 1)
width=min(6,getBulatovWidth(a));
map=createIdentityMap(mPix,-width,width,-1,1);
else
map=createIdentityMap(mPix,-5,5,0,10);
end
bulatovBandMap(map, a);
     universalInversionMap(map, CIr, CIx,CIy, 0);
outMap = basicKaleidoscope(map,k,m,n);
im=createStructureImage(outMap);
imshow(im)
end
