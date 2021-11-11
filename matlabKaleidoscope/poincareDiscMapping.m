function output = poincareDiscMapping(action, input)
%poincareDiscMapping: Maps the tiled Poincare disc into the basic hyperbolic
% triangle, does also elliptic and euklidic geometry

% The action input parameter determines what the function does:

% action = 0 is for initialization
%  input=[k n m] a vector of integers, determines the symmetries and the
%  basic triangle.
%  output=0
%  k is order of dihedral symmetry at center, pi/k the angle between the
%  straight mirror lines (x-axis and oblique line)
%  n is order of dihedral symmetry arising at x-axis and the third side of
%  the triangle (circle or straight line), angle pi/n
%  m is order of dihedral symmetry arising at the oblique line
%  and the third side of the triangle (circle or straight line), angle pi/n
%  the radius of the poincare disc is equal to 1
%  the radius of the equator in stereographic projection is equal to 1

% action=1 is for the mapping itself.
%  input=[x y inverted], real numbers, will be transformed to
%  output=[x y inverted], which makes porting to C easy
%  (x,y) are coordinates of the point
%  inverted=0 is for an even number of reflections
%  inverted=1 is for an odd number of reflections
%  inverted=-1 is for invalid points (no convergence or outside defined
%  region)

persistent k n m;
persistent cosines sines gamma;
persistent geometry elliptic euklidic hyperbolic;
persistent mirrorX mirrorDX mirrorDY;
persistent circleCenterX circleCenterY circleRadius2;
persistent maxIterations;

switch action
    case 0
        maxIterations=100;
        k = input(1);
        n = input(2);
        m = input(3);

        output = 0;
    case 1

        output = 111;

    otherwise
        output = -1;
end


end
