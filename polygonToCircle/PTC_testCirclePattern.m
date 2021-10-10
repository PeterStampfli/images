% PTC_testCirclePattern
s=1000;
im=zeros(s,s,3);
for ix=1:s
    for iy=1:s
        x=2*ix/s-1;
        % inverted y-axis
        y=-(2*iy/s-1);
        [r,g,b]=PTC_circlePattern(x,y);
        im(iy,ix,1)=r;
        im(iy,ix,2)=g;
        im(iy,ix,3)=b;
    end
end
imshow(im)