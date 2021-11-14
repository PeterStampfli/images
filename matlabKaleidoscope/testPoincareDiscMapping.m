function testPoincareDiscMapping(k, n, m)
%test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
%shows pattern of inversions
poincareDiscMapping(0, [k, n, m]);
s = 200;
width = 1;
im = zeros(s, s);
for iy = 1:s
    y = width * (2 * iy / s - 1);
    for ix = 1:s
        x = width * (2 * ix / s - 1);
        inverted = 0;
        result = poincareDiscMapping(1, [x, y, inverted]);
        inverted = result(3);
        if (inverted < 0)
            inverted = 0.5;
        end
        im(iy, ix) = inverted;
    end
end
imshow(im)
end
