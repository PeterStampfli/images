function width = getBulatovWidth(a)
%calculate width of Bulatov Oval depending on the 
% interpolation parameter a in [0,1] between circle and band
a=max(0.001,a);
piA4 = pi * a / 4;
width = atanh(tan(piA4))/piA4;
end

