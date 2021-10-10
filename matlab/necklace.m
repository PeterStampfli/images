%matlab
s=1000;
I=zeros(s,s);
w=2.4;
m=50;
r=1.4;
a=-0.22+0*i;
n=4;
for h=1:s
 for k=1:s
  z=((h-s/2)+i*(k-s/2))*w/s;
  c=0;
  while (abs(z)<r)&(c<m)
   c=c+1;
   z=z^n+a/z^(n-1);
  end
   if (c>0)
    I(h,k)=min(2,c^0.3)-1;
   end
 end
end
imshow(I,[])
%imwrite(I,"bugs.jpg")