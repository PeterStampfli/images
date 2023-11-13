% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function bulatovBandTest()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
h=1;
w=30;
map=identityMap(mPix,-w,w,-h,h);

k=7;
m=3;

period=getBulatovPeriod(k,m,2);

basicBulatovBand(map,period);

%params map,k,m,n
outMap = basicKaleidoscope(map,k,m,2);
%xDrift(outMap,0.2);

%im=createStructureImage(outMap);

inputImage = imread("tier.jpg");

im = createOutputImage(outMap,inputImage);

imshow(im);
end
