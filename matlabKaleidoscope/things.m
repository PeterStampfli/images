function testZerosPolynomThings()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=1.5;

iterations=3;
amp=1.1;

amp=[0.8,0.5];

realZ=[1,-0.45,-0.5,-1,0.6,0.5];
imZ=[0,0.866,-0.866,0,0.866,-0.866];

power=0.6;
%inversionMap(map,limit,power);

for p=1:iterations 
   zerosPolynomTransformMap(map,amp,realZ,imZ); 
    inversionMap(map,limit,power);
end 
%scale(map, limit,3);
basicKaleidoscope(map,3,1,2);
im=createStructureImage(map);
imshow(im);
%imwrite(im,'three.jpg');
end
