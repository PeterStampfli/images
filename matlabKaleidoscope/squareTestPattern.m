function [R,G,B] = squareTestPattern(x,y)
    delta = 0.1;
    bigDelta = 0.5;
    B=cos(x*pi/bigDelta)^4+cos(y*pi/bigDelta)^4;
    G=(cos(x*pi/delta))^4;
    R=(cos(y*pi/delta))^4;     
end