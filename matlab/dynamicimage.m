%matlab
s=1000;
w=52;
d=w/s;
f=zeros(s,s);
t=12e6;
x=2.1;
y=9.57;
for k=1:t
 h=y+F(x);
 y=-x+F(h);
 x=h;
 X=round(x/d+s/2)-50;
 Y=round(y/d+s/2);
 if (X>0)&(X<=s)&(Y>0)&(Y<=s)
  f(Y,X)=f(Y,X)+1;
 end  
end
imshow(f,[])
function r=F(x)
c=-0.2355;
r=c*x+2*(1-c)*x*x/(1+x*x);
end