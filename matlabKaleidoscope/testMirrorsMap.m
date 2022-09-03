function testMirrorsMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
width=0.3;
height=0.4;
mirrorsMap(map,width,height);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
