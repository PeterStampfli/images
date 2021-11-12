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
persistent cosines sines gamma alpha beta;
persistent geometry elliptic euklidic hyperbolic;
persistent mirrorX mirrorNormalX mirrorNormalY;
persistent circleCenterX circleCenterY circleRadius2;
persistent maxIterations;

switch action
    case 0
        % initialization, setting up the geometry
        maxIterations = 100;
        k = input(1);
        n = input(2);
        m = input(3);
        % different geometries
        elliptic = 0;
        euklidic = 1;
        hyperbolic = 2;
        gamma = pi / k;
        alpha = pi / n;
        beta = pi / m;
        angleSum = 1 / k + 1 / n + 1 / m;
        if (angleSum > 1.001)
            geometry = 0;
        elseif (angleSum > 0.999)
            geometry = 1;
        else
            geometry = 2;
        end
        % rotation matrices for the dihedral group at the center
        cosines = [1:k];
        sines = [1:k];
        dAngle = 2 * pi / k;
        cosines(:) = cos(dAngle*cosines(:));
        sines(:) = sin(dAngle*sines(:));
        % define the inverting circle/mirror line
        if (geometry == 1)
            % euklidic geometry with mirror line
            mirrorX = 0.5; % is arbitrary, mirror line passes through (mirrorX,0)
            % normal vector to the mirror line, pointing outside
            mirrorNormalX = sin(alpha);
            mirrorNormalY = cos(alpha);
        else
            % elliptic or hyperbolic geometry with inverting circle
            % calculation of center for circle radius=1
            centerY = cos(alpha);
            centerX = centerY / tan(gamma) + cos(beta) / sin(gamma);
            if (geometry == 0)
                % elliptic geometry: flip circle center
                % renormalize to get equator radius of 1 in stereographic
                % projection
                factor = 1 / sqrt(1-centerX*centerX-centerY*centerY);
                circleCenterX = -factor * centerX;
                circleCenterY = -factor * centerY;
                circleRadius2 = factor * factor;
            else
                % hyperbolic geometry: renormalize for poincare radius=1
                factor = 1 / sqrt(centerX*centerX+centerY*centerY-1);
                circleCenterX = factor * centerX;
                circleCenterY = factor * centerY;
                circleRadius2 = factor * factor;
            end
            output = 0;
        end
    case 1
        % do the mapping
        x = input(1);
        y = input(2);
        inverted = input(3);
        % if already invalid due to some failing projection: do nothing
        if (inverted < 0)
            output = [x, y, -1];
            return;
        end
        % invalid if outside of poincare disc for hyperbolic kaleidoscope
        if (geometry == hyperbolic) && (x * x + y * y > 1)
            output = [x, y, -1];
            return;
        end
        % make dihedral map to put point in first sector and be able to use
        % inversion/mirror
        rotation = mod(floor(0.5*(atan2(y, x) / gamma + 1)), k);
        if (rotation > 0)
            cosine = cosines(rotation);
            sine = sines(rotation);
            h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
        end
        if (y < 0)
            y = -y;
            inverted = 1 - inverted;
        end
        for iter = 1:maxIterations
            switch geometry
                case hyperbolic
                    % inversion inside-out at circle,
                    % if no mapping we have finished, and return
                    dx = x - circleCenterX;
                    dy = y - circleCenterY;
                    d2 = dx * dx + dy * dy;
                    if (d2 < circleRadius2)
                        inverted = 1 - inverted;
                        factor = circleRadius2 / d2;
                        x = circleCenterX + factor * dx;
                        y = circleCenterY + factor * dy;
                    else
                        output = [x, y, inverted];
                        return;
                    end
                case elliptic
                    % inversion outside-in at circle,
                    % if no mapping we have finished, and return
                    dx = x - circleCenterX;
                    dy = y - circleCenterY;
                    d2 = dx * dx + dy * dy;
                    if (d2 > circleRadius2)
                        inverted = 1 - inverted;
                        factor = circleRadius2 / d2;
                        x = circleCenterX + factor * dx;
                        y = circleCenterY + factor * dy;
                    else
                        output = [x, y, inverted];
                        return;
                    end
                case euklidic
                    % reflect point at mirror line if it is at the right
                    % hand side
                    d = (x - mirrorX) * mirrorNormalX + y * mirrorNormalY;
                    if (d > 0)
                        inverted = 1 - inverted;
                        d = d + d;
                        x = x - d * mirrorNormalX;
                        y = y - d * mirrorNormalY;
                    else
                        output = [x, y, inverted];
                        return;
                    end
            end
            % dihedral symmetry if no mapping we have finished, and return
            rotation = mod(floor(0.5*(atan2(y, x) / gamma + 1)), k);
            if (rotation > 0)
                % we have a rotation and can't return
                cosine = cosines(rotation);
                sine = sines(rotation);
                h = cosine * x + sine * y;
                y = -sine * x + cosine * y;
                x = h;
                if (y < 0)
                    % an additional mirroring
                    y = -y;
                    inverted = 1 - inverted;
                end
            else
                % no rotation
                if (y < 0)
                    % mirror symmetry at the x-axis, can't return
                    y = -y;
                    inverted = 1 - inverted;
                else
                    % no mapping, it's finished
                    output = [x, y, inverted];
                    return;
                end
            end
            % fail after doing maximum repetitions
            output = [x, y, -1];
        end
    otherwise
        % unknown/illegal action
        error("poincareDiscMapping: Unknown action, value = %d", action);
end
