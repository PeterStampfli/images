% create an image of some kaleidoscope
% using an input image

function makeKaleidoscopicImageFitting()
% make the initial map
s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix,-1,1,-1,1);
% transform the map into a kaleidoscope
basicKaleidoscope(map,6,3,3);
% scale map to test output routine
map=map*10000;
% create and show the kaleidoscopic image
% read an input image
inputImage = imread("1.jpg");
% fit map inside input image
outputImage = makeOutputImageFitMapToInput(map, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
