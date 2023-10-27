% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function basicKaleidoscopeTest()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
r=1;
map=identityMap(mPix,-r,r,-r,r);

%params map,k,m,n
outMap = basicKaleidoscope(map,5,4,2);
im=createStructureImage(outMap);

%inputImage = imread("tier.jpg");

%im = createOutputImage(outMap,inputImage);

imshow(im);
end
