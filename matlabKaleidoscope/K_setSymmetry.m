function  K_setSymmetry(k,n,m)
% set the symmetry of the kaleidoscope
% dihedral symmetry at center, angle between mirror lines: gamma=pi/k
% one mirror line is the x-axis, the second is in the x>0,y>0 quadrant
% between circle and x-axis mirror: alpha=pi/n
% between circle and diagonal mirror: beta=pi/m
global K;
K.maxIterations=100;
K.k=k;
K.gamma=pi/k;
K.alpha=pi/n;
K.beta=pi/m;
% the different symmetries
angleSum=1/k+1/n+1/m;
if (angleSum>1.001)
    K.geometry=0;
elseif (angleSum>0.999)
    K.geometry=1;
else
    K.geometry=2;
end
K.elliptic=0;
K.euklidic=1;
K.hyperbolic=2;
% rotations for dihedral group
K.cos2PiKM=[1:k];
K.sin2PiKM=[1:k];
dAngle=2*pi/k;
K.cos2PiKM(:)=cos(dAngle*K.cos2PiKM(:));
K.sin2PiKM(:)=sin(dAngle*K.sin2PiKM(:));
% define the inverting circle/mirror line
if (K.geometry==1)
    % euklidic geometry with mirror line
    K.mirrorX=0.5;   % is arbitrary, mirror line passes through(mirrorX,0)
    K.mirrorDX=-cos(K.alpha);  % mirror line direction (mirrorDX,mirrorDY)
    K.mirrorDY=sin(K.alpha);
else
    % elliptic or hyperbolic geometry with inverting circle
    % calculation of center for circle radius=1
    centerY=cos(K.alpha);
    centerX=centerY/tan(K.gamma)+cos(K.beta)/sin(K.gamma);
    if (K.geometry==0)
        % elliptic geometry: flip circle center
        % renormalize to get equator radius of 1
        factor=1/sqrt(1-centerX*centerX-centerY*centerY);
        K.circleCenterX=-factor*centerX;
        K.circleCenterY=-factor*centerY;
        K.circleRadius2=factor*factor;
    else
        % hyperbolic geometry: renormalize for poincare radius=1
        factor=1/sqrt(centerX*centerX+centerY*centerY-1);
        K.circleCenterX=factor*centerX;
        K.circleCenterY=factor*centerY;
        K.circleRadius2=factor*factor;
    end
end
end

