s=1000;
w=52;
d=w/s;
f=zeros(s,s);
t=11000000;
x=2.1;
y=9.57;
for k=1:t
   h= y+F(x);
   y=-x+F(h);
   x=h;
   ix=round(x/d+s/2)-50;
   iy=round(y/d+s/2);
   if (ix>0)&(ix<=s)&(iy>0)&(iy<=s)
       f(iy,ix)=f(iy,ix)+1;
   end  
end
imshow(f,[])
function r=F(x)
c=-0.2355;
r=c*x+2*(1-c)*x*x/(1+x*x);
end