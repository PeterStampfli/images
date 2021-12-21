%make transition and show image
% using linear interpolated image

periodicBoundary(cells);
makeSum(cells,weights,sums);

makeTransition(sums, table,cells);
linearInterpolatedImage(cells,image,imageFactor);
imshow(image,map);