function testFastPoincareDiscMapping(k, m, n)
tic;
%test of the basic kaleidoscope
% depending on symmetry paraameters k, n and m
%shows pattern of inversions
fastPoincareDiscMapping(0, k, m, n);
poincareDiscMapping(0,[ k, m, n]);
s = 200;
width = 1;
im = zeros(s, s);
for iy = 1:s
    y = width * (2 * iy / s - 1);
    for ix = 1:s
        x = width * (2 * ix / s - 1);
        inverted = 0;
        result = fastPoincareDiscMapping(1, single([x, y, 0]));
            goodResult = poincareDiscMapping(1, [x, y, 0]);
        if (goodResult(3)~=result(3))
           % [x,y]
          %  result
          %  goodResult
        end
        inverted = result(3);
        if (inverted < 0)
            inverted = 0.5;
        end
        im(iy, ix) = inverted;
    end
end
toc;
imshow(im)
end
