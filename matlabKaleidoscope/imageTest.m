inputImage = imread("oster.JPG");

s = 4;
mPix=s*s/1e6;
range=1;
map=createIdentityMap(mPix,-range,range,-range,range);
basicKaleidoscope(map,5,4,2);

mapp=ones(4,4,2)

mapp(:,:,1)=map(:,:,1);
mapp(:,:,2)=map(:,:,2);

mapp

[a,b,c,d]=getRangeMap(mapp)
[a,b,c,d]=getRangeMap(map)



outputImage = createOutputImage(map,inputImage);

imshow(outputImage);
