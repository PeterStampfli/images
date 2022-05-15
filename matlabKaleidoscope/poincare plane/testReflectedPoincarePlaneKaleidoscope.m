% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testReflectedPoincarePlaneKaleidoscope(k, m, n)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
% gegebenenfalls andere parameter einsetzen
xMin=-1;
xMax=1;
yMax=2;
map=createIdentityMap(mPix,xMin,xMax,0,yMax);
verticalReflectionMap(map,yMax/2);
poincarePlaneToDisc(map);
basicKaleidoscope(map,k,m,n);
im=createStructureImage(map);
imshow(im)
end
