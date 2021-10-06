%matlab
s=1000;
I=zeros(s,s);
w=2.4;
d=w/s;
m=50;
r=1.4;
a=-0.3018+0.1*i;
n=5;
for h=1:s
 for k=1:s
  z=(h-s/2)*d+i*(k-s/2)*d;
  c=0;
  while (abs(z)<r)&(c<m)
   c=c+1;
   z=z^n-a/z^2;
  end
   if (c<m)&(c>0)
    I(h,k)=min(2,c^0.3)-1;
   end
 end
end
imshow(I,[])
%imwrite(I,"bugs.jpg")