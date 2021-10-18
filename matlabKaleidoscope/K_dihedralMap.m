function  K_dihedralMap()
%makes dihedral map of order K.k on point K.x,K.y
% updates number of reflections K.r
global K;
m=floor(0.5*(atan2(K.y,K.x)/K.piK+1));
m=mod(m,K.k);
if (m>0)
    cosine=K.cos2PiKM(m);
    sine=K.sin2PiKM(m);
    h=cosine*K.x+sine*K.y;
    K.y=-sine*K.x+cosine*K.y;
    K.x=h;
end
if (K.y<0)
    K.y=-K.y;
    K.r=K.r+1;
end

