% create an arbitrarily large map
% using an input image, check problems

function testOutputImageFitMap()
% make the initial map
s = 1000;
mPix=s*s/1e6;
% should work for any range value
range=100000;
map=createIdentityMap(mPix,-range,range,-range,range);
% read an input image
inputImage = imread("1.jpg");
% fit map inside input image
outputImage = makeOutputImageFitMapToInput(map, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
