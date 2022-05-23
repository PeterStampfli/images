% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testJuliaPolynomMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
limit=3;
maxIterations=100;
realCo=[-0.1,1,-0.3,2,0.5];
imCo=[0,0.005,0.3];
map=createIdentityMap(mPix,-range,range,-range,range);
%juliaPolynomBlackout(map,limit, maxIterations,realCo,imCo);
mandelbrotPolynomBlackout(map,limit, maxIterations,realCo,imCo);
scale(map,limit,1);
%basicKaleidoscope(map,4,4,2);
im=createStructureImage(map);
imshow(im)
end
