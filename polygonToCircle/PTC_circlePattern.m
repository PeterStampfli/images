function [R,G,B] = PTC_circlePattern(x,y)
% make color components for a test-pattern, that shows the PTC.circle
% depending on image koordinates (x,y)
% color components are of type double (default) in the range [0,1]
global PTC;
radial=5;
tangential=10;
x=x-PTC.circleCenterX;
y=y-PTC.circleCenterY;
r=sqrt(x*x+y*y);
phi=atan2(y,x);
if (r>PTC.circleRadius)
    B=0;
    R=0;
    G=0;
else
    B=phi/pi+1;
    G=sin(radial*pi*r/PTC.circleRadius)^4;
    R=sin(tangential*phi)^4;
end
end