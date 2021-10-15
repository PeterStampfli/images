function [xOut,yOut] = PTC_polygonToCircle(x,y)
% transform polygon coordinates (x,y) to circle coordinates [xOut,yOut]
% if coordinates (x,y) do not lie inside polygon then output gets very
% large negative values
global PTC;
% transform center to origin, corners at distance 1 from center
x=(x-PTC.polygonCenterX)/PTC.polygonRadius;
y=(y-PTC.polygonCenterY)/PTC.polygonRadius;
% determine rotation clockwise in multiples of 2pi/nCorners
angle=atan2(y,x)+0.5*pi+PTC.piN;
if (angle<0)
    angle=angle+2*pi;
end
m=floor(0.5*angle/PTC.piN);
% rotate to sector -pi/2-pi/n<angle<-pi/2+pi/n
if (m>0)
    cosine=PTC.cos2PiNM(m);
    sine=PTC.sin2PiNM(m);
    h=cosine*x+sine*y;
    y=-sine*x+cosine*y;
    x=h;
end
% test if inside polygon
if(y<-PTC.cosPiN)
    xOut=-100000;
    yOut=-100000;
else
    xOut=0;
    yOut=0;
end

