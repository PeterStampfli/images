%matlab
s=4000;
I=zeros(s,s);
w=2.2;
d=w/s;
m=200;
r=1.4;
a=-0.26+0.03*i;
n=6;
for h=1:s
 for k=1:s
  z=(h-s/2)*d+i*(k-s/2)*d;
  c=0;
  while (abs(z)<r)&(c<m)
   c=c+1;
   z=z^n+a/z;
  end
   if (c<m)&(c>0)
    I(h,k)=min(2,c^0.4)-1;
   end
 end
end
imshow(I,[])
imwrite(I,"bugs.jpg")