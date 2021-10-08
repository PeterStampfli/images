s=990;
d=2.8/s;
f=zeros(s,s,3);
z=0.2*i;
t=1e6;
for k=1:t
c=conj(z);
z=(1.5-0.95*z*c+0.12*real(z^3))*z-0.8*c^2;  
X=round(real(z)/d+s/2);
Y=round(imag(z)/d+s/2);
if (X>0)&(X<=s)&(Y>0)&(Y<=s)
c=f(X,Y,:);
if (c(1)>255)
c(2)=c(2)+1;
else
if (c(3)>255)
c(1)=c(1)+2;
else
c(3)=c(3)+9;
end
end
f(X,Y,:)=c;
end  
end
imshow(f)