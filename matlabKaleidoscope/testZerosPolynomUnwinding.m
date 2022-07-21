% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testZerosPolynomUnwinding()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions
k = 5;
m = 0;
n = 2;

s = 1000;
mPix=s*s/1e6;
% gegebenenfalls andere parameter einsetzen
range=3;
xMin=-range;
xMax=range;
yMax=range;
yMin=-range;
map=createIdentityMap(mPix,xMin,xMax,yMin,yMax);

realZeros=[1 -1.1 0 0.2 ];
imZeros=[0.3 0.1 1.2 -1];

%realZeros=[0.5,-0.5];
%imZeros=[0];
amplitude=0.65;
unwinding = -1;
zerosPolynomUnwindingMap(map,amplitude,realZeros,imZeros,unwinding);
basicKaleidoscope(map,k,m,n);
im=createStructureImage(map);
imshow(im)
end
