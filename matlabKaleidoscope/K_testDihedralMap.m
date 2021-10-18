function K_testDihedralMap()
%test of dihedral symmetry
%shows pattern of reflections
global K;
s=400;
im=zeros(s,s);
for ix=1:s
    for iy=1:s
        K.x=ix-s/2;
        K.y=iy-s/2;
        K.r=0;
        K_dihedralMap();
        im(iy,ix)=K.r;
    end
end
imshow(im)
end

