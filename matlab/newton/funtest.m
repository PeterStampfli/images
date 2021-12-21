a=3;
n=5;
rs=roots(n,a);
[~,s]=size(rs);
one=ones(1,s);

z=2+i;

fun=z^n-a
facts=one*z-rs;
funp=prod(facts)
dfunf=n*z^(n-1)/fun
dfunfp=-sum(one./(rs-z))
