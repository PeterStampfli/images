function testRosette()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
a=0.09;
a=deg2rad(a)
rosette(map,5,a,0,0.5);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
