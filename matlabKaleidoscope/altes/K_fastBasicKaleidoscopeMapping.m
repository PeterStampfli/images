function K_fastBasicKaleidoscopeMapping(initialize)
% make the elliptic/euklidic/hyperbolic kaleidoscope map
% maps (K.x,K.y)
% k.inverted==1 for a mirror image, ==0 for translated/rotated image
% K.inverted<0 for points without mapping/invalid (lying outside)
global K;
persistent k cosines sines gamma;
persistent geometry elliptic euklidic hyperbolic;
persistent maxIterations;
persistent mirrorX mirrorDX mirrorDY;
persistent circleCenterX circleCenterY circleRadius2;
if (initialize)
    k = K.k;
    gamma = K.gamma;
    cosines = K.cos2PiKM;
    sines = K.sin2PiKM;
    geometry = K.geometry;
    elliptic = K.elliptic;
    euklidic = K.euklidic;
    hyperbolic = K.hyperbolic;
    maxIterations = K.maxIterations;
    if (geometry == euklidic)
        mirrorX = K.mirrorX;
        mirrorDX = K.mirrorDX;
        mirrorDY = K.mirrorDY;
    else
        circleCenterX = K.circleCenterX;
        circleCenterY = K.circleCenterY;
        circleRadius2 = K.circleRadius2;
    end
    return
end
% do the mapping
% use simple variables instead of struct fields
inverted = K.inverted;
% return if point invalid anyway
if (inverted < 0)
    return;
end
x = K.x;
y = K.y;
switch geometry
    case hyperbolic
        % invalid if outside of poincare disc for hyperbolic kaleidoscope
        if (x * x + y * y > 1)
            K.inverted = -1;
            return;
        end
        % make dihedral map to put point in first sector and be able to use
        % inversion/mirror
        m = floor(0.5*(atan2(y, x) / gamma + 1));
        m = mod(m, k);
        if (m > 0)
            cosine = cosines(m);
            sine = sines(m);
            h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
        end
        if (y < 0)
            y = -y;
            inverted = 1 - inverted;
        end
        for iter = 1:maxIterations
            % inversion, if no mapping we have finished, and return
            dx = x - circleCenterX;
            dy = y - circleCenterY;
            d2 = dx * dx + dy * dy;
            if (d2 < circleRadius2)
                inverted = 1 - inverted;
                factor = circleRadius2 / d2;
                x = circleCenterX + factor * dx;
                y = circleCenterY + factor * dy;
            else
                K.x = x;
                K.y = y;
                K.inverted = inverted;
                return;
            end
            % dihedral symmetry if no mapping we have finished, and return
            m = floor(0.5*(atan2(y, x) / gamma + 1));
            m = mod(m, k);
            if (m > 0)
                cosine = cosines(m);
                sine = sines(m);
                h = cosine * x + sine * y;
                y = -sine * x + cosine * y;
                x = h;
                if (y < 0)
                    y = -y;
                    inverted = 1 - inverted;
                end
            else
                if (y < 0)
                    y = -y;
                    inverted = 1 - inverted;
                else
                    K.x = x;
                    K.y = y;
                    K.inverted = inverted;
                    return;
                end
            end
        end
        % fail after doing maximum repetitions
        K.inverted = -1;
    case elliptic

    case euklidic


end


% fail after doing maximum repetitions
K.inverted = -1;
end
