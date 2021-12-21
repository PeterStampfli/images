function result = roots(n,x)
%calculate vector of n-th roots of given (complex) number
result=(1:n);
result=x*exp(result*2*pi/n*i);
end

