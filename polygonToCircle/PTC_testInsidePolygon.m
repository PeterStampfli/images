% PTC_testInsidePolygon
% show if the isInsidePolygon function works correctly
s=500;
im=zeros(s,s);
for ix=1:s
    for iy=1:s
        x=2*ix/s-1;
        y=(2*iy/s-1);
        im(iy,ix)=PTC_isInsidePolygon(x,y);
    end
end
figure(1);
imagesc([-1 1], [-1 1],im);
hold on;
PTC_testPolygonCorners;
hold off;