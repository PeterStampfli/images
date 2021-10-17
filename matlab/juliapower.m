%matlab
s=500;
I=ones(s,s);
w=3;
d=w/s;
m=200;
r=2;
a=0.225+0.01*i;
n=2;
for h=1:s
 for k=1:s
  z=(h-s/2)*d+i*(k-s/2)*d;
  c=0;
  while (abs(z)<r)&(c<m)
   c=c+1;
   p=z^n;
   z=(p*p+a)/(p-a);
  end
   if (c<m)&(c>0)
    I(h,k)=min(2,c^0.4);
   end
 end
end
imshow(I,[])
%imwrite(I,"bugs.jpg")