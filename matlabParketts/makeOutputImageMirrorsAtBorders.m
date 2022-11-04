% makeOutputImageFitMapToInput: create an image using a map and an input image
% outputImage = makeOutputImageMirrorsAtBorders(map, inputImage);
% invalid pixels will have black color
% use imshow(outputImage) to show the image
% use imwrite(outputImage,'imageName.jpg'); to save the image in the
% current folder

% the (x,y)-coordinates of the map are mirrored to stay inside the
% input image: 1 <= x < width of input image, 1 <= y < height of input image

% the map remains unchanged

function outputImage = makeOutputImageMirrorsAtBorders(map,inputImage)
    % determine input image sizes
    [inputHeight, inputWidth, imageLayers] = size(inputImage);
    % size of the output image: same as the map
    [outputHeight, outputWidth] = size(map, [1, 2]);
    % create the limited map
    limitedMap = mirrorsMap(map, inputWidth - 2, inputHeight - 2);
    % get the (x,y) coordinates of the map
    % add 1 because of matlab indexing
    x = limitedMap(:,:,1) + 1; 
    y = limitedMap(:,:,2) + 1;    
    % create the output image
    outputImage = zeros(outputHeight, outputWidth, imageLayers, 'uint8');
    for k = 1:imageLayers 
        outputImage(:,:,k) = uint8(interp2(single(inputImage(:,:,k)), x, y, 'linear', 0)); 
    end     
end