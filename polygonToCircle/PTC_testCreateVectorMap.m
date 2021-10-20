function PTC_testCreateVectorMap(nCorners,width)
%create and test a polygon to circle vector map
PTC_setCircle(0,0,1);
map=PTC_createVectorMap(nCorners,width);
[height,~,~]=size(map);
for ix=1:width
    for iy=1:height
       [x,y]= PTC_polygonToCircle(iy,ix);
        [r,g,b]=PTC_circlePattern(map(iy,ix,1),map(iy,ix,2));
       % [r,g,b]=PTC_circlePattern(x,y);
        im(iy,ix,1)=r;
        im(iy,ix,2)=g;
        im(iy,ix,3)=b;
    end
end
imshow(im)
end

