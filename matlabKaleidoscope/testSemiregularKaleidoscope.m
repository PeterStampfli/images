% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function testSemiregularKaleidoscope()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
r=1;
map=createIdentityMap(mPix,-r,r,-r,r);

outMap = semiregularKaleidoscope(map,5,3,0);
im=createStructureImage(outMap);

%inputImage = imread("dionisos.jpeg");

%outputImage = createOutputImage(map,inputImage);

imshow(im);
end
