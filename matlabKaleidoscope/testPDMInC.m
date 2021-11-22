function testPDMInC(k, m,n)
%test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
%shows pattern of inversions
s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix);
tic;

poincareDiscTransform(map,k,m,n);
toc;
im=createStructureImage(map);
imshow(im)
end
