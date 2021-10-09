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

end

