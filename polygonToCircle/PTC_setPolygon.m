function PTC_setPolygon(nCorners,centerX,centerY,radius)
% set the polygon with n corners, center and radius 
% radius is distance of corners from centrum
% basis is at bottom parallel to x-axis
% use inverted y-axis to calculate image coordinates
global PTC;
PTC.polygonNCorners=nCorners;
PTC.polygonCenterX=centerX;
PTC.polygonCenterY=centerY;
PTC.polygonRadius=radius;
% calculate important constants for efficiency
PTC.piN=pi/nCorners;
PTC.cosPiN=cos(pi/nCorners);
PTC.sinPiN=sin(pi/nCorners);
PTC.tanPiN=tan(pi/nCorners);
PTC.cos2PiNM=[1:nCorners];
PTC.sin2PiNM=[1:nCorners];
dAngle=2*pi/nCorners;
PTC.cos2PiNM(:)=cos(dAngle*PTC.cos2PiNM(:));
PTC.sin2PiNM(:)=sin(dAngle*PTC.sin2PiNM(:));
end

