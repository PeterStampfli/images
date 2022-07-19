function [R,G,B] = circleTestPattern(x,y)
    radial=5;
    tangential=10;
    r=sqrt(x*x+y*y);
    phi=atan2(y,x);
    if (r>1)
        B=255;
    else 
        B=0;
    end
    G=floor(255*(sin(radial*pi*r))^4);
    R=floor(255*(sin(tangential*phi))^4);     
end