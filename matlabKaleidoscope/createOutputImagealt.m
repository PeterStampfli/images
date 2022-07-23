% createOutputImage: create an image using a map and an input image
% outputImage = createOutputImage(map, inputImage);
% invalid pixels will have black color
% use imshow(outputImage) to show the image
% use imwrite(outputImage,'imageName.jpg'); to save the image in the
% current folder

function outputImage = createOutputImage(map,inputImage)
    % determine image sizes
    [inputHeight, inputWidth, imageLayers] = size(inputImage);
    [outputHeight, outputWidth] = size(map, [1, 2]);
    % determine scaling to fit the map to the input image
    [xMin, xMax, yMin, yMax] = getRangeMap(map);
    mapWidth = xMax - xMin;
    mapHeight = yMax - yMin;
    scale = single(min((inputWidth - 1) / mapWidth, (inputHeight - 1) / mapHeight));
    % do the mapping
    offsetX = 1 - scale * xMin;
    offsetY = 1 - scale * yMin;
    mapX = scale * map(:,:,1) + offsetX;
    mapY = scale * map(:,:,2) + offsetY;
    % create the output image
    outputImage = zeros(outputHeight, outputWidth, imageLayers, 'uint8');
    for k = 1:imageLayers 
        outputImage(:,:,k)  = uint8(interp2(single(inputImage(:,:,k)), mapX, mapY, 'linear', 0)); 
    end     
end