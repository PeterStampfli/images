function testZerosPolynomThings()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=1.8;
iterations=1;
%amp=0.35;
amp=0.6;
realZ=[1,-1,0,0];
imZ=[0,0,-1,1];
%realZ=[1,-0.5,-0.5];
realZ=[-1,0.5,0.5];
imZ=[0,0.866,-0.866];
realS=[0];
imS=[0];
inversionMap(map,limit);
for p=1:iterations 
%    zerosPolynomSingularTransform(map,amp,realZ,imZ,order); 
   rationalFunctionTransform(map,amp,realZ,imZ,realS,imS); 
%    discBlackoutMap(map,limit);
    inversionMap(map,limit);
end 
scale(map, limit,0.6);
basicKaleidoscope(map,3,5,2);
im=createStructureImage(map);
%im=createJuliaImage(map);
imshow(im);
%imwrite(im,'three.jpg');
end
