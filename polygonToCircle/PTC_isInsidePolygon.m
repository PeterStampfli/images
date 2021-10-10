function  ok = PTC_isInsidePolygon(x,y)
% return true if point (x,y) is inside the polygon
% use for test of rotations
global PTC;
% transform center to origin, corners at distance 1 from center
x=(x-PTC.polygonCenterX)/PTC.polygonRadius;
y=(y-PTC.polygonCenterY)/PTC.polygonRadius;
% determine rotation clockwise in multiples of 2pi/nCorners
% rotate to sector -pi/2-pi/n<angle<-pi/2+pi/n
angle=atan2(y,x)+0.5*pi+PTC.piN;
if (angle<0)
    angle=angle+2*pi;
end
m=floor(0.5*angle/PTC.piN);
if (m>0)
    cosine=PTC.cos2PiNM(m);
    sine=PTC.sin2PiNM(m);
    h=cosine*x+sine*y;
    y=-sine*x+cosine*y;
    x=h;
end
ok=(y>-PTC.cosPiN);
end

