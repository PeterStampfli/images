function K_testBasicKaleidoscopeMap()
%test of the basic kaleidoscope
%shows pattern of inversions
global K;
s=400;
width=1;
im=zeros(s,s);
for ix=1:s
    for iy=1:s
        K.x=width*(2*ix/s-1);
        K.y=width*(2*iy/s-1);
        K.inverted=0;
  K_basicKaleidoscopeMap();
  if (K.inverted<0)
      K.inverted=0.5;
  end
        im(iy,ix)=K.inverted;
    end
end
imshow(im)
end

