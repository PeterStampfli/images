%matlab doodle
%coloring book of complex function representations, Barnes
s=500;
I=zeros(s,s);
w=4;
for h=1:s
    for k=1:s
        z=((k-s/2)-i*(h-s/2))*w/s;
        for r=1:4
            p=z^5;
            z=(p+1)/(p-1+0.1*i);
        end
        r=real(w);
        a=0.0001*r^2;
        if(real(z)>0)
            I(h,k)=1;
        end
        I(h,k)=0.5+100*real(z);
    end
end
imshow(I)
%imwrite(I,"pentarat.jpg")