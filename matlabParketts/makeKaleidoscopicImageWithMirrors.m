% create an image of some kaleidoscope
% using an input image

function makeKaleidoscopicImageWithMirrors()
% make the initial map
s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix,-1,1,-1,1);
% transform the map into a kaleidoscope
basicKaleidoscope(map,6,3,3);
% create and show the kaleidoscopic image
% read an input image
inputImage = imread("1.jpg");
% scale map to get a large portion of input image
% or as test for output imagee routine
map=map*10000;
% make output image with mirrors to avoid running of the input image
outputImage = makeOutputImageMirrorsAtBorders(map, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
