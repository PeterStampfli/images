%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=2.2;
for k=1:s
    for h=1:s
        z=((k-s/2)-i*(h-30-s/2))*w/s;
        for r=1:6
            z=z^5-0.65*i-0.0001/z^4+0.0001;
        end
        r=real(z);
        a=r^2/20;
        I(h,k,1)=min(0.9,-4*r+0.0025*a);
        I(h,k,2)=min(0.9,-1*r+0.0025*a);
        I(h,k,3)=min(1,3*r+0.0025*a);
    end
end
imshow(I)
%imwrite(I,"coloring.jpg")