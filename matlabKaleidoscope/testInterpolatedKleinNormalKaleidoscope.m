% creates map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>testBasicKaleidoscope(5,4,2);

function testInterpolatedKleinNormalKaleidoscope(k, m, n, z)
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix,-1,1,-1,1);
interpolatedKleinNormalMap(map,z);
basicKaleidoscope(map,k,m,n);
im=createStructureImage(map);
imshow(im)
end
