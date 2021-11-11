function mapped = K_circleInsideOut()
% maps points K.x,K.y lying in the circle to the outside
% updates number of reflections K.r
% returns mapped=true if point changed
global K;
mapped=false;
dx=K.x-K.circleCenterX;
dy=K.y-K.circleCenterY;
d2=dx*dx+dy*dy;
if (d2<K.circleRadius2)
    mapped=true;
    K.inverted=1-K.inverted;
    factor=K.circleRadius2/d2;
    K.x=K.circleCenterX+factor*dx;
    K.y=K.circleCenterY+factor*dy;
end
end

