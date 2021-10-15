function PTC_testPolygon(nCorners)
% test polygon to circle conversion
% call PTC_testCircle before this to setup circle
s=400;
PTC_setPolygon(nCorners,s/2,s/2,s/2);
im=zeros(s,s,3);
for ix=1:s
    for iy=1:s
    
        
      [x,y]=PTC_polygonToCircle(ix,iy);
        if (x>-10000)
        
        im(iy,ix,1)=1;
        im(iy,ix,2)=1;
        im(iy,ix,3)=1;
        
        else
                im(iy,ix,1)=1;
        im(iy,ix,2)=0;
        im(iy,ix,3)=1;
    
        end
    end
end
imshow(im);
end

