% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function bulatovRingTest()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 2000;
mPix=s*s/1e6;
h=1;
w=1;
map=identityMap(mPix,-w,w,-h,h);

k=5;
m=4;

period=getBulatovPeriod(k,m,2);
repeats=8;

bulatovRing(map,period,repeats);

%params map,k,m,n
outMap = basicKaleidoscope(map,k,m,2);
strength=0.05;
circularDrift(outMap,strength,-w,w,-h,h);

%im=createStructureImage(outMap);

inputImage = imread("tier.jpg");

im = createOutputImage(outMap,inputImage);

imshow(im);
end
