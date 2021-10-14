%matlab doodle
%coloring book of complex function representations, Barnes
s=1000;
I=ones(s,s,3);
w=52/s;
r=sqrt(3)/2;
f=0.75;
for k=1:s
        x=(k-s/2)*w;
    for h=1:s
        y=(h-s/2)*w;
        I(h,k,1)=f*(1+cos(x)+cos(y));
        I(h,k,2)=f*(1+cos(0.5*x+r*y)+cos(r*x-0.5*y));
        I(h,k,3)=f*(1+cos(0.5*x-r*y)+cos(r*x+0.5*y));
    end
end
imshow(I)
%imwrite(I,"pentarat.jpg")