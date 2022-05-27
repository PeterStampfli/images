function testZerosPolynomThings()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=1.7;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=3;
iterations=1;
amp=0.8;
realZ=[1,-1,0,0];
imZ=[0,0,-1,1];
order=1;
%inversionMap(map,limit);
for p=1:iterations 
    zerosPolynomSingularTransform(map,amp,realZ,imZ,order); 
    discBlackoutMap(map,limit);
%    inversionMap(map,limit);
end 
scale(map, limit,1);
basicKaleidoscope(map,4,5,2);
im=createStructureImage(map);
imshow(im)
end
