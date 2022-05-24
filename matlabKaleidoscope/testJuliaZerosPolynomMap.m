% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testJuliaZerosPolynomMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
limit=2;
maxIterations=10;
amplitude=0.9;
%realZ=[0.7,0.7,-0.7,-0.7];
%imZ=[0.7,-0.7,0.7,-0.7];
%realZ=[0.7,-0.7];
%imZ=[0.7,-0.7];
%realZ=[1,-1];
%imZ=[0,0];
realZ=[0,0,0];
imZ=[-1,1,0];
map=createIdentityMap(mPix,-range,range,-range,range);
%juliaZerosPolynomInversion(map,limit, maxIterations,amplitude,realZ,imZ);
juliaZerosPolynomApproximations(map,limit, maxIterations,amplitude,realZ,imZ);
scale(map,limit,1);
%basicKaleidoscope(map,5,3,2);
im=createStructureImage(map);
imshow(im)
end
