%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=5.2;
for h=1:s
    for k=1:s
        z=((k-s/2)-i*(h-s/2))*w/s;
        for r=1:4
            p=z^5;
            z=(p+1)/(p-1+0.2*i);
        end
        I(h,k,1)=0.5+100*real(z);
        I(h,k,2)=0.4+real(z)/6;
        I(h,k,3)=0.5-200*real(z);
    end
end
imshow(I)
%imwrite(I,"pentarat.jpg")