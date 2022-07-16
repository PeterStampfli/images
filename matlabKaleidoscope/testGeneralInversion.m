function testGeneralInversion()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=1;
map=createIdentityMap(mPix,-range,range,-range,range);
universalInversionMap(map,0.5,0.2,0,0);

basicKaleidoscope(map,5,4,2);

im=createStructureImage(map);
imshow(im);
imwrite(im,'outsideIn.jpg');
end
