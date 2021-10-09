function [cornersX,cornersY] = PTC_getPolygonCorners()
% return corners of polygon defined in PTC
% first corner is repeated at end for easy plot
global PTC;
n=PTC.polygonNCorners;
r=PTC.polygonRadius;
cx=PTC.polygonCenterX;
cy=PTC.polygonCenterY;
dAngle=2*pi/n;
cornersX=[1:(n+1)];
cornersY=[1:(n+1)];
cornersX(:)=cx+r*cos(-pi/2+dAngle*(-3/2+cornersX(:)));
cornersY(:)=cy+r*sin(-pi/2+dAngle*(-3/2+cornersY(:)));
end

