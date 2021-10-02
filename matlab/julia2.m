%matlab
s=1000;
I=ones(s,s);
w=100;
d=w/s;
n=5;
a=2*pi/n;
r=cos(a)+i*sin(a);
b=0.5;
for h=1:s
 for k=1:s
  z=(h-s/2)*d+i*(k-s/2)*d;
  w=0;
  for t=1:n
   w=w+sin(real(z));
   z=r*z;
  end
  I(h,k)=max(-b,min(w,b));
 end
end
imshow(I,[])