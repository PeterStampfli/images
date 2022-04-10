% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testPolynomTranformKaleidoscope(k, m, n)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
% gegebenenfalls andere parameter einsetzen
xMin=-1.5;
xMax=1.5;
yMax=1.5;
yMin=-1.5;
map=createIdentityMap(mPix,xMin,xMax,yMin,yMax);

coeffs=[0 1 0 1 0 0 0 0 2 ];
imCos=[0  0.5 0.2];
polynomTransformMap(map,coeffs,imCos);
basicKaleidoscope(map,k,m,n);
im=createStructureImage(map);
imshow(im)
end
