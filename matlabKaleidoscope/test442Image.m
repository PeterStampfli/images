function test442Image()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=3;
map=createIdentityMap(mPix,-range,range,-range,range);
%a=45;
%a=deg2rad(a)
%rosette(map,20,a,0,0);
%basicKaleidoscope(map,5,3,2);

size=0.5;
K442Map(map,size);
%mirrorsMap(map,size,size);

drift = 0.1;

driftMap(map,[drift, 2 * range]);

inputImage = imread("tier.jpg");

outputImage = createOutputImage(map,inputImage);
%outputImage=createStructureImage(map);


imshow(outputImage);
%imwrite(outputImage,'rosetteimage.jpg');
end
