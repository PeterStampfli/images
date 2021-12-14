%make transition and show image

periodicBoundary(cells);
makeSum(cells,weights,sums);

makeTransition(sums, table,cells);
nearestNeighborImage(cells,image);
imshow(image,map);