function PTC_testPolygon(nCorners)
% test polygon to circle conversion
s=1000;
PTC_setCircle(s/2,s/2,s/2);
PTC_setPolygon(nCorners,s/2,s/2,s/2);
im=zeros(s,s,3);
for ix=1:s
    for iy=1:s
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
imwrite(im,"testPolygon.jpg")
end

