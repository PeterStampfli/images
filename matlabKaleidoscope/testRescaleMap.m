pix=25;
mPix=pix/1000000;
map=createIdentityMap(mPix,-1.5,1.5,-1.5,1.5);

limit=0.9;
%rescaleMap(map,limit);
%blackoutMap(map,limit);
%inversionMap(map,limit);
map
