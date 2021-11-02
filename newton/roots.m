function result = roots(n,x)
%calculate vector of n-th roots of given (complex) number
r=x^(1/n);
result=(1:n);
result=r*exp(result*2*pi/n*i);
end

