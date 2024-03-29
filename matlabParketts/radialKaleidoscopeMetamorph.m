% create an image of a square *442 tiling
% using an input image
% make it metamorphize

function radialKaleidoscopeMetamorph()
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
metaStrength=-0.4;
%=================================
% find the radial distance
r=x.*x;
r=sqrt(y.*y+r);

% transform the map into a square 442 tiling
% size typically an integer fraction of 2
basicKaleidoscope(tilingMap,6,3,3);

% add the modifying map to the tiling map
tilingMap(:,:,1)=tilingMap(:,:,1)+metaStrength*r(:,:);
tilingMap(:,:,2)=tilingMap(:,:,2);
% create and show the kaleidoscopic image
% read an input image
inputImage = imread("1.jpg");
% fit map inside input image
outputImage = makeOutputImageFitMapToInput(tilingMap, inputImage);
% show (and save) the image
imshow(outputImage);
%imwrite(outputImage,'imageName.jpg');
end
