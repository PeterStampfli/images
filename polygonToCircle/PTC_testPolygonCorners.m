% PTC_testPolygonCorners.m
global PTC;
[cornersX,cornersY]=PTC_getPolygonCorners();
plot(cornersX,cornersY,'-r');
r=1.1*PTC.polygonRadius;
hold on;
plot([0 0],[-1 1],'--g');
plot([-1 1],[0 0],'--g');
axis([-1 1 -1 1],'equal');
hold off;