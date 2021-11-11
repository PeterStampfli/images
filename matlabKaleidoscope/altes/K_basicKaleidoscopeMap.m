function K_basicKaleidoscopeMap()
% make the elliptic/euklidic/hyperbolic kaleidoscope map
% maps (K.x,K.y)
% k.inverted==1 for a mirror image, ==0 for translated/rotated image
% K.inverted<0 for points without mapping/invalid (lying outside)
global K;
% return if point invalid anyway
if (K.inverted<0)
    return;
end
% only inside of poincare disc for hyperbolic kaleidoscope
if (K.geometry==K.hyperbolic)&(K.x*K.x+K.y*K.y>1)
    K.inverted=-1;
    return;
end
% make dihedral map to put point in first sector and be able to use
% inversion/mirror
K_dihedralMap();
for k=1:K.maxIterations
    % inversion/mirror, if no mapping we have finished, and return
    switch K.geometry
        case K.hyperbolic
            if (~K_circleInsideOut())
                return;
            end
        case K.euklidic
            if (~K_mirrorLine())
                return;
            end
        case K.elliptic
            if (~K_circleOutsideIn())
                return;
            end
    end
    % dihedral symmetry if no mapping we have finished, and return
    if (~K_dihedralMap())
        return;
    end
end
% fail after doing maximum repetitions
K.inverted=-1;
end

