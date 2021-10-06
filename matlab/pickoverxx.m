%matlab
s=1000;
w=2.8;
d=w/s;
f=zeros(s,s);
l=1.5;
a=-1;
b=0.1;
g=-0.805;
z=0.1+0.1*i;
t=1e7;
m=1;
n=3;
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