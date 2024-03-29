% create an image of a square *442 tiling
% using an input image
% make it metamorphize

function makeRandom442Tiling()
% make the initial map
s = 1000;
mPix=s*s/1e6;
% total range is 2
% create map of the basic tiling
tilingMap=createIdentityMap(mPix,-1,1,-1,1);
% create the additional modifying map
% get coordinates
x(:,:)=tilingMap(:,:,1);
y(:,:)=tilingMap(:,:,2);
% choose a strength for the metamorphing
metaStrength=0.0;
%=================================
% scaling the metamorphing map, other transformations are possible
x=x*metaStrength;
y=y*metaStrength;

% transform the map into a square 442 tiling
% size typically an integer fraction of 2
numberOfCells=8;
%======================
size=2/numberOfCells;
randomTiling442(tilingMap,size);

% add the modifying map to the tiling map
tilingMap(:,:,1)=tilingMap(:,:,1)+x(:,:);
tilingMap(:,:,2)=tilingMap(:,:,2)+y(:,:);

% create and show the kaleidoscopic image
% read an input image
inputImage = imread("1.jpg");
% fit map inside input image
outputImage = makeOutputImageFitMapToInput(tilingMap, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
