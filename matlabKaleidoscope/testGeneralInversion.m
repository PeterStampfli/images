function testGeneralInversion()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);

universalInversionMap(map,0.5,0,0,1);
universalInversionMap(map,0.7,0,0,1);

im=createStructureImage(map);
imshow(im);
%imwrite(im,'image.jpg');
end
