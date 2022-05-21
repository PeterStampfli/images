function juliaSetWithDiscBlackoutMap()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=3;
iterations=3;
amp=01;
realZ=[-0.5,1,-1,2];
imZ=[-1,-1,1,0.9];
inversionMap(map,limit);
for p=1:iterations 
    zerosPolynomTransformMap(map,amp,realZ,imZ); 
  %  discBlackoutMap(map,limit);
    inversionMap(map,limit);
end 
scale(map, limit,0.3);
basicKaleidoscope(map,5,4,2);
im=createStructureImage(map);
imshow(im)
end
