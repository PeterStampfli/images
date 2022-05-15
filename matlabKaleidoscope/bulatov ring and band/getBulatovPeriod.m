function period = getBulatovPeriod(k, m, n)
%calculate width of Bulatov Oval depending on the
% geometry parameter k, m, n
%  k is order of dihedral symmetry at center, pi/k the angle between the
%  straight mirror lines (x-axis and oblique line), k<=100 !
%  m is order of dihedral symmetry arising at the oblique line
%  and the third side of the triangle (circle or straight line), angle pi/n
%  n is order of dihedral symmetry arising at x-axis and the third side of
% n has to be equal to zero, the geometry has to be hyperbolic
if n ~= 2
    error("getBulatovPeriod: n is not equal to 2, instead it is %i.", n);
end
gamma = pi / k;
alpha = pi / n;
beta = pi / m;
angleSum = 1 / k + 1 / n + 1 / m;
if (angleSum > 0.999)
    error("getBulatovPeriod: Geometry has to be periodic, it isn't.");
end
% assuming circle r=1, circle is on x-axis
center = cos(beta) / sin(gamma);
% renormalize to poincare radius 1 (devide by poincare radius)
radius = 1 / sqrt(center*center-1);
center = radius * center;
if (mod(k, 2) == 0)
    period = 8 / pi * atanh(center-radius);
else
    % intersection of circle with oblique line
    angle = pi * (0.5 - 1 / k - 1 / m);
    a = sqrt(center*center+radius*radius-2*center*radius*cos(angle));
    period = 8 / pi * (atanh(center-radius) + atanh(a));
end
end
