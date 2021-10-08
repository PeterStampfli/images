function a=PTC_setCircle(centerX,centerY,radius)
% set center and radius of circle
% PTC is a struct with all data for polygon to circle
% conversion
% PTC_someFunction() is some function for this purpose
global PTC;
PTC.circleCenterX=centerX;
PTC.circleCenterY=centerY;
PTC.circleRadius=radius;
end