function iterate()
%make transition and show image
global sums cells table weights;
global interpolation colorMap;

switch (boundary)
    case -1
        periodicBoundary(cells);
    case 0
        setBoundary(cells, 0);
    case 1
        setBoundary(cells, 1);
    otherwise
        table = sawtoothTable(nStates, weights);
end
makeSum(cells, weights, sums);
makeTransition(sums, table, cells);
% use periodic boundary for interpolation
switch (interpolation)
    case 1
        nearestNeighborImage(cells, image);
    case 2
        periodicBoundary(cells);
        linearInterpolatedImage(cells, image);
    case 3
        periodicBoundary(cells);
        cubicInterpolatedImage(cells, image);
    otherwise
        nearestNeighborImage(cells, image);
end
imshow(image, colorMap);
end