function PTC_testPolygon(nCorners)
% test polygon to circle conversion
width=400;
PTC_setCircle(0,0,1);
height=PTC_fitPolygon(nCorners,width);
im=zeros(height,width,3);
for ix=1:width
    for iy=1:height
        [x,y]=PTC_polygonToCircle(ix,iy);
        if (x>-10000)
        [r,g,b]=PTC_circlePattern(x,y);            
            im(iy,ix,1)=r;
            im(iy,ix,2)=g;
            im(iy,ix,3)=b;            
        else
            im(iy,ix,1)=0;
            im(iy,ix,2)=0;
            im(iy,ix,3)=0;            
        end
    end
end
imshow(im);
%imwrite(im,"testPolygon.jpg")
end

