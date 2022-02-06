% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% uses basic kaleidoscope with geometry parameters k, m , 2
%  repeats is number of periods in one cycle, order of dihedral group

function outMap = testJuliaRingKaleidoscope(k, m, repeats)
% test of the basic kaleidoscope in Bulatov ring projection
% depending on symmetry parameters k, m and repetitions
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix);
r=0.0165;
ii=0.03;
x2PlusTransformMap(map,r,ii);
x2PlusTransformMap(map,r,ii);
x2PlusTransformMap(map,r,ii);
tic();
bulatovRingMap(map,k, m, 2, repeats);
toc();
outMap = basicKaleidoscope(map,k,m,2);
im=createStructureImage(outMap);
imshow(im)
end
