function testLogSpiralMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=5;
map=createIdentityMap(mPix,-range,range,-range,range);
width=0.3;
height=0.4;
% periods are TWICE width or height
periodX=6*width;
periodY=8*height;

logSpiralMap(map,periodX,periodY);
mirrorsMap(map,width,height);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
