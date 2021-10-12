%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=2.2;
for h=1:s
    for k=1:s
        z=((h+30-s/2)+i*(k-s/2))*w/s;
        for r=1:4
            z=z*z*z*z-0.435/z;
        end
        r=real(z);
        a=r^2/10;
        
        R=min(0.9,1*r+0.0025*a);
        B=-0.9*r+0.0025*a;
        G=min(0.9,B/5);
        I(h,k,1)=R;
        I(h,k,2)=G;
        I(h,k,3)=B;
    end
end
imshow(I)
%imwrite(I,"coloring.jpg")