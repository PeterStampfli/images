function testLog1PlusSpiralMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=1;
map=createIdentityMap(mPix,-range,range,-range,range);
width=0.1;
height=0.1;
% periods are TWICE width or height
% large numbers get "more periods" between the spiral centers
periodX=20*width;
periodY=6*height;

log1PlusZPowerMinusNMap(map);
%logSpiralMap(map,periodX,periodY);
%mirrorsMap(map,width,height);
scale(map,2);

basicKaleidoscope(map,5,3,2);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
