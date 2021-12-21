a=1;
n=3;
rs=roots(n,a)
[~,s]=size(rs);
one=ones(1,s);
eps=0.01;
itemax=100;

z=10i;
iter=0;
minerr=1;
while (minerr>eps)&&(iter<itemax)
iter=iter+1;
deltas=rs-z;
z=z+1/sum(one./deltas);

[minerr,iminerr]=min(abs(deltas));

end
z
iminerr
iter
