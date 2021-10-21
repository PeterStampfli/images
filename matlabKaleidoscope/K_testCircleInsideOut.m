function K_testCircleInsideOut()
%test of dihedral symmetry
%shows pattern of reflections
global K;
s=400;
im=zeros(s,s);
for ix=1:s
    for iy=1:s
        K.x=2*ix/s-1;
        K.y=2*iy/s-1;
        K.inverted=0;
  %      K_circleInsideOut();
  %      K_circleOutsideIn();
  K_mirrorLine();
        im(iy,ix)=K.inverted;
    end
end
imshow(im)
end

