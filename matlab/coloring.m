%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=2.6;
for h=1:s
    for k=1:s
        z=((h+100-s/2)+i*(k-s/2))*w/s;
        for r=1:6
            z=z*z-0.6/z;
        end
        r=real(z);
        a=abs(r);
        a=r^2/10;
        
        R=0.5*r+0.01*a;
        B=0.00004*a;
        G=-0.3*r+0.01*a;
        I(h,k,1)=R;
        I(h,k,2)=G;
        I(h,k,3)=B;
    end
end
imshow(I)
imwrite(I,"coloring.jpg")