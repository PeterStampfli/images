% makeOutputImageFitMapToInput: create an image using a map and an input image
% outputImage = makeOutputImageFitMapToInput(map, inputImage);
% invalid pixels will have black color
% use imshow(outputImage) to show the image
% use imwrite(outputImage,'imageName.jpg'); to save the image in the
% current folder

% the (x,y)-coordinates of the map are shifted and scaled 
% to fit closely the input image

% the map remains unchanged

function outputImage = makeOutputImageFitMapToInput(map,inputImage)
    % determine input image sizes
    [inputHeight, inputWidth, imageLayers] = size(inputImage);
    % size of the output image: same as the map
    [outputHeight, outputWidth] = size(map, [1, 2]);
    % get the (x,y) coordinates of the map
    x = map(:,:,1); 
    y = map(:,:,2);
    % get ranges of the coordinates
    [xMin,xMax,yMin,yMax]  = getRangeMap(map);
    mapWidth = xMax - xMin;
    mapHeight = yMax - yMin;
    % fit into x=(1...inputWidth-1) and y=(1...inputHeight-1)
    % accounting for correct matlab indexing, we have to use lowest index = 1
    % for safety (linear interpolation) we do not use the last pixel row
    % and column of the input image   
    scale = single(min((inputWidth - 2) / mapWidth, (inputHeight - 2) / mapHeight));
    offsetX = 1 - scale * xMin;
    offsetY = 1 - scale * yMin;
    x = scale * x + offsetX;
    y = scale * y + offsetY;       
    % create the output image
    outputImage = zeros(outputHeight, outputWidth, imageLayers, 'uint8');
    for k = 1:imageLayers 
        outputImage(:,:,k) = uint8(interp2(single(inputImage(:,:,k)), x, y, 'linear', 0)); 
    end     
end