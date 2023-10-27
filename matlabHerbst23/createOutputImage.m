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
    [mapX, mapY] = vm2NaNNorm2(map,[inputHeight, inputWidth]);
    % create the output image
    outputImage = zeros(outputHeight, outputWidth, imageLayers, 'uint8');
    for k = 1:imageLayers 
        outputImage(:,:,k) = uint8(interp2(single(inputImage(:,:,k)), mapX, mapY, 'linear', 0)); 
    end     
end