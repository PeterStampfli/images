inputImage = imread("oster.JPG");

s = 1000;
mPix=s*s/1e6;
range=1;
map=createIdentityMap(mPix,-range,range,-range,range);
basicKaleidoscope(map,5,4,2);
outputImage = createOutputImage(map,inputImage);

imshow(outputImage);
