%matlab
s=99;
I=zeros(s,s);
I(50,50)=1;
J=I;
n=9;
g=3000;

for G=1:g
for h=2:s-1
 for k=2:s-1
 z=I(h,k)+I(h-1,k)+I(h+1,k)+I(h,k-1)+I(h,k+1);
 z=2*z+I(h-1,k-1)+I(h+1,k-1)+I(h-1,k+1)+I(h+1,k+1);
 %z=2;
 J(h,k)=mod(z,n);
 end
end
I=J;
end
s=10*s;
%I=ones(s,s);
K=zeros(s,s);
for h=1:s
 for k=1:s
 K(h,k)=I(1+floor(h/10-0.1),1+floor(k/10-0.1));
 end
end
imshow(K,[])