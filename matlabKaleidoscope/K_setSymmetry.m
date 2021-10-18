function  K_setSymmetry(k)
% set the symmetry of the kaleidoscope
% dihedral symmetry
global K;
K.k=k;
K.piK=pi/k;
K.cos2PiKM=[1:k];
K.sin2PiKM=[1:k];
dAngle=2*pi/k;
K.cos2PiKM(:)=cos(dAngle*K.cos2PiKM(:));
K.sin2PiKM(:)=sin(dAngle*K.sin2PiKM(:));
end

