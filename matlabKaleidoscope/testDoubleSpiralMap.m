function testDoubleSpiralMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=3;
map=createIdentityMap(mPix,-range,range,-range,range);
width=0.3;
height=0.4;
% periods are TWICE width or height
% large numbers get "more periods" between the spiral centers
periodX=20*width;
periodY=8*height;

moebiusTransformMap(map,[1,0,1,0,1,0,-1,0]);
logSpiralMap(map,periodX,periodY);
mirrorsMap(map,width,height);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
