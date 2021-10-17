function [xOut,yOut] = PTC_polygonToCircle(x,y)
% transform polygon coordinates (x,y) to circle coordinates [xOut,yOut]
% if coordinates (x,y) do not lie inside polygon then output gets very
% large negative values
global PTC;
% transform center to origin, corners at distance 1 from center
x=(x-PTC.polygonCenterX)/PTC.polygonRadius;
y=(y-PTC.polygonCenterY)/PTC.polygonRadius;
%disp(['reduced x,y ',num2str(x),'  ',num2str(y)])
% determine rotation clockwise in multiples of 2pi/nCorners
angle=atan2(y,x)+0.5*pi+PTC.piN;
if (angle<0)
    angle=angle+2*pi;
end
m=floor(0.5*angle/PTC.piN);
%disp(['m ',num2str(m)])
% rotate to sector -pi/2-pi/n<angle<-pi/2+pi/n
if (m>0)
    cosine=PTC.cos2PiNM(m);
    sine=PTC.sin2PiNM(m);
    h=cosine*x+sine*y;
    y=-sine*x+cosine*y;
    x=h;
end
%disp(['rotated x,y ',num2str(x),'  ',num2str(y)])
% test if inside polygon
if(y<-PTC.cosPiN)
    xOut=-100000;
    yOut=-100000;
else
    r=-y/PTC.cosPiN*PTC.circleRadius;
    phi=-pi/2+2*m*PTC.piN-x/y/PTC.tanPiN*PTC.piN;
%disp(['r,phi  ',num2str(r),'  ',num2str(phi)])
    xOut=PTC.circleCenterX+cos(phi)*r;
    yOut=PTC.circleCenterY+sin(phi)*r;
end

