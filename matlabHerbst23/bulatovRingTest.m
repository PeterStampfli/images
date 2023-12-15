% creates map
% shows the time required for the kaleidoscopic map
% creates an image (takes a lot of time initially)

% first use compile.m to compile the files
% createIdentityMap.c, basicKaleidoscope.c and createStructureImage.c
% do
% >>compile;
% >>  map = testBasicKaleidoscope(5,4,2);

function bulatovRingTest()
% test of the basic kaleidoscope and bulatov band projection
% depending on symmetry paraameters k, n and m
% interpolation a in [0,1]
% shows pattern of inversions

s = 2000;
mPix=s*s/1e6;
h=1;
w=1;
map=identityMap(mPix,-w,w,-h,h);

k=5;
m=4;

period=getBulatovPeriod(k,m,2);
repeats=7;

bulatovRing(map,period,repeats);

%params map,k,m,n
map = basicKaleidoscope(map,k,m,2);

% set range of x- and y-values, for reuse in other cases
xMin=-w;
xMax=w;
yMin=-h;
yMax=h;

% get index ranges
[jMax,iMax,~]=size(map);

% increments for calculating the original coordinates
dx=(xMax-xMin)/(iMax-1);
dy=(yMax-yMin)/(jMax-1);

strength=0.7;


y=yMin;
for j=1:jMax
    x=xMin;
    for i=1:iMax
      %  angle=atan2(y,x)/pi;
      sinus=y/sqrt(x*x+y*y);
      factor=1+strength*sinus;
                map(j,i,1)=map(j,i,1)*factor;
        map(j,i,2)=map(j,i,2)*factor;

%        map(j,i,1)=map(j,i,1)*cos(0.5*pi*y)+strength*cos(omega*x);
%        map(j,i,2)=map(j,i,2)*cos(0.5*pi*y)+strength*sin(omega*x);
%        map(j,i,1)=map(j,i,1)*(1+strength*cos(omega*x));
%        map(j,i,2)=map(j,i,2)*(1+strength*cos(omega*x));
        x=x+dx;
    end
    y=y+dy;
end
%im=createStructureImage(outMap);

inputImage = imread("tier.jpg");

im = createOutputImage(map,inputImage);

imshow(im);
end
