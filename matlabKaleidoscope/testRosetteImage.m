function testRosetteImage()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
a=45;
a=deg2rad(a);
rosette(map,20,a,0,0);
%basicKaleidoscope(map,5,3,2);

inputImage = imread("dionisos.jpeg");

outputImage = createOutputImage(map,inputImage);

imshow(outputImage);
%imwrite(outputImage,'rosetteimage.jpg');
end
