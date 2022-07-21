function testRosette2()
% test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
% shows pattern of inversions

s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
a=0.1;
a=deg2rad(a);
rosette(map,10,a,-0.0,-0.025,1.8);
im=zeros(s,s,3);
for ix=1:s
    for iy=1:s
        [r,g,b]=squareTestPattern(map(ix,iy,2),map(ix,iy,1));
        im(ix,iy,1)=r;
        im(ix,iy,2)=g;
        im(ix,iy,3)=b;
    end
end
imshow(im)
%imwrite(im,'rosette.jpg');
end
