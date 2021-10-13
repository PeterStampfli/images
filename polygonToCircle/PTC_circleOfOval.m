function [xOut,yOut,isInside] = PTC_circleOfOval(xIn,yIn)
%transform oval coordinates to circle coordinates
%checking if point lies inside the oval
global PTC;
height2=0.5*PTC.ovalHeight;
width=PTC.ovalWidth;
if (xIn<height2)
    yIn=yIn-height2;
    xIn=xIn-height2;
    phi=atan2(yIn,xIn)+PTC.ovalPhase;
    r=sqrt(xIn*xIn+yIn*yIn)/height2;
elseif (xIn>width-height2)
    yIn=yIn-height2;
    xIn=xIn-width+height2;
    phi=atan2(yIn,xIn);
    r=sqrt(xIn*xIn+yIn*yIn)/height2;  
elseif (yIn>height2)
    phi=0.5*pi+(width-xIn)*2/height2-2;
    r=yIn/height2-1
else
    phi=-0.5*pi-(width-xIn)*2/height2-2;
    r=1-yIn/height2;
end
    isInside=(r<=1);
    xOut=r*cos(phi)*PTC.circleRadius+PTC.circleCenterX;
    yOut=r*sin(phi)*PTC.circleRadius+PTC.circleCenterY;
end

