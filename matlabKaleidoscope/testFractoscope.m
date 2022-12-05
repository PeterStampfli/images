% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testFractoscope()

k=5;
s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix,-1,1,-1,1);
fractoscope(map,k,0,1);
inputImage = imread("oster.JPG");

im=createOutputImage(map,inputImage);
imshow(im)
end
