%matlab
s=1000;
w=2.8;
d=w/s;
f=zeros(s,s);
l=-2.608+0.01*i;
a=2.5;
b=-0.35;
g=0.325;
z=0.1+0.1*i;
t=1e7;
m=1;
n=5;
for k=1:t
c=conj(z);
z=(l+a*z*c+b*real(z^n))*z+g*c^(n-1);  
X=round(real(z)/d+s/2);
Y=round(imag(z)/d+s/2);
if (X>0)&(X<=s)&(Y>0)&(Y<=s)
f(Y,X)=f(Y,X)+1/(m+f(Y,X));
end  
end
imshow(f,[])