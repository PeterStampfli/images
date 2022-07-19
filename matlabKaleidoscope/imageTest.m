A = imread("test1small.JPG");
size(A)
s = 1000;
mPix=s*s/1e6;
range=2;
map=createIdentityMap(mPix,-range,range,-range,range);
[xMin, xMax, yMin, yMax] = getRangeMap(map)
imshow(A);
