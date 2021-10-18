function height = PTC_fitPolygon(nCorners,width)
%optimal placement of a polygon in a rectangle depending on number of
%corners and rectangle width
% sets the polygon and returns the rectangle height
% the polygon has one side parallel to the x-axis;
global PTC;
PTC_setPolygon(nCorners,0,0,1);
[cornersX,cornersY]=PTC_getPolygonCorners();
xMax=max(cornersX);
yMin=min(cornersY);
yMax=max(cornersY);
%  new polygonradius is the same as its scale
% corners fit the right and left borders of the ractangle
radius=width/2/xMax;
centerX=width/2;
centerY=-yMin*radius;
PTC_setPolygon(nCorners,centerX,centerY,radius);
height=round(width/2/xMax*(yMax-yMin)); 
end

