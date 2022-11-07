% create an image of a square *442 tiling
% using an input image
% make it metamorphize

function zSquareTiling442Metamorph()
% make the initial map
s = 2000;
mPix=s*s/1e6;
% total range is 2
% create map of the basic tiling
tilingMap=createIdentityMap(mPix,-1,1,-1,1);

% create the additional modifying map
% get coordinates
x(:,:)=tilingMap(:,:,1);
y(:,:)=tilingMap(:,:,2);
% choose a strength for the metamorphing
metaStrength=0.2;
%=================================


% transform the map into a square 442 tiling
% size typically an integer fraction of 2
numberOfCells=16;
%======================
size=2/numberOfCells;
tiling442(tilingMap,size);
h=2*metaStrength*x.*y;
% add the modifying map to the tiling map
tilingMap(:,:,1)=h(:,:)+tilingMap(:,:,1);
x=metaStrength*x.*x;
y=-metaStrength*y.*y;
tilingMap(:,:,2)=x(:,:)+y(:,:)+tilingMap(:,:,2);
% create and show the kaleidoscopic image
% read an input image
inputImage = imread("3.jpg");
% fit map inside input image
outputImage = makeOutputImageFitMapToInput(tilingMap, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
