function testZerosPolynomThings()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=4;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=2;

iterations=2;
amp=1.1;
%amp=[0.6 , 0.4];
%amp=[0.25,0.2];
%amp=[0.6,0.5]
%amp=0.9;
%amp=0.2;
realZ=[1,-1,0,0];
imZ=[0,0,-1,1];
realZ=[1,-0.5,-0.5,-1,0.5,0.5];
realZ=[1,-0.45,-0.5,-1,0.6,0.5];
imZ=[0,0.866,-0.866,0,0.866,-0.866];
%realZ=-[1,-0.5,-0.5];
%imZ=[0,0.866,-0.866];
%imZ=[0,0];
%realZ=[-1,1];
realS=[0,0];
%realS=[];
imS=[];
%imS=0.5*[-1,1];

power=3;
inversionMap(map,limit,power);


for p=1:iterations 
%    zerosPolynomSingularTransform(map,amp,realZ,imZ,order); 
%   rationalFunctionTransform(map,amp,realZ,imZ,realS,imS); 
%   rationalFunctionTransform(map,amp,realZ,imZ,realS,imS); 
   zerosPolynomTransformMap(map,amp,realZ,imZ); 
    discBlackoutMap(map,limit);
  %  inversionMap(map,limit,power);
end 
%scale(map, limit,3);
basicKaleidoscope(map,3,1,2);
im=createStructureImage(map);
%im=createJuliaImage(map);
imshow(im);
%imwrite(im,'three.jpg');
end
