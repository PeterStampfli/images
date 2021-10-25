function map=PTC_createVectorMap(nCorners,width)
% create a vector map for polygon to circle conversion
% the circle has to be defined with PTC_setCircle before calling this!!!
% depends on number of corners of the regular polygon
% and the map width, the map height and polygon dimensions are optimized
% the map gives (x,y) values for each "pixel"
% the y-index (row index) comes first
% points lying outside the polygon get coordinate values of -100000
height=PTC_fitPolygon(nCorners,width);
map=zeros(height,width,2);
for ix=1:width
    for iy=1:height
        [x,y]=PTC_polygonToCircle(ix,iy);
        map(iy,ix,1)=x;
        map(iy,ix,2)=y;
    end
end
end
