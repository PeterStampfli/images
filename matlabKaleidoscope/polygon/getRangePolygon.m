function [xMin, xMax, yMin, yMax] = getRangePolygon(n)
% return range of (x,y) values for regular polygon with n corners
% radius 1, center at origin
% symmetric with respect to y-axis
% one side of polygon is parallel to x-axis at y<0
dAngle=2*pi/n;
cornersX=[1:n];
cornersY=[1:n];
cornersX(:)=cos(-pi/2+dAngle*(-3/2+cornersX(:)));
cornersY(:)=sin(-pi/2+dAngle*(-3/2+cornersY(:)));
xMin=min(cornersX);
xMax=max(cornersX);
yMin=min(cornersY);
yMax=max(cornersY);
end

