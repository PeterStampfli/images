%SETUP: create cell-, sum- and image arrays
%depending on size of image and size of active cell array
%cells- and sums-array are int32
%image array is int32 (?)
%imageSize and pixelSize have integer values

imageSize = 1000;
nCells = 20;

%determine number of cells, odd number, including border
nCells = 2 * floor(nCells/2) + 5;
cells = zeros(nCells, 'int32');
sums = zeros(nCells, 'int32');
image = zeros(imageSize, 'int32');
