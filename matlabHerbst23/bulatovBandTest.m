
function bulatovBandTest()

% number of mega-pixels for image
mPix=4;

% symmetry parameters for hyperbolic tiling
k=7;
m=3;
period=getBulatovPeriod(k,m,2);

% y range always -1 to +1 for Bulatov band
h=1;
% x range contains given number of periods of bulatov band
nPeriods=4;
w=0.5*nPeriods*period;

% create corresponding map with bulatov band
map=identityMap(mPix,-w,w,-h,h);
basicBulatovBand(map,period);
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

% one period of metamorphosis, determine the corresponding wavevector
metaPeriod=xMax-xMin;
omega=2*pi/metaPeriod;

%metamorphosis
strength=0.7;


x=xMin;
for i=1:iMax
    factor=1+strength*x/xMax;
    %    map(:,i,1)=map(:,i,1)+strength*x;
    map(:,i,1)=map(:,i,1)*factor;
    map(:,i,2)=map(:,i,2)*factor;
%        map(j,i,1)=map(j,i,1)*(1+strength*cos(omega*x));
%        map(j,i,2)=map(j,i,2)*(1+strength*cos(omega*x));
    x=x+dx;
end

% create image
inputImage = imread("tier.jpg");
im = createOutputImage(map,inputImage);
imshow(im);
end
