%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=2.45;
for k=1:s
    for h=1:s
        z=((k-s/2)-i*(h+100-s/2))*w/s;
        for r=1:5
            z=z*z*z;
            z=z-i-0.0001/z-0.001;
        end
        r=real(z);
        a=r^2/10;
        
        B=min(1,3*r+0.0025*a);
        R=min(0.9,-4*r+0.0025*a);
        G=min(0.9,-1*r+0.0025*a);
        I(h,k,1)=R;
        I(h,k,2)=G;
        I(h,k,3)=B;
    end
end
imshow(I)
%imwrite(I,"coloring.jpg")