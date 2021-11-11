function  mapped=K_dihedralMap()
% makes dihedral map of order K.k on point K.x,K.y
% updates number of reflections K.r
% returns mapped=true if point changed
global K;
mapped=false;
m=floor(0.5*(atan2(K.y,K.x)/K.gamma+1));
m=mod(m,K.k);
if (m>0)
    cosine=K.cos2PiKM(m);
    sine=K.sin2PiKM(m);
    h=cosine*K.x+sine*K.y;
    K.y=-sine*K.x+cosine*K.y;
    K.x=h;
    mapped=true;
end
if (K.y<0)
    K.y=-K.y;
    K.inverted=1-K.inverted;
    mapped=true;
end

