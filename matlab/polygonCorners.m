function [cornersX,cornersY] = makePolygon(n,centerX,centerY,radius,angle)
cornersX=[1:(n+1)];
cornersY=[1:(n+1)];
cornersX(:)=cos(2*pi*cornersX(:)/n+angle)*radius+centerX;
cornersY(:)=sin(2*pi*cornersY(:)/n+angle)*radius+centerY;
end

