function [cells, sums, image] = setup(imageSize, pixelSize)
%SETUP: create cell-, sum- and image arrays
%depending on size of image and size of "pixel" that shows a cell
%cells- and sums-array are int32
%image array is int32 (?)
%imageSize and pixelSize have integer values

%determine number of cells, odd number, including border
nCells = 2*floor((imageSize/pixelSize-1)/2)+5;
cells=zeros(nCells,'int32');
sums=zeros(nCells,'int32');
image=zeros(nCells-4,'int32');


end
