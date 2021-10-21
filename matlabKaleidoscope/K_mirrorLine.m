function mapped = K_mirrorLine()
% reflects points K.x,K.y lying at the right hand side of the line
% updates number of reflections K.r
% returns mapped=true if point changed
global K;
mapped=false;
dx=K.x-K.mirrorX;
% (mirrorDX,mirrorDY) is unit vector pointing in line direction
% (mirrorDY,-mirrorDX) points to its right hand side
d=K.mirrorDY*dx-K.mirrorDX*K.y;
if (d>0)
    mapped=true;
    K.inverted=1-K.inverted;
    K.x=K.x-2*d*K.mirrorDY;
    K.y=K.y+2*d*K.mirrorDX;
end
end

