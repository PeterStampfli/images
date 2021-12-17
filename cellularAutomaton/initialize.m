% initialize the cells and set weights for sum, transition table
% make greyscale

nStates=4;
% only different for interpolation
nColors=nStates;
imageFactor=(nColors-1)/(nStates-1);
center=[1,0];
weights=[1,1,1];

map = makeGreyscaleMap(nColors);
cells(:,:)=0;
makeCenter(cells,center);
table = sawtoothTable(nStates,weights);