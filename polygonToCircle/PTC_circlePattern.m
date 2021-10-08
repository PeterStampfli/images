function [R,G,B] = PTC_circlePattern(x,y)
% make color components for a test-pattern, that shows the circle
% defined by PTC
% depending on image koordinates (x,y)
global PTC;
radial=5;
tangential=10;
x=x-PTC.circleCenterX;
y=y-PTC.circleCenterY;
r=sqrt(x*x+y*y);
phi=atan2(y,x);
if (r>PTC.circleRadius)
    B=255;
else
    B=0;
end
G=floor(255*(sin(radial*pi*r))^4);
R=floor(255*(sin(tangential*phi))^4);
end