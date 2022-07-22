inputImage = imread("test1small.JPG");
[inputHeight, inputWidth, imageLayers] = size(inputImage);
s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
basicKaleidoscope(map,5,4,2);
[xMin, xMax, yMin, yMax] = getRangeMap(map);
mapWidth = xMax - xMin;
mapHeight = yMax - yMin;
scale = single(min((inputWidth - 1) / mapWidth, (inputHeight - 1) / mapHeight));
[outputHeight, outputWidth] = size(map, [1, 2]);

mapX = scale * (map(:,:,1) - xMin) + 1;
mapY = scale * (map(:,:,2) - yMin) + 1;

outputImage = zeros(outputHeight, outputWidth, imageLayers, 'uint8');

for k = 1:imageLayers 
    outputImage(:,:,k)  = uint8(interp2(single(inputImage(:,:,k)), mapX, mapY, 'linear', 0)); 
end                      


imshow(outputImage);
