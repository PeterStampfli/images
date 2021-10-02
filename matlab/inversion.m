%matlab
s=1000;
I=eye(s);
m=50;
r=0.5;
for h=1:s
for k=1:s
x=h/s+r;
y=k/s+r;
f=1;
c=0;
while (c<m)&f
x=mod(x,2)-1;
y=mod(y,2);
if (x>1)
x=2-x;
end
if (y>1)
y=2-y;
end
if (y>x)
X=x;
x=y;
y=X;
end
c=c+1;
X=x-1;
d=X*X+y*y;
if (d<r)
y=r*y/d;
x=1-r*X/d;
else
f=0;
end
I(h,k)=min(3,c^0.55);
end
end
end
imshow(I,[])