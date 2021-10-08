s=990;
d=1.9/s;
f=zeros(s,s,3);
z=0.2*i;
t=2e7;
for k=1:t
c=conj(z);
z=(-2.3+2.5*z*c)*z-0.75*c^4;  
X=round(real(z)/d+s/2)+20;
Y=round(imag(z)/d+s/2);
if (X>0)&(X<=s)&(Y>0)&(Y<=s)
c=f(X,Y,:);
if (c(2)>255)
c(3)=c(3)+1;
else
if (c(1)>255)
c(2)=c(2)+2;
else
c(1)=c(1)+9;
end
end
f(X,Y,:)=c;
end  
end
imshow(f)