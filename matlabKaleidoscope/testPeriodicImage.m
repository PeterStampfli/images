function testPeriodicImage()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
%a=45;
%a=deg2rad(a)
%rosette(map,20,a,0,0);
%basicKaleidoscope(map,5,3,2);

width=0.5;
height=0.5;
mirrorsMap(map,width,height);

drift = 0.2;

driftMap(map,[drift, 2 * range]);

inputImage = imread("test1.JPG");

outputImage = createOutputImage(map,inputImage);

imshow(outputImage);
%imwrite(outputImage,'rosetteimage.jpg');
end
