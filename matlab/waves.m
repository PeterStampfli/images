%matlab
s=1000;
I=ones(s,s);
w=2.2;
d=w/s;
m=120;
r=1.4;
a=0.15+0.17*i;
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
    I(h,k)=min(sqrt(c),3);
   end
 end
end
imshow(I,[])