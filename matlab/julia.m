%matlab
s=1000;
I=ones(s,s);
w=2.5;
d=w/s;
m=20;
r=1.4;
a=-1.3+0.2*i;
n=6;
for h=1:s
 for k=1:s
  z=(h-s/2)*d+0.1+i*(k-s/2)*d;
  c=0;
  while (abs(z)<r)&(c<m)
   c=c+1;
   z=z^n+a*z;
  end
   if (c<m)&(c>0)
    I(h,k)=mod(c,2);
   end
 end
end
imshow(I,[])